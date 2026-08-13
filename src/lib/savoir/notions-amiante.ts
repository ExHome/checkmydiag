/**
 * Les notions du diagnostic amiante.
 *
 * Une seule idée porte tout : enfermée, l'amiante ne fait rien ; libérée, elle
 * se respire et ne ressort plus.
 */
import { trouve, type Notion } from './socle';

export const NOTIONS_AMIANTE: Notion[] = [
  {
    id: 'amiante',
    terme: 'Amiante',
    definition:
      'Une roche fibreuse, incorporée aux matériaux de construction jusqu’à son interdiction en 1997 pour sa résistance au feu.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          {
            texte:
              'Le danger ne vient pas de sa présence, mais de ce qu’on lui fait : percer, poncer, casser.',
            clips: ['fibre-amiante']
          },
          { texte: 'Un matériau amianté intact et enfermé peut rester en place des années.' }
        ]
      },
      {
        rang: 5,
        bribes: [
          {
            texte: 'On la trouve surtout dans le fibrociment, les colles de carrelage et les dalles de sol.',
            clips: ['fibrociment']
          },
          { texte: 'Aussi dans les flocages, les calorifugeages et certains enduits.' },
          { texte: 'Un logement construit après 1997 n’en contient pas : c’est la date du permis qui compte.' }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'Ne jamais percer, poncer ni découper soi-même un matériau signalé.' },
          { texte: 'Selon l’état : surveiller tous les trois ans, encapsuler, ou faire retirer par une entreprise certifiée.', clips: ['prix-des-travaux'] }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'Le diagnostiqueur repère à vue et prélève au besoin. Il ne démonte rien : ce qui est caché derrière une cloison n’est pas vu.'
          },
          { texte: 'Un repérage « avant travaux » est bien plus poussé que celui de la vente.' }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const amiante = trouve(diagnostics, 'amiante');
      if (!amiante) return { etat: 'absent' };
      return { etat: 'dit', phrase: amiante.verdict };
    }
  },

  {
    id: 'fibre-amiante',
    terme: 'Fibre d’amiante',
    definition:
      'Un fragment invisible à l’œil nu, des centaines de fois plus fin qu’un cheveu, qui se loge au fond des poumons sans pouvoir en ressortir.',
    niveaux: [
      {
        rang: 4,
        bribes: [
          { texte: 'Le corps ne sait pas l’évacuer : elle reste et irrite le tissu pendant des années.' },
          { texte: 'Cancers de la plèvre et du poumon, souvent trente à quarante ans après.' },
          { texte: 'Il n’existe pas de seuil en dessous duquel le risque serait nul.' }
        ]
      },
      {
        rang: 5,
        bribes: [
          { texte: 'Une perceuse, une ponceuse, une scie — quelques secondes suffisent.' },
          { texte: 'Un matériau qui se dégrade seul en libère aussi, plus lentement.' }
        ]
      }
    ]
  },

  {
    id: 'fibrociment',
    terme: 'Fibrociment',
    definition:
      'Un mélange de ciment et de fibres, moulé en plaques ou en tuyaux. Jusqu’en 1997, les fibres étaient de l’amiante.',
    schema: 'fibrociment',
    niveaux: [
      {
        rang: 1,
        bribes: [
          { texte: 'Plaques ondulées de toiture, conduits, bacs, descentes d’eau.' },
          { texte: 'Les fibres y sont prises dans le ciment, comme des graviers dans du béton.' }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'Tant que la plaque est saine, elle ne libère rien. C’est un matériau dit « non friable ».',
            clips: ['amiante']
          },
          {
            texte:
              'Une plaque cassée, percée ou rongée par les mousses relâche des fibres.',
            clips: ['fibre-amiante']
          }
        ]
      }
    ]
  }
];
