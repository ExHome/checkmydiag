<script lang="ts">
  import type { Photo } from '../lib/pdf';
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
  import type { Analyse, Diagnostic, TypeDiag, PointDeControle } from '../lib/modele';
  import { libelleCourt } from '../lib/libelle';
  import ModuleAbsent from './ModuleAbsent.svelte';
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
    /**
     * LA PHOTO DU BIEN, quand le rapport en porte une.
     *
     * Elle est extraite du PDF par `photoDuBien()` — la plus grande image des
     * deux premières pages, découpée à sa position réelle. L'extraction
     * existait et fonctionnait ; c'est l'affichage qui manquait.
     */
    photo?: Photo | null;
  }

  const { analyse, surOuvrirDiagnostic, surVue, photo = null }: Props = $props();

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

  /**
   * L'EMPTY STATE D'UN DIAGNOSTIC ABSENT.
   *
   * La tuile éteinte était `disabled` : on la voyait, on la touchait, rien ne
   * se passait. Sa seule explication vivait dans un attribut `title` — un
   * tooltip natif, qui ne s'affiche jamais au toucher. Sur téléphone,
   * l'information n'existait pas.
   *
   * Elle s'ouvre donc, comme les autres, mais sur une bottom sheet plutôt que
   * sur un écran plein : ce n'est pas un diagnostic à lire, c'est une réponse à
   * une question — « et le gaz, alors ? ».
   */
  let absent = $state<{ type: TypeDiag; manque: PointDeControle | null } | null>(null);

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

  /**
   * La pastille d'etat posee sur la tuile : une forme, puis une couleur.
   *
   * ── LE QUATRIEME ETAT N'AVAIT AUCUN RENDU ─────────────────────────────────
   *
   * Le moteur produit bel et bien quatre etats, et le quatrieme -- « neutre »,
   * c'est-a-dire « ce rapport n'a pas pu etre lu » -- ressortait ici en `null`.
   * Une tuile sans pastille. Exactement la meme qu'un diagnostic dont il n'y a
   * rien a dire.
   *
   * C'est la fausse reassurance que ce produit passe son temps a combattre :
   * « on n'a pas su lire » se presentait comme « rien a signaler ». Le point
   * d'interrogation le dit, et il le dit sur la grille -- l'ecran le plus vu.
   */
  function pastille(d: Diagnostic): { signe: string; classe: string; quoi: string } | null {
    if (d.gravite === 'alerte') return { signe: '▲', classe: 'alerte', quoi: 'à régler' };
    if (d.gravite === 'attention') return { signe: '●', classe: 'attention', quoi: 'à vérifier' };
    if (d.gravite === 'bon') return { signe: '✓', classe: 'bon', quoi: 'rien à signaler' };
    return { signe: '?', classe: 'inconnu', quoi: 'non lu automatiquement' };
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
   * LA BARRE DE NAVIGATION. Quatre entrées : la grille des applications
   * ouvre déjà les diagnostics, un onglet de plus aurait fait doublon.
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
  /*
   * ── « DIAGNOSTICS » A QUITTÉ LA BARRE (21/08/2026) ───────────────────────
   *
   * Ordre d'Aude : « le volet diagnostic ne sert à rien, car on a tous les
   * diags dans les mini apps ». La grille de cet écran-ci porte une tuile par
   * diagnostic, et chacune ouvre le sien. L'onglet, lui, ouvrait le même écran
   * SANS le diagnostic — une seconde porte vers la même pièce, qui tombait sur
   * le premier rapport venu.
   *
   * La barre garde donc quatre entrées, et l'accueil redevient le chemin des
   * diagnostics : on entre par celui qu'on a choisi.
   */
  const NAVIGATION = [
    { cle: 'accueil', picto: 'accueil', nom: 'Accueil' },
    /*
     * QUATRE ENTRÉES, ET « DIAGNOSTICS » N'EN FAIT PLUS PARTIE.
     *
     * Décision d'Aude : « je ne veux pas de doublons, ça fait 3 entrées avec
     * les mini-apps ». La grille des applications EST l'accès aux
     * diagnostics ; un onglet de plus dans la barre menait au même endroit
     * qu'une icône posée juste au-dessus.
     *
     * (Je l'avais rétablie en croyant à une disparition accidentelle — le
     * commentaire ci-dessus annonçait cinq entrées. C'est le commentaire qui
     * était périmé, pas la liste.)
     */
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
  <!--
    Sans photo, le widget se serre.

    Sa hauteur etait calibree pour une photo du logement. Le produit lit un
    PDF : il n'en a pas, et n'en inventera pas. Mesure a l'ecran sur un
    telephone de 844 px : 260 px pour un filigrane, soit 31 % de la hauteur, et
    la moitie de l'ecran occupee avant d'atteindre les diagnostics.

    Le test du silence l'a rendu evident -- textes masques, le plus gros bloc
    de l'ecran ne montrait rien. Le jour ou une photo sera fournie, la classe
    tombe et le grand cadre revient.
  -->
  <!--
    `sans-photo` valait `true` EN DUR : le widget restait serré même quand le
    rapport portait une photo. Le commentaire ci-dessus annonçait pourtant « le
    jour où une photo sera fournie, la classe tombe » — elle ne tombait jamais,
    puisque rien ne la calculait.
  -->
  <article class="bien" class:sans-photo={!photo}>
    <div class="paysage" aria-hidden="true">
      {#if photo}
        <!--
          LA PHOTO DU BIEN.

          `object-fit: cover` la recadre sans la déformer : un rapport peut
          porter un cliché en portrait comme en paysage, et un logement écrasé
          se voit immédiatement.

          Elle est décorative au sens de l'accessibilité — l'adresse, juste
          en dessous, dit ce que la photo montre. Un `alt` la décrivant
          répéterait ce texte au lecteur d'écran.
        -->
        <img class="cliche" src={photo.image} alt="" width={photo.largeur} height={photo.hauteur} />
      {:else}
        <!--
          SANS PHOTO, C'EST LA VERRIÈRE QUI OCCUPE LE CADRE.

          Le widget attendait « le jour où une vraie photo arrivera » et
          affichait en attendant un trait au trait. Il portait déjà tout ce
          qu'il faut : un voile qui rattrape la lisibilité par-dessus l'image,
          écrit pour une photo quelconque. La verrière de référence s'y pose
          donc exactement comme un cliché — même traitement, même voile, même
          encre blanche.

          `aria-hidden` et `alt` vide : ce n'est pas une photo du logement et
          rien ne doit le laisser croire. Un lecteur d'écran ne doit pas
          annoncer une image du bien là où il n'y en a pas.
        -->
        <img
          class="cliche verriere-defaut"
          src="./fond/verriere-fond-960.webp"
          alt=""
          width="960"
          height="640"
          loading="lazy"
          decoding="async"
        />
      {/if}
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
      <!-- La commune est déjà dans le badge du haut, avec son picto de lieu.
           Elle était ici aussi : le même texte, dans la même carte, à 74 px
           d'écart. Mesuré à l'écran. L'adresse se lit mieux d'un bloc avec ses
           caractéristiques. -->

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

      <!--
        « VOIR LE BIEN » A ÉTÉ RETIRÉ — décision d'Aude, même raison que
        l'onglet du dock : il menait à la vue des diagnostics, que la grille
        des applications ouvre déjà juste dessous. Deux chemins vers le même
        écran, à trois centimètres l'un de l'autre.

        Le widget garde ce qu'il est : l'identité du bien. Il n'a pas besoin
        d'être une porte de plus.
      -->
    </div>

  </article>

  <!--
    LA BARRE DE SYNTHESE, HORS DU CADRE.

    Sur la publicite, elle est blanche et posee SOUS le widget, comme une
    seconde carte. Elle etait ici a l'interieur du cadre sombre, en verre
    depoli : deux informations de nature differente -- le bien d'un cote, ce que
    le dossier en dit de l'autre -- tenaient dans le meme objet.
  -->
  <!--
    LE WIDGET « À RETENIR » — la vue d'ensemble, sans quitter l'écran d'accueil.

    L'ordre de mission demande qu'on ne déverse pas les diagnostics d'emblée :
    d'abord le bien, puis ce qu'il faut retenir en trois niveaux, puis seulement
    les univers.

    Il demande aussi de garder le principe iPhone. Les deux ne s'opposent pas —
    un écran d'accueil iOS, c'est précisément DES WIDGETS PUIS DES APPS. « À
    retenir » est donc un second widget, accolé au premier, et non un écran
    intercalé qui ajouterait un geste.

    Trois niveaux, jamais deux : un dossier n'a pas seulement du bon et du
    mauvais. Et un quatrième, seulement s'il existe — ce qu'on n'a pas su lire
    ne se range pas avec ce qui va bien.
  -->
  <button type="button" class="retenir" onclick={() => surVue?.('point')}>
    <span class="titre-retenir">À retenir</span>

    <span class="niveaux">
      {#if compte.aRegler > 0}
        <span class="niveau important">
          <span class="puce" aria-hidden="true"></span>
          <b>{compte.aRegler}</b>
          {compte.aRegler > 1 ? 'points importants' : 'point important'}
        </span>
      {/if}
      {#if compte.aVerifier > 0}
        <span class="niveau surveiller">
          <span class="puce" aria-hidden="true"></span>
          <b>{compte.aVerifier}</b>
          à surveiller
        </span>
      {/if}
      {#if compte.pourInformation > 0}
        <span class="niveau rassurant">
          <span class="puce" aria-hidden="true"></span>
          <b>{compte.pourInformation}</b>
          {compte.pourInformation > 1 ? 'points rassurants' : 'point rassurant'}
        </span>
      {/if}
      {#if compte.nonLus > 0}
        <span class="niveau non-lu">
          <span class="puce" aria-hidden="true"></span>
          <b>{compte.nonLus}</b>
          non {compte.nonLus > 1 ? 'lus' : 'lu'}
        </span>
      {/if}
    </span>

    <span class="mener">Voir les diagnostics <span aria-hidden="true">›</span></span>
  </button>

  <!-- La grille. Un diagnostic absent du rapport n'a pas de tuile : le dossier
       montre ce qu'il contient, pas ce qu'il devrait contenir. Ce qui manque est
       signalé ailleurs, comme un manque, pas comme une case grise. -->
  <!--
    « MES DIAGNOSTICS », et le chevron qui ouvre la suite.

    La publicite ecrit ce titre en capitales espacees, avec un chevron a droite
    aligne sur la meme ligne : c'est lui qui mene a la vue detaillee, et il
    double le geste deja offert par la barre de synthese.
  -->
  <div class="ligne-titre">
    <h3 class="intitule">Mes diagnostics</h3>
    <button
      type="button"
      class="tout-voir"
      onclick={() => surVue?.('point')}
      aria-label="Voir tous les diagnostics en detail"
    >
      <span aria-hidden="true">›</span>
    </button>
  </div>

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
          onclick={(e) =>
            d ? ouvrir(e, tuile.type) : (absent = { type: tuile.type, manque: tuile.manque })}
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

  <!--
    LA BOTTOM SHEET DU DIAGNOSTIC ABSENT.

    `<dialog>` natif : il gère seul le piège de focus, la touche Échap et
    l'inertie de l'arrière-plan — trois choses qu'une `div` en `position: fixed`
    oblige à réécrire, et généralement mal.
  -->
  {#if absent}
    <dialog
      class="feuille-absent"
      aria-label="Diagnostic absent du dossier"
      {@attach (noeud) => {
        (noeud as HTMLDialogElement).showModal();
      }}
      oncancel={(e: Event) => {
        /*
         * ÉCHAP : ON REMET L'ÉTAT À ZÉRO NOUS-MÊMES.
         *
         * `close` n'est pas parvenu jusqu'à nous — vérifié à l'écran, même un
         * `addEventListener('close')` posé à la main ne le reçoit pas dans ce
         * navigateur. En s'y fiant, Échap laissait le `<dialog>` en `open:
         * false` avec `absent` toujours défini : le nœud restait dans le DOM,
         * `showModal()` n'était jamais rappelé, et la tuile ne rouvrait plus
         * rien.
         *
         * `cancel` précède la fermeture et se laisse annuler : on l'intercepte,
         * et c'est notre état qui commande la disparition du nœud.
         */
        e.preventDefault();
        absent = null;
      }}
      onclick={(e) => {
        /* Un clic sur le fond ferme. `::backdrop` n'est pas un enfant : le clic
           arrive donc sur le `<dialog>` lui-même, et c'est ainsi qu'on les
           distingue. */
        if (e.target === e.currentTarget) absent = null;
      }}
    >
      <ModuleAbsent type={absent.type} manque={absent.manque} fermer={() => (absent = null)} />
    </dialog>
  {/if}

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
    /*
     * LE VERT COMMENCE SOUS LE BANDEAU, SANS COUTURE.
     *
     * Le conteneur de lecture pose un rembourrage haut — `clamp(28px, 6vw,
     * 56px)` — qui laissait voir l'ivoire du socle entre le bandeau vert et le
     * bureau vert : une bande claire de vingt-huit à cinquante-six pixels,
     * exactement la strate qu'on venait de supprimer en haut.
     *
     * La marge négative reprend la même expression, au pixel près. La répéter
     * plutôt que la nommer est un moindre mal : elle vit dans `App.svelte` sur
     * un sélecteur d'élément, hors de portée d'un jeton.
     */
    margin-top: calc(-1 * clamp(28px, 6vw, 56px));
    margin-bottom: var(--e6);
    padding: var(--e5) var(--e4) var(--e6);
    /* Jusqu'aux bords, quelle que soit la largeur de la colonne de lecture. */
    margin-inline: calc(50% - 50vw);
    padding-inline: max(var(--e4), calc(50vw - 480px));
    /*
     * Le bureau posait autrefois un second fond, voisin mais distinct de celui
     * de la page : deux teintes proches font une strate visible en haut
     * d'écran, comme un défaut de rendu. Il porte désormais le fond du
     * produit, et se détache par son arrondi et son contenu, pas par une
     * nuance de plus.
     *
     * (Le commentaire nommait ici deux bleus pétrole. Ils ont quitté la charte
     * il y a longtemps ; les valeurs, elles, n'en portent plus.)
     */
    /*
     * ─────────────────────────────────────────────────────────────────────
     * LE BUREAU EST VERT. LES APPLICATIONS SONT IVOIRE.
     * ─────────────────────────────────────────────────────────────────────
     *
     * C'est la mécanique d'un téléphone : le bureau porte un fond, et chaque
     * application qu'on ouvre est une feuille claire posée dessus. On sait
     * toujours si l'on est chez soi ou dans un écran — et l'ouverture devient
     * un geste, pas un changement de page.
     *
     * LE FOND N'EST PAS LE VERT DE LA MARQUE, ET C'EST MESURÉ. Sur le vert
     * Verrière #12463b, les pastilles de gravité empruntées à l'étiquette DPE
     * tombent à 2,89 pour la classe A et 2,62 pour la classe G — sous le seuil
     * de 3,0 exigé d'un élément graphique. Elles cesseraient de se voir, alors
     * que ce sont elles qui disent la gravité.
     *
     * Sur le vert profond #0a2b23 elles remontent à 4,10 et 3,72 ; sur le vert
     * d'espace #011915, à 4,93 et 4,47. D'où le dégradé : le vert d'espace en
     * bas, le vert profond en haut, là où la lumière entre. Le vert Verrière
     * garde son rôle — il signe, il ne fait pas le fond.
     *
     * Le dégradé descend du haut : c'est la verrière, et c'est la même
     * direction de lumière dans tout le produit.
     */
    /*
     * LE FOND EN CINQ COUCHES, ET AUCUNE N'EST UN APLAT.
     * ─────────────────────────────────────────────────────────────────────
     * L'ordre est strict et se lit de haut en bas comme un empilement :
     *
     *   1. le GRAIN, la matière minérale, 3 % — le plus près de l'œil ;
     *   2. la TRAME de verrière : montants verticaux, traverses horizontales ;
     *   3. le VIGNETTAGE : les bords se densifient, le centre respire ;
     *   4. les DEUX HALOS — l'ivoire en haut à gauche, qui dit d'où vient la
     *      lumière ; le vert plus lumineux plus bas, qui empêche la moitié
     *      basse de retomber en aplat ;
     *   5. le DÉGRADÉ de base : trois nuances de vert très proches.
     *
     * Aucune image, aucun SVG encodé : cinq dégradés CSS. Rien à télécharger,
     * rien à décoder — la contrainte de performance de l'ordre de mission ne
     * laissait pas d'autre voie.
     *
     * Le dégradé garde 178° plutôt que la verticale exacte : un degré de
     * biais suffit à ce que l'œil ne trouve pas la ligne de séparation.
     */
    background:
      var(--grain),
      var(--trame-verriere),
      var(--vignettage),
      var(--halo-ivoire),
      var(--halo-vert),
      linear-gradient(178deg, #0d3229 0%, #0a2b23 34%, #05201a 68%, #011915 100%);
    background-attachment: local;
    color: var(--sur-fond);
    /* Le bas s'arrondit : la page continue en dessous, et un aplat coupé net
       ressemblerait à un défaut de rendu plutôt qu'à un panneau. */
    border-end-start-radius: 28px;
    border-end-end-radius: 28px;

    /* Le bureau suit le socle : ivoire dessous, vert profond dessus. Il portait
       une encre claire, héritée du temps où son fond était sombre — sur
       l'ivoire, les noms des applis tombaient à 1,04 de contraste. */
    /*
     * L'ENCRE SUIT LE FOND. Toutes ces valeurs sont mesurées sur le vert
     * profond #0a2b23, le plus clair des trois tons du dégradé — donc le pire
     * cas pour une encre claire :
     *
     *   ivoire  #f7f6f2 → 14,04     ivoire doux #dfe6db → 11,92
     *   sauge   #a6c39a →  7,88     sauge clair #c3d9ba → 10,09
     *
     * Elles étaient sombres, héritées du jour où ce bureau est passé en
     * ivoire ; le commentaire ci-dessus en gardait la trace. Le fond revient
     * au vert, l'encre revient au clair — et cette fois les deux sont écrits
     * au même endroit, pour qu'ils ne puissent plus diverger.
     */
    --sur-fond: #f7f6f2;
    --sur-fond-doux: #c3d9ba;
    --encre: #f7f6f2;
    --encre-doux: #c3d9ba;
    --gris: #a6c39a;
    --surface: rgb(255 255 255 / 6%);
    --surface-forte: rgb(255 255 255 / 10%);
    --surface-bord: rgb(255 255 255 / 18%);
    /*
     * ⚠️ Le trait ne peut pas être sauge — la charte l'a retiré des couleurs de
     * structure le 20/08, et `charte.test.ts` le tient. Le test ne l'avait pas
     * vu : dans sa propre expression, la limite de mot placée après « --trait »
     * avait été écrite en CARACTÈRE BACKSPACE. Elle ne correspondait donc à
     * rien, et la règle dormait. Réparée le 22/08, elle a trouvé cette ligne.
     *
     * Sur ce fond vert, un filet se fait à l'ivoire translucide, comme le
     * `--trait-fin` juste dessous — c'est l'idiome du reste de la carte.
     */
    --trait: rgb(255 255 255 / 34%);
    --trait-fin: rgb(255 255 255 / 22%);
    /*
     * L'action sur fond vert : la terre cuite #a33220 y tombe à 1,71. Le
     * sauge clair tient 10,09 et reste dans la charte.
     */
    --action-texte: #c3d9ba;
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
    /* Les coins du bas appartiennent desormais a la barre de synthese, qui
       ferme le widget juste dessous. */
    border-radius: 28px 28px 0 0;
    overflow: hidden;
  }

  /*
   * Le cadre reduit : de quoi porter le lieu et l'adresse, rien de plus. Il
   * rend a la grille des applications la place qu'un filigrane occupait.
   *
   * 168 px etait trop court, et cela s'est vu : le badge de ville, pose en
   * absolu en haut, chevauchait l'adresse de 26 pixels mesures. Le contenu
   * commande la hauteur -- badge, adresse, commune, traits, bouton -- et 206
   * est la valeur ou plus rien ne se telescope, verifiee a l'ecran.
   */
  /*
   * L'ENCRE BLANCHE VAUT DANS LES DEUX CAS.
   *
   * Elle n'était posée que sur `.sans-photo`. Conséquence, mesurée dès que la
   * photo est arrivée : le titre retombait sur le vert hérité — rgb(10,43,35)
   * — et se retrouvait écrit en vert profond sur une façade en pierre claire.
   * Illisible, alors que c'est le seul cas où le voile sombre EST là pour
   * porter du blanc.
   *
   * Le voile (`.bien::after`) couvre les deux états : l'encre aussi.
   */
  .bien {
    color: #ffffff;
  }

  .bien.sans-photo {
    min-height: 206px;
    box-shadow: var(--ombre-forte);
  }

  .paysage {
    position: absolute;
    inset: 0;
    z-index: -2;
    background: linear-gradient(150deg, #2f6b52 0%, #17493c 46%, #0a2b23 100%);
    overflow: hidden;
  }

  /* Sans photo, le cadre porte l'ivoire du dessin et non le vert. */
  .bien.sans-photo .paysage {
    background: var(--ivoire);
  }

  /*
   * LA VERRIÈRE TELLE QU'ELLE EST : VERTE SUR IVOIRE.
   *
   * Premier essai : un filtre `luminosity` qui lui faisait prendre le vert du
   * widget. Il tenait debout — il gardait la structure et sauvait le contraste
   * du titre blanc — mais il effaçait précisément ce qu'Aude a validé : la
   * verrière VERTE sur l'ivoire, pas une verrière verte sur du vert.
   *
   * Le widget change donc de camp quand il n'a pas de photo : fond ivoire,
   * dessin intact, encre sombre. Il redevient vert le jour où une vraie photo
   * arrive, puisque c'est alors la photo qui commande.
   *
   * Le fichier léger suffit : à cette taille, les 121 Ko n'apporteraient
   * aucun pixel visible de plus.
   */
  .verriere-defaut {
    object-position: right bottom;
  }

  /*
   * L'ENCRE SUIT, ET C'EST LA QUATRIÈME FOIS DANS CE CHANTIER.
   *
   * Une surface passe du sombre au clair, et le texte reste blanc : le titre
   * disparaît. Les valeurs ci-dessous sont mesurées sur l'ivoire du dessin —
   * vert profond #0a2b23 à 14,04, gris de mention #4a5a55 à 6,19.
   */
  .bien.sans-photo {
    color: #0a2b23;
    --sur-fond: #0a2b23;
    --sur-fond-doux: #4a5a55;
    --encre: #0a2b23;
    --encre-doux: #4a5a55;
  }

  /* Le voile qui rattrape la lisibilité est fait pour une photo sombre :
     sur l'ivoire il n'a plus lieu d'être et grisaillerait le dessin. */
  .bien.sans-photo::after {
    display: none;
  }

  /* Le badge de commune était blanc translucide sur du vert : sur l'ivoire il
     devient un halo invisible. Il reprend le vert de la marque. */
  .bien.sans-photo .ville {
    background: rgb(10 43 35 / 8%);
    color: #0a2b23;
  }

  /* L'illustration au trait, conservée : elle sert encore ailleurs. */
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

  /*
   * LE BOUTON D'IMPRESSION FAISAIT 36 px.
   *
   * Le cercle blanc reste à 36 px — c'est son dessin, et l'agrandir
   * déséquilibrerait le coin de la photo. C'est la ZONE qui passe à 44,
   * par un pseudo-élément centré : le doigt trouve la cible, l'œil garde la
   * pastille. Le minimum tactile d'iOS porte sur ce qu'on peut toucher, pas
   * sur ce qu'on voit.
   */
  .menu::after {
    content: '';
    position: absolute;
    inset: 50% auto auto 50%;
    width: 44px;
    height: 44px;
    transform: translate(-50%, -50%);
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

  /* La photo occupe tout le cadre, recadrée sans déformation. Le voile de
     lecture est déjà posé par `.bien` — la photo passe dessous. */
  .cliche {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
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
    min-height: 44px;
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

  /*
   * La barre de synthese : la fin du widget, pas un bloc de plus.
   *
   * Elle est blanche et distincte, comme sur la publicite -- mais ACCOLEE au
   * cadre du bien, sans marge. Les priorites editoriales sont formelles :
   * « aucune banniere ni synthese entre le widget photo et les mini-apps ».
   * Detachee, elle rompait la relation MON BIEN -> MES DIAGNOSTICS que la
   * hierarchie d'accueil protege. Collee, elle est l'etat d'analyse du bien,
   * qui fait partie du widget par le point 1 de ces memes priorites.
   */
  /*
   * LE WIDGET « À RETENIR ».
   *
   * Accolé au widget du bien, dont il reprend la largeur et les coins bas : les
   * deux forment un seul objet sur l'écran d'accueil, comme deux widgets
   * empilés d'iOS. Rien ne s'intercale entre le bien et ses applications.
   */
  .retenir {
    position: relative;
    width: 100%;
    margin: 0;
    /*
     * UNE SURFACE CLAIRE REMET L'ENCRE À L'ENDROIT.
     *
     * Le bureau porte désormais une encre claire, faite pour son fond vert.
     * Toute surface blanche posée dessus en hérite — et le texte disparaît :
     * mesuré à 1,08 sur les trois chiffres de la synthèse et 1,13 sur les noms
     * du dock, là où il en faut 4,5.
     *
     * C'est le piège que le commentaire du bureau annonçait déjà. Il ne suffit
     * pas de l'écrire : chaque surface claire doit rétablir les jetons, sinon
     * la règle ne vaut que jusqu'à la prochaine carte ajoutée.
     */
    --sur-fond: #0a2b23;
    --sur-fond-doux: #4a5a55;
    --encre: #0a2b23;
    --encre-doux: #4a5a55;
    --gris: #58775f;
    --trait: #779596;
    --trait-fin: #dfe6db;
    --action-texte: #a33220;
    color: var(--encre);

    padding: var(--e4) var(--e4) var(--e3);
    display: grid;
    gap: var(--e3);
    border: 1px solid var(--trait-fin);
    border-top: none;
    border-radius: 0 0 28px 28px;
    background: #ffffff;
    color: var(--sur-fond);
    cursor: pointer;
    text-align: left;
    box-shadow: var(--ombre);
  }

  .retenir:hover {
    border-color: var(--trait);
    box-shadow: var(--ombre-forte);
  }

  .titre-retenir {
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  /* Les niveaux se posent à la file et passent à la ligne : sur un téléphone
     ils s'empilent, sur un écran large ils tiennent sur une ligne. */
  .niveaux {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e2) var(--e5);
  }

  .niveau {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--t-base);
    color: var(--sur-fond);
  }

  .niveau b {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  /* La pastille porte la couleur ; le mot porte le sens. Jamais la couleur
     seule — c'est la règle du protocole qualité. */
  .puce {
    width: 11px;
    height: 11px;
    flex: none;
    border-radius: 50%;
  }

  .important .puce {
    background: var(--alerte);
  }

  .surveiller .puce {
    background: var(--attention);
  }

  .rassurant .puce {
    background: var(--ok, #2e6a35);
  }

  .non-lu .puce {
    background: var(--gris);
  }

  /* L'action, une seule, en bas du widget. */
  .mener {
    font-size: var(--t-petit);
    font-weight: 700;
    color: var(--action);
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
    border-left: 1px solid var(--trait-fin);
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

  /* La pastille « tout va bien » portait le sauge en dur, avec une encre vert
     profond dessus — 2,6:1. Le sauge n'est plus une couleur de structure
     (charte du 20/08, §2), et un signal doit d'abord se lire : vert Verrière
     plein, encre ivoire, mesuré à 10,7. */
  .rond.bon {
    background: var(--ok);
    color: var(--verriere-ivoire);
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
    /* Les capitales de la publicite. Elles sont posees par le style, pas
       ecrites dans le texte : un lecteur d'ecran prononce alors « Mes
       diagnostics » et non « M E S ». */
    text-transform: uppercase;
  }

  .ligne-titre {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--e2);
  }

  .ligne-titre .intitule {
    margin-bottom: var(--e3);
  }

  .tout-voir {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    margin-top: calc(var(--e5) - var(--e3));
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--sur-fond-doux);
    font-size: var(--t-lead);
    line-height: 1;
    cursor: pointer;
  }

  .tout-voir:hover {
    background: var(--trait-fin);
    color: var(--sur-fond);
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
    /*
     * Quatre colonnes EGALES, comme sur la publicite.
     *
     * `1fr` seul vaut `minmax(auto, 1fr)` : une colonne ne descend jamais sous
     * la largeur de son contenu. Un libelle un peu long -- « Assainissement »,
     * « Electricite » -- elargissait donc sa colonne aux depens des autres.
     * Mesure a 390 px : 86 px pour la premiere, 78,7 px pour les trois
     * suivantes. Les icones ne tombaient pas sur une trame reguliere, et cela
     * se voit sur une grille d'applications, ou l'oeil attend un pas constant.
     *
     * `minmax(0, 1fr)` autorise la colonne a se serrer : les quatre sont alors
     * strictement egales, et c'est le texte qui passe a la ligne.
     */
    grid-template-columns: repeat(4, minmax(0, 1fr));
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
      justify-content: start;
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
    /*
     * LE SQUIRCLE D'iOS, PAS UN COIN ARRONDI.
     *
     * Un `border-radius` classique raccorde le coin par un quart de cercle :
     * la courbure y saute d'un coup, et l'oeil le voit -- c'est ce qui donne
     * aux carres arrondis du web leur air de bouton, quand ceux d'iOS ont l'air
     * d'objets. La superellipse, elle, entre et sort de la courbe
     * progressivement.
     *
     * `border-radius: 28% / 28%` en pourcentage approche cette continuite bien
     * mieux qu'une valeur en pixels, et elle suit la taille de l'icone : la
     * meme forme a 76 px et a 44 px.
     */
    border-radius: 28%;
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
    /*
     * L'OMBRE A TROIS COUCHES, comme un objet pose.
     *
     * Une ombre unique aplatit : elle dit « il y a quelque chose dessous »
     * sans dire a quelle hauteur. Trois couches donnent la distance --
     * c'est ce que fait iOS, et c'est ce que montre la publicite.
     *
     *  1. le contact : courte, dense, juste sous l'objet ;
     *  2. la portee : longue, diffuse, qui pose l'objet dans la page ;
     *  3. l'arete eclairee, a l'interieur, en haut : la lumiere tombe d'en
     *     haut et le bord superieur la recoit.
     */
    box-shadow:
      0 2px 4px rgb(10 43 35 / 22%),
      0 12px 24px -6px rgb(10 43 35 / 30%),
      inset 0 1.5px rgb(255 255 255 / 58%);
    transition:
      transform 0.34s cubic-bezier(0.34, 1.4, 0.5, 1),
      box-shadow 0.34s cubic-bezier(0.34, 1.4, 0.5, 1);
  }

  /*
   * LE BOMBE : la face n'est pas plate.
   *
   * Sur la publicite, chaque icone est une pastille bombee -- la couleur y est
   * plus claire en haut, plus dense en bas, et une lumiere glisse sur la
   * moitie superieure. C'est ce degrade-la qui fait « premium » ; sans lui,
   * une couleur pleine reste une vignette.
   *
   * Le fond colore de l'app est pose en `background` par le style en ligne :
   * ce voile se superpose SANS le remplacer, ce qui laisse chaque app libre de
   * sa teinte.
   */
  .icone::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background:
      radial-gradient(120% 80% at 50% -18%, rgb(255 255 255 / 46%) 0%, transparent 62%),
      linear-gradient(180deg, rgb(255 255 255 / 16%) 0%, transparent 46%, rgb(0 0 0 / 16%) 100%);
    pointer-events: none;
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
    /* Le glissement de lumiere, en diagonale : il croise le bombe et donne
       a la face sa courbure. Deux gradients, pas un -- l'un porte le volume,
       l'autre l'eclat. */
    background: linear-gradient(128deg, rgb(255 255 255 / 26%) 0%, transparent 54%);
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
  /* Elle s'ouvre, donc elle se touche : le curseur ne dit plus le contraire. */
  .tuile.eteinte {
    cursor: pointer;
  }

  /*
   * LA BOTTOM SHEET DU DIAGNOSTIC ABSENT.
   *
   * Elle remonte du bas, s'arrête avant le haut de l'écran et laisse voir la
   * grille derrière : on n'a pas quitté l'accueil, on a ouvert un tiroir. Un
   * écran plein aurait fait croire à un huitième diagnostic.
   */
  .feuille-absent {
    position: fixed;
    z-index: 41;
    left: 0;
    right: 0;
    bottom: 0;
    top: auto;
    width: 100%;
    max-width: 100%;
    padding: 0;
    border: none;
    max-height: 86vh;
    overflow-y: auto;
    background: var(--fond);
    border-radius: var(--rayon-grand, 20px) var(--rayon-grand, 20px) 0 0;
    /* L'ordre de mission interdit les ombres noires génériques : celle-ci
       était du noir pur. Le vert profond du produit fait le même travail sans
       poser de voile gris sur la teinte qu'il recouvre. */
    box-shadow:
      0 -2px 6px rgb(10 43 35 / 12%),
      0 -14px 40px -6px rgb(10 43 35 / 34%);
    animation: remonte 0.26s var(--courbe);

    /* La barre système d'un téléphone mange le bas de l'écran : sans cette
       réserve, le bouton de fermeture passe dessous. */
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  /* Une poignée, comme sur toutes les feuilles d'iOS : elle dit « ça se tire »
     avant qu'on ait lu quoi que ce soit. */
  .feuille-absent::before {
    content: '';
    display: block;
    width: 38px;
    height: 4px;
    margin: 8px auto 0;
    border-radius: 2px;
    background: var(--trait);
  }

  @keyframes remonte {
    from {
      transform: translateY(14%);
      opacity: 0;
    }
  }

  /* Le fond du `<dialog>` : c'est `::backdrop`, pas un element a nous. */
  .feuille-absent::backdrop {
    background: rgb(0 0 0 / 46%);
  }

  @media (prefers-reduced-motion: reduce) {
    .feuille-absent {
      animation: none;
    }
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
  /* Au survol l'objet se leve : l'ombre de contact s'ecarte, la portee
     s'allonge et s'adoucit. C'est la meme lumiere, vue de plus pres. */
  .tuile:not(.eteinte):hover .icone,
  .tuile:not(.eteinte):focus-visible .icone {
    transform: translateY(-3px) scale(1.04);
    box-shadow:
      0 4px 8px rgb(10 43 35 / 20%),
      0 20px 34px -8px rgb(10 43 35 / 34%),
      inset 0 1.5px rgb(255 255 255 / 68%);
  }

  /* A l'appui, l'objet s'enfonce : l'ombre se resserre sous lui. Sur un
     telephone, c'est le seul retour qu'on ait. */
  .tuile:not(.eteinte):active .icone {
    transform: translateY(0) scale(0.97);
    box-shadow:
      0 1px 2px rgb(10 43 35 / 26%),
      0 4px 10px -4px rgb(10 43 35 / 24%),
      inset 0 1px rgb(255 255 255 / 40%);
    transition-duration: 0.09s;
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
    background: var(--verriere-vert);
  }

  /* L'etat « non lu » : ni vert ni rouge, parce qu'il ne conclut rien. Un gris
     franc, assez contraste pour se voir, assez neutre pour ne pas alarmer. */
  .pastille.inconnu {
    background: var(--gris);
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
  /*
   * La barre reste en bas, comme sur le telephone de la publicite.
   *
   * Elle etait dans le flux : dernier bloc de la page, elle defilait avec le
   * contenu et disparaissait des qu'on descendait. Une barre de navigation qui
   * s'en va n'en est plus une -- et le badge des alertes, qui compte ce qu'il
   * reste a regler, n'etait visible que tout en bas, la ou on n'en a plus
   * besoin.
   *
   * `sticky` plutot que `fixed` : elle colle au bas de la fenetre pendant le
   * defilement, puis se pose a sa place naturelle en fin de page. Rien ne
   * passe dessous, aucune reserve de hauteur a maintenir a la main.
   */
  .dock {
    position: sticky;
    bottom: var(--e3);
    z-index: var(--plan-colle);
    /*
     * UNE SURFACE CLAIRE REMET L'ENCRE À L'ENDROIT.
     *
     * Le bureau porte désormais une encre claire, faite pour son fond vert.
     * Toute surface blanche posée dessus en hérite — et le texte disparaît :
     * mesuré à 1,08 sur les trois chiffres de la synthèse et 1,13 sur les noms
     * du dock, là où il en faut 4,5.
     *
     * C'est le piège que le commentaire du bureau annonçait déjà. Il ne suffit
     * pas de l'écrire : chaque surface claire doit rétablir les jetons, sinon
     * la règle ne vaut que jusqu'à la prochaine carte ajoutée.
     */
    --sur-fond: #0a2b23;
    --sur-fond-doux: #4a5a55;
    --encre: #0a2b23;
    --encre-doux: #4a5a55;
    --gris: #58775f;
    --trait: #779596;
    --trait-fin: #dfe6db;
    --action-texte: #a33220;
    color: var(--encre);

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
