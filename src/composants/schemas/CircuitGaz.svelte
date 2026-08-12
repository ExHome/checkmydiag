<script lang="ts">
  /**
   * Ce que contrôle le diagnostic gaz : le trajet du gaz, celui de l'air, et
   * celui des fumées. Les trois doivent être libres — le monoxyde de carbone
   * vient toujours d'un de ces trois trajets bouché.
   */
</script>

<figure>
  <svg viewBox="0 0 460 250" role="img" aria-label="Coupe d’une pièce avec une chaudière : le gaz arrive par la tuyauterie, l’air entre par la grille basse, les fumées sortent par le conduit. Une grille obstruée provoque du monoxyde de carbone.">
    <rect x="20" y="30" width="420" height="190" rx="4" class="piece" />

    <!-- Chaudière -->
    <rect x="230" y="96" width="86" height="96" rx="4" class="chaudiere" />
    <rect x="246" y="150" width="54" height="28" rx="3" class="foyer" />
    <path d="M256 172c2-8 8-8 8-16 4 6 10 8 10 16" class="flamme" />
    <path d="M280 172c1-6 6-6 6-12 3 5 7 6 7 12" class="flamme" />

    <!-- Arrivée de gaz -->
    <path d="M20 176 H230" class="gaz" />
    <text x="40" y="168" class="repere gaz-texte">gaz</text>

    <!-- Évacuation des fumées -->
    <path d="M273 96 V52 H400 V30" class="fumee" />
    <text x="330" y="44" class="repere fumee-texte">fumées</text>

    <!-- Entrée d'air : grille basse -->
    <rect x="60" y="186" width="46" height="26" rx="2" class="grille" />
    <path d="M66 192h34M66 199h34M66 206h34" class="barreaux" />
    <path d="M112 199 H226" class="air" />
    <text x="83" y="182" class="repere">grille d’air</text>

    <!-- Ce qui arrive si la grille est bouchée -->
    <g class="alerte-groupe">
      <path d="M83 226 v-10" class="croix-amorce" />
      <circle cx="83" cy="234" r="11" class="rond-alerte" />
      <path d="M78 229l10 10M88 229l-10 10" class="croix" />
      <text x="106" y="239" class="avertissement">
        Grille bouchée = monoxyde de carbone (invisible et inodore)
      </text>
    </g>
  </svg>
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

  .piece {
    fill: var(--papier-doux);
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .chaudiere {
    fill: var(--papier);
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .foyer {
    fill: var(--papier-doux);
    stroke: var(--encre-doux);
    stroke-width: 1.5;
  }

  .flamme {
    fill: none;
    stroke: var(--attention);
    stroke-width: 2.5;
    stroke-linecap: round;
  }

  .gaz {
    stroke: var(--or);
    stroke-width: 4;
    fill: none;
    stroke-linecap: round;
  }

  .fumee {
    stroke: var(--encre-doux);
    stroke-width: 3;
    fill: none;
    stroke-dasharray: 7 5;
    stroke-linecap: round;
  }

  .air {
    stroke: var(--vert-500);
    stroke-width: 3;
    fill: none;
    stroke-dasharray: 6 5;
    stroke-linecap: round;
  }

  .grille {
    fill: var(--vert-100);
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .barreaux {
    stroke: var(--encre-doux);
    stroke-width: 1.5;
    fill: none;
  }

  .repere {
    font-size: 12px;
    fill: var(--encre-doux);
    text-anchor: middle;
  }

  .gaz-texte {
    fill: var(--or);
    font-weight: 600;
  }

  .rond-alerte {
    fill: var(--alerte-fond);
    stroke: var(--alerte);
    stroke-width: 2;
  }

  .croix {
    stroke: var(--alerte);
    stroke-width: 2.5;
    stroke-linecap: round;
  }

  .croix-amorce {
    stroke: var(--alerte);
    stroke-width: 1.5;
    stroke-dasharray: 3 2;
  }

  .avertissement {
    font-size: 12.5px;
    fill: var(--alerte);
    font-weight: 600;
  }
</style>
