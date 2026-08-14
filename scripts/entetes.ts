/**
 * Les en-têtes réels du corpus — LOCAL UNIQUEMENT.
 *
 * Le découpage d'un dossier repose sur le titre que chaque rapport répète en
 * tête de page. Ces titres, on les avait devinés sur trois dossiers. Cet outil
 * va les chercher dans le corpus : il relève les premières lignes de chaque
 * page, les compacte comme le fait le découpage, et compte.
 *
 * ⚠️ Ne sont affichées que les formes vues dans **plusieurs dossiers
 * différents**. Une adresse, un nom de propriétaire, un numéro de dossier
 * n'apparaissent que dans le leur : le seuil les élimine mécaniquement.
 *
 *   npx vite-node scripts/entetes.ts -- "<dossier>" [nombre] [seuil]
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { compact } from '../src/lib/analyse/texte';

const [, , racineArg, combienArg, seuilArg] = process.argv;
const racine = racineArg ?? '.';
const combien = combienArg ? Number(combienArg) : 40;
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

/** Combien de dossiers distincts ont montré cette forme. */
const vues = new Map<string, Set<number>>();

async function main(): Promise<void> {
  const fichiers: string[] = [];
  await trouver(racine, fichiers, combien);

  for (const [i, chemin] of fichiers.entries()) {
    try {
      const data = new Uint8Array(await readFile(chemin));
      const pdf = await getDocument({ data, useSystemFonts: true, verbosity: 0 }).promise;

      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const contenu = await page.getTextContent();

        // Les fragments du haut de page, regroupés par ligne de base.
        const hauteur = page.getViewport({ scale: 1 }).height;
        const lignes = new Map<number, { x: number; s: string }[]>();
        for (const item of contenu.items) {
          if (!('str' in item) || !item.str.trim()) continue;
          const y = item.transform[5] as number;
          if (y < hauteur * 0.72) continue; // le quart haut de la page
          const cle = Math.round(y / 3) * 3;
          if (!lignes.has(cle)) lignes.set(cle, []);
          lignes.get(cle)!.push({ x: item.transform[4] as number, s: item.str });
        }

        const ordonnees = [...lignes.entries()]
          .sort((a, b) => b[0] - a[0])
          .slice(0, 4)
          .map(([, frags]) =>
            frags
              .sort((a, b) => a.x - b.x)
              .map((f) => f.s)
              .join(' ')
          );

        for (const ligne of ordonnees) {
          const forme = compact(ligne).slice(0, 60);
          if (forme.length < 14) continue;
          if (!vues.has(forme)) vues.set(forme, new Set());
          vues.get(forme)!.add(i);
        }
        page.cleanup();
      }
      await pdf.destroy();
    } catch {
      /* un dossier illisible ne dit rien de plus qu'un dossier absent */
    }
  }

  const partagees = [...vues.entries()]
    .map(([forme, dossiers]) => ({ forme, n: dossiers.size }))
    .filter((f) => f.n >= seuil)
    .sort((a, b) => b.n - a.n);

  console.log(`# En-têtes vus dans au moins ${seuil} dossiers sur ${fichiers.length}\n`);
  for (const { forme, n } of partagees.slice(0, 120)) {
    console.log(`${String(n).padStart(3)} × ${forme}`);
  }
}

await main();
