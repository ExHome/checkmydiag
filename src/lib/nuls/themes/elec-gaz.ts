import type { Theme } from '../socle';

const V = '2026-08-13';
const LEGI = 'https://www.legifrance.gouv.fr';

export const ELEC_GAZ: Theme = {
  id: 'electricite-et-gaz',
  titre: 'Électricité et gaz',
  h1: 'Électricité et gaz : les deux diagnostics qui parlent d’accidents',
  resume:
    'Ce sont les seuls diagnostics qui portent sur un risque immédiat : l’électrocution, l’incendie, l’intoxication. Voici ce qu’ils contrôlent, ce que veulent dire leurs anomalies, et quand il faut agir tout de suite.',
  dessin: 'six-points',

  questions: [
    {
      id: 'c-est-quoi-le-diagnostic-electricite',
      question: 'Le diagnostic électricité, il contrôle quoi ?',
      variantes: [
        'diagnostic électrique 6 points',
        'diagnostic électricité plus de 15 ans',
        'que vérifie le diagnostiqueur électricité'
      ],
      court:
        'Six points, et six seulement : la coupure générale, le différentiel, la mise à la terre, la protection de chaque circuit, les matériels dangereux ou vétustes, et l’installation de la salle d’eau. Il est dû dès que l’installation intérieure a plus de quinze ans.',
      dessin: 'six-points',
      points: [
        'Ce n’est pas un contrôle de conformité aux normes actuelles : une installation ancienne peut être sûre sans être aux normes d’aujourd’hui.',
        'Le diagnostiqueur ne démonte rien : il ouvre le tableau, teste, observe, et note ce qu’il voit.',
        'Les anomalies sont classées par point de contrôle et par gravité, avec un libellé réglementaire — d’où l’aspect indigeste du rapport.',
        'Le rapport vaut 3 ans pour vendre, 6 ans pour louer.',
        'Une installation neuve ou rénovée avec une attestation Consuel de moins de trois ans dispense du diagnostic.'
      ],
      piege:
        'Un grand nombre d’anomalies n’égale pas un grand danger. Une même cause — l’absence de terre dans un logement ancien — génère mécaniquement des dizaines de lignes.',
      chezMoi:
        'Verrière regroupe vos anomalies par point de contrôle : vous voyez d’un coup si vous avez un problème, ou le même problème répété trente fois.',
      aussi: ['mon-installation-a-des-anomalies-c-est-grave', 'c-est-quoi-un-differentiel', 'dois-je-mettre-mon-installation-aux-normes'],
      savoir: ['differentiel', 'mise-a-la-terre'],
      sources: [{ titre: 'Arrêté du 28 septembre 2017 (diagnostic électricité)', url: LEGI }],
      verifie: V
    },

    {
      id: 'c-est-quoi-un-differentiel',
      question: 'C’est quoi le différentiel, et pourquoi tout le monde en parle ?',
      variantes: [
        'dispositif différentiel 30 mA',
        'différence disjoncteur et différentiel',
        'à quoi sert un interrupteur différentiel'
      ],
      court:
        'C’est l’appareil du tableau qui compare le courant qui part et celui qui revient. Dès qu’il en manque — parce qu’il passe ailleurs, par la terre ou par une personne — il coupe tout en une fraction de seconde. C’est le seul organe qui protège les gens.',
      dessin: 'differentiel',
      points: [
        'Un disjoncteur ordinaire protège les fils contre la surchauffe. Il ne protège pas les personnes.',
        'La sensibilité qui protège les personnes est de 30 milliampères : c’est cette valeur que le diagnostiqueur vérifie.',
        'Il ne fonctionne bien qu’avec une mise à la terre correcte : les deux vont ensemble.',
        'Testez-le deux fois par an avec le bouton « test » du tableau : il doit couper. S’il ne coupe pas, il ne vous protège plus.',
        'Son absence est l’anomalie la plus sérieuse que puisse relever un diagnostic électrique.'
      ],
      chezMoi:
        'Dans votre rapport, cherchez le point de contrôle « dispositif différentiel à haute sensibilité ». C’est celui à lire en premier.',
      aussi: ['c-est-quoi-le-diagnostic-electricite', 'mon-installation-a-des-anomalies-c-est-grave'],
      savoir: ['differentiel', 'mise-a-la-terre'],
      verifie: V
    },

    {
      id: 'mon-installation-a-des-anomalies-c-est-grave',
      question: 'Mon rapport électrique est plein d’anomalies : c’est grave ?',
      variantes: [
        'beaucoup d’anomalies diagnostic électrique',
        'anomalie électrique obligation travaux',
        'rapport électricité négatif vente'
      ],
      court:
        'Ça dépend desquelles, pas de combien. L’absence de différentiel ou de terre, des fils nus, du matériel dangereux dans une salle de bains : ce sont des points à traiter. Une prise sans terre dans une chambre, non.',
      dessin: 'anomalie-pas-interdiction',
      points: [
        'Aucune anomalie électrique n’oblige à faire des travaux avant de vendre ou de louer.',
        'Elles obligent en revanche à informer : l’acheteur ou le locataire signe en sachant.',
        'Classez-les vous-même en trois tas : ce qui protège les personnes, ce qui évite l’incendie, ce qui est du confort.',
        'Un électricien lira ce rapport en dix minutes et vous chiffrera les deux premiers tas.',
        'Beaucoup d’anomalies se règlent par le remplacement du tableau : un seul chantier, la plupart des lignes qui tombent.'
      ],
      piege:
        'Le rapport ne hiérarchise pas pour vous. Toutes les anomalies s’écrivent avec le même ton réglementaire, qu’il s’agisse d’un risque mortel ou d’une prise mal placée.',
      chezMoi:
        'Verrière regroupe vos anomalies par point de contrôle : vous voyez d’un coup si vous avez six problèmes distincts, ou le même répété trente fois — ce qui ne se chiffre pas pareil chez un électricien.',
      aussi: ['c-est-quoi-un-differentiel', 'dois-je-mettre-mon-installation-aux-normes', 'une-anomalie-empeche-t-elle-de-vendre'],
      verifie: V
    },

    {
      id: 'dois-je-mettre-mon-installation-aux-normes',
      question: 'Suis-je obligé de mettre mon installation aux normes ?',
      variantes: [
        'mise aux normes électrique obligatoire vente',
        'norme NF C 15-100 obligation',
        'refaire l’électricité avant de vendre'
      ],
      court:
        'Non. La norme s’applique aux installations neuves et aux rénovations complètes, pas à l’existant. Ce que la loi exige d’une installation ancienne, c’est qu’elle soit sûre — pas qu’elle soit conforme aux règles d’aujourd’hui.',
      dessin: 'sur-ou-aux-normes',
      piege:
        'On confond « anomalie relevée » et « obligation de travaux ». Le diagnostic mesure la sécurité, pas la conformité au neuf : une installation ancienne peut aligner des anomalies sans être dangereuse, et une installation récente peut l’être.',
      chezMoi:
        'Reprenez votre rapport et isolez deux points : le dispositif différentiel et la mise à la terre. S’ils sont là et fonctionnels, le reste relève de l’amélioration, pas de la mise en sécurité.',
      points: [
        'Aucun texte n’impose de rénover une installation ancienne au motif qu’elle est ancienne.',
        'La sécurité, elle, s’impose : un bailleur doit fournir un logement décent, donc des installations en bon état d’usage.',
        'Faire les travaux avant de vendre est un choix économique : vous les payez au prix d’un artisan, l’acheteur les négocie au prix qu’il annonce.',
        'Toute intervention lourde sur le tableau déclenche, elle, l’application des règles actuelles.'
      ],
      aussi: ['mon-installation-a-des-anomalies-c-est-grave', 'une-anomalie-empeche-t-elle-de-vendre'],
      verifie: V
    },

    {
      id: 'c-est-quoi-le-diagnostic-gaz',
      question: 'Le diagnostic gaz, il contrôle quoi ?',
      variantes: [
        'diagnostic gaz plus de 15 ans',
        'contrôle installation gaz vente',
        'que vérifie le diagnostic gaz'
      ],
      court:
        'La tuyauterie fixe, le raccordement des appareils, la ventilation des pièces et l’évacuation des fumées. Autrement dit : la fuite, l’explosion, et surtout le monoxyde de carbone. Il est dû dès que l’installation intérieure a plus de quinze ans.',
      dessin: 'monoxyde',
      points: [
        'Il porte sur l’installation intérieure : après le compteur, à l’intérieur du logement.',
        'La ventilation compte autant que les tuyaux : une flamme a besoin d’air, et une grille bouchée est une anomalie à part entière.',
        'Les anomalies sont classées A1, A2 et DGI — la dernière signifie danger grave et immédiat.',
        'Le rapport vaut 3 ans pour vendre, 6 ans pour louer.',
        'Il ne remplace pas l’entretien annuel de la chaudière, qui est une autre obligation.'
      ],
      chezMoi:
        'Le verdict du diagnostic gaz tient en une phrase, souvent noyée. Verrière la remonte, et vous dit si un DGI a été relevé.',
      aussi: ['c-est-quoi-un-dgi-gaz', 'le-monoxyde-de-carbone-c-est-quoi', 'c-est-quoi-le-diagnostic-electricite'],
      savoir: ['monoxyde-de-carbone'],
      sources: [{ titre: 'Arrêté du 23 février 2018 (diagnostic gaz)', url: LEGI }],
      verifie: V
    },

    {
      id: 'c-est-quoi-un-dgi-gaz',
      question: 'Mon rapport gaz mentionne un DGI : qu’est-ce que ça veut dire ?',
      variantes: [
        'DGI danger grave et immédiat gaz',
        'anomalie A1 A2 DGI',
        'coupure gaz après diagnostic'
      ],
      court:
        'DGI veut dire danger grave et immédiat. C’est la seule anomalie de tous les diagnostics qui déclenche une action le jour même : le diagnostiqueur interrompt l’alimentation de la partie concernée et prévient le distributeur de gaz.',
      points: [
        'A1 : anomalie à corriger lors d’une prochaine intervention. Pas d’urgence.',
        'A2 : anomalie à corriger dans les meilleurs délais. À traiter, sans panique.',
        'DGI : danger grave et immédiat. Coupure, et remise en service seulement après réparation par un professionnel.',
        'Un DGI n’interdit pas de vendre : il interdit d’utiliser l’installation en l’état.',
        'La remise en service passe par un professionnel du gaz, qui atteste des travaux.'
      ],
      piege:
        'Un DGI dans le rapport ne veut pas dire que le danger est encore là aujourd’hui : il a normalement été traité le jour de la visite. Ce qui compte, c’est de savoir si la réparation a bien eu lieu — et de le demander par écrit.',
      aussi: ['c-est-quoi-le-diagnostic-gaz', 'le-monoxyde-de-carbone-c-est-quoi', 'une-anomalie-empeche-t-elle-de-vendre'],
      verifie: V
    },

    {
      id: 'le-monoxyde-de-carbone-c-est-quoi',
      question: 'Le monoxyde de carbone, ça vient d’où ?',
      variantes: [
        'monoxyde de carbone chaudière',
        'intoxication CO logement',
        'grille d’aération bouchée danger'
      ],
      court:
        'D’une flamme qui manque d’air. Une chaudière, un chauffe-eau ou un poêle qui brûle dans une pièce mal ventilée produit un gaz invisible, inodore, et mortel. C’est la première cause de mort par intoxication accidentelle en France.',
      dessin: 'monoxyde',
      points: [
        'Les premiers signes ressemblent à une grippe : maux de tête, nausées, fatigue anormale qui passe quand on sort.',
        'À forte dose, il endort puis il tue, sans que personne ne se réveille.',
        'Les causes les plus fréquentes : une grille d’aération bouchée ou calfeutrée, un conduit encrassé, un appareil mal réglé.',
        'Une hotte puissante peut aspirer l’air dont la flamme a besoin : c’est un cas classique en cuisine.',
        'Ne bouchez jamais une grille d’air, même en hiver, même si ça souffle. C’est elle qui vous protège.'
      ],
      piege:
        'Un détecteur de fumée ne détecte pas le monoxyde. Ce sont deux appareils différents, et le second n’est pas obligatoire — il coûte pourtant le prix d’un repas.',
      chezMoi:
        'Dans votre rapport gaz, cherchez ce qui touche à la ventilation et à l’évacuation des fumées. C’est la partie qui parle de monoxyde, même quand le mot n’y figure pas.',
      aussi: ['c-est-quoi-le-diagnostic-gaz', 'c-est-quoi-un-dgi-gaz'],
      savoir: ['monoxyde-de-carbone', 'ventilation'],
      verifie: V
    },

    {
      id: 'pourquoi-quinze-ans',
      question: 'Pourquoi le seuil est-il de quinze ans ?',
      variantes: [
        'installation électrique plus de 15 ans diagnostic',
        'comment prouver l’âge de son installation',
        'diagnostic gaz installation récente'
      ],
      court:
        'Parce qu’au-delà de quinze ans, une installation a vieilli sans forcément avoir été touchée. Le seuil se compte sur l’installation elle-même, pas sur le bâtiment : une maison de 1950 rénovée l’an dernier n’est pas concernée.',
      points: [
        'Ce qui prouve l’âge : une attestation Consuel, une facture d’électricien, un certificat de conformité gaz.',
        'Sans preuve, le diagnostic est dû — le doute ne dispense pas.',
        'Une installation partiellement refaite reste concernée pour ce qui est ancien.',
        'Conservez ces attestations : elles évitent un diagnostic, et elles valorisent le bien.'
      ],
      aussi: ['c-est-quoi-le-diagnostic-electricite', 'c-est-quoi-le-diagnostic-gaz', 'quels-diagnostics-pour-vendre'],
      verifie: V
    }
  ]
};
