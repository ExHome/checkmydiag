import { describe, expect, it } from 'vitest';
import { analyserPlomb } from './plomb';

/**
 * Les facteurs de dégradation du bâti.
 *
 * Le constat ne classe pas que des revêtements : il « dresse un relevé sommaire
 * des facteurs de dégradation du bâti » (L. 1334-5 du code de la santé
 * publique). Quand ils apparaissent, l'auteur transmet immédiatement copie à
 * l'agence régionale de santé, qui informe le préfet (L. 1334-10) — les deux
 * articles lus à la source le 15/08/2026.
 *
 * C'est la conséquence la plus lourde du constat, et elle ne dépend pas de la
 * classe : un logement peut être signalé sans qu'aucune unité ne soit classée 3.
 */
const ENTETE = ['CONSTAT DE RISQUE D’EXPOSITION AU PLOMB', 'Rédigé par le cabinet le 12/03/2024'];

describe('les facteurs de dégradation du bâti', () => {
  it('relève l’humidité quand la rubrique la mentionne', () => {
    const d = analyserPlomb(
      [...ENTETE, 'Facteurs de dégradation du bâti relevés : traces d’humidité en cave.'],
      [4, 9]
    );

    const fait = d.faits.find((f) => f.libelle === 'Facteurs de dégradation du bâti');
    expect(fait?.valeur).toBe('1');
    expect(fait?.precision).toBe('Humidité');
  });

  it('relève l’effondrement et les revêtements dégradés', () => {
    const d = analyserPlomb(
      [
        ...ENTETE,
        'Facteurs de dégradation du bâti : plancher menaçant effondrement, écaillage des peintures.'
      ],
      [4, 9]
    );

    const fait = d.faits.find((f) => f.libelle === 'Facteurs de dégradation du bâti');
    expect(fait?.precision).toMatch(/Effondrement/);
    expect(fait?.precision).toMatch(/Revêtements dégradés/);
  });

  /*
   * Le garde-fou principal. Le mot « humidité » traîne dans la notice
   * d'information annexée à tout constat : le relever là ferait signaler un
   * facteur de dégradation sur chaque rapport, et un logement partirait à
   * l'agence régionale de santé dans le texte du produit sans y être parti dans
   * la réalité.
   */
  it('ne confond pas la notice d’information avec le relevé', () => {
    const d = analyserPlomb(
      [
        ...ENTETE,
        'NOTICE D’INFORMATION',
        'L’humidité favorise la dégradation des peintures au plomb.',
        'Le saturnisme touche surtout les jeunes enfants.'
      ],
      [4, 9]
    );

    expect(d.faits.find((f) => f.libelle === 'Facteurs de dégradation du bâti')).toBeUndefined();
  });

  it('n’en relève aucun quand le constat n’en signale pas', () => {
    const d = analyserPlomb([...ENTETE, 'Facteurs de dégradation du bâti : néant.'], [4, 9]);
    expect(d.faits.find((f) => f.libelle === 'Facteurs de dégradation du bâti')).toBeUndefined();
  });
});

describe('ce que la fiche plomb doit dire', () => {
  const d = analyserPlomb(ENTETE, [4, 9]);

  it('explique la transmission à l’agence régionale de santé', () => {
    expect(d.explication.join(' ')).toMatch(/agence régionale de santé/);
    expect(d.explication.join(' ')).toMatch(/informe le préfet/);
  });

  it('dit que la transmission ne dépend pas de la classe', () => {
    expect(d.explication.join(' ')).toMatch(/ne dépend pas de la classe/);
  });

  it('nomme les enfants de moins de six ans', () => {
    expect(d.explication.join(' ')).toMatch(/moins de six ans/);
  });
});

/**
 * La validité du CREP dépend du RÉSULTAT, pas de la dégradation.
 *
 * Le produit annonçait « sans limite de durée à la vente » dès qu'aucune unité
 * n'était classée 3 — or une seule unité de classe 1 suffit à rendre le constat
 * positif, et un constat positif périme au bout d'un an à la vente. Un vendeur
 * s'y fiant aurait présenté un constat caduc à la signature.
 */
describe('la durée de validité, selon le résultat', () => {
  const CREP = (c1: number, c2: number, c3: number) => [
    'Constat de risque d’exposition au plomb',
    'Total Non mesurées Classe 0 Classe 1 Classe 2 Classe 3',
    `12 2 ${12 - 2 - c1 - c2 - c3} ${c1} ${c2} ${c3}`
  ];

  it('dit « un an à la vente » pour une seule classe 1, en bon état', () => {
    const d = analyserPlomb(CREP(1, 0, 0), [1, 12]);
    expect(d.aFaire.join(' ')).toMatch(/valable qu’un an à la vente/);
    expect(d.aFaire.join(' ')).not.toMatch(/pas de limite de durée/);
  });

  it('ne promet « pas de limite de durée » que si rien n’a été détecté', () => {
    const d = analyserPlomb(CREP(0, 0, 0), [1, 12]);
    expect(d.aFaire.join(' ')).toMatch(/pas de limite de durée/);
  });

  it('garde l’obligation de travaux quand une classe 3 est présente', () => {
    const d = analyserPlomb(CREP(0, 0, 2), [1, 12]);
    expect(d.aFaire.join(' ')).toMatch(/L\.1334-9/);
    expect(d.aFaire.join(' ')).toMatch(/valable qu’un an à la vente/);
  });
});
