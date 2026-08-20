import { describe, it, expect } from 'vitest';

/**
 * La garde de cohérence du tableau des surfaces.
 *
 * Le composant ne s'affiche que si la somme de ses lignes retombe sur le total
 * imprimé. La règle est reprise ici telle quelle : c'est elle qui protège les
 * 5 dossiers sur 32 du corpus où le relevé ne s'additionne pas.
 */
const sommeFiable = (
  pieces: { privative: number }[],
  totalPrivative: number | null
): boolean => {
  if (totalPrivative === null) return true;
  const somme = pieces.reduce((n, p) => n + p.privative, 0);
  const marge = Math.max(0.15, totalPrivative * 0.005);
  return Math.abs(somme - totalPrivative) <= marge;
};

describe('la somme des pièces retombe-t-elle sur le total ?', () => {
  it('accepte un relevé exact', () => {
    const pieces = [{ privative: 18.2 }, { privative: 11.4 }, { privative: 7.9 }, { privative: 4.5 }];
    expect(sommeFiable(pieces, 42)).toBe(true);
  });

  it('tolère les arrondis au centième', () => {
    /* Chaque ligne du certificat est arrondie ; sur une dizaine de pièces,
       l'écart cumulé atteint quelques centièmes sans que rien ne soit faux. */
    const pieces = Array.from({ length: 10 }, () => ({ privative: 4.44 }));
    expect(sommeFiable(pieces, 44.35)).toBe(true);
  });

  it('refuse le dossier à 1 457 m² pour 22,93 annoncés', () => {
    /* Cas réel du corpus : des nombres d'un autre tableau ramassés au passage. */
    expect(sommeFiable([{ privative: 1457.93 }], 22.93)).toBe(false);
  });

  it('refuse le dossier où aucune ligne n’a été reconnue', () => {
    /* Cas réel du corpus : 0 m² de lignes pour 19,2 m² annoncés. */
    expect(sommeFiable([{ privative: 0 }], 19.2)).toBe(false);
  });

  it('refuse un relevé incomplet', () => {
    /* Cas réel : 13,42 m² lus pour 59,9 m² annoncés — des pièces manquent. */
    expect(sommeFiable([{ privative: 13.42 }], 59.9)).toBe(false);
  });

  it('laisse passer quand le rapport n’imprime pas de total', () => {
    /* Sans total, il n'y a rien à contredire : on ne peut pas juger, et se
       taire priverait le lecteur d'un tableau peut-être juste. */
    expect(sommeFiable([{ privative: 12 }], null)).toBe(true);
  });

  it('élargit la marge sur les grands biens', () => {
    /* 0,5 % de 236 m² fait 1,18 m² : sur cinquante lignes arrondies, c'est
       l'ordre de grandeur du cumul d'arrondis. */
    expect(sommeFiable([{ privative: 235.2 }], 236)).toBe(true);
    expect(sommeFiable([{ privative: 230 }], 236)).toBe(false);
  });
});
