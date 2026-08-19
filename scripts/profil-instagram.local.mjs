/*
 * Les photos de profil Verrière, pour Instagram et les autres réseaux.
 *
 * ── La contrainte qui commande tout ────────────────────────────────────────
 *
 * Une photo de profil Instagram est CARRÉE au dépôt, mais affichée en CERCLE.
 * Tout ce qui dépasse du cercle inscrit est coupé, et les coins ne se voient
 * jamais. La composition tient donc dans un disque, avec une marge de sûreté :
 * le cercle d'affichage varie légèrement selon les écrans et les applications.
 *
 * Seconde contrainte : la TAILLE RÉELLE. Sur un fil, l'avatar fait 32 à 40
 * pixels de côté. Aucune signature ne s'y lit. On décline donc trois densités
 * de contenu, et on dit laquelle sert à quoi plutôt que d'en livrer une seule
 * qui serait illisible là où on la voit le plus.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const SORTIE = 'C:/Users/degen/DGLM Dropbox/BACK OFFICE/VERRIERE/07_MARKETING/instagram/profil';
mkdirSync(SORTIE, { recursive: true });

const VERT_PROFOND = '#0a2b23';
const IVOIRE = '#f7f6f2';

/* Le prisme, aux couleurs officielles. Dessiné une fois, décliné partout. */
const prisme = (echelle, dx, dy) => `
  <g transform="translate(${dx} ${dy}) scale(${echelle})">
    <path d="M50 4 L4 54 L50 104 Z" fill="url(#plein)"/>
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
    <path d="M50 82.3 L96 54" stroke="#07231c" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>
    <path d="M50 4 C46.6 34 46.6 74 50 104 C53.4 74 53.4 34 50 4 Z" fill="url(#tranche)"/>
    <path d="M50 4 L4 54" fill="none" stroke="#8fb9a4" stroke-width="1.3" stroke-linecap="round" opacity=".55"/>
  </g>`;

const defs = `
  <defs>
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
    </linearGradient>
  </defs>`;

/**
 * Trois densités, et ce qu'elles servent.
 *
 * Le carré fait 1000 ; le cercle d'affichage a donc un rayon de 500, et la
 * marge de sûreté ramène le contenu utile dans un rayon de 390.
 */
const MODELES = {
  /* Le prisme seul, à sa plus grande taille lisible : c'est CELLE-CI qui doit
     servir d'avatar. À 40 pixels sur un fil, il reste reconnaissable. */
  prisme: (fond, encre) => `
    ${defs}
    <rect width="1000" height="1000" fill="${fond}"/>
    ${prisme(4.3, 285, 285)}`,

  /* Le prisme et le nom. Lisible à partir d'environ 150 pixels : bon pour une
     page de profil ouverte, une carte de visite, un QR code. */
  nom: (fond, encre) => `
    ${defs}
    <rect width="1000" height="1000" fill="${fond}"/>
    ${prisme(3.1, 345, 215)}
    <text x="500" y="690" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
          font-size="92" font-weight="500" letter-spacing="16" fill="${encre}">VERRIÈRE</text>`,

  /* Le verrouillage complet, signature comprise. Réservé aux grands formats :
     en avatar, la signature devient une trame grise. */
  complet: (fond, encre) => `
    ${defs}
    <rect width="1000" height="1000" fill="${fond}"/>
    ${prisme(2.7, 365, 190)}
    <text x="500" y="648" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
          font-size="88" font-weight="500" letter-spacing="16" fill="${encre}">VERRIÈRE</text>
    <text x="500" y="706" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
          font-size="26" font-weight="400" letter-spacing="4.6" fill="${encre}" opacity="0.82">LA LUMIÈRE SUR VOS DIAGNOSTICS</text>`
};

const FONDS = {
  vert: { fond: VERT_PROFOND, encre: IVOIRE },
  ivoire: { fond: IVOIRE, encre: VERT_PROFOND }
};

/* Les tailles utiles : Instagram recommande 320 minimum et stocke en 1080. */
const TAILLES = [1080, 512, 320];

/*
 * LE CONTRÔLE DU CERCLE.
 *
 * Instagram rogne en disque : ce qui sort du cercle inscrit disparaît, et les
 * bords de ce cercle varient d'une application à l'autre. On vérifie donc que
 * chaque texte tient dans un rayon de sûreté de 390 sur 1000 — 78 % du carré,
 * ce qui laisse de la marge sous le cercle inscrit (rayon 500).
 *
 * La largeur d'un texte est estimée par ses caractères : largeur de glyphe
 * moyenne (0,58 en serif, 0,60 en linéale) plus l'interlettrage. C'est une
 * approximation, mais elle borne par le haut — elle refuse un peu large plutôt
 * que de laisser passer un texte coupé.
 */
const RAYON_SURETE = 390;

function controlerCercle(svg, nom) {
  const alertes = [];
  for (const m of svg.matchAll(
    /<text x="(\d+)" y="(\d+)"[^>]*font-size="([\d.]+)"[^>]*letter-spacing="([\d.]+)"[^>]*>([^<]+)<\/text>/g
  )) {
    const [, x, y, taille, suivi, texte] = m;
    const largeur = texte.length * (Number(taille) * 0.6 + Number(suivi));
    const demi = largeur / 2;
    /* Le point le plus éloigné du centre : un coin de la boîte de texte. */
    const dx = Math.abs(Number(x) - 500) + demi;
    const dy = Math.abs(Number(y) - 500) + Number(taille) * 0.36;
    const distance = Math.round(Math.hypot(dx, dy));
    if (distance > RAYON_SURETE) {
      alertes.push(`  ${nom} : « ${texte.slice(0, 34)} » atteint ${distance} (limite ${RAYON_SURETE})`);
    }
  }
  return alertes;
}

const alertes = [];
let n = 0;
for (const [nomModele, faire] of Object.entries(MODELES)) {
  for (const [nomFond, { fond, encre }] of Object.entries(FONDS)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">${faire(fond, encre)}</svg>`;
    alertes.push(...controlerCercle(svg, `${nomModele}/${nomFond}`));
    const base = `verriere_profil_${nomModele}_${nomFond}`;
    writeFileSync(join(SORTIE, `${base}.svg`), svg);
    for (const t of TAILLES) {
      const png = new Resvg(svg, { fitTo: { mode: 'width', value: t } }).render().asPng();
      writeFileSync(join(SORTIE, `${base}_${t}.png`), png);
      n++;
    }
  }
}
console.log(`${n} PNG et ${Object.keys(MODELES).length * 2} SVG écrits dans`);
console.log(SORTIE);

if (alertes.length) {
  console.log('');
  console.log('⚠ hors du cercle de sûreté — sera rogné par Instagram :');
  alertes.forEach((a) => console.log(a));
} else {
  console.log('');
  console.log('✓ tous les textes tiennent dans le cercle de sûreté (rayon 390 / 500)');
}
