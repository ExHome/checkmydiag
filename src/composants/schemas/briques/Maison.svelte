<script module lang="ts">
  /**
   * La maison de Verrière — première brique de la bibliothèque visuelle
   * (§ 19 de ORDRE-DE-MISSION-SCHEMAS.md).
   *
   * Trois schémas dessinaient trois maisons différentes : celle du DPE, celle
   * des argiles, celle de l'assainissement. Même sujet, trois silhouettes, trois
   * jeux de proportions. Elles n'en font plus qu'une.
   *
   * Tout est dérivé de la largeur de façade `l`, avec les proportions du dessin
   * de référence (celui du DPE) :
   *
   *   façade      1 × 0,837
   *   toit        débord 0,082 de chaque côté, hauteur 0,388
   *   cheminée    0,122 de large, posée aux trois quarts de la pente
   *
   * Ainsi une maison de 70 unités et une de 196 sont la même maison, à
   * l'échelle près — c'est ce qui fait qu'on la reconnaît d'un schéma à l'autre.
   */
  export const PROPORTIONS = {
    facade: 0.837,
    debordToit: 0.082,
    hauteurToit: 0.388,
    cheminee: 0.122
  } as const;
</script>

<script lang="ts">
  const {
    x,
    y,
    l,
    cheminee = false,
    fondation = false,
    fenetres = 0,
    porte = false
  }: {
    /** Coin haut-gauche de la façade. */
    x: number;
    y: number;
    /** Largeur de la façade — tout le reste en découle. */
    l: number;
    cheminee?: boolean;
    fondation?: boolean;
    /** 0, 1 ou 2 fenêtres, réparties sur la façade. */
    fenetres?: 0 | 1 | 2;
    porte?: boolean;
  } = $props();

  /**
   * Un identifiant propre a chaque maison.
   *
   * Les degrades du relief sont references par `url(#id)`, et cinq schemas
   * peuvent coexister dans une meme page : sans prefixe unique, la premiere
   * maison montee imposerait ses degrades a toutes les autres -- et une
   * disparition de la premiere emporterait le relief des suivantes.
   *
   * `$props.id()` donne un identifiant stable par instance, cote client comme
   * au rendu serveur.
   */
  const uid = $props.id();

  const h = $derived(l * PROPORTIONS.facade);
  const debord = $derived(l * PROPORTIONS.debordToit);
  const hToit = $derived(l * PROPORTIONS.hauteurToit);

  /** Le triangle du toit, posé sur le haut de la façade. */
  const toit = $derived(
    `M${x - debord} ${y} L${x + l / 2} ${y - hToit} L${x + l + debord} ${y} Z`
  );

  const lCheminee = $derived(l * PROPORTIONS.cheminee);
  const xCheminee = $derived(x + l * 0.755);
  const yCheminee = $derived(y - hToit * 0.868);

  /** Les ouvertures, en proportion elles aussi. */
  const cote = $derived(l * 0.265);
  const yFenetre = $derived(y + h * 0.28);
  const lPorte = $derived(l * 0.235);
  const hPorte = $derived(h * 0.34);

  const xFenetres = $derived(
    fenetres === 2
      ? [x + l * 0.143, x + l * 0.684]
      : fenetres === 1
        ? [x + l / 2 - cote / 2]
        : []
  );
</script>

<!--
  LE RELIEF : DE LA LUMIERE EN HAUT, DE L'OMBRE EN BAS.

  La maison etait en aplats plats cernes d'un trait -- lisible, mais plate. Le
  relief demande ne vient pas d'un effet : c'est celui d'iOS, une source de
  lumiere unique et zenithale, et rien d'autre.

  Trois procedes, pas un de plus :

    · un degrade sur la facade, deux arrets, qui donne son volume au bati ;
    · deux aretes d'un pixel -- claire en haut, sombre en bas -- qui detachent
      les plans ;
    · une ombre de contact au sol, qui pose la maison au lieu de la faire
      flotter.

  Ils sont ecrits en blanc et noir TRANSLUCIDES : cette brique sert cinq
  schemas, sur fond sombre comme sur papier clair, et une couleur pleine aurait
  fonctionne d'un cote seulement.

  Ni neon, ni halo, ni glassmorphism, ni creux : la charte les refuse, et ils
  feraient exactement le « trop joli » qui trahit un dessin technique.
-->
<g class="maison">
  <defs>
    <!--
      `stop-color` et `stop-opacity` SEPARES, jamais la couleur moderne.

      Ecrit `stop-color="rgb(255 255 255 / 9%)"`, le degrade sortait NOIR OPAQUE
      au rendu : la syntaxe CSS Color 4 n'est pas comprise dans un attribut de
      presentation SVG, et l'alpha etait purement ignore. La facade devenait un
      aplat noir, l'ombre de contact une tache.

      Vu seulement en rendant le dessin en image -- aucune mesure de contraste
      ne l'aurait revele, puisque le fautif n'ecrit aucun texte.

      L'INTENSITE, elle aussi, s'est reglee a l'oeil : trois maisons rendues
      cote a cote. A 9/16 le volume se devinait a peine, a 14/26 le bas de
      facade s'assombrissait au point d'avaler ses fenetres. 12/22 se voit sans
      ecraser.
    -->
    <linearGradient id="{uid}-paroi" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.12" />
      <stop offset="1" stop-color="#000000" stop-opacity="0.22" />
    </linearGradient>
    <radialGradient id="{uid}-contact">
      <stop offset="0" stop-color="#000000" stop-opacity="0.38" />
      <stop offset="1" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- L'ombre de contact vient EN PREMIER : elle passe sous tout le reste. -->
  <ellipse
    cx={x + l / 2}
    cy={y + h + (fondation ? h * 0.098 : 0) + 3}
    rx={l * 0.58}
    ry={h * 0.045}
    fill="url(#{uid}-contact)"
  />

  {#if cheminee}
    <rect x={xCheminee} y={yCheminee} width={lCheminee} height={hToit * 0.6} class="cheminee" />
  {/if}

  <path d={toit} class="toit" />
  <rect {x} {y} width={l} height={h} class="facade" />

  <!-- Le volume du bati : un seul degrade, pose par-dessus la facade sans
       toucher a sa couleur — il ne fait qu'y ajouter la lumiere. -->
  <rect {x} {y} width={l} height={h} fill="url(#{uid}-paroi)" />

  <!-- Les deux aretes. Un pixel chacune, c'est tout le procede. -->
  <path d="M{x} {y} h{l}" class="arete-haute" />
  <path d="M{x} {y + h} h{l}" class="arete-basse" />

  {#if fondation}
    <rect {x} y={y + h} width={l} height={h * 0.098} class="fondation" />
  {/if}

  {#each xFenetres as fx (fx)}
    <rect x={fx} y={yFenetre} width={cote} height={cote} class="vitre" />
    <path
      d="M{fx + cote / 2} {yFenetre} v{cote} M{fx} {yFenetre + cote / 2} h{cote}"
      class="croisillon"
    />
  {/each}

  {#if porte}
    <rect
      x={x + l / 2 - lPorte / 2}
      y={y + h - hPorte}
      width={lPorte}
      height={hPorte}
      class="porte"
    />
  {/if}
</g>

<style>
  /* La maison est dessinée à l'encre du contexte : posée sur le vert elle est
     claire, posée sur du papier elle est sombre. Un seul dessin, deux fonds. */
  .toit {
    fill: rgb(214 230 106 / 28%);
    stroke: var(--or);
    stroke-width: 1.8;
    stroke-linejoin: round;
  }

  .cheminee {
    fill: none;
    stroke: var(--or);
    stroke-width: 1.8;
  }

  .facade {
    fill: var(--surface-forte);
    stroke: currentColor;
    stroke-width: 1.5;
  }

  .fondation {
    fill: currentColor;
    opacity: 0.18;
  }

  /*
   * LES DEUX ARETES.
   *
   * Une lumiere zenithale eclaire le haut d'un volume et laisse son bas dans
   * l'ombre : deux traits d'un pixel suffisent a le dire, et c'est tout ce que
   * fait iOS. En blanc et noir translucides, elles fonctionnent aussi bien sur
   * le fond sombre d'une mini-app que sur le papier d'une impression.
   */
  .arete-haute {
    stroke: rgb(255 255 255 / 16%);
    stroke-width: 1;
    fill: none;
  }

  .arete-basse {
    stroke: rgb(0 0 0 / 40%);
    stroke-width: 1;
    fill: none;
  }

  /* A l'impression et en contraste force, le relief ne dit plus rien et brouille
     le trait : il s'efface, la silhouette suffit. */
  @media print, (forced-colors: active) {
    .arete-haute,
    .arete-basse {
      display: none;
    }
  }

  .vitre {
    fill: rgb(214 230 106 / 22%);
    stroke: var(--or);
    stroke-width: 1.4;
  }

  .croisillon {
    stroke: var(--or);
    stroke-width: 1;
    fill: none;
    opacity: 0.7;
  }

  .porte {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
  }
</style>
