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
    etat = null
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
    <text {x} y={y + 4} dx={dx} class="etiquette" text-anchor={cote === 'droite' ? 'start' : 'end'}>
      {texte}
    </text>
  </g>
{/if}

<style>
  .clip {
    cursor: pointer;
  }

  .prise {
    fill: transparent;
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
    animation: respire 3.2s ease-in-out infinite;
  }

  .clip.actif .halo {
    animation: none;
    opacity: 0.22;
  }

  @keyframes respire {
    0%,
    72%,
    100% {
      opacity: 0;
      scale: 0.7;
    }
    86% {
      opacity: 0.2;
      scale: 1;
    }
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
    font-size: var(--t-petit);
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
