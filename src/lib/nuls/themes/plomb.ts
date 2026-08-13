import type { Theme } from '../socle';

const V = '2026-08-13';
const LEGI = 'https://www.legifrance.gouv.fr';

export const PLOMB: Theme = {
  id: 'plomb',
  titre: 'Plomb',
  h1: 'Le plomb dans les peintures : le CREP expliqué',
  resume:
    'Un seul diagnostic, une seule maladie à éviter, et une seule classe qui compte vraiment. Si votre immeuble est d’avant 1949, cette page vous concerne.',
  dessin: 'plomb-classes',

  questions: [
    {
      id: 'c-est-quoi-le-crep-plomb',
      question: 'C’est quoi le CREP, le diagnostic plomb ?',
      variantes: [
        'constat de risque d’exposition au plomb',
        'diagnostic plomb avant 1949',
        'CREP définition'
      ],
      court:
        'Le constat de risque d’exposition au plomb cherche le plomb dans les peintures anciennes, pièce par pièce et élément par élément. Il est obligatoire pour tout logement construit avant le 1ᵉʳ janvier 1949, à la vente comme à la location.',
      dessin: 'plomb-classes',
      points: [
        'Le diagnostiqueur mesure chaque élément — murs, plafonds, portes, fenêtres, plinthes — avec un appareil à fluorescence X.',
        'Chaque mesure reçoit une classe de 0 à 3 selon la présence de plomb et l’état du revêtement.',
        'Seule la classe 3, la peinture dégradée, déclenche des obligations.',
        'Sa validité : 1 an pour vendre et 6 ans pour louer s’il révèle du plomb, illimitée s’il n’en trouve pas.',
        'Il ne concerne que les peintures : ni l’eau, ni la terre, ni les canalisations.'
      ],
      chezMoi:
        'Votre rapport contient un tableau des unités de diagnostic. Cherchez la colonne des classes, et repérez les lignes en classe 3 : ce sont les seules qui appellent une action.',
      aussi: ['c-est-quoi-le-saturnisme', 'j-ai-du-plomb-classe-3', 'le-plomb-dans-l-eau'],
      savoir: ['classe-3', 'saturnisme'],
      sources: [{ titre: 'Code de la santé publique, articles L. 1334-5 et suivants', url: LEGI }],
      verifie: V
    },

    {
      id: 'c-est-quoi-le-saturnisme',
      question: 'C’est quoi le saturnisme, et qui risque quoi ?',
      variantes: [
        'saturnisme définition',
        'plomb enfant danger',
        'intoxication au plomb symptômes'
      ],
      court:
        'C’est l’intoxication au plomb. On l’attrape en avalant ou en respirant la poussière d’une vieille peinture qui se dégrade — pas en touchant un mur. Elle atteint le système nerveux, surtout avant six ans, et les dégâts sont définitifs.',
      points: [
        'Les jeunes enfants sont les premiers exposés : ils portent les mains à la bouche, et jouent au sol où la poussière retombe.',
        'Les femmes enceintes le sont également, le plomb passant la barrière placentaire.',
        'Le plomb ne traverse pas la peau : c’est bien la poussière ingérée ou inhalée qui est en cause.',
        'La maladie est à déclaration obligatoire, et un dépistage sanguin — la plombémie — existe.',
        'C’est la seule raison d’être du diagnostic plomb : tout le reste en découle.'
      ],
      piege:
        'Une peinture au plomb recouverte de trois couches récentes n’est pas neutralisée pour autant : dès que l’ensemble s’écaille ou qu’on ponce, la couche ancienne redevient accessible.',
      aussi: ['c-est-quoi-le-crep-plomb', 'j-ai-du-plomb-classe-3'],
      savoir: ['saturnisme'],
      verifie: V
    },

    {
      id: 'j-ai-du-plomb-classe-3',
      question: 'Mon rapport indique de la classe 3 : que dois-je faire ?',
      variantes: [
        'plomb classe 3 travaux obligatoires',
        'classe 1 2 3 plomb différence',
        'que faire si présence de plomb'
      ],
      court:
        'La classe 3 est la seule qui oblige. Le propriétaire doit faire réaliser des travaux pour supprimer l’exposition au plomb, et informer les occupants comme les entreprises qui interviendront.',
      dessin: 'plomb-classes',
      tableau: {
        colonnes: ['Classe', 'Ce que ça veut dire', 'Ce qu’on fait'],
        lignes: [
          ['0', 'pas de plomb détecté', 'rien'],
          ['1', 'du plomb, revêtement intact', 'rien, on surveille'],
          ['2', 'du plomb, revêtement usé mais non dégradé', 'on surveille, on entretient'],
          ['3', 'du plomb, revêtement dégradé', 'travaux obligatoires, occupants informés']
        ]
      },
      points: [
        'Les travaux visent à supprimer l’accessibilité au plomb : recouvrir, encapsuler, ou déposer selon l’état.',
        'Ils doivent être réalisés par une entreprise formée à ce risque, avec des protections adaptées.',
        'En attendant : nettoyage humide, jamais à sec, et surveillance des écailles au sol.',
        'Ne poncez, ne grattez, ne décapez jamais à sec une peinture ancienne : c’est le geste qui fabrique la poussière.',
        'Si des enfants vivent dans le logement, le médecin traitant est le bon interlocuteur pour un dépistage.'
      ],
      chezMoi:
        'Check My Diag compte vos unités par classe et vous dit tout de suite si votre rapport contient de la classe 3, et où.',
      aussi: ['c-est-quoi-le-saturnisme', 'c-est-quoi-le-crep-plomb', 'une-anomalie-empeche-t-elle-de-vendre'],
      savoir: ['classe-3'],
      sources: [{ titre: 'Code de la santé publique, article L. 1334-9', url: LEGI }],
      verifie: V
    },

    {
      id: 'le-plomb-dans-l-eau',
      question: 'Et le plomb dans les canalisations d’eau ?',
      variantes: [
        'canalisation plomb eau potable',
        'diagnostic plomb eau obligatoire',
        'tuyau en plomb remplacement'
      ],
      court:
        'Ce n’est pas le même sujet, et aucun diagnostic obligatoire ne le couvre. Le CREP porte sur les peintures ; les canalisations en plomb relèvent de la qualité de l’eau, contrôlée par ailleurs.',
      points: [
        'Les canalisations en plomb ont été interdites à la pose depuis 1995 dans les réseaux d’eau potable.',
        'Un tuyau en plomb se reconnaît à sa couleur grise mate et à sa souplesse : il se raye à l’ongle.',
        'Le remplacement d’un branchement public relève du service des eaux ; l’intérieur du logement est à la charge du propriétaire.',
        'En attendant, laissez couler l’eau stagnante avant de la boire, et n’utilisez jamais l’eau chaude pour la cuisson.',
        'Un contrôle de la qualité de l’eau peut être demandé à l’agence régionale de santé.'
      ],
      piege:
        'Un CREP qui conclut « absence de plomb » ne dit rien de vos tuyaux. Deux sujets, deux mesures, deux documents.',
      aussi: ['c-est-quoi-le-crep-plomb', 'un-diagnostic-garantit-il-le-logement'],
      verifie: V
    }
  ]
};
