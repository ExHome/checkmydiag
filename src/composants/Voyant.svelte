<script lang="ts">
  /**
   * Le verdict en trois mots et un gros picto.
   *
   * « Pas d'amiante ». « Plomb — salle de bain ». C'est ce que le lecteur
   * cherche ; la phrase complète vient après, pour ceux qui la veulent.
   */
  import type { Diagnostic } from '../lib/modele';
  import { libelleCourt } from '../lib/libelle';
  import Picto from './Picto.svelte';

  const { diagnostic }: { diagnostic: Diagnostic } = $props();

  const libelle = $derived(libelleCourt(diagnostic));
</script>

<div class="voyant {diagnostic.gravite}">
  <span class="picto" aria-hidden="true">
    <Picto type={diagnostic.type} />
  </span>

  <div class="dit">
    <p class="libelle">{libelle}</p>
    <p class="type">{diagnostic.titre}</p>
  </div>
</div>

<style>
  .voyant {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .picto {
    display: grid;
    place-items: center;
    width: 82px;
    height: 82px;
    flex: none;
    border-radius: 50%;
    font-size: 40px;
    background: radial-gradient(circle at 32% 26%, #e9d2a5, #c09048 60%, #a3762f);
    box-shadow:
      inset 0 -3px 8px rgb(0 0 0 / 22%),
      inset 0 2px 3px rgb(255 255 255 / 45%);
  }

  /* Le verdict est posé sur le vert : il prend le crème, et la gravité passe
     par une pastille, pas par la couleur du texte — un rouge sombre sur vert
     sombre ne se lit pas. */
  .libelle {
    margin: 0;
    font-family: var(--police-titre);
    font-size: clamp(1.3rem, 3.4vw, 1.65rem);
    font-weight: 500;
    letter-spacing: -0.022em;
    line-height: 1.1;
    color: var(--sur-fond);
  }

  .type {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 5px 0 0;
    font-size: 0.76rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sur-fond-doux);
  }

  .type::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gravite, var(--gris));
    flex: none;
  }

  .bon {
    --gravite: #4c9c72;
  }
  .attention {
    --gravite: #c98a2e;
  }
  .alerte {
    --gravite: #c0503c;
  }
</style>
