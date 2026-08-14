/**
 * Les notions du diagnostic électrique.
 *
 * Le rapport conclut sur six domaines d'anomalies (arrêté du 28 septembre 2017,
 * annexe III), auxquels s'ajoutent les installations particulières — piscine,
 * appareils alimentés depuis les parties communes.
 *
 * Une version antérieure de ce fichier disait « six points contrôlés, dont deux
 * seulement protègent les personnes ». C'était doublement faux. Ce sont des
 * domaines, chacun regroupant plusieurs points de contrôle de l'annexe I ; et
 * l'article 1er de l'arrêté assigne à l'ensemble de l'état l'évaluation des
 * « risques pouvant porter atteinte à la sécurité des personnes ». Les contacts
 * directs et la salle d'eau protègent les personnes autant que le différentiel.
 */
import { trouve, type Notion } from './socle';

export const NOTIONS_ELECTRICITE: Notion[] = [
  {
    id: 'differentiel',
    terme: 'Dispositif différentiel',
    definition:
      'L’appareil du tableau électrique qui compare le courant qui part et celui qui revient, et coupe tout dès qu’il en manque.',
    niveaux: [
      {
        rang: 2,
        bribes: [
          {
            texte:
              'Le courant qui entre par un fil doit ressortir par l’autre. S’il en manque, c’est qu’il part ailleurs — par la terre, ou par une personne.',
            clips: ['mise-a-la-terre']
          },
          { texte: 'Le différentiel coupe en une fraction de seconde, avant que le cœur soit touché.' }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'C’est celui qui agit le plus vite quand le courant passe par une personne : il coupe avant que le cœur soit touché.'
          },
          { texte: 'Un disjoncteur ordinaire ne protège pas les personnes : il protège les fils.' }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'Le tester au bouton « test » deux fois par an : il doit couper.' },
          { texte: 'Son ajout se fait au tableau, par un électricien.' }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'Le diagnostiqueur vérifie sa présence, sa sensibilité (30 mA pour les personnes) et son déclenchement.'
          }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const elec = trouve(diagnostics, 'electricite');
      if (!elec) return { etat: 'absent' };
      return { etat: 'dit', phrase: elec.verdict };
    }
  },

  {
    id: 'mise-a-la-terre',
    terme: 'Mise à la terre',
    definition:
      'Le fil qui relie les parties métalliques d’un logement au sol, pour que le courant qui s’échappe parte dans le terrain plutôt que dans quelqu’un.',
    schema: 'terre',
    niveaux: [
      {
        rang: 2,
        bribes: [
          { texte: 'Une prise de terre plantée dans le sol, et un fil vert et jaune qui y ramène tout.' },
          {
            texte:
              'C’est elle qui offre au courant un chemin plus facile que le corps humain.',
            clips: ['differentiel']
          }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte: 'Sans elle, le différentiel a moins de chances de voir la fuite à temps.',
            clips: ['differentiel']
          },
          { texte: 'Les logements anciens en sont souvent dépourvus, en tout ou partie.' }
        ]
      },
      {
        rang: 4,
        bribes: [
          {
            texte:
              'Une carcasse métallique sous tension — machine à laver, four — devient dangereuse au simple contact.'
          },
          { texte: 'Le risque est le plus fort dans la salle de bains, où la peau est mouillée.' }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'La refaire suppose souvent de reprendre le tableau et une partie des circuits.', clips: ['prix-des-travaux'] },
          {
            texte:
              'Tant qu’elle manque, un différentiel 30 mA reste la protection la plus efficace à ajouter.',
            clips: ['differentiel']
          }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const elec = trouve(diagnostics, 'electricite');
      if (!elec) return { etat: 'absent' };

      // On ne conclut pas sur la terre à partir d'un verdict global : on renvoie
      // le lecteur à la ligne du rapport plutôt que d'affirmer à sa place.
      if (elec.schema?.genre === 'anomalies') {
        const groupe = elec.schema.groupes.find((g) => /terre|liaison/i.test(g.nom));
        if (groupe)
          return { etat: 'dit', phrase: `Votre rapport relève une anomalie sur ce point : ${groupe.nom}.` };
        return { etat: 'dit', phrase: 'Votre rapport ne classe aucune anomalie sur la mise à la terre.' };
      }
      return {
        etat: 'muet',
        phrase: 'Le rapport électrique est là, mais le détail par point de contrôle n’a pas pu être lu.'
      };
    }
  }
];
