/**
 * Épreuve de vérité : on rejoue le moteur sur de vrais rapports.
 *
 * Les PDF ne sont pas dans le dépôt (ils contiennent des données personnelles) :
 * le test se contente de sauter si le dossier n'existe pas. Pointez-le vers vos
 * propres rapports avec la variable d'environnement CMD_PDF_DIR.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { lignesDePage, type PageTexte } from '../lignes';
import { analyser } from './index';

const DOSSIER = process.env.CMD_PDF_DIR ?? '';
const disponible = DOSSIER.length > 0 && existsSync(DOSSIER);

async function pagesDe(chemin: string): Promise<PageTexte[]> {
  const donnees = new Uint8Array(readFileSync(chemin));
  const pdf = await getDocument({ data: donnees, useSystemFonts: true }).promise;
  const pages: PageTexte[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const contenu = await page.getTextContent();
    pages.push({ numero: n, lignes: lignesDePage(contenu.items.filter((i: unknown) => typeof i === 'object' && i !== null && 'str' in i) as never) });
  }
  await pdf.destroy();
  return pages;
}

describe.skipIf(!disponible)('rapports réels', () => {
  // On ne garde que les vrais rapports : le dossier de travail contient aussi
  // des documentations ADEME, des supports de formation, etc. L'échantillon
  // mélange les deux familles de mise en page : les audits énergétiques et les
  // dossiers techniques (qui, eux, ont une page de synthèse).
  const tous = disponible
    ? readdirSync(DOSSIER).filter((f: string) => f.toLowerCase().endsWith('.pdf') && /IMO|DDT/i.test(f))
    : [];
  const fichiers = [
    ...tous.filter((f: string) => !/^MAJ/i.test(f)).slice(0, 6),
    ...tous.filter((f: string) => /^MAJ/i.test(f)).slice(0, 6)
  ];

  it('trouve au moins un diagnostic dans la majorité des rapports', async () => {
    let avecDiag = 0;
    const details: string[] = [];

    for (const fichier of fichiers) {
      const analyse = analyser(await pagesDe(join(DOSSIER, fichier)));
      if (analyse.diagnostics.length > 0) avecDiag++;
      details.push(
        `${fichier.slice(0, 24)}… → ${
          analyse.diagnostics
            .map((d) => {
              const detail =
                d.schema?.genre === 'dpe'
                  ? `[${d.schema.finale ?? '?'} | ${d.schema.energie?.valeur ?? '?'} kWh | ${d.schema.climat?.valeur ?? '?'} CO2]`
                  : '';
              return `${d.type}:${d.gravite}${detail}`;
            })
            .join(', ') || 'aucun'
        }`
      );
    }

    console.log(details.join('\n'));
    expect(avecDiag).toBeGreaterThanOrEqual(Math.ceil(fichiers.length * 0.7));
  }, 120_000);
});
