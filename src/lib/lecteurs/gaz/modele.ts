/**
 * CE QU'UN LECTEUR GAZ REND — commun à tous les formats.
 *
 * Le modèle est dicté par l'ordre de mission du 21/08/2026 (`docs/ODM-GAZ.md`) :
 * on ne rend pas « gaz : anomalie », on rend l'installation décrite par le
 * rapport. D'où des objets distincts pour les appareils, les anomalies, les
 * points non vérifiés et les constatations — jamais un compteur qui les résume.
 */

/** Les quatre niveaux de la norme NF P 45-500. `32c` ne se confond avec aucun. */
export type NiveauAnomalie = 'A1' | 'A2' | 'DGI' | '32c';

/**
 * Une mesure de monoxyde a TROIS états, et le rapport les distingue lui-même.
 * Les fondre serait présenter un test non réalisé comme satisfaisant — c'est
 * l'interdit le plus dur de l'ordre de mission.
 */
export type MesureCO =
  /** Une valeur écrite. `valeur` est recopiée telle quelle : « 0 ppm », « >30 ppm ». */
  | { etat: 'mesurée'; valeur: string }
  /** Le rapport écrit que la mesure n'a pas été faite. */
  | { etat: 'non réalisée' }
  /** Rien n'est écrit. Ce n'est ni une mesure, ni un refus de mesure. */
  | { etat: 'non renseignée' };

export interface AppareilGaz {
  /** Genre, marque et modèle tels qu'écrits — jamais normalisés. */
  designation: string;
  /** « Raccordé », « Non raccordé », « Étanche ». */
  type: string | null;
  puissance: string | null;
  /** « RDC - Cuisine », « Rez de chaussée - Cellier »… tel quel. */
  localisation: string | null;
  co: MesureCO;
  /** Tout ce que la colonne d'observations porte, ligne par ligne. */
  observations: string[];
  source: string;
}

export interface AnomalieGaz {
  /** Le code du point de contrôle, tel qu'écrit : « 8a1 », « K », « C.7 - 8a1 ». */
  code: string;
  niveau: NiveauAnomalie | null;
  libelle: string;
  /**
   * L'appareil concerné — `null` quand le format ne le rattache pas de façon
   * fiable. Chez LICIEL le rattachement se lit à la géométrie des colonnes, que
   * du texte aplati ne conserve pas : on préfère `null` à un rattachement
   * deviné, car rattacher au mauvais appareil est explicitement interdit.
   */
  appareil: string | null;
  source: string;
}

/** Une pièce ou un volume que l'opérateur n'a pas pu contrôler. */
export interface ZoneNonControlee {
  zone: string;
  motif: string | null;
  source: string;
}

/** Un point de contrôle que l'opérateur n'a pas pu réaliser, et pourquoi. */
export interface PointNonVerifie {
  appareil: string | null;
  point: string;
  motif: string | null;
  source: string;
}

/**
 * La conclusion, et surtout : est-elle lisible ?
 *
 * Chez LICIEL, les cinq réponses possibles sont imprimées l'une sous l'autre et
 * la réponse est une case cochée, absente du texte extrait. Rendre `lisible:
 * false` n'est pas un échec du lecteur : c'est la seule réponse honnête, et
 * elle empêche d'annoncer « aucune anomalie » sur un rapport qui porte un DGI.
 */
export type ConclusionGaz =
  | { lisible: true; texte: string; source: string }
  | { lisible: false; pourquoi: string };

export interface LectureGaz {
  /** « OUI » / « NON » — décide de ce que les essais pouvaient donner. */
  alimentee: 'OUI' | 'NON' | null;
  natureGaz: string | null;
  appareils: AppareilGaz[];
  anomalies: AnomalieGaz[];
  zonesNonControlees: ZoneNonControlee[];
  pointsNonVerifies: PointNonVerifie[];
  constatations: string[];
  conclusion: ConclusionGaz;
}

/** Les cinq phrases du formulaire, imprimées dans TOUS les rapports. */
const PHRASES_DU_FORMULAIRE = [
  /ne comporte aucune anomalie/i,
  /anomalies de type A1/i,
  /anomalies de type A2/i,
  /anomalies de type DGI/i,
  /anomalie 32c/i
];

/**
 * Vraie quand la ligne est une des cinq réponses pré-imprimées.
 *
 * Mesuré le 21/08/2026 : ces cinq phrases sont présentes dans 32 volets sur 32,
 * chez les deux éditeurs. Elles ne constatent jamais rien, nulle part — c'est
 * le modèle réglementaire qui les imprime, pas le diagnostiqueur qui les écrit.
 */
export function estUnePhraseDuFormulaire(ligne: string): boolean {
  return PHRASES_DU_FORMULAIRE.some((p) => p.test(ligne));
}

/** Le niveau cité par une ligne, s'il y en a un et un seul. */
export function niveauDe(ligne: string): NiveauAnomalie | null {
  const cites: NiveauAnomalie[] = [];
  if (/\b32c\b/i.test(ligne)) cites.push('32c');
  if (/\bDGI\b/.test(ligne)) cites.push('DGI');
  if (/\bA1\b/.test(ligne)) cites.push('A1');
  if (/\bA2\b/.test(ligne)) cites.push('A2');
  /*
   * Plusieurs niveaux sur une même ligne, c'est la légende de colonne ou une
   * note de bas de tableau — jamais un constat. On ne tranche pas : on rend
   * `null`, et la ligne sera écartée par le lecteur.
   */
  return cites.length === 1 ? (cites[0] ?? null) : null;
}
