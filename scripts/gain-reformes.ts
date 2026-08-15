/**
 * Combien de dossiers apprennent qu'une réforme les concerne — LOCAL.
 *
 * Le tableau de bord ne le montre pas : un DPE qui gagne l'information « votre
 * étiquette peut être rééditée gratuitement » reste compté pareil. Le gain se
 * mesure ici.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs.
 *
 *   npx vite-node scripts/gain-reformes.ts -- "<dossier>" [nombre]
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
const INTERESSANT = /^(DDT|RAPPORT|DPE|CREP|ERP|DAPP|AMIANTE)[-_ ]/i;

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
  dpeReconnus: 0,
  avecDate: 0,
  avecAuMoinsUneReforme: 0,
  attestationPetiteSurface: 0,
  facteurElectricite: 0,
  avecLienAdeme: 0
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

    const d = analyser(pages).diagnostics.find((x) => x.type === 'dpe');
    if (d) {
      compte.dpeReconnus++;
      if (d.faits.some((f) => f.libelle === 'Établi le')) compte.avecDate++;

      const fait = d.faits.find((f) => f.libelle === 'Réformes depuis ce diagnostic');
      if (fait) {
        compte.avecAuMoinsUneReforme++;
        if (/petites surfaces/i.test(fait.precision ?? '')) compte.attestationPetiteSurface++;
        if (/électricité/i.test(fait.precision ?? '')) compte.facteurElectricite++;
      }

      if (d.explication.join(' ').includes('observatoire-dpe-audit.ademe.fr')) {
        compte.avecLienAdeme++;
      }
    }
  } catch {
    // illisible
  }

  compte.fichiers++;
  await doc.destroy();
}

console.log(JSON.stringify(compte, null, 2));
