import { describe, expect, it } from 'vitest';
import { transmisALArs } from './plomb';

/**
 * La transmission du constat à l'agence régionale de santé.
 *
 * L'arrêté du 19 août 2011 définit cinq situations de risque ; une seule suffit
 * à déclencher la transmission dans les cinq jours ouvrables (article
 * L. 1334-10 du code de la santé publique).
 *
 * ## Ce que cinquante lectures ont corrigé dans CE fichier
 *
 * La version précédente posait qu'une rubrique 6.5 portant « OUI » était du
 * texte réglementaire décoratif, et attendait `false`. C'était faux, et c'était
 * le défaut le plus grave du lecteur : **le OUI est la réponse.**
 *
 * Trois rapports du corpus ont transmis. Les deux sortis de LICIEL n'écrivent
 * aucune phrase d'action — ils cochent une case. Le lecteur les manquait tous
 * les deux, c'est-à-dire exactement les rapports où la transmission comptait.
 *
 * Fragments anonymisés, recopiés dans l'ordre où l'extraction les rend.
 */

/** 22/IMO/0340 — la réponse en tête de la DEUXIÈME ligne du paragraphe. */
const RUBRIQUE_OUI = [
  '6.5 Transmission du constat à l’agence régionale de santé',
  'Si le constat identifie au moins l’une de ces cinq situations, son auteur transmet, dans un délai de cinq',
  'OUI jours ouvrables, une copie du rapport au directeur général de l’agence régionale de santé',
  'd’implantation du bien expertisé en application de l’article L.1334 - 10 du code de la santé publique.'
];

/** Le même rapport répondu NON : la rubrique est imprimée dans tous les cas. */
const RUBRIQUE_NON = RUBRIQUE_OUI.map((l) => l.replace(/^OUI /, 'NON '));

/** 21/IMO/787 — la réponse SEULE, sur la troisième ligne du paragraphe. */
const REPONSE_ISOLEE = [
  '6.5 Transmission du constat à l’agence régionale de santé',
  'Si le constat identifie au moins l’une de ces cinq situations, son auteur transmet, dans un délai de cinq',
  'jours ouvrables, une copie du rapport au directeur général de l’agence régionale de santé',
  'OUI',
  'd’implantation du bien expertisé en application de l’article L.1334 - 10 du code de la santé publique.'
];

/** 25/IMO/1001P — apostrophes espacées, et la réponse en tête de la PREMIÈRE. */
const APOSTROPHES_ESPACEES = [
  '6.5 Transmission du constat à l ’ agence régionale de santé',
  'NON Si le constat identifie au moins l ’ une de ces cinq situations, son auteur transmet, dans un délai de cinq',
  'jours ouvrables, une copie du rapport au directeur général de l ’ agence régionale de santé'
];

/** L'autre éditeur : pas de rubrique 6.5, une phrase au passé composé. */
const PHRASE_D_ACTION = [
  'Remarque : Le constat fait apparaître la présence de facteurs de dégradation (au sens de l’article',
  '8 du texte 40 de l’arrêté du 19 aout 2011 relatif au Constat de Risque d’Exposition au Plomb.',
  'Nous avons donc, conformément à l’article L 1334 - 10 du Code de la Santé Publique, transmis',
  'immédiatement une copie du rapport au représentant de l’état dans le département'
];

describe('le signalement à l’ARS', () => {
  it('lit le OUI de la rubrique 6.5, qui est la réponse et non du décor', () => {
    expect(transmisALArs(RUBRIQUE_OUI)).toBe(true);
  });

  it('lit le NON de la même rubrique', () => {
    expect(transmisALArs(RUBRIQUE_NON)).toBe(false);
  });

  it('trouve la réponse quand elle est seule sur sa ligne, plus bas', () => {
    expect(transmisALArs(REPONSE_ISOLEE)).toBe(true);
  });

  it('n’est pas mis en échec par les apostrophes espacées', () => {
    /*
     * Un moteur de rendu écrit « l ’ agence », un autre « l’agence ». Un motif
     * qui ne connaît qu'une des deux orthographes n'est pas un motif.
     */
    expect(transmisALArs(APOSTROPHES_ESPACEES)).toBe(false);
  });

  it('reconnaît aussi la phrase d’action, chez l’éditeur qui n’a pas la rubrique', () => {
    expect(transmisALArs(PHRASE_D_ACTION)).toBe(true);
  });

  it('ne prend pas le sommaire pour la rubrique', () => {
    /*
     * « 6.5 Transmission du constat à l’a gence régionale de santé 16 » figure
     * au sommaire de chaque rapport LICIEL, coupure de mot comprise. Le
     * sommaire ne porte pas de réponse : on va chercher l'occurrence qui en
     * porte une.
     */
    const avecSommaire = [
      '6.4 Situations de risque de saturnisme infantile et de dégradation du bâti 15',
      '6.5 Transmission du constat à l’a gence régionale de santé 16',
      '1. Rappel de la commande et des références règlementaires 4',
      ...RUBRIQUE_OUI
    ];
    expect(transmisALArs(avecSommaire)).toBe(true);
  });

  it('la rubrique tranche, même si une phrase d’action traîne ailleurs', () => {
    /*
     * Si le rapport coche NON, il n'a pas transmis — quoi qu'un paragraphe de
     * rappel réglementaire raconte plus loin. La rubrique est l'endroit ; le
     * reste est du texte.
     */
    expect(transmisALArs([...RUBRIQUE_NON, ...PHRASE_D_ACTION])).toBe(false);
  });

  it('se tait quand la rubrique est absente', () => {
    expect(transmisALArs(['Constat de risque d’exposition au plomb', 'Classe 0 : 208'])).toBe(false);
  });
});
