/**
 * SORTIR D'UN ÉCRAN : LE GESTE DU TÉLÉPHONE, PAS SEULEMENT LE BOUTON.
 *
 * Sur un téléphone, on ne sort pas d'un écran en visant un bouton : on balaie
 * depuis le bord, ou on appuie sur la flèche du navigateur. Les deux passent
 * par l'HISTORIQUE. Une application qui n'y empile rien laisse ces gestes
 * s'adresser au site tout entier : le balayage quitte Verrière au lieu de
 * refermer le diagnostic, et l'écran ouvert, lui, ne bouge pas.
 *
 * Mesuré avant correction : zéro appel à `pushState` dans toute l'application.
 * Onze écrans pouvaient s'ouvrir, aucun ne s'inscrivait dans l'historique.
 *
 * Ce module tient une pile. Ouvrir une couche empile une entrée ; le geste de
 * retour la dépile et referme l'écran du dessus. Le bouton « ← Retour » passe
 * par le même chemin, pour que l'historique ne se remplisse pas d'entrées
 * fantômes à mesure qu'on ouvre et referme des diagnostics.
 *
 * CE QUE CE MODULE NE FAIT PAS : il ne route rien. L'URL ne change pas, aucun
 * écran n'est adressable — ce serait un autre chantier, avec ses conséquences
 * sur le référencement et sur le partage de lien. Ici, on ne répare qu'une
 * chose : que le geste de retour referme l'écran.
 */

type Fermeture = () => void;

interface Couche {
  readonly id: number;
  readonly fermer: Fermeture;
}

let pile: Couche[] = [];
let compteur = 0;
let branche = false;

/*
 * Les retours qu'on a nous-mêmes provoqués.
 *
 * Fermer par le bouton appelle `history.back()` pour retirer l'entrée qu'on
 * avait empilée. Ce retour déclenche un `popstate` — qui, sans précaution,
 * dépilerait la couche du DESSOUS et fermerait deux écrans d'un coup. Le
 * compteur dit au gestionnaire : celui-là, il vient de nous, laisse-le passer.
 */
let aIgnorer = 0;

function auRetour(): void {
  if (aIgnorer > 0) {
    aIgnorer -= 1;
    return;
  }
  const dessus = pile.pop();
  if (dessus) dessus.fermer();
}

function brancher(): void {
  if (branche || typeof window === 'undefined') return;
  branche = true;
  window.addEventListener('popstate', auRetour);
}

/**
 * Déclare une couche ouverte, et rend la fonction qui la referme.
 *
 * La valeur rendue est à appeler par le bouton de sortie de l'écran : elle
 * retire l'entrée d'historique correspondante. Si l'utilisateur est sorti par
 * le geste ou par la flèche du navigateur, la couche a déjà quitté la pile et
 * l'appel ne fait rien — c'est voulu, un bouton cliqué deux fois ne doit pas
 * remonter deux crans.
 */
export function ouvrirCouche(fermer: Fermeture): () => void {
  if (typeof window === 'undefined' || typeof history === 'undefined') {
    return () => {};
  }
  brancher();
  compteur += 1;
  const id = compteur;
  pile.push({ id, fermer });
  history.pushState({ couche: id }, '');

  return () => {
    const rang = pile.findIndex((c) => c.id === id);
    if (rang === -1) return;
    /*
     * On referme depuis le haut de la pile. Si une couche du dessous se
     * fermait la première — un cas que l'application ne produit pas, mais que
     * rien n'interdit — on retirerait tout ce qui la surmonte, sans quoi la
     * pile et l'historique cesseraient de se correspondre.
     */
    const retires = pile.length - rang;
    pile = pile.slice(0, rang);
    aIgnorer += retires;
    history.go(-retires);
  };
}

/**
 * Remet le module à zéro. Réservé aux tests.
 *
 * Le débranchement compte autant que le vidage de la pile : `brancher()` ne
 * pose son écouteur qu'une fois, et cette garde survit à la fonction. Sans
 * remise à zéro du drapeau, un second contexte — deux cas de test, ou une
 * application remontée à chaud — croirait être branché sur un `popstate`
 * qu'il n'écoute plus. Le geste de retour resterait alors sans effet, et rien
 * ne le dirait.
 */
export function oublierLesCouches(): void {
  if (branche && typeof window !== 'undefined') {
    window.removeEventListener('popstate', auRetour);
  }
  pile = [];
  aIgnorer = 0;
  branche = false;
}

/** Le nombre de couches ouvertes. Réservé aux tests et au diagnostic. */
export function couchesOuvertes(): number {
  return pile.length;
}
