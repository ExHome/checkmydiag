/**
 * Banc de calibration — à lancer à la main, jamais en CI.
 *
 *   npx vitest run calibration
 *
 * Échantillonne de vrais rapports de chaque famille et imprime ce que le moteur
 * en tire. Sert à repérer les verdicts absurdes (« aucun » partout, « bon »
 * partout) que douze fichiers ne montreraient pas.
 *
 * Les rapports ne sont pas dans le dépôt : ils contiennent des données
 * personnelles. Rien n'est copié, rien n'est écrit — seulement lu.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { lignesDePage, type PageTexte } from '../lignes';
import { analyser } from './index';
import type { TypeDiag } from '../modele';

const RACINE = process.env.CMD_CALIB_DIR ?? '';
const disponible = RACINE.length > 0 && existsSync(RACINE);

/** Familles de rapports à couvrir, avec le nombre de fichiers échantillonnés. */
const FAMILLES: { nom: string; motif: RegExp; combien: number }[] = [
  { nom: 'dossier complet', motif: /^DDT_.*\.pdf$/i, combien: 8 },
  { nom: 'électricité', motif: /ELEC.*\.pdf$/i, combien: 4 },
  { nom: 'gaz', motif: /GAZ.*\.pdf$/i, combien: 4 },
  { nom: 'amiante', motif: /amiante.*\.pdf$/i, combien: 4 },
  { nom: 'plomb', motif: /CREP.*\.pdf$/i, combien: 3 },
  { nom: 'carrez', motif: /CARREZ.*\.pdf$/i, combien: 3 },
  { nom: 'assainissement', motif: /ASSAIN.*\.pdf$/i, combien: 3 }
];

function fichiers(): string[] {
  return readdirSync(RACINE, { recursive: true, encoding: 'utf8' })
    .filter((f: string) => f.toLowerCase().endsWith('.pdf') && !/_en_attente/i.test(f))
    .map((f: string) => join(RACINE, f));
}

async function pagesDe(chemin: string): Promise<PageTexte[]> {
  const donnees = new Uint8Array(readFileSync(chemin));
  const pdf = await getDocument({ data: donnees, useSystemFonts: true }).promise;
  const pages: PageTexte[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const contenu = await page.getTextContent();
    const items: { str: string; transform: number[] }[] = [];
    for (const item of contenu.items) {
      if ('str' in item) items.push({ str: item.str, transform: item.transform });
    }
    pages.push({ numero: n, lignes: lignesDePage(items) });
  }
  await pdf.destroy();
  return pages;
}

describe.skipIf(!disponible)('calibration sur rapports réels', () => {
  it('produit un verdict exploitable pour chaque famille', async () => {
    const tous = fichiers();
    const compte = new Map<string, number>();
    const muets: string[] = [];
    let analyses = 0;

    for (const famille of FAMILLES) {
      const echantillon = tous.filter((f) => famille.motif.test(f.split('\\').pop() ?? '')).slice(0, famille.combien);
      console.log(`\n--- ${famille.nom} (${echantillon.length} fichiers) ---`);

      for (const fichier of echantillon) {
        const analyse = await analyser(await pagesDe(fichier));
        analyses++;

        const resume = analyse.diagnostics
          .map((d) => `${d.type}:${d.gravite}${d.source === 'synthese' ? '*' : ''}`)
          .join(' ');
        console.log(`  ${(fichier.split('\\').pop() ?? '').slice(0, 42).padEnd(44)} ${resume || '(rien)'}`);

        // Une alerte est le verdict le plus lourd du site : on relit chacune.
        for (const d of analyse.diagnostics.filter((x) => x.gravite === 'alerte')) {
          console.log(`      ⚠ ${d.type} : ${d.verdict.slice(0, 150)}`);
        }

        if (analyse.diagnostics.length === 0) muets.push(fichier);
        for (const d of analyse.diagnostics) {
          const cle: `${TypeDiag}:${string}` = `${d.type}:${d.gravite}`;
          compte.set(cle, (compte.get(cle) ?? 0) + 1);
        }
      }
    }

    console.log('\n--- récapitulatif ---');
    for (const [cle, n] of [...compte.entries()].sort()) console.log(`  ${cle.padEnd(26)} ${n}`);
    console.log(`  rapports sans aucun diagnostic : ${muets.length} / ${analyses}`);

    // Un moteur qui ne reconnaît rien sur la moitié des rapports est cassé.
    expect(muets.length).toBeLessThan(analyses / 2);
  }, 600_000);
});
