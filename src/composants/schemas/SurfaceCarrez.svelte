<script lang="ts">
  /**
   * Pourquoi trois surfaces différentes coexistent pour un même logement.
   * C'est la question que tout acheteur se pose devant son dossier.
   */
</script>

<figure>
  <svg viewBox="0 0 460 200" role="img" aria-label="Coupe sous combles : sous 1,80 mètre de hauteur, la surface ne compte pas dans la loi Carrez. Les murs, cloisons et gaines sont également déduits.">
    <!-- Coupe sous rampant -->
    <path d="M40 160 L230 40 L420 160 Z" class="volume" />
    <rect x="40" y="160" width="380" height="10" class="plancher" />

    <!-- Ligne des 1,80 m -->
    <line x1="40" y1="112" x2="420" y2="112" class="ligne-seuil" />
    <text x="230" y="106" class="seuil">1,80 m de hauteur</text>

    <!-- Zone comptée -->
    <path d="M133 112 L230 51 L327 112 Z" class="comptee" />
    <text x="230" y="98" class="dedans">compté</text>

    <!-- Zones non comptées -->
    <text x="86" y="146" class="dehors">non compté</text>
    <text x="376" y="146" class="dehors">non compté</text>

    <!-- Cotes -->
    <path d="M133 120 v22 M327 120 v22 M133 131 H327" class="cote" />
    <text x="230" y="158" class="repere">surface loi Carrez</text>
  </svg>

  <ul class="comparaison">
    <li><strong>Loi Carrez</strong> — pour la vente d’un lot en copropriété. Plancher sous 1,80 m exclu, murs et cloisons déduits.</li>
    <li><strong>Loi Boutin</strong> — pour le bail d’habitation. Règles voisines, mais périmètre différent.</li>
    <li><strong>Surface de référence du DPE</strong> — sert au calcul énergétique, pas à la vente.</li>
  </ul>
  <p class="muet petit">
    Trois chiffres différents pour le même logement, c’est normal : ils ne répondent pas à la même
    question.
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

  .volume {
    fill: var(--papier-doux);
    stroke: var(--encre-doux);
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .plancher {
    fill: var(--trait);
  }

  .comptee {
    fill: var(--vert-100);
    stroke: var(--vert-500);
    stroke-width: 2;
  }

  .ligne-seuil {
    stroke: var(--vert-500);
    stroke-width: 2;
    stroke-dasharray: 6 4;
  }

  .seuil {
    font-size: 12px;
    fill: var(--vert-500);
    text-anchor: middle;
    font-weight: 600;
  }

  .dedans {
    font-size: 12px;
    fill: var(--vert-700);
    text-anchor: middle;
    font-weight: 600;
  }

  .dehors {
    font-size: 12px;
    fill: var(--encre-doux);
    text-anchor: middle;
  }

  .cote {
    stroke: var(--encre-doux);
    stroke-width: 1.5;
    fill: none;
  }

  .repere {
    font-size: 12px;
    fill: var(--encre-doux);
    text-anchor: middle;
  }

  .comparaison {
    margin: 16px 0 8px;
    padding-left: 1.1em;
    font-size: 0.94rem;
  }

  .comparaison li {
    margin-bottom: 6px;
  }
</style>
