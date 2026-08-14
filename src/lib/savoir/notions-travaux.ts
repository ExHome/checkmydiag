/**
 * Le prix des travaux — la profondeur du § 16.
 *
 * L'ordre de mission demande d'aller jusqu'à « combien ça coûte ? », mais il
 * l'assortit d'une condition : un ordre de grandeur seulement lorsque des
 * données sérieuses existent. Nous n'en avons aucune, et la deuxième promesse
 * du produit interdit d'en inventer.
 *
 * Alors on fait l'autre moitié, celle qui sert vraiment : on explique **ce qui
 * fait le prix**. Un lecteur qui a trois devis sous les yeux et qui comprend
 * pourquoi ils vont du simple au double est mieux armé qu'un lecteur à qui on
 * aurait servi une fourchette inventée.
 *
 * Le jour où une source sérieuse sera branchée, elle se posera ici, au rang 7,
 * sans rien changer au reste.
 */
import { trouve, type Notion } from './socle';

/** Les six facteurs du § 16, chacun sa notion. */
const FACTEURS = ['surface-a-traiter', 'materiau', 'accessibilite', 'technique', 'region', 'finition'];

export const NOTIONS_TRAVAUX: Notion[] = [
  {
    id: 'prix-des-travaux',
    terme: 'Prix des travaux',
    definition:
      'Ce qu’un devis facture pour une intervention. Deux devis pour le même travail peuvent aller du simple au double, et ce n’est pas forcément qu’un des deux triche.',
    niveaux: [
      {
        rang: 1,
        bribes: [
          { texte: 'Un devis se décompose toujours : la fourniture, la pose, et ce qui va autour.' },
          {
            texte:
              'Ce qui va autour, c’est la dépose de l’existant, son évacuation en déchetterie, l’échafaudage, la protection des lieux, la remise en état.'
          },
          { texte: 'Puis la TVA, à 5,5 %, 10 % ou 20 % selon la nature des travaux et l’âge du logement.' }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'C’est ce qui permet de comparer trois devis : sans le détail, on compare deux totaux qui ne recouvrent pas le même travail.'
          },
          {
            texte:
              'Un devis moins cher qui omet l’échafaudage ou l’évacuation n’est pas moins cher : il est incomplet.',
            clips: ['accessibilite']
          }
        ]
      },
      {
        rang: 5,
        registre: 'explication',
        question: 'Qu’est-ce qui fait varier le prix ?',
        bribes: [
          { texte: 'La surface à traiter, et l’effet de seuil des petits chantiers.', clips: ['surface-a-traiter'] },
          { texte: 'Le matériau retenu, à performance égale.', clips: ['materiau'] },
          { texte: 'L’accessibilité du chantier — c’est souvent le premier poste caché.', clips: ['accessibilite'] },
          { texte: 'La technique de pose, qui n’est pas toujours au choix.', clips: ['technique'] },
          { texte: 'La région, par le coût de la main-d’œuvre et la tension du marché.', clips: ['region'] },
          { texte: 'Le niveau de finition attendu.', clips: ['finition'] }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'Trois devis, et exiger le détail poste par poste — pas un forfait global.' },
          {
            texte:
              'Vérifier que chacun décrit le même travail : même surface, même matériau, même épaisseur.',
            clips: ['resistance-thermique']
          },
          {
            texte:
              'Pour les aides, l’entreprise doit être certifiée RGE, et le devis signé après l’accord de l’organisme — jamais avant.'
          }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'Check My Diag ne donne pas de prix : nous n’avons pas de source assez sérieuse pour en avancer un, et un chiffre inventé serait pire que rien.'
          },
          {
            /*
             * La phrase disait le contraire du texte. L'article R. 126-16 du
             * code de la construction impose au DPE des recommandations
             * accompagnées d'une évaluation de leur coût, et le modèle de
             * l'arrêté du 31 mars 2021 la présente en fourchette, bouquet par
             * bouquet. Le DPE chiffre donc bien ce qu'il recommande.
             */
            texte:
              'Un DPE chiffre ses recommandations : sa page « recommandations » donne une fourchette de coût pour chaque bouquet de travaux proposé. L’audit énergétique va plus loin — étapes, gains attendus, aides — et en copropriété le diagnostic technique global chiffre les travaux des dix ans à venir. Dans tous les cas, ce sont des estimations, jamais des devis.'
          }
        ]
      }
    ],
    /*
     * Cette fonction ignorait son paramètre : au seul endroit du produit qui
     * promet de parler du document déposé, elle ne l'ouvrait pas. Elle regarde
     * désormais si un DPE est là, et dit où en trouver les montants.
     */
    chezMoi: (diagnostics) => {
      if (!trouve(diagnostics, 'dpe')) return { etat: 'absent' };
      return {
        etat: 'muet',
        phrase:
          'Nous ne relisons pas les montants de votre rapport. Mais votre DPE en porte : sa page « recommandations » chiffre en fourchette le ou les bouquets de travaux qu’il propose — une estimation calculée sur des moyennes, faite sans avoir vu votre chantier. Le seul chiffre qui vous engagera est celui d’un devis signé.'
      };
    }
  },

  {
    id: 'surface-a-traiter',
    terme: 'Surface à traiter',
    definition:
      'Le nombre de mètres carrés sur lesquels l’entreprise intervient — qui n’est pas la surface du logement.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          { texte: 'Le prix au mètre carré baisse quand la surface monte : le déplacement et l’installation se répartissent.' },
          {
            texte:
              'D’où l’effet de seuil : un petit chantier coûte cher au mètre carré, et parfois plus cher au total qu’on l’imaginait.'
          },
          { texte: 'Isoler 30 m² de combles ne coûte pas le tiers de 90 m².' }
        ]
      }
    ]
  },

  {
    id: 'materiau',
    terme: 'Matériau',
    definition:
      'Ce qu’on pose. À performance égale, deux matériaux peuvent varier du simple au triple — et ne pas se comporter pareil dans le temps.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          {
            texte:
              'Ce qui se compare, ce n’est pas l’épaisseur mais la résistance thermique obtenue.',
            clips: ['resistance-thermique']
          },
          {
            texte:
              'Les matériaux biosourcés — ouate, fibre de bois, chanvre — coûtent plus cher à l’achat et se comportent mieux en été.'
          },
          { texte: 'La durée de vie et le tassement dans le temps ne se voient pas sur un devis.' }
        ]
      }
    ]
  },

  {
    id: 'accessibilite',
    terme: 'Accessibilité',
    definition:
      'La facilité avec laquelle l’entreprise atteint la zone de travail. C’est le poste que les particuliers oublient, et celui qui explique le plus souvent l’écart entre deux devis.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          { texte: 'Des combles où l’on tient debout, ou une trappe de 50 cm : ce n’est pas le même chantier.' },
          { texte: 'Un étage, une rue étroite, pas de place pour la benne — tout se facture.' },
          { texte: 'L’échafaudage peut représenter une part importante d’une isolation par l’extérieur.', clips: ['murs'] }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'Faire venir l’entreprise sur place avant de signer : un devis fait au téléphone se révise toujours à la hausse.' }
        ]
      }
    ]
  },

  {
    id: 'technique',
    terme: 'Technique de pose',
    definition:
      'La méthode employée. Elle n’est pas toujours au choix : la configuration du logement en impose souvent une.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          { texte: 'Combles perdus : isolant soufflé, rapide et peu cher, ou déroulé si l’on veut circuler.', clips: ['toiture'] },
          {
            texte:
              'Murs : par l’extérieur, plus efficace et plus cher, il traite les jonctions ; par l’intérieur, moins cher, il mange de la surface.',
            clips: ['pont-thermique']
          },
          { texte: 'Une même performance affichée peut recouvrir deux chantiers très différents.' }
        ]
      }
    ]
  },

  {
    id: 'region',
    terme: 'Région',
    definition:
      'Le lieu du chantier. Le coût de la main-d’œuvre et la tension du carnet de commandes ne sont pas les mêmes partout.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          { texte: 'Le prix horaire varie d’une région à l’autre, et davantage entre ville et campagne.' },
          {
            texte:
              'Une période de forte demande — après un dispositif d’aide, par exemple — fait monter les devis partout.'
          },
          { texte: 'Certaines aides locales existent en plus des nationales : elles se cumulent parfois.' }
        ]
      }
    ]
  },

  {
    id: 'finition',
    terme: 'Finition',
    definition:
      'Ce qui reste visible une fois le chantier fini. C’est là que le budget dérape le plus discrètement.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          { texte: 'Un enduit de façade, un parement, des appuis de fenêtre à reprendre : la performance est la même, la note non.' },
          { texte: 'À l’intérieur : bandes, enduit, peinture, plinthes reposées — souvent hors devis.' },
          { texte: 'Vérifier ce que « remise en état » recouvre exactement dans le devis.', clips: ['prix-des-travaux'] }
        ]
      }
    ]
  }
];

/** Les facteurs, pour les tests et pour toute présentation groupée. */
export const FACTEURS_DE_PRIX = FACTEURS;
