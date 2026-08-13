<script lang="ts">
  /**
   * L'assainissement non collectif, en suivant l'eau.
   *
   * Elle sort de la maison, se décante dans la fosse, puis s'infiltre dans le
   * sol où les bactéries la traitent. Trois temps, de gauche à droite : c'est
   * le sens de lecture, et c'est aussi le sens de l'eau.
   *
   * Le test sans mot (§ 8) : une flèche part du logement, une cuve montre trois
   * couches qui se séparent, des gouttes descendent dans la terre. Rien à lire
   * pour comprendre qu'on sépare d'abord, qu'on infiltre ensuite.
   */
  import ClipDessin from '../savoir/ClipDessin.svelte';
  import Clip from '../savoir/Clip.svelte';

  /** Les perforations du drain, régulières : c'est ce qui dit « ça s'infiltre ». */
  const GOUTTES = [318, 348, 378, 408, 438];
</script>

<figure>
  <p class="invite">Touchez une étape du parcours de l’eau.</p>

  <svg viewBox="0 0 500 280" role="group" aria-label="Coupe d’un terrain : l’eau usée sort de la maison, se décante dans la fosse toutes eaux, puis s’infiltre dans le sol par l’épandage.">
    <!-- La terre, en coupe. -->
    <rect x="0" y="120" width="500" height="160" class="terre" />
    <path d="M0 120 H500" class="sol" />
    {#each Array.from({ length: 26 }, (_, i) => 4 + i * 19) as x}
      <path d="M{x} 120 l-8 11" class="hachure" />
    {/each}

    <!-- La maison : le strict nécessaire, elle n'est pas le sujet. -->
    <path d="M20 62 L65 32 L110 62 Z" class="toit" />
    <rect x="30" y="62" width="70" height="58" class="facade" />
    <rect x="52" y="86" width="26" height="34" class="porte" />

    <!-- L'eau qui sort du logement. -->
    <path d="M100 100 H132 V150 H150" class="eau" />
    <path d="M144 145 l6 5 -6 5" class="pointe" />

    <!-- La fosse toutes eaux : trois couches, c'est tout ce qu'il faut voir. -->
    <g class="cuve">
      <rect x="150" y="140" width="110" height="66" rx="6" />
      <rect x="154" y="144" width="102" height="13" class="graisses" />
      <rect x="154" y="157" width="102" height="30" class="claire" />
      <rect x="154" y="187" width="102" height="15" class="boues" />
    </g>

    <!-- L'eau décantée repart vers le terrain. -->
    <path d="M260 168 H300" class="eau" />
    <path d="M294 163 l6 5 -6 5" class="pointe" />

    <!-- L'épandage : un drain percé, et l'eau qui descend dans la terre. -->
    <path d="M300 168 H470" class="drain" />
    {#each GOUTTES as x (x)}
      <path d="M{x} 174 v16" class="goutte" />
      <path d="M{x - 4} 185 l4 5 4 -5" class="pointe-goutte" />
    {/each}

    <ClipDessin id="fosse-toutes-eaux" x={205} y={238} depuis={[205, 206]} cote="gauche" />
    <ClipDessin id="epandage" x={385} y={238} depuis={[385, 192]} cote="droite" />
  </svg>

  <p class="regle">
    La fosse ne traite pas l’eau : elle la sépare. Le traitement, c’est le sol qui le fait — d’où
    l’importance du terrain, et de sa surface.
  </p>

  <figcaption class="creuser">
    <Clip id="assainissement-non-collectif" />
  </figcaption>
</figure>

<style>
  figure {
    margin: 0;
  }

  .invite {
    margin: 0 0 10px;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--or-fonce);
  }

  svg {
    width: 100%;
    height: auto;
    display: block;
  }

  /* La terre : un aplat très léger, pour qu'on lise « coupe » sans y penser. */
  .terre {
    fill: var(--or);
    opacity: 0.07;
  }

  .sol {
    stroke: currentColor;
    stroke-width: 1.2;
    opacity: 0.35;
  }

  .hachure {
    stroke: currentColor;
    stroke-width: 0.8;
    opacity: 0.2;
  }

  .toit {
    fill: rgb(192 144 72 / 22%);
    stroke: var(--or);
    stroke-width: 1.8;
    stroke-linejoin: round;
  }

  .facade {
    fill: rgb(255 255 255 / 5%);
    stroke: currentColor;
    stroke-width: 1.5;
  }

  .porte {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.4;
  }

  /* L'eau : un seul trait bleu-vert, du départ à l'infiltration. */
  .eau,
  .drain {
    stroke: var(--vert-500);
    stroke-width: 2.6;
    fill: none;
    stroke-linejoin: round;
  }

  .drain {
    stroke-width: 4;
    stroke-linecap: round;
  }

  .pointe,
  .pointe-goutte {
    stroke: var(--vert-500);
    stroke-width: 2.2;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .goutte {
    stroke: var(--vert-300);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-dasharray: 4 3;
  }

  .pointe-goutte {
    stroke: var(--vert-300);
    stroke-width: 1.8;
  }

  /* La cuve : le seul endroit du dessin où l'on regarde à l'intérieur. */
  .cuve rect:first-child {
    fill: var(--papier);
    stroke: var(--encre-doux);
    stroke-width: 1.8;
  }

  .graisses {
    fill: var(--or);
    opacity: 0.5;
  }

  .claire {
    fill: var(--vert-300);
    opacity: 0.45;
  }

  .boues {
    fill: var(--encre-doux);
    opacity: 0.55;
  }

  .regle {
    margin: 14px 0 0;
    padding: 12px 14px;
    background: var(--papier-doux);
    border-left: 4px solid var(--vert-500);
    border-radius: 8px;
    font-size: 0.94rem;
  }
</style>
