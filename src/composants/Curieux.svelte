<script lang="ts">
  /**
   * Le niveau « pour ceux qui veulent savoir » : un cerveau, et du savoir qui
   * ne sert à rien pour vendre — mais qui donne envie de lire.
   */
  import type { TypeDiag } from '../lib/modele';
  import { CURIOSITES } from '../lib/analyse/curieux';

  const { type }: { type: TypeDiag } = $props();

  const curiosite = $derived(CURIOSITES[type]);
</script>

{#if curiosite}
  <details class="curieux">
    <summary>
      <span class="cerveau" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 4.6a3 3 0 0 0-5.6-.9A2.7 2.7 0 0 0 3.7 7a2.8 2.8 0 0 0-.5 4.4A2.9 2.9 0 0 0 4.6 16a2.8 2.8 0 0 0 3.7 2.9A2.7 2.7 0 0 0 12 19.4Z" />
          <path d="M12 4.6a3 3 0 0 1 5.6-.9A2.7 2.7 0 0 1 20.3 7a2.8 2.8 0 0 1 .5 4.4A2.9 2.9 0 0 1 19.4 16a2.8 2.8 0 0 1-3.7 2.9A2.7 2.7 0 0 1 12 19.4Z" />
          <path d="M12 4.6v14.8" />
        </svg>
      </span>
      {curiosite.titre}
      <span class="mention">pour les curieux</span>
    </summary>

    <ul>
      {#each curiosite.points as point}
        <li>{point}</li>
      {/each}
    </ul>
  </details>
{/if}

<style>
  .curieux {
    margin-top: 12px;
    border-top: 1px solid var(--trait);
    padding-top: 14px;
  }

  summary {
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    font-size: 0.93rem;
    color: var(--vert-300);
    background: rgb(46 233 139 / 8%);
    border: 1px solid var(--trait);
    border-radius: 999px;
    padding: 8px 16px 8px 10px;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  summary:hover {
    background: rgb(46 233 139 / 16%);
    border-color: var(--vert-500);
  }

  summary::-webkit-details-marker {
    display: none;
  }

  .cerveau {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    flex: none;
    border-radius: 50%;
    background: rgb(46 233 139 / 16%);
  }

  .cerveau svg {
    width: 17px;
    height: 17px;
  }

  .mention {
    margin-left: auto;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--encre-doux);
  }

  ul {
    list-style: none;
    margin: 14px 0 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }

  li {
    position: relative;
    padding-left: 20px;
    font-size: 0.95rem;
    line-height: 1.45;
    color: var(--encre-doux);
  }

  li::before {
    content: '';
    position: absolute;
    left: 3px;
    top: 0.6em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--vert-500);
  }
</style>
