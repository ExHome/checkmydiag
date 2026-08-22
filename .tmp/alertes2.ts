import { pagesExemple } from '../src/lib/exemple';
import { analyser } from '../src/lib/analyse';

const a = await analyser(pagesExemple() as never, 12);

console.log('=== 1. CONTROLES DU DOSSIER ===');
for (const c of a.controles) console.log(`  [${c.genre}] ${c.titre}`);

console.log('\n=== 2. RELEVES, par genre ===');
const parGenre: Record<string, string[]> = {};
for (const d of a.diagnostics) {
  for (const r of d.releves ?? []) {
    (parGenre[r.genre] ??= []).push(`[${d.type}] ${r.libelle.slice(0, 62)}${r.ou ? ' — ' + r.ou : ''}`);
  }
}
for (const [g, liste] of Object.entries(parGenre)) {
  console.log(`\n  --- ${g} (${liste.length}) ---`);
  for (const l of liste.slice(0, 8)) console.log('    ' + l);
  if (liste.length > 8) console.log(`    … et ${liste.length - 8} autres`);
}

console.log('\n=== 3. VALIDITE LUE ===');
for (const d of a.diagnostics) {
  const v = d.validiteLue;
  console.log(`  ${d.type.padEnd(13)} ${v ? (v.sansLimite ? 'sans limite' : v.jusquAu ?? '?') + '  (' + v.terme + ')' : '— rien de lu —'}`);
}
