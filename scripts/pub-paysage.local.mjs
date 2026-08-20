import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
const p = 'C:/Users/degen/DGLM Dropbox/BACK OFFICE/VERRIERE/07_MARKETING/publicite/Verriere_Publicite_A4_Paysage.pdf';
const doc = await getDocument({ url: p, useSystemFonts: true }).promise;
const pg = await doc.getPage(1);
const c = await pg.getTextContent();
const txt = c.items.map(x => x.str).join(' ').replace(/\s+/g, ' ').trim();
console.log('TEXTE :', txt ? txt.slice(0, 3000) : '(aucun — image seule)');
await pg.getOperatorList();
let img = null;
for (const nom of ['img_p0_1', 'img_p0_2', 'img_p0_0']) {
  try { const o = await new Promise((res, rej) => { let n = 0;
    const t = setInterval(() => { try { const v = pg.objs.get(nom); if (v) { clearInterval(t); res(v); } } catch (e) {} if (++n > 60) { clearInterval(t); rej(); } }, 50); });
    img = o; console.log('image :', nom); break; } catch (e) {}
}
if (!img) { console.log('pas d image'); process.exit(0); }
const { width: W, height: H, data } = img;
const canaux = Math.round(data.length / (W * H));
console.log('dimensions', W, 'x', H, '| canaux', canaux);
const hex = (c2) => '#' + c2.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const px = (x, y) => { const i = (y * W + x) * canaux; return [data[i], data[i+1], data[i+2]]; };
const bac = new Map();
for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
  const i = (y * W + x) * canaux;
  const k = ((data[i] >> 4) << 8) | ((data[i+1] >> 4) << 4) | (data[i+2] >> 4);
  let e = bac.get(k); if (!e) { e = { n: 0, r: 0, g: 0, b: 0 }; bac.set(k, e); }
  e.n++; e.r += data[i]; e.g += data[i+1]; e.b += data[i+2];
}
const total = [...bac.values()].reduce((s, e) => s + e.n, 0);
console.log('\nDOMINANTES');
for (const e of [...bac.values()].sort((a, b) => b.n - a.n).slice(0, 14))
  console.log(String((100*e.n/total).toFixed(2)).padStart(6) + ' %  ' + hex([e.r/e.n, e.g/e.n, e.b/e.n]));
console.log('\nBANDE DES MINI-APPLICATIONS — balayage horizontal a plusieurs hauteurs');
for (const pct of [50, 52, 54, 56, 58]) {
  const y = Math.floor(H * pct / 100);
  let l = String(pct).padStart(3) + '% ';
  for (let c2 = 0; c2 < 16; c2++) l += hex(px(Math.floor((c2 + 0.5) * W / 16), y)) + ' ';
  console.log(l);
}
