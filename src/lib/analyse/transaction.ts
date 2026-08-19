/**
 * Vente ou location : le dossier le dit, et cela commande toutes les durées.
 *
 * Les diagnostics n'ont pas la même validité selon la transaction — trois ans
 * pour l'électricité et le gaz à la vente, six ans à la location ; un an pour
 * un constat plomb positif à la vente, six ans à la location. Annoncer la
 * mauvaise durée, c'est faire présenter un document caduc à la signature.
 *
 * Rien ne l'écrit en toutes lettres sur la page de garde. Mais le dossier le
 * trahit de quatre façons, relevées en lisant :
 *
 *  - le **préambule de l'électricité et du gaz** annonce sa propre durée, et
 *    la location cite l'article 3-3 de la loi du 6 juillet 1989 ;
 *  - la **surface** demandée n'est pas la même : loi Carrez pour vendre,
 *    surface habitable dite « Boutin » pour louer ;
 *  - le **CREP** coche ses cases en texte : « X Avant la vente » ou
 *    « X Avant la mise en location ».
 *
 * Une cinquième piste a été essayée puis abandonnée — les parties nommées par
 * l'état des risques — parce que l'imprimé porte « bailleur » et « locataire »
 * même pour une vente. Voir plus bas.
 *
 * Aucune de ces marques n'est sûre à elle seule : un dossier peut porter une
 * attestation de surface habitable ET un certificat Carrez, et cela arrive
 * vraiment. On les compte donc toutes, et on ne conclut que si elles penchent
 * nettement du même côté. Mesuré sur soixante dossiers : trente-sept vendus,
 * treize loués, huit indécis et deux muets — et les huit indécis portent
 * réellement les deux surfaces.
 */

export type Transaction = 'vente' | 'location';

export interface Indice {
  /** Ce que le dossier écrit, repris fidèlement. */
  marque: string;
  penche: Transaction;
}

export interface LectureTransaction {
  /** La conclusion, ou `null` quand les indices ne tranchent pas. */
  transaction: Transaction | null;
  indices: Indice[];
}

const MARQUES: { motif: RegExp; penche: Transaction; marque: string }[] = [
  // Le préambule de l'électricité et du gaz annonce sa durée.
  {
    motif: /dur[ée]e de validit[ée] de (?:3|trois) ans/i,
    penche: 'vente',
    marque: 'validité de 3 ans annoncée par le rapport'
  },
  {
    motif: /dur[ée]e de validit[ée] de (?:6|six) ans/i,
    penche: 'location',
    marque: 'validité de 6 ans annoncée par le rapport'
  },
  {
    motif: /article 3\s*-?\s*3 de la loi n[°o]\s*89\s*-?\s*462/i,
    penche: 'location',
    marque: 'article 3-3 de la loi du 6 juillet 1989 (rapports locatifs)'
  },
  // La surface : Carrez pour vendre, habitable dite « Boutin » pour louer.
  {
    motif: /certificat de superficie|superficie de la (?:partie|surface) privative|loi Carrez/i,
    penche: 'vente',
    marque: 'mesurage loi Carrez'
  },
  {
    motif: /attestation de surface habitable|bail d['’]habitation/i,
    penche: 'location',
    marque: 'attestation de surface habitable (loi Boutin)'
  },
  // Le CREP coche ses cases en texte.
  { motif: /X\s*Avant la vente/i, penche: 'vente', marque: 'CREP coché « avant la vente »' },
  {
    motif: /X\s*Avant la mise en location/i,
    penche: 'location',
    marque: 'CREP coché « avant la mise en location »'
  },
  /*
   * L'état des risques nommait les parties — on ne s'en sert plus.
   *
   * « Bailleur / Locataire » et « Vendeur / Acquéreur » semblaient trancher, et
   * huit dossiers sur soixante s'en trouvaient contradictoires : un certificat
   * loi Carrez d'un côté, une ligne « Locataire » de l'autre. C'est le piège du
   * formulaire, une fois de plus — l'imprimé porte l'intitulé même quand la
   * case est vide, et les fiches d'information annexes parlent toutes
   * d'« acquéreur – locataire ».
   *
   * Les quatre marques qui restent affirment, elles : une durée annoncée, un
   * article cité, une surface demandée, une case cochée en texte.
   */
];

/**
 * De quelle transaction ce dossier relève-t-il ?
 *
 * On exige une majorité nette : deux indices d'écart, ou un seul indice sans
 * contradiction. Un dossier partagé — cela existe, un propriétaire qui fait
 * tout faire d'un coup — ne se tranche pas, et il vaut mieux se taire que
 * d'annoncer une durée fausse.
 */
export function lireTransaction(lignes: string[]): LectureTransaction {
  const texte = lignes.join('\n');
  const indices: Indice[] = [];

  for (const m of MARQUES) {
    if (m.motif.test(texte)) indices.push({ marque: m.marque, penche: m.penche });
  }

  const vente = indices.filter((i) => i.penche === 'vente').length;
  const location = indices.filter((i) => i.penche === 'location').length;

  if (vente === 0 && location === 0) return { transaction: null, indices };
  if (vente > location + 1) return { transaction: 'vente', indices };
  if (location > vente + 1) return { transaction: 'location', indices };
  if (vente > 0 && location === 0) return { transaction: 'vente', indices };
  if (location > 0 && vente === 0) return { transaction: 'location', indices };
  return { transaction: null, indices };
}

/**
 * La durée de validité d'un diagnostic, selon la transaction et le résultat.
 *
 * Le plomb est à part : c'est son RÉSULTAT qui commande d'abord. Un constat
 * négatif ne périme pas ; un constat positif vaut un an à la vente, même si le
 * plomb trouvé est en parfait état.
 */
export function validite(
  type: 'electricite' | 'gaz' | 'plomb',
  transaction: Transaction | null,
  positif?: boolean
): string {
  if (type === 'plomb') {
    if (positif === false) return 'sans limite de durée';
    if (transaction === 'vente') return 'un an';
    if (transaction === 'location') return 'six ans';
    return 'un an à la vente, six ans à la location';
  }
  if (transaction === 'vente') return 'trois ans';
  if (transaction === 'location') return 'six ans';
  return 'trois ans à la vente, six ans à la location';
}
