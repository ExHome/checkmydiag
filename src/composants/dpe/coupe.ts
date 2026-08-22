/**
 * LA COUPE DU LOGEMENT — la géométrie du calque posé sur la table lumineuse.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CE QUE LE DESSIN DIT, ET POURQUOI IL NE PEUT PAS DIRE AUTRE CHOSE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Sur la table lumineuse, la source est DERRIÈRE. Ce qui est tracé n'est pas
 * une couleur posée sur un fond : c'est un endroit où la lumière s'arrête.
 *
 * Sur l'écran du DPE, et sur lui seul, cette lumière porte un nom : c'est la
 * CHALEUR. Un logement chauffé est une boîte pleine de lumière, et la seule
 * chose qui la retient est l'isolant. D'où la grammaire, en trois états et pas
 * un de plus, exactement calquée sur les trois valeurs de `EtatIsolation` :
 *
 *   isole      structure + MANTEAU PLEIN     la lumière s'arrête
 *   nonIsole   structure seule               la lumière traverse
 *   inconnu    structure + MANTEAU EN RAIES  la lumière passe par raies
 *
 * ── L'inversion à déclarer, sous peine de mensonge ─────────────────────────
 *
 * Ailleurs dans Verrière (`lumiere/calque.ts`), « la lumière ne passe pas »
 * signale une ANOMALIE. Ici c'est l'inverse : ce qui arrête la lumière est la
 * bonne nouvelle. La même image dirait donc deux choses opposées d'un écran à
 * l'autre — c'est un piège, et il ne se referme que d'une façon : l'écran
 * ÉNONCE sa clé avant qu'on lise le dessin (« Ici, la lumière, c'est la
 * chaleur »), et il n'emprunte AUCUN élément du vocabulaire des occlusions.
 *
 * C'est pourquoi l'écran ne passe aucune `Occlusion` à la table : la légende
 * automatique de `calque.ts` écrirait « le rapport relève quelque chose ici »
 * au-dessus d'un mur bien isolé.
 *
 * ── Pourquoi le manteau, et pas le mur ─────────────────────────────────────
 *
 * Première version, écartée : faire disparaître le mur quand il n'est pas
 * isolé. C'est faux. Le rapport n'écrit pas « il n'y a pas de mur », il écrit
 * « le rapport ne relève aucune isolation sur ce poste » — le mur existe, et il
 * laisse passer. La structure est donc TOUJOURS tracée, en trait fin ; seule
 * son épaisseur d'isolant varie. Ce qui change à l'écran est exactement ce qui
 * change dans le rapport.
 *
 * Et c'est vrai physiquement, ce qui n'est pas un hasard : un trait fin arrête
 * peu de lumière parce qu'une paroi nue arrête peu de chaleur.
 *
 * ── Les raies ne sont pas un motif choisi ──────────────────────────────────
 *
 * Leur pas vient de `lumiere/calque.ts` : 1,5 unité claire sur 4, soit 37,5 %
 * de lumière qui passe. La valeur est importée, jamais recopiée — si la
 * texture du « non contrôlé » change un jour ailleurs, elle change ici aussi.
 * C'est la seule chose que cet écran emprunte au vocabulaire des occlusions :
 * la TRAME, pas le sens.
 *
 * ── Ce que la géométrie ne fait pas ────────────────────────────────────────
 *
 * Elle ne représente pas le logement réel. Le modèle ne porte ni plan, ni
 * nombre de niveaux, ni orientation : `Isolation` n'a que quatre champs. Ce
 * dessin est donc une COUPE DE PRINCIPE, et l'écran l'écrit. Dessiner deux
 * étages parce que le bien est une maison serait inventer une donnée.
 */
import type { EtatIsolation, Isolation } from '../../lib/modele';
import { LARGEUR_HACHURE, PAS_HACHURE } from '../lumiere/calque';

/** Hauteur du plateau, dans le repère 0 0 100 H. */
export const HAUTEUR = 72;

/** Les quatre parois du DPE. Ce sont les clés de `Isolation`, pas d'autres. */
export type Paroi = keyof Isolation;

/**
 * L'ordre de lecture du dessin, de haut en bas.
 *
 * Il n'est pas alphabétique et ne suit pas l'ordre de déperdition supposé : il
 * suit la COUPE. On lit un bâtiment du toit vers le sol, et la légende doit
 * suivre le doigt.
 */
export const PAROIS: readonly Paroi[] = ['toit', 'murs', 'fenetres', 'plancher'];

/** Le nom de chaque paroi, dans les mots du produit. */
export const NOM_PAROI: Record<Paroi, string> = {
  toit: 'Toiture',
  murs: 'Murs',
  fenetres: 'Fenêtres',
  plancher: 'Plancher bas'
};

/**
 * LA STRUCTURE — toujours tracée, en trait fin. Elle affirme seulement qu'un
 * logement a un toit, des murs, des fenêtres et un plancher.
 *
 * Repère : apex du pignon (50 ; 6), sablières (9 ; 30) et (91 ; 30), faces
 * extérieures des murs en x = 16,5 et x = 83,5, baies de y = 34,5 à y = 41,5,
 * dalle en y = 47, terrain en y = 49,2.
 */
export const STRUCTURE: Record<Paroi, string> = {
  toit: 'M9 30 L50 6 L91 30',
  murs: 'M16.5 30 V34.5 M16.5 41.5 V47 M83.5 30 V34.5 M83.5 41.5 V47',
  /* Le linteau et l'appui débordent du mur : sans eux, une baie ressemble à un
     trou. Ils sont hors du manteau pour rester lisibles quand il est plein. */
  fenetres:
    'M16.5 34.5 V41.5 M83.5 34.5 V41.5 M13.6 34.5 H19.4 M13.6 41.5 H19.4 M80.6 34.5 H86.4 M80.6 41.5 H86.4',
  plancher: 'M13 47 H87'
};

/** Le terrain. Il n'appartient à aucune paroi et ne dit rien du rapport. */
export const TERRAIN = 'M2 49.2 H98';

/**
 * LE MANTEAU — l'isolant, tracé seulement quand le rapport en relève un (plein)
 * ou quand il n'en dit rien (en raies).
 *
 * Il court sur la face INTÉRIEURE de la structure, décalé de 2,6 unité : c'est
 * l'isolation par l'intérieur, la plus répandue en rénovation française. Au
 * faîtage le décalage est vertical et vaut 2,6 / cos α = 3,01, sans quoi les
 * deux rampants ne se rejoignent pas.
 */
export const MANTEAU: Record<Paroi, string> = {
  toit: 'M10.3 32.2 L50 9 L89.7 32.2',
  murs: 'M19.1 30.4 V34.5 M19.1 41.5 V46.6 M80.9 30.4 V34.5 M80.9 41.5 V46.6',
  /* Centré sur le plan du vitrage : une fenêtre isole DANS l'épaisseur du mur. */
  fenetres: 'M16.5 34.9 V41.1 M83.5 34.9 V41.1',
  /* Arrêté entre les faces intérieures des murs pour ne pas croiser les baies. */
  plancher: 'M20 44.6 H80'
};

/** Épaisseur du trait de structure, en unités de plateau. */
export const TRAIT_STRUCTURE = 0.85;
/** Épaisseur du manteau, en unités de plateau. */
export const TRAIT_MANTEAU = 4.4;

/**
 * Le pointillé du manteau incertain.
 *
 * `2.5 1.5` : période 4, part claire 1,5 — soit 37,5 % de lumière qui passe,
 * la même proportion que la hachure des zones non contrôlées. Les deux nombres
 * sont calculés depuis `calque.ts`, jamais écrits à la main.
 */
export const RAIES = `${PAS_HACHURE - LARGEUR_HACHURE} ${LARGEUR_HACHURE}`;

/** Ce qu'on trace pour une paroi, selon ce que le rapport en dit. */
export interface TraceParoi {
  paroi: Paroi;
  etat: EtatIsolation;
  /** La structure, toujours. */
  structure: string;
  /** Le manteau, ou `null` quand le rapport ne relève aucune isolation. */
  manteau: string | null;
  /** Le pointillé du manteau, ou `null` quand il est plein. */
  raies: string | null;
}

/**
 * Le tracé complet, paroi par paroi, pour un état d'isolation lu au rapport.
 *
 * Fonction pure et exhaustive : les quatre parois sortent toujours, dans
 * l'ordre de la coupe, et aucune ne peut sortir sans son état. C'est ce qui
 * rend la règle de fidélité vérifiable par un test plutôt que par une relecture
 * — `coupe.test.ts` s'assure qu'un `inconnu` ne peut jamais produire le même
 * tracé qu'un `isole`.
 */
export function tracerLaCoupe(isolation: Isolation): TraceParoi[] {
  return PAROIS.map((paroi) => {
    const etat = isolation[paroi];
    return {
      paroi,
      etat,
      structure: STRUCTURE[paroi],
      manteau: etat === 'nonIsole' ? null : MANTEAU[paroi],
      raies: etat === 'inconnu' ? RAIES : null
    };
  });
}

/**
 * Ce que la coupe montre, écrit en français, pour qui ne la voit pas.
 *
 * C'est le `titre` obligatoire de la table lumineuse. Il est CONSTRUIT à partir
 * des mêmes quatre valeurs que le dessin : impossible de le laisser dériver.
 * Aucune paroi n'est passée sous silence — celles dont le rapport ne dit rien
 * sont nommées comme telles, jamais rangées avec les bonnes.
 */
export function coupeEnMots(isolation: Isolation): string {
  const parmi = (e: EtatIsolation) => PAROIS.filter((p) => isolation[p] === e);
  const liste = (l: readonly Paroi[]) =>
    l
      .map((p) => NOM_PAROI[p].toLowerCase())
      .join(', ')
      .replace(/, ([^,]*)$/, ' et $1');

  const isoles = parmi('isole');
  const nus = parmi('nonIsole');
  const muets = parmi('inconnu');

  const phrases = ['Le logement en coupe de principe, toiture, murs, fenêtres et plancher bas.'];
  if (isoles.length)
    phrases.push(
      `Le rapport relève une isolation sur ${liste(isoles)} : la lumière s’y arrête.`
    );
  if (nus.length)
    phrases.push(
      `Il n’en relève aucune sur ${liste(nus)} : la lumière traverse.`
    );
  if (muets.length)
    phrases.push(
      `Il ne dit rien de ${liste(muets)} : la lumière n’y passe que par raies.`
    );
  return phrases.join(' ');
}

/**
 * Les trois clés de lecture, et seulement celles qui servent sur ce dossier.
 *
 * Une légende qui explique un état absent de l'écran apprend au lecteur à
 * chercher quelque chose qui n'y est pas. Elle est donc filtrée par les états
 * réellement présents.
 */
export const CLE: Record<EtatIsolation, string> = {
  isole: 'Trait épais : le rapport relève une isolation. La chaleur s’arrête.',
  nonIsole: 'Trait fin seul : le rapport ne relève aucune isolation. La chaleur traverse.',
  inconnu: 'Trait interrompu : le rapport ne dit rien de cette paroi.'
};

/** Les états réellement présents, dans l'ordre de la clé. */
export function clesUtiles(isolation: Isolation): EtatIsolation[] {
  const ordre: EtatIsolation[] = ['nonIsole', 'inconnu', 'isole'];
  return ordre.filter((e) => PAROIS.some((p) => isolation[p] === e));
}
