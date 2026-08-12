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
  import { motsEmployes } from '../lib/lexique';
  import { libelleCourt } from '../lib/libelle';

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
    {#if caracteristiques.length}
      <!-- L'état descriptif, relevé ligne à ligne. Le descriptif en toutes
           lettres est déjà en page de garde : on ne le répète pas. -->
      <h2>L’état descriptif</h2>
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
          <h2 class="apres">Par où ce logement perd sa chaleur</h2>
          <Deperditions isolation={dpe.schema.isolation} {lettre} />
          <p class="pourquoi"><MotsExpliques texte={pourquoi} /></p>
        </div>
      {/if}

      {#if lettre}
        <div class="planche">
          <h2 class="apres">Où se situe ce logement</h2>
          <Positionnement {lettre} />
        </div>
      {/if}
    </div>

    <h2 class="apres">Ce que je vous conseille</h2>
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
      <h2 class="apres">Les mots employés</h2>
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

  h2 {
    font-size: clamp(1.2rem, 2.6vw, 1.5rem);
    color: var(--or-clair);
    margin-bottom: 14px;
  }

  h2.apres {
    margin-top: 38px;
    padding-top: 24px;
    border-top: 1px solid rgb(255 255 255 / 12%);
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
  .garde {
    border-top: 2px solid var(--or);
    padding-top: 22px;
    margin-bottom: 40px;
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
