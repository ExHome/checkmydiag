/**
 * Modèle de données commun à tous les diagnostics.
 *
 * Un rapport déposé par le visiteur est presque toujours un « DDT » / « dossier
 * technique immobilier » : un seul PDF qui contient plusieurs diagnostics à la
 * suite. On produit donc une liste de `Diagnostic`, pas un objet unique.
 */

export type TypeDiag =
  | 'dpe'
  | 'amiante'
  | 'plomb'
  | 'electricite'
  | 'gaz'
  | 'termites'
  | 'erp'
  | 'carrez'
  | 'assainissement';

/** Ce que le lecteur doit ressentir en un coup d'œil. */
export type Gravite = 'bon' | 'attention' | 'alerte' | 'neutre';

export interface Fait {
  libelle: string;
  valeur: string;
  /** Précision affichée en petit sous la valeur. */
  precision?: string;
}

/** Lettre réglementaire A→G (DPE, GES). */
export type Lettre = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface Etiquette {
  lettre: Lettre;
  valeur: number;
  unite: string;
  /** true quand la lettre a été recalculée faute d'être lisible dans le PDF. */
  recalculee: boolean;
}

/** Ce que le rapport dit de l'isolation d'une paroi. */
export type EtatIsolation = 'isole' | 'nonIsole' | 'inconnu';

export interface Isolation {
  murs: EtatIsolation;
  toit: EtatIsolation;
  plancher: EtatIsolation;
  fenetres: EtatIsolation;
}

export type Schema =
  | {
      genre: 'dpe';
      energie: Etiquette | null;
      climat: Etiquette | null;
      /** Classe finale au double seuil énergie/climat. */
      finale: Lettre | null;
      postes: { nom: string; kwh: number; cout?: string }[];
      /** État d'isolation relevé dans le rapport, paroi par paroi. */
      isolation: Isolation;
    }
  | {
      genre: 'plomb';
      /** Nombre d'unités de diagnostic par classe 0 → 3. */
      classes: [number, number, number, number];
      nonMesurees: number;
      total: number;
    }
  | {
      genre: 'pieces';
      /** Une case par pièce ou zone contrôlée. */
      zones: { nom: string; etat: Gravite; detail?: string }[];
    }
  | {
      genre: 'risques';
      risques: { nom: string; niveau: Gravite; detail?: string }[];
    }
  | {
      genre: 'anomalies';
      /** Points de contrôle en anomalie, regroupés par thème. */
      groupes: { nom: string; nombre: number }[];
      total: number;
    };

export interface Diagnostic {
  type: TypeDiag;
  /** Titre affiché, en français courant. */
  titre: string;
  /** Le verdict en une phrase, à hauteur de particulier. */
  verdict: string;
  gravite: Gravite;
  /** Chiffres clés extraits du rapport. */
  faits: Fait[];
  /**
   * L'image du quotidien qui fait tout comprendre d'un coup. Affichée en tête,
   * avant les chiffres : c'est elle qui donne envie de lire la suite.
   */
  analogie?: string;
  /** Ce que ça veut dire concrètement (2-4 paragraphes). */
  explication: string[];
  /** Ce que ça implique pour le propriétaire / l'acheteur. */
  aFaire: string[];
  schema: Schema | null;
  /** Pages du PDF où se trouve ce diagnostic (1-indexé). */
  pages: [number, number];
  /** Date de réalisation, au format JJ/MM/AAAA, si elle a été lue. */
  date?: string;
  /**
   * Passages du rapport à montrer du doigt, avec leur explication. Le type
   * complet vit dans analyse/reperes.ts ; on le garde souple ici pour ne pas
   * faire dépendre le modèle de l'extraction.
   */
  reperes?: {
    page: number;
    x: number;
    y: number;
    largeur: number;
    hauteur: number;
    titre: string;
    texte: string;
    extrait: string;
  }[];
  /**
   * Renseigné quand le verdict vient de la page de synthèse du dossier et non
   * du rapport détaillé : le lecteur a le droit de savoir d'où sort la phrase.
   */
  source?: 'synthese';
}

export interface Bien {
  adresse?: string;
  commune?: string;
  typeBien?: string;
  anneeConstruction?: string;
  surface?: number;
  numeroDossier?: string;
  dateRepérage?: string;
}

/** Un point du dossier qui mérite d'être vérifié. */
export interface PointDeControle {
  /** Ce qui cloche, en une ligne. */
  titre: string;
  /** Pourquoi ça compte, en français de tous les jours. */
  explication: string;
  /** Ce que le lecteur peut faire. */
  quoiFaire: string;
  genre: 'perime' | 'manque' | 'incoherence' | 'attention';
  /** Diagnostic concerné, quand il y en a un. */
  type?: TypeDiag;
}

export interface Analyse {
  bien: Bien;
  diagnostics: Diagnostic[];
  /**
   * Texte des pages qui portent des repères, indexé par numéro de page. Sert à
   * montrer le rapport même quand son image n'a pas pu être dessinée.
   */
  textePages: Record<number, string[]>;
  /** Contrôles automatiques sur la cohérence du dossier. */
  controles: PointDeControle[];
  /** Types repérés dans le sommaire mais non exploités par le moteur. */
  nonExploites: string[];
  /** Vrai si le PDF ne contenait quasiment aucun texte (rapport scanné/image). */
  illisible: boolean;
  nbPages: number;
}
