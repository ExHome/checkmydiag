import { describe, expect, it } from 'vitest';
import { compterLeDossier, phraseDuDossier } from './bureau';
import type { Diagnostic, Gravite } from './modele';

/** Un diagnostic réduit à ce que l'écran d'accueil regarde : sa gravité. */
function diag(gravite: Gravite): Diagnostic {
  return {
    type: 'dpe',
    titre: 'Diagnostic',
    verdict: 'Verdict',
    gravite,
    faits: [],
    pages: [1, 1]
  } as unknown as Diagnostic;
}

describe('les compteurs de l’écran d’accueil', () => {
  it('range chaque diagnostic dans une seule colonne', () => {
    const compte = compterLeDossier([
      diag('alerte'),
      diag('alerte'),
      diag('attention'),
      diag('bon'),
      diag('neutre')
    ]);

    /* « Non lu » a sa propre colonne : il était rangé avec « pour
       information », ce qui revenait à présenter un rapport illisible comme
       un rapport sans problème. */
    expect(compte).toEqual({ aRegler: 2, aVerifier: 1, pourInformation: 1, nonLus: 1 });
  });

  /*
   * Le lecteur peut recompter les tuiles à l'œil : si la somme des trois
   * compteurs ne fait pas le nombre de diagnostics, il voit l'erreur avant nous.
   */
  it('la somme des quatre compteurs fait le dossier entier', () => {
    const dossier = [diag('alerte'), diag('attention'), diag('bon'), diag('neutre'), diag('bon')];
    const c = compterLeDossier(dossier);

    expect(c.aRegler + c.aVerifier + c.pourInformation + c.nonLus).toBe(dossier.length);
  });

  it('un dossier vide ne compte rien', () => {
    expect(compterLeDossier([])).toEqual({ aRegler: 0, aVerifier: 0, pourInformation: 0, nonLus: 0 });
  });
});

describe('la phrase du cartouche', () => {
  it('annonce d’abord ce qui bloque', () => {
    expect(phraseDuDossier({ aRegler: 2, aVerifier: 3, pourInformation: 1, nonLus: 0 })).toBe(
      '2 diagnostics demandent une action avant la signature.'
    );
  });

  it('accorde le singulier', () => {
    expect(phraseDuDossier({ aRegler: 1, aVerifier: 0, pourInformation: 4, nonLus: 0 })).toBe(
      'Un diagnostic demande une action avant la signature.'
    );
    expect(phraseDuDossier({ aRegler: 0, aVerifier: 1, pourInformation: 4, nonLus: 0 })).toBe(
      'Un diagnostic mérite une question au vendeur.'
    );
  });

  it('ne parle de rien à signaler que si rien n’est signalé', () => {
    expect(phraseDuDossier({ aRegler: 0, aVerifier: 0, pourInformation: 7, nonLus: 0 })).toBe(
      'Aucun diagnostic du dossier ne signale d’anomalie.'
    );
  });

  /*
   * Le garde-fou du fond.
   *
   * Les briefs de refonte proposent régulièrement d'afficher ici un budget de
   * travaux — « 15-25k€ » — ou un délai. Aucun rapport de diagnostic ne porte
   * ces nombres : ils seraient inventés. Ce test échoue si l'un d'eux revient.
   */
  it('ne chiffre jamais de travaux, de délai ni de montant', () => {
    const cas = [
      { aRegler: 3, aVerifier: 2, pourInformation: 1, nonLus: 0 },
      { aRegler: 0, aVerifier: 2, pourInformation: 5, nonLus: 0 },
      { aRegler: 0, aVerifier: 0, pourInformation: 9, nonLus: 0 }
    ];

    for (const c of cas) {
      const phrase = phraseDuDossier(c);
      expect(phrase).not.toMatch(/€|euros?|k€|\bans?\b|\bmois\b|travaux/i);
    }
  });
});
