/** Point d'entrée du banc de lumière. Développement seulement — voir Banc.svelte. */
import '../../app.css';
import { mount } from 'svelte';
import Banc from './Banc.svelte';
import { installerLeRendu } from './rendu';

installerLeRendu();

const cible = document.getElementById('app');
if (!cible) throw new Error('#app introuvable');

export default mount(Banc, { target: cible });
