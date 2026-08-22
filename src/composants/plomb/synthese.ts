/**
 * CE QUE LE CREP PERMET D'AFFICHER — et rien d'autre.
 *
 * Cette fonction ne dessine rien. Elle répond à une seule question : « qu'est-ce
 * que ce rapport-là autorise à écrire à l'écran ? » L'écran ne fait ensuite que
 * dessiner sa réponse, et se tait sur ce qu'elle laisse vide.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * LES INTERDITS DE L'ORDRE DE MISSION CREP, TENUS ICI
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * § 2-3   Ne JAMAIS fusionner deux unités de diagnostic parce qu'elles sont
 *         dans la même pièce. Chaque unité garde sa ligne, sa zone, sa face.
 * § 17    Une unité NON MESURÉE n'est jamais de classe 0. Elle n'a pas de
 *         classe du tout, et son motif est repris mot pour mot.
 * § 41    Le total se vérifie : non mesurées + les quatre classes = total.
 *         Quand la somme ne tombe pas, on le DIT — on ne rattrape pas.
 * § 10    La classe affichée est celle que le diagnosticien a écrite. Jamais
 *         recalculée, jamais corrigée en silence.
 * § 25-27 Les deux critères réglementaires — 50 % dans un local, 20 % sur
 *         l'ensemble — sont recalculés sur les EFFECTIFS, pas lus dans les
 *         pourcentages imprimés. Les divergences sont signalées, pas arbitrées.
 * § 7     mg/cm² n'est jamais confondu avec mg/g.
 *
 * ⚠️ AUCUN NIVEAU DE RISQUE, AUCUN POURCENTAGE DE CONFIANCE. Les autres packs
 * Verrière en affichent sur leur maquette ; ce sont des valeurs fictives, et
 * aucune règle validée ne permet de les calculer pour un CREP.
 */
import type { Diagnostic, Gravite } from '../../lib/modele';
import { criteresDuCrep, type CriteresDuCrep } from '../../lib/analyse/crep-criteres';

/** Les trois issues d'un CREP. Jamais deux : « illisible » n'est pas « négatif ». */
export type IssuePlomb = 'plombPresent' | 'aucunRevetementAuDessus' | 'illisible';

/** Un bloc de l'écran. Absent quand le rapport ne permet pas de l'écrire. */
export interface BlocP<T> {
  readonly montrer: boolean;
  readonly entrees: readonly T[];
  /** Ce qu'on dit quand il n'y a pas d'entrée — jamais « rien à signaler ». */
  readonly mention?: string;
}

export interface PointCleP {
  readonly titre: string;
  readonly detail: string;
  readonly ton: Gravite;
}

/** Un local, avec ses unités réparties par classe. Le § 2 interdit de fondre. */
export interface LocalPlomb {
  readonly local: string;
  readonly unites: number;
  readonly classe3: number;
  /** Recalculée sur les effectifs, comme le § 26 l'exige. */
  readonly part: number;
  /** Le local atteint-il le seuil des 50 % de classe 3 ? */
  readonly seuilAtteint: boolean;
}

/** Une unité que le diagnostiqueur n'a pas pu mesurer. JAMAIS classe 0. */
export interface NonMesuree {
  /** L'élément, dans les mots du rapport, entier. */
  readonly quoi: string;
  /** Le local, quand le rapport le nomme. */
  readonly ou?: string;
  /** Le motif, repris mot pour mot. Jamais reformulé. */
  readonly pourquoi?: string;
}

export interface SynthesePlomb {
  readonly issue: IssuePlomb;
  /** Le verdict du rapport, mot pour mot. */
  readonly resultat: string;
  readonly gravite: Gravite;
  readonly pointsCles: readonly PointCleP[];
  /**
   * Les effectifs du tableau de synthèse — les trois états, jamais deux.
   * `null` quand le tableau n'a pas été lu : on ne compte pas à sa place.
   */
  readonly effectifs: {
    readonly total: number;
    readonly nonMesurees: number;
    readonly classes: readonly [number, number, number, number];
  } | null;
  /** Les locaux, chacun avec sa part de classe 3 recalculée. */
  readonly locaux: BlocP<LocalPlomb>;
  /** Ce qui n'a pas pu être mesuré, avec le motif du rapport. */
  readonly nonMesurees: BlocP<NonMesuree>;
  /** Les deux critères réglementaires, et les divergences constatées. */
  readonly criteres: CriteresDuCrep | null;
  /**
   * ⚠️ Ce que le § 41 impose de vérifier : la somme retombe-t-elle ?
   * Une phrase quand elle ne retombe pas, rien quand tout concorde.
   */
  readonly discordance: string | null;
  readonly conseil: readonly string[];
  readonly pages: readonly [number, number];
}

const VIDE = { montrer: false, entrees: [] } as const;

/**
 * L'issue, lue sur ce que le lecteur a établi — jamais devinée dans le verdict.
 *
 * ⚠️ TROIS ÉTATS, JAMAIS DEUX. Un rapport qu'on n'a pas su lire n'est pas un
 * rapport négatif : le confondre reviendrait à annoncer une absence de plomb
 * qui n'a jamais été constatée.
 */
export function issuePlomb(d: Diagnostic): IssuePlomb {
  if (!d.verdict) return 'illisible';
  const s = d.schema?.genre === 'plomb' ? d.schema : null;
  if (!s) return 'illisible';
  const [, c1, c2, c3] = s.classes;
  if (c1 + c2 + c3 > 0) return 'plombPresent';
  /*
   * Aucune unité au-dessus des seuils. On ne dit pas « pas de plomb » : le
   * constat porte sur les revêtements accessibles, et lui seul.
   */
  return 'aucunRevetementAuDessus';
}

/**
 * Les points clés — au plus trois, et chacun tiré d'un fait du rapport.
 *
 * ⚠️ On n'écrit pas les trois lignes de la maquette Verrière (« aucun termite
 * vivant », etc. côté termites) : elles n'existent dans aucun rapport. Ici,
 * chaque point clé correspond à quelque chose que le CREP établit vraiment.
 */
function pointsClesDe(
  issue: IssuePlomb,
  effectifs: SynthesePlomb['effectifs'],
  criteres: CriteresDuCrep | null
): PointCleP[] {
  const cles: PointCleP[] = [];
  if (!effectifs) return cles;

  const [, c1, c2, c3] = effectifs.classes;
  const auDessus = c1 + c2 + c3;

  if (issue === 'plombPresent') {
    cles.push({
      titre: `${auDessus} unité${auDessus > 1 ? 's' : ''} au-dessus du seuil`,
      detail:
        'Le seuil réglementaire est de 1 mg/cm² en fluorescence X. Ces revêtements contiennent du plomb.',
      ton: c3 > 0 ? 'alerte' : 'attention'
    });
  } else if (issue === 'aucunRevetementAuDessus') {
    cles.push({
      titre: 'Aucun revêtement au-dessus du seuil',
      detail: 'Sur les unités que le diagnostiqueur a pu mesurer.',
      ton: 'bon'
    });
  }

  /*
   * Les unités DÉGRADÉES — la classe 3. C'est elle qui déclenche les
   * obligations : c'est le plomb accessible, pas le plomb présent, qui expose.
   */
  if (c3 > 0) {
    cles.push({
      titre: `${c3} unité${c3 > 1 ? 's' : ''} de classe 3`,
      detail:
        'Revêtement contenant du plomb ET dégradé. C’est l’état dégradé qui rend le plomb accessible.',
      ton: 'alerte'
    });
  }

  /*
   * ⚠️ Les non mesurées ne sont PAS un détail de forme : ce sont des unités
   * dont on ne sait rien. Le § 17 interdit de les ranger en classe 0, et le
   * § 41 impose de les compter à part.
   */
  if (effectifs.nonMesurees > 0) {
    cles.push({
      titre: `${effectifs.nonMesurees} unité${effectifs.nonMesurees > 1 ? 's' : ''} non mesurée${effectifs.nonMesurees > 1 ? 's' : ''}`,
      detail: 'Le rapport ne conclut rien sur elles — ni présence, ni absence de plomb.',
      ton: 'attention'
    });
  }

  if (criteres?.critereLocal || criteres?.critereGlobal) {
    cles.push({
      titre: 'Seuil de signalement atteint',
      detail: criteres.critereLocal
        ? 'Au moins un local compte 50 % ou plus d’unités de classe 3.'
        : 'L’ensemble du logement atteint 20 % d’unités de classe 3.',
      ton: 'alerte'
    });
  }

  return cles.slice(0, 4);
}

export function synthesePlomb(d: Diagnostic): SynthesePlomb {
  const issue = issuePlomb(d);
  const s = d.schema?.genre === 'plomb' ? d.schema : null;

  const effectifs = s
    ? { total: s.total, nonMesurees: s.nonMesurees, classes: s.classes }
    : null;

  const criteres = s ? criteresDuCrep({ total: s.total, nonMesurees: s.nonMesurees, classes: s.classes }, []) : null;

  /*
   * ⚠️ LE CONTRÔLE DU § 41, ET IL EST BLOQUANT POUR L'AFFICHAGE.
   *
   * « Le total doit toujours être égal à : unités non mesurées + classe 0 +
   * classe 1 + classe 2 + classe 3. » Quand la somme ne retombe pas, l'écran ne
   * doit pas présenter les chiffres comme s'ils étaient vérifiés : il le dit.
   */
  let discordance: string | null = null;
  if (effectifs) {
    const somme =
      effectifs.nonMesurees + effectifs.classes.reduce((a, b) => a + b, 0);
    if (somme !== effectifs.total) {
      discordance = `Le tableau du rapport annonce ${effectifs.total} unités de diagnostic, et le détail en compte ${somme}. Les chiffres ci-dessous sont ceux du rapport, tels qu’il les écrit.`;
    }
  }

  const locaux: LocalPlomb[] = (criteres?.locaux ?? []).map((l) => ({
    local: l.local,
    unites: l.unites,
    classe3: l.classe3,
    part: l.part,
    seuilAtteint: l.atteint
  }));

  /*
   * Le conseil : ce que le rapport implique, jamais ce qu'on suppose.
   * ⚠️ Aucune recommandation de travaux n'est écrite sans classe 3 : c'est
   * l'état dégradé qui déclenche l'obligation, pas la présence de plomb.
   */
  const conseil: string[] = [];
  if (effectifs) {
    const c3 = effectifs.classes[3];
    if (c3 > 0) {
      conseil.push(
        'Les unités de classe 3 doivent faire l’objet de travaux : le propriétaire est tenu de supprimer le risque d’exposition au plomb.'
      );
      conseil.push(
        'Tant que ces travaux ne sont pas faits, évitez de poncer, gratter ou décaper ces surfaces : c’est la poussière qui contamine.'
      );
    } else if (effectifs.classes[1] + effectifs.classes[2] > 0) {
      conseil.push(
        'Le plomb est présent mais les revêtements ne sont pas dégradés : aucun travail n’est imposé. Il s’agit de les maintenir en l’état.'
      );
    }
    if (effectifs.nonMesurees > 0) {
      conseil.push(
        'Certaines unités n’ont pas pu être mesurées. Avant tous travaux touchant ces surfaces, faites-les vérifier.'
      );
    }
  }

  return {
    issue,
    resultat: d.verdict ?? '',
    gravite: d.gravite ?? 'neutre',
    pointsCles: pointsClesDe(issue, effectifs, criteres),
    effectifs,
    locaux: locaux.length ? { montrer: true, entrees: locaux } : VIDE,
    /*
     * Les unités non mesurées, une par une, viendront du lecteur d'unités.
     * Tant qu'il n'est pas branché sur le produit, on n'affiche que leur
     * NOMBRE — donné par le tableau de synthèse — et jamais une liste
     * reconstituée de mémoire.
     */
    nonMesurees: VIDE,
    criteres,
    discordance,
    conseil,
    pages: [d.pages?.[0] ?? 1, d.pages?.[1] ?? 1]
  };
}
