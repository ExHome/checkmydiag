<script lang="ts">
  /**
   * Le rapport, et rien d'autre.
   *
   * Les pages se suivent, centrées, comme le document qu'elles sont. Les
   * passages repérés y sont surlignés et numérotés. Tant qu'on ne clique sur
   * rien, il n'y a rien à lire d'autre — pas de bandeau, pas de sommaire, pas
   * de résumé. On clique : l'explication s'ouvre à côté. On referme : elle
   * disparaît et le document reprend toute la place.
   *
   * Les couleurs sont celles du DPE et elles disent ce que dit la ligne : vert
   * quand c'est bon, orange quand il faut regarder, rouge quand ça coince, or
   * quand c'est une simple donnée.
   */
  import type { Analyse, Diagnostic, TypeDiag } from '../lib/modele';
  import type { PageRendue } from '../lib/pdf';
  import Explicatif from './schemas/Explicatif.svelte';
  import MiniSchema from './MiniSchema.svelte';
  import Fiche from './Fiche.svelte';
  import Curieux from './Curieux.svelte';
  import Notaire from './Notaire.svelte';
  import Diagnostics from './Diagnostics.svelte';
  import Verdict from './Verdict.svelte';
  import { FICHES } from '../lib/analyse/fiches';

  interface Props {
    analyse: Analyse;
    rendus: Map<number, PageRendue>;
    /** Diagnostic demandé de l'extérieur : on descend jusqu'à sa première page. */
    demande?: string | null;
  }

  const { analyse, rendus, demande = null }: Props = $props();

  type Repere = NonNullable<Diagnostic['reperes']>[number];

  /** L'échelle du DPE, au service du sens. */
  const TEINTES = {
    bon: '#319834',
    moyen: '#fc9935',
    mauvais: '#fc0205',
    info: '#c09048'
  } as const;

  /**
   * Tous les repères du dossier, dans l'ordre du document.
   *
   * Le rapport est un seul document : le découper par diagnostic obligeait le
   * lecteur à choisir un onglet avant d'avoir rien compris. Ici il descend, et
   * ce qui est surligné s'explique — peu importe de quel diagnostic ça vient.
   */
  const reperes = $derived(
    analyse.diagnostics
      .flatMap((d) => (d.reperes ?? []).map((r) => ({ repere: r, type: d.type })))
      .sort((a, b) => a.repere.page - b.repere.page)
  );

  /** Les pages dessinées qui portent au moins un repère. */
  const pages = $derived(
    [...new Set(reperes.map((r) => r.repere.page))]
      .filter((n) => rendus.has(n))
      .sort((a, b) => a - b)
  );

  function reperesDe(numero: number): { repere: Repere; type: TypeDiag; rang: number }[] {
    return reperes
      .map((r, rang) => ({ ...r, rang }))
      .filter((r) => r.repere.page === numero);
  }

  /**
   * Emmène à la conclusion d'un diagnostic.
   *
   * On vise le passage qui porte un constat, pas le premier venu : sinon
   * cliquer sur « Anomalies » ouvrait le numéro de dossier, qui se trouve être
   * la première ligne repérée de la partie.
   */
  function allerAuDiagnostic(type: TypeDiag): void {
    const constat = reperes.findIndex((r) => r.type === type && r.repere.famille === 'constat');
    const i = constat >= 0 ? constat : reperes.findIndex((r) => r.type === type);
    if (i < 0) return;
    // Aller dans le rapport, c'est changer de vue : sans ça, le clic ouvrait
    // un passage que le lecteur ne voyait pas.
    vue = 'rapport';
    allerAu(i);
  }

  // Une demande venue de l'extérieur ouvre le diagnostic voulu.
  $effect(() => {
    if (demande) allerAuDiagnostic(demande as TypeDiag);
  });

  /** Ce qu'on peut ouvrir : un passage du rapport, ou une rubrique de fond. */
  interface Entree {
    id: string;
    mot: string;
    teinte: string;
    repere?: Repere;
    type: TypeDiag;
    rubrique?: 'schema' | 'fiche' | 'curieux';
  }

  const entrees = $derived.by<Entree[]>(() => {
    const liste: Entree[] = reperes.map(({ repere, type }, i) => ({
      id: `r${i}`,
      mot: repere.titre,
      teinte: TEINTES[repere.ton ?? 'info'],
      repere,
      type
    }));
    return liste;
  });

  /**
   * Les trois vues du dossier.
   *
   * Tout empilé, la page faisait vingt-trois écrans et quatre-vingts boutons
   * visibles d'un coup : impossible de savoir où l'on est ni ce qui reste. On
   * la coupe donc en trois temps, dans l'ordre où on lit un dossier.
   */
  const VUES = [
    { cle: 'point', nom: 'Le point', quoi: 'Le bien, sa classe, le conseil' },
    { cle: 'diags', nom: 'Les diagnostics', quoi: 'Un par un, expliqués' },
    { cle: 'rapport', nom: 'Le rapport', quoi: 'Le document d’origine, annoté' }
  ];

  let vue = $state('point');

  /** Ouvert au clic, et seulement au clic. Reclic : ça se referme. */
  let epingle = $state<string | null>(null);
  /** La rubrique de fond ouverte, rattachée au diagnostic du passage courant. */
  let rubrique = $state<'schema' | 'fiche' | 'curieux' | null>(null);
  const actifId = $derived(epingle);
  const actif = $derived(entrees.find((e) => e.id === actifId) ?? null);
  /** Le diagnostic dont relève le passage ouvert : c'est lui qu'on approfondit. */
  const diagnostic = $derived(
    actif ? (analyse.diagnostics.find((d) => d.type === actif.type) ?? null) : null
  );

  /** Le détail et le schéma, sous la synthèse. Le lecteur décide s'il y va. */
  let detailOuvert = $state(false);
  let suiteOuverte = $state<string | null>(null);
  /** Le schéma déplié sur tout l'écran. */
  let plein = $state(false);

  /**
   * Le schéma en pleine page se pilotait à la souris seule.
   *
   * Au clavier, ouvrir laissait le focus derrière, sur un bouton devenu
   * invisible : on tabulait dans une page qu'on ne voyait plus. On note donc
   * d'où l'on vient, on pose le focus sur « Fermer » à l'ouverture, et on le
   * rend à son bouton d'origine à la fermeture — la place qu'on avait dans le
   * document n'est jamais perdue.
   */
  let declencheur: HTMLElement | null = null;
  let boutonFermer: HTMLButtonElement | undefined = $state();

  function ouvrirPlein(e: MouseEvent): void {
    declencheur = e.currentTarget as HTMLElement;
    plein = true;
  }

  function fermerPlein(): void {
    plein = false;
    declencheur?.focus();
    declencheur = null;
  }

  $effect(() => {
    if (plein) boutonFermer?.focus();
  });

  // Changer de sujet remet tout au premier niveau : on ne garde pas l'état
  // d'exploration du passage précédent.
  $effect(() => {
    void actifId;
    detailOuvert = false;
    suiteOuverte = null;
    plein = false;
  });

  // Ouvrir un passage referme la rubrique de fond : une chose à la fois.
  $effect(() => {
    void actifId;
    rubrique = null;
  });

  function epingler(id: string): void {
    epingle = epingle === id ? null : id;
  }

  /* ---- La lecture guidée -------------------------------------------------
     Personne ne sait par où commencer dans un rapport de cent pages. Alors on
     prend le lecteur par la main : passage après passage, dans l'ordre du
     document. Il sort quand il veut en refermant. */

  const nbReperes = $derived(reperes.length);
  /** Rang du passage ouvert dans la lecture, ou -1 si rien n'est ouvert. */
  const rang = $derived(actifId?.startsWith('r') ? Number(actifId.slice(1)) : -1);

  /**
   * Les passages qui portent une conclusion.
   *
   * Sur ce dossier, le rapport donne 74 passages repérés : 44 données, 21 mots
   * du métier, et 9 conclusions. Proposer les 74 « dans l'ordre », c'était
   * demander au lecteur de traverser le numéro de dossier et la définition de
   * « sans démontage » pour atteindre ce qu'il est venu chercher. La lecture
   * guidée ne suit donc que les conclusions ; le reste reste cliquable dans le
   * document, à sa place.
   */
  const parcours = $derived(
    reperes
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => r.repere.famille === 'constat' || (r.repere.ton && r.repere.ton !== 'info'))
      .map(({ i }) => i)
  );

  /** Rang du passage ouvert parmi les conclusions, ou -1 s'il n'en est pas une. */
  const etape = $derived(parcours.indexOf(rang));

  /** La conclusion qui suit celle qu'on lit — ou celle qui suit l'endroit où on est. */
  const suivante = $derived(
    etape >= 0 ? (parcours[etape + 1] ?? -1) : (parcours.find((i) => i > rang) ?? -1)
  );

  const precedente = $derived(
    etape >= 0
      ? (parcours[etape - 1] ?? -1)
      : ([...parcours].reverse().find((i) => i < rang) ?? -1)
  );

  function allerAu(i: number): void {
    if (i < 0 || i >= nbReperes) return;
    epingle = `r${i}`;
    // Le rapport suit : le passage dont on parle vient se placer sous les yeux.
    requestAnimationFrame(() => {
      document
        .getElementById(`repere-r${i}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  function cadre(r: Repere, page: PageRendue) {
    const marge = 3;
    return {
      left: ((r.x - marge) / page.largeur) * 100,
      top: ((page.hauteur - r.y - r.hauteur) / page.hauteur) * 100,
      width: ((r.largeur + marge * 2) / page.largeur) * 100,
      height: ((r.hauteur + marge * 2) / page.hauteur) * 100
    };
  }
</script>

<!-- Ce qu'il faut retenir, avant le dossier lui-même. C'est la seule chose de
     l'écran qui doit être comprise sans rien ouvrir : il est donc au-dessus des
     vues, et il s'affiche même si aucun passage n'a pu être repéré. -->
<Verdict {analyse} />

{#if reperes.length}
  <section class="lecteur">
    <!-- Trois vues, pas vingt-trois écrans à la file. Le lecteur sait toujours
         où il est et ce qui reste. À l'impression, tout se déplie : le document
         remis n'a pas d'onglets. -->
    <nav class="vues" aria-label="Les parties du dossier">
      {#each VUES as v (v.cle)}
        <button
          type="button"
          class:courante={vue === v.cle}
          aria-current={vue === v.cle ? 'page' : undefined}
          onclick={() => (vue = v.cle)}
        >
          <span class="nom-vue">{v.nom}</span>
          <span class="quoi-vue">{v.quoi}</span>
        </button>
      {/each}
    </nav>

    <div class="vue" class:cachee={vue !== 'point'}>
      <!-- Le point qu'on ferait à l'étude : de quel bien il s'agit, où il se
           situe, et ce qu'il faut faire. -->
      <Notaire {analyse} />
    </div>

    <div class="vue" class:cachee={vue !== 'diags'}>
      <!-- Le dossier diagnostic par diagnostic : conclusion, dessin, chiffres,
           canevas, réserves. -->
      <Diagnostics {analyse} />
    </div>

    <div class="vue" class:cachee={vue !== 'rapport'} class:deux-colonnes={true} class:seul={!actif}>
      <div class="document">
        {#if pages.length}
          <!-- Les pages à la suite : c'est un document, il se déroule. -->
          {#each pages as numero (numero)}
            {@const page = rendus.get(numero)}
            {#if page}
              <div class="page" id="page-{numero}">
                <img src={page.image} alt="Page {numero} de votre rapport" />

                {#each reperesDe(numero) as { repere, rang: i } (repere.titre)}
                  {@const c = cadre(repere, page)}
                  <button
                    type="button"
                    id="repere-r{i}"
                    class="surligne"
                    class:actif={actifId === `r${i}`}
                    style:--teinte={TEINTES[repere.ton ?? 'info']}
                    style:left="{c.left}%"
                    style:top="{c.top}%"
                    style:width="{c.width}%"
                    style:height="{c.height}%"
                    aria-label={repere.titre}
                    onclick={() => epingler(`r${i}`)}
                  >
                    <span class="puce">{i + 1}</span>
                  </button>
                {/each}
              </div>
            {/if}
          {/each}
        {:else}
          <!-- Pas d'image : le texte du rapport, page après page, avec les
               mêmes lignes vivantes. -->
          <div class="page-texte" aria-label="Texte du rapport">
            {#each [...new Set(reperes.map((r) => r.repere.page))].sort((a, b) => a - b) as numero (numero)}
              <p class="numero-page">page {numero}</p>
              {#each analyse.textePages[numero] ?? [] as ligne}
                {@const trouve = reperes.findIndex(
                  (r) => r.repere.page === numero && ligne.includes(r.repere.extrait)
                )}
                {#if trouve >= 0}
                  {@const r = reperes[trouve]?.repere}
                  <button
                    type="button"
                    id="repere-r{trouve}"
                    class="ligne surlignee"
                    class:actif={actifId === `r${trouve}`}
                    style:--teinte={TEINTES[r?.ton ?? 'info']}
                    onclick={() => epingler(`r${trouve}`)}
                  >
                    <span class="puce-ligne">{trouve + 1}</span>
                    {ligne}
                  </button>
                {:else}
                  <p class="ligne">{ligne}</p>
                {/if}
              {/each}
            {/each}
          </div>
        {/if}
      </div>

      <aside class="panneau" class:absent={!actif}>
        {#if actif}
          {#key actif.id}
            <div class="encart apparait" style:--teinte={actif.teinte}>
              <button type="button" class="retour" onclick={() => (epingle = null)}>
                ← Retour
              </button>

              <h3>{actif.mot}</h3>

              {#if actif.repere}
                <!-- Ce que dit son dossier. Le reste vient après, s'il le veut. -->
                <p class="extrait">« {actif.repere.extrait} »</p>

                <p class="synthese">{actif.repere.points[0]}</p>

                <!-- Le dessin, tout de suite et en grand. C'est lui qui fait
                     comprendre : le cacher derrière un bouton, c'était le
                     traiter comme une note de bas de page.

                     Un repère qui a son propre croquis le montre ; un constat
                     de diagnostic montre le schéma de sa famille. -->
                <!-- Tout tient sur la feuille du schéma : le dessin, le risque,
                     et les questions posées comme sa légende. Le lecteur n'a
                     qu'un objet devant lui, pas un dessin suivi d'une liste. -->
                <div class="feuille">
                  <button
                    type="button"
                    class="agrandir"
                    onclick={ouvrirPlein}
                    aria-label="Voir le schéma en pleine page"
                  >
                    ⤢
                  </button>

                  {#if actif.repere.schema}
                    <MiniSchema id={actif.repere.schema} />
                  {:else if diagnostic}
                    <Explicatif
                      type={diagnostic.type}
                      isolation={diagnostic.schema?.genre === 'dpe'
                        ? diagnostic.schema.isolation
                        : null}
                      lettre={diagnostic.schema?.genre === 'dpe' ? diagnostic.schema.finale : null}
                    />
                  {/if}

                  {#if diagnostic}
                    <p class="risque">{FICHES[diagnostic.type].risque}</p>
                  {/if}

                  {#if actif.repere.suites?.length}
                    <div class="legende">
                      {#each actif.repere.suites as suite (suite.question)}
                        <button
                          type="button"
                          class="etiquette {suite.ton ?? 'moyen'}"
                          class:ouverte={suiteOuverte === suite.question}
                          onclick={() =>
                            (suiteOuverte =
                              suiteOuverte === suite.question ? null : suite.question)}
                        >
                          {suite.question}
                        </button>
                      {/each}
                    </div>

                    {#each actif.repere.suites.filter((s) => s.question === suiteOuverte) as suite (suite.question)}
                      <ul class="points reponse apparait {suite.ton ?? 'moyen'}">
                        {#each suite.points as point}
                          <li>{point}</li>
                        {/each}
                      </ul>
                    {/each}
                  {/if}

                  {#if actif.repere.points.length > 1}
                    <button
                      type="button"
                      class="creuser"
                      class:ouvert={detailOuvert}
                      onclick={() => (detailOuvert = !detailOuvert)}
                    >
                      {detailOuvert ? 'Fermer' : 'Tout le détail'}
                    </button>

                    {#if detailOuvert}
                      <ul class="points detail apparait">
                        {#each actif.repere.points.slice(1) as point}
                          <li>{point}</li>
                        {/each}
                      </ul>
                    {/if}
                  {/if}
                </div>

                <!-- La phrase qui ramène au logement. Elle ne saute jamais. -->
                <p class="pratique">{actif.repere.pratique}</p>

                <!-- La lecture avance toute seule : passage suivant, dans
                     l'ordre du rapport, avec le document qui suit. -->
                <div class="pas-a-pas">
                  <button
                    type="button"
                    class="fleche"
                    disabled={precedente < 0}
                    onclick={() => allerAu(precedente)}
                    aria-label="Conclusion précédente"
                  >
                    ←
                  </button>
                  <span class="compteur">
                    {etape >= 0
                      ? `Conclusion ${etape + 1} sur ${parcours.length}`
                      : 'Une donnée du rapport'}
                  </span>
                  <button
                    type="button"
                    class="suivant"
                    disabled={suivante < 0}
                    onclick={() => allerAu(suivante)}
                  >
                    {etape >= 0 ? 'Suivante →' : 'Conclusion suivante →'}
                  </button>
                </div>

                <!-- Le fond du sujet, rattaché au diagnostic de ce passage. -->
                {#if diagnostic}
                  <div class="passerelles">
                    <!-- Inutile de proposer le schéma du diagnostic quand il est
                         déjà dessiné plus haut. -->
                    {#if actif.repere.famille !== 'constat'}
                      <button
                        type="button"
                        class:ouverte={rubrique === 'schema'}
                        onclick={() => (rubrique = rubrique === 'schema' ? null : 'schema')}
                      >
                        Le schéma
                      </button>
                    {/if}
                    <button
                      type="button"
                      class:ouverte={rubrique === 'fiche'}
                      onclick={() => (rubrique = rubrique === 'fiche' ? null : 'fiche')}
                    >
                      Quoi faire ?
                    </button>
                    <button
                      type="button"
                      class:ouverte={rubrique === 'curieux'}
                      onclick={() => (rubrique = rubrique === 'curieux' ? null : 'curieux')}
                    >
                      Le saviez-vous ?
                    </button>
                  </div>

                  {#if rubrique === 'schema'}
                    <div class="feuille apparait">
                      <Explicatif
                        type={diagnostic.type}
                        isolation={diagnostic.schema?.genre === 'dpe'
                          ? diagnostic.schema.isolation
                          : null}
                        lettre={diagnostic.schema?.genre === 'dpe'
                          ? diagnostic.schema.finale
                          : null}
                      />
                    </div>
                  {:else if rubrique === 'fiche'}
                    <div class="feuille apparait">
                      <Fiche type={diagnostic.type} />
                    </div>
                  {:else if rubrique === 'curieux'}
                    <div class="feuille apparait">
                      <Curieux type={diagnostic.type} />
                    </div>
                  {/if}
                {/if}
              {/if}
            </div>
          {/key}
        {/if}
      </aside>
    </div>

    <!-- Au repos, le seul texte de l'écran : la porte d'entrée de la lecture
         guidée. Tout le reste attend un clic. -->
    {#if vue === 'rapport' && !actif && parcours.length}
      <button type="button" class="commencer" onclick={() => allerAu(parcours[0] ?? 0)}>
        Lire les conclusions du rapport
        <em>
          {parcours.length} conclusions surlignées, sur {nbReperes} passages repérés
        </em>
      </button>
    {/if}
  </section>

  <!-- Le schéma en pleine page. Dans le bandeau de droite, un dessin reste une
       vignette ; ici il occupe l'écran, et ses zones restent cliquables. -->
  {#if plein && actif?.repere}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="pleine-page" onclick={fermerPlein}>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="grand-format apparait"
        role="dialog"
        aria-modal="true"
        aria-label={actif.mot}
        tabindex="-1"
        onclick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          class="fermer-plein"
          bind:this={boutonFermer}
          onclick={fermerPlein}
        >
          Fermer ✕
        </button>

        <h2>{actif.mot}</h2>

        {#if actif.repere.schema}
          <MiniSchema id={actif.repere.schema} />
        {:else if diagnostic}
          <Explicatif
            type={diagnostic.type}
            isolation={diagnostic.schema?.genre === 'dpe' ? diagnostic.schema.isolation : null}
            lettre={diagnostic.schema?.genre === 'dpe' ? diagnostic.schema.finale : null}
          />
        {/if}

        {#if diagnostic}
          <p class="risque">{FICHES[diagnostic.type].risque}</p>
        {/if}

        {#if actif.repere.suites?.length}
          <div class="legende">
            {#each actif.repere.suites as suite (suite.question)}
              <button
                type="button"
                class="etiquette {suite.ton ?? 'moyen'}"
                class:ouverte={suiteOuverte === suite.question}
                onclick={() =>
                  (suiteOuverte = suiteOuverte === suite.question ? null : suite.question)}
              >
                {suite.question}
              </button>
            {/each}
          </div>

          {#each actif.repere.suites.filter((s) => s.question === suiteOuverte) as suite (suite.question)}
            <ul class="points reponse apparait {suite.ton ?? 'moyen'}">
              {#each suite.points as point}
                <li>{point}</li>
              {/each}
            </ul>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
{/if}

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape' && plein) fermerPlein();
  }}
/>

<style>
  /* Pas de caisson autour du lecteur : le rapport se pose directement sur le
     vert, comme une feuille sur un bureau. C'est lui la matière, pas le cadre. */
  .lecteur {
    margin-bottom: var(--e6);
  }





  /* La barre des vues : collante, elle dit en permanence où l'on est. */
  .vues {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--e1);
    position: sticky;
    top: 0;
    z-index: 8;
    margin-bottom: var(--e6);
    background: var(--fond);
    border-bottom: 1px solid rgb(255 255 255 / 12%);
  }

  .vues button {
    text-align: left;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    padding: var(--e4) var(--e1) var(--e3);
    cursor: pointer;
    color: var(--sur-fond-doux);
    transition: color 0.2s ease, border-color 0.2s ease;
  }

  .vues button:hover {
    color: var(--sur-fond);
  }

  .vues button.courante {
    color: var(--sur-fond);
    border-bottom-color: var(--or);
  }

  .nom-vue {
    display: block;
    font-family: var(--police-titre);
    font-size: var(--t-lead);
    font-weight: 500;
    letter-spacing: -0.022em;
  }

  .vues button.courante .nom-vue {
    color: var(--or-clair);
  }

  .quoi-vue {
    display: block;
    margin-top: var(--e1);
    font-size: var(--t-micro);
    letter-spacing: 0.06em;
    opacity: 0.7;
  }

  @media (max-width: 620px) {
    .quoi-vue {
      display: none;
    }
  }

  .vue.cachee {
    display: none;
  }

  /* Tant que rien n'est ouvert, le rapport est seul et centré. Dès qu'on
     clique, il se décale pour laisser entrer l'explication. */
  .deux-colonnes {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 430px;
    gap: var(--e5);
    align-items: start;
    transition: grid-template-columns 0.3s ease;
  }

  .deux-colonnes.seul {
    grid-template-columns: minmax(0, 860px);
    justify-content: center;
  }

  .panneau.absent {
    display: none;
  }

  /* Les pages du rapport, l'une sous l'autre. */
  .document {
    display: grid;
    gap: var(--e4);
  }

  .page {
    position: relative;
    border-radius: 2px;
    overflow: hidden;
    box-shadow: var(--ombre-forte);
    background: #fff;
    line-height: 0;
  }

  img {
    width: 100%;
    height: auto;
  }

  /* Le surlignage prend la couleur de ce que dit la ligne. */
  .surligne {
    position: absolute;
    border: 2px solid var(--teinte);
    background: color-mix(in srgb, var(--teinte) 20%, transparent);
    border-radius: 4px;
    padding: 0;
    cursor: pointer;
    z-index: 2;
    transition: background 0.2s ease, box-shadow 0.2s ease;
  }

  .surligne:hover,
  .surligne.actif {
    background: color-mix(in srgb, var(--teinte) 42%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--teinte) 35%, transparent);
  }

  .surligne.epingle {
    box-shadow: 0 0 0 3px var(--teinte);
  }

  .puce {
    position: absolute;
    left: -11px;
    top: 50%;
    transform: translateY(-50%);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--teinte);
    color: #fff;
    font-size: var(--t-micro);
    font-weight: 800;
    line-height: 22px;
    text-align: center;
  }

  /* Le fac-similé imite la feuille du rapport : fond clair, encre sombre. */
  .page-texte {
    background: #fdfcf8;
    border: 1px solid var(--trait);
    border-radius: var(--rayon-petit);
    padding: var(--e4) var(--e4);
    max-height: 640px;
    overflow-y: auto;
    font-size: var(--t-petit);
    line-height: 1.55;
    color: #43514a;
    box-shadow: var(--ombre);
    scroll-behavior: smooth;
  }

  .numero-page {
    position: sticky;
    top: -20px;
    margin: var(--e4) -var(--e4) var(--e2);
    padding: var(--e1) var(--e4);
    background: #f2ede0;
    color: #7a6a4d;
    font-size: var(--t-micro);
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border-block: 1px solid #e6ded0;
  }

  .numero-page:first-child {
    margin-top: -var(--e4);
  }

  .ligne {
    margin: 0 0 var(--e1);
    text-align: left;
  }

  button.ligne {
    display: block;
    width: 100%;
    background: color-mix(in srgb, var(--teinte) 15%, #fff);
    border: none;
    border-left: 4px solid var(--teinte);
    border-radius: 4px;
    padding: var(--e1) var(--e2);
    margin: var(--e1) 0;
    cursor: pointer;
    color: #2f2416;
    font: inherit;
    font-weight: 650;
    transition: background 0.15s ease, box-shadow 0.15s ease;
  }

  button.ligne:hover,
  button.ligne.actif {
    background: color-mix(in srgb, var(--teinte) 32%, #fff);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--teinte) 45%, transparent);
  }

  .puce-ligne {
    display: inline-grid;
    place-items: center;
    width: 18px;
    height: 18px;
    margin-right: var(--e1);
    border-radius: 50%;
    background: var(--teinte);
    color: #fff;
    font-size: var(--t-micro);
    font-weight: 800;
    vertical-align: text-bottom;
  }

  /* L'explication se pose à même le vert, sans caisson. Une feuille de papier
     d'un côté, la parole de l'autre : c'est la mise en page de la plaquette. */
  .panneau {
    position: sticky;
    top: 16px;
    padding: var(--e1) 0 0 var(--e1);
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    color: var(--sur-fond);
  }

  .panneau :global(.ruban) {
    margin: var(--e4) 0 var(--e3);
  }


  /* Le bouton qui prend le lecteur par la main. C'est l'action principale de
     l'écran : elle a le droit d'être grosse et dorée. */
  /* Posé sous le document, centré comme lui. */
  .commencer {
    display: block;
    margin: var(--e4) auto 0;
    text-align: center;
    background: none;
    border: 1px solid var(--trait-or);
    border-radius: 0;
    padding: var(--e4) var(--e6);
    cursor: pointer;
    color: var(--sur-fond);
    font-size: var(--t-base);
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    transition: background 0.22s ease, border-color 0.22s ease, color 0.22s ease;
  }

  .commencer:hover {
    background: var(--or);
    border-color: var(--or);
    color: var(--vert-900);
  }

  .commencer em {
    display: block;
    font-family: var(--mono);
    font-size: var(--t-micro);
    font-style: normal;
    letter-spacing: 0.04em;
    text-transform: none;
    opacity: 0.66;
    margin-top: var(--e1);
  }

  /* La progression : où j'en suis, et la suite. */
  .pas-a-pas {
    display: flex;
    align-items: center;
    gap: var(--e3);
    margin-top: var(--e4);
    padding-top: var(--e4);
    border-top: 1px solid rgb(230 200 148 / 24%);
  }

  .pas-a-pas .fleche {
    width: 38px;
    height: 38px;
    border-radius: 0;
    border: 1px solid var(--trait-or);
    background: none;
    color: var(--or-clair);
    font-size: var(--t-base);
    cursor: pointer;
  }

  .pas-a-pas .compteur {
    font-family: var(--mono);
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
    font-feature-settings: 'tnum';
  }

  .pas-a-pas .suivant {
    margin-left: auto;
    background: none;
    border: 1px solid var(--trait-or);
    border-radius: 0;
    padding: var(--e3) var(--e4);
    color: var(--or-clair);
    font-weight: 500;
    font-size: var(--t-petit);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease;
  }

  .pas-a-pas .suivant:hover:not(:disabled) {
    background: var(--or);
    border-color: var(--or);
    color: var(--vert-900);
  }

  .pas-a-pas button:disabled {
    opacity: 0.32;
    cursor: default;
  }




  /* L'encart : une seule chose à la fois. */
  .encart {
    border-left: 3px solid var(--teinte);
    padding-left: var(--e4);
  }

  .encart h3 {
    font-family: var(--police-titre);
    font-style: italic;
    font-size: var(--t-titre);
    font-weight: 700;
    margin: var(--e2) 0 var(--e3);
    color: var(--or-clair);
  }

  .retour {
    background: none;
    border: none;
    padding: 0;
    color: var(--sur-fond-doux);
    font-weight: 700;
    cursor: pointer;
    font-size: var(--t-petit);
    letter-spacing: 0.02em;
  }

  .retour:hover {
    color: var(--or-clair);
  }

  /* La ligne du rapport, citée telle quelle, avant toute explication. */
  .extrait {
    margin: 0 0 var(--e3);
    padding: var(--e3) var(--e3);
    background: rgb(255 255 255 / 8%);
    border-left: 2px solid color-mix(in srgb, var(--teinte) 70%, transparent);
    border-radius: 4px;
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
    line-height: 1.5;
    font-style: italic;
  }

  /* Ce qui se passe, en une ligne. Le reste est facultatif. */
  .synthese {
    margin: 0 0 var(--e3);
    font-size: var(--t-lead);
    font-weight: 650;
    line-height: 1.4;
    color: var(--sur-fond);
  }

  /* Chez vous, en pratique. La phrase qui empêche de retomber dans le cours. */
  .pratique {
    margin: 0 0 var(--e4);
    font-style: italic;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--or-clair);
  }

  .ouvertures {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e2);
    margin-bottom: var(--e3);
  }

  .creuser {
    background: none;
    border: 1px solid rgb(230 200 148 / 40%);
    border-radius: 0;
    padding: var(--e2) var(--e4);
    font-size: var(--t-petit);
    font-weight: 700;
    color: var(--or-clair);
    cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease;
  }

  .creuser:hover,
  .creuser.ouvert {
    background: rgb(255 255 255 / 10%);
    border-color: var(--or);
  }

  .detail {
    margin-bottom: var(--e3);
  }

  /* La feuille : tout ce qui est dessiné se pose sur du papier crème, avec son
     encre sombre. Sur le vert, un schéma disparaît.

     Elle déborde des marges de l'encart : le dessin est la pièce principale,
     pas une illustration glissée dans un paragraphe. */
  .feuille {
    position: relative;
    background: var(--papier);
    border-radius: var(--rayon-petit);
    padding: var(--e4) var(--e4);
    margin: 0 -var(--e4) var(--e4);
    color: var(--encre);
    box-shadow: var(--ombre);
  }

  .feuille :global(svg) {
    width: 100%;
    height: auto;
  }

  /* Le schéma en pleine page : le fond du site s'assombrit, la feuille prend
     l'écran. On en sort au clic, à la croix, ou avec Échap. */
  .pleine-page {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgb(0 20 14 / 72%);
    backdrop-filter: blur(4px);
    display: grid;
    place-items: center;
    padding: clamp(12px, 3vw, 40px);
    overflow-y: auto;
  }

  .grand-format {
    position: relative;
    width: min(100%, 940px);
    background: var(--papier);
    border-radius: var(--rayon);
    padding: clamp(22px, 4vw, 44px);
    color: var(--encre);
    box-shadow: var(--ombre-forte);
  }

  .grand-format h2 {
    color: var(--vert-700);
    margin-bottom: var(--e4);
  }

  .grand-format :global(svg) {
    width: 100%;
    height: auto;
  }

  .fermer-plein {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: 1px solid var(--trait);
    border-radius: 0;
    padding: var(--e2) var(--e3);
    font-size: var(--t-petit);
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--encre-doux);
    cursor: pointer;
  }

  .fermer-plein:hover {
    background: var(--vert-700);
    border-color: var(--vert-700);
    color: var(--papier);
  }

  /* Le petit bouton d'agrandissement, dans le coin de la vignette. */
  .agrandir {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 30px;
    height: 30px;
    background: none;
    border: 1px solid var(--trait);
    border-radius: 0;
    color: var(--encre-doux);
    cursor: pointer;
    font-size: var(--t-petit);
    line-height: 1;
  }

  .agrandir:hover {
    background: var(--vert-700);
    border-color: var(--vert-700);
    color: var(--papier);
  }

  /* Les questions, posées en légende du dessin : elles font partie du schéma,
     ce n'est pas une liste à côté. */
  .legende {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e2);
    margin-top: var(--e3);
    padding-top: var(--e3);
    border-top: 1px solid var(--trait-fin);
  }

  .etiquette {
    background: none;
    border: 1px solid var(--trait);
    border-left: 3px solid var(--teinte-legende, var(--gris));
    border-radius: 0;
    padding: var(--e2) var(--e3);
    font-size: var(--t-petit);
    font-weight: 600;
    color: var(--encre);
    cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease;
  }

  .etiquette.bon {
    --teinte-legende: #4c9c72;
  }
  .etiquette.moyen {
    --teinte-legende: #c98a2e;
  }
  .etiquette.mauvais {
    --teinte-legende: #c0503c;
  }

  .etiquette:hover,
  .etiquette.ouverte {
    background: var(--papier-doux);
    border-color: var(--teinte-legende);
  }

  .reponse {
    margin-top: var(--e3);
    padding-left: var(--e3);
    border-left: 2px solid var(--teinte-legende, var(--trait));
  }

  .reponse.bon {
    --teinte-legende: #4c9c72;
  }
  .reponse.moyen {
    --teinte-legende: #c98a2e;
  }
  .reponse.mauvais {
    --teinte-legende: #c0503c;
  }

  .reponse li {
    color: var(--encre);
  }

  .reponse li::before {
    background: var(--teinte-legende, var(--gris));
  }

  /* Le risque, posé sur la même feuille que le dessin : un schéma qui ne dit
     pas ce qu'on encourt n'est qu'une jolie image. */
  .risque {
    display: flex;
    gap: var(--e2);
    margin: var(--e3) 0 0;
    padding-top: var(--e3);
    border-top: 1px solid var(--trait-fin);
    font-size: var(--t-base);
    line-height: 1.45;
    color: #8d3323;
  }

  .risque::before {
    content: '△';
    flex: none;
    font-weight: 700;
  }

  /* Des puces, pas des paragraphes : trois ou quatre mots par ligne. */
  .points {
    list-style: none;
    margin: var(--e2) 0 0;
    padding: 0;
    display: grid;
    gap: var(--e2);
  }

  .points li {
    position: relative;
    padding-left: var(--e4);
    font-size: var(--t-base);
    line-height: 1.45;
    color: var(--sur-fond);
  }

  .points li::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 0.55em;
    width: 7px;
    height: 7px;
    border-radius: 2px;
    background: var(--teinte);
  }

  /* Les questions de second niveau : on creuse sans quitter le passage. */
  .suites {
    display: grid;
    gap: var(--e1);
    margin-bottom: var(--e3);
  }

  .suite {
    text-align: left;
    border: 1px solid rgb(255 255 255 / 12%);
    border-left-width: 3px;
    border-radius: var(--rayon-petit);
    padding: var(--e2) var(--e3);
    cursor: pointer;
    font-size: var(--t-base);
    font-weight: 650;
    color: var(--sur-fond);
    background: rgb(255 255 255 / 6%);
    transition: background 0.18s ease, border-color 0.18s ease;
  }

  .suite::before {
    content: '→ ';
    opacity: 0.7;
  }

  .suite.bon {
    border-left-color: var(--etq-a);
  }

  .suite.moyen {
    border-left-color: var(--etq-f);
  }

  .suite.mauvais {
    border-left-color: var(--etq-g);
  }

  .reponse-suite {
    margin: 0 0 var(--e1);
    padding-left: var(--e3);
    border-left: 2px solid rgb(255 255 255 / 18%);
  }

  .reponse-suite.bon {
    border-left-color: var(--etq-a);
  }

  .reponse-suite.moyen {
    border-left-color: var(--etq-f);
  }

  .reponse-suite.mauvais {
    border-left-color: var(--etq-g);
  }

  /* De n'importe quel passage, on peut basculer sur le fond. */
  .passerelles {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e2);
    margin-top: var(--e4);
    padding-top: var(--e3);
    border-top: 1px solid rgb(230 200 148 / 24%);
  }

  .passerelles button {
    background: none;
    border: 1px solid rgb(230 200 148 / 45%);
    color: var(--or-clair);
    border-radius: 0;
    padding: var(--e2) var(--e4);
    font-size: var(--t-petit);
    font-weight: 700;
    cursor: pointer;
    transition: background 0.18s ease;
  }

  .passerelles button:hover {
    background: var(--or);
    color: #17301f;
  }

  @media (max-width: 820px) {
    .deux-colonnes {
      grid-template-columns: 1fr;
    }

    .panneau {
      position: static;
      max-height: none;
    }
  }
</style>
