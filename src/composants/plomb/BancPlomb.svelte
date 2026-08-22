<script lang="ts">
  /**
   * BANC DE LA MINI-APP PLOMB — développement seulement.
   *
   * ⚠️ LES CHIFFRES CI-DESSOUS SONT DES CAS DE FORME, PAS DES DONNÉES.
   *
   * Ils existent pour éprouver l'écran sur les situations qu'un CREP produit
   * réellement : un constat négatif, un constat positif sans dégradation, un
   * constat avec des unités de classe 3, et un tableau dont la somme ne
   * retombe pas. Aucun ne provient d'un rapport, et aucun ne doit devenir une
   * valeur par défaut du produit.
   */
  import type { Diagnostic } from '../../lib/modele';
  import MiniAppPlomb from './MiniAppPlomb.svelte';

  const cas = (
    titre: string,
    classes: [number, number, number, number],
    nonMesurees: number,
    total: number,
    verdict: string
  ): { titre: string; d: Diagnostic } => ({
    titre,
    d: {
      type: 'plomb',
      titre: 'Plomb dans les peintures (CREP)',
      verdict,
      gravite: classes[3] > 0 ? 'alerte' : classes[1] + classes[2] > 0 ? 'attention' : 'bon',
      faits: [],
      explication: [],
      aFaire: [],
      pages: [4, 12],
      schema: { genre: 'plomb', classes, nonMesurees, total, pieces: [] }
    } as unknown as Diagnostic
  });

  const CAS = [
    cas(
      'Négatif — rien au-dessus du seuil',
      [17, 0, 0, 0],
      2,
      19,
      'Aucun revêtement contenant du plomb au-delà du seuil réglementaire n’a été mis en évidence.'
    ),
    cas(
      'Positif, aucun revêtement dégradé',
      [96, 14, 6, 0],
      9,
      125,
      'Des revêtements contenant du plomb au-delà du seuil ont été mis en évidence.'
    ),
    cas(
      'Positif avec unités de classe 3',
      [82, 11, 18, 7],
      7,
      125,
      'Des revêtements dégradés contenant du plomb ont été mis en évidence.'
    ),
    cas(
      '⚠️ La somme ne retombe pas sur le total',
      [82, 11, 18, 7],
      7,
      130,
      'Des revêtements dégradés contenant du plomb ont été mis en évidence.'
    )
  ];

  let choisi = $state(0);
</script>

<div class="banc">
  <nav class="choix">
    {#each CAS as c, i (c.titre)}
      <button type="button" class:actif={i === choisi} onclick={() => (choisi = i)}>
        {c.titre}
      </button>
    {/each}
  </nav>
  <div class="cadre">
    <MiniAppPlomb diagnostic={CAS[choisi]!.d} surVoirDansLeRapport={() => {}} />
  </div>
</div>

<style>
  .banc {
    display: grid;
    gap: 1rem;
    padding: 1rem;
    background: #eceae4;
    min-height: 100vh;
  }
  .choix {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }
  .choix button {
    padding: 0.5rem 0.9rem;
    border: 1px solid #cfc9bd;
    border-radius: 999px;
    background: #fff;
    font: inherit;
    font-size: 0.8125rem;
    cursor: pointer;
  }
  .choix button.actif {
    background: #0e3b30;
    color: #fff;
    border-color: #0e3b30;
  }
  .cadre {
    max-width: 30rem;
    width: 100%;
    margin-inline: auto;
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgb(14 59 48 / 12%);
  }
</style>
