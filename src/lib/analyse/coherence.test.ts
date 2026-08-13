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
  /** Un dossier technique : il porte sa page « résumé de l'expertise ». */
  function surDossier(bien: Bien, ...types: Diagnostic['type'][]) {
    return controler(bien, types.map((t) => diag(t, '01/07/2026')), AUJOURDHUI, true);
  }

  it('réclame un repérage amiante pour un logement d’avant 1997', () => {
    const points = surDossier({ anneeConstruction: '1975' }, 'dpe', 'termites');
    expect(points.some((p) => p.genre === 'manque' && p.type === 'amiante')).toBe(true);
  });

  it('réclame un constat plomb pour un logement d’avant 1949', () => {
    const points = surDossier({ anneeConstruction: 'Avant 1948' }, 'dpe', 'termites');
    expect(points.some((p) => p.genre === 'manque' && p.type === 'plomb')).toBe(true);
  });

  it('réclame le diagnostic électricité au-delà de quinze ans', () => {
    const points = surDossier({ anneeConstruction: '1975' }, 'dpe', 'termites');
    const manque = points.find((p) => p.genre === 'manque' && p.type === 'electricite');
    expect(manque).toBeDefined();
    // Le ton : une question à poser, jamais un dossier déclaré fautif.
    expect(manque?.explication).toMatch(/quinze ans/);
    expect(manque?.explication).not.toMatch(/faux|incomplet|erreur/i);
  });

  it('ne réclame pas l’électricité pour une installation récente', () => {
    const points = surDossier({ anneeConstruction: '2020' }, 'dpe', 'termites');
    expect(points.some((p) => p.type === 'electricite')).toBe(false);
  });

  it('ne réclame jamais le gaz : rien ne dit que le logement y est raccordé', () => {
    const points = surDossier({ anneeConstruction: '1930' }, 'dpe', 'termites');
    expect(points.some((p) => p.type === 'gaz')).toBe(false);
  });

  it('ne réclame rien pour un logement récent', () => {
    expect(surDossier({ anneeConstruction: '2015' }, 'dpe', 'termites')).toHaveLength(0);
  });

  it('ne réclame pas ce qui est déjà au dossier', () => {
    const points = surDossier({ anneeConstruction: '1930' }, 'dpe', 'amiante', 'plomb', 'electricite');
    expect(points.filter((p) => p.genre === 'manque')).toHaveLength(0);
  });

  it('ne réclame rien à un audit énergétique : ce n’est pas un dossier', () => {
    // Un audit accompagné d'un état termites reste un audit. Lui reprocher
    // l'absence de repérage amiante trompe le lecteur sur ce qu'il a déposé.
    const bien: Bien = { anneeConstruction: 'Avant 1948' };
    const rapport = [diag('dpe', '01/07/2026'), diag('termites', '01/07/2026')];
    expect(controler(bien, rapport, AUJOURDHUI).filter((p) => p.genre === 'manque')).toHaveLength(0);
  });

  it('reconnaît un dossier à ses trois diagnostics, même sans page de synthèse', () => {
    const bien: Bien = { anneeConstruction: 'Avant 1948' };
    const dossier = [diag('dpe', '01/07/2026'), diag('termites', '01/07/2026'), diag('erp', '01/07/2026')];
    const points = controler(bien, dossier, AUJOURDHUI);
    expect(points.some((p) => p.genre === 'manque' && p.type === 'amiante')).toBe(true);
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
