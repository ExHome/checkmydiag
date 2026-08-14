/**
 * Une fiche par diagnostic, toujours la même structure : pourquoi ce document
 * existe, comment il est fait, ce qu'on risque, ce qu'il faut faire.
 *
 * Registre de l'antisèche : des mots-clés, des flèches, des chiffres. Pas de
 * phrase complète quand un fragment suffit. Le lecteur type a quinze ans et
 * cherche une réponse, pas un cours.
 */
import type { Gravite, TypeDiag } from '../modele';

export interface Fiche {
  pourquoi: string;
  comment: string;
  risque: string;
  quoiFaire: string;
  /**
   * Ce que ça change le jour de la vente ou de la signature du bail.
   *
   * C'est la question que tout le monde finit par poser — « et pour vendre,
   * ça donne quoi ? » — et la seule à laquelle un rapport ne répond jamais.
   */
  vente: string;
}

/**
 * La phrase du rapport traduite en conséquence concrète.
 *
 * « Aucun indice d'infestation » ne dit rien à personne : ce que le lecteur veut
 * savoir, c'est s'il doit faire quelque chose, et ce que la phrase ne dit pas.
 */
export function enPratique(type: TypeDiag, gravite: Gravite): string | null {
  const bon = gravite === 'bon';

  switch (type) {
    case 'termites':
      return bon
        ? 'Rien vu là où on pouvait regarder. Murs fermés et zones inaccessibles : non contrôlés. Valable 6 mois.'
        : 'Traces présentes → déclaration en mairie + traitement par une entreprise.';
    case 'amiante':
      return bon
        ? 'Rien dans les matériaux contrôlés. Avant travaux : repérage plus poussé obligatoire.'
        : 'Il y en a. On n’y touche pas → aucun risque. On perce ou on ponce → danger.';
    case 'plomb':
      return bon
        ? 'Rien à faire aujourd’hui. Surveiller les peintures anciennes.'
        : 'Travaux à la charge du propriétaire. Occupants et entreprises à prévenir.';
    case 'electricite':
    case 'gaz':
      return bon
        ? 'Points de sécurité contrôlés : bons.'
        : 'Travaux non obligatoires pour vendre. Mais l’acheteur les verra → il négociera.';
    case 'dpe':
      return gravite === 'alerte'
        ? 'Bientôt interdit à la location. Se vend moins cher qu’un logement mieux noté.'
        : null;
    case 'erp':
      return 'Ne se répare pas : c’est le terrain. Ce qui compte → ce que couvre l’assurance.';
    case 'carrez':
      return 'Ce chiffre part dans l’acte de vente. Il engage le vendeur.';
    default:
      return null;
  }
}

export const FICHES: Record<TypeDiag, Fiche> = {
  dpe: {
    pourquoi: 'Savoir ce que le logement coûte à chauffer. Et le comparer aux autres.',
    comment:
      'Calcul d’après l’isolation et les équipements. Usage standard, pas vos habitudes.',
    risque: 'Mauvaise note → chauffage cher, vente plus difficile, location parfois interdite.',
    quoiFaire: 'Lire la lettre, puis la liste de travaux. Le toit d’abord : moins cher, plus efficace.',
    vente:
      'Lettre obligatoire dans l’annonce. G : plus louable. F : interdit en 2028. F ou G en maison → audit énergétique à fournir. Valable 10 ans.'
  },

  plomb: {
    pourquoi: 'Peintures d’avant 1949 = plomb. Toujours là, souvent sous des couches récentes.',
    comment: 'Appareil posé contre le mur → une note de 0 à 3 par élément. Rien n’est abîmé.',
    risque: 'Peinture qui s’écaille → poussière → avalée par un enfant → saturnisme.',
    quoiFaire: 'Une classe 3 → travaux obligatoires. Jamais de ponçage à sec.',
    vente:
      'Obligatoire avant 1949. Sans plomb : valable à vie. Avec plomb : 1 an pour vendre, 6 ans pour louer. Classe 3 → travaux avant de remettre en location.'
  },

  amiante: {
    pourquoi: 'Interdite depuis 1997. Avant : toiture, dalles de sol, colle, conduits.',
    comment: 'Liste précise de matériaux, contrôlés à l’œil. Rien n’est percé.',
    risque: 'Percer, poncer, casser → fibres libérées → cancers, des dizaines d’années plus tard.',
    quoiFaire: 'Bon état → laisser tranquille et surveiller. Travaux → entreprise certifiée.',
    vente:
      // « Valable à vie » était trop absolu : l'arrêté du 12 décembre 2012 a
      // élargi la liste des matériaux à contrôler, si bien qu'un constat
      // négatif établi avant 2013 doit être refait pour vendre.
      'Obligatoire avant juillet 1997. Sans amiante : valable à vie — sauf s’il date d’avant 2013, à refaire. Avec amiante : à réévaluer tous les 3 ans. Ne bloque pas la vente, mais s’annonce à l’acheteur.'
  },

  electricite: {
    pourquoi: 'Installations de plus de 15 ans : première cause d’incendie électrique.',
    /* Les six domaines de l'arrêté du 28 septembre 2017, dans son ordre.
       La liste précédente en omettait un — les matériels à risque de contact
       direct — et comptait le différentiel et la terre pour deux, alors que
       l'arrêté les réunit dans un seul domaine. */
    comment:
      'Six domaines contrôlés à l’œil : coupure d’urgence, différentiel et terre, disjoncteurs, salle d’eau, pièces sous tension accessibles, matériel vétuste.',
    risque: 'Sans différentiel → le courant qui fuit passe par vous.',
    quoiFaire: 'Rien d’obligatoire pour vendre. Priorité : différentiel et mise à la terre.',
    vente:
      'Obligatoire au-delà de 15 ans d’installation. Valable 3 ans pour vendre, 6 pour louer. Aucun travail imposé — mais chaque anomalie devient un argument de négociation.'
  },

  gaz: {
    pourquoi: 'Fuite ou mauvaise combustion → mort possible en une nuit.',
    comment: 'Tuyaux, appareils, ventilation de la pièce, évacuation des fumées.',
    risque: 'Monoxyde de carbone : invisible, sans odeur. Il endort, puis il tue.',
    quoiFaire: 'A1 → un jour. A2 → vite. DGI → gaz coupé sur-le-champ, remise en service par un pro.',
    vente:
      'Obligatoire au-delà de 15 ans d’installation. Valable 3 ans pour vendre, 6 pour louer. Un DGI se règle avant l’état des lieux : le gaz reste coupé tant que ce n’est pas fait.'
  },

  termites: {
    pourquoi: 'Communes classées par le préfet : les termites y attaquent charpentes et planchers.',
    comment: 'Recherche de traces visibles : galeries, tunnels de terre, bois qui sonne creux.',
    risque: 'Bois mangé de l’intérieur, surface intacte → un plancher peut céder sans prévenir.',
    quoiFaire: 'Indices → mairie + entreprise de traitement. Document valable 6 mois.',
    vente:
      'Obligatoire seulement en commune classée par arrêté préfectoral. Valable 6 mois : souvent le premier document du dossier à périmer avant la signature.'
  },

  erp: {
    pourquoi: 'Savoir à quoi le terrain est exposé : inondation, argile, séisme, pollution, bruit.',
    comment: 'Recopie des zonages officiels. Personne ne vient mesurer chez vous.',
    risque: 'Argile → gonfle et se rétracte → la maison suit → murs fissurés.',
    quoiFaire: 'Vérifier la couverture de l’assurance. Document valable 6 mois.',
    vente:
      // « Obligatoire partout » était faux : l'ERP n'est dû que si la commune
      // est couverte par un plan de prévention des risques, une zone de
      // sismicité 2 ou plus, un potentiel radon 3, ou un secteur d'information
      // sur les sols. C'est le cas de la très grande majorité — pas de toutes.
      'Obligatoire dès que la commune est couverte par un plan de prévention des risques, une zone sismique ou un secteur radon : c’est le cas de la plupart. Valable 6 mois. Un sinistre indemnisé passé doit être déclaré à l’acheteur, sous peine d’annulation.'
  },

  carrez: {
    pourquoi: 'Savoir quelle surface on achète, en copropriété.',
    comment: 'Sol mesuré sous plus de 1,80 m. Murs, cloisons et gaines déduits.',
    risque: 'Plus de 5 % d’écart avec l’annonce → l’acheteur peut faire baisser le prix.',
    quoiFaire: 'Comparer avec l’annonce. Écart → demander au diagnostiqueur lequel fait foi.',
    vente:
      'Obligatoire en copropriété. Sans limite de validité tant que rien ne bouge. Le chiffre part dans l’acte : plus de 5 % en moins, et l’acheteur a 1 an pour réclamer une baisse de prix.'
  },

  assainissement: {
    pourquoi: 'Savoir où partent les eaux usées.',
    comment: 'Contrôle du raccordement au réseau, ou de l’installation enterrée.',
    risque: 'Non conforme → pollution du terrain, travaux en milliers d’euros.',
    quoiFaire: 'Non conforme → l’acheteur a 1 an pour faire les travaux. Point de négociation.',
    vente:
      'Obligatoire hors réseau collectif. Valable 3 ans. Non conforme : la vente se fait quand même, mais l’acheteur a 1 an pour tout remettre aux normes — d’où la négociation.'
  }
};
