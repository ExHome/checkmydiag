import { describe, expect, it } from 'vitest';
import { dateFrancaise, faitDesReformes, OU_RECTIFIER, reformesDepuis } from './reformes';
import { analyserDpe } from './dpe';

describe('la date du diagnostic', () => {
  it('se lit à la française', () => {
    expect(dateFrancaise('05/08/2025')?.getFullYear()).toBe(2025);
    expect(dateFrancaise('05/08/2025')?.getMonth()).toBe(7);
    expect(dateFrancaise('05/08/2025')?.getDate()).toBe(5);
  });

  it('ne devine rien d’une forme inconnue', () => {
    expect(dateFrancaise('2025-08-05')).toBeNull();
    expect(dateFrancaise('août 2025')).toBeNull();
    expect(dateFrancaise(undefined)).toBeNull();
  });

  it('ne signale rien sans date', () => {
    expect(reformesDepuis(null, 22)).toEqual([]);
  });
});

/**
 * Un DPE ne vieillit pas seulement : la règle change sous lui.
 *
 * Deux réformes ont modifié la façon de classer un logement sans qu'aucun mur
 * ne bouge — les seuils des petites surfaces au 1ᵉʳ juillet 2024, le facteur de
 * conversion de l'électricité au 1ᵉʳ janvier 2026. Les deux textes ont été lus
 * au Journal officiel le 15/08/2026.
 */
describe('les seuils des petites surfaces', () => {
  const avant = dateFrancaise('12/03/2023');
  const apres = dateFrancaise('12/03/2025');

  it('signale l’attestation à un petit logement diagnostiqué avant juillet 2024', () => {
    const r = reformesDepuis(avant, 22).find((x) => /petites surfaces/i.test(x.titre));
    expect(r).toBeDefined();
    expect(r?.texte).toMatch(/attestation/);
    expect(r?.texte).toMatch(/sans refaire le diagnostic/);
  });

  /*
   * Le droit ouvert par l'article 3 ne vaut que pour les DPE réalisés à partir
   * du 1ᵉʳ juillet 2021 : un diagnostic plus ancien n'y entre pas.
   */
  it('n’ouvre pas ce droit à un diagnostic antérieur à juillet 2021', () => {
    const r = reformesDepuis(dateFrancaise('12/03/2020'), 22);
    expect(r.some((x) => /petites surfaces/i.test(x.titre))).toBe(false);
  });

  it('ne le signale pas à un logement que la réforme ne concerne pas', () => {
    const r = reformesDepuis(avant, 85);
    expect(r.some((x) => /petites surfaces/i.test(x.titre))).toBe(false);
  });

  it('ne le signale plus à un diagnostic postérieur à la réforme', () => {
    const r = reformesDepuis(apres, 22);
    expect(r.some((x) => /petites surfaces/i.test(x.titre))).toBe(false);
  });
});

describe('le facteur de conversion de l’électricité', () => {
  it('signale la mise à jour à tout diagnostic antérieur à 2026', () => {
    const r = reformesDepuis(dateFrancaise('05/08/2025'), 85).find((x) =>
      /électricité/i.test(x.titre)
    );
    expect(r).toBeDefined();
    expect(r?.texte).toMatch(/×1,9/);
    expect(r?.texte).toMatch(/gratuite/);
  });

  it('ne le signale plus après le 1ᵉʳ janvier 2026', () => {
    const r = reformesDepuis(dateFrancaise('05/02/2026'), 85);
    expect(r.some((x) => /électricité/i.test(x.titre))).toBe(false);
  });
});

describe('où faire rectifier', () => {
  it('renvoie à l’Observatoire de l’ADEME, et dit quoi emporter', () => {
    expect(OU_RECTIFIER.url).toMatch(/observatoire-dpe-audit\.ademe\.fr/);
    expect(OU_RECTIFIER.comment).toMatch(/numéro ADEME/);
    expect(OU_RECTIFIER.comment).toMatch(/gratuite/);
  });

  it('compte les réformes dans les chiffres du rapport', () => {
    const fait = faitDesReformes(reformesDepuis(dateFrancaise('12/03/2023'), 22));
    expect(fait?.valeur).toBe('2');
    expect(fait?.precision).toMatch(/petites surfaces/i);
  });
});

/** Le tout, sur un rapport complet : c'est là que ça compte. */
describe('sur un rapport réel', () => {
  const RAPPORT = [
    'N°ADEME : 2533E2550136P',
    'Diagnostic de performance',
    'Etabli le : 05/08/2023',
    'Type de bien : Appartement',
    'Surface de référence : 22.4 m²',
    'Ce logement émet 261 kg de CO ₂ par an,',
    'énergie totale pour les 8 105 kWh entre 690 € et 960 €'
  ];

  const diag = analyserDpe(RAPPORT, [4, 15]);
  const texte = diag.explication.join(' ');

  it('annonce les deux réformes', () => {
    expect(texte).toMatch(/attestation/);
    expect(texte).toMatch(/×1,9/);
  });

  /*
   * L'adresse de l'Observatoire était donnée en fin de paragraphe. Personne ne
   * suit une adresse écrite au fil du texte : elle est devenue une action, avec
   * ce qu'il faut avoir sous la main avant de cliquer.
   */
  it('offre la démarche en bouton, pas en note de bas de page', () => {
    expect(diag.demarche?.texte).toBe('Voir votre nouvelle note');
    expect(diag.demarche?.url).toMatch(/observatoire-dpe-audit\.ademe\.fr/);
    expect(diag.demarche?.quoiEmporter).toMatch(/numéro ADEME/);
  });

  it('ne propose aucune démarche quand aucune réforme ne s’applique', () => {
    const recent = analyserDpe(
      RAPPORT.map((l) => l.replace('05/08/2023', '05/08/2026')),
      [4, 15]
    );
    expect(recent.demarche).toBeUndefined();
  });

  it('n’en profite pas pour recalculer une lettre', () => {
    if (diag.schema?.genre !== 'dpe') throw new Error('schéma DPE attendu');
    expect(diag.schema.finale).toBeNull();
    expect(texte).not.toMatch(/passoire/i);
  });
});
