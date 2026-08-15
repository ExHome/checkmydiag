<script lang="ts">
  /**
   * Le dossier, diagnostic par diagnostic.
   *
   * Après le point d'ensemble vient le détail : chaque diagnostic reçoit sa
   * fiche, toujours bâtie pareil — ce que le rapport conclut, le dessin qui
   * l'explique, les chiffres relevés, puis pourquoi ce contrôle existe, comment
   * il est fait, ce qu'on risque, ce qu'il faut faire et ce que ça change pour
   * vendre.
   *
   * C'est ce qui permet de tout comprendre sur un seul document imprimé, sans
   * rien avoir à cliquer.
   */
  import type { Analyse, Diagnostic, TypeDiag } from '../lib/modele';
  import Explicatif from './schemas/Explicatif.svelte';
  import PlanDuLogement from './plans/PlanDuLogement.svelte';
  import MotsExpliques from './MotsExpliques.svelte';
  import Releves from './Releves.svelte';
  import AVerifier from './AVerifier.svelte';
  import { libelleCourt } from '../lib/libelle';
  import { enPratique, FICHES } from '../lib/analyse/fiches';
  import { echeance } from '../lib/echeance';
  import { etiquetteDe } from '../lib/analyse/confiance';
  import type { Origine } from '../lib/bureau';
  import { APPS } from '../lib/apps';
  import { cubicOut } from 'svelte/easing';
  import { tick, untrack } from 'svelte';

  interface Props {
    analyse: Analyse;
    /** Ouvre le rapport à l'endroit exact d'où sort ce verdict. */
    surVoirDansLeRapport?: (type: Diagnostic['type']) => void;
    /** Le diagnostic demandé de l'extérieur : le carrousel vient dessus. */
    ouvrir?: TypeDiag | null;
    /**
     * Le carré de l'icône cliquée. S'il est là, le diagnostic s'ouvre en plein
     * écran depuis ce point ; sinon le carrousel se contente de se positionner.
     */
    origine?: Origine | null;
    /**
     * Le numéro de la demande. Sans lui, redemander deux fois le même
     * diagnostic ne déclencherait rien : la valeur n'aurait pas changé.
     */
    demande?: number;
  }

  const {
    analyse,
    surVoirDansLeRapport,
    ouvrir = null,
    origine = null,
    demande = 0
  }: Props = $props();

  /** « page 12 » ou « pages 12 à 18 » — le lecteur y va, il ne devine pas. */
  function pageDite([debut, fin]: [number, number]): string {
    return debut === fin ? `page ${debut}` : `pages ${debut} à ${fin}`;
  }

  /* ---- Le carrousel -------------------------------------------------------
     Neuf fiches empilées faisaient neuf écrans : on descendait à l'aveugle sans
     savoir ce qui restait. Elles défilent maintenant une par une — on glisse
     vers la gauche pour la suivante, vers la droite pour la précédente, comme
     on feuillette. Le bandeau au-dessus dit toujours où l'on est.

     Tout reste dans le document : à l'impression, les neuf fiches se déplient. */

  const diags = $derived(analyse.diagnostics);
  let index = $state(0);
  /** D'où arrive le volet : −1 s'il vient de la gauche, 1 de la droite. */
  let sens = $state(1);

  /** Le volet courant, borné : le dossier peut changer sous nos pieds. */
  const courant = $derived(Math.min(index, Math.max(0, diags.length - 1)));

  /* ---- Entrer dans l'application -------------------------------------------
     Cliquer une icône ne fait pas défiler la page : ça ouvre l'écran du
     diagnostic, en grand, depuis l'icône elle-même. On en ressort par la flèche
     ou par Échap, et l'écran se replie là d'où il est venu.

     Le contenu ne change pas d'un pouce entre les deux états — c'est le même
     dossier, rendu au même endroit du code. Seul son cadre change. */
  let pleinEcran = $state(false);
  /** Le carré d'où l'écran s'ouvre, figé au moment du clic. */
  let depuis = $state<Origine | null>(null);

  /** L'identité de l'application ouverte : sa couleur habille tout l'écran. */
  const identite = $derived(diags[courant] ? APPS[diags[courant].type] : null);

  // Une demande venue de l'accueil ou de l'état descriptif : on se positionne,
  // et si l'on sait d'où part le geste, on ouvre en grand.
  $effect(() => {
    // Lue en premier : c'est elle qui fait rejouer l'effet à chaque demande,
    // même quand on redemande le diagnostic déjà affiché.
    demande;
    const type = ouvrir;
    if (!type) return;

    /*
     * Hors du suivi des dépendances, et c'est tout l'enjeu.
     *
     * `versLe` lit le volet courant pour savoir s'il doit bouger. Lu ici, cet
     * état devenait une dépendance de l'effet : changer de diagnostic dans
     * l'écran relançait l'effet, qui ramenait aussitôt sur le diagnostic
     * d'ouverture. On ne pouvait plus feuilleter — le carrousel revenait
     * toujours à sa première fiche.
     */
    untrack(() => {
      const i = diags.findIndex((d) => d.type === type);
      if (i < 0) return;
      versLe(i);
      if (origine) {
        depuis = origine;
        pleinEcran = true;
      }
    });
  });

  /** L'élément d'où l'on est parti : le clavier doit y revenir en ressortant. */
  let revenirVers: HTMLElement | null = null;

  function fermerLApp(): void {
    pleinEcran = false;
    revenirVers?.focus();
    revenirVers = null;
  }

  /**
   * Le clavier entre avec l'écran et en ressort avec lui.
   *
   * Sans cela, la personne qui tabule reste sur l'icône qu'elle vient
   * d'activer, derrière un écran qui couvre tout : elle parcourt une page
   * qu'elle ne voit plus.
   */
  $effect(() => {
    if (!pleinEcran) return;
    const actif = document.activeElement;
    revenirVers = actif instanceof HTMLElement ? actif : null;
    // Après le rendu : l'effet tourne avant que la barre de l'écran existe.
    void tick().then(() => document.querySelector<HTMLElement>('.retour')?.focus());
  });

  /*
   * Pendant qu'une application est ouverte, la page ne défile pas dessous.
   * Sans ce verrou, le doigt qui parcourt la fiche fait glisser l'accueil
   * derrière, et l'on ressort ailleurs qu'où l'on est entré.
   */
  $effect(() => {
    if (!pleinEcran) return;
    const avant = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = avant;
    };
  });

  /**
   * L'ouverture : l'écran naît du carré de l'icône et s'étend.
   *
   * Svelte joue la même fonction à l'envers pour la fermeture — l'écran se
   * replie exactement là d'où il est parti, ce qu'aucune paire d'animations
   * écrites séparément ne garantit.
   */
  function commeUneApp(_: Element, { carre }: { carre: Origine | null }) {
    /*
     * Qui a demandé moins d'animation n'en reçoit pas.
     *
     * Svelte n'applique pas ce réglage tout seul aux transitions écrites à la
     * main : sans cette ligne, l'écran s'agrandirait quand même sous les yeux
     * d'une personne qui a réglé son système pour l'éviter. Durée nulle, l'écran
     * est simplement là.
     */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return { duration: 0 };
    }

    /*
     * Une page qu'on ne regarde pas ne s'anime pas.
     *
     * Dans un onglet passé en arrière-plan, le navigateur suspend l'horloge des
     * animations : celle-ci resterait figée sur sa première image — un écran
     * réduit au format d'une icône — jusqu'au retour du lecteur. Sans
     * animation, l'écran est simplement là, ce qui est le bon résultat.
     */
    if (document.visibilityState !== 'visible') {
      return { duration: 0 };
    }

    const largeur = window.innerWidth;
    const hauteur = window.innerHeight;
    const o = carre ?? {
      x: largeur / 2 - 38,
      y: hauteur / 2 - 38,
      largeur: 76,
      hauteur: 76
    };

    const echelle = Math.max(o.largeur / largeur, 0.05);
    const versX = o.x + o.largeur / 2 - largeur / 2;
    const versY = o.y + o.hauteur / 2 - hauteur / 2;

    return {
      duration: 360,
      easing: cubicOut,
      css: (t: number, u: number) =>
        `transform: translate(${versX * u}px, ${versY * u}px) scale(${1 - u * (1 - echelle)});
         border-radius: ${u * 64}px;
         opacity: ${Math.min(1, t * 2.5)};`
    };
  }

  function versLe(i: number): void {
    if (i < 0 || i >= diags.length || i === index) return;
    sens = i > index ? 1 : -1;
    index = i;
  }

  /* Le geste.

     On ne prend la main que si le mouvement est franchement horizontal : sinon
     on volerait le défilement vertical de la page, qui est le geste que le
     lecteur fait le plus souvent. `touch-action: pan-y` dit la même chose au
     navigateur, pour que le défilement reste fluide même pendant qu'on décide. */
  let depart: { x: number; y: number } | null = null;
  /** Le décalage du doigt, en pixels, tant que le geste dure. */
  let glisse = 0;
  /** Vrai dès que le geste s'est déclaré horizontal. */
  let horizontal = false;

  function debut(e: PointerEvent): void {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    depart = { x: e.clientX, y: e.clientY };
    horizontal = false;
  }

  function pendant(e: PointerEvent): void {
    if (!depart) return;
    const dx = e.clientX - depart.x;
    const dy = e.clientY - depart.y;

    if (!horizontal) {
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      // Le premier mouvement décide : horizontal, c'est pour nous ; vertical,
      // c'est la page qui défile et on ne s'en mêle plus.
      if (Math.abs(dx) <= Math.abs(dy)) {
        depart = null;
        return;
      }
      horizontal = true;
    }

    glisse = dx;
  }

  function fin(): void {
    if (horizontal) {
      // Un quart de l'écran, ou 90 px : au-delà, le geste était une intention.
      const seuil = Math.min(90, window.innerWidth / 4);
      if (glisse <= -seuil) versLe(courant + 1);
      else if (glisse >= seuil) versLe(courant - 1);
    }
    depart = null;
    horizontal = false;
    glisse = 0;
  }

  function auClavier(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') {
      versLe(courant + 1);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      versLe(courant - 1);
      e.preventDefault();
    }
  }

  /*
   * Les volets sont empilés au même endroit, et non alignés côte à côte.
   *
   * La première version les mettait sur une piste horizontale qu'on translatait
   * — la scène prenait alors la hauteur de la plus longue fiche, et il fallait
   * mesurer le volet ouvert pour l'y ajuster. Cette mesure s'est retournée
   * contre nous : passer de trois mille cinq cents pixels à quinze cents fait
   * disparaître la barre de défilement du navigateur, ce qui élargit la page,
   * ce qui retaille les fiches, ce qui relance la mesure. La page se figeait.
   *
   * Empilés, les volets endormis ne mesurent rien et la scène prend d'elle-même
   * la hauteur du volet ouvert. Plus rien à mesurer, donc plus de boucle.
   */

  const BLOCS = [
    { cle: 'pourquoi', mot: 'Pourquoi ce diagnostic existe' },
    { cle: 'comment', mot: 'Comment il est fait' },
    { cle: 'risque', mot: 'Ce qu’on risque' },
    { cle: 'quoiFaire', mot: 'Ce qu’il faut faire' },
    { cle: 'vente', mot: 'Ce que ça change pour vendre' }
  ] as const;

  /**
   * Les réserves propres à chaque diagnostic.
   *
   * Chacun a ses angles morts, et ce sont eux qui font les mauvaises surprises :
   * un « aucun indice de termites » ne dit rien du vide sanitaire, un « pas
   * d'amiante » ne vaut que pour les matériaux de la liste contrôlée. Une
   * conclusion rassurante sans sa réserve se lit comme une garantie.
   */
  const RESERVES: Record<string, string[]> = {
    dpe: [
      'Le calcul suppose 19 °C partout et une occupation moyenne : ce n’est pas votre facture.',
      'Une paroi non observée est estimée d’après l’année de construction, pas mesurée.',
      'Le diagnostic ne dit rien de l’état réel de la chaudière ni des menuiseries.'
    ],
    amiante: [
      'Seuls les matériaux des listes réglementaires ont été cherchés.',
      'Le repérage est visuel : rien n’a été percé ni démonté.',
      'Avant travaux ou démolition, un repérage plus poussé reste obligatoire.'
    ],
    plomb: [
      'Seuls les revêtements accessibles ont été mesurés.',
      'Une unité non mesurée reste inconnue, elle n’est pas réputée saine.',
      'Le constat ne porte pas sur les canalisations en plomb.'
    ],
    electricite: [
      'Contrôle visuel, sans démontage du tableau ni des prises.',
      'Six domaines seulement, plus les installations particulières : ce n’est pas un état complet de l’installation.',
      'Les circuits encastrés et les appareils branchés ne sont pas contrôlés.'
    ],
    gaz: [
      'Contrôle des parties visibles et accessibles de l’installation.',
      'Les tuyauteries encastrées ne sont pas contrôlées.',
      'Le diagnostic ne porte pas sur les appareils eux-mêmes au-delà de leur raccordement.'
    ],
    termites: [
      'Recherche visuelle des indices, là où c’était accessible.',
      'Un mur fermé, un vide sanitaire ou un meuble encombrant n’ont pas été contrôlés.',
      'La conclusion ne vaut que six mois : une colonie avance vite.'
    ],
    erp: [
      'C’est une recopie des zonages officiels, pas une visite du terrain.',
      'Personne n’est venu sonder le sol ni mesurer quoi que ce soit.',
      'Les sinistres passés du bien ne figurent que s’ils ont été déclarés.'
    ],
    carrez: [
      'La mesure porte sur les parties privatives, sous 1,80 m de hauteur.',
      'Elle ne comprend ni cave, ni garage, ni balcon, ni terrasse.',
      'Elle diffère de la surface habitable et de celle du DPE : c’est normal.'
    ],
    assainissement: [
      'Le contrôle porte sur ce qui était accessible le jour de la visite.',
      'Les parties enterrées ne sont pas mises au jour.',
      'Un avis favorable ne préjuge pas de la durée de vie de l’installation.'
    ]
  };

  function reservesDe(d: Diagnostic): string[] {
    return (
      RESERVES[d.type] ?? [
        'Le contrôle porte sur ce qui était visible et accessible le jour de la visite.'
      ]
    );
  }

  /* ---- Deux profondeurs de lecture ----------------------------------------
     La fiche disait tout à tout le monde : le verdict, les chiffres relevés, le
     relevé complet et les cinq blocs de fond, d'un seul tenant. Celui qui veut
     seulement savoir si c'est grave devait traverser l'ensemble.

     Elle a donc deux niveaux. Le succinct répond à la question qu'on se pose en
     arrivant : qu'est-ce que ce rapport conclut, et qu'est-ce que ça change pour
     moi. Le détaillé ajoute les chiffres, le relevé et le fond.

     Deux choses ne se replient jamais, quel que soit le niveau : le verdict, et
     ce que le diagnostic ne garantit pas. Une conclusion rassurante sans ses
     réserves se lit comme une garantie — c'est exactement l'erreur qu'on passe
     son temps à corriger ailleurs, on ne va pas la réintroduire par un bouton.

     À l'impression, la question ne se pose pas : tout se déplie. */
  type Mode = 'succinct' | 'detaille';
  let modes = $state<Record<string, Mode>>({});

  const modeDe = (type: TypeDiag): Mode => modes[type] ?? 'succinct';

  function choisirMode(type: TypeDiag, mode: Mode): void {
    modes = { ...modes, [type]: mode };
  }

  function isolationDe(d: Diagnostic) {
    return d.schema?.genre === 'dpe' ? d.schema.isolation : null;
  }

  function lettreDe(d: Diagnostic) {
    return d.schema?.genre === 'dpe' ? d.schema.finale : null;
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape' && pleinEcran) fermerLApp();
  }}
/>

<!--
  Le dossier, écrit une seule fois.

  Il s'affiche dans la page, ou en grand par-dessus quand on entre depuis une
  icône. Deux rendus du même contenu : ce qu'on lit ne dépend pas de la façon
  dont on y est arrivé.
-->
{#snippet dossier()}
  <!--
    Le bandeau des diagnostics : un onglet par rapport, celui qu'on lit en
    relief. C'est la carte du dossier — on sait toujours où l'on est et ce qui
    reste, sans avoir à deviner.
  -->
  <nav class="bandeau-diags" aria-label="Les diagnostics du dossier">
    {#each diags as d, i (d.type)}
      <button
        type="button"
        class="onglet-diag {d.gravite}"
        class:courant={i === courant}
        aria-current={i === courant ? 'true' : undefined}
        onclick={() => versLe(i)}
        onkeydown={auClavier}
      >
        <span class="pastille" aria-hidden="true"></span>
        <span class="nom-onglet">{d.titre}</span>
      </button>
    {/each}
  </nav>

  <!--
    La scène : un volet à la fois, et les autres qui attendent de part et
    d'autre. On glisse pour changer de diagnostic, exactement comme on
    feuillette. La hauteur suit le volet ouvert, sinon les fiches courtes
    laisseraient un grand vide sous elles.
  -->
  <!-- Le geste est un confort, jamais le seul chemin : le bandeau au-dessus et
       les flèches en dessous font la même chose au clavier comme à la souris.
       D'où le simple rôle de groupe — il n'y a rien à activer ici. -->
  <div
    class="scene"
    role="group"
    aria-label="Les diagnostics du dossier, un par un"
    aria-roledescription="carrousel"
    onpointerdown={debut}
    onpointermove={pendant}
    onpointerup={fin}
    onpointercancel={fin}
  >
    <div class="piste" style:--sens={sens}>
      {#each diags as d, i (d.type)}
        {@const pratique = enPratique(d.type, d.gravite)}
        {@const quand = echeance(d)}
        <article
          class="fiche-diag {d.gravite}"
          class:ouvert={i === courant}
          id="diag-{d.type}"
          aria-hidden={i !== courant ? 'true' : undefined}
        >
          <header>
            <p class="quoi">{d.titre}</p>
            <h3>{libelleCourt(d)}</h3>
            <p class="jusqua-fiche" class:perimee={quand.perimee}>{quand.texte}</p>
            <p class="verdict">{d.verdict}</p>

            <!-- D'où sort cette phrase. Discret, en bas de l'en-tête : c'est le
                 niveau expert, celui qu'on ne cherche que si on doute. Mais il
                 ne se cache pas derrière un clic — une preuve qu'il faut aller
                 chercher ne prouve rien. -->
            <p class="provenance">
              <span class="marque" aria-hidden="true"></span>
              <span>{etiquetteDe(d.origine ?? 'rapport')}</span>
              {#if d.pages}
                {#if surVoirDansLeRapport}
                  <!-- La page n'est plus une mention, c'est un chemin : un clic
                       ouvre le rapport au passage exact. Une preuve qu'on ne
                       peut pas atteindre ne prouve rien. -->
                  <button type="button" class="page" onclick={() => surVoirDansLeRapport(d.type)}>
                    {pageDite(d.pages)} — voir dans mon rapport
                  </button>
                {:else}
                  <span class="page">{pageDite(d.pages)}</span>
                {/if}
              {/if}
            </p>

            <!-- Le niveau de lecture. Deux boutons, jamais un interrupteur : on
                 doit voir d'un coup d'œil où l'on est, sans avoir à interpréter
                 la position d'un curseur. -->
            <div class="modes" role="group" aria-label="Niveau de détail">
              <button
                type="button"
                class:actif={modeDe(d.type) === 'succinct'}
                aria-pressed={modeDe(d.type) === 'succinct'}
                onclick={() => choisirMode(d.type, 'succinct')}
              >
                L’essentiel
              </button>
              <button
                type="button"
                class:actif={modeDe(d.type) === 'detaille'}
                aria-pressed={modeDe(d.type) === 'detaille'}
                onclick={() => choisirMode(d.type, 'detaille')}
              >
                Tout le détail
              </button>
            </div>
          </header>

          <div class="corps">
            <div class="dessin">
              <!-- Deux dessins, deux questions. Le premier explique pourquoi ce
                   contrôle existe ; le second dit ce qu'on a trouvé chez vous,
                   zone par zone. Le second n'apparaît que si le rapport permet
                   de le remplir. -->
              <Explicatif type={d.type} isolation={isolationDe(d)} lettre={lettreDe(d)} />
              <PlanDuLogement diagnostic={d} />
            </div>

            <div class="dit">
              {#if pratique}
                <p class="pratique"><MotsExpliques texte={pratique} /></p>
              {/if}

              <!-- Replié par le style, pas retiré du document : ce qui n'est
                   pas dans la page ne s'imprime pas, et le dossier remis doit
                   être complet quel que soit le bouton laissé enfoncé. -->
              <div class="detail" class:replie={modeDe(d.type) === 'succinct'}>
              {#if d.faits.length}
                <dl class="chiffres">
                  {#each d.faits.slice(0, 4) as fait (fait.libelle)}
                    <div>
                      <dt>{fait.libelle}</dt>
                      <dd>
                        {fait.valeur}
                        {#if fait.precision}<span class="precision">{fait.precision}</span>{/if}
                      </dd>
                    </div>
                  {/each}
                </dl>
              {/if}

              <!-- Tout ce que le rapport énumère, sans en retirer un seul. Placé
                   après les chiffres et avant l'explication générale : c'est le
                   constat, il précède la pédagogie. -->
              {#if d.releves?.length}
                <Releves releves={d.releves} page={d.pages[0]} type={d.type} />
              {/if}

              <dl class="canevas">
                {#each BLOCS as bloc (bloc.cle)}
                  <div>
                    <dt>{bloc.mot}</dt>
                    <dd><MotsExpliques texte={FICHES[d.type][bloc.cle]} /></dd>
                  </div>
                {/each}
              </dl>

              <!-- La liste officielle de ce qu'il faut contrôler soi-même. Le
                   ministère la publie, personne ne la lit : elle a sa place ici,
                   à côté du rapport qu'elle concerne. -->
              {#if d.type === 'dpe'}
                <AVerifier dpe={d} />
              {/if}
              </div>

              <!-- Les réserves : ce que ce diagnostic-là ne couvre pas. Sans
                   elles, une conclusion rassurante se lit comme une garantie. -->
              <div class="reserves">
                <p class="titre-reserves">Ce que ce diagnostic ne garantit pas</p>
                <ul>
                  {#each reservesDe(d) as reserve}
                    <li>{reserve}</li>
                  {/each}
                </ul>
              </div>
            </div>
          </div>
        </article>
      {/each}
    </div>
  </div>

  <!-- Où l'on en est, et par où continuer. Les flèches restent : tout le monde
       ne glisse pas, et personne ne devine un geste qu'on ne lui montre pas. -->
  <nav class="pas-a-pas" aria-label="Naviguer entre les diagnostics">
    <button type="button" onclick={() => versLe(courant - 1)} disabled={courant === 0}>
      <span aria-hidden="true">←</span> Précédent
    </button>

    <p class="ou-on-est">
      <strong>{courant + 1}</strong> sur {diags.length}
      <span class="glisser">Glissez pour changer de diagnostic</span>
    </p>

    <button
      type="button"
      onclick={() => versLe(courant + 1)}
      disabled={courant === diags.length - 1}
    >
      Suivant <span aria-hidden="true">→</span>
    </button>
  </nav>
{/snippet}

{#if pleinEcran}
  <!-- L'application ouverte. Elle couvre l'écran : plus de page derrière, plus
       de bandeau du site, rien d'autre que le diagnostic qu'on a demandé. -->
  <div
    class="app"
    role="dialog"
    aria-modal="true"
    aria-label={diags[courant]?.titre ?? 'Diagnostic'}
    style="--teinte: {identite?.teinteFoncee ?? 'var(--coral-fonce)'}; --teinte-claire: {identite?.teinte ??
      'var(--coral)'}"
    transition:commeUneApp={{ carre: depuis }}
  >
    <header class="barre-app">
      <button type="button" class="retour" onclick={fermerLApp}>
        <span aria-hidden="true">←</span> Retour
      </button>
      {#if identite}
        <span class="signe-app" aria-hidden="true" style="background: {identite.degrade}">
          {identite.signe}
        </span>
      {/if}
      <p class="nom-app">{diags[courant]?.titre ?? ''}</p>
    </header>

    <div class="dedans">
      <section class="diagnostics">
        {@render dossier()}
      </section>
    </div>
  </div>
{:else}
  <section class="diagnostics">
    {@render dossier()}
  </section>
{/if}

<style>
  .diagnostics {
    margin-bottom: var(--e6);
  }

  /* ---- L'application ouverte ----------------------------------------------
     Elle couvre l'écran, fond compris : c'est ce qui fait la différence entre
     entrer quelque part et regarder une fenêtre posée sur une page. Le carré
     d'où elle vient est donné par la transition, pas par ce style. */
  .app {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--fond);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    will-change: transform;
  }

  /* La barre du haut : la sortie à gauche, le nom du diagnostic à côté. Elle ne
     défile pas — on doit pouvoir ressortir depuis n'importe quel endroit de la
     fiche, sans remonter. */
  /* La barre porte la couleur de l'application : un filet en bas, et l'icône à
     côté du nom. On sait dans quelle application on est sans lire le titre. */
  .barre-app {
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--e2);
    padding: var(--e2) var(--e3);
    background: rgb(255 255 255 / 82%);
    backdrop-filter: blur(20px);
    border-bottom: 2px solid var(--teinte, var(--trait));
  }

  .signe-app {
    flex: none;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    font-size: 15px;
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
    color: var(--teinte, var(--coral-texte));
    font-size: var(--t-base);
    font-weight: 700;
    cursor: pointer;
  }

  .retour:hover {
    background: var(--surface);
  }

  .nom-app {
    margin: 0;
    min-width: 0;
    font-size: var(--t-petit);
    font-weight: 700;
    color: var(--sur-fond);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Le contenu défile seul, sous la barre. */
  .dedans {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: var(--e4) var(--e4) var(--e7);
  }

  .dedans .diagnostics {
    max-width: 900px;
    margin-inline: auto;
    margin-bottom: 0;
  }

  /* Une application ne s'imprime pas : c'est le dossier qu'on imprime. */
  @media print {
    .app {
      position: static;
      background: none;
    }

    .barre-app {
      display: none;
    }

    .dedans {
      overflow: visible;
      padding: 0;
    }
  }

  /* ---- Le bandeau des diagnostics ---------------------------------------
     Un onglet par rapport, sur une seule ligne qui défile si le dossier est
     long. L'onglet ouvert est en relief : il avance vers le lecteur pendant
     que les autres restent en retrait. */
  .bandeau-diags {
    display: flex;
    gap: var(--e2);
    overflow-x: auto;
    /* Pas de barre de défilement sous les onglets : elle traversait la page
       d'un trait blanc plus voyant que les onglets eux-mêmes. Ce qui dit qu'il
       y en a d'autres, c'est l'effacement au bord — et le fait qu'ils bougent
       quand on les pousse. */
    scrollbar-width: none;
    padding: var(--e1) var(--e1) var(--e2);
    margin-bottom: var(--e4);
    /* Les onglets qui débordent s'effacent au bord plutôt que d'être tranchés
       net : on comprend qu'il y en a d'autres. */
    mask-image: linear-gradient(90deg, transparent, #000 14px, #000 calc(100% - 14px), transparent);
  }

  .bandeau-diags::-webkit-scrollbar {
    display: none;
  }

  .onglet-diag {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: var(--e2);
    padding: var(--e2) var(--e4);
    background: var(--surface-forte);
    border: 1px solid var(--surface-bord);
    border-radius: 999px;
    color: var(--sur-fond-doux);
    font-size: var(--t-petit);
    font-weight: 600;
    letter-spacing: var(--suivi-serre);
    white-space: nowrap;
    cursor: pointer;
    transition:
      background 0.18s ease,
      color 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease;
  }

  .onglet-diag:hover {
    background: var(--surface-bord);
    color: var(--sur-fond);
  }

  /* L'onglet ouvert : un fond franc, la teinte de sa gravité en bordure, et
     une ombre portée qui le décolle de la ligne. */
  .onglet-diag.courant {
    background: linear-gradient(180deg, var(--surface-bord), var(--surface-forte));
    border-color: var(--gravite, var(--or));
    color: var(--sur-fond);
    box-shadow: 0 8px 18px -12px rgb(15 58 71 / 100%);
  }

  .pastille {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gravite, var(--sur-fond-doux));
    flex: none;
  }

  .onglet-diag.bon {
    --gravite: var(--petrole);
  }
  .onglet-diag.attention {
    --gravite: var(--attention);
  }
  .onglet-diag.alerte {
    --gravite: var(--coral);
  }
  .onglet-diag.neutre {
    --gravite: var(--sur-fond-doux);
  }

  /* ---- La scène ---------------------------------------------------------
     Le geste horizontal nous appartient, le vertical reste à la page : c'est
     ce que dit `pan-y`, et c'est ce qui garde le défilement fluide au pouce. */
  .scene {
    touch-action: pan-y;
  }

  /* Les volets occupent tous la même case : la pile prend d'elle-même la
     hauteur de celui qui est ouvert, les autres ne mesurant rien. */
  .piste {
    display: grid;
  }

  .fiche-diag {
    grid-area: 1 / 1;
    min-width: 0;
    /* Endormi : plus rien à lire, plus rien à tabuler, plus rien à mesurer.
       Le volet reste dans le document — c'est ce qui permet d'imprimer le
       dossier entier. */
    visibility: hidden;
    height: 0;
    overflow: hidden;
  }

  .fiche-diag.ouvert {
    visibility: visible;
    height: auto;
    overflow: visible;
    /* Le volet arrive du côté d'où on l'a appelé : c'est ce décalage qui donne
       le sentiment que les fiches tournent, et non qu'elles se remplacent.

       Pas de `fill-mode` : avec `both`, un volet dont l'animation ne démarre
       pas resterait figé sur son image de départ, à opacité nulle — on
       cliquerait un diagnostic et la fiche serait vide. Sans lui, l'état
       naturel est l'état visible, et le mouvement n'est qu'un agrément. */
    animation: entre 0.38s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* Le déplacement seul, sans fondu : une animation qui ne progresse pas
     laisserait sinon la fiche à opacité nulle, et le diagnostic qu'on vient de
     demander resterait vide. Décalée, elle se lit quand même. */
  @keyframes entre {
    from {
      transform: translateX(calc(var(--sens, 1) * 44px));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fiche-diag.ouvert {
      animation: none;
    }
  }

  /* ---- Où l'on en est ---------------------------------------------------- */
  .pas-a-pas {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--e4);
    margin-top: var(--e4);
    padding-top: var(--e4);
    border-top: 1px solid var(--trait-or);
  }

  .pas-a-pas button {
    background: none;
    border: 1px solid var(--trait-or);
    border-radius: 999px;
    padding: var(--e2) var(--e4);
    color: var(--sur-fond);
    font-size: var(--t-petit);
    font-weight: 600;
    cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
  }

  .pas-a-pas button:hover:not(:disabled) {
    background: var(--or);
    border-color: var(--or);
    color: var(--vert-900);
  }

  .pas-a-pas button:disabled {
    opacity: 0.32;
    cursor: default;
  }

  .ou-on-est {
    margin: 0;
    text-align: center;
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  .ou-on-est strong {
    font-family: var(--police-titre);
    font-size: var(--t-lead);
    font-weight: 500;
    color: var(--sur-fond);
  }

  /* Le geste ne se devine pas : on le dit, une fois, sous le compteur. */
  .glisser {
    display: block;
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
    opacity: 0.75;
  }

  @media (max-width: 560px) {
    .glisser {
      display: none;
    }
  }

  /* Un rapport périmé fait repousser une signature : il se voit. */
  .jusqua-fiche.perimee {
    /* Mesuré sur le fond réel de la ligne : #f0907c n'y tenait que 4,39. */
    /* Ce rouge clair était lisible sur le vert nuit ; sur fond clair il tombe à
       1,79. La péremption d'un rapport est justement ce qu'il ne faut pas rater. */
    color: var(--alerte);
    font-weight: 650;
  }

  /* Chaque diagnostic occupe son propre bandeau, avec son fond et son liseré.
     Empilés sans séparation, sept dossiers se lisaient comme un seul texte
     très long : on ne savait plus où l'on était. */
  .fiche-diag {
    padding: var(--e5);
    /* La teinte de la gravité irrigue tout le volet, du haut vers le fond : le
       diagnostic se reconnaît avant d'être lu. Elle reste un voile — huit pour
       cent d'une couleur, pas un aplat. */
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--gravite-fiche) 12%, transparent),
        transparent 220px
      ),
      var(--surface-forte);
    border: 1px solid var(--surface-forte);
    border-top-color: var(--surface-bord);
    border-left: 4px solid var(--gravite-fiche, var(--sur-fond-doux));
    border-radius: var(--rayon);
    box-shadow: 0 1px 0 var(--surface-forte) inset, 0 24px 48px -32px rgb(15 58 71 / 100%);
    break-inside: avoid;
    /* La barre des vues est collante : sans cette marge, une ancre déposait le
       titre de la fiche juste derrière elle. */
    scroll-margin-top: 110px;
  }

  .fiche-diag.bon {
    --gravite-fiche: var(--petrole);
  }
  .fiche-diag.attention {
    --gravite-fiche: var(--attention);
  }
  .fiche-diag.alerte {
    --gravite-fiche: var(--coral);
  }
  .fiche-diag.neutre {
    --gravite-fiche: var(--sur-fond-doux);
  }

  @media (max-width: 620px) {
    .fiche-diag {
      padding: var(--e4);
    }
  }

  .jusqua-fiche {
    margin: 0 0 var(--e1);
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  header {
    border-left: 3px solid var(--gravite, var(--sur-fond-doux));
    padding-left: var(--e4);
    margin-bottom: var(--e4);
  }

  .fiche-diag.bon {
    --gravite: var(--petrole);
  }
  .fiche-diag.attention {
    --gravite: var(--attention);
  }
  .fiche-diag.alerte {
    --gravite: var(--coral);
  }
  .fiche-diag.neutre {
    --gravite: var(--sur-fond-doux);
  }

  .quoi {
    margin: 0 0 var(--e1);
    font-size: var(--t-micro);
    letter-spacing: 0.14em;
    color: var(--sur-fond-doux);
  }

  h3 {
    font-family: var(--police-titre);
    font-weight: 500;
    font-size: clamp(1.2rem, 2.6vw, 1.5rem);
    letter-spacing: -0.022em;
    margin: 0 0 var(--e1);
    color: var(--or-clair);
  }

  .verdict {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--sur-fond);
  }

  /* ---- Le niveau de lecture ----------------------------------------------
     Deux boutons de même largeur, séparés du reste par un filet : c'est une
     commande, pas un paragraphe. L'actif prend le corail plein — la seule
     couleur d'action du produit. */
  .modes {
    display: flex;
    gap: var(--e2);
    margin-top: var(--e4);
    padding-top: var(--e3);
    border-top: 1px solid var(--trait);
  }

  .modes button {
    flex: 1;
    min-height: 40px;
    background: transparent;
    border: 1px solid var(--trait);
    border-radius: var(--rayon-badge);
    color: var(--sur-fond-doux);
    font-size: var(--t-petit);
    font-weight: 700;
    cursor: pointer;
    transition: background var(--duree) var(--courbe), color var(--duree) var(--courbe),
      border-color var(--duree) var(--courbe);
  }

  .modes button:hover {
    border-color: var(--coral-fonce);
    color: var(--coral-texte);
  }

  .modes button.actif {
    background: var(--coral-fonce);
    border-color: var(--coral-fonce);
    color: #fff;
  }

  /* Le détail arrive par le haut, sans fondu.
     Une opacité animée fige la première image dès que l'animation ne progresse
     pas — c'est déjà arrivé sur cet écran, et un contenu invisible est pire
     qu'un contenu sans effet. */
  .detail {
    animation: deplie 0.2s var(--courbe);
  }

  .detail.replie {
    display: none;
  }

  @keyframes deplie {
    from {
      transform: translateY(-6px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .detail {
      animation: none;
    }

    .modes button {
      transition: none;
    }
  }

  /* Le document imprimé n'a pas de boutons : il a tout. */
  @media print {
    .modes {
      display: none;
    }

    .detail.replie {
      display: block;
    }
  }

  /* La provenance se lit après le verdict, jamais avant : elle répond à une
     question qu'on ne se pose qu'ensuite. D'où le retrait et la teinte
     assourdie — présente, mais qui ne dispute rien à la phrase du dessus. */
  .provenance {
    margin: var(--e2) 0 0;
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
    display: flex;
    align-items: baseline;
    gap: var(--e2);
  }

  .provenance .marque {
    width: 14px;
    height: 1px;
    background: var(--trait-or);
    flex: none;
    transform: translateY(-0.3em);
  }

  /* La page se détache : c'est la seule information du lot sur laquelle le
     lecteur peut agir — ouvrir son rapport et vérifier. */
  .provenance .page {
    color: var(--or-clair);
    white-space: nowrap;
  }

  /* Bouton, mais dessiné comme un lien : ce n'est pas une action du produit,
     c'est un renvoi vers le document. Il se souligne au survol plutôt que de
     s'entourer d'un cadre. */
  button.page {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-size: var(--t-petit);
    cursor: pointer;
    border-bottom: 1px solid transparent;
  }

  button.page:hover,
  button.page:focus-visible {
    border-bottom-color: var(--or);
  }

  .provenance .page::before {
    content: '· ';
    color: var(--sur-fond-doux);
  }

  /* Le dessin d'un côté, ce qu'on en dit de l'autre. */
  .corps {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: var(--e5);
    align-items: start;
  }

  @media (max-width: 860px) {
    .corps {
      grid-template-columns: 1fr;
    }
  }

  .dessin {
    background: var(--papier);
    border-radius: var(--rayon-petit);
    padding: var(--e4) var(--e4);
    color: var(--encre);
  }

  .pratique {
    margin: 0 0 var(--e4);
    font-style: italic;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--or-clair);
  }

  .chiffres {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0 var(--e5);
    margin: 0 0 var(--e4);
  }

  .chiffres div {
    padding: var(--e2) 0;
    border-bottom: 1px solid var(--surface-bord);
  }

  .chiffres dt {
    font-size: var(--t-micro);
    letter-spacing: 0.12em;
    color: var(--sur-fond-doux);
  }

  .chiffres dd {
    margin: var(--e1) 0 0;
    font-size: var(--t-base);
    font-weight: 650;
    color: var(--sur-fond);
  }

  .precision {
    display: block;
    font-size: var(--t-petit);
    font-weight: 400;
    color: var(--sur-fond-doux);
  }

  /* Le canevas : les cinq mêmes questions pour les neuf diagnostics. */
  .canevas {
    margin: 0;
    display: grid;
    gap: var(--e3);
  }

  .canevas div {
    break-inside: avoid;
  }

  .canevas dt {
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: 0.13em;
    color: var(--or-fonce);
    margin-bottom: var(--e1);
  }

  .canevas dd {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--sur-fond-doux);
  }

  /* Les réserves ferment la fiche : c'est la limite de ce qui vient d'être dit. */
  .reserves {
    margin-top: var(--e4);
    padding-top: var(--e3);
    border-top: 1px solid var(--surface-bord);
    break-inside: avoid;
  }

  .titre-reserves {
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: 0.13em;
    color: var(--sur-fond-doux);
  }

  .reserves ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--e1);
  }

  .reserves li {
    position: relative;
    padding-left: var(--e4);
    font-size: var(--t-base);
    line-height: 1.45;
    color: var(--sur-fond-doux);
  }

  .reserves li::before {
    content: '—';
    position: absolute;
    left: 0;
    color: var(--sur-fond-doux);
  }

  /* Le carrousel est un confort d'écran. Sur le document remis, les neuf
     fiches se déplient et s'empilent : on n'imprime pas un geste. */
  @media print {
    .bandeau-diags,
    .pas-a-pas {
      display: none !important;
    }

    .piste {
      display: block !important;
    }

    .fiche-diag {
      visibility: visible !important;
      height: auto !important;
      overflow: visible !important;
      animation: none !important;
      margin-bottom: 10mm;
      box-shadow: none !important;
      background: none !important;
    }
  }
</style>
