import type { Theme } from '../socle';

const V = '2026-08-13';
const LEGI = 'https://www.legifrance.gouv.fr';

export const MON_RAPPORT: Theme = {
  id: 'mon-rapport',
  titre: 'Lire mon rapport',
  h1: 'Lire son rapport, et savoir quoi faire ensuite',
  resume:
    'Où se trouve la conclusion, que veulent dire les mentions qui reviennent, et que faire quand quelque chose ne va pas — une erreur, un désaccord, un problème découvert après l’achat.',
  dessin: 'contester',

  questions: [
    {
      id: 'comment-lire-mon-rapport',
      question: 'Par où commencer quand on ouvre le PDF ?',
      variantes: [
        'comment lire un diagnostic immobilier',
        'où est la conclusion du rapport',
        'comprendre un rapport de diagnostic'
      ],
      court:
        'Par la fin de chaque rapport, pas par le début. La conclusion tient en une ou deux phrases, souvent sous un intitulé du type « conclusion » ou « synthèse » — le reste est de la méthode, des annexes et des mentions obligatoires.',
      dessin: 'dossier',
      points: [
        'Repérez d’abord les pages de garde : elles marquent le début de chaque rapport dans le PDF unique.',
        'Sur chaque page de garde : l’adresse, la date de visite, le numéro de dossier, le diagnostiqueur.',
        'Puis la conclusion du rapport, et seulement ensuite le détail — tableaux d’anomalies, planches photo, croquis.',
        'Méfiez-vous des cases à cocher : deux phrases opposées sont souvent imprimées côte à côte, et c’est la case qui décide.',
        'Les annexes — certificats, attestations d’assurance, textes réglementaires — n’apportent rien à votre lecture.'
      ],
      piege:
        'Beaucoup de rapports citent des chiffres qui ne sont pas ceux de votre logement : seuils réglementaires, valeurs de référence, gains après travaux. Vérifiez toujours que la phrase autour du chiffre parle bien de votre bien, aujourd’hui.',
      chezMoi:
        'C’est exactement le travail que fait Check My Diag : trouver la conclusion de chaque rapport, la traduire, et vous montrer la ligne d’origine dans votre PDF.',
      aussi: [
        'que-veut-dire-non-visite',
        'mon-rapport-contient-une-erreur',
        'c-est-quoi-le-dossier-de-diagnostic-technique'
      ],
      verifie: V
    },

    {
      id: 'que-veut-dire-non-visite',
      question: 'Mon rapport dit « non visité » ou « sous réserve » : c’est grave ?',
      variantes: [
        'local non visité diagnostic',
        'réserve dans un diagnostic immobilier',
        'partie non accessible diagnostic'
      ],
      court:
        'Cela veut dire que personne n’a regardé. Ce n’est ni bon ni mauvais signe : c’est un trou dans le contrôle, et il vous appartient de décider s’il est acceptable.',
      dessin: 'visible-ferme',
      points: [
        'Les cas les plus fréquents : combles sans trappe, vide sanitaire fermé, pièce encombrée, local occupé au moment de la visite.',
        'Sur les diagnostics de sécurité — amiante, plomb, termites — une réserve porte souvent sur l’endroit le plus à risque.',
        'À la vente, une réserve importante mérite d’être levée avant la signature : on rouvre l’accès et on fait repasser le diagnostiqueur.',
        'Une réserve ne protège pas le vendeur de tout : elle constate qu’une zone n’a pas été contrôlée, elle ne dit rien de son état.',
        'Avant une visite, libérer les accès est la meilleure façon d’obtenir un rapport sans trous.'
      ],
      aussi: ['le-diagnostiqueur-regarde-quoi', 'comment-lire-mon-rapport', 'un-diagnostic-garantit-il-le-logement'],
      verifie: V
    },

    {
      id: 'mon-rapport-contient-une-erreur',
      question: 'Mon rapport contient une erreur d’adresse ou de surface : que faire ?',
      variantes: [
        'erreur adresse diagnostic immobilier',
        'faire corriger un diagnostic',
        'mauvaise année de construction DPE'
      ],
      court:
        'Signalez-la tout de suite au diagnostiqueur, par écrit. Une erreur d’identification — adresse, étage, référence cadastrale, année de construction — rend le document contestable, et l’année de construction commande à elle seule plusieurs diagnostics.',
      points: [
        'Une correction se fait en général sans difficulté : c’est dans l’intérêt du diagnostiqueur, qui répond de son rapport.',
        'Une erreur d’année de construction peut faire sauter à tort un repérage amiante ou un constat plomb : c’est la plus lourde de conséquences.',
        'Une surface erronée fausse le DPE dans son entier, puisque tout y est ramené au mètre carré.',
        'Gardez trace de votre demande : un courriel daté vaut mieux qu’un appel téléphonique.',
        'Ne corrigez jamais vous-même un PDF : un document modifié perd toute valeur, et vous exposerait bien plus que l’erreur.'
      ],
      chezMoi:
        'Check My Diag compare les informations d’un rapport à l’autre dans votre dossier et signale les écarts — une surface qui change d’un document au suivant, par exemple.',
      aussi: ['contester-un-diagnostic', 'comment-lire-mon-rapport', 'le-dpe-est-il-fiable'],
      verifie: V
    },

    {
      id: 'contester-un-diagnostic',
      question: 'Comment contester un diagnostic ?',
      variantes: [
        'contester un DPE',
        'recours contre un diagnostiqueur',
        'diagnostic faux que faire'
      ],
      court:
        'En trois temps : un courrier recommandé au diagnostiqueur exposant précisément le point contesté, puis une contre-expertise par un autre professionnel certifié, puis le tribunal si le désaccord tient. Le diagnostiqueur est assuré pour cela.',
      dessin: 'contester',
      points: [
        'Soyez précis : « le rapport indique des murs non isolés, or voici la facture d’isolation de 2019 » vaut mieux que « le DPE est faux ».',
        'Rassemblez les preuves : factures, devis, attestations de travaux, photos datées.',
        'La contre-expertise est à vos frais, et se rembourse si vous obtenez gain de cause.',
        'Le DPE étant opposable depuis 2021, une classe manifestement erronée engage la responsabilité de son auteur.',
        'L’organisme qui a certifié le diagnostiqueur peut aussi être saisi d’une réclamation : son nom figure sur la page de garde.',
        'Ne tardez pas : les délais pour agir se comptent à partir du moment où vous découvrez le problème.'
      ],
      piege:
        'Un désaccord n’est pas une erreur. Beaucoup de « mauvaises notes » viennent de justificatifs manquants au moment de la visite, pas d’une faute du diagnostiqueur — et cela, un juge le regardera de près.',
      aussi: ['j-ai-decouvert-un-probleme-apres-l-achat', 'mon-rapport-contient-une-erreur', 'le-dpe-est-il-fiable'],
      sources: [{ titre: 'Code civil, articles 1231-1 et suivants (responsabilité contractuelle)', url: LEGI }],
      verifie: V
    },

    {
      id: 'j-ai-decouvert-un-probleme-apres-l-achat',
      question: 'J’ai découvert un problème après l’achat : quels recours ?',
      variantes: [
        'amiante découverte après achat',
        'recours après achat maison diagnostic',
        'vice caché après vente que faire'
      ],
      court:
        'Cela dépend de ce que disait le dossier. Si un diagnostic obligatoire manquait ou s’est révélé faux sur le point en cause, le vendeur ne peut pas s’abriter derrière la clause de vices cachés, et le diagnostiqueur peut être mis en cause.',
      dessin: 'contester',
      points: [
        'Première étape : relire le dossier annexé à l’acte, et identifier précisément ce qui était écrit sur ce point.',
        'Trois cas : le diagnostic manquait, il existait et était faux, ou il ne couvrait pas ce sujet — les recours diffèrent complètement.',
        'S’il ne couvrait pas le sujet — toiture, humidité, plomberie —, la voie est celle du vice caché contre le vendeur.',
        'Faites constater le désordre par un professionnel, avec des photos datées : c’est la base de tout.',
        'Votre notaire est le premier interlocuteur : il a l’acte, les annexes, et il connaît les délais applicables.',
        'Votre assurance protection juridique, si vous en avez une, prend souvent en charge la première expertise.'
      ],
      piege:
        'Le temps joue contre vous. Les délais pour agir sont courts et se comptent à partir de la découverte : un dossier monté six mois trop tard est un dossier perdu, même quand on a raison.',
      aussi: ['contester-un-diagnostic', 'vendre-en-l-etat-vice-cache', 'un-diagnostic-garantit-il-le-logement'],
      sources: [{ titre: 'Code civil, articles 1641 et suivants (garantie des vices cachés)', url: LEGI }],
      verifie: V
    },

    {
      id: 'mon-pdf-est-un-scan',
      question: 'Mon PDF est un scan illisible : que faire ?',
      variantes: [
        'diagnostic scanné illisible',
        'demander le fichier original au diagnostiqueur',
        'PDF diagnostic mauvaise qualité'
      ],
      court:
        'Demandez le fichier d’origine à votre diagnostiqueur ou à votre agence. Un rapport scanné est une photographie de pages : le texte n’y est plus, ce qui le rend impossible à rechercher, à copier — et à analyser automatiquement.',
      points: [
        'Le diagnostiqueur conserve ses rapports plusieurs années : la demande est simple et gratuite.',
        'Un fichier d’origine se reconnaît vite : on peut y sélectionner du texte à la souris.',
        'Un scan reste parfaitement valable juridiquement — c’est sa lisibilité, pas sa valeur, qui pose problème.',
        'Sur un scan, les cases cochées passent souvent inaperçues : c’est là que se glissent les contresens.'
      ],
      chezMoi:
        'Check My Diag vous le dit franchement : si votre PDF ne contient presque pas de texte, il vous prévient plutôt que de deviner.',
      aussi: ['comment-lire-mon-rapport', 'mon-rapport-contient-une-erreur'],
      verifie: V
    },

    {
      id: 'combien-de-temps-garder-ses-rapports',
      question: 'Combien de temps faut-il garder ses diagnostics ?',
      variantes: [
        'conserver les diagnostics immobiliers',
        'archiver dossier de diagnostic technique',
        'garder le DPE après achat'
      ],
      court:
        'Gardez-les tant que vous détenez le bien, et plusieurs années après l’avoir vendu. Ce sont les pièces qui prouvent ce que vous avez fourni, et ce que vous saviez, le jour de la signature.',
      points: [
        'Après une vente, ils protègent le vendeur : c’est la preuve de l’information donnée à l’acheteur.',
        'Après un achat, ils servent de point de départ : état initial, matériaux repérés, anomalies connues.',
        'Le repérage amiante doit être remis à toute entreprise qui intervient sur le bâtiment : gardez-le accessible.',
        'Une copie numérique dans un dossier nommé par année suffit — l’essentiel est de la retrouver.'
      ],
      aussi: ['j-ai-decouvert-un-probleme-apres-l-achat', 'amiante-et-travaux', 'vendre-en-l-etat-vice-cache'],
      verifie: V
    }
  ]
};
