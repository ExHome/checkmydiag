import type { Theme } from '../socle';

const V = '2026-08-13';
const ADEME = 'https://www.ademe.fr';
const LEGI = 'https://www.legifrance.gouv.fr';

export const DPE: Theme = {
  id: 'le-dpe',
  titre: 'Le DPE',
  h1: 'Le DPE, la lettre qui fait tout basculer',
  resume:
    'La note A à G, ce qu’elle mesure vraiment, pourquoi elle ne ressemble pas à vos factures, et ce qu’elle vous interdit ou vous impose. C’est le diagnostic qui a le plus de conséquences — et celui qu’on comprend le moins.',
  dessin: 'etiquette',

  questions: [
    {
      id: 'c-est-quoi-le-dpe',
      question: 'C’est quoi le DPE ?',
      variantes: [
        'diagnostic de performance énergétique définition',
        'à quoi sert le DPE',
        'DPE c’est quoi en clair'
      ],
      court:
        'Le diagnostic de performance énergétique note un logement de A à G selon l’énergie qu’il consomme et les gaz à effet de serre qu’il émet. C’est une note du bâtiment, pas de ceux qui l’habitent.',
      dessin: 'etiquette',
      points: [
        'Il est obligatoire pour vendre et pour louer, et sa classe doit figurer dans l’annonce.',
        'Il est calculé, pas mesuré : le diagnostiqueur relève les caractéristiques du logement — surfaces, isolation, fenêtres, chauffage, eau chaude, ventilation — et un moteur de calcul en déduit la note.',
        'Il vaut 10 ans, et sa classe engage désormais celui qui le fournit.',
        'Il s’accompagne toujours de recommandations de travaux, avec une estimation de leur effet sur la classe.'
      ],
      piege:
        'Le DPE ne dit pas ce que vous allez payer. Il décrit un logement occupé selon un scénario standard — même température, mêmes horaires pour tout le monde. Deux familles dans le même appartement auront deux factures très différentes et un seul DPE.',
      chezMoi:
        'Sur votre rapport, cherchez les deux réglettes colorées. Celle du haut est l’énergie, celle du bas les émissions. La classe retenue est la moins bonne des deux.',
      aussi: [
        'comment-lire-l-etiquette-dpe',
        'le-dpe-correspond-il-a-mes-factures',
        'c-est-quoi-une-passoire-thermique'
      ],
      savoir: ['energie-primaire'],
      sources: [
        { titre: 'Arrêté du 31 mars 2021 relatif au DPE (méthode et seuils)', url: LEGI },
        { titre: 'ADEME — le diagnostic de performance énergétique', url: ADEME }
      ],
      verifie: V
    },

    {
      id: 'comment-lire-l-etiquette-dpe',
      question: 'Pourquoi il y a deux étiquettes sur mon DPE ?',
      variantes: [
        'étiquette énergie et étiquette climat',
        'lire l’étiquette DPE',
        'différence énergie climat DPE',
        'double seuil DPE'
      ],
      court:
        'Parce que le DPE mesure deux choses : l’énergie consommée et le CO₂ émis. Chacune a sa note de A à G — et c’est la moins bonne des deux qui devient la classe officielle du logement. C’est la règle du double seuil.',
      dessin: 'deux-etiquettes',
      points: [
        'L’étiquette énergie se compte en kilowattheures d’énergie primaire par mètre carré et par an.',
        'L’étiquette climat se compte en kilos de CO₂ par mètre carré et par an.',
        'Un logement peu gourmand mais chauffé au fioul sera tiré vers le bas par le climat. Un logement tout électrique sera plutôt pénalisé par l’énergie.',
        'Les deux réglettes sont toujours imprimées : si vous n’en regardez qu’une, vous pouvez vous tromper de classe.'
      ],
      tableau: {
        colonnes: ['Classe', 'Énergie (kWh/m²/an)', 'CO₂ (kg/m²/an)'],
        lignes: [
          ['A', 'moins de 70', 'moins de 6'],
          ['B', '70 à 110', '6 à 11'],
          ['C', '110 à 180', '11 à 30'],
          ['D', '180 à 250', '30 à 50'],
          ['E', '250 à 330', '50 à 70'],
          ['F', '330 à 420', '70 à 100'],
          ['G', '420 et plus', '100 et plus']
        ],
        reserve:
          'Seuils de la France métropolitaine (arrêté du 31 mars 2021). Ils sont ajustés pour les logements de 40 m² ou moins, et diffèrent outre-mer.'
      },
      piege:
        'La lettre A→G est imprimée en image dans le PDF. Un logiciel qui la « lit » ne la lit pas vraiment : il faut la recalculer depuis les valeurs chiffrées. Si votre lettre et vos chiffres ne concordent pas, le point mérite une question.',
      chezMoi:
        'Verrière recalcule votre classe à partir de la consommation, de la surface et des émissions, avec les seuils de l’arrêté — et vous dit si elle correspond à la lettre imprimée.',
      aussi: ['c-est-quoi-le-dpe', 'pourquoi-mon-logement-electrique-est-mal-note', 'le-dpe-est-il-fiable'],
      sources: [{ titre: 'Arrêté du 31 mars 2021, annexe relative aux seuils', url: LEGI }],
      verifie: V
    },

    {
      id: 'pourquoi-mon-logement-electrique-est-mal-note',
      question: 'Pourquoi mon logement tout électrique est-il mal noté ?',
      variantes: [
        'DPE électrique pénalisé',
        'coefficient 1,9 électricité DPE',
        'énergie primaire énergie finale',
        'chauffage électrique mauvaise note DPE'
      ],
      court:
        'Parce que le DPE ne compte pas l’électricité qui arrive chez vous, mais celle qu’il a fallu produire pour vous l’apporter. Un kilowattheure au compteur en vaut 1,9 à la source depuis le 1ᵉʳ janvier 2026 : votre consommation est multipliée par 1,9 avant d’être notée. Les DPE établis avant cette date ont été calculés avec 2,3.',
      dessin: 'primaire-finale',
      points: [
        'On appelle ça l’énergie primaire, par opposition à l’énergie finale — celle du compteur, celle que vous payez.',
        'Le gaz, le fioul et le bois sont comptés à l’identique : leur coefficient est de 1.',
        'C’est ce qui explique qu’un logement électrique correct sur ses factures se retrouve deux classes plus bas qu’attendu.',
        'En contrepartie, l’électricité émet très peu de CO₂ en France : la deuxième étiquette, elle, est bonne.'
      ],
      piege:
        'Ce coefficient n’est pas une opinion sur l’électricité : c’est une convention de calcul inscrite dans la réglementation. Contester la note sur ce motif ne mène nulle part — c’est la règle du jeu, la même pour tout le monde.',
      chezMoi:
        'Comparez les deux réglettes de votre DPE : une étiquette énergie médiocre avec une étiquette climat bonne est la signature du chauffage électrique.',
      aussi: ['comment-lire-l-etiquette-dpe', 'le-dpe-correspond-il-a-mes-factures', 'quels-travaux-pour-gagner-une-classe'],
      savoir: ['energie-primaire'],
      sources: [{ titre: 'Arrêté du 31 mars 2021 — coefficient d’énergie primaire', url: LEGI }],
      verifie: V
    },

    {
      id: 'le-dpe-correspond-il-a-mes-factures',
      question: 'Pourquoi le DPE ne correspond pas à mes factures ?',
      variantes: [
        'DPE différent de ma consommation réelle',
        'DPE calculé sur facture',
        'estimation des coûts DPE fausse'
      ],
      court:
        'Parce qu’il ne les regarde pas. Depuis 2021, le DPE est calculé sur les caractéristiques du logement et un scénario d’occupation standard, identique pour tout le monde. Vos habitudes, votre nombre d’occupants et vos hivers n’entrent pas dedans.',
      dessin: 'cinq-postes',
      points: [
        'Cinq usages sont comptés : chauffage, eau chaude, refroidissement, éclairage et ventilation.',
        'Tout le reste est ignoré : électroménager, plaques, four, télévision, ordinateurs, recharge d’un véhicule.',
        'Le scénario suppose une température de consigne, des horaires et une occupation conventionnels.',
        'Une fourchette de coût annuel figure au rapport : c’est une estimation calculée, pas un devis d’énergéticien.',
        'Vivre à 18 °C dans une passoire coûte moins cher que le DPE ne l’annonce — le logement reste une passoire.'
      ],
      piege:
        'L’ancienne méthode « sur factures », utilisée avant juillet 2021 pour certains logements, n’existe plus. Si vous comparez un DPE d’avant à un DPE d’aujourd’hui, vous comparez deux choses différentes.',
      aussi: ['c-est-quoi-le-dpe', 'pourquoi-mon-logement-electrique-est-mal-note', 'le-dpe-est-il-fiable'],
      savoir: ['deperdition'],
      verifie: V
    },

    {
      id: 'c-est-quoi-une-passoire-thermique',
      question: 'C’est quoi une passoire thermique ?',
      variantes: [
        'passoire énergétique définition',
        'logement classé F ou G',
        'passoire thermique conséquences'
      ],
      court:
        'C’est le surnom donné aux logements classés F ou G au DPE. Le mot n’a rien d’officiel, mais les conséquences le sont : gel du loyer, interdiction progressive de louer, audit énergétique obligatoire pour vendre une maison.',
      dessin: 'etiquette-passoire',
      points: [
        'Ce sont les deux dernières classes de l’échelle : celles où la chaleur part plus vite qu’on ne la produit.',
        'Le loyer d’un logement classé F ou G ne peut plus être augmenté, y compris entre deux locataires.',
        'Pour vendre une maison individuelle classée F ou G, un audit énergétique doit être fourni en plus du DPE.',
        'Ces logements sortent de la location les uns après les autres, selon un calendrier fixé par la loi.',
        'Une passoire n’est pas insalubre : on peut y habiter, l’acheter, la vendre. C’est la location qui se ferme.'
      ],
      chezMoi:
        'Votre classe est la moins bonne des deux réglettes. Si c’est F ou G, la page suivante vous concerne directement.',
      aussi: ['puis-je-encore-louer-un-logement-classe-g', 'c-est-quoi-l-audit-energetique', 'quels-travaux-pour-gagner-une-classe'],
      sources: [{ titre: 'Loi Climat et Résilience du 22 août 2021', url: LEGI }],
      verifie: V
    },

    {
      id: 'puis-je-encore-louer-un-logement-classe-g',
      question: 'Puis-je encore louer un logement classé F ou G ?',
      variantes: [
        'interdiction location passoire thermique calendrier',
        'louer un logement classé G en 2025',
        'loi climat location DPE'
      ],
      court:
        'Les logements les plus gourmands sortent de la location par étapes : la classe G depuis le 1ᵉʳ janvier 2025, la classe F au 1ᵉʳ janvier 2028, la classe E au 1ᵉʳ janvier 2034. Un bail en cours n’est pas annulé du jour au lendemain, mais le logement ne peut plus être reloué en l’état.',
      dessin: 'calendrier-location',
      points: [
        'Concrètement, un logement concerné n’est plus considéré comme décent : il ne peut plus faire l’objet d’un nouveau bail ni d’un renouvellement.',
        'Le locataire déjà en place peut demander au propriétaire de réaliser des travaux, et saisir le juge en cas de refus.',
        'Le gel des loyers frappe les classes F et G depuis 2022 : plus d’augmentation, ni en cours de bail, ni à la relocation.',
        'Ce calendrier ne concerne pas la vente : un logement classé G se vend, et se vend souvent moins cher.',
        'Des situations particulières existent — copropriétés bloquées, contraintes patrimoniales, refus d’autorisation d’urbanisme.'
      ],
      piege:
        'Ce calendrier a été discuté, amendé et repoussé plusieurs fois depuis 2021, et il continue de l’être. Avant d’acheter pour louer, ou de renoncer à des travaux, faites confirmer la date qui vous concerne — c’est une décision à plusieurs dizaines de milliers d’euros.',
      chezMoi:
        'Regardez la classe retenue sur votre DPE — la moins bonne des deux réglettes — et sa date de visite. Ces deux informations suffisent à savoir si vous êtes concerné, et à partir de quand.',
      aussi: ['c-est-quoi-une-passoire-thermique', 'quels-travaux-pour-gagner-une-classe', 'quels-diagnostics-pour-louer'],
      sources: [
        { titre: 'Loi Climat et Résilience du 22 août 2021, article 160', url: LEGI },
        { titre: 'Service-public.fr — décence du logement et performance énergétique', url: 'https://www.service-public.fr' }
      ],
      verifie: V
    },

    {
      id: 'c-est-quoi-l-audit-energetique',
      question: 'C’est quoi l’audit énergétique, et en quoi diffère-t-il du DPE ?',
      variantes: [
        'audit énergétique obligatoire vente',
        'différence DPE et audit énergétique',
        'audit énergétique maison classée F'
      ],
      court:
        'Le DPE constate, l’audit propose. L’audit énergétique décrit deux scénarios de travaux chiffrés pour faire remonter le logement de classe, et il est obligatoire pour vendre une maison individuelle ou un immeuble détenu par un seul propriétaire quand le DPE est mauvais.',
      dessin: 'audit-parcours',
      points: [
        'Il s’impose à la vente des maisons et immeubles en monopropriété classés F ou G depuis avril 2023, et classés E depuis janvier 2025.',
        'Il présente au moins deux scénarios : une première étape utile, puis un parcours complet visant au minimum la classe B ou C selon les cas.',
        'Chaque scénario est chiffré, avec l’ordre des travaux — l’ordre compte autant que la liste.',
        'Il est valable 5 ans, et doit être remis à l’acheteur dès la première visite.',
        'Il ne vous oblige à rien : l’acheteur reçoit une feuille de route, il en fait ce qu’il veut.'
      ],
      piege:
        'Les chiffres de l’audit sont des ordres de grandeur calculés, pas des devis. Un artisan pourra annoncer un tout autre montant — c’est normal, et ce n’est pas une erreur de l’auditeur.',
      chezMoi:
        'Un audit tient souvent dans le même PDF que le DPE, juste après lui. Repérez ses tableaux de scénarios : ils citent des gains en kWh qui ne sont pas la consommation de votre logement.',
      aussi: ['c-est-quoi-une-passoire-thermique', 'quels-travaux-pour-gagner-une-classe', 'quels-diagnostics-pour-vendre'],
      sources: [{ titre: 'Code de la construction et de l’habitation, article L. 126-28-1', url: LEGI }],
      verifie: V
    },

    {
      id: 'quels-travaux-pour-gagner-une-classe',
      question: 'Quels travaux font vraiment gagner une classe ?',
      variantes: [
        'améliorer son DPE',
        'passer de G à E travaux',
        'quels travaux pour sortir de la passoire thermique'
      ],
      court:
        'Ceux qui touchent l’enveloppe avant ceux qui touchent la chaudière : toiture, murs, puis fenêtres et ventilation. Changer un système de chauffage dans un logement non isolé fait gagner peu, et coûte cher à faire tourner.',
      dessin: 'primaire-finale',
      points: [
        'La toiture est presque toujours le premier poste : c’est par le haut que part la plus grande part de la chaleur.',
        'L’isolation des murs vient ensuite, puis les fenêtres — dont l’effet sur la note est plus faible qu’on ne le croit.',
        'Sortir du fioul fait gagner sur l’étiquette climat, souvent plusieurs crans d’un coup.',
        'Une ventilation qui fonctionne est indispensable : isoler sans ventiler crée de la condensation et des moisissures.',
        'L’ordre des travaux compte : chaque geste fait dans le désordre coûte plus cher et rapporte moins.'
      ],
      piege:
        'Un logement qui gagne des lettres sur le papier n’est pas forcément confortable. À l’inverse, isoler un logement sans traiter les jonctions — les ponts thermiques — laisse le froid entrer par les bords.',
      chezMoi:
        'La page « recommandations » de votre DPE liste déjà les travaux retenus pour votre logement, avec leur effet estimé sur la classe.',
      aussi: ['c-est-quoi-l-audit-energetique', 'c-est-quoi-une-passoire-thermique', 'pourquoi-mon-logement-electrique-est-mal-note'],
      savoir: ['toiture', 'pont-thermique', 'ventilation'],
      sources: [{ titre: 'ADEME — rénover son logement', url: ADEME }],
      verifie: V
    },

    {
      id: 'le-dpe-est-il-fiable',
      question: 'Le DPE est-il fiable ? Deux diagnostiqueurs peuvent-ils trouver deux classes ?',
      variantes: [
        'DPE fiable ou pas',
        'deux DPE différents même logement',
        'DPE erroné que faire'
      ],
      court:
        'La méthode est la même pour tous depuis 2021, mais elle repose sur ce que le diagnostiqueur relève sur place. Quand une information manque — l’épaisseur d’un isolant, l’année d’une chaudière — le calcul retient une valeur par défaut pénalisante. C’est là que deux rapports peuvent diverger.',
      points: [
        'Les valeurs par défaut sont volontairement défavorables : le doute ne profite pas au logement.',
        'Une facture d’isolation, un devis de menuiserie, une attestation de travaux permettent de remplacer une valeur par défaut par une valeur réelle.',
        'Rassemblez ces justificatifs avant la visite : c’est le geste le plus rentable de toute l’opération.',
        'Depuis 2021, le DPE est opposable : un rapport manifestement faux engage la responsabilité de son auteur.',
        'Un désaccord se règle d’abord par écrit avec le diagnostiqueur, puis par une contre-expertise.'
      ],
      dessin: 'dpe-opposable',
      piege:
        'Beaucoup de mauvaises notes ne viennent pas d’une erreur, mais d’un dossier vide. Personne ne peut deviner qu’il y a 20 cm de laine de verre sous le plancher des combles si rien ne le prouve.',
      aussi: ['contester-un-diagnostic', 'comment-lire-l-etiquette-dpe', 'le-dpe-correspond-il-a-mes-factures'],
      verifie: V
    },

    {
      id: 'dpe-collectif-ou-individuel',
      question: 'En appartement, le DPE est-il celui de l’immeuble ou du mien ?',
      variantes: [
        'DPE collectif copropriété',
        'DPE appartement chauffage collectif',
        'DPE immeuble obligatoire'
      ],
      court:
        'Les deux existent. Pour vendre ou louer votre appartement, c’est un DPE individuel qu’il vous faut. Le DPE collectif porte sur l’immeuble entier, il est à la charge de la copropriété, et il peut servir de base au vôtre.',
      points: [
        'Le DPE collectif est devenu obligatoire pour les copropriétés d’habitation, selon un calendrier échelonné selon leur taille.',
        'En chauffage collectif, le DPE individuel s’appuie sur les données de l’immeuble, corrigées pour votre lot.',
        'Votre étage, votre orientation et le nombre de murs donnant sur l’extérieur changent votre note : un dernier étage sous toiture n’a pas la classe du rez-de-chaussée.',
        'Le syndic doit pouvoir vous transmettre le DPE collectif ; il fait gagner du temps et de l’argent sur le vôtre.'
      ],
      piege:
        'On ne vend pas un appartement avec le DPE de l’immeuble. Un acquéreur, une banque ou un notaire refuseront le document — et ils auront raison.',
      aussi: ['quels-diagnostics-pour-vendre', 'c-est-quoi-le-dpe'],
      sources: [{ titre: 'Code de la construction et de l’habitation, article L. 126-31', url: LEGI }],
      verifie: V
    },

    {
      id: 'dpe-opposable-ca-veut-dire-quoi',
      question: 'Le DPE est « opposable » : ça veut dire quoi ?',
      variantes: [
        'DPE opposable définition',
        'recours DPE faux',
        'DPE valeur juridique'
      ],
      court:
        'Qu’il engage. Avant 2021, le DPE n’était donné qu’à titre informatif : on ne pouvait rien réclamer sur sa base. Aujourd’hui, un acheteur ou un locataire qui découvre que la classe annoncée est fausse peut demander réparation.',
      dessin: 'dpe-opposable',
      points: [
        'L’acheteur peut se retourner contre le vendeur, qui peut lui-même se retourner contre le diagnostiqueur.',
        'Les recommandations de travaux, elles, restent informatives : elles n’engagent personne.',
        'C’est ce changement qui a rendu le DPE central dans les négociations de prix.',
        'C’est aussi pour cela que les diagnostiqueurs demandent des justificatifs : ils répondent de leurs chiffres.'
      ],
      aussi: ['le-dpe-est-il-fiable', 'contester-un-diagnostic', 'c-est-quoi-le-dpe'],
      sources: [{ titre: 'Code de la construction et de l’habitation, article L. 126-29', url: LEGI }],
      verifie: V
    },

    {
      id: 'mon-ancien-dpe-est-il-encore-valable',
      question: 'Mon DPE date de plusieurs années : est-il encore valable ?',
      variantes: [
        'DPE avant 2021 encore valable',
        'validité ancien DPE',
        'faut-il refaire son DPE'
      ],
      court:
        'Un DPE vaut 10 ans à partir de la visite, mais les DPE établis avant juillet 2021 ont tous été mis hors jeu par avance : la méthode a changé, et leurs dates de fin ont été raccourcies. En pratique, un DPE d’avant cette réforme est aujourd’hui à refaire.',
      points: [
        'La réforme de juillet 2021 a supprimé l’ancienne méthode « sur factures » et rendu le DPE opposable.',
        'Un DPE d’avant la réforme ne peut plus servir : il n’est ni comparable, ni opposable.',
        'Refaire un DPE après des travaux d’isolation est souvent rentable : c’est ce qui matérialise le gain de classe.',
        'Après des travaux, l’ancien rapport ne décrit plus votre logement, même s’il n’est pas encore périmé.'
      ],
      chezMoi:
        'La date de visite figure sur la page de garde de votre DPE. Si elle est antérieure à juillet 2021, ne cherchez pas plus loin : il est à refaire.',
      aussi: ['combien-de-temps-un-diagnostic-est-valable', 'le-dpe-est-il-fiable', 'quels-travaux-pour-gagner-une-classe'],
      verifie: V
    },

    {
      id: 'comment-est-calcule-le-dpe',
      question: 'Comment est calculé le DPE ?',
      variantes: [
        'méthode de calcul DPE 3CL',
        'sur quoi se base le DPE',
        'que relève le diagnostiqueur pour le DPE'
      ],
      court:
        'Sur les caractéristiques du logement, relevées une par une, puis passées dans un moteur de calcul commun à tous les diagnostiqueurs. Ni vos factures, ni votre consommation réelle n’y entrent.',
      dessin: 'cinq-postes',
      points: [
        'Ce qui est relevé : surfaces et hauteurs, orientation, nature et épaisseur des murs, type de vitrage et de menuiserie, isolation de la toiture et du plancher bas.',
        'Puis les équipements : générateur de chauffage, production d’eau chaude, ventilation, climatisation, avec leur âge et leur rendement.',
        'Le calcul applique ensuite un scénario d’occupation conventionnel — même température, même usage pour tout le monde.',
        'Quand une caractéristique ne peut être ni vue ni prouvée, une valeur par défaut s’applique, volontairement défavorable.',
        'Le résultat est déposé dans la base publique de l’ADEME, qui lui attribue son numéro à treize caractères.'
      ],
      piege:
        'Le poste qui fait basculer une classe est presque toujours l’isolation, pas la chaudière. Une facture de travaux retrouvée au fond d’un tiroir vaut souvent plus qu’une négociation avec le diagnostiqueur.',
      chezMoi:
        'La page « descriptif du bien » de votre DPE liste tout ce qui a été retenu. Les mentions « valeur par défaut » y signalent les points où le doute vous a coûté des points.',
      aussi: ['le-dpe-est-il-fiable', 'le-dpe-correspond-il-a-mes-factures', 'quels-travaux-pour-gagner-une-classe'],
      sources: [{ titre: 'Arrêté du 31 mars 2021 — méthode de calcul 3CL-DPE 2021', url: LEGI }],
      verifie: V
    },

    {
      id: 'combien-coute-un-dpe',
      question: 'Combien coûte un DPE ?',
      variantes: ['prix DPE maison', 'tarif diagnostic performance énergétique', 'prix DPE appartement'],
      court:
        'Les prix sont libres : aucun tarif n’est fixé par la loi. Ce qui les fait varier : la surface, le nombre de niveaux, la complexité du chauffage, la région — et le fait de le commander seul ou avec les autres diagnostics.',
      dessin: 'prix',
      chezMoi:
        'Votre DPE porte un numéro à treize caractères, en page de garde : c’est sa trace dans la base publique de l’ADEME. Un DPE sans ce numéro n’a pas été déposé, et cela seul justifie de rappeler le cabinet.',
      points: [
        'Commandé seul, un DPE porte tout le coût du déplacement : c’est le cas le plus cher au mètre carré.',
        'Groupé avec les autres diagnostics d’une vente, il revient bien moins cher — une seule visite pour tout.',
        'L’audit énergétique, lui, est un travail d’une autre ampleur : chiffrage de scénarios de travaux, donc un budget distinct.',
        'Comparez ce que couvrent les devis avant de comparer les montants, et vérifiez la certification du professionnel.'
      ],
      piege:
        'Le prix ne change rien à la note. Payer plus cher n’achète pas une meilleure classe : ce qui l’améliore, ce sont les justificatifs que vous fournissez.',
      aussi: ['combien-ca-coute', 'c-est-quoi-l-audit-energetique', 'le-dpe-est-il-fiable'],
      verifie: V
    },

    {
      id: 'c-est-quoi-un-dpe-vierge',
      question: 'C’est quoi un DPE vierge, et vaut-il encore quelque chose ?',
      variantes: [
        'DPE vierge définition',
        'DPE sans étiquette',
        'DPE vierge encore valable'
      ],
      court:
        'C’est un DPE sans étiquette, établi avant la réforme de 2021 quand les factures nécessaires au calcul manquaient. Il n’en existe plus : tous les DPE portent aujourd’hui une classe, et un DPE vierge est forcément trop ancien pour servir.',
      dessin: 'etiquette',
      points: [
        'Avant 2021, certains logements — surtout anciens, ou vendus vides depuis longtemps — repartaient sans classe.',
        'La méthode actuelle calcule à partir du bâti : il n’y a plus de cas où le calcul est impossible.',
        'Si vous détenez un DPE vierge, il date d’avant juillet 2021 : il est à refaire, sans discussion.',
        'Une annonce qui affiche encore « DPE vierge » signale un dossier qui n’a pas été mis à jour.'
      ],
      aussi: ['mon-ancien-dpe-est-il-encore-valable', 'c-est-quoi-le-dpe', 'comment-est-calcule-le-dpe'],
      verifie: V
    },

    {
      id: 'dpe-petite-surface',
      question: 'Mon studio est mal noté : les petites surfaces sont-elles pénalisées ?',
      variantes: [
        'DPE studio 40m2',
        'DPE petite surface réforme',
        'DPE injuste petit logement'
      ],
      court:
        'Elles l’étaient. Le calcul de l’eau chaude sanitaire pesait trop lourd sur les logements de 40 m² ou moins, ce qui les déclassait mécaniquement. Les seuils ont été corrigés en 2024 pour ces surfaces.',
      dessin: 'deux-etiquettes',
      points: [
        'Dans un petit logement, l’eau chaude représente une part énorme du total ramené au mètre carré : c’est ce déséquilibre qui a été corrigé.',
        'La correction a fait sortir un grand nombre de studios des classes F et G, donc de l’interdiction de louer.',
        'Un DPE de petite surface établi avant cette correction peut être réédité sans nouvelle visite, par le diagnostiqueur qui l’a produit.',
        'Vérifiez la date de votre DPE avant de renoncer à louer : la correction peut vous concerner.'
      ],
      piege:
        'Une étiquette qui s’améliore par changement de règle ne change rien au logement lui-même. Il consomme autant qu’avant : c’est la mesure qui était faussée, pas le confort qui s’est amélioré.',
      aussi: ['puis-je-encore-louer-un-logement-classe-g', 'comment-lire-l-etiquette-dpe', 'mon-ancien-dpe-est-il-encore-valable'],
      sources: [{ titre: 'Arrêté du 25 mars 2024 modifiant les seuils pour les surfaces de 40 m² ou moins', url: LEGI }],
      verifie: V
    }
  ]
};
