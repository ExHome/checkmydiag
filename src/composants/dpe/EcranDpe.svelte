<script lang="ts">
  /**
   * L'ÉCRAN DU DPE — la lame qui s'ouvre, puis la coupe sur la table lumineuse.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * CE QU'ON VOIT EN TROIS SECONDES
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Une page ivoire, calme, traversée par la lumière de l'heure. En haut, sept
   * lames posées côte à côte — l'échelle de l'arrêté, entière, dans ses
   * couleurs officielles. L'UNE D'ELLES S'OUVRE : elle s'évase vers le bas et
   * devient le champ où la lettre est écrite, énorme. C'est le prisme du logo
   * rendu fonctionnel — une lumière entre, une seule lame en sort.
   *
   * Puis, plus bas, l'objet profond de la page : la table lumineuse, et dessus
   * le logement en coupe. Là où le rapport relève une isolation, un trait épais
   * arrête la lumière. Là où il n'en relève aucune, il ne reste qu'un trait fin
   * et LA LUMIÈRE TRAVERSE. Là où il ne dit rien, elle passe par raies.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * L'ÉCHELLE RÉGLEMENTAIRE EST UNE CITATION, PAS UNE PALETTE
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Les sept couleurs de l'arrêté traversent l'intervalle 60°–140° que la
   * direction artistique interdit — le `#cbfc34` de la classe C est à 75°,
   * exactement le jaune-vert dont on s'est débarrassé. Elles restent pourtant
   * intactes, dans l'ordre, sans retouche : ce n'est pas la palette de
   * Verrière, c'est le texte réglementaire, et on ne réécrit pas un texte.
   *
   * Ce qui est tenu, en revanche, c'est leur EMPRISE. Elles n'apparaissent
   * qu'en lames de 30 px, jamais en aplat. Sous la lettre, il ne reste qu'une
   * nappe à 18 % sur l'ivoire — mesurée, § « les couleurs » plus bas : c'est
   * l'alpha maximal qui laisse les trois encres du produit au-dessus de 4,5:1
   * sur les sept classes. À 22 %, la braise tombe à 4,36 sur la classe G.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * LA GRAMMAIRE DE LA LUMIÈRE EST INVERSÉE ICI, ET C'EST DÉCLARÉ
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Ailleurs, ce qui arrête la lumière est une anomalie. Sur le DPE, la lumière
   * EST la chaleur : ce qui l'arrête est l'isolant, donc la bonne nouvelle. La
   * clé est écrite sur la table avant qu'on lise le dessin, et l'écran ne passe
   * aucune `Occlusion` — la légende automatique de `calque.ts` écrirait « le
   * rapport relève quelque chose ici » au-dessus d'un mur bien isolé.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * FIDÉLITÉ — CE QUI DISPARAÎT QUAND LA DONNÉE MANQUE
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Aucun bloc de cet écran n'a de valeur de repli. Un chiffre absent ne
   * devient pas « — » ni « 0 » : sa section n'existe pas. Trois cas méritent
   * d'être suivis à la lecture du code :
   *
   *   `finale === null`     la réglette reste entière, AUCUNE lame ne s'ouvre.
   *                         L'échelle existe, votre place sur elle n'est pas
   *                         établie. C'est l'image exacte de la situation.
   *   `postes` vide         le bloc « où part l'énergie » n'est pas rendu.
   *   `isolation` toute     la coupe est entièrement en raies. Elle ne dit pas
   *   à `inconnu`           que le logement va bien : elle dit qu'on ne sait
   *                         rien, et c'est ce qu'on veut voir.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * CE QUI S'ANIME, ET CE QUI NE S'ANIME PAS
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Presque rien. La règle d'`app.css` — on ne transitionne jamais une
   * propriété qui lit un jeton qui change — retire de la liste tout ce qui lit
   * l'heure ou la gravité : la nappe chaude de la page, le fond du bloc de
   * classe, le plateau de la table. Ces surfaces prennent leur valeur d'un
   * coup, ensemble, sans couture.
   *
   * Il reste le bouton de démarche, dont les états ne lisent que des jetons
   * fixes. C'est tout, et c'est voulu : un écran qui annonce une passoire
   * thermique n'a pas à faire de spectacle.
   */
  import type { Diagnostic, Fait, Isolation, Lettre } from '../../lib/modele';
  import { etiquetteDe, origineDe } from '../../lib/analyse/confiance';
  import { zonesDe } from '../../lib/analyse/plan';
  import TableLumineuse from '../lumiere/TableLumineuse.svelte';
  import { heureDecimale, lumiereDe, teinteDe } from '../lumiere/heure';
  import { retraitDe } from '../lumiere/gravite';
  import {
    CLE,
    HAUTEUR,
    NOM_PAROI,
    PAROIS,
    RAIES,
    TERRAIN,
    TRAIT_MANTEAU,
    TRAIT_STRUCTURE,
    clesUtiles,
    coupeEnMots,
    tracerLaCoupe,
    type Paroi
  } from './coupe';

  interface Props {
    /** Le diagnostic tel que le moteur le produit. Rien n'est reconstruit ici. */
    diagnostic: Diagnostic;
    /**
     * Heure décimale figée (13,75 = 13 h 45). Sans elle, l'écran suit l'horloge
     * de l'appareil — c'est l'idée n° 2 de la direction : on ne voit jamais
     * deux fois le même écran.
     */
    heure?: number;
  }

  const { diagnostic, heure }: Props = $props();

  /* ── L'HEURE, UNE SEULE FOIS POUR TOUT L'ÉCRAN ───────────────────────────
     La table lumineuse sait lire l'horloge toute seule ; on la lui impose
     quand même, pour que la nappe chaude de la page et la lampe du plateau ne
     puissent jamais diverger de quelques minutes. */
  let horloge = $state(heureDecimale(new Date()));

  $effect(() => {
    if (heure !== undefined) return;
    const minuterie = setInterval(() => {
      horloge = heureDecimale(new Date());
    }, 300_000);
    return () => clearInterval(minuterie);
  });

  const h = $derived(heure ?? horloge);
  const lumiere = $derived(lumiereDe(h));
  const etat = $derived(retraitDe(diagnostic.gravite, lumiere.intensite));
  const teinte = $derived(teinteDe(lumiere.temperature));

  /* ── LA DONNÉE ──────────────────────────────────────────────────────────
     Un seul point d'entrée typé. Si le schéma n'est pas un schéma de DPE, tout
     ce qui en dépend disparaît de l'écran — plutôt que d'afficher un gabarit
     vide qui laisserait croire à un rapport pauvre. */
  const schema = $derived(diagnostic.schema?.genre === 'dpe' ? diagnostic.schema : null);
  const finale = $derived(schema?.finale ?? null);
  const energie = $derived(schema?.energie ?? null);
  const climat = $derived(schema?.climat ?? null);
  const postes = $derived(schema?.postes ?? []);
  const isolation = $derived<Isolation | null>(schema?.isolation ?? null);

  const origine = $derived(origineDe(diagnostic));
  const provenance = $derived(etiquetteDe(origine));

  /** Un fait par son libellé exact, tel que `analyse/dpe.ts` l'écrit. */
  function fait(libelle: string) {
    return diagnostic.faits.find((f) => f.libelle === libelle);
  }

  const cout = $derived(fait('Coût annuel estimé'));
  const parOu = $derived(fait('Par où la chaleur s’en va'));

  /** Les faits d'identité du rapport, dans l'ordre où un notaire les cherche. */
  const PREUVES = [
    'Surface de référence',
    'Année de construction',
    'Consommation annuelle',
    'Émissions',
    'Ventilation',
    'Établi le',
    'Valable jusqu’au',
    'N° ADEME'
  ] as const;
  const preuves = $derived(
    PREUVES.map((l) => fait(l)).filter((f): f is Fait => f !== undefined)
  );

  /* ── L'ÉCHELLE ──────────────────────────────────────────────────────────
     Les sept lames de l'arrêté. Les couleurs vivent dans `app.css` sous
     `--etq-a` … `--etq-g` : elles ne sont pas recopiées ici. */
  const LETTRES: readonly Lettre[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const rangDeLaClasse = $derived(finale ? LETTRES.indexOf(finale) : -1);

  /* Les deux abscisses de la lame ouverte, en pourcentage de la réglette.
     C'est de là que part l'évasement : la lame se disperse jusqu'à occuper
     toute la largeur, comme la lumière sortant du prisme. */
  const bordGauche = $derived(rangDeLaClasse >= 0 ? (rangDeLaClasse / 7) * 100 : 0);
  const bordDroit = $derived(rangDeLaClasse >= 0 ? ((rangDeLaClasse + 1) / 7) * 100 : 100);

  /* ── LA COUPE ───────────────────────────────────────────────────────────
     Le tracé et les mots sortent des mêmes quatre valeurs : ils ne peuvent pas
     se contredire. */
  const trace = $derived(isolation ? tracerLaCoupe(isolation) : []);
  const cles = $derived(isolation ? clesUtiles(isolation) : []);
  const titreDeLaCoupe = $derived(isolation ? coupeEnMots(isolation) : '');

  /**
   * Les phrases du rapport, paroi par paroi.
   *
   * Elles ne sont PAS réécrites ici : `zonesDe()` les produit déjà, et c'est la
   * même fonction qui alimente les autres écrans. Une paroi dont le rapport ne
   * dit rien y porte sa propre phrase — « Le rapport ne dit rien de l'isolation
   * de ce poste… » — et l'ordre de tri met devant ce qui appelle une action.
   */
  const paroisEnMots = $derived.by(() => {
    const iso = isolation;
    if (!iso) return [];
    return zonesDe(diagnostic)
      .filter((z) => (PAROIS as readonly string[]).includes(z.id))
      .map((z) => {
        const paroi = z.id as Paroi;
        return { paroi, nom: NOM_PAROI[paroi], dit: z.dit, etat: iso[paroi] };
      });
  });

  /* ── LES POSTES ─────────────────────────────────────────────────────────
     Triés par grandeur décroissante : c'est la seule mise en ordre qui aide,
     et elle ne modifie aucune valeur. La barre est proportionnelle au kWh
     imprimé, jamais à un pourcentage reconstitué — le rapport n'en donne
     aucun, sa page de déperditions est une image. */
  const postesTries = $derived([...postes].sort((a, b) => b.kwh - a.kwh));
  const posteMax = $derived(postesTries.reduce((n, p) => Math.max(n, p.kwh), 0));

  /** D'où vient un montant de travaux. Les mots de l'ordre de mission RECO. */
  const DIT_STATUT: Record<string, string> = {
    RAPPORT: 'indiqué dans le DPE',
    ESTIMATION: 'estimation citée par le rapport',
    'CALCUL VERRIERE': 'calcul Verrière',
    INCONNU: 'origine non déterminée'
  };

  const euros = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });

  /** Les packs de travaux, ou rien. Le `?.` ne survit pas au bloc `{#each}`. */
  const travaux = $derived(diagnostic.travaux ?? []);
</script>

{#snippet calque()}
  <!-- LE CALQUE. Rien n'est peint : chaque trait est un endroit où la lumière
       s'arrête. Le groupe reçoit `color` de la table ; on ne fixe donc jamais
       de `stroke` littéral, sous peine de casser la polarité en silence. -->
  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <!-- Le terrain. Il ne dit rien du rapport : il donne le sol au dessin. -->
    <path d={TERRAIN} stroke-width={TRAIT_STRUCTURE * 0.8} />

    {#each trace as t (t.paroi)}
      <!-- La structure existe toujours. Le rapport n'écrit jamais qu'un mur
           est absent : il écrit qu'il n'y relève pas d'isolation. -->
      <path d={t.structure} stroke-width={TRAIT_STRUCTURE} />
      {#if t.manteau}
        <path
          d={t.manteau}
          stroke-width={TRAIT_MANTEAU}
          stroke-linecap="butt"
          stroke-dasharray={t.raies ?? undefined}
        />
      {/if}
    {/each}
  </g>
{/snippet}

{#snippet cleDeLecture()}
  <p class="coupe__cle">
    Ici, la lumière, c’est la chaleur : ce qui l’arrête, c’est l’isolant.
  </p>
{/snippet}

<article
  class="ecran"
  class:ecran--grave={diagnostic.gravite === 'alerte'}
  style:--v-teinte={teinte}
  style:--v-nappe-alpha={(0.09 * etat.facteurLumiere).toFixed(3)}
  style:--v-source-x="{(50 + lumiere.azimut * 42).toFixed(1)}%"
  style:--v-source-y="{(6 + (1 - lumiere.inclinaison / 90) * 12).toFixed(1)}%"
  style:--v-duree="{etat.duree}ms"
  style:--v-classe={rangDeLaClasse >= 0 ? `var(--etq-${finale?.toLowerCase()})` : 'transparent'}
>
  <!-- ── 1 · L'ENTÊTE. L0/L4 · 390 × 84 ─────────────────────────────────── -->
  <header class="entete">
    <p class="entete__provenance">{provenance}</p>
    <h1 class="entete__titre">{diagnostic.titre}</h1>
    {#if diagnostic.date}
      <p class="entete__date">Établi le {diagnostic.date}</p>
    {/if}
  </header>

  <!-- ── 2 · LA LAME QUI S'OUVRE. L0 · 350 × 190 ────────────────────────── -->
  <section class="prisme">
    <ol class="reglette" role="list" aria-label="Échelle réglementaire du DPE, de A à G">
      {#each LETTRES as L (L)}
        <li
          class="lame"
          class:lame--sienne={L === finale}
          style:--lame="var(--etq-{L.toLowerCase()})"
          aria-current={L === finale ? 'true' : undefined}
        >
          {L}
        </li>
      {/each}
    </ol>

    <!-- L'évasement. Deux arêtes seulement : le haut reste ouvert, sinon la
         lame paraît refermée sur elle-même. Rien n'est rendu quand aucune
         classe n'a pu être retrouvée — un évasement vide serait une lame
         ouverte sur rien. -->
    {#if rangDeLaClasse >= 0}
      <svg class="ouverture" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
        <path d="M{bordGauche} 0 H{bordDroit} L100 12 H0 Z" class="ouverture__nappe" />
        <path
          d="M{bordGauche} 0 L0 12 M{bordDroit} 0 L100 12"
          class="ouverture__arete"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    {/if}

    <div class="bloc" class:bloc--sans={rangDeLaClasse < 0}>
      {#if finale}
        <p class="bloc__lettre" aria-label="Classe {finale}">{finale}</p>
        <dl class="bloc__valeurs">
          {#if energie}
            <div>
              <dt>Énergie</dt>
              <dd>
                {energie.valeur.toLocaleString('fr-FR')}<span class="bloc__unite"
                  >{energie.unite}</span
                >
                <span class="bloc__classe">classe {energie.lettre}</span>
              </dd>
            </div>
          {/if}
          {#if climat}
            <div>
              <dt>Climat</dt>
              <dd>
                {climat.valeur.toLocaleString('fr-FR')}<span class="bloc__unite">{climat.unite}</span
                >
                <span class="bloc__classe">classe {climat.lettre}</span>
              </dd>
            </div>
          {/if}
        </dl>
      {:else}
        <p class="bloc__sans">
          L’échelle est là ; la place de ce logement dessus n’a pas pu être établie à partir du
          texte du rapport. L’étiquette imprimée dans le PDF fait foi.
        </p>
      {/if}
    </div>
  </section>

  <!-- ── 3 · LE VERDICT. L1 ─────────────────────────────────────────────── -->
  <p class="verdict">{diagnostic.verdict}</p>

  <!-- ── 4 · LE COÛT. L1 ────────────────────────────────────────────────── -->
  {#if cout}
    <p class="cout">
      <span class="cout__libelle">{cout.libelle}</span>
      <span class="cout__valeur">{cout.valeur}</span>
      {#if cout.precision}<span class="cout__precision">{cout.precision}</span>{/if}
    </p>
  {/if}

  <!-- ── 5 · L'ANALOGIE. L3 ─────────────────────────────────────────────── -->
  {#if diagnostic.analogie}
    <p class="analogie">{diagnostic.analogie}</p>
  {/if}

  <!-- ── 6 · LA COUPE SUR LA TABLE LUMINEUSE. L2 · 350 × 259 ────────────── -->
  {#if isolation}
    <section class="coupe">
      <h2 class="titre2">L’enveloppe, telle que le rapport la décrit</h2>
      {#if parOu}
        <p class="coupe__resume">
          <strong>{parOu.libelle}</strong> : {parOu.valeur}{#if parOu.precision}<span
              class="coupe__precision"> — {parOu.precision}</span
            >{/if}
        </p>
      {/if}

      <TableLumineuse
        {calque}
        contenu={cleDeLecture}
        hauteur={HAUTEUR}
        titre={titreDeLaCoupe}
        gravite={diagnostic.gravite}
        heure={h}
      />

      <!-- ── 7 · LES QUATRE PAROIS, EN MOTS. L2/L4 ────────────────────── -->
      <!-- Le glyphe reprend EXACTEMENT la grammaire du dessin : trait fin
           toujours, manteau plein si le rapport relève une isolation, manteau
           en raies s'il n'en dit rien. Un lecteur qui a compris la coupe n'a
           rien de nouveau à apprendre ici. -->
      <ul class="parois">
        {#each paroisEnMots as z (z.paroi)}
          <li class="paroi">
            <svg class="paroi__glyphe" viewBox="0 0 32 16" aria-hidden="true">
              <path d="M2 12 H30" class="paroi__structure" />
              {#if z.etat !== 'nonIsole'}
                <path
                  d="M2 8 H30"
                  class="paroi__manteau"
                  stroke-dasharray={z.etat === 'inconnu' ? RAIES : undefined}
                />
              {/if}
            </svg>
            <p class="paroi__nom">{z.nom}</p>
            <p class="paroi__dit">{z.dit}</p>
          </li>
        {/each}
      </ul>

      {#if cles.length}
        <ul class="legende">
          {#each cles as c (c)}
            <li>{CLE[c]}</li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}

  <!-- ── 8 · OÙ PART L'ÉNERGIE. L2 ──────────────────────────────────────── -->
  {#if postesTries.length}
    <section class="postes">
      <h2 class="titre2">Où part l’énergie</h2>
      <ul>
        {#each postesTries as p (p.nom)}
          <li class="poste">
            <span class="poste__nom">{p.nom}</span>
            <span
              class="poste__barre"
              style:--part="{posteMax > 0 ? Math.round((p.kwh / posteMax) * 100) : 0}%"
              aria-hidden="true"
            ></span>
            <span class="poste__kwh">{p.kwh.toLocaleString('fr-FR')} kWh</span>
            {#if p.cout}<span class="poste__cout">{p.cout}</span>{/if}
          </li>
        {/each}
      </ul>
      <p class="note">
        Énergie primaire annuelle du logement entier, telle que le rapport la décompose poste par
        poste. Ce n’est pas un ratio au mètre carré, et les longueurs sont celles de ces chiffres —
        le rapport ne donne aucun pourcentage, sa page de déperditions est une image.
      </p>
    </section>
  {/if}

  <!-- ── 9 · LES TRAVAUX. L2/L4 ─────────────────────────────────────────── -->
  {#if travaux.length}
    <section class="travaux">
      <h2 class="titre2">Ce que le rapport recommande</h2>
      {#each travaux as pack (pack.rang)}
        <div class="pack">
          <h3 class="pack__titre">{pack.intitule}</h3>
          {#if pack.cout}
            <p class="pack__cout">
              {euros(pack.cout.de)} € à {euros(pack.cout.a)} €
              <span class="pack__statut">{DIT_STATUT[pack.cout.statut] ?? pack.cout.statut}</span>
            </p>
          {/if}
          <ul>
            {#each pack.recommandations as r, i (i)}
              <li class="reco">
                <span class="reco__lot">{r.lot}</span>
                <span class="reco__desc">{r.description}</span>
                {#if r.performance}<span class="reco__perf">{r.performance}</span>{/if}
              </li>
            {/each}
          </ul>
        </div>
      {/each}
      <p class="note">
        Aucun gain, aucune classe future et aucune addition ne sont calculés ici : ce sont les
        postes et les montants imprimés dans le rapport.
      </p>
    </section>
  {/if}

  <!-- ── 10 · CE QU'ON PEUT FAIRE. L2 ───────────────────────────────────── -->
  {#if diagnostic.aFaire.length}
    <section class="afaire">
      <h2 class="titre2">Ce que vous pouvez faire</h2>
      <ul>
        {#each diagnostic.aFaire as a, i (i)}<li>{a}</li>{/each}
      </ul>
    </section>
  {/if}

  <!-- ── 11 · LA DÉMARCHE. L1 · cible 48 px ─────────────────────────────── -->
  {#if diagnostic.demarche}
    <section class="demarche">
      <a class="demarche__bouton" href={diagnostic.demarche.url} rel="noreferrer noopener">
        {diagnostic.demarche.texte}
      </a>
      {#if diagnostic.demarche.quoiEmporter}
        <p class="demarche__quoi">{diagnostic.demarche.quoiEmporter}</p>
      {/if}
    </section>
  {/if}

  <!-- ── 12 · COMPRENDRE. L3 ────────────────────────────────────────────── -->
  {#if diagnostic.explication.length}
    <section class="comprendre">
      <h2 class="titre2">Comprendre</h2>
      {#each diagnostic.explication as p, i (i)}<p>{p}</p>{/each}
    </section>
  {/if}

  <!-- ── 13 · LA PREUVE. L4 ─────────────────────────────────────────────── -->
  <section class="preuve">
    <h2 class="titre2">Dans le rapport</h2>
    <dl class="preuve__faits">
      {#each preuves as f (f.libelle)}
        <div>
          <dt>{f.libelle}</dt>
          <dd>{f.valeur}{#if f.precision}<span>{f.precision}</span>{/if}</dd>
        </div>
      {/each}
      <div>
        <dt>Pages</dt>
        <dd>
          {diagnostic.pages[0] === diagnostic.pages[1]
            ? `page ${diagnostic.pages[0]}`
            : `pages ${diagnostic.pages[0]} à ${diagnostic.pages[1]}`}
        </dd>
      </div>
    </dl>
    <p class="preuve__origine">{provenance}.</p>
  </section>
</article>

<style>
  /*
   * ═════════════════════════════════════════════════════════════════════════
   * LES COULEURS, ET LEUR CONTRASTE MESURÉ
   * ═════════════════════════════════════════════════════════════════════════
   *
   * La page est IVOIRE, pas sombre. C'est ce que dit la mesure de la publicité
   * de marque : 53,6 % de l'image est un ivoire lumineux, 14,6 % le vert
   * profond. « Le territoire n'est pas sombre : il est lumineux, avec des
   * zones profondes. » La table lumineuse est LA zone profonde de cet écran —
   * une seule, ce qui lui donne toute sa force.
   *
   * ── Sur l'ivoire de la page (#f7f6f2) ────────────────────────────────────
   *
   *   encre        #0a2b23  →  14,04     titres, lettre de classe, chiffres
   *   encre douce  #4a5a55  →   6,73     phrases du rapport, précisions
   *   vert         #12463b  →   9,88     barres des postes (graphique ≥ 3)
   *   joint        #07231c  →  15,34     l'arête entre deux lames
   *   braise       #8f4526  →   6,37     la seule couleur chaude, à `alerte`
   *
   * ── Les sept lames de l'arrêté ───────────────────────────────────────────
   *
   * Une lame jaune sur de l'ivoire, c'est 1,01 de contraste : invisible. Ce
   * n'est pas la lame qui doit tenir, c'est son ARÊTE — et c'est exactement le
   * détail que le logo porte déjà (« le joint sombre entre les lames : sans
   * lui, c'est un dégradé, pas un prisme »). Mesuré, lame contre joint :
   *
   *   A 4,48 · B 7,76 · C 13,83 · D 15,23 · E 10,85 · F 7,70 · G 4,07
   *
   * Toutes au-dessus de 3:1. Et la lettre écrite dessus en `--encre-etiquette`
   * tient de 4,74 (G) à 17,74 (D) — la valeur est déjà mesurée dans `app.css`.
   *
   * ── La nappe sous la lettre : 18 %, et pas un point de plus ──────────────
   *
   * `color-mix(… 18 %, ivoire)` sur les sept classes, contre les trois encres :
   *
   *              encre      douce     braise
   *   A #d3e5d0  11,49       5,51      5,21
   *   D #f8f7c8  13,83       6,63      6,28
   *   G #f8cac7  10,32       4,94      4,68     ← le pire cas
   *
   * À 22 %, la braise tombe à 4,36 sur la classe G et casse. 18 % est donc la
   * borne, pas un réglage.
   *
   * ── Sur la table lumineuse, quand la lumière s'est retirée ───────────────
   *
   * Les valeurs viennent de `gravite.ts`, vérifiées sur les quatre moments du
   * jour. L'ivoire sur le plateau sous une bande de texte :
   *
   *   bon        13,47 (aube) … 9,95 (midi)      sol #0a2b23
   *   attention  14,78 … 11,79                   sol #08231c
   *   alerte     16,16 … 13,76                   sol #061b15
   *
   * Le retrait de lumière AMÉLIORE la lisibilité au lieu de la manger : c'est
   * le point de la borne B2. Le pire cas de tout l'écran est 9,95, à midi,
   * sur un dossier sans gravité — plus du double du seuil.
   */
  .ecran {
    /* Les jetons locaux. Ils ne sont pas posés dans `app.css` : cet écran est
       le seul à s'en servir, et le fichier global est partagé avec une autre
       session. Ils remonteront à la charte quand la direction sera arrêtée. */
    --v-page: #f7f6f2;
    --v-encre: #0a2b23;
    --v-douce: #4a5a55;
    --v-joint: #07231c;
    --v-braise: #8f4526;
    --v-nappe: color-mix(in srgb, var(--v-classe) 18%, var(--v-page));

    position: relative;
    max-width: 34rem;
    margin: 0 auto;
    padding: var(--e5) var(--e4) var(--e8);
    color: var(--v-encre);
    background: var(--v-page);
    font-family: var(--police);
    /*
     * LA LUMIÈRE DE L'HEURE, SUR LA PAGE ELLE-MÊME.
     *
     * Une nappe chaude, posée du côté d'où vient la lumière — à gauche le
     * matin, à droite le soir — et dont la hauteur suit l'inclinaison. Elle
     * plafonne à 9 % : au-delà, l'ivoire se met à jaunir et la page cesse
     * d'être une page. Multipliée par `facteurLumiere`, elle se retire de 40 %
     * quand le constat est lourd.
     *
     * AUCUNE TRANSITION : `--v-teinte` et `--v-nappe-alpha` sont des jetons qui
     * changent, et une propriété transitionnée qui lit un jeton se fige sur sa
     * valeur de premier rendu (règle démontrée dans `app.css`).
     */
    background-image:
      radial-gradient(
        120% 62% at var(--v-source-x) var(--v-source-y),
        color-mix(in srgb, var(--v-teinte) calc(var(--v-nappe-alpha) * 100%), transparent) 0%,
        transparent 68%
      ),
      /* La verrière, en trame. Élément secondaire de reconnaissance : on ne la
         lit pas, on la sent. 3,5 % — au-delà, c'est du papier millimétré. */
      repeating-linear-gradient(
        to right,
        rgb(10 43 35 / 3.5%) 0 1px,
        transparent 1px 44px
      ),
      repeating-linear-gradient(to bottom, rgb(10 43 35 / 3.5%) 0 1px, transparent 1px 44px);
  }

  /* ── 1 · L'ENTÊTE ─────────────────────────────────────────────────────── */

  .entete {
    margin-bottom: var(--e6);
  }

  /* La provenance AVANT le titre, et c'est délibéré : sur le DPE, la lettre
     est presque toujours retrouvée depuis les chiffres. Le lecteur doit savoir
     d'où elle sort avant de la lire, pas après. */
  .entete__provenance {
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    line-height: 1.45;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--v-douce);
  }

  .entete__titre {
    margin: 0;
    font-family: var(--police-titre);
    font-size: var(--t-titre);
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: var(--suivi-serre);
  }

  .entete__date {
    margin: var(--e2) 0 0;
    font-size: var(--t-petit);
    color: var(--v-douce);
  }

  /* ── 2 · LA LAME QUI S'OUVRE ──────────────────────────────────────────── */

  .prisme {
    margin-bottom: var(--e5);
  }

  /*
   * LA RÉGLETTE. Sept lames jointoyées.
   *
   * Le fond du conteneur EST le joint : les 2 px de `gap` laissent voir le
   * vert profond entre les lames, et la bordure ferme le tout. Une seule
   * couleur pour six arêtes et un cadre — c'est ce qui fait tenir sept
   * couleurs réglementaires sur de l'ivoire sans qu'aucune disparaisse.
   */
  .reglette {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    align-items: start;
    gap: 2px;
    margin: 0;
    padding: 2px;
    list-style: none;
    background: var(--v-joint);
    border-radius: var(--rayon-petit);
  }

  .lame {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    background: var(--lame);
    color: var(--encre-etiquette);
    font-size: var(--t-micro);
    font-weight: 600;
    letter-spacing: var(--suivi);
  }

  /*
   * LA LAME DE LA CLASSE DESCEND À TRAVERS LE RAIL.
   *
   * Elle est plus haute de 10 px que les six autres ; la grille prend la
   * hauteur de la plus grande, et le joint apparaît alors comme un rail sous
   * les six lames courtes. C'est de cette lame-là que part l'évasement, et le
   * repère ne tient à AUCUNE couleur — il tient à la géométrie. Il survit donc
   * au daltonisme, au noir et blanc, et à l'impression.
   *
   * Aucune des six autres n'est éteinte, décolorée ni retirée : l'échelle de
   * l'arrêté reste entière, dans l'ordre, dans ses couleurs.
   */
  .lame--sienne {
    height: 40px;
    font-size: var(--t-base);
    font-weight: 700;
  }

  .ouverture {
    display: block;
    width: 100%;
    height: 26px;
  }

  .ouverture__nappe {
    fill: var(--v-nappe);
  }

  .ouverture__arete {
    fill: none;
    stroke: var(--v-joint);
    stroke-width: 1;
  }

  .bloc {
    display: flex;
    align-items: center;
    gap: var(--e4);
    padding: var(--e4);
    background: var(--v-nappe);
    border: 1px solid var(--v-joint);
    border-top: 0;
    border-radius: 0 0 var(--rayon) var(--rayon);
  }

  /* Sans lettre, il n'y a pas de nappe : rien ne doit laisser croire qu'une
     classe a été retenue. Le trait reste, la couleur part. */
  .bloc--sans {
    background: transparent;
    border-top: 1px solid var(--v-joint);
    border-radius: var(--rayon);
  }

  .bloc__lettre {
    margin: 0;
    font-family: var(--police-titre);
    font-size: clamp(4.5rem, 25vw, 6.5rem);
    font-weight: 600;
    line-height: 0.82;
    letter-spacing: -0.03em;
    /* Une lettre optiquement calée sur la hauteur des chiffres à côté. */
    padding-top: 0.04em;
  }

  .bloc__valeurs {
    display: grid;
    gap: var(--e3);
    margin: 0;
    flex: 1;
    min-width: 0;
  }

  .bloc__valeurs dt {
    font-size: var(--t-micro);
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--v-douce);
  }

  .bloc__valeurs dd {
    margin: 2px 0 0;
    font-size: var(--t-lead);
    font-weight: 600;
    line-height: 1.15;
  }

  .bloc__unite {
    display: block;
    font-size: var(--t-micro);
    font-weight: 400;
    color: var(--v-douce);
  }

  .bloc__classe {
    display: block;
    margin-top: 2px;
    font-size: var(--t-micro);
    font-weight: 400;
    color: var(--v-douce);
  }

  .bloc__sans {
    margin: 0;
    font-size: var(--t-petit);
    line-height: 1.55;
    color: var(--v-douce);
  }

  /* ── 3 à 5 · LA PHRASE, LE COÛT, L'IMAGE ──────────────────────────────── */

  .verdict {
    margin: 0 0 var(--e5);
    font-size: var(--t-lead);
    line-height: 1.45;
  }

  .cout {
    display: grid;
    gap: 2px;
    margin: 0 0 var(--e5);
    padding-left: var(--e4);
    /* Un filet, pas une carte. La couleur du filet est la seule chose qui
       change quand le constat est lourd : le vert devient braise. */
    border-left: 2px solid var(--v-joint);
  }

  .cout__libelle {
    font-size: var(--t-micro);
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--v-douce);
  }

  .cout__valeur {
    font-size: var(--t-section);
    font-weight: 600;
    line-height: 1.1;
  }

  .cout__precision {
    font-size: var(--t-petit);
    color: var(--v-douce);
  }

  .analogie {
    margin: 0 0 var(--e6);
    font-size: var(--t-base);
    line-height: 1.6;
    color: var(--v-douce);
  }

  /* ── 6 · LA COUPE ─────────────────────────────────────────────────────── */

  .titre2 {
    margin: 0 0 var(--e3);
    font-family: var(--police-titre);
    font-size: var(--t-base);
    font-weight: 600;
    letter-spacing: var(--suivi-serre);
  }

  .coupe {
    margin-bottom: var(--e6);
  }

  .coupe__resume {
    margin: 0 0 var(--e4);
    font-size: var(--t-petit);
    line-height: 1.55;
    color: var(--v-douce);
  }

  .coupe__resume strong {
    color: var(--v-encre);
  }

  .coupe__precision {
    color: var(--v-douce);
  }

  /* La clé, POSÉE SUR LA TABLE, avant qu'on lise le dessin. Sans elle, un
     lecteur qui vient de l'écran des anomalies comprend l'inverse. */
  .coupe__cle {
    margin: 0;
    font-size: var(--t-petit);
    line-height: 1.5;
    font-weight: 600;
    color: var(--verriere-ivoire);
  }

  .parois {
    display: grid;
    gap: 0;
    margin: var(--e4) 0 0;
    padding: 0;
    list-style: none;
  }

  .paroi {
    display: grid;
    grid-template-columns: 34px 1fr;
    grid-template-areas:
      'glyphe nom'
      '.      dit';
    gap: 2px var(--e3);
    padding: var(--e3) 0;
    border-top: 1px solid rgb(10 43 35 / 12%);
  }

  .paroi__glyphe {
    grid-area: glyphe;
    width: 32px;
    height: 16px;
    align-self: center;
  }

  .paroi__structure {
    fill: none;
    stroke: var(--v-encre);
    stroke-width: 1;
  }

  .paroi__manteau {
    fill: none;
    stroke: var(--v-encre);
    stroke-width: 5;
    stroke-linecap: butt;
  }

  .paroi__nom {
    grid-area: nom;
    margin: 0;
    font-weight: 600;
    font-size: var(--t-petit);
  }

  .paroi__dit {
    grid-area: dit;
    margin: 0;
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--v-douce);
  }

  .legende {
    margin: var(--e3) 0 0;
    padding-left: var(--e4);
    font-size: var(--t-micro);
    line-height: 1.55;
    color: var(--v-douce);
  }

  /* ── 8 · LES POSTES ───────────────────────────────────────────────────── */

  .postes {
    margin-bottom: var(--e6);
  }

  .postes ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .poste {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'nom kwh'
      'barre barre'
      'cout cout';
    gap: 2px var(--e3);
    padding: var(--e3) 0;
    border-top: 1px solid rgb(10 43 35 / 12%);
  }

  .poste__nom {
    grid-area: nom;
    font-size: var(--t-petit);
    font-weight: 600;
    text-transform: capitalize;
  }

  .poste__kwh {
    grid-area: kwh;
    font-size: var(--t-petit);
    font-variant-numeric: tabular-nums;
  }

  /* La longueur EST le chiffre imprimé. Elle ne part jamais de zéro pour y
     revenir : un fait ne s'anime pas. */
  .poste__barre {
    grid-area: barre;
    display: block;
    height: 3px;
    width: var(--part);
    background: var(--verriere-vert);
    border-radius: 2px;
  }

  .poste__cout {
    grid-area: cout;
    font-size: var(--t-micro);
    color: var(--v-douce);
  }

  .note {
    margin: var(--e3) 0 0;
    font-size: var(--t-micro);
    line-height: 1.55;
    color: var(--v-douce);
  }

  /* ── 9 · LES TRAVAUX ──────────────────────────────────────────────────── */

  .travaux {
    margin-bottom: var(--e6);
  }

  .pack {
    padding: var(--e3) 0;
    border-top: 1px solid rgb(10 43 35 / 12%);
  }

  .pack__titre {
    margin: 0;
    font-size: var(--t-petit);
    font-weight: 600;
  }

  .pack__cout {
    margin: var(--e1) 0 var(--e2);
    font-size: var(--t-lead);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .pack__statut {
    display: block;
    font-size: var(--t-micro);
    font-weight: 400;
    color: var(--v-douce);
  }

  .pack ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .reco {
    display: grid;
    gap: 1px;
    padding: var(--e2) 0;
  }

  .reco__lot {
    font-size: var(--t-micro);
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--v-douce);
  }

  .reco__desc {
    font-size: var(--t-petit);
    line-height: 1.5;
  }

  .reco__perf {
    font-size: var(--t-micro);
    color: var(--v-douce);
    font-variant-numeric: tabular-nums;
  }

  /* ── 10 à 13 · L'ACTION, L'EXPLICATION, LA PREUVE ─────────────────────── */

  .afaire,
  .comprendre,
  .preuve {
    margin-bottom: var(--e6);
  }

  .afaire ul {
    margin: 0;
    padding-left: var(--e4);
    font-size: var(--t-petit);
    line-height: 1.6;
  }

  .afaire li + li {
    margin-top: var(--e2);
  }

  .demarche {
    margin-bottom: var(--e6);
  }

  /*
   * LE SEUL ÉLÉMENT DE CET ÉCRAN QUI S'ANIME.
   *
   * Ses trois propriétés transitionnées ne lisent aucun jeton mouvant :
   * `--action` et `--sur-action` sont fixes. La cible fait 48 px de haut,
   * au-dessus du plancher de 44.
   */
  .demarche__bouton {
    display: inline-flex;
    align-items: center;
    min-height: 48px;
    padding: 0 var(--e5);
    border-radius: var(--rayon);
    background: var(--action);
    color: var(--sur-action);
    font-size: var(--t-base);
    font-weight: 600;
    text-decoration: none;
    transition:
      background-color var(--t-court) var(--sortie),
      transform var(--t-instant) var(--sortie);
  }

  .demarche__bouton:hover,
  .demarche__bouton:focus-visible {
    background: var(--action-forte);
  }

  .demarche__bouton:active {
    transform: translateY(1px);
  }

  .demarche__bouton:focus-visible {
    outline: 2px solid var(--v-encre);
    outline-offset: 3px;
  }

  .demarche__quoi {
    margin: var(--e3) 0 0;
    font-size: var(--t-petit);
    line-height: 1.55;
    color: var(--v-douce);
  }

  .comprendre p {
    margin: 0 0 var(--e3);
    font-size: var(--t-petit);
    line-height: 1.65;
  }

  .preuve__faits {
    display: grid;
    gap: 0;
    margin: 0;
  }

  .preuve__faits > div {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--e3);
    padding: var(--e2) 0;
    border-top: 1px solid rgb(10 43 35 / 12%);
  }

  .preuve__faits dt {
    font-size: var(--t-petit);
    color: var(--v-douce);
  }

  .preuve__faits dd {
    margin: 0;
    font-size: var(--t-petit);
    font-weight: 600;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .preuve__faits dd span {
    display: block;
    font-weight: 400;
    color: var(--v-douce);
  }

  .preuve__origine {
    margin: var(--e3) 0 0;
    font-size: var(--t-micro);
    line-height: 1.55;
    color: var(--v-douce);
  }

  /*
   * ═════════════════════════════════════════════════════════════════════════
   * LE SILENCE SUR CE QUI EST GRAVE
   * ═════════════════════════════════════════════════════════════════════════
   *
   * Trois choses changent, et pas une de plus. Aucune n'est un cri.
   *
   * 1. LA TABLE S'ENFONCE. C'est `retraitDe()` qui le fait, dans le composant :
   *    le plateau passe de #0a2b23 à #061b15, et l'ivoire y gagne en contraste
   *    — 14,44 → 16,99. Le calme AMÉLIORE la lisibilité.
   * 2. LA NAPPE CHAUDE DE LA PAGE SE RETIRE de 40 % (`facteurLumiere`).
   * 3. LE FILET DU COÛT DEVIENT UNE BRAISE. Une seule couleur chaude, sur
   *    2 px, une seule fois dans la page. #8f4526 est à 17,7° de teinte — le
   *    terracotta demandé — et tient 6,37 sur l'ivoire.
   *
   * Ce qu'on ne fait pas : pas de rouge, pas de fond alarmé, pas de
   * pictogramme d'avertissement, pas de majuscules. On baisse la voix.
   */
  .ecran--grave {
    --v-nappe: color-mix(in srgb, var(--v-classe) 12%, var(--v-page));
  }

  .ecran--grave .cout {
    border-left-color: var(--v-braise);
  }

  /* ── LE MOUVEMENT RÉDUIT ──────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    .demarche__bouton {
      transition: none;
    }
  }

  /* ── LE PAPIER ────────────────────────────────────────────────────────── */

  @media print {
    .ecran {
      background: #fff;
      background-image: none;
      padding: 0;
    }

    .coupe__cle {
      color: var(--v-encre);
    }
  }

  /* ── AU-DELÀ DU TÉLÉPHONE ─────────────────────────────────────────────── */

  @media (min-width: 33rem) {
    .paroi {
      grid-template-columns: 34px 8.5rem 1fr;
      grid-template-areas: 'glyphe nom dit';
      align-items: baseline;
    }

    .poste {
      grid-template-columns: 8rem 1fr auto;
      grid-template-areas: 'nom barre kwh' '. cout cout';
      align-items: center;
    }

    .poste__barre {
      width: var(--part);
    }
  }
</style>
