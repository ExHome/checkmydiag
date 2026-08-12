import { defineConfig } from 'vitest/config';

// Les tests ne portent que sur le moteur d'analyse (TypeScript pur) : pas besoin
// du plugin Svelte ni de l'environnement navigateur.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts']
  }
});
