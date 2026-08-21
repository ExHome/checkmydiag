import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { nuls } from './scripts/plugin-nuls';

// Base relative : le site doit pouvoir être servi depuis n'importe quel
// sous-dossier (GitHub Pages, /diag/, ouverture locale…).
export default defineConfig({
  base: './',
  plugins: [svelte(), nuls()],
  server: { port: 5181 },
  build: { target: 'es2022' }
});
