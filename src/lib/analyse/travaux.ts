/**
 * LES TRAVAUX — ce que le DPE recommande, et ce qu'il ne dit pas.
 *
 * ── Ce que le rapport donne ─────────────────────────────────────────────────
 *
 * Deux packs, dans les vingt-six volets lus sans exception :
 *
 *   Les travaux essentiels        Montant estimé : 6200 à 9400 €
 *   Lot   Description   Performance recommandée
 *   …
 *   Les travaux à envisager       Montant estimé : 11400 à 17100 €
 *   …
 *   Commentaires :
 *
 * Le premier pack est celui des travaux prioritaires, le second mène « vers un
 * logement très performant ». C'est le rapport qui les hiérarchise, pas nous :
 * on reprend sa hiérarchie et son montant, sans les recalculer.
 *
 * Chaque rangée porte un **lot** (« Mur », « Chauffage », « Portes et
 * fenêtres »…), une **consigne** en toutes lettres, et une **performance
 * recommandée** (« R > 3,7 m².K/W », « SCOP = 4 »). Le lot et la performance
 * sont deux colonnes voisines, souvent imprimées sur la même ligne — « Mur
 * R > 3,7 m².K/W » — au milieu de la consigne qu'elles nomment. C'est la
 * cellule fusionnée, pour la troisième fois : voir `celluleFusionnee.ts`.
 *
 * ── Ce que le rapport ne donne pas, et qu'on n'inventera pas ────────────────
 *
 * La rubrique « Évolution de la performance après travaux » ne contient, en
 * texte, que du discours général sur la rénovation et les aides. **Les classes
 * projetées après travaux sont en image**, comme l'étiquette : sur les
 * vingt-six volets, aucune lettre « après » n'existe en texte.
 *
 * On ne peut donc pas afficher « E → C ». `classesApresTravaux` reste faux et
 * l'écran le dit. Ce que l'on peut montrer honnêtement : les deux packs, leurs
 * lots, leurs consignes, leurs performances visées et leurs montants — c'est
 * déjà le scénario, moins la promesse chiffrée que le rapport garde pour lui.
 *
 * ── La priorité 3 du §18 ────────────────────────────────────────────────────
 *
 * « Recommandations de gestion et d'entretien des équipements » est une rubrique
 * distincte, avec ses propres postes (chauffe-eau, éclairage, isolation,
 * radiateur, ventilation). Ce ne sont pas des travaux : ce sont des gestes.
 * L'ordre de mission les range en priorité 3, on les garde à part.
 *
 * Portée : mesuré sur les vingt-six volets DPE LICIEL du corpus.
 */
import { rattacher } from './celluleFusionnee';

export interface Recommandation {
  /** « Mur », « Chauffage », « Portes et fenêtres » — `null` si non nommé. */
  lot: string | null;
  /** La consigne, telle qu'écrite. */
  description: string;
  /** « R > 3,7 m².K/W », « SCOP = 4 » — `null` quand le rapport n'en donne pas. */
  performance: string | null;
}

export interface PackTravaux {
  /** « Les travaux essentiels », « Les travaux à envisager ». */
  titre: string;
  /** 1 pour les travaux prioritaires, 2 pour ceux qui mènent au très performant. */
  priorite: 1 | 2;
  /** « 6200 à 9400 € » — le montant du rapport, jamais recalculé. */
  montant: string | null;
  recommandations: Recommandation[];
}

export interface Geste {
  poste: string;
  conseil: string;
}

export interface Travaux {
  presente: boolean;
  packs: PackTravaux[];
  /** Le mot du diagnostiqueur sous les tableaux, souvent le plus utile. */
  commentaires: string | null;
  /** Priorité 3 : les gestes d'entretien, qui ne sont pas des travaux. */
  gestes: Geste[];
  /** Toujours faux : les lettres projetées après travaux sont en image. */
  classesApresTravaux: boolean;
}

const DEBUT = /^Recommandations\s+d\s*[’'´`]?\s*am[ée]lioration/i;
const FIN = /^Fiche\s+technique\s+du\s+logement/i;
const DEBUT_GESTES = /^Recommandations\s+de\s+gestion/i;
const PACK = /^Les\s+travaux\b(.*)$/i;
const MONTANT = /Montant\s+estim[ée]\s*:\s*(.+?)\s*$/i;
const ENTETE = /^Lot\s+Description\s+Performance/i;
const COMMENTAIRES = /^Commentaires\s*:?\s*(.*)$/i;

/**
 * Les performances visées, dans les notations du corpus.
 *
 * Ancrées en début ou en fin de segment : « SCOP » isolé traîne aussi dans les
 * consignes en toutes lettres, et on ne veut que la colonne.
 */
const PERFORMANCE =
  /((?:R|Uw|Ujn|Ug|U|SCOP|COP|Etas|ETAS|η)\s*[><=≥≤]\s*[\d.,]+[^,;]*(?:,\s*Sw\s*=\s*[\d.,]+)?)/;

/**
 * Les lots, relevés sur le corpus.
 *
 * Ce sont les mêmes mots que la vue d'ensemble du logement et des équipements —
 * le rapport nomme ses postes de la même façon d'un tableau à l'autre. Un lot
 * inconnu ne casse rien : sa rangée existe, simplement sans nom.
 */
const LOTS = [
  'Murs?',
  'Plancher bas',
  'Plancher haut',
  'Toiture\\s*/\\s*plafond',
  'Toiture',
  'Plafond',
  'Combles',
  'Portes? et fen[êe]tres',
  'Portes?',
  'Fen[êe]tres',
  'Chauffage',
  'Eau chaude sanitaire',
  'Ventilation',
  'Climatisation',
  'Refroidissement',
  'Production d\\s*[’\'´`]\\s*[ée]lectricit[ée]'
];

/**
 * Les postes de l'entretien ne sont PAS les lots des travaux.
 *
 * Le tableau des gestes a son propre vocabulaire — « Chauffe-eau »,
 * « Éclairage », « Isolation », « Radiateur ». Les mêler aux lots coupait les
 * consignes en deux : « Isolation des murs par l'intérieur » commence une
 * consigne du lot « Mur », et se faisait prendre pour une étiquette.
 */
const POSTES_GESTES = [
  'Chauffe-eau',
  '[ÉE]clairage',
  'Isolation',
  'Radiateur',
  'Ventilation',
  'Chauffage',
  'Eau chaude sanitaire',
  'Climatisation',
  'Fen[êe]tres',
  'Menuiseries'
];

const MOTIF_LOT = new RegExp(`^(${LOTS.join('|')})\\b\\s*(.*)$`, 'i');
const MOTIF_GESTE = new RegExp(`^(${POSTES_GESTES.join('|')})\\b\\s*(.*)$`, 'i');

/** Là où s'arrêtent les commentaires : au titre suivant, quel qu'il soit. */
const RUBRIQUE_SUIVANTE =
  /^Recommandations\b|^[ÉE]volution de la performance|^Pr[ée]parez votre projet|^Dont [ée]missions|^Pour r[ée]pondre [àa] l|^Vous pouvez b[ée]n[ée]ficier|^Contactez le conseiller|^https?:/i;

function propre(t: string): string {
  return t.replace(/\s+/g, ' ').trim();
}

const BRUIT =
  /Page\s+\d+\s*\/\s*\d+\s*$|^DPE\b.*p\.\d+$|^Lot\s+Description|^Montant\s+estim|NON\s+VALIDE/i;

/** « Les travaux à » puis « envisager » : le titre s'enroule, on le recolle. */
function titreDuPack(lignes: string[], i: number): string {
  const ligne = propre(lignes[i] as string).replace(MONTANT, '').trim();
  if (/essentiels|envisager/i.test(ligne)) return ligne;
  const suite = propre(lignes[i + 1] ?? '');
  return suite && !MONTANT.test(suite) ? propre(`${ligne} ${suite}`) : ligne;
}

function montantDuPack(lignes: string[], i: number): string | null {
  for (let j = i; j < Math.min(i + 3, lignes.length); j++) {
    const m = (lignes[j] as string).match(MONTANT);
    if (m && m[1]) return propre(m[1]);
  }
  return null;
}

/**
 * Une rangée de recommandation : le lot, la consigne, la performance.
 *
 * La performance se lit dans ce que l'étiquette porte sur sa propre ligne, ou à
 * défaut dans les lignes rattachées — d'où on la retire ensuite, pour que la
 * consigne reste une consigne.
 */
function lireRangee(etiquette: string, suite: string, lignes: string[]): Recommandation {
  let performance: string | null = null;
  const morceaux: string[] = [];

  const dansSuite = suite.match(PERFORMANCE);
  if (dansSuite && dansSuite[1]) {
    performance = propre(dansSuite[1]);
  } else if (suite) {
    morceaux.push(suite);
  }

  for (const l of lignes) {
    if (l === suite) continue;
    const m = l.match(PERFORMANCE);
    if (m && m[1] && propre(m[1]) === propre(l)) {
      performance = performance ?? propre(m[1]);
      continue;
    }
    morceaux.push(l);
  }

  return {
    lot: etiquette || null,
    description: propre(morceaux.join(' ')),
    performance
  };
}

export function lireTravaux(lignes: string[]): Travaux {
  const brutes = lignes.map(propre);
  const debut = brutes.findIndex((l) => DEBUT.test(l));
  const gestes = lireGestes(brutes);

  if (debut < 0) {
    return {
      presente: gestes.length > 0,
      packs: [],
      commentaires: null,
      gestes,
      classesApresTravaux: false
    };
  }

  let fin = brutes.findIndex((l, i) => i > debut && FIN.test(l));
  if (fin < 0) fin = brutes.length;
  const region = brutes.slice(debut, fin);

  /* Où commence chaque pack, et où s'arrête le dernier. */
  const debuts: number[] = [];
  for (let i = 0; i < region.length; i++) if (PACK.test(region[i] as string)) debuts.push(i);

  const iCommentaires = region.findIndex((l) => COMMENTAIRES.test(l));
  let commentaires: string | null = null;
  if (iCommentaires >= 0) {
    const premier = (region[iCommentaires] as string).match(COMMENTAIRES)?.[1] ?? '';
    /* On s'arrête au titre suivant : le commentaire finit là où la page tourne. */
    const apres = region.slice(iCommentaires + 1);
    const stop = apres.findIndex((l) => RUBRIQUE_SUIVANTE.test(l) || PACK.test(l));
    const suite = (stop >= 0 ? apres.slice(0, stop) : apres).filter((l) => l && !BRUIT.test(l));
    const tout = propre([premier, ...suite].join(' '));
    commentaires = tout || null;
  }

  const packs: PackTravaux[] = [];
  for (let k = 0; k < debuts.length; k++) {
    const i = debuts[k] as number;
    const finPack = Math.min(
      debuts[k + 1] ?? region.length,
      iCommentaires >= 0 && iCommentaires > i ? iCommentaires : region.length
    );

    const titre = titreDuPack(region, i);
    /* La table commence à son en-tête : avant, c'est le titre et le montant. */
    const iEntete = region.slice(i, finPack).findIndex((l) => ENTETE.test(l));
    const corps = region
      .slice(i + (iEntete >= 0 ? iEntete + 1 : 1), finPack)
      .filter((l) => l && !BRUIT.test(l));

    const rangees = rattacher(corps, MOTIF_LOT, { suiteEstUneAutreColonne: PERFORMANCE });
    const recommandations =
      rangees.length > 0
        ? rangees.map((r) => lireRangee(r.etiquette, r.suite, r.lignes))
        : corps.length > 0
          ? [{ lot: null, description: propre(corps.join(' ')), performance: null }]
          : [];

    packs.push({
      titre,
      priorite: /essentiel/i.test(titre) ? 1 : 2,
      montant: montantDuPack(region, i),
      recommandations: recommandations.filter((r) => r.description || r.performance)
    });
  }

  return { presente: true, packs, commentaires, gestes, classesApresTravaux: false };
}

/**
 * Les gestes d'entretien — priorité 3.
 *
 * Même tableau fusionné, même règle. « Nettoyage et réglage de l'installation
 * tous les 3 ans » précède son étiquette « Ventilation » ; « Nettoyer
 * régulièrement les bouches » la suit. Les deux lui appartiennent.
 */
export function lireGestes(lignes: string[]): Geste[] {
  const debut = lignes.findIndex((l) => DEBUT_GESTES.test(l));
  if (debut < 0) return [];
  let fin = lignes.findIndex((l, i) => i > debut && (DEBUT.test(l) || FIN.test(l)));
  if (fin < 0) fin = lignes.length;

  const region = lignes
    .slice(debut + 1, fin)
    .filter(
      (l) =>
        l &&
        !BRUIT.test(l) &&
        !/^type\s*d\s*[’'´`]?\s*entretien$/i.test(l) &&
        !/^Pour ma[îi]triser vos consommations/i.test(l) &&
        !/^Selon la configuration/i.test(l)
    );

  return rattacher(region, MOTIF_GESTE)
    .map((r) => ({ poste: r.etiquette, conseil: propre(r.lignes.join(' ')) }))
    .filter((g) => g.conseil);
}
