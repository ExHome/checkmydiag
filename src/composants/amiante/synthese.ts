/**
 * LA SYNTHÈSE AMIANTE — les huit blocs de l'ordre de mission, et rien d'autre.
 *
 * Ordre d'Aude du 22/08/2026 (`docs/ODM-AMIANTE-MINI-APP.md`) :
 *
 *   Points clés → Résultat global → Éléments/matériaux contrôlés →
 *   Constatations diverses → Ce qui n'a pas été contrôlé →
 *   Complétude/confiance si justifiable → Conseil Verrière → Rapport complet
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CE MODULE NE DESSINE RIEN. Il répond à une seule question : **qu'est-ce que
 * ce rapport permet d'afficher ?** L'écran en fait des cartes ; ici on décide
 * ce qui a le droit d'exister.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── LES TROIS RÈGLES ABSOLUES DE L'ORDRE, TENUES ICI ────────────────────────
 *
 * 1. **Aucune donnée inventée.** Chaque champ vient du `Diagnostic` lu, ou
 *    n'existe pas. Un bloc sans donnée n'est pas un bloc vide : il est absent.
 *
 * 2. **Une zone non contrôlée n'est JAMAIS présentée comme saine.** Le modèle
 *    distingue déjà trois états — `lue: false` (on n'a pas su lire),
 *    `neant: true` (la rubrique existe et répond « Néant »), et des entrées.
 *    Les trois se disent différemment, et « on n'a pas su lire » ne se dit
 *    jamais « rien à signaler ».
 *
 * 3. **Pas de pourcentage de confiance.** L'ordre l'interdit sauf règle métier
 *    validée. Aucune ne l'est : le nombre de locaux non visités n'est pas
 *    comparable d'un rapport à l'autre — la ligne « Ensemble du bien » est
 *    tantôt une clause de style, tantôt trois observations réelles. On rend
 *    donc des FAITS (« 2 locaux n'ont pas été ouverts, dont les combles »),
 *    jamais un chiffre agrégé.
 *
 * ── ET LA RÈGLE QUE LA LECTURE DU CORPUS AJOUTE ─────────────────────────────
 *
 * **Le résultat global a trois issues, pas deux** : présence, absence, et
 * **non conclu**. Mesuré sur 130 volets : sur les dix-huit qui ne sont pas un
 * simple négatif, près de quatre sur dix ne tranchent pas — prélèvements à
 * faire, ou résultats de laboratoire attendus. Un rapport qui ne conclut pas ne
 * peut pas afficher « aucun matériau contenant de l'amiante repéré ».
 */
import type { Diagnostic, Fait, Gravite } from '../../lib/modele';

/** Ce que le rapport établit, globalement. Trois issues, jamais deux. */
export type Issue = 'presence' | 'absence' | 'nonConclu' | 'illisible';

export interface Materiau {
  /** La désignation, telle que le rapport l'écrit. */
  readonly quoi: string;
  /** Les localisations, telles que le rapport les écrit. */
  readonly ou?: string;
  /**
   * L'état de conservation ou le résultat de cotation, quand le rapport en
   * porte un : `Résultat EP`, `Score 3`, `Matériau non dégradé`…
   */
  readonly etat?: string;
  /** La suite prévue par le rapport, mot pour mot. */
  readonly suite?: string;
}

/**
 * Un élément que le repérage a EXAMINÉ — le bloc « Éléments contrôlés ».
 *
 * ⚠️ `statut` n'est pas une appréciation : c'est ce que le rapport établit sur
 * cet élément-là. « Visitée » veut dire visitée, et rien de plus — surtout pas
 * « sans amiante ». Le visuel du pack coche « Contrôlée ✓ » sur cinq
 * composants ; la coche dit que l'opérateur y est allé, jamais qu'il n'y a rien.
 */
export interface Element {
  /** La pièce ou le matériau, tel que le rapport l'écrit. */
  readonly quoi: string;
  /** Ce que le rapport en établit : « Visitée », « Analysé, sans amiante »… */
  readonly statut: string;
  /** `bon` quand une analyse a conclu, `neutre` quand on a seulement regardé. */
  readonly ton: 'bon' | 'neutre';
}

export interface Limite {
  /** Le local ou le composant, tel que le rapport l'écrit. */
  readonly quoi: string;
  readonly ou?: string;
  /** La raison, quand le rapport la donne. Jamais inventée. */
  readonly pourquoi?: string;
}

/** Un bloc de l'écran. Absent quand le rapport ne permet pas de l'écrire. */
export interface Bloc<T> {
  readonly montrer: boolean;
  readonly entrees: readonly T[];
  /**
   * La rubrique a-t-elle été LUE ?
   *
   * ⚠️ Sans ce drapeau, « zéro entrée » se lit comme « rien à signaler ». Sur
   * « ce qui n'a pas été contrôlé », c'est la confusion la plus grave du
   * produit : un § 1.2 non lu devenait un bien entièrement examiné, et la carte
   * de complétude en tirait « 100 % ». Trois états, jamais deux : non lue,
   * lue et vide (« Néant »), lue et remplie.
   */
  readonly lue?: boolean;
  /**
   * Ce qu'on dit quand il n'y a pas d'entrée — et qui change tout :
   * « la rubrique répond Néant » n'est pas « on n'a pas su lire ».
   */
  readonly mention?: string;
}

export interface SyntheseAmiante {
  readonly issue: Issue;
  /** Le verdict du rapport, mot pour mot. */
  readonly resultat: string;
  readonly gravite: Gravite;
  /**
   * Les points clés : au plus trois, tous issus du rapport.
   *
   * `ancre` est le bloc que la ligne détaille plus bas. Le visuel met un chevron
   * au bout de chaque point clé ; un chevron qui ne mène nulle part est une
   * promesse en l'air, alors il ne s'affiche que sur les lignes qui ont
   * vraiment une suite dans l'écran.
   */
  readonly pointsCles: readonly {
    titre: string;
    detail: string;
    ton: Gravite;
    ancre?: 'materiaux' | 'elements' | 'limites' | 'completude';
  }[];
  readonly materiaux: Bloc<Materiau>;
  /** Ce que le repérage a examiné — pièces visitées, matériaux analysés. */
  readonly elements: Bloc<Element>;
  readonly constatations: Bloc<{ terme: string; ou?: string }>;
  readonly nonControle: Bloc<Limite>;
  /** Ce que le rapport dit de sa propre complétude. Jamais un pourcentage. */
  readonly completude: readonly string[];
  readonly conseil: readonly string[];
  /** Les pages du rapport, pour l'accès à la source. */
  readonly pages: readonly [number, number];
}

/** Les libellés que le lecteur amiante pose sur ses faits. */
const LIBELLE_MATERIAU = /^Mat[ée]riaux? rep[ée]r[ée]s?$|^Amiante rep[ée]r[ée]e$/i;
const LIBELLE_SUSPENS = /ne conclut pas/i;

/**
 * L'issue, lue sur le diagnostic — jamais devinée sur le verdict.
 *
 * ⚠️ On ne cherche pas de mots dans la phrase de verdict : c'est exactement la
 * faute que la lecture du corpus a coûtée. On lit ce que le lecteur a établi —
 * ses faits et sa gravité — parce que lui a lu la rubrique.
 */
export function issueDe(d: Diagnostic): Issue {
  const faits = d.faits ?? [];
  if (!d.verdict) return 'illisible';
  if (/n'a pas pu être lu|n’a pas pu être lu/i.test(d.verdict)) return 'illisible';
  if (faits.some((f) => LIBELLE_MATERIAU.test(f.libelle))) return 'presence';
  if (faits.some((f) => LIBELLE_SUSPENS.test(f.libelle))) return 'nonConclu';
  if (d.gravite === 'alerte') return 'presence';
  return 'absence';
}

/** Un fait dont la valeur ne dit rien — `—`, `Néant`, vide — n'est pas une donnée. */
const renseigne = (v: string | undefined): v is string =>
  !!v && v.trim() !== '' && v.trim() !== '—' && !/^n[ée]ant$/i.test(v.trim());

function materiauxDe(d: Diagnostic): Bloc<Materiau> {
  const entrees: Materiau[] = [];

  /*
   * Les matériaux amiantés, un par un — jamais agrégés.
   *
   * L'ordre le demande explicitement : « pour chaque MPCA, afficher la
   * désignation extraite, la localisation, le résultat, l'état/score/évaluation
   * lorsqu'il existe et les suites prévues par le rapport ».
   */
  for (const a of d.anomalies ?? []) {
    const ou = a.localisations.filter(Boolean).join(', ');
    entrees.push({
      quoi: a.libelle,
      ...(renseigne(ou) ? { ou } : {}),
      ...(renseigne(a.mesureCompensatoire?.libelle) ? { etat: a.mesureCompensatoire!.libelle } : {}),
      ...(renseigne(a.geste ?? undefined) ? { suite: a.geste! } : {})
    });
  }

  if (!entrees.length) {
    for (const f of d.faits ?? []) {
      if (!LIBELLE_MATERIAU.test(f.libelle)) continue;
      if (!renseigne(f.valeur)) continue;
      entrees.push({
        quoi: f.valeur,
        ...(renseigne(f.precision) ? { suite: f.precision } : {})
      });
    }
  }

  if (entrees.length) return { montrer: true, entrees };

  /*
   * ⚠️ Aucun matériau listé n'est PAS « tout a été contrôlé et tout est sain ».
   *
   * Le § 5.0.2 de LICIEL liste ce qui a été REGARDÉ, pas ce qui contient de
   * l'amiante — et le lecteur ne le restitue pas comme un inventaire. On ne
   * fabrique donc pas une liste de composants « contrôlés » que le rapport
   * n'écrit pas : ce serait exactement la donnée inventée que l'ordre
   * interdit, et la plus dangereuse, parce qu'elle rassure.
   */
  return {
    montrer: false,
    entrees: [],
    mention:
      "Le rapport ne détaille pas la liste des matériaux examinés un par un. Le détail figure dans le rapport complet."
  };
}

/**
 * LES ÉLÉMENTS CONTRÔLÉS — le bloc que le visuel met en quatrième position.
 *
 * ⚠️⚠️ **Ce bloc ne se fabrique pas.** Le mockup y coche « Toiture · Façades ·
 * Revêtements intérieurs · Conduits · Sols », tous « Contrôlés ✓ ». Cette liste
 * n'existe dans aucun rapport lu : la poser en dur serait la donnée inventée la
 * plus dangereuse du produit, parce qu'elle RASSURE.
 *
 * Ce que le rapport écrit vraiment, et qui répond à la même question — *qu'a-t-il
 * regardé ?* — c'est le § 3.2.6, `Descriptif des pièces visitées`. Sondé le
 * 22/08 sur le corpus DGLM : les tableaux 5.0.1 et 5.0.2, que le visuel semble
 * pourtant décrire, répondent `Néant -` dans les volets négatifs. Le périmètre
 * est le seul endroit qui porte l'inventaire de ce qui a été vu.
 *
 * ⚠️ Et le statut affiché est « Visitée », jamais « Sans amiante » : une pièce
 * ouverte n'est pas une pièce blanchie. C'est la règle du § 4 de l'ordre,
 * appliquée dans l'autre sens.
 */
function elementsDe(d: Diagnostic): Bloc<Element> {
  const p = d.perimetre;
  if (!p?.pieces.length) return { montrer: false, entrees: [] };
  return {
    montrer: true,
    entrees: p.pieces.map((quoi) => ({ quoi, statut: 'Visitée', ton: 'neutre' as const }))
  };
}

function constatationsDe(d: Diagnostic): Bloc<{ terme: string; ou?: string }> {
  const c = d.constatations;
  if (!c) return { montrer: false, entrees: [] };
  if (!c.lue) {
    return {
      montrer: true,
      entrees: [],
      mention: "Cette rubrique n'a pas pu être lue dans ce rapport — ce n'est pas « rien à signaler »."
    };
  }
  if (c.neant) {
    return { montrer: true, entrees: [], mention: 'Le rapport porte cette rubrique et répond « Néant ».' };
  }
  const entrees = c.entrees
    .filter((e) => e.nature === 'constat')
    .map((e) => ({ terme: e.terme, ...(renseigne(e.ou) ? { ou: e.ou! } : {}) }));
  return { montrer: entrees.length > 0, entrees };
}

function nonControleDe(d: Diagnostic): Bloc<Limite> {
  const n = d.nonVisitees;
  const entrees: Limite[] = [];

  for (const p of n?.pieces ?? []) {
    entrees.push({
      quoi: p.terme,
      ...(renseigne(p.ou) ? { ou: p.ou } : {}),
      ...(renseigne(p.pourquoi) ? { pourquoi: p.pourquoi } : {})
    });
  }

  /* Les limites relevées ailleurs que dans la rubrique des non-visités. */
  for (const e of d.constatations?.entrees ?? []) {
    if (e.nature !== 'limite') continue;
    entrees.push({ quoi: e.terme, ...(renseigne(e.ou) ? { ou: e.ou! } : {}) });
  }

  if (entrees.length) return { montrer: true, entrees, lue: true };

  if (n && !n.lue) {
    return {
      montrer: true,
      entrees: [],
      lue: false,
      mention:
        "La rubrique des locaux non visités n'a pas pu être lue. On ne peut donc pas dire que tout a été examiné."
    };
  }
  if (n?.neant) {
    return {
      montrer: true,
      entrees: [],
      lue: true,
      mention: 'Le rapport indique qu’aucun local n’est resté fermé.'
    };
  }
  return { montrer: false, entrees: [], lue: false };
}

/**
 * Ce que le rapport dit de sa propre complétude — en faits, jamais en note.
 *
 * ⚠️ L'ordre interdit le « 90 % » du mockup, et aucune règle validée ne
 * permettrait de le calculer : le nombre de locaux non visités n'est pas
 * comparable d'un rapport à l'autre. On rend donc ce qui est écrit.
 */
function completudeDe(d: Diagnostic, limites: Bloc<Limite>): string[] {
  const dits: string[] = [];

  if (limites.entrees.length) {
    const n = limites.entrees.length;
    dits.push(
      n === 1
        ? "1 local ou composant n'a pas pu être examiné : le constat ne dit rien de celui-là."
        : `${n} locaux ou composants n'ont pas pu être examinés : le constat ne dit rien de ceux-là.`
    );
  }
  if (d.nonVisitees?.charpente) {
    dits.push('Les combles ou la charpente en font partie — c’est là que vivent les flocages et les calorifugeages.');
  }
  if (issueDe(d) === 'nonConclu') {
    dits.push('Des prélèvements restent à faire ou leurs résultats sont attendus : la conclusion n’est pas définitive.');
  }
  return dits;
}

/**
 * Le conseil — après les faits, jamais à leur place.
 *
 * Il ne contredit pas le rapport et ne crée aucune garantie : chaque phrase se
 * déduit de l'issue et des limites, et aucune ne prétend que ce qui n'a pas été
 * regardé est sain.
 */
function conseilDe(issue: Issue, limites: Bloc<Limite>): string[] {
  const c: string[] = [];
  switch (issue) {
    case 'presence':
      c.push('Prévenez toute personne appelée à intervenir sur ces matériaux, avant les travaux.');
      c.push('Ne percez, ne poncez, ne découpez rien à cet endroit sans avis d’un professionnel certifié.');
      break;
    case 'nonConclu':
      c.push('Réclamez le rapport complété par les résultats du laboratoire avant de vous engager.');
      break;
    case 'illisible':
      c.push('Demandez une version lisible du rapport : ce document n’a pas pu être exploité.');
      break;
    case 'absence':
      c.push('Conservez ce rapport. En cas de travaux, présentez-le aux intervenants.');
      break;
  }
  if (limites.entrees.length) {
    c.push(
      'Si des travaux devaient ouvrir les zones restées fermées, faites-les vérifier : le constat ne les couvre pas.'
    );
  }
  return c;
}

/** Assembler la synthèse. */
export function syntheseAmiante(d: Diagnostic): SyntheseAmiante {
  const issue = issueDe(d);
  const materiaux = materiauxDe(d);
  const constatations = constatationsDe(d);
  const nonControle = nonControleDe(d);

  const pointsCles: SyntheseAmiante['pointsCles'][number][] = [];

  if (issue === 'presence') {
    pointsCles.push({
      titre:
        materiaux.entrees.length === 1
          ? 'Un matériau contenant de l’amiante'
          : `${materiaux.entrees.length} matériaux contenant de l’amiante`,
      detail: materiaux.entrees.map((m) => m.quoi).join(' · '),
      ton: 'alerte',
      ancre: 'materiaux'
    });
  } else if (issue === 'nonConclu') {
    pointsCles.push({
      titre: 'Le rapport ne conclut pas encore',
      detail: 'Des prélèvements restent à faire, ou leurs résultats sont attendus.',
      ton: 'attention'
    });
  } else if (issue === 'illisible') {
    pointsCles.push({
      titre: 'Ce document n’a pas pu être lu',
      detail: 'Aucune conclusion ne peut en être tirée.',
      ton: 'attention'
    });
  } else {
    pointsCles.push({
      titre: 'Aucun matériau amianté repéré',
      detail: 'Dans le périmètre que le rapport a examiné.',
      ton: 'bon'
    });
  }

  if (nonControle.entrees.length) {
    pointsCles.push({
      titre:
        nonControle.entrees.length === 1
          ? 'Une zone n’a pas pu être examinée'
          : `${nonControle.entrees.length} zones n’ont pas pu être examinées`,
      detail: 'Le constat ne dit rien de ces zones — ni qu’elles sont saines, ni le contraire.',
      ton: 'attention',
      ancre: 'limites'
    });
  }

  const dateDite = d.date ? `Repérage du ${d.date}.` : '';
  if (dateDite) {
    pointsCles.push({ titre: 'Diagnostic réalisé selon la réglementation', detail: dateDite, ton: 'bon' });
  }

  return {
    issue,
    resultat: d.verdict,
    gravite: d.gravite,
    pointsCles,
    materiaux,
    elements: elementsDe(d),
    constatations,
    nonControle,
    completude: completudeDe(d, nonControle),
    conseil: conseilDe(issue, nonControle),
    pages: d.pages ?? [1, 1]
  };
}

/** Les faits bruts, pour le bloc « voir la source ». */
export const faitsDe = (d: Diagnostic): readonly Fait[] => d.faits ?? [];
