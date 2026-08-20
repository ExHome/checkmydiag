<script lang="ts">
  /**
   * Le bois en coupe — le visuel de l'état parasitaire.
   *
   * ── Pourquoi ce dessin-là ───────────────────────────────────────────────────
   *
   * Un termite ne se voit pas. Il mange le bois de l'intérieur et laisse la
   * surface intacte : c'est exactement ce que raconte une coupe de tronc, où
   * l'on voit d'un coup ce qu'un mur ferme d'ordinaire. La maquette pose donc un
   * tronc à cernes, et sous lui une case par point sondé. Le dessin est repris
   * tel quel — dégradé, diamètres, opacités des cernes, cascade des cases.
   *
   * Le tronc est en CSS et le disque de cernes en SVG de taille FIXE. C'est la
   * mécanique de la maquette, et ce n'est pas un détail : un SVG étiré sur toute
   * la largeur ferait grossir les cernes avec la colonne — 134 px au lieu de 104
   * sur un écran large — et rognerait le tronc en hauteur.
   *
   * ── Ce qu'il ne dit pas ─────────────────────────────────────────────────────
   *
   * Le document s'appelle « état relatif à la présence de termites », mais il
   * porte souvent trois autres volets : insectes à larves xylophages, mérule et
   * champignons lignivores, constatations diverses. Le moteur les repère sans
   * lire leur conclusion — délibérément : une absence de mérule déduite au jugé
   * serait une faute, pas une information.
   *
   * D'où le verdict TOUJOURS préfixé « Termites : ». Le reste du rapport est
   * annoncé par le moteur lui-même — verdict, titre « État parasitaire », fait
   * « Autres volets du rapport », trois paragraphes d'explication. Ce visuel ne
   * le répète pas une quatrième fois ; il se contente de ne jamais se faire
   * passer pour la conclusion de l'ensemble.
   *
   * ── Ce qui se passe quand on n'a rien pu lire ───────────────────────────────
   *
   * C'est le cas fréquent, pas le cas rare : rapport scanné, modèle inhabituel.
   * Le tronc se voile alors de hachures, le verdict dit « conclusion non lue »,
   * et la grille disparaît plutôt que d'afficher douze cases décoratives. Aucune
   * case n'est jamais dessinée sans une zone lue derrière elle.
   */
  import type { Gravite } from '../../lib/modele';

  /** Ce que le rapport conclut sur les termites, quand la phrase a été lue. */
  type Conclusion = 'sain' | 'indices';

  /**
   * Une zone que le rapport dit avoir sondée.
   *
   * C'est la forme exacte de `Schema` de genre 'pieces' : le parent passe
   * `d.schema.zones` sans rien transformer, et rien ne peut diverger en silence.
   */
  type ZoneSondee = { nom: string; etat: Gravite; detail?: string };

  const {
    conclusion,
    zones,
    page
  }: {
    /** Ce que le rapport conclut sur les termites ; `null` = pas lu. */
    conclusion: Conclusion | null;
    /** Les zones sondées, telles que le rapport les nomme ; `null` = pas lues. */
    zones: ZoneSondee[] | null;
    /** Page du rapport où retrouver ce diagnostic ; `null` = inconnue. */
    page: number | null;
  } = $props();

  const sondees = $derived(zones ?? []);
  const avecIndices = $derived(sondees.filter((z) => z.etat === 'alerte'));

  /**
   * LA CASE QU'ON TOUCHE.
   *
   * La grille était muette pour un voyant : le nom de la zone n'existait que
   * dans un `span` réservé aux lecteurs d'écran. On voyait donc une rangée de
   * carrés colorés sans savoir de quelles pièces il s'agissait — un dessin qui
   * ne dit rien à celui qui le regarde, et tout à celui qui ne le voit pas.
   *
   * Toucher une case la nomme. `ditZone()` écrivait déjà la phrase.
   */
  let touchee = $state<number | null>(null);

  /* `sondees[i]` est `ZoneSondee | undefined` sous `noUncheckedIndexedAccess` :
     on résout la zone ici, une fois, plutôt que d'indexer dans le balisage. */
  const zoneTouchee = $derived(touchee === null ? null : (sondees[touchee] ?? null));

  /*
   * Une zone en alerte l'emporte sur une conclusion « sain ».
   *
   * Si jamais les deux se contredisent — phrase de conclusion négative d'un
   * côté, ligne « présence d'indices » de l'autre — c'est le constat qui gagne.
   * On peut se tromper en signalant un risque qui n'existe pas ; on ne se
   * rattrape pas d'avoir peint en calme un logement infesté.
   */
  const etat = $derived(
    avecIndices.length > 0 || conclusion === 'indices'
      ? 'indices'
      : conclusion === 'sain'
        ? 'sain'
        : 'inconnu'
  );

  /* Le verdict porte son périmètre dans sa première syllabe : ce visuel ne parle
     que des termites, même quand le rapport parle d'autre chose. */
  const verdict = $derived(
    etat === 'indices'
      ? 'Termites : indices relevés'
      : etat === 'sain'
        ? 'Termites : aucun indice relevé'
        : 'Termites : conclusion non lue'
  );

  const pluriel = $derived(sondees.length > 1 ? 's' : '');

  /** L'équivalent en texte d'une case : c'est lui que lit une synthèse vocale. */
  function ditZone(z: ZoneSondee): string {
    if (z.etat === 'alerte') return `${z.nom} — indices d’infestation relevés`;
    if (z.etat === 'attention') return `${z.nom} — à vérifier`;
    if (z.etat === 'neutre') return `${z.nom} — le rapport ne conclut pas`;
    return `${z.nom} — aucun indice relevé`;
  }
</script>

<figure class="visuel">
  <p class="etiquette">Sondage de la charpente</p>

  <!--
    LE TRONC A DISPARU.

    Son propre commentaire le déclarait « entièrement décoratif : tout ce qu'il
    montre est écrit dessous ». Un disque de cernes, un dégradé hors charte, une
    ombre portée, un halo et trois animations d'éclosion — pour ne rien dire de
    plus que la ligne suivante.

    « Pas de schéma décoratif », et « aucune animation pour simplement faire
    joli » : les deux règles visaient exactement cela. Ce qui reste — les zones
    sondées, leur état, la conclusion — est ce que le rapport dit vraiment.
  -->

  {#if sondees.length}
    <!-- Une case par zone réellement lue. Jamais douze cases de principe : la
         grille de la maquette est un gabarit, pas un chiffre. -->
    <ul class="cases" aria-label="Zones sondées, une case par zone">
      {#each sondees as z, i (z.nom + i)}
        <li
          style="--r:{i % 12}"
          class:alerte={z.etat === 'alerte'}
          class:attention={z.etat === 'attention'}
          class:neutre={z.etat === 'neutre'}
          class:touchee={touchee === i}
        >
          <button type="button" aria-pressed={touchee === i} onclick={() => (touchee = touchee === i ? null : i)}>
            <span class="hors-vue">{ditZone(z)}</span>
          </button>
        </li>
      {/each}
    </ul>

    <!-- La réponse, à une place fixe : sans hauteur réservée, chaque touche
         pousserait le bilan et les réserves vers le bas. -->
    <p class="dit-zone" aria-live="polite">
      {#if zoneTouchee}
        {ditZone(zoneTouchee)}
      {:else}
        <span class="invite">Touchez une case pour savoir quelle zone c’est.</span>
      {/if}
    </p>
  {/if}

  <p class="bilan">
    <span>
      {#if sondees.length}
        {sondees.length} zone{pluriel} sondée{pluriel}
      {:else}
        Zones non détaillées
      {/if}
    </span>
    <span class="etat" class:indices={etat === 'indices'} class:inconnu={etat === 'inconnu'}>
      {verdict}
    </span>
  </p>

  {#if avecIndices.length}
    <p class="dit">Indices relevés : {avecIndices.map((z) => z.nom).join(', ')}.</p>
  {/if}

  {#if etat === 'inconnu'}
    <p class="dit">
      La conclusion de ce rapport n’a pas pu être lue automatiquement{page
        ? ` : elle est page ${page}`
        : ''}. Rien n’est affiché ici à sa place.
    </p>
  {:else if !sondees.length}
    <p class="dit">
      Le rapport ne détaille pas les zones sondées. Aucune case n’est dessinée : elles seraient
      inventées.
    </p>
  {/if}
</figure>

<style>
  .visuel {
    margin: 0 0 var(--e4);
  }

  /* L'intitulé de la maquette, remonté de 10,5 à 12 px : c'est le plancher que
     le produit s'est fixé, et il ne se rediscute pas pour un visuel. */
  .etiquette {
    margin: 0 0 var(--e3);
    font-size: var(--t-micro);
    font-weight: 700;
    line-height: 1.4;
    letter-spacing: var(--suivi-large);
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  /* ---- Le tronc ----------------------------------------------------------- */

  /*
   * Le dégradé de la maquette, à la virgule près — y compris le mot-clé
   * `circle`, qui fait rayonner la lumière depuis le centre au lieu de suivre la
   * forme de la boîte. Les trois teintes sont celles du bois : ce sont des
   * couleurs de sujet, pas des couleurs de charte, et elles n'ont pas à passer
   * par un jeton.
   */


  /* Les opacités sont celles de la maquette : .26 pour le cerne extérieur, .2
     pour l'intérieur. C'est ce qui donne au bois sa profondeur. */



  /*
   * Trois durées différentes plutôt que trois délais : sans `fill-mode`, un
   * délai laisserait l'élément à son état final puis le ferait sauter. Les
   * cernes s'ouvrent donc ensemble, mais pas à la même vitesse.
   *
   * Le halo du cœur : la maquette l'obtient par `box-shadow: 0 0 22px`. Un
   * drop-shadow floute sur la moitié du rayon, d'où les 11 px. Statique — un
   * flou ne s'anime jamais.
   */




  /*
   * Le doute se dessine, il ne se colore pas.
   *
   * Les hachures doivent tenir leurs 3:1 sur TOUT le dégradé, du cœur clair au
   * bord brûlé — c'est ce qui décidait des valeurs : 6,42 au point le plus
   * défavorable, 8,61 au plus favorable.
   */

  /* ---- Les points sondés --------------------------------------------------- */

  .cases {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: var(--e2);
    margin: var(--e3) 0 0;
    padding: 0;
    list-style: none;
  }

  /*
   * Le bord passe de la teinte diluée de la maquette (rgba(160,82,45,.42), soit
   * 1,87 sur la carte) à l'accent plein de l'univers, qui tient 6,99. Une case
   * porte une information — combien de zones, et lesquelles coincent : elle doit
   * se voir. Le fond, lui, garde la dilution de la maquette.
   *
   * L'état de repos EST l'image 0 % de `respire`. C'est ce qui permet de garder
   * le sens de la maquette — les cases s'allument en cascade — sans le saut
   * qu'un `animation-delay` sans `fill-mode` provoquerait au démarrage.
   */
  /* Le bouton remplit sa case : la cible est le carré entier, pas un point au
     milieu. Il n'apporte aucun style propre — la case garde le sien. */
  .cases li button {
    appearance: none;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    background: none;
    border: none;
    border-radius: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .cases li button:focus-visible {
    outline: 2px solid var(--u-texte, #f5f1e8);
    outline-offset: 2px;
  }

  /* La case touchée : elle sort du lot par un anneau et cesse de respirer —
     l'animation d'attente n'a plus lieu d'être une fois qu'on l'a choisie. */
  .cases li.touchee {
    opacity: 1;
    transform: scale(1);
    animation: none;
    box-shadow: 0 0 0 2.5px var(--u-texte, #f5f1e8);
  }

  /*
   * LA RÉPONSE, À UNE PLACE FIXE.
   *
   * Réservée d'avance : sans hauteur minimale, chaque touche pousserait le
   * bilan et les réserves vers le bas, et le lecteur perdrait de vue la case
   * qu'il vient de toucher.
   */
  .dit-zone {
    min-height: 34px;
    margin: var(--e3) 0 0;
    padding: 8px var(--e3);
    background: color-mix(in srgb, var(--u-texte, #f5f1e8) 8%, transparent);
    border-radius: var(--rayon-petit);
    font-size: var(--t-petit);
    line-height: 1.4;
    color: var(--u-texte, #f5f1e8);
  }

  .dit-zone .invite {
    opacity: 0.72;
    font-style: italic;
  }

  @media (prefers-reduced-motion: reduce) {
    .cases li.touchee {
      transform: none;
    }
  }

  .cases li {
    position: relative;
    aspect-ratio: 1;
    border: 1.5px solid var(--u-accent, #8b4513);
    border-radius: var(--rayon-petit);
    background: color-mix(in srgb, var(--u-accent, #8b4513) 22%, transparent);
    opacity: 0.6;
    transform: scale(0.93);
    /* `respire 1.9s infinite` battait en boucle au-dessus d'un constat de
       parasites. Une animation qui ne démontre rien n'a pas sa place, et
       celle-ci attirait l'œil sans rien apprendre. */
  }

  /*
   * Ce qui alerte ne bat pas, et ne se distingue pas que par la couleur.
   *
   * Un signal qui clignote finit par se lire comme un décor ; et une différence
   * portée par la seule teinte n'existe pas pour tout le monde — d'où les
   * hachures, qui changent la FORME de la case.
   *
   * `--alerte` et `--alerte-vive` ne suivent jamais l'univers : c'est la règle
   * du design system, et c'est sur la gravité qu'il ne faut pas la casser.
   */
  .cases li.alerte,
  .cases li.attention {
    opacity: 1;
    transform: none;
    animation: none;
  }

  .cases li.alerte {
    background:
      repeating-linear-gradient(-40deg, transparent 0 5px, rgb(255 253 250 / 85%) 5px 7px),
      var(--alerte-vive);
    border-color: var(--alerte);
  }

  .cases li.attention {
    background: color-mix(in srgb, var(--attention) 30%, transparent);
    border-color: var(--attention);
  }

  /* Le rapport ne conclut pas sur cette zone : hachures, dans le vocabulaire des
     plans du produit (app.css, `#hachures-plan`). Ni bon ni mauvais — on ne
     sait pas, et ça se voit. */
  .cases li.neutre {
    background:
      repeating-linear-gradient(
        45deg,
        transparent 0 4px,
        color-mix(in srgb, var(--sur-fond-doux) 60%, transparent) 4px 6px
      ),
      var(--papier);
    border-color: var(--sur-fond-doux);
    opacity: 1;
    transform: none;
    animation: none;
  }

  /* ---- Ce qui se lit ------------------------------------------------------- */

  .bilan {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--e2) var(--e3);
    margin: var(--e3) 0 0;
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond-doux);
  }

  .etat {
    font-weight: 700;
    color: var(--ok);
  }

  .etat.indices {
    color: var(--alerte);
  }

  /* Une conclusion non lue n'a droit à aucune couleur d'état : ni au vert du
     calme, ni au rouge de l'alarme. On ne sait pas. */
  .etat.inconnu {
    color: var(--sur-fond-doux);
  }

  .dit {
    margin: var(--e3) 0 0;
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond-doux);
  }

  .hors-vue {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* ---- Le mouvement -------------------------------------------------------- */

  /*
   * Aucune animation ne porte `fill-mode` : leur état final — ou leur image
   * 0 % pour celles qui bouclent — est l'état naturel de l'élément. Un
   * navigateur qui ne fait pas tourner ses animations affiche quand même le
   * visuel. Le produit a déjà payé cette leçon une fois (app.css, `apparait`).
   */
  @keyframes monte {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }

  @keyframes parait {
    from {
      opacity: 0;
    }
  }

  @keyframes eclot {
    from {
      opacity: 0;
      transform: scale(0.82);
    }
  }

  /*
   * `beat2` de la maquette, au plancher près.
   *
   * Elle part de {opacité .4, scale .9} et culmine à plein : les cases dorment,
   * et la vague les allume l'une après l'autre. Ce sens-là est conservé. Seul
   * le plancher monte de .4 à .6 — en dessous, une case s'efface.
   */
  @keyframes respire {
    0%,
    100% {
      opacity: 0.6;
      transform: scale(0.93);
    }

    50% {
      opacity: 1;
      transform: scale(1);
    }
  }

  /*
   * Svelte n'applique pas cette requête tout seul, et la règle globale de
   * app.css se contente de raccourcir les durées — ce qui, sur une animation
   * infinie, la fait vibrer au lieu de l'arrêter. Ici on l'arrête, et on rend
   * aux cases leur pleine opacité : sans ça, un lecteur qui a demandé moins de
   * mouvement se retrouverait avec une grille figée à 60 % et un bord à 2,9.
   */
  @media (prefers-reduced-motion: reduce) {
    /* Le tronc et ses cernes ont disparu avec le décor : ne restent que les
       cases, dont l'animation d'entrée s'arrête ici. */
    .cases li {
      animation: none;
    }

    .cases li {
      opacity: 1;
      transform: none;
    }
  }
</style>
