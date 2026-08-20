import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
const p = 'C:/Users/degen/DGLM Dropbox/BACK OFFICE/VERRIERE/07_MARKETING/publicite/Verriere_Publicite_A4.pdf';
const doc = await getDocument({ url: p, useSystemFonts: true }).promise;
const pg = await doc.getPage(1);
await pg.getOperatorList();
const img = await new Promise((res, rej) => { let n = 0;
  const t = setInterval(() => { try { const o = pg.objs.get('img_p0_1'); if (o) { clearInterval(t); res(o); } } catch (e) {} if (++n > 200) { clearInterval(t); rej(new Error('ko')); } }, 50); });
const { width: W, height: H, data } = img;
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const hsl = (r, g, b) => { r/=255; g/=255; b/=255;
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2, d=mx-mn;
  if(!d) return [0,0,Math.round(l*100)];
  const s=d/(1-Math.abs(2*l-1));
  let t = mx===r?((g-b)/d)%6 : mx===g?(b-r)/d+2 : (r-g)/d+4; t*=60; if(t<0)t+=360;
  return [Math.round(t), Math.round(s*100), Math.round(l*100)]; };

// Histogramme quantifie a 16 niveaux par canal
const bac = new Map();
for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
  const i = (y * W + x) * 3;
  const k = ((data[i] >> 4) << 8) | ((data[i+1] >> 4) << 4) | (data[i+2] >> 4);
  let e = bac.get(k); if (!e) { e = { n: 0, r: 0, g: 0, b: 0 }; bac.set(k, e); }
  e.n++; e.r += data[i]; e.g += data[i+1]; e.b += data[i+2];
}
const total = [...bac.values()].reduce((s, e) => s + e.n, 0);
const tri = [...bac.values()].sort((a, b) => b.n - a.n).slice(0, 22);
console.log('LES COULEURS DOMINANTES DE LA PUBLICITE  (' + total.toLocaleString('fr-FR') + ' pixels)\n');
console.log('part    couleur   T°   S%  L%');
for (const e of tri) {
  const c = [e.r/e.n, e.g/e.n, e.b/e.n];
  const [h, s, l] = hsl(...c);
  console.log(String((100*e.n/total).toFixed(2)).padStart(5) + ' %  ' + hex(c) + '  ' + String(h).padStart(3) + '  ' + String(s).padStart(3) + ' ' + String(l).padStart(3));
}
// Les couleurs CHAUDES et saturees : le dore
console.log('\nLES CHAUDES SATUREES  (teinte 25-55, S>=30, part>=0,02 %) — le sable dore');
const chaudes = [...bac.values()].map((e) => ({ e, c: [e.r/e.n, e.g/e.n, e.b/e.n] }))
  .filter(({ e, c }) => { const [h, s] = hsl(...c); return h >= 25 && h <= 55 && s >= 30 && 100*e.n/total >= 0.02; })
  .sort((a, b) => b.e.n - a.e.n).slice(0, 12);
for (const { e, c } of chaudes) { const [h, s, l] = hsl(...c);
  console.log(String((100*e.n/total).toFixed(3)).padStart(6) + ' %  ' + hex(c) + '  T' + String(h).padStart(3) + ' S' + String(s).padStart(3) + ' L' + String(l).padStart(3)); }
