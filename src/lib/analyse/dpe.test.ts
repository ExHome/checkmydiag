import { describe, expect, it } from 'vitest';
import { analyserDpe, classeFinale, classePour } from './dpe';

/**
 * Extrait anonymisé, calqué sur la mise en page réellement produite par les
 * générateurs de rapports (espaces fines dans les nombres, CO ₂ coupé, etc.).
 */
const DPE_TYPE = [
  'N°ADEME : 2533E2550136P',
  'Diagnostic de performance',
  'Etabli le : 05/08/2025',
  'énergétique (logement) Valable jusqu’au : 04/08/2035',
  'Type de bien : Appartement',
  'Année de construction : Avant 1948',
  'Surface de référence : 22.4 m²',
  'Ce logement émet 261 kg de CO ₂ par an,',
  'entre 690 € et 960 € par an',
  'chauffage Electrique 5 200 (2 261 é.f.) entre 450 € et 610 €',
  'eau chaude Electrique 2 804 (1 219 é.f.) entre 240 € et 330 €',
  'éclairage Electrique 102 (44 é.f.) entre 0 € et 20 €',
  'énergie totale pour les 8 105 kWh entre 690 € et 960 €'
];

describe('classement réglementaire', () => {
  it('classe l’énergie aux seuils de l’arrêté', () => {
    expect(classePour(69, [70, 110, 180, 250, 330, 420])).toBe('A');
    expect(classePour(180, [70, 110, 180, 250, 330, 420])).toBe('D');
    expect(classePour(362, [70, 110, 180, 250, 330, 420])).toBe('F');
    expect(classePour(500, [70, 110, 180, 250, 330, 420])).toBe('G');
  });

  it('retient la moins bonne des deux étiquettes', () => {
    expect(classeFinale('C', 'F')).toBe('F');
    expect(classeFinale('F', 'C')).toBe('F');
    expect(classeFinale('A', null)).toBe('A');
    expect(classeFinale(null, null)).toBeNull();
  });
});

describe('analyse d’un DPE', () => {
  const diag = analyserDpe(DPE_TYPE, [4, 15]);

  it('recalcule l’étiquette énergie à partir de la consommation et de la surface', () => {
    expect(diag.schema).not.toBeNull();
    if (diag.schema?.genre !== 'dpe') throw new Error('schéma DPE attendu');
    // 8 105 kWh / 22,4 m² = 362 kWh/m²/an → classe F
    expect(diag.schema.energie?.valeur).toBe(362);
    expect(diag.schema.energie?.lettre).toBe('F');
    // 261 kg / 22,4 m² = 11,7 kg CO₂/m²/an → classe C
    expect(diag.schema.climat?.lettre).toBe('C');
    expect(diag.schema.finale).toBe('F');
  });

  it('signale une passoire thermique', () => {
    expect(diag.gravite).toBe('alerte');
    expect(diag.verdict).toMatch(/passoire/i);
  });

  it('extrait les repères administratifs', () => {
    const libelles = diag.faits.map((f) => f.libelle);
    expect(libelles).toContain('N° ADEME');
    expect(libelles).toContain('Valable jusqu’au');
    // Les nombres s'écrivent à la française, virgule comprise.
    expect(diag.faits.find((f) => f.libelle === 'Surface de référence')?.valeur).toBe('22,4 m²');
  });

  it('répartit les postes de consommation', () => {
    if (diag.schema?.genre !== 'dpe') throw new Error('schéma DPE attendu');
    const noms = diag.schema.postes.map((p) => p.nom);
    expect(noms).toEqual(['chauffage', 'eau chaude', 'éclairage']);
    expect(diag.schema.postes[0]?.kwh).toBe(5200);
  });

  it('avertit que la lettre a été recalculée', () => {
    expect(diag.explication.join(' ')).toMatch(/recalcul/i);
  });
});

describe('audit énergétique : lecture du tableau d’état initial', () => {
  const enTete = [
    'Audit énergétique / Etat initial du logement p. 4',
    'Montants et consommations annuels d’énergie',
    'répartition des consommations kWhEP/m²/an',
    'usage chauffage refroidissement éclairage auxiliaires total'
  ];

  it('lit le total quand il porte les unités (mono-énergie)', () => {
    const diag = analyserDpe(
      [...enTete, 'd’énergie 495 (215 ) 64 (28 ) 5 (2 ) 14 (6 )', '578 EP (251 EF )'],
      [1, 27]
    );
    if (diag.schema?.genre !== 'dpe') throw new Error('schéma DPE attendu');
    expect(diag.schema.energie?.valeur).toBe(578);
    expect(diag.schema.finale).toBe('G');
  });

  it('ne confond pas la ligne d’une seconde énergie avec le total (bi-énergie)', () => {
    const diag = analyserDpe(
      [
        ...enTete,
        'd’énergie 278 EP (121 EF ) 44 EP (19 EF ) 5 EP (2 EF ) 13 EP (6 EF )',
        'Bois',
        '102 EP (102 EF )',
        '442 (250 )',
        'EP EF'
      ],
      [1, 27]
    );
    if (diag.schema?.genre !== 'dpe') throw new Error('schéma DPE attendu');
    // 278 + 44 + 5 + 13 + 102 = 442 : c'est le total, pas la ligne « Bois ».
    expect(diag.schema.energie?.valeur).toBe(442);
    expect(diag.schema.finale).toBe('G');
  });

  it('lit la fourchette de coût annuel du tableau', () => {
    const diag = analyserDpe(
      [
        ...enTete,
        '578 EP (251 EF )',
        'frais annuels d’énergie de 2 580 € de 330 € de 20 € de 70 € de 3 000 €',
        '(fourchette à 3 500 € à 460 € à 40 € à 100 € à 4 100 €'
      ],
      [1, 27]
    );
    const cout = diag.faits.find((f) => f.libelle === 'Coût annuel estimé');
    expect(cout?.valeur).toBe('entre 3 000 € et 4 100 €');
  });
});

describe('pièges des audits énergétiques', () => {
  it('ne prend pas un seuil réglementaire cité dans le texte pour la consommation du logement', () => {
    const audit = analyserDpe(
      [
        'Audit énergétique réglementaire',
        'Surface habitable : 86.85 m² Département : Gironde (33)',
        '- 1er janvier 2023 : CEF < 450 kWh/m2/an',
        '( - 476 kWhEP/m²/an) à 840 €',
        '- 82 % ( - 16 kgCO2/m²/an) à 840 €'
      ],
      [1, 30]
    );

    if (audit.schema?.genre !== 'dpe') throw new Error('schéma DPE attendu');
    expect(audit.schema.energie).toBeNull();
    expect(audit.schema.climat).toBeNull();
    expect(audit.schema.finale).toBeNull();
    expect(audit.gravite).toBe('neutre');
    expect(audit.verdict).toMatch(/pas lisibles automatiquement/i);
  });
});
