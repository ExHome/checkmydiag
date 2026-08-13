/**
 * Les notions du diagnostic termites.
 *
 * Ils viennent du sol, remontent à couvert, et mangent le bois de l'intérieur.
 * Trois étapes, trois notions.
 */
import { trouve, type Notion } from './socle';

export const NOTIONS_TERMITES: Notion[] = [
  {
    id: 'termite',
    terme: 'Termite',
    definition:
      'Un insecte social qui vit en colonie dans le sol et se nourrit de la cellulose du bois. Il ne vole pas, sauf quelques jours par an.',
    niveaux: [
      {
        rang: 1,
        bribes: [
          { texte: 'Une colonie compte plusieurs centaines de milliers d’individus.' },
          { texte: 'Elle vit dans le terrain, pas dans le logement : elle vient de dehors.' },
          { texte: 'Blanc pâle, sans taille marquée — on le confond souvent avec une fourmi.' }
        ]
      },
      {
        rang: 5,
        bribes: [
          { texte: 'Le terrain du logement, celui du voisin, ou un souche laissée en terre.' },
          { texte: 'Le bois humide et sombre l’attire : cave, vide sanitaire, bas de mur.' }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'Le traitement se fait par barrière chimique dans le sol, ou par pièges à appât.' },
          { texte: 'Une déclaration en mairie est obligatoire dans les zones classées.' }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const termites = trouve(diagnostics, 'termites');
      if (!termites) return { etat: 'absent' };
      return { etat: 'dit', phrase: termites.verdict };
    }
  },

  {
    id: 'cordonnet',
    terme: 'Cordonnet',
    definition:
      'Le petit tunnel de terre que les termites construisent le long d’un mur pour monter à l’abri de la lumière.',
    niveaux: [
      {
        rang: 2,
        bribes: [
          { texte: 'Les termites fuient la lumière et l’air sec : ils se fabriquent un couloir.', clips: ['termite'] },
          { texte: 'Il relie la colonie, qui vit dans le sol, au bois qu’ils mangent.' }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'C’est le seul indice visible sans rien démonter. Le diagnostic repose en grande partie dessus.'
          }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'Le diagnostiqueur cherche à l’œil nu et sonde le bois accessible. Il ne démonte rien et n’ouvre pas les cloisons.'
          },
          { texte: 'C’est pour ça que ce document ne vaut que six mois.' }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const termites = trouve(diagnostics, 'termites');
      if (!termites) return { etat: 'absent' };
      return { etat: 'dit', phrase: termites.verdict };
    }
  },

  {
    id: 'bois-attaque',
    terme: 'Bois attaqué',
    definition:
      'Du bois creusé de l’intérieur par les termites, dont la surface reste intacte — comme une pomme véreuse, parfaite dehors et vide dedans.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          { texte: 'Une plinthe ou une poutre peut sonner creux sans qu’on voie rien.' },
          { texte: 'C’est pour ça qu’on tapote et qu’on sonde : l’œil seul ne suffit pas.' }
        ]
      },
      {
        rang: 4,
        bribes: [
          { texte: 'Sur une charpente ou une poutre porteuse, la résistance de la structure est en jeu.' },
          { texte: 'L’attaque est lente : elle se compte en années, pas en semaines.' }
        ]
      }
    ]
  }
];
