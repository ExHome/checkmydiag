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
   * reste donc à pleine opacité et c'est un voile de crème posé dessus qui pulse.
   * À l'œil le scintillement est le même ; mesuré, il RELÈVE le contraste des
   * marques sombres au lieu de le détruire (3,61 au repos → 4,79 au sommet, pour
   * un seuil de 3).
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
    /*
     * Évidé : le rapport a regardé là, il n'en tire pas de conclusion. Une
     * couleur pleine, quelle qu'elle soit, en affirmerait une.
     *
     * Ce voile de crème ne pèse que 1,32 contre la boîte : il ne PORTE pas
     * l'information, et il n'a pas à la porter. Ce qui la porte, c'est le bord
     * pointillé (4,01) et le « ? » (6,57 au pire du scintillement) — tous deux
     * au-dessus de leur seuil. Un aplat à 3:1 ici remplirait le cristal, c'est-
     * à-dire dirait quelque chose.
     *
     * La crème est celle de la charte (`--u-texte`), écrite à la main : ceci
     * part dans un attribut de présentation SVG, où `var()` n'est pas substitué.
     */
    if (l === 'absente') return `url(#${uid}-violet)`;
    if (l === 'reperee') return `url(#${uid}-repere)`;
    return 'rgb(245 241 232 / 10%)';
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

          <!-- L'ECART SUIT LA TAILLE. 52 puis 69, soit 17 unites, etait cale
               pour une police de 12 ; a 16,5 les deux lignes se recouvraient de
               4 px, mesure a l'ecran. 52 puis 74 : 22 unites. -->
          <text class="nom" x={p.x} y={p.y + 52}>{c.court}</text>
          <text
            class="mot"
            class:absente={c.etat === 'absente'}
            class:reperee={c.etat === 'reperee'}
            x={p.x}
            y={p.y + 74}>{MOT[c.etat]}</text
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
   * de l'écran (`Diagnostics.svelte`, règle `.dedans`) : rien n'est à corriger
   * ici pour le passage au pétrole, c'est le rôle même de ces jetons. Sur
   * l'écran amiante, `--sur-fond-doux` vaut désormais #CBD8DD, mesuré à 6,16
   * sur le #2B4D61 de `.dessin` — l'ancienne mesure, 6,90 sur du blanc, ne
   * décrivait plus rien.
   *
   * Les couleurs d'état, elles, ne suivent JAMAIS l'univers — c'est la doctrine
   * du fichier, et elle vaut ici comme ailleurs.
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
   * La boîte du microscope : le seul endroit du produit plus sombre que sa page.
   *
   * Elle l'était déjà quand la page était sable — les deux maquettes concordent
   * là-dessus. Le basculement vers le pétrole ne lui retire donc rien : elle
   * passe d'un trou dans du clair à un puits dans du sombre. Mesurée contre le
   * #2B4D61 de `.dessin`, elle s'en détache de 2,18 : assez pour se lire comme
   * un creux, pas assez pour découper un rectangle noir dans l'écran. Ni son
   * dégradé ni ses deux violets ne bougent, ce sont des valeurs de maquette.
   *
   * CE QUI CHANGE, c'est d'où viennent ses ENCRES. Elles étaient littérales
   * parce qu'aucun jeton n'était sûr sur un fond aussi sombre : ils étaient
   * calculés pour le sable et le blanc. Le produit ayant basculé, les jetons de
   * l'univers SONT désormais des couleurs de fond sombre, et la boîte peut s'y
   * brancher — un visuel branché suit la prochaine charte tout seul. Ce qui
   * reste littéral l'est pour une raison écrite en face.
   *
   * Toutes les mesures ci-dessous sont prises sur le point le plus CLAIR du
   * dégradé (#1E1B3A), le pire cas, et non sur sa moyenne.
   */
  .scope {
    /*
     * Le violet de la maquette et l'accent vif de l'univers amiante sont la
     * MÊME couleur, #8B7BF0 : `univers.ts` l'a relevée sur cette maquette-ci.
     * Passer par le jeton ne déplace donc pas un pixel aujourd'hui, et fait
     * suivre le cristal si la charte déplace le violet demain.
     */
    --cristal-clair: var(--u-accent-vif, #8b7bf0); /* 4,86 sur la boîte */
    /* Le second violet de la maquette. Aucun mélange de `--u-accent-vif` ne le
       reproduit — le bleu manquerait de 19 points —, il reste donc littéral, et
       c'est cette ligne qu'il faudra revoir si l'accent amiante change. */
    --cristal-fonce: #6a5acd; /* 3,11 */

    /*
     * Le jaune d'attention du produit, pris à sa variable au lieu d'être
     * recopié. `--attention` vaut #FFD54A partout depuis que les fonds sont
     * sombres : la valeur écrite ici à la main était déjà exactement celle-là.
     * Les couleurs d'état ne suivent jamais l'univers, elles suivent le
     * produit — c'est précisément ce que fait le jeton.
     */
    --cristal-repere: var(--attention, #ffd54a); /* 11,68 sur la boîte */
    --cristal-repere-fonce: #e5aa00; /* 7,92 — son ton d'ombre, sans jeton */

    /*
     * Les trois encres de la boîte, désormais branchées sur l'univers.
     *
     * La crème #F5F1E8 remplace le blanc pur : depuis le passage au pétrole, la
     * charte écrit en crème et réserve le blanc aux surfaces. 14,63 laisse toute
     * la marge nécessaire. Le gris lavande #A9A6C9 laisse la place au gris de
     * l'univers, qui est le même sur les onze écrans — un seul gris secondaire
     * dans le produit vaut mieux qu'un par dessin.
     */
    --scope-encre: var(--u-texte, #f5f1e8); /* 14,63 */
    --scope-doux: var(--u-texte-doux, #cbd8dd); /* 11,32 */
    /* Le « bon » des fonds sombres du produit, pris à sa variable plutôt que
       recopié : la charte ne compte pas de vert, et `--ok` vaut #CFE3EA. */
    --scope-ok: var(--ok, #cfe3ea); /* 12,43 */

    /*
     * L'encre posée SUR le cristal une fois qu'il est un aplat plein — mot pour
     * mot le rôle que `univers.ts` donne à `--u-sur-accent`, et qu'il calcule
     * pour tenir sur `--u-accent-vif`. Elle vaut 3,61 au pire (second violet,
     * scintillement au repos) et 8,97 sur le jaune, pour un seuil de 3.
     * L'ancien #0B0A18 mesurait 3,85 au même endroit : on cède un quart de
     * point pour que l'encre et son aplat ne puissent plus diverger.
     */
    --scope-sombre: var(--u-sur-accent, #04161c);

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
    font-size: 18px;
    font-weight: 800;
    text-anchor: middle;
  }

  /*
   * LE NOM ET L'ETAT DU CRISTAL, EN UNITES DE viewBox.
   *
   * `--t-micro` vaut 12px, et dans un SVG ces 12 sont 12 unites du viewBox. Le
   * dessin declare `viewBox="0 0 336 …"` pour 234 px affiches, soit un facteur
   * 0,7 : les deux textes sortaient a 8,4 px a l'ecran -- les plus petits de
   * toute l'application.
   *
   * 16,5 unites donnent 11,6 px. Le rapport entre les deux tailles est
   * conserve : elles etaient egales, elles le restent.
   */
  .nom {
    fill: var(--scope-encre);
    font-size: 16.5px;
    font-weight: 700;
    text-anchor: middle;
  }

  .mot {
    fill: var(--scope-doux);
    font-size: 16.5px;
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
