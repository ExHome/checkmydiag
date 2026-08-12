<script lang="ts">
  /**
   * L'écran principal : le rapport d'un côté, l'explication de l'autre.
   *
   * À gauche, les pages qui comptent — dessinées si possible, sinon leur texte.
   * Les passages importants y sont surlignés. À droite, le résumé du dossier,
   * remplacé par l'explication du passage dès qu'on en touche un.
   */
  import type { Analyse, Diagnostic } from '../lib/modele';
  import type { PageRendue } from '../lib/pdf';
  import Explicatif from './schemas/Explicatif.svelte';
  import MiniSchema from './MiniSchema.svelte';

  interface Props {
    analyse: Analyse;
    rendus: Map<number, PageRendue>;
  }

  const { analyse, rendus }: Props = $props();

  type Repere = NonNullable<Diagnostic['reperes']>[number];

  const feuillets = $derived(
    analyse.diagnostics
      .filter((d): d is Diagnostic & { reperes: Repere[] } => (d.reperes?.length ?? 0) > 0)
      .map((d) => ({
        type: d.type,
        titre: d.titre,
        gravite: d.gravite,
        numero: d.reperes[0]?.page ?? 1,
        reperes: d.reperes
      }))
  );

  let ouvert = $state(0);
  const feuillet = $derived(feuillets[ouvert] ?? feuillets[0] ?? null);
  const page = $derived(feuillet ? (rendus.get(feuillet.numero) ?? null) : null);
  const texte = $derived(feuillet ? (analyse.textePages[feuillet.numero] ?? []) : []);

  const diagnostic = $derived(
    feuillet ? (analyse.diagnostics.find((d) => d.type === feuillet.type) ?? null) : null
  );

  /** Repère choisi ; null = on affiche le résumé du diagnostic. */
  let choisi = $state<Repere | null>(null);
  /** Question de second niveau ouverte, s'il y en a une. */
  let suiteOuverte = $state<string | null>(null);

  // Changer de passage referme la question ouverte.
  $effect(() => {
    void choisi;
    suiteOuverte = null;
  });

  // Changer de diagnostic remet le panneau sur sa vue d'ensemble.
  $effect(() => {
    void ouvert;
    choisi = null;
  });

  function cadre(r: Repere) {
    if (!page) return null;
    const marge = 3;
    return {
      left: ((r.x - marge) / page.largeur) * 100,
      top: ((page.hauteur - r.y - r.hauteur) / page.hauteur) * 100,
      width: ((r.largeur + marge * 2) / page.largeur) * 100,
      height: ((r.hauteur + marge * 2) / page.hauteur) * 100
    };
  }

</script>

{#if feuillet}
  <section class="carte lecteur">
    <header class="entete">
      <h2>Votre rapport, expliqué</h2>
      <p class="muet petit">
        Touchez un passage surligné : son explication s’affiche à côté.
      </p>
    </header>

    <nav class="onglets" aria-label="Diagnostics du dossier">
      {#each feuillets as f, i (f.type)}
        <button
          type="button"
          class="onglet {f.gravite}"
          class:actif={i === ouvert}
          onclick={() => (ouvert = i)}
        >
          {f.titre}
          <span class="page-num">p. {f.numero}</span>
        </button>
      {/each}
    </nav>

    <div class="deux-colonnes">
      <div class="document">
        {#if page}
          <div class="page">
            <img src={page.image} alt="Page {feuillet.numero} de votre rapport" />
            {#each feuillet.reperes as repere, i (repere.titre)}
              {@const c = cadre(repere)}
              {#if c}
                <button
                  type="button"
                  class="surligne"
                  class:actif={choisi?.titre === repere.titre}
                  style:left="{c.left}%"
                  style:top="{c.top}%"
                  style:width="{c.width}%"
                  style:height="{c.height}%"
                  aria-label={repere.titre}
                  onmouseenter={() => (choisi = repere)}
                  onfocus={() => (choisi = repere)}
                  onclick={() => (choisi = repere)}
                >
                  <span class="puce">{i + 1}</span>
                </button>
              {/if}
            {/each}
          </div>
        {:else}
          <!-- L'image de la page n'a pas pu être dessinée : on montre son texte,
               avec les mêmes passages mis en avant. -->
          <div class="page-texte" aria-label="Texte de la page {feuillet.numero}">
            {#each texte as ligne}
              {@const repere = feuillet.reperes.find((r) => ligne.includes(r.extrait))}
              {#if repere}
                <button
                  type="button"
                  class="ligne surlignee"
                  class:actif={choisi?.titre === repere.titre}
                  onmouseenter={() => (choisi = repere)}
                  onfocus={() => (choisi = repere)}
                  onclick={() => (choisi = repere)}
                >
                  {ligne}
                </button>
              {:else}
                <p class="ligne">{ligne}</p>
              {/if}
            {/each}
          </div>
        {/if}
      </div>

      <aside class="panneau">
        {#if choisi}
          {#key choisi.titre}
            <div class="apparait">
              <p class="sur-titre">Ce passage</p>
              <h3>{choisi.titre}</h3>
              {#if choisi.schema}
                <MiniSchema id={choisi.schema} />
              {/if}
              <ul class="points">
                {#each choisi.points as point}
                  <li>{point}</li>
                {/each}
              </ul>

              {#if choisi.suites?.length}
                <div class="suites">
                  {#each choisi.suites as suite (suite.question)}
                    <button
                      type="button"
                      class="suite"
                      class:ouverte={suiteOuverte === suite.question}
                      onclick={() =>
                        (suiteOuverte = suiteOuverte === suite.question ? null : suite.question)}
                    >
                      {suite.question}
                    </button>
                    {#if suiteOuverte === suite.question}
                      <ul class="points reponse-suite apparait">
                        {#each suite.points as point}
                          <li>{point}</li>
                        {/each}
                      </ul>
                    {/if}
                  {/each}
                </div>
              {/if}

              <button type="button" class="retour" onclick={() => (choisi = null)}>
                ← Revenir au résumé
              </button>
            </div>
          {/key}
        {:else if diagnostic}
          <p class="sur-titre">{feuillet.titre}</p>

          {#if diagnostic.analogie}
            <h3>Ce que c’est</h3>
            <p class="analogie">{diagnostic.analogie}</p>
          {/if}

          <h3>Pour votre logement</h3>
          <p class="verdict">{diagnostic.verdict}</p>

          {#if diagnostic.faits.length}
            <dl class="chiffres">
              {#each diagnostic.faits.slice(0, 4) as fait (fait.libelle)}
                <div>
                  <dt>{fait.libelle}</dt>
                  <dd>{fait.valeur}</dd>
                </div>
              {/each}
            </dl>
          {/if}

          <p class="muet petit indice">
            {feuillet.reperes.length} passage{feuillet.reperes.length > 1 ? 's' : ''} expliqué{feuillet
              .reperes.length > 1
              ? 's'
              : ''} sur cette page — touchez-les.
          </p>
        {/if}

        <!-- Le schéma de la notion, à la demande : il ne s'impose pas, mais il
             est toujours à un clic. -->
        {#if diagnostic}
          <details class="schema">
            <summary>Voir le schéma</summary>
            <Explicatif
              type={diagnostic.type}
              isolation={diagnostic.schema?.genre === 'dpe' ? diagnostic.schema.isolation : null}
            />
          </details>
        {/if}
      </aside>
    </div>
  </section>
{/if}

<style>
  .lecteur {
    margin-bottom: 24px;
  }

  .entete h2 {
    margin-bottom: 2px;
  }

  .entete p {
    margin: 0 0 16px;
  }

  .onglets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 18px;
  }

  .onglet {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    background: var(--papier-doux);
    border: 1px solid var(--trait);
    border-radius: 999px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 0.92rem;
    color: var(--encre-doux);
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }

  .onglet:hover {
    background: var(--vert-100);
  }

  .onglet.actif {
    background: var(--vert-700);
    border-color: var(--vert-700);
    color: #fff;
    font-weight: 600;
  }

  .page-num {
    font-size: 0.78rem;
    opacity: 0.7;
  }

  .deux-colonnes {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 24px;
    align-items: start;
  }

  .page {
    position: relative;
    border-radius: var(--rayon-petit);
    overflow: hidden;
    box-shadow: var(--ombre);
    background: #fff;
    line-height: 0;
  }

  img {
    width: 100%;
    height: auto;
  }

  .surligne {
    position: absolute;
    border: 2px solid var(--or);
    background: rgb(192 144 72 / 18%);
    border-radius: 4px;
    padding: 0;
    cursor: pointer;
    transition: background 0.2s ease, box-shadow 0.2s ease;
  }

  .surligne:hover,
  .surligne.actif {
    background: rgb(192 144 72 / 34%);
    box-shadow: 0 0 0 3px rgb(192 144 72 / 28%);
  }

  .puce {
    position: absolute;
    left: -11px;
    top: 50%;
    transform: translateY(-50%);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--or-fonce);
    color: #fff;
    font-size: 0.72rem;
    font-weight: 700;
    line-height: 22px;
    text-align: center;
  }

  /* Le fac-similé imite la feuille du rapport : fond clair, encre sombre. Ses
     couleurs sont donc fixes, indépendantes du thème de l'interface. */
  .page-texte {
    background: #fdfcf8;
    border: 1px solid var(--trait);
    border-radius: var(--rayon-petit);
    padding: 20px 22px;
    max-height: 560px;
    overflow-y: auto;
    font-size: 0.82rem;
    line-height: 1.55;
    color: #43514a;
    box-shadow: var(--ombre);
  }

  .ligne {
    margin: 0 0 3px;
    text-align: left;
  }

  button.ligne {
    display: block;
    width: 100%;
    background: #fdf0d2;
    border: none;
    border-left: 3px solid var(--or-fonce);
    border-radius: 4px;
    padding: 5px 9px;
    margin: 5px 0;
    cursor: pointer;
    color: #2f2416;
    font: inherit;
    font-weight: 650;
    transition: background 0.15s ease, box-shadow 0.15s ease;
  }

  button.ligne:hover,
  button.ligne.actif {
    background: #fbe3ab;
    box-shadow: 0 0 0 2px rgb(192 144 72 / 45%);
  }

  .panneau {
    position: sticky;
    top: 16px;
    background: var(--papier-doux);
    border-radius: var(--rayon);
    padding: 20px 22px;
  }

  .sur-titre {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--or-fonce);
    margin: 0 0 4px;
  }

  .panneau h3 {
    font-size: 1.14rem;
    margin-bottom: 8px;
  }

  .panneau p {
    font-size: 0.97rem;
  }

  .verdict {
    font-weight: 600;
  }

  .analogie {
    border-left: 3px solid var(--vert-500);
    padding-left: 12px;
    color: var(--encre-doux);
  }

  .indice {
    margin: 0;
  }

  .chiffres {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 8px;
    margin: 0 0 14px;
  }

  .chiffres div {
    background: var(--papier);
    border-radius: var(--rayon-petit);
    padding: 8px 10px;
  }

  .chiffres dt {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--encre-doux);
    font-weight: 700;
  }

  .chiffres dd {
    margin: 2px 0 0;
    font-size: 1.05rem;
    font-weight: 700;
  }

  .panneau h3 + p {
    margin-bottom: 14px;
  }

  .retour {
    background: none;
    border: none;
    padding: 0;
    color: var(--vert-500);
    font-weight: 600;
    cursor: pointer;
    font-size: 0.92rem;
  }

  /* Des puces, pas des paragraphes : trois ou quatre mots par ligne. */
  .points {
    list-style: none;
    margin: 0 0 14px;
    padding: 0;
    display: grid;
    gap: 7px;
  }

  .points li {
    position: relative;
    padding-left: 20px;
    font-size: 0.97rem;
    line-height: 1.4;
  }

  .points li::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 0.55em;
    width: 7px;
    height: 7px;
    border-radius: 2px;
    background: var(--or);
  }

  /* Les questions de second niveau : on creuse sans quitter le passage. */
  .suites {
    display: grid;
    gap: 6px;
    margin-bottom: 14px;
  }

  .suite {
    text-align: left;
    background: rgb(255 200 87 / 8%);
    border: 1px solid var(--trait);
    border-radius: var(--rayon-petit);
    padding: 9px 13px;
    cursor: pointer;
    color: var(--or-clair);
    font-size: 0.93rem;
    font-weight: 650;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .suite::before {
    content: '→ ';
    opacity: 0.7;
  }

  .suite:hover,
  .suite.ouverte {
    background: rgb(255 200 87 / 16%);
    border-color: var(--or);
  }

  .reponse-suite {
    margin: 0 0 4px;
    padding-left: 14px;
    border-left: 2px solid var(--or);
  }

  .schema {
    margin-top: 16px;
    border-top: 1px solid var(--trait);
    padding-top: 14px;
  }

  .schema summary {
    cursor: pointer;
    list-style: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 0.92rem;
    color: var(--vert-300);
    background: rgb(46 233 139 / 10%);
    border: 1px solid var(--trait);
    border-radius: 999px;
    padding: 8px 16px;
  }

  .schema summary::-webkit-details-marker {
    display: none;
  }

  .schema summary::before {
    content: '';
    width: 6px;
    height: 6px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(-45deg);
    transition: transform 0.2s ease;
  }

  .schema[open] summary::before {
    transform: rotate(45deg);
  }

  @media (max-width: 820px) {
    .deux-colonnes {
      grid-template-columns: 1fr;
    }

    .panneau {
      position: static;
    }
  }
</style>
