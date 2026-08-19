/* Lire l'atlas des schémas de la Dropbox, en texte. Lecture seule. */
import { readFileSync } from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const f =
  'C:/Users/degen/DGLM Dropbox/BACK OFFICE/VERRIERE/02_IDENTITE_ET_CHARTE/ATLAS_SCHEMAS_INTERACTIFS.pdf';
const pdf = await getDocument({
  data: new Uint8Array(readFileSync(f)),
  useSystemFonts: true,
  verbosity: 0
}).promise;

console.log('pages :', pdf.numPages);
for (let n = 1; n <= pdf.numPages; n++) {
  const p = await pdf.getPage(n);
  const c = await p.getTextContent();
  const t = c.items
    .map((i) => ('str' in i ? i.str : ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (t) console.log(`\n───── page ${n} ─────\n${t.slice(0, 1500)}`);
}
await pdf.destroy();
