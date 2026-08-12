<script lang="ts">
  /**
   * L'étiquette A→G en miniature, pour la tuile du DPE.
   *
   * Personne n'a besoin qu'on lui explique ce dessin : c'est le seul visuel du
   * diagnostic immobilier que tout le monde reconnaît. Autant le montrer plutôt
   * qu'un pictogramme de maison.
   */
  import type { Lettre } from '../lib/modele';

  const { lettre }: { lettre: Lettre | null } = $props();

  const LETTRES: Lettre[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
</script>

<svg viewBox="0 0 46 74" role="img" aria-label={lettre ? `Classe ${lettre}` : 'Classe non lisible'}>
  {#each LETTRES as l, i (l)}
    {@const y = i * 10.4}
    {@const largeur = 20 + i * 3.4}
    {@const actif = l === lettre}
    <g opacity={actif ? 1 : 0.34}>
      <path
        d="M2 {y} H{largeur} L{largeur + 5} {y + 4.4} L{largeur} {y + 8.8} H2 Z"
        fill="var(--etq-{l.toLowerCase()})"
      />
      {#if actif}
        <rect x="0.6" y={y - 1.2} width={largeur + 6} height="11.2" rx="2" class="cadre" />
      {/if}
    </g>
  {/each}
</svg>

<style>
  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .cadre {
    fill: none;
    stroke: var(--encre);
    stroke-width: 1.6;
  }
</style>
