import { describe, expect, it } from 'vitest';
import type { Lettre } from '../modele';
import { PASSOIRES, partDuParc, situationDans } from './parc';

const LETTRES: Lettre[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

describe('le parc de logements par classe', () => {
  it('répartit tout le parc, sans trou ni doublon', () => {
    const total = LETTRES.reduce((n, l) => n + partDuParc(l).part, 0);
    // Les sept parts couvrent l'ensemble : un écart signalerait une valeur mal
    // recopiée du tableau du SDES.
    expect(Math.round(total)).toBe(100);
  });

  it('cumule correctement ce qui fait mieux', () => {
    expect(partDuParc('A').mieux).toBe(0);
    // A + B + C = 3,3 + 5,3 + 27,2
    expect(partDuParc('D').mieux).toBe(35.8);
    // Tout sauf G
    expect(partDuParc('G').mieux).toBe(95.2);
  });

  it('retrouve la part des passoires par le calcul', () => {
    const fg = partDuParc('F').part + partDuParc('G').part;
    // 7,9 + 4,8 = 12,7 : la valeur publiée doit tomber d'elle-même.
    expect(Math.round(fg * 10) / 10).toBe(PASSOIRES.part);
  });

  it('dit la situation sans lui donner une précision qu’elle n’a pas', () => {
    for (const l of LETTRES) {
      const phrase = situationDans(l);
      expect(phrase).toMatch(/environ/i);
      // Des estimations extrapolées ne se disent pas à la décimale.
      expect(phrase).not.toMatch(/\d+,\d/);
      expect(phrase).toMatch(/r[ée]sidences principales/);
    }
  });

  it('nomme le haut et le bas du parc', () => {
    expect(situationDans('A')).toMatch(/haut du parc/);
    expect(situationDans('G')).toMatch(/bas du parc/);
    expect(situationDans('D')).toMatch(/font mieux/);
  });
});
