<script lang="ts">
  /**
   * Dicodiag : les mots du métier, tous au même endroit.
   *
   * Le lexique existait déjà, mais seulement au fil du texte — un mot devenait
   * cliquable là où il apparaissait. Encore fallait-il tomber dessus. Ici, ils
   * sont tous là, cherchables, que le mot soit dans votre rapport ou non.
   *
   * Rien n'est inventé : ce sont les mêmes définitions que celles qui
   * s'ouvrent dans le document, écrites une seule fois.
   */
  import { GLOSSAIRE } from '../lib/analyse/glossaire';

  const { surFermer }: { surFermer: () => void } = $props();

  let recherche = $state('');

  /** Sans accents ni casse : on cherche « merule » et on trouve « mérule ». */
  const nu = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();

  const termes = $derived.by(() => {
    const q = nu(recherche);
    const tries = [...GLOSSAIRE].sort((a, b) => a.titre.localeCompare(b.titre, 'fr'));
    if (!q) return tries;
    return tries.filter(
      (t) => nu(t.titre).includes(q) || t.points.some((p) => nu(p).includes(q))
    );
  });

  /** Un terme ouvert à la fois : on lit une définition, pas un dictionnaire. */
  let ouvert = $state<string | null>(null);
</script>

<div class="app-outil" role="dialog" aria-modal="true" aria-label="Dicodiag, le lexique">
  <header class="barre">
    <button type="button" class="retour" onclick={surFermer}>
      <span aria-hidden="true">←</span> Retour
    </button>
    <span class="signe" aria-hidden="true">📖</span>
    <p class="nom">Dicodiag</p>
  </header>

  <div class="dedans">
    <p class="chapeau">
      Les mots que les rapports emploient sans les expliquer. {GLOSSAIRE.length} entrées.
    </p>

    <label class="chercher">
      <span class="visuellement-cache">Chercher un mot</span>
      <input
        type="search"
        placeholder="Chercher un mot…"
        bind:value={recherche}
        autocomplete="off"
      />
    </label>

    {#if termes.length === 0}
      <p class="rien">
        Aucun mot ne correspond. Le lexique ne contient que les termes qu'on
        rencontre dans les rapports — il s'agrandit à mesure qu'on en lit.
      </p>
    {/if}

    <ul class="termes">
      {#each termes as terme (terme.titre)}
        <li>
          <button
            type="button"
            class="mot"
            aria-expanded={ouvert === terme.titre}
            onclick={() => (ouvert = ouvert === terme.titre ? null : terme.titre)}
          >
            <span>{terme.titre}</span>
            <span class="chevron" aria-hidden="true">{ouvert === terme.titre ? '−' : '+'}</span>
          </button>

          {#if ouvert === terme.titre}
            <div class="definition">
              <ul>
                {#each terme.points as point (point)}
                  <li>{point}</li>
                {/each}
              </ul>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .app-outil {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--fond);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .barre {
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--e2);
    padding: var(--e2) var(--e3);
    background: rgb(255 255 255 / 82%);
    backdrop-filter: blur(20px);
    border-bottom: 2px solid var(--petrole);
  }

  .retour {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 44px;
    padding: 0 var(--e2);
    background: transparent;
    border: none;
    border-radius: var(--rayon-badge);
    color: var(--coral-texte);
    font-size: var(--t-base);
    font-weight: 700;
    cursor: pointer;
  }

  .retour:hover {
    background: var(--surface);
  }

  .signe {
    flex: none;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    font-size: 15px;
    background: linear-gradient(135deg, #8e9bb5, #5c6b8a);
  }

  .nom {
    margin: 0;
    font-size: var(--t-petit);
    font-weight: 700;
    color: var(--sur-fond);
  }

  .dedans {
    flex: 1;
    overflow-y: auto;
    padding: var(--e4) var(--e4) var(--e7);
  }

  .chapeau,
  .chercher,
  .termes,
  .rien {
    max-width: 720px;
    margin-inline: auto;
  }

  .chapeau {
    margin: 0 auto var(--e3);
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
    line-height: 1.5;
  }

  .chercher {
    display: block;
    margin-bottom: var(--e4);
  }

  .chercher input {
    width: 100%;
    min-height: 44px;
    padding: 0 var(--e3);
    font: inherit;
    color: var(--sur-fond);
    background: var(--papier);
    border: 1px solid var(--trait);
    border-radius: var(--rayon-badge);
  }

  .chercher input:focus {
    outline: 2px solid var(--coral-fonce);
    outline-offset: 1px;
  }

  .visuellement-cache {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .termes {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--e1);
  }

  .mot {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--e2);
    min-height: 48px;
    padding: var(--e2) var(--e3);
    background: var(--papier);
    border: 1px solid var(--trait);
    border-radius: var(--rayon-badge);
    color: var(--sur-fond);
    font-size: var(--t-base);
    font-weight: 700;
    text-align: left;
    cursor: pointer;
  }

  .mot:hover {
    border-color: var(--coral-fonce);
  }

  .chevron {
    flex: none;
    color: var(--coral-texte);
    font-size: var(--t-lead);
  }

  .definition {
    padding: var(--e3);
    background: var(--surface);
    border-left: 3px solid var(--coral-fonce);
    border-radius: 0 var(--rayon-petit) var(--rayon-petit) 0;
    margin: var(--e1) 0 var(--e2);
  }

  .definition ul {
    margin: 0;
    padding-left: var(--e4);
    display: grid;
    gap: var(--e1);
  }

  .definition li {
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond);
  }

  .rien {
    padding: var(--e4);
    background: var(--surface);
    border-radius: var(--rayon);
    font-size: var(--t-petit);
    line-height: 1.55;
    color: var(--sur-fond-doux);
  }
</style>
