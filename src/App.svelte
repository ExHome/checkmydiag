<script lang="ts">
  import Depot from './composants/Depot.svelte';
  import Controles from './composants/Controles.svelte';
  import Resume from './composants/Resume.svelte';
  import Lecteur from './composants/Lecteur.svelte';
  import Profils from './composants/Profils.svelte';
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
    poids,
    type DossierGarde
  } from './lib/coffre';

  let etat = $state<'accueil' | 'lecture' | 'resultat'>('accueil');
  let progression = $state<{ fait: number; total: number } | null>(null);
  let analyse = $state<Analyse | null>(null);
  let erreur = $state<string | null>(null);
  let nomFichier = $state('');
  let exemple = $state(false);
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
    exemple = false;
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

    void dessinerPages(document, frais);
  }

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
      <h1>Votre diag, en clair</h1>
      <p class="chapeau">
        60 pages de jargon → une question : <em>c’est grave ?</em><br />
        Déposez le PDF. Il devient cliquable.
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

    {#if dossiers.length && etat !== 'lecture'}
      <!-- Les dossiers déjà lus restent sur l'appareil : on les rouvre sans
           redéposer le fichier. -->
      <section class="gardes">
        <h3>Vos dossiers</h3>
        <ul>
          {#each dossiers as dossier (dossier.id)}
            <li>
              <button type="button" class="dossier" onclick={() => void rouvrir(dossier)}>
                <strong>{dossier.nomFichier}</strong>
                <span class="muet petit">
                  {dossier.analyse.diagnostics.length} diags · {depuis(dossier.quand, new Date())}
                  {#if dossier.pdf}· {poids(dossier.pdf.size)}{/if}
                </span>
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
        <p class="muet petit">Gardés sur cet appareil. Rien n’est envoyé.</p>
      </section>
    {/if}

    <section class="arguments">
      <div>
        <h3>Rien n’est envoyé</h3>
        <p class="muet">Lu par votre navigateur. Aucun compte, aucune trace.</p>
      </div>
      <div>
        <h3>9 diagnostics</h3>
        <p class="muet">DPE, élec, gaz, amiante, plomb, termites, ERP, assainissement, Carrez.</p>
      </div>
      <div>
        <h3>On vérifie aussi</h3>
        <p class="muet">Périmé, manquant, surfaces qui ne collent pas.</p>
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

    <!-- On arrive sur son rapport, pas sur un bilan. Les tuiles servent de
         navigation, et tout se découvre en cliquant dedans. -->
    <Lecteur {analyse} {rendus} {demande} />

    <!-- Le même dossier ne se lit pas pareil selon qu'on vend, qu'on achète ou
         qu'on fait signer. -->
    <Profils {analyse} />

    <Controles controles={analyse.controles} />

    <div class="reprendre">
      <button class="bouton bouton--fantome" onclick={recommencer}>Analyser un autre rapport</button>
      <button class="bouton bouton--fantome" onclick={() => window.print()}>
        Imprimer l’antisèche
      </button>
    </div>

    <p class="avertissement muet petit">
      Outil de lecture. Aucune valeur réglementaire — la référence reste le rapport signé.
    </p>
  {/if}
</main>

<style>
  .entete {
    padding: 18px 0;
    border-bottom: 1px solid rgb(255 255 255 / 12%);
    background: rgb(6 78 59 / 82%);
    backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  /* La marque porte l'échelle du DPE dans ses lettres : vert à gauche, rouge à
     droite, en couleurs vives. C'est la signature — on doit penser
     « diagnostic » avant même d'avoir lu le mot. */
  .marque {
    font-family: var(--police-titre);
    font-size: 1.42rem;
    font-weight: 800;
    font-style: italic;
    text-decoration: none;
    letter-spacing: -0.035em;
    background: linear-gradient(
      92deg,
      #319834 0%,
      #33cc31 16%,
      #cbfc34 32%,
      #fbfe06 48%,
      #fbcc05 64%,
      #fc9935 80%,
      #fc0205 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  main {
    padding: clamp(28px, 6vw, 56px) 0 80px;
  }

  .reprendre {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 28px 0 18px;
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

  .gardes {
    margin-top: 34px;
  }

  .gardes h3 {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--encre-doux);
    margin-bottom: 10px;
  }

  .gardes ul {
    list-style: none;
    margin: 0 0 10px;
    padding: 0;
    display: grid;
    gap: 8px;
  }

  .gardes li {
    display: flex;
    align-items: stretch;
    gap: 6px;
  }

  .dossier {
    flex: 1;
    display: grid;
    gap: 2px;
    text-align: left;
    background: var(--papier);
    border: 1px solid var(--trait);
    border-radius: var(--rayon-petit);
    padding: 12px 16px;
    cursor: pointer;
    color: inherit;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .dossier:hover {
    border-color: var(--vert-500);
    background: var(--papier-doux);
  }

  .oublier {
    background: none;
    border: 1px solid var(--trait);
    border-radius: var(--rayon-petit);
    color: var(--encre-doux);
    width: 42px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .oublier:hover {
    border-color: var(--alerte);
    color: var(--alerte);
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
