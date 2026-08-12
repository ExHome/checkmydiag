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
  import Picto from './Picto.svelte';
  import MiniEtiquette from './MiniEtiquette.svelte';
  import { libelleCourt } from '../lib/libelle';

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
        diag: d,
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
    repere?: Repere;
    rubrique?: 'schema' | 'fiche' | 'curieux';
  }

  const entrees = $derived.by<Entree[]>(() => {
    if (!feuillet) return [];
    const liste: Entree[] = feuillet.reperes.map((r, i) => ({
      id: `r${i}`,
      mot: r.titre,
      teinte: TEINTES[r.ton ?? 'info'],
      repere: r
    }));
    liste.push(
      { id: 'schema', mot: 'Le schéma', teinte: TEINTES.info, rubrique: 'schema' },
      { id: 'fiche', mot: 'Pourquoi ? Quoi faire ?', teinte: TEINTES.info, rubrique: 'fiche' },
      { id: 'curieux', mot: 'Le saviez-vous ?', teinte: TEINTES.info, rubrique: 'curieux' }
    );
    return liste;
  });

  /** Ouvert au clic, et seulement au clic. Reclic : ça se referme. */
  let epingle = $state<string | null>(null);
  const actifId = $derived(epingle);
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
  });

  function epingler(id: string): void {
    epingle = epingle === id ? null : id;
  }

  /* ---- La lecture guidée -------------------------------------------------
     Personne ne sait par où commencer dans un rapport de cent pages. Alors on
     prend le lecteur par la main : passage après passage, dans l'ordre où ils
     viennent, avec le rapport qui suit tout seul. Il peut sortir quand il veut
     en cliquant ailleurs. */

  const nbReperes = $derived(feuillet?.reperes.length ?? 0);
  /** Rang du passage ouvert dans la lecture, ou -1 si on est ailleurs. */
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

</script>

{#if feuillet}
  <section class="lecteur">
    <!-- Les tuiles sont la navigation : on choisit son diagnostic à la couleur
         et au médaillon, pas dans une liste d'onglets. -->
    <nav class="tuiles" aria-label="Diagnostics du dossier">
      {#each feuillets as f, i (f.type)}
        <button
          type="button"
          class="tuile {f.gravite}"
          class:actif={i === ouvert}
          onclick={() => (ouvert = i)}
        >
          <span class="medaille" class:etiquette={f.type === 'dpe'}>
            {#if f.type === 'dpe' && f.diag.schema?.genre === 'dpe'}
              <MiniEtiquette lettre={f.diag.schema.finale} />
            {:else}
              <Picto type={f.type} />
            {/if}
          </span>
          <span class="dit">
            <span class="verdict">{libelleCourt(f.diag)}</span>
            <span class="quoi">{f.titre}</span>
          </span>
        </button>
      {/each}
    </nav>

    <div class="deux-colonnes">
      <div class="document">
        {#if page}
          <div class="page">
            <img src={page.image} alt="Page {feuillet.numero} de votre rapport" />

            {#each feuillet.reperes as repere, i (repere.titre)}
              {@const c = cadre(repere)}
              {#if c}
                <button
                  type="button"
                  id="repere-r{i}"
                  class="surligne"
                  class:actif={actifId === `r${i}`}
                  class:epingle={epingle === `r${i}`}
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
              {/if}
            {/each}
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
                    id="repere-r{idx}"
                    class="ligne surlignee"
                    class:actif={actifId === `r${idx}`}
                    style:--teinte={TEINTES[r?.ton ?? 'info']}
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

      <aside class="panneau">
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

                <div class="passerelles">
                  <button type="button" onclick={() => epingler('schema')}>Le schéma</button>
                  <button type="button" onclick={() => epingler('fiche')}>Quoi faire ?</button>
                </div>
              {:else if actif.rubrique === 'schema' && diagnostic}
                <div class="feuille">
                  <Explicatif
                    type={diagnostic.type}
                    isolation={diagnostic.schema?.genre === 'dpe'
                      ? diagnostic.schema.isolation
                      : null}
                  />
                </div>
              {:else if actif.rubrique === 'fiche' && diagnostic}
                <div class="feuille">
                  <Fiche type={diagnostic.type} />
                </div>
              {:else if actif.rubrique === 'curieux' && diagnostic}
                <div class="feuille">
                  <Curieux type={diagnostic.type} />
                </div>
              {/if}
            </div>
          {/key}
        {:else}
          <!-- Au repos : le verdict, et où cliquer. Rien d'autre. Le sommaire
               des passages, c'est le rapport lui-même, avec ses numéros. -->
          {#if diagnostic}
            <Voyant {diagnostic} />
          {/if}

          <RubanDpe epaisseur={7} />

          {#if nbReperes}
            <button type="button" class="commencer" onclick={() => allerAu(0)}>
              Lire le rapport avec moi
              <em>{nbReperes} passages, dans l’ordre</em>
            </button>
          {/if}

          <p class="invite">Ou cliquez directement sur un numéro dans le rapport.</p>

          <div class="portes">
            <button type="button" onclick={() => epingler('schema')}>Le schéma</button>
            <button type="button" onclick={() => epingler('fiche')}>Pourquoi ? Quoi faire ?</button>
            <button type="button" onclick={() => epingler('curieux')}>Le saviez-vous ?</button>
          </div>
        {/if}
      </aside>
    </div>
  </section>
{/if}

<style>
  /* Pas de caisson autour du lecteur : le rapport se pose directement sur le
     vert, comme une feuille sur un bureau. C'est lui la matière, pas le cadre. */
  .lecteur {
    margin-bottom: 40px;
  }

  /* Les tuiles : la navigation du dossier. On les lit à la couleur avant de les
     lire au mot. Celle qu'on regarde est pleine ; les autres attendent. */
  .tuiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 10px;
    margin-bottom: 24px;
  }

  .tuile {
    display: grid;
    grid-template-columns: 46px 1fr;
    align-items: center;
    gap: 13px;
    text-align: left;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid rgb(255 255 255 / 12%);
    background: rgb(255 255 255 / 6%);
    color: var(--sur-fond);
    cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease, transform 0.15s ease;
  }

  .tuile:hover {
    background: rgb(255 255 255 / 12%);
    transform: translateY(-2px);
  }

  /* La tuile ouverte prend la couleur de sa gravité, pleine. */
  .tuile.actif {
    color: #fff;
    border-color: transparent;
    box-shadow: var(--ombre-forte);
  }

  .tuile.actif.bon {
    background: linear-gradient(150deg, #22a06b, #17835a);
  }

  .tuile.actif.attention {
    background: linear-gradient(150deg, #e79a2e, #cf7f16);
  }

  .tuile.actif.alerte {
    background: linear-gradient(150deg, #dd5540, #c33e2b);
  }

  .tuile.actif.neutre {
    background: linear-gradient(150deg, #6f8279, #586b62);
  }

  .medaille {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    font-size: 22px;
    background: radial-gradient(circle at 32% 26%, #e9d2a5, #d2a358 60%, #a3762f);
    box-shadow: inset 0 -2px 5px rgb(0 0 0 / 22%);
  }

  .medaille.etiquette {
    border-radius: 10px;
    padding: 5px 6px;
    background: rgb(255 255 255 / 94%);
    box-shadow: none;
  }

  .verdict {
    display: block;
    font-weight: 750;
    font-size: 0.98rem;
    line-height: 1.2;
    letter-spacing: -0.01em;
  }

  .quoi {
    display: block;
    font-size: 0.8rem;
    opacity: 0.72;
    line-height: 1.25;
  }

  /* Le rapport tient les deux tiers : c'est ce qu'on est venu lire. L'encart
     l'accompagne, il ne lui dispute pas la place. */
  .deux-colonnes {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 366px;
    gap: 28px;
    align-items: start;
  }

  .page {
    position: relative;
    border-radius: 6px;
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

  .invite {
    margin: 0 0 18px;
    font-size: 0.93rem;
    color: var(--sur-fond-doux);
    font-style: italic;
  }

  /* Le bouton qui prend le lecteur par la main. C'est l'action principale de
     l'écran : elle a le droit d'être grosse et dorée. */
  .commencer {
    display: block;
    width: 100%;
    text-align: left;
    background: linear-gradient(135deg, #e6c894, #d2a358 62%, #b8873f);
    border: none;
    border-radius: 14px;
    padding: 15px 20px;
    margin-bottom: 16px;
    cursor: pointer;
    color: #17301f;
    font-size: 1.06rem;
    font-weight: 750;
    letter-spacing: -0.01em;
    box-shadow: var(--ombre);
    transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
  }

  .commencer:hover {
    transform: translateY(-2px);
    box-shadow: var(--ombre-forte);
    filter: brightness(1.04);
  }

  .commencer em {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    font-style: normal;
    opacity: 0.72;
    margin-top: 2px;
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
    border-radius: 50%;
    border: 1px solid rgb(230 200 148 / 40%);
    background: none;
    color: var(--or-clair);
    font-size: 1rem;
    cursor: pointer;
  }

  .pas-a-pas .compteur {
    font-size: 0.84rem;
    color: var(--sur-fond-doux);
    letter-spacing: 0.04em;
    font-variant-numeric: tabular-nums;
  }

  .pas-a-pas .suivant {
    margin-left: auto;
    background: var(--or);
    border: none;
    border-radius: 999px;
    padding: 10px 20px;
    color: #17301f;
    font-weight: 750;
    font-size: 0.92rem;
    cursor: pointer;
    transition: filter 0.18s ease;
  }

  .pas-a-pas .suivant:hover:not(:disabled) {
    filter: brightness(1.06);
  }

  .pas-a-pas button:disabled {
    opacity: 0.32;
    cursor: default;
  }

  /* Trois portes, en petit, sous l'invite. Elles ne se comptent pas et ne se
     rangent pas : elles sont là si on veut. */
  .portes {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .portes button {
    background: none;
    border: 1px solid rgb(230 200 148 / 35%);
    color: var(--or-clair);
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 0.86rem;
    font-weight: 650;
    cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease;
  }

  .portes button:hover {
    background: rgb(255 255 255 / 10%);
    border-color: var(--or);
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
