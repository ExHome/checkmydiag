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

/**
 * Le même rapport, sur un logement au-dessus de 40 m².
 *
 * L'échelle générale ne vaut que là : 8 105 kWh pour 62,4 m² font
 * 130 kWh/m²/an, soit la classe C.
 */
const DPE_GRAND = DPE_TYPE.map((l) => l.replace('22.4 m²', '62.4 m²'));

describe('analyse d’un DPE', () => {
  const diag = analyserDpe(DPE_GRAND, [4, 15]);

  it('recalcule l’étiquette énergie à partir de la consommation et de la surface', () => {
    expect(diag.schema).not.toBeNull();
    if (diag.schema?.genre !== 'dpe') throw new Error('schéma DPE attendu');
    // 8 105 kWh / 62,4 m² = 130 kWh/m²/an → classe C
    expect(diag.schema.energie?.valeur).toBe(130);
    expect(diag.schema.energie?.lettre).toBe('C');
    // 261 kg / 62,4 m² = 4,2 kg CO₂/m²/an → classe A
    expect(diag.schema.climat?.lettre).toBe('A');
    expect(diag.schema.finale).toBe('C');
  });
});

/**
 * Le calendrier de la décence, classe par classe.
 *
 * Article 6 de la loi n° 89-462 du 6 juillet 1989, lu le 15/08/2026 : le
 * logement décent va de A à F depuis 2025, de A à E en 2028, de A à D en 2034.
 * Un logement qui sort de cette fourchette n'est plus décent — il ne peut plus
 * être loué.
 *
 * Le produit annonçait à la classe E « le blocage des loyers touchera cette
 * classe à partir de 2034 ». Faux deux fois, et dans le sens rassurant : le gel
 * des loyers ne vise que F et G, et ce qui attend la classe E est
 * l'interdiction de louer, pas une limite d'augmentation. Trouvé par la revue
 * réglementaire.
 */
describe('ce qu’on dit à un logement classé E', () => {
  const enE = [
    'Diagnostic de performance',
    'Etabli le : 12/03/2026',
    'Surface de référence : 68.0 m²',
    'Ce logement émet 1 500 kg de CO ₂ par an,',
    'énergie totale pour les 19 000 kWh entre 1 890 € et 2 560 €'
  ];

  const diag = analyserDpe(enE, [4, 15]);
  const texte = diag.aFaire.join(' ');

  it('parle bien d’un logement classé E', () => {
    if (diag.schema?.genre !== 'dpe') throw new Error('schéma DPE attendu');
    expect(diag.schema.finale).toBe('E');
  });

  it('annonce la perte de décence au 1ᵉʳ janvier 2034', () => {
    expect(texte).toMatch(/2034/);
    expect(texte).toMatch(/décent/i);
    expect(texte).toMatch(/ne pourra plus être loué|plus être loué/i);
  });

  /*
   * Le garde-fou. Le gel des loyers ne concerne que F et G : l'annoncer à un E
   * fait croire qu'il restera louable en 2034, à loyer figé. C'est l'inverse.
   */
  it('ne parle pas de blocage des loyers, qui ne vise pas cette classe', () => {
    expect(texte).not.toMatch(/blocage des loyers|loyer est bloqué|gel des loyers/i);
  });
});

/**
 * Les logements de 40 m² ou moins.
 *
 * Depuis le 1ᵉʳ juillet 2024, ils relèvent de seuils propres, établis mètre
 * carré par mètre carré (arrêté du 25 mars 2024, au référentiel). L'échelle
 * générale y est plus sévère que celle qui leur est due.
 *
 * Le produit l'appliquait quand même. Le cas de référence de ces tests — vingt-
 * deux mètres carrés — figeait précisément l'erreur : il attendait la classe F
 * et la mention « passoire thermique » pour un logement dont personne ne sait
 * ici s'il en est une. C'est un audit notarial qui l'a trouvé.
 */
describe('un logement de 40 m² ou moins', () => {
  const diag = analyserDpe(DPE_TYPE, [4, 15]);

  it('ne recalcule aucune lettre avec l’échelle générale', () => {
    if (diag.schema?.genre !== 'dpe') throw new Error('schéma DPE attendu');
    expect(diag.schema.energie).toBeNull();
    expect(diag.schema.climat).toBeNull();
    expect(diag.schema.finale).toBeNull();
  });

  /*
   * Le garde-fou qui compte. Sous 40 m², l'échelle générale ne peut que
   * sur-classer : elle produit de la fausse alarme, jamais de la fausse
   * réassurance. Annoncer « passoire thermique » déclenche derrière toute une
   * chaîne — plus louable, loyer gelé, audit énergétique à fournir — pour un
   * logement qui n'est peut-être concerné par aucune.
   */
  it('n’annonce pas une passoire thermique', () => {
    expect(diag.verdict).not.toMatch(/passoire/i);
    expect(diag.gravite).not.toBe('alerte');
  });

  it('dit pourquoi il s’abstient, et où trouver la vraie lettre', () => {
    const texte = diag.explication.join(' ');
    expect(texte).toMatch(/40 m² ou moins/);
    expect(texte).toMatch(/seuils propres/);
    expect(texte).toMatch(/étiquette du rapport|étiquette imprimée/);
  });

  it('garde les chiffres du rapport, qui restent vrais', () => {
    const libelles = diag.faits.map((f) => f.libelle);
    expect(libelles).toContain('N° ADEME');
  });
});

describe('ce qu’un DPE donne, quelle que soit la surface', () => {
  const diag = analyserDpe(DPE_GRAND, [4, 15]);

  it('extrait les repères administratifs', () => {
    const libelles = diag.faits.map((f) => f.libelle);
    expect(libelles).toContain('N° ADEME');
    expect(libelles).toContain('Valable jusqu’au');
    // Les nombres s'écrivent à la française, virgule comprise.
    expect(diag.faits.find((f) => f.libelle === 'Surface de référence')?.valeur).toBe('62,4 m²');
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
