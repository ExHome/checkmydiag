/**
 * CE QUE LA PLANCHE GAZ MONTRE — et d'où chaque valeur sort.
 *
 * *Ordre d'Aude, 22/08/2026 : « je veux exactement le même visuel que dans le
 * zip, pas d'approximation ». Et README du pack : « toutes les valeurs, codes,
 * articles, catégories et pourcentages visibles dans le mockup sont
 * illustratifs ».*
 *
 * Les deux tiennent ensemble à une condition : **la forme est celle de la
 * planche ; les valeurs viennent du rapport.** Ce module fait la jonction, et
 * dit pour chacune sur quoi elle repose.
 *
 * ## Ce qui distingue le gaz de l'électricité
 *
 * La mini-app électricité doit inventer un classement : l'arrêté du 28 septembre
 * 2017 ne hiérarchise pas les anomalies, et ses trois familles sont une lecture
 * Verrière qui attend validation.
 *
 * **Ici, non.** La norme NF P 45-500 classe elle-même chaque anomalie en A1, A2,
 * DGI ou 32c, et le rapport imprime ce niveau en toutes lettres à côté du point
 * de contrôle. Les groupes de cet écran sont donc ceux du rapport, pas les
 * nôtres — c'est pourquoi l'ordre d'Aude du 22/08, confirmé le 23, impose de
 * garder ces quatre noms et de refuser les « à risque / importantes / à
 * améliorer » du mockup : ce serait remplacer une classification réglementaire
 * par une invention graphique.
 *
 * ## Les trois choses que la planche affiche et que ce module REFUSE de recopier
 *
 * | Sur la planche | Pourquoi c'est écarté |
 * |---|---|
 * | « Installation intérieure de gaz non conforme » | ce diagnostic n'atteste d'aucune conformité : il classe des anomalies |
 * | « Art. 531-2 » sur les puces | article fictif, et de surcroît électrique — on écrit le point de contrôle de la norme |
 * | « Fiabilité : 80 % » | aucun rapport ne porte ce nombre, et aucune méthode validée ne le calcule |
 */
import type { LectureGaz, NiveauAnomalie } from '../../lib/lecteurs/gaz/modele';

/* ════════════════════════════════════════════════════════════════════════
 * 1 · LES QUATRE NIVEAUX, DANS L'ORDRE DE LA NORME
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * Du plus grave au moins grave — l'ordre d'affichage des groupes.
 *
 * `32c` vient en dernier et **ne se confond avec aucun autre** : ce n'est pas un
 * degré de gravité mais un cas particulier, la chaudière VMC GAZ dont le
 * dispositif de sécurité collective appelle une intervention du syndic.
 */
export const NIVEAUX: readonly NiveauAnomalie[] = ['DGI', 'A2', 'A1', '32c'];

/** Ce que la norme dit de chaque niveau, dans ses propres termes. */
export const CE_QUE_DIT_LA_NORME: Record<NiveauAnomalie, string> = {
  DGI: 'Danger grave et immédiat : l’opérateur interrompt aussitôt l’alimentation en gaz jusqu’à suppression du défaut.',
  A2: 'Anomalie dont la gravité ne justifie pas d’interrompre le gaz, mais assez importante pour être réparée dans les meilleurs délais.',
  A1: 'Anomalie à prendre en compte lors d’une intervention ultérieure sur l’installation.',
  '32c': 'Chaudière de type VMC GAZ : anomalie du dispositif de sécurité collective, qui appelle une intervention du syndic ou du bailleur.'
};

/** Le nom long, pour les titres de groupe. Le sigle reste toujours visible. */
export const NOM_DU_NIVEAU: Record<NiveauAnomalie, string> = {
  DGI: 'Danger grave et immédiat',
  A2: 'À réparer dans les meilleurs délais',
  A1: 'À traiter lors d’une intervention',
  '32c': 'Dispositif de sécurité collective'
};

/** Le ton graphique. La couleur double le mot, elle ne le remplace jamais. */
export const TON_DU_NIVEAU: Record<NiveauAnomalie, 'alerte' | 'attention' | 'doux'> = {
  DGI: 'alerte',
  A2: 'attention',
  A1: 'doux',
  '32c': 'doux'
};

/* ════════════════════════════════════════════════════════════════════════
 * 2 · LE BANDEAU
 * ════════════════════════════════════════════════════════════════════════ */

export type Issue = 'dgi' | 'anomalies' | 'aucune' | 'nonLue';

/**
 * Ce que le rapport conclut — lu, jamais déduit.
 *
 * ⚠️ Chez LICIEL la conclusion est une **case cochée**, et la coche est un
 * dessin qui ne sort pas du PDF : les cinq réponses possibles y sont imprimées
 * l'une sous l'autre dans 32 volets sur 32. `nonLue` n'est donc pas un échec, et
 * surtout pas « aucune anomalie » : c'est le seul état honnête, et il empêche
 * d'annoncer une bonne nouvelle inventée.
 */
export function issueDe(l: LectureGaz): Issue {
  if (l.anomalies.some((a) => a.niveau === 'DGI')) return 'dgi';
  if (l.anomalies.length > 0) return 'anomalies';
  if (l.conclusion.lisible) return /ne comporte aucune anomalie/i.test(l.conclusion.texte) ? 'aucune' : 'anomalies';
  return 'nonLue';
}

/**
 * Le titre du bandeau.
 *
 * ⚠️ La planche porte « Installation intérieure de gaz non conforme ». Ce mot
 * est écarté, pour la même raison que sur la planche électricité : **ce
 * diagnostic n'atteste d'aucune conformité**. Il constate des anomalies et les
 * classe selon la norme. Une installation ancienne parfaitement tolérée peut
 * n'être conforme à aucune règle d'installation neuve sans porter la moindre
 * anomalie — dire « non conforme » serait un contresens, pas un raccourci.
 */
export const TITRE_BANDEAU: Record<Issue, string> = {
  dgi: 'Danger grave et immédiat relevé',
  anomalies: 'Des anomalies ont été relevées',
  aucune: 'Aucune anomalie relevée',
  nonLue: 'La conclusion n’a pas pu être lue'
};

/**
 * La pastille de niveau du bandeau — le niveau le plus grave que le RAPPORT
 * écrit, jamais une échelle de notre fabrication.
 */
export function niveauDominant(l: LectureGaz): NiveauAnomalie | null {
  for (const n of NIVEAUX) if (l.anomalies.some((a) => a.niveau === n)) return n;
  return null;
}

/* ════════════════════════════════════════════════════════════════════════
 * 3 · LES GROUPES D'ANOMALIES
 * ════════════════════════════════════════════════════════════════════════ */

export interface Groupe {
  niveau: NiveauAnomalie;
  titre: string;
  ton: 'alerte' | 'attention' | 'doux';
  explication: string;
  anomalies: LectureGaz['anomalies'];
}

/**
 * Les anomalies rangées par niveau — le rangement du rapport lui-même.
 *
 * Un groupe vide n'est pas affiché : le rapport ne dit rien d'un niveau qu'il
 * ne cite pas, et une carte « A1 : 0 » ferait passer un silence pour un constat.
 */
export function groupesDe(l: LectureGaz): Groupe[] {
  return NIVEAUX.map((niveau) => ({
    niveau,
    titre: NOM_DU_NIVEAU[niveau],
    ton: TON_DU_NIVEAU[niveau],
    explication: CE_QUE_DIT_LA_NORME[niveau],
    anomalies: l.anomalies.filter((a) => a.niveau === niveau)
  })).filter((g) => g.anomalies.length > 0);
}

/* ════════════════════════════════════════════════════════════════════════
 * 4 · CE QUE LE RAPPORT ÉTABLIT
 * ════════════════════════════════════════════════════════════════════════ */

export interface Etabli {
  libelle: string;
  valeur: string;
  /** Une nuance à dire à voix haute, quand la valeur seule induirait en erreur. */
  reserve?: string;
}

/**
 * ⚠️ CE BLOC N'EST PAS « CE QUI A ÉTÉ CONTRÔLÉ ».
 *
 * La planche affiche une liste de rubriques suivies d'un badge « Contrôlé »
 * vert. Sur un rapport de gaz, cette liste serait une **invention** : le rapport
 * écrit ce qu'il n'a PAS pu contrôler (rubrique F chez LICIEL, K chez BC2E), il
 * n'écrit jamais la liste de ce qu'il a contrôlé. Cocher « contrôlé » partout
 * où le rapport se tait, c'est exactement l'interdit du 21/08 : présenter un
 * test non réalisé comme satisfaisant.
 *
 * Ce bloc ne porte donc que des valeurs **écrites** dans le rapport.
 *
 * ⚠️ Et il ne porte PAS le nombre d'appareils. Mesuré le 22/08/2026 : chez BC2E
 * la rubrique D est disposée en colonnes que le texte aplati entremêle, et deux
 * règles de comptage ont été essayées puis écartées sur mesure — la phrase
 * « L'appareil comporte… » (0 volet sur 24) et le type en tête de ligne (5 sur
 * 24). Tant qu'aucune règle ne tient sur le corpus, ce nombre ne s'affiche pas.
 */
export function ceQueLeRapportEtablit(l: LectureGaz): Etabli[] {
  const sorties: Etabli[] = [];
  if (l.natureGaz) sorties.push({ libelle: 'Nature du gaz distribué', valeur: l.natureGaz });
  if (l.alimentee) {
    sorties.push({
      libelle: 'Installation alimentée en gaz',
      valeur: l.alimentee === 'OUI' ? 'Oui' : 'Non',
      /*
       * Sans gaz, les essais ne peuvent pas avoir lieu. Le rapport le dit lui-
       * même en motif de ses points non vérifiés — « Absence de gaz :
       * impossibilité de réaliser le test de CO ». Ne pas le répéter ici
       * laisserait lire « Non » comme une simple information de confort.
       */
      ...(l.alimentee === 'NON'
        ? { reserve: 'Sans gaz dans l’installation, les essais n’ont pas pu être réalisés.' }
        : {})
    });
  }
  if (l.conclusion.lisible) {
    sorties.push({ libelle: 'Conclusion du rapport', valeur: l.conclusion.texte });
  }
  return sorties;
}

/* ════════════════════════════════════════════════════════════════════════
 * 5 · CE QUE LE CONTRÔLE A COUVERT
 * ════════════════════════════════════════════════════════════════════════ */

export interface Couverture {
  pointsNonVerifies: number;
  zonesNonControlees: number;
  /** Vrai quand le monoxyde n'a été mesuré sur aucun appareil cité. */
  coJamaisMesure: boolean;
  phrase: string;
}

/**
 * ⚠️ PAS DE POURCENTAGE.
 *
 * La planche affiche « Fiabilité de l'analyse : 80 % » avec une jauge. Aucun
 * rapport ne porte ce nombre, et le § 8 de l'ordre interdit d'afficher un
 * indicateur que rien ne fonde. La jauge reste — c'est de la forme —, mais elle
 * porte des **comptes réels**, et une phrase qui dit ce qui manque.
 */
export function couvertureDe(l: LectureGaz): Couverture {
  const pointsNonVerifies = l.pointsNonVerifies.length;
  const zonesNonControlees = l.zonesNonControlees.length;
  const coJamaisMesure = l.appareils.length > 0 && l.appareils.every((a) => a.co.etat !== 'mesurée');

  const morceaux: string[] = [];
  if (pointsNonVerifies > 0) {
    morceaux.push(
      `${pointsNonVerifies} point${pointsNonVerifies > 1 ? 's' : ''} de contrôle n’${pointsNonVerifies > 1 ? 'ont' : 'a'} pas pu être vérifié${pointsNonVerifies > 1 ? 's' : ''}`
    );
  }
  if (zonesNonControlees > 0) {
    /* Le pluriel de « local » est « locaux » : il se remplace, il ne s'allonge pas. */
    const pluriel = zonesNonControlees > 1;
    morceaux.push(
      `${zonesNonControlees} ${pluriel ? 'locaux' : 'local'} n’${pluriel ? 'ont' : 'a'} pas pu être visité${pluriel ? 's' : ''}`
    );
  }

  const unSeul = pointsNonVerifies + zonesNonControlees === 1;
  const phrase = morceaux.length
    ? `${morceaux.join(', ')} : sur ${unSeul ? 'ce point' : 'ces points'}, l’absence d’anomalie n’est pas établie.`
    : 'Le rapport ne signale ni point de contrôle non réalisé, ni local non visité.';

  return { pointsNonVerifies, zonesNonControlees, coJamaisMesure, phrase };
}

/* ════════════════════════════════════════════════════════════════════════
 * 6 · LES POINTS CLÉS
 * ════════════════════════════════════════════════════════════════════════ */

export interface PointCle {
  ton: 'alerte' | 'attention' | 'bon';
  titre: string;
  detail?: string;
}

/**
 * Les trois lignes du haut de la planche.
 *
 * Elles ne résument pas : elles **hiérarchisent** ce que le rapport établit, en
 * mettant d'abord ce qui peut couper le gaz aujourd'hui, puis ce qui limite la
 * portée du constat.
 */
export function pointsClesDe(l: LectureGaz): PointCle[] {
  const cles: PointCle[] = [];
  const dgi = l.anomalies.filter((a) => a.niveau === 'DGI');
  const c = couvertureDe(l);

  if (dgi.length > 0) {
    const ou = dgi.find((a) => a.appareil)?.appareil;
    cles.push({
      ton: 'alerte',
      titre: `${dgi.length} danger${dgi.length > 1 ? 's' : ''} grave${dgi.length > 1 ? 's' : ''} et immédiat${dgi.length > 1 ? 's' : ''}`,
      detail: ou
        ? `Le rapport classe une anomalie en DGI sur : ${ou}. L’alimentation est interrompue jusqu’à réparation.`
        : 'L’alimentation en gaz est interrompue jusqu’à suppression du défaut.'
    });
  }

  if (l.alimentee === 'NON') {
    cles.push({
      ton: 'attention',
      titre: 'Installation non alimentée en gaz',
      detail: 'Les essais qui demandent du gaz — étanchéité, débit, monoxyde — n’ont pas pu être réalisés.'
    });
  } else if (c.coJamaisMesure) {
    /* Le monoxyde ne se voit pas et ne sent rien : son absence de mesure se dit. */
    cles.push({
      ton: 'attention',
      titre: 'Monoxyde de carbone non mesuré',
      detail: 'Aucun appareil cité ne porte de mesure de CO. C’est l’essai que ce diagnostic fait pour détecter une intoxication.'
    });
  }

  if (c.pointsNonVerifies > 0) {
    cles.push({
      ton: 'attention',
      titre: `${c.pointsNonVerifies} point${c.pointsNonVerifies > 1 ? 's' : ''} de contrôle non réalisé${c.pointsNonVerifies > 1 ? 's' : ''}`,
      detail: 'Non contrôlé ne veut pas dire sans anomalie : le rapport ne conclut rien sur ces points.'
    });
  }

  if (cles.length === 0 && l.anomalies.length === 0 && l.conclusion.lisible) {
    cles.push({
      ton: 'bon',
      titre: 'Aucune anomalie relevée',
      detail: l.conclusion.texte
    });
  }

  return cles.slice(0, 3);
}
