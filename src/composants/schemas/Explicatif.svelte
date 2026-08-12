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

  import type { Isolation, Lettre } from '../../lib/modele';

  const {
    type,
    isolation = null,
    lettre = null
  }: { type: TypeDiag; isolation?: Isolation | null; lettre?: Lettre | null } = $props();

  // Le schéma parle du logement du lecteur, pas d'une maison en général.
  const TITRES: Partial<Record<TypeDiag, string>> = {
    dpe: 'Par où la chaleur part de chez vous',
    plomb: 'Pourquoi une vieille peinture est dangereuse',
    electricite: 'Ce que fait le différentiel quand le courant fuit',
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
      <Deperditions {isolation} {lettre} />
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
    margin: 0;
  }

  h3 {
    font-family: var(--police-titre);
    font-style: italic;
    font-size: 1.24rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    text-transform: none;
    color: var(--vert-700);
    margin-bottom: 14px;
  }

  /* Le schéma est la pièce maîtresse de l'encart : il prend toute la largeur
     qu'on lui donne. */
  .explicatif :global(figure > svg) {
    width: 100%;
    max-width: 100%;
    margin-inline: auto;
    display: block;
  }
</style>
