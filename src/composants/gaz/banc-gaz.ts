/** Banc de la mini-app gaz. Développement seulement — voir gaz.html. */
import '../../app.css';
import { mount } from 'svelte';
import BancGaz from './BancGaz.svelte';
import { installerLeRendu } from '../lumiere/rendu';

installerLeRendu();
const cible = document.getElementById('app');
if (!cible) throw new Error('#app introuvable');
export default mount(BancGaz, { target: cible });
