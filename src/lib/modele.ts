/**
 * Modèle de données commun à tous les diagnostics.
 *
 * Un rapport déposé par le visiteur est presque toujours un « DDT » / « dossier
 * technique immobilier » : un seul PDF qui contient plusieurs diagnostics à la
 * suite. On produit donc une liste de `Diagnostic`, pas un objet unique.
 */
import type { Nature } from './analyse/nature';

export type { Nature };

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
      /** Où se trouve le plomb qui compte, pièce par pièce. */
      emplacements: { zone: string; element: string; classe: number }[];
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
  /**
   * La démarche qu'on peut faire tout de suite, sur un site officiel.
   *
   * Rare, et c'est voulu : il n'y en a qu'une quand une réforme permet de faire
   * rééditer une étiquette. Noyée dans un paragraphe, cette adresse ne serait
   * jamais suivie ; en bouton, elle se voit.
   */
  demarche?: {
    /** Le libellé du bouton, à la deuxième personne. */
    texte: string;
    url: string;
    /** Ce qu'il faut avoir sous la main avant de cliquer. */
    quoiEmporter?: string;
  };
  schema: Schema | null;
  /** Pages du PDF où se trouve ce diagnostic (1-indexé). */
  pages: [number, number];
  /** Numéros de toutes les pages du diagnostic, pour les faire défiler. */
  feuillets?: number[];
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
    /** Identifiant du petit dessin qui illustre la notion. */
    schema?: string;
    points: string[];
    /** Questions que le lecteur peut ouvrir sans quitter le passage. */
    suites?: { question: string; ton?: 'bon' | 'moyen' | 'mauvais'; points: string[] }[];
    /** Ce que dit la ligne : bonne nouvelle, à regarder, ça coince, donnée. */
    ton?: 'bon' | 'moyen' | 'mauvais' | 'info';
    /** Constat du diagnostic, donnée du dossier, ou mot du métier. */
    famille?: 'constat' | 'donnee' | 'mot';
    /** « Chez vous, en pratique, c'est ça. » */
    pratique?: string;
    extrait: string;
  }[];
  /**
   * Renseigné quand le verdict vient de la page de synthèse du dossier et non
   * du rapport détaillé : le lecteur a le droit de savoir d'où sort la phrase.
   */
  source?: 'synthese';
  /**
   * D'où vient ce verdict : lu au rapport, repris de la synthèse, recalculé,
   * ou pas lisible du tout. Calculé en fin d'analyse (`analyse/confiance.ts`).
   * C'est ce qui empêche d'écrire « le rapport dit » au-dessus d'une déduction.
   */
  origine?: 'rapport' | 'synthese' | 'calcul' | 'illisible';
  /**
   * Tout ce que le rapport signale, un point par entrée : anomalies, mais
   * aussi ce qui n'a pas pu être visité ou vérifié.
   *
   * Exhaustif par construction — si le rapport en liste dix-sept, il y en a
   * dix-sept ici. Rien n'est trié par intérêt : l'affichage hiérarchise, le
   * modèle n'omet pas.
   */
  releves?: {
    libelle: string;
    code?: string;
    ou?: string;
    genre: 'anomalie' | 'nonVisite' | 'nonVerifie' | 'complement';
  }[];
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
  /**
   * De quel document il s'agit — dossier de vente, DTG, PPPT, DTA, repérage
   * avant travaux. C'est la première question d'un professionnel, et elle
   * commande tout le reste : un repérage avant travaux relève du code du
   * travail et ne vaut pas pour une vente, même s'il porte le même intitulé de
   * mission qu'un repérage de vente.
   */
  nature: Nature;
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
  /**
   * Part de ce qui a été réellement lu, de 0 à 1. Sert à surveiller le moteur
   * — « part des extractions à faible confiance » — jamais à juger le logement.
   */
  confiance: number;
}
