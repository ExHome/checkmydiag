/**
 * PARLER À CLAUDE DEPUIS LA ZONE DE TRAVAIL — par le pont local, ou pas du tout.
 *
 * Ce module ne connaît aucune clé et n'appelle aucun service en ligne. Il ne
 * sait faire qu'une chose : parler à `scripts/pont-claude.mjs`, qui tourne sur
 * le poste d'Aude. Si le pont n'est pas lancé, Claude est simplement absent de
 * l'écran — l'atelier continue de fonctionner sans lui.
 *
 * C'est ce qui permet de mettre Claude dans la zone de travail sans rien
 * changer à l'application du visiteur : le code embarqué ici est inerte pour
 * quiconque n'a pas le pont, c'est-à-dire pour tout le monde sauf Aude.
 */

const PONT = 'http://127.0.0.1:8787';

/** Le pont répond-il ? Sert à afficher Claude, ou à expliquer comment le lancer. */
export async function pontPresent(): Promise<boolean> {
  try {
    const reponse = await fetch(`${PONT}/present`, { signal: AbortSignal.timeout(1500) });
    return reponse.ok;
  } catch {
    return false;
  }
}

/** Un message déjà échangé, dans la forme que l'API des messages attend. */
export interface TourApi {
  role: 'user' | 'assistant';
  content: string;
}

export interface Demande {
  /** Le cadre donné à Claude : qui il est ici, et ce qu'il ne doit pas faire. */
  systeme?: string;
  question: string;
  /** Le passage du rapport joint à la question — jamais le rapport entier. */
  extrait?: string;
  /**
   * L'échange déjà tenu sur ce rapport.
   *
   * L'API des messages est sans mémoire : c'est l'appelant qui porte le fil.
   * C'est ce qui distingue un lieu de travail d'un formulaire — on reprend la
   * conversation là où on l'avait laissée.
   */
  fil?: TourApi[];
}

export interface Reponse {
  texte: string;
  /** Vrai quand le modèle a décliné : ce n'est pas une panne, et on le dit. */
  refus?: boolean;
}

/**
 * Le cadre par défaut de Claude dans l'atelier.
 *
 * Il reprend les deux règles qui commandent tout le reste du produit : on
 * cherche un ENDROIT et non une information, et une rubrique absente donne
 * « non trouvé », jamais une supposition.
 */
export const CADRE = `Tu assistes une diagnostiqueuse immobilière dans son atelier de lecture.

Règles absolues :
— Un rapport de diagnostic est un FORMULAIRE, pas un texte. On ne cherche jamais
  une information : on cherche la RUBRIQUE qui la porte, puis on lit dedans.
— Trois issues seulement : trouvé · la rubrique dit « Néant » (c'est une réponse)
  · la rubrique est absente (on ne cite rien).
— Tu ne calcules jamais un DPE et tu n'inventes aucun chiffre. Un chiffre que tu
  cites doit être recopié du passage fourni.
— Beaucoup de formes ne valent que pour un éditeur. Si tu énonces une règle de
  structure, dis chez quel éditeur tu l'as vue.
— Tu n'as pas à juger le diagnostiqueur : ni son assurance, ni sa certification.`;

/** Pose une question à Claude. Échoue franchement si le pont n'est pas là. */
export async function demander(demande: Demande): Promise<Reponse> {
  const reponse = await fetch(`${PONT}/demander`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systeme: CADRE, ...demande })
  });

  if (!reponse.ok) {
    const detail = await reponse.text();
    throw new Error(detail.slice(0, 300));
  }
  return (await reponse.json()) as Reponse;
}

/** Ce qui partira du poste, en clair, pour qu'Aude le voie avant d'envoyer. */
export function poidsDeLEnvoi(demande: Demande): number {
  const fil = (demande.fil ?? []).reduce((somme, tour) => somme + tour.content.length, 0);
  return CADRE.length + demande.question.length + (demande.extrait ?? '').length + fil;
}
