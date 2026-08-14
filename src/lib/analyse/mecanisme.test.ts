import { describe, expect, it } from 'vitest';
import { LEGENDE, TITRE, mecanismeDe, type Mecanisme } from './mecanisme';

/**
 * Les libellés d'anomalie tels qu'un vrai rapport les imprime — repris mot pour
 * mot d'un dossier DGLM. Ce sont des phrases de norme, et c'est bien le
 * problème : personne ne voit ce qu'elles décrivent.
 */
describe('le mécanisme derrière une anomalie', () => {
  it('reconnaît le contact direct au libellé, pas à la rubrique', () => {
    // B7 est la rubrique « matériels vétustes ou inadaptés » : classée par son
    // code, cette anomalie recevrait le dessin d'un boîtier cassé. Or elle
    // décrit une pièce sous tension qu'on peut toucher.
    expect(
      mecanismeDe(
        'electricite',
        'L’installation électrique comporte au moins une connexion avec une partie active nue accessible.',
        'B7.3d'
      )
    ).toBe('contactDirect');
  });

  it('reconnaît l’enveloppe détériorée', () => {
    expect(
      mecanismeDe('electricite', 'L’Enveloppe d’au moins un matériel est détériorée.', 'B7.3a')
    ).toBe('enveloppe');
  });

  it('rattache les domaines du rapport à leur mécanisme', () => {
    const cas: [string, Mecanisme][] = [
      ['L’appareil général de commande et de protection et de son accessibilité.', 'coupure'],
      [
        'Dispositif de protection différentiel à l’origine de l’installation / Prise de terre et installation de mise à la terre.',
        'differentiel'
      ],
      [
        'Dispositif de protection contre les surintensités adapté à la section des conducteurs, sur chaque circuit.',
        'surintensite'
      ],
      [
        'La liaison équipotentielle et installation électrique adaptées aux conditions particulières des locaux contenant une douche ou une baignoire.',
        'salleDeau'
      ]
    ];

    for (const [libelle, attendu] of cas) {
      expect(mecanismeDe('electricite', libelle)).toBe(attendu);
    }
  });

  it('retombe sur le code quand le libellé ne dit rien de reconnaissable', () => {
    // Beaucoup de rapports impriment le code sans la phrase, ou l'inverse.
    expect(mecanismeDe('electricite', 'Point de contrôle non conforme.', 'B1.1')).toBe('coupure');
    expect(mecanismeDe('electricite', 'Point de contrôle non conforme.', 'B 4.2')).toBe(
      'surintensite'
    );
  });

  it('distingue les trois dangers du gaz', () => {
    expect(mecanismeDe('gaz', 'Ventilation insuffisante du local.')).toBe('ventilation');
    expect(mecanismeDe('gaz', 'Conduit d’évacuation des produits de combustion obstrué.')).toBe(
      'combustion'
    );
    expect(mecanismeDe('gaz', 'Tuyau flexible de raccordement périmé.')).toBe('tuyauterie');
  });

  it('sait quoi montrer sans code ni mot connu, d’après le diagnostic', () => {
    expect(mecanismeDe('plomb', 'Unité de diagnostic classée 3.')).toBe('degradation');
    expect(mecanismeDe('amiante', 'Matériau de la liste A repéré.')).toBe('degradation');
    expect(mecanismeDe('termites', 'Constatation en partie basse.')).toBe('indices');
  });

  /**
   * Le dernier recours n'invente rien : « general » n'a pas de dessin, et c'est
   * volontaire. Un schéma décoratif ferait croire à un constat.
   */
  it('avoue quand il ne sait pas', () => {
    expect(mecanismeDe('erp', 'Le bien est concerné par un zonage.')).toBe('general');
  });

  it('donne un titre et une légende à chaque mécanisme dessiné', () => {
    // Sans quoi un dessin s'afficherait sous un intitulé vide.
    for (const cle of Object.keys(TITRE) as Mecanisme[]) {
      expect(TITRE[cle].length).toBeGreaterThan(3);
      expect(LEGENDE[cle].length).toBeGreaterThan(20);
    }
  });
});
