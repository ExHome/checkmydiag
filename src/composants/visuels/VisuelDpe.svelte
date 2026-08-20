<script lang="ts">
  /**
   * L'escalier A→G du DPE.
   *
   * C'est le visuel propre à ce diagnostic, celui de la maquette : sept barres
   * qui montent en marches, la classe du logement encadrée d'un anneau d'encre,
   * puis trois cartouches de chiffres. On ne le réutilise nulle part ailleurs —
   * l'électricité a son tableau, le plomb ses tubes.
   *
   * ── Pourquoi ce composant existe à côté de DoubleSeuil ───────────────────
   *
   * DoubleSeuil répond à une question de méthode (« pourquoi ma classe est-elle
   * la plus mauvaise des deux ? ») et montre deux échelles côte à côte. Ici on
   * répond à la première question du lecteur, avant toute méthode : « je suis à
   * quelle lettre, et qu'est-ce que ça change pour moi ? » — une seule échelle,
   * la position dessus, et les trois chiffres qui décident d'une vente.
   *
   * ── Le cas qui commande tout le dessin : PAS DE LETTRE ────────────────────
   *
   * Le moteur refuse de recalculer la lettre pour un logement de 40 m² ou moins
   * (arrêté du 25 mars 2024, applicable au 1ᵉʳ juillet 2024 — voir
   * `analyse/dpe.ts`, `echellePetiteSurface`). Il ne la recalcule pas davantage
   * quand la consommation, la surface ou les émissions n'ont pas été retrouvées
   * dans le PDF. Dans les deux cas `finale` vaut `null`, et c'est le cas le plus
   * fréquent en vrai.
   *
   * L'escalier ne disparaît pas pour autant, et il ne s'éteint pas non plus :
   * l'échelle A→G est réglementaire, elle est vraie indépendamment de ce
   * logement, il n'y a rien à atténuer. Ce qui disparaît, c'est le DÉSIGNATEUR —
   * pas d'anneau, aucune lettre en encre pleine — et le composant DIT pourquoi.
   *
   * ── Ce que le composant refuse de deviner ─────────────────────────────────
   *
   * Sans `surface`, il ne peut pas distinguer « rapport illisible » de « studio
   * dont on refuse de recalculer la lettre ». Il n'AFFIRME alors aucune des
   * deux : le moteur, lui, tranche déjà dans son verdict, affiché juste à côté.
   * Un message qui se trompe de raison est presque aussi trompeur qu'un mauvais
   * résultat — c'est le commentaire de `analyse/dpe.ts`, et il s'applique ici.
   *
   * ── Les couleurs ──────────────────────────────────────────────────────────
   *
   * Les sept teintes sont celles de l'arrêté, prises aux jetons `--etq-*`. Elles
   * ne se réinventent pas, ne suivent pas l'univers et ne suivent pas le passage
   * au fond sombre : la maquette proposait des teintes adoucies (#2E9E5B,
   * #F5D442, #D8342A…), on garde les officielles — le lecteur a l'étiquette de
   * son rapport sous les yeux, et `DoubleSeuil` les emploie déjà.
   *
   * ── Le fond est passé au pétrole, et ça retourne tout le dessin ────────────
   *
   * Ce visuel était écrit pour du papier clair. Deux mesures suffisent à dire ce
   * que le basculement a cassé, et elles disent l'inverse l'une de l'autre :
   *
   *   Sur le blanc, les marches pâles étaient les invisibles — le D (#fbfe06)
   *   tenait 1,09 et le C (#cbfc34) 1,20. C'est pour elles que le filet
   *   intérieur avait été inventé, en encre SOMBRE.
   *
   *   Sur la carte pétrole (#334c56), ce sont les marches FONCÉES qui
   *   disparaissent : le A (#319834) tombe à 2,46 et le G (#fc0205) à 2,23,
   *   sous le seuil de 3 des éléments non textuels. Le C et le D, eux, montent
   *   à 7,58 et 8,35.
   *
   * Le filet ne disparaît donc pas : il change de camp. En crème à 70 %, il
   * donne son bord aux sept marches, la plus faible étant le G à 4,85 contre la
   * carte. Le sujet ne bouge pas, la lumière si.
   *
   * ── Pourquoi les jetons `--u-*` plutôt que `--papier` / `--encre` ──────────
   *
   * Ce dossier est rendu à deux endroits. Dans l'application ouverte, `.dedans`
   * remappe `--papier` sur `--u-surface` et `--encre` sur `--u-texte` : tout va
   * bien. Hors de ce bloc — et c'est le rendu PAR DÉFAUT, `pleinEcran` vaut
   * `false` au départ — les deux jetons viennent de `:root`, où `--papier` vaut
   * encore #ffffff pendant que `--encre` est passé au crème #f5f1e8. Le couple
   * est contradictoire : 1,13 de contraste, du texte crème sur du papier blanc.
   *
   * On s'attache donc aux jetons de l'univers, avec des replis sombres. Ils
   * valent la même chose dans l'application ouverte, et ils tiennent debout en
   * dehors. Le jour où la charte rebouge, ce visuel suit sans qu'on le rouvre.
   */
  import type { Etiquette, Lettre } from '../../lib/modele';

  interface Props {
    /** L'étiquette énergie établie par le moteur. `null` quand il s'est abstenu. */
    energie: Etiquette | null;
    /** L'étiquette climat (CO₂). Même règle : `null` = on ne sait pas. */
    climat: Etiquette | null;
    /** La classe retenue au double seuil. `null` = le produit ne la sait pas. */
    finale: Lettre | null;
    /**
     * La surface de référence en m², quand elle a été lue.
     *
     * Elle ne sert pas à dessiner : elle sert à dire POURQUOI il n'y a pas de
     * lettre. Le schéma DPE ne la porte pas encore (`modele.ts`) ; tant qu'elle
     * n'y est pas, on l'omet plutôt que d'aller la chercher dans `bien.surface`,
     * qui est relevée sur tout le dossier et peut désigner une autre surface que
     * celle qui a servi au calcul.
     */
    surface?: number | null;
  }

  const { energie, climat, finale, surface = null }: Props = $props();

  /** Le seuil de l'arrêté du 25 mars 2024, repris de `analyse/dpe.ts`. */
  const SEUIL_PETITE_SURFACE = 40;

  interface Echelon {
    lettre: Lettre;
    /**
     * La marche, en % de la hauteur du bloc. C'est la grammaire de l'étiquette
     * officielle — les barres s'allongent de A vers G — pas une valeur lue dans
     * le rapport et pas une quantité. Rien ici ne se lit comme un chiffre.
     */
    hauteur: number;
    teinte: string;
  }

  const ECHELONS: Echelon[] = [
    { lettre: 'A', hauteur: 26, teinte: 'var(--etq-a)' },
    { lettre: 'B', hauteur: 36, teinte: 'var(--etq-b)' },
    { lettre: 'C', hauteur: 48, teinte: 'var(--etq-c)' },
    { lettre: 'D', hauteur: 60, teinte: 'var(--etq-d)' },
    { lettre: 'E', hauteur: 74, teinte: 'var(--etq-e)' },
    { lettre: 'F', hauteur: 88, teinte: 'var(--etq-f)' },
    { lettre: 'G', hauteur: 100, teinte: 'var(--etq-g)' }
  ];

  /**
   * Le calendrier de la location, classe par classe.
   *
   * Ce ne sont pas des chiffres du rapport, ce sont les dates de la loi, et le
   * moteur les énonce déjà mot pour mot dans `aFaire()` : on ne peut plus louer
   * un G à un NOUVEAU locataire depuis le 1ᵉʳ janvier 2025 — un bail en cours
   * n'est pas rompu, d'où le libellé ; les F seront interdits à partir de 2028 ;
   * un E sort du logement décent au 1ᵉʳ janvier 2034 (art. 6 de la loi
   * n° 89-462, au référentiel). On les répète ici parce que c'est le chiffre que
   * la maquette met en gros, et c'est celui qui décide d'un achat — mais la
   * ligne de provenance sous les cartouches dit d'où il sort.
   *
   * Pour A à D on n'écrit pas « aucune » en gros : personne ne peut promettre
   * qu'aucune échéance ne viendra. On écrit qu'il n'y en a pas de connue.
   */
  const ECHEANCE: Record<Lettre, { valeur: string; libelle: string; datee: boolean }> = {
    A: { valeur: '—', libelle: 'aucune échéance de location connue', datee: false },
    B: { valeur: '—', libelle: 'aucune échéance de location connue', datee: false },
    C: { valeur: '—', libelle: 'aucune échéance de location connue', datee: false },
    D: { valeur: '—', libelle: 'aucune échéance de location connue', datee: false },
    E: { valeur: '2034', libelle: 'location interdite à partir de', datee: true },
    F: { valeur: '2028', libelle: 'location interdite à partir de', datee: true },
    G: { valeur: '2025', libelle: 'nouveau bail interdit depuis', datee: true }
  };

  /**
   * LA MARCHE QU'ON TOUCHE.
   *
   * « Le schéma n'est pas une illustration : c'est une interface de
   * compréhension. Cliquable : on ne l'annote pas entièrement d'un coup,
   * l'utilisateur touche un élément et l'information paraît. »
   *
   * L'escalier portait sept couleurs et sept lettres, et n'en expliquait
   * aucune. Tout annoter aurait donné sept légendes illisibles ; n'annoter que
   * la classe du logement aurait laissé les six autres muettes — or c'est
   * précisément la comparaison qui fait comprendre une échelle.
   *
   * On touche donc, et la marche répond : une seule ligne à la fois, sous
   * l'escalier, à une place fixe.
   */
  let touchee = $state<Lettre | null>(null);

  /**
   * Ce que dit une marche.
   *
   * Rien d'inventé : l'échéance est celle de la loi, déjà énoncée par le
   * moteur, et la position du logement n'est affirmée que si la lettre est
   * connue. Quand elle ne l'est pas, la marche parle d'elle-même — l'échelle
   * A→G est réglementaire, elle reste vraie sans ce logement-ci.
   */
  /** Majuscule en tête, point final : un fragment de cartouche devient phrase. */
  const enPhrase = (t: string): string =>
    `${t.charAt(0).toUpperCase()}${t.slice(1)}${/[.!?]$/.test(t) ? '' : '.'}`;

  /** La teinte d'une lettre. `find` peut rendre `undefined` ; l'échelle, non. */
  const teinteDe = (l: Lettre): string =>
    ECHELONS.find((e) => e.lettre === l)?.teinte ?? 'var(--etq-d)';

  const ditDeLaMarche = $derived.by(() => {
    if (!touchee) return null;
    const e = ECHEANCE[touchee];
    return {
      lettre: touchee,
      ici: touchee === finale,
      /* Les libellés du calendrier sont écrits pour tenir SOUS un cartouche
         (« location interdite à partir de » + « 2028 » en gros). Ici ils
         deviennent une phrase : majuscule en tête et point final, sinon on lit
         « C'est la classe de ce logement. location interdite… ». */
      loi: e.datee ? enPhrase(`${e.libelle} ${e.valeur}`) : 'Aucune échéance de location connue à ce jour.',
      position:
        finale !== null && touchee === finale ? 'C’est la classe de ce logement.' : null
    };
  });

  const petiteSurface = $derived(surface !== null && surface <= SEUIL_PETITE_SURFACE);

  /**
   * La lettre vient-elle d'un calcul, ou de l'étiquette elle-même ?
   *
   * Quand elle est recalculée, ce dessin la met en très gros : il doit dire d'où
   * elle sort, sinon il se fait passer pour le rapport.
   */
  const recalculee = $derived(energie?.recalculee === true || climat?.recalculee === true);

  const nombreFr = (n: number): string => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

  interface Cartouche {
    valeur: string;
    libelle: string;
    /** Faux quand il n'y a pas de chiffre à mettre en gros : le vide s'efface. */
    chiffre: boolean;
  }

  /**
   * Les trois cartouches de la maquette, dans le même ordre : la mesure, la
   * lettre, l'échéance. Chacune sait se taire — « non lu » est une réponse, pas
   * une panne, et c'est toujours mieux qu'une valeur d'exemple.
   */
  const cartouches = $derived.by<Cartouche[]>(() => [
    energie
      ? { valeur: nombreFr(energie.valeur), libelle: energie.unite, chiffre: true }
      : { valeur: 'non lu', libelle: 'consommation', chiffre: false },
    finale
      ? { valeur: finale, libelle: 'classe énergie', chiffre: true }
      : { valeur: 'non établie', libelle: 'classe énergie', chiffre: false },
    finale
      ? {
          valeur: ECHEANCE[finale].valeur,
          libelle: ECHEANCE[finale].libelle,
          chiffre: ECHEANCE[finale].datee
        }
      : { valeur: '—', libelle: 'échéance de location', chiffre: false }
  ]);

  /** Une année s'affiche : il faut dire qu'elle vient de la loi, pas du rapport. */
  const echeanceAffichee = $derived(finale !== null && ECHEANCE[finale].datee);

  /** L'escalier est un dessin : tout ce qu'il montre est redit en toutes lettres. */
  const resume = $derived(
    finale
      ? `Échelle réglementaire de A à G. Ce logement est classé ${finale}.`
      : 'Échelle réglementaire de A à G. La classe de ce logement n’a pas été établie : aucune position n’est marquée sur l’échelle.'
  );
</script>

<figure class="visuel-dpe">
  <p class="intitule">Classement énergétique</p>

  <!-- L'escalier et ses lettres forment une seule image. Le détail est redit
       plus bas en texte : les barres n'ont rien à annoncer deux fois. -->
  <!--
    L'ESCALIER EST UNE INTERFACE, PAS UNE IMAGE.

    Il était `role="img"` avec une étiquette résumée : sept couleurs, sept
    lettres, et rien de cliquable. Chaque marche devient un bouton — une marche,
    sa lettre et sa zone de touche ne font qu'un seul contrôle, sinon on aurait
    quatorze cibles pour sept objets.

    La hauteur des barres reste ce qu'elle était : la grammaire de l'étiquette
    officielle, pas une quantité lue dans le rapport.
  -->
  <div class="echelle">
    <div class="marches" role="group" aria-label={resume}>
      {#each ECHELONS as echelon, i (echelon.lettre)}
        <button
          type="button"
          class="barre"
          class:ici={echelon.lettre === finale}
          class:touchee={echelon.lettre === touchee}
          style:--haut="{echelon.hauteur}%"
          style:--teinte={echelon.teinte}
          style:animation-delay="{i * 80}ms"
          aria-pressed={echelon.lettre === touchee}
          onclick={() => (touchee = touchee === echelon.lettre ? null : echelon.lettre)}
        >
          <span class="fut"></span>
          <span class="lettre">{echelon.lettre}</span>
          <span class="sr">
            Classe {echelon.lettre}{echelon.lettre === finale
              ? ', la classe de ce logement'
              : ''}
          </span>
        </button>
      {/each}
    </div>
  </div>

  <!--
    LA RÉPONSE, À UNE PLACE FIXE.

    Une seule ligne à la fois, toujours au même endroit : le lecteur apprend en
    deux touches où regarder. Tant que rien n'est touché, l'invite occupe la
    place — sans elle, la zone se remplirait d'un coup et pousserait le reste de
    l'écran vers le bas à chaque clic.
  -->
  <p class="dit-marche" aria-live="polite">
    {#if ditDeLaMarche}
      <span class="pastille-lettre" style:--teinte={teinteDe(ditDeLaMarche.lettre)}>
        {ditDeLaMarche.lettre}
      </span>
      <span class="propos">
        {#if ditDeLaMarche.position}<b>{ditDeLaMarche.position}</b>{/if}
        {ditDeLaMarche.loi}
      </span>
    {:else}
      <span class="invite">Touchez une marche pour savoir ce qu’elle impose.</span>
    {/if}
  </p>

  <dl class="cartouches">
    {#each cartouches as cartouche, i (i)}
      <div class="cartouche" style:animation-delay="{620 + i * 70}ms">
        <dt>{cartouche.libelle}</dt>
        <dd class:sobre={!cartouche.chiffre}>{cartouche.valeur}</dd>
      </div>
    {/each}
  </dl>

  {#if echeanceAffichee}
    <!-- Une année posée au même endroit et dans le même corps que deux chiffres
         du rapport se lit comme un chiffre du rapport. Elle n'en est pas un. -->
    <p class="provenance">Cette échéance vient de la loi, pas de votre rapport.</p>
  {/if}

  {#if finale}
    <figcaption>
      <strong>Ce logement est classé {finale}.</strong>
      {#if energie && climat}
        {nombreFr(energie.valeur)}
        {energie.unite} et {nombreFr(climat.valeur)}
        {climat.unite} : la plus mauvaise des deux notes fait la classe.
      {:else if energie}
        {nombreFr(energie.valeur)}
        {energie.unite}, lu dans le rapport. Les émissions de CO₂, elles, n’ont pas pu être lues —
        l’étiquette imprimée peut donc être moins bonne.
      {:else if climat}
        {nombreFr(climat.valeur)}
        {climat.unite}, lu dans le rapport. La consommation, elle, n’a pas pu être lue.
      {/if}
      {#if recalculee}
        <span class="mention">
          L’étiquette colorée du rapport est une image, qu’aucun programme ne sait lire. Cette lettre
          est donc retrouvée à partir des chiffres écrits juste à côté, avec les seuils officiels :
          c’est une manière de lire l’étiquette, pas de la corriger. Le logiciel du diagnostiqueur
          est validé par l’ADEME.
        </span>
      {/if}
    </figcaption>
  {:else}
    <!-- Pas de lettre, et deux raisons possibles. On ne dit laquelle que si on
         la connaît : le verdict affiché juste à côté, lui, tranche toujours. -->
    <p class="sans-lettre">
      {#if petiteSurface && surface !== null}
        <strong>Nous ne recalculons pas la lettre ici, et c’est volontaire.</strong>
        Ce logement fait {nombreFr(surface)} m². Depuis le 1ᵉʳ juillet 2024, les logements de 40 m²
        ou moins relèvent de seuils qui leur sont propres : l’échelle habituelle leur donnerait une
        lettre plus mauvaise que la vraie. La lettre qui fait foi est celle imprimée sur l’étiquette
        de votre rapport.
      {:else if surface !== null}
        <strong>La classe n’a pas pu être établie à partir de ce rapport.</strong>
        Les chiffres nécessaires — consommation annuelle et émissions de CO₂ — n’y ont pas été
        retrouvés. La lettre, elle, est imprimée en couleur sur l’étiquette du document.
      {:else}
        <strong>La classe de ce logement n’a pas été établie ici.</strong>
        Nous ne la recalculons que lorsque tous les chiffres nécessaires ont été retrouvés, et que
        l’échelle habituelle s’applique bien à ce logement. La raison exacte est indiquée juste à
        côté, dans ce que dit le rapport. La lettre qui fait foi, elle, est imprimée en couleur sur
        l’étiquette du document.
      {/if}
    </p>
  {/if}
</figure>

<style>
  /* La carte de la maquette : surface, filet, grand rayon. Aux jetons de
     l'univers, jamais à des couleurs écrites en dur. Elle est posée sur
     `.dessin`, de la même teinte : c'est le filet qui la détache, et il tient
     3,06 sur la surface (#8c9899 sur #334c56).

     La couleur de base est posée ici plutôt que laissée à l'héritage : hors de
     l'application ouverte, ce figure hérite d'un `--encre` crème sur un
     `--papier` blanc. Une seule ligne ferme cette porte pour tout le bloc. */
  .visuel-dpe {
    margin: 0 0 var(--e5);
    padding: var(--e4);
    background: var(--u-surface, #334c56);
    border: 1px solid var(--u-trait, #8c9899);
    border-radius: var(--rayon-large);
    color: var(--u-texte, #f5f1e8);
  }

  /* `.d-label` de la maquette, en texte doux : #cbd8dd tient 6,24 sur la carte,
     et c'est du 12 px, donc c'est bien 4,5 qu'il lui faut. */
  .intitule {
    margin: 0 0 var(--e4);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--u-texte-doux, #cbd8dd);
  }

  /* Les 6 px et les 132 px sont ceux de la maquette : c'est la géométrie du
     dessin, pas de l'espacement de mise en page. */
  .marches {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    margin-bottom: var(--e3);
  }

  /*
   * Une marche.
   *
   * L'état de départ vit dans les keyframes, pas dans la règle, et le
   * remplissage est `backwards` — jamais `forwards` sur un `transform: scaleY(0)`
   * de base. La leçon est écrite dans app.css : une animation qui ne se joue
   * pas laisserait ici sept barres de hauteur nulle, définitivement.
   *
   * Le filet intérieur donne son bord à la marche, et sur fond sombre il a
   * changé de camp : il n'est plus là pour détacher les marches pâles du papier
   * blanc, mais pour détacher les marches FONCÉES de la carte pétrole. Le A
   * (#319834) ne tient que 2,46 sur #334c56 et le G (#fc0205) 2,23 — sous le
   * seuil de 3 : sans filet, deux marches sur sept n'ont plus de bord.
   *
   * En crème à 70 %, le filet mesuré CONTRE LA CARTE — c'est là qu'il sépare —
   * donne 5,80 sur le A, 6,52 sur le B, 7,82 sur le C, 8,03 sur le D, 7,27 sur
   * le E, 6,62 sur le F, 4,85 sur le G. Les sept marches ont un bord.
   *
   * Il suit `--u-texte`, donc il suivra le prochain changement de charte.
   */
  /* La marche est un BOUTON : le fût coloré, la lettre dessous et la zone de
     touche ne font qu'une seule cible. Deux cibles par classe donneraient
     quatorze contrôles pour sept objets. */
  .barre {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    height: 158px;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  /* Le fût : c'est lui qui monte, qui porte la teinte et le filet. */
  .fut {
    display: block;
    height: var(--haut);
    margin-top: auto;
    background: var(--teinte);
    border-radius: 6px 6px 3px 3px;
    position: relative;
    transform-origin: bottom;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--u-texte, #f5f1e8) 70%, transparent);
    animation: monte 0.5s var(--courbe) backwards;
    animation-delay: inherit;
    transition: filter var(--duree) var(--courbe);
  }

  .barre:hover .fut,
  .barre.touchee .fut {
    filter: brightness(1.12);
  }

  /* La lettre, sous son fût. */
  .lettre {
    text-align: center;
    font-size: var(--t-petit);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--encre-doux);
    transition: color var(--duree) var(--courbe);
  }

  /* Sans classe établie, aucune lettre ne passe en encre pleine. C'est le
     second signal d'absence, après l'anneau manquant. */
  .barre.ici .lettre,
  .barre.touchee .lettre {
    color: var(--encre);
  }

  /* Le focus clavier doit se voir : sept boutons se parcourent à la tabulation. */
  .barre:focus-visible {
    outline: 2px solid var(--encre);
    outline-offset: 3px;
    border-radius: 8px;
  }

  /* Ce que seuls les lecteurs d'écran entendent : la lettre est déjà à l'image,
     mais « C » seul ne dit pas que c'est une classe. */
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @keyframes monte {
    from {
      transform: scaleY(0);
    }
  }

  /* L'anneau d'encre autour de la classe du logement — le seul repère du
     dessin. Il est tracé À L'EXTÉRIEUR de la barre, donc sur le papier : c'est
     là qu'il se mesure (9,36 dans l'univers, 9,29 hors univers), et pas contre
     la teinte de la marche. Il bat, comme dans la maquette : c'est ce qui fait
     « application » plutôt que « graphique ». */
  .barre.ici .fut::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: 0 0 0 2.5px var(--encre);
    animation: battement 2.1s ease-in-out infinite;
  }

  @keyframes battement {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.32;
    }
  }

  /*
   * LA LIGNE DE RÉPONSE.
   *
   * Une place fixe, réservée d'avance : `min-height` retient la hauteur de deux
   * lignes de texte, sinon chaque touche pousserait les trois cartouches et le
   * reste de l'écran vers le bas — le lecteur perdrait des yeux ce qu'il vient
   * de toucher.
   */
  .dit-marche {
    display: flex;
    align-items: flex-start;
    gap: var(--e3);
    min-height: 46px;
    margin: 0;
    padding: var(--e3);
    background: color-mix(in srgb, var(--encre) 6%, transparent);
    border-radius: var(--rayon-petit);
    font-size: var(--t-petit);
    line-height: 1.45;
    color: var(--encre);
  }

  /* La pastille reprend la couleur de la marche touchée : c'est le fil qui
     relie la réponse à l'endroit qu'on vient de toucher. */
  .pastille-lettre {
    flex: none;
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border-radius: 7px;
    background: var(--teinte);

    /*
     * L'ENCRE DE LA PASTILLE, MESURÉE SUR LES SEPT TEINTES.
     *
     * Elle était à #16240f, et deux classes échouaient : le A (#319834) à 4,39
     * et le G (#fc0205) à 3,98, sous le seuil de 4,5. Les couleurs de l'arrêté
     * ne se retouchent pas — c'est l'encre qui doit tenir sur les sept.
     *
     * Mesures avec #071008 : A 5,22 · B 9,04 · C 13,9 · D 15,3 · E 10,9 ·
     * F 8,97 · G 4,74. L'ivoire, lui, échoue partout (1,01 sur le D).
     *
     * Une teinte verte plutôt qu'un noir pur : elle reste dans la charte, et le
     * gain du noir (5,67 / 5,15) n'était pas nécessaire.
     */
    color: var(--encre-etiquette);
    font-weight: 700;
    font-size: var(--t-petit);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--u-texte, #f5f1e8) 55%, transparent);
  }

  .propos b {
    font-weight: 700;
  }

  /* L'invite s'efface : elle indique un geste, elle ne dit rien du logement. */
  .invite {
    color: var(--encre-doux);
    font-style: italic;
  }

  /* Les trois cartouches de la maquette. En grille plutôt qu'en flex : à trois
     colonnes sur un téléphone, `minmax(0, 1fr)` est ce qui empêche « location
     interdite à partir de » de pousser ses voisines. */
  .cartouches {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--e3);
    margin: var(--e4) 0 0;
  }

  .cartouche {
    /* La valeur est au-dessus du libellé dans le dessin, mais après lui dans le
       document : « classe énergie : F » se lit mieux à voix haute que l'inverse. */
    display: flex;
    flex-direction: column-reverse;
    gap: var(--e1);
    padding: var(--e3);
    text-align: center;
    background: var(--surface);
    border-radius: var(--rayon);
    animation: monteCartouche 0.4s var(--courbe) backwards;
  }

  @keyframes monteCartouche {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
  }

  .cartouche dd {
    margin: 0;
    font-size: var(--t-titre);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: var(--suivi-serre);
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
    color: var(--encre);
  }

  /* « non lu », « non établie », « — » : ce n'est pas un chiffre, ça ne prend
     pas la taille d'un chiffre. Le vide se voit sans crier. */
  .cartouche dd.sobre {
    font-size: var(--t-petit);
    font-weight: 600;
    line-height: 1.4;
    color: var(--encre-doux);
  }

  .cartouche dt {
    font-size: var(--t-micro);
    line-height: 1.3;
    overflow-wrap: anywhere;
    color: var(--encre-doux);
  }

  .provenance {
    margin: var(--e2) 0 0;
    font-size: var(--t-micro);
    line-height: 1.4;
    text-align: center;
    color: var(--encre-doux);
  }

  figcaption {
    margin-top: var(--e4);
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--encre-doux);
  }

  figcaption strong {
    display: block;
    color: var(--encre);
  }

  .mention {
    display: block;
    margin-top: var(--e2);
    font-size: var(--t-micro);
    line-height: 1.5;
    color: var(--encre-doux);
  }

  /* Le bloc qui explique l'abstention. Il a droit à une surface : c'est la
     promesse du produit qui se joue là, pas une note de bas de page. */
  .sans-lettre {
    margin: var(--e4) 0 0;
    padding: var(--e3);
    background: var(--surface-forte);
    border-radius: var(--rayon);
    font-size: var(--t-petit);
    line-height: 1.55;
    color: var(--encre-doux);
  }

  .sans-lettre strong {
    display: block;
    margin-bottom: var(--e1);
    color: var(--encre);
  }

  /* Svelte n'applique pas ça tout seul aux animations écrites à la main. Un
     simple `animation: none` suffit ici, et c'est tout l'intérêt du remplissage
     `backwards` : l'état naturel des barres et des cartouches est déjà l'état
     visible, il n'y a rien à restaurer. */
  @media (prefers-reduced-motion: reduce) {
    .fut,
    .barre.ici .fut::after,
    .cartouche {
      animation: none;
    }
  }

  /* Le dossier s'imprime, et une animation ne se joue pas sur du papier. */
  @media print {
    .fut,
    .barre.ici .fut::after,
    .cartouche {
      animation: none;
    }
  }
</style>