/**
 * LA SYNTHÈSE TERMITES — les sept blocs de l'ordre de mission, et rien d'autre.
 *
 * Ordre d'Aude du 22/08/2026 (`ODM_MINI_APP_TERMITES.md`, visuel de référence :
 * l'écran de DROITE) :
 *
 *   Points clés → Résultat global → Constatations diverses →
 *   Ce qui n'a pas été contrôlé → Complétude si justifiable →
 *   Conseil Verrière → Rapport complet
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CE MODULE NE DESSINE RIEN. Il répond à une seule question : **qu'est-ce que
 * ce rapport permet d'afficher ?** L'écran en fait des cartes ; ici on décide
 * ce qui a le droit d'exister.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ## ⚠️ CE QUE LE VISUEL MONTRE ET QUI EST FICTIF
 *
 * L'ordre le dit lui-même, deux fois :
 *
 * - **le « 90 % » de confiance** (§ E) — « ne pas afficher arbitrairement un
 *   pourcentage tel que 90 % ». Aucune règle de calcul n'est validée : le
 *   nombre de pièces non visitées n'est pas comparable d'un rapport à l'autre.
 *   On rend donc des FAITS, jamais un score ;
 * - **le « NIVEAU DE RISQUE : TRÈS FAIBLE »** (§ B) — il doit être calculable
 *   ou issu d'une règle validée, jamais inventé par l'interface. Le rapport ne
 *   qualifie aucun risque : il constate des indices, ou leur absence.
 *
 * Et le visuel se contredit : il annonce « inspection complète » en affichant
 * quatre zones non contrôlées.
 *
 * ## ⚠️ LES TROIS POINTS CLÉS DU VISUEL N'EXISTENT PAS DANS LES RAPPORTS
 *
 * Le visuel propose « Aucun termite vivant observé », « Aucun dégât identifié »,
 * « Pas d'indice d'activité récent ». Les rapports lus ne répondent PAS indice
 * par indice : le tableau D conclut « Absence d'indices d'infestation de
 * termites », globalement, ouvrage par ouvrage.
 *
 * Décomposer cette conclusion en trois assertions distinctes serait inventer
 * trois constats à partir d'un seul. Les points clés sont donc construits sur ce
 * que le rapport dit vraiment — quitte à en avoir moins que le visuel.
 *
 * ## LA RÈGLE QUI DOMINE TOUT (§ 15)
 *
 *     EXAMINÉ + ABSENCE D'INDICE   ≠   NON EXAMINÉ
 *
 * Une zone inaccessible ne devient jamais une zone sans termites. Et les zones
 * non visitées sont, très majoritairement, **les combles** — c'est-à-dire la
 * charpente, l'endroit même où les termites se voient.
 */
import type { Diagnostic, Gravite } from '../../lib/modele';

/**
 * Ce que le rapport établit sur les TERMITES, et sur eux seuls.
 *
 * ⚠️ « absence » ne veut pas dire « pas de termites dans le bâtiment » : il veut
 * dire « aucun indice sur les éléments examinés ». Le § 4 de l'ordre l'interdit
 * explicitement de simplifier plus loin.
 */
export type IssueTermites = 'indices' | 'absenceDIndices' | 'illisible';

/** Un bloc de l'écran. Absent quand le rapport ne permet pas de l'écrire. */
export interface BlocT<T> {
  readonly montrer: boolean;
  readonly entrees: readonly T[];
  /**
   * Ce qu'on dit quand il n'y a pas d'entrée — et qui change tout :
   * « la rubrique répond Néant » n'est pas « on n'a pas su lire ».
   */
  readonly mention?: string;
}

export interface LimiteT {
  /** Le local ou l'ouvrage, tel que le rapport l'écrit. */
  readonly quoi: string;
  /** La raison, quand le rapport la donne. Jamais inventée. */
  readonly pourquoi?: string;
  /**
   * `false` quand le tableau du rapport n'a pas pu être démêlé en colonnes : le
   * texte est alors cité tel quel, et l'écran le dit.
   */
  readonly separe: boolean;
}

export interface PointCle {
  readonly titre: string;
  readonly detail: string;
  readonly ton: Gravite;
}

export interface SyntheseTermites {
  readonly issue: IssueTermites;
  /** Le verdict du rapport, mot pour mot. */
  readonly resultat: string;
  readonly gravite: Gravite;
  readonly pointsCles: readonly PointCle[];
  readonly constatations: BlocT<{ terme: string; ou?: string }>;
  /** Les PIÈCES non visitées — rubrique F. */
  readonly nonVisitees: BlocT<LimiteT>;
  /** Les OUVRAGES non examinés là où l'on est entré — rubrique G. */
  readonly nonExamines: BlocT<LimiteT>;
  /** Les combles, la charpente ou le grenier sont-ils du nombre ? */
  readonly charpente: boolean;
  /** Ce que le rapport dit de sa propre complétude. Jamais un pourcentage. */
  readonly completude: readonly string[];
  readonly conseil: readonly string[];
  readonly pages: readonly [number, number];
}

/**
 * L'issue, lue sur le diagnostic — jamais devinée dans la phrase de verdict.
 *
 * On lit ce que le lecteur a établi (sa gravité, ses faits), parce que c'est lui
 * qui a lu la rubrique. Chercher des mots dans le verdict serait retomber dans
 * « chercher une info, pas un endroit ».
 */
export function issueTermites(d: Diagnostic): IssueTermites {
  if (!d.verdict) return 'illisible';
  if (d.gravite === 'neutre') return 'illisible';
  if (d.gravite === 'alerte' || d.gravite === 'attention') return 'indices';
  return 'absenceDIndices';
}

/** « une » ou « N », sans jamais écrire « 1 ». */
const compte = (n: number, singulier: string, pluriel: string): string =>
  n === 1 ? `Une ${singulier}` : `${n} ${pluriel}`;

function constatationsDe(d: Diagnostic): BlocT<{ terme: string; ou?: string }> {
  const c = d.constatations;
  if (!c) return { montrer: false, entrees: [] };

  const constats = c.entrees
    .filter((e) => e.nature === 'constat')
    .map((e) => (e.ou ? { terme: e.terme, ou: e.ou } : { terme: e.terme }));

  if (constats.length) return { montrer: true, entrees: constats };
  if (c.neant) {
    return {
      montrer: true,
      entrees: [],
      mention:
        'La rubrique « Constatations diverses » existe dans ce rapport et répond « Néant » : le diagnostiqueur n’a rien relevé d’autre.'
    };
  }
  if (!c.lue) {
    return {
      montrer: true,
      entrees: [],
      /* § 15 et § 24 : le silence est le NÔTRE. */
      mention:
        'Le modèle de ce rapport n’est pas encore couvert : cette rubrique n’a pas été lue. Cela ne veut pas dire qu’elle est vide.'
    };
  }
  return { montrer: false, entrees: [] };
}

function nonVisiteesDe(d: Diagnostic): BlocT<LimiteT> {
  const f = d.nonVisitees;
  if (!f) return { montrer: false, entrees: [] };

  if (f.pieces.length) {
    return {
      montrer: true,
      entrees: f.pieces.map((p) => ({
        quoi: p.ou,
        ...(p.pourquoi ? { pourquoi: p.pourquoi } : {}),
        separe: true
      }))
    };
  }
  if (f.neant) {
    return {
      montrer: true,
      entrees: [],
      mention: 'Le rapport répond « Néant » : toutes les pièces ont pu être visitées.'
    };
  }
  if (!f.lue) {
    return {
      montrer: true,
      entrees: [],
      mention:
        'Le modèle de ce rapport n’est pas encore couvert : cette rubrique n’a pas été lue. Cela ne veut pas dire que tout a été visité.'
    };
  }
  return { montrer: false, entrees: [] };
}

function nonExaminesDe(d: Diagnostic): BlocT<LimiteT> {
  const g = d.nonExamines;
  if (!g) return { montrer: false, entrees: [] };

  if (g.ouvrages.length) {
    return {
      montrer: true,
      entrees: g.ouvrages.map((o) => ({
        quoi: o.separable ? (o.ou ?? o.terme) : o.terme,
        ...(o.separable && o.pourquoi ? { pourquoi: o.pourquoi } : {}),
        separe: o.separable
      }))
    };
  }
  if (g.neant) {
    return {
      montrer: true,
      entrees: [],
      mention: 'Le rapport répond « Néant » : tous les ouvrages accessibles ont été examinés.'
    };
  }
  return { montrer: false, entrees: [] };
}

/**
 * La complétude, en FAITS — jamais en pourcentage.
 *
 * L'ordre l'interdit (§ E) et propose les deux formulations : « Contrôle complet
 * selon les zones accessibles » ou « Contrôle comportant des zones non
 * accessibles ». On y ajoute le compte, qui est une donnée du rapport, et la
 * charpente quand elle est en cause — parce que sur un termites, ce n'est pas
 * une zone comme une autre.
 */
function completudeDe(d: Diagnostic, f: BlocT<LimiteT>, g: BlocT<LimiteT>): string[] {
  const lignes: string[] = [];
  const pieces = f.entrees.length;
  const ouvrages = g.entrees.length;

  if (!pieces && !ouvrages) {
    if (d.nonVisitees?.neant || d.nonExamines?.neant) {
      lignes.push('Contrôle complet selon les zones accessibles.');
    }
  } else {
    lignes.push('Contrôle comportant des zones non accessibles.');
    if (pieces) {
      lignes.push(
        `${compte(pieces, 'pièce n’a pas pu être visitée', 'pièces n’ont pas pu être visitées')}.`
      );
    }
    if (ouvrages) {
      lignes.push(
        `${compte(ouvrages, 'catégorie d’ouvrages n’a pas pu être examinée', 'catégories d’ouvrages n’ont pas pu être examinées')} dans les pièces visitées.`
      );
    }
  }

  if (d.nonVisitees?.charpente) {
    lignes.push(
      'Les combles ou la charpente n’ont pas pu être contrôlés — c’est l’endroit où les termites se voient.'
    );
  }
  return lignes;
}

/**
 * Le conseil vient APRÈS les faits (§ F), et il ne contredit pas le
 * diagnostiqueur ni ne crée de fausse garantie.
 */
function conseilDe(issue: IssueTermites, charpente: boolean, limites: number): string[] {
  if (issue === 'illisible') {
    return [
      'Ce volet n’a pas pu être lu. Ouvrez le rapport : sa conclusion y est écrite noir sur blanc.'
    ];
  }
  if (issue === 'indices') {
    return [
      'Des indices ont été relevés. Faites établir un devis de traitement par une entreprise spécialisée avant de vous engager.',
      'En cas de présence de termites, la déclaration en mairie est une obligation du propriétaire (articles L. 126-4 et L. 126-5 du code de la construction et de l’habitation).'
    ];
  }
  const conseils = [
    'Aucun indice n’a été relevé sur les éléments que l’opérateur a pu examiner.'
  ];
  if (charpente) {
    conseils.push(
      'La charpente n’ayant pas pu être contrôlée, demandez au vendeur d’en faire créer l’accès et de faire compléter le constat : le cabinet s’y engage dans le rapport.'
    );
  } else if (limites) {
    conseils.push(
      'Des zones n’ont pas pu être regardées. Le rapport ne dit rien d’elles — demandez à les faire rendre accessibles si elles comptent pour vous.'
    );
  }
  return conseils;
}

export function syntheseTermites(d: Diagnostic): SyntheseTermites {
  const issue = issueTermites(d);
  const constatations = constatationsDe(d);
  const nonVisitees = nonVisiteesDe(d);
  const nonExamines = nonExaminesDe(d);
  const charpente = d.nonVisitees?.charpente ?? false;

  const pointsCles: PointCle[] = [];

  /*
   * 1. LE CONSTAT DES TERMITES, dans les mots du rapport.
   *
   * ⚠️ Jamais « aucun termite » : le rapport dit « absence d'indices
   * d'infestation de termites », et cette phrase ne porte que sur les éléments
   * examinés (§ 3, § 4).
   */
  if (issue === 'indices') {
    pointsCles.push({
      titre: 'Des indices d’infestation ont été relevés',
      detail: 'Le rapport les localise ouvrage par ouvrage.',
      ton: 'alerte'
    });
  } else if (issue === 'illisible') {
    pointsCles.push({
      titre: 'Ce volet n’a pas pu être lu',
      detail: 'Aucune conclusion ne peut en être tirée.',
      ton: 'attention'
    });
  } else {
    pointsCles.push({
      titre: 'Aucun indice d’infestation de termites',
      detail: 'Sur les éléments que l’opérateur a examinés.',
      ton: 'bon'
    });
  }

  /*
   * 2. LA CHARPENTE, quand elle n'a pas été contrôlée.
   *
   * C'est le point clé le plus important d'un rapport de termites, et il ne
   * figure sur aucun visuel : la conclusion ne porte pas sur ce que personne
   * n'a regardé.
   */
  if (charpente) {
    pointsCles.push({
      titre: 'Les combles ou la charpente n’ont pas été contrôlés',
      detail: 'C’est là que les termites se voient : la conclusion ne porte pas sur eux.',
      ton: 'attention'
    });
  } else if (nonVisitees.entrees.length) {
    pointsCles.push({
      titre: compte(
        nonVisitees.entrees.length,
        'pièce n’a pas pu être visitée',
        'pièces n’ont pas pu être visitées'
      ),
      detail: 'Le rapport ne dit rien d’elles — ni qu’elles sont saines, ni le contraire.',
      ton: 'attention'
    });
  }

  /*
   * 3. LES AUTRES AGENTS, quand la rubrique en porte.
   *
   * Vrillettes, capricornes, moisissures, pourriture, humidité : ce ne sont pas
   * des termites, et l'ordre interdit de les confondre (§ 11, § 12). On les
   * annonce sans les nommer à la place du rapport — le bloc « Constatations
   * diverses » porte leurs mots.
   */
  if (constatations.entrees.length) {
    pointsCles.push({
      titre: 'Le rapport signale autre chose que des termites',
      detail:
        'Insectes du bois, champignons, humidité : ce que l’opérateur a noté en plus, dans ses mots.',
      ton: 'attention'
    });
  }

  return {
    issue,
    resultat: d.verdict,
    gravite: d.gravite,
    pointsCles,
    constatations,
    nonVisitees,
    nonExamines,
    charpente,
    completude: completudeDe(d, nonVisitees, nonExamines),
    conseil: conseilDe(issue, charpente, nonVisitees.entrees.length + nonExamines.entrees.length),
    pages: d.pages ?? [1, 1]
  };
}
