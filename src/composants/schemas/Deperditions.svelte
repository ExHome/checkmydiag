<script lang="ts">
  /**
   * La maison du dossier : un trait sobre, la palette de la maison, et les
   * parois de ce logement-là.
   *
   * Le dessin d'album — soleil, arbre, aplats vifs — a été abandonné : il jurait
   * avec le reste et donnait au sujet un air de manuel scolaire. Restent les
   * formes justes, l'or et le vert, et six souffles de chaleur.
   *
   * Les pourcentages sont des ordres de grandeur moyens (source ADEME). Quand le
   * rapport dit ce qui est isolé, la pastille le montre.
   */
  import type { EtatIsolation, Isolation, Lettre } from '../../lib/modele';

  const {
    isolation = null,
    lettre = null
  }: { isolation?: Isolation | null; lettre?: Lettre | null } = $props();

  /** Les couleurs officielles de l'étiquette, pour poser la classe sur la maison. */
  const TEINTE_LETTRE: Record<Lettre, string> = {
    A: '#319834',
    B: '#33cc31',
    C: '#cbfc34',
    D: '#fbfe06',
    E: '#fbcc05',
    F: '#fc9935',
    G: '#fc0205'
  };

  interface Fuite {
    id: string;
    nom: string;
    part: string;
    texte: string;
    paroi?: keyof Isolation;
    /** Souffle de chaleur : départ, arrivée. */
    de: [number, number];
    vers: [number, number];
    /** Pastille du libellé. */
    pastille: [number, number];
    zone: { x: number; y: number; w: number; h: number; r?: number };
  }

  const FUITES: Fuite[] = [
    {
      id: 'toit',
      nom: 'Toit',
      part: '25-30 %',
      paroi: 'toit',
      texte:
        'La chaleur monte. C’est par là qu’il en part le plus — et c’est le moins cher à traiter : quelques heures dans les combles.',
      de: [250, 96],
      vers: [250, 40],
      pastille: [250, 24],
      zone: { x: 150, y: 44, w: 200, h: 58 }
    },
    {
      id: 'air',
      nom: 'Air',
      part: '20-25 %',
      texte:
        'L’air chaud s’en va, l’air froid entre : par la ventilation, mais surtout par les fuites — bas de porte, prises, trappes.',
      de: [186, 176],
      vers: [110, 128],
      pastille: [86, 108],
      zone: { x: 174, y: 156, w: 52, h: 44 }
    },
    {
      id: 'murs',
      nom: 'Murs',
      part: '20-25 %',
      paroi: 'murs',
      texte:
        'Deuxième poste. Cher à isoler, mais c’est ce qui change le plus le confort : un mur froid, on le sent même à 20 °C.',
      de: [156, 244],
      vers: [92, 244],
      pastille: [66, 244],
      zone: { x: 152, y: 212, w: 26, h: 78 }
    },
    {
      id: 'fenetres',
      nom: 'Fenêtres',
      part: '10-15 %',
      paroi: 'fenetres',
      texte:
        'Moins que ce qu’on croit. Les changer avant d’isoler les combles, c’est beaucoup dépenser pour peu gagner.',
      de: [344, 200],
      vers: [412, 200],
      pastille: [440, 200],
      zone: { x: 286, y: 178, w: 52, h: 52, r: 6 }
    },
    {
      id: 'ponts',
      nom: 'Jonctions',
      part: '5-10 %',
      texte:
        'Là où l’isolant s’arrête : angle de mur, contour de fenêtre, balcon. Le froid y passe comme dans un couloir, et la moisissure suit.',
      de: [344, 282],
      vers: [412, 282],
      pastille: [440, 282],
      zone: { x: 330, y: 268, w: 22, h: 28 }
    },
    {
      id: 'sol',
      nom: 'Sol',
      part: '7-10 %',
      paroi: 'plancher',
      texte:
        'Le plancher bas, surtout au-dessus d’une cave. Le plus discret, et souvent le plus simple à traiter par en dessous.',
      de: [250, 306],
      vers: [250, 350],
      pastille: [250, 370],
      zone: { x: 152, y: 296, w: 196, h: 18 }
    }
  ];

  let choisi = $state<string | null>(null);
  const detail = $derived(FUITES.find((f) => f.id === choisi) ?? null);

  function basculer(id: string): void {
    choisi = choisi === id ? null : id;
  }

  function etatDe(fuite: Fuite): 'isole' | 'nonIsole' | null {
    if (!isolation || !fuite.paroi) return null;
    const etat: EtatIsolation = isolation[fuite.paroi];
    return etat === 'inconnu' ? null : etat;
  }

  const MENTION = { isole: 'isolé', nonIsole: 'non isolé' } as const;

  const NOM_PAROI: Record<string, string> = {
    toit: 'le toit',
    murs: 'les murs',
    fenetres: 'les fenêtres',
    plancher: 'le plancher'
  };

  /**
   * Le constat, tiré du rapport et pas d'une moyenne nationale : la classe du
   * logement, puis ce que le diagnostiqueur a noté paroi par paroi.
   */
  const constat = $derived.by(() => {
    const debut = lettre ? `Votre logement est classé ${lettre}.` : 'Votre logement.';
    if (!isolation) return `${debut} Le rapport ne dit pas ce qui est isolé.`;

    const nommees = (cherche: EtatIsolation): string[] =>
      Object.entries(isolation)
        .filter(([, etat]) => etat === cherche)
        .map(([paroi]) => NOM_PAROI[paroi])
        .filter((nom): nom is string => nom !== undefined);

    const nues = nommees('nonIsole');
    const faites = nommees('isole');

    if (!nues.length && !faites.length) return `${debut} Le rapport ne dit pas ce qui est isolé.`;

    // « le plancher comme non isolé », mais « les murs et le toit comme non isolés ».
    const accord = (liste: string[]): string =>
      liste.length > 1 || liste[0]?.startsWith('les') ? 's' : '';

    if (!nues.length)
      return `${debut} Le rapport donne ${faites.join(', ')} comme isolé${accord(faites)}.`;
    return `${debut} Le rapport donne ${nues.join(', ')} comme non isolé${accord(nues)} — c’est par là que ça part.`;
  });
</script>

<figure>
  <p class="invite">Touchez la maison.</p>

  <svg viewBox="0 0 500 396" role="group" aria-label="La maison du dossier : les six endroits par où la chaleur s’échappe.">
    <!-- Le sol : un filet, pas une pelouse. -->
    <path d="M40 344 H460" class="sol" />

    <!-- La maison : un trait fin, deux valeurs de crème, le toit en vert. -->
    <path d="M136 132 L250 56 L364 132 Z" class="toit" />
    <rect x="300" y="66" width="24" height="46" class="cheminee" />
    <rect x="152" y="132" width="196" height="164" class="facade" />
    <rect x="152" y="296" width="196" height="16" class="fondation" />

    <!-- Fenêtres et porte -->
    <rect x="180" y="178" width="52" height="52" class="vitre" />
    <rect x="286" y="178" width="52" height="52" class="vitre" />
    <path d="M206 178v52M180 204h52M312 178v52M286 204h52" class="croisillon" />
    <rect x="228" y="240" width="46" height="56" class="porte" />
    <circle cx="266" cy="270" r="3" class="poignee" />

    <!-- La classe du logement, posée sur sa façade : c'est sa maison. -->
    {#if lettre}
      <g transform="translate(196 152)">
        <rect x="-22" y="-16" width="44" height="32" rx="8" fill={TEINTE_LETTRE[lettre]} />
        <text
          x="0"
          y="7"
          class="classe"
          fill={lettre === 'C' || lettre === 'D' || lettre === 'E' ? '#16241e' : '#fff'}
        >
          {lettre}
        </text>
      </g>
    {/if}

    <!-- Souffles de chaleur et libellés -->
    {#each FUITES as fuite (fuite.id)}
      {@const actif = choisi === fuite.id}
      {@const etat = etatDe(fuite)}
      <g
        class="cible"
        class:actif
        class:efface={choisi !== null && !actif}
        role="button"
        tabindex="0"
        aria-pressed={actif}
        aria-label="{fuite.nom} : {fuite.part} des pertes"
        onclick={() => basculer(fuite.id)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            basculer(fuite.id);
          }
        }}
      >
        <rect
          x={fuite.zone.x}
          y={fuite.zone.y}
          width={fuite.zone.w}
          height={fuite.zone.h}
          rx={fuite.zone.r ?? 8}
          class="zone"
        />
        <path d="M{fuite.de[0]} {fuite.de[1]} L{fuite.vers[0]} {fuite.vers[1]}" class="souffle" />
        <circle cx={fuite.vers[0]} cy={fuite.vers[1]} r="6" class="bout" />

        <g transform="translate({fuite.pastille[0]} {fuite.pastille[1]})">
          <rect
            x="-54"
            y="-16"
            width="108"
            height="32"
            rx="16"
            class="fond-pastille"
            class:isole={etat === 'isole'}
            class:non-isole={etat === 'nonIsole'}
          />
          <text x="0" y="-1" class="nom">{fuite.nom}</text>
          <text x="0" y="11" class="part" class:etat-lu={etat !== null}>
            {etat ? MENTION[etat] : fuite.part}
          </text>
        </g>
      </g>
    {/each}
  </svg>

  {#if detail}
    <div class="reponse apparait">
      <p class="titre">{detail.nom} · {detail.part}</p>
      <p>{detail.texte}</p>
      <button type="button" class="fermer" onclick={() => (choisi = null)}>← Revenir</button>
    </div>
  {:else}
    <!-- On ne pose pas une question au lecteur : on lui dit ce que son rapport
         raconte, paroi par paroi. -->
    <figcaption class="constat">{constat}</figcaption>
  {/if}

  <!-- Le relevé : chaque endroit, ce que le rapport en dit, et son poids dans
       la facture. C'est le détail qu'on cherche après avoir vu le dessin. -->
  <table class="releve">
    <thead>
      <tr>
        <th>Par où</th>
        <th>Ce que dit le rapport</th>
        <th>Part des pertes</th>
      </tr>
    </thead>
    <tbody>
      {#each FUITES as fuite (fuite.id)}
        {@const etat = etatDe(fuite)}
        <tr class:vise={choisi === fuite.id}>
          <th scope="row">{fuite.nom}</th>
          <td class={etat ?? 'muet'}>
            {#if etat === 'isole'}Isolé
            {:else if etat === 'nonIsole'}Sans isolant
            {:else if fuite.paroi}Non renseigné
            {:else}—{/if}
          </td>
          <td class="part">{fuite.part}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</figure>

<style>
  figure {
    margin: 0;
  }

  .invite {
    margin: 0 0 10px;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--or-fonce);
  }

  svg {
    width: 100%;
    height: auto;
    display: block;
    margin-inline: auto;
  }

  /* La palette de la maison : vert DGLM, or, crème, encre. Rien d'autre. */
  .sol {
    stroke: var(--trait);
    stroke-width: 2;
  }

  .toit {
    fill: var(--vert-700);
    stroke: var(--vert-900);
    stroke-width: 1.5;
    stroke-linejoin: round;
  }

  .cheminee {
    fill: var(--vert-900);
  }

  .facade {
    fill: var(--papier-doux);
    stroke: var(--trait);
    stroke-width: 1.5;
  }

  .fondation {
    fill: var(--trait);
  }

  .vitre {
    fill: var(--or-pale);
    stroke: var(--or);
    stroke-width: 1.5;
  }

  .croisillon {
    stroke: var(--or);
    stroke-width: 1.2;
  }

  .porte {
    fill: var(--vert-700);
    stroke: var(--vert-900);
    stroke-width: 1.5;
  }

  .poignee {
    fill: var(--or);
  }

  /* Le relevé sous le dessin : ce que le rapport dit de chaque endroit. */
  .releve {
    width: 100%;
    border-collapse: collapse;
    margin-top: 18px;
    font-size: 0.88rem;
  }

  .releve th,
  .releve td {
    text-align: left;
    padding: 9px 4px;
    border-bottom: 1px solid var(--trait-fin);
  }

  .releve thead th {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gris);
    border-bottom-color: var(--trait);
  }

  .releve tbody th {
    font-weight: 700;
    color: var(--encre);
    width: 30%;
  }

  .releve tr.vise {
    background: var(--papier-doux);
  }

  .releve .isole {
    color: var(--ok);
    font-weight: 600;
  }

  .releve .nonIsole {
    color: var(--alerte);
    font-weight: 600;
  }

  .releve .muet {
    color: var(--gris);
  }

  .releve .part {
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--encre-doux);
    white-space: nowrap;
  }

  .cible {
    cursor: pointer;
    transition: opacity 0.25s ease;
  }

  .cible.efface {
    opacity: 0.3;
  }

  .zone {
    fill: transparent;
    stroke: transparent;
    stroke-width: 3;
    transition: fill 0.2s ease, stroke 0.2s ease;
  }

  .cible:hover .zone,
  .cible:focus-visible .zone,
  .cible.actif .zone {
    fill: rgb(192 144 72 / 18%);
    stroke: var(--or);
  }

  .souffle {
    stroke: var(--or-fonce);
    stroke-width: 5;
    stroke-linecap: round;
    fill: none;
    transition: stroke-width 0.2s ease;
  }

  .cible.actif .souffle {
    stroke-width: 8;
  }

  .bout {
    fill: var(--or-fonce);
  }

  .fond-pastille {
    fill: #fff;
    stroke: var(--trait);
    stroke-width: 1.4;
  }

  .cible.actif .fond-pastille {
    stroke: var(--or);
    stroke-width: 2;
  }

  .fond-pastille.isole {
    fill: var(--ok-fond);
    stroke: var(--ok);
  }

  .fond-pastille.non-isole {
    fill: var(--alerte-fond);
    stroke: var(--alerte);
  }

  .classe {
    font-size: 22px;
    font-weight: 900;
    text-anchor: middle;
  }

  .nom {
    font-size: 13px;
    font-weight: 700;
    fill: var(--encre);
    text-anchor: middle;
  }

  .part {
    font-size: 11px;
    fill: var(--gris);
    text-anchor: middle;
    font-weight: 700;
  }

  .part.etat-lu {
    fill: var(--encre);
  }

  .reponse {
    margin-top: 10px;
    padding: 16px 20px;
    background: var(--papier-doux);
    border-left: 3px solid var(--or);
    border-radius: var(--rayon-petit);
  }

  .reponse .titre {
    margin: 0 0 4px;
    font-weight: 700;
    color: var(--vert-700);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.88rem;
  }

  .reponse p:last-of-type {
    margin: 0 0 10px;
    font-size: 0.98rem;
    color: var(--encre-doux);
  }

  .fermer {
    background: none;
    border: none;
    padding: 0;
    color: var(--or-fonce);
    font-weight: 800;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .constat {
    margin-top: 14px;
    font-size: 1rem;
    font-weight: 650;
    line-height: 1.45;
    color: #2f3d36;
  }
</style>
