<script lang="ts">
  /**
   * QUAND VERRIÈRE NE RECONNAÎT PAS LE FORMAT.
   *
   * ── Pourquoi cet écran existe ──────────────────────────────────────────────
   *
   * On ne parse pas de la même façon d'un éditeur à l'autre. Un lecteur mesuré
   * sur un logiciel et lâché sur un autre ne rend pas *moins* d'information : il
   * en rend de la **fausse, en silence**. C'est arrivé — sur un constat plomb,
   * un OUI de saturnisme transmis à l'ARS s'est perdu parce qu'un lecteur écrit
   * pour un format lisait un autre format.
   *
   * Alors quand aucune signature ne reconnaît le document, Verrière ne dégrade
   * pas vers « le lecteur le plus probable ». Elle le dit.
   *
   * ── Ce que l'écran montre, et pourquoi ─────────────────────────────────────
   *
   * Le nom des formats essayés. Ce n'est pas de la transparence de principe :
   * c'est ce qui permet à Aude de dire « celui-là, il faut le mesurer », et de
   * savoir que le silence vient de nous, pas du rapport.
   *
   * Et la raison la plus fréquente, quand elle est mesurable : un DPE dont le
   * corps est **imprimé en image** ne contient aucun texte à lire. Là, ce n'est
   * pas un format à ajouter, c'est un rapport à redemander à son auteur.
   */
  const {
    essayes = [],
    quoi = 'document',
    enImage = false
  }: { essayes?: string[]; quoi?: string; enImage?: boolean } = $props();
</script>

<section class="inconnu" aria-labelledby="titre-inconnu">
  <h2 id="titre-inconnu">
    <span aria-hidden="true">◌</span>
    Ce {quoi} vient d’un logiciel que nous ne savons pas encore lire
  </h2>

  {#if enImage}
    <p>
      Ses pages ne contiennent presque aucun texte : le rapport a été
      <b>imprimé en image</b>. Rien ne peut en être lu automatiquement, quel que
      soit le lecteur.
    </p>
    <p class="quoi-faire">
      Demandez à votre diagnostiqueur le rapport d’origine — celui que son
      logiciel a produit — plutôt qu’une version numérisée.
    </p>
  {:else}
    <p>
      Chaque logiciel de diagnostic met ses tableaux en page à sa façon. Nous
      lisons ceux dont la mise en page a été <b>mesurée sur de vrais rapports</b>,
      et nous ne lisons que ceux-là.
    </p>
    <p class="quoi-faire">
      Nous préférons vous dire que nous ne savons pas lire ce format plutôt que
      de vous en tirer un bâtiment approximatif. Votre rapport, lui, reste
      valable : c’est notre lecture qui manque, pas son contenu.
    </p>
  {/if}

  {#if essayes.length > 0}
    <p class="essayes">
      Formats reconnus à ce jour : {essayes.join(', ')}.
    </p>
  {/if}
</section>

<style>
  .inconnu {
    display: grid;
    gap: 0.6rem;
    padding: 1rem 1.1rem;
    border: 1px solid var(--verriere-sable-filet, #d8c199);
    border-radius: 8px;
    background: var(--papier, #fff);
  }

  h2 {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin: 0;
    font-size: 1rem;
    line-height: 1.4;
    color: var(--encre, #0a2b23);
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.55;
    color: var(--encre-doux, #4a5a55);
  }

  .quoi-faire {
    padding: 0.65rem 0.85rem;
    border-left: 3px solid var(--vert-verriere, #12463b);
    background: var(--surface, rgb(10 43 35 / 3%));
    border-radius: 0 6px 6px 0;
    color: var(--encre, #0a2b23);
  }

  .essayes {
    font-size: 0.76rem;
    color: var(--verriere-sable-encre, #896c33);
  }
</style>
