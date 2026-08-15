/**
 * Les sections termites que le découpage fabrique — LOCAL UNIQUEMENT.
 *
 * Treize dossiers sur vingt et un affichent « conclusion non lue ». Deux
 * explications possibles, et elles appellent des corrections opposées :
 *
 *   — soit le rapport est là et la conclusion est écrite autrement : il faut
 *     élargir la lecture ;
 *   — soit il n'y a pas de rapport termites du tout, et le découpage fabrique
 *     une section à partir d'un en-tête commercial : il faut la supprimer.
 *
 * Dans le second cas, le produit affiche un diagnostic fantôme — bien pire
 * qu'un trou. Ce script tranche : il compte les pages classées termites par
 * dossier, et regarde si l'une d'elles porte une conclusion.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs.
 *
 *   npx vite-node scripts/termites-sections.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { decouper } from '../src/lib/analyse/decoupe';
import { lignesDePage } from '../src/lib/lignes';
import { normalise } from '../src/lib/analyse/texte';
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

/** Ce qui prouve qu'un vrai rapport termites est là. */
const CONCLUSION =
  /(?:il n'a pas ete repere|absence)[^.]*indice[^.]*infestation[^.]*termites?|(?:il a ete repere|presence)[^.]*(?:indice|infestation)[^.]*termites?|absence[\s\S]{0,40}termites?/;
/** Ce qu'un vrai rapport termites contient toujours, en plus de son titre. */
const CORPS = /(?:parties? (?:visitees?|non visitees?)|ouvrage|charpente|arrete prefectoral|mairie)/;

const parNbPages = new Map<number, number>();
let fichiers = 0;
let avecSectionTermites = 0;
let sectionAvecConclusion = 0;
let sectionSansConclusion = 0;
let sectionSansCorps = 0;
let sectionUnePageSeule = 0;

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

    const { sections } = decouper(pages);
    const termites = sections.find((s) => s.type === 'termites');

    if (termites) {
      avecSectionTermites++;
      const nb = termites.plage[1] - termites.plage[0] + 1;
      parNbPages.set(nb, (parNbPages.get(nb) ?? 0) + 1);
      if (nb === 1) sectionUnePageSeule++;

      const texte = normalise(termites.lignes.join(' '));
      if (CONCLUSION.test(texte)) sectionAvecConclusion++;
      else sectionSansConclusion++;
      if (!CORPS.test(texte)) sectionSansCorps++;
    }
  } catch {
    // illisible
  }

  fichiers++;
  await doc.destroy();
}

console.log(
  JSON.stringify(
    {
      fichiers,
      avecSectionTermites,
      sectionAvecConclusion,
      sectionSansConclusion,
      sectionSansCorpsDeRapport: sectionSansCorps,
      sectionDUneSeulePage: sectionUnePageSeule,
      taillesDeSection: [...parNbPages].sort((a, b) => a[0] - b[0]).map(([p, n]) => `${n} dossiers × ${p} page(s)`)
    },
    null,
    2
  )
);
