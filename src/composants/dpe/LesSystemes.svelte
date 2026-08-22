<script lang="ts">
  /**
   * LES ÉQUIPEMENTS — chauffage, eau chaude, ventilation, confort d'été, renouvelables.
   *
   * ── Ce que l'écran garantit ────────────────────────────────────────────────
   *
   * « S'il existe deux systèmes, les deux doivent apparaître » (§10). Six
   * logements du corpus ont deux générateurs de chauffage : chacun a sa fiche,
   * avec son énergie, son émetteur, son année et sa régulation.
   *
   * Le **confort d'été** est un volet à part entière (§13), pas une ligne perdue :
   * il porte la climatisation telle que le rapport la nomme — « Néant » compris,
   * qui est une réponse et non un silence.
   *
   * Les **renouvelables** (§14) distinguent trois états : le rapport affirme
   * qu'il n'y en a pas, le rapport n'en parle pas, ou les équipements en
   * révèlent une. Le troisième cas est une contradiction : il part dans les
   * points à vérifier, pas ici.
   *
   * La phrase du rapport est toujours donnée à côté de la donnée structurée.
   * L'une se lit, l'autre se compare — on ne choisit pas à la place du lecteur.
   */
  import type { Systemes } from '../../lib/analyse/systemes';

  const { systemes }: { systemes: Systemes } = $props();

  const phrase = (poste: string) =>
    systemes.vueDEnsemble.find((p) => p.poste.toLowerCase() === poste.toLowerCase())?.description ??
    null;

  const climatisation = $derived(systemes.climatisation);
  const sansClim = $derived(climatisation !== null && /^n[ée]ant$/i.test(climatisation.trim()));
</script>

<section class="systemes" aria-labelledby="titre-systemes">
  <h2 id="titre-systemes">Ce qui chauffe, ce qui ventile</h2>

  {#if !systemes.presente}
    <p class="rien">
      La description des équipements n’a pas pu être lue dans ce rapport. Rien n’est
      affiché ici plutôt qu’une installation approximative.
    </p>
  {:else}
    <article>
      <header>
        <h3>Chauffage</h3>
        {#if systemes.chauffage.length > 1}
          <p class="compte">
            {systemes.chauffage.length} générateurs — le rapport en décrit plusieurs, ils sont
            tous ici.
          </p>
        {/if}
      </header>

      {#if systemes.chauffage.length === 0 && phrase('Chauffage')}
        <p class="dit">{phrase('Chauffage')}</p>
      {:else}
        <ul>
          {#each systemes.chauffage as g, i (g.nom ?? i)}
            <li>
              <b>{g.nom ?? `Générateur ${i + 1}`}</b>
              {#if g.type}<p class="type">{g.type}</p>{/if}
              <p class="attributs">
                {#if g.energie}<span>{g.energie}</span>{/if}
                {#if g.emetteur}<span>{g.emetteur}</span>{/if}
                {#if g.distribution}<span>{g.distribution}</span>{/if}
                {#if g.installation}<span>{g.installation}</span>{/if}
                {#if g.annee}<span
                    >{g.annee.valeur}{g.annee.origine === 'défaut' ? ' (supposée)' : ''}</span
                  >{/if}
              </p>
              {#if g.regulation}<p class="regulation">Régulation : {g.regulation}</p>{/if}
            </li>
          {/each}
        </ul>
      {/if}
    </article>

    <article>
      <header><h3>Eau chaude sanitaire</h3></header>
      {#if systemes.eauChaude.length === 0 && phrase('Eau chaude sanitaire')}
        <p class="dit">{phrase('Eau chaude sanitaire')}</p>
      {:else}
        <ul>
          {#each systemes.eauChaude as e, i (e.nom ?? i)}
            <li>
              <b>{e.nom ?? 'Production d’eau chaude'}</b>
              {#if e.type}<p class="type">{e.type}</p>{/if}
              <p class="attributs">
                {#if e.energie}<span>{e.energie}</span>{/if}
                {#if e.production}<span>{e.production}</span>{/if}
                {#if e.volume}<span>ballon {e.volume}</span>{/if}
                {#if e.distribution}<span>{e.distribution}</span>{/if}
              </p>
            </li>
          {/each}
        </ul>
      {/if}
      {#if phrase('Eau chaude sanitaire') && systemes.eauChaude.length > 0}
        <p class="dit">Le rapport résume : {phrase('Eau chaude sanitaire')}</p>
      {/if}
    </article>

    <article>
      <header><h3>Ventilation</h3></header>
      {#if systemes.ventilation}
        <p class="type">{systemes.ventilation.type}</p>
        <p class="attributs">
          {#if systemes.ventilation.energie}<span>{systemes.ventilation.energie}</span>{/if}
          {#if systemes.ventilation.annee}<span>{systemes.ventilation.annee.valeur}</span>{/if}
          {#if systemes.ventilation.facadesExposees}<span
              >façades exposées : {systemes.ventilation.facadesExposees}</span
            >{/if}
          {#if systemes.ventilation.logementTraversant}<span
              >traversant : {systemes.ventilation.logementTraversant}</span
            >{/if}
        </p>
        <!--
          Cette phrase n'est pas une remarque de confort. Sans extraction,
          l'humidité stagne, décolle les peintures — et une peinture qui
          s'écaille fait passer un revêtement au plomb de la classe 1 à la
          classe 3. Le constat plomb du même dossier en montre l'effet.
        -->
        {#if systemes.ventilation.mecanique === false}
          <p class="alerte">
            Aucune ventilation mécanique : l’air ne se renouvelle qu’en ouvrant les
            fenêtres. L’humidité s’évacue mal, et c’est elle qui décolle les peintures.
          </p>
        {/if}
      {:else if phrase('Ventilation')}
        <p class="dit">{phrase('Ventilation')}</p>
      {:else}
        <p class="rien">Information non précisée dans le DPE.</p>
      {/if}
    </article>

    <article>
      <header><h3>Confort d’été</h3></header>
      {#if climatisation}
        {#if sansClim}
          <p class="dit">
            Le rapport indique <b>« Néant »</b> : le logement n’a pas de climatisation.
          </p>
        {:else}
          <p class="type">{climatisation}</p>
        {/if}
      {:else}
        <p class="rien">Information non précisée dans le DPE.</p>
      {/if}
      {#if systemes.pilotage}
        <p class="attributs"><span>pilotage : {systemes.pilotage}</span></p>
      {/if}
    </article>

    <article>
      <header><h3>Énergies renouvelables</h3></header>
      {#if systemes.renouvelables.indices.length > 0}
        <p class="type">
          Le rapport décrit : {systemes.renouvelables.indices.join(', ')}.
        </p>
      {:else if systemes.renouvelables.declarees === false}
        <p class="dit">
          Le rapport écrit que ce logement n’est pas encore équipé de production
          d’énergie renouvelable.
        </p>
      {:else}
        <p class="rien">Information non précisée dans le DPE.</p>
      {/if}
    </article>
  {/if}
</section>

<style>
  .systemes {
    display: grid;
    gap: 0.8rem;
  }

  h2 {
    margin: 0;
    font-size: 1.05rem;
    color: var(--encre, #0a2b23);
  }

  h3 {
    margin: 0;
    font-size: 0.92rem;
    color: var(--encre, #0a2b23);
  }

  article {
    display: grid;
    gap: 0.4rem;
    padding: 0.8rem 0.9rem;
    border: 1px solid var(--verriere-sable-filet, #d8c199);
    border-radius: 8px;
    background: var(--papier, #fff);
  }

  .compte {
    margin: 0.2rem 0 0;
    font-size: 0.78rem;
    color: var(--verriere-sable-encre, #896c33);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.55rem;
  }

  li {
    display: grid;
    gap: 0.15rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--surface, rgb(10 43 35 / 3%));
  }

  li b {
    font-size: 0.85rem;
    color: var(--encre, #0a2b23);
  }

  .type {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.45;
    color: var(--encre, #0a2b23);
  }

  .dit,
  .rien {
    margin: 0;
    font-size: 0.82rem;
    line-height: 1.5;
    color: var(--encre-doux, #4a5a55);
  }

  .attributs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin: 0.15rem 0 0;
  }

  .attributs span {
    padding: 0.05rem 0.4rem;
    border-radius: 999px;
    background: var(--surface, rgb(10 43 35 / 3%));
    font-size: 0.72rem;
    color: var(--encre-doux, #4a5a55);
  }

  .regulation {
    margin: 0.15rem 0 0;
    font-size: 0.76rem;
    color: var(--encre-doux, #4a5a55);
  }

  .alerte {
    margin: 0.2rem 0 0;
    padding: 0.55rem 0.75rem;
    border-left: 3px solid #c05621;
    background: rgb(192 86 33 / 8%);
    border-radius: 0 6px 6px 0;
    font-size: 0.8rem;
    line-height: 1.5;
    color: var(--encre, #0a2b23);
  }
</style>
