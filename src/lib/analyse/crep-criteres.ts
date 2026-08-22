/**
 * LES DEUX SEUILS RÉGLEMENTAIRES DU CREP, ET LE CONTRÔLE DES POURCENTAGES.
 *
 * §§ 21, 22, 25, 26 et 27 de l'ordre de mission. Trois choses, qui ne
 * dépendent que du tableau de synthèse et du récapitulatif par local — deux
 * sources dont la justesse est déjà mesurée, contrairement au détail des
 * unités.
 *
 * ## Ce qui se calcule sur les EFFECTIFS, jamais sur les pourcentages
 *
 * Le pourcentage imprimé n'est pas fiable : mesuré sur un volet réel, 5 unités
 * sur 12 y valent « 41,8 % » d'un côté et « 41,7 % » de l'autre, et la ligne
 * totalise 100,2 %. Tous les calculs partent donc des effectifs.
 *
 * ## Ce qu'on ne fait jamais
 *
 * Corriger le rapport en silence. Quand le calcul et le rapport divergent, on
 * le dit — c'est le moteur de contradictions du § 40, pas un arbitrage.
 */
import type { LocalRecapitule } from './plomb';

/** Les seuils de l'arrêté du 19 août 2011, article 8. */
export const SEUIL_LOCAL = 50;
export const SEUIL_GLOBAL = 20;

export interface CritereLocal {
  local: string;
  unites: number;
  classe3: number;
  /** Recalculée sur les effectifs, pas reprise du rapport. */
  part: number;
  atteint: boolean;
}

export interface CriteresDuCrep {
  /** Chaque local, avec sa part de classe 3 recalculée. */
  locaux: CritereLocal[];
  /** § 26 : au moins un local à 50 % ou plus. */
  critereLocal: boolean;
  /** § 27 : l'ensemble des locaux à 20 % ou plus. */
  critereGlobal: boolean;
  /** La part globale, recalculée sur les effectifs du tableau de synthèse. */
  partGlobale: number | null;
  /**
   * Les écarts entre ce que le rapport imprime et ce que les effectifs donnent.
   * Vide quand tout concorde. Jamais corrigé — seulement signalé.
   */
  ecarts: string[];
}

/** Arrondi au dixième, comme les rapports l'impriment. */
const part = (n: number, sur: number): number => (sur > 0 ? Math.round((n / sur) * 1000) / 10 : 0);

/**
 * Les deux critères, et le contrôle des pourcentages.
 *
 * `chiffres` vient du tableau de synthèse (§ 6.1), `locaux` du récapitulatif
 * que le CREP imprime en tête de chaque local (§ 5).
 */
export function criteresDuCrep(
  chiffres: { total: number; nonMesurees: number; classes: [number, number, number, number] } | null,
  locaux: readonly LocalRecapitule[]
): CriteresDuCrep {
  const ecarts: string[] = [];

  const details: CritereLocal[] = locaux.map((l) => {
    const calculee = part(l.classe3, l.unites);
    /*
     * Le rapport imprime lui-même « soit X % » : on le compare au calcul. Un
     * dixième d'écart est un arrondi, au-delà c'est une incohérence à signaler.
     */
    if (Math.abs(calculee - l.pourcentage) > 0.1) {
      ecarts.push(
        `${l.local || 'local sans nom'} : le rapport imprime ${l.pourcentage} %, les effectifs donnent ${calculee} % (${l.classe3} sur ${l.unites})`
      );
    }
    return {
      local: l.local,
      unites: l.unites,
      classe3: l.classe3,
      part: calculee,
      atteint: l.unites > 0 && calculee >= SEUIL_LOCAL
    };
  });

  /*
   * ⚠️ Le critère des 50 % se calcule LOCAL PAR LOCAL (§ 26). Appliquer la part
   * globale au bâtiment le manquerait : un logement dont une seule pièce est
   * entièrement en classe 3 déclenche le critère, même si le global reste bas.
   */
  const critereLocal = details.some((d) => d.atteint);

  const partGlobale = chiffres ? part(chiffres.classes[3], chiffres.total) : null;
  const critereGlobal = partGlobale !== null && partGlobale >= SEUIL_GLOBAL;

  /*
   * Le contrôle d'intégrité du § 41. Il ne corrige rien : il dit que le tableau
   * ne se referme pas sur lui-même, et c'est au lecteur d'aller voir.
   */
  if (chiffres) {
    const somme = chiffres.nonMesurees + chiffres.classes.reduce((a, b) => a + b, 0);
    if (somme !== chiffres.total) {
      ecarts.push(
        `tableau de synthèse : ${chiffres.total} unités annoncées, ${somme} en additionnant les colonnes`
      );
    }

    /* Le total des locaux doit retomber sur le total du bâtiment. */
    const totalLocaux = locaux.reduce((n, l) => n + l.unites, 0);
    if (locaux.length && totalLocaux !== chiffres.total) {
      ecarts.push(
        `les locaux totalisent ${totalLocaux} unités, le tableau de synthèse en annonce ${chiffres.total}`
      );
    }

    const classe3Locaux = locaux.reduce((n, l) => n + l.classe3, 0);
    if (locaux.length && classe3Locaux !== chiffres.classes[3]) {
      ecarts.push(
        `les locaux totalisent ${classe3Locaux} unités de classe 3, le tableau de synthèse en annonce ${chiffres.classes[3]}`
      );
    }
  }

  return { locaux: details, critereLocal, critereGlobal, partGlobale, ecarts };
}
