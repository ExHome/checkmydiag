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
    quoiFaire: 'Lire la lettre, puis la liste de travaux. Le toit d’abord : moins cher, plus efficace.'
  },

  plomb: {
    pourquoi: 'Peintures d’avant 1949 = plomb. Toujours là, souvent sous des couches récentes.',
    comment: 'Appareil posé contre le mur → une note de 0 à 3 par élément. Rien n’est abîmé.',
    risque: 'Peinture qui s’écaille → poussière → avalée par un enfant → saturnisme.',
    quoiFaire: 'Une classe 3 → travaux obligatoires. Jamais de ponçage à sec.'
  },

  amiante: {
    pourquoi: 'Interdite depuis 1997. Avant : toiture, dalles de sol, colle, conduits.',
    comment: 'Liste précise de matériaux, contrôlés à l’œil. Rien n’est percé.',
    risque: 'Percer, poncer, casser → fibres libérées → cancers, des dizaines d’années plus tard.',
    quoiFaire: 'Bon état → laisser tranquille et surveiller. Travaux → entreprise certifiée.'
  },

  electricite: {
    pourquoi: 'Installations de plus de 15 ans : première cause d’incendie électrique.',
    comment: 'Six points contrôlés à l’œil : coupure, différentiel, terre, disjoncteurs, salle de bains, matériel abîmé.',
    risque: 'Sans différentiel → le courant qui fuit passe par vous.',
    quoiFaire: 'Rien d’obligatoire pour vendre. Priorité : différentiel et mise à la terre.'
  },

  gaz: {
    pourquoi: 'Fuite ou mauvaise combustion → mort possible en une nuit.',
    comment: 'Tuyaux, appareils, ventilation de la pièce, évacuation des fumées.',
    risque: 'Monoxyde de carbone : invisible, sans odeur. Il endort, puis il tue.',
    quoiFaire: 'A1 → un jour. A2 → vite. DGI → gaz coupé sur-le-champ, remise en service par un pro.'
  },

  termites: {
    pourquoi: 'Communes classées par le préfet : les termites y attaquent charpentes et planchers.',
    comment: 'Recherche de traces visibles : galeries, tunnels de terre, bois qui sonne creux.',
    risque: 'Bois mangé de l’intérieur, surface intacte → un plancher peut céder sans prévenir.',
    quoiFaire: 'Indices → mairie + entreprise de traitement. Document valable 6 mois.'
  },

  erp: {
    pourquoi: 'Savoir à quoi le terrain est exposé : inondation, argile, séisme, pollution, bruit.',
    comment: 'Recopie des zonages officiels. Personne ne vient mesurer chez vous.',
    risque: 'Argile → gonfle et se rétracte → la maison suit → murs fissurés.',
    quoiFaire: 'Vérifier la couverture de l’assurance. Document valable 6 mois.'
  },

  carrez: {
    pourquoi: 'Savoir quelle surface on achète, en copropriété.',
    comment: 'Sol mesuré sous plus de 1,80 m. Murs, cloisons et gaines déduits.',
    risque: 'Plus de 5 % d’écart avec l’annonce → l’acheteur peut faire baisser le prix.',
    quoiFaire: 'Comparer avec l’annonce. Écart → demander au diagnostiqueur lequel fait foi.'
  },

  assainissement: {
    pourquoi: 'Savoir où partent les eaux usées.',
    comment: 'Contrôle du raccordement au réseau, ou de l’installation enterrée.',
    risque: 'Non conforme → pollution du terrain, travaux en milliers d’euros.',
    quoiFaire: 'Non conforme → l’acheteur a 1 an pour faire les travaux. Point de négociation.'
  }
};
