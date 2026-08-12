/**
 * Outil de calibration — LOCAL UNIQUEMENT (voir dump-pdf.mjs).
 *
 * Affiche les fragments bruts d'une page (x, y, police) et la liste des images
 * qu'elle contient. Sert à savoir si une valeur du DPE est du texte extractible
 * ou une image (auquel cas il faut la lire autrement).
 *
 *   node scripts/inspect-pdf.mjs <fichier.pdf> <page>
 */
import { readFile } from 'node:fs/promises';
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';

const [, , file, pageArg] = process.argv;
if (!file) {
  console.error('usage: node scripts/inspect-pdf.mjs <fichier.pdf> <page>');
  process.exit(1);
}

const data = new Uint8Array(await readFile(file));
const pdf = await getDocument({ data, useSystemFonts: true }).promise;
const page = await pdf.getPage(Number(pageArg ?? 1));

const content = await page.getTextContent();
console.log(`--- ${content.items.length} fragments texte ---`);
for (const item of content.items) {
  if (!('str' in item)) continue;
  const [, , , , x, y] = item.transform;
  console.log(
    `${x.toFixed(0).padStart(5)} ${y.toFixed(0).padStart(5)}  ${String(item.fontName).padEnd(10)} ${JSON.stringify(item.str)}`
  );
}

const ops = await page.getOperatorList();
const images = ops.fnArray.filter(
  (fn) => fn === OPS.paintImageXObject || fn === OPS.paintJpegXObject || fn === OPS.paintInlineImageXObject
).length;
const paths = ops.fnArray.filter((fn) => fn === OPS.fill || fn === OPS.eoFill).length;
console.log(`--- ${images} images, ${paths} remplissages vectoriels ---`);
