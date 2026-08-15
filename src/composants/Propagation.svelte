<script lang="ts">
  /**
   * La couleur de l'application envahit l'écran avant qu'elle ne s'ouvre.
   *
   * C'est la signature du produit, et l'ordre de mission la classe parmi les
   * éléments à reproduire impérativement : « au toucher d'une tuile, sa couleur
   * se propage en cercle depuis la position de la tuile et envahit l'écran
   * avant l'apparition du diagnostic ».
   *
   * Ce qu'elle apporte vraiment, au-delà du plaisir : elle relie l'icône à
   * l'écran. On sait d'où l'on vient, donc on sait où l'on retourne. Un écran
   * qui apparaît sans venir de nulle part laisse le lecteur chercher la sortie.
   *
   * Le cercle naît à la taille exacte de l'icône, à sa place exacte, puis
   * grandit jusqu'à couvrir l'écran en perdant ses coins et sa densité. Il ne
   * capte aucun geste — on peut toucher au travers pendant qu'il passe.
   */

  interface Props {
    /** Le carré de l'icône touchée, en coordonnées de fenêtre. */
    depuis: { x: number; y: number; largeur: number; hauteur: number };
    /** Le fond de l'icône : dégradé ou couleur pleine, tel quel. */
    couleur: string;
    /** Appelé quand l'écran est couvert — c'est le moment d'ouvrir. */
    surCouvert: () => void;
    /** Appelé à la toute fin, pour retirer le cercle du document. */
    surFini: () => void;
  }

  const { depuis, couleur, surCouvert, surFini }: Props = $props();

  /*
   * Qui a demandé moins d'animation n'en reçoit pas — et n'attend pas non plus.
   *
   * Le réglage du système ne supprime pas seulement le mouvement : il supprime
   * le délai qui allait avec. Laisser les 150 ms sans rien montrer donnerait
   * une application qui met un temps à réagir, sans qu'on sache pourquoi.
   */
  const sansMouvement =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $effect(() => {
    if (sansMouvement) {
      surCouvert();
      surFini();
      return;
    }

    /*
     * Deux rendez-vous, et non un seul.
     *
     * L'écran s'ouvre AVANT la fin de la propagation : à 150 ms le cercle a
     * déjà couvert la zone utile, et le diagnostic se met en place derrière
     * lui pendant qu'il finit de s'effacer. Attendre les 520 ms complètes
     * ferait un temps mort — on regarderait une couleur, puis un écran.
     */
    const ouverture = setTimeout(surCouvert, 150);
    const menage = setTimeout(surFini, 560);
    return () => {
      clearTimeout(ouverture);
      clearTimeout(menage);
    };
  });
</script>

{#if !sansMouvement}
  <div
    class="propagation"
    aria-hidden="true"
    style="
      left: {depuis.x}px;
      top: {depuis.y}px;
      width: {depuis.largeur}px;
      height: {depuis.largeur}px;
      background: {couleur};
    "
  ></div>
{/if}

<style>
  /*
   * Le facteur 3,4 vient de la maquette et il n'est pas arbitraire : un cercle
   * parti d'une icône de 76 px doit couvrir un écran de téléphone depuis
   * n'importe quel coin de la grille. En dessous, le coin opposé reste
   * découvert au moment où l'écran s'ouvre, et l'on voit le raccord.
   */
  .propagation {
    position: fixed;
    z-index: 800;
    border-radius: 50%;
    transform: scale(0);
    opacity: 0;
    pointer-events: none;
    animation: envahir 0.52s cubic-bezier(0.32, 0.72, 0, 1) forwards;
    will-change: transform, opacity;
  }

  @keyframes envahir {
    0% {
      transform: scale(0);
      opacity: 1;
      border-radius: 50%;
    }
    70% {
      opacity: 1;
    }
    100% {
      transform: scale(3.4);
      opacity: 0;
      border-radius: 0;
    }
  }
</style>
