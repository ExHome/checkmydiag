/**
 * AUCUN CARACTÈRE DE CONTRÔLE DANS LE CODE — et surtout pas le backspace.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * LE DÉFAUT QUE CE TEST EXISTE POUR EMPÊCHER, TROUVÉ LE 22/08/2026
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Une limite de mot d'expression régulière — `\b` — écrite depuis un outil qui
 * interprète les échappements devient **le caractère backspace** (U+0008). Le
 * fichier a l'air juste à la lecture ; l'expression, elle, ne correspond plus
 * jamais à rien.
 *
 *     /score\s*3\b/i      devient      /score\s*3\x08/i
 *
 * **Vingt-sept occurrences ont été trouvées dans treize fichiers**, dont
 * quatre expressions régulières bel et bien mortes :
 *
 *   · `analyse/risques.ts` — `/\boui\b\s*\W{0,4}\s*\bnon\b/` : le détecteur de
 *     formulaires à cases ne pouvait pas déclencher ;
 *   · `analyse/securite.ts` — `/^\s*l'ensemble\b/` : la pluralité « l'ensemble »
 *     ne se lisait jamais, sur le volet électricité ;
 *   · `lecteurs/plomb/liciel.ts` — `/^\s*6\s*\.\s*1\b/` : une borne de rubrique ;
 *   · `charte.test.ts` — `/--trait\b/` : **le test de la charte lui-même.**
 *
 * Ce dernier est le plus instructif. Sa règle — « le sauge n'est plus une
 * couleur de structure », posée le 20/08 — dormait depuis. Réparée, elle a
 * trouvé en une seconde `Bureau.svelte:819 : --trait: #a6c39a`.
 *
 * ⚠️ **Un test dont l'expression est cassée ne dit pas qu'il est cassé : il
 * dit que tout va bien.** C'est la pire des pannes, et elle ne se voit pas en
 * relisant le code. Elle se voit ici, en comptant les octets.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Les caractères de contrôle qu'aucune source n'a de raison de porter. */
const INTERDITS: { readonly code: number; readonly nom: string; readonly voulu: string }[] = [
  { code: 8, nom: 'backspace (U+0008)', voulu: '\\b — limite de mot' },
  { code: 12, nom: 'form feed (U+000C)', voulu: '\\f' },
  { code: 11, nom: 'vertical tab (U+000B)', voulu: '\\v' },
  { code: 0, nom: 'nul (U+0000)', voulu: '\\0' }
];

function sources(dossier: string, out: string[] = []): string[] {
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) {
      sources(chemin, out);
      continue;
    }
    /* Les sondes jetables (`*.local.ts`) ne partent pas dans le dépôt. */
    if (/\.local\.[tm]?js$|\.local\.ts$/.test(nom)) continue;
    if (/\.(ts|svelte|css|js|mjs)$/.test(nom)) out.push(chemin);
  }
  return out;
}

describe('les caractères de contrôle', () => {
  const fichiers = [...sources('src'), ...sources('scripts')];

  it('lit bien tout le code du produit', () => {
    /* Un test qui ne trouve aucun fichier passe toujours : on le prouve. */
    expect(fichiers.length).toBeGreaterThan(200);
  });

  for (const { code, nom, voulu } of INTERDITS) {
    it(`⚠️ aucun ${nom} — un ${voulu} mal écrit tue l’expression sans rien dire`, () => {
      const coupables: string[] = [];
      for (const f of fichiers) {
        const texte = readFileSync(f, 'utf8');
        if (!texte.includes(String.fromCharCode(code))) continue;
        const ligne = texte.split('\n').findIndex((l) => l.includes(String.fromCharCode(code))) + 1;
        coupables.push(`${f}:${ligne}`);
      }
      expect(coupables, `à remplacer par « ${voulu} »`).toEqual([]);
    });
  }
});
