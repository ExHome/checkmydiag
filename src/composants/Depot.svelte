<script lang="ts">
  interface Props {
    surFichier: (fichier: File) => void;
    occupe: boolean;
    progression: { fait: number; total: number } | null;
  }

  const { surFichier, occupe, progression }: Props = $props();

  /**
   * Les diagnostics que le moteur sait réellement lire.
   *
   * Cette liste n'annonce que ce qui existe. Une maquette proposait d'y ajouter
   * le radon et un sigle de plus : le radon n'est pas un diagnostic mais l'un
   * des risques de l'état des risques, et le second n'est lu nulle part. Une
   * promesse d'accueil qu'on ne tient pas se paie au premier dépôt.
   */
  const LISIBLES = [
    'DPE',
    'Électricité',
    'Gaz',
    'Amiante',
    'Plomb',
    'Termites',
    'État des risques',
    'Surface',
    'Assainissement'
  ];

  let survol = $state(false);
  let champ: HTMLInputElement | undefined = $state();

  function prendre(fichiers: FileList | null | undefined): void {
    const fichier = fichiers?.[0];
    if (fichier) surFichier(fichier);
  }

  function deposer(e: DragEvent): void {
    e.preventDefault();
    survol = false;
    prendre(e.dataTransfer?.files);
  }
</script>

<!-- La zone entière est un bouton : cliquer ou taper Entrée ouvre le sélecteur,
     ce qui évite un piège clavier classique des zones de glisser-déposer. -->
<button
  type="button"
  class="depot"
  class:survol
  disabled={occupe}
  onclick={() => champ?.click()}
  ondragover={(e) => {
    e.preventDefault();
    survol = true;
  }}
  ondragleave={() => (survol = false)}
  ondrop={deposer}
>
  {#if occupe}
    <p class="titre">Lecture du rapport…</p>
    {#if progression}
      <div
        class="barre"
        role="progressbar"
        aria-valuenow={progression.fait}
        aria-valuemin="0"
        aria-valuemax={progression.total}
      >
        <span style:width="{(progression.fait / progression.total) * 100}%"></span>
      </div>
      <p class="muet petit">Page {progression.fait} sur {progression.total}</p>
    {/if}
  {:else}
    <svg class="icone" viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M14 6h14l8 8v28a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linejoin="round"
      />
      <path d="M28 6v8h8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" />
      <path
        d="M24 20v13m0 0-5-5m5 5 5-5"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <!-- L'écran d'accueil répétait le nom du site. Un visiteur qui arrive ne
         sait pas ce qu'est Check My Diag : il faut lui dire ce qui va se
         passer, pas comment ça s'appelle. -->
    <p class="titre">Déposez votre rapport de diagnostic</p>
    <p class="promesse">
      Il devient lisible : ce que chaque ligne veut dire, si c’est grave, et ce
      qui manque dans le dossier.
    </p>

    <span class="faux-bouton">Choisir mon PDF</span>

    <!-- Le format, dit une fois et sans détour. Un visiteur qui arrive avec une
         photo de son rapport doit comprendre tout de suite pourquoi ça ne
         marchera pas, et quoi faire — plutôt que de l'apprendre par un message
         d'erreur après avoir attendu. -->
    <p class="muet petit format">
      Un fichier PDF. Une photo ou un scan en image ne peut pas être lu : demandez
      le PDF d’origine à votre diagnostiqueur.
    </p>
  {/if}
</button>

{#if !occupe}
  <!--
    Ce que l'application sait lire, et la promesse — sortis de la zone de dépôt.

    Ils y étaient en une ligne de sigles, sous le bouton : « DPE · électricité ·
    gaz… ». Trois problèmes. On ne distingue pas les mots dans une ligne de
    points médians, la promesse de confidentialité se lisait comme une mention
    légale de plus, et tout cela alourdissait la cible sur laquelle il faut
    cliquer. Chacun a maintenant son bloc.
  -->
  <div class="sous-depot">
    <section class="lisibles">
      <p class="quoi-lisibles">Ce que nous savons lire</p>
      <ul class="badges">
        {#each LISIBLES as d (d)}
          <li>{d}</li>
        {/each}
      </ul>
      <p class="muet petit reserve-lisibles">
        Le radon et les autres risques du terrain font partie de l’état des risques.
      </p>
    </section>

    <!-- La promesse du produit. Elle a droit à un bandeau : c'est la première
         question qu'on se pose en déposant un document qui porte son adresse. -->
    <p class="promesse-locale">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linejoin="round"
        />
      </svg>
      <span>
        <strong>Votre document ne quitte pas votre appareil.</strong>
        Il est lu par votre navigateur, il n’est envoyé sur aucun serveur.
      </span>
    </p>
  </div>
{/if}

<input
  bind:this={champ}
  type="file"
  accept="application/pdf,.pdf"
  onchange={(e) => prendre(e.currentTarget.files)}
  hidden
/>

<style>
  .depot {
    display: block;
    width: 100%;
    font: inherit;
    color: inherit;
    border: 2px dashed var(--vert-300);
    border-radius: 20px;
    background: linear-gradient(180deg, var(--papier), var(--papier-doux));
    padding: clamp(28px, 7vw, 56px) 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .depot:hover:not(:disabled),
  .depot.survol {
    border-color: var(--vert-500);
    background: var(--vert-100);
  }

  .depot:disabled {
    cursor: default;
  }

  .icone {
    width: 48px;
    height: 48px;
    color: var(--vert-500);
    margin-bottom: var(--e2);
  }

  .titre {
    font-family: var(--police-titre);
    font-size: clamp(1.3rem, 3.4vw, 1.7rem);
    font-weight: 500;
    letter-spacing: -0.022em;
    line-height: 1.1;
    margin-bottom: var(--e2);
    color: var(--vert-700);
  }

  /* La phrase qui dit ce que fait le site. Elle passe avant la liste des
     sigles : « DPE · plomb · termites » ne veut rien dire à qui n'en a jamais
     ouvert un. */
  .promesse {
    margin: 0 auto;
    max-width: 46ch;
    font-size: var(--t-lead);
    line-height: 1.45;
    color: var(--encre-doux);
  }

  .format {
    margin: var(--e4) auto 0;
    max-width: 46ch;
    line-height: 1.5;
  }

  /* ---- Sous la zone de dépôt -------------------------------------------
     Deux blocs distincts, hors de la cible cliquable : ce qu'on sait lire, et
     ce qu'on fait du fichier. */
  .sous-depot {
    display: grid;
    gap: var(--e4);
    margin-top: var(--e5);
  }

  .quoi-lisibles {
    margin: 0 0 var(--e3);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--gris);
  }

  /* Des pastilles plutôt qu'une ligne de sigles séparés par des points : on
     distingue les mots, et la liste se parcourt au lieu de se lire. */
  .badges {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--e2);
  }

  .badges li {
    padding: var(--e2) var(--e3);
    background: var(--papier);
    border: 1px solid var(--trait-fin);
    border-radius: var(--rayon);
    font-size: var(--t-petit);
    font-weight: 600;
    color: var(--vert-700);
  }

  .reserve-lisibles {
    margin: var(--e3) 0 0;
    max-width: 52ch;
  }

  /* Le bandeau de la promesse : la seule surface teintée de l'écran d'accueil,
     parce que c'est la question qu'on se pose avant de déposer quoi que ce
     soit. */
  .promesse-locale {
    display: flex;
    align-items: flex-start;
    gap: var(--e3);
    margin: 0;
    padding: var(--e4);
    background: var(--vert-100);
    border-left: 3px solid var(--vert-500);
    border-radius: var(--rayon);
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--vert-700);
  }

  .promesse-locale svg {
    flex: none;
    width: 22px;
    height: 22px;
    color: var(--vert-500);
  }

  .promesse-locale strong {
    display: block;
  }

  .faux-bouton {
    display: inline-block;
    margin-top: var(--e4);
    background: var(--vert-700);
    color: #fff;
    border-radius: 0;
    padding: var(--e3) var(--e5);
    font-weight: 600;
  }

  .depot:hover:not(:disabled) .faux-bouton {
    background: var(--vert-500);
  }

  .barre {
    width: min(100%, 320px);
    height: 8px;
    margin: var(--e4) auto var(--e2);
    border-radius: 999px;
    background: var(--trait);
    overflow: hidden;
  }

  .barre span {
    display: block;
    height: 100%;
    background: var(--vert-500);
    transition: width 0.2s ease;
  }
</style>
