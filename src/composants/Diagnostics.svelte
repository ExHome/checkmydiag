<script lang="ts">
  /**
   * Le dossier, diagnostic par diagnostic.
   *
   * Après le point d'ensemble vient le détail : chaque diagnostic reçoit sa
   * fiche, toujours bâtie pareil — ce que le rapport conclut, le dessin qui
   * l'explique, les chiffres relevés, puis pourquoi ce contrôle existe, comment
   * il est fait, ce qu'on risque, ce qu'il faut faire et ce que ça change pour
   * vendre.
   *
   * C'est ce qui permet de tout comprendre sur un seul document imprimé, sans
   * rien avoir à cliquer.
   */
  import type { Analyse, Diagnostic } from '../lib/modele';
  import Explicatif from './schemas/Explicatif.svelte';
  import MotsExpliques from './MotsExpliques.svelte';
  import { libelleCourt } from '../lib/libelle';
  import { enPratique, FICHES } from '../lib/analyse/fiches';
  import { echeance } from '../lib/echeance';

  const { analyse }: { analyse: Analyse } = $props();

  /**
   * Le sommaire.
   *
   * Cette vue fait neuf écrans : sans lui, atteindre le gaz demandait deux mille
   * pixels de défilement à l'aveugle, sans savoir combien il en restait. Il
   * reprend au passage ce que « Le point » disait une seconde fois de son côté —
   * le verdict de chaque rapport et jusqu'à quand il vaut. Dit une fois, à
   * l'endroit où se trouve le détail qu'il annonce.
   */
  const sommaire = $derived(
    analyse.diagnostics.map((d) => ({
      type: d.type,
      titre: d.titre,
      gravite: d.gravite,
      conclusion: libelleCourt(d),
      ...echeance(d)
    }))
  );

  const BLOCS = [
    { cle: 'pourquoi', mot: 'Pourquoi ce diagnostic existe' },
    { cle: 'comment', mot: 'Comment il est fait' },
    { cle: 'risque', mot: 'Ce qu’on risque' },
    { cle: 'quoiFaire', mot: 'Ce qu’il faut faire' },
    { cle: 'vente', mot: 'Ce que ça change pour vendre' }
  ] as const;

  /**
   * Les réserves propres à chaque diagnostic.
   *
   * Chacun a ses angles morts, et ce sont eux qui font les mauvaises surprises :
   * un « aucun indice de termites » ne dit rien du vide sanitaire, un « pas
   * d'amiante » ne vaut que pour les matériaux de la liste contrôlée. Une
   * conclusion rassurante sans sa réserve se lit comme une garantie.
   */
  const RESERVES: Record<string, string[]> = {
    dpe: [
      'Le calcul suppose 19 °C partout et une occupation moyenne : ce n’est pas votre facture.',
      'Une paroi non observée est estimée d’après l’année de construction, pas mesurée.',
      'Le diagnostic ne dit rien de l’état réel de la chaudière ni des menuiseries.'
    ],
    amiante: [
      'Seuls les matériaux des listes réglementaires ont été cherchés.',
      'Le repérage est visuel : rien n’a été percé ni démonté.',
      'Avant travaux ou démolition, un repérage plus poussé reste obligatoire.'
    ],
    plomb: [
      'Seuls les revêtements accessibles ont été mesurés.',
      'Une unité non mesurée reste inconnue, elle n’est pas réputée saine.',
      'Le constat ne porte pas sur les canalisations en plomb.'
    ],
    electricite: [
      'Contrôle visuel, sans démontage du tableau ni des prises.',
      'Six points de sécurité seulement : ce n’est pas un état complet de l’installation.',
      'Les circuits encastrés et les appareils branchés ne sont pas contrôlés.'
    ],
    gaz: [
      'Contrôle des parties visibles et accessibles de l’installation.',
      'Les tuyauteries encastrées ne sont pas contrôlées.',
      'Le diagnostic ne porte pas sur les appareils eux-mêmes au-delà de leur raccordement.'
    ],
    termites: [
      'Recherche visuelle des indices, là où c’était accessible.',
      'Un mur fermé, un vide sanitaire ou un meuble encombrant n’ont pas été contrôlés.',
      'La conclusion ne vaut que six mois : une colonie avance vite.'
    ],
    erp: [
      'C’est une recopie des zonages officiels, pas une visite du terrain.',
      'Personne n’est venu sonder le sol ni mesurer quoi que ce soit.',
      'Les sinistres passés du bien ne figurent que s’ils ont été déclarés.'
    ],
    carrez: [
      'La mesure porte sur les parties privatives, sous 1,80 m de hauteur.',
      'Elle ne comprend ni cave, ni garage, ni balcon, ni terrasse.',
      'Elle diffère de la surface habitable et de celle du DPE : c’est normal.'
    ],
    assainissement: [
      'Le contrôle porte sur ce qui était accessible le jour de la visite.',
      'Les parties enterrées ne sont pas mises au jour.',
      'Un avis favorable ne préjuge pas de la durée de vie de l’installation.'
    ]
  };

  function reservesDe(d: Diagnostic): string[] {
    return (
      RESERVES[d.type] ?? [
        'Le contrôle porte sur ce qui était visible et accessible le jour de la visite.'
      ]
    );
  }

  function isolationDe(d: Diagnostic) {
    return d.schema?.genre === 'dpe' ? d.schema.isolation : null;
  }

  function lettreDe(d: Diagnostic) {
    return d.schema?.genre === 'dpe' ? d.schema.finale : null;
  }
</script>

<section class="diagnostics">
  <p class="eyebrow">Le dossier, diagnostic par diagnostic</p>

  <!-- Ce qu'il y a dans le dossier, et où c'est. Une ligne mène à sa fiche. -->
  <nav class="sommaire" aria-label="Les diagnostics du dossier">
    {#each sommaire as s (s.type)}
      <a class="entree {s.gravite}" href="#diag-{s.type}">
        <span class="nom">{s.titre}</span>
        <span class="verdict-court">{s.conclusion}</span>
        <span class="jusqua" class:perimee={s.perimee}>{s.texte}</span>
      </a>
    {/each}
  </nav>

  {#each analyse.diagnostics as d (d.type)}
    {@const pratique = enPratique(d.type, d.gravite)}
    {@const quand = echeance(d)}
    <article class="fiche-diag {d.gravite}" id="diag-{d.type}">
      <header>
        <p class="quoi">{d.titre}</p>
        <h3>{libelleCourt(d)}</h3>
        <p class="jusqua-fiche" class:perimee={quand.perimee}>{quand.texte}</p>
        <p class="verdict">{d.verdict}</p>
      </header>

      <div class="corps">
        <div class="dessin">
          <Explicatif type={d.type} isolation={isolationDe(d)} lettre={lettreDe(d)} />
        </div>

        <div class="dit">
          {#if pratique}
            <p class="pratique"><MotsExpliques texte={pratique} /></p>
          {/if}

          {#if d.faits.length}
            <dl class="chiffres">
              {#each d.faits.slice(0, 4) as fait (fait.libelle)}
                <div>
                  <dt>{fait.libelle}</dt>
                  <dd>
                    {fait.valeur}
                    {#if fait.precision}<span class="precision">{fait.precision}</span>{/if}
                  </dd>
                </div>
              {/each}
            </dl>
          {/if}

          <dl class="canevas">
            {#each BLOCS as bloc (bloc.cle)}
              <div>
                <dt>{bloc.mot}</dt>
                <dd><MotsExpliques texte={FICHES[d.type][bloc.cle]} /></dd>
              </div>
            {/each}
          </dl>

          <!-- Les réserves : ce que ce diagnostic-là ne couvre pas. Sans elles,
               une conclusion rassurante se lit comme une garantie. -->
          <div class="reserves">
            <p class="titre-reserves">Ce que ce diagnostic ne garantit pas</p>
            <ul>
              {#each reservesDe(d) as reserve}
                <li>{reserve}</li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </article>
  {/each}
</section>

<style>
  .diagnostics {
    margin-bottom: 36px;
  }

  /* Le sommaire : une ligne par rapport, cliquable, avec ce qu'il conclut et
     jusqu'à quand il vaut. C'est tout ce qu'on veut savoir avant de descendre. */
  .sommaire {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2px;
    margin-bottom: var(--e6);
  }

  .entree {
    display: grid;
    gap: 2px;
    align-content: start;
    min-height: 52px;
    padding: var(--e3) var(--e4);
    background: rgb(255 255 255 / 5%);
    border-left: 3px solid var(--gravite, var(--sur-fond-doux));
    text-decoration: none;
    color: var(--sur-fond);
    transition: background 0.18s ease;
  }

  .entree:hover {
    background: rgb(255 255 255 / 11%);
  }

  .entree.bon {
    --gravite: #5fb489;
  }
  .entree.attention {
    --gravite: #d9a03f;
  }
  .entree.alerte {
    --gravite: #d4604a;
  }
  .entree.neutre {
    --gravite: var(--sur-fond-doux);
  }

  .nom {
    font-size: var(--t-micro);
    font-weight: 600;
    letter-spacing: var(--suivi-serre);
    text-transform: uppercase;
    /* Le nom du diagnostic était en 10,9 px sur un gris à 2,96 de contraste :
       l'étiquette de la ligne était le texte le moins lisible de l'écran. */
    color: var(--sur-fond-doux);
  }

  .verdict-court {
    font-family: var(--police-titre);
    font-size: var(--t-lead);
    font-weight: 500;
    letter-spacing: -0.022em;
    color: var(--or-clair);
  }

  .jusqua {
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  /* Un rapport périmé fait repousser une signature : il se voit. */
  .jusqua.perimee,
  .jusqua-fiche.perimee {
    /* Mesuré sur le fond réel de la ligne : #f0907c n'y tenait que 4,39. */
    color: #f8ab9c;
    font-weight: 650;
  }

  .fiche-diag {
    padding: 26px 0;
    border-top: 1px solid rgb(255 255 255 / 12%);
    break-inside: avoid;
    /* La barre des vues est collante : sans cette marge, une ancre déposait le
       titre de la fiche juste derrière elle. */
    scroll-margin-top: 110px;
  }

  .jusqua-fiche {
    margin: 0 0 6px;
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  header {
    border-left: 3px solid var(--gravite, var(--sur-fond-doux));
    padding-left: 16px;
    margin-bottom: 20px;
  }

  .fiche-diag.bon {
    --gravite: #4c9c72;
  }
  .fiche-diag.attention {
    --gravite: #c98a2e;
  }
  .fiche-diag.alerte {
    --gravite: #c0503c;
  }
  .fiche-diag.neutre {
    --gravite: var(--sur-fond-doux);
  }

  .quoi {
    margin: 0 0 4px;
    font-size: var(--t-micro);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  h3 {
    font-family: var(--police-titre);
    font-weight: 500;
    font-size: clamp(1.2rem, 2.6vw, 1.5rem);
    letter-spacing: -0.022em;
    margin: 0 0 6px;
    color: var(--or-clair);
  }

  .verdict {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--sur-fond);
  }

  /* Le dessin d'un côté, ce qu'on en dit de l'autre. */
  .corps {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 30px;
    align-items: start;
  }

  @media (max-width: 860px) {
    .corps {
      grid-template-columns: 1fr;
    }
  }

  .dessin {
    background: var(--papier);
    border-radius: var(--rayon-petit);
    padding: 16px 18px;
    color: var(--encre);
  }

  .pratique {
    margin: 0 0 16px;
    font-style: italic;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--or-clair);
  }

  .chiffres {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0 26px;
    margin: 0 0 18px;
  }

  .chiffres div {
    padding: 8px 0;
    border-bottom: 1px solid rgb(255 255 255 / 10%);
  }

  .chiffres dt {
    font-size: var(--t-micro);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  .chiffres dd {
    margin: 2px 0 0;
    font-size: var(--t-base);
    font-weight: 650;
    color: var(--sur-fond);
  }

  .precision {
    display: block;
    font-size: var(--t-petit);
    font-weight: 400;
    color: var(--sur-fond-doux);
  }

  /* Le canevas : les cinq mêmes questions pour les neuf diagnostics. */
  .canevas {
    margin: 0;
    display: grid;
    gap: 12px;
  }

  .canevas div {
    break-inside: avoid;
  }

  .canevas dt {
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--or);
    margin-bottom: 3px;
  }

  .canevas dd {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.5;
    color: var(--sur-fond-doux);
  }

  /* Les réserves ferment la fiche : c'est la limite de ce qui vient d'être dit. */
  .reserves {
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid rgb(255 255 255 / 12%);
    break-inside: avoid;
  }

  .titre-reserves {
    margin: 0 0 7px;
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  .reserves ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 4px;
  }

  .reserves li {
    position: relative;
    padding-left: 16px;
    font-size: var(--t-base);
    line-height: 1.45;
    color: var(--sur-fond-doux);
  }

  .reserves li::before {
    content: '—';
    position: absolute;
    left: 0;
    color: var(--sur-fond-doux);
  }
</style>
