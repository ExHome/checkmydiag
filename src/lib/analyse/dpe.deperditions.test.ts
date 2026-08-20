import { describe, expect, it } from 'vitest';
import { analyserDpe } from './dpe';

/**
 * Par où la chaleur s'en va — le schéma des déperditions, dit en mots.
 *
 * Le DPE consacre une page à un « Schéma des déperditions de chaleur » : une
 * maison en coupe, une flèche par poste. **Elle est en image** — trente et un
 * volets sur trente et un la nomment, aucun ne porte de pourcentage dans son
 * texte, comme l'étiquette A→G.
 *
 * Le descriptif du logement, lui, décrit chaque paroi en toutes lettres. Les
 * lignes ci-dessous en sont reprises telles quelles : l'intitulé de la colonne
 * précède sa description, et la description s'intercale avant « non isolé ».
 *
 * Mesuré : le produit ne disait EN MOTS quel poste est isolé dans aucun des
 * trente et un volets, alors que vingt-quatre en ont au moins un qui ne l'est
 * pas. Et les murs n'étaient jamais lus — zéro sur trente et un — parce que le
 * motif exigeait « donnant » ou « d'épaisseur » juste après le mot « mur ».
 */
const DESCRIPTIF = [
  'Diagnostic de performance énergétique',
  'Consommation : 291 kWh/m²/an classe E',
  'Émissions : 9 kg CO₂/m²/an classe B',
  'description isolation',
  'Murs Mur en béton banché d’épaisseur ≤ 20 cm non isolé donnant sur un local chauffé',
  'Plancher bas Dalle béton non isolée donnant sur un local chauffé',
  /*
   * La ligne complète du corpus, « donnant sur l'extérieur » compris.
   *
   * Une première version de ce test l'avait raccourcie de mémoire, et elle
   * échouait : sans une marque de descriptif — « donnant sur », « d'épaisseur »,
   * « U = » —, le moteur refuse de conclure, et il a raison. C'est ce refus qui
   * écarte les pictogrammes « toiture isolée » du confort d'été.
   */
  'Toiture/plafond Dalle béton donnant sur l’extérieur (terrasse) avec isolation extérieure (réalisée entre 1989 et 2000)',
  'Portes et fenêtres Fenêtres battantes métal, double vitrage à isolation renforcée'
];

const paroi = (lignes: string[]) =>
  analyserDpe(lignes, [1, 9]).faits.find((f) => /chaleur s’en va/i.test(f.libelle));

describe('le schéma des déperditions, en mots', () => {
  it('nomme les parois que le rapport décrit non isolées', () => {
    const f = paroi(DESCRIPTIF);
    expect(f?.valeur).toMatch(/les murs/);
    expect(f?.valeur).toMatch(/le plancher/);
  });

  it('lit les murs malgré la description qui s’intercale', () => {
    /*
     * « Murs Mur en béton banché d'épaisseur ≤ 20 cm non isolé » : entre le mot
     * « mur » et « d'épaisseur » il y a toute la description du matériau. Zéro
     * mur lu sur trente et un volets tant que le motif les exigeait collés.
     */
    expect(paroi(DESCRIPTIF)?.valeur).toMatch(/les murs/);
  });

  it('dit aussi ce qui est isolé', () => {
    // Un diagnostic n'est pas un catalogue de problèmes.
    expect(paroi(DESCRIPTIF)?.precision).toMatch(/la toiture.*(isol)/i);
  });

  it('reprend la phrase dans l’explication', () => {
    const d = analyserDpe(DESCRIPTIF, [1, 9]);
    expect(d.explication.join(' ')).toMatch(/c’est par là que part l’essentiel de la chaleur/);
  });

  it('ne dit rien quand aucune paroi n’est décrite non isolée', () => {
    /*
     * Une paroi dont l'isolation n'a pas pu être lue n'est comptée ni parmi les
     * bonnes ni parmi les mauvaises : « non trouvé » n'est pas « non ».
     */
    expect(
      paroi([
        'Diagnostic de performance énergétique',
        'Consommation : 291 kWh/m²/an classe E',
        'Toiture/plafond Dalle béton avec isolation extérieure'
      ])
    ).toBeUndefined();
  });

  it('ne prend pas les pictogrammes du confort d’été pour un constat', () => {
    /*
     * La page du schéma liste « toiture isolée » et « fenêtres équipées de
     * volets extérieurs » comme des icônes de confort d'été — cochées ou non,
     * on ne peut pas le savoir. C'est le piège du catalogue.
     */
    expect(
      paroi([
        'Diagnostic de performance énergétique',
        'Consommation : 291 kWh/m²/an classe E',
        'Les caractéristiques de votre logement améliorant le confort d’été :',
        'bonne inertie du logement fenêtres équipées de volets extérieurs',
        'toiture isolée'
      ])
    ).toBeUndefined();
  });
});
