<script lang="ts">
  /**
   * LA VIGNETTE DU BIEN — la photo du rapport, avec ce qu'on sait du logement.
   *
   * ── Pourquoi cette photo-là et pas une autre ───────────────────────────────
   *
   * C'est **la photo que le diagnostiqueur a mise sur la page de garde**,
   * découpée dans le PDF. Pas une image d'agence, pas une illustration : le
   * logement du lecteur, photographié par le professionnel qui l'a visité.
   *
   * La maquette du pack montrait un salon d'intérieur générique. En afficher un
   * laisserait croire au lecteur que c'est chez lui — et l'ordre de mission
   * l'interdit : « aucune photo fictive ». Sans photo dans le rapport, la
   * vignette ne s'affiche pas du tout.
   *
   * ── La pastille ────────────────────────────────────────────────────────────
   *
   * Type de bien, surface de référence, année de construction : trois valeurs
   * lues dans la fiche technique. Chacune peut manquer — la pastille se réduit
   * alors à ce qu'on sait, et disparaît si on ne sait rien.
   */
  import type { Bien } from '../../lib/analyse/enveloppe';
  import type { Photo } from '../../lib/pdf';

  const { photo = null, bien = null }: { photo?: Photo | null; bien?: Bien | null } = $props();

  const titre = $derived(
    [bien?.typeDeBien?.valeur, bien?.surfaceReference?.valeur].filter(Boolean).join(' — ')
  );
  const sous = $derived(
    bien?.anneeConstruction?.valeur ? `Construction ${bien.anneeConstruction.valeur}` : ''
  );
</script>

{#if photo}
  <figure class="vignette">
    <img src={photo.image} alt="Le logement, photographié dans le rapport" />
    {#if titre || sous}
      <figcaption>
        {#if titre}<b>{titre}</b>{/if}
        {#if sous}<span>{sous}</span>{/if}
      </figcaption>
    {/if}
  </figure>
{/if}

<style>
  .vignette {
    position: relative;
    margin: 0;
    border-radius: 10px;
    overflow: hidden;
    background: var(--surface, rgb(10 43 35 / 3%));
  }

  /*
    Format large et hauteur bornée : une photo de page de garde peut être
    verticale, et elle pousserait alors toutes les cartes hors de l'écran.
  */
  img {
    display: block;
    width: 100%;
    max-height: 15rem;
    object-fit: cover;
    object-position: center;
  }

  figcaption {
    position: absolute;
    left: 0.75rem;
    bottom: 0.75rem;
    display: grid;
    gap: 0.1rem;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    /* Le vert profond de la charte, assez opaque pour que l'ivoire tienne. */
    background: rgb(10 43 35 / 88%);
    color: var(--ivoire, #f7f6f2);
  }

  figcaption b {
    font-size: 0.88rem;
  }

  figcaption span {
    font-size: 0.76rem;
    opacity: 0.85;
  }
</style>
