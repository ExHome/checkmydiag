<script lang="ts">
  import type { Diagnostic } from '../lib/modele';
  import Schema from './Schema.svelte';
  import Explicatif from './schemas/Explicatif.svelte';

  const { diagnostic }: { diagnostic: Diagnostic } = $props();

  const ETIQUETTES_GRAVITE: Record<Diagnostic['gravite'], string> = {
    bon: 'Rien à signaler',
    attention: 'À regarder',
    alerte: 'Point important',
    neutre: 'Pour information'
  };

  // Quatre chiffres suffisent à l'écran ; le reste alourdit sans éclairer.
  const faitsVisibles = $derived(diagnostic.faits.slice(0, 4));

  // Quand le diagnostic engage vraiment le lecteur, les deux premières
  // conséquences restent à l'écran : ce sont les obligations et les délais. Le
  // reste — l'explication de fond — attend derrière « En savoir plus ».
  const urgent = $derived(diagnostic.gravite === 'alerte');
  const aFaireVisible = $derived(urgent ? diagnostic.aFaire.slice(0, 2) : []);
  const aFaireReste = $derived(urgent ? diagnostic.aFaire.slice(2) : diagnostic.aFaire);
</script>

<article class="carte diag">
  <header>
    <div class="titre">
      <h2>{diagnostic.titre}</h2>
      <span class="pastille {diagnostic.gravite}">{ETIQUETTES_GRAVITE[diagnostic.gravite]}</span>
    </div>
    <p class="verdict">{diagnostic.verdict}</p>
  </header>

  {#if faitsVisibles.length}
    <dl class="faits">
      {#each faitsVisibles as fait (fait.libelle)}
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

  <Explicatif type={diagnostic.type} />

  {#if aFaireVisible.length}
    <section class="bloc urgent">
      <h4>Ce que ça change pour vous</h4>
      <ul>
        {#each aFaireVisible as point}
          <li>{point}</li>
        {/each}
      </ul>
    </section>
  {/if}

  <details>
    <summary>En savoir plus</summary>

    <div class="detail">
      {#each diagnostic.explication as paragraphe}
        <p>{paragraphe}</p>
      {/each}

      {#if aFaireReste.length}
        <h4>{urgent ? 'Autres conséquences' : 'Ce que ça change pour vous'}</h4>
        <ul>
          {#each aFaireReste as point}
            <li>{point}</li>
          {/each}
        </ul>
      {/if}

      <p class="muet petit source">
        {#if diagnostic.source === 'synthese'}
          Verdict repris de la page de synthèse du dossier (pages {diagnostic.pages[0]} à
          {diagnostic.pages[1]}) : le rapport détaillé n’a pas pu être lu automatiquement.
        {:else}
          Rapport, pages {diagnostic.pages[0]} à {diagnostic.pages[1]}
        {/if}
      </p>
    </div>
  </details>
</article>

<style>
  .diag {
    margin-bottom: 20px;
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
    font-size: 1.12rem;
    margin: 10px 0 0;
    text-wrap: pretty;
  }

  .faits {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 14px;
    margin: 20px 0 0;
    padding: 16px 0 0;
    border-top: 1px solid var(--trait);
  }

  .faits div {
    min-width: 0;
  }

  dt {
    font-size: 0.8rem;
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
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--trait);
  }

  details {
    margin-top: 22px;
    border-top: 1px solid var(--trait);
    padding-top: 14px;
  }

  summary {
    cursor: pointer;
    font-weight: 600;
    font-size: 0.94rem;
    color: var(--vert-500);
    list-style: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary::before {
    content: '';
    width: 7px;
    height: 7px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(-45deg);
    transition: transform 0.2s ease;
  }

  details[open] summary::before {
    transform: rotate(45deg);
  }

  .detail {
    padding-top: 14px;
  }

  h4 {
    font-family: var(--police);
    font-size: 0.95rem;
    margin: 20px 0 8px;
  }

  .urgent h4 {
    margin-top: 0;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.9rem;
    color: var(--alerte);
  }

  ul {
    margin: 0;
    padding-left: 1.2em;
  }

  li {
    margin-bottom: 8px;
  }

  .source {
    margin: 18px 0 0;
  }
</style>
