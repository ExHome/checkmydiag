<script lang="ts">
  /**
   * L'AMIANTE — le visuel du pack du 22/08/2026, au trait près.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * LA FORME EST CELLE DU MOCKUP. LES VALEURS SORTENT DU RAPPORT.
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Ordre d'Aude : « je veux exactement le même visuel que dans le zip, pas
   * d'approximation ». Et, dans le même ordre : « aucune donnée fictive ne doit
   * devenir une valeur par défaut ».
   *
   * Les deux tiennent, à une condition — et c'est toute la discipline de cet
   * écran : **on reproduit chaque bloc, chaque icône, chaque rythme du visuel ;
   * on CALCULE ce qu'il affiche.** Les trois valeurs que le mockup montre et
   * qu'aucun constat ne porte — le niveau de risque, le pourcentage de
   * confiance, les catégories d'ouvrage — sont dérivées par des règles écrites
   * dans `visuel.ts`, chacune avec ce sur quoi elle repose.
   *
   * Et la règle qui prime sur le dessin : **une ligne dont la donnée manque ne
   * s'affiche pas.** Une catégorie cochée « Contrôlée » que personne n'a
   * regardée serait le pire mensonge de l'écran — elle rassure.
   *
   * ── LES DEUX CANAUX, PARTOUT ────────────────────────────────────────────
   *
   * Aucun état n'est porté par la seule couleur : le niveau de risque a son
   * MOT, les statuts ont leur LIBELLÉ, le filet du bandeau double la pastille.
   * L'écran se lit en noir et blanc.
   */
  import type { Diagnostic } from '../../lib/modele';
  import { syntheseAmiante } from './synthese';
  import { TITRE_BANDEAU, categoriesDe, confianceDe, iconeDe, suiteReglementaire } from './visuel';

  let {
    diagnostic,
    entete = true,
    versRapport,
    versDetails,
    versPhotos,
    versConseils,
    versSavoir,
    versRetour,
    versPlus
  }: {
    diagnostic: Diagnostic;
    entete?: boolean;
    versRapport?: () => void;
    versDetails?: () => void;
    versPhotos?: () => void;
    versConseils?: () => void;
    versSavoir?: () => void;
    versRetour?: () => void;
    versPlus?: () => void;
  } = $props();

  const s = $derived(syntheseAmiante(diagnostic));
  /*
   * ⚠️ L'ÉCHELLE DE RISQUE A ÉTÉ RETIRÉE LE 22/08 — ordre d'Aude : « respecte
   * l'intitulé de la réglementation ». Aucun texte amiante ne gradue un niveau
   * de risque ; il définit une COTATION et la suite qu'elle impose. La pastille
   * porte donc « Score 3 », « AC1 », « EP »… et ce que le droit y attache.
   */
  const suite = $derived(suiteReglementaire(s));
  const confiance = $derived(confianceDe(s));

  /*
   * LE BLOC « ÉLÉMENTS CONTRÔLÉS » — ce que le rapport a vu, pas ce que le
   * mockup coche.
   *
   * Le visuel montre cinq catégories d'ouvrage (Toiture, Façades, Revêtements,
   * Conduits, Sols). Un constat, lui, liste des PIÈCES : « RDC - Cuisine »,
   * « R+1 - Chambre 2 ». Ce sont deux choses différentes, et seule la seconde
   * est écrite quelque part.
   *
   * On garde donc la ligne du mockup — vignette, libellé, « Contrôlé ✓ » — et
   * on la remplit avec ce que le rapport nomme : ses pièces quand il en donne,
   * ses catégories d'ouvrage quand elles se déduisent des matériaux. Jamais
   * une case cochée que personne n'a regardée.
   */
  const elements = $derived(
    /*
     * LES FAMILLES D'ABORD, LES PIÈCES EN REPLI — et pas l'inverse.
     *
     * Le visuel montre des familles d'ouvrage, chacune avec son pictogramme :
     * Toiture, Façades, Revêtements, Conduits, Sols. Tant que cette colonne
     * affichait les PIÈCES du rapport — « Rez de chaussée - Entrée », « 1er
     * étage - Chambre 2 » — aucune ne pouvait porter d'icône juste : mesuré le
     * 22/08 sur le banc, les six lignes tombaient toutes sur le même
     * pictogramme de repli. Une pièce ne dit pas quel ouvrage a été regardé.
     *
     * Les familles se déduisent des composants du § 3.2.6 (« Sol », « Mur »,
     * « Fenêtre »…), et là chaque ligne a son dessin. On ne garde les pièces
     * que lorsqu'aucune famille ne ressort : six volets LICIEL sur onze
     * n'impriment pas ce tableau, et une colonne vide vaudrait moins que des
     * noms de pièces réellement visitées.
     */
    categoriesDe(s).length
      ? categoriesDe(s)
      : s.elements.montrer && s.elements.entrees.length
        ? s.elements.entrees.map((e) => ({ nom: e.quoi, icone: iconeDe(e.quoi) }))
        : []
  );

  /*
   * LES PANNEAUX SE REPLIENT — comme dans le visuel, qui met un chevron au
   * bout de chaque en-tête.
   *
   * ⚠️ Mais ils s'ouvrent TOUS LES DEUX au premier affichage, et « Ce qui n'a
   * pas été contrôlé » garde son compte visible même replié. Un bloc fermé qui
   * ne dit pas ce qu'il contient se lit comme un bloc vide — et le § 4 de
   * l'ordre interdit qu'une zone non contrôlée passe pour saine, y compris par
   * omission d'affichage.
   */
  let ouvert = $state({ constatations: true, limites: true });

  /** D'où sort le pourcentage — dit en clair, jamais caché derrière un clic. */
  const calcul = $derived(
    confiance.part !== null
      ? `${confiance.examinees} pièces examinées, ${confiance.nonExaminees} local ou composant resté fermé : ` +
        `${confiance.examinees} sur ${confiance.examinees + confiance.nonExaminees}. ` +
        'Les deux comptes viennent du rapport — la liste des pièces visitées et celle des locaux non visités.'
      : 'Le rapport ne donne pas les deux listes nécessaires au calcul : on ne montre donc aucun pourcentage.'
  );
</script>

<article class="ecran" data-issue={s.issue} data-risque={suite.ton}>
  {#if entete}
    <header class="titre">
      <!--
        La barre du visuel : retour à gauche, titre au centre, « plus » à
        droite. Les deux boutons ne s'affichent QUE si l'appelant en fournit
        l'action : un bouton qui ne mène nulle part promet quelque chose.
      -->
      <div class="barre">
        {#if versRetour}
          <button type="button" class="rond-barre" onclick={versRetour} aria-label="Revenir au dossier">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
        {:else}
          <span class="rond-barre vide" aria-hidden="true"></span>
        {/if}

        <div class="au-centre">
          <svg class="toit" viewBox="0 0 46 36" aria-hidden="true">
            <path d="M5 19 L23 5 L41 19" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M10.5 18 L10.5 30.5 L35.5 30.5 L35.5 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
          <h1>Amiante</h1>
          <p class="sous-titre">Synthèse du diagnostic</p>
        </div>

        {#if versPlus}
          <button type="button" class="rond-barre" onclick={versPlus} aria-label="Autres actions">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5.5" cy="12" r="1.7" fill="currentColor" /><circle cx="12" cy="12" r="1.7" fill="currentColor" /><circle cx="18.5" cy="12" r="1.7" fill="currentColor" /></svg>
          </button>
        {:else}
          <span class="rond-barre vide" aria-hidden="true"></span>
        {/if}
      </div>
    </header>
  {/if}

  <!-- ══ RÉSULTAT GLOBAL ══════════════════════════════════════════════ -->
  <section class="bandeau" aria-labelledby="resultat-amiante">
    <!--
      LA PLAQUE DE FIBRES-CIMENT — l'image du pack, à la demande d'Aude.

      Découpée dans le visuel de référence sur sa crête éclairée, servie en
      WebP (24 ko) avec repli JPEG. C'est une PHOTO DE MATIÈRE, pas la photo
      d'un logement : elle montre de quoi on parle sans faire croire qu'elle
      montre le bien de l'acquéreur. Décorative — `alt=""`.

      ⚠️ Pas de `loading="lazy"` : c'est l'image de tête de l'écran. Différer ce
      qu'on voit en premier, c'est afficher un trou pendant que le reste arrive.
    -->
    <picture class="plaque">
      <source srcset="./fond/plaque-amiante.webp" type="image/webp" />
      <img
        src="./fond/plaque-amiante.jpg"
        alt=""
        width="361"
        height="620"
        decoding="async"
        fetchpriority="high"
      />
    </picture>
    <span class="fondu" aria-hidden="true"></span>

    <div class="dans-bandeau">
      <p class="chapeau" id="resultat-amiante">Résultat global</p>
      <p class="verdict">{TITRE_BANDEAU[s.issue]}</p>
      <p class="chapeau bas">{suite.impose ? 'Cotation du rapport' : 'Ce que le rapport conclut'}</p>
      <p class="pastille">
        <svg class="feuille" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M17 3c0 8-4.5 12-11 12 0-8 4.5-12 11-12Z" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="M12.5 7.5C9 10 6.5 13.5 5.5 17" fill="none" stroke="currentColor" stroke-width="1.3" />
        </svg>
        {suite.mot}
      </p>
      {#if suite.impose}
        <!-- La suite que le droit attache à cette cotation, dans ses mots. -->
        <p class="impose">{suite.impose}</p>
      {/if}
    </div>
  </section>

  <!-- ══ POINTS CLÉS ══════════════════════════════════════════════════ -->
  {#if s.pointsCles.length}
    <h2 class="rubrique">Points clés</h2>
    <ul class="cartes">
      {#each s.pointsCles as p (p.titre)}
        <li class="carte cle" data-ton={p.ton}>
          <span class="rond" aria-hidden="true">
            {#if p.ton === 'bon'}
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="currentColor" /><path d="M7 12.4l3.2 3.2L17 8.8" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {:else if p.ton === 'alerte'}
              <svg viewBox="0 0 24 24"><path d="M12 3 22.5 21H1.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" /><path d="M12 9.5v5.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" /><circle cx="12" cy="18" r="1.15" fill="currentColor" /></svg>
            {:else}
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.7" /><path d="M12 10.8v6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" /><circle cx="12" cy="7.3" r="1.15" fill="currentColor" /></svg>
            {/if}
          </span>
          <span class="dit">
            <strong>{p.titre}</strong>
            <small>{p.detail}</small>
          </span>
          <!--
            Le chevron du visuel, sur chaque carte — mais ATTÉNUÉ quand il ne
            mène nulle part. Une flèche pleine sur une ligne sans suite promet
            un détail qui n'existe pas ; effacée, elle garde le rythme du
            dessin sans mentir.
          -->
          <span class="chevron" class:sourd={!p.ancre} aria-hidden="true">›</span>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- ══ ÉLÉMENTS CONTRÔLÉS ═══════════════════════════════════════════ -->
  {#if elements.length}
    <h2 class="rubrique">Éléments contrôlés</h2>
    <ul class="cartes">
      {#each elements as c (c.nom)}
        <li class="carte element">
          <span class="vignette" aria-hidden="true">
            {#if c.icone === 'toiture'}
              <svg viewBox="0 0 24 24"><path d="M2.5 12 12 5l9.5 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /><path d="M5 11.5 5 19h14v-7.5" fill="none" stroke="currentColor" stroke-width="1.4" /><path d="M7.5 12.4v6M10 12v6.6M12.5 12v6.6M15 12v6.6M17.5 12.4v6" stroke="currentColor" stroke-width="1" /></svg>
            {:else if c.icone === 'facade'}
              <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1.4" /><path d="M3 9.7h18M3 14.3h18M8 5v4.7M16 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M8 14.3V19M16 14.3V19" stroke="currentColor" stroke-width="1.1" /></svg>
            {:else if c.icone === 'revetement'}
              <svg viewBox="0 0 24 24"><rect x="4.5" y="3.5" width="15" height="6" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.4" /><path d="M12 9.5v3.2" stroke="currentColor" stroke-width="1.4" /><rect x="9.6" y="12.7" width="4.8" height="7.8" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.4" /></svg>
            {:else if c.icone === 'conduit'}
              <svg viewBox="0 0 24 24"><rect x="5" y="4" width="4.6" height="16" rx="1" fill="none" stroke="currentColor" stroke-width="1.4" /><rect x="14.4" y="4" width="4.6" height="16" rx="1" fill="none" stroke="currentColor" stroke-width="1.4" /><path d="M5 9h4.6M5 14h4.6M14.4 9H19M14.4 14H19" stroke="currentColor" stroke-width="1.1" /></svg>
            {:else if c.icone === 'sol'}
              <!-- Un carrelage vu en perspective, comme dans le pack. Le
                   triangle qui tenait cette place se lisait comme un toit. -->
              <svg viewBox="0 0 24 24"><path d="M8.4 7.5H15.6L20 19.5H4Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /><path d="M6.9 11.5h10.2M5.5 15.5h13" stroke="currentColor" stroke-width="1.05" /><path d="M10.8 7.5 9.3 19.5M13.2 7.5l1.5 12" stroke="currentColor" stroke-width="1.05" /></svg>
            {:else if c.icone === 'menuiserie'}
              <!-- Une fenêtre à deux ouvrants — l'ouvrage où l'amiante ne se
                   voit pas : elle est dans le mastic de vitrage. -->
              <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.4" /><path d="M12 4v16M4 11.5h16" stroke="currentColor" stroke-width="1.2" /><path d="M9.6 12.8v2.2M14.4 12.8v2.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
            {:else if c.icone === 'escalier'}
              <svg viewBox="0 0 24 24"><path d="M3.5 20v-3.6h4.6v-3.6h4.6V9.2h4.6V5.6h3.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round" /><path d="M3.5 20h17" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" /></svg>
            {:else}
              <svg viewBox="0 0 24 24"><path d="M3 10 12 3.5 21 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /><path d="M5.5 10v10h13V10" fill="none" stroke="currentColor" stroke-width="1.4" /></svg>
            {/if}
          </span>
          <span class="dit"><strong>{c.nom}</strong></span>
          <span class="coche-libelle">
            Contrôlé
            <svg class="coche" viewBox="0 0 22 22" aria-hidden="true">
              <circle cx="11" cy="11" r="10" fill="currentColor" />
              <path d="M6.4 11.4l3 3 6.2-6.6" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- ══ LES MATÉRIAUX REPÉRÉS ════════════════════════════════════════ -->
  {#if s.materiaux.montrer}
    <h2 class="rubrique">
      {s.materiaux.entrees.length === 1 ? 'Le matériau repéré' : 'Les matériaux repérés'}
    </h2>
    <ul class="cartes">
      {#each s.materiaux.entrees as m, i (m.quoi + i)}
        <li class="carte materiau">
          <span class="vignette alerte" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M3 8q3 5 0 10M8 8q3 5 0 10M13 8q3 5 0 10M18 8q3 5 0 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
          </span>
          <span class="dit">
            <strong>{m.quoi}</strong>
            {#if m.ou}<small class="ou">{m.ou}</small>{/if}
            {#if m.etat}<small class="etat">{m.etat}</small>{/if}
            {#if m.suite}<span class="suite">{m.suite}</span>{/if}
          </span>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- ══ CONSTATATIONS DIVERSES ═══════════════════════════════════════ -->
  {#if s.constatations.montrer}
    <section class="panneau constatations">
      <!-- Le feuillage du visuel, en filigrane dans le coin. Décoratif. -->
      <svg class="feuillage" viewBox="0 0 90 90" aria-hidden="true">
        <path d="M78 10c0 34-19 52-46 52 0-34 19-52 46-52Z" fill="none" stroke="currentColor" stroke-width="1.6" />
        <path d="M62 26C45 37 34 52 30 68" fill="none" stroke="currentColor" stroke-width="1.3" />
        <path d="M70 30c-6 5-13 8-20 9M64 44c-7 4-13 9-17 15" fill="none" stroke="currentColor" stroke-width="1.1" />
      </svg>
      <button
        type="button"
        class="entete-panneau bouton-repli"
        aria-expanded={ouvert.constatations}
        onclick={() => (ouvert.constatations = !ouvert.constatations)}
      >
        <span>Constatations diverses</span>
        <span class="caret" class:replie={!ouvert.constatations} aria-hidden="true">
          <svg viewBox="0 0 20 12"><path d="M2 10 10 2.5 18 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </span>
      </button>
      {#if ouvert.constatations}
        {#if s.constatations.entrees.length}
          <ul class="puces">
            {#each s.constatations.entrees as c, i (c.terme + i)}
              <li><span class="puce" aria-hidden="true"></span><span>{c.terme}{#if c.ou}<em> — {c.ou}</em>{/if}</span></li>
            {/each}
          </ul>
        {:else if s.constatations.mention}
          <p class="texte">{s.constatations.mention}</p>
        {/if}
      {/if}
    </section>
  {/if}

  <!-- ══ CE QUI N'A PAS ÉTÉ CONTRÔLÉ ══════════════════════════════════ -->
  {#if s.nonControle.montrer}
    <section class="panneau limites">
      <!--
        ⚠️ CE PANNEAU S'OUVRE, MAIS IL NE SE REFERME PAS SUR RIEN.
        Son en-tête garde le COMPTE des zones même replié : un bloc fermé qui ne
        dit pas ce qu'il contient se lit comme un bloc vide, et la règle du § 4
        de l'ordre interdit qu'une zone non contrôlée passe pour saine.
      -->
      <button
        type="button"
        class="entete-panneau bouton-repli"
        aria-expanded={ouvert.limites}
        onclick={() => (ouvert.limites = !ouvert.limites)}
      >
        <svg class="garde" viewBox="0 0 22 20" aria-hidden="true">
          <path d="M11 2 20.8 18.6H1.2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
          <path d="M11 7.6v4.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          <circle cx="11" cy="15.3" r="1" fill="currentColor" />
        </svg>
        <span>
          Ce qui n’a pas été contrôlé{#if !ouvert.limites && s.nonControle.entrees.length}
            <span class="compte"> · {s.nonControle.entrees.length}</span>
          {/if}
        </span>
        <span class="caret" class:replie={!ouvert.limites} aria-hidden="true">
          <svg viewBox="0 0 20 12"><path d="M2 10 10 2.5 18 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </span>
      </button>
      {#if ouvert.limites}
        {#if s.nonControle.entrees.length}
          <p class="texte">
            Certaines zones n’ont pas pu être inspectées. Le constat ne dit rien de celles-là :
            ni qu’elles contiennent de l’amiante, ni le contraire.
          </p>
          <ul class="lignes">
            {#each s.nonControle.entrees as l, i (l.quoi + i)}
              <li>
                <span class="puce sable" aria-hidden="true"></span>
                <span class="quoi">
                  {l.quoi}{#if l.ou}<em> — {l.ou}</em>{/if}
                  {#if l.pourquoi}<small>{l.pourquoi}</small>{/if}
                </span>
                <span class="statut">Non contrôlé</span>
              </li>
            {/each}
          </ul>
        {:else if s.nonControle.mention}
          <p class="texte">{s.nonControle.mention}</p>
        {/if}
      {/if}
    </section>
  {/if}

  <!-- ══ NIVEAU DE CONFIANCE ══════════════════════════════════════════ -->
  {#if confiance.part !== null || s.completude.length}
    <section class="panneau confiance">
      <h2 class="entete-panneau">
        <svg class="feuille" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M17 3c0 8-4.5 12-11 12 0-8 4.5-12 11-12Z" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="M12.5 7.5C9 10 6.5 13.5 5.5 17" fill="none" stroke="currentColor" stroke-width="1.3" />
        </svg>
        <span>{confiance.part !== null ? 'Part du bien examinée' : 'Ce que couvre ce rapport'}</span>
        <!--
          Le (i) du visuel. Il n'ouvre pas une aide : il DIT, au survol comme au
          clavier, d'où sort le chiffre. Une note de confiance dont on ne peut
          pas retrouver le calcul ne vaut rien.
        -->
        <span
          class="info"
          tabindex="0"
          role="note"
          aria-label="Comment ce chiffre est calculé : {calcul}"
          title={calcul}
        >
          <svg viewBox="0 0 22 22" aria-hidden="true">
            <circle cx="11" cy="11" r="9.6" fill="none" stroke="currentColor" stroke-width="1.5" />
            <path d="M11 9.8v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <circle cx="11" cy="6.6" r="1.05" fill="currentColor" />
          </svg>
        </span>
      </h2>

      {#if confiance.part !== null}
        <p class="grand-chiffre">{confiance.part}<span class="pourcent">%</span></p>
        <div
          class="jauge"
          role="img"
          aria-label="{confiance.examinees} pièces examinées sur {confiance.examinees + confiance.nonExaminees}"
        >
          <span class="remplissage" style="width: {confiance.part}%"></span>
        </div>
      {/if}
      <p class="texte">{confiance.dit}</p>
      {#if s.completude.length}
        <ul class="puces">
          {#each s.completude as c, i (i)}
            <li><span class="puce" aria-hidden="true"></span><span>{c}</span></li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}

  <!-- ══ CONSEIL VERRIÈRE ═════════════════════════════════════════════ -->
  {#if s.conseil.length}
    <section class="panneau conseil">
      <h2 class="entete-panneau">
        <svg class="feuille" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M17 3c0 8-4.5 12-11 12 0-8 4.5-12 11-12Z" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="M12.5 7.5C9 10 6.5 13.5 5.5 17" fill="none" stroke="currentColor" stroke-width="1.3" />
        </svg>
        Conseil Verrière
      </h2>
      <p class="chapeau-conseil">{s.conseil[0]}</p>
      {#each s.conseil.slice(1) as c, i (i)}
        <p class="texte">{c}</p>
      {/each}
    </section>
  {/if}

  <!-- ══ ACCÈS ════════════════════════════════════════════════════════ -->
  {#if versRapport}
    <button class="rapport" type="button" onclick={versRapport}>
      <svg class="feuillet" viewBox="0 0 20 24" aria-hidden="true">
        <rect x="2" y="1.5" width="16" height="21" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.5" />
        <text x="10" y="16" text-anchor="middle" font-size="6.4" fill="currentColor" font-family="system-ui, sans-serif">PDF</text>
      </svg>
      Voir le rapport complet
      <span class="fleche" aria-hidden="true">›</span>
    </button>
  {/if}

  {#if versSavoir}
    <button class="plus-loin" type="button" onclick={versSavoir}>
      <svg class="livre" viewBox="0 0 24 20" aria-hidden="true">
        <path d="M12 5c-2.5-2-6-2.2-9-1.4v13c3-.8 6.5-.6 9 1.4 2.5-2 6-2.2 9-1.4v-13c-3-.8-6.5-.6-9 1.4Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
        <path d="M12 5v13" fill="none" stroke="currentColor" stroke-width="1.3" />
      </svg>
      <span class="dit">
        <strong>Pour aller plus loin</strong>
        <small>Comprendre l’amiante, les risques et la réglementation</small>
      </span>
      <span class="fleche" aria-hidden="true">›</span>
    </button>
  {/if}

  <p class="source">Pages {s.pages[0]} à {s.pages[1]} du rapport.</p>

  <!-- ══ ONGLETS ══════════════════════════════════════════════════════ -->
  {#if entete && (versDetails || versPhotos || versConseils)}
    <nav class="onglets" aria-label="Sections du diagnostic">
      <span class="onglet actuel" aria-current="page">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11.2 12 3.8l8.5 7.4V20h-6v-5.4h-5V20h-6Z" fill="currentColor" /></svg>
        Synthèse
      </span>
      {#if versDetails}
        <button type="button" class="onglet" onclick={versDetails}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="4.8" cy="7" r="1.5" fill="currentColor" /><circle cx="4.8" cy="12" r="1.5" fill="currentColor" /><circle cx="4.8" cy="17" r="1.5" fill="currentColor" /><path d="M9.5 7h10.5M9.5 12h10.5M9.5 17h10.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /></svg>
          Détails
        </button>
      {/if}
      {#if versPhotos}
        <button type="button" class="onglet" onclick={versPhotos}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.6" y="6.6" width="18.8" height="12.8" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7" /><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="1.7" /><path d="M8.6 6.6 10 4.2h4l1.4 2.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" /></svg>
          Photos
        </button>
      {/if}
      {#if versConseils}
        <button type="button" class="onglet" onclick={versConseils}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2a6 6 0 0 0-3.4 10.9V17h6.8v-2.9A6 6 0 0 0 12 3.2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" /><path d="M9.6 20h4.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" /></svg>
          Conseils
        </button>
      {/if}
    </nav>
  {/if}
</article>

<style>
  .ecran {
    --encre: #0a2b23;
    --encre-douce: #55635e;
    --ivoire: #faf9f6;
    --carte: #fff;
    --filet: rgb(10 43 35 / 8%);
    --sable: #c8a96b;
    --sable-encre: #6b5220;
    --champagne: #fbf4e8;
    --vert-coche: #2f7a52;
    --ombre: 0 1px 2px rgb(10 43 35 / 5%), 0 8px 20px rgb(10 43 35 / 5%);
    background: var(--ivoire);
    color: var(--encre);
    padding: 1.1rem 1rem 1.5rem;
    max-width: 30rem;
    margin: 0 auto;
    font-size: 1rem;
    line-height: 1.5;
  }

  /* ── En-tête ─────────────────────────────────────────────────────── */
  .titre {
    text-align: center;
    margin-bottom: 1.1rem;
  }
  .toit {
    width: 2.5rem;
    height: 1.95rem;
  }
  .titre h1 {
    font-family: var(--titre, Georgia, 'Times New Roman', serif);
    font-size: 2.05rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin: 0.15rem 0 0;
    font-weight: 500;
  }
  .sous-titre {
    margin: 0.3rem 0 0;
    font-size: 0.72rem;
    letter-spacing: 0.21em;
    text-transform: uppercase;
    color: var(--sable-encre);
  }

  /* ── Bandeau ─────────────────────────────────────────────────────── */
  .bandeau {
    position: relative;
    overflow: hidden;
    background-color: #0a2b23;
    border-radius: 1.15rem;
    color: var(--ivoire);
    min-height: 17rem;
    display: flex;
  }
  /*
   * La plaque occupe la droite du bandeau, le texte la gauche — comme le
   * visuel du pack.
   */
  .plaque {
    position: absolute;
    inset: 0 0 0 40%;
    display: block;
  }
  .plaque img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  /*
   * ⚠️ LE FONDU EST MESURÉ, PAS DESSINÉ À L'ŒIL.
   *
   * Premier réglage, vérifié au pixel en composant photo + dégradé dans un
   * canvas : le texte tombait à **1,68:1** sur « RÉSULTAT GLOBAL » et 2,89:1
   * sur le verdict — illisible dès que le soleil frappe l'écran.
   *
   * Le fondu reste donc opaque sur toute la colonne de texte et ne s'ouvre
   * qu'au-delà. La photo garde sa place à droite ; la lisibilité ne se négocie
   * pas contre une texture.
   */
  .fondu {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      100deg,
      #0a2b23 0%,
      #0a2b23 68%,
      rgb(10 43 35 / 86%) 80%,
      rgb(10 43 35 / 52%) 92%,
      rgb(10 43 35 / 28%) 100%
    );
  }
  /*
   * Le texte reste dans sa colonne — celle que le fondu tient opaque.
   *
   * Sans cette limite, le verdict s'étale sur la photo dès qu'il est long, et
   * c'est là que le contraste s'effondre. La largeur est bornée à ce que le
   * fondu couvre, mesuré : 74 % du bandeau. À 62 %, le titre partait sur cinq
   * lignes au lieu de trois — trop étroit pour une phrase de rapport.
   */
  .dans-bandeau {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 1.25rem 1.2rem 1.3rem 1.35rem;
    width: 100%;
    max-width: 74%;
  }
  /* Le filet d'état — il double le mot de la pastille, il ne le remplace pas. */
  .bandeau::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    z-index: 1;
    background: transparent;
  }
  [data-risque='alerte'] .bandeau::before {
    background: var(--alerte, #a33220);
  }
  [data-risque='attention'] .bandeau::before {
    background: var(--sable);
  }
  .chapeau {
    margin: 0;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    opacity: 0.85;
  }
  .chapeau.bas {
    margin-top: 1.05rem;
  }
  .verdict {
    font-family: var(--titre, Georgia, serif);
    font-size: 1.72rem;
    line-height: 1.2;
    margin: 0.55rem 0 auto;
    font-weight: 500;
    max-width: 16ch;
  }
  .impose {
    margin: 0.5rem 0 0;
    font-size: 0.85rem;
    line-height: 1.4;
    max-width: 22em;
  }
  .pastille {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    margin: 0.6rem 0 0;
    padding: 0.62rem 1.3rem 0.62rem 1rem;
    background: rgb(247 246 242 / 12%);
    border: 1px solid rgb(247 246 242 / 32%);
    border-radius: 2rem;
    font-size: 0.95rem;
    letter-spacing: 0.1em;
  }
  .feuille {
    width: 1.2rem;
    height: 1.2rem;
    flex: none;
  }

  /* ── Rubriques et cartes ─────────────────────────────────────────── */
  .rubrique {
    font-size: 0.75rem;
    letter-spacing: 0.17em;
    text-transform: uppercase;
    font-weight: 600;
    margin: 1.55rem 0 0.7rem;
  }
  .cartes {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .carte {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    background: var(--carte);
    border: 1px solid var(--filet);
    border-radius: 0.95rem;
    box-shadow: var(--ombre);
    padding: 0.9rem 1rem;
    margin-bottom: 0.7rem;
  }
  .rond,
  .vignette {
    width: 2.75rem;
    height: 2.75rem;
    flex: none;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #e6efe6;
    color: var(--vert-coche);
  }
  .rond svg,
  .vignette svg {
    width: 1.6rem;
    height: 1.6rem;
  }
  .cle[data-ton='alerte'] .rond {
    background: rgb(163 50 32 / 10%);
    color: var(--alerte, #a33220);
  }
  .cle[data-ton='attention'] .rond {
    background: var(--champagne);
    color: var(--sable-encre);
  }
  .vignette {
    border-radius: 0.8rem;
    background: var(--champagne);
    color: var(--sable-encre);
  }
  .vignette.alerte {
    background: rgb(163 50 32 / 9%);
    color: var(--alerte, #a33220);
  }
  .dit {
    display: flex;
    flex-direction: column;
    gap: 0.13rem;
    min-width: 0;
    flex: 1;
  }
  .dit strong {
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.3;
  }
  .dit small {
    font-size: 0.87rem;
    color: var(--encre-douce);
    line-height: 1.35;
  }
  .chevron {
    flex: none;
    font-size: 1.45rem;
    line-height: 1;
    color: var(--encre-douce);
    opacity: 0.6;
  }
  .chevron.sourd {
    opacity: 0.18;
  }
  .coche-libelle {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    flex: none;
    font-size: 0.88rem;
    color: var(--vert-coche);
  }
  .coche {
    width: 1.4rem;
    height: 1.4rem;
  }
  .materiau {
    align-items: flex-start;
    border-left: 3px solid var(--alerte, #a33220);
  }
  .ou {
    color: var(--encre) !important;
  }
  .etat {
    color: var(--sable-encre) !important;
  }
  .suite {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--filet);
    font-size: 0.89rem;
    line-height: 1.4;
  }

  /* ── Panneaux ────────────────────────────────────────────────────── */
  .panneau {
    border-radius: 1.15rem;
    padding: 1.05rem 1.1rem 1.15rem;
    margin-top: 1.15rem;
    box-shadow: var(--ombre);
  }
  /* ── La barre du haut ────────────────────────────────────────────── */
  .barre {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .au-centre {
    flex: 1;
    min-width: 0;
  }
  .rond-barre {
    width: 2.5rem;
    height: 2.5rem;
    flex: none;
    display: grid;
    place-items: center;
    margin-top: 0.35rem;
    padding: 0;
    background: none;
    border: 0;
    border-radius: 50%;
    color: var(--encre);
    cursor: pointer;
  }
  .rond-barre svg {
    width: 1.5rem;
    height: 1.5rem;
  }
  .rond-barre.vide {
    cursor: default;
  }
  .rond-barre:focus-visible {
    outline: 2px solid var(--sable-encre);
    outline-offset: 2px;
  }

  /* ── En-têtes repliables ─────────────────────────────────────────── */
  .bouton-repli {
    width: 100%;
    background: none;
    border: 0;
    padding: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    text-align: left;
  }
  .bouton-repli:focus-visible {
    outline: 2px solid var(--sable-encre);
    outline-offset: 3px;
    border-radius: 0.4rem;
  }
  .bouton-repli > span:first-of-type {
    flex: 1;
  }
  .caret {
    flex: none;
    display: grid;
    place-items: center;
    width: 1.6rem;
    height: 1.6rem;
    color: var(--encre-douce);
  }
  .caret svg {
    width: 1.05rem;
    height: 0.65rem;
    /* Une rotation, pas une transition sur un jeton mouvant. */
    transition: transform 160ms ease;
  }
  .caret.replie svg {
    transform: rotate(180deg);
  }
  .compte {
    font-weight: 700;
  }

  /* Le (i) : il porte une explication, pas une décoration. */
  .info {
    flex: none;
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    color: var(--encre-douce);
    cursor: help;
  }
  .info svg {
    width: 1.3rem;
    height: 1.3rem;
  }
  .info:focus-visible {
    outline: 2px solid var(--sable-encre);
    outline-offset: 2px;
    border-radius: 50%;
  }

  /* Le feuillage du visuel — décor, jamais une information. */
  .feuillage {
    position: absolute;
    right: 0.4rem;
    bottom: 0.3rem;
    width: 5.5rem;
    height: 5.5rem;
    color: var(--sable);
    opacity: 0.28;
    pointer-events: none;
  }
  .constatations {
    position: relative;
    overflow: hidden;
  }

  .entete-panneau {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 0 0 0.75rem;
    font-size: 0.84rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .garde {
    width: 1.3rem;
    height: 1.2rem;
    flex: none;
  }
  .constatations {
    background: #f1f6f2;
    border: 1px solid var(--filet);
  }
  .limites {
    background: var(--champagne);
    border: 1px solid rgb(200 169 107 / 40%);
  }
  .limites .entete-panneau {
    color: var(--sable-encre);
  }
  .confiance {
    background: var(--carte);
    border: 1px solid var(--filet);
  }
  .conseil {
    background: #e6efe6;
    border: 1px solid rgb(10 43 35 / 6%);
  }
  .texte {
    margin: 0 0 0.55rem;
    font-size: 0.92rem;
    line-height: 1.45;
  }
  .chapeau-conseil {
    font-family: var(--titre, Georgia, serif);
    font-size: 1.14rem;
    font-weight: 500;
    margin: 0 0 0.5rem;
  }

  .puces,
  .lignes {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .puces li,
  .lignes li {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    padding: 0.42rem 0;
    font-size: 0.93rem;
  }
  .puce {
    width: 0.52rem;
    height: 0.52rem;
    flex: none;
    margin-top: 0.48rem;
    border-radius: 50%;
    background: var(--vert-coche);
  }
  .puce.sable {
    background: var(--sable);
  }
  .lignes .quoi {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .lignes small {
    font-size: 0.82rem;
    color: var(--encre-douce);
  }
  .puces em,
  .lignes em {
    font-style: normal;
    color: var(--encre-douce);
  }
  .statut {
    margin-left: auto;
    padding-left: 0.7rem;
    flex: none;
    font-size: 0.81rem;
    color: var(--sable-encre);
    white-space: nowrap;
  }

  /* ── Le grand chiffre et sa jauge ────────────────────────────────── */
  .grand-chiffre {
    font-family: var(--titre, Georgia, serif);
    font-size: 3rem;
    line-height: 1;
    margin: 0.15rem 0 0.7rem;
    font-weight: 500;
    color: var(--encre);
  }
  .pourcent {
    font-size: 2.1rem;
  }
  .jauge {
    height: 0.55rem;
    border-radius: 0.3rem;
    background: #eee6d5;
    overflow: hidden;
    margin-bottom: 0.8rem;
  }
  .remplissage {
    display: block;
    height: 100%;
    border-radius: 0.3rem;
    background: #12463b;
  }

  /* ── Accès ───────────────────────────────────────────────────────── */
  .rapport,
  .plus-loin {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    width: 100%;
    margin-top: 1.15rem;
    padding: 1rem 1.15rem;
    border: 0;
    border-radius: 0.95rem;
    font: inherit;
    cursor: pointer;
    text-align: left;
    box-shadow: var(--ombre);
  }
  .rapport {
    background: #12463b;
    color: var(--ivoire);
    font-size: 0.87rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .plus-loin {
    background: var(--carte);
    border: 1px solid var(--filet);
    color: var(--encre);
  }
  .rapport:focus-visible,
  .plus-loin:focus-visible,
  .onglet:focus-visible {
    outline: 2px solid var(--sable-encre);
    outline-offset: 2px;
  }
  .feuillet {
    width: 1.25rem;
    height: 1.5rem;
    flex: none;
  }
  .livre {
    width: 1.65rem;
    height: 1.4rem;
    flex: none;
  }
  .fleche {
    margin-left: auto;
    font-size: 1.4rem;
    line-height: 1;
    opacity: 0.8;
  }

  .source {
    margin: 1.2rem 0 0;
    text-align: center;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    color: var(--encre-douce);
  }

  /* ── Onglets ─────────────────────────────────────────────────────── */
  .onglets {
    display: flex;
    gap: 0.2rem;
    margin-top: 1.25rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--filet);
  }
  .onglet {
    flex: 1;
    min-height: 3.4rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.28rem;
    padding: 0.35rem 0.2rem;
    background: none;
    border: 0;
    border-radius: 0.6rem;
    font: inherit;
    font-size: 0.76rem;
    color: var(--encre-douce);
    cursor: pointer;
  }
  .onglet svg {
    width: 1.45rem;
    height: 1.45rem;
  }
  .onglet.actuel {
    color: var(--encre);
    font-weight: 600;
    cursor: default;
  }

  @media (min-width: 26rem) {
    .ecran {
      padding: 1.6rem 1.25rem 2rem;
    }
    .verdict {
      font-size: 1.9rem;
    }
  }
</style>
