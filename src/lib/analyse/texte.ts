/** Petits outils de texte, taillés pour les PDF de diagnostic. */

/** Signes diacritiques, après décomposition NFD. */
const DIACRITIQUES = new RegExp('[\\u0300-\\u036f]', 'g');
/** Espaces exotiques semés par les générateurs de PDF (insécable, fine, etc.). */
const ESPACES = new RegExp('[\\u00a0\\u202f\\u2009\\u2007\\u2060]', 'g');
/** Apostrophes typographiques. */
const APOSTROPHES = new RegExp('[\\u2019\\u02bc]', 'g');

export function sansAccents(s: string): string {
  return s.normalize('NFD').replace(DIACRITIQUES, '');
}

/** Minuscules, sans accents, espaces normalisés. Pour les comparaisons souples. */
export function normalise(s: string): string {
  return sansAccents(s)
    .toLowerCase()
    .replace(ESPACES, ' ')
    .replace(APOSTROPHES, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Version « collée » : plus rien que des lettres et des chiffres.
 *
 * Indispensable ici : l'extraction PDF sème des espaces au milieu des mots
 * (« l'insta llation », « diagnostic - performance »), ce qui casse toute
 * détection par expression régulière classique.
 */
export function compact(s: string): string {
  return normalise(s).replace(/[^a-z0-9]/g, '');
}

/** « 8 105,5 » ou « 8105.5 » → 8105.5 ; null si ce n'est pas un nombre. */
export function nombre(s: string | undefined | null): number | null {
  if (!s) return null;
  const nettoye = s
    .replace(ESPACES, '')
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[^0-9.\-]/g, '');
  if (!nettoye || nettoye === '-' || nettoye === '.') return null;
  const n = Number(nettoye);
  return Number.isFinite(n) ? n : null;
}

/**
 * Rend un motif indifférent à la forme de l'apostrophe.
 *
 * Mesuré sur quarante dossiers : trente-neuf emploient les DEUX apostrophes,
 * la droite et la typographique, souvent dans le même rapport et parfois dans
 * la même phrase — c'est le générateur de PDF qui décide, pas le rédacteur. Un
 * motif écrit avec « n'a » rate donc « n’a » une fois sur deux.
 *
 * L'échec est silencieux, et c'est ce qui le rend dangereux : une conclusion
 * d'absence non reconnue ne provoque aucune erreur, elle laisse simplement le
 * diagnostic sans verdict. Un test sur l'amiante l'a révélé — les conclusions
 * par liste n'étaient lues que dans leur version à apostrophe droite.
 *
 * On réécrit le motif plutôt que la ligne : les groupes capturés gardent ainsi
 * le texte exact du rapport, apostrophe typographique comprise, et rien de ce
 * qu'on affiche n'est altéré.
 */
function tolerantAuxApostrophes(motif: RegExp): RegExp {
  if (!motif.source.includes("'")) return motif;
  return new RegExp(motif.source.replace(/'/g, "['’]"), motif.flags);
}

/** Première ligne qui satisfait le motif, avec ses groupes de capture. */
export function trouver(lignes: string[], motif: RegExp): RegExpMatchArray | null {
  const m2 = tolerantAuxApostrophes(motif);
  for (const ligne of lignes) {
    const m = ligne.match(m2);
    if (m) return m;
  }
  return null;
}

/** Toutes les lignes qui satisfont le motif. */
export function trouverToutes(lignes: string[], motif: RegExp): RegExpMatchArray[] {
  const m2 = tolerantAuxApostrophes(motif);
  const res: RegExpMatchArray[] = [];
  for (const ligne of lignes) {
    const m = ligne.match(m2);
    if (m) res.push(m);
  }
  return res;
}

/** Vrai si l'une des lignes contient le fragment (comparaison « collée »). */
export function contient(lignes: string[], fragment: string): boolean {
  const cible = compact(fragment);
  return lignes.some((l) => compact(l).includes(cible));
}

/** Coupe une phrase trop longue pour l'affichage, sans couper un mot. */
export function abreger(s: string, max = 220): string {
  const propre = s.replace(/\s+/g, ' ').trim();
  if (propre.length <= max) return propre;
  const coupe = propre.slice(0, max);
  const espace = coupe.lastIndexOf(' ');
  return `${coupe.slice(0, espace > 0 ? espace : max)}…`;
}
