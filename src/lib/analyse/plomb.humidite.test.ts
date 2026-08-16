import { describe, expect, it } from 'vitest';
import { analyserPlomb } from './plomb';

/**
 * Le plomb dégradé se concentre dans les pièces d'eau — et c'est explicable.
 *
 * Relevé dans un constat réel, le classement par pièce ne laisse aucun doute :
 * 86 % de classe 3 dans la salle d'eau, 80 % dans une salle de bain, 56 % dans
 * l'autre, quand les chambres et les paliers sont à 7 ou 12 %.
 *
 * L'humidité décolle les peintures, et une peinture qui s'écaille est
 * exactement ce qui fait passer un revêtement de la classe 1 à la classe 3.
 *
 * Fragments anonymisés, calqués sur la mise en page réelle.
 */
const enTete = [
  'Constat de risque d’exposition au plomb CREP',
  'Date du repérage : 18/07/2022',
  'Conclusion des mesures de concentration en plomb',
  'Total Non mesurées Classe 0 Classe 1 Classe 2 Classe 3',
  '208 39 130 1 2 36'
];

describe('quand le plomb dégradé se concentre dans les pièces d’eau', () => {
  const mesures = [
    'Rez de jardin - Salle de bain 01',
    'A Mur Plâtre Peinture 3',
    'B Mur Plâtre Peinture 3',
    '1er étage - Salle d’eau 01',
    'A Mur Plâtre Peinture 3',
    'Plafond Plâtre Peinture 3',
    '1er étage - Chambre 01',
    'A Mur Plâtre Papier peint 3'
  ];

  it('l’explique par l’humidité', () => {
    const d = analyserPlomb([...enTete, ...mesures], [74, 92]);
    const texte = d.explication.join(' ');
    expect(texte).toMatch(/se concentre dans les pièces d’eau/);
    expect(texte).toMatch(/l’humidité décolle les peintures/);
    expect(texte).toMatch(/ventilation|étanchéité/);
  });
});

describe('quand il est réparti ailleurs', () => {
  const mesures = [
    '1er étage - Chambre 01',
    'A Mur Plâtre Peinture 3',
    'B Mur Plâtre Peinture 3',
    '2ème étage - Chambre 03',
    'A Mur Plâtre Peinture 3',
    'Rez de chaussée - Séjour',
    'A Mur Plâtre Peinture 3'
  ];

  /*
   * Le garde-fou. L'explication ne vaut que si elle correspond au constat lu :
   * la servir sur un logement dont le plomb est dans les chambres décrirait un
   * autre logement que le sien.
   */
  it('ne sert pas une explication qui ne correspond pas', () => {
    const d = analyserPlomb([...enTete, ...mesures], [74, 92]);
    expect(d.explication.join(' ')).not.toMatch(/se concentre dans les pièces d’eau/);
  });
});
