/**
 * L'univers de chaque diagnostic : ce qu'on voit une fois entré.
 *
 * Chaque application a son monde — un laboratoire pour le plomb, un tableau
 * technique pour l'électricité, une coupe géologique pour les risques. Les
 * palettes viennent des maquettes fournies le 15/08/2026, relevées une à une.
 *
 * ── Où l'univers s'arrête ───────────────────────────────────────────────────
 *
 * Il vit À L'INTÉRIEUR de l'écran, et nulle part ailleurs. La coque reste à la
 * charte : l'écran d'accueil, la barre de l'application, le bouton de sortie,
 * le dock. C'est la consigne, et elle est juste — une icône violette peut
 * ouvrir un écran violet, mais le produit doit rester le même produit d'un
 * écran à l'autre.
 *
 * ── Ce qui ne se négocie pas ────────────────────────────────────────────────
 *
 * Tout texte tient 4,5 de contraste sur son fond réel. Chaque couple
 * texte/fond ci-dessous a été mesuré, pas estimé : quand la maquette proposait
 * une teinte trop pâle pour être lue, elle est assombrie et la note le dit.
 *
 * Les couleurs A→G de l'étiquette énergétique et les trois couleurs d'état du
 * produit ne changent jamais : un univers ne doit pas rendre une alerte moins
 * visible.
 */
import type { TypeDiag } from './modele';

/**
 * Les deux outils de la rangée « Pour comprendre ».
 *
 * Ils ont une icône sur l'écran d'accueil comme les neuf diagnostics, et
 * s'ouvrent comme eux — mais ils ne lisent pas votre rapport, ils vous aident à
 * le lire. Pas de gravité, pas de date de validité, pas de conclusion sur votre
 * logement : ils méritent leur univers, et cet univers doit dire « outil », pas
 * « constat ».
 */
export type Outil = 'dicodiag' | 'en-clair';

/** Tout ce qui peut porter un univers : les neuf diagnostics et les deux outils. */
export type Ecran = TypeDiag | Outil;

export interface Univers {
  /** Le fond de la zone de contenu. */
  fond: string;
  /** Les cartes posées dessus. */
  surface: string;
  /** Le texte courant. */
  texte: string;
  /** Le texte secondaire — mentions, précisions. */
  texteDoux: string;
  /** La couleur qui désigne : filets, bords actifs, accents. */
  accent: string;
  /**
   * L'encre posée SUR l'accent, quand il devient un aplat plein.
   *
   * Elle ne se déduit pas : le jaune de l'électricité veut une encre sombre, le
   * vert du plomb une encre blanche. Écrire du blanc sur les deux donnerait un
   * bouton illisible dans un cas sur deux.
   */
  surAccent: string;
  /** Les filets et séparations. */
  trait: string;
  /** Vrai si le fond est sombre — les schémas s'y adaptent. */
  sombre?: boolean;
}

export const UNIVERS: Partial<Record<Ecran, Univers>> = {
  /*
   * DPE — le banc de mesure.
   *
   * Le seul univers qui ne prend aucune teinte, et c'est ce qui le distingue :
   * un DPE n'est pas un avis, c'est une mesure. Papier kraft, encre profonde,
   * chiffres en colonne.
   *
   * L'écran rendu à l'encre a une conséquence qui vaut à elle seule le choix :
   * les seules couleurs qui restent sont les sept de l'arrêté et celle de
   * l'alerte. Elles redeviennent les seules choses qu'on regarde.
   *
   * L'accent est passé du corail foncé à cette encre après mesure : #d0402c ne
   * tenait que 3,90 sur le kraft, et il porte les intitulés de section
   * (« Ce qu'on risque », « Ce qu'il faut faire »). L'encre tient 10,71.
   */
  dpe: {
    fond: '#efe4d2',
    surface: '#ffffff',
    texte: '#1a4d5c',
    texteDoux: '#3a4a52',
    accent: '#0b333f',
    surAccent: '#ffffff',
    trait: '#cdbfa4'
  },

  /* Électricité — le tableau technique, le seul écran sombre. */
  electricite: {
    fond: '#0d1720',
    surface: '#14212b',
    texte: '#e8eef2',
    texteDoux: '#a8bcc7',
    /* Le jaune de la maquette : 12,1 sur le fond, il porte les accents. */
    accent: '#ffd54f',
    surAccent: '#0d1720',
    trait: '#24333f',
    sombre: true
  },

  /* Amiante — le violet du prélèvement, sur le sable. */
  amiante: {
    fond: '#f4e8d8',
    surface: '#ffffff',
    /* #7B68EE ne tient que 3,6 sur blanc : assombri pour le texte, la teinte
       d'origine reste sur les aplats et les filets. */
    texte: '#3b2f7a',
    texteDoux: '#5a5580',
    accent: '#5a4bc4',
    surAccent: '#ffffff',
    trait: '#ddd6f3'
  },

  /* Plomb — le laboratoire d'analyse, fonds très pâles et verts profonds. */
  plomb: {
    fond: '#f2f8f2',
    surface: '#f7faf7',
    texte: '#1b5e20',
    texteDoux: '#4a6b4d',
    accent: '#2e7d32',
    surAccent: '#ffffff',
    trait: '#cfe0d1'
  },

  /* Gaz — la chaufferie : sable chaud, orange de la flamme. */
  gaz: {
    fond: '#fff8f2',
    surface: '#ffffff',
    texte: '#8b3e00',
    texteDoux: '#7a5540',
    /* #FF8C42 tombe à 2,7 sur blanc : l'orange foncé prend le relais dès qu'il
       s'agit d'écrire ou de porter du blanc. */
    accent: '#a8480c',
    surAccent: '#ffffff',
    trait: '#f2e4d6'
  },

  /* Termites — le bois : cernes, fibres, terres brûlées. */
  termites: {
    fond: '#f4e8d8',
    surface: '#fffdfa',
    texte: '#5d3a1a',
    texteDoux: '#7a5a40',
    accent: '#8b4513',
    surAccent: '#ffffff',
    trait: '#e3d0b8'
  },

  /*
   * Dicodiag — l'ouvrage de référence.
   *
   * Ce n'est pas un diagnostic, et il ne doit pas en avoir l'air : on consulte,
   * on ne subit pas. Rien de ce qui est écrit ici ne parle de votre bien.
   *
   * La rupture n'est pas dans la couleur, elle est dans la matière — et c'est
   * ce qui la rend impossible à confondre avec un huitième diagnostic. Les
   * autres univers sont bâtis sur des cartes claires posées sur un fond teinté.
   * Ici la surface est plus SOMBRE que le fond : le bloc s'enfonce dans la page
   * au lieu de s'en détacher, comme un encadré dans un livre. Un rapport a
   * besoin de la carte pour y poser sa pastille de gravité — ce fond lui est
   * structurellement inutilisable.
   *
   * L'encre est presque neutre, quand les sept autres ont un texte teinté :
   * c'est la signature de l'imprimé. Et l'accent n'est pas une huitième teinte
   * inventée — c'est le bleu ardoise de l'icône Dicodiag, assombri jusqu'à
   * passer la mesure (#5c6b8a n'atteignait que 4,47 sur les surfaces).
   *
   * Aucune couleur de danger n'apparaît, et surtout pas de rouge : sur cet
   * écran, il n'y a rien à alerter.
   */
  dicodiag: {
    fond: '#fbf7ef',
    surface: '#f1eadc',
    texte: '#1e2230',
    texteDoux: '#5a6070',
    accent: '#4a5878',
    surAccent: '#ffffff',
    trait: '#d3c9b5'
  },

  /* Risques — la coupe géologique : eaux claires, teal profond. */
  erp: {
    fond: '#f2fafa',
    surface: '#ffffff',
    texte: '#00695c',
    texteDoux: '#4a6f6b',
    accent: '#00796b',
    surAccent: '#ffffff',
    trait: '#d5efee'
  }
};

/**
 * Vrai si l'univers pose son contenu sur un fond sombre.
 *
 * Les trois couleurs d'état — alerte, attention, bon — sont réglées pour du
 * fond clair : posées sur du #0d1720, l'alerte tombe à 2,1 et disparaît. Le
 * produit a déjà des variantes claires de ces trois couleurs, écrites pour
 * l'écran de démarrage. Cet indicateur sert à les rappeler, plutôt qu'à en
 * inventer une seconde série qui divergerait de la première.
 */
export function estSombre(ecran: Ecran): boolean {
  return UNIVERS[ecran]?.sombre === true;
}

/** Les jetons CSS d'un univers, prêts pour un attribut `style`. */
export function styleUnivers(ecran: Ecran): string {
  const u = UNIVERS[ecran];
  if (!u) return '';
  return [
    `--u-fond:${u.fond}`,
    `--u-surface:${u.surface}`,
    `--u-texte:${u.texte}`,
    `--u-texte-doux:${u.texteDoux}`,
    `--u-accent:${u.accent}`,
    `--u-sur-accent:${u.surAccent}`,
    `--u-trait:${u.trait}`
  ].join(';');
}
