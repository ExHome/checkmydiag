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
  <p class="version">Version du 13 août 2026</p>

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
  .cgv {
    background: var(--papier, #f5efe2);
    color: var(--encre, #08402f);
    border-radius: var(--rayon-petit, 12px);
    padding: clamp(20px, 5vw, 32px);
    max-width: 62ch;
    margin: 0 auto;
    text-align: left;
  }

  h2 {
    font-size: var(--t-titre);
    margin-bottom: 2px;
  }

  .version {
    font-size: var(--t-petit);
    opacity: 0.7;
    margin-bottom: 18px;
  }

  .brouillon {
    background: rgb(252 112 96 / 12%);
    border: 1px solid rgb(252 112 96 / 55%);
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 18px;
    font-size: var(--t-base);
  }

  .essentiel {
    list-style: none;
    display: grid;
    gap: 12px;
    margin-bottom: 20px;
  }

  .essentiel li {
    padding-left: 20px;
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
    background: var(--vert-500, #0c6b4f);
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
    margin-top: 18px;
    max-height: 46vh;
    overflow-y: auto;
    padding-right: 8px;
  }

  .texte h3 {
    font-size: var(--t-base);
    margin: 18px 0 6px;
  }

  .texte p {
    line-height: 1.55;
    margin-bottom: 8px;
    font-size: var(--t-base);
  }

  .manque {
    opacity: 0.7;
    font-style: italic;
  }

  .decision {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-top: 24px;
  }

  .accepter {
    background: var(--vert-700, #08402f);
    color: #fff;
    border: none;
    border-radius: 999px;
    padding: 14px 26px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .accepter:hover {
    background: var(--vert-500, #0c6b4f);
  }

  .refuser {
    background: none;
    border: none;
    padding: 14px 4px;
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
    margin-top: 10px;
  }
</style>
