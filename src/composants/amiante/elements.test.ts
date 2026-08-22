/**
 * LE BLOC « ÉLÉMENTS CONTRÔLÉS » — ce qu'il a le droit d'afficher.
 *
 * *Le visuel du pack du 22/08/2026 en fait sa quatrième carte, et y coche cinq
 * composants — Toiture, Façades, Revêtements intérieurs, Conduits, Sols — tous
 * « Contrôlés ✓ ». Le README du pack tranche pourtant lui-même : « les données
 * affichées dans le mockup sont des exemples visuels et ne doivent jamais être
 * utilisées comme données métier par défaut ».*
 *
 * Ces tests tiennent les deux bouts : **la carte existe** (l'architecture du
 * visuel est une contrainte absolue) et **elle ne contient que du réel** — les
 * pièces que le rapport dit avoir visitées, au § 3.2.6.
 */
import { describe, expect, it } from 'vitest';
import type { Diagnostic } from '../../lib/modele';
import { syntheseAmiante } from './synthese';

const socle = {
  type: 'amiante' as const,
  titre: 'Amiante',
  explication: [],
  aFaire: [],
  schema: null,
  faits: [],
  gravite: 'bon' as const,
  pages: [4, 17] as [number, number]
};

/** Un constat négatif dont le § 3.2.6 est renseigné. Volet DAPP réel. */
const AVEC_PERIMETRE = {
  ...socle,
  verdict: 'Aucun matériau contenant de l’amiante n’a été repéré dans les parties accessibles.',
  perimetre: {
    lue: true,
    pieces: ['Rez de chaussée - Entrée', 'Rez de chaussée - Séjour', '1er étage - Combles 1']
  }
} as unknown as Diagnostic;

/** Le même constat, mais le § 3.2.6 n'a pas pu être lu. */
const SANS_PERIMETRE = {
  ...socle,
  verdict: 'Aucun matériau contenant de l’amiante n’a été repéré dans les parties accessibles.',
  perimetre: { lue: false, pieces: [] }
} as unknown as Diagnostic;

describe('les éléments contrôlés', () => {
  it('montre les pièces que le rapport dit avoir visitées', () => {
    const s = syntheseAmiante(AVEC_PERIMETRE);
    expect(s.elements.montrer).toBe(true);
    expect(s.elements.entrees.map((e) => e.quoi)).toEqual([
      'Rez de chaussée - Entrée',
      'Rez de chaussée - Séjour',
      '1er étage - Combles 1'
    ]);
  });

  it('⚠️ dit « Visitée », jamais « sans amiante » : une pièce ouverte n’est pas blanchie', () => {
    const s = syntheseAmiante(AVEC_PERIMETRE);
    for (const e of s.elements.entrees) {
      expect(e.statut).toBe('Visitée');
      expect(e.statut).not.toMatch(/amiante|sain|conforme/i);
    }
  });

  it('⚠️ n’invente pas la liste du mockup quand le rapport ne dit rien', () => {
    const s = syntheseAmiante(SANS_PERIMETRE);
    expect(s.elements.montrer).toBe(false);
    expect(s.elements.entrees).toEqual([]);

    /* Les cinq composants du visuel ne doivent apparaître nulle part dans la
       synthèse d'un rapport qui ne les nomme pas. C'est la donnée inventée la
       plus dangereuse du produit : elle rassure. */
    const tout = JSON.stringify(s);
    for (const invente of ['Toiture / Couverture', 'Façades / Bardages', 'Revêtements intérieurs']) {
      expect(tout).not.toContain(invente);
    }
  });

  it('⚠️ n’affiche jamais le « 90 % » ni le « TRÈS FAIBLE » du mockup', () => {
    for (const d of [AVEC_PERIMETRE, SANS_PERIMETRE]) {
      const tout = JSON.stringify(syntheseAmiante(d));
      expect(tout).not.toMatch(/90\s*%/);
      expect(tout).not.toMatch(/tr[èe]s faible/i);
      expect(tout).not.toMatch(/niveau de risque/i);
    }
  });
});
