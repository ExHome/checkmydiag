/**
 * L'identité de chaque diagnostic : sa couleur, son nom court, son signe.
 *
 * Source unique. La grille de l'accueil et l'écran ouvert y puisent tous les
 * deux — deux listes finiraient par diverger, et le lecteur verrait une icône
 * violette ouvrir un écran vert.
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
  /** La couleur de l'application : icône, barre, accents de l'écran. */
  teinte: string;
  /** Sa version foncée, pour ce qui porte du texte blanc. */
  teinteFoncee: string;
  /** Le dégradé de l'icône. */
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
    teinte: '#ff6b5d',
    teinteFoncee: '#a33220',
    degrade: 'linear-gradient(135deg, #ff6b5d, #f05844)'
  },
  electricite: {
    nom: 'Électricité',
    signe: '⚡',
    teinte: '#ffd54a',
    teinteFoncee: '#7a5b00',
    degrade: 'linear-gradient(135deg, #ffd54a, #f5a800)'
  },
  amiante: {
    nom: 'Amiante',
    signe: '🧱',
    teinte: '#7b68ee',
    teinteFoncee: '#4a3c9e',
    degrade: 'linear-gradient(135deg, #7b68ee, #5a4bc4)'
  },
  plomb: {
    nom: 'Plomb',
    signe: '🎨',
    teinte: '#4caf50',
    teinteFoncee: '#2c6e2f',
    degrade: 'linear-gradient(135deg, #4caf50, #38913c)'
  },
  gaz: {
    nom: 'Gaz',
    signe: '🔥',
    teinte: '#ff8c42',
    teinteFoncee: '#9c4a05',
    degrade: 'linear-gradient(135deg, #ff8c42, #ee6a17)'
  },
  termites: {
    nom: 'Termites',
    signe: '🪵',
    teinte: '#a0522d',
    teinteFoncee: '#6d3419',
    degrade: 'linear-gradient(135deg, #a0522d, #7a3d1f)'
  },
  erp: {
    nom: 'Risques',
    signe: '🌍',
    teinte: '#20b2aa',
    teinteFoncee: '#00615c',
    degrade: 'linear-gradient(135deg, #20b2aa, #00776f)'
  },
  carrez: {
    nom: 'Surface',
    signe: '📐',
    teinte: '#5c6bc0',
    teinteFoncee: '#31399c',
    degrade: 'linear-gradient(135deg, #5c6bc0, #3949ab)'
  },
  assainissement: {
    nom: 'Assainissement',
    signe: '💧',
    teinte: '#29b6f6',
    teinteFoncee: '#01579b',
    degrade: 'linear-gradient(135deg, #29b6f6, #0288d1)'
  }
};
