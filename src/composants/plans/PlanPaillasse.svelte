<script lang="ts">
  /**
   * La paillasse : un tube par emplacement mesuré.
   *
   * Le constat plomb ne parcourt pas le logement, il mesure des unités de
   * diagnostic. Un tube par mesure, rempli à la hauteur de sa classe : classe 0
   * au fond, classe 3 au sommet. Ce qui n'a pas été mesuré n'a pas de tube —
   * c'est la différence entre « rien trouvé » et « rien cherché ».
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

  /** La hauteur du remplissage : elle traduit l'état, pas une mesure inventée. */
  const remplissage = (etat: ZonePlan['etat']): number =>
    etat === 'alerte' ? 54 : etat === 'attention' ? 34 : etat === 'bon' ? 12 : 0;

  const parRangee = 4;
  const rangees = $derived(Math.max(1, Math.ceil(zones.length / parRangee)));
  const hauteur = $derived(24 + rangees * 96);
</script>

<svg
  class="plan-svg"
  viewBox="0 0 220 {hauteur}"
  width="100%"
  style="max-width: 260px"
  role="img"
  aria-label="Les emplacements mesurés, un tube par mesure"
>
  {#each zones as z, i (z.id)}
    {@const x = 20 + (i % parRangee) * 48}
    {@const y = 12 + Math.floor(i / parRangee) * 96}
    {@const h = remplissage(z.etat)}

    <!-- La paillasse -->
    <line
      x1={x - 6}
      y1={y + 78}
      x2={x + 34}
      y2={y + 78}
      stroke="var(--trait)"
      stroke-width="2"
    />

    <g
      class="z {z.etat}"
      class:choisie={choisie === z.id}
      role="button"
      tabindex="-1"
      aria-label={z.nom}
      onclick={() => choisir(z.id)}
      onkeydown={(e) => auClavier(e, z.id)}
    >
      <!-- Le tube, ouvert en haut -->
      <path d="M{x} {y + 8} L{x} {y + 70} Q{x} {y + 78} {x + 14} {y + 78} Q{x + 28} {y + 78} {x + 28} {y + 70} L{x + 28} {y + 8}" />
    </g>

    {#if h > 0}
      <!--
        Le niveau prend la couleur de l'état, jamais celle de l'application.
        Rempli en vert parce que le plomb est vert, un tube de classe 3 se
        lisait « bon » — l'inverse exact de ce que le rapport dit.
      -->
      <rect
        class="niveau {z.etat}"
        x={x + 3}
        y={y + 72 - h}
        width="22"
        height={h}
        rx="3"
        opacity="0.8"
      />
    {/if}

    <text x={x + 14} y={y + 92} text-anchor="middle" class="etiquette">{i + 1}</text>
  {/each}
</svg>

<style>
  .niveau {
    transform-origin: center bottom;
    animation: monte 0.9s var(--courbe);
    stroke: none;
  }

  .niveau.alerte {
    fill: var(--alerte);
  }

  .niveau.attention {
    fill: var(--attention);
  }

  .niveau.bon {
    fill: var(--ok);
  }

  .niveau.neutre {
    fill: var(--gris);
  }

  @keyframes monte {
    from {
      transform: scaleY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .niveau {
      animation: none;
    }
  }
</style>
