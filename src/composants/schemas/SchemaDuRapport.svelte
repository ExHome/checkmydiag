<script lang="ts">
  /**
   * Le schéma des déperditions tel qu'il est dans le rapport.
   *
   * Le dessin de Verrière, juste au-dessus, explique le mécanisme : six
   * souffles, un par chemin, avec les ordres de grandeur nationaux de l'ADEME.
   * Celui-ci ne l'explique pas — il chiffre. Ce sont les pourcentages de CE
   * logement, calculés par le diagnostiqueur, et ils ne figurent nulle part
   * ailleurs.
   *
   * Pourquoi une image et non des chiffres repris : mesuré sur le corpus,
   * trente et un volets DPE sur trente et un nomment cette page, et **aucun ne
   * porte le moindre caractère « % » dans son texte**. Elle est composée de
   * quatorze à quinze images bitmap. Les recopier demanderait de la
   * reconnaissance de caractères, avec son taux d'erreur — et un chiffre de
   * déperdition faux vaut moins que pas de chiffre du tout.
   *
   * On montre donc la page telle quelle, découpée dans le PDF déposé. Rien ne
   * sort du navigateur, comme pour le reste du dossier.
   */
  import type { Photo } from '../../lib/pdf';

  const { schema }: { schema: Photo | null } = $props();
</script>

{#if schema}
  <figure class="schema-du-rapport">
    <img
      src={schema.image}
      alt="Schéma des déperditions de chaleur, découpé dans votre rapport : les pourcentages de chaleur perdue par la toiture, les murs, les fenêtres, le plancher et la ventilation."
      width={schema.largeur}
      height={schema.hauteur}
      loading="lazy"
    />
    <figcaption>
      Les chiffres de votre logement, tels que le rapport les imprime. Le dessin
      ci-dessus explique le chemin ; celui-ci en donne la part.
    </figcaption>
  </figure>
{/if}

<style>
  .schema-du-rapport {
    margin: var(--e4) 0 0;
    padding: var(--e3);
    border: 1px solid var(--trait-fin);
    border-radius: var(--rayon);
  }

  img {
    display: block;
    width: 100%;
    max-width: 32rem;
    height: auto;
    margin-inline: auto;
    /* Le schéma est sur fond blanc dans le PDF : sur un thème sombre il
       trancherait comme un rectangle éclairé. On l'assied sur son propre
       papier, avec le même arrondi que le cadre. */
    border-radius: var(--rayon-petit);
    background: #fff;
  }

  figcaption {
    margin: var(--e3) 0 0;
    color: var(--encre-doux);
    font-size: var(--t-petit);
    line-height: 1.5;
    text-align: center;
  }
</style>
