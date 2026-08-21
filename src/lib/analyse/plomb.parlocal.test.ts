import { describe, expect, it } from 'vitest';
import { recapitulatifParLocal } from './plomb';

/**
 * Le récapitulatif par local — la pièce justificative du seuil des 50 %.
 *
 * En tête de chaque local, le rapport écrit son compte et son pourcentage de
 * classe 3. C'est exactement ce que mesure la première situation de l'article 8
 * de l'arrêté du 19 août 2011, et le rapport le donne sans qu'on ait à calculer.
 *
 * Mesuré le 21/08/2026 sur 200 volets plomb : 192 le portent, 1812 locaux
 * récapitulés, et aucune ligne d'une forme que le motif ne reconnaisse.
 *
 * Fragments anonymisés, recopiés dans l'ordre de l'extraction.
 */

describe('le récapitulatif par local', () => {
  it('lit les trois chiffres et nomme le local', () => {
    const r = recapitulatifParLocal([
      'Rez de jardin - Atelier',
      "Nombre d'unités de diagnostic : 8 - Nombre d'unités de diagnostic de classe 3 repéré : 1 soit 12.5 %",
      'Mesure',
      'N° Zone Unité de diagnostic Substrat Revêtement apparent'
    ]);
    expect(r).toHaveLength(1);
    expect(r[0]?.local).toBe('Rez de jardin - Atelier');
    expect(r[0]?.unites).toBe(8);
    expect(r[0]?.classe3).toBe(1);
    expect(r[0]?.pourcentage).toBe(12.5);
  });

  it('garde la ligne du rapport entière', () => {
    /* On cite, puis on explique : le fait affiché porte la phrase du rapport. */
    const r = recapitulatifParLocal([
      '2ème étage - Wc',
      "Nombre d'unités de diagnostic : 9 - Nombre d'unités de diagnostic de classe 3 repéré : 0 soit 0 %"
    ]);
    expect(r[0]?.terme).toMatch(/^Nombre d'unités de diagnostic : 9 - /);
  });

  it('⚠️ n’attribue pas les chiffres d’une pièce à l’en-tête de page', () => {
    /*
     * Un saut de page glisse l'en-tête du rapport entre le nom du local et son
     * récapitulatif. Pris pour le nom, il ferait afficher « Le local le plus
     * touché — Constat de risque d'exposition au plomb n° … ».
     */
    const r = recapitulatifParLocal([
      'Rez de chaussée - Salle d’eau',
      "Constat de risque d'exposition au plomb n° 00/AAA/0000",
      "Nombre d'unités de diagnostic : 7 - Nombre d'unités de diagnostic de classe 3 repéré : 6 soit 85.7 %"
    ]);
    expect(r[0]?.local).toBe('Rez de chaussée - Salle d’eau');
  });

  it('laisse le nom vide plutôt que d’en inventer un', () => {
    /* Mieux vaut « Le local le plus touché » sans nom qu'un nom faux. */
    const r = recapitulatifParLocal([
      'SARL DGLM EXPERTISES | 76 COURS PORTAL 33000 BORDEAUX',
      '15 / 19',
      'Rapport du :',
      "Nombre d'unités de diagnostic : 7 - Nombre d'unités de diagnostic de classe 3 repéré : 6 soit 85.7 %"
    ]);
    expect(r[0]?.local).toBe('');
    expect(r[0]?.pourcentage).toBe(85.7);
  });

  it('lit tous les locaux, dans l’ordre du rapport', () => {
    const r = recapitulatifParLocal([
      'Rez de chaussée - Séjour',
      "Nombre d'unités de diagnostic : 16 - Nombre d'unités de diagnostic de classe 3 repéré : 0 soit 0 %",
      'Rez de jardin - Atelier',
      "Nombre d'unités de diagnostic : 8 - Nombre d'unités de diagnostic de classe 3 repéré : 1 soit 12.5 %"
    ]);
    expect(r.map((l) => l.pourcentage)).toEqual([0, 12.5]);
  });

  it('n’est pas mis en échec par les apostrophes espacées', () => {
    const r = recapitulatifParLocal([
      'R+1 - Chambre 1',
      "Nombre d ’ unités de diagnostic : 6 - Nombre d ’ unités de diagnostic de classe 3 repéré : 3 soit 50 %"
    ]);
    expect(r[0]?.pourcentage).toBe(50);
  });

  it('ne rend rien quand le rapport ne récapitule pas', () => {
    /* 8 volets sur 200 : l'endroit n'existe pas, et on se tait. */
    expect(recapitulatifParLocal(['6.1 Classement des unités de diagnostic'])).toEqual([]);
  });

  it('lit le cas limite des 50 %, sans en tirer de conclusion', () => {
    /*
     * ⚠️ Les deux seuls désaccords du corpus entre ce récapitulatif et la case
     * du § 6.4 sont exactement à 50 % — 3 unités de classe 3 sur 6, deux fois.
     * L'arrêté écrit « AU MOINS 50 % » ; ces deux rapports répondent NON.
     *
     * Deux lectures restent possibles et on ne tranche pas : un « plus de 50 % »
     * strict, ou un dénominateur différent aux deux endroits — les unités non
     * mesurées peuvent compter ici et pas là.
     *
     * Le lecteur RAPPORTE le chiffre et ne recalcule pas la case. C'est ce que
     * ce test grave : 50 % se lit comme 50 %, sans verdict attaché.
     */
    const r = recapitulatifParLocal([
      'Rez de chaussée - Cuisine',
      "Nombre d'unités de diagnostic : 6 - Nombre d'unités de diagnostic de classe 3 repéré : 3 soit 50 %"
    ]);
    expect(r[0]?.pourcentage).toBe(50);
    expect(r[0]?.classe3).toBe(3);
    expect(r[0]?.unites).toBe(6);
  });
});
