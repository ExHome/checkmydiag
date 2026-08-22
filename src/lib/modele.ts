/**
 * Modèle de données commun à tous les diagnostics.
 *
 * Un rapport déposé par le visiteur est presque toujours un « DDT » / « dossier
 * technique immobilier » : un seul PDF qui contient plusieurs diagnostics à la
 * suite. On produit donc une liste de `Diagnostic`, pas un objet unique.
 */
import type { Nature } from './analyse/nature';
import type { Generateur } from './atelier/editeur';
import type { LectureGaz } from './lecteurs/gaz/modele';

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

/* Type seul : la lecture vient des lecteurs par éditeur, pas du modèle. */
import type { LectureDpe } from './lecteurs/dpe';

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
      /**
       * Le bâtiment lu par le lecteur de SON éditeur — parois, équipements,
       * travaux, causes, contradictions.
       *
       * Absent quand aucune signature ne reconnaît le format : l'écran le dit
       * alors, plutôt que de montrer un bâtiment approximatif. C'est la
       * contrainte du 21/08/2026 — un lecteur par éditeur, choisi sur
       * signature — appliquée jusqu'à l'affichage.
       */
      lecture?: LectureDpe | null;
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
      /**
       * Le tableau pièce par pièce du certificat de superficie.
       *
       * `piecesMesurees()` le relevait déjà — nom, surface privative, surface
       * au sol — et l'analyse n'en gardait qu'un total (« Pièces hors
       * superficie »). Le détail était extrait puis jeté, alors que c'est la
       * seule partie du rapport qui explique l'écart entre les deux chiffres
       * annoncés.
       */
      genre: 'surfaces';
      pieces: { nom: string; privative: number; auSol: number }[];
      /** Les totaux du rapport, pour que la somme affichée soit vérifiable. */
      totalPrivative: number | null;
      totalAuSol: number | null;
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
  /**
   * LA LECTURE COMPLÈTE DU MESURAGE, quand un lecteur d'éditeur l'a produite.
   *
   * `faits` porte des couples libellé/valeur : il ne peut transporter ni le
   * commentaire qui explique pourquoi une terrasse compte 0 m², ni l'intitulé
   * exact dont sort chaque total, ni la ligne source de chacun. La mini-app
   * Mesurage en a besoin — l'ordre de mission du pack exige que **toute valeur
   * affichée soit auditable jusqu'à sa ligne dans le rapport**.
   *
   * Absent quand c'est le lecteur de repli qui a lu : on ne fabrique pas une
   * lecture riche à partir d'une lecture approchée.
   */
  mesurage?: import('./lecteurs/mesurage/modele').LectureMesurage;
  /**
   * LE CROQUIS DU LOGEMENT, et d'où il vient.
   *
   * Il ne se cherche pas dans le volet de mesurage — mesuré : celui-ci n'en
   * porte jamais, il dit seulement quand il n'y en a pas. Le dossier en porte
   * un, en annexe du repérage amiante. C'est donc `analyser()` qui le trouve,
   * sur le document entier, et l'accroche ici.
   *
   * Quatre états, jamais deux : voir `lecteurs/mesurage/croquis.ts`.
   */
  croquis?: import('./lecteurs/mesurage/croquis').Croquis;
  /**
   * LA TROISIÈME SURFACE — celle du DPE, lue sur SA page de garde.
   *
   * Ni la Carrez ni la Boutin. Un écart entre les trois n'est pas une erreur :
   * elles ne comptent pas la même chose. On les affiche côte à côte, nommées,
   * et on ne les moyenne jamais.
   */
  surfaceDeReference?: import('./lecteurs/mesurage/reference').SurfaceDeReference;
  /**
   * Les anomalies, une par une — chacune un objet complet au sens du §8 de
   * l'ordre de mission électricité.
   *
   * Les `faits` en donnent le compte et les localisations réunies ; ceci en
   * donne le détail, sans rien agréger. C'est ce qui permet d'afficher une
   * carte par anomalie, avec SES localisations et SON geste, plutôt qu'un
   * champ « Où » commun à toutes.
   */
  anomalies?: Anomalie[];
  /**
   * Les « Constatations diverses » du rapport termites — leur propre bloc.
   *
   * ⚠️ Ce n'est PAS un `Fait`. Un fait est un chiffre avec son libellé
   * (« 208 unités de diagnostic ») ; une constatation diverse est une PHRASE du
   * rapport, souvent longue, avec sa localisation. Versées dans `faits`, elles
   * s'affichaient en gros caractères à la place du chiffre dominant — illisibles,
   * et à la mauvaise place.
   *
   * L'ordre de mission termites (§ 19) leur donne un bloc à elles dans
   * l'architecture de l'écran, entre « Champignons / altérations » et « Zones
   * non examinées ». C'est ce champ.
   *
   * `lue: false` veut dire « le modèle de ce rapport n'est pas couvert, on n'a
   * pas su lire » — jamais « rien à signaler » (§ 15, § 24).
   */
  constatations?: {
    lue: boolean;
    /** La rubrique existe et répond « Néant ». Distinct de `lue: false`. */
    neant: boolean;
    entrees: { terme: string; ou?: string; nature: 'constat' | 'limite' }[];
  };
  /**
   * Les pièces que l'opérateur n'a PAS pu visiter — rubrique F du termites.
   *
   * ⚠️ « EXAMINÉ + ABSENCE D'INDICE » n'est pas « NON EXAMINÉ » (§ 15 de l'ordre
   * de mission termites). Et les pièces non visitées sont très majoritairement
   * les COMBLES : c'est-à-dire la charpente, l'endroit même où les termites se
   * voient. Un « absence d'indices » sans montée dans les combles ne vaut pas un
   * « absence d'indices » sur un bien entièrement regardé.
   *
   * `lue: false` veut dire « modèle non couvert, on n'a pas su lire » — jamais
   * « tout a été visité ».
   */
  nonVisitees?: {
    lue: boolean;
    /** La rubrique existe et répond « Néant » : tout a été visité. */
    neant: boolean;
    pieces: { terme: string; ou: string; pourquoi: string }[];
    /** Les combles, la charpente, le grenier ou la toiture en font-ils partie ? */
    charpente: boolean;
  };
  /**
   * Les OUVRAGES non examinés — rubrique G du termites.
   *
   * F dit quelles pièces n'ont pas été visitées ; G dit ce qui, dans les pièces
   * où l'opérateur est entré, n'a pas pu être regardé : les murs derrière un
   * doublage, la sous-face d'un parquet collé, le plancher sur solives sous un
   * carrelage.
   *
   * `separable: false` sur une entrée veut dire que le tableau du rapport n'a
   * pas pu être démêlé en colonnes — le texte est alors cité tel quel. C'est
   * assumé : un tableau inventé serait pire qu'un texte brut.
   */
  nonExamines?: {
    lue: boolean;
    neant: boolean;
    ouvrages: { terme: string; ou?: string; pourquoi?: string; separable: boolean }[];
    /** Le texte-type qui borne l'examen, quand le rapport l'imprime. */
    bornage?: string;
  };
  /**
   * LE PÉRIMÈTRE RÉELLEMENT EXAMINÉ — les pièces que l'opérateur a visitées.
   *
   * Le pendant de `nonVisitees` : l'une dit ce qui est resté fermé, l'autre ce
   * qui a été ouvert. Ensemble, elles disent ce que le constat couvre — et
   * c'est ce que le bloc « Éléments contrôlés » du visuel amiante affiche.
   *
   * `lue: false` veut dire « la rubrique n'a pas été trouvée », jamais « rien
   * n'a été visité ».
   */
  perimetre?: {
    lue: boolean;
    pieces: string[];
    /**
     * Les composants regardés — « Sol », « Mur », « Plafond », « Conduits »…
     *
     * C'est la seule donnée du rapport qui corresponde aux **familles
     * d'ouvrage** du visuel : un nom de pièce ne dit pas si l'on a regardé le
     * sol ou le plafond, « Sol : Carrelage » le dit.
     */
    composants?: string[];
  };
  /**
   * LE GAZ, TEL QUE SON LECTEUR D'ÉDITEUR L'A LU.
   *
   * Les champs génériques ci-dessus ne savent pas porter ce que l'état de
   * l'installation intérieure de gaz établit : les quatre niveaux de la norme
   * NF P 45-500, les points de contrôle non réalisés appareil par appareil, la
   * mesure de monoxyde et ses trois états. Aplatir tout cela dans `faits`
   * reviendrait à perdre ce que l'ordre de mission du 21/08/2026 interdit
   * précisément de perdre.
   *
   * ⚠️ `undefined` veut dire « aucun lecteur ne reconnaît ce format » — jamais
   * « rien à signaler ». Le gaz est le seul diagnostic qui peut faire couper
   * l'alimentation le jour même : l'écran doit pouvoir dire qu'il n'a pas su
   * lire, plutôt que d'afficher une installation vide.
   */
  gaz?: LectureGaz;
  /** Pages du PDF où se trouve ce diagnostic (1-indexé). */
  pages: [number, number];
  /** Numéros de toutes les pages du diagnostic, pour les faire défiler. */
  feuillets?: number[];
  /** Date de réalisation, au format JJ/MM/AAAA, si elle a été lue. */
  date?: string;
  /**
   * La fin de validité telle que le RAPPORT l'écrit, quand il l'écrit.
   *
   * Elle prime sur toute durée calculée. Mesuré le 21/08/2026 sur 200 constats
   * plomb : le calcul « douze mois » tombait juste sur les 83 rapports de vente
   * et se trompait de cinq ans sur les 29 rapports de location, qui valent six
   * ans (article R. 1334-11 du code de la santé publique). Le rapport, lui,
   * donne la date exacte — « durée de validité de 1 an (jusqu'au 14/09/2026) ».
   *
   * `sansLimite` porte l'autre réponse du même endroit : « il n'y a pas lieu de
   * faire établir un nouveau constat ». `terme` garde la phrase du rapport,
   * entière — on cite, puis on explique.
   */
  validiteLue?: { jusquAu?: string; sansLimite?: boolean; terme: string };
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
  /**
   * Les travaux que le DPE recommande, tels qu'il les écrit.
   *
   * Le type complet vit dans `analyse/reco.ts` ; on le garde souple ici pour la
   * même raison que les repères — le modèle ne dépend pas de l'extraction.
   *
   * Rien n'y est calculé : ni classe future promise, ni économies annoncées, ni
   * addition de gains de travaux indépendants. Ce sont les mots du rapport, et
   * le montant est celui qu'il imprime.
   */
  travaux?: {
    rang: 1 | 2;
    intitule: string;
    cout?: { de: number; a: number; statut: string };
    recommandations: { lot: string; description: string; performance?: string; statut: string }[];
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
  /**
   * La désignation du lot : bâtiment, étage, porte, numéro de lot.
   *
   * Premier repère notarial — un rapport qui décrit le mauvais lot ne vaut
   * rien, quelle que soit sa qualité par ailleurs. Les soixante-dix dossiers
   * mesurés la portent tous ; le lecteur n'en disait rien.
   */
  lot?: string;
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
   * QUI A PRODUIT LE DOCUMENT — la première question, avant toute lecture.
   *
   * « L'éditeur conditionne le formalisme. L'éditeur conditionne tout. »
   *
   * Ce n'est pas une information de plus : c'est ce qui dit quelle carte de
   * lecture appliquer. Une mise en page mesurée sur cent rapports d'un même
   * générateur n'est pas une règle du métier — c'est l'habitude d'un logiciel,
   * et le lecteur qui la généralise se trompe partout ailleurs.
   *
   * Vérifié en vrai, sur le CREP : la réponse OUI/NON des cinq situations
   * termine la première ligne du libellé chez un éditeur, et occupe une ligne à
   * elle seule chez un autre. Appliquer la mauvaise carte fait lire un NON là
   * où le rapport dit OUI — sur une situation de saturnisme infantile.
   *
   * `null` quand rien ne le nomme : on ne devine pas.
   */
  generateur: Generateur | null;
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

/** L'étendue que le rapport donne à une anomalie, dans ses propres mots. */
/**
 * L'étendue que le rapport donne à une anomalie, dans ses propres mots.
 *
 * `'un'` s'ajoute pour l'amiante, où le rapport désigne UN élément précis et
 * localisé — « Flocages, sous-sol » — là où l'électricité écrit presque
 * toujours « au moins un ». Les deux sont des faits du rapport, pas des
 * interprétations : l'un dit « celui-ci », l'autre « il y en a au moins un, il
 * peut y en avoir d'autres ». Les confondre perdrait précisément la nuance que
 * le § 9 de l'ordre de mission protège.
 */
export type Pluralite = 'un' | 'auMoinsUn' | 'ensemble' | 'inconnue';

/**
 * Une anomalie électrique, objet complet au sens du §8 de l'ordre de mission.
 *
 * « B3 — anomalie terre » est expressément déclaré insuffisant. Neuf champs
 * sont exigés ; ceux qui manquent dans le rapport valent « non précisé », et
 * jamais « aucun » : le §2 interdit de transformer un silence en constat.
 *
 * La mesure compensatoire est portée ICI, par l'anomalie — et non par le
 * domaine, comme elle l'était. Un domaine qui compte trois anomalies dont une
 * seule est compensée les marquait toutes les trois. Le §14 exige le
 * rattachement un à un.
 */
export interface Anomalie {
  /** Le code de la norme quand le rapport l'écrit. LICIEL n'en écrit pas. */
  code: string | null;
  /** La famille de sécurité dont relève l'anomalie. */
  domaine: { numero: number; nom: string } | null;
  /** Le libellé du rapport, repris mot pour mot. */
  libelle: string;
  /** TOUTES les localisations données, jamais une seule (§10). */
  localisations: string[];
  /** « Au moins un socle… » n'est pas « le socle » (§9). */
  pluralite: Pluralite;
  /**
   * La mesure compensatoire, rattachée à l'anomalie qu'elle compense.
   *
   * `null` signifie « non précisé par le rapport », jamais « aucune » — et une
   * mesure présente ne fait pas disparaître l'anomalie (§12, §13, §15).
   */
  mesureCompensatoire: { code: string | null; libelle: string } | null;
  /** Le geste demandé, dans les mots du rapport. */
  geste: string | null;
}
