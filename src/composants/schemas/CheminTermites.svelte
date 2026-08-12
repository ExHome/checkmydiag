<script lang="ts">
  /**
   * Par où les termites arrivent et pourquoi le diagnostic ne peut pas tout
   * voir : ils vivent dans le sol et progressent à l'abri du regard.
   */
</script>

<figure>
  <svg viewBox="0 0 460 240" role="img" aria-label="Coupe d’une maison : les termites vivent dans le sol, remontent le long des fondations par des galeries et attaquent les bois de l’intérieur, sans traces visibles en surface.">
    <!-- Sol -->
    <rect x="0" y="170" width="460" height="70" class="terre" />
    <text x="40" y="200" class="repere-sol">le sol</text>

    <!-- Bâti -->
    <rect x="140" y="70" width="180" height="100" class="mur" />
    <path d="M126 70 L230 24 L334 70 Z" class="toit" />
    <rect x="150" y="60" width="160" height="12" class="charpente" />
    <rect x="140" y="160" width="180" height="10" class="plancher" />

    <!-- Cheminement -->
    <path d="M210 210 C210 190 196 186 196 168 C196 140 208 132 208 108 C208 88 214 80 214 72"
          class="galerie" />
    <circle cx="210" cy="212" r="14" class="nid" />
    <text x="248" y="216" class="repere">colonie dans le sol</text>

    <!-- Zones attaquées -->
    <circle cx="214" cy="68" r="8" class="attaque" />
    <circle cx="200" cy="164" r="8" class="attaque" />
    <text x="330" y="60" class="repere gauche">charpente</text>
    <text x="330" y="160" class="repere gauche">plancher, plinthes</text>
    <line x1="222" y1="66" x2="322" y2="56" class="amorce" />
    <line x1="208" y1="162" x2="322" y2="156" class="amorce" />
  </svg>

  <p class="regle">
    <strong>Ce que le diagnostic ne peut pas faire :</strong> il regarde, il ne démonte rien. Les
    termites travaillent l’intérieur du bois en laissant la surface intacte — un plancher peut
    sonner creux sans qu’aucune trace ne soit visible. D’où sa validité très courte : six mois.
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

  .terre {
    fill: var(--attention-fond);
  }

  .mur {
    fill: var(--papier-doux);
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .toit {
    fill: var(--vert-100);
    stroke: var(--encre-doux);
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .charpente,
  .plancher {
    fill: var(--trait);
    stroke: var(--encre-doux);
    stroke-width: 1.5;
  }

  .galerie {
    fill: none;
    stroke: var(--alerte);
    stroke-width: 3;
    stroke-dasharray: 6 4;
    stroke-linecap: round;
  }

  .nid {
    fill: var(--alerte);
    opacity: 0.85;
  }

  .attaque {
    fill: var(--alerte-fond);
    stroke: var(--alerte);
    stroke-width: 2.5;
  }

  .repere {
    font-size: 12px;
    fill: var(--encre-doux);
  }

  .repere-sol {
    font-size: 12px;
    fill: var(--attention);
  }

  .amorce {
    stroke: var(--alerte);
    stroke-width: 1.5;
    stroke-dasharray: 3 2;
  }

  .regle {
    margin: 14px 0 0;
    padding: 12px 14px;
    background: var(--papier-doux);
    border-left: 4px solid var(--encre-doux);
    border-radius: 8px;
    font-size: 0.94rem;
  }
</style>
