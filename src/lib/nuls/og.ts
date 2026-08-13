/**
 * Les cartes de partage — ce qui s'affiche quand un lien est envoyé sur un
 * réseau social ou dans une messagerie.
 *
 * Une carte par page : la question y est écrite en toutes lettres, dans le
 * caractère de la marque. Cela suppose de couper le titre en lignes, donc de
 * mesurer un texte avant de le dessiner — d'où la fonction `mesure` que ce
 * module réclame plutôt que d'estimer une largeur moyenne. Elle vient de la
 * police elle-même (voir `scripts/metriques-police.ts`), et le rendu est fait
 * avec la même police figée (voir `scripts/police-cartes.ts`).
 *
 * Ce fichier ne dessine que du SVG : il ne connaît ni rastériseur, ni fichier,
 * ni système de polices.
 */
import { html, type Theme } from './socle';

/** 1200 × 630 : le format que réclament les réseaux sociaux. */
export const LARGEUR = 1200;
export const HAUTEUR = 630;

/** La largeur d'un texte à une taille donnée, en pixels. */
export type Mesure = (texte: string, taille: number) => number;

const FAMILLE = 'Fraunces';
/** La linéale des mentions : elle vient du système, comme le corps du site. */
const LINEALE = "'Segoe UI', 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif";

const MARGE = 80;
const FOND = '#002924';
const CREME = '#faf8f3';
const OR = '#c09048';
const OR_CLAIR = '#d9b778';
const DOUX = '#a8bdb2';

/**
 * La maison au trait, reprise du langage des schémas. Elle n'apparaît que sur
 * les cartes de thème : là où le titre est court, elle occupe la place laissée
 * libre ; sur une question de trois lignes, elle se disputerait le terrain avec
 * le texte.
 */
const MAISON = `
  <g transform="translate(846 168) scale(1.42)" opacity="0.5" fill="none"
     stroke="${OR}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M20 100 L110 30 L200 100" />
    <rect x="44" y="100" width="132" height="112" />
    <rect x="160" y="46" width="18" height="34" />
    <rect x="68" y="126" width="38" height="38" />
    <rect x="128" y="126" width="38" height="38" />
    <path d="M87 126v38M68 145h38M147 126v38M128 145h38" stroke-width="1.4" />
    <rect x="96" y="176" width="34" height="36" />
    <path d="M4 212 H216" stroke-width="1.6" />
    <path d="M14 212 l-8 10M38 212 l-8 10M62 212 l-8 10M86 212 l-8 10M110 212 l-8 10M134 212 l-8 10M158 212 l-8 10M182 212 l-8 10M206 212 l-8 10" stroke-width="1.1" opacity="0.7" />
  </g>`;

/**
 * Coupe un texte en lignes qui tiennent dans une largeur.
 *
 * Un mot plus large que la ligne n'est pas coupé : il déborderait plutôt que de
 * se voir amputé. Aucun titre de la rubrique n'est dans ce cas, et le test s'en
 * assure.
 */
export function couper(texte: string, taille: number, largeur: number, mesure: Mesure): string[] {
  const lignes: string[] = [];
  let courante = '';

  for (const mot of texte.split(' ')) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (courante && mesure(essai, taille) > largeur) {
      lignes.push(courante);
      courante = mot;
    } else {
      courante = essai;
    }
  }
  if (courante) lignes.push(courante);
  return lignes;
}

/**
 * Le corps du titre et son découpage : on descend d'un cran tant que le texte
 * demande plus de lignes que prévu. Les paliers sont espacés pour que deux
 * cartes voisines ne se ressemblent pas à un point près.
 */
export function poser(
  titre: string,
  largeur: number,
  mesure: Mesure,
  maxLignes = 3
): { taille: number; lignes: string[] } {
  const paliers = [88, 78, 68, 60, 52, 46];

  for (const taille of paliers) {
    const lignes = couper(titre, taille, largeur, mesure);
    if (lignes.length <= maxLignes) return { taille, lignes };
  }

  const taille = paliers[paliers.length - 1] as number;
  return { taille, lignes: couper(titre, taille, largeur, mesure) };
}

/** Le cadre commun : fond, halo, filet or, marque, et les mentions du bas. */
function cadre(contenu: string, thème: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGEUR}" height="${HAUTEUR}" viewBox="0 0 ${LARGEUR} ${HAUTEUR}">
  <defs>
    <radialGradient id="halo" cx="50%" cy="-10%" r="80%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.07" />
      <stop offset="70%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="${LARGEUR}" height="${HAUTEUR}" fill="${FOND}" />
  <rect width="${LARGEUR}" height="${HAUTEUR}" fill="url(#halo)" />
  <rect x="0" y="0" width="${LARGEUR}" height="7" fill="${OR}" />

  <text x="${MARGE}" y="112" font-family="${FAMILLE}" font-size="36" fill="${CREME}">Check<tspan fill="${OR_CLAIR}">My</tspan>Diag</text>
  ${
    thème
      ? `<text x="${LARGEUR - MARGE}" y="112" text-anchor="end" font-family="${LINEALE}" font-size="23" font-weight="600" letter-spacing="3.4" fill="${OR_CLAIR}">${html(thème.toUpperCase())}</text>`
      : ''
  }

${contenu}

  <path d="M${MARGE} 540 H${LARGEUR - MARGE}" stroke="${CREME}" stroke-opacity="0.16" stroke-width="1" />
  <text x="${MARGE}" y="583" font-family="${LINEALE}" font-size="22" font-weight="600" letter-spacing="3.4" fill="${OR_CLAIR}">LES DIAGS POUR LES NULS</text>
  <text x="${LARGEUR - MARGE}" y="583" text-anchor="end" font-family="${LINEALE}" font-size="20" fill="#8ba496">Votre rapport ne quitte jamais votre appareil.</text>
</svg>`;
}

/**
 * La carte d'une question : le titre occupe toute la largeur, centré sur la
 * hauteur libre. C'est lui qu'on doit lire en vignette, avant tout le reste.
 */
export function carteQuestion(question: string, thème: string, mesure: Mesure): string {
  const largeur = LARGEUR - MARGE * 2;
  const { taille, lignes } = poser(question, largeur, mesure);
  const interligne = Math.round(taille * 1.16);
  // Le bloc est centré entre la marque et le filet du bas.
  const hauteur = (lignes.length - 1) * interligne;
  const depart = Math.round(340 - hauteur / 2);

  const texte = lignes
    .map(
      (ligne, i) =>
        `  <text x="${MARGE}" y="${depart + i * interligne}" font-family="${FAMILLE}" font-size="${taille}" font-weight="600" fill="${CREME}">${html(ligne)}</text>`
    )
    .join('\n');

  return cadre(texte, thème);
}

/** La carte d'un thème : titre court, et la maison à droite. */
export function carteTheme(theme: Theme, mesure: Mesure): string {
  const largeur = 700;
  const { taille, lignes } = poser(theme.titre, largeur, mesure, 2);
  const interligne = Math.round(taille * 1.14);
  const depart = lignes.length > 1 ? 300 : 336;

  const texte = `${MAISON}
${lignes
  .map(
    (ligne, i) =>
      `  <text x="${MARGE}" y="${depart + i * interligne}" font-family="${FAMILLE}" font-size="${taille}" font-weight="600" fill="${CREME}">${html(ligne)}</text>`
  )
  .join('\n')}
  <path d="M${MARGE} ${depart + (lignes.length - 1) * interligne + 52} H${MARGE + 160}" stroke="${OR}" stroke-width="2" />
  <text x="${MARGE}" y="${depart + (lignes.length - 1) * interligne + 104}" font-family="${LINEALE}" font-size="25" fill="${DOUX}">${html(`${theme.questions.length} questions, expliquées simplement`)}</text>`;

  return cadre(texte, '');
}

/** La carte de l'accueil de la rubrique. */
export function carteRubrique(questions: number, themes: number, mesure: Mesure): string {
  const { taille, lignes } = poser('Les diagnostics immobiliers, en clair', 700, mesure, 2);
  const interligne = Math.round(taille * 1.14);
  const depart = lignes.length > 1 ? 296 : 336;

  const texte = `${MAISON}
${lignes
  .map(
    (ligne, i) =>
      `  <text x="${MARGE}" y="${depart + i * interligne}" font-family="${FAMILLE}" font-size="${taille}" font-weight="600" fill="${CREME}">${html(ligne)}</text>`
  )
  .join('\n')}
  <path d="M${MARGE} ${depart + (lignes.length - 1) * interligne + 52} H${MARGE + 160}" stroke="${OR}" stroke-width="2" />
  <text x="${MARGE}" y="${depart + (lignes.length - 1) * interligne + 104}" font-family="${LINEALE}" font-size="25" fill="${DOUX}">${html(`${questions} questions sur ${themes} thèmes, avec un schéma à chaque fois`)}</text>`;

  return cadre(texte, '');
}
