<script lang="ts">
  /**
   * L'argile en une idée : c'est une éponge sous la maison. Elle gonfle, elle
   * se rétracte, et la maison suit.
   *
   * Deux saisons, deux verdicts.
   */
  interface Saison {
    id: string;
    titre: string;
    mot: string;
    chaud: boolean;
    points: string[];
  }

  const SAISONS: Saison[] = [
    {
      id: 'ete',
      titre: 'Été — il ne pleut plus',
      mot: 'Le sol se tasse',
      chaud: true,
      points: [
        'L’argile perd son eau',
        'Elle rétrécit, le sol descend',
        'La maison s’affaisse d’un côté',
        'Des fissures apparaissent en escalier'
      ]
    },
    {
      id: 'hiver',
      titre: 'Hiver — il pleut',
      mot: 'Le sol gonfle',
      chaud: false,
      points: [
        'L’argile se gorge d’eau',
        'Elle gonfle et pousse vers le haut',
        'La maison est soulevée',
        'Les fissures s’ouvrent et se referment'
      ]
    }
  ];

  let choisi = $state<string | null>(null);
  const detail = $derived(SAISONS.find((s) => s.id === choisi) ?? null);

  function basculer(id: string): void {
    choisi = choisi === id ? null : id;
  }
</script>

<figure>
  <p class="invite muet petit">Touchez une saison.</p>

  <svg viewBox="0 0 460 250" role="group" aria-label="En été le sol argileux sèche et se tasse, la maison s’affaisse. En hiver il gonfle et la soulève.">
    {#each SAISONS as saison, i (saison.id)}
      {@const actif = choisi === saison.id}
      {@const dx = i * 240}
      <g
        class="cible"
        class:actif
        class:efface={choisi !== null && !actif}
        role="button"
        tabindex="0"
        aria-pressed={actif}
        aria-label="{saison.titre} : {saison.mot}"
        onclick={() => basculer(saison.id)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            basculer(saison.id);
          }
        }}
      >
        <rect x={20 + dx} y="26" width="184" height="196" rx="14" class="zone" />
        <text x={112 + dx} y="48" class="titre-cas">{saison.titre}</text>

        <g transform="translate({dx} 0)">
          <!-- Le sol argileux -->
          <rect x="36" y="140" width="152" height="58" rx="4" class="sol" class:sec={saison.chaud} />
          {#if saison.chaud}
            <path d="M60 152v18M84 148v22M108 154v16M132 150v20M156 152v18" class="craquelures" />
          {:else}
            <path d="M56 160h24M92 168h24M132 158h26" class="gonfle" />
          {/if}

          <!-- La maison, penchée en été -->
          <g transform={saison.chaud ? 'rotate(-3.5 112 140)' : ''}>
            <rect x="70" y="94" width="84" height="46" class="mur" />
            <path d="M60 94 L112 66 L164 94 Z" class="toit" />
            {#if saison.chaud}
              <path d="M96 140 l5 -13 -4 -9 6 -10" class="fissure" />
            {:else}
              <path d="M132 140 l-4 -12 5 -10" class="fissure" />
            {/if}
          </g>

          <!-- Le mouvement -->
          {#if saison.chaud}
            <path d="M84 74 v16" class="mouvement" />
            <path d="M79 86 l5 6 5 -6" class="pointe" />
          {:else}
            <path d="M142 90 v-16" class="mouvement" />
            <path d="M137 78 l5 -6 5 6" class="pointe" />
          {/if}
        </g>

        <g transform="translate({112 + dx} 206)">
          <rect x="-76" y="-16" width="152" height="32" rx="16" class="verdict" class:chaud={saison.chaud} />
          <text x="0" y="5" class="mot">{saison.mot}</text>
        </g>
      </g>
    {/each}
  </svg>

  {#if detail}
    <div class="reponse apparait" class:chaud={detail.chaud}>
      <p class="titre">{detail.titre}</p>
      <ul>
        {#each detail.points as point}
          <li>{point}</li>
        {/each}
      </ul>
      <button type="button" class="fermer" onclick={() => (choisi = null)}>← Revenir au schéma</button>
    </div>
  {:else}
    <figcaption class="muet petit">
      Ça ne se répare pas : c’est le terrain, pas la maison. Ce qui compte, c’est ce que couvre
      votre assurance.
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
    max-width: 520px;
    display: block;
    margin-inline: auto;
  }

  .cible {
    cursor: pointer;
    transition: opacity 0.25s ease;
  }

  .cible.efface {
    opacity: 0.32;
  }

  .zone {
    fill: rgb(255 255 255 / 3%);
    stroke: var(--trait);
    stroke-width: 1.5;
    transition: fill 0.2s ease, stroke 0.2s ease;
  }

  .cible:hover .zone,
  .cible:focus-visible .zone,
  .cible.actif .zone {
    fill: rgb(255 255 255 / 7%);
    stroke: var(--vert-500);
  }

  .titre-cas {
    font-size: 13px;
    font-weight: 700;
    fill: var(--encre);
    text-anchor: middle;
  }

  .sol {
    fill: #2f5a49;
  }

  .sol.sec {
    fill: #6b4f22;
  }

  .craquelures {
    stroke: #c08a3a;
    stroke-width: 2.4;
    stroke-linecap: round;
  }

  .gonfle {
    stroke: #4fd1ff;
    stroke-width: 3;
    stroke-linecap: round;
  }

  .mur {
    fill: #e7efe9;
  }

  .toit {
    fill: #17513a;
    stroke: #0d3b29;
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .fissure {
    fill: none;
    stroke: var(--alerte);
    stroke-width: 2.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .mouvement,
  .pointe {
    fill: none;
    stroke: var(--encre-doux);
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .verdict {
    fill: rgb(79 209 255 / 16%);
    stroke: #4fd1ff;
    stroke-width: 1.5;
  }

  .verdict.chaud {
    fill: rgb(255 165 58 / 16%);
    stroke: var(--attention);
  }

  .mot {
    font-size: 13px;
    font-weight: 800;
    fill: var(--encre);
    text-anchor: middle;
  }

  .reponse {
    margin-top: 12px;
    padding: 16px 20px;
    background: rgb(79 209 255 / 10%);
    border-left: 4px solid #4fd1ff;
    border-radius: var(--rayon-petit);
  }

  .reponse.chaud {
    background: rgb(255 165 58 / 10%);
    border-left-color: var(--attention);
  }

  .reponse .titre {
    margin: 0 0 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.9rem;
    color: #4fd1ff;
  }

  .reponse.chaud .titre {
    color: var(--attention);
  }

  .reponse ul {
    list-style: none;
    margin: 0 0 10px;
    padding: 0;
    display: grid;
    gap: 6px;
  }

  .reponse li {
    position: relative;
    padding-left: 18px;
    font-size: 0.96rem;
  }

  .reponse li::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 0.55em;
    width: 6px;
    height: 6px;
    border-radius: 2px;
    background: currentColor;
    opacity: 0.6;
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
