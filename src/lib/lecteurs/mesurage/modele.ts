/**
 * CE QU'UN LECTEUR DE MESURAGE REND — commun à tous les formats.
 *
 * Ordre d'Aude, 22/08/2026 : « liseuse mesurage (Carrez / Boutin / référence) ».
 * Le modèle est dicté par ce qui a été lu dans 18 volets entiers
 * (`docs/OU-PARSER-MESURAGE.md`), et par une contrainte simple :
 *
 * **on ne rend pas « surface : 42 m² ».** Un mesurage n'est pas un nombre, c'est
 * une pièce juridique qui dit quelle loi elle sert, quelles pièces ont été
 * mesurées, lesquelles ne comptent pas et pourquoi, lesquelles n'ont pas été
 * visitées du tout, et ce que la mission n'a pas pu vérifier.
 */

/**
 * La loi que sert le document — et ce ne sont pas les mêmes règles.
 *
 * La **Carrez** (art. 46 de la loi 65-557, décret 67-223 art. 4-1) donne la
 * superficie privative d'un lot de copropriété : elle est due à la **vente**.
 * La **Boutin** (art. 3 de la loi 89-462, CCH R.111-2) donne la surface
 * habitable : elle est due à la **location**.
 *
 * Elles ne comptent pas la même chose — combles non aménagés, greniers et
 * vérandas de plus d'1,80 m entrent dans la Carrez et pas dans la Boutin.
 * Annoncer la mauvaise, c'est présenter la pièce d'une vente à quelqu'un qui
 * tient celle d'une location.
 */
export type Loi = 'carrez' | 'boutin';

/**
 * Une surface : le nombre ET les mots qui l'introduisent.
 *
 * `libelle` est recopié tel quel — « Surface loi Carrez totale », « La
 * superficie privative (Loi Carrez) est », « Superficie HSP < 1.80M ». C'est ce
 * qui permet de citer le rapport au lieu de le reformuler, et c'est la seule
 * façon de ne pas prêter à un chiffre un sens que son éditeur ne lui donne pas.
 */
export interface Surface {
  /** En mètres carrés. Point comme virgule décimale sont acceptés à la lecture. */
  valeur: number;
  /** L'intitulé du rapport, mot pour mot, sans le nombre. */
  libelle: string;
  /** La ligne d'où la valeur sort, pour que tout soit vérifiable. */
  source: string;
}

/**
 * Une pièce du tableau.
 *
 * `retenue` est la surface qui compte au titre de la loi du document — et elle
 * vaut **0** pour une terrasse, une cave, un cellier occupé par un chauffe-eau.
 * Zéro n'est pas une absence de mesure : c'est un refus de compter, motivé, et
 * c'est l'information la plus utile du document. `autres` porte les colonnes
 * supplémentaires du format, chacune avec son intitulé exact : LICIEL en a une
 * (« Surface au sol »), BC2E en a deux.
 */
export interface PieceMesuree {
  /** « R+2 - Séjour / Cuisine », « Cuisine » — tel qu'écrit. */
  nom: string;
  /** L'étage, quand le format le tient dans une colonne à part (BC2E). */
  niveau: string | null;
  retenue: number;
  autres: { libelle: string; valeur: number }[];
  /** Le commentaire de la ligne, recollé quand il enjambe. */
  commentaire: string | null;
  source: string;
}

/**
 * Une pièce que l'opérateur n'a pas visitée.
 *
 * ⚠️ Ce n'est PAS une pièce de 0 m². Une pièce à 0 a été mesurée et écartée ;
 * une pièce non visitée n'a pas été mesurée du tout, et la surface annoncée ne
 * la contient pas. Confondre les deux, c'est faire passer un manque pour une
 * décision.
 */
export interface PieceNonVisitee {
  designation: string;
  /** « Absence de trappe de visite / Mansarde » — le motif, quand il est écrit. */
  motif: string | null;
  source: string;
}

/**
 * Une rubrique qui peut dire « rien », dire quelque chose, ou ne pas exister.
 *
 * Trois états, jamais deux. « Néant » est une réponse de l'opérateur : la
 * rubrique a été remplie, et elle dit qu'il n'y a rien. Une rubrique absente
 * n'est pas une réponse — et la rendre comme un « rien » transformerait un
 * silence en bonne nouvelle.
 */
export type Rubrique<T> =
  | { etat: 'néant'; source: string }
  | { etat: 'renseignée'; valeur: T }
  | { etat: 'non renseignée' };

export interface LectureMesurage {
  loi: Loi;
  /**
   * L'intitulé complet du document, mot pour mot : « Certificat de superficie de
   * la partie privative », « Attestation de Surface Habitable "Loi Boutin" ».
   * C'est lui qui a nommé la loi, et il doit rester citable.
   */
  intitule: string;
  /**
   * La surface due par la loi — celle qui s'écrira dans l'acte ou dans le bail.
   *
   * `null` quand elle n'a pas été lue. Ce n'est jamais 0 : une surface légale
   * absente est un défaut de lecture, pas un logement sans surface.
   */
  surfaceLegale: Surface | null;
  /**
   * Les autres totaux du document, avec leurs intitulés — « Surface au sol
   * totale », « Superficie HSP < 1.80M », « Surface totale au sol (Carrez et
   * Hors Carrez) ». On ne les additionne pas, on ne les moyenne pas : on les
   * nomme.
   */
  autresTotaux: Surface[];
  pieces: PieceMesuree[];
  /**
   * L'EN-TÊTE DE COLONNE DU RAPPORT pour la surface retenue — ses mots à lui.
   *
   * « Superficie privative au sens Carrez », « Superficie habitable ». Sans ce
   * champ, l'écran coiffait la colonne avec le libellé du TOTAL (« Surface loi
   * Carrez totale ») : un intitulé de total posé sur des valeurs pièce par
   * pièce, ce qui dit le contraire de ce que la colonne contient.
   *
   * `null` quand l'en-tête n'a pas été lu — on ne le devine pas.
   */
  colonneRetenue: string | null;
  piecesNonVisitees: Rubrique<PieceNonVisitee[]>;
  /** Rubrique propre à BC2E : « Particularités liées à ce mesurage : ». */
  particularites: Rubrique<string[]>;
  /**
   * Ce que la mission n'a pas pu vérifier, en clair et dans les mots du rapport
   * — « L'acte de propriété n'a pas été fourni. »
   *
   * Pour un acquéreur c'est la limite la plus concrète du document : la
   * consistance du lot n'a pas été contrôlée.
   */
  reserves: string[];
  dateVisite: string | null;
  dateRapport: string | null;
}

/**
 * L'écart entre la surface retenue et la plus grande des autres, en m².
 *
 * Ce ne sont pas des décimales de calcul : ce sont des pièces entières — une
 * terrasse, une cave, un cellier — qui existent, se visitent, et ne comptent
 * pas. `null` quand le document ne porte qu'un seul total : il n'y a alors rien
 * à comparer, et inventer un écart de 0 laisserait croire qu'on a vérifié.
 */
export function ecartNonCompte(lecture: LectureMesurage): number | null {
  if (!lecture.surfaceLegale || !lecture.autresTotaux.length) return null;
  const plusGrand = Math.max(...lecture.autresTotaux.map((s) => s.valeur));
  if (plusGrand <= lecture.surfaceLegale.valeur) return null;
  return Math.round((plusGrand - lecture.surfaceLegale.valeur) * 100) / 100;
}

/** Les pièces mesurées et écartées : celles dont la surface retenue vaut 0. */
export function piecesEcartees(lecture: LectureMesurage): PieceMesuree[] {
  return lecture.pieces.filter((p) => p.retenue === 0);
}

/**
 * Lit un nombre français ou anglais : « 42,47 », « 60.72 », « 1 205,3 ».
 *
 * Les deux séparateurs décimaux vivent dans le corpus — LICIEL est passé du
 * point à la virgule entre 2022 et 2024, et BC2E emploie le point. Rend `null`
 * plutôt que `NaN` : un `NaN` se propage en silence, un `null` se voit.
 */
export function nombre(texte: string | undefined | null): number | null {
  if (!texte) return null;
  const net = texte.replace(/\s| /g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(net)) return null;
  const n = Number(net);
  return Number.isFinite(n) ? n : null;
}
