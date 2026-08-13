/**
 * Les notions du diagnostic plomb (CREP).
 *
 * Tout tourne autour d'une seule idée : le plomb enfermé ne fait rien, la
 * peinture qui se dégrade fait de la poussière, et c'est la poussière qui rend
 * malade.
 */
import { trouve, type Notion } from './socle';

export const NOTIONS_PLOMB: Notion[] = [
  {
    id: 'saturnisme',
    terme: 'Saturnisme',
    definition:
      'L’intoxication au plomb. On l’attrape en avalant ou en respirant la poussière d’une vieille peinture qui se dégrade.',
    niveaux: [
      {
        rang: 3,
        bribes: [
          { texte: 'C’est la seule raison pour laquelle le diagnostic plomb existe.' },
          {
            texte:
              'Le plomb ne traverse pas la peau : il faut l’avaler ou le respirer. D’où l’importance de la poussière.'
          }
        ]
      },
      {
        rang: 4,
        bribes: [
          { texte: 'Atteintes du système nerveux, surtout avant six ans.' },
          { texte: 'La maladie est grave et on n’en guérit pas : les dégâts sont définitifs.' },
          { texte: 'Les jeunes enfants et les femmes enceintes sont les plus exposés.' }
        ]
      },
      {
        rang: 5,
        bribes: [
          {
            texte:
              'Une peinture au plomb en bon état ne libère rien. C’est sa dégradation qui fabrique la poussière.',
            clips: ['classe-3']
          },
          { texte: 'Frottements d’une fenêtre, humidité, chocs, travaux de ponçage.' }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'Ne jamais poncer ni gratter à sec une peinture ancienne.' },
          { texte: 'Recouvrir, encapsuler ou déposer — selon l’état, par une entreprise formée.' },
          { texte: 'En attendant : nettoyage humide, et surveiller les écailles au sol.' }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'Le diagnostiqueur mesure chaque unité au fluorescence X et la classe de 0 à 3 selon son état.',
            clips: ['classe-3']
          },
          { texte: 'Le rapport ne mesure pas le sang : il mesure les peintures.' }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const plomb = trouve(diagnostics, 'plomb');
      if (!plomb) return { etat: 'absent' };
      const schema = plomb.schema;
      if (schema?.genre !== 'plomb')
        return { etat: 'muet', phrase: 'Le rapport plomb est là, mais son détail n’a pas pu être lu.' };
      const graves = schema.classes[3] ?? 0;
      if (graves > 0)
        return {
          etat: 'dit',
          phrase: `Votre rapport relève ${graves} élément${graves > 1 ? 's' : ''} en classe 3 — c’est celle qui expose au saturnisme.`
        };
      return {
        etat: 'dit',
        phrase: 'Votre rapport ne relève aucune peinture en classe 3 : rien qui expose au saturnisme en l’état.'
      };
    }
  },

  {
    id: 'classe-3',
    terme: 'Classe 3',
    definition:
      'Le plus mauvais état d’une peinture au plomb : elle est dégradée — écaillée, pulvérulente ou fissurée — et elle fait de la poussière.',
    niveaux: [
      {
        rang: 1,
        bribes: [
          { texte: 'Classe 0 : pas de plomb.' },
          { texte: 'Classe 1 : du plomb, peinture intacte.' },
          { texte: 'Classe 2 : peinture usée, non dégradée.' },
          { texte: 'Classe 3 : peinture dégradée — la seule qui oblige à agir.' }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'Une seule unité en classe 3 déclenche l’obligation de travaux pour le propriétaire, et l’information de l’occupant.',
            clips: ['saturnisme']
          }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'La classe ne dit pas la quantité de plomb : elle dit l’état de la peinture. Une classe 1 très chargée est moins dangereuse qu’une classe 3 légère.'
          }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const plomb = trouve(diagnostics, 'plomb');
      if (!plomb) return { etat: 'absent' };
      if (plomb.schema?.genre !== 'plomb')
        return { etat: 'muet', phrase: 'Le rapport plomb est là, mais son détail n’a pas pu être lu.' };

      const lieux = plomb.schema.emplacements.filter((l) => l.classe === 3);
      if (!lieux.length)
        return { etat: 'dit', phrase: 'Aucune unité en classe 3 dans votre rapport.' };

      // Dire où, pas seulement combien : « 2 unités en classe 3 » n'aide personne.
      const ou = lieux.map((l) => `${l.zone} — ${l.element.toLowerCase()}`).join(' · ');
      return { etat: 'dit', phrase: `Classe 3 chez vous : ${ou}.` };
    }
  }
];
