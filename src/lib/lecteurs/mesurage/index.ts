/**
 * LES LECTEURS DE MESURAGE — un par éditeur.
 *
 * *Contrainte absolue, permanente et générale du 21/08/2026 : on ne parse pas
 * de la même façon d'un éditeur à l'autre. On nomme l'éditeur AVANT de lire,
 * puis on lit avec le lecteur mesuré sur cet éditeur-là.*
 *
 * Deux formats sont connus, et ils ont été mesurés le 22/08/2026 :
 *
 * | | Volets lus en entier | Ce que la lecture a montré |
 * |---|---|---|
 * | LICIEL | 10 | totaux imprimés deux fois, commentaire enjambant sa ligne, rubrique des pièces non visitées |
 * | BC2E | 8 | conclusion en tête, trois colonnes de surface, réserves de mission en clair |
 *
 * Le vocabulaire des deux éditeurs est **inversé** : LICIEL dit *surface* là où
 * BC2E dit *superficie*, pour les deux lois. Un lecteur unique bâti sur l'un de
 * ces deux mots aurait attribué la mauvaise loi chez l'autre — c'est-à-dire
 * annoncé la pièce d'une vente à quelqu'un qui tient celle d'une location, avec
 * un chiffre parfaitement vraisemblable et aucune erreur levée nulle part.
 *
 * **Ajouter un éditeur, c'est ajouter un fichier et une ligne ici** — jamais
 * élargir un motif existant pour qu'il « passe aussi » ailleurs.
 */
import { aiguiller, type Aiguillage, type Lecteur } from '../socle';
import { LECTEUR_MESURAGE_LICIEL } from './liciel';
import { LECTEUR_MESURAGE_BC2E } from './bc2e';
import type { LectureMesurage } from './modele';

export const LECTEURS_MESURAGE: readonly Lecteur<LectureMesurage>[] = [
  LECTEUR_MESURAGE_LICIEL,
  LECTEUR_MESURAGE_BC2E
];

/**
 * Lit un volet de mesurage avec le lecteur de son éditeur.
 *
 * Rend `format inconnu` quand aucune signature ne reconnaît le document — et
 * c'est une réponse à part entière. Une surface fausse ne se voit pas : elle
 * s'écrit dans un acte, et se conteste ensuite au tribunal. Dire « je ne sais
 * pas lire ce format » vaut infiniment mieux que rendre un nombre plausible.
 */
export function lireLeMesurage(lignes: readonly string[]): Aiguillage<LectureMesurage> {
  return aiguiller(LECTEURS_MESURAGE, lignes);
}

export { LECTEUR_MESURAGE_LICIEL } from './liciel';
export { LECTEUR_MESURAGE_BC2E } from './bc2e';
export { ecartNonCompte, piecesEcartees, nombre } from './modele';
export { lireLaSurfaceDeReference, confronter } from './reference';
export { trouverLeCroquis, legendeDuCroquis } from './croquis';
export type {
  LectureMesurage,
  Loi,
  PieceMesuree,
  PieceNonVisitee,
  Rubrique,
  Surface
} from './modele';
export type { SurfaceDeReference, SurfaceConfrontee } from './reference';
export type { Croquis } from './croquis';
