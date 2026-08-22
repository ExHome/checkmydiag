/**
 * LES LECTEURS DE CREP — un par éditeur.
 *
 * On nomme l'éditeur avant de lire. Tant qu'un seul format est connu, cette
 * liste en contient un seul — et c'est une information, pas un manque : elle
 * dit exactement ce que Verrière sait lire aujourd'hui.
 *
 * **Ajouter un éditeur, c'est ajouter une ligne ici et un fichier à côté.** Ce
 * n'est jamais élargir un motif du lecteur LICIEL pour qu'il « passe aussi »
 * ailleurs : un motif élargi fait passer l'habitude d'un logiciel pour une
 * règle du métier, et c'est le défaut que cette architecture existe pour
 * empêcher.
 *
 * Mesure du 21/08/2026 : sur 111 volets plomb répartis dans tout le corpus,
 * 111 viennent de dossiers LICIEL. Le corpus disponible est mono-éditeur ; les
 * autres formats restent donc **non mesurés**, jamais « absents ».
 */
import { aiguiller, type Aiguillage, type Lecteur } from '../socle';
import { LECTEUR_CREP_LICIEL } from './liciel';
import type { UniteDeDiagnostic } from './liciel';

export const LECTEURS_CREP: readonly Lecteur<UniteDeDiagnostic[]>[] = [LECTEUR_CREP_LICIEL];

/**
 * Lit les unités de diagnostic d'un volet plomb, avec le lecteur de son éditeur.
 *
 * Rend `format inconnu` quand aucune signature ne reconnaît le document. C'est
 * une réponse à part entière : mieux vaut dire qu'on ne sait pas lire ce format
 * que d'en tirer des unités approximatives.
 */
export function lireLesUnites(lignes: readonly string[]): Aiguillage<UniteDeDiagnostic[]> {
  return aiguiller(LECTEURS_CREP, lignes);
}

export type { UniteDeDiagnostic, MesureXrf, EtatRevetement } from './liciel';
