import { describe, expect, it } from 'vitest';
import { analyserElectricite, pointsNonVerifies } from './securite';

/**
 * La rubrique « Points de contrôle n'ayant pu être vérifiés ».
 *
 * Le pendant électrique de la mesure de CO manquante du gaz. Fragments
 * anonymisés, calqués sur la mise en page réelle.
 */
const RUBRIQUE_6 = [
  '6. – Avertissement particulier',
  'Points de contrôle n’ayant pu être vérifiés',
  'Domaines Points de contrôle',
  '1. L’appareil général de Coupure de l’ensemble de l’installation électrique',
  'commande et de protection et Point à vérifier : Assure la coupure de l’ensemble de l’installation',
  'de son accessibilité Motifs : L’installation n’était pas alimentée en électricité le jour de la visite.',
  '2. Dispositif de protection Courant différentiel - résiduel assigné',
  'différentiel à l’origine de Point à vérifier : Déclenche, lors de l’essai de fonctionnement, pour un courant',
  'l’installation Motifs : L’installation n’était pas alimentée en électricité le jour de la visite.'
];

describe('les points que le diagnostiqueur n’a pas pu essayer', () => {
  it('les lit avec leur motif', () => {
    const points = pointsNonVerifies(RUBRIQUE_6);
    expect(points.length).toBe(2);
    expect(points[0]?.quoi).toMatch(/coupure de l’ensemble/i);
    expect(points[0]?.motif).toMatch(/pas alimentée/i);
    expect(points[1]?.quoi).toMatch(/Déclenche/);
  });

  it('s’arrête à la rubrique suivante', () => {
    const points = pointsNonVerifies([
      ...RUBRIQUE_6,
      '7. – Autre rubrique',
      'Point à vérifier : ceci ne doit pas être compté',
      'Motifs : ni ceci'
    ]);
    expect(points.length).toBe(2);
  });

  it('rend une liste vide quand la rubrique n’existe pas', () => {
    expect(pointsNonVerifies(['Etat de l’Installation Intérieure d’Electricité'])).toEqual([]);
  });
});

/**
 * Le garde-fou.
 *
 * Le différentiel est le seul organe du tableau qui protège les PERSONNES : il
 * coupe le courant quand celui-ci passe par quelqu'un. Quand son déclenchement
 * n'a pas pu être essayé, « aucune anomalie » ne veut pas dire qu'il
 * fonctionne.
 */
describe('aucune anomalie, mais le différentiel non essayé', () => {
  const diag = analyserElectricite(
    [
      'Etat de l’Installation Intérieure d’Electricité',
      'Date du repérage : 18/07/2022',
      'L’installation intérieure d’électricité ne comporte aucune anomalie.',
      ...RUBRIQUE_6
    ],
    [54, 65]
  );

  it('ne conclut pas à une installation sûre', () => {
    expect(diag.gravite).toBe('attention');
    expect(diag.verdict).toMatch(/différentiel n’a pas pu être essayé/);
    expect(diag.verdict).toMatch(/pas alimentée/);
  });

  it('compte les points non vérifiés dans la fiche', () => {
    const fait = diag.faits.find((f) => f.libelle === 'Points non vérifiés');
    expect(fait?.valeur).toBe('2');
    expect(fait?.precision).toMatch(/pas alimentée/i);
  });
});
