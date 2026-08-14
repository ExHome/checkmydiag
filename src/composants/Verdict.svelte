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
  import type { Analyse, Diagnostic, PointDeControle } from '../lib/modele';
  import { FICHES } from '../lib/analyse/fiches';
  import { familleDe } from '../lib/familles';
  import MotsExpliques from './MotsExpliques.svelte';

  const { analyse, photo = null }: { analyse: Analyse; photo?: string | null } = $props();

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
    Le bien avant le dossier.

    On ouvrait sur « le dossier n'est pas complet » : une phrase sur des
    papiers. Or ce qu'on tient entre les mains, c'est un logement — et le
    lecteur veut d'abord reconnaître le sien. L'adresse situe, les
    caractéristiques confirment, et tout ce qui suit parle de ce bien-là.

    Discret à dessein : une ligne, pas un titre. Le grand titre appartient au
    verdict, et l'état descriptif complet vit dans « L'analyse ».
  -->
  {#if identite.length || photo}
    <div class="bandeau-bien" class:avec-photo={Boolean(photo)}>
      {#if photo}
        <!-- La photo de façade tirée du rapport. C'est elle qui fait dire « oui,
             c'est chez moi » avant même de lire quoi que ce soit. Décorative au
             sens strict : le texte à côté dit tout. -->
        <img class="photo" src={photo} alt="" />
      {/if}
      <div class="dit-bien">
        {#if analyse.bien.adresse}<p class="adresse">{analyse.bien.adresse}</p>{/if}
        {#if analyse.bien.commune}<p class="commune">{analyse.bien.commune}</p>{/if}
        {#if identite.length}<p class="traits">{identite.join(' · ')}</p>{/if}
      </div>
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
  /* Le voyant se pose à même le vert, comme le reste : ce qui le distingue,
     c'est le filet de gauche à la couleur de son ton, et rien d'autre. */
  .verdict {
    margin-bottom: var(--e6);
    padding-left: var(--e5);
    border-left: 3px solid var(--ton);
  }

  .verdict.mauvais {
    --ton: #d4604a;
  }
  .verdict.moyen {
    --ton: #d9a03f;
  }
  .verdict.bon {
    --ton: #5fb489;
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

  .bandeau-bien.avec-photo {
    grid-template-columns: minmax(0, 220px) minmax(0, 1fr);
  }

  /* La photo garde ses proportions et se coupe au besoin : une façade tordue
     pour tenir dans un cadre ferait plus de mal que pas de photo du tout. */
  .photo {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
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

  .traits {
    margin-top: var(--e2) !important;
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  @media (max-width: 620px) {
    .bandeau-bien.avec-photo {
      grid-template-columns: 1fr;
    }

    /* Au téléphone, la photo passe en bandeau large et court : elle situe sans
       manger l'écran avant le verdict. */
    .photo {
      aspect-ratio: 16 / 7;
    }
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

  .repartition div {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: baseline;
    gap: var(--e2);
    padding-left: var(--e3);
    border-left: 2px solid var(--trait);
  }

  /* La couleur porte le niveau, mais elle n'est pas seule à le faire : le mot
     le dit aussi. Personne ne dépend de la couleur pour comprendre. */
  .repartition .mauvais {
    border-left-color: #d4604a;
  }

  .repartition .moyen {
    border-left-color: var(--or);
  }

  .repartition .bon {
    border-left-color: var(--vert-300);
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

  .entree {
    display: flex;
    align-items: center;
    gap: var(--e3);
    width: 100%;
    /* Une cible confortable au pouce : la ligne fait toute la largeur. */
    min-height: 52px;
    text-align: left;
    background: rgb(255 255 255 / 5%);
    border: none;
    border-left: 3px solid var(--marque);
    border-radius: 0;
    padding: var(--e3) var(--e4);
    color: var(--sur-fond);
    font-size: var(--t-base);
    font-weight: 600;
    line-height: 1.4;
    cursor: pointer;
    transition: background 0.18s ease;
  }

  .entree:hover {
    background: rgb(255 255 255 / 10%);
  }

  li.mauvais .entree {
    --marque: #d4604a;
  }
  li.moyen .entree {
    --marque: #d9a03f;
  }
  li.bon .entree {
    --marque: #5fb489;
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
    background: rgb(255 255 255 / 3%);
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
      border-left-color: #093f30;
      margin-bottom: 14mm;
    }

    .dit h2,
    .mot {
      color: #093f30 !important;
    }

    .dit p,
    .detail p {
      color: #41544c !important;
    }

    .picto {
      color: #093f30 !important;
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
