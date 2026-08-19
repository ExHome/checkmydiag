<script lang="ts">
  /**
   * Trois surfaces pour un même logement, et pourquoi les chiffres diffèrent.
   *
   * Un acheteur lit trois nombres dans son dossier — la superficie Carrez de
   * l'acte, la surface habitable du bail, la surface de référence du DPE — et
   * aucun ne coïncide. Le rapport ne l'explique nulle part, et un tableau de
   * définitions ne suffit pas : les règles sont abstraites, les différences
   * portent sur des pièces concrètes.
   *
   * ── Ce que le schéma montre, et qu'un tableau ne montre pas ─────────────────
   *
   * Le MÊME logement, mesuré trois fois. On bascule d'une mesure à l'autre et
   * les pièces changent de camp sous les yeux : la véranda chauffée compte en
   * Carrez, sort de l'habitable, revient au DPE ; le grenier fait le chemin
   * inverse ; la cave reste toujours dehors. C'est ce mouvement qui fait
   * comprendre, pas la liste des règles.
   *
   * Trois camps différents, donc trois totaux différents pour un seul logement
   * — c'est exactement la situation que l'acheteur a sous les yeux.
   *
   * ── Ce qu'il ne fait pas ───────────────────────────────────────────────────
   *
   * Il ne chiffre rien. Les surfaces dessinées sont celles d'un logement
   * d'illustration, pas du logement lu — c'est un schéma d'explication, et il
   * le dit. Le produit ne met des mètres carrés que là où le rapport en donne.
   *
   * Sources, lues au texte le 16/08/2026 : article R. 156-1 du code de la
   * construction (surface habitable), article 46 de la loi du 10 juillet 1965
   * (Carrez), arrêté du 25 mars 2024 (surface de référence, en vigueur au
   * 1ᵉʳ juillet 2024).
   */

  type Mesure = 'carrez' | 'habitable' | 'reference';

  interface Piece {
    nom: string;
    /** Position dans la coupe, en unités du viewBox. */
    x: number;
    y: number;
    l: number;
    h: number;
    /** Ce que chaque mesure fait de cette pièce. */
    dans: Record<Mesure, boolean>;
    /** Pourquoi elle compte, ou pourquoi elle ne compte pas. */
    note: string;
  }

  const PIECES: Piece[] = [
    {
      nom: 'Séjour',
      x: 12,
      y: 96,
      l: 96,
      h: 54,
      dans: { carrez: true, habitable: true, reference: true },
      note: 'Une pièce de vie close, couverte, chauffée et de plus d’1,80 m : elle compte dans les trois mesures.'
    },
    {
      nom: 'Chambre',
      x: 12,
      y: 40,
      l: 66,
      h: 50,
      dans: { carrez: true, habitable: true, reference: true },
      note: 'Même chose : rien ne l’écarte d’aucune des trois mesures.'
    },
    {
      nom: 'Grenier',
      x: 84,
      y: 40,
      l: 60,
      h: 50,
      dans: { carrez: true, habitable: false, reference: false },
      note: 'Comble non aménagé, sous toiture, plus d’1,80 m et pas chauffé : il compte en Carrez, la surface habitable l’écarte, le DPE aussi faute de chauffage. Sous 1,80 m, il sortirait des trois.'
    },
    {
      nom: 'Véranda',
      x: 114,
      y: 96,
      l: 54,
      h: 54,
      dans: { carrez: true, habitable: false, reference: true },
      note: 'Close et couverte, elle compte en Carrez. La surface habitable l’exclut nommément. Le DPE la reprend si elle est chauffée.'
    },
    {
      nom: 'Balcon',
      x: 174,
      y: 96,
      l: 32,
      h: 54,
      dans: { carrez: false, habitable: false, reference: false },
      note: 'Ni clos ni couvert : hors de toutes les mesures.'
    },
    {
      nom: 'Cave',
      x: 12,
      y: 156,
      l: 96,
      h: 40,
      dans: { carrez: false, habitable: false, reference: false },
      note: 'Exclue des trois, chacune pour ses propres raisons.'
    },
    {
      nom: 'Garage',
      x: 114,
      y: 156,
      l: 92,
      h: 40,
      dans: { carrez: false, habitable: false, reference: false },
      note: 'Un garage n’est pas un local d’habitation : les trois mesures l’écartent.'
    }
  ];

  const MESURES: { cle: Mesure; nom: string; ou: string; texte: string }[] = [
    {
      cle: 'carrez',
      nom: 'Loi Carrez',
      ou: 'dans l’acte de vente',
      texte:
        'La superficie privative d’un lot de copropriété : les planchers des locaux clos et couverts, hors murs, cloisons, escaliers, gaines et embrasures. Rien sous 1,80 m, et pas les lots de moins de 8 m².'
    },
    {
      cle: 'habitable',
      nom: 'Surface habitable',
      ou: 'dans le bail',
      texte:
        'La même déduction des murs et cloisons, mais une liste d’exclusions plus longue : combles non aménagés, caves, garages, terrasses, loggias, balcons — et les vérandas, nommément.'
    },
    {
      cle: 'reference',
      nom: 'Surface de référence',
      ou: 'dans le DPE, depuis juillet 2024',
      texte:
        'La surface habitable, augmentée de ce qui est CHAUFFÉ : vérandas chauffées, locaux chauffés d’au moins 1,80 m. Le DPE mesure ce qu’il faut chauffer — avant juillet 2024, il employait la surface habitable, et jamais la Carrez.'
    }
  ];

  let mesure = $state<Mesure>('carrez');

  const active = $derived(MESURES.find((m) => m.cle === mesure) ?? MESURES[0]!);
  const comptees = $derived(PIECES.filter((p) => p.dans[mesure]));

  /** La pièce dont on veut la raison, s'il y en a une à donner. */
  let ouverte = $state<string | null>(null);
</script>

<figure class="trois-surfaces">
  <figcaption>
    Trois mesures, un seul logement. Touchez une pièce pour savoir pourquoi elle
    compte — ou pourquoi elle ne compte pas.
  </figcaption>

  <div class="onglets" role="group" aria-label="Choisir la mesure">
    {#each MESURES as m (m.cle)}
      <button
        type="button"
        class="onglet"
        class:actif={mesure === m.cle}
        aria-pressed={mesure === m.cle}
        onclick={() => {
          mesure = m.cle;
          ouverte = null;
        }}
      >
        <span class="nom">{m.nom}</span>
        <span class="ou">{m.ou}</span>
      </button>
    {/each}
  </div>

  <svg viewBox="0 0 218 208" class="coupe" role="img" aria-label={`Coupe d’un logement : ${comptees.map((p) => p.nom).join(', ')} comptent dans la mesure ${active.nom}`}>
    <defs>
      <!--
        LA MATIERE DU BATI.

        Le dessin etait fait de rectangles nus poses sur un trait : une coupe
        d'architecte sans mur, sans dalle, sans toit. Ce qui suit lui rend son
        epaisseur -- c'est ce qui separe un schema d'un croquis.
      -->

      <!-- Le remplissage d'une piece COMPTEE : un degrade de sa couleur, plus
           dense en bas, comme un volume eclaire par le haut. -->
      <linearGradient id="ts-dedans" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="currentColor" stop-opacity="0.30" />
        <stop offset="1" stop-color="currentColor" stop-opacity="0.13" />
      </linearGradient>

      <!-- La hachure des volumes qui NE comptent pas : un vide bati, pas une
           case grise. C'est la convention du dessin technique. -->
      <pattern id="ts-hachure" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" stroke-width="1" stroke-opacity="0.22" />
      </pattern>

      <!-- La maconnerie coupee : le poche du mur et de la dalle. -->
      <pattern id="ts-poche" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" stroke-width="1.6" stroke-opacity="0.5" />
      </pattern>

      <!-- L'ombre portee sous les volumes : le relief, pas l'effet. -->
      <filter id="ts-relief" x="-25%" y="-25%" width="150%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.4" flood-color="#000" flood-opacity="0.34" />
      </filter>
    </defs>

    <!-- ── L'ENVELOPPE DU BATIMENT ────────────────────────────────────────
         Le toit d'abord, puis les murs, puis la dalle : on dessine le bati
         avant d'y poser les pieces, comme sur une coupe. -->
    <g class="bati" aria-hidden="true">
      <!-- La toiture : deux pans et leur epaisseur. -->
      <path class="rampant" d="M4 40 L109 6 L214 40" />
      <path class="rampant-mince" d="M9 40 L109 12 L209 40" />

      <!-- Les deux murs porteurs, en poche. -->
      <rect class="poche" x="4" y="40" width="6" height="160" />
      <rect class="poche" x="208" y="40" width="6" height="160" />

      <!-- Le plancher haut, entre les niveaux. -->
      <rect class="poche" x="4" y="90" width="210" height="5" />

      <!-- La dalle basse et le terrain. -->
      <rect class="poche" x="4" y="196" width="210" height="6" />
      <line class="sol" x1="0" y1="204" x2="218" y2="204" />
      <line class="terrain" x1="0" y1="204" x2="218" y2="204" />
    </g>

    {#each PIECES as p (p.nom)}
      {@const dedans = p.dans[mesure]}
      <g
        class="piece"
        class:dedans
        class:ouverte={ouverte === p.nom}
        onclick={() => (ouverte = ouverte === p.nom ? null : p.nom)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            ouverte = ouverte === p.nom ? null : p.nom;
          }
        }}
        role="button"
        tabindex="0"
        aria-label={`${p.nom} : ${dedans ? 'compte' : 'ne compte pas'}. Pourquoi ?`}
      >
        <!-- Le volume : hachure quand il ne compte pas, degrade plein quand
             il compte. La couleur vient de l'univers, jamais du dessin. -->
        <rect class="volume" x={p.x} y={p.y} width={p.l} height={p.h} rx="3" />
        <!-- Le liseré haut : la lumiere tombe d'en haut, l'arete la recoit. -->
        <line class="arete" x1={p.x + 3} y1={p.y + 0.8} x2={p.x + p.l - 3} y2={p.y + 0.8} />
        <text x={p.x + p.l / 2} y={p.y + p.h / 2 + 4} class="nom-piece">{p.nom}</text>
      </g>
    {/each}
  </svg>

  <p class="regle">{active.texte}</p>

  {#if ouverte}
    {@const p = PIECES.find((x) => x.nom === ouverte)}
    {#if p}
      <p class="pourquoi" role="status">
        <strong>{p.nom} — {p.dans[mesure] ? 'compte' : 'ne compte pas'} ici.</strong>
        {p.note}
      </p>
    {/if}
  {/if}

  <!--
    La même information en toutes lettres.

    Un schéma qui ne se lit qu'à l'œil laisse dehors ceux qui naviguent au
    clavier ou à la voix — et ce sont souvent les mêmes qui ont le plus besoin
    qu'on leur explique un dossier.
  -->
  <ul class="en-clair">
    {#each PIECES as p (p.nom)}
      <li class:dedans={p.dans[mesure]}>
        <span class="marque" aria-hidden="true">{p.dans[mesure] ? '✓' : '—'}</span>
        {p.nom} : {p.dans[mesure] ? 'compte' : 'ne compte pas'}
      </li>
    {/each}
  </ul>
</figure>

<style>
  .trois-surfaces {
    margin: var(--e4) 0;
    padding: var(--e4);
    background: var(--papier);
    border: 1px solid var(--trait);
    border-radius: var(--rayon);
  }

  figcaption {
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond-doux);
    margin-bottom: var(--e3);
  }

  /* ---- Le choix de la mesure ---------------------------------------------- */
  .onglets {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: var(--e1);
    margin-bottom: var(--e3);
  }

  .onglet {
    display: grid;
    gap: 1px;
    min-height: 44px;
    padding: var(--e2);
    background: var(--surface);
    border: 1px solid var(--trait);
    border-radius: var(--rayon-badge);
    color: var(--sur-fond);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .onglet .nom {
    font-size: var(--t-petit);
    font-weight: 700;
  }

  .onglet .ou {
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
  }

  .onglet.actif {
    background: var(--action-forte);
    border-color: var(--action-forte);
    color: var(--sur-accent, #fff);
  }

  .onglet.actif .ou {
    color: inherit;
    opacity: 0.85;
  }

  /* ---- La coupe ------------------------------------------------------------ */
  .coupe {
    display: block;
    width: 100%;
    max-width: 420px;
    margin: 0 auto var(--e3);
    height: auto;
  }

  .sol {
    stroke: var(--trait);
    stroke-width: 2;
  }

  /*
   * Une pièce hors mesure n'est pas absente : elle existe, on la visite, elle
   * ne compte simplement pas. Elle reste donc dessinée, en creux — la faire
   * disparaître ferait croire qu'elle n'est pas là.
   */
  /*
   * L'enveloppe : toit, murs porteurs, planchers.
   *
   * Le `color` de ce groupe porte la teinte de l'univers ; les motifs de
   * hachure et de poche s'y rattachent par `currentColor`, si bien que le bati
   * change de couleur avec l'app sans qu'un seul motif soit duplique.
   */
  .bati {
    color: var(--action-forte);
  }

  /*
   * On dit RAMPANT, pas toit -- et ce n'est pas qu'un mot.
   *
   * La silhouette de maison de Verriere vit dans une seule brique
   * (`briques/Maison.svelte`), et un test interdit qu'un schema la redessine
   * sous les noms `.toit` ou `.facade` : trois schemas avaient fini par porter
   * trois maisons differentes.
   *
   * Ce dessin-ci n'est pas une maison vue de dehors, c'est une COUPE : on y
   * voit les rampants coupes, les murs en poche, les planchers. Le vocabulaire
   * du dessin technique est donc le bon, et il evite du meme coup de rentrer en
   * concurrence avec la brique.
   */
  .rampant {
    fill: none;
    stroke: var(--action-forte);
    stroke-width: 3;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  /* La seconde ligne de toiture donne son epaisseur au rampant : une couverture
     a une epaisseur, un trait n'en a pas. */
  .rampant-mince {
    fill: none;
    stroke: var(--action-forte);
    stroke-width: 1;
    stroke-opacity: 0.45;
    stroke-linejoin: round;
  }

  /* Le poche : la maconnerie coupee, hachuree comme sur un plan. */
  .poche {
    fill: url(#ts-poche);
    stroke: var(--action-forte);
    stroke-width: 0.8;
    stroke-opacity: 0.55;
  }

  .terrain {
    stroke: var(--action-forte);
    stroke-width: 3;
    stroke-opacity: 0.35;
  }

  /*
   * Une piece hors mesure n'est pas absente : elle existe, on la visite, elle
   * ne compte simplement pas. Elle reste donc dessinee, HACHUREE -- un volume
   * bati qu'on ne compte pas, ce qui est la convention du dessin technique,
   * plutot qu'une case grise qui la ferait passer pour vide.
   */
  .piece .volume {
    fill: url(#ts-hachure);
    stroke: var(--trait);
    stroke-width: 1.5;
    color: var(--sur-fond);
    transition:
      fill var(--duree) var(--courbe),
      stroke var(--duree) var(--courbe);
  }

  /* Comptee : un degrade de la couleur de l'app, plus dense en bas, et un
     relief porte. Le volume se leve au lieu de s'aplatir. */
  .piece.dedans .volume {
    fill: url(#ts-dedans);
    stroke: var(--action-forte);
    stroke-width: 2;
    color: var(--action-forte);
    filter: url(#ts-relief);
  }

  /* L'arete eclairee, sur les seules pieces comptees : c'est elle qui donne
     le sens de la lumiere, et donc le volume. */
  .arete {
    stroke: transparent;
    stroke-width: 1.5;
    stroke-linecap: round;
  }

  .piece.dedans .arete {
    stroke: var(--surface);
    stroke-opacity: 0.6;
  }

  .nom-piece {
    font-size: 8px;
    font-weight: 600;
    text-anchor: middle;
    fill: var(--sur-fond);
    pointer-events: none;
  }

  /* Le nom reste sur l'encre du texte : le degrade est translucide, le fond
     de l'univers transparait dessous. Poser ici l'encre de l'accent plein
     donnerait un mot sombre sur un fond sombre. */
  .piece.dedans .nom-piece {
    fill: var(--sur-fond);
    font-weight: 700;
  }

  .piece[role='button'] {
    cursor: pointer;
  }

  .piece[role='button']:hover .volume,
  .piece[role='button']:focus-visible .volume {
    stroke-width: 3;
  }

  .piece[role='button']:focus-visible {
    outline: 2px solid var(--action-forte);
    outline-offset: 2px;
  }

  .piece.ouverte rect {
    stroke-width: 3;
  }

  /* ---- Le texte ------------------------------------------------------------ */
  .regle {
    margin: 0 0 var(--e2);
    font-size: var(--t-petit);
    line-height: 1.55;
    color: var(--sur-fond);
  }

  .pourquoi {
    margin: 0 0 var(--e2);
    padding: var(--e2) var(--e3);
    background: var(--surface);
    border-left: 3px solid var(--action-forte);
    border-radius: 0 var(--rayon-petit) var(--rayon-petit) 0;
    font-size: var(--t-petit);
    line-height: 1.55;
  }

  .en-clair {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 2px var(--e3);
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
  }

  .en-clair li.dedans {
    color: var(--sur-fond);
    font-weight: 600;
  }

  .marque {
    display: inline-block;
    width: 1em;
  }

  @media (prefers-reduced-motion: reduce) {
    .piece rect {
      transition: none;
    }
  }

  /* À l'impression, les trois mesures d'un coup : on ne clique pas sur du
     papier, et un schéma figé sur un seul onglet perdrait les deux autres. */
  @media print {
    .onglets,
    .coupe,
    .pourquoi {
      display: none;
    }
  }
</style>
