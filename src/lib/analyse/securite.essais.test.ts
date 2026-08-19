import { describe, expect, it } from 'vitest';
import { analyserGaz, essaisGaz } from './securite';

/**
 * Les essais faits sur place, lus dans la rubrique « D. — Identification des
 * appareils ».
 *
 * Un état du gaz n'est pas qu'une liste de points cochés : le diagnostiqueur
 * mesure le monoxyde de carbone dans les produits de combustion. Quand il ne
 * l'a pas fait — appareil à l'arrêt, le plus souvent — le contrôle le plus
 * important du diagnostic n'a pas eu lieu.
 *
 * Fragments anonymisés, calqués sur la mise en page réelle.
 */
const RUBRIQUE_D = [
  'D. - Identification des appareils',
  'Observations :',
  'Liste des installations intérieures (2) Puissance',
  'Type Localisation (anomalie, taux de CO mesuré(s), motif de l’absence ou de',
  'gaz (Genre (1) , marque, modèle) en kW',
  'l’impossibilité de contrôle pour chaque appareil concerné)'
];

describe('les essais sur place', () => {
  it('voit que le monoxyde de carbone n’a pas été mesuré, et pourquoi', () => {
    const e = essaisGaz([
      ...RUBRIQUE_D,
      'Mesure CO : Non réalisée',
      'Chaudière MARQUE MODELE',
      'Fonctionnement : Appareil à l’arrêt',
      'Installation: 1997',
      'E. - Anomalies identifiées'
    ]);
    expect(e.co).toBe('non-realisee');
    expect(e.aLArret).toBe(true);
    expect(e.anneeAppareil).toBe(1997);
  });

  it('relève le taux quand il est écrit', () => {
    const e = essaisGaz([...RUBRIQUE_D, 'Mesure CO : Oui 12 ppm', 'E. - Anomalies identifiées']);
    expect(e.co).toBe('realisee');
    expect(e.ppm).toBe(12);
  });

  it('ne cherche pas hors de la rubrique D', () => {
    /* « Installation: 2015 » figure ailleurs dans le dossier — dans les rappels
       réglementaires, par exemple. Elle ne doit pas devenir l'âge de la
       chaudière. */
    const e = essaisGaz([
      ...RUBRIQUE_D,
      'Mesure CO : Non réalisée',
      'E. - Anomalies identifiées',
      'Installation: 2015'
    ]);
    expect(e.anneeAppareil).toBeNull();
  });

  it('se tait quand la rubrique ne dit rien', () => {
    const e = essaisGaz([...RUBRIQUE_D, 'E. - Anomalies identifiées']);
    expect(e.co).toBeNull();
    expect(e.ppm).toBeNull();
    expect(e.anneeAppareil).toBeNull();
  });
});

/**
 * Le garde-fou qui compte.
 *
 * « Aucune anomalie » sur une installation dont le CO n'a pas été mesuré n'est
 * pas une bonne nouvelle : c'est un contrôle incomplet. Le produit annonçait
 * une installation saine — une fausse réassurance sur le seul point du
 * diagnostic qui peut tuer.
 */
describe('aucune anomalie, mais aucune mesure de CO', () => {
  const CONCLUSION_VIDE = [
    'H. - Conclusion',
    'Conclusion :',
    'L’installation ne comporte aucune anomalie.',
    'L’installation comporte des anomalies de type A1 qui devront être réparées ultérieurement.',
    'L’installation comporte des anomalies de type A2 qui devront être réparées dans les meilleurs délais.',
    'L’installation comporte des anomalies de type DGI qui devront être réparées avant remise en service.'
  ];

  it('ne conclut pas à une installation saine', () => {
    const d = analyserGaz(
      [
        ...RUBRIQUE_D,
        'Mesure CO : Non réalisée',
        'Fonctionnement : Appareil à l’arrêt',
        'E. - Anomalies identifiées',
        'F. - Suite',
        ...CONCLUSION_VIDE
      ],
      [1, 7]
    );
    expect(d.gravite).toBe('attention');
    expect(d.verdict).toMatch(/monoxyde de carbone n’a pas été mesuré/);
    expect(d.verdict).toMatch(/arrêt/);
  });

  it('le dit aussi dans les chiffres de la fiche', () => {
    const d = analyserGaz(
      [
        ...RUBRIQUE_D,
        'Mesure CO : Non réalisée',
        'Fonctionnement : Appareil à l’arrêt',
        'Installation: 1997',
        'E. - Anomalies identifiées',
        'F. - Suite',
        ...CONCLUSION_VIDE
      ],
      [1, 7]
    );
    const libelles = d.faits.map((f) => f.libelle);
    expect(libelles).toContain('Mesure du monoxyde de carbone');
    expect(libelles).toContain('Appareil installé en');
  });
});

/**
 * La mesure de monoxyde de carbone, telle que les rapports l'écrivent.
 *
 * Relevé sur le corpus : aucun rapport n'écrit « Mesure CO : Oui ». Ils
 * écrivent la valeur — « Mesure CO : 0 ppm » — et le produit les comptait
 * toutes comme non mesurées.
 */
describe('la mesure de CO chiffrée', () => {
  it('reconnaît une mesure écrite en ppm', () => {
    const e = essaisGaz(['D. — Identification des appareils', 'Chaudière SAUNIER DUVAL Mesure CO : 0 ppm']);
    expect(e.co).toBe('realisee');
    expect(e.ppm).toBe(0);
  });

  it('lit la virgule décimale sans la perdre', () => {
    /* « 0,3 ppm » se lisait « 3 ppm » : dix fois trop. */
    const e = essaisGaz(['D. — Identification des appareils', 'Chaudière SAUNIER DUVAL Mesure CO : 0,3 ppm']);
    expect(e.ppm).toBe(0.3);
  });

  it('sait encore qu’une mesure annoncée « Non réalisée » ne l’est pas', () => {
    const e = essaisGaz(['D. — Identification des appareils', 'Cuisinière SAUTER Mesure CO : Non réalisée']);
    expect(e.co).toBe('non-realisee');
    expect(e.ppm).toBeNull();
  });
});
