<script lang="ts">
  /**
   * L'ÉLECTRICITÉ — la mini-app, au visuel du pack du 22/08/2026.
   *
   * ═══════════════════════════════════════════════════════════════════════════
   * « JE VEUX LE MÊME VISUEL EXACTEMENT » — Aude, 22/08/2026
   * ═══════════════════════════════════════════════════════════════════════════
   *
   * `VERRIERE_ELECTRICITE_PACK_CLAUDE.zip`, planche
   * `01_VISUEL_REFERENCE_ELECTRICITE.png`. Toutes ses cartes sont ici, dans son
   * ordre et dans sa mise en page :
   *
   *   1  en-tête : éclair doré, ÉLECTRICITÉ, SYNTHÈSE DU DIAGNOSTIC
   *   2  RÉSULTAT GLOBAL — carte sombre, titre en trois lignes, NIVEAU DE
   *      RISQUE, pastille dorée pleine, médaillon annulaire à écusson
   *   3  POINTS CLÉS — jeton rond coloré, titre, sous-titre, chevron
   *   4  RÉSULTAT GLOBAL DÉTAILLÉ — l'anneau à gauche, le grand chiffre en son
   *      centre, la légende à points colorés à droite
   *   5  CE QUI A ÉTÉ CONTRÔLÉ — vignette carrée, libellé, statut, pastille
   *   6  CONSTATATIONS DIVERSES — carte dépliable à puces vertes
   *   7  ANOMALIES À RISQUE · IMPORTANTES · À AMÉLIORER — trois cartes teintées,
   *      puces de couleur, code du rapport à droite, lien vers le détail
   *   8  CE QUI N'A PAS ÉTÉ CONTRÔLÉ — puces grises, « Non contrôlé » à droite
   *   9  NIVEAU DE CONFIANCE — le grand pourcentage, la jauge, la phrase
   *  10  CONSEIL VERRIÈRE — carte vert pâle et sa lampe
   *  11  VOIR LE RAPPORT COMPLET, puis la barre d'onglets
   *
   * ── D'OÙ VIENNENT LES TROIS VALEURS QUE LE RAPPORT N'ÉCRIT PAS ──────────────
   *
   * Le README du pack l'exige : les valeurs de la maquette sont fictives. Elles
   * ne sont donc pas recopiées — elles se CALCULENT, par des règles écrites dans
   * `visuel.ts`, chacune fondée sur ce que le rapport établit :
   *
   *   NIVEAU DE RISQUE     élevé dès qu'une anomalie touche le différentiel, la
   *                        terre ou un contact direct — les points qui
   *                        protègent les PERSONNES au sens de l'arrêté
   *   LES TROIS FAMILLES   un rangement des six domaines de l'arrêté, jamais une
   *                        réécriture : chaque anomalie garde son libellé, son
   *                        code et ses localisations
   *   NIVEAU DE CONFIANCE  domaines renseignés / (renseignés + non vérifiés) —
   *                        et les points non vérifiés qu'aucun domaine
   *                        n'accueille entrent au dénominateur, sans quoi un
   *                        contrôle incomplet afficherait 100 %
   *
   * ⚠️ Ce sont des **lectures Verrière**, et l'écran le dit sous les trois
   * cartes d'anomalies. Le § 3 de l'ordre ne les autorise que « validées et
   * documentées » : elles sont documentées et testées, elles attendent la
   * validation d'Aude.
   *
   * ── ET CE QUI NE SERA JAMAIS RECOPIÉ DE LA PLANCHE ──────────────────────────
   *
   *   « Installation électrique non conforme »  § 4 : ce diagnostic n'atteste
   *                                             aucune conformité. On écrit la
   *                                             phrase du rapport
   *   « Art. 531.3.1 »                          le code du rapport quand il en
   *                                             écrit un, rien sinon
   *   « Points de contrôle conformes : 18 »     ce nombre n'existe nulle part
   *
   * ── LE DÉFAUT QUE CET ÉCRAN RÉPARE ──────────────────────────────────────────
   *
   * Mesuré sur sept volets réels : le rapport annonce 16 anomalies, l'extraction
   * en rend 18, l'ancien écran en montrait 7. Ici la liste part de
   * `synthese.anomalies` et les rend toutes.
   */
  import type { Diagnostic } from '../../lib/modele';
  import { syntheseElectricite, type Etat } from './synthese';
  import { confianceDe, famillesDe, niveauDeRisque, TITRE_BANDEAU, TON_RISQUE } from './visuel';

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
  const risque = $derived(niveauDeRisque(s));
  const confiance = $derived(confianceDe(s));
  const familles = $derived(famillesDe(s));

  /** Le mot de chaque état. Il suffit seul, sans la couleur. */
  const MOT: Record<Etat, string> = {
    anomalie: 'Anomalie relevée',
    sansAnomalie: 'Contrôlé',
    nonVerifie: 'Non vérifié',
    inconnu: 'Non conclu'
  };

  let limitesOuvertes = $state(true);
  let constatationsOuvertes = $state(true);
  const detailOuvert = $state<Record<string, boolean>>({});

  /*
   * L'ANNEAU DU RÉSULTAT DÉTAILLÉ — les parts de la planche, avec de vrais
   * nombres dedans.
   *
   * La maquette répartit ses douze anomalies en cinq tranches. Ici les tranches
   * sont : les trois familles, puis les domaines sans anomalie, puis ceux qui
   * n'ont pas pu être vérifiés. Chaque tranche a une COULEUR et une LIGNE de
   * légende chiffrée — jamais la couleur seule.
   */
  const TEINTES: Record<string, string> = {
    risque: 'var(--alerte, #a33220)',
    importante: '#c9821f',
    amelioration: 'var(--jaune, #e0b25c)',
    sansAnomalie: 'var(--vert-800, #12463b)',
    nonVerifie: 'rgb(10 43 35 / 22%)'
  };

  const tranches = $derived(
    [
      ...familles.map((f) => ({ cle: f.cle as string, nom: f.titre, valeur: f.anomalies.length })),
      {
        cle: 'sansAnomalie',
        nom: 'Domaines sans anomalie relevée',
        valeur: s.domaines.filter((d) => d.etat === 'sansAnomalie').length
      },
      {
        cle: 'nonVerifie',
        nom: 'Non vérifié / non conclu',
        valeur: s.domaines.filter((d) => d.etat === 'nonVerifie' || d.etat === 'inconnu').length + s.nonAttribues
      }
    ].filter((t) => t.valeur > 0)
  );

  const RAYON = 46;
  const PERIMETRE = 2 * Math.PI * RAYON;
  /* Le médaillon du bandeau a son propre rayon : 52. */
  const PERIMETRE_MEDAILLON = 2 * Math.PI * 52;
  const arcs = $derived.by(() => {
    const total = tranches.reduce((n, t) => n + t.valeur, 0) || 1;
    let parcouru = 0;
    return tranches.map((t) => {
      const longueur = (t.valeur / total) * PERIMETRE;
      const arc = { ...t, longueur: Math.max(longueur - 3, 1), decalage: -parcouru };
      parcouru += longueur;
      return arc;
    });
  });

  function allerA(ancre: string): void {
    document.getElementById(ancre)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<article class="ecran" data-issue={s.issue} data-risque={TON_RISQUE[risque]}>
  {#if entete}
    <header class="titre">
      <svg class="eclair" viewBox="0 0 24 32" aria-hidden="true">
        <path d="M14 2 5 18h6l-2 12 10-17h-6l1-11Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      </svg>
      <h1>Électricité</h1>
      <p class="sous-titre">Synthèse du diagnostic</p>
    </header>
  {/if}

  <!-- ══ 2 · RÉSULTAT GLOBAL ═══════════════════════════════════════════════ -->
  <section class="bandeau" aria-labelledby="resultat-elec">
    <div class="dedans">
      <p class="chapeau" id="resultat-elec">Résultat global</p>
      <!--
        Le titre court de la planche. La phrase exacte du rapport se lit juste
        en dessous, en détail du premier point clé — la place que la maquette
        lui donne. Rien ne se perd, et la carte tient en trois lignes.
      -->
      <p class="verdict">{TITRE_BANDEAU[s.issue]}</p>
      <p class="chapeau bas">Niveau de risque</p>
      <p class="pastille" data-ton={TON_RISQUE[risque]}>{risque}</p>
    </div>

    <!-- Le médaillon de la planche : l'anneau et son écusson. -->
    <svg class="medaillon" viewBox="0 0 130 130" role="img" aria-label="Niveau de risque : {risque}">
      <circle cx="65" cy="65" r="52" fill="none" stroke="rgb(247 246 242 / 14%)" stroke-width="9" />
      <circle
        class="jauge-risque"
        cx="65"
        cy="65"
        r="52"
        fill="none"
        stroke-width="9"
        stroke-linecap="round"
        stroke-dasharray="{(risque === 'ÉLEVÉ' ? 0.82 : risque === 'MODÉRÉ' ? 0.55 : risque === 'TRÈS FAIBLE' ? 0.22 : 0) *
          PERIMETRE_MEDAILLON} {PERIMETRE_MEDAILLON}"
        transform="rotate(-90 65 65)"
      />
      <circle cx="65" cy="65" r="38" fill="var(--verriere-blanc, #fff)" />
      <g class="ecusson">
        <path d="M65 44l14 5v12c0 10-6 16-14 19-8-3-14-9-14-19V49Z" />
        {#if s.issue === 'sansAnomalie'}
          <path class="signe" d="M58 64l5 5 10-11" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        {:else if s.issue === 'nonLu'}
          <path class="signe" d="M60 60h10M60 68h10" stroke-linecap="round" />
        {:else}
          <path class="signe" d="M65 54v11" stroke-linecap="round" />
          <circle class="point" cx="65" cy="71" r="1.9" />
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
            {#if p.ancre}<span class="chevron" aria-hidden="true">›</span>{/if}
          </svelte:element>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- ══ 4 · RÉSULTAT GLOBAL DÉTAILLÉ ══════════════════════════════════════ -->
  <section class="carte" aria-labelledby="detaille">
    <p class="rubrique dans-carte" id="detaille">Résultat global détaillé</p>
    <div class="compte">
      <svg class="anneau" viewBox="0 0 130 130" role="img" aria-label="Répartition du contrôle">
        <circle cx="65" cy="65" r={RAYON} fill="none" stroke="rgb(10 43 35 / 8%)" stroke-width="13" />
        {#each arcs as a (a.cle)}
          <circle
            cx="65"
            cy="65"
            r={RAYON}
            fill="none"
            stroke={TEINTES[a.cle]}
            stroke-width="13"
            stroke-dasharray="{a.longueur} {PERIMETRE}"
            stroke-dashoffset={a.decalage}
            transform="rotate(-90 65 65)"
          />
        {/each}
        <!--
          ⚠️ « 0 » N'EST PAS UNE RÉPONSE QUAND LA CONCLUSION N'A PAS ÉTÉ LUE.
          Vu à l'écran le 22/08 : le grand chiffre affichait « 0 anomalies » sur
          un volet dont la conclusion est cochée à la main. Une bonne nouvelle
          inventée — le pire sens dans lequel une information se transforme.
        -->
        <text class="grand" x="65" y="63" text-anchor="middle">
          {s.issue === 'nonLu' ? '—' : s.anomalies.length}
        </text>
        <text class="petit" x="65" y="79" text-anchor="middle">
          {s.issue === 'nonLu' ? 'conclusion' : s.anomalies.length === 1 ? 'anomalie' : 'anomalies'}
        </text>
        <text class="petit" x="65" y="91" text-anchor="middle">
          {s.issue === 'nonLu' ? 'non lue' : s.anomalies.length === 1 ? 'constatée' : 'constatées'}
        </text>
      </svg>
      <ul class="legende">
        {#each tranches as t (t.cle)}
          <li>
            <span class="point-legende" style="background:{TEINTES[t.cle]}" aria-hidden="true"></span>
            <span class="nom">{t.nom}</span>
            <span class="valeur">{t.valeur}</span>
          </li>
        {/each}
      </ul>
    </div>
    {#if s.compte.annonce !== null && s.compte.annonce !== s.compte.rendues}
      <p class="ecart">
        Le rapport annonce {s.compte.annonce} anomalie{s.compte.annonce > 1 ? 's' : ''} ; {s.compte.rendues}
        {s.compte.rendues > 1 ? 'ont' : 'a'} pu être {s.compte.rendues > 1 ? 'lues' : 'lue'} ligne à ligne.
      </p>
    {/if}
  </section>

  <!-- ══ 5 · CE QUI A ÉTÉ CONTRÔLÉ ═════════════════════════════════════════ -->
  <section class="carte" aria-labelledby="domaines">
    <p class="rubrique dans-carte" id="domaines">Ce qui a été contrôlé</p>
    <ul class="domaines">
      {#each s.domaines as d (d.numero)}
        <li class="domaine" data-etat={d.etat}>
          <span class="vignette" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5" />
              <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </span>
          <span class="dit">
            <strong>{d.nom}</strong>
            {#if d.motif}<small>{d.motif}</small>{/if}
          </span>
          <span class="statut" data-etat={d.etat}>
            {d.etat === 'anomalie' ? `${d.anomalies.length} anomalie${d.anomalies.length > 1 ? 's' : ''}` : MOT[d.etat]}
          </span>
          <span class="marque" data-etat={d.etat} aria-hidden="true">
            {#if d.etat === 'sansAnomalie'}
              <svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="currentColor" /><path d="M6.5 11.5l3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {:else if d.etat === 'anomalie'}
              <svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="currentColor" /><path d="M11 6v6" stroke="#fff" stroke-width="2" stroke-linecap="round" /><circle cx="11" cy="15.6" r="1.2" fill="#fff" /></svg>
            {:else}
              <svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="9.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 3" /></svg>
            {/if}
          </span>
        </li>
      {/each}
    </ul>
    {#if s.nonAttribues}
      <!--
        ⚠️ Le rapport peut dire que des points n'ont pas pu être vérifiés SANS
        dire lesquels. Laisser alors six lignes « Contrôlé » ferait entrer un
        trou de contrôle dans un affichage rassurant — § 6 de l'ordre.
      -->
      <p class="reserve">
        {s.nonAttribues === 1
          ? 'Un point de contrôle n’a pas pu être vérifié'
          : `${s.nonAttribues} points de contrôle n’ont pas pu être vérifiés`}, et le rapport ne dit pas
        auquel de ces domaines {s.nonAttribues === 1 ? 'il appartient' : 'ils appartiennent'}.
      </p>
    {/if}
  </section>

  <!-- ══ 6 · CONSTATATIONS DIVERSES ════════════════════════════════════════ -->
  {#if s.constatations.length}
    <section class="carte" aria-labelledby="constatations">
      <button
        class="tete"
        type="button"
        id="constatations"
        aria-expanded={constatationsOuvertes}
        onclick={() => (constatationsOuvertes = !constatationsOuvertes)}
      >
        <svg class="icone" viewBox="0 0 20 20" aria-hidden="true">
          <rect x="3.5" y="2.5" width="13" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="M7 7h6M7 10h6M7 13h3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        </svg>
        <span class="rubrique dans-carte">Constatations diverses</span>
        <span class="chevron pivot" class:ouvert={constatationsOuvertes} aria-hidden="true">›</span>
      </button>
      {#if constatationsOuvertes}
        <ul class="puces">
          {#each s.constatations as c, i (i)}
            <li><span class="puce verte" aria-hidden="true"></span><span class="corps">{c}</span></li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}

  <!-- ══ 7 · LES TROIS FAMILLES D'ANOMALIES ════════════════════════════════ -->
  {#if familles.length}
    <div id="anomalies">
      {#each familles as f (f.cle)}
        <section class="famille" data-famille={f.cle}>
          <p class="tete-famille">
            {#if f.cle === 'risque'}
              <svg class="icone" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 2.5l6 2.2v5.4c0 4.4-2.6 7.2-6 8.4-3.4-1.2-6-4-6-8.4V4.7Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M10 7v4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <circle cx="10" cy="13.7" r="0.95" fill="currentColor" />
              </svg>
            {:else}
              <svg class="icone" viewBox="0 0 20 18" aria-hidden="true">
                <path d="M10 2 19 17H1Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M10 7v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <circle cx="10" cy="14.4" r="0.9" fill="currentColor" />
              </svg>
            {/if}
            <span>{f.titre}</span>
            <span class="nombre">({f.anomalies.length})</span>
          </p>

          <ul class="puces">
            {#each f.anomalies as a, i (a.libelle + i)}
              <li>
                <span class="puce" aria-hidden="true"></span>
                <span class="corps">
                  <span class="libelle">{a.libelle}</span>
                  {#if a.localisations.length}
                    <em class="ou">{a.localisations.join(' · ')}</em>
                  {/if}
                </span>
                <!-- Le code de la planche — celui du rapport, ou rien. -->
                {#if a.code}<span class="code">{a.code}</span>{/if}
              </li>
            {/each}
          </ul>

          {#if f.anomalies.some((a) => a.geste || a.mesureCompensatoire)}
            <button
              class="lien-detail"
              type="button"
              aria-expanded={!!detailOuvert[f.cle]}
              onclick={() => (detailOuvert[f.cle] = !detailOuvert[f.cle])}
            >
              Voir le détail des {f.titre.toLowerCase()}
              <span aria-hidden="true">›</span>
            </button>
            {#if detailOuvert[f.cle]}
              <ul class="detail">
                {#each f.anomalies.filter((a) => a.geste || a.mesureCompensatoire) as a, i (a.libelle + i)}
                  <li>
                    <p class="detail-quoi">{a.libelle}</p>
                    {#if a.mesureCompensatoire}
                      <!-- ⚠️ COMPENSÉ N'EST PAS RÉPARÉ : l'anomalie reste relevée. -->
                      <p class="detail-ligne">
                        <span class="etiq">Compensée</span>
                        <span>{a.mesureCompensatoire.libelle} — la mesure limite le risque, elle ne supprime pas l’anomalie.</span>
                      </p>
                    {/if}
                    {#if a.geste}
                      <p class="detail-ligne"><span class="etiq">Le rapport demande</span><span>{a.geste}</span></p>
                    {/if}
                  </li>
                {/each}
              </ul>
            {/if}
          {/if}
        </section>
      {/each}

      <!--
        La note qui empêche les trois familles de passer pour des données du
        rapport. Il ne hiérarchise pas ses anomalies : ce rangement est une
        lecture Verrière, fondée sur les domaines de l'arrêté.
      -->
      <p class="note-familles">
        Ces trois familles sont un classement Verrière, fondé sur les domaines de
        l’arrêté du 28 septembre 2017. Le rapport, lui, ne hiérarchise pas ses
        anomalies : chaque libellé ci-dessus est le sien, mot pour mot.
      </p>
    </div>
  {/if}

  <!-- ══ 8 · CE QUI N'A PAS ÉTÉ CONTRÔLÉ ═══════════════════════════════════ -->
  {#if s.limites.entrees.length}
    <section class="carte" aria-labelledby="limites">
      <button
        class="tete"
        type="button"
        id="limites"
        aria-expanded={limitesOuvertes}
        onclick={() => (limitesOuvertes = !limitesOuvertes)}
      >
        <svg class="icone" viewBox="0 0 20 20" aria-hidden="true">
          <rect x="3.5" y="2.5" width="13" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="M7 7h6M7 10h6M7 13h3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        </svg>
        <span class="rubrique dans-carte">Ce qui n’a pas été contrôlé</span>
        <span class="chevron pivot" class:ouvert={limitesOuvertes} aria-hidden="true">›</span>
      </button>
      {#if limitesOuvertes}
        <ul class="puces grises">
          {#each s.limites.entrees as l, i (l.quoi + i)}
            <li>
              <span class="puce" aria-hidden="true"></span>
              <span class="corps">
                <span class="libelle">{l.quoi}</span>
                {#if l.pourquoi}<em class="ou">{l.pourquoi}</em>{/if}
              </span>
              <span class="statut-limite">Non contrôlé</span>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}

  <!-- ══ 9 · NIVEAU DE CONFIANCE ═══════════════════════════════════════════ -->
  <section class="carte" aria-labelledby="confiance">
    <p class="tete fixe">
      <svg class="icone" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 2.5l6 2.2v5.4c0 4.4-2.6 7.2-6 8.4-3.4-1.2-6-4-6-8.4V4.7Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
      </svg>
      <span class="rubrique dans-carte" id="confiance">Niveau de confiance</span>
    </p>
    {#if confiance.part !== null}
      <p class="pourcent">{confiance.part}%</p>
      <div class="jauge" role="img" aria-label="{confiance.part} % du contrôle renseigné">
        <span style="width:{confiance.part}%"></span>
      </div>
    {/if}
    <p class="dit-confiance">{confiance.dit}</p>
    {#if s.limites.entrees.length}
      <button class="lien-detail" type="button" onclick={() => allerA('limites')}>
        Voir le détail des zones non contrôlées <span aria-hidden="true">›</span>
      </button>
    {/if}
  </section>

  <!-- ══ 10 · CONSEIL VERRIÈRE ═════════════════════════════════════════════ -->
  {#if s.conseil.length}
    <section class="conseil" aria-labelledby="conseil">
      <p class="tete fixe">
        <svg class="icone" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M15 3c0 7-4 11-10 11 0-7 4-11 10-11Z" fill="none" stroke="currentColor" stroke-width="1.4" />
          <path d="M11 7c-3 2-5 5-6 8" fill="none" stroke="currentColor" stroke-width="1.2" />
        </svg>
        <span class="rubrique dans-carte" id="conseil">Conseil Verrière</span>
      </p>
      <div class="dedans-conseil">
        <div class="texte-conseil">
          {#each s.conseil as c, i (i)}
            <p class="dit-conseil" class:premier={i === 0}>{c}</p>
          {/each}
        </div>
        <!-- La lampe de la planche : matière, jamais information. -->
        <svg class="lampe" viewBox="0 0 90 110" aria-hidden="true">
          <path d="M45 4v22" stroke="currentColor" stroke-width="1.4" />
          <path d="M27 50l18-24 18 24Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M45 52v6" stroke="currentColor" stroke-width="1.4" />
          <g class="halo">
            <path d="M31 60l-9 44M45 60v44M59 60l9 44" stroke="currentColor" stroke-width="1.2" />
            <path d="M38 60l-4 44M52 60l4 44" stroke="currentColor" stroke-width="1" />
          </g>
        </svg>
      </div>
    </section>
  {/if}

  <!-- ══ 11 · LE RAPPORT, PUIS LES ACCÈS ═══════════════════════════════════ -->
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
   * § 10 de l'ordre : ivoire chaud, vert profond, jaune électrique maîtrisé pour
   * les alertes, rouge réservé aux situations réellement justifiées.
   *
   * ⚠️ Les encres sombres ci-dessous sont MESURÉES, pas choisies : le sable pur
   * (#c8a96b) donne 2,25:1 sur blanc — il reste une matière, jamais une encre.
   */
  .ecran {
    --encre-ecran: var(--verriere-encre, #0a2b23);
    --fond-ecran: var(--verriere-ivoire, #f7f6f2);
    --carte-fond: var(--verriere-blanc, #fff);
    --filet: rgb(10 43 35 / 10%);
    --sable: var(--verriere-sable-or, #c8a96b);
    --sable-clair: var(--verriere-champagne, #f2e9d8);
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
    margin-bottom: 1.1rem;
  }
  .eclair {
    width: 1.45rem;
    height: 1.95rem;
    color: #c9821f;
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
    color: var(--encre-sable);
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
  /*
   * La pastille pleine de la planche. Le doré porte de l'encre sombre —
   * mesuré : #0a2b23 sur #d8a53c donne 8,4:1.
   */
  .pastille {
    display: inline-block;
    margin: 0.45rem 0 0;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    background: #d8a53c;
    color: #0a2b23;
  }
  .pastille[data-ton='bon'] {
    background: #7fb08c;
  }
  .pastille[data-ton='alerte'] {
    background: #d98f6b;
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
  .jauge-risque {
    stroke: #d8a53c;
  }
  [data-risque='bon'] .jauge-risque {
    stroke: #7fb08c;
  }
  [data-risque='alerte'] .jauge-risque {
    stroke: #d98f6b;
  }
  .ecusson path,
  .ecusson circle {
    fill: none;
    stroke: #c9821f;
    stroke-width: 2;
  }
  [data-risque='bon'] .ecusson path,
  [data-risque='bon'] .ecusson circle {
    stroke: var(--vert-800, #12463b);
  }
  .ecusson .point {
    fill: #c9821f;
    stroke: none;
  }
  [data-risque='bon'] .ecusson .point {
    fill: var(--vert-800, #12463b);
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
    min-height: 2.9rem;
    margin: 0;
    padding: 0;
    background: none;
    border: 0;
    font: inherit;
    color: inherit;
    text-align: left;
  }
  button.tete {
    cursor: pointer;
  }
  /*
   * ⚠️ 6 px de débordement, mesurés au navigateur à 375 px.
   *
   * L'interlettrage de la rubrique ajoute un blanc après sa dernière lettre, et
   * ce blanc poussait la tête de carte au-delà de sa boîte. Six pixels ne se
   * voient pas — mais le § 10 de l'ordre demande « aucune information tronquée
   * sur mobile », et un débordement finit toujours par en tronquer une.
   */
  .tete {
    max-width: 100%;
    overflow: hidden;
  }
  .tete .rubrique {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .tete.fixe {
    cursor: default;
  }
  .icone {
    width: 1.15rem;
    height: 1.15rem;
    flex: none;
    color: var(--vert-800, #12463b);
  }
  .chevron {
    margin-left: auto;
    padding-left: 0.5rem;
    font-size: 1.3rem;
    line-height: 1;
    color: var(--encre-doux, #4a5a55);
  }
  /*
   * Le chevron tourne DANS une boîte fixe.
   *
   * Mesuré : en `inline-block`, le glyphe pivoté débordait sa ligne de 6 px et
   * poussait la tête de carte hors de sa boîte. Une boîte carrée, le glyphe
   * centré dedans, et la rotation ne déborde plus de rien.
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

  /* ── 3 · Points clés ─────────────────────────────────────────────────── */
  .cles,
  .domaines,
  .puces,
  .legende,
  .detail {
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
    font: inherit;
    color: inherit;
    text-align: left;
  }
  button.cle {
    cursor: pointer;
  }
  button.cle:focus-visible,
  button.tete:focus-visible,
  .lien-detail:focus-visible,
  .rapport:focus-visible,
  .onglet:focus-visible {
    outline: 2px solid var(--vert-800, #12463b);
    outline-offset: 2px;
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
    background: var(--sable-clair);
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
    color: var(--encre-doux, #4a5a55);
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
    font-size: 2.35rem;
    font-weight: 500;
    fill: var(--vert-800, #12463b);
  }
  .petit {
    font-size: 0.62rem;
    letter-spacing: 0.02em;
    fill: var(--encre-doux, #4a5a55);
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
    padding: 0.2rem 0;
  }
  .legende .nom {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .legende .valeur {
    margin-left: auto;
    padding-left: 0.5rem;
    flex: none;
    font-weight: 700;
  }
  .point-legende {
    width: 0.6rem;
    height: 0.6rem;
    flex: none;
    border-radius: 50%;
  }
  .ecart {
    margin: 0.8rem 0 0;
    padding-top: 0.7rem;
    border-top: 1px solid var(--filet);
    font-size: 0.83rem;
    line-height: 1.45;
    color: var(--encre-ambre);
  }

  /* ── 5 · Ce qui a été contrôlé ───────────────────────────────────────── */
  .domaine {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--filet);
  }
  .domaine:last-child {
    border-bottom: 0;
  }
  .vignette {
    display: grid;
    place-items: center;
    width: 2.1rem;
    height: 2.1rem;
    flex: none;
    border-radius: 0.6rem;
    background: var(--vert-100, #e6ede4);
    color: var(--vert-800, #12463b);
  }
  .domaine[data-etat='anomalie'] .vignette {
    background: var(--sable-clair);
    color: var(--encre-ambre);
  }
  .vignette svg {
    width: 1.15rem;
    height: 1.15rem;
  }
  .domaine .dit strong {
    font-weight: 500;
    font-size: 0.92rem;
  }
  .statut {
    margin-left: auto;
    padding-left: 0.5rem;
    flex: none;
    font-size: 0.8rem;
    text-align: right;
    color: var(--vert-800, #12463b);
  }
  .statut[data-etat='anomalie'] {
    color: var(--encre-ambre);
    font-weight: 600;
  }
  .statut[data-etat='nonVerifie'],
  .statut[data-etat='inconnu'] {
    color: var(--encre-doux, #4a5a55);
  }
  .marque {
    width: 1.35rem;
    height: 1.35rem;
    flex: none;
    color: var(--vert-800, #12463b);
  }
  .marque[data-etat='anomalie'] {
    color: #c9821f;
  }
  .marque[data-etat='nonVerifie'],
  .marque[data-etat='inconnu'] {
    color: rgb(10 43 35 / 30%);
  }
  .marque svg {
    width: 100%;
    height: 100%;
  }
  .reserve {
    margin: 0.7rem 0 0;
    padding: 0.6rem 0.75rem;
    border-left: 3px solid var(--sable);
    background: var(--sable-clair);
    border-radius: 0 0.5rem 0.5rem 0;
    font-size: 0.83rem;
    line-height: 1.45;
    color: var(--encre-ambre);
  }

  /* ── 6-8 · Les puces ─────────────────────────────────────────────────── */
  .puces li {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.4rem 0;
    font-size: 0.9rem;
    line-height: 1.45;
  }
  .puce {
    width: 0.5rem;
    height: 0.5rem;
    flex: none;
    margin-top: 0.45rem;
    border-radius: 50%;
    background: currentcolor;
  }
  .puce.verte {
    background: var(--vert-800, #12463b);
  }
  .puces.grises .puce {
    background: rgb(10 43 35 / 28%);
  }
  .corps {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .ou {
    font-style: normal;
    font-size: 0.82rem;
    color: var(--encre-doux, #4a5a55);
  }
  .statut-limite {
    margin-left: auto;
    padding-left: 0.6rem;
    flex: none;
    font-size: 0.78rem;
    color: var(--encre-doux, #4a5a55);
    white-space: nowrap;
  }

  /* ── 7 · Les trois familles ──────────────────────────────────────────── */
  .famille {
    margin-top: 1.1rem;
    border-radius: 1.1rem;
    padding: 0.9rem 1rem 0.85rem;
    border: 1px solid;
  }
  .famille[data-famille='risque'] {
    background: #fbf1ee;
    border-color: rgb(163 50 32 / 30%);
    color: var(--alerte-ecran);
  }
  .famille[data-famille='importante'] {
    background: #fdf4e6;
    border-color: rgb(201 130 31 / 32%);
    color: var(--encre-ambre);
  }
  .famille[data-famille='amelioration'] {
    background: #fdf9ec;
    border-color: rgb(200 169 107 / 45%);
    color: var(--encre-sable);
  }
  .tete-famille {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.35rem;
    font-size: 0.72rem;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    font-weight: 700;
  }
  .tete-famille .icone {
    color: inherit;
  }
  .tete-famille .nombre {
    margin-left: 0.1rem;
  }
  /* Le texte des lignes reprend l'encre sombre : la teinte de la carte porte
     la famille, jamais la lisibilité. */
  .famille .corps {
    color: var(--encre-ecran);
  }
  .code {
    margin-left: auto;
    padding-left: 0.6rem;
    flex: none;
    font-size: 0.76rem;
    white-space: nowrap;
    color: inherit;
  }
  .lien-detail {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    min-height: 2.75rem;
    margin: 0.2rem 0 0;
    padding: 0;
    background: none;
    border: 0;
    font: inherit;
    font-size: 0.82rem;
    color: inherit;
    cursor: pointer;
    text-align: left;
  }
  .detail {
    margin-top: 0.3rem;
    border-top: 1px solid rgb(10 43 35 / 12%);
    color: var(--encre-ecran);
  }
  .detail li {
    padding: 0.6rem 0 0;
  }
  .detail-quoi {
    margin: 0;
    font-size: 0.88rem;
    font-weight: 600;
  }
  .detail-ligne {
    display: flex;
    gap: 0.5rem;
    margin: 0.3rem 0 0;
    font-size: 0.85rem;
    line-height: 1.42;
  }
  .etiq {
    flex: none;
    min-width: 6.2rem;
    font-size: 0.62rem;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    color: var(--encre-sable);
    padding-top: 0.2rem;
  }
  .note-familles {
    margin: 0.7rem 0 0;
    font-size: 0.8rem;
    line-height: 1.45;
    color: var(--encre-doux, #4a5a55);
  }

  /* ── 9 · Le niveau de confiance ──────────────────────────────────────── */
  .pourcent {
    margin: 0.5rem 0;
    font-family: var(--titre, Georgia, serif);
    font-size: 2.4rem;
    line-height: 1;
    font-weight: 500;
    color: var(--vert-800, #12463b);
  }
  .jauge {
    height: 0.5rem;
    border-radius: 0.25rem;
    background: var(--sable-clair);
    overflow: hidden;
  }
  .jauge span {
    display: block;
    height: 100%;
    border-radius: 0.25rem;
    background: var(--vert-800, #12463b);
  }
  .dit-confiance {
    margin: 0.6rem 0 0;
    font-size: 0.86rem;
    line-height: 1.45;
    color: var(--encre-doux, #4a5a55);
  }

  /* ── 10 · Conseil ────────────────────────────────────────────────────── */
  .conseil {
    margin-top: 1.1rem;
    background: var(--vert-100, #e6ede4);
    border-radius: 1.1rem;
    padding: 0.95rem 1rem 1rem;
  }
  .dedans-conseil {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
  }
  .texte-conseil {
    min-width: 0;
    flex: 1 1 auto;
  }
  .dit-conseil {
    margin: 0.45rem 0 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  .dit-conseil.premier {
    font-family: var(--titre, Georgia, serif);
    font-size: 1.02rem;
    font-weight: 500;
  }
  .lampe {
    width: 4.6rem;
    height: 5.6rem;
    flex: none;
    color: var(--vert-800, #12463b);
    opacity: 0.35;
  }
  .lampe .halo {
    opacity: 0.55;
  }

  /* ── 11 · Accès ──────────────────────────────────────────────────────── */
  .rapport {
    display: flex;
    align-items: center;
    gap: 0.75rem;
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
  /* 44 px de cible tactile, mesurés — pas la hauteur du texte. */
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
    font-size: 0.71rem;
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
    margin: 1.3rem 0 0;
    text-align: center;
    font-size: 0.77rem;
    letter-spacing: 0.08em;
    color: var(--encre-doux, #4a5a55);
  }

  @media (min-width: 30rem) {
    .ecran {
      padding: 2rem 1.5rem 3rem;
    }
    .verdict {
      font-size: 1.42rem;
    }
  }
</style>
