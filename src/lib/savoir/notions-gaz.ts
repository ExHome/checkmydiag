/**
 * Les notions du diagnostic gaz.
 *
 * Une flamme mange de l'air et rejette des fumées. Tout le diagnostic tient
 * dans ces deux trajets : celui qui entre, celui qui sort.
 */
import { trouve, type Notion } from './socle';

export const NOTIONS_GAZ: Notion[] = [
  {
    id: 'monoxyde-de-carbone',
    terme: 'Monoxyde de carbone',
    definition:
      'Un gaz produit par une flamme qui manque d’air. Il ne se voit pas, ne se sent pas, et il tue.',
    niveaux: [
      {
        rang: 4,
        bribes: [
          { texte: 'Maux de tête, nausées, fatigue anormale — les premiers signes ressemblent à une grippe.' },
          { texte: 'À forte dose, il endort puis il tue, sans que personne se réveille.' },
          { texte: 'C’est la première cause de mort par intoxication accidentelle en France.' }
        ]
      },
      {
        rang: 5,
        bribes: [
          {
            texte: 'Une grille de ventilation bouchée, calfeutrée ou obstruée par un meuble.',
            clips: ['ventilation']
          },
          { texte: 'Un conduit de fumées encrassé, ou un appareil mal réglé.', clips: ['conduit-de-fumees'] },
          { texte: 'Une hotte puissante qui aspire l’air dont la flamme a besoin.' }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'Ne jamais boucher une grille d’air, même en hiver, même si ça souffle.' },
          { texte: 'Faire ramoner le conduit et entretenir la chaudière chaque année.' },
          { texte: 'Au moindre doute : aérer, sortir, appeler les secours.' }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'Le diagnostiqueur contrôle l’arrivée d’air, l’évacuation des fumées et l’état de l’appareil — il ne mesure pas le gaz en continu.'
          },
          { texte: 'Un danger grave et immédiat coupe l’alimentation le jour même.' }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const gaz = trouve(diagnostics, 'gaz');
      if (!gaz) return { etat: 'absent' };
      return { etat: 'dit', phrase: gaz.verdict };
    }
  },

  {
    id: 'conduit-de-fumees',
    terme: 'Conduit de fumées',
    definition:
      'Le tuyau qui emmène dehors ce que la flamme rejette. Il ne sert à rien de brûler proprement si les fumées reviennent dans la pièce.',
    niveaux: [
      {
        rang: 2,
        bribes: [
          { texte: 'Il tire par différence de température : l’air chaud monte tout seul.' },
          { texte: 'C’est pour ça qu’un conduit froid ou bouché cesse d’évacuer.' }
        ]
      },
      {
        rang: 4,
        bribes: [
          {
            texte:
              'Encrassé, fissuré ou mal raccordé, il renvoie les fumées — donc le monoxyde — à l’intérieur.',
            clips: ['monoxyde-de-carbone']
          },
          { texte: 'Un nid d’oiseau suffit à le boucher entièrement.' }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'Ramonage annuel, souvent exigé par l’assurance.' },
          { texte: 'Un détecteur de monoxyde coûte peu et prévient avant les symptômes.' }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const gaz = trouve(diagnostics, 'gaz');
      if (!gaz) return { etat: 'absent' };
      return {
        etat: 'muet',
        phrase:
          'Le rapport gaz contrôle l’évacuation, mais son détail ligne à ligne se lit dans le document lui-même.'
      };
    }
  }
];
