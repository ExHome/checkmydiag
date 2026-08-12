<script lang="ts">
  import Depot from './composants/Depot.svelte';
  import CarteDiag from './composants/CarteDiag.svelte';
  import Controles from './composants/Controles.svelte';
  import { lirePdf } from './lib/pdf';
  import { analyser } from './lib/analyse';
  import { pagesExemple } from './lib/exemple';
  import type { Analyse } from './lib/modele';

  let etat = $state<'accueil' | 'lecture' | 'resultat'>('accueil');
  let progression = $state<{ fait: number; total: number } | null>(null);
  let analyse = $state<Analyse | null>(null);
  let erreur = $state<string | null>(null);
  let nomFichier = $state('');
  let exemple = $state(false);

  function montrerExemple(): void {
    exemple = true;
    nomFichier = 'dossier de démonstration';
    analyse = analyser(pagesExemple());
    etat = 'resultat';
  }

  async function traiter(fichier: File): Promise<void> {
    erreur = null;
    exemple = false;
    nomFichier = fichier.name;

    if (!/\.pdf$/i.test(fichier.name) && fichier.type !== 'application/pdf') {
      erreur = 'Ce fichier n’est pas un PDF. Déposez le rapport tel que votre diagnostiqueur vous l’a envoyé.';
      return;
    }

    etat = 'lecture';
    progression = { fait: 0, total: 1 };

    try {
      const pages = await lirePdf(fichier, (fait, total) => (progression = { fait, total }));
      analyse = analyser(pages);
      etat = 'resultat';
    } catch (e) {
      erreur = `Impossible de lire ce PDF (${e instanceof Error ? e.message : 'erreur inconnue'}).`;
      etat = 'accueil';
    } finally {
      progression = null;
    }
  }

  function recommencer(): void {
    analyse = null;
    erreur = null;
    nomFichier = '';
    exemple = false;
    etat = 'accueil';
  }
</script>

<header class="entete">
  <div class="enveloppe">
    <a class="marque" href="./" onclick={(e) => { e.preventDefault(); recommencer(); }}>
      Check<span>My</span>Diag
    </a>
  </div>
</header>

<main class="enveloppe">
  {#if etat !== 'resultat'}
    <section class="accroche">
      <h1>Votre diagnostic immobilier, expliqué simplement</h1>
      <p class="chapeau">
        Soixante pages de jargon, et une seule question : <em>est-ce que c’est grave ?</em>
        Déposez votre rapport. Vous obtenez ce que dit chaque diagnostic, un schéma pour le
        comprendre, et les points du dossier à vérifier.
      </p>
    </section>

    {#if erreur}
      <p class="erreur" role="alert">{erreur}</p>
    {/if}

    <Depot surFichier={traiter} occupe={etat === 'lecture'} {progression} />

    {#if etat !== 'lecture'}
      <p class="essai">
        Pas de rapport sous la main ?
        <button type="button" class="lien" onclick={montrerExemple}>Voir un exemple</button>
      </p>
    {/if}

    <section class="arguments">
      <div>
        <h3>Rien n’est envoyé</h3>
        <p class="muet">
          Le PDF est lu par votre navigateur. Aucun serveur, aucun compte, aucune trace : vous
          pouvez couper votre connexion après le chargement de la page.
        </p>
      </div>
      <div>
        <h3>Neuf diagnostics couverts</h3>
        <p class="muet">
          DPE, électricité, gaz, amiante, plomb, termites, état des risques, assainissement,
          superficie Carrez — y compris quand tout est réuni dans un seul dossier.
        </p>
      </div>
      <div>
        <h3>On vérifie aussi le dossier</h3>
        <p class="muet">
          Diagnostic périmé, rapport qui manque, surfaces qui ne correspondent pas : ces points
          sont signalés, avec la question à poser.
        </p>
      </div>
    </section>
  {:else if analyse}
    <section class="resume">
      {#if exemple}
        <p class="bandeau-exemple">
          Exemple de démonstration — ce logement n’existe pas. Les chiffres sont inventés, mais ils
          traversent exactement le même moteur d’analyse que votre rapport.
        </p>
      {/if}
      <p class="muet petit">{nomFichier} — {analyse.nbPages} pages</p>
      <h1>
        {analyse.diagnostics.length} diagnostic{analyse.diagnostics.length > 1 ? 's' : ''} lu{analyse.diagnostics.length > 1 ? 's' : ''}
      </h1>
      {#if analyse.bien.adresse || analyse.bien.commune}
        <p class="bien">
          {analyse.bien.adresse ?? ''}{analyse.bien.commune ? `, ${analyse.bien.commune}` : ''}
        </p>
      {/if}

      <div class="tuiles">
        {#each analyse.diagnostics as d (d.type)}
          <a class="tuile {d.gravite}" href="#{d.type}">
            <strong>{d.titre}</strong>
            <span class="petit">{d.verdict}</span>
          </a>
        {/each}
      </div>

      <button class="bouton bouton--fantome" onclick={recommencer}>Analyser un autre rapport</button>
    </section>

    {#if analyse.illisible}
      <p class="erreur" role="alert">
        Ce PDF ne contient presque pas de texte : il a probablement été scanné. Les rapports
        scannés ne peuvent pas être analysés automatiquement — demandez à votre diagnostiqueur le
        fichier d’origine.
      </p>
    {:else if analyse.diagnostics.length === 0}
      <p class="erreur" role="alert">
        Aucun diagnostic reconnu dans ce document. Il s’agit peut-être d’un autre type de rapport,
        ou d’une mise en page que Check My Diag ne sait pas encore lire.
      </p>
    {/if}

    <Controles controles={analyse.controles} />

    {#each analyse.diagnostics as d (d.type)}
      <div id={d.type}><CarteDiag diagnostic={d} /></div>
    {/each}

    <p class="avertissement muet petit">
      Check My Diag est un outil de lecture : il reformule votre rapport, il ne le remplace pas et
      n’a aucune valeur réglementaire. En cas de doute, la référence reste le rapport signé par
      votre diagnostiqueur certifié.
    </p>
  {/if}
</main>

<style>
  .entete {
    padding: 18px 0;
    border-bottom: 1px solid var(--trait);
    background: var(--papier);
  }

  .marque {
    font-family: var(--police-titre);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--vert-700);
    text-decoration: none;
    letter-spacing: -0.02em;
  }

  .marque span {
    color: var(--or);
  }

  main {
    padding: clamp(28px, 6vw, 56px) 0 80px;
  }

  .accroche {
    text-align: center;
    max-width: 52ch;
    margin: 0 auto clamp(24px, 5vw, 40px);
  }

  .accroche .chapeau {
    max-width: none;
  }

  .chapeau {
    color: var(--encre-doux);
    font-size: 1.05rem;
  }

  .arguments {
    display: grid;
    gap: 24px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    margin-top: 48px;
  }

  .arguments h3 {
    font-family: var(--police);
    font-size: 1rem;
    margin-bottom: 6px;
  }

  .arguments p {
    font-size: 0.94rem;
    margin: 0;
  }

  .resume {
    margin-bottom: 32px;
  }

  .resume h1 {
    margin: 4px 0 2px;
  }

  .bien {
    color: var(--encre-doux);
    margin-bottom: 20px;
  }

  .tuiles {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    margin-bottom: 22px;
  }

  .tuile {
    display: grid;
    gap: 3px;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid var(--trait);
    border-left-width: 4px;
    background: var(--papier);
    color: inherit;
    text-decoration: none;
  }

  .tuile:hover {
    border-color: var(--vert-500);
  }

  .tuile.bon {
    border-left-color: var(--ok);
  }
  .tuile.attention {
    border-left-color: var(--attention);
  }
  .tuile.alerte {
    border-left-color: var(--alerte);
  }
  .tuile.neutre {
    border-left-color: var(--trait);
  }

  .tuile span {
    color: var(--encre-doux);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .essai {
    text-align: center;
    margin-top: 16px;
    color: var(--encre-doux);
    font-size: 0.94rem;
  }

  .lien {
    background: none;
    border: none;
    padding: 0;
    color: var(--vert-500);
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
  }

  .bandeau-exemple {
    background: var(--vert-100);
    border-left: 4px solid var(--vert-500);
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 18px;
    font-size: 0.94rem;
  }

  .erreur {
    background: var(--alerte-fond);
    border: 1px solid var(--alerte);
    color: var(--alerte);
    border-radius: var(--rayon);
    padding: 14px 18px;
    margin-bottom: 20px;
  }

  .avertissement {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid var(--trait);
  }

  h1 {
    text-wrap: balance;
  }
</style>
