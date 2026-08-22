<script lang="ts">
  /**
   * LES PAROIS ET LES FENÊTRES — chacune avec son état, jamais une moyenne.
   *
   * ═══════════════════════════════════════════════════════════════════════════
   * LA RÈGLE QUI COMMANDE CET ÉCRAN
   * ═══════════════════════════════════════════════════════════════════════════
   *
   * « Ne jamais résumer plusieurs murs différents par "murs isolés". » Sur les
   * vingt-six logements lus, **seize ont des murs d'états différents** : le mot
   * unique y mentait, une fois sur deux et davantage.
   *
   * De même pour les fenêtres : si huit baies sont en double vitrage et qu'une
   * neuvième est en simple, l'écran affiche « présence de simple vitrage ». Le
   * corpus compte vingt baies en simple vitrage — chacune disparaissait dans le
   * résumé du rapport, et donc du nôtre.
   *
   * ── Trois états, et le mot du rapport à côté ───────────────────────────────
   *
   * Isolé / non isolé / inconnu. « Inconnu » n'est pas une demi-mesure prudente :
   * c'est ce que le rapport dit, et cela veut dire qu'on ne saura pas sans
   * ouvrir la paroi. Le mot exact du diagnostiqueur reste affiché — « inconnue »,
   * « forte présomption », « oui (observation indirecte) » — parce qu'une
   * présomption n'est pas un constat et que l'écran ne doit pas les confondre.
   *
   * ── L'origine de la donnée ─────────────────────────────────────────────────
   *
   * Quand une valeur est marquée « Valeur par défaut » dans la fiche technique,
   * elle a été supposée par le logiciel, pas constatée sur place. Une année
   * d'isolation par défaut n'est pas une année d'isolation. On le signale là où
   * ça se joue, et nulle part ailleurs, pour que le signal garde son sens.
   */
  import { compterIsolation, type Baie, type Enveloppe, type Paroi } from '../../lib/analyse/enveloppe';

  const { enveloppe }: { enveloppe: Enveloppe } = $props();

  const murs = $derived(enveloppe.parois.filter((p) => p.famille === 'mur'));
  const plafonds = $derived(enveloppe.parois.filter((p) => p.famille === 'plancherHaut'));
  const planchers = $derived(enveloppe.parois.filter((p) => p.famille === 'plancherBas'));

  const ETATS = {
    isole: { mot: 'isolé', classe: 'manteau' },
    nonIsole: { mot: 'non isolé', classe: 'nu' },
    inconnu: { mot: 'inconnu', classe: 'doute' }
  } as const;

  /** « quatre isolés, deux non isolés, un inconnu » — jamais « murs isolés ». */
  function resume(parois: Paroi[]): string {
    if (parois.length === 0) return 'Le rapport n’en décrit aucun.';
    const c = compterIsolation(parois);
    const bouts: string[] = [];
    if (c.isole) bouts.push(`${c.isole} isolé${c.isole > 1 ? 's' : ''}`);
    if (c.nonIsole) bouts.push(`${c.nonIsole} non isolé${c.nonIsole > 1 ? 's' : ''}`);
    if (c.inconnu) bouts.push(`${c.inconnu} dont le rapport ne dit rien`);
    return bouts.join(', ');
  }

  const VERDICTS = {
    toutPerformant: {
      signe: '✓',
      classe: 'bon',
      phrase: 'Toutes les fenêtres décrites sont en double ou triple vitrage.'
    },
    heterogene: {
      signe: '⚠',
      classe: 'attention',
      phrase:
        'Le rapport ne précise pas le vitrage de toutes les fenêtres : la performance n’est pas garantie partout.'
    },
    simpleVitrage: {
      signe: '⚠',
      classe: 'alerte',
      phrase:
        'Au moins une fenêtre est en simple vitrage. C’est le poste le plus déperditif du logement, et il ne disparaît pas dans la moyenne des autres.'
    },
    insuffisant: {
      signe: '?',
      classe: 'muet',
      phrase: 'Le rapport ne précise le vitrage d’aucune fenêtre.'
    }
  } as const;

  const verdict = $derived(VERDICTS[enveloppe.vitrages.verdict]);

  function detailsBaie(b: Baie): string[] {
    return [b.menuiserie, b.vitrageDit, b.lameAir ? `lame ${b.lameAir}` : null, b.volets, b.ouverture]
      .filter((x): x is string => Boolean(x));
  }
</script>

{#if !enveloppe.presente}
  <section class="parois">
    <h2>Comment votre logement est construit</h2>
    <p class="rien">
      La fiche technique du logement — l’annexe qui décrit chaque paroi et chaque
      fenêtre — n’a pas pu être lue dans ce rapport. Rien n’est affiché ici plutôt
      qu’un bâtiment approximatif.
    </p>
  </section>
{:else}
  <section class="parois" aria-labelledby="titre-parois">
    <h2 id="titre-parois">Comment votre logement est construit</h2>

    {#each [{ cle: 'murs', titre: 'Les murs', liste: murs }, { cle: 'plafond', titre: 'Le plafond, la toiture', liste: plafonds }, { cle: 'plancher', titre: 'Le plancher bas', liste: planchers }] as famille (famille.cle)}
      <article class="famille">
        <header>
          <h3>{famille.titre}</h3>
          <p class="resume">{resume(famille.liste)}</p>
        </header>

        {#if famille.liste.length > 0}
          <ul>
            {#each famille.liste as paroi, i (paroi.nom ?? i)}
              {@const etat = ETATS[paroi.isolation]}
              <li>
                <span class="pastille {etat.classe}" aria-hidden="true"></span>
                <div class="corps">
                  <b>{paroi.nom ?? 'Une paroi que le rapport ne nomme pas'}</b>
                  <span class="etat {etat.classe}">{etat.mot}</span>
                  {#if paroi.isolationDite && paroi.isolationDite.toLowerCase() !== 'oui' && paroi.isolationDite.toLowerCase() !== 'non'}
                    <span class="mot">le rapport écrit : « {paroi.isolationDite} »</span>
                  {/if}
                  <p class="attributs">
                    {#if paroi.surface}<span>{paroi.surface.toLocaleString('fr-FR')} m²</span>{/if}
                    {#if paroi.materiau}<span>{paroi.materiau}</span>{/if}
                    {#if paroi.epaisseur}<span>{paroi.epaisseur}</span>{/if}
                    {#if paroi.epaisseurIsolant}<span>isolant {paroi.epaisseurIsolant}</span>{/if}
                    {#if paroi.adjacence}<span>donne sur {paroi.adjacence}</span>{/if}
                  </p>
                  {#if paroi.anneeIsolation?.origine === 'défaut'}
                    <p class="suppose">
                      Année d’isolation : {paroi.anneeIsolation.valeur} — <b>supposée</b> par
                      le logiciel, pas constatée sur place.
                    </p>
                  {/if}
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </article>
    {/each}

    <article class="famille">
      <header>
        <h3>Les fenêtres</h3>
        <p class="verdict {verdict.classe}">
          <span aria-hidden="true">{verdict.signe}</span>
          {verdict.phrase}
        </p>
        <p class="resume">
          {enveloppe.vitrages.double + enveloppe.vitrages.triple} en double ou triple vitrage,
          {enveloppe.vitrages.simple} en simple vitrage{#if enveloppe.vitrages.inconnu},
            {enveloppe.vitrages.inconnu} dont le rapport ne dit rien{/if}.
        </p>
      </header>

      {#if enveloppe.baies.length > 0}
        <ul>
          {#each enveloppe.baies as baie, i (baie.nom ?? i)}
            <li>
              <span
                class="pastille {baie.vitrage === 'simple'
                  ? 'nu'
                  : baie.vitrage
                    ? 'manteau'
                    : 'doute'}"
                aria-hidden="true"
              ></span>
              <div class="corps">
                <b>{baie.nom ?? 'Une baie que le rapport ne nomme pas'}</b>
                {#if baie.vitrage === 'simple'}
                  <span class="etat nu">simple vitrage</span>
                {/if}
                <p class="attributs">
                  {#if baie.surface}<span>{baie.surface.toLocaleString('fr-FR')} m²</span>{/if}
                  {#if baie.orientation}<span>{baie.orientation}</span>{/if}
                  {#each detailsBaie(baie) as d (d)}<span>{d}</span>{/each}
                  {#if baie.u}<span>U = {baie.u}</span>{/if}
                  {#if baie.placement}<span>sur {baie.placement}</span>{/if}
                </p>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </article>

    {#if enveloppe.valeursParDefaut > 0}
      <p class="defauts">
        Dans ce rapport, <b
          >{enveloppe.valeursParDefaut} valeur{enveloppe.valeursParDefaut > 1 ? 's' : ''}</b
        >
        {enveloppe.valeursParDefaut > 1 ? 'sont marquées' : 'est marquée'}
        « valeur par défaut » : le logiciel {enveloppe.valeursParDefaut > 1
          ? 'les a supposées'
          : "l’a supposée"} faute d’avoir pu {enveloppe.valeursParDefaut > 1
          ? 'les constater'
          : 'la constater'}. C’est normal et fréquent — mais ce ne sont pas des mesures.
      </p>
    {/if}
  </section>
{/if}

<style>
  .parois {
    display: grid;
    gap: 1.1rem;
  }

  h2 {
    margin: 0;
    font-size: 1.05rem;
    color: var(--encre, #0a2b23);
  }

  h3 {
    margin: 0;
    font-size: 0.92rem;
    color: var(--encre, #0a2b23);
  }

  .famille {
    display: grid;
    gap: 0.55rem;
    padding: 0.85rem 0.95rem;
    border: 1px solid var(--verriere-sable-filet, #d8c199);
    border-radius: 8px;
    background: var(--papier, #fff);
  }

  .famille header {
    display: grid;
    gap: 0.3rem;
  }

  .resume,
  .rien {
    margin: 0;
    font-size: 0.83rem;
    color: var(--encre-doux, #4a5a55);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.55rem;
  }

  li {
    display: flex;
    gap: 0.55rem;
    padding-top: 0.55rem;
    border-top: 1px solid var(--surface, rgb(10 43 35 / 3%));
  }

  .corps {
    display: grid;
    gap: 0.15rem;
    min-width: 0;
  }

  .corps b {
    font-size: 0.85rem;
    color: var(--encre, #0a2b23);
  }

  .pastille {
    flex: none;
    width: 0.7rem;
    height: 0.7rem;
    margin-top: 0.25rem;
    border-radius: 2px;
  }

  .pastille.nu {
    background: #c05621;
  }

  .pastille.manteau {
    background: var(--vert-verriere, #12463b);
  }

  .pastille.doute {
    background: repeating-linear-gradient(
      135deg,
      var(--encre-doux, #4a5a55) 0 2px,
      var(--papier-doux, #f7f6f2) 2px 6px
    );
  }

  .etat {
    font-size: 0.75rem;
    font-weight: 600;
  }

  .etat.nu {
    color: #c05621;
  }

  .etat.manteau {
    color: var(--vert-verriere, #12463b);
  }

  .etat.doute {
    color: var(--encre-doux, #4a5a55);
  }

  .mot {
    font-size: 0.75rem;
    font-style: italic;
    color: var(--encre-doux, #4a5a55);
  }

  .attributs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin: 0.15rem 0 0;
  }

  .attributs span {
    padding: 0.05rem 0.4rem;
    border-radius: 999px;
    background: var(--surface, rgb(10 43 35 / 3%));
    font-size: 0.72rem;
    color: var(--encre-doux, #4a5a55);
  }

  .suppose {
    margin: 0.2rem 0 0;
    font-size: 0.75rem;
    color: var(--verriere-sable-encre, #896c33);
  }

  .verdict {
    display: flex;
    gap: 0.4rem;
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.45;
  }

  .verdict.bon {
    color: var(--vert-verriere, #12463b);
  }

  .verdict.alerte {
    color: #c05621;
    font-weight: 600;
  }

  .verdict.attention,
  .verdict.muet {
    color: var(--encre-doux, #4a5a55);
  }

  .defauts {
    margin: 0;
    padding: 0.65rem 0.85rem;
    border-left: 3px solid var(--verriere-sable-or, #c8a96b);
    background: var(--verriere-sable-voile, rgb(200 169 107 / 16%));
    border-radius: 0 6px 6px 0;
    font-size: 0.8rem;
    line-height: 1.5;
    color: var(--encre, #0a2b23);
  }
</style>
