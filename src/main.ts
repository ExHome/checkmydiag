import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';

const cible = document.getElementById('app');
if (!cible) throw new Error('#app introuvable');

export default mount(App, { target: cible });
