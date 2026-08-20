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
  import type { Analyse, Diagnostic, Fait, TypeDiag } from '../lib/modele';
  import { espacesFrancaises } from '../lib/typographie';
  import Explicatif from './schemas/Explicatif.svelte';
  import VisuelDpe from './visuels/VisuelDpe.svelte';
  import TableauElectrique from './visuels/TableauElectrique.svelte';
  import VisuelAmiante from './visuels/VisuelAmiante.svelte';
  import VisuelPlomb from './visuels/VisuelPlomb.svelte';
  import VisuelGaz from './visuels/VisuelGaz.svelte';
  import VisuelTermites from './visuels/VisuelTermites.svelte';
  import VisuelRisques from './visuels/VisuelRisques.svelte';
  import PlanDuLogement from './plans/PlanDuLogement.svelte';
  import MotsExpliques from './MotsExpliques.svelte';
  import Releves from './Releves.svelte';
  import OuEstLePlomb from './OuEstLePlomb.svelte';
  import LesSurfaces from './LesSurfaces.svelte';
  import AVerifier from './AVerifier.svelte';
  import Travaux from './Travaux.svelte';
  import { libelleCourt } from '../lib/libelle';
  import { enPratique, FICHES } from '../lib/analyse/fiches';
  import { echeance } from '../lib/echeance';
  import { etiquetteDe } from '../lib/analyse/confiance';
  import type { Origine } from '../lib/bureau';
  import { APPS } from '../lib/apps';
  import { estSombre, styleUnivers } from '../lib/univers';
  import { lumiereSur, questionDe } from '../lib/lumiere';

  /**
   * LE CHIFFRE QUI PARLE, par diagnostic.
   *
   * Prendre le premier fait venu ne marche pas : sur le DPE, l'analyseur donne
   * la surface de reference en tete, et c'est elle qui se retrouvait en grand.
   * Or personne n'ouvre son DPE pour connaitre sa surface -- il l'ouvre pour
   * savoir ce que son logement consomme.
   *
   * Cette table nomme, pour chaque diagnostic, le fait qui repond a la
   * question de l'ecran. A defaut, on retombe sur le premier : mieux vaut un
   * chiffre en grand qu'aucun.
   */
  const CHIFFRE_CLE: Partial<Record<TypeDiag, RegExp>> = {
    dpe: /consommation/i,
    electricite: /anomalies|points relev/i,
    gaz: /anomalies/i,
    plomb: /unit[ée]s|class[ée]|mesures/i,
    amiante: /mat[ée]riaux|rep[ée]r/i,
    termites: /zones|indices/i,
    erp: /risques/i,
    carrez: /superficie|surface/i,
    assainissement: /installation|conformit/i
  };

  /** Le fait a poser en grand : celui qui repond a la question, sinon le premier. */
  function chiffreChef(d: Diagnostic): Fait | undefined {
    const motif = CHIFFRE_CLE[d.type];
    return (motif && d.faits.find((f) => motif.test(f.libelle))) ?? d.faits[0];
  }

  /* Les sept couleurs de l'arrete du 31 mars 2021. Elles ne s'inventent pas et
     ne se reinterpretent pas : ce sont celles de l'etiquette officielle. */
  const TEINTE_ARRETE: Record<string, string> = {
    A: '#319834',
    B: '#33cc31',
    C: '#cbfc34',
    D: '#fbfe06',
    E: '#fbcc05',
    F: '#fc9935',
    G: '#fc0205'
  };
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

    /*
     * L'écran se pose, il ne se déplie plus.
     *
     * Il partait du carré de l'icône et grandissait jusqu'à couvrir la page —
     * un beau geste, mais il fait maintenant doublon : c'est la propagation de
     * couleur qui porte le lien entre l'icône et l'écran, et l'ordre de mission
     * la désigne comme la signature du produit. Deux mouvements pour une seule
     * ouverture se gênaient l'un l'autre.
     *
     * Reste le strict nécessaire : l'écran monte en opacité pendant que la
     * couleur finit de s'effacer, avec un souffle d'échelle pour qu'il se pose
     * au lieu d'apparaître. Le carré n'est plus lu — il sert à la propagation,
     * en amont.
     */
    void carre;

    return {
      duration: 240,
      easing: cubicOut,
      css: (t: number, u: number) =>
        `transform: scale(${1 - u * 0.03});
         opacity: ${Math.min(1, t * 1.6)};`
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

  /*
   * LES SIX ÉTAPES DE L'ORDRE DE MISSION DIRECTEUR — voir `lib/etapes.ts`.
   *
   * « CE QU'IL FAUT SAVOIR → EST-CE IMPORTANT ? → OÙ ? → POURQUOI ? → QUE
   * FAIRE ? → POUR ALLER PLUS LOIN. » Rien n'est créé ici : tout ce contenu
   * existait déjà, mais à la file et sans intitulés. Le lecteur traversait la
   * fiche sans savoir où il en était.
   *
   * La liste est dans `lib/etapes.ts` et un test compare ce que ce composant
   * affiche à ce qu'elle prescrit : l'ordre ne peut plus se défaire en silence.
   */
  /**
   * Les rubriques de fond, réparties dans les six étapes.
   *
   * Elles étaient présentées à la file, sous cinq titres de même niveau. Chacune
   * répond en réalité à l'une des six questions : « ce qu'on risque » dit si
   * c'est important, « ce qu'il faut faire » dit quoi faire, « pourquoi ce
   * diagnostic existe » et « comment il est fait » relèvent du fond, et « ce que
   * ça change pour vendre » de l'approfondissement.
   */
  const BLOCS = [
    { cle: 'risque', mot: 'Ce qu’on risque', etape: 'importance' },
    { cle: 'pourquoi', mot: 'Pourquoi ce diagnostic existe', etape: 'pourquoi' },
    { cle: 'quoiFaire', mot: 'Ce qu’il faut faire', etape: 'faire' },
    { cle: 'comment', mot: 'Comment il est fait', etape: 'loin' },
    { cle: 'vente', mot: 'Ce que ça change pour vendre', etape: 'loin' }
  ] as const;

  /** Les rubriques d'une étape donnée. */
  function blocsDe(etape: string) {
    return BLOCS.filter((b) => b.etape === etape);
  }

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

  /*
   * ---- Le visuel propre au diagnostic --------------------------------------
   *
   * Chaque écran a son dessin : l'escalier A→G, le tableau à disjoncteurs, le
   * champ d'observation du repérage, la paillasse d'analyse, la chaudière et sa
   * jauge, les zones sondées du bois, la coupe de terrain. Ils viennent des
   * maquettes de la cliente, et ils ne sont pas interchangeables — c'est ce qui
   * fait qu'on reconnaît l'écran avant d'avoir lu son titre.
   *
   * Chaque accesseur rend le schéma d'un bloc plutôt que champ par champ : le
   * rétrécissement de type par `d.schema?.genre === '…'` ne survit pas à trois
   * lectures séparées dans le balisage.
   *
   * Quand le moteur n'a rien pu lire, l'accesseur rend `null` et le visuel le
   * dit à sa façon. Aucun ne devine, aucun ne remplit : un dessin qui invente
   * ses données ment mieux qu'un paragraphe.
   */
  function dpeDe(d: Diagnostic) {
    return d.schema?.genre === 'dpe' ? d.schema : null;
  }

  function plombDe(d: Diagnostic) {
    return d.schema?.genre === 'plomb' ? d.schema : null;
  }

  function zonesDe(d: Diagnostic) {
    return d.schema?.genre === 'pieces' ? d.schema.zones : null;
  }

  function risquesDe(d: Diagnostic) {
    return d.schema?.genre === 'risques' ? d.schema.risques : null;
  }

  /**
   * Les points de contrôle de l'installation électrique.
   *
   * Le moteur rend des groupes d'anomalies — « appareil général de commande :
   * 2 », « liaison équipotentielle : 1 ». Le tableau les dessine en rangée de
   * modules, un par groupe relevé.
   *
   * Il n'invente pas les points SANS anomalie : la norme en compte six, mais un
   * rapport qui n'en cite aucun n'établit pas pour autant que les autres sont
   * conformes. Dessiner six modules dont quatre verts affirmerait un contrôle
   * que personne n'a lu.
   */
  function pointsDe(d: Diagnostic) {
    if (d.schema?.genre !== 'anomalies') return null;
    return d.schema.groupes.map((g) => ({
      nom: g.nom,
      etat: 'anomalie' as const,
      detail: g.nombre > 1 ? `${g.nombre} anomalies` : '1 anomalie'
    }));
  }

  function nombreAnomaliesDe(d: Diagnostic) {
    return d.schema?.genre === 'anomalies' ? d.schema.total : null;
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
        <!--
          LE NOM DE L'APPLICATION, PAS CELUI DU RAPPORT.

          Les onglets portaient le titre reglementaire complet : « Performance
          energetique (DPE) », « Plomb dans les peintures (CREP) », « Risques et
          pollutions (ERP) ». Du vocabulaire de dossier, qui remplit la barre
          sans rien apprendre — on n'ecrit pas « Reglages du systeme » sur une
          icone d'application.

          Le nom court existait deja dans `apps.ts`, et c'est celui de la tuile
          d'accueil : le lecteur retrouve donc le meme mot d'un ecran a l'autre.
          Le titre complet reste dans la fiche et dans la barre de l'app.
        -->
        <span class="nom-onglet">{APPS[d.type]?.nom ?? d.titre}</span>
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
            <!--
              LA CLASSE, EN GRAND, DANS SA COULEUR REGLEMENTAIRE.

              Test du silence sur cette fiche : textes masques, toute la zone du
              verdict etait vide. La conclusion -- priorite visuelle numero un --
              n'existait qu'en mots, alors que le DPE a justement un signe : sa
              lettre.

              Elle est posee dans la couleur de l'arrete, qui ne s'invente pas,
              et elle n'ajoute aucune information : c'est le meme verdict, rendu
              visible d'un regard. Seul le DPE en a une ; les autres diagnostics
              gardent leur en-tete tel quel.
            -->
            {#if d.schema?.genre === 'dpe' && d.schema.finale}
              <span
                class="classe-dpe"
                style="background: {TEINTE_ARRETE[d.schema.finale]}"
                aria-hidden="true">{d.schema.finale}</span>
            {/if}
            <!--
              LE NOM DU DIAGNOSTIC NE S'ECRIT PAS DEUX FOIS.

              Il est deja dans la barre de l'application, en haut de l'ecran,
              et une seconde fois dans l'onglet actif juste au-dessus. Le
              repeter en surtitre faisait trois fois le meme mot administratif
              -- « Performance energetique (DPE) » -- avant d'arriver au
              verdict.

              En plein ecran on l'enleve donc. Dans la liste imprimee, ou il
              n'y a ni barre ni onglet, il reste : c'est la qu'il sert.
            -->
            {#if !pleinEcran}
              <p class="quoi">{d.titre}</p>
            {/if}
            <h3>{libelleCourt(d)}</h3>
            <!--
              La validite descend avec la provenance.

              « Valable jusqu'au 12/03/2035 » entre le verdict et son
              explication coupait la lecture par une mention de gestion. Elle
              n'a pas disparu : elle rejoint la ligne d'ou-vient-cette-phrase,
              qui est sa famille -- ce qu'il faut savoir sur le document, non
              sur le logement.
            -->
            <!-- Le verdict est LA phrase de l'écran. Il vient du moteur, en
                 espaces ordinaires ; sans traitement, « … une « passoire
                 thermique / ». La loi limite… » — guillemet fermant seul en
                 tête de ligne, sur la conclusion la plus lue de l'app. -->
            <p class="verdict">{espacesFrancaises(d.verdict)}</p>

            <!-- D'où sort cette phrase. Discret, en bas de l'en-tête : c'est le
                 niveau expert, celui qu'on ne cherche que si on doute. Mais il
                 ne se cache pas derrière un clic — une preuve qu'il faut aller
                 chercher ne prouve rien. -->
            <p class="provenance">
              <span class="marque" aria-hidden="true"></span>
              <span>{etiquetteDe(d.origine ?? 'rapport')}</span>
              <span class="validite" class:perimee={quand.perimee}>· {quand.texte}</span>
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

          </header>

          <div class="corps">
            <div class="dessin">
              <!-- Le visuel de l'écran vient en premier : c'est lui qui dit,
                   avant tout mot, dans quel diagnostic on est entré. -->
              {#if d.type === 'dpe'}
                {@const s = dpeDe(d)}
                {#if s}
                  <VisuelDpe energie={s.energie} climat={s.climat} finale={s.finale} />
                {/if}
              {:else if d.type === 'electricite'}
                {@const points = pointsDe(d)}
                {#if points}
                  <TableauElectrique
                    {points}
                    nombreAnnonce={nombreAnomaliesDe(d)}
                    gravite={d.gravite}
                  />
                {/if}
              {:else if d.type === 'amiante'}
                <VisuelAmiante gravite={d.gravite} zones={zonesDe(d)} />
              {:else if d.type === 'plomb'}
                {@const s = plombDe(d)}
                {#if s}
                  <VisuelPlomb
                    classes={s.classes}
                    nonMesurees={s.nonMesurees}
                    total={s.total}
                  />
                {/if}
              {:else if d.type === 'gaz'}
                <!-- L'année de la chaudière n'est pas relevée par le moteur : le
                     visuel s'en passe et le dit, plutôt que d'afficher celle de
                     la maquette. -->
                <VisuelGaz />
              {:else if d.type === 'termites'}
                <VisuelTermites
                  conclusion={d.gravite === 'bon' ? 'sain' : d.gravite === 'alerte' ? 'indices' : null}
                  zones={zonesDe(d)}
                  page={d.pages?.[0] ?? null}
                />
              {:else if d.type === 'erp'}
                <VisuelRisques risques={risquesDe(d)} />
              {/if}

              <!--
                DEUX DESSINS DESCENDENT À LEUR QUESTION.

                La scène empilait trois schémas d'affilée — 1 808 px de haut sur
                le DPE — et on les recevait tous les trois avant d'avoir lu quoi
                que ce soit. « Moins mais mieux » : ce n'est pas la quantité de
                dessin qui fait comprendre, c'est le dessin au bon endroit.

                Chacun répond en fait à une question différente, et ces questions
                ont déjà leur section plus bas :
                  · l'explicatif (« par où la chaleur part ») → POURQUOI,
                  · le plan des parois (« ce qu'on a trouvé chez vous ») → OÙ.

                Ne reste ici que le schéma d'identité, celui qui dit dans quel
                diagnostic on est entré avant tout mot.
              -->
            </div>

            <div class="dit">
              {#if pratique}
                <p class="pratique"><MotsExpliques texte={pratique} /></p>
              {/if}

              <!--
                LE REPLI SE FAIT SECTION PAR SECTION, ET C'EST TOUT L'ENJEU.

                Un conteneur unique enveloppait les six sections et les masquait
                ensemble en mode « L'essentiel », qui est le mode par defaut.
                Restaient alors visibles a l'ouverture : le verdict, les visuels,
                et la phrase « en pratique » -- une explication de Verriere.

                Autrement dit, le lecteur voyait notre commentaire AVANT le
                moindre chiffre du rapport, puisque les faits sont en section 1.
                C'est l'inversion que les documents interdisent trois fois :
                « la donnee brute s'affiche AVANT toute explication »,
                « qualification source visible avant l'explication », et
                « LE DIAGNOSTIC DIT, VERRIERE RESTITUE, VERRIERE EXPLIQUE
                ENSUITE. JAMAIS L'INVERSE. »

                Deux sections ne se replient donc plus : les CHIFFRES du rapport
                (1) et les LOCALISATIONS (3) -- ce que le rapport dit et ou il le
                dit. Le repli ne porte plus que sur ce qui est de nous :
                l'importance, le pourquoi, l'action et l'approfondissement.

                L'ordre des six reste celui de l'ordre de mission directeur :
                on replie sur place, on ne deplace rien.

                Replie par le style, pas retire du document : ce qui n'est pas
                dans la page ne s'imprime pas, et le dossier remis doit etre
                complet quel que soit le bouton laisse enfonce.
              -->

              <!-- 1 · CE QU'IL FAUT SAVOIR — les chiffres du rapport, avant
                   toute explication. Le résultat avant le commentaire. -->
              {#if d.faits.length}
                <!--
                  UN CHIFFRE DOMINE, LES AUTRES SUIVENT.

                  C'etait quatre paires libelle/valeur alignees comme un
                  formulaire : « Surface de reference · 48,5 m² », « Annee de
                  construction · Avant 1948 »… Toutes du meme poids, donc
                  aucune hierarchie -- exactement le « tableau reglementaire
                  ameliore » que l'ordre de mission interdit.

                  Le premier fait est celui que l'analyseur juge le plus
                  parlant : il passe en grand, avec son unite detachee. Les
                  suivants restent, en une ligne discrete -- on hierarchise,
                  on n'ampute pas.
                -->
                {@const chef = chiffreChef(d)}
                {@const suite = d.faits.filter((f) => f !== chef).slice(0, 3)}
                <section class="etape" aria-labelledby="et-savoir-{d.type}">
                  <h4 id="et-savoir-{d.type}" class="titre-etape">Ce qu’il faut savoir</h4>

                  {#if chef}
                    <p class="chiffre-chef">
                      <span class="valeur-chef">{chef.valeur}</span>
                      <span class="quoi-chef">{chef.libelle}</span>
                      {#if chef.precision}<span class="precision-chef">{chef.precision}</span>{/if}
                    </p>
                  {/if}

                  {#if suite.length}
                    <ul class="chiffres-suite">
                      {#each suite as fait (fait.libelle)}
                        <li>
                          <b>{fait.valeur}</b>
                          <span>{fait.libelle}</span>
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </section>
              {/if}

              <!-- 2 · EST-CE IMPORTANT ? — ce qu'on risque, et ce que le dossier
                   en dit concrètement. C'est la question que tout le monde se
                   pose en premier, et à laquelle rien ne répondait directement. -->
              <section class="etape detail" class:replie={modeDe(d.type) === 'succinct'} aria-labelledby="et-importance-{d.type}">
                <h4 id="et-importance-{d.type}" class="titre-etape">Est-ce important&nbsp;?</h4>
                {#if pratique}
                  <p class="reponse-etape"><MotsExpliques texte={pratique} /></p>
                {/if}
                {#each blocsDe('importance') as bloc (bloc.cle)}
                  <p class="reponse-etape"><MotsExpliques texte={FICHES[d.type][bloc.cle]} /></p>
                {/each}
              </section>

              <!--
                3 · OU ? — tout ce que le rapport enumere, rattache a sa piece,
                sans en retirer un seul. Le constat precede la pedagogie.

                ── LA SECTION NE DISPARAIT PLUS ────────────────────────────────

                Elle ne s'affichait que si le rapport donnait des localisations.
                Mesure a l'ecran sur le dossier de demonstration : « Ou ? »
                manquait dans CINQ fiches sur sept. Chaque diagnostic avait donc
                une structure differente, la ou l'ordre de mission directeur en
                impose six, les memes partout -- « meme charte visuelle, seule la
                couleur change ».

                Et l'absence etait muette : rien ne distinguait « le rapport ne
                localise rien » de « nous n'avons pas regarde ». Le meme ordre de
                mission prescrit la phrase, mot pour mot : « Si une donnee
                manque : Information non disponible dans le diagnostic. »
              -->
              <section class="etape" aria-labelledby="et-ou-{d.type}">
                <h4 id="et-ou-{d.type}" class="titre-etape">Où&nbsp;?</h4>

                <!--
                  Le plomb sait dire ses pieces, et ne le disait pas.

                  Le moteur relevait deja zone, element et classement, et les
                  rangeait dans le schema ; aucun composant ne les affichait. Le
                  lecteur qui demandait « ou ? » lisait « information non
                  disponible » alors que son rapport la donne, piece par piece.
                -->
                {#if d.schema?.genre === 'plomb' && d.schema.emplacements.length}
                  <OuEstLePlomb emplacements={d.schema.emplacements} />
                {/if}

                <!--
                  La Carrez savait dire ses pièces, et ne le disait pas.

                  « On veut connaître toutes les surfaces. » Le certificat les
                  détaille ligne par ligne, `piecesMesurees()` les relevait, et
                  l'écran n'en montrait qu'un total : le lecteur voyait « 42 m² »
                  sans savoir d'où venaient ces mètres.
                -->
                {#if d.schema?.genre === 'surfaces' && d.schema.pieces.length}
                  <LesSurfaces
                    pieces={d.schema.pieces}
                    totalPrivative={d.schema.totalPrivative}
                    totalAuSol={d.schema.totalAuSol}
                  />
                {/if}

                <!-- Le plan des parois : ce que le rapport dit de chez vous,
                     paroi par paroi. Il descend de la scène jusqu'ici — c'est
                     une réponse à « où ? », pas une illustration d'en-tête. -->
                <PlanDuLogement diagnostic={d} />

                {#if d.releves?.length}
                  <Releves releves={d.releves} page={d.pages[0]} type={d.type} />
                {:else if !(d.schema?.genre === 'plomb' && d.schema.emplacements.length) && !(d.schema?.genre === 'surfaces' && d.schema.pieces.length)}
                  <p class="reponse-etape sans-donnee">
                    Information non disponible dans le diagnostic&nbsp;: ce rapport
                    ne rattache aucun constat à une pièce ou à un local.
                  </p>
                {/if}
              </section>

              <!--
                4 · POURQUOI ? — d'abord ce que CE rapport-ci raconte, ensuite
                pourquoi ce diagnostic existe.

                Les paragraphes propres au rapport n'étaient affichés nulle part :
                le moteur les produisait depuis toujours, chaque analyseur en
                écrivait trois à sept, et le champ n'était lu par aucun composant.
                Tout ce qui distingue un dossier d'un autre restait dans la
                mémoire du programme.
              -->
              <section class="etape detail" class:replie={modeDe(d.type) === 'succinct'} aria-labelledby="et-pourquoi-{d.type}">
                <h4 id="et-pourquoi-{d.type}" class="titre-etape">Pourquoi&nbsp;?</h4>

                <!-- Le dessin qui explique le mécanisme du contrôle. Il ouvre la
                     réponse plutôt que de la précéder de trois écrans. -->
                <Explicatif type={d.type} isolation={isolationDe(d)} lettre={lettreDe(d)} />

                {#if d.explication.length}
                  <div class="propre-au-rapport">
                    {#each d.explication as paragraphe (paragraphe)}
                      <p><MotsExpliques texte={paragraphe} /></p>
                    {/each}
                  </div>
                {/if}
                {#each blocsDe('pourquoi') as bloc (bloc.cle)}
                  <p class="reponse-etape"><MotsExpliques texte={FICHES[d.type][bloc.cle]} /></p>
                {/each}
              </section>

              <!-- 5 · QUE FAIRE ? — l'action possible, après la compréhension.
                   La démarche qu'on peut engager tout de suite y trouve enfin sa
                   place : elle était perdue au milieu de l'explication. -->
              <section class="etape detail" class:replie={modeDe(d.type) === 'succinct'} aria-labelledby="et-faire-{d.type}">
                <h4 id="et-faire-{d.type}" class="titre-etape">Que faire&nbsp;?</h4>
                {#each blocsDe('faire') as bloc (bloc.cle)}
                  <p class="reponse-etape"><MotsExpliques texte={FICHES[d.type][bloc.cle]} /></p>
                {/each}
                {#if d.demarche}
                  <p class="quoi-emporter">{d.demarche.quoiEmporter}</p>
                  <a
                    class="demarche"
                    href={d.demarche.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {d.demarche.texte}
                    <span aria-hidden="true">→</span>
                  </a>
                {/if}
                {#if d.type === 'dpe'}
                  <!-- Les travaux d'abord : c'est la réponse la plus directe à
                       « que faire ? ». Les vérifications viennent ensuite —
                       elles portent sur le document, pas sur le logement. -->
                  <Travaux dpe={d} />
                  <AVerifier dpe={d} />
                {/if}
              </section>

              <!-- 6 · POUR ALLER PLUS LOIN — la profondeur technique reste
                   disponible, mais elle ne barre plus la route. -->
              <section class="etape aller-plus-loin detail" class:replie={modeDe(d.type) === 'succinct'} aria-labelledby="et-loin-{d.type}">
                <h4 id="et-loin-{d.type}" class="titre-etape">Pour aller plus loin</h4>
                <dl class="canevas">
                  {#each blocsDe('loin') as bloc (bloc.cle)}
                    <div>
                      <dt>{bloc.mot}</dt>
                      <dd><MotsExpliques texte={FICHES[d.type][bloc.cle]} /></dd>
                    </div>
                  {/each}
                </dl>
              </section>

              <!--
                UNE SEULE ACTION, ET ELLE EST LÀ OÙ ÇA S'OUVRE.

                C'étaient deux boutons de même largeur et de même graisse, en
                haut de la fiche : « L'essentiel » | « Tout le détail ». Un
                partage 50/50 qui présente deux choix égaux — alors qu'ils ne le
                sont pas. L'essentiel est l'état par défaut ; le détail est une
                profondeur qu'on demande. Une seule action, donc, et discrète.

                Et elle descend en bas de fiche : le contrôle vivait dans
                l'en-tête, loin des sections qu'il commande. On met l'interrupteur
                dans la pièce qu'il éclaire.
              -->
              <button
                type="button"
                class="plus-de-detail"
                aria-expanded={modeDe(d.type) === 'detaille'}
                onclick={() =>
                  choisirMode(d.type, modeDe(d.type) === 'detaille' ? 'succinct' : 'detaille')}
              >
                <span
                  >{modeDe(d.type) === 'detaille'
                    ? 'Masquer le détail'
                    : 'Tout le détail'}</span
                >
                <svg viewBox="0 0 24 24" aria-hidden="true" class="chevron">
                  <path
                    d="M6 9 L12 15 L18 9"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>

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

    <!-- L'univers du diagnostic commence ici, et pas plus haut : la barre au-
         dessus reste à la charte, c'est elle qui dit qu'on est toujours dans le
         même produit. -->
    <div
      class="dedans"
      class:sombre={estSombre(diags[courant]?.type ?? 'dpe')}
      style={styleUnivers(diags[courant]?.type ?? 'dpe')}
    >
      <!--
        LA QUESTION D'ABORD, l'accroche de marque ensuite.

        « Un écran = une question. » Le lecteur n'ouvre pas « le DPE » : il se
        demande si son logement consomme beaucoup. Poser sa question en tête
        change la lecture de tout ce qui suit — ce n'est plus une rubrique à
        parcourir, c'est une réponse.

        L'accroche de marque reste, en second et en petit : elle dit ce qu'on
        regarde, la question dit ce qu'on cherche.
      -->
      <header class="entree">
        <p class="lumiere">{lumiereSur(diags[courant]?.type ?? 'dpe')}</p>
        <!-- La grande question de l'écran. Elle finit par « ? » : sans espace
             insécable, le point d'interrogation part seul à la ligne dès que le
             titre passe sur deux lignes — ce qui est le cas sur mobile. -->
        <h2 class="question">
          {espacesFrancaises(questionDe(diags[courant]?.type ?? 'dpe'))}
        </h2>
      </header>

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
  /*
   * La barre reste à la charte, seule l'icône y met sa couleur.
   *
   * Elle a porté la teinte de l'application sur son filet : neuf barres de neuf
   * couleurs, et le produit changeait d'identité à chaque écran. La couleur
   * libre s'arrête à l'icône — c'est elle qui identifie l'application, la barre
   * dit qu'on est toujours dans le même produit.
   */
  .barre-app {
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--e2);
    padding: var(--e2) var(--e3);
    background: rgb(255 255 255 / 82%);
    backdrop-filter: blur(20px);
    border-bottom: 2px solid var(--petrole);
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
    color: var(--action-texte);
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

  /*
   * Le contenu défile seul, sous la barre — et c'est ici que l'univers commence.
   *
   * Les jetons `--u-*` arrivent en style inline, posés par `styleUnivers()`.
   * Cette règle les traduit dans le vocabulaire du design system : les
   * composants du dossier ne connaissent que `--papier`, `--sur-fond`,
   * `--trait`… et changent de monde sans qu'une ligne de leur CSS bouge. C'est
   * la même mécanique que l'inversion de l'écran de démarrage.
   *
   * Chaque repli est une valeur littérale de la charte, jamais `var(--x)` — un
   * jeton qui se redéfinit à partir de lui-même forme un cycle, et le navigateur
   * abandonne la déclaration en silence.
   *
   * CE QUI NE CHANGE PAS, quel que soit l'univers :
   *   `--action` et les trois couleurs d'état. Elles disent la gravité. Les
   *   teinter selon l'écran reviendrait à rendre une alerte moins visible ici
   *   que là — c'est la seule chose que ce chantier n'a pas le droit de faire.
   */
  .dedans {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: var(--e4) var(--e4) var(--e7);

    background: var(--u-fond, #0a2b23);
    color: var(--u-texte, #12463b);

    --fond: var(--u-fond, #0a2b23);
    --fond-clair: var(--u-surface, #ffffff);
    --papier: var(--u-surface, #ffffff);
    --papier-doux: color-mix(in srgb, var(--u-texte, #12463b) 4%, var(--u-surface, #ffffff));
    --sur-fond: var(--u-texte, #12463b);
    --sur-fond-doux: var(--u-texte-doux, #555555);
    --encre: var(--u-texte, #12463b);
    --encre-doux: var(--u-texte-doux, #555555);
    --gris: var(--u-texte-doux, #888888);
    --trait: var(--u-trait, #e8dcc8);
    --trait-fin: color-mix(in srgb, var(--u-trait, #f0eae0) 55%, transparent);
    --trait-or: var(--u-trait, #e8dcc8);
    --surface: color-mix(in srgb, var(--u-texte, #12463b) 4%, transparent);
    --surface-forte: color-mix(in srgb, var(--u-texte, #12463b) 7%, transparent);
    --surface-bord: color-mix(in srgb, var(--u-texte, #12463b) 14%, transparent);

    /* L'accent de l'univers prend la place de l’ancien accent dans les rôles
       décoratifs — filets, bords actifs, boutons. Pas dans les rôles de
       gravité. */
    --action-forte: var(--u-accent, #a3231a);
    --action-texte: var(--u-accent, #a33220);
    --sur-accent: var(--u-sur-accent, #ffffff);

    /* La couleur vive de l'écran : elle remplit, elle n'écrit pas. C'est elle
       qui rend au produit la vivacité que l'assombrissement systématique lui
       avait retirée. */
    --action: var(--u-accent-vif, #12463b);

    /*
     * Les noms historiques, qu'il fallait remapper aussi.
     *
     * L'ossature du produit vient du vert nuit et de l'or : `--or-clair`,
     * `--vert-700`, `--petrole` portent encore une bonne part des couleurs,
     * dans 35 fichiers. Ils étaient absents de ce bloc, et c'est ce qui
     * éteignait l'écran sombre — `--or-clair` vaut #12463b, exactement la
     * couleur relevée à 1,95:1 sous le verdict « 4 anomalies ».
     *
     * Les migrer un par un dans les composants aurait laissé passer ceux qu'on
     * n'aurait pas trouvés. Les rattacher ici les répare tous d'un coup, y
     * compris ceux qu'on écrira demain sans y penser.
     */
    --petrole: var(--u-texte, #12463b);
    --petrole-fonce: var(--u-texte, #0a2b23);
    --sable: var(--u-fond, #0a2b23);
    --sable-clair: var(--u-surface, #f5f1e8);
    --vert-900: var(--u-texte, #0a2b23);
    --vert-800: var(--u-texte, #12463b);
    --vert-700: var(--u-texte, #12463b);
    --vert-500: var(--u-texte, #12463b);
    --vert-300: var(--u-texte-doux, #7fa3ad);
    --or: var(--u-accent, #12463b);
    --or-fonce: var(--u-accent, #a33220);
    --or-clair: var(--u-texte, #12463b);

    /* Les deux fonds de pastille. Ils se composent sur la surface de l'univers
       plutôt que sur du blanc : sur l'écran sombre, une pastille reste sombre
       et garde son texte clair, au lieu de devenir un pavé blanc. */
    --vert-100: color-mix(in srgb, var(--u-texte, #12463b) 8%, var(--u-surface, #ffffff));
    --or-pale: color-mix(in srgb, var(--u-accent, #12463b) 14%, var(--u-surface, #ffffff));
  }

  /*
   * Un univers sombre rappelle les couleurs d'état claires.
   *
   * Alerte, attention et bon sont réglées pour du fond clair — l'alerte #a33220
   * ne tient que 2,1 sur le #0d1720 du tableau électrique, et une anomalie grave
   * s'y effacerait. Ce sont exactement les valeurs déjà écrites pour l'écran de
   * démarrage, réutilisées telles quelles : deux séries divergeraient tôt ou
   * tard, et c'est sur la gravité qu'elles divergeraient.
   */
  .dedans.sombre {
    --alerte: #ff9084;
    --alerte-fond: rgb(214 230 106 / 19%);
    --attention: #ffd54a;
    --attention-fond: rgb(255 213 74 / 14%);
    --ok: #cfe3ea;
    --ok-fond: rgb(207 227 234 / 10%);
    --action: #ff9084;
    /* Le vert profond qui signale ailleurs ne tient que 2,1 ici. */
    --alerte-vive: #ff9084;
  }

  .dedans .diagnostics {
    max-width: 900px;
    margin-inline: auto;
    margin-bottom: 0;
  }

  /*
   * L'accroche de la marque, à l'entrée de l'écran.
   *
   * En petites capitales et à l'accent de l'univers : elle annonce, elle ne
   * concurrence pas le verdict qui vient juste dessous. C'est un seuil, pas un
   * titre — le titre du diagnostic est déjà dans la barre.
   */
  /*
   * LA CLASSE DU DPE : le verdict, rendu visible.
   *
   * Elle se pose en haut a droite de l'en-tete, dans la couleur de l'arrete.
   * L'encre est sombre et non blanche : sur le jaune reglementaire d'un D,
   * du blanc ne se lit pas -- la couleur vient du texte, pas de nous, et il
   * faut s'y adapter.
   */
  .classe-dpe {
    position: absolute;
    top: 0;
    right: 0;
    width: 54px;
    height: 54px;
    display: grid;
    place-items: center;
    border-radius: 16px;
    font-family: var(--police-titre);
    font-size: 30px;
    font-weight: 700;
    color: #1c1c1c;
    box-shadow: 0 6px 16px -6px rgb(0 0 0 / 45%);
  }

  .fiche-diag header {
    position: relative;
    padding-right: 68px;
  }

  /* L'entree de l'ecran : l'accroche en surtitre, la question en titre. */
  .entree {
    max-width: 900px;
    margin: 0 auto var(--e5);
  }

  .lumiere {
    margin: 0 0 var(--e1);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--action-texte);
  }

  /*
   * LA QUESTION : c'est elle qui doit accrocher le regard en premier.
   *
   * Elle est en titre, dans la police de titre, a une taille qui la detache
   * nettement de l'accroche au-dessus. Le lecteur sait alors, avant meme de
   * lire la reponse, qu'il est au bon endroit.
   */
  .question {
    margin: 0;
    font-family: var(--police-titre);
    font-size: var(--t-lead);
    font-weight: 500;
    line-height: 1.25;
    color: var(--sur-fond);
    text-wrap: balance;
  }

  /* À l'impression, le dossier se lit d'un bloc : l'accroche d'un écran qu'on
     n'a pas ouvert n'y a pas sa place. */
  @media print {
    .lumiere {
      display: none;
    }
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
    box-shadow: 0 8px 18px -12px rgb(10 43 35 / 100%);
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
    --gravite: var(--alerte-vive);
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
  /* La validite, dans la ligne de provenance : meme famille, meme discretion.
     Perimee, elle reprend le rouge d'alerte -- c'est justement ce qu'il ne
     faut pas rater. */
  .validite {
    color: var(--sur-fond-doux);
  }

  .validite.perimee {
    color: var(--alerte);
    font-weight: 650;
  }

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
    /*
     * La gravité SIGNALE, elle ne teinte plus la carte.
     *
     * Un voile de la couleur d'état descendait sur 220 pixels : sur l'écran du
     * DPE, dont l'univers est vert, une alerte étalait un rosé sur toute la
     * fiche et deux couleurs se disputaient l'écran. L'ODM réserve la couleur
     * vive aux mini-apps et aux données qui ont un sens métier, et proscrit
     * l'arc-en-ciel décoratif.
     *
     * La gravité reste une donnée : elle garde son liseré, sa pastille et son
     * mot — trois porteurs, dont deux ne dépendent pas de la couleur. Ce qui
     * disparaît, c'est le décor.
     */
    background: var(--surface-forte);
    border: 1px solid var(--surface-forte);
    border-top-color: var(--surface-bord);
    border-left: 4px solid var(--gravite-fiche, var(--sur-fond-doux));
    border-radius: var(--rayon);
    box-shadow: 0 1px 0 var(--surface-forte) inset, 0 24px 48px -32px rgb(10 43 35 / 100%);
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
    --gravite-fiche: var(--alerte-vive);
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
    --gravite: var(--alerte-vive);
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
     commande, pas un paragraphe. L'actif prend le vert plein — la seule
     couleur d'action du produit. */
  /* Le geste iOS pour « en voir plus » : pleine largeur, encre d'accent,
     chevron qui pivote. Pas de fond plein — ce n'est pas l'action principale
     de l'écran, c'est celle qui approfondit. */
  .plus-de-detail {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    min-height: 44px;
    margin-top: var(--e4);
    padding: 0 var(--e4);
    background: transparent;
    border: none;
    border-top: 1px solid var(--trait);
    color: var(--action-forte);
    font-size: var(--t-petit);
    font-weight: 700;
    cursor: pointer;
  }

  .plus-de-detail:hover {
    color: var(--action-forte);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .plus-de-detail .chevron {
    width: 15px;
    height: 15px;
    flex: none;
    transition: transform var(--duree) var(--courbe);
  }

  .plus-de-detail[aria-expanded='true'] .chevron {
    transform: rotate(180deg);
  }

  @media (prefers-reduced-motion: reduce) {
    .plus-de-detail .chevron {
      transition: none;
    }
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
  /* Quatre mentions sur une ligne flexible — et qui PASSE À LA LIGNE.
     Sans `wrap`, les quatre se partageaient la largeur de force : sur un volet
     étroit, la première tombait à 62 px de large pour 246 px de haut, un mot
     par ligne. Une colonne de mots n'est pas une ligne de provenance. */
  .provenance {
    margin: var(--e2) 0 0;
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
    display: flex;
    flex-wrap: wrap;
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

  /*
   * LE SCHÉMA DOMINE. IL N'ACCOMPAGNE PAS.
   *
   * C'était deux colonnes côte à côte, et le partage disait le contraire de ce
   * qu'on voulait : 0.9fr pour le dessin, 1.1fr pour le texte. Le schéma était
   * la plus étroite des deux — une vignette posée à côté d'un article.
   *
   * L'ordre de mission est explicite : le schéma « n'est pas une illustration,
   * c'est une interface de compréhension ». Et l'ordre de perception le place
   * en 3, juste après la conclusion et le risque — donc AVANT le commentaire,
   * pas à sa gauche.
   *
   * Une seule colonne, donc. Le schéma prend toute la largeur, en scène ; le
   * texte descend dessous. C'est le geste des cartes iOS : le graphique en
   * grand d'abord, les lignes de détail ensuite.
   */
  .corps {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--e5);
    align-items: start;
  }

  /* La scène. Elle respire plus qu'une vignette : c'est elle qu'on regarde en
     premier, et le premier regard ne doit pas tomber sur un bord. */
  .dessin {
    background: var(--papier);
    border-radius: var(--rayon);
    padding: var(--e5) var(--e5);
    color: var(--encre);
    display: grid;
    gap: var(--e5);
  }

  @media (max-width: 560px) {
    .dessin {
      padding: var(--e4) var(--e3);
      gap: var(--e4);
      border-radius: var(--rayon-petit);
    }
  }

  /* Le texte ne s'étire pas à la largeur de la scène : une ligne de 120
     caractères ne se lit pas. Il garde sa mesure et s'aligne à gauche, sous le
     dessin. */
  .dit {
    max-width: var(--mesure);
  }

  .pratique {
    margin: 0 0 var(--e4);
    font-style: italic;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--or-clair);
  }

  /*
   * LE CHIFFRE QUI PARLE.
   *
   * « Ne pas simplement afficher 238 kWh/m²/an. » Le chiffre le plus parlant
   * du rapport prend la taille qui lui revient, son libelle passe dessous en
   * petit -- l'inverse d'un formulaire, ou l'etiquette precede toujours la
   * valeur et ou les deux ont le meme poids.
   */
  .chiffre-chef {
    display: grid;
    gap: 2px;
    margin: 0 0 var(--e4);
  }

  .valeur-chef {
    font-family: var(--police-titre);
    font-size: var(--t-titre);
    font-weight: 700;
    line-height: 1;
    color: var(--sur-fond);
    font-variant-numeric: tabular-nums;
  }

  .quoi-chef {
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  .precision-chef {
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
    max-width: var(--mesure);
  }

  /* Les autres chiffres : une ligne, en retrait. Ils restent lisibles et
     accessibles — on hierarchise, on n'ampute pas. */
  .chiffres-suite {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--e2) var(--e5);
  }

  .chiffres-suite li {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  .chiffres-suite b {
    font-weight: 700;
    color: var(--sur-fond);
    font-variant-numeric: tabular-nums;
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

  /*
   * Ce qui est propre à ce rapport-ci, distingué du fond commun.
   *
   * Un filet citron sur le bord gauche, et un fond très légèrement teinté : ces
   * paragraphes parlent du logement du lecteur, pas des diagnostics en général.
   * La différence doit se voir sans qu'on ait à la lire.
   */
  .propre-au-rapport {
    margin: var(--e4) 0;
    padding: var(--e3) var(--e4);
    background: var(--surface);
    border-left: 3px solid var(--action-forte);
    border-radius: 0 var(--rayon) var(--rayon) 0;
    display: grid;
    gap: var(--e3);
  }

  .propre-au-rapport p {
    margin: 0;
    font-size: var(--t-petit);
    line-height: 1.6;
    color: var(--sur-fond);
  }

  /* Ce qu'il faut avoir sous la main : juste au-dessus du bouton, en plus
     petit. On le lit en tendant la main vers le rapport. */
  .quoi-emporter {
    font-size: var(--t-micro) !important;
    color: var(--sur-fond-doux) !important;
  }

  /* La démarche : un bouton plein, à l'accent de l'univers. C'est la seule
     action de la fiche qui emmène ailleurs, et elle rend une étiquette à qui y
     a droit. */
  .demarche {
    justify-self: start;
    display: inline-flex;
    align-items: center;
    gap: var(--e2);
    min-height: 44px;
    padding: 0 var(--e4);
    background: var(--action-forte);
    color: var(--sur-accent, #fff);
    border-radius: var(--rayon-badge);
    font-size: var(--t-petit);
    font-weight: 700;
    text-decoration: none;
    transition: background var(--duree) var(--courbe), transform var(--duree) var(--courbe);
  }

  /* Le survol se lit par un fondu vers l'encre de l'écran, pas par une seconde
     couleur : dans un univers, l'accent et l'action-texte sont la même valeur,
     et le bouton ne réagissait plus. Le fondu marche dans les deux sens — il
     assombrit un accent posé sur fond clair, éclaircit celui de l'écran sombre —
     donc il préserve le contraste avec l'encre du bouton. */
  .demarche:hover {
    background: color-mix(in srgb, var(--action-forte) 82%, var(--sur-fond));
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    .demarche {
      transition: none;
    }

    .demarche:hover {
      transform: none;
    }
  }

  /*
   * Les six étapes : ce qui donne au lecteur sa position dans la fiche.
   *
   * Le titre est petit, espacé, en capitales douces : il structure sans se
   * disputer la place avec le contenu. C'est le rôle d'un intitulé de section —
   * on le lit une fois, puis on l'oublie et on lit ce qu'il annonce.
   *
   * Le filet supérieur remplace la marge : deux sections séparées par du vide
   * paraissent deux blocs sans lien, alors qu'elles forment une progression.
   */
  .etape + .etape {
    margin-top: var(--e5);
    padding-top: var(--e4);
    border-top: 1px solid var(--u-trait, var(--trait-fin));
  }

  .titre-etape {
    margin: 0 0 var(--e3);
    font-family: var(--police-titre);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--u-accent, var(--action-texte));
  }

  /* L'absence se dit, elle ne se cache pas -- mais elle ne crie pas non plus :
     c'est une information, pas une alerte. */
  .sans-donnee {
    color: var(--sur-fond-doux);
    font-style: italic;
  }

  .reponse-etape {
    margin: 0 0 var(--e2);
    font-size: var(--t-petit);
    line-height: 1.55;
    color: var(--u-texte, var(--sur-fond));
  }

  .reponse-etape:last-child {
    margin-bottom: 0;
  }

  /* Le fond commun, à la fin : disponible sans barrer la route. */
  .aller-plus-loin {
    opacity: 0.94;
  }

  /* Le canevas : les mêmes questions pour tous les diagnostics. */
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
