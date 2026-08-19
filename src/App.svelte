<script lang="ts">
  import Depot from './composants/Depot.svelte';
  import Cgv from './composants/Cgv.svelte';
  import { acceptationEnCours, accepter } from './lib/cgv';
  import Lecteur from './composants/Lecteur.svelte';
  import PanneauSavoir from './composants/savoir/PanneauSavoir.svelte';
  import { exploration } from './lib/savoir/pile.svelte';
  import { ouvrirPdf, type PageRendue, type Photo } from './lib/pdf';
  import { echecDeLecture, echecScanne, refusAvantLecture } from './lib/echec';
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
  /**
   * La photo du bien, tirée de la page de garde du rapport.
   *
   * Elle ne change rien à l'analyse : elle sert à reconnaître son logement d'un
   * coup d'œil. Comme le reste, elle est extraite dans le navigateur et n'en
   * sort pas.
   */
  let photo = $state<Photo | null>(null);
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
    photo = null;
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
    photo = null;
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

    /*
     * Ce qu'on peut refuser sans rien ouvrir : le type — que le glisser-déposer
     * ne filtre pas —, le fichier vide, le fichier hors de portée du navigateur.
     * Trois secondes d'attente évitées, et un message qui dit quoi faire plutôt
     * qu'un échec après coup.
     */
    const refus = refusAvantLecture(fichier);
    if (refus) {
      erreur = refus.message;
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
      photo = null;
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

      // La photo arrive quand elle peut : le verdict n'attend pas une image.
      void document.photoDuBien().then((p) => (photo = p));

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
    /*
     * Toutes les pages du rapport, et non les seules pages à conclusion.
     *
     * On n'en dessinait qu'une par diagnostic : le lecteur voyait six pages
     * d'un dossier qui en compte cinquante-trois, sans savoir que le reste
     * existait. C'est son document — il doit pouvoir le parcourir en entier.
     *
     * L'ordre, en revanche, n'est pas celui du document : on commence par les
     * pages qui portent un constat, puisque ce sont celles vers lesquelles un
     * clic peut renvoyer tout de suite. Le reste se remplit derrière, sans que
     * personne n'attende.
     */
    const prioritaires: number[] = [];
    for (const diag of resultat.diagnostics) {
      for (const repere of diag.reperes ?? []) {
        if (!prioritaires.includes(repere.page)) prioritaires.push(repere.page);
      }
    }

    const aFaire = new Set<number>(prioritaires);
    for (let n = 1; n <= resultat.nbPages; n++) aFaire.add(n);

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

  /**
   * L'écran de démarrage s'annonce sur le corps du document.
   *
   * Il ne suffit pas de peindre le contenu : le fond bleu pétrole doit couvrir
   * toute la page, bandeau compris et sous la ligne de flottaison, sinon on
   * voit réapparaître le sable dès qu'on tire l'écran vers le bas. La classe
   * est posée sur `body`, et tout le reste en découle par les variables.
   */
  $effect(() => {
    const corps = document.body;
    if (etat === 'resultat') {
      corps.classList.remove('demarrage');
      return;
    }
    corps.classList.add('demarrage');
    return () => corps.classList.remove('demarrage');
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
    <!--
      La marque, avec sa signature.

      La charte demande que le nom ne circule jamais seul : c'est la signature
      qui dit l'activité, pas le nom. « Verrière » seul ne se comprend qu'une
      fois qu'on sait — et une marque nouvelle ne peut compter sur personne pour
      le savoir.

      Le mot s'écrit sans article. « La Verrière » désigne une commune des
      Yvelines, et le référencement s'y perdrait.
    -->
    <a class="marque" href="./" onclick={(e) => { e.preventDefault(); recommencer(); }}>
      <span class="porte-logo" aria-hidden="true">
        <img class="tuile-logo" src="./logo/prisme.svg" alt="" width="44" height="50" />
      </span>
      <span class="mot">
        Verrière
        <span class="signature">La lumière sur vos diagnostics</span>
      </span>
    </a>
    <!--
      « En clair » n'est plus dans le bandeau, nulle part.

      Il y était comme une sortie de secours, en haut à droite, à côté de la
      marque : deux liens au même endroit, dont un qui quitte l'application. Il
      brouillait la lecture de l'écran plutôt que de l'ouvrir.

      Il avait d'abord été retiré du seul écran de résultat, ce qui ne réglait
      rien : c'est sur l'écran de dépôt — le premier qu'on voit — qu'il tirait
      l'œil hors du geste qu'on venait faire.

      Deux accès subsistent, tous deux à leur place : en toutes lettres sous la
      zone de dépôt, pour qui arrive sans rapport sous la main, et en
      application dans la rangée « Pour comprendre » de l'accueil, à côté de
      Dicodiag. On y va quand on cherche une réponse, pas parce qu'on l'a
      croisé.
    -->
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
        <!-- Deux sorties pour qui n'a rien à déposer : voir ce que ça donne, ou
             lire sans fichier. La seconde manquait — le lexique n'était atteignable
             que par l'en-tête, où l'on ne va pas quand on hésite encore. -->
        <p class="essai">
          Pas de rapport sous la main ?
          <button type="button" class="lien" onclick={montrerExemple}>Voir un exemple</button>
          <span class="ou">ou</span>
          <a class="lien" href="./en-clair/">lire les réponses en clair</a>
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
      <!-- Le même message qu'au dépôt : la phrase du scan vit dans `echec.ts`,
           pour qu'elle ne se mette pas à diverger d'un écran à l'autre. -->
      <p class="erreur" role="alert">{echecScanne().message}</p>
    {:else if analyse.diagnostics.length === 0}
      <p class="erreur" role="alert">
        Aucun diagnostic reconnu dans ce document. Il s’agit peut-être d’un autre type de rapport,
        ou d’une mise en page que Verrière ne sait pas encore lire.
      </p>
    {/if}

    <Lecteur {analyse} {rendus} {demande} {photo} />

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
  /*
   * Le bandeau ne se distingue plus par une couleur, mais par un filet.
   *
   * Il portait --fond-clair, qui était le blanc sur fond sable. Depuis que le
   * fond est pétrole, ce jeton vaut un second bleu : le bandeau formait une
   * bande d'une nuance à peine différente, ce qui se lit comme un défaut de
   * rendu plutôt que comme une structure. Un filet citron dilué suffit à poser
   * la limite, et l'écran gagne un aplat continu du haut jusqu'au dock.
   */
  .entete {
    padding: var(--e4) 0;
    border-bottom: 1px solid var(--trait-or);
    background: transparent;
  }

  /*
   * LA VERSION HORIZONTALE DU BRAND BOARD.
   *
   * Le pack la definit ainsi : le prisme, un FILET VERTICAL, puis le nom et sa
   * signature. Ce filet n'est pas un ornement -- c'est lui qui donne au prisme
   * son territoire et l'empeche d'etre lu comme une puce du texte.
   *
   * Mesure avant : le prisme occupait 13 % de la largeur du bloc de marque,
   * la ou le brand board lui en donne environ un cinquieme. Il ne ressortait
   * pas parce qu'il etait petit ET colle au mot.
   */
  .marque {
    display: inline-flex;
    align-items: center;
    gap: var(--e3);
    min-height: 44px;
    text-decoration: none;
    color: var(--sur-fond);
  }

  /*
   * LA TUILE DU BRAND BOARD.
   *
   * Le pack montre trois usages « sur fond » : le prisme pose dans une tuile
   * arrondie vert profond, dans une tuile ivoire, ou blanc sur un degrade. La
   * tuile est ce qui le fait ressortir le plus -- c'est aussi la forme de
   * l'icone d'application, celle qu'on verra sur l'ecran d'accueil d'un
   * telephone.
   *
   * Elle vaut sur les deux fonds : plus sombre que le vert de l'ecran de
   * depot, franchement contrastee sur l'ivoire du dossier. Le prisme a donc le
   * meme support partout, et c'est ce que « systeme de marque » veut dire.
   */
  .porte-logo {
    flex: none;
    display: grid;
    place-items: center;
    width: 64px;
    height: 64px;
    border-radius: 18px;
    background: var(--vert-profond);
    box-shadow: var(--ombre-forte);
  }

  .mot {
    padding-left: var(--e3);
    border-left: 1px solid var(--trait-fin);
  }

  /*
   * LE PRISME, tel que le pack maître le fournit.
   *
   * Les six carreaux sont abandonnés : l'ODM directeur nomme le prisme logo
   * principal, et interdit de réintroduire un logo rejeté. Le prisme dit ce que
   * fait le produit — une information complexe entre, la lumière la décompose
   * et révèle l'essentiel.
   *
   * Le fichier vient de `02_IDENTITE_LOGO/verriere_logo_prisme.svg`, et il n'est
   * pas redessiné : on en extrait le seul symbole, chemins et couleurs
   * inchangés, parce que le nom est déjà écrit à côté en HTML. Le logo complet,
   * mot compris, reste disponible dans `prisme-complet.svg`.
   *
   * ── Décalqué sur la PUBLICITÉ, pas sur le SVG du pack ────────────────────
   *
   * Le pack fournit deux versions du prisme, et elles diffèrent. Le SVG est une
   * simplification : un dégradé continu barré de quatre rayons. La publicité
   * — et c'est elle que la cliente désigne — montre un prisme à SIX LAMELLES
   * distinctes, turquoise, vert, chartreuse, jaune, orange, rouge, qui
   * convergent vers la pointe droite, séparées de la moitié pleine par un
   * fuseau clair.
   *
   * C'est cette version-ci qui dit ce que fait le produit : une matière opaque
   * d'un côté, la même décomposée de l'autre.
   *
   * Rien n'est inventé. La géométrie est relevée au pixel sur le master
   * (losange de 90 × 95, axe au centre) et les six couleurs sont échantillonnées
   * une à une dans l'image. Le logo complet, mot compris, reste disponible tel
   * qu'il a été fourni dans `prisme-complet.svg`.
   */
  .tuile-logo {
    flex: none;
    width: 44px;
    height: 50px;
    /*
     * Une ombre portee, et elle n'est pas cosmetique.
     *
     * La moitie pleine du prisme est un vert tres sombre : il lui faut un
     * contour pour ne pas se diluer dans son support.
     */
    filter: drop-shadow(0 2px 6px rgb(0 0 0 / 35%));
  }

  /*
   * « V E R R I E R E » : capitales largement espacees.
   *
   * C'est ainsi que le nom est ecrit sur TOUS les visuels de la Dropbox sans
   * exception -- la publicite, le brand board du prisme, l'ordre de mission
   * visuel, la maquette d'accueil. Le mot y respire, en capitales fines et
   * espacees, a cote du prisme.
   *
   * Il etait ici en casse normale, en gras, avec un interlettrage NEGATIF
   * (-0,022em) : exactement l'inverse. Sur l'element le plus visible de la
   * marque, present sur chaque ecran.
   *
   * Les capitales sont posees par le style et non ecrites dans le texte : un
   * lecteur d'ecran prononce « Verriere », pas « V E R R I E R E ».
   */
  .mot {
    display: grid;
    font-family: var(--police-titre);
    font-size: var(--t-lead);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.24em;
    line-height: 1.15;
  }

  /*
   * La signature accompagne le nom partout.
   *
   * C'est une exigence de la charte, et elle est juste : « Verrière » seul ne
   * dit pas ce que fait le produit. Une marque installée peut se le permettre,
   * une marque de trois jours non.
   */
  /* La signature reprend le meme parti : capitales fines et espacees, calees
     sous le nom. Son interlettrage est plus large encore -- c'est ce qui la
     tient a la largeur du mot au-dessus, sur les visuels comme ici. */
  .signature {
    font-family: var(--police);
    font-size: var(--t-micro);
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--sur-fond-doux);
  }

  /* Le bandeau ne porte plus que la marque : l'alignement sur la ligne de base
     servait à caler un second lien qui n'existe plus, et il désalignait la
     verrière de son mot. */
  .entete-ligne {
    display: flex;
    align-items: center;
    gap: var(--e4);
    flex-wrap: wrap;
  }

  /*
   * Le `0` horizontal de ce raccourci écrasait le `padding-inline` que
   * `.enveloppe` pose pour tout le site : sur cet écran, le contenu touchait le
   * bord de la fenêtre. Ça ne se voyait pas tant que tout y était centré ; les
   * pastilles des diagnostics, alignées à gauche, l'ont révélé. On ne règle donc
   * plus que le vertical, et la marge latérale reste celle de la maison.
   */
  main {
    padding-block: clamp(28px, 6vw, 56px) 80px;
  }

  /* Le seuil : une seule chose à faire, au milieu de l'écran. */
  .seuil {
    max-width: 640px;
    margin-inline: auto;
    padding-top: clamp(20px, 8vh, 70px);
  }

  .essai {
    text-align: center;
    margin-top: var(--e4);
    color: var(--sur-fond-doux);
    font-size: var(--t-base);
  }

  /* Le « ou » sépare deux sorties de même rang : il s'efface pour qu'on lise
     les deux propositions, pas la conjonction. */
  .ou {
    margin: 0 var(--e1);
    opacity: 0.7;
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
    margin: var(--e6) 0 0;
    padding: 0;
    display: grid;
    gap: var(--e1);
  }

  .gardes li {
    display: flex;
    align-items: stretch;
    gap: var(--e1);
  }

  .dossier {
    flex: 1;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--e3);
    text-align: left;
    background: var(--surface-forte);
    border: 1px solid var(--surface-bord);
    border-radius: 12px;
    padding: var(--e3) var(--e4);
    cursor: pointer;
    color: var(--sur-fond);
    transition: border-color 0.18s ease, background 0.18s ease;
  }

  .dossier:hover {
    border-color: rgb(214 230 106 / 52%);
    background: var(--surface-bord);
  }

  .quand {
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
    white-space: nowrap;
  }

  .oublier {
    background: none;
    border: 1px solid var(--surface-bord);
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
    background: rgb(214 230 106 / 17%);
    border: 1px solid rgb(214 230 106 / 62%);
    color: #ffd9d3;
    border-radius: var(--rayon-petit);
    padding: var(--e3) var(--e4);
    margin-bottom: var(--e4);
  }

  .avertissement {
    margin-top: var(--e6);
    padding-top: var(--e4);
    border-top: 1px solid var(--surface-bord);
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }
</style>
