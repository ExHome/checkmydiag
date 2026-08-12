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
  import type { Analyse, Diagnostic, TypeDiag } from '../lib/modele';
  import { enDate, VALIDITE_MOIS } from '../lib/analyse/coherence';
  import Positionnement from './Positionnement.svelte';
  import Deperditions from './schemas/Deperditions.svelte';
  import MotsExpliques from './MotsExpliques.svelte';
  import RubanDpe from './RubanDpe.svelte';
  import { motsEmployes } from '../lib/lexique';
  import { libelleCourt } from '../lib/libelle';
  import { enPratique, FICHES } from '../lib/analyse/fiches';

  const { analyse }: { analyse: Analyse } = $props();

  const dpe = $derived(analyse.diagnostics.find((d) => d.type === 'dpe') ?? null);
  const lettre = $derived(dpe?.schema?.genre === 'dpe' ? dpe.schema.finale : null);
  const maison = $derived(
    /maison/i.test(
      analyse.diagnostics.flatMap((d) => d.faits).find((f) => /type de bien/i.test(f.libelle))
        ?.valeur ?? ''
    )
  );

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
    const lieu = [analyse.bien.adresse, analyse.bien.commune].filter(Boolean).join(', ');

    const bouts = [nature];
    if (surface) bouts.push(`de ${surface}`);
    if (lieu) bouts.push(`situé ${lieu}`);
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
  const TRANCHE: Record<string, string> = {
    A: 'moins de 70',
    B: 'de 70 à 110',
    C: 'de 110 à 180',
    D: 'de 180 à 250',
    E: 'de 250 à 330',
    F: 'de 330 à 420',
    G: 'plus de 420'
  };

  const chiffres = $derived.by<{ quoi: string; donc: string[] }[]>(() => {
    if (dpe?.schema?.genre !== 'dpe' || !lettre) return [];

    const donc: string[] = [];
    const surface = dpe.faits.find((f) => /surface/i.test(f.libelle))?.valeur;
    const conso = dpe.schema.energie;
    const climat = dpe.schema.climat;

    if (conso) {
      const t = TRANCHE[conso.lettre];
      donc.push(
        `${conso.valeur} ${conso.unite}${surface ? ` — la consommation calculée divisée par ${surface}` : ''}. Ça tombe dans la tranche ${conso.lettre}${t ? ` (${t})` : ''}.`
      );
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
   * La synthèse : une ligne par diagnostic.
   *
   * Quatre colonnes, parce que ce sont les quatre questions qu'on pose devant
   * un dossier — de quoi s'agit-il, qu'est-ce qu'il dit, jusqu'à quand il vaut,
   * et qu'est-ce qu'il ne couvre pas. La dernière colonne compte autant que la
   * deuxième : une conclusion rassurante sans sa réserve se lit comme une
   * garantie.
   */
  const RESERVE_COURTE: Partial<Record<TypeDiag, string>> = {
    dpe: 'Un calcul, pas votre facture. Les parois non vues sont estimées.',
    amiante: 'Les seuls matériaux de la liste, contrôlés à l’œil.',
    plomb: 'Les revêtements accessibles. Une unité non mesurée reste inconnue.',
    electricite: 'Six points de sécurité. Rien de démonté, rien d’encastré.',
    gaz: 'Les parties visibles. Les tuyauteries encastrées ne sont pas vues.',
    termites: 'Là où c’était accessible. Ni mur fermé, ni vide sanitaire.',
    erp: 'Une recopie des zonages. Personne n’est venu sonder le terrain.',
    carrez: 'Les parties privatives sous 1,80 m. Ni cave, ni garage, ni balcon.',
    assainissement: 'Ce qui était accessible. Rien n’est mis au jour.'
  };

  /** L'échéance d'un diagnostic, calculée depuis sa date de visite. */
  function echeance(d: Diagnostic): { texte: string; perimee: boolean } {
    const duree = VALIDITE_MOIS[d.type];
    if (duree === undefined) return { texte: 'Sans limite', perimee: false };

    const depart = enDate(d.date);
    if (!depart) return { texte: `${duree >= 12 ? duree / 12 + ' ans' : duree + ' mois'}`, perimee: false };

    const fin = new Date(depart);
    fin.setMonth(fin.getMonth() + duree);
    const perimee = fin.getTime() < Date.now();
    return {
      texte: `${perimee ? 'Périmé depuis le ' : 'Jusqu’au '}${fin.toLocaleDateString('fr-FR')}`,
      perimee
    };
  }

  const synthese = $derived(
    analyse.diagnostics.map((d) => {
      const e = echeance(d);
      return {
        type: d.type,
        titre: d.titre,
        gravite: d.gravite,
        conclusion: libelleCourt(d),
        validite: e.texte,
        perimee: e.perimee,
        reserve: RESERVE_COURTE[d.type] ?? 'Ce qui était visible le jour de la visite.',
        // Ce qui s'ouvre au clic : la phrase du rapport, le conseil, l'enjeu
        // à la vente. Trois colonnes, pas un pavé.
        verdict: d.verdict,
        conseil: enPratique(d.type, d.gravite) ?? FICHES[d.type].quoiFaire,
        vente: FICHES[d.type].vente
      };
    })
  );

  /** La ligne dépliée. Une seule à la fois. */
  let ouvert = $state<TypeDiag | null>(null);

  const perimes = $derived(analyse.controles.filter((c) => c.genre === 'perime'));
  const manquants = $derived(analyse.controles.filter((c) => c.genre === 'manque'));
  const anomalies = $derived(
    analyse.diagnostics.filter(
      (d) => (d.type === 'electricite' || d.type === 'gaz') && d.gravite !== 'bon'
    )
  );
  const muets = $derived(analyse.diagnostics.filter((d) => d.gravite === 'neutre'));

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
   * Le conseil, dans l'ordre où il faut s'en occuper : ce qui empêche de
   * signer, puis ce qui se négocie, puis ce qui se vérifie.
   */
  const conseils = $derived.by<{ titre: string; points: string[] }[]>(() => {
    const liste: { titre: string; points: string[] }[] = [];

    if (perimes.length || manquants.length) {
      const points: string[] = [];
      for (const c of [...perimes, ...manquants]) points.push(`${c.titre} — ${c.quoiFaire}`);
      points.push('Un dossier incomplet le jour du rendez-vous fait repousser la signature.');
      liste.push({ titre: 'À régulariser avant la signature', points });
    }

    if (anomalies.length) {
      liste.push({
        titre: 'À chiffrer, puis à négocier',
        points: [
          `${anomalies.map((d) => d.titre.toLowerCase()).join(' et ')} : le rapport signale des anomalies.`,
          'Aucun texte n’oblige le vendeur à les réparer pour vendre.',
          'Faites établir un devis avant de faire une offre : c’est votre marge de discussion.',
          'Pour le gaz, une anomalie de type DGI fait exception : le gaz reste coupé tant qu’un professionnel n’est pas intervenu.'
        ]
      });
    }

    if (lettre) {
      const points: string[] = [];
      if (lettre === 'F' || lettre === 'G') {
        points.push(
          lettre === 'G'
            ? 'Ce logement n’est plus louable depuis le 1ᵉʳ janvier 2025.'
            : 'Ce logement ne sera plus louable au 1ᵉʳ janvier 2028.'
        );
        points.push('Le loyer est gelé : aucune révision ni réévaluation entre deux locataires.');
        if (maison) points.push('Pour vendre, un audit énergétique doit être joint au dossier.');
        points.push('Ces deux points pèsent sur le prix. Ils se discutent.');
      } else if (lettre === 'E') {
        points.push('Interdiction de louer au 1ᵉʳ janvier 2034 : l’échéance est lointaine, mais elle existe.');
        if (maison) points.push('Un audit énergétique est exigé pour vendre depuis 2025.');
      } else {
        points.push('Aucune interdiction de location ne vise cette classe à ce jour.');
        points.push('Aucun audit énergétique n’est exigé pour vendre.');
        points.push('C’est un point favorable du dossier : il se dit dans l’annonce.');
      }
      liste.push({ titre: 'Ce que la classe énergétique implique', points });
    }

    const aVerifier: string[] = [];
    if (muets.length) {
      aVerifier.push(
        `${muets.length} conclusion${muets.length > 1 ? 's' : ''} n’${muets.length > 1 ? 'ont' : 'a'} pas pu être lue${muets.length > 1 ? 's' : ''} automatiquement : à relire sur le rapport signé.`
      );
    }
    aVerifier.push(
      'Ces diagnostics portent sur ce qui était visible le jour de la visite, sans démontage.'
    );
    aVerifier.push('Ce qui est fermé, encombré ou inaccessible n’a pas été contrôlé.');
    liste.push({ titre: 'Ce que le dossier ne garantit pas', points: aVerifier });

    return liste;
  });
  /** Les termes employés dans ce document-ci, pour l'annexe. */
  const lexique = $derived(
    motsEmployes([pourquoi, ...conseils.flatMap((c) => c.points), ...etat])
  );

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

    <h1 class="adresse">{analyse.bien.adresse || 'Le bien'}</h1>
    {#if analyse.bien.commune}
      <p class="commune">{analyse.bien.commune}</p>
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

  <div class="feuille">
    <!-- La synthèse : les huit diagnostics d'un coup d'œil, avec ce qu'ils
         concluent, jusqu'à quand ils valent, et ce qu'ils ne couvrent pas. -->
    <h2><span class="num">I</span>La synthèse du dossier</h2>
    <!-- Un encart par rapport. Un tableau se lit ligne à ligne ; un dossier de
         présentation se parcourt du regard, et chaque pièce y a sa place. -->
    <div class="encarts">
      {#each synthese as l (l.type)}
        <article class="encart {l.gravite}" class:ouvert={ouvert === l.type}>
          <button
            type="button"
            class="tete-encart"
            aria-expanded={ouvert === l.type}
            onclick={() => (ouvert = ouvert === l.type ? null : l.type)}
          >
            <p class="quoi-encart">{l.titre}</p>
            <p class="conclusion">{l.conclusion}</p>
            <p class="validite" class:perimee={l.perimee}>{l.validite}</p>
          </button>

          <p class="reserve-courte">
            <span>Ne couvre pas</span>
            {l.reserve}
          </p>

          {#if ouvert === l.type}
            <div class="deplie apparait">
              <div>
                <p class="titre-deplie">Ce que dit le rapport</p>
                <p><MotsExpliques texte={l.verdict} /></p>
              </div>
              <div>
                <p class="titre-deplie">Ce qu’il faut faire</p>
                <p><MotsExpliques texte={l.conseil} /></p>
              </div>
              <div>
                <p class="titre-deplie">Pour vendre</p>
                <p><MotsExpliques texte={l.vente} /></p>
              </div>
            </div>
          {/if}
        </article>
      {/each}
    </div>

    {#if caracteristiques.length}
      <!-- L'état descriptif, relevé ligne à ligne. Le descriptif en toutes
           lettres est déjà en page de garde : on ne le répète pas. -->
      <h2 class="apres"><span class="num">II</span>L’état descriptif</h2>
      <dl class="caracteristiques">
        {#each caracteristiques as c (c.libelle)}
          <div>
            <dt>{c.libelle}</dt>
            <dd>{c.valeur}</dd>
          </div>
        {/each}
      </dl>
    {/if}

    <!-- Les deux planches côte à côte : la maison et l'échelle se répondent,
         et l'écran large cesse d'être une longue colonne étroite. -->
    <div class="planches">
      {#if dpe?.schema?.genre === 'dpe'}
        <div class="planche">
          <h2 class="apres"><span class="num">III</span>Par où la chaleur s’en va</h2>
          <Deperditions isolation={dpe.schema.isolation} {lettre} />
          <p class="pourquoi"><MotsExpliques texte={pourquoi} /></p>
        </div>
      {/if}

      {#if lettre}
        <div class="planche">
          <h2 class="apres"><span class="num">IV</span>Où se situe ce logement</h2>
          <Positionnement {lettre} />
        </div>
      {/if}
    </div>

    {#if chiffres.length}
      <!-- Les chiffres du logement, à leur place : juste après ce qui les
           produit. Ils étaient plus bas dans un relevé séparé, qui répétait
           déjà la moitié du conseil. -->
      <h2 class="apres"><span class="num">V</span>D’où sort cette classe</h2>
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

    <h2 class="apres"><span class="num">VI</span>Ce que je vous conseille</h2>
    <div class="conseils">
      {#each conseils as bloc (bloc.titre)}
        <div class="conseil">
          <p class="titre-conseil">{bloc.titre}</p>
          <ul>
            {#each bloc.points as point}
              <li><MotsExpliques texte={point} /></li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>

    {#if lexique.length}
      <!-- L'annexe : tous les termes employés, définis. Le document part chez
           des gens qui n'en connaissent aucun. -->
      <h2 class="apres"><span class="num">VII</span>Les mots employés</h2>
      <dl class="lexique">
        {#each lexique as mot (mot.nom)}
          <div>
            <dt>{mot.nom}</dt>
            <dd>{mot.definition}</dd>
          </div>
        {/each}
      </dl>
    {/if}

    <p class="reserve">
      Ce point de situation est une lecture du dossier, pas un acte. Seul le rapport signé par le
      diagnostiqueur engage, et lui seul fait foi devant le notaire.
    </p>
  </div>
</section>

<style>
  .notaire {
    margin-bottom: 34px;
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
    color: var(--or-clair);
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
    color: var(--or);
    /* Aligné sur la ligne de base du titre, pas sur son haut. */
    align-self: baseline;
  }

  /* Un filet double sous chaque section : le trait or ténu, puis le blanc.
     C'est le détail qui distingue un document d'une page web. */
  h2.apres {
    margin-top: var(--e7);
    padding-top: var(--e5);
    border-top: 1px solid rgb(255 255 255 / 10%);
    box-shadow: 0 -3px 0 -2px var(--trait-or);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 6px;
  }

  li {
    position: relative;
    padding-left: 18px;
    font-size: 0.97rem;
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
    background: var(--or);
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

  /* Le conseil se lit en colonnes : chaque bloc est un sujet, pas une suite. */
  .conseils {
    columns: 2;
    column-gap: 44px;
  }

  @media (max-width: 820px) {
    .conseils {
      columns: 1;
    }
  }

  .conseil {
    break-inside: avoid;
    margin-bottom: 26px;
  }

  .titre-conseil {
    margin: 0 0 8px;
    font-weight: 700;
    font-size: 0.76rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--or);
  }


  /* Les encarts : un par rapport, comme les pièces d'un dossier de
     présentation. La grille se remplit d'elle-même selon la largeur, et
     l'encart ouvert prend toute la ligne pour laisser entrer son détail. */
  .encarts {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
    gap: var(--e3);
    margin-bottom: var(--e2);
  }

  .encart {
    display: flex;
    flex-direction: column;
    border: 1px solid rgb(255 255 255 / 11%);
    border-top: 2px solid var(--gravite, var(--gris));
    border-radius: var(--rayon-petit);
    background: rgb(255 255 255 / 4%);
    padding: var(--e4);
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  .encart:hover {
    background: rgb(255 255 255 / 8%);
    border-color: rgb(230 200 148 / 32%);
    border-top-color: var(--gravite, var(--gris));
  }

  /* L'encart ouvert grandit sur place. Le faire passer pleine largeur
     déplaçait toute la grille sous les yeux du lecteur : on perd le fil pour
     gagner une colonne. */
  .encart.ouvert {
    background: rgb(255 255 255 / 9%);
    border-color: rgb(230 200 148 / 40%);
    border-top-color: var(--gravite, var(--gris));
  }

  .encart.bon {
    --gravite: #4c9c72;
  }
  .encart.attention {
    --gravite: #c98a2e;
  }
  .encart.alerte {
    --gravite: #c0503c;
  }
  .encart.neutre {
    --gravite: var(--gris);
  }

  /* La tête de l'encart est le bouton : la cible fait toute la carte. */
  .tete-encart {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
  }

  .quoi-encart {
    display: flex;
    align-items: center;
    gap: var(--e2);
    margin: 0 0 var(--e2);
    font-size: var(--t-micro);
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--gris);
  }

  .quoi-encart::before {
    content: '';
    flex: none;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--gravite, var(--gris));
  }

  .conclusion {
    margin: 0 0 var(--e2);
    font-family: var(--police-titre);
    font-size: var(--t-lead);
    font-weight: 500;
    letter-spacing: -0.022em;
    line-height: 1.2;
    color: var(--sur-fond);
  }

  .validite {
    margin: 0;
    font-family: var(--mono);
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  .validite.perimee {
    color: #fc7060;
    font-weight: 700;
  }

  /* La réserve ferme l'encart : une conclusion sans sa limite se lit comme une
     garantie. */
  .reserve-courte {
    margin: var(--e3) 0 0;
    padding-top: var(--e3);
    border-top: 1px solid rgb(255 255 255 / 10%);
    font-size: var(--t-petit);
    line-height: 1.45;
    color: var(--sur-fond-doux);
    opacity: 0.82;
  }

  .reserve-courte span {
    display: block;
    margin-bottom: 2px;
    font-size: var(--t-micro);
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--gris);
    opacity: 0.9;
  }

  /* Trois temps empilés dans l'encart : ce que dit le rapport, quoi faire,
     l'enjeu à la vente. */
  .deplie {
    display: grid;
    gap: var(--e3);
    margin-top: var(--e4);
    padding-top: var(--e4);
    border-top: 1px solid var(--trait-or);
  }

  .deplie p {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--sur-fond-doux);
  }

  .titre-deplie {
    font-size: var(--t-micro) !important;
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--or) !important;
    margin-bottom: var(--e1) !important;
  }

  /* L'état descriptif : un relevé au filet, comme une notice d'architecte. */
  .caracteristiques {
    margin: 22px 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 0 40px;
  }

  .caracteristiques div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 14px;
    padding: 9px 0;
    border-bottom: 1px solid rgb(255 255 255 / 10%);
  }

  .caracteristiques dt {
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gris);
  }

  .caracteristiques dd {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 600;
    color: var(--sur-fond);
    text-align: right;
    white-space: nowrap;
  }

  .pourquoi {
    margin: 16px 0 0;
    font-size: 0.97rem;
    line-height: 1.55;
    color: var(--sur-fond-doux);
  }



  /* La page de garde : filet or, objet du document, adresse en grand, et la
     ligne de références sous le trait. C'est à ça qu'on reconnaît un document
     d'agence posé sur une table. */
  /* Le filet de garde est double : un trait or plein, un cheveu blanc dessous.
     C'est la signature d'un document imprimé. */
  .garde {
    border-top: 2px solid var(--or);
    box-shadow: 0 3px 0 -2px rgb(255 255 255 / 22%);
    padding-top: var(--e5);
    margin-bottom: var(--e7);
  }

  .ligne-haute {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 26px;
  }

  .objet {
    margin: 0;
    font-size: 0.74rem;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--or);
  }

  .adresse {
    font-size: clamp(1.9rem, 4.6vw, 3rem);
    line-height: 1.05;
    margin: 0;
    color: var(--sur-fond);
  }

  .commune {
    margin: 4px 0 0;
    font-family: var(--police-titre);
    font-size: clamp(1.2rem, 2.6vw, 1.6rem);
    color: var(--sur-fond-doux);
  }

  .sous-titre {
    margin: 16px 0 0;
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
    gap: 10px 44px;
    margin: 26px 0 20px;
    padding-top: 18px;
    border-top: 1px solid rgb(255 255 255 / 12%);
  }

  .references div {
    display: grid;
    gap: 3px;
  }

  .references dt {
    font-size: 0.66rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gris);
  }

  .references dd {
    margin: 0;
    font-family: var(--mono);
    font-size: 0.9rem;
    color: var(--sur-fond);
  }

  .editer {
    flex: none;
    background: none;
    border: 1px solid var(--trait-or);
    border-radius: 0;
    padding: 11px 20px;
    font-size: 0.76rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--or-clair);
    cursor: pointer;
    transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease;
  }

  .editer:hover {
    background: var(--or);
    border-color: var(--or);
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
    margin-bottom: 14px;
  }

  .lexique dt {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--or);
    margin-bottom: 3px;
  }

  .lexique dd {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.5;
    color: var(--sur-fond-doux);
  }

  .reserve {
    margin: 30px 0 0;
    padding-top: 18px;
    border-top: 1px solid rgb(255 255 255 / 12%);
    font-size: 0.86rem;
    line-height: 1.5;
    color: var(--sur-fond-doux);
    opacity: 0.75;
  }
</style>
