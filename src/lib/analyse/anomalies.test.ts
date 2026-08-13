import { describe, expect, it } from 'vitest';
import { domainesEnAnomalie, libellesPrecis, nonVisites, releverTout } from './anomalies';

/**
 * Extrait fidèle d'un vrai rapport d'électricité (DGLM, novembre 2023), avec
 * ses coupures de lignes d'origine : c'est justement là que les extracteurs
 * échouent, quand une phrase se poursuit sur la ligne suivante.
 */
const RAPPORT_ELEC = [
  'Etat de l’Installation Intérieure d’Electricité n° 23/IMO/0822N',
  '5. – Conclusion relative à l’évaluation des risques pouvant porter atteinte à la sécurité des personnes',
  'L\'installation intérieure d\'électricité ne comporte aucune anomalie.',
  'L\'installation intérieure d\'électricité comporte une ou des anomalies.',
  'Anomalies avérées selon les domaines suivants :',
  'L’appareil général de commande et de protection et de son accessibilité.',
  'Dispositif de protection différentiel à l\'origine de l\'installation / Prise de terre et installation de mise à la',
  'terre.',
  'Dispositif de protection contre les surintensités adapté à la section des conducteurs, sur chaque circuit.',
  'La liaison équipotentielle et installation électrique adaptées aux conditions particulières des locaux',
  'contenant une douche ou une baignoire.',
  'Matériels électriques présentant des risques de contacts directs avec des éléments sous tension -',
  'Protection mécanique des conducteurs.',
  'Domaines Anomalies Photo',
  'Libellé de l\'anomalie : B7.3 a L\'Enveloppe d\'au moins un matériel est',
  'détériorée.',
  'Libellé de l\'anomalie : B7.3 d L\'installation électrique comporte au moins',
  'une connexion avec une partie active nue accessible.',
  '6. – Avertissement particulier',
  'Points de contrôle n’ayant pu être vérifiés',
  'Domaines Points de contrôle',
  'Néant -',
  'Parties du bien (pièces et emplacements) n’ayant pu être visitées et justification :',
  '2ème étage - Combles (Absence de trappe de visite)',
  'SARL DGLM EXPERTISES |76 COURS PORTAL 33000 BORDEAUX| Tél. : 06.72.70.03.38',
  '3 / 8'
];

describe('les domaines en anomalie', () => {
  const domaines = domainesEnAnomalie(RAPPORT_ELEC);

  it('les relève tous — cinq, pas trois', () => {
    // C'est la règle du produit : si le rapport en liste cinq, on en rend cinq.
    expect(domaines).toHaveLength(5);
  });

  it('recolle une phrase coupée en fin de colonne', () => {
    // « … installation de mise à la » + « terre. » ne font qu'un domaine.
    expect(domaines[1]).toMatch(/mise à la terre$/);
    expect(domaines.some((d) => d === 'terre')).toBe(false);
  });

  it('recolle aussi la salle d’eau, coupée au même endroit', () => {
    expect(domaines[3]).toMatch(/douche ou une baignoire$/);
  });

  it('ne ramasse ni l’en-tête, ni le pied de page, ni la pagination', () => {
    for (const d of domaines) {
      expect(d).not.toMatch(/SARL|Tél|Etat de l’Installation|^\d+ \/ \d+$/);
    }
  });

  it('ne dit rien quand le rapport ne liste aucun domaine', () => {
    expect(domainesEnAnomalie(['Rapport sans anomalie', 'Néant'])).toEqual([]);
  });
});

describe('les libellés précis', () => {
  const precis = libellesPrecis(RAPPORT_ELEC);

  it('relève les deux, avec leur code de norme', () => {
    expect(precis).toHaveLength(2);
    expect(precis[0]?.code).toBe('B7.3a');
    expect(precis[1]?.code).toBe('B7.3d');
  });

  it('recolle le libellé qui déborde sur la ligne suivante', () => {
    expect(precis[0]?.libelle).toMatch(/détériorée$/);
    expect(precis[1]?.libelle).toMatch(/partie active nue accessible$/);
  });
});

describe('ce qui n’a pas pu être vu', () => {
  it('relève la pièce et la raison, séparément', () => {
    const [combles] = nonVisites(RAPPORT_ELEC);
    expect(combles?.ou).toBe('2ème étage - Combles');
    expect(combles?.libelle).toBe('Absence de trappe de visite');
    expect(combles?.genre).toBe('nonVisite');
  });

  it('ignore un « Néant »', () => {
    expect(nonVisites(['Parties du bien n’ayant pu être visitées et justification :', 'Néant'])).toEqual([]);
  });
});

describe('le relevé complet', () => {
  const tout = releverTout(RAPPORT_ELEC);

  it('restitue les cinq domaines, les deux libellés et la pièce fermée', () => {
    expect(tout).toHaveLength(8);
    expect(tout.filter((r) => r.genre === 'anomalie')).toHaveLength(7);
    expect(tout.filter((r) => r.genre === 'nonVisite')).toHaveLength(1);
  });

  it('met les anomalies devant ce qui n’a pas été contrôlé', () => {
    const dernier = tout[tout.length - 1];
    expect(dernier?.genre).toBe('nonVisite');
  });

  it('ne perd rien : chaque relevé porte un texte lisible', () => {
    for (const r of tout) {
      expect(r.libelle.length).toBeGreaterThan(8);
      expect(r.libelle).not.toMatch(/^\s|\s$/);
    }
  });
});
