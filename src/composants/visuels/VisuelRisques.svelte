<script lang="ts">
  /**
   * Le visuel de l'état des risques : une coupe de terrain, et le cadran du
   * potentiel radon.
   *
   * ── Pourquoi une coupe de terrain, et pas une liste ─────────────────────────
   *
   * L'ERP est le seul diagnostic qui ne parle pas du bâtiment. Il parle de ce
   * qu'il y a SOUS le bâtiment et autour. Le lecteur, lui, croit presque
   * toujours qu'on est venu mesurer quelque chose chez lui. Une coupe de terrain
   * lève ce malentendu avant la première phrase : la maison est posée sur des
   * couches, et chaque risque vient d'une profondeur. L'eau arrive par la
   * surface, l'argile travaille dans le sol meuble, le radon remonte de la
   * roche, la secousse vient du socle.
   *
   * ── Ce que la maquette donne, et ce qu'on ne pouvait pas recopier ───────────
   *
   * La maquette légende ses cinq bandes « 0 – 0,5 m · terre végétale »,
   * « 0,5 – 3 m · argile sableuse », « 3 – 12 m · calcaire »… Ces profondeurs et
   * ces natures de sol décrivent un bien fictif : aucun état des risques ne les
   * contient, et le moteur ne peut donc ni les lire ni les vérifier. Les écrire
   * quand même reviendrait à affirmer la géologie du terrain de quelqu'un sans
   * l'avoir lue — exactement ce que ce produit s'interdit.
   *
   * La forme est conservée telle quelle : bandeau du logement, cinq bandes,
   * leurs hauteurs, leurs couleurs, gras à gauche / petit à droite. Les NOMS DE
   * COUCHE de la maquette sont gardés mot pour mot (Surface, Sol meuble,
   * Substrat, Roche mère) — ce sont des mots de géologie générale, pas des
   * affirmations sur cette parcelle. Seuls les chiffres de profondeur et les
   * natures de sol tombent, et le slot qu'ils occupaient reçoit ce que le
   * rapport porte VRAIMENT : le risque qui vient de cette profondeur-là.
   *
   * Conséquence directe : une bande dont le moteur n'a rien lu affiche « non
   * lu », jamais un état rassurant. Les cases du formulaire ERP sont des
   * images ; seules les phrases rédigées sont lues. Ne rien avoir lu n'est pas
   * une bonne nouvelle, c'est une absence — et elle se dit.
   *
   * ── Le cadran : ce que l'ERP donne réellement ───────────────────────────────
   *
   * La maquette dessine un cadran de CONCENTRATION, aiguille sur « 45 Bq/m³ ».
   * Or un état des risques ne mesure pas le radon. Il donne le potentiel radon
   * de la COMMUNE — zone 1, 2 ou 3. Un cadran de concentration serait donc, pour
   * la totalité des dossiers, un cadran sans aiguille.
   *
   * Le cadran garde exactement la géométrie de la maquette — trois arcs de rayon
   * 46 centrés en (60,62), stroke 9, linecap round, aiguille, moyeu, rangée de
   * graduations en bas — et ses trois segments deviennent les trois zones. Trois
   * arcs, trois zones : le dessin n'a pas bougé, il pointe enfin quelque chose
   * que le rapport dit.
   *
   * Le seul chiffre réglementaire du sujet, 300 Bq/m³ (niveau de référence en
   * moyenne annuelle dans les immeubles bâtis, code de la santé publique,
   * article R. 1333-28), n'est pas gradué sur le cadran : il ne s'applique pas à
   * un zonage communal. Il est écrit en note, là où il a un sens, et il ne
   * s'affiche en comparaison que si une vraie mesure est fournie.
   *
   * À FAIRE avant mise en ligne : cette référence doit être consignée dans
   * src/lib/reglement/textes.ts avec sa date de lecture sur Légifrance, comme
   * tout le reste du droit du produit. Elle n'y est pas encore.
   */
  import type { Schema } from '../../lib/modele';
  import Maison from '../schemas/briques/Maison.svelte';

  /** Ce que le moteur sait dire d'un risque. Repris du modèle pour ne pas dériver. */
  type RisqueLu = Extract<Schema, { genre: 'risques' }>['risques'][number];

  const {
    risques,
    becquerels = null
  }: {
    /**
     * Les risques lus dans l'état des risques (`schema.risques`). `null` quand
     * le moteur n'a rien reconnu du tout — ce n'est pas « aucun risque ».
     */
    risques: RisqueLu[] | null;
    /**
     * Concentration mesurée, en Bq/m³. Presque toujours `null` : un ERP ne
     * contient pas de mesure. Seul un rapport de mesurage radon en donne une, et
     * le produit ne sait pas encore le lire.
     */
    becquerels?: number | null;
  } = $props();

  interface Couche {
    /** Le risque qui vient de cette profondeur — c'est lui qu'on lit en gras. */
    sujet: string;
    /** Le nom de la couche, repris mot pour mot de la maquette. */
    couche: string;
    /** Comment retrouver ce risque parmi ceux que le moteur a lus. */
    motif: RegExp;
    /** Les teintes de la maquette, relevées une à une. */
    fond: string;
    encre: string;
  }

  /**
   * Les cinq bandes, de la surface au socle.
   *
   * Le quatrième fond passe du #78909C de la maquette au #546E7A : le blanc n'y
   * tenait que 3,35, il tient 5,42 ici. Même famille de gris ardoise, même place
   * dans le dégradé de profondeur.
   *
   * Cinquième nom : la maquette écrit « Profondeur », qui ne veut rien dire une
   * fois « > 40 m » retiré. On garde le mot que la maquette emploie juste à
   * côté, dans sa propre légende : « socle ».
   */
  const COUCHES: Couche[] = [
    {
      sujet: 'Inondation',
      couche: 'Surface',
      motif: /inondation|submersion/i,
      fond: '#a5d6a7',
      encre: '#1b5e20'
    },
    {
      sujet: 'Retrait-gonflement des argiles',
      couche: 'Sol meuble',
      motif: /argile|retrait|gonflement/i,
      fond: '#d7ccc8',
      encre: '#4e342e'
    },
    {
      sujet: 'Pollution des sols',
      couche: 'Substrat',
      motif: /pollution/i,
      fond: '#b0bec5',
      encre: '#263238'
    },
    {
      sujet: 'Radon',
      couche: 'Roche mère',
      motif: /radon/i,
      fond: '#546e7a',
      encre: '#ffffff'
    },
    {
      sujet: 'Sismicité',
      couche: 'Socle',
      motif: /sismi|s[ée]isme/i,
      fond: '#455a64',
      encre: '#ffffff'
    }
  ];

  interface Bande extends Couche {
    /** Ce que le rapport dit de ce risque, ou `null` s'il n'a pas été lu. */
    risque: RisqueLu | null;
  }

  const bandes: Bande[] = $derived(
    COUCHES.map((c) => ({ ...c, risque: risques?.find((r) => c.motif.test(r.nom)) ?? null }))
  );

  /**
   * Les risques lus qui ne viennent pas du sol — technologique, bruit, sinistre
   * indemnisé. Ils ne peuvent pas entrer dans la coupe, et les taire reviendrait
   * à cacher ce que le rapport signale.
   */
  const autour: RisqueLu[] = $derived(
    (risques ?? []).filter((r) => !COUCHES.some((c) => c.motif.test(r.nom)))
  );

  const radon: RisqueLu | null = $derived(risques?.find((r) => /radon/i.test(r.nom)) ?? null);

  /**
   * La zone de la commune, telle que le moteur la restitue aujourd'hui : le
   * détecteur négatif ne se déclenche que sur « potentiel radon niveau 1 », et
   * le positif range le chiffre 2 ou 3 dans `detail` (« niveau 2 »).
   *
   * Contrat fragile — il passe par une chaîne de caractères. S'il casse, la
   * ligne retombe sur « non lu », jamais sur une zone fausse.
   */
  const zoneRadon: 1 | 2 | 3 | null = $derived.by(() => {
    if (!radon) return null;
    if (radon.niveau === 'bon') return 1;
    const chiffre = radon.detail?.match(/[23]/)?.[0];
    if (chiffre === '3') return 3;
    if (chiffre === '2') return 2;
    return null;
  });

  /** Les définitions de l'article R. 1333-29, dans leurs termes. */
  const ZONES: Record<1 | 2 | 3, string> = {
    1: 'potentiel radon faible',
    2: 'potentiel radon faible, mais des facteurs géologiques particuliers peuvent faciliter le transfert du radon vers les bâtiments',
    3: 'potentiel radon significatif'
  };

  /** Le centre de chaque tiers du demi-cadran. Aucune interpolation : trois crans. */
  const ANGLES: Record<1 | 2 | 3, number> = { 1: -60, 2: 0, 3: 60 };

  /*
   * Tout ce que le gabarit affiche est calculé ici, jamais dans le balisage.
   * C'est ce qui garantit qu'aucune branche ne peut afficher `null` par erreur,
   * et ça évite de faire dépendre la compilation du rétrécissement de type dans
   * les blocs {#if}.
   */
  const zoneTexte: string | null = $derived(zoneRadon === null ? null : `Zone ${zoneRadon}`);
  const zoneSens: string | null = $derived(zoneRadon === null ? null : ZONES[zoneRadon]);
  const tour: string | null = $derived(
    zoneRadon === null ? null : `rotate(${ANGLES[zoneRadon]}deg)`
  );

  /** La mesure, si tant est qu'on en ait une. Jamais reconstituée, jamais arrondie. */
  const mesureTexte: string | null = $derived(
    becquerels === null ? null : `${becquerels.toLocaleString('fr-FR')} Bq/m³`
  );
  const auDessus: boolean = $derived(becquerels !== null && becquerels > 300);
</script>

<div class="visuel">
  <!-- ── La coupe du terrain ──────────────────────────────────────────────── -->
  <section class="carte">
    <h4 class="etiquette">Coupe du terrain</h4>

    <div class="cut">
      <div class="ciel">
        <svg class="logement" viewBox="0 0 96 44" aria-hidden="true">
          <Maison x={32} y={14} l={32} cheminee porte />
        </svg>
        <span class="ici">Le logement</span>
      </div>

      <ul class="couches">
        {#each bandes as bande, i (bande.sujet)}
          <li
            class="strate"
            style:--bande-fond={bande.fond}
            style:--bande-encre={bande.encre}
            style:--k={i}
          >
            <span class="quoi">
              <b>{bande.sujet}</b>
              <span class="ou">{bande.couche}</span>
            </span>

            {#if bande.risque === null}
              <span class="etat">non lu</span>
            {:else if bande.risque.niveau === 'bon'}
              <span class="etat">non concerné</span>
            {:else}
              <span class="marque" class:grave={bande.risque.niveau === 'alerte'}>
                {bande.risque.detail ? `signalé · ${bande.risque.detail}` : 'signalé'}
              </span>
            {/if}
          </li>
        {/each}
      </ul>
    </div>

    {#if autour.length}
      <!-- Ce qui ne vient pas du sol mais figure quand même au rapport. -->
      <h5 class="sous-etiquette">Autour du bien</h5>
      <ul class="autour">
        {#each autour as risque (risque.nom)}
          <li>
            <span
              class="pastille"
              class:grave={risque.niveau === 'alerte'}
              class:calme={risque.niveau === 'bon'}
              aria-hidden="true"
            ></span>
            <span>
              {risque.nom} — {risque.niveau === 'bon' ? 'non concerné' : 'signalé'}
            </span>
          </li>
        {/each}
      </ul>
    {/if}

    <p class="legende muet petit">
      {#if risques === null}
        Aucune ligne de risque n’a pu être lue dans ce rapport. Les couches restent
        affichées pour montrer d’où viennent les risques d’un terrain — pas pour dire ce
        qu’il en est du vôtre. Reportez-vous au tableau de votre état des risques, et
        vérifiez votre adresse sur Géorisques.
      {:else}
        Ce document ne mesure rien chez vous : il recopie ce que les cartes officielles
        disent de cette adresse. Et nous n’en lisons qu’une partie — la liste complète est
        dans le tableau de votre état des risques.
      {/if}
    </p>
  </section>

  <!-- ── Le cadran du radon ───────────────────────────────────────────────── -->
  <section class="carte">
    <h4 class="etiquette">Potentiel radon de la commune</h4>

    <div class="jauge">
      <svg class="cadran" viewBox="0 0 120 80" aria-hidden="true">
        <path d="M14 62 A46 46 0 0 1 42 19" class="arc zone1" />
        <path d="M46 17 A46 46 0 0 1 74 17" class="arc zone2" />
        <path d="M78 19 A46 46 0 0 1 106 62" class="arc zone3" />

        {#if tour}
          <g class="aiguille" style:transform={tour}>
            <line x1="60" y1="62" x2="60" y2="28" />
          </g>
          <circle cx="60" cy="62" r="6" class="moyeu" />
        {:else}
          <!-- Rien de lu, pas d'aiguille. Le moyeu reste creux : le cadran montre
               l'échelle, il ne prétend pas pointer quelque chose. -->
          <circle cx="60" cy="62" r="6" class="moyeu creux" />
        {/if}

        <text x="20" y="76" class="cran">1</text>
        <text x="60" y="76" class="cran">2</text>
        <text x="100" y="76" class="cran">3</text>
      </svg>

      <div class="lecture">
        {#if zoneTexte && zoneSens}
          <p class="valeur">{zoneTexte}</p>
          <p class="unite">{zoneSens}</p>
        {:else}
          <p class="valeur absente">Non lu</p>
          <p class="unite">le potentiel radon de la commune n’a pas été lu dans ce rapport</p>
        {/if}

        {#if mesureTexte}
          <p class="mesure">Mesure au dossier : <strong>{mesureTexte}</strong></p>
          {#if auDessus}
            <p class="au-dela">Au-dessus du niveau de référence de 300 Bq/m³.</p>
          {/if}
        {/if}
      </div>
    </div>

    <p class="note">
      Ce classement porte sur la <strong>commune</strong>, pas sur votre logement : il dit
      ce que le sous-sol de la région peut produire, pas ce qu’il y a chez vous. Seule une
      mesure sur place, posée plusieurs mois pendant la période de chauffe, donne la
      concentration réelle d’un logement.
    </p>
    <p class="note">
      Le niveau de référence est de <strong>300 Bq/m³</strong> en moyenne annuelle dans les
      immeubles bâtis (code de la santé publique, article R. 1333-28). En dessous, rien
      n’est demandé. Au-dessus, on agit sur la ventilation et sur l’étanchéité du bas du
      bâtiment.
    </p>
  </section>
</div>

<style>
  .visuel {
    display: grid;
    gap: var(--e3);
    margin: 0 0 var(--e4);
  }

  .carte {
    background: var(--papier);
    border: 1px solid var(--trait);
    border-radius: var(--rayon-large);
    padding: var(--e4);
    box-shadow: var(--ombre);
  }

  .etiquette,
  .sous-etiquette {
    margin: 0 0 var(--e3);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    /* La maquette met ce libellé en #9AB5B2 : 2,02 sur le blanc de la carte. */
    color: var(--sur-fond-doux);
  }

  .sous-etiquette {
    margin: var(--e4) 0 var(--e2);
  }

  /* ---- La coupe ---------------------------------------------------------- */

  .cut {
    border-radius: var(--rayon);
    overflow: hidden;
    border: 1px solid var(--trait);
  }

  /*
   * Le ciel et le logement.
   *
   * Les deux teintes sont celles de la maquette. `--or` est posé ici en dur
   * parce que c'est le jeton avec lequel la brique Maison trace son toit : hors
   * de l'univers ERP il vaut l'accent de l'univers, qui ne tient que 2,27 sur
   * ce dégradé. Dans l'univers, c'est exactement la valeur qu'il a déjà.
   */
  .ciel {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--e2);
    min-height: 52px;
    background: linear-gradient(180deg, #e0f7fa, #d3eceb);
    /* L'encre de l'univers, qui suit le fond : ce vert fixe tombait a 1,3
       sur les fonds sombres. */
    color: var(--sur-fond);
    --or: #00796b;
    animation: ciel-entre 0.5s var(--courbe);
  }

  .logement {
    width: 64px;
    height: auto;
  }

  /* Le ciel est une surface claire posee au milieu d'un ecran sombre : le texte
     pose dessus doit changer d'encre, sinon il herite de celle de l'univers --
     mesure a 1,09 de contraste, soit invisible. */
  .ici {
    font-size: var(--t-micro);
    font-weight: 600;
    color: var(--encre-sur-clair);
  }

  .couches {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /*
   * Une bande = une profondeur = un risque.
   *
   * Les deux variables sont préfixées : `--fond` et `--encre` sont des jetons du
   * design system, redéfinis par l'univers dans `.dedans`. Les écraser ici les
   * casserait pour tout composant enfant.
   *
   * Hauteur de la maquette (37 px) en plancher et non en plafond : sur un écran
   * étroit le libellé passe à la ligne plutôt que de se faire couper.
   */
  .strate {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--e2);
    min-height: 38px;
    padding: 6px var(--e3);
    background: var(--bande-fond);
    color: var(--bande-encre);

    /*
     * L'entrée en cascade, sans `animation-delay`.
     *
     * Un délai laisse l'élément à son état de départ pendant l'attente ; et avec
     * `fill-mode`, une animation qui ne démarre jamais fige le contenu
     * invisible. Ici toutes les bandes partent ensemble et se posent l'une après
     * l'autre parce que leur durée croît avec la profondeur. Aucun état de repli
     * à retenir : l'état final est l'état naturel.
     */
    animation: strate-entre calc(420ms + var(--k) * 90ms) var(--courbe);
  }

  .quoi {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 2px 8px;
    min-width: 0;
  }

  .quoi b {
    font-size: 12.5px;
    font-weight: 700;
  }

  /*
   * Le petit texte de droite de la maquette porte `opacity: .72`. Supprimée :
   * elle ferait tomber quatre des cinq couples encre/fond sous le seuil. Le
   * texte garde l'encre pleine et se distingue par la graisse et la taille.
   */
  .ou,
  .etat {
    font-size: var(--t-micro);
    font-weight: 500;
  }

  .etat {
    flex: none;
    white-space: nowrap;
  }

  /*
   * Un risque signalé porte la couleur d'état du produit, jamais celle de
   * l'univers ni celle de la bande : le fond blanc de la pastille la détache des
   * bandes sombres (5,42 et 7,18), son filet la détache des bandes claires
   * (3,10 au pire).
   */
  .marque {
    flex: none;
    padding: 3px 8px;
    border: 1.5px solid currentcolor;
    border-radius: var(--rayon-petit);
    background: var(--papier);
    color: var(--attention);
    font-size: var(--t-micro);
    font-weight: 700;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }

  .marque.grave {
    color: var(--alerte);
  }

  /* ---- Ce qui ne vient pas du sol ---------------------------------------- */

  .autour {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--e2);
  }

  .autour li {
    display: flex;
    align-items: baseline;
    gap: var(--e2);
    font-size: var(--t-petit);
    color: var(--sur-fond);
  }

  /* La pastille ne dit rien à elle seule : l'état est écrit à côté. */
  .pastille {
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--attention);
  }

  .pastille.grave {
    background: var(--alerte);
  }

  .pastille.calme {
    background: var(--ok);
  }

  .legende {
    margin: var(--e3) 0 0;
    line-height: 1.55;
  }

  /* ---- Le cadran --------------------------------------------------------- */

  .jauge {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--e4);
  }

  .cadran {
    flex: none;
    /* Plancher à 148 px : en dessous, les graduations passeraient sous 11 px. */
    width: clamp(148px, 42%, 176px);
    height: auto;
  }

  .arc {
    fill: none;
    stroke-width: 9;
    stroke-linecap: round;
  }

  /*
   * Les trois teintes de la maquette (#66BB6A, #FFD54F, #EF5350) donnent 2,36,
   * 1,41 et 3,49 sur le blanc de la carte : la jaune est purement et simplement
   * invisible. Assombries dans la même famille, elles tiennent 5,13, 5,28 et
   * 5,63. C'est la pratique déjà écrite dans univers.ts.
   */
  .arc.zone1 {
    stroke: #2e7d32;
  }

  .arc.zone2 {
    stroke: #a05a00;
  }

  .arc.zone3 {
    stroke: #c62828;
  }

  /*
   * L'aiguille se pose à son angle par un style en ligne, et l'animation ne fait
   * que l'y conduire depuis la butée gauche. Pas de `fill-mode`, donc : si
   * l'animation ne tourne pas, l'aiguille est quand même au bon endroit — le
   * `to` implicite d'une animation, c'est la valeur déclarée de l'élément.
   */
  .aiguille {
    transform-origin: 60px 62px;
    animation: balayage 1.9s cubic-bezier(0.34, 1.3, 0.64, 1);
  }

  .aiguille line {
    stroke: var(--sur-fond);
    stroke-width: 3.5;
    stroke-linecap: round;
  }

  .moyeu {
    fill: var(--sur-fond);
  }

  .moyeu.creux {
    fill: var(--papier);
    stroke: var(--sur-fond);
    stroke-width: 2;
    stroke-dasharray: 3 3;
  }

  .cran {
    font-size: 9px;
    font-weight: 700;
    text-anchor: middle;
    /* #9AB5B2 dans la maquette : 2,02 sur blanc. */
    fill: var(--sur-fond-doux);
  }

  .lecture {
    flex: 1 1 170px;
    min-width: 0;
  }

  .valeur {
    margin: 0;
    font-size: 33px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--sur-fond);
    font-variant-numeric: tabular-nums;
  }

  /* « Non lu » n'est pas une donnée : il ne prend pas la taille d'une donnée. */
  .valeur.absente {
    font-size: var(--t-lead);
    font-weight: 700;
    letter-spacing: 0;
  }

  .unite {
    margin: 4px 0 0;
    font-size: var(--t-micro);
    font-weight: 600;
    line-height: 1.45;
    color: var(--sur-fond-doux);
  }

  .mesure {
    margin: var(--e2) 0 0;
    font-size: var(--t-petit);
    line-height: 1.5;
    color: var(--sur-fond);
  }

  .au-dela {
    margin: var(--e1) 0 0;
    font-size: var(--t-petit);
    font-weight: 700;
    color: var(--alerte);
  }

  .note {
    margin: var(--e3) 0 0;
    font-size: var(--t-petit);
    line-height: 1.6;
    color: var(--sur-fond-doux);
  }

  .note strong,
  .mesure strong {
    color: var(--sur-fond);
  }

  /* ---- Le mouvement ------------------------------------------------------ */

  @keyframes ciel-entre {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
  }

  @keyframes strate-entre {
    from {
      opacity: 0;
      transform: translateX(-18px);
    }
  }

  @keyframes balayage {
    from {
      transform: rotate(-90deg);
    }
  }

  /*
   * Svelte n'applique rien de tout seul : les règles globales de app.css ne
   * couvrent pas ce qu'on écrit à la main ici. Aucune de ces animations ne porte
   * d'information — les couper ne retire rien.
   */
  @media (prefers-reduced-motion: reduce) {
    .ciel,
    .strate,
    .aiguille {
      animation: none;
    }
  }
</style>
