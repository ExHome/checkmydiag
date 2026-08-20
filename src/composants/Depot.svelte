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
  /** La démonstration « rien ne part » — repliée, mais à portée de clic. */
  let preuveOuverte = $state(false);

  function prendre(fichiers: FileList | null | undefined): void {
    const fichier = fichiers?.[0];
    if (fichier) surFichier(fichier);
  }

  function deposer(e: DragEvent): void {
    e.preventDefault();
    survol = false;
    prendre(e.dataTransfer?.files);
  }

  /*
   * Toute la page reçoit le fichier, pas seulement l'encadré.
   *
   * Le glisser-déposer ne marchait que sur la zone dessinée. Lâché à trois
   * centimètres à côté — ce qui arrive tout le temps, la cible est petite sur un
   * grand écran —, le navigateur prenait la main : il ouvrait le PDF dans
   * l'onglet, et l'application disparaissait. Le lecteur perdait son travail
   * sans comprendre ce qu'il avait fait de travers.
   *
   * On accepte donc le dépôt partout, et l'encadré s'allume dès qu'un fichier
   * survole la fenêtre — il montre où ça va atterrir plutôt que d'exiger qu'on
   * vise juste.
   */
  function surVolFenetre(e: DragEvent): void {
    if (occupe) return;
    // Sans ce refus, le navigateur ouvre le fichier au lâcher.
    e.preventDefault();
    if (e.dataTransfer?.types?.includes('Files')) survol = true;
  }

  function quitteFenetre(e: DragEvent): void {
    // `dragleave` part aussi quand on passe d'un élément à l'autre : on ne
    // rend la main que si le curseur a réellement quitté la fenêtre.
    if (e.relatedTarget === null) survol = false;
  }

  function deposerSurFenetre(e: DragEvent): void {
    if (occupe) return;
    e.preventDefault();
    survol = false;
    prendre(e.dataTransfer?.files);
  }
</script>

<!-- La fenêtre entière reçoit le fichier : viser l'encadré n'est plus
     obligatoire, et lâcher à côté ne fait plus perdre l'application. -->
<svelte:window
  ondragover={surVolFenetre}
  ondragleave={quitteFenetre}
  ondrop={deposerSurFenetre}
/>

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
         sait pas ce qu'est Verrière : il faut lui dire ce qui va se
         passer, pas comment ça s'appelle. -->
    <p class="titre">
      {survol ? 'Lâchez, on s’occupe du reste' : 'Déposez votre rapport de diagnostic'}
    </p>
    <p class="promesse">
      Il devient lisible : ce que chaque ligne veut dire, si c’est grave, et ce
      qui manque dans le dossier.
    </p>

    <span class="faux-bouton">Choisir mon PDF</span>

    <!--
      Les deux voies, dites à l'écran.
      Le glisser-déposer existait sans être annoncé nulle part : seul le bouton
      se voyait, et personne ne devine un geste qu'on ne lui montre pas. Il
      fonctionne désormais sur toute la fenêtre — on n'a plus à viser.
    -->
    <p class="ou-glisser">ou faites glisser le fichier n’importe où sur la page</p>

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
        <button
          type="button"
          class="verifier"
          aria-expanded={preuveOuverte}
          onclick={() => (preuveOuverte = !preuveOuverte)}
        >
          {preuveOuverte ? 'Fermer' : 'Comment le vérifier ?'}
        </button>
      </span>
    </p>

    {#if preuveOuverte}
      <!--
        La preuve, pas la promesse.

        Un professionnel n'a aucune raison de nous croire sur parole, et il a
        raison. La démonstration tient en quatre gestes et ne demande rien
        d'autre que son navigateur : il n'y a pas de meilleure réponse à
        « qu'est-ce que vous faites de mon fichier ? » que « regardez
        vous-même ».
      -->
      <div class="preuve">
        <p class="titre-preuve">Vérifiez-le vous-même, en quatre gestes</p>
        <ol>
          <li>Ouvrez les outils de développement de votre navigateur — touche <kbd>F12</kbd>.</li>
          <li>Allez dans l’onglet <strong>Réseau</strong>, et videz la liste.</li>
          <li>Déposez votre rapport ici.</li>
          <li>
            Regardez la liste : aucune requête ne part avec votre fichier. Vous pouvez même couper
            votre connexion internet avant de déposer — tout continue de fonctionner.
          </li>
        </ol>
        <p class="apres-preuve">
          Le rapport est gardé sur votre appareil pour que vous puissiez le rouvrir sans le
          redéposer. Vous pouvez le retirer à tout moment depuis la liste de vos dossiers.
        </p>
      </div>
    {/if}
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
  /*
   * La zone de dépôt, au format de la charte : trois pixels de teal, un voile
   * de la même teinte, huit de rayon. Trois états, trois couleurs — au repos le
   * teal, au survol le citron, et l'ambre au moment précis où le fichier est
   * au-dessus. C'est cette troisième couleur qui dit « lâchez ».
   */
  /*
   * L'encadré de l'écran de démarrage : un cadre citron, un intérieur sable.
   *
   * Posé sur le bleu pétrole, il est la seule chose claire de l'écran — donc la
   * seule chose qu'on regarde, et c'est celle sur laquelle il faut cliquer. Le
   * cadre citron redit la même chose une seconde fois.
   *
   * Le sable revient ici avec ses couleurs de texte : l'inversion générale de
   * l'écran s'arrête au bord du cadre. Sans cette remise à l'endroit, le texte
   * serait resté sable sur sable.
   */
  .depot {
    display: block;
    width: 100%;
    font: inherit;
    border: 3px solid var(--action);
    border-radius: var(--rayon-large);
    background: var(--sable);
    padding: var(--e7) var(--e6);
    text-align: center;
    cursor: pointer;

    --sur-fond: var(--verriere-vert);
    --sur-fond-doux: #555555;
    --encre: var(--verriere-vert);
    --encre-doux: #555555;
    --vert-500: var(--verriere-vert);
    --vert-700: var(--verriere-vert);
    color: var(--verriere-vert);

    box-shadow: 0 8px 32px rgb(10 43 35 / 45%);
    transition:
      border-color var(--duree) ease,
      background var(--duree) ease,
      transform var(--duree) var(--courbe);
  }

  .depot:hover:not(:disabled) {
    border-color: var(--action-forte);
    background: var(--sable-clair);
    transform: translateY(-2px);
  }

  /* Le survol d'un fichier qu'on tient encore : la troisième couleur, celle qui
     dit « lâchez ». Elle reste dans la charte — c'est le vert plein. */
  .depot.survol {
    border-color: var(--action-forte);
    background: #fff;
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    .depot,
    .depot:hover:not(:disabled),
    .depot.survol {
      transition: none;
      transform: none;
    }
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

  /* La pastille de la charte : filet de teal, voile de la même teinte, et un
     soulèvement au survol qui passe au citron. */
  .badges li {
    padding: var(--e4) var(--e3);
    background: rgb(10 43 35 / 8%);
    border: 2px solid var(--verriere-vert);
    border-radius: var(--rayon-badge);
    font-size: var(--t-petit);
    font-weight: 600;
    color: var(--sur-fond);
    transition:
      border-color var(--duree) ease,
      background var(--duree) ease,
      transform var(--duree) ease;
  }

  .badges li:hover {
    border-color: var(--action);
    background: rgb(214 230 106 / 12%);
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    .badges li:hover {
      transform: none;
    }
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
    /*
     * Une couleur FRANCHE, pas un lavis.
     *
     * Ce bloc portait un vert #e6ede4 : un vert grisatre, si pale qu'il ne
     * disait ni « vert » ni « fond » -- exactement ce qu'on ne veut plus voir.
     * Or c'est la promesse la plus importante du produit : le document ne part
     * nulle part. Elle merite un aplat plein.
     *
     * Vert profond, encre ivoire : le contraste est maximal, l'affirmation
     * aussi.
     */
    background: var(--vert-profond);
    border: none;
    border-radius: var(--rayon);
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--ivoire);
  }

  .promesse-locale svg {
    flex: none;
    width: 22px;
    height: 22px;
    /* Sur l'aplat vert, le bouclier passe en sauge : il se detache sans
       crier, et le sauge est du socle de marque. */
    color: var(--vert-sauge);
  }

  .promesse-locale strong {
    display: block;
  }

  /* Le lien de vérification vit dans la phrase : c'est là que le doute naît. */
  .verifier {
    display: inline;
    margin-left: var(--e1);
    padding: 0;
    background: none;
    border: none;
    /* Le lien vit maintenant sur l'aplat vert : encre ivoire, souligne du
       meme trait. Sans quoi il disparaissait dans le fond. */
    border-bottom: 1px solid rgb(247 246 242 / 55%);
    font: inherit;
    font-weight: 600;
    color: var(--ivoire);
    cursor: pointer;
  }

  .verifier:hover {
    color: #ffffff;
    border-bottom-color: #ffffff;
  }

  .preuve {
    margin-top: var(--e3);
    padding: var(--e4);
    background: var(--papier);
    border: 1px solid var(--trait-fin);
    border-radius: var(--rayon);
  }

  .titre-preuve {
    margin: 0 0 var(--e3);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    color: var(--gris);
  }

  .preuve ol {
    margin: 0;
    padding-left: var(--e5);
    display: grid;
    gap: var(--e2);
  }

  .preuve li {
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--encre-doux);
  }

  .preuve kbd {
    font-family: var(--mono);
    font-size: 0.9em;
    padding: 1px 5px;
    background: var(--papier-doux);
    border: 1px solid var(--trait-fin);
    border-radius: 3px;
  }

  .apres-preuve {
    margin: var(--e3) 0 0;
    padding-top: var(--e3);
    border-top: 1px solid var(--trait-fin);
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--encre-doux);
  }

  /* L'appel principal de l'écran : le bouton de la charte, vert plein, avec
     son ombre de la même couleur. Il était en navy à angles vifs — il attendait
     au lieu d'inviter. */
  /* La seconde voie, en retrait sous le bouton : elle se propose, elle ne se
     dispute pas la place avec l'action principale. */
  .ou-glisser {
    margin-top: var(--e3);
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  /* Le vert profond, pas le vert vif : avec du texte blanc, le vif ne tient
     que 2,8 de contraste, et c'est le seul mot de l'écran sur lequel il faut
     cliquer. Mesuré. */
  .faux-bouton {
    display: inline-block;
    margin-top: var(--e5);
    background: var(--action-forte);
    color: var(--sur-action);
    border-radius: var(--rayon);
    padding: 14px 40px;
    font-size: 0.9375rem;
    font-weight: 600;
    box-shadow: 0 4px 12px rgb(214 230 106 / 20%);
    transition: background var(--duree) ease, box-shadow var(--duree) ease;
  }

  .depot:hover:not(:disabled) .faux-bouton {
    background: #0a2b23;
    box-shadow: 0 6px 16px rgb(214 230 106 / 26%);
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
