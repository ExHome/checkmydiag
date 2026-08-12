<script lang="ts">
  /**
   * Une seule idée : l'amiante est enfermée dans des matériaux, et elle n'en
   * sort que si on les abîme. Quatre emplacements suffisent à le montrer — la
   * liste réglementaire complète n'aurait aucun intérêt ici.
   *
   * Les libellés sont posés à l'intérieur du viewBox, avec assez de marge pour
   * ne jamais être coupés.
   */
  interface Lieu {
    nom: string;
    /** Point sur le bâti. */
    point: [number, number];
    /** Ancre du texte, et son côté. */
    texte: [number, number];
    cote: 'gauche' | 'droite';
  }

  const LIEUX: Lieu[] = [
    { nom: 'Toiture en fibrociment', point: [300, 74], texte: [372, 62], cote: 'droite' },
    { nom: 'Conduits, tuyaux', point: [252, 132], texte: [372, 122], cote: 'droite' },
    { nom: 'Faux plafond', point: [216, 116], texte: [178, 100], cote: 'gauche' },
    { nom: 'Dalles de sol et leur colle', point: [240, 202], texte: [178, 200], cote: 'gauche' }
  ];
</script>

<figure>
  <svg
    viewBox="0 0 560 240"
    role="img"
    aria-label="Coupe d’une maison montrant quatre endroits où l’on trouve de l’amiante : la toiture en fibrociment, les conduits, les faux plafonds, les dalles de sol et leur colle."
  >
    <!-- Maison en coupe, au centre -->
    <path d="M196 84 L266 44 L336 84 Z" class="toit" />
    <rect x="206" y="84" width="120" height="126" class="mur" />
    <line x1="206" y1="116" x2="326" y2="116" class="separation" />
    <rect x="206" y="198" width="120" height="12" class="separation-pleine" />
    <rect x="246" y="122" width="14" height="76" class="conduit" />

    {#each LIEUX as lieu (lieu.nom)}
      <line
        x1={lieu.point[0]}
        y1={lieu.point[1]}
        x2={lieu.cote === 'droite' ? lieu.texte[0] - 8 : lieu.texte[0] + 8}
        y2={lieu.texte[1] - 4}
        class="amorce"
      />
      <circle cx={lieu.point[0]} cy={lieu.point[1]} r="7" class="point" />
      <text
        x={lieu.texte[0]}
        y={lieu.texte[1]}
        class="etiquette"
        text-anchor={lieu.cote === 'droite' ? 'start' : 'end'}
      >
        {lieu.nom}
      </text>
    {/each}
  </svg>

  <p class="regle">
    <strong>À retenir :</strong> tant qu’on n’y touche pas, ces matériaux ne libèrent rien. Le
    danger commence quand on perce, on ponce, on scie — ou quand le matériau se dégrade tout seul.
  </p>
</figure>

<style>
  figure {
    margin: 0;
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

  .separation {
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .separation-pleine,
  .conduit {
    fill: var(--trait);
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .point {
    fill: var(--attention);
    stroke: var(--papier);
    stroke-width: 2;
  }

  .amorce {
    stroke: var(--attention);
    stroke-width: 1.5;
    stroke-dasharray: 3 3;
  }

  .etiquette {
    font-size: 13px;
    fill: var(--encre);
  }

  .regle {
    margin: 14px 0 0;
    padding: 12px 14px;
    background: var(--papier-doux);
    border-left: 4px solid var(--attention);
    border-radius: 8px;
    font-size: 0.94rem;
  }
</style>
