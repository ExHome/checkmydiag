<script lang="ts">
  /**
   * Par où la chaleur s'échappe — schéma cliquable.
   *
   * Le lecteur ne lit pas un paragraphe : il touche le toit, et le toit lui
   * répond. Chaque zone porte sa part de déperdition et son explication.
   *
   * Les pourcentages sont des ordres de grandeur moyens (source ADEME) : le DPE
   * ne publie pas ceux du logement sous une forme lisible par un programme.
   */
  interface Fuite {
    id: string;
    nom: string;
    part: string;
    texte: string;
    /** Départ et arrivée de la flèche. */
    de: [number, number];
    vers: [number, number];
    /** Ancre du libellé, et son alignement. */
    texteXY: [number, number];
    align: 'start' | 'middle' | 'end';
    /** Zone cliquable sur le dessin. */
    zone: { x: number; y: number; w: number; h: number };
  }

  const FUITES: Fuite[] = [
    {
      id: 'toit',
      nom: 'Toit',
      part: '25 à 30 %',
      texte:
        'C’est par là que part le plus de chaleur : elle monte. C’est aussi le poste le moins cher à améliorer — souvent quelques heures de travail dans les combles.',
      de: [250, 96],
      vers: [250, 52],
      texteXY: [250, 34],
      align: 'middle',
      zone: { x: 148, y: 44, w: 204, h: 44 }
    },
    {
      id: 'air',
      nom: 'Air renouvelé',
      part: '20 à 25 %',
      texte:
        'L’air chaud s’en va et de l’air froid entre : par la ventilation, mais surtout par toutes les fuites — bas de porte, prises, trappes. Une VMC bien réglée coûte moins cher qu’une chaudière.',
      de: [200, 150],
      vers: [122, 104],
      texteXY: [116, 82],
      align: 'end',
      zone: { x: 180, y: 130, w: 60, h: 40 }
    },
    {
      id: 'murs',
      nom: 'Murs',
      part: '20 à 25 %',
      texte:
        'Deuxième poste. Les isoler coûte cher, surtout par l’extérieur, mais c’est ce qui change le plus le confort : un mur froid, on le sent même quand la pièce est à 20 °C.',
      de: [163, 214],
      vers: [104, 214],
      texteXY: [98, 210],
      align: 'end',
      zone: { x: 163, y: 190, w: 30, h: 70 }
    },
    {
      id: 'fenetres',
      nom: 'Fenêtres',
      part: '10 à 15 %',
      texte:
        'Moins que ce qu’on croit. Changer ses fenêtres avant d’isoler les combles, c’est dépenser beaucoup pour gagner peu. En revanche, on le voit et on l’entend tout de suite.',
      de: [337, 178],
      vers: [396, 178],
      texteXY: [402, 174],
      align: 'start',
      zone: { x: 268, y: 160, w: 44, h: 44 }
    },
    {
      id: 'ponts',
      nom: 'Ponts thermiques',
      part: '5 à 10 %',
      texte:
        'Les endroits où l’isolant s’interrompt : jonction entre un mur et un plancher, contour d’une fenêtre, balcon. Le froid y passe comme dans un couloir, et c’est là que la moisissure apparaît.',
      de: [337, 252],
      vers: [396, 252],
      texteXY: [402, 248],
      align: 'start',
      zone: { x: 320, y: 240, w: 22, h: 26 }
    },
    {
      id: 'sol',
      nom: 'Sol',
      part: '7 à 10 %',
      texte:
        'Le plancher bas, surtout s’il donne sur une cave ou un vide sanitaire. C’est le poste le plus discret, et souvent le plus simple à traiter par en dessous.',
      de: [250, 268],
      vers: [250, 300],
      texteXY: [250, 316],
      align: 'middle',
      zone: { x: 163, y: 262, w: 174, h: 14 }
    }
  ];

  let choisi = $state<string | null>(null);
  const detail = $derived(FUITES.find((f) => f.id === choisi) ?? null);

  function basculer(id: string): void {
    choisi = choisi === id ? null : id;
  }
</script>

<figure>
  <p class="invite muet petit">Touchez une partie du logement pour savoir ce qui s’y joue.</p>

  <svg viewBox="-20 0 560 350" role="group" aria-label="Coupe d’une maison : les six endroits par où la chaleur s’échappe.">
    <defs>
      <marker id="pointe-chaleur" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M0 0 L10 5 L0 10 z" fill="var(--alerte)" />
      </marker>
    </defs>

    <!-- La maison, en coupe -->
    <path d="M148 130 L250 68 L352 130 Z" class="toit" />
    <rect x="163" y="130" width="174" height="132" class="mur" />
    <rect x="163" y="262" width="174" height="12" class="sol" />
    <rect x="188" y="160" width="44" height="44" class="fenetre" />
    <rect x="268" y="160" width="44" height="44" class="fenetre" />
    <rect x="226" y="216" width="48" height="46" class="porte" />

    {#each FUITES as fuite (fuite.id)}
      {@const actif = choisi === fuite.id}
      <g
        class="cible"
        class:actif
        class:efface={choisi !== null && !actif}
        role="button"
        tabindex="0"
        aria-pressed={actif}
        aria-label="{fuite.nom} : {fuite.part} des pertes de chaleur"
        onclick={() => basculer(fuite.id)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            basculer(fuite.id);
          }
        }}
      >
        <rect
          x={fuite.zone.x}
          y={fuite.zone.y}
          width={fuite.zone.w}
          height={fuite.zone.h}
          class="zone"
          rx="4"
        />
        <path d="M{fuite.de[0]} {fuite.de[1]} L{fuite.vers[0]} {fuite.vers[1]}" class="fuite" />
        <text x={fuite.texteXY[0]} y={fuite.texteXY[1]} text-anchor={fuite.align} class="etiquette">
          <tspan class="nom">{fuite.nom}</tspan>
          <tspan class="part" x={fuite.texteXY[0]} dy="15">{fuite.part}</tspan>
        </text>
      </g>
    {/each}
  </svg>

  {#if detail}
    <div class="reponse apparait">
      <p class="titre">{detail.nom} — {detail.part} de la chaleur</p>
      <p>{detail.texte}</p>
    </div>
  {:else}
    <figcaption class="muet petit">
      Ordres de grandeur pour une maison mal isolée (source&nbsp;: ADEME). Le schéma de
      <em>votre</em> logement est en page 2 de votre DPE.
    </figcaption>
  {/if}
</figure>

<style>
  figure {
    margin: 0;
  }

  .invite {
    margin: 0 0 6px;
  }

  svg {
    width: 100%;
    height: auto;
  }

  .toit {
    fill: var(--vert-100);
    stroke: var(--encre-doux);
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .mur {
    fill: var(--papier-doux);
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .sol,
  .porte {
    fill: var(--trait);
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .fenetre {
    fill: var(--vert-100);
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .cible {
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .cible.efface {
    opacity: 0.35;
  }

  .zone {
    fill: transparent;
    stroke: transparent;
    stroke-width: 2;
    transition: fill 0.2s ease, stroke 0.2s ease;
  }

  .cible:hover .zone,
  .cible:focus-visible .zone,
  .cible.actif .zone {
    fill: rgb(229 72 77 / 12%);
    stroke: var(--alerte);
  }

  .fuite {
    stroke: var(--alerte);
    stroke-width: 2.5;
    stroke-linecap: round;
    marker-end: url(#pointe-chaleur);
  }

  .cible.actif .fuite {
    stroke-width: 4;
  }

  .etiquette {
    font-size: 13px;
    fill: var(--encre);
  }

  .nom {
    font-weight: 650;
  }

  .part {
    fill: var(--encre-doux);
    font-size: 12px;
  }

  .cible.actif .part {
    fill: var(--alerte);
    font-weight: 650;
  }

  .reponse {
    margin-top: 12px;
    padding: 14px 18px;
    background: var(--alerte-fond);
    border-radius: var(--rayon-petit);
  }

  .reponse .titre {
    margin: 0 0 4px;
    font-weight: 700;
    color: var(--alerte);
  }

  .reponse p:last-child {
    margin: 0;
    font-size: 0.96rem;
  }

  figcaption {
    margin-top: 12px;
  }
</style>
