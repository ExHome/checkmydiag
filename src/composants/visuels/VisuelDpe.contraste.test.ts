import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * L'encre de la pastille tient-elle sur les sept teintes de l'arrêté ?
 *
 * La pastille de la ligne de réponse reprend la couleur de la marche touchée —
 * sept fonds possibles, une seule encre. La première version échouait sur deux
 * d'entre eux (A à 4,39 et G à 3,98) : les couleurs réglementaires ne se
 * retouchant pas, c'est l'encre qui doit tenir partout.
 *
 * Le test lit l'encre DANS LE COMPOSANT plutôt que de la recopier : une valeur
 * répétée dans le test ne garde rien, elle se contente de vieillir à côté.
 */

const LUM = (r: number, g: number, b: number): number => {
  const f = (v: number): number => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const contraste = (a: [number, number, number], b: [number, number, number]): number => {
  const l1 = LUM(...a);
  const l2 = LUM(...b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

const hex = (s: string): [number, number, number] => [
  parseInt(s.slice(1, 3), 16),
  parseInt(s.slice(3, 5), 16),
  parseInt(s.slice(5, 7), 16)
];

/** Les sept teintes de l'étiquette, telles qu'app.css les définit. */
const ETIQUETTES: Record<string, string> = {
  A: '#319834',
  B: '#33cc31',
  C: '#cbfc34',
  D: '#fbfe06',
  E: '#fbcc05',
  F: '#fc9935',
  G: '#fc0205'
};

describe('la pastille de la ligne de réponse', () => {
  const source = readFileSync(
    new URL('./VisuelDpe.svelte', import.meta.url),
    'utf8'
  );

  /** L'encre déclarée dans `.pastille-lettre`. */
  const encre = (() => {
    const bloc = source.slice(source.indexOf('.pastille-lettre'));
    const m = /color:\s*(#[0-9a-fA-F]{6})/.exec(bloc);
    return m?.[1] ?? '';
  })();

  it('déclare bien une encre en dur', () => {
    expect(encre).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it.each(Object.entries(ETIQUETTES))(
    'tient le seuil AA sur la classe %s',
    (_lettre, teinte) => {
      expect(contraste(hex(encre), hex(teinte))).toBeGreaterThanOrEqual(4.5);
    }
  );

  it('échouerait avec l’encre d’origine — c’est bien ce qui a été corrigé', () => {
    /* #16240f donnait 4,39 sur le A et 3,98 sur le G. Le test garde la trace du
       défaut : sans lui, rien n'empêche d'y revenir. */
    expect(contraste(hex('#16240f'), hex(ETIQUETTES.G!))).toBeLessThan(4.5);
  });
});
