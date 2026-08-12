<script lang="ts">
  /**
   * Le déroulé de l'analyse, pendant qu'elle se fait.
   *
   * Deux raisons : l'attente devient lisible, et le lecteur apprend au passage
   * ce qu'on vérifie dans un dossier de diagnostics. Aucune étape n'est
   * inventée — chacune correspond à un travail réellement effectué.
   */
  interface Props {
    /** Index de l'étape en cours. */
    etape: number;
    /** Progression de la lecture des pages, quand elle est connue. */
    pages: { fait: number; total: number } | null;
  }

  const { etape, pages }: Props = $props();

  const ETAPES = [
    { titre: 'On ouvre votre dossier', detail: 'Le fichier reste sur votre appareil.' },
    { titre: 'On lit chaque page', detail: 'Texte, chiffres, tableaux.' },
    { titre: 'On repère les diagnostics', detail: 'Un dossier en contient souvent huit ou neuf.' },
    { titre: 'On vérifie les dates', detail: 'Certains diagnostics ne valent que six mois.' },
    { titre: 'On prépare les explications', detail: 'Ce que ça veut dire, en français.' }
  ];
</script>

<div class="etapes" role="status" aria-live="polite">
  {#each ETAPES as e, i (e.titre)}
    <div class="etape" class:faite={i < etape} class:active={i === etape}>
      <span class="marque" aria-hidden="true">
        {#if i < etape}✓{:else if i === etape}<span class="pulse"></span>{/if}
      </span>
      <div>
        <p class="titre">
          {e.titre}
          {#if i === 1 && i === etape && pages}
            <span class="compteur">{pages.fait} / {pages.total}</span>
          {/if}
        </p>
        <p class="detail">{e.detail}</p>
      </div>
    </div>
  {/each}
</div>

<style>
  .etapes {
    display: grid;
    gap: 2px;
    text-align: left;
    max-width: 420px;
    margin: 8px auto 0;
  }

  .etape {
    display: grid;
    grid-template-columns: 30px 1fr;
    gap: 12px;
    align-items: start;
    padding: 9px 10px;
    border-radius: var(--rayon-petit);
    opacity: 0.4;
    transition: opacity 0.3s ease, background 0.3s ease;
  }

  .etape.active {
    opacity: 1;
    background: rgb(46 233 139 / 8%);
  }

  .etape.faite {
    opacity: 0.75;
  }

  .marque {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1.5px solid var(--trait);
    color: var(--vert-500);
    font-size: 0.8rem;
    font-weight: 800;
  }

  .etape.faite .marque {
    border-color: var(--vert-500);
  }

  .etape.active .marque {
    border-color: var(--vert-500);
    box-shadow: 0 0 16px -2px var(--vert-500);
  }

  .pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--vert-500);
    animation: battement 1.1s ease-in-out infinite;
  }

  @keyframes battement {
    0%,
    100% {
      transform: scale(0.7);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.15);
      opacity: 1;
    }
  }

  .titre {
    margin: 0;
    font-weight: 650;
    font-size: 0.97rem;
  }

  .compteur {
    color: var(--vert-500);
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    margin-left: 6px;
  }

  .detail {
    margin: 0;
    font-size: 0.85rem;
    color: var(--encre-doux);
  }
</style>
