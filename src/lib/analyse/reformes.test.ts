import { describe, expect, it } from 'vitest';
import {
  dateFrancaise,
  faitDesReformes,
  OU_RECTIFIER,
  OU_REFAIRE,
  reformesDepuis,
  reformesElectricite
} from './reformes';
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

/**
 * La réforme du 1ᵉʳ juillet 2021 n'a pas réglé un curseur : elle a changé le
 * calcul, et rendu le DPE opposable. Deux lettres établies de part et d'autre
 * de cette date ne se comparent pas.
 */
describe('le changement de méthode de 2021', () => {
  it('le signale à un diagnostic antérieur à juillet 2021', () => {
    const r = reformesDepuis(dateFrancaise('12/03/2019'), 85).find((x) => /méthode/i.test(x.titre));
    expect(r).toBeDefined();
    expect(r?.texte).toMatch(/autre méthode de calcul/);
    expect(r?.texte).toMatch(/ne se compare/);
  });

  it('rappelle qu’un tel diagnostic est de toute façon périmé', () => {
    const r = reformesDepuis(dateFrancaise('12/03/2019'), 85).find((x) => /méthode/i.test(x.titre));
    expect(r?.texte).toMatch(/périmé/);
    expect(r?.texte).toMatch(/31 décembre 2024/);
  });

  it('ne le signale pas à un diagnostic postérieur', () => {
    const r = reformesDepuis(dateFrancaise('12/03/2022'), 85);
    expect(r.some((x) => /méthode/i.test(x.titre))).toBe(false);
  });

  /*
   * Le garde-fou de source. Les formations racontent volontiers le détail de ce
   * qui a changé dans le calcul — la fin de la méthode « sur factures »
   * notamment. Le décret, lui, renvoie les méthodes à un arrêté sans le dire.
   * On n'affirme pas une règle qu'on n'a pas lue à sa source.
   */
  it('n’affirme aucun détail de méthode non lu au texte', () => {
    const r = reformesDepuis(dateFrancaise('12/03/2019'), 85).find((x) => /méthode/i.test(x.titre));
    expect(r?.texte).not.toMatch(/sur factures|3CL|consommation réelle/i);
  });
});

/**
 * L'électricité, et pourquoi la mécanique du DPE ne s'y transpose pas.
 *
 * L'arrêté du 28 septembre 2017 abroge celui de 2008 et refond le modèle comme
 * la méthode. Mais il n'existe aucun observatoire où faire rééditer un
 * diagnostic électrique : il ne se rectifie pas, il se refait.
 */
describe('la réforme de 2017 pour l’électricité', () => {
  it('signale l’ancienne méthode à un diagnostic antérieur', () => {
    const r = reformesElectricite(dateFrancaise('12/03/2016'));
    expect(r).toHaveLength(1);
    expect(r[0]?.texte).toMatch(/modèle de 2008/);
    expect(r[0]?.texte).toMatch(/ne contrôlait pas les mêmes points/);
  });

  it('ne le signale pas à un diagnostic postérieur', () => {
    expect(reformesElectricite(dateFrancaise('12/03/2018'))).toEqual([]);
    expect(reformesElectricite(null)).toEqual([]);
  });

  /*
   * Le garde-fou. Promettre une mise à jour gratuite là où il n'y en a pas
   * serait pire que de se taire : le lecteur chercherait un formulaire qui
   * n'existe pas, et croirait son diagnostic récupérable.
   */
  it('ne promet aucune rectification, parce qu’il n’y en a pas', () => {
    const r = reformesElectricite(dateFrancaise('12/03/2016'));
    expect(r[0]?.texte).not.toMatch(/gratuit|mise à jour|attestation|rééditer/i);
    expect(r[0]?.texte).toMatch(/il se refait/);
  });

  it('rappelle que ce diagnostic ne vaut que trois ans', () => {
    expect(reformesElectricite(dateFrancaise('12/03/2016'))[0]?.texte).toMatch(/trois ans/);
  });

  it('renvoie vers l’annuaire officiel des diagnostiqueurs', () => {
    expect(OU_REFAIRE.url).toMatch(/diagnostiqueurs\.din\.developpement-durable\.gouv\.fr/);
    expect(OU_REFAIRE.comment).toMatch(/certification/);
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
