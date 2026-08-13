/**
 * La charte des schémas.
 *
 * Il y avait trois codes couleur pour la même pastille de verdict, et le
 * lecteur devait le réapprendre à chaque dessin. Ces tests empêchent la
 * récidive : un schéma ne redéfinit ni la pastille, ni la palette.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DOSSIER = 'src/composants/schemas';

const schemas = readdirSync(DOSSIER)
  .filter((n) => n.endsWith('.svelte') && n !== 'Verdict.svelte' && n !== 'Explicatif.svelte')
  .map((n) => ({ nom: n, source: readFileSync(join(DOSSIER, n), 'utf8') }));

describe('la charte des schémas', () => {
  it('trouve les schémas', () => {
    expect(schemas.length).toBeGreaterThan(5);
  });

  it('laisse la pastille de verdict à Verdict.svelte', () => {
    const rebelles = schemas
      .filter(({ source }) => /^\s*\.verdict[\s.{]/m.test(source))
      .map(({ nom }) => nom);
    expect(rebelles).toEqual([]);
  });

  /**
   * Les couleurs en dur avaient donné aux termites une palette à eux. Les
   * dégradés d'étiquette réglementaire (A→G) restent permis : ce sont les
   * couleurs de l'arrêté, elles ne s'inventent pas.
   */
  it('n’invente pas de couleur hors palette', () => {
    const ETIQUETTE = /^#(?:319834|33cc31|cbfc34|fbfe06|fbcc05|fc9935|fc0205)$/i;
    const fautifs: string[] = [];

    for (const { nom, source } of schemas) {
      const couleurs = [...source.matchAll(/#[0-9a-f]{6}\b/gi)].map((m) => m[0]);
      const hors = couleurs.filter((c) => !ETIQUETTE.test(c));
      if (hors.length) fautifs.push(`${nom} : ${[...new Set(hors)].join(', ')}`);
    }

    expect(fautifs).toEqual([]);
  });

  /**
   * Trois schémas dessinaient trois maisons différentes. Elles viennent
   * maintenant de la même brique — un seul endroit décide de la silhouette.
   */
  it('ne redessine pas la maison dans un schéma', () => {
    const rebelles = schemas
      .filter(({ source }) => /^\s*\.(?:toit|facade)\s*\{/m.test(source))
      .map(({ nom }) => nom);
    expect(rebelles).toEqual([]);
  });
});
