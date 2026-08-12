<script lang="ts">
  /**
   * Pourquoi une vieille peinture est dangereuse : la chaîne complète, en quatre
   * temps. C'est ce qui manque le plus au lecteur d'un CREP — le rapport lui
   * donne des classes, pas le mécanisme.
   */
  const etapes = [
    { titre: 'Peinture ancienne', texte: 'Avant 1949, les peintures contenaient du plomb. Intacte, elle ne présente pas de danger.' },
    { titre: 'Elle se dégrade', texte: 'Frottements, humidité, chocs : la peinture s’écaille et part en poussière.' },
    { titre: 'Poussière au sol', texte: 'La poussière se dépose sur les sols, les rebords, les jouets. Elle est invisible.' },
    { titre: 'Un enfant l’ingère', texte: 'Main à la bouche : c’est la voie d’intoxication principale. On parle de saturnisme.' }
  ];
</script>

<figure>
  <div class="chaine">
    {#each etapes as etape, i (etape.titre)}
      <div class="etape">
        <div class="dessin" aria-hidden="true">
          <svg viewBox="0 0 80 80">
            {#if i === 0}
              <rect x="14" y="14" width="52" height="52" rx="3" class="mur" />
              <path d="M22 26h36M22 38h36M22 50h24" class="trait-mur" />
            {:else if i === 1}
              <rect x="14" y="14" width="52" height="52" rx="3" class="mur" />
              <path d="M30 20 l8 14 -12 6 10 12 -8 10" class="fissure" />
              <path d="M52 44 l6 5 -3 7" class="ecaille" />
            {:else if i === 2}
              <rect x="14" y="54" width="52" height="12" rx="2" class="sol-plomb" />
              <g class="poussiere">
                <circle cx="26" cy="46" r="2.5" />
                <circle cx="40" cy="40" r="2" />
                <circle cx="52" cy="48" r="3" />
                <circle cx="34" cy="52" r="1.8" />
                <circle cx="58" cy="38" r="1.8" />
              </g>
            {:else}
              <circle cx="40" cy="28" r="13" class="enfant" />
              <path d="M27 68c0-9 6-15 13-15s13 6 13 15" class="enfant" />
              <circle cx="55" cy="40" r="4" class="danger" />
            {/if}
          </svg>
        </div>
        <h4>{etape.titre}</h4>
        <p class="muet petit">{etape.texte}</p>
      </div>
      {#if i < etapes.length - 1}
        <div class="lien" aria-hidden="true">→</div>
      {/if}
    {/each}
  </div>
</figure>

<style>
  figure {
    margin: 0;
  }

  .chaine {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    align-items: start;
  }

  .etape {
    text-align: center;
    padding: 0 4px;
  }

  .dessin svg {
    width: 68px;
    height: 68px;
  }

  h4 {
    font-family: var(--police);
    font-size: 0.9rem;
    margin: 4px 0 4px;
  }

  .etape p {
    margin: 0;
    font-size: 0.82rem;
    line-height: 1.45;
  }

  .lien {
    display: none;
  }

  .mur {
    fill: var(--papier-doux);
    stroke: var(--encre-doux);
    stroke-width: 2;
  }

  .trait-mur {
    stroke: var(--trait);
    stroke-width: 2;
    fill: none;
  }

  .fissure,
  .ecaille {
    fill: none;
    stroke: var(--attention);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .sol-plomb {
    fill: var(--trait);
  }

  .poussiere circle {
    fill: var(--attention);
    opacity: 0.8;
  }

  .enfant {
    fill: none;
    stroke: var(--encre-doux);
    stroke-width: 2.5;
    stroke-linecap: round;
  }

  .danger {
    fill: var(--alerte);
  }

  /* Sur petit écran, la chaîne se lit de haut en bas. */
  @media (max-width: 620px) {
    .chaine {
      grid-template-columns: 1fr;
      gap: 2px;
    }

    .etape {
      display: grid;
      grid-template-columns: 60px 1fr;
      column-gap: 12px;
      text-align: left;
      align-items: center;
    }

    .dessin {
      grid-row: span 2;
    }

    .dessin svg {
      width: 56px;
      height: 56px;
    }

    h4 {
      align-self: end;
      margin: 0;
    }

    .etape p {
      align-self: start;
    }

    .lien {
      display: block;
      color: var(--trait);
      transform: rotate(90deg);
      margin-left: 22px;
      line-height: 1;
    }
  }
</style>
