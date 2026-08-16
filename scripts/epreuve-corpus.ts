/**
 * L'épreuve de vérité : le moteur face au vrai corpus.
 *
 * Le dépôt contient un test `reel.test.ts` prévu pour cela, mais il attend un
 * dossier PLAT et le corpus est une arborescence de milliers de dossiers
 * clients. Résultat : il se sautait tout seul, et personne ne le voyait — deux
 * tests « skipped » dans une suite verte ne réveillent personne.
 *
 * Ce script parcourt l'arborescence, prend un échantillon de dossiers de
 * diagnostic (DDT) et mesure ce que le moteur sait en tirer.
 *
 * ── Ce qui sort d'ici ───────────────────────────────────────────────────────
 *
 * Des COMPTEURS, et rien d'autre. Aucun nom, aucune adresse, aucune valeur lue
 * dans un rapport. Ces PDF contiennent le nom et l'adresse de vraies personnes :
 * ils ne sont pas dans le dépôt, ils n'y entreront pas, et rien de leur contenu
 * ne doit se retrouver dans une sortie de console qu'on recopiera ensuite dans
 * un message.
 *
 * Usage :
 *   npx vite-node scripts/epreuve-corpus.ts -- <racine> [nombre]
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { lignesDePage, type PageTexte } from '../src/lib/lignes';
import { analyser } from '../src/lib/analyse';
import type { TypeDiag } from '../src/lib/modele';

const racine = process.argv[2];
const combien = Number(process.argv[3] ?? 120);

if (!racine) {
  console.error('Usage : vite-node scripts/epreuve-corpus.ts -- <racine> [nombre]');
  process.exit(1);
}

/** Tous les dossiers techniques du corpus, sans jamais suivre deux fois. */
function trouver(dossier: string, trouves: string[], profondeur = 0): void {
  if (profondeur > 8 || trouves.length > 4000) return;
  let entrees: string[];
  try {
    entrees = readdirSync(dossier);
  } catch {
    return;
  }
  for (const e of entrees) {
    if (e.startsWith('.')) continue;
    const chemin = join(dossier, e);
    let est;
    try {
      est = statSync(chemin);
    } catch {
      continue;
    }
    if (est.isDirectory()) trouver(chemin, trouves, profondeur + 1);
    /*
     * Les DDT seulement : ce sont les dossiers de diagnostic complets, ceux que
     * l'utilisateur déposera. Les rapports isolés (TERMITES_…, DPE_…) sont
     * d'autres objets, et les « en_attente » sont des brouillons non signés.
     */
    else if (/^DDT.*\.pdf$/i.test(e) && !/en_attente/i.test(e)) trouves.push(chemin);
  }
}

async function pagesDe(chemin: string): Promise<PageTexte[]> {
  const donnees = new Uint8Array(readFileSync(chemin));
  const pdf = await getDocument({ data: donnees, useSystemFonts: true, verbosity: 0 }).promise;
  const pages: PageTexte[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const contenu = await page.getTextContent();
    pages.push({
      numero: n,
      lignes: lignesDePage(
        contenu.items.filter(
          (i: unknown) => typeof i === 'object' && i !== null && 'str' in i
        ) as never
      )
    });
  }
  await pdf.destroy();
  return pages;
}

const TYPES: TypeDiag[] = [
  'dpe',
  'electricite',
  'amiante',
  'plomb',
  'gaz',
  'termites',
  'erp',
  'carrez',
  'assainissement'
];

const vus = new Map<TypeDiag, number>();
const avecSchema = new Map<TypeDiag, number>();
const muets = new Map<TypeDiag, number>();
const sansDate = new Map<TypeDiag, number>();
for (const t of TYPES) {
  vus.set(t, 0);
  avecSchema.set(t, 0);
  muets.set(t, 0);
  sansDate.set(t, 0);
}

let lus = 0;
let illisibles = 0;
let vides = 0;
let diagsTotal = 0;
const parDossier: number[] = [];

const fichiers: string[] = [];
trouver(racine, fichiers);
console.log(`${fichiers.length} dossiers techniques trouvés — épreuve sur ${Math.min(combien, fichiers.length)}\n`);

/* Un pas régulier plutôt que les N premiers : les dossiers sont rangés par
   client, et prendre le début du tri revient à n'interroger qu'une poignée
   d'immeubles. */
const pas = Math.max(1, Math.floor(fichiers.length / combien));
const echantillon = fichiers.filter((_, i) => i % pas === 0).slice(0, combien);

for (const chemin of echantillon) {
  try {
    const pages = await pagesDe(chemin);
    const texte = pages.reduce((n, p) => n + p.lignes.length, 0);
    if (texte < 20) {
      vides++;
      continue;
    }
    const a = analyser(pages);
    lus++;
    diagsTotal += a.diagnostics.length;
    parDossier.push(a.diagnostics.length);

    for (const d of a.diagnostics) {
      vus.set(d.type, (vus.get(d.type) ?? 0) + 1);
      if (d.schema) avecSchema.set(d.type, (avecSchema.get(d.type) ?? 0) + 1);
      /* « Muet » : le moteur a reconnu le diagnostic mais n'a pas su conclure.
         C'est le chiffre qui compte — il dit ce qu'il reste à apprendre. */
      if (d.gravite === 'neutre') muets.set(d.type, (muets.get(d.type) ?? 0) + 1);
      const aUneDate = d.faits.some((f) => /valab|établi|etabli|réalis|realis/i.test(f.libelle));
      if (!aUneDate) sansDate.set(d.type, (sansDate.get(d.type) ?? 0) + 1);
    }
  } catch {
    illisibles++;
  }
}

console.log(`dossiers lus        : ${lus}`);
console.log(`illisibles          : ${illisibles}`);
console.log(`sans texte (scans)  : ${vides}`);
console.log(`diagnostics trouvés : ${diagsTotal}`);
if (parDossier.length) {
  const tri = [...parDossier].sort((a, b) => a - b);
  console.log(`par dossier         : médiane ${tri[Math.floor(tri.length / 2)]}, min ${tri[0]}, max ${tri[tri.length - 1]}`);
}

console.log('\ntype             trouvés   schéma     muets   sans date');
for (const t of TYPES) {
  const n = vus.get(t) ?? 0;
  if (!n) {
    console.log(`${t.padEnd(16)} ${String(0).padStart(7)}         —         —           —`);
    continue;
  }
  const pc = (x: number) => `${Math.round((x / n) * 100)} %`;
  console.log(
    `${t.padEnd(16)} ${String(n).padStart(7)} ${pc(avecSchema.get(t) ?? 0).padStart(9)} ` +
      `${pc(muets.get(t) ?? 0).padStart(9)} ${pc(sansDate.get(t) ?? 0).padStart(11)}`
  );
}
