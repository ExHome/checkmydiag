<script lang="ts">
  /**
   * La loi Carrez en une idée : la barre des 1,80 m. Au-dessus ça compte,
   * en dessous non.
   */
  import ClipDessin from '../savoir/ClipDessin.svelte';
  import Verdict from './Verdict.svelte';

  interface Partie {
    id: string;
    titre: string;
    mot: string;
    compte: boolean;
    points: string[];
  }

  const PARTIES: Partie[] = [
    {
      id: 'compte',
      titre: 'Au-dessus de 1,80 m',
      mot: 'Ça compte',
      compte: true,
      points: [
        'Le sol des pièces où l’on tient debout',
        'Couloirs et placards inclus',
        'C’est ce chiffre qui va dans l’acte'
      ]
    },
    {
      id: 'compte-pas',
      titre: 'En dessous de 1,80 m',
      mot: 'Ça ne compte pas',
      compte: false,
      points: [
        'Sous les rampants, sous l’escalier',
        'On déduit aussi les murs, les cloisons et les gaines — les coffres qui cachent les tuyaux',
        'Cave, garage et balcon ne comptent pas non plus',
        'C’est pour ça que le chiffre est plus petit que celui de l’annonce'
      ]
    }
  ];

  let choisi = $state<string | null>(null);
  const detail = $derived(PARTIES.find((p) => p.id === choisi) ?? null);

  function basculer(id: string): void {
    choisi = choisi === id ? null : id;
  }
</script>

<figure>
  <p class="invite muet petit">Touchez une zone.</p>

  <svg viewBox="0 0 460 230" role="group" aria-label="Coupe sous combles : au-dessus de 1,80 mètre la surface compte, en dessous elle ne compte pas.">
    <defs>
      <!--
        UNE COUPE, PAS UN TRIANGLE.

        Le dessin tenait en trois formes : un triangle plein, un triangle clair
        au milieu, un trait. Rien n'y disait le comble -- ni charpente, ni
        plancher, ni cote. Ce qui suit lui donne la matiere d'une coupe
        d'architecte : c'est le meme propos, dessine pour de bon.
      -->

      <!-- Le volume qui COMPTE : un degrade dense en bas, comme un volume
           eclaire par la lucarne du faitage. -->
      <linearGradient id="sc-compte" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="currentColor" stop-opacity="0.42" />
        <stop offset="1" stop-color="currentColor" stop-opacity="0.16" />
      </linearGradient>

      <!-- Les rampants qui ne comptent pas : hachures du dessin technique. -->
      <pattern id="sc-hachure" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" stroke-width="1.1" stroke-opacity="0.24" />
      </pattern>

      <!-- Le plancher coupe. -->
      <pattern id="sc-poche" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" stroke-width="1.7" stroke-opacity="0.5" />
      </pattern>

      <filter id="sc-relief" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.35" />
      </filter>
    </defs>

    <!-- ── LE COMBLE ─────────────────────────────────────────────────────── -->

    <!-- Le volume sous rampants, hachure : bati, mais hors mesure. -->
    <path d="M40 186 L230 56 L420 186 Z" class="volume" />

    <!-- La couverture : deux pans epais, poses sur la charpente. -->
    <path d="M32 190 L230 50 L428 190" class="couverture" />
    <path d="M40 186 L230 58 L420 186" class="couverture-mince" />

    <!-- La charpente : faitage, pannes et entrait. Trois traits qui suffisent
         a dire « comble » la ou un triangle ne disait rien. -->
    <g class="charpente" aria-hidden="true">
      <line x1="230" y1="58" x2="230" y2="186" class="poincon" />
      <line x1="126" y1="132" x2="334" y2="132" class="entrait" />
      <line x1="150" y1="186" x2="230" y2="132" class="arbaletrier" />
      <line x1="310" y1="186" x2="230" y2="132" class="arbaletrier" />
    </g>

    <!-- Le plancher, en poche. -->
    <rect x="40" y="186" width="380" height="10" class="plancher" />

    <!-- La zone qui compte, en volume plein. -->
    <path d="M126 132 L230 62 L334 132 Z" class="comptee" />

    <!-- ── LA COTE DES 1,80 M, DESSINEE COMME SUR UN PLAN ───────────────── -->
    <g class="cotation" aria-hidden="true">
      <!-- Les attaches, jusqu'aux points cotes. -->
      <line x1="126" y1="132" x2="86" y2="132" class="attache" />
      <line x1="126" y1="186" x2="86" y2="186" class="attache" />
      <!-- La ligne de cote et ses fleches. -->
      <line x1="96" y1="132" x2="96" y2="186" class="ligne-cote" />
      <path d="M92 137 L96 130 L100 137 Z" class="fleche" />
      <path d="M92 181 L96 188 L100 181 Z" class="fleche" />
      <!-- Le trait de niveau, en pointille, qui court sous tout le comble. -->
      <line x1="40" y1="132" x2="420" y2="132" class="ligne-seuil" />
      <!-- La cote se lit CONTRE sa ligne de cote, a gauche, comme sur un plan.
           Au centre, elle passait sous la pastille « Ça compte » : deux textes
           au meme endroit, dont l'un devenait illisible. -->
      <text x="80" y="163" class="seuil">1,80 m</text>
    </g>

    <!-- Zones cliquables -->
    {#each PARTIES as partie (partie.id)}
      {@const actif = choisi === partie.id}
      <g
        class="cible"
        class:actif
        class:efface={choisi !== null && !actif}
        role="button"
        tabindex="0"
        aria-pressed={actif}
        aria-label="{partie.titre} : {partie.mot}"
        onclick={() => basculer(partie.id)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            basculer(partie.id);
          }
        }}
      >
        {#if partie.compte}
          <path d="M126 132 L230 62 L334 132 Z" class="zone" />
          <Verdict x={230} y={100} texte={partie.mot} ton="neutre" largeur={116} />
        {:else}
          <path d="M40 186 L126 132 L126 186 Z M334 132 L420 186 L334 186 Z" class="zone" />
          <Verdict x={230} y={214} texte={partie.mot} ton="neutre-evide" largeur={140} />
        {/if}
      </g>
    {/each}

    <!-- La règle, et la partie du toit qui lui échappe. -->
    <ClipDessin id="loi-carrez" x={404} y={54} depuis={[300, 108]} cote="gauche" />
    <ClipDessin id="rampant" x={58} y={96} depuis={[112, 138]} cote="droite" />
  </svg>

  {#if detail}
    <div class="reponse apparait" class:non={!detail.compte}>
      <p class="titre">{detail.titre}</p>
      <ul>
        {#each detail.points as point}
          <li>{point}</li>
        {/each}
      </ul>
      <button type="button" class="fermer" onclick={() => (choisi = null)}>← Revenir au schéma</button>
    </div>
  {:else}
    <figcaption class="muet petit">
      Trois surfaces différentes pour le même logement, c’est normal : Carrez pour vendre, Boutin
      pour louer, surface de référence pour le DPE.
    </figcaption>
  {/if}
</figure>

<style>
  figure {
    margin: 0;
  }

  .invite {
    margin: 0 0 var(--e1);
  }

  svg {
    width: 100%;
    height: auto;
    max-width: 520px;
    display: block;
    margin-inline: auto;
  }

  /*
   * Le comble hors mesure : bati, donc hachure -- pas un aplat gris qui le
   * ferait passer pour vide. `color` porte l'encre du texte, dont les motifs
   * heritent par `currentColor`.
   */
  .volume {
    fill: url(#sc-hachure);
    stroke: var(--trait);
    stroke-width: 2;
    stroke-linejoin: round;
    color: var(--sur-fond);
  }

  /* La couverture : un pan epais, puis un liseré fin dessous. Une toiture a
     une epaisseur ; un trait n'en a pas. */
  .couverture {
    fill: none;
    stroke: var(--action-forte);
    stroke-width: 6;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .couverture-mince {
    fill: none;
    stroke: var(--surface);
    stroke-width: 1.4;
    stroke-opacity: 0.5;
    stroke-linejoin: round;
  }

  /* La charpente : trois traits qui disent « comble » la ou un triangle nu ne
     disait rien. Elle reste discrete -- elle situe, elle ne s'expose pas. */
  .charpente line {
    stroke: var(--sur-fond);
    stroke-opacity: 0.3;
    stroke-width: 1.6;
    stroke-linecap: round;
  }

  .charpente .poincon {
    stroke-opacity: 0.22;
    stroke-dasharray: 4 5;
  }

  /* La cotation d'architecte : attaches fines, ligne pleine, fleches pleines. */
  .cotation .attache,
  .cotation .ligne-cote {
    stroke: var(--action-forte);
    stroke-width: 1.2;
  }

  .cotation .attache {
    stroke-opacity: 0.55;
  }

  .cotation .fleche {
    fill: var(--action-forte);
  }

  .plancher {
    fill: var(--trait);
  }

  /* Le volume qui compte : un degrade de la couleur de l'app, dense en bas,
     et un relief porte. C'est le sujet du schema, il se leve. */
  .comptee {
    fill: url(#sc-compte);
    stroke: var(--action-forte);
    stroke-width: 2.4;
    stroke-linejoin: round;
    color: var(--action-forte);
    filter: url(#sc-relief);
  }

  .ligne-seuil {
    stroke: var(--action-forte);
    stroke-width: 1.6;
    stroke-dasharray: 7 5;
    stroke-opacity: 0.8;
  }

  .seuil {
    font-size: var(--t-petit);
    fill: var(--sur-fond);
    text-anchor: end;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .cible {
    cursor: pointer;
    transition: opacity 0.25s ease;
  }

  .cible.efface {
    opacity: 0.35;
  }

  .zone {
    fill: transparent;
    stroke: transparent;
    stroke-width: 2.5;
    transition: fill 0.2s ease, stroke 0.2s ease;
  }

  .cible:hover .zone,
  .cible:focus-visible .zone,
  .cible.actif .zone {
    fill: var(--surface-bord);
    stroke: var(--vert-500);
  }




  .reponse {
    margin-top: var(--e3);
    padding: var(--e4) var(--e4);
    background: rgb(46 233 139 / 10%);
    border-left: 4px solid var(--ok);
    border-radius: var(--rayon-petit);
  }

  .reponse.non {
    background: var(--surface-forte);
    border-left-color: var(--encre-doux);
  }

  .reponse .titre {
    margin: 0 0 var(--e2);
    font-weight: 800;
    letter-spacing: 0.05em;
    font-size: var(--t-base);
    color: var(--ok);
  }

  .reponse.non .titre {
    color: var(--encre-doux);
  }

  .reponse ul {
    list-style: none;
    margin: 0 0 var(--e2);
    padding: 0;
    display: grid;
    gap: var(--e1);
  }

  .reponse li {
    position: relative;
    padding-left: var(--e4);
    font-size: var(--t-base);
  }

  .reponse li::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 0.55em;
    width: 6px;
    height: 6px;
    border-radius: 2px;
    background: currentColor;
    opacity: 0.6;
  }

  .fermer {
    background: none;
    border: none;
    padding: 0;
    color: var(--vert-300);
    font-weight: 700;
    font-size: var(--t-base);
    cursor: pointer;
  }

  figcaption {
    margin-top: var(--e3);
  }
</style>
