/**
 * De quel document s'agit-il, au juste.
 *
 * C'est la première question d'un professionnel, et le moteur ne se la posait
 * pas. Mesuré sur le corpus réel : sept repérages avant travaux sur sept
 * étaient restitués comme un diagnostic amiante de vente. Or un repérage avant
 * travaux relève du code du travail — il protège les ouvriers d'un chantier, il
 * ne dit rien de ce qu'on vend. Croire le contraire, c'est signer en pensant
 * avoir un diagnostic qu'on n'a pas.
 *
 * Trois documents portent d'ailleurs le même intitulé de mission, « rapport de
 * mission de repérage des matériaux et produits contenant de l'amiante » : le
 * repérage avant vente, le dossier technique amiante et le repérage avant
 * travaux. Seule leur finalité les distingue, et elle est écrite un peu plus
 * bas dans la page.
 *
 * Ce module ne juge pas le contenu : il nomme le document et dit ce qu'il vaut.
 *
 * Les fondements, vérifiés au texte :
 *  - DTG  — art. L731-1 du code de la construction et de l'habitation
 *  - PPPT — art. 14-2 de la loi n° 65-557 du 10 juillet 1965
 *  - DTA  — art. R1334-29-5 du code de la santé publique
 *  - RAAT — art. R4412-97 du code du travail, arrêté du 16 juillet 2019
 */
import { compact } from './texte';

export type GenreDocument =
  /** Le dossier remis à l'acquéreur ou au locataire d'un logement. */
  | 'venteLocation'
  /** Diagnostic technique global d'une copropriété. */
  | 'dtg'
  /** Projet de plan pluriannuel de travaux. */
  | 'pppt'
  /** Dossier technique amiante des parties communes. */
  | 'dta'
  /** Repérage amiante avant travaux ou démolition. */
  | 'raat'
  /** DPE à l'échelle de l'immeuble. */
  | 'dpeCollectif'
  /** Une offre de prix, pas un rapport : rien à y analyser. */
  | 'devis'
  /** On ne reconnaît pas : on le dit plutôt que de supposer. */
  | 'inconnu';

export interface Nature {
  genre: GenreDocument;
  /** Le nom du document, tel qu'un professionnel le prononce. */
  nom: string;
  /** À quoi il sert, en une phrase de tous les jours. */
  quoi: string;
  /** Ce qu'il ne fait pas — la phrase qui évite le malentendu. */
  reserve?: string;
  /** Sur quoi il porte : un logement, ou l'immeuble entier. */
  portee: 'logement' | 'immeuble';
  /** Vaut-il pour une vente ? C'est la question que le lecteur pose. */
  pourLaVente: boolean;
}

/**
 * Les marques d'un genre, cherchées dans le texte compacté.
 *
 * L'ordre compte : on va du plus spécifique au plus général. Le repérage avant
 * travaux se reconnaît à sa finalité — « avant réalisation de travaux » — qui
 * n'appartient qu'à lui ; le dossier technique amiante, à sa constitution. Le
 * dossier de vente vient en dernier, car ses composants se retrouvent partout.
 */
interface Marque {
  motif: RegExp;
  /**
   * Ce que la marque vaut.
   *
   * 3 — elle n'appartient qu'à ce document : un article de code, un arrêté, une
   *     formule de mission qu'aucun autre ne porte ;
   * 2 — elle est caractéristique mais pourrait se citer ailleurs ;
   * 1 — elle est compatible, elle ne prouve rien seule.
   */
  poids: 1 | 2 | 3;
}

interface Signe {
  genre: GenreDocument;
  marques: Marque[];
  /** Le score minimal pour conclure. */
  seuil: number;
}

/*
 * On ne conclut pas sur un mot, mais sur un faisceau.
 *
 * La première version cherchait une marque unique et se trompait sur presque
 * tout : vingt-cinq dossiers de vente sur vingt-cinq étaient pris pour des
 * repérages avant travaux. La cause était connue et documentée — l'en-tête
 * commercial du diagnostiqueur liste toutes ses prestations sur chaque page,
 * « diag amiante avant démolition » compris. Un mot isolé ne prouve donc rien.
 *
 * Chaque marque porte maintenant un poids, et le genre retenu est celui qui
 * réunit le meilleur faisceau. Les marques qui n'appartiennent qu'à un document
 * — un article de code, un arrêté — pèsent lourd ; celles qu'on peut croiser
 * n'importe où ne suffisent jamais seules.
 */
const SIGNES: Signe[] = [
  /*
   * Le devis passe avant tout le reste, et pour cause : il parle du document
   * qu'on propose de faire, avec ses mots. Mesuré sur le corpus, cinq offres
   * commerciales de plan pluriannuel étaient contrôlées comme si elles étaient
   * le plan lui-même — on leur reprochait de ne pas chiffrer des travaux
   * qu'elles se contentaient de proposer d'étudier.
   */
  {
    genre: 'devis',
    seuil: 4,
    marques: [
      { motif: /validitedeloffre|offrevalablejusqu/, poids: 3 },
      { motif: /bonpouraccord|adecoupersuivantlespointilles/, poids: 3 },
      { motif: /conditionsgeneralesdevente/, poids: 2 },
      { motif: /devisn|propositioncommerciale|offredeprix/, poids: 2 },
      { motif: /montanttotalht|totalht|tvaa?20/, poids: 1 },
      { motif: /notremethodologie|pourquoitravailleravec/, poids: 1 }
    ]
  },
  {
    genre: 'raat',
    seuil: 3,
    marques: [
      { motif: /avantrealisationdetravaux/, poids: 3 },
      { motif: /reperagedelamianteavantcertainesoperations/, poids: 3 },
      { motif: /arretedu16juillet2019/, poids: 3 },
      { motif: /r4412(9[0-9])/, poids: 3 },
      { motif: /reperageamianteavanttravaux/, poids: 2 },
      { motif: /avanttravauxoudemolition/, poids: 2 }
    ]
  },
  {
    genre: 'dta',
    seuil: 3,
    marques: [
      { motif: /aintegreraudossiertechniqueamiante/, poids: 3 },
      { motif: /r13342[0-9]5/, poids: 3 },
      { motif: /ficherecapitulativedudossiertechniqueamiante/, poids: 3 },
      { motif: /dossiertechniqueamiante/, poids: 2 },
      { motif: /listesaetbdelannexe139/, poids: 1 }
    ]
  },
  {
    genre: 'pppt',
    seuil: 3,
    marques: [
      { motif: /projetdeplanpluriannuelde ?travaux/, poids: 3 },
      { motif: /article142dela ?loidu10juillet1965/, poids: 3 },
      { motif: /planpluriannueldetravaux/, poids: 2 },
      { motif: /pppto?\b/, poids: 1 }
    ]
  },
  {
    genre: 'dtg',
    seuil: 3,
    marques: [
      { motif: /diagnostictechniqueglobal/, poids: 3 },
      { motif: /l7311ducodedelaconstruction/, poids: 3 },
      { motif: /etatapparentdespartiescommunesetdesequipementscommuns/, poids: 3 },
      { motif: /analysedeletatapparentdespartiescommunes/, poids: 2 }
    ]
  },
  {
    genre: 'dpeCollectif',
    seuil: 3,
    marques: [
      { motif: /dpecollectif/, poids: 3 },
      { motif: /diagnosticdeperformanceenergetiquealimmeuble/, poids: 3 },
      { motif: /performanceenergetiquedesbatimentsdhabitationcollectif/, poids: 3 },
      { motif: /dpealimmeuble/, poids: 2 }
    ]
  },
  {
    genre: 'venteLocation',
    seuil: 4,
    marques: [
      { motif: /dossierdediagnostictechnique/, poids: 3 },
      { motif: /dossiertechniqueimmobilier/, poids: 3 },
      { motif: /annexealapromessedevente|annexeaucompromis/, poids: 3 },
      { motif: /constatderisquedexpositionauplomb/, poids: 1 },
      { motif: /etatdelinstallationinterieuredelectricite/, poids: 1 },
      { motif: /etatdelinstallationinterieuredegaz/, poids: 1 },
      { motif: /etatrelatifalapresencedetermites/, poids: 1 },
      { motif: /attestationdesurfacehabitable|superficieprivative/, poids: 1 }
    ]
  }
];

/** Ce qu'on dit de chaque genre. Rien qui ne soit dans un texte. */
const FICHE: Record<GenreDocument, Omit<Nature, 'genre'>> = {
  venteLocation: {
    nom: 'Dossier de diagnostic technique',
    quoi: 'Le dossier remis à l’acquéreur ou au locataire d’un logement, annexé à la promesse ou au bail.',
    portee: 'logement',
    pourLaVente: true
  },
  dtg: {
    nom: 'Diagnostic technique global',
    quoi: 'L’état de santé d’une copropriété entière : ses parties communes, ses équipements, ses obligations et sa performance énergétique.',
    reserve:
      'Il porte sur l’immeuble, pas sur un logement en particulier : il ne remplace aucun des diagnostics que le vendeur doit remettre.',
    portee: 'immeuble',
    pourLaVente: false
  },
  pppt: {
    nom: 'Projet de plan pluriannuel de travaux',
    quoi: 'La liste des travaux qu’une copropriété devra engager sur dix ans, avec leur ordre d’urgence et leur coût estimé.',
    reserve:
      'C’est un projet soumis au vote de l’assemblée générale, pas un constat sur l’état d’un logement.',
    portee: 'immeuble',
    pourLaVente: false
  },
  dta: {
    nom: 'Dossier technique amiante',
    quoi: 'Le relevé permanent de l’amiante dans les parties communes d’un immeuble bâti avant le 1ᵉʳ juillet 1997, tenu à jour par le propriétaire.',
    reserve:
      'Il porte sur les parties communes. Le repérage amiante qu’un vendeur doit remettre pour son lot est un autre document.',
    portee: 'immeuble',
    pourLaVente: false
  },
  raat: {
    nom: 'Repérage amiante avant travaux',
    quoi: 'Le repérage fait avant un chantier, pour que les entreprises sachent où se trouve l’amiante et protègent leurs salariés.',
    reserve:
      'Il relève du code du travail et ne vaut que pour l’opération prévue. Ce n’est pas le diagnostic amiante d’une vente, même s’il porte le même intitulé de mission.',
    portee: 'immeuble',
    pourLaVente: false
  },
  dpeCollectif: {
    nom: 'DPE collectif',
    quoi: 'La performance énergétique de l’immeuble entier, établie à l’échelle de la copropriété.',
    reserve:
      'Un logement peut recevoir une classe différente de celle de son immeuble : pour vendre, c’est le DPE du lot qui est demandé.',
    portee: 'immeuble',
    pourLaVente: false
  },
  devis: {
    nom: 'Devis',
    quoi: 'Une offre de prix pour une prestation à venir — ce que coûterait le document, pas le document.',
    reserve:
      'Il n’y a rien à analyser dans un devis : aucun constat n’y a encore été fait. Le rapport viendra après la mission.',
    portee: 'immeuble',
    pourLaVente: false
  },
  inconnu: {
    nom: 'Document non reconnu',
    quoi: 'Ce document ne correspond à aucun rapport connu de l’application.',
    reserve:
      'Rien n’en est déduit : mieux vaut ne rien dire que de le prendre pour ce qu’il n’est pas.',
    portee: 'logement',
    pourLaVente: false
  }
};

/**
 * La nature du document, d'après ses premières pages.
 *
 * On regarde le début : c'est là qu'un rapport annonce ce qu'il est. Aller plus
 * loin ferait entrer les annexes, où un dossier de vente cite volontiers les
 * textes d'autres diagnostics — et où un DTG recopie parfois un DTA entier.
 */
export function natureDe(lignes: string[], pagesRegardees = 8): Nature {
  const debut = compact(lignes.slice(0, pagesRegardees * 45).join(' '));

  /*
   * On note tous les genres et on retient le mieux servi, au lieu de s'arrêter
   * au premier qui répond. Un document de copropriété cite volontiers les
   * autres — un DTG recopie un dossier technique amiante, un dossier de vente
   * mentionne la démolition dans la liste des prestations de son en-tête. C'est
   * l'écart entre les scores qui tranche, pas l'ordre dans lequel on cherche.
   */
  let meilleur: { genre: GenreDocument; score: number } = { genre: 'inconnu', score: 0 };

  for (const signe of SIGNES) {
    let score = 0;
    for (const { motif, poids } of signe.marques) {
      if (motif.test(debut)) score += poids;
    }
    if (score >= signe.seuil && score > meilleur.score) {
      meilleur = { genre: signe.genre, score };
    }
  }

  return { genre: meilleur.genre, ...FICHE[meilleur.genre] };
}

/** La fiche d'un genre, pour l'afficher sans refaire la reconnaissance. */
export function ficheDe(genre: GenreDocument): Nature {
  return { genre, ...FICHE[genre] };
}
