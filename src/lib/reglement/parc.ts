/**
 * Le parc de logements français, par classe.
 *
 * Une lettre seule ne dit rien. « Classe D » ne devient une information que
 * lorsqu'on sait que c'est la classe d'un tiers des logements français, et que
 * « classe F » range le logement parmi une minorité que la loi vise déjà.
 * L'échelle du DPE situe un logement par rapport à un barème ; ces chiffres le
 * situent par rapport aux autres, ce qui est la question qu'on se pose vraiment.
 *
 * Source : « Le parc de logements par classe de performance énergétique au
 * 1ᵉʳ janvier 2025 », service des données et études statistiques (SDES) du
 * ministère de la Transition écologique, publié le 12 novembre 2025.
 * https://www.statistiques.developpement-durable.gouv.fr/le-parc-de-logements-par-classe-de-performance-energetique-au-1er-janvier-2025
 * Lu à la source le 14 août 2026.
 *
 * Deux précautions d'emploi, à ne jamais perdre de vue :
 *
 *  1. Ce sont des **résidences principales**, 30,9 millions au total. Un local
 *     commercial, une résidence secondaire ou un logement vacant ne s'y compare
 *     pas.
 *  2. Ce sont des **estimations** extrapolées à partir des DPE collectés par
 *     l'ADEME d'octobre 2024 à mars 2025, et non un recensement. La base des
 *     DPE ne couvre pas tout le parc et n'en est pas représentative : c'est le
 *     SDES qui la redresse. On dit donc « environ », toujours.
 */
import type { Lettre } from '../modele';

export interface PartDuParc {
  /** Part des résidences principales, en pourcentage. */
  part: number;
  /** Part cumulée des classes plus performantes, celles au-dessus. */
  mieux: number;
}

/** Au 1ᵉʳ janvier 2025. Les sept parts totalisent 100 %. */
const PARTS: Record<Lettre, number> = {
  A: 3.3,
  B: 5.3,
  C: 27.2,
  D: 33.7,
  E: 17.8,
  F: 7.9,
  G: 4.8
};

const ORDRE: Lettre[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

/** Le nombre de résidences principales du champ, en millions. */
export const RESIDENCES_PRINCIPALES_MILLIONS = 30.9;

/** La part des passoires — classes F et G réunies. */
export const PASSOIRES = { part: 12.7, millions: 3.9 };

export function partDuParc(lettre: Lettre): PartDuParc {
  const i = ORDRE.indexOf(lettre);
  const mieux = ORDRE.slice(0, i).reduce((n, l) => n + PARTS[l], 0);
  return { part: PARTS[lettre], mieux: Math.round(mieux * 10) / 10 };
}

/**
 * Où se situe ce logement parmi les autres, en une phrase.
 *
 * On arrondit à l'unité et on dit « environ » : ces chiffres sont des
 * estimations, et une décimale leur donnerait une précision qu'ils n'ont pas.
 */
export function situationDans(lettre: Lettre): string {
  const { part, mieux } = partDuParc(lettre);
  const p = Math.round(part);
  const m = Math.round(mieux);

  if (lettre === 'A') {
    return `Environ ${p} % des résidences principales françaises sont classées A : c’est le haut du parc.`;
  }
  if (lettre === 'G') {
    return `Environ ${p} % des résidences principales sont classées G, et ${m} % font mieux. C’est le bas du parc.`;
  }
  return `Environ ${p} % des résidences principales françaises sont classées ${lettre}, et ${m} % font mieux.`;
}
