/**
 * LES VALEURS DU VISUEL — celles que le mockup montre et que le rapport n'écrit pas.
 *
 * *Le pack du 22/08/2026 impose sa forme (« exactement le même visuel »), et
 * interdit ses valeurs (« aucune donnée fictive ne doit devenir une valeur par
 * défaut »). `visuel.ts` tient les deux : il DÉRIVE ces valeurs, par des règles
 * écrites. Ce fichier tient les règles.*
 */
import { describe, expect, it } from 'vitest';
import { categoriesDe, confianceDe, suiteReglementaire } from './visuel';
import type { SyntheseAmiante } from './synthese';

const vide: SyntheseAmiante = {
  issue: 'absence',
  resultat: 'Aucun matériau contenant de l’amiante n’a été repéré.',
  gravite: 'bon',
  pointsCles: [],
  materiaux: { montrer: false, entrees: [] },
  elements: { montrer: false, entrees: [] },
  composants: [],
  constatations: { montrer: false, entrees: [] },
  nonControle: { montrer: false, entrees: [] },
  completude: [],
  conseil: [],
  pages: [1, 10]
};

/** Le DTA de copropriété du banc : flocages en Score 3, conduits en EP. */
const POSITIF: SyntheseAmiante = {
  ...vide,
  issue: 'presence',
  gravite: 'alerte',
  materiaux: {
    montrer: true,
    entrees: [
      {
        quoi: 'Flocages',
        ou: 'Sous-Sol - Parties Communes / Caves',
        etat: 'Matériau en décollement · Score 3',
        suite: 'Il faut faire réaliser des travaux de retrait ou de confinement des flocages.'
      },
      {
        quoi: 'Conduits',
        ou: 'Rez de chaussée / Extérieur - Local 2',
        etat: 'Matériau non dégradé · Résultat EP'
      }
    ]
  },
  elements: {
    montrer: true,
    entrees: [
      { quoi: 'Rez de chaussée - Séjour', statut: 'Visitée', ton: 'neutre' },
      { quoi: 'Rez de chaussée - Cuisine', statut: 'Visitée', ton: 'neutre' }
    ]
  }
};

describe('les éléments contrôlés du visuel', () => {
  it('⚠️ ne coche jamais « contrôlée » une catégorie où l’amiante a été repérée', () => {
    const cats = categoriesDe(POSITIF).map((c) => c.nom);
    /* Les conduits sont amiantés : ils appartiennent au bloc des matériaux
       repérés, jamais à celui de ce qui a été contrôlé et écarté. */
    expect(cats).not.toContain('Conduits / Gaines');
  });

  it('n’invente aucune catégorie quand le rapport ne nomme rien', () => {
    expect(categoriesDe(vide)).toEqual([]);
  });

  it('⚠️ range TOUS les composants réellement lus au § 3.2.6, sans en perdre', () => {
    /*
     * LA MESURE QUI A FAIT AJOUTER DEUX FAMILLES.
     *
     * Le 22/08, sur les volets extraits du corpus : 41 composants lus, dont 23
     * — 56 % — ne tombaient dans aucune des cinq familles du visuel. Ils
     * disparaissaient de l'écran alors que le rapport les avait contrôlés.
     *
     * La liste ci-dessous est celle des composants réellement rencontrés, avec
     * l'orthographe des rapports. Aucun ne doit rester orphelin : un composant
     * sans famille est un ouvrage contrôlé que l'acquéreur ne verra jamais.
     */
    const LUS = [
      'Sol',
      'Plinthes',
      'Mur',
      'Porte',
      'Plafond',
      'Fenêtre',
      'Volet',
      'Marches',
      'Contremarches',
      'Balustre',
      'Main courante',
      'Dressing Porte',
      'Porte de garage'
    ];
    const orphelins = LUS.filter((c) => categoriesDe({ ...vide, composants: [c] }).length === 0);
    expect(orphelins).toEqual([]);
  });

  it('donne à chaque famille un pictogramme qui lui est propre', () => {
    /* Sept familles, sept dessins : deux lignes qui partageraient une icône se
       liraient comme une seule. Le repli « piece » n'en fait pas partie — il
       n'est pas une famille, il dit qu'on n'en a pas reconnu. */
    const familles = categoriesDe({
      ...vide,
      composants: ['Toiture', 'Façade', 'Plafond', 'Conduit', 'Sol', 'Fenêtre', 'Marches']
    });
    const icones = familles.map((c) => c.icone);
    expect(new Set(icones).size).toBe(icones.length);
    expect(icones).not.toContain('piece');
  });
});

describe('la suite que le droit attache au constat', () => {
  it('⚠️ ne gradue rien : il porte la cotation du rapport et ce qu’elle impose', () => {
    /* L'échelle « très faible / modéré / élevé » a été retirée le 22/08 :
       aucun texte amiante ne la définit. L'arrêté du 12 décembre 2012, lui,
       cote — et attache à chaque cote une obligation datée. */
    const s = suiteReglementaire(POSITIF);
    expect(s.mot).toBe('Score 3');
    expect(s.impose).toMatch(/retrait ou de confinement/);
  });

  it('distingue une cotation qui oblige d’une cotation qui surveille', () => {
    const ep: SyntheseAmiante = {
      ...POSITIF,
      materiaux: { montrer: true, entrees: [{ quoi: 'Conduits', etat: 'Résultat EP' }] }
    };
    const s = suiteReglementaire(ep);
    expect(s.mot).toBe('EP');
    expect(s.impose).toMatch(/[ÉE]valuation périodique/);
  });

  it('prend la cotation la plus contraignante quand le volet en porte plusieurs', () => {
    const melange: SyntheseAmiante = {
      ...POSITIF,
      materiaux: {
        montrer: true,
        entrees: [
          { quoi: 'Conduits', etat: 'Résultat EP' },
          { quoi: 'Flocages', etat: 'Score 3' }
        ]
      }
    };
    expect(suiteReglementaire(melange).mot).toBe('Score 3');
  });

  it('⚠️ ne conclut pas à la place d’un rapport qui ne conclut pas', () => {
    expect(suiteReglementaire({ ...vide, issue: 'nonConclu' }).mot).toBe('Conclusion en attente');
    expect(suiteReglementaire({ ...vide, issue: 'illisible' }).mot).toBe('Non évalué');
    expect(suiteReglementaire(vide).mot).toBe('Aucun matériau repéré');
  });

  it('⚠️ ne fabrique pas de cotation quand le rapport n’en porte pas', () => {
    const sansCote: SyntheseAmiante = {
      ...POSITIF,
      materiaux: { montrer: true, entrees: [{ quoi: 'Dalles de sol' }] }
    };
    const s = suiteReglementaire(sansCote);
    expect(s.mot).toBe('Amiante repérée');
    expect(s.impose).toBeUndefined();
  });
});

const troisPieces = {
  montrer: true,
  entrees: [
    { quoi: 'RDC - Entrée', statut: 'Visitée', ton: 'neutre' as const },
    { quoi: 'RDC - Séjour', statut: 'Visitée', ton: 'neutre' as const },
    { quoi: 'R+1 - Chambre', statut: 'Visitée', ton: 'neutre' as const }
  ]
};

describe('la part du bien examinée', () => {
  it('⚠️ ne calcule RIEN quand la rubrique des non-visités n’a pas été lue', () => {
    const c = confianceDe({
      ...vide,
      elements: troisPieces,
      nonControle: { montrer: true, entrees: [], lue: false, mention: 'pas lue' }
    });
    expect(c.part).toBeNull();
    expect(c.dit).toMatch(/n’a pas pu être lue/);
  });

  it('donne 100 % seulement quand le rapport DIT qu’aucun local n’est resté fermé', () => {
    const c = confianceDe({
      ...vide,
      elements: troisPieces,
      nonControle: { montrer: true, entrees: [], lue: true, mention: 'Néant' }
    });
    expect(c.part).toBe(100);
  });

  it('descend sous 100 % dès qu’un local est resté fermé', () => {
    const c = confianceDe({
      ...vide,
      elements: troisPieces,
      nonControle: { montrer: true, entrees: [{ quoi: 'Combles' }], lue: true }
    });
    expect(c.part).toBe(75);
    expect(c.dit).toContain('3 pièces examinées sur 4');
  });
});
