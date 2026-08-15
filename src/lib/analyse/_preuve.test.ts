import { describe, expect, it } from 'vitest';
import { analyserErp } from './risques';

const P: [number, number] = [1, 2];

describe('preuve notaire', () => {
  it('PPRN mouvement de terrain + cavites : que rend le produit ?', () => {
    const d = analyserErp(
      [
        'ETAT DES RISQUES ET POLLUTIONS',
        'Le bien se situe dans le perimetre d’un plan de prevention des risques naturels mouvement de terrain, approuve le 12/04/2011.',
        'Le bien est situe dans une zone d’alea retrait lie a la presence de cavites souterraines et d’anciennes carrieres.',
        'Le bien ne se situe pas dans le perimetre d’un plan de prevention des risques technologiques.',
        'Le bien ne se situe pas dans une zone d’un plan d’exposition au bruit.'
      ],
      P
    );
    console.log('VERDICT   :', d.verdict);
    console.log('GRAVITE   :', d.gravite);
    console.log('SCHEMA    :', JSON.stringify(d.schema));
    expect(true).toBe(true);
  });

  it('trait de cote + debroussaillement', () => {
    const d = analyserErp(
      [
        'ETAT DES RISQUES ET POLLUTIONS',
        'Le bien est situe dans une zone exposee au recul du trait de cote a l’horizon 30 ans.',
        'Le bien est soumis a l’obligation legale de debroussaillement.',
        'Le bien ne se situe pas dans une zone inondable.'
      ],
      P
    );
    console.log('VERDICT 2 :', d.verdict);
    console.log('GRAVITE 2 :', d.gravite);
  });
});
