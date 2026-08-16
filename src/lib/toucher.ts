/**
 * Le retour physique du toucher.
 *
 * Une icône qu'on touche doit répondre. Le halo répond à l'œil, cette
 * secousse répond au doigt — et sur un téléphone, c'est elle qui fait la
 * différence entre une page web et une application.
 *
 * ── Ce qu'il faut savoir avant de compter dessus ────────────────────────────
 *
 * `navigator.vibrate` n'existe PAS sur iPhone. Ni dans Safari, ni dans Chrome
 * iOS, ni dans aucun navigateur iOS — Apple ne l'expose à personne, et aucun
 * contournement fiable n'existe depuis une page web. La secousse ne se sentira
 * donc que sur Android.
 *
 * C'est gênant, parce que le produit est pensé comme une application iPhone.
 * Mais un appel qui ne fait rien ne casse rien : la fonction se contente de
 * ne pas exister là-bas, et le halo, lui, marche partout. Mieux vaut la moitié
 * du geste sur la moitié des appareils que rien du tout.
 *
 * ── Les durées ──────────────────────────────────────────────────────────────
 *
 * Elles sont courtes au point d'être à peine identifiables — c'est le but. Une
 * vibration qu'on remarque est une vibration trop longue : elle passe de retour
 * tactile à notification, et devient agaçante au bout de trois écrans.
 */

/** Un contact : on a touché quelque chose et il a répondu. */
const CONTACT = 8;

/** Une ouverture : l'écran change, la secousse est un peu plus franche. */
const OUVERTURE = 14;

/**
 * Vrai si la personne a demandé qu'on lui épargne les animations.
 *
 * Le réglage vise le mouvement à l'écran, et la question de savoir s'il couvre
 * le retour haptique se discute. On tranche pour l'abstention : qui règle son
 * système pour être moins sollicité n'a pas envie qu'on lui secoue l'appareil,
 * et ce geste-ci n'est jamais porteur d'information — rien n'est perdu à s'en
 * passer.
 */
function moinsDeMouvement(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function secouer(duree: number): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  if (moinsDeMouvement()) return;
  try {
    navigator.vibrate(duree);
  } catch {
    /*
     * Certains navigateurs refusent l'appel selon le contexte — page en
     * arrière-plan, réglage du système, économie d'énergie. Ce n'est pas une
     * erreur du produit, et surtout : rien de ce que fait l'utilisateur ne doit
     * échouer parce que son téléphone n'a pas voulu vibrer.
     */
  }
}

/** On a touché quelque chose qui répond : bouton, onglet, entrée de lexique. */
export function auToucher(): void {
  secouer(CONTACT);
}

/** On entre dans une application, ou on en sort. */
export function aLOuverture(): void {
  secouer(OUVERTURE);
}
