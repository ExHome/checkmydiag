/**
 * LES LECTEURS DE DPE — un par éditeur.
 *
 * On nomme l'éditeur avant de lire. Cette liste dit exactement ce que Verrière
 * sait lire aujourd'hui : un seul format, et c'est une information, pas un
 * manque.
 *
 * **Ajouter un éditeur, c'est ajouter une ligne ici et un fichier à côté.** Ce
 * n'est jamais élargir un motif du lecteur LICIEL pour qu'il « passe aussi »
 * ailleurs. Le DPE en donne la preuve : sa fiche technique, son tableau de
 * recommandations et sa vue d'ensemble des équipements sont trois tableaux à
 * cellules fusionnées dont la mise en page a été mesurée **chez LICIEL et chez
 * lui seul**. Rien ne dit qu'un autre éditeur enroule ses libellés de la même
 * façon, et tout dit le contraire — sur le gaz, trois repères tirés de vingt-six
 * volets LICIEL sont tombés en six lectures BC2E.
 *
 * ## L'état du corpus, au 21/08/2026
 *
 * - **26 volets DPE LICIEL** lus en entier : reconnus par déclaration, 26/26.
 * - **6 volets DPE BC2E** : leur corps est imprimé en image, 7,1 lignes de
 *   texte par page dont l'en-tête et le pied. Aucune signature ne les
 *   reconnaît, et c'est la bonne réponse — il n'y a rien à lire.
 * - Les huit autres logiciels DPE validés par le ministère ne sont **pas
 *   mesurés**. Non pas absents : non mesurés.
 */
import { aiguiller, type Aiguillage, type Lecteur } from '../socle';
import { LECTEUR_DPE_LICIEL, type LectureDpe } from './liciel';

export const LECTEURS_DPE: readonly Lecteur<LectureDpe>[] = [LECTEUR_DPE_LICIEL];

/**
 * Lit un volet DPE avec le lecteur de son éditeur.
 *
 * Rend `format inconnu` quand aucune signature ne le reconnaît. C'est une
 * réponse à part entière, et l'écran doit l'afficher telle quelle : mieux vaut
 * dire qu'on ne sait pas lire ce format que d'en tirer un bâtiment
 * approximatif.
 */
export function lireLeDpe(lignes: readonly string[]): Aiguillage<LectureDpe> {
  return aiguiller(LECTEURS_DPE, lignes);
}

export type { LectureDpe } from './liciel';
