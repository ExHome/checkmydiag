<script lang="ts">
  /**
   * Le plan du logement : on touche une zone, le rapport répond.
   *
   * Le dessin change d'un diagnostic à l'autre — une maison en coupe pour le
   * DPE, un tableau pour l'électricité, des couches de terrain pour les
   * risques —, mais le mécanisme est le même partout : des zones, une couleur
   * par état, et ce que le rapport dit quand on en touche une.
   *
   * Ce composant ne dessine rien lui-même. Il porte la mécanique : la sélection,
   * la fiche qui s'ouvre, le clavier. Le dessin arrive en `enfant`, avec les
   * zones déjà tirées du rapport.
   */
  import type { ZonePlan } from '../../lib/analyse/plan';
  import type { Snippet } from 'svelte';

  interface Props {
    zones: ZonePlan[];
    /** La couleur de l'application, pour les accents du plan. */
    teinte: string;
    /** Le dessin, qui reçoit les zones et la façon d'en désigner une. */
    enfant: Snippet<[{ zones: ZonePlan[]; choisir: (id: string) => void; choisie: string | null }]>;
    /** Ce qu'on écrit sous le plan quand le rapport ne détaille rien. */
    muet?: string;
  }

  const { zones, teinte, enfant, muet }: Props = $props();

  let choisie = $state<string | null>(null);

  function choisir(id: string): void {
    choisie = choisie === id ? null : id;
  }

  /** Les mots de l'état, pour qui n'a pas la couleur. */
  const MOTS: Record<ZonePlan['etat'], string> = {
    alerte: 'Le rapport signale',
    attention: 'À vérifier',
    bon: 'Rien de signalé ici',
    neutre: 'Le rapport ne tranche pas'
  };
</script>

{#if zones.length}
  <div class="plan" style="--teinte: {teinte}">
    <!-- Les hachures de « le rapport ne dit rien », définies une fois pour tous
         les dessins : sept définitions identiques finiraient par diverger. -->
    <svg class="defs" aria-hidden="true" focusable="false">
      <defs>
        <pattern
          id="hachures-plan"
          width="6"
          height="6"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <rect width="6" height="6" fill="var(--papier)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--gris)" stroke-width="2" opacity="0.45" />
        </pattern>
      </defs>
    </svg>

    <div class="dessin">
      {@render enfant({ zones, choisir, choisie })}
    </div>

    <!--
      La même chose en liste, sous le dessin.

      Un plan cliquable suppose qu'on voie le plan et qu'on vise juste. La liste
      dit exactement la même chose, se lit au clavier, s'imprime, et donne au
      lecteur pressé le tour du dossier sans un seul geste.
    -->
    <ul class="zones">
      {#each zones as z (z.id)}
        <li>
          <button
            type="button"
            class="zone {z.etat}"
            class:choisie={choisie === z.id}
            aria-expanded={choisie === z.id}
            onclick={() => choisir(z.id)}
          >
            <span class="pastille" aria-hidden="true"></span>
            <span class="nom">{z.nom}</span>
            <span class="etat">{MOTS[z.etat]}</span>
          </button>

          {#if choisie === z.id}
            <p class="dit">{z.dit}</p>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{:else if muet}
  <p class="muet">{muet}</p>
{/if}

<style>
  .plan {
    margin: var(--e4) 0;
  }

  /* Le porte-définitions ne se voit pas : il ne contient qu'un motif. */
  .defs {
    position: absolute;
    width: 0;
    height: 0;
  }

  .dessin {
    background: var(--papier);
    border: 1px solid var(--trait);
    border-radius: var(--rayon);
    padding: var(--e3);
    display: grid;
    justify-items: center;
  }

  .zones {
    list-style: none;
    margin: var(--e3) 0 0;
    padding: 0;
    display: grid;
    gap: var(--e1);
  }

  .zone {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--e2);
    min-height: 44px;
    padding: var(--e2) var(--e3);
    background: var(--papier);
    border: 1px solid var(--trait);
    border-radius: var(--rayon-badge);
    color: var(--sur-fond);
    font-size: var(--t-petit);
    text-align: left;
    cursor: pointer;
    transition: border-color var(--duree) var(--courbe), background var(--duree) var(--courbe);
  }

  .zone:hover,
  .zone.choisie {
    border-color: var(--teinte);
    background: var(--surface);
  }

  /* La forme d'abord, la couleur ensuite : le losange, le rond plein et le rond
     vide se distinguent sans qu'on ait à voir la teinte. */
  .pastille {
    flex: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid currentcolor;
  }

  .zone.alerte .pastille {
    background: var(--alerte);
    border-color: var(--alerte);
    border-radius: 2px;
    transform: rotate(45deg);
  }

  .zone.attention .pastille {
    background: var(--attention);
    border-color: var(--attention);
  }

  .zone.bon .pastille {
    background: transparent;
    border-color: var(--ok);
  }

  .zone.neutre .pastille {
    background: transparent;
    border-color: var(--gris);
    border-style: dashed;
  }

  .nom {
    flex: 1;
    font-weight: 700;
    min-width: 0;
  }

  .etat {
    flex: none;
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
  }

  /* Ce que dit le rapport. Il s'écrit sous la zone, pas dans une fenêtre par
     dessus : on veut pouvoir comparer deux zones sans rien refermer. */
  .dit {
    margin: var(--e1) 0 var(--e2);
    padding: var(--e3);
    background: var(--surface);
    border-left: 3px solid var(--teinte);
    border-radius: 0 var(--rayon-petit) var(--rayon-petit) 0;
    font-size: var(--t-petit);
    line-height: 1.55;
    color: var(--sur-fond);
  }

  .muet {
    margin: var(--e4) 0;
    padding: var(--e3);
    background: var(--surface);
    border-radius: var(--rayon);
    font-size: var(--t-petit);
    line-height: 1.55;
    color: var(--sur-fond-doux);
  }

  /* Le document imprimé montre tout : on ne peut pas y cliquer. */
  @media print {
    .dit {
      display: block;
    }
  }
</style>
