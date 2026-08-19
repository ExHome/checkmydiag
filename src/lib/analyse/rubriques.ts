/**
 * Les rubriques réglementaires d'un diagnostic.
 *
 * « Les sections sont réglementaires. » Ce n'est pas une mise en page choisie
 * par un éditeur de logiciel : c'est un arrêté qui impose à chaque rapport ses
 * parties, leur intitulé et leur ordre. Le document a donc un squelette, et ce
 * squelette est opposable.
 *
 * Chaque rapport est structuré par un arrêté : le constat amiante a ses sept
 * chapitres, l'état termites ses rubriques A à J, le gaz sa rubrique E des
 * anomalies, le CREP ses neuf parties. Cette structure est le squelette du
 * document — et jusqu'ici le moteur l'ignorait.
 *
 * ── Ce qu'on faisait avant, et pourquoi c'était fragile ────────────────────
 *
 * On cherchait des motifs de texte au jugé, dans tout le volet. « Le tableau
 * des anomalies », « la liste des pièces », « la conclusion » : autant de
 * recherches en aveugle, chacune capable de tomber sur un rappel de la loi, un
 * sommaire ou une annexe. Trois erreurs de la journée viennent de là — le
 * décompte des arrêtés sécheresse qui débordait sur une autre page, la borne
 * de rubrique qui coupait au premier numéro venu, la correction du gaz qui
 * s'était posée sur l'électricité.
 *
 * Chercher DANS une rubrique nommée supprime la classe entière de ces fautes.
 *
 * ── La leçon du corpus : le NUMÉRO ment, l'INTITULÉ tient ──────────────────
 *
 * Mesuré sur 140 dossiers. Les intitulés sont d'une stabilité remarquable :
 * « Désignation du ou des bâtiments » ouvre 68 états termites sur 68, les neuf
 * parties du CREP sont identiques dans les 38 constats. Les numéros, eux,
 * bougent : « Matériels électriques » porte le 5 dans dix-neuf rapports et le 6
 * dans neuf autres ; onze états termites intervertissent H et I — les
 * constatations et les moyens d'investigation échangent leur lettre.
 *
 * On s'ancre donc sur ce que l'arrêté impose — les mots — et jamais sur ce que
 * l'éditeur numérote.
 */
import type { TypeDiag } from '../modele';

export interface Rubrique {
  /** La lettre ou le numéro, tel qu'écrit : « E », « 3.2 », « 1.2 ». */
  repere: string;
  /** L'intitulé, nettoyé de son repère. */
  titre: string;
  /** Les lignes de la rubrique, sans sa ligne de titre. */
  lignes: string[];
  /** Où elle commence dans les lignes fournies. */
  debut: number;
}

/*
 * Ce qui ouvre une rubrique.
 *
 * Une lettre de A à J, ou un numéro à un ou deux niveaux, suivi d'un séparateur
 * et d'un intitulé de quatre à cent soixante caractères. La borne haute a été
 * relevée sur pièce : la rubrique F du gaz s'intitule « Identification des
 * bâtiments et parties du bâtiment (pièces et volumes) n'ayant pu être
 * contrôlés et motifs… ». À quatre-vingts caractères elle n'était pas reconnue,
 * et la rubrique E débordait sur elle dans onze rapports. Le séparateur peut être un
 * point, un tiret court ou un tiret cadratin, et les rapports en doublent
 * parfois deux — « E. – Anomalies identifiées », « D. — Identification des
 * appareils ». Les deux tirets sont acceptés partout : le cadratin manquait à
 * la seconde position, et la rubrique D des appareils s'y perdait.
 */
const OUVRE = /^\s*([A-J]|\d{1,2}(?:\.\d{1,2})?)\s*[.–—-]{1,2}\s*[.–—-]{0,2}\s*(.{4,160})$/;

/*
 * ── Ce qui RESSEMBLE à une rubrique sans en être une ───────────────────────
 *
 * Mesuré sur le corpus, et c'est ce qui a failli tout casser : les POINTS DE
 * CONTRÔLE normés du gaz s'écrivent « C.2 - 3.4a », « 2.3a : le local équipé ».
 * Ils sont à l'intérieur du tableau des anomalies, et le motif ci-dessus les
 * prend pour des ouvertures. Branché tel quel, il coupait la rubrique E en
 * plein milieu et perdait les anomalies elles-mêmes — dix « Organe de Coupure
 * d'Appareil A2 » évanouis sur seize rapports.
 *
 * Deux gardes, toutes deux tirées de l'arrêté plutôt que devinées.
 */

/*
 * Première garde : un intitulé réglementaire commence par un MOT.
 *
 * « Anomalies identifiées », « Désignation du ou des bâtiments ». Jamais par un
 * chiffre — ce qui écarte d'un coup « 1 - 3.4a » et « 3a : le local équipé »,
 * qui sont des références de la norme, pas des parties du rapport.
 */
function estUnIntitule(titre: string): boolean {
  return /^[A-Za-zÀ-ÿ]/.test(titre);
}

/*
 * Seconde garde : les parties de l'arrêté sont ORDONNÉES.
 *
 * A puis B puis C, ou 1 puis 2 puis 3. Une rubrique « C » ne peut pas suivre
 * une rubrique « E » : quand un repère recule, ce n'est pas une partie du
 * rapport, c'est une référence citée au fil du texte. C'est cette règle qui
 * élimine les « C.1 » du tableau gaz, et elle vaut pour tous les diagnostics.
 *
 * Le rang est calculé par famille — lettres d'un côté, numéros de l'autre —
 * parce qu'un rapport peut légitimement passer d'une série à l'autre entre
 * deux parties.
 */
function rang(repere: string): { famille: 'lettre' | 'numero'; valeur: number } {
  if (/^[A-J]$/.test(repere)) return { famille: 'lettre', valeur: repere.charCodeAt(0) };
  const [haut = '0', bas = '0'] = repere.split('.');
  return { famille: 'numero', valeur: Number(haut) * 100 + Number(bas) };
}

/*
 * Troisième garde : un rapport numérote d'UNE seule façon.
 *
 * Le gaz va de A à J, le CREP de 1 à 9. Jamais les deux. Or les points de
 * contrôle de la norme gaz portent eux aussi des numéros — « 19.a1 : le local
 * équipé ou prévu pour un appareil autre que de cuisson… » — et trois volets du
 * corpus voyaient ainsi une « rubrique 19 » s'ouvrir en plein tableau.
 *
 * La famille est donc fixée par la première rubrique du document, et les autres
 * sont ignorées. Aucun arrêté de diagnostic ne mélange les deux.
 */

/*
 * Comparer les intitulés malgré ce que l'extraction leur fait.
 *
 * Trois rubriques G sur seize sortent « Const atations diverses »,
 * « Constatation s diverses », « Constatations dive rses » : l'espacement des
 * caractères du PDF fabrique des espaces au milieu des mots. Le motif
 * « constatations diverses » n'en trouvait alors aucune, et la rubrique
 * disparaissait sans que rien ne le signale.
 *
 * On compare donc aussi une version débarrassée de tous ses espaces — de part
 * et d'autre, pour que la comparaison reste juste.
 */
function sansEspaces(t: string): string {
  return t.replace(/[\s ]+/g, '').replace(/[’´`]/g, "'");
}

/*
 * Quatrième garde : le SOMMAIRE n'est pas le rapport.
 *
 * Le CREP ouvre sur sa table des matières, et chaque entrée y a la forme exacte
 * d'une rubrique — « 6. Conclusion 8 », « 9. Annexes 11 » — le dernier nombre
 * étant le numéro de page. Sans cette garde, la couverture du plomb affichait
 * un impeccable 100 % qui portait entièrement sur le sommaire : la règle de
 * croissance bloquait ensuite les vraies parties, dont les repères repartaient
 * de 1.
 *
 * Un intitulé réglementaire ne se termine jamais par un nombre isolé. Un renvoi
 * de page, si.
 */
function estUneLigneDeSommaire(titre: string): boolean {
  return /\s\d{1,3}\s*$/.test(titre);
}

/**
 * Découpe un volet en ses rubriques.
 *
 * Une rubrique court jusqu'à la suivante. Les lignes qui précèdent la première
 * — page de garde, en-tête — ne sont rattachées à aucune : elles n'appartiennent
 * à aucune partie de l'arrêté.
 */
export function rubriquesDe(lignes: string[]): Rubrique[] {
  /*
   * Toutes les lignes qui PEUVENT ouvrir une rubrique, gardes appliquées.
   * Le tri entre elles vient après : une ligne isolée ne dit pas si elle
   * appartient au sommaire ou au corps du rapport.
   */
  const candidates: Rubrique[] = [];
  lignes.forEach((brut, i) => {
    const m = brut.trim().match(OUVRE);
    if (!m?.[1] || !m[2]) return;
    const titre = m[2].trim();
    /* Un pied de page numéroté n'est pas une rubrique : « 2 / 14 ». */
    if (/^\d+\s*$/.test(titre)) return;
    if (!estUnIntitule(titre)) return;
    if (estUneLigneDeSommaire(titre)) return;
    candidates.push({ repere: m[1], titre, lignes: [], debut: i });
  });

  /*
   * ── Retrouver la vraie suite des parties ────────────────────────────────
   *
   * Trois choses portent des repères dans un rapport, et elles se ressemblent :
   * le SOMMAIRE, les PARTIES elles-mêmes, et les lignes numérotées qui vivent
   * à l'intérieur d'une partie — points de contrôle de la norme gaz, articles
   * cités. Il faut choisir la bonne.
   *
   * Découper le document en tranches croissantes ne suffit pas : une seule
   * ligne parasite entre deux parties coupe le volet en deux, et l'on perd la
   * moitié du rapport. Mesuré : le gaz gardait A à E et perdait F à J, dont sa
   * conclusion.
   *
   * On cherche donc la plus longue sous-suite croissante — celle qui ENJAMBE
   * les parasites au lieu de s'arrêter dessus — séparément pour chaque famille
   * de repères, puisqu'un rapport numérote d'une seule façon.
   *
   * Entre les deux familles, c'est l'ÉTENDUE qui tranche, et non le nombre :
   * les parties d'un arrêté courent d'un bout à l'autre du volet, tandis qu'un
   * tableau de points de contrôle, si long soit-il, tient sur une page. C'est
   * ce qui écarte aussi le sommaire du CREP, ramassé sur une seule page.
   */
  function plusLongueCroissante(liste: Rubrique[]): Rubrique[] {
    if (!liste.length) return [];
    /* Chaîne la plus longue se terminant à chaque position. */
    const taille = liste.map(() => 1);
    const avant = liste.map(() => -1);
    for (let i = 1; i < liste.length; i++) {
      for (let j = 0; j < i; j++) {
        const ri = rang(liste[i]!.repere).valeur;
        const rj = rang(liste[j]!.repere).valeur;
        if (rj < ri && taille[j]! + 1 > taille[i]!) {
          taille[i] = taille[j]! + 1;
          avant[i] = j;
        }
      }
    }
    let fin = 0;
    for (let i = 1; i < liste.length; i++) if (taille[i]! > taille[fin]!) fin = i;
    const suite: Rubrique[] = [];
    for (let i = fin; i >= 0; i = avant[i]!) {
      suite.unshift(liste[i]!);
      if (avant[i] === -1) break;
    }
    return suite;
  }

  const lettres = plusLongueCroissante(candidates.filter((c) => rang(c.repere).famille === 'lettre'));
  const numeros = plusLongueCroissante(candidates.filter((c) => rang(c.repere).famille === 'numero'));

  const etendue = (s: Rubrique[]) =>
    s.length ? (s[s.length - 1]?.debut ?? 0) - (s[0]?.debut ?? 0) : -1;

  let retenue = etendue(lettres) >= etendue(numeros) ? lettres : numeros;
  if (!retenue.length) retenue = lettres.length ? lettres : numeros;

  retenue.forEach((r, n) => {
    const fin = retenue[n + 1]?.debut ?? lignes.length;
    r.lignes = lignes.slice(r.debut + 1, fin);
  });
  return retenue;
}

/**
 * Les mots qui identifient une rubrique, par diagnostic.
 *
 * Ce sont les intitulés de l'arrêté, réduits à ce qui ne varie pas. « Anomalies
 * identifiées » suffit à trouver la rubrique E du gaz, quel que soit le numéro
 * que l'éditeur lui donne et quelle que soit la ponctuation qui suit.
 */
export const INTITULES: Partial<Record<TypeDiag, Record<string, RegExp>>> = {
  gaz: {
    batiments: /d[ée]signation du ou des b[âa]timents/i,
    proprietaire: /d[ée]signation du propri[ée]taire/i,
    operateur: /d[ée]signation de l['’]op[ée]rateur/i,
    appareils: /identification des appareils/i,
    anomalies: /anomalies identifi[ée]es/i,
    nonControles: /identification des b[âa]timents et parties du b[âa]timent/i,
    constatations: /constatations diverses/i,
    conclusion: /^conclusion/i,
    /* L'ordre de ces deux-là s'inverse d'un éditeur à l'autre, et leur intitulé
       se retourne avec : « En cas de DGI : actions de l'opérateur » chez l'un,
       « Actions de l'opérateur de diagnostic en cas de DGI » chez l'autre. On
       s'ancre donc sur ce qui ne bouge pas dans les deux formes. */
    actionsDgi: /(?=.*actions de l['’]op[ée]rateur)(?=.*DGI)/i,
    actions32c: /(?=.*actions de l['’]op[ée]rateur)(?=.*32c)/i
  },
  termites: {
    batiments: /d[ée]signation du ou des b[âa]timents/i,
    client: /d[ée]signation du client/i,
    operateur: /d[ée]signation de l['’]op[ée]rateur/i,
    /* La rubrique D porte le tableau pièce par pièce : c'est le constat. */
    constat: /identification des b[âa]timents et des parties de b[âa]timents visit/i,
    categories: /cat[ée]gories de termites/i,
    nonVisites: /identification des b[âa]timents et parties du b[âa]timent/i,
    nonExamines: /identification des ouvrages, parties d['’]ouvrages/i,
    constatations: /constatations diverses/i,
    moyens: /moyens d['’]investigation/i,
    visa: /^VISA et mentions/i
  },
  amiante: {
    conclusions: /^les conclusions/i,
    laboratoires: /laboratoire\(s\) d['’]analyses/i,
    mission: /^la mission de rep[ée]rage/i
  },
  plomb: {
    commande: /rappel de la commande/i,
    renseignements: /renseignements compl[ée]mentaires/i,
    methodologie: /m[ée]thodologie employ[ée]e/i,
    presentation: /pr[ée]sentation des r[ée]sultats/i,
    resultats: /r[ée]sultats des mesures/i,
    conclusion: /^conclusion/i,
    obligations: /obligations d['’]informations? pour les propri[ée]taires/i,
    reglementations: /information sur les principales r[èe]glementations/i,
    annexes: /^annexes/i
  },
  electricite: {
    local: /d[ée]signation et description du local/i,
    donneurDOrdre: /identification du donneur d['’]?\s?ordre/i,
    /* « Indentification » : la faute est de l'éditeur, et elle est dans sept
       rapports du corpus. Le motif accepte les deux orthographes — le « n »
       est facultatif, et il vient APRÈS le « i », non avant : écrit dans
       l'autre sens il excluait justement la forme correcte. */
    operateur: /in?dentification de l['’]op[ée]rateur/i,
    limites: /rappel des limites du champ/i,
    /* C'est ICI que se trouve le verdict de l'électricité — rubrique 5 dans
       les soixante-quatre volets mesurés, et non dans une rubrique
       « conclusion » générique. */
    conclusion: /conclusion relative [àa] l['’][ée]valuation des risques pouvant porter/i,
    devoirDeConseil: /conclusion relative [àa] l['’][ée]valuation des risques relevant du devoir/i,
    /* La rubrique 6 porte deux intitulés selon l'éditeur : cinquante rapports
       l'appellent « Avertissement particulier », treize « Matériels
       électriques ». Deux clés distinctes, une seule rubrique. */
    avertissement: /avertissement particulier/i,
    materiels: /^mat[ée]riels [ée]lectriques/i,
    explications: /explications d[ée]taill[ée]es relatives aux risques/i
  }
};

/**
 * La rubrique d'un diagnostic, cherchée par son intitulé réglementaire.
 *
 * Rend `null` quand elle est absente — et c'est une information : une rubrique
 * absente n'est pas une rubrique vide. Le gaz l'a montré ce matin, une rubrique
 * d'anomalies présente et vide vaut « aucune anomalie », alors qu'une rubrique
 * absente ne vaut rien du tout.
 */
export function rubrique(lignes: string[], type: TypeDiag, cle: string): Rubrique | null {
  const motif = INTITULES[type]?.[cle];
  if (!motif) return null;
  /* Le même motif, privé de ses espaces, pour les intitulés que l'extraction a
     coupés en morceaux. */
  const serre = new RegExp(sansEspaces(motif.source), motif.flags);
  return (
    rubriquesDe(lignes).find((r) => motif.test(r.titre) || serre.test(sansEspaces(r.titre))) ?? null
  );
}

/**
 * Les pages internes d'un DPE.
 *
 * Le DPE n'est pas numéroté par rubriques mais par pages : « DPE Diagnostic de
 * performance énergétique (logement) p. 5 ». Mesuré sur 95 DPE, la répartition
 * est stable — déperditions en page 2, consommations en 3, descriptif en 4,
 * recommandations en 5 et 6. C'est son squelette à lui.
 */
export function pagesDuDpe(lignes: string[]): Map<number, string[]> {
  const pages = new Map<number, string[]>();
  let courante: number | null = null;
  for (const l of lignes) {
    const m = l.match(/\(logement\)\s*p\.\s*(\d+)/i);
    if (m?.[1]) {
      courante = Number(m[1]);
      if (!pages.has(courante)) pages.set(courante, []);
      continue;
    }
    if (courante !== null) pages.get(courante)!.push(l);
  }
  return pages;
}
