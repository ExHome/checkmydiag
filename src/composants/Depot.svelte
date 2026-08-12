<script lang="ts">
  interface Props {
    surFichier: (fichier: File) => void;
    occupe: boolean;
    progression: { fait: number; total: number } | null;
  }

  const { surFichier, occupe, progression }: Props = $props();

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

    <p class="titre">Check my diag</p>
    <p class="muet">déposez votre PDF — DPE, électricité, gaz, amiante, plomb, termites, ERP…</p>

    <span class="faux-bouton">Choisir mon rapport</span>

    <p class="muet petit confidentialite">
      🔒 Votre document reste sur votre appareil : il est lu par votre navigateur et n’est envoyé à
      aucun serveur.
    </p>
  {/if}
</button>

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
    margin-bottom: 8px;
  }

  .titre {
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .faux-bouton {
    display: inline-block;
    margin-top: 18px;
    background: var(--vert-700);
    color: #fff;
    border-radius: 999px;
    padding: 12px 24px;
    font-weight: 600;
  }

  .depot:hover:not(:disabled) .faux-bouton {
    background: var(--vert-500);
  }

  .confidentialite {
    margin: 22px auto 0;
    max-width: 42ch;
  }

  .barre {
    width: min(100%, 320px);
    height: 8px;
    margin: 16px auto 8px;
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
