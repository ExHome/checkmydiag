<script lang="ts">
  /**
   * LES TRAVAUX — ce que le rapport recommande, dans sa propre hiérarchie.
   *
   * ── Deux packs, et c'est le rapport qui les ordonne ────────────────────────
   *
   * « Les travaux essentiels » d'abord, « Les travaux à envisager » ensuite. Ce
   * n'est pas notre classement : c'est celui du DPE, et son montant estimé va
   * avec. On ne recalcule rien, on ne réordonne rien.
   *
   * ── Le scénario après travaux, et ce qui manque ────────────────────────────
   *
   * Le rapport promet une « Évolution de la performance après travaux » avec
   * les lettres projetées. **Ces lettres sont en image**, comme l'étiquette :
   * sur les vingt-six volets lus, aucune n'existe en texte. On écrit donc, en
   * clair, qu'on ne peut pas les montrer — plutôt que de laisser croire à un
   * « E → C » qu'on aurait deviné.
   *
   * ── Les gestes ─────────────────────────────────────────────────────────────
   *
   * Les recommandations d'entretien ne sont pas des travaux : ce sont des
   * gestes, sans devis. Elles ont leur propre bloc, replié — priorité 3.
   */
  import type { PosteDeperditionChiffre } from '../../lib/ademe/consultation';
  import type { Enveloppe } from '../../lib/analyse/enveloppe';
  import { parOuCommencer, prioriserLesTravaux } from '../../lib/analyse/priorite';
  import type { Travaux } from '../../lib/analyse/travaux';

  const {
    travaux,
    enveloppe = null,
    chiffres = []
  }: {
    travaux: Travaux;
    /** Le bâtiment lu, pour relier chaque travail aux parois qu'il concerne. */
    enveloppe?: Enveloppe | null;
    /** Les parts de déperdition réelles, quand la fiche ADEME a répondu. */
    chiffres?: PosteDeperditionChiffre[];
  } = $props();

  /*
   * ── PAR OÙ COMMENCER ──────────────────────────────────────────────────────
   *
   * La maquette proposait une colonne « économie estimée ~ 320 € / an ». Ce
   * chiffre n'existe nulle part : ni dans les vingt-six rapports lus, ni dans la
   * base de l'ADEME, où les champs `economie`, `gain` et `travaux` sont absents.
   *
   * On répond à la même question — par où commencer ? — avec deux données
   * réelles croisées : la consigne et sa performance visée viennent du rapport,
   * la part de pertes vient de la fiche ADEME du même DPE. Le croisement est une
   * addition, pas une estimation.
   */
  const priorises = $derived(
    enveloppe ? prioriserLesTravaux(travaux.packs, enveloppe, chiffres) : []
  );
  const premier = $derived(parOuCommencer(priorises));

  function porteeDe(lot: string | null, pack: string) {
    return priorises.find((t) => t.lot === lot && t.pack === pack)?.portee ?? { genre: 'inconnue' };
  }

  function paroisDe(lot: string | null, pack: string) {
    return priorises.find((t) => t.lot === lot && t.pack === pack)?.parois ?? [];
  }

  const part = (n: number) => `${(n * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;

  let gestesOuverts = $state(false);
</script>

<section class="travaux" aria-labelledby="titre-travaux">
  <h2 id="titre-travaux">Les travaux que le rapport recommande</h2>

  <!--
    La phrase que le rapport ne dit jamais : lequel de ses travaux touche le plus
    gros poste de pertes. Elle n'apparaît que si on a vraiment la part.
  -->
  {#if premier && premier.portee.genre === 'part'}
    <p class="commencer">
      <b>Par où commencer :</b>
      {premier.lot ?? 'ce travail'} — il agit sur
      <b>{part(premier.portee.part)}</b> des pertes de votre logement, c’est le poste le
      plus lourd que le rapport propose de traiter.
    </p>
  {/if}

  {#if !travaux.presente || travaux.packs.length === 0}
    <p class="rien">
      Ce rapport ne porte pas de tableau de recommandations lisible. Rien n’est
      affiché ici plutôt qu’un plan de travaux reconstitué.
    </p>
  {:else}
    {#each travaux.packs as pack (pack.titre)}
      <article class="pack" class:prioritaire={pack.priorite === 1}>
        <header>
          <h3>
            <span class="rang" aria-hidden="true">{pack.priorite}</span>
            {pack.titre}
          </h3>
          {#if pack.montant}
            <p class="montant">
              Montant estimé par le rapport : <b>{pack.montant}</b>
            </p>
          {/if}
        </header>

        {#if pack.recommandations.length === 0}
          <p class="rien">Le rapport n’inscrit aucun travail dans ce pack.</p>
        {:else}
          <ul>
            {#each pack.recommandations as r, i (r.lot ?? i)}
              {@const portee = porteeDe(r.lot, pack.titre)}
              {@const parois = paroisDe(r.lot, pack.titre)}
              <li>
                <div class="tete">
                  <b>{r.lot ?? 'Poste non nommé'}</b>
                  {#if r.performance}<span class="perf">{r.performance}</span>{/if}
                </div>
                {#if portee.genre === 'part'}
                  <p class="portee">
                    Agit sur <b>{part(portee.part)}</b> des pertes — {portee.poste.toLowerCase()}.
                  </p>
                {:else if portee.genre === 'hors enveloppe'}
                  <!--
                    Ce n'est pas une donnée manquante : changer une chaudière ne
                    réduit aucune perte, le logement perd toujours autant. Une
                    case vide se lirait « on ne sait pas », alors qu'on sait.
                  -->
                  <p class="portee hors">
                    N’agit pas sur les pertes : change la façon dont elles sont compensées.
                  </p>
                {/if}
                {#if parois.length > 0}
                  <p class="parois">
                    Concerne : {parois
                      .map(
                        (x) =>
                          `${x.nom ?? 'une paroi'}${x.surface ? ` (${x.surface.toLocaleString('fr-FR')} m²)` : ''}`
                      )
                      .join(' · ')}
                  </p>
                {/if}
                <p class="consigne">{r.description}</p>
              </li>
            {/each}
          </ul>
        {/if}
      </article>
    {/each}

    {#if travaux.commentaires}
      <!--
        Le mot du diagnostiqueur. C'est souvent la ligne la plus utile du
        rapport — celle qui dit qu'il faudra l'accord de la copropriété — et
        elle est imprimée en petit, sous un tableau, où personne ne la lit.
      -->
      <p class="commentaire">
        <b>Le mot du diagnostiqueur :</b>
        {travaux.commentaires}
      </p>
    {/if}

    {#if !travaux.classesApresTravaux}
      <p class="manque">
        Le rapport annonce une <b>évolution de la performance après travaux</b>. Les
        lettres projetées sont dessinées, pas écrites : aucun programme ne peut les
        lire. Elles figurent sur votre PDF, à la page des recommandations.
      </p>
    {/if}

    {#if travaux.gestes.length > 0}
      <div class="gestes">
        <button
          type="button"
          aria-expanded={gestesOuverts}
          onclick={() => (gestesOuverts = !gestesOuverts)}
        >
          {gestesOuverts ? '−' : '+'} Les gestes d’entretien recommandés ({travaux.gestes.length})
        </button>
        {#if gestesOuverts}
          <ul class="liste-gestes">
            {#each travaux.gestes as g (g.poste)}
              <li><b>{g.poste}</b> — {g.conseil}</li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  {/if}
</section>

<style>
  .travaux {
    display: grid;
    gap: 0.8rem;
  }

  h2 {
    margin: 0;
    font-size: 1.05rem;
    color: var(--encre, #0a2b23);
  }

  h3 {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0;
    font-size: 0.92rem;
    color: var(--encre, #0a2b23);
  }

  .rang {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.35rem;
    height: 1.35rem;
    border-radius: 50%;
    background: var(--vert-verriere, #12463b);
    color: var(--ivoire, #f7f6f2);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .pack {
    display: grid;
    gap: 0.5rem;
    padding: 0.85rem 0.95rem;
    border: 1px solid var(--verriere-sable-filet, #d8c199);
    border-radius: 8px;
    background: var(--papier, #fff);
  }

  .pack.prioritaire {
    border-left: 3px solid var(--vert-verriere, #12463b);
  }

  .montant {
    margin: 0.25rem 0 0;
    font-size: 0.82rem;
    color: var(--encre-doux, #4a5a55);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.55rem;
  }

  li {
    padding-top: 0.5rem;
    border-top: 1px solid var(--surface, rgb(10 43 35 / 3%));
  }

  .tete {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem;
  }

  .tete b {
    font-size: 0.85rem;
    color: var(--encre, #0a2b23);
  }

  .perf {
    padding: 0.05rem 0.45rem;
    border: 1px solid var(--vert-100, #e6ede4);
    border-radius: 999px;
    font-size: 0.72rem;
    font-variant-numeric: tabular-nums;
    color: var(--vert-verriere, #12463b);
  }

  .commencer {
    margin: 0;
    padding: 0.7rem 0.9rem;
    border-left: 3px solid var(--vert-verriere, #12463b);
    background: var(--surface, rgb(10 43 35 / 3%));
    border-radius: 0 6px 6px 0;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--encre, #0a2b23);
  }

  .portee {
    margin: 0.25rem 0 0;
    font-size: 0.8rem;
    color: var(--vert-verriere, #12463b);
  }

  .portee.hors {
    color: var(--encre-doux, #4a5a55);
  }

  .parois {
    margin: 0.15rem 0 0;
    font-size: 0.76rem;
    color: var(--verriere-sable-encre, #896c33);
  }

  .consigne {
    margin: 0.2rem 0 0;
    font-size: 0.83rem;
    line-height: 1.5;
    color: var(--encre-doux, #4a5a55);
  }

  .commentaire {
    margin: 0;
    padding: 0.7rem 0.9rem;
    border-left: 3px solid var(--vert-verriere, #12463b);
    background: var(--surface, rgb(10 43 35 / 3%));
    border-radius: 0 6px 6px 0;
    font-size: 0.85rem;
    line-height: 1.5;
    color: var(--encre, #0a2b23);
  }

  .manque,
  .rien {
    margin: 0;
    font-size: 0.8rem;
    line-height: 1.5;
    color: var(--encre-doux, #4a5a55);
  }

  .manque {
    padding: 0.65rem 0.85rem;
    border-left: 3px solid var(--verriere-sable-or, #c8a96b);
    background: var(--verriere-sable-voile, rgb(200 169 107 / 16%));
    border-radius: 0 6px 6px 0;
    color: var(--encre, #0a2b23);
  }

  .gestes button {
    width: 100%;
    padding: 0.55rem 0.8rem;
    border: 1px solid var(--verriere-sable-filet, #d8c199);
    border-radius: 8px;
    background: transparent;
    font-size: 0.82rem;
    text-align: left;
    color: var(--vert-verriere, #12463b);
    cursor: pointer;
  }

  .gestes button:hover,
  .gestes button:focus-visible {
    background: var(--surface, rgb(10 43 35 / 3%));
  }

  .liste-gestes {
    margin-top: 0.5rem;
    gap: 0.35rem;
  }

  .liste-gestes li {
    border-top: none;
    padding-top: 0;
    font-size: 0.8rem;
    line-height: 1.5;
    color: var(--encre-doux, #4a5a55);
  }
</style>
