<script lang="ts">
  /**
   * LE MESURAGE — la mini-app, au visuel du pack du 22/08/2026.
   *
   * ═══════════════════════════════════════════════════════════════════════════
   * RÉFÉRENCE : 01_VISUEL_REFERENCE_MESURAGE.png
   * ORDRE MAÎTRE : docs/ODM-MESURAGE-MINI-APP.md
   * ═══════════════════════════════════════════════════════════════════════════
   *
   * L'architecture de la planche est reprise dans son ordre : en-tête, barre à
   * quatre onglets — Synthèse · Plans · Détails · Récapitulatif —, puis les
   * sections Méthode et Conseils.
   *
   * ── LES ÉCARTS À LA PLANCHE, ET LEUR RAISON ────────────────────────────────
   *
   * **Les trois cartes « 82,45 / 96,10 / 102,30 m² » ne sont pas reproduites en
   * dur.** Le README du pack le dit lui-même : « les chiffres visibles sont
   * illustratifs et ne doivent jamais être codés en dur ». La rangée affiche
   * donc les surfaces RÉELLEMENT présentes dans le rapport — une, deux ou
   * trois — et pas une case de plus.
   *
   * **La « Surface totale » de la maquette n'existe pas.** Aucun des 18 volets
   * lus n'imprime ce total. Les rapports en portent d'autres, sous leurs propres
   * intitulés — « Surface au sol totale », « Superficie HSP < 1.80M »,
   * « Surface totale au sol (Carrez et Hors Carrez) » —, et ce sont ceux-là qui
   * s'affichent, avec leurs mots.
   *
   * **Le plan 3D meublé de la maquette est remplacé par le croquis du
   * rapport.** L'ordre maître interdit d'inventer une géométrie (§ 5.B, § 15).
   * Or le volet de mesurage ne porte jamais de croquis : celui du dossier vient
   * de l'annexe du repérage amiante. On le montre en le disant — il montre le
   * même logement, il n'est ni coté ni contractuel.
   *
   * ── LA RÈGLE QUI NE BOUGE PAS ──────────────────────────────────────────────
   *
   * Chaque valeur affichée porte l'intitulé du rapport et sa ligne source.
   * Une donnée absente n'affiche rien ou dit qu'elle est absente. Une rubrique
   * qui répond « Néant » n'est pas une rubrique absente. Trois états, jamais
   * deux.
   */
  import type { Diagnostic } from '../../lib/modele';
  import { ecartNonCompte, piecesEcartees } from '../../lib/lecteurs/mesurage/modele';
  import type { LectureMesurage } from '../../lib/lecteurs/mesurage/modele';
  import { legendeDuCroquis, type Croquis } from '../../lib/lecteurs/mesurage/croquis';
  import { confronter, type SurfaceDeReference } from '../../lib/lecteurs/mesurage/reference';

  const {
    diagnostic,
    reference = { etat: 'absente' } as SurfaceDeReference,
    croquis = { etat: 'non trouvé' } as Croquis,
    imageCroquis = null,
    croquisEnAttente = false,
    entete = true
  }: {
    diagnostic: Diagnostic;
    reference?: SurfaceDeReference;
    croquis?: Croquis;
    /** La page du croquis, déjà dessinée. `null` tant qu'elle ne l'est pas. */
    imageCroquis?: string | null;
    /** Le dessin est-il encore en route ? Distingue « pas encore » de « pas du tout ». */
    croquisEnAttente?: boolean;
    entete?: boolean;
  } = $props();

  const lecture = $derived(diagnostic.mesurage as LectureMesurage | undefined);

  const fr = (n: number): string => n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

  type Onglet = 'synthèse' | 'plans' | 'détails' | 'récapitulatif';
  let onglet = $state<Onglet>('synthèse');

  /** La pièce dont le détail est ouvert — au clic, jamais au survol (§ 6). */
  let ouverte = $state<number | null>(null);

  /**
   * LES CARTES DE SURFACES — celles qui existent, et rien d'autre.
   *
   * Le tri, l'ordre et les explications viennent de `confronter()` : une seule
   * source, éprouvée à part. La maquette en montre trois ; le rapport en donne
   * une, deux ou trois, et c'est le rapport qui décide.
   */
  const cartes = $derived(lecture ? confronter(lecture, reference) : []);

  const ecart = $derived(lecture ? ecartNonCompte(lecture) : null);
  const ecartees = $derived(lecture ? piecesEcartees(lecture) : []);

  /**
   * LE CONTRÔLE D'ADDITION — exigé par le § 7 de l'ordre maître.
   *
   * Le tableau pièce par pièce et le total annoncé sont deux écritures
   * indépendantes de la même chose. On les compare, et on **signale** l'écart
   * au lieu de le corriger en silence (§ 15). La tolérance suit l'arrondi du
   * rapport : deux centièmes par ligne, pas davantage.
   */
  const controle = $derived.by(() => {
    if (!lecture?.surfaceLegale || !lecture.pieces.length) return null;
    const somme = lecture.pieces.reduce((n, p) => n + p.retenue, 0);
    const ecartSomme = somme - lecture.surfaceLegale.valeur;
    const tolerance = 0.02 * lecture.pieces.length + 0.011;
    return {
      somme,
      total: lecture.surfaceLegale.valeur,
      juste: Math.abs(ecartSomme) <= tolerance,
      ecartSomme
    };
  });

  /** Les colonnes du tableau : celles du rapport, dans son ordre. */
  const colonnes = $derived(lecture?.pieces[0]?.autres.map((a) => a.libelle) ?? []);

  const legendeCroquis = $derived(legendeDuCroquis(croquis));

  /**
   * LE CONSEIL — affiché seulement quand il est justifié (§ 5.F).
   *
   * Trois motifs, et chacun sort d'une donnée lue : une pièce non visitée, une
   * réserve de mission écrite par le diagnostiqueur, une somme qui ne retombe
   * pas. Sans motif, pas de bouton : suggérer un géomètre-expert « au cas où »
   * serait vendre une inquiétude que le rapport ne porte pas.
   */
  const motifsDeConseil = $derived.by(() => {
    const motifs: string[] = [];
    if (!lecture) return motifs;
    if (lecture.piecesNonVisitees.etat === 'renseignée') {
      motifs.push(
        'Une ou plusieurs pièces n’ont pas pu être visitées : leur surface n’est comptée nulle part.'
      );
    }
    if (lecture.reserves.length) {
      motifs.push(
        'Le diagnostiqueur écrit qu’il n’a pas pu contrôler la consistance du lot, faute de pièces fournies.'
      );
    }
    if (controle && !controle.juste) {
      motifs.push(
        'La somme des pièces du tableau ne retombe pas sur le total annoncé par le rapport.'
      );
    }
    return motifs;
  });
</script>

{#if lecture}
  <section class="mesurage" aria-label="Mesurage">
    {#if entete}
      <header class="entete">
        <span class="badge" aria-hidden="true">
          <svg viewBox="0 0 40 40" width="34" height="34">
            <rect x="8" y="4" width="24" height="32" rx="5" fill="none" stroke="currentColor" stroke-width="2.2" />
            {#each [11, 17, 23, 29] as y (y)}
              <line x1="8" y1={y} x2={y % 2 === 1 ? 18 : 15} y2={y} stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            {/each}
          </svg>
        </span>
        <div>
          <h2>Mesurage</h2>
          <p class="sous-titre">Comprendre les surfaces de votre bien</p>
        </div>
      </header>
    {/if}

    <nav class="onglets" aria-label="Sections du mesurage">
      {#each ['synthèse', 'plans', 'détails', 'récapitulatif'] as const as cle (cle)}
        <button
          type="button"
          class="onglet"
          class:actif={onglet === cle}
          aria-current={onglet === cle ? 'true' : undefined}
          onclick={() => (onglet = cle)}
        >
          {cle[0]!.toUpperCase() + cle.slice(1)}
        </button>
      {/each}
    </nav>

    {#if onglet === 'synthèse'}
      <h3 class="rubrique">Résumé des surfaces</h3>
      {#if cartes.length}
        <ul class="cartes">
          {#each cartes as c, i (c.quoi)}
            <!-- La première est la surface due par la loi : c'est la seule qui
                 s'écrira dans l'acte ou dans le bail, elle se voit. -->
            <li class="carte" class:forte={i === 0}>
              <p class="carte-libelle">{c.quoi}</p>
              <p class="carte-valeur">{fr(c.valeur)}<span class="unite"> m²</span></p>
              {#if c.aQuoiCaSert}
                <p class="carte-ou">{c.aQuoiCaSert}</p>
              {/if}
              <p class="carte-source">lu dans {c.ou}</p>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="absent">La surface n’a pas pu être lue dans ce rapport.</p>
      {/if}

      <p class="phrase">{diagnostic.verdict}</p>

      {#if ecart !== null && ecartees.length}
        <div class="encart">
          <p class="encart-titre">
            {fr(ecart)} m² existent et ne comptent pas
          </p>
          <p>
            Ce ne sont pas des décimales de calcul : ce sont des pièces entières, qui se
            visitent et qui ne figurent pas dans la surface annoncée.
          </p>
          <ul class="puces">
            {#each ecartees as p (p.source)}
              <li>
                <strong>{p.nom}</strong>{#if p.commentaire}<span> — {p.commentaire}</span>{/if}
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if lecture.piecesNonVisitees.etat === 'renseignée'}
        <div class="encart alerte">
          <p class="encart-titre">Pièces non visitées</p>
          <p>
            Une pièce non visitée n’est pas une pièce de 0 m² : elle n’a pas été mesurée du
            tout, et la surface annoncée ne la contient pas.
          </p>
          <ul class="puces">
            {#each lecture.piecesNonVisitees.valeur as p (p.source)}
              <li>
                <strong>{p.designation}</strong>{#if p.motif}<span> — {p.motif}</span>{/if}
              </li>
            {/each}
          </ul>
        </div>
      {:else if lecture.piecesNonVisitees.etat === 'néant'}
        <p class="note">
          Le rapport répond « Néant » à la liste des pièces non visitées : tout a été mesuré.
        </p>
      {/if}
    {/if}

    {#if onglet === 'plans'}
      <h3 class="rubrique">Le croquis du logement</h3>
      {#if croquis.etat === 'trouvé'}
        {#if imageCroquis}
          <figure class="croquis">
            <img src={imageCroquis} alt="Croquis de repérage, page {croquis.page} du rapport" />
            <figcaption>{legendeCroquis}</figcaption>
          </figure>
        {:else if croquisEnAttente}
          <p class="note">
            Le rapport porte un croquis en page {croquis.page} ({croquis.titre}). Il est en cours
            de dessin.
          </p>
        {:else}
          <!-- Le dessin n'a pas abouti : on ne laisse pas le lecteur attendre
               une image qui ne viendra pas. On lui dit où elle est. -->
          <p class="note">
            Le rapport porte un croquis en <strong>page {croquis.page}</strong>
            ({croquis.titre}), mais il n’a pas pu être dessiné ici — une planche
            vectorielle est lourde. Ouvrez cette page dans l’onglet « Rapport » pour la voir.
          </p>
        {/if}
      {:else if croquis.etat === 'annoncé'}
        <p class="note">
          Le rapport nomme une rubrique « {croquis.titre} » en page {croquis.page}, mais
          {croquis.pourquoi}. Verrière ne l’affiche pas : montrer une page qui n’est
          peut-être pas un plan serait pire que ne rien montrer.
        </p>
      {:else if croquis.etat === 'déclaré absent'}
        <p class="note">
          Le rapport le dit lui-même : « {croquis.source} »
        </p>
      {:else}
        <p class="note">
          Aucun croquis dans ce dossier. Verrière n’en dessine pas : une géométrie inventée
          ressemblerait à un plan sans en être un.
        </p>
      {/if}
      <p class="garde-fou">
        Verrière ne reconstruit aucun plan. Ce qui s’affiche ici, quand il y en a un, est la
        page du rapport telle qu’elle est.
      </p>
    {/if}

    {#if onglet === 'détails'}
      <h3 class="rubrique">Détail par pièce</h3>
      {#if lecture.pieces.length}
        <table class="tableau">
          <thead>
            <tr>
              <th scope="col">Pièce</th>
              <!-- L'en-tête du rapport, jamais le libellé du total : celui-ci
                   dirait « totale » au-dessus de valeurs pièce par pièce. -->
              <th scope="col" class="nombre">{lecture.colonneRetenue ?? 'Surface retenue'}</th>
              {#each colonnes as c (c)}
                <th scope="col" class="nombre">{c}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each lecture.pieces as p, i (p.source)}
              <tr class:ecartee={p.retenue === 0}>
                <th scope="row">
                  <button
                    type="button"
                    class="nom-piece"
                    aria-expanded={ouverte === i}
                    onclick={() => (ouverte = ouverte === i ? null : i)}
                  >
                    {#if p.niveau}<span class="niveau">{p.niveau}</span>{/if}
                    {p.nom}
                    {#if p.commentaire}<span class="pastille" aria-hidden="true">i</span>{/if}
                  </button>
                </th>
                <td class="nombre">{fr(p.retenue)} m²</td>
                {#each p.autres as a (a.libelle)}
                  <td class="nombre">{fr(a.valeur)} m²</td>
                {/each}
              </tr>
              {#if ouverte === i}
                <tr class="detail">
                  <td colspan={2 + p.autres.length}>
                    {#if p.commentaire}
                      <p><strong>Commentaire du rapport :</strong> {p.commentaire}</p>
                    {/if}
                    {#if p.retenue === 0}
                      <p>
                        Cette pièce a été mesurée puis écartée : elle ne compte pas dans la
                        surface annoncée.
                      </p>
                    {/if}
                    <p class="source">Ligne du rapport : « {p.source} »</p>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
        <p class="note">Appuyez sur une pièce pour voir son détail et sa ligne d’origine.</p>
      {:else}
        <p class="absent">Ce rapport n’imprime pas de tableau pièce par pièce.</p>
      {/if}
    {/if}

    {#if onglet === 'récapitulatif'}
      <h3 class="rubrique">Récapitulatif</h3>
      <dl class="recap">
        {#each cartes as c (c.quoi)}
          <div>
            <dt>{c.quoi}</dt>
            <dd>{fr(c.valeur)} m²</dd>
          </div>
        {/each}
      </dl>

      {#if controle}
        <div class="encart" class:alerte={!controle.juste}>
          <p class="encart-titre">Contrôle de l’addition</p>
          {#if controle.juste}
            <p>
              Les {lecture.pieces.length} pièces du tableau totalisent {fr(controle.somme)} m² :
              la somme retombe sur le total annoncé par le rapport.
            </p>
          {:else}
            <p>
              Les {lecture.pieces.length} pièces du tableau totalisent {fr(controle.somme)} m²,
              alors que le rapport annonce {fr(controle.total)} m² — soit un écart de
              {fr(Math.abs(controle.ecartSomme))} m². Verrière le signale et ne le corrige pas :
              c’est une question à poser au diagnostiqueur.
            </p>
          {/if}
        </div>
      {/if}

      {#if lecture.reserves.length}
        <div class="encart alerte">
          <p class="encart-titre">Ce que la mission n’a pas pu vérifier</p>
          <ul class="puces">
            {#each lecture.reserves as r (r)}
              <li>« {r} »</li>
            {/each}
          </ul>
          <p>
            Autrement dit : le diagnostiqueur a mesuré ce qu’on lui a montré, sans pouvoir
            contrôler que ces pièces sont bien celles du lot vendu.
          </p>
        </div>
      {/if}

      {#if lecture.particularites.etat === 'renseignée'}
        <div class="encart">
          <p class="encart-titre">Particularités liées à ce mesurage</p>
          <ul class="puces">
            {#each lecture.particularites.valeur as t (t)}<li>{t}</li>{/each}
          </ul>
        </div>
      {/if}

      <h3 class="rubrique">Méthode et réglementation</h3>
      <p class="encart-titre">{lecture.intitule || diagnostic.titre}</p>
      {#each diagnostic.explication as paragraphe (paragraphe)}
        <p class="phrase">{paragraphe}</p>
      {/each}
      <dl class="recap">
        {#if lecture.dateVisite}
          <div><dt>Date du repérage</dt><dd>{lecture.dateVisite}</dd></div>
        {/if}
        {#if lecture.dateRapport}
          <div><dt>Date du rapport</dt><dd>{lecture.dateRapport}</dd></div>
        {/if}
      </dl>

      {#if motifsDeConseil.length}
        <div class="conseil">
          <p class="encart-titre">Un professionnel peut vous aider</p>
          <ul class="puces">
            {#each motifsDeConseil as m (m)}<li>{m}</li>{/each}
          </ul>
          <p>
            Un géomètre-expert peut établir un mesurage contradictoire. Verrière ne remplace
            pas l’avis d’un professionnel.
          </p>
        </div>
      {/if}
    {/if}
  </section>
{/if}

<style>
  .mesurage {
    --filet: var(--trait-fin, #dfe6db);
    background: var(--verriere-ivoire, #f7f6f2);
    color: var(--verriere-encre, #0a2b23);
    padding: clamp(1rem, 4vw, 1.75rem);
    border-radius: 1rem;
  }

  .entete {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    margin-bottom: 1.25rem;
  }

  .badge {
    display: grid;
    place-items: center;
    width: 3.25rem;
    height: 3.25rem;
    border-radius: 0.9rem;
    background: var(--vert-800, #12463b);
    color: var(--verriere-ivoire, #f7f6f2);
    flex: none;
  }

  h2 {
    font-family: var(--titre, Georgia, 'Times New Roman', serif);
    font-size: 1.5rem;
    margin: 0;
  }

  .sous-titre {
    margin: 0.15rem 0 0;
    color: var(--encre-doux, #4a5a55);
    font-size: 0.9rem;
  }

  .onglets {
    display: flex;
    gap: 0.25rem;
    border-bottom: 1px solid var(--filet);
    margin-bottom: 1.25rem;
    overflow-x: auto;
  }

  .onglet {
    appearance: none;
    background: none;
    border: 0;
    border-bottom: 2px solid transparent;
    padding: 0.6rem 0.85rem;
    font: inherit;
    font-size: 0.9rem;
    color: var(--encre-doux, #4a5a55);
    cursor: pointer;
    white-space: nowrap;
  }

  .onglet.actif {
    color: var(--vert-800, #12463b);
    border-bottom-color: var(--vert-800, #12463b);
    font-weight: 600;
  }

  .onglet:focus-visible {
    outline: 2px solid var(--vert-800, #12463b);
    outline-offset: 2px;
  }

  .rubrique {
    font-size: 0.78rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--encre-doux, #4a5a55);
    margin: 1.5rem 0 0.75rem;
  }

  .rubrique:first-of-type {
    margin-top: 0;
  }

  .cartes {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
    gap: 0.75rem;
  }

  .carte {
    background: var(--verriere-blanc, #fff);
    border: 1px solid var(--filet);
    border-radius: 0.85rem;
    padding: 0.9rem 1rem;
  }

  .carte.forte {
    border-color: var(--vert-800, #12463b);
  }

  .carte-libelle {
    margin: 0;
    font-size: 0.76rem;
    color: var(--encre-doux, #4a5a55);
    line-height: 1.3;
  }

  .carte-valeur {
    margin: 0.35rem 0 0.2rem;
    font-family: var(--titre, Georgia, serif);
    font-size: 1.6rem;
    color: var(--vert-800, #12463b);
  }

  .carte.forte .carte-valeur {
    color: var(--vert-900, #0a2b23);
  }

  .unite {
    font-size: 0.95rem;
  }

  .carte-ou {
    margin: 0;
    font-size: 0.72rem;
    color: var(--encre-doux, #4a5a55);
    line-height: 1.35;
  }

  /* D'où sort le chiffre — la traçabilité que l'ordre maître exige, en petit :
     elle doit être là sans voler la vedette au chiffre lui-même. */
  .carte-source {
    margin: 0.3rem 0 0;
    font-size: 0.68rem;
    color: var(--encre-doux, #4a5a55);
    opacity: 0.85;
  }

  .phrase {
    margin: 0.9rem 0 0;
    line-height: 1.55;
  }

  .encart,
  .conseil {
    background: var(--verriere-blanc, #fff);
    border: 1px solid var(--filet);
    border-left: 3px solid var(--vert-800, #12463b);
    border-radius: 0.75rem;
    padding: 0.9rem 1rem;
    margin-top: 1.1rem;
  }

  /* Le bord seul ne suffit pas : le titre de l'encart porte l'information. */
  .encart.alerte {
    border-left-color: var(--attention, #8a5a05);
    background: var(--attention-fond, #fdf3e0);
  }

  .conseil {
    background: var(--vert-100, #e6ede4);
  }

  .encart-titre {
    margin: 0 0 0.4rem;
    font-weight: 600;
  }

  .encart p,
  .conseil p {
    margin: 0.35rem 0 0;
    line-height: 1.5;
    font-size: 0.92rem;
  }

  .puces {
    margin: 0.5rem 0 0;
    padding-left: 1.1rem;
    font-size: 0.92rem;
    line-height: 1.5;
  }

  .note,
  .garde-fou,
  .absent {
    margin: 0.9rem 0 0;
    font-size: 0.88rem;
    color: var(--encre-doux, #4a5a55);
    line-height: 1.5;
  }

  .garde-fou {
    border-top: 1px solid var(--filet);
    padding-top: 0.75rem;
  }

  .croquis {
    margin: 0;
  }

  .croquis img {
    width: 100%;
    height: auto;
    border: 1px solid var(--filet);
    border-radius: 0.6rem;
    background: var(--verriere-blanc, #fff);
  }

  .croquis figcaption {
    margin-top: 0.5rem;
    font-size: 0.82rem;
    color: var(--encre-doux, #4a5a55);
    line-height: 1.5;
  }

  /* Le tableau défile dans son propre cadre : la page ne défile jamais en large. */
  .tableau {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    display: block;
    overflow-x: auto;
  }

  .tableau th,
  .tableau td {
    text-align: left;
    padding: 0.5rem 0.6rem;
    border-bottom: 1px solid var(--filet);
    vertical-align: top;
  }

  .tableau thead th {
    font-size: 0.74rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--encre-doux, #4a5a55);
    font-weight: 600;
  }

  .nombre {
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  /* Une pièce écartée se marque par son 0 m² et son fond, jamais par la seule
     couleur : le chiffre porte déjà l'information. */
  .ecartee {
    background: var(--surface, rgb(10 43 35 / 3%));
  }

  .nom-piece {
    appearance: none;
    background: none;
    border: 0;
    padding: 0;
    font: inherit;
    text-align: left;
    color: inherit;
    cursor: pointer;
    /* Cible tactile : l'ordre maître exige un fonctionnement au toucher. */
    min-height: 2.75rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .nom-piece:focus-visible {
    outline: 2px solid var(--vert-800, #12463b);
    outline-offset: 2px;
  }

  .niveau {
    font-size: 0.72rem;
    color: var(--encre-doux, #4a5a55);
    background: var(--surface, rgb(10 43 35 / 3%));
    border-radius: 0.4rem;
    padding: 0.1rem 0.35rem;
  }

  .pastille {
    display: inline-grid;
    place-items: center;
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 50%;
    background: var(--vert-100, #e6ede4);
    color: var(--vert-800, #12463b);
    font-size: 0.7rem;
    font-style: italic;
    font-weight: 700;
  }

  .detail td {
    background: var(--verriere-blanc, #fff);
    font-size: 0.88rem;
    line-height: 1.5;
  }

  .detail p {
    margin: 0 0 0.35rem;
  }

  .source {
    color: var(--encre-doux, #4a5a55);
    font-size: 0.82rem;
  }

  .recap {
    margin: 0;
    display: grid;
    gap: 0.4rem;
  }

  .recap div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.45rem 0;
    border-bottom: 1px solid var(--filet);
  }

  .recap dt {
    color: var(--encre-doux, #4a5a55);
    font-size: 0.9rem;
  }

  .recap dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }
</style>
