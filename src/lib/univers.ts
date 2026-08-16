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
   * Elle ne porte jamais de texte — le corail #ff6b5d ne tient que 2,59 sur le
   * rose du DPE — mais elle porte tout le reste : les aplats, les barres, les
   * pastilles, les dégradés, les bandeaux.
   *
   * Ce rôle manquait, et son absence se voyait. À force d'assombrir chaque
   * couleur pour qu'elle reste lisible, le produit était devenu rouge brique
   * là où il devait être corail. Séparer les deux rend sa vivacité à la marque
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
   * ── TOUS LES UNIVERS SONT SOMBRES, ET C'EST UNE DÉCISION ─────────────────
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
   * Le corail EXACT de la marque, #FF6B5D, tient 4,05 sur le fond du DPE. Sur
   * le rose pâle d'avant, il fallait l'assombrir jusqu'à #A33220 pour qu'il
   * s'écrive — et il devenait la brique qu'on nous reproche depuis le début.
   * Le fond sombre est ce qui rend son corail à la marque.
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

  /* DPE — le corail de la marque, enfin lisible tel quel. */
  dpe: {
    fond: '#223e49',
    surface: '#334c56',
    texte: '#f5f1e8',
    texteDoux: '#cbd8dd',
    accentVif: '#ff6b5d',
    accent: '#ffb4ac',
    surAccent: '#0c2f3a',
    trait: '#8c9899',
    sombre: true
  },

  /* Électricité — le tableau technique, et son jaune de phase. */
  electricite: {
    /* Le jaune tient 7,3 sur le fond : il n'a besoin d'aucune version claire. */
    fond: '#224648',
    surface: '#335455',
    texte: '#f5f1e8',
    texteDoux: '#cbd8dd',
    accentVif: '#ffd54f',
    accent: '#ffd54f',
    surAccent: '#0c2f3a',
    trait: '#909f9b',
    sombre: true
  },

  /* Amiante — le violet du prélèvement en laboratoire. */
  amiante: {
    fond: '#193f55',
    surface: '#2b4d61',
    texte: '#f5f1e8',
    texteDoux: '#cbd8dd',
    accentVif: '#8b7bf0',
    accent: '#cac2f8',
    surAccent: '#04161c',
    trait: '#87989f',
    sombre: true
  },

  /* Plomb — le vert du réactif. */
  plomb: {
    fond: '#134247',
    surface: '#255054',
    texte: '#f5f1e8',
    texteDoux: '#cbd8dd',
    accentVif: '#43a047',
    accent: '#acd5ae',
    surAccent: '#04161c',
    trait: '#849a98',
    sombre: true
  },

  /* Gaz — la flamme de la chaudière. */
  gaz: {
    fond: '#213e44',
    surface: '#324c51',
    texte: '#f5f1e8',
    texteDoux: '#cbd8dd',
    accentVif: '#f4701f',
    accent: '#fab88f',
    surAccent: '#0c2f3a',
    trait: '#899694',
    sombre: true
  },

  /*
   * Termites — le bois.
   *
   * Le brun #A0522D ne tenait que 2,1 sur le fond : invisible dès qu'il
   * remplissait quelque chose. Éclairci jusqu'à 3:1, il reste un bois — un
   * bois chaud plutôt qu'une terre brûlée.
   */
  termites: {
    fond: '#1b3c45',
    surface: '#2c4a52',
    texte: '#f5f1e8',
    texteDoux: '#cbd8dd',
    accentVif: '#b17153',
    accent: '#dbbdaf',
    surAccent: '#04161c',
    trait: '#869595',
    sombre: true
  },

  /* Risques — l'eau et la roche : le teal profond de la coupe géologique. */
  erp: {
    fond: '#0e404b',
    surface: '#204e58',
    texte: '#f5f1e8',
    texteDoux: '#cbd8dd',
    accentVif: '#179487',
    accent: '#9cd1cc',
    surAccent: '#04161c',
    trait: '#82999a',
    sombre: true
  },

  /*
   * Surface — le bleu du plan d'architecte.
   *
   * C'est ici que se logeait le reproche le plus net : un fond crème avec des
   * filets bleu ardoise, « ça fait vieux ». Le plan se lit désormais en clair
   * sur fond sombre, comme un calque rétroéclairé.
   */
  carrez: {
    fond: '#153e4c',
    surface: '#274c58',
    texte: '#f5f1e8',
    texteDoux: '#cbd8dd',
    accentVif: '#76839d',
    accent: '#bfc5d1',
    surAccent: '#04161c',
    trait: '#839698',
    sombre: true
  },

  /* Assainissement — l'eau, encore, mais celle qui s'en va. */
  assainissement: {
    fond: '#0e404b',
    surface: '#204e58',
    texte: '#f5f1e8',
    texteDoux: '#cbd8dd',
    accentVif: '#179487',
    accent: '#9cd1cc',
    surAccent: '#04161c',
    trait: '#82999a',
    sombre: true
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
    fond: '#153e4c',
    surface: '#274c58',
    texte: '#f5f1e8',
    texteDoux: '#cbd8dd',
    accentVif: '#76839d',
    accent: '#bfc5d1',
    surAccent: '#04161c',
    trait: '#839698',
    sombre: true
  },

  /* En clair — les réponses, dans le corail de la marque. */
  'en-clair': {
    fond: '#223e49',
    surface: '#334c56',
    texte: '#f5f1e8',
    texteDoux: '#cbd8dd',
    accentVif: '#ff6b5d',
    accent: '#ffb4ac',
    surAccent: '#0c2f3a',
    trait: '#8c9899',
    sombre: true
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
