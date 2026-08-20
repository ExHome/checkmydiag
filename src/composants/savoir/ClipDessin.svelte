<script lang="ts">
  /**
   * Le clip posé sur un dessin : un filet part de l'élément représenté et se
   * termine par un point.
   *
   *     Fenêtre ─── ●
   *
   * À placer à l'intérieur d'un <svg>. C'est la brique du § 3 : ce qui rend un
   * schéma explorable sans le couvrir de boutons. Le point respire doucement
   * tant qu'on n'y a pas touché — c'est la seule invitation qu'on s'autorise.
   */
  import { exploration } from '../../lib/savoir/pile.svelte';
  import { notion } from '../../lib/savoir/notions';

  const {
    id,
    x,
    y,
    depuis,
    cote = 'droite',
    libelle,
    etat = null,
    valeur = null
  }: {
    id: string;
    /** Le point : l'extrémité du filet. */
    x: number;
    y: number;
    /** L'élément du dessin d'où part le filet. Sans lui, le point est seul. */
    depuis?: [number, number] | undefined;
    /** De quel côté du point s'écrit le libellé. */
    cote?: 'gauche' | 'droite';
    libelle?: string | undefined;
    /**
     * LE CHIFFRE DU RAPPORT, SOUS LE LIBELLÉ.
     *
     * Un clip ne disait que le nom d'un élément — « Chauffage », « Toiture » —,
     * donc exactement la même chose d'un dossier à l'autre. Quand le rapport
     * chiffre cet élément, le chiffre s'écrit ici, sous le nom : c'est ce qui
     * fait que le dessin parle de CE logement.
     *
     * Facultatif par construction : un élément que le rapport ne chiffre pas
     * garde son seul libellé, et n'affiche rien plutôt qu'un tiret.
     */
    valeur?: string | null;
    /**
     * Ce que le rapport déposé dit de cet élément, quand il en dit quelque
     * chose. Le point prend alors sa couleur : le lecteur voit son logement
     * avant même de cliquer (§ 12).
     */
    etat?: 'isole' | 'nonIsole' | null;
  } = $props();

  const n = $derived(notion(id));
  const texte = $derived(libelle ?? n?.terme ?? id);
  const actif = $derived(exploration.chemin.some((c) => c.id === id));

  // Le libellé se pose contre le point, du côté opposé au filet.
  const dx = $derived(cote === 'droite' ? 13 : -13);
</script>

{#if n}
  <g
    class="clip"
    class:actif
    class:isole={etat === 'isole'}
    class:non-isole={etat === 'nonIsole'}
    role="button"
    tabindex="0"
    aria-label="{texte} — en savoir plus"
    onclick={(e) => {
      // Un clip est souvent posé à l'intérieur d'une zone déjà cliquable : sans
      // ça, toucher le point ouvrirait aussi la vignette qui le porte.
      e.stopPropagation();
      exploration.ouvrir(id);
    }}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        exploration.ouvrir(id);
      }
    }}
  >
    {#if depuis}
      <path d="M{depuis[0]} {depuis[1]} L{x} {y}" class="filet" />
    {/if}

    <!-- La cible tactile : large, invisible, centrée sur le texte et le point. -->
    <rect
      x={cote === 'droite' ? x - 10 : x - 10 - texte.length * 7}
      y={y - 13}
      width={texte.length * 7 + 24}
      height="26"
      class="prise"
    />

    <circle cx={x} cy={y} r="9" class="halo" />
    <circle cx={x} cy={y} r="4.5" class="point" />
    <text
      {x}
      y={valeur ? y - 4 : y + 4}
      dx={dx}
      class="etiquette"
      text-anchor={cote === 'droite' ? 'start' : 'end'}
    >
      {texte}
    </text>
    {#if valeur}
      <!-- Le chiffre passe sous le nom, plus discret : le nom situe, le chiffre
           précise. L'écart de 19 unités suit la taille du clip — à 22 unités de
           police, deux lignes plus serrées se toucheraient. -->
      <text
        {x}
        y={y + 15}
        dx={dx}
        class="valeur"
        text-anchor={cote === 'droite' ? 'start' : 'end'}
      >
        {valeur}
      </text>
    {/if}
  </g>
{/if}

<style>
  .clip {
    cursor: pointer;
  }

  .prise {
    fill: transparent;
  }

  /* Le chiffre du rapport : même famille que le libellé, un cran en dessous en
     graisse et en opacité. Il précise, il ne concurrence pas. */
  .valeur {
    font-size: var(--t-clip, 20px);
    font-weight: 500;
    fill: var(--or);
    opacity: 0.92;
  }

  .filet {
    stroke: var(--or);
    stroke-width: 1.1;
    fill: none;
    opacity: 0.75;
  }

  .point {
    fill: var(--or-fonce);
    transition: fill 0.18s ease;
  }

  /* Le halo respire tant que la notion n'a pas été ouverte : l'invitation
     s'éteint d'elle-même une fois qu'on a compris le geste. */
  .halo {
    fill: var(--or-fonce);
    opacity: 0;
    transform-origin: center;
    transform-box: fill-box;
    /* Animation retiree : elle tournait en boucle sans rien demontrer */
  }

  .clip.actif .halo {
    animation: none;
    opacity: 0.22;
  }


  .clip:hover .halo,
  .clip:focus-visible .halo {
    animation: none;
    opacity: 0.28;
    scale: 1;
  }

  .clip:hover .point,
  .clip.actif .point {
    fill: var(--or-fonce);
  }

  /* Quand le rapport a parlé, le point prend sa couleur — et cesse d'appeler :
     l'invitation était pour l'ignorance, pas pour le constat. */
  .clip.isole .point,
  .clip.isole .halo {
    fill: var(--ok);
  }

  .clip.non-isole .point,
  .clip.non-isole .halo {
    fill: var(--alerte);
  }

  .clip.isole .filet {
    stroke: var(--ok);
  }

  .clip.non-isole .filet {
    stroke: var(--alerte);
  }

  .etiquette {
    /*
     * LA TAILLE EST EN UNITES DE viewBox, PAS EN PIXELS.
     *
     * `var(--t-petit)` vaut 14px, et dans un SVG ces 14 sont 14 unites du
     * viewBox. Ce clip est partage par des schemas en viewBox 460 et 500,
     * affiches sur 291 px : l'etiquette sortait a 8,8 px a l'ecran. Sous tout
     * seuil de lisibilite -- c'est la, plus que dans les couleurs, que se joue
     * le « trop admin ».
     *
     * 20 unites donnent 12,7 px sur les 460 et 11,6 px sur les 500. Le jeton du
     * design system ne peut pas servir ici : il est juste pour du HTML, faux
     * pour du SVG mis a l'echelle.
     *
     * La valeur se regle par `--t-clip` : c'est le viewBox de l'hote qui decide
     * de la taille apparente, donc c'est a l'hote de la donner quand il sort de
     * la famille des 460/500. Deperditions, en 562, la remonte.
     */
    font-size: var(--t-clip, 20px);
    font-weight: 700;
    fill: var(--encre);
    paint-order: stroke;
    stroke: var(--papier);
    stroke-width: 3.5;
    stroke-linejoin: round;
  }

  .clip:hover .etiquette,
  .clip.actif .etiquette {
    fill: var(--or-fonce);
  }

  .clip:focus-visible {
    outline: none;
  }

  .clip:focus-visible .etiquette {
    text-decoration: underline;
  }

  @media (prefers-reduced-motion: reduce) {
    .halo {
      animation: none;
    }
  }
</style>
