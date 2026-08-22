/**
 * LES LECTEURS GAZ — un par éditeur.
 *
 * *Contrainte absolue, permanente et générale du 21/08/2026 : on ne parse pas
 * de la même façon d'un éditeur à l'autre. On nomme l'éditeur AVANT de lire,
 * puis on lit avec le lecteur mesuré sur cet éditeur-là.*
 *
 * Deux formats sont connus, et ils ont été mesurés :
 *
 * | | Volets lus en entier | Ce que la mesure a montré |
 * |---|---|---|
 * | LICIEL | 26 | conclusion illisible, code préfixé, rattachement géométrique |
 * | BC2E | 6 | conclusion écrite en tête, code nu, rattachement explicite |
 *
 * Les six volets BC2E ont suffi à faire tomber trois repères tirés des 26
 * LICIEL. C'est la démonstration de l'architecture : un lecteur unique aurait
 * accumulé des rustines et se serait trompé, en silence, chez le troisième.
 *
 * **Ajouter un éditeur, c'est ajouter un fichier et une ligne ici** — jamais
 * élargir un motif existant pour qu'il « passe aussi » ailleurs.
 */
import { aiguiller, type Aiguillage, type Lecteur } from '../socle';
import { LECTEUR_GAZ_LICIEL } from './liciel';
import { LECTEUR_GAZ_BC2E } from './bc2e';
import type { LectureGaz } from './modele';

export const LECTEURS_GAZ: readonly Lecteur<LectureGaz>[] = [LECTEUR_GAZ_LICIEL, LECTEUR_GAZ_BC2E];

/**
 * Lit un volet gaz avec le lecteur de son éditeur.
 *
 * Rend `format inconnu` quand aucune signature ne reconnaît le document — et
 * c'est une réponse à part entière. Le gaz est le seul diagnostic qui peut
 * faire couper l'alimentation le jour même : dire « je ne sais pas lire ce
 * format » vaut infiniment mieux qu'en tirer des anomalies approximatives.
 */
export function lireLeGaz(lignes: readonly string[]): Aiguillage<LectureGaz> {
  return aiguiller(LECTEURS_GAZ, lignes);
}

export { LECTEUR_GAZ_LICIEL } from './liciel';
export { LECTEUR_GAZ_BC2E } from './bc2e';
export type {
  LectureGaz,
  AnomalieGaz,
  AppareilGaz,
  MesureCO,
  NiveauAnomalie,
  PointNonVerifie,
  ZoneNonControlee,
  ConclusionGaz
} from './modele';
