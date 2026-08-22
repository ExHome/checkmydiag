/** Banc de l'écran termites. Développement seulement — voir termites.html. */
import '../../app.css';
import { mount } from 'svelte';
import BancTermites from './BancTermites.svelte';
import { installerLeRendu } from '../lumiere/rendu';

installerLeRendu();
const cible = document.getElementById('app');
if (!cible) throw new Error('#app introuvable');
export default mount(BancTermites, { target: cible });
