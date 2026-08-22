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
  import type { Origine } from '../lib/bureau';
  import { ouvrirCouche } from '../lib/couches';
  import type { BandeauDecoupe, PageRendue, Photo } from '../lib/pdf';
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
    /**
     * Le schéma des déperditions du DPE, découpé dans sa page.
     *
     * Il descend jusqu'à la fiche du DPE : c'est le seul endroit du dossier où
     * figurent les pourcentages de CE logement — la page est en image, et son
     * texte ne porte aucun « % ».
     */
    schemaDeperditions?: Photo | null;
    /** Les bandes du rapport découpées pour être montrées. */
    bandeaux?: BandeauDecoupe[];
  }

  const {
    analyse,
    rendus,
    demande = null,
    photo = null,
    schemaDeperditions = null,
    bandeaux = []
  }: Props =
    $props();

  type Repere = NonNullable<Diagnostic['reperes']>[number];

  /** L'échelle du DPE, au service du sens. */
  /*
   * LA BARRE COLLÉE SAIT SI QUELQUE CHOSE PASSE DERRIÈRE ELLE.
   *
   * Un écouteur de `scroll` aurait marché, mais il se déclenche à chaque pixel
   * et le conteneur qui défile n'est pas toujours la fenêtre. L'observateur,
   * lui, ne réveille le navigateur qu'au franchissement — et il trouve seul le
   * bon conteneur.
   *
   * L'astuce du `rootMargin: -1px` en haut : tant que la barre est à sa place
   * naturelle, elle est pleinement visible et le ratio vaut 1. Dès qu'elle se
   * colle, ce pixel retranché la fait passer sous 1 — c'est le signal.
   */
  let barreVues = $state<HTMLElement | null>(null);
  let detachee = $state(false);

  /** L'ancêtre qui défile réellement — ce n'est pas toujours la fenêtre. */
  function conteneurQuiDefile(el: HTMLElement): HTMLElement | null {
    let p = el.parentElement;
    while (p) {
      const o = getComputedStyle(p).overflowY;
      if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight) return p;
      p = p.parentElement;
    }
    return null;
  }

  $effect(() => {
    const el = barreVues;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    /*
     * Le `root` doit être le conteneur qui défile, pas la fenêtre.
     *
     * Première version : `root` implicite. L'observateur regardait donc le
     * viewport pendant que le contenu défilait dans `.dedans` — la barre se
     * collait, et rien ne se déclenchait. Mesuré : scroll à 400 px, classe
     * toujours absente.
     *
     * C'est le piège des `position: sticky` imbriqués : le collage est
     * relatif au conteneur de défilement, l'observation doit l'être aussi.
     */
    const root = conteneurQuiDefile(el);
    const oeil = new IntersectionObserver(([e]) => (detachee = !!e && e.intersectionRatio < 1), {
      root,
      threshold: [1],
      rootMargin: '-1px 0px 0px 0px'
    });
    oeil.observe(el);
    return () => oeil.disconnect();
  });

  const TEINTES = {
    bon: '#319834',
    moyen: '#fc9935',
    mauvais: '#fc0205',
    info: '#12463b'
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
  /*
   * Quatre vues depuis que la barre de navigation en compte cinq.
   *
   * « Alertes » n'ouvrait sur rien : l'onglet existait, la vue non. Elle porte
   * ce que le lecteur cherche quand il clique sur un badge — ce qui demande une
   * action avant de signer, et rien d'autre.
   *
   * Le verdict a donc quitté « L'analyse » pour venir ici. Ce n'est pas une
   * duplication : c'est sa place. L'analyse montre les diagnostics un par un,
   * les alertes montrent ce qui bloque. Deux questions, deux écrans.
   */
  /*
   * « LES DIAGNOSTICS » N'EST PLUS UN ONGLET.
   *
   * Ordre d'Aude (21/08/2026) : « le volet diagnostic ne sert à rien, car on a
   * tous les diags dans les mini apps ». C'est exact, et la preuve est dans le
   * code : `ouvrirDansLAnalyse()` — la fonction qu'appelle une tuile de
   * l'accueil — pose `vue = 'point'`. Cliquer sur la mini-app DPE ouvrait donc
   * déjà cette vue-là, sur le bon diagnostic. L'onglet offrait le même écran
   * sans le diagnostic : une seconde porte vers la même pièce, qui s'ouvrait
   * sur le premier rapport venu.
   *
   * La VUE reste — c'est elle que les mini-apps ouvrent. Seule sa place dans la
   * barre disparaît. On entre désormais par le diagnostic qu'on a choisi, ce
   * qui est la promesse des mini-apps.
   *
   * Le repli sur `alertes` compte : c'est ce que le lecteur cherche en ouvrant
   * un dossier, et c'était déjà la vue qu'ouvre le badge de la barre.
   */
  const VUES = [
    { cle: 'alertes', nom: 'Les alertes', quoi: 'Ce qui demande une action' },
    { cle: 'conseil', nom: 'Le conseil', quoi: 'Ce qu’il faut en faire' },
    { cle: 'rapport', nom: 'Le rapport', quoi: 'Toutes les pages, expliquées' }
  ];

  /** Le nom d'un diagnostic ouvert depuis sa mini-app, quand il n'est plus dans la barre. */
  const NOM_HORS_BARRE: Record<string, string> = { point: 'Les diagnostics' };

  let vue = $state('alertes');

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
  /**
   * Les trois parties du dossier sont des applications, pas des sections.
   *
   * Le dock les amenait en faisant défiler la page : on descendait dans un long
   * document, et l'écran d'accueil restait derrière, à moitié visible. On entre
   * maintenant dedans — plein écran, une sortie en haut, comme n'importe quelle
   * application de la grille. C'est la même règle partout : on clique, on entre.
   */
  let vueOuverte = $state(false);

  /*
   * LA VUE AUSSI S'INSCRIT DANS L'HISTORIQUE.
   *
   * Les quatre vues du dock — les diagnostics, les alertes, le conseil, le
   * rapport — et le lexique s'ouvrent en plein écran, exactement comme une
   * application. Le geste de retour du téléphone doit donc les refermer, et
   * non quitter Verrière. Voir `lib/couches.ts`.
   *
   * L'empilement n'a lieu qu'à l'ENTRÉE : passer d'une vue à l'autre alors
   * qu'on est déjà dedans change le contenu, pas le niveau. Sans cette garde,
   * chaque aller-retour dans le dock ajouterait un cran, et il en faudrait
   * autant pour ressortir.
   */
  let quitterLaVue: (() => void) | null = null;

  function ouvrirLaVue(): void {
    if (vueOuverte) return;
    vueOuverte = true;
    quitterLaVue = ouvrirCouche(() => {
      vueOuverte = false;
      quitterLaVue = null;
    });
  }

  function allerALaVue(cle: string): void {
    vue = cle;
    ouvrirLaVue();
  }

  function fermerLaVue(): void {
    vueOuverte = false;
    const sortir = quitterLaVue;
    quitterLaVue = null;
    sortir?.();
  }

  /*
   * La page ne défile pas sous l'application ouverte, et le clavier trouve la
   * sortie en entrant. Les deux mêmes règles que pour les écrans de diagnostic.
   */
  $effect(() => {
    if (!vueOuverte) return;
    const avant = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    void tick().then(() => document.querySelector<HTMLElement>('.sortie-vue')?.focus());
    return () => {
      document.body.style.overflow = avant;
    };
  });

  /** Le carré de l'icône cliquée : l'écran du diagnostic s'ouvrira de là. */
  let origineIcone = $state<Origine | null>(null);
  /** Le numéro de la demande : redemander le même diagnostic doit le rouvrir. */
  let demandeNo = $state(0);

  function ouvrirDansLAnalyse(type: TypeDiag, origine: Origine | null = null): void {
    vue = 'point';
    /*
     * Ouvrir la vue, sans quoi le clic ne fait plus rien.
     *
     * Tant que le lecteur était rendu sous l'accueil, régler `vue` suffisait :
     * la fiche existait déjà, on la faisait défiler. Depuis que l'accueil ne
     * montre que les applis, le lecteur n'existe qu'une fois ouvert — et
     * cliquer sur une icône ne produisait plus rien du tout.
     */
    ouvrirLaVue();
    diagOuvert = type;
    origineIcone = origine;
    demandeNo += 1;

    // Quand on sait d'où part le geste, l'écran s'ouvre par-dessus : rien à
    // faire défiler. Sinon, le carrousel est plus bas que le bandeau du bien,
    // et sans ce saut le clic changerait un écran qu'on ne voit pas.
    if (origine) return;
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

  /*
   * Échap referme la couche la plus haute, une à la fois.
   *
   * L'ordre compte : le schéma en pleine page couvre la fenêtre d'explication,
   * qui elle-même s'ouvre dans une des trois applications. Fermer tout d'un
   * coup ferait ressortir le lecteur trois niveaux plus bas que là où il
   * regardait.
   */
  function auClavierFenetre(e: KeyboardEvent): void {
    if (e.key !== 'Escape') return;
    if (plein) fermerPlein();
    else if (actif) fermerFenetre();
    else if (vueOuverte) fermerLaVue();
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
<Bureau {analyse} {photo} surOuvrirDiagnostic={ouvrirDansLAnalyse} surVue={allerALaVue} />

<!--
  L'ACCUEIL NE MONTRE QUE DES APPLIS.

  « Je ne veux pas voir de texte plus bas ; l'interface marche comme un iPhone :
  on ne voit que les applis et on clique. » C'était juste, et ce ne l'était pas :
  sous la grille d'icônes, tout le dossier continuait de se dérouler en liste —
  le verdict, les six familles, chaque diagnostic avec sa date de validité. Un
  écran d'accueil d'iPhone ne déroule pas le contenu des applications sous les
  icônes.

  Le verdict et le dossier ne sont donc rendus qu'une fois une vue ouverte, par
  le dock ou par « Voir le détail ». Rien n'est perdu : c'est le même contenu,
  à un clic.
-->
{#if reperes.length && vueOuverte}
  <section class="lecteur" class:plein={vueOuverte}>
    {#if vueOuverte}
      <!-- La barre de l'application : la sortie, puis le nom de ce qu'on lit. -->
      <header class="barre-vue">
        <button type="button" class="sortie-vue" onclick={fermerLaVue}>
          <span aria-hidden="true">←</span> Retour
        </button>
        <!-- La barre nomme aussi les vues qui ne sont plus dans les onglets :
             sans quoi ouvrir une mini-app affichait une barre sans titre. -->
        <p class="titre-vue">
          {VUES.find((v) => v.cle === vue)?.nom ?? NOM_HORS_BARRE[vue] ?? ''}
        </p>
      </header>
    {/if}

    <div class="dedans-vue">
    <!-- Trois vues, pas vingt-trois écrans à la file. Le lecteur sait toujours
         où il est et ce qui reste. À l'impression, tout se déplie : le document
         remis n'a pas d'onglets. -->
    <nav
      class="vues"
      class:detachee
      id="les-vues"
      aria-label="Les parties du dossier"
      bind:this={barreVues}
    >
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

    <!-- Les alertes : ce qui demande une action avant de signer. C'est la vue
         qu'ouvre le badge de la barre de navigation. -->
    <div class="vue" class:cachee={vue !== 'alertes'} id="alertes">
      <Verdict {analyse} {photo} surOuvrirDiagnostic={ouvrirDansLAnalyse} />
    </div>

    <div class="vue" class:cachee={vue !== 'point'} id="analyse-diags">

      <!-- Le dossier diagnostic par diagnostic. On les feuillette : un volet à
           la fois, le bandeau dit lequel. La fiche donne le verdict, le rapport
           en donne la preuve. -->
      <Diagnostics
        {analyse}
        surVoirDansLeRapport={allerAuDiagnostic}
        ouvrir={diagOuvert}
        origine={origineIcone}
        demande={demandeNo}
        {schemaDeperditions}
        {bandeaux}
        {photo}
      />
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
                  <!--
                    LE GRAS PORTE LE CONSTAT, LA PASTILLE DIT LA GRAVITÉ.

                    Les vingt-sept lignes repérées d'un dossier se rendaient
                    toutes pareil : même corps, même encre, seul le fond
                    changeait d'une nuance. « N°ADEME : 2633E2660001X » pesait
                    donc autant que « il a été repéré des unités de diagnostic
                    de classe 3 ». La classe `surlignee` posée ici n'était
                    stylée nulle part — la distinction n'avait jamais été
                    écrite.

                    Le moteur, lui, la donnait déjà : il classe chaque repère
                    en `constat`, `donnee` ou `mot`, et lui pose un `ton`.
                    C'est cette information qui commande maintenant le rang.
                  -->
                  <button
                    type="button"
                    id="repere-r{trouve}"
                    class="ligne rang-{r?.famille ?? 'donnee'}"
                    class:actif={actifId === `r${trouve}`}
                    style:--teinte={TEINTES[r?.ton ?? 'info']}
                    onclick={() => epingler(`r${trouve}`)}
                  >
                    <span class="puce-ligne">{trouve + 1}</span>
                    {#if r?.famille === 'constat' && r.ton && r.ton !== 'info'}
                      <!-- La petite alerte : elle dit la gravité sans répéter
                           un mot que la phrase du rapport dit déjà. -->
                      <span class="alerte-ligne" aria-hidden="true"></span>
                      <span class="lecture-seule">
                        {r.ton === 'mauvais' ? 'Point important : ' : 'À surveiller : '}
                      </span>
                    {/if}
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
    </div>
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
  /* ---- L'application ouverte -------------------------------------------
     Les trois parties du dossier ne se parcourent plus en descendant : on entre
     dedans. Même mécanique que les écrans de diagnostic, un cran en dessous
     dans l'empilement — une fiche ouverte depuis la grille passe par-dessus. */
  .lecteur.plein {
    position: fixed;
    inset: 0;
    z-index: var(--plan-vue);
    background: var(--fond);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: 0;
  }

  .barre-vue {
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--e2);
    /*
     * SOUS L'ENCOCHE, LE BOUTON DE SORTIE N'EXISTE PLUS.
     *
     * `index.html` déclare `viewport-fit=cover` et une barre d'état
     * translucide ; le manifeste demande `standalone`. Installée sur l'écran
     * d'accueil, l'application occupe donc la dalle ENTIÈRE, encoche comprise
     * — et il n'y a alors ni barre d'adresse, ni flèche de retour, ni clavier.
     *
     * Le compte est sans appel : 8 px de rembourrage puis 44 px de bouton, soit
     * une sortie entre y = 8 et y = 52. L'encoche mange jusqu'à y = 47 sur un
     * iPhone 12 à 14, et jusqu'à 59 avec l'îlot dynamique — où le bouton est
     * intégralement recouvert. L'écran s'ouvre, et plus rien ne permet d'en
     * sortir.
     *
     * `env()` vaut 0 partout ailleurs : la règle ne coûte rien sur un
     * ordinateur ni sur un Android sans encoche. Le `max()` garde le
     * rembourrage habituel quand il n'y a pas d'encoche à compenser.
     */
    padding: max(var(--e2), env(safe-area-inset-top, 0px)) var(--e3) var(--e2);
    background: rgb(255 255 255 / 82%);
    backdrop-filter: blur(20px);
    border-bottom: 2px solid var(--verriere-vert);
  }

  .sortie-vue {
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

  .sortie-vue:hover {
    background: var(--surface);
  }

  .titre-vue {
    margin: 0;
    font-size: var(--t-petit);
    font-weight: 700;
    color: var(--sur-fond);
  }

  .lecteur.plein .dedans-vue {
    flex: 1;
    overflow-y: auto;
    padding: 0 var(--e4) var(--e7);
  }

  /* ---- La barre des trois parties ---------------------------------------
     Une pilule, pas trois pavés. Le fond sable, l'onglet actif en bleu pétrole
     plein, un liseré citron dessous : les couleurs du socle, et rien
     d'autre. L'ancienne version empilait un dégradé, un filet or et une ombre
     verte — trois reliquats d'une charte abandonnée. */
  .vues {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--e1);
    position: sticky;
    top: 0;
    z-index: 8;
    margin-bottom: var(--e5);
    padding: var(--e1);
    /* Le sélecteur de vues était un bandeau SABLE posé sur le fond : « pourquoi
       l'analyse, le rapport et le conseil sont en sable ». Il devient un rail
       de la même famille que le fond, et c'est l'onglet actif qui se détache. */
    /*
     * LA BARRE SE SOLIDIFIE QUAND ON DESCEND.
     *
     * Collée en haut, elle restait opaque en permanence — donc elle avait
     * l'air posée sur le contenu même quand il n'y avait rien dessous elle.
     * Sur iOS, une barre est TRANSPARENTE tant que la page est en haut, puis
     * elle se voile dès que du contenu passe dessous : c'est ce voile qui dit
     * « il y a quelque chose au-dessus », sans le moindre mot.
     *
     * Le flou fait le reste. Il ne sert pas à décorer : il laisse deviner ce
     * qui glisse derrière, et c'est cette profondeur d'un demi-millimètre qui
     * sépare une barre native d'un bandeau collé.
     */
    background: color-mix(in srgb, var(--surface-forte) 82%, transparent);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    backdrop-filter: saturate(180%) blur(20px);
    border: 1px solid var(--trait);
    border-radius: 999px;
    box-shadow: var(--ombre);
    transition:
      background var(--duree) var(--courbe),
      box-shadow var(--duree) var(--courbe);
  }

  /* En haut de page, rien ne passe derrière : la barre s'efface. */
  .vues:not(.detachee) {
    background: transparent;
    box-shadow: none;
    border-color: transparent;
  }

  .vues button {
    text-align: center;
    background: transparent;
    border: none;
    border-radius: 999px;
    padding: var(--e2) var(--e3);
    cursor: pointer;
    color: var(--sur-fond-doux);
    transition:
      background var(--duree) var(--courbe),
      color var(--duree) var(--courbe);
  }

  .vues button:hover:not(.courante) {
    background: var(--surface);
    color: var(--sur-fond);
  }

  .vues button.courante {
    color: var(--sur-action);
    background: var(--action);
    box-shadow: 0 2px 0 var(--action) inset;
  }

  @media (prefers-reduced-motion: reduce) {
    .vues button {
      transition: none;
    }
  }

  .nom-vue {
    display: block;
    font-family: var(--police-titre);
    font-size: var(--t-lead);
    font-weight: 500;
    letter-spacing: -0.022em;
  }

  .vues button.courante .nom-vue {
    color: #fff;
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
    color: var(--verriere-vert-profond);
    font-size: var(--t-micro);
    font-weight: 800;
    letter-spacing: 0.12em;
    border-block: 1px solid #e8dcc8;
  }

  .numero-page:first-child {
    margin-top: -var(--e4);
  }

  .ligne {
    margin: 0 0 var(--e1);
    text-align: left;
  }

  /*
   * ───────────────────────────────────────────────────────────────────────
   * TROIS RANGS, ET LE GRAS FAIT LE PREMIER.
   * ───────────────────────────────────────────────────────────────────────
   *
   * Le rang ne se devine pas : il vient de `famille`, que le moteur pose sur
   * chaque repère. Sur le dossier d'exemple, cela donne 5 constats, 14
   * données et 8 mots de métier — trois poids, là où il n'y en avait qu'un.
   *
   * Le gras plutôt que l'aplat, et une petite alerte plutôt qu'une bande :
   * un aplat par ligne repérée transformerait la page du rapport en tableau
   * de bord, et l'important cesserait de se voir dès qu'il y en a beaucoup.
   */
  button.ligne {
    display: block;
    width: 100%;
    background: none;
    border: none;
    border-radius: var(--rayon-petit);
    padding: var(--e1) var(--e2);
    margin: var(--e1) 0;
    cursor: pointer;
    color: #4a5a55;
    font: inherit;
    font-weight: 400;
    text-align: left;
    transition:
      background 0.15s ease,
      box-shadow 0.15s ease;
  }

  /* RANG 1 — le constat. Ce que le rapport CONCLUT. */
  button.ligne.rang-constat {
    color: #0a2b23;
    font-weight: 700;
    font-size: 1.08em;
    line-height: 1.4;
    border-left: 4px solid var(--teinte);
    background: color-mix(in srgb, var(--teinte) 8%, #fff);
  }

  /* RANG 2 — la donnée du dossier : un numéro, une date, une surface.
     Elle reste lisible et touchable, mais elle ne réclame rien. */
  button.ligne.rang-donnee {
    border-left: 2px solid color-mix(in srgb, var(--teinte) 45%, #fff);
  }

  /* RANG 3 — le mot du métier. Même convention que dans le corps du texte :
     un pointillé, jamais un fond. */
  button.ligne.rang-mot {
    border-left: 2px dotted color-mix(in srgb, var(--teinte) 55%, #fff);
  }

  /*
   * LA PETITE ALERTE.
   *
   * Un disque de huit pixels, à la couleur de la gravité, posé avant la
   * phrase. Il ne dit rien de plus que le filet — mais il se voit de loin,
   * et c'est lui qu'on cherche en parcourant une page.
   *
   * Il double une information portée par la couleur : le texte caché qui le
   * suit la donne aux lecteurs d'écran, pour qui un disque coloré n'existe
   * pas.
   */
  .alerte-ligne {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 8px;
    border-radius: 50%;
    background: var(--teinte);
    vertical-align: 0.1em;
  }

  .lecture-seule {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
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
  /*
   * ELLE AUSSI PASSAIT SOUS LE LECTEUR.
   *
   * Même défaut que le schéma en pleine page, trouvé par le test des plans :
   * 40, quand `.lecteur.plein` vaut 45 et porte un fond opaque. La fenêtre
   * d'explication s'ouvrait donc DERRIÈRE l'écran qu'elle devait expliquer —
   * on touchait un passage du rapport et il ne se passait rien.
   *
   * `.fenetre` vit à l'intérieur de ce voile : elle n'a pas besoin de plan
   * propre, elle monte avec lui.
   */
  .voile {
    position: fixed;
    inset: 0;
    z-index: var(--plan-pleine-page);
    display: grid;
    place-items: center;
    padding: clamp(0px, 3vw, 32px);
    background: rgb(10 43 35 / 62%);
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
    box-shadow: 0 40px 90px -30px rgb(10 43 35 / 100%);
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
    color: var(--verriere-vert);
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
    background: var(--verriere-sable-or);
    border-color: var(--verriere-sable-or);
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
    color: var(--verriere-vert-profond);
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
    color: var(--verriere-vert);
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
    background: var(--verriere-sable-or);
    border-color: var(--verriere-sable-or);
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
    border-top: 1px solid rgb(214 230 106 / 30%);
  }

  .pas-a-pas .fleche {
    width: 38px;
    height: 38px;
    border-radius: 0;
    border: 1px solid var(--trait-or);
    background: none;
    color: var(--verriere-vert);
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
    color: var(--verriere-vert);
    font-weight: 500;
    font-size: var(--t-petit);
    letter-spacing: 0.14em;
    cursor: pointer;
    transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease;
  }

  .pas-a-pas .suivant:hover:not(:disabled) {
    background: var(--verriere-sable-or);
    border-color: var(--verriere-sable-or);
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
    background: var(--verriere-sable-or);
    border-left: 3px solid var(--verriere-vert-profond);
    border-radius: var(--rayon-petit);
    font-size: var(--t-base);
    line-height: 1.5;
    color: #0a2b23;
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
    color: var(--verriere-vert);
  }

  .ouvertures {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e2);
    margin-bottom: var(--e3);
  }

  .creuser {
    background: none;
    border: 1px solid rgb(214 230 106 / 48%);
    border-radius: 0;
    padding: var(--e2) var(--e4);
    font-size: var(--t-petit);
    font-weight: 700;
    color: var(--verriere-vert);
    cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease;
  }

  .creuser:hover,
  .creuser.ouvert {
    background: var(--surface-bord);
    border-color: var(--verriere-sable-or);
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
  /*
     * AU-DESSUS DU LECTEUR, ET C'EST TOUT L'ENJEU.
     *
     * Ce bloc valait 40 pendant que `.lecteur.plein` vaut 45 avec un fond
     * opaque — et il en est le FRÈRE, pas le descendant : les deux valeurs se
     * comparaient donc directement. Le schéma agrandi était peint dessous, et
     * l'écran ne bougeait pas quand on appuyait sur « agrandir ».
     */
  .pleine-page {
    position: fixed;
    inset: 0;
    z-index: var(--plan-pleine-page);
    background: rgb(10 43 35 / 72%);
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
    --teinte-legende: var(--verriere-vert);
  }
  .etiquette.moyen {
    --teinte-legende: var(--attention);
  }
  .etiquette.mauvais {
    --teinte-legende: var(--action);
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
    --teinte-legende: var(--verriere-vert);
  }
  .reponse.moyen {
    --teinte-legende: var(--attention);
  }
  .reponse.mauvais {
    --teinte-legende: var(--action);
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
    color: #a33220;
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
    border-top: 1px solid rgb(214 230 106 / 30%);
  }

  .passerelles button {
    background: none;
    border: 1px solid rgb(214 230 106 / 52%);
    color: var(--verriere-vert);
    border-radius: 0;
    padding: var(--e2) var(--e4);
    font-size: var(--t-petit);
    font-weight: 700;
    cursor: pointer;
    transition: background 0.18s ease;
  }

  .passerelles button:hover {
    background: var(--verriere-sable-or);
    color: #0a2b23;
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
