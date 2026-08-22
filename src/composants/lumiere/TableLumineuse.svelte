<script lang="ts" module>
  /* Les identifiants SVG doivent être uniques dans le document : deux tables
     sur le même écran partageraient sinon le même masque. Un compteur de
     module plutôt que `crypto.randomUUID()` — déterministe, donc comparable
     d'un rendu à l'autre en test comme en capture d'écran. */
  let sequence = 0;
</script>

<script lang="ts">
  /**
   * LA TABLE LUMINEUSE — un calque posé sur une source.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * L'INVERSION
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Toutes les interfaces éclairent leurs objets PAR DEVANT : un fond, de
   * l'encre dessus, éventuellement une ombre portée. Verrière éclaire PAR
   * DERRIÈRE. Ce n'est pas une nuance de goût, c'est une inversion complète de
   * la pile de rendu, et elle a une conséquence qu'on peut vérifier ligne à
   * ligne : LE DESSIN N'EST JAMAIS PEINT.
   *
   * Il n'apparaît nulle part comme un trait coloré. Il n'existe que dans le
   * masque, en noir, où il retire de la lumière. Ce qu'on prend pour un mur
   * est un endroit où la source ne passe plus.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * COMMENT L'EFFET S'OBTIENT SANS UNE SEULE IMAGE
   * ═══════════════════════════════════════════════════════════════════════
   *
   * La CSP interdit toute ressource externe, et les `data:` URI d'image sont
   * un contournement qu'on ne se permet pas. Tout est donc fabriqué dans un
   * SEUL élément `<svg>` inline, en cinq couches :
   *
   *   L0  <rect>     LE PLATEAU ÉTEINT. Le vert profond de la charte, assombri
   *                  par le retrait de gravité. C'est ce qu'on voit là où la
   *                  lumière est arrêtée — donc c'est ça, le « trait » du
   *                  dessin.
   *
   *   L1  <g mask>   LA LUMIÈRE. Un rectangle rempli d'un `<radialGradient>`
   *                  dont le centre, le rayon et la couleur viennent de
   *                  l'heure. Il est découpé par le masque `passe`.
   *
   *       Le masque est le cœur du procédé :
   *
   *         <mask>
   *           <rect fill="#fff"/>              tout passe par défaut
   *           <g filter="flou" color="#000">   … sauf le calque
   *             {@render calque()}
   *           </g>
   *           <path fill="#000"/>              … et sauf les anomalies
   *           <path fill="url(#hachure)"/>     … les zones non contrôlées ne
   *                                             laissent passer que des raies
   *         </mask>
   *
   *       ORDRE DE RENDU SVG : filtre, puis découpe, puis masque, puis opacité.
   *       C'est pourquoi le `feGaussianBlur` est posé DANS le masque, sur le
   *       groupe du calque, et non sur le groupe masqué. Posé à l'extérieur, il
   *       flouterait un dégradé uniforme — c'est-à-dire rien — et le masque
   *       recouperait ensuite au rasoir. Posé à l'intérieur, il rend l'ALPHA du
   *       masque progressif : la lumière fuit sous le bord du trait comme elle
   *       fuit dans la fibre d'un calque. C'est ce détail d'une ligne qui
   *       sépare une découpe au cutter d'un objet rétroéclairé.
   *
   *   L2  <rect>     LE GRAIN. `feTurbulence` désaturé, alpha 5 %, en
   *                  `mix-blend-mode: overlay`. Une lumière parfaitement lisse
   *                  est une lumière numérique ; le calque a une fibre.
   *
   *   L3  <slot>     LE CONTENU. Hors du SVG, en HTML : du vrai texte, avec sa
   *                  vraie encre, sélectionnable et lisible par un lecteur
   *                  d'écran. Il n'est jamais masqué.
   *
   * MODES DE FUSION : un seul, sur L2. Chacun crée un groupe d'isolation et
   * force le compositeur à relire le fond ; à trois ou quatre, sur un téléphone
   * lent, on perd la moitié des images.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * FIDÉLITÉ
   * ═══════════════════════════════════════════════════════════════════════
   *
   * `occlusions` porte un `libelle` obligatoire : chaque zone sombre vient d'une
   * ligne du rapport, et la légende l'écrit. Une zone NON CONTRÔLÉE ne peut pas
   * être affichée comme saine — elle n'a pas le même masque, et la différence
   * est une texture, pas une couleur : elle survit au daltonisme et au noir et
   * blanc.
   */
  import type { Snippet } from 'svelte';
  import type { Gravite } from '../../lib/modele';
  import { LARGEUR_HACHURE, LEGENDE, PAS_HACHURE, type Occlusion, type Polarite } from './calque';
  import { heureDecimale, lumiereDe, teinteDe } from './heure';
  import { retraitDe } from './gravite';

  interface Props {
    /**
     * Le dessin, en coordonnées 0 0 100 `hauteur`.
     *
     * CONTRAT : il se dessine en `currentColor`, un seul canal. Le composant
     * pose `color` sur le groupe du masque ; un enfant qui écrirait
     * `fill="#12463b"` en dur casserait la polarité sans erreur visible.
     */
    calque: Snippet;
    /** Ce qui se lit par-dessus. Jamais masqué, jamais éclairci. */
    contenu?: Snippet;
    /** Les endroits où la lumière ne passe pas, et ceux qu'on n'a pas regardés. */
    occlusions?: Occlusion[];
    /** Hauteur du plateau dans le repère du dessin. 100 = carré. */
    hauteur?: number;
    /** Ce que le dessin montre, pour qui ne le voit pas. Obligatoire. */
    titre: string;
    gravite?: Gravite;
    polarite?: Polarite;
    /** Heure décimale figée. Sans elle, la table suit l'horloge de l'appareil. */
    heure?: number;
  }

  const {
    calque,
    contenu,
    occlusions = [],
    hauteur = 62,
    titre,
    gravite = 'neutre',
    polarite = 'encre',
    heure
  }: Props = $props();

  const id = `tl${++sequence}`;

  /*
   * L'HORLOGE NE TOURNE PAS À 60 IMAGES PAR SECONDE.
   *
   * Cinq minutes. La lumière de fin d'après-midi bouge en une heure, pas en une
   * seconde : un rafraîchissement par image ne se verrait pas et coûterait un
   * recalcul de `feTurbulence` à chaque trame. C'est aussi ce qui rend les
   * `backdrop-filter` des carreaux gratuits — un fond figé est un fond mis en
   * cache par le compositeur.
   */
  let horloge = $state(heureDecimale(new Date()));

  $effect(() => {
    if (heure !== undefined) return;
    const minuterie = setInterval(() => {
      horloge = heureDecimale(new Date());
    }, 300_000);
    return () => clearInterval(minuterie);
  });

  const l = $derived(lumiereDe(heure ?? horloge));
  const etat = $derived(retraitDe(gravite, l.intensite));
  const teinte = $derived(teinteDe(l.temperature));

  /*
   * OÙ SE TROUVE LA SOURCE, dans le repère du plateau.
   *
   * Une source basse entre par le côté et éclaire loin ; une source haute tombe
   * au milieu et éclaire court. L'azimut décide du côté — c'est lui, et non la
   * longueur des ombres, qui fait reconnaître le matin du soir.
   */
  const cx = $derived(50 + l.azimut * 46 * (1 - l.inclinaison / 90));
  const cy = $derived(hauteur * (1.18 - 0.92 * (l.inclinaison / 90)));
  const rayon = $derived(78 + 62 * (1 - l.inclinaison / 90));

  const hachureVisible = $derived(occlusions.some((o) => o.genre === 'nonControle'));
  const anomalieVisible = $derived(occlusions.some((o) => o.genre === 'anomalie'));
</script>

<figure
  class="table"
  style:--tl-sol={etat.sol}
  style:--tl-teinte={teinte}
  style:--tl-duree="{etat.duree}ms"
  style:--tl-encre-douce={etat.encreDouce}
  style:--tl-ombre-x="{(-l.azimut * l.ombre).toFixed(3)}"
  style:--tl-ombre-y="{l.ombre.toFixed(3)}"
  style:aspect-ratio="100 / {hauteur}"
>
  <svg class="table__plateau" viewBox="0 0 100 {hauteur}" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <radialGradient id="{id}-lampe" cx={cx} cy={cy} r={rayon} gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color={teinte} stop-opacity={etat.lampe} />
        <stop offset="0.42" stop-color={teinte} stop-opacity={etat.lampe * 0.62} />
        <stop offset="1" stop-color={teinte} stop-opacity="0" />
      </radialGradient>

      {#if hachureVisible}
        <!-- Les raies : 1,5 px clairs sur un pas de 4. On voit qu'il y a
             quelque chose derrière, on ne voit pas ce que c'est. C'est
             exactement ce que dit le rapport quand il écrit « non visité ». -->
        <pattern
          id="{id}-raies"
          width={PAS_HACHURE}
          height={PAS_HACHURE}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-38)"
        >
          <rect width={PAS_HACHURE} height={PAS_HACHURE} fill="#000" />
          <rect width={LARGEUR_HACHURE} height={PAS_HACHURE} fill="#fff" />
        </pattern>
      {/if}

      <!-- La diffusion dans la fibre. 0,45 unité de plateau : au-delà le trait
           devient mou et le plan cesse d'être un plan. -->
      <filter id="{id}-fibre" x="-12%" y="-12%" width="124%" height="124%">
        <feGaussianBlur stdDeviation="0.45" />
      </filter>

      <filter id="{id}-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.86" numOctaves="2" seed="7" result="b" />
        <feColorMatrix in="b" type="saturate" values="0" />
        <feComponentTransfer><feFuncA type="linear" slope="0.05" intercept="0" /></feComponentTransfer>
      </filter>

      <mask id="{id}-passe" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height={hauteur}>
        <!-- Polarité `encre` : tout passe, le dessin arrête.
             Polarité `trait` : rien ne passe, le dessin est la seule ouverture. -->
        <rect width="100" height={hauteur} fill={polarite === 'encre' ? '#fff' : '#000'} />
        <g
          class="table__masque"
          filter="url(#{id}-fibre)"
          color={polarite === 'encre' ? '#000' : '#fff'}
        >
          {@render calque()}
        </g>
        {#each occlusions as o, i (i)}
          <path d={o.d} fill={o.genre === 'anomalie' ? '#000' : `url(#${id}-raies)`} />
        {/each}
      </mask>
    </defs>

    <!-- L0 · le plateau éteint : ce qu'on voit là où la lumière n'arrive pas. -->
    <rect width="100" height={hauteur} fill="var(--tl-sol)" />

    <!-- L1 · la lumière, découpée par le négatif du dessin. -->
    <g mask="url(#{id}-passe)">
      <rect width="100" height={hauteur} fill="url(#{id}-lampe)" />
    </g>

    <!-- L2 · le grain du calque. Retiré en mode sobre. -->
    <rect class="table__grain" width="100" height={hauteur} filter="url(#{id}-grain)" />
  </svg>

  {#if contenu}
    <div class="table__contenu">{@render contenu()}</div>
  {/if}

  <figcaption class="table__legende">
    <span class="table__titre">{titre}</span>
    {#if anomalieVisible}<span class="table__cle">{LEGENDE.anomalie}</span>{/if}
    {#if hachureVisible}<span class="table__cle">{LEGENDE.nonControle}</span>{/if}
    {#if occlusions.length > 0}
      <ul class="table__releves">
        {#each occlusions as o, i (i)}
          <li>{o.libelle}</li>
        {/each}
      </ul>
    {/if}
  </figcaption>
</figure>

<style>
  .table {
    position: relative;
    display: block;
    margin: 0;
    width: 100%;
    border-radius: var(--rayon-large);
    overflow: hidden;
    background: var(--tl-sol);
    color: var(--verriere-ivoire);
    /* L'ombre de la table sur la page suit l'heure, comme tout le reste. */
    box-shadow:
      calc(var(--tl-ombre-x) * 2px) calc(var(--tl-ombre-y) * 3px)
        calc(12px + var(--tl-ombre-y) * 6px) rgb(4 20 16 / 30%),
      inset 0 0 0 1px rgb(250 249 248 / 7%);
    /*
     * AUCUNE TRANSITION ICI, ET C'EST LE CORRECTIF.
     *
     * Les deux propriétés qu'on transitionnait lisent des jetons que le
     * composant repose à chaque rendu — `background` lit `var(--tl-sol)`,
     * `box-shadow` lit `var(--tl-ombre-x/y)`. Transitionnées, elles se figeaient
     * toutes deux sur leur valeur de PREMIER rendu : le plateau ne
     * s'assombrissait jamais avec la gravité, et l'ombre portée ne suivait
     * jamais l'heure. Mesuré : `--tl-ombre-y` passait de 4,700 à 0,180 pendant
     * que l'ombre peinte restait à 4,338 px. La règle et sa démonstration sont
     * dans `app.css` ; `transitions.test.ts` empêche le retour en arrière.
     *
     * La table n'a aucun état sous le doigt : rien n'avait donc à s'animer ici.
     * Le plateau, sa bande de légende et son ombre prennent leur valeur
     * ensemble — une seule pièce, sans couture.
     */
  }

  .table__plateau {
    display: block;
    width: 100%;
    height: auto;
  }

  .table__grain {
    mix-blend-mode: overlay;
  }

  /* Le contenu est du HTML, posé sur le plateau. Il ne traverse pas le masque :
     un texte rétroéclairé serait un texte qu'on ne peut pas lire. */
  .table__contenu {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: var(--e2);
    padding: var(--e5);
    pointer-events: none;
    color: var(--verriere-ivoire);
    /*
     * LE VOILE QUI RAMÈNE LA LAMPE À SON PLAFOND DE TEXTE.
     *
     * C'est la mise en œuvre de la borne B1 de `gravite.ts`. La lampe monte
     * jusqu'à 0,34 sur le plateau ; sous une bande de texte, elle ne doit pas
     * dépasser 0,12. Le voile est fait du SOL LUI-MÊME — donc il suit le
     * retrait de gravité au lieu d'être un noir posé dessus.
     *
     *   0,34 × (1 − 0,66) = 0,1156  ≤  0,12   ✓
     *
     * 66 % et pas 62 % : à 62 % l'alpha effectif remonte à 0,129 et franchit la
     * borne. Quatre points de voile, c'est la différence entre une borne
     * démontrée et une borne approximative.
     */
    background: linear-gradient(
      to top,
      color-mix(in srgb, var(--tl-sol) 66%, transparent) 0%,
      transparent 46%
    );
  }

  .table__contenu :global(*) {
    pointer-events: auto;
  }

  .table__legende {
    padding: var(--e3) var(--e5) var(--e5);
    font-size: var(--t-petit);
    line-height: 1.5;
    color: rgb(250 249 248 / calc(var(--tl-encre-douce) * 100%));
    background: var(--tl-sol);
    /* Aucune transition ici, et c'est volontaire : les deux jetons qu'elle lit
       sont déjà animés sur `.table`. En redéclarer une à ce niveau rendrait la
       légende à son défaut d'origine — une propriété qui dépend d'un jeton se
       fige sur sa valeur de premier rendu dès qu'on la transitionne elle-même. */
  }

  .table__titre {
    display: block;
    color: var(--verriere-ivoire);
    font-weight: 600;
  }

  .table__cle {
    display: block;
    margin-top: var(--e1);
  }

  .table__releves {
    margin: var(--e2) 0 0;
    padding-left: var(--e4);
  }

  /*
   * ── MODE SOBRE ────────────────────────────────────────────────────────────
   *
   * Le grain part, la fibre part. Il reste un dégradé radial masqué : deux
   * couches, zéro filtre, zéro mode de fusion. Le mécanisme reste JUSTE — la
   * lumière vient toujours de derrière, les anomalies l'arrêtent toujours, les
   * hachures disent toujours « non contrôlé ». On perd la matière, jamais le
   * sens.
   */
  :global(html[data-rendu='sobre']) .table__grain {
    display: none;
  }

  :global(html[data-rendu='sobre']) .table__masque {
    filter: none;
  }

  /* Le repli sans JavaScript : un moteur sans `backdrop-filter` est un moteur
     qui n'encaissera pas non plus deux filtres SVG animés. */
  @supports not (backdrop-filter: blur(1px)) {
    .table__grain {
      display: none;
    }
  }

  @media (update: slow) {
    .table__grain {
      display: none;
    }
  }

  /*
   * Pas de bloc `prefers-reduced-motion` pour la table, et ce n'est pas un
   * oubli : plus rien n'y est animé depuis que `background` et `box-shadow` ont
   * quitté la liste de transition. Le plateau, sa légende et son ombre prennent
   * leur valeur directement. Il n'y a aucun mouvement à réduire.
   *
   * Ce qui bouge encore dans le mécanisme — l'allumage des carreaux — est
   * traité dans `Carreau.svelte`, qui garde son bloc.
   */

  /* Sur papier, il n'y a pas de lumière derrière la feuille. */
  @media print {
    .table {
      box-shadow: none;
    }
    .table__grain {
      display: none;
    }
  }
</style>
