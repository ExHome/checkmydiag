<script lang="ts">
  import type { Etiquette, Lettre } from '../lib/modele';

  interface Props {
    titre: string;
    sousTitre: string;
    etiquette: Etiquette;
    /** Bornes hautes de chaque classe, pour afficher l'échelle. */
    seuils: number[];
  }

  const { titre, sousTitre, etiquette, seuils }: Props = $props();

  const LETTRES: Lettre[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  const HAUTEUR = 30;
  const ECART = 6;
  const LARGEUR_MIN = 96;
  const LARGEUR_MAX = 250;

  function largeur(i: number): number {
    return LARGEUR_MIN + ((LARGEUR_MAX - LARGEUR_MIN) * i) / (LETTRES.length - 1);
  }

  function borne(i: number): string {
    const bas = i === 0 ? null : seuils[i - 1];
    const haut = seuils[i];
    if (bas === null && haut !== undefined) return `≤ ${haut}`;
    if (haut === undefined && bas !== undefined) return `> ${bas}`;
    return `${bas} à ${haut}`;
  }
</script>

<figure class="etiquette">
  <figcaption>
    <strong>{titre}</strong>
    <span class="muet petit">{sousTitre}</span>
  </figcaption>

  <svg viewBox="0 0 330 {LETTRES.length * (HAUTEUR + ECART)}" role="img"
       aria-label="{titre} : classe {etiquette.lettre}, {etiquette.valeur} {etiquette.unite}">
    {#each LETTRES as lettre, i (lettre)}
      {@const y = i * (HAUTEUR + ECART)}
      {@const l = largeur(i)}
      {@const active = lettre === etiquette.lettre}
      <g opacity={active ? 1 : 0.55}>
        <!-- Flèche : rectangle terminé par une pointe, comme sur l'étiquette officielle. -->
        <path
          d="M0 {y} H{l} L{l + 14} {y + HAUTEUR / 2} L{l} {y + HAUTEUR} H0 Z"
          fill="var(--etq-{lettre.toLowerCase()})"
        />
        <text x="12" y={y + HAUTEUR / 2 + 5} class="lettre">{lettre}</text>
        <text x={l - 8} y={y + HAUTEUR / 2 + 4} class="borne" text-anchor="end">{borne(i)}</text>
      </g>
      {#if active}
        <g>
          <rect x="-2" y={y - 2} width={l + 18} height={HAUTEUR + 4} rx="3"
                fill="none" stroke="var(--encre)" stroke-width="2.5" />
          <text x={l + 24} y={y + HAUTEUR / 2 + 5} class="valeur">{etiquette.valeur}</text>
        </g>
      {/if}
    {/each}
  </svg>

  <p class="unite muet petit">{etiquette.unite}</p>
</figure>

<style>
  .etiquette {
    margin: 0;
  }

  figcaption {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
  }

  svg {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .lettre {
    font-weight: 700;
    font-size: 17px;
    fill: #1b1b1b;
  }

  .borne {
    font-size: 11px;
    fill: #1b1b1b;
    opacity: 0.75;
  }

  .valeur {
    font-size: 15px;
    font-weight: 700;
    fill: var(--encre);
  }

  .unite {
    margin: 6px 0 0;
  }
</style>
