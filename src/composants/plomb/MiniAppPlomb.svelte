<script lang="ts">
  /**
   * LA MINI-APP PLOMB (CREP).
   *
   * ⚠️ IL N'EXISTE AUCUN VISUEL DE RÉFÉRENCE POUR LE PLOMB.
   *
   * Cinq packs Verrière portent un visuel — amiante, DPE, électricité, gaz,
   * termites. Le plomb n'en a pas. Cet écran est donc bâti sur la MATRICE
   * COMMUNE de ces cinq packs, qui posent tous la même architecture et ne
   * changent que la couleur d'accent. Rien n'y est inventé de la main :
   * chaque bloc a son équivalent nommé dans les packs existants.
   *
   *   en-tête          pictogramme, nom du diagnostic en serif, sous-titre
   *   points clés      cartes blanches, pastille à gauche, chevron à droite
   *   résultat global  carte teintée, sceau à gauche, verdict en serif
   *   le détail        le bloc propre à chaque diagnostic — ici les unités
   *   non contrôlé     triangle d'attention, statut aligné à droite
   *   conseil          carte crème, feuille
   *   onglets          Synthèse · Détails · Photos · Conseils
   *
   * Le jour où un pack plomb arrive, c'est lui qui fait foi et cet écran s'y
   * conforme. En attendant, il ne prétend pas le reproduire.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * CE QUE CET ÉCRAN REFUSE D'AFFICHER
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Les maquettes des autres packs portent un « NIVEAU DE RISQUE : TRÈS
   * FAIBLE » et un « 90 % de confiance ». Ce sont des valeurs fictives —
   * leur README le dit, et les ordres de mission les interdisent nommément.
   * Aucun CREP ne qualifie un risque ni ne mesure une confiance. Les places
   * ne sont donc pas remplies au jugé : elles n'existent pas.
   *
   * ── LA COULEUR EST UN RENFORT, JAMAIS LE SEUL CANAL ──────────────────
   *
   * Chaque pastille porte son PICTOGRAMME, chaque classe son NUMÉRO et son
   * MOT. Un lecteur qui ne distingue pas le vert de l'ambre lit la même
   * chose que les autres.
   */
  import type { Diagnostic } from '../../lib/modele';
  import { synthesePlomb } from './synthese';

  interface Props {
    diagnostic: Diagnostic;
    surVoirDansLeRapport?: (page: number) => void;
  }

  const { diagnostic, surVoirDansLeRapport }: Props = $props();
  const s = $derived(synthesePlomb(diagnostic));

  let locauxOuverts = $state(true);

  /** Le pictogramme du ton — premier canal, jamais la couleur seule. */
  const picto = (ton: string): string =>
    ton === 'alerte' ? '!' : ton === 'attention' ? '?' : '✓';

  /**
   * LES QUATRE CLASSES, DANS LES MOTS DE L'ARRÊTÉ DU 19 AOÛT 2011.
   *
   * ⚠️ Ce ne sont pas des étiquettes de gravité inventées : ce sont les
   * définitions réglementaires. La classe 1 n'est pas « un peu de plomb » —
   * c'est du plomb sur un revêtement non dégradé, ce qui n'expose personne
   * tant qu'il le reste.
   */
  const CLASSES = [
    { n: 0, nom: 'Classe 0', quoi: 'Sous le seuil : pas de plomb détecté.' },
    { n: 1, nom: 'Classe 1', quoi: 'Plomb présent, revêtement non dégradé.' },
    { n: 2, nom: 'Classe 2', quoi: 'Plomb présent, revêtement en état d’usage.' },
    { n: 3, nom: 'Classe 3', quoi: 'Plomb présent et revêtement DÉGRADÉ.' }
  ] as const;
</script>

<div class="app">
  <!-- L'EN-TÊTE, sur la forme commune aux cinq packs. -->
  <header class="entete">
    <svg class="signe" viewBox="0 0 32 32" aria-hidden="true">
      <!-- Un pot de peinture écaillée : ce que le CREP mesure vraiment. -->
      <path class="trait" d="M7 11h18v14a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V11Z" />
      <path class="trait" d="M7 11c0-2.2 4-4 9-4s9 1.8 9 4" />
      <path class="ecaille" d="M12 17c1.6-1.4 3.2-1.4 4.8 0 1.6 1.4 3.2 1.4 4.8 0" />
      <path class="ecaille" d="M12 22c1.6-1.4 3.2-1.4 4.8 0 1.6 1.4 3.2 1.4 4.8 0" />
    </svg>
    <h1>Plomb</h1>
    <p class="sous-titre">Synthèse du diagnostic</p>
  </header>

  <!-- 1 · POINTS CLÉS -->
  {#if s.pointsCles.length}
    <h2 class="titre-section">Points clés</h2>
    <ul class="cles">
      {#each s.pointsCles as p (p.titre)}
        <li class="cle t-{p.ton}">
          <span class="pastille" aria-hidden="true">{picto(p.ton)}</span>
          <span class="texte-cle">
            <b>{p.titre}</b>
            <span class="detail">{p.detail}</span>
          </span>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- 2 · RÉSULTAT GLOBAL -->
  {#if s.resultat}
    <section class="resultat" aria-labelledby="pb-res">
      <h2 id="pb-res" class="titre-section dans-carte">Résultat global</h2>
      <div class="resultat-corps">
        <div class="sceau" aria-hidden="true">
          <svg viewBox="0 0 96 96">
            <circle class="anneau-fond" cx="48" cy="48" r="42" />
            <circle class="anneau-trait" cx="48" cy="48" r="42" />
            <path
              class="bouclier"
              d="M48 22c7 4 13 5.5 19 5.8v20c0 12.6-8 21-19 26-11-5-19-13.4-19-26v-20c6-.3 12-1.8 19-5.8Z"
            />
            {#if s.issue === 'plombPresent'}
              <path class="signe-fort" d="M48 38v16M48 62v1.5" />
            {:else}
              <path class="signe-fort" d="m40 47.5 6 6 12-12.5" />
            {/if}
          </svg>
        </div>
        <div class="resultat-mots">
          <p class="phrase">{s.resultat}</p>
          <!--
            ⚠️ Ici, les maquettes des autres packs écrivent « NIVEAU DE RISQUE ».
            Un CREP n'en qualifie aucun. La portée du constat prend cette place,
            parce qu'elle, le rapport l'établit.
          -->
          <p class="etiquette">Ce que le constat couvre</p>
          <p class="portee">Les revêtements accessibles, mesurés un par un</p>
        </div>
      </div>
    </section>
  {/if}

  <!--
    ⚠️ 3 · LE CONTRÔLE DU § 41, AVANT LES CHIFFRES ET NON APRÈS.

    Quand la somme des effectifs ne retombe pas sur le total annoncé, le lecteur
    doit le savoir AVANT de lire le tableau, pas en note de bas de page.
  -->
  {#if s.discordance}
    <p class="discordance">
      <span class="triangle" aria-hidden="true">△</span>
      <span>{s.discordance}</span>
    </p>
  {/if}

  <!--
    4 · LES UNITÉS DE DIAGNOSTIC — le bloc propre au plomb.

    ⚠️ TROIS ÉTATS, JAMAIS DEUX. Les non mesurées ont leur ligne, séparée des
    quatre classes : le § 17 interdit de les fondre dans la classe 0.
  -->
  {#if s.effectifs}
    <section class="carte unites" aria-labelledby="pb-ud">
      <p class="titre-avec-signe">
        <span id="pb-ud" class="titre-section dans-carte">Les unités de diagnostic</span>
        <span class="total">{s.effectifs.total} au total</span>
      </p>

      <ul class="classes">
        {#each CLASSES as c (c.n)}
          {@const combien = s.effectifs.classes[c.n]}
          {#if combien > 0}
            <li class="classe c-{c.n}">
              <span class="numero" aria-hidden="true">{c.n}</span>
              <span class="quoi">
                <b>{c.nom}</b>
                <span class="detail">{c.quoi}</span>
              </span>
              <span class="compte">{combien}</span>
            </li>
          {/if}
        {/each}

        <!--
          ⚠️ LA LIGNE QUI NE DOIT JAMAIS DISPARAÎTRE. Une unité non mesurée
          n'est pas une unité conforme : c'est une unité dont on ne sait rien.
        -->
        {#if s.effectifs.nonMesurees > 0}
          <li class="classe non-mesuree">
            <span class="numero" aria-hidden="true">—</span>
            <span class="quoi">
              <b>Non mesurées</b>
              <span class="detail">
                Le diagnostiqueur n’a pas pu les mesurer. Le rapport ne conclut rien sur elles.
              </span>
            </span>
            <span class="compte">{s.effectifs.nonMesurees}</span>
          </li>
        {/if}
      </ul>
    </section>
  {/if}

  <!-- 5 · LES LOCAUX, ET LE SEUIL DES 50 % -->
  {#if s.locaux.montrer}
    <section class="carte locaux" aria-labelledby="pb-loc">
      <button
        class="entete-repli"
        type="button"
        aria-expanded={locauxOuverts}
        onclick={() => (locauxOuverts = !locauxOuverts)}
      >
        <span id="pb-loc" class="titre-section dans-carte">Pièce par pièce</span>
        <span class="chevron-repli" class:ouvert={locauxOuverts} aria-hidden="true">⌄</span>
      </button>
      {#if locauxOuverts}
        <ul class="liste-locaux">
          {#each s.locaux.entrees as l (l.local)}
            <li class:seuil={l.seuilAtteint}>
              <span class="nom-local">{l.local}</span>
              <span class="chiffres">
                {l.classe3} sur {l.unites}
                {#if l.seuilAtteint}<em class="marque">seuil des 50 % atteint</em>{/if}
              </span>
            </li>
          {/each}
        </ul>
        <p class="mention">
          Le nombre affiché est celui des unités de classe 3 — plomb présent et revêtement dégradé.
        </p>
      {/if}
    </section>
  {/if}

  <!-- 6 · LES DEUX CRITÈRES RÉGLEMENTAIRES -->
  {#if s.criteres && (s.criteres.critereLocal || s.criteres.critereGlobal)}
    <section class="carte alerte-ars" aria-labelledby="pb-ars">
      <p class="titre-avec-signe">
        <span class="triangle" aria-hidden="true">△</span>
        <span id="pb-ars" class="titre-section dans-carte">Seuil de signalement</span>
      </p>
      {#if s.criteres.critereLocal}
        <p class="ligne">Au moins un local compte 50 % ou plus d’unités de classe 3.</p>
      {/if}
      {#if s.criteres.critereGlobal}
        <p class="ligne">L’ensemble du logement atteint 20 % d’unités de classe 3.</p>
      {/if}
      <p class="mention">
        Dans ce cas, le diagnostiqueur transmet le constat à l’agence régionale de santé. Ce n’est ni
        une sanction, ni une interdiction de vendre.
      </p>
    </section>
  {/if}

  <!--
    ⚠️ 7 · LES ÉCARTS DE POURCENTAGE — signalés, jamais arbitrés.
    Le § 26 impose de recalculer sur les effectifs. Quand le recalcul et le
    pourcentage imprimé divergent, on montre les deux.
  -->
  {#if s.criteres?.ecarts.length}
    <section class="carte ecarts" aria-labelledby="pb-ec">
      <p class="titre-avec-signe">
        <span class="triangle" aria-hidden="true">△</span>
        <span id="pb-ec" class="titre-section dans-carte">Ce qui ne concorde pas</span>
      </p>
      <ul class="puces">
        {#each s.criteres.ecarts as e (e)}
          <li><span class="puce" aria-hidden="true"></span><span>{e}</span></li>
        {/each}
      </ul>
      <p class="mention">
        Ces écarts sont signalés tels quels. Verrière ne corrige pas le rapport du diagnostiqueur.
      </p>
    </section>
  {/if}

  <!-- 8 · CONSEIL VERRIÈRE -->
  {#if s.conseil.length}
    <section class="carte conseil" aria-labelledby="pb-cons">
      <p class="titre-avec-signe">
        <span class="feuille" aria-hidden="true">❧</span>
        <span id="pb-cons" class="titre-section dans-carte">Conseil Verrière</span>
      </p>
      {#each s.conseil as ligne (ligne)}<p class="ligne-conseil">{ligne}</p>{/each}
    </section>
  {/if}

  <!-- 9 · LE RAPPORT SOURCE -->
  {#if surVoirDansLeRapport}
    <button class="vers-rapport" type="button" onclick={() => surVoirDansLeRapport(s.pages[0])}>
      <span>Voir le rapport complet</span>
      <span class="pages">pages {s.pages[0]} à {s.pages[1]}</span>
    </button>
  {/if}

  <nav class="onglets" aria-label="Sections du diagnostic">
    <span class="onglet actif" aria-current="page"><span aria-hidden="true">⌂</span>Synthèse</span>
    <span class="onglet"><span aria-hidden="true">☰</span>Détails</span>
    <span class="onglet"><span aria-hidden="true">▣</span>Photos</span>
    <span class="onglet"><span aria-hidden="true">✿</span>Conseils</span>
  </nav>
</div>

<style>
  /*
   * LA CHARTE COMMUNE AUX PACKS : ivoire chaud, vert profond, laiton discret.
   * Aucun corail, et le sauge n'est employé nulle part en fond ni en bordure.
   */
  .app {
    --ivoire-chaud: #faf8f3;
    --vert-nuit: #0e3b30;
    --vert-signe: #2f7d5f;
    --vert-voile: #e4ede7;
    --laiton: #b58f4a;
    --ambre-voile: #fbf0dd;
    --ambre-signe: #9c6a15;
    --encre: #16241f;
    --encre-douce: #5b6b64;
    --filet-doux: #e7e3da;

    background: var(--ivoire-chaud);
    color: var(--encre);
    padding: 1.25rem 1rem 5.5rem;
    display: grid;
    gap: 0.9rem;
    max-width: 30rem;
    margin-inline: auto;
    position: relative;
    min-height: 100%;
  }

  .entete {
    text-align: center;
    padding-block: 0.5rem 0.75rem;
  }
  .signe {
    width: 2.2rem;
    height: 2.2rem;
  }
  .trait {
    fill: none;
    stroke: var(--laiton);
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ecaille {
    fill: none;
    stroke: var(--laiton);
    stroke-width: 1.3;
    stroke-linecap: round;
    opacity: 0.75;
  }
  .entete h1 {
    margin: 0.35rem 0 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.85rem;
    font-weight: 400;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--vert-nuit);
  }
  .sous-titre {
    margin: 0.2rem 0 0;
    font-size: 0.6875rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--laiton);
  }

  .titre-section {
    font-size: 0.6875rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--encre-douce);
    margin: 0.35rem 0 0.1rem;
  }
  .titre-section.dans-carte {
    margin: 0;
  }

  /* ── Points clés ─────────────────────────────────────────────────────── */
  .cles {
    list-style: none;
    margin: 0;
    padding: 0;
    background: #fff;
    border: 1px solid var(--filet-doux);
    border-radius: 14px;
  }
  .cle {
    display: grid;
    grid-template-columns: 2.5rem 1fr;
    gap: 0.75rem;
    align-items: center;
    padding: 0.9rem 1rem;
  }
  .cle + .cle {
    border-top: 1px solid var(--filet-doux);
  }
  .pastille {
    display: grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    font-size: 1.1rem;
    font-weight: 700;
    background: var(--vert-voile);
    color: var(--vert-signe);
  }
  .t-attention .pastille,
  .t-alerte .pastille {
    background: var(--ambre-voile);
    color: var(--ambre-signe);
  }
  .texte-cle {
    display: grid;
    gap: 0.15rem;
  }
  .texte-cle b {
    font-size: 0.9375rem;
    line-height: 1.3;
  }
  .detail {
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--encre-douce);
  }

  /* ── Résultat global ─────────────────────────────────────────────────── */
  .resultat {
    background: var(--vert-voile);
    border-radius: 14px;
    padding: 1.1rem 1rem;
  }
  .resultat-corps {
    display: grid;
    grid-template-columns: 5.5rem 1fr;
    gap: 1rem;
    align-items: center;
    margin-top: 0.75rem;
  }
  .sceau svg {
    width: 5.5rem;
    height: 5.5rem;
  }
  .anneau-fond {
    fill: none;
    stroke: #fff;
    stroke-width: 5;
  }
  .anneau-trait {
    fill: none;
    stroke: var(--vert-signe);
    stroke-width: 5;
    stroke-linecap: round;
    /* Un cadre, pas une mesure : aucune valeur ne l'anime. */
    stroke-dasharray: 198 66;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
  }
  .bouclier {
    fill: var(--vert-nuit);
  }
  .signe-fort {
    fill: none;
    stroke: #fff;
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .phrase {
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.2rem;
    line-height: 1.3;
    color: var(--vert-nuit);
    text-wrap: pretty;
  }
  .etiquette {
    margin: 0.6rem 0 0;
    font-size: 0.625rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--encre-douce);
  }
  .portee {
    margin: 0.1rem 0 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 0.95rem;
    color: var(--vert-signe);
  }

  /* ── Cartes ──────────────────────────────────────────────────────────── */
  .carte {
    background: #fff;
    border: 1px solid var(--filet-doux);
    border-radius: 14px;
    padding: 1rem;
  }
  .titre-avec-signe {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0;
  }
  .total {
    margin-left: auto;
    font-size: 0.75rem;
    color: var(--encre-douce);
  }

  .discordance {
    display: flex;
    gap: 0.5rem;
    margin: 0;
    padding: 0.85rem 1rem;
    background: var(--ambre-voile);
    border-radius: 14px;
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  /* ── Les classes ─────────────────────────────────────────────────────── */
  .classes {
    list-style: none;
    margin: 0.75rem 0 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
  }
  .classe {
    display: grid;
    grid-template-columns: 1.75rem 1fr auto;
    gap: 0.7rem;
    align-items: center;
  }
  /* Le NUMÉRO porte l'information ; la teinte ne fait que la renforcer. */
  .numero {
    display: grid;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 700;
    background: var(--vert-voile);
    color: var(--vert-signe);
  }
  .c-2 .numero,
  .non-mesuree .numero {
    background: var(--ambre-voile);
    color: var(--ambre-signe);
  }
  .c-3 .numero {
    background: var(--vert-nuit);
    color: #fff;
  }
  .classe .quoi {
    display: grid;
    gap: 0.05rem;
  }
  .classe b {
    font-size: 0.875rem;
  }
  .compte {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.25rem;
    color: var(--vert-nuit);
  }
  .non-mesuree {
    padding-top: 0.5rem;
    border-top: 1px dashed var(--filet-doux);
  }

  /* ── Les locaux ──────────────────────────────────────────────────────── */
  .entete-repli {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    cursor: pointer;
    color: inherit;
  }
  .chevron-repli {
    transition: transform 0.2s;
    color: var(--encre-douce);
  }
  .chevron-repli.ouvert {
    transform: rotate(180deg);
  }
  .liste-locaux {
    list-style: none;
    margin: 0.75rem 0 0;
    padding: 0;
    display: grid;
    gap: 0.4rem;
    font-size: 0.875rem;
  }
  .liste-locaux > li {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid var(--filet-doux);
  }
  .liste-locaux > li.seuil .chiffres {
    color: var(--ambre-signe);
    font-weight: 600;
  }
  .marque {
    display: block;
    font-size: 0.6875rem;
    font-style: normal;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .chiffres {
    text-align: right;
    white-space: nowrap;
  }

  .puces {
    list-style: none;
    margin: 0.75rem 0 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.5;
  }
  .puces > li {
    display: grid;
    grid-template-columns: 0.6rem 1fr;
    gap: 0.6rem;
    align-items: start;
  }
  .puce {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background: var(--ambre-signe);
    margin-top: 0.5rem;
  }
  .triangle {
    color: var(--ambre-signe);
    font-size: 0.9rem;
  }
  .feuille {
    color: var(--laiton);
  }
  .ligne {
    margin: 0.7rem 0 0;
    font-size: 0.875rem;
    line-height: 1.5;
    font-weight: 600;
  }
  .mention {
    margin: 0.6rem 0 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--encre-douce);
  }
  .alerte-ars,
  .ecarts {
    background: var(--ambre-voile);
    border-color: #f0dfc0;
  }
  .conseil {
    background: #fdfaf3;
  }
  .ligne-conseil {
    margin: 0.7rem 0 0;
    font-size: 0.875rem;
    line-height: 1.6;
    text-wrap: pretty;
  }

  .vers-rapport {
    display: grid;
    gap: 0.15rem;
    width: 100%;
    padding: 1rem;
    border: 0;
    border-radius: 14px;
    background: var(--vert-nuit);
    color: #fff;
    font: inherit;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
  }
  .pages {
    font-weight: 400;
    font-size: 0.75rem;
    opacity: 0.75;
  }

  .onglets {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    background: #fff;
    border-top: 1px solid var(--filet-doux);
    padding: 0.5rem 0 0.7rem;
  }
  .onglet {
    display: grid;
    justify-items: center;
    gap: 0.15rem;
    font-size: 0.6875rem;
    color: var(--encre-douce);
  }
  .onglet.actif {
    color: var(--vert-nuit);
    font-weight: 600;
  }

  @media (prefers-reduced-motion: reduce) {
    .chevron-repli {
      transition: none;
    }
  }
</style>
