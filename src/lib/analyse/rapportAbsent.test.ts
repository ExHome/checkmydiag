/**
 * Quand le dossier annonce un diagnostic sans joindre son rapport.
 *
 * Mesuré sur 140 dossiers : 21 constats amiante sur 49 n'existent que par leur
 * ligne de synthèse. C'est ce qui explique à lui seul le taux de « constats
 * sans date » — ils n'en ont pas parce que le document qui la porte est ailleurs.
 */
import { describe, expect, it } from 'vitest';
import { analyser } from './index';
import type { PageTexte } from '../lignes';

/* Une page de synthèse seule : elle conclut sur l'amiante sans le rapport. */
const DOSSIER: PageTexte[] = [
  {
    numero: 1,
    lignes: [
      'Résumé de l’expertise n° 24/IMO/0045N',
      'Cette page de synthèse ne peut être utilisée indépendamment du rapport d’expertise complet.',
      'Prestations Conclusion',
      'Constat amiante avant-vente',
      'Il n’a pas été repéré de matériaux ou produits de la liste A contenant de l’amiante.',
      'Etat Termite/Parasitaire',
      'Il n’a pas été repéré d’indice d’infestation de termites.'
    ]
  },
  {
    numero: 2,
    lignes: [
      'Etat relatif à la présence de termites n° 24/IMO/0045N',
      'Date du repérage : 05/07/2024',
      'Rapport du :',
      '05/07/2024',
      'D. - Identification des bâtiments visités',
      'Rez de chaussée',
      'Séjour Sol - Carrelage Absence d’indices d’infestation de termites',
      'E. – Catégories de termites en cause :',
      'Il n’a pas été repéré d’indice d’infestation de termites.'
    ]
  }
];

describe('un diagnostic annoncé mais non joint', () => {
  const lu = analyser(DOSSIER);
  const amiante = lu.diagnostics.find((d) => d.type === 'amiante');

  it('existe quand même : sa conclusion vaut mieux que rien', () => {
    expect(amiante).toBeDefined();
    expect(amiante?.verdict).toMatch(/amiante/i);
  });

  it('dit d’où vient sa conclusion', () => {
    expect(amiante?.origine).toBe('synthese');
  });

  it('dit que le rapport manque, et ce que cela coûte', () => {
    const dit = (amiante?.releves ?? []).map((r) => r.libelle).join(' ');
    expect(dit).toMatch(/ne figure pas dans le PDF/i);
    expect(dit).toMatch(/la date/);
    expect(dit).toMatch(/réserves/i);
  });

  it('n’invente pas de date pour autant', () => {
    expect(amiante?.date).toBeUndefined();
  });
});

describe('un diagnostic dont le rapport EST joint', () => {
  const lu = analyser(DOSSIER);
  const termites = lu.diagnostics.find((d) => d.type === 'termites');

  it('ne porte pas la mention du rapport manquant', () => {
    const dit = (termites?.releves ?? []).map((r) => r.libelle).join(' ');
    expect(dit).not.toMatch(/ne figure pas dans le PDF/i);
  });

  it('garde la date lue dans son rapport', () => {
    expect(termites?.date).toBe('05/07/2024');
  });
});
