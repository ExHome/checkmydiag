<script lang="ts">
  /**
   * Les termites, façon planche de manuel : on les voit, on suit leur chemin,
   * et chaque étape s'explique quand on la touche.
   *
   * Trois idées seulement — d'où ils viennent, par où ils passent, ce qu'ils
   * font au bois — parce qu'un schéma qui dit tout ne dit rien.
   */
  import ClipDessin from '../savoir/ClipDessin.svelte';

  interface Etape {
    /** La notion qui s'ouvre au clic — le clip a remplacé la pastille. */
    id: string;
    /** Ancre du point, et côté où s'écrit le terme. */
    point: [number, number];
    cote: 'gauche' | 'droite';
    /** L'élément du dessin d'où part le filet. */
    depuis: [number, number];
  }

  /** D'où ils viennent, par où ils passent, ce qu'ils font au bois. */
  const ETAPES: Etape[] = [
    { id: 'termite', point: [251, 390], cote: 'droite', depuis: [251, 350] },
    { id: 'cordonnet', point: [104, 214], cote: 'gauche', depuis: [214, 200] },
    { id: 'bois-attaque', point: [404, 66], cote: 'gauche', depuis: [350, 108] }
  ];

  /** Positions des termites dessinés dans le nid. */
  const NID = [
    { x: 210, y: 330, r: -12 },
    { x: 246, y: 342, r: 8 },
    { x: 282, y: 328, r: -4 },
    { x: 228, y: 356, r: 16 },
    { x: 268, y: 358, r: -18 }
  ];
</script>

<figure>
  <p class="invite muet petit">Touchez une étape du parcours.</p>

  <svg viewBox="0 0 500 410" role="group" aria-label="Coupe d’un sol et d’un mur : la colonie de termites dans la terre, le cordonnet qui remonte, et le bois attaqué de l’intérieur.">
    <!-- La terre : le même aplat que sur les autres coupes de la charte. Les
         dégradés et l'ombre portée qui traînaient ici ont sauté — un seul
         dessin ne peut pas avoir sa propre palette. -->
    <rect x="0" y="296" width="500" height="114" class="terre" />
    <path d="M0 300 Q 60 292 120 300 T 250 300 T 380 300 T 500 300" class="ligne-sol" />

    <!-- Le mur en coupe et le plancher -->
    <g>
      <rect x="196" y="60" width="40" height="240" class="mur" />
      <rect x="236" y="96" width="230" height="26" rx="3" class="bois" />
      <rect x="236" y="130" width="230" height="12" class="plancher" />
    </g>

    <!-- Le bois attaqué : galeries à l'intérieur, surface intacte -->
    <g class="galeries">
      <path d="M262 110 q 14 -8 28 0 t 28 0 t 28 0" />
      <path d="M280 116 q 16 6 32 -2 t 30 2" />
      <path d="M330 106 q 18 8 36 2" />
    </g>

    <!-- Le cordonnet le long du mur -->
    <path d="M216 300 C 216 260 210 230 214 196 C 217 168 214 140 216 122" class="cordonnet" />

    <!-- Le nid -->
    {#each NID as t (t.x)}
      <g class="termite" transform="translate({t.x} {t.y}) rotate({t.r})">
        <ellipse cx="0" cy="0" rx="9" ry="4.2" class="corps" />
        <circle cx="-9.5" cy="0" r="3.4" class="tete" />
        <path d="M-12.5 -2.5 l-4 -3 M-12.5 2.5 l-4 3" class="antennes" />
        <path d="M-4 -4 l-2.5 -4 M0 -4.4 l0 -4.6 M4 -4 l2.5 -4 M-4 4 l-2.5 4 M0 4.4 l0 4.6 M4 4 l2.5 4"
              class="pattes" />
      </g>
    {/each}

    {#each ETAPES as etape (etape.id)}
      <ClipDessin id={etape.id} x={etape.point[0]} y={etape.point[1]} depuis={etape.depuis} cote={etape.cote} />
    {/each}
  </svg>

  <figcaption class="muet petit">
    Le diagnostiqueur cherche ces indices à l’œil nu, sans rien démonter. C’est pour ça que ce
    document ne vaut que six mois.
  </figcaption>
</figure>

<style>
  figure {
    margin: 0;
  }

  .invite {
    margin: 0 0 var(--e1);
  }

  svg {
    width: 100%;
    height: auto;
    max-width: 540px;
    display: block;
    margin-inline: auto;
  }

  /* La coupe reprend la palette de la maison : or pour la terre et le bois,
     encre pour le bâti. Plus de couleurs propres à ce dessin. */
  .terre {
    fill: var(--or-fonce);
    opacity: 0.14;
  }

  .ligne-sol {
    fill: none;
    stroke: var(--or-fonce);
    stroke-width: 2.5;
    opacity: 0.55;
  }

  .mur {
    fill: var(--surface-forte);
    stroke: currentColor;
    stroke-width: 1.4;
  }

  .bois {
    fill: rgb(214 230 106 / 36%);
    stroke: var(--or);
    stroke-width: 1.4;
  }

  .plancher {
    fill: currentColor;
    opacity: 0.14;
  }

  /* Les galeries : creusées dedans, invisibles dehors. D'où le trait interrompu. */
  .galeries path {
    fill: none;
    stroke: var(--or-fonce);
    stroke-width: 3;
    stroke-linecap: round;
    opacity: 0.8;
  }

  .cordonnet {
    fill: none;
    stroke: var(--or-fonce);
    stroke-width: 7;
    stroke-linecap: round;
    stroke-dasharray: 1 11;
  }

  /* Les termites gardent leur dessin, mais dans la palette : le détail servait
     à les reconnaître, pas à faire joli. */
  .termite .corps {
    fill: var(--or-pale);
  }

  .termite .tete {
    fill: var(--or-fonce);
  }

  .termite .antennes,
  .termite .pattes {
    stroke: var(--or-fonce);
    stroke-width: 1.2;
    stroke-linecap: round;
    fill: none;
  }

  figcaption {
    margin-top: var(--e3);
  }
</style>
