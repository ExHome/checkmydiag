import { describe, expect, it } from 'vitest';
import {
  domainesConstates,
  domainesEnAnomalie,
  domainesEnumeres,
  estCatalogueDomaines,
  libellesPrecis,
  nonVisites,
  releverTout
} from './anomalies';

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

/**
 * Le même bloc, pris dans un rapport qui ne relève AUCUNE anomalie (DGLM,
 * janvier 2023) — sa page de synthèse écrit « L'installation intérieure
 * d'électricité ne comporte aucune anomalie ».
 *
 * Les libellés sont mot pour mot ceux du rapport précédent, qui en avait deux.
 * C'est la preuve que cette liste est le catalogue de l'arrêté du 28 septembre
 * 2017, pas un constat : mesuré sur le corpus, six domaines identiques dans
 * 100 % des volets, avec ou sans anomalie.
 */
const RAPPORT_ELEC_SANS_ANOMALIE = [
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
  'Matériels électriques vétustes, inadaptés à l\'usage.',
  'Anomalies relatives aux installations particulières :',
  'Appareils d\'utilisation situés dans des parties communes et alimentés depuis la partie privative ou',
  'inversement.',
  'Piscine privée, ou bassin de fontaine',
  '6. – Avertissement particulier'
];

describe('le catalogue des domaines, qui n’est pas un constat', () => {
  it('reconnaît la liste imprimée d’un rapport sans la moindre anomalie', () => {
    expect(estCatalogueDomaines(domainesEnumeres(RAPPORT_ELEC_SANS_ANOMALIE))).toBe(true);
  });

  it('ne relève donc AUCUNE anomalie sur ce rapport', () => {
    // La régression à ne jamais refaire : quatorze logements sur trente et un
    // se voyaient annoncer un défaut électrique qu'ils n'avaient pas.
    expect(domainesEnAnomalie(RAPPORT_ELEC_SANS_ANOMALIE)).toEqual([]);
    expect(releverTout(RAPPORT_ELEC_SANS_ANOMALIE).filter((r) => r.genre === 'anomalie')).toEqual([]);
  });

  it('laisse passer une liste courte, qui elle constate vraiment', () => {
    const constat = [
      'Anomalies avérées selon les domaines suivants :',
      'L’appareil général de commande et de protection et de son accessibilité.',
      'Prise de terre et installation de mise à la terre.',
      '6. – Avertissement particulier'
    ];
    expect(estCatalogueDomaines(domainesEnumeres(constat))).toBe(false);
    expect(domainesEnAnomalie(constat)).toHaveLength(2);
  });
});

describe('les domaines énumérés', () => {
  const domaines = domainesEnumeres(RAPPORT_ELEC);

  it('les relève tous — cinq, pas trois', () => {
    // C'est la règle de lecture : si le rapport en liste cinq, on en rend cinq.
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
    expect(domainesEnumeres(['Rapport sans anomalie', 'Néant'])).toEqual([]);
  });
});

/**
 * La seconde forme, lue dans un rapport de 2024 : sous le catalogue vient un
 * tableau où seuls les domaines CONSTATÉS figurent — et eux sont numérotés.
 * Les deux colonnes du tableau s'entrelacent à l'extraction ; le numéro, lui,
 * reste en tête de ligne. C'est par là qu'on lit ce que le rapport constate.
 */
const TABLEAU_2024 = [
  'Anomalies avérées selon les domaines suivants :',
  'L’appareil général de commande et de protection et de son accessibilité.',
  'Dispositif de protection différentiel à l’origine de l’installation / Prise de terre et installation de mise à la terre.',
  'Dispositif de protection contre les surintensités adapté à la section des conducteurs, sur chaque circuit.',
  'La liaison équipotentielle et installation électrique adaptées aux conditions particulières des locaux contenant une douche ou une baignoire.',
  'Matériels électriques présentant des risques de contacts directs avec des éléments sous tension.',
  'Matériels électriques vétustes, inadaptés à l’usage.',
  'Domaines Anomalies Photo',
  '1. L’appareil général de Le dispositif assurant la coupure d’urgence n’est pas à coupure',
  'commande et de omnipolaire et simultanée.',
  'protection et de son Remarques : L’AGCP n’assure pas une coupure simultanée',
  'accessibilité',
  '2. Dispositif de protection Au moins un socle de prise de courant comporte une broche de',
  'différentiel à l’origine de terre non reliée à la terre. (Cette anomalie fait l’objet d’une',
  'l’installation - Installation mesure compensatoire pour limiter le risque de choc',
  'de mise à la terre électrique)',
  '4. La liaison Locaux contenant une baignoire ou une douche : la continuité',
  'équipotentielle et électrique de la liaison équipotentielle supplémentaire',
  '6. Matériels électriques L’installation comporte au moins un matériel électrique',
  'vétustes, inadaptés à inadapté à l’usage.',
  '6. – Avertissement particulier',
  'Points de contrôle n’ayant pu être vérifiés'
];

describe('les domaines constatés, dans le tableau des anomalies', () => {
  const constates = domainesConstates(TABLEAU_2024);

  it('relève ceux que le tableau numérote, pas les six du catalogue', () => {
    // Le catalogue au-dessus en énumère six et ne dit rien ; le tableau, lui,
    // constate — ici quatre domaines sur six.
    expect(constates.map((d) => d.numero)).toEqual([1, 2, 4, 6]);
  });

  it('les nomme en français courant', () => {
    expect(constates[0]?.nom).toBe('Coupure d’urgence');
    expect(constates[2]?.nom).toBe('Salle d’eau');
  });

  it('ne prend pas un titre de section pour un constat', () => {
    // « 6. – Avertissement particulier » porte un numéro et n'est pas une
    // anomalie : c'est le nom du domaine, pas le chiffre, qui décide.
    expect(constates.every((d) => d.nom.length > 0)).toBe(true);
  });

  it('ne constate rien sur un rapport qui n’a que le catalogue', () => {
    expect(domainesConstates(RAPPORT_ELEC_SANS_ANOMALIE)).toEqual([]);
  });

  it('ne confond pas le tableau qui DÉCRIT avec celui qui CONSTATE', () => {
    // Vu sur deux rapports sans la moindre anomalie : le même tableau, la même
    // numérotation, mais une colonne de droite qui dit où se trouve l'organe
    // au lieu de dire ce qui cloche. Son en-tête ne parle pas d'anomalies.
    expect(
      domainesConstates([
        'Domaines Informations complémentaires',
        "1. L'appareil général de Coupure de l'ensemble de l'installation électrique",
        '2. Dispositif de protection Emplacement',
        '3. Dispositif de protection Emplacement'
      ])
    ).toEqual([]);
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
