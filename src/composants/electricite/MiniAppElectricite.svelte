<script lang="ts">
  /**
   * L'ÉLECTRICITÉ — la mini-app, sur le visuel du pack du 22/08/2026.
   *
   * ═══════════════════════════════════════════════════════════════════════════
   * LA FORME VIENT DE LA PLANCHE. LES DONNÉES VIENNENT DU RAPPORT.
   * ═══════════════════════════════════════════════════════════════════════════
   *
   * `VERRIERE_ELECTRICITE_PACK_CLAUDE.zip`. Les onze cartes de la référence sont
   * ici, dans son ordre :
   *
   *   1  en-tête ÉLECTRICITÉ / SYNTHÈSE DU DIAGNOSTIC
   *   2  RÉSULTAT GLOBAL — carte sombre, médaillon annulaire, pastille
   *   3  POINTS CLÉS — cartes à jeton rond et chevron
   *   4  RÉSULTAT GLOBAL DÉTAILLÉ — l'anneau, le grand chiffre, la légende
   *   5  CE QUI A ÉTÉ CONTRÔLÉ — une ligne par domaine, avec SON état
   *   6  les anomalies, groupées par domaine
   *   7  CE QUI N'A PAS ÉTÉ CONTRÔLÉ
   *   8  la carte de complétude
   *   9  CONSEIL VERRIÈRE
   *  10  VOIR LE RAPPORT COMPLET
   *  11  la barre Synthèse / Détails / Photos / Conseils
   *
   * ── CE QUE LA PLANCHE MONTRE ET QUE L'ÉCRAN NE MONTRERA PAS ─────────────────
   *
   * Le README du pack pose la règle cardinale : « les chiffres, codes, articles,
   * catégories, niveaux de risque et pourcentages visibles sur l'image sont
   * fictifs et ne doivent jamais être codés comme valeurs par défaut ».
   *
   *   ┌────────────────────────────────┬──────────────────────────────────────┐
   *   │ la planche affiche             │ ce que la carte porte ici            │
   *   ├────────────────────────────────┼──────────────────────────────────────┤
   *   │ « Installation électrique      │ la phrase du rapport. Le § 4 de      │
   *   │   non conforme »               │ l'ordre interdit d'écrire une        │
   *   │                                │ (non-)conformité à la NF C 15-100 :  │
   *   │                                │ ce diagnostic n'en atteste aucune    │
   *   │ « NIVEAU DE RISQUE ·           │ le compte réel d'anomalies. Aucune   │
   *   │   RISQUE MODÉRÉ »              │ échelle de risque n'existe dans un   │
   *   │                                │ état de l'installation intérieure    │
   *   │ 3 familles de gravité —        │ les DOMAINES du rapport, qui sont sa │
   *   │ à risque / importantes /       │ propre colonne de gauche. Le § 3     │
   *   │ à améliorer                    │ interdit de reclasser sans règle     │
   *   │                                │ validée ; le § 2 demande justement   │
   *   │                                │ « des familles utiles »              │
   *   │ « Art. 531.3.1 » en regard     │ le code du rapport quand il en écrit │
   *   │ de chaque anomalie             │ un, rien sinon. LICIEL n'en écrit    │
   *   │                                │ pas toujours                         │
   *   │ « Points de contrôle           │ ce nombre n'est écrit dans aucun     │
   *   │   conformes : 18 »             │ rapport lu                           │
   *   │ « NIVEAU DE CONFIANCE : 80 % » │ § 7 : à défaut de méthode validée,   │
   *   │                                │ une phrase factuelle                 │
   *   └────────────────────────────────┴──────────────────────────────────────┘
   *
   * ── ET LE DÉFAUT QUE CET ÉCRAN EXISTE POUR RÉPARER ──────────────────────────
   *
   * Mesuré le 22/08 sur sept volets réels : le rapport annonce 16 anomalies,
   * l'extraction en rend 18, l'ancien écran en montrait 7. **Onze anomalies
   * réelles, avec leurs localisations, n'arrivaient jamais à l'œil** — parce que
   * l'écran ne montrait que celles qu'il savait placer sur son dessin.
   *
   * Ici, la liste part de `synthese.anomalies` et les rend toutes. Quand le
   * compte annoncé par le rapport et le compte rendu diffèrent, **l'écart
   * s'affiche** : une perte se dit, elle ne se maquille pas en total.
   *
   * ── DEUX CANAUX, JAMAIS LA COULEUR SEULE ────────────────────────────────────
   *
   * Le § 4 de l'ordre : « la couleur ne doit jamais être le seul indicateur ».
   * Chaque état porte un MOT — « Anomalie relevée », « Aucune anomalie
   * relevée », « Non vérifié », « Non conclu » — et le mot suffit seul.
   */
  import type { Diagnostic } from '../../lib/modele';
  import { syntheseElectricite, type Etat } from './synthese';

  /*
   * L'en-tête et les onglets sont optionnels : l'écran vit à deux endroits.
   * Dans la fiche du dossier, la carte porte déjà le titre et l'app sa propre
   * navigation. Un onglet qui ne mène nulle part est pire qu'un onglet absent.
   */
  let {
    diagnostic,
    entete = true,
    versRapport,
    versDetails,
    versPhotos,
    versConseils
  }: {
    diagnostic: Diagnostic;
    entete?: boolean;
    versRapport?: () => void;
    versDetails?: () => void;
    versPhotos?: () => void;
    versConseils?: () => void;
  } = $props();

  const s = $derived(syntheseElectricite(diagnostic));

  /** Le mot de chaque état. Il suffit seul, sans la couleur. */
  const MOT: Record<Etat, string> = {
    anomalie: 'Anomalie relevée',
    sansAnomalie: 'Aucune anomalie relevée',
    nonVerifie: 'Non vérifié',
    inconnu: 'Non conclu'
  };

  /** Le mot de la pastille du bandeau — le compte, jamais un niveau de risque. */
  const pastille = $derived(
    s.issue === 'anomalies'
      ? s.anomalies.length === 1
        ? '1 anomalie relevée'
        : `${s.anomalies.length} anomalies relevées`
      : s.issue === 'sansAnomalie'
        ? 'Aucune anomalie relevée'
        : 'Conclusion non lue'
  );

  const avecAnomalie = $derived(s.domaines.filter((d) => d.etat === 'anomalie'));
  const ouvert = $state<Record<string, boolean>>({ constatations: true, limites: true });

  function allerA(ancre: string): void {
    document.getElementById(ancre)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /*
   * L'ANNEAU — six arcs, un par domaine, et rien d'inventé dedans.
   *
   * La planche dessine un donut coloré. Le sien répartit des familles de
   * gravité qui n'existent pas ; celui-ci répartit les six domaines du contrôle,
   * chacun coloré par SON état. C'est la même image, et elle dit quelque chose
   * de vrai : où le rapport a relevé, où il n'a rien relevé, où il n'a pas pu
   * vérifier.
   */
  const RAYON = 52;
  const PERIMETRE = 2 * Math.PI * RAYON;
  const arcs = $derived(
    s.domaines.map((d, i) => ({
      etat: d.etat,
      nom: d.nom,
      /* Un sixième du cercle, moins un petit blanc pour séparer les arcs. */
      longueur: PERIMETRE / 6 - 4,
      decalage: -(PERIMETRE / 6) * i
    }))
  );
</script>

<article class="ecran" data-issue={s.issue}>
  {#if entete}
    <header class="titre">
      <svg class="eclair" viewBox="0 0 24 32" aria-hidden="true">
        <path d="M14 2 5 18h6l-2 12 10-17h-6l1-11Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
      </svg>
      <h1>Électricité</h1>
      <p class="sous-titre">Synthèse du diagnostic</p>
    </header>
  {/if}

  <!-- ══ 2 · RÉSULTAT GLOBAL ═══════════════════════════════════════════════ -->
  <section class="bandeau" aria-labelledby="resultat-elec">
    <div class="dedans">
      <p class="chapeau" id="resultat-elec">Résultat global</p>
      <p class="verdict">{s.resultat}</p>
      <p class="chapeau bas">Ce que le rapport conclut</p>
      <p class="jeton-etat">{pastille}</p>
    </div>
    <!-- Le médaillon de la planche : l'anneau des six domaines. -->
    <svg class="medaillon" viewBox="0 0 130 130" role="img" aria-label="Les six domaines du contrôle">
      {#each arcs as a (a.nom)}
        <circle
          class="arc"
          data-etat={a.etat}
          cx="65"
          cy="65"
          r={RAYON}
          fill="none"
          stroke-width="9"
          stroke-linecap="butt"
          stroke-dasharray="{a.longueur} {PERIMETRE}"
          stroke-dashoffset={a.decalage}
          transform="rotate(-90 65 65)"
        />
      {/each}
      <g class="ecusson">
        <path d="M65 38l16 6v14c0 11-7 19-16 22-9-3-16-11-16-22V44Z" />
        {#if s.issue === 'anomalies'}
          <path class="signe" d="M65 50v14" stroke-width="3.4" stroke-linecap="round" />
          <circle class="plein" cx="65" cy="70.5" r="2" />
        {:else if s.issue === 'sansAnomalie'}
          <path class="signe" d="M57 60l6 6 11-12" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        {:else}
          <path class="signe" d="M60 58h10M60 65h10" stroke-width="3" stroke-linecap="round" />
        {/if}
      </g>
    </svg>
  </section>

  <!-- ══ 3 · POINTS CLÉS ═══════════════════════════════════════════════════ -->
  {#if s.pointsCles.length}
    <h2 class="rubrique">Points clés</h2>
    <ul class="cles">
      {#each s.pointsCles as p (p.titre)}
        <li>
          <svelte:element
            this={p.ancre ? 'button' : 'div'}
            class="cle"
            data-ton={p.ton}
            type={p.ancre ? 'button' : undefined}
            onclick={p.ancre ? () => allerA(p.ancre!) : undefined}
          >
            <span class="rond" aria-hidden="true">
              {#if p.ton === 'bon'}
                <svg viewBox="0 0 20 20"><path d="M5 10.5 8.5 14 15 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {:else if p.ton === 'alerte'}
                <svg viewBox="0 0 20 20"><path d="M10 3.5 18.5 17.5H1.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" /><path d="M10 8.5v3.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /><circle cx="10" cy="14.4" r="1" fill="currentColor" /></svg>
              {:else}
                <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="6.8" fill="none" stroke="currentColor" stroke-width="1.7" /><path d="M10 6.2v4.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /><circle cx="10" cy="13.6" r="1" fill="currentColor" /></svg>
              {/if}
            </span>
            <span class="dit">
              <strong>{p.titre}</strong>
              {#if p.detail}<small>{p.detail}</small>{/if}
            </span>
            {#if p.ancre}<span class="chevron" aria-hidden="true">›</span>{/if}
          </svelte:element>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- ══ 4 · RÉSULTAT GLOBAL DÉTAILLÉ ══════════════════════════════════════ -->
  <section class="carte detaille" aria-labelledby="detaille">
    <p class="rubrique dans-carte" id="detaille">Résultat global détaillé</p>
    <div class="compte">
      <!--
        ⚠️ « 0 » N'EST PAS UNE RÉPONSE QUAND LA CONCLUSION N'A PAS ÉTÉ LUE.

        Vu à l'écran le 22/08 : sur un volet dont la conclusion est cochée à la
        main — donc illisible pour un programme — le grand chiffre affichait
        « 0 anomalies relevées ». C'est une bonne nouvelle inventée, et c'est le
        pire sens dans lequel une information peut être transformée. Le chiffre
        cède alors la place à un tiret, et le mot dit pourquoi.
      -->
      {#if s.issue === 'nonLu'}
        <p class="vedette">
          <strong aria-hidden="true">—</strong>
          <span>conclusion<br />non lue</span>
        </p>
      {:else}
        <p class="vedette">
          <strong>{s.anomalies.length}</strong>
          <span>{s.anomalies.length === 1 ? 'anomalie' : 'anomalies'}<br />relevée{s.anomalies.length === 1 ? '' : 's'}</span>
        </p>
      {/if}
      <ul class="legende">
        {#each s.domaines as d (d.numero)}
          <li>
            <span class="pastille-etat" data-etat={d.etat} aria-hidden="true"></span>
            <span class="nom">{d.nom}</span>
            <span class="valeur">{d.etat === 'anomalie' ? d.anomalies.length : MOT[d.etat]}</span>
          </li>
        {/each}
        {#if s.horsDomaine.length}
          <li>
            <span class="pastille-etat" data-etat="anomalie" aria-hidden="true"></span>
            <span class="nom">Hors des six domaines</span>
            <span class="valeur">{s.horsDomaine.length}</span>
          </li>
        {/if}
      </ul>
    </div>
    <!--
      ⚠️ L'ÉCART SE DIT. Le rapport écrit un compte ; l'écran en affiche un
      autre quand une ligne n'a pas pu être lue. Taire la différence
      transformerait une perte en total.
    -->
    {#if s.compte.annonce !== null && s.compte.annonce !== s.compte.rendues}
      <p class="ecart">
        Le rapport annonce {s.compte.annonce} anomalie{s.compte.annonce > 1 ? 's' : ''} ; {s.compte.rendues}
        {s.compte.rendues > 1 ? 'ont' : 'a'} pu être {s.compte.rendues > 1 ? 'lues' : 'lue'} ligne à ligne.
        Reportez-vous au rapport pour {s.compte.annonce > s.compte.rendues ? 'les autres' : 'le détail'}.
      </p>
    {/if}
  </section>

  <!-- ══ 5 · CE QUI A ÉTÉ CONTRÔLÉ ═════════════════════════════════════════ -->
  <h2 class="rubrique" id="domaines">Ce qui a été contrôlé</h2>
  <p class="chapo">
    Les six domaines que ce diagnostic examine, et ce que le rapport dit de
    chacun. « Aucune anomalie relevée » n’est pas une attestation de conformité :
    ce contrôle évalue des risques, il ne certifie pas une installation.
  </p>
  <ul class="domaines">
    {#each s.domaines as d (d.numero)}
      <li class="domaine" data-etat={d.etat}>
        <span class="carre" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="4.5" y="3.5" width="15" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="1.5" />
            <path d="M8.5 8h7M8.5 12h7M8.5 16h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </span>
        <span class="dit">
          <strong>{d.nom}</strong>
          {#if d.motif}<small>{d.motif}</small>{/if}
        </span>
        <span class="statut" data-etat={d.etat}>
          {d.etat === 'anomalie' ? `${d.anomalies.length} anomalie${d.anomalies.length > 1 ? 's' : ''}` : MOT[d.etat]}
        </span>
      </li>
    {/each}
  </ul>

  <!--
    ⚠️ LA RÉSERVE QUI EMPÊCHE LES SIX LIGNES DE RASSURER À TORT.

    Le rapport peut dire que des points n'ont pas pu être vérifiés SANS dire
    lesquels. Laisser alors six lignes « Aucune anomalie relevée » ferait entrer
    un trou de contrôle dans un affichage rassurant — ce que le § 6 de l'ordre
    interdit. On ne devine pas le domaine concerné : on dit qu'on ne le sait pas.
  -->
  {#if s.nonAttribues}
    <p class="reserve">
      {s.nonAttribues === 1
        ? 'Un point de contrôle n’a pas pu être vérifié'
        : `${s.nonAttribues} points de contrôle n’ont pas pu être vérifiés`}, et le rapport ne dit pas
      auquel de ces domaines {s.nonAttribues === 1 ? 'il appartient' : 'ils appartiennent'}.
      « Aucune anomalie relevée » vaut donc pour ce qui a été vu.
    </p>
  {/if}

  <!-- ══ 6 · LES ANOMALIES, PAR DOMAINE ════════════════════════════════════ -->
  {#if s.anomalies.length}
    <h2 class="rubrique" id="anomalies">
      {s.anomalies.length === 1 ? 'L’anomalie relevée' : 'Les anomalies relevées'}
    </h2>
    {#each [...avecAnomalie, ...(s.horsDomaine.length ? [{ numero: 0, nom: 'Autres anomalies du rapport', etat: 'anomalie' as const, anomalies: s.horsDomaine }] : [])] as groupe (groupe.numero)}
      <section class="famille">
        <p class="tete-famille">
          <svg class="garde" viewBox="0 0 20 18" aria-hidden="true">
            <path d="M10 2 19 17H1Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
            <path d="M10 7v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="10" cy="14.4" r="0.9" fill="currentColor" />
          </svg>
          <span>{groupe.nom}</span>
          <span class="nombre">({groupe.anomalies.length})</span>
        </p>
        <ul class="anomalies">
          {#each groupe.anomalies as a, i (a.libelle + i)}
            <li class="anomalie">
              <p class="libelle">
                {a.libelle}
                {#if a.code}<span class="code">{a.code}</span>{/if}
              </p>
              {#if a.localisations.length}
                <p class="ligne"><span class="etiq">Où</span><span>{a.localisations.join(' · ')}</span></p>
              {/if}
              {#if a.mesureCompensatoire}
                <!--
                  ⚠️ COMPENSÉ N'EST PAS RÉPARÉ. Une mesure compensatoire limite
                  le risque ; l'anomalie reste relevée, et le mot doit le dire.
                -->
                <p class="ligne compense">
                  <span class="etiq">Compensée</span>
                  <span>{a.mesureCompensatoire.libelle} — la mesure limite le risque, elle ne supprime pas l’anomalie.</span>
                </p>
              {/if}
              {#if a.geste}
                <p class="geste">{a.geste}</p>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  {/if}

  <!-- ══ 7 · CE QUI N'A PAS ÉTÉ CONTRÔLÉ ═══════════════════════════════════ -->
  {#if s.limites.montrer && s.limites.entrees.length}
    <section class="limites" aria-labelledby="limites">
      <button
        class="tete"
        type="button"
        id="limites"
        aria-expanded={ouvert.limites}
        onclick={() => (ouvert.limites = !ouvert.limites)}
      >
        <svg class="garde" viewBox="0 0 20 18" aria-hidden="true">
          <path d="M10 2 19 17H1Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          <path d="M10 7v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="10" cy="14.4" r="0.9" fill="currentColor" />
        </svg>
        <span class="rubrique dans-limites">Ce qui n’a pas été contrôlé</span>
        <span class="chevron pivot" class:ouvert={ouvert.limites} aria-hidden="true">›</span>
      </button>
      {#if ouvert.limites}
        <ul class="liste">
          {#each s.limites.entrees as l, i (l.quoi + i)}
            <li>
              <span class="puce sable" aria-hidden="true"></span>
              <span class="dit">
                <strong>{l.quoi}</strong>
                {#if l.pourquoi}<small>{l.pourquoi}</small>{/if}
              </span>
              <span class="statut-limite">Non contrôlé</span>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}

  <!-- ══ 8 · COMPLÉTUDE ════════════════════════════════════════════════════ -->
  {#if s.completude.length}
    <section class="carte" aria-labelledby="completude">
      <p class="rubrique dans-carte" id="completude">Ce que couvre ce contrôle</p>
      <ul class="liste serree">
        {#each s.completude as c, i (i)}
          <li><span class="puce" aria-hidden="true"></span><span>{c}</span></li>
        {/each}
      </ul>
    </section>
  {/if}

  <!-- ══ 9 · CONSEIL VERRIÈRE ══════════════════════════════════════════════ -->
  {#if s.conseil.length}
    <section class="conseil" aria-labelledby="conseil">
      <p class="tete fixe">
        <svg class="feuille" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M15 3c0 7-4 11-10 11 0-7 4-11 10-11Z" fill="none" stroke="currentColor" stroke-width="1.4" />
          <path d="M11 7c-3 2-5 5-6 8" fill="none" stroke="currentColor" stroke-width="1.2" />
        </svg>
        <span class="rubrique dans-carte" id="conseil">Conseil Verrière</span>
      </p>
      {#each s.conseil as c, i (i)}
        <p class="dit-conseil" class:premier={i === 0}>{c}</p>
      {/each}
    </section>
  {/if}

  <!-- ══ 10-11 · LE RAPPORT, PUIS LES ACCÈS ════════════════════════════════ -->
  {#if versRapport}
    <button class="rapport" type="button" onclick={versRapport}>
      <svg class="feuillet" viewBox="0 0 16 20" aria-hidden="true">
        <path d="M3 1h7l3 3v15H3Z" fill="none" stroke="currentColor" stroke-width="1.4" />
        <path d="M10 1v3h3" fill="none" stroke="currentColor" stroke-width="1.4" />
      </svg>
      <span class="dit">
        <strong>Voir le rapport complet</strong>
        <small>Accéder au rapport d’origine et aux photos</small>
      </span>
      <span class="fleche" aria-hidden="true">›</span>
    </button>
  {/if}

  <p class="source">Pages {s.pages[0]} à {s.pages[1]} du rapport.</p>

  {#if versDetails || versPhotos || versConseils}
    <nav class="acces" aria-label="Aller à">
      <span class="onglet actuel" aria-current="page">
        <svg viewBox="0 0 22 20" aria-hidden="true"><path d="M3 9.5 11 3l8 6.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /><path d="M5.5 9v8.5h11V9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /></svg>
        Synthèse
      </span>
      {#if versDetails}
        <button type="button" onclick={versDetails} class="onglet">
          <svg viewBox="0 0 22 20" aria-hidden="true"><path d="M8 5h11M8 10h11M8 15h11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /><circle cx="4" cy="5" r="1.2" fill="currentColor" /><circle cx="4" cy="10" r="1.2" fill="currentColor" /><circle cx="4" cy="15" r="1.2" fill="currentColor" /></svg>
          Détails
        </button>
      {/if}
      {#if versPhotos}
        <button type="button" onclick={versPhotos} class="onglet">
          <svg viewBox="0 0 22 20" aria-hidden="true"><path d="M2.5 6.5h4L8 4h6l1.5 2.5h4v10h-17Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /><circle cx="11" cy="11" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6" /></svg>
          Photos
        </button>
      {/if}
      {#if versConseils}
        <button type="button" onclick={versConseils} class="onglet">
          <svg viewBox="0 0 22 20" aria-hidden="true"><path d="M11 2.5a5.5 5.5 0 0 0-3 10.1V15h6v-2.4A5.5 5.5 0 0 0 11 2.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /><path d="M9 17.5h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
          Conseils
        </button>
      {/if}
    </nav>
  {/if}
</article>

<style>
  /*
   * La planche : ivoire chaud, vert profond, et un jaune électrique maîtrisé.
   *
   * § 10 de l'ordre : « conserver l'ivoire chaud, le vert profond et un jaune
   * électrique maîtrisé pour les alertes ; réserver le rouge aux situations
   * réellement justifiées ». Le rouge ne sert donc qu'aux domaines 2 et 5 —
   * ceux qui protègent les personnes — et jamais au fond d'une carte.
   */
  .ecran {
    --encre-ecran: var(--verriere-encre, #0a2b23);
    --fond-ecran: var(--verriere-ivoire, #f7f6f2);
    --carte: var(--verriere-blanc, #fff);
    --filet: rgb(10 43 35 / 10%);
    --sable: var(--verriere-sable-or, #c8a96b);
    --sable-clair: var(--verriere-champagne, #f2e9d8);
    /* Mesurés sur ivoire : 5,4:1 et 5,1:1. Le sable pur n'y arrive pas. */
    --encre-sable: #6b5220;
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
    margin-bottom: 1.25rem;
  }
  .eclair {
    width: 1.5rem;
    height: 2rem;
    color: var(--encre-sable);
  }
  .titre h1 {
    font-family: var(--titre, Georgia, 'Times New Roman', serif);
    font-size: 1.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin: 0.1rem 0 0;
    font-weight: 500;
  }
  .sous-titre {
    margin: 0.15rem 0 0;
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--encre-sable);
  }

  /* ── 2 · Le bandeau ──────────────────────────────────────────────────── */
  .bandeau {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    /*
     * ⚠️ Le dégradé n'est pas un fond de repli : sans `background-color`, le
     * verdict tombe à un contraste de 1,00 en `forced-colors` ou à
     * l'impression — ivoire sur ivoire. Le fond plein est posé d'abord.
     */
    background-color: #0a2b23;
    background-image: linear-gradient(160deg, #12463b 0%, #0a2b23 100%);
    color: var(--verriere-ivoire, #f7f6f2);
    border-radius: 1.15rem;
    padding: 1.15rem 0.9rem 1.25rem 1.25rem;
    overflow: hidden;
  }
  .dedans {
    min-width: 0;
    flex: 1 1 auto;
  }
  .chapeau {
    margin: 0;
    font-size: 0.66rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    opacity: 0.75;
  }
  .bas {
    margin-top: 0.9rem;
  }
  .verdict {
    font-family: var(--titre, Georgia, serif);
    font-size: 1.2rem;
    line-height: 1.3;
    margin: 0.4rem 0 0;
    font-weight: 500;
  }
  .jeton-etat {
    display: inline-block;
    margin: 0.45rem 0 0;
    padding: 0.42rem 0.9rem;
    background: rgb(247 246 242 / 8%);
    border: 1px solid rgb(247 246 242 / 35%);
    border-radius: 2rem;
    font-size: 0.8rem;
    letter-spacing: 0.06em;
  }
  [data-issue='anomalies'] .jeton-etat {
    border-color: rgb(224 178 92 / 85%);
  }
  .medaillon {
    width: 6.5rem;
    height: 6.5rem;
    flex: none;
  }
  .arc {
    stroke: rgb(247 246 242 / 22%);
  }
  .arc[data-etat='sansAnomalie'] {
    stroke: #6f9c7e;
  }
  .arc[data-etat='anomalie'] {
    stroke: var(--jaune, #e0b25c);
  }
  .arc[data-etat='nonVerifie'] {
    stroke: rgb(247 246 242 / 45%);
  }
  .ecusson path,
  .ecusson circle {
    fill: none;
    stroke: var(--verriere-ivoire, #f7f6f2);
    stroke-width: 1.6;
  }
  .ecusson .plein {
    fill: var(--verriere-ivoire, #f7f6f2);
    stroke: none;
  }
  .ecusson .signe {
    stroke: var(--verriere-ivoire, #f7f6f2);
  }

  /* ── Rubriques ───────────────────────────────────────────────────────── */
  .rubrique {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 600;
    margin: 1.6rem 0 0.7rem;
  }
  .dans-carte,
  .dans-limites {
    margin: 0;
  }
  .chapo {
    margin: -0.35rem 0 0.7rem;
    font-size: 0.85rem;
    line-height: 1.45;
    color: var(--encre-doux, #4a5a55);
  }

  /* ── 3 · Points clés ─────────────────────────────────────────────────── */
  .cles,
  .domaines,
  .anomalies,
  .liste,
  .legende {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .cle {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    width: 100%;
    background: var(--carte);
    border: 1px solid var(--filet);
    border-radius: 0.9rem;
    padding: 0.85rem 0.95rem;
    margin-bottom: 0.6rem;
    font: inherit;
    color: inherit;
    text-align: left;
  }
  button.cle {
    cursor: pointer;
  }
  button.cle:focus-visible,
  button.tete:focus-visible,
  .rapport:focus-visible,
  .onglet:focus-visible {
    outline: 2px solid var(--vert-800, #12463b);
    outline-offset: 2px;
  }
  .rond {
    display: grid;
    place-items: center;
    width: 2.15rem;
    height: 2.15rem;
    flex: none;
    border-radius: 50%;
    background: var(--vert-100, #e6ede4);
    border: 1px solid var(--filet);
    color: var(--vert-800, #12463b);
  }
  .rond svg {
    width: 1.15rem;
    height: 1.15rem;
  }
  .cle[data-ton='alerte'] .rond {
    background: rgb(163 50 32 / 12%);
    border-color: rgb(163 50 32 / 35%);
    color: var(--alerte-ecran);
  }
  .cle[data-ton='attention'] .rond {
    background: var(--sable-clair);
    border-color: rgb(200 169 107 / 55%);
    color: var(--encre-ambre);
  }
  .dit {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }
  .dit strong {
    font-weight: 600;
    font-size: 0.97rem;
  }
  .dit small {
    font-size: 0.84rem;
    color: var(--encre-doux, #4a5a55);
    line-height: 1.4;
  }
  .chevron {
    margin-left: auto;
    padding-left: 0.5rem;
    font-size: 1.3rem;
    line-height: 1;
    color: var(--encre-doux, #4a5a55);
  }

  /* ── 4 · Résultat détaillé ───────────────────────────────────────────── */
  .carte {
    margin-top: 1.4rem;
    background: var(--carte);
    border: 1px solid var(--filet);
    border-radius: 1.15rem;
    padding: 0.95rem 1rem 1rem;
  }
  .compte {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.8rem;
  }
  .vedette {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: none;
    margin: 0;
    padding-right: 1rem;
    border-right: 1px solid var(--filet);
    font-size: 0.76rem;
    line-height: 1.25;
    color: var(--encre-doux, #4a5a55);
  }
  .vedette strong {
    font-family: var(--titre, Georgia, serif);
    font-size: 2.5rem;
    font-weight: 500;
    line-height: 1;
    color: var(--vert-800, #12463b);
  }
  .legende {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 0.82rem;
  }
  .legende li {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.16rem 0;
  }
  .legende .nom {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .legende .valeur {
    margin-left: auto;
    padding-left: 0.5rem;
    flex: none;
    font-weight: 600;
    font-size: 0.78rem;
  }
  .pastille-etat {
    width: 0.55rem;
    height: 0.55rem;
    flex: none;
    border-radius: 50%;
    background: rgb(10 43 35 / 22%);
  }
  .pastille-etat[data-etat='anomalie'] {
    background: var(--jaune, #e0b25c);
  }
  .pastille-etat[data-etat='sansAnomalie'] {
    background: var(--vert-800, #12463b);
  }
  .ecart {
    margin: 0.85rem 0 0;
    padding-top: 0.7rem;
    border-top: 1px solid var(--filet);
    font-size: 0.84rem;
    line-height: 1.45;
    color: var(--encre-ambre);
  }

  /* ── 5 · Les domaines ────────────────────────────────────────────────── */
  .domaine {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background: var(--carte);
    border: 1px solid var(--filet);
    border-radius: 0.9rem;
    padding: 0.7rem 0.9rem;
    margin-bottom: 0.5rem;
  }
  .carre {
    display: grid;
    place-items: center;
    width: 2.15rem;
    height: 2.15rem;
    flex: none;
    border-radius: 0.65rem;
    background: var(--vert-100, #e6ede4);
    border: 1px solid var(--filet);
    color: var(--vert-800, #12463b);
  }
  .domaine[data-etat='anomalie'] .carre {
    background: var(--sable-clair);
    border-color: rgb(200 169 107 / 55%);
    color: var(--encre-ambre);
  }
  .carre svg {
    width: 1.2rem;
    height: 1.2rem;
  }
  .statut {
    margin-left: auto;
    padding-left: 0.5rem;
    flex: none;
    font-size: 0.78rem;
    text-align: right;
    color: var(--encre-doux, #4a5a55);
  }
  .statut[data-etat='anomalie'] {
    color: var(--encre-ambre);
    font-weight: 600;
  }

  .reserve {
    margin: 0.2rem 0 0;
    padding: 0.65rem 0.8rem;
    border-left: 3px solid var(--sable);
    background: var(--sable-clair);
    border-radius: 0 0.6rem 0.6rem 0;
    font-size: 0.85rem;
    line-height: 1.45;
    color: var(--encre-ambre);
  }

  /* ── 6 · Les anomalies ───────────────────────────────────────────────── */
  .famille {
    margin-bottom: 0.9rem;
    background: var(--sable-clair);
    border: 1px solid rgb(200 169 107 / 45%);
    border-radius: 1.15rem;
    padding: 0.85rem 1rem 0.9rem;
  }
  .tete-famille {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.5rem;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--encre-ambre);
  }
  .tete-famille .nombre {
    margin-left: auto;
  }
  .garde,
  .feuille {
    width: 1.1rem;
    height: 1.1rem;
    flex: none;
  }
  .anomalie {
    padding: 0.6rem 0;
    border-top: 1px solid rgb(200 169 107 / 40%);
  }
  .anomalie:first-child {
    border-top: 0;
    padding-top: 0.2rem;
  }
  .libelle {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.45;
  }
  .code {
    display: inline-block;
    margin-left: 0.4rem;
    padding: 0.1rem 0.4rem;
    border: 1px solid rgb(138 90 18 / 45%);
    border-radius: 0.35rem;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    color: var(--encre-ambre);
    white-space: nowrap;
  }
  .ligne {
    display: flex;
    gap: 0.55rem;
    margin: 0.35rem 0 0;
    font-size: 0.86rem;
    line-height: 1.4;
  }
  .etiq {
    flex: none;
    min-width: 4.4rem;
    font-size: 0.64rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--encre-sable);
    padding-top: 0.2rem;
  }
  .geste {
    margin: 0.5rem 0 0;
    padding: 0.5rem 0.6rem;
    background: rgb(255 255 255 / 60%);
    border-radius: 0.5rem;
    font-size: 0.86rem;
    line-height: 1.45;
  }

  /* ── 7 · Les limites ─────────────────────────────────────────────────── */
  .limites {
    margin-top: 1.4rem;
    background: var(--carte);
    border: 1px solid var(--filet);
    border-radius: 1.15rem;
    padding: 0 1rem 0.8rem;
  }
  .tete {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    width: 100%;
    min-height: 3rem;
    margin: 0;
    padding: 0.15rem 0;
    background: none;
    border: 0;
    font: inherit;
    color: inherit;
    text-align: left;
  }
  button.tete {
    cursor: pointer;
  }
  .limites .garde {
    color: var(--encre-ambre);
  }
  .pivot {
    display: inline-block;
    transform: rotate(90deg);
    transition: transform 0.15s ease;
  }
  .pivot.ouvert {
    transform: rotate(-90deg);
  }
  .liste li {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    padding: 0.55rem 0;
    border-bottom: 1px solid var(--filet);
    font-size: 0.92rem;
  }
  .liste li:last-child {
    border-bottom: 0;
  }
  .liste.serree li {
    border-bottom: 0;
    padding: 0.3rem 0;
  }
  .puce {
    width: 0.45rem;
    height: 0.45rem;
    flex: none;
    margin-top: 0.5rem;
    border-radius: 50%;
    background: var(--vert-800, #12463b);
  }
  .puce.sable {
    background: var(--sable);
  }
  .statut-limite {
    margin-left: auto;
    padding-left: 0.6rem;
    flex: none;
    font-size: 0.76rem;
    color: var(--encre-sable);
    white-space: nowrap;
  }

  /* ── 9 · Conseil ─────────────────────────────────────────────────────── */
  .conseil {
    margin-top: 1.4rem;
    background: var(--vert-100, #e6ede4);
    border-radius: 1.15rem;
    padding: 0 1rem 1.1rem;
  }
  .tete.fixe {
    cursor: default;
  }
  .dit-conseil {
    margin: 0.45rem 0 0;
    font-size: 0.92rem;
    line-height: 1.5;
  }
  .dit-conseil.premier {
    font-family: var(--titre, Georgia, serif);
    font-size: 1.05rem;
    font-weight: 500;
  }

  /* ── 10-11 · Accès ───────────────────────────────────────────────────── */
  .rapport {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    margin-top: 1.4rem;
    padding: 0.9rem 1rem;
    background: var(--carte);
    border: 1px solid var(--filet);
    border-radius: 0.9rem;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }
  .feuillet {
    width: 1.1rem;
    height: 1.4rem;
    flex: none;
    color: var(--vert-800, #12463b);
  }
  .fleche {
    margin-left: auto;
    font-size: 1.3rem;
    line-height: 1;
    color: var(--encre-doux, #4a5a55);
  }
  .acces {
    display: flex;
    gap: 0.4rem;
    margin-top: 1rem;
    padding-top: 0.9rem;
    border-top: 1px solid var(--filet);
  }
  /*
   * 44 px de haut, mesurés — la cible tactile, pas la hauteur du texte. Le § 10
   * de l'ordre demande une lecture mobile sans troncature ni survol.
   */
  .onglet {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    flex: 1;
    min-height: 3.25rem;
    padding: 0.4rem 0.2rem;
    background: none;
    border: 0;
    border-radius: 0.6rem;
    font: inherit;
    font-size: 0.72rem;
    color: var(--encre-doux, #4a5a55);
    cursor: pointer;
  }
  .onglet svg {
    width: 1.25rem;
    height: 1.15rem;
  }
  .onglet.actuel {
    color: var(--encre-ecran);
    font-weight: 600;
    background: var(--surface, rgb(10 43 35 / 3%));
    cursor: default;
  }
  .source {
    margin: 1.4rem 0 0;
    text-align: center;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    color: var(--encre-doux, #4a5a55);
  }

  @media (min-width: 30rem) {
    .ecran {
      padding: 2rem 1.5rem 3rem;
    }
    .verdict {
      font-size: 1.35rem;
    }
  }
</style>
