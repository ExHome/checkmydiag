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
  /**
   * La couleur VIVE de l'univers, celle des maquettes, telle quelle.
   *
   * Elle ne porte pas toujours de texte : une couleur vive peut être trop claire
   * rose du DPE — mais elle porte tout le reste : les aplats, les barres, les
   * pastilles, les dégradés, les bandeaux.
   *
   * Ce rôle manquait, et son absence se voyait. À force d'assombrir chaque
   * couleur pour qu'elle reste lisible, le produit était devenu rouge brique
   * là où il devait rester vif. Séparer les deux rend sa vivacité à la marque
   * sans rien coûter à la lecture : le vif remplit, le foncé écrit.
   */
  accentVif: string;
  /** La couleur qui ÉCRIT : intitulés, liens, bords actifs. */
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
   * ── LES HUIT COULEURS DE L'ORDRE DE MISSION DIRECTEUR ────────────────────
   *
   * L'ODM du 18 août 2026 nomme la couleur et le signe de chaque mini-app :
   * DPE vert énergétique, Électricité jaune chaud, Gaz bleu profond, Amiante
   * violet minéral, Plomb terre, Termites orange chaud, ERP bleu gris,
   * Mesurage turquoise. Les valeurs viennent du prototype fourni dans le pack
   * (06_CODE), reprises telles quelles.
   *
   * LE FOND RESTE IVOIRE. « Le vert porte l'expertise, l'ivoire apporte la
   * lumière et la respiration ; les couleurs vives sont concentrées dans les
   * mini-apps et dans les données qui ont un sens métier. » Un fond coloré par
   * écran ferait l'arc-en-ciel décoratif que l'ODM refuse : la couleur d'un
   * univers vit dans son en-tête, ses pictogrammes et ses données, pas en
   * aplat sous le texte.
   *
   * Un écart assumé, et un seul : le jaune de l'Électricité ne tient que 1,31
   * sur l'ivoire, contre 3 pour les dix autres. L'assombrir en ferait un ocre
   * et trahirait le « jaune chaud » de l'ODM. Il ne porte jamais seul une
   * information — le nom de l'app est toujours écrit dessous, comme l'exige le
   * protocole qualité — et il remplit des surfaces larges, jamais un trait.
   *
   * ── Ce qui a précédé, et pourquoi c'est abandonné ────────────────────────
   *
   * Ils étaient bâtis sur des fonds clairs et chauds : rose pâle, sable, crème,
   * vert d'eau. La cliente a tranché : « du parchemin de chez tante Véro », « le
   * sable avec liséré bleu, ça fait vieux », « je ne veux pas du sable dominant ».
   *
   * Chaque écran repose donc sur le pétrole du produit, teinté à 8 % seulement
   * de sa propre couleur. Une seule famille, onze nuances — et c'est l'ACCENT
   * qui distingue les écrans, pas le fond. Un fond par écran aurait fait onze
   * produits.
   *
   * ── Ce que le fond sombre rend possible ──────────────────────────────────
   *
   * La couleur exacte de chaque app tient sur son fond. Sur
   * le rose pâle d'avant, il fallait l'assombrir jusqu'à #A33220 pour qu'il
   * s'écrive — et il devenait la brique qu'on nous reproche depuis le début.
   * C'est ce qui rend à chaque app sa couleur pleine.
   *
   * ── Comment ces valeurs ont été obtenues ─────────────────────────────────
   *
   * Calculées, pas choisies. Pour chaque univers : le fond est le pétrole
   * mélangé à 8 % de la couleur vive ; la surface, ce fond éclairci de 8 % de
   * crème ; l'accent, la couleur vive éclaircie jusqu'à tenir 4,5 sur la
   * surface. Quand une teinte est trop sombre pour remplir une barre — le brun
   * des termites à 2,1, le bleu ardoise du mesurage à 2,1 —, c'est ELLE qu'on
   * éclaircit jusqu'à 3:1, jamais le fond : la famille reste entière.
   *
   * Les sept couleurs A→G de l'arrêté ne bougent pas, ici comme ailleurs.
   */

  /* DPE — le vert énergétique, comme le spectre A→G de l'étiquette. */
  dpe: {
    fond: '#f7f6f2',
    surface: '#ffffff',
    texte: '#0a2b23',
    texteDoux: '#4a5a55',
    accentVif: '#649c4b',
    accent: '#2e6a35',
    surAccent: '#ffffff',
    trait: '#779576'
  },

  /* Électricité — le tableau technique, et son jaune de phase. */
  electricite: {
    /* Le jaune tient 7,3 sur le fond : il n'a besoin d'aucune version claire. */
    fond: '#f7f6f2',
    surface: '#ffffff',
    texte: '#0a2b23',
    texteDoux: '#4a5a55',
    accentVif: '#ffd45d',
    accent: '#7d550a',
    surAccent: '#ffffff',
    trait: '#779576'
  },

  /* Amiante — le violet du prélèvement en laboratoire. */
  amiante: {
    fond: '#f7f6f2',
    surface: '#ffffff',
    texte: '#0a2b23',
    texteDoux: '#4a5a55',
    accentVif: '#9884c8',
    accent: '#5b477e',
    surAccent: '#ffffff',
    trait: '#779576'
  },

  /* Plomb — le vert du réactif. */
  plomb: {
    fond: '#f7f6f2',
    surface: '#ffffff',
    texte: '#0a2b23',
    texteDoux: '#4a5a55',
    accentVif: '#b8825f',
    accent: '#70462f',
    surAccent: '#ffffff',
    trait: '#779576'
  },

  /* Gaz — la flamme de la chaudière. */
  gaz: {
    fond: '#f7f6f2',
    surface: '#ffffff',
    texte: '#0a2b23',
    texteDoux: '#4a5a55',
    accentVif: '#5c95b4',
    accent: '#245d7b',
    surAccent: '#ffffff',
    trait: '#779576'
  },

  /*
   * Termites — le bois.
   *
   * Le brun #A0522D ne tenait que 2,1 sur le fond : invisible dès qu'il
   * remplissait quelque chose. Éclairci jusqu'à 3:1, il reste un bois — un
   * bois chaud plutôt qu'une terre brûlée.
   */
  termites: {
    fond: '#f7f6f2',
    surface: '#ffffff',
    texte: '#0a2b23',
    texteDoux: '#4a5a55',
    accentVif: '#da721e',
    accent: '#a04107',
    surAccent: '#ffffff',
    trait: '#779576'
  },

  /* Risques — l'eau et la roche : le teal profond de la coupe géologique. */
  erp: {
    fond: '#f7f6f2',
    surface: '#ffffff',
    texte: '#0a2b23',
    texteDoux: '#4a5a55',
    accentVif: '#7193a8',
    accent: '#354f60',
    surAccent: '#ffffff',
    trait: '#779576'
  },

  /*
   * Surface — le bleu du plan d'architecte.
   *
   * C'est ici que se logeait le reproche le plus net : un fond crème avec des
   * filets bleu ardoise, « ça fait vieux ». Le plan se lit désormais en clair
   * sur fond sombre, comme un calque rétroéclairé.
   */
  carrez: {
    fond: '#f7f6f2',
    surface: '#ffffff',
    texte: '#0a2b23',
    texteDoux: '#4a5a55',
    accentVif: '#469c90',
    accent: '#216961',
    surAccent: '#ffffff',
    trait: '#779576'
  },

  /* Assainissement — l'eau, encore, mais celle qui s'en va. */
  assainissement: {
    fond: '#f7f6f2',
    surface: '#ffffff',
    texte: '#0a2b23',
    texteDoux: '#4a5a55',
    accentVif: '#5c95b4',
    accent: '#245d7b',
    surAccent: '#ffffff',
    trait: '#779576'
  },

  /*
   * Dicodiag — l'ouvrage de référence.
   *
   * On consulte, on ne subit pas : rien de ce qui est écrit ici ne parle de
   * votre bien. Sa rupture n'est plus dans la matière du fond — tous sont
   * sombres — mais dans son accent, le seul qui soit neutre : un bleu ardoise
   * quand les neuf autres portent une couleur de métier.
   */
  dicodiag: {
    fond: '#f7f6f2',
    surface: '#ffffff',
    texte: '#0a2b23',
    texteDoux: '#4a5a55',
    accentVif: '#729779',
    accent: '#12463b',
    surAccent: '#ffffff',
    trait: '#779576'
  },

  /* En clair — les réponses, dans le citron doux de l'accent. */
  'en-clair': {
    fond: '#f7f6f2',
    surface: '#ffffff',
    texte: '#0a2b23',
    texteDoux: '#4a5a55',
    accentVif: '#88963b',
    accent: '#586322',
    surAccent: '#ffffff',
    trait: '#779576'
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
    `--u-accent-vif:${u.accentVif}`,
    `--u-accent:${u.accent}`,
    `--u-sur-accent:${u.surAccent}`,
    `--u-trait:${u.trait}`
  ].join(';');
}
