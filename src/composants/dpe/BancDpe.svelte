<script lang="ts">
  /**
   * LE BANC DE L'ÉCRAN DU DPE — développement seulement.
   *
   * Servi par `dpe.html`. Il n'entre pas dans l'application : il existe pour
   * qu'on puisse voir les cas extrêmes côte à côte sans attendre de tomber sur
   * le bon dossier — et pour qu'on puisse figer l'heure au lieu de revenir à
   * 7 h du matin.
   *
   * LES QUATRE DOSSIERS SONT DES DOUBLURES, PAS DES RAPPORTS. Aucun n'est un
   * dossier réel, et aucun chiffre n'en sort. Leurs FORMES, en revanche, sont
   * celles du corpus mesuré : classe C ou D neuf fois sur dix, une paroi
   * inconnue dans vingt-trois DPE sur trente-trois, plancher bas inconnu ou nu
   * dans trente-deux sur trente-trois.
   */
  import type { Diagnostic } from '../../lib/modele';
  import { MOMENTS } from '../lumiere/heure';
  import EcranDpe from './EcranDpe.svelte';

  let heure = $state(18);
  let cas = $state(0);

  const commun = {
    type: 'dpe' as const,
    titre: 'Performance énergétique (DPE)',
    explication: [
      "Le DPE mesure deux choses : l'énergie que le logement consomme pour cinq usages (chauffage, eau chaude, climatisation, éclairage, ventilation) et le CO₂ qu'il émet. Chacune donne une lettre ; la lettre affichée sur l'annonce est la moins bonne des deux.",
      "Ces chiffres ne dépendent pas de vos habitudes : ils décrivent le bâtiment (isolation, fenêtres, chauffage) pour un usage standardisé. C'est ce qui permet de comparer deux logements entre eux."
    ],
    aFaire: [
      'Vérifiez la surface et l’année de construction saisies : c’est là que se logent la plupart des erreurs.',
      'Demandez le descriptif détaillé du logement, page par page, au diagnostiqueur.'
    ],
    pages: [4, 11] as [number, number],
    date: '12/03/2024'
  };

  /* Le cas nominal du corpus : classe C, trois parois connues sur quatre. */
  const nominal: Diagnostic = {
    ...commun,
    verdict:
      'Ce logement est classé C : sa consommation est correcte, et la lettre n’interdit rien à la location.',
    gravite: 'bon',
    analogie:
      'Un logement, c’est une bouteille thermos. Plus elle est étanche, moins vous avez besoin de rallumer le chauffage. La lettre du DPE, c’est la note de votre thermos.',
    faits: [
      { libelle: 'Surface de référence', valeur: '72,4 m²' },
      { libelle: 'Année de construction', valeur: '1974' },
      {
        libelle: 'Consommation annuelle',
        valeur: '9 838 kWh',
        precision: 'chauffage, eau chaude, clim, éclairage, ventilation'
      },
      { libelle: 'Émissions', valeur: '1 232 kg CO₂/an' },
      {
        libelle: 'Coût annuel estimé',
        valeur: 'entre 890 € et 1 240 €',
        precision: 'usage standard, prix moyens des énergies'
      },
      {
        libelle: 'Par où la chaleur s’en va',
        valeur: 'les murs',
        precision: 'la toiture et les fenêtres : le rapport les décrit isolés'
      },
      { libelle: 'Établi le', valeur: '12/03/2024' },
      { libelle: 'Valable jusqu’au', valeur: '11/03/2034' },
      { libelle: 'N° ADEME', valeur: '2374E1234567X' }
    ],
    schema: {
      genre: 'dpe',
      energie: { lettre: 'C', valeur: 136, unite: 'kWh/m²/an', recalculee: true },
      climat: { lettre: 'C', valeur: 17, unite: 'kg CO₂/m²/an', recalculee: true },
      finale: 'C',
      postes: [
        { nom: 'chauffage', kwh: 5558, cout: 'entre 450 € et 610 €' },
        { nom: 'eau chaude', kwh: 3443, cout: 'entre 300 € et 420 €' },
        { nom: 'éclairage', kwh: 207 },
        { nom: 'auxiliaires', kwh: 630 }
      ],
      isolation: { toit: 'isole', murs: 'nonIsole', fenetres: 'isole', plancher: 'inconnu' }
    },
    travaux: [
      {
        rang: 1,
        intitule: 'Les travaux essentiels',
        cout: { de: 12000, a: 18000, statut: 'RAPPORT' },
        recommandations: [
          {
            lot: 'Murs',
            description: 'Isolation des murs par l’intérieur',
            performance: 'R ≥ 3,7 m².K/W',
            statut: 'RAPPORT'
          },
          {
            lot: 'Ventilation',
            description: 'Mise en place d’une ventilation mécanique simple flux hygroréglable',
            statut: 'RAPPORT'
          }
        ]
      }
    ]
  };

  /* Le cas lourd : la lumière se retire. Zéro F et zéro G sur les 77 DPE du
     corpus mesuré — c'est un cas rare, pas un cas impossible, et il doit être
     le plus tenu des quatre. */
  const lourd: Diagnostic = {
    ...commun,
    verdict:
      'Ce logement est classé G. Depuis le 1ᵉʳ janvier 2025, un logement classé G ne peut plus être mis en location.',
    gravite: 'alerte',
    analogie:
      'Un logement, c’est une bouteille thermos. Une bonne thermos garde le café chaud toute la journée. Celle-ci, c’est plutôt une casserole sans couvercle : vous chauffez, et ça part au plafond.',
    faits: [
      { libelle: 'Surface de référence', valeur: '38,2 m²' },
      { libelle: 'Année de construction', valeur: 'Avant 1948' },
      {
        libelle: 'Coût annuel estimé',
        valeur: 'entre 2 140 € et 2 930 €',
        precision: 'usage standard, prix moyens des énergies'
      },
      {
        libelle: 'Ventilation',
        valeur: 'par ouverture des fenêtres',
        precision: 'aucune ventilation mécanique : l’humidité s’évacue mal'
      },
      {
        libelle: 'Par où la chaleur s’en va',
        valeur: 'les murs, le plancher et les fenêtres',
        precision: 'd’après le descriptif du logement'
      }
    ],
    schema: {
      genre: 'dpe',
      energie: { lettre: 'G', valeur: 512, unite: 'kWh/m²/an', recalculee: true },
      climat: { lettre: 'F', valeur: 84, unite: 'kg CO₂/m²/an', recalculee: true },
      finale: 'G',
      postes: [
        { nom: 'chauffage', kwh: 14210, cout: 'entre 1 620 € et 2 210 €' },
        { nom: 'eau chaude', kwh: 3120, cout: 'entre 380 € et 520 €' }
      ],
      isolation: {
        toit: 'inconnu',
        murs: 'nonIsole',
        fenetres: 'nonIsole',
        plancher: 'nonIsole'
      }
    },
    demarche: {
      texte: 'Voir votre nouvelle note',
      url: 'https://observatoire-dpe-audit.ademe.fr/',
      quoiEmporter: 'Munissez-vous du numéro ADEME à treize caractères, imprimé sur le rapport.'
    }
  };

  /* Le dossier muet : le descriptif ne décrit aucune paroi. La coupe ne doit
     surtout pas ressembler à un logement qui va bien. */
  const muet: Diagnostic = {
    ...commun,
    verdict: 'Ce logement est classé D.',
    gravite: 'attention',
    faits: [{ libelle: 'Surface de référence', valeur: '54 m²' }],
    schema: {
      genre: 'dpe',
      energie: { lettre: 'D', valeur: 219, unite: 'kWh/m²/an', recalculee: true },
      climat: null,
      finale: 'D',
      postes: [],
      isolation: { toit: 'inconnu', murs: 'inconnu', fenetres: 'inconnu', plancher: 'inconnu' }
    }
  };

  /* Le dossier pauvre : ni lettre, ni chiffre, ni poste. */
  const pauvre: Diagnostic = {
    ...commun,
    titre: 'Audit énergétique (DPE inclus)',
    verdict:
      'Audit énergétique : les tableaux de consommation de ce format ne sont pas lisibles automatiquement. Reportez-vous à l’étiquette imprimée dans le rapport.',
    gravite: 'neutre',
    faits: [],
    explication: commun.explication.slice(0, 1),
    aFaire: [],
    schema: {
      genre: 'dpe',
      energie: null,
      climat: null,
      finale: null,
      postes: [],
      isolation: { toit: 'inconnu', murs: 'inconnu', fenetres: 'inconnu', plancher: 'inconnu' }
    }
  };

  const DOSSIERS: { nom: string; d: Diagnostic }[] = [
    { nom: 'C · nominal', d: nominal },
    { nom: 'G · la lumière se retire', d: lourd },
    { nom: 'D · descriptif muet', d: muet },
    { nom: 'sans lettre', d: pauvre }
  ];

  const courant = $derived(DOSSIERS[cas]?.d ?? nominal);
</script>

<div class="banc">
  <div class="reglages">
    <label>
      Heure : <strong
        >{Math.floor(heure)} h {String(Math.round((heure % 1) * 60)).padStart(2, '0')}</strong
      >
      <input type="range" min="0" max="23.75" step="0.25" bind:value={heure} />
    </label>
    <div class="raccourcis">
      {#each Object.entries(MOMENTS) as [nom, hh] (nom)}
        <button type="button" onclick={() => (heure = hh)}>{nom}</button>
      {/each}
    </div>
    <div class="raccourcis">
      {#each DOSSIERS as dossier, i (dossier.nom)}
        <button type="button" class:actif={i === cas} onclick={() => (cas = i)}>{dossier.nom}</button
        >
      {/each}
    </div>
  </div>

  <div class="mobile">
    <EcranDpe diagnostic={courant} {heure} />
  </div>
</div>

<style>
  .banc {
    min-height: 100vh;
    padding: 16px;
    background: #dfe2dc;
    font-family: var(--police);
  }

  .reglages {
    display: grid;
    gap: 8px;
    max-width: 390px;
    margin: 0 auto 16px;
    font-size: 13px;
  }

  .raccourcis {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  button {
    padding: 6px 10px;
    border: 1px solid #0a2b23;
    border-radius: 6px;
    background: #fff;
    font: inherit;
    cursor: pointer;
  }

  button.actif {
    background: #0a2b23;
    color: #f7f6f2;
  }

  input[type='range'] {
    width: 100%;
  }

  /* La largeur de référence : 390 px, mobile d'abord et absolument. */
  .mobile {
    width: 390px;
    margin: 0 auto;
    box-shadow: 0 10px 40px rgb(4 20 16 / 22%);
  }
</style>
