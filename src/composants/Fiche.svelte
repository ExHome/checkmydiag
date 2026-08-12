<script lang="ts">
  /**
   * Les quatre questions, toujours dans le même ordre : pourquoi, comment,
   * risque, quoi faire. Une phrase chacune, une icône pour repérer d'un coup
   * d'œil — c'est le squelette de toute explication du site.
   */
  import type { TypeDiag } from '../lib/modele';
  import { FICHES } from '../lib/analyse/fiches';

  const { type }: { type: TypeDiag } = $props();

  const fiche = $derived(FICHES[type]);

  const BLOCS = [
    { cle: 'pourquoi', mot: 'Pourquoi', icone: 'question' },
    { cle: 'comment', mot: 'Comment', icone: 'loupe' },
    { cle: 'risque', mot: 'Le risque', icone: 'alerte' },
    { cle: 'quoiFaire', mot: 'Quoi faire', icone: 'action' }
  ] as const;
</script>

<ul class="fiche">
  {#each BLOCS as bloc (bloc.cle)}
    <li class={bloc.icone}>
      <span class="icone" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          {#if bloc.icone === 'question'}
            <circle cx="12" cy="12" r="9.5" />
            <path d="M9.4 9a2.7 2.7 0 1 1 3.4 2.6c-.6.2-.9.7-.9 1.3v.6" />
            <path d="M12 17.2h.01" />
          {:else if bloc.icone === 'loupe'}
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.5 15.5 21 21" />
          {:else if bloc.icone === 'alerte'}
            <path d="M12 3.6 21.2 19.4H2.8L12 3.6Z" />
            <path d="M12 9.8v4" />
            <path d="M12 16.6h.01" />
          {:else}
            <path d="M4.5 12.5 10 18 20 6.5" />
          {/if}
        </svg>
      </span>
      <div>
        <p class="mot">{bloc.mot}</p>
        <p class="texte">{fiche[bloc.cle]}</p>
      </div>
    </li>
  {/each}
</ul>

<style>
  .fiche {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
  }

  li {
    display: grid;
    grid-template-columns: 40px 1fr;
    gap: 12px;
    align-items: start;
    background: rgb(255 255 255 / 3%);
    border: 1px solid var(--trait);
    border-radius: var(--rayon-petit);
    padding: 12px 14px;
  }

  .icone {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgb(46 233 139 / 12%);
    color: var(--vert-500);
  }

  .icone svg {
    width: 19px;
    height: 19px;
  }

  li.alerte .icone {
    background: rgb(255 95 109 / 14%);
    color: var(--alerte);
  }

  li.action .icone {
    background: rgb(255 200 87 / 16%);
    color: var(--or);
  }

  .mot {
    margin: 0 0 2px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--encre-doux);
  }

  li.alerte .mot {
    color: var(--alerte);
  }

  li.action .mot {
    color: var(--or);
  }

  .texte {
    margin: 0;
    font-size: 0.96rem;
    line-height: 1.5;
    text-wrap: pretty;
  }
</style>
