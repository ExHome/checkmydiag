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
    surRapportComplet = null
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
  } = $props();

  const schema = $derived(diagnostic.schema?.genre === 'dpe' ? diagnostic.schema : null);
  const finale = $derived<Lettre | null>(schema?.finale ?? null);
  const bandeau = (nom: BandeauDecoupe['nom']) => bandeaux.find((b) => b.nom === nom) ?? null;

  /** L'échelle réglementaire, déjà en usage dans la maison. */
  const COULEURS: Record<Lettre, string> = {
    A: '#319834',
    B: '#33cc31',
    C: '#cbfc34',
    D: '#fbfe06',
    E: '#fbcc05',
    F: '#fc9935',
    G: '#fc0205'
  };

  /*
   * La phrase du résultat vient de l'analyse, pas d'ici : c'est elle qui connaît
   * les seuils et les conséquences réglementaires.
   */
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
    { cle: 'enveloppe', titre: 'ENVELOPPE DU BÂTIMENT', texte: phraseMurs() },
    { cle: 'systemes', titre: 'CHAUFFAGE & ECS', texte: phraseSystemes() },
    {
      cle: 'ventilation',
      titre: 'VENTILATION',
      texte: systemes.ventilation?.type ?? 'Non précisé dans le rapport'
    },
    {
      cle: 'surface',
      titre: 'SURFACE DE RÉFÉRENCE',
      texte: enveloppe.bien.surfaceReference?.valeur ?? 'Non précisée dans le rapport'
    }
  ]);

  /* ── CARACTÉRISTIQUES CLÉS ────────────────────────────────────────────────
     Chaque ligne vient de la fiche technique. Une donnée absente ne s'affiche
     pas : la maquette montre sept lignes, le rapport n'en donne pas toujours
     sept. */
  const CLES = $derived(
    [
      ['Type de bien', enveloppe.bien.typeDeBien?.valeur],
      ['Année de construction', enveloppe.bien.anneeConstruction?.valeur],
      ['Surface de référence', enveloppe.bien.surfaceReference?.valeur],
      ['Nombre de niveaux', enveloppe.bien.nombreNiveaux?.valeur],
      ['Hauteur sous plafond', enveloppe.bien.hauteurSousPlafond?.valeur],
      ['Département', enveloppe.bien.departement?.valeur],
      ['Altitude', enveloppe.bien.altitude?.valeur]
    ].filter((l): l is [string, string] => Boolean(l[1]))
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
  <!-- ── EN-TÊTE ─────────────────────────────────────────────────────────── -->
  <header class="tete">
    <h1>DPE</h1>
    <p>Synthèse du diagnostic</p>
  </header>

  <VignetteDuBien {photo} bien={enveloppe.bien} />

  <!-- ── 1 · RÉSULTAT GLOBAL ─────────────────────────────────────────────── -->
  <section class="carte resultat">
    <h2>Résultat global</h2>
    <div class="global">
      {#if finale}
        <div class="jauge" style:--teinte={COULEURS[finale]}>
          <b>{finale}</b>
          <span>Classe énergie</span>
        </div>
      {/if}
      <p class="verdict">{diagnostic.verdict}</p>
    </div>

    <div class="chiffres">
      {#if schema?.energie}
        <div>
          <dt>Consommation d’énergie</dt>
          <dd>
            <b>{schema.energie.valeur.toLocaleString('fr-FR')}</b>
            <span>{schema.energie.unite}</span>
          </dd>
        </div>
      {/if}
      {#if schema?.climat}
        <div>
          <dt>Émissions de gaz à effet de serre</dt>
          <dd>
            <b>{schema.climat.valeur.toLocaleString('fr-FR')}</b>
            <span>{schema.climat.unite}</span>
          </dd>
        </div>
      {/if}
    </div>

    <!--
      La règle du double seuil, écrite en clair : c'est elle qui décide de la
      classe affichée partout ailleurs, et presque personne ne la connaît.
    -->
    {#if schema?.energie && schema?.climat}
      <p class="double-seuil">
        <b>C’est la moins bonne des deux qui est retenue.</b> La classe du logement n’est
        jamais une moyenne des deux étiquettes.
      </p>
    {/if}

    <BandeauDuRapport bandeau={bandeau('étiquette')} />
  </section>

  <!-- ── 2 · DÉTAILS TECHNIQUES DU LOGEMENT ──────────────────────────────── -->
  <section class="carte">
    <h2>Détails techniques du logement</h2>
    <ul class="details">
      {#each DETAILS as d (d.cle)}
        <li>
          <div>
            <b>{d.titre}</b>
            <p>{d.texte}</p>
          </div>
          {#if surDetail}
            <button type="button" onclick={() => surDetail(d.cle)}>Détail</button>
          {/if}
        </li>
      {/each}
    </ul>
    <BandeauDuRapport bandeau={bandeau('vue d’ensemble')} />
  </section>

  <!-- ── 3 · CARACTÉRISTIQUES CLÉS ───────────────────────────────────────── -->
  {#if CLES.length > 0}
    <section class="carte">
      <h2>Caractéristiques clés du logement</h2>
      <dl class="cles">
        {#each CLES as [nom, valeur] (nom)}
          <div><dt>{nom}</dt><dd>{valeur}</dd></div>
        {/each}
      </dl>
    </section>
  {/if}

  <!-- ── 4 · POINTS CLÉS ─────────────────────────────────────────────────── -->
  <section class="carte">
    <h2>Points clés</h2>
    <ul class="points">
      {#each POINTS_CLES as p (p.titre)}
        <li>
          <span class="pastille {p.signe}" aria-hidden="true"
            >{p.signe === 'bon' ? '✓' : p.signe === 'attention' ? '!' : 'i'}</span
          >
          <div><b>{p.titre}</b><p>{p.texte}</p></div>
        </li>
      {/each}
    </ul>
  </section>

  <!-- ── 5 · CONSTATATIONS DIVERSES ──────────────────────────────────────── -->
  {#if CONSTATATIONS.length > 0}
    <section class="carte">
      <h2>Constatations diverses</h2>
      <ul class="constats">
        {#each CONSTATATIONS as c (c)}
          <li>{c}</li>
        {/each}
      </ul>
    </section>
  {/if}

  <!-- ── 6 · CE QUI N'A PAS ÉTÉ CONTRÔLÉ ─────────────────────────────────── -->
  <section class="carte">
    <h2>Ce qui n’a pas été contrôlé ou renseigné</h2>
    <ul class="manques">
      {#each NON_RENSEIGNE as m (m.quoi)}
        <li><span>{m.quoi}</span><em>{m.etat}</em></li>
      {/each}
    </ul>
  </section>

  <!-- ── 7 · NIVEAU DE CONFIANCE ─────────────────────────────────────────── -->
  {#if confiance !== null}
    <section class="carte">
      <h2>Niveau de confiance</h2>
      <p class="taux">{pourcent(confiance)}</p>
      <div class="piste"><div class="barre" style:width={pourcent(confiance)}></div></div>
      <p class="sous">
        Part de ce que nous avons pu lire dans le rapport. Ce n’est pas un jugement
        sur le diagnostic : c’est la mesure de notre propre lecture.
      </p>
    </section>
  {/if}

  <!-- ── 8 · RECOMMANDATIONS PRINCIPALES ─────────────────────────────────── -->
  {#if travaux.length > 0}
    <section class="carte">
      <h2>Recommandations principales</h2>
      <ul class="travaux">
        {#each travaux as t, i (t.lot ?? i)}
          <li>
            <div class="ligne">
              <b>{t.lot ?? 'Poste non nommé'}</b>
              {#if t.performance}<span class="perf">{t.performance}</span>{/if}
            </div>
            <!--
              À la place de « économie estimée ~ 320 € / an », qui n'existe dans
              aucune source : la part de pertes que ce travail touche, prise dans
              la fiche ADEME du même DPE.
            -->
            {#if t.portee.genre === 'part'}
              <p class="portee">Agit sur <b>{pourcent(t.portee.part)}</b> des pertes</p>
            {:else if t.portee.genre === 'hors enveloppe'}
              <p class="portee hors">N’agit pas sur les pertes : change la façon de les compenser</p>
            {/if}
            <p class="consigne">{t.description}</p>
          </li>
        {/each}
      </ul>
      <BandeauDuRapport bandeau={bandeau('après travaux')} />
    </section>
  {/if}

  <BandeauDuRapport bandeau={bandeau('coûts')} />

  <!-- ── 9 · CONSEIL VERRIÈRE ────────────────────────────────────────────── -->
  <section class="carte conseil">
    <h2>Conseil Verrière</h2>
    <p>
      {#if finale === 'A' || finale === 'B' || finale === 'C'}
        Votre logement est déjà performant. Les améliorations ci-dessus visent le
        confort et la facture, pas la mise en conformité.
      {:else if finale === 'F' || finale === 'G'}
        Votre logement fait partie des plus gros consommateurs. Les travaux
        ci-dessus ne sont pas seulement une économie : ils conditionnent ce que la
        loi vous autorise à faire du bien.
      {:else}
        Ce rapport décrit un logement ordinaire. Les travaux ci-dessus visent les
        postes que le diagnostiqueur a jugés prioritaires.
      {/if}
      Le rapport reste la référence : ce que vous lisez ici en vient, ligne à ligne.
    </p>
  </section>

  {#if surRapportComplet}
    <button type="button" class="rapport" onclick={surRapportComplet}>
      Voir le rapport complet
    </button>
  {/if}
</article>

<style>
  /* La charte : vert profond, ivoire, sable discret. Cartes respirantes. */
  .dpe {
    display: grid;
    gap: 1rem;
    max-width: 34rem;
    margin: 0 auto;
    padding: 1rem 0.9rem 3rem;
    background: var(--fond, #f7f6f2);
    color: var(--encre, #0a2b23);
  }

  .tete {
    text-align: center;
    display: grid;
    gap: 0.15rem;
  }

  .tete h1 {
    margin: 0;
    font-size: 1.7rem;
    letter-spacing: 0.06em;
    color: var(--vert-verriere, #12463b);
  }

  .tete p {
    margin: 0;
    font-size: 0.74rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--verriere-sable-encre, #896c33);
  }

  .carte {
    display: grid;
    gap: 0.7rem;
    padding: 1rem 1.05rem;
    border: 1px solid var(--verriere-sable-filet, #d8c199);
    border-radius: 12px;
    background: var(--papier, #fff);
  }

  h2 {
    margin: 0;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--encre-doux, #4a5a55);
  }

  .global {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  /* La jauge : un disque cerclé de la couleur réglementaire de la classe. */
  .jauge {
    flex: none;
    display: grid;
    place-items: center;
    width: 5.2rem;
    height: 5.2rem;
    border-radius: 50%;
    border: 5px solid var(--teinte);
    background: var(--papier, #fff);
  }

  .jauge b {
    font-size: 2.1rem;
    line-height: 1;
    color: var(--encre, #0a2b23);
  }

  .jauge span {
    font-size: 0.52rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--encre-doux, #4a5a55);
  }

  .verdict {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .chiffres {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: 0.8rem;
    padding-top: 0.7rem;
    border-top: 1px solid var(--surface, rgb(10 43 35 / 3%));
  }

  .chiffres dt,
  .cles dt {
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--encre-doux, #4a5a55);
  }

  .chiffres dd {
    margin: 0.15rem 0 0;
    display: flex;
    align-items: baseline;
    gap: 0.3rem;
  }

  .chiffres dd b {
    font-size: 1.9rem;
    line-height: 1;
  }

  .chiffres dd span {
    font-size: 0.72rem;
    color: var(--encre-doux, #4a5a55);
  }

  .double-seuil {
    margin: 0;
    padding: 0.6rem 0.8rem;
    border-left: 3px solid var(--vert-verriere, #12463b);
    background: var(--surface, rgb(10 43 35 / 3%));
    border-radius: 0 6px 6px 0;
    font-size: 0.82rem;
    line-height: 1.5;
  }

  ul,
  dl {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.55rem;
  }

  .details li,
  .points li {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    padding-top: 0.55rem;
    border-top: 1px solid var(--surface, rgb(10 43 35 / 3%));
  }

  .details li > div {
    flex: 1;
  }

  .details b {
    font-size: 0.74rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .details p,
  .points p {
    margin: 0.15rem 0 0;
    font-size: 0.82rem;
    line-height: 1.45;
    color: var(--encre-doux, #4a5a55);
  }

  .details button,
  .rapport {
    font: inherit;
    cursor: pointer;
  }

  .details button {
    flex: none;
    padding: 0.25rem 0.6rem;
    border: 1px solid var(--vert-100, #e6ede4);
    border-radius: 999px;
    background: transparent;
    font-size: 0.74rem;
    color: var(--vert-verriere, #12463b);
  }

  .pastille {
    flex: none;
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    font-size: 0.78rem;
    font-weight: 700;
    color: #fff;
  }

  .pastille.bon {
    background: var(--vert-verriere, #12463b);
  }

  .pastille.attention {
    background: #c05621;
  }

  .pastille.info {
    background: #2f5d8a;
  }

  .cles div,
  .manques li {
    display: flex;
    justify-content: space-between;
    gap: 0.8rem;
    padding-top: 0.45rem;
    border-top: 1px solid var(--surface, rgb(10 43 35 / 3%));
    font-size: 0.83rem;
  }

  .cles dd {
    margin: 0;
    text-align: right;
  }

  .constats li {
    position: relative;
    padding-left: 0.9rem;
    font-size: 0.83rem;
    line-height: 1.5;
    color: var(--encre-doux, #4a5a55);
  }

  .constats li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.5rem;
    width: 0.35rem;
    height: 0.35rem;
    border-radius: 50%;
    background: var(--vert-verriere, #12463b);
  }

  .manques em {
    flex: none;
    font-style: normal;
    font-size: 0.76rem;
    color: var(--verriere-sable-encre, #896c33);
  }

  .taux {
    margin: 0;
    font-size: 2.1rem;
    line-height: 1;
    color: var(--vert-verriere, #12463b);
  }

  .piste {
    height: 0.45rem;
    border-radius: 999px;
    background: var(--surface, rgb(10 43 35 / 3%));
    overflow: hidden;
  }

  .barre {
    height: 100%;
    border-radius: 999px;
    background: var(--vert-verriere, #12463b);
  }

  .sous,
  .consigne {
    margin: 0;
    font-size: 0.78rem;
    line-height: 1.5;
    color: var(--encre-doux, #4a5a55);
  }

  .travaux li {
    display: grid;
    gap: 0.2rem;
    padding-top: 0.55rem;
    border-top: 1px solid var(--surface, rgb(10 43 35 / 3%));
  }

  .ligne {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem;
  }

  .ligne b {
    font-size: 0.87rem;
  }

  .perf {
    padding: 0.05rem 0.45rem;
    border: 1px solid var(--vert-100, #e6ede4);
    border-radius: 999px;
    font-size: 0.72rem;
    color: var(--vert-verriere, #12463b);
  }

  .portee {
    margin: 0;
    font-size: 0.79rem;
    color: var(--vert-verriere, #12463b);
  }

  .portee.hors {
    color: var(--encre-doux, #4a5a55);
  }

  .conseil {
    border-color: var(--vert-100, #e6ede4);
    background: linear-gradient(
      180deg,
      var(--vert-100, #e6ede4) 0%,
      var(--papier, #fff) 70%
    );
  }

  .conseil p {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.55;
  }

  .rapport {
    padding: 0.9rem 1rem;
    border: none;
    border-radius: 12px;
    background: var(--vert-profond, #0a2b23);
    color: var(--ivoire, #f7f6f2);
    font-size: 0.78rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
</style>
