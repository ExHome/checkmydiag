import { describe, expect, it } from 'vitest';
import { analyserCarrez, piecesMesurees } from './risques';

/**
 * Le tableau pièce par pièce du certificat de superficie.
 *
 * C'est la seule partie du rapport qui explique l'écart entre les deux chiffres
 * affichés. Fragments anonymisés, calqués sur la mise en page réelle : nom de
 * pièce, superficie privative, surface au sol.
 */
const TABLEAU = [
  'Tableau récapitulatif des surfaces de chaque pièce au sens Loi Carrez :',
  'Superficie privative au',
  'Parties de l’immeuble bâtis visitées Surface au sol Commentaires',
  'sens Carrez',
  'Rez de chaussée - Entrée 6.53 6.53',
  'Rez de chaussée - Séjour 36.95 36.95',
  'Rez de jardin - Buanderie 0 7.2',
  'Rez de jardin - Cave 0 16.18',
  'Rez de jardin - Chaufferie 0 2.9',
  '1er étage - Chambre 01 17.36 17.36',
  '1er étage - Terrasse 0 17.21'
];

describe('les pièces mesurées', () => {
  const pieces = piecesMesurees(TABLEAU);

  it('lit chaque pièce avec ses deux surfaces', () => {
    expect(pieces.length).toBe(7);
    expect(pieces[0]).toEqual({ nom: 'Rez de chaussée - Entrée', privative: 6.53, auSol: 6.53 });
  });

  it('repère celles qui ne comptent pas dans la superficie vendue', () => {
    const horsCompte = pieces.filter((p) => p.privative === 0).map((p) => p.nom);
    expect(horsCompte).toEqual([
      'Rez de jardin - Buanderie',
      'Rez de jardin - Cave',
      'Rez de jardin - Chaufferie',
      '1er étage - Terrasse'
    ]);
  });

  it('ne prend pas les lignes de total ni les en-têtes pour des pièces', () => {
    const p = piecesMesurees([
      'Surface loi Carrez totale : 189.82 236.66',
      'Superficie privative au sens Carrez 12.5 14.2'
    ]);
    expect(p).toEqual([]);
  });
});

/**
 * Ce que la fiche en dit.
 *
 * Un acheteur qui lit « 189,82 m² » et visite un bien qui en paraît beaucoup
 * plus n'a aucun moyen de comprendre l'écart. Le rapport le lui explique, dans
 * un tableau que personne ne lit.
 */
describe('l’écart entre la superficie vendue et le bien réel', () => {
  const diag = analyserCarrez(
    [
      'Certificat de superficie de la partie privative',
      'Date du repérage : 18/07/2022',
      'Surface loi Carrez totale : 189.82 m²',
      'Surface au sol totale : 236.66 m²',
      ...TABLEAU
    ],
    [5, 9]
  );

  it('nomme les pièces hors superficie et les totalise', () => {
    const fait = diag.faits.find((f) => f.libelle === 'Pièces hors superficie');
    expect(fait).toBeDefined();
    /* 7,2 + 16,18 + 2,9 + 17,21 = 43,49 */
    expect(fait?.valeur).toBe('43,49 m²');
    expect(fait?.precision).toMatch(/Buanderie/);
    expect(fait?.precision).toMatch(/Terrasse/);
  });

  it('garde les deux totaux du rapport', () => {
    const libelles = diag.faits.map((f) => f.libelle);
    expect(libelles).toContain('Surface au sol');
  });
});
