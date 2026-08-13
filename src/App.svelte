<script lang="ts">
  import Depot from './composants/Depot.svelte';
  import Cgv from './composants/Cgv.svelte';
  import { acceptationEnCours, accepter } from './lib/cgv';
  import Lecteur from './composants/Lecteur.svelte';
  import PanneauSavoir from './composants/savoir/PanneauSavoir.svelte';
  import { exploration } from './lib/savoir/pile.svelte';
  import { ouvrirPdf, type PageRendue } from './lib/pdf';
  import { echecDeLecture } from './lib/echec';
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

  let etat = $state<'accueil' | 'conditions' | 'lecture' | 'resultat'>('accueil');
  /**
   * Le rapport choisi, mis en attente le temps que les conditions soient
   * acceptées. Il n'est pas encore ouvert : c'est tout l'intérêt de demander
   * maintenant plutôt qu'après.
   */
  let enAttente = $state<File | null>(null);
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

  /**
   * Le rapport vient d'être choisi. Rien n'est encore ouvert : si les
   * conditions n'ont pas été acceptées, on les présente d'abord.
   *
   * L'ordre compte. Ce qui y est annoncé — ce que le site conserve — doit
   * l'être *avant* la collecte : annoncé après, cela ne se régularise pas.
   */
  function choisir(fichier: File): void {
    erreur = null;
    nomFichier = fichier.name;

    if (!/\.pdf$/i.test(fichier.name) && fichier.type !== 'application/pdf') {
      erreur = 'Ce fichier n’est pas un PDF. Déposez le rapport tel que votre diagnostiqueur vous l’a envoyé.';
      return;
    }

    if (acceptationEnCours()) {
      void traiter(fichier);
      return;
    }

    enAttente = fichier;
    etat = 'conditions';
  }

  function accepterEtAnalyser(): void {
    accepter();
    const fichier = enAttente;
    enAttente = null;
    if (fichier) void traiter(fichier);
    else etat = 'accueil';
  }

  function renoncer(): void {
    enAttente = null;
    nomFichier = '';
    etat = 'accueil';
  }

  async function traiter(fichier: File): Promise<void> {
    erreur = null;
    nomFichier = fichier.name;
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
      // Le message de pdf.js est en anglais et parle de structure de fichier :
      // il est traduit en une phrase qui dit quoi faire.
      erreur = echecDeLecture(e).message;
      if (import.meta.env.DEV) console.error('lecture du PDF', e);
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
        // Par `choisir`, pas par `traiter` : l'aide doit emprunter le parcours
        // réel, conditions comprises, sinon elle valide un chemin que personne
        // ne prend.
        choisir(new File([blob], url.split('/').pop() ?? 'essai.pdf', { type: 'application/pdf' }));
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

  /**
   * Le mode bascule tout seul (§ 12 de l'ordre de mission des schémas) : tant
   * qu'aucun rapport n'est là, les explications restent générales ; dès qu'un
   * dossier est lu, chaque notion peut répondre « et chez moi ? ».
   */
  $effect(() => {
    exploration.dossier = analyse?.diagnostics ?? [];
  });

  function recommencer(): void {
    analyse = null;
    erreur = null;
    nomFichier = '';

    etat = 'accueil';
  }
</script>

<header class="entete">
  <div class="enveloppe entete-ligne">
    <a class="marque" href="./" onclick={(e) => { e.preventDefault(); recommencer(); }}>
      Check<span>My</span>Diag
    </a>
    <!-- La seule sortie de l'écran de dépôt : les explications générales, pour
         qui n'a pas encore son rapport sous la main. Ce sont de vraies pages
         HTML, fabriquées hors de l'application (scripts/plugin-nuls.ts). -->
    <a class="rubrique" href="./pour-les-nuls/">Les diags pour les nuls</a>
  </div>
</header>

<!--
  Deux écrans, pas un de plus.

  On glisse son fichier. Ensuite on a son rapport, et l'explication à côté. Tout
  ce qui s'intercalait entre les deux — chapeau, arguments, bilan, compteurs,
  profils — a été retiré : c'était du remplissage entre le geste et la réponse.
-->
<main class="enveloppe">
  {#if etat === 'conditions'}
    <!-- Le rapport est choisi mais pas encore ouvert : c'est le seul moment où
         annoncer ce que le site conserve ait une valeur. -->
    <section class="seuil">
      <Cgv nomFichier={nomFichier} surAccepter={accepterEtAnalyser} surRefuser={renoncer} />
    </section>
  {:else if etat !== 'resultat'}
    <section class="seuil">
      {#if erreur}
        <p class="erreur" role="alert">{erreur}</p>
      {/if}

      <Depot surFichier={choisir} occupe={etat === 'lecture'} {progression} />

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

<!-- La couche d'exploration : elle se pose par-dessus, elle ne remplace jamais
     l'écran du lecteur (§ 14). -->
<PanneauSavoir />

<style>
  /* Le bandeau du site : vert profond, un filet or en dessous.

     Il ne colle pas au haut de l'écran. Il l'a fait, et il recouvrait la barre
     des trois vues — collante elle aussi, au même `top: 0`, mais en dessous
     dans l'ordre d'empilement : 75 px de barre masqués sur 87, mesurés. Sur une
     page de six écrans, la navigation disparaissait dès le premier défilement.
     Entre une marque toujours visible et une navigation toujours visible, c'est
     la navigation qui reste. */
  .entete {
    padding: 20px 0;
    border-bottom: 1px solid var(--trait-or);
    background: var(--fond-clair);
  }

  /* La marque en Fraunces, comme les titres du site. « My » prend l'or : une
     seule couleur d'accent, pas un arc-en-ciel. */
  .marque {
    font-family: var(--police-titre);
    font-size: var(--t-titre);
    font-weight: 500;
    letter-spacing: -0.022em;
    text-decoration: none;
    color: var(--sur-fond);
  }

  .marque span {
    color: var(--or-clair);
  }

  .entete-ligne {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  /* Le lien vers la rubrique : il attend, il n'appelle pas. Celui qui a son
     rapport dépose son fichier ; celui qui n'en a pas trouve la sortie. */
  .rubrique {
    font-size: var(--t-micro);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--or-clair);
    text-decoration: none;
  }

  .rubrique:hover {
    color: var(--sur-fond);
    text-decoration: underline;
    text-underline-offset: 4px;
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
    font-size: var(--t-base);
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
    font-size: var(--t-petit);
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
    font-size: var(--t-base);
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
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }
</style>
