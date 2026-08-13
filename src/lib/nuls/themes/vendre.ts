import type { Theme } from '../socle';

const V = '2026-08-13';
const LEGI = 'https://www.legifrance.gouv.fr';
const SP = 'https://www.service-public.fr';

export const VENDRE: Theme = {
  id: 'vendre',
  titre: 'Vendre',
  h1: 'Vendre un logement : quels diagnostics, et quand',
  resume:
    'La liste dépend de l’âge du bien, de la commune et du type de logement — jamais de votre bonne volonté. Voici comment savoir lesquels vous concernent, à quel moment les faire, et ce qu’ils changent à la négociation.',
  dessin: 'dossier',

  questions: [
    {
      id: 'quels-diagnostics-pour-vendre',
      question: 'Quels diagnostics faut-il pour vendre ?',
      variantes: [
        'liste diagnostics obligatoires vente',
        'diagnostics obligatoires vente maison',
        'diagnostics vente appartement 2026'
      ],
      court:
        'Trois sont dus presque partout : le DPE, l’état des risques, et l’électricité ou le gaz dès que l’installation a plus de quinze ans. Les autres dépendent de l’âge du bâtiment, de la commune et du type de bien.',
      dessin: 'dossier',
      tableau: {
        colonnes: ['Diagnostic', 'Il est dû si…'],
        lignes: [
          ['DPE', 'toujours, sauf rares exceptions de bâtiment'],
          ['État des risques (ERP)', 'la commune est concernée par un risque — la plupart le sont'],
          ['Électricité', 'l’installation intérieure a plus de 15 ans'],
          ['Gaz', 'l’installation intérieure de gaz a plus de 15 ans'],
          ['Amiante', 'permis de construire délivré avant le 1ᵉʳ juillet 1997'],
          ['Plomb (CREP)', 'immeuble construit avant le 1ᵉʳ janvier 1949'],
          ['Termites', 'la commune est classée par arrêté préfectoral'],
          ['Loi Carrez', 'le bien est un lot de copropriété'],
          ['Assainissement', 'le logement n’est pas raccordé au tout-à-l’égout'],
          ['Audit énergétique', 'maison ou immeuble en monopropriété classé E, F ou G'],
          ['Bruit', 'le bien est dans une zone d’exposition au bruit d’un aéroport']
        ],
        reserve:
          'Cette liste est celle du logement en France métropolitaine. Les locaux professionnels, les terrains nus et l’outre-mer suivent des règles différentes.'
      },
      points: [
        'Le vendeur les commande et les paie ; ils sont annexés à la promesse ou au compromis, pas seulement à l’acte final.',
        'Un diagnostiqueur sérieux détermine lui-même la liste applicable à votre bien : donnez-lui l’année de construction et l’adresse exacte.',
        'Ils sont réunis dans un seul dossier — le dossier de diagnostic technique.'
      ],
      piege:
        'On croit souvent qu’un logement rénové échappe à l’amiante ou au plomb. Ce n’est pas la rénovation qui compte, c’est la date du permis de construire du bâtiment.',
      chezMoi:
        'Déposez votre dossier : Check My Diag vous dit quels diagnostics il a trouvés — et lesquels manquent au regard de ce que le dossier lui-même décrit.',
      aussi: [
        'quand-faire-les-diagnostics-pour-vendre',
        'quels-diagnostics-pour-louer',
        'combien-de-temps-un-diagnostic-est-valable',
        'que-risque-t-on-sans-diagnostic'
      ],
      sources: [
        { titre: 'Code de la construction et de l’habitation, articles L. 271-4 et R. 271-1', url: LEGI },
        { titre: 'Service-public.fr — vendre un logement', url: SP }
      ],
      verifie: V
    },

    {
      id: 'quand-faire-les-diagnostics-pour-vendre',
      question: 'À quel moment faut-il faire les diagnostics ?',
      variantes: [
        'diagnostics avant ou après compromis',
        'quand commander les diagnostics vente',
        'DPE avant annonce immobilière'
      ],
      court:
        'Le DPE doit être fait avant même de publier l’annonce, puisque sa classe doit y figurer. Les autres doivent être prêts pour la signature de la promesse ou du compromis, où ils sont annexés.',
      dessin: 'validite-depart',
      points: [
        'En pratique, on fait tout d’un coup, dès la mise en vente : une seule visite, un seul déplacement, un seul devis.',
        'Attention aux deux plus courts : l’état des risques et les termites ne valent que 6 mois. Si la vente traîne, ils périment avant la signature.',
        'Le notaire vérifie la validité au jour de l’acte, pas au jour du compromis.',
        'Faire les diagnostics tôt a un autre avantage : vous découvrez les mauvaises nouvelles avant l’acheteur, et vous décidez quoi en faire.'
      ],
      piege:
        'Une annonce sans classe énergie est irrégulière, et certains portails la refusent. Ce n’est pas un détail administratif : c’est ce qui bloque la mise en ligne.',
      aussi: ['quels-diagnostics-pour-vendre', 'combien-de-temps-un-diagnostic-est-valable', 'mon-diagnostic-est-perime-que-faire'],
      verifie: V
    },

    {
      id: 'vendre-un-bien-ancien',
      question: 'Mon bien est ancien : qu’est-ce que ça change ?',
      variantes: [
        'diagnostic maison avant 1949',
        'amiante avant 1997',
        'vendre une maison ancienne diagnostics'
      ],
      court:
        'Deux dates commandent tout. Avant le 1ᵉʳ juillet 1997, il faut chercher l’amiante. Avant le 1ᵉʳ janvier 1949, il faut aussi chercher le plomb. Un bâtiment d’avant 1949 déclenche donc les deux.',
      dessin: 'dates-construction',
      points: [
        'La date qui compte est celle de la délivrance du permis de construire, pas celle de la fin de chantier ni celle de votre achat.',
        'Une extension récente sur une maison ancienne ne dispense de rien : c’est le bâtiment d’origine qui déclenche.',
        'Un bien ancien a souvent une installation électrique de plus de quinze ans : le diagnostic électricité s’ajoute presque toujours.',
        'Les logements anciens rénovés dans les années 1970 et 1980 sont ceux où l’on trouve le plus d’amiante : les matériaux étaient alors partout.'
      ],
      chezMoi:
        'Les rapports amiante et plomb citent l’année de construction retenue. Si elle vous paraît fausse, c’est un point à faire vérifier : elle décide de tout le reste.',
      aussi: ['quels-diagnostics-pour-vendre', 'ou-trouve-t-on-de-l-amiante', 'c-est-quoi-le-crep-plomb'],
      savoir: ['amiante', 'saturnisme'],
      verifie: V
    },

    {
      id: 'vendre-un-terrain-ou-un-garage',
      question: 'Faut-il des diagnostics pour un terrain, un garage ou une cave ?',
      variantes: [
        'diagnostic vente terrain nu',
        'diagnostic garage box parking',
        'vendre une cave diagnostics'
      ],
      court:
        'Pour un terrain nu, un seul : l’état des risques. Pour un garage, une cave ou un box, il n’y a ni DPE ni surface habitable à fournir — mais la loi Carrez s’applique s’il s’agit d’un lot de copropriété d’au moins 8 m².',
      points: [
        'Le DPE ne concerne que les locaux chauffés destinés à l’habitation ou à une activité : un garage n’en a pas.',
        'L’état des risques suit l’adresse, donc il suit le terrain — c’est le seul document dû dans tous les cas.',
        'Un terrain constructible peut relever d’une étude de sol obligatoire dans les zones argileuses : ce n’est pas un diagnostic, c’est une autre obligation, à la charge du vendeur.',
        'Les lots de moins de 8 m² sont hors du champ de la loi Carrez.'
      ],
      aussi: ['c-est-quoi-l-etat-des-risques', 'c-est-quoi-la-loi-carrez', 'quels-diagnostics-pour-vendre'],
      verifie: V
    },

    {
      id: 'les-diagnostics-font-ils-baisser-le-prix',
      question: 'Un mauvais diagnostic fait-il baisser le prix de vente ?',
      variantes: [
        'négocier le prix avec le DPE',
        'anomalie électrique négociation vente',
        'décote passoire thermique'
      ],
      court:
        'Il ne l’impose pas, mais il en donne l’argument. Un acheteur qui reçoit un DPE en F ou G, ou une liste d’anomalies électriques, arrive avec un chiffrage de travaux — et cette conversation-là a désormais lieu dans presque toutes les ventes.',
      dessin: 'anomalie-pas-interdiction',
      points: [
        'La classe énergétique est devenue un critère de négociation à part entière, au même titre que l’étage ou l’exposition.',
        'Un rapport électricité chargé d’anomalies se traduit vite en devis d’électricien, que l’acheteur porte à la discussion.',
        'À l’inverse, un dossier propre et complet rassure et accélère : c’est un argument de vente, pas une formalité.',
        'Vous pouvez faire les travaux avant de vendre, ou vendre en l’état et l’assumer dans le prix. Les deux se défendent — l’important est de choisir.'
      ],
      piege:
        'Cacher un rapport gênant ne protège de rien : il sera annexé à l’acte, et le dissimuler transforme un point de négociation en litige après vente.',
      aussi: ['une-anomalie-empeche-t-elle-de-vendre', 'c-est-quoi-une-passoire-thermique', 'que-risque-t-on-sans-diagnostic'],
      verifie: V
    },

    {
      id: 'une-anomalie-empeche-t-elle-de-vendre',
      question: 'Une anomalie dans un rapport empêche-t-elle de vendre ?',
      variantes: [
        'anomalie électrique vente obligatoire travaux',
        'peut-on vendre avec un diagnostic négatif',
        'travaux obligatoires après diagnostic'
      ],
      court:
        'Non. Aucun diagnostic obligatoire n’impose de faire des travaux avant de vendre — sauf le plomb en classe 3, et hors situation de danger immédiat. Le rapport informe l’acheteur ; c’est lui qui décide s’il achète, et à quel prix.',
      dessin: 'anomalie-pas-interdiction',
      points: [
        'Électricité et gaz : les anomalies sont signalées, pas sanctionnées. Le nouvel occupant fera les travaux — ou pas.',
        'Un danger grave et immédiat sur une installation de gaz fait exception : le distributeur est prévenu et l’alimentation peut être coupée le jour même.',
        'Le plomb en classe 3 oblige le propriétaire à des travaux, et à informer les occupants et les entreprises.',
        'L’amiante en mauvais état déclenche des obligations de surveillance ou de retrait, selon le matériau.',
        'Pour tout le reste, la règle est l’information, pas la mise en conformité.'
      ],
      chezMoi:
        'Check My Diag distingue ce que dit le rapport de ce qu’il implique : un verdict, puis « ce que ça change pour vous ».',
      aussi: ['les-diagnostics-font-ils-baisser-le-prix', 'c-est-quoi-le-diagnostic-electricite', 'c-est-quoi-le-crep-plomb'],
      verifie: V
    },

    {
      id: 'vendre-en-l-etat-vice-cache',
      question: 'Les diagnostics me protègent-ils des vices cachés ?',
      variantes: [
        'diagnostic et garantie des vices cachés',
        'vendre en l’état clause',
        'recours acheteur après vente diagnostic'
      ],
      court:
        'Partiellement, et c’est tout leur intérêt pour le vendeur. Sur les points couverts par un diagnostic valable, le vendeur ne peut plus se voir reprocher un vice caché. Sur tout le reste — toiture, humidité, réseaux —, la garantie s’applique pleinement.',
      points: [
        'C’est le fondement même de ces documents : ils échangent de l’information contre de la sécurité juridique.',
        'La protection tombe si le diagnostic est absent, périmé, ou si le vendeur connaissait le défaut et l’a tu.',
        'Un vendeur particulier peut insérer une clause d’exonération de garantie des vices cachés ; elle est sans effet s’il était de mauvaise foi.',
        'Un vendeur professionnel, lui, ne peut pas s’exonérer.'
      ],
      piege:
        'Fournir un diagnostic ne dispense pas de dire ce que vous savez. Un dégât des eaux répété, une fissure suivie, un problème connu : ce qui n’est pas écrit vous reviendra dessus.',
      aussi: ['que-risque-t-on-sans-diagnostic', 'un-diagnostic-garantit-il-le-logement', 'contester-un-diagnostic'],
      sources: [{ titre: 'Code civil, articles 1641 et suivants (vices cachés)', url: LEGI }],
      verifie: V
    },

    {
      id: 'vendre-un-logement-neuf-ou-recent',
      question: 'Mon logement est récent : ai-je vraiment besoin de diagnostics ?',
      variantes: [
        'diagnostic vente maison neuve',
        'diagnostic appartement récent',
        'vendre un bien de moins de 10 ans'
      ],
      court:
        'Oui, mais la liste fond. Un bâtiment construit après juillet 1997 échappe à l’amiante et au plomb ; une installation de moins de quinze ans échappe à l’électricité et au gaz. Restent le DPE, l’état des risques, et la loi Carrez en copropriété.',
      dessin: 'dates-construction',
      points: [
        'Le DPE est dû quel que soit l’âge du bien — un logement récent a simplement de bonnes chances d’être bien noté.',
        'L’état des risques suit l’adresse, pas l’année de construction : il est dû partout où un risque est cartographié.',
        'Les termites restent dus si la commune est classée, même pour une construction neuve.',
        'Gardez l’attestation de conformité électrique du constructeur : c’est elle qui vous dispense du diagnostic pendant quinze ans.'
      ],
      piege:
        'C’est la date du permis de construire qui compte, pas celle de votre achat. Un logement acheté neuf il y a vingt-cinq ans a aujourd’hui une installation de plus de quinze ans.',
      aussi: ['quels-diagnostics-pour-vendre', 'vendre-un-bien-ancien', 'pourquoi-quinze-ans'],
      verifie: V
    },

    {
      id: 'vendre-un-local-commercial',
      question: 'Et pour un local commercial ou professionnel ?',
      variantes: [
        'diagnostic vente local commercial',
        'diagnostic bureau obligatoire',
        'DPE tertiaire'
      ],
      court:
        'La liste n’est pas la même. L’état des risques et le repérage amiante restent dus, un DPE tertiaire s’applique dans la plupart des cas — mais les diagnostics électricité et gaz, eux, visent l’habitation.',
      points: [
        'Le repérage amiante des immeubles d’avant juillet 1997 s’impose, et prend la forme d’un dossier technique amiante tenu à jour.',
        'La surface loi Carrez ne concerne pas les locaux commerciaux : c’est la surface du bail qui fait foi, avec ses propres règles.',
        'Les termites et l’assainissement suivent la même logique qu’en habitation : la commune et le raccordement.',
        'Les obligations de rénovation énergétique du tertiaire relèvent d’un tout autre dispositif que celui des logements.'
      ],
      piege:
        'Un local d’habitation transformé en bureau, ou l’inverse, brouille les cartes : c’est l’usage réel et la destination du bien qui commandent, pas l’enseigne sur la porte. Faites trancher par votre notaire.',
      aussi: ['quels-diagnostics-pour-vendre', 'c-est-quoi-les-listes-a-b-c', 'c-est-quoi-l-etat-des-risques'],
      verifie: V
    },

    {
      id: 'vendre-entre-particuliers',
      question: 'Je vends sans agence : les diagnostics sont-ils obligatoires quand même ?',
      variantes: [
        'vente entre particuliers diagnostic obligatoire',
        'vendre sans agence immobilière diagnostics',
        'de particulier à particulier DPE'
      ],
      court:
        'Exactement les mêmes, et c’est vous qui portez tout. L’obligation pèse sur le vendeur, pas sur l’agence : sans intermédiaire, personne ne vous rappellera ce qui manque avant le rendez-vous chez le notaire.',
      dessin: 'dossier',
      points: [
        'Le notaire vérifiera le dossier à la signature : un document manquant, et l’acte attend.',
        'La classe énergie doit figurer dans votre annonce, y compris sur un site de particuliers.',
        'Sans agence, personne ne détermine la liste applicable à votre bien : donnez au diagnostiqueur l’année du permis de construire et l’adresse exacte, il s’en charge.',
        'Gardez la preuve de la remise des documents à l’acheteur : c’est elle qui vous protège si un litige survient.'
      ],
      chezMoi:
        'Déposez votre dossier avant de le transmettre : vous verrez ce qu’il contient, et surtout ce qui manque au regard de ce qu’il décrit lui-même.',
      aussi: ['quels-diagnostics-pour-vendre', 'que-risque-t-on-sans-diagnostic', 'quand-faire-les-diagnostics-pour-vendre'],
      verifie: V
    }
  ]
};
