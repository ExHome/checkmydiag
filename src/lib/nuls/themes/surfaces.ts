import type { Theme } from '../socle';

const V = '2026-08-13';
const LEGI = 'https://www.legifrance.gouv.fr';

export const SURFACES: Theme = {
  id: 'surfaces',
  titre: 'Surfaces',
  h1: 'Loi Carrez, surface habitable, surface au sol : trois chiffres différents',
  resume:
    'Le même logement peut afficher trois surfaces sans que personne ne se soit trompé. Voici ce que chacune compte, laquelle sert à quoi, et ce que vous pouvez réclamer quand la vôtre est fausse.',
  dessin: 'carrez-vs-habitable',

  questions: [
    {
      id: 'c-est-quoi-la-loi-carrez',
      question: 'C’est quoi la surface loi Carrez ?',
      variantes: [
        'loi Carrez définition',
        'mesurage Carrez obligatoire',
        'surface Carrez appartement'
      ],
      court:
        'La surface de plancher des parties closes et couvertes d’un lot de copropriété, dont on retire les murs, les cloisons, les marches, les gaines et tout ce qui est sous 1,80 mètre de hauteur. Elle est obligatoire pour vendre un lot en copropriété.',
      dessin: 'carrez-hauteur',
      points: [
        'Elle ne concerne que la copropriété : une maison individuelle sur son propre terrain n’a pas de surface Carrez.',
        'Les lots de moins de 8 m² en sont exclus, ainsi que les caves, garages et emplacements de stationnement.',
        'Elle doit figurer dans la promesse comme dans l’acte de vente.',
        'Elle reste valable tant que rien ne change : c’est le seul « diagnostic » sans date de péremption.',
        'Le mesurage peut être fait par le vendeur lui-même — mais c’est lui qui répond de l’erreur.'
      ],
      chezMoi:
        'Sur votre rapport, cherchez le tableau pièce par pièce : c’est là qu’on voit ce qui a été compté, et ce qui a été écarté.',
      aussi: ['pourquoi-ma-surface-carrez-est-plus-petite', 'erreur-de-surface-que-puis-je-reclamer', 'c-est-quoi-la-surface-habitable'],
      savoir: ['rampant'],
      sources: [{ titre: 'Loi n° 96-1107 du 18 décembre 1996 (loi Carrez)', url: LEGI }],
      verifie: V
    },

    {
      id: 'pourquoi-ma-surface-carrez-est-plus-petite',
      question: 'Pourquoi ma surface Carrez est plus petite que ce que je croyais ?',
      variantes: [
        'différence surface annoncée et Carrez',
        'combles surface Carrez 1m80',
        'surface Carrez plus petite que le plan'
      ],
      court:
        'Parce qu’elle ne compte que là où l’on tient debout. Sous 1,80 mètre de hauteur, le plancher existe mais ne compte pas — et sous un rampant de toiture, cela peut représenter plusieurs mètres carrés par pièce.',
      dessin: 'carrez-hauteur',
      points: [
        'Les combles aménagés sont la première cause d’écart : la surface au sol est bien là, la surface Carrez ne l’est pas.',
        'On retire aussi l’emprise des murs, des cloisons, des marches, des cages d’escalier et des embrasures.',
        'Une véranda close et couverte compte ; un balcon, une terrasse, une loggia ouverte ne comptent pas.',
        'La surface annoncée par un vendeur ou un plan d’architecte n’est presque jamais la surface Carrez.'
      ],
      piege:
        'Une mezzanine, une soupente ou un couloir bas font fondre le chiffre sans que le logement ait changé. Ce n’est pas une erreur de mesure : c’est la règle.',
      aussi: ['c-est-quoi-la-loi-carrez', 'erreur-de-surface-que-puis-je-reclamer', 'c-est-quoi-la-surface-habitable'],
      savoir: ['rampant'],
      verifie: V
    },

    {
      id: 'erreur-de-surface-que-puis-je-reclamer',
      question: 'La surface annoncée est fausse : que puis-je réclamer ?',
      variantes: [
        'erreur surface Carrez recours acheteur',
        'diminution du prix surface Carrez 5%',
        'action en réduction de prix délai'
      ],
      court:
        'Si la surface réelle est inférieure de plus d’un vingtième — 5 % — à celle annoncée dans l’acte, l’acheteur peut demander une réduction du prix proportionnelle à l’écart. L’action se prend dans l’année qui suit l’acte authentique.',
      points: [
        'La réduction est proportionnelle : 8 % de surface en moins, c’est 8 % du prix en moins.',
        'Le délai d’un an court à partir de la signature de l’acte définitif, pas du compromis. Il ne se rattrape pas.',
        'Un écart inférieur à 5 % ne donne droit à rien : la loi tolère la marge de mesure.',
        'Si la surface est absente de l’acte, la sanction est plus lourde encore : la nullité peut être demandée, dans un délai bref.',
        'Une surface supérieure à celle annoncée ne donne droit à aucun supplément pour le vendeur.'
      ],
      piege:
        'Faites mesurer par un professionnel avant d’engager quoi que ce soit : un métré contradictoire sérieux est ce qui décide de l’issue, pas votre mètre ruban.',
      aussi: ['pourquoi-ma-surface-carrez-est-plus-petite', 'c-est-quoi-la-loi-carrez', 'contester-un-diagnostic'],
      sources: [{ titre: 'Loi n° 65-557 du 10 juillet 1965, article 46', url: LEGI }],
      verifie: V
    },

    {
      id: 'les-trois-surfaces',
      question: 'Carrez, habitable, plancher : laquelle sert à quoi ?',
      variantes: [
        'différence surface Carrez surface habitable',
        'surface de plancher urbanisme',
        'quelle surface pour quel document'
      ],
      court:
        'La loi Carrez sert à vendre en copropriété. La surface habitable sert à louer, et se retrouve dans le bail. La surface de plancher sert à l’urbanisme, pour un permis de construire. Trois usages, trois calculs.',
      dessin: 'carrez-vs-habitable',
      tableau: {
        colonnes: ['Surface', 'Elle sert à', 'Particularité'],
        lignes: [
          ['Loi Carrez', 'vendre un lot de copropriété', 'compte une véranda close, exclut les lots de moins de 8 m²'],
          ['Habitable (dite Boutin)', 'louer, et l’écrire au bail', 'exclut balcons, caves, garages, combles non aménagés'],
          ['De plancher', 'un permis de construire', 'notion d’urbanisme, calculée au nu intérieur des façades']
        ],
        reserve:
          'Les trois excluent ce qui est sous 1,80 mètre de hauteur. Les écarts viennent surtout des annexes : véranda, cave, combles.'
      },
      points: [
        'Un même appartement peut donc afficher trois chiffres différents, tous exacts.',
        'Dans une annonce, la surface citée est en général la surface Carrez pour un appartement, la surface habitable pour une maison.',
        'Le rapport de mesurage indique toujours laquelle a été calculée : c’est la première chose à lire.'
      ],
      aussi: ['c-est-quoi-la-surface-habitable', 'c-est-quoi-la-loi-carrez', 'pourquoi-ma-surface-carrez-est-plus-petite'],
      verifie: V
    },

    {
      id: 'calculer-sa-surface-carrez-soi-meme',
      question: 'Puis-je mesurer ma surface Carrez moi-même ?',
      variantes: [
        'calcul surface loi Carrez',
        'mesurer sa surface Carrez',
        'faut-il un professionnel pour le mesurage Carrez'
      ],
      court:
        'Oui, la loi ne l’interdit pas. Mais c’est vous qui répondrez de l’erreur — et une erreur de plus de 5 % ouvre à l’acheteur un droit à réduction du prix pendant un an.',
      dessin: 'carrez-hauteur',
      points: [
        'La méthode : mesurer au sol chaque pièce close et couverte, en ne comptant que ce qui a plus de 1,80 mètre sous plafond.',
        'On retire l’emprise des murs et cloisons, les marches et cages d’escalier, les gaines, les embrasures de portes et fenêtres.',
        'On exclut les caves, garages, emplacements de stationnement, balcons et terrasses, ainsi que tout lot de moins de 8 m².',
        'Les pièges classiques : un placard sous rampant, une mezzanine basse, une véranda selon qu’elle est close ou non.',
        'Un mesurage professionnel coûte peu au regard du risque : c’est l’assurance du diagnostiqueur qui répond en cas d’erreur, pas la vôtre.'
      ],
      piege:
        'Mesurer soi-même, c’est aussi s’exposer seul. Le mesurage professionnel transfère la responsabilité — c’est bien pour cela qu’on le paie.',
      aussi: ['c-est-quoi-la-loi-carrez', 'erreur-de-surface-que-puis-je-reclamer', 'pourquoi-ma-surface-carrez-est-plus-petite'],
      savoir: ['rampant'],
      verifie: V
    }
  ]
};
