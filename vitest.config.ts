import { defineConfig } from 'vitest/config';

// Les tests portent sur du TypeScript pur — le moteur d'analyse, le corpus de
// la rubrique, les outils de build : pas besoin du plugin Svelte ni de
// l'environnement navigateur.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts']
  }
});
