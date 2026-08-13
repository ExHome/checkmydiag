import { beforeEach, describe, expect, it } from 'vitest';
import { CGV, VERSION_CGV, accepter, acceptationEnCours, oublierAcceptation, editeurRenseigne, EDITEUR } from './cgv';

/** Le stockage local n'existe pas dans l'environnement de test. */
function faussStockage(): void {
  const boite = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (c: string) => boite.get(c) ?? null,
    setItem: (c: string, v: string) => void boite.set(c, v),
    removeItem: (c: string) => void boite.delete(c),
    clear: () => boite.clear(),
    key: () => null,
    length: 0
  } as unknown as Storage;
}

describe('acceptation des conditions', () => {
  beforeEach(faussStockage);

  it('ne suppose aucun accord tant que rien n’a été accepté', () => {
    expect(acceptationEnCours()).toBeNull();
  });

  it('retient l’accord avec sa version et son horodatage', () => {
    const quand = new Date(2026, 7, 13, 10, 30);
    accepter(quand);

    const lu = acceptationEnCours();
    expect(lu?.version).toBe(VERSION_CGV);
    expect(lu?.quand).toBe(quand.toISOString());
  });

  it('redemande l’accord quand le texte a changé de version', () => {
    localStorage.setItem('checkmydiag.cgv', JSON.stringify({ version: 'ancienne', quand: '2026-01-01' }));
    expect(acceptationEnCours()).toBeNull();
  });

  it('redemande l’accord plutôt que de faire confiance à un stockage abîmé', () => {
    localStorage.setItem('checkmydiag.cgv', 'ceci n’est pas du JSON');
    expect(acceptationEnCours()).toBeNull();
  });

  it('oublie l’accord quand on le lui demande', () => {
    accepter();
    oublierAcceptation();
    expect(acceptationEnCours()).toBeNull();
  });

  it('n’explose pas quand le stockage est interdit (navigation privée)', () => {
    globalThis.localStorage = {
      getItem: () => {
        throw new Error('refusé');
      },
      setItem: () => {
        throw new Error('refusé');
      },
      removeItem: () => {
        throw new Error('refusé');
      }
    } as unknown as Storage;

    expect(() => accepter()).not.toThrow();
    expect(acceptationEnCours()).toBeNull();
  });
});

describe('le texte des conditions', () => {
  const tout = CGV.flatMap((a) => a.points).join(' ');

  it('dit que le rapport signé prime sur le site', () => {
    expect(tout).toMatch(/c’est votre rapport qui a raison/i);
  });

  it('dit que le document n’est jamais envoyé', () => {
    expect(tout).toMatch(/n’est jamais envoyé sur un serveur/i);
  });

  it('annonce la conservation AVANT le dépôt, et ce qu’elle exclut', () => {
    // La finalité doit être annoncée à la collecte : annoncée après, elle ne
    // se régularise pas. Ces deux clauses sont donc obligatoires.
    const article = CGV.find((a) => a.titre.includes('Ce que nous conservons'));
    expect(article).toBeDefined();

    const texte = article?.points.join(' ') ?? '';
    expect(texte).toMatch(/code postal/i);
    expect(texte).toMatch(/jamais votre nom/i);
    expect(texte).toMatch(/deux ans/i);
    expect(texte).toMatch(/effacement/i);
  });

  it('ne promet jamais de conserver ce que le contrat de données exclut', () => {
    const article = CGV.find((a) => a.titre.includes('Ce que nous conservons'));
    const texte = article?.points.join(' ') ?? '';
    for (const interdit of ['numéro ADEME', 'adresse exacte', 'références cadastrales']) {
      expect(texte).toContain(interdit);
    }
  });

  it('annonce le caractère payant du référencement et l’absence de commission', () => {
    const article = CGV.find((a) => a.titre.includes('professionnels'));
    const texte = article?.points.join(' ') ?? '';
    expect(texte).toMatch(/référencement est payant/i);
    expect(texte).toMatch(/aucune commission/i);
    expect(texte).toMatch(/ni un label/i);
  });

  it('promet que le rapport n’est jamais transmis à un professionnel', () => {
    expect(tout).toMatch(/rapport n’est jamais transmis/i);
  });

  it('reste lisible : pas de phrase à rallonge', () => {
    // Un lecteur de quinze ans doit comprendre ce qu'il accepte. Au-delà de
    // 280 caractères, une phrase se relit — donc ne se lit pas.
    for (const article of CGV) {
      for (const point of article.points) {
        expect(point.length, `${article.titre} — « ${point.slice(0, 60)}… »`).toBeLessThan(280);
      }
    }
  });

  it('ne se prétend pas opposable tant que l’éditeur n’est pas identifié', () => {
    // Tant que la raison sociale, le SIRET, l'adresse et le courriel manquent,
    // l'interface doit le dire au lieu de faire croire à un texte valide.
    expect(editeurRenseigne()).toBe(
      Boolean(EDITEUR.raisonSociale && EDITEUR.siret && EDITEUR.adresse && EDITEUR.email)
    );
  });
});
