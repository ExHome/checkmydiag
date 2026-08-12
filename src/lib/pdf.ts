/**
 * Lecture du PDF, côté navigateur uniquement.
 *
 * Le fichier n'est jamais envoyé nulle part : pdf.js travaille sur l'ArrayBuffer
 * en mémoire. C'est la promesse du site, il faut qu'elle reste vraie.
 */
import * as pdfjs from 'pdfjs-dist';
import travailleur from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { lignesDePage, type Fragment, type PageTexte } from './lignes';

pdfjs.GlobalWorkerOptions.workerSrc = travailleur;

export type { PageTexte };

export async function lirePdf(
  fichier: File,
  surProgression?: (fait: number, total: number) => void
): Promise<PageTexte[]> {
  const donnees = new Uint8Array(await fichier.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: donnees, useSystemFonts: true }).promise;

  const pages: PageTexte[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const contenu = await page.getTextContent();
    const items: Fragment[] = [];
    for (const item of contenu.items) {
      // Les items « marked content » n'ont pas de texte : on les écarte.
      if ('str' in item) items.push({ str: item.str, transform: item.transform });
    }
    pages.push({ numero: n, lignes: lignesDePage(items) });
    surProgression?.(n, pdf.numPages);
    page.cleanup();
  }

  await pdf.destroy();
  return pages;
}
