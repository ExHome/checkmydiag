<script lang="ts">
  /**
   * Ce que le rapport conclut, diagnostic par diagnostic.
   *
   * Ce ne sont pas nos commentaires : c'est la phrase de conclusion de chaque
   * partie du dossier, ramenée à sa ligne. Une ligne par diagnostic, un point
   * de couleur pour la gravité, et le renvoi vers la page où c'est écrit.
   *
   * Pas de tuiles, pas de compteurs : un relevé, comme un sommaire de rapport.
   */
  import type { Analyse, TypeDiag } from '../lib/modele';
  import { libelleCourt } from '../lib/libelle';

  interface Props {
    analyse: Analyse;
    /** Emmène le lecteur à la page où ce diagnostic est écrit. */
    allerA: (type: TypeDiag) => void;
  }

  const { analyse, allerA }: Props = $props();
</script>

<section class="conclusions">
  <p class="eyebrow">Ce que conclut le rapport</p>

  <ul>
    {#each analyse.diagnostics as d (d.type)}
      <li class={d.gravite}>
        <button type="button" onclick={() => allerA(d.type)}>
          <span class="quoi">{d.titre}</span>
          <span class="dit">{libelleCourt(d)}</span>
        </button>
      </li>
    {/each}
  </ul>
</section>

<style>
  .conclusions {
    margin-bottom: 30px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    /* Deux colonnes sur large écran : neuf lignes empilées font une liste, pas
       un relevé. */
    columns: 2;
    column-gap: 40px;
  }

  @media (max-width: 700px) {
    ul {
      columns: 1;
    }
  }

  li {
    break-inside: avoid;
  }

  button {
    display: flex;
    align-items: baseline;
    gap: 14px;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    border-bottom: 1px solid rgb(255 255 255 / 10%);
    padding: 11px 2px;
    cursor: pointer;
    color: var(--sur-fond);
    transition: border-color 0.2s ease;
  }

  button:hover {
    border-bottom-color: var(--trait-or);
  }

  /* Le nom du diagnostic, en petit : c'est la conclusion qu'on lit d'abord. */
  .quoi {
    flex: none;
    display: flex;
    align-items: center;
    gap: 9px;
    width: 12.5rem;
    font-size: 0.74rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  .quoi::before {
    content: '';
    flex: none;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--gravite, var(--gris));
  }

  .dit {
    font-family: var(--police-titre);
    font-weight: 500;
    font-size: 1.02rem;
    letter-spacing: -0.022em;
    line-height: 1.25;
  }

  li.bon {
    --gravite: #4c9c72;
  }
  li.attention {
    --gravite: #c98a2e;
  }
  li.alerte {
    --gravite: #c0503c;
  }
  li.neutre {
    --gravite: var(--gris);
  }
</style>
