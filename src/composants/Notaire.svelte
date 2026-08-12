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
</script>

<section class="notaire">
  <p class="eyebrow">Le point avant signature</p>

  <div class="feuille">
    <!-- De quoi on parle, en une ligne. Avant tout le reste. -->
    <h2>Le bien</h2>
    <p class="descriptif">{descriptif}</p>

    <h2 class="apres">L’état du bien</h2>
    <ul class="etat">
      {#each etat as ligne}
        <li>{ligne}</li>
      {/each}
    </ul>

    {#if dpe?.schema?.genre === 'dpe'}
      <!-- La maison du dossier : ses parois portent ce que le rapport en dit,
           et le texte explique pourquoi la chaleur part par là. -->
      <h2 class="apres">Par où ce logement perd sa chaleur</h2>
      <Deperditions isolation={dpe.schema.isolation} {lettre} />
      <p class="pourquoi">{pourquoi}</p>
    {/if}

    {#if lettre}
      <h2 class="apres">Où se situe ce logement</h2>
      <Positionnement {lettre} />
    {/if}

    <h2 class="apres">Ce que je vous conseille</h2>
    {#each conseils as bloc (bloc.titre)}
      <div class="conseil">
        <p class="titre-conseil">{bloc.titre}</p>
        <ul>
          {#each bloc.points as point}
            <li>{point}</li>
          {/each}
        </ul>
      </div>
    {/each}

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

  /* Tout le retour tient sur une seule feuille de papier : c'est un document
     qu'on remet, pas une succession d'encarts. */
  .feuille {
    background: var(--papier);
    border-radius: var(--rayon);
    padding: clamp(20px, 4vw, 40px);
    color: var(--encre);
    box-shadow: var(--ombre);
  }

  h2 {
    font-size: clamp(1.2rem, 2.6vw, 1.5rem);
    color: var(--vert-700);
    margin-bottom: 14px;
  }

  h2.apres {
    margin-top: 34px;
    padding-top: 22px;
    border-top: 1px solid var(--trait-fin);
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

  /* L'état du bien se lit comme un relevé : deux colonnes, pas de commentaire. */
  .etat {
    columns: 2;
    column-gap: 34px;
  }

  .etat li {
    break-inside: avoid;
    color: var(--encre-doux);
  }

  @media (max-width: 700px) {
    .etat {
      columns: 1;
    }
  }

  .conseil {
    margin-bottom: 20px;
  }

  .titre-conseil {
    margin: 0 0 8px;
    font-weight: 700;
    font-size: 0.76rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--or-fonce);
  }

  .descriptif {
    margin: 0;
    font-family: var(--police-titre);
    font-style: italic;
    font-size: clamp(1.05rem, 2.2vw, 1.3rem);
    line-height: 1.45;
    color: var(--encre);
  }

  .pourquoi {
    margin: 16px 0 0;
    font-size: 0.97rem;
    line-height: 1.55;
    color: var(--encre-doux);
  }

  .reserve {
    margin: 26px 0 0;
    padding-top: 16px;
    border-top: 1px solid var(--trait-fin);
    font-size: 0.86rem;
    line-height: 1.5;
    color: var(--gris);
  }
</style>
