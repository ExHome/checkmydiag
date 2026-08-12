<script lang="ts">
  /**
   * Les termites, façon planche de manuel : on les voit, on suit leur chemin,
   * et chaque étape s'explique quand on la touche.
   *
   * Trois idées seulement — d'où ils viennent, par où ils passent, ce qu'ils
   * font au bois — parce qu'un schéma qui dit tout ne dit rien.
   */
  interface Etape {
    id: string;
    nom: string;
    texte: string;
    /** Zone cliquable. */
    zone: { x: number; y: number; w: number; h: number };
    /** Ancre de la pastille de libellé. */
    pastille: [number, number];
  }

  const ETAPES: Etape[] = [
    {
      id: 'colonie',
      nom: 'La colonie',
      texte:
        'Les termites vivent dans le sol, en colonie de plusieurs centaines de milliers d’individus. Ils ne viennent pas du logement : ils viennent du terrain, parfois de chez le voisin.',
      zone: { x: 176, y: 296, w: 150, h: 74 },
      pastille: [251, 388]
    },
    {
      id: 'chemin',
      nom: 'Le cordonnet',
      texte:
        'Ils fuient la lumière. Pour monter, ils construisent un petit tunnel de terre le long du mur — c’est le cordonnet. C’est le seul indice visible, et il est facile à manquer.',
      zone: { x: 196, y: 150, w: 40, h: 150 },
      pastille: [104, 214]
    },
    {
      id: 'bois',
      nom: 'Le bois mangé',
      texte:
        'Ils dévorent le bois de l’intérieur et laissent la surface intacte : une plinthe peut sonner creux sans qu’on voie quoi que ce soit. C’est la pomme véreuse — parfaite dehors, vide dedans.',
      zone: { x: 250, y: 96, w: 210, h: 54 },
      pastille: [404, 72]
    }
  ];

  let choisi = $state<string | null>(null);
  const detail = $derived(ETAPES.find((e) => e.id === choisi) ?? null);

  function basculer(id: string): void {
    choisi = choisi === id ? null : id;
  }

  /** Positions des termites dessinés dans le nid. */
  const NID = [
    { x: 210, y: 330, r: -12 },
    { x: 246, y: 342, r: 8 },
    { x: 282, y: 328, r: -4 },
    { x: 228, y: 356, r: 16 },
    { x: 268, y: 358, r: -18 }
  ];
</script>

<figure>
  <p class="invite muet petit">Touchez une étape du parcours.</p>

  <svg viewBox="0 0 500 410" role="group" aria-label="Coupe d’un sol et d’un mur : la colonie de termites dans la terre, le cordonnet qui remonte, et le bois attaqué de l’intérieur.">
    <defs>
      <linearGradient id="terre" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8a6224" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#5a3d12" stop-opacity="0.55" />
      </linearGradient>
      <linearGradient id="boisSain" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e3c48f" />
        <stop offset="100%" stop-color="#c9a468" />
      </linearGradient>
      <linearGradient id="murTermite" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f2f6f2" />
        <stop offset="100%" stop-color="#dde5dd" />
      </linearGradient>
      <filter id="ombreDouce" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000" flood-opacity="0.28" />
      </filter>
    </defs>

    <!-- Le sol -->
    <rect x="0" y="296" width="500" height="114" fill="url(#terre)" rx="10" />
    <path d="M0 300 Q 60 292 120 300 T 250 300 T 380 300 T 500 300" fill="none" stroke="#8a6224" stroke-width="2.5" opacity="0.6" />

    <!-- Le mur en coupe et le plancher -->
    <g filter="url(#ombreDouce)">
      <rect x="196" y="60" width="40" height="240" fill="url(#murTermite)" />
      <rect x="236" y="96" width="230" height="26" fill="url(#boisSain)" rx="3" />
      <rect x="236" y="130" width="230" height="12" fill="#e8eee8" />
    </g>

    <!-- Le bois attaqué : galeries à l'intérieur, surface intacte -->
    <g class="galeries">
      <path d="M262 110 q 14 -8 28 0 t 28 0 t 28 0" />
      <path d="M280 116 q 16 6 32 -2 t 30 2" />
      <path d="M330 106 q 18 8 36 2" />
    </g>

    <!-- Le cordonnet le long du mur -->
    <path d="M216 300 C 216 260 210 230 214 196 C 217 168 214 140 216 122" class="cordonnet" />

    <!-- Le nid -->
    {#each NID as t (t.x)}
      <g class="termite" transform="translate({t.x} {t.y}) rotate({t.r})">
        <ellipse cx="0" cy="0" rx="9" ry="4.2" fill="#f0dfb8" />
        <circle cx="-9.5" cy="0" r="3.4" fill="#c98f3c" />
        <path d="M-12.5 -2.5 l-4 -3 M-12.5 2.5 l-4 3" stroke="#c98f3c" stroke-width="1.2" stroke-linecap="round" />
        <path d="M-4 -4 l-2.5 -4 M0 -4.4 l0 -4.6 M4 -4 l2.5 -4 M-4 4 l-2.5 4 M0 4.4 l0 4.6 M4 4 l2.5 4"
              stroke="#a97a2c" stroke-width="1.2" stroke-linecap="round" />
      </g>
    {/each}

    <!-- Zones cliquables et libellés -->
    {#each ETAPES as etape (etape.id)}
      {@const actif = choisi === etape.id}
      <g
        class="cible"
        class:actif
        class:efface={choisi !== null && !actif}
        role="button"
        tabindex="0"
        aria-pressed={actif}
        aria-label={etape.nom}
        onclick={() => basculer(etape.id)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            basculer(etape.id);
          }
        }}
      >
        <rect x={etape.zone.x} y={etape.zone.y} width={etape.zone.w} height={etape.zone.h} rx="8" class="zone" />
        <g transform="translate({etape.pastille[0]} {etape.pastille[1]})">
          <rect x="-62" y="-14" width="124" height="28" rx="14" class="fond-pastille" />
          <text x="0" y="5" class="nom">{etape.nom}</text>
        </g>
      </g>
    {/each}
  </svg>

  {#if detail}
    <div class="reponse apparait">
      <p class="titre">{detail.nom}</p>
      <p>{detail.texte}</p>
      <!-- Le retour doit être évident : on ne piège jamais le lecteur dans un
           détail dont il ne sait pas comment sortir. -->
      <button type="button" class="fermer" onclick={() => (choisi = null)}>
        ← Revenir au schéma
      </button>
    </div>
  {:else}
    <figcaption class="muet petit">
      Le diagnostiqueur cherche ces indices à l’œil nu, sans rien démonter. C’est pour ça que ce
      document ne vaut que six mois.
    </figcaption>
  {/if}
</figure>

<style>
  figure {
    margin: 0;
  }

  .invite {
    margin: 0 0 4px;
  }

  svg {
    width: 100%;
    height: auto;
    max-width: 540px;
    display: block;
    margin-inline: auto;
  }

  .galeries path {
    fill: none;
    stroke: #8a5a1c;
    stroke-width: 3;
    stroke-linecap: round;
    opacity: 0.85;
  }

  .cordonnet {
    fill: none;
    stroke: #a97a2c;
    stroke-width: 7;
    stroke-linecap: round;
    stroke-dasharray: 1 11;
  }

  .cible {
    cursor: pointer;
    transition: opacity 0.25s ease;
  }

  .cible.efface {
    opacity: 0.35;
  }

  .zone {
    fill: transparent;
    stroke: transparent;
    stroke-width: 2.5;
    transition: fill 0.2s ease, stroke 0.2s ease;
  }

  .cible:hover .zone,
  .cible:focus-visible .zone,
  .cible.actif .zone {
    fill: rgb(201 143 60 / 18%);
    stroke: #c98f3c;
  }

  .fond-pastille {
    fill: var(--papier);
    stroke: var(--trait);
    stroke-width: 1;
    transition: fill 0.2s ease, stroke 0.2s ease;
  }

  .cible.actif .fond-pastille {
    fill: #3a2a10;
    stroke: #c98f3c;
  }

  .nom {
    font-size: 13px;
    font-weight: 700;
    fill: var(--encre);
    text-anchor: middle;
  }

  .reponse {
    margin-top: 12px;
    padding: 16px 20px;
    background: rgb(201 143 60 / 12%);
    border-left: 4px solid #c98f3c;
    border-radius: var(--rayon-petit);
  }

  .reponse .titre {
    margin: 0 0 4px;
    font-weight: 800;
    color: #d9a34d;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.9rem;
  }

  .reponse p:last-of-type {
    margin: 0 0 10px;
    font-size: 0.98rem;
  }

  .fermer {
    background: none;
    border: none;
    padding: 0;
    color: var(--vert-300);
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
  }

  figcaption {
    margin-top: 12px;
  }
</style>
