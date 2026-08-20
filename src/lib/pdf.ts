/**
 * Lecture et rendu du PDF, côté navigateur uniquement.
 *
 * Le fichier n'est jamais envoyé nulle part : pdf.js travaille sur l'ArrayBuffer
 * en mémoire. C'est la promesse du site, il faut qu'elle reste vraie.
 *
 * Le document reste ouvert après l'extraction du texte : on en a besoin pour
 * dessiner les pages que le lecteur va parcourir, annotées.
 */
import * as pdfjs from 'pdfjs-dist';
import travailleur from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { lignesDePage, lignesPositionnees, type Fragment, type PageTexte } from './lignes';

pdfjs.GlobalWorkerOptions.workerSrc = travailleur;

export type { PageTexte };

export interface Document {
  pages: PageTexte[];
  /**
   * Dessine une page et renvoie une image utilisable dans un <img>, avec ses
   * dimensions en unités PDF — indispensable pour poser des repères dessus.
   */
  rendre: (numero: number, largeurCible?: number) => Promise<PageRendue | null>;
  /**
   * Ouvre le document de dessin sans rien dessiner. Sur un gros rapport, cette
   * ouverture prend plusieurs secondes ; la compter dans le délai imparti à la
   * première page la faisait échouer alors que le dessin, lui, va vite.
   */
  prechauffer: () => Promise<void>;
  /**
   * La photo du bien, si le rapport en porte une sur sa page de garde.
   * Renvoie l'image et ses proportions, ou `null`.
   */
  photoDuBien: () => Promise<Photo | null>;
  /**
   * Le schéma des déperditions de chaleur du DPE, découpé dans sa page.
   *
   * Cette page dit par où la chaleur s'en va, poste par poste, en pourcentages
   * — et **elle est en image**. Mesuré : trente et un volets DPE sur trente et
   * un la nomment, aucun ne porte le moindre « % » dans son texte, et la page
   * compte quatorze à quinze images bitmap. Aucune extraction de texte ne les
   * atteindra jamais.
   *
   * Plutôt que de recopier des chiffres qu'on ne peut pas lire, on montre le
   * schéma tel qu'il est. Le lecteur voit ses pourcentages ; le produit n'en
   * invente aucun.
   */
  schemaDeperditions: () => Promise<Photo | null>;
  fermer: () => Promise<void>;
}

export interface Photo {
  image: string;
  /** Dimensions de la photo découpée, en pixels — elles donnent son format. */
  largeur: number;
  hauteur: number;
}

/** Une matrice PDF : [a, b, c, d, e, f]. */
type Matrice = [number, number, number, number, number, number];

/** Le produit de deux matrices, dans l'ordre où le PDF les empile. */
function multiplier(m: Matrice, n: Matrice): Matrice {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5]
  ];
}

export interface PageRendue {
  image: string;
  /** Dimensions de la page en unités PDF, à l'échelle 1. */
  largeur: number;
  hauteur: number;
}

export async function ouvrirPdf(
  fichier: File,
  surProgression?: (fait: number, total: number) => void
): Promise<Document> {
  const donnees = new Uint8Array(await fichier.arrayBuffer());
  // pdf.js consomme le tableau passé à getDocument : on garde une copie pour
  // pouvoir rouvrir le document au moment du dessin.
  const copie = donnees.slice();
  const pdf = await pdfjs.getDocument({ data: donnees, useSystemFonts: true }).promise;

  /**
   * Le dessin se fait sur un second document, ouvert à la demande. Le premier a
   * servi à extraire le texte de toutes les pages : dans cet état, ses rendus
   * ne se terminent pas.
   */
  let pourDessin: pdfjs.PDFDocumentProxy | null = null;
  async function documentDeDessin(): Promise<pdfjs.PDFDocumentProxy> {
    pourDessin ??= await pdfjs.getDocument({ data: copie.slice(), useSystemFonts: true }).promise;
    return pourDessin;
  }

  const pages: PageTexte[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const contenu = await page.getTextContent();

    const items: Fragment[] = [];
    for (const item of contenu.items) {
      // Les items « marked content » n'ont pas de texte : on les écarte.
      if ('str' in item) {
        items.push({
          str: item.str,
          transform: item.transform,
          width: item.width,
          height: item.height
        });
      }
    }

    pages.push({ numero: n, lignes: lignesDePage(items), positions: lignesPositionnees(items) });
    surProgression?.(n, pdf.numPages);
    page.cleanup();
  }

  return {
    pages,

    async prechauffer() {
      await documentDeDessin();
    },

    /**
     * La photo du bien, cherchée sur la page de garde.
     *
     * Les rapports posent une photo de façade en tête, et c'est elle qui fait
     * reconnaître son logement d'un coup d'œil. Le piège est le logo du
     * diagnostiqueur, qui vit sur la même page : on les sépare par la taille.
     * Mesuré sur de vrais dossiers, l'écart ne laisse aucun doute — la photo
     * occupe la moitié de la largeur, les logos et les puces deux pour cent.
     *
     * On ne demande pas l'image à pdf.js : ses données ne sont décodées qu'au
     * moment du rendu, et les réclamer avant lève une erreur. On dessine donc
     * la page, puis on y découpe le rectangle de la photo — dont la matrice de
     * transformation donne la position et la taille exactes.
     *
     * Deux garde-fous en plus de la taille : un format d'image (ni bandeau ni
     * colonne), et rien au-delà des deux premières pages — plus loin, ce sont
     * les photos d'anomalies, qui ne montrent pas le bien.
     *
     * Le fichier ne bouge pas d'ici : tout se fait dans le navigateur.
     */
    async photoDuBien() {
      try {
        const doc = await documentDeDessin();

        for (let n = 1; n <= Math.min(2, doc.numPages); n++) {
          const page = await doc.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const ops = await page.getOperatorList();

          /** La plus grande image de la page, avec son rectangle en points PDF. */
          let cible: { x: number; y: number; largeur: number; hauteur: number } | null = null;

          /*
           * On rejoue la pile graphique du PDF.
           *
           * La première version prenait la dernière matrice `transform` posée
           * avant l'image. C'était faux, et c'est ce qui décadrait la photo :
           * un PDF empile ses transformations — `save`, plusieurs `transform`
           * successifs, `restore` — et la position réelle de l'image est le
           * produit de toute la pile, pas de sa dernière ligne. Selon la façon
           * dont le générateur du rapport emboîte ses groupes, on tombait à
           * côté, parfois de plusieurs centimètres.
           *
           * On tient donc la matrice courante comme le ferait le moteur de
           * rendu, et l'image occupe le carré unité transformé par elle.
           */
          let ctm: Matrice = [1, 0, 0, 1, 0, 0];
          const pile: Matrice[] = [];

          for (let i = 0; i < ops.fnArray.length; i++) {
            const op = ops.fnArray[i];

            if (op === pdfjs.OPS.save) {
              pile.push([...ctm] as Matrice);
              continue;
            }
            if (op === pdfjs.OPS.restore) {
              ctm = pile.pop() ?? [1, 0, 0, 1, 0, 0];
              continue;
            }
            if (op === pdfjs.OPS.transform) {
              ctm = multiplier(ctm, ops.argsArray[i] as Matrice);
              continue;
            }
            if (op !== pdfjs.OPS.paintImageXObject) continue;

            // Une image occupe le carré unité. Ses quatre coins transformés
            // donnent le rectangle qu'elle couvre réellement sur la page —
            // rotation et retournement compris.
            const [a, b, c, d, e, f] = ctm;
            const xs = [e, a + e, c + e, a + c + e];
            const ys = [f, b + f, d + f, b + d + f];
            const x = Math.min(...xs);
            const y = Math.min(...ys);
            const largeur = Math.max(...xs) - x;
            const hauteur = Math.max(...ys) - y;

            if (largeur < base.width * 0.25) continue; // logo, puce, filet
            const forme = hauteur > 0 ? largeur / hauteur : 0;
            if (forme < 0.5 || forme > 2.4) continue; // bandeau ou colonne
            if (!cible || largeur * hauteur > cible.largeur * cible.hauteur) {
              cible = { x, y, largeur, hauteur };
            }
          }

          if (!cible) continue;

          // On dessine la page à une échelle qui donne une photo nette sans
          // fabriquer une image de plusieurs mégaoctets.
          const echelle = Math.min(3, Math.max(1.4, 640 / cible.largeur));
          const viewport = page.getViewport({ scale: echelle });

          const feuille = document.createElement('canvas');
          feuille.width = Math.floor(viewport.width);
          feuille.height = Math.floor(viewport.height);
          feuille.style.cssText = 'position:fixed;left:-10000px;top:0;';
          document.body.append(feuille);

          try {
            const ctx = feuille.getContext('2d');
            if (!ctx) continue;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, feuille.width, feuille.height);
            await page.render({ canvasContext: ctx, viewport }).promise;

            /*
             * Du repère PDF à celui du canevas.
             *
             * On convertit les deux coins opposés et on reprend le rectangle
             * entre eux, au lieu de convertir un seul coin en supposant le sens
             * des axes : une page tournée à quatre-vingt-dix degrés — il y en a
             * dans les rapports, pour les tableaux en largeur — inverse ce sens
             * et donnait un découpage à côté de la photo.
             */
            const c1 = viewport.convertToViewportPoint(cible.x, cible.y);
            const c2 = viewport.convertToViewportPoint(
              cible.x + cible.largeur,
              cible.y + cible.hauteur
            );
            const gauche = Math.round(Math.min(c1[0] ?? 0, c2[0] ?? 0));
            const haut = Math.round(Math.min(c1[1] ?? 0, c2[1] ?? 0));
            const large = Math.round(Math.abs((c2[0] ?? 0) - (c1[0] ?? 0)));
            const haute = Math.round(Math.abs((c2[1] ?? 0) - (c1[1] ?? 0)));

            // Le rectangle doit tenir dans la page dessinée : une photo qui
            // déborderait donnerait une bande vide sur un bord.
            if (
              large < 40 ||
              haute < 40 ||
              gauche < -2 ||
              haut < -2 ||
              gauche + large > feuille.width + 2 ||
              haut + haute > feuille.height + 2
            ) {
              continue;
            }

            const decoupe = document.createElement('canvas');
            decoupe.width = large;
            decoupe.height = haute;
            const ctx2 = decoupe.getContext('2d');
            if (!ctx2) continue;

            ctx2.drawImage(feuille, gauche, haut, large, haute, 0, 0, large, haute);

            return { image: decoupe.toDataURL('image/jpeg', 0.82), largeur: large, hauteur: haute };
          } finally {
            feuille.remove();
            page.cleanup();
          }
        }

        return null;
      } catch {
        // Une photo manquante n'empêche pas de lire un dossier.
        return null;
      }
    },

    /**
     * Le schéma des déperditions du DPE, découpé dans sa page.
     *
     * La page dit par où la chaleur s'en va, poste par poste, en pourcentages —
     * et elle est en image. Mesuré : trente et un volets DPE sur trente et un
     * la nomment, aucun ne porte le moindre « % » dans son texte, et la page
     * compte quatorze à quinze images bitmap. Aucune extraction de texte ne les
     * atteindra.
     *
     * On montre donc le schéma tel qu'il est, plutôt que de recopier des
     * chiffres illisibles. Le lecteur voit ses pourcentages ; le produit n'en
     * invente aucun — et la fiche dit par ailleurs, en mots, quelles parois le
     * descriptif décrit non isolées.
     *
     * Le repère est le titre : le schéma est **sous** lui, en haut à gauche.
     * Mesuré sur sept pages, le rectangle est identique au point près — 237 sur
     * 210 points — parce que la maquette du DPE est réglementaire et ne varie
     * pas. Les bornes restent larges malgré tout : un jour un générateur
     * décalera cette maquette, et mieux vaut ne rien trouver que découper à
     * côté.
     */
    async schemaDeperditions() {
      try {
        const doc = await documentDeDessin();

        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          const contenu = await page.getTextContent();
          const items = contenu.items.filter((i) => 'str' in i) as {
            str: string;
            transform: number[];
          }[];
          const titre = items.find((i) => /Sch[ée]ma des d[ée]perditions/i.test(i.str));
          if (!titre) {
            page.cleanup();
            continue;
          }

          const base = page.getViewport({ scale: 1 });
          const yTitre = Number(titre.transform?.[5] ?? base.height);
          const ops = await page.getOperatorList();

          let ctm: Matrice = [1, 0, 0, 1, 0, 0];
          const pile: Matrice[] = [];
          let cible: { x: number; y: number; largeur: number; hauteur: number } | null = null;

          for (let i = 0; i < ops.fnArray.length; i++) {
            const op = ops.fnArray[i];
            if (op === pdfjs.OPS.save) {
              pile.push([...ctm] as Matrice);
              continue;
            }
            if (op === pdfjs.OPS.restore) {
              ctm = pile.pop() ?? [1, 0, 0, 1, 0, 0];
              continue;
            }
            if (op === pdfjs.OPS.transform) {
              ctm = multiplier(ctm, ops.argsArray[i] as Matrice);
              continue;
            }
            if (op !== pdfjs.OPS.paintImageXObject) continue;

            const [a, b, c, d, e, f] = ctm;
            const xs = [e, a + e, c + e, a + c + e];
            const ys = [f, b + f, d + f, b + d + f];
            const x = Math.min(...xs);
            const y = Math.min(...ys);
            const largeur = Math.max(...xs) - x;
            const hauteur = Math.max(...ys) - y;

            // Ni le fond de page, ni les pictogrammes du confort d'été.
            if (largeur < base.width * 0.18 || largeur > base.width * 0.75) continue;
            if (hauteur < base.height * 0.08) continue;
            const forme = hauteur > 0 ? largeur / hauteur : 0;
            if (forme < 0.55 || forme > 2.2) continue;
            // Sous le titre : au-dessus, c'est l'en-tête de la page.
            if (y + hauteur > yTitre + 6) continue;

            if (!cible || largeur * hauteur > cible.largeur * cible.hauteur) {
              cible = { x, y, largeur, hauteur };
            }
          }

          if (!cible) {
            page.cleanup();
            continue;
          }

          const echelle = Math.min(4, Math.max(2, 720 / cible.largeur));
          const viewport = page.getViewport({ scale: echelle });

          const feuille = document.createElement('canvas');
          feuille.width = Math.floor(viewport.width);
          feuille.height = Math.floor(viewport.height);
          feuille.style.cssText = 'position:fixed;left:-10000px;top:0;';
          document.body.append(feuille);

          try {
            const ctx = feuille.getContext('2d');
            if (!ctx) continue;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, feuille.width, feuille.height);
            await page.render({ canvasContext: ctx, viewport }).promise;

            const c1 = viewport.convertToViewportPoint(cible.x, cible.y);
            const c2 = viewport.convertToViewportPoint(
              cible.x + cible.largeur,
              cible.y + cible.hauteur
            );
            const gauche = Math.round(Math.min(c1[0] ?? 0, c2[0] ?? 0));
            const haut = Math.round(Math.min(c1[1] ?? 0, c2[1] ?? 0));
            const large = Math.round(Math.abs((c2[0] ?? 0) - (c1[0] ?? 0)));
            const haute = Math.round(Math.abs((c2[1] ?? 0) - (c1[1] ?? 0)));

            if (
              large < 60 ||
              haute < 60 ||
              gauche < -2 ||
              haut < -2 ||
              gauche + large > feuille.width + 2 ||
              haut + haute > feuille.height + 2
            ) {
              continue;
            }

            const decoupe = document.createElement('canvas');
            decoupe.width = large;
            decoupe.height = haute;
            const ctx2 = decoupe.getContext('2d');
            if (!ctx2) continue;
            ctx2.drawImage(feuille, gauche, haut, large, haute, 0, 0, large, haute);

            // Le PNG plutôt que le JPEG : ce sont des traits fins et des
            // chiffres, que la compression JPEG rend flous.
            return { image: decoupe.toDataURL('image/png'), largeur: large, hauteur: haute };
          } finally {
            feuille.remove();
            page.cleanup();
          }
        }

        return null;
      } catch {
        // Un schéma manquant n'empêche pas de lire un dossier.
        return null;
      }
    },

    async rendre(numero, largeurCible = 900) {
      if (numero < 1 || numero > pdf.numPages) return null;

      const doc = await documentDeDessin();
      const page = await doc.getPage(numero);
      const base = page.getViewport({ scale: 1 });
      // On plafonne l'échelle : au-delà, l'image pèse lourd sans rien apporter.
      const echelle = Math.min(largeurCible / base.width, 2.5);
      const viewport = page.getViewport({ scale: echelle });

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      // Le canevas doit vivre dans le document : détaché, le rendu de certaines
      // pages ne se termine jamais. On le place hors écran, puis on le retire.
      canvas.style.cssText = 'position:fixed;left:-10000px;top:0;';
      document.body.append(canvas);

      try {
        const contexte = canvas.getContext('2d');
        if (!contexte) return null;

        // Fond blanc : sans lui, les zones non peintes du PDF sortent en noir.
        contexte.fillStyle = '#ffffff';
        contexte.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: contexte, viewport }).promise;
        const image = canvas.toDataURL('image/jpeg', 0.82);
        return { image, largeur: base.width, hauteur: base.height };
      } finally {
        canvas.remove();
        page.cleanup();
      }
    },

    async fermer() {
      await pdf.destroy();
      if (pourDessin) await pourDessin.destroy();
    }
  };
}
