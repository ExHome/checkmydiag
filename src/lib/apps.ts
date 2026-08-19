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
 * vert du socle. La barre de l'écran, les boutons, les traits, les plans —
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
   * Le pictogramme dessiné, dans `public/pictos/`.
   *
   * Les émoji ont tenu le temps de la maquette, mais ils ne sont pas de la
   * marque : leur dessin change d'un système à l'autre, leur couleur ne se
   * commande pas, et sur un dégradé saturé ils rendent une vignette
   * multicolore là où le visuel de référence montre un trait crème net.
   *
   * L'émoji reste comme secours : si le fichier manque, l'icône garde un signe
   * plutôt que de rester vide.
   */
  picto?: string;
  /**
   * Le dégradé de l'icône, tel que le pack maître le fournit.
   *
   * Ce n'est plus un choix libre : l'ordre de mission directeur assigne une
   * couleur à chacune des huit mini-apps — DPE vert énergétique, Électricité
   * jaune chaud, Gaz bleu profond, Amiante violet minéral, Plomb terre,
   * Termites orange chaud, ERP bleu gris, Mesurage turquoise — et le prototype
   * du pack en donne les valeurs. Elles sont reprises telles quelles.
   *
   * C'est le seul endroit du produit où la couleur vive est chez elle. Partout
   * ailleurs, l'ODM la réserve aux données qui ont un sens métier.
   */
  degrade: string;
}

/*
 * Le pictogramme dit la matière, pas le danger.
 *
 * Le plomb est dans les peintures, les termites dans le bois : c'est ce qu'on
 * dessine. Le brief proposait un symbole de radioactivité pour le plomb — il
 * n'est pas radioactif, et une icône fausse enseigne quelque chose de faux
 * avant même qu'on ait ouvert l'écran.
 *
 * Les signes de l'ODM directeur, un par app : spectre A→G, éclair, flamme,
 * « a » de l'amiante, « Pb » du plomb, termite, bâtiment sous bouclier, cadre
 * de mesure. Ils sont dessinés au trait crème dans `public/pictos/`, jamais en
 * couleur : la couleur vient du dégradé de l'icône.
 */
export const APPS: Record<TypeDiag, IdentiteApp> = {
  dpe: {
    nom: 'DPE',
    signe: '📊',
    picto: 'dpe',
    degrade: 'linear-gradient(145deg, #9dc65b, #357a3d)'
  },
  electricite: {
    nom: 'Électricité',
    signe: '⚡',
    picto: 'electricite',
    degrade: 'linear-gradient(145deg, #ffd45d, #e39b13)'
  },
  amiante: {
    nom: 'Amiante',
    signe: '🧱',
    picto: 'amiante',
    degrade: 'linear-gradient(145deg, #9a86ca, #5b477e)'
  },
  plomb: {
    nom: 'Plomb',
    signe: '🎨',
    picto: 'plomb',
    degrade: 'linear-gradient(145deg, #c58d68, #70462f)'
  },
  gaz: {
    nom: 'Gaz',
    signe: '🔥',
    picto: 'gaz',
    degrade: 'linear-gradient(145deg, #77b1d0, #245d7b)'
  },
  termites: {
    nom: 'Termites',
    signe: '🪵',
    picto: 'termites',
    degrade: 'linear-gradient(145deg, #ff9c34, #b64a08)'
  },
  erp: {
    nom: 'Risques',
    signe: '🌍',
    picto: 'erp',
    degrade: 'linear-gradient(145deg, #7395aa, #354f60)'
  },
  /* Les deux dernières ne figurent pas au brief : elles prolongent la même
     logique — une couleur franche, distincte des sept autres. */
  carrez: {
    nom: 'Surface',
    signe: '📐',
    picto: 'carrez',
    degrade: 'linear-gradient(145deg, #74c7b8, #287f75)'
  },
  assainissement: {
    nom: 'Assainissement',
    signe: '💧',
    degrade: 'linear-gradient(145deg, #77b1d0, #245d7b)'
  }
};
