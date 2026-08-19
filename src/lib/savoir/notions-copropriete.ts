/**
 * Les notions de la copropriété — DTG, PPPT, et le vocabulaire des travaux.
 *
 * Écrites après la lecture intégrale d'un diagnostic technique global réel
 * (juin 2026, mise en copropriété de quatre lots). Ce document n'a rien à voir
 * avec les diagnostics du logement : il ne parle pas d'un appartement mais
 * d'un immeuble, il ne conclut pas par un verdict mais par un calendrier de
 * dépenses, et il est lu par des copropriétaires qui votent — pas par un
 * acheteur.
 *
 * Deux pièges de lecture y sont si contre-intuitifs qu'ils méritent d'ouvrir
 * ce fichier : « curatif niveau 1 » désigne le plus GRAVE, et le montant en
 * euros ne dit rien de la gravité. Sur le rapport lu, le seul défaut qui
 * engageait la sécurité des personnes était le moins cher de tous.
 */
import type { Notion } from './socle';

export const NOTIONS_COPROPRIETE: Notion[] = [
  {
    id: 'dtg',
    terme: 'DTG (diagnostic technique global)',
    definition:
      'L’examen de santé de l’immeuble entier : son état apparent, ce que la copropriété doit légalement tenir à jour, et les travaux à prévoir sur dix ans.',
    niveaux: [
      {
        rang: 2,
        bribes: [
          {
            texte:
              'Il regarde les parties communes — toiture, façades, escaliers, caves, réseaux — jamais l’intérieur des appartements.'
          },
          {
            texte:
              'Il sert à décider ensemble : sans lui, une assemblée générale vote des travaux sans savoir ce qui presse.'
          }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'Il est obligatoire quand un immeuble de plus de dix ans est mis en copropriété, quand l’administration l’exige, ou quand l’assemblée générale le décide.',
            clips: ['pppt']
          },
          {
            texte:
              'Il chiffre les travaux sur dix ans, répartis en trois périodes : 0 à 2 ans, 3 à 5 ans, 6 à 10 ans.'
          }
        ]
      },
      {
        rang: 4,
        bribes: [
          {
            texte:
              'Ce n’est pas une expertise de solidité : aucun sondage, aucune destruction, rien de démonté. Ce qui est caché reste caché.'
          },
          {
            texte:
              'Il ne remplace pas non plus les diagnostics obligatoires de la vente — amiante, plomb, électricité, gaz.'
          }
        ]
      },
      {
        rang: 6,
        bribes: [
          {
            texte:
              'Les montants annoncés sont des ordres de grandeur, hors taxes, sans honoraires de maître d’œuvre ni diagnostics avant travaux.',
            clips: ['curatif']
          },
          {
            texte:
              'Un devis d’entreprise s’en écarte souvent : le DTG sert à prioriser, pas à commander.'
          }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'Chaque désordre observé reçoit une famille (façade, couverture, structure…), un classement, une période et un montant.'
          },
          {
            texte:
              'Une rubrique qui affiche « Aucun élément » est un résultat : le diagnostiqueur a regardé et n’a rien trouvé à signaler.'
          }
        ]
      }
    ]
    /* Pas de « chez moi » : Verrière lit des dossiers de logement, pas encore
       des rapports d'immeuble. Le jour où elle en lira, c'est ici que la
       réponse se branchera. */
  },

  {
    id: 'curatif',
    terme: 'Curatif niveau 1, 2, 3',
    definition:
      'L’échelle d’urgence des travaux du DTG. Elle se lit à l’envers de ce qu’on croit : le niveau 1 est le plus grave.',
    niveaux: [
      {
        rang: 2,
        bribes: [
          {
            texte:
              'Niveau 1 : impact fort — risque pour les personnes, ou atteinte à l’intégrité du bâtiment.'
          },
          { texte: 'Niveau 2 : impact modéré — l’ouvrage est affaibli par des dégradations importantes.' },
          {
            texte:
              'Niveau 3 : impact faible — à traiter dès les premiers défauts, pour éviter que cela s’aggrave.'
          }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'Le montant ne dit pas la gravité. Sur un rapport lu, le seul niveau 1 — une balustrade d’escalier dégradée, donc un risque de chute — était le poste le MOINS cher du calendrier, très loin derrière une façade classée niveau 3.'
          },
          {
            texte:
              'Lire la colonne des euros pour hiérarchiser, c’est donc commencer par le mauvais bout.'
          }
        ]
      },
      {
        rang: 4,
        bribes: [
          {
            texte:
              'Trois autres classements ne sont pas des travaux : « Entretien » (récurrent, jamais chiffré), « Signalements » (une remarque), « Énergie » (les scénarios du DPE).'
          },
          {
            texte:
              'Un poste « Entretien » sans montant n’est pas gratuit : il n’est simplement pas chiffré, parce qu’il revient chaque année.'
          }
        ]
      }
    ]
  },

  {
    id: 'pppt',
    terme: 'PPPT (plan pluriannuel de travaux)',
    definition:
      'La suite du DTG : la liste des travaux à programmer sur dix ans, avec leur échéancier, que la copropriété vote.',
    niveaux: [
      {
        rang: 2,
        bribes: [
          {
            texte:
              'Le DTG constate ; le PPPT programme. L’un décrit l’immeuble, l’autre engage l’argent.',
            clips: ['dtg']
          },
          {
            texte:
              'Il est obligatoire pour les copropriétés d’habitation dont la réception des travaux date de plus de quinze ans.'
          }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'Le calendrier d’entrée en vigueur dépend de la taille : au-delà de 200 lots d’abord, puis de 51 à 200, puis en deçà de 51.'
          },
          {
            texte:
              'Un DTG de moins de dix ans peut en tenir lieu s’il comporte déjà ce qu’exige le plan.'
          }
        ]
      }
    ]
  },

  {
    id: 'dpe-collectif',
    terme: 'DPE collectif',
    definition:
      'Le diagnostic de performance énergétique de l’immeuble entier, distinct de celui d’un appartement.',
    niveaux: [
      {
        rang: 2,
        bribes: [
          {
            texte:
              'Il fait partie des quatre volets que le DTG doit comporter : sans lui, le DTG est incomplet.',
            clips: ['dtg']
          },
          {
            texte:
              'Il concerne les immeubles d’habitation collective dont le permis de construire est antérieur à 2013.'
          }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'Il se renouvelle tous les dix ans, sauf si un diagnostic postérieur à juillet 2021 classe le bâtiment en A, B ou C.'
          },
          {
            texte:
              'Son calendrier d’obligation s’étale selon le nombre de lots — les plus petites copropriétés sont les dernières concernées.'
          }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'Sur un DTG lu, la rubrique portait « Aucun bilan énergétique n’a été réalisé à ce jour » et la conclusion, « Bilan énergétique : Absent ». Le rapport signale lui-même ce qui lui manque : c’est une information, pas un silence.'
          }
        ]
      }
    ]
  }
];
