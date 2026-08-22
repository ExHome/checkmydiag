<script lang="ts" module>
  /* Identifiants SVG uniques : deux écrans termites sur la même page (une
     comparaison, une impression) partageraient sinon leurs `clipPath`. */
  let sequence = 0;
</script>

<script lang="ts">
  /**
   * L'ÉTAT PARASITAIRE — la planche, et ce qu'on n'a pas ouvert.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * CE QUE CET ÉCRAN AFFIRME, ET AVEC QUELLE DONNÉE
   * ═══════════════════════════════════════════════════════════════════════
   *
   *   le grand chiffre   `schema.zones.length` (verdict bon)
   *                      ou le nombre de zones `etat === 'alerte'` (infesté)
   *   les segments       une par entrée de `schema.zones`, dans l'ordre du
   *                      rapport — CE N'EST PAS UN PLAN, et l'écran le dit
   *   le verdict         `diagnostic.verdict`, mot pour mot
   *   l'arrêté           le fait « Arrêté préfectoral », mot pour mot
   *   la coupe           AUCUNE donnée : c'est la coupe du GESTE, identique
   *                      pour toutes les zones, parce que la donnée est
   *                      identique pour toutes les zones
   *
   * ── LE PLAN QU'ON NE DESSINE PAS ────────────────────────────────────────
   *
   * Le modèle ne porte AUCUNE géométrie de logement pour les termites :
   * `schema` de genre `pieces` donne des NOMS et un ÉTAT, rien d'autre.
   * Dessiner un plan d'appartement plausible serait inventer la forme du
   * logement de quelqu'un. On dessine donc une PLANCHE — une enfilade, pas une
   * carte — et la phrase « dans l'ordre du rapport, pas dans l'ordre de votre
   * logement » est affichée, pas sous-entendue.
   *
   * ── LES TROIS ÉTATS, ET POURQUOI ILS SONT SUR DEUX CANAUX ───────────────
   *
   * Mesuré au pixel (les quatre moments × les trois gravités) : la lumière
   * transmise sépare « passe » de « ne passe pas » de 1,07:1 la nuit à
   * 2,87:1 à midi. Le plafond de lampe est à 0,34 et il est démontré — donc
   * AUCUN réglage ne peut porter cette séparation à 3:1. Une information
   * portée par le seul niveau de lumière serait invisible dix-huit heures
   * sur vingt-quatre.
   *
   * D'où les deux canaux, et c'est la discipline ordinaire — jamais un seul
   * canal pour une information :
   *
   *   LA MATIÈRE (lumière transmise)   belle, vraie, JAMAIS seule à porter
   *   LE TRAIT   (encre ivoire, ≥ 4,89:1)   la convention d'architecte
   *
   *   ┌──────────────────┬───────────────────────┬──────────────────────────┐
   *   │ donnée           │ matière               │ trait                    │
   *   ├──────────────────┼───────────────────────┼──────────────────────────┤
   *   │ regardé, rien    │ la face S'OUVRE       │ trait plein              │
   *   │ indices relevés  │ la face reste pleine  │ trait doublé + point     │
   *   │ non ouvert       │ raies 1,5 sur 4       │ trait tireté             │
   *   └──────────────────┴───────────────────────┴──────────────────────────┘
   *
   * Plein / doublé / tireté : c'est la convention de dessin d'exécution — le
   * trait continu est ce qu'on voit, le tireté est ce qui est caché. Elle
   * survit au daltonisme, au noir et blanc, à l'impression et à la nuit.
   *
   * ── LE SILENCE SUR CE QUI EST GRAVE ─────────────────────────────────────
   *
   * Quand `gravite === 'alerte'`, ce n'est pas la scène qui s'assombrit :
   * c'est TOUT L'ÉCRAN. Le fond passe au sol de `retraitDe('alerte')` —
   * #061b15 — et l'encre bascule à l'ivoire au même instant. Le saut est
   * DISCRET, jamais une transition : une surface qui porte du texte ne
   * traverse pas la bande morte ] 0,1719 ; 0,2611 [. Mesuré de l'autre côté
   * du saut : ivoire 16,52 et encre douce 12,44 — on baisse la voix, on ne
   * baisse jamais la lisibilité.
   *
   * ── CE QUI N'EST PAS ANIMÉ, ET POURQUOI ─────────────────────────────────
   *
   * Rien ici ne transitionne une propriété qui lit un jeton mouvant (règle
   * d'`app.css` du 21/08). Le seul mouvement est une `opacity` sur des
   * groupes — la seule propriété qui ne lit rien, ne remet rien en page, et
   * ne peut pas se figer. Il n'y a ni `transform` animé, ni géométrie SVG
   * animée : le « zoom » est un CHANGEMENT DE DESSIN, pas un mouvement de
   * caméra. Deux dessins composés chacun à sa bonne échelle valent mieux
   * qu'un seul agrandi.
   */
  import type { Diagnostic, Fait, Gravite } from '../../lib/modele';
  import { syntheseTermites } from '../termites/synthese';
  import TableLumineuse from '../lumiere/TableLumineuse.svelte';
  import { LARGEUR_HACHURE, PAS_HACHURE } from '../lumiere/calque';

  interface Props {
    /** Le volet termites, tel que `analyserTermites()` le rend. Non transformé. */
    diagnostic: Diagnostic;
    /** Ouvrir le rapport à une page. `reperes[].page` quand il y en a. */
    onvoirLeRapport?: (page: number) => void;
    /** Heure décimale figée. Sans elle, la scène suit l'horloge de l'appareil. */
    heure?: number;
  }

  const { diagnostic, onvoirLeRapport, heure }: Props = $props();

  /*
   * LES SEPT BLOCS DU PACK D'AUDE (22/08/2026).
   *
   * La logique vit dans `composants/termites/synthese.ts` — ce module ne
   * dessine rien, il répond à « qu'est-ce que ce rapport permet d'afficher ? ».
   * L'écran n'en montre que le résultat.
   */
  const pack = $derived(syntheseTermites(diagnostic));

  /* Le statut se lit par un PICTOGRAMME et par un MOT, jamais par la couleur
     seule (§ 4 de l'ordre de mission). */
  const signeDuTon = (t: string): string => (t === 'alerte' ? '!' : t === 'attention' ? '?' : '✓');
  const motDuTon = (t: string): string =>
    t === 'alerte' ? 'Point d’alerte' : t === 'attention' ? 'À regarder' : 'Rien à signaler';

  const uid = `tm${++sequence}`;

  /* ── LES DONNÉES, SANS UNE TRANSFORMATION DE PLUS ────────────────────── */

  type Zone = { nom: string; etat: Gravite; detail?: string };

  const zones = $derived<Zone[]>(
    diagnostic.schema && diagnostic.schema.genre === 'pieces' ? diagnostic.schema.zones : []
  );
  const infestees = $derived(zones.filter((z) => z.etat === 'alerte'));
  const infeste = $derived(diagnostic.gravite === 'alerte');
  /* `neutre` est le seul cas où le moteur dit « je n'ai pas lu la conclusion ». */
  const conclusionLue = $derived(diagnostic.gravite !== 'neutre');
  const grave = $derived(diagnostic.gravite === 'alerte');

  /* Ces deux faits SONT le grand chiffre : les réafficher en liste serait le
     dire deux fois. Tous les autres passent. */
  const faits = $derived(
    diagnostic.faits.filter(
      (f) => f.libelle !== 'Zones contrôlées' && f.libelle !== 'Zones avec indices'
    )
  );
  const arrete = $derived<Fait | undefined>(
    diagnostic.faits.find((f) => f.libelle === 'Arrêté préfectoral')
  );
  const autres = $derived(faits.filter((f) => f !== arrete));
  const nbReperes = $derived(diagnostic.reperes?.length ?? 0);
  const premierRepere = $derived(diagnostic.reperes?.[0]?.page ?? diagnostic.pages[0]);

  /* Le grand chiffre change d'identité avec le verdict — et disparaît quand
     il n'y a rien à compter. Un « 0 » géant serait une note, pas un fait. */
  const chiffre = $derived(infeste ? infestees.length : conclusionLue ? zones.length : null);
  const legendeChiffre = $derived(
    infeste
      ? `zone${infestees.length > 1 ? 's' : ''} où le rapport relève des indices`
      : `zone${zones.length > 1 ? 's' : ''} que le rapport a regardées`
  );

  /* ── L'ÉTAT DE LECTURE ───────────────────────────────────────────────── */

  /** L'index de la zone ouverte, ou null quand on voit l'enfilade entière. */
  let ouverte = $state<number | null>(null);
  /** La face de la coupe a-t-elle été touchée ? Second geste, second niveau. */
  let faceOuverte = $state(false);

  const zoneOuverte = $derived(ouverte === null ? null : (zones[ouverte] ?? null));

  function ouvrir(i: number): void {
    ouverte = ouverte === i ? null : i;
    faceOuverte = false;
  }
  function refermer(): void {
    ouverte = null;
    faceOuverte = false;
  }

  /* ── LA GÉOMÉTRIE, en unités du plateau 0 0 100 62 ───────────────────── */

  const H = 62;
  /** Le sol : la terre est en dessous, la planche est posée dessus. */
  const SOL = 40;
  /** L'enfilade : x de 4 à 96, épaisseur 9, face 2,4 et cœur 6,6. */
  const X0 = 4;
  const X1 = 96;
  const HAUT = 31;
  const FACE = 33.4;
  /** Le joint de lumière entre deux zones. Une menuiserie a des joints. */
  const JOINT = 0.9;
  /** Un segment en alerte monte au-dessus de la ligne d'horizon. */
  const ALERTE_HAUT = 25;
  /** La ligne d'annotation, dans le plan d'encre, au-dessus de la planche. */
  const TRAIT_Y = 29.4;

  /** Les segments de l'enfilade. Un par zone nommée par le rapport. */
  const segments = $derived(
    (zones.length ? zones : [{ nom: '', etat: 'neutre' as Gravite }]).map((z, i) => {
      const pas = (X1 - X0) / Math.max(1, zones.length || 1);
      const x = X0 + i * pas;
      return {
        zone: z,
        i,
        x,
        largeur: Math.max(1.6, pas - JOINT),
        centre: x + (pas - JOINT) / 2,
        haut: z.etat === 'alerte' ? ALERTE_HAUT : HAUT
      };
    })
  );

  /* ── LA COUPE (niveau 2), à sa propre échelle ────────────────────────── */

  /*
   * La coupe est POSÉE BAS, comme l'enfilade : le haut du plateau appartient
   * au texte. Mesuré au banc, une pièce de bois centrée passait sous le bloc
   * du grand chiffre et perdait 43 % de sa lumière dans un voile.
   */
  const C_X0 = 8;
  const C_X1 = 92;
  const C_HAUT = 22;
  const C_FACE = 28;
  const C_SOL = 52;

  /**
   * LES RAIES DU CŒUR — la trame du produit, au pas exact de `calque.ts`.
   *
   * On dessine les BARRES OPAQUES (2,5 sur un pas de 4) et non les fentes :
   * le contrat du calque est « tout se dessine en `currentColor` », et une
   * fente peinte en blanc casserait la polarité sans erreur visible. Ce qui
   * laisse passer la lumière est ce qu'on ne peint pas.
   */
  function barres(cy: number, demiDiagonale: number): number[] {
    const n = Math.ceil(demiDiagonale / PAS_HACHURE) + 1;
    const out: number[] = [];
    for (let k = -n; k <= n; k++) out.push(cy + k * PAS_HACHURE);
    return out;
  }
  const LARGEUR_BARRE = PAS_HACHURE - LARGEUR_HACHURE; // 2,5 opaque sur 4 → 37,5 % passe
  const barresPlanche = barres((FACE + SOL) / 2, 47);
  const barresCoupe = barres((C_FACE + C_SOL) / 2, 46);

  /** Le fil du bois : des fentes, donc des sous-tracés en `evenodd`. */
  function fil(x0: number, x1: number, y0: number, y1: number, n: number, e: number): string {
    let d = `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
    for (let k = 1; k <= n; k++) {
      const y = y0 + ((y1 - y0) * k) / (n + 1);
      const c = y + (k % 2 === 0 ? e * 0.9 : -e * 0.9);
      d += `M${x0 + 1.5} ${y}Q${(x0 + x1) / 2} ${c} ${x1 - 1.5} ${y}v${e}Q${(x0 + x1) / 2} ${c + e} ${x0 + 1.5} ${y + e}Z`;
    }
    return d;
  }
  const filCoupe = fil(C_X0, C_X1, C_HAUT, C_FACE, 5, 0.5);

  /* `exactOptionalPropertyTypes` : une heure absente s'omet, elle ne se passe
     pas à `undefined` — sans quoi la table croirait qu'on lui fige l'horloge. */
  const heureFigee = $derived(heure === undefined ? {} : { heure });

  /**
   * LA CIBLE DE 44 px N'EST PAS NÉGOCIABLE, MÊME QUAND ELLE COÛTE UN GESTE.
   *
   * À 390 px, une unité de plateau vaut 3,90 px. Un segment n'atteint 44 px
   * qu'à partir de 11,28 unités — soit SEPT zones au plus :
   *
   *   7 zones →  92/7 − 0,9 = 12,24 unités = 47,7 px   ✓
   *   8 zones →  92/8 − 0,9 = 10,60 unités = 41,3 px   ✗
   *
   * Le corpus mesuré plafonne justement à sept (2, 3, 4, 5, 6×7, 7). Au-delà,
   * la scène cesse d'être touchable et la liste reste le seul manche. On
   * préfère perdre un raccourci que servir une cible trop petite.
   */
  const poigneesTouchables = $derived(zones.length > 0 && (segments[0]?.largeur ?? 0) * 3.9 >= 44);
</script>

<article
  class="ecran"
  class:grave
  aria-labelledby="{uid}-titre"
>
  <header class="tete">
    <h1 class="tete__titre" id="{uid}-titre">{diagnostic.titre}</h1>
    {#if diagnostic.date}
      <p class="tete__date">Repérage du {diagnostic.date}</p>
    {/if}
  </header>

  <!--
    LA SCÈNE. Pleine largeur : ce n'est pas une carte, c'est un lieu. La table
    ne reçoit pas d'`heure` — elle suit l'horloge de l'appareil, comme le reste
    du mécanisme, et c'est la seule chose de cet écran qui change toute seule.
  -->
  <div class="scene">
  <TableLumineuse
    hauteur={H}
    gravite={diagnostic.gravite}
    {...heureFigee}
    titre={zoneOuverte
      ? `Coupe d’une pièce de bois : la face, regardée par le diagnostiqueur, et le cœur, qui n’a pas été ouvert.`
      : `Le pied des ouvrages en bois du logement, ${zones.length} zone${zones.length > 1 ? 's' : ''} nommée${zones.length > 1 ? 's' : ''} par le rapport, dans l’ordre du rapport.`}
  >
    {#snippet calque()}
      <defs>
        <!-- L'union des cœurs des segments NON en alerte : plusieurs `rect`
             dans un `clipPath` s'additionnent. Les joints de lumière restent
             donc francs, et un segment en alerte n'a pas de raies du tout —
             chez lui, la lumière ne passe nulle part. -->
        <clipPath id="{uid}-coeur-planche">
          {#each segments as s (s.i)}
            {#if s.zone.etat !== 'alerte'}
              <rect x={s.x} y={FACE} width={s.largeur} height={SOL - FACE} />
            {/if}
          {/each}
        </clipPath>
        <clipPath id="{uid}-coeur-coupe">
          <rect x={C_X0} y={C_FACE} width={C_X1 - C_X0} height={C_SOL - C_FACE} />
        </clipPath>
      </defs>

      <!-- ── NIVEAU 1 · L'ENFILADE ──────────────────────────────────────── -->
      <g class="niveau" class:niveau--sorti={ouverte !== null}>
        <!-- LA TERRE. Ce n'est pas un état de la norme : c'est le sol d'où
             viennent les termites souterrains. Elle se distingue d'une
             occlusion par sa texture — bord ondulé, deux strates. -->
        <path
          d="M0 {SOL}q12 -1.1 25 0t25 0t25 0t25 0V{H}H0Z"
          fill="currentColor"
        />
        <path d="M8 {SOL + 3.6}h34M52 {SOL + 3.6}h26" class="strate" />
        <path d="M20 {SOL + 7.4}h30M62 {SOL + 7.4}h22" class="strate" />

        <!-- LE CŒUR : ce qui n'a pas été ouvert. En raies dès le premier
             regard — c'est le sujet de l'écran, pas une surprise qu'on
             réserve à celui qui pense à toucher. Une seule trame pour toute
             l'enfilade, découpée par l'union des segments. -->
        <g clip-path="url(#{uid}-coeur-planche)">
          <g transform="rotate(-38 50 {(FACE + SOL) / 2})">
            {#each barresPlanche as y (y)}
              <rect
                x="-16"
                y={y - LARGEUR_BARRE / 2}
                width="132"
                height={LARGEUR_BARRE}
                fill="currentColor"
              />
            {/each}
          </g>
        </g>

        {#each segments as s (s.i)}
          {#if s.zone.etat === 'alerte'}
            <!-- LA LUMIÈRE NE PASSE PAS. Le segment est plein, et il monte
                 au-dessus de la ligne d'horizon : la silhouette dit ce que la
                 couleur ne dira pas. -->
            <rect x={s.x} y={s.haut} width={s.largeur} height={SOL - s.haut} fill="currentColor" />
          {:else}
            <!-- LA FACE — ce que le diagnostiqueur a regardé. À ce niveau
                 elle reste fermée : le geste d'ouverture appartient à la
                 coupe, où l'on voit ce qu'il y a derrière. -->
            <path
              d={fil(s.x, s.x + s.largeur, HAUT, FACE, 3, 0.26)}
              fill="currentColor"
              fill-rule="evenodd"
            />
          {/if}
        {/each}
      </g>

      <!-- ── NIVEAU 2 · LA COUPE ────────────────────────────────────────── -->
      <g class="niveau" class:niveau--sorti={ouverte === null}>
        <path d="M0 {C_SOL}q12 -1.4 25 0t25 0t25 0t25 0V{H}H0Z" fill="currentColor" />
        <path d="M14 {C_SOL + 4}h32M56 {C_SOL + 4}h28" class="strate" />

        <g clip-path="url(#{uid}-coeur-coupe)">
          <g transform="rotate(-38 50 {(C_FACE + C_SOL) / 2})">
            {#each barresCoupe as y (y)}
              <rect
                x="-14"
                y={y - LARGEUR_BARRE / 2}
                width="128"
                height={LARGEUR_BARRE}
                fill="currentColor"
              />
            {/each}
          </g>
        </g>

        {#if zoneOuverte?.etat === 'alerte'}
          <rect
            x={C_X0}
            y={C_HAUT}
            width={C_X1 - C_X0}
            height={C_FACE - C_HAUT}
            fill="currentColor"
          />
        {:else}
          <path
            class="face"
            class:face--ouverte={faceOuverte}
            d={filCoupe}
            fill="currentColor"
            fill-rule="evenodd"
          />
        {/if}
      </g>
    {/snippet}

    {#snippet contenu()}
      <!--
        LE CADRE DU PLATEAU.
        `.table__contenu` s'étend sur toute la FIGURE — plateau ET bande de
        légende. Un `inset: 0` décalerait donc l'annotation de la hauteur de la
        légende. On se recale sur le plateau par son rapport, qui est le même
        que celui de la table : 100 / H.
      -->
      <div class="cadre" style:aspect-ratio="100 / {H}">
      <!--
        LE PLAN D'ENCRE. Il est PEINT, et c'est assumé : le calque ne se peint
        jamais, l'annotation si. Trois plans, comme l'exige la charte —
        lumière derrière, matière au milieu, information devant.
      -->
      <svg
        class="trait"
        viewBox="0 0 100 {H}"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {#if ouverte === null}
          {#each segments as s (s.i)}
            {#if s.zone.etat === 'alerte'}
              <line class="t t--double" x1={s.x} y1={TRAIT_Y} x2={s.x + s.largeur} y2={TRAIT_Y} />
              <line
                class="t t--double"
                x1={s.x}
                y1={TRAIT_Y - 1.6}
                x2={s.x + s.largeur}
                y2={TRAIT_Y - 1.6}
              />
              <line class="t" x1={s.centre} y1={TRAIT_Y - 1.6} x2={s.centre} y2={TRAIT_Y - 6.4} />
              <circle class="p" cx={s.centre} cy={TRAIT_Y - 7.3} r="0.95" />
            {:else if conclusionLue}
              <line class="t" x1={s.x} y1={TRAIT_Y} x2={s.x + s.largeur} y2={TRAIT_Y} />
            {:else}
              <line class="t t--tirete" x1={s.x} y1={TRAIT_Y} x2={s.x + s.largeur} y2={TRAIT_Y} />
            {/if}
          {/each}
        {:else}
          <!-- La face : trait plein si le rapport a conclu, doublé s'il relève
               des indices. Le tireté marque toujours l'entrée du cœur — la
               limite du regard, quelle que soit la conclusion. -->
          {#if zoneOuverte?.etat === 'alerte'}
            <line class="t t--double" x1={C_X0} y1={C_HAUT - 2.4} x2={C_X1} y2={C_HAUT - 2.4} />
            <line class="t t--double" x1={C_X0} y1={C_HAUT - 4} x2={C_X1} y2={C_HAUT - 4} />
            <circle class="p" cx="50" cy={C_HAUT - 6.4} r="0.95" />
          {:else}
            <line class="t" x1={C_X0} y1={C_HAUT - 2.6} x2={C_X1} y2={C_HAUT - 2.6} />
          {/if}
          <line class="t t--tirete" x1={C_X0} y1={C_FACE} x2={C_X1} y2={C_FACE} />
          <line class="t t--cote" x1="4.6" y1={C_HAUT} x2="4.6" y2={C_FACE} />
        {/if}
      </svg>

      {#if ouverte === null && poigneesTouchables}
        <!--
          LES POIGNÉES. Elles n'existent que pour le doigt : au clavier, la
          liste plus bas fait le même travail avec de vrais libellés. Les
          annoncer deux fois doublerait les arrêts de tabulation pour rien.
        -->
        <div class="poignees" aria-hidden="true">
          {#each segments as s (s.i)}
            <button
              type="button"
              class="poignee"
              tabindex="-1"
              aria-label={s.zone.nom}
              style:left="{s.x}%"
              style:width="{s.largeur}%"
              onclick={() => ouvrir(s.i)}
            ></button>
          {/each}
        </div>
      {/if}

      <div class="socle">
        {#if ouverte === null}
          {#if chiffre !== null && zones.length}
            <p class="chiffre">
              <span class="chiffre__n">{chiffre}</span>
              <span class="chiffre__l">{legendeChiffre}</span>
            </p>
          {:else}
            <!-- Pas de chiffre : c'est le verdict qui prend la place, en grand.
                 L'écran change de hiérarchie plutôt que d'afficher un zéro. -->
            <p class="verdict-grand">{diagnostic.verdict}</p>
          {/if}
        {:else}
          <p class="coupe-titre">{zoneOuverte?.nom}</p>
          <p class="coupe-l">
            {#if zoneOuverte?.etat === 'alerte'}
              La lumière ne passe pas : le rapport relève des indices ici.
            {:else if faceOuverte}
              La face est ouverte : le rapport l’a regardée et n’a rien relevé.
              Le cœur reste en raies.
            {:else}
              Touchez le bois : la matière s’ouvre.
            {/if}
          </p>
        {/if}
      </div>
      </div>
    {/snippet}
  </TableLumineuse>
  </div>

  <!-- Les commandes du second geste, hors de la scène pour garder 44 px. -->
  {#if ouverte !== null}
    <div class="gestes">
      {#if zoneOuverte?.etat !== 'alerte'}
        <button type="button" class="geste" onclick={() => (faceOuverte = !faceOuverte)}>
          {faceOuverte ? 'Refermer la face' : 'Ouvrir la face du bois'}
        </button>
      {/if}
      <button type="button" class="geste geste--pale" onclick={refermer}>
        Revenir à l’enfilade
      </button>
    </div>
  {/if}

  <!-- LA LÉGENDE DES TROIS ÉTATS. Elle est ici et pas dans un repli : c'est la
       clé de lecture de la scène, elle ne se mérite pas. -->
  <dl class="cle">
    <div>
      <dt><svg class="g" viewBox="0 0 24 8" aria-hidden="true"><line class="t" x1="1" y1="4" x2="23" y2="4" /></svg></dt>
      <dd>Trait plein — le rapport a regardé cette zone et n’a rien relevé.</dd>
    </div>
    <div>
      <dt><svg class="g" viewBox="0 0 24 8" aria-hidden="true"><line class="t t--double" x1="1" y1="6" x2="23" y2="6" /><line class="t t--double" x1="1" y1="3" x2="23" y2="3" /><circle class="p" cx="12" cy="1.2" r="1.1" /></svg></dt>
      <dd>Trait doublé — le rapport relève des indices dans cette zone.</dd>
    </div>
    <div>
      <dt><svg class="g" viewBox="0 0 24 8" aria-hidden="true"><line class="t t--tirete" x1="1" y1="4" x2="23" y2="4" /></svg></dt>
      <dd>
        Trait tireté, et raies dans la matière — le repérage se fait sans
        démontage : l’intérieur du bois n’a pas été ouvert.
      </dd>
    </div>
  </dl>

  <p class="avertissement">
    Ces zones sont dans l’ordre du rapport, pas dans l’ordre de votre logement :
    le rapport les nomme, il ne dit pas où elles sont.
  </p>

  <p class="verdict">{diagnostic.verdict}</p>

  {#if diagnostic.source === 'synthese'}
    <p class="origine">Écrit sur la page de synthèse du dossier.</p>
  {/if}

  {#if arrete}
    <section class="arrete">
      <h2>{arrete.libelle}</h2>
      <p class="arrete__v">{arrete.valeur}</p>
      {#if arrete.precision}<p class="arrete__p">{arrete.precision}</p>{/if}
    </section>
  {/if}

  {#if zones.length}
    <section class="liste">
      <h2>Les zones que le rapport nomme</h2>
      <ul>
        {#each zones as z, i (z.nom + i)}
          <li>
            <button
              type="button"
              class="zone"
              class:zone--ouverte={ouverte === i}
              aria-pressed={ouverte === i}
              onclick={() => ouvrir(i)}
            >
              <svg class="g" viewBox="0 0 24 8" aria-hidden="true">
                {#if z.etat === 'alerte'}
                  <line class="t t--double" x1="1" y1="6" x2="23" y2="6" />
                  <line class="t t--double" x1="1" y1="3" x2="23" y2="3" />
                  <circle class="p" cx="12" cy="1.2" r="1.1" />
                {:else}
                  <line class="t" x1="1" y1="4" x2="23" y2="4" />
                {/if}
              </svg>
              <span class="zone__nom">{z.nom}</span>
              <span class="zone__etat">
                {z.etat === 'alerte' ? 'indices relevés' : 'rien relevé'}
              </span>
            </button>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if autres.length}
    <section class="faits">
      <h2>Ce que le rapport écrit d’autre</h2>
      <dl>
        {#each autres as f (f.libelle)}
          <div>
            <dt>{f.libelle}</dt>
            <dd>
              {f.valeur}
              {#if f.precision}<span class="faits__p">{f.precision}</span>{/if}
            </dd>
          </div>
        {/each}
      </dl>
    </section>
  {/if}

  {#if diagnostic.analogie}
    <p class="analogie">{diagnostic.analogie}</p>
  {/if}

  <section class="texte">
    <h2>Ce que ça veut dire</h2>
    {#each diagnostic.explication as p, i (i)}<p>{p}</p>{/each}
  </section>

  {#if diagnostic.aFaire.length}
    <section class="texte">
      <h2>Ce que vous pouvez faire</h2>
      <ul class="afaire">
        {#each diagnostic.aFaire as a, i (i)}<li>{a}</li>{/each}
      </ul>
    </section>
  {/if}


  <!--
    ═══════════════════════════════════════════════════════════════════════
    LES SEPT BLOCS DE L'ORDRE DU 22/08/2026 — pack `VERRIERE_TERMITES`.
    ═══════════════════════════════════════════════════════════════════════

    Cet écran existait avant le pack, et sa planche reste : elle montre les
    zones contrôlées. Ce que le pack impose en plus, le voici — Points clés,
    Constatations diverses, Ce qui n'a pas été contrôlé, Complétude, Conseil.

    ⚠️ CE QUE LE VISUEL DU PACK MONTRE ET QUI N'EST PAS ICI, PARCE QUE FICTIF :
    le « 90 % » de confiance (§ E l'interdit nommément), le « NIVEAU DE RISQUE :
    TRÈS FAIBLE » (§ B : calculable ou rien), et les trois points clés
    décomposés — les rapports ne répondent pas indice par indice.

    Le visuel se contredit d'ailleurs : il annonce « inspection complète » en
    affichant quatre zones non contrôlées.

    ⚠️ Aucun statut n'est porté par la couleur seule (§ 4) : chaque ton porte un
    pictogramme ET un mot.
  -->

  {#if pack.pointsCles.length}
    <section class="pack" aria-labelledby="pk-cles">
      <h2 id="pk-cles">Points clés</h2>
      <ul class="pk-cles">
        {#each pack.pointsCles as p (p.titre)}
          <li class="pk-cle pk-{p.ton}">
            <span class="pk-pastille" aria-hidden="true">{signeDuTon(p.ton)}</span>
            <span class="pk-corps">
              <b>{p.titre}</b>
              <span class="pk-etiquette">{motDuTon(p.ton)}</span>
              <span class="pk-detail">{p.detail}</span>
            </span>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <section class="pack pk-resultat" aria-labelledby="pk-res">
    <h2 id="pk-res">Résultat global</h2>
    <p class="pk-phrase">{pack.resultat}</p>
    <p class="pk-portee">
      Cette conclusion porte sur les éléments que l’opérateur a examinés — pas au-delà.
    </p>
  </section>

  {#if pack.constatations.montrer}
    <section class="pack" aria-labelledby="pk-cd">
      <h2 id="pk-cd">Constatations diverses</h2>
      {#if pack.constatations.entrees.length}
        <ul class="pk-citations">
          {#each pack.constatations.entrees as c (c.terme)}
            <li>
              <p class="pk-citation">« {c.terme} »</p>
              {#if c.ou}<p class="pk-source">Localisation portée au rapport&nbsp;: {c.ou}</p>{/if}
            </li>
          {/each}
        </ul>
      {:else if pack.constatations.mention}
        <p class="pk-mention">{pack.constatations.mention}</p>
      {/if}
    </section>
  {/if}

  {#if pack.nonVisitees.montrer || pack.nonExamines.montrer}
    <section class="pack pk-limites" aria-labelledby="pk-nc">
      <h2 id="pk-nc">Ce qui n’a pas été contrôlé</h2>

      {#if pack.charpente}
        <p class="pk-avertissement">
          Les combles ou la charpente n’ont pas pu être contrôlés. C’est là que les termites se
          voient&nbsp;: la conclusion du rapport ne porte pas sur eux.
        </p>
      {/if}

      {#if pack.nonVisitees.entrees.length}
        <p class="pk-sous">Pièces non visitées</p>
        <ul class="pk-limites-liste">
          {#each pack.nonVisitees.entrees as l (l.quoi)}
            <li>
              <span class="pk-quoi">{l.quoi}</span>
              <span class="pk-statut">Non visitée</span>
              {#if l.pourquoi}<span class="pk-source">{l.pourquoi}</span>{/if}
            </li>
          {/each}
        </ul>
      {:else if pack.nonVisitees.mention}
        <p class="pk-mention">{pack.nonVisitees.mention}</p>
      {/if}

      {#if pack.nonExamines.entrees.length}
        <p class="pk-sous">Ouvrages non examinés dans les pièces visitées</p>
        <ul class="pk-limites-liste">
          {#each pack.nonExamines.entrees as l (l.quoi)}
            <li>
              {#if l.separe}
                <span class="pk-quoi">{l.quoi}</span>
                <span class="pk-statut">Non examiné</span>
                {#if l.pourquoi}<span class="pk-source">{l.pourquoi}</span>{/if}
              {:else}
                <span class="pk-quoi pk-citation">« {l.quoi} »</span>
                <span class="pk-statut">Non examiné</span>
                <span class="pk-source">
                  Texte du rapport, colonnes non séparées — voir la rubrique&nbsp;G.
                </span>
              {/if}
            </li>
          {/each}
        </ul>
      {:else if pack.nonExamines.mention}
        <p class="pk-mention">{pack.nonExamines.mention}</p>
      {/if}

      <p class="pk-portee">Sur ces zones, le rapport ne conclut rien — ni présence, ni absence.</p>
    </section>
  {/if}

  {#if pack.completude.length}
    <section class="pack" aria-labelledby="pk-comp">
      <h2 id="pk-comp">Complétude du contrôle</h2>
      {#each pack.completude as ligne (ligne)}<p class="pk-ligne">{ligne}</p>{/each}
    </section>
  {/if}

  {#if pack.conseil.length}
    <section class="pack pk-conseil" aria-labelledby="pk-cons">
      <h2 id="pk-cons">Conseil Verrière</h2>
      {#each pack.conseil as ligne (ligne)}<p>{ligne}</p>{/each}
    </section>
  {/if}

  {#if nbReperes && onvoirLeRapport}
    <button type="button" class="preuve" onclick={() => onvoirLeRapport(premierRepere)}>
      Voir les {nbReperes} passages dans le rapport
    </button>
  {/if}
</article>

<style>
  /*
   * LES SEPT BLOCS DU PACK — ivoire chaud, vert profond, sable en accent.
   *
   * « Fond : ivoire chaud, jamais blanc clinique. Accent : sable/laiton très
   * discret ; éviter l'effet doré luxueux. Densité : conserver de l'air. »
   */
  .pack {
    background: var(--verriere-ivoire);
    border: 1px solid var(--filet);
    border-radius: 16px;
    padding: 1.25rem;
    margin-block: 1rem;
  }
  .pack h2 {
    margin: 0 0 1rem;
    font-size: 0.8125rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .pk-cles {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 1rem;
  }
  .pk-cle {
    display: grid;
    grid-template-columns: 2rem 1fr;
    gap: 0.75rem;
    align-items: start;
  }
  /*
   * ⚠️ AUCUNE COULEUR D'ÉTAT ICI — ET J'EN AVAIS MIS TROIS FOIS.
   *
   * J'avais inventé un corail pour l'alerte et posé le sauge en fond de
   * pastille. Trois tests m'ont arrêté : « le corail ne revient pas, quelle que
   * soit son écriture », « le sauge n'est plus une couleur de structure », et
   * celui de cet écran — « ne peint aucun pigment de bois ».
   *
   * Puis j'ai repris les jetons de la charte (`--ok`, `--attention`,
   * `--alerte`) : le test de cet écran les refuse AUSSI, et sa raison est
   * meilleure que la mienne — « un état qui se lit à la couleur ne se lit plus
   * en noir et blanc, ni pour un daltonien ».
   *
   * La pastille est donc neutre. L'état se lit par son SIGNE et par son MOT,
   * les deux canaux que le § 4 de l'ordre exige — et cet écran va plus loin :
   * il n'en garde aucun troisième.
   */
  .pk-pastille {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 1px solid var(--filet);
    font-weight: 700;
  }
  .pk-alerte .pk-pastille {
    border-width: 3px;
  }
  .pk-attention .pk-pastille {
    border-style: dashed;
  }
  .pk-corps {
    display: grid;
    gap: 0.15rem;
  }
  .pk-etiquette {
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--encre-doux, #4a5a52);
  }
  .pk-detail,
  .pk-ligne {
    font-size: 0.9375rem;
    line-height: 1.5;
  }
  .pk-resultat {
    background: var(--vert-800);
    color: #fff;
    border-color: transparent;
  }
  .pk-phrase {
    margin: 0;
    font-size: clamp(1.125rem, 4.5vw, 1.5rem);
    line-height: 1.35;
    text-wrap: pretty;
  }
  .pk-citations {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 1rem;
  }
  .pk-citations > li {
    border-left: 3px solid var(--filet);
    padding-left: 1rem;
  }
  .pk-citation {
    margin: 0;
    line-height: 1.55;
    text-wrap: pretty;
  }
  .pk-source,
  .pk-mention,
  .pk-portee {
    font-size: 0.875rem;
    line-height: 1.5;
    opacity: 0.8;
    margin: 0.35rem 0 0;
  }
  .pk-limites {
    border-width: 2px;
  }
  .pk-avertissement {
    margin: 0 0 1rem;
    font-weight: 600;
    line-height: 1.5;
  }
  .pk-sous {
    margin: 1rem 0 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
  }
  .pk-limites-liste {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 1rem;
  }
  .pk-limites-liste > li {
    display: grid;
    gap: 0.15rem;
  }
  .pk-quoi {
    font-weight: 600;
    line-height: 1.45;
  }
  /* Le statut est un MOT, pas une couleur. */
  .pk-statut {
    justify-self: start;
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    border: 1px solid var(--filet);
  }
  .pk-conseil p {
    margin: 0 0 0.6rem;
    line-height: 1.6;
    text-wrap: pretty;
  }

  /*
   * ── LA PAGE ────────────────────────────────────────────────────────────
   *
   * Ivoire par défaut : la publicité de marque est à 58 % de lumière et 21 %
   * de vert. Une application entièrement sombre n'est pas Verrière.
   */
  .ecran {
    --ecran-fond: var(--fond, #f7f6f2);
    --ecran-encre: #0a2b23;
    --ecran-douce: #4a5a55;
    --ecran-filet: rgb(10 43 35 / 12%);
    --ecran-surface: rgb(10 43 35 / 4%);

    display: block;
    padding: var(--e5) var(--e4) var(--e8);
    background: var(--ecran-fond);
    color: var(--ecran-encre);
    font-family: var(--police);
  }

  /*
   * LA LUMIÈRE SE RETIRE DE TOUT L'ÉCRAN.
   *
   * Un saut, jamais un fondu : entre les deux fonds il y a la bande morte
   * ] 0,1719 ; 0,2611 [ où aucune encre de la marque ne tient 4,5. On saute
   * par-dessus, et l'encre change au même instant.
   *
   *   fond #061b15 — L = 0,008767, sous la bande morte
   *   ivoire #f7f6f2  →  16,52     douce rgb(247 246 242 / 78%)  →  10,33
   */
  .ecran.grave {
    --ecran-fond: #061b15;
    --ecran-encre: #f7f6f2;
    --ecran-douce: rgb(247 246 242 / 78%);
    --ecran-filet: rgb(247 246 242 / 20%);
    --ecran-surface: rgb(247 246 242 / 6%);
  }

  .tete {
    margin: 0 0 var(--e4);
  }
  .tete__titre {
    margin: 0;
    font-size: var(--t-section);
    font-weight: 600;
    letter-spacing: var(--suivi-serre);
  }
  .tete__date {
    margin: var(--e1) 0 0;
    font-size: var(--t-petit);
    color: var(--ecran-douce);
  }

  /* ── LE CALQUE ────────────────────────────────────────────────────────── */

  /*
   * Le seul mouvement de l'écran : une opacité sur un groupe. Elle ne lit
   * aucun jeton, ne remet rien en page, et ne peut donc pas se figer sur sa
   * valeur de premier rendu. Aucune géométrie, aucun `transform` n'est animé.
   */
  .niveau {
    opacity: 1;
    transition: opacity var(--t-revelation) var(--verre);
  }
  .niveau--sorti {
    opacity: 0;
  }

  /* Les strates de la terre : des fentes, pas des traits peints. Elles
     n'existent que par le vide qu'elles laissent dans la matière. */
  .strate {
    fill: none;
    stroke: #000;
    stroke-width: 0.34;
    stroke-linecap: round;
    /* Dans le masque, `mix-blend-mode: destination-out` n'existe pas : on
       compte sur le fait que le tracé n'est pas peint en noir plein mais
       reste sous le seuil — la strate est un affaiblissement, pas une fente. */
    opacity: 0.55;
  }

  /*
   * LA FACE QUI S'OUVRE — le geste signature.
   *
   * Elle ne « disparaît » pas : elle cesse d'arrêter la lumière. Ce qui
   * apparaît derrière n'est pas un dessin caché, c'est la lampe. La coupe ne
   * révèle donc jamais des galeries qu'on n'a pas mesurées — elle révèle
   * jusqu'où le regard du diagnostiqueur est allé, et où il s'est arrêté.
   */
  .face {
    opacity: 1;
    transition: opacity var(--t-revelation) var(--verre);
  }
  .face--ouverte {
    opacity: 0;
  }

  /* ── LE PLAN D'ENCRE ──────────────────────────────────────────────────── */

  /*
   * LA SCÈNE EST À FOND PERDU. Ce n'est pas une carte posée dans une page,
   * c'est un lieu — et une marge blanche autour d'un lieu en fait une
   * vignette. Elle a une seconde conséquence, celle-là mesurable : à fond
   * perdu, une unité de plateau vaut exactement 3,90 px sur 390, ce qui est
   * l'hypothèse du calcul de `poigneesTouchables`. Sous les 16 px de marge de
   * l'article, elle n'en valait que 3,58 et une poignée de sept zones tombait
   * à 43,8 px — sous le plancher, mesuré au banc.
   */
  .scene {
    margin-inline: calc(var(--e4) * -1);
  }

  /*
   * LE CADRE — le seul rectangle qui coïncide exactement avec le plateau.
   *
   * `.table__contenu` couvre toute la FIGURE, légende comprise ; s'y caler
   * décalerait l'annotation de la hauteur de la bande de légende, et le trait
   * d'architecte tomberait à côté de la planche. On se recale par le rapport.
   */
  .cadre {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .trait {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  /*
   * L'ENCRE DU TRAIT. Ivoire plein, jamais modulé par l'heure ni par la
   * gravité — c'est lui qui porte l'information quand la lumière est trop
   * faible pour la porter. Mesuré au pire fond qu'il croise (la face en
   * pleine lampe de midi, #5c7068) : 4,89:1, au-dessus du 3:1 exigé d'un
   * élément graphique, et au-dessus du 4,5:1 d'un texte.
   */
  .t {
    fill: none;
    stroke: var(--verriere-ivoire);
    stroke-width: 0.5;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }
  .t--double {
    stroke-width: 0.38;
  }
  /* La convention de dessin d'exécution : le tireté est ce qui est caché. */
  .t--tirete {
    stroke-dasharray: 2.2 1.6;
  }
  .t--cote {
    stroke-width: 0.34;
    stroke-dasharray: 0.9 0.9;
  }
  .p {
    fill: var(--verriere-ivoire);
  }

  /* Le glyphe de la liste : le même trait, à 24 × 8, pour que la clé de
     lecture soit littéralement le même objet que la scène. */
  .g {
    width: 24px;
    height: 8px;
    flex: none;
    overflow: visible;
  }
  .g .t {
    stroke: var(--ecran-encre);
    stroke-width: 1.4;
  }
  .g .t--double {
    stroke-width: 1.1;
  }
  .g .t--tirete {
    stroke-dasharray: 4 3;
  }
  .g .p {
    fill: var(--ecran-encre);
  }

  /* ── LES POIGNÉES ─────────────────────────────────────────────────────── */

  .poignees {
    position: absolute;
    inset: 0;
  }
  /*
   * 44 px de haut minimum, garantis : la planche ne fait que 35 px, la
   * poignée déborde donc au-dessus et au-dessous d'elle. Invisible au repos,
   * elle n'a pas à l'être sous le doigt.
   */
  .poignee {
    position: absolute;
    top: 34%;
    height: 46%;
    min-height: 44px;
    padding: 0;
    border: 0;
    border-radius: var(--rayon-petit);
    background: transparent;
    cursor: pointer;
  }
  .poignee:active {
    background: rgb(247 246 242 / 10%);
  }

  /* ── LE SOCLE DE LA SCÈNE ─────────────────────────────────────────────── */

  /*
   * LE SOCLE EST EN HAUT — et c'est une décision de lumière, pas de goût.
   *
   * À l'heure dorée, `TableLumineuse` place la source à (66,6 ; 51,3) : elle
   * entre par le bas et par la droite, au ras du sol. Le haut du plateau est
   * donc la zone la plus sombre de la scène, et c'est là que le grand chiffre
   * a le plus de calme. C'est aussi ce qui libère le bas pour la matière : au
   * banc, un bloc de texte posé en bas mangeait 43 % de la lumière de la
   * planche par son propre voile.
   *
   * LE VOILE, et sa borne. Fait du sol lui-même, donc il suit le retrait de
   * gravité au lieu d'être un noir ajouté par-dessus.
   *
   *   55 % de voile → mesuré sur les douze scènes (3 gravités × 4 moments),
   *   pire cas bon × midi : ivoire peint 8,37 · seuil 4,5.
   *   Sans aucun voile, au point le plus clair que la lampe puisse produire
   *   (#5c7068, plafond 0,34), le même ivoire tiendrait encore 4,89. Le voile
   *   n'est pas un rattrapage : c'est une marge de 3,9 points.
   */
  .socle {
    position: absolute;
    top: 0;
    left: 0;
    max-width: 72%;
    padding: var(--e5) var(--e5) var(--e7);
    background: linear-gradient(
      to bottom,
      color-mix(in srgb, var(--tl-sol, #0a2b23) 55%, transparent) 0%,
      transparent 100%
    );
  }
  .chiffre {
    margin: 0;
    display: flex;
    align-items: baseline;
    gap: var(--e3);
  }
  .chiffre__n {
    font-size: clamp(3.4rem, 18vw, 5rem);
    line-height: 0.86;
    font-weight: 600;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
    color: var(--verriere-ivoire);
  }
  .chiffre__l {
    max-width: 9.5em;
    font-size: var(--t-petit);
    line-height: 1.35;
    color: rgb(250 249 248 / calc(var(--tl-encre-douce, 0.72) * 100%));
  }
  .verdict-grand {
    margin: 0;
    max-width: 18em;
    font-size: var(--t-titre);
    line-height: 1.3;
    font-weight: 500;
    color: var(--verriere-ivoire);
  }
  .coupe-titre {
    margin: 0;
    font-size: var(--t-titre);
    font-weight: 600;
    color: var(--verriere-ivoire);
  }
  .coupe-l {
    margin: var(--e1) 0 0;
    max-width: 22em;
    font-size: var(--t-petit);
    line-height: 1.45;
    color: rgb(250 249 248 / calc(var(--tl-encre-douce, 0.72) * 100%));
  }

  /* ── LE RESTE DE LA PAGE ──────────────────────────────────────────────── */

  .gestes {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e2);
    margin: var(--e4) 0 0;
  }
  .geste {
    min-height: 44px;
    padding: var(--e2) var(--e4);
    border: 1px solid var(--ecran-filet);
    border-radius: var(--rayon);
    background: var(--ecran-surface);
    color: var(--ecran-encre);
    font: inherit;
    font-size: var(--t-petit);
    cursor: pointer;
  }
  .geste--pale {
    background: transparent;
    color: var(--ecran-douce);
  }

  .cle {
    margin: var(--e5) 0 0;
    padding: 0;
    display: grid;
    gap: var(--e3);
  }
  .cle > div {
    display: grid;
    grid-template-columns: 24px 1fr;
    align-items: start;
    gap: var(--e3);
  }
  .cle dt {
    margin: 0;
    padding-top: 0.45em;
  }
  .cle dd {
    margin: 0;
    font-size: var(--t-petit);
    line-height: 1.45;
    color: var(--ecran-douce);
  }

  .avertissement {
    margin: var(--e4) 0 0;
    padding-left: var(--e3);
    border-left: 2px solid var(--ecran-filet);
    font-size: var(--t-petit);
    line-height: 1.45;
    color: var(--ecran-douce);
  }

  .verdict {
    margin: var(--e6) 0 0;
    max-width: var(--mesure);
    font-size: var(--t-lead);
    line-height: 1.45;
  }
  .origine {
    margin: var(--e2) 0 0;
    font-size: var(--t-micro);
    color: var(--ecran-douce);
  }

  .arrete {
    margin: var(--e5) 0 0;
    padding: var(--e4) 0 0;
    border-top: 1px solid var(--ecran-filet);
  }
  .arrete h2 {
    margin: 0;
    font-size: var(--t-micro);
    font-weight: 600;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--ecran-douce);
  }
  .arrete__v {
    margin: var(--e2) 0 0;
    font-size: var(--t-titre);
    line-height: 1.25;
  }
  .arrete__p {
    margin: var(--e1) 0 0;
    font-size: var(--t-petit);
    color: var(--ecran-douce);
  }

  .liste,
  .faits,
  .texte {
    margin: var(--e6) 0 0;
  }
  .liste h2,
  .faits h2,
  .texte h2 {
    margin: 0 0 var(--e3);
    font-size: var(--t-micro);
    font-weight: 600;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--ecran-douce);
  }
  .liste ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .zone {
    display: flex;
    align-items: center;
    gap: var(--e3);
    width: 100%;
    min-height: 44px;
    padding: var(--e3) var(--e2);
    border: 0;
    border-bottom: 1px solid var(--ecran-filet);
    border-radius: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .zone--ouverte {
    background: var(--ecran-surface);
  }
  .zone__nom {
    flex: 1;
  }
  .zone__etat {
    font-size: var(--t-micro);
    color: var(--ecran-douce);
  }

  .faits dl {
    margin: 0;
    display: grid;
    gap: var(--e4);
  }
  .faits dt {
    font-size: var(--t-micro);
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--ecran-douce);
  }
  .faits dd {
    margin: var(--e1) 0 0;
    font-size: var(--t-base);
  }
  .faits__p {
    display: block;
    margin-top: var(--e1);
    font-size: var(--t-petit);
    color: var(--ecran-douce);
  }

  .analogie {
    margin: var(--e6) 0 0;
    max-width: var(--mesure);
    font-size: var(--t-lead);
    line-height: 1.5;
    font-style: italic;
  }
  .texte p {
    margin: 0 0 var(--e4);
    max-width: var(--mesure);
    line-height: 1.6;
  }
  .afaire {
    margin: 0;
    padding-left: var(--e4);
    max-width: var(--mesure);
    line-height: 1.6;
  }
  .afaire li {
    margin-bottom: var(--e3);
  }

  .preuve {
    display: block;
    margin: var(--e6) 0 0;
    min-height: 44px;
    padding: var(--e3) var(--e5);
    border: 1px solid var(--ecran-filet);
    border-radius: var(--rayon);
    background: transparent;
    color: var(--ecran-encre);
    font: inherit;
    cursor: pointer;
  }

  :where(.geste, .zone, .preuve, .poignee):focus-visible {
    outline: 2px solid var(--ecran-encre);
    outline-offset: 2px;
  }

  /*
   * MODE SOBRE ET MOUVEMENT RÉDUIT.
   *
   * On ne coupe pas la révélation : un basculement instantané entre deux
   * dessins est un clignotement, et un clignotement est plus agressif que le
   * fondu qu'on retirait. On garde une opacité courte et linéaire — c'est
   * déjà ce que fait `--t-revelation` sous `prefers-reduced-motion`.
   */
  :global(html[data-rendu='sobre']) .niveau,
  :global(html[data-rendu='sobre']) .face {
    transition-duration: var(--t-revelation);
  }

  @media print {
    .ecran,
    .ecran.grave {
      --ecran-fond: #fff;
      --ecran-encre: #0a2b23;
      --ecran-douce: #4a5a55;
      --ecran-filet: #999;
    }
    .poignees,
    .gestes,
    .preuve {
      display: none;
    }
    .t,
    .p {
      stroke: #0a2b23;
      fill: none;
    }
    .p {
      fill: #0a2b23;
    }
  }
</style>
