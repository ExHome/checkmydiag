<script lang="ts">
  import { CGV, EDITEUR, editeurRenseigne } from '../lib/cgv';

  interface Props {
    /** Le nom du rapport en attente : rappelle pourquoi on demande maintenant. */
    nomFichier?: string;
    surAccepter?: () => void;
    surRefuser?: () => void;
    /** Consultation simple, sans décision à prendre. */
    lectureSeule?: boolean;
  }

  const { nomFichier = '', surAccepter, surRefuser, lectureSeule = false }: Props = $props();

  let deplie = $state(false);
</script>

<section class="cgv" aria-labelledby="cgv-titre">
  <h2 id="cgv-titre">Conditions d’utilisation</h2>
  <!-- Cette date doit rester alignée sur VERSION_CGV dans src/lib/cgv.ts :
       l'une est ce que le lecteur voit, l'autre ce que le produit compare. Rien
       dans le code ne les relie — les bumper ensemble, ou ni l'une ni l'autre. -->
  <p class="version">Version du 16 août 2026</p>

  {#if !editeurRenseigne()}
    <!-- Sans éditeur identifiable, un tel texte n'engage personne. Le dire
         vaut mieux que de laisser croire le contraire. -->
    <p class="brouillon" role="status">
      <strong>Version de travail.</strong> L’identité de l’éditeur n’est pas encore renseignée : ce
      texte n’est pas opposable en l’état.
    </p>
  {/if}

  <!-- L'essentiel d'abord : quatre phrases qui disent ce qui compte vraiment.
       Le texte complet est juste dessous, dépliable — jamais dans une autre
       page qu'il faudrait aller chercher. -->
  <ul class="essentiel">
    <li><strong>Votre PDF ne part pas.</strong> Il est lu par votre navigateur, et reste chez vous.</li>
    <li>
      <strong>Nous gardons ce que le rapport nous apprend</strong> — code postal, mois, type de
      logement, gravité de chaque diagnostic. Jamais votre nom ni votre adresse.
    </li>
    <li>
      <strong>Votre rapport signé reste la référence.</strong> Ce site l’explique, il ne le remplace
      pas.
    </li>
    <li>
      <strong>Si un professionnel vous est indiqué</strong>, son référencement est payant, et nous ne
      touchons rien sur vos travaux.
    </li>
  </ul>

  <button type="button" class="deplier" onclick={() => (deplie = !deplie)} aria-expanded={deplie}>
    {deplie ? 'Replier le texte complet' : 'Lire le texte complet'}
  </button>

  {#if deplie}
    <div class="texte">
      {#each CGV as article (article.titre)}
        <h3>{article.titre}</h3>
        {#each article.points as point (point)}
          <p>{point}</p>
        {/each}
      {/each}

      <h3>11. Qui édite ce site</h3>
      {#if editeurRenseigne()}
        <p>{EDITEUR.raisonSociale} {EDITEUR.formeJuridique} — SIRET {EDITEUR.siret}</p>
        <p>{EDITEUR.adresse}</p>
        <p>{EDITEUR.email}</p>
      {:else}
        <p class="manque">Ces informations restent à renseigner.</p>
      {/if}
      <p class="petit">Hébergement du site : {EDITEUR.hebergeur}</p>
    </div>
  {/if}

  {#if !lectureSeule}
    <div class="decision">
      <button type="button" class="accepter" onclick={() => surAccepter?.()}>
        {#if nomFichier}
          J’accepte et j’analyse mon rapport
        {:else}
          J’accepte
        {/if}
      </button>
      <button type="button" class="refuser" onclick={() => surRefuser?.()}>Retour</button>
    </div>
    <p class="petit une-fois">Une seule fois : on ne vous le redemandera pas.</p>
  {/if}
</section>

<style>
  /*
   * Une carte blanche remet les couleurs à l'endroit.
   *
   * Cet écran s'affiche pendant l'état « démarrage », dont le fond est bleu
   * pétrole et dont l'inversion passe tous les textes au sable. La carte, elle,
   * est restée blanche : le texte sable sur blanc tombait à 1,07 de contraste —
   * quasi invisible. Et c'est l'écran qu'il faut lire avant d'accepter.
   *
   * La zone de dépôt fait la même remise à l'endroit pour la même raison. Toute
   * surface claire posée sur cet écran doit le faire.
   */
  .cgv {
    background: var(--papier);
    border-radius: var(--rayon);
    padding: clamp(20px, 5vw, 32px);
    max-width: 62ch;
    margin: 0 auto;
    text-align: left;

    --sur-fond: var(--petrole);
    --sur-fond-doux: #555555;
    --encre: var(--petrole);
    --encre-doux: #555555;
    --gris: #888888;
    --action-texte: #a33220;
    --or-clair: var(--petrole);
    color: var(--petrole);
  }

  h2 {
    font-size: var(--t-titre);
    margin-bottom: var(--e1);
  }

  .version {
    font-size: var(--t-petit);
    opacity: 0.7;
    margin-bottom: var(--e4);
  }

  .brouillon {
    background: rgb(214 230 106 / 17%);
    border: 1px solid rgb(214 230 106 / 62%);
    border-radius: var(--rayon);
    padding: var(--e2) var(--e3);
    margin-bottom: var(--e4);
    font-size: var(--t-base);
  }

  .essentiel {
    list-style: none;
    display: grid;
    gap: var(--e3);
    margin-bottom: var(--e4);
  }

  .essentiel li {
    padding-left: var(--e4);
    position: relative;
    line-height: 1.5;
  }

  .essentiel li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.55em;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--vert-500);
  }

  .deplier {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    color: inherit;
    text-decoration: underline;
    cursor: pointer;
    opacity: 0.8;
  }

  .texte {
    margin-top: var(--e4);
    max-height: 46vh;
    overflow-y: auto;
    padding-right: var(--e2);
  }

  .texte h3 {
    font-size: var(--t-base);
    margin: var(--e4) 0 var(--e1);
  }

  .texte p {
    line-height: 1.55;
    margin-bottom: var(--e2);
    font-size: var(--t-base);
  }

  .manque {
    opacity: 0.7;
    font-style: italic;
  }

  .decision {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e3);
    align-items: center;
    margin-top: var(--e5);
  }

  .accepter {
    background: var(--vert-700);
    color: #fff;
    border: none;
    border-radius: 999px;
    padding: var(--e3) var(--e5);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .accepter:hover {
    background: var(--vert-500);
  }

  .refuser {
    background: none;
    border: none;
    padding: var(--e3) var(--e1);
    font: inherit;
    color: inherit;
    opacity: 0.75;
    text-decoration: underline;
    cursor: pointer;
  }

  .petit {
    font-size: var(--t-petit);
    opacity: 0.7;
  }

  .une-fois {
    margin-top: var(--e2);
  }
</style>
