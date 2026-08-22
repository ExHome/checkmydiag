/**
 * CONSULTER L'ADEME — ce que le PDF garde en image, la base publique le donne en clair.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CE QUI EST ENVOYÉ, ET CE QUI NE L'EST PAS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * **Le PDF ne quitte pas l'appareil. Il n'a jamais quitté l'appareil, et rien
 * ici ne change cela.** Ce qui part, c'est UN numéro : celui que l'ADEME a
 * attribué au DPE, imprimé sur le rapport.
 *
 * Ce n'est pas rien. Ce numéro identifie un logement, et la base de l'ADEME est
 * publique — elle porte l'adresse. Envoyer ce numéro, c'est donc dire à un tiers
 * quel logement on est en train de regarder. Le produit doit l'écrire là où il
 * promet la confidentialité, et il l'écrit.
 *
 * ── Pourquoi le faire quand même ────────────────────────────────────────────
 *
 * Trois choses que le lecteur cherche sont **imprimées en image** dans son PDF,
 * donc illisibles par tout programme :
 *
 *  - la part de chaleur perdue par chaque paroi — le fameux schéma ;
 *  - les classes projetées après travaux ;
 *  - l'étiquette A→G elle-même.
 *
 * Les trois existent en clair dans la base, parce que le logiciel du
 * diagnostiqueur les y a transmises. Les demander, c'est lire le DPE — pas le
 * recalculer.
 *
 * ── La règle qui reste entière ──────────────────────────────────────────────
 *
 * La fiche de l'ADEME est ce que le diagnostiqueur a **déclaré**. Le PDF est ce
 * que le client a **reçu**. Rien ne garantit que les deux disent la même chose,
 * et quand ils divergent Verrière montre les deux : c'est un point à vérifier,
 * jamais un arbitrage.
 *
 * ── Trois réponses, jamais deux ─────────────────────────────────────────────
 *
 * `trouvée` / `introuvable` / `injoignable`. « Pas de réseau » et « ce DPE
 * n'existe pas dans la base » ne veulent pas dire la même chose, et l'écran ne
 * doit pas les confondre — l'un est notre problème, l'autre une information sur
 * le rapport.
 *
 * Source : https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant
 * Modèle de données relevé le 22/08/2026 — voir `reglement/dpeAdeme.ts`.
 */

const BASE = 'https://data.ademe.fr/data-fair/api/v1/datasets/dpe03existant/lines';

/**
 * Les champs demandés, et eux seuls.
 *
 * On ne rapatrie pas la fiche entière : 230 champs, dont l'adresse et les
 * coordonnées du logement. On demande ce que le PDF ne peut pas donner, et rien
 * de plus — ce qu'on ne reçoit pas ne peut pas fuir.
 */
const CHAMPS = [
  'numero_dpe',
  'etiquette_dpe',
  'etiquette_ges',
  'deperditions_murs',
  'deperditions_baies_vitrees',
  'deperditions_planchers_bas',
  'deperditions_planchers_hauts',
  'deperditions_ponts_thermiques',
  'deperditions_portes',
  'deperditions_renouvellement_air',
  'deperditions_enveloppe',
  'cout_total_5_usages',
  'conso_5_usages_par_m2_ep',
  'emission_ges_5_usages_par_m2',
  'surface_habitable_logement'
] as const;

/**
 * La forme d'un numéro ADEME, telle que la base l'écrit : « 2611E0031228S ».
 *
 * C'est un garde-fou, pas une validation : il empêche d'envoyer n'importe quel
 * bout de texte mal extrait à un serveur tiers. Un numéro de forme inattendue
 * n'est pas envoyé du tout.
 */
const FORME_NUMERO = /^[0-9A-Z]{10,20}$/;

export interface PosteDeperditionChiffre {
  /** « Les murs », « Les fenêtres »… tel qu'on l'affiche. */
  poste: string;
  /** Déperdition du poste, en watts par kelvin — l'unité du calcul. */
  wParK: number;
  /** Part du total, entre 0 et 1. Calculée, jamais devinée. */
  part: number;
}

export interface FicheAdeme {
  numero: string;
  etiquetteEnergie: string | null;
  etiquetteClimat: string | null;
  /** Les sept postes, du plus grand au plus petit. Vide si la base ne les donne pas. */
  deperditions: PosteDeperditionChiffre[];
  /** Somme des postes, en W/K. */
  totalWParK: number | null;
  coutAnnuel: number | null;
  consoParM2: number | null;
  gesParM2: number | null;
  surface: number | null;
}

export type Consultation =
  | { etat: 'trouvée'; fiche: FicheAdeme }
  | { etat: 'introuvable'; numero: string }
  | { etat: 'injoignable'; raison: string };

/** Les sept postes du bilan, avec le nom qu'on leur donne à l'écran. */
const POSTES: [keyof BrutAdeme, string][] = [
  ['deperditions_murs', 'Les murs'],
  ['deperditions_baies_vitrees', 'Les fenêtres'],
  ['deperditions_planchers_bas', 'Le plancher bas'],
  ['deperditions_planchers_hauts', 'Le plafond, la toiture'],
  ['deperditions_ponts_thermiques', 'Les ponts thermiques'],
  ['deperditions_portes', 'Les portes'],
  ['deperditions_renouvellement_air', 'Le renouvellement d’air']
];

interface BrutAdeme {
  numero_dpe?: string;
  etiquette_dpe?: string;
  etiquette_ges?: string;
  deperditions_murs?: number;
  deperditions_baies_vitrees?: number;
  deperditions_planchers_bas?: number;
  deperditions_planchers_hauts?: number;
  deperditions_ponts_thermiques?: number;
  deperditions_portes?: number;
  deperditions_renouvellement_air?: number;
  deperditions_enveloppe?: number;
  cout_total_5_usages?: number;
  conso_5_usages_par_m2_ep?: number;
  emission_ges_5_usages_par_m2?: number;
  surface_habitable_logement?: number;
}

function nombre(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/**
 * Range les sept postes et calcule leur part.
 *
 * La part se calcule sur la **somme des postes reçus**, pas sur le champ
 * `deperditions_enveloppe` : si un poste manque, une part calculée sur le total
 * annoncé ne ferait plus 100 %, et le lecteur verrait un camembert troué sans
 * savoir pourquoi. On somme ce qu'on a, et on ne parle que de ça.
 */
export function rangerLesDeperditions(brut: BrutAdeme): {
  postes: PosteDeperditionChiffre[];
  total: number | null;
} {
  const trouves: { poste: string; wParK: number }[] = [];
  for (const [cle, nom] of POSTES) {
    const v = nombre(brut[cle]);
    if (v !== null && v > 0) trouves.push({ poste: nom, wParK: v });
  }
  if (trouves.length === 0) return { postes: [], total: null };

  const total = trouves.reduce((n, p) => n + p.wParK, 0);
  return {
    total,
    postes: trouves
      .map((p) => ({ ...p, part: p.wParK / total }))
      .sort((a, b) => b.wParK - a.wParK)
  };
}

/**
 * Demande à l'ADEME la fiche publique d'un DPE.
 *
 * `recuperer` est injectable : les tests ne touchent jamais le réseau, et
 * l'appelant peut brancher un cache. Rien d'autre que le numéro ne sort d'ici.
 */
export async function consulterLAdeme(
  numero: string,
  recuperer: typeof fetch = fetch
): Promise<Consultation> {
  const propre = numero.trim().toUpperCase();
  if (!FORME_NUMERO.test(propre)) {
    return { etat: 'introuvable', numero: propre };
  }

  const url =
    `${BASE}?size=1&select=${CHAMPS.join(',')}` +
    `&qs=${encodeURIComponent(`numero_dpe:"${propre}"`)}`;

  let reponse: Response;
  try {
    reponse = await recuperer(url, { headers: { Accept: 'application/json' } });
  } catch (erreur) {
    return { etat: 'injoignable', raison: erreur instanceof Error ? erreur.message : 'réseau' };
  }
  if (!reponse.ok) {
    return { etat: 'injoignable', raison: `réponse ${reponse.status}` };
  }

  let donnees: { results?: BrutAdeme[] };
  try {
    donnees = (await reponse.json()) as { results?: BrutAdeme[] };
  } catch {
    return { etat: 'injoignable', raison: 'réponse illisible' };
  }

  const brut = donnees.results?.[0];
  if (!brut || !brut.numero_dpe) return { etat: 'introuvable', numero: propre };

  const { postes, total } = rangerLesDeperditions(brut);
  return {
    etat: 'trouvée',
    fiche: {
      numero: brut.numero_dpe,
      etiquetteEnergie: brut.etiquette_dpe ?? null,
      etiquetteClimat: brut.etiquette_ges ?? null,
      deperditions: postes,
      totalWParK: total,
      coutAnnuel: nombre(brut.cout_total_5_usages),
      consoParM2: nombre(brut.conso_5_usages_par_m2_ep),
      gesParM2: nombre(brut.emission_ges_5_usages_par_m2),
      surface: nombre(brut.surface_habitable_logement)
    }
  };
}
