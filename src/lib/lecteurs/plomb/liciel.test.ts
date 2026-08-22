/**
 * Les unités de diagnostic, éprouvées sur la FORME réelle d'un tableau LICIEL.
 *
 * Les lignes ci-dessous reproduisent la disposition observée dans un volet lu
 * en entier — colonnes entrelacées comprises. Aucune donnée du rapport : ni
 * adresse, ni nom, ni numéro de dossier. Seule la forme est reprise, parce que
 * c'est elle qui casse les lecteurs.
 */
import { describe, expect, it } from 'vitest';
import { unitesDeDiagnostic, reconnaitLiciel } from './liciel';

/**
 * ⚠️ Le piège central : l'extraction du PDF entrelace les colonnes. La ligne de
 * l'unité ne porte NI son numéro de mesure NI sa concentration — elles sont sur
 * les lignes voisines, qui appartiennent à la colonne de gauche du tableau.
 */
/*
 * ⚠️ L'ORDRE DES TROIS PREMIÈRES LIGNES EST CELUI DU RAPPORT, ET IL COMPTE.
 *
 * Le titre du local, puis son récapitulatif, puis l'en-tête de colonnes. Ce
 * test les avait dans l'ordre inverse — en-tête d'abord — ce qui n'existe dans
 * aucun rapport : le titre est toujours posé AVANT le tableau qu'il ouvre.
 * L'erreur est restée invisible tant que le titre ne servait à rien ; elle a
 * sauté le jour où il a fallu qu'il ferme le tableau précédent.
 */
const TABLEAU = [
  'Rez de chaussée - Plateau',
  /* Le récapitulatif du local : c'est LUI qui nomme la pièce, et le nom se
     prend dans `recapitulatifParLocal` — jamais en devinant sur les lignes
     d'au-dessus, où traînent les pieds de page. */
  "Nombre d'unités de diagnostic : 12 - Nombre d'unités de diagnostic de classe 3 repéré : 0 soit 0 %",
  /* L'en-tête de colonnes : c'est LUI qui ouvre le tableau, et rien d'autre.
     Le sommaire porte « 5. Résultats des mesures 7 » — s'en servir comme borne
     ouvrait le tableau dès la table des matières, et le rappel réglementaire
     (« volet, portail, grille ») fabriquait quatre unités fantômes. */
  'N° Zone Unité de diagnostic Substrat Revêtement apparent Localisation mesure Etat* de conservation Classement UD Observation',
  '2 mesure 1 5,27 Etat d’usage (Traces',
  'B Plinthes Bois Peinture 2',
  '3 mesure 2 3,54 de chocs)',
  '- A Porte (P1) PVC Non mesurée - NM Absence de revêtement',
  '4 partie basse (< 1 m) 0,89',
  'A Mur Divers Peinture 0',
  '5 partie haute (> 1 m) 0,37',
  '6 partie basse (< 1 m) 0,54',
  'B Mur Divers Peinture 0',
  '7 partie haute (> 1 m) 0,67',
  '12 partie mobile 4,3 Etat d’usage (Traces',
  'A Fenêtre intérieure (F1) Bois Peinture 2',
  '13 Huisserie 4,79 de chocs)',
  '14 partie mobile 8,72 Etat d’usage (Traces',
  'A Fenêtre extérieure (F1) Bois Peinture 2',
  '15 Huisserie 6,79 de chocs)'
];

describe('les unités de diagnostic d’un CREP', () => {
  const unites = unitesDeDiagnostic(TABLEAU);

  it('ne fusionne pas les faces d’une même menuiserie', () => {
    /*
     * LE test de l'ordre de mission, § 3. Le lecteur précédent rendait deux
     * « Fenêtre » indistinguables ; le rapport écrit « intérieure » et
     * « extérieure », et ce sont deux unités de diagnostic.
     */
    const fenetres = unites.filter((u) => /fen[êe]tre/i.test(u.element));
    expect(fenetres).toHaveLength(2);
    expect(fenetres.map((f) => f.face)).toEqual(['intérieure', 'extérieure']);
    expect(new Set(fenetres.map((f) => f.element)).size).toBe(2);
  });

  it('garde la zone des murs, qui les distingue', () => {
    const murs = unites.filter((u) => /^Mur/i.test(u.element));
    expect(murs).toHaveLength(2);
    expect(murs.map((m) => m.zone)).toEqual(['A', 'B']);
  });

  it('rattache chaque unité à son local', () => {
    expect(unites.every((u) => u.local === 'Rez de chaussée - Plateau')).toBe(true);
  });

  it('ne fabrique aucune unité hors du tableau', () => {
    /* Les mots « volet », « plafond », « mur » figurent aussi dans le rappel
       réglementaire du CREP. Hors des bornes du tableau, ils ne sont rien. */
    const horsTableau = unitesDeDiagnostic([
      'y compris les revêtements extérieurs au logement (volet, portail, grille)',
      'les locaux objets du constat présentent au moins un plancher ou plafond',
      'plusieurs unités de diagnostic d’une même pièce recouvertes de moisissures'
    ]);
    expect(horsTableau).toEqual([]);
  });

  it('ne prête aucune concentration à une unité non mesurée', () => {
    /* Elles appartiennent aux unités voisines : les lui donner violerait
       l'interdiction de rattacher une mesure à la mauvaise UD. */
    const porte = unites.find((u) => /Porte/i.test(u.element));
    expect(porte?.mesures).toEqual([]);
  });

  it('retrouve les deux mesures de chaque menuiserie', () => {
    const fenetres = unites.filter((u) => /Fen[êe]tre/i.test(u.element));
    expect(fenetres.map((f) => f.mesures.map((m) => m.concentration))).toEqual([
      [4.3, 4.79],
      [8.72, 6.79]
    ]);
  });

  it('laisse une unité non mesurée SANS classe, avec son motif', () => {
    const porte = unites.find((u) => /Porte/i.test(u.element));
    expect(porte?.mesuree).toBe(false);
    /* Jamais classe 0 : c'est l'interdiction du § 17 de l'ordre. */
    expect(porte?.classe).toBeNull();
    expect(porte?.motif).toMatch(/Absence de rev/i);
  });

  it('conserve l’état de conservation et la nature de la dégradation', () => {
    const plinthes = unites.find((u) => /Plinthes/i.test(u.element));
    expect(plinthes?.etat).toBe('état d’usage');
    expect(plinthes?.degradation).toMatch(/Traces/i);
    expect(plinthes?.classe).toBe(2);
  });

  it('relève le substrat et le revêtement', () => {
    const plinthes = unites.find((u) => /Plinthes/i.test(u.element));
    expect(plinthes?.substrat).toBe('Bois');
    expect(plinthes?.revetement).toMatch(/Peinture/i);
  });

  it('ne prend pas le « 1 » de « partie basse (< 1 m) » pour une classe', () => {
    const murs = unites.filter((u) => /^Mur/i.test(u.element));
    expect(murs.map((m) => m.classe)).toEqual([0, 0]);
  });

  it('donne à chaque mesure son numéro et sa localisation', () => {
    /*
     * § 8 et § 55 : sans son numéro, une mesure n'est pas traçable jusqu'au
     * croquis, et le lecteur ne peut plus remonter de la classe à la source.
     */
    const plinthes = unites.find((u) => /Plinthes/i.test(u.element));
    expect(plinthes?.mesures).toEqual([
      { numero: 2, localisation: 'mesure 1', concentration: 5.27 },
      { numero: 3, localisation: 'mesure 2', concentration: 3.54 }
    ]);
  });

  it('garde la localisation exacte de chaque mesure sur l’unité', () => {
    const mur = unites.find((u) => u.zone === 'A' && /^Mur/i.test(u.element));
    expect(mur?.mesures.map((m) => m.localisation)).toEqual([
      'partie basse (< 1 m)',
      'partie haute (> 1 m)'
    ]);
  });
});

/**
 * LE FILIGRANE QUI REFERMAIT LES TABLEAUX.
 *
 * Un rapport en attente de règlement porte un filigrane imprimé sur CHAQUE
 * page. Il s'intercale entre le titre d'un local et son récapitulatif, et la
 * fonction qui nomme les locaux — qui remonte trois lignes et retient la
 * première ligne plausible — l'a retenu comme nom de local.
 *
 * Le faux titre entrait alors dans la liste des titres, et comme le titre d'un
 * local FERME le tableau du local précédent, il refermait le tableau à chaque
 * page où il apparaissait. Sur un volet de 407 unités : deux locaux entiers à
 * zéro unité, un troisième sans nom, 33 unités perdues.
 *
 * Le repère qui les sépare est mesuré, pas supposé : un vrai titre de local
 * apparaît UNE fois dans le volet, le filigrane vingt-cinq — une par page.
 */
describe('un élément de page n’est pas un titre de local', () => {
  /*
   * La forme relevée. Deux locaux : c'est le SECOND qui fait le mal, parce que
   * le filigrane tombe entre son titre et son récapitulatif — c'est là qu'il
   * devient un nom de local. Reproduit avec un seul local, le défaut ne se
   * manifeste pas : un premier test le montrait vert sans rien prouver.
   */
  const AVEC_FILIGRANE = [
    'RDC - Entrée',
    "Nombre d'unités de diagnostic : 3 - Nombre d'unités de diagnostic de classe 3 repéré : 0 soit 0 %",
    'N° Zone Unité de diagnostic Substrat Revêtement apparent Localisation mesure Etat* de conservation Classement UD Observation',
    '(mg/cm²)',
    '2 partie basse (< 1 m) 2,65',
    'NON VALIDE / NON PAYE',
    '3 B Mur Bois Peinture partie haute (> 1 m) 3,68 Non dégradé 1',
    'NON VALIDE / NON PAYE',
    '4 D Mur Bois Peinture au centre 6,1 Non dégradé 1',
    'NON VALIDE / NON PAYE',
    '- A Porte (P1) PVC Non mesurée - NM Absence de revêtement',
    'Classement des unités de diagnostic',
    /* Le second local : ici le filigrane s'intercale avant le récapitulatif. */
    'RDC - Chambre 1',
    'NON VALIDE / NON PAYE',
    "Nombre d'unités de diagnostic : 2 - Nombre d'unités de diagnostic de classe 3 repéré : 0 soit 0 %",
    'N° Zone Unité de diagnostic Substrat Revêtement apparent Localisation mesure Etat* de conservation Classement UD Observation',
    'A Plinthes Bois Peinture 0',
    'NON VALIDE / NON PAYE',
    'B Plafond Plâtre Peinture 0',
    'Classement des unités de diagnostic'
  ];

  const unites = unitesDeDiagnostic(AVEC_FILIGRANE);

  it('ne perd aucune unité située après le filigrane', () => {
    expect(unites).toHaveLength(5);
  });

  it('rattache toutes les unités à leur vrai local', () => {
    expect(unites.filter((u) => u.local === 'RDC - Entrée')).toHaveLength(3);
    expect(unites.filter((u) => u.local === 'RDC - Chambre 1')).toHaveLength(2);
  });

  it('ne donne à aucun local le nom du filigrane', () => {
    expect(unites.some((u) => /NON VALIDE/i.test(u.local ?? ''))).toBe(false);
  });

  it('ne fabrique aucune unité à partir du filigrane', () => {
    expect(unites.some((u) => /NON VALIDE/i.test(u.element))).toBe(false);
  });
});

/**
 * LA NOTE RÉGLEMENTAIRE N'OUVRE PAS LE TABLEAU.
 *
 * Tout CREP rappelle ce qu'est une unité de diagnostic : « un ou plusieurs
 * éléments de construction ayant même substrat et même revêtement ». La phrase
 * contient « unité de diagnostic » puis « substrat », et le motif d'ouverture,
 * qui acceptait n'importe quelle prose entre les deux, s'y déclenchait.
 *
 * Le tableau s'ouvrait alors 46 lignes trop tôt et laissait entrer le tableau
 * de synthèse du § 5 : « Sous-Sol - Escalier 3 » devenait une unité de classe 3
 * qui n'existe nulle part. Fabriquer une unité est plus grave que d'en perdre.
 *
 * Cette note figure dans TOUS les CREP : elle ne peut donc pas non plus servir
 * de signature d'éditeur.
 */
describe('la note réglementaire n’ouvre pas le tableau', () => {
  const NOTE =
    'NOTE Une unité de diagnostic (UD) est un ou plusieurs éléments de construction ayant même substrat et même revêtement.';

  it('ne fabrique aucune unité depuis le tableau de synthèse', () => {
    const unites = unitesDeDiagnostic([
      NOTE,
      '5. Résultats des mesures',
      'Total UD Classe 0 Classe 1 Classe 2 Classe 3',
      /* Les lignes du § 5 : un local, son effectif, et le classement à part. */
      'Sous-Sol - Escalier 3',
      '1 (33 %) 2 (67 %) - - -',
      'RDC - Escalier 13 3 (23 %) 8 (62 %) 2 (15 %) - -'
    ]);
    expect(unites).toEqual([]);
  });

  it('ne prend pas la note pour la signature de l’éditeur', () => {
    expect(reconnaitLiciel([NOTE])).toBeNull();
  });

  it('reconnaît toujours le vrai en-tête de colonnes', () => {
    const entete =
      'N° Zone Unité de diagnostic Substrat Revêtement apparent Localisation mesure Etat* de conservation Classement UD Observation';
    expect(reconnaitLiciel([entete])).not.toBeNull();
  });
});

/**
 * LES LOCAUX EXTÉRIEURS, DONT LES COLONNES SONT EMPILÉES.
 *
 * Sur les extérieurs, l'extraction empile les colonnes au lieu de les aligner :
 * le substrat part sur les lignes voisines et la ligne de l'unité n'en porte
 * plus. Le libellé perd sa borne de fin, et l'unité devient invisible.
 *
 * Elle garde pourtant une borne aussi sûre : la mention « non mesurée », qui
 * n'existe que dans la colonne des mesures. Deux volets perdaient chacun une
 * unité extérieure, avec le même motif — « 2 captées pour 3 annoncées ».
 */
describe('un local extérieur aux colonnes empilées', () => {
  const EXTERIEUR = [
    'RDC 1 - Extérieur',
    "Nombre d'unités de diagnostic : 3 - Nombre d'unités de diagnostic de classe 3 repéré : 0 soit 0 %",
    'N° Zone Unité de diagnostic Substrat Revêtement apparent Localisation mesure Etat* de conservation Classement UD Observation',
    '- Terrasse bois Bois Non mesurée - NM Absence de revêtement',
    'Façade',
    '- Mur Non mesurée - NM Absence de revêtement',
    'Pierre',
    'Végétations',
    '- A bord immédiat Non mesurée - NM Absence de revêtement',
    'diverses',
    'Classement des unités de diagnostic'
  ];

  const unites = unitesDeDiagnostic(EXTERIEUR);

  it('retrouve les trois unités annoncées', () => {
    expect(unites).toHaveLength(3);
  });

  it('lit le libellé même sans substrat sur la ligne', () => {
    expect(unites.map((u) => u.element)).toEqual(['Terrasse bois', 'Mur', 'bord immédiat']);
  });

  it('laisse ces unités sans classe, avec leur motif', () => {
    expect(unites.every((u) => u.classe === null)).toBe(true);
    expect(unites.every((u) => u.mesuree === false)).toBe(true);
    expect(unites.every((u) => /Absence de rev/i.test(u.motif ?? ''))).toBe(true);
  });
});

/**
 * L'UNITÉ DONT LE NOM EST PARTI SUR LES LIGNES VOISINES.
 *
 * Dernière disposition rencontrée, et la plus retorse. L'extraction rejette le
 * nom de l'unité sur ses deux voisines, mêlé aux mesures, et ne laisse sur la
 * ligne de l'unité que sa zone, son substrat, son revêtement et sa classe.
 *
 * ⚠️ LE PIÈGE : « Huisserie » seule est une LOCALISATION DE MESURE, et elle
 * avait été retirée de la liste des éléments pour cette raison. Ce qui
 * distingue les deux n'est pas le mot mais la forme de la ligne.
 */
describe('l’unité dont le libellé est sur les lignes voisines', () => {
  const ECLATE = [
    '4ème étage - Séjour/Cuisine',
    "Nombre d'unités de diagnostic : 2 - Nombre d'unités de diagnostic de classe 3 repéré : 0 soit 0 %",
    'N° Zone Unité de diagnostic Substrat Revêtement apparent Localisation mesure Etat* de conservation Classement UD Observation',
    '14 partie basse (< 1 m) 0,08',
    'A Fenêtre intérieure (F1) Bois Peinture 0',
    '15 partie haute (> 1 m) 0,32',
    '16 Huisserie Fenêtre partie basse (< 1 m) 0,27',
    'A Bois Peinture 0',
    '17 intérieure (F1) partie haute (> 1 m) 0,31',
    'Classement des unités de diagnostic'
  ];

  const unites = unitesDeDiagnostic(ECLATE);

  it('ne perd pas l’unité privée de son nom', () => {
    expect(unites).toHaveLength(2);
  });

  it('recompose son libellé à partir des deux voisines, sans rien inventer', () => {
    expect(unites[1]?.element).toBe('Huisserie Fenêtre intérieure (F1)');
  });

  it('lui rend sa zone, son substrat et sa classe', () => {
    expect(unites[1]?.zone).toBe('A');
    expect(unites[1]?.substrat).toBe('Bois');
    expect(unites[1]?.classe).toBe(0);
  });

  it('rattache ses DEUX mesures, malgré le mot « Fenêtre » sur la ligne du haut', () => {
    /* La ligne « 16 Huisserie Fenêtre partie basse… » ouvre sur un numéro : elle
       appartient à la colonne de gauche, et n'est donc pas une unité. Le lecteur
       la prenait pour telle et perdait sa mesure. */
    expect(unites[1]?.mesures.map((m) => m.concentration)).toEqual([0.27, 0.31]);
  });

  it('⚠️ ne fabrique aucune unité depuis une simple localisation de mesure', () => {
    /* « Huisserie » seule, dans la colonne de gauche, n'est pas une unité : elle
       n'a ni zone, ni substrat, ni revêtement, ni classement. */
    expect(
      unitesDeDiagnostic([
        'N° Zone Unité de diagnostic Substrat Revêtement apparent Localisation mesure Etat* de conservation Classement UD Observation',
        '12 partie mobile 4,3',
        '13 Huisserie 4,79',
        'Classement des unités de diagnostic'
      ])
    ).toEqual([]);
  });
});
