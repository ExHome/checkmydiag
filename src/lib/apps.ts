/**
 * L'identité de chaque diagnostic : son icône, son nom court, son signe.
 *
 * Source unique. La grille de l'accueil et l'écran ouvert y puisent tous les
 * deux — deux listes finiraient par diverger, et le lecteur verrait une icône
 * d'une couleur ouvrir un écran d'une autre.
 *
 * ── Où la couleur est libre, et où elle ne l'est pas ────────────────────────
 *
 * **Les icônes sont libres.** Neuf applications, neuf couleurs : c'est ce qui
 * permet de retrouver la sienne d'un coup d'œil sur la grille, comme sur un
 * téléphone. Elles ne suivent pas la charte, et c'est voulu.
 *
 * **Tout le reste suit la charte** : bleu pétrole #1A4D5C, sable #F4E8D8,
 * corail #FF6B5D. La barre de l'écran, les boutons, les traits, les plans —
 * rien de tout cela ne prend la couleur de l'application. Une icône violette
 * ouvre donc un écran à la charte, avec sa propre icône en petit dans la barre.
 *
 * La frontière est nette : ce fichier ne donne qu'un dégradé d'icône. Aucune
 * autre partie de l'interface n'a de raison d'y puiser une couleur.
 *
 * Ce fichier ne porte aucune information de diagnostic : que du décor. Ce que
 * le rapport dit vient du moteur, jamais d'ici.
 */
import type { TypeDiag } from './modele';

export interface IdentiteApp {
  /** Le nom sous l'icône. Les intitulés officiels ne tiennent pas en 76 px. */
  nom: string;
  /** Le signe de l'icône : il dit la matière qu'on cherche. */
  signe: string;
  /**
   * Le dégradé de l'icône. Libre — c'est le seul endroit du produit où une
   * couleur hors charte est admise, parce que c'est ce qui rend les neuf
   * applications reconnaissables au premier regard.
   */
  degrade: string;
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
  dpe: {
    nom: 'DPE',
    signe: '📊',
    degrade: 'linear-gradient(135deg, #ff6b5d, #f05844)'
  },
  electricite: {
    nom: 'Électricité',
    signe: '⚡',
    degrade: 'linear-gradient(135deg, #ffd54a, #f5a800)'
  },
  amiante: {
    nom: 'Amiante',
    signe: '🧱',
    degrade: 'linear-gradient(135deg, #7b68ee, #5a4bc4)'
  },
  plomb: {
    nom: 'Plomb',
    signe: '🎨',
    degrade: 'linear-gradient(135deg, #4caf50, #38913c)'
  },
  gaz: {
    nom: 'Gaz',
    signe: '🔥',
    degrade: 'linear-gradient(135deg, #ff8c42, #ee6a17)'
  },
  termites: {
    nom: 'Termites',
    signe: '🪵',
    degrade: 'linear-gradient(135deg, #a0522d, #7a3d1f)'
  },
  erp: {
    nom: 'Risques',
    signe: '🌍',
    degrade: 'linear-gradient(135deg, #20b2aa, #00776f)'
  },
  /* Les deux dernières ne figurent pas au brief : elles prolongent la même
     logique — une couleur franche, distincte des sept autres. */
  carrez: {
    nom: 'Surface',
    signe: '📐',
    degrade: 'linear-gradient(135deg, #5c6bc0, #3949ab)'
  },
  assainissement: {
    nom: 'Assainissement',
    signe: '💧',
    degrade: 'linear-gradient(135deg, #29b6f6, #0288d1)'
  }
};
