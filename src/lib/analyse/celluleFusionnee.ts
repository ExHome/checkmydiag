/**
 * LA CELLULE FUSIONNÉE — le piège qui revient dans tout le DPE.
 *
 * Trois tableaux du DPE ont la même forme : une première colonne dont chaque
 * cellule couvre plusieurs rangées, et dont l'étiquette est centrée
 * verticalement sur elles.
 *
 *  - la fiche technique         « Mur 4 Ouest » au milieu de ses dix rangées ;
 *  - la vue d'ensemble          « Chauffage » entre ses deux générateurs ;
 *  - les recommandations        « Mur » au milieu de sa consigne.
 *
 * Le PDF n'a pas de cellules : l'extraction rend des lignes, et l'étiquette
 * tombe sur celle qui se trouve à la hauteur de son centre. Elle nomme donc
 * aussi bien ce qui la précède que ce qui la suit.
 *
 * ── Premier repère : la phrase ─────────────────────────────────────────────
 *
 * Une étiquette centrée dans sa rangée tombe **à l'intérieur du texte de sa
 * rangée**, souvent au milieu d'une phrase :
 *
 *     Avant d'isoler un mur, vérifier qu'il ne présente aucune
 *     Mur                                    ← l'étiquette, dans la phrase
 *     trace d'humidité.
 *
 * Une phrase coupée par une étiquette appartient donc à cette étiquette, sans
 * discussion. C'est le repère le plus sûr, et il ne dépend d'aucune distance.
 *
 * ── Second repère : la distance, pour ce qui reste ─────────────────────────
 *
 *  1. Une étiquette qui porte **déjà du texte sur sa ligne** — « Climatisation
 *     Néant » — décrit une rangée d'une seule ligne. Elle n'attire rien.
 *  2. Une étiquette **seule sur sa ligne** réclame les phrases voisines, et
 *     **on ne franchit jamais une autre étiquette** pour aller plus loin.
 *
 * Sans le repère de la phrase, la distance seule se trompait : deux rangées
 * n'ont pas la même hauteur, donc le milieu entre deux étiquettes n'est pas la
 * frontière entre deux rangées. Mesuré sur le corpus, « Remplacer le système de
 * chauffage par une pompe à… » restait dans le lot « Mur » parce qu'il en était
 * plus proche d'une ligne.
 *
 * Ce module ne connaît aucun vocabulaire : l'appelant fournit le motif de ses
 * étiquettes. C'est le rapport qui nomme ses rubriques, pas nous.
 */

export interface RangeeFusionnee {
  /** L'étiquette, telle qu'écrite. */
  etiquette: string;
  /** Ce qu'elle porte sur sa propre ligne, s'il y a quelque chose. */
  suite: string;
  /** Les lignes qui lui reviennent, dans l'ordre du rapport. */
  lignes: string[];
}

/** Une phrase finie : point, point d'exclamation, d'interrogation, ou parenthèse fermée. */
const FIN_DE_PHRASE = /[.!?)]\s*$/;

/**
 * Une phrase commence.
 *
 * La ponctuation ne suffit pas : les tableaux du DPE portent des notes sans
 * point final — « Travaux à réaliser en lien avec la copropriété », « Travaux
 * pouvant nécessiter une autorisation d'urbanisme ». Sans ce second signal,
 * elles se collaient à la consigne suivante et emportaient tout le tableau dans
 * un seul bloc.
 *
 * Une ligne de continuation, elle, reprend en minuscule : « chaleur air/air non
 * réversible », « considérée, en cas de mise en place ».
 */
const DEBUT_DE_PHRASE = /^[A-ZÀ-ÖØ-Þ0-9«"]/;

interface Groupe {
  lignes: string[];
  /** Position moyenne du groupe, pour la mesure de distance. */
  position: number;
  /** Index des étiquettes tombées à l'intérieur du groupe. */
  dedans: number[];
}

/**
 * Rattache chaque ligne à l'étiquette qui la nomme.
 *
 * `motif` doit capturer l'étiquette en groupe 1 et le reste de la ligne en
 * groupe 2. Les rangées sortent dans l'ordre où le rapport les imprime, et une
 * étiquette qui revient deux fois donne deux rangées : le §10 exige que deux
 * générateurs restent deux générateurs.
 */
export interface OptionsRattachement {
  /**
   * Ce qui, dans la suite d'une étiquette, appartient à une AUTRE colonne.
   *
   * « Eau chaude sanitaire COP = 3 » : la suite n'est pas la description de la
   * rangée, c'est la cellule « performance recommandée » imprimée à côté du
   * lot. Cette rangée-là attend toujours sa description, donc elle attire —
   * alors que « Climatisation Néant », dont la suite EST la description, n'attire
   * rien. Sans cette distinction, la consigne de l'eau chaude restait accrochée
   * à l'étiquette précédente.
   *
   * L'appelant fournit ce motif : le module ne connaît toujours aucun
   * vocabulaire.
   */
  suiteEstUneAutreColonne?: RegExp;
}

export function rattacher(
  lignes: string[],
  motif: RegExp,
  options: OptionsRattachement = {}
): RangeeFusionnee[] {
  const reperes: { rangee: RangeeFusionnee; ligne: number }[] = [];

  for (let i = 0; i < lignes.length; i++) {
    const m = (lignes[i] as string).match(motif);
    if (!m) continue;
    const suite = (m[2] ?? '').trim();
    reperes.push({
      rangee: { etiquette: (m[1] as string).trim(), suite, lignes: suite ? [suite] : [] },
      ligne: i
    });
  }
  if (reperes.length === 0) return [];

  const estMarqueur = new Set(reperes.map((r) => r.ligne));

  /*
   * On regroupe en phrases, en laissant une étiquette tomber DEDANS : c'est
   * précisément ce qu'elle fait dans le tableau, et c'est ce qui la trahit.
   */
  const groupes: Groupe[] = [];
  let courant: Groupe | null = null;
  for (let i = 0; i < lignes.length; i++) {
    const ligne = (lignes[i] as string).trim();
    if (estMarqueur.has(i)) {
      if (courant) courant.dedans.push(i);
      continue;
    }
    if (!ligne) continue;
    if (!courant) {
      courant = { lignes: [], position: i, dedans: [] };
      groupes.push(courant);
    }
    courant.lignes.push(ligne);
    courant.position = (courant.position + i) / 2;

    /* La phrase s'arrête à son point, ou dès que la suivante commence. */
    let suivante: string | null = null;
    for (let j = i + 1; j < lignes.length; j++) {
      if (estMarqueur.has(j)) continue;
      const l = (lignes[j] as string).trim();
      if (!l) continue;
      suivante = l;
      break;
    }
    if (FIN_DE_PHRASE.test(ligne) || (suivante !== null && DEBUT_DE_PHRASE.test(suivante))) {
      courant = null;
    }
  }

  /*
   * Une étiquette qui a déjà sa description décrit une rangée d'une ligne, et
   * n'attire rien. Mais une étiquette dont la suite est la cellule d'une AUTRE
   * colonne attend encore sa description : elle attire comme si elle était
   * seule.
   */
  const autreColonne = options.suiteEstUneAutreColonne;
  const attire = (r: (typeof reperes)[number]) =>
    r.rangee.suite === '' || (autreColonne !== undefined && autreColonne.test(r.rangee.suite));

  for (const groupe of groupes) {
    /* Premier repère : l'étiquette tombée dans la phrase l'emporte. */
    const dedans = groupe.dedans[0];
    if (dedans !== undefined) {
      const cible = reperes.find((r) => r.ligne === dedans);
      if (cible) {
        cible.rangee.lignes.push(...groupe.lignes);
        continue;
      }
    }

    /* Second repère : la plus proche des étiquettes qui attirent. */
    const i = groupe.position;
    const haut = [...reperes].reverse().find((r) => r.ligne < i) ?? null;
    const bas = reperes.find((r) => r.ligne > i) ?? null;
    const voisins = [haut, bas].filter((r): r is (typeof reperes)[number] => r !== null);
    const candidats = voisins.filter(attire);
    /*
     * Quand aucune voisine n'attire — deux étiquettes qui portent déjà leur
     * texte, comme « Chauffage SCOP = 4 » et « Eau chaude sanitaire COP = 3 » —
     * la phrase revient à la PLUS PROCHE, pas à celle du dessus. Sinon la
     * consigne de l'eau chaude restait accrochée au chauffage.
     */
    const entreLesDeux = candidats.length === 0 ? voisins : candidats;
    const cible = entreLesDeux.reduce<(typeof reperes)[number] | null>(
      (a, b) => (a === null || Math.abs(b.ligne - i) < Math.abs(a.ligne - i) ? b : a),
      null
    );
    cible?.rangee.lignes.push(...groupe.lignes);
  }

  return reperes.map((r) => r.rangee);
}
