/**
 * Le référentiel réglementaire : un texte derrière chaque affirmation.
 *
 * Ce fichier existe pour une raison précise. Une connaissance qu'on porte « de
 * tête » se dégrade sans prévenir : on retient un seuil qui a changé, on
 * mélange deux lois voisines, on affirme avec aplomb une règle qu'on n'a jamais
 * relue. Trois erreurs de ce genre ont déjà été écrites dans ce produit — la loi
 * Carrez donnée pour les seuls logements, l'amiante « valable à vie », l'état
 * des risques « obligatoire partout ». Chacune était plausible. Toutes étaient
 * fausses.
 *
 * Une règle notée ici, avec son article et la date où on l'a lue, ne se dégrade
 * pas. Elle se vérifie, elle se date, et elle se conteste.
 *
 * TROIS RÈGLES DE TENUE, à respecter sans exception :
 *
 *  1. **Rien n'entre ici sans avoir été lu à la source.** Un article de code,
 *     un arrêté au Journal officiel. Ni blog de diagnostiqueur, ni page
 *     d'agence, ni mémoire.
 *  2. **Tout porte sa date de lecture.** Un texte lu il y a deux ans n'est pas
 *     une source, c'est un souvenir. `aVerifier()` liste ce qui a vieilli.
 *  3. **Ce qu'on n'a pas vérifié n'est pas écrit.** Une case vide se voit et se
 *     comble ; une valeur inventée passe inaperçue et se propage.
 */
import type { TypeDiag } from '../modele';

export interface Source {
  /** Le texte, tel qu'on le cite : « article L. 731-1 du code de la construction ». */
  reference: string;
  /** L'adresse Légifrance, pour y retourner sans chercher. */
  url: string;
  /** Quand ce texte a été lu à la source, au format ISO. */
  luLe: string;
}

export interface Regle {
  /** Ce que le texte établit, en une phrase exacte. */
  enonce: string;
  source: Source;
  /**
   * Ce qui limite la portée de l'énoncé. Une règle sans exception n'existe
   * pratiquement pas en droit du diagnostic — quand on n'en voit aucune, c'est
   * en général qu'on n'a pas fini de lire.
   */
  reserve?: string;
}

export interface Reglement {
  /** Le nom du document, tel que le texte l'appelle. */
  nom: string;
  /** Le texte qui l'institue. */
  fondement: Regle;
  /** Sa durée de validité, en mois. `null` s'il n'en a pas. */
  validiteMois: number | null;
  /** D'où vient cette durée. */
  validite?: Regle;
  /** Les autres règles vérifiées, dans l'ordre où elles servent. */
  regles: Regle[];
}

/* -------------------------------------------------------------------------- */
/*  Les diagnostics du logement                                               */
/* -------------------------------------------------------------------------- */

export const REGLEMENT: Partial<Record<TypeDiag, Reglement>> = {
  dpe: {
    nom: 'Diagnostic de performance énergétique',
    fondement: {
      enonce:
        'La méthode et les procédures du diagnostic de performance énergétique sont fixées par arrêté ; le logement reçoit une étiquette énergie et une étiquette climat.',
      source: {
        reference: 'arrêté du 31 mars 2021 relatif aux méthodes et procédures applicables au DPE',
        url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043353381',
        luLe: '2026-08-14'
      }
    },
    validiteMois: 120,
    regles: [
      {
        enonce:
          'La classe retenue est la plus mauvaise des deux étiquettes, énergie et climat : c’est la règle du double seuil.',
        source: {
          reference: 'arrêté du 31 mars 2021',
          url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043353381',
          luLe: '2026-08-14'
        },
        reserve:
          'Un logement sobre chauffé au fioul est donc classé sur son CO₂, pas sur sa consommation.'
      },
      {
        enonce:
          'Les logements dont la surface de référence est inférieure ou égale à 40 m² relèvent de seuils propres, établis surface par surface entre 8 et 40 m² et interpolés entre deux valeurs.',
        source: {
          reference:
            'arrêté du 25 mars 2024 modifiant les seuils des étiquettes du DPE pour les logements de petites surfaces',
          url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049446315',
          luLe: '2026-08-14'
        },
        reserve:
          'En vigueur depuis le 1ᵉʳ juillet 2024. Les tranches usuelles — moins de 70, de 70 à 110… — ne valent donc pas sous 40 m².'
      },
      {
        enonce:
          'Le terme « surface habitable » est remplacé par « surface de référence » dans les documents du diagnostic.',
        source: {
          reference: 'arrêté du 25 mars 2024',
          url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049446315',
          luLe: '2026-08-14'
        }
      },
      {
        /*
         * Le chiffre le plus répété du produit était faux depuis sept mois.
         *
         * L'ancienne valeur du coefficient figurait en neuf endroits, dont les
         * pages publiques. L'arrêté du 13 août 2025 la remplace par 1,9 au
         * 1ᵉʳ janvier 2026 : article 2, « la valeur précédente est remplacée par
         * la valeur "1,9" », entrée en vigueur article 5. Lu au texte officiel
         * le 15/08/2026, pas repris d'une source secondaire.
         *
         * Ce n'est pas un détail de vocabulaire : le coefficient multiplie la
         * consommation avant qu'elle soit notée. Un logement tout électrique
         * voyait sa consommation majorée d'un cinquième de trop.
         */
        enonce:
          'Le facteur de conversion de l’énergie finale en énergie primaire de l’électricité passe de 2,3 à 1,9.',
        source: {
          reference:
            'arrêté du 13 août 2025 modifiant le facteur de conversion de l’énergie finale en énergie primaire de l’électricité relatif au diagnostic de performance énergétique',
          url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052134589',
          luLe: '2026-08-15'
        },
        reserve:
          'En vigueur depuis le 1ᵉʳ janvier 2026. Un DPE édité avant cette date a donc été calculé avec 2,3 : il reste valable, mais sa lettre a été établie sur l’ancien facteur.'
      },
      {
        /*
         * La réforme de 2021, et ce qu'elle a fait aux diagnostics d'avant.
         *
         * Le moteur applique ces dates depuis le lot précédent, mais le texte
         * qui les fonde n'était nulle part : le code portait la règle, le
         * référentiel l'ignorait. Une règle appliquée sans source inscrite est
         * une règle qu'on ne pourra pas vérifier quand elle changera.
         *
         * Conséquence, au 15 août 2026 : tout DPE établi avant le 1ᵉʳ juillet
         * 2021 est périmé, sans exception. Le plus récent d'entre eux a cessé
         * de valoir le 31 décembre 2024.
         */
        enonce:
          'La durée de validité du diagnostic de performance énergétique est de dix ans. Par exception, ceux réalisés entre le 1ᵉʳ janvier 2013 et le 31 décembre 2017 sont valides jusqu’au 31 décembre 2022, et ceux réalisés entre le 1ᵉʳ janvier 2018 et le 30 juin 2021 jusqu’au 31 décembre 2024.',
        source: {
          reference:
            'décret n° 2020-1610 du 17 décembre 2020 relatif à la durée de validité des diagnostics de performance énergétique, article 1ᵉʳ',
          url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042695187',
          luLe: '2026-08-15'
        },
        reserve:
          'Ces durées écourtées visent les diagnostics antérieurs à la réforme du 1ᵉʳ juillet 2021 — celle qui a rendu le DPE opposable et changé sa méthode de calcul. Un rapport d’avant cette date porte donc une date de fin imprimée qui ne vaut plus.'
      }
    ]
  },

  electricite: {
    nom: 'État de l’installation intérieure d’électricité',
    fondement: {
      enonce:
        'L’état est réalisé en vue d’évaluer les risques pouvant porter atteinte à la sécurité des personnes et le fonctionnement de l’installation, pour les installations réalisées depuis plus de quinze ans.',
      source: {
        reference: 'arrêté du 28 septembre 2017, articles 1ᵉʳ et 2',
        url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000035772506',
        luLe: '2026-08-14'
      }
    },
    validiteMois: 36,
    regles: [
      {
        enonce:
          'Le rapport conclut sur six domaines d’anomalies : l’appareil général de commande et de protection ; le dispositif différentiel et la prise de terre ; la protection contre les surintensités ; la liaison équipotentielle et les locaux contenant une douche ou une baignoire ; les matériels présentant des risques de contact direct ; les matériels vétustes ou inadaptés.',
        source: {
          reference: 'arrêté du 28 septembre 2017, annexe III (modèle de rapport)',
          url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000035772506',
          luLe: '2026-08-14'
        },
        reserve:
          'S’y ajoutent les anomalies des installations particulières — piscine, appareils alimentés depuis les parties communes — et les informations complémentaires. Chaque domaine regroupe plusieurs points de contrôle de l’annexe I : ce ne sont pas « six points ».'
      },
      {
        enonce:
          'L’état porte sur l’installation située en aval de l’appareil général de commande et de protection, jusqu’aux bornes d’alimentation ou aux socles des prises de courant.',
        source: {
          reference: 'arrêté du 28 septembre 2017, article 2',
          url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000035772506',
          luLe: '2026-08-14'
        }
      }
    ]
  },

  amiante: {
    nom: 'État d’amiante',
    fondement: {
      enonce:
        'À la vente d’une maison individuelle, l’état d’amiante est constitué du rapport de repérage des matériaux et produits des listes A et B ; pour un lot d’immeuble collectif d’habitation, des repérages des parties privatives vendues et de la fiche récapitulative du dossier technique amiante pour les parties communes ; pour les autres immeubles, de cette seule fiche récapitulative.',
      source: {
        reference: 'article R. 1334-29-7 du code de la santé publique',
        url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000024117155',
        luLe: '2026-08-14'
      },
      reserve:
        'Le texte ne vise que les listes A et B. La liste C relève du repérage avant démolition, qui est un autre document.'
    },
    /*
     * Pas de durée : l'article D. 271-5 du code de la construction fixe celles
     * du plomb, des termites, du gaz et de l'électricité — l'état d'amiante n'y
     * figure pas. C'est de là que vient le raccourci « amiante valable à vie »,
     * qui fut écrit ici et qui est faux : l'absence de durée dans ce texte ne
     * vaut pas validité perpétuelle d'un rapport ancien.
     */
    validiteMois: null,
    regles: [
      {
        enonce:
          'L’article D. 271-5 du code de la construction et de l’habitation, qui fixe les durées de validité des pièces du dossier de diagnostic technique, ne mentionne pas l’état d’amiante : aucune durée n’y est attachée.',
        source: {
          reference: 'article D. 271-5 du code de la construction et de l’habitation',
          url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000019965764/',
          luLe: '2026-08-14'
        },
        reserve:
          'Une durée non fixée par ce texte ne vaut pas validité perpétuelle : voir la règle suivante, qui oblige à compléter un repérage ancien avant de vendre.'
      },
      {
        enonce:
          'Les matériaux de la liste B qui n’avaient pas fait l’objet d’un repérage avant l’entrée en vigueur du décret doivent faire l’objet d’un repérage complémentaire, lequel intervient lors de la prochaine vente du bien pour la réalisation de l’état d’amiante.',
        source: {
          reference: 'article 4 du décret n° 2011-629 du 3 juin 2011',
          url: 'https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000024114453',
          luLe: '2026-08-14'
        },
        reserve:
          'C’est ici que se dissipe le raccourci « amiante valable à vie ». Un rapport ancien limité à la liste A ne suffit pas pour vendre : il faut le compléter sur la liste B. Une conclusion rassurante d’avant 2013 ne dispense donc de rien.'
      }
    ]
  },

  plomb: {
    nom: 'Constat de risque d’exposition au plomb',
    fondement: {
      enonce:
        'Un constat de risque d’exposition au plomb est produit lors de la vente de tout ou partie d’un immeuble à usage d’habitation construit avant le 1ᵉʳ janvier 1949.',
      source: {
        reference: 'article L. 1334-6 du code de la santé publique',
        url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006686762',
        luLe: '2026-08-14'
      },
      reserve:
        'La date de construction commande l’obligation : un immeuble de 1949 ou postérieur n’y est pas soumis. L’article renvoie aux articles L. 271-4 à L. 271-6 du code de la construction pour les conditions.'
    },
    /*
     * Volontairement `null`, alors qu'une durée existe.
     *
     * Le constat doit dater de moins d'un an pour une vente, mais l'article
     * D. 271-5 réserve le troisième alinéa de L. 271-5, et l'article R. 1334-11
     * écarte toute limite de temps lorsque le constat conclut à l'absence de
     * plomb ou à des concentrations inférieures aux seuils. Or c'est le cas le
     * plus fréquent. Inscrire « douze mois » en dur ferait donc déclarer périmés
     * des constats qui ne le sont pas — le moteur ne saurait pas faire la
     * différence. Tant qu'il ne sait pas lire le résultat du constat, on note la
     * règle sans l'appliquer.
     */
    validiteMois: null,
    regles: [
      {
        enonce:
          'Pour une vente, le constat de risque d’exposition au plomb doit avoir été établi depuis moins d’un an à la date de la promesse ou de l’acte authentique.',
        source: {
          reference: 'article D. 271-5 du code de la construction et de l’habitation',
          url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000019965764/',
          luLe: '2026-08-14'
        },
        reserve: 'Sous réserve du troisième alinéa de l’article L. 271-5.'
      },
      {
        enonce:
          'Pour une location, le constat doit avoir été établi depuis moins de six ans ; sa validité n’est en revanche pas limitée dans le temps lorsqu’il conclut à l’absence de plomb ou à des concentrations inférieures aux seuils réglementaires.',
        source: {
          reference: 'article R. 1334-11 du code de la santé publique',
          url: 'https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006197020',
          luLe: '2026-08-14'
        }
      },
      {
        enonce:
          'Le constat identifie les revêtements contenant du plomb et leur concentration, décrit leur état de conservation et énumère les facteurs de dégradation du bâti relevés.',
        source: {
          reference: 'article R. 1334-10 du code de la santé publique',
          url: 'https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006197020',
          luLe: '2026-08-14'
        }
      },
      {
        enonce:
          'Un constat de risque d’exposition au plomb présente un repérage des revêtements contenant du plomb et, le cas échéant, dresse un relevé sommaire des facteurs de dégradation du bâti. Est annexée à ce constat une notice d’information.',
        source: {
          reference: 'article L. 1334-5 du code de la santé publique',
          url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000031928095',
          luLe: '2026-08-15'
        },
        reserve:
          'L’article ne dresse pas la liste de ces facteurs : il renvoie à un arrêté. On ne peut donc pas énumérer soi-même « humidité, effondrement, plancher menaçant » comme si le code les nommait — le rapport, lui, les liste quand il en relève.'
      },
      {
        enonce:
          'Si le constat de risque d’exposition au plomb fait apparaître la présence de facteurs de dégradation précisés par arrêté, l’auteur du constat transmet immédiatement une copie de ce document au directeur général de l’agence régionale de santé, qui en informe le représentant de l’État dans le département.',
        source: {
          reference: 'article L. 1334-10 du code de la santé publique',
          url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000031928041',
          luLe: '2026-08-15'
        },
        reserve:
          'C’est la conséquence la plus lourde du constat, et elle ne dépend pas de la classe des revêtements mais des facteurs de dégradation du bâti : un logement peut partir à l’agence régionale de santé sans qu’aucune unité ne soit classée 3.'
      }
    ]
  },

  termites: {
    nom: 'État relatif à la présence de termites',
    fondement: {
      enonce:
        'En cas de vente de tout ou partie d’un immeuble bâti situé dans une zone délimitée en application du premier alinéa de l’article L. 131-3, un état relatif à la présence de termites est produit.',
      source: {
        reference: 'article L. 126-24 du code de la construction et de l’habitation',
        url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043977465',
        luLe: '2026-08-14'
      },
      reserve:
        'L’obligation naît du zonage, arrêté par le préfet : hors de ces zones, aucun état termites n’est dû. Un dossier qui n’en contient pas n’est donc pas nécessairement incomplet.'
    },
    validiteMois: 6,
    validite: {
      enonce:
        'L’état relatif à la présence de termites doit avoir été établi depuis moins de six mois à la date de la promesse de vente ou de l’acte authentique.',
      source: {
        reference: 'article D. 271-5 du code de la construction et de l’habitation',
        url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000019965764/',
        luLe: '2026-08-14'
      }
    },
    regles: [
      {
        enonce:
          'Un second risque relève du même mécanisme de zonage : en cas de vente d’un immeuble bâti situé dans une zone délimitée en application du second alinéa de l’article L. 131-3, une information sur la présence d’un risque de mérule est produite.',
        source: {
          reference: 'article L. 126-25 du code de la construction et de l’habitation',
          url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043977462',
          luLe: '2026-08-14'
        },
        reserve:
          'La mérule est une information distincte de l’état termites, et l’application ne sait pas encore la lire. Un champignon n’est pas un insecte : les deux ne se repèrent ni ne se traitent de la même façon.'
      }
    ]
  },

  gaz: {
    nom: 'État de l’installation intérieure de gaz',
    fondement: {
      enonce:
        'L’état de l’installation intérieure de gaz doit avoir été établi depuis moins de trois ans à la date de la promesse de vente ou de l’acte authentique.',
      source: {
        reference: 'article D. 271-5 du code de la construction et de l’habitation',
        url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074096/LEGISCTA000019965764/',
        luLe: '2026-08-14'
      },
      reserve:
        'Seule la durée a été lue au texte. Le modèle du rapport et la classification des anomalies — A1, A2, danger grave et immédiat — relèvent de l’arrêté du 6 avril 2007, qui n’a pas encore été lu.'
    },
    validiteMois: 36,
    regles: []
  },

  erp: {
    nom: 'État des risques',
    fondement: {
      enonce:
        'L’acquéreur ou le locataire d’un bien situé dans le périmètre d’un plan de prévention des risques technologiques, miniers ou naturels, dans une zone de sismicité ou à potentiel radon, dans une zone susceptible d’être atteinte par le recul du trait de côte ou soumise à une obligation de débroussaillement, en est informé par le vendeur ou le bailleur.',
      source: {
        reference: 'article L. 125-5 du code de l’environnement',
        url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043978268',
        luLe: '2026-08-14'
      },
      reserve:
        'L’obligation naît du zonage, pas du bien : un logement hors de tout périmètre n’y est pas soumis. C’est ce qui rend faux le raccourci « état des risques obligatoire partout ».'
    },
    validiteMois: 6,
    validite: {
      enonce:
        'L’état des risques remis lors de la première visite de l’immeuble au potentiel acquéreur ou au potentiel locataire est établi depuis moins de six mois.',
      source: {
        reference: 'article R. 125-25 du code de l’environnement',
        url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074220/LEGISCTA000046364184/',
        luLe: '2026-08-14'
      }
    },
    regles: [
      {
        enonce:
          'L’état des risques est remis dès la première visite de l’immeuble, avant toute signature ; il est ensuite intégré au dossier de diagnostic technique ou annexé à la promesse et à l’acte de vente.',
        source: {
          reference: 'article L. 125-5 du code de l’environnement',
          url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043978268',
          luLe: '2026-08-14'
        },
        reserve:
          'La remise « dès la première visite » est peu connue et souvent négligée : elle précède la promesse, elle ne l’accompagne pas.'
      },
      {
        enonce:
          'À défaut, l’acquéreur ou le locataire peut poursuivre la résolution du contrat ou demander au juge une diminution du prix ; les délais de rétractation ne courent qu’à compter du lendemain de la communication du document.',
        source: {
          reference: 'article L. 125-5 du code de l’environnement',
          url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043978268',
          luLe: '2026-08-14'
        }
      }
    ]
  },

  assainissement: {
    nom: 'Contrôle de l’installation d’assainissement non collectif',
    fondement: {
      enonce:
        'Lors de la vente de tout ou partie d’un immeuble à usage d’habitation non raccordé au réseau public de collecte des eaux usées, le document établi à l’issue du contrôle de l’installation d’assainissement non collectif est joint au dossier de diagnostic technique.',
      source: {
        reference: 'article L. 1331-11-1 du code de la santé publique',
        url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043975559',
        luLe: '2026-08-14'
      },
      reserve:
        'L’obligation ne vise que les immeubles non raccordés : un logement relié au tout-à-l’égout n’est pas concerné.'
    },
    validiteMois: 36,
    validite: {
      enonce:
        'Le document doit être daté de moins de trois ans au moment de la signature de l’acte de vente ; s’il date de plus de trois ans ou n’existe pas, sa réalisation est à la charge du vendeur.',
      source: {
        reference: 'article L. 1331-11-1 du code de la santé publique',
        url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043975559',
        luLe: '2026-08-14'
      }
    },
    regles: [
      {
        enonce:
          'Dans le mois qui suit la vente, le notaire informe le service public d’assainissement compétent, en lui transmettant l’identification du bien et celle de l’acquéreur.',
        source: {
          reference: 'article L. 1331-11-1 du code de la santé publique',
          url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043975559',
          luLe: '2026-08-14'
        }
      }
    ]
  },

  carrez: {
    nom: 'Mesurage de la surface',
    fondement: {
      enonce:
        'La superficie privative d’un lot de copropriété — dite loi Carrez — est mentionnée à l’acte de vente. La surface habitable — dite loi Boutin — est celle qui figure au bail de location.',
      source: {
        reference: 'loi n° 65-557 du 10 juillet 1965, article 46',
        url: 'https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006068256',
        luLe: '2026-08-14'
      },
      reserve:
        'Ce sont deux mesurages distincts : les combles non aménagés, greniers et vérandas de plus d’1,80 m entrent dans la superficie privative et pas dans la surface habitable. La Carrez vise tout lot de copropriété, quel qu’en soit l’usage — bureau et local commercial compris.'
    },
    validiteMois: null,
    regles: []
  }
};

/* -------------------------------------------------------------------------- */
/*  Les documents d'immeuble et de copropriété                                */
/* -------------------------------------------------------------------------- */

export const REGLEMENT_COPRO = {
  dtg: {
    nom: 'Diagnostic technique global',
    fondement: {
      enonce:
        'Le diagnostic technique global comporte quatre volets : l’analyse de l’état apparent des parties communes et des équipements communs ; l’état technique de l’immeuble au regard des obligations légales et réglementaires ; l’analyse des améliorations possibles de la gestion technique et patrimoniale ; un diagnostic de performance énergétique de l’immeuble.',
      source: {
        reference: 'article L. 731-1 du code de la construction et de l’habitation',
        url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043976979',
        luLe: '2026-08-14'
      },
      reserve:
        'Il s’y ajoute une évaluation sommaire du coût et la liste des travaux nécessaires à la conservation de l’immeuble dans les dix prochaines années.'
    },
    validiteMois: null,
    regles: []
  },

  pppt: {
    nom: 'Projet de plan pluriannuel de travaux',
    fondement: {
      enonce:
        'Le projet de plan pluriannuel de travaux comporte la liste des travaux nécessaires, une estimation du niveau de performance, une estimation sommaire du coût et sa hiérarchisation, et une proposition d’échéancier.',
      source: {
        reference: 'article 14-2 de la loi n° 65-557 du 10 juillet 1965',
        url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000043977289',
        luLe: '2026-08-14'
      },
      reserve:
        'Obligatoire pour les copropriétés à usage au moins partiel d’habitation dont la réception des travaux date de plus de quinze ans, selon un calendrier : 1ᵉʳ janvier 2023 au-delà de 200 lots, 2024 de 51 à 200 lots, 2025 en deçà de 51 lots.'
    },
    validiteMois: null,
    regles: []
  },

  dta: {
    nom: 'Dossier technique amiante',
    fondement: {
      enonce:
        'Le dossier technique amiante est constitué pour les parties communes des immeubles bâtis dont le permis de construire est antérieur au 1ᵉʳ juillet 1997, et tenu à jour par le propriétaire.',
      source: {
        reference: 'article R. 1334-29-5 du code de la santé publique',
        url: 'https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006196468',
        luLe: '2026-08-14'
      },
      reserve:
        'C’est le seul document amiante à caractère permanent : les autres sont liés à un événement — une vente, une location, des travaux, une démolition. Chaque repérage avant travaux doit y être versé.'
    },
    validiteMois: null,
    regles: []
  },

  raat: {
    nom: 'Repérage amiante avant travaux',
    fondement: {
      enonce:
        'Avant certaines opérations dans les immeubles bâtis, le donneur d’ordre fait rechercher la présence d’amiante afin que les entreprises intervenantes protègent leurs salariés.',
      source: {
        reference:
          'article R. 4412-97 du code du travail, arrêté du 16 juillet 2019 relatif au repérage de l’amiante avant certaines opérations',
        url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000038777498',
        luLe: '2026-08-14'
      },
      reserve:
        'Il relève du code du travail et ne vaut que pour l’opération prévue : ce n’est pas le repérage amiante d’une vente, bien qu’il porte le même intitulé de mission.'
    },
    validiteMois: null,
    regles: []
  }
} as const;

/* -------------------------------------------------------------------------- */
/*  L'entretien du référentiel                                                */
/* -------------------------------------------------------------------------- */

/**
 * Au-delà de ce délai, une lecture n'est plus une source mais un souvenir.
 *
 * Ramené de douze à six mois le 15/08/2026, et l'occasion mérite d'être notée :
 * le facteur de conversion de l'électricité est resté faux dans le produit
 * pendant sept mois et demi. Douze mois laissaient donc passer une erreur
 * entière avant même de la signaler.
 *
 * Ce garde-fou a une limite qu'il faut connaître : il mesure la date de
 * LECTURE, pas celle du TEXTE. Une relecture qui se contente de rouvrir les
 * articles déjà connus rafraîchit les dates sans rien apprendre — c'est
 * exactement ce qui s'est produit. Toutes les entrées avaient été relues la
 * veille, et aucune ne connaissait l'arrêté d'août 2025 : la fraîcheur affichée
 * certifiait une lacune.
 *
 * Relire, ici, veut donc dire deux choses : rouvrir l'article, ET chercher ce
 * qui l'a modifié depuis.
 */
export const FRAICHEUR_MOIS = 6;

export interface Peremption {
  quoi: string;
  reference: string;
  url: string;
  luLe: string;
  moisDepuis: number;
}

/**
 * Ce qui n'a pas été relu depuis trop longtemps.
 *
 * Le droit du diagnostic bouge vite : les seuils du DPE ont changé deux fois en
 * trois ans, le calendrier du plan pluriannuel s'étale jusqu'en 2025. Un
 * référentiel qu'on ne revisite pas devient un piège d'autant plus efficace
 * qu'il inspire confiance.
 */
export function aVerifier(aujourdhui: Date = new Date()): Peremption[] {
  const vieux: Peremption[] = [];

  const examiner = (quoi: string, regle: Regle): void => {
    const lu = new Date(regle.source.luLe);
    const mois =
      (aujourdhui.getFullYear() - lu.getFullYear()) * 12 + (aujourdhui.getMonth() - lu.getMonth());
    if (mois >= FRAICHEUR_MOIS) {
      vieux.push({
        quoi,
        reference: regle.source.reference,
        url: regle.source.url,
        luLe: regle.source.luLe,
        moisDepuis: mois
      });
    }
  };

  for (const [cle, r] of Object.entries(REGLEMENT)) {
    if (!r) continue;
    examiner(cle, r.fondement);
    if (r.validite) examiner(cle, r.validite);
    for (const regle of r.regles) examiner(cle, regle);
  }
  for (const [cle, r] of Object.entries(REGLEMENT_COPRO)) {
    examiner(cle, r.fondement);
  }

  return vieux.sort((a, b) => b.moisDepuis - a.moisDepuis);
}

/**
 * Les diagnostics dont le texte fondateur n'a pas encore été lu.
 *
 * C'est la liste de travail de la veille : tant qu'un diagnostic figure ici,
 * l'application ne doit rien affirmer de réglementaire à son sujet — elle peut
 * restituer ce que le rapport écrit, jamais dire ce que la loi exige.
 *
 * Elle est volontairement visible dans le code plutôt que rangée dans un carnet
 * : une case vide qu'on croise en travaillant finit par se remplir.
 */
export function casesVides(): TypeDiag[] {
  const TOUS: TypeDiag[] = [
    'dpe',
    'amiante',
    'plomb',
    'electricite',
    'gaz',
    'termites',
    'erp',
    'carrez',
    'assainissement'
  ];
  return TOUS.filter((t) => !REGLEMENT[t]);
}

/** Les sources d'un diagnostic, pour les citer à l'écran. */
export function sourcesDe(type: TypeDiag): Source[] {
  const r = REGLEMENT[type];
  if (!r) return [];
  const toutes = [r.fondement, ...(r.validite ? [r.validite] : []), ...r.regles];
  const vues = new Set<string>();
  return toutes
    .map((x) => x.source)
    .filter((s) => {
      if (vues.has(s.url + s.reference)) return false;
      vues.add(s.url + s.reference);
      return true;
    });
}
