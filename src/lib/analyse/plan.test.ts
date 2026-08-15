import { describe, expect, it } from 'vitest';
import { planMuet, zonesDe } from './plan';
import type { Diagnostic } from '../modele';

function diag(partiel: Partial<Diagnostic>): Diagnostic {
  return {
    type: 'dpe',
    titre: 'Diagnostic',
    verdict: 'Verdict',
    gravite: 'neutre',
    faits: [],
    explication: [],
    aFaire: [],
    schema: null,
    pages: [3, 7],
    ...partiel
  } as Diagnostic;
}

describe('le plan du DPE', () => {
  const d = diag({
    type: 'dpe',
    schema: {
      genre: 'dpe',
      energie: null,
      climat: null,
      finale: 'F',
      postes: [],
      isolation: { murs: 'nonIsole', toit: 'isole', plancher: 'inconnu', fenetres: 'nonIsole' }
    }
  });

  it('place les quatre parois', () => {
    expect(zonesDe(d).map((z) => z.nom).sort()).toEqual(
      ['Fenêtres', 'Murs', 'Plancher bas', 'Toiture'].sort()
    );
  });

  /*
   * Le point qui compte : une paroi dont le rapport ne dit rien ne doit pas
   * passer pour une paroi contrôlée. Elle reste neutre, et sa phrase dit que
   * c'est la lecture qui manque, pas l'isolation.
   */
  it('ne transforme pas un silence en constat', () => {
    const plancher = zonesDe(d).find((z) => z.nom === 'Plancher bas');
    expect(plancher?.etat).toBe('neutre');
    expect(plancher?.dit).toMatch(/ne dit rien|n’a pas pu être lue/);
    expect(plancher?.dit).not.toMatch(/isolé|conforme|aucune anomalie/i);
  });

  it('distingue isolé et non isolé', () => {
    const zones = zonesDe(d);
    expect(zones.find((z) => z.nom === 'Toiture')?.etat).toBe('bon');
    expect(zones.find((z) => z.nom === 'Murs')?.etat).toBe('attention');
  });
});

describe('le plan du plomb', () => {
  const d = diag({
    type: 'plomb',
    schema: {
      genre: 'plomb',
      classes: [4, 1, 0, 2],
      nonMesurees: 0,
      total: 7,
      emplacements: [
        { zone: 'Salle de bain', element: 'Bâti de porte', classe: 3 },
        { zone: 'Salle de bain', element: 'Plinthe', classe: 1 },
        { zone: 'Chambre 1', element: 'Fenêtre', classe: 1 }
      ]
    }
  });

  it('regroupe par pièce et garde la classe la plus élevée', () => {
    const sdb = zonesDe(d).find((z) => z.nom === 'Salle de bain');
    expect(sdb?.etat).toBe('alerte');
    expect(sdb?.dit).toMatch(/Classe 3/);
    expect(sdb?.dit).toMatch(/Bâti de porte/);
    expect(sdb?.dit).toMatch(/Plinthe/);
  });

  it('ne dessine que les emplacements mesurés', () => {
    expect(zonesDe(d)).toHaveLength(2);
  });

  it('classe ce qui alerte avant ce qui va bien', () => {
    expect(zonesDe(d)[0]?.etat).toBe('alerte');
  });
});

describe('le plan des anomalies', () => {
  const d = diag({
    type: 'electricite',
    schema: {
      genre: 'anomalies',
      groupes: [
        { nom: 'Appareil général de commande', nombre: 1 },
        { nom: 'Liaison équipotentielle', nombre: 3 }
      ],
      total: 4
    }
  });

  it('accorde le nombre', () => {
    const zones = zonesDe(d);
    expect(zones.find((z) => z.nom.startsWith('Appareil'))?.dit).toMatch(/une anomalie/);
    expect(zones.find((z) => z.nom.startsWith('Liaison'))?.dit).toMatch(/3 anomalies/);
  });

  /*
   * Le garde-fou : on ne complète jamais la liste avec les domaines que le
   * rapport ne cite pas. Un domaine absent n'est pas un domaine conforme, et
   * l'afficher en vert affirmerait une conformité que personne n'a écrite.
   */
  it('n’ajoute aucun domaine que le rapport ne cite pas', () => {
    expect(zonesDe(d)).toHaveLength(2);
    expect(zonesDe(d).every((z) => z.etat !== 'bon')).toBe(true);
  });
});

describe('le plan des zones contrôlées', () => {
  it('reprend les pièces du rapport, avec leur état', () => {
    const d = diag({
      type: 'amiante',
      schema: {
        genre: 'pieces',
        zones: [
          { nom: 'Toiture', etat: 'alerte', detail: 'Plaques en fibres-ciment.' },
          { nom: 'Cave', etat: 'neutre' }
        ]
      }
    });

    const zones = zonesDe(d);
    expect(zones[0]?.nom).toBe('Toiture');
    expect(zones[0]?.dit).toBe('Plaques en fibres-ciment.');
    expect(zones[1]?.dit).toMatch(/sans autre précision/);
  });
});

describe('le repli sur les relevés', () => {
  it('dit qu’une zone n’a pas été visitée plutôt que de la taire', () => {
    const d = diag({
      type: 'termites',
      releves: [
        { libelle: 'Vide sanitaire inaccessible', ou: 'Sous-sol', genre: 'nonVisite' },
        { libelle: 'Aucun indice relevé', ou: 'Charpente', genre: 'complement' }
      ]
    });

    const zones = zonesDe(d);
    const sousSol = zones.find((z) => z.nom === 'Sous-sol');
    expect(sousSol?.etat).toBe('neutre');
    expect(sousSol?.dit).toMatch(/non visitée/);
  });
});

describe('quand il n’y a rien à placer', () => {
  it('renvoie un plan vide plutôt qu’un plan inventé', () => {
    expect(zonesDe(diag({}))).toEqual([]);
  });

  it('renvoie le lecteur au rapport, page comprise', () => {
    expect(planMuet(diag({ pages: [3, 7] }))).toMatch(/pages 3 à 7/);
    expect(planMuet(diag({ pages: [5, 5] }))).toMatch(/page 5/);
  });
});
