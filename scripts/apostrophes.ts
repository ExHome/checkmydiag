/**
 * Une seule question, mesurée sur le corpus réel — LOCAL UNIQUEMENT.
 *
 * Les motifs qui détectent les listes A/B/C de l'amiante lisent la ligne brute,
 * sans passer par la normalisation : ils attendent donc l'apostrophe droite.
 * Si les rapports emploient l'apostrophe typographique, ces motifs ne trouvent
 * rien — et la conclusion de l'amiante passe à la trappe sur tout le corpus.
 *
 * ⚠️ Ces rapports contiennent le nom et l'adresse de vraies personnes. Ce
 * script ne recopie AUCUN contenu : il ne sort que des compteurs.
 *
 *   npx vite-node scripts/apostrophes.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

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
  avecLigneListe: 0,
  ligneListeApostropheDroite: 0,
  ligneListeApostropheTypographique: 0,
  detecteParLeMotifActuel: 0
};

const fichiers: string[] = [];
await trouver(racine, fichiers, combien);

for (const chemin of fichiers) {
  try {
    const doc = await getDocument({ url: chemin, useSystemFonts: true }).promise;
    let vuListe = false;
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const contenu = await page.getTextContent();
      const texte = contenu.items
        .map((i) => ('str' in i ? i.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ');

      for (const bout of texte.split(/(?=Liste\s*[ABC]\s*:)/i)) {
        if (!/^Liste\s*[ABC]\s*:/i.test(bout)) continue;
        const ligne = bout.slice(0, 200);
        vuListe = true;
        if (/’/.test(ligne)) compte.ligneListeApostropheTypographique++;
        if (/'/.test(ligne)) compte.ligneListeApostropheDroite++;
        if (
          /n'?a\s*pas\s*[ée]t[ée]\s*rep[ée]r[ée]/i.test(ligne) ||
          /il\s*a\s*[ée]t[ée]\s*rep[ée]r[ée]/i.test(ligne)
        ) {
          compte.detecteParLeMotifActuel++;
        }
      }
    }
    compte.fichiers++;
    if (vuListe) compte.avecLigneListe++;
    await doc.destroy();
  } catch {
    // un rapport illisible ne fausse pas la mesure : il n'y entre pas
  }
}

console.log(JSON.stringify(compte, null, 2));
