/** Point d'entrée du banc de l'accueil. Développement seulement — voir BancAccueil.svelte. */
import '../app.css';
import { mount } from 'svelte';
import BancAccueil from './BancAccueil.svelte';
import { installerLeRendu } from './lumiere/rendu';

installerLeRendu();

const cible = document.getElementById('app');
if (!cible) throw new Error('#app introuvable');

export default mount(BancAccueil, { target: cible });
