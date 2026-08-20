<script lang="ts">
  /**
   * Dicodiag : les mots du métier, tous au même endroit.
   *
   * Le lexique existait déjà, mais seulement au fil du texte — un mot devenait
   * cliquable là où il apparaissait. Encore fallait-il tomber dessus. Ici, ils
   * sont tous là, cherchables, que le mot soit dans votre rapport ou non.
   *
   * Rien n'est inventé : ce sont les mêmes définitions que celles qui
   * s'ouvrent dans le document, écrites une seule fois.
   *
   * ── Pourquoi cet écran ressemble à un livre ─────────────────────────────
   *
   * Il ne lit pas votre rapport, il vous aide à le lire — et il doit se voir.
   * Sept écrans de diagnostic sont bâtis pareil : un fond teinté, des cartes
   * claires posées dessus, une pastille de gravité, une date de validité. Rien
   * de tout cela n'a de sens pour un dictionnaire.
   *
   * Alors la page prend la physique de l'imprimé : le mot-vedette déborde dans
   * la marge comme une entrée de Larousse, les définitions s'enfoncent dans le
   * papier au lieu de flotter dessus, une tranche alphabétique court sur le
   * côté, et c'est le seul endroit du produit où l'on écrit en serif.
   */
  import { GLOSSAIRE, type Terme } from '../lib/analyse/glossaire';
  import { styleUnivers } from '../lib/univers';

  const { surFermer }: { surFermer: () => void } = $props();

  let recherche = $state('');

  /** Sans accents ni casse : on cherche « merule » et on trouve « mérule ». */
  const nu = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();

  const tries = $derived([...GLOSSAIRE].sort((a, b) => a.titre.localeCompare(b.titre, 'fr')));

  const termes = $derived.by(() => {
    const q = nu(recherche);
    if (!q) return tries;
    return tries.filter((t) => nu(t.titre).includes(q) || t.points.some((p) => nu(p).includes(q)));
  });

  /** L'initiale sous laquelle un mot se range, accents mis à plat. */
  const initiale = (t: Terme): string => nu(t.titre).charAt(0).toUpperCase();

  /** Les entrées groupées par lettre, comme dans un dictionnaire. */
  const tranches = $derived.by(() => {
    const par = new Map<string, Terme[]>();
    for (const t of termes) {
      const l = initiale(t);
      const deja = par.get(l);
      if (deja) deja.push(t);
      else par.set(l, [t]);
    }
    return [...par.entries()];
  });

  /** Les lettres qui existent vraiment — la tranche ne promet rien de vide. */
  const lettresPleines = $derived(new Set(tries.map(initiale)));

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  /**
   * Les renvois d'une entrée vers les autres.
   *
   * Un vrai dictionnaire renvoie, et ces renvois ne sont pas décoratifs : ils
   * se déduisent des données. Un terme est lié à un autre quand le motif de
   * reconnaissance de l'un — celui qui sert à le repérer dans les rapports —
   * trouve son mot dans la définition de l'autre. Rien n'est écrit à la main,
   * donc rien ne peut vieillir de travers.
   *
   * Le lien vaut dans LES DEUX SENS, et ce n'était pas le cas au départ :
   * « Énergie finale » citait « Énergie primaire », mais on pouvait lire
   * « Énergie primaire » sans jamais apprendre que l'autre existe. Une seule
   * des deux entrées portait le renvoi, alors que c'est la même parenté.
   * Compter les deux sens fait passer le lexique de 14 renvois à 22, et de 12
   * entrées reliées à 18 sur 49 — sans en inventer un seul. Mesuré par
   * `scripts/renvois-lexique.ts`.
   */
  function renvois(terme: Terme): string[] {
    const texte = terme.points.join(' ');
    const lies = tries.filter((autre) => {
      if (autre.titre === terme.titre) return false;
      // Ce terme-ci cite l'autre…
      if (autre.motif.test(texte)) return true;
      // …ou l'autre cite ce terme-ci.
      return terme.motif.test(autre.points.join(' '));
    });
    return lies.map((autre) => autre.titre).slice(0, 5);
  }

  /** Un terme ouvert à la fois : on lit une définition, pas un dictionnaire. */
  let ouvert = $state<string | null>(null);

  /** Suivre un renvoi : on ouvre l'entrée citée et on va la voir. */
  function suivreLeRenvoi(titre: string): void {
    recherche = '';
    ouvert = titre;
    // Après le rendu : la liste complète revient, l'entrée n'existe pas encore.
    requestAnimationFrame(() => {
      document.getElementById(ancre(titre))?.scrollIntoView({ block: 'center' });
    });
  }

  const ancre = (titre: string) => 'dico-' + nu(titre).replace(/[^a-z0-9]+/g, '-');

  function versLaLettre(lettre: string): void {
    recherche = '';
    requestAnimationFrame(() => {
      document.getElementById('tranche-' + lettre)?.scrollIntoView({ block: 'start' });
    });
  }
</script>

<div class="app-outil" role="dialog" aria-modal="true" aria-label="Dicodiag, le lexique">
  <!-- La barre reste à la charte : elle dit qu'on est toujours dans le même
       produit, même quand la page dessous devient un livre. -->
  <header class="barre">
    <button type="button" class="retour" onclick={surFermer}>
      <span aria-hidden="true">←</span> Retour
    </button>
    <span class="signe" aria-hidden="true">📖</span>
    <p class="nom">Dicodiag</p>
  </header>

  <div class="dedans" style={styleUnivers('dicodiag')}>
    <div class="ouvrage">
      <header class="titraille">
        <h1>Dicodiag</h1>
        <p class="sous">
          Les mots que les rapports emploient sans les expliquer.
          <span class="compte">{GLOSSAIRE.length} entrées</span>
        </p>
      </header>

      <label class="chercher">
        <span class="visuellement-cache">Chercher un mot</span>
        <input
          type="search"
          placeholder="Chercher un mot…"
          bind:value={recherche}
          autocomplete="off"
        />
      </label>

      {#if recherche.trim()}
        <p class="combien" role="status">
          {termes.length === 0
            ? 'Aucune entrée'
            : termes.length === 1
              ? '1 entrée'
              : `${termes.length} entrées`}
        </p>
      {/if}

      {#if termes.length === 0}
        <p class="rien">
          Aucun mot ne correspond. Le lexique ne contient que les termes qu’on rencontre dans les
          rapports — il s’agrandit à mesure qu’on en lit.
        </p>
      {/if}

      <div class="colonnes">
        {#each tranches as [lettre, entrees] (lettre)}
          <section class="tranche" id={'tranche-' + lettre}>
            <h2 class="initiale" aria-label={'Mots en ' + lettre}>{lettre}</h2>

            {#each entrees as terme (terme.titre)}
              {@const estOuvert = ouvert === terme.titre}
              {@const voirAussi = estOuvert ? renvois(terme) : []}
              <article class="entree" id={ancre(terme.titre)} class:ouverte={estOuvert}>
                <button
                  type="button"
                  class="vedette"
                  aria-expanded={estOuvert}
                  onclick={() => (ouvert = estOuvert ? null : terme.titre)}
                >
                  <span class="mot">{terme.titre}</span>
                  <span class="filet" aria-hidden="true"></span>
                  <span class="signe-plus" aria-hidden="true">{estOuvert ? '−' : '+'}</span>
                </button>

                {#if estOuvert}
                  <div class="definition">
                    <ol>
                      {#each terme.points as point (point)}
                        <li>{point}</li>
                      {/each}
                    </ol>

                    {#if voirAussi.length}
                      <p class="renvois">
                        <span class="lib">voir aussi</span>
                        {#each voirAussi as autre, i (autre)}
                          <button type="button" class="renvoi" onclick={() => suivreLeRenvoi(autre)}>
                            {autre}
                          </button>{#if i < voirAussi.length - 1}<span aria-hidden="true">, </span
                          >{/if}
                        {/each}
                      </p>
                    {/if}
                  </div>
                {/if}
              </article>
            {/each}
          </section>
        {/each}
      </div>
    </div>

    <!-- La tranche du livre : on y pose le pouce pour aller à la lettre. -->
    <nav class="gouttiere" aria-label="Aller à une lettre">
      {#each ALPHABET as lettre (lettre)}
        {#if lettresPleines.has(lettre)}
          <button type="button" onclick={() => versLaLettre(lettre)}>{lettre}</button>
        {:else}
          <span aria-hidden="true">{lettre}</span>
        {/if}
      {/each}
    </nav>
  </div>
</div>

<style>
  .app-outil {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--fond);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* La coque, inchangée : même barre que sur les écrans de diagnostic. */
  .barre {
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--e2);
    padding: var(--e2) var(--e3);
    background: rgb(255 255 255 / 82%);
    backdrop-filter: blur(20px);
    border-bottom: 2px solid var(--verriere-vert);
  }

  .retour {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 44px;
    padding: 0 var(--e2);
    background: transparent;
    border: none;
    border-radius: var(--rayon-badge);
    color: var(--action-texte);
    font-size: var(--t-base);
    font-weight: 700;
    cursor: pointer;
  }

  .retour:hover {
    background: var(--surface);
  }

  .signe {
    flex: none;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    font-size: 15px;
    background: linear-gradient(135deg, #8e9bb5, #5c6b8a);
  }

  .nom {
    margin: 0;
    font-size: var(--t-petit);
    font-weight: 700;
    color: var(--sur-fond);
  }

  /*
   * La page. Les jetons de l'univers arrivent en style inline et sont traduits
   * ici dans le vocabulaire du design system, comme sur les écrans de
   * diagnostic — mêmes replis littéraux, jamais `var(--x)` sur lui-même.
   */
  .dedans {
    flex: 1;
    display: flex;
    overflow: hidden;

    background-color: var(--u-fond, #153e4c);
    color: var(--u-texte, #f5f1e8);

    --fond: var(--u-fond, #153e4c);
    --papier: var(--u-surface, #274c58);
    --sur-fond: var(--u-texte, #f5f1e8);
    --sur-fond-doux: var(--u-texte-doux, #cbd8dd);
    --encre: var(--u-texte, #f5f1e8);
    --encre-doux: var(--u-texte-doux, #cbd8dd);
    --gris: var(--u-texte-doux, #cbd8dd);
    --trait: var(--u-trait, #839698);
    --action-forte: var(--u-accent, #bfc5d1);
    --action-texte: var(--u-accent, #bfc5d1);
    --surface: color-mix(in srgb, var(--u-texte, #f5f1e8) 4%, transparent);

    /*
     * Le grain de papier est parti, et c'était le plus urgent.
     *
     * Cet écran portait un bruit fractal en fond — un vrai grain de papier —
     * plus un halo blanc en haut de page. Sur un fond ivoire, cela faisait
     * littéralement du parchemin : « du parchemin de chez tante Véro ». Sur le
     * pétrole, cela n'aurait plus aucun sens.
     *
     * Ce qui reste de l'intention d'origine — un ouvrage qu'on consulte, pas un
     * constat qu'on subit — tient maintenant dans son accent neutre et dans sa
     * mise en page, pas dans une imitation de matière.
     */
    background-image: radial-gradient(120% 60% at 50% -10%, rgb(245 241 232 / 7%), transparent 64%);
  }

  .ouvrage {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: var(--e5) var(--e4) var(--e7);
    min-width: 0;
  }

  .titraille,
  .chercher,
  .combien,
  .rien,
  .colonnes {
    max-width: 760px;
    margin-inline: auto;
  }

  .titraille h1 {
    font-family: 'Fraunces', Georgia, 'Times New Roman', serif;
    font-size: clamp(30px, 7vw, 42px);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0;
    color: var(--sur-fond);
  }

  .sous {
    margin: 6px 0 0;
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond-doux);
  }

  /* Le décompte se lit comme une mention d'ouvrage, pas comme une donnée. */
  .compte {
    font-family: 'Fraunces', Georgia, serif;
    font-style: italic;
    white-space: nowrap;
  }

  .chercher {
    display: block;
    margin: var(--e4) auto var(--e2);
  }

  .chercher input {
    width: 100%;
    min-height: 46px;
    padding: 0 var(--e3);
    font: inherit;
    color: var(--sur-fond);
    background: var(--papier);
    /* Un bord franc, mesuré à 3,63 sur le papier : c'est un champ, il doit se
       voir sans qu'on le cherche. */
    border: 1px solid #8a8072;
    border-radius: 3px;
  }

  .chercher input:focus-visible {
    outline: 2px solid var(--action-forte);
    outline-offset: 1px;
  }

  .combien {
    margin: 0 auto var(--e3);
    font-size: var(--t-micro);
    font-style: italic;
    color: var(--sur-fond-doux);
  }

  .visuellement-cache {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  /*
   * Deux colonnes dès qu'il y a la place — c'est la mise en page du
   * dictionnaire, et elle raccourcit surtout les lignes : une définition de
   * quatre mots n'a pas besoin de 76 caractères de large.
   */
  .colonnes {
    columns: 1;
    column-gap: var(--e6);
  }

  @media (min-width: 900px) {
    .colonnes {
      columns: 2;
    }
  }

  .tranche {
    break-inside: avoid-column;
    margin-bottom: var(--e5);
  }

  /* La lettre de section : grande, en serif, avec son filet. */
  .initiale {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--action-texte);
    margin: 0 0 var(--e2);
    padding-bottom: 5px;
    border-bottom: 1px solid var(--trait);
  }

  .entree {
    break-inside: avoid-column;
  }

  /*
   * Le mot-vedette déborde dans la marge, comme dans un Larousse : c'est ce qui
   * permet de parcourir la colonne à l'œil, sans lire.
   */
  .vedette {
    width: 100%;
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-height: 44px;
    padding: 6px 0;
    margin-left: -10px;
    padding-left: 10px;
    background: none;
    border: none;
    border-radius: 2px;
    color: var(--sur-fond);
    text-align: left;
    cursor: pointer;
    font: inherit;
  }

  .vedette:hover .mot,
  .vedette:focus-visible .mot {
    color: var(--action-texte);
  }

  .vedette:focus-visible {
    outline: 2px solid var(--action-forte);
    outline-offset: 1px;
  }

  .mot {
    font-family: 'Fraunces', Georgia, 'Times New Roman', serif;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: -0.01em;
    flex: none;
    max-width: calc(100% - 40px);
  }

  /* Le filet de conduite, qui mène le regard du mot à son signe. */
  .filet {
    flex: 1;
    height: 1px;
    background: var(--trait);
    transform: translateY(-3px);
  }

  .signe-plus {
    flex: none;
    font-size: 16px;
    color: var(--action-texte);
    line-height: 1;
  }

  /*
   * La définition s'ENFONCE dans la page au lieu de flotter dessus : la surface
   * de cet univers est plus sombre que son fond. C'est la physique d'un encadré
   * dans un livre — et c'est ce qui rend cet écran inutilisable pour un
   * rapport, qui a besoin d'une carte pour y poser sa gravité.
   */
  .definition {
    margin: 2px 0 var(--e3);
    padding: var(--e3) var(--e3) var(--e3) var(--e4);
    background: var(--papier);
    border-left: 2px solid var(--trait);
    border-radius: 2px;
  }

  .definition ol {
    margin: 0;
    padding-left: 1.1em;
    display: grid;
    gap: 6px;
  }

  .definition li {
    font-size: var(--t-petit);
    line-height: 1.6;
    color: var(--sur-fond);
  }

  .definition li::marker {
    color: var(--sur-fond-doux);
    font-size: 0.85em;
  }

  .renvois {
    margin: var(--e3) 0 0;
    padding-top: var(--e2);
    border-top: 1px solid var(--trait);
    font-size: var(--t-micro);
    line-height: 1.7;
    color: var(--sur-fond-doux);
  }

  .lib {
    font-family: 'Fraunces', Georgia, serif;
    font-style: italic;
    margin-right: 5px;
  }

  .renvoi {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    color: var(--action-texte);
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  }

  .renvoi:hover {
    text-decoration-thickness: 2px;
  }

  .rien {
    padding: var(--e4);
    background: var(--papier);
    border-left: 2px solid var(--trait);
    font-size: var(--t-petit);
    line-height: 1.6;
    color: var(--sur-fond);
  }

  /*
   * La tranche du livre. Elle ne propose que les lettres qui existent : une
   * lettre cliquable qui ne mène à rien est une promesse en l'air.
   */
  .gouttiere {
    flex: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1px;
    padding: var(--e2) 6px;
    border-left: 1px solid var(--trait);
    background: color-mix(in srgb, var(--u-texte, #f5f1e8) 3%, transparent);
    overflow: hidden;
  }

  .gouttiere button,
  .gouttiere span {
    display: block;
    width: 22px;
    padding: 1px 0;
    background: none;
    border: none;
    font-family: 'Fraunces', Georgia, serif;
    font-size: 10.5px;
    font-weight: 700;
    text-align: center;
    line-height: 1.25;
  }

  .gouttiere button {
    color: var(--action-texte);
    cursor: pointer;
    border-radius: 2px;
  }

  .gouttiere button:hover {
    background: var(--papier);
  }

  .gouttiere span {
    /* Les lettres vides : présentes pour que l'alphabet reste un alphabet,
       assez pâles pour qu'on ne cherche pas à les toucher. Décoratives, donc
       hors du seuil de lecture — et retirées des lecteurs d'écran. */
    color: var(--sur-fond-doux);
    opacity: 0.32;
  }

  /* Le dictionnaire ne s'imprime pas : c'est le dossier qu'on imprime. */
  @media print {
    .app-outil {
      display: none;
    }
  }
</style>
