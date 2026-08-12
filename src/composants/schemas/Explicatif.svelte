<script lang="ts">
  /**
   * Le schéma qui fait comprendre le diagnostic — indépendant des chiffres du
   * rapport. Il s'affiche même quand rien n'a pu être lu : c'est justement là
   * que le lecteur en a le plus besoin.
   */
  import type { TypeDiag } from '../../lib/modele';
  import Deperditions from './Deperditions.svelte';
  import ChainePlomb from './ChainePlomb.svelte';
  import PointsElectriques from './PointsElectriques.svelte';
  import Argiles from './Argiles.svelte';
  import OuAmiante from './OuAmiante.svelte';
  import CircuitGaz from './CircuitGaz.svelte';
  import CheminTermites from './CheminTermites.svelte';
  import SurfaceCarrez from './SurfaceCarrez.svelte';

  const { type }: { type: TypeDiag } = $props();

  const TITRES: Partial<Record<TypeDiag, string>> = {
    dpe: 'Par où part la chaleur',
    plomb: 'Pourquoi une vieille peinture est dangereuse',
    electricite: 'Les six points contrôlés, et à quoi ils servent',
    gaz: 'Le gaz, l’air et les fumées : trois trajets à ne jamais boucher',
    amiante: 'Où se cache l’amiante dans un logement',
    termites: 'Par où les termites arrivent',
    erp: 'Le risque le plus fréquent : l’argile qui gonfle et se rétracte',
    carrez: 'Ce qui compte dans la surface, et ce qui ne compte pas'
  };

  const titre = $derived(TITRES[type]);
</script>

{#if titre}
  <section class="explicatif">
    <h3>{titre}</h3>
    {#if type === 'dpe'}
      <Deperditions />
    {:else if type === 'plomb'}
      <ChainePlomb />
    {:else if type === 'electricite'}
      <PointsElectriques />
    {:else if type === 'gaz'}
      <CircuitGaz />
    {:else if type === 'amiante'}
      <OuAmiante />
    {:else if type === 'termites'}
      <CheminTermites />
    {:else if type === 'erp'}
      <Argiles />
    {:else if type === 'carrez'}
      <SurfaceCarrez />
    {/if}
  </section>
{/if}

<style>
  .explicatif {
    margin-top: 26px;
    padding-top: 20px;
    border-top: 1px solid var(--trait);
  }

  h3 {
    font-family: var(--police);
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--encre-doux);
    margin-bottom: 16px;
  }

  /* Un schéma trop large se lit mal : on le pose au centre, à taille de lecture. */
  .explicatif :global(figure > svg) {
    max-width: 520px;
    margin-inline: auto;
    display: block;
  }
</style>
