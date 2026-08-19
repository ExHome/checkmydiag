/**
 * Les recommandations du DPE, telles qu'elles sortent d'un vrai rapport.
 *
 * Les lignes ci-dessous sont recopiées d'un DPE du corpus, avec son tableau
 * entrelacé : le nom du poste s'intercale au milieu de sa propre description,
 * parce que la cellule de gauche est centrée verticalement.
 */
import { describe, expect, it } from 'vitest';
import { travauxDuDpe } from './reco';

const RAPPORT = [
  'DPE Diagnostic de performance énergétique (logement) p. 5',
  'Recommandations d’amélioration de la performance',
  'Des travaux peuvent vous permettre d’améliorer significativement l’efficacité énergétique.',
  'Les travaux essentiels',
  'Montant estimé : 4600 à 6800€',
  '1',
  'Lot Description Performance recommandée',
  'Isolation des murs par l’extérieur.',
  'Si un ravalement de façade est prévu, effectuer une isolation par',
  'Mur l’extérieur avec des retours d’isolants au niveau des tableaux R > 4,5 m².K/W',
  'des baies quand cela est possible.',
  'Travaux pouvant nécessiter une autorisation d’urbanisme',
  'Les travaux à envisager',
  'Montant estimé : 18200 à 27200€',
  '2',
  'Lot Description Performance recommandée',
  'Remplacer les fenêtres par des fenêtres double vitrage à',
  'isolation renforcée. Uw = 1,3 W/m².K, Sw = 0,42',
  'Portes et fenêtres',
  'Remplacer les portes par des menuiseries plus performantes. Uw = 1,3 W/m².K',
  'Travaux pouvant nécessiter une autorisation d’urbanisme',
  'Chauffage',
  'Remplacer le système de chauffage par une pompe à chaleur',
  'air/eau double service chauffage et ECS. SCOP = 4',
  'Commentaires :',
  'Néant',
  'Évolution de la performance après travaux',
  '- 476 kWhEP/m²/an'
];

describe('ce que le DPE recommande', () => {
  const packs = travauxDuDpe(RAPPORT);

  it('rend les deux packs, dans l’ordre du rapport', () => {
    expect(packs.length).toBe(2);
    expect(packs[0]?.rang).toBe(1);
    expect(packs[0]?.intitule).toBe('Les travaux essentiels');
    expect(packs[1]?.rang).toBe(2);
  });

  it('cite le montant tel qu’il est écrit, sans jamais l’additionner', () => {
    expect(packs[0]?.cout).toEqual({ de: 4600, a: 6800, statut: 'RAPPORT' });
    expect(packs[1]?.cout).toEqual({ de: 18200, a: 27200, statut: 'RAPPORT' });
    /* L'ODM RECO l'interdit formellement : « ne jamais additionner
       mécaniquement des gains de travaux indépendants ». Aucun total n'existe
       donc dans ce qui sort d'ici. */
    expect(Object.keys(packs[0] ?? {})).not.toContain('total');
  });

  it('retrouve le poste malgré la cellule entrelacée', () => {
    /* « Mur » apparaît au milieu de sa propre description : la cellule de
       gauche est centrée verticalement, et le PDF la sort à cette hauteur. */
    const mur = packs[0]?.recommandations[0];
    expect(mur?.lot).toMatch(/^Mur/i);
    expect(mur?.description).toMatch(/isolation des murs par l’extérieur/i);
  });

  it('sépare la performance visée de la description', () => {
    expect(packs[0]?.recommandations[0]?.performance).toBe('R > 4,5 m².K/W');
    expect(packs[0]?.recommandations[0]?.description).not.toMatch(/R > 4,5/);
  });

  it('lit les deux postes du second pack', () => {
    const lots = packs[1]?.recommandations.map((r) => r.lot) ?? [];
    expect(lots).toContain('Portes et fenêtres');
    expect(lots).toContain('Chauffage');
  });

  it('marque tout ce qui sort comme venant du rapport', () => {
    for (const p of packs) {
      for (const r of p.recommandations) expect(r.statut).toBe('RAPPORT');
    }
  });

  /*
   * Le piège que le moteur évitait en renonçant à toute cette page.
   *
   * « - 476 kWhEP/m²/an » est un GAIN après travaux, écrit dans le même format
   * qu'une consommation. Il décrit un logement qui n'existe pas encore. La
   * rubrique s'arrête donc avant.
   */
  it('s’arrête avant les chiffres du logement qui n’existe pas encore', () => {
    const tout = JSON.stringify(packs);
    expect(tout).not.toMatch(/476/);
    expect(tout).not.toMatch(/Évolution de la performance/);
  });

  it('ne prend pas les mentions de pied de tableau pour des travaux', () => {
    const tout = JSON.stringify(packs);
    expect(tout).not.toMatch(/autorisation d’urbanisme/);
    expect(tout).not.toMatch(/Commentaires/);
  });

  it('ne dit rien d’un DPE sans recommandations', () => {
    expect(travauxDuDpe(['Diagnostic de performance', 'Etabli le : 05/07/2024'])).toEqual([]);
  });
});

/**
 * Le montant appartient au pack, pas à la description.
 *
 * Il est lu par `coutDe` et rendu à part. Ramassé une seconde fois dans le
 * texte, il s'affichait au milieu d'une phrase — « Montant estimé : 4600 à
 * 6800€ Isolation des combles perdus… » — et le lecteur voyait la somme deux
 * fois, dont une là où elle n'a pas de sens.
 */
describe('le montant ne se lit qu’une fois', () => {
  it('ne le laisse pas ouvrir la description', () => {
    const packs = travauxDuDpe(RAPPORT);
    for (const p of packs) {
      for (const r of p.recommandations) {
        expect(r.description).not.toMatch(/Montant estim/i);
      }
    }
    /* Il reste bien lu, à sa place. */
    expect(packs[0]?.cout?.de).toBe(4600);
  });
});

/**
 * Deux packs, jamais plus — et jamais deux fois le même rang.
 *
 * L'affichage boucle sur le rang du pack. Un titre qui reparaît ailleurs dans
 * la page produirait deux packs de rang 1, donc une clé dupliquée, donc un
 * écran blanc à la place de la fiche. La garantie se tient ici, à la source.
 */
describe('un seul pack par rang', () => {
  it('ignore un titre qui reparaît plus bas', () => {
    const avecEcho = [
      'Recommandations d’amélioration de la performance',
      'Les travaux essentiels',
      'Montant estimé : 4600 à 6800€',
      'Toiture/plafond',
      'Isolation des combles perdus.',
      /* Le même titre, rappelé plus bas — un renvoi, pas un second pack. */
      'Les travaux essentiels',
      'Montant estimé : 9900 à 12000€',
      'Chauffage',
      'Remplacer la chaudière.'
    ];
    const packs = travauxDuDpe(avecEcho);
    expect(packs.filter((p) => p.rang === 1).length).toBe(1);
    /* C'est la première qui vaut : celle du tableau, avec son montant. */
    expect(packs[0]?.cout?.de).toBe(4600);
  });
});
