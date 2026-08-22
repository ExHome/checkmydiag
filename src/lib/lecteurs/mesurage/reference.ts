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
import { nombre, type LectureMesurage } from './modele';

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

/** Une des surfaces du dossier, telle qu'on la présente : nommée, située, citée. */
export interface SurfaceConfrontee {
  /** L'intitulé du rapport, mot pour mot — jamais reformulé. */
  quoi: string;
  valeur: number;
  /** Où elle a été lue : « le certificat de superficie », « la page de garde du DPE ». */
  ou: string;
  /**
   * À quoi ce chiffre sert, en français de tous les jours — ou `null`.
   *
   * ⚠️ `null` n'est pas un oubli. `Superficie HSP < 1.80M` porte un intitulé qui
   * ne décrit pas son contenu : mesuré, un **jardin** et une **cave** y sont
   * rangés, et ni l'un ni l'autre n'a de hauteur sous plafond. Lui inventer une
   * explication reviendrait à affirmer, à la place du rapport, ce qu'il ne dit
   * pas. On affiche alors son intitulé seul, et rien d'autre.
   */
  aQuoiCaSert: string | null;
  source: string;
}

/**
 * Ce que chaque total veut dire — et seulement ceux dont on le sait.
 *
 * La phrase de la surface au sol vient du rapport lui-même : c'est ce que la
 * définition légale imprimée en tête de chaque certificat décrit, mot pour mot
 * (« après déduction des surfaces occupées par les murs, cloisons […] ni des
 * parties de locaux d'une hauteur inférieure à 1,80 mètre »).
 */
const A_QUOI: Record<string, string> = {
  'Surface au sol totale':
    'ce que les pièces mesurent au sol, avant déduction des murs et des hauteurs sous 1,80 m',
  'Surface totale au sol (Carrez et Hors Carrez)':
    'tout le sol du lot, ce qui compte et ce qui ne compte pas'
};

/**
 * Met TOUTES les surfaces du dossier côte à côte — **sans en arbitrer aucune**.
 *
 * ⚠️ Un écart entre elles n'est pas une erreur. Mesuré dans le corpus :
 * certificat Carrez 30,92 m², surface au sol 31,48 m², et le DPE du même dossier
 * annonce `Surface habitable : 31,48 m²`. Plusieurs mesures pour un logement,
 * c'est normal — elles ne comptent pas la même chose et ne servent pas à la même
 * chose. On les affiche nommées, on ne les moyenne jamais, et on ne désigne pas
 * la « bonne » : ce serait trancher à la place du diagnostiqueur.
 *
 * L'ordre n'est pas décoratif : la surface due par la loi vient en tête, parce
 * que c'est la seule qui s'écrira dans l'acte ou dans le bail.
 */
export function confronter(
  mesurage: Pick<LectureMesurage, 'loi' | 'surfaceAnnoncee' | 'autresTotaux'>,
  reference: SurfaceDeReference
): SurfaceConfrontee[] {
  const sorties: SurfaceConfrontee[] = [];

  if (mesurage.surfaceAnnoncee) {
    /*
     * ⚠️ Trois lois, dont une qui n'en est pas une. Un `Certificat de Surface`
     * écrit qu'il ne vaut pas comme loi Carrez : le ranger sous « ce qui
     * s'écrit dans l'acte » ou « dans le bail » lui prêterait la portée qu'il
     * refuse lui-même.
     */
    const ou =
      mesurage.loi === 'carrez'
        ? 'le certificat de superficie'
        : mesurage.loi === 'boutin'
          ? 'l’attestation de surface habitable'
          : 'le certificat de surface';
    const aQuoi =
      mesurage.loi === 'carrez'
        ? 'c’est le chiffre qui s’écrit dans l’acte de vente'
        : mesurage.loi === 'boutin'
          ? 'c’est le chiffre qui s’écrit dans le bail'
          : 'un métré : ce chiffre n’a pas de portée juridique';
    sorties.push({
      quoi: mesurage.surfaceAnnoncee.libelle,
      valeur: mesurage.surfaceAnnoncee.valeur,
      ou,
      aQuoiCaSert: aQuoi,
      source: mesurage.surfaceAnnoncee.source
    });
  }

  for (const autre of mesurage.autresTotaux) {
    sorties.push({
      quoi: autre.libelle,
      valeur: autre.valeur,
      ou: 'le même document, à côté du total',
      aQuoiCaSert: A_QUOI[autre.libelle] ?? null,
      source: autre.source
    });
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
