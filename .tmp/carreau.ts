/** Le carreau devient vert : jusqu'où sans abîmer le texte ? */
type RGB = [number, number, number];
const lire = (h: string): RGB => {
  const n = h.replace('#', '');
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
};
const lum = ([r, g, b]: RGB) => {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (c[0] as number) + 0.7152 * (c[1] as number) + 0.0722 * (c[2] as number);
};
const ct = (a: RGB, b: RGB) => {
  const la = lum(a), lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
/** Le vert de la trame posé à X % sur l'ivoire. */
const surIvoire = (pc: number): RGB => {
  const v = lire('#12463b'), f = lire('#f7f6f2'), a = pc / 100;
  return [v[0] * a + f[0] * (1 - a), v[1] * a + f[1] * (1 - a), v[2] * a + f[2] * (1 - a)] as RGB;
};

const TEXTE = lire('#12463b');
const DOUX = lire('#4a5a55');
const hex = (c: RGB) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

console.log('trame | teinte    | contraste du fond avec l’ivoire | texte #12463b | texte doux #4a5a55');
console.log('------+-----------+--------------------------------+---------------+--------------------');
for (const pc of [5, 8, 10, 12, 14, 16, 18, 20, 24, 28]) {
  const fond = surIvoire(pc);
  const visible = ct(fond, lire('#f7f6f2'));
  console.log(
    `${String(pc).padStart(4)}% | ${hex(fond)}   |            ${visible.toFixed(3)}              |     ${ct(TEXTE, fond).toFixed(2)}      |       ${ct(DOUX, fond).toFixed(2)}`
  );
}
console.log('\nLecture : le contraste du fond avec l’ivoire dit si le carreau SE VOIT.');
console.log('En dessous de 1,05 l’œil ne distingue rien sur un écran ordinaire.');
console.log('Les deux dernières colonnes doivent rester au-dessus de 4,5.');
