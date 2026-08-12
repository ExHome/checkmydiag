<script lang="ts">
  /**
   * Le rapport à gauche, l'explication à droite.
   *
   * On promène une loupe sur son rapport. Quand elle passe sur un passage
   * repéré, l'encart s'ouvre à droite ; quand on s'en va, il se referme. Une
   * seule chose à la fois : un passage, ou une rubrique. Jamais les deux.
   *
   * Un clic épingle l'encart — pour le lire tranquillement, ou pour descendre
   * dedans aussi loin qu'on veut.
   *
   * Les couleurs sont celles du DPE, et elles disent ce que dit la ligne : vert
   * quand c'est bon, orange quand il faut regarder, rouge quand ça coince, or
   * quand c'est une simple donnée.
   */
  import type { Analyse, Diagnostic } from '../lib/modele';
  import type { PageRendue } from '../lib/pdf';
  import Explicatif from './schemas/Explicatif.svelte';
  import MiniSchema from './MiniSchema.svelte';
  import Voyant from './Voyant.svelte';
  import Fiche from './Fiche.svelte';
  import Curieux from './Curieux.svelte';
  import RubanDpe from './RubanDpe.svelte';

  interface Props {
    analyse: Analyse;
    rendus: Map<number, PageRendue>;
    /** Diagnostic demandé depuis le bilan, pour ouvrir le bon onglet. */
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

  const feuillets = $derived(
    analyse.diagnostics
      .filter((d): d is Diagnostic & { reperes: Repere[] } => (d.reperes?.length ?? 0) > 0)
      .map((d) => ({
        type: d.type,
        titre: d.titre,
        gravite: d.gravite,
        numero: d.reperes[0]?.page ?? 1,
        pages: d.feuillets?.filter((n) => analyse.textePages[n]) ?? [d.reperes[0]?.page ?? 1],
        reperes: d.reperes
      }))
  );

  let ouvert = $state(0);

  // Le bilan désigne un diagnostic : on ouvre son onglet et on l'amène à l'écran.
  $effect(() => {
    if (!demande) return;
    const index = feuillets.findIndex((f) => f.type === demande);
    if (index >= 0) ouvert = index;
    document.querySelector('.lecteur')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const feuillet = $derived(feuillets[ouvert] ?? feuillets[0] ?? null);
  const page = $derived(feuillet ? (rendus.get(feuillet.numero) ?? null) : null);
  const diagnostic = $derived(
    feuillet ? (analyse.diagnostics.find((d) => d.type === feuillet.type) ?? null) : null
  );

  /** Ce qu'on peut ouvrir : les passages du rapport, puis les rubriques de fond. */
  interface Entree {
    id: string;
    mot: string;
    teinte: string;
    groupe: string;
    repere?: Repere;
    rubrique?: 'schema' | 'fiche' | 'curieux';
  }

  /* L'ordre est celui de la curiosité : le constat, puis les chiffres, puis le
     vocabulaire, puis le fond. On ne commence jamais par la théorie. */
  const GROUPES = [
    { cle: 'constat', titre: 'Ce que dit le diagnostic' },
    { cle: 'donnee', titre: 'Les chiffres du dossier' },
    { cle: 'mot', titre: 'Les mots du métier' },
    { cle: 'fond', titre: 'Aller plus loin' }
  ];

  /** Le tiroir ouvert dans la carte. Le premier l'est d'office. */
  let tiroir = $state<string | null>('constat');

  const entrees = $derived.by<Entree[]>(() => {
    if (!feuillet) return [];
    const liste: Entree[] = feuillet.reperes.map((r, i) => ({
      id: `r${i}`,
      mot: r.titre,
      teinte: TEINTES[r.ton ?? 'info'],
      groupe: r.famille ?? 'donnee',
      repere: r
    }));
    liste.push(
      { id: 'schema', mot: 'Le schéma', teinte: TEINTES.info, groupe: 'fond', rubrique: 'schema' },
      {
        id: 'fiche',
        mot: 'Pourquoi ? Quoi faire ?',
        teinte: TEINTES.info,
        groupe: 'fond',
        rubrique: 'fiche'
      },
      {
        id: 'curieux',
        mot: 'Le saviez-vous ?',
        teinte: TEINTES.info,
        groupe: 'fond',
        rubrique: 'curieux'
      }
    );
    return liste;
  });

  /** Survolé à la loupe : ça s'ouvre, ça se referme quand on part. */
  let survol = $state<string | null>(null);
  /** Épinglé au clic : ça reste, on peut descendre dedans. */
  let epingle = $state<string | null>(null);
  const actifId = $derived(epingle ?? survol);
  const actif = $derived(entrees.find((e) => e.id === actifId) ?? null);

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

  // Changer de diagnostic referme tout.
  $effect(() => {
    void ouvert;
    epingle = null;
    survol = null;
  });

  /* Passer du surlignage à l'encart traverse un vide : sans ce délai, l'encart
     se refermerait entre les deux. */
  let minuterie: ReturnType<typeof setTimeout> | null = null;

  function entre(id: string): void {
    if (minuterie) clearTimeout(minuterie);
    survol = id;
  }

  function sort(): void {
    if (minuterie) clearTimeout(minuterie);
    minuterie = setTimeout(() => (survol = null), 240);
  }

  function epingler(id: string): void {
    epingle = epingle === id ? null : id;
    survol = epingle ? id : null;
  }

  function cadre(r: Repere) {
    if (!page) return null;
    const marge = 3;
    return {
      left: ((r.x - marge) / page.largeur) * 100,
      top: ((page.hauteur - r.y - r.hauteur) / page.hauteur) * 100,
      width: ((r.largeur + marge * 2) / page.largeur) * 100,
      height: ((r.hauteur + marge * 2) / page.hauteur) * 100
    };
  }

  /* ---- La loupe ---------------------------------------------------------- */

  const RAYON = 74;
  const GROSSISSEMENT = 2.3;

  let loupe = $state<{ x: number; y: number; l: number; h: number } | null>(null);

  function promener(e: PointerEvent): void {
    if (e.pointerType !== 'mouse' || !page) return;
    const boite = (e.currentTarget as HTMLElement).getBoundingClientRect();
    loupe = {
      x: e.clientX - boite.left,
      y: e.clientY - boite.top,
      l: boite.width,
      h: boite.height
    };
  }
</script>

{#if feuillet}
  <section class="carte lecteur">
    <nav class="onglets" aria-label="Diagnostics du dossier">
      {#each feuillets as f, i (f.type)}
        <button
          type="button"
          class="onglet {f.gravite}"
          class:actif={i === ouvert}
          onclick={() => (ouvert = i)}
        >
          {f.titre}
          <span class="page-num">p. {f.numero}</span>
        </button>
      {/each}
    </nav>

    <div class="deux-colonnes">
      <div class="document">
        {#if page}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="page"
            onpointermove={promener}
            onpointerleave={() => (loupe = null)}
          >
            <img src={page.image} alt="Page {feuillet.numero} de votre rapport" />

            {#each feuillet.reperes as repere, i (repere.titre)}
              {@const c = cadre(repere)}
              {#if c}
                <button
                  type="button"
                  class="surligne"
                  class:actif={actifId === `r${i}`}
                  class:epingle={epingle === `r${i}`}
                  style:--teinte={TEINTES[repere.ton ?? 'info']}
                  style:left="{c.left}%"
                  style:top="{c.top}%"
                  style:width="{c.width}%"
                  style:height="{c.height}%"
                  aria-label={repere.titre}
                  onmouseenter={() => entre(`r${i}`)}
                  onmouseleave={sort}
                  onfocus={() => entre(`r${i}`)}
                  onblur={sort}
                  onclick={() => epingler(`r${i}`)}
                >
                  <span class="puce">{i + 1}</span>
                </button>
              {/if}
            {/each}

            {#if loupe}
              <div
                class="loupe"
                style:left="{loupe.x}px"
                style:top="{loupe.y}px"
                style:width="{RAYON * 2}px"
                style:height="{RAYON * 2}px"
                style:background-image="url({page.image})"
                style:background-size="{loupe.l * GROSSISSEMENT}px {loupe.h *
                  GROSSISSEMENT}px"
                style:background-position="{RAYON - loupe.x * GROSSISSEMENT}px {RAYON -
                  loupe.y * GROSSISSEMENT}px"
              ></div>
            {/if}
          </div>
        {:else}
          <!-- Pas d'image de page : le texte du rapport, page après page, avec
               les mêmes lignes vivantes. -->
          <div class="page-texte" aria-label="Texte du rapport">
            {#each feuillet.pages as numero (numero)}
              <p class="numero-page">page {numero}</p>
              {#each analyse.textePages[numero] ?? [] as ligne}
                {@const idx = feuillet.reperes.findIndex(
                  (r) => r.page === numero && ligne.includes(r.extrait)
                )}
                {#if idx >= 0}
                  {@const r = feuillet.reperes[idx]}
                  <button
                    type="button"
                    class="ligne surlignee"
                    class:actif={actifId === `r${idx}`}
                    style:--teinte={TEINTES[r?.ton ?? 'info']}
                    onmouseenter={() => entre(`r${idx}`)}
                    onmouseleave={sort}
                    onfocus={() => entre(`r${idx}`)}
                    onblur={sort}
                    onclick={() => epingler(`r${idx}`)}
                  >
                    <span class="puce-ligne">{idx + 1}</span>
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

      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <aside
        class="panneau"
        onmouseenter={() => actifId && entre(actifId)}
        onmouseleave={sort}
      >
        {#if actif}
          {#key actif.id}
            <div class="encart apparait" style:--teinte={actif.teinte}>
              <button type="button" class="retour" onclick={() => ((epingle = null), (survol = null))}>
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
                  <div class="detail apparait">
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

                <!-- D'ici, on peut toujours aller plus loin. -->
                <div class="passerelles">
                  <button type="button" onclick={() => epingler('schema')}>Le schéma</button>
                  <button type="button" onclick={() => epingler('fiche')}>Quoi faire ?</button>
                </div>
              {:else if actif.rubrique === 'schema' && diagnostic}
                <Explicatif
                  type={diagnostic.type}
                  isolation={diagnostic.schema?.genre === 'dpe'
                    ? diagnostic.schema.isolation
                    : null}
                />
              {:else if actif.rubrique === 'fiche' && diagnostic}
                <Fiche type={diagnostic.type} />
              {:else if actif.rubrique === 'curieux' && diagnostic}
                <Curieux type={diagnostic.type} />
              {/if}
            </div>
          {/key}
        {:else}
          <!-- Rien n'est touché : on ne dit rien, on montre juste où aller. -->
          {#if diagnostic}
            <Voyant {diagnostic} />
          {/if}

          <RubanDpe epaisseur={7} />

          <p class="invite">Promenez-vous sur le rapport. Ça s’explique tout seul.</p>

          <!-- Trois tiroirs fermés plutôt que vingt lignes ouvertes : on voit
               tout de suite ce qu'il y a, on ouvre ce qu'on veut. -->
          {#each GROUPES as groupe (groupe.cle)}
            {@const dedans = entrees.filter((e) => e.groupe === groupe.cle)}
            {#if dedans.length}
              <div class="tiroir">
                <button
                  type="button"
                  class="tete"
                  class:ouvert={tiroir === groupe.cle}
                  onclick={() => (tiroir = tiroir === groupe.cle ? null : groupe.cle)}
                >
                  <span class="titre-tiroir">{groupe.titre}</span>
                  <span class="combien">{dedans.length}</span>
                  <span class="chevron" aria-hidden="true"></span>
                </button>

                {#if tiroir === groupe.cle}
                  <ul class="mots apparait">
                    {#each dedans as e (e.id)}
                      <li>
                        <button
                          type="button"
                          class="mot"
                          style:--teinte={e.teinte}
                          onmouseenter={() => entre(e.id)}
                          onmouseleave={sort}
                          onclick={() => epingler(e.id)}
                        >
                          <span class="pastille"></span>
                          <span class="intitule">{e.mot}</span>
                          <span class="chevron" aria-hidden="true"></span>
                        </button>
                      </li>
                    {/each}
                  </ul>
                {/if}
              </div>
            {/if}
          {/each}
        {/if}
      </aside>
    </div>
  </section>
{/if}

<style>
  .lecteur {
    margin-bottom: 24px;
  }

  .onglets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 18px;
  }

  .onglet {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    background: var(--papier-doux);
    border: 1px solid var(--trait);
    border-radius: 999px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 0.92rem;
    color: var(--encre-doux);
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }

  .onglet:hover {
    background: var(--vert-100);
  }

  .onglet.actif {
    background: var(--vert-700);
    border-color: var(--vert-700);
    color: #fff;
    font-weight: 600;
  }

  .page-num {
    font-size: 0.78rem;
    opacity: 0.7;
  }

  .deux-colonnes {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }

  .page {
    position: relative;
    border-radius: var(--rayon-petit);
    overflow: hidden;
    box-shadow: var(--ombre);
    background: #fff;
    line-height: 0;
    cursor: crosshair;
  }

  img {
    width: 100%;
    height: auto;
  }

  /* La loupe : un vrai verre grossissant, cerclé d'or, qui suit la main. */
  .loupe {
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    pointer-events: none;
    background-repeat: no-repeat;
    border: 3px solid var(--or);
    box-shadow:
      0 0 0 1px rgb(0 0 0 / 20%),
      0 10px 26px -8px rgb(0 0 0 / 45%),
      inset 0 0 22px rgb(255 255 255 / 30%);
    z-index: 3;
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

  /* L'encart crème : c'est là que l'explication arrive, en face du rapport. */
  .panneau {
    position: sticky;
    top: 16px;
    background: linear-gradient(180deg, #fdfaf2, var(--papier-doux));
    border: 1px solid var(--trait);
    border-radius: var(--rayon);
    padding: 20px 22px;
    box-shadow: var(--ombre);
    max-height: calc(100vh - 32px);
    overflow-y: auto;
  }

  .panneau :global(.ruban) {
    margin: 14px 0 12px;
  }

  .invite {
    margin: 0 0 14px;
    font-size: 0.94rem;
    color: var(--encre-doux);
    font-style: italic;
  }

  /* Les tiroirs : trois lignes fermées, tout est dedans. */
  .tiroir {
    margin-bottom: 8px;
  }

  .tete {
    display: grid;
    grid-template-columns: 1fr auto 14px;
    align-items: center;
    gap: 10px;
    width: 100%;
    background: none;
    border: none;
    border-bottom: 1px solid var(--trait);
    padding: 11px 2px;
    cursor: pointer;
    text-align: left;
  }

  .titre-tiroir {
    font-weight: 800;
    font-size: 0.98rem;
    color: var(--vert-700);
    font-style: italic;
  }

  .combien {
    display: grid;
    place-items: center;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--vert-100);
    color: var(--vert-700);
    font-size: 0.76rem;
    font-weight: 800;
  }

  .tete.ouvert .chevron {
    transform: rotate(45deg);
  }

  /* Les mots-clés : la carte du territoire. On voit où aller. */
  .mots {
    list-style: none;
    margin: 8px 0 12px;
    padding: 0;
    display: grid;
    gap: 7px;
  }

  .mot {
    display: grid;
    grid-template-columns: 14px 1fr 14px;
    align-items: center;
    gap: 12px;
    width: 100%;
    text-align: left;
    background: #fff;
    border: 1px solid var(--trait);
    border-left: 5px solid var(--teinte);
    border-radius: 10px;
    padding: 11px 14px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--encre);
    transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.12s ease;
  }

  .mot:hover {
    background: color-mix(in srgb, var(--teinte) 13%, #fff);
    transform: translateX(3px);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--teinte) 40%, transparent);
  }

  .pastille {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--teinte);
  }

  .mot.rubrique .pastille {
    background: radial-gradient(circle at 32% 26%, #e9d2a5, #c09048 60%, #a3762f);
  }

  .intitule {
    min-width: 0;
    line-height: 1.25;
  }

  .chevron {
    width: 7px;
    height: 7px;
    border-right: 2.4px solid var(--encre-doux);
    border-bottom: 2.4px solid var(--encre-doux);
    transform: rotate(-45deg);
    justify-self: end;
  }

  /* L'encart : une seule chose à la fois. */
  .encart {
    border-left: 5px solid var(--teinte);
    padding-left: 15px;
  }

  .encart h3 {
    font-size: 1.16rem;
    margin: 6px 0 10px;
    color: var(--encre);
  }

  .retour {
    background: none;
    border: none;
    padding: 0;
    color: var(--encre-doux);
    font-weight: 700;
    cursor: pointer;
    font-size: 0.86rem;
  }

  .retour:hover {
    color: var(--vert-700);
  }

  /* La ligne du rapport, citée telle quelle, avant toute explication. */
  .extrait {
    margin: 0 0 12px;
    padding: 10px 12px;
    background: color-mix(in srgb, var(--teinte) 11%, #fff);
    border-radius: var(--rayon-petit);
    font-size: 0.89rem;
    color: #4a3d24;
    line-height: 1.45;
    font-style: italic;
  }

  /* Ce qui se passe, en une ligne. Le reste est facultatif. */
  .synthese {
    margin: 0 0 12px;
    font-size: 1.04rem;
    font-weight: 700;
    line-height: 1.35;
    color: var(--encre);
  }

  /* Chez vous, en pratique. La phrase qui empêche de retomber dans le cours. */
  .pratique {
    margin: 0 0 14px;
    font-style: italic;
    font-size: 0.95rem;
    line-height: 1.4;
    color: var(--or-fonce);
  }

  .ouvertures {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .creuser {
    background: none;
    border: 1px solid var(--trait);
    border-radius: 999px;
    padding: 7px 15px;
    font-size: 0.86rem;
    font-weight: 700;
    color: var(--vert-700);
    cursor: pointer;
  }

  .creuser:hover,
  .creuser.ouvert {
    background: #fff;
    border-color: var(--teinte);
  }

  .detail {
    margin-bottom: 12px;
  }

  /* Des puces, pas des paragraphes : trois ou quatre mots par ligne. */
  .points {
    list-style: none;
    margin: 10px 0 0;
    padding: 0;
    display: grid;
    gap: 7px;
  }

  .points li {
    position: relative;
    padding-left: 20px;
    font-size: 0.95rem;
    line-height: 1.4;
    color: var(--encre);
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
    border: 1px solid var(--trait);
    border-left-width: 5px;
    border-radius: var(--rayon-petit);
    padding: 9px 13px;
    cursor: pointer;
    font-size: 0.92rem;
    font-weight: 650;
    color: var(--encre);
    background: #fff;
    transition: background 0.15s ease, border-color 0.15s ease;
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
    padding-left: 14px;
    border-left: 3px solid var(--trait);
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
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--trait);
  }

  .passerelles button {
    background: #fff;
    border: 1px solid var(--or);
    color: var(--or-fonce);
    border-radius: 999px;
    padding: 7px 15px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
  }

  .passerelles button:hover {
    background: var(--or);
    color: #fff;
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
