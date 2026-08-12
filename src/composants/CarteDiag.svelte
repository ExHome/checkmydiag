<script lang="ts">
  import type { Diagnostic } from '../lib/modele';
  import type { PageRendue } from '../lib/pdf';
  import Schema from './Schema.svelte';
  import Explicatif from './schemas/Explicatif.svelte';
  import PageAnnotee from './PageAnnotee.svelte';

  interface Props {
    diagnostic: Diagnostic;
    /** Page du rapport à montrer annotée, quand elle a pu être dessinée. */
    page?: PageRendue | null;
  }

  const { diagnostic, page = null }: Props = $props();

  const ETIQUETTES_GRAVITE: Record<Diagnostic['gravite'], string> = {
    bon: 'Rien à signaler',
    attention: 'À regarder',
    alerte: 'Point important',
    neutre: 'Pour information'
  };

  // Quatre chiffres suffisent à l'écran ; le reste alourdit sans éclairer.
  const faitsVisibles = $derived(diagnostic.faits.slice(0, 4));

  // Quand le diagnostic engage vraiment le lecteur, les deux premières
  // conséquences restent à l'écran : ce sont les obligations et les délais.
  const urgent = $derived(diagnostic.gravite === 'alerte');
  const aFaireVisible = $derived(urgent ? diagnostic.aFaire.slice(0, 2) : []);
  const aFaireReste = $derived(urgent ? diagnostic.aFaire.slice(2) : diagnostic.aFaire);

  const annotable = $derived(page !== null && (diagnostic.reperes?.length ?? 0) > 0);
</script>

<article class="carte diag {diagnostic.gravite}">
  <header>
    <div class="titre">
      <h2>{diagnostic.titre}</h2>
      <span class="pastille">{ETIQUETTES_GRAVITE[diagnostic.gravite]}</span>
    </div>
    <p class="verdict">{diagnostic.verdict}</p>
  </header>

  {#if diagnostic.analogie}
    <p class="analogie">
      <span class="mot-cle">En clair</span>
      {diagnostic.analogie}
    </p>
  {/if}

  {#if faitsVisibles.length}
    <dl class="faits">
      {#each faitsVisibles as fait (fait.libelle)}
        <div>
          <dt>{fait.libelle}</dt>
          <dd>{fait.valeur}</dd>
          {#if fait.precision}<p class="precision muet petit">{fait.precision}</p>{/if}
        </div>
      {/each}
    </dl>
  {/if}

  {#if diagnostic.schema}
    <section class="bloc">
      <Schema schema={diagnostic.schema} />
    </section>
  {/if}

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

  <!-- Tout le reste attend derrière un seul bouton : le lecteur pressé s'arrête
       ici, le lecteur curieux déplie. -->
  <details>
    <summary>
      Aller plus loin
      <span class="muet petit">
        {annotable ? 'votre page expliquée, le schéma, les obligations' : 'le schéma, les obligations'}
      </span>
    </summary>

    <div class="detail">
      {#if annotable && page && diagnostic.reperes}
        <section class="bloc-detail">
          <h3>Votre rapport, expliqué</h3>
          <PageAnnotee reperes={diagnostic.reperes} {page} numero={diagnostic.reperes[0]?.page ?? 1} />
        </section>
      {/if}

      <Explicatif type={diagnostic.type} />

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
    margin-bottom: 22px;
    padding-top: clamp(22px, 4vw, 34px);
    position: relative;
    overflow: hidden;
  }

  /* Un filet de couleur donne le ton avant même la lecture. */
  .diag::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 5px;
  }

  .diag.bon::before {
    background: linear-gradient(90deg, var(--ok), var(--vert-300));
  }
  .diag.attention::before {
    background: linear-gradient(90deg, var(--attention), #f0b95c);
  }
  .diag.alerte::before {
    background: linear-gradient(90deg, var(--alerte), #f2777c);
  }
  .diag.neutre::before {
    background: var(--trait);
  }

  .titre {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    justify-content: space-between;
  }

  h2 {
    margin: 0;
  }

  .pastille {
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-radius: 999px;
    padding: 5px 13px;
    white-space: nowrap;
  }

  .bon .pastille {
    background: var(--ok-fond);
    color: var(--ok);
  }
  .attention .pastille {
    background: var(--attention-fond);
    color: var(--attention);
  }
  .alerte .pastille {
    background: var(--alerte-fond);
    color: var(--alerte);
  }
  .neutre .pastille {
    background: var(--papier-doux);
    color: var(--encre-doux);
  }

  .verdict {
    font-size: clamp(1.14rem, 2.4vw, 1.4rem);
    line-height: 1.35;
    font-weight: 600;
    letter-spacing: -0.015em;
    margin: 14px 0 0;
    text-wrap: pretty;
  }

  /* L'image du quotidien, mise en avant : c'est elle qui accroche le lecteur. */
  .analogie {
    margin: 20px 0 0;
    padding: 16px 20px;
    background: linear-gradient(135deg, var(--vert-100), transparent 140%);
    border-left: 4px solid var(--vert-500);
    border-radius: var(--rayon-petit);
    font-size: 1.03rem;
    line-height: 1.55;
    text-wrap: pretty;
  }

  .mot-cle {
    display: block;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--vert-700);
    margin-bottom: 4px;
  }

  .faits {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    margin: 24px 0 0;
  }

  .faits div {
    min-width: 0;
    background: var(--papier-doux);
    border-radius: var(--rayon-petit);
    padding: 12px 14px;
  }

  dt {
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--encre-doux);
    font-weight: 600;
  }

  dd {
    margin: 4px 0 0;
    font-size: 1.32rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  .precision {
    margin: 3px 0 0;
    font-size: 0.8rem;
    line-height: 1.35;
  }

  .bloc {
    margin-top: 28px;
    padding-top: 22px;
    border-top: 1px solid var(--trait);
  }

  h3 {
    font-size: 1.02rem;
    font-weight: 700;
    color: var(--encre-doux);
    margin-bottom: 14px;
  }

  details {
    margin-top: 24px;
    border-top: 1px solid var(--trait);
    padding-top: 16px;
  }

  summary {
    cursor: pointer;
    font-weight: 700;
    font-size: 1rem;
    color: var(--vert-700);
    list-style: none;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: var(--vert-100);
    border-radius: 999px;
    width: fit-content;
    transition: filter 0.15s ease;
  }

  summary:hover {
    filter: brightness(0.97);
  }

  summary .muet {
    font-weight: 400;
  }

  .bloc-detail {
    margin-bottom: 26px;
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
    font-size: 1rem;
    margin: 20px 0 8px;
  }

  .urgent h4 {
    margin-top: 0;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.82rem;
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
