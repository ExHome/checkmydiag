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
  import {
    consigner,
    demander,
    poidsDeLEnvoi,
    pontPresent,
    type TourApi
  } from '../lib/atelier/claude';
  import {
    clesAttendues,
    endroitsDe,
    formulerCorrection,
    type Endroits
  } from '../lib/atelier/endroits';
  import type { TypeDiag } from '../lib/modele';

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

  /*
   * Le pont rend deux services indépendants : le JOURNAL, qui recopie les
   * qualifications là où Claude peut les lire — gratuit —, et CLAUDE lui-même,
   * qui demande une clé facturée. On peut avoir le premier sans le second.
   */
  let claudeLa = $state(false);
  let journalLa = $state(false);
  pontPresent().then((etat) => {
    claudeLa = etat.claude;
    journalLa = etat.journal;
  });

  let question = $state('');
  let extrait = $state('');
  let enCours = $state(false);
  let note = $state('');

  /* LES ENDROITS — le découpage du rapport ouvert, et ce qu'on corrige dessus. */
  let endroits = $state<Endroits | null>(null);
  let voletVise = $state<TypeDiag | null>(null);
  let cleVisee = $state('');
  let ligneVisee = $state('');
  let pourquoi = $state('');
  /** Le rapport est-il ouvert à la lecture ? */
  let lit = $state(false);

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
      /* Le découpage est mis à plat tout de suite : c'est sur lui qu'on agit. */
      endroits = endroitsDe(document.pages);
      lit = false;
      voletVise = null;
      ligneVisee = '';

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
    endroits = null;
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

  /** Consigner au carnet ET, si le pont tourne, là où Claude le lira. */
  async function inscrireEtPartager(texte: string): Promise<void> {
    if (!fiche) return;
    fiche = await noter(fiche.id, texte);
    carnet = await listerLectures();
    if (journalLa) {
      void consigner({
        rapport: fiche?.nomFichier ?? '',
        editeur: generateur?.editeur ?? null,
        note: texte
      });
    }
  }

  async function qualifier(): Promise<void> {
    if (!note.trim() || !fiche) return;
    await inscrireEtPartager(note.trim());
    note = '';
  }

  /**
   * Corriger un endroit : désigner la ligne EXACTE qui ouvre une rubrique que
   * le moteur n'a pas su voir. C'est la sortie utile de l'atelier — de quoi
   * ajouter une forme et le test qui la tient, sans rien deviner.
   */
  async function corrigerEndroit(): Promise<void> {
    if (!fiche || !voletVise || !cleVisee.trim() || !ligneVisee.trim()) return;
    await inscrireEtPartager(
      formulerCorrection({
        editeur: generateur?.editeur ?? null,
        volet: voletVise,
        cle: cleVisee.trim(),
        ligne: ligneVisee,
        ...(pourquoi.trim() ? { pourquoi } : {})
      })
    );
    ligneVisee = '';
    pourquoi = '';
  }

  /** Désigner une ligne du rapport plutôt que la retaper : zéro faute de frappe. */
  function designer(texte: string): void {
    ligneVisee = texte;
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
      LES ENDROITS. La règle maîtresse : on ne cherche pas une information, on
      cherche la RUBRIQUE qui la porte. Tout ce que le moteur lit de travers
      vient d'un endroit mal borné — ou pas vu du tout. Cet écran les montre,
      et surtout il montre les SILENCES : un atelier qui n'afficherait que les
      trouvailles donnerait à voir un rapport bien lu, toujours.
    -->
    {#if endroits}
      <section class="endroits">
        <h2>Les endroits</h2>

        <button type="button" class="viser lire" onclick={() => (lit = !lit)}>
          {lit ? 'Fermer le rapport' : 'Lire le rapport en entier'}
        </button>

        <!--
          LE RAPPORT ENTIER. Toutes les pages, y compris celles qu'aucun volet
          ne couvre : ce qu'on ne voit pas ne se corrige pas, et une page
          invisible sort du dossier sans bruit. Chaque ligne se désigne d'un
          clic — on ne recopie rien, donc on ne se trompe pas d'un caractère.
        -->
        {#if lit}
          <div class="lecture">
            {#each endroits.pages as p (p.numero)}
              <p class="entete-page" class:orpheline={p.volet === null}>
                page {p.numero}
                {#if p.volet}· {p.volet}{:else}· <strong>rattachée à aucun volet</strong>{/if}
              </p>
              <ol>
                {#each p.lignes as l (l.index)}
                  <li class:repere={!!l.repere}>
                    <button
                      type="button"
                      class="ligne"
                      class:choisie={ligneVisee === l.texte}
                      onclick={() => {
                        if (p.volet) voletVise = p.volet;
                        if (!cleVisee && p.volet) {
                          cleVisee =
                            endroits?.volets.find((v) => v.type === p.volet)
                              ?.attenduesManquantes[0] ?? '';
                        }
                        designer(l.texte);
                      }}
                      title="Désigner cette ligne"
                    >
                      {#if l.repere}<span class="marqueur">{l.repere}</span>{/if}
                      {l.texte}
                    </button>
                  </li>
                {/each}
              </ol>
            {/each}
          </div>
        {/if}
        {#if endroits.horsSection}
          <p class="verdict alerte">
            <strong>{endroits.horsSection} lignes ne sont rattachées à aucun volet.</strong>
            Elles sortent du dossier sans être lues.
          </p>
        {/if}

        {#each endroits.volets as volet (volet.type)}
          <article>
            <h3>
              {volet.type}
              <span class="pages">pages {volet.pages[0]}–{volet.pages[1]} · {volet.lignes} lignes</span>
            </h3>

            {#if volet.rubriques.length}
              <ul class="trouvees">
                {#each volet.rubriques as r (r.repere + r.titre)}
                  <li class:vide={r.lignes === 0}>
                    <span class="repere">{r.repere}</span>
                    {r.titre}
                    <span class="taille">{r.lignes} lignes</span>
                  </li>
                {/each}
              </ul>
            {:else}
              <p class="silence">Aucune rubrique bornée dans ce volet.</p>
            {/if}

            {#if volet.attenduesManquantes.length}
              <p class="silence"><strong>Non trouvées</strong> — clique celle que tu veux corriger :</p>
              <ul class="manquantes">
                {#each volet.attenduesManquantes as cle (cle)}
                  <li>
                    <button
                      type="button"
                      class="viser"
                      class:active={voletVise === volet.type && cleVisee === cle}
                      onclick={() => {
                        voletVise = volet.type;
                        cleVisee = cle;
                        ligneVisee = '';
                      }}
                    >
                      {cle}
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}
          </article>
        {/each}

        {#if ligneVisee}
          <div class="correction">
            <p class="quoi">La ligne désignée : « {ligneVisee.trim()} »</p>

            <!--
              Une page rattachée à aucun volet n'en désigne aucun : c'est à Aude
              de dire de quel diagnostic relève la ligne. Sans ce choix, le cas
              le plus utile — la rubrique perdue hors section — resterait
              impossible à qualifier.
            -->
            <label>
              <span>De quel volet relève-t-elle ?</span>
              <select bind:value={voletVise}>
                <option value={null}>— à choisir —</option>
                {#each endroits.volets as v (v.type)}
                  <option value={v.type}>{v.type}</option>
                {/each}
              </select>
            </label>

            {#if voletVise}
              <label>
                <span>Quelle rubrique le moteur n’a-t-il pas vue ?</span>
                <select bind:value={cleVisee}>
                  <option value="">— à choisir —</option>
                  {#each clesAttendues(voletVise) as cle (cle)}
                    <option value={cle}>{cle}</option>
                  {/each}
                </select>
              </label>
            {/if}
            <label>
              <span>La ligne du rapport qui l’ouvre — recopiée mot pour mot</span>
              <textarea bind:value={ligneVisee} rows="2" placeholder="H — Conclusion de l’état…"
              ></textarea>
            </label>
            <label>
              <span>Pourquoi cet endroit compte — ce que toi seule sais</span>
              <textarea bind:value={pourquoi} rows="2" placeholder="Ce que ça engage pour l’acquéreur…"
              ></textarea>
            </label>
            <button
              type="button"
              onclick={corrigerEndroit}
              disabled={!ligneVisee.trim() || !voletVise || !cleVisee}
            >
              Consigner cet endroit
            </button>
          </div>
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
      {#if journalLa}
        <p class="absent-claude">
          <strong>Le journal tourne</strong> — tout ce que tu consignes est recopié sur ce poste,
          là où Claude peut le lire. Il ne peut pas répondre ici (ça demanderait une clé facturée),
          mais il voit ton travail en continu.
        </p>
      {:else}
      <p class="absent-claude">
        Claude n’est pas là : le pont ne tourne pas sur ce poste. Pour le lancer, dans un
        terminal — <code>node scripts/pont-claude.mjs</code> — après avoir posé la clé dans
        <code>ANTHROPIC_API_KEY</code> — la clé est facultative : sans elle, le pont tient
        seulement le journal, et c’est gratuit.
      </p>
      {/if}
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
  /*
   * L'ATELIER IMPOSE SES COULEURS.
   *
   * C'est un outil de travail, pas une page du produit : il doit rester
   * lisible quoi qu'il arrive au thème du site. Il héritait du fond vert nuit
   * de l'application et affichait une encre vert profond dessus — donc rien.
   * Les valeurs sont écrites en clair, sans passer par les variables du
   * produit, pour qu'un changement de charte ne puisse plus l'éteindre.
   */
  .zone {
    --atelier-fond: #f7f6f2;
    --atelier-encre: #14211d;
    --atelier-vert: #12463b;
    --atelier-filet: #cfd6cd;
    --atelier-voile: #ecefe9;

    position: relative;
    min-height: 100vh;
    padding: 2rem max(1.25rem, calc(50vw - 26rem)) 4rem;
    background: var(--atelier-fond);
    color: var(--atelier-encre);
  }

  /*
   * Le fond clair couvre l'écran entier — sans `100vw`, qui compte la barre de
   * défilement dans la largeur et provoquait un défilement horizontal parasite.
   */
  .zone::before {
    content: '';
    position: fixed;
    inset: 0;
    background: var(--atelier-fond);
    z-index: -1;
  }

  /* Le contenu reste dans une colonne lisible, centrée par le padding. */
  .zone > * {
    max-width: 52rem;
  }

  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    border-bottom: 1px solid var(--atelier-filet);
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
    border: 1px solid var(--atelier-filet);
    border-radius: 0.4rem;
    background: #ffffff;
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
    border-bottom: 1px solid var(--atelier-voile);
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
    background: var(--atelier-voile);
    border-left: 3px solid var(--atelier-vert);
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
    background: #ffffff;
    border: 1px solid var(--atelier-filet);
    border-radius: 0.4rem;
    padding: 0.6rem 0.75rem;
  }


  .endroits article {
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--atelier-voile);
  }

  .endroits h3 {
    font-size: 0.95rem;
    margin: 0 0 0.35rem;
    text-transform: capitalize;
  }

  .pages {
    font-weight: 400;
    font-size: 0.78rem;
    opacity: 0.7;
    text-transform: none;
    margin-left: 0.4rem;
  }

  .trouvees {
    list-style: none;
    margin: 0 0 0.5rem;
    padding: 0;
    font-size: 0.86rem;
  }

  .trouvees li {
    padding: 0.1rem 0;
  }

  .trouvees li.vide {
    opacity: 0.55;
  }

  .repere {
    display: inline-block;
    min-width: 2.1rem;
    font-weight: 700;
  }

  .taille {
    opacity: 0.6;
    font-size: 0.78rem;
    margin-left: 0.35rem;
  }

  .silence {
    font-size: 0.86rem;
    margin: 0.25rem 0;
  }

  .lire {
    margin-bottom: 0.5rem;
  }

  .lecture {
    margin: 0 0 1rem;
    padding: 0.5rem 0.6rem;
    max-height: 26rem;
    overflow-y: auto;
    background: #ffffff;
    border: 1px solid var(--atelier-filet);
    border-radius: 0.4rem;
    font-size: 0.82rem;
    line-height: 1.45;
  }

  .lecture ol {
    list-style: none;
    margin: 0 0 0.6rem;
    padding: 0;
  }

  .entete-page {
    position: sticky;
    top: 0;
    margin: 0.5rem 0 0.2rem;
    padding: 0.15rem 0.3rem;
    background: var(--atelier-voile);
    font-size: 0.74rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0.85;
  }

  .entete-page.orpheline {
    background: #f3e3c9;
    opacity: 1;
  }

  .ligne {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: 0;
    padding: 0.12rem 0.3rem;
    font: inherit;
    color: inherit;
    cursor: pointer;
    border-radius: 0.25rem;
  }

  .ligne:hover {
    background: var(--atelier-voile);
  }

  .lecture li.repere .ligne {
    font-weight: 700;
  }

  .ligne.choisie {
    background: var(--atelier-vert);
    color: #f7f6f2;
  }

  .marqueur {
    display: inline-block;
    min-width: 1.9rem;
    color: var(--atelier-vert);
    font-weight: 700;
  }

  .ligne.choisie .marqueur {
    color: inherit;
  }

  .manquantes {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin: 0.25rem 0 0.5rem;
    padding: 0;
  }

  .viser {
    font-size: 0.8rem;
    background: none;
    border: 1px solid var(--atelier-filet);
    border-radius: 0.4rem;
    padding: 0.2rem 0.55rem;
    color: inherit;
    font-family: inherit;
    cursor: pointer;
  }

  .viser.active {
    background: var(--atelier-vert);
    color: #f7f6f2;
    border-color: var(--atelier-vert);
  }

  .correction {
    background: var(--atelier-voile);
    border-left: 3px solid var(--atelier-vert);
    padding: 0.75rem 0.9rem;
    margin-top: 0.75rem;
  }

  .correction .quoi {
    margin: 0 0 0.6rem;
    font-size: 0.9rem;
  }

  select {
    font: inherit;
    font-size: 0.9rem;
    padding: 0.35rem;
    border: 1px solid var(--atelier-filet);
    border-radius: 0.4rem;
    background: #ffffff;
    color: inherit;
  }

  .sortant {
    font-size: 0.82rem;
    opacity: 0.8;
    margin: 0 0 0.5rem;
  }

  /* Les boutons pleins sont les ACTIONS. Une ligne du rapport et une puce de
     rubrique n'en sont pas : elles restent du texte tant qu'on ne les choisit
     pas. Sans cette exclusion, le rapport entier s'affichait en vert plein. */
  button[type='button']:not(.sortir):not(.reprise):not(.effacer):not(.viser):not(.ligne) {
    background: var(--atelier-vert);
    color: #f7f6f2;
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
