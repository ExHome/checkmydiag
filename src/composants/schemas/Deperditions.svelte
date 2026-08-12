<script lang="ts">
  /**
   * Par où la chaleur s'échappe — illustration cliquable.
   *
   * Le lecteur ne lit pas un paragraphe : il touche le toit, et le toit lui
   * répond. Chaque zone porte sa part de déperdition et son explication.
   *
   * Les pourcentages sont des ordres de grandeur moyens (source ADEME) : le DPE
   * ne publie pas ceux du logement sous une forme lisible par un programme.
   */
  interface Fuite {
    id: string;
    nom: string;
    part: string;
    texte: string;
    /** Départ et arrivée du souffle de chaleur. */
    de: [number, number];
    vers: [number, number];
    /** Ancre de la pastille de libellé. */
    pastille: [number, number];
    /** Zone cliquable sur le dessin. */
    zone: { x: number; y: number; w: number; h: number; r?: number };
  }

  const FUITES: Fuite[] = [
    {
      id: 'toit',
      nom: 'Toit',
      part: '25-30 %',
      texte:
        'C’est par là que part le plus de chaleur : elle monte. C’est aussi le poste le moins cher à traiter — souvent quelques heures de travail dans les combles.',
      de: [270, 104],
      vers: [270, 44],
      pastille: [270, 26],
      zone: { x: 168, y: 52, w: 204, h: 56 }
    },
    {
      id: 'air',
      nom: 'Air',
      part: '20-25 %',
      texte:
        'L’air chaud s’en va, l’air froid entre : par la ventilation, mais surtout par les fuites — bas de porte, prises, trappes. Une VMC bien réglée coûte moins cher qu’une chaudière.',
      de: [206, 168],
      vers: [126, 118],
      pastille: [96, 100],
      zone: { x: 196, y: 148, w: 56, h: 44 }
    },
    {
      id: 'murs',
      nom: 'Murs',
      part: '20-25 %',
      texte:
        'Deuxième poste. Les isoler coûte cher, mais c’est ce qui change le plus le confort : un mur froid, on le sent même quand la pièce est à 20 °C.',
      de: [180, 232],
      vers: [110, 232],
      pastille: [78, 232],
      zone: { x: 176, y: 200, w: 26, h: 78 }
    },
    {
      id: 'fenetres',
      nom: 'Fenêtres',
      part: '10-15 %',
      texte:
        'Moins que ce qu’on croit. Changer ses fenêtres avant d’isoler les combles, c’est beaucoup dépenser pour peu gagner. En revanche, on le voit et on l’entend tout de suite.',
      de: [360, 192],
      vers: [430, 192],
      pastille: [462, 192],
      zone: { x: 292, y: 172, w: 48, h: 48, r: 4 }
    },
    {
      id: 'ponts',
      nom: 'Jonctions',
      part: '5-10 %',
      texte:
        'Les endroits où l’isolant s’interrompt : entre un mur et un plancher, autour d’une fenêtre, sur un balcon. Le froid y passe comme dans un couloir — et c’est là qu’apparaît la moisissure.',
      de: [360, 272],
      vers: [430, 272],
      pastille: [462, 272],
      zone: { x: 340, y: 258, w: 22, h: 28 }
    },
    {
      id: 'sol',
      nom: 'Sol',
      part: '7-10 %',
      texte:
        'Le plancher bas, surtout s’il donne sur une cave ou un vide sanitaire. Le poste le plus discret, et souvent le plus simple à traiter par en dessous.',
      de: [270, 292],
      vers: [270, 336],
      pastille: [270, 356],
      zone: { x: 176, y: 284, w: 188, h: 16 }
    }
  ];

  let choisi = $state<string | null>(null);
  const detail = $derived(FUITES.find((f) => f.id === choisi) ?? null);

  function basculer(id: string): void {
    choisi = choisi === id ? null : id;
  }
</script>

<figure>
  <p class="invite muet petit">Touchez une partie du logement.</p>

  <svg viewBox="0 0 540 380" role="group" aria-label="Coupe d’une maison : les six endroits par où la chaleur s’échappe.">
    <defs>
      <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--vert-100)" stop-opacity="0.55" />
        <stop offset="100%" stop-color="var(--vert-100)" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="toiture" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0%" stop-color="#2f6f52" />
        <stop offset="100%" stop-color="#17513a" />
      </linearGradient>
      <linearGradient id="facade" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#fbfdfb" />
        <stop offset="100%" stop-color="#e7efe9" />
      </linearGradient>
      <linearGradient id="vitre" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#bfe3f5" />
        <stop offset="55%" stop-color="#8fd0ee" />
        <stop offset="100%" stop-color="#d8f0fb" />
      </linearGradient>
      <linearGradient id="chaleur" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f5a524" stop-opacity="0.15" />
        <stop offset="45%" stop-color="#f0762b" stop-opacity="0.85" />
        <stop offset="100%" stop-color="#e5484d" />
      </linearGradient>
      <filter id="pose" x="-30%" y="-30%" width="160%" height="180%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0b3d26" flood-opacity="0.18" />
      </filter>
    </defs>

    <rect x="0" y="0" width="540" height="380" fill="url(#ciel)" rx="18" />

    <!-- Le bâti -->
    <g filter="url(#pose)">
      <path d="M156 140 L270 62 L384 140 Z" fill="url(#toiture)" stroke-linejoin="round" />
      <rect x="176" y="140" width="188" height="144" fill="url(#facade)" />
      <rect x="176" y="284" width="188" height="16" fill="#c7d6cc" />
      <rect x="196" y="172" width="48" height="48" rx="4" fill="url(#vitre)" />
      <rect x="292" y="172" width="48" height="48" rx="4" fill="url(#vitre)" />
      <path d="M196 196h48M220 172v48M292 196h48M316 172v48" stroke="#ffffff" stroke-width="2.5" opacity="0.85" />
      <rect x="248" y="228" width="44" height="56" rx="3" fill="#9fb8a8" />
      <circle cx="284" cy="258" r="2.6" fill="#f3f8f4" />
    </g>

    <!-- Souffles de chaleur -->
    {#each FUITES as fuite (fuite.id)}
      {@const actif = choisi === fuite.id}
      <g
        class="cible"
        class:actif
        class:efface={choisi !== null && !actif}
        role="button"
        tabindex="0"
        aria-pressed={actif}
        aria-label="{fuite.nom} : {fuite.part} des pertes de chaleur"
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
          rx={fuite.zone.r ?? 6}
          class="zone"
        />

        <path
          d="M{fuite.de[0]} {fuite.de[1]} L{fuite.vers[0]} {fuite.vers[1]}"
          class="souffle"
          stroke="url(#chaleur)"
        />
        <circle cx={fuite.vers[0]} cy={fuite.vers[1]} r="5" class="bout" />

        <g class="libelle" transform="translate({fuite.pastille[0]} {fuite.pastille[1]})">
          <rect x="-52" y="-15" width="104" height="30" rx="15" class="fond-pastille" />
          <text x="0" y="-1" class="nom">{fuite.nom}</text>
          <text x="0" y="10" class="part">{fuite.part}</text>
        </g>
      </g>
    {/each}
  </svg>

  {#if detail}
    <div class="reponse apparait">
      <p class="titre">{detail.nom} · {detail.part} de la chaleur</p>
      <p>{detail.texte}</p>
    </div>
  {:else}
    <figcaption class="muet petit">
      Ordres de grandeur pour une maison mal isolée (source&nbsp;: ADEME). Le schéma de
      <em>votre</em> logement est en page 2 de votre DPE.
    </figcaption>
  {/if}
</figure>

<style>
  figure {
    margin: 0;
  }

  .invite {
    margin: 0 0 4px;
  }

  svg {
    width: 100%;
    height: auto;
    max-width: 560px;
    display: block;
    margin-inline: auto;
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
    stroke-width: 2.5;
    transition: fill 0.2s ease, stroke 0.2s ease;
  }

  .cible:hover .zone,
  .cible:focus-visible .zone,
  .cible.actif .zone {
    fill: rgb(240 118 43 / 16%);
    stroke: #f0762b;
  }

  .souffle {
    stroke-width: 7;
    stroke-linecap: round;
    fill: none;
    transition: stroke-width 0.2s ease;
  }

  .cible.actif .souffle {
    stroke-width: 11;
  }

  .bout {
    fill: #e5484d;
  }

  .fond-pastille {
    fill: var(--papier);
    stroke: var(--trait);
    stroke-width: 1;
    filter: drop-shadow(0 2px 5px rgb(11 61 38 / 14%));
    transition: fill 0.2s ease, stroke 0.2s ease;
  }

  .cible.actif .fond-pastille {
    fill: #fff3ec;
    stroke: #f0762b;
  }

  .nom {
    font-size: 13.5px;
    font-weight: 700;
    fill: var(--encre);
    text-anchor: middle;
  }

  .part {
    font-size: 11px;
    fill: var(--encre-doux);
    text-anchor: middle;
    font-weight: 600;
  }

  .cible.actif .part {
    fill: #d1451b;
  }

  .reponse {
    margin-top: 10px;
    padding: 16px 20px;
    background: linear-gradient(135deg, #fff3ec, transparent 150%);
    border-left: 4px solid #f0762b;
    border-radius: var(--rayon-petit);
  }

  .reponse .titre {
    margin: 0 0 4px;
    font-weight: 800;
    color: #d1451b;
    font-size: 0.94rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .reponse p:last-child {
    margin: 0;
    font-size: 0.98rem;
  }

  figcaption {
    margin-top: 12px;
  }
</style>
