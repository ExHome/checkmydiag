import { describe, expect, it } from 'vitest';
import { analyser } from './index';
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

  /*
   * Ce test gelait une faute. Un DPE du 05/08/2020 a moins de dix ans, mais il a
   * été établi avant le 1ᵉʳ juillet 2021 : le décret n° 2020-1610 du 17 décembre
   * 2020 a mis fin à sa validité au 31 décembre 2024. Le produit affichait
   * « Valable jusqu'au 05/08/2030 » sur un document qui ne vaut plus rien.
   */
  it('signale un DPE d’avant juillet 2021, même s’il a moins de dix ans', () => {
    const points = controler({}, [diag('dpe', '05/08/2020')], AUJOURDHUI);
    expect(points).toHaveLength(1);
    expect(points[0]?.genre).toBe('perime');
    expect(points[0]?.explication).toMatch(/31\/12\/2024/);
  });

  it('signale un DPE de 2015 à son échéance propre, le 31 décembre 2022', () => {
    const points = controler({}, [diag('dpe', '14/02/2015')], AUJOURDHUI);
    expect(points[0]?.genre).toBe('perime');
    expect(points[0]?.explication).toMatch(/31\/12\/2022/);
  });

  it('accepte un DPE établi après le 1ᵉʳ juillet 2021 et de moins de dix ans', () => {
    expect(controler({}, [diag('dpe', '05/08/2022')], AUJOURDHUI)).toHaveLength(0);
  });

  it('explique qu’un vieux DPE est arrêté par la loi, pas par son âge', () => {
    /*
     * Ce test attendait « 11 ans » : le diagnostic était signalé comme trop
     * vieux. Il l'est, mais ce n'est pas la raison qui compte — un DPE de 2015 a
     * cessé de valoir le 31 décembre 2022 par l'effet du décret, et un DPE de
     * 2020, qui a moins de dix ans, ne vaut pas davantage. Dire l'âge laissait
     * croire qu'un document plus récent serait bon.
     */
    const points = controler({}, [diag('dpe', '05/08/2015')], AUJOURDHUI);
    expect(points[0]?.genre).toBe('perime');
    expect(points[0]?.titre).toMatch(/malgr[ée] la date imprim[ée]e/i);
    expect(points[0]?.explication).toMatch(/17 d[ée]cembre 2020|r[ée]forme du 1/i);
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

  it('ne réclame rien qui tienne à l’âge, pour un logement récent', () => {
    // L'état des risques, lui, est dû quel que soit le bâti : il est réclamé
    // ici à juste titre, et ce test ne porte que sur les manques liés à l'âge.
    const points = surDossier({ anneeConstruction: '2015' }, 'dpe', 'termites');
    expect(points.filter((p) => p.type !== 'erp')).toHaveLength(0);
  });

  it('réclame l’état des risques, qui ne dépend pas de l’année', () => {
    /*
     * Huit dossiers sur cent n'en portent aucun. C'est le diagnostic qui périme
     * le plus vite, et il dit si le bien est en zone inondable ou en zone
     * d'argile : son absence vaut d'être signalée.
     */
    const points = surDossier({ anneeConstruction: '2015' }, 'dpe', 'termites');
    const erp = points.find((p) => p.type === 'erp');
    expect(erp?.genre).toBe('manque');
    expect(erp?.quoiFaire).toMatch(/six mois/);
  });

  it('réclame le DPE quand il manque, quel que soit le bâti', () => {
    const points = surDossier({ anneeConstruction: '2015' }, 'erp', 'termites');
    expect(points.find((p) => p.type === 'dpe')?.genre).toBe('manque');
  });

  it('ne réclame pas ce qui est déjà au dossier', () => {
    const points = surDossier(
      { anneeConstruction: '1930' },
      'dpe',
      'erp',
      'amiante',
      'plomb',
      'electricite'
    );
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
  /** Une attestation de surface HABITABLE — la loi Boutin. */
  function boutin(valeur: string): Diagnostic {
    return {
      ...diag('carrez', '01/07/2026'),
      faits: [{ libelle: 'Surface habitable', valeur }]
    };
  }

  /** Une attestation de superficie privative — la loi Carrez. */
  function carrez(valeur: string): Diagnostic {
    return {
      ...diag('carrez', '01/07/2026'),
      faits: [{ libelle: 'Superficie privative', valeur }]
    };
  }

  it('signale un écart important entre le DPE et la surface habitable', () => {
    const points = controler({ surface: 86 }, [boutin('62 m²')], AUJOURDHUI);
    const ecart = points.find((p) => p.genre === 'incoherence');
    expect(ecart).toBeDefined();
    expect(ecart?.explication).toMatch(/28 %/);
  });

  /*
   * Le DPE n'a JAMAIS employé la superficie Carrez : surface habitable avant le
   * 1ᵉʳ juillet 2024, surface de référence depuis. La Carrez, elle, mesure la
   * superficie privative d'un lot de copropriété — elle exclut caves, garages,
   * terrasses et tout ce qui est sous 1,80 m.
   *
   * Les comparer et s'alarmer d'un écart revient à s'étonner qu'un poids
   * diffère d'une longueur. Ce test fige la règle : sur un dossier qui ne porte
   * qu'une Carrez, le contrôle se tait.
   */
  it('ne compare pas le DPE à une superficie Carrez', () => {
    const points = controler({ surface: 86 }, [carrez('62 m²')], AUJOURDHUI);
    expect(points.find((p) => p.genre === 'incoherence')).toBeUndefined();
  });

  it('tolère un écart de quelques pourcents', () => {
    const points = controler({ surface: 86 }, [boutin('82,14 m²')], AUJOURDHUI);
    expect(points.filter((p) => p.genre === 'incoherence')).toHaveLength(0);
  });

  it('ne compare rien s’il manque une des deux surfaces', () => {
    expect(controler({}, [carrez('82,14 m²')], AUJOURDHUI)).toHaveLength(0);
  });
});

/**
 * Réclamer un rapport qui est sous les yeux du lecteur est pire qu'un silence :
 * il cesse de faire confiance à tout le reste. Mesuré avant ce garde-fou :
 * quinze dossiers sur cent se voyaient réclamer un DPE dont le numéro ADEME
 * figure pourtant dans leurs pages.
 */
describe('ne jamais réclamer ce qui est déjà dans le document', () => {
  const page = (numero: number, ...lignes: string[]) => ({ numero, lignes });

  it('ne réclame pas un DPE dont le numéro ADEME figure au dossier', () => {
    const { controles } = analyser([
      page(1, 'Dossier Technique Immobilier', 'Numéro de dossier : 24/IMO/0154N'),
      page(2, 'Résumé de l’expertise n° 24/IMO/0154N', 'Prestations Conclusion'),
      page(3, 'N°ADEME : 2233E0402728W', 'Etabli le : 30/06/2025'),
      page(4, 'Etat des Risques et Pollutions', 'En application des articles L125-5 à 7')
    ]);
    expect(controles.some((c) => c.genre === 'manque' && c.type === 'dpe')).toBe(false);
  });

  it('réclame l’état des risques malgré son titre dans la grille des prestations', () => {
    /*
     * « Etat des Risques et Pollutions » figure dans la grille des quarante
     * prestations de TOUS les dossiers, même ceux qui n'en portent aucun. Seule
     * la mention légale prouve la présence du rapport.
     */
    const { controles } = analyser([
      page(1, 'Dossier Technique Immobilier', 'Numéro de dossier : 24/IMO/0154N'),
      page(2, 'Résumé de l’expertise n° 24/IMO/0154N', 'Prestations Conclusion'),
      page(3, 'Etat des Risques et Pollutions Plomb dans l’eau Radon', 'Sécurité piscines Accessibilité Handicapés'),
      page(4, 'N°ADEME : 2233E0402728W', 'Diagnostic de performance énergétique'),
      page(5, 'Etat de l’Installation Intérieure d’Electricité n° 24/IMO/0154N', 'L’installation intérieure d’électricité ne comporte aucune anomalie.'),
      page(6, 'Etat relatif à la présence de termites n° 24/IMO/0154N', 'Absence d’indices d’infestation de termites')
    ]);
    expect(controles.some((c) => c.genre === 'manque' && c.type === 'erp')).toBe(true);
  });
});
