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
  import { compterLeDossier, origineDe, phraseDuDossier, type Origine } from '../lib/bureau';
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

  /** L'adresse, si le rapport la porte. Sinon la ligne disparaît. */
  const lieu = $derived([analyse.bien.adresse, analyse.bien.commune].filter(Boolean).join(' · '));

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

  /**
   * La phrase du cartouche.
   *
   * Elle ne chiffre ni travaux ni délai : ces montants-là ne sont dans aucun
   * rapport de diagnostic, et les afficher reviendrait à les inventer. Elle dit
   * ce que le dossier établit, et laisse le devis à l'artisan.
   */
  const phrase = $derived(phraseDuDossier(compte));

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
      signe: '📖',
      dit: 'Le lexique',
      degrade: 'linear-gradient(135deg, #8e9bb5, #5c6b8a)'
    },
    {
      cle: 'en-clair',
      nom: 'En clair',
      signe: '❓',
      dit: 'Les réponses',
      degrade: 'linear-gradient(135deg, #b58ea9, #8a5c7d)'
    }
  ];

  /** Dicodiag s'ouvre par-dessus ; « En clair » est un vrai lien de site. */
  let dicodiagOuvert = $state(false);

  /** Les trois parties du dossier, en bas de l'écran comme sur un téléphone. */
  const DOCK = [
    { cle: 'point', signe: '📋', nom: 'L’analyse' },
    { cle: 'rapport', signe: '📄', nom: 'Le rapport' },
    { cle: 'conseil', signe: '💡', nom: 'Le conseil' }
  ];
</script>

<section class="bureau" aria-label="Votre dossier en un coup d’œil">
  <!-- Le cartouche : ce qu'on lit sans rien ouvrir. -->
  <article class="cartouche">
    <header class="tete">
      <span class="sceau" aria-hidden="true">🏠</span>
      <div class="qui">
        <h2>{titre}</h2>
        {#if lieu}<p class="lieu">{lieu}</p>{/if}
      </div>
      {#if lettre}
        <span class="lettre" style="background: {TEINTE_DPE[lettre] ?? 'var(--petrole)'}">
          {lettre}
        </span>
      {/if}
    </header>

    <div class="compteurs">
      <div class="compteur">
        <strong>{compte.aRegler}</strong>
        <span>À régler</span>
      </div>
      <div class="compteur">
        <strong>{compte.aVerifier}</strong>
        <span>À vérifier</span>
      </div>
      <div class="compteur">
        <strong>{compte.pourInformation}</strong>
        <span>Pour information</span>
      </div>
    </div>

    <p class="phrase">{phrase}</p>

    <div class="actions">
      <button type="button" class="principal" onclick={() => surVue?.('point')}>
        Voir le détail
      </button>
      <button type="button" class="second" onclick={() => window.print()}>Imprimer</button>
    </div>
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
          <span class="icone halo" style="background: {t.degrade}">
            <span class="signe" aria-hidden="true">{t.signe}</span>
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
            <span class="icone halo" style="background: {o.degrade}">
              <span class="signe" aria-hidden="true">{o.signe}</span>
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
            <span class="icone halo" style="background: {o.degrade}">
              <span class="signe" aria-hidden="true">{o.signe}</span>
            </span>
            <span class="nom">{o.nom}</span>
            <span class="dit">{o.dit}</span>
          </button>
        {/if}
      </li>
    {/each}
  </ul>

  <nav class="dock" aria-label="Les parties du dossier">
    {#each DOCK as d (d.cle)}
      <button type="button" onclick={() => { auToucher(); surVue?.(d.cle); }}>
        <span class="signe halo" aria-hidden="true">{d.signe}</span>
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
    background: var(--petrole);
    color: var(--sable);
    /* Le bas s'arrondit : la page continue en dessous, et un aplat coupé net
       ressemblerait à un défaut de rendu plutôt qu'à un panneau. */
    border-end-start-radius: 28px;
    border-end-end-radius: 28px;

    --sur-fond: #f5f1e8;
    --sur-fond-doux: #d8ccbc;
    --encre: #f5f1e8;
    --encre-doux: #d8ccbc;
    --gris: #d8ccbc;
    --surface: rgb(244 232 216 / 6%);
    --surface-forte: rgb(244 232 216 / 10%);
    --surface-bord: rgb(244 232 216 / 20%);
    --trait: rgb(244 232 216 / 22%);
    --trait-fin: rgb(244 232 216 / 12%);
    --coral-texte: #ffb3aa;
  }

  /* ---- Le cartouche ------------------------------------------------------
     Blanc sur le pétrole, cerné de corail.

     Le corail est au POURTOUR, pas au fond : l'encart reste une surface de
     lecture — trois chiffres, une phrase, deux boutons — et le filet suffit à
     le désigner comme le bloc de la marque. Un aplat corail aurait obligé à
     réécrire toute son encre en pétrole foncé, seule couleur qui s'y lit
     (4,38 ; le blanc y tombe à 2,80), pour un gain d'attention qui n'était pas
     demandé.

     Il remet les jetons à l'endroit pour lui-même : sa surface est claire, et
     le texte sable de l'écran y tomberait à 1,07. */
  .cartouche {
    --sur-fond: #1a4d5c;
    --sur-fond-doux: #555555;
    --encre: #1a4d5c;
    --encre-doux: #555555;
    --gris: #666666;
    --surface: rgb(26 77 92 / 3%);
    --surface-forte: rgb(26 77 92 / 6%);
    --surface-bord: rgb(26 77 92 / 10%);
    --trait: #e8dcc8;
    --trait-fin: #f0eae0;
    --coral-texte: #a33220;
    color: var(--petrole);

    background: var(--papier);
    border: 2px solid var(--coral);
    border-radius: var(--rayon-large);
    padding: var(--e4);
    box-shadow: var(--ombre-forte);
  }

  .tete {
    display: flex;
    align-items: center;
    gap: var(--e2);
    margin-bottom: var(--e3);
  }

  .sceau {
    width: 40px;
    height: 40px;
    flex: none;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--coral), var(--coral-fonce));
    display: grid;
    place-items: center;
    font-size: 20px;
  }

  .qui {
    flex: 1;
    min-width: 0;
  }

  .tete h2 {
    margin: 0;
    font-size: var(--t-lead);
    font-weight: 700;
    color: var(--sur-fond);
    line-height: 1.2;
  }

  .lieu {
    margin: 2px 0 0;
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* La lettre du DPE : la couleur est celle de l'arrêté, l'encre reste noire
     dessus — sur un jaune réglementaire, du blanc ne se lit pas. */
  .lettre {
    flex: none;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: var(--t-lead);
    color: #1c1c1c;
  }

  /* ---- Les trois compteurs ---------------------------------------------- */
  .compteurs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--e2);
    margin-bottom: var(--e3);
  }

  .compteur {
    background: var(--papier);
    border: 1px solid var(--trait-fin);
    border-radius: var(--rayon-badge);
    padding: var(--e2);
    text-align: center;
  }

  .compteur strong {
    display: block;
    font-size: var(--t-titre);
    font-weight: 700;
    color: var(--sur-fond);
    line-height: 1.1;
  }

  .compteur span {
    display: block;
    margin-top: 2px;
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
    line-height: 1.2;
  }

  .phrase {
    background: var(--surface);
    border-radius: var(--rayon);
    padding: var(--e3);
    margin: 0 0 var(--e3);
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond);
  }

  .actions {
    display: flex;
    gap: var(--e2);
  }

  .actions button {
    flex: 1;
    min-height: 44px;
    border-radius: var(--rayon-badge);
    font-size: var(--t-petit);
    font-weight: 700;
    cursor: pointer;
    transition: transform var(--duree) var(--courbe), background var(--duree) var(--courbe);
  }

  /* Le bouton reste corail, sur le blanc de l'encart : c'est l'action de la
     marque, et le corail foncé y porte du blanc à 4,72. */
  .principal {
    background: var(--coral-fonce);
    border: 1px solid var(--coral-fonce);
    color: var(--sur-coral);
  }

  .principal:hover {
    background: var(--coral-texte);
    transform: translateY(-2px);
  }

  .second {
    background: transparent;
    border: 1px solid var(--coral-fonce);
    color: var(--coral-texte);
  }

  .second:hover {
    background: var(--or-pale);
    transform: translateY(-2px);
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
     * Un filet, puis l'ombre.
     *
     * Mesuré sur le sable : les nuances claires de la palette n'atteignent que
     * 1,5 à 2,2 de contraste avec le fond — l'icône bavait dans la page. Le
     * filet intérieur lui rend une limite nette sans toucher à sa couleur.
     * C'est exactement ce que fait iOS de ses icônes claires.
     */
    box-shadow:
      inset 0 0 0 1px rgb(15 58 71 / 22%),
      0 4px 12px rgb(26 77 92 / 18%);
    transition: transform var(--duree) var(--courbe), box-shadow var(--duree) var(--courbe);
  }

  /* Le voile iOS : une lumière en haut à gauche, qui donne le relief. */
  .icone::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, rgb(255 255 255 / 20%) 0%, transparent 60%);
    pointer-events: none;
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
    box-shadow: inset 0 0 0 1px rgb(15 58 71 / 14%);
  }

  .tuile.eteinte .nom,
  .tuile.eteinte .dit {
    opacity: 0.55;
  }

  .tuile.eteinte .pastille {
    filter: none;
    opacity: 1;
  }

  .tuile:not(.eteinte):hover .icone,
  .tuile:not(.eteinte):focus-visible .icone {
    transform: scale(1.05);
    box-shadow:
      inset 0 0 0 1px rgb(15 58 71 / 30%),
      0 6px 18px rgb(26 77 92 / 26%);
  }

  /*
   * Le halo s'allume au survol de la TUILE, pas de l'icône seule.
   *
   * On vise le carré coloré, mais la zone qu'on touche est le bouton entier,
   * nom compris. Une lueur qui n'apparaît qu'en passant exactement sur l'icône
   * raterait la moitié des gestes — et sur un téléphone, il n'y a pas de survol
   * du tout : c'est l'appui qui compte, et il porte sur le bouton.
   */
  .tuile:not(.eteinte):hover .icone::after,
  .tuile:not(.eteinte):focus-visible .icone::after {
    opacity: 1;
    transform: scale(1);
  }

  .tuile:not(.eteinte):active .icone::after {
    opacity: 1;
    transform: scale(0.99);
    transition-duration: 0.06s;
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
   * corail à 32 % se perd — c'est le même piège que le dock blanc, une couleur
   * translucide ne vaut que par ce qu'il y a dessous.
   */
  .bureau {
    --lueur: rgb(255 107 93 / 85%);
    --lueur-large: rgb(255 107 93 / 45%);
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
  .dock {
    margin-top: var(--e5);
    display: flex;
    justify-content: center;
    gap: var(--e5);
    padding: var(--e3);
    border-radius: 24px;
    background: rgb(15 58 71 / 55%);
    backdrop-filter: blur(20px);
    border: 1px solid rgb(244 232 216 / 16%);
    box-shadow: var(--ombre-lourde);
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
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    font-size: 24px;
    background: linear-gradient(135deg, var(--sable-clair), var(--sable));
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
    .actions button {
      transition: none;
    }

    .tuile:hover .icone,
    .dock button:hover .signe,
    .actions button:hover {
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
