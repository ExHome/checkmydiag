import { describe, expect, it } from 'vitest';
import { issueTermites, syntheseTermites } from './synthese';
import type { Diagnostic } from '../../lib/modele';

/**
 * LA SYNTHÈSE TERMITES — les sept blocs de l'ordre, et les garde-fous.
 *
 * L'ordre du 22/08/2026 nomme lui-même les données fictives du visuel de
 * référence : le « 90 % » de confiance et le « NIVEAU DE RISQUE : TRÈS FAIBLE ».
 * Aucun des deux ne doit apparaître, et ces tests l'empêchent.
 */

const base: Diagnostic = {
  type: 'termites',
  titre: 'Termites',
  verdict: 'Aucun indice d’infestation de termites sur les éléments examinés.',
  gravite: 'bon',
  faits: [],
  explication: [],
  aFaire: [],
  schema: null,
  pages: [4, 10]
};

const avec = (p: Partial<Diagnostic>): Diagnostic => ({ ...base, ...p });

describe('l’issue du volet termites', () => {
  it('se lit sur la gravité, jamais dans la phrase de verdict', () => {
    /* Chercher des mots dans le verdict serait « chercher une info, pas un
       endroit ». On lit ce que le lecteur a établi. */
    expect(issueTermites(base)).toBe('absenceDIndices');
    expect(issueTermites(avec({ gravite: 'alerte' }))).toBe('indices');
    expect(issueTermites(avec({ gravite: 'attention' }))).toBe('indices');
    expect(issueTermites(avec({ gravite: 'neutre' }))).toBe('illisible');
    expect(issueTermites(avec({ verdict: '' }))).toBe('illisible');
  });
});

describe('⚠️ les données fictives du visuel n’apparaissent jamais', () => {
  it('n’affiche AUCUN pourcentage de confiance', () => {
    /*
     * § E : « Ne pas afficher arbitrairement un pourcentage tel que 90 %. »
     * Aucune règle de calcul n'est validée — le nombre de pièces non visitées
     * n'est pas comparable d'un rapport à l'autre.
     */
    const s = syntheseTermites(
      avec({
        nonVisitees: {
          lue: true,
          neant: false,
          charpente: true,
          pieces: [{ terme: 'R+1 - Combles (Absence de trappe)', ou: 'R+1 - Combles', pourquoi: 'Absence de trappe' }]
        }
      })
    );
    const tout = JSON.stringify(s);
    expect(tout).not.toMatch(/\d+\s*%/);
    expect(tout).not.toMatch(/90/);
  });

  it('n’affiche AUCUN niveau de risque', () => {
    /* § B : il doit être calculable ou issu d'une règle validée. Le rapport ne
       qualifie aucun risque — il constate des indices, ou leur absence. */
    const tout = JSON.stringify(syntheseTermites(base));
    expect(tout).not.toMatch(/niveau de risque/i);
    expect(tout).not.toMatch(/très faible|modéré|élevé/i);
  });

  it('⚠️ ne décompose pas la conclusion en trois constats inventés', () => {
    /*
     * Le visuel propose « Aucun termite vivant observé », « Aucun dégât
     * identifié », « Pas d'indice d'activité récent ». Les rapports ne
     * répondent PAS indice par indice : le tableau conclut globalement.
     * Décomposer serait inventer trois constats à partir d'un seul.
     */
    const tout = JSON.stringify(syntheseTermites(base));
    expect(tout).not.toMatch(/termite vivant/i);
    expect(tout).not.toMatch(/aucun dégât/i);
    expect(tout).not.toMatch(/activité récent/i);
  });

  it('⚠️ ne dit jamais « aucun termite », mais « aucun indice … examinés »', () => {
    /* § 4 : « absence d'indice d'infestation » ne se simplifie pas en
       « absence de termites » — cette phrase dépasse la portée du rapport. */
    const s = syntheseTermites(base);
    expect(s.pointsCles[0]?.titre).toBe('Aucun indice d’infestation de termites');
    expect(s.pointsCles[0]?.detail).toContain('éléments que l’opérateur a examinés');
    expect(JSON.stringify(s.pointsCles)).not.toMatch(/aucun termite|pas de termites/i);
  });
});

describe('les points clés', () => {
  it('⚠️ annoncent la charpente non contrôlée — le point le plus important', () => {
    /*
     * Il ne figure sur aucun visuel, et c'est celui qui compte : la conclusion
     * ne porte pas sur ce que personne n'a regardé (§ 15).
     */
    const s = syntheseTermites(
      avec({
        nonVisitees: {
          lue: true,
          neant: false,
          charpente: true,
          pieces: [{ terme: 'Combles (Plafond rampant)', ou: 'Combles', pourquoi: 'Plafond rampant' }]
        }
      })
    );
    expect(s.pointsCles.some((p) => /charpente/i.test(p.titre))).toBe(true);
    expect(s.pointsCles.find((p) => /charpente/i.test(p.titre))?.detail).toContain(
      'la conclusion ne porte pas sur eux'
    );
  });

  it('annoncent les autres agents sans les nommer à la place du rapport', () => {
    /* § 11 et § 12 : ne jamais appeler « termites » un indice attribué à autre
       chose, et ne jamais écrire « mérule » là où le rapport écrit autre chose.
       Le bloc « Constatations diverses » porte leurs mots. */
    const s = syntheseTermites(
      avec({
        constatations: {
          lue: true,
          neant: false,
          entrees: [
            { terme: 'Traces de moisissures au plafond dans RDC: Cuisine', nature: 'constat' }
          ]
        }
      })
    );
    const point = s.pointsCles.find((p) => /autre chose que des termites/i.test(p.titre));
    expect(point).toBeDefined();
    expect(point?.detail).not.toMatch(/mérule/i);
  });

  it('ne conclut rien quand le volet n’a pas pu être lu', () => {
    const s = syntheseTermites(avec({ gravite: 'neutre' }));
    expect(s.issue).toBe('illisible');
    expect(s.pointsCles[0]?.titre).toContain('n’a pas pu être lu');
    expect(s.conseil.join(' ')).toContain('Ouvrez le rapport');
  });
});

describe('la complétude — en faits, jamais en score', () => {
  it('dit « contrôle complet selon les zones accessibles » sur un Néant', () => {
    const s = syntheseTermites(
      avec({
        nonVisitees: { lue: true, neant: true, charpente: false, pieces: [] },
        nonExamines: { lue: true, neant: true, ouvrages: [] }
      })
    );
    expect(s.completude).toContain('Contrôle complet selon les zones accessibles.');
  });

  it('compte les pièces et les ouvrages, sans les additionner en score', () => {
    const s = syntheseTermites(
      avec({
        nonVisitees: {
          lue: true,
          neant: false,
          charpente: false,
          pieces: [
            { terme: 'Cabanon 1 (Encombrement)', ou: 'Cabanon 1', pourquoi: 'Encombrement' },
            { terme: 'Cabanon 2 (Encombrement)', ou: 'Cabanon 2', pourquoi: 'Encombrement' }
          ]
        },
        nonExamines: {
          lue: true,
          neant: false,
          ouvrages: [{ terme: 'Mur — Revetement fixé', ou: 'Mur', pourquoi: 'Revetement fixé', separable: true }]
        }
      })
    );
    expect(s.completude[0]).toBe('Contrôle comportant des zones non accessibles.');
    expect(s.completude.join(' ')).toContain('2 pièces n’ont pas pu être visitées');
    expect(s.completude.join(' ')).toContain('Une catégorie d’ouvrages');
  });
});

describe('les trois silences, jamais confondus', () => {
  it('distingue « Néant », « pas lue » et « pas de bloc »', () => {
    /* § 15 et § 24 : « on n'a pas su lire » ne se dit jamais « rien à
       signaler », et « Néant » est une réponse. */
    const neant = syntheseTermites(
      avec({ constatations: { lue: true, neant: true, entrees: [] } })
    ).constatations;
    expect(neant.montrer).toBe(true);
    expect(neant.mention).toContain('répond « Néant »');

    const pasLue = syntheseTermites(
      avec({ constatations: { lue: false, neant: false, entrees: [] } })
    ).constatations;
    expect(pasLue.montrer).toBe(true);
    expect(pasLue.mention).toContain('n’a pas été lue');
    expect(pasLue.mention).toContain('Cela ne veut pas dire qu’elle est vide');

    expect(syntheseTermites(base).constatations.montrer).toBe(false);
  });

  it('marque les ouvrages dont les colonnes n’ont pas pu être séparées', () => {
    const s = syntheseTermites(
      avec({
        nonExamines: {
          lue: true,
          neant: false,
          ouvrages: [{ terme: 'Combles Toutes Plafond rampant.', separable: false }]
        }
      })
    );
    expect(s.nonExamines.entrees[0]?.separe).toBe(false);
    expect(s.nonExamines.entrees[0]?.pourquoi).toBeUndefined();
  });
});

describe('le conseil vient après les faits', () => {
  it('rappelle la déclaration en mairie quand des indices sont relevés', () => {
    const s = syntheseTermites(avec({ gravite: 'alerte' }));
    expect(s.conseil.join(' ')).toContain('déclaration en mairie');
    expect(s.conseil.join(' ')).toContain('L. 126-4');
  });

  it('renvoie à l’engagement du cabinet quand la charpente manque', () => {
    const s = syntheseTermites(
      avec({
        nonVisitees: {
          lue: true,
          neant: false,
          charpente: true,
          pieces: [{ terme: 'Combles', ou: 'Combles', pourquoi: '' }]
        }
      })
    );
    expect(s.conseil.join(' ')).toContain('faire créer l’accès');
  });

  it('ne crée aucune fausse garantie sur un rapport sans indice', () => {
    const s = syntheseTermites(base);
    expect(s.conseil.join(' ')).toContain('éléments que l’opérateur a pu examiner');
    expect(s.conseil.join(' ')).not.toMatch(/garanti|aucun risque|sans danger/i);
  });
});
