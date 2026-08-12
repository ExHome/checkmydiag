<script lang="ts">
  /**
   * Le retrait-gonflement des argiles : le risque le plus fréquent des états des
   * risques, et le moins compris. Deux saisons côte à côte suffisent à
   * l'expliquer.
   */
</script>

<figure>
  <svg viewBox="0 0 500 220" role="img" aria-label="En été, le sol argileux sèche et se rétracte : la maison s’affaisse d’un côté et des fissures apparaissent. En hiver, le sol gorgé d’eau gonfle et soulève les fondations.">
    {#each [{ x: 0, titre: 'Été — le sol sèche', ete: true }, { x: 250, titre: 'Hiver — le sol gonfle', ete: false }] as vue (vue.titre)}
      <g transform="translate({vue.x} 0)">
        <text x="125" y="20" class="titre">{vue.titre}</text>

        <!-- Sol -->
        <rect x="20" y="120" width="210" height="80" class="sol" />
        {#if vue.ete}
          <path d="M60 130v22M100 126v28M140 132v20M180 128v24" class="retrait" />
          <text x="125" y="188" class="note">l’argile perd son eau et se tasse</text>
        {:else}
          <path d="M55 140h30M95 148h30M140 138h34" class="gonflement" />
          <text x="125" y="188" class="note">l’argile absorbe l’eau et se soulève</text>
        {/if}

        <!-- Maison, penchée en été -->
        <g transform={vue.ete ? 'rotate(-3 125 120)' : ''}>
          <rect x="72" y="66" width="106" height="54" class="mur" />
          <path d="M62 66 L125 34 L188 66 Z" class="toit" />
          {#if vue.ete}
            <path d="M104 120 l6 -16 -5 -10 7 -12" class="fissure" />
          {:else}
            <path d="M150 120 l-5 -14 6 -12" class="fissure" />
          {/if}
        </g>

        <!-- Mouvement -->
        {#if vue.ete}
          <path d="M92 46 v18" class="mouvement bas" />
        {:else}
          <path d="M158 64 v-18" class="mouvement haut" />
        {/if}
      </g>
    {/each}
  </svg>

  <figcaption class="muet petit">
    Le sol argileux travaille avec les saisons. Une maison dont les fondations sont trop
    superficielles suit ce mouvement : c’est ainsi qu’apparaissent les fissures en escalier sur les
    murs.
  </figcaption>
</figure>

<style>
  figure {
    margin: 0;
  }

  svg {
    width: 100%;
    height: auto;
  }

  .titre {
    font-size: 13px;
    font-weight: 600;
    fill: var(--encre);
    text-anchor: middle;
  }

  .note {
    font-size: 11px;
    fill: var(--encre-doux);
    text-anchor: middle;
  }

  .sol {
    fill: var(--attention-fond);
    stroke: var(--attention);
    stroke-width: 1.5;
  }

  .retrait {
    stroke: var(--attention);
    stroke-width: 2;
    stroke-linecap: round;
  }

  .gonflement {
    stroke: var(--vert-500);
    stroke-width: 2.5;
    stroke-linecap: round;
  }

  .mur {
    fill: var(--papier-doux);
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .toit {
    fill: var(--vert-100);
    stroke: var(--encre-doux);
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .fissure {
    fill: none;
    stroke: var(--alerte);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .mouvement {
    stroke: var(--encre-doux);
    stroke-width: 2;
    stroke-dasharray: 4 3;
  }
</style>
