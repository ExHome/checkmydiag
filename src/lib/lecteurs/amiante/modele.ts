/**
 * CE QU'UN CONSTAT AMIANTE PORTE — le modèle commun aux lecteurs d'éditeurs.
 *
 * *Un lecteur par éditeur (`socle.ts`) : chacun lit SON format, et tous
 * rendent cette même forme. C'est elle qui permet à l'écran de ne pas savoir
 * quel logiciel a produit le rapport.*
 *
 * ⚠️ **Trois issues, jamais deux.** Mesuré sur 130 volets lus en entier les 21
 * et 22/08/2026 : sur les dix-huit volets qui ne sont pas un simple négatif,
 * près de quatre sur dix **ne tranchent pas** — prélèvements à faire, ou
 * résultats de laboratoire attendus. Un modèle à deux états forcerait le
 * lecteur à ranger ces dossiers du mauvais côté.
 */

/** Ce que le constat établit, globalement. */
export type IssueAmiante = 'presence' | 'absence' | 'nonConclu';

/**
 * Sur quoi une conclusion repose, dans les mots du rapport.
 *
 * Six valeurs rencontrées, et elles ne se valent pas : un jugement d'opérateur
 * n'est pas une analyse de laboratoire, et « sur anciennes analyses » s'appuie
 * sur une pièce que le rapport ne joint pas.
 */
export type Justification =
  | 'jugement de l’opérateur'
  | 'analyse en laboratoire'
  | 'anciennes analyses'
  | 'document consulté'
  | 'marquage du matériau'
  | 'non prélevé'
  | 'résultats attendus'
  | 'non précisée';

/** Un matériau, tel que le rapport le décrit. */
export interface MateriauAmiante {
  /** La désignation, mot pour mot. */
  readonly quoi: string;
  /** Les localisations, mot pour mot, jamais recollées. */
  readonly ou: readonly string[];
  readonly issue: IssueAmiante;
  readonly justification: Justification;
  /** L'état de conservation quand le rapport en porte un. */
  readonly etat?: string;
  /** Le résultat de cotation : `EP`, `AC1`, `AC2`, `Score 1|2|3`. */
  readonly cotation?: string;
  /** La suite prévue, mot pour mot. */
  readonly suite?: string;
}

/** Un local ou un composant que le repérage n'a pas pu examiner. */
export interface LimiteAmiante {
  readonly quoi: string;
  readonly ou?: string;
  /** La raison, quand le rapport la donne. Jamais inventée. */
  readonly pourquoi?: string;
}

/**
 * La mission — elle commande la structure du rapport, et donc sa lecture.
 *
 * Quatre missions rencontrées, et elles ne partagent ni les mêmes textes, ni
 * les mêmes listes, ni la même numérotation de rubriques.
 */
export type MissionAmiante = 'vente' | 'DTA' | 'DAPP' | 'avant travaux' | 'inconnue';

export interface LectureAmiante {
  readonly mission: MissionAmiante;
  readonly issue: IssueAmiante;
  /** La phrase du rapport qui statue, entière. */
  readonly phrase: string;
  readonly materiaux: readonly MateriauAmiante[];
  /**
   * Les locaux non examinés.
   *
   * `lue: false` veut dire « la rubrique n'a pas été trouvée », jamais « tout
   * a été visité ». `neant: true` veut dire que la rubrique existe et répond
   * « Néant » — c'est une réponse, et elle n'est pas la même chose.
   */
  readonly limites: {
    readonly lue: boolean;
    readonly neant: boolean;
    readonly entrees: readonly LimiteAmiante[];
  };
  /**
   * LE PÉRIMÈTRE RÉELLEMENT EXAMINÉ — les pièces que l'opérateur a visitées.
   *
   * *Le visuel du pack en fait un bloc à lui seul, « ÉLÉMENTS CONTRÔLÉS », et
   * le § 2 de l'ordre le rend obligatoire : « restituer les composants, zones,
   * locaux ou matériaux réellement examinés ».*
   *
   * ⚠️ **Ce n'est pas le § 5.0.2.** Ce tableau-là liste ce qui a été regardé en
   * liste A ou B, et sa colonne de conclusion porte aussi bien `Présence
   * d'amiante` que `Absence` : le compter, c'est annoncer de l'amiante à un
   * logement qui n'en a pas. Mesuré le 22/08 sur le corpus DGLM : il répond
   * `Néant -` dans les volets négatifs — donc précisément dans le cas que le
   * visuel met en scène. Le périmètre se lit au § 3.2.6, `Descriptif des pièces
   * visitées`, et c'est la seule rubrique qui dise ce qui a été VU.
   *
   * `lue: false` veut dire « la rubrique n'a pas été trouvée », jamais « rien
   * n'a été visité ». La liste vide et la rubrique absente ne se disent pas
   * pareil.
   */
  readonly perimetre: {
    readonly lue: boolean;
    readonly pieces: readonly string[];
    /**
     * LES COMPOSANTS RÉELLEMENT REGARDÉS — « Sol », « Mur », « Plafond »,
     * « Porte », « Conduits »…
     *
     * Ils vivent dans le second bloc du § 3.2.6, le tableau `Localisation |
     * Description` : chaque pièce y est décrite composant par composant
     * (`Sol : Parquet et Bois`, `Mur A, B, C, D : plâtre et Peinture`).
     *
     * ⚠️ C'est la seule donnée du rapport qui corresponde aux **familles
     * d'ouvrage** du visuel — Toiture, Façades, Revêtements, Conduits, Sols.
     * Les noms de pièces, eux, n'en disent rien : « RDC - Cuisine » ne dit pas
     * si l'on a regardé le sol ou le plafond.
     *
     * ⚠️ Et ce tableau **n'est pas un constat** : il dit de quoi les composants
     * sont faits, jamais s'ils contiennent de l'amiante. Le mot `Divers` y est
     * courant et ne signifie rien de plus que « non identifié ».
     */
    readonly composants: readonly string[];
  };
  /** Le laboratoire, quand un prélèvement a été analysé. */
  readonly laboratoire?: { readonly nom: string; readonly cofrac?: string };
}
