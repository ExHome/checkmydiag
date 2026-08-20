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

/**
 * Le tableau de synthèse ne ponctue pas ses cellules.
 *
 * Extrait fidèle de la page 3 d'un DDT de janvier 2025. La conclusion de
 * l'électricité tient sur une ligne, sans point final ; celle de l'état des
 * risques la suit immédiatement, et son intitulé de prestation — « Etat des
 * Risques et / Pollutions » — n'arrive que six lignes plus bas, coupé en deux
 * au milieu de son propre texte.
 *
 * Recollées jusqu'au premier point, ces lignes n'en faisaient qu'une, longue de
 * trois cents caractères, contenant « électricité » avant « état des risques ».
 * Le premier motif l'emportait : neuf verdicts électriques sur trois cent
 * trente-deux parlaient d'arrêté préfectoral.
 */
const SYNTHESE_SANS_POINTS = [
  'Prestations Conclusion',
  'Électricité L’installation intérieure d’électricité ne comporte aucune anomalie',
  'L’Etat des Risques délivré par SARL DGLM EXPERTISES en date du',
  '06/01/2025 fait apparaître que la commune dans laquelle se trouve le bien',
  'fait l’objet d’un arrêté préfectoral n°33 - 2019 - 07 - 23 - 004 en date du',
  '23/07/2019 en matière d’obligation d’Information Acquéreur Locataire sur',
  'les Risques Naturels, Miniers et Technologiques.'
];

describe('deux cellules voisines restent deux conclusions', () => {
  const blocs = lireSynthese(SYNTHESE_SANS_POINTS);

  it('rend à l’électricité sa seule conclusion', () => {
    const elec = conclusionDe(blocs, 'electricite');
    expect(elec).toMatch(/ne comporte aucune anomalie/);
    expect(elec).not.toMatch(/arrêté préfectoral|Risques Naturels/);
  });

  it('rend à l’état des risques la sienne, qui lui était prise', () => {
    const erp = conclusionDe(blocs, 'erp');
    expect(erp).toMatch(/arrêté préfectoral/);
  });

  it('ne laisse pas le verdict électrique enfler', () => {
    // Trois cents caractères, c'était la coupure d'abrègement : le verdict
    // faisait exactement la longueur maximale, signe qu'il débordait.
    expect(conclusionDe(blocs, 'electricite')!.length).toBeLessThan(120);
  });
});

/**
 * La raison sociale n'est pas un pied de page.
 *
 * Le filtre qui retire l'ourlet répété de chaque page reconnaissait « SARL »
 * seul. Or la conclusion de l'état des risques s'ouvre sur « L'Etat des Risques
 * délivré par SARL DGLM EXPERTISES en date du… » : sa première ligne était
 * jetée, et le reste de la phrase, devenu orphelin, se recollait au volet
 * précédent.
 */
describe('le pied de page et ce qui lui ressemble', () => {
  const vraiPied = [
    'Prestations Conclusion',
    'Électricité L’installation intérieure d’électricité ne comporte aucune anomalie',
    'SARL DGLM EXPERTISES |76 COURS PORTAL 33000 BORDEAUX| Tél. : 06.72.70.03.38',
    'RCS : Bordeaux B 891 287 070 | MMA 114.231.812'
  ];

  it('retire l’ourlet répété de chaque page', () => {
    const elec = conclusionDe(lireSynthese(vraiPied), 'electricite');
    expect(elec).not.toMatch(/RCS|COURS PORTAL|MMA/);
  });

  it('garde la phrase qui ne fait que nommer le cabinet', () => {
    const blocs = lireSynthese([
      'Prestations Conclusion',
      'L’Etat des Risques délivré par SARL DGLM EXPERTISES en date du',
      '06/01/2025 fait apparaître que la commune est concernée par le risque sismique.'
    ]);
    expect(conclusionDe(blocs, 'erp')).toMatch(/L’Etat des Risques délivré par/);
  });
});
