/**
 * Rubrique F — les pièces que l'opérateur n'a PAS pu visiter.
 *
 * ## Pourquoi c'est l'information principale d'un rapport de termites
 *
 * « EXAMINÉ + ABSENCE D'INDICE » n'est pas « NON EXAMINÉ ». Une zone
 * inaccessible ne peut jamais devenir une zone sans termites — c'est le § 15 de
 * l'ordre de mission, et il est absolu.
 *
 * Or les pièces que le rapport déclare non visitées sont, dans leur écrasante
 * majorité, **les combles**. Et des combles non visités, cela veut dire **la
 * charpente non contrôlée** — c'est-à-dire précisément l'endroit où les termites
 * se voient. Un rapport qui conclut « absence d'indices » sans que personne soit
 * monté dans les combles ne dit pas la même chose qu'un rapport où tout a été
 * regardé, et Verrière ne faisait pas la différence.
 *
 * ## Mesuré le 22/08/2026, sur 250 volets termites
 *
 * ```
 * rubrique F trouvée              : 249 sur 250
 * répondue « Néant »              : la grande majorité
 * qui NOMME au moins une pièce    : les autres
 * ```
 *
 * Les motifs relevés, mot pour mot — tous parlent d'accès, aucun de termites :
 *
 * ```
 * Absence de trappe de visite            Trappe d'accès trop petite
 * Plafond rampant, contrôle de la        Moyen d'accès insuffisant
 *   charpente impossible                 Accès condamné
 * Encombrement trop important            Emplacement non identifiable
 * Impossibilité d'entrer / mansarde      Problèmes mécaniques
 * Absence d'accès : préconisation de création d'accès sécurisé par le propriétaire
 * Contrôle de la charpente impossible sous les doublages dans le grenier
 * ```
 *
 * ## ⚠️ UN LECTEUR PAR ÉDITEUR — le titre lui-même diffère
 *
 * ```
 * LICIEL  « F. – Identification des bâtiments et parties DU BÂTIMENT
 *           (pièces et volumes) n'ayant pu être visités et justification : »
 * BC2E    « F. IDENTIFICATION DES BÂTIMENTS ET PARTIES DE BÂTIMENTS
 *           (PIÈCES ET VOLUMES) N'AYANT PU ÊTRE VISITÉS ET JUSTIFICATION : »
 * ```
 *
 * « parties DU bâtiment » chez l'un, « parties DE bâtimentS » chez l'autre. Un
 * motif écrit sur LICIEL ne trouve pas la rubrique de BC2E — mesuré : elle
 * ressortait « ABSENTE » sur le seul volet BC2E du corpus.
 *
 * Et le titre court sur DEUX lignes chez les deux : on l'accroche sur sa
 * première, jamais sur la phrase entière.
 */

/** Espaces et apostrophes écrasés : l'extraction coupe les mots au milieu. */
function aplati(l: string): string {
  return l
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, '')
    .toLowerCase();
}

function propre(t: string): string {
  return t.replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1').trim();
}

export interface PieceNonVisitee {
  /**
   * La ligne du rapport, entière — « 1er étage - Combles (Absence de trappe de
   * visite) ». On cite, puis on explique.
   */
  terme: string;
  /** OÙ : ce qui précède la parenthèse. */
  ou: string;
  /**
   * POURQUOI : ce que la parenthèse dit, dans les mots du rapport.
   *
   * Vide quand le rapport n'en donne pas — jamais deviné (§ 24).
   */
  pourquoi: string;
}

export interface LectureNonVisitees {
  /** La rubrique a-t-elle été trouvée ? */
  trouvee: boolean;
  /**
   * La rubrique existe et répond « Néant » : tout a été visité.
   *
   * ⚠️ Distinct de `trouvee: false`. Répondre n'est pas se taire, et se taire
   * n'est pas répondre.
   */
  neant: boolean;
  pieces: PieceNonVisitee[];
  editeur: string | null;
}

const RIEN: LectureNonVisitees = { trouvee: false, neant: false, pieces: [], editeur: null };

/**
 * Le titre, accroché sur sa PREMIÈRE ligne.
 *
 * Il court sur deux lignes chez les deux éditeurs, et les mots diffèrent
 * (« du bâtiment » / « de bâtiments »). On accroche donc le début, commun, et on
 * exige la marque « n'ayant pu » qui distingue F de G.
 */
const TITRE_F = /^[a-z]?[.\-–—]*identificationdesb[âa]timentsetparties?d[eu]/;
const MARQUE_F = /n['’]?ayantpu/;

/** Ce qui referme : la rubrique G, ou le nota de bas de rubrique. */
const FIN_F =
  /^[a-z]?[.\-–—]*(?:identificationdesouvrages|moyensd'investigation|visa|constatationsdiverses)|^nota\s*\d*:|^note\s*\d*:/;

/** La seconde ligne du titre, à ne pas prendre pour du contenu. */
const SUITE_DU_TITRE = /^(?:être)?visit[ée]setjustification:?$/;

/** L'habillage qui traverse la rubrique aux sauts de page. */
const HABILLAGE = /^etatrelatif|^sarl|^rcs:|^rapportdu:?$|^\d+\/\d+$|^n°siren|^\d{2}\/\d{2}\/\d{4}$/;

/**
 * Découper les entrées.
 *
 * ⚠️ Le séparateur est « **),** » — une virgule APRÈS la parenthèse fermante —
 * et non la virgule seule : les motifs en contiennent (« Plafond rampant,
 * contrôle de la charpente impossible »). Découper sur la virgule casserait le
 * motif en deux.
 */
function decouper(corps: string): PieceNonVisitee[] {
  const morceaux = corps
    .split(/\)\s*,\s*/)
    .map((m, i, tous) => (i < tous.length - 1 ? `${m})` : m))
    .map(propre)
    .filter((m) => m.length > 1);

  return morceaux.map((terme) => {
    const m = /^(.*?)\s*\((.+)\)\s*\.?$/s.exec(terme);
    /* Sans parenthèse, le rapport ne donne pas de motif : on ne lui en invente
       pas un. Le « où » est alors la ligne entière. */
    return m?.[1]
      ? { terme, ou: propre(m[1]), pourquoi: propre(m[2] ?? '') }
      : { terme, ou: terme, pourquoi: '' };
  });
}

function lireRubriqueF(lignes: string[], editeur: string): LectureNonVisitees {
  const plats = lignes.map(aplati);

  for (let debut = 0; debut < lignes.length; debut++) {
    if (!TITRE_F.test(plats[debut] ?? '')) continue;
    /* La marque « n'ayant pu » distingue F de G : les deux titres commencent
       par « Identification des… ». Elle peut tomber sur la ligne suivante. */
    if (!MARQUE_F.test(`${plats[debut]}${plats[debut + 1] ?? ''}`)) continue;

    const apres = plats.slice(debut + 1).findIndex((l) => FIN_F.test(l));
    const fin = apres < 0 ? Math.min(debut + 20, lignes.length) : debut + 1 + apres;

    const corps = propre(
      lignes
        .slice(debut + 1, fin)
        .filter((_l, i) => {
          const a = plats[debut + 1 + i] ?? '';
          return a !== '' && !SUITE_DU_TITRE.test(a) && !HABILLAGE.test(a);
        })
        .join(' ')
    );

    if (!corps) continue;
    if (/^n[ée]ant\.?$/i.test(corps)) {
      return { trouvee: true, neant: true, pieces: [], editeur };
    }
    return { trouvee: true, neant: false, pieces: decouper(corps), editeur };
  }

  return RIEN;
}

/**
 * Lire la rubrique F — avec la carte de CET éditeur.
 *
 * Les deux cartes se rejoignent ici : la rubrique est une liste, pas un tableau
 * à colonnes entrelacées, et sa forme est la même de part et d'autre une fois le
 * titre reconnu. C'est assez rare pour être dit — et cela ne dispense pas de
 * nommer l'éditeur : le TITRE, lui, diffère, et un éditeur non couvert reste
 * sans lecture (§ 15).
 */
export function piecesNonVisitees(
  lignes: string[],
  editeur: string | null | undefined
): LectureNonVisitees {
  if (editeur === 'LICIEL' || editeur === 'BC2E') return lireRubriqueF(lignes, editeur);
  return RIEN;
}

/**
 * Les combles ou la charpente sont-ils du nombre ?
 *
 * La question n'est pas décorative : c'est là que les termites se voient. Un
 * « absence d'indices » sans montée dans les combles ne vaut pas un « absence
 * d'indices » sur un bien entièrement regardé.
 */
export function charpenteNonControlee(lecture: LectureNonVisitees): boolean {
  return lecture.pieces.some((p) => /combles?|charpente|grenier|toiture/i.test(p.terme));
}
