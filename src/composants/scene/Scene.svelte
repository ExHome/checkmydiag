<script lang="ts">
  /**
   * UNE SCÈNE, ET LA LUMIÈRE QU'ON Y BRAQUE.
   *
   * Ordre d'Aude : « je souhaite que l'on puisse cliquer dessus comme une mise
   * en lumière ». Le produit s'appelle Verrière et promet de faire entrer la
   * lumière sur un document opaque : toucher une partie du schéma doit donc
   * l'ÉCLAIRER, pas ouvrir une bulle par-dessus.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * LA MÉCANIQUE, ET POURQUOI ELLE EST AUSSI SIMPLE
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Première idée : un faisceau coloré peint au-dessus de la scène. Mesuré, il
   * est inconstruisible — une couleur de l'arrêté DPE posée sur un plateau
   * éclairé tombe à 1,43 de contraste pour la classe A et 1,30 pour la G,
   * quand un élément graphique en exige 3.
   *
   * La lumière est donc portée par l'OPACITÉ de chaque brique : 0,28 au repos,
   * 1 sous le faisceau. Rien n'est peint par-dessus, aucune coordonnée n'est
   * calculée en JavaScript, et la couleur d'état reste intacte — elle dit la
   * gravité, elle ne sert pas d'éclairage.
   *
   * Deux briques ne peuvent pas être éclairées à la fois : c'est un
   * projecteur, pas un surligneur.
   *
   * ── CE QUI RESTE VISIBLE DANS LE NOIR ──────────────────────────────────
   *
   * Le reste de la scène ne disparaît pas : 0,28 laisse voir la forme, la
   * position, le voisinage. On comprend qu'on regarde UNE pièce d'un ensemble,
   * et non une pièce seule. C'est la différence entre éclairer et masquer.
   */
  import {
    briquesTouchables,
    compter,
    OPACITE_ECLAIREE,
    OPACITE_REPOS,
    phraseDe,
    type Brique,
    type Scene
  } from './scene';

  const { scene, largeur = 100, hauteur = 60 }: { scene: Scene; largeur?: number; hauteur?: number } =
    $props();

  /** La brique sous le faisceau. `null` = plein feu, tout est lisible. */
  let eclairee = $state<string | null>(null);

  const touchables = $derived(briquesTouchables(scene));
  const comptes = $derived(compter(scene));
  const active = $derived(touchables.find((b) => 'id' in b && b.id === eclairee) ?? null);

  function identifiant(b: Brique): string {
    return 'id' in b ? b.id : '';
  }

  /**
   * L'opacité d'une brique.
   *
   * Tant que rien n'est éclairé, tout est à pleine lumière : un schéma qu'on
   * n'a pas encore touché doit se lire entièrement. C'est le clic qui crée la
   * pénombre, jamais l'arrivée sur l'écran.
   */
  function opaciteDe(b: Brique): number {
    if (!eclairee) return OPACITE_ECLAIREE;
    return identifiant(b) === eclairee ? OPACITE_ECLAIREE : OPACITE_REPOS;
  }

  function basculer(b: Brique): void {
    const id = identifiant(b);
    eclairee = eclairee === id ? null : id;
  }

  /** La couleur d'état. Elle dit la gravité, et elle seule. */
  function teinteDe(b: Brique): string {
    if (b.forme === 'volume') return 'var(--trait-fin, #dfe6db)';
    switch (b.etat) {
      case 'alerte':
        return 'var(--alerte, #a33220)';
      case 'attention':
        return 'var(--attention, #8a5a05)';
      case 'bon':
        return 'var(--ok, #12463b)';
      case 'nonControle':
      case 'nonConclu':
        /* Ni vert ni rouge : ces deux-là ne concluent rien. Le motif tireté,
           posé plus bas, les distingue à l'œil sans passer par la couleur. */
        return 'var(--gris, #58775f)';
    }
  }

  /**
   * Le trait tireté des états qui ne concluent pas.
   *
   * Un statut porté par la seule couleur est invisible pour huit pour cent des
   * hommes. L'ordre l'exige d'ailleurs en toutes lettres : « distinguables par
   * le texte et l'icône, pas uniquement par la couleur ».
   */
  function traitDe(b: Brique): string {
    if (b.forme === 'volume') return '';
    return b.etat === 'nonControle' || b.etat === 'nonConclu' ? '4 3' : '';
  }
</script>

<figure class="scene">
  <figcaption class="scene__titre">
    <h3>{scene.titre}</h3>
    <p class="scene__question">{scene.question}</p>
  </figcaption>

  <!--
    Le dessin. `role="group"` et non `img` : ses parties sont touchables, et un
    lecteur d'écran doit pouvoir les parcourir une par une plutôt que d'entendre
    une description unique.
  -->
  <svg
    class="scene__dessin"
    viewBox="0 0 {largeur} {hauteur}"
    role="group"
    aria-label={scene.question}
  >
    {#each scene.briques as b, i (identifiant(b) || 'v' + i)}
      {#if b.forme === 'volume'}
        <path d={b.d} class="volume" opacity={opaciteDe(b)} />
      {:else if b.forme === 'jalon'}
        <circle
          cx={b.x}
          cy={b.y}
          r="3"
          class="brique"
          fill={teinteDe(b)}
          opacity={opaciteDe(b)}
          stroke-dasharray={traitDe(b)}
          role="button"
          tabindex="0"
          aria-pressed={eclairee === b.id}
          aria-label={phraseDe(b)}
          onclick={() => basculer(b)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              basculer(b);
            }
          }}
        />
      {:else}
        <path
          d={b.d}
          class="brique"
          fill={teinteDe(b)}
          opacity={opaciteDe(b)}
          stroke-dasharray={traitDe(b)}
          role="button"
          tabindex="0"
          aria-pressed={eclairee === b.id}
          aria-label={phraseDe(b)}
          onclick={() => basculer(b)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              basculer(b);
            }
          }}
        />
      {/if}
    {/each}
  </svg>

  <!--
    LA LÉGENDE SOUS LA LUMIÈRE.

    Elle prend la place du dessin quand une brique est éclairée : le lecteur
    regarde une seule chose à la fois. Sinon, elle donne le compte — et le
    compte n'est pas un verdict, c'est une répartition.
  -->
  <p class="scene__dit" aria-live="polite">
    {#if active}
      {phraseDe(active)}
    {:else}
      {comptes.alerte > 0 ? `${comptes.alerte} point${comptes.alerte > 1 ? 's' : ''} qui coince${comptes.alerte > 1 ? 'nt' : ''}` : ''}
      {comptes.attention > 0 ? `${comptes.alerte > 0 ? ' · ' : ''}${comptes.attention} à surveiller` : ''}
      {comptes.nonControle > 0
        ? `${comptes.alerte + comptes.attention > 0 ? ' · ' : ''}${comptes.nonControle} non contrôlé${comptes.nonControle > 1 ? 's' : ''}`
        : ''}
      {comptes.nonConclu > 0
        ? `${comptes.alerte + comptes.attention + comptes.nonControle > 0 ? ' · ' : ''}${comptes.nonConclu} que nous n’avons pas su lire`
        : ''}
      {comptes.bon > 0 && comptes.alerte + comptes.attention + comptes.nonControle + comptes.nonConclu === 0
        ? `${comptes.bon} regardé${comptes.bon > 1 ? 's' : ''}, rien de signalé`
        : ''}
    {/if}
  </p>

  <!--
    CE QUE LA SCÈNE NE MONTRE PAS.

    Jamais replié : un schéma qui se tait sur ses angles morts laisse croire
    qu'il est complet, et c'est la mécompréhension la plus coûteuse du
    diagnostic.
  -->
  {#if scene.horsChamp.length}
    <ul class="scene__hors-champ">
      {#each scene.horsChamp as h (h.texte)}
        <li>{h.texte}</li>
      {/each}
    </ul>
  {/if}
</figure>

<style>
  .scene {
    margin: var(--e5) 0;
  }

  .scene__titre h3 {
    margin: 0;
    font-size: var(--t-titre-petit);
    color: var(--sur-fond);
  }

  /* La question parle de Verrière, pas du rapport : elle prend sa voix. */
  .scene__question {
    margin: 2px 0 var(--e3);
    font-family: var(--police-voix);
    font-style: italic;
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  .scene__dessin {
    display: block;
    width: 100%;
    height: auto;
  }

  /* Le volume ne se touche pas : il porte le décor, pas l'information. */
  .volume {
    fill: none;
    stroke: var(--trait-fin, #dfe6db);
    stroke-width: 0.6;
  }

  .brique {
    cursor: pointer;
    stroke: var(--sur-fond, #0a2b23);
    stroke-width: 0.5;
    /* La transition porte l'opacité seule : rien ne bouge, rien ne grossit.
       Une brique qui se déplace sous le doigt ferait perdre le fil. */
    transition: opacity var(--duree, 0.2s) var(--courbe, ease);
  }

  .brique:focus-visible {
    outline: 3px solid var(--sur-fond, #0a2b23);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .brique {
      transition: none;
    }
  }

  .scene__dit {
    margin: var(--e3) 0 0;
    min-height: 2.6em;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--sur-fond);
  }

  .scene__hors-champ {
    margin: var(--e3) 0 0;
    padding-left: var(--e3);
    border-left: 3px solid var(--attention, #8a5a05);
    list-style: none;
    font-family: var(--police-voix);
    font-style: italic;
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond-doux);
  }

  .scene__hors-champ li + li {
    margin-top: 4px;
  }
</style>
