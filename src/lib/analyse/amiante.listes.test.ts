/**
 * Les neuf formes du § 1.1 de LICIEL, telles qu'elles sont imprimées.
 *
 * Chaque cas vient d'un volet lu en entier le 21/08/2026. Les localisations
 * sont conservées telles quelles : ce sont des noms de pièces, jamais de
 * personnes.
 */
import { describe, expect, it } from 'vitest';
import { conclusionsParListe, normaliser } from './amiante.listes';

describe('§ 1.1 chez LICIEL — la ligne à tiret porte le sens', () => {
  it('lit une absence, dite sur la ligne du libellé', () => {
    const lignes = [
      "1.1 Liste A : Dans le cadre de mission décrit à l'article 3.2 , il n'a pas été repéré",
      "- de matériaux ou produits de la liste A contenant de l'amiante.",
      "1.1 Liste B : Dans le cadre de mission décrit à l'article 3.2 , il n'a pas été repéré",
      "- de matériaux ou produits de la liste B contenant de l'amiante."
    ];
    expect(conclusionsParListe(lignes)).toEqual([
      { liste: 'A', etat: 'absence', justifications: [] },
      { liste: 'B', etat: 'absence', justifications: [] }
    ]);
  });

  it('lit une présence sur jugement, avec sa justification', () => {
    const lignes = [
      "1.1 Liste B : D ans le cadre de mission décrit à l'article 3.2 , il a été repéré :",
      "- des matériaux et produits de la liste B contenant de l'amiante sur jugement personnel :",
      'Revêtements durs (amiante - ciment) (RDC - Chambre 3) pour lequel il est recommandé de réaliser une',
      'évaluation périodique.*'
    ];
    expect(conclusionsParListe(lignes)).toEqual([
      { liste: 'B', etat: 'presence', justifications: ['sur jugement personnel'] }
    ]);
  });

  it("⚠️ ne prend PAS pour une présence l'absence prouvée par analyse", () => {
    // Le seul volet du corpus où le laboratoire innocente la liste A.
    const lignes = [
      "1.1 Liste A : Dans le cadre de mission décrit à l'article 3.2, il a été repéré :",
      "- des matériaux et produits de la liste A ayant fait l'objet d'analyse, ne contenant pas d'amiante :",
      'Faux plafonds (habitation étage - Palier; habitation étage - Chambre 1)'
    ];
    expect(conclusionsParListe(lignes)).toEqual([
      { liste: 'A', etat: 'absence', justifications: ['après analyse'] }
    ]);
  });

  it('⚠️ ne referme pas un dossier que le laboratoire n’a pas rendu', () => {
    const lignes = [
      "1.1 Liste A : Dans le cadre de mission décrit à l'article 3.2, il a été repéré :",
      "- des matériaux et produits de la liste A pour lesquels les résultats d'analyse des sondages et/ou",
      'prélèvements sont attendus :',
      "Faux plafonds (habitation étage - Palier) / En attente des résultats d'analyse)"
    ];
    expect(conclusionsParListe(lignes)[0]).toMatchObject({ liste: 'A', etat: 'nonConclu' });
  });

  it('⚠️ ne conclut pas quand rien n’a été prélevé', () => {
    const lignes = [
      "1.1 Liste B : Dans le cadre de mission décrit à l'article 3.2, il a été repéré :",
      '- des matériaux et produits de la liste B pour lesquels des sondages et/ou prélèvements doivent',
      'être effectués :',
      'Conduits (Sous - Sol - Cave) / Non prélevé pour ne pas altérer sa fonction)'
    ];
    expect(conclusionsParListe(lignes)[0]).toMatchObject({ liste: 'B', etat: 'nonConclu' });
  });

  it('lit les QUATRE lignes à tiret d’une même liste, et la présence l’emporte', () => {
    // Copropriété de quatre niveaux, DTA de parties communes, 21/08.
    const lignes = [
      "1.1 Liste A : D ans le cadre de mission décri t à l'article 3.2, il a été repéré :",
      "- des matériaux et produits de la liste A contenant de l'amiante sur anciennes analyses :",
      'Flocages (Sous - Sol - Parties Communes / Caves) pour lequel il faut faire réaliser des travaux',
      'de retrait ou de confinement.*',
      "1.1 Liste B : D ans le cadre de mission décrit à l'article 3.2, il a été repéré :",
      "- des matériaux et produits de la liste B contenant de l'amiante sur anciennes analyses :",
      'Conduits (Rez de chaussée / Extérieur - Local 2) pour lequel il est recommandé de réaliser une',
      "- des matériaux et produits de la liste B contenant de l'amiante après analyse en laboratoire :",
      'Conduits (Sous - Sol - Parties Communes / Caves) pour lequel il est recommandé de réaliser',
      "- des matériaux et produits de la liste B contenant de l'amiante sur décision de l'opérateur :",
      'Plaques (fibres - ciment) (Rez de chaussée / Exterieur - Extérieur / Parking) pour lequel il est',
      '- des matéria ux et produits de la liste B pour lesquels des sondages et/ou prélèvements doivent',
      'être effectués :',
      "SARL DGLM EXPERTISES | Tél. : 06.72.70.03.38", // pied de page : ne doit pas borner
      '2 / 25',
      "Constat de repérage Amiante n° 22/IMO/0144N", // en-tête : ne doit pas borner non plus
      'Conduits (Sous - Sol - Parties Communes / Caves) / Non prélevé pour ne pas altérer sa',
      "1.2. Dans le cad re de mission décrit à l'article 3.2 les locaux ou parties de locaux"
    ];
    const c = conclusionsParListe(lignes);
    expect(c).toHaveLength(2);
    expect(c[0]).toMatchObject({ liste: 'A', etat: 'presence' });
    expect(c[1]?.liste).toBe('B');
    expect(c[1]?.etat).toBe('presence');
    /*
     * Les QUATRE lignes à tiret sont lues — y compris la dernière, dont le mot
     * « matéria ux » est coupé par l'extraction et qui était ratée avant la
     * correction du 21/08.
     */
    expect(c[1]?.justifications).toEqual([
      'sur anciennes analyses',
      'après analyse en laboratoire',
      "sur décision de l'opérateur",
      'sondages ou prélèvements à faire'
    ]);
  });

  it('résiste aux trois dialectes typographiques de LICIEL', () => {
    const espacee = [
      "1. 1 Liste B : D ans le cadre de mission décrit à l’article 3.2 , il a été repéré :",
      "- des matériaux et produits de la liste B contenant de l’amiante sur décision de l’opérateur :"
    ];
    expect(conclusionsParListe(espacee)[0]).toMatchObject({ liste: 'B', etat: 'presence' });

    const apostropheEspacee = [
      "1.1 Liste A : Dans le cadre de mission décrit à l ’ article 3.2 , il n'a pas été repéré",
      "- de matériaux ou produits de la liste A contenant de l ’ amiante."
    ];
    expect(apostropheEspacee.map(normaliser)[1]).toContain("l'amiante");
    expect(conclusionsParListe(apostropheEspacee)[0]).toMatchObject({ etat: 'absence' });
  });

  it('⚠️ lit la ligne même quand LICIEL coupe le mot en deux', () => {
    // « conte nant » : le faux négatif du 21/08, sur une copropriété amiantée.
    const lignes = [
      "1.1 Liste B : D ans le cadre de mission décrit à l'article 3.2, il a été repéré :",
      "- des matériaux et produits de la liste B conte nant de l'amiante sur décision de l'opérateur :",
      'Conduits (Sous - Sol - Cave) pour lequel il est recommandé de réaliser une évaluation'
    ];
    expect(conclusionsParListe(lignes)[0]).toMatchObject({ liste: 'B', etat: 'presence' });
  });

  it('lit aussi la conclusion portée par la ligne du libellé', () => {
    const lignes = [
      "Liste A : il n'a pas été repéré de matériaux contenant de l'amiante.",
      "Liste B : il a été repéré des matériaux contenant de l'amiante."
    ];
    expect(conclusionsParListe(lignes)).toEqual([
      { liste: 'A', etat: 'absence', justifications: [] },
      { liste: 'B', etat: 'presence', justifications: [] }
    ]);
  });

  it('ne dit rien du texte d’annexe, qui parle pourtant de listes', () => {
    const annexe = [
      "Conséquences réglementaires suivant l'état de conservation des matériaux ou produit de la liste A",
      'Score 3 – Les travaux de confinement ou de retrait de l’amiante sont mis en œuvre',
      "Grilles d’évaluation de l’état de conservation des matériaux ou produit de la liste B"
    ];
    expect(conclusionsParListe(annexe)).toEqual([]);
  });
});
