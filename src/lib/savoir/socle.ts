/**
 * Le socle du langage : les types, les questions canoniques, les registres.
 *
 * Ce fichier ne contient aucune notion — seulement la grammaire qu'elles
 * partagent. Les notions vivent par diagnostic (`notions-dpe.ts`,
 * `notions-generales.ts`…) et sont assemblées dans `notions.ts` : chaque
 * diagnostic a ses schémas, tous parlent le même langage (§ 17).
 */
import type { Diagnostic } from '../modele';

/**
 * Les quatre registres, jamais confondus (§ 15). Ils ne se distinguent pas par
 * le ton mais par le statut : ce qui est écrit dans le document ne se présente
 * pas comme une hypothèse, et une piste n'est pas une conclusion.
 */
export type Registre = 'fait' | 'explication' | 'hypothese' | 'piste';

/** Les huit profondeurs (§ 4). Le niveau 0, c'est le dessin lui-même. */
export type Rang = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** La question canonique de chaque rang. Toujours la même formulation. */
export const QUESTIONS: Record<Rang, string> = {
  1: 'C’est quoi ?',
  2: 'À quoi ça sert ?',
  3: 'Pourquoi c’est important ?',
  4: 'Quels sont les risques ?',
  5: 'D’où ça peut venir ?',
  6: 'Que peut-on faire ?',
  7: 'Comment le diagnostic l’évalue ?',
  8: 'Et chez moi ?'
};

/** Le registre qui va de soi pour un rang, sauf mention contraire. */
const REGISTRE_PAR_RANG: Record<Rang, Registre> = {
  1: 'explication',
  2: 'explication',
  3: 'explication',
  4: 'explication',
  5: 'hypothese',
  6: 'piste',
  7: 'explication',
  8: 'fait'
};

export function registreDe(niveau: Niveau): Registre {
  return niveau.registre ?? REGISTRE_PAR_RANG[niveau.rang];
}

/**
 * Un fragment d'explication. Les mots qu'il contient peuvent ouvrir d'autres
 * notions : c'est le « chaque réponse est une nouvelle porte » du § 6.
 */
export interface Bribe {
  texte: string;
  /** Identifiants de notions atteignables depuis cette bribe. */
  clips?: string[];
}

export interface Niveau {
  rang: Rang;
  /** Par défaut, la question canonique du rang. */
  question?: string;
  /** Par défaut, le registre du rang. */
  registre?: Registre;
  bribes: Bribe[];
}

/**
 * Ce que le rapport déposé dit d'une notion. Trois issues seulement, et jamais
 * d'invention (§ 10) : le document en parle, le document est là mais muet, ou
 * le dossier ne contient pas ce diagnostic du tout.
 */
export type ChezMoi =
  | { etat: 'dit'; phrase: string }
  | { etat: 'muet'; phrase: string }
  | { etat: 'absent' };

export interface Notion {
  id: string;
  /** Le vrai mot, tel qu'il s'écrit dans les rapports. */
  terme: string;
  /** La définition en une phrase, celle qui suit immédiatement le terme. */
  definition: string;
  /** Le dessin de la notion — un identifiant de MiniSchema. */
  schema?: string;
  niveaux: Niveau[];
  /** Le niveau 8, calculé sur le dossier réellement déposé. */
  chezMoi?: (diagnostics: Diagnostic[]) => ChezMoi;
}

/** Retrouve un diagnostic par son type, sans supposer qu'il existe. */
export const trouve = (
  diagnostics: Diagnostic[],
  type: Diagnostic['type']
): Diagnostic | undefined => diagnostics.find((d) => d.type === type);
