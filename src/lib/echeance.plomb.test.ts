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

/**
 * ⚠️ Le calcul se trompait de CINQ ANS sur les constats de location.
 *
 * Il applique douze mois à tout constat positif. C'est la durée de la VENTE
 * (article L. 1334-6). À la location, c'est SIX ANS — article R. 1334-11 du
 * code de la santé publique, énoncé noté dans `reglement/textes.ts` et lu le
 * 14/08/2026.
 *
 * Mesuré le 21/08/2026 sur 200 constats plomb, en comparant la date que le
 * rapport écrit à celle que nous calculions :
 *
 *     120 rapports portent une date de fin écrite
 *      83 tombent juste  → tous cochés « Avant la vente »
 *      29 se trompent    → tous cochés « Avant la mise en location »,
 *                          et de 1825 jours, soit cinq ans à un jour près
 *
 * Zéro exception dans les deux sens. Verrière déclarait donc périmés 14,5 % des
 * constats qu'elle lisait, dont certains avaient encore cinq ans à courir.
 *
 * La correction ne consiste pas à ajouter « six ans si location » : elle
 * consiste à LIRE la date que le rapport écrit lui-même, ce qui supprime le
 * calcul et la lecture de la mission d'un coup.
 */
const lu = (classes: [number, number, number, number], date: string, jusquAu: string): Diagnostic => ({
  ...constat(classes, date),
  validiteLue: { jusquAu, terme: `durée de validité de 6 ans (jusqu’au ${jusquAu}).` }
});

describe('la fin de validité écrite dans le rapport', () => {
  it('prime sur le calcul, et sauve le constat de location', () => {
    /*
     * Repérage du 09/04/2025, plomb trouvé, constat de LOCATION valable
     * jusqu'au 08/04/2031. Le calcul le disait périmé depuis avril 2026.
     */
    expect(echeance(lu([0, 0, 7, 0], '09/04/2025', '08/04/2031'), aujourdhui)).toEqual({
      texte: 'Valable jusqu’au 08/04/2031',
      perimee: false
    });
  });

  it('conclut à la péremption quand la date écrite est passée', () => {
    expect(echeance(lu([0, 0, 7, 0], '18/10/2022', '17/10/2023'), aujourdhui)).toEqual({
      texte: 'Périmé depuis le 17/10/2023',
      perimee: true
    });
  });

  it('laisse valable le dernier jour que le rapport annonce', () => {
    /*
     * Le rapport écrit le DERNIER JOUR valable, pas le premier jour périmé.
     * C'est ce qui explique l'écart systématique de -1 jour avec notre calcul,
     * qui visait l'anniversaire.
     */
    expect(echeance(lu([0, 0, 7, 0], '16/08/2025', '16/08/2026'), aujourdhui).perimee).toBe(false);
  });

  it('suit le rapport quand il écrit que le constat ne périme pas', () => {
    const sansLimite: Diagnostic = {
      ...constat([0, 0, 7, 0], '18/07/2022'),
      validiteLue: {
        sansLimite: true,
        terme:
          "il n'y a pas lieu de faire établir un nouveau constat à chaque mutation. Le présent constat sera joint à chaque mutation"
      }
    };
    expect(echeance(sansLimite, aujourdhui)).toEqual({ texte: 'Sans limite', perimee: false });
  });

  it('retombe sur le calcul quand le rapport n’écrit rien', () => {
    /* 29 volets sur 200 n'ont pas la rubrique, 3 l'ont vide. Le calcul reste. */
    expect(echeance(constat([0, 0, 7, 0], '18/10/2022'), aujourdhui).perimee).toBe(true);
  });
});
