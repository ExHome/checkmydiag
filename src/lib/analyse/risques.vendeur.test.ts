import { describe, expect, it } from 'vitest';
import { analyserErp, champsDuVendeur } from './risques';

/**
 * Les rubriques de l'état des risques que le VENDEUR doit remplir.
 *
 * Elles ne relèvent pas du diagnostiqueur, et le vendeur ignore le plus souvent
 * qu'elles existent. Fragments anonymisés, calqués sur la mise en page réelle.
 */
const ARGILES = [
  'Argiles - Information relative aux travaux non réalisés',
  'Conformément aux dispositions de l’article R125-24 du Code de l’environnement pris en son',
  'dernier alinéa :',
  'Oui Non',
  'L’immeuble présente des désordres répondant aux critères énoncés dans l’article ci-dessus reproduit.'
];

const SINISTRES = [
  'Déclaration de sinistres indemnisés',
  'Si, à votre connaissance, l’immeuble a fait l’objet d’une indemnisation suite à des dommages consécutifs à des',
  'événements ayant eu pour conséquence la publication d’un arrêté de catastrophe naturelle, cochez ci-dessous la',
  'case correspondante dans la colonne "Indemnisé".',
  'Risque Début Fin JO Indemnisé'
];

describe('les rubriques à remplir par le vendeur', () => {
  it('reconnaît la rubrique des argiles', () => {
    expect(champsDuVendeur(ARGILES).argiles).toBe(true);
  });

  it('reconnaît le tableau des sinistres indemnisés', () => {
    expect(champsDuVendeur(SINISTRES).sinistres).toBe(true);
  });

  it('ne les invente pas quand elles sont absentes', () => {
    const c = champsDuVendeur(['Etat des Risques et Pollutions', 'Zonage de sismicité : 2 - Faible']);
    expect(c.argiles).toBe(false);
    expect(c.sinistres).toBe(false);
  });
});

describe('ce que la fiche en dit', () => {
  const diag = analyserErp(
    ['Etat des Risques et Pollutions', 'Document réalisé le : 12/11/2024', ...SINISTRES, ...ARGILES],
    [13, 27]
  );

  it('signale les deux rubriques au lecteur', () => {
    const dits = (diag.releves ?? []).map((r) => r.libelle).join(' ');
    expect(dits).toMatch(/Indemnisé/);
    expect(dits).toMatch(/R125-24/);
  });

  /*
   * Le garde-fou. Une coche manuscrite ne sort pas d'un PDF : affirmer que le
   * vendeur a oublié de remplir serait affirmer plus que ce qu'on sait. On dit
   * que la rubrique existe et qu'il faut vérifier sur son exemplaire.
   */
  it('n’affirme pas que le vendeur a oublié', () => {
    const dits = (diag.releves ?? []).map((r) => r.libelle).join(' ');
    expect(dits).not.toMatch(/n’a pas rempli|oubli|manquant|non rempli/i);
    expect(dits).toMatch(/vérifiez|à cocher par lui/i);
  });
});
