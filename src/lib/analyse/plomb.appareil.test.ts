import { describe, expect, it } from 'vitest';
import { appareilPlomb } from './plomb';

/**
 * L'appareil à fluorescence X, et ses conditions de validité.
 *
 * Le plomb se mesure avec une source de cobalt 57. L'appareil est réglementé
 * pour lui-même : autorisation de l'Autorité de sûreté nucléaire, et
 * vérification de justesse sur étalon en début et en fin de constat.
 *
 * Fragments anonymisés, calqués sur la page 4 d'un rapport réel.
 */
const PAGE_APPAREIL = [
  '2.1 L’appareil à fluorescence X',
  'Nom du fabricant de l’appareil FABRICANT',
  'Nature du radionucléide Co - 57',
  'Date du dernier chargement de la source 22/08/2019 de vie : 12mCI/444Mbq',
  'Autorisation/Déclaration ASN (DGSNR)',
  'Date d’autorisation/de déclaration Date de fin de validité (si applicable)',
  '21/11/2018 13/11/2023',
  'Étalon :',
  'Vérification de la justesse de l’appareil n° de mesure',
  'Etalonnage entrée 1 18/07/2022 1 (+/ - 0,1)',
  'Etalonnage sortie 352 18/07/2022 1 (+/ - 0,1)'
];

describe('la conformité de l’appareil de mesure', () => {
  it('relève la fin de validité de l’autorisation ASN', () => {
    expect(appareilPlomb(PAGE_APPAREIL).finAutorisation).toBe('13/11/2023');
  });

  it('voit que la justesse a été vérifiée le jour même, en entrée et en sortie', () => {
    expect(appareilPlomb(PAGE_APPAREIL).etalonnageDuJour).toBe(true);
  });

  it('ne se contente pas d’une seule vérification', () => {
    const seule = PAGE_APPAREIL.filter((l) => !/Etalonnage sortie/.test(l));
    expect(appareilPlomb(seule).etalonnageDuJour).toBe(false);
  });

  it('refuse deux vérifications faites à des dates différentes', () => {
    const decale = PAGE_APPAREIL.map((l) =>
      l.replace('Etalonnage sortie 352 18/07/2022', 'Etalonnage sortie 352 11/07/2022')
    );
    expect(appareilPlomb(decale).etalonnageDuJour).toBe(false);
  });

  it('se tait quand la page n’est pas là', () => {
    const a = appareilPlomb(['Constat de risque d’exposition au plomb']);
    expect(a.finAutorisation).toBeNull();
    expect(a.etalonnageDuJour).toBe(false);
  });
});
