/**
 * Les formulations réelles d'un champ, dans le corpus — LOCAL UNIQUEMENT.
 *
 * On écrit une expression régulière en imaginant comment un rapport formule
 * une donnée. Le corpus, lui, sait comment il la formule vraiment. Cet outil
 * cherche un motif dans de vrais dossiers et rend la **forme** des lignes qui
 * l'entourent : les lettres sont conservées, les chiffres masqués.
 *
 * ⚠️ Seules sont affichées les formes vues dans plusieurs dossiers distincts —
 * ce qui écarte mécaniquement ce qui appartient à un dossier en particulier.
 * Et les chiffres, donc les surfaces, montants et numéros, ne sortent jamais.
 *
 *   npx vite-node scripts/formes.ts -- "<dossier>" "<motif>" [nombre] [seuil]
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { lignesDePage, type Fragment } from '../src/lib/lignes';

const [, , racineArg, motifArg, combienArg, seuilArg] = process.argv;
const racine = racineArg ?? '.';
const motif = new RegExp(motifArg ?? 'type de bien', 'i');
const combien = combienArg ? Number(combienArg) : 30;
const seuil = seuilArg ? Number(seuilArg) : 3;

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

/** La forme d'une ligne : ses mots, sans ses valeurs. */
function forme(ligne: string): string {
  return ligne
    .replace(/\s+/g, ' ')
    .replace(/\d/g, '#')
    .replace(/#[#\s.,]*#/g, '#')
    .trim()
    .slice(0, 90);
}

async function main(): Promise<void> {
  const fichiers: string[] = [];
  await trouver(racine, fichiers, combien);

  /** forme → dossiers où on l'a vue, et page relative où elle se trouve. */
  const vues = new Map<string, { dossiers: Set<number>; pages: number[] }>();

  for (const [i, chemin] of fichiers.entries()) {
    try {
      const data = new Uint8Array(await readFile(chemin));
      const pdf = await getDocument({ data, useSystemFonts: true, verbosity: 0 }).promise;

      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const contenu = await page.getTextContent();
        const items: Fragment[] = [];
        for (const item of contenu.items) {
          if ('str' in item) {
            items.push({
              str: item.str,
              transform: item.transform,
              width: item.width,
              height: item.height
            });
          }
        }

        for (const ligne of lignesDePage(items)) {
          if (!motif.test(ligne)) continue;
          const f = forme(ligne);
          if (f.length < 8) continue;
          if (!vues.has(f)) vues.set(f, { dossiers: new Set(), pages: [] });
          const e = vues.get(f)!;
          e.dossiers.add(i);
          e.pages.push(n);
        }
        page.cleanup();
      }
      await pdf.destroy();
    } catch {
      /* rien à tirer d'un dossier illisible */
    }
  }

  const partagees = [...vues.entries()]
    .map(([f, e]) => ({
      forme: f,
      n: e.dossiers.size,
      pageMediane: e.pages.sort((a, b) => a - b)[Math.floor(e.pages.length / 2)] ?? 0
    }))
    .filter((f) => f.n >= seuil)
    .sort((a, b) => b.n - a.n);

  console.log(`# « ${motif.source} » dans ${fichiers.length} dossiers (seuil ${seuil})\n`);
  console.log('| dossiers | page | forme de la ligne |');
  console.log('|---|---|---|');
  for (const { forme: f, n, pageMediane } of partagees.slice(0, 50)) {
    console.log(`| ${n} | ~${pageMediane} | ${f.replace(/\|/g, '/')} |`);
  }
}

await main();
