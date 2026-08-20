import { describe, expect, it } from 'vitest';
import { dossierDeclareIncomplet } from './coherence';

/**
 * Le dossier qui prévient lui-même qu'il peut être incomplet.
 *
 * Un éditeur ouvre sa page de garde par une clause que personne d'autre du
 * corpus n'écrit : le dossier ne contient que ce qui a été commandé, et c'est
 * au vendeur de le compléter.
 *
 * Elle mérite d'être remontée parce qu'elle répond à la question que se pose un
 * acquéreur en tenant le dossier : est-ce que tout y est ? Le document répond,
 * et sa réponse est « pas forcément ».
 *
 * Lignes recopiées de la page de garde, telles que l'extraction les rend.
 */
const GARDE = [
  'Dossier de Diagnostic Technique',
  'articles L271.4 à L 271.6 du code la construction et de l’habitation',
  "Seuls les rapports de diagnostics demandés par le vendeur ou un mandataire figurent dans le présent dossier. L'existence et le contenu de diagnostics",
  'réalisés antérieurement ou par un autre opérateur de diagnostic ne sont pas connus. En conséquence, LE CABINET',
  "membre du réseau ne saurait en aucun cas être tenu pour responsable en cas d'absence d'un ou plusieurs diagnostics. Il appartient au vendeur",
  "de compléter le présent dossier autant que de besoin afin de constituer un dossier de diagnostics techniques complet et conforme aux articles L 271-4 à",
  "L 271-6 du code de la construction et de l'habitation.",
  'MISSION N° : 330300631'
];

describe('le dossier qui se déclare peut-être incomplet', () => {
  it('remonte la clause de la page de garde', () => {
    const points = dossierDeclareIncomplet(GARDE);
    expect(points).toHaveLength(1);
    expect(points[0]?.genre).toBe('attention');
    expect(points[0]?.titre).toContain('commandés');
  });

  it('ne met pas le diagnostiqueur en cause', () => {
    /*
     * « Verrière explique le diagnostic, elle ne juge pas le diagnostiqueur. »
     * La clause est exacte et régulière : on la remonte comme une information
     * pour l'acquéreur, jamais comme un manquement.
     */
    const dit = JSON.stringify(dossierDeclareIncomplet(GARDE));
    expect(dit).not.toMatch(/faute|manquement|n[ée]gligen|d[ée]faut du diagnostiqueur|irr[ée]gulier/i);
  });

  it('ne dit rien d’un dossier qui ne porte pas la clause', () => {
    expect(
      dossierDeclareIncomplet([
        'Dossier de Diagnostic Technique',
        'articles L271.4 à L 271.6 du code la construction et de l’habitation',
        'MISSION N° : 330300631'
      ])
    ).toEqual([]);
  });

  it('ne confond pas la clause avec les réserves de fin de volet', () => {
    /*
     * ODM « chercher un endroit » : chaque volet se termine par sa propre
     * réserve de responsabilité. Elles parlent d'autre chose, et si la clause
     * de garde était cherchée dans tout le document, la moindre ressemblance
     * la déclencherait à chaque volet.
     *
     * On borne donc à la page de garde : la même phrase, placée au milieu du
     * dossier, ne compte pas.
     */
    const auMilieu = [
      ...Array.from({ length: 80 }, (_, i) => `Ligne ${i} du volet électricité.`),
      "Seuls les rapports de diagnostics demandés par le vendeur ou un mandataire figurent dans le présent dossier."
    ];
    expect(dossierDeclareIncomplet(auMilieu)).toEqual([]);
  });

  it('ne se prononce pas sur un document vide', () => {
    expect(dossierDeclareIncomplet([])).toEqual([]);
  });
});
