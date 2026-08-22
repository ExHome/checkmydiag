<script lang="ts" module>
  /* Les identifiants SVG sont uniques dans le document. Un compteur de module,
     comme dans `TableLumineuse.svelte` : déterministe, donc comparable d'un
     rendu à l'autre en test comme en capture d'écran. */
  let sequence = 0;
</script>

<script lang="ts">
  /**
   * LE CÂBLE — le schéma de l'écran électricité.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * L'INVERSION, APPLIQUÉE À UN CIRCUIT
   * ═══════════════════════════════════════════════════════════════════════
   *
   * `calque.ts` décrit deux polarités. Le plan d'un logement est en polarité
   * `encre` : les murs arrêtent la lumière. Un circuit est en polarité `trait` :
   * « rien ne passe, le dessin est la seule ouverture ». C'est cette
   * seconde-là, et elle n'avait jamais été employée.
   *
   * Conséquence, et c'est tout l'écran : LE CÂBLE N'EST PAS PEINT. Il n'existe
   * nulle part comme un trait de couleur. Le plateau est une bakélite presque
   * noire, un rectangle de lumière cuivrée est posé dessus, et un masque ne
   * laisse voir de cette lumière que la forme du câble. Ce qu'on prend pour du
   * cuivre est un endroit où la source passe.
   *
   * D'où la lecture des anomalies, qui n'a plus besoin d'aucune couleur :
   *
   *   LE MAILLON EST ALLUMÉ        le rapport a regardé, il n'a rien relevé
   *   LE MAILLON EST UN TROU       le rapport relève une anomalie ici
   *   LE MAILLON EST EN RAIES      le rapport n'a PAS pu vérifier ce point
   *
   * Une zone non contrôlée ne PEUT PAS être affichée comme saine : elle n'a
   * pas le même masque. Et la distinction est une TEXTURE, pas une teinte —
   * elle survit au daltonisme, au noir et blanc, à l'impression.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * LES RAIES DES PARCOURS, ET CE QU'ELLES DISENT VRAIMENT
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Les maillons sont pleins ; LES TRAJETS ENTRE EUX SONT EN RAIES, toujours,
   * même sur un dossier parfait. Ce n'est pas un ornement : c'est la phrase que
   * l'arrêté du 28 septembre 2017 oblige le rapport à imprimer, et que
   * `analyse/securite.ts` reprend dans son explication — « tout ce qui est noyé
   * dans les murs, caché derrière un meuble, ou logé dans une boîte de
   * connexion, une goulotte, une plinthe ou une huisserie échappe au contrôle ».
   *
   * Autrement dit : ON CONTRÔLE DES POINTS, PAS DES TRAJETS. Le dessin le dit
   * sans une ligne de texte, et il le dit aussi — surtout — sur les 42 dossiers
   * sur 56 où il n'y a aucune anomalie. C'est ce qui empêche l'écran nominal
   * d'être un certificat de bonne santé.
   *
   * Le rythme des raies n'est pas choisi : `LARGEUR_HACHURE` sur `PAS_HACHURE`,
   * les deux constantes de `calque.ts`. Même langage que le reste du produit.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * LA BRAISE
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Le seul endroit du produit où le terracotta est justifié, et il l'est
   * physiquement : un conducteur interrompu, ce sont deux bouts de cuivre qui
   * chauffent. La braise ne clignote pas, ne pulse pas, ne déborde pas du
   * plateau. Elle est petite, tenue à l'intérieur du trou, et elle ne porte
   * jamais de texte — sa luminance tombe au milieu de la bande morte de
   * `contraste.ts`, où aucune encre de la marque ne tient 4,5.
   */
  import type { Gravite } from '../../lib/modele';
  import { LARGEUR_HACHURE, PAS_HACHURE } from '../lumiere/calque';
  import { lumiereDe, teinteDe } from '../lumiere/heure';
  import { retraitDe } from '../lumiere/gravite';
  import {
    BOITIER,
    D_DETACHE,
    D_PARCOURS,
    D_RESEAU,
    D_TERRE,
    ENTAILLE_BOITIER,
    HAUTEUR,
    LARGEUR,
    LONGUEUR,
    RAYON_COUPURE,
    RAYON_MAILLON,
    STATIONS,
    foyer,
    type Maillon
  } from './parcours';
  import { BRIDE_CUIVRE, filDe, type PointCable } from './lecture';

  interface Props {
    /** Les anomalies lues, déjà rangées par mécanisme. */
    points: PointCable[];
    /** Les maillons contrôlés mais non essayés. */
    nonVerifies: Maillon[];
    /** `brouillee` : on sait qu'il se passe quelque chose, pas où. */
    chaine: 'lisible' | 'brouillee';
    gravite: Gravite;
    /** Heure décimale. Le cuivre est bridé à 3000 K quoi qu'elle vaille. */
    heure: number;
    /** Où en est la tête de lumière, en unités de parcours. 0 = au repos. */
    tete: number;
    /** Durée du trajet en cours, en ms. Calculée à vitesse constante. */
    duree: number;
    /** Le maillon désigné par la tête, s'il y en a un. */
    courant: Maillon | null;
    /** Ce que le dessin montre, pour qui ne le voit pas. Obligatoire. */
    resume: string;
  }

  const { points, nonVerifies, chaine, gravite, heure, tete, duree, courant, resume }: Props =
    $props();

  const id = `cb${++sequence}`;

  const l = $derived(lumiereDe(heure));
  const etat = $derived(retraitDe(gravite, l.intensite));
  const cuivre = $derived(teinteDe(Math.min(l.temperature, BRIDE_CUIVRE)));
  const fil = $derived(filDe(l.intensite, etat.facteurLumiere, l.azimut));
  /* La tête est la SOURCE vue en face, pas une surface qu'elle éclaire : elle
     est donc plus chaude que ce qu'elle allume. 4500 K est un ancrage de la
     rampe — aucune couleur nouvelle. */
  const braiseChaude = teinteDe(4500);

  /** Le rythme des raies, repris de `calque.ts` sans le réinventer. */
  const RAIES = `${LARGEUR_HACHURE} ${PAS_HACHURE - LARGEUR_HACHURE}`;

  /** Longueur de la tête de lumière, en unités de parcours. */
  const TETE = 16;

  /*
   * LE BORD DU DÉGRADÉ, ET POURQUOI IL N'EST PAS PLUS SOMBRE.
   *
   * La source est plus forte du côté d'où vient le jour, et plus faible aux
   * deux bords. Mais le fil DOIT tenir 3:1 sur toute sa longueur : c'est lui
   * qui porte l'information, un maillon qu'on ne distingue plus n'est plus un
   * maillon.
   *
   * Le pire cas n'est pas celui qu'on croit : c'est L'AUBE, pas la nuit. À 7 h
   * la source est faible ET sa teinte est la plus sombre de la rampe (#d98a3f,
   * 2000 K) ; à minuit elle est faible mais posée à 2700 K. Le bord y descend
   * à 3,40:1 — mesuré sur les seize scènes, jamais estimé. La lumière varie
   * donc, mais dans une plage bornée par la lisibilité, jamais par le goût.
   */
  const BORD_SOURCE = 0.88;

  /* Plusieurs anomalies peuvent tomber sur le même maillon : c'est un trou, pas
     deux. On dédoublonne, sinon deux disques noirs se superposent et la braise
     se peint deux fois — plus dense au même endroit, ce qui se lirait comme
     « plus grave ». Il n'existe aucune gravité par anomalie : rien ne doit
     pouvoir le suggérer. */
  const coupes = $derived([
    ...new Set(
      points.filter((p) => p.maillon !== null && !p.boitier).map((p) => p.maillon as Maillon)
    )
  ]);
  const boitierPerce = $derived(points.some((p) => p.boitier));
  const detache = $derived(points.some((p) => p.maillon === null));

  const foyers = $derived([
    ...coupes.map((m) => foyer(m, false)),
    ...(boitierPerce ? [foyer('materiel', true)] : []),
    ...(detache ? [foyer(null, false)] : [])
  ]);

  function traitDe(cle: Maillon): string {
    if (chaine === 'brouillee') return RAIES;
    return nonVerifies.includes(cle) ? RAIES : 'none';
  }
</script>

<figure
  class="cable"
  style:--cb-sol={etat.sol}
  style:--cb-duree="{duree}ms"
  style:aspect-ratio="{LARGEUR} / {HAUTEUR}"
>
  <svg
    class="cable__plateau"
    viewBox="0 0 {LARGEUR} {HAUTEUR}"
    preserveAspectRatio="none"
    role="img"
    aria-label={resume}
  >
    <defs>
      <!-- LA SOURCE. Un seul dégradé, dont le point fort suit l'azimut : la
           lumière entre par la gauche le matin, par la droite le soir. Ce n'est
           pas une décoration, c'est ce qui fait qu'on ne voit jamais deux fois
           le même écran. -->
      <linearGradient
        id="{id}-source"
        x1="0"
        y1="0"
        x2={LARGEUR}
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color={cuivre} stop-opacity={fil.alpha * BORD_SOURCE} />
        <stop offset={fil.centre} stop-color={cuivre} stop-opacity={fil.alpha} />
        <stop offset="1" stop-color={cuivre} stop-opacity={fil.alpha * BORD_SOURCE} />
      </linearGradient>

      <radialGradient id="{id}-halo">
        <stop offset="0" stop-color={cuivre} stop-opacity={fil.halo} />
        <stop offset="1" stop-color={cuivre} stop-opacity="0" />
      </radialGradient>

      <radialGradient id="{id}-braise">
        <!-- Le cœur est OPAQUE. À alpha réduit, la braise tombe sous 3:1 et
             cesse d'être un élément graphique lisible ; pleine, elle tient 3,58
             sur le sol clair et 4,21 sur le sol le plus sombre. -->
        <stop offset="0" stop-color="var(--tison)" stop-opacity="1" />
        <stop offset="0.42" stop-color="var(--tison)" stop-opacity="0.55" />
        <stop offset="1" stop-color="var(--tison)" stop-opacity="0" />
      </radialGradient>

      <mask
        id="{id}-passe"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width={LARGEUR}
        height={HAUTEUR}
      >
        <!-- Polarité `trait` : rien ne passe, le dessin est la seule ouverture. -->
        <rect width={LARGEUR} height={HAUTEUR} fill="#000" />

        <g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">
          <!-- Les trajets. En raies, toujours : on contrôle des points. -->
          <path d={D_RESEAU} stroke-width="1.15" stroke-dasharray={RAIES} />
          <!-- Le symbole de terre et le boîtier : des équipements, donc pleins. -->
          <path
            d={D_TERRE}
            stroke-width="1.15"
            stroke-dasharray={chaine === 'brouillee' ? RAIES : 'none'}
          />
          <rect
            x={BOITIER.x}
            y={BOITIER.y}
            width={BOITIER.largeur}
            height={BOITIER.hauteur}
            rx={BOITIER.rayon}
            stroke-width="1.15"
            stroke-dasharray={chaine === 'brouillee' ? RAIES : 'none'}
          />

          {#each STATIONS as s (s.cle)}
            <circle
              cx={s.x}
              cy={s.y}
              r={RAYON_MAILLON}
              stroke-width="1.35"
              stroke-dasharray={traitDe(s.cle)}
            />
          {/each}

          {#if detache}
            <path d={D_DETACHE} stroke-width="1" stroke-dasharray={RAIES} />
          {/if}

          <!-- Le doigt qui montre. UN SEUL à la fois : deux étiquettes sur un
               plateau de 390 px se chevauchent, et la lumière ne désigne
               qu'une chose. -->
          {#if courant}
            {@const s = STATIONS.find((x) => x.cle === courant)}
            {#if s}
              <path
                d="M{s.x - 2.2} {s.y - 6.4} L{s.x + 2.2} {s.y - 6.4} L{s.x} {s.y - 3.4} Z"
                fill="#fff"
                stroke="none"
              />
            {/if}
          {/if}
        </g>

        <!-- LES INTERRUPTIONS. La lumière ne passe pas : le maillon disparaît. -->
        {#each coupes as m (m)}
          {@const f = foyer(m, false)}
          <circle cx={f.x} cy={f.y} r={RAYON_COUPURE} fill="#000" />
        {/each}
        {#if boitierPerce}
          <rect
            x={ENTAILLE_BOITIER.x}
            y={ENTAILLE_BOITIER.y}
            width={ENTAILLE_BOITIER.largeur}
            height={ENTAILLE_BOITIER.hauteur}
            fill="#000"
          />
        {/if}
      </mask>
    </defs>

    <!-- L0 · LA BAKÉLITE. Ce qu'on voit là où la lumière n'arrive pas. -->
    <rect width={LARGEUR} height={HAUTEUR} fill="var(--cb-sol)" />

    <!-- L1 · le halo des maillons allumés, SOUS le masque : une lumière qui
         diffuse dans la matière du plateau avant d'atteindre le fil. -->
    {#each STATIONS as s (s.cle)}
      {#if !coupes.includes(s.cle)}
        <circle cx={s.x} cy={s.y} r="7" fill="url(#{id}-halo)" />
      {/if}
    {/each}

    <!-- L2 · LA LUMIÈRE, découpée par la forme du câble. Le cuivre est ici, et
         nulle part ailleurs : aucun trait n'est peint. -->
    <g mask="url(#{id}-passe)">
      <rect width={LARGEUR} height={HAUTEUR} fill="url(#{id}-source)" />
    </g>

    <!-- L3 · LA BRAISE, aux interruptions. Peinte, elle : ce n'est pas le
         dessin, c'est ce qui arrive au dessin. -->
    {#each foyers as f, i (i)}
      <circle class="cable__braise" cx={f.x} cy={f.y} r="4.6" fill="url(#{id}-braise)" />
    {/each}

    <!-- L4 · LA TÊTE. Elle passe DANS les raies : la lumière traverse même ce
         que le contrôle n'a pas regardé, et s'arrête net à l'interruption. -->
    <g class="cable__tete" class:cable__tete--allumee={tete > 0}>
      <path
        class="cable__tete-diffuse"
        d={D_PARCOURS}
        pathLength={LONGUEUR}
        fill="none"
        stroke={cuivre}
        stroke-width="3.6"
        stroke-linecap="round"
        stroke-opacity="0.26"
        stroke-dasharray="{TETE} {LONGUEUR}"
        style:stroke-dashoffset={(TETE - tete).toFixed(2)}
      />
      <path
        class="cable__tete-ame"
        d={D_PARCOURS}
        pathLength={LONGUEUR}
        fill="none"
        stroke={braiseChaude}
        stroke-width="1.15"
        stroke-linecap="round"
        stroke-opacity="0.95"
        stroke-dasharray="{TETE * 0.45} {LONGUEUR}"
        style:stroke-dashoffset={(TETE * 0.45 - tete).toFixed(2)}
      />
    </g>
  </svg>
</figure>

<style>
  .cable {
    position: relative;
    display: block;
    margin: 0;
    width: 100%;
    background: var(--cb-sol);
    /*
     * AUCUNE TRANSITION SUR `background`, ET CE N'EST PAS UN OUBLI.
     *
     * Elle lit `var(--cb-sol)`, un jeton non déclaré que le composant repose à
     * chaque rendu. Transitionnée, la propriété se figerait sur sa valeur de
     * PREMIER rendu et la bakélite ne s'assombrirait jamais avec la gravité —
     * le défaut mesuré au banc le 21/08, démontré dans `app.css`. Ces jetons se
     * posent, ils ne s'animent pas.
     */
  }

  .cable__plateau {
    display: block;
    width: 100%;
    height: auto;
  }

  /*
   * LA TÊTE DE LUMIÈRE.
   *
   * `stroke-dashoffset` porte une valeur LITTÉRALE, calculée en TypeScript et
   * écrite en style en ligne. C'est ce qui la rend transitionnable sans risque :
   * elle ne lit aucun jeton personnalisé, donc elle se rejoue à chaque
   * changement au lieu de se figer.
   *
   * La durée, elle, est un jeton — mais elle n'est pas transitionnée, elle
   * CADENCE la transition. Un jeton lu par `transition-duration` est substitué
   * au moment où la transition démarre, ce qui est exactement ce qu'on veut :
   * chaque trajet prend le temps de sa longueur, à vitesse constante. Une
   * lumière qui accélérerait sur les longs trajets ne serait plus une lumière.
   */
  .cable__tete path {
    transition: stroke-dashoffset var(--cb-duree) linear;
  }

  /* Au repos la tête est hors du tracé, donc invisible : on n'anime pas une
     opacité en plus, ce serait une seconde propriété pour rien. */

  .cable__braise {
    /* Rien ne clignote. Une braise ne pulse pas — c'est ce qui la sépare d'une
       alarme. Elle est là, tenue, et c'est tout ce qu'elle a à faire. */
    pointer-events: none;
  }

  /*
   * ── MODE SOBRE ────────────────────────────────────────────────────────────
   *
   * Le mécanisme reste JUSTE : la lumière vient toujours de derrière, les
   * interruptions l'arrêtent toujours, les raies disent toujours « pas
   * regardé ». Seul le trajet de la tête devient un saut. On perd le geste,
   * jamais le sens.
   */
  :global(html[data-rendu='sobre']) .cable__tete path {
    transition: none;
  }

  @media (update: slow) {
    .cable__tete path {
      transition: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    /* On ne coupe pas : un saut de lumière est un flash, et un flash est plus
       agressif que le mouvement qu'on retirait. 120 ms, linéaires. */
    .cable__tete path {
      transition-duration: 120ms;
    }
  }

  @media print {
    /* Sur papier il n'y a pas de lumière derrière la feuille — mais le trou
       reste un trou, et c'est lui qui portait l'information. */
    .cable__tete {
      display: none;
    }
  }
</style>
