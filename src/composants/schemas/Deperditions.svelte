<script lang="ts">
  /**
   * La maison, en illustration de livre : aplats de couleur, formes rondes, un
   * arbre, un soleil. On la regarde avant de la lire, et on touche ce qu'on veut
   * savoir.
   *
   * Les pourcentages sont des ordres de grandeur moyens (source ADEME). Quand le
   * rapport dit ce qui est isolé, la pastille le montre — vert ou rouge.
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

    const nues = Object.entries(isolation)
      .filter(([, etat]) => etat === 'nonIsole')
      .map(([paroi]) => NOM_PAROI[paroi])
      .filter(Boolean);
    const faites = Object.entries(isolation)
      .filter(([, etat]) => etat === 'isole')
      .map(([paroi]) => NOM_PAROI[paroi])
      .filter(Boolean);

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

  <svg viewBox="0 0 500 396" role="group" aria-label="Une maison illustrée : les six endroits par où la chaleur s’échappe.">
    <!-- Le ciel et le décor -->
    <circle cx="62" cy="52" r="24" class="soleil" />
    <path d="M38 52 L20 52M62 28 L62 10M45 35 L33 23M79 35 L91 23" class="rayons" />
    <ellipse cx="418" cy="60" rx="34" ry="16" class="nuage" />
    <ellipse cx="396" cy="54" rx="20" ry="14" class="nuage" />

    <!-- L'arbre -->
    <rect x="420" y="300" width="12" height="46" rx="4" class="tronc" />
    <circle cx="426" cy="288" r="30" class="feuillage" />
    <circle cx="404" cy="302" r="20" class="feuillage" />
    <circle cx="448" cy="302" r="18" class="feuillage" />

    <!-- Le sol -->
    <rect x="0" y="344" width="500" height="52" class="pelouse" />

    <!-- La maison -->
    <path d="M136 132 L250 56 L364 132 Z" class="toit" />
    <path d="M250 56 L250 42" class="cheminee-tige" />
    <rect x="300" y="66" width="26" height="46" rx="4" class="cheminee" />
    <rect x="152" y="132" width="196" height="164" class="facade" />
    <rect x="152" y="296" width="196" height="18" class="fondation" />

    <!-- Fenêtres et porte -->
    <rect x="180" y="178" width="52" height="52" rx="6" class="vitre" />
    <rect x="286" y="178" width="52" height="52" rx="6" class="vitre" />
    <path d="M206 178v52M180 204h52M312 178v52M286 204h52" class="croisillon" />
    <rect x="228" y="240" width="46" height="56" rx="5" class="porte" />
    <circle cx="266" cy="270" r="3.6" class="poignee" />

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
</figure>

<style>
  figure {
    margin: 0;
  }

  .invite {
    margin: 0 0 8px;
    font-size: 0.84rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 700;
    color: #9a7231;
  }

  svg {
    width: 100%;
    height: auto;
    display: block;
    margin-inline: auto;
  }

  /* Décor : des aplats francs, comme dans un album. */
  .soleil {
    fill: #f6c445;
  }

  .rayons {
    stroke: #f6c445;
    stroke-width: 4;
    stroke-linecap: round;
  }

  .nuage {
    fill: #ffffff;
    opacity: 0.9;
  }

  .pelouse {
    fill: #8ec89a;
  }

  .tronc {
    fill: #9a6b3f;
  }

  .feuillage {
    fill: #4f9c62;
  }

  .toit {
    fill: #c2503c;
    stroke: #9c3d2d;
    stroke-width: 3;
    stroke-linejoin: round;
  }

  .cheminee {
    fill: #9c3d2d;
  }

  .cheminee-tige {
    stroke: none;
  }

  .facade {
    fill: #fdf3e0;
    stroke: #d8c39c;
    stroke-width: 3;
  }

  .fondation {
    fill: #d8c39c;
  }

  .vitre {
    fill: #ffe9a8;
    stroke: #d8a93c;
    stroke-width: 3;
  }

  .croisillon {
    stroke: #d8a93c;
    stroke-width: 3;
  }

  .porte {
    fill: #6b8f6f;
    stroke: #4f7254;
    stroke-width: 3;
  }

  .poignee {
    fill: #f6c445;
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
    fill: rgb(226 106 60 / 20%);
    stroke: #e26a3c;
  }

  .souffle {
    stroke: #e26a3c;
    stroke-width: 8;
    stroke-linecap: round;
    fill: none;
    transition: stroke-width 0.2s ease;
  }

  .cible.actif .souffle {
    stroke-width: 12;
  }

  .bout {
    fill: #c2503c;
  }

  .fond-pastille {
    fill: #ffffff;
    stroke: #d8c39c;
    stroke-width: 2;
  }

  .cible.actif .fond-pastille {
    stroke: #e26a3c;
    stroke-width: 3;
  }

  .fond-pastille.isole {
    fill: #e4f3e8;
    stroke: #4f9c62;
  }

  .fond-pastille.non-isole {
    fill: #fbe6e0;
    stroke: #c2503c;
  }

  .classe {
    font-size: 22px;
    font-weight: 900;
    text-anchor: middle;
  }

  .nom {
    font-size: 14px;
    font-weight: 800;
    fill: #16241e;
    text-anchor: middle;
  }

  .part {
    font-size: 11.5px;
    fill: #5b6a62;
    text-anchor: middle;
    font-weight: 700;
  }

  .part.etat-lu {
    fill: #16241e;
  }

  .reponse {
    margin-top: 10px;
    padding: 16px 20px;
    background: #fdf3e0;
    border-left: 5px solid #e26a3c;
    border-radius: 14px;
  }

  .reponse .titre {
    margin: 0 0 4px;
    font-weight: 800;
    color: #c2503c;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.88rem;
  }

  .reponse p:last-of-type {
    margin: 0 0 10px;
    font-size: 0.98rem;
    color: #4a3d24;
  }

  .fermer {
    background: none;
    border: none;
    padding: 0;
    color: #c2503c;
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
