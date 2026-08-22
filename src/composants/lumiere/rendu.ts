/**
 * LE MODE DE RENDU — plein ou sobre.
 *
 * ── Pourquoi ce n'est pas qu'une media query ────────────────────────────────
 *
 * Il faut le dire franchement : CSS N'A AUCUNE REQUÊTE DE PUISSANCE. Ni
 * `prefers-reduced-motion`, ni `update`, ni `pointer` ne mesurent un GPU. Un
 * téléphone d'entrée de gamme et un téléphone haut de gamme répondent
 * exactement la même chose à toutes les media queries existantes.
 *
 * Prétendre le contraire — « on met un `@media (max-width: 400px)` et c'est
 * réglé » — c'est confondre la taille de l'écran avec la puissance derrière.
 * Beaucoup de téléphones lents ont de grands écrans, et l'inverse aussi.
 *
 * Le mode sobre a donc TROIS déclencheurs, du plus fiable au moins fiable :
 *
 *   1. le choix de la personne, s'il existe (localStorage) — il prime sur tout ;
 *   2. une sonde matérielle, une fois au démarrage ;
 *   3. des replis purement CSS, qui restent valables même si ce fichier n'est
 *      jamais chargé — `prefers-reduced-motion`, `@supports not
 *      (backdrop-filter)`, `@media (update: slow)`.
 *
 * Le repli 3 est le filet : le mécanisme dégradé fonctionne SANS JavaScript.
 * Ce fichier ne fait que l'activer plus souvent, jamais l'autoriser.
 */

export type ModeRendu = 'plein' | 'sobre';

const CLE = 'verriere.rendu';

interface NavigateurElargi extends Navigator {
  /** Non standard, absent de Safari et de Firefox — d'où le `?`. */
  deviceMemory?: number;
}

/**
 * La sonde. Volontairement grossière : elle se trompe dans le sens sûr.
 *
 * Quatre cœurs ou moins, ou quatre gigaoctets ou moins : sobre. Un téléphone
 * correct qui passe en sobre perd un grain et un flou ; un téléphone lent qui
 * reste en plein perd trente images par seconde. L'asymétrie du coût dicte le
 * sens de l'erreur.
 */
export function sonder(nav: NavigateurElargi): ModeRendu {
  const coeurs = nav.hardwareConcurrency ?? 8;
  const memoire = nav.deviceMemory ?? 8;
  return coeurs <= 4 || memoire <= 4 ? 'sobre' : 'plein';
}

/** Le mode retenu : le choix explicite d'abord, la sonde ensuite. */
export function modeRetenu(nav: NavigateurElargi, choix: string | null): ModeRendu {
  if (choix === 'plein' || choix === 'sobre') return choix;
  return sonder(nav);
}

/**
 * Pose `data-rendu` sur `<html>`. À appeler une fois, au démarrage.
 *
 * Un attribut et non une classe : `[data-rendu='sobre']` se lit dans la
 * feuille de style à côté des `@media`, et on voit d'un coup d'œil tout ce qui
 * dépend du mode.
 */
export function installerLeRendu(): ModeRendu {
  if (typeof document === 'undefined') return 'plein';
  let choix: string | null = null;
  try {
    choix = localStorage.getItem(CLE);
  } catch {
    /* Navigation privée, stockage refusé : la sonde suffit. */
  }
  const mode = modeRetenu(navigator, choix);
  document.documentElement.dataset['rendu'] = mode;
  return mode;
}

/** Le choix explicite, quand la personne le fait dans les réglages. */
export function choisirLeRendu(mode: ModeRendu): void {
  try {
    localStorage.setItem(CLE, mode);
  } catch {
    /* Sans mémoire, le choix vaut pour la session : mieux que rien. */
  }
  if (typeof document !== 'undefined') document.documentElement.dataset['rendu'] = mode;
}
