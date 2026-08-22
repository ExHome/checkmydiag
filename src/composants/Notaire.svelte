<script lang="ts">
  /**
   * Le retour au client, comme on le ferait à l'étude avant de signer.
   *
   * Trois temps, toujours les mêmes : ce que le dossier établit, où se situe le
   * bien, et ce qu'il faut faire. Rien n'est inventé — chaque phrase découle
   * d'une donnée lue dans le rapport, et ce que le rapport ne dit pas est
   * signalé comme tel.
   *
   * Le devoir de conseil est ici une contrainte d'écriture : on ne se contente
   * pas de rapporter, on dit ce qui engage, ce qui coûte et ce qui se négocie.
   */
  import type { Analyse } from '../lib/modele';
  import Positionnement from './Positionnement.svelte';
  import Deperditions from './schemas/Deperditions.svelte';
  import MotsExpliques from './MotsExpliques.svelte';
  import RubanDpe from './RubanDpe.svelte';
  import DoubleSeuil from './schemas/DoubleSeuil.svelte';
  import { motsEmployes } from '../lib/lexique';
  import { libelleCourt } from '../lib/libelle';
  import { conseil, tousLesPoints } from '../lib/conseil';
  import { APPS } from '../lib/apps';

  const { analyse }: { analyse: Analyse } = $props();

  const dpe = $derived(analyse.diagnostics.find((d) => d.type === 'dpe') ?? null);
  const lettre = $derived(dpe?.schema?.genre === 'dpe' ? dpe.schema.finale : null);
  /*
   * « Maison ou appartement » ne se lit plus ici. Cette vue s'en servait pour
   * décider si l'audit énergétique devait être annoncé ; c'est le DPE qui le
   * dit désormais, dans ses propres gestes, avec la condition écrite dans la
   * phrase — « si c'est une maison ». La donnée appartient au diagnostic.
   */

  /**
   * Le descriptif : de quel bien on parle, en une phrase.
   *
   * Adresse, nature, année, surface — les quatre choses qu'on annonce à voix
   * haute en ouvrant un dossier. Tout vient du rapport ; ce qui manque est
   * simplement omis.
   */
  const descriptif = $derived.by(() => {
    const faits = analyse.diagnostics.flatMap((d) => d.faits);
    const cherche = (motif: RegExp): string | undefined =>
      faits.find((f) => motif.test(f.libelle))?.valeur;

    const nature = cherche(/type de bien/i) ?? 'Logement';
    const annee = cherche(/ann[ée]e de construction/i);
    const surface = cherche(/superficie privative|surface de r[ée]f[ée]rence|surface habitable/i);

    const bouts = [nature];
    if (surface) bouts.push(`de ${surface}`);
    // L'adresse n'entre plus dans la phrase : elle ouvre la page dans le
    // bandeau du bien, et l'en-tête d'impression la porte de son côté. La
    // redire ici la donnait une troisième fois.
    // Les rapports écrivent tantôt « 1974 », tantôt « Avant 1948 » : la
    // préposition ne se colle donc pas les yeux fermés.
    if (annee) bouts.push(/^\s*(avant|après)/i.test(annee) ? `construit ${annee.toLowerCase()}` : `construit en ${annee}`);
    return `${bouts.join(' ')}.`;
  });

  /**
   * L'état descriptif : les caractéristiques du bien, relevées une à une.
   *
   * On ne garde que ce qui décrit le logement — sa nature, son âge, ses
   * surfaces, son enveloppe. Les compteurs de contrôle et les références de
   * dossier n'ont rien à faire ici : ils décrivent la mission, pas le bien.
   */
  const DECRIT = /type de bien|ann[ée]e de construction|surface|superficie|[ée]tage|niveau/i;
  const ECARTE = /contr[ôo]l|mesur|zones|unit[ée]s|risques concernant/i;

  const caracteristiques = $derived.by<{ libelle: string; valeur: string }[]>(() => {
    const liste: { libelle: string; valeur: string }[] = [];
    const vus = new Set<string>();

    for (const fait of analyse.diagnostics.flatMap((d) => d.faits)) {
      if (!DECRIT.test(fait.libelle) || ECARTE.test(fait.libelle)) continue;
      const cle = fait.libelle.toLowerCase();
      if (vus.has(cle)) continue;
      vus.add(cle);
      liste.push({ libelle: fait.libelle, valeur: fait.valeur });
    }

    // L'enveloppe fait partie du descriptif : c'est elle qu'on décrit quand on
    // parle de « matériaux » dans un état des lieux.
    if (dpe?.schema?.genre === 'dpe') {
      for (const [paroi, etat] of Object.entries(dpe.schema.isolation)) {
        if (etat === 'inconnu') continue;
        // « avec » et « sans » ne s'accordent pas : « menuiseries isolé »
        // sautait aux yeux, et l'accord dépendait du genre de chaque paroi.
        liste.push({
          libelle: NOM_PAROI[paroi] ?? paroi,
          valeur: etat === 'isole' ? 'avec isolant' : 'sans isolant'
        });
      }
    }

    return liste;
  });

  const NOM_PAROI: Record<string, string> = {
    murs: 'Murs',
    toit: 'Toiture',
    plancher: 'Plancher bas',
    fenetres: 'Menuiseries'
  };

  /** Les références du dossier, pour la ligne sous le trait de la page de garde. */
  const reference = $derived(
    analyse.diagnostics
      .flatMap((d) => d.faits)
      .find((f) => /num[ée]ro de dossier|dossier n/i.test(f.libelle))?.valeur ?? null
  );

  const visite = $derived(
    analyse.diagnostics.find((d) => d.date)?.date ??
      analyse.diagnostics
        .flatMap((d) => d.faits)
        .find((f) => /date de la visite|date du rep[ée]rage/i.test(f.libelle))?.valeur ??
      null
  );

  /**
   * Pourquoi ce logement-là perd sa chaleur.
   *
   * On nomme les parois que le rapport donne sans isolant, on rappelle l'ordre
   * de grandeur de chacune, et on dit par quoi commencer. Une paroi que le
   * rapport ne renseigne pas est annoncée comme non renseignée : c'est une
   * information, pas un trou.
   */
  const PART: Record<string, string> = {
    toit: 'le toit, premier poste de perte dans une maison',
    murs: 'les murs, deuxième poste et le plus coûteux à traiter',
    plancher: 'le plancher bas, surtout au-dessus d’une cave ou d’un vide sanitaire',
    fenetres: 'les fenêtres, qui pèsent moins qu’on ne le croit'
  };

  const pourquoi = $derived.by(() => {
    if (dpe?.schema?.genre !== 'dpe') return '';
    const iso = dpe.schema.isolation;

    const nues = Object.entries(iso).filter(([, e]) => e === 'nonIsole').map(([p]) => PART[p] ?? p);
    const inconnues = Object.entries(iso).filter(([, e]) => e === 'inconnu').length;

    const bouts: string[] = [];
    if (nues.length) {
      bouts.push(
        `Le rapport relève sans isolant : ${nues.join(' ; ')}. C’est de là que vient l’essentiel de la consommation calculée.`
      );
      if (nues.some((n) => n.startsWith('le toit'))) {
        bouts.push('Commencez par les combles : c’est le poste le moins cher et le plus rentable.');
      }
    } else {
      bouts.push('Le rapport ne relève aucune paroi sans isolant.');
    }
    if (inconnues) {
      bouts.push(
        inconnues > 1
          ? `${inconnues} parois ne sont pas renseignées dans le rapport : le diagnostiqueur n’a pas pu les observer.`
          : 'Une paroi n’est pas renseignée dans le rapport : le diagnostiqueur n’a pas pu l’observer.'
      );
    }
    return bouts.join(' ');
  });

  /**
   * D'où sort la lettre du DPE, et les chiffres qui décrivent le logement.
   *
   * C'est la question que tout le monde pose et à laquelle le rapport ne répond
   * jamais : on divise une consommation par une surface, on regarde la tranche.
   * Le reste — les parois nues, les postes — explique pourquoi la consommation
   * est là où elle est.
   */
  /**
   * Les tranches de l'étiquette énergie — pour les logements de plus de 40 m².
   *
   * Elles ne valent pas partout. L'arrêté du 25 mars 2024, en vigueur depuis le
   * 1er juillet 2024, donne aux logements dont la surface de référence est
   * inférieure ou égale à 40 m² des seuils qui leur sont propres, établis
   * surface par surface entre 8 et 40 m² et interpolés entre deux valeurs. Un
   * studio de vingt-cinq mètres carrés ne se lit donc pas sur cette échelle-ci.
   *
   * On ne recopie pas ce tableau-là : il fait trente-trois lignes et deux
   * colonnes, et une valeur mal relevée vaudrait moins que rien. Sous 40 m², on
   * dit donc la lettre et la consommation — que le rapport donne — sans
   * prétendre situer le logement dans une tranche qu'on n'affichera pas.
   */
  const TRANCHE: Record<string, string> = {
    A: 'moins de 70',
    B: 'de 70 à 110',
    C: 'de 110 à 180',
    D: 'de 180 à 250',
    E: 'de 250 à 330',
    F: 'de 330 à 420',
    G: 'plus de 420'
  };

  /** La surface de référence, quand le rapport la donne — en m². */
  const surfaceReference = $derived.by<number | null>(() => {
    const brut = analyse.diagnostics
      .flatMap((d) => d.faits)
      .find((f) => /surface de r[ée]f[ée]rence|surface habitable/i.test(f.libelle))?.valeur;
    const n = Number.parseFloat((brut ?? '').replace(',', '.').replace(/[^\d.]/g, ''));
    return Number.isFinite(n) && n > 0 ? n : null;
  });

  /** Sous 40 m², les seuils de l'échelle ne sont plus ceux-là. */
  const petiteSurface = $derived(surfaceReference !== null && surfaceReference <= 40);

  const chiffres = $derived.by<{ quoi: string; donc: string[] }[]>(() => {
    if (dpe?.schema?.genre !== 'dpe' || !lettre) return [];

    const donc: string[] = [];
    const surface = dpe.faits.find((f) => /surface/i.test(f.libelle))?.valeur;
    const conso = dpe.schema.energie;
    const climat = dpe.schema.climat;

    if (conso) {
      // La tranche n'est citée que là où elle s'applique : au-dessus de 40 m².
      const t = petiteSurface ? undefined : TRANCHE[conso.lettre];
      donc.push(
        `${conso.valeur} ${conso.unite}${surface ? ` — la consommation calculée divisée par ${surface}` : ''}. Ça tombe dans la tranche ${conso.lettre}${t ? ` (${t})` : ''}.`
      );
      if (petiteSurface) {
        donc.push(
          'Ce logement fait 40 m² ou moins : depuis le 1ᵉʳ juillet 2024, les seuils des étiquettes sont adaptés à sa surface, et ne sont pas ceux des logements plus grands.'
        );
      }
    }
    if (climat && conso && climat.lettre > conso.lettre) {
      donc.push(`Le CO₂ note ${climat.lettre} : c’est lui qui tire la lettre vers le bas.`);
    }
    for (const poste of dpe.schema.postes.slice(0, 5)) {
      donc.push(`${poste.nom} : ${Math.round(poste.kwh)} kWh${poste.cout ? ` — ${poste.cout}` : ''}.`);
    }

    return [{ quoi: `Classe ${lettre}`, donc }];
  });

  /**
   * La synthèse diagnostic par diagnostic vivait ici, en huit encarts
   * dépliables — et une seconde fois dans la vue « Les diagnostics », avec le
   * dessin en plus. Le lecteur lisait donc deux fois les mêmes huit verdicts,
   * dans deux vues qui prétendaient dire autre chose. Elle est partie là-bas,
   * en sommaire ancré : c'est sa place, puisque c'est là que se trouve le
   * détail qu'elle annonce. Cette vue-ci parle du bien et du conseil.
   */

  /** Ce que le dossier établit, diagnostic par diagnostic, sans commentaire. */
  const etat = $derived.by<string[]>(() => {
    const lignes: string[] = [];
    for (const d of analyse.diagnostics) {
      // Le verdict garde sa casse : « Classe C » ne devient pas « classe c ».
      const dit = libelleCourt(d);
      lignes.push(`${d.titre} : ${dit.charAt(0).toLowerCase() + dit.slice(1)}.`);
    }
    return lignes;
  });

  /**
   * Le conseil, dans l'ordre où il faut s'en occuper.
   *
   * Il était écrit ici, à la main, et il ne connaissait que trois choses : les
   * contrôles du dossier, les anomalies d'électricité et de gaz, et la lettre
   * du DPE. Six des neuf diagnostics n'y arrivaient donc jamais — amiante,
   * plomb, termites, état des risques, Carrez, assainissement —, alors que
   * chacun calcule ses gestes, phrase par phrase et sourcés au texte. Un
   * logement avec du plomb en classe 3, donc des travaux imposés par le code de
   * la santé publique, n'en disait pas un mot au lecteur qui venait ici
   * chercher ce qu'il fallait faire.
   *
   * Le rangement vit désormais dans `lib/conseil.ts`, où il se teste : la vue
   * ne décide plus de ce qui mérite d'être dit.
   */
  const leConseil = $derived(conseil(analyse));
  /** Les termes employés dans ce document-ci, pour l'annexe. */
  const lexique = $derived(motsEmployes([pourquoi, ...tousLesPoints(leConseil), ...etat]));

  /**
   * LE BANDEAU DES DIAGNOSTICS — la carte du dossier.
   *
   * Un onglet par rapport, avec son verdict en trois mots et sa pastille de
   * gravité. Le nom court et le verdict viennent des mêmes sources que la
   * grille d'accueil et le voyant (`apps.ts`, `libelle.ts`) : le lecteur
   * retrouve le même mot d'un écran à l'autre, sinon il croit lire deux
   * choses.
   *
   * `cible` est l'ancre du premier groupe de conseil où ce diagnostic parle.
   * Elle vaut `null` quand le dossier ne dit rien de lui — l'onglet reste alors
   * affiché, mais éteint : un diagnostic présent doit se voir même quand il n'y
   * a rien à en faire.
   */
  const bandeau = $derived.by(() =>
    analyse.diagnostics.map((d) => ({
      type: d.type,
      nom: APPS[d.type]?.nom ?? d.titre,
      dit: libelleCourt(d),
      gravite: d.gravite,
      cible: leConseil.diagnostics.some((c) => c.origine === d.type) ? ancre(d.type) : null
    }))
  );

  /** L'identifiant du bloc d'un diagnostic : une seule règle, aux deux bouts. */
  function ancre(origine: string): string {
    return `conseil-${origine}`;
  }

  /**
   * Amener l'œil sur le groupe demandé.
   *
   * `block: 'center'` plutôt que `'start'` : la barre du site est fixe, et une
   * cible posée en haut passerait dessous. Centrer évite d'avoir à connaître sa
   * hauteur.
   *
   * ⚠️ PAS DE `behavior: 'smooth'` ICI, et ce n'est pas un oubli. Mesuré le
   * 21/08/2026 dans cette vue : le défilement doux est un NO-OP dans le
   * conteneur `.dedans-vue` — `scrollTop` ne bouge pas d'un pixel, quand le
   * même appel en `'auto'` amène la cible au centre. Le bouton semblait donc
   * mort alors que son gestionnaire s'exécutait. `Dicodiag.svelte` fait déjà
   * sans, et son sommaire fonctionne.
   */
  function allerAu(id: string | null): void {
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: 'center' });
  }

  /**
   * La numérotation des sections, calculée et non écrite à la main.
   *
   * Les chiffres romains étaient posés en dur de I à VII. Comme quatre sections
   * sur sept sont conditionnelles, un dossier sans DPE affichait I, II, puis V :
   * un document dont les articles sautent se lit comme un document amputé.
   */
  const ROMAINS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

  const numeros = $derived.by<Record<string, string>>(() => {
    const presentes = [
      caracteristiques.length ? 'descriptif' : null,
      dpe?.schema?.genre === 'dpe' ? 'chaleur' : null,
      lettre ? 'echelle' : null,
      chiffres.length ? 'classe' : null,
      'conseil',
      lexique.length ? 'mots' : null
    ].filter((c): c is string => c !== null);

    return Object.fromEntries(presentes.map((cle, i) => [cle, ROMAINS[i] ?? String(i + 1)]));
  });
</script>

<section class="notaire">
  <!-- La page de garde. Un document qu'une agence pose sur une table se
       reconnaît à son en-tête : le filet, l'objet, l'adresse en grand, et la
       ligne de références sous le trait. -->
  <header class="garde">
    <div class="ligne-haute">
      <p class="objet">Dossier de diagnostic technique</p>
      <!-- Le document s'emporte : chez le notaire, face au vendeur, à la banque. -->
      <button type="button" class="editer" onclick={() => window.print()}>
        Éditer le document
      </button>
    </div>

    <!--
      L'adresse en grand a quitté l'écran : elle ouvre désormais la page, dans
      le bandeau du bien, au-dessus du verdict. La répéter ici la donnait deux
      fois à quelques centimètres d'écart.

      À l'impression, en revanche, cette page redevient la première feuille
      d'un document qu'on pose sur une table : elle doit porter son adresse.
      D'où ce titre, réservé au papier.
    -->
    <h1 class="adresse au-papier">{analyse.bien.adresse || 'Le bien'}</h1>
    {#if analyse.bien.commune}
      <p class="commune au-papier">{analyse.bien.commune}</p>
    {/if}

    <p class="sous-titre">{descriptif}</p>

    <dl class="references">
      {#if reference}
        <div><dt>Référence</dt><dd>{reference}</dd></div>
      {/if}
      {#if visite}
        <div><dt>Visite</dt><dd>{visite}</dd></div>
      {/if}
      <div><dt>Diagnostics</dt><dd>{analyse.diagnostics.length}</dd></div>
      <div><dt>Pages du rapport</dt><dd>{analyse.nbPages}</dd></div>
    </dl>

    <RubanDpe epaisseur={5} />
  </header>

  <!--
    LE BANDEAU DES DIAGNOSTICS — la carte du dossier, en tête du conseil.

    Le conseil s'ouvrait sur la description du bien, puis enchaînait les
    sections : on lisait « à régulariser », « à négocier », sans jamais voir
    combien de rapports composent le dossier ni ce que chacun dit. La réponse
    existait pourtant — elle était calculée pour l'annexe des mots employés, et
    affichée nulle part.

    Un onglet par rapport, sa pastille de gravité, son verdict en trois mots.
    Et il conduit : cliquer amène aux gestes de ce diagnostic-là, plus bas.
    C'est la même forme que le bandeau de la vue « Les diagnostics » — deux
    dessins différents pour la même chose feraient croire à deux choses.
  -->
  {#if bandeau.length}
    <nav class="bandeau-diags" aria-label="Les diagnostics du dossier">
      {#each bandeau as d (d.type)}
        <button
          type="button"
          class="onglet-diag {d.gravite}"
          disabled={!d.cible}
          onclick={() => allerAu(d.cible)}
        >
          <span class="pastille" aria-hidden="true"></span>
          <span class="nom-onglet">{d.nom}</span>
          <span class="dit-onglet">{d.dit}</span>
        </button>
      {/each}
    </nav>
  {/if}

  <div class="feuille">
    {#if caracteristiques.length}
      <!--
        L'état descriptif a quitté cet endroit : il ouvre désormais la page,
        au-dessus du verdict. C'est l'ordre d'un dossier — on présente le bien,
        on le décrit, puis on l'analyse. Le garder ici le donnait deux fois.

        Le papier, lui, n'a pas ce bandeau : l'annexe y reste.
      -->
      <div class="au-papier">
        <!-- « Les caractéristiques du bien », et non plus « l'état
             descriptif » : ce nom désigne désormais, en tête de page, ce que
             chaque diagnostic conclut. Deux sections du même document ne
             peuvent pas porter le même titre en disant deux choses. -->
        <h2><span class="num">{numeros.descriptif}</span>Les caractéristiques du bien</h2>
        <dl class="caracteristiques">
          {#each caracteristiques as c (c.libelle)}
            <div>
              <dt>{c.libelle}</dt>
              <dd>{c.valeur}</dd>
            </div>
          {/each}
        </dl>
      </div>
    {/if}

    <!-- Les deux planches côte à côte : la maison et l'échelle se répondent,
         et l'écran large cesse d'être une longue colonne étroite. -->
    <div class="planches">
      {#if dpe?.schema?.genre === 'dpe'}
        <div class="planche">
          <h2 class="apres"><span class="num">{numeros.chaleur}</span>Par où la chaleur s’en va</h2>
          <Deperditions isolation={dpe.schema.isolation} {lettre} papier />
          <p class="pourquoi"><MotsExpliques texte={pourquoi} /></p>
        </div>
      {/if}

      {#if lettre}
        <div class="planche">
          <h2 class="apres"><span class="num">{numeros.echelle}</span>Où se situe ce logement</h2>
          <Positionnement {lettre} />
        </div>
      {/if}
    </div>

    {#if chiffres.length}
      <!-- Les chiffres du logement, à leur place : juste après ce qui les
           produit. Ils étaient plus bas dans un relevé séparé, qui répétait
           déjà la moitié du conseil. -->
      <h2 class="apres"><span class="num">{numeros.classe}</span>D’où sort cette classe</h2>

      <!-- Les deux étiquettes avant les chiffres : c'est le mécanisme qui
           explique la lettre, et il se voit mieux qu'il ne se raconte. « Je
           consomme peu et je suis F » n'a de réponse qu'ici. -->
      {#if dpe?.schema?.genre === 'dpe'}
        <div class="planche-seuil">
          <DoubleSeuil
            energie={dpe.schema.energie}
            climat={dpe.schema.climat}
            finale={dpe.schema.finale}
          />
        </div>
      {/if}

      <ul class="chiffres">
        {#each chiffres as c (c.quoi)}
          <li>
            <p class="valeur">{c.quoi}</p>
            <ul class="detail">
              {#each c.donc as ligne}
                <li><MotsExpliques texte={ligne} /></li>
              {/each}
            </ul>
          </li>
        {/each}
      </ul>
    {/if}

    <h2 class="apres"><span class="num">{numeros.conseil}</span>Ce que je vous conseille</h2>

    {#if leConseil.aRegler.length}
      <!--
        CE QUI BLOQUE LE RENDEZ-VOUS, RÉUNI.

        Ranger le conseil par diagnostic a coûté la lecture transversale : « à
        régulariser avant la signature » réunissait tout ce qui fait repousser
        un rendez-vous, et c'est la question du notaire — elle ne se pose pas
        rapport par rapport. Il fallait désormais parcourir huit blocs pour la
        reconstituer.

        Ce rappel la rend, et rien de plus : les lignes qui bloquent, chacune
        avec son diagnostic, et un clic pour y aller. Un rappel qui grossit
        redevient une section.
      -->
      <aside class="a-regler" aria-label="Ce qui bloque la signature">
        <p class="titre-regler">
          À régulariser avant la signature
          <span class="combien">{leConseil.aRegler.length}</span>
        </p>
        <ul>
          {#each leConseil.aRegler as ligne, i (i)}
            <li>
              <button type="button" onclick={() => allerAu(ancre(ligne.origine))}>
                <span class="ou">{ligne.provenance}</span>
                <span class="quoi-regler">{ligne.texte}</span>
              </button>
            </li>
          {/each}
        </ul>
      </aside>
    {/if}

    <!--
      LE CONSEIL, DIAGNOSTIC PAR DIAGNOSTIC.

      Il était rangé par temps — ce qui se règle avant, ce qui se négocie, ce
      qu'on ne garantit pas —, et un même rapport parlait donc dans trois blocs
      éloignés : pour savoir ce qu'implique le plomb, il fallait le chercher
      trois fois. Un bloc par rapport, et les temps deviennent ses intertitres.
    -->
    <div class="conseils">
      {#each leConseil.diagnostics as diag (diag.origine)}
        <div class="conseil" id={ancre(diag.origine)}>
          <div class="tete-conseil">
            <p class="titre-conseil">{diag.titre}</p>
            {#if diag.echeance}
              <!-- La date vit avec son rapport, et non dans un tableau à part :
                   « valable jusqu'au » est une propriété du diagnostic. -->
              <span class="echeance" class:perime={diag.echeance.perimee}>
                {diag.echeance.texte}
              </span>
            {/if}
          </div>

          {#each diag.blocs as bloc (bloc.rang)}
            <p class="temps {bloc.rang}">{bloc.titre}</p>
            <ul>
              {#each bloc.points as point, i (i)}
                <li><MotsExpliques texte={point} /></li>
              {/each}
            </ul>
          {/each}

          {#if diag.recours}
            <!--
              À QUI S'ADRESSER.

              Ordre d'Aude : « à chaque fois ça renvoie vers un professionnel
              spécifique ». Un conseil qui dit « faites chiffrer » sans dire par
              qui laisse le lecteur devant son moteur de recherche, et c'est là
              qu'il abandonne.
            -->
            <p class="recours">
              <span class="qui">{diag.recours.qui}</span>
              <!-- Le tiret est écrit, pas dessiné par un `::after` : la ligne
                   part souvent chez le notaire par copier-coller. -->
              <span class="quoi"> — {diag.recours.quoi}</span>
            </p>
          {/if}

          {#if diag.sources.length}
            <!--
              Les articles sur lesquels reposent ces gestes.

              Ils étaient lus à la source, datés, rangés dans le référentiel —
              et affichés nulle part. Le produit citait donc le droit sans
              jamais donner de quoi le vérifier. Ici, chaque texte s'ouvre sur
              Légifrance, et porte la date à laquelle il a été lu.
            -->
            <details class="textes">
              <summary>Les textes qui le disent ({diag.sources.length})</summary>
              <ul class="sources">
                {#each diag.sources as s (s.reference + s.url)}
                  <li>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">{s.reference}</a>
                    <span class="lu">lu le {new Date(s.luLe).toLocaleDateString('fr-FR')}</span>
                  </li>
                {/each}
              </ul>
            </details>
          {/if}
        </div>
      {/each}
    </div>

    {#if lexique.length}
      <!--
        L'annexe des termes, réservée au papier.

        À l'écran, chaque mot du métier est souligné là où il se lit et sa
        définition s'ouvre au clic : la reprendre en fin de page la donnait une
        seconde fois, et obligeait à descendre chercher ce qui était déjà sous
        le doigt.

        Sur le papier, on ne clique pas. Le document part chez des gens qui ne
        connaissent aucun de ces mots : l'annexe reste, et elle est
        indispensable.
      -->
      <div class="au-papier">
        <h2 class="apres"><span class="num">{numeros.mots}</span>Les mots employés</h2>
        <dl class="lexique">
          {#each lexique as mot (mot.nom)}
            <div>
              <dt>{mot.nom}</dt>
              <dd>{mot.definition}</dd>
            </div>
          {/each}
        </dl>
      </div>
    {/if}

    <p class="reserve">
      Ce point de situation est une lecture du dossier, pas un acte. Seul le rapport signé par le
      diagnostiqueur engage, et lui seul fait foi devant le notaire.
    </p>
  </div>
</section>

<style>
  .notaire {
    margin-bottom: var(--e6);
  }

  /* Le retour se pose à même le vert : pas d'encart, pas de caisson. Ce qui
     structure, ce sont les titres et les filets. */
  .feuille {
    color: var(--sur-fond);
  }

  /* Les sections sont numérotées en chiffres romains, comme les articles d'un
     acte. Le numéro est posé dans la marge : il rythme sans encombrer. */
  h2 {
    display: flex;
    align-items: baseline;
    gap: var(--e4);
    font-size: var(--t-titre);
    color: var(--verriere-vert);
    margin-bottom: var(--e4);
  }

  .num {
    flex: none;
    width: 2rem;
    font-family: var(--police);
    font-size: var(--t-petit);
    font-weight: 600;
    font-style: normal;
    letter-spacing: var(--suivi);
    /* --or ne tient que 4,15 de contraste sur le vert : le numéro d'article
       passe en or clair, comme les autres petits textes de la charte. */
    color: var(--verriere-vert);
    /* Aligné sur la ligne de base du titre, pas sur son haut. */
    align-self: baseline;
  }

  /* Un filet double sous chaque section : le trait or ténu, puis le blanc.
     C'est le détail qui distingue un document d'une page web. */
  h2.apres {
    margin-top: var(--e7);
    padding-top: var(--e5);
    border-top: 1px solid var(--surface-bord);
    box-shadow: 0 -3px 0 -2px var(--trait-or);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--e1);
  }

  li {
    position: relative;
    padding-left: var(--e4);
    font-size: var(--t-base);
    line-height: 1.5;
  }

  li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.62em;
    width: 6px;
    height: 6px;
    border-radius: 1px;
    background: var(--verriere-sable-or);
  }



  /* Les deux planches se répondent côte à côte dès qu'il y a la place. */
  .planches {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
    gap: 0 44px;
  }

  .planche {
    min-width: 0;
  }

  /* Les deux étiquettes gardent la taille d'une planche : étalées sur toute la
     largeur de l'écran, des barres de couleur de plus d'un mètre de long ne se
     lisent plus — elles décorent. C'est un document technique, il a un format. */
  .planche-seuil {
    max-width: 420px;
    margin: 0 0 var(--e5);
    padding: var(--e4);
    background: var(--papier);
    border-radius: var(--rayon);
    color: var(--encre);
  }

  /* Le conseil se lit bloc par bloc, dans l'ordre où l'on s'en occupe.

     C'était un `columns: 2`, puis une grille en deux colonnes — laquelle tenait
     tant qu'il y avait trois sections : la première prenait toute la largeur,
     les deux autres se répondaient côte à côte.

     La quatrième section a cassé ça, et il a fallu le mesurer pour le voir :
     « À faire lever » et « À chiffrer, puis à négocier » se retrouvaient à la
     MÊME hauteur au pixel près (2373 px l'une et l'autre), dans deux colonnes
     voisines. Or l'ordre de ces deux-là porte tout le raisonnement du conseil —
     on ne négocie pas ce que personne n'a regardé. Côte à côte, ils se lisent
     comme deux options équivalentes, et la démonstration tombe.

     Une seule colonne, donc, comme sur le papier — où le bloc `@media print`
     faisait déjà exactement cela. L'écran et la feuille disent enfin la même
     chose, et la largeur de lecture reste tenue par `--mesure`. */
  .conseils {
    display: flex;
    flex-direction: column;
    gap: var(--e5);
  }

  .conseil {
    break-inside: avoid;
    max-width: var(--mesure);
  }

  /* Ce qui empêche de signer se distingue du reste : un filet, dès le premier
     coup d'œil, avant même d'avoir lu le titre. */
  .conseil:first-child {
    padding-left: var(--e4);
    border-left: 3px solid var(--verriere-sable-or);
  }

  /* ---- Ce qui bloque le rendez-vous, réuni --------------------------------

     Un encart, pas une section : il tient en quelques lignes, il ne porte que
     des renvois, et il disparaît quand rien ne bloque. Le filet à gauche est
     celui qui distinguait déjà « à régulariser » quand c'était un bloc — le
     lecteur retrouve le même signe. */
  .a-regler {
    max-width: var(--mesure);
    margin: 0 0 var(--e6);
    padding: var(--e3) var(--e4);
    border-left: 3px solid var(--alerte-vive);
    background: var(--surface-forte);
    border-radius: 0 var(--rayon) var(--rayon) 0;
  }

  .titre-regler {
    display: flex;
    align-items: center;
    gap: var(--e2);
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--alerte-vive);
  }

  .combien {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.4em;
    padding: 0 0.35em;
    border-radius: 999px;
    background: var(--alerte-vive);
    color: var(--papier);
    font-size: var(--t-micro);
  }

  .a-regler ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .a-regler li + li {
    margin-top: var(--e1);
  }

  /* Chaque ligne est un renvoi : elle mène au bloc du diagnostic, plus bas. */
  .a-regler button {
    display: block;
    width: 100%;
    padding: var(--e1) 0;
    background: none;
    border: 0;
    font: inherit;
    font-size: var(--t-petit);
    text-align: left;
    color: var(--encre);
    cursor: pointer;
    border-radius: var(--rayon);
  }

  .a-regler button:hover .quoi-regler,
  .a-regler button:focus-visible .quoi-regler {
    text-decoration: underline;
  }

  .a-regler .ou {
    display: block;
    font-size: var(--t-micro);
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  /* La tête d'un bloc : le nom du diagnostic à gauche, sa date à droite. */
  .tete-conseil {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--e4);
    margin-bottom: var(--e3);
    padding-bottom: var(--e2);
    border-bottom: 1px solid var(--surface-bord);
  }

  .titre-conseil {
    margin: 0;
    font-weight: 700;
    font-size: var(--t-base);
    color: var(--verriere-vert-profond);
  }

  /* La date vit avec son rapport : « valable jusqu'au » est une propriété du
     diagnostic, pas une ligne d'un tableau à part. */
  .echeance {
    flex: none;
    font-family: var(--mono);
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
    white-space: nowrap;
  }

  .echeance.perime {
    font-weight: 700;
    color: var(--alerte-vive);
  }

  /* Le temps auquel appartiennent les gestes qui suivent : à régulariser, à
     faire lever, à négocier, à savoir. Un intercalaire, pas un titre de plus. */
  .temps {
    margin: var(--e4) 0 var(--e1);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  .temps:first-of-type {
    margin-top: 0;
  }

  /* Ce qui bloque et ce qu'on ne sait pas se voient sans qu'on les cherche ;
     la marge de négociation aussi, parce que c'est là qu'on gagne de l'argent.
     Ce qui ne demande rien reste en gris. */
  .temps.avant {
    color: var(--alerte-vive);
  }

  .temps.lever,
  .temps.negocier {
    color: var(--verriere-vert-profond);
  }

  /* ---- Le bandeau des diagnostics ---------------------------------------

     Même dessin que le bandeau de la vue « Les diagnostics » : une ligne de
     pastilles qui défile, chacune avec sa gravité. La différence tient à ce
     qu'il fait — celui-là ne feuillette pas, il conduit au conseil du
     diagnostic, plus bas dans la page. D'où l'absence d'onglet « courant » :
     aucun n'est ouvert, ils mènent tous ailleurs. */
  .bandeau-diags {
    display: flex;
    gap: var(--e2);
    overflow-x: auto;
    scrollbar-width: none;
    padding: var(--e1) var(--e1) var(--e2);
    margin: 0 0 var(--e5);
    /* Ce qui déborde s'efface au bord plutôt que d'être tranché net : on
       comprend qu'il y en a d'autres. */
    mask-image: linear-gradient(90deg, transparent, #000 14px, #000 calc(100% - 14px), transparent);
  }

  .bandeau-diags::-webkit-scrollbar {
    display: none;
  }

  .onglet-diag {
    flex: none;
    display: inline-flex;
    align-items: baseline;
    gap: var(--e2);
    padding: var(--e2) var(--e4);
    background: var(--surface-forte);
    border: 1px solid var(--surface-bord);
    border-radius: 999px;
    color: var(--sur-fond-doux);
    font-family: inherit;
    font-size: var(--t-petit);
    white-space: nowrap;
    cursor: pointer;
    transition:
      background 0.18s ease,
      border-color 0.18s ease,
      color 0.18s ease;
  }

  .onglet-diag:hover:not(:disabled),
  .onglet-diag:focus-visible {
    background: var(--surface-bord);
    border-color: var(--gravite, var(--surface-bord));
    color: var(--sur-fond);
  }

  /* Un diagnostic dont le dossier ne dit rien reste affiché, mais éteint :
     présent au dossier, sans rien à en faire. */
  .onglet-diag:disabled {
    cursor: default;
    opacity: 0.6;
  }

  .onglet-diag .pastille {
    align-self: center;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gravite, var(--sur-fond-doux));
    flex: none;
  }

  .nom-onglet {
    font-weight: 700;
    letter-spacing: var(--suivi-serre);
    color: var(--sur-fond);
  }

  /* Le verdict en trois mots, en retrait : le nom se lit d'abord. */
  .dit-onglet {
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
  }

  .onglet-diag.bon {
    --gravite: var(--verriere-vert);
  }
  .onglet-diag.attention {
    --gravite: var(--attention);
  }
  .onglet-diag.alerte {
    --gravite: var(--alerte-vive);
  }
  .onglet-diag.neutre {
    --gravite: var(--sur-fond-doux);
  }

  /* Sur le papier, rien ne défile : le bandeau devient un relevé qui passe à
     la ligne, et il garde tout son sens — c'est le sommaire du dossier. */
  @media print {
    .bandeau-diags {
      flex-wrap: wrap;
      overflow: visible;
      mask-image: none;
    }
  }

  /* Le professionnel à appeler, posé sous les gestes qu'il exécute. Un filet à
     gauche plutôt qu'un encadré : c'est une adresse, pas une alerte de plus. */
  .recours {
    margin: var(--e2) 0 0;
    padding-left: var(--e3);
    border-left: 2px solid var(--trait-or);
    font-size: var(--t-petit);
    line-height: 1.5;
  }

  .recours .qui {
    font-weight: 700;
    color: var(--verriere-vert-profond);
  }

  .recours .quoi {
    color: var(--sur-fond-doux);
  }

  .textes {
    margin-top: var(--e3);
    font-size: var(--t-petit);
  }

  .textes summary {
    cursor: pointer;
    color: var(--verriere-vert);
  }

  .sources {
    margin: var(--e2) 0 0;
    padding-left: var(--e4);
  }

  .sources li {
    margin-bottom: var(--e1);
  }

  .lu {
    margin-left: var(--e2);
    font-size: var(--t-micro);
    color: var(--sur-fond-doux);
  }

  /* Le calendrier n'a plus de tableau à lui : chaque date est remontée dans la
     tête du diagnostic qu'elle concerne, où « valable jusqu'au » se lit comme
     une propriété du rapport et non comme une ligne d'un relevé à part. */

  /* Les styles des encarts de synthèse sont partis avec eux, dans la vue
     « Les diagnostics » où le sommaire a repris leur rôle. */

  /* L'état descriptif : un relevé au filet, comme une notice d'architecte. */
  .caracteristiques {
    margin: var(--e4) 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 0 var(--e6);
  }

  .caracteristiques div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--e3);
    padding: var(--e2) 0;
    border-bottom: 1px solid var(--surface-bord);
  }

  .caracteristiques dt {
    font-size: var(--t-micro);
    letter-spacing: 0.12em;
    color: var(--sur-fond-doux);
  }

  .caracteristiques dd {
    margin: 0;
    font-size: var(--t-base);
    font-weight: 600;
    color: var(--sur-fond);
    text-align: right;
    white-space: nowrap;
  }

  .pourquoi {
    margin: var(--e4) 0 0;
    font-size: var(--t-base);
    line-height: 1.55;
    color: var(--sur-fond-doux);
  }



  /* La page de garde : filet or, objet du document, adresse en grand, et la
     ligne de références sous le trait. C'est à ça qu'on reconnaît un document
     d'agence posé sur une table. */
  /* Le filet de garde est double : un trait or plein, un cheveu blanc dessous.
     C'est la signature d'un document imprimé. */
  .garde {
    border-top: 2px solid var(--verriere-sable-or);
    box-shadow: 0 3px 0 -2px var(--surface-bord);
    padding-top: var(--e5);
    margin-bottom: var(--e7);
  }

  .ligne-haute {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--e5);
    margin-bottom: var(--e5);
  }

  .objet {
    margin: 0;
    font-size: var(--t-micro);
    font-weight: 500;
    letter-spacing: 0.2em;
    color: var(--verriere-vert-profond);
  }

  .adresse {
    font-size: clamp(1.9rem, 4.6vw, 3rem);
    line-height: 1.05;
    margin: 0;
    color: var(--sur-fond);
  }

  /* Vu à l'écran juste au-dessus, dans le bandeau du bien : inutile de le
     répéter ici. Le papier, lui, n'a pas ce bandeau et garde son en-tête. */
  .au-papier {
    display: none;
  }

  @media print {
    .au-papier {
      display: block;
    }
  }

  .commune {
    margin: var(--e1) 0 0;
    font-family: var(--police-titre);
    font-size: clamp(1.2rem, 2.6vw, 1.6rem);
    color: var(--sur-fond-doux);
  }

  .sous-titre {
    margin: var(--e4) 0 0;
    font-family: var(--police-titre);
    font-style: italic;
    font-size: clamp(1rem, 2vw, 1.16rem);
    line-height: 1.5;
    max-width: var(--mesure);
    color: var(--sur-fond-doux);
  }

  /* Les références : en mono, comme le bandeau du site. */
  .references {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e2) 44px;
    margin: var(--e5) 0 var(--e4);
    padding-top: var(--e4);
    border-top: 1px solid var(--surface-bord);
  }

  .references div {
    display: grid;
    gap: var(--e1);
  }

  .references dt {
    font-size: var(--t-micro);
    letter-spacing: 0.16em;
    color: var(--sur-fond-doux);
  }

  .references dd {
    margin: 0;
    font-family: var(--mono);
    font-size: var(--t-base);
    color: var(--sur-fond);
  }

  .editer {
    flex: none;
    /* Il faisait 43 px de haut : un pixel sous la cible tactile confortable. */
    min-height: 46px;
    background: none;
    border: 1px solid var(--trait-or);
    border-radius: 0;
    padding: var(--e3) var(--e4);
    font-size: var(--t-petit);
    font-weight: 500;
    letter-spacing: 0.14em;
    color: var(--verriere-vert);
    cursor: pointer;
    transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease;
  }

  .editer:hover {
    background: var(--verriere-sable-or);
    border-color: var(--verriere-sable-or);
    color: var(--vert-900);
  }

  /* L'annexe : un terme, sa définition, en deux colonnes. */
  .lexique {
    margin: 0;
    columns: 2;
    column-gap: 44px;
  }

  @media (max-width: 820px) {
    .lexique {
      columns: 1;
    }
  }

  .lexique div {
    break-inside: avoid;
    margin-bottom: var(--e3);
  }

  .lexique dt {
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--verriere-vert-profond);
    margin-bottom: var(--e1);
  }

  .lexique dd {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--sur-fond-doux);
  }

  .reserve {
    margin: var(--e5) 0 0;
    padding-top: var(--e4);
    border-top: 1px solid var(--surface-bord);
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond-doux);
    opacity: 0.75;
  }
</style>
