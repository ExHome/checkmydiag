/**
 * D'où vient ce qu'on affiche, et à quel point on en est sûr.
 *
 * Règle du projet, reprise du brief : *une déduction du moteur ne doit jamais
 * être présentée comme un constat du diagnostiqueur*. Encore faut-il que le
 * moteur sache lui-même faire la différence — c'est ce que ce fichier calcule.
 *
 * Quatre origines, et elles ne se valent pas :
 *
 *  - `rapport`   la conclusion a été lue dans le rapport détaillé. C'est le cas
 *                nominal, et le seul qui autorise à écrire « le rapport dit ».
 *  - `synthese`  elle vient de la page de garde du dossier. C'est une vraie
 *                phrase du diagnostiqueur, mais résumée : elle peut omettre une
 *                réserve écrite trois pages plus loin.
 *  - `calcul`    personne ne l'a écrite, on l'a reconstituée. L'étiquette A→G
 *                est dans ce cas : elle est dessinée dans le PDF, donc illisible,
 *                et recalculée depuis la consommation et les émissions.
 *  - `illisible` rien n'a pu être conclu. La case est cochée à la main, ou la
 *                page est une image. On le dit, on ne devine pas.
 *
 * L'indice numérique n'est qu'une commodité pour les statistiques (« part des
 * extractions à faible confiance ») : à l'écran, c'est l'origine qui compte,
 * parce qu'elle se dit en français.
 */
import type { Diagnostic } from '../modele';

export type Origine = 'rapport' | 'synthese' | 'calcul' | 'illisible';

/** Indice par origine. Sert à agréger, jamais à afficher tel quel. */
const INDICE: Record<Origine, number> = {
  rapport: 1,
  synthese: 0.7,
  calcul: 0.6,
  illisible: 0
};

/** Ce que l'on peut honnêtement écrire au-dessus du verdict. */
const ETIQUETTE: Record<Origine, string> = {
  rapport: 'Le rapport dit',
  synthese: 'Écrit sur la page de synthèse du dossier',
  calcul: 'Recalculé : la valeur n’est pas lisible dans le PDF',
  illisible: 'Non lisible automatiquement'
};

export function etiquetteDe(origine: Origine): string {
  return ETIQUETTE[origine];
}

export function indiceDe(origine: Origine): number {
  return INDICE[origine];
}

/**
 * L'origine d'un diagnostic déjà extrait.
 *
 * L'ordre des tests n'est pas indifférent. « Illisible » l'emporte sur tout :
 * un diagnostic sans verdict reste sans verdict, même si sa classe a été
 * recalculée par ailleurs. Vient ensuite la provenance — synthèse avant
 * rapport, car `source` n'est renseigné que dans ce cas.
 */
export function origineDe(diag: Diagnostic): Origine {
  if (diag.gravite === 'neutre') return 'illisible';
  if (diag.source === 'synthese') return 'synthese';

  // Le DPE mérite un traitement à part : sa lettre est presque toujours
  // reconstituée, et l'annoncer comme lue serait un abus.
  if (diag.schema?.genre === 'dpe') {
    const recalculee = diag.schema.energie?.recalculee || diag.schema.climat?.recalculee;
    if (recalculee) return 'calcul';
  }

  return 'rapport';
}

/**
 * Confiance d'ensemble d'un dossier : la moyenne des indices.
 *
 * Un dossier vide vaut 0, pas 1 — l'absence de diagnostic n'est pas une
 * lecture parfaite.
 */
export function confianceDuDossier(diagnostics: Diagnostic[]): number {
  if (diagnostics.length === 0) return 0;
  const total = diagnostics.reduce((n, d) => n + INDICE[origineDe(d)], 0);
  return Math.round((total / diagnostics.length) * 100) / 100;
}
