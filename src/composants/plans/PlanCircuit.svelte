<script lang="ts">
  /**
   * Le circuit gaz : de l'arrivée aux appareils, un jalon par point signalé.
   *
   * Le gaz se lit comme un trajet — il entre, il traverse, il brûle. Les
   * jalons sont posés sur ce trajet dans l'ordre où le rapport les cite, et la
   * flamme du bout rappelle ce qui est en jeu.
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

  const hauteur = $derived(70 + zones.length * 42);
</script>

<svg
  class="plan-svg"
  viewBox="0 0 220 {hauteur}"
  width="100%"
  style="max-width: 260px"
  role="img"
  aria-label="Le circuit gaz, jalon par jalon"
>
  <!-- L'arrivée -->
  <circle cx="34" cy="26" r="10" fill="var(--surface-forte)" stroke="var(--sur-fond)" stroke-width="1.5" />
  <text x="52" y="30" class="etiquette">arrivée</text>

  <!-- La conduite, qui descend en desservant chaque jalon -->
  <line
    x1="34"
    y1="36"
    x2="34"
    y2={hauteur - 34}
    stroke="var(--sur-fond)"
    stroke-width="3"
    stroke-linecap="round"
  />

  {#each zones as z, i (z.id)}
    {@const y = 58 + i * 42}
    <line x1="34" y1={y + 14} x2="70" y2={y + 14} stroke="var(--trait)" stroke-width="2" />

    <g
      class="z {z.etat}"
      class:choisie={choisie === z.id}
      role="button"
      tabindex="-1"
      aria-label={z.nom}
      onclick={() => choisir(z.id)}
      onkeydown={(e) => auClavier(e, z.id)}
    >
      <rect x="70" y={y} width="130" height="28" rx="4" />
    </g>

    <text x="80" y={y + 18} class="etiquette">{z.nom.slice(0, 26)}</text>
  {/each}

  <!-- La flamme, au bout de la conduite. -->
  <g class="flamme">
    <path
      d="M34 {hauteur - 30} q-9 -12 0 -22 q9 10 0 22"
      fill="var(--teinte, var(--petrole))"
      opacity="0.85"
      stroke="none"
    />
  </g>
</svg>

<style>
  .flamme {
    transform-origin: 34px calc(100% - 30px);
    /* Animation retiree : elle tournait en boucle sans rien demontrer */
  }


  @media (prefers-reduced-motion: reduce) {
    .flamme {
      animation: none;
    }
  }
</style>
