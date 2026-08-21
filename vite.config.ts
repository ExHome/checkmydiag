import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { nuls } from './scripts/plugin-nuls';

// Base relative : le site doit pouvoir être servi depuis n'importe quel
// sous-dossier (GitHub Pages, /diag/, ouverture locale…).
export default defineConfig({
  base: './',
  plugins: [svelte(), nuls()],
  server: {
    port: 5181,
    /*
     * L'ATELIER RÉPOND AUSSI SUR SON NOM DE DOMAINE.
     *
     * `atelier.verriere-diag.fr` est un enregistrement DNS qui pointe vers
     * 127.0.0.1 : il ne désigne aucun serveur, il désigne LA MACHINE QUI POSE
     * LA QUESTION. Chez Aude il atteint cet atelier ; chez quiconque d'autre il
     * atteint sa propre machine, où il n'y a rien. Rien n'est hébergé nulle
     * part, donc rien n'est exposé.
     *
     * Deux réglages sont nécessaires pour que ça marche :
     *
     * `allowedHosts` — Vite refuse par défaut toute requête dont l'en-tête Host
     * ne lui est pas connu (protection contre le rebinding DNS). Sans cette
     * ligne, l'adresse répondrait « Blocked request ».
     *
     * `host: '127.0.0.1'` — le serveur n'écoutait qu'en IPv6 (`::1`), donc une
     * résolution IPv4 tombait dans le vide. On écoute explicitement sur la
     * boucle locale IPv4, et SURTOUT PAS sur `true` : ce serait s'ouvrir à tout
     * le réseau local.
     */
    host: '127.0.0.1',
    allowedHosts: ['atelier.verriere-diag.fr', 'localhost', '127.0.0.1']
  },
  build: { target: 'es2022' }
});
