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
     * Mesuré sur de vrais dossiers, l'écart ne laisse pas de doute — la photo
     * occupe la moitié de la largeur, les logos et puces deux pour cent.
     *
     * Deux garde-fous en plus de la taille : un format d'image (ni un bandeau,
     * ni une colonne), et rien au-delà des deux premières pages — plus loin,
     * ce sont les photos d'anomalies, qui ne représentent pas le bien.
     *
     * Le fichier ne bouge pas d'ici : tout se fait dans le navigateur.
     */
    async photoDuBien() {
      try {
        const doc = await documentDeDessin();

        for (let n = 1; n <= Math.min(2, doc.numPages); n++) {
          const page = await doc.getPage(n);
          const largeurPage = page.getViewport({ scale: 1 }).width;
          const ops = await page.getOperatorList();

          let meilleure: { nom: string; largeur: number } | null = null;

          for (let i = 0; i < ops.fnArray.length; i++) {
            const fn = ops.fnArray[i];
            if (fn !== pdfjs.OPS.paintImageXObject) continue;

            const nom = ops.argsArray[i]?.[0];
            if (typeof nom !== 'string') continue;

            // La transformation qui précède le tracé donne la taille à l'écran.
            let largeur = 0;
            let hauteur = 0;
            for (let j = i - 1; j >= 0 && j > i - 12; j--) {
              if (ops.fnArray[j] === pdfjs.OPS.transform) {
                const [a, , , d] = ops.argsArray[j] as number[];
                largeur = Math.abs(a ?? 0);
                hauteur = Math.abs(d ?? 0);
                break;
              }
            }

            if (largeur < largeurPage * 0.25) continue; // logo, puce, filet
            const forme = hauteur > 0 ? largeur / hauteur : 0;
            if (forme < 0.6 || forme > 2.2) continue; // bandeau ou colonne
            if (!meilleure || largeur > meilleure.largeur) meilleure = { nom, largeur };
          }

          if (!meilleure) continue;

          const image = await new Promise<{
            width: number;
            height: number;
            kind?: number;
            data?: Uint8ClampedArray;
          } | null>((pret) => {
            try {
              page.objs.get(meilleure.nom, pret as never);
            } catch {
              pret(null);
            }
          });
          if (!image?.data) continue;

          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          // pdf.js livre du RGB, du RGBA ou du gris selon le PDF : on ramène
          // tout en RGBA, seul format qu'accepte un canevas.
          const rgba = new Uint8ClampedArray(image.width * image.height * 4);
          const src = image.data;
          for (let p = 0; p < image.width * image.height; p++) {
            const o = p * 4;
            if (image.kind === 3) {
              rgba[o] = src[p * 4] ?? 0;
              rgba[o + 1] = src[p * 4 + 1] ?? 0;
              rgba[o + 2] = src[p * 4 + 2] ?? 0;
              rgba[o + 3] = src[p * 4 + 3] ?? 255;
            } else if (image.kind === 2) {
              rgba[o] = src[p * 3] ?? 0;
              rgba[o + 1] = src[p * 3 + 1] ?? 0;
              rgba[o + 2] = src[p * 3 + 2] ?? 0;
              rgba[o + 3] = 255;
            } else {
              const g = src[p] ?? 0;
              rgba[o] = rgba[o + 1] = rgba[o + 2] = g;
              rgba[o + 3] = 255;
            }
          }

          ctx.putImageData(new ImageData(rgba, image.width, image.height), 0, 0);
          return canvas.toDataURL('image/jpeg', 0.78);
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
