<script lang="ts">
  /**
   * L'ATELIER DE TRAVAIL — notre lieu, pas un écran de passage.
   *
   * Décision du 21/08/2026 : « on travaillera de là-bas, ça deviendra notre
   * espace spécifique à ce travail ». Trois choses en découlent, et ce sont
   * elles qui distinguent un atelier d'une visionneuse :
   *
   *   1. l'atelier NOMME L'ÉDITEUR du rapport et range ses repères sous ce nom
   *      — l'ordre du même jour : des repères de lecture PAR ÉDITEUR ;
   *   2. il GARDE LA TRACE d'une fois sur l'autre (le carnet, en local) : on
   *      continue, on ne recommence pas ;
   *   3. l'échange avec Claude est un FIL rattaché au rapport ouvert.
   *
   * Claude est là quand le pont tourne sur ce poste. Sans lui, tout le reste
   * fonctionne à l'identique.
   */
  import { ouvrirPdf } from '../lib/pdf';
  import {
    generateursMeles,
    identifierGenerateur,
    type Generateur
  } from '../lib/atelier/editeur';
  import {
    empreinte,
    inscrire,
    listerLectures,
    lireFiche,
    noter,
    prolongerFil,
    viderCarnet,
    type Lecture
  } from '../lib/atelier/carnet';
  import { demander, poidsDeLEnvoi, pontPresent, type TourApi } from '../lib/atelier/claude';

  interface Props {
    surSortie: () => void;
  }
  const { surSortie }: Props = $props();

  let generateur = $state<Generateur | null>(null);
  let meles = $state(false);
  let fiche = $state<Lecture | null>(null);
  let carnet = $state<Lecture[]>([]);
  let lecture = $state(false);
  let erreur = $state<string | null>(null);
  /* Une fiche reprise du carnet n'a pas été relue : on ne lui prête pas une
     preuve qu'on n'a pas sous les yeux. */
  let repris = $state(false);

  listerLectures().then((liste) => (carnet = liste));

  /* Claude : présent seulement si le pont répond. Vérifié une fois, au montage. */
  let claudeLa = $state(false);
  pontPresent().then((oui) => (claudeLa = oui));

  let question = $state('');
  let extrait = $state('');
  let enCours = $state(false);
  let note = $state('');

  /** Le tableau des traits mesurés, éditeur par éditeur — `docs/REPERES-PAR-EDITEUR.md`. */
  const REPERES: ReadonlyArray<{ trait: string; chez: Record<string, boolean> }> = [
    {
      trait: 'Six domaines électricité imprimés même sans résultat',
      chez: { LICIEL: true, AnalysImmo: false }
    },
    {
      trait: 'Synthèse en tableau à colonnes entrelacées',
      chez: { LICIEL: true, AnalysImmo: false }
    },
    {
      trait: 'Tableau d’anomalies à six colonnes (code de norme, mesure compensatoire)',
      chez: { LICIEL: false, AnalysImmo: true }
    },
    { trait: 'Caractères doublés à l’extraction', chez: { EXPERTEC: true, LICIEL: false } },
    { trait: 'En-têtes quadruplés', chez: { 'DPE WIN': true, LICIEL: false } },
    {
      trait: 'DPE d’ancienne génération (pas de schéma des déperditions)',
      chez: { 'DPE WIN': true, "Imm'PACT": true, LICIEL: false }
    },
    { trait: 'Rapport numérisé rencontré', chez: { "Imm'PACT": true, LICIEL: false } }
  ];

  const connus = $derived(
    generateur?.editeur
      ? REPERES.filter((r) => generateur!.editeur! in r.chez).map((r) => ({
          trait: r.trait,
          present: r.chez[generateur!.editeur!]!
        }))
      : []
  );

  /** Ce qui n'a jamais été mesuré chez lui — la partie la plus utile de l'écran. */
  const jamaisMesures = $derived(
    generateur?.editeur ? REPERES.filter((r) => !(generateur!.editeur! in r.chez)) : []
  );

  /** Le fil, dans la forme que l'API attend. Porté par nous : l'API n'a pas de mémoire. */
  const filApi = $derived<TourApi[]>(
    (fiche?.fil ?? []).map((tour) => ({
      role: tour.role === 'aude' ? ('user' as const) : ('assistant' as const),
      content: tour.texte
    }))
  );

  async function deposer(fichiers: FileList | null): Promise<void> {
    const fichier = fichiers?.[0];
    if (!fichier) return;
    lecture = true;
    erreur = null;
    try {
      const document = await ouvrirPdf(fichier);
      const lignes = document.pages.flatMap((p) => p.lignes);
      const g = identifierGenerateur(document.metadonnees, lignes);
      generateur = g;
      meles = generateursMeles(document.metadonnees, lignes);

      /* La fiche est inscrite au carnet, et retrouve ses notes si le rapport
         avait déjà été ouvert : rouvrir n'efface jamais ce qu'on en a dit. */
      repris = false;
      const id = empreinte(fichier.name, fichier.size);
      carnet = await inscrire({
        id,
        nomFichier: fichier.name,
        quand: new Date().toISOString(),
        pages: document.pages.length,
        editeur: g.editeur,
        genre: g.genre,
        notes: [],
        fil: []
      });
      fiche = await lireFiche(id);
    } catch (e) {
      erreur = String(e).slice(0, 200);
    } finally {
      lecture = false;
    }
  }

  /** Rouvrir une fiche du carnet sans redéposer le PDF : on retrouve son travail. */
  async function reprendre(id: string): Promise<void> {
    const reprise = await lireFiche(id);
    if (!reprise) return;
    fiche = reprise;
    generateur = {
      editeur: reprise.editeur,
      societe: null,
      logiciel: null,
      version: null,
      source: reprise.editeur ? 'signature' : 'inconnue',
      preuve: '',
      genre: reprise.genre as Generateur['genre']
    };
    repris = true;
    meles = false;
  }

  async function interroger(): Promise<void> {
    if (!question.trim() || !fiche) return;
    enCours = true;
    const posee = question;
    /* La fiche visée est capturée maintenant : plusieurs `await` suivent, et
       elle pourrait changer entre-temps si un autre rapport était déposé. */
    const cible = fiche.id;
    try {
      const r = await demander({
        question: posee,
        ...(extrait ? { extrait } : {}),
        ...(filApi.length ? { fil: filApi } : {})
      });
      const texte = r.refus ? 'Demande déclinée par le modèle.' : r.texte;
      await prolongerFil(cible, [
        { role: 'aude', texte: posee },
        { role: 'claude', texte }
      ]);
      fiche = await lireFiche(cible);
      question = '';
      extrait = '';
    } catch (e) {
      await prolongerFil(cible, [
        { role: 'aude', texte: posee },
        { role: 'claude', texte: `Le pont a refusé : ${String(e).slice(0, 200)}` }
      ]);
      fiche = await lireFiche(cible);
    } finally {
      enCours = false;
    }
  }

  async function qualifier(): Promise<void> {
    if (!note.trim() || !fiche) return;
    fiche = await noter(fiche.id, note.trim());
    /* Le carnet est relu pour que le compteur « n qualifiés » suive. */
    carnet = await listerLectures();
    note = '';
  }

  async function toutEffacer(): Promise<void> {
    await viderCarnet();
    carnet = [];
    fiche = null;
    generateur = null;
  }
</script>

<div class="zone">
  <header>
    <h1>Atelier de travail</h1>
    <button type="button" class="sortir" onclick={surSortie}>Quitter</button>
  </header>

  <section class="depot">
    <label>
      <span>Déposer un rapport</span>
      <input
        type="file"
        accept="application/pdf"
        onchange={(e) => deposer((e.currentTarget as HTMLInputElement).files)}
      />
    </label>
    {#if lecture}<p class="attente">Lecture…</p>{/if}
    {#if erreur}<p class="erreur">{erreur}</p>{/if}
  </section>

  <!--
    LE CARNET. Ce qui a déjà été lu, avec ce qu'on en a dit. C'est ce qui fait
    la différence entre un lieu de travail et un écran : on reprend.
  -->
  {#if carnet.length}
    <section class="carnet">
      <h2>Déjà lus — {carnet.length}</h2>
      <ul>
        {#each carnet.slice(0, 12) as l (l.id)}
          <li>
            <button type="button" class="reprise" onclick={() => reprendre(l.id)}>
              {l.nomFichier}
            </button>
            <span class="meta">
              {l.editeur ?? 'éditeur inconnu'} · {l.pages} p.
              {#if l.notes.length}· <strong>{l.notes.length} qualifié{l.notes.length > 1 ? 's' : ''}</strong>{/if}
              {#if l.fil.length}· fil de {l.fil.length}{/if}
            </span>
          </li>
        {/each}
      </ul>
      <p class="local">
        Ce carnet vit sur cet appareil et n’est envoyé nulle part. Il garde les noms de fichiers —
        donc souvent des noms de clients.
        <button type="button" class="effacer" onclick={toutEffacer}>Tout effacer</button>
      </p>
    </section>
  {/if}

  {#if generateur}
    <section class="editeur">
      <h2>Qui a produit ce rapport</h2>
      {#if fiche}<p class="nom">{fiche.nomFichier} · {fiche.pages} pages</p>{/if}

      {#if generateur.genre === 'facture'}
        <p class="verdict">Ce PDF est une <strong>facture</strong>, pas un rapport.</p>
      {:else if generateur.genre === 'numérisation'}
        <p class="verdict alerte">
          Ce PDF est une <strong>numérisation</strong> : son contenu est en image. Le silence de
          l’extraction n’est pas une absence d’anomalie — il n’y a rien à lire ici.
        </p>
      {:else if generateur.editeur}
        <p class="verdict">
          <strong>{generateur.editeur}</strong>
          {#if generateur.version}· version {generateur.version}{/if}
          {#if generateur.societe}<span class="societe">({generateur.societe})</span>{/if}
        </p>
        {#if repris}
          <p class="source">
            Repris du carnet — le rapport n’a pas été relu. Redépose-le pour revoir la preuve.
          </p>
        {:else}
          <p class="source">
            {generateur.source === 'déclaration'
              ? 'Le rapport le déclare lui-même :'
              : 'Empreinte d’impression du PDF :'}
            <code>{generateur.preuve}</code>
          </p>
        {/if}
      {:else}
        <p class="verdict alerte">
          <strong>Éditeur non identifié.</strong> Rien ne le nomme — ni rubrique « Référence du
          logiciel validé », ni empreinte connue. On ne devine pas.
        </p>
        <p class="source"><code>{generateur.preuve || 'aucune métadonnée'}</code></p>
      {/if}

      {#if meles}
        <p class="verdict alerte">
          Ce dossier <strong>mêle deux générateurs</strong> : le DPE vient d’un logiciel, les
          autres volets d’un autre. Les repères d’un éditeur ne valent que pour ses volets.
        </p>
      {/if}
    </section>

    {#if generateur.editeur && generateur.genre === 'diagnostic'}
      <section class="reperes">
        <h2>Repères de lecture chez {generateur.editeur}</h2>
        {#if connus.length}
          <ul>
            {#each connus as repere (repere.trait)}
              <li class:absent={!repere.present}>
                <span class="marque">{repere.present ? '✓' : '✗'}</span>
                {repere.trait}
              </li>
            {/each}
          </ul>
        {/if}
        {#if jamaisMesures.length}
          <p class="trou">
            <strong>{jamaisMesures.length} traits n’ont jamais été mesurés chez cet éditeur.</strong>
            Ce n’est pas qu’ils en sont absents : personne n’a regardé.
          </p>
          <ul class="jamais">
            {#each jamaisMesures as repere (repere.trait)}
              <li>{repere.trait}</li>
            {/each}
          </ul>
        {/if}
      </section>
    {/if}

    <!--
      LA QUALIFICATION. Une session utile finit par une phrase consignée, pas
      par un écran regardé : c'est elle qui devient un cas de test.
    -->
    <section class="qualifier">
      <h2>Ce que je constate</h2>
      {#if fiche?.notes.length}
        <ul class="notes">
          {#each fiche.notes as n, i (i)}
            <li>{n}</li>
          {/each}
        </ul>
      {/if}
      <label>
        <span>Une ligne — ce qui est faux, ou ce qui manque</span>
        <textarea bind:value={note} rows="2"></textarea>
      </label>
      <button type="button" onclick={qualifier} disabled={!note.trim()}>Consigner</button>
    </section>
  {/if}

  <section class="claude">
    <h2>Claude</h2>
    {#if !claudeLa}
      <p class="absent-claude">
        Claude n’est pas là : le pont ne tourne pas sur ce poste. Pour le lancer, dans un
        terminal — <code>node scripts/pont-claude.mjs</code> — après avoir posé la clé dans
        <code>ANTHROPIC_API_KEY</code>. La clé reste sur le poste ; elle n’entre jamais dans le
        dépôt, qui est public.
      </p>
    {:else if !fiche}
      <p class="absent-claude">Ouvre un rapport : le fil se rattache au dossier en cours.</p>
    {:else}
      {#if fiche.fil.length}
        <ol class="fil">
          {#each fiche.fil as tour, i (i)}
            <li class={tour.role}>
              <span class="qui">{tour.role === 'aude' ? 'Aude' : 'Claude'}</span>
              <p>{tour.texte}</p>
            </li>
          {/each}
        </ol>
      {/if}
      <label>
        <span>La question</span>
        <textarea bind:value={question} rows="2" placeholder="Ce que tu veux comprendre…"
        ></textarea>
      </label>
      <label>
        <span>Le passage du rapport (facultatif)</span>
        <textarea bind:value={extrait} rows="5" placeholder="Colle ici la rubrique concernée."
        ></textarea>
      </label>
      <p class="sortant">
        {poidsDeLEnvoi({ question, extrait, fil: filApi })} caractères quitteront ce poste si tu
        envoies{#if filApi.length}, fil compris{/if}.
      </p>
      <button type="button" onclick={interroger} disabled={enCours || !question.trim()}>
        {enCours ? 'En cours…' : 'Envoyer à Claude'}
      </button>
    {/if}
  </section>
</div>

<style>
  .zone {
    max-width: 52rem;
    margin: 0 auto;
    padding: 2rem 1.25rem 4rem;
    color: var(--encre, #0a2b23);
  }

  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    border-bottom: 1px solid var(--verriere-sable-filet, #d8c199);
    padding-bottom: 0.75rem;
  }

  h1 {
    font-size: 1.35rem;
    margin: 0;
  }

  h2 {
    font-size: 1rem;
    margin: 0 0 0.5rem;
    letter-spacing: 0.02em;
  }

  .sortir,
  .effacer {
    background: none;
    border: 1px solid currentcolor;
    border-radius: 0.4rem;
    padding: 0.25rem 0.6rem;
    color: inherit;
    cursor: pointer;
    font: inherit;
    font-size: 0.8rem;
  }

  section {
    margin-top: 1.75rem;
  }

  label {
    display: block;
    margin-bottom: 0.75rem;
  }

  label span {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
  }

  textarea {
    width: 100%;
    font: inherit;
    font-size: 0.9rem;
    padding: 0.5rem;
    border: 1px solid var(--verriere-sable-filet, #d8c199);
    border-radius: 0.4rem;
    background: var(--verriere-blanc, #fff);
    color: inherit;
    resize: vertical;
  }

  .carnet ul {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.88rem;
  }

  .carnet li {
    padding: 0.2rem 0;
    border-bottom: 1px solid var(--verriere-sable-voile, rgb(200 169 107 / 16%));
  }

  .reprise {
    background: none;
    border: 0;
    padding: 0;
    font: inherit;
    color: inherit;
    text-decoration: underline;
    cursor: pointer;
  }

  .meta {
    opacity: 0.72;
    font-size: 0.8rem;
    margin-left: 0.4rem;
  }

  .local {
    font-size: 0.78rem;
    opacity: 0.8;
    margin-top: 0.6rem;
  }

  .nom {
    font-size: 0.85rem;
    opacity: 0.75;
    margin: 0 0 0.5rem;
  }

  .verdict {
    font-size: 1.05rem;
    margin: 0.25rem 0;
  }

  .verdict.alerte {
    background: var(--verriere-sable-voile, rgb(200 169 107 / 16%));
    border-left: 3px solid var(--verriere-sable-or, #c8a96b);
    padding: 0.6rem 0.75rem;
    font-size: 0.95rem;
  }

  .societe {
    opacity: 0.7;
    font-size: 0.85rem;
  }

  .source {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  code {
    font-size: 0.78rem;
    word-break: break-all;
  }

  .reperes ul,
  .notes {
    margin: 0.25rem 0 1rem;
    padding-left: 1.1rem;
    font-size: 0.9rem;
  }

  .reperes li.absent .marque {
    opacity: 0.55;
  }

  .marque {
    font-weight: 700;
    margin-right: 0.35rem;
  }

  .trou {
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .jamais {
    opacity: 0.7;
  }

  .fil {
    list-style: none;
    margin: 0 0 1rem;
    padding: 0;
  }

  .fil li {
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
  }

  .fil .qui {
    display: block;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .fil p {
    margin: 0.15rem 0 0;
    white-space: pre-wrap;
  }

  .fil li.claude p {
    background: var(--verriere-blanc, #fff);
    border: 1px solid var(--verriere-sable-filet, #d8c199);
    border-radius: 0.4rem;
    padding: 0.6rem 0.75rem;
  }

  .sortant {
    font-size: 0.82rem;
    opacity: 0.8;
    margin: 0 0 0.5rem;
  }

  button[type='button']:not(.sortir):not(.reprise):not(.effacer) {
    background: var(--action, #12463b);
    color: var(--sur-action, #f7f6f2);
    border: 0;
    border-radius: 0.4rem;
    padding: 0.5rem 1rem;
    font: inherit;
    cursor: pointer;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: default;
  }

  .absent-claude,
  .erreur,
  .attente {
    font-size: 0.88rem;
  }

  .erreur {
    color: #8a2b20;
  }
</style>
