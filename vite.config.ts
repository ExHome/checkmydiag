import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { nuls } from './scripts/plugin-nuls';

/*
 * LES BANCS SONT CONSTRUITS, ET C'EST VOULU.
 *
 * Sans entrée déclarée, Vite ne construit que `index.html` : les bancs des
 * mini-apps vivaient donc en local seulement, et il fallait un serveur de
 * développement pour les regarder. Un écran qu'on ne peut montrer qu'en
 * partageant son écran n'est pas montrable.
 *
 * Ils ne sont liés depuis nulle part — on y accède par leur URL, et par elle
 * seule. C'est ce qui permet de VOIR une mini-app en ligne avant qu'elle ne
 * remplace la carte du flux principal.
 *
 * La liste se lit sur le disque : un banc ajouté est construit sans qu'on
 * pense à l'inscrire ici.
 */
const PAGES = readdirSync(import.meta.dirname).filter((f) => f.endsWith('.html'));

// Base relative : le site doit pouvoir être servi depuis n'importe quel
// sous-dossier (GitHub Pages, /diag/, ouverture locale…).
export default defineConfig({
  base: './',
  plugins: [svelte(), nuls()],
  server: { port: 5181 },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: Object.fromEntries(
        PAGES.map((f) => [f.replace(/\.html$/, ''), resolve(import.meta.dirname, f)])
      )
    }
  }
});
