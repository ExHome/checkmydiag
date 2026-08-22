/**
 * LA CONTRAINTE, TENUE PAR UN TEST.
 *
 * « Une règle comprise ne se réapprend pas : un TEST, pas un commentaire. »
 * Ce fichier garde l'ordre du 21/08/2026 — un lecteur par éditeur, choisi sur
 * signature, l'éditeur nommé avant de lire, le repli déclaré.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  choisirLecteur,
  editeursCouverts,
  inscrireLecteur,
  viderRegistre,
  type Contexte
} from './lecteurs';
import type { Generateur } from '../atelier/editeur';
import type { Diagnostic } from '../modele';

const gen = (editeur: string | null): Generateur => ({
  editeur,
  societe: null,
  logiciel: null,
  version: null,
  source: editeur ? 'signature' : 'inconnue',
  preuve: '',
  genre: 'diagnostic'
});

const diag = (nom: string): Diagnostic =>
  ({ type: 'amiante', titre: nom, plage: [1, 1] }) as unknown as Diagnostic;

const contexte = (generateur: Generateur): Contexte => ({
  lignes: [],
  plage: [1, 1],
  generateur
});

beforeEach(() => viderRegistre());

describe('un lecteur par éditeur, choisi sur signature', () => {
  it("prend le lecteur de l'éditeur quand il en existe un", () => {
    inscrireLecteur('amiante', null, () => diag('repli'));
    inscrireLecteur('amiante', 'LICIEL', () => diag('liciel'));
    inscrireLecteur('amiante', 'BC2E', () => diag('bc2e'));

    const choix = choisirLecteur('amiante', gen('BC2E'));
    expect(choix?.editeur).toBe('BC2E');
    expect(choix?.repli).toBe(false);
    expect(choix?.lecteur(contexte(gen('BC2E'))).titre).toBe('bc2e');
  });

  it('ne prend PAS le lecteur d’un autre éditeur', () => {
    inscrireLecteur('amiante', 'LICIEL', () => diag('liciel'));
    // Aucun repli inscrit : plutôt rien que la carte du voisin.
    expect(choisirLecteur('amiante', gen('BC2E'))).toBeNull();
  });

  it('déclare le repli, il ne se fait jamais en silence', () => {
    inscrireLecteur('amiante', null, () => diag('repli'));
    inscrireLecteur('amiante', 'LICIEL', () => diag('liciel'));

    const choix = choisirLecteur('amiante', gen('Éditeur jamais lu'));
    expect(choix?.repli).toBe(true);
    expect(choix?.editeur).toBeNull();
  });

  it('replie aussi quand la signature ne nomme personne', () => {
    inscrireLecteur('amiante', null, () => diag('repli'));
    const choix = choisirLecteur('amiante', gen(null));
    expect(choix?.repli).toBe(true);
  });

  it('refuse deux replis pour le même volet — ce serait le lecteur unique', () => {
    inscrireLecteur('amiante', null, () => diag('repli'));
    expect(() => inscrireLecteur('amiante', null, () => diag('bis'))).toThrow(/repli/i);
  });

  it('refuse deux lecteurs pour le même éditeur', () => {
    inscrireLecteur('plomb', 'LICIEL', () => diag('a'));
    expect(() => inscrireLecteur('plomb', 'LICIEL', () => diag('b'))).toThrow(/LICIEL/);
  });

  it('ne mélange pas les volets', () => {
    inscrireLecteur('amiante', 'BC2E', () => diag('amiante-bc2e'));
    expect(choisirLecteur('plomb', gen('BC2E'))).toBeNull();
    expect(editeursCouverts('amiante')).toEqual(['BC2E']);
    expect(editeursCouverts('plomb')).toEqual([]);
  });
});

describe("l'éditeur est nommé AVANT de lire", () => {
  it('un lecteur reçoit toujours le générateur dans son contexte', () => {
    let vu: Generateur | null = null;
    inscrireLecteur('amiante', 'LICIEL', (c) => {
      vu = c.generateur;
      return diag('liciel');
    });

    const choix = choisirLecteur('amiante', gen('LICIEL'));
    choix?.lecteur(contexte(gen('LICIEL')));

    expect(vu).not.toBeNull();
    expect(vu!.editeur).toBe('LICIEL');
  });
});
