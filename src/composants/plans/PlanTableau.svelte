<script lang="ts">
  /**
   * Le tableau électrique : un module par point de contrôle en anomalie.
   *
   * Le nombre de modules n'est pas décoratif — c'est celui des groupes que le
   * rapport cite. Un tableau à neuf cases fixes suggérerait qu'on a regardé
   * neuf choses ; on affiche donc exactement ce que le rapport nomme, ni plus.
   *
   * Le courant qui circule sur les rails est le seul élément décoratif : il
   * rappelle qu'une installation en anomalie fonctionne quand même — c'est
   * précisément ce qui la rend traître.
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

  /** Trois modules par rangée : au-delà, ils deviennent illisibles sur 380 px. */
  const parRangee = 3;
  const rangees = $derived(Math.max(1, Math.ceil(zones.length / parRangee)));
  const hauteur = $derived(56 + rangees * 46);

  const place = (i: number) => ({
    x: 22 + (i % parRangee) * 62,
    y: 44 + Math.floor(i / parRangee) * 46
  });
</script>

<svg
  class="plan-svg"
  viewBox="0 0 220 {hauteur}"
  width="100%"
  style="max-width: 260px"
  role="img"
  aria-label="Tableau électrique : un module par point de contrôle signalé"
>
  <!-- Le coffret -->
  <rect
    x="8"
    y="8"
    width="204"
    height={hauteur - 16}
    rx="6"
    fill="var(--papier)"
    stroke="var(--sur-fond)"
    stroke-width="2"
  />

  <!-- L'arrivée, et le courant qui y passe. -->
  <line x1="18" y1="28" x2="202" y2="28" stroke="var(--sur-fond)" stroke-width="2" />
  <circle class="flux" cx="18" cy="28" r="3" fill="var(--teinte, var(--petrole))" />
  <circle class="flux retard" cx="18" cy="28" r="3" fill="var(--teinte, var(--petrole))" />

  {#each zones as z, i (z.id)}
    {@const p = place(i)}
    <!-- La descente du rail vers le module -->
    <line x1={p.x + 22} y1="28" x2={p.x + 22} y2={p.y} stroke="var(--trait)" stroke-width="2" />

    <g
      class="z {z.etat}"
      class:choisie={choisie === z.id}
      role="button"
      tabindex="-1"
      aria-label={z.nom}
      onclick={() => choisir(z.id)}
      onkeydown={(e) => auClavier(e, z.id)}
    >
      <rect x={p.x} y={p.y} width="44" height="34" rx="3" />
      <!-- La manette du disjoncteur -->
      <rect x={p.x + 16} y={p.y + 7} width="12" height="14" rx="2" fill="var(--sur-fond)" opacity="0.35" />
    </g>

    <text x={p.x + 22} y={p.y + 30} text-anchor="middle" class="etiquette">{i + 1}</text>
  {/each}
</svg>

<style>
  /* Les deux points du flux ne courent plus : l'animation tournait en boucle
     sans rien démontrer, et le décalage qui la nuançait n'a plus d'objet. */


  @media (prefers-reduced-motion: reduce) {
    .flux {
      animation: none;
      opacity: 0;
    }
  }
</style>
