/**
 * Une fiche par diagnostic, toujours la même structure : pourquoi ce document
 * existe, comment il est fait, ce qu'on risque, ce qu'il faut faire.
 *
 * Quatre phrases courtes. Le lecteur type a quinze ans et n'a jamais vendu de
 * logement : pas de renvoi à un article de loi, pas de subordonnée à rallonge.
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
        ? 'On n’a rien vu là où on pouvait regarder. Les murs fermés et les parties inaccessibles n’ont pas été contrôlés — et ce document ne vaut que six mois.'
        : 'Il y a des traces. Il faut le déclarer en mairie et faire venir une entreprise de traitement.';
    case 'amiante':
      return bon
        ? 'Rien trouvé dans les matériaux contrôlés. Avant des travaux, un repérage plus poussé reste obligatoire.'
        : 'Il y en a. Tant qu’on n’y touche pas, rien ne se libère. Ne percez pas, ne poncez pas vous-même.';
    case 'plomb':
      return bon
        ? 'Rien à faire aujourd’hui. Surveillez simplement l’état des peintures anciennes.'
        : 'Le propriétaire doit faire réaliser les travaux, et prévenir les occupants comme les entreprises qui interviendront.';
    case 'electricite':
    case 'gaz':
      return bon
        ? 'Les points de sécurité contrôlés sont bons.'
        : 'Rien ne vous oblige à faire les travaux pour vendre. Mais l’acheteur les verra, et il en tiendra compte dans son prix.';
    case 'dpe':
      return gravite === 'alerte'
        ? 'Ce logement ne pourra bientôt plus être loué, et il se vendra moins cher qu’un logement mieux noté.'
        : null;
    case 'erp':
      return 'Cela ne se répare pas : c’est le terrain, pas le logement. Ce qui compte, c’est ce que votre assurance couvre.';
    case 'carrez':
      return 'C’est ce chiffre-là qui sera écrit dans l’acte de vente, et qui engage le vendeur.';
    default:
      return null;
  }
}

export const FICHES: Record<TypeDiag, Fiche> = {
  dpe: {
    pourquoi: 'Pour savoir ce que ce logement coûte à chauffer, et le comparer aux autres.',
    comment:
      'On calcule l’énergie qu’il faut pour le chauffer, l’éclairer et avoir de l’eau chaude — d’après son isolation et ses équipements, pas d’après vos habitudes.',
    risque:
      'Un logement mal noté coûte cher en chauffage, se vend moins bien, et ne peut parfois plus être loué du tout.',
    quoiFaire:
      'Regardez la lettre, puis la liste de travaux en fin de rapport. Le toit d’abord : c’est le moins cher et le plus efficace.'
  },

  plomb: {
    pourquoi:
      'Avant 1949, les peintures contenaient du plomb. Il est toujours là, souvent caché sous des couches plus récentes.',
    comment:
      'Un appareil posé contre le mur mesure le plomb sans rien abîmer. Chaque mur, porte ou plinthe reçoit une note de 0 à 3.',
    risque:
      'Une peinture qui s’écaille fait de la poussière. Avalée par un jeune enfant, elle provoque le saturnisme, une maladie grave.',
    quoiFaire:
      'S’il y a des 3, le propriétaire doit faire les travaux. Et jamais de ponçage à sec : c’est ce qui contamine tout le logement.'
  },

  amiante: {
    pourquoi:
      'L’amiante est interdite depuis 1997. Avant, on en mettait partout : toiture, dalles de sol, colle, conduits.',
    comment:
      'Le diagnostiqueur contrôle une liste précise de matériaux, à l’œil. Il ne perce rien et ne casse rien.',
    risque:
      'Les fibres se libèrent quand on perce, on ponce, ou quand le matériau se dégrade. Respirées, elles provoquent des cancers, des dizaines d’années plus tard.',
    quoiFaire:
      'En bon état : on laisse tranquille et on surveille. Avant des travaux : entreprise certifiée, jamais soi-même.'
  },

  electricite: {
    pourquoi:
      'Les installations de plus de quinze ans sont la première cause d’incendie d’origine électrique.',
    comment:
      'Six points de sécurité sont vérifiés à l’œil : coupure d’urgence, différentiel, mise à la terre, disjoncteurs, salle de bains, matériel abîmé.',
    risque:
      'Sans différentiel, le courant qui fuit passe par vous au lieu de couper. C’est ce qui électrocute.',
    quoiFaire:
      'Aucun travaux n’est obligatoire pour vendre. Mais le différentiel et la mise à la terre se traitent en premier : ce sont eux qui protègent les personnes.'
  },

  gaz: {
    pourquoi: 'Une fuite de gaz ou une combustion mal ventilée peuvent tuer en une nuit.',
    comment:
      'On vérifie les tuyaux, les appareils raccordés, la ventilation de la pièce et le conduit qui évacue les fumées.',
    risque:
      'Le monoxyde de carbone ne se voit pas et ne sent rien. Il endort, puis il tue.',
    quoiFaire:
      'A1 : à réparer un jour. A2 : à réparer vite. DGI : le gaz est coupé sur-le-champ, et seul un professionnel peut le remettre.'
  },

  termites: {
    pourquoi:
      'Dans certaines communes, les termites attaquent les charpentes et les planchers. Le préfet impose alors ce contrôle.',
    comment:
      'Le diagnostiqueur cherche des traces visibles : galeries, petits tunnels de terre, bois qui sonne creux. Sans rien démonter.',
    risque:
      'Ils mangent le bois de l’intérieur en laissant la surface intacte. Un plancher peut céder sans avoir prévenu.',
    quoiFaire:
      'S’il y a des indices : déclaration en mairie et traitement par une entreprise. Ce document ne vaut que six mois.'
  },

  erp: {
    pourquoi:
      'Pour savoir à quoi le terrain est exposé : inondation, argile, séisme, pollution, bruit.',
    comment:
      'Le diagnostiqueur recopie les zonages officiels de la commune. Personne ne vient mesurer quoi que ce soit chez vous.',
    risque:
      'L’argile gonfle et se rétracte avec les saisons. La maison suit le mouvement, et les murs se fissurent.',
    quoiFaire:
      'Vérifiez ce que couvre votre assurance en cas de catastrophe naturelle. Ce document ne vaut que six mois.'
  },

  carrez: {
    pourquoi: 'Pour savoir quelle surface on achète vraiment, dans un logement en copropriété.',
    comment:
      'On mesure le sol, mais seulement là où le plafond dépasse 1,80 m. Les murs, les cloisons et les gaines sont déduits.',
    risque:
      'Si la surface réelle est inférieure de plus de 5 % à celle annoncée, l’acheteur peut faire baisser le prix.',
    quoiFaire:
      'Comparez ce chiffre avec celui de l’annonce. En cas d’écart, demandez au diagnostiqueur lequel fait foi.'
  },

  assainissement: {
    pourquoi: 'Il faut savoir où partent les eaux usées du logement.',
    comment:
      'On vérifie le raccordement au réseau de la commune, ou l’état de l’installation enterrée dans le jardin.',
    risque:
      'Une installation non conforme pollue le terrain et devra être refaite — cela se chiffre en milliers d’euros.',
    quoiFaire:
      'Si c’est non conforme, l’acheteur a un an après la vente pour faire les travaux. C’est un point de négociation classique.'
  }
};
