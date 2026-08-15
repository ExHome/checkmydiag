/**
 * L'identité de chaque diagnostic : sa couleur, son nom court, son signe.
 *
 * Source unique. La grille de l'accueil et l'écran ouvert y puisent tous les
 * deux — deux listes finiraient par diverger, et le lecteur verrait une icône
 * d'une couleur ouvrir un écran d'une autre.
 *
 * ── La charte, et rien d'autre ──────────────────────────────────────────────
 *
 * Trois couleurs : bleu pétrole #1A4D5C, sable #F4E8D8, corail #FF6B5D. Les
 * neuf applications se distinguent par des nuances de ces trois-là, jamais par
 * une teinte importée. Une version précédente donnait à chaque application sa
 * propre couleur — violet, vert, marron, turquoise, jaune : c'était joli et
 * c'était faux. Une marque tient à trois couleurs tenues partout.
 *
 * La nuance n'est pas décorative, elle dit la famille du diagnostic :
 *
 *   corail   — ce que le logement coûte, et ce qui peut blesser
 *   pétrole  — ce qu'on respire ou touche, le bâti, ce qui se mesure
 *
 * Le sable, lui, ne sert à aucune icône : c'est le fond de l'écran. Une icône
 * sable posée sur un fond sable ne se voit pas — ce serait respecter la charte
 * à la lettre et la trahir à l'œil.
 *
 * Deux applications d'une même famille partagent donc un air de famille, et
 * l'émoji plus le libellé font le reste. C'est l'inverse d'un arc-en-ciel où
 * chaque couleur ne voudrait rien dire.
 *
 * Ce fichier ne porte aucune information de diagnostic : que du décor. Ce que
 * le rapport dit vient du moteur, jamais d'ici.
 */
import type { TypeDiag } from './modele';

export interface IdentiteApp {
  /** Le nom sous l'icône. Les intitulés officiels ne tiennent pas en 76 px. */
  nom: string;
  /** La couleur de l'application, pour les aplats — icône, dégradés. */
  teinte: string;
  /**
   * Sa version foncée : tout ce qui porte du texte, ou trace un trait porteur
   * de sens. Choisie pour tenir 4,5 de contraste sur le sable comme sur le
   * blanc — un accent qu'on ne lit pas n'accentue rien.
   */
  teinteFoncee: string;
  /** Le dégradé de l'icône, tiré de la même couleur. */
  degrade: string;
  /** Le signe de l'icône : il dit la matière qu'on cherche. */
  signe: string;
}

/*
 * Les émoji disent la matière, pas le danger.
 *
 * Le plomb est dans les peintures, les termites dans le bois : c'est ce qu'on
 * dessine. Le brief proposait un symbole de radioactivité pour le plomb — il
 * n'est pas radioactif, et une icône fausse enseigne quelque chose de faux
 * avant même qu'on ait ouvert l'écran.
 */
export const APPS: Record<TypeDiag, IdentiteApp> = {
  /* ── Corail : ce que le logement coûte, et ce qui peut blesser ──────────── */
  dpe: {
    nom: 'DPE',
    signe: '📊',
    teinte: '#ff6b5d',
    teinteFoncee: '#a33220',
    degrade: 'linear-gradient(135deg, #ff8578, #f0503c)'
  },
  electricite: {
    nom: 'Électricité',
    signe: '⚡',
    teinte: '#ff9084',
    teinteFoncee: '#a33220',
    degrade: 'linear-gradient(135deg, #ffa79d, #ff6b5d)'
  },
  gaz: {
    nom: 'Gaz',
    signe: '🔥',
    teinte: '#d0402c',
    teinteFoncee: '#8f2b1b',
    degrade: 'linear-gradient(135deg, #e05038, #a33220)'
  },

  /* ── Bleu pétrole : ce qu'on respire, le bâti, ce qui se mesure ─────────── */
  amiante: {
    nom: 'Amiante',
    signe: '🧱',
    teinte: '#1a4d5c',
    teinteFoncee: '#0f3a47',
    degrade: 'linear-gradient(135deg, #26647a, #0f3a47)'
  },
  plomb: {
    nom: 'Plomb',
    signe: '🎨',
    teinte: '#2a6577',
    teinteFoncee: '#164452',
    degrade: 'linear-gradient(135deg, #2a6577, #0f3a47)'
  },
  termites: {
    nom: 'Termites',
    signe: '🪵',
    teinte: '#3d8296',
    teinteFoncee: '#1a4d5c',
    degrade: 'linear-gradient(135deg, #3d8296, #1a4d5c)'
  },
  erp: {
    nom: 'Risques',
    signe: '🌍',
    teinte: '#4e97ac',
    teinteFoncee: '#1a4d5c',
    degrade: 'linear-gradient(135deg, #4e97ac, #2a6577)'
  },
  assainissement: {
    nom: 'Assainissement',
    signe: '💧',
    teinte: '#2a6577',
    teinteFoncee: '#0f3a47',
    /* Le dégradé remonte, là où les autres descendent : c'est ce qui le
       distingue du plomb, à teinte presque égale. */
    degrade: 'linear-gradient(135deg, #1a4d5c, #4e97ac)'
  },
  carrez: {
    nom: 'Surface',
    signe: '📐',
    teinte: '#5aa8bd',
    teinteFoncee: '#1a4d5c',
    degrade: 'linear-gradient(135deg, #5aa8bd, #3d8296)'
  }
};
