<script lang="ts">
  /**
   * Le ruban A→G.
   *
   * C'est la signature de la maison : sur les plaquettes DGLM, l'échelle du DPE
   * n'est pas un graphique parmi d'autres, c'est le motif de marque. On la
   * reprend ici comme filet — sous les titres, entre les sections — pour qu'on
   * pense « diagnostic » avant d'avoir lu un mot.
   */
  const { epaisseur = 8, lettres = false }: { epaisseur?: number; lettres?: boolean } = $props();

  const ECHELONS = [
    { lettre: 'A', couleur: '#319834' },
    { lettre: 'B', couleur: '#33cc31' },
    { lettre: 'C', couleur: '#cbfc34' },
    { lettre: 'D', couleur: '#fbfe06' },
    { lettre: 'E', couleur: '#fbcc05' },
    { lettre: 'F', couleur: '#fc9935' },
    { lettre: 'G', couleur: '#fc0205' }
  ];
</script>

<div class="ruban" style:--epaisseur="{epaisseur}px" aria-hidden="true">
  {#each ECHELONS as e (e.lettre)}
    <span class="echelon" style:background={e.couleur}>
      {#if lettres}<b style:color={e.lettre === 'C' || e.lettre === 'D' ? '#16241e' : '#fff'}
          >{e.lettre}</b
        >{/if}
    </span>
  {/each}
</div>

<style>
  .ruban {
    display: flex;
    gap: 3px;
    align-items: stretch;
  }

  .echelon {
    flex: 1;
    height: var(--epaisseur);
    border-radius: 2px;
    display: grid;
    place-items: center;
    /* Chaque échelon pointe vers la droite, comme les flèches du rapport. */
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 50%, calc(100% - 5px) 100%, 0 100%);
  }

  b {
    font-size: var(--t-micro);
    font-weight: 900;
    letter-spacing: 0;
  }
</style>
