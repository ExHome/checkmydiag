<script lang="ts">
  /**
   * Le voyant du dossier.
   *
   * C'est la première chose de l'écran, et la seule qui doit être comprise en
   * trois secondes : est-ce que c'est grave, et qu'est-ce que je fais ?
   *
   * Avant, la réponse était en section VI, aux trois quarts de la page : on
   * ouvrait sur une adresse et un nombre de pages. Le lecteur, lui, arrive avec
   * une seule question — on y répond d'abord, le dossier vient ensuite.
   *
   * Trois silhouettes, jamais la même : triangle quand ça bloque, rond barré
   * quand ça se chiffre, rond coché quand c'est propre. La forme suffit ; la
   * couleur ne fait que confirmer.
   */
  import type { Analyse, Diagnostic, PointDeControle, TypeDiag } from '../lib/modele';
  import type { Photo } from '../lib/pdf';
  import { FICHES } from '../lib/analyse/fiches';
  import { FAMILLES, familleDe } from '../lib/familles';
  import { descriptifDe } from '../lib/descriptif';
  import { libelleCourt } from '../lib/libelle';
  import { echeance } from '../lib/echeance';
  import MotsExpliques from './MotsExpliques.svelte';
  import { origineDe, type Origine } from '../lib/bureau';

  interface Props {
    analyse: Analyse;
    /** La photo du bien, tirée de la page de garde. */
    photo?: Photo | null;
    /**
     * Ouvre le diagnostic choisi dans l'état descriptif. La tuile transmet son
     * carré : l'écran s'ouvre depuis elle, comme depuis une icône de l'accueil.
     * Le même geste doit donner le même résultat où qu'on le fasse.
     */
    surOuvrirDiagnostic?: (type: TypeDiag, origine?: Origine | null) => void;
  }

  const { analyse, photo = null, surOuvrirDiagnostic }: Props = $props();

  type Ton = 'mauvais' | 'moyen' | 'bon';

  interface Ligne {
    cle: string;
    ton: Ton;
    titre: string;
    explication: string;
    quoiFaire: string;
    /** Le domaine auquel ce point se rattache, quand on peut le savoir. */
    famille?: string;
  }

  /**
   * Ce qui décrit le bien en trois traits.
   *
   * Rien n'est inventé ni deviné : un champ que le rapport ne donne pas ne
   * s'affiche pas, et la ligne disparaît si l'on ne sait rien. Mieux vaut ne
   * rien dire du logement que de le décrire de travers.
   */
  /** Ce qu'est le bien, relevé ligne à ligne — avant qu'on en juge le dossier. */
  const descriptif = $derived(descriptifDe(analyse));

  /**
   * L'état descriptif : ce que chaque diagnostic conclut, en une ligne.
   *
   * C'est l'état du bien tel que le dossier l'établit — pas le détail, pas la
   * pédagogie : la conclusion générale de chaque rapport, et jusqu'à quand elle
   * vaut. On le lit en dix secondes, avant d'ouvrir quoi que ce soit.
   *
   * Les caractéristiques techniques ont quitté cette place : elles décrivent le
   * logement, et le logement est déjà décrit deux centimètres plus haut, en
   * vitrine. Ici, on veut savoir ce que le dossier dit de lui.
   *
   * Groupé par familles, parce que le lecteur ne connaît pas les noms des
   * rapports mais sait ce qui l'inquiète.
   */
  const etatDescriptif = $derived(
    FAMILLES.map((f) => ({
      ...f,
      diags: analyse.diagnostics.filter((d) => f.types.includes(d.type))
    })).filter((f) => f.diags.length > 0)
  );

  /**
   * Ce qui décrit le logement, moins ce que la vitrine annonce déjà en grand.
   *
   * Le type et la surface sont dans le titre : les redire juste dessous les
   * donnait deux fois à trois centimètres d'écart.
   */
  const traits = $derived(
    descriptif.filter((c) => !/type de bien|surface de r[ée]f[ée]rence|superficie privative|surface habitable/i.test(c.libelle))
  );

  /**
   * Le titre de la vitrine : ce qu'une agence écrit en gros sur son affiche.
   *
   * « Appartement 48,5 m² », pas « dossier de diagnostic technique ». C'est le
   * bien qu'on annonce, et on l'annonce comme il se dit.
   */
  const titreVitrine = $derived.by(() => {
    /*
     * On puise dans l'état descriptif avant de se rabattre sur `bien`.
     *
     * Sur un vrai rapport, l'en-tête donnait l'adresse mais ni le type ni la
     * surface : la vitrine annonçait « Logement » pendant que la ligne juste
     * dessous disait « Appartement, 86,82 m² ». L'information était là, deux
     * centimètres plus bas — elle était simplement cherchée au mauvais endroit.
     */
    const dans = (motif: RegExp): string | undefined =>
      descriptif.find((c) => motif.test(c.libelle))?.valeur;

    const nature = analyse.bien.typeBien ?? dans(/type de bien/i) ?? 'Logement';
    const surface =
      analyse.bien.surface !== undefined
        ? `${analyse.bien.surface.toLocaleString('fr-FR')} m²`
        : dans(/surface de r[ée]f[ée]rence|superficie privative|surface habitable/i);

    return surface ? `${nature} · ${surface}` : nature;
  });

  /** La lettre du DPE : en vitrine, c'est elle qu'on regarde après la photo. */
  const lettreDpe = $derived.by(() => {
    const d = analyse.diagnostics.find((x) => x.type === 'dpe');
    return d?.schema?.genre === 'dpe' ? d.schema.finale : null;
  });

  /** Les couleurs réglementaires : elles ne se réinventent pas. */
  const TEINTE_DPE: Record<string, string> = {
    A: '#319834',
    B: '#33cc31',
    C: '#cbfc34',
    D: '#fbfe06',
    E: '#fbcc05',
    F: '#fc9935',
    G: '#fc0205'
  };

  const identite = $derived(
    [
      analyse.bien.typeBien,
      analyse.bien.surface !== undefined ? `${analyse.bien.surface.toLocaleString('fr-FR')} m²` : null,
      analyse.bien.anneeConstruction
    ].filter((v): v is string => Boolean(v))
  );

  /**
   * Les trois niveaux du tableau de bord, dans l'ordre où ils engagent.
   *
   * Les mots comptent autant que les chiffres : « nécessite votre attention »
   * dit ce qu'il faut faire, là où « critique » ne ferait qu'inquiéter. On
   * alerte sans dramatiser.
   */
  const NIVEAUX = [
    { ton: 'mauvais', singulier: 'nécessite votre attention', pluriel: 'nécessitent votre attention' },
    { ton: 'moyen', singulier: 'est à surveiller', pluriel: 'sont à surveiller' },
    { ton: 'bon', singulier: 'est informatif ou rassurant', pluriel: 'sont informatifs ou rassurants' }
  ] as const;

  const parGenre = (genre: PointDeControle['genre']): PointDeControle[] =>
    analyse.controles.filter((c) => c.genre === genre);

  /**
   * Ce qui empêche de signer : un rapport périmé, un rapport absent, deux
   * chiffres qui ne concordent pas. Les trois se traitent pareil — il faut
   * revenir vers le vendeur avant le rendez-vous.
   */
  const bloquants = $derived([
    ...parGenre('perime'),
    ...parGenre('manque'),
    ...parGenre('incoherence')
  ]);

  /** Ce qui ne bloque pas mais mérite une question. */
  const remarques = $derived(parGenre('attention'));

  /** Les installations de sécurité dont le rapport signale des anomalies. */
  const anomalies = $derived(
    analyse.diagnostics.filter(
      (d) => (d.type === 'electricite' || d.type === 'gaz') && d.gravite !== 'bon'
    )
  );

  /** Un matériau dangereux réellement repéré : ça n'attend pas la négociation. */
  const dangers = $derived(
    analyse.diagnostics.filter(
      (d) => (d.type === 'amiante' || d.type === 'plomb' || d.type === 'termites') && d.gravite === 'alerte'
    )
  );

  const dpe = $derived(analyse.diagnostics.find((d) => d.type === 'dpe') ?? null);
  const lettre = $derived(dpe?.schema?.genre === 'dpe' ? dpe.schema.finale : null);

  /** « installation électrique et installation de gaz » : les noms du rapport. */
  function nomsDe(liste: Diagnostic[]): string {
    const noms = liste.map((d) => d.titre.toLowerCase());
    if (noms.length <= 1) return noms[0] ?? '';
    return `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`;
  }

  /**
   * Les lignes du voyant, dans l'ordre où on s'en occupe : ce qui empêche de
   * signer, ce qui se répare, ce qui se chiffre, ce qui se sait.
   */
  const lignes = $derived.by<Ligne[]>(() => {
    const liste: Ligne[] = [];

    for (const [i, c] of bloquants.entries()) {
      const fam = familleDe(c.type)?.nom;
      liste.push({
        cle: `b${i}`,
        ton: 'mauvais',
        titre: c.titre,
        explication: c.explication,
        quoiFaire: c.quoiFaire,
        ...(fam ? { famille: fam } : {})
      });
    }

    for (const d of dangers) {
      const fam = familleDe(d.type)?.nom;
      liste.push({
        cle: `d-${d.type}`,
        ton: 'mauvais',
        titre: `${d.titre} : le rapport a trouvé quelque chose`,
        explication: d.verdict,
        quoiFaire: FICHES[d.type].quoiFaire,
        ...(fam ? { famille: fam } : {})
      });
    }

    if (anomalies.length) {
      liste.push({
        cle: 'anomalies',
        ton: 'moyen',
        titre: `Des anomalies sur ${nomsDe(anomalies)}`,
        explication:
          'Une anomalie n’est pas une panne : l’installation fonctionne, mais elle ne respecte pas un point de la norme de sécurité. Aucun texte n’oblige le vendeur à la réparer pour vendre.',
        quoiFaire:
          'Faites chiffrer les réparations par un artisan avant de faire une offre : ce devis est votre marge de discussion.',
        famille: 'Sécurité'
      });
    }

    if (lettre === 'F' || lettre === 'G') {
      liste.push({
        cle: 'passoire',
        ton: 'moyen',
        titre:
          lettre === 'G'
            ? 'Classe G : ce logement ne peut plus être loué'
            : 'Classe F : ce logement ne pourra plus être loué en 2028',
        explication:
          'La loi interdit peu à peu la location des logements les plus consommateurs. Le loyer est déjà gelé : aucune révision, aucune réévaluation entre deux locataires.',
        quoiFaire:
          'Ce point pèse sur le prix, et il se discute. Faites chiffrer les travaux qui feraient remonter la classe.',
        famille: 'Énergie'
      });
    }

    for (const [i, c] of remarques.entries()) {
      const fam = familleDe(c.type)?.nom;
      liste.push({
        cle: `a${i}`,
        ton: 'moyen',
        titre: c.titre,
        explication: c.explication,
        quoiFaire: c.quoiFaire,
        ...(fam ? { famille: fam } : {})
      });
    }

    return liste;
  });

  /** Le ton du dossier entier : celui de sa ligne la plus grave. */
  const ton = $derived<Ton>(
    lignes.some((l) => l.ton === 'mauvais') ? 'mauvais' : lignes.length ? 'moyen' : 'bon'
  );

  /**
   * Le titre en trois mots, et la phrase qui dit quoi en faire.
   *
   * Elle ne recompte pas : le tableau de bord juste dessous donne déjà les
   * chiffres. Dire « 3 points sont à régler » au-dessus de « 3 nécessitent
   * votre attention » serait la même information deux fois, à trois
   * centimètres d'écart. La phrase dit donc ce que les chiffres ne disent
   * pas : ce qu'il faut en faire.
   */
  const annonce = $derived.by<{ titre: string; suite: string }>(() => {
    if (ton === 'mauvais') {
      return {
        titre: 'Le dossier n’est pas complet',
        suite: 'À régler avec le vendeur avant de signer.'
      };
    }

    if (ton === 'moyen') {
      return {
        titre: 'Rien ne bloque la vente',
        suite: 'Ce qui suit se chiffre et se négocie.'
      };
    }

    return {
      titre: 'Le dossier est complet',
      suite: 'Aucun rapport périmé, aucun rapport manquant, aucune anomalie signalée.'
    };
  });

  /** Une ligne ouverte à la fois : on lit une chose, pas un mur. */
  let ouverte = $state<string | null>(null);
</script>

<section class="verdict {ton}" aria-label="Ce qu’il faut retenir du dossier">
  <!--
    De quel document il s'agit, avant tout le reste.

    Un repérage avant travaux, un dossier technique amiante et un repérage de
    vente portent le même intitulé de mission : seule leur finalité les sépare.
    Le lecteur qui croit tenir son diagnostic de vente alors qu'il tient un
    repérage de chantier signera en pensant avoir un document qu'il n'a pas.
    On le nomme donc, et on dit ce qu'il ne fait pas.

    Le dossier de vente, lui, ne s'annonce pas : c'est le cas attendu, et
    l'annoncer ajouterait un bandeau à chaque lecture pour ne rien apprendre.
  -->
  {#if analyse.nature.genre !== 'venteLocation'}
    <aside class="nature" class:doute={analyse.nature.genre === 'inconnu'}>
      <p class="quoi-nature">Ce document</p>
      <p class="nom-nature">{analyse.nature.nom}</p>
      <p class="dit-nature">{analyse.nature.quoi}</p>
      {#if analyse.nature.reserve}
        <p class="reserve-nature">{analyse.nature.reserve}</p>
      {/if}
    </aside>
  {/if}
  <!--
    Le bien avant le dossier.

    On ouvrait sur « le dossier n'est pas complet » : une phrase sur des
    papiers. Or ce qu'on tient entre les mains, c'est un logement — et le
    lecteur veut d'abord reconnaître le sien. L'adresse situe, les
    caractéristiques confirment, et tout ce qui suit parle de ce bien-là.

    Discret à dessein : une ligne, pas un titre. Le grand titre appartient au
    verdict, et l'état descriptif complet vit dans « L'analyse ».
  -->
  <!-- La vitrine s'affiche dès qu'on sait quelque chose du bien. Une première
       version ne regardait que le type et la surface : sur un rapport qui
       donnait l'adresse sans eux, la vitrine disparaissait entièrement alors
       qu'il y avait tout ce qu'il faut pour la remplir. -->
  {#if identite.length || photo || analyse.bien.adresse || analyse.bien.commune}
    <div class="bandeau-bien" class:avec-photo={Boolean(photo)}>
      {#if photo}
        <!-- La photo de façade tirée du rapport. C'est elle qui fait dire « oui,
             c'est chez moi » avant même de lire quoi que ce soit. Décorative au
             sens strict : le texte à côté dit tout.

             Ses proportions sont celles du rapport, et on n'y touche pas : la
             recadrer en 4/3 coupait les façades hautes et les vues larges. -->
        <img
          class="photo"
          src={photo.image}
          width={photo.largeur}
          height={photo.hauteur}
          alt=""
        />
      {/if}
      <div class="dit-bien">
        <!-- Le titre d'une annonce : ce qu'est le bien, et sa taille. C'est
             ainsi qu'une agence l'écrit sur son affiche. -->
        <p class="titre-vitrine">{titreVitrine}</p>
        {#if analyse.bien.adresse}<p class="adresse">{analyse.bien.adresse}</p>{/if}
        {#if analyse.bien.commune}<p class="commune">{analyse.bien.commune}</p>{/if}

        <!-- Les caractéristiques du logement, en une ligne : l'âge, l'étage,
             l'enveloppe. Ce sont les mentions d'une annonce, elles se lisent
             d'un trait et non en tableau. -->
        {#if traits.length}
          <p class="traits">
            {#each traits as c, i (c.libelle)}<span
                ><span class="quoi-trait">{c.libelle}</span> {c.valeur}</span
              >{#if i < traits.length - 1}<span class="sep" aria-hidden="true">·</span>{/if}{/each}
          </p>
        {/if}

        {#if lettreDpe}
          <!-- L'étiquette énergie, obligatoire dans toute annonce depuis 2011 :
               en vitrine, c'est ce qu'on regarde juste après la photo. La
               couleur est celle de l'arrêté, elle ne se réinvente pas — et la
               lettre est écrite, pour qui ne distingue pas les teintes. -->
          <p class="etiquette" style:--teinte={TEINTE_DPE[lettreDpe]}>
            <span class="lettre">{lettreDpe}</span>
            <span class="quoi-etiquette">Classe énergie</span>
          </p>
        {/if}
      </div>
    </div>
  {/if}

  <!--
    L'état descriptif : ce que le dossier établit, rapport par rapport.

    C'est l'ordre d'un dossier — on présente le bien, on dit dans quel état il
    est, puis on analyse ce qui coince. Une tuile par diagnostic : son nom, ce
    qu'il conclut, jusqu'à quand ça vaut. Rien de plus ; le détail est dans
    l'analyse, à un clic.
  -->
  {#if etatDescriptif.length}
    <div class="etat-descriptif">
      <p class="eyebrow">L’état descriptif</p>

      {#each etatDescriptif as f (f.cle)}
        <section class="famille">
          <h3 class="titre-famille">
            {f.nom}<span class="quoi-famille">{f.quoi}</span>
          </h3>
          <div class="tuiles">
            {#each f.diags as d (d.type)}
              {@const q = echeance(d)}
              <button
                type="button"
                class="tuile {d.gravite}"
                onclick={(e) =>
                  surOuvrirDiagnostic?.(d.type, origineDe(e.currentTarget as HTMLElement))}
              >
                <span class="nom-diag">{d.titre}</span>
                <span class="conclusion">{libelleCourt(d)}</span>
                <span class="jusqua" class:perimee={q.perimee}>{q.texte}</span>
              </button>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  {/if}

  <div class="tete">
    <span class="picto" aria-hidden="true">
      {#if ton === 'mauvais'}
        <!-- Le triangle : la seule silhouette anguleuse de l'écran. -->
        <svg viewBox="0 0 48 48">
          <path d="M24 4.5 46 42H2Z" fill="currentColor" />
          <path d="M24 18v10" stroke="var(--fond)" stroke-width="4.2" stroke-linecap="round" />
          <circle cx="24" cy="35" r="2.4" fill="var(--fond)" />
        </svg>
      {:else if ton === 'moyen'}
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="21" fill="currentColor" />
          <path d="M24 12v13" stroke="var(--fond)" stroke-width="4.2" stroke-linecap="round" />
          <circle cx="24" cy="33.5" r="2.6" fill="var(--fond)" />
        </svg>
      {:else}
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="21" fill="currentColor" />
          <path
            d="m14.5 24.5 6.5 6.5 12.5-13"
            fill="none"
            stroke="var(--fond)"
            stroke-width="4.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      {/if}
    </span>

    <div class="dit">
      <h2>{annonce.titre}</h2>
      <p>{annonce.suite}</p>
    </div>
  </div>

  {#if lignes.length}
    <!--
      Le tableau de bord, avant la liste.

      Trois secondes doivent suffire à savoir de quoi il retourne : combien de
      points, et lesquels pèsent. Les chiffres portent seuls — pas de carte,
      pas de fond, pas de pictogramme. Ce qui vient ensuite les détaille ; ici,
      on ne fait que dire l'ampleur.
    -->
    <div class="bilan">
      <p class="total">
        <strong>{lignes.length}</strong>
        {lignes.length > 1 ? 'points identifiés' : 'point identifié'}
      </p>

      <dl class="repartition">
        {#each NIVEAUX as niveau (niveau.ton)}
          {@const n = lignes.filter((l) => l.ton === niveau.ton).length}
          {#if n > 0}
            <div class={niveau.ton}>
              <dt>{n}</dt>
              <dd>{n > 1 ? niveau.pluriel : niveau.singulier}</dd>
            </div>
          {/if}
        {/each}
      </dl>

      <!-- La preuve : autant expliqués que trouvés. Chaque ligne s'ouvre. -->
      <p class="expliques">
        {lignes.length} identifié{lignes.length > 1 ? 's' : ''} · {lignes.length} expliqué{lignes.length >
        1
          ? 's'
          : ''}
      </p>
    </div>

    <ul class="lignes">
      {#each lignes as ligne (ligne.cle)}
        <li class={ligne.ton}>
          <button
            type="button"
            class="entree"
            aria-expanded={ouverte === ligne.cle}
            onclick={() => (ouverte = ouverte === ligne.cle ? null : ligne.cle)}
          >
            <span class="marque" aria-hidden="true"></span>
            <span class="mot">
              {ligne.titre}
              <!-- Le domaine, en second : il relie ce point au dossier plus bas,
                   sans disputer la vedette au constat lui-même. -->
              {#if ligne.famille}<span class="domaine">{ligne.famille}</span>{/if}
            </span>
            <span class="signe" aria-hidden="true">{ouverte === ligne.cle ? '−' : '+'}</span>
          </button>

          {#if ouverte === ligne.cle}
            <!-- C'est ici que le lecteur rencontre les mots du métier pour la
                 première fois — A1, DGI, opposable, saturnisme. Chacun s'ouvre
                 sur place : c'est ce qui permet de ne pas les expliquer dans
                 la phrase, et donc de la garder courte. -->
            <div class="detail apparait">
              <p><MotsExpliques texte={ligne.explication} /></p>
              <p class="faire"><MotsExpliques texte={ligne.quoiFaire} /></p>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  /* ---- La nature du document --------------------------------------------
     Un encart en or, franc, avant tout le reste : ce n'est pas un détail de
     lecture, c'est ce qui décide si le document répond à la question qu'on se
     pose. Il ne paraît que lorsqu'il y a un malentendu possible. */
  .nature {
    margin: 0 0 var(--e5);
    padding: var(--e4) var(--e5);
    background: linear-gradient(180deg, rgb(214 230 106 / 22%), rgb(214 230 106 / 10%));
    border: 1px solid var(--trait-or);
    border-left: 4px solid var(--or);
    border-radius: var(--rayon);
  }

  .nature.doute {
    border-left-color: var(--sur-fond-doux);
    background: var(--surface-forte);
  }

  .quoi-nature {
    margin: 0 0 var(--e1);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    color: var(--or-clair);
  }

  .nom-nature {
    margin: 0 0 var(--e2);
    font-family: var(--police-titre);
    font-size: var(--t-titre);
    font-weight: 500;
    line-height: 1.15;
    letter-spacing: -0.022em;
    color: var(--sur-fond);
  }

  .dit-nature {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--sur-fond-doux);
    max-width: var(--mesure);
  }

  /* La réserve est la raison d'être de l'encart : elle ne se met pas en petit. */
  .reserve-nature {
    margin: var(--e3) 0 0 !important;
    padding-top: var(--e3);
    border-top: 1px solid var(--trait-or);
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--or-clair);
    max-width: var(--mesure);
  }

  /* Le voyant se pose à même le vert, comme le reste : ce qui le distingue,
     c'est le filet de gauche à la couleur de son ton, et rien d'autre. */
  .verdict {
    margin-bottom: var(--e6);
    padding-left: var(--e5);
    border-left: 3px solid var(--ton);
  }

  .verdict.mauvais {
    --ton: var(--action);
  }
  .verdict.moyen {
    --ton: var(--attention);
  }
  .verdict.bon {
    --ton: var(--petrole);
  }

  .tete {
    display: flex;
    align-items: flex-start;
    gap: var(--e4);
  }

  /* Gros, parce que c'est lui qu'on voit avant de lire. */
  .picto {
    flex: none;
    width: 46px;
    color: var(--ton);
  }

  .picto svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .dit h2 {
    font-size: var(--t-section);
    color: var(--sur-fond);
    margin: 0 0 var(--e2);
  }

  .dit p {
    margin: 0;
    font-size: var(--t-lead);
    line-height: 1.45;
    color: var(--sur-fond-doux);
    max-width: var(--mesure);
  }

  /* Une ligne par chose à faire, dans l'ordre où on s'en occupe. */
  /* Le domaine : un mot, en retrait, qui dit de quelle partie du dossier ce
     point relève. Ni pastille ni cadre — une nuance de gris suffit. */
  .domaine {
    display: inline-block;
    margin-left: var(--e2);
    font-size: var(--t-micro);
    font-weight: 400;
    letter-spacing: var(--suivi-serre);
    color: var(--sur-fond-doux);
    opacity: 0.8;
  }

  /* Le bandeau d'ouverture : la photo du bien à gauche, son identité à droite.
     Un vrai bandeau, pas une ligne — on doit reconnaître son logement avant de
     lire quoi que ce soit. */
  .bandeau-bien {
    display: grid;
    gap: var(--e4);
    align-items: center;
    margin-bottom: var(--e5);
    padding-bottom: var(--e4);
    border-bottom: 1px solid var(--trait-or);
  }

  /* La photo prend de l'ampleur : en vitrine, c'est elle qui arrête le
     passant. */
  .bandeau-bien.avec-photo {
    grid-template-columns: minmax(0, 300px) minmax(0, 1fr);
    align-items: center;
  }

  .titre-vitrine {
    font-size: var(--t-petit);
    letter-spacing: var(--suivi);
    color: var(--or-clair);
    margin-bottom: var(--e2) !important;
  }

  /* L'étiquette énergie : la pastille colorée d'une annonce immobilière. */
  .etiquette {
    display: inline-flex;
    align-items: center;
    gap: var(--e2);
    margin-top: var(--e4) !important;
  }

  .lettre {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: var(--rayon);
    background: var(--teinte);
    color: #0a2b23;
    font-family: var(--police-titre);
    font-size: var(--t-titre);
    font-weight: 600;
    line-height: 1;
  }

  .quoi-etiquette {
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  /* La photo garde les proportions du rapport, sans recadrage.
     Elle était forcée en 4/3 et rognée au centre : sur une façade haute, on
     perdait le toit et le rez-de-chaussée ; sur une vue large, les côtés. Le
     rapport a cadré cette photo, c'est son cadrage qu'on montre. */
  .photo {
    width: 100%;
    height: auto;
    max-height: 260px;
    object-fit: contain;
    object-position: left center;
    border-radius: var(--rayon);
    display: block;
  }

  .dit-bien {
    min-width: 0;
  }

  .dit-bien p {
    margin: 0;
  }

  .adresse {
    font-family: var(--police-titre);
    font-size: var(--t-titre);
    font-weight: 500;
    line-height: 1.15;
    color: var(--sur-fond);
    letter-spacing: -0.02em;
  }

  .commune {
    font-size: var(--t-base);
    letter-spacing: var(--suivi-serre);
    color: var(--or-clair);
    margin-top: 2px !important;
  }

  /* Les mentions d'une annonce : à la file, séparées par des points médians.
     Le libellé s'efface, la valeur porte — on parcourt, on ne lit pas. */
  .traits {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--e1) var(--e3);
    margin-top: var(--e3) !important;
    font-size: var(--t-petit);
    color: var(--sur-fond);
  }

  .quoi-trait {
    color: var(--sur-fond-doux);
  }

  .traits .sep {
    color: var(--or-fonce);
    opacity: 0.55;
  }

  /* À l'étroit, chaque mention prend sa ligne et les points médians n'ont plus
     rien à séparer : ils restaient pendus en fin de ligne. */
  @media (max-width: 620px) {
    .traits {
      display: grid;
      justify-items: start;
    }

    .traits .sep {
      display: none;
    }
  }

  @media (max-width: 620px) {
    .bandeau-bien.avec-photo {
      grid-template-columns: 1fr;
    }

    /* Au téléphone, la photo se contente de la moitié haute d'un écran : elle
       situe sans repousser le verdict hors de vue. */
    .photo {
      max-height: 200px;
    }
  }

  /* ---- L'état descriptif ------------------------------------------------
     Ce que le dossier établit, rapport par rapport. Des tuiles, pas des
     lignes : chaque diagnostic est un sujet à part, et doit se voir comme tel.
     Le liseré de gravité trie l'œil avant même qu'on lise. */
  .etat-descriptif {
    margin: 0 0 var(--e6);
    padding-bottom: var(--e5);
    border-bottom: 1px solid var(--trait-or);
  }

  .etat-descriptif .famille + .famille {
    margin-top: var(--e5);
  }

  .titre-famille {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--e3);
    margin: 0 0 var(--e3);
    font-family: var(--police-titre);
    font-size: var(--t-lead);
    font-weight: 500;
    color: var(--sur-fond);
  }

  .quoi-famille {
    font-family: var(--police);
    font-size: var(--t-petit);
    font-weight: 400;
    color: var(--sur-fond-doux);
  }

  /* Les tuiles gardent une taille de tuile.
     Étirées à `1fr`, une famille qui ne contient qu'un rapport donnait un pavé
     de treize cents pixels de large pour y écrire trois mots — l'inverse d'une
     tuile. Elles s'arrêtent donc de grandir et s'alignent à gauche : même
     format d'une famille à l'autre, quelle qu'en soit la taille. */
  .tuiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 340px));
    justify-content: start;
    gap: var(--e3);
  }

  @media (max-width: 560px) {
    .tuiles {
      grid-template-columns: 1fr;
    }
  }

  /* Le relief se fait à la lumière, pas au cadre : la tuile est un peu plus
     claire que le fond, sa tranche haute capte une lueur, et son ombre la
     détache du vert. Elle se soulève au survol — juste assez pour dire
     qu'elle se clique. */
  .tuile {
    display: grid;
    gap: var(--e1);
    align-content: start;
    justify-items: start;
    text-align: left;
    min-height: 108px;
    padding: var(--e4);
    background: linear-gradient(180deg, var(--surface-bord), var(--surface-forte));
    border: 1px solid var(--surface-bord);
    border-top-color: var(--surface-bord);
    border-left: 3px solid var(--gravite, var(--sur-fond-doux));
    border-radius: var(--rayon);
    box-shadow: 0 1px 0 var(--surface-forte) inset, 0 10px 22px -18px rgb(15 58 71 / 90%);
    color: var(--sur-fond);
    cursor: pointer;
    transition:
      background 0.18s ease,
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease;
  }

  .tuile:hover {
    background: linear-gradient(180deg, var(--surface-bord), var(--surface-forte));
    border-color: var(--surface-bord);
    border-left-color: var(--gravite, var(--sur-fond-doux));
    transform: translateY(-2px);
    box-shadow: 0 1px 0 var(--surface-forte) inset, 0 16px 28px -20px rgb(15 58 71 / 100%);
  }

  @media (prefers-reduced-motion: reduce) {
    .tuile:hover {
      transform: none;
    }
  }

  .tuile.bon {
    --gravite: var(--petrole);
  }
  .tuile.attention {
    --gravite: var(--attention);
  }
  .tuile.alerte {
    --gravite: var(--alerte-vive);
  }
  .tuile.neutre {
    --gravite: var(--sur-fond-doux);
  }

  .nom-diag {
    font-size: var(--t-micro);
    font-weight: 600;
    letter-spacing: var(--suivi-serre);
    color: var(--sur-fond-doux);
  }

  /* La conclusion porte la tuile : c'est la seule chose qu'on lit vraiment. */
  .conclusion {
    font-family: var(--police-titre);
    font-size: var(--t-lead);
    font-weight: 500;
    line-height: 1.15;
    letter-spacing: -0.022em;
    color: var(--or-clair);
  }

  .jusqua {
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  /* Un rapport périmé fait repousser une signature : il se voit. */
  .jusqua.perimee {
    /* Ce rouge clair était lisible sur le vert nuit ; sur fond clair il tombe à
       1,79. La péremption d'un rapport est justement ce qu'il ne faut pas rater. */
    color: var(--alerte);
    font-weight: 650;
  }

  /* Le tableau de bord : rien qu'un filet au-dessus, de l'espace, et des
     chiffres. Une carte ici ajouterait un cadre à ce qui n'en demande pas. */
  .bilan {
    margin: var(--e5) 0 var(--e4);
    padding-top: var(--e4);
    border-top: 1px solid var(--trait-or);
  }

  .total {
    margin: 0 0 var(--e4);
    font-size: var(--t-base);
    color: var(--sur-fond-doux);
  }

  /* Le grand chiffre en Fraunces : c'est lui qu'on retient en trois secondes. */
  .total strong {
    font-family: var(--police-titre);
    font-size: clamp(2.4rem, 6vw, 3.4rem);
    font-weight: 500;
    line-height: 1;
    color: var(--sur-fond);
    margin-right: var(--e2);
    letter-spacing: -0.03em;
  }

  .repartition {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: var(--e4);
    margin: 0;
  }

  /* Au téléphone, une information par respiration : deux colonnes de cent
     soixante-huit pixels obligent à lire en accordéon, ce qui annule le
     bénéfice du chiffre. */
  @media (max-width: 560px) {
    .repartition {
      grid-template-columns: 1fr;
      gap: var(--e3);
    }
  }

  /* Chaque niveau prend sa teinte : un voile de sa couleur, un liseré franc à
     gauche, et le chiffre dans cette même couleur. Trois blocs qui se
     distinguent avant qu'on ait lu un mot. */
  .repartition div {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: baseline;
    gap: var(--e3);
    padding: var(--e3) var(--e4);
    background: linear-gradient(
      100deg,
      color-mix(in srgb, var(--teinte-niveau) 20%, transparent),
      transparent 78%
    );
    border-left: 3px solid var(--teinte-niveau);
    border-radius: 0 var(--rayon) var(--rayon) 0;
  }

  /* La couleur porte le niveau, mais elle n'est pas seule à le faire : le mot
     le dit aussi. Personne ne dépend de la couleur pour comprendre. */
  .repartition .mauvais {
    --teinte-niveau: var(--action);
  }

  .repartition .moyen {
    --teinte-niveau: var(--attention);
  }

  .repartition .bon {
    --teinte-niveau: var(--petrole);
  }

  .repartition div dt {
    color: var(--teinte-niveau);
  }

  .repartition dt {
    font-family: var(--police-titre);
    font-size: var(--t-section);
    font-weight: 500;
    line-height: 1;
    color: var(--sur-fond);
    font-variant-numeric: tabular-nums;
  }

  .repartition dd {
    margin: 0;
    font-size: var(--t-petit);
    line-height: 1.35;
    color: var(--sur-fond-doux);
  }

  .expliques {
    margin: var(--e4) 0 0;
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
    opacity: 0.8;
  }

  .lignes {
    list-style: none;
    margin: var(--e5) 0 0;
    padding: 0;
    display: grid;
    gap: var(--e1);
  }

  /*
   * La ligne de résultat de la charte : fond blanc, filet de quatre pixels à
   * gauche à la couleur du ton, et un voile de cette même couleur. Elle se
   * soulève de deux pixels au survol — assez pour dire qu'elle s'ouvre.
   */
  .entree {
    display: flex;
    align-items: center;
    gap: var(--e3);
    width: 100%;
    /* Une cible confortable au pouce : la ligne fait toute la largeur. */
    min-height: 52px;
    text-align: left;
    background: var(--voile, var(--papier));
    border: none;
    border-left: 4px solid var(--marque);
    border-radius: var(--rayon);
    padding: var(--e4);
    color: var(--sur-fond);
    font-size: var(--t-base);
    font-weight: 600;
    line-height: 1.4;
    cursor: pointer;
    box-shadow: var(--ombre);
    transition:
      transform var(--duree) ease,
      box-shadow var(--duree) ease,
      border-color var(--duree) ease;
  }

  .entree:hover {
    transform: translateY(-2px);
    box-shadow: var(--ombre-forte);
  }

  @media (prefers-reduced-motion: reduce) {
    .entree:hover {
      transform: none;
    }
  }

  /* Les trois états : le rouge d'alerte pour ce qui bloque, ambre pour ce qui
     se surveille, sage pour ce qui va. Chacun pose son filet et son voile. */
  li.mauvais .entree {
    --marque: var(--action);
    --voile: rgb(214 230 106 / 12%);
  }
  li.moyen .entree {
    --marque: var(--attention);
    --voile: rgb(138 90 5 / 10%);
  }
  li.bon .entree {
    --marque: var(--petrole);
    --voile: rgb(26 77 92 / 10%);
  }

  /* La pastille reprend la silhouette du voyant en miniature : carré pour ce
     qui bloque, rond pour ce qui se discute. On les distingue sans la couleur. */
  .marque {
    flex: none;
    width: 9px;
    height: 9px;
    background: var(--marque);
  }

  li.moyen .marque,
  li.bon .marque {
    border-radius: 50%;
  }

  .mot {
    flex: 1;
  }

  .signe {
    flex: none;
    font-family: var(--mono);
    font-size: var(--t-lead);
    color: var(--or-clair);
  }

  .detail {
    padding: var(--e3) var(--e4) var(--e4) calc(var(--e4) + 22px);
    background: var(--surface);
  }

  .detail p {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.55;
    color: var(--sur-fond-doux);
    max-width: var(--mesure);
  }

  /* Ce qu'on fait, détaché de ce qu'on explique : c'est la ligne qu'on relit. */
  .faire {
    margin-top: var(--e3) !important;
    padding-top: var(--e3);
    border-top: 1px solid var(--trait-or);
    color: var(--or-clair) !important;
  }

  @media (max-width: 620px) {
    .picto {
      width: 36px;
    }

    .verdict {
      padding-left: var(--e4);
    }
  }

  /* Sur le document remis, le voyant ouvre la page et tout est déplié : on
     n'imprime pas des boutons refermés. */
  @media print {
    .verdict {
      border-left-color: #0a2b23;
      margin-bottom: 14mm;
    }

    .dit h2,
    .mot {
      color: #0a2b23 !important;
    }

    .dit p,
    .detail p {
      color: #555555 !important;
    }

    .picto {
      color: #0a2b23 !important;
    }

    .entree {
      background: none !important;
      border-left-color: #999 !important;
    }

    .signe {
      display: none;
    }

    .detail {
      background: none !important;
    }
  }
</style>
