<script lang="ts">
  /**
   * LE BANC DE L'ACCUEIL — développement seulement, servi par `accueil.html`.
   *
   * Il existe pour voir les seize scènes (quatre moments × quatre gravités) et
   * les cinq formes de dossier côte à côte, au lieu d'attendre 7 h du matin pour
   * vérifier l'aube.
   *
   * AUCUNE DONNÉE RÉELLE ne circule ici. Les dossiers ci-dessous sont des
   * fabrications de banc, et leurs formes sont calquées sur les distributions
   * mesurées du corpus — 1 à 6 diagnostics, 0 à 3 points de demande, `typeBien`
   * jamais renseigné — pour que le banc montre ce que l'écran verra vraiment.
   */
  import type { Analyse, Diagnostic, Gravite, TypeDiag } from '../lib/modele';
  import Accueil from './Accueil.svelte';
  import { MOMENTS } from './lumiere/heure';

  function d(
    type: TypeDiag,
    titre: string,
    verdict: string,
    gravite: Gravite,
    pages: [number, number]
  ): Diagnostic {
    return {
      type,
      titre,
      verdict,
      gravite,
      faits: [],
      explication: [],
      aFaire: [],
      schema: null,
      pages
    };
  }

  const nature = {
    genre: 'venteLocation' as const,
    nom: 'Dossier de diagnostic technique',
    quoi: 'Le dossier remis à l’acquéreur.',
    portee: 'logement' as const,
    pourLaVente: true
  };

  const bien = {
    adresse: '12 rue des Ormes',
    commune: 'Bordeaux',
    lot: 'Bât. A · 3e étage · lot 24',
    surface: 72.4,
    anneeConstruction: '1974',
    numeroDossier: 'BQ-000000',
    dateRepérage: '04/03/2026'
  };

  /* `generateur` est requis par le modèle : un banc qui ne le pose pas ne
     compile plus, et surtout ne teste pas le cas réel — un dossier porte
     toujours la trace de son éditeur, fût-elle nulle. */
  const socle = { bien, nature, generateur: null, textePages: {}, nonExploites: [], illisible: false, confiance: 0.87 };

  /** Le cas nominal : 63 dossiers sur 90 en sont là. */
  const NOMINAL: Analyse = {
    ...socle,
    nbPages: 47,
    diagnostics: [
      d('dpe', 'Diagnostic de performance énergétique', 'Classe C.', 'bon', [4, 18]),
      d('electricite', 'État de l’installation intérieure d’électricité', 'Deux anomalies relevées.', 'attention', [19, 27]),
      d('erp', 'État des risques et pollutions', 'Deux risques concernent le bien.', 'bon', [30, 34]),
      d('carrez', 'Certificat de superficie', '72,40 m² privatifs.', 'bon', [38, 41])
    ],
    controles: [
      { titre: 'L’attestation de compétence du diagnostiqueur est périmée', explication: '', quoiFaire: '', genre: 'perime' },
      { titre: 'Le lot du certificat de superficie ne reprend pas celui du DPE', explication: '', quoiFaire: '', genre: 'incoherence' }
    ]
  };

  /** L'écran qu'il faut réussir : rien à signaler. */
  const CALME: Analyse = {
    ...NOMINAL,
    diagnostics: NOMINAL.diagnostics.map((x) => ({ ...x, gravite: 'bon' as Gravite })),
    controles: [NOMINAL.controles[0]!]
  };

  /** Le dossier pauvre : un seul diagnostic, pas de surface, pas d'année. */
  const PAUVRE: Analyse = {
    ...socle,
    bien: { adresse: '3 place Saint-Michel', commune: 'Bordeaux', lot: 'Lot 7', dateRepérage: '11/01/2026' },
    nbPages: 9,
    diagnostics: [d('erp', 'État des risques et pollutions', 'Un risque concerne le bien.', 'bon', [3, 6])],
    controles: []
  };

  /** Un diagnostic que Verrière n'a pas su lire. */
  const NON_LU: Analyse = {
    ...NOMINAL,
    diagnostics: [
      NOMINAL.diagnostics[0]!,
      { ...NOMINAL.diagnostics[1]!, gravite: 'neutre' as Gravite },
      NOMINAL.diagnostics[2]!,
      NOMINAL.diagnostics[3]!,
      d('amiante', 'Repérage amiante', 'Rien de repéré dans les matériaux des listes.', 'bon', [42, 46])
    ]
  };

  /** Le dossier le plus lourd du corpus : trois demandes. */
  const LOURD: Analyse = {
    ...NOMINAL,
    nbPages: 62,
    diagnostics: [
      d('dpe', 'Diagnostic de performance énergétique', 'Classe E.', 'alerte', [4, 22]),
      d('electricite', 'État de l’installation intérieure d’électricité', 'Quatre anomalies relevées.', 'attention', [23, 33]),
      d('plomb', 'Constat de risque d’exposition au plomb', 'Plomb — chambre, séjour.', 'attention', [34, 44]),
      d('erp', 'État des risques et pollutions', 'Trois risques concernent le bien.', 'bon', [45, 50]),
      d('carrez', 'Certificat de superficie', '72,40 m² privatifs.', 'bon', [55, 58])
    ]
  };

  /** Un repérage avant travaux : il ne vaut pas pour une vente. */
  const RAAT: Analyse = {
    ...PAUVRE,
    nature: {
      genre: 'raat',
      nom: 'Repérage amiante avant travaux',
      quoi: 'Il protège les ouvriers d’un chantier.',
      reserve: 'Ce repérage relève du code du travail : il ne vaut pas pour une vente, même s’il porte le même intitulé de mission.',
      portee: 'logement',
      pourLaVente: false
    },
    diagnostics: [d('amiante', 'Repérage amiante', 'Deux matériaux repérés.', 'attention', [2, 7])]
  };

  const DOSSIERS: [string, Analyse][] = [
    ['nominal · 1 demande', NOMINAL],
    ['rien à signaler', CALME],
    ['dossier pauvre', PAUVRE],
    ['un non lu', NON_LU],
    ['le plus lourd · 3', LOURD],
    ['avant travaux', RAAT]
  ];

  let heure = $state(18);
  let choix = $state(0);
  const dossier = $derived(DOSSIERS[choix]?.[1] ?? NOMINAL);
</script>

<div class="banc">
  <div class="reglages">
    <label>
      Heure <strong>{Math.floor(heure)} h {String(Math.round((heure % 1) * 60)).padStart(2, '0')}</strong>
      <input type="range" min="0" max="23.75" step="0.25" bind:value={heure} />
    </label>
    <div class="boutons">
      {#each Object.entries(MOMENTS) as [nom, h] (nom)}
        <button type="button" onclick={() => (heure = h)}>{nom}</button>
      {/each}
    </div>
    <div class="boutons">
      {#each DOSSIERS as [nom], i (nom)}
        <button type="button" class:actif={i === choix} onclick={() => (choix = i)}>{nom}</button>
      {/each}
    </div>
  </div>

  <div class="telephone">
    <Accueil analyse={dossier} {heure} />
  </div>
</div>

<style>
  .banc {
    padding: var(--e4);
    font-family: var(--police);
  }

  .reglages {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e4);
    align-items: center;
    margin-bottom: var(--e4);
  }

  .boutons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--e2);
  }

  .boutons button {
    min-height: 44px;
    padding: 8px 12px;
    border: 1px solid var(--verriere-sable-filet);
    border-radius: var(--rayon-badge);
    background: var(--verriere-blanc);
    cursor: pointer;
  }

  .boutons button.actif {
    background: var(--verriere-vert);
    color: var(--verriere-ivoire);
  }

  /* 390 px : la seule largeur qui compte pour juger cet écran. */
  .telephone {
    width: 390px;
    max-width: 100%;
    margin-inline: auto;
    border: 1px solid var(--verriere-sable-filet);
  }
</style>
