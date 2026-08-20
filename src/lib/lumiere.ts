/**
 * « Lumière sur… » — le fil de la marque, décliné écran par écran.
 *
 * La signature du produit est « Lumière sur vos diagnostics », telle qu'elle
 * est gravée dans le logo fourni. Elle se reprend
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

/**
 * LA QUESTION À LAQUELLE L'ÉCRAN RÉPOND.
 *
 * « Un écran = une question. » L'accroche de marque dit ce qu'on regarde ;
 * elle ne dit pas ce que le lecteur, lui, est venu savoir. Or il n'ouvre pas
 * « le DPE » : il se demande si son logement consomme beaucoup.
 *
 * Poser la question en tête change la lecture de l'écran entier — ce qui suit
 * n'est plus une rubrique à parcourir, c'est une réponse. Et le lecteur sait
 * en un regard s'il est au bon endroit.
 *
 * ── Ce qu'elles ne font pas ────────────────────────────────────────────────
 *
 * Elles ne présument rien du résultat. « Y a-t-il de l'amiante ? » se pose
 * aussi bien quand le rapport n'en trouve pas : c'est une question, pas une
 * alerte. Une formule comme « Votre logement est-il dangereux ? » inquiéterait
 * avant même d'avoir lu, ce que la même règle interdit à l'accroche.
 */
const QUESTIONS: Record<Ecran, string> = {
  dpe: 'Mon logement consomme-t-il beaucoup ?',
  electricite: 'Y a-t-il un risque électrique ?',
  gaz: 'Mon installation de gaz présente-t-elle un danger ?',
  amiante: 'Y a-t-il de l’amiante, et où ?',
  plomb: 'Du plomb a-t-il été identifié, et où ?',
  termites: 'Des termites ou des champignons ont-ils été détectés ?',
  erp: 'À quels risques ce terrain est-il exposé ?',
  carrez: 'Quelle surface sera écrite dans l’acte ?',
  assainissement: 'Les eaux usées sont-elles correctement évacuées ?',
  dicodiag: 'Que veut dire ce mot ?',
  'en-clair': 'Que faut-il savoir avant d’acheter ?'
};

/** La question de l'écran. Les onze sont couverts. */
export function questionDe(ecran: Ecran): string {
  return QUESTIONS[ecran];
}
