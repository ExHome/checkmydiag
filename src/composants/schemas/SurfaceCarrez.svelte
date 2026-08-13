<script lang="ts">
  /**
   * La loi Carrez en une idée : la barre des 1,80 m. Au-dessus ça compte,
   * en dessous non.
   */
  import ClipDessin from '../savoir/ClipDessin.svelte';
  import Verdict from './Verdict.svelte';

  interface Partie {
    id: string;
    titre: string;
    mot: string;
    compte: boolean;
    points: string[];
  }

  const PARTIES: Partie[] = [
    {
      id: 'compte',
      titre: 'Au-dessus de 1,80 m',
      mot: 'Ça compte',
      compte: true,
      points: [
        'Le sol des pièces où l’on tient debout',
        'Couloirs et placards inclus',
        'C’est ce chiffre qui va dans l’acte'
      ]
    },
    {
      id: 'compte-pas',
      titre: 'En dessous de 1,80 m',
      mot: 'Ça ne compte pas',
      compte: false,
      points: [
        'Sous les rampants, sous l’escalier',
        'On déduit aussi les murs, les cloisons et les gaines — les coffres qui cachent les tuyaux',
        'Cave, garage et balcon ne comptent pas non plus',
        'C’est pour ça que le chiffre est plus petit que celui de l’annonce'
      ]
    }
  ];

  let choisi = $state<string | null>(null);
  const detail = $derived(PARTIES.find((p) => p.id === choisi) ?? null);

  function basculer(id: string): void {
    choisi = choisi === id ? null : id;
  }
</script>

<figure>
  <p class="invite muet petit">Touchez une zone.</p>

  <svg viewBox="0 0 460 230" role="group" aria-label="Coupe sous combles : au-dessus de 1,80 mètre la surface compte, en dessous elle ne compte pas.">
    <!-- Le volume sous rampants -->
    <path d="M40 186 L230 56 L420 186 Z" class="volume" />
    <rect x="40" y="186" width="380" height="10" class="plancher" />

    <!-- La zone qui compte -->
    <path d="M126 132 L230 62 L334 132 Z" class="comptee" />

    <!-- La ligne des 1,80 m -->
    <line x1="40" y1="132" x2="420" y2="132" class="ligne-seuil" />
    <text x="230" y="124" class="seuil">1,80 m</text>

    <!-- Zones cliquables -->
    {#each PARTIES as partie (partie.id)}
      {@const actif = choisi === partie.id}
      <g
        class="cible"
        class:actif
        class:efface={choisi !== null && !actif}
        role="button"
        tabindex="0"
        aria-pressed={actif}
        aria-label="{partie.titre} : {partie.mot}"
        onclick={() => basculer(partie.id)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            basculer(partie.id);
          }
        }}
      >
        {#if partie.compte}
          <path d="M126 132 L230 62 L334 132 Z" class="zone" />
          <Verdict x={230} y={100} texte={partie.mot} ton="neutre" largeur={116} />
        {:else}
          <path d="M40 186 L126 132 L126 186 Z M334 132 L420 186 L334 186 Z" class="zone" />
          <Verdict x={230} y={214} texte={partie.mot} ton="neutre-evide" largeur={140} />
        {/if}
      </g>
    {/each}

    <!-- La règle, et la partie du toit qui lui échappe. -->
    <ClipDessin id="loi-carrez" x={404} y={54} depuis={[300, 108]} cote="gauche" />
    <ClipDessin id="rampant" x={58} y={96} depuis={[112, 138]} cote="droite" />
  </svg>

  {#if detail}
    <div class="reponse apparait" class:non={!detail.compte}>
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
      Trois surfaces différentes pour le même logement, c’est normal : Carrez pour vendre, Boutin
      pour louer, surface de référence pour le DPE.
    </figcaption>
  {/if}
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

  .volume {
    fill: rgb(255 255 255 / 5%);
    stroke: var(--trait);
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .plancher {
    fill: var(--trait);
  }

  .comptee {
    fill: rgb(46 233 139 / 20%);
    stroke: var(--ok);
    stroke-width: 2;
  }

  .ligne-seuil {
    stroke: var(--ok);
    stroke-width: 2;
    stroke-dasharray: 7 5;
  }

  .seuil {
    font-size: var(--t-petit);
    fill: var(--ok);
    text-anchor: middle;
    font-weight: 800;
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
    fill: rgb(255 255 255 / 10%);
    stroke: var(--vert-500);
  }




  .reponse {
    margin-top: var(--e3);
    padding: var(--e4) var(--e4);
    background: rgb(46 233 139 / 10%);
    border-left: 4px solid var(--ok);
    border-radius: var(--rayon-petit);
  }

  .reponse.non {
    background: rgb(255 255 255 / 5%);
    border-left-color: var(--encre-doux);
  }

  .reponse .titre {
    margin: 0 0 var(--e2);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: var(--t-base);
    color: var(--ok);
  }

  .reponse.non .titre {
    color: var(--encre-doux);
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
