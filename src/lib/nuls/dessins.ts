/**
 * Les dessins de la rubrique.
 *
 * Ce sont des chaînes SVG, pas des composants : la rubrique est prérendue en
 * HTML pur, et un dessin qui a besoin de JavaScript pour apparaître n'existe ni
 * pour un moteur de recherche, ni pour un téléphone en 3G, ni pour un lecteur
 * d'écran. Les classes sont celles de `en-clair.css` — aucun style en dur,
 * sauf les sept couleurs de l'arrêté DPE (voir plus bas).
 *
 * Les règles de ORDRE-DE-MISSION-SCHEMAS.md s'appliquent telles quelles :
 * une idée par dessin, six éléments au maximum, jamais de légende à numéros, et
 * le test sans mot — on masque les textes, le dessin doit encore raconter.
 *
 * ⚠️ Les sept couleurs A→G n'apparaissent que dans `etiquette` et
 * `deux-etiquettes`, sur fond blanc, comme une planche réglementaire reproduite.
 * Elles ne colorent jamais un autre dessin : c'est ce qui les empêche de
 * ressembler à un avis de Verrière.
 */

export interface Dessin {
  /** Ce que le dessin raconte — devient l'aria-label et la légende. */
  legende: string;
  svg: string;
}

/** Les couleurs officielles de l'étiquette (arrêté du 31 mars 2021). */
const ETQ: Record<string, string> = {
  A: '#319834',
  B: '#33cc31',
  C: '#cbfc34',
  D: '#fbfe06',
  E: '#fbcc05',
  F: '#fc9935',
  G: '#fc0205'
};

/** Sur jaune et jaune-vert, la lettre doit rester noire pour rester lisible. */
const encreLettre = (l: string): string => (['C', 'D', 'E'].includes(l) ? '#101010' : '#ffffff');

/** L'échelle A→G, en planche : fond blanc, barres officielles, lettres noires. */
function echelle(marque?: string): string {
  const lettres = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const barres = lettres
    .map((l, i) => {
      const y = 14 + i * 22;
      const large = 60 + i * 26;
      const vise = l === marque;
      return `
      <g${vise ? ' class="vise"' : ''}>
        <rect x="34" y="${y}" width="${large}" height="17" rx="2" fill="${ETQ[l]}" />
        <text x="${40 + large - 14}" y="${y + 13}" class="lettre" fill="${encreLettre(l)}">${l}</text>
        ${vise ? `<path d="M${large + 44} ${y + 8.5} h16 m-6 -5 l6 5 -6 5" class="pointe" />` : ''}
      </g>`;
    })
    .join('');

  return `
    <svg viewBox="0 0 320 178" class="planche" role="img">
      <rect x="0" y="0" width="320" height="178" rx="3" fill="#ffffff" />
      <text x="20" y="10" class="planche-titre">peu gourmand</text>
      <text x="20" y="174" class="planche-titre">très gourmand</text>
      <path d="M22 16 V162" class="planche-axe" />
      ${barres}
    </svg>`;
}

export const DESSINS: Record<string, Dessin> = {
  /* ------------------------------------------------------------------ bases */

  dossier: {
    legende:
      'Un seul PDF remis par le diagnostiqueur, dans lequel les diagnostics se suivent les uns après les autres.',
    svg: `
      <svg viewBox="0 0 320 138" role="img">
        <rect x="14" y="12" width="112" height="108" rx="4" class="feuille" />
        <path d="M30 34h80M30 48h80M30 62h58M30 76h80M30 90h44" class="ligne-texte" />
        <text x="70" y="132" class="mot">un seul PDF</text>

        <path d="M136 66 h30 m-9 -7 l9 7 -9 7" class="fleche" />

        <g class="pile">
          <rect x="178" y="10" width="128" height="20" rx="3" class="bloc-oui" />
          <text x="242" y="24" class="mot-oui">DPE</text>
          <rect x="178" y="34" width="128" height="20" rx="3" class="bloc-oui" />
          <text x="242" y="48" class="mot-oui">amiante</text>
          <rect x="178" y="58" width="128" height="20" rx="3" class="bloc-oui" />
          <text x="242" y="72" class="mot-oui">plomb</text>
          <rect x="178" y="82" width="128" height="20" rx="3" class="bloc-oui" />
          <text x="242" y="96" class="mot-oui">électricité</text>
          <text x="242" y="118" class="mot">…et les autres</text>
        </g>
      </svg>`
  },

  'qui-paie': {
    legende:
      'Le vendeur commande et paie les diagnostics ; l’acheteur les reçoit avec la promesse de vente.',
    svg: `
      <svg viewBox="0 0 320 126" role="img">
        <g>
          <circle cx="46" cy="34" r="13" class="silhouette" />
          <path d="M46 48v22M32 84l14-14 14 14" class="silhouette" />
          <text x="46" y="106" class="mot-fort">le vendeur</text>
          <text x="46" y="120" class="mot">il paie</text>
        </g>

        <rect x="118" y="22" width="84" height="56" rx="3" class="feuille" />
        <path d="M132 38h56M132 50h56M132 62h34" class="ligne-texte" />
        <path d="M206 50 h34 m-10 -7 l10 7 -10 7" class="fleche" />

        <g>
          <circle cx="274" cy="34" r="13" class="silhouette" />
          <path d="M274 48v22M260 84l14-14 14 14" class="silhouette" />
          <text x="274" y="106" class="mot-fort">l’acheteur</text>
          <text x="274" y="120" class="mot">il reçoit</text>
        </g>
      </svg>`
  },

  'visible-ferme': {
    legende:
      'Le diagnostiqueur contrôle ce qui est visible et accessible ; ce qui est fermé ou encombré n’est pas contrôlé.',
    svg: `
      <svg viewBox="0 0 320 120" role="img">
        <rect x="10" y="14" width="146" height="86" rx="4" class="bloc-oui" />
        <circle cx="58" cy="48" r="11" class="oeil" />
        <circle cx="58" cy="48" r="4" class="pupille" />
        <path d="M40 48q18 -16 36 0q-18 16 -36 0" class="oeil" />
        <text x="83" y="82" class="mot-oui">vu, contrôlé</text>

        <rect x="164" y="14" width="146" height="86" rx="4" class="bloc-non" />
        <rect x="204" y="34" width="66" height="40" rx="3" class="meuble" />
        <path d="M196 26 l82 60" class="barre-non" />
        <text x="237" y="82" class="mot-non">non vu</text>
        <text x="160" y="116" class="mot">derrière un meuble, un mur, un plancher</text>
      </svg>`
  },

  'certifie': {
    legende:
      'Le diagnostiqueur doit être certifié par un organisme accrédité, assuré, et indépendant de l’agence comme de l’artisan.',
    svg: `
      <svg viewBox="0 0 320 118" role="img">
        <g>
          <rect x="18" y="16" width="80" height="62" rx="4" class="bloc-oui" />
          <path d="M58 32 l7 14 15 2 -11 11 3 15 -14 -8 -14 8 3 -15 -11 -11 15 -2z" class="etoile" />
          <text x="58" y="96" class="mot-oui">certifié</text>
          <text x="58" y="110" class="mot">par un organisme</text>
        </g>
        <g>
          <rect x="120" y="16" width="80" height="62" rx="4" class="bloc-oui" />
          <path d="M160 30 l24 10v14c0 12-10 20-24 24-14-4-24-12-24-24V40z" class="bouclier" />
          <text x="160" y="96" class="mot-oui">assuré</text>
          <text x="160" y="110" class="mot">pour cette mission</text>
        </g>
        <g>
          <rect x="222" y="16" width="80" height="62" rx="4" class="bloc-oui" />
          <path d="M246 47h32M262 31v32" class="croix-lien" />
          <circle cx="262" cy="47" r="19" class="cercle-lien" />
          <path d="M248 33 l28 28" class="barre-non" />
          <text x="262" y="96" class="mot-oui">indépendant</text>
          <text x="262" y="110" class="mot">ni agence, ni artisan</text>
        </g>
      </svg>`
  },

  /* -------------------------------------------------------------------- DPE */

  etiquette: {
    legende:
      'L’étiquette énergie du DPE : sept classes, de A pour le logement le plus sobre à G pour le plus gourmand.',
    svg: echelle()
  },

  'etiquette-passoire': {
    legende:
      'Les classes F et G sont celles qu’on appelle passoires thermiques ; elles concentrent les obligations.',
    svg: echelle('G')
  },

  'deux-etiquettes': {
    legende:
      'Le DPE porte deux notes : l’énergie consommée et les gaz à effet de serre émis. C’est la moins bonne des deux qui devient la classe du logement.',
    svg: (() => {
      const lettres = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      // Une colonne par étiquette, la ligne visée entourée d'un cadre noir.
      const colonne = (x: number, titre: string, vise: number): string => `
        <text x="${x}" y="20" class="planche-titre">${titre}</text>
        ${lettres
          .map(
            (l, i) =>
              `<rect x="${x}" y="${30 + i * 13}" width="${28 + i * 14}" height="10" rx="1.5" fill="${ETQ[l]}" />`
          )
          .join('')}
        <rect x="${x - 4}" y="${30 + vise * 13 - 3}" width="128" height="16" rx="2" class="cadre-vise" />
        <text x="${x + 62}" y="24" class="mot-fort-noir">${lettres[vise]}</text>`;

      return `
      <svg viewBox="0 0 320 142" class="planche" role="img">
        <rect x="0" y="0" width="320" height="142" rx="3" fill="#ffffff" />
        ${colonne(18, 'énergie', 3)}
        ${colonne(180, 'climat', 5)}
        <text x="160" y="136" class="mot-fort-noir">la moins bonne des deux l’emporte : classé F</text>
      </svg>`;
    })()
  },

  'primaire-finale': {
    legende:
      'Le DPE compte l’énergie primaire : pour l’électricité, un kilowattheure au compteur en vaut 1,9 à la source depuis 2026.',
    svg: `
      <svg viewBox="0 0 320 112" role="img">
        <g>
          <rect x="10" y="26" width="86" height="48" rx="4" class="bloc-non" />
          <text x="53" y="48" class="mot-non">à la source</text>
          <text x="53" y="64" class="mot-mesure">1,9</text>
          <text x="53" y="98" class="mot">centrale, réseau</text>
        </g>

        <path d="M104 50 h32 m-10 -7 l10 7 -10 7" class="fleche" />
        <text x="120" y="38" class="mot-petit">pertes</text>

        <g>
          <rect x="144" y="26" width="86" height="48" rx="4" class="bloc-oui" />
          <text x="187" y="48" class="mot-oui">au compteur</text>
          <text x="187" y="64" class="mot-mesure">1</text>
          <text x="187" y="98" class="mot">ce que vous payez</text>
        </g>

        <path d="M238 50 h32 m-10 -7 l10 7 -10 7" class="fleche" />
        <g>
          <rect x="278" y="26" width="34" height="48" rx="4" class="bloc" />
          <path d="M287 58 l10 -18 -6 0 6 -12" class="eclair" />
          <text x="295" y="98" class="mot">chez vous</text>
        </g>
      </svg>`
  },

  'cinq-postes': {
    legende:
      'Le DPE compte cinq usages du logement — pas l’électroménager, pas la télévision, pas la recharge d’une voiture.',
    svg: `
      <svg viewBox="0 0 320 122" role="img">
        ${['chauffage', 'eau chaude', 'clim', 'éclairage', 'ventilation']
          .map(
            (u, i) => `
          <g>
            <rect x="${8 + i * 62}" y="14" width="56" height="34" rx="4" class="bloc-oui" />
            <text x="${36 + i * 62}" y="35" class="mot-oui-petit">${u}</text>
          </g>`
          )
          .join('')}
        <text x="160" y="64" class="mot-fort">comptés par le DPE</text>

        ${['électroménager', 'télé, box, ordinateur', 'voiture électrique']
          .map(
            (u, i) => `
          <g>
            <rect x="${8 + i * 104}" y="76" width="96" height="30" rx="4" class="bloc-non" />
            <text x="${56 + i * 104}" y="95" class="mot-non-petit">${u}</text>
          </g>`
          )
          .join('')}
        <text x="160" y="120" class="mot">jamais comptés — votre facture sera plus élevée</text>
      </svg>`
  },

  'calendrier-location': {
    legende:
      'Le calendrier de la loi Climat et Résilience : les logements les plus gourmands sortent de la location les uns après les autres.',
    svg: `
      <svg viewBox="0 0 320 116" role="img">
        <path d="M14 76 H306" class="axe" />
        ${[
          { an: '2025', l: 'G', x: 62 },
          { an: '2028', l: 'F', x: 160 },
          { an: '2034', l: 'E', x: 258 }
        ]
          .map(
            (e) => `
          <g>
            <circle cx="${e.x}" cy="76" r="5" class="borne" />
            <rect x="${e.x - 26}" y="26" width="52" height="34" rx="4" class="bloc-non" />
            <text x="${e.x}" y="50" class="mot-non-gros">${e.l}</text>
            <text x="${e.x}" y="96" class="mot-mesure">1ᵉʳ janv. ${e.an}</text>
            <text x="${e.x}" y="110" class="mot-petit">plus louable</text>
          </g>`
          )
          .join('')}
      </svg>`
  },

  'dpe-opposable': {
    legende:
      'Depuis 2021 le DPE est opposable : son résultat engage, il ne se lit plus comme une simple information.',
    svg: `
      <svg viewBox="0 0 320 108" role="img">
        <g>
          <rect x="14" y="18" width="122" height="62" rx="4" class="bloc" />
          <path d="M32 38h86M32 52h86M32 66h52" class="ligne-texte" />
          <text x="75" y="100" class="mot">avant : pour information</text>
        </g>

        <path d="M146 50 h28 m-9 -7 l9 7 -9 7" class="fleche" />

        <g>
          <rect x="184" y="18" width="122" height="62" rx="4" class="bloc-oui" />
          <path d="M202 38h86M202 52h86M202 66h52" class="ligne-texte" />
          <path d="M266 62 l24 10v10c0 9-8 15-24 19-16-4-24-10-24-19V72z" class="bouclier" />
          <text x="245" y="100" class="mot-oui">aujourd’hui : opposable</text>
        </g>
      </svg>`
  },

  /* --------------------------------------------------------- dates et durée */

  'dates-construction': {
    legende:
      'La date de construction commande deux diagnostics : le plomb avant 1949, l’amiante avant juillet 1997.',
    svg: `
      <svg viewBox="0 0 320 118" role="img">
        <path d="M12 82 H308" class="axe" />

        <rect x="12" y="26" width="96" height="42" rx="4" class="bloc-non" />
        <text x="60" y="44" class="mot-non">plomb</text>
        <text x="60" y="60" class="mot-non">+ amiante</text>
        <text x="60" y="100" class="mot-mesure">avant 1949</text>

        <rect x="114" y="26" width="96" height="42" rx="4" class="bloc-non" />
        <text x="162" y="52" class="mot-non">amiante</text>
        <text x="162" y="100" class="mot-mesure">1949 → 1997</text>

        <rect x="216" y="26" width="92" height="42" rx="4" class="bloc-oui" />
        <text x="262" y="52" class="mot-oui">ni l’un ni l’autre</text>
        <text x="262" y="100" class="mot-mesure">après juil. 1997</text>

        <circle cx="12" cy="82" r="4" class="borne" />
        <circle cx="111" cy="82" r="4" class="borne" />
        <circle cx="213" cy="82" r="4" class="borne" />
        <text x="160" y="116" class="mot-petit">date du permis de construire, pas date d’achat</text>
      </svg>`
  },

  'validite-depart': {
    legende:
      'La validité d’un diagnostic court à partir du jour de la visite, pas du jour où le rapport arrive.',
    svg: `
      <svg viewBox="0 0 320 96" role="img">
        <path d="M20 54 H300" class="axe" />
        <rect x="20" y="44" width="212" height="20" rx="10" class="periode-valide" />
        <rect x="232" y="44" width="68" height="20" rx="10" class="periode-perimee" />

        <circle cx="20" cy="54" r="6" class="borne-forte" />
        <text x="42" y="38" class="mot-fort">la visite</text>
        <text x="52" y="86" class="mot-petit">le point de départ</text>

        <circle cx="58" cy="54" r="4" class="borne" />
        <text x="150" y="18" class="mot-petit">le rapport arrive quelques jours plus tard</text>

        <circle cx="232" cy="54" r="5" class="borne" />
        <text x="266" y="34" class="mot-non">périmé</text>
      </svg>`
  },

  /* ---------------------------------------------------------- électricité */

  'six-points': {
    /*
     * Les six domaines de l'arrêté du 28 septembre 2017, dans son ordre.
     *
     * Le dessin précédent en omettait un — les matériels présentant un risque
     * de contact direct — et donnait le différentiel et la terre comme deux
     * domaines, alors que l'arrêté les réunit. Le compte tombait juste par
     * compensation, ce qui est la pire façon d'avoir tort.
     */
    legende:
      'Le diagnostic électrique conclut sur six domaines : la coupure, le différentiel et la terre, les protections par circuit, la salle d’eau, les pièces sous tension accessibles et le matériel vétuste.',
    svg: `
      <svg viewBox="0 0 320 190" role="img">
        ${[
          { t: 'appareil de coupure', d: 'couper toute l’installation' },
          { t: 'différentiel et terre', d: 'ils protègent les personnes' },
          { t: 'protection par circuit', d: 'les fils ne chauffent pas' },
          { t: 'salle d’eau', d: 'l’eau et le courant' },
          { t: 'pièces accessibles', d: 'rien de nu sous tension' },
          { t: 'matériel vétuste', d: 'prises cassées, fils abîmés' }
        ]
          .map((p, i) => {
            const x = 6 + (i % 2) * 156;
            const y = 8 + Math.floor(i / 2) * 62;
            return `
          <g>
            <rect x="${x}" y="${y}" width="152" height="50" rx="4" class="bloc" />
            <text x="${x + 76}" y="${y + 21}" class="mot-fort-petit">${p.t}</text>
            <text x="${x + 76}" y="${y + 38}" class="mot-petit">${p.d}</text>
          </g>`;
          })
          .join('')}
      </svg>`
  },

  differentiel: {
    legende:
      'Le différentiel compare le courant qui part et celui qui revient : dès qu’il en manque, il coupe — avant que le corps soit touché.',
    svg: `
      <svg viewBox="0 0 320 120" role="img">
        <rect x="18" y="26" width="66" height="52" rx="4" class="bloc-oui" />
        <rect x="30" y="38" width="42" height="12" rx="2" class="interrupteur" />
        <text x="51" y="98" class="mot-oui">différentiel</text>

        <path d="M84 42 H196" class="fil-aller" />
        <path d="M84 62 H150" class="fil-retour" />
        <text x="140" y="34" class="mot-petit">ce qui part</text>
        <text x="112" y="78" class="mot-petit">ce qui revient</text>

        <path d="M150 62 q22 22 40 26" class="fuite" />
        <circle cx="234" cy="52" r="12" class="silhouette" />
        <path d="M234 64v22M222 100l12-14 12 14" class="silhouette" />
        <text x="180" y="116" class="mot-non">il manque du courant → ça coupe</text>
      </svg>`
  },

  /* ------------------------------------------------------------------- gaz */

  'monoxyde': {
    legende:
      'Une flamme qui manque d’air fabrique du monoxyde de carbone : invisible, inodore, et mortel. La grille d’aération est ce qui l’empêche.',
    svg: `
      <svg viewBox="0 0 320 120" role="img">
        <rect x="14" y="18" width="130" height="76" rx="4" class="bloc-oui" />
        <path d="M22 44 h30 m-8 -6 l8 6 -8 6" class="air-neuf" />
        <rect x="14" y="36" width="8" height="18" rx="2" class="grille" />
        <path d="M96 70 q-12 -16 0 -26 q10 12 0 26z" class="flamme-ok" />
        <text x="79" y="112" class="mot-oui">grille libre : la flamme respire</text>

        <rect x="176" y="18" width="130" height="76" rx="4" class="bloc-non" />
        <rect x="176" y="36" width="8" height="18" rx="2" class="grille-bouchee" />
        <path d="M170 30 l22 30" class="barre-non" />
        <path d="M258 70 q-12 -16 0 -26 q10 12 0 26z" class="flamme-non" />
        <path d="M258 40 q-6 -10 0 -14M268 40 q-6 -10 0 -14M248 40 q-6 -10 0 -14" class="fumee" />
        <text x="241" y="112" class="mot-non">grille bouchée : monoxyde</text>
      </svg>`
  },

  /* --------------------------------------------------------------- amiante */

  'amiante-etat': {
    legende:
      'Une plaque d’amiante-ciment intacte ne libère rien. C’est la percer, la scier ou la casser qui met les fibres en l’air.',
    svg: `
      <svg viewBox="0 0 320 126" role="img">
        <g>
          <path d="M22 74 L82 40 L142 74 L82 108 Z" class="bloc-oui" />
          <path d="M40 74 L82 50 M62 86 L104 62" class="nervure" />
          <text x="82" y="30" class="mot-oui">intacte</text>
          <text x="82" y="120" class="mot-petit">on ne touche pas, on surveille</text>
        </g>
        <g>
          <path d="M178 74 L238 40 L298 74 L238 108 Z" class="bloc-non" />
          <path d="M238 40 L228 74 L246 92" class="fissure" />
          ${[
            [214, 34],
            [252, 28],
            [270, 44],
            [200, 50],
            [262, 60]
          ]
            .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" class="fibre" />`)
            .join('')}
          <text x="238" y="24" class="mot-non">percée, sciée</text>
          <text x="238" y="120" class="mot-petit">les fibres partent dans l’air</text>
        </g>
      </svg>`
  },

  'amiante-listes': {
    legende:
      'Trois listes d’amiante : A les matériaux friables, B ceux qui sont stables tant qu’on n’y touche pas, C ceux qu’on ne cherche qu’avant démolition.',
    svg: `
      <svg viewBox="0 0 320 116" role="img">
        <g>
          <rect x="10" y="14" width="94" height="66" rx="4" class="bloc-non" />
          <text x="57" y="42" class="lettre-liste-non">A</text>
          <text x="57" y="62" class="mot-non-petit">flocages</text>
          <text x="57" y="98" class="mot-petit">friables</text>
        </g>
        <g>
          <rect x="112" y="14" width="94" height="66" rx="4" class="bloc-attention" />
          <text x="159" y="42" class="lettre-liste">B</text>
          <text x="159" y="62" class="mot-petit">toiture, dalles</text>
          <text x="159" y="98" class="mot-petit">stables si intacts</text>
        </g>
        <g>
          <rect x="214" y="14" width="94" height="66" rx="4" class="bloc" />
          <text x="261" y="42" class="lettre-liste">C</text>
          <text x="261" y="62" class="mot-petit">dans les murs</text>
          <text x="261" y="98" class="mot-petit">avant démolition</text>
        </g>
      </svg>`
  },

  /* ----------------------------------------------------------------- plomb */

  'plomb-classes': {
    legende:
      'Quatre classes pour une peinture au plomb. Seule la classe 3 — la peinture dégradée, celle qui fait de la poussière — oblige à agir.',
    svg: `
      <svg viewBox="0 0 320 112" role="img">
        ${[
          { n: '0', t: 'pas de plomb' },
          { n: '1', t: 'intacte' },
          { n: '2', t: 'usée' }
        ]
          .map(
            (c, i) => `
          <g>
            <rect x="${10 + i * 76}" y="16" width="68" height="52" rx="4" class="bloc-oui" />
            <text x="${44 + i * 76}" y="48" class="chiffre-oui">${c.n}</text>
            <text x="${44 + i * 76}" y="84" class="mot-petit">${c.t}</text>
          </g>`
          )
          .join('')}
        <g>
          <rect x="238" y="16" width="70" height="52" rx="4" class="bloc-non" />
          <text x="273" y="48" class="chiffre-non">3</text>
          <path d="M256 62 l6 -6 4 6 5 -8" class="ecaille" />
          <text x="273" y="84" class="mot-non-petit">dégradée</text>
        </g>
        <text x="160" y="106" class="mot">seule la classe 3 oblige à faire des travaux</text>
      </svg>`
  },

  /* -------------------------------------------------------------- termites */

  cordonnet: {
    legende:
      'Les termites vivent dans le sol et fuient la lumière : ils montent vers le bois par un petit tunnel de terre collé au mur, le cordonnet.',
    svg: `
      <svg viewBox="0 0 320 124" role="img">
        <path d="M20 96 H300" class="sol-trait" />
        ${Array.from({ length: 16 }, (_, i) => `<path d="M${26 + i * 17} 96 l-7 9" class="hachure" />`).join('')}

        <rect x="120" y="14" width="26" height="82" class="mur" />
        <rect x="146" y="18" width="86" height="22" rx="2" class="poutre" />
        <path d="M158 22 q10 8 22 0 q10 8 22 0" class="galerie" />

        <path d="M133 96 V44" class="cordonnet-trait" />
        <text x="76" y="52" class="mot-fort">cordonnet</text>
        <path d="M104 48 h22" class="filet-legende" />

        <text x="240" y="60" class="mot-petit">le bois : leur repas</text>
        <text x="70" y="118" class="mot-petit">la colonie vit dans le sol</text>
      </svg>`
  },

  /* --------------------------------------------------------------- risques */

  'erp-couches': {
    legende:
      'L’état des risques ne mesure rien dans le logement : il recopie ce que l’État a cartographié à cette adresse — inondation, argile, radon, séisme, pollution.',
    svg: `
      <svg viewBox="0 0 320 124" role="img">
        ${[
          { t: 'inondation', y: 10 },
          { t: 'argile (retrait-gonflement)', y: 34 },
          { t: 'radon', y: 58 },
          { t: 'séisme', y: 82 }
        ]
          .map(
            (c) => `
          <g>
            <rect x="10" y="${c.y}" width="176" height="20" rx="3" class="couche" />
            <text x="98" y="${c.y + 14}" class="mot-petit">${c.t}</text>
          </g>`
          )
          .join('')}

        <path d="M192 56 h26 m-8 -6 l8 6 -8 6" class="fleche" />

        <g>
          <path d="M244 74 L274 50 L304 74 Z" class="toit-mini" />
          <rect x="254" y="74" width="40" height="28" class="maison-mini" />
          <circle cx="274" cy="88" r="3" class="point-adresse" />
          <text x="274" y="118" class="mot-fort">votre adresse</text>
        </g>
      </svg>`
  },

  /* -------------------------------------------------------------- surfaces */

  'carrez-hauteur': {
    legende:
      'La loi Carrez ne compte que la surface où l’on tient debout : sous 1,80 mètre de hauteur, le plancher ne compte pas.',
    svg: `
      <svg viewBox="0 0 320 128" role="img">
        <path d="M40 100 H290" class="sol-trait" />
        <path d="M40 100 V44 L206 12 L290 44 V100" class="coupe-combles" />
        <path d="M112 100 V32" class="trait-seuil" />

        <rect x="112" y="52" width="178" height="48" class="zone-oui" />
        <text x="200" y="80" class="mot-oui">compté</text>

        <path d="M40 100 L112 100 L112 58 Z" class="zone-non" />
        <text x="72" y="92" class="mot-non-petit">non compté</text>

        <g>
          <path d="M100 100 V52 M95 100 h10 M95 52 h10" class="cote" />
          <text x="82" y="44" class="mot-mesure">1,80 m</text>
        </g>
        <text x="160" y="124" class="mot-petit">la hauteur décide, pas la pièce</text>
      </svg>`
  },

  'carrez-vs-habitable': {
    legende:
      'Deux surfaces, deux règles : la loi Carrez sert à vendre un lot de copropriété, la surface habitable sert à louer. Elles ne comptent pas la même chose.',
    svg: `
      <svg viewBox="0 0 320 132" role="img">
        <g>
          <rect x="10" y="14" width="140" height="72" rx="4" class="bloc-oui" />
          <text x="80" y="36" class="mot-fort">loi Carrez</text>
          <text x="80" y="54" class="mot-petit">pour vendre</text>
          <text x="80" y="70" class="mot-petit">en copropriété</text>
          <text x="80" y="104" class="mot-petit">compte : véranda close,</text>
          <text x="80" y="118" class="mot-petit">cave aménagée hors sous-sol</text>
        </g>
        <g>
          <rect x="170" y="14" width="140" height="72" rx="4" class="bloc-oui" />
          <text x="240" y="36" class="mot-fort">surface habitable</text>
          <text x="240" y="54" class="mot-petit">pour louer</text>
          <text x="240" y="70" class="mot-petit">(dite loi Boutin)</text>
          <text x="240" y="104" class="mot-petit">ne compte pas : balcon,</text>
          <text x="240" y="118" class="mot-petit">terrasse, cave, garage</text>
        </g>
      </svg>`
  },

  /* -------------------------------------------------------- assainissement */

  assainissement: {
    legende:
      'Sans tout-à-l’égout, les eaux usées passent par une fosse toutes eaux puis s’épurent dans le sol du terrain. Le contrôle porte sur cette chaîne.',
    svg: `
      <svg viewBox="0 0 320 118" role="img">
        <path d="M10 46 H300" class="sol-trait" />
        ${Array.from({ length: 17 }, (_, i) => `<path d="M${16 + i * 17} 46 l-7 9" class="hachure" />`).join('')}

        <path d="M22 46 V26 L52 8 L82 26 V46" class="maison-mini" />
        <path d="M82 36 H108" class="tuyau-eau" />

        <rect x="108" y="56" width="66" height="34" rx="4" class="cuve" />
        <path d="M114 68 q14 6 28 0 q14 -6 26 0" class="niveau-eau" />
        <text x="141" y="106" class="mot-petit">fosse toutes eaux</text>

        <path d="M174 72 H206" class="tuyau-eau" />
        ${[0, 1, 2].map((i) => `<path d="M206 ${62 + i * 12} H288" class="drain" />`).join('')}
        <text x="248" y="106" class="mot-petit">épandage dans le sol</text>
      </svg>`
  },

  /* ---------------------------------------------------------- après-vente */

  'anomalie-pas-interdiction': {
    legende:
      'Une anomalie dans un rapport n’interdit ni de vendre ni d’habiter : elle informe l’acheteur, qui décide en connaissance de cause.',
    svg: `
      <svg viewBox="0 0 320 122" role="img">
        <g>
          <rect x="12" y="18" width="128" height="60" rx="4" class="bloc-attention" />
          <path d="M76 34 l16 28 H60z" class="triangle-attention" />
          <text x="76" y="58" class="mot-attention">anomalie</text>
          <text x="76" y="96" class="mot-petit">le rapport la signale</text>
        </g>

        <path d="M150 48 h26 m-8 -6 l8 6 -8 6" class="fleche" />

        <g>
          <rect x="186" y="18" width="122" height="60" rx="4" class="bloc-oui" />
          <text x="247" y="42" class="mot-oui">la vente reste possible</text>
          <text x="247" y="62" class="mot-petit">l’acheteur sait, et négocie</text>
        </g>

        <text x="160" y="116" class="mot-petit">sauf danger immédiat sur le gaz : coupure le jour même</text>
      </svg>`
  },

  /* ------------------------------------------------------------------ prix */

  prix: {
    legende:
      'Un diagnostic commandé seul porte tout le déplacement. Groupés dans une même visite, ils le partagent — c’est ce qui fait l’écart entre deux devis.',
    svg: `
      <svg viewBox="0 0 320 138" role="img">
        <g>
          <path d="M18 62 L48 38 L78 62" class="toit-mini" />
          <rect x="26" y="62" width="44" height="34" class="maison-mini" />
          <rect x="88" y="52" width="26" height="34" rx="2" class="feuille" />
          <path d="M94 62h14M94 70h14M94 78h8" class="ligne-texte" />
          <path d="M48 104 v14" class="fleche" />
          <rect x="12" y="118" width="72" height="3" class="barre-cout" />
          <text x="66" y="132" class="mot-non-petit">un seul rapport</text>
        </g>

        <path d="M140 74 H166" class="fleche" />

        <g>
          <path d="M186 62 L216 38 L246 62" class="toit-mini" />
          <rect x="194" y="62" width="44" height="34" class="maison-mini" />
          ${[0, 1, 2, 3, 4, 5]
            .map(
              (i) =>
                `<rect x="${256 + (i % 3) * 20}" y="${44 + Math.floor(i / 3) * 26}" width="16" height="22" rx="2" class="feuille" />`
            )
            .join('')}
          <path d="M216 104 v14" class="fleche" />
          <rect x="180" y="118" width="72" height="3" class="barre-cout" />
          <text x="240" y="132" class="mot-oui-petit">six rapports, une visite</text>
        </g>
      </svg>`
  },

  /* ------------------------------------------------------- aux normes ou sûr */

  'sur-ou-aux-normes': {
    legende:
      'La loi exige une installation sûre, pas une installation conforme aux règles d’aujourd’hui. Ce qui est aux normes est sûr ; l’inverse n’est pas vrai.',
    svg: `
      <svg viewBox="0 0 320 138" role="img">
        <ellipse cx="160" cy="66" rx="146" ry="56" class="bloc-oui" />
        <text x="160" y="26" class="mot-oui">SÛR — ce que la loi demande</text>

        <ellipse cx="160" cy="78" rx="76" ry="34" class="bloc" />
        <text x="160" y="74" class="mot-fort-petit">AUX NORMES</text>
        <text x="160" y="90" class="mot-petit">les règles du neuf</text>

        <text x="62" y="112" class="mot-petit">ancien mais sûr</text>
        <text x="258" y="112" class="mot-petit">ancien mais sûr</text>
        <text x="160" y="134" class="mot">le diagnostic mesure le grand cercle, pas le petit</text>
      </svg>`
  },

  /* --------------------------------------------------------------- l'audit */

  'audit-parcours': {
    legende:
      'Le DPE constate l’état du logement. L’audit, lui, chiffre un parcours de travaux en étapes — et l’ordre des étapes compte autant que la liste.',
    svg: `
      <svg viewBox="0 0 320 140" role="img">
        <g>
          <rect x="10" y="70" width="82" height="46" rx="4" class="bloc" />
          <text x="51" y="90" class="mot-fort-petit">le DPE</text>
          <text x="51" y="106" class="mot-petit">il constate</text>
          <text x="51" y="132" class="mot-petit">où vous en êtes</text>
        </g>

        <path d="M100 92 h20 m-7 -6 l7 6 -7 6" class="fleche" />

        <g>
          <rect x="128" y="86" width="80" height="30" rx="4" class="bloc-oui" />
          <text x="168" y="106" class="mot-oui-petit">étape 1</text>
          <rect x="216" y="46" width="80" height="30" rx="4" class="bloc-oui" />
          <text x="256" y="66" class="mot-oui-petit">étape 2</text>
          <path d="M208 92 h4 v-30 h4 m-6 -6 l6 6 -6 6" class="fleche" />
          <text x="168" y="132" class="mot-petit">l’audit chiffre le chemin</text>
          <text x="256" y="34" class="mot-petit">et son ordre</text>
        </g>
      </svg>`
  },

  /* --------------------------------------------------------------- argiles */

  argiles: {
    legende:
      'Un sol argileux gonfle quand il pleut et se rétracte quand il fait sec. La maison posée dessus bouge avec lui, et se fissure en escalier depuis les angles des ouvertures.',
    svg: `
      <svg viewBox="0 0 320 142" role="img">
        <g>
          <path d="M18 92 L58 62 L98 92" class="toit-mini" />
          <rect x="28" y="92" width="60" height="34" class="maison-mini" />
          <rect x="16" y="126" width="84" height="14" class="sol-gonfle" />
          <path d="M24 132 q10 -6 20 0 q10 6 20 0 q10 -6 20 0" class="niveau-eau" />
          <text x="58" y="46" class="mot-oui-petit">il pleut</text>
          <text x="58" y="34" class="mot-petit">le sol gonfle</text>
        </g>

        <path d="M118 100 h24 m-8 -6 l8 6 -8 6" class="fleche" />
        <path d="M202 100 h24 m-8 -6 l8 6 -8 6" class="fleche" />
        <text x="172" y="120" class="mot-petit">au fil des saisons</text>

        <g>
          <path d="M238 92 L278 62 L318 92" class="toit-mini" />
          <rect x="248" y="92" width="60" height="34" class="maison-mini" />
          <path d="M268 92 l6 8 -6 8 6 8 -6 8" class="fissure" />
          <rect x="236" y="126" width="84" height="9" class="sol-retracte" />
          ${[0, 1, 2, 3, 4]
            .map((i) => `<path d="M${246 + i * 17} 126 v9" class="fente" />`)
            .join('')}
          <text x="278" y="46" class="mot-non-petit">il fait sec</text>
          <text x="278" y="34" class="mot-petit">le sol se rétracte</text>
        </g>
      </svg>`
  },

  contester: {
    legende:
      'Contester un diagnostic se fait en trois temps : on écrit au diagnostiqueur, on fait faire une contre-expertise, puis on saisit le tribunal si rien ne bouge.',
    svg: `
      <svg viewBox="0 0 320 112" role="img">
        ${[
          { t: 'écrire', d: 'en recommandé' },
          { t: 'contre-expertise', d: 'un autre certifié' },
          { t: 'tribunal', d: 'si rien ne bouge' }
        ]
          .map((e, i) => {
            const x = 8 + i * 106;
            return `
          <g>
            <rect x="${x}" y="20" width="94" height="56" rx="4" class="${i === 2 ? 'bloc' : 'bloc-oui'}" />
            <text x="${x + 47}" y="44" class="mot-fort-petit">${e.t}</text>
            <text x="${x + 47}" y="62" class="mot-petit">${e.d}</text>
            ${i < 2 ? `<path d="M${x + 96} 48 h8 m-4 -4 l4 4 -4 4" class="fleche" />` : ''}
          </g>`;
          })
          .join('')}
        <text x="160" y="104" class="mot-petit">le diagnostiqueur répond de son rapport, et il est assuré pour ça</text>
      </svg>`
  }
};

export const dessin = (id: string | undefined): Dessin | undefined =>
  id === undefined ? undefined : DESSINS[id];
