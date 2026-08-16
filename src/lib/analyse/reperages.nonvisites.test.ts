/**
 * La rubrique 1.2 du constat amiante : ce qu'on n'a pas pu regarder.
 *
 * Mesuré sur 28 constats du corpus : 24 la portent, et le moteur n'en tirait
 * rien. Les lignes ci-dessous sont recopiées de rapports réels, avec leur
 * tableau à trois colonnes et sa première colonne qui déborde sur cinq lignes.
 */
import { describe, expect, it } from 'vitest';
import { analyserAmiante, nonVisitesAmiante } from './reperages';

const RUBRIQUE = [
  '1.2. Dans le cadre de mission décrit à l’article 3.2 les locaux ou parties de locaux,',
  'composants ou parties de composants qui n’ont pu être visités et pour lesquels des',
  'investigations complémentaires sont nécessaires afin de statuer sur la présence ou',
  'l’absence d’amiante :',
  'Localisation Parties du local Raison',
  '2ème étage - Combles Toutes Absence de trappe de visite',
  'Localisation Parties du local Raison',
  'Rez de chaussée - Salon / Séjour, Rez de chaussée',
  '- Cuisine / Salle à manger, Rez de jardin - Chambre 1,',
  'Mur Revetement fixé',
  'Rez de jardin - Stockage - Encombrement trop important',
  '2. – Le(s) laboratoire(s) d’analyses',
  'Raison sociale et nom de l’entreprise : ... Il n’a pas été fait appel à un laboratoire d’analyse'
];

describe('les locaux non visités du constat amiante', () => {
  const releves = nonVisitesAmiante(RUBRIQUE);

  it('lit la ligne complète du tableau : où, quoi, pourquoi', () => {
    const combles = releves.find((r) => /trappe/i.test(r.libelle));
    expect(combles?.ou).toBe('2ème étage - Combles');
    expect(combles?.libelle).toMatch(/Absence de trappe de visite/i);
  });

  it('lit la ligne dont la localisation a débordé plus haut', () => {
    /* Il ne reste que « Mur Revetement fixé » : on relève le composant et le
       motif, sans prétendre reconstituer les quinze pièces. */
    const mur = releves.find((r) => /fix/i.test(r.libelle));
    expect(mur?.ou).toBe('Mur');
    expect(mur?.libelle).toMatch(/Rev[êe]tement fix/i);
  });

  it('s’arrête au chapitre suivant', () => {
    expect(releves.some((r) => /laboratoire/i.test(r.libelle))).toBe(false);
  });

  it('ne répète pas le même motif à chaque page du tableau', () => {
    const doublons = [...RUBRIQUE, 'Mur Revetement fixé', 'Mur Revetement fixé'];
    const compte = nonVisitesAmiante(doublons).filter((r) => /fix/i.test(r.libelle)).length;
    expect(compte).toBe(1);
  });

  it('ne dit rien quand la rubrique est absente', () => {
    expect(nonVisitesAmiante(['Constat de repérage Amiante', 'Liste A : il n’a pas été repéré'])).toEqual([]);
  });

  it('ne prend pas une ligne sans motif d’empêchement', () => {
    /* Une ligne de tableau ordinaire n'est pas un local non visité. */
    const avecBruit = [...RUBRIQUE.slice(0, 5), 'Rez de chaussée - Séjour Sol Carrelage', ...RUBRIQUE.slice(5)];
    expect(nonVisitesAmiante(avecBruit).some((r) => /carrelage/i.test(r.libelle))).toBe(false);
  });
});

describe('la conséquence que le rapport en tire', () => {
  const AVEC_CONSEQUENCE = [
    'Constat de repérage Amiante n° 24/IMO/0045N',
    'Date du repérage : 05/07/2024',
    'Liste A : Dans le cadre de mission décrit à l’article 3.2, il n’a pas été repéré',
    '- de matériaux ou produits de la liste A contenant de l’amiante.',
    ...RUBRIQUE,
    'Certains locaux, parties de locaux ou composants n’ont pas pu être sondés, des investigations',
    'approfondies doivent être réalisées afin d’y vérifier la présence éventuelle d’amiante. Les obligations',
    'règlementaires du (des) propriétaire(s) prévues aux articles R.1334-15 à R.1334-18 du Code de la',
    'Santé Publique, ne sont pas remplies conformément aux dispositions de l’article 3 de l’arrêté du 12',
    'Décembre 2012 (Listes "A" et "B"). De ce fait le vendeur reste responsable au titre des vices cachés',
    'en cas de présence d’Amiante.'
  ];

  it('remonte la phrase du rapport sur les vices cachés', () => {
    const diag = analyserAmiante(AVEC_CONSEQUENCE, [41, 60]);
    const dit = (diag.releves ?? []).map((r) => r.libelle).join(' ');
    expect(dit).toMatch(/vices cachés/i);
    expect(dit).toMatch(/ne le protège pas sur ce qu’il n’a pas pu voir/i);
  });

  it('ne l’invente pas quand le rapport ne la porte pas', () => {
    const sans = AVEC_CONSEQUENCE.filter((l) => !/vices cach|obligations/i.test(l));
    const diag = analyserAmiante(sans, [41, 60]);
    const dit = (diag.releves ?? []).map((r) => r.libelle).join(' ');
    expect(dit).not.toMatch(/vices cachés/i);
    /* Les locaux non visités, eux, restent signalés. */
    expect(dit).toMatch(/trappe de visite/i);
  });
});
