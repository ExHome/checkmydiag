/*
 * LE KIT LOGO VERRIÈRE — un logo utilisable partout.
 *
 * Un logo ne sert pas à un endroit : il sert à une carte de visite, à un
 * en-tête de mail, à un tampon, à une gravure, à un fond sombre, à une
 * impression en noir. Chacun de ces usages a une contrainte différente, et
 * livrer un seul fichier revient à laisser quelqu'un le déformer.
 *
 * Ce kit tient en quatre compositions, trois traitements et quatre tailles.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const RACINE = 'C:/Users/degen/DGLM Dropbox/BACK OFFICE/VERRIERE/02_IDENTITE_ET_CHARTE/logos/kit';

const VERT = '#0a2b23';
const IVOIRE = '#f7f6f2';

/* Le spectre officiel, et lui seul. */
const SPECTRE = `
  <linearGradient id="l0" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f8f43"/><stop offset="1" stop-color="#4caf3d"/></linearGradient>
  <linearGradient id="l1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4caf3d"/><stop offset="1" stop-color="#7cc23a"/></linearGradient>
  <linearGradient id="l2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7cc23a"/><stop offset="1" stop-color="#c3d438"/></linearGradient>
  <linearGradient id="l3" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c3d438"/><stop offset="1" stop-color="#fbd232"/></linearGradient>
  <linearGradient id="l4" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fbd232"/><stop offset="1" stop-color="#f28c28"/></linearGradient>
  <linearGradient id="l5" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f28c28"/><stop offset="1" stop-color="#e53935"/></linearGradient>
  <linearGradient id="plein" x1="0.15" y1="0" x2="0.9" y2="0.85">
    <stop offset="0" stop-color="#15503f"/><stop offset="0.55" stop-color="#0d3b2f"/><stop offset="1" stop-color="#05201a"/>
  </linearGradient>
  <linearGradient id="tranche" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#cfd8d0"/><stop offset="0.45" stop-color="#ffffff"/><stop offset="1" stop-color="#eef2ec"/>
  </linearGradient>`;

/**
 * Le prisme. Trois traitements :
 *  - `couleur` : le spectre officiel, l'usage normal ;
 *  - `mono`    : une seule encre, pour la gravure, le tampon, le fax, la
 *                sérigraphie une couleur — tout ce qui n'imprime pas en
 *                quadrichromie ;
 *  - `creux`   : le contour seul, pour un marquage à chaud ou une découpe.
 */
function prisme(traitement, encre) {
  const lames =
    traitement === 'couleur'
      ? `
    <path d="M50 4 L96 54 L50 25.7 Z" fill="url(#l0)"/>
    <path d="M50 25.7 L96 54 L50 41 Z" fill="url(#l1)"/>
    <path d="M50 41 L96 54 L50 54 Z" fill="url(#l2)"/>
    <path d="M50 54 L96 54 L50 67 Z" fill="url(#l3)"/>
    <path d="M50 67 L96 54 L50 82.3 Z" fill="url(#l4)"/>
    <path d="M50 82.3 L96 54 L50 104 Z" fill="url(#l5)"/>
    <path d="M50 25.7 L96 54" stroke="#07231c" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>
    <path d="M50 41 L96 54" stroke="#07231c" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>
    <path d="M50 54 L96 54" stroke="#07231c" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>
    <path d="M50 67 L96 54" stroke="#07231c" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>
    <path d="M50 82.3 L96 54" stroke="#07231c" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>`
      : traitement === 'mono'
        ? `
    <path d="M50 4 L96 54 L50 104 Z" fill="${encre}" opacity="0.55"/>
    <path d="M50 25.7 L96 54" stroke="${encre}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M50 41 L96 54" stroke="${encre}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M50 54 L96 54" stroke="${encre}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M50 67 L96 54" stroke="${encre}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M50 82.3 L96 54" stroke="${encre}" stroke-width="1.6" stroke-linecap="round"/>`
        : `
    <path d="M50 4 L96 54 L50 104 Z" fill="none" stroke="${encre}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M50 25.7 L96 54 M50 41 L96 54 M50 54 L96 54 M50 67 L96 54 M50 82.3 L96 54" stroke="${encre}" stroke-width="1.4" stroke-linecap="round"/>`;

  const moitie =
    traitement === 'couleur'
      ? `<path d="M50 4 L4 54 L50 104 Z" fill="url(#plein)"/>`
      : traitement === 'mono'
        ? `<path d="M50 4 L4 54 L50 104 Z" fill="${encre}"/>`
        : `<path d="M50 4 L4 54 L50 104 Z" fill="none" stroke="${encre}" stroke-width="2.2" stroke-linejoin="round"/>`;

  const tranche =
    traitement === 'couleur'
      ? `<path d="M50 4 C46.6 34 46.6 74 50 104 C53.4 74 53.4 34 50 4 Z" fill="url(#tranche)"/>`
      : `<path d="M50 4 L50 104" stroke="${encre}" stroke-width="2" stroke-linecap="round"/>`;

  return `${moitie}${lames}${tranche}`;
}

const serif = "Georgia, 'Times New Roman', serif";
const lineale = 'Helvetica, Arial, sans-serif';

/**
 * Les quatre compositions.
 *
 * La ZONE DE PROTECTION est intégrée à chaque cadre : la hauteur du prisme
 * divisée par deux, tout autour. C'est ce qui empêche qu'on colle le logo
 * contre un bord ou contre un autre logo.
 */
const COMPOSITIONS = {
  /* Horizontal complet — la référence, pour un en-tête, un pied de page. */
  horizontal: (t, encre) => ({
    l: 520,
    h: 150,
    corps: `
      <g transform="translate(28 23) scale(0.96)">${prisme(t, encre)}</g>
      <line x1="150" y1="38" x2="150" y2="112" stroke="${encre}" stroke-width="1.4" opacity="0.35"/>
      <text x="176" y="72" font-family="${serif}" font-size="36" font-weight="500" letter-spacing="8.6" fill="${encre}">VERRIÈRE</text>
      <text x="178" y="100" font-family="${lineale}" font-size="13" font-weight="400" letter-spacing="3.2" fill="${encre}" opacity="0.86">LA LUMIÈRE SUR VOS DIAGNOSTICS</text>`
  }),

  /* Horizontal compact — sans signature. Pour les petites largeurs : bandeau
     de site, en-tête de mail, tampon. */
  compact: (t, encre) => ({
    l: 440,
    h: 130,
    corps: `
      <g transform="translate(26 18) scale(0.88)">${prisme(t, encre)}</g>
      <line x1="132" y1="34" x2="132" y2="96" stroke="${encre}" stroke-width="1.4" opacity="0.35"/>
      <text x="158" y="80" font-family="${serif}" font-size="38" font-weight="500" letter-spacing="9" fill="${encre}">VERRIÈRE</text>`
  }),

  /* Vertical — pour un format étroit : carte, kakémono, tampon rond, packaging. */
  vertical: (t, encre) => ({
    l: 420,
    h: 340,
    corps: `
      <g transform="translate(160 34) scale(1.0)">${prisme(t, encre)}</g>
      <text x="210" y="228" text-anchor="middle" font-family="${serif}" font-size="42" font-weight="500" letter-spacing="10" fill="${encre}">VERRIÈRE</text>
      <text x="210" y="262" text-anchor="middle" font-family="${lineale}" font-size="14" font-weight="400" letter-spacing="3.6" fill="${encre}" opacity="0.86">LA LUMIÈRE SUR VOS DIAGNOSTICS</text>`
  }),

  /* Le prisme seul — favicon, avatar, filigrane, application. */
  prisme: (t, encre) => ({
    l: 200,
    h: 220,
    corps: `<g transform="translate(50 6) scale(1.0)">${prisme(t, encre)}</g>`
  })
};

/* Les traitements, et le fond qui va avec. */
const TRAITEMENTS = [
  { cle: 'couleur-fond-clair', t: 'couleur', encre: VERT, fond: null },
  { cle: 'couleur-fond-vert', t: 'couleur', encre: IVOIRE, fond: VERT },
  { cle: 'couleur-fond-ivoire', t: 'couleur', encre: VERT, fond: IVOIRE },
  { cle: 'mono-noir', t: 'mono', encre: '#000000', fond: null },
  { cle: 'mono-blanc', t: 'mono', encre: '#ffffff', fond: null },
  { cle: 'mono-vert', t: 'mono', encre: VERT, fond: null },
  { cle: 'contour-noir', t: 'creux', encre: '#000000', fond: null },
  { cle: 'contour-blanc', t: 'creux', encre: '#ffffff', fond: null }
];

const TAILLES = [2048, 1024, 512, 256];

let svgs = 0;
let pngs = 0;

for (const [nomComp, faire] of Object.entries(COMPOSITIONS)) {
  const dossier = join(RACINE, nomComp);
  mkdirSync(dossier, { recursive: true });

  for (const { cle, t, encre, fond } of TRAITEMENTS) {
    const { l, h, corps } = faire(t, encre);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${l} ${h}" width="${l}" height="${h}">
  <defs>${SPECTRE}</defs>
  ${fond ? `<rect width="${l}" height="${h}" fill="${fond}"/>` : ''}
  ${corps}
</svg>`;

    const base = `verriere_${nomComp}_${cle}`;
    writeFileSync(join(dossier, `${base}.svg`), svg);
    svgs++;

    /* Le PNG : seulement pour les traitements qu'on pose vraiment en image. Le
       contour et le mono blanc servent en vectoriel (découpe, gravure). */
    if (t === 'couleur' || cle === 'mono-noir' || cle === 'mono-blanc') {
      for (const px of TAILLES) {
        const png = new Resvg(svg, { fitTo: { mode: 'width', value: px } }).render().asPng();
        writeFileSync(join(dossier, `${base}_${px}.png`), png);
        pngs++;
      }
    }
  }
}

console.log(`${svgs} SVG et ${pngs} PNG`);
console.log(RACINE);
