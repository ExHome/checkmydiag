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

  const { analyse }: { analyse: Analyse } = $props();

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

  {#each analyse.diagnostics as d (d.type)}
    {@const pratique = enPratique(d.type, d.gravite)}
    <article class="fiche-diag {d.gravite}">
      <header>
        <p class="quoi">{d.titre}</p>
        <h3>{libelleCourt(d)}</h3>
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

  .fiche-diag {
    padding: 26px 0;
    border-top: 1px solid rgb(255 255 255 / 12%);
    break-inside: avoid;
  }

  header {
    border-left: 3px solid var(--gravite, var(--gris));
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
    --gravite: var(--gris);
  }

  .quoi {
    margin: 0 0 4px;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gris);
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
    font-size: 0.97rem;
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
    font-size: 1rem;
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
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gris);
  }

  .chiffres dd {
    margin: 2px 0 0;
    font-size: 1.02rem;
    font-weight: 650;
    color: var(--sur-fond);
  }

  .precision {
    display: block;
    font-size: 0.8rem;
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
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--or);
    margin-bottom: 3px;
  }

  .canevas dd {
    margin: 0;
    font-size: 0.95rem;
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
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--gris);
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
    font-size: 0.9rem;
    line-height: 1.45;
    color: var(--sur-fond-doux);
    opacity: 0.85;
  }

  .reserves li::before {
    content: '—';
    position: absolute;
    left: 0;
    color: var(--gris);
  }
</style>
