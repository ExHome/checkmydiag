<script lang="ts">
  /**
   * Le pictogramme d'un diagnostic. Un dessin par famille, réutilisé partout :
   * dans les tuiles du bilan, dans le voyant, dans les onglets.
   */
  import type { TypeDiag } from '../lib/modele';

  const { type }: { type: TypeDiag } = $props();
</script>

<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  {#if type === 'dpe'}
    <path d="M8 30V16l12-8 12 8v14" />
    <path d="M20 30v-8" />
    <path d="M14 22h12" />
  {:else if type === 'amiante'}
    <path d="M6 26c3-3 5-3 8 0s5 3 8 0 5-3 8 0" />
    <path d="M6 18c3-3 5-3 8 0s5 3 8 0 5-3 8 0" />
  {:else if type === 'plomb'}
    <path d="M12 14h16v16a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V14Z" />
    <path d="M12 14V9h10v5" />
    <path d="M12 22h16" />
  {:else if type === 'termites'}
    <ellipse cx="21" cy="21" rx="8" ry="5" />
    <circle cx="11" cy="21" r="3.4" />
    <path d="M8 18.5 5 16M8 23.5 5 26" />
    <path d="M17 16.5 15.5 12M22 16 22 11M27 17 29 12.5" />
  {:else if type === 'electricite'}
    <path d="M22 5 12 22h8l-2 13 12-18h-8l2-12Z" />
  {:else if type === 'gaz'}
    <path d="M20 34c6 0 10-4 10-9 0-7-7-9-6-16-6 3-9 8-9 12 0 2 1 4 2 5 0-3 1-5 3-6-1 5 0 8 0 8s-2 1-2 3c0 2 1 3 2 3Z" />
  {:else if type === 'erp'}
    <path d="M20 6 35 32H5L20 6Z" />
    <path d="M20 16v8" />
    <path d="M20 28h.01" />
  {:else if type === 'carrez'}
    <rect x="6" y="12" width="28" height="16" rx="2" />
    <path d="M13 12v5M20 12v7M27 12v5" />
  {:else}
    <path d="M20 6c0 8-9 10-9 17a9 9 0 0 0 18 0c0-7-9-9-9-17Z" />
  {/if}
</svg>

<style>
  svg {
    width: 100%;
    height: 100%;
  }
</style>
