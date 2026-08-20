import { describe, expect, it } from 'vitest';
import { analyserAmiante, materiauxAmiantes } from './reperages';

/**
 * Ce que le repérage amiante a trouvé, et la suite à lui donner.
 *
 * Le produit disait « des matériaux contenant de l'amiante ont été repérés »
 * sans jamais dire lesquels ni où. Le rapport les nomme, les situe, et indique
 * la suite.
 *
 * Trois suites existent pour la liste B, et elles n'engagent pas au même point :
 * l'évaluation périodique est une surveillance — on revient tous les trois ans ;
 * les actions correctives de premier et second niveau sont des travaux.
 *
 * Fragments anonymisés, calqués sur la conclusion d'un rapport réel.
 */
const CONCLUSION = [
  '1.1 Liste A : Dans le cadre de mission décrit à l’article 3.2 , il n’a pas été repéré',
  '- de matériaux ou produits de la liste A contenant de l’amiante.',
  '1.1 Liste B : Dans le cadre de mission décrit à l’article 3.2 , il a été repéré :',
  '- des matériaux et produits de la liste B contenant de l’amiante sur décision de l’opérateur :',
  'Conduits de fumée en amiante - ciment (1er étage - Terrasse) pour lequel il est recommandé de réaliser',
  'une évaluation périodique.'
];

describe('les matériaux repérés', () => {
  it('lit ce que c’est et où c’est', () => {
    const m = materiauxAmiantes(CONCLUSION);
    expect(m.length).toBe(1);
    expect(m[0]?.quoi).toMatch(/Conduits de fumée en amiante/);
    expect(m[0]?.ou).toBe('1er étage - Terrasse');
  });

  it('reconnaît l’évaluation périodique', () => {
    expect(materiauxAmiantes(CONCLUSION)[0]?.suite).toBe('evaluation');
  });

  it('distingue une action corrective de second niveau', () => {
    /*
     * La ligne est précédée de sa rubrique, désormais exigée.
     *
     * Balayer tout le volet ramenait vingt-trois lignes fausses sur quarante-
     * trois citées — l'organisme certificateur avec son adresse, des renvois
     * d'articles, des intitulés de grille de repérage. Seule la rubrique qui
     * énumère fait foi ; sans elle, la fonction ne cite rien plutôt que faux.
     */
    const m = materiauxAmiantes([
      '1.1 Liste B : Dans le cadre de mission décrit à l’article 3.2 , il a été repéré :',
      'Dalles de sol amiantées (Rez de chaussée - Cuisine) : action corrective de second niveau'
    ]);
    expect(m[0]?.suite).toBe('action-2');
  });

  /*
   * Le garde-fou. Le rapport est plein de phrases générales sur l'amiante ;
   * seules les lignes qui portent une localisation entre parenthèses désignent
   * un matériau réellement repéré.
   */
  it('ne prend pas une phrase d’explication pour un matériau', () => {
    expect(
      materiauxAmiantes([
        'Dans le cadre de mission décrit à l’article 3.2 (voir annexe) les locaux',
        'L’amiante est interdite depuis 1997 en France.'
      ])
    ).toEqual([]);
  });
});

describe('ce que la fiche en dit', () => {
  const diag = analyserAmiante(CONCLUSION, [10, 11]);

  it('nomme le matériau et sa localisation dans le verdict', () => {
    expect(diag.verdict).toMatch(/Conduits de fumée/);
    expect(diag.verdict).toMatch(/1er étage - Terrasse/);
  });

  it('explique ce qu’est une évaluation périodique', () => {
    expect(diag.verdict).toMatch(/tous les trois ans/);
  });
});
