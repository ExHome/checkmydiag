import { describe, expect, it } from 'vitest';
import { lireEnveloppe } from './enveloppe';
import { lireFicheTechnique } from './ficheTechnique';
import { chercherLesContradictions } from './pointsAVerifier';
import { ceQuiEstDejaBien, pourquoiCetteNote } from './pourquoi';
import { lireSystemes } from './systemes';

/**
 * Un logement qui porte les deux moitiés de l'histoire : un grand plancher non
 * isolé, un mur isolé, une fenêtre en simple vitrage au milieu de doubles, et
 * aucune ventilation mécanique.
 */
const RAPPORT = [
  'Vue d ’ ensemble du logement',
  'Murs Mur en pierre avec isolation intérieure donnant sur l’extérieur',
  'Portes et fenêtres Fenêtres battantes pvc, double vitrage',
  'Vue d ’ ensemble des équipements',
  'Chauffage Panneau rayonnant électrique',
  'Ventilation Ventilation par ouverture des fenêtres',
  'Fiche technique du logement',
  'Enveloppe',
  'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
  'Surface du mur Observé / mesuré 28,60 m²',
  'Mur 1 Sud Type d’adjacence Observé / mesuré l’extérieur',
  'Matériau mur Observé / mesuré Mur en pierre',
  'Isolation Observé / mesuré oui',
  'Epaisseur isolant Observé / mesuré 10 cm',
  'Surface de plancher bas Observé / mesuré 62,40 m²',
  'Plancher Type d’adjacence Observé / mesuré un terre-plein',
  'Type de pb Observé / mesuré Dalle béton',
  'Isolation Observé / mesuré non',
  'Surface de baies Observé / mesuré 2,10 m²',
  'Fenêtre 1 Nord Type menuiserie Observé / mesuré Bois',
  'Type de vitrage Observé / mesuré simple vitrage',
  'Surface de baies Observé / mesuré 3,60 m²',
  'Fenêtre 2 Sud Type menuiserie Observé / mesuré PVC',
  'Type de vitrage Observé / mesuré double vitrage',
  'Systèmes',
  'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
  'Type de ventilation Observé / mesuré Ventilation par ouverture des fenêtres',
  'Ventilation Energie utilisée Observé / mesuré Néant'
];

const lire = () => {
  const fiche = lireFicheTechnique(RAPPORT);
  return {
    enveloppe: lireEnveloppe(fiche),
    systemes: lireSystemes(RAPPORT, fiche)
  };
};

describe('pourquoi cette note', () => {
  /*
   * L'ordre n'est pas un pourcentage : c'est la surface déperditive que le
   * rapport donne. Le plancher de 62 m² passe donc devant la fenêtre de 2 m².
   */
  it('classe les causes par la surface concernée, jamais par un pourcentage inventé', () => {
    const { enveloppe, systemes } = lire();
    const causes = pourquoiCetteNote(enveloppe, systemes);
    expect(causes[0]?.titre).toContain('Plancher');
    expect(causes[0]?.surface).toBe(62.4);
    expect(causes.map((c) => c.surface)).toEqual([...causes.map((c) => c.surface)].sort((a, b) => b - a));
  });

  it('nomme la fenêtre en simple vitrage, sans la fondre dans les autres', () => {
    const { enveloppe, systemes } = lire();
    const causes = pourquoiCetteNote(enveloppe, systemes);
    expect(causes.some((c) => c.titre === 'Fenêtre 1 Nord est en simple vitrage')).toBe(true);
    expect(causes.some((c) => c.titre.includes('Fenêtre 2 Sud'))).toBe(false);
  });

  it('signale l’absence de ventilation mécanique', () => {
    const { enveloppe, systemes } = lire();
    expect(
      pourquoiCetteNote(enveloppe, systemes).some((c) => c.genre === 'ventilation')
    ).toBe(true);
  });

  /* Chaque cause porte sa preuve : sans elle, on ne pourrait pas dire d'où elle vient. */
  it('donne à chaque cause la donnée qui la fonde', () => {
    const { enveloppe, systemes } = lire();
    for (const c of pourquoiCetteNote(enveloppe, systemes)) expect(c.preuve).not.toBe('');
  });

  it('ne dit rien d’un rapport dont on n’a rien pu lire', () => {
    const fiche = lireFicheTechnique([]);
    expect(pourquoiCetteNote(lireEnveloppe(fiche), lireSystemes([], fiche))).toEqual([]);
  });

  /* « Plancher n'est pas isolée » se fait relire deux fois : le nom commande l'accord. */
  it('accorde la phrase au nom que le rapport donne', () => {
    const { enveloppe, systemes } = lire();
    const causes = pourquoiCetteNote(enveloppe, systemes);
    expect(causes.some((c) => c.titre === 'Plancher n’est pas isolé')).toBe(true);
    expect(causes.some((c) => c.titre.endsWith('isolée'))).toBe(false);
  });

  /* On dit aussi ce qui va bien : un écran qui n'énumère que les défauts n'est plus cru. */
  it('énumère ce qui est déjà performant', () => {
    const { enveloppe, systemes } = lire();
    const bons = ceQuiEstDejaBien(enveloppe, systemes);
    expect(bons.some((b) => b.titre === 'Mur 1 Sud est isolé')).toBe(true);
    expect(bons.some((b) => b.titre.includes('double ou triple vitrage'))).toBe(true);
  });
});

describe('les points à vérifier', () => {
  /*
   * Le résumé annonce du double vitrage, l'annexe décrit une baie en simple :
   * on montre les deux, on ne tranche pas.
   */
  it('signale le double vitrage annoncé alors qu’il reste du simple', () => {
    const { enveloppe, systemes } = lire();
    const points = chercherLesContradictions(RAPPORT, enveloppe, systemes);
    const p = points.find((x) => x.titre.includes('double vitrage'));
    expect(p).toBeTruthy();
    expect(p?.dUnCote).toContain('simple vitrage');
    expect(p?.deLAutre).toContain('double vitrage');
    expect(p?.question).toBeTruthy();
  });

  it('ne conclut jamais qu’un rapport est faux', () => {
    const { enveloppe, systemes } = lire();
    for (const p of chercherLesContradictions(RAPPORT, enveloppe, systemes)) {
      expect(p.titre.toLowerCase()).not.toContain('erreur');
      expect(p.titre.toLowerCase()).not.toContain('faux');
    }
  });

  /*
   * Le rapport affirme l'absence de renouvelable et décrit une pompe à chaleur :
   * la contradiction est réelle, et elle change les aides auxquelles on a droit.
   */
  it('relève une énergie renouvelable niée par le rapport', () => {
    const lignes = [
      'Ce logement n’est pas encore équipé de systèmes de',
      'production d’énergie renouvelable.',
      'Fiche technique du logement',
      'Systèmes',
      'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
      'Type d’installation de chauffage Observé / mesuré Installation simple',
      'Type générateur Observé / mesuré Pompe à chaleur air/eau',
      'Chauffage 1 Type émetteur Observé / mesuré Radiateur basse température'
    ];
    const fiche = lireFicheTechnique(lignes);
    const points = chercherLesContradictions(
      lignes,
      lireEnveloppe(fiche),
      lireSystemes(lignes, fiche)
    );
    expect(points.some((p) => p.deLAutre.includes('pompe à chaleur'))).toBe(true);
  });

  it('reste muet quand tout concorde', () => {
    const lignes = [
      'Fiche technique du logement',
      'Enveloppe',
      'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
      'Surface du mur Observé / mesuré 20,00 m²',
      'Mur 1 Sud Type d’adjacence Observé / mesuré l’extérieur',
      'Isolation Observé / mesuré oui'
    ];
    const fiche = lireFicheTechnique(lignes);
    expect(
      chercherLesContradictions(lignes, lireEnveloppe(fiche), lireSystemes(lignes, fiche))
    ).toEqual([]);
  });
});
