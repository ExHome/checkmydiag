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
    surOuvrirDiagnostic?.(type, origineDe(bouton.querySelector('.icone')));
  }

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
          <span class="icone" style="background: {t.degrade}">
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

  <nav class="dock" aria-label="Les parties du dossier">
    {#each DOCK as d (d.cle)}
      <button type="button" onclick={() => surVue?.(d.cle)}>
        <span class="signe" aria-hidden="true">{d.signe}</span>
        <span class="nom">{d.nom}</span>
      </button>
    {/each}
  </nav>
</section>

<style>
  .bureau {
    margin-bottom: var(--e6);
  }

  /* ---- Le cartouche ------------------------------------------------------
     Blanc sur le sable, largement arrondi, une ombre douce : il flotte
     au-dessus du fond sans l'écraser. */
  .cartouche {
    background: var(--papier);
    border: 1px solid var(--surface-bord);
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

  .principal {
    background: var(--coral-fonce);
    border: 1px solid var(--coral-fonce);
    color: #fff;
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
  .dock {
    margin-top: var(--e5);
    display: flex;
    justify-content: center;
    gap: var(--e5);
    padding: var(--e3);
    border-radius: 24px;
    background: rgb(255 255 255 / 70%);
    backdrop-filter: blur(20px);
    border: 1px solid rgb(255 255 255 / 60%);
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
