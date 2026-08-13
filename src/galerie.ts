import './app.css';
import { mount } from 'svelte';
import Galerie from './Galerie.svelte';

const cible = document.getElementById('app');
if (!cible) throw new Error('#app introuvable');

export default mount(Galerie, { target: cible });
