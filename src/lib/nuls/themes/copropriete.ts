import type { Theme } from '../socle';

const V = '2026-08-13';
const LEGI = 'https://www.legifrance.gouv.fr';

export const COPROPRIETE: Theme = {
  id: 'copropriete',
  titre: 'Copropriété',
  h1: 'En copropriété : qui détient quoi, et qui paie quoi',
  resume:
    'DTG, plan pluriannuel de travaux, DPE collectif, dossier amiante des communs : quatre documents que la plupart des copropriétaires n’ont jamais vus, alors qu’ils décident de leurs charges des dix prochaines années.',
  dessin: 'dossier',

  questions: [
    {
      id: 'qui-detient-les-diagnostics-de-l-immeuble',
      question: 'Qui détient les diagnostics des parties communes ?',
      variantes: [
        'diagnostics parties communes syndic',
        'demander le DTA au syndic',
        'documents copropriété diagnostic'
      ],
      court:
        'Le syndic. Il conserve les documents de l’immeuble — dossier amiante, DPE collectif, diagnostics techniques — et doit pouvoir vous les remettre. Ils ne sont pas dans votre dossier de vente personnel, et beaucoup de vendeurs l’ignorent.',
      points: [
        'Demandez-les par écrit au syndic : c’est la seule façon d’obtenir une date de réponse.',
        'Ils sont aussi accessibles dans l’espace en ligne de la copropriété, quand il existe.',
        'Toute entreprise intervenant dans les communs doit se voir remettre la fiche récapitulative du dossier amiante : c’est une obligation, pas une politesse.',
        'Un acquéreur averti les réclame avant de signer : ils annoncent les travaux à venir, donc les appels de fonds.'
      ],
      chezMoi:
        'Votre dossier de vente ne couvre que votre lot. Ce que raconte l’immeuble se demande à part — et c’est souvent là que se cachent les dépenses.',
      aussi: ['dta-et-dapp', 'c-est-quoi-le-dtg', 'dpe-collectif-ou-individuel'],
      verifie: V
    },

    {
      id: 'c-est-quoi-le-dtg',
      question: 'C’est quoi le diagnostic technique global (DTG) ?',
      variantes: [
        'DTG copropriété obligatoire',
        'diagnostic technique global définition',
        'DTG ou audit énergétique copropriété'
      ],
      court:
        'Un bilan de santé de l’immeuble entier : état des parties communes et des équipements, situation au regard des obligations, et estimation des travaux nécessaires sur dix ans. Il est obligatoire dans certains cas, facultatif ailleurs — mais l’assemblée doit se prononcer sur son opportunité.',
      points: [
        'Il s’impose notamment lors de la mise en copropriété d’un immeuble de plus de dix ans, et en cas de procédure pour insalubrité.',
        'Il comprend une analyse énergétique, ce qui le distingue d’un simple état des lieux technique.',
        'Il ne décide de rien : il éclaire. Ce sont les votes en assemblée qui engagent les dépenses.',
        'Pour un acheteur, c’est le document le plus utile de tout le dossier de copropriété.'
      ],
      piege:
        'Ne confondez pas le DTG, qui décrit l’immeuble, avec le dossier de diagnostic technique de votre vente, qui décrit votre lot. Deux documents, deux périmètres, deux responsables.',
      aussi: ['c-est-quoi-le-plan-pluriannuel-de-travaux', 'qui-detient-les-diagnostics-de-l-immeuble', 'dpe-collectif-ou-individuel'],
      sources: [{ titre: 'Loi n° 65-557 du 10 juillet 1965, article L. 731-1 du CCH', url: LEGI }],
      verifie: V
    },

    {
      id: 'c-est-quoi-le-plan-pluriannuel-de-travaux',
      question: 'C’est quoi le plan pluriannuel de travaux ?',
      variantes: [
        'PPT copropriété obligatoire',
        'projet de plan pluriannuel de travaux',
        'fonds travaux copropriété'
      ],
      court:
        'La liste des travaux à prévoir sur dix ans, avec leur ordre de priorité et leur estimation. Il est devenu obligatoire pour les copropriétés de plus de quinze ans, selon un calendrier échelonné par taille d’immeuble.',
      points: [
        'Il est établi par un professionnel, présenté à l’assemblée, et actualisé au fil du temps.',
        'Il alimente le fonds de travaux : ce que la copropriété met de côté chaque année pour ne pas subir les appels de fonds.',
        'Pour un acheteur, c’est l’indicateur le plus direct des charges à venir : lisez-le avant de faire une offre.',
        'Un immeuble sans plan pluriannuel n’est pas un immeuble sans travaux : c’est un immeuble qui ne les a pas encore chiffrés.'
      ],
      aussi: ['c-est-quoi-le-dtg', 'qui-detient-les-diagnostics-de-l-immeuble', 'dpe-collectif-ou-individuel'],
      sources: [{ titre: 'Code de la construction et de l’habitation, article L. 731-2', url: LEGI }],
      verifie: V
    },

    {
      id: 'c-est-quoi-le-carnet-d-information-du-logement',
      question: 'C’est quoi le carnet d’information du logement ?',
      variantes: [
        'carnet information logement CIL',
        'carnet numérique du logement obligatoire',
        'CIL vente maison'
      ],
      court:
        'Un dossier qui rassemble ce qui touche à la performance énergétique du logement : plans, matériaux isolants, notices des équipements, attestations. Il s’impose depuis 2023 aux logements neufs et à ceux qui subissent une rénovation énergétique significative, et se transmet à l’acquéreur.',
      points: [
        'Il est constitué par le propriétaire, pas par un diagnostiqueur : c’est un classeur, pas un rapport.',
        'Il se transmet à la vente, et sa remise est constatée dans l’acte.',
        'Son intérêt pratique dépasse l’obligation : ce sont exactement les justificatifs qui évitent les valeurs par défaut d’un futur DPE.',
        'Conservez-y toutes les factures de travaux touchant à l’isolation, aux menuiseries, au chauffage et à la ventilation.'
      ],
      chezMoi:
        'Ce carnet et votre dossier de diagnostics se complètent : l’un dit ce qui a été fait, l’autre ce qu’on a constaté.',
      aussi: ['le-dpe-est-il-fiable', 'combien-de-temps-garder-ses-rapports', 'quels-diagnostics-pour-vendre'],
      sources: [{ titre: 'Code de la construction et de l’habitation, articles L. 126-35-2 et suivants', url: LEGI }],
      verifie: V
    }
  ]
};
