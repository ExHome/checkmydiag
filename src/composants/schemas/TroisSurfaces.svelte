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
    <!-- Le sol, pour poser la coupe. -->
    <line x1="6" y1="200" x2="212" y2="200" class="sol" />

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
        <rect x={p.x} y={p.y} width={p.l} height={p.h} rx="3" />
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
  .piece rect {
    fill: var(--surface);
    stroke: var(--trait);
    stroke-width: 1.5;
    transition: fill var(--duree) var(--courbe);
  }

  .piece.dedans rect {
    fill: var(--action-forte);
    stroke: var(--action-forte);
  }

  .nom-piece {
    font-size: 8px;
    font-weight: 600;
    text-anchor: middle;
    fill: var(--sur-fond);
    pointer-events: none;
  }

  .piece.dedans .nom-piece {
    fill: var(--sur-accent, #fff);
  }

  .piece[role='button'] {
    cursor: pointer;
  }

  .piece[role='button']:hover rect,
  .piece[role='button']:focus-visible rect {
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
