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
