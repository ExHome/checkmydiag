import type { Theme } from '../socle';

const V = '2026-08-13';
const LEGI = 'https://www.legifrance.gouv.fr';
const GEO = 'https://www.georisques.gouv.fr';

export const RISQUES: Theme = {
  id: 'risques-et-pollutions',
  titre: 'Risques et pollutions',
  h1: 'L’état des risques : ce que l’État sait de votre adresse',
  resume:
    'Inondation, argile, radon, séisme, pollution des sols : ce document ne mesure rien chez vous, il recopie ce qui est cartographié à votre adresse. C’est souvent le rapport le plus survolé du dossier, et l’un des plus utiles.',
  dessin: 'erp-couches',

  questions: [
    {
      id: 'c-est-quoi-l-etat-des-risques',
      question: 'C’est quoi l’état des risques (ERP) ?',
      variantes: [
        'état des risques et pollutions',
        'ERP diagnostic immobilier',
        'état des risques validité 6 mois'
      ],
      court:
        'Un relevé des risques connus à votre adresse : inondation, mouvement de terrain, séisme, radon, pollution des sols, installations dangereuses à proximité. Il ne repose sur aucune visite — c’est une lecture des cartes officielles.',
      dessin: 'erp-couches',
      points: [
        'Il est obligatoire à la vente et à la location dans les communes concernées, et il ne vaut que six mois.',
        'Depuis 2023, l’information sur les risques doit apparaître dès l’annonce immobilière, avant même la visite.',
        'Il indique aussi si le bien a fait l’objet d’une indemnisation après une catastrophe naturelle — une information que beaucoup d’acheteurs cherchent en vain ailleurs.',
        'Il ne dit rien de l’état du bâtiment : un logement en zone inondable peut n’avoir jamais été touché.',
        'Ses données viennent de Géorisques, la base publique de l’État, que vous pouvez consulter vous-même gratuitement.'
      ],
      piege:
        'C’est un document qui périme pendant les ventes qui traînent. Six mois, c’est la durée d’un compromis un peu long : pensez à le régénérer avant la signature.',
      chezMoi:
        'Check My Diag remonte les risques cochés dans votre rapport et vous dit ce que chacun implique concrètement.',
      aussi: ['verifier-les-risques-de-mon-adresse', 'c-est-quoi-le-retrait-gonflement-des-argiles', 'c-est-quoi-le-radon'],
      sources: [
        { titre: 'Code de l’environnement, article L. 125-5', url: LEGI },
        { titre: 'Géorisques — le site public des risques', url: GEO }
      ],
      verifie: V
    },

    {
      id: 'verifier-les-risques-de-mon-adresse',
      question: 'Comment vérifier moi-même les risques de mon adresse ?',
      variantes: [
        'Géorisques adresse',
        'ERRIAL état des risques en ligne',
        'consulter les risques d’un logement gratuitement'
      ],
      court:
        'Sur Géorisques, le site public de l’État : vous saisissez l’adresse, vous obtenez les risques recensés. C’est la source dans laquelle puise votre diagnostiqueur, et elle est gratuite.',
      dessin: 'erp-couches',
      points: [
        'Faites-le avant d’acheter, avant même la première visite : c’est trois minutes, et ça évite des mois de regrets.',
        'Regardez surtout l’inondation, le retrait-gonflement des argiles et le radon : ce sont les trois qui touchent le plus de logements.',
        'La mairie détient les plans de prévention des risques applicables, avec leurs prescriptions de construction.',
        'Ce que vous consultez vous-même n’a pas valeur d’ERP : le document annexé à l’acte doit être établi en bonne et due forme.'
      ],
      aussi: ['c-est-quoi-l-etat-des-risques', 'mon-bien-est-en-zone-inondable'],
      sources: [{ titre: 'Géorisques — connaître les risques près de chez soi', url: GEO }],
      verifie: V
    },

    {
      id: 'c-est-quoi-le-retrait-gonflement-des-argiles',
      question: 'Retrait-gonflement des argiles : qu’est-ce que ça veut dire ?',
      variantes: [
        'zone argileuse fissures maison',
        'RGA retrait gonflement argile',
        'étude de sol obligatoire terrain argileux'
      ],
      court:
        'Certains sols argileux gonflent quand il pleut et se rétractent quand il fait sec. La maison posée dessus bouge avec eux — et se fissure. C’est aujourd’hui la première cause de sinistre indemnisé sur les maisons individuelles en France.',
      points: [
        'Les fissures typiques partent en escalier depuis les angles des ouvertures, et s’ouvrent l’été.',
        'Les zones sont classées en exposition faible, moyenne ou forte : votre état des risques indique la vôtre.',
        'En zone moyenne ou forte, une étude géotechnique est obligatoire pour vendre un terrain constructible non bâti.',
        'Ce qui aggrave : un arbre trop proche qui assèche le sol, une fuite de canalisation, une terrasse qui bloque les échanges d’eau.',
        'Les fondations profondes et le chaînage sont la réponse constructive — coûteuse en reprise, décisive en neuf.'
      ],
      piege:
        'Une maison fissurée en zone argileuse n’est pas forcément condamnée. Mais l’indemnisation dépend d’un arrêté de catastrophe naturelle publié pour la commune et la période : sans arrêté, l’assurance ne joue pas.',
      chezMoi:
        'Cherchez la mention « retrait-gonflement des argiles » dans votre état des risques, avec son niveau d’exposition.',
      aussi: ['c-est-quoi-l-etat-des-risques', 'verifier-les-risques-de-mon-adresse', 'mon-bien-est-en-zone-inondable'],
      sources: [{ titre: 'Géorisques — retrait-gonflement des argiles', url: GEO }],
      verifie: V
    },

    {
      id: 'c-est-quoi-le-radon',
      question: 'Mon logement est en zone radon : c’est grave ?',
      variantes: [
        'radon zone 3 danger',
        'mesure radon maison',
        'radon potentiel significatif'
      ],
      court:
        'Le radon est un gaz radioactif naturel qui sort du sous-sol granitique et s’accumule dans les pièces mal ventilées. Être en zone 3 ne veut pas dire que votre logement en contient : ça veut dire qu’il faut mesurer.',
      points: [
        'Les communes sont classées en potentiel 1, 2 ou 3. Le niveau 3 signale un sous-sol susceptible d’en émettre.',
        'C’est la deuxième cause de cancer du poumon après le tabac, et le risque augmente avec la durée d’exposition.',
        'La mesure se fait avec un petit dosimètre posé plusieurs semaines en hiver — le coût est modeste.',
        'Le premier remède est gratuit : ventiler, et ne pas boucher les entrées d’air. Ensuite viennent l’étanchement du plancher bas et la ventilation du vide sanitaire.',
        'Les niveaux les plus élevés se rencontrent en rez-de-chaussée, en sous-sol et dans les caves aménagées.'
      ],
      aussi: ['c-est-quoi-l-etat-des-risques', 'verifier-les-risques-de-mon-adresse'],
      savoir: ['ventilation'],
      sources: [{ titre: 'Géorisques — le radon', url: GEO }],
      verifie: V
    },

    {
      id: 'mon-bien-est-en-zone-inondable',
      question: 'Mon bien est en zone inondable : qu’est-ce que ça change ?',
      variantes: [
        'acheter en zone inondable',
        'PPRI zone rouge bleue',
        'assurance maison zone inondable'
      ],
      court:
        'Cela ne vous empêche ni d’acheter, ni d’assurer, ni de vendre. Mais cela encadre ce que vous pouvez construire, et cela pèse sur la valeur du bien comme sur vos cotisations d’assurance.',
      points: [
        'Le plan de prévention du risque inondation classe les zones et fixe les règles : certaines interdisent de bâtir, d’autres imposent une cote de plancher.',
        'Consultez ce plan en mairie avant d’acheter : c’est lui qui dira si votre projet d’extension est possible.',
        'L’état des risques mentionne les indemnisations passées au titre des catastrophes naturelles : lisez cette partie attentivement.',
        'Le régime « catastrophes naturelles » couvre les dégâts, sous réserve d’un arrêté publié pour l’événement.',
        'Renseignez-vous aussi sur les remontées de nappe : elles inondent des caves loin de toute rivière.'
      ],
      aussi: ['c-est-quoi-l-etat-des-risques', 'verifier-les-risques-de-mon-adresse', 'c-est-quoi-le-retrait-gonflement-des-argiles'],
      sources: [{ titre: 'Géorisques — inondations', url: GEO }],
      verifie: V
    },

    {
      id: 'c-est-quoi-le-diagnostic-bruit',
      question: 'C’est quoi le diagnostic bruit, près d’un aéroport ?',
      variantes: [
        'état des nuisances sonores aériennes',
        'diagnostic bruit aéroport obligatoire',
        'plan d’exposition au bruit vente'
      ],
      court:
        'Une information due depuis 2020 quand le bien se trouve dans une zone d’exposition au bruit d’un aérodrome. Ce n’est pas une mesure faite chez vous : c’est la reprise d’un zonage officiel, comme l’état des risques.',
      dessin: 'erp-couches',
      points: [
        'Le plan d’exposition au bruit découpe les abords des aérodromes en zones, de la plus exposée à la plus éloignée.',
        'Ce zonage encadre aussi la constructibilité : dans les zones les plus exposées, on ne bâtit pas de logement neuf.',
        'L’information est due à la vente comme à la location, et se joint au dossier.',
        'Elle porte sur le trafic aérien uniquement : ni la route, ni le rail, ni le voisinage n’y figurent.'
      ],
      piege:
        'Aucun diagnostic obligatoire ne traite du bruit de la route, des voisins ou d’un chantier. Sur ces sujets, seule une visite à des heures différentes vous renseignera.',
      aussi: ['c-est-quoi-l-etat-des-risques', 'quels-diagnostics-pour-vendre', 'un-diagnostic-garantit-il-le-logement'],
      verifie: V
    }
  ]
};
