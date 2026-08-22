/**
 * UN LECTEUR PAR ÉDITEUR — le routage, et rien d'autre.
 *
 * CONTRAINTE ABSOLUE, PERMANENTE ET GÉNÉRALE À TOUTE L'APPLICATION, posée par
 * Aude le 21/08/2026 (`ORDRE-DE-MISSION-LECTEURS-PAR-EDITEUR.md`) :
 *
 *   « La bonne architecture est un lecteur PAR ÉDITEUR, choisi sur signature,
 *     et non un lecteur unique rafistolé. On commence par nommer l'éditeur
 *     avant de lire. »
 *
 * POURQUOI CE MODULE EXISTE. Un lecteur unique qu'on rustine à chaque éditeur
 * rencontré applique la carte d'un seul logiciel à tous les autres. La lecture
 * amiante du 21/08 l'a prouvé sur pièce, et le cas est indéfendable autrement :
 *
 *   — chez LICIEL, le droit de l'amiante est imprimé en annexe dans 100 % des
 *     volets, positifs comme négatifs. « Travaux de retrait », « Score 3 »,
 *     « cinq fibres par litre » y sont donc du BRUIT ;
 *   — chez BC2E, ces mêmes mots ne sont imprimés QUE s'il y a un positif. Ils y
 *     sont donc un SIGNAL.
 *
 * Le même mot, au même endroit d'un rapport, ne prouve pas la même chose selon
 * l'éditeur. Un lecteur qui le cherche se trompe chez l'un ; un lecteur qui
 * l'écarte se trompe chez l'autre. Aucune rustine ne réconcilie les deux : il
 * faut deux lecteurs, et un aiguillage qui choisisse sur la signature.
 *
 * CE QUE CE MODULE NE FAIT PAS. Il ne lit rien. Il ne nomme pas l'éditeur non
 * plus — c'est le travail de `atelier/editeur.ts`, fait AVANT, et son résultat
 * entre ici. Ce module ne fait qu'une chose : donner le bon lecteur, et dire
 * quand il n'en a pas.
 */
import type { Generateur } from '../atelier/editeur';
import type { Diagnostic, TypeDiag } from '../modele';

/**
 * Ce qu'un lecteur reçoit — et l'éditeur en fait partie, par construction.
 *
 * C'est la moitié la plus importante de la contrainte : il ne doit pas être
 * POSSIBLE d'écrire un lecteur qui ignore l'éditeur, ni d'en appeler un sans
 * l'avoir nommé. Le générateur n'est donc pas un paramètre facultatif ajouté
 * en fin de liste : il est dans le contexte, au même rang que le texte.
 */
export interface Contexte {
  /** Les lignes du volet, bornes déjà posées. */
  readonly lignes: readonly string[];
  /** Les pages que le volet occupe dans le dossier. */
  readonly plage: readonly [number, number];
  /** Qui a produit ce rapport — nommé AVANT toute lecture. */
  readonly generateur: Generateur;
}

export type Lecteur = (contexte: Contexte) => Diagnostic;

/**
 * Un lecteur inscrit, et pour qui.
 *
 * `editeur: null` désigne le lecteur de repli — celui qu'on applique faute de
 * mieux, et dont le résultat n'est garanti chez personne.
 */
interface Inscription {
  readonly editeur: string | null;
  readonly lecteur: Lecteur;
}

const REGISTRE = new Map<TypeDiag, Inscription[]>();

/**
 * Inscrire un lecteur pour un volet chez un éditeur.
 *
 * `editeur: null` inscrit le repli. Il ne peut y en avoir qu'un par volet :
 * deux replis, c'est déjà un lecteur unique rafistolé.
 */
export function inscrireLecteur(type: TypeDiag, editeur: string | null, lecteur: Lecteur): void {
  const liste = REGISTRE.get(type) ?? [];
  if (editeur === null && liste.some((i) => i.editeur === null)) {
    throw new Error(`Deux lecteurs de repli pour « ${type} » : il n'en faut qu'un.`);
  }
  if (editeur !== null && liste.some((i) => i.editeur === editeur)) {
    throw new Error(`Deux lecteurs « ${editeur} » pour « ${type} ».`);
  }
  liste.push({ editeur, lecteur });
  REGISTRE.set(type, liste);
}

/** Ce que l'aiguillage rend — et il dit toujours sur quoi il s'est appuyé. */
export interface Choix {
  readonly lecteur: Lecteur;
  /** L'éditeur dont on applique la carte. `null` : aucun, c'est le repli. */
  readonly editeur: string | null;
  /**
   * VRAI quand aucun lecteur n'a été écrit pour cet éditeur.
   *
   * ⚠️ Le repli ne doit JAMAIS être silencieux. Ce qu'un lecteur générique rend
   * sur un éditeur qu'il ne connaît pas n'est pas une lecture : c'est une
   * supposition, et elle doit remonter jusqu'à l'écran. 14 documents du corpus
   * amiante n'ont même aucun texte extractible — et un volet sans texte se lit
   * exactement comme un volet sans amiante.
   */
  readonly repli: boolean;
}

/**
 * Choisir le lecteur d'un volet, d'après l'éditeur qui a produit le rapport.
 *
 * ⚠️ On choisit sur une signature POSITIVE de l'éditeur, jamais sur l'absence
 * d'un signe : l'absence d'un marqueur peut vouloir dire « pas de défaut » ou
 * « pas le bon éditeur », et les deux se ressemblent exactement dans le texte
 * extrait.
 */
export function choisirLecteur(type: TypeDiag, generateur: Generateur): Choix | null {
  const liste = REGISTRE.get(type);
  if (!liste || liste.length === 0) return null;

  const nom = generateur.editeur;
  if (nom) {
    const propre = liste.find((i) => i.editeur === nom);
    if (propre) return { lecteur: propre.lecteur, editeur: nom, repli: false };
  }

  const repli = liste.find((i) => i.editeur === null);
  if (!repli) return null;
  return { lecteur: repli.lecteur, editeur: null, repli: true };
}

/** Les éditeurs pour lesquels un lecteur a été écrit — hors repli. */
export function editeursCouverts(type: TypeDiag): string[] {
  return (REGISTRE.get(type) ?? [])
    .map((i) => i.editeur)
    .filter((e): e is string => e !== null);
}

/** Remet le registre à zéro. Réservé aux tests. */
export function viderRegistre(): void {
  REGISTRE.clear();
}
