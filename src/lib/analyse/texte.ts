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

/** Première ligne qui satisfait le motif, avec ses groupes de capture. */
export function trouver(lignes: string[], motif: RegExp): RegExpMatchArray | null {
  for (const ligne of lignes) {
    const m = ligne.match(motif);
    if (m) return m;
  }
  return null;
}

/** Toutes les lignes qui satisfont le motif. */
export function trouverToutes(lignes: string[], motif: RegExp): RegExpMatchArray[] {
  const res: RegExpMatchArray[] = [];
  for (const ligne of lignes) {
    const m = ligne.match(motif);
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
