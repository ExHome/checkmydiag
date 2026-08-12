<script lang="ts">
  import type { Diagnostic } from '../lib/modele';
  import Schema from './Schema.svelte';

  const { diagnostic }: { diagnostic: Diagnostic } = $props();

  const ETIQUETTES_GRAVITE: Record<Diagnostic['gravite'], string> = {
    bon: 'Rien à signaler',
    attention: 'À regarder',
    alerte: 'Point important',
    neutre: 'Pour information'
  };
</script>

<article class="carte diag">
  <header>
    <div class="titre">
      <h2>{diagnostic.titre}</h2>
      <span class="pastille {diagnostic.gravite}">{ETIQUETTES_GRAVITE[diagnostic.gravite]}</span>
    </div>
    <p class="verdict">{diagnostic.verdict}</p>
  </header>

  {#if diagnostic.faits.length}
    <dl class="faits">
      {#each diagnostic.faits as fait (fait.libelle)}
        <div>
          <dt>{fait.libelle}</dt>
          <dd>
            {fait.valeur}
            {#if fait.precision}<span class="muet petit">{fait.precision}</span>{/if}
          </dd>
        </div>
      {/each}
    </dl>
  {/if}

  {#if diagnostic.schema}
    <section class="bloc">
      <Schema schema={diagnostic.schema} />
    </section>
  {/if}

  <section class="bloc">
    <h3>Ce que ça veut dire</h3>
    {#each diagnostic.explication as paragraphe}
      <p>{paragraphe}</p>
    {/each}
  </section>

  {#if diagnostic.aFaire.length}
    <section class="bloc">
      <h3>Ce que ça change pour vous</h3>
      <ul>
        {#each diagnostic.aFaire as point}
          <li>{point}</li>
        {/each}
      </ul>
    </section>
  {/if}

  <footer class="muet petit">
    {#if diagnostic.source === 'synthese'}
      Verdict repris de la page de synthèse du dossier (pages {diagnostic.pages[0]} à
      {diagnostic.pages[1]}) : le rapport détaillé n’a pas pu être lu automatiquement.
    {:else}
      Rapport, pages {diagnostic.pages[0]} à {diagnostic.pages[1]}
    {/if}
  </footer>
</article>

<style>
  .diag {
    margin-bottom: 24px;
  }

  .titre {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 12px;
    justify-content: space-between;
  }

  h2 {
    margin: 0;
  }

  .pastille {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 999px;
    padding: 4px 12px;
    white-space: nowrap;
  }

  .pastille.bon {
    background: var(--ok-fond);
    color: var(--ok);
  }
  .pastille.attention {
    background: var(--attention-fond);
    color: var(--attention);
  }
  .pastille.alerte {
    background: var(--alerte-fond);
    color: var(--alerte);
  }
  .pastille.neutre {
    background: var(--papier-doux);
    color: var(--encre-doux);
  }

  .verdict {
    font-size: 1.1rem;
    margin: 10px 0 0;
  }

  .faits {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 14px;
    margin: 22px 0 0;
    padding: 18px 0 0;
    border-top: 1px solid var(--trait);
  }

  .faits div {
    min-width: 0;
  }

  dt {
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--encre-doux);
  }

  dd {
    margin: 2px 0 0;
    font-size: 1.05rem;
    font-weight: 600;
  }

  dd .muet {
    display: block;
    font-weight: 400;
  }

  .bloc {
    margin-top: 26px;
    padding-top: 20px;
    border-top: 1px solid var(--trait);
  }

  h3 {
    font-family: var(--police);
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--encre-doux);
    margin-bottom: 10px;
  }

  ul {
    margin: 0;
    padding-left: 1.2em;
  }

  li {
    margin-bottom: 8px;
  }

  footer {
    margin-top: 20px;
  }
</style>
