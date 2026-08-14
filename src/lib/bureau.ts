/**
 * Ce que l'écran d'accueil compte, et ce qu'il en dit.
 *
 * Sorti du composant pour être mesurable : les trois compteurs sont la première
 * chose que le lecteur voit, et un compteur faux discrédite tout le reste de la
 * page. Ils se testent donc, ligne à ligne.
 *
 * Règle qui tient tout ce fichier : la phrase de synthèse ne chiffre ni travaux,
 * ni délai, ni montant. Aucun rapport de diagnostic ne porte ces nombres — les
 * afficher reviendrait à les inventer.
 */
import type { Diagnostic } from './modele';

export interface CompteDuDossier {
  /** Ce qui appelle une action avant la signature. */
  aRegler: number;
  /** Ce qui mérite une question, sans bloquer. */
  aVerifier: number;
  /**
   * Ce qui n'appelle aucune action.
   *
   * « Pour information » et non « OK » : un rapport qui n'a rien relevé
   * n'établit pas une absence, il dit ce qu'il a cherché et où.
   */
  pourInformation: number;
}

export function compterLeDossier(diagnostics: readonly Diagnostic[]): CompteDuDossier {
  return {
    aRegler: diagnostics.filter((d) => d.gravite === 'alerte').length,
    aVerifier: diagnostics.filter((d) => d.gravite === 'attention').length,
    pourInformation: diagnostics.filter((d) => d.gravite === 'bon' || d.gravite === 'neutre').length
  };
}

/**
 * La phrase du cartouche : ce que le dossier établit, et rien de plus.
 *
 * Elle suit l'ordre d'urgence — ce qui bloque, puis ce qui se demande, puis le
 * cas où il n'y a rien à signaler.
 */
export function phraseDuDossier(compte: CompteDuDossier): string {
  if (compte.aRegler > 0) {
    return compte.aRegler === 1
      ? 'Un diagnostic demande une action avant la signature.'
      : `${compte.aRegler} diagnostics demandent une action avant la signature.`;
  }

  if (compte.aVerifier > 0) {
    return compte.aVerifier === 1
      ? 'Un diagnostic mérite une question au vendeur.'
      : `${compte.aVerifier} diagnostics méritent une question au vendeur.`;
  }

  return 'Aucun diagnostic du dossier ne signale d’anomalie.';
}
