/**
 * Le squelette réglementaire des rapports.
 *
 * Les lignes de ces tests sont recopiées de volets réels du corpus, avec leurs
 * variantes d'éditeur — celles-là mêmes qui rendaient les recherches par motif
 * si fragiles.
 */
import { describe, expect, it } from 'vitest';
import { pagesDuDpe, rubrique, rubriquesDe } from './rubriques';

const GAZ = [
  'Etat de l’installation intérieure de gaz n° 24/IMO/0045N',
  'A. - Désignation du ou des bâtiments',
  'Adresse : 13 rue de Bruges',
  'D. — Identification des appareils',
  'Chaudière murale — Cuisine',
  'E. – Anomalies identifiées',
  'A2 — Robinet de commande non accessible',
  'H. - Conclusion',
  'L’installation ne comporte pas d’anomalie.',
  '2 / 14'
];

describe('le découpage en rubriques', () => {
  const parties = rubriquesDe(GAZ);

  it('retrouve chaque partie de l’arrêté', () => {
    expect(parties.map((r) => r.repere)).toEqual(['A', 'D', 'E', 'H']);
  });

  it('donne à chaque rubrique ce qu’elle contient, et rien de plus', () => {
    const anomalies = parties.find((r) => r.repere === 'E');
    expect(anomalies?.lignes).toEqual(['A2 — Robinet de commande non accessible']);
  });

  it('ne prend pas un pied de page pour une rubrique', () => {
    /* « 2 / 14 » ressemble à un numéro suivi d'un séparateur : c'est la
       pagination du rapport, pas une partie de l'arrêté. */
    expect(parties.some((r) => /^\d+$/.test(r.titre))).toBe(false);
  });

  it('laisse hors rubrique ce qui précède la première', () => {
    expect(parties[0]?.debut).toBe(1);
  });
});

describe('chercher par l’intitulé, jamais par le numéro', () => {
  it('trouve les anomalies du gaz', () => {
    const r = rubrique(GAZ, 'gaz', 'anomalies');
    expect(r?.repere).toBe('E');
    expect(r?.lignes[0]).toMatch(/Robinet de commande/);
  });

  /*
   * La raison d'être de tout ce fichier.
   *
   * Onze états termites du corpus intervertissent H et I : les constatations
   * diverses et les moyens d'investigation échangent leur lettre. Dix-neuf
   * rapports d'électricité numérotent « Matériels électriques » en 5, neuf en 6.
   * Une recherche par numéro se serait trompée à chaque fois.
   */
  it('suit l’intitulé quand l’éditeur change les lettres', () => {
    const habituel = ['H. - Constatations diverses :', 'Néant', 'I. - Moyens d’investigation utilisés :', 'Sondage manuel'];
    const inverse = ['H. - Moyens d’investigation utilisés :', 'Sondage manuel', 'I. - Constatations diverses :', 'Néant'];

    expect(rubrique(habituel, 'termites', 'moyens')?.repere).toBe('I');
    expect(rubrique(inverse, 'termites', 'moyens')?.repere).toBe('H');
    /* Dans les deux cas, c'est bien le sondage qu'on rapporte. */
    expect(rubrique(habituel, 'termites', 'moyens')?.lignes[0]).toMatch(/Sondage/);
    expect(rubrique(inverse, 'termites', 'moyens')?.lignes[0]).toMatch(/Sondage/);
  });

  it('suit l’intitulé quand l’électricité renumérote', () => {
    const cinq = ['5. Matériels électriques', 'Prise de terre absente'];
    const six = ['6. Matériels électriques', 'Prise de terre absente'];
    expect(rubrique(cinq, 'electricite', 'materiels')?.repere).toBe('5');
    expect(rubrique(six, 'electricite', 'materiels')?.repere).toBe('6');
  });

  it('distingue une rubrique ABSENTE d’une rubrique vide', () => {
    /* La nuance a coûté cher sur le gaz : une rubrique d'anomalies présente et
       vide vaut « aucune anomalie » — un résultat. Absente, elle ne vaut rien. */
    expect(rubrique(['A. - Désignation du ou des bâtiments'], 'gaz', 'anomalies')).toBeNull();
    const vide = rubrique(['E. – Anomalies identifiées', 'H. - Conclusion'], 'gaz', 'anomalies');
    expect(vide).not.toBeNull();
    expect(vide?.lignes).toEqual([]);
  });

  /*
   * Ce qui empêche de confondre deux diagnostics n'est PAS cette fonction.
   *
   * « Conclusion » est un intitulé réglementaire du gaz ET du CREP : chercher
   * la conclusion du plomb dans un volet gaz la trouve, forcément. C'est le
   * DÉCOUPAGE EN SECTIONS qui garantit qu'on ne mélange rien — chaque
   * extracteur ne reçoit que les lignes de son propre volet.
   *
   * Une correction du gaz s'était posée sur l'électricité ce matin, faute de
   * cette discipline. La garde est en amont, et il faut le dire plutôt que de
   * laisser croire que ce fichier la porte.
   */
  it('ne prétend pas distinguer les diagnostics : c’est la section qui le fait', () => {
    const conclusionDuGaz = rubrique(GAZ, 'gaz', 'conclusion');
    expect(conclusionDuGaz?.repere).toBe('H');
    /* Le même intitulé existe au CREP : posée sur ces lignes-ci, la recherche
       plomb tombe sur la conclusion du gaz. D'où la règle : on ne donne à un
       extracteur que les lignes de SA section. */
    expect(rubrique(GAZ, 'plomb', 'conclusion')?.repere).toBe('H');
  });
});

describe('le DPE, paginé plutôt que numéroté', () => {
  const DPE = [
    'DPE Diagnostic de performance énergétique (logement) p. 3',
    'Montants et consommations annuels d’énergie',
    'chauffage Gaz Naturel 8 885',
    'DPE Diagnostic de performance énergétique (logement) p. 5',
    'Recommandations d’amélioration de la performance',
    'Les travaux essentiels'
  ];

  it('range chaque ligne sous sa page', () => {
    const pages = pagesDuDpe(DPE);
    expect([...pages.keys()]).toEqual([3, 5]);
    expect(pages.get(3)?.[0]).toMatch(/Montants et consommations/);
    expect(pages.get(5)?.[1]).toMatch(/travaux essentiels/);
  });

  it('ne range rien tant qu’aucune page n’est annoncée', () => {
    expect(pagesDuDpe(['Diagnostic de performance', 'Etabli le : 05/07/2024']).size).toBe(0);
  });
});
