<script lang="ts">
  /**
   * Tout ce que le rapport signale, point par point.
   *
   * Règle du produit : *exhaustif dans le fond, sélectif dans l'affichage*.
   * Cette liste est le fond — elle ne trie pas par intérêt, elle ne coupe pas
   * à cinq, elle ne garde pas « les principales ». Si le rapport en énumère
   * dix-sept, il y en a dix-sept.
   *
   * Ce qui hiérarchise, c'est l'ordre et le filtre, jamais l'omission : le
   * filtre « tout » existe toujours et reste sélectionné par défaut.
   */
  import type { Diagnostic } from '../lib/modele';
  import MotsExpliques from './MotsExpliques.svelte';

  type Releve = NonNullable<Diagnostic['releves']>[number];

  const { releves, page }: { releves: Releve[]; page?: number } = $props();

  /** Les familles présentes, dans l'ordre où elles engagent le lecteur. */
  const ORDRE: { genre: Releve['genre']; nom: string }[] = [
    { genre: 'anomalie', nom: 'Ce qui ne va pas' },
    { genre: 'complement', nom: 'À savoir' },
    { genre: 'nonVerifie', nom: 'Non vérifié' },
    { genre: 'nonVisite', nom: 'Non visité' }
  ];

  let filtre = $state<Releve['genre'] | 'tout'>('tout');

  const familles = $derived(
    ORDRE.map((f) => ({ ...f, liste: releves.filter((r) => r.genre === f.genre) })).filter(
      (f) => f.liste.length > 0
    )
  );

  const visibles = $derived(filtre === 'tout' ? releves : releves.filter((r) => r.genre === filtre));
</script>

<section class="releves" aria-label="Tous les points du rapport">
  <header class="tete">
    <p class="compte">
      <strong>{releves.length}</strong>
      {releves.length > 1 ? 'points relevés' : 'point relevé'}
      <span class="tous">· {releves.length} restitué{releves.length > 1 ? 's' : ''}</span>
    </p>

    {#if familles.length > 1}
      <!-- « Tout » d'abord, et sélectionné par défaut : on n'entre jamais dans
           cette liste par un sous-ensemble. -->
      <div class="filtres" role="group" aria-label="Filtrer les points">
        <button type="button" class:actif={filtre === 'tout'} onclick={() => (filtre = 'tout')}>
          Tout <span class="n">{releves.length}</span>
        </button>
        {#each familles as f (f.genre)}
          <button type="button" class:actif={filtre === f.genre} onclick={() => (filtre = f.genre)}>
            {f.nom} <span class="n">{f.liste.length}</span>
          </button>
        {/each}
      </div>
    {/if}
  </header>

  <ol class="liste">
    {#each visibles as r, i (r.libelle + i)}
      <li class={r.genre}>
        <span class="rang">{String(i + 1).padStart(2, '0')}</span>
        <div class="quoi">
          {#if r.ou}<p class="ou">{r.ou}</p>{/if}
          <p class="libelle"><MotsExpliques texte={r.libelle} /></p>
          {#if r.code}<p class="code">{r.code}</p>{/if}
        </div>
      </li>
    {/each}
  </ol>

  {#if page}
    <p class="source">Énumérés page {page} du rapport.</p>
  {/if}
</section>

<style>
  /* Pas de carte : une liste. Le rythme vient des filets et de l'espace, pas
     d'un cadre de plus autour de ce qui est déjà dans un cadre. */
  .releves {
    margin-top: var(--e5);
    border-top: 1px solid var(--trait-or);
    padding-top: var(--e4);
  }

  .tete {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--e3);
    margin-bottom: var(--e4);
  }

  .compte {
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
    margin: 0;
  }

  .compte strong {
    font-family: var(--police-titre);
    font-size: var(--t-lead);
    color: var(--or-clair);
    font-weight: 500;
  }

  /* La preuve de sérieux : autant relevés que restitués. Discrète — elle
     rassure celui qui la cherche, elle n'interpelle pas les autres. */
  .tous {
    opacity: 0.75;
  }

  .filtres {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e1);
  }

  .filtres button {
    background: none;
    border: none;
    border-bottom: 1px solid transparent;
    padding: var(--e1) var(--e2);
    min-height: 44px;
    font: inherit;
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
    cursor: pointer;
  }

  .filtres button:hover {
    color: var(--sur-fond);
  }

  .filtres button.actif {
    color: var(--or-clair);
    border-bottom-color: var(--or);
  }

  .filtres .n {
    opacity: 0.6;
    font-variant-numeric: tabular-nums;
  }

  .liste {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .liste li {
    display: grid;
    grid-template-columns: 2.4rem 1fr;
    gap: var(--e3);
    padding: var(--e3) 0;
    border-top: 1px solid var(--trait-fin);
  }

  .liste li:first-child {
    border-top: none;
  }

  /* Le numéro fait le rythme et prouve l'exhaustivité : on voit qu'on va
     jusqu'au bout. */
  .rang {
    font-family: var(--mono);
    font-size: var(--t-petit);
    color: var(--or);
    padding-top: 0.15em;
    font-variant-numeric: tabular-nums;
  }

  .quoi {
    min-width: 0;
  }

  .ou {
    font-size: var(--t-petit);
    letter-spacing: var(--suivi-serre);
    text-transform: uppercase;
    color: var(--or-clair);
    margin: 0 0 2px;
  }

  .libelle {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--sur-fond);
  }

  .code {
    margin: 4px 0 0;
    font-family: var(--mono);
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
  }

  /* Ce qui n'a pas pu être contrôlé se lit autrement : ce n'est pas un défaut
     du logement, c'est une limite du rapport. */
  .liste li.nonVisite .libelle,
  .liste li.nonVerifie .libelle {
    color: var(--sur-fond-doux);
    font-style: italic;
  }

  .liste li.nonVisite .rang,
  .liste li.nonVerifie .rang {
    color: var(--sur-fond-doux);
  }

  .source {
    margin: var(--e3) 0 0;
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  @media (max-width: 720px) {
    .liste li {
      grid-template-columns: 1.9rem 1fr;
      gap: var(--e2);
    }
  }
</style>
