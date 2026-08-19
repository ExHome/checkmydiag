import { describe, expect, it } from 'vitest';
import { questionDe } from './lumiere';

/**
 * Un écran, une question.
 *
 * L'ordre de mission le pose comme règle : chaque écran répond à UNE question,
 * et c'est elle qui doit accrocher le regard. Ce test garde deux choses — que
 * les onze écrans en aient une, et qu'elles restent des questions plutôt que
 * des verdicts déguisés.
 */
describe('la question de chaque écran', () => {
  const ECRANS = [
    'dpe', 'electricite', 'gaz', 'amiante', 'plomb',
    'termites', 'erp', 'carrez', 'assainissement', 'dicodiag', 'en-clair'
  ] as const;

  it('couvre les onze écrans', () => {
    for (const e of ECRANS) {
      expect(questionDe(e), e).toBeTruthy();
    }
  });

  it('pose bien une question', () => {
    for (const e of ECRANS) {
      expect(questionDe(e), e).toMatch(/\?$/);
    }
  });

  /*
   * Une question ne présume pas de sa réponse. « Y a-t-il de l'amiante ? » se
   * pose aussi bien quand le rapport n'en trouve pas ; « Votre logement est-il
   * dangereux ? » inquiéterait avant même d'avoir lu — c'est ce que la règle
   * de l'accroche interdit déjà.
   */
  it('n’alarme pas avant d’avoir lu', () => {
    for (const e of ECRANS) {
      expect(questionDe(e), e).not.toMatch(/dangereux|grave|risqué|mauvais|inquiét/i);
    }
  });
});
