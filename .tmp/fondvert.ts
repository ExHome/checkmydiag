/** Le bureau passe au vert : quelles encres tiennent AA dessus ? */
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
const ct = (a: string, b: string) => {
  const la = lum(lire(a)), lb = lum(lire(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/* Le fond du bureau : le vert d'espace de la publicité, et le vert qui signe. */
const FONDS = { 'vert d’espace #011915': '#011915', 'vert profond #0a2b23': '#0a2b23', 'vert Verrière #12463b': '#12463b' };

/* Ce qu'il faut poser dessus. */
const ENCRES = {
  'blanc pur': '#ffffff',
  'ivoire': '#f7f6f2',
  'ivoire doux (noms d’appli)': '#dfe6db',
  'sauge (mentions)': '#a6c39a',
  'sauge clair': '#c3d9ba'
};

for (const [nomFond, fond] of Object.entries(FONDS)) {
  console.log('\n== ' + nomFond + ' ==');
  for (const [nom, hex] of Object.entries(ENCRES)) {
    const c = ct(hex, fond);
    const verdict = c >= 4.5 ? 'AA' : c >= 3 ? 'AA grand seulement' : 'REFUSE';
    console.log(`  ${nom.padEnd(28)} ${hex}  ${c.toFixed(2).padStart(6)}  ${verdict}`);
  }
  /* Les couleurs DPE en aplat sur ce fond, pour les pastilles de gravité. */
  const DPE = { A: '#319834', F: '#fc9935', G: '#fc0205' };
  for (const [c, hex] of Object.entries(DPE)) {
    console.log(`  pastille DPE ${c}               ${hex}  ${ct(hex, fond).toFixed(2).padStart(6)}  (element graphique : 3.0 requis)`);
  }
}
