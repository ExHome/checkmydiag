/**
 * LE PARCOURS — la géométrie du câble, calculée et non dessinée à la main.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * POURQUOI UN MODULE ET PAS UN `d=` DANS LE COMPOSANT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * La révélation de cet écran est une lumière qui REMONTE LE CÂBLE et s'arrête
 * à l'anomalie. Pour l'arrêter au bon endroit il faut connaître la distance
 * parcourue depuis l'entrée jusqu'à chaque maillon — en unités du tracé, pas
 * en pixels.
 *
 * On pourrait la mesurer à l'exécution avec `getTotalLength()` : ce serait une
 * mesure du DOM, donc invérifiable en test, différente d'un moteur à l'autre,
 * et indisponible avant la première peinture. Ici le tracé n'est fait que de
 * segments droits : les distances se calculent exactement, en TypeScript, et
 * `parcours.test.ts` les vérifie au dixième.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * LES SIX MAILLONS, ET POURQUOI SIX
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Six, parce que c'est le nombre que le produit écrit déjà partout ailleurs :
 * `analyse/securite.ts` dit « il contrôle six points de sécurité » dans son
 * explication, et « sur les six domaines contrôlés » dans son verdict. Un
 * schéma qui en montrerait sept contredirait le texte affiché juste à côté.
 *
 * Les noms sont ceux de `THEMES_ELEC` (securite.ts), mot pour mot. Ce ne sont
 * pas des libellés inventés pour le dessin : ce sont les intitulés que le
 * rapport imprime.
 *
 * Conséquence sur les mécanismes : `contactDirect` et `enveloppe` tombent tous
 * deux sur le SIXIÈME maillon, celui du matériel. Ce n'est pas un raccourci de
 * mise en page, c'est la norme : le boîtier et la pièce sous tension qu'il
 * enferme sont le même domaine. Le dessin le montre littéralement — une boîte,
 * et une âme à l'intérieur. Le boîtier cassé perce la boîte ; le contact direct
 * efface l'âme.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * LA ROUTE, ET SES RETOURS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * La lumière visite les six maillons dans l'ordre de la norme. Deux d'entre eux
 * sont au bout d'une dérivation — la terre descend, la salle d'eau monte — donc
 * la route y descend et REMONTE par le même segment. C'est voulu et c'est juste :
 * une prise de terre est un cul-de-sac, et voir la lumière y plonger puis
 * revenir dit exactement ce qu'est un conducteur de protection.
 *
 * Le tracé STATIQUE, lui, ne repasse jamais deux fois au même endroit : un
 * pointillé tracé deux fois sur le même segment produit deux rythmes décalés et
 * salit le trait. D'où deux chaînes distinctes — `D_RESEAU` pour ce qu'on voit,
 * `D_PARCOURS` pour ce qui bouge.
 */
import type { Mecanisme } from '../../lib/analyse/mecanisme';

/** Les six domaines contrôlés, dans l'ordre de l'arrêté. */
export type Maillon =
  | 'coupure'
  | 'differentiel'
  | 'terre'
  | 'surintensite'
  | 'salleDeau'
  | 'materiel';

/** Le repère du plateau. 100 de large, 64 de haut. */
export const LARGEUR = 100;
export const HAUTEUR = 64;

/**
 * LA ZONE LIBRE — la moitié haut-gauche du plateau.
 *
 * Le grand chiffre s'y pose, en ivoire, sur le fond nu. Aucun trait de cuivre
 * n'a le droit d'y entrer : l'ivoire sur le cuivre plein ne tient que 1,7:1,
 * et un chiffre illisible est le seul défaut qu'un écran de diagnostic n'a
 * pas le droit d'avoir. Ce n'est pas une intention de mise en page, c'est une
 * contrainte, et `electricite.test.ts` la vérifie sur chaque segment.
 */
export const ZONE_CHIFFRE = { x: 0, y: 0, largeur: 66, hauteur: 30 } as const;

/** Les intitulés de `THEMES_ELEC` (analyse/securite.ts), repris mot pour mot. */
export const NOMS: Record<Maillon, string> = {
  coupure: 'Coupure d’urgence',
  differentiel: 'Protection différentielle',
  terre: 'Mise à la terre',
  surintensite: 'Protection des circuits',
  salleDeau: 'Salle d’eau',
  materiel: 'Matériel vétuste ou dangereux'
};

/**
 * Où chaque mécanisme se pose sur la chaîne.
 *
 * Ce qui n'y figure pas n'est pas placé — et c'est le cas le plus important de
 * la table. Mesuré sur le corpus : 6 des 29 anomalies électriques reçoivent de
 * `mecanismeDe()` un mécanisme qui n'appartient pas à la chaîne électrique (3
 * `general`, 3 `combustion`, ce dernier étant une erreur de classement du
 * moteur, qu'on n'a pas le droit de corriger ici). Les dessiner sur un maillon
 * serait affirmer une localisation que rien ne soutient. Elles vont donc sur
 * une marque DÉTACHÉE du câble, et la légende le dit.
 */
const MAILLON_DE: Partial<Record<Mecanisme, Maillon>> = {
  coupure: 'coupure',
  differentiel: 'differentiel',
  terre: 'terre',
  surintensite: 'surintensite',
  salleDeau: 'salleDeau',
  contactDirect: 'materiel',
  enveloppe: 'materiel'
};

export function maillonDe(mecanisme: Mecanisme): Maillon | null {
  return MAILLON_DE[mecanisme] ?? null;
}

/**
 * Les deux mécanismes que le dossier demande de traiter en premier.
 *
 * Ce n'est pas un jugement de ce composant : `analyse/securite.ts` l'écrit
 * déjà dans `aFaire`, et l'écran ne fait que compter — « Traitez en priorité
 * l'absence de dispositif différentiel 30 mA et les défauts de mise à la
 * terre : ce sont les deux points qui protègent les personnes. »
 */
export const PRIORITAIRES: readonly Mecanisme[] = ['differentiel', 'terre'];

interface Sommet {
  x: number;
  y: number;
  maillon?: Maillon;
}

/**
 * La route de la lumière. Aller-retour sur les deux dérivations.
 *
 *   y = 16   les départs : la salle d'eau, le matériel
 *   y = 38   la barre du tableau
 *   y = 52   l'arrivée, et la terre
 */
const ROUTE: readonly Sommet[] = [
  { x: -4, y: 52 }, // l'arrivée entre par le bord de l'écran
  { x: 14, y: 52 },
  { x: 14, y: 38 }, // elle monte au tableau
  { x: 22, y: 38, maillon: 'coupure' },
  { x: 36, y: 38, maillon: 'differentiel' },
  { x: 44, y: 38 }, // la borne de terre
  { x: 44, y: 52, maillon: 'terre' },
  { x: 44, y: 38 }, // et l'on remonte : la terre est un cul-de-sac
  { x: 56, y: 38, maillon: 'surintensite' },
  { x: 72, y: 38 },
  { x: 72, y: 16 },
  { x: 78, y: 16, maillon: 'salleDeau' },
  { x: 72, y: 16 },
  { x: 72, y: 38 },
  { x: 88, y: 38 },
  { x: 88, y: 16, maillon: 'materiel' } // l'âme, dans son boîtier
];

export interface Station {
  cle: Maillon;
  nom: string;
  /** Le rang du domaine dans l'arrêté, 1 à 6. */
  rang: number;
  x: number;
  y: number;
  /** Distance depuis l'entrée du câble, le long de la route. */
  distance: number;
}

function construire(): { stations: Station[]; longueur: number; d: string } {
  const stations: Station[] = [];
  let longueur = 0;
  let d = '';
  let rang = 0;

  for (const [i, s] of ROUTE.entries()) {
    const avant = ROUTE[i - 1];
    if (avant) longueur += Math.hypot(s.x - avant.x, s.y - avant.y);
    d += `${i === 0 ? 'M' : 'L'}${s.x} ${s.y}`;
    if (i < ROUTE.length - 1) d += ' ';
    if (s.maillon) {
      rang += 1;
      stations.push({
        cle: s.maillon,
        nom: NOMS[s.maillon],
        rang,
        x: s.x,
        y: s.y,
        distance: Math.round(longueur * 100) / 100
      });
    }
  }

  return { stations, longueur: Math.round(longueur * 100) / 100, d };
}

const CONSTRUIT = construire();

/** Les six maillons, avec leur distance le long de la route. */
export const STATIONS: readonly Station[] = CONSTRUIT.stations;
/** Longueur totale de la route, en unités du plateau. */
export const LONGUEUR = CONSTRUIT.longueur;
/** Le tracé que suit la lumière — avec ses retours. */
export const D_PARCOURS = CONSTRUIT.d;

export function station(cle: Maillon): Station {
  const s = STATIONS.find((x) => x.cle === cle);
  /* Impossible par construction : les six clés viennent du même type. Le jeter
     plutôt que renvoyer un point (0,0) — une marque au coin de l'écran serait
     un défaut silencieux, exactement le genre qu'on vient de passer une
     journée à traquer. */
  if (!s) throw new Error(`maillon inconnu : ${cle}`);
  return s;
}

/**
 * LE RÉSEAU VISIBLE — sans aucun retour, pour que les raies aient un seul
 * rythme. Trois sous-tracés : le tronc, la descente de terre, le départ de la
 * salle d'eau.
 */
export const D_RESEAU = 'M-4 52 H14 V38 H88 V16 M44 38 V52 M72 38 V16 H78';

/** Le symbole de terre : trois barres qui décroissent. Universel, non négociable. */
export const D_TERRE = 'M38.5 55 H49.5 M40.5 57.5 H47.5 M42.3 60 H45.7';

/** Le boîtier du matériel : la boîte qui tient les doigts à distance de l'âme. */
export const BOITIER = { x: 80, y: 8, largeur: 16, hauteur: 16, rayon: 1.6 } as const;

/** La marque détachée : un point que le rapport signale sans qu'on sache où. */
export const D_DETACHE = 'M62 49 L65 52 L62 55 L59 52 Z';
export const DETACHE = { x: 62, y: 52 } as const;

/** Rayon d'un maillon allumé. */
export const RAYON_MAILLON = 2.4;
/** Rayon du trou noir qui remplace un maillon interrompu. */
export const RAYON_COUPURE = 3.6;
/** L'entaille dans le boîtier, quand c'est l'enveloppe qui est en cause. */
export const ENTAILLE_BOITIER = { x: 88.5, y: 19.5, largeur: 9, hauteur: 7 } as const;

/**
 * Où la braise se pose, pour chaque genre d'interruption.
 *
 * Ce n'est pas le centre du maillon dans tous les cas : quand c'est le BOÎTIER
 * qui est percé, la braise est au bord de la boîte, pas au milieu de l'âme.
 */
export function foyer(maillon: Maillon | null, boitier: boolean): { x: number; y: number } {
  if (!maillon) return { x: DETACHE.x, y: DETACHE.y };
  if (boitier) return { x: 93, y: 23 };
  const s = station(maillon);
  return { x: s.x, y: s.y };
}
