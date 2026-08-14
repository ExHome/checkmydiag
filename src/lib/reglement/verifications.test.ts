import { describe, expect, it } from 'vitest';
import type { Diagnostic } from '../modele';
import { OBSERVATOIRE, RECOURS, verificationsDpe } from './verifications';

const dpeNu = (): Diagnostic => ({
  type: 'dpe',
  titre: 'Performance énergétique (DPE)',
  verdict: 'Classe D',
  gravite: 'attention',
  faits: [],
  explication: [],
  aFaire: [],
  schema: null,
  pages: [1, 6]
});

describe('les vérifications officielles du DPE', () => {
  it('reprend les cinq points du document du ministère, dans son ordre', () => {
    const v = verificationsDpe(dpeNu());
    expect(v).toHaveLength(5);
    expect(v[0]?.point).toMatch(/num[ée]ro/i);
    expect(v[1]?.point).toMatch(/surface/i);
    expect(v[2]?.point).toMatch(/[ée]nergie/i);
    expect(v[3]?.point).toMatch(/logement/i);
    expect(v[4]?.point).toMatch(/[ée]quipements/i);
  });

  it('renvoie à l’Observatoire de l’ADEME pour le numéro', () => {
    const v = verificationsDpe(dpeNu());
    expect(v[0]?.lien?.url).toBe(OBSERVATOIRE);
    expect(OBSERVATOIRE).toMatch(/^https:\/\/observatoire-dpe\.ademe\.fr\//);
  });

  it('montre ce que le rapport dit quand il le dit', () => {
    const dpe = dpeNu();
    dpe.faits.push({ libelle: 'N° ADEME', valeur: '2D20210532L1A' });
    dpe.faits.push({ libelle: 'Surface de référence', valeur: '86,82 m²' });

    const v = verificationsDpe(dpe);
    expect(v[0]?.releve).toBe('2D20210532L1A');
    expect(v[1]?.releve).toBe('86,82 m²');
    // Numéro trouvé : la consigne devient « saisissez-le », pas « cherchez-le ».
    expect(v[0]?.quoiFaire).toMatch(/saisissez/i);
  });

  it('dit où chercher quand il n’a rien lu, plutôt que de se taire', () => {
    const v = verificationsDpe(dpeNu());
    expect(v[0]?.releve).toBeNull();
    expect(v[0]?.quoiFaire).toMatch(/premi[èe]re page|treize caract/i);
  });

  it('n’arbitre jamais à la place du lecteur', () => {
    // L'application ne sait pas quelle est la vraie surface d'un logement ni
    // quelle énergie le chauffe. Elle rapproche, elle ne tranche pas : aucune
    // consigne ne doit affirmer que la donnée est juste ou fausse.
    for (const v of verificationsDpe(dpeNu())) {
      expect(v.quoiFaire).not.toMatch(/est (?:donc )?(?:faux|fausse|correct|exact)/i);
      expect(v.pourquoi.length).toBeGreaterThan(40);
    }
  });

  it('donne les trois recours dans l’ordre du ministère', () => {
    expect(RECOURS).toHaveLength(3);
    expect(RECOURS[0].etape).toMatch(/diagnostiqueur/i);
    expect(RECOURS[1].etape).toMatch(/certification/i);
    expect(RECOURS[2].etape).toMatch(/m[ée]diation/i);
    // Le recours au certificateur n'a de sens que si l'on sait où le trouver.
    expect(RECOURS[1].quoi).toMatch(/premi[èe]re page/i);
  });
});
