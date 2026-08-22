/**
 * LE LECTEUR GAZ — FORMAT BC2E.
 *
 * Mesuré sur 6 volets lus en entier le 21/08/2026 (`docs/OU-PARSER.md` § GAZ).
 * Ce format n'est pas une variante de LICIEL : c'est un autre document.
 *
 * Ce qui change, et qui interdit de réutiliser le lecteur LICIEL :
 *
 * 1. **La conclusion se lit**, en clair, sur une ligne, EN TÊTE du volet —
 *    `CONCLUSIONS / L'installation comporte une ou des anomalie(s) : A1`.
 *    Présente 6 fois sur 6. Chez LICIEL elle n'est jamais lisible.
 * 2. **Les lettres ne désignent pas les mêmes rubriques** : `B` est le titulaire
 *    du contrat, `G` porte les constatations ET les cinq phrases imprimées,
 *    `K` est la matrice des points non vérifiés — qui n'existe pas chez LICIEL.
 * 3. **Le code de point de contrôle est nu** : `8a1`, `8b`, `K`, `6b1`. Le
 *    motif préfixé de LICIEL n'y trouve rien.
 * 4. **Le rattachement anomalie → appareil est écrit**, en tête de ligne. Il
 *    n'a pas à être déduit.
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

/** Intitulés mesurés présents dans 6 volets sur 6 — capitales comprises. */
const RUBRIQUES = {
  appareils: /^D\.\s*IDENTIFICATION DES APPAREILS/i,
  anomalies: /^E\.\s*ANOMALIES IDENTIFI[ÉE]ES/i,
  nonControles: /^F\.\s*IDENTIFICATION DES B[ÂA]TIMENTS/i,
  constatations: /^G\.\s*CONSTATATIONS DIVERSES/i,
  actionsDgi: /^H\.\s*ACTIONS DE L['’]OP[ÉE]RATEUR/i,
  observations: /^J\.\s*OBSERVATIONS DIVERSES/i,
  pointsNonVerifies: /^K\.\s*POINT\(S\) DE CONTR[ÔO]LE\(S\) NON V[ÉE]RIFI[ÉE]\(S\)/i,
  conclusion: /^CONCLUSIONS\s*$/i
};

/**
 * Le code nu de la norme : numérique (`8a1`, `6b1`, `10`), lettre seule
 * (`J`, `K`, `L`) ou seuil de monoxyde (`S1`).
 */
const CODE_NU = /\b(S?\d{1,2}[a-z]?\d?|[A-Z])\b/;

/** Le lexique en bas du tableau E : il définit les niveaux, il ne constate pas. */
const LEXIQUE = /^(A1|A2|DGI|32c)\s*[:(]|^Lexique|^\*\s*Point de contr/i;

/** Les mentions de pied de page, présentes sur chaque page du volet. */
const PIED = /^(DGLM|n° de rapport|76 COURS|DIAGNOSTIC GAZ|Tel :|DDT :|Siret|RÉSERVE DE)/i;

function entre(lignes: readonly string[], debut: RegExp, fin: RegExp): string[] {
  const zone: string[] = [];
  let dedans = false;
  for (const ligne of lignes) {
    const l = ligne.trim();
    if (debut.test(l)) {
      dedans = true;
      continue;
    }
    if (dedans && fin.test(l)) break;
    if (dedans && !PIED.test(l)) zone.push(ligne);
  }
  return zone;
}

/**
 * Reconnaît le format à sa rubrique K, qui n'a pas d'équivalent chez LICIEL.
 * Mesurée dans 6 volets BC2E sur 6 et 0 volet LICIEL sur 26 : positive et
 * disjointe. On se replie sur l'intitulé des anomalies en capitales, mesuré
 * lui aussi 6/6 et 0/26, au cas où la rubrique K serait coupée par la page.
 */
export function reconnaitBc2e(lignes: readonly string[]): { preuve: string } | null {
  for (const ligne of lignes) {
    const l = ligne.trim();
    if (RUBRIQUES.pointsNonVerifies.test(l) || RUBRIQUES.anomalies.test(l)) {
      return { preuve: l.slice(0, 120) };
    }
  }
  return null;
}

function alimentation(lignes: readonly string[]): 'OUI' | 'NON' | null {
  /*
   * La mise en page sépare l'intitulé de sa réponse : « Installation » et
   * « alimentée : » encadrent un OUI/NON posé sur sa propre ligne. On regarde
   * donc les deux lignes qui suivent l'intitulé, sans jamais remonter — un
   * OUI/NON pris au-dessus appartiendrait à un autre champ.
   */
  for (let i = 0; i < lignes.length; i++) {
    const courante = lignes[i];
    if (!courante || !/Installation\s*$|Nature du gaz/i.test(courante.trim())) continue;
    for (const suivante of lignes.slice(i, i + 3)) {
      if (/\bNON\b/.test(suivante)) return 'NON';
      if (/\bOUI\b/.test(suivante)) return 'OUI';
    }
  }
  return null;
}

function mesureCO(texte: string): MesureCO {
  const m = /taux de CO[^:]*:\s*([^,;]+)/i.exec(texte) ?? /CO\s*:\s*([^,;]+)/i.exec(texte);
  if (!m?.[1]) return { etat: 'non renseignée' };
  const dit = m[1].trim();
  if (/non r[ée]alis/i.test(dit)) return { etat: 'non réalisée' };
  return { etat: 'mesurée', valeur: dit };
}

function appareils(lignes: readonly string[]): AppareilGaz[] {
  const zone = entre(lignes, RUBRIQUES.appareils, RUBRIQUES.anomalies);
  const sorties: AppareilGaz[] = [];
  for (const brute of zone) {
    const ligne = brute.trim();
    if (!ligne) continue;
    if (/^(GENRE|PUISSANCE|MARQUE|EN KW|MODÉLE|MODELE|\(1\)|\(2\)|Le ou les appareils)/i.test(ligne)) continue;
    /* Une ligne d'appareil porte son type : c'est la colonne qui l'identifie. */
    const type = /(Non raccord[ée]|Raccord[ée]|[ÉE]tanche)/i.exec(ligne)?.[1];
    if (!type) continue;
    const localisation =
      /(Cuisine|Salle de bains?|S[ée]jour|Cellier|Garage|Buanderie|Chaufferie|Local technique|Couloir|Chambre|WC|Studio)/i.exec(
        ligne
      )?.[1] ?? null;
    const puissance = /(\d+(?:[.,]\d+)?\s*kW|\bnc\b|\bNC\b)/.exec(ligne)?.[1] ?? null;
    sorties.push({
      designation: ligne,
      type,
      puissance,
      localisation,
      co: mesureCO(ligne),
      observations: [],
      source: ligne
    });
  }
  return sorties;
}

/**
 * Les anomalies de la rubrique E.
 *
 * La ligne porte, dans l'ordre : l'appareil, le code, le niveau, le libellé.
 * Le lexique des abréviations tombe dans la même zone : il cite un niveau en
 * tête de ligne, suivi de deux-points — c'est ce qui le distingue d'un constat.
 */
export function anomaliesBc2e(lignes: readonly string[]): AnomalieGaz[] {
  const zone = entre(lignes, RUBRIQUES.anomalies, RUBRIQUES.nonControles);
  const sorties: AnomalieGaz[] = [];
  for (const brute of zone) {
    const ligne = brute.trim();
    if (!ligne || LEXIQUE.test(ligne) || estUnePhraseDuFormulaire(ligne)) continue;
    if (/^(POINT DE|APPAREIL|CONTR[ÔO]LE|A1, A2|LIBELL[ÉE])/i.test(ligne)) continue;
    const niveau = niveauDe(ligne);
    if (!niveau) continue;
    /* L'appareil précède le code ; le code précède le niveau. */
    const avant = ligne.slice(0, ligne.search(new RegExp(`\\b${niveau}\\b`)));
    const code = CODE_NU.exec(avant.replace(/^[^0-9A-Za-z]+/, '').split(/\s{2,}/).pop() ?? avant)?.[1] ?? null;
    const appareil = code ? avant.slice(0, avant.lastIndexOf(code)).trim() || null : avant.trim() || null;
    sorties.push({
      code: code ?? '(non lu)',
      niveau,
      libelle: ligne,
      appareil,
      source: ligne
    });
  }
  return sorties;
}

function zonesNonControlees(lignes: readonly string[]): ZoneNonControlee[] {
  const zone = entre(lignes, RUBRIQUES.nonControles, RUBRIQUES.constatations);
  const sorties: ZoneNonControlee[] = [];
  let dansLaListe = false;
  for (const brute of zone) {
    const ligne = brute.trim();
    if (/^B[âa]timents ou parties du b[âa]timent n['’]ayant pu [êe]tre visit[ée]s/i.test(ligne)) {
      dansLaListe = true;
      continue;
    }
    if (!dansLaListe || !ligne || /^Néant$/i.test(ligne)) continue;
    sorties.push({ zone: ligne, motif: null, source: ligne });
  }
  return sorties;
}

/** La rubrique K — elle porte `néant` quand il n'y a rien, et c'est une réponse. */
function pointsNonVerifies(lignes: readonly string[]): PointNonVerifie[] {
  const zone = entre(lignes, RUBRIQUES.pointsNonVerifies, /^Etabli le|^Cachet/i);
  const sorties: PointNonVerifie[] = [];
  for (const brute of zone) {
    const ligne = brute.trim();
    if (!ligne || /^néant$/i.test(ligne)) continue;
    if (/^(APPAREIL|POINT DE CONTR|MOTIF|INSTALLATION\s*$)/i.test(ligne)) continue;
    const m = /^(.+?)\s+(S?\d{1,2}[a-z]?\d?|[A-Z])\s+(.+)$/.exec(ligne);
    if (m?.[1] && m[2] && m[3])
      sorties.push({ appareil: m[1].trim(), point: m[2], motif: m[3].trim(), source: ligne });
    else sorties.push({ appareil: null, point: '(non lu)', motif: ligne, source: ligne });
  }
  return sorties;
}

function constatations(lignes: readonly string[]): string[] {
  return entre(lignes, RUBRIQUES.constatations, RUBRIQUES.actionsDgi)
    .map((l) => l.trim())
    .filter((l) => l && !estUnePhraseDuFormulaire(l))
    .filter((l) => !/^Tant que la \(ou les\) anomalie/i.test(l));
}

/**
 * La conclusion : chez BC2E elle est écrite, en tête, et elle se lit.
 *
 * Elle suit immédiatement l'intitulé `CONCLUSIONS`. On ne prend que la première
 * ligne utile : ce qui suit est le rappel réglementaire sur le périmètre.
 */
function conclusion(lignes: readonly string[]): LectureGaz['conclusion'] {
  const zone = entre(lignes, RUBRIQUES.conclusion, /^Il est rappelé que/i);
  const dite = zone.map((l) => l.trim()).find((l) => /^L['’]installation/i.test(l));
  if (!dite) {
    return {
      lisible: false,
      pourquoi: 'La rubrique CONCLUSIONS attendue en tête du volet n’a pas été trouvée.'
    };
  }
  return { lisible: true, texte: dite, source: dite };
}

export function lireGazBc2e(lignes: readonly string[]): LectureGaz {
  return {
    alimentee: alimentation(lignes),
    natureGaz: /Nature du gaz\s*:\s*([^:]+?)(?:\s{2,}|Installation|$)/i.exec(
      lignes.find((l) => /Nature du gaz/i.test(l)) ?? ''
    )?.[1]?.trim() ?? null,
    appareils: appareils(lignes),
    anomalies: anomaliesBc2e(lignes),
    zonesNonControlees: zonesNonControlees(lignes),
    pointsNonVerifies: pointsNonVerifies(lignes),
    constatations: constatations(lignes),
    conclusion: conclusion(lignes)
  };
}

export const LECTEUR_GAZ_BC2E: Lecteur<LectureGaz> = {
  editeur: 'BC2E',
  quoi: 'état de l’installation intérieure de gaz',
  reconnait: reconnaitBc2e,
  lire: lireGazBc2e
};
