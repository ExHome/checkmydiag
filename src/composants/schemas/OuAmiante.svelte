<script lang="ts">
  /**
   * L'amiante en une idée : enfermée, elle ne sort pas ; abîmée, elle se libère.
   *
   * Deux vignettes, deux mots. Le reste — où elle se trouve dans ce logement-là —
   * vient du rapport, pas du schéma.
   */
  import Clip from '../savoir/Clip.svelte';
  import ClipDessin from '../savoir/ClipDessin.svelte';
  import Verdict, { type Ton } from './Verdict.svelte';

  interface Cas {
    id: string;
    titre: string;
    mot: string;
    ton: Ton;
    texte: string;
    danger: boolean;
  }

  const CAS: Cas[] = [
    {
      id: 'intact',
      titre: 'Matériau intact',
      mot: 'Aucun danger',
      ton: 'bon',
      danger: false,
      texte:
        'Les fibres sont prises dans le ciment ou la colle, comme des grains de sable dans du béton. Tant que le bloc tient, rien ne s’échappe. On peut vivre des années à côté sans risque.'
    },
    {
      id: 'abime',
      titre: 'Matériau percé ou cassé',
      mot: 'Des fibres s’envolent',
      ton: 'alerte',
      danger: true,
      texte:
        'Une perceuse, une ponceuse, une scie — ou simplement un matériau qui se dégrade — libèrent des fibres invisibles. Respirées, elles restent dans les poumons et provoquent des cancers, parfois trente ans plus tard.'
    }
  ];

  let choisi = $state<string | null>(null);
  const detail = $derived(CAS.find((c) => c.id === choisi) ?? null);

  function basculer(id: string): void {
    choisi = choisi === id ? null : id;
  }

  /** Fibres qui s'échappent, positions fixes pour rester lisibles. */
  const FIBRES = [
    { x: 336, y: 92, r: -30 },
    { x: 356, y: 74, r: 15 },
    { x: 380, y: 88, r: -12 },
    { x: 366, y: 108, r: 40 },
    { x: 398, y: 66, r: -50 },
    { x: 344, y: 122, r: 25 }
  ];
</script>

<figure>
  <p class="invite muet petit">Touchez une situation.</p>

  <svg viewBox="0 0 460 264" role="group" aria-label="À gauche, un matériau amianté intact ne libère rien. À droite, percé, il libère des fibres.">
    <defs>
      <linearGradient id="plaqueSaine" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="var(--vert-100)" />
        <stop offset="100%" stop-color="var(--gris)" />
      </linearGradient>
      <linearGradient id="plaqueCassee" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="var(--verriere-sable-voile)" />
        <stop offset="100%" stop-color="var(--verriere-sable-or)" />
      </linearGradient>
    </defs>

    {#each CAS as cas, i (cas.id)}
      {@const actif = choisi === cas.id}
      {@const dx = i * 240}
      <g
        class="cible"
        class:actif
        class:efface={choisi !== null && !actif}
        role="button"
        tabindex="0"
        aria-pressed={actif}
        aria-label="{cas.titre} : {cas.mot}"
        onclick={() => basculer(cas.id)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            basculer(cas.id);
          }
        }}
      >
        <rect x={20 + dx} y="26" width="184" height="196" rx="14" class="zone" />

        <text x={112 + dx} y="48" class="titre-cas">{cas.titre}</text>

        <!-- La plaque de fibrociment, vue de trois quarts -->
        <g transform="translate({dx} 0)">
          <path
            d="M44 152 L112 118 L180 152 L112 186 Z"
            fill={cas.danger ? 'url(#plaqueCassee)' : 'url(#plaqueSaine)'}
            stroke="var(--gris)"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <path d="M62 152 L112 127 M84 164 L134 139 M106 176 L156 151" stroke="var(--gris)" stroke-width="2" opacity="0.8" />

          {#if cas.danger}
            <!-- La perceuse et la fissure -->
            <path d="M112 118 L104 152 L120 168" class="fissure" />
            <rect x="120" y="72" width="34" height="14" rx="4" class="outil" />
            <path d="M120 79 L100 79" class="meche" />
            <circle cx="100" cy="79" r="3" class="meche-bout" />
          {/if}
        </g>

        {#if cas.danger}
          {#each FIBRES as f (f.x)}
            <g transform="translate({f.x} {f.y}) rotate({f.r})" class="fibre">
              <path d="M-7 0 L7 0" />
            </g>
          {/each}
        {/if}

        <!-- Le verdict, en gros -->
        <Verdict x={112 + dx} y={206} texte={cas.mot} ton={cas.ton} largeur={160} />
      </g>
    {/each}

    <!-- Le matériau d'un côté, ce qui s'en échappe de l'autre : c'est tout le
         diagnostic amiante en deux mots. -->
    <ClipDessin id="fibrociment" x={40} y={242} depuis={[80, 162]} cote="droite" />
    <ClipDessin id="fibre-amiante" x={444} y={242} depuis={[366, 108]} cote="gauche" />
  </svg>

  {#if detail}
    <div class="reponse apparait" class:mauvais={detail.danger}>
      <p class="titre">{detail.titre}</p>
      <p>{detail.texte}</p>
      <button type="button" class="fermer" onclick={() => (choisi = null)}>← Revenir au schéma</button>
    </div>
  {:else}
    <figcaption class="muet petit">
      C’est la seule chose à retenir : le danger ne vient pas de la présence d’amiante, il vient de
      ce qu’on lui fait.
    </figcaption>
  {/if}

  <p class="creuser">
    <Clip id="amiante" />
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

  .fissure {
    fill: none;
    stroke: var(--alerte);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .outil {
    fill: var(--encre-doux);
  }

  .meche {
    stroke: var(--encre-doux);
    stroke-width: 3;
    stroke-linecap: round;
  }

  .meche-bout {
    fill: var(--alerte);
  }

  .fibre path {
    stroke: var(--alerte);
    stroke-width: 2;
    stroke-linecap: round;
    opacity: 0.85;
  }




  .reponse {
    margin-top: var(--e3);
    padding: var(--e4) var(--e4);
    background: rgb(46 233 139 / 10%);
    border-left: 4px solid var(--ok);
    border-radius: var(--rayon-petit);
  }

  .reponse.mauvais {
    background: rgb(255 95 109 / 10%);
    border-left-color: var(--alerte);
  }

  .reponse .titre {
    margin: 0 0 var(--e1);
    font-weight: 800;
    letter-spacing: 0.05em;
    font-size: var(--t-base);
    color: var(--ok);
  }

  .reponse.mauvais .titre {
    color: var(--alerte);
  }

  .reponse p:last-of-type {
    margin: 0 0 var(--e2);
    font-size: var(--t-base);
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
