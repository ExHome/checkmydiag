<script module lang="ts">
  import type { Gravite } from '../../lib/modele';

  /**
   * Une catégorie de matériaux couverte par le repérage.
   *
   * Un repérage amiante ne parcourt pas des pièces : il contrôle des listes de
   * matériaux définies en annexe du code de la santé publique — A, B, C. C'est
   * ce que `analyserAmiante` dépose dans `schema.zones`, et c'est donc ça qu'on
   * dessine. Le type est volontairement plus étroit que celui du modèle : le
   * `detail` de chaque liste existe déjà sous le plan, il n'a pas à être répété.
   */
  export interface ZoneAmiante {
    nom: string;
    etat: Gravite;
  }
</script>

<script lang="ts">
  /**
   * Le champ d'observation du repérage amiante — les cristaux de la maquette.
   *
   * ── Ce qu'on reprend de la maquette ─────────────────────────────────────────
   *
   * `CHECKMYDIAG_APP.html`, cas 'amiante' : une boîte sombre en dégradé radial
   * (#1E1B3A → #0B0A18), des hexagones violets pointe en haut
   * (linear-gradient 135°, #8B7BF0 → #6A5ACD) qui scintillent en cascade — 130 ms
   * de décalage l'un sur l'autre, cycle de 2,6 s — et un filet violet qui balaie
   * la boîte de haut en bas et retour en 3,2 s. Sous la boîte, une ligne à deux
   * bouts : le compte à gauche, la conclusion à droite. Tout est là.
   *
   * ── Ce qu'on ne reprend pas, et pourquoi ────────────────────────────────────
   *
   * Ses quinze hexagones, son « 15 prélèvements » et son « 100 % négatifs ».
   * Aucun rapport ne produit ce chiffre : le moteur ne lit ni nombre de
   * prélèvements ni laboratoire. Ce qu'il lit, ce sont les catégories de
   * matériaux que le repérage a couvertes — une, deux, trois — et ce qu'il
   * conclut sur chacune. Un cristal par catégorie lue : le champ est moins dense
   * que la maquette, mais chaque cristal est vrai. C'est le seul écart de fond,
   * et il n'est pas négociable.
   *
   * ── Trois états, pas deux ───────────────────────────────────────────────────
   *
   * La quasi-totalité des repérages ne trouvent rien. L'absence doit donc se
   * lire aussi bien que la présence, et sans dramatiser : le cristal violet
   * calme de la maquette dit « regardé, rien relevé », le jaune dit « repéré »
   * (c'est la gravité que le moteur retient — présent n'est pas dangereux), et
   * le cristal évidé dit « le rapport couvre cette catégorie mais ne lui attache
   * pas de conclusion ». Quand rien n'a pu être lu, le champ ne se remplit pas
   * d'un vert rassurant : il le dit.
   *
   * ── Pourquoi le voile plutôt que l'opacité ──────────────────────────────────
   *
   * La maquette fait scintiller les hexagones en faisant varier LEUR opacité
   * (0,22 → 0,72). Ici les cristaux portent une marque : à 0,22 d'opacité, cette
   * marque tombe sous le seuil de contraste au creux de chaque cycle. Le cristal
   * reste donc à pleine opacité et c'est un voile blanc posé dessus qui pulse.
   * À l'œil le scintillement est le même ; mesuré, il ne fait que RELEVER le
   * contraste au lieu de le détruire (3,63 au repos → 5,27 au sommet).
   */
  const { gravite, zones }: { gravite: Gravite; zones: ZoneAmiante[] | null } = $props();

  /* Les identifiants de dégradé sont globaux au document : deux instances sur
     la même page se voleraient leurs couleurs. */
  const uid = $props.id();

  /** Ce que le rapport a permis d'établir. Trois issues, jamais deux. */
  type Lecture = 'absente' | 'reperee' | 'nonLue';

  function lire(g: Gravite): Lecture {
    if (g === 'bon') return 'absente';
    if (g === 'attention' || g === 'alerte') return 'reperee';
    return 'nonLue';
  }

  const etat = $derived(lire(gravite));

  /** Le mot posé sous chaque cristal. Court : il tient sous un hexagone. */
  const MOT: Record<Lecture, string> = {
    absente: 'rien relevé',
    reperee: 'amiante repérée',
    nonLue: 'sans verdict'
  };

  /** Le mot du champ entier, à droite de la ligne du bas. */
  const VERDICT: Record<Lecture, string> = {
    absente: 'Aucun matériau amianté repéré',
    reperee: 'Matériaux amiantés repérés',
    nonLue: 'Conclusion non lue'
  };

  /**
   * La réserve, sous la ligne du bas.
   *
   * Un champ rassurant sans réserve laisse croire que le logement a été fouillé.
   * Ces phrases ne disent rien du logement : elles disent ce que le document est,
   * ou ce qu'il reste à faire au lecteur.
   */
  const RESERVE: Record<Lecture, string> = {
    absente: 'Le repérage ne porte que sur les parties accessibles, sans rien démonter.',
    reperee:
      'Reportez-vous au rapport : c’est lui qui donne, matériau par matériau, l’état relevé et ce qu’il impose.',
    nonLue: 'La conclusion n’a pas pu être lue automatiquement : reportez-vous au rapport.'
  };

  /**
   * Un cristal par catégorie lue.
   *
   * Aucune catégorie lue ne veut pas dire aucun cristal : le rapport conclut
   * peut-être sans détailler ses listes. Dans ce cas, un seul cristal porte la
   * conclusion d'ensemble — et si elle non plus n'a pas été lue, il reste évidé.
   */
  const cristaux = $derived(
    zones && zones.length > 0
      ? zones.map((z, i) => ({
          cle: `${i}-${z.nom}`,
          nom: z.nom,
          court: z.nom.length > 14 ? `${z.nom.slice(0, 13)}…` : z.nom,
          etat: lire(z.etat)
        }))
      : [{ cle: 'ensemble', nom: 'Le repérage', court: 'Le repérage', etat }]
  );

  /*
   * « Couvertes », et pas « contrôlées ».
   *
   * Le moteur distingue les listes dont il a lu la conclusion de celles que le
   * rapport se contente de citer — pour ces dernières, son propre commentaire
   * dit « cette catégorie fait partie de ce que le repérage a couvert », rien de
   * plus. Le compte reprend ce mot-là, pas un plus affirmatif.
   */
  const compte = $derived(
    zones && zones.length > 0
      ? `${zones.length} catégorie${zones.length > 1 ? 's' : ''} de matériaux couverte${
          zones.length > 1 ? 's' : ''
        }`
      : 'Repérage amiante'
  );

  /* L'hexagone de la maquette : clip-path polygon(50% 0, 100% 25%, 100% 75%,
     50% 100%, 0 75%, 0 25%) sur une boîte CARRÉE (aspect-ratio:1), exprimé
     autour de son centre pour un côté de 64. */
  const HEX = '0,-32 32,-16 32,16 0,32 -32,16 -32,-16';

  const LARGEUR = 336;
  const PAS_X = 104;
  const PAS_Y = 118;
  const PAR_RANGEE = 3;

  const rangees = $derived(Math.ceil(cristaux.length / PAR_RANGEE));
  const hauteur = $derived(121 + (rangees - 1) * PAS_Y);

  /** Chaque rangée est centrée, y compris la dernière quand elle est incomplète. */
  function centre(i: number, total: number): { x: number; y: number } {
    const rang = Math.floor(i / PAR_RANGEE);
    const debut = rang * PAR_RANGEE;
    const largeur = Math.min(PAR_RANGEE, total - debut);
    const colonne = i - debut;
    return {
      x: LARGEUR / 2 + (colonne - (largeur - 1) / 2) * PAS_X,
      y: 44 + rang * PAS_Y
    };
  }

  function remplissage(l: Lecture): string {
    if (l === 'absente') return `url(#${uid}-violet)`;
    if (l === 'reperee') return `url(#${uid}-repere)`;
    /* Évidé : le rapport a regardé là, il n'en tire pas de conclusion. Une
       couleur pleine, quelle qu'elle soit, en affirmerait une. */
    return 'rgb(255 255 255 / 10%)';
  }

  /* Le dessin porte de l'information : il lui faut son équivalent en texte. La
     ligne du bas est du vrai texte, elle n'a pas à être répétée ici. */
  const description = $derived(
    `Champ d’observation du repérage amiante. ${cristaux
      .map((c) => `${c.nom} : ${MOT[c.etat]}.`)
      .join(' ')}`
  );
</script>

<figure>
  <p class="etiquette">Ce que le repérage a couvert</p>

  <div class="scope">
    <svg viewBox="0 0 {LARGEUR} {hauteur}" role="img" aria-label={description}>
      <defs>
        <linearGradient id="{uid}-violet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="var(--cristal-clair)" />
          <stop offset="100%" stop-color="var(--cristal-fonce)" />
        </linearGradient>
        <linearGradient id="{uid}-repere" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="var(--cristal-repere)" />
          <stop offset="100%" stop-color="var(--cristal-repere-fonce)" />
        </linearGradient>
        <linearGradient id="{uid}-balai" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="var(--cristal-clair)" stop-opacity="0" />
          <stop offset="50%" stop-color="var(--cristal-clair)" stop-opacity="0.8" />
          <stop offset="100%" stop-color="var(--cristal-clair)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Le balayage du microscope. Décoratif : il ne dit rien du rapport, et
           il s'éteint entièrement si l'utilisateur refuse les animations. -->
      <rect
        class="balayage"
        aria-hidden="true"
        x="0"
        y="10"
        width={LARGEUR}
        height="2"
        fill="url(#{uid}-balai)"
        style="--course: {hauteur - 24}px"
      />

      {#each cristaux as c, i (c.cle)}
        {@const p = centre(i, cristaux.length)}
        <g style="--retard: {i * 130}ms">
          <g transform="translate({p.x} {p.y})">
            <polygon
              points={HEX}
              class="pierre"
              class:nonLue={c.etat === 'nonLue'}
              fill={remplissage(c.etat)}
            />

            <!-- Le voile qui scintille. Il éclaircit le cristal, donc il ne peut
                 que renforcer le contraste de la marque posée dessus. -->
            <polygon points={HEX} class="voile" aria-hidden="true" />

            {#if c.etat === 'absente'}
              <path d="M-12 0 L-4 9 L12 -9" class="marque" />
            {:else if c.etat === 'reperee'}
              <path d="M0 -13 L0 3" class="marque" />
              <circle cx="0" cy="10" r="2.2" class="marque-pleine" />
            {:else}
              <text class="marque-vide" x="0" y="0" dy="0.36em">?</text>
            {/if}
          </g>

          <text class="nom" x={p.x} y={p.y + 52}>{c.court}</text>
          <text
            class="mot"
            class:absente={c.etat === 'absente'}
            class:reperee={c.etat === 'reperee'}
            x={p.x}
            y={p.y + 69}>{MOT[c.etat]}</text
          >
        </g>
      {/each}
    </svg>
  </div>

  <figcaption>
    <p class="ligne">
      <span class="compte">{compte}</span>
      <span class="etat" class:absente={etat === 'absente'} class:reperee={etat === 'reperee'}
        >{VERDICT[etat]}</span
      >
    </p>
    <p class="reserve">{RESERVE[etat]}</p>
  </figcaption>
</figure>

<style>
  figure {
    margin: 0;
  }

  /*
   * Hors de la boîte, le composant s'habille des jetons du design system.
   *
   * `--sur-fond-doux`, `--ok`, `--attention` sont déjà retraduits par l'univers
   * de l'écran (`Diagnostics.svelte`, règle `.dedans`) : sur l'écran amiante,
   * `--sur-fond-doux` vaut #5A5580, mesuré à 6,90 sur le blanc de `.dessin` et
   * 5,71 sur le sable. Les couleurs d'état, elles, ne suivent JAMAIS l'univers —
   * c'est la doctrine du fichier, et elle vaut ici comme ailleurs.
   */
  .etiquette {
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  /*
   * La boîte du microscope, sombre quel que soit l'écran autour.
   *
   * Les deux maquettes concordent : la boîte est sombre, y compris posée sur le
   * sable. Ses couleurs ne peuvent donc pas venir des jetons — ceux-ci sont
   * mesurés pour le sable et le blanc de l'univers amiante, et un gris qui passe
   * sur le sable disparaît sur du #1E1B3A. Toutes les valeurs ci-dessous sont
   * mesurées sur le point le plus CLAIR du dégradé (#1E1B3A), le pire cas, et
   * non sur sa moyenne.
   */
  .scope {
    /* Les deux violets de la maquette, tels quels. */
    --cristal-clair: #8b7bf0; /* 4,83 sur la boîte */
    --cristal-fonce: #6a5acd;

    /*
     * Le jaune que le produit emploie déjà quand le fond est sombre
     * (`.dedans.sombre` et `body.demarrage`) : #8A5A05, l'attention des fonds
     * clairs, ne tient que 2,72 ici et disparaîtrait. Son second ton de dégradé
     * est assombri dans la même teinte, comme `univers.ts` le fait partout.
     */
    --cristal-repere: #ffd54a; /* 11,50 sur la boîte */
    --cristal-repere-fonce: #e5aa00; /* 7,87 */

    --scope-encre: #ffffff; /* 16,39 */
    --scope-doux: #a9a6c9; /* 7,00 */
    /* Le « bon » des fonds sombres du produit (`.dedans.sombre`), repris tel
       quel plutôt qu'un vert de plus : la charte n'en compte pas. */
    --scope-ok: #cfe3ea; /* 12,35 */
    --scope-sombre: #0b0a18; /* l'encre des marques : 3,63 au pire sur le violet */

    padding: var(--e5);
    border-radius: var(--rayon);
    background: radial-gradient(circle at 50% 45%, #1e1b3a, #0b0a18);
    overflow: hidden;
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
    max-width: 420px;
    margin-inline: auto;
  }

  .pierre.nonLue {
    stroke: rgb(255 255 255 / 45%); /* 4,33 sur la boîte */
    stroke-width: 1.6;
    stroke-dasharray: 5 4;
  }

  .marque {
    fill: none;
    stroke: var(--scope-sombre);
    stroke-width: 3.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .marque-pleine {
    fill: var(--scope-sombre);
  }

  .marque-vide {
    fill: var(--scope-encre); /* 12,47 sur le cristal évidé */
    font-size: var(--t-lead);
    font-weight: 800;
    text-anchor: middle;
  }

  .nom {
    fill: var(--scope-encre);
    font-size: var(--t-micro);
    font-weight: 700;
    text-anchor: middle;
  }

  .mot {
    fill: var(--scope-doux);
    font-size: var(--t-micro);
    font-weight: 600;
    text-anchor: middle;
  }

  .mot.absente {
    fill: var(--scope-ok);
  }

  .mot.reperee {
    fill: var(--cristal-repere);
  }

  /* La ligne à deux bouts sous la boîte, comme dans la maquette — mais sur le
     fond clair de la fiche, donc aux couleurs d'état du produit. */
  .ligne {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--e2);
    margin: var(--e3) 0 0;
    font-size: var(--t-micro);
  }

  .compte {
    color: var(--sur-fond-doux);
  }

  .etat {
    font-weight: 700;
    color: var(--sur-fond-doux);
  }

  .etat.absente {
    color: var(--ok); /* 9,30 sur le blanc de la fiche */
  }

  .etat.reperee {
    color: var(--attention); /* 6,03 */
  }

  .reserve {
    margin: var(--e2) 0 0;
    font-size: var(--t-micro);
    line-height: 1.5;
    color: var(--sur-fond-doux);
  }

  /*
   * Le mouvement, aux deux durées de la maquette.
   *
   * Rien qui force une remise en page : le voile pulse en `opacity`, le filet se
   * déplace en `transform`. Et aucune animation ne conditionne l'affichage — pas
   * de `fill-mode` qui retienne un élément sur une image de départ invisible.
   * C'est le piège que `app.css` documente en toutes lettres.
   */
  .voile {
    fill: #ffffff;
    opacity: 0;
    animation: scintiller 2.6s ease-in-out infinite;
    animation-delay: var(--retard);
    pointer-events: none;
  }

  @keyframes scintiller {
    0%,
    100% {
      opacity: 0.02;
    }

    50% {
      opacity: 0.18;
    }
  }

  .balayage {
    opacity: 0;
    animation: balayer 3.2s ease-in-out infinite;
  }

  @keyframes balayer {
    0%,
    100% {
      opacity: 0;
      transform: translateY(0);
    }

    12%,
    88% {
      opacity: 1;
    }

    50% {
      transform: translateY(var(--course, 90px));
    }
  }

  /*
   * Aucune animation quand l'utilisateur les refuse. Svelte ne l'applique pas
   * tout seul aux règles écrites à la main. L'état de repos est l'état LU : les
   * cristaux sont pleinement visibles, le voile et le filet sont éteints.
   */
  @media (prefers-reduced-motion: reduce) {
    .voile,
    .balayage {
      animation: none;
    }
  }
</style>
