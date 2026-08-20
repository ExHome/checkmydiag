<script lang="ts">
  /**
   * L'argile en une idée : c'est une éponge sous la maison. Elle gonfle, elle
   * se rétracte, et la maison suit.
   *
   * Deux saisons, deux verdicts.
   */
  import Clip from '../savoir/Clip.svelte';
  import ClipDessin from '../savoir/ClipDessin.svelte';
  import Maison from './briques/Maison.svelte';
  import Verdict from './Verdict.svelte';

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

  <svg viewBox="0 0 460 266" role="group" aria-label="En été le sol argileux sèche et se tasse, la maison s’affaisse. En hiver il gonfle et la soulève.">
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

          <!-- La maison, penchée en été. C'est la brique commune : même
               silhouette que sur le DPE et l'assainissement, à l'échelle près. -->
          <g transform={saison.chaud ? 'rotate(-3.5 112 140)' : ''}>
            <Maison x={80} y={86.4} l={64} />
            {#if saison.chaud}
              <path d="M96 140 l5 -13 -4 -9 6 -10" class="fissure" />
            {:else}
              <path d="M132 140 l-4 -12 5 -10" class="fissure" />
            {/if}
          </g>

          <!-- Le mouvement : à côté de la maison, jamais dessus — sinon on ne
               sait plus si la flèche décrit le sol ou le bâti. -->
          {#if saison.chaud}
            <path d="M62 96 v20" class="mouvement" />
            <path d="M57 112 l5 6 5 -6" class="pointe" />
          {:else}
            <path d="M162 116 v-20" class="mouvement" />
            <path d="M157 100 l5 -6 5 6" class="pointe" />
          {/if}
        </g>

        <!-- Les deux saisons font travailler la maison autant l'une que l'autre :
             le chaud et le froid ne sont pas un code de gravité. -->
        <Verdict x={112 + dx} y={206} texte={saison.mot} ton="attention" largeur={152} />
      </g>
    {/each}

    <!-- Le phénomène porte un nom, et c'est celui que le rapport emploie. -->
    <ClipDessin id="retrait-gonflement" x={126} y={244} depuis={[112, 200]} cote="droite" />
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

  <p class="creuser">
    <Clip id="erp" />
  </p>
</figure>

<style>
  figure {
    margin: 0;
  }

  .invite {
    margin: 0 0 var(--e1);
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
    fill: var(--surface);
    stroke: var(--trait);
    stroke-width: 1.5;
    transition: fill 0.2s ease, stroke 0.2s ease;
  }

  .cible:hover .zone,
  .cible:focus-visible .zone,
  .cible.actif .zone {
    fill: var(--surface-forte);
    stroke: var(--vert-500);
  }

  .titre-cas {
    font-size: 18px;
    font-weight: 700;
    fill: var(--encre);
    text-anchor: middle;
  }

  .sol {
    fill: var(--encre-doux);
  }

  .sol.sec {
    fill: var(--or-fonce);
  }

  .craquelures {
    stroke: var(--or);
    stroke-width: 2.4;
    stroke-linecap: round;
  }

  .gonfle {
    stroke: var(--vert-300);
    stroke-width: 3;
    stroke-linecap: round;
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




  .reponse {
    margin-top: var(--e3);
    padding: var(--e4) var(--e4);
    background: rgb(79 209 255 / 10%);
    border-left: 4px solid var(--vert-300);
    border-radius: var(--rayon-petit);
  }

  .reponse.chaud {
    background: rgb(255 165 58 / 10%);
    border-left-color: var(--attention);
  }

  .reponse .titre {
    margin: 0 0 var(--e2);
    font-weight: 800;
    letter-spacing: 0.05em;
    font-size: var(--t-base);
    color: var(--vert-300);
  }

  .reponse.chaud .titre {
    color: var(--attention);
  }

  .reponse ul {
    list-style: none;
    margin: 0 0 var(--e2);
    padding: 0;
    display: grid;
    gap: var(--e1);
  }

  .reponse li {
    position: relative;
    padding-left: var(--e4);
    font-size: var(--t-base);
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
    font-size: var(--t-base);
    cursor: pointer;
  }

  figcaption {
    margin-top: var(--e3);
  }
</style>
