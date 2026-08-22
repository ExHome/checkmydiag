/**
 * LES LECTEURS AMIANTE — un par éditeur.
 *
 * *Contrainte absolue, permanente et générale du 21/08/2026 : on ne parse pas
 * de la même façon d'un éditeur à l'autre. On nomme l'éditeur AVANT de lire,
 * puis on lit avec le lecteur mesuré sur cet éditeur-là.*
 *
 * Deux formats connus, tous deux mesurés par lecture intégrale :
 *
 * | | Volets lus en entier | Ce que la mesure a montré |
 * |---|---|---|
 * | LICIEL | 126 | § 1.1 = liste de listes, jusqu'à 4 conclusions pour une liste ; mots coupés au hasard ; droit imprimé dans 100 % des volets |
 * | BC2E | 4 | conclusion en page 1, sans numéro de liste ; sigles + légende ; droit imprimé seulement si positif |
 *
 * **Quatre volets BC2E ont suffi à démentir des traits tenus pour acquis sur
 * 126 LICIEL** — dont le plus dangereux : chez LICIEL « travaux de retrait »
 * est du bruit, chez BC2E c'est un signal.
 *
 * **Ajouter un éditeur, c'est ajouter un fichier et une ligne ici** — jamais
 * élargir un motif existant pour qu'il « passe aussi » ailleurs.
 */
import { aiguiller, type Aiguillage, type Lecteur } from '../socle';
import { LECTEUR_AMIANTE_LICIEL } from './liciel';
import { LECTEUR_AMIANTE_BC2E } from './bc2e';
import type { LectureAmiante } from './modele';

export const LECTEURS_AMIANTE: readonly Lecteur<LectureAmiante>[] = [
  LECTEUR_AMIANTE_BC2E,
  LECTEUR_AMIANTE_LICIEL
];

/**
 * Lit un volet amiante avec le lecteur de son éditeur.
 *
 * Rend `format inconnu` quand aucune signature ne reconnaît le document — et
 * c'est une réponse à part entière. **14 documents du corpus amiante n'ont
 * aucun texte extractible** : un volet muet se lit exactement comme un volet
 * sans amiante, et dire « je ne sais pas lire ce format » est la seule réponse
 * qui ne trompe pas.
 */
export function lireLAmiante(lignes: readonly string[]): Aiguillage<LectureAmiante> {
  return aiguiller(LECTEURS_AMIANTE, lignes);
}

export { LECTEUR_AMIANTE_LICIEL } from './liciel';
export { LECTEUR_AMIANTE_BC2E } from './bc2e';
export type {
  LectureAmiante,
  MateriauAmiante,
  LimiteAmiante,
  IssueAmiante,
  Justification,
  MissionAmiante
} from './modele';
