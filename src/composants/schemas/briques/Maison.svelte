<script module lang="ts">
  /**
   * La maison de Verrière — première brique de la bibliothèque visuelle
   * (§ 19 de ORDRE-DE-MISSION-SCHEMAS.md).
   *
   * Trois schémas dessinaient trois maisons différentes : celle du DPE, celle
   * des argiles, celle de l'assainissement. Même sujet, trois silhouettes, trois
   * jeux de proportions. Elles n'en font plus qu'une.
   *
   * Tout est dérivé de la largeur de façade `l`, avec les proportions du dessin
   * de référence (celui du DPE) :
   *
   *   façade      1 × 0,837
   *   toit        débord 0,082 de chaque côté, hauteur 0,388
   *   cheminée    0,122 de large, posée aux trois quarts de la pente
   *
   * Ainsi une maison de 70 unités et une de 196 sont la même maison, à
   * l'échelle près — c'est ce qui fait qu'on la reconnaît d'un schéma à l'autre.
   */
  export const PROPORTIONS = {
    facade: 0.837,
    debordToit: 0.082,
    hauteurToit: 0.388,
    cheminee: 0.122
  } as const;
</script>

<script lang="ts">
  const {
    x,
    y,
    l,
    cheminee = false,
    fondation = false,
    fenetres = 0,
    porte = false
  }: {
    /** Coin haut-gauche de la façade. */
    x: number;
    y: number;
    /** Largeur de la façade — tout le reste en découle. */
    l: number;
    cheminee?: boolean;
    fondation?: boolean;
    /** 0, 1 ou 2 fenêtres, réparties sur la façade. */
    fenetres?: 0 | 1 | 2;
    porte?: boolean;
  } = $props();

  const h = $derived(l * PROPORTIONS.facade);
  const debord = $derived(l * PROPORTIONS.debordToit);
  const hToit = $derived(l * PROPORTIONS.hauteurToit);

  /** Le triangle du toit, posé sur le haut de la façade. */
  const toit = $derived(
    `M${x - debord} ${y} L${x + l / 2} ${y - hToit} L${x + l + debord} ${y} Z`
  );

  const lCheminee = $derived(l * PROPORTIONS.cheminee);
  const xCheminee = $derived(x + l * 0.755);
  const yCheminee = $derived(y - hToit * 0.868);

  /** Les ouvertures, en proportion elles aussi. */
  const cote = $derived(l * 0.265);
  const yFenetre = $derived(y + h * 0.28);
  const lPorte = $derived(l * 0.235);
  const hPorte = $derived(h * 0.34);

  const xFenetres = $derived(
    fenetres === 2
      ? [x + l * 0.143, x + l * 0.684]
      : fenetres === 1
        ? [x + l / 2 - cote / 2]
        : []
  );
</script>

<g class="maison">
  {#if cheminee}
    <rect x={xCheminee} y={yCheminee} width={lCheminee} height={hToit * 0.6} class="cheminee" />
  {/if}

  <path d={toit} class="toit" />
  <rect {x} {y} width={l} height={h} class="facade" />

  {#if fondation}
    <rect {x} y={y + h} width={l} height={h * 0.098} class="fondation" />
  {/if}

  {#each xFenetres as fx (fx)}
    <rect x={fx} y={yFenetre} width={cote} height={cote} class="vitre" />
    <path
      d="M{fx + cote / 2} {yFenetre} v{cote} M{fx} {yFenetre + cote / 2} h{cote}"
      class="croisillon"
    />
  {/each}

  {#if porte}
    <rect
      x={x + l / 2 - lPorte / 2}
      y={y + h - hPorte}
      width={lPorte}
      height={hPorte}
      class="porte"
    />
  {/if}
</g>

<style>
  /* La maison est dessinée à l'encre du contexte : posée sur le vert elle est
     claire, posée sur du papier elle est sombre. Un seul dessin, deux fonds. */
  .toit {
    fill: rgb(214 230 106 / 28%);
    stroke: var(--or);
    stroke-width: 1.8;
    stroke-linejoin: round;
  }

  .cheminee {
    fill: none;
    stroke: var(--or);
    stroke-width: 1.8;
  }

  .facade {
    fill: var(--surface-forte);
    stroke: currentColor;
    stroke-width: 1.5;
  }

  .fondation {
    fill: currentColor;
    opacity: 0.18;
  }

  .vitre {
    fill: rgb(214 230 106 / 22%);
    stroke: var(--or);
    stroke-width: 1.4;
  }

  .croisillon {
    stroke: var(--or);
    stroke-width: 1;
    fill: none;
    opacity: 0.7;
  }

  .porte {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
  }
</style>
