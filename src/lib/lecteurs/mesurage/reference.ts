/**
 * LA TROISIÈME SURFACE — la **référence**, et elle n'est pas dans le mesurage.
 *
 * Aude a demandé la liseuse « Carrez / Boutin / référence ». Les deux premières
 * se lisent dans le volet mesurage ; la troisième ne s'y trouve pas. Elle est
 * imprimée sur la **page de garde du DPE**, et son intitulé a changé :
 *
 * | Intitulé | Vu sur |
 * |---|---|
 * | `Surface habitable : 60.72 m²` | DPE 2022 |
 * | `Surface de référence : 42,47 m²` | DPE 2024-2026 |
 *
 * Ce module se donne donc les lignes du **volet DPE**, jamais celles du
 * mesurage : les deux documents emploient les mêmes mots pour des mesures
 * différentes, et les mélanger reviendrait à faire dire à l'un le chiffre de
 * l'autre.
 */
import { nombre } from './modele';

/**
 * Deux états, et le second n'est pas un zéro.
 *
 * « Absente » veut dire : la page de garde du DPE ne porte pas cette ligne, ou
 * il n'y a pas de DPE dans le dossier. Ce n'est pas un logement sans surface.
 */
export type SurfaceDeReference =
  | { etat: 'lue'; valeur: number; libelle: string; source: string }
  | { etat: 'absente' };

const INTITULES = [
  { motif: /^Surface de référence\s*:\s*([\d\s.,]+?)\s*m/i, libelle: 'Surface de référence' },
  { motif: /^Surface habitable\s*:\s*([\d\s.,]+?)\s*m/i, libelle: 'Surface habitable' }
] as const;

/** Lit la surface déclarée en tête du DPE. À nourrir avec le volet DPE seul. */
export function lireLaSurfaceDeReference(lignes: readonly string[]): SurfaceDeReference {
  for (const brute of lignes) {
    const ligne = brute.trim();
    for (const { motif, libelle } of INTITULES) {
      const valeur = nombre(motif.exec(ligne)?.[1]);
      if (valeur !== null) return { etat: 'lue', valeur, libelle, source: ligne };
    }
  }
  return { etat: 'absente' };
}

/** Une des trois surfaces, telle qu'on la présente : nommée, située, citée. */
export interface SurfaceConfrontee {
  /** « Superficie privative (loi Carrez) », « Surface de référence »… */
  quoi: string;
  valeur: number;
  /** Où elle a été lue : « certificat de superficie », « page de garde du DPE ». */
  ou: string;
  /** À quoi elle sert, en français de tous les jours. */
  aQuoiCaSert: string;
  source: string;
}

/**
 * Met les surfaces du dossier côte à côte — **sans en arbitrer aucune**.
 *
 * ⚠️ Un écart entre elles n'est pas une erreur. Mesuré dans le corpus :
 * certificat Carrez 30,92 m², surface au sol 31,48 m², et le DPE du même dossier
 * annonce `Surface habitable : 31,48 m²`. Trois mesures pour un logement, c'est
 * normal — elles ne comptent pas la même chose et ne servent pas à la même
 * chose. On les affiche nommées, on ne les moyenne jamais, et on ne désigne pas
 * la « bonne » : ce serait trancher à la place du diagnostiqueur.
 */
export function confronter(
  mesurage: { loi: 'carrez' | 'boutin'; surfaceLegale: { valeur: number; source: string } | null },
  reference: SurfaceDeReference
): SurfaceConfrontee[] {
  const sorties: SurfaceConfrontee[] = [];

  if (mesurage.surfaceLegale) {
    sorties.push(
      mesurage.loi === 'carrez'
        ? {
            quoi: 'Superficie privative (loi Carrez)',
            valeur: mesurage.surfaceLegale.valeur,
            ou: 'le certificat de superficie',
            aQuoiCaSert: 'c’est le chiffre qui s’écrit dans l’acte de vente',
            source: mesurage.surfaceLegale.source
          }
        : {
            quoi: 'Surface habitable (loi Boutin)',
            valeur: mesurage.surfaceLegale.valeur,
            ou: 'l’attestation de surface habitable',
            aQuoiCaSert: 'c’est le chiffre qui s’écrit dans le bail',
            source: mesurage.surfaceLegale.source
          }
    );
  }

  if (reference.etat === 'lue') {
    sorties.push({
      quoi: reference.libelle,
      valeur: reference.valeur,
      ou: 'la page de garde du DPE',
      aQuoiCaSert: 'c’est la surface sur laquelle la consommation d’énergie est calculée',
      source: reference.source
    });
  }

  return sorties;
}
