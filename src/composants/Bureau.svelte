<script lang="ts">
  /**
   * L'écran d'accueil du dossier.
   *
   * Une fois le rapport lu, on n'arrive plus sur un document : on arrive sur un
   * tableau de bord. Un cartouche dit l'essentiel — quel bien, combien de points
   * à régler —, puis chaque diagnostic devient une tuile qu'on ouvre d'un doigt.
   *
   * La forme est celle d'un écran de téléphone, et c'est voulu : personne
   * n'apprend à s'en servir. Le fond, lui, ne bouge pas d'un pouce — ce sont les
   * conclusions du rapport déposé, pas un exemple. Une tuile qui n'existe pas
   * dans le dossier ne s'affiche pas ; un chiffre que le rapport ne donne pas ne
   * s'invente pas.
   */
  import type { Analyse, Diagnostic, TypeDiag } from '../lib/modele';
  import { libelleCourt } from '../lib/libelle';
  import { compterLeDossier, origineDe, type Origine } from '../lib/bureau';
  import { APPS } from '../lib/apps';
  import Dicodiag from './Dicodiag.svelte';
  import Propagation from './Propagation.svelte';
  import { aLOuverture, auToucher } from '../lib/toucher';

  interface Props {
    analyse: Analyse;
    /**
     * Ouvre le diagnostic. Le carré transmis est celui de l'icône : l'écran
     * s'ouvre depuis elle, comme une application depuis son icône.
     */
    surOuvrirDiagnostic?: (type: TypeDiag, origine?: Origine | null) => void;
    /** Va à l'une des trois parties du dossier. */
    surVue?: (cle: string) => void;
  }

  const { analyse, surOuvrirDiagnostic, surVue }: Props = $props();

  /**
   * Le nom de la tuile, et son dessin.
   *
   * Les intitulés officiels ne tiennent pas sous une icône : « état de
   * l'installation intérieure d'électricité » devient « Électricité ». C'est un
   * repère de navigation, pas un titre de rapport — le vrai nom reste écrit en
   * toutes lettres sur la fiche qui s'ouvre.
   *
   * Les dégradés viennent de la charte. Les émoji, eux, disent la matière qu'on
   * cherche : le plomb est dans les peintures, les termites dans le bois. Un
   * symbole faux ferait plus de mal qu'un symbole absent.
   */
  const TUILES = APPS;

  /**
   * Les trois compteurs.
   *
   * Ils comptent les tuiles, et rien d'autre : le lecteur peut les vérifier à
   * l'œil en regardant la grille juste dessous. Un compteur qu'on ne peut pas
   * recompter est un compteur qu'il faut croire sur parole.
   *
   * « Pour information » plutôt qu'« OK » : un rapport qui n'a rien relevé
   * n'établit pas une absence, il dit ce qu'il a cherché. La nuance a coûté
   * assez cher pour ne pas la reperdre dans un libellé de neuf pixels.
   */
  const compte = $derived(compterLeDossier(analyse.diagnostics));

  /** Le titre du cartouche : ce qu'est le bien, dit comme une annonce. */
  const titre = $derived.by(() => {
    const nature = analyse.bien.typeBien ?? 'Votre dossier';
    const surface =
      analyse.bien.surface !== undefined ? `${analyse.bien.surface.toLocaleString('fr-FR')} m²` : null;
    return surface ? `${nature} · ${surface}` : nature;
  });

  /*
   * L'adresse et la commune ne sont plus assemblées en une seule ligne.
   *
   * Le widget les sépare : l'adresse en titre, la commune dessous et en badge.
   * C'est la composition du visuel de référence, et elle vaut mieux qu'une
   * ligne unique — l'adresse est ce que le lecteur reconnaît d'abord.
   */

  /** La lettre du DPE, telle que l'étiquette du rapport la donne. */
  const lettre = $derived.by(() => {
    const d = analyse.diagnostics.find((x) => x.type === 'dpe');
    return d?.schema?.genre === 'dpe' ? d.schema.finale : null;
  });

  /** Les couleurs de l'arrêté. Elles ne se réinventent pas. */
  const TEINTE_DPE: Record<string, string> = {
    A: '#319834',
    B: '#33cc31',
    C: '#cbfc34',
    D: '#fbfe06',
    E: '#fbcc05',
    F: '#fc9935',
    G: '#fc0205'
  };

  /*
   * La phrase de synthèse a quitté l'accueil.
   *
   * Elle disait ce que le dossier établit — « deux diagnostics demandent une
   * action avant la signature ». Mais l'ODM directeur interdit tout bloc entre
   * le widget du bien et les mini-apps, et une phrase de synthèse en est un.
   *
   * Elle n'est pas perdue : elle ouvre l'analyse, où elle a toute la place de
   * s'expliquer. `phraseDuDossier` reste dans `lib/bureau.ts` avec ses tests.
   */

  /**
   * Le geste d'ouverture.
   *
   * On mesure l'icône au moment du clic, jamais avant : entre le premier rendu
   * et le clic, la page a pu défiler, et l'écran partirait alors d'un endroit
   * où l'icône n'est plus.
   */
  function ouvrir(evenement: MouseEvent, type: TypeDiag): void {
    const bouton = evenement.currentTarget as HTMLElement;
    const carre = origineDe(bouton.querySelector('.icone'));

    /* La secousse part avec le geste, avant tout calcul : c'est la réponse au
       doigt, elle n'a pas à attendre que l'écran soit prêt. */
    aLOuverture();

    /*
     * La couleur part d'abord, l'écran suit.
     *
     * Sans carré mesurable — un clavier, un lecteur d'écran, une icône hors
     * champ — on ouvre directement : une propagation sans point de départ
     * n'aurait rien à relier.
     */
    if (!carre) {
      surOuvrirDiagnostic?.(type, null);
      return;
    }

    propagation = { carre, couleur: APPS[type].degrade, type };
  }

  /** La couleur en train d'envahir l'écran, le temps d'un geste. */
  let propagation = $state<{
    carre: Origine;
    couleur: string;
    type: TypeDiag;
  } | null>(null);

  /**
   * Les neuf applications, présentes ou non.
   *
   * On n'affichait que les diagnostics lus : le dossier paraissait complet quel
   * qu'il soit, puisqu'on ne montrait jamais ce qui n'y était pas. Les neuf
   * tuiles sont là désormais, et celles qui manquent sont éteintes — comme une
   * application qu'un téléphone n'a pas encore chargée.
   *
   * Trois états, et la nuance compte : présent, absent, ou absent alors qu'il
   * est obligatoire. Le troisième est un point bloquant à la vente, pas une
   * case vide — le moteur le détecte déjà (logement d'avant 1997 sans repérage
   * amiante, d'avant 1949 sans constat plomb), on ne fait que le montrer où le
   * lecteur regarde.
   */
  const tuiles = $derived.by(() => {
    const presents = new Set(analyse.diagnostics.map((d) => d.type));
    const manques = new Map(
      analyse.controles.filter((c) => c.genre === 'manque' && c.type).map((c) => [c.type!, c])
    );

    const absents = (Object.keys(APPS) as TypeDiag[])
      .filter((t) => !presents.has(t))
      .map((type) => ({
        type,
        diagnostic: null,
        manque: manques.get(type) ?? null
      }));

    return [
      ...analyse.diagnostics.map((d) => ({ type: d.type, diagnostic: d, manque: null })),
      ...absents
    ];
  });

  /** La pastille d'état posée sur la tuile : une forme, puis une couleur. */
  function pastille(d: Diagnostic): { signe: string; classe: string } | null {
    if (d.gravite === 'alerte') return { signe: '▲', classe: 'alerte' };
    if (d.gravite === 'attention') return { signe: '●', classe: 'attention' };
    if (d.gravite === 'bon') return { signe: '✓', classe: 'bon' };
    return null;
  }

  /**
   * Les deux outils : ils ne lisent pas votre rapport, ils vous aident à le
   * lire. Ils ont leur propre rangée — un lexique n'est pas un diagnostic, et
   * les mêler ferait croire à onze rapports au lieu de neuf.
   */
  const OUTILS = [
    {
      cle: 'dicodiag',
      nom: 'Dicodiag',
      picto: 'dicodiag',
      dit: 'Le lexique',
      /* Les outils ne sont pas des diagnostics : leur dégradé reste dans le
         vert du socle, quand les huit apps portent une couleur de métier. */
      degrade: 'linear-gradient(145deg, #6f9a86, #2c5f4c)'
    },
    {
      cle: 'en-clair',
      nom: 'En clair',
      picto: 'en-clair',
      dit: 'Les réponses',
      degrade: 'linear-gradient(145deg, #86a45f, #4a6b30)'
    }
  ];

  /** Dicodiag s'ouvre par-dessus ; « En clair » est un vrai lien de site. */
  let dicodiagOuvert = $state(false);

  /**
   * LA BARRE DE NAVIGATION, à cinq entrées comme le visuel de référence.
   *
   * Elle en comptait trois, et c'étaient les trois VUES du dossier — un
   * sélecteur de contenu, pas une navigation. Le visuel montre autre chose : une
   * barre système, toujours présente, où l'on se repère.
   *
   * ── Le cinquième onglet, et pourquoi ce n'est pas « Profil » ─────────────
   *
   * Le visuel porte « Profil ». Verrière n'a pas de compte — « aucune création
   * de compte obligatoire » est une promesse du kit publicitaire, pas un détail
   * technique. Un onglet Profil s'ouvrirait donc sur rien, et l'ODM interdit
   * d'inventer ce qui n'existe pas.
   *
   * La cinquième entrée est le RAPPORT d'origine : c'est ce que le produit a
   * réellement, c'est ce que le lecteur cherche quand il doute d'une phrase, et
   * c'est la promesse de la marque — le rapport reste la référence.
   */
  const NAVIGATION = [
    { cle: 'accueil', picto: 'accueil', nom: 'Accueil' },
    { cle: 'point', picto: 'diagnostics', nom: 'Diagnostics' },
    { cle: 'alertes', picto: 'alertes', nom: 'Alertes' },
    { cle: 'conseil', picto: 'conseil', nom: 'Conseils' },
    { cle: 'rapport', picto: 'rapport', nom: 'Rapport' }
  ];

  /** Ce qui demande une action avant de signer : le badge de l'onglet Alertes. */
  const aRegler = $derived(compte.aRegler + compte.aVerifier);
</script>

<section class="bureau" aria-label="Votre dossier en un coup d’œil">
  <!--
    LE WIDGET DU BIEN — point 2 de la hiérarchie d'accueil, non négociable.

    « Grand widget photo du bien : photo, adresse, type, surface, nombre de
    diagnostics analysés et points à surveiller. » Puis, IMMÉDIATEMENT dessous,
    les mini-apps : aucun bloc entre les deux.

    Ce qui était là avant — trois compteurs, une phrase, deux boutons — n'a pas
    disparu : les compteurs sont devenus le bandeau d'état, la phrase et le
    détail se lisent en ouvrant l'analyse, et l'impression est passée dans le
    menu du widget. C'est la hiérarchie qui change, pas le contenu.

    ── La photo qu'on n'a pas ──────────────────────────────────────────────

    Le produit lit un PDF : il n'a aucune photo du logement, et il n'en
    inventera pas. Le prototype du pack prévoit ce cas — sa tuile de bien est un
    dégradé — et l'ODM affecte l'illustration de verrière au trait aux « empty
    states ». C'est donc elle qui occupe le cadre, en filigrane, jusqu'au jour
    où une photo sera fournie.
  -->
  <article class="bien">
    <div class="paysage" aria-hidden="true">
      <img class="filigrane" src="./logo/verriere-line-art.svg" alt="" />
    </div>

    {#if analyse.bien.commune}
      <p class="ville">
        <span
          class="picto-lieu"
          style="mask-image: url(./pictos/lieu.svg); -webkit-mask-image: url(./pictos/lieu.svg)"
          aria-hidden="true"
        ></span>
        {analyse.bien.commune}
      </p>
    {/if}

    <button
      type="button"
      class="menu"
      onclick={() => window.print()}
      aria-label="Imprimer le dossier"
    >
      <span aria-hidden="true">⋯</span>
    </button>

    <div class="dessous">
      <h2>{analyse.bien.adresse ?? titre}</h2>
      {#if analyse.bien.commune}<p class="commune">{analyse.bien.commune}</p>{/if}

      <p class="traits">
        {#if analyse.bien.typeBien}<span>{analyse.bien.typeBien}</span>{/if}
        {#if analyse.bien.surface !== undefined}
          <span>{analyse.bien.surface.toLocaleString('fr-FR')} m²</span>
        {/if}
        {#if analyse.bien.anneeConstruction}
          <span>Construit {analyse.bien.anneeConstruction}</span>
        {/if}
      </p>

      {#if lettre}
        <span class="lettre" style="background: {TEINTE_DPE[lettre] ?? 'var(--action)'}">
          {lettre}
        </span>
      {/if}

      <button type="button" class="voir" onclick={() => surVue?.('point')}>
        Voir le bien <span aria-hidden="true">›</span>
      </button>
    </div>

    <!-- Les deux chiffres que l'ODM demande, et rien de plus : le détail
         s'ouvre d'un geste, il n'encombre pas l'accueil. -->
    <button type="button" class="etat" onclick={() => surVue?.('point')}>
      <span class="lu">
        <span class="rond bon" aria-hidden="true">✓</span>
        {analyse.diagnostics.length} diagnostic{analyse.diagnostics.length > 1 ? 's' : ''} analysé{analyse
          .diagnostics.length > 1
          ? 's'
          : ''}
      </span>
      <span class="separateur" aria-hidden="true"></span>
      <span class="veiller">
        <span class="rond veille" aria-hidden="true">●</span>
        {compte.aRegler + compte.aVerifier} point{compte.aRegler + compte.aVerifier > 1 ? 's' : ''} à
        surveiller
      </span>
      <span class="chevron" aria-hidden="true">›</span>
    </button>
  </article>

  <!-- La grille. Un diagnostic absent du rapport n'a pas de tuile : le dossier
       montre ce qu'il contient, pas ce qu'il devrait contenir. Ce qui manque est
       signalé ailleurs, comme un manque, pas comme une case grise. -->
  <h3 class="intitule">Vos diagnostics</h3>

  <ul class="grille">
    {#each tuiles as tuile (tuile.type)}
      {@const t = TUILES[tuile.type]}
      {@const d = tuile.diagnostic}
      {@const p = d ? pastille(d) : null}
      <li>
        <button
          type="button"
          class="tuile"
          class:eteinte={!d}
          disabled={!d}
          title={d ? undefined : (tuile.manque?.titre ?? 'Ce diagnostic ne figure pas dans le dossier déposé.')}
          onclick={(e) => d && ouvrir(e, tuile.type)}
        >
          <span class="icone" style="background: {t.degrade}">
            {#if t.picto}
              <span
                class="picto"
                style="mask-image: url(./pictos/{t.picto}.svg); -webkit-mask-image: url(./pictos/{t.picto}.svg)"
                aria-hidden="true"
              ></span>
            {:else}
              <span class="signe" aria-hidden="true">{t.signe}</span>
            {/if}
            {#if p}
              <span class="pastille {p.classe}" aria-hidden="true">{p.signe}</span>
            {:else if tuile.manque}
              <!-- Absent alors qu'il est obligatoire : ce n'est pas une case
                   vide, c'est un point à régler avant de signer. -->
              <span class="pastille alerte" aria-hidden="true">▲</span>
            {/if}
          </span>
          <span class="nom">{t.nom}</span>
          <span class="dit">
            {#if d}{libelleCourt(d)}{:else if tuile.manque}Manquant{:else}Pas au dossier{/if}
          </span>
        </button>
      </li>
    {/each}
  </ul>

  <!-- Les outils : ils ne lisent pas le rapport, ils aident à le lire. -->
  <h3 class="intitule">Pour comprendre</h3>

  <ul class="grille outils">
    {#each OUTILS as o (o.cle)}
      <li>
        {#if o.cle === 'en-clair'}
          <!-- « En clair » est une vraie rubrique du site, en pages HTML : elle
               s'ouvre comme un lien, pas comme un écran. -->
          <a class="tuile" href="./en-clair/">
            <span class="icone" style="background: {o.degrade}">
              <span
                class="picto"
                style="mask-image: url(./pictos/{o.picto}.svg); -webkit-mask-image: url(./pictos/{o.picto}.svg)"
                aria-hidden="true"
              ></span>
            </span>
            <span class="nom">{o.nom}</span>
            <span class="dit">{o.dit}</span>
          </a>
        {:else}
          <button
            type="button"
            class="tuile"
            onclick={() => {
              aLOuverture();
              dicodiagOuvert = true;
            }}
          >
            <span class="icone" style="background: {o.degrade}">
              <span
                class="picto"
                style="mask-image: url(./pictos/{o.picto}.svg); -webkit-mask-image: url(./pictos/{o.picto}.svg)"
                aria-hidden="true"
              ></span>
            </span>
            <span class="nom">{o.nom}</span>
            <span class="dit">{o.dit}</span>
          </button>
        {/if}
      </li>
    {/each}
  </ul>

  <nav class="dock" aria-label="Navigation">
    {#each NAVIGATION as d (d.cle)}
      <button
        type="button"
        class:courant={d.cle === 'accueil'}
        aria-current={d.cle === 'accueil' ? 'page' : undefined}
        onclick={() => {
          auToucher();
          if (d.cle !== 'accueil') surVue?.(d.cle);
        }}
      >
        <span class="signe" aria-hidden="true">
          <span
            class="picto"
            style="mask-image: url(./pictos/{d.picto}.svg); -webkit-mask-image: url(./pictos/{d.picto}.svg)"
          ></span>
          {#if d.cle === 'alertes' && aRegler > 0}
            <span class="badge">{aRegler}</span>
          {/if}
        </span>
        <span class="nom">{d.nom}</span>
      </button>
    {/each}
  </nav>
</section>

{#if dicodiagOuvert}
  <Dicodiag surFermer={() => (dicodiagOuvert = false)} />
{/if}

{#if propagation}
  <Propagation
    depuis={propagation.carre}
    couleur={propagation.couleur}
    surCouvert={() => propagation && surOuvrirDiagnostic?.(propagation.type, propagation.carre)}
    surFini={() => (propagation = null)}
  />
{/if}

<style>
  /*
   * L'écran d'accueil est en bleu pétrole, et les applications y ressortent.
   *
   * Sur le sable, neuf icônes colorées et un fond chaud se disputaient l'œil :
   * l'écran était joli mais plat, et rien n'appelait le doigt. Sur le pétrole,
   * chaque icône devient une source de couleur — c'est la mécanique d'un écran
   * de téléphone, et c'est ce qui fait qu'on y repère son application sans lire
   * son nom.
   *
   * Le fond déborde volontairement de la section, jusqu'aux bords de la fenêtre
   * et sous la barre du site : un aplat qui s'arrête à mi-écran donnerait un
   * rectangle posé sur une page, pas un bureau.
   *
   * Les jetons sont ceux de l'inversion déjà écrite pour l'écran de démarrage.
   * Ils ne sont pas recopiés ici : toute surface claire posée sur ce fond doit
   * les remettre à l'endroit, sinon elle hérite d'un texte sable sur du blanc —
   * la régression qui a déjà coûté un écran de conditions illisible.
   */
  .bureau {
    margin-bottom: var(--e6);
    padding: var(--e5) var(--e4) var(--e6);
    /* Jusqu'aux bords, quelle que soit la largeur de la colonne de lecture. */
    margin-inline: calc(50% - 50vw);
    padding-inline: max(var(--e4), calc(50vw - 480px));
    /*
     * Le bureau posait un second pétrole — #1A4D5C — sur le fond général qui
     * est maintenant #0F3A47. Deux bleus voisins mais distincts font une
     * strate visible en haut de page, comme un défaut de rendu. Il porte
     * désormais le fond du produit, et se détache par son arrondi et son
     * contenu, pas par une nuance de plus.
     */
    background: transparent;
    color: var(--sur-fond);
    /* Le bas s'arrondit : la page continue en dessous, et un aplat coupé net
       ressemblerait à un défaut de rendu plutôt qu'à un panneau. */
    border-end-start-radius: 28px;
    border-end-end-radius: 28px;

    /* Le bureau suit le socle : ivoire dessous, vert profond dessus. Il portait
       une encre claire, héritée du temps où son fond était sombre — sur
       l'ivoire, les noms des applis tombaient à 1,04 de contraste. */
    --sur-fond: #0a2b23;
    --sur-fond-doux: #4a5a55;
    --encre: #0a2b23;
    --encre-doux: #4a5a55;
    --gris: #58775f;
    --surface: rgb(10 43 35 / 3%);
    --surface-forte: rgb(10 43 35 / 6%);
    --surface-bord: rgb(10 43 35 / 12%);
    --trait: #779576;
    --trait-fin: #dfe6db;
    --action-texte: #a33220;
  }

  /* ---- Le cartouche ------------------------------------------------------
     Blanc sur le pétrole, cerné de citron.

     Le citron est au POURTOUR, pas au fond : l'encart reste une surface de
     lecture — trois chiffres, une phrase, deux boutons — et le filet suffit à
     le désigner comme le bloc de la marque. Un aplat vert aurait obligé à
     réécrire toute son encre en pétrole foncé, seule couleur qui s'y lit
     (4,38 ; le blanc y tombe à 2,80), pour un gain d'attention qui n'était pas
     demandé.

     Il remet les jetons à l'endroit pour lui-même : sa surface est claire, et
     le texte sable de l'écran y tomberait à 1,07. */
  /* ---- Le widget du bien ------------------------------------------------ */

  /*
   * Un cadre, une image, un dégradé qui rattrape le texte.
   *
   * C'est la grammaire du visuel de référence, et c'est celle de tous les
   * widgets de ce genre : l'image occupe tout, le texte est posé dessus, et un
   * dégradé sombre par le bas garantit qu'il reste lisible quelle que soit
   * l'image. Ici l'image est un dégradé de la charte plus l'illustration de
   * verrière — voir le commentaire du balisage.
   */
  .bien {
    position: relative;
    isolation: isolate;
    min-height: 260px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: var(--ombre-forte);
    color: #ffffff;
  }

  .paysage {
    position: absolute;
    inset: 0;
    z-index: -2;
    background: linear-gradient(150deg, #2f6b52 0%, #17493c 46%, #0a2b23 100%);
  }

  /* L'illustration de verrière, en filigrane : l'ODM la destine aux écrans
     sans contenu propre, et c'en est un tant qu'aucune photo n'existe. */
  .filigrane {
    position: absolute;
    right: -6%;
    bottom: 8%;
    width: 74%;
    opacity: 0.17;
    filter: brightness(0) invert(1);
  }

  /* Le dégradé qui rattrape le texte. Sans lui, la lisibilité dépendrait de
     l'image — et le jour où une vraie photo arrivera, elle sera quelconque. */
  .bien::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(to top, rgb(4 22 18 / 92%) 0%, rgb(4 22 18 / 55%) 34%, transparent 68%);
  }

  .picto-lieu {
    display: inline-block;
    width: 13px;
    height: 13px;
    vertical-align: -1px;
    margin-right: 3px;
    background: currentColor;
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    -webkit-mask-size: contain;
  }

  .ville {
    position: absolute;
    top: var(--e3);
    left: var(--e3);
    margin: 0;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgb(4 22 18 / 62%);
    backdrop-filter: blur(8px);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
  }

  .menu {
    position: absolute;
    top: var(--e3);
    right: var(--e3);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: rgb(255 255 255 / 88%);
    color: var(--vert-profond);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    display: grid;
    place-items: center;
  }

  .menu:hover {
    background: #ffffff;
  }

  .dessous {
    position: relative;
    padding: var(--e4);
    display: grid;
    gap: 4px;
  }

  .dessous h2 {
    margin: 0;
    font-family: var(--police-titre);
    font-size: var(--t-titre);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.022em;
  }

  .commune {
    margin: 0;
    font-size: var(--t-petit);
    opacity: 0.92;
  }

  /* Type, surface, année : séparés par des points médians, comme le visuel. */
  .traits {
    margin: 6px 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 10px;
    font-size: var(--t-micro);
    opacity: 0.9;
  }

  .traits span + span::before {
    content: '·';
    margin-right: 10px;
    opacity: 0.7;
  }

  /* La lettre du DPE : couleur de l'arrêté, encre noire — sur un jaune
     réglementaire, du blanc ne se lit pas. */
  .lettre {
    position: absolute;
    right: var(--e4);
    bottom: calc(var(--e4) + 46px);
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: var(--t-lead);
    color: #1c1c1c;
    box-shadow: var(--ombre);
  }

  .voir {
    justify-self: start;
    margin-top: var(--e2);
    min-height: 40px;
    padding: 0 18px;
    border: none;
    border-radius: 999px;
    background: #ffffff;
    color: var(--vert-profond);
    font-size: var(--t-petit);
    font-weight: 700;
    cursor: pointer;
    transition: transform var(--duree) var(--courbe);
  }

  .voir:hover {
    transform: translateY(-2px);
  }

  /* Le bandeau d'état : les deux chiffres que l'ODM demande, posés sur un
     verre dépoli à l'intérieur même du widget. */
  .etat {
    position: relative;
    margin: 0 var(--e3) var(--e3);
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgb(255 255 255 / 18%);
    border-radius: 16px;
    background: rgb(4 22 18 / 55%);
    backdrop-filter: blur(10px);
    color: #ffffff;
    font-size: var(--t-micro);
    font-weight: 600;
    cursor: pointer;
    text-align: left;
  }

  .etat:hover {
    background: rgb(4 22 18 / 70%);
  }

  .lu,
  .veiller {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .separateur {
    flex: 1;
    height: 18px;
    border-left: 1px solid rgb(255 255 255 / 22%);
  }

  .rond {
    width: 16px;
    height: 16px;
    flex: none;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 10px;
    line-height: 1;
  }

  .rond.bon {
    background: #a6c39a;
    color: var(--vert-profond);
  }

  /* L'ambre du socle est réglé pour le fond clair : posé sur le widget sombre,
     il tombe à 2,8 et la pastille s'éteint. C'est la version claire qui
     signale ici — mesuré à 10,4 sur son encre. */
  .rond.veille {
    background: #ffd54a;
    color: #2a1c00;
  }

  .chevron {
    opacity: 0.75;
    font-size: 16px;
  }

  /* ---- La grille des tuiles --------------------------------------------- */
  .intitule {
    margin: var(--e5) 0 var(--e3);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    color: var(--sur-fond-doux);
  }

  /*
   * Quatre colonnes, comme sur un téléphone.
   *
   * Mesuré à 380 px : quatre icônes de 76 et trois écarts de 16 réclament
   * 352 px pour 348 disponibles — la grille retombait à trois colonnes et
   * l'écran perdait sa forme. L'écart passe donc à 12 et les quatre tiennent.
   * Au-delà, on laisse la grille respirer par elle-même.
   */
  .grille {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--e3) var(--e3);
  }

  /* L'élément de liste occupe sa colonne : centré, il se réduisait à la largeur
     de son texte et l'icône tombait de 76 à 51 pixels. */
  .grille li {
    display: grid;
    justify-items: center;
  }

  @media (min-width: 560px) {
    .grille {
      grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
      gap: var(--e5) var(--e4);
    }
  }

  .tuile {
    width: 100%;
    max-width: 88px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: grid;
    justify-items: center;
    align-content: start;
    gap: 6px;
    color: var(--sur-fond);
  }

  .icone {
    position: relative;
    width: 100%;
    max-width: 76px;
    aspect-ratio: 1;
    border-radius: 18px;
    display: grid;
    place-items: center;
    font-size: 32px;
    /*
     * L'ombre double du visuel de référence, et rien d'autre.
     *
     * Un liseré lumineux INTÉRIEUR sur l'arête haute, puis une ombre portée
     * verte, franchement décalée. C'est cette paire qui donne le relief iOS :
     * la lumière tombe d'en haut, l'objet la reçoit sur son bord supérieur et
     * projette son ombre plus bas.
     *
     * Ce qui était là avant : un anneau sombre sur tout le pourtour et une
     * ombre courte. Le commentaire le justifiait par un contraste « mesuré sur
     * le sable » — or le sable a quitté la charte le 19 août, et cette mesure
     * ne valait plus rien. Un anneau qui fait le tour aplatit l'icône au lieu
     * de la lever.
     */
    box-shadow:
      inset 0 1px rgb(255 255 255 / 53%),
      0 10px 20px rgb(10 43 35 / 19%);
    transition: transform var(--duree) var(--courbe), box-shadow var(--duree) var(--courbe);
  }

  /*
   * Le voile iOS : une lumière en haut à gauche, qui donne le relief.
   *
   * Il était éteint, et personne ne pouvait le voir. L'icône portait aussi la
   * classe `halo`, dont le `::after` global pose `opacity: 0` en attendant le
   * survol. Un élément n'a qu'un seul `::after` : cette règle-ci redéfinissait
   * le fond et la boîte, mais héritait de l'opacité nulle. Les icônes
   * n'avaient donc AUCUN reflet au repos — le relief ne s'allumait qu'au
   * passage de la souris, et jamais sur un téléphone.
   *
   * La classe `halo` est retirée : le visuel de référence ne demande aucune
   * lueur au survol, seulement ce relief-là, permanent.
   */
  .icone::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, rgb(255 255 255 / 20%) 0%, transparent 60%);
    pointer-events: none;
  }

  /*
   * Le pictogramme dessiné, à la place de l'émoji.
   *
   * Il occupe 54 % de l'icône : c'est la proportion du visuel de référence, et
   * elle laisse au dégradé la place de se voir. L'ombre portée très douce le
   * décolle du fond coloré, comme sur la planche du pack — sans elle, un trait
   * crème sur un jaune vif paraît collé.
   */
  /*
   * Le pictogramme est posé en MASQUE, pas en image.
   *
   * Un SVG chargé par `<img>` est un document isolé : son `currentColor` vaut
   * noir, quel que soit l'élément qui l'entoure. Le masque ne garde que la
   * forme et prend la couleur de fond de l'élément — le même fichier sert donc
   * en crème sur un dégradé saturé et en vert profond sur une tuile claire.
   * Une seule bibliothèque, deux usages, § 4 respecté.
   */
  .picto {
    position: relative;
    z-index: 1;
    width: 54%;
    height: 54%;
    background: currentColor;
    mask-repeat: no-repeat;
    mask-position: center;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    -webkit-mask-size: contain;
    /* L'ombre décolle le trait du dégradé coloré. Sur la tuile claire du dock,
       elle salirait : elle n'y est pas. */
    filter: drop-shadow(0 1px 2px rgb(4 22 18 / 28%));
  }

  /* Les mini-apps portent un dégradé saturé : le pictogramme y est crème. */
  .grille .icone {
    color: var(--ivoire);
  }

  .dock .picto {
    width: 56%;
    height: 56%;
    filter: none;
  }

  /* Cinq libellés sur la largeur d'un téléphone : le corps descend, sans quoi
     « Diagnostics » passerait à la ligne. */
  .dock .nom {
    font-size: 10px;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }

  /*
   * L'application que le dossier ne contient pas : éteinte.
   *
   * L'icône garde sa forme et sa couleur, mais elle est délavée et sans relief
   * — l'aspect d'une application qu'un téléphone n'a pas fini de charger. On la
   * reconnaît, on voit qu'elle n'est pas là, et on ne peut pas l'ouvrir.
   *
   * Un point reste vif quand il le faut : la pastille d'alerte du diagnostic
   * obligatoire absent. C'est l'information la plus importante de la grille, et
   * elle ne doit pas s'éteindre avec le reste.
   */
  .tuile.eteinte {
    cursor: default;
  }

  .tuile.eteinte .icone {
    filter: grayscale(0.75);
    opacity: 0.4;
    box-shadow: inset 0 1px rgb(255 255 255 / 22%);
  }

  .tuile.eteinte .nom,
  .tuile.eteinte .dit {
    opacity: 0.55;
  }

  .tuile.eteinte .pastille {
    filter: none;
    opacity: 1;
  }

  /* Au survol, l'objet se lève : l'ombre s'allonge et se fonce, le liseré
     du haut reste. C'est le même relief, vu de plus près. */
  .tuile:not(.eteinte):hover .icone,
  .tuile:not(.eteinte):focus-visible .icone {
    transform: scale(1.05);
    box-shadow:
      inset 0 1px rgb(255 255 255 / 60%),
      0 14px 26px rgb(10 43 35 / 26%);
  }

  /* Une application absente ne s'éclaire pas : elle n'est pas là, et rien ne
     doit laisser croire qu'on peut l'ouvrir. */
  .tuile.eteinte .icone::after {
    display: none;
  }

  /*
   * Sur le fond pétrole de l'accueil, la lueur se renforce.
   *
   * La valeur par défaut est réglée pour un fond clair. Sur du sombre, un voile
   * citron à 32 % se perd — c'est le même piège que le dock blanc, une couleur
   * translucide ne vaut que par ce qu'il y a dessous.
   */
  .bureau {
    --lueur: rgb(18 70 59 / 88%);
    --lueur-large: rgb(214 230 106 / 52%);
  }

  /* La pastille d'état : une forme d'abord, une couleur ensuite. Elle relie la
     tuile aux compteurs du cartouche — sans elle, la grille ne serait qu'un
     sommaire illustré. */
  .pastille {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 10px;
    line-height: 1;
    color: #fff;
    border: 2px solid var(--fond);
    z-index: 1;
  }

  .pastille.alerte {
    background: var(--alerte);
  }

  .pastille.attention {
    background: var(--attention);
  }

  .pastille.bon {
    background: var(--petrole);
  }

  .nom {
    font-size: var(--t-micro);
    font-weight: 700;
    text-align: center;
    line-height: 1.2;
  }

  /* Ce que le rapport conclut, en trois mots, sous la tuile. C'est cette ligne
     qui fait la différence entre une grille d'icônes et un dossier : on sait ce
     qu'il y a derrière avant d'ouvrir. */
  /* Deux lignes au plus : sinon une tuile bavarde décale toute sa rangée. Le
     verdict complet est sur la fiche, à un doigt d'ici. */
  .dit {
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
    text-align: center;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ---- Le dock ------------------------------------------------------------
     Il ne colle pas au bas de l'écran : cette page est un document de plusieurs
     écrans, et une barre flottante y masquerait du texte à chaque défilement.
     Il en garde la forme — verre dépoli, coins ronds — et la fonction : les
     trois destinations, toujours au même endroit. */
  /*
   * Le verre du dock est teinté, pas clair.
   *
   * Il était blanc à 70 % : sur le sable, cela donnait une plaque dépolie très
   * lisible. Sur le pétrole, la même plaque devient presque blanche et les
   * libellés sable qui la traversent tombent à 1,4 — le dock reste beau et
   * cesse d'être lisible.
   *
   * Le piège vaut d'être noté : un aplat translucide ne se mesure pas à la
   * couleur qu'on écrit, mais à ce qu'elle donne UNE FOIS COMPOSÉE avec le fond
   * du dessous. Ma sonde automatique n'avait rien vu — elle avait remonté la
   * chaîne jusqu'au pétrole et mesuré un couple qui n'existe pas à l'écran.
   */
  /*
   * La barre de navigation : cinq entrées de largeur égale, façon iOS.
   *
   * Elle en portait trois, espacées au centre — un sélecteur. Cinq entrées
   * réparties sur toute la largeur se lisent comme une barre système : on sait
   * où l'on est, et l'onglet courant se distingue sans qu'on ait à le chercher.
   */
  .dock {
    margin-top: var(--e5);
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2px;
    padding: var(--e2) var(--e1);
    border-radius: 24px;
    background: rgb(255 255 255 / 82%);
    backdrop-filter: blur(20px);
    border: 1px solid var(--trait-fin);
    box-shadow: var(--ombre-lourde);
  }

  /* L'onglet courant : un aplat vert et son encre claire, comme le visuel. */
  .dock button.courant .signe {
    background: var(--vert-profond);
    color: var(--ivoire);
    box-shadow: none;
  }

  .dock button.courant .nom {
    color: var(--vert-profond);
    font-weight: 700;
  }

  /* Le badge : le nombre de points à régler, posé sur l'onglet Alertes. */
  .badge {
    position: absolute;
    top: -4px;
    right: -6px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--alerte);
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    line-height: 18px;
    text-align: center;
  }

  .dock button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: grid;
    justify-items: center;
    gap: 4px;
    color: var(--sur-fond);
  }

  .dock .signe {
    position: relative;
    width: 44px;
    height: 44px;
    border-radius: 13px;
    display: grid;
    place-items: center;
    font-size: 24px;
    /* La tuile est claire : le pictogramme, qui suit son contexte, y prend le
       vert profond du socle au lieu du crème des mini-apps. */
    color: var(--vert-profond);
    background: linear-gradient(145deg, #ffffff, var(--ivoire));
    box-shadow: var(--ombre);
    transition: transform var(--duree) var(--courbe);
  }

  .dock button:hover .signe,
  .dock button:focus-visible .signe {
    transform: translateY(-4px);
  }

  .dock .nom {
    font-size: var(--t-micro);
  }

  @media (prefers-reduced-motion: reduce) {
    .icone,
    .dock .signe,
    .voir {
      transition: none;
    }

    .tuile:hover .icone,
    .dock button:hover .signe,
    .voir:hover {
      transform: none;
    }
  }

  /* À l'impression, le dossier n'a ni tuiles ni dock : il a des pages. */
  @media print {
    .bureau {
      display: none;
    }
  }
</style>
