/**
 * LES TROIS ÉTATS SE LISENT, ILS NE SE DEVINENT PAS — ET LES DEUX GRAVES
 * DISENT OÙ.
 *
 * Deux règles commandent ce fichier, et ce sont deux ordres d'Aude :
 *
 *   · quand aucune des trois formes de la norme n'est reconnue, on ne marque
 *     aucun état. Marquer « absence » par défaut transformerait un silence en
 *     bonne nouvelle ;
 *
 *   · « tu mets le résultat ET la localisation si présence d'indice ou
 *     présence d'infestation ». Une conclusion grave sans lieu est une alerte
 *     qu'on ne peut pas suivre : ni chiffrer, ni discuter, ni aller regarder.
 */
import { describe, expect, it } from 'vitest';
import {
  ETATS_TERMITES,
  etatLuDansLeRapport,
  laReserveDe,
  ouEstCeGrave,
  resultatEtLocalisation
} from './etatsTermites';
import type { Diagnostic } from './modele';

const diag = (verdict?: string, zones?: { nom: string; etat: string }[]): Diagnostic =>
  ({
    type: 'termites',
    titre: 'Termites',
    gravite: 'neutre',
    pages: [6, 6],
    verdict,
    ...(zones ? { schema: { genre: 'pieces', zones } } : {})
  }) as unknown as Diagnostic;

describe('les trois états de la norme', () => {
  it('sont trois, dans l’ordre de gravité', () => {
    expect(ETATS_TERMITES.map((e) => e.cle)).toEqual(['absence', 'indices', 'infestation']);
    expect(ETATS_TERMITES.map((e) => e.rang)).toEqual([1, 2, 3]);
  });

  it('gardent les mots de la norme', () => {
    expect(ETATS_TERMITES[0]?.nom).toBe('Absence d’indice d’infestation');
    expect(ETATS_TERMITES[1]?.nom).toBe('Présence d’indices d’infestation');
    expect(ETATS_TERMITES[2]?.nom).toBe('Présence de termites');
  });
});

describe('reconnaître l’état d’un rapport', () => {
  it('lit l’absence d’indice', () => {
    expect(etatLuDansLeRapport(diag('Aucun indice d’infestation de termites n’a été relevé.'))).toBe(
      'absence'
    );
    expect(
      etatLuDansLeRapport(diag('Il n’a pas été repéré d’indice d’infestation de termites.'))
    ).toBe('absence');
  });

  it('lit la présence d’indices', () => {
    expect(
      etatLuDansLeRapport(diag('Des indices d’infestation de termites ont été relevés dans 1 zone.'))
    ).toBe('indices');
  });

  it('lit la présence de termites', () => {
    expect(etatLuDansLeRapport(diag('Présence de termites vivants constatée dans la cave.'))).toBe(
      'infestation'
    );
  });

  /**
   * Le piège : un rapport grave nomme souvent les deux. « Présence de termites
   * et d'indices d'infestation » doit se lire comme le troisième état, pas le
   * deuxième — sinon on annonce moins grave que la réalité.
   */
  it('le plus grave l’emporte quand les deux sont nommés', () => {
    expect(
      etatLuDansLeRapport(diag('Présence de termites et d’indices d’infestation dans la cave.'))
    ).toBe('infestation');
  });

  it('ne marque rien quand la forme n’est pas reconnue', () => {
    expect(etatLuDansLeRapport(diag('Le bien est situé en zone contaminée.'))).toBeNull();
    expect(etatLuDansLeRapport(diag())).toBeNull();
  });
});

describe('le résultat vient avec son endroit', () => {
  const AVEC_ZONES = [
    { nom: 'Séjour', etat: 'bon' },
    { nom: 'Cave', etat: 'alerte' },
    { nom: 'Garage', etat: 'alerte' }
  ];

  it('ne retient que les zones où le rapport signale quelque chose', () => {
    expect(ouEstCeGrave(diag('peu importe', AVEC_ZONES))).toEqual(['Cave', 'Garage']);
  });

  it('nettoie les tirets que la mise en page laisse traîner', () => {
    expect(ouEstCeGrave(diag('x', [{ nom: 'Cave —', etat: 'alerte' }]))).toEqual(['Cave']);
  });

  it('donne le résultat et le lieu pour une présence d’indices', () => {
    const r = resultatEtLocalisation(
      diag('Des indices d’infestation ont été relevés dans 2 zones.', AVEC_ZONES)
    );
    expect(r.etat).toBe('indices');
    expect(r.phrase).toBe('Des indices ont été relevés : Cave et Garage.');
  });

  it('donne le résultat et le lieu pour une infestation', () => {
    const r = resultatEtLocalisation(
      diag('Présence de termites vivants constatée.', [{ nom: 'Cave', etat: 'alerte' }])
    );
    expect(r.etat).toBe('infestation');
    expect(r.phrase).toBe('Des termites ont été constatés : Cave.');
  });

  /**
   * Le cas qui compte le plus : le rapport conclut à une présence sans nommer
   * d'endroit. On ne comble pas le trou — on dit qu'il existe, parce qu'il
   * empêche l'acquéreur d'agir.
   */
  it('signale le manque quand une présence n’est pas localisée', () => {
    const r = resultatEtLocalisation(diag('Présence de termites vivants constatée.'));
    expect(r.ou).toEqual([]);
    expect(r.phrase).toMatch(/le rapport ne dit pas où/);
    expect(r.phrase).toMatch(/demandez la localisation/);
  });

  /** Une absence d'indice ne se localise pas : elle couvre tout ce qui a été vu. */
  it('ne réclame pas de lieu pour une absence d’indice', () => {
    const r = resultatEtLocalisation(diag('Aucun indice d’infestation n’a été relevé.', AVEC_ZONES));
    expect(r.etat).toBe('absence');
    expect(r.phrase).toBe('');
  });
});

describe('la réserve dit ce que le rapport ne dit pas', () => {
  it('« absence d’indice » ne veut pas dire « pas de termites »', () => {
    expect(laReserveDe('absence')).toMatch(/ne garantit pas/);
    expect(laReserveDe('absence')).toMatch(/parties accessibles/);
  });

  it('la présence de termites rappelle la déclaration en mairie', () => {
    expect(laReserveDe('infestation')).toMatch(/mairie/);
  });

  it('un état non reconnu renvoie au document', () => {
    expect(laReserveDe(null)).toMatch(/Ouvrez-la dans le document/);
  });
});
