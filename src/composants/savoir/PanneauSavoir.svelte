<script lang="ts">
  /**
   * Le panneau d'exploration : une couche qui se pose sur le schéma, jamais une
   * nouvelle page (§ 14).
   *
   * On y trouve, dans cet ordre : d'où l'on vient (le fil d'Ariane), le mot
   * exact et sa définition en une phrase (§ 9), son dessin, puis les questions —
   * fermées. Le lecteur en ouvre une à la fois : il ne voit jamais toute
   * l'arborescence (§ 3).
   *
   * « Et chez moi ? » est toujours la dernière, et elle ne ment pas : si le
   * rapport ne dit rien, elle le dit (§ 10).
   */
  import { exploration } from '../../lib/savoir/pile.svelte';
  import { QUESTIONS, registreDe, type Niveau } from '../../lib/savoir/notions';
  import MiniSchema from '../MiniSchema.svelte';
  import Bribe from './Bribe.svelte';

  /** Le libellé de chaque registre — le lecteur doit savoir ce qu'il lit (§ 15). */
  const REGISTRES = {
    fait: 'Ce que dit le diagnostic',
    explication: 'Ce que cela signifie',
    hypothese: 'Ce qui peut l’expliquer',
    piste: 'Ce qui peut être envisagé'
  } as const;

  let ouvert = $state<number | null>(null);

  const courante = $derived(exploration.courante);
  const chezMoi = $derived(
    courante?.chezMoi && exploration.personnalise
      ? courante.chezMoi(exploration.dossier)
      : null
  );

  // Changer de notion referme les questions : on repart du dessin.
  $effect(() => {
    void courante?.id;
    ouvert = null;
  });

  function basculer(rang: number): void {
    ouvert = ouvert === rang ? null : rang;
  }

  const question = (n: Niveau): string => n.question ?? QUESTIONS[n.rang];
</script>

{#if courante}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="voile" onclick={() => exploration.fermer()}></div>

  <aside class="panneau apparait" aria-label="Explication : {courante.terme}">
    <header>
      <nav class="fil" aria-label="Chemin parcouru">
        {#each exploration.chemin as etape, i (etape.id)}
          {#if i < exploration.chemin.length - 1}
            <button type="button" class="retour" onclick={() => exploration.revenirA(i)}>
              {etape.terme}
            </button>
            <span class="separateur" aria-hidden="true">›</span>
          {:else}
            <span class="ici">{etape.terme}</span>
          {/if}
        {/each}
      </nav>
      <button type="button" class="fermer" onclick={() => exploration.fermer()} aria-label="Fermer">
        ✕
      </button>
    </header>

    <p class="definition">{courante.definition}</p>

    {#if courante.schema}
      <div class="dessin"><MiniSchema id={courante.schema} /></div>
    {/if}

    <ul class="questions">
      {#each courante.niveaux as niveau (niveau.rang)}
        {@const registre = registreDe(niveau)}
        <li>
          <button
            type="button"
            class="question"
            class:ouverte={ouvert === niveau.rang}
            aria-expanded={ouvert === niveau.rang}
            onclick={() => basculer(niveau.rang)}
          >
            <span class="chevron" aria-hidden="true">{ouvert === niveau.rang ? '−' : '+'}</span>
            {question(niveau)}
          </button>

          {#if ouvert === niveau.rang}
            <div class="reponse apparait {registre}">
              <p class="registre">{REGISTRES[registre]}</p>
              <ul class="bribes">
                {#each niveau.bribes as bribe, i (i)}
                  <Bribe {bribe} />
                {/each}
              </ul>
            </div>
          {/if}
        </li>
      {/each}

      <!-- Le niveau 8 : toujours là quand un rapport a été déposé. -->
      {#if exploration.personnalise}
        <li>
          <button
            type="button"
            class="question chez-moi"
            class:ouverte={ouvert === 8}
            aria-expanded={ouvert === 8}
            onclick={() => basculer(8)}
          >
            <span class="chevron" aria-hidden="true">{ouvert === 8 ? '−' : '+'}</span>
            {QUESTIONS[8]}
          </button>

          {#if ouvert === 8}
            <div class="reponse apparait fait">
              <p class="registre">{REGISTRES.fait}</p>
              {#if chezMoi?.etat === 'dit'}
                <p class="dit">{chezMoi.phrase}</p>
              {:else if chezMoi?.etat === 'muet'}
                <p class="muet-dit">{chezMoi.phrase}</p>
              {:else}
                <p class="muet-dit">
                  Votre dossier ne contient pas le diagnostic qui parle de ce point.
                </p>
              {/if}
              <p class="reserve">
                Le rapport signé reste la référence : Verrière n’a aucune valeur
                réglementaire.
              </p>
            </div>
          {/if}
        </li>
      {/if}
    </ul>
  </aside>
{/if}

<style>
  .voile {
    position: fixed;
    inset: 0;
    background: rgb(9 20 16 / 34%);
    z-index: 40;
  }

  .panneau {
    position: fixed;
    z-index: 41;
    inset: auto 0 0 0;
    max-height: 82vh;
    overflow-y: auto;
    background: var(--papier);
    color: var(--encre);
    border-top: 3px solid var(--verriere-sable-or);
    border-radius: var(--rayon) var(--rayon) 0 0;
    padding: var(--e4) var(--e4) var(--e5);
    box-shadow: var(--ombre-forte);
  }

  @media (min-width: 780px) {
    .panneau {
      inset: 0 0 0 auto;
      width: min(430px, 92vw);
      max-height: none;
      border-top: none;
      border-left: 3px solid var(--verriere-sable-or);
      border-radius: 0;
    }
  }

  header {
    display: flex;
    align-items: start;
    gap: var(--e3);
    margin-bottom: var(--e2);
  }

  .fil {
    flex: 1;
    font-size: var(--t-petit);
    line-height: 1.5;
  }

  .retour {
    font: inherit;
    background: none;
    border: none;
    padding: 0;
    color: var(--verriere-vert-profond);
    text-decoration: underline;
    cursor: pointer;
  }

  .separateur {
    color: var(--gris);
    margin: 0 var(--e1);
  }

  .ici {
    font-family: var(--police-titre);
    font-size: var(--t-lead);
    font-weight: 700;
    color: var(--vert-700);
    display: block;
    margin-top: var(--e1);
  }

  .fermer {
    font: inherit;
    background: none;
    border: 1px solid var(--trait);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    color: var(--encre-doux);
    flex: none;
  }

  .definition {
    margin: 0 0 var(--e4);
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--encre);
  }

  .dessin {
    margin-bottom: var(--e4);
  }

  .questions,
  .bribes {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .questions > li {
    border-top: 1px solid var(--trait-fin);
  }

  .question {
    display: flex;
    align-items: center;
    gap: var(--e2);
    width: 100%;
    font: inherit;
    font-weight: 650;
    text-align: left;
    background: none;
    border: none;
    padding: var(--e3) 0;
    cursor: pointer;
    color: var(--encre);
  }

  .question:hover {
    color: var(--verriere-vert-profond);
  }

  .chevron {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    flex: none;
    border-radius: 50%;
    background: var(--vert-100);
    color: var(--vert-700);
    font-weight: 800;
    font-size: var(--t-base);
  }

  .question.chez-moi .chevron {
    background: var(--verriere-sable-voile);
    color: var(--verriere-vert-profond);
  }

  /* Les quatre registres se distinguent au trait, pas au ton (§ 15). */
  .reponse {
    padding: var(--e1) 0 var(--e4) var(--e5);
    border-left: 2px solid var(--trait);
    margin-left: var(--e2);
    font-size: var(--t-base);
  }

  .reponse.fait {
    border-left-color: var(--vert-500);
  }

  .reponse.explication {
    border-left-color: var(--verriere-sable-or);
  }

  .reponse.hypothese {
    border-left-style: dashed;
    border-left-color: var(--gris);
  }

  .reponse.piste {
    border-left-style: dotted;
    border-left-color: var(--vert-300);
  }

  .registre {
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    letter-spacing: var(--suivi);
    font-weight: 700;
    color: var(--gris);
  }

  .dit {
    margin: 0;
    font-weight: 600;
  }

  .muet-dit {
    margin: 0;
    color: var(--encre-doux);
  }

  .reserve {
    margin: var(--e2) 0 0;
    font-size: var(--t-petit);
    color: var(--gris);
  }
</style>
