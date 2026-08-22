import { pagesExemple } from '../src/lib/exemple';
import { analyser } from '../src/lib/analyse';

const a = await analyser(pagesExemple() as never, 12);
const lignes: string[] = [];
let total = 0, avecFamille = 0, avecTon = 0;
for (const d of a.diagnostics) {
  for (const r of d.reperes ?? []) {
    total += 1;
    if (r.famille) avecFamille += 1;
    if (r.ton) avecTon += 1;
    lignes.push(
      [d.type.padEnd(8), (r.famille ?? '—').padEnd(8), (r.ton ?? '—').padEnd(7), r.titre.slice(0, 30).padEnd(30), r.extrait.slice(0, 40)].join(' | ')
    );
  }
}
console.log(lignes.join('\n'));
console.log(`\nTOTAL ${total} repères — famille renseignée : ${avecFamille} — ton renseigné : ${avecTon}`);
