/**
 * Quelle apostrophe les rapports emploient-ils — LOCAL UNIQUEMENT.
 *
 * Un test vient de révéler que la boucle qui lit les conclusions par liste
 * d'amiante teste la ligne BRUTE : `ligne.match(/n'?a pas été repéré/)`. Ce
 * motif reconnaît l'apostrophe droite ('), pas la typographique (’). Or
 * `trouver()` et `trouverToutes()` ne normalisent pas non plus.
 *
 * Si les rapports écrivent « n’a pas », des dizaines de motifs du moteur
 * échouent en silence — et un échec silencieux sur une conclusion d'absence est
 * exactement le genre de trou qui ne se voit jamais.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs.
 *
 *   npx vite-node scripts/apostrophes.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

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
  dossiersAvecApostropheDroite: 0,
  dossiersAvecApostropheTypographique: 0,
  dossiersAvecLesDeux: 0,
  // Le cas qui décide : la conclusion d'absence, telle que le moteur la cherche
  absenceEcriteAvecDroite: 0,
  absenceEcriteAvecTypographique: 0
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

  let droite = false;
  let typo = false;
  let absDroite = false;
  let absTypo = false;

  try {
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const contenu = await page.getTextContent();
      const brut = contenu.items.map((i) => ('str' in i ? i.str : '')).join(' ');

      if (brut.includes("'")) droite = true;
      if (brut.includes('’')) typo = true;

      // « il n'a pas été repéré » / « n'ayant pu être visitées », les deux formes
      if (/n'a pas [ée]t[ée] rep[ée]r[ée]|n'ayant pu/i.test(brut)) absDroite = true;
      if (/n’a pas [ée]t[ée] rep[ée]r[ée]|n’ayant pu/i.test(brut)) absTypo = true;
    }
  } catch {
    // illisible
  }

  compte.fichiers++;
  if (droite) compte.dossiersAvecApostropheDroite++;
  if (typo) compte.dossiersAvecApostropheTypographique++;
  if (droite && typo) compte.dossiersAvecLesDeux++;
  if (absDroite) compte.absenceEcriteAvecDroite++;
  if (absTypo) compte.absenceEcriteAvecTypographique++;

  await doc.destroy();
}

console.log(JSON.stringify(compte, null, 2));
