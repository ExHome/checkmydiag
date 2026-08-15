/**
 * Combien de dossiers gagnent un plan amiante — LOCAL UNIQUEMENT.
 *
 * Avant / après l'élargissement de la détection des listes. C'est la seule
 * preuve qui vaut : un extracteur qui passe les tests mais ne trouve rien sur
 * les vrais rapports n'a rien amélioré.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs.
 *
 *   npx vite-node scripts/gain-amiante.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { analyser } from '../src/lib/analyse/index';
import { zonesDe } from '../src/lib/analyse/plan';
import { lignesDePage } from '../src/lib/lignes';
import type { PageTexte } from '../src/lib/modele';

const [, , racineArg, combienArg] = process.argv;
const racine = racineArg ?? '.';
const combien = combienArg ? Number(combienArg) : 40;
const INTERESSANT = /^(DDT|RAPPORT|DAPP|AMIANTE)[-_ ]/i;

async function trouver(dossier: string, sortie: string[], plafond: number): Promise<void> {
  if (sortie.length >= plafond) return;
  let entrees: string[];
  try {
    entrees = await readdir(dossier);
  } catch {
    return;
  }
  for (const nom of entrees) {
    if (sortie.length >= plafond) return;
    const chemin = join(dossier, nom);
    let info;
    try {
      info = await stat(chemin);
    } catch {
      continue;
    }
    if (info.isDirectory()) await trouver(chemin, sortie, plafond);
    else if (nom.toLowerCase().endsWith('.pdf') && INTERESSANT.test(nom)) sortie.push(chemin);
  }
}

const compte = {
  fichiers: 0,
  avecDiagnosticAmiante: 0,
  avecPlanAmiante: 0,
  zonesTotales: 0,
  parEtat: { bon: 0, attention: 0, neutre: 0, alerte: 0 } as Record<string, number>
};

const chemins: string[] = [];
await trouver(racine, chemins, combien);

for (const chemin of chemins) {
  let doc;
  try {
    doc = await getDocument({ url: chemin, useSystemFonts: true }).promise;
  } catch {
    continue;
  }

  try {
    const pages: PageTexte[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const contenu = await page.getTextContent();
      const items = contenu.items.filter((i) => 'str' in i && 'transform' in i);
      pages.push({ numero: p, lignes: lignesDePage(items as never) });
    }

    const resultat = analyser(pages);
    const amiante = resultat.diagnostics.find((d) => d.type === 'amiante');
    if (amiante) {
      compte.avecDiagnosticAmiante++;
      const zones = zonesDe(amiante);
      if (zones.length) {
        compte.avecPlanAmiante++;
        compte.zonesTotales += zones.length;
        for (const z of zones) compte.parEtat[z.etat] = (compte.parEtat[z.etat] ?? 0) + 1;
      }
    }
  } catch {
    // illisible : n'entre pas dans la mesure
  }

  compte.fichiers++;
  await doc.destroy();
}

console.log(JSON.stringify(compte, null, 2));
