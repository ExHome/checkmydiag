<script lang="ts">
  /**
   * BANC DE LA MINI-APP ÉLECTRICITÉ — développement seulement.
   *
   * Les quatre dossiers ci-dessous ne sont pas inventés : chacun reprend un
   * volet réellement mesuré sur le corpus DGLM le 22/08/2026, avec ses libellés
   * et ses localisations. Le banc sert à VOIR ce que les tests ne peuvent que
   * lire — et d'abord à vérifier qu'aucune anomalie ne disparaît, puisque c'est
   * exactement ce que faisait l'écran précédent.
   */
  import type { Diagnostic } from '../../lib/modele';
  import MiniAppElectricite from './MiniAppElectricite.svelte';

  const socle = {
    type: 'electricite' as const,
    titre: 'Installation électrique',
    explication: [],
    schema: null
  };

  const anomalie = (
    libelle: string,
    localisations: string[] = [],
    extra: Record<string, unknown> = {}
  ) => ({
    code: null,
    domaine: null,
    libelle,
    localisations,
    pluralite: /^au moins un/i.test(libelle) ? 'auMoinsUn' : 'inconnue',
    mesureCompensatoire: null,
    geste: null,
    ...extra
  });

  /* 1 · Six anomalies, quatre domaines. Volet mesuré le 22/08 — celui où
     l'ancien écran n'en montrait que trois sur six. */
  const CHARGE: Diagnostic = {
    ...socle,
    verdict: 'L’installation intérieure d’électricité comporte une ou des anomalies.',
    gravite: 'attention',
    date: '14/02/2024',
    pages: [12, 20],
    faits: [
      { libelle: 'Anomalies relevées', valeur: '6' },
      { libelle: 'Points non vérifiés', valeur: '2', precision: 'Installation non alimentée le jour de la visite' }
    ],
    anomalies: [
      anomalie(
        'La manœuvre du bouton test du (des) dispositif(s) de protection différentielle n’entraîne pas la coupure de l’alimentation'
      ),
      anomalie('Au moins un socle de prise de courant ne comporte pas de broche de terre.', ['RDC - Chambre 1']),
      anomalie('Au moins un socle de prise de courant comporte une broche de terre non reliée à la terre.', [
        'RDC - Buanderie'
      ]),
      anomalie(
        'L’installation électrique comporte au moins une connexion avec une partie active nue sous tension accessible.',
        ['Sous-Sol - Cave']
      ),
      anomalie('L’installation comporte au moins un matériel électrique vétuste', ['RDC - Pièce 1', 'RDC - Atelier', 'Sous-Sol'], {
        code: 'B8.3 a',
        geste: 'Faire intervenir un électricien qualifié afin de remplacer le matériel vétuste.'
      }),
      anomalie(
        'Locaux contenant une baignoire ou une douche : la continuité électrique de la liaison équipotentielle supplémentaire n’est pas satisfaisante (résistance supérieure à 2 ohms).',
        ['1er étage - Salle de bain']
      )
    ],
    aFaire: [
      'Traitez en priorité l’absence de dispositif différentiel 30 mA et les défauts de mise à la terre : ce sont les deux points qui protègent les personnes.',
      'Faites établir un devis par un électricien avant la vente : cela évite une renégociation improvisée le jour de la signature.',
      'Validité : trois ans à la vente, six ans à la location.'
    ]
  } as unknown as Diagnostic;

  /* 2 · Une seule anomalie, compensée. Le rapport la relève quand même. */
  const COMPENSEE: Diagnostic = {
    ...socle,
    verdict: 'L’installation intérieure d’électricité comporte une ou des anomalies.',
    gravite: 'attention',
    date: '09/03/2022',
    pages: [2, 8],
    faits: [
      { libelle: 'Anomalies relevées', valeur: '1' },
      { libelle: 'Point relevé, mais compensé', valeur: 'Broche de terre non reliée' }
    ],
    anomalies: [
      anomalie('Au moins un socle de prise de courant comporte une broche de terre non reliée à la terre.', [
        '1er étage - Séjour'
      ], {
        mesureCompensatoire: {
          code: null,
          libelle: 'Un dispositif différentiel 30 mA protège l’ensemble de l’installation'
        },
        geste: 'Faire intervenir un électricien qualifié afin d’installer des conducteurs de protection.'
      })
    ],
    aFaire: ['Validité : trois ans à la vente, six ans à la location.']
  } as unknown as Diagnostic;

  /* 3 · Le cas majoritaire du corpus : rien de relevé. */
  const SAINE: Diagnostic = {
    ...socle,
    verdict: 'L’installation intérieure d’électricité ne comporte aucune anomalie.',
    gravite: 'bon',
    date: '05/07/2024',
    pages: [9, 16],
    faits: [{ libelle: 'Anomalies relevées', valeur: '0' }],
    anomalies: [],
    aFaire: [
      'Validité : trois ans à la vente, six ans à la location.',
      'Aucune anomalie relevée ne veut pas dire installation neuve : le diagnostic ne contrôle que six points de sécurité.'
    ]
  } as unknown as Diagnostic;

  /* 4 · La conclusion cochée à la main — un programme ne peut pas la lire. */
  const NON_LUE: Diagnostic = {
    ...socle,
    verdict:
      'La conclusion est cochée à la main : un programme ne peut pas la lire. Elle est sur la page « Conclusion » du rapport.',
    gravite: 'neutre',
    pages: [1, 7],
    faits: [],
    anomalies: [],
    aFaire: ['Validité : trois ans à la vente, six ans à la location.']
  } as unknown as Diagnostic;

  const dossiers: [string, Diagnostic][] = [
    ['6 anomalies · 4 domaines', CHARGE],
    ['1 anomalie compensée', COMPENSEE],
    ['Aucune anomalie relevée', SAINE],
    ['Conclusion non lue', NON_LUE]
  ];
</script>

<div class="banc">
  {#each dossiers as [nom, d] (nom)}
    <section>
      <p class="etiquette">{nom}</p>
      <MiniAppElectricite
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
