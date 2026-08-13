<script module lang="ts">
  /**
   * La pastille de verdict, commune à tous les schémas.
   *
   * Il y avait trois codes couleur pour la même chose — rouge/vert ici,
   * chaud/froid là, oui/non ailleurs — et le lecteur devait le réapprendre à
   * chaque dessin. Il n'y en a plus qu'un, à quatre tons.
   *
   * `neutre` compte autant que les autres : « ça compte » et « ça ne compte
   * pas » ne sont ni une bonne ni une mauvaise nouvelle. Les peindre en vert et
   * en rouge laissait croire à un problème là où il n'y a qu'une règle de
   * calcul.
   */
  export type Ton = 'bon' | 'attention' | 'alerte' | 'neutre' | 'neutre-evide';
</script>

<script lang="ts">
  const {
    x = 0,
    y = 0,
    texte,
    ton = 'neutre',
    largeur
  }: {
    x?: number;
    y?: number;
    texte: string;
    ton?: Ton;
    /** Par défaut, calculée sur la longueur du texte. */
    largeur?: number | undefined;
  } = $props();

  // 6,9 px par caractère à 13 px en graisse 800, plus la respiration des bords.
  const l = $derived(largeur ?? Math.round(texte.length * 6.9 + 30));
</script>

<g transform="translate({x} {y})" class="verdict {ton}">
  <rect x={-l / 2} y="-16" width={l} height="32" rx="16" />
  <text x="0" y="5">{texte}</text>
</g>

<style>
  rect {
    stroke-width: 1.6;
  }

  text {
    font-size: 13px;
    font-weight: 800;
    fill: var(--encre);
    text-anchor: middle;
  }

  .bon rect {
    fill: var(--ok-fond);
    stroke: var(--ok);
  }

  .bon text {
    fill: var(--ok);
  }

  .attention rect {
    fill: var(--attention-fond);
    stroke: var(--attention);
  }

  .attention text {
    fill: var(--attention);
  }

  .alerte rect {
    fill: var(--alerte-fond);
    stroke: var(--alerte);
  }

  .alerte text {
    fill: var(--alerte);
  }

  /* Le ton neutre ne dit rien de la gravité : il désigne, il ne juge pas. Sa
     variante évidée sert quand deux verdicts neutres doivent se distinguer. */
  .neutre rect {
    fill: var(--papier-doux);
    stroke: var(--or);
  }

  .neutre text {
    fill: var(--encre);
  }

  .neutre-evide rect {
    fill: none;
    stroke: var(--gris);
    stroke-dasharray: 5 4;
  }

  .neutre-evide text {
    fill: var(--encre-doux);
  }
</style>
