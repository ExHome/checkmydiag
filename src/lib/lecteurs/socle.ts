/**
 * UN LECTEUR PAR ÉDITEUR — l'architecture, valable pour toute l'application.
 *
 * *Contrainte absolue, permanente et générale, posée le 21/08/2026 : on ne
 * parse pas de la même façon d'un éditeur à l'autre. Il n'y a donc pas un
 * lecteur unique rafistolé de cas particuliers, mais un lecteur par format,
 * choisi sur signature — et l'éditeur se nomme AVANT de lire.*
 *
 * ## Le fait qui commande cette architecture
 *
 * Mesuré sur 111 volets plomb pris dans tout le corpus : **aucun ne nomme son
 * éditeur sur ses propres pages**. Ni rubrique « logiciel validé » — elle ne
 * concerne que le DPE —, ni pied de page de réseau. 111 sur 111 « inconnu ».
 *
 * Nommer l'éditeur ne peut donc pas se faire en lisant une déclaration : il
 * faut le reconnaître à sa **forme**. Un en-tête de colonnes, un ordre de
 * rubriques, une mise en page : voilà ce qui distingue un outil d'un autre, et
 * voilà ce qu'une signature mesure.
 *
 * ## La règle qui va avec
 *
 * Quand aucune signature ne reconnaît le document, l'aiguilleur rend
 * `format inconnu` — il ne choisit pas « le lecteur le plus probable », il ne
 * dégrade pas vers un lecteur générique. **Un format non reconnu se déclare, il
 * ne se rafistole pas.** C'est la seule façon de ne pas faire passer l'habitude
 * d'un logiciel pour une règle du métier.
 */

/**
 * Ce qu'une signature rend quand elle reconnaît un format : la preuve, c'est-à-
 * dire l'endroit exact qui a permis de nommer l'éditeur. Sans preuve citable,
 * la reconnaissance n'est pas traçable.
 */
export interface Preuve {
  /** L'extrait qui a fait la reconnaissance — un intitulé, jamais une donnée. */
  preuve: string;
}

/**
 * Un lecteur : il sait reconnaître SON format, et lire ce format-là.
 *
 * `T` est ce que le lecteur produit — des unités de diagnostic pour un CREP,
 * autre chose ailleurs. L'architecture ne présume de rien.
 */
export interface Lecteur<T> {
  /** Le nom de l'éditeur, tel qu'il est employé partout ailleurs. */
  editeur: string;
  /** Ce que ce lecteur lit — « CREP », « DPE »… pour les messages et la mesure. */
  quoi: string;
  /**
   * Reconnaît le format à sa forme. Rend la preuve, ou `null`.
   *
   * ⚠️ Une signature se mesure sur le corpus avant d'être écrite ici. Une
   * signature devinée fait pire que pas de signature : elle attribue.
   */
  reconnait(lignes: readonly string[]): Preuve | null;
  lire(lignes: readonly string[]): T;
}

/** Le résultat d'un aiguillage : lu par un lecteur nommé, ou pas lu du tout. */
export type Aiguillage<T> =
  | { etat: 'lu'; editeur: string; preuve: string; valeur: T }
  | { etat: 'format inconnu'; quoi: string; essayes: string[] };

/**
 * Choisit le lecteur qui reconnaît ce document, et lit avec lui.
 *
 * L'ordre des lecteurs ne doit pas décider du résultat : si deux signatures
 * reconnaissent le même document, c'est que l'une des deux est trop large, et
 * ça se corrige dans la signature — pas en jouant sur l'ordre de la liste.
 */
export function aiguiller<T>(lecteurs: readonly Lecteur<T>[], lignes: readonly string[]): Aiguillage<T> {
  for (const lecteur of lecteurs) {
    const preuve = lecteur.reconnait(lignes);
    if (!preuve) continue;
    return {
      etat: 'lu',
      editeur: lecteur.editeur,
      preuve: preuve.preuve,
      valeur: lecteur.lire(lignes)
    };
  }
  return {
    etat: 'format inconnu',
    quoi: lecteurs[0]?.quoi ?? 'document',
    essayes: lecteurs.map((l) => l.editeur)
  };
}

/**
 * Combien de signatures reconnaissent ce document.
 *
 * Sert à la mesure de corpus : deux signatures qui répondent sur le même
 * document est un défaut à corriger, pas une ambiguïté à arbitrer.
 */
export function signaturesQuiRepondent<T>(
  lecteurs: readonly Lecteur<T>[],
  lignes: readonly string[]
): string[] {
  return lecteurs.filter((l) => l.reconnait(lignes)).map((l) => l.editeur);
}
