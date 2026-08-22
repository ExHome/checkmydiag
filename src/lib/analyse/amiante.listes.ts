/**
 * LE § 1.1 DU CONSTAT AMIANTE **CHEZ LICIEL** — et lui seul.
 *
 * ⚠️ Rangé par éditeur, conformément à `docs/ODM-LECTEURS-PAR-EDITEUR.md`.
 * Rien ici ne vaut chez BC2E, dont la conclusion vit en page 1, dans un bloc
 * `A - CONCLUSIONS DU REPÉRAGE EFFECTIF` sans le moindre numéro de liste.
 *
 * CE QUE 130 VOLETS LUS ONT APPRIS, et que le lecteur ignorait.
 *
 * Le § 1.1 n'est pas une phrase : **c'est une liste de listes.** Il s'ouvre
 * toujours pareil — « Liste A : Dans le cadre de mission décrit à l'article
 * 3.2, il [n']a [pas] été repéré » — puis vient **une ou plusieurs lignes à
 * tiret**, et c'est ELLES qui portent le sens :
 *
 *   - des matériaux et produits de la liste B contenant de l'amiante sur
 *     jugement personnel :                                        → PRÉSENCE
 *   - … contenant de l'amiante après analyse en laboratoire :     → PRÉSENCE
 *   - … contenant de l'amiante sur anciennes analyses :           → PRÉSENCE
 *   - … pour lesquels des sondages et/ou prélèvements doivent
 *     être effectués :                                            → NON CONCLU
 *   - … pour lesquels les résultats d'analyse … sont attendus :   → NON CONCLU
 *   - … ayant fait l'objet d'analyse, ne contenant pas d'amiante : → ABSENCE
 *
 * Un seul § 1.1 en porte jusqu'à QUATRE, une par justification, pour la seule
 * liste B — et la dernière est parfois coupée par un saut de page.
 *
 * CE QUE COÛTAIT L'ANCIENNE LECTURE. Elle décidait « présence » dès que la
 * ligne du « Liste X : » contenait « il a été repéré ». Mesuré sur les dix-huit
 * lignes de ce type rencontrées dans le corpus : **six n'annoncent pas
 * d'amiante** — cinq non conclus, une absence prouvée par analyse. Un tiers
 * d'erreur, et dans les deux sens : annoncer de l'amiante là où le laboratoire
 * dit qu'il n'y en a pas, et fermer un dossier qu'il n'a pas encore rendu.
 *
 * C'est la même faute que la classe 0 du plomb — « sous le seuil » n'est pas
 * « absence » — et que les termites du tableau D : **la phrase qui ouvre n'est
 * pas la phrase qui conclut.**
 */

/** Ce qu'une ligne à tiret établit. */
export type EtatListe = 'presence' | 'absence' | 'nonConclu';

export interface ConclusionListe {
  /** `A`, `B` ou `C`. */
  readonly liste: string;
  readonly etat: EtatListe;
  /**
   * Sur quoi la conclusion repose, telle que le rapport l'écrit — jamais
   * reformulée. Vide quand la liste conclut à l'absence sans justification.
   */
  readonly justifications: readonly string[];
}

/**
 * Ramener les dialectes de LICIEL à une forme unique.
 *
 * Le même éditeur écrit `l'amiante`, `l’amiante` et `l ’ amiante` ; `13 - 9` et
 * `13-9` ; `1.1` et `1. 1`. Et il coupe les mots au hasard de l'extraction
 * (`rep érage`, `Descri ptif`). On normalise donc les apostrophes, les tirets
 * et les espaces avant toute recherche — jamais l'inverse.
 */
export function normaliser(texte: string): string {
  return texte
    .replace(/[’‘‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s*'\s*/g, "'")
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Ce qu'une ligne établit — qu'elle soit une ligne à tiret ou la fin du libellé.
 *
 * Deux dispositions existent, et elles se lisent de la même façon :
 *
 *   Liste B : … il a été repéré :
 *   - des matériaux et produits de la liste B contenant de l'amiante sur jugement personnel :
 *
 *   Liste B : il a été repéré des matériaux contenant de l'amiante.
 *
 * La première est la forme du § 1.1 des constats ; la seconde, plus courte, se
 * rencontre notamment quand la conclusion tient sur la ligne du libellé.
 */
function etatDeLaLigne(ligne: string, exigerTiret = true): { etat: EtatListe; justification: string } | null {
  const n = normaliser(ligne);
  const sansEspaces = n.replace(/\s+/g, '').toLowerCase();
  if (exigerTiret && !/^-(de|des)mat[ée]riaux/i.test(sansEspaces)) return null;
  if (!exigerTiret && !sansEspaces.includes('matériaux') && !sansEspaces.includes('materiaux')) return null;

  /*
   * L'ordre des essais compte, et il n'est pas indifférent.
   *
   * « ayant fait l'objet d'analyse, ne contenant pas d'amiante » contient
   * « contenant de l'amiante » précédé d'un « ne … pas » que rien ne signale à
   * une recherche naïve. On écarte donc l'absence prouvée AVANT de chercher la
   * présence — sans quoi le seul volet du corpus où le laboratoire innocente la
   * liste A serait annoncé amianté.
   */
  /*
   * ⚠️ LICIEL COUPE LES MOTS AU HASARD DE L'EXTRACTION.
   *
   * Le corpus écrit « conte nant de l'amiante », « matéria ux », « exigence s »,
   * « Descri ptif », « rep érage » — la coupure tombe n'importe où, et jamais au
   * même endroit d'un rapport à l'autre. Un motif écrit sur le mot entier rate
   * alors la ligne entière.
   *
   * Ce défaut a coûté un FAUX NÉGATIF, mesuré le 21/08 : un DTA de copropriété
   * dont la liste B porte quatre conduits amiantés était rendu « aucun matériau
   * contenant de l'amiante », parce que sa ligne à tiret écrit « conte nant ».
   * C'est la faute la plus grave possible — elle ne prive pas d'une
   * information, elle affirme le contraire.
   *
   * On cherche donc sur le texte SANS AUCUN ESPACE. La coupure disparaît, et
   * avec elle toute la famille de pièges. (On ne restitue jamais cette forme :
   * elle sert à trouver, pas à citer.)
   */
  const c = n.replace(/\s+/g, '').toLowerCase();

  if (c.includes("necontenantpasd'amiante")) {
    return { etat: 'absence', justification: 'après analyse' };
  }
  if (/pourlesquelsles r?[ée]sultatsd'analyse/i.test(c) || c.includes("pourlesquelslesrésultatsd'analyse") || c.includes("pourlesquelslesresultatsd'analyse")) {
    return { etat: 'nonConclu', justification: "résultats d'analyse attendus" };
  }
  if (c.includes('pourlesquelsdessondages')) {
    return { etat: 'nonConclu', justification: 'sondages ou prélèvements à faire' };
  }
  if (c.includes("contenantdel'amiante")) {
    const justifications: [RegExp, string][] = [
      [/surjugementpersonnel/, 'sur jugement personnel'],
      [/surjugementdel'op[ée]rateur/, "sur jugement de l'opérateur"],
      [/surd[ée]cisiondel'op[ée]rateur/, "sur décision de l'opérateur"],
      [/apr[èe]sanalyseenlaboratoire/, 'après analyse en laboratoire'],
      [/suranciennesanalyses/, 'sur anciennes analyses']
    ];
    const trouve = justifications.find(([rx]) => rx.test(c));
    return { etat: 'presence', justification: trouve?.[1] ?? '' };
  }
  return null;
}

/**
 * Les conclusions du § 1.1, liste par liste — chez LICIEL.
 *
 * Une liste peut porter plusieurs lignes à tiret : on les lit toutes, jusqu'à
 * la liste suivante ou jusqu'au § 1.2. **Une présence l'emporte** sur les
 * autres états de la même liste ; à défaut, un non-conclu l'emporte sur une
 * absence — parce qu'un dossier qui n'a pas été tranché ne se referme pas.
 */
export function conclusionsParListe(lignes: readonly string[]): ConclusionListe[] {
  const out: ConclusionListe[] = [];

  for (let i = 0; i < lignes.length; i++) {
    const n = normaliser(lignes[i] ?? '');
    const m = n.match(/Liste\s*([ABC])\s*:/i);
    if (!m?.[1]) continue;
    const liste = m[1].toUpperCase();

    // L'absence se lit sur la ligne du libellé, sans ligne à tiret utile.
    if (/n'?a pas [ée]t[ée] rep[ée]r[ée]/i.test(n)) {
      out.push({ liste, etat: 'absence', justifications: [] });
      continue;
    }
    if (!/il a [ée]t[ée] rep[ée]r[ée]/i.test(n)) continue;

    /*
     * On lit les lignes à tiret jusqu'à la liste suivante ou le § 1.2.
     *
     * Le saut de page tombe parfois entre l'intitulé d'une ligne à tiret et ses
     * matériaux : on ne s'arrête donc ni sur un pied de page, ni sur un
     * en-tête, mais seulement sur une borne de rubrique.
     */
    const etats: EtatListe[] = [];
    const justifications: string[] = [];

    /*
     * La conclusion tient parfois sur la ligne du libellé elle-même — « Liste
     * B : il a été repéré des matériaux contenant de l'amiante. » On la lit
     * donc d'abord, sans exiger le tiret ; les lignes à tiret suivantes s'y
     * ajoutent, et une présence l'emporte de toute façon.
     */
    const surLaLigne = etatDeLaLigne(n.replace(/^.*?il a [ée]t[ée] rep[ée]r[ée]\s*:?\s*/i, ''), false);
    if (surLaLigne) {
      etats.push(surLaLigne.etat);
      if (surLaLigne.justification) justifications.push(surLaLigne.justification);
    }

    for (let j = i + 1; j < lignes.length; j++) {
      const suite = normaliser(lignes[j] ?? '');
      if (/Liste\s*[ABC]\s*:/i.test(suite)) break;
      if (/^1\.\s*2\.?\s/.test(suite) || /^2\.\s*[–-]/.test(suite)) break;
      const lu = etatDeLaLigne(suite);
      if (!lu) continue;
      etats.push(lu.etat);
      if (lu.justification) justifications.push(lu.justification);
    }

    if (!etats.length) continue;
    const etat: EtatListe = etats.includes('presence')
      ? 'presence'
      : etats.includes('nonConclu')
        ? 'nonConclu'
        : 'absence';
    out.push({ liste, etat, justifications: [...new Set(justifications)] });
  }

  return out;
}
