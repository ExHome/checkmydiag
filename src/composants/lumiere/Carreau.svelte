<script lang="ts">
  /**
   * LE CARREAU QUI S'ILLUMINE PAR L'ARRIÈRE.
   *
   * ═══════════════════════════════════════════════════════════════════════
   * LA DIFFÉRENCE TECHNIQUE ENTRE LE PREMIUM ET LE GADGET
   * ═══════════════════════════════════════════════════════════════════════
   *
   * Elle tient en une phrase, et tout le reste du fichier en découle :
   *
   *   UN HALO ANIME UNE COUCHE AU-DESSUS DU CONTENU, ET IL DÉBORDE.
   *   UN RÉTROÉCLAIRAGE ANIME UNE COUCHE SOUS LE CONTENU, ET IL NE DÉBORDE PAS.
   *
   * ── Ce que fait un halo (ce qu'on ne fait pas ici) ──────────────────────
   *
   *     box-shadow: 0 0 24px 6px rgb(or / 55%);      ← déborde de la boîte
   *     filter: drop-shadow(0 0 18px or);            ← déborde de la boîte
   *     ::after { background: radial-gradient(…);     ← est AU-DESSUS du texte
   *               mix-blend-mode: screen; }
   *
   *   Trois symptômes qui trahissent le gadget, tous vérifiables :
   *     · la lumière est visible EN DEHORS du carreau ;
   *     · le texte est lavé par la lumière (elle passe devant lui) ;
   *     · l'intérieur du carreau ne change pas — seul son pourtour brille.
   *
   *   On dirait un autocollant sur lequel on braque une lampe.
   *
   * ── Ce que fait un rétroéclairage (ce qu'on fait ici) ───────────────────
   *
   *   TROIS choses changent, toutes DERRIÈRE la vitre, toutes découpées par
   *   `border-radius: inherit` — donc rien ne sort jamais de la boîte :
   *
   *   1. LE SUBSTRAT. Un pseudo-élément en `z-index: 0`, sous le contenu, dont
   *      le dégradé radial est centré à `50% 118 %` — c'est-à-dire SOUS le
   *      carreau, hors de lui. La source n'est pas dans l'image : on n'en voit
   *      que ce qui traverse. Seule son `opacity` est animée, de 0,14 à 0,42.
   *      `opacity` est une propriété de composition : elle ne provoque ni
   *      recalcul de style, ni mise en page, ni repeinture.
   *
   *   2. LE FOND DERRIÈRE LA VITRE. `backdrop-filter: brightness()` agit sur
   *      les pixels DÉJÀ PEINTS derrière l'élément. C'est la seule propriété
   *      CSS qui éclaire littéralement ce qui est derrière — aucune couche
   *      posée par-dessus ne peut l'imiter. Elle passe de 102 % à 138 %.
   *
   *   3. LA TRANCHE. Le verre ne fuit que par son épaisseur : un
   *      `box-shadow: inset 0 0 0 1px` s'allume, et un second inset à SPREAD
   *      NÉGATIF (`inset 0 -20px 30px -20px`) fait s'accumuler la lumière sous
   *      la vitre. Le spread négatif est ce qui garde la lueur à l'intérieur.
   *
   *   Et une quatrième, à contre-intuition : L'OMBRE PORTÉE RACCOURCIT. Sous le
   *   doigt, le carreau se rapproche du plateau. Un objet qui s'allume et dont
   *   l'ombre s'allonge est un objet qui décolle — c'est le langage du halo.
   *
   * ── La borne, et elle n'est pas décorative ──────────────────────────────
   *
   *   `--carreau-passe` plafonne à 0,42, et le substrat est bridé à 3400 K.
   *   À 0,62, ou avec la teinte blanche de midi, la face du carreau entre dans
   *   la BANDE MORTE (`contraste.ts`) : la zone de luminance où ni l'ivoire ni
   *   le vert profond n'atteignent 4,5. Un carreau plus lumineux serait un
   *   carreau dont on ne peut plus lire le nom. Mesuré : 5,28 au pire cas,
   *   avec le substrat le plus clair admissible. Le test le tient.
   */
  import type { Snippet } from 'svelte';
  import type { Gravite } from '../../lib/modele';
  import { lumiereDe, teinteDuCarreau } from './heure';
  import { PLAFOND_CARREAU, retraitDe } from './gravite';

  interface Props {
    /** Le nom de la mini-application. Toujours écrit : jamais une icône seule. */
    titre: string;
    /** Ce qui se lit sur la vitre. */
    enfants?: Snippet;
    gravite?: Gravite;
    /** Heure décimale. Le carreau est bridé à 3400 K quoi qu'elle vaille. */
    heure?: number;
    onactiver?: () => void;
  }

  const { titre, enfants, gravite = 'neutre', heure = 18, onactiver }: Props = $props();

  const l = $derived(lumiereDe(heure));
  const etat = $derived(retraitDe(gravite, l.intensite));
  const teinte = $derived(teinteDuCarreau(l));

  /*
   * LA NUIT, LE CARREAU EST LA SOURCE.
   *
   * « La nuit, ce sont les carreaux eux-mêmes qui éclairent la pièce. » Au
   * repos il passe donc de 0,14 à 0,26 : c'est le seul moment où un objet
   * éteint devient un objet allumé sans qu'on le touche. Le plafond, lui, ne
   * bouge pas — la lisibilité ne dépend pas de l'heure.
   */
  const repos = $derived(l.nuit ? 0.26 : 0.14);
</script>

<button
  type="button"
  class="carreau"
  style:--carreau-teinte={teinte}
  style:--carreau-repos={repos}
  style:--carreau-appui={PLAFOND_CARREAU}
  style:--carreau-sol={etat.sol}
  style:--carreau-duree="{etat.duree}ms"
  style:--carreau-ombre-x="{(-l.azimut * l.ombre).toFixed(3)}"
  style:--carreau-ombre-y="{l.ombre.toFixed(3)}"
  onclick={onactiver}
>
  <span class="carreau__substrat" aria-hidden="true"></span>
  <span class="carreau__contenu">
    <span class="carreau__titre">{titre}</span>
    {#if enfants}{@render enfants()}{/if}
  </span>
</button>

<style>
  .carreau {
    /* 44 px de cible tactile, plancher non négociable. */
    position: relative;
    display: block;
    min-width: 44px;
    min-height: 88px;
    padding: var(--e4);
    border: 0;
    border-radius: var(--rayon-large);
    /* Le carreau est posé sur le plateau ÉTEINT, jamais sur une zone éclairée :
       la lampe de la table est masquée sous les carreaux. Un carreau translucide
       posé sur une flaque de lumière traverserait la bande morte. */
    background: var(--carreau-sol);
    color: var(--verriere-ivoire);
    font: inherit;
    text-align: left;
    cursor: pointer;
    isolation: isolate;
    overflow: hidden;

    /* AU REPOS. La vitre est presque neutre : un liseré haut qui capte
       l'ambiance, une tranche à peine visible, une ombre à la longueur de
       l'heure. */
    box-shadow:
      inset 0 1px 0 rgb(250 249 248 / 22%),
      inset 0 0 0 1px rgb(250 249 248 / 8%),
      calc(var(--carreau-ombre-x) * 2px) calc(var(--carreau-ombre-y) * 4px)
        calc(10px + var(--carreau-ombre-y) * 5px) rgb(4 20 16 / 34%);

    /*
     * NI `background` NI `box-shadow` NE SE TRANSITIONNENT ICI.
     *
     * Les deux lisent des jetons que le composant repose à chaque rendu —
     * `var(--carreau-sol)` pour l'un, `var(--carreau-ombre-x/y)` pour l'autre.
     * Transitionnées, elles se figent sur leur valeur de premier rendu : le
     * carreau ne s'assombrissait jamais avec la gravité, et son ombre ne
     * suivait jamais l'heure. La démonstration est dans `app.css`,
     * `transitions.test.ts` empêche le retour en arrière.
     *
     * L'ALLUMAGE N'Y PERD RIEN, et c'est le point : il n'a jamais eu besoin de
     * `box-shadow`. Il vit sur le substrat, en dessous du contenu, où une
     * `opacity` et une tranche s'animent — voir plus bas. Le rétroéclairage
     * reste donc entier ; ce qui part, c'est un fondu qui ne fonctionnait pas.
     */
  }

  /*
   * LE SUBSTRAT — la seule chose qui s'anime, et elle est DERRIÈRE le contenu.
   *
   * `inset: 0` + `border-radius: inherit` : la lumière est prisonnière de la
   * boîte. `50% 118 %` : la source est sous le carreau, hors champ. On ne voit
   * jamais l'ampoule, seulement ce qui traverse — c'est ce qui fait la vitre.
   */
  .carreau__substrat {
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: inherit;
    pointer-events: none;
    /* `transparent` en dernière butée, et non un gris à alpha 0 : les dégradés
       CSS interpolent en alpha PRÉMULTIPLIÉ (CSS Images 4), donc la butée
       transparente ne tire plus vers le noir comme au temps où il fallait
       écrire la même couleur à alpha zéro. */
    background: radial-gradient(
      132% 96% at 50% 118%,
      var(--carreau-teinte) 0%,
      color-mix(in srgb, var(--carreau-teinte) 45%, transparent) 38%,
      transparent 72%
    );
    opacity: var(--carreau-repos);
    /*
     * LA TRANCHE VIT ICI, sur la couche du dessous, et non sur le bouton.
     *
     * C'est ce que dit déjà l'en-tête du fichier — « un rétroéclairage anime
     * une couche SOUS le contenu » —, et c'est maintenant vrai à la lettre :
     * l'allumage de la tranche est un `box-shadow` intérieur porté par le
     * substrat, pas par la vitre.
     *
     * Il est transitionnable sans risque parce qu'il ne s'allume qu'AU
     * CHANGEMENT D'ÉTAT — au repos il vaut `none`. Une transition déclenchée
     * par un sélecteur repart de zéro à chaque fois et relit la teinte
     * courante ; c'est le cas figé, celui d'une valeur au repos qui ne change
     * que par son jeton, qui était le piège.
     */
    box-shadow: none;
    transition:
      opacity var(--t-lumiere) var(--verre),
      box-shadow var(--t-lumiere) var(--verre);
  }

  .carreau__contenu {
    position: relative;
    z-index: 1; /* le texte est DEVANT la lumière, jamais lavé par elle */
    display: block;
  }

  .carreau__titre {
    display: block;
    font-size: var(--t-lead);
    font-weight: 600;
    /* L'encre principale n'est modulée par rien : ni l'heure, ni la gravité. */
    color: var(--verriere-ivoire);
  }

  /*
   * LE FOND DERRIÈRE LA VITRE.
   *
   * Séparé dans un `@supports` : là où `backdrop-filter` manque, le carreau
   * reste juste — il perd la profondeur du verre, pas son rétroéclairage.
   * Le flou est CONSTANT ; seule la luminosité change à l'appui. Animer un
   * flou force une nouvelle passe de convolution à chaque image ; animer une
   * luminosité est une matrice de couleur, presque gratuite.
   */
  @supports (backdrop-filter: blur(1px)) {
    .carreau {
      background: color-mix(in srgb, var(--carreau-sol) 82%, transparent);
      backdrop-filter: blur(12px) saturate(108%) brightness(102%);
      /* Même correction : c'est ce bloc-ci qui s'applique dès que
         `backdrop-filter` existe, donc c'est lui qui figeait le fond. Seul
         `backdrop-filter` reste — il ne lit aucun jeton, ses trois valeurs sont
         littérales, et c'est lui qui éclaire ce qu'il y a derrière la vitre. */
      transition: backdrop-filter var(--t-lumiere) var(--verre);
    }
  }

  /* ── SOUS LE DOIGT ─────────────────────────────────────────────────────── */

  /* La lumière monte, et la tranche s'allume avec elle — toutes deux sur le
     substrat, donc toutes deux animées. */
  .carreau:hover .carreau__substrat,
  .carreau:focus-visible .carreau__substrat {
    opacity: calc((var(--carreau-repos) + var(--carreau-appui)) / 2);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--carreau-teinte) 46%, transparent),
      inset 0 -20px 30px -20px var(--carreau-teinte);
  }

  .carreau:active .carreau__substrat {
    opacity: var(--carreau-appui);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--carreau-teinte) 62%, transparent),
      inset 0 -24px 34px -20px var(--carreau-teinte);
    /* L'allumage est plus rapide que l'extinction : le geste doit être vu tout
       de suite, la retombée peut prendre son temps. */
    transition-duration: var(--t-instant);
  }

  /*
   * Ce qui reste sur la VITRE : le liseré haut, et l'ombre portée qui
   * raccourcit. Aucune transition — ces déclarations lisent l'heure, et une
   * valeur qui lit un jeton se fige dès qu'on la transitionne. Le changement
   * est instantané, ce qui est exactement ce qu'on veut d'un appui.
   */
  .carreau:hover,
  .carreau:focus-visible {
    box-shadow:
      inset 0 1px 0 rgb(250 249 248 / 34%),
      calc(var(--carreau-ombre-x) * 1.2px) calc(var(--carreau-ombre-y) * 2.4px)
        calc(8px + var(--carreau-ombre-y) * 3px) rgb(4 20 16 / 40%);
  }

  .carreau:active {
    box-shadow:
      inset 0 1px 0 rgb(250 249 248 / 42%),
      /* L'ombre RACCOURCIT : le carreau se rapproche du plateau. Un objet qui
         s'allume en décollant, c'est un halo ; en se posant, c'est du verre. */
      calc(var(--carreau-ombre-x) * 0.5px) calc(var(--carreau-ombre-y) * 1.1px)
        calc(5px + var(--carreau-ombre-y) * 1.5px) rgb(4 20 16 / 46%);
  }

  @supports (backdrop-filter: blur(1px)) {
    .carreau:active {
      backdrop-filter: blur(9px) saturate(118%) brightness(138%);
    }
  }

  /* L'anneau du clavier n'est jamais remplacé par la lumière : une lueur n'est
     pas un repère de navigation. */
  .carreau:focus-visible {
    outline: 2px solid var(--verriere-ivoire);
    outline-offset: 3px;
  }

  /*
   * ── MODE SOBRE ────────────────────────────────────────────────────────────
   *
   * Le `backdrop-filter` disparaît — c'est LA dépense du carreau : chaque
   * élément qui en porte un force le compositeur à relire la zone du fond, et
   * huit carreaux font huit relectures. Le fond redevient opaque, le substrat
   * reste. Le rétroéclairage survit intégralement : il n'a jamais eu besoin que
   * d'une opacité.
   */
  :global(html[data-rendu='sobre']) .carreau {
    background: var(--carreau-sol);
    backdrop-filter: none;
    /*
     * `transition: none` N'EST PAS DÉCORATIF ICI.
     *
     * Sans lui, la liste de transition du bloc `@supports` reste active et le
     * passage en sobre ANIME la disparition du `backdrop-filter` — huit
     * relectures du fond pendant 320 ms, au moment précis où l'on bascule
     * parce que l'appareil n'y arrive plus. Le mode sobre doit couper net, pas
     * s'éteindre en fondu.
     *
     * On ne rétablit rien d'autre : `box-shadow` lit l'heure, et le
     * transitionner le figerait — y compris ici. L'allumage reste porté par le
     * substrat, qui ne coûte qu'une opacité.
     */
    transition: none;
  }

  @media (update: slow) {
    .carreau {
      backdrop-filter: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    /* On ne coupe pas la lumière : un allumage instantané est un flash, et un
       flash est plus agressif qu'un fondu. On garde 120 ms d'opacité — la seule
       chose qui reste animée — et on retire tout le reste. */
    .carreau {
      transition: none;
    }
    .carreau__substrat {
      transition: opacity 120ms linear;
    }
    .carreau:active .carreau__substrat {
      transition-duration: 120ms;
    }
  }

  @media print {
    .carreau {
      background: #fff;
      color: var(--verriere-encre);
      box-shadow: inset 0 0 0 1px #999;
      backdrop-filter: none;
    }
    .carreau__substrat {
      display: none;
    }
    .carreau__titre {
      color: var(--verriere-encre);
    }
  }
</style>
