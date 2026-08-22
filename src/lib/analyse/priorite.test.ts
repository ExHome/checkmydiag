import { describe, expect, it } from 'vitest';
import type { PosteDeperditionChiffre } from '../ademe/consultation';
import { lireEnveloppe } from './enveloppe';
import { lireFicheTechnique } from './ficheTechnique';
import { parOuCommencer, porteeDuLot, prioriserLesTravaux } from './priorite';
import { lireTravaux } from './travaux';

/** Les parts réelles d'un DPE, telles que la fiche ADEME les donne. */
const CHIFFRES: PosteDeperditionChiffre[] = [
  { poste: 'Le renouvellement d’air', wParK: 760.9, part: 0.348 },
  { poste: 'Les murs', wParK: 593, part: 0.271 },
  { poste: 'Les ponts thermiques', wParK: 454.4, part: 0.208 },
  { poste: 'Le plancher bas', wParK: 254.1, part: 0.116 },
  { poste: 'Le plafond, la toiture', wParK: 83.5, part: 0.038 },
  { poste: 'Les fenêtres', wParK: 28.6, part: 0.013 },
  { poste: 'Les portes', wParK: 13.7, part: 0.006 }
];

const RAPPORT = [
  'Recommandations d ’ amélioration de la performance',
  'Les travaux essentiels Montant estimé : 8300 à 12500 €',
  'Lot Description Performance recommandée',
  'Isolation des murs par l’intérieur.',
  'R > 3,7 m².K/W',
  'Mur',
  'Faire intervenir un professionnel de l’isolation.',
  'Les travaux à',
  'envisager',
  'Montant estimé : 14200 à 21300 €',
  'Lot Description Performance recommandée',
  'Remplacer le système de chauffage.',
  'Chauffage SCOP = 4',
  'Faire intervenir un plombier chauffagiste.',
  'Fiche technique du logement',
  'Enveloppe',
  'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
  'Surface du mur Observé / mesuré 34,20 m²',
  'Mur 1 Nord Type d’adjacence Observé / mesuré l’extérieur',
  'Isolation Observé / mesuré non'
];

const lu = () => {
  const fiche = lireFicheTechnique(RAPPORT);
  return prioriserLesTravaux(lireTravaux(RAPPORT).packs, lireEnveloppe(fiche), CHIFFRES);
};

describe('par où commencer', () => {
  /*
   * Le remplacement de la colonne « économie estimée », qui n'existe nulle part.
   * Ici, la part vient de la fiche ADEME et la consigne du rapport : deux
   * données lues, jointes par une addition.
   */
  it('relie un travail à la part de pertes qu’il touche', () => {
    const mur = lu().find((t) => t.lot === 'Mur');
    expect(mur?.portee).toEqual({ genre: 'part', part: 0.271, poste: 'Les murs' });
    expect(mur?.performance).toBe('R > 3,7 m².K/W');
  });

  /*
   * Changer une chaudière ne réduit aucune déperdition : le logement perd
   * toujours autant, on change la façon dont on compense. Ce n'est pas une
   * donnée manquante, c'est la physique — et l'écran doit le dire.
   */
  it('distingue « ne touche pas l’enveloppe » de « on ne sait pas »', () => {
    expect(porteeDuLot('Chauffage', CHIFFRES)).toEqual({ genre: 'hors enveloppe' });
    expect(porteeDuLot('Eau chaude sanitaire', CHIFFRES)).toEqual({ genre: 'hors enveloppe' });
    /* Sans fiche ADEME, on ne sait pas — et on ne fait pas semblant. */
    expect(porteeDuLot('Mur', [])).toEqual({ genre: 'inconnue' });
    expect(porteeDuLot(null, CHIFFRES)).toEqual({ genre: 'inconnue' });
  });

  /*
   * « Portes et fenêtres » est un seul lot du rapport et deux postes de
   * l'ADEME : on les additionne, ce qui reste une somme de valeurs lues.
   */
  it('additionne les postes quand un lot en couvre deux', () => {
    const p = porteeDuLot('Portes et fenêtres', CHIFFRES);
    expect(p.genre).toBe('part');
    if (p.genre === 'part') {
      expect(p.part).toBeCloseTo(0.013 + 0.006, 6);
      expect(p.poste).toBe('Les fenêtres et Les portes');
    }
  });

  it('n’invente aucune part pour un lot qu’il ne connaît pas', () => {
    expect(porteeDuLot('Chose inconnue', CHIFFRES)).toEqual({ genre: 'inconnue' });
  });

  /* Le travail est relié aux parois qu'il concerne, telles que le rapport les décrit. */
  it('rattache le travail aux parois du logement', () => {
    const mur = lu().find((t) => t.lot === 'Mur');
    expect(mur?.parois.map((p) => p.nom)).toEqual(['Mur 1 Nord']);
    expect(mur?.parois[0]?.isolation).toBe('nonIsole');
  });

  /* On garde la hiérarchie du rapport : c'est lui qui ordonne, pas nous. */
  it('conserve le pack et son montant', () => {
    const t = lu();
    expect(t[0]).toMatchObject({ priorite: 1, montantDuPack: '8300 à 12500 €' });
    expect(t[1]).toMatchObject({ priorite: 2, montantDuPack: '14200 à 21300 €' });
  });

  it('désigne le travail qui touche la plus grosse part', () => {
    expect(parOuCommencer(lu())?.lot).toBe('Mur');
  });

  /* Sans part connue nulle part, on ne désigne personne au hasard. */
  it('ne désigne rien quand aucune part n’est connue', () => {
    const fiche = lireFicheTechnique(RAPPORT);
    const sansAdeme = prioriserLesTravaux(lireTravaux(RAPPORT).packs, lireEnveloppe(fiche), []);
    expect(parOuCommencer(sansAdeme)).toBeNull();
  });
});
