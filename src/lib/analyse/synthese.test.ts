import { describe, expect, it } from 'vitest';
import { conclusionDe, graviteDe, lireSynthese } from './synthese';

/**
 * Page de synthèse d'un dossier réel, anonymisée. La mise en page est
 * reproduite telle quelle : l'intitulé de la colonne de gauche tombe au milieu
 * de la phrase de droite, et parfois en tête de ligne.
 */
const PAGE = [
  'Prestations Conclusion',
  'Lors de la présente mission il n’a pas été repéré de revêtements contenant',
  'CREP',
  'du plomb au-delà des seuils en vigueur.',
  'Dans le cadre de la mission, il a été repéré des matériaux et produits',
  'Amiante',
  'contenant de l’amiante.',
  'Etat Termite/Parasitaire',
  'Il n’a pas été repéré d’indice d’infestation de termites.',
  'L’installation comporte des anomalies de type A1, A2 qui devront être',
  'Gaz réparées dans les meilleurs délais.',
  '(norme 2022)',
  'L’installation intérieure d’électricité comporte une ou des anomalies pour',
  'Électricité laquelle ou lesquelles il est vivement recommandé d’agir afin d’éliminer les',
  'dangers qu’elle(s) présente(nt).',
  'SARL EXEMPLE EXPERTISES |76 COURS EXEMPLE 33000 BORDEAUX| Tél. : 00.00.00.00.00',
  'RCS : Bordeaux B 000 000 000 | MMA 000.000.000'
];

describe('page de synthèse', () => {
  const blocs = lireSynthese(PAGE);

  it('rattache chaque conclusion à son diagnostic', () => {
    const types = blocs.map((b) => b.type).sort();
    expect(types).toEqual(['amiante', 'electricite', 'gaz', 'plomb', 'termites']);
  });

  it('recolle les phrases coupées par l’intitulé de colonne', () => {
    expect(conclusionDe(blocs, 'plomb')).toBe(
      'Lors de la présente mission il n’a pas été repéré de revêtements contenant du plomb au-delà des seuils en vigueur.'
    );
  });

  it('lit la gravité sans se laisser piéger par les négations', () => {
    const gravite = (type: Parameters<typeof conclusionDe>[1]) =>
      graviteDe(conclusionDe(blocs, type) ?? '');

    expect(gravite('plomb')).toBe('bon');
    expect(gravite('termites')).toBe('bon');
    expect(gravite('amiante')).toBe('attention');
    // Des anomalies A1/A2 sont à réparer, mais ce n'est pas un danger immédiat.
    expect(gravite('gaz')).toBe('attention');
    expect(gravite('electricite')).toBe('attention');
  });

  it('ne prend pas « aucune anomalie » pour une anomalie', () => {
    expect(graviteDe('L’installation intérieure d’électricité ne comporte aucune anomalie')).toBe('bon');
  });

  it('refuse de conclure quand la synthèse liste les conclusions possibles', () => {
    const formulaire = lireSynthese([
      'Prestations Conclusion',
      'L’installation comporte des anomalies de type A1 qui devront être',
      'Gaz réparées ultérieurement.',
      'L’installation comporte des anomalies de type A2 qui devront être',
      'réparées dans les meilleurs délais.',
      'L’installation comporte des anomalies de type DGI qui devront être',
      'réparées avant remise en service.'
    ]);
    // Aucune case n'est lisible : mieux vaut ne rien dire qu'annoncer un DGI.
    expect(conclusionDe(formulaire, 'gaz')).toBeNull();
  });

  it('réserve l’alerte aux dangers immédiats', () => {
    expect(
      graviteDe('L’installation comporte des anomalies de type DGI qui devront être réparées avant remise en service.')
    ).toBe('alerte');
  });
});
