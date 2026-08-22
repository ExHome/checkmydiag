/**
 * CE QUE LA LOI EXIGE NE SE DÉDUIT PAS DU SILENCE D'UN RAPPORT.
 *
 * L'article R. 126-42 du code de la construction et de l'habitation énumère
 * ce qu'un état termites doit contenir. Le texte vit dans `reglement/textes.ts`
 * avec sa source Légifrance ; ces tests vérifient qu'on le met en face des
 * données sans jamais combler un trou.
 *
 * La ligne la plus surveillée est celle des parties NON visitées. La réserve
 * portée au texte l'explique : « le code les exige au même titre que les
 * visitées, une liste absente n'est pas un détail de forme ». Un rapport qui
 * ne la porte pas ne dit pas que tout a été vu — il ne dit rien, et l'écran
 * doit dire exactement cela.
 */
import { describe, expect, it } from 'vitest';
import { exigencesManquantes, pointsReglementairesTermites } from './pointsReglementaires';
import type { Analyse, Diagnostic } from './modele';

const BIEN = { bien: { adresse: '12 rue de l’Exemple', commune: '33000 BORDEAUX' } } as Pick<
  Analyse,
  'bien'
>;

function diag(sur: Partial<Diagnostic> = {}): Diagnostic {
  return {
    type: 'termites',
    titre: 'Termites',
    verdict: 'Aucun indice d’infestation n’a été relevé dans les parties visitées.',
    gravite: 'bon',
    date: '02/09/2025',
    pages: [6, 6],
    ...sur
  } as Diagnostic;
}

describe('les points réglementaires de l’état termites', () => {
  it('suivent l’ordre de l’article', () => {
    const p = pointsReglementairesTermites(diag(), BIEN);
    expect(p.map((x) => x.exige)).toEqual([
      'Identifier l’immeuble',
      'Indiquer les parties visitées',
      'Indiquer les parties qui n’ont pas pu être visitées',
      'Indiquer les éléments infestés et ceux qui ne le sont pas',
      'Être daté'
    ]);
  });

  /** Le lecteur doit voir que l'exigence vient du code, pas de l'application. */
  it('citent l’article qui les fonde', () => {
    for (const p of pointsReglementairesTermites(diag(), BIEN)) {
      expect(p.article).toContain('R. 126-42');
    }
  });

  it('montrent ce que le rapport dit quand il le dit', () => {
    const d = diag({
      schema: { genre: 'pieces', zones: [{ nom: 'Séjour', etat: 'bon' }, { nom: 'Cave', etat: 'bon' }] }
    } as Partial<Diagnostic>);
    const p = pointsReglementairesTermites(d, BIEN);
    expect(p[0]?.rapport).toBe('12 rue de l’Exemple, 33000 BORDEAUX');
    expect(p[1]?.rapport).toBe('Séjour · Cave');
    expect(p[0]?.etat).toBe('lu');
  });

  /**
   * LE TEST QUI COMPTE. Une conclusion favorable, aucune liste de parties non
   * visitées : l'exigence doit ressortir comme NON satisfaite, et surtout pas
   * comme « rien à signaler ».
   */
  it('une liste de parties non visitées absente se voit', () => {
    const p = pointsReglementairesTermites(diag(), BIEN);
    const nonVisitees = p.find((x) => /n’ont pas pu être visitées/.test(x.exige));
    expect(nonVisitees?.etat, 'l’exigence n’est pas satisfaite').toBe('absent');
    expect(nonVisitees?.rapport, 'aucune phrase ne doit combler le trou').toBeNull();
  });

  /** « Néant » est une réponse : c'est le rapport qui la donne, pas nous. */
  it('un « néant » explicite compte comme satisfait', () => {
    const d = diag({
      constatations: { lue: true, neant: true, entrees: [] }
    } as Partial<Diagnostic>);
    const nonVisitees = pointsReglementairesTermites(d, BIEN).find((x) =>
      /n’ont pas pu être visitées/.test(x.exige)
    );
    expect(nonVisitees?.etat).toBe('lu');
    expect(nonVisitees?.rapport).toMatch(/néant/i);
  });

  it('les parties non visitées sont restituées avec leur motif', () => {
    const d = diag({
      constatations: {
        lue: true,
        neant: false,
        entrees: [
          { terme: 'Vide sanitaire', ou: 'non accessible', nature: 'limite' },
          { terme: 'Plancher sous moquette', nature: 'limite' }
        ]
      }
    } as Partial<Diagnostic>);
    const nonVisitees = pointsReglementairesTermites(d, BIEN).find((x) =>
      /n’ont pas pu être visitées/.test(x.exige)
    );
    expect(nonVisitees?.rapport).toBe('Vide sanitaire (non accessible) · Plancher sous moquette');
  });

  /**
   * Un rapport illisible n'est pas un rapport incomplet : la distinction est
   * celle entre « le diagnostiqueur n'a pas écrit » et « nous n'avons pas su
   * lire ». Les deux ne se disent pas au lecteur de la même façon.
   */
  it('distingue « pas écrit » de « pas lu »', () => {
    /* `exactOptionalPropertyTypes` refuse d'assigner `undefined` a un champ
       optionnel : on construit donc l'objet sans ces cles plutot qu'avec des
       valeurs vides. */
    const sansConclusion = {
      type: 'termites',
      titre: 'Termites',
      gravite: 'neutre',
      origine: 'illisible',
      pages: [6, 6]
    } as unknown as Diagnostic;
    const p = pointsReglementairesTermites(sansConclusion, BIEN);
    const conclusion = p.find((x) => /éléments infestés/.test(x.exige));
    expect(conclusion?.etat).toBe('illisible');
  });

  it('compte les exigences non retrouvées', () => {
    expect(exigencesManquantes(pointsReglementairesTermites(diag(), BIEN))).toBe(2);
    const complet = diag({
      schema: { genre: 'pieces', zones: [{ nom: 'Séjour', etat: 'bon' }] },
      constatations: { lue: true, neant: true, entrees: [] }
    } as Partial<Diagnostic>);
    expect(exigencesManquantes(pointsReglementairesTermites(complet, BIEN))).toBe(0);
  });
});
