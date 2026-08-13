import type { Theme } from '../socle';

const V = '2026-08-13';
const LEGI = 'https://www.legifrance.gouv.fr';
const SP = 'https://www.service-public.fr';

export const LOUER: Theme = {
  id: 'louer',
  titre: 'Louer',
  h1: 'Louer un logement : les documents à annexer au bail',
  resume:
    'Côté propriétaire comme côté locataire : ce qui doit être remis, ce qui peut être exigé, et ce que le DPE change désormais au droit de louer.',
  dessin: 'qui-paie',

  questions: [
    {
      id: 'quels-diagnostics-pour-louer',
      question: 'Quels diagnostics faut-il pour louer ?',
      variantes: [
        'diagnostics obligatoires location',
        'documents à annexer au bail',
        'dossier de diagnostic technique location'
      ],
      court:
        'Le DPE, l’état des risques et la surface habitable dans tous les cas. S’y ajoutent le plomb pour un immeuble d’avant 1949, et l’électricité comme le gaz dès que l’installation a plus de quinze ans.',
      dessin: 'dossier',
      tableau: {
        colonnes: ['Document', 'Il est dû si…'],
        lignes: [
          ['DPE', 'toujours — et sa classe doit figurer dans l’annonce'],
          ['État des risques (ERP)', 'la commune est concernée par un risque'],
          ['Surface habitable', 'toujours — elle est écrite dans le bail'],
          ['Plomb (CREP)', 'immeuble construit avant le 1ᵉʳ janvier 1949'],
          ['Électricité', 'l’installation intérieure a plus de 15 ans'],
          ['Gaz', 'l’installation intérieure de gaz a plus de 15 ans'],
          ['Amiante (parties privatives)', 'immeuble d’avant juillet 1997 — remis sur demande du locataire'],
          ['Bruit', 'le logement est en zone d’exposition au bruit d’un aéroport']
        ],
        reserve:
          'Les termites, la loi Carrez et l’assainissement non collectif ne concernent pas la location. Les durées de validité, elles, sont plus longues qu’à la vente : 6 ans pour l’électricité, le gaz et le plomb.'
      },
      points: [
        'Ces documents sont annexés au bail et remis au locataire le jour de la signature.',
        'Le coût est à la charge du bailleur, et ne peut pas être refacturé au locataire.',
        'Ils sont à renouveler au fil du temps, pas à chaque nouveau locataire : c’est la date de visite qui commande.'
      ],
      chezMoi:
        'Locataire ? Déposez le dossier reçu avec votre bail : vous verrez ce qu’il contient réellement, et ce qui manque.',
      aussi: [
        'quels-diagnostics-pour-vendre',
        'combien-de-temps-un-diagnostic-est-valable',
        'le-locataire-peut-il-exiger-des-travaux',
        'c-est-quoi-la-surface-habitable'
      ],
      sources: [
        { titre: 'Loi n° 89-462 du 6 juillet 1989, article 3-3', url: LEGI },
        { titre: 'Service-public.fr — location : dossier de diagnostic technique', url: SP }
      ],
      verifie: V
    },

    {
      id: 'le-locataire-peut-il-exiger-des-travaux',
      question: 'Locataire dans une passoire thermique : que puis-je exiger ?',
      variantes: [
        'locataire logement classé G travaux',
        'logement non décent DPE',
        'obliger le propriétaire à isoler'
      ],
      court:
        'Un logement trop gourmand n’est plus considéré comme décent, et la décence est une obligation du bailleur. Vous pouvez lui demander des travaux par écrit ; s’il refuse, la commission départementale de conciliation puis le juge peuvent l’y contraindre.',
      dessin: 'calendrier-location',
      points: [
        'La demande se fait par lettre recommandée avec accusé de réception : c’est elle qui fait courir les délais.',
        'La saisine de la commission départementale de conciliation est gratuite et souvent suffisante pour débloquer.',
        'Le juge peut imposer les travaux, réduire le loyer, voire suspendre son paiement — il ne le fait pas d’office.',
        'Ne cessez jamais de payer votre loyer de votre propre initiative : c’est le meilleur moyen de perdre une affaire que vous auriez gagnée.',
        'Un bail en cours n’est pas annulé par l’entrée en vigueur du calendrier : c’est la remise en location qui devient impossible.'
      ],
      aussi: ['puis-je-encore-louer-un-logement-classe-g', 'quels-diagnostics-pour-louer', 'c-est-quoi-une-passoire-thermique'],
      sources: [
        { titre: 'Décret n° 2002-120 du 30 janvier 2002 (logement décent)', url: LEGI },
        { titre: 'Loi Climat et Résilience du 22 août 2021, article 160', url: LEGI }
      ],
      verifie: V
    },

    {
      id: 'le-bailleur-ne-m-a-rien-donne',
      question: 'Mon propriétaire ne m’a remis aucun diagnostic. Que faire ?',
      variantes: [
        'bail sans DPE',
        'propriétaire refuse de donner les diagnostics',
        'sanction absence diagnostic location'
      ],
      court:
        'Demandez-les par écrit : ils font partie du bail, pas des politesses. Un bailleur qui ne les fournit pas s’expose à devoir réparer le préjudice, et perd la protection que ces documents lui donnent.',
      points: [
        'Commencez par un courriel, puis une lettre recommandée si rien ne vient : la trace écrite est ce qui compte.',
        'L’absence de DPE ou de CREP peut être invoquée devant le juge, et peut fonder une demande de réduction de loyer.',
        'Un CREP absent dans un immeuble d’avant 1949 est particulièrement sérieux : c’est un enjeu de santé, pas une formalité.',
        'L’agence qui gère le bien répond au même titre que le propriétaire.'
      ],
      aussi: ['quels-diagnostics-pour-louer', 'que-risque-t-on-sans-diagnostic', 'le-locataire-peut-il-exiger-des-travaux'],
      verifie: V
    },

    {
      id: 'diagnostics-a-chaque-nouveau-locataire',
      question: 'Faut-il refaire les diagnostics à chaque nouveau locataire ?',
      variantes: [
        'refaire DPE changement locataire',
        'validité diagnostic location renouvellement bail',
        'diagnostics location durée'
      ],
      court:
        'Non. Ils suivent leur propre durée de validité, pas le rythme des locataires. Tant qu’un document est valable, il est simplement annexé au bail suivant.',
      dessin: 'validite-depart',
      points: [
        'En location, les durées sont plus longues qu’à la vente : 6 ans pour l’électricité, le gaz et le plomb, 10 ans pour le DPE.',
        'L’état des risques fait exception : 6 mois. Il est donc à régénérer à chaque nouveau bail.',
        'Des travaux qui modifient le logement rendent le document caduc avant sa date : une isolation refaite mérite un nouveau DPE, et c’est votre intérêt.',
        'Un renouvellement ou une reconduction de bail suit la même logique qu’un nouveau bail.'
      ],
      aussi: ['combien-de-temps-un-diagnostic-est-valable', 'quels-diagnostics-pour-louer'],
      verifie: V
    },

    {
      id: 'location-meublee-et-saisonniere',
      question: 'Location meublée, colocation, saisonnier : mêmes règles ?',
      variantes: [
        'diagnostic location meublée',
        'DPE location saisonnière',
        'diagnostics colocation'
      ],
      court:
        'Pour une location meublée à titre de résidence principale ou une colocation, les obligations sont les mêmes que pour un logement vide. Pour la location saisonnière de courte durée, le régime est différent et a beaucoup bougé ces dernières années.',
      points: [
        'Meublé en résidence principale : DPE, état des risques, surface habitable, plus le plomb et les installations selon les cas.',
        'Colocation : les documents sont annexés au bail, quel que soit le nombre de colocataires ou le type de contrat.',
        'Meublé de tourisme : les règles se sont durcies, notamment en zone tendue et pour les changements d’usage — elles dépendent aussi des arrêtés de votre commune.',
        'Avant de louer en courte durée, la mairie est l’interlocuteur à consulter en premier : c’est elle qui fixe l’enregistrement et les quotas.'
      ],
      piege:
        'Le régime des meublés de tourisme a changé plusieurs fois récemment, et il varie d’une commune à l’autre. Ne vous fiez pas à ce qui était vrai il y a deux ans, ni à ce qui vaut dans la ville d’à côté.',
      aussi: ['quels-diagnostics-pour-louer', 'c-est-quoi-la-surface-habitable'],
      verifie: V
    },

    {
      id: 'c-est-quoi-la-surface-habitable',
      question: 'C’est quoi la surface habitable écrite dans mon bail ?',
      variantes: [
        'surface habitable loi Boutin',
        'différence surface habitable et loi Carrez',
        'surface fausse dans le bail'
      ],
      court:
        'C’est la surface de plancher des pièces à vivre, dont on retire les murs, les cloisons, les marches et tout ce qui est sous 1,80 mètre de hauteur. Balcons, terrasses, caves, garages et combles non aménagés n’en font pas partie.',
      dessin: 'carrez-vs-habitable',
      points: [
        'Elle est obligatoire dans le bail d’un logement vide en résidence principale — on l’appelle souvent surface « loi Boutin ».',
        'Ce n’est pas la même chose que la surface loi Carrez, qui sert à vendre un lot de copropriété.',
        'Si la surface réelle est inférieure de plus d’un vingtième à celle du bail, le locataire peut demander une diminution de loyer proportionnelle.',
        'La demande se fait d’abord au bailleur ; à défaut d’accord, le juge tranche.'
      ],
      aussi: ['c-est-quoi-la-loi-carrez', 'quels-diagnostics-pour-louer', 'pourquoi-ma-surface-carrez-est-plus-petite'],
      savoir: ['rampant'],
      sources: [{ titre: 'Loi n° 89-462 du 6 juillet 1989, article 3', url: LEGI }],
      verifie: V
    },

    {
      id: 'etat-des-lieux-et-diagnostics',
      question: 'Quelle différence entre l’état des lieux et les diagnostics ?',
      variantes: [
        'état des lieux ou diagnostic',
        'différence état des lieux diagnostic technique',
        'le diagnostiqueur fait-il l’état des lieux'
      ],
      court:
        'Deux documents qui n’ont rien à voir. L’état des lieux décrit ce que vous rendrez en partant — peintures, équipements, propreté — et se fait entre bailleur et locataire. Les diagnostics décrivent la sécurité et l’énergie du logement, et sont faits par un professionnel certifié.',
      points: [
        'L’état des lieux se fait deux fois : à l’entrée et à la sortie, et il sert au dépôt de garantie.',
        'Les diagnostics sont annexés une fois pour toutes au bail, et suivent leur propre durée de validité.',
        'Un diagnostiqueur ne fait pas d’état des lieux — même si certains cabinets proposent les deux prestations.',
        'Un défaut noté à l’état des lieux n’a aucun rapport avec une anomalie relevée par un diagnostic.'
      ],
      piege:
        'Une anomalie électrique signalée dans le dossier de diagnostic n’est pas une dégradation de votre fait : ne la laissez pas glisser dans l’état des lieux de sortie.',
      aussi: ['quels-diagnostics-pour-louer', 'le-bailleur-ne-m-a-rien-donne', 'mon-installation-a-des-anomalies-c-est-grave'],
      verifie: V
    }
  ]
};
