import { describe, expect, it } from 'vitest';
import { validiteDuConstat } from './plomb';

/**
 * La rubrique 6.3 « Validité du constat », et ses quatre réponses.
 *
 * Formes mesurées le 21/08/2026 sur 200 volets plomb du corpus :
 *
 *     120  « durée de validité de N an(s) (jusqu'au JJ/MM/AAAA) »
 *      30  « pas lieu de faire établir un nouveau constat à chaque MUTATION »
 *      13  la même chose « à chaque nouveau CONTRAT DE LOCATION »
 *      29  rubrique absente
 *       3  rubrique VIDE
 *       5  forme non reconnue
 *
 * Fragments anonymisés, recopiés dans l'ordre de l'extraction.
 */

describe('la validité que le constat écrit lui-même', () => {
  it('lit la date de fin, et garde la phrase entière', () => {
    const r = validiteDuConstat([
      '6.3 Commentaires',
      'Constatations diverses :',
      'Néant',
      'Validité du constat :',
      'Du fait de la présence de revêtement contenant du plomb à des concentrations supérieures aux seuils définis',
      'par arrêté des ministres chargés de la santé et de la construction, le présent constat a une durée de validité',
      "de 1 an (jusqu'au 14/09/2026).",
      'Documents remis par le donneur d’ordre à l’opérateur de repérage :',
      'Néant'
    ]);
    expect(r?.jusquAu).toBe('14/09/2026');
    /* On cite, puis on explique : la phrase du rapport reste entière. */
    expect(r?.terme).toMatch(/durée de validité/);
    expect(r?.terme).not.toMatch(/Documents remis/);
  });

  it('reconnaît le constat qui ne périme pas, en vente', () => {
    const r = validiteDuConstat([
      'Validité du constat :',
      "Du fait de l'absence de revêtement contenant du plomb ou la présence de revêtements contenant du plomb",
      'à des concentrations inférieures aux seuils définis par arrêté des ministres chargés de la santé et de la',
      "construction, il n'y a pas lieu de faire établir un nouveau constat à chaque mutation. Le présent constat sera",
      'joint à chaque mutation',
      'Documents remis par le donneur d’ordre à l’opérateur de repérage :'
    ]);
    expect(r?.sansLimite).toBe(true);
    expect(r?.jusquAu).toBeUndefined();
  });

  it('reconnaît la même réponse écrite pour la location', () => {
    const r = validiteDuConstat([
      'Validité du constat :',
      "construction, il n'y a pas lieu de faire établir un nouveau constat à chaque nouveau contrat de location. Le",
      'présent constat sera joint à chaque contrat de location (article L 1334 - 7 du Code de la Santé Publique).',
      'Documents remis par le donneur d’ordre à l’opérateur de repérage :'
    ]);
    expect(r?.sansLimite).toBe(true);
  });

  it('ne conclut rien quand la rubrique est vide', () => {
    /*
     * Trois volets sur 200 : un CREP de parties communes, où la durée en années
     * ne s'applique pas. Vide n'est pas « non trouvé », et ce n'est pas non plus
     * « sans limite » — on se tait, et le calcul reprend la main.
     */
    expect(
      validiteDuConstat([
        'Validité du constat :',
        'Documents remis par le donneur d’ordre à l’opérateur de repérage :'
      ])
    ).toBeNull();
  });

  it('ne conclut rien quand la rubrique est absente', () => {
    expect(validiteDuConstat(['6.3 Commentaires', 'Constatations diverses :', 'Néant'])).toBeNull();
  });

  it('n’est pas mis en échec par l’apostrophe typographique', () => {
    /* « jusqu’au » et « jusqu'au » circulent tous les deux. */
    const r = validiteDuConstat([
      'Validité du constat :',
      'le présent constat a une durée de validité de 6 ans (jusqu’au 08/04/2031).'
    ]);
    expect(r?.jusquAu).toBe('08/04/2031');
  });
});
