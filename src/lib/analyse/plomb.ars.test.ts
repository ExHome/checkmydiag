import { describe, expect, it } from 'vitest';
import { transmisALArs } from './plomb';

/**
 * La transmission du constat à l'agence régionale de santé.
 *
 * L'arrêté du 19 août 2011 définit cinq situations de risque ; une seule suffit
 * à déclencher la transmission dans les cinq jours ouvrables (article
 * L. 1334-10 du code de la santé publique).
 *
 * Fragments anonymisés, calqués sur la rubrique 6.5 d'un rapport réel.
 */
const RAPPEL_DE_LA_REGLE = [
  '6.5 Transmission du constat à l’agence régionale de santé',
  'Si le constat identifie au moins l’une de ces cinq situations, son auteur transmet, dans un délai de cinq',
  'OUI jours ouvrables, une copie du rapport au directeur général de l’agence régionale de santé',
  'd’implantation du bien expertisé en application de l’article L.1334 - 10 du code de la santé publique.'
];

const TRANSMISSION_FAITE = [
  'Remarque : Le constat fait apparaître la présence de facteurs de dégradation (au sens de l’article',
  '8 du texte 40 de l’arrêté du 19 aout 2011 relatif au Constat de Risque d’Exposition au Plomb.',
  'Nous avons donc, conformément à l’article L 1334 - 10 du Code de la Santé Publique, transmis',
  'immédiatement une copie du rapport au représentant de l’état dans le département'
];

describe('le signalement à l’ARS', () => {
  it('se reconnaît à la phrase d’action', () => {
    expect(transmisALArs([...RAPPEL_DE_LA_REGLE, ...TRANSMISSION_FAITE])).toBe(true);
  });

  /*
   * Le garde-fou qui compte. La rubrique 6.5 reproduit le texte de l'arrêté
   * dans TOUS les rapports, y compris ceux qui n'ont rien transmis. Un motif
   * qui se contenterait du mot « transmet » signalerait donc chaque logement.
   */
  it('ne confond pas le rappel de la règle avec la transmission', () => {
    expect(transmisALArs(RAPPEL_DE_LA_REGLE)).toBe(false);
  });

  it('se tait quand la rubrique est absente', () => {
    expect(transmisALArs(['Constat de risque d’exposition au plomb', 'Classe 0 : 208'])).toBe(false);
  });
});
