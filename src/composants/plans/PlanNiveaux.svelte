<script lang="ts">
  /**
   * Le bâtiment par niveaux : un bandeau par zone que le rapport nomme.
   *
   * Sert à l'amiante et aux termites, qui parlent tous deux d'endroits — un
   * local, une charpente, un vide sanitaire. Les bandeaux s'empilent dans
   * l'ordre du rapport, du plus haut au plus bas.
   *
   * Ce qui n'a pas été visité est hachuré. C'est le point le plus important du
   * dessin : sur ces deux diagnostics, ce qu'on n'a pas pu voir compte autant
   * que ce qu'on a vu.
   */
  import type { ZonePlan } from '../../lib/analyse/plan';

  const {
    zones,
    choisir,
    choisie
  }: { zones: ZonePlan[]; choisir: (id: string) => void; choisie: string | null } = $props();

  function auClavier(e: KeyboardEvent, id: string): void {
    if (e.key === 'Enter' || e.key === ' ') choisir(id);
  }

  const hauteurBande = 26;
  const hauteur = $derived(46 + zones.length * (hauteurBande + 6));
</script>

<svg
  class="plan-svg"
  viewBox="0 0 220 {hauteur}"
  width="100%"
  style="max-width: 260px"
  role="img"
  aria-label="Le bâtiment par zones contrôlées"
>
  <!-- Le toit coiffe la pile : on sait qu'on regarde un bâtiment. -->
  <path d="M26 38 L110 8 L194 38 Z" fill="var(--surface-forte)" stroke="var(--sur-fond)" stroke-width="1.5" />

  {#each zones as z, i (z.id)}
    {@const y = 44 + i * (hauteurBande + 6)}
    <g
      class="z {z.etat}"
      class:choisie={choisie === z.id}
      role="button"
      tabindex="-1"
      aria-label={z.nom}
      onclick={() => choisir(z.id)}
      onkeydown={(e) => auClavier(e, z.id)}
    >
      <rect x="30" y={y} width="160" height={hauteurBande} rx="3" />
    </g>

    <text x="38" y={y + 17} class="etiquette">{z.nom.slice(0, 30)}</text>
  {/each}
</svg>
