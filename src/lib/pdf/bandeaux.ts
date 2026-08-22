/**
 * LES BANDEAUX — découper dans le rapport ce qu'on ne peut pas en lire.
 *
 * ── Pourquoi découper plutôt que lire ───────────────────────────────────────
 *
 * Une partie du DPE est imprimée en image : la double étiquette, le schéma des
 * déperditions, les classes projetées après travaux. Aucune extraction de texte
 * ne les atteindra jamais.
 *
 * On ne peut pas les **lire**. On peut les **montrer**. Découper la bande, c'est
 * afficher au lecteur ce que son rapport dit, sans en avoir extrait un seul
 * caractère — donc sans le moindre risque de se tromper. C'est la seule façon
 * honnête d'afficher un « E → C » après travaux.
 *
 * ── Comment une bande se borne ──────────────────────────────────────────────
 *
 * **Exactement comme une rubrique** : par les deux intitulés qui l'encadrent. On
 * repère le titre, on repère le suivant, et on découpe entre les deux. Ce n'est
 * pas un rognage à des fractions de page — un rognage à l'aveugle coupe un titre
 * en deux dès que la mise en page bouge d'une ligne.
 *
 * ── Comment on sait qu'une découpe est juste ────────────────────────────────
 *
 * Sans jamais regarder l'image : **une bande est juste quand elle contient
 * exactement les lignes de sa rubrique, et aucune de la rubrique voisine.** Le
 * texte est positionné, donc la vérification est mesurable, et c'est ce que fait
 * `lignesDansLeBandeau`.
 *
 * ── Par éditeur, comme le reste ─────────────────────────────────────────────
 *
 * Les intitulés ci-dessous sont ceux de LICIEL, mesurés sur vingt-six volets.
 * Chez un éditeur non mesuré, aucun bandeau ne sort — mieux vaut pas de bandeau
 * qu'un bandeau de travers.
 */
import type { LignePositionnee } from '../lignes';

export type NomDeBandeau = 'étiquette' | 'coûts' | 'après travaux' | 'vue d’ensemble';

export interface DefinitionBandeau {
  nom: NomDeBandeau;
  /** Ce que l'écran en dit, pour que le lecteur sache ce qu'il regarde. */
  legende: string;
  /** L'intitulé qui ouvre la bande. */
  haut: RegExp;
  /** Les intitulés qui peuvent la fermer — le premier rencontré l'emporte. */
  bas: RegExp[];
}

/**
 * Les bandeaux de LICIEL, dans l'ordre où le volet les imprime.
 *
 * Chaque `bas` liste plusieurs intitulés parce que la rubrique suivante n'est
 * pas toujours la même : un volet sans recommandations enchaîne directement sur
 * la fiche technique.
 *
 * ── Pourquoi le schéma des déperditions n'est PAS dans cette liste ──────────
 *
 * Il est imprimé en DEUX COLONNES : « Schéma des déperditions de chaleur » et
 * « Performance de l'isolation » partagent la même ligne, à la même ordonnée.
 * Borner par intitulés suppose que les rubriques se suivent de haut en bas ;
 * côte à côte, la méthode ne s'applique pas — mesuré, elle échouait sur sept
 * rapports sur huit.
 *
 * Ce schéma a déjà son découpage, par la position de son IMAGE dans la page
 * (`pdf.ts`, `schemaDeperditions`), et celui-là est mesuré et fonctionne. On ne
 * remplace pas une méthode qui marche par une plus faible.
 */
export const BANDEAUX_LICIEL: DefinitionBandeau[] = [
  {
    nom: 'étiquette',
    legende: 'L’étiquette imprimée sur votre rapport',
    haut: /^Performance [ée]nerg[ée]tique et climatique/i,
    bas: [/^Estimation des co[ûu]ts annuels/i, /^Informations diagnostiqueur/i]
  },
  {
    nom: 'coûts',
    legende: 'L’estimation des coûts, telle que le rapport la donne',
    haut: /^Estimation des co[ûu]ts annuels/i,
    bas: [/^Informations diagnostiqueur/i, /^Syst[èe]me de ventilation/i]
  },
  {
    nom: 'après travaux',
    legende: 'Les classes projetées après travaux, imprimées sur votre rapport',
    haut: /^[ÉE]volution de la performance apr[èe]s travaux/i,
    bas: [/^Fiche technique du logement/i, /^Pour r[ée]pondre [àa] l/i]
  },
  {
    nom: 'vue d’ensemble',
    legende: 'Le descriptif des parois, tel que le rapport le résume',
    haut: /^Vue d.{0,3}ensemble du logement/i,
    bas: [/^Vue d.{0,3}ensemble des [ée]quipements/i, /^Recommandations/i]
  }
];

export interface Bornes {
  /** Ordonnée haute de la bande, en unités PDF (origine en bas à gauche). */
  haut: number;
  /** Ordonnée basse. */
  bas: number;
}

/**
 * Le pied de page traverse toutes les rubriques sans appartenir à aucune.
 *
 * Le laisser fermer une bande ferait descendre la découpe jusqu'en bas de page,
 * et le bandeau emporterait la moitié de la rubrique suivante.
 */
const PIED_DE_PAGE = /T[ée]l\s*:|Dossier\s*:|Page\s+\d+\s*\/\s*\d+|^DPE\b.*p\.\d+$/i;

/** Un peu d'air autour de la bande : un titre collé au bord se lit mal. */
const MARGE = 6;

/**
 * La page qui porte ce bandeau, cherchée DANS LE VOLET et nulle part ailleurs.
 *
 * « Estimation des coûts annuels » apparaît 1,7 fois par rapport : une fois sur
 * la page de garde du dossier, une fois dans le volet DPE. Chercher dans tout le
 * document ramenait la première — et la bande découpait la page de garde, avec
 * la surface Carrez et le numéro d'enregistrement.
 *
 * C'est la règle qui vaut pour toute lecture : une rubrique ne compte que dans
 * son volet. Sans bornes, on ne cherche pas.
 */
export function pageDuBandeau<T extends { numero: number; positions?: readonly LignePositionnee[] }>(
  pages: readonly T[],
  definition: DefinitionBandeau,
  plage: readonly [number, number]
): T | null {
  const dedans = pages.filter((p) => p.numero >= plage[0] && p.numero <= plage[1]);
  return dedans.find((p) => p.positions?.some((l) => definition.haut.test(l.texte.trim()))) ?? null;
}

/**
 * Borne une bande entre son intitulé et le suivant.
 *
 * Rend `null` quand l'intitulé d'ouverture manque : on ne découpe pas « à peu
 * près là ». Quand aucun intitulé de fermeture ne suit, la bande descend
 * jusqu'à la dernière ligne de contenu — jamais jusqu'au pied de page.
 */
export function bornerLeBandeau(
  positions: readonly LignePositionnee[],
  definition: DefinitionBandeau
): Bornes | null {
  const ouverture = positions.find((l) => definition.haut.test(l.texte.trim()));
  if (!ouverture) return null;

  /* Sous le titre, au sens du PDF : une ordonnée plus petite. */
  const dessous = positions
    .filter((l) => l.y < ouverture.y && !PIED_DE_PAGE.test(l.texte))
    .sort((a, b) => b.y - a.y);

  const fermeture = dessous.find((l) => definition.bas.some((m) => m.test(l.texte.trim())));
  const derniere = dessous[dessous.length - 1];

  const bas = fermeture
    ? fermeture.y + fermeture.hauteur + MARGE
    : (derniere?.y ?? ouverture.y) - MARGE;

  const haut = ouverture.y + ouverture.hauteur + MARGE;
  if (haut - bas < 24) return null; // une bande trop plate ne montre rien

  return { haut, bas };
}

/**
 * Les lignes qui tombent dans la bande.
 *
 * C'est la vérification de la découpe : une bande est juste quand elle contient
 * les lignes de sa rubrique et aucune de la voisine. On peut donc la contrôler
 * sur du texte, sans jamais regarder l'image.
 */
export function lignesDansLeBandeau(
  positions: readonly LignePositionnee[],
  bornes: Bornes
): string[] {
  return positions
    .filter((l) => l.y + l.hauteur <= bornes.haut + 1 && l.y >= bornes.bas - 1)
    .sort((a, b) => b.y - a.y)
    .map((l) => l.texte.trim())
    .filter(Boolean);
}
