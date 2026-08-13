/**
 * Les notions de l'assainissement non collectif.
 *
 * Le diagnostic ne concerne que les logements sans tout-à-l'égout. Il se lit en
 * suivant l'eau : elle sort de la maison, se décante, puis se traite dans le
 * sol. Chaque étape a son défaut typique.
 */
import { trouve, type Notion } from './socle';

export const NOTIONS_ASSAINISSEMENT: Notion[] = [
  {
    id: 'assainissement-non-collectif',
    terme: 'Assainissement non collectif',
    definition:
      'L’installation qui traite sur place les eaux usées d’un logement non raccordé au tout-à-l’égout. Abrégée ANC dans les rapports.',
    niveaux: [
      {
        rang: 2,
        bribes: [
          { texte: 'Elle remplace le réseau public : la maison traite ses eaux chez elle.' },
          {
            texte: 'Deux temps toujours : on sépare d’abord, on traite ensuite.',
            clips: ['fosse-toutes-eaux', 'epandage']
          }
        ]
      },
      {
        rang: 3,
        bribes: [
          {
            texte:
              'À la vente, le diagnostic est obligatoire et doit dater de moins de trois ans.'
          },
          {
            texte:
              'Si l’installation est déclarée non conforme, l’acheteur a un an après la signature pour la mettre aux normes.'
          },
          { texte: 'Le coût d’une réfection complète se compte en milliers d’euros : cela se négocie.' }
        ]
      },
      {
        rang: 4,
        bribes: [
          { texte: 'Une installation défaillante rejette des eaux mal traitées dans le sol ou le fossé.' },
          { texte: 'Risque sanitaire s’il y a un puits ou un captage à proximité.' },
          { texte: 'Odeurs, remontées dans les sanitaires, zone détrempée au-dessus du champ d’épandage.' }
        ]
      },
      {
        rang: 7,
        bribes: [
          {
            texte:
              'Le contrôle est fait par le SPANC, le service public d’assainissement non collectif de la commune — pas par un diagnostiqueur privé.'
          },
          {
            texte:
              'Il regarde ce qui est visible et accessible : il n’excave pas. Un défaut enterré peut lui échapper.'
          }
        ]
      }
    ],
    chezMoi: (diagnostics) => {
      const anc = trouve(diagnostics, 'assainissement');
      if (!anc) return { etat: 'absent' };
      return { etat: 'dit', phrase: anc.verdict };
    }
  },

  {
    id: 'fosse-toutes-eaux',
    terme: 'Fosse toutes eaux',
    definition:
      'La cuve enterrée qui reçoit toutes les eaux usées du logement et laisse les matières se déposer avant que l’eau reparte.',
    niveaux: [
      {
        rang: 2,
        bribes: [
          { texte: 'Les boues tombent au fond, les graisses flottent, l’eau sort au milieu.' },
          { texte: 'Elle ne traite pas l’eau : elle la prépare. Le traitement, c’est le sol qui le fait.', clips: ['epandage'] },
          {
            texte:
              'Elle remplace l’ancienne « fosse septique », qui ne recevait que les eaux des toilettes.'
          }
        ]
      },
      {
        rang: 5,
        bribes: [
          { texte: 'Une vidange trop espacée : les boues débordent vers l’épandage et le colmatent.' },
          { texte: 'Une ventilation absente : les odeurs remontent et la cuve se dégrade.' },
          { texte: 'Des produits de nettoyage agressifs, qui tuent les bactéries utiles.' }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'Vidange par un professionnel dès que les boues occupent la moitié du volume.' },
          { texte: 'Garder les regards accessibles : un contrôle commence par les ouvrir.' }
        ]
      }
    ]
  },

  {
    id: 'epandage',
    terme: 'Épandage',
    definition:
      'Le réseau de tuyaux percés enterrés dans le terrain, où l’eau sortie de la fosse s’infiltre et se fait épurer par le sol.',
    niveaux: [
      {
        rang: 2,
        bribes: [
          { texte: 'Ce sont les bactéries du sol qui font le vrai traitement.' },
          {
            texte:
              'D’où sa taille : il faut de la surface, et un terrain qui absorbe. Une étude de sol la détermine.'
          }
        ]
      },
      {
        rang: 4,
        bribes: [
          { texte: 'Colmaté, il refoule : zone détrempée, odeurs, eau qui remonte dans la maison.' },
          {
            texte:
              'Sous-dimensionné ou trop proche d’un puits, il devient un risque sanitaire.',
            clips: ['assainissement-non-collectif']
          }
        ]
      },
      {
        rang: 6,
        bribes: [
          { texte: 'Ne jamais rouler ni stationner dessus : les drains s’écrasent.' },
          { texte: 'Pas d’arbre à proximité : les racines cherchent l’eau et bouchent les tuyaux.' },
          { texte: 'Sur un terrain qui n’absorbe pas, un filtre à sable remplace l’épandage classique.' }
        ]
      }
    ]
  }
];
