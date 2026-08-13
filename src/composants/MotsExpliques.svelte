<script lang="ts">
  /**
   * Un texte dont les mots du métier s'expliquent sur place.
   *
   * Le retour du notaire emploie forcément des termes de la profession —
   * passoire, audit, DGI, opposable. Les éviter appauvrirait le propos ; les
   * laisser sans explication trahirait le devoir de conseil. On les souligne
   * donc, et un clic donne la définition, à l'endroit exact où le mot est lu.
   */
  const { texte }: { texte: string } = $props();

  import { LEXIQUE } from '../lib/lexique';

  interface Bout {
    texte: string;
    definition?: string;
  }

  /**
   * Découpe le texte en morceaux, en isolant les termes reconnus.
   *
   * On avance de gauche à droite en prenant à chaque fois la première
   * occurrence, quel que soit le mot : sans ça, l'ordre du dictionnaire
   * dicterait le découpage et les termes se chevaucheraient.
   */
  const bouts = $derived.by<Bout[]>(() => {
    const morceaux: Bout[] = [];
    let reste = texte;

    while (reste) {
      let debut = -1;
      let trouve: { mot: (typeof LEXIQUE)[number]; texte: string } | null = null;

      for (const mot of LEXIQUE) {
        const m = reste.match(mot.motif);
        if (!m || m.index === undefined) continue;
        if (debut === -1 || m.index < debut) {
          debut = m.index;
          trouve = { mot, texte: m[0] };
        }
      }

      if (!trouve || debut === -1) {
        morceaux.push({ texte: reste });
        break;
      }

      if (debut > 0) morceaux.push({ texte: reste.slice(0, debut) });
      morceaux.push({ texte: trouve.texte, definition: trouve.mot.definition });
      reste = reste.slice(debut + trouve.texte.length);
    }

    return morceaux;
  });

  let ouvert = $state<string | null>(null);
</script>

{#each bouts as bout, i (i)}
  {#if bout.definition}
    <button
      type="button"
      class="terme"
      class:ouvert={ouvert === bout.texte}
      onclick={() => (ouvert = ouvert === bout.texte ? null : bout.texte)}
    >
      {bout.texte}
    </button>
  {:else}
    {bout.texte}
  {/if}
{/each}

{#if ouvert}
  {@const def = bouts.find((b) => b.texte === ouvert)?.definition}
  {#if def}
    <span class="definition apparait">{def}</span>
  {/if}
{/if}

<style>
  /* Le mot reste dans la phrase : on ne le sort pas, on le souligne.

     Le rembourrage vertical, compensé par une marge négative, agrandit la zone
     touchable sans toucher à l'interligne : sur un téléphone, ces mots faisaient
     23 px de haut, soit la moitié de ce qu'un pouce vise. La ligne du texte ne
     bouge pas d'un pixel — un rembourrage vertical sur une boîte en ligne ne
     compte pas dans la hauteur de ligne. */
  .terme {
    display: inline;
    background: none;
    border: none;
    padding: 11px 0;
    margin: -11px 0;
    font: inherit;
    color: inherit;
    cursor: help;
    text-decoration: underline dotted;
    text-decoration-color: var(--or);
    text-underline-offset: 3px;
  }

  .terme:hover,
  .terme.ouvert {
    color: var(--or-clair);
    text-decoration-style: solid;
  }

  .definition {
    display: block;
    margin: 8px 0 4px;
    padding: 10px 13px;
    border-left: 2px solid var(--or);
    background: rgb(255 255 255 / 6%);
    border-radius: 0 var(--rayon-petit) var(--rayon-petit) 0;
    font-size: var(--t-base);
    line-height: 1.45;
    color: var(--sur-fond-doux);
  }
</style>
