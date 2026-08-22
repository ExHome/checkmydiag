/**
 * LE LECTEUR CREP DE LICIEL — un editeur, un lecteur.
 *
 * Ce module ne lit pas « les CREP » : il lit **les CREP produits par LICIEL**,
 * et il le dit. Tout ce qu'il contient a ete mesure sur ce format-la et n'est
 * valable nulle part ailleurs tant qu'un autre editeur n'a pas ete lu.
 *
 * ## Ce que ce format a de particulier
 *
 * L'extraction du PDF **entrelace les colonnes** : une unite de diagnostic
 * occupe TROIS lignes, et la sienne ne porte ni son numero de mesure, ni sa
 * concentration, ni son etat de conservation.
 *
 *     2 mesure 1 5,27 Etat d'usage (Traces     <- la mesure, et l'etat
 *     B Plinthes Bois Peinture 2               <- l'unite, et sa classe
 *     3 mesure 2 3,54 de chocs)                <- la mesure, et la suite
 *
 * Un lecteur ecrit pour un autre editeur echouerait ici, et reciproquement.
 * C'est exactement pourquoi il y a un lecteur par editeur.
 *
 * ## Ce qu'il rend
 *
 * L'unite entiere : local, zone, element avec sa face, substrat, revetement,
 * mesures numerotees et localisees, etat de conservation, degradation, classe
 * — ou motif de non-mesure.
 *
 * /!\ Rien n'est deduit. Une valeur absente du rapport reste absente, et la
 * classe rendue est celle que le diagnostiqueur a ecrite, jamais recalculee.
 */

import type { Lecteur } from '../socle';
import { recapitulatifParLocal } from '../../analyse/plomb';

/** L'état de conservation, tel que l'arrêté du 19 août 2011 le nomme. */
export type EtatRevetement = 'non dégradé' | 'non visible' | 'état d’usage' | 'dégradé';

export interface MesureXrf {
  /** Le numéro que porte le rapport, quand la ligne le donne. */
  numero: number | null;
  /** Où la mesure a été prise sur l'unité — « partie basse (< 1 m) », « mesure 1 ». */
  localisation: string | null;
  /** En mg/cm². Jamais confondu avec les mg/g d'une analyse chimique. */
  concentration: number;
}

export interface UniteDeDiagnostic {
  /** Le local, repris du titre de tableau qui précède. */
  local: string | null;
  /** La zone du local : la lettre A, B, C, D… quand le rapport en pose une. */
  zone: string | null;
  /** L'élément nommé par le rapport, entier — « Fenêtre intérieure (F1) ». */
  element: string;
  /** La face, quand l'élément en distingue une. C'est ce qui séparait deux UD. */
  face: string | null;
  substrat: string | null;
  revetement: string | null;
  mesures: MesureXrf[];
  etat: EtatRevetement | null;
  /** Ce que le rapport écrit entre parenthèses après l'état : « Traces de chocs ». */
  degradation: string | null;
  /** La classe écrite par le diagnostiqueur. `null` quand l'unité n'est pas mesurée. */
  classe: 0 | 1 | 2 | 3 | null;
  mesuree: boolean;
  /** Pour une unité non mesurée : le motif, repris mot pour mot. */
  motif: string | null;
}

/**
 * Les éléments que le CREP mesure.
 *
 * ⚠️ On capture le libellé ENTIER — « Fenêtre intérieure (F1) » et non
 * « Fenêtre » — parce que c'est lui qui distingue deux unités. Le lecteur
 * précédent s'arrêtait au nom générique et fusionnait les faces.
 */
/*
 * ⚠️ L'ordre de l'alternance compte : « Faux Limon » avant « Limon », sinon le
 * libellé retenu commence au second mot et deux éléments distincts se
 * confondent.
 *
 * /!\ « Sol » ne doit pas se lire dans « Sous-Sol ». La frontiere de mot  se
 * place apres le tiret : le lecteur voyait un sol dans « Sous-Sol - Cave 2 2 »,
 * une ligne du recapitulatif par local coupee avant ses pourcentages — donc
 * invisible au garde-fou du %. Le nombre d'unites qui la termine passait alors
 * pour un classement. Deux unites fantomes de classe 2 sur un volet.
 *
 * Les six éléments d'escalier — marche, contremarche, faux limon, crémaillère,
 * balustre, main courante — ont été ajoutés le 21/08/2026 en lisant un volet de
 * onze pièces où un escalier de 16 unités n'en rendait que 2. Tous vus dans des
 * tableaux, aucun ajouté par précaution.
 */
export const ELEMENT =
  /\b(Plinthes?|Portes?|Murs?|Plafonds?|Fen[êe]tres?|(?<![\w-])Sols?|Volets?|Placards?|Radiateurs?|Escaliers?|Rampes?|Cloisons?|Embrasures?|All[èe]ges?|Balcons?|Garde[- ]?corps|Chemin[ée]es?|Barreaux|Contremarches?|Marches?|Faux[- ]?Limons?|Limons?|Cr[ée]maill[èe]res?|Balustres?|Main[- ]?courantes?|Charpentes?|Poteaux?|Pannes?|Solives?|Terrasses?|Fa[çc]ades?|V[ée]g[ée]tation|Boiseries?|Structures?|Bureaux?)\b/i;

/*
 * ⚠️ « Poutre » et « Lambris » ont été écrits ici, puis RETIRÉS aussitôt.
 *
 * « Poutre » n'a été vu dans aucun tableau — je l'avais ajouté par analogie
 * avec « Charpente », c'est-à-dire inventé. Et « Lambris » apparaît bien dans
 * les rapports, mais comme REVÊTEMENT — « Plafond lambris bois vernis » — où
 * l'unité est le plafond. L'inscrire comme élément aurait fabriqué une unité
 * là où le rapport en décrit une seule.
 *
 * La règle ne souffre pas d'exception, y compris quand l'ajout semble évident :
 * on inscrit ce qu'on a lu dans un tableau, à la place d'unité de diagnostic.
 */

/*
 * ⚠️ « Huisserie » a été RETIRÉE de cette liste. Dans le tableau LICIEL, elle
 * n'est pas une unité de diagnostic mais une LOCALISATION DE MESURE — la
 * colonne de gauche, au même titre que « partie mobile » ou « partie basse ».
 * La compter comme unité créait une UD fantôme et lui volait la concentration
 * de la menuiserie voisine.
 */

/** La face, quand elle suit l'élément. */
const FACE = /\b(int[ée]rieure?|ext[ée]rieure?|c[ôo]t[ée]\s+\w+|face\s+\w+)\b/i;

/** La zone : une lettre isolée en tête de ligne, comme « B Plinthes Bois… ». */
const ZONE_EN_TETE = /^\s*(?:-\s*)?([A-Z])\s+(?=[A-ZÉÈa-z])/;

/*
 * Les substrats, tels que les tableaux les écrivent. « Enduit » et « Syporex »
 * ont été ajoutés en lisant : quatre murs d'un séjour restaient sans substrat
 * alors que le rapport l'indiquait, et le § 34 le veut sur chaque unité.
 */
const SUBSTRATS =
  /\b(Bois|Pl[âa]tre|M[ée]tal|B[ée]ton|Brique|PVC|Divers|Ma[çc]onnerie|Pierre|Alu(?:minium)?|Verre|Enduits?|Syporex|Carrelages?)\b/i;

const REVETEMENTS = /\b(Peintures?|Papiers? peints?|Vernis|Lasure|Enduits?|Toile de verre|Carrelage|Fa[ïi]ence)\b/i;

/** Les quatre états de l'arrêté, dans les écritures rencontrées. */
const ETATS: [RegExp, EtatRevetement][] = [
  [/non\s*d[ée]grad[ée]/i, 'non dégradé'],
  [/non\s*visible/i, 'non visible'],
  [/[ée]tat\s*d[’'\s]*usage/i, 'état d’usage'],
  [/\bd[ée]grad[ée]\b/i, 'dégradé']
];

/** « Non mesurée », « NM », et le motif qui suit. */
const NON_MESUREE = /\b(?:non\s*mesur[ée]e?s?|NM)\b/i;

/** Une concentration en mg/cm2 : « 5,27 », « 0.89 ». */
const CONCENTRATION = /(?:^|\s)(\d{1,3}[.,]\d{1,2})(?=\s|$)/g;

/**
 * Une ligne de mesure, telle que la colonne de gauche la rend :
 *
 *     2 mesure 1 5,27 Etat d'usage (Traces
 *     4 partie basse (< 1 m) 0,89
 *     13 Huisserie 4,79 de chocs)
 *
 * Le numero ouvre la ligne, la concentration ferme la partie utile, et ce qui
 * est entre les deux est la LOCALISATION de la mesure sur l'unite. Le § 8 de
 * l'ordre les veut toutes les trois : sans le numero, la mesure n'est pas
 * tracable jusqu'au croquis.
 */
const LIGNE_DE_MESURE = /^(\d{1,3})\s+(.*?)\s+(\d{1,3}[.,]\d{1,2})(?=\s|$)/;

/**
 * Le recapitulatif qui ouvre un local, et qui le NOMME par la ligne d'avant :
 *
 *     Rez de chaussee - Plateau                       <- le nom du local
 *     Nombre d'unites de diagnostic : 12 - Nombre ... <- son recapitulatif
 *
 * /!\ Ce titre est pose AVANT l'en-tete de colonnes, donc hors des bornes du
 * tableau. Le borner sans le retenir faisait perdre le local de toutes les
 * unites : elles revenaient toutes a `null`. Il se retient donc a part.
 *
 * /!\ CE MOTIF DOIT ETRE LE MEME QUE CELUI DE `recapitulatifParLocal`.
 *
 * Il etait plus permissif — il s'arretait au nombre d'unites, sans exiger la
 * seconde moitie de la phrase. Il reconnaissait donc des recapitulatifs que
 * l'autre ignore, le compteur de rang avancait plus vite que la liste des noms,
 * et les locaux se decalaient : sur un volet de onze pieces, le tableau de
 * l'entree recevait le nom de l'escalier, et ainsi de suite jusqu'au bout.
 *
 * Deux motifs pour la meme rubrique, c'est deux verites qui divergent des que
 * l'une bouge. Celui-ci est desormais la copie exacte de l'autre.
 */
const RECAP_DU_LOCAL =
  /Nombre d'unit[ée]s de diagnostic\s*:\s*(\d+)\s*-\s*Nombre d'unit[ée]s de diagnostic de classe 3 rep[ée]r[ée]s?\s*:\s*(\d+)\s*soit\s*([\d.,]+)\s*%/i;

/** Le titre de tableau qui ouvre un local : « Rez de chaussée - Plateau ». */
const TITRE_LOCAL =
  /^\s*(?:Nombre d'unit[ée]s|TOTAL)\b/i;

function nombre(brut: string): number {
  return Number(brut.replace(',', '.'));
}

function etatDe(ligne: string): { etat: EtatRevetement | null; degradation: string | null } {
  for (const [motif, etat] of ETATS) {
    if (!motif.test(ligne)) continue;
    /* Ce que le rapport ajoute entre parenthèses : « Etat d'usage (Traces de
       chocs) ». La parenthèse peut être coupée sur la ligne suivante ; on ne
       prend que ce qui est là, sans reconstituer. */
    const paren = ligne.match(/\(([^)]{2,60})\)/);
    return { etat, degradation: paren?.[1]?.trim() ?? null };
  }
  return { etat: null, degradation: null };
}

/**
 * Le classement de l'unité : le dernier entier 0–3 isolé de la ligne.
 *
 * ⚠️ Il faut écarter les entiers qui appartiennent à une localisation de mesure
 * — « partie basse (< 1 m) » porte un 1 entouré d'espaces. On ne regarde donc
 * que ce qui suit la dernière parenthèse fermante.
 */
function classeDe(ligne: string): 0 | 1 | 2 | 3 | null {
  const apres = ligne.slice(ligne.lastIndexOf(')') + 1);
  const trouves = apres.match(/(?:^|\s)([0-3])(?=\s|$)/g);
  if (!trouves?.length) return null;
  const dernier = Number(trouves[trouves.length - 1]!.trim());
  return dernier as 0 | 1 | 2 | 3;
}

/**
 * LE LIBELLÉ D'UNE UNITÉ, LU À SA PLACE ET NON DANS UNE LISTE.
 *
 * Dans le tableau des mesures, une unité occupe toujours la même position :
 * entre la zone (une lettre isolée en tête, parfois précédée d'un tiret) et le
 * substrat. Ce qui s'y trouve est son libellé, quel que soit le mot employé.
 *
 *     A Cimaise Bois Peinture Non Dégradé 1   ->  « Cimaise »
 *     - A Porte (P1) PVC Non mesurée - NM ... ->  « Porte (P1) »
 *
 * ⚠️ ON NE DEVINE PAS POUR AUTANT. Trois garde-fous, tous vérifiés sur les
 * volets lus :
 *
 *  - un substrat doit être présent, et le libellé le PRÉCÉDER — sans quoi la
 *    ligne n'a pas la forme d'une unité ;
 *  - le libellé ne peut pas commencer par un chiffre : les lignes de la colonne
 *    de gauche (« 84 mesure 1 2,37 ») en portent un, et ce sont des mesures, pas
 *    des unités ;
 *  - il ne peut pas être vide ni interminable — au-delà de 48 caractères, c'est
 *    une phrase du rapport, pas un intitulé de tableau.
 *
 * La vraisemblance de la ligne (classement, ou mention « non mesurée ») reste
 * contrôlée en aval, comme pour les libellés reconnus par leur nom.
 */
/**
 * OÙ FINIT LE LIBELLÉ DE L'UNITÉ, QUAND SON NOM CONTIENT UN SUBSTRAT.
 *
 * ⚠️ Le rapport écrit « Terrasse bois » comme unité et « Bois » comme substrat :
 *
 *     - Terrasse bois Bois Non mesurée - NM Absence de revêtement
 *                ^^^^ ^^^^
 *                nom  substrat
 *
 * S'arrêter au PREMIER substrat rencontré tronquait l'unité en « Terrasse » et
 * lui retirait un mot que le rapport avait écrit. Les termes du rapport se
 * reprennent entiers.
 *
 * Le repère est la colonne suivante : le substrat est la DERNIÈRE occurrence
 * avant le revêtement, ou avant la mention de mesure quand il n'y a pas de
 * revêtement. Ce qui précède appartient au nom de l'unité.
 *
 * Vérifié sur les trois dispositions rencontrées :
 *
 *     A Cimaise Bois Peinture Non Dégradé 1   -> « Cimaise »   (borne : Peinture)
 *     A Mur Divers Tapisserie 0               -> « Mur »       (borne : Tapisserie)
 *     - Terrasse bois Bois Non mesurée - NM   -> « Terrasse bois » (borne : Non mesurée)
 */
function finDuLibelle(ligne: string): number {
  /* La colonne d'après : revêtement, ou à défaut la mention de mesure. */
  const apres =
    ligne.match(REVETEMENTS)?.index ?? ligne.match(/\bnon\s*mesur[ée]e?s?\b/i)?.index ?? ligne.length;

  let retenu = -1;
  const cherche = new RegExp(SUBSTRATS.source, 'gi');
  for (let m = cherche.exec(ligne); m; m = cherche.exec(ligne)) {
    if (m.index >= apres) break;
    retenu = m.index;
  }
  if (retenu >= 0) return retenu;
  /* Aucun substrat sur la ligne : les colonnes sont empilées, et la mention de
     mesure fait alors seule office de borne. */
  return apres < ligne.length ? apres : -1;
}

function libelleParLaForme(ligne: string): string | null {
  const zone = ligne.match(ZONE_EN_TETE);
  const debut = zone ? zone[0].length : 0;

  /*
   * ⚠️ LA COLONNE « SUBSTRAT » N'EST PAS TOUJOURS SUR LA LIGNE DE L'UNITÉ.
   *
   * Sur les locaux extérieurs, l'extraction empile les colonnes au lieu de les
   * aligner — le substrat part sur les lignes voisines :
   *
   *     Façade
   *     - Mur Non mesurée - NM Absence de revêtement
   *     Pierre
   *     Végétations
   *     - A bord immédiat Non mesurée - NM Absence de revêtement
   *     diverses
   *
   * La ligne de l'unité n'a alors PLUS de substrat, et le libellé n'a plus de
   * borne de fin. Mais elle en garde une autre, aussi sûre : la mention « non
   * mesurée », qui n'existe que dans la colonne des mesures du tableau des
   * unités. Ce qui la précède est le libellé.
   *
   * Deux volets perdaient chacun une unité extérieure pour cette raison, et le
   * motif était le même — « Extérieur : 2 captées pour 3 annoncées ».
   */
  const fin = finDuLibelle(ligne);
  if (fin < 0 || debut >= fin) return null;

  const libelle = ligne.slice(debut, fin).trim();
  if (libelle.length < 2 || libelle.length > 48) return null;
  /* Une ligne de la colonne de gauche ouvre sur son numéro de mesure. */
  if (/^\d/.test(libelle)) return null;
  return libelle;
}

/**
 * Les unités de diagnostic d'un volet plomb.
 *
 * Le local courant vient du dernier titre rencontré ; la zone, de la lettre en
 * tête de ligne. Une ligne sans élément reconnu n'est pas une unité : elle est
 * ignorée, jamais devinée.
 */
/**
 * Les bornes du tableau des mesures.
 *
 * ⚠️ SANS RUBRIQUE, ON NE CITE RIEN. Le corps du CREP écrit « volet, portail,
 * grille » dans le rappel réglementaire, « plafond » et « murs » dans la
 * définition des situations de dégradation : lus hors du tableau, ces mots
 * fabriquaient des unités de diagnostic qui n'existent pas. Onze fantômes sur
 * un volet de douze unités.
 */
/*
 * ⚠️ UN EN-TÊTE DE COLONNES, PAS UNE PHRASE QUI EN CONTIENT LES MOTS.
 *
 * Ce motif s'écrivait « Unité de diagnostic.*Substrat ». Le `.*` acceptait
 * n'importe quelle prose entre les deux mots — et le CREP en contient une, dans
 * son rappel réglementaire :
 *
 *     NOTE Une unité de diagnostic (UD) est un ou plusieurs éléments de
 *     construction ayant même substrat et même revêtement.
 *
 * Cette note ouvrait le tableau 46 lignes avant le vrai en-tête. Le tableau de
 * synthèse du § 5 s'y engouffrait, et sa ligne « Sous-Sol - Escalier 3 »
 * devenait une unité de diagnostic de classe 3 qui n'existe pas.
 *
 * ⚠️ ET C'EST AUSSI LA SIGNATURE DE L'ÉDITEUR. La note figure dans TOUT CREP,
 * quel que soit le logiciel qui l'imprime : la signature ne reconnaissait donc
 * pas un format, elle reconnaissait le diagnostic. Un lecteur choisi sur une
 * signature pareille n'est pas choisi.
 *
 * Les intitulés de colonnes se suivent — ils ne sont séparés que par des
 * espaces. C'est ce qui distingue une ligne de tableau d'une phrase.
 */
const OUVRE_LE_TABLEAU =
  /Unit[ée]\s+de\s+diagnostic\s+Substrat|Substrat\s+Rev[êe]tement\s+apparent/i;
/*
 * /!\ CE QUI FERME LE TABLEAU, ET CE QUI NE LE FERME PAS.
 *
 * « NM : Non mesure car... » et « Localisation des mesures sur croquis » sont
 * des NOTES DE BAS DE TABLEAU : elles sont reimprimees sous CHAQUE page du
 * tableau. S'en servir comme borne fermait le tableau des la premiere page, et
 * toutes les unites des pages suivantes etaient perdues.
 *
 * Mesure sur 107 volets : 39 % de concordance seulement, dont 37 cas d'unites
 * manquantes. Seul le passage a la rubrique suivante ferme le tableau.
 */
const FERME_LE_TABLEAU =
  /^\s*6\s*\.\s*1|Classement des unit[ée]s de diagnostic|^\s*6\s*\.?\s*Conclusion|Recommandations au propri[ée]taire/i;

/**
 * LA SIGNATURE DE CE FORMAT.
 *
 * /!\ Elle ne peut pas s'appuyer sur une declaration d'editeur : mesure sur
 * 111 volets plomb repartis dans tout le corpus, **aucun ne nomme son editeur
 * sur ses pages**. Ni rubrique logiciel, ni pied de page de reseau.
 *
 * On reconnait donc le format a sa FORME : l'en-tete de colonnes du tableau des
 * mesures, qui associe l'unite de diagnostic a son substrat. C'est un repere de
 * mise en page, propre a l'outil qui l'imprime.
 */
export function reconnaitLiciel(lignes: readonly string[]): { preuve: string } | null {
  for (const ligne of lignes) {
    if (!OUVRE_LE_TABLEAU.test(ligne)) continue;
    return { preuve: ligne.trim().slice(0, 120) };
  }
  return null;
}

export function unitesDeDiagnostic(lignes: readonly string[]): UniteDeDiagnostic[] {
  const unites: UniteDeDiagnostic[] = [];
  let local: string | null = null;
  let dansLeTableau = false;
  /* Les noms de locaux, tels que le recapitulatif les donne, dans l'ordre. */
  const nomsDeLocaux = recapitulatifParLocal([...lignes]).map((r) => r.local);
  let rangDuLocal = 0;

  /*
   * ⚠️ LA FORME DU TABLEAU — mesuré chez LICIEL, à ne pas tenir pour générale.
   *
   * L'extraction du PDF entrelace les colonnes : une unité occupe TROIS lignes,
   * et la sienne ne porte ni son numéro de mesure, ni sa concentration, ni son
   * état de conservation.
   *
   *     2 mesure 1 5,27 Etat d'usage (Traces     ← la mesure, et l'état
   *     B Plinthes Bois Peinture 2               ← l'unité, et sa classe
   *     3 mesure 2 3,54 de chocs)                ← la mesure, et la suite
   *
   * On lit donc la ligne de l'unité AVEC sa voisine d'avant et celle d'après,
   * sauf si ces voisines sont elles-mêmes des unités.
   */
  const estUneUnite = (i: number): boolean => {
    const l = lignes[i]?.trim();
    return !!l && ELEMENT.test(l);
  };

  /* Les titres de locaux, pour les reconnaître : ce sont eux qui ferment le
     tableau du local précédent. */
  const titres = new Set(nomsDeLocaux.filter(Boolean));

  for (let i = 0; i < lignes.length; i++) {
    const brute = lignes[i]!;
    const ligne = brute.trim();
    if (!ligne) continue;

    /*
     * ⚠️ LE TITRE DU LOCAL SUIVANT FERME LE TABLEAU DU PRÉCÉDENT.
     *
     * Sans ça, le tableau restait ouvert d'un local à l'autre, et le titre
     * lui-même devenait une unité : « RDC - Escalier 1 » porte le mot
     * « Escalier » et se termine par « 1 » — soit, pour le lecteur, un escalier
     * de classe 1. Tous les locaux numérotés étaient touchés : Escalier 1,
     * Abris 2, Chambre 1…
     *
     * Mesuré sur un volet de onze pièces : deux unités fantômes, exactement les
     * deux locaux dont le titre finit par un chiffre.
     */
    if (titres.has(ligne)) {
      dansLeTableau = false;
      continue;
    }

    /* Le nom du local se lit avant le tableau : on le retient sans attendre
       d'être dans les bornes, sinon il est perdu pour toutes les unités. */
    /*
     * /!\ LE NOM DU LOCAL NE SE DEVINE PAS : IL SE PREND OU IL EST DEJA LU.
     *
     * Ce lecteur remontait trois lignes au-dessus du recapitulatif et retenait
     * la premiere ligne « plausible ». Mesure sur un volet de 105 unites : les
     * quatre locaux annonces recevaient ZERO unite, et les 99 captees etaient
     * rattachees a « mesurees » (fragment d'en-tete) et « Rapport du : » (pied
     * de page).
     *
     * `recapitulatifParLocal` faisait deja ce travail, avec sa liste de ce qui
     * n'est PAS un nom de local. On prend ses noms dans leur ordre — on ne
     * refait pas moins bien ce qui existe.
     *
     * Le champ « local » etait rempli a 100 % : un taux de remplissage ne dit
     * rien de la justesse de ce qu'il remplit.
     */
    /*
     * ⚠️ UNE LIGNE D'UNITÉ NE PORTE JAMAIS DE POURCENTAGE.
     *
     * Le § 5 ouvre par un tableau récapitulatif qui liste chaque pièce avec ses
     * classes : « RDC - Escalier 1  2  2 (100 %)  -  -  -  - ». Cette ligne
     * porte le mot « Escalier », donc un élément — et elle devenait une unité
     * de diagnostic non classée.
     *
     * Les autres pièces y échappaient par hasard : « Cuisine », « Garage » ou
     * « Séjour » ne sont pas des éléments. C'est en ajoutant « Escalier » à la
     * liste que ces deux fantômes sont apparus — l'élargissement d'une liste se
     * paie toujours quelque part, et c'est pourquoi il se mesure.
     *
     * Le partage est net : les pourcentages vivent dans les récapitulatifs, les
     * unités dans le tableau détaillé. Vérifié sur les volets lus, aucune ligne
     * d'unité n'en porte.
     */
    /* ⚠️ Le récapitulatif porte lui-même « soit X % » : il doit passer AVANT le
       garde-fou ci-dessous, sinon il ne nomme plus aucun local. */
    if (RECAP_DU_LOCAL.test(ligne)) {
      local = nomsDeLocaux[rangDuLocal++] ?? null;
      continue;
    }

    /* Le garde-fou décrit plus haut : les pourcentages vivent dans les
       récapitulatifs, jamais sur une ligne d'unité de diagnostic. */
    if (ligne.includes('%')) continue;

    if (!dansLeTableau) {
      if (OUVRE_LE_TABLEAU.test(ligne)) dansLeTableau = true;
      continue;
    }
    if (FERME_LE_TABLEAU.test(ligne)) {
      dansLeTableau = false;
      continue;
    }

    /* Le titre d'un local précède son récapitulatif. On le retient tel quel. */
    if (TITRE_LOCAL.test(ligne)) continue;

    const element = ligne.match(ELEMENT);
    /*
     * ⚠️ UNE LISTE DE MOTS NE SE REFERME JAMAIS.
     *
     * Le lecteur ne reconnaissait une unité qu'au nom de son élément, pris dans
     * une liste. Chaque volet nouveau apportait son mot manquant — « Boiseries »,
     * « Structure », « Cimaise » — et chaque ajout ne réparait que le rapport
     * qui l'avait révélé. Un échantillon témoin l'a chiffré : le lecteur montait
     * à 100 % sur le corpus qui servait à le corriger et retombait à 77 % sur
     * des volets jamais lus. C'était apprendre un corpus, pas lire un format.
     *
     * Une unité se reconnaît donc AUSSI à sa forme, qui ne dépend d'aucun mot :
     *
     *     A Cimaise Bois Peinture Non Dégradé 1
     *     ^ zone     ^ substrat            ^ classement
     *
     * Ce qui se tient entre la zone et le substrat EST le libellé de l'unité —
     * quel qu'il soit. On lit ce que le rapport écrit au lieu de vérifier qu'il
     * emploie un vocabulaire connu.
     *
     * /!\ La forme ne remplace pas la liste, elle s'y ajoute : les deux portes
     * mènent au même contrôle de vraisemblance, quelques lignes plus bas.
     */
    const parLaForme = element?.[1] ? null : libelleParLaForme(ligne);
    if (!element?.[1] && !parLaForme) {
      /*
       * /!\ Un second chemin de nommage vivait ici : « une ligne courte sans
       * chiffre est un titre de local ». Il attrapait « Rapport du : », un pied
       * de page, et ecrasait au milieu du tableau le nom que le recapitulatif
       * avait donne. Le nom vient d'un seul endroit desormais.
       */
      continue;
    }

    /*
     * ⚠️ UN NOM D'ÉLÉMENT SEUL NE FAIT PAS UNE UNITÉ.
     *
     * Les observations du rapport sont éclatées par l'extraction, un mot par
     * ligne. Un comble dont l'unique unité est un plafond porte l'observation
     * « Éléments de charpente bois accessibles en périphérie de la trappe » —
     * et le mot « charpente », seul sur sa ligne, devenait une unité de plus.
     *
     * Toute vraie ligne d'unité porte au moins un de ces trois signes : un
     * substrat, un classement, ou la mention « non mesurée ». Vérifié sur les
     * volets lus, sans exception.
     */
    if (!SUBSTRATS.test(ligne) && !NON_MESUREE.test(ligne) && classeDe(ligne) === null) continue;

    /* Les lignes qui appartiennent à cette unité : la sienne, et ses voisines
       tant qu'elles ne sont pas d'autres unités. */
    const voisines = [ligne];
    if (i > 0 && !estUneUnite(i - 1)) voisines.unshift(lignes[i - 1]!.trim());
    if (i + 1 < lignes.length && !estUneUnite(i + 1)) voisines.push(lignes[i + 1]!.trim());
    const bloc = voisines.join(' ');

    const nonMesuree = NON_MESUREE.test(ligne);
    /* L'état et la dégradation se lisent sur le bloc — jamais sur la seule
       ligne de l'unité, où ils ne figurent pas. */
    const { etat, degradation } = etatDe(bloc);
    /* Les mesures aussi : colonne de gauche, une par ligne, avec leur numero et
       leur localisation. Le § 8 les veut toutes les trois, parce que sans le
       numero la mesure n'est pas tracable jusqu'au croquis. La classe, elle,
       reste lue sur la ligne de l'unite et sur elle seule. */
    const mesures: MesureXrf[] = [];
    for (const v of voisines) {
      if (v === ligne) continue;
      const m = v.match(LIGNE_DE_MESURE);
      if (m) {
        mesures.push({
          numero: Number(m[1]),
          localisation: m[2]?.trim() || null,
          concentration: nombre(m[3]!)
        });
        continue;
      }
      /* Une ligne sans numero garde quand meme sa concentration : mieux vaut la
         mesure sans son numero que pas de mesure du tout. */
      for (const c of v.matchAll(CONCENTRATION)) {
        mesures.push({ numero: null, localisation: null, concentration: nombre(c[1]!) });
      }
    }

    /* Le libellé entier de l'élément : de son nom jusqu'à la parenthèse de
       repère comprise, c'est lui qui distingue les faces. */
    const debut = element?.[1] ? ligne.indexOf(element[1]) : ligne.indexOf(parLaForme!);
    /* /!\ LA MÊME BORNE POUR LES DEUX CHEMINS.
       Une liste de substrats était recopiée ici, plus courte que la vraie et
       déjà périmée ; et elle s'arrêtait au PREMIER substrat, ce qui tronquait
       « Terrasse bois » en « Terrasse ». `finDuLibelle` répond pour les deux. */
    const fin = finDuLibelle(ligne);
    const libelle = (
      fin > debut ? ligne.slice(debut, fin) : (element?.[1] ?? parLaForme ?? '')
    ).trim();

    unites.push({
      local,
      zone: ligne.match(ZONE_EN_TETE)?.[1] ?? null,
      element: libelle,
      face: libelle.match(FACE)?.[1]?.toLowerCase() ?? null,
      substrat: ligne.slice(debut + libelle.length).match(SUBSTRATS)?.[1] ?? null,
      revetement: ligne.match(REVETEMENTS)?.[1] ?? null,
      mesures: nonMesuree ? [] : mesures,
      etat,
      degradation,
      classe: nonMesuree ? null : classeDe(ligne),
      mesuree: !nonMesuree,
      motif: nonMesuree ? (ligne.match(/(?:NM|non mesur[ée]e?s?)\s*[-–]?\s*(.{3,60})$/i)?.[1]?.trim() ?? null) : null
    });
  }

  return unites;
}

/**
 * Le lecteur, tel que l'aiguilleur le consomme.
 *
 * Il porte son editeur, ce qu'il lit, sa signature et sa lecture — les quatre
 * choses que l'architecture exige pour qu'un format soit nomme avant d'etre lu.
 */
export const LECTEUR_CREP_LICIEL: Lecteur<UniteDeDiagnostic[]> = {
  editeur: 'LICIEL',
  quoi: 'CREP',
  reconnait: reconnaitLiciel,
  lire: unitesDeDiagnostic
};
