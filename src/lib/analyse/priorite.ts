/**
 * PAR OÙ COMMENCER — chaque travail recommandé, relié à ce qu'il touche.
 *
 * ── La question à laquelle ce module répond ─────────────────────────────────
 *
 * Le rapport recommande quatre travaux et donne un prix par pack. Il ne dit
 * jamais lequel rapporte le plus. La maquette proposait une colonne « économie
 * estimée ~ 320 € / an » : ce chiffre n'existe nulle part — ni dans les
 * vingt-six rapports lus, ni dans la base de l'ADEME, où les champs `economie`,
 * `gain` et `travaux` sont absents. On ne l'inventera pas.
 *
 * On répond donc à la même question avec deux données réelles, croisées :
 *
 *   « Isoler les murs » ← le rapport
 *   « vise R > 3,7 m².K/W » ← le rapport
 *   « agit sur 27,1 % des pertes » ← la fiche ADEME du même DPE
 *
 * Le croisement est de l'arithmétique sur deux valeurs lues. Ni le PDF ni
 * l'ADEME ne donnent ce lien : c'est Verrière qui l'établit, et c'est là qu'elle
 * sert à quelque chose.
 *
 * ── Ce qui n'a PAS de part de déperdition, et pourquoi c'est une information ─
 *
 * Changer une chaudière ne réduit aucune déperdition : le logement perd toujours
 * autant, on change seulement la façon dont on compense. Un travail sur le
 * chauffage ou l'eau chaude n'a donc pas de part, et l'écran doit le **dire**
 * plutôt que laisser une case vide — une case vide se lit comme « on ne sait
 * pas », alors qu'ici on sait très bien.
 *
 * ── Trois états, jamais deux ────────────────────────────────────────────────
 *
 * `part` : un nombre quand on l'a · `null` quand la fiche ADEME manque ·
 * `'hors enveloppe'` quand le travail ne touche pas l'enveloppe. Les confondre
 * ferait passer une certitude pour une ignorance.
 */
import type { PosteDeperditionChiffre } from '../ademe/consultation';
import type { Enveloppe, Paroi } from './enveloppe';
import type { PackTravaux, Recommandation } from './travaux';

/** Ce qu'un travail touche, du côté des pertes. */
export type Portee =
  | { genre: 'part'; part: number; poste: string }
  | { genre: 'hors enveloppe' }
  | { genre: 'inconnue' };

export interface TravailPriorise {
  /** Le pack d'où il vient — on garde la hiérarchie du rapport. */
  pack: string;
  priorite: 1 | 2;
  montantDuPack: string | null;
  lot: string | null;
  description: string;
  performance: string | null;
  portee: Portee;
  /** Les parois du logement que ce travail concerne, telles que lues. */
  parois: Paroi[];
}

/**
 * Quel poste de déperdition un lot touche.
 *
 * Les noms de gauche sont ceux que le rapport imprime dans sa colonne « Lot » ;
 * ceux de droite, les postes de la fiche ADEME. « Portes et fenêtres » couvre
 * deux postes à la fois : on les additionne, ce qui reste une somme de valeurs
 * lues.
 */
const LOT_VERS_POSTES: [RegExp, string[]][] = [
  [/^murs?$/i, ['Les murs']],
  [/^portes? et fen[êe]tres$/i, ['Les fenêtres', 'Les portes']],
  [/^fen[êe]tres$/i, ['Les fenêtres']],
  [/^portes?$/i, ['Les portes']],
  [/^(toiture|plafond|plancher haut|combles)/i, ['Le plafond, la toiture']],
  [/^plancher bas$/i, ['Le plancher bas']],
  [/^ventilation$/i, ['Le renouvellement d’air']]
];

/**
 * Les lots qui ne touchent aucune déperdition.
 *
 * Ce n'est pas un manque de données : c'est la physique du bâtiment. On le
 * distingue donc de « on ne sait pas ».
 */
const HORS_ENVELOPPE = /^(chauffage|eau chaude sanitaire|climatisation|refroidissement|production d)/i;

/** Quelles parois du logement ce lot concerne, d'après ce qu'on a lu. */
const LOT_VERS_PAROIS: [RegExp, (p: Paroi) => boolean][] = [
  [/^murs?$/i, (p) => p.famille === 'mur'],
  [/^(toiture|plafond|plancher haut|combles)/i, (p) => p.famille === 'plancherHaut'],
  [/^plancher bas$/i, (p) => p.famille === 'plancherBas'],
  [/^portes?$/i, (p) => p.famille === 'porte']
];

export function porteeDuLot(lot: string | null, chiffres: PosteDeperditionChiffre[]): Portee {
  if (!lot) return { genre: 'inconnue' };
  if (HORS_ENVELOPPE.test(lot.trim())) return { genre: 'hors enveloppe' };
  if (chiffres.length === 0) return { genre: 'inconnue' };

  for (const [motif, postes] of LOT_VERS_POSTES) {
    if (!motif.test(lot.trim())) continue;
    const concernes = chiffres.filter((c) => postes.includes(c.poste));
    if (concernes.length === 0) return { genre: 'inconnue' };
    return {
      genre: 'part',
      part: concernes.reduce((n, c) => n + c.part, 0),
      poste: concernes.map((c) => c.poste).join(' et ')
    };
  }
  return { genre: 'inconnue' };
}

function paroisDuLot(lot: string | null, enveloppe: Enveloppe): Paroi[] {
  if (!lot) return [];
  for (const [motif, garde] of LOT_VERS_PAROIS) {
    if (motif.test(lot.trim())) return enveloppe.parois.filter(garde);
  }
  return [];
}

/**
 * Range les travaux du rapport par ce qu'ils touchent.
 *
 * **L'ordre du rapport est conservé à l'intérieur de chaque pack** : c'est lui
 * qui hiérarchise, et il l'a fait avec les seuils réglementaires. On n'ajoute
 * qu'une lecture — combien pèse le poste visé — sans réordonner ce qu'un
 * diagnostiqueur a ordonné.
 */
export function prioriserLesTravaux(
  packs: readonly PackTravaux[],
  enveloppe: Enveloppe,
  chiffres: PosteDeperditionChiffre[] = []
): TravailPriorise[] {
  const sortie: TravailPriorise[] = [];
  for (const pack of packs) {
    for (const r of pack.recommandations) {
      sortie.push({
        pack: pack.titre,
        priorite: pack.priorite,
        montantDuPack: pack.montant,
        lot: r.lot,
        description: r.description,
        performance: r.performance,
        portee: porteeDuLot(r.lot, chiffres),
        parois: paroisDuLot(r.lot, enveloppe)
      });
    }
  }
  return sortie;
}

/**
 * Le travail qui touche la plus grosse part, s'il y en a un.
 *
 * Sert à la phrase « par où commencer ». Rend `null` quand aucun travail n'a de
 * part connue : mieux vaut ne rien dire que désigner au hasard.
 */
export function parOuCommencer(travaux: readonly TravailPriorise[]): TravailPriorise | null {
  const chiffres = travaux.filter(
    (t): t is TravailPriorise & { portee: { genre: 'part'; part: number; poste: string } } =>
      t.portee.genre === 'part'
  );
  if (chiffres.length === 0) return null;
  return chiffres.reduce((a, b) => (b.portee.part > a.portee.part ? b : a));
}

export type { Recommandation };
