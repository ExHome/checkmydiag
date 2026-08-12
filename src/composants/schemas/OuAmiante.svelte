<script lang="ts">
  /**
   * Où l'amiante se cache dans un logement d'avant 1997, et pourquoi il n'est
   * dangereux que lorsqu'on y touche.
   */
  const endroits = [
    { nom: 'Toiture et bardage en fibrociment', x: 300, y: 46, cx: 250, cy: 66 },
    { nom: 'Conduits et calorifugeage', x: 82, y: 118, cx: 152, cy: 128 },
    { nom: 'Dalles de sol et leur colle', x: 300, y: 196, cx: 232, cy: 196 },
    { nom: 'Faux plafonds, cloisons', x: 82, y: 88, cx: 176, cy: 100 }
  ];
</script>

<figure>
  <svg viewBox="0 0 420 230" role="img" aria-label="Coupe d’une maison indiquant les emplacements typiques de l’amiante : toiture en fibrociment, conduits calorifugés, dalles de sol et leur colle, faux plafonds.">
    <!-- Maison en coupe -->
    <path d="M130 76 L200 36 L270 76 Z" class="toit" />
    <rect x="140" y="76" width="120" height="126" class="mur" />
    <line x1="140" y1="112" x2="260" y2="112" class="dalle" />
    <rect x="140" y="190" width="120" height="12" class="sol" />
    <rect x="146" y="118" width="14" height="74" class="conduit" />

    <!-- Points d'attention -->
    {#each endroits as lieu (lieu.nom)}
      <circle cx={lieu.cx} cy={lieu.cy} r="7" class="point" />
      <line
        x1={lieu.cx}
        y1={lieu.cy}
        x2={lieu.x > 200 ? lieu.x - 8 : lieu.x + 8}
        y2={lieu.y - 4}
        class="amorce"
      />
      <text x={lieu.x} y={lieu.y} class="etiquette" text-anchor={lieu.x > 200 ? 'start' : 'end'}>
        {lieu.nom}
      </text>
    {/each}
  </svg>

  <p class="regle">
    <strong>La règle à retenir :</strong> un matériau amianté en bon état, qu’on laisse tranquille,
    ne libère rien. Le danger commence quand on perce, ponce, scie ou casse — ou quand le matériau
    se dégrade tout seul.
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

  .dalle,
  .sol,
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
    stroke-dasharray: 3 2;
  }

  .etiquette {
    font-size: 12px;
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
