<script lang="ts">
  /**
   * Un petit dessin par notion : la surface de référence, le coût, les
   * émissions, la validité, les classes de plomb, la case cochée.
   *
   * Il s'affiche au-dessus des puces, dans le panneau de droite. Format
   * identique pour tous : large, court, deux couleurs.
   */
  const { id }: { id: string } = $props();
</script>

{#if id === 'surface'}
  <svg viewBox="0 0 300 96" role="img" aria-label="Le plan compte les pièces chauffées, pas le garage ni la cave.">
    <rect x="10" y="16" width="150" height="64" rx="4" class="dedans" />
    <path d="M78 16v64M10 50h68" class="cloison" />
    <text x="85" y="46" class="oui">chauffé</text>
    <text x="85" y="62" class="oui">= compté</text>

    <rect x="176" y="16" width="52" height="64" rx="4" class="dehors" />
    <text x="202" y="52" class="non">garage</text>
    <rect x="238" y="16" width="52" height="64" rx="4" class="dehors" />
    <text x="264" y="52" class="non">cave</text>
  </svg>
{:else if id === 'cout'}
  <svg viewBox="0 0 300 96" role="img" aria-label="Le coût compte cinq usages, pas l’électroménager.">
    {#each ['chauffage', 'eau chaude', 'clim', 'lumière', 'VMC'] as usage, i}
      <g transform="translate({8 + i * 58} 14)">
        <rect x="0" y="0" width="50" height="34" rx="8" class="dedans" />
        <text x="25" y="21" class="mini oui">{usage}</text>
      </g>
    {/each}
    {#each ['électroménager', 'télé, box'] as hors, i}
      <g transform="translate({40 + i * 130} 58)">
        <rect x="0" y="0" width="120" height="30" rx="8" class="dehors" />
        <text x="60" y="20" class="mini non">{hors}</text>
      </g>
    {/each}
  </svg>
{:else if id === 'co2'}
  <svg viewBox="0 0 300 96" role="img" aria-label="Le fioul et le gaz émettent beaucoup, l’électricité et le bois beaucoup moins.">
    {#each [{ n: 'fioul', h: 62, mal: true }, { n: 'gaz', h: 46, mal: true }, { n: 'élec', h: 20, mal: false }, { n: 'bois', h: 10, mal: false }] as e, i}
      <g transform="translate({26 + i * 68} 0)">
        <rect x="0" y={74 - e.h} width="40" height={e.h} rx="5" class={e.mal ? 'barre-mal' : 'barre-bon'} />
        <text x="20" y="90" class="mini">{e.n}</text>
      </g>
    {/each}
  </svg>
{:else if id === 'validite'}
  <svg viewBox="0 0 300 70" role="img" aria-label="Frise de validité : dix ans pour le DPE.">
    <line x1="20" y1="36" x2="280" y2="36" class="axe" />
    <rect x="20" y="26" width="200" height="20" rx="10" class="valide" />
    <rect x="220" y="26" width="60" height="20" rx="10" class="perime" />
    <text x="120" y="20" class="mini oui">valable 10 ans</text>
    <text x="250" y="20" class="mini non">périmé</text>
    <circle cx="20" cy="36" r="5" class="borne" />
    <circle cx="220" cy="36" r="5" class="borne" />
  </svg>
{:else if id === 'classes'}
  <svg viewBox="0 0 300 80" role="img" aria-label="Échelle des classes de plomb, de 0 à 3.">
    {#each [{ n: '0', t: 'pas de plomb', mal: false }, { n: '1', t: 'intacte', mal: false }, { n: '2', t: 'usée', mal: false }, { n: '3', t: 'dégradée', mal: true }] as c, i}
      <g transform="translate({10 + i * 72} 12)">
        <rect x="0" y="0" width="62" height="40" rx="8" class={c.mal ? 'dehors' : 'dedans'} />
        <text x="31" y="26" class="chiffre" class:non={c.mal}>{c.n}</text>
        <text x="31" y="62" class="mini" class:non={c.mal}>{c.t}</text>
      </g>
    {/each}
  </svg>
{:else if id === 'case'}
  <svg viewBox="0 0 300 86" role="img" aria-label="Deux phrases imprimées, une seule cochée.">
    <g>
      <rect x="14" y="14" width="20" height="20" rx="4" class="case" />
      <line x1="46" y1="24" x2="286" y2="24" class="texte-faux" />
      <line x1="46" y1="34" x2="200" y2="34" class="texte-faux" />
    </g>
    <g>
      <rect x="14" y="52" width="20" height="20" rx="4" class="case cochee" />
      <path d="M18 62 l5 5 9 -11" class="coche" />
      <line x1="46" y1="62" x2="286" y2="62" class="texte-vrai" />
      <line x1="46" y1="72" x2="240" y2="72" class="texte-vrai" />
    </g>
  </svg>
{:else if id === 'pont-thermique'}
  <svg viewBox="0 0 300 96" role="img" aria-label="L’isolant s’interrompt à la jonction : le froid passe.">
    <rect x="20" y="20" width="120" height="26" class="isolant" />
    <rect x="180" y="20" width="100" height="26" class="isolant" />
    <rect x="140" y="20" width="40" height="26" class="trou" />
    <rect x="20" y="46" width="260" height="30" class="paroi" />
    <path d="M160 14 v-8 M152 8 l8 -8 8 8" class="fleche-froid" />
    <text x="160" y="92" class="mini non">le froid passe ici</text>
  </svg>
{:else if id === 'terre'}
  <svg viewBox="0 0 300 96" role="img" aria-label="Le courant qui fuit part dans la terre au lieu de passer par vous.">
    <rect x="30" y="18" width="60" height="44" rx="5" class="dedans" />
    <path d="M90 40 H150" class="fil-vert" />
    <path d="M150 40 V70" class="fil-vert" />
    <path d="M126 70h48M134 78h32M142 86h16" class="terre-trait" />
    <circle cx="215" cy="40" r="13" class="perso" />
    <path d="M215 53v18M203 84l12-13 12 13" class="perso" />
    <text x="215" y="94" class="mini oui">protégé</text>
  </svg>
{:else if id === 'vmc'}
  <svg viewBox="0 0 300 96" role="img" aria-label="La VMC extrait l’air humide et fait entrer l’air neuf.">
    <rect x="40" y="20" width="220" height="52" rx="6" class="paroi" />
    <path d="M52 60 H120" class="air-entrant" />
    <text x="86" y="52" class="mini oui">air neuf</text>
    <path d="M180 60 H248" class="air-sortant" />
    <text x="214" y="52" class="mini non">air humide</text>
    <circle cx="150" cy="46" r="14" class="dedans" />
    <path d="M150 36v20M140 46h20" class="helice" />
  </svg>
{:else if id === 'fibrociment'}
  <svg viewBox="0 0 300 96" role="img" aria-label="Plaque de fibrociment intacte, et la même percée qui libère des fibres.">
    <path d="M20 66 L76 38 L132 66 L76 94 Z" class="dedans" />
    <text x="76" y="26" class="mini oui">intacte</text>
    <path d="M168 66 L224 38 L280 66 L224 94 Z" class="dehors" />
    <path d="M224 38 L216 66 L232 80" class="fissure-mini" />
    <text x="224" y="26" class="mini non">percée</text>
  </svg>
{:else if id === 'listes'}
  <svg viewBox="0 0 300 96" role="img" aria-label="Liste A : flocages. Liste B : dalles, conduits, toiture. Liste C : avant démolition.">
    {#each [{ l: 'A', t: 'flocages', fort: true }, { l: 'B', t: 'dalles, toiture', fort: false }, { l: 'C', t: 'démolition', fort: false }] as e, i}
      <g transform="translate({14 + i * 96} 16)">
        <rect x="0" y="0" width="80" height="60" rx="10" class={e.fort ? 'dehors' : 'dedans'} />
        <text x="40" y="30" class="chiffre" class:non={e.fort}>{e.l}</text>
        <text x="40" y="48" class="mini">{e.t}</text>
      </g>
    {/each}
  </svg>
{/if}

<style>
  svg {
    width: 100%;
    height: auto;
    margin-bottom: 12px;
    display: block;
  }

  .dedans {
    fill: rgb(46 233 139 / 14%);
    stroke: var(--ok);
    stroke-width: 1.6;
  }

  .dehors {
    fill: rgb(255 95 109 / 12%);
    stroke: var(--alerte);
    stroke-width: 1.6;
  }

  .cloison {
    stroke: var(--ok);
    stroke-width: 1.4;
    opacity: 0.5;
  }

  .oui {
    fill: var(--ok);
    font-size: 11px;
    font-weight: 700;
  }

  .non {
    fill: var(--alerte);
  }

  text.non {
    font-size: 11px;
    font-weight: 700;
  }

  .mini {
    font-size: 10.5px;
    fill: var(--encre-doux);
    text-anchor: middle;
    font-weight: 600;
  }

  .mini.oui {
    fill: var(--ok);
  }

  .chiffre {
    font-size: 17px;
    font-weight: 800;
    fill: var(--ok);
    text-anchor: middle;
  }

  .chiffre.non {
    fill: var(--alerte);
  }

  .barre-bon {
    fill: rgb(46 233 139 / 55%);
  }

  .barre-mal {
    fill: rgb(255 95 109 / 65%);
  }

  .axe {
    stroke: var(--trait);
    stroke-width: 2;
  }

  .valide {
    fill: rgb(46 233 139 / 22%);
  }

  .perime {
    fill: rgb(255 95 109 / 22%);
  }

  .borne {
    fill: var(--encre-doux);
  }

  .case {
    fill: none;
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .case.cochee {
    stroke: var(--ok);
  }

  .coche {
    fill: none;
    stroke: var(--ok);
    stroke-width: 2.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .texte-faux {
    stroke: var(--trait);
    stroke-width: 4;
    stroke-linecap: round;
  }

  .texte-vrai {
    stroke: var(--vert-300);
    stroke-width: 4;
    stroke-linecap: round;
    opacity: 0.8;
  }

  .isolant {
    fill: rgb(46 233 139 / 22%);
    stroke: var(--ok);
    stroke-width: 1.5;
  }

  .trou {
    fill: rgb(255 95 109 / 22%);
    stroke: var(--alerte);
    stroke-width: 1.5;
  }

  .paroi {
    fill: rgb(255 255 255 / 6%);
    stroke: var(--trait);
    stroke-width: 1.5;
  }

  .fleche-froid {
    fill: none;
    stroke: var(--alerte);
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .fil-vert {
    stroke: var(--ok);
    stroke-width: 3;
    fill: none;
    stroke-linecap: round;
  }

  .terre-trait {
    stroke: var(--ok);
    stroke-width: 2.6;
    stroke-linecap: round;
  }

  .perso {
    fill: none;
    stroke: var(--encre-doux);
    stroke-width: 2.4;
    stroke-linecap: round;
  }

  .air-entrant {
    stroke: var(--ok);
    stroke-width: 3;
    stroke-dasharray: 6 4;
    stroke-linecap: round;
  }

  .air-sortant {
    stroke: var(--attention);
    stroke-width: 3;
    stroke-dasharray: 6 4;
    stroke-linecap: round;
  }

  .helice {
    stroke: var(--ok);
    stroke-width: 2.4;
    stroke-linecap: round;
  }

  .fissure-mini {
    fill: none;
    stroke: var(--alerte);
    stroke-width: 2.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
