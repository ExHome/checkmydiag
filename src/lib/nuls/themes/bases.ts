import type { Theme } from '../socle';

/** La date à laquelle le contenu réglementaire de ce fichier a été revu. */
const V = '2026-08-13';

const SP = 'https://www.service-public.fr';

export const BASES: Theme = {
  id: 'les-bases',
  titre: 'Les bases',
  h1: 'Les diagnostics immobiliers, en partant de zéro',
  resume:
    'Ce qu’est un diagnostic, qui le fait, qui le paie, ce qu’il regarde et ce qu’il ne regarde pas. Si vous n’avez jamais ouvert un de ces rapports, commencez ici.',
  dessin: 'dossier',

  questions: [
    {
      id: 'c-est-quoi-un-diagnostic-immobilier',
      question: 'C’est quoi, un diagnostic immobilier ?',
      variantes: [
        'diagnostic immobilier définition',
        'à quoi sert un diagnostic immobilier',
        'c’est quoi un DDT'
      ],
      court:
        'C’est un état des lieux technique du logement, fait par un professionnel certifié avant une vente ou une location. Il ne dit pas si le logement est beau ou bien situé : il dit ce qu’il consomme, et ce qui peut être dangereux.',
      dessin: 'dossier',
      points: [
        'Il y en a une dizaine — énergie, amiante, plomb, électricité, gaz, termites, risques, surface… Chacun répond à une seule question.',
        'Ils ne sont pas tous obligatoires partout : c’est l’âge du bâtiment, la commune et le type de bien qui décident lesquels s’appliquent.',
        'Ils sont remis ensemble, dans un seul document appelé dossier de diagnostic technique — le DDT.',
        'Leur but légal est l’information de l’acheteur ou du locataire : il doit savoir ce qu’il prend avant de signer.',
        'Un diagnostic constate. Il ne répare rien, n’oblige presque jamais à faire des travaux, et ne bloque pas une vente.'
      ],
      piege:
        'Beaucoup de gens croient qu’un diagnostic est une garantie sur l’état du logement. Ce n’en est pas une. Il porte sur ce qui était visible le jour de la visite, sur les points précis prévus par la loi — et sur rien d’autre.',
      chezMoi:
        'Sur votre PDF, cherchez la page de garde : le numéro de dossier, l’adresse du bien et la date de visite y figurent. C’est ce qui rattache le rapport à votre logement.',
      aussi: [
        'c-est-quoi-le-dossier-de-diagnostic-technique',
        'le-diagnostiqueur-regarde-quoi',
        'quels-diagnostics-pour-vendre'
      ],
      sources: [
        {
          titre: 'Code de la construction et de l’habitation, article L. 271-4',
          url: 'https://www.legifrance.gouv.fr'
        }
      ],
      verifie: V
    },

    {
      id: 'c-est-quoi-le-dossier-de-diagnostic-technique',
      question: 'Pourquoi mon PDF fait 60 pages et contient plusieurs rapports ?',
      variantes: [
        'dossier de diagnostic technique DDT',
        'plusieurs diagnostics dans un seul PDF',
        'comment lire un dossier de diagnostic'
      ],
      court:
        'Parce qu’un diagnostiqueur ne remet pas un fichier par diagnostic : il remet un dossier unique, le dossier de diagnostic technique, où les rapports se suivent. Votre PDF n’est pas un document, c’est une pile.',
      dessin: 'dossier',
      points: [
        'Chaque rapport a sa propre page de garde, sa propre conclusion et sa propre durée de validité.',
        'L’ordre change d’un cabinet à l’autre : il n’y a pas de plan imposé.',
        'La conclusion de chaque rapport tient en général en une phrase, souvent perdue au milieu de pages de méthode et d’annexes.',
        'Les annexes — planches photo, certificats, attestations d’assurance — occupent souvent la moitié du volume.'
      ],
      piege:
        'On cherche « la » conclusion du dossier. Elle n’existe pas : il y a autant de conclusions que de diagnostics, et une bonne nouvelle sur l’amiante ne dit rien de l’électricité.',
      chezMoi:
        'C’est exactement ce que fait Check My Diag : il découpe votre PDF rapport par rapport, et vous rend une ligne de verdict par diagnostic.',
      aussi: ['c-est-quoi-un-diagnostic-immobilier', 'combien-de-temps-un-diagnostic-est-valable'],
      verifie: V
    },

    {
      id: 'qui-paie-les-diagnostics',
      question: 'Qui paie les diagnostics : le vendeur ou l’acheteur ?',
      variantes: [
        'qui paie le DPE',
        'qui commande les diagnostics immobiliers',
        'le locataire paie-t-il le DPE'
      ],
      court:
        'Le vendeur, ou le bailleur. C’est lui qui doit fournir les diagnostics, donc lui qui les commande et les paie. L’acheteur ou le locataire les reçoit sans rien débourser.',
      dessin: 'qui-paie',
      points: [
        'À la vente, les diagnostics sont annexés à la promesse ou au compromis, donc payés bien avant la signature chez le notaire.',
        'À la location, ils sont annexés au bail et remis au locataire le jour de la signature.',
        'En location, le coût des diagnostics ne peut pas être refacturé au locataire dans les frais d’agence.',
        'Rien n’empêche un acheteur de faire réaliser, à ses frais, sa propre contre-expertise s’il doute d’un résultat.'
      ],
      piege:
        'Le vendeur paie, mais il ne choisit pas le résultat. Un diagnostiqueur qui adoucirait un rapport pour plaire à son client engagerait sa responsabilité et sa certification.',
      aussi: ['combien-ca-coute', 'comment-choisir-son-diagnostiqueur', 'contester-un-diagnostic'],
      verifie: V
    },

    {
      id: 'combien-ca-coute',
      question: 'Combien coûtent les diagnostics immobiliers ?',
      variantes: [
        'prix diagnostic immobilier',
        'tarif DPE',
        'prix pack diagnostic vente maison'
      ],
      court:
        'Les prix sont libres : aucun tarif n’est fixé par la loi. Le montant dépend du nombre de diagnostics à faire, de la surface, de l’ancienneté du bien et de la région — d’où des écarts importants d’un devis à l’autre.',
      points: [
        'On achète presque toujours un ensemble, pas un diagnostic isolé : le déplacement et la visite sont mutualisés.',
        'Ce qui fait monter la facture : la surface, le nombre de pièces, un bien ancien qui déclenche plomb et amiante, un audit énergétique en plus du DPE.',
        'Demandez plusieurs devis, et comparez ce qu’ils contiennent — un devis moins cher est souvent un devis qui couvre moins de diagnostics.',
        'Vérifiez que le devis mentionne la certification du diagnostiqueur et son assurance : c’est le minimum vérifiable avant de signer.'
      ],
      piege:
        'Le moins cher n’est pas neutre. Un rapport bâclé, c’est un vice caché qui vous revient dessus des mois après la vente — le diagnostiqueur est assuré pour ça, mais la procédure, c’est vous qui la vivez.',
      aussi: ['comment-choisir-son-diagnostiqueur', 'qui-paie-les-diagnostics'],
      verifie: V
    },

    {
      id: 'qui-peut-faire-un-diagnostic',
      question: 'N’importe qui peut-il faire un diagnostic ?',
      variantes: [
        'qui peut réaliser un diagnostic immobilier',
        'certification diagnostiqueur',
        'faire son DPE soi-même'
      ],
      court:
        'Non. Il faut être certifié par un organisme accrédité, diagnostic par diagnostic, être assuré pour cette activité, et n’avoir aucun lien avec le propriétaire, l’agence ou une entreprise de travaux.',
      dessin: 'certifie',
      points: [
        'La certification n’est pas un diplôme acquis une fois : elle se passe par domaine, se renouvelle, et s’accompagne de contrôles sur ouvrage.',
        'Un diagnostiqueur certifié pour l’amiante ne l’est pas automatiquement pour le DPE.',
        'L’indépendance est une obligation légale : le diagnostiqueur ne peut pas être lié à celui qui vendra ensuite les travaux.',
        'La liste des diagnostiqueurs certifiés est publique et consultable en ligne sur l’annuaire du ministère.',
        'Non, vous ne pouvez pas faire votre propre DPE, même pour vous informer : seul un rapport établi par un certifié a une valeur.'
      ],
      chezMoi:
        'Le numéro de certification et l’organisme certificateur figurent sur la page de garde de chaque rapport. Vous pouvez les vérifier vous-même sur l’annuaire officiel.',
      aussi: ['comment-choisir-son-diagnostiqueur', 'contester-un-diagnostic'],
      sources: [
        {
          titre: 'Annuaire des diagnostiqueurs certifiés (ministère de la Transition écologique)',
          url: 'https://diagnostiqueurs.din.developpement-durable.gouv.fr'
        }
      ],
      verifie: V
    },

    {
      id: 'comment-choisir-son-diagnostiqueur',
      question: 'Comment choisir son diagnostiqueur ?',
      variantes: [
        'bien choisir son diagnostiqueur immobilier',
        'diagnostiqueur pas cher ou sérieux'
      ],
      court:
        'Vérifiez trois choses avant tout : la certification pour chacun des diagnostics dont vous avez besoin, l’assurance professionnelle en cours de validité, et l’absence de lien avec votre agence ou une entreprise de travaux.',
      dessin: 'certifie',
      points: [
        'Demandez le détail du devis : quels diagnostics, combien de temps sur place, sous quel délai le rapport arrive.',
        'Un professionnel qui annonce une visite expédiée en vingt minutes pour une maison entière ne pourra pas faire le travail.',
        'Demandez s’il monte dans les combles, s’il ouvre le tableau électrique, s’il déplace ce qui peut l’être : c’est là que se joue la qualité.',
        'Vérifiez la certification sur l’annuaire officiel plutôt que sur le site du cabinet.'
      ],
      piege:
        'Une agence peut recommander un diagnostiqueur — c’est courant et légal. Mais le choix reste le vôtre, et le rapport vous appartient.',
      aussi: ['qui-peut-faire-un-diagnostic', 'combien-ca-coute'],
      verifie: V
    },

    {
      id: 'le-diagnostiqueur-regarde-quoi',
      question: 'Le diagnostiqueur regarde quoi, exactement ?',
      variantes: [
        'le diagnostiqueur ouvre-t-il les murs',
        'périmètre du diagnostic immobilier',
        'le diagnostiqueur déplace-t-il les meubles'
      ],
      court:
        'Ce qui est visible et accessible le jour de la visite, sans rien démonter ni abîmer. Il ne perce pas un mur, ne soulève pas un parquet, ne vide pas un placard : ce qui est fermé n’est pas contrôlé, et c’est écrit dans le rapport.',
      dessin: 'visible-ferme',
      points: [
        'C’est la limite commune à tous ces diagnostics, et la source de la plupart des mauvaises surprises après achat.',
        'Une pièce encombrée, un vide sanitaire inaccessible, des combles sans trappe : le rapport le note comme non visité, il ne conclut pas.',
        'Le diagnostiqueur prend des photos, des mesures et des relevés ; il ne fait pas d’essai destructif.',
        'Certains repérages font exception : avant démolition, le repérage amiante va chercher dans les parois.',
        'D’où l’intérêt de libérer les accès avant la visite : plus il voit, moins le rapport comporte de réserves.'
      ],
      piege:
        'Les mentions « non visité », « non accessible » ou « sous réserve » se lisent comme un feu orange, jamais comme un feu vert. Elles disent que personne n’a regardé.',
      chezMoi:
        'Cherchez dans votre rapport les parties « locaux non visités » ou « réserves » : c’est la liste de ce qui n’a pas été contrôlé chez vous.',
      aussi: ['c-est-quoi-un-diagnostic-immobilier', 'un-diagnostic-garantit-il-le-logement'],
      verifie: V
    },

    {
      id: 'combien-de-temps-un-diagnostic-est-valable',
      question: 'Combien de temps un diagnostic reste-t-il valable ?',
      variantes: [
        'durée de validité diagnostic immobilier',
        'validité DPE 10 ans',
        'mon diagnostic est-il périmé',
        'tableau validité diagnostics'
      ],
      court:
        'Chaque diagnostic a sa propre durée, de 6 mois à illimitée. Elle court à partir du jour de la visite, pas du jour où vous recevez le rapport.',
      dessin: 'validite-depart',
      tableau: {
        colonnes: ['Diagnostic', 'Pour vendre', 'Pour louer'],
        lignes: [
          ['DPE', '10 ans', '10 ans'],
          ['Audit énergétique', '5 ans', '—'],
          ['Amiante', 'illimitée si absence', 'illimitée si absence'],
          ['Plomb (CREP)', '1 an si présence, sinon illimitée', '6 ans si présence, sinon illimitée'],
          ['Électricité', '3 ans', '6 ans'],
          ['Gaz', '3 ans', '6 ans'],
          ['Termites', '6 mois', '—'],
          ['État des risques (ERP)', '6 mois', '6 mois'],
          ['Assainissement non collectif', '3 ans', '—'],
          ['Loi Carrez', 'illimitée sauf travaux', '—']
        ],
        reserve:
          'Les constats amiante établis avant 2013 doivent être refaits, même s’ils concluaient à une absence. Un diagnostic reste par ailleurs à refaire dès que des travaux modifient ce qu’il décrit.'
      },
      points: [
        'Les deux plus courts — termites et état des risques, 6 mois — sont ceux qui périment pendant une vente qui traîne.',
        'La date qui compte est celle de la visite, inscrite sur la page de garde de chaque rapport.',
        'Une durée illimitée ne veut pas dire éternelle : si vous faites des travaux, le document ne décrit plus votre logement.'
      ],
      piege:
        'On regarde la date d’édition du PDF, en bas de page. Ce n’est pas elle qui compte : c’est la date de visite, souvent antérieure de plusieurs jours.',
      chezMoi:
        'Check My Diag calcule cette date pour chaque rapport de votre dossier et vous signale ceux qui sont périmés ou sur le point de l’être.',
      aussi: ['mon-diagnostic-est-perime-que-faire', 'c-est-quoi-le-dossier-de-diagnostic-technique'],
      sources: [
        {
          titre: 'Code de la construction et de l’habitation, articles R. 271-5 et suivants',
          url: 'https://www.legifrance.gouv.fr'
        },
        { titre: 'Service-public.fr — diagnostics immobiliers', url: SP }
      ],
      verifie: V
    },

    {
      id: 'mon-diagnostic-est-perime-que-faire',
      question: 'Mon diagnostic est périmé, qu’est-ce que je risque ?',
      variantes: [
        'diagnostic périmé vente',
        'DPE périmé que faire',
        'refaire un diagnostic périmé'
      ],
      court:
        'Un diagnostic périmé ne vaut plus rien : c’est comme s’il n’existait pas. À la vente, le notaire le refusera et la signature attendra ; en cas de litige, vous êtes dans la position de celui qui n’a rien fourni.',
      points: [
        'Le plus souvent, seuls un ou deux rapports sont périmés — l’état des risques et les termites, valables 6 mois. On refait ceux-là, pas tout le dossier.',
        'L’état des risques peut être régénéré rapidement : il ne demande pas toujours une nouvelle visite, puisqu’il reprend des données publiques à l’adresse.',
        'Un DPE périmé bloque aussi la publication d’une annonce, puisque la classe doit y figurer.',
        'Refaire un diagnostic périmé coûte moins cher que le litige qui suit une vente mal documentée.'
      ],
      chezMoi:
        'Déposez votre dossier : vous verrez d’un coup d’œil les rapports encore valables et ceux qui sont à refaire, avec leur date de visite.',
      aussi: ['combien-de-temps-un-diagnostic-est-valable', 'que-risque-t-on-sans-diagnostic'],
      verifie: V
    },

    {
      id: 'que-risque-t-on-sans-diagnostic',
      question: 'Que risque-t-on si on ne fait pas les diagnostics ?',
      variantes: [
        'vendre sans diagnostic',
        'louer sans DPE sanction',
        'absence de diagnostic vice caché'
      ],
      court:
        'Le vendeur perd la protection que lui donnent ces documents. Sans diagnostic, il ne peut plus s’exonérer de la garantie des vices cachés sur le point concerné : l’acheteur peut demander une baisse du prix, voire l’annulation de la vente.',
      points: [
        'À la vente, le notaire refuse de signer tant que le dossier est incomplet — c’est le premier verrou, et le plus fréquent.',
        'Un diagnostic faux ou trompeur expose son auteur, mais aussi le vendeur qui l’a fourni en connaissance de cause.',
        'À la location, l’absence de certains documents peut être sanctionnée et permet au locataire de demander réparation.',
        'Le DPE fait exception par sa visibilité : sans lui, l’annonce elle-même est irrégulière, puisque la classe doit y être affichée.'
      ],
      piege:
        'Se dire « l’acheteur a vu, il était au courant » ne suffit pas. Ce qui compte, c’est ce qui est écrit et annexé à l’acte — pas ce qui s’est dit pendant la visite.',
      aussi: ['mon-diagnostic-est-perime-que-faire', 'contester-un-diagnostic', 'quels-diagnostics-pour-vendre'],
      sources: [
        {
          titre: 'Code de la construction et de l’habitation, article L. 271-4 (II)',
          url: 'https://www.legifrance.gouv.fr'
        }
      ],
      verifie: V
    },

    {
      id: 'un-diagnostic-garantit-il-le-logement',
      question: 'Un diagnostic garantit-il que le logement est en bon état ?',
      variantes: [
        'le diagnostic est-il une garantie',
        'diagnostic et vice caché',
        'tout va bien dans les diagnostics mais problème après achat'
      ],
      court:
        'Non, et c’est le malentendu le plus coûteux. Chaque diagnostic répond à une question précise, sur ce qui était visible ce jour-là. Il ne dit rien de la toiture, de l’humidité, de la charpente ou de la plomberie.',
      dessin: 'visible-ferme',
      points: [
        'Aucun diagnostic obligatoire ne porte sur la structure du bâtiment, l’étanchéité, ou l’état des réseaux d’eau.',
        'Le rapport amiante ne cherche l’amiante que dans une liste de matériaux définie par la loi, pas partout.',
        'Le DPE décrit une performance calculée, pas le confort réel ni la qualité des équipements.',
        'Pour aller plus loin, il existe des expertises volontaires — état parasitaire, humidité, structure — qui ne sont pas obligatoires mais qui, elles, cherchent.'
      ],
      piege:
        'Un dossier entièrement vert rassure à tort. Il signifie « rien à signaler sur les points contrôlés », ce qui est très différent de « rien à signaler ».',
      aussi: ['le-diagnostiqueur-regarde-quoi', 'que-risque-t-on-sans-diagnostic'],
      verifie: V
    },

    {
      id: 'comment-se-passe-un-diagnostic',
      question: 'Comment se passe la visite du diagnostiqueur ?',
      variantes: [
        'déroulement diagnostic immobilier',
        'combien de temps dure un diagnostic immobilier',
        'que fait le diagnostiqueur pendant la visite'
      ],
      court:
        'Il parcourt toutes les pièces, mesure, photographie, ouvre le tableau électrique, monte aux combles et descend à la cave si c’est accessible. Comptez une à trois heures selon la taille du logement et le nombre de diagnostics.',
      dessin: 'visible-ferme',
      points: [
        'Il a besoin d’accéder à tout : compteurs, chaufferie, combles, vide sanitaire, placards techniques, salle d’eau.',
        'Chaque diagnostic a son geste — mesure au fluorescence X pour le plomb, sondage du bois pour les termites, essais au tableau pour l’électricité.',
        'Il relève aussi les caractéristiques du bâti pour le DPE : épaisseurs, vitrages, isolation, équipements.',
        'Il ne démonte rien et ne perce rien : tout ce qui est fermé restera écrit comme non contrôlé.',
        'Préparez les justificatifs avant sa venue : factures d’isolation, de menuiseries, de chaudière, attestation d’électricité.'
      ],
      piege:
        'Une visite expédiée en vingt minutes pour une maison entière ne permet pas de faire le travail. Le temps passé sur place est le meilleur indicateur de la qualité du rapport que vous recevrez.',
      aussi: ['faut-il-etre-present-pendant-la-visite', 'le-diagnostiqueur-regarde-quoi', 'comment-choisir-son-diagnostiqueur'],
      verifie: V
    },

    {
      id: 'faut-il-etre-present-pendant-la-visite',
      question: 'Dois-je être présent pendant la visite du diagnostiqueur ?',
      variantes: [
        'présence obligatoire diagnostic immobilier',
        'diagnostic en l’absence du propriétaire',
        'le locataire doit-il être présent pour le diagnostic'
      ],
      court:
        'Non, à condition que quelqu’un ouvre — l’agence, un proche, le locataire. Mais votre présence sert : c’est vous qui savez où sont les combles, ce qui a été isolé, et quels justificatifs existent.',
      points: [
        'Le logement doit être accessible en entier : un accès fermé le jour de la visite devient une réserve dans le rapport.',
        'Si le logement est loué, le locataire doit être prévenu à l’avance et laisser entrer.',
        'Rangez, dégagez les trappes, les placards techniques et le tableau électrique avant la venue.',
        'Sortez vos factures de travaux : sans preuve, le calcul du DPE retient des valeurs par défaut défavorables.'
      ],
      chezMoi:
        'Si votre rapport comporte beaucoup de mentions « non visité », c’est souvent que l’accès manquait ce jour-là — cela se rattrape par une seconde visite.',
      aussi: ['comment-se-passe-un-diagnostic', 'que-veut-dire-non-visite', 'le-dpe-est-il-fiable'],
      verifie: V
    },

    {
      id: 'en-combien-de-temps-recoit-on-les-rapports',
      question: 'En combien de temps reçoit-on les rapports ?',
      variantes: [
        'délai diagnostic immobilier',
        'quand reçoit-on le DPE',
        'diagnostic immobilier urgent délai'
      ],
      court:
        'Le plus souvent sous un à trois jours ouvrés. Aucun délai n’est fixé par la loi : c’est une affaire d’organisation du cabinet, et cela se négocie au moment du devis.',
      dessin: 'validite-depart',
      points: [
        'Le DPE demande un temps de saisie : chaque paroi et chaque équipement relevé doit être entré dans le moteur de calcul.',
        'Le contrôle d’assainissement fait exception : il dépend du SPANC de la commune, avec des délais qui se comptent parfois en semaines.',
        'Anticipez : la classe énergétique doit figurer dans l’annonce, donc le DPE doit être prêt avant la mise en vente.',
        'La validité, elle, ne court pas de la réception mais du jour de la visite.'
      ],
      aussi: ['combien-de-temps-un-diagnostic-est-valable', 'quand-faire-les-diagnostics-pour-vendre', 'c-est-quoi-le-diagnostic-assainissement'],
      verifie: V
    },

    {
      id: 'j-ai-perdu-mes-diagnostics',
      question: 'J’ai perdu mes diagnostics : comment les récupérer ?',
      variantes: [
        'retrouver ses diagnostics immobiliers',
        'demander une copie du DPE',
        'diagnostic perdu vente'
      ],
      court:
        'Demandez-les au diagnostiqueur qui les a faits : il conserve ses rapports plusieurs années et vous en renverra une copie. À défaut, votre notaire détient le dossier annexé à l’acte de vente.',
      points: [
        'Le notaire est souvent la voie la plus rapide : le dossier de diagnostic technique est annexé à l’acte, qu’il archive.',
        'Votre agence immobilière, si elle a suivi la vente, en garde généralement une copie.',
        'Le DPE possède un numéro à treize caractères qui permet de le retrouver dans la base publique de l’ADEME.',
        'Une copie n’est pas une nouvelle validité : un rapport périmé le reste, même retrouvé.'
      ],
      chezMoi:
        'Une fois le PDF récupéré, déposez-le : vous saurez en quelques secondes lesquels de ces rapports sont encore valables.',
      aussi: ['combien-de-temps-garder-ses-rapports', 'combien-de-temps-un-diagnostic-est-valable', 'mon-pdf-est-un-scan'],
      verifie: V
    },

    {
      id: 'diagnostics-pour-une-succession-ou-une-donation',
      question: 'Faut-il des diagnostics pour une succession ou une donation ?',
      variantes: [
        'diagnostic immobilier succession',
        'donation maison diagnostic obligatoire',
        'partage héritage DPE'
      ],
      court:
        'La loi vise la vente et la location : une succession n’y est pas soumise. Pour une donation ou un partage, l’obligation dépend du montage — votre notaire tranchera, et il les demandera souvent quand même.',
      points: [
        'Un héritier qui reçoit un bien ne reçoit pas de dossier de diagnostic technique : personne n’est tenu de le lui fournir.',
        'Mais s’il revend ensuite, c’est lui qui devra le faire établir, à ses frais.',
        'Certaines obligations tiennent à la détention du bien, pas à sa vente : c’est le cas du repérage amiante dans un immeuble d’avant 1997.',
        'Faire établir les diagnostics au moment de la succession a un mérite pratique : on connaît l’état du bien avant de décider de le garder ou de le vendre.'
      ],
      piege:
        'Un bien hérité est souvent ancien, longtemps habité par une personne âgée, et jamais rénové : c’est le profil qui cumule plomb, amiante et installation électrique hors d’âge.',
      aussi: ['quels-diagnostics-pour-vendre', 'vendre-un-bien-ancien', 'que-risque-t-on-sans-diagnostic'],
      verifie: V
    }
  ]
};
