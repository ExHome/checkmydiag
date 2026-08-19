/**
 * Les six étapes de lecture d'un diagnostic.
 *
 * Elles viennent de l'ordre de mission directeur, § 7 :
 *
 *   CE QU'IL FAUT SAVOIR → EST-CE IMPORTANT ? → OÙ ? → POURQUOI ? →
 *   QUE FAIRE ? → POUR ALLER PLUS LOIN
 *
 * « L'utilisateur doit comprendre en quelques secondes sans perdre la
 * profondeur technique disponible derrière. »
 *
 * ── Pourquoi ce fichier existe ─────────────────────────────────────────────
 *
 * L'ordre aurait pu rester écrit dans le balisage. Il y serait resté jusqu'à
 * ce qu'une intervention le dérange sans que personne s'en aperçoive — c'est
 * ainsi que le produit a déjà perdu le corail, le sable et sa hiérarchie
 * d'accueil. Le § 20 de l'ODM d'exécution demande l'inverse : que l'exigence
 * soit inscrite dans le système plutôt que dans la vigilance.
 *
 * Un test compare donc cette liste à ce que le composant affiche réellement.
 */
export interface Etape {
  cle: string;
  /** Le titre montré au lecteur, tel qu'il doit apparaître. */
  mot: string;
  /** Ce à quoi l'étape répond, pour qui reprend le composant. */
  role: string;
}

export const ETAPES: readonly Etape[] = [
  {
    cle: 'savoir',
    mot: 'Ce qu’il faut savoir',
    role: 'Les chiffres du rapport, avant toute explication. Le résultat avant le commentaire.'
  },
  {
    cle: 'importance',
    mot: 'Est-ce important ?',
    role: 'La question que tout le monde se pose en premier, et à laquelle rien ne répondait directement.'
  },
  {
    cle: 'ou',
    mot: 'Où ?',
    role: 'Chaque constat rattaché à sa pièce, sans qu’aucun ne disparaisse.'
  },
  {
    cle: 'pourquoi',
    mot: 'Pourquoi ?',
    role: 'D’abord ce que CE rapport-ci raconte, ensuite pourquoi ce diagnostic existe.'
  },
  {
    cle: 'faire',
    mot: 'Que faire ?',
    role: 'L’action possible, après la compréhension — jamais avant.'
  },
  {
    cle: 'loin',
    mot: 'Pour aller plus loin',
    role: 'La profondeur technique reste disponible, mais elle ne barre plus la route.'
  }
] as const;
