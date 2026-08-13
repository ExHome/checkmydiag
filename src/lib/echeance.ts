/**
 * Jusqu'à quand un diagnostic vaut.
 *
 * La date n'est pas une décoration : un état termites périmé fait repousser une
 * signature. Elle est donc calculée au même endroit pour tout le monde — la
 * fiche du diagnostic et le voyant du dossier doivent dire la même chose, au
 * jour près.
 */
import { enDate, VALIDITE_MOIS } from './analyse/coherence';
import type { Diagnostic } from './modele';

export interface Echeance {
  texte: string;
  perimee: boolean;
}

export function echeance(d: Diagnostic, aujourdhui: Date = new Date()): Echeance {
  const duree = VALIDITE_MOIS[d.type];
  if (duree === undefined) return { texte: 'Sans limite', perimee: false };

  const depart = enDate(d.date);
  // Sans date de visite, on ne peut annoncer qu'une durée, pas une échéance :
  // inventer un point de départ reviendrait à inventer une date de péremption.
  if (!depart) {
    return {
      texte: duree >= 12 ? `Valable ${duree / 12} ans` : `Valable ${duree} mois`,
      perimee: false
    };
  }

  const fin = new Date(depart);
  fin.setMonth(fin.getMonth() + duree);
  const perimee = fin.getTime() < aujourdhui.getTime();

  return {
    texte: `${perimee ? 'Périmé depuis le ' : 'Valable jusqu’au '}${fin.toLocaleDateString('fr-FR')}`,
    perimee
  };
}
