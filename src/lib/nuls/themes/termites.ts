import type { Theme } from '../socle';

const V = '2026-08-13';
const LEGI = 'https://www.legifrance.gouv.fr';

export const TERMITES: Theme = {
  id: 'termites-et-merule',
  titre: 'Termites et mérule',
  h1: 'Termites, mérule, insectes du bois : qui mange quoi',
  resume:
    'Un diagnostic obligatoire pour les termites seulement, une simple information pour la mérule, et rien du tout pour les autres. Voici comment s’y retrouver, et ce que couvre vraiment le rapport que vous avez reçu.',
  dessin: 'cordonnet',

  questions: [
    {
      id: 'c-est-quoi-le-diagnostic-termites',
      question: 'Le diagnostic termites, il couvre quoi au juste ?',
      variantes: [
        'diagnostic termites obligatoire zone',
        'état parasitaire ou termites',
        'validité diagnostic termites 6 mois'
      ],
      court:
        'Les termites, et rien d’autre. Il est obligatoire à la vente dans les communes classées par arrêté préfectoral, il ne vaut que six mois, et il ne dit rien des capricornes, des vrillettes ni des champignons.',
      points: [
        'Le diagnostiqueur cherche à l’œil nu et sonde le bois accessible : il ne démonte rien et n’ouvre pas les cloisons.',
        'Sa validité de six mois s’explique par là : une colonie peut s’installer en quelques mois, et rien n’a été ouvert.',
        'Il est dû à la vente, pas à la location.',
        'Pour couvrir les autres insectes et les champignons, il existe l’état parasitaire — utile, complet, et facultatif.',
        'La liste des communes concernées est consultable en préfecture et en mairie.'
      ],
      piege:
        'Un rapport qui conclut « aucun indice d’infestation » ne veut pas dire « pas de termites ». Il veut dire : on n’a rien vu, là où on pouvait regarder.',
      chezMoi:
        'Verrière traduit le verdict de votre rapport en langage ordinaire, et vous rappelle sa date — six mois passent vite.',
      aussi: ['comment-reconnaitre-des-termites', 'j-ai-des-termites-que-faire', 'c-est-quoi-la-merule'],
      savoir: ['cordonnet'],
      sources: [{ titre: 'Code de la construction et de l’habitation, articles L. 126-4 et suivants', url: LEGI }],
      verifie: V
    },

    {
      id: 'comment-reconnaitre-des-termites',
      question: 'Comment reconnaître des termites ?',
      variantes: [
        'signes de termites maison',
        'cordonnet termite',
        'différence termite fourmi volante'
      ],
      court:
        'Par ce qu’ils construisent plus que par ce qu’on voit d’eux. Les termites fuient la lumière : ils montent du sol vers le bois par de petits tunnels de terre collés aux murs, les cordonnets. C’est l’indice principal.',
      dessin: 'cordonnet',
      points: [
        'La colonie vit dans le sol : les termites souterrains remontent par les fondations, les caves, les vides sanitaires.',
        'Le bois attaqué garde une surface intacte et se creuse de l’intérieur : il sonne creux et cède sous la pression du doigt.',
        'Des essaimages d’insectes ailés au printemps, souvent près d’une fenêtre, sont un signal fort.',
        'Ils s’attaquent aussi au papier, au carton et aux plinthes — tout ce qui contient de la cellulose.',
        'Contrairement aux capricornes, ils ne laissent pas de trous de sortie visibles ni de sciure.'
      ],
      aussi: ['c-est-quoi-le-diagnostic-termites', 'j-ai-des-termites-que-faire'],
      savoir: ['cordonnet'],
      verifie: V
    },

    {
      id: 'j-ai-des-termites-que-faire',
      question: 'Il y a des termites : que dois-je faire ?',
      variantes: [
        'déclaration termites mairie',
        'traitement termites obligatoire',
        'vendre une maison avec des termites'
      ],
      court:
        'Deux choses. D’abord une déclaration en mairie : elle est obligatoire dès qu’une présence de termites est constatée. Ensuite un traitement, par une entreprise spécialisée — un traitement partiel ne règle rien, la colonie est ailleurs.',
      points: [
        'La déclaration en mairie permet de suivre la progression des colonies à l’échelle d’un quartier : c’est un enjeu collectif.',
        'Le traitement vise la colonie, pas les individus : barrière chimique dans le sol, ou pièges à appâts suivis dans le temps.',
        'Un traitement demande un suivi de plusieurs mois, avec des passages de contrôle.',
        'La présence de termites n’interdit pas la vente : elle s’écrit, se traite et se négocie.',
        'Conservez les justificatifs de traitement : ils valent autant que le diagnostic pour un acheteur.'
      ],
      piege:
        'Traiter soi-même avec un produit du commerce donne l’illusion d’avoir agi. La colonie, elle, est dans le sol à plusieurs mètres — et elle continue.',
      aussi: ['comment-reconnaitre-des-termites', 'c-est-quoi-le-diagnostic-termites', 'une-anomalie-empeche-t-elle-de-vendre'],
      sources: [{ titre: 'Code de la construction et de l’habitation, article L. 126-5', url: LEGI }],
      verifie: V
    },

    {
      id: 'c-est-quoi-la-merule',
      question: 'C’est quoi la mérule, et suis-je obligé de la signaler ?',
      variantes: [
        'mérule champignon maison',
        'diagnostic mérule obligatoire',
        'information mérule vente'
      ],
      court:
        'Un champignon qui digère le bois humide et peut traverser la maçonnerie. Il n’existe pas de diagnostic mérule obligatoire : dans les zones délimitées par arrêté préfectoral, le vendeur doit simplement informer l’acheteur de cette situation.',
      points: [
        'Elle a besoin d’humidité et d’obscurité : une fuite non traitée, une cave mal ventilée, un mur enterré.',
        'Elle se reconnaît à un feutrage blanc cotonneux, puis à des plaques brun-rouille, et à une odeur de champignon.',
        'Elle progresse vite et fragilise les bois de structure : planchers, solives, charpentes.',
        'Le traitement passe d’abord par la suppression de la source d’humidité — sans cela, rien ne tient.',
        'Un état parasitaire volontaire permet de la faire chercher explicitement.'
      ],
      piege:
        'L’information mérule est souvent confondue avec un diagnostic. Ce n’est qu’une déclaration : personne n’est venu chercher le champignon chez vous.',
      aussi: ['c-est-quoi-le-diagnostic-termites', 'un-diagnostic-garantit-il-le-logement', 'c-est-quoi-l-etat-des-risques'],
      sources: [{ titre: 'Code de la construction et de l’habitation, article L. 126-9', url: LEGI }],
      verifie: V
    },

    {
      id: 'ma-commune-est-elle-en-zone-termites',
      question: 'Comment savoir si ma commune est en zone termites ?',
      variantes: [
        'carte des zones termites France',
        'arrêté préfectoral termites commune',
        'diagnostic termites obligatoire où'
      ],
      court:
        'C’est le préfet de votre département qui délimite les zones, commune par commune, par arrêté. La liste se consulte en mairie et en préfecture — et tout diagnostiqueur de votre secteur la connaît par cœur.',
      points: [
        'Les zones concernées se concentrent sur la façade atlantique, le Sud-Ouest, le pourtour méditerranéen et la vallée de la Garonne, mais la liste évolue.',
        'Un arrêté peut ajouter une commune : une adresse hors zone il y a cinq ans peut y être aujourd’hui.',
        'L’arrêté ne dit pas qu’il y a des termites chez vous : il dit que le département en a constaté sur son territoire.',
        'Hors zone délimitée, le diagnostic n’est pas obligatoire — rien n’empêche de le demander si un doute existe.'
      ],
      chezMoi:
        'Si votre dossier de vente contient un rapport termites, c’est que votre commune est classée : l’information est là, sans avoir à chercher.',
      aussi: ['c-est-quoi-le-diagnostic-termites', 'comment-reconnaitre-des-termites', 'quels-diagnostics-pour-vendre'],
      sources: [{ titre: 'Code de la construction et de l’habitation, article L. 126-4', url: LEGI }],
      verifie: V
    }
  ]
};
