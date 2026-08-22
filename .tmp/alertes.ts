/** Que contiendrait l'écran Alertes s'il montrait tout ce qu'Aude demande ? */
import { pagesExemple } from '../src/lib/exemple';
import { analyser } from '../src/lib/analyse';

const a = await analyser(pagesExemple() as never, 12);

console.log('=== CONTROLES DU DOSSIER (incohérences, péremptions, manques) ===');
for (const c of a.controles) console.log(`  [${c.genre}] ${c.titre}`);
console.log(`  -> ${a.controles.length} au total\n`);

const parGenre: Record<string, number> = {};
let total = 0;
for (const d of a.diagnostics) {
  for (const p of d.points ?? []) {
    parGenre[p.genre] = (parGenre[p.genre] ?? 0) + 1;
    total += 1;
  }
}
console.log('=== POINTS DE TOUS LES DIAGNOSTICS, par genre ===');
for (const [g, n] of Object.entries(parGenre)) console.log(`  ${g.padEnd(12)} ${n}`);
console.log(`  -> ${total} au total\n`);

console.log('=== CE QUI N’A PAS ÉTÉ VU (nonVisite + nonVerifie) ===');
for (const d of a.diagnostics) {
  for (const p of d.points ?? []) {
    if (p.genre === 'nonVisite' || p.genre === 'nonVerifie') {
      console.log(`  [${d.type}] ${p.libelle?.slice(0, 78) ?? JSON.stringify(p).slice(0, 78)}`);
    }
  }
}

console.log('\n=== VALIDITÉ : dates de fin par diagnostic ===');
for (const d of a.diagnostics) {
  const fin = (d as unknown as { finValidite?: string }).finValidite ?? (d as unknown as { validite?: string }).validite;
  console.log(`  ${d.type.padEnd(14)} ${fin ?? '— rien de lu —'}`);
}

console.log('\n=== PAS AU DOSSIER ===');
console.log('  nonExploites :', a.nonExploites.length);
