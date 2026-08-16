import { describe, expect, it } from 'vitest';
import { echeance } from './echeance';
import type { Diagnostic } from './modele';

/**
 * Le constat plomb ne vaut « sans limite » que s'il est négatif.
 *
 * Le produit l'annonçait ainsi dans tous les cas. L'article L. 1334-6 du code
 * de la santé publique dit l'inverse : en vente, le CREP doit avoir été établi
 * depuis moins d'UN AN. La validité illimitée est l'exception, réservée au
 * constat qui n'a rien trouvé.
 *
 * Un dossier de deux ans avec du plomb classé 3 passait donc pour valable.
 */
function constat(classes: [number, number, number, number], date: string): Diagnostic {
  return {
    type: 'plomb',
    titre: 'Plomb dans les peintures (CREP)',
    verdict: '',
    gravite: 'neutre',
    faits: [],
    explication: [],
    aFaire: [],
    pages: [1, 2],
    date,
    schema: { genre: 'plomb', classes, nonMesurees: 0, total: 10, emplacements: [] }
  };
}

const aujourdhui = new Date(2026, 7, 16);

describe('la validité du constat plomb', () => {
  it('est sans limite quand rien n’a été trouvé', () => {
    /* Que des classes 0 : aucun revêtement au-dessus du seuil. */
    expect(echeance(constat([10, 0, 0, 0], '18/07/2022'), aujourdhui)).toEqual({
      texte: 'Sans limite',
      perimee: false
    });
  });

  it('tombe à un an dès qu’un revêtement au plomb est trouvé, même en bon état', () => {
    /* Une seule unité de classe 1 suffit : le texte parle de PRÉSENCE de
       revêtements au-dessus des seuils, pas de leur dégradation. */
    const e = echeance(constat([9, 1, 0, 0], '18/07/2022'), aujourdhui);
    expect(e.perimee).toBe(true);
    expect(e.texte).toMatch(/Périmé depuis le 18\/07\/2023/);
  });

  it('signale la péremption d’un constat avec du plomb dégradé', () => {
    const e = echeance(constat([5, 1, 2, 2], '18/07/2022'), aujourdhui);
    expect(e.perimee).toBe(true);
  });

  it('reste valable dans l’année qui suit', () => {
    const e = echeance(constat([5, 1, 2, 2], '01/03/2026'), aujourdhui);
    expect(e.perimee).toBe(false);
    expect(e.texte).toMatch(/Valable jusqu’au 01\/03\/2027/);
  });

  /*
   * Sans tableau lisible, on ne tranche pas. « Durée non renseignée » invite à
   * vérifier, quand « sans limite » donnerait un feu vert par défaut — et un
   * feu vert par inadvertance est le pire cas possible.
   */
  it('ne conclut pas à l’absence de limite quand le tableau n’a pas été lu', () => {
    const sansSchema: Diagnostic = { ...constat([0, 0, 0, 0], '18/07/2022'), schema: null };
    expect(echeance(sansSchema, aujourdhui).texte).not.toBe('Sans limite');
  });
});
