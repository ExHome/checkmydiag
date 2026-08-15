/**
 * Le pire fond de chaque univers, et ce qu'il faut pour y écrire.
 *
 * Les textes ne sont pas posés sur le fond nu : les fiches et les encarts
 * déposent par-dessus un voile de l'encre de l'univers, jusqu'à 14 %. Ce voile
 * est plus sombre que le fond, et c'est là que se joue la lisibilité réelle.
 *
 * Ce script cherche, pour chaque couleur qui porte du texte, la version la plus
 * proche de l'originale qui passe 4,5 sur ce voile — on assombrit du strict
 * nécessaire, on ne change pas la teinte.
 */
import { UNIVERS } from '../src/lib/univers';

const lire = (h: string) => {
  const n = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
};
const ecrire = (c: number[]) => '#' + c.map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');
const lum = (c: number[]) => {
  const v = c.map((x) => {
    const y = x / 255;
    return y <= 0.03928 ? y / 12.92 : Math.pow((y + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (v[0] ?? 0) + 0.7152 * (v[1] ?? 0) + 0.0722 * (v[2] ?? 0);
};
const R = (a: number[], b: number[]) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
};
const voile = (fond: string, encre: string, part = 0.14) => {
  const f = lire(fond);
  const e = lire(encre);
  return f.map((c, i) => c * (1 - part) + (e[i] ?? 0) * part);
};

for (const [nom, u] of Object.entries(UNIVERS)) {
  if (!u) continue;
  const pire = voile(u.fond, u.texte);
  const fonds = [pire, lire(u.fond), lire(u.surface)];
  const lignes: string[] = [];

  for (const [role, valeur] of [
    ['texte', u.texte],
    ['texteDoux', u.texteDoux],
    ['accent', u.accent]
  ] as const) {
    const min = Math.min(...fonds.map((f) => R(lire(valeur), f)));
    if (min >= 4.5) continue;
    // Assombrir par pas de 1 %, en gardant la direction de la teinte.
    let corrige = valeur;
    for (let k = 99; k > 0; k--) {
      const essai = lire(valeur).map((x) => (x * k) / 100);
      if (Math.min(...fonds.map((f) => R(essai, f))) >= 4.5) {
        corrige = ecrire(essai);
        break;
      }
    }
    const apres = Math.min(...fonds.map((f) => R(lire(corrige), f)));
    lignes.push(`  ${role.padEnd(10)} ${valeur} ${min.toFixed(2)} → ${corrige} ${apres.toFixed(2)}`);
  }

  if (lignes.length) {
    console.log(`${nom} (voile ${ecrire(pire)})`);
    console.log(lignes.join('\n'));
  }
}
