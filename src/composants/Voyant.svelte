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
    <p class="type muet">{diagnostic.titre}</p>
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

  .libelle {
    margin: 0;
    font-size: clamp(1.3rem, 3.4vw, 1.7rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  .bon .libelle {
    color: var(--ok);
  }
  .attention .libelle {
    color: var(--attention);
  }
  .alerte .libelle {
    color: var(--alerte);
  }

  .type {
    margin: 2px 0 0;
    font-size: 0.9rem;
  }
</style>
