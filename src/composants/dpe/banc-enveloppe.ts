/** Point d'entrée du banc de l'enveloppe. Développement seulement. */
import '../../app.css';
import { mount } from 'svelte';
import BancEnveloppe from './BancEnveloppe.svelte';

const cible = document.getElementById('app');
if (!cible) throw new Error('#app introuvable');

export default mount(BancEnveloppe, { target: cible });
