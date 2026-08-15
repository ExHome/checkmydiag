<script lang="ts">
  /**
   * Les couches du terrain : un bandeau par risque que le rapport recense.
   *
   * L'état des risques ne décrit pas le logement mais le sol et la commune sur
   * lesquels il est posé. On dessine donc le terrain, la maison en surface, et
   * chaque risque comme une strate — de la surface vers la profondeur, dans
   * l'ordre où le rapport les cite.
   *
   * Rien n'est sondé ici : c'est une recopie de zonages officiels, et le dessin
   * ne doit pas laisser croire qu'on est venu mesurer quoi que ce soit.
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

  const hauteurCouche = 30;
  const hauteur = $derived(52 + zones.length * (hauteurCouche + 4));
</script>

<svg
  class="plan-svg"
  viewBox="0 0 220 {hauteur}"
  width="100%"
  style="max-width: 260px"
  role="img"
  aria-label="Le terrain et les risques recensés"
>
  <!-- La maison en surface, posée sur la première strate. -->
  <path d="M92 40 L110 24 L128 40 Z" fill="var(--surface-forte)" stroke="var(--sur-fond)" stroke-width="1.5" />
  <rect x="98" y="40" width="24" height="8" fill="var(--surface-forte)" stroke="var(--sur-fond)" stroke-width="1.5" />
  <line x1="12" y1="48" x2="208" y2="48" stroke="var(--sur-fond)" stroke-width="2" />

  {#each zones as z, i (z.id)}
    {@const y = 52 + i * (hauteurCouche + 4)}
    <g
      class="z {z.etat}"
      class:choisie={choisie === z.id}
      role="button"
      tabindex="-1"
      aria-label={z.nom}
      onclick={() => choisir(z.id)}
      onkeydown={(e) => auClavier(e, z.id)}
      style="--retard: {i * 90}ms"
    >
      <rect class="couche" x="12" y={y} width="196" height={hauteurCouche} rx="2" />
    </g>

    <text x="22" y={y + 19} class="etiquette">{z.nom.slice(0, 32)}</text>
  {/each}
</svg>

<style>
  /* Les strates se posent l'une après l'autre, du haut vers le bas : c'est
     l'ordre dans lequel on descend dans le sol. */
  .couche {
    animation: pose 0.5s var(--courbe) backwards;
    animation-delay: var(--retard, 0ms);
  }

  @keyframes pose {
    from {
      transform: translateY(-6px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .couche {
      animation: none;
    }
  }
</style>
