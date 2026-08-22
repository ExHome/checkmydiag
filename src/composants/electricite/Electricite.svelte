<script lang="ts">
  /**
   * L'ÉCRAN ÉLECTRICITÉ.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * LA SCÈNE
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Pas de titre, pas de carte, pas de bouton. Une bakélite presque noire qui
   * occupe tout l'écran, un chiffre immense en ivoire, et derrière lui un câble
   * de cuivre qui traverse la page de bord à bord. Le câble n'est pas peint :
   * c'est une fente dans le noir par laquelle passe la lumière.
   *
   * Six pastilles pleines sont posées dessus — les six points que ce diagnostic
   * contrôle. Entre elles, le trait passe en pointillé, toujours : on contrôle
   * des points, pas des trajets. Là où le rapport relève quelque chose, la
   * pastille manque, et il reste un trou avec une braise dedans.
   *
   * Le moment dont on se souvient : on appuie, une lumière part du bord gauche,
   * remonte le câble — elle traverse même les pointillés — et S'ARRÊTE NET au
   * trou. C'est là, et seulement là, que les mots du rapport apparaissent.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * CE QUE CET ÉCRAN REFUSE DE FAIRE
   * ═══════════════════════════════════════════════════════════════════════
   *
   *  · Il ne trie pas les anomalies par gravité : IL N'EN EXISTE AUCUNE dans le
   *    modèle. La gravité porte sur le volet entier, jamais sur une ligne.
   *  · Il n'écrit pas « 7 anomalies ». Le corpus plafonne à 4, et 42 volets sur
   *    56 n'en ont aucune. L'écran est dimensionné pour ce qu'on rencontre.
   *  · Il ne montre jamais une chaîne intacte quand le compte du rapport
   *    dépasse ce qui a pu être lu. La chaîne passe alors entièrement en raies.
   *  · Il ne rattache aucune localisation à une anomalie : `releve.ou` est vide
   *    pour 100 % d'entre elles. Le fait « Où » vaut pour le volet, et c'est
   *    écrit.
   */
  import type { Diagnostic } from '../../lib/modele';
  import { heureDecimale } from '../lumiere/heure';
  import Cable from './Cable.svelte';
  import { lire, type PointCable } from './lecture';
  import { LONGUEUR, STATIONS, type Maillon } from './parcours';

  interface Props {
    /**
     * Le volet électricité du dossier, tel que `analyse/securite.ts` le produit.
     * Aucun champ n'est reconstruit ici : tout passe par `lire()`.
     */
    diagnostic: Diagnostic;
    /** Heure décimale figée. Sans elle, l'écran suit l'horloge de l'appareil. */
    heure?: number;
    onretour?: () => void;
    /** Ouvrir le rapport à une page. L4 : la preuve reste à un geste. */
    ouvrirLaPage?: (page: number) => void;
  }

  const { diagnostic, heure, onretour, ouvrirLaPage }: Props = $props();

  const d = $derived(lire(diagnostic));

  /* Même cadence que la table lumineuse : cinq minutes. La lumière de fin
     d'après-midi bouge en une heure, pas en une image. */
  let horloge = $state(heureDecimale(new Date()));
  $effect(() => {
    if (heure !== undefined) return;
    const minuterie = setInterval(() => {
      horloge = heureDecimale(new Date());
    }, 300_000);
    return () => clearInterval(minuterie);
  });
  const h = $derived(heure ?? horloge);

  /*
   * L'ÉCART ENTRE CE QUI EST ANNONCÉ ET CE QUI EST LU.
   *
   * Tant qu'il est nul, les maillons sans anomalie peuvent être dits contrôlés
   * sans rien de relevé : le rapport conclut pour l'ensemble, donc pour chacun.
   * Dès qu'il est positif, plus une seule pastille ne peut être présentée comme
   * propre — on ne sait pas où sont les anomalies manquantes.
   */
  const ecart = $derived(d.nombre !== null ? d.nombre - d.points.length : 0);
  const peutDireRienReleve = $derived(
    d.chaine === 'lisible' && (d.regime === 'sansAnomalie' || ecart <= 0)
  );

  interface Etape {
    maillon: Maillon;
    nom: string;
    rang: number;
    distance: number;
    points: PointCable[];
  }

  /*
   * L'ORDRE DU PARCOURS EST CELUI DU CÂBLE, pas celui du rapport.
   *
   * Ce n'est pas un classement — il n'y en a pas à faire — c'est une géométrie :
   * la lumière ne peut pas atteindre le sixième maillon avant le deuxième. La
   * LISTE, elle, reste dans l'ordre du rapport, et c'est écrit à côté d'elle.
   */
  const etapes = $derived<Etape[]>(
    d.chaine !== 'lisible'
      ? []
      : d.regime === 'anomalies'
        ? STATIONS.filter((s) => d.points.some((p) => p.maillon === s.cle)).map((s) => ({
            maillon: s.cle,
            nom: s.nom,
            rang: s.rang,
            distance: s.distance,
            points: d.points.filter((p) => p.maillon === s.cle)
          }))
        : STATIONS.map((s) => ({
            maillon: s.cle,
            nom: s.nom,
            rang: s.rang,
            distance: s.distance,
            points: []
          }))
  );

  let etape = $state(-1);
  let duree = $state(320);

  const courant = $derived(etape >= 0 ? (etapes[etape] ?? null) : null);
  const tete = $derived(courant?.distance ?? 0);

  /*
   * VITESSE CONSTANTE.
   *
   * La durée n'est pas un réglage par étape : c'est la longueur du trajet
   * divisée par une vitesse. Le parcours entier vaut `--t-heure`, 1200 ms, et
   * chaque bond en prend sa part. Une lumière qui mettrait le même temps à
   * franchir deux centimètres et le câble entier ne serait pas une lumière,
   * ce serait une animation.
   */
  const TRAVERSEE = 1200;

  function avancer(): void {
    const suivant = etape + 1 >= etapes.length ? -1 : etape + 1;
    const depart = etapes[etape]?.distance ?? 0;
    const arrivee = etapes[suivant]?.distance ?? 0;
    duree = Math.max(180, Math.round((Math.abs(arrivee - depart) / LONGUEUR) * TRAVERSEE));
    etape = suivant;
  }

  const libelleBouton = $derived(
    etape < 0
      ? d.regime === 'anomalies'
        ? 'Suivre le câble'
        : 'Parcourir les six points contrôlés'
      : etape >= etapes.length - 1
        ? 'Revenir au début du câble'
        : 'Point suivant'
  );

  /** Ce que le schéma raconte, pour qui ne le voit pas. */
  const resume = $derived(
    d.chaine === 'brouillee'
      ? 'Le câble des six points contrôlés, entièrement en pointillé : le détail des anomalies n’a pas pu être lu.'
      : d.regime === 'sansAnomalie'
        ? `Le câble des six points contrôlés, tous allumés${d.nonVerifies.length ? ', sauf la protection différentielle qui n’a pas pu être essayée' : ''}. Les trajets entre les points restent en pointillé : ils ne sont pas contrôlés.`
        : `Le câble des six points contrôlés. ${etapes.length === 1 ? 'Un maillon est interrompu' : `${etapes.length} maillons sont interrompus`} : ${etapes.map((e) => e.nom).join(', ')}.`
  );

  const pluriel = $derived(d.points.length > 1);
</script>

<article class="elec">
  <header class="elec__barre">
    {#if onretour}
      <button type="button" class="elec__retour" onclick={onretour}>Le dossier</button>
    {:else}
      <span></span>
    {/if}
    <p class="elec__surtitre">{diagnostic.titre}</p>
  </header>

  <!-- ══ L0 · LE SIGNAL, ET L1 · LA SYNTHÈSE, DANS LA MÊME IMAGE ══════════ -->
  <section class="elec__scene">
    <Cable
      points={d.points}
      nonVerifies={d.nonVerifies}
      chaine={d.chaine}
      gravite={diagnostic.gravite}
      heure={h}
      {tete}
      {duree}
      courant={courant?.maillon ?? null}
      {resume}
    />

    <!--
      LE CHIFFRE EST DANS LA ZONE LIBRE, et cette zone est tenue par un test.
      L'ivoire sur le cuivre plein ne vaut que 1,7:1 ; sur la bakélite nue il
      vaut 14,04. Aucun trait du câble n'entre dans ce rectangle.

      IL NE S'ANIME PAS. Un compteur qui monterait de 0 à 2 afficherait « 1 » en
      chemin — un chiffre que le rapport n'a jamais écrit. La règle de fidélité
      s'applique aussi au mouvement.
    -->
    <p class="elec__chiffre">
      {#if d.nombre === null}
        <strong class="elec__nombre elec__nombre--absent" aria-hidden="true">·</strong>
        <span class="elec__unite">Le compte n’est pas lisible</span>
      {:else}
        <strong class="elec__nombre">{d.nombre}</strong>
        <span class="elec__unite">{d.unite}</span>
      {/if}
    </p>
  </section>

  <div class="elec__corps">
    <p class="elec__badge">{d.badge}</p>
    <p class="elec__verdict">{d.verdict}</p>

    <!-- ══ LA DEUXIÈME LIGNE — celle qui trie, quand il y a de quoi trier ══ -->
    {#if d.regime === 'anomalies' && d.chaine === 'lisible'}
      <p class="elec__ligne">
        {#if d.prioritaires === 0}
          Aucune ne porte sur le différentiel ni sur la mise à la terre.
        {:else if d.prioritaires === d.points.length}
          {pluriel ? 'Toutes portent' : 'Elle porte'} sur le différentiel ou la mise à la terre.
        {:else}
          {d.prioritaires} sur {d.points.length} portent sur le différentiel ou la mise à la terre.
        {/if}
      </p>
      <p class="elec__note">
        Ce sont les deux organes qui protègent les personnes, et les deux que ce dossier demande de
        traiter en premier.
      </p>
    {:else if d.regime === 'sansAnomalie'}
      <p class="elec__ligne">
        {#if d.nonVerifiesTexte && d.nonVerifies.length}
          Cinq des six points sont contrôlés. Le sixième — la protection différentielle — n’a pas pu
          être essayé.
        {:else if d.nonVerifiesTexte}
          Aucun des six points contrôlés n’est en anomalie, mais {d.nonVerifiesTexte.nombre} point de
          contrôle n’a pas pu être vérifié.
        {:else}
          Aucun des six points contrôlés n’est en anomalie.
        {/if}
      </p>
      {#if d.nonVerifiesTexte?.motif}
        <p class="elec__note">{d.nonVerifiesTexte.motif}</p>
      {/if}
    {/if}

    {#if ecart > 0}
      <p class="elec__reserve">
        Le rapport en annonce {d.nombre}. {d.points.length === 0
          ? 'Aucun libellé n’a pu être lu en détail'
          : `${d.points.length} libellé${d.points.length > 1 ? 's ont' : ' a'} pu être lu${d.points.length > 1 ? 's' : ''} en détail`} :
        le câble reste en pointillé sur toute sa longueur, parce qu’on ne sait pas où sont les
        autres. Ils sont dans le tableau des anomalies, page {d.pages[0]}.
      </p>
    {/if}

    <!-- ══ LE GESTE — et seulement ensuite l'accès aux anomalies ══════════ -->
    {#if etapes.length > 0}
      <button type="button" class="elec__geste" onclick={avancer}>
        <span class="elec__geste-trait" aria-hidden="true"></span>
        {libelleBouton}
      </button>
    {:else if d.chaine === 'brouillee'}
      <button
        type="button"
        class="elec__geste"
        onclick={() => ouvrirLaPage?.(d.pages[0])}
        disabled={!ouvrirLaPage}
      >
        <span class="elec__geste-trait" aria-hidden="true"></span>
        Ouvrir le rapport page {d.pages[0]}
      </button>
    {/if}

    <!-- ══ L2 · LA RÉVÉLATION — les mots du rapport, un maillon à la fois ══ -->
    <div class="elec__revelation" aria-live="polite">
      {#if courant}
        <p class="elec__maillon">
          <span class="elec__rang">{courant.rang} / 6</span>
          {courant.nom}
        </p>

        {#if courant.points.length > 0}
          <ul class="elec__anomalies">
            {#each courant.points as p, i (i)}
              <li>
                <p class="elec__libelle">{p.libelle}</p>
                <p class="elec__mecanisme">{p.titre}</p>
                <p class="elec__legende">{p.legende}</p>
                {#if p.code}
                  <p class="elec__code">Code {p.code} de la norme, écrit dans le rapport</p>
                {/if}
              </li>
            {/each}
          </ul>
        {:else if d.nonVerifies.includes(courant.maillon)}
          <p class="elec__legende">
            Ce point n’a pas pu être vérifié{d.nonVerifiesTexte?.motif
              ? ` — ${d.nonVerifiesTexte.motif}`
              : '.'}
          </p>
        {:else if peutDireRienReleve}
          <p class="elec__legende">Le rapport a contrôlé ce point et n’a rien relevé.</p>
        {:else}
          <p class="elec__legende">
            Le rapport ne permet pas de dire ce qu’il a trouvé sur ce point.
          </p>
        {/if}
      {/if}
    </div>

    <!-- ══ CE QUI N'EST RATTACHÉ À AUCUN MAILLON ══════════════════════════ -->
    {#if d.detaches > 0}
      <section class="elec__bloc">
        <h2>Hors de la chaîne</h2>
        <p class="elec__note">
          {d.detaches === 1
            ? 'Un point est signalé par le rapport'
            : `${d.detaches} points sont signalés par le rapport`} sans qu’on puisse le rattacher à
          l’un des six domaines. Il est marqué à l’écart du câble, et non sur un maillon : le placer
          serait affirmer une localisation que rien ne soutient.
        </p>
        <ul class="elec__anomalies">
          {#each d.points.filter((p) => p.maillon === null) as p, i (i)}
            <li><p class="elec__libelle">{p.libelle}</p></li>
          {/each}
        </ul>
      </section>
    {/if}

    <!-- ══ L4 · LA LOCALISATION, telle que le rapport la donne ════════════ -->
    {#if d.localisations.length > 0}
      <section class="elec__bloc">
        <h2>Où, d’après le rapport</h2>
        <ul class="elec__lieux">
          {#each d.localisations as lieu (lieu)}
            <li>{lieu}</li>
          {/each}
        </ul>
        <p class="elec__note">
          Le rapport donne ces localisations pour l’ensemble du volet. Il ne dit pas laquelle
          correspond à quelle anomalie{pluriel ? '' : ''} : ce lien n’existe nulle part dans le
          document.
        </p>
      </section>
    {:else if d.localisationIllisible}
      <section class="elec__bloc">
        <h2>Où, d’après le rapport</h2>
        <p class="elec__note">
          Le rapport donne une localisation, mais elle sort recollée par sa mise en page et n’est pas
          lisible telle quelle. Elle est page {d.pages[0]}, dans le tableau des anomalies.
        </p>
      </section>
    {/if}

    {#if d.compense}
      <section class="elec__bloc">
        <h2>Un point relevé, mais compensé</h2>
        <p class="elec__libelle">{d.compense.valeur}</p>
        {#if d.compense.precision}<p class="elec__note">{d.compense.precision}</p>{/if}
      </section>
    {/if}

    <!-- ══ L3 · CE QUE LE RAPPORT DEMANDE, puis ce qu'il n'a pas regardé ══ -->
    {#if d.geste}
      <section class="elec__bloc elec__bloc--geste">
        <h2>Ce que le rapport demande</h2>
        <p class="elec__libelle">{d.geste}</p>
      </section>
    {/if}

    {#if d.analogie}
      <p class="elec__analogie">{d.analogie}</p>
    {/if}

    <section class="elec__bloc">
      <h2>Ce que ce contrôle ne regarde pas</h2>
      {#each d.explication as paragraphe, i (i)}
        <p class="elec__texte">{paragraphe}</p>
      {/each}
    </section>

    {#if d.aFaire.length > 0}
      <section class="elec__bloc">
        <h2>Ce que ça change pour vous</h2>
        <ul class="elec__afaire">
          {#each d.aFaire as ligne, i (i)}
            <li>{ligne}</li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if diagnostic.demarche}
      <a class="elec__demarche" href={diagnostic.demarche.url} rel="noopener noreferrer">
        {diagnostic.demarche.texte}
        {#if diagnostic.demarche.quoiEmporter}
          <span class="elec__note">{diagnostic.demarche.quoiEmporter}</span>
        {/if}
      </a>
    {/if}

    <!-- ══ L4 · LA PREUVE ═════════════════════════════════════════════════ -->
    <footer class="elec__preuve">
      <p>
        {#if d.date}Visite du {d.date} · {/if}Pages {d.pages[0]} à {d.pages[1]} du dossier{#if d.reperes > 0}
          · {d.reperes} passages surlignés dans le rapport{/if}
      </p>
      {#if ouvrirLaPage}
        <button type="button" class="elec__lien" onclick={() => ouvrirLaPage(d.pages[0])}>
          Voir la page {d.pages[0]}
        </button>
      {/if}
    </footer>
  </div>
</article>

<style>
  /*
   * IL N'Y A PAS DE CARTE, ET IL N'Y A PAS DE FOND DE PAGE SOUS UNE CARTE.
   *
   * L'écran EST le plateau. Le câble le traverse de bord à bord, le texte se
   * pose dessus, et rien n'a de contour. C'est la seule façon de faire une
   * scène plutôt qu'un empilement — « titre → carte → carte → bouton » est
   * exactement ce qui donnait à ce produit son air de logiciel de syndic.
   *
   * Le fond reprend le sol de la charte, celui de `gravite.ts`. On ne le fait
   * pas varier ici : le retrait de gravité est porté par le composant `Cable`,
   * qui le calcule, et le reproduire à deux endroits ferait deux valeurs à
   * tenir d'accord. La bande de texte reste donc au sol clair, où l'ivoire vaut
   * 14,04 et l'encre douce 7,91.
   */
  .elec {
    display: block;
    min-height: 100%;
    background: var(--vert-profond);
    color: var(--verriere-ivoire);
    font-family: var(--police);
  }

  .elec__barre {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--e3);
    padding: var(--e3) var(--e4);
    min-height: 52px;
  }

  .elec__retour,
  .elec__lien {
    min-height: 44px;
    padding: var(--e2) 0;
    border: 0;
    background: none;
    color: rgb(247 246 242 / 78%);
    font: inherit;
    font-size: var(--t-petit);
    text-align: left;
    cursor: pointer;
  }

  .elec__retour::before {
    content: '← ';
  }

  .elec__retour:focus-visible,
  .elec__lien:focus-visible,
  .elec__geste:focus-visible {
    outline: 2px solid var(--verriere-ivoire);
    outline-offset: 3px;
  }

  .elec__surtitre {
    margin: 0;
    font-size: var(--t-micro);
    letter-spacing: var(--suivi-large);
    text-transform: uppercase;
    color: rgb(247 246 242 / 78%);
  }

  /* ── LA SCÈNE ─────────────────────────────────────────────────────────── */

  .elec__scene {
    position: relative;
  }

  .elec__chiffre {
    /* La zone libre de `parcours.ts` : x 0 → 66 %, y 0 → 30/64. Un test
       vérifie qu'aucun trait du câble n'y entre. */
    position: absolute;
    top: 0;
    left: 0;
    width: 66%;
    height: 46%;
    margin: 0;
    padding: var(--e3) var(--e4) 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    pointer-events: none;
  }

  .elec__nombre {
    display: block;
    font-size: clamp(3rem, 19vw, 4.75rem);
    line-height: 0.86;
    font-weight: 600;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
    color: var(--verriere-ivoire);
  }

  .elec__nombre--absent {
    /* Pas de zéro à la place d'un compte illisible. Un point, et le mot le dit
       juste dessous. Zéro serait la seule affirmation vraiment grave de cet
       écran : « on n'a rien trouvé » là où on n'a rien pu lire. */
    opacity: 0.5;
  }

  .elec__unite {
    display: block;
    margin-top: var(--e2);
    font-size: var(--t-base);
    line-height: 1.3;
    color: rgb(247 246 242 / 78%);
  }

  /* ── LE CORPS ─────────────────────────────────────────────────────────── */

  .elec__corps {
    padding: var(--e5) var(--e4) var(--e8);
    max-width: 34rem;
  }

  .elec__badge {
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: rgb(247 246 242 / 78%);
  }

  .elec__verdict {
    margin: 0 0 var(--e4);
    font-size: var(--t-lead);
    line-height: 1.4;
    color: var(--verriere-ivoire);
  }

  .elec__ligne {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.45;
    color: var(--verriere-ivoire);
  }

  .elec__note,
  .elec__legende {
    margin: var(--e2) 0 0;
    font-size: var(--t-petit);
    line-height: 1.55;
    color: rgb(247 246 242 / 78%);
  }

  .elec__reserve {
    margin: var(--e4) 0 0;
    padding-left: var(--e3);
    /* Un filet de braise, jamais un fond d'alerte. La couleur n'est pas là pour
       crier, elle est là pour dire « ce paragraphe corrige le chiffre ». */
    border-left: 2px solid var(--tison);
    font-size: var(--t-petit);
    line-height: 1.55;
    color: rgb(247 246 242 / 88%);
  }

  /* ── LE GESTE ─────────────────────────────────────────────────────────── */

  .elec__geste {
    position: relative;
    display: block;
    width: 100%;
    min-height: 52px;
    margin: var(--e5) 0 0;
    padding: var(--e3) 0;
    border: 0;
    background: none;
    color: var(--verriere-ivoire);
    font: inherit;
    font-size: var(--t-base);
    text-align: left;
    cursor: pointer;
  }

  .elec__geste[disabled] {
    opacity: 0.55;
    cursor: default;
  }

  /* Le trait est un morceau de câble : c'est le même objet que le schéma, pas
     une bordure de bouton. Il s'allume sous le doigt, et il ne déborde pas. */
  .elec__geste-trait {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: var(--cuivre);
    opacity: 0.45;
    transition: opacity var(--t-lumiere) var(--verre);
  }

  .elec__geste:hover .elec__geste-trait,
  .elec__geste:focus-visible .elec__geste-trait {
    opacity: 1;
  }

  .elec__geste::after {
    content: ' →';
  }

  /* ── LA RÉVÉLATION ────────────────────────────────────────────────────── */

  .elec__revelation:not(:empty) {
    margin-top: var(--e4);
  }

  .elec__maillon {
    display: flex;
    align-items: baseline;
    gap: var(--e2);
    margin: 0 0 var(--e2);
    font-size: var(--t-base);
    color: var(--verriere-ivoire);
  }

  .elec__rang {
    font-size: var(--t-micro);
    letter-spacing: var(--suivi);
    color: rgb(247 246 242 / 78%);
    font-variant-numeric: tabular-nums;
  }

  .elec__anomalies,
  .elec__afaire,
  .elec__lieux {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .elec__anomalies > li {
    margin-top: var(--e3);
    padding-left: var(--e3);
    border-left: 1px solid rgb(247 246 242 / 22%);
  }

  .elec__libelle {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.45;
    color: var(--verriere-ivoire);
  }

  .elec__mecanisme {
    margin: var(--e2) 0 0;
    font-size: var(--t-petit);
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: rgb(247 246 242 / 78%);
  }

  .elec__code {
    margin: var(--e1) 0 0;
    font-family: var(--mono);
    font-size: var(--t-micro);
    color: rgb(247 246 242 / 78%);
  }

  /* ── LES BLOCS DE FOND ────────────────────────────────────────────────── */

  .elec__bloc {
    margin-top: var(--e6);
  }

  .elec__bloc h2 {
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    letter-spacing: var(--suivi-large);
    text-transform: uppercase;
    font-weight: 600;
    color: rgb(247 246 242 / 78%);
  }

  .elec__lieux > li {
    margin-top: var(--e1);
    font-size: var(--t-base);
    color: var(--verriere-ivoire);
  }

  .elec__afaire > li {
    margin-top: var(--e3);
    font-size: var(--t-petit);
    line-height: 1.55;
    color: rgb(247 246 242 / 88%);
  }

  .elec__texte {
    margin: var(--e3) 0 0;
    font-size: var(--t-petit);
    line-height: 1.6;
    color: rgb(247 246 242 / 88%);
  }

  .elec__analogie {
    margin: var(--e6) 0 0;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--verriere-ivoire);
  }

  .elec__demarche {
    display: block;
    margin-top: var(--e6);
    padding: var(--e3) 0;
    min-height: 44px;
    color: var(--verriere-ivoire);
    font-size: var(--t-base);
    border-bottom: 1px solid var(--cuivre);
  }

  .elec__preuve {
    margin-top: var(--e7);
    padding-top: var(--e3);
    border-top: 1px solid rgb(247 246 242 / 22%);
    font-size: var(--t-micro);
    line-height: 1.6;
    color: rgb(247 246 242 / 78%);
  }

  .elec__preuve p {
    margin: 0;
  }

  @media (min-width: 720px) {
    /* Le desktop est une adaptation, pas l'inverse : la scène s'élargit, le
       texte garde sa mesure. Rien ne change de forme. */
    .elec__corps {
      padding-left: var(--e6);
      padding-right: var(--e6);
    }
    .elec__chiffre {
      padding-left: var(--e6);
    }
  }
</style>
