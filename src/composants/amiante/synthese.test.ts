/**
 * La synthèse amiante tient-elle les règles absolues de l'ordre du 22/08 ?
 *
 * Les cas viennent de volets lus en entier les 21 et 22/08.
 */
import { describe, expect, it } from 'vitest';
import { issueDe, syntheseAmiante } from './synthese';
import type { Diagnostic } from '../../lib/modele';

const diag = (p: Partial<Diagnostic>): Diagnostic =>
  ({
    type: 'amiante',
    titre: 'Amiante',
    verdict: '',
    gravite: 'bon',
    faits: [],
    explication: [],
    aFaire: [],
    schema: null,
    pages: [40, 54],
    ...p
  }) as Diagnostic;

describe('les trois issues, jamais deux', () => {
  it('lit une absence', () => {
    const d = diag({ verdict: 'Aucun matériau contenant de l’amiante n’a été repéré.', gravite: 'bon' });
    expect(issueDe(d)).toBe('absence');
  });

  it('lit une présence sur les faits, pas sur la phrase', () => {
    const d = diag({
      verdict: 'Le rapport repère des matériaux contenant de l’amiante.',
      gravite: 'alerte',
      faits: [{ libelle: 'Amiante repérée', valeur: 'Conduits (Sous-Sol - Cave)' }]
    });
    expect(issueDe(d)).toBe('presence');
  });

  it('⚠️ lit « ne conclut pas » — et ne le range pas dans « rien trouvé »', () => {
    const d = diag({
      verdict: 'Le rapport ne conclut pas encore : des prélèvements restent à faire.',
      gravite: 'attention',
      faits: [{ libelle: 'Le rapport ne conclut pas', valeur: 'Dalle de sol (Cage d’escalier)' }]
    });
    expect(issueDe(d)).toBe('nonConclu');
    const s = syntheseAmiante(d);
    expect(s.pointsCles[0]?.titre).toMatch(/ne conclut pas/);
    expect(s.pointsCles[0]?.titre).not.toMatch(/aucun/i);
  });

  it('lit « je n’ai pas pu lire » — 14 documents du corpus sont dans ce cas', () => {
    const d = diag({ verdict: "Le constat n'a pas pu être lu : sa rubrique de conclusion est introuvable." });
    expect(issueDe(d)).toBe('illisible');
    expect(syntheseAmiante(d).conseil[0]).toMatch(/version lisible/);
  });
});

describe('⚠️ une zone non contrôlée n’est JAMAIS présentée comme saine', () => {
  it('distingue « on n’a pas su lire » de « la rubrique répond Néant »', () => {
    const pasLue = syntheseAmiante(
      diag({ verdict: 'x', nonVisitees: { lue: false, neant: false, pieces: [], charpente: false } })
    );
    expect(pasLue.nonControle.montrer).toBe(true);
    expect(pasLue.nonControle.mention).toMatch(/n'a pas pu être lue|n’a pas pu être lue/);
    expect(pasLue.nonControle.mention).not.toMatch(/aucun local/i);

    const neant = syntheseAmiante(
      diag({ verdict: 'x', nonVisitees: { lue: true, neant: true, pieces: [], charpente: false } })
    );
    expect(neant.nonControle.mention).toMatch(/aucun local/i);
  });

  it('restitue la raison quand le rapport la donne, et se tait sinon', () => {
    const s = syntheseAmiante(
      diag({
        verdict: 'x',
        nonVisitees: {
          lue: true,
          neant: false,
          pieces: [
            { terme: 'Combles', ou: 'R+2', pourquoi: 'Trappe de visite non accessible' },
            { terme: 'Chaufferie', ou: 'Rez de chaussée', pourquoi: '' }
          ],
          charpente: true
        }
      })
    );
    expect(s.nonControle.entrees[0]).toEqual({
      quoi: 'Combles',
      ou: 'R+2',
      pourquoi: 'Trappe de visite non accessible'
    });
    // Pas de raison connue : le champ n'existe pas — on n'invente pas.
    expect(s.nonControle.entrees[1]).toEqual({ quoi: 'Chaufferie', ou: 'Rez de chaussée' });
  });

  it('dit que les combles en font partie — là où vivent les flocages', () => {
    const s = syntheseAmiante(
      diag({
        verdict: 'x',
        nonVisitees: {
          lue: true,
          neant: false,
          pieces: [{ terme: 'Combles', ou: '', pourquoi: 'Absence de trappe' }],
          charpente: true
        }
      })
    );
    expect(s.completude.join(' ')).toMatch(/combles|charpente/i);
    expect(s.conseil.join(' ')).toMatch(/zones restées fermées/i);
  });
});

describe('⚠️ aucun pourcentage de confiance', () => {
  it('ne rend jamais de %, mais des faits', () => {
    const s = syntheseAmiante(
      diag({
        verdict: 'x',
        nonVisitees: {
          lue: true,
          neant: false,
          pieces: [
            { terme: 'Combles', ou: '', pourquoi: 'Absence de trappe' },
            { terme: 'Cave', ou: '', pourquoi: 'Absence de clef' }
          ],
          charpente: false
        }
      })
    );
    expect(s.completude.join(' ')).not.toMatch(/%/);
    expect(s.completude[0]).toMatch(/2 locaux ou composants/);
  });
});

describe('⚠️ aucune donnée inventée', () => {
  it('n’invente pas une liste de « matériaux contrôlés » que le rapport n’écrit pas', () => {
    const s = syntheseAmiante(diag({ verdict: 'Aucun matériau…', gravite: 'bon' }));
    expect(s.materiaux.montrer).toBe(false);
    expect(s.materiaux.entrees).toEqual([]);
    expect(s.materiaux.mention).toMatch(/ne détaille pas/);
  });

  it('rend chaque matériau amianté avec ce que le rapport en dit, et rien de plus', () => {
    const s = syntheseAmiante(
      diag({
        verdict: 'Le rapport repère des matériaux contenant de l’amiante.',
        gravite: 'alerte',
        anomalies: [
          {
            code: null,
            domaine: null,
            libelle: 'Flocages',
            localisations: ['Sous-Sol - Parties Communes / Caves'],
            pluralite: 'inconnue',
            mesureCompensatoire: { code: null, libelle: 'Score 3' },
            geste: 'Il faut faire réaliser des travaux de retrait ou de confinement des flocages.'
          }
        ]
      })
    );
    expect(s.materiaux.entrees[0]).toEqual({
      quoi: 'Flocages',
      ou: 'Sous-Sol - Parties Communes / Caves',
      etat: 'Score 3',
      suite: 'Il faut faire réaliser des travaux de retrait ou de confinement des flocages.'
    });
    expect(s.pointsCles[0]?.ton).toBe('alerte');
  });

  it('écarte les valeurs qui ne disent rien — « — », « Néant », vide', () => {
    const s = syntheseAmiante(
      diag({
        verdict: 'x',
        gravite: 'alerte',
        faits: [{ libelle: 'Amiante repérée', valeur: '—' }]
      })
    );
    expect(s.materiaux.entrees).toEqual([]);
  });
});

describe('le conseil vient après les faits, et ne garantit rien', () => {
  it('sur une présence, il prévient avant les travaux', () => {
    const s = syntheseAmiante(
      diag({ verdict: 'x', gravite: 'alerte', faits: [{ libelle: 'Amiante repérée', valeur: 'Conduits' }] })
    );
    expect(s.conseil[0]).toMatch(/Prévenez/);
    expect(s.conseil.join(' ')).not.toMatch(/sans danger|aucun risque/i);
  });

  it('sur un non-conclu, il réclame le rapport complété', () => {
    const s = syntheseAmiante(
      diag({
        verdict: 'x',
        gravite: 'attention',
        faits: [{ libelle: 'Le rapport ne conclut pas', valeur: 'Dalle de sol' }]
      })
    );
    expect(s.conseil[0]).toMatch(/laboratoire/);
  });
});
