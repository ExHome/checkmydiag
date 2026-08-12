<script lang="ts">
  import Depot from './composants/Depot.svelte';
  import Lecteur from './composants/Lecteur.svelte';
  import { ouvrirPdf, type PageRendue } from './lib/pdf';
  import { analyser } from './lib/analyse';
  import { pagesExemple } from './lib/exemple';
  import type { Analyse } from './lib/modele';
  import {
    chargerDossier,
    depuis,
    garderDossier,
    listerDossiers,
    oublierDossier,
    type DossierGarde
  } from './lib/coffre';

  let etat = $state<'accueil' | 'lecture' | 'resultat'>('accueil');
  let progression = $state<{ fait: number; total: number } | null>(null);
  let analyse = $state<Analyse | null>(null);
  let erreur = $state<string | null>(null);
  let nomFichier = $state('');
  /** Pages du rapport dessinées, pour les montrer annotées. */
  let rendus = $state<Map<number, PageRendue>>(new Map());
  /** Dossiers déjà analysés, gardés sur l'appareil — PDF compris. */
  let dossiers = $state<DossierGarde[]>([]);
  listerDossiers().then((liste) => (dossiers = liste));
  /** Diagnostic demandé depuis le bilan : le lecteur ouvre son onglet. */
  let demande = $state<string | null>(null);

  /**
   * Rouvre un dossier gardé. Le PDF ayant été conservé, on redessine ses pages :
   * le lecteur retrouve son rapport annoté, sans redéposer le fichier.
   */
  async function rouvrir(garde: DossierGarde): Promise<void> {

    nomFichier = garde.nomFichier;
    rendus = new Map();
    analyse = garde.analyse;
    etat = 'resultat';

    const complet = await chargerDossier(garde.id);
    if (!complet?.pdf) return;

    const fichier = new File([complet.pdf], garde.nomFichier, { type: 'application/pdf' });
    const document = await ouvrirPdf(fichier);

    // Le rapport est relu, pas resservi : le moteur s'améliore, et un dossier
    // gardé la semaine dernière doit profiter de ce qu'on sait lire aujourd'hui.
    // On ne réécrit rien dans le coffre : le PDF y est déjà, et l'analyse se
    // refait à chaque ouverture.
    const frais = analyser(document.pages);
    analyse = frais;

    if (import.meta.env.DEV) {
      (window as unknown as { analyseCourante?: unknown }).analyseCourante = frais;
    }

    void dessinerPages(document, frais);
  }

  function montrerExemple(): void {

    nomFichier = 'dossier de démonstration';
    rendus = new Map(); // pas de vrai PDF : pas de page à montrer
    analyse = analyser(pagesExemple());
    etat = 'resultat';
  }

  async function traiter(fichier: File): Promise<void> {
    erreur = null;

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
      // Le rapport lui-même est gardé, pas seulement son analyse : c'est ce qui
      // permet de le rouvrir annoté.
      void garderDossier(fichier.name, resultat, fichier, new Date()).then(
        (liste) => (dossiers = liste)
      );

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
   * pdf.js dessine au rythme des rafraîchissements de l'écran. Dans un onglet
   * passé en arrière-plan, le navigateur les suspend : le dessin ne se termine
   * jamais et finit par expirer. Plutôt que de gâcher le délai, on attend que
   * l'onglet revienne — c'est de toute façon le seul moment où l'image sert.
   */
  function ongletDevant(): Promise<void> {
    const page = globalThis.document;
    if (page.visibilityState === 'visible') return Promise.resolve();
    return new Promise((pret) => {
      const revient = (): void => {
        if (page.visibilityState !== 'visible') return;
        page.removeEventListener('visibilitychange', revient);
        pret();
      };
      page.addEventListener('visibilitychange', revient);
    });
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

    // Ouvrir le document de dessin avant de compter : sur un rapport de cent
    // pages, cette ouverture mangeait à elle seule le délai de la première page.
    await document.prechauffer();
    await ongletDevant();

    for (const numero of aFaire) {
      try {
        // Sur certains rapports très lourds, le dessin d'une page n'aboutit
        // jamais. Ce n'est pas une raison pour laisser le lecteur attendre :
        // au-delà de huit secondes, on passe à la suivante.
        await ongletDevant();
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

<!--
  Deux écrans, pas un de plus.

  On glisse son fichier. Ensuite on a son rapport, et l'explication à côté. Tout
  ce qui s'intercalait entre les deux — chapeau, arguments, bilan, compteurs,
  profils — a été retiré : c'était du remplissage entre le geste et la réponse.
-->
<main class="enveloppe">
  {#if etat !== 'resultat'}
    <section class="seuil">
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

      {#if dossiers.length && etat !== 'lecture'}
        <!-- Les rapports déjà lus restent sur l'appareil : on les rouvre sans
             redéposer le fichier. -->
        <ul class="gardes">
          {#each dossiers as dossier (dossier.id)}
            <li>
              <button type="button" class="dossier" onclick={() => void rouvrir(dossier)}>
                <strong>{dossier.nomFichier}</strong>
                <span class="quand">{depuis(dossier.quand, new Date())}</span>
              </button>
              <button
                type="button"
                class="oublier"
                aria-label="Oublier {dossier.nomFichier}"
                onclick={() => void oublierDossier(dossier.id).then((liste) => (dossiers = liste))}
              >
                ✕
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {:else if analyse}
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

    <Lecteur {analyse} {rendus} {demande} />

    <p class="avertissement">
      {nomFichier} — outil de lecture, sans valeur réglementaire. La référence reste le rapport
      signé.
    </p>
  {/if}
</main>

<style>
  /* Le bandeau du site : vert profond, un filet or en dessous. */
  .entete {
    padding: 20px 0;
    border-bottom: 1px solid var(--trait-or);
    background: var(--fond-clair);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  /* La marque en Fraunces, comme les titres du site. « My » prend l'or : une
     seule couleur d'accent, pas un arc-en-ciel. */
  .marque {
    font-family: var(--police-titre);
    font-size: 1.34rem;
    font-weight: 500;
    letter-spacing: -0.022em;
    text-decoration: none;
    color: var(--sur-fond);
  }

  .marque span {
    color: var(--or-clair);
  }

  main {
    padding: clamp(28px, 6vw, 56px) 0 80px;
  }

  /* Le seuil : une seule chose à faire, au milieu de l'écran. */
  .seuil {
    max-width: 640px;
    margin-inline: auto;
    padding-top: clamp(20px, 8vh, 70px);
  }

  .essai {
    text-align: center;
    margin-top: 18px;
    color: var(--sur-fond-doux);
    font-size: 0.92rem;
  }

  .lien {
    background: none;
    border: none;
    padding: 0;
    color: var(--or-clair);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  /* Les rapports gardés : une ligne chacun, sobre. Pas un tableau de bord. */
  .gardes {
    list-style: none;
    margin: 40px 0 0;
    padding: 0;
    display: grid;
    gap: 6px;
  }

  .gardes li {
    display: flex;
    align-items: stretch;
    gap: 6px;
  }

  .dossier {
    flex: 1;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 14px;
    text-align: left;
    background: rgb(255 255 255 / 6%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 12px;
    padding: 13px 18px;
    cursor: pointer;
    color: var(--sur-fond);
    transition: border-color 0.18s ease, background 0.18s ease;
  }

  .dossier:hover {
    border-color: rgb(230 200 148 / 45%);
    background: rgb(255 255 255 / 11%);
  }

  .quand {
    font-size: 0.84rem;
    color: var(--sur-fond-doux);
    white-space: nowrap;
  }

  .oublier {
    background: none;
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 12px;
    color: var(--sur-fond-doux);
    width: 42px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .oublier:hover {
    border-color: #fc7060;
    color: #fc7060;
  }

  .erreur {
    background: rgb(252 112 96 / 12%);
    border: 1px solid rgb(252 112 96 / 55%);
    color: #ffd9d3;
    border-radius: var(--rayon-petit);
    padding: 14px 18px;
    margin-bottom: 20px;
  }

  .avertissement {
    margin-top: 40px;
    padding-top: 18px;
    border-top: 1px solid rgb(255 255 255 / 10%);
    font-size: 0.84rem;
    color: var(--sur-fond-doux);
  }
</style>
