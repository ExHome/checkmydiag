/**
 * CE QUE LA SYNTHÈSE PLOMB N'A PAS LE DROIT D'ÉCRIRE.
 *
 * Les tests qui suivent ne vérifient pas que l'écran est joli : ils vérifient
 * qu'il ne ment pas. Chacun correspond à un interdit nommé de l'ordre de
 * mission CREP, et chacun a une raison d'exister qui tient à un vrai risque.
 */
import { describe, expect, it } from 'vitest';
import type { Diagnostic } from '../../lib/modele';
import { issuePlomb, synthesePlomb } from './synthese';

/** Un CREP tel que l'analyse le rend, réduit à ce que la synthèse consomme. */
function crep(
  classes: [number, number, number, number],
  nonMesurees: number,
  total: number,
  verdict = 'Le constat est positif.'
): Diagnostic {
  return {
    type: 'plomb',
    titre: 'Plomb dans les peintures (CREP)',
    verdict,
    gravite: classes[3] > 0 ? 'alerte' : classes[1] + classes[2] > 0 ? 'attention' : 'bon',
    faits: [],
    explication: [],
    aFaire: [],
    pages: [4, 12],
    schema: { genre: 'plomb', classes, nonMesurees, total, pieces: [] }
  } as unknown as Diagnostic;
}

describe('les trois issues d’un CREP, jamais deux', () => {
  it('⚠️ un rapport illisible n’est PAS un rapport négatif', () => {
    /*
     * LE test de l'ordre de mission. Confondre « je n'ai pas su lire » et
     * « il n'y a pas de plomb » ferait annoncer une absence qui n'a jamais été
     * constatée — sur un diagnostic dont l'objet est la santé d'un enfant.
     */
    const illisible = { type: 'plomb', titre: 'CREP', faits: [] } as unknown as Diagnostic;
    expect(issuePlomb(illisible)).toBe('illisible');
    expect(issuePlomb(illisible)).not.toBe('aucunRevetementAuDessus');
  });

  it('distingue « du plomb est présent » de « aucun revêtement au-dessus du seuil »', () => {
    expect(issuePlomb(crep([12, 3, 0, 0], 2, 17))).toBe('plombPresent');
    expect(issuePlomb(crep([17, 0, 0, 0], 2, 19))).toBe('aucunRevetementAuDessus');
  });

  it('ne dit jamais « pas de plomb » quand rien n’est au-dessus du seuil', () => {
    const s = synthesePlomb(crep([17, 0, 0, 0], 0, 17));
    const tout = JSON.stringify(s);
    expect(tout).not.toMatch(/pas de plomb|absence de plomb|aucun plomb/i);
  });
});

describe('les unités non mesurées', () => {
  it('⚠️ ne sont jamais rangées en classe 0', () => {
    /* § 17. Les compter comme « conformes » inventerait une mesure. */
    const s = synthesePlomb(crep([10, 0, 0, 0], 7, 17));
    expect(s.effectifs?.nonMesurees).toBe(7);
    expect(s.effectifs?.classes[0]).toBe(10);
  });

  it('sont annoncées comme une inconnue, pas comme un résultat', () => {
    const s = synthesePlomb(crep([10, 0, 0, 0], 7, 17));
    const cle = s.pointsCles.find((p) => /non mesur/i.test(p.titre));
    expect(cle).toBeDefined();
    expect(cle?.detail).toMatch(/ni présence, ni absence/i);
    expect(cle?.ton).toBe('attention');
  });
});

describe('le contrôle du § 41 — le total se vérifie', () => {
  it('se tait quand la somme retombe sur le total', () => {
    /* 2 + 12 + 3 + 0 + 0 = 17 */
    expect(synthesePlomb(crep([12, 3, 0, 0], 2, 17)).discordance).toBeNull();
  });

  it('⚠️ le DIT quand la somme ne retombe pas — sans rien rattraper', () => {
    /*
     * Le rapport annonce 20, le détail en compte 17. On ne corrige ni l'un ni
     * l'autre : arbitrer en silence est précisément ce que l'ordre interdit.
     */
    const s = synthesePlomb(crep([12, 3, 0, 0], 2, 20));
    expect(s.discordance).toMatch(/20 unités/);
    expect(s.discordance).toMatch(/17/);
    /* Les chiffres restent ceux du rapport, non recalculés. */
    expect(s.effectifs?.total).toBe(20);
  });
});

describe('ce que l’écran n’affiche jamais', () => {
  it('⚠️ aucun niveau de risque', () => {
    /*
     * Les maquettes Verrière affichent « NIVEAU DE RISQUE : TRÈS FAIBLE ».
     * Aucun CREP ne qualifie un risque, et aucune règle validée ne permet de
     * le calculer. La valeur est fictive : elle n'entre pas dans le produit.
     */
    const tout = JSON.stringify(synthesePlomb(crep([12, 3, 0, 0], 2, 17)));
    expect(tout).not.toMatch(/niveau de risque|très faible|risque faible|risque élevé/i);
  });

  it('⚠️ aucun pourcentage de confiance', () => {
    /* Le « 90 % » des maquettes est un score inventé. */
    const s = synthesePlomb(crep([12, 3, 0, 0], 2, 17));
    expect(JSON.stringify(s)).not.toMatch(/confiance/i);
  });
});

describe('le conseil suit l’état de conservation, pas la présence', () => {
  it('n’impose aucun travail quand le plomb n’est pas dégradé', () => {
    /*
     * ⚠️ C'est l'erreur la plus courante sur ce diagnostic : croire que « du
     * plomb » veut dire « des travaux ». L'obligation naît de la classe 3.
     */
    const s = synthesePlomb(crep([10, 5, 2, 0], 0, 17));
    expect(s.conseil.join(' ')).not.toMatch(/doivent faire l’objet de travaux/i);
    expect(s.conseil.join(' ')).toMatch(/aucun travail n’est imposé/i);
  });

  it('impose les travaux dès la première unité de classe 3', () => {
    const s = synthesePlomb(crep([10, 4, 2, 1], 0, 17));
    expect(s.conseil.join(' ')).toMatch(/doivent faire l’objet de travaux/i);
    /* Et met en garde contre le geste qui contamine : poncer, gratter. */
    expect(s.conseil.join(' ')).toMatch(/poncer|gratter|décaper/i);
  });

  it('signale les unités non mesurées avant travaux', () => {
    const s = synthesePlomb(crep([10, 0, 0, 0], 7, 17));
    expect(s.conseil.join(' ')).toMatch(/avant tous travaux/i);
  });
});

describe('les points clés viennent des faits, jamais d’un exemple', () => {
  it('nomme la classe 3 par ce qui la définit : le plomb ACCESSIBLE', () => {
    const s = synthesePlomb(crep([10, 4, 2, 1], 0, 17));
    const c3 = s.pointsCles.find((p) => /classe 3/i.test(p.titre));
    expect(c3?.detail).toMatch(/dégradé/i);
    expect(c3?.ton).toBe('alerte');
  });

  it('rappelle le seuil réglementaire en mg/cm², jamais en mg/g', () => {
    /* § 7 : la fluorescence X mesure des mg/cm². Les mg/g sont l'analyse
       chimique d'un prélèvement, et les confondre change tout. */
    const s = synthesePlomb(crep([10, 4, 0, 0], 0, 14));
    const cle = s.pointsCles.find((p) => /seuil/i.test(p.titre));
    expect(cle?.detail).toMatch(/mg\/cm²/);
    expect(cle?.detail).not.toMatch(/mg\/g/);
  });

  it('n’écrit aucun point clé quand le tableau n’a pas été lu', () => {
    const illisible = { type: 'plomb', titre: 'CREP', faits: [] } as unknown as Diagnostic;
    expect(synthesePlomb(illisible).pointsCles).toEqual([]);
    expect(synthesePlomb(illisible).effectifs).toBeNull();
  });
});
