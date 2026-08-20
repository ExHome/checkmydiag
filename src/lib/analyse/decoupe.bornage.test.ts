import { describe, expect, it } from 'vitest';
import { decouper } from './decoupe';
import type { PageTexte } from '../lignes';

/**
 * Le dossier qui donne lui-même le bornage de ses volets.
 *
 * Un générateur du corpus porte deux compteurs en pied de chaque feuille : la
 * position de la page dans son VOLET, et sa position dans le DOSSIER.
 *
 *     DIAGNOSTIC DPE : 2 sur 11
 *     DDT : 11 sur 33
 *
 * Aucun autre éditeur ne fait cela. C'est le bornage que la découpe cherche à
 * deviner partout ailleurs — et il était perdu pour quatre volets sur six.
 *
 * ## Les quatre libellés que la première version ne voyait pas
 *
 * Elle exigeait un deux-points et un mot d'ouverture. Sur un DDT réel de
 * trente-trois pages, cela ne laissait passer que le DPE et l'attestation
 * Carrez. Les libellés sont recopiés du dossier.
 */
const contact = 'Tel : 05 56 00 00 00 - Mail : cabinet@reseau.fr - Web : cabinet.reseau.fr';

/** Une feuille du dossier : du texte, puis le pied à deux compteurs. */
const feuille = (numero: number, pied: string, dossier: string): PageTexte => ({
  numero,
  lignes: [
    'Cabinet de diagnostics immobiliers',
    ...Array.from({ length: 20 }, (_, i) => `Ligne ${i} du corps de la page.`),
    `${contact} ${pied}`,
    dossier,
    'Siret : 000000000'
  ]
});

describe('le bornage donné par la double pagination', () => {
  it('reconnaît les libellés sans deux-points', () => {
    /* « DIAGNOSTIC TERMITES 1 sur 4 » et « DIAGNOSTIC PLOMB 1 sur 8 » : le
       générateur pose le deux-points sur certains volets, pas sur d'autres. */
    const pages = [
      feuille(1, 'DIAGNOSTIC TERMITES 1 sur 2', 'DDT : 4 sur 8'),
      feuille(2, 'DIAGNOSTIC TERMITES 2 sur 2', 'DDT : 5 sur 8'),
      feuille(3, 'DIAGNOSTIC PLOMB 1 sur 2', 'DDT : 6 sur 8'),
      feuille(4, 'DIAGNOSTIC PLOMB 2 sur 2', 'DDT : 7 sur 8')
    ];
    const types = decouper(pages).sections.map((s) => s.type);
    expect(types).toContain('termites');
    expect(types).toContain('plomb');
  });

  it('reconnaît les libellés sans mot d’ouverture', () => {
    /* « AMIANTE (DTA) » et « ERP » n'ouvrent ni par DIAGNOSTIC, ni par
       ATTESTATION, ni par RAPPORT. */
    const pages = [
      feuille(1, 'AMIANTE (DTA) : 1 sur 2', 'DDT : 1 sur 4'),
      feuille(2, 'AMIANTE (DTA) : 2 sur 2', 'DDT : 2 sur 4'),
      feuille(3, 'ERP : 1 sur 2', 'DDT : 3 sur 4'),
      feuille(4, 'ERP : 2 sur 2', 'DDT : 4 sur 4')
    ];
    const types = decouper(pages).sections.map((s) => s.type);
    expect(types).toContain('amiante');
    expect(types).toContain('erp');
  });

  it('garde les onze pages du DPE au lieu d’une seule', () => {
    /*
     * Le cas qui a fait écrire cette lecture : un DPE de onze pages ramené à
     * une, parce que ses pages ne répètent pas leur titre — elles répètent le
     * nom du cabinet.
     */
    const pages = Array.from({ length: 11 }, (_, i) =>
      feuille(i + 1, `DIAGNOSTIC DPE : ${i + 1} sur 11`, `DDT : ${i + 10} sur 33`)
    );
    const dpe = decouper(pages).sections.find((s) => s.type === 'dpe');
    expect(dpe?.pages).toHaveLength(11);
  });

  it('ne prend pas le compteur du dossier pour un volet', () => {
    /*
     * « DDT : 11 sur 33 » dit où en est la feuille dans le dossier entier. S'il
     * comptait comme une déclaration de volet, chaque page en ouvrirait un.
     */
    const pages = Array.from({ length: 3 }, (_, i) => ({
      numero: i + 1,
      lignes: [
        'Dossier de Diagnostic Technique',
        ...Array.from({ length: 20 }, (_, j) => `Ligne ${j} de la page de garde.`),
        `${contact} DDT : ${i + 1} sur 33`
      ]
    }));
    expect(decouper(pages).sections).toHaveLength(0);
  });

  it('lit le pied de page d’une feuille dense', () => {
    /*
     * La déclaration n'était cherchée que dans les douze premières lignes. Ce
     * générateur l'imprime en pied. Sur une page de soixante lignes, elle était
     * écrite noir sur blanc et invisible.
     */
    const dense: PageTexte = {
      numero: 1,
      lignes: [
        ...Array.from({ length: 60 }, (_, i) => `Ligne ${i} d’un tableau de mesures.`),
        `${contact} DIAGNOSTIC PLOMB 1 sur 1`,
        'DDT : 6 sur 33'
      ]
    };
    expect(decouper([dense]).sections.map((s) => s.type)).toEqual(['plomb']);
  });

  it('n’ouvre pas de volet sur une phrase qui finit par « n sur m »', () => {
    /*
     * L'ancrage en fin de ligne suffit tant que le libellé est en capitales.
     * Une phrase ordinaire ne doit rien déclencher.
     */
    const pages = [
      {
        numero: 1,
        lignes: [
          'Rapport de visite',
          ...Array.from({ length: 20 }, () => 'Le logement a été visité en totalité.'),
          'Le contrôle a porté sur les pièces habitables, soit 3 sur 5',
          'Ce constat ne vaut que pour les parties accessibles.'
        ]
      }
    ];
    expect(decouper(pages).sections).toHaveLength(0);
  });
});
