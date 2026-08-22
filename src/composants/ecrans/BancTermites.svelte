<script lang="ts">
  /**
   * BANC DE L'ÉCRAN TERMITES — développement seulement.
   *
   * Les trois dossiers ci-dessous ne sont pas inventés : ce sont les formes
   * que `analyserTermites()` produit réellement, remplies avec des valeurs
   * relevées sur le corpus (65 zones sur 13 volets, noms réels, arrêté
   * préfectoral, volets annexes). Le banc sert à VOIR ce que les tests ne
   * peuvent que lire.
   */
  import type { Diagnostic } from '../../lib/modele';
  import Termites from './Termites.svelte';

  const explication = [
    'Le diagnostiqueur cherche des traces : galeries dans le bois, cordons de terre le long des murs, bois qui sonne creux. Il regarde ce qui est visible, sans démontage.',
    'Il ne peut donc pas garantir qu’il n’y a aucun termite. Un mur fermé, une cave inaccessible, une charpente hors d’atteinte : tout cela reste invisible.',
    'Votre commune est classée en zone de risque termites par arrêté du préfet : c’est ce qui explique la présence de ce diagnostic au dossier. Il ne vaut que six mois.'
  ];

  const NOMINAL: Diagnostic = {
    type: 'termites',
    titre: 'État parasitaire',
    verdict:
      'Aucun indice d’infestation de termites n’a été relevé dans les parties visitées. Ce rapport traite aussi les insectes à larves xylophages et les champignons lignivores : ces volets ont leur propre conclusion dans le rapport.',
    gravite: 'bon',
    faits: [
      { libelle: 'Zones contrôlées', valeur: '7' },
      {
        libelle: 'Arrêté préfectoral',
        valeur: 'le bien est en zone délimitée',
        precision: 'le préfet a classé ce secteur en zone de risque termites'
      },
      { libelle: 'Date du repérage', valeur: '09/04/2026' },
      {
        libelle: 'Autres volets du rapport',
        valeur: '2',
        precision: 'insectes à larves xylophages · champignons lignivores'
      }
    ],
    analogie:
      'Les termites mangent le bois de l’intérieur et laissent la surface intacte. C’est la pomme véreuse : de l’extérieur, elle est parfaite.',
    explication,
    aFaire: [
      'Validité : six mois. Si la vente traîne, il faudra le refaire.',
      'Le rapport ne couvre que les parties visitées : lisez la liste des zones non accessibles, elle figure dans le rapport.'
    ],
    schema: {
      genre: 'pieces',
      zones: [
        { nom: 'Séjour/Cuisine', etat: 'bon' },
        { nom: 'Dégagement', etat: 'bon' },
        { nom: 'Chambre', etat: 'bon' },
        { nom: 'Salle de bain', etat: 'bon' },
        { nom: 'Wc', etat: 'bon' },
        { nom: 'Balcon', etat: 'bon' },
        { nom: 'Terrasse', etat: 'bon' }
      ]
    },
    pages: [12, 15],
    date: '09/04/2026'
  };

  const GRAVE: Diagnostic = {
    ...NOMINAL,
    verdict: 'Des indices d’infestation de termites ont été relevés dans 1 zone.',
    gravite: 'alerte',
    faits: [
      { libelle: 'Zones contrôlées', valeur: '4' },
      { libelle: 'Zones avec indices', valeur: '1' },
      { libelle: 'Arrêté préfectoral', valeur: '33-2019-07-23-004' }
    ],
    aFaire: [
      'L’infestation doit être déclarée en mairie dans le mois, par lettre recommandée avec accusé de réception ou en la déposant contre récépissé.',
      'Faites intervenir une entreprise spécialisée pour un traitement curatif, et faites vérifier la charpente et les structures porteuses.'
    ],
    schema: {
      genre: 'pieces',
      zones: [
        { nom: 'Cave', etat: 'alerte' },
        { nom: 'Dégagement', etat: 'bon' },
        { nom: 'Chambre', etat: 'bon' },
        { nom: 'Salle de bain', etat: 'bon' }
      ]
    }
  };

  const PAUVRE: Diagnostic = {
    type: 'termites',
    titre: 'Termites',
    verdict:
      'Un état termites figure au dossier ; sa conclusion n’a pas pu être lue automatiquement.',
    gravite: 'neutre',
    faits: [{ libelle: 'Date du repérage', valeur: '09/04/2026' }],
    analogie: NOMINAL.analogie ?? '',
    explication: explication.slice(0, 2),
    aFaire: ['Validité : six mois. Si la vente traîne, il faudra le refaire.'],
    schema: null,
    pages: [12, 14]
  };

  const CAS = [
    { nom: 'nominal · 7 zones · bon', d: NOMINAL },
    { nom: 'infesté · 1 zone sur 4', d: GRAVE },
    { nom: 'conclusion non lue', d: PAUVRE }
  ];

  let cas = $state(0);
  let heure = $state(18);
  const HEURES = [
    ['aube 7 h', 7],
    ['midi 13 h 45', 13.75],
    ['doré 18 h', 18],
    ['nuit 23 h', 23]
  ] as const;
</script>

<div class="banc">
  <nav>
    {#each CAS as c, i (c.nom)}
      <button class:on={cas === i} onclick={() => (cas = i)}>{c.nom}</button>
    {/each}
    <span class="sep"></span>
    {#each HEURES as [nom, h] (nom)}
      <button class:on={heure === h} onclick={() => (heure = h)}>{nom}</button>
    {/each}
  </nav>
  <div class="tel">
    {#key `${cas}-${heure}`}
      <Termites diagnostic={CAS[cas]?.d ?? NOMINAL} {heure} onvoirLeRapport={() => {}} />
    {/key}
  </div>
</div>

<style>
  .banc {
    min-height: 100vh;
    padding: 16px;
    background: #1b1f1d;
    font-family: var(--police);
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }
  .sep {
    width: 100%;
  }
  nav button {
    padding: 8px 12px;
    border: 1px solid #3d4a45;
    border-radius: 8px;
    background: #232927;
    color: #cfd6d2;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }
  nav button.on {
    background: #f7f6f2;
    color: #0a2b23;
  }
  .tel {
    width: 390px;
    max-width: 100%;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 22px;
    box-shadow: 0 20px 60px rgb(0 0 0 / 45%);
  }
</style>
