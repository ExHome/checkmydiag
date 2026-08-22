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
    if (/\bNON\b/.test(ligne)) return 'NON';
    if (/\bOUI\b/.test(ligne)) return 'OUI';
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

  const GENRE = /^(Chaudi[èe]re|Cuisini[èe]re|Table de cuisson|Chauffe[- ]?(?:eau|bain)s?|Radiateur|Po[êe]le|Insert|Appareil|Robinet)\b/i;
  const trouves: AppareilGaz[] = [];
  const observations: string[] = [];

  for (const brute of zone) {
    const ligne = brute.trim();
    if (!ligne || NOTE.test(ligne)) continue;
    if (/^(Observations|Liste des installations|Type|gaz \(Genre|l['’]impossibilit)/i.test(ligne)) continue;

    if (GENRE.test(ligne)) {
      const type = /(Non raccord[ée]|Raccord[ée]|[ÉE]tanche)/i.exec(ligne)?.[1] ?? null;
      const puissance = /(\d+(?:[.,]\d+)?\s*kW)/i.exec(ligne)?.[1] ?? null;
      const localisation =
        /((?:Rez de chauss[ée]e|RDC|Sous-sol|\d+(?:er|e|ème) [ée]tage|Combles)[^|]*?)(?:\s{2,}|$)/i.exec(ligne)?.[1]?.trim() ??
        null;
      trouves.push({ designation: ligne, type, puissance, localisation, co: { etat: 'non renseignée' }, observations: [], source: ligne });
    } else {
      observations.push(ligne);
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
  const sorties: AnomalieGaz[] = [];
  for (const brute of zone) {
    const ligne = brute.trim();
    if (!ligne || NOTE.test(ligne) || estUnePhraseDuFormulaire(ligne)) continue;
    const code = CODE.exec(ligne);
    if (!code) continue;
    sorties.push({
      code: `${code[1] ?? ''} - ${code[2] ?? ''}`.trim(),
      niveau: niveauDe(ligne),
      libelle: ligne,
      /* Le rattachement se lit à la géométrie des colonnes : pas ici. */
      appareil: null,
      source: ligne
    });
  }
  return sorties;
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
    if (/^Nota|responsabilit[ée] du donneur|^être contrôlés|^d['’]accident/i.test(ligne)) continue;
    if (RUBRIQUES.pointsNonVerifies.test(ligne)) break;
    if (/^contrôlés et motifs/i.test(ligne)) continue;
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

function constatations(lignes: readonly string[]): string[] {
  return entre(lignes, RUBRIQUES.constatations, RUBRIQUES.conclusion)
    .map((l) => l.trim())
    .filter((l) => l && !/^(Commentaires|Documents remis|Observations compl)/i.test(l))
    .filter((l) => !estUnePhraseDuFormulaire(l))
    .filter((l) => !/^(SARL|RCS|Rapport du|Etat de l|\d+ \/ \d+)/i.test(l));
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
