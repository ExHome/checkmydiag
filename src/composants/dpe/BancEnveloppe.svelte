<script lang="ts">
  /**
   * Banc d'essai de l'écran DPE — développement seulement.
   *
   * Le logement ci-dessous est INVENTÉ : ses surfaces, ses orientations, son
   * chauffage et ses montants ne viennent d'aucun dossier. Seule la MISE EN
   * PAGE est copiée du corpus, à la ligne près — c'est elle qu'il faut
   * éprouver, et le dépôt est public.
   *
   * Il est construit pour porter les cas difficiles en même temps :
   *
   *  - des murs d'états différents, dont un que le rapport ne nomme pas ;
   *  - un plafond dont l'isolation est inconnue, un plancher qui ne l'est pas ;
   *  - une année d'isolation supposée par le logiciel ;
   *  - une fenêtre en simple vitrage au milieu de fenêtres performantes,
   *    pendant que le résumé du rapport annonce du double vitrage ;
   *  - deux générateurs de chauffage, et aucune ventilation mécanique ;
   *  - deux packs de travaux dont les étiquettes tombent au milieu des
   *    consignes.
   */
  import { lireLeDpe } from '../../lib/lecteurs/dpe';
  import type { Etiquette } from '../../lib/modele';
  import Deperditions from './Deperditions.svelte';
  import FormatInconnu from './FormatInconnu.svelte';
  import DoubleEtiquette from './DoubleEtiquette.svelte';
  import LesParois from './LesParois.svelte';
  import LesSystemes from './LesSystemes.svelte';
  import LesTravaux from './LesTravaux.svelte';
  import PointsAVerifier from './PointsAVerifier.svelte';
  import PourquoiCetteNote from './PourquoiCetteNote.svelte';

  const RAPPORT = [
    'Ce logement n’est pas encore équipé de systèmes de',
    'production d’énergie renouvelable.',
    'Vue d ’ ensemble du logement',
    'description isolation',
    'Murs Mur en pierre de taille et moellons avec isolation intérieure donnant sur l’extérieur',
    'Plancher bas Dalle béton donnant sur un terre-plein',
    'Toiture/plafond Plafond sous solives bois donnant sur un comble',
    'Portes et fenêtres Fenêtres battantes pvc, double vitrage',
    'Vue d ’ ensemble des équipements',
    'description',
    'Panneau rayonnant électrique NFC, NF** et NF*** avec programmateur pièce par pièce (système',
    'individuel)',
    'Chauffage',
    'Radiateur électrique à fluide caloporteur avec programmateur pièce par pièce (système individuel)',
    'Eau chaude sanitaire Ballon électrique à accumulation vertical, contenance ballon 200 L',
    'Climatisation Néant',
    'Ventilation Ventilation par ouverture des fenêtres',
    'Pilotage',
    'Avec intermittence pièce par pièce avec minimum de température',
    'Recommandations de gestion et d ’ entretien des équipements',
    'type d ’ entretien',
    'Vérifier la température d’eau du ballon (55°C-60°C) pour éviter le risque de développement de la',
    'Chauffe-eau',
    'légionnelle (en dessous de 50°C).',
    'Isolation Faire vérifier les isolants et les compléter tous les 20 ans.',
    'Recommandations d ’ amélioration de la performance',
    'Les travaux essentiels Montant estimé : 8300 à 12500 €',
    'Lot Description Performance recommandée',
    'Isolation des murs par l’intérieur.',
    'Avant d’isoler un mur, vérifier qu’il ne présente aucune',
    'R > 3,7 m².K/W',
    'Mur',
    'trace d’humidité.',
    'Faire intervenir un professionnel de l’isolation.',
    'Les travaux à',
    'envisager',
    'Montant estimé : 14200 à 21300 €',
    'Lot Description Performance recommandée',
    'Remplacer les fenêtres par des fenêtres double vitrage à',
    'isolation renforcée.',
    'Faire intervenir un professionnel type menuisier.',
    'Uw = 1,3 W/m².K, Sw = 0,3',
    'Portes et fenêtres',
    'Travaux pouvant nécessiter une autorisation',
    'd’urbanisme',
    'Remplacer le système actuel par un appareil de type pompe',
    'à chaleur.',
    'Eau chaude sanitaire COP = 3',
    'Faire intervenir un professionnel type plombier',
    'chauffagiste.',
    'Commentaires :',
    'Le comble est accessible : l’isolation du plafond serait le chantier le plus simple à engager.',
    'Fiche technique du logement',
    'Référence du logiciel validé : LICIEL Diagnostics v4 [Moteur BBS Slama: 2025.11.1.0]',
    'Généralités',
    'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
    'Département Observé / mesuré 33 Gironde',
    'Altitude Donnée en ligne 30 m',
    'Type de bien Observé / mesuré Maison',
    'Année de construction Estimé Avant 1948',
    'Surface de référence du logement Observé / mesuré 84,50 m²',
    'Nombre de niveaux du logement Observé / mesuré 2',
    'Hauteur moyenne sous plafond Observé / mesuré 2,60 m',
    'Enveloppe',
    'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
    'Surface du mur Observé / mesuré 34,20 m²',
    'Mur 1 Nord Type d’adjacence Observé / mesuré l’extérieur',
    'Matériau mur Observé / mesuré Mur en pierre de taille et moellons',
    'Epaisseur mur Observé / mesuré 45 cm',
    'Isolation Observé / mesuré non',
    'Surface du mur Observé / mesuré 28,60 m²',
    'Mur 2 Sud, Est',
    'Type d’adjacence Observé / mesuré l’extérieur',
    'Matériau mur Observé / mesuré Mur en pierre de taille et moellons',
    'Isolation Observé / mesuré oui',
    'Epaisseur isolant Observé / mesuré 10 cm',
    'Année isolation Valeur par défaut 1989 - 2000',
    'Surface du mur Observé / mesuré 12,40 m²',
    'Type d’adjacence Observé / mesuré un local chauffé',
    'Matériau mur Observé / mesuré Mur en béton banché',
    'Mur 3 Ouest Isolation Observé / mesuré non',
    'Surface du mur Observé / mesuré 9,80 m²',
    'Type d’adjacence Observé / mesuré des circulations sans ouverture directe sur l’extérieur',
    'Matériau mur Observé / mesuré Inconnu (à structure lourde)',
    'Isolation Observé / mesuré forte présomption',
    'Surface de plancher bas Observé / mesuré 42,25 m²',
    'Plancher Type d’adjacence Observé / mesuré un terre-plein',
    'Type de pb Observé / mesuré Dalle béton',
    'Isolation Observé / mesuré non',
    'Surface de plancher haut Observé / mesuré 42,25 m²',
    'Plafond Type de local adjacent Observé / mesuré un comble faiblement ventilé',
    'Type de ph Observé / mesuré Plafond sous solives bois',
    'Isolation Observé / mesuré inconnue',
    'Surface de baies Observé / mesuré 3,60 m²',
    'Fenêtre 1 Sud Placement Observé / mesuré Mur 2 Sud, Est',
    'Orientation des baies Observé / mesuré Sud',
    'Type ouverture Observé / mesuré Fenêtres battantes',
    'Type menuiserie Observé / mesuré PVC',
    'Type de vitrage Observé / mesuré double vitrage',
    'Epaisseur lame air Observé / mesuré 16 mm',
    'Type volets Observé / mesuré Volets roulants PVC (tablier < 12mm)',
    'U Fenêtre (calculé) Observé / mesuré 1,4',
    'Surface de baies Observé / mesuré 2,10 m²',
    'Fenêtre 2 Nord Placement Observé / mesuré Mur 1 Nord',
    'Orientation des baies Observé / mesuré Nord',
    'Type ouverture Observé / mesuré Fenêtres battantes',
    'Type menuiserie Observé / mesuré Bois',
    'Type de vitrage Observé / mesuré simple vitrage',
    'Type volets Observé / mesuré Volets battants bois (tablier < 22mm)',
    'U Fenêtre (calculé) Observé / mesuré 5,4',
    'Surface de porte Observé / mesuré 1,93 m²',
    'Porte Placement Observé / mesuré Mur 1 Nord',
    'Type d’adjacence Observé / mesuré l’extérieur',
    'Nature de la menuiserie Observé / mesuré Porte simple en bois',
    'Type de porte Observé / mesuré Porte opaque pleine',
    'Systèmes',
    'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
    'Type de ventilation Observé / mesuré Ventilation par ouverture des fenêtres',
    'Ventilation Energie utilisée Observé / mesuré Néant',
    'Façades exposées Observé / mesuré plusieurs',
    'Type d’installation de chauffage Observé / mesuré Installation de chauffage simple',
    'Type générateur Observé / mesuré Electrique - Panneau rayonnant électrique NFC, NF** et NF***',
    'Chauffage 1 Energie utilisée Observé / mesuré Electrique',
    'Type émetteur Observé / mesuré Panneau rayonnant électrique',
    'Type de chauffage Observé / mesuré divisé',
    'Equipement intermittence Observé / mesuré Avec intermittence pièce par pièce',
    'Type d’installation de chauffage Observé / mesuré Installation de chauffage simple',
    'Type générateur Observé / mesuré Electrique - Radiateur à fluide caloporteur',
    'Chauffage 2 Energie utilisée Observé / mesuré Electrique',
    'Type émetteur Observé / mesuré Radiateur électrique à fluide caloporteur',
    'Type de production Observé / mesuré accumulation',
    'Eau chaude sanitaire Volume de stockage Observé / mesuré 200 L',
    'Energie utilisée Observé / mesuré Electrique',
    'Type de distribution Observé / mesuré production en volume habitable'
  ];

  /**
   * Le DPE d'un autre éditeur, tel que le corpus en donne : le corps est en
   * image, seuls l'en-tête et le pied de page rendent du texte. Il est ici pour
   * qu'on VOIE ce que Verrière fait d'un format non mesuré.
   */
  const AUTRE_EDITEUR = [
    'Diagnostic de Performance Énergétique',
    'CABINET EXEMPLE membre du réseau BC2E',
    'n° de rapport : 000000000',
    'DIAGNOSTIC DPE : 1 sur 5',
    'DDT : 23 sur 45'
  ];

  let autreEditeur = $state(false);

  /*
   * L'écran ne lit jamais en direct : il passe par l'aiguilleur, qui nomme
   * l'éditeur AVANT de lire et choisit le lecteur mesuré sur cet éditeur-là.
   */
  const aiguillage = $derived(lireLeDpe(autreEditeur ? AUTRE_EDITEUR : RAPPORT));

  /* Une classe E en énergie, une D en climat : la moins bonne est retenue. */
  const energie: Etiquette = { lettre: 'E', valeur: 291, unite: 'kWh/m²/an', recalculee: true };
  const climat: Etiquette = { lettre: 'D', valeur: 38, unite: 'kg CO₂/m²/an', recalculee: true };
</script>

<main>
  <p class="banc">
    Banc d’essai — logement inventé, mise en page réelle.
    <button type="button" onclick={() => (autreEditeur = !autreEditeur)}>
      {autreEditeur ? '← revenir au DPE LICIEL' : 'voir un DPE d’un autre éditeur →'}
    </button>
  </p>

  {#if aiguillage.etat === 'format inconnu'}
    <FormatInconnu quoi="DPE" essayes={aiguillage.essayes} enImage={true} />
  {:else}
    <p class="lu">
      Format reconnu : <b>{aiguillage.editeur}</b> — {aiguillage.preuve}
    </p>

    <DoubleEtiquette
    {energie}
    {climat}
      finale="E"
      surfaceReference={aiguillage.valeur.enveloppe.bien.surfaceReference?.valeur ?? null}
    />

    <PourquoiCetteNote
      finale="E"
      causes={aiguillage.valeur.causes}
      dejaBien={aiguillage.valeur.dejaBien}
    />

    <Deperditions
      postes={aiguillage.valeur.enveloppe.deperditions}
      pourcentagesDisponibles={aiguillage.valeur.enveloppe.pourcentagesDisponibles}
    />

    <LesParois enveloppe={aiguillage.valeur.enveloppe} />

    <LesSystemes systemes={aiguillage.valeur.systemes} />

    <LesTravaux travaux={aiguillage.valeur.travaux} />

    <PointsAVerifier points={aiguillage.valeur.points} />
  {/if}
</main>

<style>
  main {
    max-width: 46rem;
    margin: 0 auto;
    padding: 1.5rem 1.1rem 4rem;
    display: grid;
    gap: 2rem;
    background: var(--fond, #f7f6f2);
    color: var(--encre, #0a2b23);
    font-family: var(--police-texte, system-ui, sans-serif);
  }

  .lu {
    margin: 0;
    font-size: 0.76rem;
    color: var(--verriere-sable-encre, #896c33);
  }

  .banc button {
    margin-left: 0.6rem;
    padding: 0.2rem 0.55rem;
    border: 1px solid var(--verriere-sable-filet, #d8c199);
    border-radius: 999px;
    background: transparent;
    font-size: 0.72rem;
    color: var(--vert-verriere, #12463b);
    cursor: pointer;
  }

  .banc {
    margin: 0;
    padding: 0.45rem 0.7rem;
    border: 1px dashed var(--verriere-sable-filet, #d8c199);
    border-radius: 6px;
    font-size: 0.75rem;
    color: var(--verriere-sable-encre, #896c33);
  }
</style>
