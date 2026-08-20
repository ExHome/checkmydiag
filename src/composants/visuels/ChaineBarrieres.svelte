<script lang="ts">
  /**
   * CE QUI VOUS SÉPARE DU COURANT.
   *
   * ── La question à laquelle cet écran répond ────────────────────────────────
   *
   * « Est-ce que ça peut me faire mal ? » — et non « combien d'anomalies »,
   * qui est la question du diagnostiqueur. L'électricité est le seul volet du
   * dossier où le danger est immédiat et physique pour celui qui habite :
   * l'amiante se compte en décennies, le DPE en euros, l'ERP en probabilités.
   *
   * ── Pourquoi une chaîne, et pas une liste ─────────────────────────────────
   *
   * Les six domaines de l'arrêté ne sont pas six cases à cocher : ce sont des
   * BARRIÈRES SUCCESSIVES entre le courant et la main. Le différentiel existe
   * parce que l'isolement peut lâcher ; la terre existe parce que le
   * différentiel a besoin d'un chemin. C'est une défense en profondeur, et
   * c'est ce que dit le métier.
   *
   * Une liste à puces perd cette dépendance. Le dessin la montre : le trait du
   * courant part de l'arrivée et s'arrête à la première barrière qui le retient.
   *
   * ── Ce que ce composant remplace ──────────────────────────────────────────
   *
   * Le coffret à manettes. Il passait trois paragraphes de commentaire à
   * expliquer que ce n'était PAS le tableau du logement, puis l'écrivait sous
   * le dessin : « un module par point de contrôle de la norme, pas par
   * circuit ». Un dessin qui doit se démentir lui-même coûte plus qu'il ne
   * rapporte — il faisait croire qu'on avait compté les circuits.
   *
   * ── La règle qui commande tout ────────────────────────────────────────────
   *
   * Une information non trouvée n'est JAMAIS transformée en information
   * rassurante. D'où l'état « non essayée », dessiné en creux, qui survit à une
   * bonne nouvelle : quand le rapport écrit qu'un essai n'a pas pu être fait,
   * la barrière n'est pas fermée, même si la conclusion est bonne.
   */
  import { TITRE, type Mecanisme } from '../../lib/analyse/mecanisme';

  /** L'état d'une barrière, adossé à une donnée lue — jamais déduit. */
  export type EtatBarriere =
    /** Une anomalie du rapport s'y rattache. */
    | 'percee'
    /** Relevée, mais le rapport note une mesure compensatoire. */
    | 'rattrapee'
    /** L'essai n'a pas pu être fait : le rapport dit pourquoi. */
    | 'nonEssayee'
    /** Le contrôle a porté dessus et n'a rien signalé. */
    | 'rienSignale'
    /** La conclusion n'a pas pu être lue : on n'affirme rien. */
    | 'nonLue';

  export interface Barriere {
    mecanisme: Mecanisme;
    etat: EtatBarriere;
    /** Combien d'anomalies du rapport tombent sur cette barrière. */
    nombre?: number;
    /** Le motif de l'empêchement, dans les mots du rapport. */
    motif?: string;
  }

  const {
    barrieres,
    surTouche = null
  }: {
    barrieres: Barriere[];
    surTouche?: ((mecanisme: Mecanisme) => void) | null;
  } = $props();

  /* Le mot d'état, écrit. La couleur ne porte jamais seule une information. */
  const MOT: Record<EtatBarriere, string> = {
    percee: 'Anomalie',
    rattrapee: 'Rattrapé',
    nonEssayee: 'Non essayé',
    rienSignale: 'Rien signalé',
    nonLue: 'Non lu'
  };

  /**
   * Le courant s'arrête à la première barrière qui le retient.
   *
   * Une barrière percée le laisse passer ; une barrière rattrapée le retient —
   * c'est le sens même de la mesure compensatoire, et la seule façon de ne
   * contredire ni le constat ni la conclusion, qui disent vrai tous les deux.
   *
   * Une barrière non essayée ne retient rien : on ne sait pas si elle tient.
   */
  const vaJusqua = $derived.by(() => {
    const i = barrieres.findIndex((b) => b.etat === 'rattrapee' || b.etat === 'rienSignale');
    return i === -1 ? barrieres.length : i;
  });

  /** La brèche à mettre en avant : la plus proche de la main. */
  const brecheFocale = $derived.by(() => {
    for (let i = barrieres.length - 1; i >= 0; i--) {
      if (barrieres[i]?.etat === 'percee') return i;
    }
    return -1;
  });
</script>

<figure class="chaine">
  <figcaption class="intitule">Ce qui vous sépare du courant</figcaption>

  <ol class="barrieres">
    {#each barrieres as b, i (b.mecanisme)}
      <li class="barriere {b.etat}" class:focale={i === brecheFocale} class:franchie={i < vaJusqua}>
        <button
          type="button"
          onclick={() => surTouche?.(b.mecanisme)}
          disabled={!surTouche}
          aria-label="{TITRE[b.mecanisme]} — {MOT[b.etat]}"
        >
          <!-- Le segment de courant qui mène à cette barrière. Il n'est vif que
               s'il est atteint : ce n'est pas une décoration, c'est le trajet. -->
          <span class="fil" aria-hidden="true"></span>

          <span class="porte" aria-hidden="true">
            <span class="battant"></span>
            {#if b.nombre && b.nombre > 1}
              <span class="compte">{b.nombre}</span>
            {/if}
          </span>

          <span class="nom">{TITRE[b.mecanisme]}</span>
          <span class="etat">{MOT[b.etat]}</span>
        </button>
      </li>
    {/each}

    <!-- La main : ce que la chaîne protège. Elle n'est pas un contrôle. -->
    <li class="main" aria-hidden="true">
      <span class="fil" class:atteint={vaJusqua >= barrieres.length}></span>
      <svg viewBox="0 0 24 24" class="doigt">
        <path
          d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v4.5a5.5 5.5 0 0 1-5.5 5.5H11a5 5 0 0 1-4.3-2.5L4 14a1.6 1.6 0 0 1 2.7-1.7L9 15"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </li>
  </ol>

  <!--
    LA RÉSERVE, TOUJOURS, ET SOUS LE DESSIN.

    Le schéma aligne six barrières : il affirme une exhaustivité et une
    profondeur de contrôle qu'il n'a pas. C'est à lui de le démentir, pas à un
    paragraphe trois écrans plus bas.
  -->
  <p class="reserve">Six points de sécurité, contrôlés à vue&nbsp;: rien n’a été démonté.</p>
</figure>

<style>
  .chaine {
    margin: 0;
  }

  .intitule {
    margin: 0 0 var(--e4);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    /* Mesuré 4,36 avec `--sur-fond-doux` sur l'univers électricité, le plus
       clair des onze : sous le seuil. n3 est le niveau des mentions du
       rapport, et il tient sur les onze. */
    color: var(--n3, var(--sur-fond-doux));
  }

  /* La chaîne descend : sur un téléphone, six barrières en ligne donneraient
     six cibles de 40 px de large. En colonne, chacune fait toute la largeur. */
  .barrieres {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0;
  }

  .barriere button {
    position: relative;
    width: 100%;
    min-height: 52px;
    display: grid;
    grid-template-columns: 34px 1fr auto;
    align-items: center;
    gap: var(--e3);
    padding: 6px 10px 6px 0;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .barriere button:disabled {
    cursor: default;
  }

  .barriere button:focus-visible {
    outline: 2px solid var(--sur-fond);
    outline-offset: -2px;
    border-radius: 10px;
  }

  /*
   * LE FIL — le trajet du courant.
   *
   * Il descend derrière les barrières et s'éteint à la première qui le retient.
   * Sa couleur ne dit pas la gravité : elle dit « il y a du courant ici ».
   */
  .fil {
    position: absolute;
    left: 16px;
    top: 0;
    bottom: 50%;
    width: 2px;
    background: var(--trait-inconnu);
    opacity: 0.35;
  }

  .barriere.franchie .fil,
  .barriere.percee .fil {
    background: var(--alerte);
    opacity: 1;
  }

  /*
   * LA PORTE — fermée, percée, ou en creux.
   *
   * La FORME porte l'état avant la couleur : un carré plein retient, un carré
   * fendu laisse passer, un contour tireté n'a pas été essayé. Un daltonien lit
   * les trois, et une capture en noir et blanc aussi.
   */
  .porte {
    position: relative;
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    justify-self: start;
  }

  .battant {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    border: 2px solid var(--sur-fond-doux);
    background: color-mix(in srgb, var(--sur-fond) 12%, transparent);
  }

  /* Rien signalé : la porte est pleine, ton sobre. Jamais « conforme » — le
     rapport ne l'écrit pas. */
  .barriere.rienSignale .battant {
    border-color: var(--ok);
    background: color-mix(in srgb, var(--ok) 26%, transparent);
  }

  /* Percée : le battant est fendu en deux. C'est la brèche. */
  .barriere.percee .battant {
    border-color: var(--alerte);
    background: linear-gradient(
      to bottom,
      var(--alerte) 0 38%,
      transparent 38% 62%,
      var(--alerte) 62% 100%
    );
  }

  /* Rattrapée : fendue elle aussi — le constat existe — mais cerclée d'un
     second trait qui retient. Le rapport dit les deux, le dessin aussi. */
  .barriere.rattrapee .battant {
    border-color: var(--attention);
    background: linear-gradient(
      to bottom,
      var(--attention) 0 38%,
      transparent 38% 62%,
      var(--attention) 62% 100%
    );
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--ok) 70%, transparent);
  }

  /* Non essayée : contour tireté, jamais fermé. Le seul état qui survit à une
     bonne nouvelle — et c'est tout l'enjeu de « non trouvé ≠ non ». */
  .barriere.nonEssayee .battant {
    border-style: dashed;
    border-color: var(--attention);
    background: none;
  }

  .barriere.nonLue .battant {
    border-style: dashed;
    border-color: var(--trait-inconnu);
    background: none;
  }

  /* Le compte, quand plusieurs anomalies tombent sur la même barrière. Deux
     enveloppes détériorées ne doivent pas se lire comme deux dangers. */
  .compte {
    position: absolute;
    right: -2px;
    top: -2px;
    min-width: 17px;
    height: 17px;
    padding: 0 4px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: var(--alerte);
    color: var(--sur-accent, #fff);
    font-size: 11px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .nom {
    font-size: var(--t-petit);
    font-weight: 600;
    color: var(--sur-fond);
  }

  /* La brèche la plus proche de la main est le point focal unique de l'écran. */
  .barriere.focale .nom {
    font-weight: 800;
    color: var(--n1, var(--sur-fond));
  }

  .etat {
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--n3, var(--sur-fond-doux));
  }

  /*
   * LE MOT D'ÉTAT NE PREND PAS LA COULEUR DE GRAVITÉ.
   *
   * « Anomalie » en `--alerte` mesurait 3,91 sur l'univers de l'électricité :
   * sous le seuil, et c'est le mot le plus important de la chaîne.
   *
   * Les couleurs de gravité sont calées pour des ÉLÉMENTS GRAPHIQUES, dont le
   * seuil est 3:1 — elles tiennent parfaitement sur la porte, qui est un
   * dessin. Sur du texte, elles ne tiennent pas.
   *
   * Le mot passe donc à l'encre pleine et prend la graisse : il dit « Anomalie »
   * en toutes lettres, la porte fendue et sa couleur le répètent. La règle est
   * respectée dans le bon sens — la couleur renforce le mot, elle ne le porte
   * pas.
   */
  .barriere.percee .etat {
    color: var(--n2, var(--sur-fond));
    font-weight: 800;
  }

  .barriere.nonEssayee .etat,
  .barriere.rattrapee .etat {
    color: var(--n2, var(--sur-fond));
    font-weight: 800;
  }

  /* La main, en bout de chaîne. */
  .main {
    position: relative;
    min-height: 44px;
    display: grid;
    grid-template-columns: 34px 1fr;
    align-items: center;
    gap: var(--e3);
    color: var(--sur-fond-doux);
  }

  .main .fil.atteint {
    background: var(--alerte);
    opacity: 1;
  }

  .doigt {
    width: 26px;
    height: 26px;
    justify-self: start;
    margin-left: 4px;
  }

  .reserve {
    margin: var(--e3) 0 0;
    font-size: var(--t-micro);
    line-height: 1.5;
    color: var(--n3, var(--sur-fond-doux));
    max-width: var(--mesure);
  }
</style>
