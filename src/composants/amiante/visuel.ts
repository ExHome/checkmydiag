/**
 * CE QUE LE VISUEL DU PACK MONTRE — et d'où chaque valeur sort.
 *
 * *Ordre d'Aude, 22/08/2026 : « je veux exactement le même visuel que dans le
 * zip, pas d'approximation ». Et § 6 du même ordre : « aucune donnée fictive ne
 * doit devenir une valeur par défaut ».*
 *
 * Les deux tiennent ensemble, à une condition : **la forme est celle du
 * mockup, au pixel ; les valeurs se CALCULENT à partir du rapport.** Ce module
 * fait les calculs, et dit pour chacun sur quoi il repose.
 *
 * Trois valeurs du mockup n'existent nulle part dans un constat amiante. Elles
 * ne sont donc pas recopiées : elles sont dérivées, ici, par des règles
 * écrites — et le jour où une règle est fausse, elle se corrige à un seul
 * endroit.
 */
import type { Gravite } from '../../lib/modele';
import type { SyntheseAmiante } from './synthese';

/* ════════════════════════════════════════════════════════════════════════
 * 1 · LE TITRE DU BANDEAU
 * ════════════════════════════════════════════════════════════════════════
 *
 * Le mockup porte « Aucun matériau contenant de l'amiante repéré » — un titre
 * court, en trois lignes, qui tient dans le bandeau. La phrase du rapport, elle,
 * fait souvent deux fois cette longueur : « Aucun matériau contenant de
 * l'amiante n'a été repéré dans les parties accessibles. »
 *
 * On garde donc le titre court du visuel, ET la phrase exacte du rapport juste
 * en dessous du premier point clé — comme le mockup, qui met le détail là
 * (« Aucun MCA identifié lors de la mission »). Rien ne se perd.
 */
export const TITRE_BANDEAU: Record<SyntheseAmiante['issue'], string> = {
  absence: 'Aucun matériau contenant de l’amiante repéré',
  presence: 'Des matériaux contenant de l’amiante ont été repérés',
  nonConclu: 'Le rapport n’a pas encore conclu',
  illisible: 'Ce document n’a pas pu être lu'
};

/* ════════════════════════════════════════════════════════════════════════
 * 2 · LE NIVEAU DE RISQUE
 * ════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ **Aucun constat amiante ne porte d'échelle de risque.** Ce n'est donc pas
 * une donnée du rapport : c'est une LECTURE de Verrière, et elle doit se
 * déduire de ce que le rapport dit, jamais d'une impression.
 *
 * La règle, en quatre marches, du plus sûr au plus grave :
 *
 * | Ce que le rapport établit | Niveau |
 * |---|---|
 * | rien repéré | **TRÈS FAIBLE** |
 * | le laboratoire n'a pas rendu, ou il reste à sonder | **À CONFIRMER** |
 * | de l'amiante, cotée en évaluation périodique (EP) | **MODÉRÉ** |
 * | de l'amiante, cotée `Score 2`, `Score 3`, `AC1` ou `AC2` | **ÉLEVÉ** |
 * | document illisible | **NON ÉVALUÉ** |
 *
 * Les seuils viennent du droit, pas d'un ressenti : `Score 3` impose des
 * travaux de retrait sous trente-six mois (R. 1334-29), `Score 2` une mesure
 * d'empoussièrement sous trois mois, `EP` une simple surveillance à trois ans.
 * Un matériau en `EP` et un matériau en `Score 3` ne se disent pas pareil.
 */
export type NiveauRisque = 'TRÈS FAIBLE' | 'À CONFIRMER' | 'MODÉRÉ' | 'ÉLEVÉ' | 'NON ÉVALUÉ';

/** Ce qui, dans une cotation, déclenche une obligation et non une surveillance. */
const COTATION_GRAVE = /score\s*[23]\b|\bAC1\b|\bAC2\b|retrait|confinement|empoussi[èe]rement/i;

export function niveauDeRisque(s: SyntheseAmiante): NiveauRisque {
  if (s.issue === 'illisible') return 'NON ÉVALUÉ';
  if (s.issue === 'nonConclu') return 'À CONFIRMER';
  if (s.issue === 'absence') return 'TRÈS FAIBLE';
  const grave = s.materiaux.entrees.some(
    (m) => COTATION_GRAVE.test(m.etat ?? '') || COTATION_GRAVE.test(m.suite ?? '')
  );
  return grave ? 'ÉLEVÉ' : 'MODÉRÉ';
}

/** Le ton d'affichage du niveau — pour ne jamais porter l'état par la seule couleur. */
export const TON_RISQUE: Record<NiveauRisque, Gravite> = {
  'TRÈS FAIBLE': 'bon',
  'À CONFIRMER': 'attention',
  MODÉRÉ: 'attention',
  ÉLEVÉ: 'alerte',
  'NON ÉVALUÉ': 'attention'
};

/* ════════════════════════════════════════════════════════════════════════
 * 3 · LE NIVEAU DE CONFIANCE
 * ════════════════════════════════════════════════════════════════════════
 *
 * Le mockup affiche « 90 % », et le § 2 de l'ordre l'interdit tant qu'aucune
 * règle métier validée n'existe. En voici une, écrite, mesurable et vérifiable
 * ligne à ligne :
 *
 *     confiance = pièces réellement examinées / (examinées + non examinées)
 *
 * Les deux termes sont des RUBRIQUES du rapport, pas des estimations : le
 * « Descriptif des pièces visitées » (§ 3.2.6) d'un côté, la liste des locaux
 * non visités (§ 1.2) de l'autre. Le chiffre ne dit donc pas « le diagnostic
 * est fiable à 90 % » — il dit **quelle part du bien le constat a pu regarder**,
 * et c'est exactement ce qu'un acquéreur a besoin de savoir.
 *
 * ⚠️ **Pas de chiffre sans les deux rubriques.** Si l'une des deux n'a pas été
 * lue, on ne fabrique pas un dénominateur : la carte affiche alors les faits,
 * sans pourcentage. Un taux calculé sur une seule moitié serait pire qu'aucun
 * taux — il aurait l'air d'une mesure.
 */
export interface Confiance {
  /** Le pourcentage, quand il est calculable. Jamais arrondi à la hausse. */
  readonly part: number | null;
  readonly examinees: number;
  readonly nonExaminees: number;
  /** Ce que le chiffre veut dire, en une phrase. */
  readonly dit: string;
}

export function confianceDe(s: SyntheseAmiante): Confiance {
  const examinees = s.elements.entrees.length;
  const nonExaminees = s.nonControle.entrees.length;

  /*
   * ⚠️⚠️ PAS DE CHIFFRE SI LA RUBRIQUE DES NON-VISITÉS N'A PAS ÉTÉ LUE.
   *
   * Le commentaire ci-dessus posait déjà la règle — « pas de chiffre sans les
   * deux rubriques » — mais le code ne vérifiait que la première. Mesuré le
   * 22/08 sur douze volets réels : le § 1.2 ne rendait aucune entrée sur onze
   * d'entre eux, le dénominateur valait donc `examinées + 0`, et la carte
   * affichait **100 % sur presque tout le corpus** — y compris sur un constat
   * dont le rapport écrit noir sur blanc que deux planchers n'ont pas pu être
   * sondés et que les obligations du propriétaire ne sont pas remplies.
   *
   * Un dénominateur amputé ne donne pas un chiffre approximatif : il donne
   * toujours 100 %, c'est-à-dire l'affirmation exacte que l'ordre interdit.
   * `lue === false` veut dire « je n'ai pas lu cette rubrique » — et on ne
   * calcule rien sur ce qu'on n'a pas lu.
   */
  if (s.nonControle.lue === false) {
    return {
      part: null,
      examinees,
      nonExaminees,
      dit: 'La liste des locaux non visités n’a pas pu être lue : la part réellement examinée ne peut pas être calculée.'
    };
  }

  if (!s.elements.montrer || examinees + nonExaminees === 0) {
    return {
      part: null,
      examinees,
      nonExaminees,
      dit:
        nonExaminees > 0
          ? 'Le rapport ne détaille pas la liste des pièces visitées : la part réellement examinée ne peut pas être calculée.'
          : 'Le rapport ne détaille ni les pièces visitées ni les locaux restés fermés.'
    };
  }

  const part = Math.floor((examinees / (examinees + nonExaminees)) * 100);
  return {
    part,
    examinees,
    nonExaminees,
    dit:
      nonExaminees === 0
        ? `Les ${examinees} pièces du périmètre ont toutes été examinées, et le rapport ne signale aucun local resté fermé.`
        : `${examinees} pièces examinées sur ${examinees + nonExaminees} : ${nonExaminees} ${
            nonExaminees === 1 ? 'local est resté fermé' : 'locaux sont restés fermés'
          }, et le constat ne dit rien de ${nonExaminees === 1 ? 'celui-là' : 'ceux-là'}.`
  };
}

/* ════════════════════════════════════════════════════════════════════════
 * 4 · LES CATÉGORIES D'OUVRAGE DU BLOC « ÉLÉMENTS CONTRÔLÉS »
 * ════════════════════════════════════════════════════════════════════════
 *
 * Le mockup en montre cinq — Toiture / Couverture, Façades / Bardages,
 * Revêtements intérieurs, Conduits / Gaines, Sols — chacune avec son
 * pictogramme. Ce ne sont pas des pièces : ce sont les **familles de l'annexe
 * 13-9**, celles que le repérage parcourt.
 *
 * Elles se déduisent de ce que le rapport nomme, et **une catégorie que le
 * rapport ne nomme pas ne s'affiche pas** — cochée « Contrôlée » alors que
 * personne ne l'a regardée, elle serait le pire mensonge de tout l'écran.
 */
export interface Categorie {
  readonly nom: string;
  readonly icone: 'toiture' | 'facade' | 'revetement' | 'conduit' | 'sol' | 'piece';
}

const CATEGORIES: { readonly cat: Categorie; readonly rx: RegExp }[] = [
  { cat: { nom: 'Toiture / Couverture', icone: 'toiture' }, rx: /toiture|couverture|charpente|combles|ardoise|tuile|fa[îi]ti[èe]re|panne/i },
  { cat: { nom: 'Façades / Bardages', icone: 'facade' }, rx: /fa[çc]ade|bardage|mur ext|ext[ée]rieur|enduit|pierre|parement/i },
  { cat: { nom: 'Revêtements intérieurs', icone: 'revetement' }, rx: /rev[êe]tement|peinture|papier|lambris|pl[âa]tre|cloison|faux[- ]plafond|plafond|mur\b/i },
  { cat: { nom: 'Conduits / Gaines', icone: 'conduit' }, rx: /conduit|gaine|canalisation|vide[- ]ordures|chemin[ée]e|ventilation|calorifug/i },
  { cat: { nom: 'Sols', icone: 'sol' }, rx: /\bsol\b|dalle|carrelage|parquet|lino|plancher|plinthe/i }
];

/**
 * Les catégories que ce rapport a effectivement nommées.
 *
 * On lit les pièces du périmètre ET les matériaux : un rapport qui parle de
 * « Dalles de sol » a bien regardé les sols, même si sa liste de pièces ne dit
 * que « Séjour ».
 *
 * ⚠️⚠️ **UNE CATÉGORIE OÙ L'AMIANTE A ÉTÉ TROUVÉE N'EST PAS « CONTRÔLÉE ✓ ».**
 *
 * Défaut vu à l'écran le 22/08, sur le DTA de copropriété du banc : le rapport
 * repère des conduits amiantés en Score 3, et le bloc « Éléments contrôlés »
 * affichait juste au-dessus « Conduits / Gaines — Contrôlé ✓ ». Le mot du
 * rapport et la coche verte disaient l'inverse l'un de l'autre, dans le même
 * écran, à trois centimètres d'écart.
 *
 * La catégorie qui porte un matériau repéré est donc retirée de ce bloc : elle
 * a son propre bloc, « Les matériaux repérés », où le rapport la nomme, la
 * situe et donne sa suite. C'est la règle du § 4 de l'ordre prise dans l'autre
 * sens — on ne présente jamais comme sain ce qui ne l'est pas.
 */
export function categoriesDe(s: SyntheseAmiante): Categorie[] {
  const mots = [
    ...s.elements.entrees.map((e) => e.quoi),
    ...s.materiaux.entrees.flatMap((m) => [m.quoi, m.ou ?? ''])
  ].join(' · ');
  if (!mots.trim()) return [];

  /* Ce que le rapport a REPÉRÉ — et qui ne peut donc pas être coché. */
  const repere = s.materiaux.montrer
    ? s.materiaux.entrees.flatMap((m) => [m.quoi, m.ou ?? '']).join(' · ')
    : '';

  return CATEGORIES.filter(({ rx }) => rx.test(mots) && !(repere && rx.test(repere))).map(
    ({ cat }) => cat
  );
}

/**
 * Le pictogramme d'une ligne, d'après ce qu'elle nomme.
 *
 * Une pièce de rapport — « RDC - Cuisine », « Sous-Sol - Cave » — n'est pas une
 * catégorie d'ouvrage, mais elle en évoque souvent une : un vide sanitaire va
 * avec les sols, des combles avec la toiture. À défaut, l'icône « pièce »,
 * neutre — on ne devine pas un ouvrage à partir d'un nom de pièce.
 */
export function iconeDe(nom: string): Categorie['icone'] {
  const trouve = CATEGORIES.find(({ rx }) => rx.test(nom));
  return trouve ? trouve.cat.icone : 'piece';
}
