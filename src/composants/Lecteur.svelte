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
  import { tick } from 'svelte';
  import type { Analyse, Diagnostic, TypeDiag } from '../lib/modele';
  import type { PageRendue, Photo } from '../lib/pdf';
  import Explicatif from './schemas/Explicatif.svelte';
  import MiniSchema from './MiniSchema.svelte';
  import Fiche from './Fiche.svelte';
  import Curieux from './Curieux.svelte';
  import MotsExpliques from './MotsExpliques.svelte';
  import Notaire from './Notaire.svelte';
  import Diagnostics from './Diagnostics.svelte';
  import Verdict from './Verdict.svelte';
  import Bureau from './Bureau.svelte';
  import { FICHES } from '../lib/analyse/fiches';

  interface Props {
    analyse: Analyse;
    rendus: Map<number, PageRendue>;
    /** Diagnostic demandé de l'extérieur : on descend jusqu'à sa première page. */
    demande?: string | null;
    /** La photo du bien, tirée de la page de garde. */
    photo?: Photo | null;
  }

  const { analyse, rendus, demande = null, photo = null }: Props = $props();

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

  /**
   * Toutes les pages du rapport, dans l'ordre.
   *
   * On n'en montrait que celles qui portaient un passage repéré — le lecteur
   * voyait donc six pages d'un dossier qui en compte cinquante-trois, sans
   * savoir que le reste existait. C'est son document : il doit pouvoir le
   * parcourir en entier, y compris les pages que le moteur n'a rien trouvé à
   * commenter.
   *
   * Les pages s'affichent au fur et à mesure qu'elles sont dessinées.
   */
  const pages = $derived(
    Array.from({ length: analyse.nbPages }, (_, i) => i + 1).filter((n) => rendus.has(n))
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
  async function allerAuDiagnostic(type: TypeDiag): Promise<void> {
    const constat = reperes.findIndex((r) => r.type === type && r.repere.famille === 'constat');
    const i = constat >= 0 ? constat : reperes.findIndex((r) => r.type === type);
    if (i < 0) return;
    // Aller dans le rapport, c'est changer de vue : sans ça, le clic ouvrait
    // un passage que le lecteur ne voyait pas.
    vue = 'rapport';
    // Et il faut attendre que cette vue existe à l'écran avant de viser le
    // passage : sans ce temps d'arrêt, on faisait défiler une vue encore
    // cachée, et le lecteur voyait l'onglet changer sans que rien ne bouge.
    await tick();

    /*
     * Deux défilements, et non un seul : le fac-similé du rapport a son propre
     * ascenseur. `allerAu` y centre le passage, mais cela ne déplace pas la
     * page — le bloc entier pouvait rester mille pixels plus bas, et le clic
     * semblait sans effet. On amène donc d'abord le document sous les yeux.
     *
     * Le premier saut est instantané, le second reste doux : deux défilements
     * animés en même temps s'annulent, et le lecteur ne bougeait pas d'un
     * pixel.
     */
    document.getElementById('document-rapport')?.scrollIntoView({ behavior: 'instant', block: 'start' });
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
    { cle: 'point', nom: 'L’analyse', quoi: 'Chaque diagnostic, un par un' },
    { cle: 'rapport', nom: 'Le rapport', quoi: 'Toutes les pages, expliquées' },
    { cle: 'conseil', nom: 'Le conseil', quoi: 'Ce qu’il faut en faire' }
  ];

  let vue = $state('point');

  /**
   * Le diagnostic demandé depuis l'état descriptif.
   *
   * Cliquer une tuile ouvre l'analyse sur ce rapport-là : c'est la promesse de
   * la tuile, sinon elle n'est qu'une étiquette. Le compteur force le
   * changement même si l'on redemande deux fois le même diagnostic.
   */
  let diagOuvert = $state<TypeDiag | null>(null);

  /**
   * Le dock de l'écran d'accueil : il change de vue, puis amène l'œil dessus.
   * Sans le défilement, on cliquerait « Le rapport » et rien ne bougerait —
   * l'écran d'accueil occupe déjà toute la hauteur visible.
   */
  function allerALaVue(cle: string): void {
    vue = cle;
    requestAnimationFrame(() => {
      document.getElementById('les-vues')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function ouvrirDansLAnalyse(type: TypeDiag): void {
    vue = 'point';
    diagOuvert = type;
    // Le carrousel est plus bas que le bandeau du bien : sans ce saut, le clic
    // changeait un écran qu'on ne voyait pas.
    requestAnimationFrame(() => {
      document.getElementById('analyse-diags')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

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

  /* Le « tout le détail » a disparu : dans une fenêtre pleine page, les points
     s'affichent tous. Un bouton pour les révéler laissait croire que le reste
     du constat était accessoire. */
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

  /* ---- La fenêtre d'explication ------------------------------------------
     L'explication vivait dans une colonne à droite du rapport : sur un
     téléphone elle passait sous le document, et sur un écran large elle
     rétrécissait la page qu'on était en train de lire. Elle occupe maintenant
     l'écran entier — c'est le moment où l'on explique, il mérite toute la
     place. On ferme, le rapport revient exactement où on l'avait laissé. */

  let fermerFenetreBouton: HTMLButtonElement | undefined = $state();

  async function fermerFenetre(): Promise<void> {
    const id = actifId;
    epingle = null;

    /*
     * Le focus retourne au passage d'où l'on vient : au clavier, on ne repart
     * pas du haut du document à chaque fermeture.
     *
     * Il faut attendre que la fenêtre ait vraiment quitté l'écran. Sans ce
     * temps d'arrêt, on posait le focus pendant que le bouton « Fermer »
     * existait encore ; sa disparition, juste après, le renvoyait au corps de
     * la page — et le lecteur au clavier se retrouvait en haut du document.
     */
    if (!id) return;
    await tick();
    document.getElementById(`repere-${id}`)?.focus();
  }

  // À l'ouverture, le focus entre dans la fenêtre : sinon on tabulerait dans le
  // rapport, derrière un écran qu'on ne voit plus.
  $effect(() => {
    if (actif) fermerFenetreBouton?.focus();
  });

  // Le document ne défile pas derrière la fenêtre : on lisait l'explication et
  // le rapport partait tout seul sous elle.
  $effect(() => {
    if (!actif) return;
    const avant = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = avant;
    };
  });

  function auClavierFenetre(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      if (plein) fermerPlein();
      else if (actif) fermerFenetre();
    }
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

<!-- L'écran d'accueil du dossier : le cartouche, puis une tuile par diagnostic.
     C'est la porte d'entrée — on y voit l'état du dossier avant d'avoir lu une
     ligne, et chaque tuile ouvre la fiche correspondante. -->
<Bureau {analyse} surOuvrirDiagnostic={ouvrirDansLAnalyse} surVue={allerALaVue} />

<!-- Ce qu'il faut retenir, avant le dossier lui-même. C'est la seule chose de
     l'écran qui doit être comprise sans rien ouvrir : il est donc au-dessus des
     vues, et il s'affiche même si aucun passage n'a pu être repéré. -->
<Verdict {analyse} {photo} surOuvrirDiagnostic={ouvrirDansLAnalyse} />

{#if reperes.length}
  <section class="lecteur">
    <!-- Trois vues, pas vingt-trois écrans à la file. Le lecteur sait toujours
         où il est et ce qui reste. À l'impression, tout se déplie : le document
         remis n'a pas d'onglets. -->
    <nav class="vues" id="les-vues" aria-label="Les parties du dossier">
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

    <div class="vue" class:cachee={vue !== 'point'} id="analyse-diags">
      <!-- Le dossier diagnostic par diagnostic. On les feuillette : un volet à
           la fois, le bandeau dit lequel. La fiche donne le verdict, le rapport
           en donne la preuve. -->
      <Diagnostics {analyse} surVoirDansLeRapport={allerAuDiagnostic} ouvrir={diagOuvert} />
    </div>

    <div class="vue" class:cachee={vue !== 'rapport'} class:deux-colonnes={true} class:seul={!actif}>
      <div class="document" id="document-rapport">
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

    </div>

    <!--
      La fenêtre d'explication : elle couvre l'écran.

      C'est ici qu'on devient pédagogue. Le rapport dit une phrase de norme ;
      cette fenêtre prend le temps de la traduire — ce que le rapport écrit, ce
      que ça veut dire, le dessin qui le montre, ce qu'on risque, ce qu'il faut
      faire. Tout est déplié : on n'a pas ouvert une fenêtre pleine page pour y
      remettre des boutons « voir plus ».

      On ferme, et le rapport reprend exactement là où on l'avait laissé.
    -->
    {#if actif}
      <!-- Le voile ferme au clic : c'est le geste que tout le monde essaie en
           premier. Il double le bouton et la touche Échap, il ne les remplace
           pas — d'où l'absence de rôle interactif ici. -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="voile" onclick={fermerFenetre}>
        {#key actif.id}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="fenetre"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-fenetre"
            tabindex="-1"
            style:--teinte={actif.teinte}
            onclick={(e) => e.stopPropagation()}
          >
            <header class="tete-fenetre">
              <div class="dit-fenetre">
                <p class="ou-dans-rapport">
                  {#if actif.repere}Page {actif.repere.page} de votre rapport{:else}Votre rapport{/if}
                </p>
                <h3 id="titre-fenetre">{actif.mot}</h3>
              </div>

              <button
                type="button"
                class="fermer-fenetre"
                bind:this={fermerFenetreBouton}
                onclick={fermerFenetre}
              >
                <span aria-hidden="true">✕</span>
                <span class="mot-fermer">Fermer</span>
              </button>
            </header>

            <div class="dedans">
              {#if actif.repere}
                <!-- 1. Ce que dit le document. On cite avant d'interpréter :
                     le lecteur doit pouvoir retrouver la phrase sur sa page. -->
                <section class="bloc">
                  <p class="quoi-bloc">Ce que dit votre rapport</p>
                  <blockquote class="extrait">{actif.repere.extrait}</blockquote>
                </section>

                <!-- 2. La traduction. Tous les points, dépliés : la fenêtre est
                     assez grande pour les porter, et un « tout le détail »
                     laissait croire que le reste était accessoire. -->
                <section class="bloc">
                  <p class="quoi-bloc">Ce que ça veut dire</p>
                  <p class="synthese"><MotsExpliques texte={actif.repere.points[0] ?? ''} /></p>
                  {#if actif.repere.points.length > 1}
                    <ul class="points">
                      {#each actif.repere.points.slice(1) as point}
                        <li><MotsExpliques texte={point} /></li>
                      {/each}
                    </ul>
                  {/if}
                </section>

                <!-- 3. Le dessin, en grand. C'est lui qui fait comprendre. -->
                <section class="bloc">
                  <p class="quoi-bloc">Ce qui se passe</p>
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
                        lettre={diagnostic.schema?.genre === 'dpe'
                          ? diagnostic.schema.finale
                          : null}
                      />
                    {/if}
                  </div>
                </section>

                <!-- 4. L'enjeu et le geste, côte à côte : ce qu'on risque n'a de
                     sens qu'avec ce qu'on peut y faire. -->
                {#if diagnostic}
                  <section class="bloc deux">
                    <div>
                      <p class="quoi-bloc">Ce qu’on risque</p>
                      <p class="risque"><MotsExpliques texte={FICHES[diagnostic.type].risque} /></p>
                    </div>
                    <div>
                      <p class="quoi-bloc">Ce qu’il faut faire</p>
                      <p class="faire">
                        <MotsExpliques texte={FICHES[diagnostic.type].quoiFaire} />
                      </p>
                    </div>
                  </section>
                {/if}

                <!-- 5. Ce que ça change chez vous : la phrase qui ramène au
                     logement. Elle ne saute jamais. -->
                <section class="bloc">
                  <p class="quoi-bloc">Chez vous</p>
                  <p class="pratique"><MotsExpliques texte={actif.repere.pratique ?? ''} /></p>
                </section>

                <!-- 6. Les questions qu'on se pose ensuite. Repliées, celles-là :
                     ce sont des embranchements, pas la lecture principale. -->
                {#if actif.repere.suites?.length}
                  <section class="bloc">
                    <p class="quoi-bloc">Les questions qu’on se pose</p>
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
                          <li><MotsExpliques texte={point} /></li>
                        {/each}
                      </ul>
                    {/each}
                  </section>
                {/if}

                <!-- 7. Pour aller plus loin, rattaché au diagnostic du passage. -->
                {#if diagnostic}
                  <section class="bloc">
                    <p class="quoi-bloc">Pour aller plus loin</p>
                    <div class="passerelles">
                      {#if actif.repere.famille !== 'constat'}
                        <button
                          type="button"
                          class:ouverte={rubrique === 'schema'}
                          onclick={() => (rubrique = rubrique === 'schema' ? null : 'schema')}
                        >
                          Le schéma du diagnostic
                        </button>
                      {/if}
                      <button
                        type="button"
                        class:ouverte={rubrique === 'fiche'}
                        onclick={() => (rubrique = rubrique === 'fiche' ? null : 'fiche')}
                      >
                        La fiche complète
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
                  </section>
                {/if}
              {/if}
            </div>

            <!-- La lecture avance sans refermer : passage suivant, dans l'ordre
                 du rapport, et le document suit derrière. -->
            <footer class="pas-a-pas">
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
            </footer>
          </div>
        {/key}
      </div>
    {/if}

    <!-- Le conseil : ce qu'on dirait au client à l'étude, avant de signer. Il
         a son onglet parce que ce n'est ni une lecture du dossier ni une
         lecture du document — c'est ce qu'il faut en faire. -->
    <div class="vue" class:cachee={vue !== 'conseil'}>
      <Notaire {analyse} />
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

<svelte:window onkeydown={auClavierFenetre} />

<style>
  /* Pas de caisson autour du lecteur : le rapport se pose directement sur le
     vert, comme une feuille sur un bureau. C'est lui la matière, pas le cadre. */
  .lecteur {
    margin-bottom: var(--e6);
  }





  /* La barre des vues : collante, elle dit en permanence où l'on est.
     Trois pavés côte à côte, et celui qu'on lit est en relief — un fond plus
     clair, un liseré d'or au sommet, une ombre sous lui. On voit où l'on est
     avant d'avoir lu le mot. */
  .vues {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--e1);
    position: sticky;
    top: 0;
    z-index: 8;
    margin-bottom: var(--e6);
    padding: var(--e2) 0;
    /* Le fond est opaque : la barre passe au-dessus du document quand on
       défile, elle ne doit rien laisser transparaître. */
    background: linear-gradient(180deg, var(--fond) 78%, rgb(9 63 48 / 92%));
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--trait-or);
  }

  .vues button {
    text-align: left;
    background: var(--surface);
    border: 1px solid transparent;
    border-radius: var(--rayon);
    padding: var(--e3) var(--e4);
    cursor: pointer;
    color: var(--sur-fond-doux);
    transition:
      background 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .vues button:hover {
    background: var(--surface-forte);
    color: var(--sur-fond);
  }

  .vues button.courante {
    color: var(--sur-fond);
    background: linear-gradient(180deg, var(--surface-bord), var(--surface-forte));
    border-color: var(--surface-bord);
    border-top-color: var(--or);
    box-shadow: 0 1px 0 var(--surface-forte) inset, 0 14px 26px -18px rgb(0 20 14 / 100%);
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

  @media (max-width: 760px) {
    .vues button {
      padding: var(--e3) var(--e3);
    }

    .nom-vue {
      font-size: var(--t-base);
    }
  }

  @media (max-width: 620px) {
    .quoi-vue {
      display: none;
    }
  }

  .vue.cachee {
    display: none;
  }

  /* Le rapport est seul et centré, toujours.
     Il partageait l'écran avec une colonne d'explication : dès qu'on cliquait,
     le document rétrécissait sous les yeux du lecteur, en pleine lecture.
     L'explication a maintenant sa fenêtre, et la page ne bouge plus. */
  .deux-colonnes {
    display: grid;
    grid-template-columns: minmax(0, 860px);
    justify-content: center;
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
    border-radius: var(--rayon-petit);
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
    background: var(--papier);
    border: 1px solid var(--trait);
    border-radius: var(--rayon-petit);
    padding: var(--e4) var(--e4);
    max-height: 640px;
    overflow-y: auto;
    font-size: var(--t-petit);
    line-height: 1.55;
    color: var(--encre-doux);
    box-shadow: var(--ombre);
    scroll-behavior: smooth;
  }

  .numero-page {
    position: sticky;
    top: -20px;
    margin: var(--e4) -var(--e4) var(--e2);
    padding: var(--e1) var(--e4);
    background: var(--papier-doux);
    color: var(--or-fonce);
    font-size: var(--t-micro);
    font-weight: 800;
    letter-spacing: 0.12em;
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
    border-radius: var(--rayon-petit);
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

  /* ---- La fenêtre d'explication -----------------------------------------
     Elle couvre l'écran : c'est le moment où l'on explique, et il ne se
     partage pas avec le document. Le voile assombrit le rapport sans le faire
     disparaître — on sait d'où l'on vient et où l'on retourne. */
  .voile {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: grid;
    place-items: center;
    padding: clamp(0px, 3vw, 32px);
    background: rgb(0 20 14 / 62%);
    backdrop-filter: blur(6px);
  }

  /*
   * L'animation d'entrée ne décide pas de la visibilité.
   *
   * La fenêtre portait la classe `.apparait`, dont l'animation commence à
   * `opacity: 0` avec `fill-mode: both`. Tant que l'animation ne tourne pas —
   * onglet que le navigateur ne compose pas, moteur qui met les animations en
   * attente — l'élément reste figé sur son image de départ : le voile
   * s'assombrissait, et il n'y avait rien dessus. On cliquait sur le rapport,
   * il ne se passait « rien ».
   *
   * Donc pas de `fill-mode` ici : sans animation, l'élément est à son état
   * naturel, c'est-à-dire visible. Le mouvement est un agrément, jamais la
   * condition d'affichage.
   */
  .fenetre {
    animation: entre-fenetre 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    display: flex;
    flex-direction: column;
    width: min(100%, 880px);
    max-height: 100%;
    background: var(--fond);
    border: 1px solid var(--surface-bord);
    border-top: 3px solid var(--teinte);
    border-radius: var(--rayon);
    box-shadow: 0 40px 90px -30px rgb(0 20 14 / 100%);
    color: var(--sur-fond);
    overflow: hidden;
  }

  /* L'animation ne touche pas à l'opacité, et c'est délibéré.
     Retirer `fill-mode` ne suffisait pas : une animation *en cours* mais qui ne
     progresse pas — un navigateur qui ne compose pas ses images — maintient
     l'élément sur sa première image, opacité comprise. En n'animant que le
     déplacement, le pire qui puisse arriver est une fenêtre douze pixels trop
     bas. Elle reste lisible, et c'est tout ce qui compte. */
  @keyframes entre-fenetre {
    from {
      transform: translateY(12px) scale(0.99);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fenetre {
      animation: none;
    }
  }

  .fenetre :global(.ruban) {
    margin: var(--e4) 0 var(--e3);
  }

  /* L'en-tête ne défile pas : on garde sous les yeux de quoi on parle, et de
     quoi fermer. */
  .tete-fenetre {
    flex: none;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--e4);
    padding: var(--e4) var(--e5);
    border-bottom: 1px solid var(--trait-or);
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--teinte) 14%, transparent),
      transparent
    );
  }

  .ou-dans-rapport {
    margin: 0 0 var(--e1);
    font-size: var(--t-micro);
    letter-spacing: var(--suivi);
    color: var(--sur-fond-doux);
  }

  .tete-fenetre h3 {
    font-family: var(--police-titre);
    font-size: var(--t-titre);
    font-weight: 500;
    line-height: 1.15;
    letter-spacing: -0.022em;
    margin: 0;
    color: var(--or-clair);
  }

  .fermer-fenetre {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: var(--e2);
    /* Une cible confortable au pouce : c'est le bouton qu'on cherche en
       premier quand on veut revenir au document. */
    min-height: 44px;
    padding: var(--e2) var(--e4);
    background: var(--surface-forte);
    border: 1px solid var(--trait-or);
    border-radius: 999px;
    color: var(--sur-fond);
    font-size: var(--t-petit);
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
  }

  .fermer-fenetre:hover {
    background: var(--or);
    border-color: var(--or);
    color: var(--vert-900);
  }

  .dedans {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--e5);
    display: grid;
    gap: var(--e5);
  }

  /* Chaque temps de l'explication est annoncé : ce que dit le rapport, ce que
     ça veut dire, ce qui se passe, ce qu'on risque. Le lecteur sait toujours
     à quelle étape il est. */
  .quoi-bloc {
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    color: var(--or-fonce);
  }

  .bloc.deux {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--e5);
  }

  .bloc .synthese {
    margin: 0;
    font-size: var(--t-lead);
    line-height: 1.5;
    color: var(--sur-fond);
    max-width: var(--mesure);
  }

  .bloc .risque,
  .bloc .faire,
  .bloc .pratique {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.55;
    color: var(--sur-fond-doux);
    max-width: var(--mesure);
  }

  .bloc .faire {
    color: var(--or-clair);
  }

  .bloc .pratique {
    padding-left: var(--e4);
    border-left: 2px solid var(--trait-or);
    color: var(--sur-fond);
  }

  @media (max-width: 620px) {
    .tete-fenetre,
    .dedans {
      padding: var(--e4);
    }

    /* Au téléphone, le mot « Fermer » cède la place à la croix seule : la
       cible reste de quarante-quatre pixels. */
    .mot-fermer {
      display: none;
    }

    .fermer-fenetre {
      padding: var(--e2) var(--e3);
    }
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




  /* La ligne du rapport, citée telle quelle, avant toute explication.
     Sur fond d'or, comme le surlignage qui l'a désignée sur la page : c'est la
     même phrase, du même jaune, retrouvée à deux endroits. */
  .extrait {
    margin: 0;
    padding: var(--e3) var(--e4);
    background: var(--or);
    border-left: 3px solid var(--or-fonce);
    border-radius: var(--rayon-petit);
    font-size: var(--t-base);
    line-height: 1.5;
    color: #17301f;
    quotes: '«\00a0' '\00a0»';
  }

  .extrait::before {
    content: open-quote;
  }

  .extrait::after {
    content: close-quote;
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
    background: var(--surface-bord);
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
    --teinte-legende: var(--petrole);
  }
  .etiquette.moyen {
    --teinte-legende: var(--attention);
  }
  .etiquette.mauvais {
    --teinte-legende: var(--coral);
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
    --teinte-legende: var(--petrole);
  }
  .reponse.moyen {
    --teinte-legende: var(--attention);
  }
  .reponse.mauvais {
    --teinte-legende: var(--coral);
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
    border: 1px solid var(--surface-bord);
    border-left-width: 3px;
    border-radius: var(--rayon-petit);
    padding: var(--e2) var(--e3);
    cursor: pointer;
    font-size: var(--t-base);
    font-weight: 650;
    color: var(--sur-fond);
    background: var(--surface-forte);
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
    border-left: 2px solid var(--surface-bord);
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
