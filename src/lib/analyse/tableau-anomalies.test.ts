/**
 * Les cas viennent de volets réels lus en entier le 21/08/2026. Les libellés
 * sont ceux du FD C16-600 ; les localisations sont des noms de pièces, sans
 * rien qui désigne un bien ou une personne.
 */
import { describe, expect, it } from 'vitest';
import {
  anomaliesDuTableau,
  catalogueDesDomaines,
  localisationsDe,
  porteUnTableauDAnomalies
} from './tableau-anomalies';

/** Le catalogue tel qu'il est imprimé au-dessus du tableau, dans TOUS les volets. */
const CATALOGUE = [
  'Anomalies avérées selon les domaines suivants :',
  'L’appareil général de commande et de protection et de son accessibilité.',
  "Dispositif de protection différentiel à l'origine de l'installation / Prise de terre et installation de mise à la",
  'terre.',
  "Dispositif de protection contre les surintensités adapté à la section des conducteurs, sur chaque circuit.",
  'La liaison équipotentielle et installation électrique adaptées aux conditions particulières des locaux',
  'contenant une douche ou une baignoire.',
  'Matériels électriques présentant des risques de contacts directs avec des éléments sous tension -',
  'Protection mécanique des conducteurs.',
  "Matériels électriques vétustes, inadaptés à l'usage."
];

/** Un volet sain : le catalogue, puis directement les informations complémentaires. */
const SAIN = [...CATALOGUE, 'Informations complémentaires :', 'IC. Socles de prise de courant'];

/**
 * Un volet avec anomalies, colonnes entrelacées comme à l'extraction.
 * Deux domaines, une anomalie chacun.
 */
const AVEC_ANOMALIES = [
  ...CATALOGUE,
  'Domaines Anomalies Photo',
  "5. Matériels électriques L'Enveloppe d'au moins un matériel est manquante ou",
  'présentant des risques de détériorée.',
  'contacts directs avec des Remarques : Présence de matériel électrique en place dont',
  "éléments sous tension - l'enveloppe présente des détériorations ; Faire intervenir un",
  'Protection mécanique des électricien qualifié afin de remplacer les matériels',
  'conducteurs présentant des détériorations (R+2 - Cuisine)',
  'SARL DGLM EXPERTISES | Tél. : 06.00.00.00.00',
  '3 /8',
  'Domaines Anomalies Photo',
  "L'installation comporte au moins un matériel électrique",
  '6. Matériels électriques inadapté à l’usage.',
  "vétustes, inadaptés à Remarques : Présence de matériel électrique inadapté à",
  "l'usage l'usage ; Faire intervenir un électricien qualifié afin de",
  'remplacer les matériels inadaptés par du matériel',
  'autorisé (R+2 - Cuisine, R+2 - Salle de bains + Wc)',
  'Anomalies relatives aux installations particulières :'
];

describe('le catalogue des domaines', () => {
  it('rend les six libellés recollés', () => {
    const c = catalogueDesDomaines(CATALOGUE);
    expect(c).toHaveLength(6);
    expect(c[1]).toContain('Prise de terre et installation de mise à la terre');
    expect(c[3]).toContain('contenant une douche ou une baignoire');
  });
});

describe('la présence du tableau vaut verdict', () => {
  it('un volet sain n’en porte aucun', () => {
    expect(porteUnTableauDAnomalies(SAIN)).toBe(false);
  });

  it('un volet avec anomalies en porte un', () => {
    expect(porteUnTableauDAnomalies(AVEC_ANOMALIES)).toBe(true);
  });
});

describe('les anomalies du tableau', () => {
  const trouvees = anomaliesDuTableau(AVEC_ANOMALIES);

  it('les trouve toutes, une par cellule de domaine', () => {
    expect(trouvees).toHaveLength(2);
  });

  it('retranche le nom du domaine du libellé de l’anomalie', () => {
    // Sans le dictionnaire, le libellé commencerait par « Matériels électriques
    // présentant des risques de… », qui appartient à la colonne de gauche.
    expect(trouvees[0]?.libelle).toBe(
      "L'Enveloppe d'au moins un matériel est manquante ou détériorée"
    );
    expect(trouvees[1]?.libelle).toBe(
      "L'installation comporte au moins un matériel électrique inadapté à l’usage"
    );
  });

  it('rattache chaque anomalie à sa famille', () => {
    expect(trouvees[0]?.domaine).toEqual({ numero: 5, nom: 'Contacts directs' });
    expect(trouvees[1]?.domaine).toEqual({ numero: 6, nom: 'Matériel vétuste ou inadapté' });
  });

  it('garde TOUTES les localisations, pas la première', () => {
    expect(trouvees[0]?.localisations).toEqual(['R+2 - Cuisine']);
    expect(trouvees[1]?.localisations).toEqual(['R+2 - Cuisine', 'R+2 - Salle de bains + Wc']);
  });

  it('lit la pluralité dans les mots du rapport', () => {
    expect(trouvees[1]?.pluralite).toBe('auMoinsUn');
  });

  it('garde le geste demandé', () => {
    expect(trouvees[0]?.geste).toContain('remplacer les matériels');
  });

  it('ne prétend pas qu’il n’y a aucune mesure compensatoire', () => {
    // LICIEL n'en écrit pas dans ce tableau : c'est « non précisé », donc null,
    // et surtout pas « aucune ».
    expect(trouvees[0]?.mesureCompensatoire).toBeNull();
  });

  it('n’invente pas de code quand le rapport n’en donne pas', () => {
    expect(trouvees[0]?.code).toBeNull();
  });
});

describe('les localisations collées', () => {
  it('sépare les pièces recollées sans séparateur, et dédoublonne', () => {
    const brut =
      'Faire intervenir un électricien (2ème étage - mezzaninne2ème étage - mezzaninne1er étage - Entrée /Cuisine/Séjour)';
    expect(localisationsDe(brut)).toEqual([
      '2ème étage - mezzaninne',
      '1er étage - Entrée /Cuisine/Séjour'
    ]);
  });

  it('ne retient pas une parenthèse qui ne nomme aucune pièce', () => {
    expect(localisationsDe('un dispositif (voir photo)')).toEqual([]);
  });
});
