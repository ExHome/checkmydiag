<script lang="ts">
  /**
   * BANC DE LA MINI-APP GAZ — développement seulement.
   *
   * Les trois dossiers ci-dessous reprennent des volets **réellement lus** sur
   * le corpus DGLM le 22/08/2026, avec leurs codes de points de contrôle et
   * leurs libellés — qui sont ceux de la norme NF P 45-500, pas des données de
   * personnes. Aucune adresse, aucun nom, aucun numéro de rapport n'y figure :
   * le corpus n'entre jamais dans le dépôt.
   *
   * Le banc sert à VOIR ce que les tests ne peuvent que lire — et d'abord à
   * vérifier les trois états que le § 9 de l'ordre impose de distinguer :
   * un rapport chargé, un rapport sans anomalie, et un rapport dont la
   * conclusion est une case cochée qu'aucun programme ne peut lire.
   */
  import type { Diagnostic } from '../../lib/modele';
  import type { LectureGaz } from '../../lib/lecteurs/gaz/modele';
  import MiniAppGaz from './MiniAppGaz.svelte';

  const socle = {
    type: 'gaz' as const,
    titre: 'Installation de gaz',
    explication: [],
    aFaire: [],
    schema: null,
    faits: []
  };

  const vide = {
    alimentee: null,
    natureGaz: null,
    appareils: [],
    anomalies: [],
    zonesNonControlees: [],
    pointsNonVerifies: [],
    constatations: [],
    conclusion: { lisible: false as const, pourquoi: '' }
  };

  /*
   * 1 · SIX ANOMALIES, DONT UN DGI — volet BC2E lu le 22/08/2026.
   *
   * C'est le volet qui a fait tomber deux défauts du lecteur : le code `19.1`
   * ressortait `19`, et le DGI arrivait SANS son libellé — celui-là même qui
   * justifie de couper le gaz.
   */
  const CHARGE: LectureGaz = {
    ...vide,
    alimentee: 'NON',
    natureGaz: 'Gaz naturel',
    anomalies: [
      { code: '29d7', niveau: 'A2', libelle: 'le tubage du conduit de fumée est raccordé directement sur l’appareil.', appareil: 'Chaudière', source: '' },
      { code: '29d5', niveau: 'A2', libelle: 'le conduit de raccordement n’est pas démontable.', appareil: 'Chaudière', source: '' },
      { code: '29c1', niveau: 'DGI', libelle: 'le conduit de raccordement présente un jeu aux assemblages estimé supérieur à 2 mm de part et d’autre du diamètre du conduit.', appareil: 'Chaudière', source: '' },
      { code: '8b', niveau: 'A2', libelle: 'l’extrémité du robinet de commande ou de la tuyauterie en attente n’est pas obturée.', appareil: 'Tuyauterie en attente', source: '' },
      { code: '19.1', niveau: 'A2', libelle: 'le local équipé ou prévu pour un appareil n’est pas pourvu d’une amenée d’air.', appareil: 'Radiateur non raccordé', source: '' },
      { code: '20.1', niveau: 'A1', libelle: 'le local équipé ou prévu pour un appareil d’utilisation n’est pas pourvu de sortie d’air.', appareil: 'Radiateur non raccordé', source: '' }
    ],
    zonesNonControlees: [
      { zone: 'Grange 1er étage', motif: 'Accès impossible / Accès non sécurisé', source: '' },
      { zone: 'Débarras 01', motif: 'Accès impossible / Encombré', source: '' },
      { zone: 'Débarras 02', motif: 'Accès impossible / Encombré', source: '' }
    ],
    pointsNonVerifies: [
      { appareil: 'Chaudière', point: '10', motif: 'Absence de gaz : impossibilité de vérifier si l’appareil est adapté au gaz.', source: '' },
      { appareil: 'Chaudière', point: 'J', motif: 'Absence de gaz : impossibilité de vérifier le débordement de flamme.', source: '' },
      { appareil: 'Chaudière', point: 'K', motif: 'Absence de gaz : impossibilité de réaliser le débit d’appareil.', source: '' },
      { appareil: 'Chaudière', point: 'S1', motif: 'Absence de gaz : impossibilité de réaliser le test de CO.', source: '' },
      { appareil: 'Radiateur non raccordé', point: 'B1', motif: 'Absence de gaz : impossibilité de réaliser les essais d’appareil.', source: '' }
    ],
    constatations: [
      'Attestation de contrôle de moins d’un an de la vacuité des conduits de fumées non présentée',
      'Justificatif d’entretien de moins d’un an de la chaudière non présenté',
      'Le conduit de raccordement n’est pas visitable'
    ],
    conclusion: { lisible: true, texte: 'L’installation comporte une ou des anomalie(s) : A1, A2, DGI', source: '' }
  };

  /* 2 · AUCUNE ANOMALIE — et la conclusion l'écrit, donc on peut le dire. */
  const SAIN: LectureGaz = {
    ...vide,
    alimentee: 'OUI',
    natureGaz: 'Gaz naturel',
    constatations: ['Justificatif d’entretien de moins d’un an de la chaudière présenté'],
    conclusion: { lisible: true, texte: 'L’installation ne comporte aucune anomalie', source: '' }
  };

  /*
   * 3 · LA CONCLUSION EST UNE CASE COCHÉE — le cas LICIEL, 26 volets sur 26.
   *
   * L'écran doit afficher un TIRET, jamais « 0 anomalie » : le rapport n'a pas
   * dit qu'il n'y en avait pas, il a dit quelque chose qu'on n'a pas su lire.
   */
  const NON_LU: LectureGaz = {
    ...vide,
    alimentee: 'OUI',
    natureGaz: 'Gaz naturel',
    pointsNonVerifies: [
      { appareil: 'Chaudière', point: 'S1', motif: 'Appareil à l’arrêt : mesure de CO non réalisée.', source: '' }
    ],
    conclusion: { lisible: false, pourquoi: 'la réponse est une case cochée, absente du texte du PDF' }
  };

  const DOSSIERS: { nom: string; d: Diagnostic }[] = [
    {
      nom: '1 · Six anomalies, dont un DGI — BC2E',
      d: { ...socle, verdict: '', gravite: 'alerte', pages: [53, 59], gaz: CHARGE }
    },
    {
      nom: '2 · Aucune anomalie, et le rapport l’écrit',
      d: { ...socle, verdict: '', gravite: 'bon', pages: [1, 6], gaz: SAIN }
    },
    {
      nom: '3 · Conclusion cochée à la main — LICIEL',
      d: { ...socle, verdict: '', gravite: 'neutre', pages: [1, 6], gaz: NON_LU }
    },
    {
      nom: '4 · Format non reconnu — aucun lecteur ne répond',
      d: { ...socle, verdict: '', gravite: 'neutre', pages: [1, 6] }
    }
  ];
</script>

<div class="banc">
  {#each DOSSIERS as dossier (dossier.nom)}
    <section>
      <h2>{dossier.nom}</h2>
      <MiniAppGaz diagnostic={dossier.d} />
    </section>
  {/each}
</div>

<style>
  .banc {
    display: grid;
    gap: 2.5rem;
    padding: 1.5rem 0 4rem;
    background: var(--verriere-ivoire, #f7f6f2);
  }
  h2 {
    max-width: 34rem;
    margin: 0 auto 0.5rem;
    padding: 0 1rem;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--encre-doux, #4a5a55);
  }
</style>
