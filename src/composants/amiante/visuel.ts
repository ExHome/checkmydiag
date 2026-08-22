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
 * 2 · LA SUITE QUE LE DROIT ATTACHE AU CONSTAT — son intitulé, pas une note
 * ════════════════════════════════════════════════════════════════════════
 *
 * ⚠️⚠️ **L'ÉCHELLE « TRÈS FAIBLE / À CONFIRMER / MODÉRÉ / ÉLEVÉ » A ÉTÉ RETIRÉE
 * LE 22/08.** Ordre d'Aude : « pour le niveau, respecte l'intitulé de la
 * réglementation ». Elle avait raison sur les deux volets.
 *
 * Aucun texte amiante ne gradue un « niveau de risque ». Ce qu'il définit, en
 * revanche, est bien plus précis et bien plus utile : **une cotation, et la
 * suite qu'elle impose.** Les inventer une seconde fois par-dessus était une
 * perte sèche — « ÉLEVÉ » ne dit ni ce qu'il faut faire, ni sous quel délai.
 *
 * ## Les intitulés du droit, et eux seuls
 *
 * *Arrêté du 12 décembre 2012 et articles R. 1334-27 à R. 1334-29 du code de la
 * santé publique, lus le 20/08/2026 (voir `reglement/textes.ts`).*
 *
 * | Cotation du rapport | Ce que le texte impose, dans ses mots |
 * |---|---|
 * | `Score 1` | évaluation périodique, dans un délai maximal de trois ans |
 * | `Score 2` | mesure d'empoussièrement, sous trois mois |
 * | `Score 3` | travaux de retrait ou de confinement |
 * | `EP` | évaluation périodique |
 * | `AC1` | action corrective de premier niveau |
 * | `AC2` | action corrective de second niveau |
 *
 * La pastille porte donc **la cotation du rapport et sa conséquence**, jamais
 * une marche d'échelle. Quand le rapport ne cote pas, elle porte ce qu'il
 * conclut — et rien de plus.
 */

/** Ce que la pastille affiche : les mots du rapport, ou ceux du texte. */
export interface SuiteReglementaire {
  /** L'intitulé affiché — cotation du rapport, ou conclusion. */
  readonly mot: string;
  /** Ce que le texte impose, quand une cotation est lue. */
  readonly impose?: string;
  readonly ton: Gravite;
}

/** Les cotations, telles que les rapports les impriment. */
const COTATIONS: { readonly rx: RegExp; readonly mot: string; readonly impose: string; readonly ton: Gravite }[] = [
  { rx: /score\s*3\b/i, mot: 'Score 3', impose: 'Travaux de retrait ou de confinement.', ton: 'alerte' },
  { rx: /score\s*2\b/i, mot: 'Score 2', impose: 'Mesure d’empoussièrement dans l’air, sous trois mois.', ton: 'alerte' },
  { rx: /score\s*1\b/i, mot: 'Score 1', impose: 'Évaluation périodique, dans un délai maximal de trois ans.', ton: 'attention' },
  { rx: /\bAC2\b/i, mot: 'AC2', impose: 'Action corrective de second niveau : elle porte sur toute une zone.', ton: 'alerte' },
  { rx: /\bAC1\b/i, mot: 'AC1', impose: 'Action corrective de premier niveau, limitée aux éléments dégradés.', ton: 'alerte' },
  { rx: /\bEP\b|[ée]valuation p[ée]riodique/i, mot: 'EP', impose: 'Évaluation périodique.', ton: 'attention' }
];

/**
 * La suite réglementaire du constat.
 *
 * ⚠️ On lit la COTATION du rapport, dans l'ordre du plus contraignant au moins
 * contraignant : un volet qui porte à la fois un `Score 3` et un `EP` doit
 * afficher le `Score 3`, jamais l'inverse.
 */
export function suiteReglementaire(s: SyntheseAmiante): SuiteReglementaire {
  if (s.issue === 'illisible') return { mot: 'Non évalué', ton: 'attention' };
  if (s.issue === 'nonConclu') return { mot: 'Conclusion en attente', ton: 'attention' };
  if (s.issue === 'absence') return { mot: 'Aucun matériau repéré', ton: 'bon' };

  const dits = s.materiaux.entrees.map((m) => `${m.etat ?? ''} ${m.suite ?? ''}`).join(' · ');
  const trouvee = COTATIONS.find((c) => c.rx.test(dits));
  if (trouvee) return { mot: trouvee.mot, impose: trouvee.impose, ton: trouvee.ton };

  /* Repéré, mais sans cotation lisible : on ne la fabrique pas. */
  return { mot: 'Amiante repérée', ton: 'alerte' };
}

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
  readonly icone:
    | 'toiture'
    | 'facade'
    | 'revetement'
    | 'conduit'
    | 'sol'
    | 'menuiserie'
    | 'escalier'
    | 'piece';
}

const CATEGORIES: { readonly cat: Categorie; readonly rx: RegExp }[] = [
  { cat: { nom: 'Toiture / Couverture', icone: 'toiture' }, rx: /toiture|couverture|charpente|combles|ardoise|tuile|fa[îi]ti[èe]re|panne/i },
  { cat: { nom: 'Façades / Bardages', icone: 'facade' }, rx: /fa[çc]ade|bardage|mur ext|ext[ée]rieur|enduit|pierre|parement/i },
  { cat: { nom: 'Revêtements intérieurs', icone: 'revetement' }, rx: /rev[êe]tement|peinture|papier|lambris|pl[âa]tre|cloison|faux[- ]plafond|plafond|mur\b/i },
  { cat: { nom: 'Conduits / Gaines', icone: 'conduit' }, rx: /conduit|gaine|canalisation|vide[- ]ordures|chemin[ée]e|ventilation|calorifug/i },
  { cat: { nom: 'Sols', icone: 'sol' }, rx: /\bsol\b|dalle|carrelage|parquet|lino|plancher|plinthe/i },
  /*
   * MENUISERIES ET ESCALIER — deux familles que le visuel ne montrait pas, et
   * que les rapports contrôlent pourtant plus souvent que les cinq autres.
   *
   * Mesure du 22/08 sur les volets extraits du corpus : 41 composants lus au
   * § 3.2.6, dont 23 — 56 % — ne tombaient dans AUCUNE des cinq familles du
   * mockup. Porte (6), Fenêtre (4), Volet (3), Marches (3), Contremarches (3),
   * Balustre, Main courante, Dressing Porte, Porte de garage.
   *
   * Les laisser dehors, c'était effacer de l'écran des ouvrages réellement
   * contrôlés. Et ces deux familles ne sont pas accessoires : le mastic de
   * vitrage des fenêtres et les dalles de marches en vinyle-amiante comptent
   * parmi les repérages les plus courants de la liste B.
   *
   * ⚠️ La ligne garde le gabarit du visuel — vignette, libellé, « Contrôlé ✓ ».
   * Ce qui change ici est la DONNÉE affichée, pas le dessin.
   */
  {
    cat: { nom: 'Menuiseries', icone: 'menuiserie' },
    rx: /menuiserie|\bportes?\b|\bfen[êe]tres?\b|\bvolets?\b|\bch[âa]ssis\b|vitrage|mastic|huisserie|placard|dressing/i
  },
  {
    cat: { nom: 'Escalier', icone: 'escalier' },
    rx: /escalier|\bmarches?\b|contremarches?|balustre|main courante|garde[- ]corps|\brampe\b|limon/i
  }
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
  /*
   * ⚠️ CE SONT LES COMPOSANTS QUI DISENT LA FAMILLE, PAS LES PIÈCES.
   *
   * « RDC - Cuisine » ne dit pas si l'on a regardé le sol ou le plafond ;
   * « Sol : Carrelage » le dit. Les composants viennent du tableau
   * `Localisation | Description` du § 3.2.6 — la seule rubrique du rapport qui
   * corresponde aux cinq familles d'ouvrage du visuel.
   *
   * Les noms de pièces restent dans le lot : « Combles », « Vide sanitaire »
   * nomment bien une famille. Mais ils ne suffisaient pas, et c'est pourquoi la
   * colonne retombait sur l'icône générique.
   */
  const mots = [
    ...(s.composants ?? []),
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
