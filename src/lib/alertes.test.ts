/**
 * L'ÉCRAN DES ALERTES PORTE LES TROIS CHOSES QU'ON EMPORTE CHEZ LE NOTAIRE.
 *
 * Ordre d'Aude, diagnostiqueuse : « dans alerte on met toutes les incohérences
 * du dossier et tous les problèmes de validité et de ce qui n'a pas été vu ».
 *
 * Les deux premières y étaient. La troisième — ce que le diagnostiqueur n'a
 * PAS pu regarder — vivait dans le détail de chaque diagnostic, où il fallait
 * aller la chercher rapport par rapport. C'est pourtant l'information la plus
 * facile à manquer et l'une des plus lourdes : là où personne n'est allé,
 * personne ne sait.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const VERDICT = readFileSync('src/composants/Verdict.svelte', 'utf8');

describe('l’écran des alertes', () => {
  it('remonte les problèmes de validité', () => {
    expect(VERDICT).toMatch(/parGenre\('perime'\)/);
  });

  it('remonte les incohérences du dossier', () => {
    expect(VERDICT).toMatch(/parGenre\('incoherence'\)/);
  });

  it('remonte les rapports absents', () => {
    expect(VERDICT).toMatch(/parGenre\('manque'\)/);
  });

  /**
   * Les deux genres comptent, et pour des raisons différentes : `nonVisite`
   * est un local où l'on n'a pas pu entrer, `nonVerifie` un point qu'on n'a
   * pas pu contrôler. N'en ramasser qu'un laisserait la moitié des angles
   * morts invisibles.
   */
  it('remonte ce qui n’a pas pu être vu', () => {
    expect(VERDICT).toMatch(/const nonVus = \$derived/);
    expect(VERDICT).toMatch(/'nonVisite'/);
    expect(VERDICT).toMatch(/'nonVerifie'/);
    expect(VERDICT, 'la ligne doit entrer dans la liste des alertes').toMatch(/cle: 'non-vus'/);
  });

  /**
   * Une cave fermée n'est pas une anomalie. Annoncer un angle mort sur le ton
   * d'un défaut ferait croire au lecteur qu'on a trouvé quelque chose — alors
   * qu'on lui dit exactement l'inverse : on ne sait pas.
   */
  it('ne présente pas un angle mort comme un défaut', () => {
    const bloc = VERDICT.slice(VERDICT.indexOf("cle: 'non-vus'"));
    const ton = bloc.slice(0, 200).match(/ton:\s*'(\w+)'/);
    expect(ton?.[1], 'un endroit non visité se dit « à surveiller », jamais « ça coince »').toBe(
      'moyen'
    );
  });

  /**
   * Le détail nomme le diagnostic et l'endroit : « Installation électrique :
   * Sous-sol - Cave — Absence de trappe de visite ». Sans eux, la ligne dit
   * qu'il existe un angle mort sans dire où, ce qui ne se transmet pas au
   * vendeur.
   */
  it('dit quel diagnostic et quel endroit', () => {
    const bloc = VERDICT.slice(VERDICT.indexOf('const nonVus'), VERDICT.indexOf("for (const [i, c] of remarques"));
    expect(bloc).toMatch(/diagnostic\.titre/);
    expect(bloc).toMatch(/releve\.ou/);
    expect(bloc).toMatch(/releve\.libelle/);
  });
});
