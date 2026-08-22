/**
 * LE LECTEUR ÉLECTRICITÉ — FORMAT LICIEL.
 *
 * Mesuré sur neuf volets lus en entier le 21/08/2026 (`docs/OU-PARSER.md`
 * § ÉLECTRICITÉ) : cinq sans anomalie, quatre avec. Ce lecteur ne tourne QUE
 * sur ce format.
 *
 * Les deux faits de ce format qui commandent tout le reste :
 *
 * 1. **La conclusion ne se lit pas.** La rubrique 5 imprime les DEUX phrases
 *    opposées l'une sous l'autre — « ne comporte aucune anomalie » ET
 *    « comporte une ou des anomalies » — et la case qui les départage est un
 *    graphique, absent du texte extrait. Le bloc entier est d'ailleurs
 *    identique au caractère près d'un bien à l'autre : il ne porte aucune
 *    information.
 * 2. **Le tableau, lui, ne s'imprime que s'il y a quelque chose à y mettre.**
 *    C'est le seul signal lisible du verdict — mesuré sans exception sur les
 *    neuf volets.
 *
 * ⚠️ Pourquoi ce lecteur doit être enfermé chez LICIEL : AnalysImmo ouvre son
 * paragraphe 5 par LA MÊME phrase, puis range ses anomalies tout autrement.
 * Appliquer la règle du tableau chez lui faisait conclure « aucune anomalie »
 * sur un volet qui en portait sept — une conformité inventée.
 */
import type { Lecteur, Preuve } from '../socle';
import type { Anomalie } from '../../modele';
import { anomaliesDuTableau, porteUnTableauDAnomalies } from '../../analyse/tableau-anomalies';

/** Ce que le lecteur électricité rend : les anomalies, et le verdict lisible. */
export interface LectureElectricite {
  anomalies: Anomalie[];
  /**
   * `true` quand le volet ne porte aucune anomalie.
   *
   * Ce n'est PAS l'absence d'un signe : c'est l'absence du tableau **dans un
   * format où sa présence est la règle**, ce qui n'a de sens qu'une fois
   * l'éditeur nommé.
   */
  sansAnomalie: boolean;
}

/**
 * Les deux marqueurs qui nomment LICIEL, tous deux mesurés sur les quatre
 * volets lus et absents chez AnalysImmo comme chez DPE WIN.
 *
 * La signature est POSITIVE : on reconnaît LICIEL à un signe qu'il porte,
 * jamais à l'absence d'un signe chez un autre.
 */
const SIGNATURES: { motif: RegExp; quoi: string }[] = [
  {
    // « 5. – Conclusion relative… » : le tiret demi-cadratin après le numéro.
    motif: /^\d\s*\.\s*[–—]\s*\S/,
    quoi: 'numérotation de rubrique à tiret demi-cadratin'
  },
  {
    // La table des informations complémentaires s'ouvre par son code de domaine.
    motif: /^IC\.\s/,
    quoi: 'table des informations complémentaires « IC. »'
  }
];

export const electriciteLiciel: Lecteur<LectureElectricite> = {
  editeur: 'LICIEL',
  quoi: 'état de l’installation intérieure d’électricité',

  reconnait(lignes: readonly string[]): Preuve | null {
    for (const brut of lignes) {
      const l = brut.replace(/\s+/g, ' ').trim();
      for (const s of SIGNATURES) {
        if (s.motif.test(l)) return { preuve: `${s.quoi} — « ${l.slice(0, 60)} »` };
      }
    }
    return null;
  },

  lire(lignes: readonly string[]): LectureElectricite {
    const copie = [...lignes];
    return {
      anomalies: anomaliesDuTableau(copie),
      sansAnomalie: !porteUnTableauDAnomalies(copie)
    };
  }
};
