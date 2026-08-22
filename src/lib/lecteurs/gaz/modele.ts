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
  /**
   * L'année d'installation de l'appareil, telle qu'écrite — « 2012 ».
   *
   * ⚠️ Champ propre à LICIEL : présent dans 13 volets sur 26, et dans AUCUN des
   * 29 volets BC2E lus. `null` veut donc dire « non renseigné par ce rapport »,
   * jamais « appareil neuf » ni « âge inconnu du diagnostiqueur ».
   */
  annee: string | null;
  /**
   * L'entretien, tel que le rapport le coche : « Oui », « Non », « Sans objet ».
   *
   * Trois etats, jamais deux : « Sans objet » n'est pas « Non ». C'est un champ
   * du volet gaz — le seul jugement que ce diagnostic porte sur l'etat
   * d'entretien d'un appareil. Il ne dit rien de sa vetuste : le mot n'apparait
   * dans AUCUN des 55 volets lus.
   */
  entretienAppareil: string | null;
  entretienConduit: string | null;
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

/**
 * LE MOTEUR DE CONTRADICTIONS (§ 32-33 de l'ordre de mission).
 *
 * La synthèse n'écrase jamais le détail, et le détail ne fait pas taire la
 * synthèse : quand les deux se contredisent, on le DIT. Ce contrôle a été écrit
 * après qu'un volet dont la conclusion annonçait « une ou des anomalie(s) : A1 »
 * est ressorti avec zéro anomalie extraite — l'anomalie était perdue par le
 * lecteur, et rien ne le signalait.
 *
 * Il ne corrige pas la lecture : il la met en accusation. Une contradiction non
 * résolue doit remonter à l'écran, jamais être arbitrée en silence.
 */
export function contradictions(lecture: LectureGaz): string[] {
  const dits: string[] = [];
  const c = lecture.conclusion;
  const n = lecture.anomalies.length;

  if (c.lisible) {
    const annonceDesAnomalies = /comporte (?:une ou des|des|une) anomalie/i.test(c.texte);
    const annonceAucune = /ne comporte aucune anomalie/i.test(c.texte);
    if (annonceDesAnomalies && n === 0) {
      dits.push(
        `La conclusion du rapport annonce des anomalies — « ${c.texte} » — mais aucune n'a pu être extraite du tableau. Une anomalie est probablement perdue à la lecture.`
      );
    }
    if (annonceAucune && n > 0) {
      dits.push(
        `La conclusion du rapport annonce « aucune anomalie », mais ${n} anomalie(s) figurent au tableau. Le rapport se contredit, ou la lecture se trompe.`
      );
    }
  }

  /* Un appareil dont un point de contrôle n'a pas été vérifié n'est pas « vu ». */
  for (const p of lecture.pointsNonVerifies) {
    if (!p.appareil) continue;
    const cite = lecture.appareils.some((a) => a.designation.toLowerCase().includes(p.appareil!.toLowerCase()));
    if (cite && lecture.anomalies.length === 0 && lecture.conclusion.lisible) {
      dits.push(
        `Le point « ${p.point} » n'a pas été vérifié sur « ${p.appareil} » : l'absence d'anomalie ne vaut pas pour ce point.`
      );
      break;
    }
  }

  /*
   * ⚠️ Le rapport peut se contredire LUI-MÊME sur l'alimentation.
   *
   * Relevé sur un volet réel : la rubrique A porte « Installation alimentée en
   * gaz : OUI », et les constatations diverses écrivent « Le compteur de Gaz a
   * été déposé. En l'absence de Gaz dans l'installation, les essais […] n'ont
   * pas pu être effectués. » Les deux ne peuvent pas être vraies.
   *
   * On ne tranche pas : on signale. Suivre la rubrique A seule ferait présenter
   * comme essayée une installation qui ne l'a pas été.
   */
  const dementiAlimentation = lecture.constatations.find((c) =>
    /(?:absence de gaz|compteur (?:de gaz )?(?:a été )?déposé|gaz (?:a été )?coup[ée])/i.test(c)
  );
  if (lecture.alimentee === 'OUI' && dementiAlimentation) {
    dits.push(
      `Le rapport se contredit sur l'alimentation : la rubrique A la déclare alimentée, et les constatations diverses écrivent « ${dementiAlimentation.slice(0, 110)}… ». Les essais n'ont donc peut-être pas été réalisés.`
    );
  }

  /*
   * La contradiction F / G : la rubrique des parties non contrôlées porte
   * « Néant », et les constatations diverses annoncent que des points n'ont pas
   * pu être contrôlés. Les deux ne peuvent pas être vraies.
   */
  const dementiControle = lecture.constatations.find((c) =>
    /certains points de contr[ôo]les? n['’]ont? pu [êe]tre contr[ôo]l/i.test(c)
  );
  if (dementiControle && lecture.zonesNonControlees.length === 0 && lecture.pointsNonVerifies.length === 0) {
    dits.push(
      "Le rapport annonce en constatations diverses que certains points n'ont pas pu être contrôlés, mais ne les liste nulle part. Les rubriques prévues pour cela sont vides."
    );
  }

  /* Une installation non alimentée ne permet aucun essai : le dire. */
  if (lecture.alimentee === 'NON' && lecture.anomalies.length === 0) {
    dits.push(
      "L'installation n'était pas alimentée en gaz : les essais n'ont pas pu être réalisés. L'absence d'anomalie constatée ne vaut pas installation saine."
    );
  }

  return dits;
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
