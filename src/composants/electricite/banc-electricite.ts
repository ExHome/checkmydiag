/** Banc de la mini-app électricité. Développement seulement — voir electricite.html. */
import '../../app.css';
import { mount } from 'svelte';
import BancElectricite from './BancElectricite.svelte';
import { installerLeRendu } from '../lumiere/rendu';

installerLeRendu();
const cible = document.getElementById('app');
if (!cible) throw new Error('#app introuvable');
export default mount(BancElectricite, { target: cible });
