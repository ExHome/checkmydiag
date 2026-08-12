/**
 * Outil de calibration — LOCAL UNIQUEMENT.
 *
 * Dumpe le texte d'un PDF de diagnostic pour comprendre sa structure et écrire
 * les extracteurs. Rien de ce qu'il produit ne doit entrer dans le dépôt : les
 * rapports contiennent des données personnelles (propriétaire, adresse).
 *
 *   node scripts/dump-pdf.mjs "chemin/vers/rapport.pdf" [pages] > sortie.txt
 */
import { readFile } from 'node:fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const [, , file, maxPagesArg] = process.argv;
if (!file) {
  console.error('usage: node scripts/dump-pdf.mjs <fichier.pdf> [nb pages]');
  process.exit(1);
}
const maxPages = maxPagesArg ? Number(maxPagesArg) : Infinity;

const data = new Uint8Array(await readFile(file));
const pdf = await getDocument({ data, useSystemFonts: true }).promise;

const pages = Math.min(pdf.numPages, maxPages);
console.log(`### ${file} — ${pdf.numPages} pages (dump de ${pages})`);

for (let p = 1; p <= pages; p++) {
  const page = await pdf.getPage(p);
  const content = await page.getTextContent();
  console.log(`\n===== PAGE ${p} =====`);

  // Regroupe les fragments par ligne (coordonnée Y), puis trie par X : c'est
  // la seule façon d'obtenir un texte lisible sur des rapports en colonnes.
  const lines = new Map();
  for (const item of content.items) {
    if (!('str' in item) || !item.str.trim()) continue;
    const y = Math.round(item.transform[5]);
    const key = Math.round(y / 3) * 3; // tolérance de 3pt sur la ligne de base
    if (!lines.has(key)) lines.set(key, []);
    lines.get(key).push({ x: item.transform[4], s: item.str });
  }
  const ordered = [...lines.entries()].sort((a, b) => b[0] - a[0]);
  for (const [, frags] of ordered) {
    frags.sort((a, b) => a.x - b.x);
    console.log(frags.map((f) => f.s).join(' ').replace(/\s+/g, ' ').trim());
  }
}
