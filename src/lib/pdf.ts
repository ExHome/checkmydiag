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
   * Renvoie une image utilisable dans un `<img>`, ou `null`.
   */
  photoDuBien: () => Promise<string | null>;
  fermer: () => Promise<void>;
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

          for (let i = 0; i < ops.fnArray.length; i++) {
            if (ops.fnArray[i] !== pdfjs.OPS.paintImageXObject) continue;

            for (let j = i - 1; j >= 0 && j > i - 12; j--) {
              if (ops.fnArray[j] !== pdfjs.OPS.transform) continue;

              const [a, , , d, e, f] = ops.argsArray[j] as number[];
              const largeur = Math.abs(a ?? 0);
              const hauteur = Math.abs(d ?? 0);

              if (largeur < base.width * 0.25) break; // logo, puce, filet
              const forme = hauteur > 0 ? largeur / hauteur : 0;
              if (forme < 0.6 || forme > 2.2) break; // bandeau ou colonne
              if (!cible || largeur > cible.largeur) {
                // Le coin de l'image est en bas à gauche dans le repère PDF ;
                // une hauteur négative signifie qu'elle est posée vers le haut.
                cible = {
                  x: e ?? 0,
                  y: (d ?? 0) < 0 ? (f ?? 0) - hauteur : (f ?? 0),
                  largeur,
                  hauteur
                };
              }
              break;
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

            // Du repère PDF à celui du canevas : l'axe vertical s'inverse.
            const hautGauche = viewport.convertToViewportPoint(cible.x, cible.y + cible.hauteur);
            const decoupe = document.createElement('canvas');
            decoupe.width = Math.round(cible.largeur * echelle);
            decoupe.height = Math.round(cible.hauteur * echelle);
            const ctx2 = decoupe.getContext('2d');
            if (!ctx2) continue;

            ctx2.drawImage(
              feuille,
              Math.round(hautGauche[0] ?? 0),
              Math.round(hautGauche[1] ?? 0),
              decoupe.width,
              decoupe.height,
              0,
              0,
              decoupe.width,
              decoupe.height
            );

            return decoupe.toDataURL('image/jpeg', 0.78);
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
