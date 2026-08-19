<script lang="ts">
  /**
   * Les travaux que le DPE recommande — ses mots, pas les nôtres.
   *
   * Le rapport propose deux ensembles : les travaux essentiels, puis ceux à
   * envisager pour aller vers un logement très performant. La priorité vient de
   * lui, et les montants aussi.
   *
   * ── Ce qui est interdit ici ────────────────────────────────────────────────
   *
   * Pas de classe future promise, pas d'économies annoncées, pas de retour sur
   * investissement, et surtout **aucune addition** des deux enveloppes : ce sont
   * des travaux indépendants, et les cumuler donnerait un chiffre que le rapport
   * n'écrit nulle part. Le lecteur voit ce qui est imprimé, et il peut le
   * retrouver dans son PDF.
   */
  import type { Diagnostic } from '../lib/modele';

  const { dpe }: { dpe: Diagnostic } = $props();

  const packs = $derived(dpe.travaux ?? []);

  /** « 4600 à 6800 € » — l'espace fine insécable des milliers, comme en France. */
  function euros(n: number): string {
    return n.toLocaleString('fr-FR');
  }
</script>

{#if packs.length}
  <section class="travaux">
    <p class="quoi-bloc">Ce que le rapport recommande</p>
    <p class="chapeau">
      Votre DPE propose lui-même des travaux, avec un ordre de priorité et une estimation. Les
      voici tels qu’il les écrit.
    </p>

    {#each packs as pack (pack.rang)}
      <article class="pack">
        <header>
          <h5>{pack.intitule}</h5>
          {#if pack.cout}
            <p class="cout">
              {euros(pack.cout.de)} à {euros(pack.cout.a)}&nbsp;€
              <span class="mention">estimation du rapport</span>
            </p>
          {/if}
        </header>

        <ul class="postes">
          {#each pack.recommandations as reco (reco.lot + reco.description)}
            <li>
              <p class="lot">{reco.lot}</p>
              <p class="quoi">{reco.description}</p>
              {#if reco.performance}
                <p class="perf">Performance visée&nbsp;: <strong>{reco.performance}</strong></p>
              {/if}
            </li>
          {/each}
        </ul>
      </article>
    {/each}

    <!-- La réserve n'est pas une précaution de style : deux enveloppes de
         travaux indépendants ne s'additionnent pas, et un devis se fait sur
         place. Sans cette phrase, les montants se liraient comme un prix. -->
    <p class="reserve">
      Ces montants sont ceux du rapport, poste par poste. Ils ne s’additionnent pas en un budget
      total et ne remplacent pas un devis&nbsp;: seul un professionnel qui se déplace peut chiffrer
      votre logement.
    </p>
  </section>
{/if}

<style>
  .travaux {
    margin-top: var(--e5);
    padding-top: var(--e4);
    border-top: 1px solid var(--trait-or);
  }

  .quoi-bloc {
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    color: var(--or-fonce);
  }

  .chapeau {
    margin: 0 0 var(--e4);
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--sur-fond-doux);
    max-width: var(--mesure);
  }

  .pack {
    margin-bottom: var(--e4);
    padding: var(--e4);
    border: 1px solid var(--trait-fin);
    border-radius: var(--rayon);
  }

  .pack header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--e2);
    margin-bottom: var(--e3);
  }

  h5 {
    margin: 0;
    font-size: var(--t-base);
    font-weight: 700;
    color: var(--sur-fond);
  }

  .cout {
    margin: 0;
    font-size: var(--t-base);
    font-weight: 700;
    color: var(--sur-fond);
    font-variant-numeric: tabular-nums;
  }

  /* « estimation du rapport » : la provenance se lit avec le chiffre, sinon le
     chiffre passe pour le nôtre. */
  .mention {
    display: block;
    font-size: var(--t-micro);
    font-weight: 400;
    letter-spacing: var(--suivi);
    color: var(--sur-fond-doux);
  }

  .postes {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .postes li {
    padding: var(--e3) 0;
    border-top: 1px solid var(--trait-fin);
  }

  .postes li:first-child {
    border-top: 0;
    padding-top: 0;
  }

  .lot {
    margin: 0 0 var(--e1);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--or-fonce);
  }

  .quoi {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--sur-fond);
    max-width: var(--mesure);
  }

  .perf {
    margin: var(--e1) 0 0;
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
    font-variant-numeric: tabular-nums;
  }

  .reserve {
    margin: 0;
    font-size: var(--t-micro);
    line-height: 1.5;
    color: var(--sur-fond-doux);
    max-width: var(--mesure);
  }
</style>
