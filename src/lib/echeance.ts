/**
 * Jusqu'à quand un diagnostic vaut.
 *
 * La date n'est pas une décoration : un état termites périmé fait repousser une
 * signature. Elle est donc calculée au même endroit pour tout le monde — la
 * fiche du diagnostic et le voyant du dossier doivent dire la même chose, au
 * jour près.
 */
import { enDate, finDeValiditeDpe, VALIDITE_MOIS } from './analyse/coherence';
import type { Diagnostic } from './modele';

export interface Echeance {
  texte: string;
  perimee: boolean;
}

/**
 * Les types dont on sait qu'aucune durée ne s'applique.
 *
 * La distinction compte : « Sans limite » est une affirmation, et elle ne doit
 * jamais résulter d'un simple trou dans la table. Un feu vert par oubli est le
 * pire cas possible — c'est une autorisation de signer donnée par inadvertance.
 */
const SANS_LIMITE = new Set<Diagnostic['type']>(['amiante', 'carrez']);

/**
 * Le constat plomb ne vaut « sans limite » que s'il est NÉGATIF.
 *
 * Le produit l'annonçait ainsi dans tous les cas, et c'était faux. L'article
 * L. 1334-6 du code de la santé publique dit l'inverse : en vente, le CREP doit
 * avoir été établi depuis moins d'UN AN. La validité illimitée est une
 * exception, réservée au constat qui établit l'absence de revêtements
 * contenant du plomb, ou des concentrations inférieures aux seuils.
 *
 * Autrement dit : un CREP qui trouve du plomb périme au bout d'un an. Le
 * rapport lui-même l'écrit — « du fait de la présence de revêtement contenant
 * du plomb […] le présent constat a une durée de validité de 1 an » — et le
 * produit affichait « Sans limite » par-dessus. Un dossier de deux ans avec du
 * plomb classé 3 passait pour valable.
 *
 * Lu au texte le 16/08/2026.
 */
function plombSansLimite(d: Diagnostic): boolean {
  if (d.type !== 'plomb') return false;
  /* Sans tableau lisible, on ne tranche pas : « durée non renseignée » invite à
     vérifier, quand « sans limite » donnerait un feu vert par défaut. */
  if (d.schema?.genre !== 'plomb') return false;
  const [c0, c1, c2, c3] = d.schema.classes;
  void c0;
  return c1 + c2 + c3 === 0;
}

export function echeance(d: Diagnostic, aujourdhui: Date = new Date()): Echeance {
  /*
   * Le plomb : douze mois s'il trouve quelque chose, sans limite sinon.
   *
   * On le traite avant la table des durées, parce que sa validité ne dépend pas
   * de son type mais de son RÉSULTAT — c'est le seul diagnostic dans ce cas.
   */
  const duree = d.type === 'plomb' ? (plombSansLimite(d) ? undefined : 12) : VALIDITE_MOIS[d.type];
  if (duree === undefined) {
    return SANS_LIMITE.has(d.type) || (d.type === 'plomb' && plombSansLimite(d))
      ? { texte: 'Sans limite', perimee: false }
      : { texte: 'Durée non renseignée', perimee: false };
  }

  const depart = enDate(d.date);

  /*
   * Le DPE d'avant la réforme est périmé à sa date propre.
   *
   * Sans ce détour, la fiche continuait d'annoncer la date imprimée sur le
   * rapport — « valable jusqu'au 05/08/2030 » pour un document qui a cessé de
   * valoir le 31 décembre 2024.
   */
  if (d.type === 'dpe' && depart) {
    const anticipee = finDeValiditeDpe(depart);
    if (anticipee) {
      const perimee = anticipee.getTime() < aujourdhui.getTime();
      return {
        texte: `${perimee ? 'Périmé depuis le ' : 'Valable jusqu’au '}${anticipee.toLocaleDateString('fr-FR')}`,
        perimee
      };
    }
  }
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
