<script lang="ts">
  /**
   * BANC DE L'ÉCRAN AMIANTE — développement seulement.
   *
   * Les quatre dossiers ci-dessous ne sont pas inventés : chacun reprend un
   * volet réellement lu dans le corpus DGLM les 21 et 22/08/2026, avec ses
   * mots. Le banc sert à VOIR ce que les tests ne peuvent que lire — et
   * surtout à vérifier que les quatre états se distinguent au premier
   * coup d'œil, sans lire le verdict.
   */
  import type { Diagnostic } from '../../lib/modele';
  import Amiante from './Amiante.svelte';

  const socle = {
    type: 'amiante' as const,
    titre: 'Amiante',
    explication: [],
    aFaire: [],
    schema: null
  };

  /* 1 · Un constat de vente sans amiante, avec des combles fermés.
     Volet LICIEL lu le 21/08 — maison, § 1.2 renseigné. */
  const ABSENCE: Diagnostic = {
    ...socle,
    verdict: 'Aucun matériau contenant de l’amiante n’a été repéré dans les parties accessibles.',
    gravite: 'bon',
    faits: [],
    date: '01/12/2025',
    pages: [47, 64],
    nonVisitees: {
      lue: true,
      neant: false,
      pieces: [{ terme: 'Combles', ou: 'R+2', pourquoi: 'Trappe de visite non accessible' }],
      charpente: true
    },
    /* Le § 3.2.6 de ce volet, recopié : c'est lui qui remplit « Éléments
       contrôlés ». La liste est imprimée sur deux colonnes dans le rapport. */
    perimetre: {
      lue: true,
      pieces: [
        'Rez de chaussée - Entrée',
        'Rez de chaussée - Séjour / Cuisine',
        "Rez de chaussée - Salle d'eau / Wc",
        '1er étage - Chambre 1',
        '1er étage - Chambre 2',
        '1er étage - Palier'
      ]
    },
    constatations: { lue: true, neant: true, entrees: [] }
  } as unknown as Diagnostic;

  /* 2 · Le DTA de copropriété : flocages en Score 3 dans les caves.
     Le seul volet du corpus qui porte de l'amiante en liste A. */
  const PRESENCE: Diagnostic = {
    ...socle,
    verdict: 'Le rapport repère des matériaux contenant de l’amiante.',
    gravite: 'alerte',
    faits: [],
    date: '27/10/2022',
    pages: [30, 55],
    anomalies: [
      {
        code: null,
        domaine: null,
        libelle: 'Flocages',
        localisations: ['Sous-Sol - Parties Communes / Caves'],
        pluralite: 'inconnue',
        mesureCompensatoire: { code: null, libelle: 'Matériau en décollement · Score 3' },
        geste: 'Il faut faire réaliser des travaux de retrait ou de confinement des flocages.'
      },
      {
        code: null,
        domaine: null,
        libelle: 'Conduits',
        localisations: ['Rez de chaussée / Extérieur - Local 2'],
        pluralite: 'inconnue',
        mesureCompensatoire: { code: null, libelle: 'Matériau non dégradé · Résultat EP' },
        geste: 'Il est recommandé de réaliser une évaluation périodique.'
      }
    ],
    nonVisitees: {
      lue: true,
      neant: false,
      pieces: [
        { terme: 'Local', ou: 'Rez de chaussée / Extérieur', pourquoi: 'Absence de clef' },
        { terme: 'Chaufferie', ou: 'Rez de chaussée', pourquoi: 'Absence de clef' }
      ],
      charpente: false
    }
  } as unknown as Diagnostic;

  /* 3 · Le pré-rapport : la liste A attend le laboratoire.
     Local commercial mixte, lu le 22/08 — onze jours avant son définitif. */
  const EN_ATTENTE: Diagnostic = {
    ...socle,
    verdict:
      'Le rapport ne conclut pas encore : des prélèvements restent à faire ou leurs résultats sont attendus.',
    gravite: 'attention',
    faits: [
      {
        libelle: 'Le rapport ne conclut pas',
        valeur: 'Faux plafonds (habitation étage — 9 pièces)',
        precision: 'En attente des résultats d’analyse'
      }
    ],
    date: '15/05/2025',
    pages: [1, 18],
    nonVisitees: {
      lue: true,
      neant: false,
      pieces: [{ terme: 'Combles', ou: '', pourquoi: 'Hauteur trop importante de la trappe d’accès (3m80)' }],
      charpente: true
    }
  } as unknown as Diagnostic;

  /* 4 · Le constat numérisé : huit pages, aucun texte extractible.
     14 documents du corpus amiante sont dans ce cas. */
  const ILLISIBLE: Diagnostic = {
    ...socle,
    verdict:
      'Le constat n’a pas pu être lu : sa rubrique de conclusion est introuvable dans ce document. Réclamez le rapport complet.',
    gravite: 'attention',
    faits: [],
    pages: [1, 8],
    nonVisitees: { lue: false, neant: false, pieces: [], charpente: false },
    constatations: { lue: false, neant: false, entrees: [] }
  } as unknown as Diagnostic;

  const dossiers: [string, Diagnostic][] = [
    ['Rien repéré · combles fermés', ABSENCE],
    ['Flocages en Score 3 · liste A', PRESENCE],
    ['Pré-rapport · laboratoire en attente', EN_ATTENTE],
    ['Document numérisé · illisible', ILLISIBLE]
  ];
</script>

<div class="banc">
  {#each dossiers as [nom, d] (nom)}
    <section>
      <p class="etiquette">{nom}</p>
      <Amiante
        diagnostic={d}
        versRapport={() => console.log('rapport complet', nom)}
        versDetails={() => console.log('détails', nom)}
        versPhotos={() => console.log('photos', nom)}
        versConseils={() => console.log('conseils', nom)}
      />
    </section>
  {/each}
</div>

<style>
  .banc {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    padding: 1.5rem;
    background: #e8e6e0;
    align-items: flex-start;
  }
  section {
    flex: 1 1 22rem;
    max-width: 26rem;
    border-radius: 1.25rem;
    overflow: hidden;
    box-shadow: 0 1px 3px rgb(10 43 35 / 12%);
    background: #f7f6f2;
  }
  .etiquette {
    margin: 0;
    padding: 0.6rem 1rem;
    background: #0a2b23;
    color: #f7f6f2;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
</style>
