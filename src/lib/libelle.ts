/**
 * Le verdict en trois mots, tiré des données du rapport.
 *
 * Partagé entre les tuiles du bilan et le voyant du lecteur : c'est la même
 * phrase, et elle doit l'être — sinon le lecteur croit lire deux choses.
 */
import type { Diagnostic } from './modele';

export function libelleCourt(d: Diagnostic): string {
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
}
