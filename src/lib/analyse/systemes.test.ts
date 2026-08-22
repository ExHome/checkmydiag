import { describe, expect, it } from 'vitest';
import { lireFicheTechnique } from './ficheTechnique';
import { indicesRenouvelables, lireSystemes, lireVueDEnsemble } from './systemes';

/**
 * La vue d'ensemble des équipements, copiée du corpus à la ligne près.
 *
 * Deux générateurs de chauffage, dont l'étiquette « Chauffage » tombe entre les
 * deux ; une eau chaude dont l'étiquette porte déjà son texte. C'est la
 * configuration qui cassait.
 */
const VUE = [
  'Vue d ’ ensemble des équipements',
  'description',
  'Panneau rayonnant électrique NFC, NF** et NF*** avec programmateur pièce par pièce (système',
  'individuel)',
  'Chauffage',
  'Radiateur électrique à fluide caloporteur (modélisé comme un radiateur NFC, NF** et NF***) avec',
  'programmateur pièce par pièce (système individuel)',
  'Eau chaude sanitaire Ballon électrique à accumulation vertical (catégorie B), contenance ballon 200 L',
  'Climatisation Néant',
  'Ventilation VMC SF Hygro B avant 2001 (collective)',
  'Pilotage',
  'Avec intermittence pièce par pièce avec minimum de température',
  'Recommandations de gestion et d ’ entretien des équipements'
];

describe('les systèmes du logement', () => {
  it('retrouve les cinq postes de la vue d’ensemble, dans l’ordre du rapport', () => {
    expect(lireVueDEnsemble(VUE).map((p) => p.poste)).toEqual([
      'Chauffage',
      'Eau chaude sanitaire',
      'Climatisation',
      'Ventilation',
      'Pilotage'
    ]);
  });

  /*
   * Le défaut mesuré : « programmateur pièce par pièce (système individuel) »
   * suit le chauffage d'une ligne et précède l'eau chaude d'une ligne. Il
   * appartient au chauffage — l'étiquette de l'eau chaude porte déjà son texte,
   * donc sa rangée fait une ligne et n'attire rien.
   */
  it('ne laisse pas une ligne du chauffage tomber dans l’eau chaude', () => {
    const vue = lireVueDEnsemble(VUE);
    const ecs = vue.find((p) => p.poste === 'Eau chaude sanitaire');
    const chauffage = vue.find((p) => p.poste === 'Chauffage');
    expect(ecs?.description).toBe(
      'Ballon électrique à accumulation vertical (catégorie B), contenance ballon 200 L'
    );
    expect(chauffage?.description).toContain('Panneau rayonnant');
    expect(chauffage?.description).toContain('Radiateur électrique à fluide caloporteur');
  });

  it('restitue « Néant » plutôt que de conclure à l’absence', () => {
    const s = lireSystemes(VUE, lireFicheTechnique([]));
    expect(s.climatisation).toBe('Néant');
    expect(s.pilotage).toBe('Avec intermittence pièce par pièce avec minimum de température');
  });

  /*
   * Le §10 : deux systèmes, deux fiches. La fiche technique les sépare, la vue
   * d'ensemble les raconte — on garde les deux sans les fusionner.
   */
  it('garde tous les générateurs de chauffage', () => {
    const fiche = lireFicheTechnique([
      'Fiche technique du logement',
      'Systèmes',
      'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
      'Type d’installation de chauffage Observé / mesuré Installation de chauffage simple',
      'Type générateur Observé / mesuré Electrique - Panneau rayonnant électrique',
      'Chauffage 1 Energie utilisée Observé / mesuré Electrique',
      'Type émetteur Observé / mesuré Panneau rayonnant électrique',
      'Type d’installation de chauffage Observé / mesuré Installation de chauffage simple',
      'Type générateur Observé / mesuré Electrique - Radiateur à fluide caloporteur',
      'Chauffage 2 Energie utilisée Observé / mesuré Electrique',
      'Type émetteur Observé / mesuré Radiateur à fluide caloporteur'
    ]);
    const s = lireSystemes([], fiche);
    expect(s.chauffage).toHaveLength(2);
    expect(s.chauffage[0]?.nom).toBe('Chauffage 1');
    expect(s.chauffage[1]?.type).toContain('fluide caloporteur');
  });

  it('lit l’eau chaude avec son volume et sa production', () => {
    const fiche = lireFicheTechnique([
      'Fiche technique du logement',
      'Systèmes',
      'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
      'Type de production Observé / mesuré accumulation',
      'Eau chaude sanitaire Volume de stockage Observé / mesuré 200 L',
      'Energie utilisée Observé / mesuré Electrique'
    ]);
    const ecs = lireSystemes([], fiche).eauChaude[0];
    expect(ecs?.volume).toBe('200 L');
    expect(ecs?.production).toBe('accumulation');
  });

  it('sait quand il n’y a aucune ventilation mécanique', () => {
    const fiche = lireFicheTechnique([
      'Fiche technique du logement',
      'Systèmes',
      'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
      'Type de ventilation Observé / mesuré Ventilation par ouverture des fenêtres',
      'Ventilation Energie utilisée Observé / mesuré Néant'
    ]);
    expect(lireSystemes([], fiche).ventilation?.mecanique).toBe(false);
  });

  /*
   * Le mot « bois » traîne partout dans un DPE — menuiseries, volets, solives.
   * Une recherche large aurait trouvé un chauffage au bois dans chaque logement.
   */
  it('ne prend pas une menuiserie bois pour un chauffage au bois', () => {
    expect(indicesRenouvelables(['Fenêtre bois double vitrage'])).toEqual([]);
    expect(indicesRenouvelables(['Plafond sous solives bois'])).toEqual([]);
    expect(indicesRenouvelables(['Poêle à bois bûches'])).toContain('bois');
    expect(indicesRenouvelables(['Pompe à chaleur air/eau'])).toContain('pompe à chaleur');
  });

  /*
   * Le §14 : l'affirmation du rapport est restituée telle quelle, et l'absence
   * d'affirmation reste `null` — on ne conclut pas à partir d'un silence.
   */
  it('distingue « le rapport dit qu’il n’y en a pas » de « le rapport n’en parle pas »', () => {
    const avec = lireSystemes(
      ['Ce logement n’est pas encore équipé de systèmes de', 'production d’énergie renouvelable.'],
      lireFicheTechnique([])
    );
    expect(avec.renouvelables.declarees).toBe(false);
    expect(lireSystemes([], lireFicheTechnique([])).renouvelables.declarees).toBeNull();
  });
});
