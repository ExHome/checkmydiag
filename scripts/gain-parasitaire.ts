/**
 * Combien d'états termites annoncent désormais leurs autres volets — LOCAL.
 *
 * Le tableau de bord ne le montre pas : un rapport qui gagne la mention de la
 * mérule reste « reconnu avec verdict », comme avant. Le gain se mesure ici.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs.
 *
 *   npx vite-node scripts/gain-parasitaire.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { analyser } from '../src/lib/analyse/index';
import { lignesDePage } from '../src/lib/lignes';
import type { PageTexte } from '../src/lib/modele';

const [, , racineArg, combienArg] = process.argv;
const racine = racineArg ?? '.';
const combien = combienArg ? Number(combienArg) : 40;
const INTERESSANT = /^(DDT|RAPPORT|DPE|CREP|ERP|DAPP)[-_ ]/i;

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
  avecEtatTermites: 0,
  titreEtatParasitaire: 0,
  annoncentDesVolets: 0,
  parVolet: { 'Insectes du bois (xylophages)': 0, 'Mérule et champignons du bois': 0, 'Constatations diverses': 0 } as Record<string, number>
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

    const d = analyser(pages).diagnostics.find((x) => x.type === 'termites');
    if (d) {
      compte.avecEtatTermites++;
      if (d.titre === 'État parasitaire') compte.titreEtatParasitaire++;
      const fait = d.faits.find((f) => f.libelle === 'Autres volets du rapport');
      if (fait) {
        compte.annoncentDesVolets++;
        for (const nom of (fait.precision ?? '').split(' · ')) {
          if (nom in compte.parVolet) compte.parVolet[nom]++;
        }
      }
    }
  } catch {
    // illisible
  }

  compte.fichiers++;
  await doc.destroy();
}

console.log(JSON.stringify(compte, null, 2));
