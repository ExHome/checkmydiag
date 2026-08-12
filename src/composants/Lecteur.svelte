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
  import Conclusions from './Conclusions.svelte';

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
    if (i >= 0) allerAu(i);
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
  let schemaOuvert = $state(false);
  let suiteOuverte = $state<string | null>(null);

  // Changer de sujet remet tout au premier niveau : on ne garde pas l'état
  // d'exploration du passage précédent.
  $effect(() => {
    void actifId;
    detailOuvert = false;
    schemaOuvert = false;
    suiteOuverte = null;
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

{#if reperes.length}
  <section class="lecteur">
    <!-- Le relevé des conclusions, en tête : chacune renvoie à la page où elle
         est écrite. C'est le sommaire du dossier, pas un tableau de bord. -->
    <Conclusions {analyse} allerA={allerAuDiagnostic} />

    <div class="deux-colonnes" class:seul={!actif}>
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

                <!-- La phrase qui ramène au logement. Elle ne saute jamais. -->
                <p class="pratique">{actif.repere.pratique}</p>

                <div class="ouvertures">
                  {#if actif.repere.schema}
                    <button
                      type="button"
                      class="creuser"
                      class:ouvert={schemaOuvert}
                      onclick={() => (schemaOuvert = !schemaOuvert)}
                    >
                      {schemaOuvert ? 'Fermer le schéma' : 'Voir le schéma'}
                    </button>
                  {/if}
                  {#if actif.repere.points.length > 1}
                    <button
                      type="button"
                      class="creuser"
                      class:ouvert={detailOuvert}
                      onclick={() => (detailOuvert = !detailOuvert)}
                    >
                      {detailOuvert ? 'Fermer le détail' : 'Le détail'}
                    </button>
                  {/if}
                </div>

                {#if schemaOuvert && actif.repere.schema}
                  <!-- Un dessin se regarde sur du papier, pas sur du vert. -->
                  <div class="feuille apparait">
                    <MiniSchema id={actif.repere.schema} />
                  </div>
                {/if}

                {#if detailOuvert && actif.repere.points.length > 1}
                  <ul class="points detail apparait">
                    {#each actif.repere.points.slice(1) as point}
                      <li>{point}</li>
                    {/each}
                  </ul>
                {/if}

                {#if actif.repere.suites?.length}
                  <div class="suites">
                    {#each actif.repere.suites as suite (suite.question)}
                      <button
                        type="button"
                        class="suite {suite.ton ?? 'moyen'}"
                        class:ouverte={suiteOuverte === suite.question}
                        onclick={() =>
                          (suiteOuverte = suiteOuverte === suite.question ? null : suite.question)}
                      >
                        {suite.question}
                      </button>
                      {#if suiteOuverte === suite.question}
                        <ul class="points reponse-suite apparait {suite.ton ?? 'moyen'}">
                          {#each suite.points as point}
                            <li>{point}</li>
                          {/each}
                        </ul>
                      {/if}
                    {/each}
                  </div>
                {/if}

                <!-- La lecture avance toute seule : passage suivant, dans
                     l'ordre du rapport, avec le document qui suit. -->
                <div class="pas-a-pas">
                  <button
                    type="button"
                    class="fleche"
                    disabled={rang <= 0}
                    onclick={() => allerAu(rang - 1)}
                    aria-label="Passage précédent"
                  >
                    ←
                  </button>
                  <span class="compteur">{rang + 1} / {nbReperes}</span>
                  <button
                    type="button"
                    class="suivant"
                    disabled={rang < 0 || rang >= nbReperes - 1}
                    onclick={() => allerAu(rang + 1)}
                  >
                    Suivant →
                  </button>
                </div>

                <!-- Le fond du sujet, rattaché au diagnostic de ce passage. -->
                {#if diagnostic}
                  <div class="passerelles">
                    <button
                      type="button"
                      class:ouverte={rubrique === 'schema'}
                      onclick={() => (rubrique = rubrique === 'schema' ? null : 'schema')}
                    >
                      Le schéma
                    </button>
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
    {#if !actif && nbReperes}
      <button type="button" class="commencer" onclick={() => allerAu(0)}>
        Lire le rapport avec moi
        <em>{nbReperes} passages, dans l’ordre</em>
      </button>
    {/if}
  </section>
{/if}

<style>
  /* Pas de caisson autour du lecteur : le rapport se pose directement sur le
     vert, comme une feuille sur un bureau. C'est lui la matière, pas le cadre. */
  .lecteur {
    margin-bottom: 40px;
  }





  /* Tant que rien n'est ouvert, le rapport est seul et centré. Dès qu'on
     clique, il se décale pour laisser entrer l'explication. */
  .deux-colonnes {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 366px;
    gap: 28px;
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
    gap: 18px;
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
    font-size: 0.72rem;
    font-weight: 800;
    line-height: 22px;
    text-align: center;
  }

  /* Le fac-similé imite la feuille du rapport : fond clair, encre sombre. */
  .page-texte {
    background: #fdfcf8;
    border: 1px solid var(--trait);
    border-radius: var(--rayon-petit);
    padding: 20px 22px;
    max-height: 640px;
    overflow-y: auto;
    font-size: 0.82rem;
    line-height: 1.55;
    color: #43514a;
    box-shadow: var(--ombre);
    scroll-behavior: smooth;
  }

  .numero-page {
    position: sticky;
    top: -20px;
    margin: 18px -22px 10px;
    padding: 5px 22px;
    background: #f2ede0;
    color: #7a6a4d;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border-block: 1px solid #e6ded0;
  }

  .numero-page:first-child {
    margin-top: -20px;
  }

  .ligne {
    margin: 0 0 3px;
    text-align: left;
  }

  button.ligne {
    display: block;
    width: 100%;
    background: color-mix(in srgb, var(--teinte) 15%, #fff);
    border: none;
    border-left: 4px solid var(--teinte);
    border-radius: 4px;
    padding: 5px 9px;
    margin: 5px 0;
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
    margin-right: 6px;
    border-radius: 50%;
    background: var(--teinte);
    color: #fff;
    font-size: 0.66rem;
    font-weight: 800;
    vertical-align: text-bottom;
  }

  /* L'explication se pose à même le vert, sans caisson. Une feuille de papier
     d'un côté, la parole de l'autre : c'est la mise en page de la plaquette. */
  .panneau {
    position: sticky;
    top: 16px;
    padding: 4px 0 0 4px;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    color: var(--sur-fond);
  }

  .panneau :global(.ruban) {
    margin: 16px 0 14px;
  }


  /* Le bouton qui prend le lecteur par la main. C'est l'action principale de
     l'écran : elle a le droit d'être grosse et dorée. */
  /* Posé sous le document, centré comme lui. */
  .commencer {
    display: block;
    margin: 22px auto 0;
    text-align: center;
    background: none;
    border: 1px solid var(--trait-or);
    border-radius: 0;
    padding: 17px 34px;
    cursor: pointer;
    color: var(--sur-fond);
    font-size: 0.9rem;
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
    font-size: 0.74rem;
    font-style: normal;
    letter-spacing: 0.04em;
    text-transform: none;
    opacity: 0.66;
    margin-top: 5px;
  }

  /* La progression : où j'en suis, et la suite. */
  .pas-a-pas {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid rgb(230 200 148 / 24%);
  }

  .pas-a-pas .fleche {
    width: 38px;
    height: 38px;
    border-radius: 0;
    border: 1px solid var(--trait-or);
    background: none;
    color: var(--or-clair);
    font-size: 1rem;
    cursor: pointer;
  }

  .pas-a-pas .compteur {
    font-family: var(--mono);
    font-size: 0.8rem;
    color: var(--sur-fond-doux);
    font-feature-settings: 'tnum';
  }

  .pas-a-pas .suivant {
    margin-left: auto;
    background: none;
    border: 1px solid var(--trait-or);
    border-radius: 0;
    padding: 12px 22px;
    color: var(--or-clair);
    font-weight: 500;
    font-size: 0.78rem;
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
    padding-left: 17px;
  }

  .encart h3 {
    font-family: var(--police-titre);
    font-style: italic;
    font-size: 1.32rem;
    font-weight: 700;
    margin: 8px 0 14px;
    color: var(--or-clair);
  }

  .retour {
    background: none;
    border: none;
    padding: 0;
    color: var(--sur-fond-doux);
    font-weight: 700;
    cursor: pointer;
    font-size: 0.84rem;
    letter-spacing: 0.02em;
  }

  .retour:hover {
    color: var(--or-clair);
  }

  /* La ligne du rapport, citée telle quelle, avant toute explication. */
  .extrait {
    margin: 0 0 14px;
    padding: 12px 14px;
    background: rgb(255 255 255 / 8%);
    border-left: 2px solid color-mix(in srgb, var(--teinte) 70%, transparent);
    border-radius: 4px;
    font-size: 0.88rem;
    color: var(--sur-fond-doux);
    line-height: 1.5;
    font-style: italic;
  }

  /* Ce qui se passe, en une ligne. Le reste est facultatif. */
  .synthese {
    margin: 0 0 12px;
    font-size: 1.08rem;
    font-weight: 650;
    line-height: 1.4;
    color: var(--sur-fond);
  }

  /* Chez vous, en pratique. La phrase qui empêche de retomber dans le cours. */
  .pratique {
    margin: 0 0 18px;
    font-style: italic;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--or-clair);
  }

  .ouvertures {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
  }

  .creuser {
    background: none;
    border: 1px solid rgb(230 200 148 / 40%);
    border-radius: 999px;
    padding: 8px 17px;
    font-size: 0.86rem;
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
    margin-bottom: 14px;
  }

  /* La feuille : tout ce qui est dessiné se pose sur du papier crème, avec son
     encre sombre. Sur le vert, un schéma disparaît. */
  .feuille {
    background: var(--papier);
    border-radius: var(--rayon-petit);
    padding: 16px 18px;
    margin-bottom: 14px;
    color: var(--encre);
    box-shadow: var(--ombre);
  }

  /* Des puces, pas des paragraphes : trois ou quatre mots par ligne. */
  .points {
    list-style: none;
    margin: 10px 0 0;
    padding: 0;
    display: grid;
    gap: 9px;
  }

  .points li {
    position: relative;
    padding-left: 21px;
    font-size: 1rem;
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
    gap: 6px;
    margin-bottom: 12px;
  }

  .suite {
    text-align: left;
    border: 1px solid rgb(255 255 255 / 12%);
    border-left-width: 3px;
    border-radius: var(--rayon-petit);
    padding: 10px 14px;
    cursor: pointer;
    font-size: 0.95rem;
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
    margin: 0 0 4px;
    padding-left: 15px;
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
    gap: 8px;
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid rgb(230 200 148 / 24%);
  }

  .passerelles button {
    background: none;
    border: 1px solid rgb(230 200 148 / 45%);
    color: var(--or-clair);
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 0.86rem;
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
