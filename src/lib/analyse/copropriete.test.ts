import { describe, expect, it } from 'vitest';
import { controlerCopropriete, voletsAttendus, voletsPresents } from './copropriete';

/**
 * Le contrôle de complétude est le seul geste fiable sur ces documents : ils
 * n'ont pas de modèle imposé, mais la loi dit ce qu'ils doivent contenir.
 */
describe('les documents de copropriété', () => {
  const DTG_COMPLET = [
    'Diagnostic technique global',
    'Analyse de l’état apparent des parties communes et des équipements communs',
    'État technique de l’immeuble au regard des obligations légales et réglementaires',
    'Analyse des améliorations possibles de la gestion technique et patrimoniale',
    'Diagnostic de performance énergétique de l’immeuble',
    'Évaluation sommaire du coût des travaux nécessaires dans les dix prochaines années'
  ];

  it('ne reproche rien à un diagnostic technique global complet', () => {
    expect(controlerCopropriete('dtg', DTG_COMPLET)).toEqual([]);
  });

  it('signale le volet manquant, et lui seul', () => {
    const sansAmeliorations = DTG_COMPLET.filter((l) => !/améliorations possibles/.test(l));
    const points = controlerCopropriete('dtg', sansAmeliorations);
    expect(points).toHaveLength(1);
    expect(points[0]?.titre).toMatch(/am[ée]liorations/i);
    expect(points[0]?.genre).toBe('manque');
    // Le point doit citer son fondement : sans quoi c'est un avis, pas un constat.
    expect(points[0]?.explication).toMatch(/L\. ?731-1/);
  });

  it('réclame le chiffrage des dix ans quand il manque', () => {
    const sansChiffrage = DTG_COMPLET.filter((l) => !/dix prochaines années/.test(l));
    const points = controlerCopropriete('dtg', sansChiffrage);
    expect(points.some((p) => /dix ans/i.test(p.titre))).toBe(true);
  });

  it('contrôle un plan de travaux sur l’article 14-2', () => {
    const pppt = [
      'Projet de plan pluriannuel de travaux',
      'Liste des travaux nécessaires',
      'Estimation sommaire du coût et hiérarchisation',
      'Échéancier proposé sur 10 ans'
    ];
    const points = controlerCopropriete('pppt', pppt);
    // Il manque l'estimation du niveau de performance.
    expect(points).toHaveLength(1);
    expect(points[0]?.titre).toMatch(/performance/i);
    expect(points[0]?.explication).toMatch(/14-2/);
  });

  it('ne dit rien d’un document qui n’est ni l’un ni l’autre', () => {
    expect(controlerCopropriete('venteLocation', DTG_COMPLET)).toEqual([]);
    expect(controlerCopropriete('raat', DTG_COMPLET)).toEqual([]);
  });

  it('sait dire quels volets sont là et lesquels manquent', () => {
    const attendus = voletsAttendus('dtg');
    expect(attendus).toHaveLength(4);
    const presents = voletsPresents('dtg', DTG_COMPLET);
    expect(presents).toEqual([true, true, true, true]);

    const partiel = voletsPresents('dtg', ['Diagnostic de performance énergétique de l’immeuble']);
    expect(partiel).toEqual([false, false, false, true]);
  });

  it('n’affirme jamais qu’un document est bon', () => {
    // Un volet présent n'est pas un volet bien fait : aucun point ne doit
    // féliciter, seulement signaler ce qui manque.
    for (const p of controlerCopropriete('dtg', ['Diagnostic technique global'])) {
      expect(p.genre).toBe('manque');
    }
  });
});
