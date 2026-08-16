import { describe, expect, it } from 'vitest';
import { analyserPlomb } from './plomb';

/**
 * « Non mesurée » ne veut pas dire « pas contrôlée ».
 *
 * Ces tests existent parce que j'ai commis l'erreur inverse : j'avais tempéré
 * la conclusion d'un constat rassurant au motif qu'un cinquième des unités
 * n'était pas mesuré, croyant qu'une part du logement avait échappé au
 * contrôle.
 *
 * Le rapport dit le contraire, unité par unité :
 *
 *     Mur Pierre          Non mesurée - NM   Absence de revêtement
 *     Plinthes Carrelage  Non mesurée - NM   Absence de revêtement
 *
 * Une unité non mesurée est une unité SANS REVÊTEMENT : pierre nue, carrelage,
 * métal, PVC. Le plomb se cherche dans les peintures ; là où il n'y en a pas,
 * il n'y a rien à mesurer, et la norme NF X46-030 prévoit ce classement.
 *
 * Le taux de non mesurées ne dit donc rien de la qualité du contrôle : il dit
 * combien de surfaces ne sont pas peintes. En faire une alerte, c'est inquiéter
 * pour une donnée normale — la faute exactement inverse de celle que ce produit
 * combat.
 *
 * Fragments anonymisés, calqués sur la mise en page réelle.
 */
const enTete = [
  'Constat de risque d’exposition au plomb CREP',
  'Date du repérage : 18/07/2022',
  'Conclusion des mesures de concentration en plomb',
  'Total Non mesurées Classe 0 Classe 1 Classe 2 Classe 3'
];

describe('les unités sans revêtement', () => {
  it('ne tempèrent pas une conclusion rassurante', () => {
    /* 208 unités : 39 sans revêtement, 169 mesurées en classe 0. C'est un
       constat propre, et il doit se lire comme tel. */
    const d = analyserPlomb([...enTete, '208 39 169 0 0 0'], [74, 92]);
    expect(d.gravite).toBe('bon');
    expect(d.verdict).toMatch(/Aucun revêtement contenant du plomb/);
    expect(d.verdict).not.toMatch(/n’ont pas pu être mesur|ne couvre pas tout/);
  });

  it('ne s’ajoutent pas non plus à un constat défavorable', () => {
    const d = analyserPlomb([...enTete, '208 39 130 1 2 36'], [74, 92]);
    expect(d.gravite).toBe('alerte');
    expect(d.verdict).toMatch(/travaux sont obligatoires/);
    expect(d.verdict).not.toMatch(/pourrait y en avoir d’autres/);
  });

  /*
   * Le chiffre reste affiché — il a sa place dans les faits du rapport, à
   * titre d'information. C'est son INTERPRÉTATION comme un manque qui était
   * fausse, pas sa présence.
   */
  it('restent citées dans les chiffres de la fiche', () => {
    const d = analyserPlomb([...enTete, '208 39 169 0 0 0'], [74, 92]);
    const precisions = d.faits.map((f) => f.precision ?? '').join(' ');
    expect(precisions).toMatch(/39 non mesurées/);
  });
});
