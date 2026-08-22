/** Banc de l'écran amiante. Développement seulement — voir amiante.html. */
import '../../app.css';
import { mount } from 'svelte';
import BancAmiante from './BancAmiante.svelte';
import { installerLeRendu } from '../lumiere/rendu';

installerLeRendu();
const cible = document.getElementById('app');
if (!cible) throw new Error('#app introuvable');
export default mount(BancAmiante, { target: cible });
