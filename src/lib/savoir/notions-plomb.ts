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
          { texte: 'Recouvrir, encapsuler ou déposer — selon l’état, par une entreprise formée.', clips: ['prix-des-travaux'] },
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
          {
            /*
             * « Pas de plomb » etait faux, et rassurait a tort : la classe 0
             * signifie SOUS LE SEUIL, pas absence. L'arrete du 19 aout 2011
             * fixe ce seuil a 1 mg/cm² — c'est lui qui separe la classe 0 des
             * trois autres, et il n'apparaissait nulle part dans le produit.
             */
            texte:
              'Classe 0 : sous le seuil réglementaire d’un milligramme par centimètre carré. Cela ne veut pas dire zéro plomb — cela veut dire trop peu pour compter.'
          },
          { texte: 'Classe 1 : au-dessus du seuil, peinture intacte.' },
          { texte: 'Classe 2 : au-dessus du seuil, peinture en état d’usage — usée, mais pas dégradée.' },
          { texte: 'Classe 3 : au-dessus du seuil, peinture dégradée — la seule qui oblige à agir.' }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'Une seule unité en classe 3 déclenche l’obligation de travaux pour le propriétaire, et l’information de l’occupant.',
            clips: ['saturnisme']
          },
          {
            texte:
              'Le seuil d’un milligramme par centimètre carré est le même partout en France depuis 2011. En dessous, le diagnostiqueur écrit « classe 0 » et n’a rien à signaler ; au-dessus, c’est l’état de la peinture qui décide de la suite.'
          }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'La mesure se fait sans rien abîmer, avec un appareil à fluorescence X posé contre la paroi : il excite les atomes du revêtement et lit ce qu’ils renvoient. Une mesure suffit si elle dépasse le seuil ; sinon le diagnostiqueur en fait une deuxième, parfois une troisième.'
          },
          {
            texte:
              'C’est pourquoi le rapport porte des unités « non mesurées » : là où il n’y a pas de revêtement — pierre nue, carrelage, métal — il n’y a rien à mesurer. Ce n’est pas une partie du logement qui aurait échappé au contrôle.'
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
