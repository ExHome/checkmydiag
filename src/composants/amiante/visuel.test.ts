/**
 * LES VALEURS DU VISUEL — celles que le mockup montre et que le rapport n'écrit pas.
 *
 * *Le pack du 22/08/2026 impose sa forme (« exactement le même visuel »), et
 * interdit ses valeurs (« aucune donnée fictive ne doit devenir une valeur par
 * défaut »). `visuel.ts` tient les deux : il DÉRIVE ces valeurs, par des règles
 * écrites. Ce fichier tient les règles.*
 */
import { describe, expect, it } from 'vitest';
import { categoriesDe, confianceDe, niveauDeRisque } from './visuel';
import type { SyntheseAmiante } from './synthese';

const vide: SyntheseAmiante = {
  issue: 'absence',
  resultat: 'Aucun matériau contenant de l’amiante n’a été repéré.',
  gravite: 'bon',
  pointsCles: [],
  materiaux: { montrer: false, entrees: [] },
  elements: { montrer: false, entrees: [] },
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
});

describe('le niveau de risque', () => {
  it('distingue une cotation qui oblige d’une cotation qui surveille', () => {
    expect(niveauDeRisque(POSITIF)).toBe('ÉLEVÉ');
    const ep: SyntheseAmiante = {
      ...POSITIF,
      materiaux: { montrer: true, entrees: [{ quoi: 'Conduits', etat: 'Résultat EP' }] }
    };
    expect(niveauDeRisque(ep)).toBe('MODÉRÉ');
  });

  it('⚠️ ne conclut pas à la place d’un rapport qui ne conclut pas', () => {
    expect(niveauDeRisque({ ...vide, issue: 'nonConclu' })).toBe('À CONFIRMER');
    expect(niveauDeRisque({ ...vide, issue: 'illisible' })).toBe('NON ÉVALUÉ');
  });
});

/**
 * LA PART DU BIEN EXAMINÉE — le chiffre qui remplace le « 90 % » du mockup.
 *
 * *Mesuré le 22/08 sur douze volets réels : avant ce verrou, la carte affichait
 * 100 % sur onze d'entre eux, parce que le § 1.2 ne rendait aucune entrée et
 * que le dénominateur valait « examinées + 0 ». Un dénominateur amputé ne donne
 * pas un chiffre approximatif : il donne toujours 100 %.*
 */
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
