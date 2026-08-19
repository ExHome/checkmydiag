import { describe, expect, it } from 'vitest';
import { decouper } from './decoupe';
import type { PageTexte } from '../lignes';

const page = (numero: number, ...lignes: string[]): PageTexte => ({ numero, lignes });

/**
 * Un dossier tel qu'on en rencontre : un rapport termites de trois pages, puis
 * la paperasse du dossier — assurance, facture, certificat — qui ne porte le
 * titre d'aucun diagnostic.
 */
const DOSSIER = [
  page(1, 'État relatif à la présence de termites', 'Numéro de dossier 12345'),
  page(2, 'État relatif à la présence de termites', 'Parties visitées : séjour, cuisine'),
  page(3, 'État relatif à la présence de termites', 'Il n’a pas été repéré d’indice d’infestation de termites.'),
  page(4, 'Attestation d’assurance responsabilité civile', 'Police n° 000'),
  page(5, 'Facture', 'Total TTC'),
  page(6, 'Certificat de compétence', 'Valable jusqu’au 01/01/2030')
];

describe('la fin d’une section', () => {
  /*
   * Le défaut mesuré sur quarante dossiers : une section absorbait toute page
   * dont l'en-tête n'était pas reconnu, sans jamais s'arrêter. Dix-sept
   * sections dépassaient vingt pages, la plus grande en comptait
   * quatre-vingt-trois. Un état termites en gagnait quarante-neuf.
   */
  it('s’arrête quand la page ne porte plus la trace du rapport', () => {
    const { sections } = decouper(DOSSIER);
    const termites = sections.find((s) => s.type === 'termites');

    expect(termites).toBeDefined();
    expect(termites?.plage).toEqual([1, 3]);
    expect(termites?.pages).toHaveLength(3);
  });

  it('laisse la paperasse hors de tout diagnostic', () => {
    const { sections, horsSection } = decouper(DOSSIER);

    expect(sections).toHaveLength(1);
    expect(horsSection.join(' ')).toMatch(/Facture/);
    expect(horsSection.join(' ')).toMatch(/assurance/i);
  });

  it('ne fait pas déborder la conclusion d’un rapport sur le suivant', () => {
    const { sections } = decouper(DOSSIER);
    const termites = sections.find((s) => s.type === 'termites');

    expect(termites?.lignes.join(' ')).toMatch(/infestation de termites/);
    expect(termites?.lignes.join(' ')).not.toMatch(/Facture|Certificat/);
  });
});

describe('les pages qui énumèrent sans rapporter', () => {
  /*
   * Le défaut le plus visible du produit, mesuré sur quarante dossiers : treize
   * fabriquaient une fiche « Termites — sa conclusion n'a pas pu être lue »
   * alors qu'aucun état termites ne figurait au dossier. La page fautive est un
   * bordereau : elle nomme deux diagnostics et tient en une vingtaine de
   * lignes. Après correction, les termites passent de 38 % à 100 % de
   * conclusions lues, sans qu'aucun autre diagnostic ne bouge.
   */
  const BORDEREAU = [
    'Bordereau de remise des documents',
    'État relatif à la présence de termites',
    'Diagnostic de performance énergétique',
    'Remis au client le 12/03/2024',
    'Signature'
  ];

  it('n’ouvre aucun diagnostic sur un bordereau', () => {
    const { sections, horsSection } = decouper([page(1, ...BORDEREAU)]);

    expect(sections).toHaveLength(0);
    expect(horsSection.join(' ')).toMatch(/Bordereau/);
  });

  it('laisse passer une page qui ne nomme qu’un seul diagnostic', () => {
    const attestation = page(
      1,
      'Attestation de surface habitable',
      'Surface : 48,50 m²',
      'Établie le 12/03/2024'
    );

    expect(decouper([attestation]).sections.map((s) => s.type)).toEqual(['carrez']);
  });

  /*
   * Le garde-fou du garde-fou : une vraie première page de rapport cite parfois
   * un autre diagnostic dans son en-tête commercial. Elle porte du texte, elle,
   * et c'est la longueur qui la distingue d'un bordereau.
   */
  it('laisse passer un vrai rapport dont l’en-tête cite une autre prestation', () => {
    const vraiRapport = page(
      1,
      'État relatif à la présence de termites',
      'Cabinet Exemple — diagnostic de performance énergétique, amiante, plomb',
      ...Array.from({ length: 30 }, (_, i) => `Ligne de rapport ${i + 1}`)
    );

    expect(decouper([vraiRapport]).sections.map((s) => s.type)).toEqual(['termites']);
  });
});

describe('ce que la fermeture ne doit pas casser', () => {
  /*
   * Une annexe qui rappelle le titre du rapport lui appartient toujours : c'est
   * ce que le rattachement sans en-tête servait à garder, et la fermeture ne
   * doit pas le reprendre.
   */
  it('garde l’annexe qui rappelle le titre du rapport', () => {
    const avecAnnexe = [
      page(1, 'État relatif à la présence de termites', 'Numéro de dossier'),
      page(2, 'Croquis', 'annexe au rapport état relatif à la présence de termites'),
      page(3, 'Facture', 'Total TTC')
    ];

    const termites = decouper(avecAnnexe).sections.find((s) => s.type === 'termites');
    expect(termites?.plage).toEqual([1, 2]);
  });

  it('ouvre une section neuve quand un autre rapport commence', () => {
    const deuxRapports = [
      page(1, 'État relatif à la présence de termites', 'Constat'),
      page(2, 'État de l’installation intérieure d’électricité', 'Constat'),
      page(3, 'État de l’installation intérieure d’électricité', 'Anomalies')
    ];

    const { sections } = decouper(deuxRapports);
    expect(sections.map((s) => s.type)).toEqual(['termites', 'electricite']);
    expect(sections.find((s) => s.type === 'electricite')?.plage).toEqual([2, 3]);
  });

  it('ne perd pas un rapport qui reprend plus loin dans le dossier', () => {
    const enDeuxFois = [
      page(1, 'État relatif à la présence de termites', 'Constat'),
      page(2, 'Facture', 'Total TTC'),
      page(3, 'État relatif à la présence de termites', 'Croquis des parties visitées')
    ];

    const { sections } = decouper(enDeuxFois);
    const termites = sections.filter((s) => s.type === 'termites');
    expect(termites).toHaveLength(1);
    expect(termites[0]?.plage).toEqual([1, 3]);
  });
});

/**
 * Le volet amiante se fermait après sa deuxième page.
 *
 * Ce générateur répète son titre courant en tête de chaque page — « Constat de
 * repérage Amiante n° … » — et ce titre ne figurait pas parmi les marqueurs.
 * Les neuf pages suivantes, celles qui portent la liste des matériaux et leur
 * état de conservation, partaient donc hors section.
 *
 * Le rapport annonce lui-même sa pagination : « le présent rapport, annexes
 * comprises, est constitué de 11 pages ». C'est la mesure qui a révélé le
 * défaut — vingt volets sur vingt étaient plus courts que ce qu'ils
 * revendiquent, de quinze pages en moyenne ; il en reste un.
 */
describe('le volet amiante et son titre courant', () => {
  const page = (numero: number, ...lignes: string[]) => ({ numero, lignes });

  it('garde les pages qui répètent « Constat de repérage Amiante »', () => {
    const { sections } = decouper([
      page(1, 'Constat de repérage Amiante n° 24/IMO/0154N', 'Rapport de mission de repérage'),
      page(2, 'Constat de repérage Amiante n° 24/IMO/0154N', '1. – Les conclusions'),
      page(3, 'Constat de repérage Amiante n° 24/IMO/0154N', '3. – La mission de repérage'),
      page(4, 'Constat de repérage Amiante n° 24/IMO/0154N', '5. – Résultats détaillés du repérage'),
      page(5, 'Constat de repérage Amiante n° 24/IMO/0154N', 'Dalles de sol (Cuisine)')
    ]);
    const amiante = sections.filter((s) => s.type === 'amiante');
    expect(amiante).toHaveLength(1);
    expect(amiante[0]?.plage).toEqual([1, 5]);
  });

  it('s’arrête quand le rapport suivant commence', () => {
    const { sections } = decouper([
      page(1, 'Constat de repérage Amiante n° 24/IMO/0154N', '1. – Les conclusions'),
      page(2, 'Constat de repérage Amiante n° 24/IMO/0154N', '5. – Résultats détaillés'),
      page(3, 'Etat relatif à la présence de termites n° 24/IMO/0154N', 'A. - Désignation')
    ]);
    expect(sections.find((s) => s.type === 'amiante')?.plage).toEqual([1, 2]);
    expect(sections.find((s) => s.type === 'termites')?.plage).toEqual([3, 3]);
  });
});

/**
 * Le DPE ne répète pas son titre sur ses annexes.
 *
 * La fiche technique du logement — type de bien, année, surfaces, matériaux —
 * n'a pas d'en-tête : ses pages ne se reconnaissent qu'à leur pied,
 * « Dossier : 22/IMO/0549  Page 8 / 11 ». Mesuré avant correction : les 58
 * volets DPE de l'échantillon étaient tous plus courts que la pagination qu'ils
 * annoncent, de près de sept pages. Après : sept.
 */
describe('le DPE et ses annexes', () => {
  const page = (numero: number, ...lignes: string[]) => ({ numero, lignes });

  it('garde la fiche technique, qui n’a pas de titre', () => {
    const { sections } = decouper([
      page(1, 'Diagnostic de performance énergétique (logement)', 'N°ADEME : 2233E0402728W'),
      page(2, 'DPE Diagnostic de performance énergétique (logement) p. 2', 'Schéma des déperditions'),
      page(3, 'DPE / ANNEXES p. 7', 'Fiche technique du logement'),
      page(
        4,
        'Type de local adjacent Observé / mesuré l’extérieur',
        'SARL DGLM EXPERTISES | Tél : 06.72.70.03.38 | Dossier : 22/IMO/0549 Page 8 / 11'
      )
    ]);
    const dpe = sections.filter((s) => s.type === 'dpe');
    expect(dpe).toHaveLength(1);
    expect(dpe[0]?.plage).toEqual([1, 4]);
  });

  it('ne rattache pas une page qui ne porte plus rien du DPE', () => {
    const { sections } = decouper([
      page(1, 'Diagnostic de performance énergétique (logement)', 'N°ADEME : 2233E0402728W'),
      page(2, 'ATTESTATION SUR L’HONNEUR réalisée pour le dossier n° 22/IMO/0549', 'Je soussigné…')
    ]);
    expect(sections.find((s) => s.type === 'dpe')?.plage).toEqual([1, 1]);
  });
});

/**
 * Un générateur qui DÉCLARE son volet, page par page.
 *
 * Celui d'un réseau de diagnostiqueurs écrit en tête de chaque feuille
 * « DIAGNOSTIC DPE : 2 sur 11 » et « DDT : 11 sur 33 » — le type, la position
 * dans le volet, la position dans le dossier. Ses pages ne répètent pas le
 * titre du diagnostic mais le nom du cabinet : la découpe ramenait un DPE de
 * onze pages à une seule.
 */
describe('le rapport qui se déclare', () => {
  const page = (numero: number, ...lignes: string[]) => ({ numero, lignes });
  const entete = (n: number, quoi: string, total: number) => [
    'DGLM EXPERTISES / LE MOINE Thibault membre du réseau BC2E',
    'n° de rapport : 331000048',
    `DIAGNOSTIC ${quoi} : ${n} sur ${total}`,
    'DDT : 11 sur 33'
  ];

  it('suit la déclaration, même sans titre de diagnostic', () => {
    const { sections } = decouper([
      page(1, ...entete(1, 'DPE', 3), 'Consommation'),
      page(2, ...entete(2, 'DPE', 3), 'Déperditions'),
      page(3, ...entete(3, 'DPE', 3), 'Recommandations')
    ]);
    expect(sections.filter((s) => s.type === 'dpe')[0]?.plage).toEqual([1, 3]);
  });

  it('change de volet quand la déclaration change', () => {
    const { sections } = decouper([
      page(1, ...entete(1, 'DPE', 2), 'Consommation'),
      page(2, ...entete(2, 'DPE', 2), 'Déperditions'),
      page(3, 'ATTESTATION LOI CARREZ : 1 sur 1', 'Superficie privative')
    ]);
    expect(sections.find((s) => s.type === 'dpe')?.plage).toEqual([1, 2]);
    expect(sections.find((s) => s.type === 'carrez')?.plage).toEqual([3, 3]);
  });
});

/**
 * L'état des risques dont l'en-tête ne porte plus que la date.
 *
 * Un millésime de décembre 2025 n'écrit plus « Mode EDITION » en tête de ses
 * pages : la première ligne est la date, et rien d'autre ne rappelle le
 * rapport. La section se fermait à la troisième page, et ses conclusions
 * rédigées — celles qui énumèrent les risques du bien — tombaient en page
 * seize, hors de la plage. Un risque sismique s'y perdait.
 */
describe('l’état des risques sans « Mode EDITION »', () => {
  const page = (numero: number, ...lignes: string[]) => ({ numero, lignes });

  it('suit le rapport jusqu’à ses conclusions, grâce au pied de page', () => {
    const { sections } = decouper([
      page(1, 'Etat des Risques et Pollutions', 'Zonage du retrait-gonflement des argiles Oui Aléa Moyen'),
      page(2, '22 décembre 2025', '13 Rue Lhote', 'Réf. 25/IMO/1047N – Page 2 / 17'),
      page(
        3,
        '22 décembre 2025',
        'Conclusions',
        'le BIEN est ainsi concerné par :',
        'Le risque sismique (niveau 2, sismicité Faible)',
        'Réf. 25/IMO/1047N – Page 3 / 17'
      )
    ]);
    const erp = sections.find((s) => s.type === 'erp');
    expect(erp?.plage).toEqual([1, 3]);
    expect(erp?.lignes.join(' ')).toMatch(/risque sismique/i);
  });

  it('s’arrête quand la page ne porte plus rien du rapport', () => {
    const { sections } = decouper([
      page(1, 'Etat des Risques et Pollutions', 'Synthèses'),
      page(2, 'ATTESTATION SUR L’HONNEUR réalisée pour le dossier n° 25/IMO/1047N')
    ]);
    expect(sections.find((s) => s.type === 'erp')?.plage).toEqual([1, 1]);
  });
});

/**
 * La grille des prestations déborde sur une seconde page, et celle-là passait.
 *
 * La page de garde énumère les quarante prestations du cabinet ; sa suite en
 * porte la fin, et ne déclenche qu'un seul marqueur — « Etat des Risques et
 * Pollutions ». Elle ouvrait donc une section d'une page. Mesure : huit
 * dossiers sur quatre-vingt-deux se voyaient fabriquer une fiche d'état des
 * risques à partir de cette ligne, et dans les huit le vrai rapport était
 * absent du dossier.
 */
describe('la suite de la grille des prestations', () => {
  const page = (numero: number, ...lignes: string[]) => ({ numero, lignes });

  const SUITE_DE_GRILLE = page(
    2,
    'Etat parasitaire Etat des Installations gaz Etat des lieux (Loi Scellier)',
    'Etat des Risques et Pollutions Plomb dans l’eau Radon',
    'Etat des lieux Sécurité Incendie Accessibilité Handicapés',
    'Amiante Examen Visuel APTVX Plomb avant travaux Performance numérique',
    'Hôtel C Contrôle levage RT 2012 Avant travaux'
  );

  it('n’ouvre aucune section', () => {
    const { sections } = decouper([
      page(1, 'Dossier Technique Immobilier', 'Numéro de dossier : 24/IMO/0154N'),
      SUITE_DE_GRILLE
    ]);
    expect(sections).toEqual([]);
  });

  it('laisse passer un vrai état des risques', () => {
    const { sections } = decouper([
      page(1, 'Dossier Technique Immobilier'),
      SUITE_DE_GRILLE,
      page(
        3,
        'Etat des Risques et Pollutions',
        'En application des articles L125-5 à 7 et R125-26 du code de l’environnement.',
        'Zonage du retrait-gonflement des argiles Oui Aléa Moyen'
      )
    ]);
    expect(sections.find((s) => s.type === 'erp')?.plage).toEqual([3, 3]);
  });
});
