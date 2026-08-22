/**
 * LE LECTEUR GAZ — FORMAT LICIEL.
 *
 * Mesuré sur 26 volets lus en entier le 21/08/2026 (`docs/OU-PARSER.md` § GAZ).
 * Ce lecteur ne tourne QUE sur ce format : appliqué à un autre, il rendrait de
 * l'information fausse en silence, et c'est ce que l'architecture interdit.
 *
 * Les trois faits de ce format qui commandent tout le reste :
 *
 * 1. **La conclusion ne se lit pas.** Les cinq réponses possibles sont
 *    imprimées l'une sous l'autre, 26 fois sur 26 ; la réponse est une case
 *    cochée, absente du texte extrait.
 * 2. **La lettre de rubrique n'est pas fiable** : dans 2 volets sur 26, la
 *    conclusion n'a pas de lettre et `H.` désigne les actions en cas de DGI.
 *    On borne donc sur les intitulés, jamais sur la lettre seule.
 * 3. **Le code de point de contrôle est préfixé du chapitre** — `C.7 - 8a1`,
 *    `D.3 - S1` — là où d'autres éditeurs l'écrivent nu.
 */
import type { Lecteur } from '../socle';
import {
  estUnePhraseDuFormulaire,
  niveauDe,
  type AnomalieGaz,
  type AppareilGaz,
  type LectureGaz,
  type MesureCO,
  type PointNonVerifie,
  type ZoneNonControlee
} from './modele';

/** Les intitulés de rubrique, mesurés présents dans 26 volets sur 26. */
const RUBRIQUES = {
  appareils: /^D\.\s*-\s*Identification des appareils/i,
  anomalies: /^E\.\s*-\s*Anomalies identifiées/i,
  /* ⚠️ tiret demi-cadratin dans F, trait d'union ailleurs. */
  nonControles: /^F\.\s*[–-]\s*Identification des b[âa]timents/i,
  constatations: /^G\.\s*-\s*Constatations diverses/i,
  /* La conclusion porte la lettre H dans 24 volets, aucune lettre dans 2. */
  conclusion: /^(?:H\.\s*-\s*)?Conclusion\s*:?\s*$/i,
  /* Le second bloc de F : la matrice des tests non réalisés. */
  pointsNonVerifies: /Liste des points de contr[ôo]les? n['’]ayant pas pu [êe]tre r[ée]alis[ée]s/i
};

/**
 * Le code de point de contrôle, chez LICIEL : chapitre, tiret, puis le point de
 * la norme — qui peut être numérique (`8a1`), une lettre seule (`J`, `K`, `L`)
 * ou un seuil de monoxyde (`S1`).
 */
const CODE = /\b([A-Z]\.\d+)\s*-\s*(S?\d+[a-z]?\.?\d*|[A-Z])\b/;

/** Une note de bas de tableau : `(4) A1 : …`. Elle définit, elle ne constate pas. */
const NOTE = /^\(\d+\)/;

/**
 * Une note qui DÉFINIT un niveau — `(4) A1 : L'installation présente…`.
 * C'est elle qui marque la fin du tableau ; les appels isolés, non.
 */
const DEFINITION = /^\(\d+\)\s*(A1|A2|DGI|32c)\s*:/i;

/** La seconde ligne d'un appareil : elle porte le modèle, et avec lui les colonnes. */
const LIGNE_MODELE = /^Mod[èe]le\s*:|^(?:Non raccord[ée]|Raccord[ée]|[ÉE]tanche)\b/i;

/**
 * Un lieu du logement, tel que le rapport l'écrit — « Rez de jardin - Chaufferie ».
 * La liste vient du corpus : les niveaux nommés y sont toujours de cette forme.
 */
const LIEU =
  /((?:Rez de chauss[ée]e|Rez de jardin|RDC|Sous-sol|Combles|\d+(?:er|e|ème)? [ée]tage)(?:[^|]*?))(?:\s{2,}|\s+(?:Entretien|Mesure CO|Partiellement|Photo|Localisation sur|Fonctionnement|Autre)\b|$)/i;

/** « Entretien appareil : Oui / Non / Sans objet » — un champ du volet gaz. */
const ENTRETIEN_APPAREIL = /Entretien appareil\s*:\s*(Oui|Non|Sans objet)/i;
const ENTRETIEN_CONDUIT = /Entretien conduit\s*:\s*(Oui|Non|Sans objet)/i;

/** Les genres d'appareils que le rapport énumère lui-même, en note (1). */
const GENRE =
  /^(Chaudi[èe]re|Cuisini[èe]re|Table de cuisson|Chauffe[- ]?(?:eau|bain)s?|Radiateur|Po[êe]le|Insert|Appareil|Robinet)\b/i;

/**
 * L'estampille du cabinet, répétée en pied de CHAQUE page du volet.
 *
 * Elle tombe au milieu des rubriques et ressortait en « zone non contrôlée » :
 * un pied de page présenté comme une pièce que l'opérateur n'a pas pu visiter
 * est pire qu'une information manquante.
 */
const ESTAMPILLE =
  /^(SARL|SAS|EURL|SCI)\b|^RCS\s*:|^Rapport du\s*:?$|^\d{1,2}\/\d{1,2}\/\d{4}$|^\d+\s*\/\s*\d+$|^Etat de l\s*['’]\s*installation intérieure de Gaz n°|^Tél\.|MMA \d/i;

/** Les lignes du volet comprises entre deux intitulés. */
function entre(lignes: readonly string[], debut: RegExp, fin: RegExp): string[] {
  const zone: string[] = [];
  let dedans = false;
  for (const ligne of lignes) {
    if (debut.test(ligne.trim())) {
      dedans = true;
      continue;
    }
    if (dedans && fin.test(ligne.trim())) break;
    if (dedans) zone.push(ligne);
  }
  return zone;
}

/**
 * Reconnaît le format à sa forme : l'intitulé de la rubrique des anomalies,
 * avec son tiret et sa casse. Mesuré présent dans 26 volets LICIEL sur 26, et
 * dans 0 volet BC2E sur 6 — la signature est positive et disjointe.
 */
export function reconnaitLiciel(lignes: readonly string[]): { preuve: string } | null {
  for (const ligne of lignes) {
    if (RUBRIQUES.anomalies.test(ligne.trim())) return { preuve: ligne.trim().slice(0, 120) };
  }
  return null;
}

function alimentation(lignes: readonly string[]): 'OUI' | 'NON' | null {
  for (const ligne of lignes) {
    if (!/Installation aliment[ée]e en gaz/i.test(ligne)) continue;
    const oui = /\bOUI\b/.test(ligne);
    const non = /\bNON\b/.test(ligne);
    /*
     * ⚠️ Les DEUX réponses sur la même ligne : c'est un formulaire à cocher, et
     * la coche est un dessin. Mesuré le 22/08/2026 sur un volet d'annexe LICIEL
     * qui imprime « Installation alimentée en gaz : OUI NON », comme il imprime
     * juste au-dessus « Type de bâtiment : Appartement Maison individuelle ».
     *
     * La version précédente testait NON en premier et rendait donc « non
     * alimentée ». Or une installation non alimentée ne permet AUCUN essai :
     * l'annoncer à tort fausse la portée de tout le volet. On rend `null` —
     * l'information n'est pas dans le texte, et on ne la devine pas.
     */
    if (oui && non) return null;
    if (non) return 'NON';
    if (oui) return 'OUI';
  }
  return null;
}

function mesureCO(observations: readonly string[]): MesureCO {
  for (const o of observations) {
    const m = /Mesure CO\s*:\s*(.+)$/i.exec(o);
    if (!m?.[1]) continue;
    const dit = m[1].trim();
    if (/non r[ée]alis/i.test(dit)) return { etat: 'non réalisée' };
    /* La valeur est recopiée telle quelle : « >30 ppm » est un seuil, pas 30. */
    return { etat: 'mesurée', valeur: dit };
  }
  return { etat: 'non renseignée' };
}

/**
 * Les appareils de la rubrique D.
 *
 * ⚠️ La mise en page éclate chaque ligne du tableau et intercale les
 * observations AVANT l'appareil qu'elles décrivent. Depuis du texte aplati, le
 * rattachement observation → appareil n'est donc pas sûr dès qu'il y a
 * plusieurs appareils. On rend alors les observations du bloc entier sur
 * l'appareil unique, et rien de plus : mieux vaut une observation non
 * rattachée qu'une observation rattachée au mauvais appareil.
 */
function appareils(lignes: readonly string[]): AppareilGaz[] {
  const zone = entre(lignes, RUBRIQUES.appareils, RUBRIQUES.anomalies);
  if (zone.some((l) => /^\s*Néant\s*[-\s]*$/.test(l))) return [];

  const trouves: AppareilGaz[] = [];
  const observations: string[] = [];

  for (const brute of zone) {
    const ligne = brute.trim();
    if (!ligne || NOTE.test(ligne)) continue;
    if (/^(Observations|Liste des installations|Type|gaz \(Genre|l['’]impossibilit)/i.test(ligne)) continue;

    if (GENRE.test(ligne)) {
      trouves.push({
        designation: ligne,
        type: null,
        puissance: null,
        annee: null,
        entretienAppareil: null,
        entretienConduit: null,
        localisation: null,
        co: { etat: 'non renseignée' },
        observations: [],
        source: ligne
      });
    } else if (LIGNE_MODELE.test(ligne) && trouves.length > 0) {
      /*
       * ⚠️ UN APPAREIL EST DÉCRIT SUR DEUX LIGNES.
       *
       * Le genre et la marque ouvrent le bloc, mais le type, la puissance et la
       * localisation vivent sur la ligne du modèle :
       *
       *   Chaudière RIELLO
       *   Modèle: TREGI 5N   Raccordé   36 kW   Rez de jardin - Chaufferie
       *
       * Ne lire que la première faisait rendre « puissance non renseignée » et
       * « localisation non renseignée » sur un appareil dont le rapport donne
       * les deux. « Non renseigné » doit dire que le rapport se tait, jamais
       * que le lecteur n'a pas cherché au bon endroit.
       */
      const a = trouves[trouves.length - 1]!;
      a.type ??= /(Non raccord[ée]|Raccord[ée]|[ÉE]tanche)/i.exec(ligne)?.[1] ?? null;
      a.puissance ??= /(\d+(?:[.,]\d+)?\s*kW)/i.exec(ligne)?.[1] ?? null;
      a.localisation ??= LIEU.exec(ligne)?.[1]?.trim() ?? null;
      a.entretienAppareil ??= ENTRETIEN_APPAREIL.exec(ligne)?.[1]?.trim() ?? null;
      a.entretienConduit ??= ENTRETIEN_CONDUIT.exec(ligne)?.[1]?.trim() ?? null;
      a.source += ' | ' + ligne;
    } else {
      /*
       * « Installation: 2012 » — l'annee de pose, sur sa propre ligne, apres
       * l'appareil qu'elle date. Elle sert a dire l'age du materiel, jamais a
       * conclure a la vetuste : le rapport ne porte pas ce jugement.
       */
      const an = /^Installation\s*:\s*(\d{4})/.exec(ligne);
      const dernier = trouves[trouves.length - 1];
      if (an?.[1] && dernier && !dernier.annee) dernier.annee = an[1];
      else observations.push(ligne);
    }
  }

  const seul = trouves.length === 1 ? trouves[0] : undefined;
  if (seul) {
    seul.observations = observations;
    seul.co = mesureCO(observations);
  } else if (trouves.length > 1) {
    /* Plusieurs appareils : on ne devine pas à qui va quoi. */
    for (const a of trouves) a.observations = [];
  }
  return trouves;
}

/**
 * Les anomalies de la rubrique E.
 *
 * Le repère est le CODE, jamais le mot A1/A2/DGI : dans la même zone tombent la
 * fin de la légende de colonne (`DGI (6) , 32c (7) )`, présente dans 9 volets
 * sur 26 dont 4 sans aucune anomalie), les notes de bas de tableau et leurs
 * lignes de continuation. Aucune ne porte de code.
 */
export function anomaliesLiciel(lignes: readonly string[]): AnomalieGaz[] {
  const zone = entre(lignes, RUBRIQUES.anomalies, RUBRIQUES.nonControles);

  /*
   * ⚠️ UNE ANOMALIE EST UN BLOC, PAS UNE LIGNE.
   *
   * La mise en page éclate les colonnes : le code est seul sur sa ligne, le
   * niveau est ailleurs, le libellé court sur plusieurs lignes, et la
   * localisation arrive entre parenthèses. Relevé tel quel :
   *
   *   C.7 - 8a1
   *   Au moins un organe de coupure d'appareil est
   *   Organe de Coupure d'Appareil     A1
   *   absent. (Chaudière CHAPPEE LUNA ST)
   *
   * Une version antérieure ne gardait que la ligne du code : elle rendait un
   * libellé réduit à « C.7 - 8a1 » et un niveau `null` — les A1, A2 et DGI du
   * rapport étaient PERDUS. On découpe donc en blocs, du code au code suivant,
   * et on lit le bloc entier.
   */
  const blocs: string[][] = [];
  let courant: string[] | null = null;
  /*
   * Les notes `(4) A1 : …` ferment le tableau : tout ce qui les suit leur
   * appartient. Sans ce drapeau, la continuation de la note 5 — « fourniture du
   * gaz, mais est suffisamment importante… » — s'accrochait au libellé de la
   * dernière anomalie, qui héritait ainsi d'un texte qu'elle ne dit pas.
   */
  let dansLesNotes = false;
  for (const brute of zone) {
    const ligne = brute.trim();
    /*
     * ⚠️ Seule une note qui DÉFINIT un niveau ferme le tableau. Les appels
     * isolés — `(3)`, `(4) (5)` — figurent aussi dans l'EN-TÊTE, en renvoi de
     * colonne : s'y fier faisait fermer le tableau avant la première anomalie,
     * et le volet ressortait à zéro anomalie alors qu'il portait un DGI.
     */
    if (DEFINITION.test(ligne)) dansLesNotes = true;
    if (dansLesNotes) continue;
    if (NOTE.test(ligne)) continue;
    if (!ligne || estUnePhraseDuFormulaire(ligne)) continue;
    if (ESTAMPILLE.test(ligne)) continue;
    if (/^(Anomalies|Points de contrôle|\(selon la norme\)|DGI\s*,?\s*32c|Libellé des anomalies|observées|Photos)/i.test(ligne)) continue;
    if (CODE.test(ligne)) {
      courant = [ligne];
      blocs.push(courant);
    } else if (courant) {
      courant.push(ligne);
    }
  }

  return blocs.map((bloc) => {
    const code = CODE.exec(bloc[0] ?? '');
    /* Le niveau est cité par une seule ligne du bloc, et une seule fois. */
    let niveau: AnomalieGaz['niveau'] = null;
    for (const l of bloc) {
      const n = niveauDe(l);
      if (n) { niveau = n; break; }
    }
    /*
     * Le libellé, c'est le bloc sans sa ligne de code — recollé. Les fragments
     * de colonne voisine s'y mêlent : on les garde plutôt que de les trancher,
     * car le § 2 de l'ordre de mission impose de conserver le libellé source.
     */
    const libelle = bloc
      .slice(1)
      .filter((l) => l !== niveau)
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    /*
     * L'appareil est écrit entre parenthèses — mais toutes les parenthèses ne
     * sont pas des appareils. Le libellé de la norme glose ses propres termes :
     * « un taux de CO (Monoxyde de Carbone) supérieur à 25 ppm ». Prendre la
     * première parenthèse venue rattachait l'anomalie à « Monoxyde de Carbone ».
     *
     * On n'accepte donc qu'une parenthèse qui NOMME un appareil, au sens de la
     * liste de genres du rapport. Sinon `null` : rattacher au mauvais appareil
     * est explicitement interdit, se taire ne l'est pas.
     */
    const parentheses = [...libelle.matchAll(/\(([^)]{3,})\)/g)].map((m) => m[1]?.trim() ?? '');
    const appareil = parentheses.find((p) => GENRE.test(p)) ?? null;
    return {
      code: code ? `${code[1] ?? ''} - ${code[2] ?? ''}`.trim() : '(non lu)',
      niveau,
      libelle: libelle || (bloc[0] ?? ''),
      appareil,
      source: bloc.join(' | ')
    };
  });
}

/** « Néant » en rubrique E : aucune anomalie constatée. Mesuré sur 13 volets. */
export function aucuneAnomalieDeclaree(lignes: readonly string[]): boolean {
  return entre(lignes, RUBRIQUES.anomalies, RUBRIQUES.nonControles).some((l) =>
    /^\s*Néant\s*-\s*-\s*$/.test(l.trim())
  );
}

function zonesNonControlees(lignes: readonly string[]): ZoneNonControlee[] {
  const zone = entre(lignes, RUBRIQUES.nonControles, RUBRIQUES.constatations);
  const sorties: ZoneNonControlee[] = [];
  for (const brute of zone) {
    const ligne = brute.trim();
    if (!ligne || /^Néant$/i.test(ligne)) continue;
    /* Le Nota court sur trois lignes : on écarte chacune, pas seulement la première. */
    if (/^Nota|responsabilit[ée] du donneur|^être contrôlés|^d\s*['’]\s*accident|^accident ou d/i.test(ligne)) continue;
    if (RUBRIQUES.pointsNonVerifies.test(ligne)) break;
    if (/^contrôlés et motifs/i.test(ligne)) continue;
    /* Le pied de page du cabinet n'est pas une pièce non contrôlée. */
    if (ESTAMPILLE.test(ligne)) continue;
    const m = /^(.+?)\s*\((.+)\)\s*,?$/.exec(ligne);
    sorties.push({ zone: m?.[1]?.trim() ?? ligne, motif: m?.[2]?.trim() ?? null, source: ligne });
  }
  return sorties;
}

/**
 * Le second bloc de la rubrique F — la matrice des tests non réalisés.
 *
 * ⚠️ Il coexiste avec un `Néant` écrit juste au-dessus, qui ne répond qu'à la
 * première question du titre. Lire le `Néant` et conclure « tout a été
 * contrôlé » est faux : mesuré sur 1 volet sur 26, six points non réalisés y
 * suivent le `Néant`.
 */
function pointsNonVerifies(lignes: readonly string[]): PointNonVerifie[] {
  const zone = entre(lignes, RUBRIQUES.pointsNonVerifies, RUBRIQUES.constatations);
  const sorties: PointNonVerifie[] = [];
  for (const brute of zone) {
    const ligne = brute.trim();
    if (!ligne) continue;
    if (/^(Point de contr[ôo]le|Points d[ée]sign[ée]s|Appareil|Type|Observations|\(selon)/i.test(ligne)) continue;
    if (/^(SARL|RCS|Rapport du|Etat de l|\d+ \/ \d+)/i.test(ligne)) continue;
    const point = /^([A-Z]\)|S\d\)|[A-Z]\.\d+)/.exec(ligne)?.[1]?.replace(/\)$/, '') ?? null;
    if (!point) continue;
    sorties.push({ appareil: null, point, motif: ligne, source: ligne });
  }
  return sorties;
}

/**
 * Les constatations de la rubrique G.
 *
 * ⚠️ La rubrique porte trois sous-blocs — `Commentaires :`, `Documents remis
 * par le donneur d'ordre :` et `Observations complémentaires :` — et chacun
 * peut répondre `Néant`. Ces « Néant » sont des RÉPONSES à leur sous-bloc, pas
 * des constatations : les laisser passer faisait afficher « Néant » comme s'il
 * s'agissait d'une observation du diagnostiqueur.
 */
function constatations(lignes: readonly string[]): string[] {
  return entre(lignes, RUBRIQUES.constatations, RUBRIQUES.conclusion)
    .map((l) => l.trim())
    .filter((l) => l && !/^(Commentaires|Documents remis|Observations compl)/i.test(l))
    .filter((l) => !/^Néant\.?$/i.test(l))
    .filter((l) => !estUnePhraseDuFormulaire(l))
    .filter((l) => !ESTAMPILLE.test(l));
}

export function lireGazLiciel(lignes: readonly string[]): LectureGaz {
  return {
    alimentee: alimentation(lignes),
    natureGaz: /Nature du gaz\s*:?\s*\.*\s*(.+)$/i.exec(lignes.find((l) => /Nature du gaz/i.test(l)) ?? '')?.[1]?.trim() ?? null,
    appareils: appareils(lignes),
    anomalies: anomaliesLiciel(lignes),
    zonesNonControlees: zonesNonControlees(lignes),
    pointsNonVerifies: pointsNonVerifies(lignes),
    constatations: constatations(lignes),
    conclusion: {
      lisible: false,
      pourquoi:
        'Chez LICIEL, les cinq réponses possibles sont imprimées l’une sous l’autre et la réponse est une case cochée, absente du texte. La conclusion se déduit de la rubrique E, jamais de la rubrique de conclusion.'
    }
  };
}

export const LECTEUR_GAZ_LICIEL: Lecteur<LectureGaz> = {
  editeur: 'LICIEL',
  quoi: 'état de l’installation intérieure de gaz',
  reconnait: reconnaitLiciel,
  lire: lireGazLiciel
};
