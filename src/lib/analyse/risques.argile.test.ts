/**
 * Les trois façons dont un état des risques annonce l'argile.
 *
 * Le moteur n'en connaissait qu'une. Mesuré sur 140 dossiers du corpus : 73
 * déclaraient le bien concerné, 6 sortaient dans le verdict. Ces tests figent
 * les trois formes réelles, et le fait qu'un « Non » reste un non.
 */
import { describe, expect, it } from 'vitest';
import { analyserErp } from './risques';

const SOCLE = ['Etat des Risques et Pollutions', 'Document réalisé le : 03/08/2023'];

function verdict(ligne: string): string {
  return analyserErp([...SOCLE, ligne], [1, 10]).verdict;
}

describe('les formes du retrait-gonflement', () => {
  it('lit la ligne du tableau de synthèse — la forme la plus fréquente', () => {
    expect(verdict('Zonage du retrait-gonflement des argiles Oui Aléa Moyen')).toMatch(/argiles/i);
  });

  it('en tire l’aléa, qui commande l’étude de sol', () => {
    expect(verdict('Zonage du retrait-gonflement des argiles Oui Aléa Moyen')).toMatch(/aléa moyen/i);
    expect(verdict('Zonage du retrait-gonflement des argiles Oui Aléa Fort')).toMatch(/aléa fort/i);
  });

  it('lit la phrase de la page de synthèse, tiret espacé compris', () => {
    expect(
      verdict(
        'Le bien se situe dans une zone réglementée du risque retrait - gonflement des argiles (L.132-4 du CCH).'
      )
    ).toMatch(/argiles/i);
  });

  it('lit l’ancienne forme, avec l’apostrophe typographique', () => {
    /* Le générateur emploie les deux apostrophes, parfois dans la même page. */
    expect(verdict('Le bien se situe dans une zone d’exposition moyenne au retrait-gonflement.')).toMatch(
      /argiles/i
    );
    expect(verdict("Le bien se situe dans une zone d'exposition forte au retrait-gonflement.")).toMatch(
      /argiles/i
    );
  });
});

describe('ce qui doit rester un non', () => {
  it('respecte un « Non » dans le tableau', () => {
    const d = analyserErp([...SOCLE, 'Zonage du retrait-gonflement des argiles Non -'], [1, 10]);
    expect(d.verdict).not.toMatch(/concerné par[^.]*argiles/i);
  });

  it('respecte une absence rédigée', () => {
    const d = analyserErp(
      [...SOCLE, 'Le bien ne se situe pas dans une zone de retrait - gonflement des argiles.'],
      [1, 10]
    );
    expect(d.verdict).not.toMatch(/concerné par[^.]*argiles/i);
  });

  it('ne prend pas le rappel de la loi pour un classement', () => {
    /* Cette phrase figure dans TOUS les rapports, concernés ou non : elle
       explique l'obligation d'étude géotechnique en zone réglementée. */
    const d = analyserErp(
      [
        ...SOCLE,
        'Dans le cas d’un projet de construction, conformément aux articles L.132-5 à L.132-9 du code de la construction et de l’habitation, le maître d’ouvrage transmet une étude géotechnique de conception.'
      ],
      [1, 10]
    );
    expect(d.verdict).not.toMatch(/argiles/i);
  });
});

describe('l’argile écrite en deux lignes, à l’envers', () => {
  /*
   * Quatrième écriture, trouvée en lisant un état des risques de 2023 : le
   * tableau Géorisques sort le détail AVANT le nom de sa propre ligne.
   *
   *     Le bien se situe dans une zone d'aléa Moyen.
   *     Retrait / gonflement des argiles
   *
   * La phrase seule ne nomme pas l'argile ; le libellé seul n'affirme rien.
   * Treize dossiers sur cinquante-cinq échappaient ainsi au produit.
   */
  it('lit l’aléa quand le détail précède le libellé', () => {
    const d = analyserErp(
      [
        'Etat des Risques et Pollutions',
        "Le bien se situe dans une zone d'aléa Moyen.",
        'Retrait / gonflement des argiles'
      ],
      [1, 12]
    );
    expect(d.verdict).toMatch(/argiles/i);
    expect(d.verdict).toMatch(/aléa moyen/i);
  });

  it('reste muet quand rien ne nomme l’argile', () => {
    const d = analyserErp(
      ['Etat des Risques et Pollutions', "Le bien se situe dans une zone d'aléa Moyen."],
      [1, 12]
    );
    expect(d.verdict).not.toMatch(/argiles/i);
  });
});
