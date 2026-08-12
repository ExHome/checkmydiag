<script lang="ts">
  /**
   * Les six points que contrôle le diagnostic électrique, replacés dans le
   * logement. Le rapport les nomme par des références de norme ; ici on montre
   * où ils se trouvent et à quoi ils servent.
   */
  const points = [
    { n: 1, nom: 'Coupure d’urgence', role: 'Un interrupteur accessible pour tout couper en cas de problème.' },
    { n: 2, nom: 'Différentiel 30 mA', role: 'Coupe le courant si l’électricité fuit vers vous. C’est ce qui sauve des vies.' },
    { n: 3, nom: 'Prise de terre', role: 'Évacue le courant qui s’échappe vers le sol, au lieu de vous traverser.' },
    { n: 4, nom: 'Disjoncteurs adaptés', role: 'Coupent avant que les fils ne chauffent : c’est la protection contre l’incendie.' },
    { n: 5, nom: 'Salle de bains', role: 'Eau et électricité : règles renforcées à proximité de la douche et de la baignoire.' },
    { n: 6, nom: 'Matériel vétuste', role: 'Fils dénudés, prises cassées, matériel hors d’âge accessible au doigt.' }
  ];

  /** Chaque pastille est posée sur l'élément qu'elle désigne, pas à côté. */
  const REPERES = [
    { n: 1, x: 58, y: 58 }, // coin du tableau : la coupure d'urgence
    { n: 2, x: 114, y: 66 }, // première rangée : le différentiel
    { n: 4, x: 114, y: 98 }, // rangée des disjoncteurs
    { n: 3, x: 58, y: 186 }, // symbole de terre
    { n: 5, x: 368, y: 138 }, // salle de bains
    { n: 6, x: 256, y: 158 } // prise en mauvais état
  ];
</script>

<figure>
  <svg viewBox="0 0 480 240" role="img" aria-label="Plan d’un logement situant les six points de contrôle du diagnostic électrique.">
    <!-- Le logement -->
    <rect x="20" y="20" width="440" height="200" rx="6" class="piece" />
    <line x1="290" y1="20" x2="290" y2="220" class="cloison" />
    <text x="150" y="212" class="nom-piece">Pièces de vie</text>
    <text x="375" y="212" class="nom-piece">Salle de bains</text>

    <!-- Tableau électrique -->
    <rect x="44" y="46" width="86" height="66" rx="4" class="tableau" />
    <path d="M56 66h62M56 82h62M56 98h62" class="rangees" />
    <text x="87" y="130" class="legende-svg">Tableau</text>

    <!-- Terre -->
    <path d="M87 140 L87 178" class="fil" />
    <path d="M70 178h34M76 186h22M82 194h10" class="terre" />

    <!-- Circuits vers les pièces -->
    <path d="M130 79 L200 79 L200 60" class="fil" />
    <path d="M130 92 L230 92 L230 150" class="fil" />
    <path d="M130 66 L330 66 L330 96" class="fil" />

    <!-- Prise et douche -->
    <rect x="192" y="44" width="16" height="16" rx="2" class="objet" />
    <rect x="222" y="150" width="16" height="16" rx="2" class="objet" />
    <path d="M330 96 v54" class="fil" />
    <path d="M316 150h28" class="douche" />
    <path d="M322 160v14M330 158v18M338 160v14" class="eau" />

    <!-- Pastilles numérotées, posées sur l'élément qu'elles désignent -->
    {#each REPERES as repere (repere.n)}
      <g class="pastille">
        <circle cx={repere.x} cy={repere.y} r="12" />
        <text x={repere.x} y={repere.y + 4}>{repere.n}</text>
      </g>
    {/each}
  </svg>

  <ol class="legende">
    {#each points as point (point.n)}
      <li>
        <span class="numero">{point.n}</span>
        <span><strong>{point.nom}</strong> — {point.role}</span>
      </li>
    {/each}
  </ol>
</figure>

<style>
  figure {
    margin: 0;
  }

  svg {
    width: 100%;
    height: auto;
  }

  .piece {
    fill: var(--papier-doux);
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .cloison {
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .tableau {
    fill: var(--papier);
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .rangees {
    stroke: var(--trait);
    stroke-width: 3;
    fill: none;
  }

  .fil {
    stroke: var(--vert-500);
    stroke-width: 2;
    fill: none;
  }

  .terre {
    stroke: var(--vert-700);
    stroke-width: 2.5;
    fill: none;
    stroke-linecap: round;
  }

  .objet {
    fill: var(--vert-100);
    stroke: var(--encre-doux);
    stroke-width: 1.5;
  }

  .douche {
    stroke: var(--encre-doux);
    stroke-width: 3;
    stroke-linecap: round;
  }

  .eau {
    stroke: var(--vert-500);
    stroke-width: 2;
    stroke-linecap: round;
    fill: none;
  }

  .nom-piece,
  .legende-svg {
    font-size: 12px;
    fill: var(--encre-doux);
    text-anchor: middle;
  }

  .pastille circle {
    fill: var(--vert-700);
  }

  .pastille text {
    fill: #fff;
    font-size: 12px;
    font-weight: 700;
    text-anchor: middle;
  }

  .legende {
    list-style: none;
    margin: 16px 0 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }

  .legende li {
    display: grid;
    grid-template-columns: 26px 1fr;
    gap: 10px;
    align-items: start;
    font-size: 0.92rem;
  }

  .numero {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--vert-700);
    color: #fff;
    font-size: 0.78rem;
    font-weight: 700;
  }
</style>
