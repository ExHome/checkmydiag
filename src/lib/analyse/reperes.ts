/**
 * Montrer du doigt.
 *
 * Le lecteur a son rapport sous les yeux : plutôt que de lui servir un cours à
 * côté, on pointe la ligne qui compte et on l'explique. Les coordonnées viennent
 * de l'extraction du texte : on sait où chaque phrase se trouve sur la page.
 *
 * Les explications sont des puces, pas des paragraphes : trois ou quatre mots
 * par ligne, ce qui compte et rien d'autre.
 */
import type { PageTexte } from '../lignes';
import type { TypeDiag } from '../modele';
import { GLOSSAIRE } from './glossaire';

export interface Repere {
  /** Page du PDF où poser le repère (1-indexé). */
  page: number;
  /** Emplacement de la ligne, en unités PDF (origine en bas à gauche). */
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
  titre: string;
  /** Identifiant du petit dessin qui illustre la notion. */
  schema?: string;
  /** L'explication, en puces courtes. */
  points: string[];
  /** Ce qu'on peut demander ensuite, sans quitter le passage. */
  suites?: Suite[];
  /** Bonne nouvelle, à regarder, ça coince, ou simple donnée. */
  ton?: Ton;
  /** Constat du diagnostic, donnée du dossier, ou mot du métier. */
  famille?: Famille;
  /** « Chez vous, en pratique, c'est ça. » Toujours présente. */
  pratique?: string;
  /** La ligne du rapport elle-même : sert à la retrouver dans le texte. */
  extrait: string;
}

/**
 * Une question que le lecteur se pose en lisant l'explication.
 *
 * Le `ton` reprend l'échelle de couleurs du DPE, que tout le monde a déjà en
 * tête : vert pour la bonne nouvelle, jaune pour l'incertain, rouge pour la
 * mauvaise. Pas besoin d'apprendre un nouveau code.
 */
export interface Suite {
  question: string;
  ton?: 'bon' | 'moyen' | 'mauvais';
  points: string[];
}

/**
 * La couleur d'un repère vient de ce que dit la ligne, pas de sa place dans la
 * page : vert quand c'est une bonne nouvelle, orange quand il faut regarder,
 * rouge quand ça coince, or quand c'est une donnée neutre — un numéro, une date.
 */
export type Ton = 'bon' | 'moyen' | 'mauvais' | 'info';

/**
 * Trois familles, pour que le panneau tienne en trois lignes fermées : ce que
 * le diagnostic constate, les données du dossier, les mots du métier.
 */
export type Famille = 'constat' | 'donnee' | 'mot';

/** Testé en premier : « absence de mise à la terre » est une mauvaise nouvelle. */
const DIT_MAUVAIS =
  /non isol|d[ée]grad|anomalie|non conforme|infestation|amiante|classe\s*3|dangereu|absence de mise [àa] la terre|absence de liaison|fuite|à traiter|obligatoire/i;

const DIT_BON =
  /aucune anomalie|aucun indice|absence de|n[ée]ant|bon [ée]tat|non d[ée]grad|conforme|pas de |isol[ée]/i;

const DIT_MOYEN = /[àa] surveiller|non visit|non accessible|impossible|n.a pas pu|sous r[ée]serve/i;

export function tonDeLaLigne(texte: string): Ton {
  if (DIT_MOYEN.test(texte)) return 'moyen';
  if (DIT_MAUVAIS.test(texte)) return 'mauvais';
  if (DIT_BON.test(texte)) return 'bon';
  return 'info';
}

/**
 * La valeur que porte la ligne : ce qui suit le deux-points.
 *
 * « Type de bien : Appartement » → « Appartement ». C'est ce mot-là qu'il faut
 * répéter au lecteur : sans lui, l'explication redevient un cours.
 */
export function valeurDe(texte: string): string | null {
  const coupe = texte.split(/\s*:\s*/);
  if (coupe.length < 2) return null;
  const valeur = coupe.slice(1).join(' : ').trim();
  if (!valeur || valeur.length > 90) return null;
  return valeur;
}

/**
 * La phrase en italique qui suit chaque explication.
 *
 * Elle ne parle jamais de la règle : elle dit ce que ça change dans ce
 * logement-là, en reprenant la valeur écrite dans le rapport. Sans elle, on
 * retombe dans le cours.
 */
const PRATIQUE: Record<Ton, (v: string | null) => string> = {
  bon: (v) => (v ? `${v} → rien à faire, rien à négocier.` : 'Rien à faire, rien à négocier.'),
  moyen: (v) => (v ? `${v} → pas tranché, à faire préciser.` : 'Pas tranché, à faire préciser.'),
  mauvais: (v) => (v ? `${v} → ça coûte : travaux, loyer, ou prix.` : 'Ça coûte : travaux, loyer, ou prix.'),
  info: (v) => (v ? `${v} → c’est de là que part le calcul.` : 'C’est de là que part le calcul.')
};

export function pratiqueDe(ton: Ton, valeur: string | null): string {
  return PRATIQUE[ton](valeur);
}

interface Cible {
  motif: RegExp;
  titre: string;
  /** Identifiant du petit dessin qui illustre la notion. */
  schema?: string;
  points: string[];
  /** Ce qu'on peut demander ensuite, sans quitter le passage. */
  suites?: Suite[];
  /** Forcé quand la ligne seule ne suffit pas à trancher. */
  ton?: Ton;
  /**
   * Forcé pour les conclusions : leur ligne ressemble à une donnée neutre — un
   * titre de section — alors qu'elle ouvre le constat du diagnostic.
   */
  famille?: Famille;
  /**
   * « Chez vous, en pratique, c'est ça. » Reçoit la valeur lue sur la ligne,
   * pour que la phrase parle du logement et pas de la théorie.
   */
  pratique?: (valeur: string | null) => string;
}

/**
 * Les lignes qu'on retrouve dans tous les rapports, quel que soit le
 * diagnostic. Elles s'ajoutent aux cibles propres à chaque type : le lecteur
 * doit pouvoir toucher n'importe quelle donnée, pas seulement les grandes.
 */
const COMMUNES: Cible[] = [
  {
    motif: /Num[ée]ro de dossier/i,
    titre: 'Le numéro de dossier',
    points: [
      'La référence interne du diagnostiqueur',
      'À citer pour toute question ou réclamation',
      'Le même pour tous les diagnostics du dossier'
    ],
    pratique: (v) =>
      v ? `${v} → à citer pour toute réclamation.` : 'À citer pour toute réclamation.'
  },
  {
    motif: /Date du rep[ée]rage|Date de la visite/i,
    titre: 'La date de la visite',
    points: [
      'Le jour où le diagnostiqueur est venu',
      'C’est de là que court la validité',
      'Pas la date d’envoi du rapport'
    ],
    pratique: (v) =>
      v ? `${v} → la validité court à partir de ce jour.` : 'La validité court à partir de ce jour.'
  },
  {
    motif: /Norme m[ée]thodologique|selon la norme|NF\s*[XP]/i,
    titre: 'La méthode suivie',
    points: [
      'Chaque diagnostic a sa norme officielle',
      'Elle dit quoi contrôler, et comment',
      'Le diagnostiqueur ne peut pas s’en écarter'
    ],
    pratique: (v) =>
      v ? `${v} → c’est le mode d’emploi que le diagnostiqueur a suivi.` : 'C’est le mode d’emploi que le diagnostiqueur a suivi.'
  },
  {
    motif: /N°\s*de certification|Organisme de certification/i,
    titre: 'La certification',
    points: [
      'Le diagnostiqueur est certifié par un organisme agréé',
      'Certification à repasser tous les 5 à 7 ans',
      'Vérifiable sur l’annuaire officiel du ministère'
    ],
    pratique: (v) =>
      v ? `${v} → vérifiable sur l’annuaire du ministère.` : 'Vérifiable sur l’annuaire du ministère.'
  },
  {
    motif: /P[ée]rim[èe]tre de rep[ée]rage/i,
    titre: 'Ce qui a été regardé',
    points: [
      'Précise l’étendue de la visite',
      '« Sans démontage ni destruction » = à l’œil seulement',
      'Ce qui est fermé ou encombré n’a pas été vu'
    ],
    pratique: (v) =>
      v ? `${v} → hors de ce périmètre, rien n’a été contrôlé.` : 'Hors de ce périmètre, rien n’a été contrôlé.'
  },
  {
    motif: /R[ée]f[ée]rences cadastrales/i,
    titre: 'Les références cadastrales',
    points: [
      'L’identité officielle du terrain',
      'Section et numéro de parcelle',
      '« Non communiquées » est fréquent et sans gravité'
    ],
    pratique: (v) =>
      v ? `${v} → l’identité officielle du terrain, au cadastre.` : 'L’identité officielle du terrain, au cadastre.'
  },
  {
    motif: /Ann[ée]e de construction/i,
    titre: 'L’année de construction',
    points: ['C’est elle qui décide des diagnostics obligatoires'],
    suites: [
      {
        question: 'Pourquoi cette date compte ?',
        ton: 'moyen',
        points: [
          'Avant 1949 : peintures au plomb autorisées',
          'Avant 1997 : amiante autorisée',
          'Après 1997 : ni l’un ni l’autre'
        ]
      }
    ],
    pratique: (v) => {
      const annee = Number(v?.match(/\d{4}/)?.[0]);
      if (!annee) return 'C’est cette date qui décide des diagnostics obligatoires.';
      if (annee < 1949) return `${annee} → plomb ET amiante obligatoires.`;
      if (annee < 1997) return `${annee} → amiante obligatoire, plomb non.`;
      return `${annee} → ni plomb ni amiante : déjà interdits.`;
    }
  },
  {
    motif: /^Type de bien/i,
    titre: 'Le type de bien',
    points: ['Maison ou appartement — ça change la liste des diagnostics'],
    suites: [
      {
        question: 'Ça change quoi, concrètement ?',
        ton: 'moyen',
        points: [
          'Appartement : mesurage Carrez en plus',
          'Maison : audit énergétique pour vendre en F ou G',
          'Maison : quatre façades exposées au froid'
        ]
      }
    ],
    pratique: (v) =>
      /appart/i.test(v ?? '')
        ? 'Appartement → mesurage Carrez obligatoire.'
        : 'Maison → pas de Carrez, mais audit si F ou G.'
  }
];

const CIBLES: Partial<Record<TypeDiag, Cible[]>> = {
  dpe: [
    {
      motif: /émet\s*[\d\s.,]+\s*kg\s*de\s*CO/i,
      titre: 'Les émissions de CO₂',
      schema: 'co2',
      points: ['Le gaz rejeté pour chauffer le logement'],
      pratique: (v) =>
        v
          ? `${v} → deuxième note. On garde la pire des deux.`
          : 'Deuxième note du DPE. On garde la pire.',
      suites: [
        {
          question: 'Pourquoi deux notes ?',
          ton: 'moyen',
          points: [
            'Une pour ce qu’on consomme',
            'Une pour ce qu’on rejette',
            'La lettre affichée est la plus mauvaise des deux'
          ]
        },
        {
          question: 'Ça dépend de quoi ?',
          ton: 'bon',
          points: [
            'De l’énergie, pas de l’isolation',
            'Fioul et gaz : beaucoup',
            'Électricité et bois : très peu'
          ]
        },
        {
          question: 'Je peux la baisser ?',
          ton: 'mauvais',
          points: [
            'En changeant d’énergie, surtout',
            'Sortir du fioul fait gagner plusieurs lettres',
            'Isoler agit sur l’autre note'
          ]
        }
      ]
    },
    {
      motif: /entre\s*[\d\s.,]+\s*€\s*et\s*[\d\s.,]+\s*€\s*par an/i,
      titre: 'Le coût annoncé',
      schema: 'cout',
      points: ['Ce que le logement coûterait en énergie sur un an'],
      pratique: (v) =>
        v ? `${v} → un calcul, pas votre facture.` : 'Un calcul à 19 °C, pas votre facture.',
      suites: [
        {
          question: 'Ce sera ma facture ?',
          ton: 'mauvais',
          points: [
            'Non. C’est un calcul, pas un relevé',
            'Toutes les pièces à 19 °C',
            'Une occupation moyenne, pas la vôtre',
            'Un prix de l’énergie figé une fois par an'
          ]
        },
        {
          question: 'Qu’est-ce qui est compté ?',
          ton: 'bon',
          points: [
            'Oui : chauffage, eau chaude, refroidissement',
            'Oui : éclairage, ventilation',
            'Non : électroménager, télé, box, plaques'
          ]
        },
        {
          question: 'Pourquoi une fourchette ?',
          ton: 'moyen',
          points: [
            'Le prix de l’énergie bouge',
            'La borne basse : tarif le plus bas de l’année',
            'La haute : le plus élevé'
          ]
        },
        {
          question: 'Comment on l’a calculé ?',
          ton: 'bon',
          points: [
            'On prend la consommation calculée du logement',
            'On la multiplie par le prix de chaque énergie',
            'On additionne les cinq postes'
          ]
        }
      ]
    },
    {
      motif: /Surface\s+(?:de référence|habitable)/i,
      titre: 'La surface de référence',
      schema: 'surface',
      points: ['La surface chauffée du logement'],
      pratique: (v) =>
        v ? `${v} → c’est le diviseur de la note.` : 'C’est le diviseur de la note.',
      suites: [
        {
          question: 'Qu’est-ce qui compte dedans ?',
          ton: 'bon',
          points: [
            'Oui : pièces chauffées, couloirs, placards',
            'Non : garage, cave, combles perdus',
            'Non : balcon, terrasse, véranda non chauffée'
          ]
        },
        {
          question: 'À quoi elle sert ?',
          ton: 'moyen',
          points: [
            'On divise la consommation par elle',
            'Résultat : des kWh par m²',
            'C’est ce chiffre-là qui donne la lettre'
          ]
        },
        {
          question: 'Pourquoi elle diffère du Carrez ?',
          ton: 'moyen',
          points: [
            'Carrez : ce qu’on achète, sous 1,80 m exclu',
            'Ici : ce qu’on chauffe',
            'Deux chiffres différents, c’est normal'
          ]
        },
        {
          question: 'Comment on la calcule ?',
          ton: 'bon',
          points: [
            'On mesure chaque pièce chauffée au sol',
            'On additionne',
            'Murs et cloisons déduits'
          ]
        }
      ]
    },
    {
      motif: /non isol[ée]/i,
      titre: '« Non isolé »',
      points: [
        'Le diagnostiqueur n’a vu aucun isolant',
        'Deux explications possibles — touchez-les'
      ],
      suites: [
        {
          question: 'Il n’y a vraiment pas d’isolant',
          ton: 'mauvais',
          points: [
            'Fréquent avant 1975 : on ne posait rien',
            'C’est le premier poste de travaux à envisager',
            'Le toit d’abord, c’est le moins cher'
          ]
        },
        {
          question: 'Le diagnostiqueur n’a pas pu voir',
          ton: 'moyen',
          points: [
            'Un isolant derrière une cloison ne se voit pas',
            'Sans preuve, la règle l’oblige à écrire « non isolé »',
            'Le calcul retient alors le pire cas'
          ]
        },
        {
          question: 'J’ai les factures des travaux',
          ton: 'bon',
          points: [
            'Apportez-les au diagnostiqueur',
            'Factures, devis, photos de chantier : il peut les prendre en compte',
            'Le DPE est alors refait avec ces éléments',
            'Cela peut faire gagner une lettre entière'
          ]
        }
      ]
    },
    {
      motif: /N°\s*ADEME/i,
      titre: 'Le numéro ADEME',
      points: [
        'Enregistrement dans la base publique de l’État',
        'Prouve que le DPE existe officiellement',
        'Sans lui : aucune valeur'
      ],
      pratique: (v) =>
        v ? `${v} → sans ce numéro, le DPE n’a aucune valeur.` : 'Sans ce numéro, le DPE n’a aucune valeur.'
    },
    {
      motif: /[Vv]alable jusqu/i,
      titre: 'La date de fin',
      schema: 'validite',
      points: ['Un DPE vaut 10 ans', 'Après : à refaire pour vendre ou louer'],
      pratique: (v) =>
        v ? `${v} → après cette date, à refaire pour vendre ou louer.` : 'Après cette date, à refaire pour vendre ou louer.'
    }
  ],

  plomb: [
    {
      motif: /Total.*Non mesur.*Classe 0/i,
      titre: 'Le tableau qui résume tout',
      schema: 'classes',
      points: [
        'Seule la colonne « classe 3 » compte vraiment',
        'Classe 3 = peinture dégradée, qui fait de la poussière',
        'Classes 0, 1, 2 : aucune obligation',
        'Une seule classe 3 déclenche des travaux'
      ]
    },
    {
      motif: /classe 3/i,
      titre: 'Ce que déclenche une classe 3',
      points: [
        'Travaux obligatoires pour le propriétaire',
        'Occupants à prévenir',
        'Entreprises intervenant sur place à prévenir',
        'Validité réduite à 1 an pour une vente'
      ]
    }
  ],

  termites: [
    {
      motif: /[ÉE]tat relatif [àa] la pr[ée]sence de termites|Conclusion.{0,30}termite/i,
      titre: 'La conclusion termites',
      famille: 'constat',
      ton: 'moyen',
      points: ['Ici, le rapport dit s’il a vu des traces de termites'],
      pratique: () => 'Ce qu’il a vu, là où il pouvait regarder. Valable 6 mois.',
      suites: [
        {
          question: '« Aucun indice », ça veut dire quoi ?',
          ton: 'moyen',
          points: [
            'Rien vu là où c’était visible',
            'Un mur fermé, un vide sanitaire : non contrôlés',
            'Ce n’est pas une garantie'
          ]
        },
        {
          question: 'S’il y en a, ça coûte quoi ?',
          ton: 'mauvais',
          points: [
            'Déclaration en mairie, obligatoire',
            'Traitement : 2 000 à 8 000 €',
            'Charpente mangée : bien plus'
          ]
        },
        {
          question: 'Pourquoi 6 mois seulement ?',
          ton: 'bon',
          points: [
            'Une colonie avance vite',
            'Le document doit être frais le jour de la signature',
            'Souvent le premier du dossier à périmer'
          ]
        }
      ]
    },
    {
      motif: /(?:n'a pas été repéré|présence).{0,60}indice.{0,30}termites?/i,
      titre: 'La conclusion',
      points: [
        'Vaut pour ce qui était visible ce jour-là',
        'Rien n’a été démonté ni percé',
        'Validité : 6 mois seulement'
      ]
    },
    {
      motif: /arrêté préfectoral/i,
      titre: 'Pourquoi ce diagnostic',
      points: [
        'Obligatoire seulement dans les communes classées',
        'Votre commune est citée ici',
        'C’est le préfet qui décide'
      ]
    }
  ],

  electricite: [
    {
      motif: /Conclusion relative [àa] l.[ée]valuation des risques|Conclusion.{0,40}s[ée]curit[ée] des personnes/i,
      titre: 'La conclusion électricité',
      famille: 'constat',
      ton: 'moyen',
      points: ['Ici, le rapport dit si l’installation est sûre'],
      pratique: () => 'Deux cases imprimées, une seule cochée : c’est la synthèse du dossier qui tranche.',
      suites: [
        {
          question: 'C’est dangereux ?',
          ton: 'mauvais',
          points: [
            'Une anomalie = un endroit où le courant peut blesser',
            'Les deux graves : pas de différentiel, pas de terre',
            'Rien ne prend feu demain matin pour autant'
          ]
        },
        {
          question: 'Je dois faire les travaux ?',
          ton: 'bon',
          points: [
            'Non, rien n’est obligatoire pour vendre',
            'Le vendeur n’a rien à réparer',
            'L’acheteur fait ce qu’il veut ensuite'
          ]
        },
        {
          question: 'Ça change le prix ?',
          ton: 'moyen',
          points: [
            'Chaque anomalie est un argument de négociation',
            'Un tableau à refaire : 800 à 2 500 €',
            'Faites chiffrer avant de signer'
          ]
        }
      ]
    },
    {
      motif: /Conclusion relative à l'évaluation des risques/i,
      titre: 'La conclusion, cochée à la main',
      schema: 'case',
      points: [
        'Deux phrases imprimées, une seule cochée',
        'Cherchez la coche : c’est votre résultat',
        'Un programme ne peut pas lire une case'
      ]
    },
    {
      motif: /différentiel/i,
      titre: 'Le point le plus important',
      points: [
        'Coupe le courant qui fuit vers une personne',
        'Son absence : l’anomalie la plus grave',
        'La plus fréquente dans les logements anciens'
      ]
    }
  ],

  gaz: [
    {
      motif: /^H\.?\s*[-–]\s*Conclusion|^Conclusion\s*:$/i,
      titre: 'La conclusion gaz',
      famille: 'constat',
      ton: 'moyen',
      points: ['Ici, le rapport dit si le gaz est sûr'],
      pratique: () => 'Trois niveaux : A1 tranquille, A2 pressé, DGI tout de suite.',
      suites: [
        {
          question: 'A1, A2, DGI : ça veut dire quoi ?',
          ton: 'moyen',
          points: [
            'A1 : à réparer un jour, sans urgence',
            'A2 : à réparer vite',
            'DGI : danger grave, le gaz est coupé sur-le-champ'
          ]
        },
        {
          question: 'Le vrai danger, c’est quoi ?',
          ton: 'mauvais',
          points: [
            'Le monoxyde de carbone : invisible, sans odeur',
            'Il endort, puis il tue',
            'Il vient d’une évacuation bouchée ou d’une pièce mal ventilée'
          ]
        },
        {
          question: 'Et pour acheter ?',
          ton: 'bon',
          points: [
            'Un DGI se règle avant l’état des lieux',
            'Le reste ne bloque pas la vente',
            'Mais ça se négocie'
          ]
        }
      ]
    },
    {
      motif: /^Conclusion|H\.\s*-\s*Conclusion/i,
      titre: 'La conclusion, cochée à la main',
      schema: 'case',
      points: [
        'Quatre phrases imprimées, une seule cochée',
        'A1 : à réparer un jour',
        'A2 : à réparer vite',
        'DGI : gaz coupé le jour même'
      ]
    }
  ],

  erp: [
    {
      motif: /zone de sismicit[ée] class[ée]e|Zonage de sismicit[ée]|zone r[ée]glement[ée]e du risque/i,
      titre: 'La conclusion risques',
      famille: 'constat',
      ton: 'moyen',
      points: ['Ici, on recopie ce que l’État a classé sous votre terrain'],
      pratique: () => 'Personne n’est venu mesurer : c’est une carte, pas une visite.',
      suites: [
        {
          question: 'Ça se répare ?',
          ton: 'mauvais',
          points: [
            'Non. C’est le terrain, pas le logement',
            'On ne déplace pas une maison',
            'On vit avec, et on s’assure'
          ]
        },
        {
          question: 'Le risque le plus fréquent ?',
          ton: 'moyen',
          points: [
            'L’argile : elle gonfle l’hiver, se rétracte l’été',
            'La maison suit le mouvement',
            'Résultat : des fissures en escalier sur les murs'
          ]
        },
        {
          question: 'Je fais quoi, concrètement ?',
          ton: 'bon',
          points: [
            'Vérifier ce que couvre l’assurance habitation',
            'Demander si un sinistre a déjà été indemnisé',
            'Un sinistre caché peut faire annuler la vente'
          ]
        }
      ]
    },
    {
      motif: /le bien se situe dans une zone/i,
      titre: 'Le risque de votre terrain',
      points: [
        'Cette phrase décrit votre parcelle',
        'Pas la commune entière',
        'Compte pour l’assurance et les travaux'
      ]
    },
    {
      motif: /sismique/i,
      titre: 'La sismicité',
      points: [
        'Presque tout le Sud-Ouest est en zone 2 (faible)',
        'Aucun tremblement de terre attendu',
        'Impose des règles aux constructions neuves'
      ]
    }
  ],

  amiante: [
    {
      motif: /[ÉE]tat.{0,30}amiante|Rep[ée]rage.{0,30}amiante|Conclusion.{0,30}amiante/i,
      titre: 'La conclusion amiante',
      famille: 'constat',
      ton: 'moyen',
      points: ['Ici, le rapport dit s’il a vu de l’amiante'],
      pratique: () => 'Vu ou pas vu — et seulement dans ce qui était visible.',
      suites: [
        {
          question: 'S’il y en a, je fais quoi ?',
          ton: 'bon',
          points: [
            'En bon état : rien du tout',
            'On ne perce pas, on ne ponce pas, on ne casse pas',
            'On revérifie tous les 3 ans'
          ]
        },
        {
          question: 'Pourquoi c’est dangereux ?',
          ton: 'mauvais',
          points: [
            'Cassée, elle libère des fibres invisibles',
            'Respirées, elles restent dans les poumons',
            'Le cancer arrive 20 à 40 ans plus tard'
          ]
        },
        {
          question: 'Et si je fais des travaux ?',
          ton: 'moyen',
          points: [
            'Un repérage plus poussé devient obligatoire',
            'Le retrait passe par une entreprise certifiée',
            'Comptez plusieurs milliers d’euros'
          ]
        }
      ]
    },
    {
      motif: /Liste [ABC]\s*:/i,
      titre: 'Les listes A, B et C',
      schema: 'listes',
      points: [
        'A : flocages, calorifugeages — les plus dangereux',
        'B : dalles, conduits, toitures — les plus courants',
        'C : uniquement avant démolition'
      ]
    }
  ],

  carrez: [
    {
      motif: /Surface loi Carrez totale|Superficie Loi Carrez totale/i,
      titre: 'La conclusion surface',
      schema: 'surface',
      famille: 'constat',
      ton: 'info',
      points: ['C’est la surface qui part dans l’acte de vente'],
      pratique: (v) =>
        v ? `${v} → c’est ce chiffre qui engage le vendeur.` : 'C’est ce chiffre qui engage le vendeur.',
      suites: [
        {
          question: 'Qu’est-ce qu’on compte dedans ?',
          ton: 'bon',
          points: [
            'Le sol, sous plus de 1,80 m de hauteur',
            'Murs, cloisons et gaines déduits',
            'Ni cave, ni garage, ni balcon'
          ]
        },
        {
          question: 'Et si le chiffre est faux ?',
          ton: 'mauvais',
          points: [
            'Plus de 5 % en moins que l’annonce',
            'L’acheteur a 1 an pour réclamer',
            'Le prix baisse d’autant'
          ]
        },
        {
          question: 'Pourquoi ce n’est pas la surface du DPE ?',
          ton: 'moyen',
          points: [
            'Carrez : ce qu’on achète',
            'DPE : ce qu’on chauffe',
            'Deux chiffres différents, c’est normal'
          ]
        }
      ]
    },
    {
      motif: /superficie.{0,20}carrez.{0,20}totale|surface.{0,20}carrez.{0,20}totale/i,
      titre: 'Le chiffre de l’acte',
      points: [
        'C’est lui qui engage le vendeur',
        'Compte le sol sous plus de 1,80 m',
        'Murs et cloisons déduits',
        'Écart de plus de 5 % : baisse de prix possible'
      ]
    }
  ]
};

export function reperer(type: TypeDiag, pages: PageTexte[]): Repere[] {
  const propres = CIBLES[type];
  if (!propres) return [];

  // Du plus précis au plus général : les cibles du diagnostic, puis les lignes
  // communes à tous les rapports, puis les mots du métier. À ligne égale, c'est
  // l'explication la plus précise qui l'emporte.
  //
  // La famille sert à ranger le panneau : ce que dit le diagnostic d'abord, les
  // données du dossier ensuite, le vocabulaire en dernier. Sans ce classement,
  // le lecteur reçoit vingt lignes d'un coup.
  const cibles: (Cible & { origine: Famille })[] = [
    ...propres.map((c) => ({ ...c, origine: 'constat' as const })),
    ...COMMUNES.map((c) => ({ ...c, origine: 'donnee' as const })),
    ...GLOSSAIRE.map((c) => ({ ...c, origine: 'mot' as const }))
  ];

  const reperes: Repere[] = [];
  const dejaVus = new Set<string>();
  // Une ligne ne porte qu'un seul repère : sinon deux explications se
  // superposeraient au même endroit du rapport.
  const lignesPrises = new Set<string>();

  for (const page of pages) {
    if (!page.positions) continue;

    for (const cible of cibles) {
      if (dejaVus.has(cible.titre)) continue;

      const ligne = page.positions.find(
        (l) => cible.motif.test(l.texte) && !lignesPrises.has(l.texte)
      );
      if (!ligne) continue;

      dejaVus.add(cible.titre);
      lignesPrises.add(ligne.texte);
      const ton = cible.ton ?? tonDeLaLigne(ligne.texte);
      const valeur = valeurDe(ligne.texte);
      reperes.push({
        page: page.numero,
        x: ligne.x,
        y: ligne.y,
        largeur: ligne.largeur,
        hauteur: ligne.hauteur,
        titre: cible.titre,
        ...(cible.schema ? { schema: cible.schema } : {}),
        points: cible.points,
        ...(cible.suites ? { suites: cible.suites } : {}),
        ton,
        // Un numéro de dossier reste un chiffre, même dans un rapport DPE. Les
        // conclusions, elles, disent leur famille elles-mêmes.
        famille:
          cible.famille ??
          (cible.origine === 'mot' ? 'mot' : ton === 'info' ? 'donnee' : 'constat'),
        pratique: cible.pratique ? cible.pratique(valeur) : pratiqueDe(ton, valeur),
        extrait: ligne.texte
      });
    }
  }

  // Tous les repères du diagnostic, dans l'ordre des pages : le lecteur descend
  // dans son rapport et touche ce qu'il veut, où qu'il soit.
  return reperes.sort((a, b) => a.page - b.page || b.y - a.y);
}
