/**
 * Le constat amiante de BC2E, lu chez BC2E.
 *
 * Tous les extraits viennent de volets BC2E lus en entier le 21/08/2026.
 */
import { describe, expect, it } from 'vitest';
import { conclusionsBC2E, lireAmianteBC2E } from './amiante.bc2e';
import type { Contexte } from './lecteurs';
import type { Generateur } from '../atelier/editeur';

const bc2e: Generateur = {
  editeur: 'BC2E',
  societe: null,
  logiciel: null,
  version: null,
  source: 'signature',
  preuve: 'TCPDF · HTML2PDF',
  genre: 'diagnostic'
};

const ctx = (lignes: string[]): Contexte => ({ lignes, plage: [1, 10], generateur: bc2e });

const ENTETE = ['A - CONCLUSIONS DU REPÉRAGE EFFECTIF :'];
const FIN = ['B - OBLIGATIONS ET RECOMMANDATIONS RÉGLEMENTAIRE ISSUES DES RÉSULTATS DU REPÉRAGE'];

describe('bloc A — les six états, chez BC2E', () => {
  it('lit une absence pure', () => {
    const l = [
      ...ENTETE,
      "Dans le cadre réglementaire de la mission décrit au paragraphe 2.2, il n'a pas été repéré de matériaux",
      "ou produits susceptibles de contenir de l'amiante.",
      ...FIN
    ];
    expect(conclusionsBC2E(l).map((c) => c.etat)).toEqual(['absence']);
  });

  it("⚠️ ne prend PAS pour une présence le matériau marqué sans amiante", () => {
    const l = [
      ...ENTETE,
      'Dans le cadre réglementaire de la mission décrit au paragraphe 2.2, il a été repéré des matériaux et',
      "produits susceptibles de contenir de l'amiante : marquage des matériaux, ils ne contiennent pas",
      "d'amiante dans :",
      'SOUS-SOL - Cave (Conduits) : Plafond',
      ...FIN
    ];
    const c = conclusionsBC2E(l);
    expect(c[0]?.etat).toBe('absence');
    expect(c[0]?.ou).toContain('SOUS-SOL - Cave (Conduits) : Plafond');
  });

  it('lit une présence sur jugement de l’opérateur', () => {
    const l = [
      ...ENTETE,
      "Dans le cadre réglementaire de la mission décrit au paragraphe 2.2, il a été repéré des matériaux et",
      "produits contenant de l'amiante sur décision de l'opérateur (jugement personnel) dans :",
      'Garages 1 (Plaques) : Toiture Garages',
      'Garages 2 (Plaques) : Toiture garages',
      ...FIN
    ];
    const c = conclusionsBC2E(l);
    expect(c[0]?.etat).toBe('presence');
    expect(c[0]?.ou).toHaveLength(2);
  });

  it('lit une présence établie sur document consulté', () => {
    const l = [
      ...ENTETE,
      "Dans le cadre réglementaire de la mission décrit au paragraphe 2.2, il a été repéré des matériaux et",
      "produits contenant de l'amiante : document consulté dans :",
      'Bat. A - Palier 1er (Conduits) : Placard technique',
      ...FIN
    ];
    expect(conclusionsBC2E(l)[0]?.etat).toBe('presence');
  });

  it('⚠️ ne conclut pas quand le laboratoire n’a pas rendu', () => {
    const l = [...ENTETE, "PRÉLÈVEMENT(S) AMIANTE EN COURS D'ANALYSE.", ...FIN];
    expect(conclusionsBC2E(l)[0]?.etat).toBe('nonConclu');
  });

  it('⚠️ ne conclut pas quand des sondages restent à faire', () => {
    const l = [
      ...ENTETE,
      'Dans le cadre réglementaire de la mission décrit au paragraphe 2.2, il a été repéré des matériaux ou',
      "produits susceptibles de contenir de l'amiante pour lesquels des sondages et/ou des prélèvements",
      'doivent être effectués dans :',
      "Cage d'escalier (Dalle de sol) : Sol - Idem Prélèvement entrée",
      ...FIN
    ];
    expect(conclusionsBC2E(l)[0]?.etat).toBe('nonConclu');
  });

  it('ne lit rien hors du bloc A — le reste du rapport parle d’amiante partout', () => {
    const l = [
      'RAPPORT DE MISSION DE REPÉRAGE DES MATÉRIAUX ET PRODUITS DES LISTES A ET B',
      "Il est rappelé la nécessité réglementaire d'avertir du risque de la présence d'amiante",
      ...FIN,
      "Matériaux et produits de la liste A : Aucune obligation réglementaire à signaler."
    ];
    expect(conclusionsBC2E(l)).toEqual([]);
  });
});

describe('le lecteur BC2E', () => {
  it('dit qu’il n’a pas pu lire, plutôt que de conclure', () => {
    const d = lireAmianteBC2E(ctx(['un document sans bloc A']));
    expect(d.verdict).toMatch(/n'a pas pu être lu|n’a pas pu être lu/);
    expect(d.gravite).toBe('bon');
  });

  it('distingue « ne conclut pas » de « rien trouvé »', () => {
    const suspens = lireAmianteBC2E(
      ctx([...ENTETE, "PRÉLÈVEMENT(S) AMIANTE EN COURS D'ANALYSE.", ...FIN])
    );
    expect(suspens.verdict).toMatch(/ne conclut pas/);
    expect(suspens.faits?.some((f) => f.libelle === 'Le rapport ne conclut pas')).toBe(true);

    const rien = lireAmianteBC2E(
      ctx([
        ...ENTETE,
        "Dans le cadre réglementaire de la mission, il n'a pas été repéré de matériaux ou produits",
        "susceptibles de contenir de l'amiante.",
        ...FIN
      ])
    );
    expect(rien.verdict).toMatch(/ne repère aucun matériau/);
  });
});
