import type { Theme } from '../socle';

const V = '2026-08-13';
const LEGI = 'https://www.legifrance.gouv.fr';

export const ASSAINISSEMENT: Theme = {
  id: 'assainissement',
  titre: 'Assainissement',
  h1: 'Assainissement non collectif : le contrôle du SPANC',
  resume:
    'Pas de tout-à-l’égout ? Vos eaux usées s’épurent dans votre terrain, et cette installation est contrôlée. C’est l’un des rares rapports qui peut coûter cher à l’acheteur — dans l’année qui suit la vente.',
  dessin: 'assainissement',

  questions: [
    {
      id: 'c-est-quoi-le-diagnostic-assainissement',
      question: 'C’est quoi le contrôle d’assainissement non collectif ?',
      variantes: [
        'diagnostic assainissement vente maison',
        'SPANC contrôle obligatoire',
        'fosse septique vente'
      ],
      court:
        'Le contrôle de votre installation individuelle d’eaux usées, réalisé par le service public d’assainissement non collectif — le SPANC — de votre commune. Il est obligatoire pour vendre une maison non raccordée au réseau public, et vaut trois ans.',
      dessin: 'assainissement',
      points: [
        'Il est réalisé par le SPANC, pas par un diagnostiqueur privé : c’est une exception dans le dossier.',
        'Il vérifie la conception, l’implantation, l’état et l’entretien de l’installation : fosse, ventilation, épandage.',
        'Il conclut à la conformité, ou liste les non-conformités avec leur degré d’urgence.',
        'Il faut le demander tôt : les délais du SPANC se comptent souvent en semaines, parfois davantage.',
        'Il ne concerne que la maison individuelle non raccordée — un logement sur le tout-à-l’égout n’a rien à fournir.'
      ],
      chezMoi:
        'Le rapport du SPANC a une mise en page très différente du reste du dossier : c’est un document administratif communal, pas un rapport de diagnostiqueur.',
      aussi: ['mon-assainissement-est-non-conforme', 'quels-diagnostics-pour-vendre'],
      sources: [{ titre: 'Code de la santé publique, article L. 1331-11-1', url: LEGI }],
      verifie: V
    },

    {
      id: 'mon-assainissement-est-non-conforme',
      question: 'Mon installation est non conforme : qui paie les travaux ?',
      variantes: [
        'assainissement non conforme vente qui paie',
        'travaux fosse septique délai 1 an',
        'mise en conformité assainissement obligation'
      ],
      court:
        'C’est l’acheteur, sauf accord contraire. Quand le contrôle conclut à une non-conformité, les travaux doivent être réalisés dans un délai d’un an après la signature de l’acte — et c’est le nouveau propriétaire qui en répond.',
      points: [
        'Ce point se négocie : beaucoup d’acheteurs obtiennent une baisse du prix correspondant au devis de remise en état.',
        'Le montant n’est pas anodin : une filière complète à refaire représente un budget de travaux, pas une réparation.',
        'Le SPANC valide le projet avant travaux, puis contrôle la réalisation : ne lancez rien sans son accord.',
        'Des aides existent selon les agences de l’eau et les collectivités : renseignez-vous avant de commander.',
        'Un danger sanitaire avéré raccourcit le délai : il s’agit alors d’agir sans attendre.'
      ],
      piege:
        'Le rapport du SPANC est souvent lu en diagonale parce qu’il ressemble à un courrier administratif. C’est pourtant l’un des rares documents du dossier qui engage une dépense datée pour l’acheteur.',
      aussi: ['c-est-quoi-le-diagnostic-assainissement', 'les-diagnostics-font-ils-baisser-le-prix', 'une-anomalie-empeche-t-elle-de-vendre'],
      sources: [{ titre: 'Code de la santé publique, article L. 1331-11-1', url: LEGI }],
      verifie: V
    }
  ]
};
