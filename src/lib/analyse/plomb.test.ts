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
