/**
 * « Lumière sur… » — le fil de la marque, décliné écran par écran.
 *
 * La signature du produit est « Lumière sur vos diagnostics ». Elle se reprend
 * à l'entrée de chaque écran, appliquée à ce qu'on va y lire : lumière sur
 * votre DPE, sur le gaz, sur l'amiante. Le lecteur retrouve la même promesse à
 * chaque fois, formulée pour ce qu'il ouvre.
 *
 * ── Pourquoi une table, et pas une phrase à trous ───────────────────────────
 *
 * « Lumière sur le/la/les + nom » ne se calcule pas : on dit « sur le gaz »,
 * « sur l'amiante », « sur votre installation électrique ». Un gabarit
 * produirait « sur le amiante » une fois sur trois, et une marque qui écorche
 * le français perd plus qu'elle ne gagne à répéter son slogan.
 *
 * ── Ce qu'on ne fait pas dire à la formule ──────────────────────────────────
 *
 * Elle nomme le SUJET du diagnostic, jamais son résultat. « Lumière sur les
 * termites » quand le rapport est sain serait une accroche qui inquiète pour
 * rien ; « lumière sur l'état parasitaire » dit ce qu'on a regardé, et laisse
 * le verdict au verdict.
 *
 * C'est aussi pour cela que le parasitaire ne s'appelle pas « termites » ici :
 * le diagnostic couvre les insectes à larves xylophages et les champignons
 * lignivores, mérule comprise. Le raccourci ferait passer la mérule — qui
 * attaque la structure — pour un hors-sujet.
 */
import type { Ecran } from './univers';

const FORMULES: Record<Ecran, string> = {
  dpe: 'Lumière sur votre DPE',
  electricite: 'Lumière sur votre installation électrique',
  amiante: 'Lumière sur l’amiante',
  plomb: 'Lumière sur le plomb',
  gaz: 'Lumière sur le gaz',
  termites: 'Lumière sur l’état parasitaire',
  erp: 'Lumière sur les risques du terrain',
  carrez: 'Lumière sur la surface',
  assainissement: 'Lumière sur l’assainissement',
  dicodiag: 'Lumière sur les mots du métier',
  'en-clair': 'Lumière sur vos questions'
};

/** L'accroche de l'écran. Toujours définie : les onze écrans sont couverts. */
export function lumiereSur(ecran: Ecran): string {
  return FORMULES[ecran];
}

/** La signature de la marque, telle que la charte l'écrit. */
export const SIGNATURE = 'Lumière sur vos diagnostics';
