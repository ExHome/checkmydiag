/**
 * LE SILENCE SUR CE QUI EST GRAVE.
 *
 * Tout le monde met du rouge et fait crier l'écran. Ici, quand le constat est
 * lourd, LA LUMIÈRE SE RETIRE : le sol s'assombrit, la source faiblit, les
 * durées s'allongent. Le terracotta cesse d'être une alarme pour devenir une
 * braise. Quelqu'un qui apprend que son logement est une passoire thermique
 * n'a pas besoin qu'on lui hurle dessus — il a besoin qu'on baisse la voix.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ET LE CALME NE MANGE JAMAIS LA LISIBILITÉ. TROIS BORNES, DÉMONTRÉES.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── B1 · LA LAMPE EST PLAFONNÉE LÀ OÙ ELLE PASSE SOUS DU TEXTE ─────────────
 *
 * Le danger n'est pas l'obscurité, c'est la CLARTÉ : l'encre du produit est
 * ivoire sur la scène, et une lampe trop forte remonte le sol vers elle.
 *
 *   sol           #0a2b23        L = 0,019136
 *   lampe midi    #faf6ee        L = 0,924086      ← le pire cas, le plus clair
 *   composite à α = 0,34 → #5c7068, L = 0,148 63
 *   ivoire #faf9f8 sur #5c7068  →  (0,9985) / (0,1986)  =  5,03  ≥ 4,5   ✓
 *
 * α = 0,36 donne 4,74 ; α = 0,38 donne 4,46 et casse. Le plafond est donc à
 * 0,34, avec 5,03 au pire. Toute autre température est PLUS SOMBRE que celle
 * de midi, donc strictement plus favorable — midi est bien le pire cas.
 *
 * Sous une bande de texte courant on descend à 0,12, ce qui laisse
 * l'ivoire à 10,23 et l'encre douce à 6,19.
 *
 * ── B2 · LE SOL S'ASSOMBRIT, ET C'EST TOUJOURS UN GAIN ─────────────────────
 *
 *   r = 0,00   #0a2b23   L = 0,019 14   ivoire → 14,44
 *   r = 0,35   #08231c   L = 0,013 38   ivoire → 15,76
 *   r = 0,72   #061b15   L = 0,008 77   ivoire → 16,99
 *   r = 1,00   #04150f   L = 0,005 97   ivoire → 17,84
 *
 * Le retrait ne peut pas dégrader le texte principal : il l'améliore de 14,44
 * à 17,84. La seule chose qu'il pourrait casser, c'est une encre SOMBRE — et
 * c'est précisément ce que la bande morte de `contraste.ts` interdit.
 *
 * ── B3 · L'ENCRE DOUCE REMONTE QUAND LA LUMIÈRE BAISSE ─────────────────────
 *
 * C'est le contraire du réflexe. Une interface qui « se calme » baisse tout,
 * texte secondaire compris, et le fait disparaître. Ici il COMPENSE :
 *
 *   α(r) = 0,72 + 0,18 · r,  borné à [0,72 ; 0,90]
 *
 *   r = 0,00   α = 0,72   #b7bfbc sur #0a2b23  →   8,09
 *   r = 0,72   α = 0,85   #d5d8d6 sur #061b15  →  12,44
 *   r = 1,00   α = 0,90   #e1e2e1 sur #04150f  →  14,44
 *
 * Le plancher 0,72 est la borne qui empêche le calme de manger la lisibilité :
 * même à retrait nul et sous une lampe à son plafond de texte, il tient 6,19.
 *
 * ── CE QUI N'EST JAMAIS MODULÉ ─────────────────────────────────────────────
 *
 * L'ENCRE PRINCIPALE. Elle vaut #faf9f8, point. Aucune variable de ce fichier
 * ne la touche. C'est la seule protection qui ne dépend d'aucun calcul : ce
 * qu'on ne branche pas ne peut pas se dérégler.
 */
import type { Gravite } from '../../lib/modele';
import { contraste, dansLaBandeMorte, melange } from './contraste';

/** Le sol de la scène, lumière pleine. Le vert profond de la charte. */
export const SOL_CLAIR = '#0a2b23';
/** Le sol de la scène, lumière entièrement retirée. */
export const SOL_GRAVE = '#04150f';
/** L'encre principale. Constante, en toutes circonstances. */
export const ENCRE = '#faf9f8';

/** Alpha maximal de la lampe partout où elle passe sous un élément graphique. */
export const PLAFOND_LAMPE = 0.34;
/** Alpha maximal de la lampe sous une bande de texte. */
export const PLAFOND_LAMPE_TEXTE = 0.12;
/** Alpha maximal du substrat d'un carreau allumé. Voir `Carreau.svelte`. */
export const PLAFOND_CARREAU = 0.42;
/** Plancher de l'encre douce. En dessous, le calme mange la lisibilité. */
export const PLANCHER_ENCRE_DOUCE = 0.72;

/**
 * De combien la lumière se retire, par gravité.
 *
 * `neutre` n'est pas zéro : une donnée sans jugement mérite un demi-ton de
 * moins qu'une bonne nouvelle, sinon tout se vaut. `alerte` s'arrête à 0,72 et
 * non à 1 — une pièce complètement éteinte n'est plus une pièce calme, c'est
 * une panne.
 */
export const RETRAIT: Record<Gravite, number> = {
  bon: 0,
  neutre: 0.15,
  attention: 0.35,
  alerte: 0.72
};

/** L'état complet de la scène pour une gravité donnée. */
export interface Retrait {
  /** La part de lumière retirée, 0 à 1. */
  retrait: number;
  /** Le sol de la scène. */
  sol: string;
  /** Le facteur appliqué à l'intensité de la source. */
  facteurLumiere: number;
  /** Alpha de la lampe sous les éléments graphiques, déjà plafonné. */
  lampe: number;
  /** Alpha de la lampe sous les bandes de texte, déjà plafonné. */
  lampeTexte: number;
  /** Alpha de l'encre douce — il MONTE quand la lumière baisse. */
  encreDouce: number;
  /** Durée de la transition, en ms. Le retrait est plus lent que l'allumage. */
  duree: number;
}

/**
 * Le retrait de lumière pour une gravité et une intensité de source.
 *
 * `intensite` vient de `lumiereDe()`. La gravité ne remplace pas l'heure : un
 * constat lourd à midi reste plus clair qu'un constat léger la nuit. Elle
 * retire une part de ce qu'il y avait, elle ne fixe pas une valeur absolue.
 */
export function retraitDe(gravite: Gravite, intensite: number): Retrait {
  const r = RETRAIT[gravite];
  /* 0,55 et pas 1 : la lumière se retire, elle ne s'éteint pas. À alerte
     pleine il reste 60 % de la source — assez pour que la scène existe. */
  const facteurLumiere = 1 - 0.55 * r;
  const source = Math.max(0, Math.min(1, intensite)) * facteurLumiere;
  return {
    retrait: r,
    sol: melange(SOL_CLAIR, SOL_GRAVE, r),
    facteurLumiere,
    lampe: Math.min(PLAFOND_LAMPE, source * PLAFOND_LAMPE),
    lampeTexte: Math.min(PLAFOND_LAMPE_TEXTE, source * PLAFOND_LAMPE_TEXTE),
    encreDouce: Math.max(PLANCHER_ENCRE_DOUCE, Math.min(0.9, PLANCHER_ENCRE_DOUCE + 0.18 * r)),
    /* Allumer est vif, s'éteindre est lent. Une lumière qui se retire vite est
       une coupure ; une lumière qui se retire lentement est une pudeur. */
    duree: Math.round(320 + 380 * r)
  };
}

/**
 * LE GARDE-FOU, à l'exécution et dans les tests.
 *
 * Rend la liste des couples qui ne tiennent pas. Vide = la scène est lisible.
 * Utilisé par `gravite.test.ts` sur les quatre gravités × les quatre moments,
 * soit seize scènes, et appelable en développement sur une scène réelle.
 */
export function defautsDe(etat: Retrait, teinteLampe: string): string[] {
  const defauts: string[] = [];
  const solGraphique = melange(etat.sol, teinteLampe, etat.lampe);
  const solTexte = melange(etat.sol, teinteLampe, etat.lampeTexte);

  const c1 = contraste(ENCRE, solGraphique);
  if (c1 < 4.5) defauts.push(`encre sur sol éclairé (graphique) : ${c1.toFixed(2)}`);

  const c2 = contraste(ENCRE, solTexte);
  if (c2 < 4.5) defauts.push(`encre sur sol éclairé (texte) : ${c2.toFixed(2)}`);

  const douce = melange(solTexte, ENCRE, etat.encreDouce);
  const c3 = contraste(douce, solTexte);
  if (c3 < 4.5) defauts.push(`encre douce sur sol éclairé : ${c3.toFixed(2)}`);

  if (dansLaBandeMorte(solGraphique)) defauts.push(`sol éclairé dans la bande morte : ${solGraphique}`);
  if (dansLaBandeMorte(solTexte)) defauts.push(`bande de texte dans la bande morte : ${solTexte}`);
  if (dansLaBandeMorte(etat.sol)) defauts.push(`sol nu dans la bande morte : ${etat.sol}`);

  return defauts;
}
