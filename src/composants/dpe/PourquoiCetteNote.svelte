<script lang="ts">
  /**
   * POURQUOI CETTE NOTE — le lien entre le résultat et ses causes.
   *
   * L'écran ne répond pas « votre DPE est E ». Il répond « voici pourquoi ».
   *
   * Deux colonnes, et les deux comptent : ce qui tire vers le bas, et ce qui
   * est déjà performant. Un écran qui n'énumère que les défauts se lit comme un
   * réquisitoire et cesse d'être cru — alors qu'un propriétaire a besoin de
   * savoir aussi bien où mettre son argent que où ne pas le mettre.
   *
   * Chaque cause porte la donnée qui la fonde, écrite sous elle. C'est la
   * traçabilité : on doit toujours pouvoir répondre « pourquoi dis-tu cela ? ».
   *
   * Aucun pourcentage. L'ordre vient des surfaces que le rapport donne, et la
   * phrase sous la liste le dit — sans quoi le premier de la liste se lirait
   * comme « 40 % des pertes », ce que le rapport n'écrit nulle part.
   */
  import type { Cause } from '../../lib/analyse/pourquoi';
  import type { Lettre } from '../../lib/modele';

  const {
    finale = null,
    causes = [],
    dejaBien = []
  }: { finale?: Lettre | null; causes?: Cause[]; dejaBien?: Cause[] } = $props();

  const PICTO: Record<Cause['genre'], string> = {
    enveloppe: '▤',
    baie: '◫',
    systeme: '◉',
    ventilation: '≋'
  };
</script>

<section class="pourquoi" aria-labelledby="titre-pourquoi">
  <h2 id="titre-pourquoi">
    {#if finale}Pourquoi votre logement est classé {finale}{:else}Ce qui explique le résultat{/if}
  </h2>

  {#if causes.length === 0 && dejaBien.length === 0}
    <p class="rien">
      Le rapport n’en dit pas assez pour expliquer sa note : sa description du
      bâtiment n’a pas pu être lue. Rien n’est affiché ici plutôt qu’une
      explication vraisemblable.
    </p>
  {:else}
    {#if causes.length > 0}
      <h3>Ce qui tire la note vers le bas</h3>
      <ol class="causes">
        {#each causes as cause, i (cause.titre + i)}
          <li>
            <span class="picto" aria-hidden="true">{PICTO[cause.genre]}</span>
            <div>
              <b>{cause.titre}</b>
              {#if cause.surface > 0}<span class="metres"
                  >{cause.surface.toLocaleString('fr-FR')} m²</span
                >{/if}
              <p class="effet">{cause.effet}</p>
              {#if cause.preuve}
                <p class="preuve">Le rapport écrit : {cause.preuve}</p>
              {/if}
            </div>
          </li>
        {/each}
      </ol>
      <p class="ordre">
        Cette liste est classée par <b>surface concernée</b>, telle que le rapport la
        donne — pas par part des pertes. Le DPE ne chiffre nulle part la part de chaque
        poste : sa page de déperditions est une image.
      </p>
    {/if}

    {#if dejaBien.length > 0}
      <h3>Ce qui est déjà performant</h3>
      <ul class="bons">
        {#each dejaBien as bon, i (bon.titre + i)}
          <li>
            <span class="coche" aria-hidden="true">✓</span>
            <div>
              <b>{bon.titre}</b>
              <p class="effet">{bon.effet}</p>
              {#if bon.preuve}<p class="preuve">{bon.preuve}</p>{/if}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</section>

<style>
  .pourquoi {
    display: grid;
    gap: 0.8rem;
  }

  h2 {
    margin: 0;
    font-size: 1.05rem;
    color: var(--encre, #0a2b23);
  }

  h3 {
    margin: 0.3rem 0 0;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--encre-doux, #4a5a55);
  }

  .causes,
  .bons {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.6rem;
  }

  li {
    display: flex;
    gap: 0.6rem;
    padding: 0.7rem 0.85rem;
    border: 1px solid var(--verriere-sable-filet, #d8c199);
    border-radius: 8px;
    background: var(--papier, #fff);
  }

  .bons li {
    border-color: var(--vert-100, #e6ede4);
  }

  .picto,
  .coche {
    flex: none;
    font-size: 1rem;
    line-height: 1.3;
    color: var(--vert-verriere, #12463b);
  }

  li b {
    font-size: 0.9rem;
    color: var(--encre, #0a2b23);
  }

  .metres {
    margin-left: 0.4rem;
    padding: 0.05rem 0.4rem;
    border-radius: 999px;
    background: var(--surface, rgb(10 43 35 / 3%));
    font-size: 0.72rem;
    font-variant-numeric: tabular-nums;
    color: var(--encre-doux, #4a5a55);
  }

  .effet {
    margin: 0.2rem 0 0;
    font-size: 0.83rem;
    line-height: 1.5;
    color: var(--encre-doux, #4a5a55);
  }

  .preuve {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    line-height: 1.45;
    color: var(--verriere-sable-encre, #896c33);
  }

  .ordre,
  .rien {
    margin: 0;
    font-size: 0.8rem;
    line-height: 1.5;
    color: var(--encre-doux, #4a5a55);
  }

  .ordre {
    padding: 0.6rem 0.8rem;
    border-left: 3px solid var(--verriere-sable-or, #c8a96b);
    background: var(--verriere-sable-voile, rgb(200 169 107 / 16%));
    border-radius: 0 6px 6px 0;
  }
</style>
