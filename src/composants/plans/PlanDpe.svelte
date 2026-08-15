<script lang="ts">
  /**
   * La maison en coupe : les quatre parois par où la chaleur s'en va.
   *
   * Chaque paroi prend la couleur de ce que le rapport en dit — isolée, non
   * isolée, ou muette. Une paroi dont le rapport ne parle pas reste hachurée :
   * ni verte ni rouge, parce qu'on ne sait pas.
   */
  import type { ZonePlan } from '../../lib/analyse/plan';

  const {
    zones,
    choisir,
    choisie
  }: { zones: ZonePlan[]; choisir: (id: string) => void; choisie: string | null } = $props();

  const etatDe = (id: string) => zones.find((z) => z.id === id)?.etat ?? 'neutre';
  const nomDe = (id: string) => zones.find((z) => z.id === id)?.nom ?? id;

  /* Les zones du dessin ne sont pas dans le parcours du clavier : la liste
     juste dessous les reprend toutes, et les y ajouter ferait tabuler deux fois
     sur la même commande. Le clavier reste servi, sans doublon. */
  function auClavier(e: KeyboardEvent, id: string): void {
    if (e.key === 'Enter' || e.key === ' ') choisir(id);
  }
</script>

<svg
  class="plan-svg"
  viewBox="0 0 220 176"
  width="100%"
  style="max-width: 260px"
  role="img"
  aria-label="Coupe du logement : toiture, murs, fenêtres, plancher"
>
  <!-- Le volume intérieur : c'est le logement, il ne se clique pas. -->
  <rect x="54" y="70" width="112" height="72" fill="var(--surface)" stroke="var(--trait)" />

  <g
    class="z {etatDe('toit')}"
    class:choisie={choisie === 'toit'}
    role="button"
    tabindex="-1"
    aria-label={nomDe('toit')}
    onclick={() => choisir('toit')}
    onkeydown={(e) => auClavier(e, 'toit')}
  >
    <path d="M20 68 L110 18 L200 68 Z" />
  </g>

  <g
    class="z {etatDe('murs')}"
    class:choisie={choisie === 'murs'}
    role="button"
    tabindex="-1"
    aria-label={nomDe('murs')}
    onclick={() => choisir('murs')}
    onkeydown={(e) => auClavier(e, 'murs')}
  >
    <rect x="34" y="70" width="20" height="72" />
    <rect x="166" y="70" width="20" height="72" />
  </g>

  <g
    class="z {etatDe('fenetres')}"
    class:choisie={choisie === 'fenetres'}
    role="button"
    tabindex="-1"
    aria-label={nomDe('fenetres')}
    onclick={() => choisir('fenetres')}
    onkeydown={(e) => auClavier(e, 'fenetres')}
  >
    <rect x="72" y="86" width="30" height="30" rx="2" />
    <rect x="118" y="86" width="30" height="30" rx="2" />
  </g>

  <g
    class="z {etatDe('plancher')}"
    class:choisie={choisie === 'plancher'}
    role="button"
    tabindex="-1"
    aria-label={nomDe('plancher')}
    onclick={() => choisir('plancher')}
    onkeydown={(e) => auClavier(e, 'plancher')}
  >
    <rect x="34" y="142" width="152" height="16" rx="2" />
  </g>

  <text x="110" y="112" text-anchor="middle" class="etiquette">chez vous</text>
</svg>
