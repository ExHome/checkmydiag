import { describe, expect, it } from 'vitest';
import { confianceDuDossier, etiquetteDe, origineDe } from './confiance';
import type { Diagnostic, Gravite, Schema } from '../modele';

function diag(gravite: Gravite, extra: Partial<Diagnostic> = {}): Diagnostic {
  return {
    type: 'dpe',
    titre: 'essai',
    verdict: '',
    gravite,
    faits: [],
    explication: [],
    aFaire: [],
    schema: null,
    pages: [1, 2],
    ...extra
  };
}

/** Un schéma DPE dont la lettre a été, ou non, reconstituée. */
function schemaDpe(recalculee: boolean): Schema {
  return {
    genre: 'dpe',
    energie: { lettre: 'F', valeur: 380, unite: 'kWh/m²/an', recalculee },
    climat: null,
    finale: 'F',
    postes: [],
    isolation: { murs: 'inconnu', toit: 'inconnu', plancher: 'inconnu', fenetres: 'inconnu' }
  };
}

describe('origine d’un verdict', () => {
  it('reconnaît une conclusion lue au rapport', () => {
    expect(origineDe(diag('bon'))).toBe('rapport');
  });

  it('reconnaît une conclusion reprise de la page de synthèse', () => {
    expect(origineDe(diag('attention', { source: 'synthese' }))).toBe('synthese');
  });

  it('reconnaît une étiquette recalculée : ce n’est pas une lecture', () => {
    expect(origineDe(diag('alerte', { schema: schemaDpe(true) }))).toBe('calcul');
  });

  it('laisse « rapport » quand l’étiquette a pu être lue telle quelle', () => {
    expect(origineDe(diag('alerte', { schema: schemaDpe(false) }))).toBe('rapport');
  });

  it('un diagnostic sans verdict reste illisible, même avec un schéma', () => {
    // La case cochée à la main l'emporte : on ne rattrape pas un verdict absent
    // avec une valeur calculée ailleurs.
    expect(origineDe(diag('neutre', { schema: schemaDpe(true) }))).toBe('illisible');
  });

  it('la synthèse ne masque pas un verdict manquant', () => {
    expect(origineDe(diag('neutre', { source: 'synthese' }))).toBe('illisible');
  });
});

describe('ce qu’on a le droit d’écrire au-dessus', () => {
  it('n’annonce « le rapport dit » que pour une lecture directe', () => {
    expect(etiquetteDe('rapport')).toMatch(/rapport dit/i);
    for (const autre of ['synthese', 'calcul', 'illisible'] as const) {
      expect(etiquetteDe(autre)).not.toMatch(/^Le rapport dit/i);
    }
  });

  it('dit qu’une valeur recalculée n’est pas lisible dans le PDF', () => {
    expect(etiquetteDe('calcul')).toMatch(/recalcul/i);
    expect(etiquetteDe('calcul')).toMatch(/pas lisible/i);
  });
});

describe('confiance d’ensemble', () => {
  it('vaut 1 quand tout a été lu au rapport', () => {
    expect(confianceDuDossier([diag('bon'), diag('attention')])).toBe(1);
  });

  it('baisse quand le dossier repose sur sa page de synthèse', () => {
    const dossier = [diag('bon'), diag('attention', { source: 'synthese' })];
    expect(confianceDuDossier(dossier)).toBeLessThan(1);
    expect(confianceDuDossier(dossier)).toBeGreaterThan(0.5);
  });

  it('tombe quand rien n’a pu être conclu', () => {
    expect(confianceDuDossier([diag('neutre'), diag('neutre')])).toBe(0);
  });

  it('vaut 0 pour un dossier vide : ne rien lire n’est pas une lecture parfaite', () => {
    expect(confianceDuDossier([])).toBe(0);
  });
});
