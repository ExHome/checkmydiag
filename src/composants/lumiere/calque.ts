/**
 * LE CALQUE POSÉ SUR LA TABLE LUMINEUSE.
 *
 * Le contrat est physique, et il est court : ce qui est dessiné ARRÊTE la
 * lumière. Il n'y a pas de « couleur de trait » — un trait est une zone où la
 * lumière ne passe plus. Le dessin n'est donc jamais peint : il n'existe qu'en
 * creux, dans le masque.
 *
 * C'est ce qui rend l'objet incopiable sans copier le nom : partout ailleurs on
 * éclaire par devant et le dessin est de l'encre posée sur un fond. Ici le fond
 * est la lumière, et l'encre est son absence.
 */

/**
 * TROIS ÉTATS DE LUMIÈRE, ET PAS UN DE PLUS.
 *
 * C'est ici que la fidélité devient une mécanique et non une intention. Le
 * rapport connaît trois situations, et il n'existe aucun moyen d'en afficher
 * une quatrième :
 *
 *   la lumière passe          le rapport a regardé et n'a rien relevé
 *   la lumière ne passe pas   le rapport relève une anomalie ici
 *   la lumière passe par      le rapport n'a PAS pu regarder ici
 *   raies
 *
 * Une zone non contrôlée ne peut pas être représentée comme une zone saine :
 * elle n'a physiquement pas le même comportement de lumière. Ce n'est pas une
 * couleur qu'on pourrait oublier de mettre, c'est le masque lui-même.
 *
 * Et la distinction ne repose sur aucune couleur — c'est une TEXTURE. Elle
 * survit au daltonisme, au noir et blanc, à l'impression.
 */
export type GenreOcclusion = 'anomalie' | 'nonControle';

export interface Occlusion {
  /** Le tracé, dans le repère 0 0 100 H du plateau. */
  d: string;
  genre: GenreOcclusion;
  /**
   * Ce que le rapport écrit, mot pour mot.
   *
   * Obligatoire, et c'est voulu : une occlusion sans libellé serait une tache
   * sombre dont personne ne peut dire d'où elle sort. La question « quelle
   * donnée du rapport permet d'affirmer cela ? » a sa réponse dans le type.
   */
  libelle: string;
}

/** Les mots de la légende, par genre. Jamais reformulés à l'affichage. */
export const LEGENDE: Record<GenreOcclusion, string> = {
  anomalie: 'La lumière ne passe pas : le rapport relève quelque chose ici.',
  nonControle: 'La lumière passe par raies : cette zone n’a pas pu être contrôlée.'
};

/**
 * La polarité du calque.
 *
 * `encre` — ce qui est dessiné arrête la lumière. C'est le cas d'un plan : les
 * murs sont opaques, les pièces s'éclairent. Défaut.
 *
 * `trait` — seul ce qui est dessiné laisse passer la lumière. C'est le cas
 * d'une cote de mesurage ou d'un circuit : un trait très fin qui s'allume dans
 * le noir. Le masque est simplement inversé, rien d'autre ne change.
 */
export type Polarite = 'encre' | 'trait';

/**
 * La part de lumière qui traverse une hachure de zone non contrôlée.
 *
 * 1,5 px clairs sur 4 px de pas → 37,5 % de la surface. Assez pour qu'on voie
 * qu'il y a quelque chose derrière, trop peu pour que ça ressemble à une zone
 * éclairée. La valeur est ici, en un seul endroit, parce qu'elle porte un sens
 * — « on n'a pas pu regarder » — et pas un réglage esthétique.
 */
export const PAS_HACHURE = 4;
export const LARGEUR_HACHURE = 1.5;
