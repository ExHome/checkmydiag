/**
 * Les unités de diagnostic, éprouvées sur la FORME réelle d'un tableau LICIEL.
 *
 * Les lignes ci-dessous reproduisent la disposition observée dans un volet lu
 * en entier — colonnes entrelacées comprises. Aucune donnée du rapport : ni
 * adresse, ni nom, ni numéro de dossier. Seule la forme est reprise, parce que
 * c'est elle qui casse les lecteurs.
 */
import { describe, expect, it } from 'vitest';
import { unitesDeDiagnostic } from './liciel';

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
