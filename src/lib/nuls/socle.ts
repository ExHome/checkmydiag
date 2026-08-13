/**
 * « En clair » — la grammaire de la rubrique.
 *
 * Ce fichier ne contient aucune question : seulement les formes qu'elles
 * partagent. Les questions vivent par thématique (`themes/*.ts`) et sont
 * assemblées dans `index.ts`.
 *
 * Deux contraintes viennent d'ailleurs et ne se négocient pas ici :
 *
 * 1. **Aucun chiffre inventé** (ORDRE-DE-MISSION.md). Une règle datée porte sa
 *    source et sa date de vérification ; quand un point dépend du cas, on
 *    l'écrit plutôt que de trancher.
 * 2. **On ne remplace pas un terme du métier par une paraphrase**
 *    (ORDRE-DE-MISSION-SCHEMAS.md § 9). *Saturnisme* reste saturnisme : on le
 *    pose, on le définit, on le montre.
 *
 * Une troisième lui est propre : ces pages sont lues par des gens qui ne
 * connaissent pas le site, arrivés par un moteur de recherche. Elles doivent
 * donc se suffire — la réponse d'abord, le contexte ensuite, et toujours une
 * porte vers le rapport que le lecteur a sous la main.
 */

/**
 * Une référence vérifiable. Elle sert au lecteur autant qu'au référencement.
 *
 * Le lien est facultatif, et c'est voulu : un texte nommé précisément — « arrêté
 * du 31 mars 2021 », « article L. 271-4 du code de la construction et de
 * l'habitation » — se vérifie toujours, alors qu'une adresse devinée envoie sur
 * une page morte. On ne met une URL que lorsqu'on en est sûr.
 */
export interface Source {
  titre: string;
  url?: string;
}

/** Un tableau court — validités, seuils, listes. Jamais plus de quatre colonnes. */
export interface Tableau {
  colonnes: string[];
  lignes: string[][];
  /** Ce que le tableau ne dit pas : les exceptions tiennent ici, pas en note. */
  reserve?: string;
}

export interface Question {
  /** Le slug : il devient l'adresse de la page, il ne change plus. */
  id: string;
  /** La question telle qu'on se la pose, à voix haute. */
  question: string;
  /**
   * Les autres façons de la poser. Elles nourrissent la recherche interne et
   * les liens « on demande aussi » — jamais du remplissage de mots-clés.
   */
  variantes?: string[];
  /**
   * La réponse en dix secondes : une à trois phrases, autonomes. C'est ce que
   * lit quelqu'un qui ne lira rien d'autre, et c'est la description de la page.
   */
  court: string;
  /** Le développement, une idée par puce. */
  points?: string[];
  /** L'identifiant d'un dessin de `dessins.ts`. */
  dessin?: string;
  tableau?: Tableau;
  /** Ce qui trompe tout le monde sur cette question. Le plus utile de la page. */
  piege?: string;
  /**
   * Ce que le lecteur peut vérifier sur son propre rapport. C'est la sortie
   * « et chez moi ? » du langage des schémas, appliquée à une page publique.
   */
  chezMoi?: string;
  /** Identifiants de questions liées, même d'un autre thème. */
  aussi?: string[];
  /** Notions du panneau de savoir de l'application qui prolongent la réponse. */
  savoir?: string[];
  sources?: Source[];
  /**
   * Date de dernière vérification du contenu réglementaire (AAAA-MM-JJ).
   * Affichée en bas de page : une règle sans date est une règle qu'on ne peut
   * pas croire.
   */
  verifie?: string;
}

export interface Theme {
  /** Le slug du thème : le dossier de ses pages. */
  id: string;
  /** Le nom court, celui des menus et du fil d'Ariane. */
  titre: string;
  /** Le titre de la page du thème, formulé pour quelqu'un qui cherche. */
  h1: string;
  /** Le chapeau du thème : à qui il s'adresse et ce qu'il règle. */
  resume: string;
  /** Une ligne de contexte, sous le chapeau. */
  dessin?: string;
  questions: Question[];
}

/**
 * Le texte échappé pour du HTML. Les pages sont écrites à la main, sans moteur
 * de gabarit : c'est ici que l'apostrophe et l'esperluette cessent d'être un
 * risque.
 */
export const html = (texte: string): string =>
  texte
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
