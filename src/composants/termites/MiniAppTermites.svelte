<script lang="ts">
  /**
   * LA MINI-APP TERMITES — l'écran de DROITE du visuel, à la lettre.
   *
   * Référence : `VISUEL_REFERENCE_TERMITES.png`, pack `VERRIERE_TERMITES`,
   * ordre du 22/08/2026. « Utiliser l'écran de droite comme matrice graphique. »
   *
   * ═══════════════════════════════════════════════════════════════════════
   * CE QUI EST REPRODUIT À L'IDENTIQUE — la FORME
   * ═══════════════════════════════════════════════════════════════════════
   *
   *   l'en-tête       icône termite laiton, « TERMITES » en serif large,
   *                   « SYNTHÈSE DU DIAGNOSTIC » en petites capitales
   *   points clés     cartes blanches, pastille ronde à gauche, chevron à
   *                   droite, titre gras + phrase explicative
   *   résultat global carte vert très pâle, anneau + bouclier, texte serif
   *   constatations   carte bleutée pâle, puces rondes, chevron de repli,
   *                   filigrane végétal
   *   non contrôlé    carte blanche, triangle d'attention, statut à droite
   *   confiance       carte crème, grande valeur + barre de progression
   *   conseil         carte crème, feuille
   *   onglets         Synthèse · Détails · Photos · Conseils
   *
   * ═══════════════════════════════════════════════════════════════════════
   * CE QUI NE PEUT PAS ÊTRE COPIÉ — les DONNÉES
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Le README du pack : « Aucune donnée du visuel d'exemple ne doit être
   * considérée comme une donnée métier réelle. » Et l'ordre nomme lui-même
   * ce qui est fictif :
   *
   *   § E   « Ne pas afficher arbitrairement un pourcentage tel que 90 %. »
   *         → la carte garde sa forme ; à la place du chiffre, la phrase
   *           factuelle que le § E prescrit lui-même
   *   § B   le niveau de risque doit être calculable ou issu d'une règle
   *         validée → la ligne garde sa place, la conclusion du rapport y
   *           tient lieu de niveau
   *   § 8.2 « sans copier aveuglément les exemples fictifs du visuel »
   *         → les trois points clés du visuel (« aucun termite vivant »,
   *           « aucun dégât », « pas d'activité récente ») ne sont pas dans
   *           les rapports : le tableau conclut globalement, pas indice par
   *           indice
   *
   * ── LA COULEUR EST UN RENFORT, JAMAIS LE SEUL CANAL (§ 4) ──────────────
   *
   * « Les statuts doivent être distinguables par le texte et l'icône, pas
   * uniquement par la couleur. » Chaque pastille porte donc son PICTOGRAMME,
   * chaque statut son MOT — et la teinte ne fait que les renforcer, comme sur
   * le visuel.
   *
   * ⚠️ L'autre écran termites (`ecrans/Termites.svelte`) applique une règle
   * PLUS STRICTE : aucune couleur d'état du tout, parce que sa planche est
   * rétroéclairée et que sa lumière varie avec l'heure. Sa discipline lui
   * appartient ; celle-ci suit le visuel du pack.
   */
  import type { Diagnostic } from '../../lib/modele';
  import { syntheseTermites } from './synthese';

  interface Props {
    diagnostic: Diagnostic;
    surVoirDansLeRapport?: (page: number) => void;
  }

  const { diagnostic, surVoirDansLeRapport }: Props = $props();
  const s = $derived(syntheseTermites(diagnostic));

  let constatationsOuvertes = $state(true);

  /** Le pictogramme du ton — premier canal, jamais la couleur seule. */
  const picto = (ton: string): string =>
    ton === 'alerte' ? '!' : ton === 'attention' ? '△' : '✓';
  /** Le mot du ton — second canal. */
  const motDuTon = (ton: string): string =>
    ton === 'alerte' ? 'Point d’alerte' : ton === 'attention' ? 'À regarder' : 'Rien à signaler';
</script>

<div class="app">
  <!-- L'EN-TÊTE du visuel : termite laiton, TERMITES en serif, sous-titre. -->
  <header class="entete">
    <svg class="insecte" viewBox="0 0 24 32" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="3.1" ry="3.4" />
      <ellipse cx="12" cy="12.6" rx="2.5" ry="3" />
      <ellipse cx="12" cy="21" rx="4.2" ry="6.4" />
      <path d="M9.6 3.6 6.2 1M14.4 3.6 17.8 1" />
      <path d="M8.9 10.4 4 8.4M15.1 10.4 20 8.4" />
      <path d="M8.9 13.4 4 14.4M15.1 13.4 20 14.4" />
      <path d="M8.4 17.5 3.6 19.5M15.6 17.5 20.4 19.5" />
    </svg>
    <h1>Termites</h1>
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
            <span class="statut-mot">{motDuTon(p.ton)}</span>
            <span class="detail">{p.detail}</span>
          </span>
          <span class="chevron" aria-hidden="true">›</span>
        </li>
      {/each}
    </ul>
  {/if}

  <!--
    2 · RÉSULTAT GLOBAL — l'anneau et le bouclier du visuel.

    L'anneau ne mesure RIEN : c'est un cadre, comme sur la maquette. Aucun
    pourcentage ne l'anime, parce qu'aucune règle de calcul n'est validée.
  -->
  <section class="resultat" aria-labelledby="mt-res">
    <h2 id="mt-res" class="titre-section dans-carte">Résultat global</h2>
    <div class="resultat-corps">
      <div class="sceau" aria-hidden="true">
        <svg viewBox="0 0 96 96">
          <circle class="anneau-fond" cx="48" cy="48" r="42" />
          <circle class="anneau-trait" cx="48" cy="48" r="42" />
          <path
            class="bouclier"
            d="M48 22c7 4 13 5.5 19 5.8v20c0 12.6-8 21-19 26-11-5-19-13.4-19-26v-20c6-.3 12-1.8 19-5.8Z"
          />
          <path class="coche" d="m40 47.5 6 6 12-12.5" />
        </svg>
      </div>
      <div class="resultat-mots">
        <p class="phrase">{s.resultat}</p>
        <p class="etiquette-niveau">Ce que le rapport établit</p>
        <!--
          ⚠️ Le visuel écrit ici « NIVEAU DE RISQUE : TRÈS FAIBLE ». Le § B
          l'interdit sans règle validée : le rapport ne qualifie aucun risque.
          La place est gardée, la portée du constat y tient lieu de niveau.
        -->
        <p class="niveau">Sur les éléments examinés</p>
      </div>
    </div>
  </section>

  <!-- 3 · CONSTATATIONS DIVERSES — carte repliable, puces rondes, filigrane. -->
  {#if s.constatations.montrer}
    <section class="carte constatations" aria-labelledby="mt-cd">
      <button
        class="entete-repli"
        type="button"
        aria-expanded={constatationsOuvertes}
        onclick={() => (constatationsOuvertes = !constatationsOuvertes)}
      >
        <span id="mt-cd" class="titre-section dans-carte">Constatations diverses</span>
        <span class="chevron-repli" class:ouvert={constatationsOuvertes} aria-hidden="true">⌄</span>
      </button>
      {#if constatationsOuvertes}
        {#if s.constatations.entrees.length}
          <ul class="puces">
            {#each s.constatations.entrees as c (c.terme)}
              <li>
                <span class="puce" aria-hidden="true"></span>
                <span>
                  « {c.terme} »
                  {#if c.ou}<em class="ou">— {c.ou}</em>{/if}
                </span>
              </li>
            {/each}
          </ul>
        {:else if s.constatations.mention}
          <p class="mention">{s.constatations.mention}</p>
        {/if}
      {/if}
      <svg class="filigrane" viewBox="0 0 120 120" aria-hidden="true">
        <path
          d="M20 100C40 80 60 50 100 20M100 20c-18 2-30 10-34 24 14 4 27-6 34-24ZM100 20c2 18-4 32-18 38-6-13 3-30 18-38Z"
        />
      </svg>
    </section>
  {/if}

  <!-- 4 · CE QUI N'A PAS ÉTÉ CONTRÔLÉ — triangle, et statut à droite. -->
  {#if s.nonVisitees.montrer || s.nonExamines.montrer || s.bornages.length}
    <section class="carte limites" aria-labelledby="mt-nc">
      <p class="titre-avec-signe">
        <span class="triangle" aria-hidden="true">△</span>
        <span id="mt-nc" class="titre-section dans-carte">Ce qui n’a pas été contrôlé</span>
      </p>

      {#if s.charpente}
        <p class="avertissement">
          Les combles ou la charpente n’ont pas pu être contrôlés. C’est là que les termites se
          voient&nbsp;: la conclusion du rapport ne porte pas sur eux.
        </p>
      {/if}

      <ul class="non-controle">
        {#each s.nonVisitees.entrees as l (l.quoi)}
          <li>
            <span class="puce" aria-hidden="true"></span>
            <span class="quoi">
              {l.quoi}
              {#if l.pourquoi}<em class="motif">({l.pourquoi})</em>{/if}
            </span>
            <span class="statut">Non visitée</span>
          </li>
        {/each}
        {#each s.nonExamines.entrees as l (l.quoi)}
          <li>
            <span class="puce" aria-hidden="true"></span>
            <span class="quoi">
              {#if l.separe}
                {l.quoi}
                {#if l.pourquoi}<em class="motif">({l.pourquoi})</em>{/if}
              {:else}
                « {l.quoi} »
                <em class="motif">(texte du rapport, colonnes non séparées)</em>
              {/if}
            </span>
            <span class="statut">Non examiné</span>
          </li>
        {/each}
      </ul>

      {#if !s.nonVisitees.entrees.length && s.nonVisitees.mention}
        <p class="mention">{s.nonVisitees.mention}</p>
      {/if}
      {#if !s.nonExamines.entrees.length && s.nonExamines.mention}
        <p class="mention">{s.nonExamines.mention}</p>
      {/if}
      {#if s.bornages.length}
        <!--
          Les clauses qui bornent l'examen. Elles étaient PERDUES : filtrées du
          bloc « constatations diverses » et reversées nulle part. Le § 30
          l'interdit, et le § 14 leur donne cette place.
        -->
        <p class="sous-titre-limites">Ce qui borne l’examen, dans les mots du rapport</p>
        <ul class="puces">
          {#each s.bornages as b (b)}
            <li><span class="puce" aria-hidden="true"></span><span>« {b} »</span></li>
          {/each}
        </ul>
      {/if}
      <p class="mention">Sur ces zones, le rapport ne conclut rien — ni présence, ni absence.</p>
    </section>
  {/if}

  <!--
    5 · COMPLÉTUDE — la carte du visuel, sa feuille et sa grande ligne.

    ⚠️ Le visuel écrit « 90 % » avec une barre remplie aux neuf dixièmes. Le
    § E l'interdit nommément : « ne pas afficher arbitrairement un pourcentage
    tel que 90 % […] remplacer le pourcentage par une formulation factuelle ».
    La forme est gardée, le chiffre est remplacé par la phrase que le § E
    prescrit, et la barre disparaît avec lui — une barre sans valeur mesurée
    serait un score déguisé.
  -->
  {#if s.completude.length}
    <section class="carte confiance" aria-labelledby="mt-comp">
      <p class="titre-avec-signe">
        <span class="feuille" aria-hidden="true">❧</span>
        <span id="mt-comp" class="titre-section dans-carte">Complétude du contrôle</span>
      </p>
      <p class="grande-ligne">{s.completude[0]}</p>
      {#each s.completude.slice(1) as ligne (ligne)}
        <p class="mention">{ligne}</p>
      {/each}
    </section>
  {/if}

  <!-- 6 · CONSEIL VERRIÈRE -->
  {#if s.conseil.length}
    <section class="carte conseil" aria-labelledby="mt-cons">
      <p class="titre-avec-signe">
        <span class="feuille" aria-hidden="true">❧</span>
        <span id="mt-cons" class="titre-section dans-carte">Conseil Verrière</span>
      </p>
      {#each s.conseil as ligne (ligne)}<p class="ligne-conseil">{ligne}</p>{/each}
    </section>
  {/if}

  <!-- 7 · LE RAPPORT SOURCE -->
  {#if surVoirDansLeRapport}
    <button class="vers-rapport" type="button" onclick={() => surVoirDansLeRapport(s.pages[0])}>
      <span>Voir le rapport complet</span>
      <span class="pages">pages {s.pages[0]} à {s.pages[1]}</span>
    </button>
  {/if}

  <!-- LA BARRE D'ONGLETS du visuel. Seule « Synthèse » est écrite à ce jour. -->
  <nav class="onglets" aria-label="Sections du diagnostic">
    <span class="onglet actif" aria-current="page"><span aria-hidden="true">⌂</span>Synthèse</span>
    <span class="onglet"><span aria-hidden="true">☰</span>Détails</span>
    <span class="onglet"><span aria-hidden="true">▣</span>Photos</span>
    <span class="onglet"><span aria-hidden="true">✿</span>Conseils</span>
  </nav>
</div>

<style>
  /*
   * LA CHARTE DU VISUEL : ivoire chaud, vert profond, laiton discret.
   *
   * Aucun de ces tons n'est un corail (teinte 2–14°, saturation ≥ 55 %,
   * clarté 45–82 % : les trois bornes du test), et le sauge #a6c39a n'est
   * employé nulle part en fond, bordure ou remplissage.
   */
  .app {
    --ivoire-chaud: #faf8f3;
    --vert-nuit: #0e3b30;
    --vert-signe: #2f7d5f;
    --vert-voile: #e4ede7;
    --laiton: #b58f4a;
    --ambre-voile: #fbf0dd;
    --ambre-signe: #9c6a15;
    --bleu-voile: #e8eef4;
    --bleu-signe: #3a6389;
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

  /* ── En-tête ─────────────────────────────────────────────────────────── */
  .entete {
    text-align: center;
    padding-block: 0.5rem 0.75rem;
  }
  .insecte {
    width: 1.9rem;
    height: 2.5rem;
    fill: var(--laiton);
    stroke: var(--laiton);
    stroke-width: 1.4;
    stroke-linecap: round;
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
    border-radius: 14px;
    box-shadow: 0 1px 2px rgb(14 59 48 / 6%);
  }
  .cle {
    display: grid;
    grid-template-columns: 2.5rem 1fr 0.75rem;
    gap: 0.75rem;
    align-items: center;
    padding: 0.9rem 1rem;
  }
  .cle + .cle {
    border-top: 1px solid var(--filet-doux);
  }
  /* La pastille porte le PICTOGRAMME ; la teinte ne fait que renforcer. */
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
  .t-attention .pastille {
    background: var(--ambre-voile);
    color: var(--ambre-signe);
  }
  .t-alerte .pastille {
    background: var(--bleu-voile);
    color: var(--bleu-signe);
  }
  .texte-cle {
    display: grid;
    gap: 0.1rem;
  }
  .texte-cle b {
    font-size: 0.9375rem;
    line-height: 1.3;
  }
  /* Le MOT du statut : second canal, jamais la couleur seule. */
  .statut-mot {
    font-size: 0.625rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--encre-douce);
  }
  .detail {
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--encre-douce);
  }
  .chevron {
    color: var(--encre-douce);
    font-size: 1.1rem;
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
  .coche {
    fill: none;
    stroke: #fff;
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .phrase {
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.25rem;
    line-height: 1.25;
    color: var(--vert-nuit);
    text-wrap: pretty;
  }
  .etiquette-niveau {
    margin: 0.6rem 0 0;
    font-size: 0.625rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--encre-douce);
  }
  .niveau {
    margin: 0.1rem 0 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1rem;
    letter-spacing: 0.06em;
    color: var(--vert-signe);
  }

  /* ── Cartes ──────────────────────────────────────────────────────────── */
  .carte {
    background: #fff;
    border-radius: 14px;
    padding: 1rem;
    position: relative;
    overflow: hidden;
    box-shadow: 0 1px 2px rgb(14 59 48 / 6%);
  }
  .constatations {
    background: var(--bleu-voile);
  }
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
  .puces,
  .non-controle {
    list-style: none;
    margin: 0.75rem 0 0;
    padding: 0;
    display: grid;
    gap: 0.55rem;
    font-size: 0.875rem;
    line-height: 1.5;
    position: relative;
    z-index: 1;
  }
  .puces > li {
    display: grid;
    grid-template-columns: 0.6rem 1fr;
    gap: 0.6rem;
    align-items: start;
  }
  .non-controle > li {
    display: grid;
    grid-template-columns: 0.6rem 1fr auto;
    gap: 0.6rem;
    align-items: start;
  }
  .puce {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background: var(--vert-signe);
    margin-top: 0.5rem;
  }
  .limites .puce {
    background: var(--ambre-signe);
  }
  .ou,
  .motif {
    color: var(--encre-douce);
    font-style: normal;
  }
  /* Le statut est un MOT — la teinte ne fait que le renforcer. */
  .statut {
    font-size: 0.75rem;
    color: var(--ambre-signe);
    white-space: nowrap;
  }
  .triangle {
    color: var(--ambre-signe);
    font-size: 0.9rem;
  }
  .feuille {
    color: var(--laiton);
  }
  .titre-avec-signe {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0;
  }
  .sous-titre-limites {
    margin: 0.9rem 0 0;
    font-size: 0.8125rem;
    font-weight: 600;
  }
  .avertissement {
    margin: 0.75rem 0 0;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.5;
  }
  .mention {
    margin: 0.6rem 0 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--encre-douce);
  }
  .filigrane {
    position: absolute;
    right: -0.5rem;
    bottom: -0.5rem;
    width: 6.5rem;
    height: 6.5rem;
    fill: none;
    stroke: var(--vert-signe);
    stroke-width: 1.2;
    opacity: 0.14;
    pointer-events: none;
  }
  .confiance,
  .conseil {
    background: #fdfaf3;
  }
  .grande-ligne {
    margin: 0.7rem 0 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 1.15rem;
    line-height: 1.3;
    color: var(--vert-nuit);
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

  /* ── Barre d'onglets ─────────────────────────────────────────────────── */
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
