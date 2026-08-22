<script lang="ts">
  /**
   * Toutes les anomalies, une par une — l'écran du §29 de l'ordre de mission.
   *
   * Le produit disait « des anomalies : 4 points relevés » et s'arrêtait là. Le
   * lecteur savait combien, jamais lesquelles, ni où. Ici chaque anomalie est
   * une carte, avec ce que le rapport écrit et rien de plus.
   *
   * Trois règles de l'ordre commandent la rédaction de cette carte, et elles
   * portent toutes sur ce qu'on n'a PAS le droit d'écrire :
   *
   *  · §2 — un silence du rapport s'affiche comme un silence. « Localisation
   *    non précisée » n'est pas « aucune localisation ».
   *  · §9 — « Au moins un socle » ne devient jamais « le socle ». La formule
   *    du rapport est reprise telle quelle, et son étendue est dite.
   *  · §12 et §15 — une mesure compensatoire ne supprime pas l'anomalie. Son
   *    absence dans le rapport ne vaut pas « aucune mesure ».
   */
  import type { Anomalie } from '../lib/modele';
  import MotsExpliques from './MotsExpliques.svelte';
  import { enClair } from '../lib/analyse/anomalies-en-clair';

  const { anomalies }: { anomalies: Anomalie[] } = $props();

  /** Ce que la pluralité du rapport dit de l'étendue, dans ses mots. */
  const ETENDUE: Record<Anomalie['pluralite'], string | null> = {
    /* « un » : le rapport désigne un élément précis, pas un exemplaire parmi
       d'autres. La nuance vaut d'être dite — elle borne l'étendue. */
    un: 'Un élément précisément désigné par le rapport',
    auMoinsUn: 'Au moins un élément concerné selon le rapport',
    ensemble: 'L’ensemble des éléments concernés selon le rapport',
    inconnue: null
  };

  /**
   * Ce que le rapport ne dit pas de cette anomalie-là.
   *
   * Rassemblé en une ligne plutôt qu'en trois rubriques vides. Un silence reste
   * un silence — le § 2 interdit de le transformer en « aucun » — mais trois
   * silences alignés donnent l'impression d'une fiche vide au lieu d'une
   * information.
   */
  function silences(a: Anomalie): string[] {
    const manque: string[] = [];
    if (!a.localisations.length) manque.push('où');
    if (!a.mesureCompensatoire) manque.push('s’il existe une mesure compensatoire');
    if (!a.geste) manque.push('ce qu’il faut faire');
    return manque;
  }

  /** Une carte ouverte à la fois : on lit une anomalie, pas un mur. */
  let ouverte = $state<number | null>(null);
  /** L'aide ouverte, s'il y en a une. Elle se demande, elle ne s'impose pas. */
  let aide = $state<number | null>(null);
</script>

<section class="anomalies" aria-label="Toutes les anomalies relevées">
  <p class="compte">
    {anomalies.length}
    {anomalies.length > 1 ? 'anomalies relevées' : 'anomalie relevée'}
    <span class="fidelite">
      {anomalies.length > 1 ? 'telles que le rapport les écrit' : 'telle que le rapport l’écrit'}
    </span>
  </p>

  <ul>
    {#each anomalies as a, i (a.libelle + i)}
      <li class:ouverte={ouverte === i}>
        <button
          type="button"
          class="tete"
          aria-expanded={ouverte === i}
          onclick={() => (ouverte = ouverte === i ? null : i)}
        >
          <span class="rang">{i + 1}</span>
          <span class="dit">
            <span class="libelle">{a.libelle}</span>
            <span class="sous">
              {#if a.domaine}<span class="famille">{a.domaine.nom}</span>{/if}
              {#if a.localisations.length}
                <span class="ou">{a.localisations.join(' · ')}</span>
              {:else}
                <span class="muet">Localisation non précisée dans le rapport</span>
              {/if}
            </span>
          </span>
          <span class="signe" aria-hidden="true">{ouverte === i ? '−' : '+'}</span>
        </button>

        <!--
          L'AIDE SE DEMANDE, ELLE NE S'IMPOSE PAS.

          La phrase du rapport reste au premier plan, entière et non modifiée :
          c'est elle qui fait foi. Mais « l'enveloppe d'au moins un matériel est
          détériorée » ne veut rien dire à qui n'est pas électricien, et le § 3
          du pack demande les deux niveaux de lecture.

          Le bouton n'apparaît que si l'on sait vraiment traduire ce libellé-là.
          Pas d'aide vaut mieux qu'une aide approximative.
        -->
        {#if enClair(a.libelle)}
          <button
            type="button"
            class="aide-bouton"
            aria-expanded={aide === i}
            onclick={() => (aide = aide === i ? null : i)}
          >
            <span class="point" aria-hidden="true">?</span>
            {aide === i ? 'Masquer l’explication' : 'Qu’est-ce que ça veut dire ?'}
          </button>

          {#if aide === i}
            <p class="aide-texte apparait">{enClair(a.libelle)}</p>
          {/if}
        {/if}

        {#if ouverte === i}
          <dl class="detail apparait">
            <!--
              LA PÉDAGOGIE VIENT DES MOTS, PAS D'UNE PLUME INVENTÉE.

              Le §29 demande « qu'est-ce que cela signifie ? ». Écrire une
              explication par anomalie reviendrait à inventer un commentaire que
              le rapport ne porte pas — ce que le §24 et le §40 interdisent.

              Mais les mots, eux, ont déjà leur définition validée : « dispositif
              différentiel », « mise à la terre », « liaison équipotentielle »
              vivent dans le lexique du produit. On les rend explicables SUR
              PLACE, dans la phrase même du rapport, qui n'est pas modifiée d'un
              caractère : elle est seulement soulignée là où un mot se définit.
            -->
            <!--
              LA PHRASE DU RAPPORT N'EST PAS DITE DEUX FOIS.

              Elle était en tête de carte, puis répétée sous « Ce que dit le
              rapport » : on dépliait pour découvrir la ligne qu'on venait de
              lire. Le détail ne redit rien ; il n'ajoute que ce que la tête ne
              porte pas.
            -->
            {#if a.localisations.length}
              <dt>Où</dt>
              <dd>
                <ul class="lieux">
                  {#each a.localisations as lieu (lieu)}
                    <li>{lieu}</li>
                  {/each}
                </ul>
              </dd>
            {/if}

            {#if ETENDUE[a.pluralite]}
              <dt>Combien</dt>
              <dd>
                {ETENDUE[a.pluralite]}
                <span class="muet">
                  — la localisation d’une anomalie n’est pas exhaustive : d’autres
                  éléments peuvent être concernés.
                </span>
              </dd>
            {/if}

            {#if a.mesureCompensatoire}
              <dt>Mesure compensatoire</dt>
              <dd>
                {a.mesureCompensatoire.libelle}
                <span class="muet">
                  — elle limite le risque, elle ne fait pas disparaître l’anomalie.
                </span>
              </dd>
            {/if}

            {#if a.geste}
              <dt>Ce que le rapport demande</dt>
              <dd><MotsExpliques texte={a.geste} /></dd>
            {/if}

            <!--
              CE QUE LE RAPPORT NE DIT PAS, EN UNE LIGNE.

              Trois rubriques pleines annonçaient chacune un silence — « non
              précisée », « ne précise pas où », « non précisée par le rapport ».
              La carte se lisait comme un constat de vide. Les silences se
              disent, mais ensemble et une fois : ce qui manque est une
              information, pas trois.
            -->
            {#if silences(a).length}
              <dt>Ce que le rapport ne précise pas</dt>
              <dd class="muet">{silences(a).join(' · ')}</dd>
            {/if}

            {#if a.code}
              <dt>Référence</dt>
              <dd class="code">
                {a.code}
                <span class="muet">
                  — le numéro du point de contrôle dans la norme NF C 16-600, celui
                  qu’un électricien reconnaîtra.
                </span>
              </dd>
            {/if}
          </dl>
        {/if}
      </li>
    {/each}
  </ul>
</section>

<style>
  /*
   * Le jaune de l'électricité (§41) : une couleur d'identification, posée en
   * filet et en chiffre. Pas un panneau de danger — c'est le rapport qui dit la
   * gravité, pas l'interface.
   */
  .anomalies {
    --elec: #d9a03f;
    margin-top: var(--e5);
  }

  .compte {
    display: flex;
    align-items: baseline;
    gap: var(--e3);
    margin: 0 0 var(--e3);
    font-size: var(--t-petit);
    font-weight: 700;
    letter-spacing: var(--suivi-serre);
    text-transform: uppercase;
    color: var(--elec);
  }

  .fidelite {
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
    color: var(--sur-fond-doux);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 2px;
  }

  .tete {
    display: flex;
    align-items: flex-start;
    gap: var(--e3);
    width: 100%;
    min-height: 52px;
    text-align: left;
    background: rgb(255 255 255 / 5%);
    border: none;
    border-left: 3px solid var(--elec);
    padding: var(--e3) var(--e4);
    color: var(--sur-fond);
    cursor: pointer;
    transition: background 0.18s ease;
  }

  .tete:hover,
  li.ouverte .tete {
    background: rgb(255 255 255 / 10%);
  }

  /* Le numéro : c'est lui qui dit « une par une ». */
  .rang {
    flex: none;
    min-width: 1.6em;
    font-family: var(--mono);
    font-size: var(--t-petit);
    color: var(--elec);
    padding-top: 2px;
  }

  .dit {
    flex: 1;
    display: grid;
    gap: 3px;
  }

  .libelle {
    font-size: var(--t-base);
    font-weight: 600;
    line-height: 1.4;
  }

  .sous {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e2) var(--e3);
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  .famille {
    color: var(--elec);
  }

  .ou::before {
    content: '📍 ';
  }

  .signe {
    flex: none;
    font-family: var(--mono);
    font-size: 1.1rem;
    color: var(--elec);
  }

  /*
   * Le bouton d'aide : petit, discret, sous la ligne — il propose, il n'attire
   * pas. Le jaune de l'électricité le rattache à sa micro-application.
   */
  .aide-bouton {
    display: inline-flex;
    align-items: center;
    gap: var(--e2);
    margin: 2px 0 0 calc(var(--e4) + 1.6em + var(--e3));
    padding: var(--e2) 0;
    background: none;
    border: none;
    color: var(--elec);
    font-size: var(--t-petit);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .point {
    display: inline-grid;
    place-items: center;
    width: 17px;
    height: 17px;
    border: 1px solid var(--elec);
    border-radius: 50%;
    font-size: 0.7rem;
    font-weight: 700;
    text-decoration: none;
  }

  .aide-texte {
    margin: 0 var(--e4) var(--e3) calc(var(--e4) + 1.6em + var(--e3));
    padding-left: var(--e3);
    border-left: 2px solid var(--elec);
    font-size: var(--t-base);
    line-height: 1.55;
    color: var(--sur-fond-doux);
    max-width: var(--mesure);
  }

  .detail {
    margin: 0;
    padding: var(--e4) var(--e4) var(--e4) calc(var(--e4) + 1.6em + var(--e3));
    background: rgb(255 255 255 / 3%);
    display: grid;
    gap: var(--e1) 0;
  }

  dt {
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    color: var(--elec);
    margin-top: var(--e3);
  }

  dt:first-child {
    margin-top: 0;
  }

  dd {
    margin: 0;
    font-size: var(--t-base);
    line-height: 1.55;
    color: var(--sur-fond);
    max-width: var(--mesure);
  }

  /* La phrase du rapport, cited telle quelle : elle ne se reformule pas. */
  .source {
    font-style: italic;
    color: var(--sur-fond-doux);
  }

  .code {
    font-family: var(--mono);
    font-size: var(--t-petit);
    color: var(--sur-fond-doux);
  }

  .lieux {
    display: grid;
    gap: 2px;
  }

  .lieux li {
    padding-left: 14px;
    position: relative;
  }

  .lieux li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.6em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--elec);
  }

  /* Ce que le rapport ne dit pas se voit, sans crier. */
  .muet {
    color: var(--sur-fond-doux);
    font-style: italic;
  }

  @media print {
    .detail {
      display: grid !important;
      background: none !important;
    }

    .tete {
      background: none !important;
      border-left-color: #999 !important;
    }

    .signe {
      display: none;
    }

    dt {
      color: #093f30 !important;
    }

    dd,
    .libelle {
      color: #1e2e28 !important;
    }
  }
</style>
