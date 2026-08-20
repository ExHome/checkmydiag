<script lang="ts">
  /**
   * Le dessin d'une anomalie.
   *
   * Une anomalie de rapport est une phrase de norme : « l'enveloppe d'au moins
   * un matériel est détériorée ». Le lecteur ne voit rien. Derrière chacune il y
   * a pourtant un mécanisme physique — un boîtier cassé laisse le doigt
   * atteindre une pièce sous tension — et c'est ce mécanisme qu'on dessine.
   *
   * Deux règles tenues :
   *
   * — le dessin démontre, il ne décore pas. Chaque trait porte une information,
   *   et quand le rapport n'en dit pas assez pour rattacher un mécanisme, il n'y
   *   a pas de dessin du tout plutôt qu'une image d'illustration ;
   *
   * — le dessin montre le mécanisme, jamais le logement. Le rapport ne dit pas
   *   où se trouve le boîtier cassé, et on n'invente rien. C'est écrit sous
   *   chaque schéma.
   */
  import { LEGENDE, TITRE, type Mecanisme } from '../../lib/analyse/mecanisme';

  const { mecanisme }: { mecanisme: Mecanisme } = $props();
</script>

{#if mecanisme !== 'general'}
  <figure class="schema-anomalie">
    <svg viewBox="0 0 240 128" role="img" aria-label={LEGENDE[mecanisme]}>
      {#if mecanisme === 'coupure'}
        <!-- Ce qui compte n'est pas qu'un organe de coupure existe, c'est qu'on
             puisse l'atteindre : dans le logement, à hauteur d'homme, sans
             outil. La cote dit tout. -->
        <rect x="30" y="22" width="62" height="64" rx="3" class="cadre" />
        <rect x="42" y="36" width="38" height="18" rx="2" class="piece" />
        <path d="M50 45h22" class="fort" />
        <path d="M42 64h38M42 74h38" class="fin" />
        <text x="61" y="100" class="etiquette">Tableau</text>

        <!-- La cote de hauteur : entre 1 m et 1,80 m du sol. -->
        <path d="M112 22v64" class="cote" />
        <path d="M107 22h10M107 86h10" class="cote" />
        <text x="122" y="50" class="mention">1 m</text>
        <text x="122" y="64" class="mention">à 1,80 m</text>

        <path d="M20 86h200" class="sol" />
        <text x="170" y="100" class="etiquette">Sol</text>
      {:else if mecanisme === 'differentiel'}
        <!-- Le différentiel compare ce qui part et ce qui revient. Sans lui,
             l'écart passe par la personne et rien ne s'en aperçoit. -->
        {#each [{ x: 0, avec: false }, { x: 122, avec: true }] as vue (vue.avec)}
          <g transform="translate({vue.x} 0)">
            <text x="56" y="16" class="titre">{vue.avec ? 'Avec' : 'Sans'}</text>
            <rect x="14" y="30" width="26" height="30" rx="3" class="cadre" />
            <!-- Sans différentiel, le fil rejoint la personne : il ne s'arrête
                 pas à mi-chemin, c'est tout le propos. -->
            <path d="M40 40h{vue.avec ? 26 : 36}" class={vue.avec ? 'fil coupe' : 'fil danger'} />

            {#if vue.avec}
              <path d="M27 38v14" class="fort" />
              <text x="27" y="74" class="mention">coupe</text>
            {/if}

            <!-- La personne, et le courant qui la traverse ou non. -->
            <circle cx="84" cy="40" r="8" class="corps" />
            <path d="M84 48v22M74 82l10-12 10 12M74 56h20" class="corps" />
            {#if !vue.avec}
              <path d="M84 70v18" class="fil danger" />
              <path d="M78 96h12" class="sol" />
            {/if}
          </g>
        {/each}
      {:else if mecanisme === 'terre'}
        <!-- La terre offre au courant de fuite un chemin plus facile que le
             corps. Sans piquet, il n'a que le corps. -->
        <path d="M28 30h60v46H28z" class="cadre" />
        <path d="M28 30 58 12l30 18" class="cadre" />
        <text x="58" y="60" class="etiquette">Logement</text>

        <path d="M88 66h44" class="fil" />
        <path d="M132 66v30" class="fil vert" />
        <path d="M126 96h12M128 102h8M130 108h4" class="fil vert" />
        <text x="146" y="88" class="mention">Piquet</text>
        <text x="146" y="100" class="mention">de terre</text>

        <path d="M14 96h212" class="sol" />
        <text x="30" y="112" class="etiquette">Sol</text>
      {:else if mecanisme === 'surintensite'}
        <!-- Le disjoncteur doit céder avant le fil. Deux sections, un même
             calibre : la seconde chauffe. -->
        {#each [{ y: 20, fin: false }, { y: 72, fin: true }] as ligne (ligne.fin)}
          <g>
            <rect x="16" y={ligne.y} width="30" height="26" rx="3" class="cadre" />
            <text x="31" y={ligne.y + 17} class="mention">20 A</text>
            <!-- Le trait s'arrête avant la section : collé au bord, le libellé
                 sortait du cadre du dessin. -->
            <path
              d="M46 {ligne.y + 13}h116"
              class={ligne.fin ? 'fil danger' : 'fil'}
              stroke-width={ligne.fin ? 3 : 9}
            />
            <text x="200" y={ligne.y + 17} class="etiquette">
              {ligne.fin ? '1,5 mm²' : '2,5 mm²'}
            </text>
            {#if ligne.fin}
              <!-- La chaleur : c'est le fil qui cède, pas la protection. -->
              <path d="M104 {ligne.y + 6}c4-4 0-8 4-12" class="chaud" />
              <path d="M118 {ligne.y + 6}c4-4 0-8 4-12" class="chaud" />
              <path d="M132 {ligne.y + 6}c4-4 0-8 4-12" class="chaud" />
            {/if}
          </g>
        {/each}
      {:else if mecanisme === 'salleDeau'}
        <!-- Les volumes : chaque distance dit ce qu'on a le droit d'y mettre.
             L'eau conduit, la peau mouillée aussi. -->
        <rect x="20" y="60" width="86" height="30" rx="6" class="cadre" />
        <text x="63" y="80" class="etiquette">Baignoire</text>

        <rect x="20" y="20" width="86" height="40" class="zone zero" />
        <text x="63" y="44" class="mention">Volume 0</text>

        <rect x="106" y="20" width="46" height="70" class="zone un" />
        <text x="129" y="44" class="mention">1</text>

        <rect x="152" y="20" width="52" height="70" class="zone deux" />
        <text x="178" y="44" class="mention">2</text>

        <!-- La prise, là où elle n'a rien à faire. -->
        <rect x="116" y="62" width="18" height="14" rx="2" class="piece danger-trait" />
        <circle cx="121" cy="69" r="1.6" class="pleine" />
        <circle cx="129" cy="69" r="1.6" class="pleine" />

        <path d="M14 90h212" class="sol" />
      {:else if mecanisme === 'contactDirect'}
        <!-- Une pièce sous tension à portée de doigt met le corps sur le
             réseau. Il n'y a rien entre les deux. -->
        <rect x="24" y="34" width="70" height="52" rx="4" class="cadre" />
        <path d="M94 60h40" class="fil danger" />
        <circle cx="136" cy="60" r="5" class="pleine danger-plein" />
        <text x="136" y="46" class="mention">nu</text>

        <!-- Le doigt. -->
        <path d="M212 60h-64" class="corps epais" />
        <path d="M212 48v24" class="corps epais" />
        <text x="196" y="92" class="etiquette">Doigt</text>

        <path d="M139 68q6 10 6 18" class="eclair" />
      {:else if mecanisme === 'enveloppe'}
        <!-- Le boîtier n'est pas un habillage : c'est lui qui tient les doigts
             à distance. Cassé, il ne tient plus rien. -->
        {#each [{ x: 0, casse: false }, { x: 122, casse: true }] as vue (vue.casse)}
          <g transform="translate({vue.x} 0)">
            <text x="54" y="18" class="titre">{vue.casse ? 'Détériorée' : 'Intacte'}</text>
            {#if vue.casse}
              <!-- Le capot ouvert d'un côté : l'intérieur est accessible. -->
              <path d="M20 34h68v52H20z" class="cadre casse" />
              <path d="M56 34 44 48l14 12-10 14" class="fissure" />
              <circle cx="72" cy="62" r="4" class="pleine danger-plein" />
              <path d="M88 62h18" class="fil danger" />
            {:else}
              <rect x="20" y="34" width="68" height="52" rx="3" class="cadre" />
              <path d="M32 48h44M32 60h44M32 72h28" class="fin" />
            {/if}
          </g>
        {/each}
      {:else if mecanisme === 'ventilation'}
        <!-- Une flamme consomme de l'air. Bouchez l'entrée basse, la combustion
             s'étouffe et fabrique du monoxyde. -->
        <rect x="24" y="20" width="180" height="70" class="cadre" />

        <!-- L'entrée d'air en bas, la sortie en haut. -->
        <path d="M24 74h14M24 78h14M24 82h14" class="fort" />
        <text x="52" y="82" class="mention">Entrée d’air</text>
        <path d="M190 26h14M190 30h14M190 34h14" class="fort" />
        <text x="176" y="46" class="mention">Sortie</text>

        <!-- Le trajet de l'air, et la flamme au milieu. -->
        <path d="M44 76q40 -6 70 -18" class="flux" />
        <path d="M126 52q34 -10 60 -18" class="flux" />

        <rect x="108" y="52" width="24" height="34" rx="3" class="piece" />
        <path d="M120 68c-5-5-1-10 0-13 2 4 6 8 0 13" class="flamme" />

        <path d="M14 90h212" class="sol" />
      {:else if mecanisme === 'combustion'}
        <!-- Les fumées doivent sortir. Si elles refluent, le monoxyde
             s'accumule — sans odeur, sans couleur. -->
        <rect x="30" y="46" width="34" height="44" rx="3" class="piece" />
        <path d="M47 70c-5-5-1-11 0-14 2 4 7 9 0 14" class="flamme" />
        <text x="47" y="104" class="etiquette">Appareil</text>

        <!-- Le conduit, et les fumées qui rebroussent chemin. -->
        <path d="M64 54h26v-34h22" class="conduit" />
        <path d="M120 20h16" class="flux" />
        <path d="M96 40q-14 6 -22 20" class="flux refoule" />
        <text x="128" y="52" class="mention">Reflux</text>

        <path d="M14 90h212" class="sol" />
      {:else if mecanisme === 'tuyauterie'}
        <!-- Chaque raccord est un point de fuite possible : le gaz se mêle à
             l'air, et il suffit d'une étincelle. -->
        <rect x="18" y="46" width="30" height="30" rx="3" class="cadre" />
        <text x="33" y="90" class="etiquette">Compteur</text>

        <path d="M48 60h50" class="conduit" />
        <circle cx="104" cy="60" r="7" class="cadre" />
        <path d="M104 53v14" class="fort" />
        <text x="104" y="86" class="etiquette">Robinet</text>

        <path d="M111 60h38" class="conduit danger-trait" />
        <rect x="150" y="42" width="40" height="36" rx="3" class="piece" />
        <path d="M170 62c-5-5-1-10 0-13 2 4 6 8 0 13" class="flamme" />

        <!-- Le point de fuite, sur le raccord. -->
        <circle cx="130" cy="60" r="9" class="halo" />
        <path d="M130 51v-10M124 46l-6-6M136 46l6-6" class="fuite" />
        <text x="130" y="30" class="mention">Fuite</text>
      {:else if mecanisme === 'degradation'}
        <!-- Tant que le revêtement tient, ce qu'il contient reste dedans. C'est
             en s'écaillant qu'il devient respirable. -->
        {#each [{ x: 0, abime: false }, { x: 122, abime: true }] as vue (vue.abime)}
          <g transform="translate({vue.x} 0)">
            <text x="54" y="18" class="titre">{vue.abime ? 'Dégradé' : 'Intact'}</text>
            <rect x="20" y="30" width="68" height="56" class="mur" />
            <path d="M20 30h68" class="couche" stroke-width="7" />
            {#if vue.abime}
              <!-- Les écailles qui se détachent, et la poussière au sol. -->
              <path d="M34 34l-8 12 10 2z" class="ecaille" />
              <path d="M58 33l10 10-12 3z" class="ecaille" />
              <circle cx="30" cy="80" r="2" class="pleine" />
              <circle cx="42" cy="83" r="1.6" class="pleine" />
              <circle cx="62" cy="81" r="2.2" class="pleine" />
              <path d="M20 86h68" class="sol danger-trait" />
            {:else}
              <path d="M20 86h68" class="sol" />
            {/if}
          </g>
        {/each}
      {:else if mecanisme === 'indices'}
        <!-- On ne voit presque jamais l'insecte : on voit ce qu'il laisse. -->
        <rect x="20" y="40" width="200" height="44" rx="3" class="mur" />
        <text x="120" y="102" class="etiquette">Bois de charpente ou de menuiserie</text>

        <!-- Les galeries à cœur, le cordonnet en surface. -->
        <path d="M44 62q18 -10 34 0 16 10 32 0 16 -10 32 0" class="galerie" />
        <path d="M60 74q16 8 34 0" class="galerie" />
        <path d="M150 40v-12M150 28h22" class="cordonnet" />
        <text x="182" y="26" class="mention">Cordonnet</text>
        <text x="76" y="34" class="mention">Galeries</text>
      {/if}
    </svg>

    <figcaption>
      <strong>{TITRE[mecanisme]}</strong>
      {LEGENDE[mecanisme]}
      <em>Le schéma montre le mécanisme, pas votre logement.</em>
    </figcaption>
  </figure>
{/if}

<style>
  /* Le dessin technique se lit sur papier : c'est la seule surface claire de
     l'écran, et elle dit « ceci est une planche », pas « ceci est un bandeau ». */
  .schema-anomalie {
    margin: var(--e3) 0 0;
    padding: var(--e3);
    background: var(--papier);
    border-radius: var(--rayon-petit);
    color: var(--encre);
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
  }

  figcaption {
    margin-top: var(--e2);
    font-size: var(--t-petit);
    line-height: 1.45;
    color: var(--encre-doux);
  }

  figcaption strong {
    display: block;
    font-family: var(--police-titre);
    font-weight: 500;
    font-size: var(--t-base);
    color: var(--vert-700);
  }

  /* La réserve, à sa place : sous le dessin, discrète, jamais absente. Un
     schéma qu'on prendrait pour un relevé du logement serait un mensonge. */
  figcaption em {
    display: block;
    margin-top: 2px;
    font-size: var(--t-micro);
    font-style: italic;
    color: var(--gris);
  }

  /* ---- Le trait ---------------------------------------------------------
     Un dessin technique n'a que trois épaisseurs : le contour, le détail, et
     ce qui alerte. Tout le reste est du bruit. */
  .cadre,
  .piece,
  .mur {
    fill: none;
    stroke: var(--encre);
    stroke-width: 1.6;
  }

  .mur {
    fill: var(--papier-doux);
    stroke-width: 1.2;
  }

  .piece {
    fill: var(--papier-doux);
  }

  .fin {
    fill: none;
    stroke: var(--gris);
    stroke-width: 1;
  }

  .fort {
    fill: none;
    stroke: var(--encre);
    stroke-width: 2.2;
    stroke-linecap: round;
  }

  .fil,
  .conduit {
    fill: none;
    stroke: var(--encre);
    stroke-width: 2;
    stroke-linecap: round;
  }

  .conduit {
    stroke-width: 5;
    stroke-linejoin: round;
  }

  .fil.vert {
    stroke: var(--vert-500);
  }

  /* Ce qui cloche est en rouge, et seulement ce qui cloche. */
  .danger,
  .danger-trait,
  .fuite,
  .eclair {
    stroke: var(--alerte);
  }

  .danger-plein,
  .ecaille {
    fill: var(--alerte);
  }

  .fuite,
  .eclair {
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
  }

  .halo {
    fill: none;
    stroke: var(--alerte);
    stroke-width: 1.2;
    stroke-dasharray: 3 3;
  }

  /* Le fil coupé : le trait s'interrompt, c'est tout le propos. */
  .coupe {
    stroke-dasharray: 6 6;
    stroke: var(--vert-500);
  }

  .corps {
    fill: none;
    stroke: var(--encre);
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .epais {
    stroke-width: 3;
  }

  .sol {
    stroke: var(--gris);
    stroke-width: 1.4;
  }

  .cote {
    stroke: var(--gris);
    stroke-width: 1;
  }

  .pleine {
    fill: var(--encre);
  }

  .flamme {
    fill: var(--verriere-vert-profond);
    stroke: none;
  }

  /* L'air et les fumées : une flèche fine, en pointillé — ça circule. */
  .flux {
    fill: none;
    stroke: var(--vert-500);
    stroke-width: 1.6;
    stroke-dasharray: 5 4;
  }

  .flux.refoule {
    stroke: var(--alerte);
  }

  .chaud {
    fill: none;
    stroke: var(--alerte);
    stroke-width: 1.6;
    stroke-linecap: round;
  }

  .fissure {
    fill: none;
    stroke: var(--alerte);
    stroke-width: 1.8;
  }

  .casse {
    stroke-dasharray: 8 5;
  }

  .couche {
    stroke: var(--verriere-sable-or);
    fill: none;
  }

  .galerie {
    fill: none;
    stroke: var(--verriere-vert-profond);
    stroke-width: 2.4;
    stroke-linecap: round;
  }

  .cordonnet {
    fill: none;
    stroke: var(--verriere-vert-profond);
    stroke-width: 2;
    stroke-linecap: round;
  }

  /* Les volumes de la salle d'eau : des voiles, du plus contraint au plus
     libre. C'est la distance qui décide, et elle se voit. */
  .zone {
    fill: var(--vert-500);
    stroke: none;
  }

  .zone.zero {
    opacity: 0.28;
  }

  .zone.un {
    opacity: 0.17;
  }

  .zone.deux {
    opacity: 0.08;
  }

  /* ---- Les mots du dessin ---------------------------------------------- */
  .titre {
    font-family: var(--police);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-anchor: middle;
    fill: var(--vert-700);
  }

  .etiquette,
  .mention {
    font-family: var(--police);
    font-size: 12.5px;
    text-anchor: middle;
    fill: var(--encre-doux);
  }

  .mention {
    font-size: 11.5px;
    fill: var(--gris);
  }

  @media print {
    .schema-anomalie {
      border: 1px solid #ccc;
    }
  }
</style>
