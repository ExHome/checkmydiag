<script lang="ts">
  /**
   * UN BANDEAU DU RAPPORT — la preuve, découpée dans la page.
   *
   * ── Pourquoi montrer plutôt que dire ───────────────────────────────────────
   *
   * Une partie du DPE est imprimée en image : la double étiquette, l'estimation
   * des coûts, les classes projetées après travaux. Aucune extraction de texte
   * ne les atteindra. On ne peut pas les lire — on peut les montrer, et c'est
   * la seule façon honnête d'afficher un « E → C » après travaux : on ne
   * l'écrit pas, on découpe la bande où il est déjà écrit.
   *
   * ── L'UX : replié par défaut, et il dit pourquoi il vaut d'être ouvert ─────
   *
   * Ces bandes sont larges et denses. Ouvertes d'office, elles poussent les
   * cartes hors de l'écran et le lecteur perd le fil. Le bandeau s'annonce donc
   * par sa légende — « Les classes projetées après travaux, imprimées sur votre
   * rapport » — et ne s'ouvre que si on le demande.
   *
   * Le numéro de page est écrit à côté : c'est la traçabilité du §21, niveau 4.
   * Le lecteur peut retrouver la bande dans son PDF, et vérifier que nous
   * n'avons rien arrangé.
   */
  import type { BandeauDecoupe } from '../../lib/pdf';

  const {
    bandeau = null,
    ouvertParDefaut = false
  }: { bandeau?: BandeauDecoupe | null; ouvertParDefaut?: boolean } = $props();

  let ouvert = $state(ouvertParDefaut);
</script>

{#if bandeau}
  <figure class="bandeau">
    <button type="button" aria-expanded={ouvert} onclick={() => (ouvert = !ouvert)}>
      <span class="signe" aria-hidden="true">{ouvert ? '−' : '+'}</span>
      <span class="legende">{bandeau.legende}</span>
      <span class="page">page {bandeau.page}</span>
    </button>

    {#if ouvert}
      <img
        src={bandeau.photo.image}
        alt={bandeau.legende}
        width={bandeau.photo.largeur}
        height={bandeau.photo.hauteur}
      />
      <figcaption>
        Découpé dans votre rapport, page {bandeau.page}. Rien n’a été redessiné ni
        recalculé.
      </figcaption>
    {/if}
  </figure>
{/if}

<style>
  .bandeau {
    margin: 0;
    display: grid;
    gap: 0.5rem;
  }

  button {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    width: 100%;
    padding: 0.55rem 0.8rem;
    border: 1px solid var(--verriere-sable-filet, #d8c199);
    border-radius: 8px;
    background: transparent;
    font: inherit;
    font-size: 0.82rem;
    text-align: left;
    color: var(--vert-verriere, #12463b);
    cursor: pointer;
  }

  button:hover,
  button:focus-visible {
    background: var(--surface, rgb(10 43 35 / 3%));
  }

  .signe {
    font-weight: 700;
  }

  .legende {
    flex: 1;
  }

  .page {
    font-size: 0.72rem;
    color: var(--verriere-sable-encre, #896c33);
  }

  /*
    L'image garde ses proportions et ne déborde jamais : une bande de rapport
    est large, et sur un téléphone elle doit rétrécir, pas pousser la page de
    côté.
  */
  img {
    display: block;
    width: 100%;
    height: auto;
    border: 1px solid var(--surface-forte, rgb(10 43 35 / 6%));
    border-radius: 6px;
    background: #fff;
  }

  figcaption {
    font-size: 0.74rem;
    line-height: 1.45;
    color: var(--encre-doux, #4a5a55);
  }
</style>
