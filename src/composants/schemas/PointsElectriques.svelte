<script lang="ts">
  /**
   * Le diagnostic électrique contrôle six points, mais un seul mérite un
   * schéma : le dispositif différentiel. C'est lui qui décide si un défaut
   * d'isolement se termine par un déclic ou par une électrocution.
   *
   * Une idée, deux images : sans, avec.
   *
   * Le dessin démontre ; les clips désignent. Deux seulement, parce que deux
   * points seulement protègent les personnes — le reste protège les fils.
   */
  import ClipDessin from '../savoir/ClipDessin.svelte';
</script>

<figure>
  <svg viewBox="0 0 460 246" role="group" aria-label="Sans dispositif différentiel, le courant qui fuit traverse la personne. Avec un différentiel, il coupe l’alimentation en une fraction de seconde.">
    {#each [{ x: 0, avec: false }, { x: 240, avec: true }] as vue (vue.avec)}
      <g transform="translate({vue.x} 0)">
        <text x="100" y="18" class="titre">
          {vue.avec ? 'Avec différentiel' : 'Sans différentiel'}
        </text>

        <!-- Appareil défectueux -->
        <rect x="20" y="40" width="54" height="46" rx="4" class="appareil" />
        <path d="M34 62h26M34 72h18" class="detail" />

        <!-- Le fil qui fuit -->
        <path d="M74 62 H120" class={vue.avec ? 'fil coupe' : 'fil'} />

        <!-- La personne -->
        <circle cx="140" cy="56" r="12" class="personne" />
        <path d="M140 68v34M126 118l14-16 14 16M126 82h28" class="personne" />

        <!-- Trajet du courant -->
        {#if vue.avec}
          <g class="protege">
            <rect x="88" y="44" width="26" height="36" rx="3" class="boitier" />
            <path d="M94 62h14" class="interrupteur" />
            <text x="101" y="96" class="mention">clic</text>
          </g>
          <text x="100" y="160" class="conclusion bonne">Le courant est coupé.</text>
          <text x="100" y="178" class="sous-conclusion">La personne ne sent rien.</text>
        {:else}
          <path d="M140 118 V150 H196" class="courant" />
          <text x="100" y="160" class="conclusion mauvaise">Le courant passe par le corps.</text>
          <text x="100" y="178" class="sous-conclusion">et rejoint le sol</text>
        {/if}

        <!-- Le sol -->
        <path d="M0 150 H200" class="terre" />
      </g>
    {/each}

    <!-- Les deux points qui protègent les personnes. Le reste du diagnostic
         protège les fils : ce n'est pas la même chose, et ça se désigne. -->
    <ClipDessin id="mise-a-la-terre" x={60} y={218} depuis={[100, 152]} cote="droite" />
    <ClipDessin id="differentiel" x={250} y={218} depuis={[341, 84]} cote="droite" />
  </svg>

  <p class="regle">
    C’est le point le plus important des six que contrôle ce diagnostic. Les cinq autres : la
    coupure d’urgence — pouvoir tout couper d’un geste —, la mise à la terre, des disjoncteurs
    adaptés à la section des fils, les règles de la salle de bains, et le matériel vétuste ou cassé.
  </p>
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
    font-size: var(--t-petit);
    font-weight: 600;
    fill: var(--encre);
    text-anchor: middle;
  }

  .appareil {
    fill: var(--papier-doux);
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .detail {
    stroke: var(--trait);
    stroke-width: 2.5;
    fill: none;
  }

  .fil {
    stroke: var(--alerte);
    stroke-width: 3;
    fill: none;
  }

  .fil.coupe {
    stroke: var(--trait);
    stroke-dasharray: 5 5;
  }

  .personne {
    fill: none;
    stroke: var(--encre-doux);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .courant {
    stroke: var(--alerte);
    stroke-width: 3;
    fill: none;
    stroke-dasharray: 6 4;
  }

  .boitier {
    fill: var(--vert-100);
    stroke: var(--vert-700);
    stroke-width: 2;
  }

  .interrupteur {
    stroke: var(--vert-700);
    stroke-width: 2.5;
    transform-origin: 94px 62px;
    transform: rotate(-30deg);
  }

  .mention {
    font-size: var(--t-micro);
    fill: var(--vert-700);
    text-anchor: middle;
    font-weight: 600;
  }

  .terre {
    stroke: var(--encre-doux);
    stroke-width: 2.5;
  }

  .conclusion {
    font-size: var(--t-petit);
    font-weight: 600;
    text-anchor: middle;
  }

  .conclusion.bonne {
    fill: var(--ok);
  }

  .conclusion.mauvaise {
    fill: var(--alerte);
  }

  .sous-conclusion {
    font-size: var(--t-micro);
    fill: var(--encre-doux);
    text-anchor: middle;
  }

  .regle {
    margin: var(--e3) 0 0;
    padding: var(--e3) var(--e3);
    background: var(--papier-doux);
    border-left: 4px solid var(--vert-500);
    border-radius: 8px;
    font-size: var(--t-base);
  }
</style>
