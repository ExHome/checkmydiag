<script lang="ts">
  /**
   * L'icône d'un diagnostic.
   *
   * Des icônes en couleurs, pas des traits gris : on reconnaît la fourmi, la
   * flamme, l'éclair avant même de lire le mot. La taille suit celle du texte
   * du parent, qui décide s'il la veut grosse ou discrète.
   */
  import type { TypeDiag } from '../lib/modele';

  const { type }: { type: TypeDiag } = $props();

  const ICONES: Record<TypeDiag, string> = {
    dpe: '🌡️',
    amiante: '☣️',
    plomb: '🎨',
    termites: '🐜',
    electricite: '⚡',
    gaz: '🔥',
    erp: '🌊',
    carrez: '📐',
    assainissement: '💧'
  };
</script>

<span class="icone" aria-hidden="true">{ICONES[type] ?? '📄'}</span>

<style>
  .icone {
    font-size: inherit;
    line-height: 1;
    /* Les émojis monochromes de certains systèmes redeviennent des dessins
       pleins avec la police couleur du système. */
    font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
    filter: drop-shadow(0 2px 2px rgb(0 0 0 / 18%));
  }
</style>
