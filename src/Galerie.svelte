<script lang="ts">
  /**
   * Planche de contrôle des schémas — outil de travail, pas une page du site.
   *
   * Elle affiche les huit schémas explicatifs côte à côte, dans les conditions
   * réelles (fond papier, largeur de lecture), pour pouvoir les juger ensemble :
   * même trait, même densité, même niveau de langue. Accessible sur
   * /galerie.html en développement.
   */
  import Explicatif from './composants/schemas/Explicatif.svelte';
  import PanneauSavoir from './composants/savoir/PanneauSavoir.svelte';
  import { exploration } from './lib/savoir/pile.svelte';
  import type { Diagnostic, Isolation, Lettre, TypeDiag } from './lib/modele';

  const TYPES: { type: TypeDiag; nom: string }[] = [
    { type: 'dpe', nom: 'DPE' },
    { type: 'electricite', nom: 'Électricité' },
    { type: 'gaz', nom: 'Gaz' },
    { type: 'amiante', nom: 'Amiante' },
    { type: 'plomb', nom: 'Plomb' },
    { type: 'termites', nom: 'Termites' },
    { type: 'erp', nom: 'ERP / argiles' },
    { type: 'carrez', nom: 'Carrez' },
    { type: 'assainissement', nom: 'Assainissement' }
  ];

  const ISOLATION: Isolation = {
    toit: 'isole',
    murs: 'nonIsole',
    fenetres: 'isole',
    plancher: 'inconnu'
  };
  const LETTRE: Lettre = 'E';

  let largeur = $state(420);
  let donnees = $state(true);

  /**
   * Un dossier de démonstration, pour éprouver le niveau 8 (« Et chez moi ? »)
   * sans avoir à déposer un PDF. Deux diagnostics seulement : on veut aussi voir
   * ce que répond le panneau quand le dossier ne contient pas la pièce.
   */
  const DOSSIER: Diagnostic[] = [
    {
      type: 'dpe',
      titre: 'DPE',
      verdict: 'Classé E : le logement consomme beaucoup.',
      gravite: 'attention',
      faits: [],
      explication: [],
      aFaire: [],
      pages: [1, 12],
      schema: {
        genre: 'dpe',
        energie: { lettre: 'E', valeur: 291, unite: 'kWh/m²/an', recalculee: false },
        climat: { lettre: 'D', valeur: 42, unite: 'kg CO₂/m²/an', recalculee: false },
        finale: 'E',
        isolation: ISOLATION,
        postes: [
          { nom: 'Chauffage', kwh: 14200 },
          { nom: 'Eau chaude sanitaire', kwh: 3100 },
          { nom: 'Éclairage', kwh: 420 },
          { nom: 'Auxiliaires', kwh: 380 }
        ]
      }
    },
    {
      type: 'plomb',
      titre: 'Plomb',
      verdict: 'Deux éléments en classe 3, dans la salle de bain.',
      gravite: 'alerte',
      faits: [],
      explication: [],
      aFaire: [],
      pages: [1, 4],
      schema: {
        genre: 'plomb',
        total: 24,
        nonMesurees: 0,
        classes: [18, 3, 1, 2],
        emplacements: []
      }
    },
    {
      type: 'electricite',
      titre: 'Électricité',
      verdict: 'Six anomalies relevées, dont l’absence de dispositif différentiel 30 mA.',
      gravite: 'alerte',
      faits: [],
      explication: [],
      aFaire: [],
      pages: [5, 9],
      schema: null
    }
  ];

  // Le mode « comprendre MON diagnostic » s'active dès qu'un dossier est là (§ 12).
  $effect(() => {
    exploration.dossier = donnees ? DOSSIER : [];
  });
</script>

<div class="planche">
  <header>
    <h1>Schémas — planche de contrôle</h1>
    <div class="controles">
      <button class:on={largeur === 380} onclick={() => (largeur = 380)}>Téléphone 380</button>
      <button class:on={largeur === 420} onclick={() => (largeur = 420)}>Téléphone 420</button>
      <button class:on={largeur === 720} onclick={() => (largeur = 720)}>Large 720</button>
      <button class:on={donnees} onclick={() => (donnees = !donnees)}>
        {donnees ? 'Dossier déposé' : 'Aucun dossier'}
      </button>
    </div>
  </header>

  <div class="grille">
    {#each TYPES as t (t.type)}
      <section class="poste" style:--largeur="{largeur}px">
        <p class="etiquette">{t.nom}</p>
        <div class="feuille">
          <Explicatif
            type={t.type}
            isolation={t.type === 'dpe' && donnees ? ISOLATION : null}
            lettre={t.type === 'dpe' && donnees ? LETTRE : null}
          />
        </div>
      </section>
    {/each}
  </div>
</div>

<PanneauSavoir />

<style>
  .planche {
    padding: 24px;
    background: var(--papier);
    min-height: 100vh;
    color: var(--encre);
  }

  header {
    margin-bottom: 24px;
  }

  h1 {
    font-family: var(--police-titre);
    font-size: 1.4rem;
    margin: 0 0 12px;
    color: var(--vert-700);
  }

  .controles {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .controles button {
    font: inherit;
    font-size: 0.82rem;
    padding: 6px 12px;
    border: 1px solid var(--trait);
    background: #fff;
    border-radius: 999px;
    cursor: pointer;
  }

  .controles button.on {
    background: var(--vert-700);
    color: var(--papier);
    border-color: var(--vert-700);
  }

  .grille {
    display: flex;
    flex-wrap: wrap;
    gap: 28px;
    align-items: start;
  }

  .poste {
    width: var(--largeur);
  }

  .etiquette {
    font-size: 0.7rem;
    letter-spacing: var(--suivi);
    text-transform: uppercase;
    font-weight: 700;
    color: var(--or-fonce);
    margin: 0 0 8px;
  }

  .feuille {
    background: #fff;
    border: 1px solid var(--trait);
    border-radius: var(--rayon);
    padding: 20px;
    box-shadow: var(--ombre);
  }
</style>
