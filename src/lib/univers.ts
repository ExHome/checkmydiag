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

export const UNIVERS: Partial<Record<TypeDiag, Univers>> = {
  /*
   * DPE — le sable de la marque, tel quel.
   *
   * Seul univers qui ne s'écarte pas de la charte, et c'est voulu : l'étiquette
   * A→G y règne, avec ses sept couleurs d'arrêté. Ajouter une teinte de plus
   * ferait trois échelles chromatiques concurrentes sur le même écran.
   */
  dpe: {
    fond: '#f4e8d8',
    surface: '#ffffff',
    texte: '#1a4d5c',
    texteDoux: '#555555',
    /* Le corail vif ne tient que 2,8 sous du blanc : c'est le corail foncé de
       la charte qui porte les aplats. */
    accent: '#d0402c',
    surAccent: '#ffffff',
    trait: '#e8dcc8'
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
export function estSombre(type: TypeDiag): boolean {
  return UNIVERS[type]?.sombre === true;
}

/** Les jetons CSS d'un univers, prêts pour un attribut `style`. */
export function styleUnivers(type: TypeDiag): string {
  const u = UNIVERS[type];
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
