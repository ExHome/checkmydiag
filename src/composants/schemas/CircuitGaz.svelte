<script lang="ts">
  /**
   * Le gaz en une idée : une flamme mange de l'air. Si l'air n'entre plus, elle
   * fabrique du monoxyde de carbone.
   *
   * Deux vignettes, deux verdicts. Rien d'autre.
   */
  import Clip from '../savoir/Clip.svelte';
  import ClipDessin from '../savoir/ClipDessin.svelte';
  import Verdict, { type Ton } from './Verdict.svelte';

  interface Cas {
    id: string;
    titre: string;
    mot: string;
    ton: Ton;
    danger: boolean;
    points: string[];
    /** Les mots du métier que ce cas permet d'aller creuser. */
    clips?: string[];
  }

  const CAS: Cas[] = [
    {
      id: 'ok',
      titre: 'Grille dégagée',
      mot: 'La flamme brûle bien',
      ton: 'bon',
      danger: false,
      points: [
        'L’air entre par la grille du bas',
        'La flamme a de quoi brûler jusqu’au bout',
        'Les fumées partent par le conduit'
      ]
    },
    {
      id: 'bouche',
      titre: 'Grille bouchée',
      mot: 'Monoxyde de carbone',
      ton: 'alerte',
      danger: true,
      points: [
        'La flamme manque d’air',
        'Elle fabrique du monoxyde de carbone',
        'On ne le voit pas, on ne le sent pas',
        'Il endort, puis il tue'
      ],
      clips: ['monoxyde-de-carbone']
    }
  ];

  let choisi = $state<string | null>(null);
  const detail = $derived(CAS.find((c) => c.id === choisi) ?? null);

  function basculer(id: string): void {
    choisi = choisi === id ? null : id;
  }
</script>

<figure>
  <p class="invite muet petit">Touchez une situation.</p>

  <svg viewBox="0 0 460 272" role="group" aria-label="À gauche, la grille de ventilation est dégagée et la flamme brûle proprement. À droite, la grille est bouchée et la combustion produit du monoxyde de carbone.">
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
        <rect x={20 + dx} y="26" width="184" height="206" rx="14" class="zone" />
        <text x={112 + dx} y="48" class="titre-cas">{cas.titre}</text>

        <g transform="translate({dx} 0)">
          <!-- La chaudière -->
          <rect x="112" y="86" width="70" height="86" rx="6" class="chaudiere" />
          <rect x="126" y="128" width="42" height="30" rx="4" class="foyer" />

          <!-- La flamme : franche à gauche, molle et jaune à droite -->
          {#if cas.danger}
            <path d="M138 152c1-8 6-9 7-16 4 6 9 8 9 16" class="flamme sale" />
          {:else}
            <path d="M138 152c1-9 7-10 8-18 5 7 10 9 10 18" class="flamme" />
          {/if}

          <!-- Conduit de fumées -->
          <path d="M147 86 V56 H186" class="conduit" />

          <!-- Grille d'air -->
          <rect x="40" y="150" width="42" height="26" rx="3" class="grille" class:fermee={cas.danger} />
          <path d="M46 157h30M46 164h30M46 171h30" class="barreaux" class:fermee={cas.danger} />

          {#if cas.danger}
            <!-- Le carton qui bouche, et le CO qui revient -->
            <rect x="36" y="146" width="50" height="34" rx="3" class="obstacle" />
            <g class="co">
              <circle cx="104" cy="112" r="5" />
              <circle cx="92" cy="98" r="4" />
              <circle cx="116" cy="94" r="3.4" />
            </g>
          {:else}
            <path d="M86 163 H112" class="air" />
          {/if}
        </g>

        <Verdict x={112 + dx} y={210} texte={cas.mot} ton={cas.ton} largeur={168} />
      </g>
    {/each}

    <!-- Les trois objets du diagnostic : ce qui fait entrer l'air, ce qui fait
         sortir les fumées, et ce qui arrive quand l'un des deux manque. -->
    <ClipDessin id="ventilation" x={40} y={250} depuis={[61, 178]} cote="droite" />
    <ClipDessin id="conduit-de-fumees" x={150} y={250} depuis={[186, 58]} cote="droite" />
    <ClipDessin id="monoxyde-de-carbone" x={444} y={250} depuis={[344, 100]} cote="gauche" />
  </svg>

  {#if detail}
    <div class="reponse apparait" class:mauvais={detail.danger}>
      <p class="titre">{detail.titre}</p>
      <ul>
        {#each detail.points as point}
          <li>{point}</li>
        {/each}
      </ul>
      {#if detail.clips?.length}
        <p class="creuser">
          {#each detail.clips as id (id)}<Clip {id} />{/each}
        </p>
      {/if}
      <button type="button" class="fermer" onclick={() => (choisi = null)}>← Revenir au schéma</button>
    </div>
  {:else}
    <figcaption class="muet petit">
      Ne bouchez jamais une grille de ventilation, même en hiver, même si ça souffle.
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

  .chaudiere {
    fill: var(--vert-100);
    stroke: var(--gris);
    stroke-width: 2;
  }

  .foyer {
    fill: var(--encre);
  }

  .flamme {
    fill: none;
    stroke: var(--vert-300);
    stroke-width: 3.4;
    stroke-linecap: round;
  }

  .flamme.sale {
    stroke: var(--attention);
  }

  .conduit {
    fill: none;
    stroke: var(--gris);
    stroke-width: 3.4;
    stroke-dasharray: 7 5;
    stroke-linecap: round;
  }

  .grille {
    fill: rgb(46 233 139 / 18%);
    stroke: var(--ok);
    stroke-width: 2;
  }

  .grille.fermee {
    fill: rgb(255 95 109 / 14%);
    stroke: var(--alerte);
  }

  .barreaux {
    stroke: var(--ok);
    stroke-width: 1.6;
  }

  .barreaux.fermee {
    stroke: var(--alerte);
  }

  .obstacle {
    fill: var(--or-fonce);
    opacity: 0.9;
  }

  .air {
    stroke: var(--ok);
    stroke-width: 3.4;
    stroke-dasharray: 6 5;
    stroke-linecap: round;
  }

  .co circle {
    fill: var(--alerte);
    opacity: 0.75;
  }




  .reponse {
    margin-top: 12px;
    padding: 16px 20px;
    background: rgb(46 233 139 / 10%);
    border-left: 4px solid var(--ok);
    border-radius: var(--rayon-petit);
  }

  .reponse.mauvais {
    background: rgb(255 95 109 / 10%);
    border-left-color: var(--alerte);
  }

  .reponse .titre {
    margin: 0 0 8px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.9rem;
    color: var(--ok);
  }

  .reponse.mauvais .titre {
    color: var(--alerte);
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
