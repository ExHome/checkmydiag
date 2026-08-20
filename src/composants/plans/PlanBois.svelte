<script lang="ts">
  /**
   * La charpente : une pièce de bois par zone que le rapport nomme.
   *
   * Les termites se lisent dans le bois — on regarde des poutres, des lambris,
   * des huisseries. Les pièces se croisent comme une charpente, et le cerne qui
   * bat au centre rappelle qu'un bois sain reste vivant.
   *
   * Ce qui n'a pas été visité est hachuré. Sur ce diagnostic, un vide sanitaire
   * inaccessible n'est pas une bonne nouvelle : c'est un angle mort.
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

  const hauteur = $derived(96 + zones.length * 34);
</script>

<svg
  class="plan-svg"
  viewBox="0 0 220 {hauteur}"
  width="100%"
  style="max-width: 260px"
  role="img"
  aria-label="La structure bois, pièce par pièce"
>
  <!-- La coupe du tronc : des cernes, et un cœur qui bat. -->
  <g class="tronc">
    <circle cx="110" cy="42" r="30" fill="var(--surface)" stroke="var(--trait)" stroke-width="1.5" />
    <circle cx="110" cy="42" r="22" fill="none" stroke="var(--trait)" stroke-width="1.5" />
    <circle cx="110" cy="42" r="14" fill="none" stroke="var(--trait)" stroke-width="1.5" />
    <circle class="coeur" cx="110" cy="42" r="6" fill="var(--teinte, var(--verriere-vert))" opacity="0.7" />
  </g>

  {#each zones as z, i (z.id)}
    {@const y = 86 + i * 34}
    <g
      class="z {z.etat}"
      class:choisie={choisie === z.id}
      role="button"
      tabindex="-1"
      aria-label={z.nom}
      onclick={() => choisir(z.id)}
      onkeydown={(e) => auClavier(e, z.id)}
    >
      <!-- Une pièce de bois, posée de biais comme dans une charpente. -->
      <rect x="24" y={y} width="172" height="24" rx="3" />
    </g>

    <!-- Le fil du bois -->
    <line
      x1="34"
      y1={y + 12}
      x2="186"
      y2={y + 12}
      stroke="var(--sur-fond)"
      stroke-width="1"
      opacity="0.18"
      stroke-dasharray="14 8"
    />
    <text x="34" y={y + 16} class="etiquette">{z.nom.slice(0, 28)}</text>
  {/each}
</svg>

<style>
  .coeur {
    transform-origin: 110px 42px;
    /* Animation retiree : elle tournait en boucle sans rien demontrer */
  }


  @media (prefers-reduced-motion: reduce) {
    .coeur {
      animation: none;
    }
  }
</style>
