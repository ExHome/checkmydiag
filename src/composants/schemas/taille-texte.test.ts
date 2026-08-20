import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * LES JETONS DE TAILLE NE SERVENT PAS DANS UN SVG.
 *
 * `--t-petit` vaut 14px. Écrit sur un `<text>`, ce ne sont pas 14 pixels
 * d'écran : ce sont 14 UNITÉS DU viewBox. Un schéma qui déclare
 * `viewBox="0 0 460 …"` et s'affiche sur 291 px applique un facteur 0,63 — le
 * texte sort à 8,8 px.
 *
 * Mesure faite à l'écran avant correction : 41 textes SVG sur 44 étaient sous
 * 11 px, dont six à 8,4. C'est là, plus que dans les couleurs, que se jouait le
 * « trop admin » : un schéma couvert de micro-texte se lit comme un plan
 * technique, pas comme une interface.
 *
 * Ce test garde la règle : dans un bloc de style SVG — reconnaissable à son
 * `fill:` —, la taille s'écrit en unités du viewBox, jamais avec un jeton du
 * design system.
 *
 * Sont visés les jetons de texte HTML : `--t-petit`, `--t-micro`, `--t-base`,
 * `--t-lead`, `--t-titre`. Une variable propre au dessin — `--t-clip`, que
 * ClipDessin expose pour que son hôte règle la taille selon SON viewBox — est
 * au contraire la bonne façon de faire, et ne doit pas être signalée.
 */

const DOSSIERS = ['schemas', 'visuels', 'plans', 'savoir'];

/** Un bloc CSS et son corps. */
const blocs = (source: string): string[] =>
  [...source.matchAll(/\n {2}[.\w][^{\n]*\{([^{}]*)\}/g)].map((m) => m[1] ?? '');

const fichiers = DOSSIERS.flatMap((d) => {
  const dossier = new URL(`../${d}/`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
  try {
    return readdirSync(dossier)
      .filter((f) => f.endsWith('.svelte'))
      .map((f) => ({ nom: `${d}/${f}`, source: readFileSync(join(dossier, f), 'utf8') }));
  } catch {
    return [];
  }
});

describe('la taille des textes de schéma', () => {
  it('trouve bien les composants à contrôler', () => {
    expect(fichiers.length).toBeGreaterThan(20);
  });

  it.each(fichiers.map((f) => [f.nom, f.source] as const))(
    '%s : aucun jeton de taille dans un bloc SVG',
    (_nom, source) => {
      const fautifs = blocs(source).filter(
        (b) =>
          b.includes('fill:') &&
          /font-size:\s*var\(--t-(?:petit|micro|base|lead|titre)/.test(b)
      );
      expect(fautifs).toEqual([]);
    }
  );
});
