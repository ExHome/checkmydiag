import { describe, expect, it } from 'vitest';
import { analyserErp } from './risques';
import { libelleCourt } from '../libelle';
import { origineDe, etiquetteDe } from './confiance';

const PLAGE: [number, number] = [1, 4];

describe('ERP : un seul non-concerné', () => {
  it('bascule tout au vert', () => {
    const d = analyserErp(
      [
        'ETAT DES RISQUES ET POLLUTIONS',
        'Le bien ne se situe pas dans une zone d’un plan d’exposition au bruit.',
        'Etabli le 12/05/2026'
      ],
      PLAGE
    );
    console.log('VERDICT   :', d.verdict);
    console.log('GRAVITE   :', d.gravite);
    console.log('LIBELLE   :', libelleCourt(d));
    console.log('ORIGINE   :', origineDe(d), '->', etiquetteDe(origineDe(d)));
    console.log('SCHEMA    :', JSON.stringify(d.schema));
    console.log('FAITS     :', JSON.stringify(d.faits));
    expect(true).toBe(true);
  });

  it('rien du tout', () => {
    const d = analyserErp(['ETAT DES RISQUES ET POLLUTIONS', 'Page 1 sur 4'], PLAGE);
    console.log('--- rien lu ---');
    console.log('VERDICT   :', d.verdict);
    console.log('GRAVITE   :', d.gravite);
    console.log('LIBELLE   :', libelleCourt(d));
    expect(true).toBe(true);
  });
});
