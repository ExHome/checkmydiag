import { describe, expect, it } from 'vitest';
import { controler } from './coherence';
import type { Bien, Diagnostic } from '../modele';

const AUJOURDHUI = new Date(2026, 7, 12); // 12 août 2026

function diag(type: Diagnostic['type'], date?: string, gravite: Diagnostic['gravite'] = 'bon'): Diagnostic {
  return {
    type,
    titre: type,
    verdict: '',
    gravite,
    faits: [],
    explication: [],
    aFaire: [],
    schema: null,
    pages: [1, 2],
    ...(date ? { date } : {})
  };
}

describe('contrôle des dates de validité', () => {
  it('signale un état termites de plus de six mois', () => {
    const points = controler({}, [diag('termites', '03/01/2026')], AUJOURDHUI);
    expect(points).toHaveLength(1);
    expect(points[0]?.genre).toBe('perime');
    expect(points[0]?.titre).toMatch(/termites/);
    expect(points[0]?.explication).toMatch(/7 mois/);
  });

  it('laisse tranquille un état termites récent', () => {
    expect(controler({}, [diag('termites', '01/07/2026')], AUJOURDHUI)).toHaveLength(0);
  });

  it('accepte un DPE de moins de dix ans', () => {
    expect(controler({}, [diag('dpe', '05/08/2020')], AUJOURDHUI)).toHaveLength(0);
  });

  it('signale un DPE de plus de dix ans', () => {
    const points = controler({}, [diag('dpe', '05/08/2015')], AUJOURDHUI);
    expect(points[0]?.genre).toBe('perime');
    expect(points[0]?.explication).toMatch(/11 ans/);
  });

  it('compte en mois jusqu’à deux ans, pour ne pas vieillir un rapport', () => {
    // 19 mois : « 2 ans » donnerait une idée fausse de l'ancienneté.
    const points = controler({}, [diag('erp', '21/01/2025')], AUJOURDHUI);
    expect(points[0]?.explication).toMatch(/19 mois/);
    expect(points[0]?.explication).not.toMatch(/2 ans/);
  });

  it('ne dit rien quand la date n’a pas été lue', () => {
    expect(controler({}, [diag('termites')], AUJOURDHUI)).toHaveLength(0);
  });
});

describe('contrôle des diagnostics manquants', () => {
  it('réclame un repérage amiante pour un logement d’avant 1997', () => {
    const bien: Bien = { anneeConstruction: '1975' };
    const points = controler(bien, [diag('dpe', '01/07/2026')], AUJOURDHUI);
    expect(points.some((p) => p.genre === 'manque' && p.type === 'amiante')).toBe(true);
  });

  it('réclame un constat plomb pour un logement d’avant 1949', () => {
    const bien: Bien = { anneeConstruction: 'Avant 1948' };
    const points = controler(bien, [diag('dpe', '01/07/2026')], AUJOURDHUI);
    expect(points.some((p) => p.genre === 'manque' && p.type === 'plomb')).toBe(true);
  });

  it('ne réclame rien pour un logement récent', () => {
    const bien: Bien = { anneeConstruction: '2015' };
    expect(controler(bien, [diag('dpe', '01/07/2026')], AUJOURDHUI)).toHaveLength(0);
  });

  it('ne réclame pas ce qui est déjà au dossier', () => {
    const bien: Bien = { anneeConstruction: '1930' };
    const points = controler(
      bien,
      [diag('dpe', '01/07/2026'), diag('amiante', '01/07/2026'), diag('plomb', '01/07/2026')],
      AUJOURDHUI
    );
    expect(points.filter((p) => p.genre === 'manque')).toHaveLength(0);
  });
});

describe('contrôle des surfaces', () => {
  function carrez(valeur: string): Diagnostic {
    return {
      ...diag('carrez', '01/07/2026'),
      faits: [{ libelle: 'Superficie privative', valeur }]
    };
  }

  it('signale un écart important entre le DPE et le mesurage', () => {
    const points = controler({ surface: 86 }, [carrez('62 m²')], AUJOURDHUI);
    const ecart = points.find((p) => p.genre === 'incoherence');
    expect(ecart).toBeDefined();
    expect(ecart?.explication).toMatch(/28 %/);
  });

  it('tolère un écart de quelques pourcents', () => {
    const points = controler({ surface: 86 }, [carrez('82,14 m²')], AUJOURDHUI);
    expect(points.filter((p) => p.genre === 'incoherence')).toHaveLength(0);
  });

  it('ne compare rien s’il manque une des deux surfaces', () => {
    expect(controler({}, [carrez('82,14 m²')], AUJOURDHUI)).toHaveLength(0);
  });
});
