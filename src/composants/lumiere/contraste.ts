/**
 * Le calcul de contraste, une seule fois, pour tout le mécanisme de lumière.
 *
 * Il existait déjà — dans `univers.test.ts`, c'est-à-dire dans un fichier de
 * test. Or ici le contraste n'est pas seulement vérifié après coup : il BORNE
 * le mécanisme à l'exécution. La lumière qui se retire consulte ces fonctions
 * pour savoir jusqu'où elle a le droit de se retirer.
 *
 * WCAG 2.1, § « relative luminance » et § « contrast ratio ». Rien d'estimé.
 */

/** Luminance relative d'une couleur sRGB opaque, WCAG 2.1. */
export function luminance(hex: string): number {
  const n = hex.replace('#', '');
  const canaux = [n.slice(0, 2), n.slice(2, 4), n.slice(4, 6)].map((paire) => {
    const c = parseInt(paire, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (canaux[0] ?? 0) + 0.7152 * (canaux[1] ?? 0) + 0.0722 * (canaux[2] ?? 0);
}

/** Rapport de contraste entre deux couleurs opaques. */
export function contraste(a: string, b: string): number {
  const l = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((l[0] ?? 0) + 0.05) / ((l[1] ?? 0) + 0.05);
}

/** Les trois canaux d'un hexadécimal à six chiffres. */
export function canaux(hex: string): [number, number, number] {
  const n = hex.replace('#', '');
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}

/** Une couleur à partir de trois canaux, bornée et arrondie. */
export function versHex(r: number, g: number, b: number): string {
  const octet = (v: number) =>
    Math.round(Math.max(0, Math.min(255, v)))
      .toString(16)
      .padStart(2, '0');
  return `#${octet(r)}${octet(g)}${octet(b)}`;
}

/**
 * Mélange sRGB de `a` vers `b`, `t` de 0 à 1.
 *
 * C'est exactement ce que fait le compositeur du navigateur quand il pose `b`
 * à l'alpha `t` sur `a`. On calcule donc la MÊME couleur que celle qui sera à
 * l'écran — la mesure porte sur le pixel final, pas sur une intention.
 */
export function melange(a: string, b: string, t: number): string {
  const A = canaux(a);
  const B = canaux(b);
  const k = Math.max(0, Math.min(1, t));
  return versHex(A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k);
}

/*
 * ══════════════════════════════════════════════════════════════════════════
 * LA BANDE MORTE — le fait le plus important de tout ce fichier
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Verrière n'a que deux encres : le vert profond #0a2b23 et l'ivoire #faf9f8.
 * Pour chacune, on peut résoudre l'inéquation de contraste et obtenir la
 * luminance que la SURFACE doit avoir pour porter cette encre à 4,5:1.
 *
 *   encre sombre #0a2b23   L = 0,019136   il faut  L_surface >= 0,261113
 *   encre ivoire #faf9f8   L = 0,948527   il faut  L_surface <= 0,171895
 *
 * Entre les deux, il reste un intervalle où AUCUNE des deux encres de la
 * marque n'atteint 4,5 :
 *
 *              ] 0,1719  ;  0,2611 [
 *
 * C'est là que meurent les interfaces « qui s'assombrissent doucement ». Une
 * lumière qui se retire de façon continue traverse forcément cette bande —
 * et pendant la traversée, le texte est illisible quelle que soit l'encre
 * choisie. On ne s'en aperçoit pas en regardant les deux états ; on ne le voit
 * qu'en mesurant le chemin entre eux.
 *
 * D'où la règle qui gouverne tout le mécanisme :
 *
 *   UNE SURFACE QUI PORTE DU TEXTE NE TRAVERSE JAMAIS LA BANDE MORTE.
 *
 * Elle reste sur la branche sombre (L <= 0,1719) ou sur la branche claire
 * (L >= 0,2611). Le passage de l'une à l'autre, s'il a lieu, est DISCRET :
 * la surface saute, et l'encre change au même instant.
 */
export const BANDE_MORTE = { bas: 0.171895, haut: 0.261113 } as const;

/** Vrai si aucune des deux encres de la marque ne tient 4,5 sur cette surface. */
export function dansLaBandeMorte(fond: string): boolean {
  const L = luminance(fond);
  return L > BANDE_MORTE.bas && L < BANDE_MORTE.haut;
}

/**
 * L'encre qui tient sur ce fond, ou `null` s'il est dans la bande morte.
 *
 * Renvoyer `null` plutôt qu'un « moins pire » est délibéré : un fond qui ne
 * peut porter aucune encre est un bug de composition, pas un compromis à
 * arbitrer à l'exécution.
 */
export function encrePour(fond: string): '#0a2b23' | '#faf9f8' | null {
  const L = luminance(fond);
  if (L >= BANDE_MORTE.haut) return '#0a2b23';
  if (L <= BANDE_MORTE.bas) return '#faf9f8';
  return null;
}
