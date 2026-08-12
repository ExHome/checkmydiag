<script lang="ts">
  /**
   * Le verdict en trois mots et un gros picto.
   *
   * « Pas d'amiante ». « Plomb — salle de bain ». C'est ce que le lecteur
   * cherche ; la phrase complète vient après, pour ceux qui la veulent.
   */
  import type { Diagnostic } from '../lib/modele';
  import Picto from './Picto.svelte';

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
    width: 62px;
    height: 62px;
    flex: none;
    border-radius: 18px;
    background: rgb(255 255 255 / 5%);
    border: 1px solid var(--trait);
  }

  .picto {
    padding: 14px;
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
