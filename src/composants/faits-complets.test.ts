import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * AUCUN FAIT DU RAPPORT N'EST JETÉ.
 *
 * `d.faits.filter(…).slice(0, 3)` ne cachait pas les faits suivants : il les
 * SUPPRIMAIT. Et le commentaire posé juste au-dessus promettait exactement le
 * contraire — « on hiérarchise, on n'ampute pas ».
 *
 * MESURE SUR 231 VOLETS RÉELS DU CORPUS, avant correction :
 *
 *   846 faits produits par les analyseurs
 *   602 affichés  (71 %)
 *   244 JETÉS     (29 %)
 *
 * Les plus souvent perdus, sur le seul DPE : « Coût annuel estimé » (30 fois),
 * « Valable jusqu'au » (35), « Établi le » (35), « Réformes depuis ce
 * diagnostic » (36), « Par où la chaleur s'en va » (32), « N° ADEME » (28),
 * « Ventilation » (13).
 *
 * Deux de ces pertes sont graves au-delà du confort de lecture :
 *
 *   le COÛT ANNUEL EN EUROS est le seul chiffre qu'un non-spécialiste sait
 *   lire, et il était extrait puis jeté ;
 *
 *   « Valable jusqu'au » disparaissait aussi — quelqu'un pouvait signer sans
 *   savoir que le diagnostic qu'il lit est périmé.
 *
 * « Si une information métier disparaît : REFUS. »
 */

const ecran = readFileSync(new URL('./Diagnostics.svelte', import.meta.url), 'utf8');

describe('les faits du rapport', () => {
  it('ne sont jamais tronqués sans destination', () => {
    /* Un `slice` est permis pour hiérarchiser, à condition que le reste soit
       récupéré. Ce qui est interdit, c'est de couper sans rien en faire. */
    const i = ecran.indexOf('const autres = d.faits.filter');
    expect(i, 'la séparation chef / autres doit exister').toBeGreaterThan(-1);

    const bloc = ecran.slice(i, i + 400);
    expect(bloc, 'les trois premiers restent en vue').toMatch(/slice\(0,\s*3\)/);
    expect(bloc, 'et le reste doit être capturé').toMatch(/reste\s*=\s*autres\.slice\(3\)/);
  });

  it('affichent le reste au lieu de le perdre', () => {
    expect(ecran).toMatch(/\{#each reste as fait/);
  });

  it('rangent le reste derrière le repli, pas au premier écran', () => {
    /* « L'exhaustivité appartient au système, pas au premier écran » — mais
       elle appartient AU SYSTÈME, et il faut donc qu'elle y soit. */
    const i = ecran.indexOf('{#if reste.length');
    expect(i).toBeGreaterThan(-1);
    expect(ecran.slice(i, i + 120)).toMatch(/modeDe\(d\.type\) === 'detaille'/);
  });

  it('montrent la précision du fait quand le rapport en donne une', () => {
    /* « usage standard, prix moyens des énergies » qualifie le coût annuel :
       sans elle, le montant se lirait comme une facture réelle. */
    const i = ecran.indexOf('{#each reste as fait');
    const bloc = ecran.slice(i, i + 400);
    expect(bloc).toMatch(/fait\.precision/);
  });
});
