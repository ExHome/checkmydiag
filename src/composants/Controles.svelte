<script lang="ts">
  /**
   * Ce qui cloche dans le dossier, en tête de page : c'est la raison d'être du
   * site. Le ton reste celui d'une vérification, pas d'une accusation.
   */
  import type { PointDeControle } from '../lib/modele';

  const { controles }: { controles: PointDeControle[] } = $props();

  const SYMBOLES: Record<PointDeControle['genre'], string> = {
    perime: '⏱',
    manque: '?',
    incoherence: '≠',
    attention: '!'
  };

  const INTRO: Record<PointDeControle['genre'], string> = {
    perime: 'Trop vieux',
    manque: 'Absent du dossier',
    incoherence: 'Ne concorde pas',
    attention: 'À vérifier'
  };
</script>

{#if controles.length}
  <section class="carte controles">
    <h2>À vérifier dans ce dossier</h2>
    <p class="chapeau muet">
      {controles.length === 1 ? 'Un point mérite' : `${controles.length} points méritent`} une
      question au vendeur ou au diagnostiqueur. Ce ne sont pas forcément des erreurs : il y a
      souvent une explication.
    </p>

    <ul>
      {#each controles as point (point.titre)}
        <li class={point.genre}>
          <span class="marque" aria-hidden="true">{SYMBOLES[point.genre]}</span>
          <div>
            <p class="titre">
              <span class="genre">{INTRO[point.genre]}</span>
              {point.titre}
            </p>
            <p class="explication">{point.explication}</p>
            <p class="action">{point.quoiFaire}</p>
          </div>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .controles {
    margin-bottom: 24px;
    border-left: 4px solid var(--attention);
  }

  h2 {
    margin-bottom: 4px;
  }

  .chapeau {
    font-size: 0.95rem;
    margin-bottom: 20px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 18px;
  }

  li {
    display: grid;
    grid-template-columns: 34px 1fr;
    gap: 12px;
    align-items: start;
  }

  .marque {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    font-weight: 700;
    font-size: 0.95rem;
    background: var(--attention-fond);
    color: var(--attention);
  }

  li.perime .marque {
    background: var(--alerte-fond);
    color: var(--alerte);
  }

  li.incoherence .marque {
    background: var(--alerte-fond);
    color: var(--alerte);
  }

  .titre {
    margin: 0 0 3px;
    font-weight: 600;
    font-size: 1.02rem;
  }

  .genre {
    display: inline-block;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 700;
    color: var(--encre-doux);
    margin-right: 6px;
    vertical-align: 1px;
  }

  .explication {
    margin: 0 0 4px;
    color: var(--encre-doux);
    font-size: 0.95rem;
  }

  .action {
    margin: 0;
    font-size: 0.95rem;
  }

  .action::before {
    content: '→ ';
    color: var(--vert-500);
    font-weight: 700;
  }
</style>
