import { describe, expect, it } from 'vitest';
import { lireTransaction, validite } from './transaction';

/**
 * Extraits fidèles de deux dossiers réels : un DDT de location (janvier 2023)
 * et un DDT de vente (octobre 2024). Le préambule de l'électricité y annonce
 * une durée différente, et la surface demandée n'est pas la même.
 */
const LOCATION = [
  'Attestation de surface habitable',
  'en vue de reporter leur superficie dans le bail d’habitation d’un logement vide',
  'l’état de l’installation électrique prévu à l’article 3 - 3 de la loi n°89 - 462 du 6 juillet 1989',
  'Cet état de l’installation intérieure d’électricité a une durée de validité de 6 ans.',
  'Bailleur',
  'Locataire'
]; // les deux dernières lignes ne comptent pas : voir le commentaire du module

const VENTE = [
  'Certificat de superficie de la partie privative',
  'Cet état de l’installation intérieure d’électricité a une durée de validité de 3 ans.',
  'X Les parties privatives X Avant la vente',
  'Vendeur',
  'Acquéreur'
];

describe('vente ou location', () => {
  it('reconnaît un dossier de location', () => {
    const { transaction, indices } = lireTransaction(LOCATION);
    expect(transaction).toBe('location');
    expect(indices.length).toBeGreaterThanOrEqual(3);
  });

  it('reconnaît un dossier de vente', () => {
    expect(lireTransaction(VENTE).transaction).toBe('vente');
  });

  it('se tait quand les indices se contredisent', () => {
    // Cela existe : un propriétaire qui fait tout faire d'un coup. Mieux vaut
    // se taire qu'annoncer une durée fausse.
    const { transaction } = lireTransaction([
      'Attestation de surface habitable',
      'Cet état de l’installation intérieure d’électricité a une durée de validité de 6 ans.',
      'Certificat de superficie de la partie privative',
      'X Avant la vente'
    ]);
    expect(transaction).toBeNull();
  });

  it('se tait quand le dossier ne dit rien', () => {
    expect(lireTransaction(['Diagnostic de performance énergétique']).transaction).toBeNull();
  });

  it('nomme les indices qu’il a retenus', () => {
    const { indices } = lireTransaction(LOCATION);
    expect(indices.map((i) => i.marque).join(' · ')).toMatch(/validité de 6 ans/);
  });
});

describe('la durée de validité qui en découle', () => {
  it('donne trois ans à la vente, six à la location', () => {
    expect(validite('electricite', 'vente')).toBe('trois ans');
    expect(validite('gaz', 'location')).toBe('six ans');
  });

  it('énonce les deux quand la transaction est inconnue', () => {
    expect(validite('electricite', null)).toMatch(/trois ans à la vente, six ans à la location/);
  });

  it('traite le plomb à part : c’est le résultat qui commande', () => {
    // Un constat négatif ne périme pas ; un constat positif vaut un an à la
    // vente, même si le plomb trouvé est en parfait état.
    expect(validite('plomb', 'vente', false)).toBe('sans limite de durée');
    expect(validite('plomb', 'vente', true)).toBe('un an');
    expect(validite('plomb', 'location', true)).toBe('six ans');
  });
});
