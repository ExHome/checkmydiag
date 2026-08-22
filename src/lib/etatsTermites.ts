/**
 * LES TROIS ÉTATS DE LA NORME, MONTRÉS COMME UNE ÉCHELLE.
 *
 * NF P 03-201 ne connaît pas deux conclusions mais trois. Le lecteur, lui,
 * n'en voit qu'une : celle de son rapport. Il ne peut donc pas savoir si
 * « aucun indice » est la meilleure des situations possibles, ou seulement la
 * moins mauvaise de deux.
 *
 * On montre donc les trois, et l'on marque celle du rapport — comme l'échelle
 * A→G du DPE, où l'on comprend sa lettre parce qu'on voit les six autres.
 */
import type { Diagnostic } from './modele';

export type CleEtatTermites = 'absence' | 'indices' | 'infestation';

export interface EtatTermites {
  readonly cle: CleEtatTermites;
  /** Le nom de la norme, sans reformulation. */
  readonly nom: string;
  /** Ce que cela veut dire, en langue de tous les jours. */
  readonly quoi: string;
  /** Du plus rassurant au plus grave : 1, 2, 3. */
  readonly rang: 1 | 2 | 3;
}

/**
 * Les trois états, dans l'ordre de la norme.
 *
 * Les noms sont ceux du diagnostic. On les explique en dessous, on ne les
 * remplace pas : c'est le vocabulaire que le lecteur retrouvera dans son
 * rapport et chez son notaire.
 */
export const ETATS_TERMITES: readonly EtatTermites[] = [
  {
    cle: 'absence',
    nom: 'Absence d’indice d’infestation',
    quoi: 'Le diagnostiqueur n’a trouvé aucune trace, là où il a pu regarder.',
    rang: 1
  },
  {
    cle: 'indices',
    nom: 'Présence d’indices d’infestation',
    quoi: 'Des traces ont été trouvées — galeries, cordons, bois qui sonne creux — sans insecte vu.',
    rang: 2
  },
  {
    cle: 'infestation',
    nom: 'Présence de termites',
    quoi: 'Des termites vivants ont été constatés dans le bâtiment.',
    rang: 3
  }
];

/**
 * Lequel des trois états le rapport porte, ou null si on ne l'a pas lu.
 *
 * ── ON NE DEVINE PAS ──────────────────────────────────────────────────────
 *
 * La lecture s'appuie sur le verdict tel qu'il est écrit, et sur rien d'autre.
 * Quand aucune des trois formes n'est reconnue, la fonction rend `null` :
 * l'écran affiche alors les trois états sans en marquer aucun, et dit qu'il
 * n'a pas su lire. C'est la seule réponse honnête — marquer « absence » par
 * défaut transformerait un silence en bonne nouvelle.
 */
export function etatLuDansLeRapport(d: Diagnostic): CleEtatTermites | null {
  const v = (d.verdict ?? '').toLowerCase();
  if (!v) return null;

  /*
   * L'ORDRE COMPTE, ET C'EST UNE RÈGLE DE SÉCURITÉ.
   *
   * ── 1. L'ABSENCE D'ABORD, parce qu'elle seule porte une négation ────────
   *
   * « Aucun indice », « il n'a pas été repéré d'indice » : ces phrases
   * contiennent le mot « indice », et tout motif large qui chercherait les
   * indices les attraperait — annonçant le deuxième état pour un rapport qui
   * conclut au premier. On écarte donc les négations avant tout le reste.
   *
   * ── 2. L'INFESTATION ENSUITE, avant les indices ─────────────────────────
   *
   * Un rapport grave nomme souvent les deux : « présence de termites et
   * d'indices d'infestation ». Reconnaître « indices » en premier annoncerait
   * le deuxième état pour un logement qui relève du troisième — moins grave
   * que la réalité.
   *
   * ── 3. LES INDICES EN DERNIER, avec un motif souple ─────────────────────
   *
   * Le premier motif écrit ici exigeait « indices d'infestation » collé à
   * « ont été relevés ». Un test l'a pris en défaut sur la phrase que produit
   * le moteur lui-même : « Des indices d'infestation DE TERMITES ont été
   * relevés dans 1 zone ». Trois mots au milieu, et la conclusion grave
   * devenait illisible. À ce stade toute négation a déjà été écartée : le
   * seul mot « indice » suffit.
   */
  if (/aucun indice|pas d.indice|n.a pas [ée]t[ée] rep[ée]r[ée] d.indice|absence d.indice/.test(v)) {
    return 'absence';
  }
  if (/pr[ée]sence de termites|termites? (vivants?|constat[ée]s?)|infestation constat[ée]e/.test(v)) {
    return 'infestation';
  }
  if (/indices?\b/.test(v)) {
    return 'indices';
  }
  return null;
}

/**
 * OÙ. Les endroits que le rapport nomme, dès que la conclusion est grave.
 *
 * ── POURQUOI C'EST OBLIGATOIRE ET PAS OPTIONNEL ────────────────────────────
 *
 * « Présence d'indices » sans localisation ne se transmet pas. L'acquéreur ne
 * peut ni faire chiffrer un traitement, ni discuter un prix, ni même aller
 * regarder : il sait seulement qu'il y a quelque chose, quelque part. Le
 * diagnostiqueur, lui, a écrit l'endroit — c'est la moindre des choses de le
 * lui rendre.
 *
 * D'où la règle : dès que l'état est `indices` ou `infestation`, l'écran dit
 * OÙ. Et quand le rapport ne le dit pas, il faut l'écrire aussi : un silence
 * sur la localisation d'une infestation est une information en soi.
 */
export function ouEstCeGrave(d: Diagnostic): string[] {
  const zones = d.schema?.genre === 'pieces' ? d.schema.zones : [];
  return zones
    .filter((z) => z.etat === 'alerte' || z.etat === 'attention')
    .map((z) => z.nom.replace(/\s*[—–-]\s*$/, '').trim())
    .filter((nom) => nom.length > 0);
}

/**
 * La phrase qui donne le résultat ET l'endroit.
 *
 * Les deux ensemble, jamais l'un sans l'autre : c'est la contrainte
 * « localiser avant de résumer ». Une conclusion grave sans lieu est une
 * alerte qu'on ne peut pas suivre.
 */
export function resultatEtLocalisation(d: Diagnostic): {
  etat: CleEtatTermites | null;
  ou: string[];
  phrase: string;
} {
  const etat = etatLuDansLeRapport(d);
  const ou = ouEstCeGrave(d);

  /* Les deux états graves exigent un lieu. Le premier n'en a pas besoin :
     « rien vu » ne se localise pas, cela couvre tout ce qui a été regardé. */
  if (etat !== 'indices' && etat !== 'infestation') {
    return { etat, ou: [], phrase: '' };
  }

  const quoi = etat === 'infestation' ? 'Des termites ont été constatés' : 'Des indices ont été relevés';

  if (!ou.length) {
    /*
     * Le rapport conclut à une présence sans nommer d'endroit. On ne comble
     * pas : on signale le manque, parce qu'il empêche d'agir.
     */
    return {
      etat,
      ou,
      phrase: `${quoi}, mais le rapport ne dit pas où — demandez la localisation à votre diagnostiqueur.`
    };
  }

  const liste = ou.length === 1 ? ou[0] : `${ou.slice(0, -1).join(', ')} et ${ou[ou.length - 1]}`;
  return { etat, ou, phrase: `${quoi} : ${liste}.` };
}

/**
 * La phrase qui accompagne l'échelle.
 *
 * Elle rappelle, pour chaque état, ce que le rapport NE dit pas — parce que
 * c'est là que se joue la mécompréhension. « Absence d'indice » ne veut pas
 * dire « pas de termites » : cela veut dire « rien vu là où on a regardé ».
 */
export function laReserveDe(cle: CleEtatTermites | null): string {
  switch (cle) {
    case 'absence':
      return 'C’est la meilleure des trois conclusions. Elle ne garantit pas l’absence de termites : elle dit qu’aucune trace n’a été vue dans les parties accessibles.';
    case 'indices':
      return 'Des traces, sans insecte observé. Cela n’exclut ni une colonie active ailleurs, ni une infestation ancienne et éteinte : seul un professionnel du traitement peut trancher.';
    case 'infestation':
      return 'C’est la conclusion la plus grave des trois. La déclaration en mairie est obligatoire, et le traitement relève d’une entreprise spécialisée.';
    default:
      return 'La conclusion de ce rapport n’a pas été reconnue parmi les trois états de la norme. Ouvrez-la dans le document : elle s’y trouve.';
  }
}
