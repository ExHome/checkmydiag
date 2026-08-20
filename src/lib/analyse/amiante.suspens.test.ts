import { describe, expect, it } from 'vitest';
import { constatEnSuspens } from './reperages';

/**
 * Le repérage amiante qui n'a pas encore sa réponse.
 *
 * Un rapport du corpus ouvre ses conclusions par une ligne en capitales :
 * « PRÉLÈVEMENT(S) AMIANTE EN COURS D'ANALYSE. » — puis enchaîne, deux lignes
 * plus bas, sur « ils ne contiennent pas d'amiante ». Un lecteur pressé retient
 * la seconde phrase et referme le volet.
 *
 * La même rubrique énumère plus bas les endroits qu'il reste à sonder. Ce sont
 * les non-contrôlés : ni présence, ni absence — pas de réponse.
 *
 * Lignes recopiées telles que l'extraction les rend.
 */
const CONCLUSIONS = [
  'CONCLUSIONS',
  '(détail des conclusions et mesures d’ordre général en fin du rapport de repérage)',
  'A - CONCLUSIONS DU REPÉRAGE EFFECTIF :',
  "PRÉLÈVEMENT(S) AMIANTE EN COURS D'ANALYSE.",
  'Dans le cadre réglementaire de la mission décrit au paragraphe 2.2, il a été repéré des matériaux et',
  "produits susceptibles de contenir de l'amiante : marquage des matériaux, ils ne contiennent pas",
  "d'amiante dans :",
  'SOUS-SOL - Cave (Conduits) : Plafond',
  'Dans le cadre réglementaire de la mission décrit au paragraphe 2.2, il a été repéré des matériaux ou',
  "produits susceptibles de contenir de l'amiante pour lesquels des sondages et/ou des prélèvements",
  'doivent être effectués dans :',
  "Cage d'escalier (Dalle de sol) : Sol - Idem Prélèvement entrée",
  'Dégagement (Dalle de sol) : sol - Idem Prélèvement entrée',
  "Il est rappelé la nécessité réglementaire d'avertir du risque de la présence d'amiante toute personne pouvant intervenir sur ou é proximité des",
  'matériaux et produits restant susceptibles de contenir de l’amiante ou de ceux les recouvrant ou les protégeant.',
  'B - OBLIGATIONS ET RECOMMANDATIONS RÉGLEMENTAIRE ISSUES DES RÉSULTATS DU REPÉRAGE'
];

describe('un repérage amiante encore en suspens', () => {
  it('voit que le laboratoire n’a pas rendu ses résultats', () => {
    expect(constatEnSuspens(CONCLUSIONS).enCoursDAnalyse).toBe(true);
  });

  it('relève les deux endroits qui restent à sonder', () => {
    const { aSonder } = constatEnSuspens(CONCLUSIONS);
    expect(aSonder).toHaveLength(2);
    expect(aSonder[0]?.ou).toBe("Cage d'escalier (Dalle de sol)");
    expect(aSonder[1]?.ou).toBe('Dégagement (Dalle de sol)');
    expect(aSonder.every((r) => r.genre === 'nonVerifie')).toBe(true);
  });

  it('ne prend pas pour un endroit à sonder celui qui a été conclu', () => {
    /*
     * « SOUS-SOL - Cave (Conduits) : Plafond » a la même forme, mais il dépend
     * de l'autre phrase — celle qui conclut « ils ne contiennent pas
     * d'amiante ». Le confondre transformerait une réponse en non-réponse.
     */
    const ou = constatEnSuspens(CONCLUSIONS).aSonder.map((r) => r.ou);
    expect(ou).not.toContain('SOUS-SOL - Cave (Conduits)');
  });

  it('ne conclut rien hors de la rubrique des conclusions', () => {
    /*
     * ODM « chercher un endroit » : le paragraphe 2.2 décrit la méthode dans
     * TOUS les rapports, avec les mêmes mots. Lu hors rubrique, il ferait
     * annoncer des prélèvements en attente à chaque repérage.
     */
    const methode = [
      '2.2 - CADRE RÉGLEMENTAIRE DE LA MISSION',
      "La mission consiste à repérer les matériaux susceptibles de contenir de l'amiante ; des sondages",
      'et/ou des prélèvements doivent être effectués dans les cas prévus par la norme.',
      "PRÉLÈVEMENT(S) AMIANTE EN COURS D'ANALYSE : mention portée le cas échéant."
    ];
    expect(constatEnSuspens(methode)).toEqual({ enCoursDAnalyse: false, aSonder: [] });
  });

  it('ne dit rien d’un rapport qui conclut normalement', () => {
    const net = [
      'A - CONCLUSIONS DU REPÉRAGE EFFECTIF :',
      'Dans le cadre réglementaire de la mission décrit au paragraphe 2.2, il n’a pas été repéré de',
      'matériaux et produits susceptibles de contenir de l’amiante.',
      'B - OBLIGATIONS ET RECOMMANDATIONS RÉGLEMENTAIRE ISSUES DES RÉSULTATS DU REPÉRAGE'
    ];
    expect(constatEnSuspens(net)).toEqual({ enCoursDAnalyse: false, aSonder: [] });
  });

  it('ne se prononce pas sur un rapport sans rubrique de conclusions', () => {
    expect(constatEnSuspens(['Rapport de repérage amiante', 'Page 1 sur 12'])).toEqual({
      enCoursDAnalyse: false,
      aSonder: []
    });
  });
});
