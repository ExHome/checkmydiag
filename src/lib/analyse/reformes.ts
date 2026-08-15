/**
 * Les réformes du DPE, lues à la date du diagnostic.
 *
 * Un DPE ne vieillit pas seulement : la règle change sous lui. Deux réformes
 * ont modifié la façon de classer un logement sans qu'aucun mur ne bouge, et
 * un rapport établi avant elles porte une lettre calculée autrement.
 *
 * Le produit ne recalcule rien — il n'a ni les tables ni le droit de le faire.
 * Il regarde la date, dit ce qui a changé depuis, et renvoie là où la
 * rectification se demande : l'Observatoire DPE-Audit de l'ADEME. C'est le seul
 * endroit qui puisse rééditer l'étiquette, et c'est gratuit.
 *
 * Les deux textes ont été lus au Journal officiel le 15/08/2026 et figurent au
 * référentiel avec leur source.
 */
import type { Fait } from '../modele';
import { OBSERVATOIRE } from '../reglement/verifications';

export interface Reforme {
  /** Le nom court, pour l'affichage. */
  titre: string;
  /** Ce qui a changé, et ce que le lecteur peut en faire. */
  texte: string;
  /** À partir de quand la règle nouvelle s'applique. */
  depuis: Date;
}

/** « 05/08/2025 » → Date, ou null si la forme n'est pas celle attendue. */
export function dateFrancaise(valeur: string | undefined | null): Date | null {
  if (!valeur) return null;
  const m = valeur.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, j, mo, a] = m;
  const d = new Date(Number(a), Number(mo) - 1, Number(j));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** L'entrée en vigueur des seuils propres aux logements de 40 m² ou moins. */
const PETITES_SURFACES = new Date(2024, 6, 1);
/** L'entrée en vigueur du facteur 1,9 pour l'électricité. */
const FACTEUR_ELECTRICITE = new Date(2026, 0, 1);
/** Le début de la période ouvrant droit à l'attestation de nouvelle étiquette. */
const DEBUT_ATTESTATION = new Date(2021, 6, 1);

/**
 * Ce qui a changé depuis l'établissement de ce diagnostic.
 *
 * `surface` sert à ne signaler la réforme des petites surfaces qu'à ceux
 * qu'elle concerne : l'annoncer à un logement de quatre-vingts mètres carrés
 * serait du bruit.
 */
export function reformesDepuis(
  etabliLe: Date | null,
  surface: number | null
): Reforme[] {
  if (!etabliLe) return [];
  const reformes: Reforme[] = [];

  /*
   * Les petites surfaces. L'arrêté ouvre un droit précis : un DPE réalisé entre
   * le 1ᵉʳ juillet 2021 et le 1ᵉʳ juillet 2024 sur un logement de 40 m² ou moins
   * « peut faire l'objet d'un document attestant de la nouvelle étiquette »
   * (article 3, lu le 15/08/2026). C'est une étiquette rééditée, pas un
   * diagnostic refait — et elle ne peut qu'améliorer la classe.
   */
  if (
    surface !== null &&
    surface <= 40 &&
    etabliLe >= DEBUT_ATTESTATION &&
    etabliLe < PETITES_SURFACES
  ) {
    reformes.push({
      titre: 'Seuils des petites surfaces',
      depuis: PETITES_SURFACES,
      texte:
        'Depuis le 1ᵉʳ juillet 2024, les logements de 40 m² ou moins sont classés avec des seuils qui leur sont propres — l’ancienne échelle les pénalisait. Ce diagnostic est antérieur : il peut faire l’objet d’une attestation portant la nouvelle étiquette, sans refaire le diagnostic. La classe ne peut que s’améliorer, jamais se dégrader.'
    });
  }

  /*
   * Le facteur de conversion de l'électricité. Il ne concerne que les logements
   * qui en consomment — mais on ne sait pas toujours lesquels, et un DPE
   * antérieur à 2026 a été calculé avec l'ancienne valeur dans tous les cas.
   * On le dit donc à tous, en précisant à qui cela profite.
   */
  if (etabliLe < FACTEUR_ELECTRICITE) {
    reformes.push({
      titre: 'Facteur de conversion de l’électricité',
      depuis: FACTEUR_ELECTRICITE,
      texte:
        'Depuis le 1ᵉʳ janvier 2026, l’électricité est comptée ×1,9 en énergie primaire au lieu de ×2,3. Ce diagnostic a été établi avant : il a donc été calculé avec l’ancien facteur. Un logement chauffé à l’électricité peut y gagner une classe, parfois deux. Le diagnostic reste valable en l’état, et la mise à jour est gratuite.'
    });
  }

  return reformes;
}

/** Où la rectification se demande. Toujours le même endroit. */
export const OU_RECTIFIER = {
  texte: 'Observatoire DPE-Audit de l’ADEME',
  url: OBSERVATOIRE,
  comment:
    'Munissez-vous du numéro ADEME du diagnostic : il figure en tête du rapport. La démarche est gratuite et ne demande pas de nouvelle visite.'
};

/** Le fait à poser sur la fiche, quand il y a quelque chose à dire. */
export function faitDesReformes(reformes: Reforme[]): Fait | null {
  if (!reformes.length) return null;
  return {
    libelle: 'Réformes depuis ce diagnostic',
    valeur: String(reformes.length),
    precision: reformes.map((r) => r.titre).join(' · ')
  };
}
