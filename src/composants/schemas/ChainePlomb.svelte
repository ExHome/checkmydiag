<script lang="ts">
  /**
   * Le plomb en trois temps : la peinture tient, la peinture s'écaille, la
   * poussière est avalée. On touche une étape, elle s'explique.
   */
  import ClipDessin from '../savoir/ClipDessin.svelte';
  import Verdict, { type Ton } from './Verdict.svelte';

  interface Etape {
    id: string;
    titre: string;
    mot: string;
    ton: Ton;
    danger: boolean;
    points: string[];
  }

  const ETAPES: Etape[] = [
    {
      id: 'intacte',
      titre: 'Peinture intacte',
      mot: 'Aucun danger',
      ton: 'bon',
      danger: false,
      points: [
        'Le plomb est enfermé sous la peinture',
        'Rien ne s’échappe',
        'On peut vivre à côté sans risque'
      ]
    },
    {
      id: 'ecaille',
      titre: 'Peinture qui s’écaille',
      mot: 'Poussière',
      ton: 'attention',
      danger: true,
      points: [
        'Frottements, humidité, chocs',
        'La peinture part en écailles',
        'La poussière tombe au sol',
        'Elle est invisible'
      ]
    },
    {
      id: 'enfant',
      titre: 'Un enfant l’avale',
      mot: 'Saturnisme',
      ton: 'alerte',
      danger: true,
      points: [
        'Main au sol, puis à la bouche',
        'C’est comme ça qu’on s’empoisonne, presque toujours',
        'Saturnisme : la maladie du plomb, grave et définitive',
        'Les jeunes enfants et les femmes enceintes risquent le plus'
      ]
    }
  ];

  let choisi = $state<string | null>(null);
  const detail = $derived(ETAPES.find((e) => e.id === choisi) ?? null);

  function basculer(id: string): void {
    choisi = choisi === id ? null : id;
  }
</script>

<figure>
  <p class="invite muet petit">Touchez une étape.</p>

  <svg viewBox="0 0 460 248" role="group" aria-label="Trois étapes : peinture intacte sans danger, peinture qui s’écaille et fait de la poussière, enfant qui l’avale.">
    {#each ETAPES as etape, i (etape.id)}
      {@const actif = choisi === etape.id}
      {@const dx = i * 155}
      <g
        class="cible"
        class:actif
        class:efface={choisi !== null && !actif}
        role="button"
        tabindex="0"
        aria-pressed={actif}
        aria-label="{etape.titre} : {etape.mot}"
        onclick={() => basculer(etape.id)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            basculer(etape.id);
          }
        }}
      >
        <rect x={12 + dx} y="20" width="132" height="172" rx="14" class="zone" />
        <text x={78 + dx} y="42" class="titre-cas">{etape.titre}</text>

        <g transform="translate({dx} 0)">
          {#if i === 0}
            <rect x="38" y="58" width="80" height="76" rx="4" class="mur" />
            <path d="M50 76h56M50 92h56M50 108h34" class="lignes" />
          {:else if i === 1}
            <rect x="38" y="58" width="80" height="76" rx="4" class="mur" />
            <path d="M56 66 l10 16 -14 8 12 14 -9 12" class="fissure" />
            <path d="M92 96 l8 7 -4 9" class="fissure" />
            <g class="poussiere">
              <circle cx="52" cy="146" r="3" />
              <circle cx="72" cy="152" r="2.4" />
              <circle cx="92" cy="145" r="3.4" />
              <circle cx="108" cy="153" r="2" />
            </g>
          {:else}
            <circle cx="78" cy="76" r="15" class="enfant" />
            <path d="M78 92 v34 M60 146 l18 -20 18 20 M60 104 h36" class="enfant" />
            <circle cx="102" cy="104" r="5" class="danger" />
          {/if}
        </g>

        <Verdict x={78 + dx} y={172} texte={etape.mot} ton={etape.ton} largeur={128} />
      </g>

      {#if i < ETAPES.length - 1}
        <path d="M{150 + dx} 106 l12 0" class="fleche" />
        <path d="M{158 + dx} 101 l6 5 -6 5" class="fleche" />
      {/if}
    {/each}

    <!-- L'état de la peinture, et la maladie qu'il provoque : les deux mots que
         le rapport emploie et que personne n'explique. -->
    <ClipDessin id="classe-3" x={150} y={228} depuis={[233, 140]} cote="droite" />
    <ClipDessin id="saturnisme" x={312} y={228} depuis={[388, 152]} cote="droite" />
  </svg>

  {#if detail}
    <div class="reponse apparait" class:mauvais={detail.danger}>
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
      Le danger ne vient pas du plomb lui-même, mais de la peinture qui se dégrade.
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
    font-size: var(--t-petit);
    font-weight: 700;
    fill: var(--encre);
    text-anchor: middle;
  }

  .mur {
    fill: var(--vert-100);
    stroke: var(--gris);
    stroke-width: 2;
  }

  .lignes {
    stroke: var(--trait);
    stroke-width: 2.4;
  }

  .fissure {
    fill: none;
    stroke: var(--attention);
    stroke-width: 2.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .poussiere circle {
    fill: var(--attention);
    opacity: 0.9;
  }

  .enfant {
    fill: none;
    stroke: var(--encre-doux);
    stroke-width: 2.8;
    stroke-linecap: round;
  }

  .danger {
    fill: var(--alerte);
  }

  .fleche {
    fill: none;
    stroke: var(--encre-doux);
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.6;
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
    margin: 0 0 var(--e2);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: var(--t-base);
    color: var(--ok);
  }

  .reponse.mauvais .titre {
    color: var(--alerte);
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
