<script lang="ts">
  /**
   * Par où la chaleur s'échappe d'un logement.
   *
   * Les pourcentages sont des ordres de grandeur moyens (source ADEME) : le DPE
   * ne publie pas ceux du logement sous une forme lisible par un programme. Le
   * schéma sert à faire comprendre, il ne prétend pas décrire ce logement-ci —
   * et la légende le dit.
   *
   * Chaque fuite porte sa flèche et son libellé : les deux se déplacent
   * ensemble, ce qui évite les chevauchements quand on ajuste le dessin.
   */
  interface Fuite {
    nom: string;
    part: string;
    /** Départ et arrivée de la flèche. */
    de: [number, number];
    vers: [number, number];
    /** Ancre du libellé, et son alignement. */
    texte: [number, number];
    align: 'start' | 'middle' | 'end';
  }

  const FUITES: Fuite[] = [
    { nom: 'Toit', part: '25 à 30 %', de: [250, 96], vers: [250, 52], texte: [250, 34], align: 'middle' },
    { nom: 'Air renouvelé', part: '20 à 25 %', de: [200, 150], vers: [122, 104], texte: [116, 82], align: 'end' },
    { nom: 'Murs', part: '20 à 25 %', de: [163, 214], vers: [104, 214], texte: [98, 210], align: 'end' },
    { nom: 'Fenêtres', part: '10 à 15 %', de: [337, 178], vers: [396, 178], texte: [402, 174], align: 'start' },
    { nom: 'Ponts thermiques', part: '5 à 10 %', de: [337, 252], vers: [396, 252], texte: [402, 248], align: 'start' },
    { nom: 'Sol', part: '7 à 10 %', de: [250, 268], vers: [250, 300], texte: [250, 316], align: 'middle' }
  ];
</script>

<figure>
  <!-- Le cadre est plus large que le dessin : les libellés des flèches doivent
       tenir dedans, sinon ils sont coupés à l'écran. -->
  <svg
    viewBox="-20 0 560 350"
    role="img"
    aria-label="Coupe d’une maison montrant par où la chaleur s’échappe : le toit 25 à 30 %, l’air renouvelé 20 à 25 %, les murs 20 à 25 %, les fenêtres 10 à 15 %, les ponts thermiques 5 à 10 %, le sol 7 à 10 %."
  >
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

    {#each FUITES as fuite (fuite.nom)}
      <path d="M{fuite.de[0]} {fuite.de[1]} L{fuite.vers[0]} {fuite.vers[1]}" class="fuite" />
      <text x={fuite.texte[0]} y={fuite.texte[1]} text-anchor={fuite.align} class="etiquette">
        <tspan class="nom">{fuite.nom}</tspan>
        <tspan class="part" x={fuite.texte[0]} dy="15">{fuite.part}</tspan>
      </text>
    {/each}
  </svg>

  <figcaption class="muet petit">
    Ordres de grandeur moyens pour une maison mal isolée (source : ADEME). Le schéma des
    déperditions de <em>votre</em> logement se trouve en page 2 de votre DPE.
  </figcaption>
</figure>

<style>
  figure {
    margin: 0;
  }

  svg {
    width: 100%;
    height: auto;
    overflow: visible;
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

  .fuite {
    stroke: var(--alerte);
    stroke-width: 2.5;
    stroke-linecap: round;
    marker-end: url(#pointe-chaleur);
  }

  .etiquette {
    font-size: 13px;
    fill: var(--encre);
  }

  .nom {
    font-weight: 600;
  }

  .part {
    fill: var(--encre-doux);
    font-size: 12px;
  }

  figcaption {
    margin-top: 12px;
  }
</style>
