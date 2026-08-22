<script lang="ts">
  /**
   * LA MINI-APP DPE — le visuel du pack, à la lettre, avec les bandeaux dedans.
   *
   * ═══════════════════════════════════════════════════════════════════════════
   * RÉFÉRENCE ABSOLUE : 01_VISUEL_REFERENCE_DPE.png
   * ═══════════════════════════════════════════════════════════════════════════
   *
   * L'ordre du 22/08 : « respect du visuel du zip mais avec bandeaux ».
   * L'architecture validée est reproduite carte par carte, dans son ordre :
   *
   *   vignette · résultat global · détails techniques · caractéristiques clés ·
   *   points clés · constatations diverses · non contrôlé · confiance ·
   *   recommandations · scénarios · conseil Verrière · rapport complet
   *
   * ── Ce qui a changé par rapport à la maquette, et pourquoi ─────────────────
   *
   * **La colonne « économie estimée ~ 320 € / an » est remplacée par la part de
   * déperdition.** Ce chiffre en euros n'existe nulle part : ni dans les
   * vingt-six rapports lus, ni dans la base de l'ADEME, où les champs
   * `economie`, `gain` et `travaux` sont absents. L'ordre écrit du pack le dit
   * lui-même : « aucune économie fictive ». Aude a validé le remplacement le
   * 22/08 — on répond à la même question, *par où commencer*, avec deux données
   * lues et croisées.
   *
   * **La photo est celle du rapport**, découpée dans la page de garde — pas un
   * salon générique. Sans photo dans le PDF, la vignette ne s'affiche pas.
   *
   * ── Ce que les bandeaux ajoutent ──────────────────────────────────────────
   *
   * Chaque bande se pose **sous la carte qu'elle prouve** : l'étiquette sous le
   * résultat global, les classes après travaux sous les recommandations, le
   * descriptif des parois sous les détails techniques. Le lecteur voit d'abord
   * ce que Verrière a compris, puis peut ouvrir le morceau de rapport qui le
   * dit. Jamais l'inverse.
   *
   * ── La règle qui ne bouge pas ─────────────────────────────────────────────
   *
   * Aucune valeur de la maquette n'est reprise comme défaut. Une donnée absente
   * n'affiche rien, ou dit qu'elle est absente. Trois états, jamais deux.
   */
  import type { Enveloppe } from '../../lib/analyse/enveloppe';
  import { compterIsolation } from '../../lib/analyse/enveloppe';
  import type { PointAVerifier } from '../../lib/analyse/pointsAVerifier';
  import type { TravailPriorise } from '../../lib/analyse/priorite';
  import type { Systemes } from '../../lib/analyse/systemes';
  import type { Diagnostic, Lettre } from '../../lib/modele';
  import type { BandeauDecoupe, Photo } from '../../lib/pdf';
  import BandeauDuRapport from './BandeauDuRapport.svelte';
  import VignetteDuBien from './VignetteDuBien.svelte';

  const {
    diagnostic,
    enveloppe,
    systemes,
    travaux = [],
    points = [],
    photo = null,
    bandeaux = [],
    confiance = null,
    surDetail = null,
    surRapportComplet = null,
    surScenarios = null
  }: {
    diagnostic: Diagnostic;
    enveloppe: Enveloppe;
    systemes: Systemes;
    travaux?: TravailPriorise[];
    points?: PointAVerifier[];
    photo?: Photo | null;
    bandeaux?: BandeauDecoupe[];
    /** Part de données réellement lues, de 0 à 1. `null` si non calculée. */
    confiance?: number | null;
    surDetail?: ((cle: string) => void) | null;
    surRapportComplet?: (() => void) | null;
    surScenarios?: (() => void) | null;
  } = $props();

  /*
   * ── LES QUATRE ONGLETS DE LA RÉFÉRENCE ────────────────────────────────────
   *
   * La maquette pose une barre à quatre entrées. Ce n'est pas un ornement : le
   * DPE original est paginé, l'écran ne doit pas l'être — « format application,
   * jamais reproduction du PDF » (§22). Les onglets remplacent le défilement.
   *
   * Couleurs relevées dans l'image : fond #fefcf8, actif #044133, inactifs
   * #c7c6c5, filet du haut #f4efe8.
   */
  type Onglet = 'synthèse' | 'détails' | 'recommandations' | 'conseils';
  let onglet = $state<Onglet>('synthèse');

  const ONGLETS: { cle: Onglet; nom: string }[] = [
    { cle: 'synthèse', nom: 'Synthèse' },
    { cle: 'détails', nom: 'Détails' },
    { cle: 'recommandations', nom: 'Recommandations' },
    { cle: 'conseils', nom: 'Conseils' }
  ];

  const schema = $derived(diagnostic.schema?.genre === 'dpe' ? diagnostic.schema : null);

  /*
   * LE COÛT ANNUEL — §17 de l'ordre de mission.
   *
   * C'est le chiffre que tout le monde cherche en premier, et c'est aussi celui
   * qu'on lit le plus souvent de travers. Le §17 est formel : « ne jamais
   * confondre consommation conventionnelle du DPE et facture énergétique réelle
   * de l'occupant — la différence doit être explicitée ». Elle l'est, sous le
   * montant, et pas en note de bas de page.
   */
  const cout = $derived(diagnostic.faits.find((f) => f.libelle === 'Coût annuel estimé'));
  const finale = $derived<Lettre | null>(schema?.finale ?? null);
  const bandeau = (nom: BandeauDecoupe['nom']) => bandeaux.find((b) => b.nom === nom) ?? null;

  /*
   * L'ARC DE LA JAUGE.
   *
   * La référence dessine un arc ouvert, pas un anneau plein : la part remplie
   * dit où la classe se situe sur l'échelle A→G. Sept classes, sept crans.
   */
  const LETTRES: Lettre[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const CERCLE = 2 * Math.PI * 42;
  const OUVERT = CERCLE * 0.75;
  const rempli = $derived(finale ? (OUVERT * (LETTRES.indexOf(finale) + 1)) / 7 : 0);

  /*
   * Le titre court, en serif, comme la maquette. Il nomme la classe ; la phrase
   * en dessous vient de l'analyse, qui connaît les seuils et les conséquences.
   */
  const titreResultat = $derived(
    finale === 'A' || finale === 'B'
      ? 'Très bonne performance énergétique'
      : finale === 'C' || finale === 'D'
        ? 'Performance énergétique ordinaire'
        : finale === 'E'
          ? 'Performance à améliorer'
          : finale
            ? 'Logement très peu performant'
            : 'Performance non déterminée'
  );

  /** La parenthèse de l'étiquette climat, prise sur l'échelle officielle. */
  const nuanceClimat = $derived(
    schema?.climat
      ? LETTRES.indexOf(schema.climat.lettre) <= 1
        ? '(peu d’émissions)'
        : LETTRES.indexOf(schema.climat.lettre) <= 3
          ? '(émissions moyennes)'
          : '(fortes émissions)'
      : ''
  );

  /** La tuile d'un travail suit le lot qu'il touche. */
  function tuileDuLot(lot: string | null): string {
    if (!lot) return 'violet';
    if (/^murs?$|toiture|plafond|plancher|combles/i.test(lot)) return 'vert';
    if (/chauffage|eau chaude|climatisation/i.test(lot)) return 'peche';
    if (/fen[êe]tre|porte/i.test(lot)) return 'violet';
    return 'bleu';
  }

  const gravite = $derived(diagnostic.gravite);

  /* ── LES QUATRE DÉTAILS TECHNIQUES VERROUILLÉS PAR L'ORDRE ─────────────── */
  const murs = $derived(enveloppe.parois.filter((p) => p.famille === 'mur'));
  const compte = $derived(compterIsolation(murs));

  function phraseMurs(): string {
    if (!enveloppe.presente || murs.length === 0) return 'Non précisé dans le rapport';
    const bouts: string[] = [];
    if (compte.isole) bouts.push(`${compte.isole} isolé${compte.isole > 1 ? 's' : ''}`);
    if (compte.nonIsole) bouts.push(`${compte.nonIsole} non isolé${compte.nonIsole > 1 ? 's' : ''}`);
    if (compte.inconnu) bouts.push(`${compte.inconnu} inconnu${compte.inconnu > 1 ? 's' : ''}`);
    return `${murs.length} murs — ${bouts.join(', ')}`;
  }

  function phraseSystemes(): string {
    if (systemes.chauffage.length === 0) return 'Non précisé dans le rapport';
    const g = systemes.chauffage.length;
    const ecs = systemes.eauChaude[0]?.production;
    return `${g} générateur${g > 1 ? 's' : ''}${ecs ? ` · eau chaude par ${ecs}` : ''}`;
  }

  const DETAILS = $derived([
    { cle: 'enveloppe', tuile: 'vert', titre: 'Enveloppe du bâtiment', texte: phraseMurs() },
    { cle: 'systemes', tuile: 'peche', titre: 'Chauffage & ECS', texte: phraseSystemes() },
    {
      cle: 'ventilation',
      tuile: 'bleu',
      titre: 'Ventilation',
      texte: systemes.ventilation?.type ?? 'Non précisé dans le rapport'
    },
    {
      cle: 'surface',
      tuile: 'violet',
      titre: 'Surface de référence',
      texte: enveloppe.bien.surfaceReference?.valeur
        ? `${enveloppe.bien.surfaceReference.valeur} — surface du calcul, pas la surface Carrez`
        : 'Non précisée dans le rapport'
    }
  ]);

  /* ── CARACTÉRISTIQUES CLÉS ────────────────────────────────────────────────
     Chaque ligne vient de la fiche technique. Une donnée absente ne s'affiche
     pas : la maquette montre sept lignes, le rapport n'en donne pas toujours
     sept. */
  const CLES = $derived(
    [
      ['⌂', 'Type de bien', enveloppe.bien.typeDeBien?.valeur],
      ['▤', 'Année de construction', enveloppe.bien.anneeConstruction?.valeur],
      ['◱', 'Surface de référence', enveloppe.bien.surfaceReference?.valeur],
      ['≡', 'Nombre de niveaux', enveloppe.bien.nombreNiveaux?.valeur],
      ['↕', 'Hauteur sous plafond', enveloppe.bien.hauteurSousPlafond?.valeur],
      ['◈', 'Département', enveloppe.bien.departement?.valeur],
      ['△', 'Altitude', enveloppe.bien.altitude?.valeur]
    ].filter((l): l is [string, string, string] => Boolean(l[2]))
  );

  /* ── POINTS CLÉS ──────────────────────────────────────────────────────────
     Trois lignes au plus, chacune adossée à une donnée. Pas de ligne « tout va
     bien » quand on n'en sait rien. */
  type Signe = 'bon' | 'attention' | 'info';
  const POINTS_CLES = $derived(
    [
      finale
        ? {
            /* Le signe suit la gravité de l'analyse, qui connaît les seuils. */
            signe: (gravite === 'bon' ? 'bon' : 'attention') as Signe,
            titre: `Performance énergétique : classe ${finale}`,
            texte: diagnostic.verdict
          }
        : null,
      enveloppe.vitrages.simple > 0
        ? {
            signe: 'attention' as Signe,
            titre: 'Présence de simple vitrage',
            texte: `${enveloppe.vitrages.simple} fenêtre${enveloppe.vitrages.simple > 1 ? 's' : ''} en simple vitrage : le poste le plus déperditif.`
          }
        : null,
      systemes.ventilation?.mecanique === false
        ? {
            signe: 'attention' as Signe,
            titre: 'Aucune ventilation mécanique',
            texte: 'L’air se renouvelle en ouvrant les fenêtres. L’humidité s’évacue mal.'
          }
        : null,
      points.length > 0
        ? {
            signe: 'info' as Signe,
            titre: `${points.length} point${points.length > 1 ? 's' : ''} à vérifier`,
            texte: 'Le rapport se décrit de deux façons différentes à certains endroits.'
          }
        : {
            signe: 'bon' as Signe,
            titre: 'Aucune contradiction relevée',
            texte: 'Les rubriques du rapport concordent entre elles.'
          }
    ].filter((p): p is { signe: Signe; titre: string; texte: string } => p !== null)
  );

  /* ── CONSTATATIONS DIVERSES ───────────────────────────────────────────────
     Les phrases du rapport, telles qu'il les écrit. Aucune reformulation. */
  const CONSTATATIONS = $derived(
    systemes.vueDEnsemble
      .filter((p) => p.description && !/^n[ée]ant$/i.test(p.description.trim()))
      .map((p) => `${p.poste} : ${p.description}`)
  );

  /* ── CE QUI N'A PAS ÉTÉ CONTRÔLÉ / NON RENSEIGNÉ ──────────────────────────
     Chaque ligne est un manque MESURÉ, jamais une liste type. */
  const NON_RENSEIGNE = $derived(
    [
      ...enveloppe.parois
        .filter((p) => p.isolation === 'inconnu')
        .map((p) => ({
          /* « Isolation de une paroi » se fait relire deux fois. */
          quoi: p.nom ? `Isolation de ${p.nom}` : 'Isolation d’une paroi non nommée',
          etat: p.isolationDite ? `« ${p.isolationDite} »` : 'Non renseignée'
        })),
      enveloppe.valeursParDefaut > 0
        ? {
            quoi: `${enveloppe.valeursParDefaut} valeur${enveloppe.valeursParDefaut > 1 ? 's' : ''} supposée${enveloppe.valeursParDefaut > 1 ? 's' : ''} par le logiciel`,
            etat: 'Valeur par défaut'
          }
        : null,
      { quoi: 'Amiante, plomb, électricité, gaz', etat: 'Hors DPE' }
    ].filter((l): l is { quoi: string; etat: string } => l !== null)
  );

  const pourcent = (n: number) => `${Math.round(n * 100)} %`;
</script>

<article class="dpe">
  <div class="barre-haut">
    <span aria-hidden="true">‹</span>
    <div class="marque">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#024436" stroke-width="1.4" aria-hidden="true">
        <path d="M3 10.5 12 3l9 7.5V21H3z" />
        <path d="M12 3v18M3 10.5h18M7.5 21V7M16.5 21V7M3 15.5h18" />
      </svg>
      <h1>DPE</h1>
    </div>
    <span aria-hidden="true">⋯</span>
  </div>
  <p class="sous-titre">Synthèse du diagnostic</p>

{#if onglet === 'synthèse'}
  <VignetteDuBien {photo} bien={enveloppe.bien} />

  <section class="carte">
    <h2>Résultat global</h2>
    <div class="global">
      {#if finale}
        <div class="jauge">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#afcda9" stroke-width="7"
              stroke-linecap="round" stroke-dasharray="{OUVERT} {CERCLE - OUVERT}" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#378546" stroke-width="7"
              stroke-linecap="round" stroke-dasharray="{rempli} {CERCLE - rempli}" />
          </svg>
          <div class="lettre"><b>{finale}</b><span>Classe énergie</span></div>
        </div>
      {/if}
      <div class="resume">
        <h3>{titreResultat}</h3>
        <p>{diagnostic.verdict}</p>
      </div>
    </div>

    {#if schema?.energie || schema?.climat}
      <dl class="chiffres">
        {#if schema?.energie}
          <div>
            <dt>Consommation d’énergie</dt>
            <dd>
              <span class="val"><b>{schema.energie.valeur.toLocaleString('fr-FR')}</b><span
                  >{schema.energie.unite}</span
                ></span>
              <small>(énergie primaire)</small>
            </dd>
          </div>
        {/if}
        {#if schema?.climat}
          <div>
            <dt>Émissions de gaz à effet de serre</dt>
            <dd>
              <span class="val"><b>{schema.climat.valeur.toLocaleString('fr-FR')}</b><span
                  >{schema.climat.unite}</span
                ></span>
              <small>{nuanceClimat}</small>
            </dd>
          </div>
        {/if}
      </dl>
    {/if}

    <!--
      La règle du double seuil, écrite en clair : c'est elle qui décide de la
      classe affichée partout ailleurs, et presque personne ne la connaît.
    -->
    {#if schema?.energie && schema?.climat}
      <p class="double-seuil">
        <strong>C’est la moins bonne des deux qui est retenue.</strong> La classe du
        logement n’est jamais une moyenne des deux étiquettes.
      </p>
    {/if}

    <BandeauDuRapport bandeau={bandeau('étiquette')} />
  </section>

  {#if cout}
    <section class="carte">
      <h2>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a68965" stroke-width="1.7" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M14.5 9.2A3 3 0 0 0 9.4 11c0 2.6 5.2 1.6 5.2 4.2a3 3 0 0 1-5.1 1.7M12 6.6v10.8" />
        </svg>
        Estimation des coûts annuels d’énergie
      </h2>
      <p class="montant">{cout.valeur}</p>
      {#if cout.precision}
        <p class="sous">{cout.precision}.</p>
      {/if}
      <!--
        §17, mot pour mot : « ne jamais confondre consommation conventionnelle du
        DPE et facture énergétique réelle ». Un lecteur qui prend ce montant pour
        sa facture croira que son diagnostiqueur s'est trompé de moitié.
      -->
      <p class="garde">
        <strong>Ce n’est pas votre facture.</strong> Ce montant suppose un logement
        chauffé à 19 °C et occupé de façon standard, avec les prix moyens des énergies
        — pas votre abonnement, ni votre façon de vivre.
      </p>
      <BandeauDuRapport bandeau={bandeau('coûts')} />
    </section>
  {/if}
{/if}

{#if onglet === 'détails'}
  <section class="carte">
    <h2>Détails techniques du logement</h2>
    <ul>
      {#each DETAILS as d (d.cle)}
        <li class="rangee">
          <span class="tuile {d.tuile}">
            {#if d.cle === 'enveloppe'}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0c4a34" stroke-width="1.6" aria-hidden="true">
                <path d="M4 11 12 4l8 7v9H4z" /><path d="M9 20v-5h6v5" />
              </svg>
            {:else if d.cle === 'systemes'}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d62300" stroke-width="1.6" aria-hidden="true">
                <rect x="4" y="7" width="11" height="11" rx="1.5" /><path d="M7 7v11M11 7v11" />
                <path d="M19 6c1.6 1.8 2 2.9 2 4a2 2 0 1 1-4 0c0-1.1.4-2.2 2-4z" />
              </svg>
            {:else if d.cle === 'ventilation'}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2478a2" stroke-width="1.6" aria-hidden="true">
                <circle cx="12" cy="12" r="2.2" />
                <path d="M12 9.8C12 6 10 4 7.5 4.6 5.6 5 5 7.5 7 9.3l3 1.7M14.2 12c3.8 0 5.8-2 5.2-4.5-.4-1.9-2.9-2.5-4.7-.5l-1.7 3M12 14.2c0 3.8 2 5.8 4.5 5.2 1.9-.4 2.5-2.9.5-4.7l-3-1.7" />
              </svg>
            {:else}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6a5da5" stroke-width="1.6" aria-hidden="true">
                <path d="M3 20h18L3 6z" /><path d="M7 20v-4M11 20v-6" />
              </svg>
            {/if}
          </span>
          <span class="corps">
            <b>{d.titre}</b>
            <p>{d.texte}</p>
          </span>
          {#if surDetail}
            <button class="pilule" type="button" onclick={() => surDetail(d.cle)}>Détail</button>
          {/if}
          <span class="chev" aria-hidden="true">›</span>
        </li>
      {/each}
    </ul>
    <BandeauDuRapport bandeau={bandeau('vue d’ensemble')} />
  </section>

  {#if CLES.length > 0}
    <section class="carte">
      <h2>Caractéristiques clés du logement</h2>
      <dl class="cles">
        {#each CLES as [icone, nom, valeur] (nom)}
          <div>
            <span class="ic" aria-hidden="true">{icone}</span>
            <dt>{nom}</dt>
            <dd>{valeur}</dd>
          </div>
        {/each}
      </dl>
    </section>
  {/if}
{/if}

{#if onglet === 'synthèse'}
  <section class="carte">
    <h2>Points clés</h2>
    <ul class="points">
      {#each POINTS_CLES as p (p.titre)}
        <li class="rangee">
          <span class="rond {p.signe}" aria-hidden="true"
            >{p.signe === 'bon' ? '✓' : p.signe === 'attention' ? '!' : 'i'}</span
          >
          <span class="corps"><b>{p.titre}</b><p>{p.texte}</p></span>
          <span class="chev" aria-hidden="true">›</span>
        </li>
      {/each}
    </ul>
  </section>

  {#if CONSTATATIONS.length > 0}
    <section class="carte">
      <h2>Constatations diverses</h2>
      <ul class="constats">
        {#each CONSTATATIONS as c (c)}
          <li>{c}</li>
        {/each}
      </ul>
      <svg class="filigrane" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9" aria-hidden="true">
        <path d="M12 21c0-6 3-11 8-13-1 7-4 11-8 13z" /><path d="M12 21C9 16 6 13 3 12c1 5 4 8 9 9z" />
      </svg>
    </section>
  {/if}

  <section class="carte">
    <h2>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d15a19" stroke-width="1.7" aria-hidden="true">
        <path d="M3 3l18 18M10.6 6.3A9.8 9.8 0 0 1 12 6c5 0 9 4.5 9 6a11 11 0 0 1-2.4 3.3M6.6 8.3C4.4 9.6 3 11.3 3 12c0 1.5 4 6 9 6 1.2 0 2.3-.2 3.3-.6" />
      </svg>
      Ce qui n’a pas été contrôlé / non renseigné
    </h2>
    <ul class="manques">
      {#each NON_RENSEIGNE as m (m.quoi)}
        <li><span>{m.quoi}</span><em>{m.etat}</em></li>
      {/each}
    </ul>
  </section>

  {#if confiance !== null}
    <section class="carte">
      <h2>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#024436" stroke-width="1.7" aria-hidden="true">
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" />
        </svg>
        Niveau de confiance
      </h2>
      <p class="taux">{pourcent(confiance)}</p>
      <div class="piste"><div class="barre" style:width={pourcent(confiance)}></div></div>
      <p class="sous">
        Part de ce que nous avons pu lire dans le rapport. Ce n’est pas un jugement sur
        le diagnostic : c’est la mesure de notre propre lecture.
      </p>
    </section>
  {/if}
{/if}

{#if onglet === 'recommandations'}
  {#if travaux.length > 0}
    <section class="carte">
      <h2>Recommandations principales</h2>
      <ul class="reco">
        {#each travaux as t, i (t.lot ?? i)}
          <li class="rangee">
            <span class="tuile {tuileDuLot(t.lot)}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0c4a34" stroke-width="1.6" aria-hidden="true">
                <path d="M4 11 12 4l8 7v9H4z" /><path d="M8 20v-6h8v6" />
              </svg>
            </span>
            <span class="corps">
              <b>{t.lot ?? 'Poste non nommé'}</b>
              {#if t.performance}
                <span class="impact {t.portee.genre === 'part' ? 'fort' : 'moyen'}"
                  >Vise {t.performance}</span
                >
              {/if}
            </span>
            <!--
              À la place de « économie estimée ~ 320 € / an », qui n'existe dans
              aucune source : la part de pertes que ce travail touche, prise dans
              la fiche publique du même DPE. Même emplacement, même mise en forme.
            -->
            <span class="droite">
              {#if t.portee.genre === 'part'}
                <small>Part des pertes</small>
                <b>{pourcent(t.portee.part)}</b>
              {:else if t.portee.genre === 'hors enveloppe'}
                <b class="hors">N’agit pas sur les pertes</b>
              {/if}
            </span>
            <span class="chev" aria-hidden="true">›</span>
          </li>
        {/each}
      </ul>
      <BandeauDuRapport bandeau={bandeau('après travaux')} />
    </section>

    {#if surScenarios}
      <button class="action" type="button" onclick={surScenarios}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#024436" stroke-width="1.7" aria-hidden="true">
          <path d="M4 19V5M4 19h16" /><path d="M8 15l3.5-4 3 2.5L20 7" />
        </svg>
        Voir tous les scénarios de travaux
        <span class="chev" aria-hidden="true">›</span>
      </button>
    {/if}
  {/if}

{/if}

{#if onglet === 'conseils'}
  <section class="carte conseil">
    <h2>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#378546" stroke-width="1.7" aria-hidden="true">
        <path d="M12 21c0-6 3-11 8-13-1 7-4 11-8 13z" /><path d="M12 21C9 16 6 13 3 12c1 5 4 8 9 9z" />
      </svg>
      Conseil Verrière
    </h2>
    <p>
      {#if finale === 'A' || finale === 'B' || finale === 'C'}
        Votre logement est déjà performant. Les améliorations ci-dessus visent le
        confort et la facture, pas la mise en conformité.
      {:else if finale === 'F' || finale === 'G'}
        Votre logement fait partie des plus gros consommateurs. Les travaux ci-dessus ne
        sont pas seulement une économie : ils conditionnent ce que la loi vous autorise
        à faire du bien.
      {:else}
        Ce rapport décrit un logement ordinaire. Les travaux ci-dessus visent les postes
        que le diagnostiqueur a jugés prioritaires.
      {/if}
      Le rapport reste la référence : ce que vous lisez ici en vient, ligne à ligne.
    </p>
    <svg class="filigrane" width="130" height="130" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5V21H3z" />
      <path d="M12 3v18M3 10.5h18M7.5 21V7M16.5 21V7M3 15.5h18" />
    </svg>
  </section>
{/if}

  {#if surRapportComplet}
    <button class="action sombre" type="button" onclick={surRapportComplet}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" />
      </svg>
      Voir le rapport complet
      <span class="chev" aria-hidden="true">›</span>
    </button>
  {/if}

  <!--
    LA BARRE DE LA RÉFÉRENCE. Quatre entrées, l'active en vert profond, les
    autres en gris chaud — couleurs relevées dans l'image.
  -->
  <nav class="onglets" aria-label="Sections du DPE">
    {#each ONGLETS as o (o.cle)}
      <button
        type="button"
        class:actif={onglet === o.cle}
        aria-current={onglet === o.cle ? 'page' : undefined}
        onclick={() => (onglet = o.cle)}
      >
        {#if o.cle === 'synthèse'}
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path d="M4 11 12 4l8 7v9H4z" /><path d="M10 20v-5h4v5" />
          </svg>
        {:else if o.cle === 'détails'}
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path d="M5 7h14M5 12h14M5 17h9" />
          </svg>
        {:else if o.cle === 'recommandations'}
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path d="M5 20V11M12 20V5M19 20v-6" />
          </svg>
        {:else}
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path d="M9.5 18h5M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2h5c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
          </svg>
        {/if}
        <span>{o.nom}</span>
      </button>
    {/each}
  </nav>
</article>

<style>
  /*
   * ── LA PALETTE DU PACK, MESURÉE DANS SA PROPRE IMAGE ──────────────────────
   *
   * « Je veux le visuel exact que tu viens de me montrer avec les mêmes
   * couleurs » — Aude, 22/08. Ces valeurs ne sont pas approchées à l'œil :
   * elles sont relevées pixel par pixel dans 01_VISUEL_REFERENCE_DPE.png.
   *
   *   fond de page      #fcf8f4     carte             #fefcf8
   *   vert profond      #024436     bronze            #a68965
   *   rouille           #d15a19     orange pastille   #ea8423
   *   bleu pastille     #085c8e     vert validation   #378546
   *   vert pâle         #e3ebdc     pastille impact   #eef1e6
   *
   * Elles vivent ici, sur `.dpe`, et non dans la charte de l'application : cet
   * écran reproduit une référence verrouillée, il n'a pas à la réinterpréter.
   */
  .dpe {
    --fond: #fcf8f4;
    --carte: #fefcf8;
    --vert: #024436;
    /*
     * `--bronze` et non `--or` : la charte bannit ce nom-là, parce que
     * l'ancien jeton mentait — il s'appelait « or » et contenait du vert.
     * Celui-ci contient bien un bronze, relevé dans la référence.
     */
    --bronze: #a68965;
    /*
     * DEUX TEINTES ASSOMBRIES, ET SEULEMENT DEUX.
     *
     * Mesuré dans le navigateur : le « ! » blanc sur l'orange de la référence
     * donnait 2,68 de contraste, et la rouille des mentions « non renseigné »
     * 3,95 — sous le seuil de 4,5 à ces tailles. Or ce sont précisément les
     * deux endroits qui SIGNALENT quelque chose : une alerte qu'on ne lit pas
     * ne sert à rien.
     *
     * Même teinte, quelques crans plus foncés. Le sur-titre bronze, lui, reste
     * exactement celui de la référence : c'est un ornement de marque, pas un
     * signal.
     *
     *   référence #d15a19 → #b04711   ·   référence #ea8423 → #ab580b
     */
    --rouille: #b04711;
    --orange: #ab580b;
    --bleu: #085c8e;
    --validation: #378546;
    --vert-pale: #e3ebdc;
    /*
     * Les deux fonds de vignette d'impact, relevés dans la référence. Ils
     * manquaient : `--impact-moyen` était appelé sans être déclaré, et le fond
     * du garde-fou tombait en transparent — le bord se voyait, pas le fond.
     */
    --impact: #eef1e6;
    --impact-fort: #eef1e6;
    --impact-fort-texte: #557b66;
    --impact-moyen: #fef9f2;
    --filet: #ece3d6;
    --encre: #1b2b26;
    --encre-doux: #5c6b64;

    display: grid;
    gap: 0.85rem;
    max-width: 33rem;
    margin: 0 auto;
    padding: 1.1rem 0.9rem 3rem;
    background: var(--fond);
    color: var(--encre);
  }

  .tete {
    text-align: center;
    display: grid;
    gap: 0.2rem;
    padding: 0.4rem 0 0.6rem;
  }

  .tete h1 {
    margin: 0;
    font-size: 1.9rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--vert);
  }

  .tete p {
    margin: 0;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: var(--bronze);
  }

  .carte {
    display: grid;
    gap: 0.75rem;
    padding: 1.05rem 1.1rem;
    border: 1px solid var(--filet);
    border-radius: 16px;
    background: var(--carte);
    box-shadow: 0 1px 2px rgb(2 68 54 / 4%);
  }

  h2 {
    margin: 0;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--encre-doux);
  }

  .global {
    display: flex;
    align-items: center;
    gap: 1.1rem;
  }

  /* La jauge : un anneau vert, la lettre au centre — comme la référence. */
  .jauge {
    flex: none;
    display: grid;
    place-items: center;
    width: 5.4rem;
    height: 5.4rem;
    border-radius: 50%;
    border: 6px solid var(--teinte);
    background: var(--carte);
  }

  .jauge b {
    font-size: 2.3rem;
    line-height: 1;
    color: var(--vert);
  }

  .jauge span {
    font-size: 0.5rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--encre-doux);
  }

  .verdict {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.5;
    color: var(--encre);
  }

  .chiffres {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
    gap: 0.9rem;
    padding-top: 0.8rem;
    border-top: 1px solid var(--filet);
  }

  .chiffres dt,
  .cles dt {
    font-size: 0.64rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--encre-doux);
  }

  .chiffres dd {
    margin: 0.2rem 0 0;
    display: flex;
    align-items: baseline;
    gap: 0.3rem;
  }

  .chiffres dd b {
    font-size: 2.1rem;
    line-height: 1;
    color: var(--vert);
    font-variant-numeric: tabular-nums;
  }

  .chiffres dd span {
    font-size: 0.7rem;
    color: var(--encre-doux);
  }

  .double-seuil {
    margin: 0;
    padding: 0.6rem 0.8rem;
    border-left: 3px solid var(--vert);
    background: var(--impact);
    border-radius: 0 8px 8px 0;
    font-size: 0.8rem;
    line-height: 1.5;
  }

  ul,
  dl {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.6rem;
  }

  .details li,
  .points li {
    display: flex;
    gap: 0.7rem;
    align-items: flex-start;
    padding-top: 0.6rem;
    border-top: 1px solid var(--filet);
  }

  .details li > div {
    flex: 1;
  }

  .details b {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--vert);
  }

  .details p,
  .points p {
    margin: 0.2rem 0 0;
    font-size: 0.8rem;
    line-height: 1.45;
    color: var(--encre-doux);
  }

  .details button,
  .rapport {
    font: inherit;
    cursor: pointer;
  }

  .details button {
    flex: none;
    padding: 0.28rem 0.7rem;
    border: 1px solid var(--vert-pale);
    border-radius: 999px;
    background: var(--impact);
    font-size: 0.72rem;
    color: var(--vert);
  }

  .pastille {
    flex: none;
    display: grid;
    place-items: center;
    width: 1.7rem;
    height: 1.7rem;
    border-radius: 50%;
    font-size: 0.82rem;
    font-weight: 700;
    color: #fff;
  }

  .pastille.bon {
    background: var(--validation);
  }

  .pastille.attention {
    background: var(--orange);
  }

  .pastille.info {
    background: var(--bleu);
  }

  .points b {
    font-size: 0.87rem;
    color: var(--encre);
  }

  .cles div,
  .manques li {
    display: flex;
    justify-content: space-between;
    gap: 0.8rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--filet);
    font-size: 0.83rem;
  }

  .cles dd {
    margin: 0;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .constats li {
    position: relative;
    padding-left: 1rem;
    font-size: 0.83rem;
    line-height: 1.55;
    color: var(--encre-doux);
  }

  .constats li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.55rem;
    width: 0.38rem;
    height: 0.38rem;
    border-radius: 50%;
    background: var(--validation);
  }

  /* La rouille de la référence : « Non réalisé », « Hors DPE ». */
  .manques li {
    position: relative;
    padding-left: 1rem;
  }

  .manques li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.95rem;
    width: 0.38rem;
    height: 0.38rem;
    border-radius: 50%;
    background: var(--rouille);
  }

  .manques em {
    flex: none;
    font-style: normal;
    font-size: 0.78rem;
    color: var(--rouille);
  }

  .taux {
    margin: 0;
    font-size: 2.4rem;
    line-height: 1;
    font-weight: 700;
    color: var(--vert);
    font-variant-numeric: tabular-nums;
  }

  .piste {
    height: 0.4rem;
    border-radius: 999px;
    background: var(--impact);
    overflow: hidden;
  }

  .barre {
    height: 100%;
    border-radius: 999px;
    background: var(--vert);
  }

  .sous,
  .consigne {
    margin: 0;
    font-size: 0.78rem;
    line-height: 1.5;
    color: var(--encre-doux);
  }

  .travaux li {
    display: grid;
    gap: 0.25rem;
    padding-top: 0.6rem;
    border-top: 1px solid var(--filet);
  }

  .ligne {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem;
  }

  .ligne b {
    font-size: 0.88rem;
    color: var(--encre);
  }

  .perf {
    padding: 0.1rem 0.5rem;
    border-radius: 999px;
    background: var(--impact);
    font-size: 0.71rem;
    color: var(--vert);
    font-variant-numeric: tabular-nums;
  }

  .portee {
    margin: 0;
    font-size: 0.79rem;
    font-weight: 600;
    color: var(--validation);
  }

  .portee.hors {
    font-weight: 400;
    color: var(--encre-doux);
  }

  .conseil {
    border-color: var(--vert-pale);
    background: linear-gradient(180deg, var(--vert-pale) 0%, var(--carte) 72%);
  }

  .conseil h2 {
    color: var(--vert);
  }

  .conseil p {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.55;
    color: var(--encre);
  }

  .rapport {
    padding: 1rem;
    border: none;
    border-radius: 14px;
    background: var(--vert);
    color: #fefcf8;
    font-size: 0.76rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .rapport:hover,
  .rapport:focus-visible,
  .details button:hover,
  .details button:focus-visible {
    filter: brightness(1.12);
  }

  .barre-haut {
    display: grid;
    grid-template-columns: 1.5rem 1fr 1.5rem;
    align-items: center;
    padding: 0.3rem 0.2rem 0;
  }

  .barre-haut .marque {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .barre-haut h1 {
    margin: 0;
    font-family: var(--police-titre, 'Iowan Old Style', Palatino, Georgia, serif);
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--vert);
  }

  .barre-haut > span {
    color: var(--encre-doux);
    font-size: 1.1rem;
    line-height: 1;
  }

  .sous-titre {
    margin: 0.1rem 0 0.3rem;
    text-align: center;
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--bronze);
  }

  /* ── LA JAUGE EN ARC, comme la référence : pas un anneau plein. ────────── */
  .jauge {
    position: relative;
    flex: none;
    width: 6rem;
    height: 6rem;
  }

  .jauge svg {
    width: 100%;
    height: 100%;
    transform: rotate(135deg);
  }

  .jauge .lettre {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding-bottom: 0.9rem;
  }

  .jauge .lettre b {
    font-family: var(--police-titre, 'Iowan Old Style', Palatino, Georgia, serif);
    font-size: 2.5rem;
    line-height: 1;
    color: var(--vert-titre);
  }

  .jauge .lettre span {
    position: absolute;
    bottom: 0.3rem;
    font-size: 0.46rem;
    font-weight: 600;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--encre-doux);
  }

  .resume h3 {
    margin: 0 0 0.3rem;
    font-family: var(--police-titre, 'Iowan Old Style', Palatino, Georgia, serif);
    font-size: 1.2rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--vert-titre);
    text-wrap: balance;
  }

  .resume p {
    margin: 0;
    font-size: 0.82rem;
    line-height: 1.5;
    color: var(--encre-doux);
  }

  .chiffres .val {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
  }

  .chiffres small {
    display: block;
    margin-top: 0.15rem;
    font-size: 0.66rem;
    color: var(--encre-doux);
  }

  /* ── LES RANGÉES À TUILE ───────────────────────────────────────────────── */
  .rangee {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.62rem 0;
    border-top: 1px solid var(--filet);
  }

  .rangee:first-child {
    border-top: none;
  }

  .tuile {
    flex: none;
    display: grid;
    place-items: center;
    width: 2.6rem;
    height: 2.6rem;
    border-radius: 12px;
  }

  /* Les quatre fonds de tuile, relevés dans la référence. */
  .tuile.vert {
    background: #e5eede;
  }

  .tuile.peche {
    background: #fce5d2;
  }

  .tuile.bleu {
    background: #e4eced;
  }

  .tuile.violet {
    background: #efecf0;
  }

  .corps {
    flex: 1;
    min-width: 0;
  }

  .corps b {
    display: block;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--vert-titre);
  }

  .corps p {
    margin: 0.15rem 0 0;
    font-size: 0.76rem;
    line-height: 1.4;
    color: var(--encre-doux);
  }

  .pilule {
    flex: none;
    padding: 0.26rem 0.65rem;
    border: none;
    border-radius: 999px;
    background: var(--impact-fort);
    font: inherit;
    font-size: 0.7rem;
    color: var(--vert);
    cursor: pointer;
  }

  /*
   * Les chevrons de la référence sont SOMBRES, pas gris clair : mesuré, leur
   * trait tombe autour de #06070a. Un #b9b2a6 les rendait presque invisibles, et
   * c'était une couleur de mon cru — hors de la palette relevée.
   */
  .chev {
    flex: none;
    color: var(--encre-doux);
  }

  .cles div {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem 0;
    border-top: 1px solid var(--filet);
    font-size: 0.8rem;
  }

  .cles div:first-child {
    border-top: none;
  }

  .cles dt {
    flex: 1;
  }

  .cles .ic {
    flex: none;
    color: var(--encre-doux);
  }

  .rond {
    flex: none;
    display: grid;
    place-items: center;
    width: 2.3rem;
    height: 2.3rem;
    border-radius: 50%;
    color: #fff;
    font-size: 1rem;
    font-weight: 700;
  }

  .rond.bon {
    background: var(--validation);
  }

  .rond.attention {
    background: var(--orange);
  }

  .rond.info {
    background: var(--bleu);
  }

  .points .corps b,
  .reco .corps b {
    font-size: 0.84rem;
    font-weight: 600;
    letter-spacing: 0;
    text-transform: none;
  }

  /* ── LA COLONNE DE DROITE DES RECOMMANDATIONS ──────────────────────────── */
  .impact {
    display: inline-block;
    margin-top: 0.28rem;
    padding: 0.22rem 0.6rem;
    border-radius: 6px;
    font-size: 0.7rem;
  }

  .impact.fort {
    background: var(--impact-fort);
    color: var(--impact-fort-texte);
  }

  .impact.moyen {
    background: var(--impact-moyen);
    color: var(--rouille);
  }

  .droite {
    flex: none;
    text-align: right;
  }

  .droite small {
    display: block;
    font-size: 0.62rem;
    line-height: 1.3;
    color: var(--encre-doux);
  }

  .droite b {
    font-size: 0.84rem;
    color: var(--vert-titre);
    font-variant-numeric: tabular-nums;
  }

  .droite b.hors {
    font-size: 0.72rem;
    font-weight: 400;
    color: var(--encre-doux);
  }

  /* ── LES ACTIONS PLEINE LARGEUR ────────────────────────────────────────── */
  .action {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.85rem 1rem;
    border: none;
    border-radius: 14px;
    background: var(--carte);
    font: inherit;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--vert-titre);
    cursor: pointer;
    box-shadow: 0 1px 3px rgb(2 68 54 / 5%);
  }

  .action .chev {
    margin-left: auto;
  }

  .action.sombre {
    background: var(--vert);
    color: #fefcf8;
    box-shadow: none;
  }

  .action.sombre .chev {
    color: rgb(254 252 248 / 65%);
  }

  .action:hover,
  .action:focus-visible,
  .pilule:hover,
  .pilule:focus-visible {
    filter: brightness(1.06);
  }

  /* ── LES FILIGRANES DE LA RÉFÉRENCE ────────────────────────────────────── */
  .filigrane {
    position: absolute;
    right: -0.4rem;
    bottom: -0.6rem;
    opacity: 0.28;
    color: var(--validation);
    pointer-events: none;
  }

  .constats,
  .manques,
  .conseil p {
    position: relative;
    z-index: 1;
  }

  /* ── LA BARRE D'ONGLETS, relevée dans la référence ─────────────────────── */
  .onglets {
    position: sticky;
    bottom: 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.2rem;
    margin: 0.3rem -0.9rem -3rem;
    padding: 0.6rem 0.5rem 0.8rem;
    border-top: 1px solid #f4efe8;
    background: #fefcf8;
  }

  .onglets button {
    display: grid;
    justify-items: center;
    gap: 0.22rem;
    padding: 0.15rem 0.1rem;
    border: none;
    background: transparent;
    font: inherit;
    font-size: 0.6rem;
    line-height: 1.2;
    /*
     * Le gris de la référence (#c7c6c5) donne 1,66 de contraste sur la barre :
     * les trois onglets inactifs sont pratiquement invisibles. Un onglet qu'on
     * ne lit pas n'est pas un onglet. Même gris chaud, assez foncé pour se lire.
     */
    color: #706b64;
    cursor: pointer;
  }

  .onglets button.actif {
    color: #044133;
    font-weight: 600;
  }

  .onglets button:hover,
  .onglets button:focus-visible {
    color: var(--vert);
  }

  /* ── LE COÛT ANNUEL ────────────────────────────────────────────────────── */
  .montant {
    margin: 0;
    font-family: var(--police-titre, 'Iowan Old Style', Palatino, Georgia, serif);
    font-size: 1.7rem;
    line-height: 1.15;
    font-weight: 700;
    color: var(--vert-titre);
    font-variant-numeric: tabular-nums;
    text-wrap: balance;
  }

  .garde {
    margin: 0;
    padding: 0.65rem 0.85rem;
    border-left: 3px solid var(--bronze);
    background: var(--impact-moyen);
    border-radius: 0 8px 8px 0;
    font-size: 0.79rem;
    line-height: 1.5;
    color: var(--encre);
  }
</style>
