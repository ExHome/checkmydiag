<script lang="ts">
  /**
   * Le verdict en trois mots et un gros picto.
   *
   * « Pas d'amiante ». « Plomb — salle de bain ». C'est ce que le lecteur
   * cherche ; la phrase complète vient après, pour ceux qui la veulent.
   */
  import type { Diagnostic } from '../lib/modele';

  const { diagnostic }: { diagnostic: Diagnostic } = $props();

  /** Verdict en quelques mots, tiré des données du rapport. */
  const libelle = $derived.by(() => {
    const d = diagnostic;
    const chiffre = (nom: string) => d.faits.find((f) => f.libelle === nom)?.valeur;

    switch (d.type) {
      case 'dpe': {
        const lettre = d.schema?.genre === 'dpe' ? d.schema.finale : null;
        return lettre ? `Classe ${lettre}` : 'Non lisible';
      }
      case 'amiante':
        return d.gravite === 'bon' ? 'Pas d’amiante' : 'Amiante repérée';
      case 'plomb': {
        if (d.schema?.genre !== 'plomb') return d.gravite === 'bon' ? 'Pas de plomb' : 'Plomb';
        const lieux = [...new Set(d.schema.emplacements.map((e) => e.zone.toLowerCase()))];
        if (lieux.length === 0) return d.schema.classes[1] > 0 ? 'Plomb, en bon état' : 'Pas de plomb';
        return `Plomb — ${lieux.slice(0, 2).join(', ')}${lieux.length > 2 ? '…' : ''}`;
      }
      case 'termites':
        return d.gravite === 'bon' ? 'Pas de termites' : 'Termites repérés';
      case 'electricite':
      case 'gaz': {
        const nb = chiffre('Anomalies relevées');
        if (nb === '0') return 'Aucune anomalie';
        if (nb) return `${nb} anomalie${Number(nb) > 1 ? 's' : ''}`;
        return d.gravite === 'bon' ? 'Aucune anomalie' : 'Anomalies';
      }
      case 'carrez':
        return chiffre('Superficie privative') ?? 'Surface';
      case 'erp': {
        const nb = chiffre('Risques concernant le bien');
        return nb ? `${nb} risque${Number(nb) > 1 ? 's' : ''}` : 'Aucun risque';
      }
      case 'assainissement':
        return chiffre('Raccordement') ? 'Tout-à-l’égout' : 'Assainissement';
    }
  });
</script>

<div class="voyant {diagnostic.gravite}">
  <span class="picto" aria-hidden="true">
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      {#if diagnostic.type === 'dpe'}
        <path d="M8 30V16l12-8 12 8v14" />
        <path d="M20 30v-8" />
        <path d="M14 22h12" />
      {:else if diagnostic.type === 'amiante'}
        <path d="M6 26c3-3 5-3 8 0s5 3 8 0 5-3 8 0" />
        <path d="M6 18c3-3 5-3 8 0s5 3 8 0 5-3 8 0" />
      {:else if diagnostic.type === 'plomb'}
        <path d="M12 14h16v16a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V14Z" />
        <path d="M12 14V9h10v5" />
        <path d="M12 22h16" />
      {:else if diagnostic.type === 'termites'}
        <ellipse cx="21" cy="21" rx="8" ry="5" />
        <circle cx="11" cy="21" r="3.4" />
        <path d="M8 18.5 5 16M8 23.5 5 26" />
        <path d="M17 16.5 15.5 12M22 16 22 11M27 17 29 12.5" />
      {:else if diagnostic.type === 'electricite'}
        <path d="M22 5 12 22h8l-2 13 12-18h-8l2-12Z" />
      {:else if diagnostic.type === 'gaz'}
        <path d="M20 34c6 0 10-4 10-9 0-7-7-9-6-16-6 3-9 8-9 12 0 2 1 4 2 5 0-3 1-5 3-6-1 5 0 8 0 8s-2 1-2 3c0 2 1 3 2 3Z" />
      {:else if diagnostic.type === 'erp'}
        <path d="M20 6 35 32H5L20 6Z" />
        <path d="M20 16v8" />
        <path d="M20 28h.01" />
      {:else if diagnostic.type === 'carrez'}
        <rect x="6" y="12" width="28" height="16" rx="2" />
        <path d="M13 12v5M20 12v7M27 12v5" />
      {:else}
        <path d="M20 6c0 8-9 10-9 17a9 9 0 0 0 18 0c0-7-9-9-9-17Z" />
      {/if}
    </svg>
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
    width: 62px;
    height: 62px;
    flex: none;
    border-radius: 18px;
    background: rgb(255 255 255 / 5%);
    border: 1px solid var(--trait);
  }

  .picto svg {
    width: 34px;
    height: 34px;
  }

  .bon .picto {
    color: var(--ok);
    background: rgb(46 233 139 / 12%);
    border-color: rgb(46 233 139 / 35%);
  }

  .attention .picto {
    color: var(--attention);
    background: rgb(255 165 58 / 12%);
    border-color: rgb(255 165 58 / 35%);
  }

  .alerte .picto {
    color: var(--alerte);
    background: rgb(255 95 109 / 12%);
    border-color: rgb(255 95 109 / 35%);
  }

  .neutre .picto {
    color: var(--encre-doux);
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
