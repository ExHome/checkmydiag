import { describe, expect, it } from 'vitest';
import { anomaliesDetaillees } from './anomalies';

/**
 * L'anomalie électrique telle que l'ANNEXE la décrit.
 *
 * Les deux extraits ci-dessous viennent du même rapport, dossier 24/IMO/0020P,
 * lu page par page. Ils décrivent la même et unique anomalie — mais l'un est
 * lisible et l'autre non.
 *
 * Le § 5 met deux colonnes côte à côte, et l'extraction les entrelace ligne à
 * ligne. Une version qui y lisait la localisation a rendu, sur ce dossier :
 *
 *   Où : « Rez de chaussée - CONDUCTEURS Entrée/séjour/cuisine »
 *   Demande : « Faire intervenir un ÉLÉMENTS SOUS TENSION - électricien
 *   qualifié afin de remplacer les matériels PROTECTION MÉCANIQUE DES
 *   présentant des détériorations »
 *
 * Les mots en capitales viennent de la colonne de gauche. C'est du charabia qui
 * a l'air d'une information — pire que le silence qu'il remplaçait.
 *
 * L'annexe, elle, est sur une seule colonne : rien ne s'y intercale.
 */
const TABLEAU_DU_PARAGRAPHE_5 = [
  'Domaines Anomalies Photo',
  'L’Enveloppe d’au moins un matériel est manquante ou',
  '5. Matériels électriques',
  'détériorée.',
  'présentant des risques de',
  'Remarques : Présence de matériel électrique en place dont',
  'contacts directs avec des',
  'l’enveloppe présente des détériorations ; Faire intervenir un',
  'éléments sous tension -',
  'électricien qualifié afin de remplacer les matériels',
  'Protection mécanique des',
  'présentant des détériorations (Rez de chaussée -',
  'conducteurs',
  'Entrée/séjour/cuisine)',
  'Anomalies relatives aux installations particulières :'
];

const ANNEXE_PHOTOS = [
  'Annexe - Photos',
  'Photo PhEle001',
  'Libellé de l’anomalie : B7.3 a L’Enveloppe d’au moins un matériel est',
  'manquante ou détériorée.',
  'Remarques : Présence de matériel électrique en place dont l’enveloppe',
  'présente des détériorations ; Faire intervenir un électricien qualifié afin de',
  'remplacer les matériels présentant des détériorations (Rez de chaussée -',
  'Entrée/séjour/cuisine)',
  'Règles élémentaires de sécurité et d’usage à respecter (liste non exhaustive)'
];

describe('l’anomalie lue dans l’annexe', () => {
  const [a] = anomaliesDetaillees(ANNEXE_PHOTOS);

  it('reprend le libellé sans les mots de la colonne voisine', () => {
    expect(a?.libelle).toBe('L’Enveloppe d’au moins un matériel est manquante ou détériorée');
  });

  it('retient le code de la norme', () => {
    expect(a?.code).toBe('B7.3 a');
  });

  it('donne la pièce, et rien d’autre', () => {
    expect(a?.ou).toBe('Rez de chaussée - Entrée/séjour/cuisine');
    expect(a?.ou).not.toMatch(/conducteurs|protection m[ée]canique/i);
  });

  it('donne le geste dans les mots du rapport', () => {
    expect(a?.geste).toBe(
      'Faire intervenir un électricien qualifié afin de remplacer les matériels présentant des détériorations'
    );
    expect(a?.geste).not.toMatch(/[ée]l[ée]ments sous tension|protection m[ée]canique/i);
  });

  it('ne lit rien dans le tableau du § 5, dont les colonnes s’entrelacent', () => {
    // C'est la garde : ce tableau ne doit jamais servir de source, même s'il
    // contient les mêmes mots.
    expect(anomaliesDetaillees(TABLEAU_DU_PARAGRAPHE_5)).toEqual([]);
  });

  it('ne dit rien quand le rapport ne porte pas d’annexe', () => {
    expect(anomaliesDetaillees(['Etat de l’Installation Intérieure d’Electricité'])).toEqual([]);
  });
});
