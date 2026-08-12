<script lang="ts">
  import Depot from './composants/Depot.svelte';
  import Controles from './composants/Controles.svelte';
  import Resume from './composants/Resume.svelte';
  import Lecteur from './composants/Lecteur.svelte';
  import { ouvrirPdf, type PageRendue } from './lib/pdf';
  import { analyser } from './lib/analyse';
  import { pagesExemple } from './lib/exemple';
  import type { Analyse } from './lib/modele';

  let etat = $state<'accueil' | 'lecture' | 'resultat'>('accueil');
  let progression = $state<{ fait: number; total: number } | null>(null);
  let analyse = $state<Analyse | null>(null);
  let erreur = $state<string | null>(null);
  let nomFichier = $state('');
  let exemple = $state(false);
  /** Pages du rapport dessinées, pour les montrer annotées. */
  let rendus = $state<Map<number, PageRendue>>(new Map());

  function montrerExemple(): void {
    exemple = true;
    nomFichier = 'dossier de démonstration';
    rendus = new Map(); // pas de vrai PDF : pas de page à montrer
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
      const document = await ouvrirPdf(fichier, (fait, total) => (progression = { fait, total }));
      const resultat = analyser(document.pages);

      // Les résultats s'affichent tout de suite : dessiner les pages prend
      // plusieurs secondes sur un gros dossier, et le lecteur n'a aucune raison
      // d'attendre pour savoir si c'est grave.
      rendus = new Map();
      analyse = resultat;
      etat = 'resultat';

      if (import.meta.env.DEV) {
        (window as unknown as { analyseCourante?: unknown }).analyseCourante = resultat;
      }

      if (import.meta.env.DEV) {
        (window as unknown as { docCourant?: unknown }).docCourant = document;
      }

      void dessinerPages(document, resultat);
    } catch (e) {
      erreur = `Impossible de lire ce PDF (${e instanceof Error ? e.message : 'erreur inconnue'}).`;
      etat = 'accueil';
    } finally {
      progression = null;
    }
  }

  // Aide de mise au point : en développement seulement, permet de charger un
  // rapport depuis une URL locale pour vérifier le rendu annoté sans passer par
  // la boîte de dialogue du système.
  if (import.meta.env.DEV) {
    (window as unknown as { ouvrirPdfPourEssai?: typeof ouvrirPdf }).ouvrirPdfPourEssai = ouvrirPdf;
    (window as unknown as { chargerPourEssai?: (url: string) => Promise<void> }).chargerPourEssai =
      async (url: string) => {
        const reponse = await fetch(url);
        const blob = await reponse.blob();
        await traiter(new File([blob], url.split('/').pop() ?? 'essai.pdf', { type: 'application/pdf' }));
      };
  }

  /**
   * Dessine, en tâche de fond, les pages que le lecteur va parcourir annotées.
   * Chaque page s'affiche dès qu'elle est prête ; si l'une échoue, les autres
   * continuent et l'analyse reste lisible.
   */
  async function dessinerPages(
    document: Awaited<ReturnType<typeof ouvrirPdf>>,
    resultat: Analyse
  ): Promise<void> {
    const aFaire = new Set<number>();
    for (const diag of resultat.diagnostics) {
      const numero = diag.reperes?.[0]?.page;
      if (numero !== undefined) aFaire.add(numero);
    }

    const mesures: { page: number; ms: number; ok: boolean }[] = [];
    if (import.meta.env.DEV) {
      (window as unknown as { mesuresRendu?: unknown }).mesuresRendu = mesures;
    }

    for (const numero of aFaire) {
      try {
        // Sur certains rapports très lourds, le dessin d'une page n'aboutit
        // jamais. Ce n'est pas une raison pour laisser le lecteur attendre :
        // au-delà de huit secondes, on passe à la suivante.
        const debut = performance.now();
        const rendu = await Promise.race([
          document.rendre(numero, 900),
          new Promise<null>((resoudre) => setTimeout(() => resoudre(null), 8000))
        ]);
        mesures.push({ page: numero, ms: Math.round(performance.now() - debut), ok: rendu !== null });
        if (rendu) rendus = new Map(rendus).set(numero, rendu);
      } catch (e) {
        // Une page illisible n'empêche pas de lire le reste du dossier, mais on
        // veut le savoir en développement.
        if (import.meta.env.DEV) console.error(`page ${numero} non dessinée`, e);
      }
    }

    // En développement, on garde le document ouvert pour pouvoir l'inspecter.
    if (!import.meta.env.DEV) await document.fermer();
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
    <Resume {analyse} {nomFichier} {exemple} {recommencer} partie="entete" />

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

    <!-- Un seul endroit où lire : le rapport et son explication. Les cartes
         détaillées répétaient ce que le lecteur dit déjà — la page en devenait
         trois fois trop longue. -->
    <Lecteur {analyse} {rendus} />

    <Controles controles={analyse.controles} />

    <Resume {analyse} {nomFichier} {exemple} {recommencer} partie="bilan" />

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
    background: rgb(4 22 15 / 72%);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .marque {
    font-family: var(--police-titre);
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--encre);
    text-decoration: none;
    letter-spacing: -0.03em;
    text-shadow: 0 0 24px rgb(46 233 139 / 35%);
  }

  .marque span {
    color: var(--vert-500);
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
