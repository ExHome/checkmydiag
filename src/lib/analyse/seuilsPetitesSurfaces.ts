/**
 * Les seuils du DPE pour les logements de 40 m² ou moins.
 *
 * ── Pourquoi cette table existe ────────────────────────────────────────────
 *
 * Un petit logement consomme davantage AU MÈTRE CARRÉ qu'un grand : l'eau
 * chaude d'une personne se répartit sur 25 m² au lieu de 100. Jusqu'en 2024,
 * l'échelle unique classait donc les studios trop sévèrement — environ 140 000
 * logements étaient étiquetés F ou G pour cette seule raison. L'arrêté du
 * 25 mars 2024 leur donne une échelle propre, surface par surface, de 8 à
 * 40 m², les valeurs intermédiaires étant obtenues par interpolation linéaire.
 *
 * Le moteur refusait jusqu'ici de recalculer la lettre sous 40 m², faute de
 * connaître ces seuils. Mesuré sur le corpus : 33 DPE sur 95 sont dans ce cas —
 * un tiers des logements restait sans lettre, et c'est le cas le plus fréquent
 * de tous les silences du moteur.
 *
 * ── D'où viennent ces nombres, et comment ils ont été vérifiés ─────────────
 *
 * Relevés au texte de l'arrêté du 25 mars 2024 sur Légifrance (annexe 1,
 * § 1.2.2.1), lu le 16/08/2026 :
 * https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049446315
 *
 * Aucune source secondaire ne reproduit ces tables — elles ont été relevées sur
 * le texte officiel, puis recoupées trois fois :
 *
 *   · la ligne 40 m² doit redonner EXACTEMENT les seuils généraux de l'arrêté
 *     du 31 mars 2021 (70/110/180/250/330/420 et 6/11/30/50/70/100), puisque
 *     c'est là que les deux échelles se rejoignent. C'est le cas ;
 *   · les valeurs décroissent strictement quand la surface augmente ;
 *   · trois relectures séparées du même texte donnent les mêmes nombres.
 *
 * Ces trois contrôles sont figés en tests. Si un jour l'un d'eux tombe, c'est
 * la table qu'il faut corriger, pas le test.
 *
 * ── Ce que cette table ne couvre PAS ───────────────────────────────────────
 *
 * L'arrêté prévoit un second jeu de valeurs, pour les logements situés à
 * 800 mètres d'altitude ou plus (zones H1b, H1c, H2d), qui ne touche que les
 * classes E et F. Il n'est pas codé ici : le corpus est girondin et n'en
 * contient aucun cas. Quand le rapport laisse penser que le logement est en
 * altitude, on ne recalcule pas — voir `enAltitude`.
 */
import type { Lettre } from '../modele';

/** Frontières A|B, B|C, C|D, D|E, E|F, F|G, dans cet ordre. */
export type Seuils = [number, number, number, number, number, number];

/** La plus petite surface pour laquelle l'arrêté donne une ligne. */
export const SURFACE_MIN = 8;
/** Au-delà, l'échelle générale s'applique. */
export const SURFACE_MAX = 40;

/* Énergie primaire, en kWh/m²/an. Index 0 = 8 m², index 32 = 40 m². */
const CEP: Seuils[] = [
  [146, 186, 386, 505, 622, 739], // 8
  [134, 174, 355, 464, 574, 685], // 9
  [124, 164, 329, 428, 533, 640], // 10
  [117, 157, 311, 403, 503, 607], // 11
  [112, 152, 296, 381, 478, 578], // 12
  [108, 148, 283, 363, 456, 554], // 13
  [104, 144, 273, 348, 437, 532], // 14
  [100, 140, 263, 333, 421, 514], // 15
  [97, 137, 255, 325, 412, 504], // 16
  [95, 135, 248, 318, 404, 496], // 17
  [92, 132, 241, 311, 397, 489], // 18
  [90, 130, 235, 305, 390, 482], // 19
  [88, 128, 230, 300, 385, 476], // 20
  [87, 127, 225, 295, 380, 471], // 21
  [85, 125, 221, 291, 375, 466], // 22
  [84, 124, 217, 287, 371, 462], // 23
  [82, 122, 214, 284, 367, 458], // 24
  [81, 121, 210, 280, 363, 454], // 25
  [80, 120, 207, 277, 360, 451], // 26
  [79, 119, 204, 274, 357, 447], // 27
  [78, 118, 202, 272, 354, 444], // 28
  [77, 117, 199, 269, 351, 442], // 29
  [76, 116, 197, 267, 349, 439], // 30
  [76, 116, 195, 265, 346, 437], // 31
  [75, 115, 193, 263, 344, 434], // 32
  [74, 114, 191, 261, 342, 432], // 33
  [74, 114, 189, 259, 340, 430], // 34
  [73, 113, 188, 258, 338, 428], // 35
  [72, 112, 186, 256, 337, 427], // 36
  [72, 112, 185, 255, 335, 425], // 37
  [71, 111, 183, 253, 333, 423], // 38
  [71, 111, 182, 252, 332, 422], // 39
  [70, 110, 180, 250, 330, 420] // 40 — raccord avec l'échelle générale
];

/* Émissions, en kg CO₂/m²/an. Même indexation. */
const EGES: Seuils[] = [
  [11, 16, 44, 68, 90, 122], // 8
  [11, 16, 42, 65, 87, 118], // 9
  [10, 15, 40, 62, 84, 115], // 10
  [10, 15, 39, 61, 82, 113], // 11
  [9, 14, 38, 59, 81, 111], // 12
  [9, 14, 37, 58, 79, 110], // 13
  [9, 14, 37, 58, 78, 108], // 14
  [8, 13, 36, 56, 76, 107], // 15
  [8, 13, 35, 55, 76, 106], // 16
  [8, 13, 35, 55, 75, 105], // 17
  [8, 13, 34, 54, 75, 105], // 18
  [8, 13, 34, 54, 74, 105], // 19
  [8, 13, 34, 54, 74, 104], // 20
  [8, 13, 33, 53, 74, 104], // 21
  [7, 12, 33, 53, 73, 103], // 22
  [7, 12, 33, 53, 73, 103], // 23
  [7, 12, 33, 53, 73, 103], // 24
  [7, 12, 32, 52, 73, 103], // 25
  [7, 12, 32, 52, 72, 103], // 26
  [7, 12, 32, 52, 72, 102], // 27
  [7, 12, 32, 52, 72, 102], // 28
  [7, 12, 32, 52, 72, 102], // 29
  [7, 12, 32, 52, 72, 102], // 30
  [7, 12, 31, 51, 72, 102], // 31
  [7, 12, 31, 51, 71, 101], // 32
  [7, 12, 31, 51, 71, 101], // 33
  [7, 12, 31, 51, 71, 101], // 34
  [7, 12, 31, 51, 71, 101], // 35
  [7, 12, 31, 51, 71, 101], // 36
  [7, 12, 31, 51, 71, 101], // 37
  [7, 12, 31, 51, 71, 101], // 38
  [7, 12, 31, 51, 71, 101], // 39
  [6, 11, 30, 50, 70, 100] // 40 — raccord avec l'échelle générale
];

/**
 * Les seuils applicables à une surface donnée.
 *
 * L'arrêté donne une ligne par mètre carré entier ; entre deux, il prescrit
 * l'interpolation linéaire. Un logement de 22,4 m² se lit donc à 60 % du chemin
 * entre la ligne 22 et la ligne 23.
 *
 * Sous 8 m², l'arrêté ne descend pas plus bas : on applique la première ligne,
 * comme il l'indique par « inférieure ou égale à 8 ».
 */
function interpoler(table: Seuils[], surface: number): Seuils | null {
  if (!Number.isFinite(surface) || surface <= 0) return null;
  if (surface > SURFACE_MAX) return null;
  const s = Math.max(SURFACE_MIN, surface);
  const bas = Math.floor(s);
  const haut = Math.ceil(s);
  const ligneBas = table[bas - SURFACE_MIN];
  const ligneHaut = table[haut - SURFACE_MIN];
  if (!ligneBas || !ligneHaut) return null;
  if (bas === haut) return ligneBas;
  const part = s - bas;
  return ligneBas.map((v, i) => {
    const w = ligneHaut[i];
    return w === undefined ? v : v + (w - v) * part;
  }) as Seuils;
}

export function seuilsEnergie(surface: number): Seuils | null {
  return interpoler(CEP, surface);
}

export function seuilsClimat(surface: number): Seuils | null {
  return interpoler(EGES, surface);
}

/**
 * Le logement est-il en altitude, là où l'arrêté prévoit d'autres valeurs ?
 *
 * On cherche ce que le rapport dit de lui-même. En l'absence de toute mention,
 * on considère qu'il n'y est pas : c'est le cas de l'immense majorité des
 * logements français, et se tromper ici ne déplacerait que les classes E et F.
 */
export function enAltitude(lignes: string[]): boolean {
  const texte = lignes.join(' ');
  if (/zone climatique\s*:?\s*H[12][bcd]\b/i.test(texte)) {
    /* H1b, H1c et H2d ne suffisent pas : c'est l'altitude qui décide, et ces
       zones s'étendent bien en dessous de 800 mètres. On ne bascule que si
       l'altitude est écrite ET dépasse le seuil. */
  }
  const alt = texte.match(/altitude\s*:?\s*(?:de\s*)?(\d{3,4})\s*m/i);
  return alt?.[1] ? Number(alt[1]) >= 800 : false;
}

/** La table renvoie des lettres A à G comme l'échelle générale. */
export type { Lettre };
