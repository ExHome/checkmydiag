import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * L'ATELIER NE DOIT JAMAIS ENTRER DANS LE BUNDLE PUBLIC.
 *
 * Décision d'Aude du 21/08/2026 : l'atelier ne doit pas être visible. Sur un
 * site statique, le cacher derrière un code ne suffit pas — le composant serait
 * dans le fichier que tout visiteur télécharge, et le code y est lisible. La
 * seule protection réelle est qu'il ne soit pas compilé.
 *
 * Mesuré au build : `npm run build` ne laisse aucune trace de l'atelier dans
 * `dist/` ; `VITE_ATELIER=1 npm run build` y ajoute `AtelierDeTravail-*.js`.
 *
 * Ce test tient la règle sans relancer un build de vingt secondes : il vérifie
 * la seule chose qui puisse la casser — qu'on soit revenu à un import statique,
 * ou qu'on ait retiré la garde. Un import statique rendrait l'atelier public au
 * premier déploiement, sans que rien ne le signale.
 */
const APP = readFileSync('src/App.svelte', 'utf8');

describe('l’atelier reste hors du bundle public', () => {
  it('n’est jamais importé statiquement', () => {
    expect(APP).not.toMatch(/^\s*import\s+\w+\s+from\s+['"].*AtelierDeTravail\.svelte['"]/m);
  });

  it('n’est chargé que derrière la garde de build', () => {
    /* L'import dynamique existe… */
    expect(APP).toMatch(/import\(['"]\.\/composants\/AtelierDeTravail\.svelte['"]\)/);
    /* …et rien ne l'appelle sans avoir vérifié VITE_ATELIER d'abord. */
    const gardes = APP.match(/import\.meta\.env\.VITE_ATELIER/g) ?? [];
    expect(gardes.length).toBeGreaterThan(0);
    const avantGarde = APP.slice(0, APP.indexOf('import.meta.env.VITE_ATELIER'));
    expect(avantGarde).not.toMatch(/ouvrirAtelier\(\)\s*;/);
  });
});
