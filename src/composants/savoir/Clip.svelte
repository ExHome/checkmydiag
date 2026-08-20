<script lang="ts">
  /**
   * Le clip : le point d'entrée du langage Verrière.
   *
   *     Fenêtre ─── ●
   *
   * Il dit « je peux en savoir plus » sans crier. Pas de bouton, pas de
   * clignotement : un point, un filet, et un léger halo qui respire au survol
   * (§ 13). Version texte — pour la version posée sur un dessin, voir
   * ClipDessin.svelte.
   */
  import { exploration } from '../../lib/savoir/pile.svelte';
  import { notion } from '../../lib/savoir/notions';

  const {
    id,
    libelle
  }: {
    id: string;
    /** Par défaut, le terme exact de la notion — jamais une paraphrase. */
    libelle?: string | undefined;
  } = $props();

  const n = $derived(notion(id));
  const texte = $derived(libelle ?? n?.terme ?? id);
</script>

{#if n}
  <button
    type="button"
    class="clip"
    aria-label="{texte} — en savoir plus"
    onclick={(e) => {
      e.stopPropagation();
      exploration.ouvrir(id);
    }}
  >
    {texte}<span class="point" aria-hidden="true"></span>
  </button>
{:else}
  {texte}
{/if}

<style>
  .clip {
    display: inline;
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    text-decoration: underline dotted;
    text-decoration-color: var(--verriere-sable-or);
    text-underline-offset: 3px;
    transition: color 0.18s ease;
  }

  .point {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-left: var(--e1);
    border-radius: 50%;
    background: var(--verriere-sable-or);
    vertical-align: 2px;
    transition: box-shadow 0.25s ease, background 0.18s ease;
  }

  .clip:hover,
  .clip:focus-visible {
    color: var(--verriere-vert-profond);
    text-decoration-style: solid;
  }

  .clip:hover .point,
  .clip:focus-visible .point {
    background: var(--verriere-vert-profond);
    box-shadow: 0 0 0 4px rgb(214 230 106 / 28%);
  }

  @media (prefers-reduced-motion: reduce) {
    .clip,
    .point {
      transition: none;
    }
  }
</style>
