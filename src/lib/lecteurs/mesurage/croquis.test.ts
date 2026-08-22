/**
 * Le croquis : les quatre états, éprouvés sur les dispositions relevées dans
 * 25 rapports le 22/08/2026.
 *
 * Les extraits reproduisent l'ordre des lignes des pages concernées, sans nom
 * ni adresse. Les deux premiers tests sont les deux mesures qui s'étaient
 * trompées : ils existent pour que l'erreur ne revienne pas.
 */
import { describe, expect, it } from 'vitest';
import { legendeDuCroquis, trouverLeCroquis, type PageLue } from './croquis';

const p = (numero: number, lignes: string[]): PageLue => ({ numero, lignes });

/** La planche amiante : titre, légende, bien identifié. La vraie. */
const PLANCHE_AMIANTE = p(31, [
  'Dossier Amiante – Parties privatives n° 00/AAA/0000',
  '7.1 - Annexe - Schéma de repérage',
  'Légende',
  'Nom du propriétaire :',
  'SOCIÉTÉ',
  'Adresse du bien :',
  'SARL DGLM EXPERTISES |27 TER RUE DES SABLES 33320 EYSINES| Tél. : 06.72.70.03.38'
]);

/** La page « Règles élémentaires de sécurité » de l'électricité. Pas un dessin. */
const ANNEXE_ELECTRICITE = p(24, [
  'Etat de l’Installation Intérieure d’Electricité n° 00/AAA/0000',
  'Annexe - Croquis de repérage',
  'Règles élémentaires de sécurité et d’usage à respecter (liste non exhaustive)',
  'L’électricité peut être à l’origine de plusieurs types d’accidents',
  'SARL DGLM EXPERTISES | 76 COURS PORTAL 33000 BORDEAUX'
]);

/** Le sommaire des annexes du volet amiante : la planche est annoncée, pas là. */
const SOMMAIRE_AMIANTE = p(30, [
  'Dossier Amiante – Parties privatives n° 00/AAA/0000',
  'ANNEXES',
  'Au rapport de mission de repérage n° 00/AAA/0000',
  'Informations conformes à l’annexe III de l’arrêté du 12 décembre 2012',
  '7.1 Schéma de repérage',
  '7.3 - Annexe - Evaluation de l’état de conservation'
]);

/** Le volet de mesurage, qui répond « il n'y en a pas ». */
const MESURAGE_SANS_SCHEMA = p(7, [
  'Certificat de superficie n° 00/AAA/0000',
  'Fait à BORDEAUX , le 21/01/2022',
  'Aucun document n’a été mis en annexe',
  'Aucun schéma de repérage n’a été joint à ce rapport.'
]);

const SECTIONS = [
  { type: 'carrez' as const, plage: [5, 9] as const },
  { type: 'electricite' as const, plage: [20, 25] as const },
  { type: 'amiante' as const, plage: [26, 35] as const }
];

describe('les deux mesures qui s’étaient trompées', () => {
  it('ne prend pas le certificat de compétence pour un plan', () => {
    /* 49 volets de mesurage sur 50 portent une grande image en fin de volet :
       c'est le certificat du diagnostiqueur, numérisé. Aucune page de mesurage
       ne doit donc jamais ressortir « trouvé ». */
    const volet = [
      p(6, ['Attestation de surface n° 00/AAA/0000', '4 / 4', 'Rapport du :', '25/01/2022'])
    ];
    expect(trouverLeCroquis(volet, SECTIONS).etat).toBe('non trouvé');
  });

  it('ne prend pas une page de consignes de sécurité pour un croquis', () => {
    const trouve = trouverLeCroquis([ANNEXE_ELECTRICITE], SECTIONS);
    expect(trouve.etat).toBe('annoncé');
    if (trouve.etat !== 'annoncé') return;
    expect(trouve.titre).toBe('Annexe - Croquis de repérage');
    expect(trouve.pourquoi).toMatch(/ni légende ni identification/);
  });
});

describe('les quatre états', () => {
  it('trouve la planche amiante à sa signature positive', () => {
    const trouve = trouverLeCroquis([SOMMAIRE_AMIANTE, PLANCHE_AMIANTE], SECTIONS);
    expect(trouve).toMatchObject({
      etat: 'trouvé',
      page: 31,
      titre: '7.1 - Annexe - Schéma de repérage',
      volet: 'amiante'
    });
  });

  it('la planche l’emporte sur la rubrique seulement annoncée', () => {
    /* L'annexe électricité vient AVANT la planche amiante dans le dossier :
       si l'ordre des pages décidait, on montrerait la page de consignes. */
    const trouve = trouverLeCroquis(
      [ANNEXE_ELECTRICITE, SOMMAIRE_AMIANTE, PLANCHE_AMIANTE],
      SECTIONS
    );
    expect(trouve).toMatchObject({ etat: 'trouvé', page: 31, volet: 'amiante' });
  });

  it('ne confond pas la ligne du sommaire avec l’annexe', () => {
    const trouve = trouverLeCroquis([SOMMAIRE_AMIANTE], SECTIONS);
    expect(trouve).toMatchObject({
      etat: 'annoncé',
      titre: '7.1 Schéma de repérage',
      pourquoi: 'ligne du sommaire des annexes, pas la planche elle-même'
    });
  });

  it('« déclaré absent » n’est pas « non trouvé »', () => {
    const trouve = trouverLeCroquis([MESURAGE_SANS_SCHEMA], SECTIONS);
    expect(trouve.etat).toBe('déclaré absent');
    if (trouve.etat !== 'déclaré absent') return;
    expect(trouve.source).toMatch(/Aucun schéma de repérage/);
  });

  it('rend « non trouvé » quand le dossier n’en parle nulle part', () => {
    expect(trouverLeCroquis([p(1, ['Dossier de Diagnostic Technique'])], SECTIONS)).toEqual({
      etat: 'non trouvé'
    });
  });
});

describe('ce qu’on écrit au-dessus du croquis', () => {
  it('dit d’où il vient, et ce qu’il n’est pas', () => {
    const legende = legendeDuCroquis(trouverLeCroquis([PLANCHE_AMIANTE], SECTIONS));
    expect(legende).toMatch(/du repérage amiante/);
    expect(legende).toMatch(/page 31/);
    expect(legende).toMatch(/ni coté, ni contractuel/);
  });

  it('n’écrit rien quand il n’y a rien à montrer', () => {
    expect(legendeDuCroquis({ etat: 'non trouvé' })).toBeNull();
    expect(legendeDuCroquis({ etat: 'déclaré absent', source: '…' })).toBeNull();
  });
});
