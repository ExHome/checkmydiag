/**
 * L'aiguillage : nommer l'éditeur AVANT de lire, et le dire quand on ne sait pas.
 */
import { describe, expect, it } from 'vitest';
import { aiguiller, signaturesQuiRepondent } from './socle';
import { LECTEURS_CREP, lireLesUnites } from './plomb';

/** L'en-tête de colonnes qui signe le format LICIEL, et une unité derrière. */
const VOLET_LICIEL = [
  'N° Zone Unité de diagnostic Substrat Revêtement apparent Localisation mesure Etat* de conservation Classement UD Observation',
  '2 mesure 1 5,27 Etat d’usage (Traces',
  'B Plinthes Bois Peinture 2',
  '3 mesure 2 3,54 de chocs)'
];

/** Un CREP d'un autre outil : mêmes notions, autre mise en page. */
const VOLET_ETRANGER = [
  'CONSTAT DE RISQUE D’EXPOSITION AU PLOMB',
  'Pièce : séjour — Élément : plinthe — Concentration : 5,27 mg/cm² — Classe : 2',
  'Pièce : séjour — Élément : mur nord — Concentration : 0,89 mg/cm² — Classe : 0'
];

describe('l’aiguillage par éditeur', () => {
  it('reconnaît le format LICIEL et le nomme', () => {
    const lu = lireLesUnites(VOLET_LICIEL);
    expect(lu.etat).toBe('lu');
    if (lu.etat !== 'lu') return;
    expect(lu.editeur).toBe('LICIEL');
    /* La preuve est citable : c'est l'endroit qui a permis de nommer. */
    expect(lu.preuve).toMatch(/Unité de diagnostic/i);
    expect(lu.valeur).toHaveLength(1);
  });

  it('déclare « format inconnu » plutôt que de rafistoler', () => {
    /*
     * Le document parle bien de plomb, de classes et de concentrations. Un
     * lecteur unique élargi finirait par en tirer quelque chose — et ce
     * quelque chose serait l'habitude de LICIEL appliquée à un autre outil.
     */
    const lu = lireLesUnites(VOLET_ETRANGER);
    expect(lu.etat).toBe('format inconnu');
    if (lu.etat !== 'format inconnu') return;
    expect(lu.quoi).toBe('CREP');
    /* On dit ce qui a été essayé : un trou se déclare, il ne se comble pas. */
    expect(lu.essayes).toEqual(['LICIEL']);
  });

  it('n’a qu’une seule signature qui répond par document', () => {
    /*
     * Deux signatures sur un même document voudrait dire que l'une est trop
     * large. Ça se corrige dans la signature, jamais en jouant sur l'ordre de
     * la liste — d'où ce contrôle.
     */
    expect(signaturesQuiRepondent(LECTEURS_CREP, VOLET_LICIEL)).toEqual(['LICIEL']);
    expect(signaturesQuiRepondent(LECTEURS_CREP, VOLET_ETRANGER)).toEqual([]);
  });

  it('rend « format inconnu » sans lecteur, plutôt que de choisir au hasard', () => {
    const lu = aiguiller([], VOLET_LICIEL);
    expect(lu.etat).toBe('format inconnu');
  });
});
