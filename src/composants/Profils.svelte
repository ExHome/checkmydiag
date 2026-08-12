<script lang="ts">
  /**
   * Le même dossier, lu selon qui regarde : celui qui vend, celui qui achète,
   * celui qui fait signer. Trois questions différentes, trois réponses.
   */
  import type { Analyse } from '../lib/modele';
  import { PROFILS, pointsPour, type Profil } from '../lib/profils';
  import Picto from './Picto.svelte';

  const { analyse }: { analyse: Analyse } = $props();

  let profil = $state<Profil>('proprietaire');
  const points = $derived(pointsPour(profil, analyse));
  const question = $derived(PROFILS.find((p) => p.id === profil)?.question ?? '');
</script>

<section class="carte profils">
  <h2>Pour vous, concrètement</h2>

  <div class="choix" role="tablist" aria-label="Votre situation">
    {#each PROFILS as p (p.id)}
      <button
        type="button"
        role="tab"
        aria-selected={profil === p.id}
        class:actif={profil === p.id}
        onclick={() => (profil = p.id)}
      >
        {p.nom}
      </button>
    {/each}
  </div>

  <p class="question">{question}</p>

  <ul>
    {#each points as point (point.quoi + point.donc)}
      <li class={point.ton}>
        {#if point.type}
          <span class="picto" aria-hidden="true"><Picto type={point.type} /></span>
        {:else}
          <span class="picto vide" aria-hidden="true"></span>
        {/if}
        <div>
          <p class="quoi">{point.quoi}</p>
          <p class="donc">{point.donc}</p>
        </div>
      </li>
    {/each}
  </ul>
</section>

<style>
  .profils {
    margin-bottom: 24px;
  }

  h2 {
    margin-bottom: 14px;
  }

  .choix {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .choix button {
    background: var(--papier-doux);
    border: 2px solid transparent;
    border-radius: 999px;
    padding: 10px 18px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 650;
    color: var(--encre-doux);
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }

  .choix button:hover {
    background: var(--vert-100);
  }

  .choix button.actif {
    background: var(--vert-700);
    border-color: var(--vert-700);
    color: #fff;
  }

  .question {
    font-size: 1.15rem;
    font-weight: 700;
    font-style: italic;
    margin: 0 0 16px;
    color: var(--vert-700);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
  }

  li {
    display: grid;
    grid-template-columns: 46px 1fr;
    gap: 14px;
    align-items: center;
    padding: 14px 16px;
    border-radius: 14px;
    border: 2px solid transparent;
  }

  li.bloque {
    background: linear-gradient(150deg, #fceeea, #f7dcd4);
    border-color: #f0c3b6;
  }

  li.coute {
    background: linear-gradient(150deg, #fdf3e0, #f8e6c6);
    border-color: #eed4a4;
  }

  li.verifier {
    background: var(--papier-doux);
    border-color: var(--trait);
  }

  li.ok {
    background: linear-gradient(150deg, #e8f6ee, #d5ecdf);
    border-color: #b9dfc9;
  }

  .picto {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: 13px;
    padding: 8px;
    background: rgb(255 255 255 / 75%);
  }

  .picto.vide {
    background: none;
  }

  li.bloque .picto {
    color: var(--alerte);
  }
  li.coute .picto {
    color: var(--attention);
  }
  li.ok .picto {
    color: var(--ok);
  }
  li.verifier .picto {
    color: var(--encre-doux);
  }

  .quoi {
    margin: 0;
    font-weight: 800;
    font-size: 1.05rem;
    letter-spacing: -0.01em;
  }

  .donc {
    margin: 2px 0 0;
    font-size: 0.94rem;
    color: var(--encre-doux);
  }
</style>
