<script lang="ts">
  /**
   * LE GAZ — la mini-app, au visuel du pack du 22/08/2026.
   *
   * ═══════════════════════════════════════════════════════════════════════════
   * « JE VEUX EXACTEMENT LE MÊME VISUEL QUE DANS LE ZIP » — Aude, 22/08/2026
   * ═══════════════════════════════════════════════════════════════════════════
   *
   * `VERRIERE_GAZ_VISUEL_ODM_CLAUDE.zip`. Toutes ses cartes sont ici, dans son
   * ordre et dans sa mise en page :
   *
   *   1  en-tête : flamme bleue, GAZ, SYNTHÈSE DU DIAGNOSTIC
   *   2  RÉSULTAT GLOBAL — carte sombre, verdict, niveau, médaillon à écusson
   *   3  POINTS CLÉS — jeton rond coloré, titre, sous-titre
   *   4  RÉSULTAT GLOBAL DÉTAILLÉ — l'anneau, le grand chiffre, la légende
   *   5  CE QUE LE RAPPORT ÉTABLIT — vignette, libellé, valeur
   *   6  CONSTATATIONS DIVERSES — carte dépliable à puces
   *   7  LES ANOMALIES PAR NIVEAU — cartes teintées, puces, code du rapport
   *   8  CE QUI N'A PAS ÉTÉ CONTRÔLÉ — grille à deux colonnes
   *   9  CE QUE LE CONTRÔLE A COUVERT — la jauge et sa phrase
   *  10  CONSEIL VERRIÈRE — carte vert pâle
   *  11  VOIR LE RAPPORT COMPLET
   *
   * ── LES QUATRE ÉCARTS À LA PLANCHE, ET LEUR RAISON ──────────────────────────
   *
   *   « non conforme »              ce diagnostic n'atteste d'aucune conformité :
   *                                 il classe des anomalies (voir `visuel.ts`)
   *   « à risque / importantes /    remplacerait A1, A2, DGI — une classification
   *     à améliorer »               réglementaire — par une invention graphique.
   *                                 Refusé par Aude les 22 et 23/08
   *   « Art. 531-2 »                article fictif, et de surcroît électrique.
   *                                 On écrit le point de contrôle NF P 45-500
   *   « Fiabilité : 80 % »          aucune méthode validée ne calcule ce nombre.
   *                                 La jauge porte les comptes réels
   *
   * ── CE QUE CET ÉCRAN NE MONTRE PAS, ET POURQUOI C'EST VOULU ─────────────────
   *
   * Le nombre d'appareils. La planche l'affiche ; chez BC2E le lecteur ne sait
   * pas le prouver — mesuré le 22/08 sur 24 volets, deux règles de comptage
   * essayées, deux écartées. Un nombre faux serait plus grave qu'un nombre
   * absent : il ferait croire l'installation entièrement recensée.
   */
  import type { Diagnostic } from '../../lib/modele';
  import type { NiveauAnomalie } from '../../lib/lecteurs/gaz/modele';
  import { contradictions } from '../../lib/lecteurs/gaz';
  import {
    ceQueLeRapportEtablit,
    couvertureDe,
    groupesDe,
    issueDe,
    niveauDominant,
    pointsClesDe,
    TITRE_BANDEAU
  } from './visuel';

  let {
    diagnostic,
    entete = true,
    versRapport
  }: {
    diagnostic: Diagnostic;
    entete?: boolean;
    versRapport?: () => void;
  } = $props();

  const lecture = $derived(diagnostic.gaz);
  const issue = $derived(lecture ? issueDe(lecture) : null);
  const dominant = $derived(lecture ? niveauDominant(lecture) : null);
  const cles = $derived(lecture ? pointsClesDe(lecture) : []);
  const groupes = $derived(lecture ? groupesDe(lecture) : []);
  const etablit = $derived(lecture ? ceQueLeRapportEtablit(lecture) : []);
  const couverture = $derived(lecture ? couvertureDe(lecture) : null);
  /* § 33 de l'ordre : une contradiction remonte à l'écran, jamais arbitrée en silence. */
  const ecarts = $derived(lecture ? contradictions(lecture) : []);

  let constatationsOuvertes = $state(true);
  let limitesOuvertes = $state(true);
  const detailOuvert = $state<Record<string, boolean>>({});

  const RAYON = 52;
  const PERIMETRE = 2 * Math.PI * RAYON;

  /** Les teintes de l'anneau. Chaque tranche a AUSSI sa ligne de légende chiffrée. */
  const TEINTE: Record<NiveauAnomalie | 'nonVerifie', string> = {
    DGI: '#a33220',
    A2: '#c9821f',
    A1: '#d8b45c',
    '32c': '#7a8f88',
    nonVerifie: '#b9c4c0'
  };

  /** Les tranches de l'anneau : les niveaux cités, puis les points non vérifiés. */
  const tranches = $derived(
    lecture
      ? [
          ...groupes.map((g) => ({ cle: g.niveau as NiveauAnomalie | 'nonVerifie', nom: `${g.niveau} — ${g.titre}`, valeur: g.anomalies.length })),
          ...(lecture.pointsNonVerifies.length
            ? [{ cle: 'nonVerifie' as const, nom: 'Points non vérifiés', valeur: lecture.pointsNonVerifies.length }]
            : [])
        ]
      : []
  );

  const arcs = $derived.by(() => {
    const total = tranches.reduce((s, t) => s + t.valeur, 0);
    if (!total) return [];
    let parcouru = 0;
    return tranches.map((t) => {
      const longueur = (t.valeur / total) * PERIMETRE;
      const decalage = -parcouru;
      parcouru += longueur;
      return { cle: t.cle, longueur, decalage };
    });
  });
</script>

<article class="ecran" data-issue={issue}>
  {#if entete}
    <header class="titre">
      <svg class="flamme" viewBox="0 0 24 30" aria-hidden="true">
        <path
          d="M12 1.5c1.6 4.4-1.3 6.2-3.2 8.6-1.7 2.1-2.6 4-2.6 6.4 0 4.5 3.1 7.4 5.8 7.4s5.8-2.9 5.8-7.4c0-2.6-1.2-4.3-2.4-5.6-.7 1.4-1.6 2.1-2.6 2.1 1.4-4-.2-8.4-.8-11.5Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
      </svg>
      <h1>Gaz</h1>
      <p class="sous-titre">Synthèse du diagnostic</p>
    </header>
  {/if}

  {#if !lecture || !issue}
    <!--
      AUCUN LECTEUR NE RECONNAÎT CE FORMAT.
      Le dire est la seule réponse honnête : le gaz est le seul diagnostic qui
      peut faire couper l'alimentation le jour même, et un écran vide se lirait
      comme une installation saine.
    -->
    <section class="carte non-lu">
      <p class="rubrique dans-carte">Format non reconnu</p>
      <p class="dit-non-lu">
        La mise en page de ce rapport ne correspond à aucun des modèles que
        Verrière sait lire ligne à ligne. Rien n’en est déduit : reportez-vous au
        rapport d’origine, en particulier à sa rubrique « Anomalies identifiées ».
      </p>
    </section>
  {:else}
    <!-- ══ 2 · RÉSULTAT GLOBAL ═══════════════════════════════════════════════ -->
    <section class="bandeau" aria-labelledby="resultat-gaz">
      <div class="dedans">
        <p class="chapeau" id="resultat-gaz">Résultat global</p>
        <p class="verdict">{TITRE_BANDEAU[issue]}</p>
        <p class="chapeau bas">Classement du rapport</p>
        <!--
          La pastille porte le sigle de la NORME, jamais un mot de nous. C'est
          l'ordre d'Aude des 22 et 23/08 : A1, A2, DGI et rien d'autre.
        -->
        <p class="pastille" data-ton={dominant ? (dominant === 'DGI' ? 'alerte' : dominant === 'A2' ? 'attention' : 'doux') : 'neutre'}>
          {dominant ?? (issue === 'aucune' ? 'AUCUNE ANOMALIE' : 'NON CONCLU')}
        </p>
      </div>

      <svg class="medaillon" viewBox="0 0 130 130" role="img" aria-label={TITRE_BANDEAU[issue]}>
        <circle cx="65" cy="65" r="52" fill="none" stroke="rgb(247 246 242 / 14%)" stroke-width="9" />
        <circle
          class="jauge"
          cx="65"
          cy="65"
          r="52"
          fill="none"
          stroke-width="9"
          stroke-linecap="round"
          stroke-dasharray="{(issue === 'dgi' ? 0.92 : issue === 'anomalies' ? 0.55 : issue === 'aucune' ? 0.2 : 0) *
            (2 * Math.PI * 52)} {2 * Math.PI * 52}"
          transform="rotate(-90 65 65)"
        />
        <circle cx="65" cy="65" r="38" fill="var(--verriere-blanc, #fff)" />
        <g class="ecusson">
          <path d="M65 44l14 5v12c0 10-6 16-14 19-8-3-14-9-14-19V49Z" />
          {#if issue === 'aucune'}
            <path class="signe" d="M58 64l5 5 10-11" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          {:else if issue === 'nonLue'}
            <path class="signe" d="M60 60h10M60 68h10" stroke-linecap="round" />
          {:else}
            <path class="signe" d="M65 54v11" stroke-linecap="round" />
            <circle class="point" cx="65" cy="71" r="1.9" />
          {/if}
        </g>
      </svg>
    </section>

    <!--
      ══ § 33 · LES CONTRADICTIONS ════════════════════════════════════════════
      La synthèse n'écrase pas le détail, et le détail ne fait pas taire la
      synthèse : quand les deux se contredisent, l'écran le DIT.
    -->
    {#if ecarts.length}
      <section class="carte ecart" aria-labelledby="ecarts">
        <p class="rubrique dans-carte" id="ecarts">Ce qui demande vérification</p>
        <ul class="liste-ecarts">
          {#each ecarts as e (e)}
            <li>{e}</li>
          {/each}
        </ul>
      </section>
    {/if}

    <!-- ══ 3 · POINTS CLÉS ═══════════════════════════════════════════════════ -->
    {#if cles.length}
      <h2 class="rubrique">Points clés</h2>
      <ul class="cles">
        {#each cles as p (p.titre)}
          <li>
            <div class="cle" data-ton={p.ton}>
              <span class="rond" aria-hidden="true">
                {#if p.ton === 'bon'}
                  <svg viewBox="0 0 20 20"><path d="M5 10.5 8.5 14 15 6.5" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" /></svg>
                {:else if p.ton === 'alerte'}
                  <svg viewBox="0 0 20 20"><path d="M6.4 6.4l7.2 7.2M13.6 6.4l-7.2 7.2" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" /></svg>
                {:else}
                  <svg viewBox="0 0 20 20"><path d="M10 3.5 18.5 17.5H1.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" /><path d="M10 8.4v3.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /><circle cx="10" cy="14.5" r="1" fill="currentColor" /></svg>
                {/if}
              </span>
              <span class="dit">
                <strong>{p.titre}</strong>
                {#if p.detail}<small>{p.detail}</small>{/if}
              </span>
            </div>
          </li>
        {/each}
      </ul>
    {/if}

    <!-- ══ 4 · RÉSULTAT GLOBAL DÉTAILLÉ ══════════════════════════════════════ -->
    <section class="carte" aria-labelledby="detaille">
      <p class="rubrique dans-carte" id="detaille">Résultat global détaillé</p>
      <div class="compte">
        <svg class="anneau" viewBox="0 0 130 130" role="img" aria-label="Répartition des anomalies par niveau">
          <circle cx="65" cy="65" r={RAYON} fill="none" stroke="rgb(10 43 35 / 8%)" stroke-width="13" />
          {#each arcs as a (a.cle)}
            <circle
              cx="65"
              cy="65"
              r={RAYON}
              fill="none"
              stroke={TEINTE[a.cle]}
              stroke-width="13"
              stroke-dasharray="{a.longueur} {PERIMETRE}"
              stroke-dashoffset={a.decalage}
              transform="rotate(-90 65 65)"
            />
          {/each}
          <!--
            ⚠️ « 0 » N'EST PAS UNE RÉPONSE quand la conclusion est une case
            cochée. Chez LICIEL elle l'est toujours : le tiret dit qu'on n'a pas
            lu, là où un zéro annoncerait une bonne nouvelle inventée.
          -->
          <text class="grand" x="65" y="63" text-anchor="middle">
            {issue === 'nonLue' && lecture.anomalies.length === 0 ? '—' : lecture.anomalies.length}
          </text>
          <text class="petit" x="65" y="79" text-anchor="middle">
            {issue === 'nonLue' && lecture.anomalies.length === 0 ? 'conclusion' : lecture.anomalies.length > 1 ? 'anomalies' : 'anomalie'}
          </text>
          <text class="petit" x="65" y="91" text-anchor="middle">
            {issue === 'nonLue' && lecture.anomalies.length === 0 ? 'non lue' : lecture.anomalies.length > 1 ? 'constatées' : 'constatée'}
          </text>
        </svg>
        <ul class="legende">
          {#each tranches as t (t.cle)}
            <li>
              <span class="point-legende" style="background:{TEINTE[t.cle]}" aria-hidden="true"></span>
              <span class="nom">{t.nom}</span>
              <span class="valeur">{t.valeur}</span>
            </li>
          {/each}
          {#if !tranches.length}
            <li class="rien">Le rapport ne liste aucune anomalie dans sa rubrique dédiée.</li>
          {/if}
        </ul>
      </div>
    </section>

    <!-- ══ 5 · CE QUE LE RAPPORT ÉTABLIT ═════════════════════════════════════ -->
    {#if etablit.length}
      <section class="carte" aria-labelledby="etablit">
        <!--
          Le titre de la planche est « Ce qui a été contrôlé ». Il est écarté :
          un rapport de gaz écrit ce qu'il n'a PAS pu contrôler, jamais la liste
          de ce qu'il a contrôlé. Cocher « contrôlé » là où le rapport se tait
          serait présenter un test non réalisé comme satisfaisant.
        -->
        <p class="rubrique dans-carte" id="etablit">Ce que le rapport établit</p>
        <ul class="etablis">
          {#each etablit as e (e.libelle)}
            <li>
              <span class="vignette" aria-hidden="true"></span>
              <span class="dit">
                <strong>{e.libelle}</strong>
                <small>{e.valeur}</small>
                {#if e.reserve}<em class="reserve">{e.reserve}</em>{/if}
              </span>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <!-- ══ 6 · CONSTATATIONS DIVERSES ════════════════════════════════════════ -->
    {#if lecture.constatations.length}
      <section class="carte" aria-labelledby="constatations">
        <button class="tete" type="button" id="constatations" aria-expanded={constatationsOuvertes} onclick={() => (constatationsOuvertes = !constatationsOuvertes)}>
          <span class="rubrique dans-carte">Constatations diverses</span>
          <span class="nombre-tete">{lecture.constatations.length}</span>
          <span class="chevron pivot" class:ouvert={constatationsOuvertes} aria-hidden="true">›</span>
        </button>
        {#if constatationsOuvertes}
          <ul class="puces simples">
            {#each lecture.constatations as c (c)}
              <li><span class="puce" aria-hidden="true"></span><span class="corps">{c}</span></li>
            {/each}
          </ul>
        {/if}
      </section>
    {/if}

    <!-- ══ 7 · LES ANOMALIES, PAR NIVEAU DE LA NORME ═════════════════════════ -->
    {#if groupes.length}
      <div id="anomalies">
        {#each groupes as g (g.niveau)}
          <section class="groupe" data-ton={g.ton}>
            <p class="tete-groupe">
              <svg class="icone" viewBox="0 0 20 18" aria-hidden="true">
                <path d="M10 2 19 17H1Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M10 7v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <circle cx="10" cy="14.4" r="0.9" fill="currentColor" />
              </svg>
              <span class="sigle">{g.niveau}</span>
              <span class="quoi">{g.titre}</span>
              <span class="nombre">({g.anomalies.length})</span>
            </p>

            <ul class="puces">
              {#each g.anomalies as a, i (a.code + i)}
                <li>
                  <span class="puce" aria-hidden="true"></span>
                  <span class="corps">
                    <span class="libelle">{a.libelle}</span>
                    {#if a.appareil}<em class="ou">{a.appareil}</em>{/if}
                  </span>
                  <!-- Le code du POINT DE CONTRÔLE de la norme — celui du rapport. -->
                  <span class="code">{a.code}</span>
                </li>
              {/each}
            </ul>

            <button class="lien-detail" type="button" aria-expanded={!!detailOuvert[g.niveau]} onclick={() => (detailOuvert[g.niveau] = !detailOuvert[g.niveau])}>
              Ce que « {g.niveau} » veut dire
              <span aria-hidden="true">›</span>
            </button>
            {#if detailOuvert[g.niveau]}
              <p class="detail-norme">{g.explication}</p>
            {/if}
          </section>
        {/each}

        <!--
          La note qui dit d'où vient le rangement. Contrairement à l'électricité,
          il n'est PAS de nous : la norme classe, le rapport imprime le niveau.
        -->
        <p class="note-groupes">
          Ces niveaux sont ceux de la norme NF P 45-500, écrits tels quels dans le
          rapport à côté de chaque point de contrôle. Verrière ne les recalcule
          pas et n’en ajoute aucun : chaque libellé ci-dessus est celui du
          rapport, mot pour mot.
        </p>
      </div>
    {/if}

    <!-- ══ 8 · CE QUI N'A PAS ÉTÉ CONTRÔLÉ ═══════════════════════════════════ -->
    {#if lecture.pointsNonVerifies.length || lecture.zonesNonControlees.length}
      <section class="carte" aria-labelledby="limites">
        <button class="tete" type="button" id="limites" aria-expanded={limitesOuvertes} onclick={() => (limitesOuvertes = !limitesOuvertes)}>
          <span class="rubrique dans-carte">Ce qui n’a pas été contrôlé</span>
          <span class="nombre-tete">{lecture.pointsNonVerifies.length + lecture.zonesNonControlees.length}</span>
          <span class="chevron pivot" class:ouvert={limitesOuvertes} aria-hidden="true">›</span>
        </button>
        {#if limitesOuvertes}
          {#if lecture.zonesNonControlees.length}
            <p class="sous-rubrique">Locaux non visités</p>
            <ul class="grille">
              {#each lecture.zonesNonControlees as z, i (z.zone + i)}
                <li>
                  <strong>{z.zone}</strong>
                  {#if z.motif}<small>{z.motif}</small>{/if}
                </li>
              {/each}
            </ul>
          {/if}
          {#if lecture.pointsNonVerifies.length}
            <p class="sous-rubrique">Points de contrôle non réalisés</p>
            <ul class="grille">
              {#each lecture.pointsNonVerifies as p, i (p.point + i)}
                <li>
                  <strong>{p.appareil ? `${p.appareil} — ${p.point}` : p.point}</strong>
                  {#if p.motif}<small>{p.motif}</small>{/if}
                </li>
              {/each}
            </ul>
          {/if}
        {/if}
      </section>
    {/if}

    <!-- ══ 9 · CE QUE LE CONTRÔLE A COUVERT ══════════════════════════════════ -->
    {#if couverture}
      <section class="carte couverture" aria-labelledby="couvert">
        <p class="rubrique dans-carte" id="couvert">Ce que le contrôle a couvert</p>
        <!--
          ⚠️ La planche affiche « 80 % ». Ce nombre n'existe dans aucun rapport,
          et aucune méthode validée ne le calcule : la jauge porte donc des
          comptes réels, et la phrase dit ce qui manque.
        -->
        <p class="grand-compte">
          {couverture.pointsNonVerifies + couverture.zonesNonControlees}
          <span>point{couverture.pointsNonVerifies + couverture.zonesNonControlees > 1 ? 's' : ''} hors du constat</span>
        </p>
        <div class="jauge-barre" aria-hidden="true">
          <span style="width:{Math.min(100, (couverture.pointsNonVerifies + couverture.zonesNonControlees) * 6)}%"></span>
        </div>
        <p class="phrase-couverture">{couverture.phrase}</p>
      </section>
    {/if}

    <!-- ══ 10 · CONSEIL VERRIÈRE ═════════════════════════════════════════════ -->
    <section class="carte conseil">
      <p class="rubrique dans-carte">Conseil Verrière</p>
      <p class="dit-conseil">
        {#if issue === 'dgi'}
          Le gaz a été coupé sur la partie en cause : ne la remettez pas en service
          vous-même. Un professionnel du gaz intervient, répare, et délivre
          l’attestation qui permet au distributeur de rétablir l’alimentation.
        {:else if issue === 'nonLue'}
          La conclusion de ce rapport est une case cochée à la main : elle ne sort
          pas du fichier. Reportez-vous à la page « Conclusion » du rapport
          d’origine — les anomalies listées ci-dessus, elles, ont bien été lues.
        {:else}
          Faites entretenir vos appareils chaque année : c’est une obligation, et
          c’est ce qui évite la plupart des A2. Et ne bouchez jamais une grille de
          ventilation, même en hiver : une flamme qui manque d’air fabrique du
          monoxyde de carbone.
        {/if}
      </p>
    </section>

    <!-- ══ 11 · VOIR LE RAPPORT COMPLET ══════════════════════════════════════ -->
    {#if versRapport}
      <button class="rapport" type="button" onclick={versRapport}>
        <span class="dit">
          <strong>Voir le rapport complet</strong>
          <small>Accéder au rapport d’origine, rubrique par rubrique</small>
        </span>
        <span class="chevron" aria-hidden="true">›</span>
      </button>
    {/if}
  {/if}
</article>

<style>
  /*
   * § 10 de l'ordre : ivoire chaud, vert profond, alertes mesurées. Les encres
   * ci-dessous sont MESURÉES sur fond blanc, pas choisies à l'œil.
   */
  .ecran {
    --encre-ecran: var(--verriere-encre, #0a2b23);
    --fond-ecran: var(--verriere-ivoire, #f7f6f2);
    --carte-fond: var(--verriere-blanc, #fff);
    --filet: rgb(10 43 35 / 10%);
    --encre-douce: var(--encre-doux, #4a5a55);
    --encre-ambre: #8a5a12;
    --alerte-ecran: var(--alerte, #a33220);
    background: var(--fond-ecran);
    color: var(--encre-ecran);
    padding: 1.25rem 1rem 2.5rem;
    max-width: 34rem;
    margin: 0 auto;
    font-size: 1rem;
    line-height: 1.5;
  }

  .titre {
    text-align: center;
    margin-bottom: 1.1rem;
  }
  /* Le bleu de la flamme du pack — matière, jamais information. */
  .flamme {
    width: 1.5rem;
    height: 1.9rem;
    color: #2f6f9e;
  }
  .titre h1 {
    font-family: var(--titre, Georgia, 'Times New Roman', serif);
    font-size: 1.7rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    margin: 0.05rem 0 0;
    font-weight: 500;
  }
  .sous-titre {
    margin: 0.15rem 0 0;
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--encre-ambre);
  }

  /* ── 2 · Le bandeau sombre ───────────────────────────────────────────── */
  .bandeau {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    /* Le fond plein d'abord : sans lui, le verdict disparaît en forced-colors. */
    background-color: #0a2b23;
    background-image: linear-gradient(155deg, #123f34 0%, #08241d 100%);
    color: var(--verriere-ivoire, #f7f6f2);
    border-radius: 1.1rem;
    padding: 1.15rem 0.6rem 1.25rem 1.25rem;
    overflow: hidden;
  }
  .dedans {
    min-width: 0;
    flex: 1 1 auto;
  }
  .chapeau {
    margin: 0;
    font-size: 0.64rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    opacity: 0.72;
  }
  .bas {
    margin-top: 0.85rem;
  }
  .verdict {
    font-family: var(--titre, Georgia, serif);
    font-size: 1.28rem;
    line-height: 1.24;
    margin: 0.4rem 0 0;
    font-weight: 500;
  }
  /* Encre sombre sur pastille claire — mesuré : #0a2b23 sur #d8a53c = 8,4:1. */
  .pastille {
    display: inline-block;
    margin: 0.45rem 0 0;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    background: #d8a53c;
    color: #0a2b23;
  }
  .pastille[data-ton='alerte'] {
    background: #d98f6b;
  }
  .pastille[data-ton='doux'] {
    background: #a8c0b6;
  }
  .pastille[data-ton='neutre'] {
    background: rgb(247 246 242 / 22%);
    color: var(--verriere-ivoire, #f7f6f2);
  }
  .medaillon {
    width: 7.2rem;
    height: 7.2rem;
    flex: none;
  }
  .jauge {
    stroke: #d8a53c;
  }
  [data-issue='dgi'] .jauge {
    stroke: #d98f6b;
  }
  [data-issue='aucune'] .jauge {
    stroke: #7fb08c;
  }
  .ecusson path,
  .ecusson circle {
    fill: none;
    stroke: #c9821f;
    stroke-width: 2;
  }
  [data-issue='dgi'] .ecusson path,
  [data-issue='dgi'] .ecusson circle {
    stroke: var(--alerte, #a33220);
  }
  [data-issue='aucune'] .ecusson path,
  [data-issue='aucune'] .ecusson circle {
    stroke: var(--vert-800, #12463b);
  }
  .ecusson .point {
    fill: currentcolor;
    stroke: none;
  }

  /* ── Rubriques et cartes ─────────────────────────────────────────────── */
  .rubrique {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    letter-spacing: 0.17em;
    text-transform: uppercase;
    font-weight: 700;
    margin: 1.5rem 0 0.7rem;
  }
  .dans-carte {
    margin: 0;
  }
  .carte {
    margin-top: 1.1rem;
    background: var(--carte-fond);
    border: 1px solid var(--filet);
    border-radius: 1.1rem;
    padding: 0.95rem 1rem 1rem;
  }
  .tete {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    width: 100%;
    max-width: 100%;
    min-height: 2.6rem;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: none;
    border: 0;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }
  .tete .rubrique {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .nombre-tete {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--encre-douce);
  }
  .tete:focus-visible,
  .lien-detail:focus-visible,
  .rapport:focus-visible {
    outline: 2px solid var(--vert-800, #12463b);
    outline-offset: 2px;
  }
  .icone {
    width: 1.15rem;
    height: 1.15rem;
    flex: none;
  }
  .chevron {
    margin-left: auto;
    padding-left: 0.5rem;
    font-size: 1.3rem;
    line-height: 1;
    color: var(--encre-douce);
  }
  /*
   * Le chevron tourne DANS une boîte fixe : en `inline-block`, le glyphe pivoté
   * débordait sa ligne et poussait la tête de carte hors de sa boîte.
   */
  .pivot {
    display: grid;
    place-items: center;
    width: 1.4rem;
    height: 1.4rem;
    padding-left: 0;
    transform: rotate(90deg);
    transition: transform 0.15s ease;
  }
  .pivot.ouvert {
    transform: rotate(-90deg);
  }

  /* ── § 33 · Les contradictions ───────────────────────────────────────── */
  .ecart {
    border-color: rgb(163 50 32 / 30%);
    background: rgb(163 50 32 / 4%);
  }
  .liste-ecarts {
    list-style: none;
    margin: 0.6rem 0 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
    font-size: 0.9rem;
  }
  .liste-ecarts li {
    padding-left: 0.9rem;
    border-left: 2px solid var(--alerte-ecran);
    line-height: 1.45;
  }

  /* ── 3 · Points clés ─────────────────────────────────────────────────── */
  .cles,
  .etablis,
  .puces,
  .legende,
  .grille {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .cle {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    width: 100%;
    background: var(--carte-fond);
    border: 1px solid var(--filet);
    border-radius: 0.9rem;
    padding: 0.85rem 0.95rem;
    margin-bottom: 0.6rem;
  }
  .rond {
    display: grid;
    place-items: center;
    width: 2.3rem;
    height: 2.3rem;
    flex: none;
    border-radius: 50%;
    background: var(--vert-100, #e6ede4);
    color: var(--vert-800, #12463b);
  }
  .rond svg {
    width: 1.2rem;
    height: 1.2rem;
  }
  .cle[data-ton='alerte'] .rond {
    background: rgb(163 50 32 / 12%);
    color: var(--alerte-ecran);
  }
  .cle[data-ton='attention'] .rond {
    background: #f2e9d8;
    color: var(--encre-ambre);
  }
  .dit {
    display: flex;
    flex-direction: column;
    gap: 0.12rem;
    min-width: 0;
  }
  .dit strong {
    font-weight: 600;
    font-size: 0.96rem;
  }
  .dit small {
    font-size: 0.83rem;
    color: var(--encre-douce);
    line-height: 1.4;
  }
  .reserve {
    font-size: 0.83rem;
    font-style: normal;
    color: var(--encre-ambre);
    line-height: 1.4;
  }

  /* ── 4 · L'anneau et sa légende ──────────────────────────────────────── */
  .compte {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    margin-top: 0.9rem;
  }
  .anneau {
    width: 7.6rem;
    height: 7.6rem;
    flex: none;
  }
  .grand {
    font-family: var(--titre, Georgia, serif);
    font-size: 1.85rem;
    font-weight: 600;
    fill: var(--encre-ecran);
  }
  .petit {
    font-size: 0.58rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    fill: var(--encre-douce);
  }
  .legende {
    display: grid;
    gap: 0.42rem;
    font-size: 0.83rem;
    min-width: 0;
    flex: 1 1 auto;
  }
  .legende li {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }
  .point-legende {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    flex: none;
  }
  .legende .nom {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .legende .valeur {
    margin-left: auto;
    font-weight: 700;
  }
  .rien {
    color: var(--encre-douce);
    line-height: 1.4;
  }

  /* ── 5 · Ce que le rapport établit ───────────────────────────────────── */
  .etablis {
    display: grid;
    gap: 0.7rem;
    margin-top: 0.85rem;
  }
  .etablis li {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
  }
  .vignette {
    width: 0.55rem;
    height: 0.55rem;
    margin-top: 0.42rem;
    flex: none;
    border-radius: 0.15rem;
    background: var(--vert-800, #12463b);
  }

  /* ── 6 · Puces ───────────────────────────────────────────────────────── */
  .puces {
    display: grid;
    gap: 0.55rem;
    margin-top: 0.75rem;
    font-size: 0.9rem;
  }
  .puces li {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
  }
  .puce {
    width: 0.45rem;
    height: 0.45rem;
    margin-top: 0.45rem;
    flex: none;
    border-radius: 50%;
    background: currentcolor;
  }
  .simples .puce {
    background: var(--vert-800, #12463b);
  }
  .corps {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }
  .libelle {
    overflow-wrap: anywhere;
  }
  .ou {
    font-style: normal;
    font-size: 0.82rem;
    color: var(--encre-douce);
  }
  .code {
    margin-left: auto;
    flex: none;
    align-self: flex-start;
    padding: 0.16rem 0.45rem;
    border-radius: 0.35rem;
    background: rgb(10 43 35 / 7%);
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  /* ── 7 · Les groupes par niveau ──────────────────────────────────────── */
  .groupe {
    margin-top: 1.1rem;
    border: 1px solid var(--filet);
    border-radius: 1.1rem;
    padding: 0.95rem 1rem 1rem;
    background: var(--carte-fond);
  }
  .groupe[data-ton='alerte'] {
    border-color: rgb(163 50 32 / 28%);
    background: rgb(163 50 32 / 4%);
    color: var(--alerte-ecran);
  }
  .groupe[data-ton='attention'] {
    border-color: rgb(201 130 31 / 30%);
    background: rgb(201 130 31 / 5%);
    color: var(--encre-ambre);
  }
  .groupe[data-ton='doux'] {
    border-color: rgb(10 43 35 / 16%);
    background: rgb(216 180 92 / 8%);
    color: var(--encre-ecran);
  }
  .tete-groupe {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0;
    font-size: 0.86rem;
    font-weight: 700;
  }
  .sigle {
    padding: 0.14rem 0.45rem;
    border-radius: 0.35rem;
    background: currentcolor;
    font-size: 0.76rem;
    letter-spacing: 0.04em;
  }
  /* Le sigle est de l'encre inversée : la pastille porte la couleur du groupe. */
  .groupe[data-ton='alerte'] .sigle,
  .groupe[data-ton='attention'] .sigle,
  .groupe[data-ton='doux'] .sigle {
    color: var(--carte-fond);
  }
  .quoi {
    min-width: 0;
    overflow-wrap: anywhere;
    font-weight: 600;
  }
  .nombre {
    margin-left: auto;
    font-weight: 700;
  }
  /* Le corps des anomalies reprend l'encre normale : la teinte reste au cadre. */
  .groupe .puces {
    color: var(--encre-ecran);
  }
  .lien-detail {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    margin-top: 0.75rem;
    padding: 0;
    background: none;
    border: 0;
    font: inherit;
    font-size: 0.83rem;
    font-weight: 600;
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    cursor: pointer;
  }
  .detail-norme {
    margin: 0.55rem 0 0;
    font-size: 0.86rem;
    line-height: 1.45;
    color: var(--encre-ecran);
  }
  .note-groupes {
    margin: 0.9rem 0 0;
    font-size: 0.8rem;
    line-height: 1.45;
    color: var(--encre-douce);
  }

  /* ── 8 · Ce qui n'a pas été contrôlé ─────────────────────────────────── */
  .sous-rubrique {
    margin: 0.85rem 0 0.5rem;
    font-size: 0.74rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--encre-douce);
  }
  .grille {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
    gap: 0.55rem;
  }
  .grille li {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    padding: 0.55rem 0.65rem;
    border: 1px solid var(--filet);
    border-radius: 0.7rem;
    font-size: 0.84rem;
    min-width: 0;
  }
  .grille strong {
    font-weight: 600;
    overflow-wrap: anywhere;
  }
  .grille small {
    color: var(--encre-douce);
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  /* ── 9 · La couverture ───────────────────────────────────────────────── */
  .grand-compte {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin: 0.8rem 0 0.5rem;
    font-family: var(--titre, Georgia, serif);
    font-size: 2rem;
    font-weight: 600;
  }
  .grand-compte span {
    font-family: inherit;
    font-size: 0.78rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--encre-douce);
  }
  .jauge-barre {
    height: 0.4rem;
    border-radius: 0.2rem;
    background: rgb(10 43 35 / 9%);
    overflow: hidden;
  }
  .jauge-barre span {
    display: block;
    height: 100%;
    background: #c9821f;
  }
  .phrase-couverture {
    margin: 0.6rem 0 0;
    font-size: 0.86rem;
    line-height: 1.45;
    color: var(--encre-ecran);
  }

  /* ── 10 · Le conseil ─────────────────────────────────────────────────── */
  .conseil {
    background: var(--vert-100, #e6ede4);
    border-color: rgb(18 70 59 / 18%);
  }
  .dit-conseil {
    margin: 0.6rem 0 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  /* ── Le format non reconnu ───────────────────────────────────────────── */
  .non-lu {
    border-color: rgb(201 130 31 / 32%);
    background: rgb(201 130 31 / 5%);
  }
  .dit-non-lu {
    margin: 0.6rem 0 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  /* ── 11 · Le rapport ─────────────────────────────────────────────────── */
  .rapport {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    width: 100%;
    margin-top: 1.1rem;
    padding: 0.9rem 1rem;
    background: var(--carte-fond);
    border: 1px solid var(--filet);
    border-radius: 1.1rem;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  @media (prefers-reduced-motion: reduce) {
    .pivot {
      transition: none;
    }
  }
</style>
