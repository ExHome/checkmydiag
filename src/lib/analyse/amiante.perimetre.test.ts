import { describe, expect, it } from 'vitest';
import { piecesVisiteesAmiante } from './reperages';

/**
 * Le périmètre réellement visité par le repérage amiante.
 *
 * Mesuré sur cent vingt dossiers : un volet amiante rend **0,8 relevé par
 * fiche**, quand le DPE en rend 9,4. C'est le volet le plus pauvre du produit —
 * il conclut « aucun matériau amianté » et se tait.
 *
 * Or la question du lecteur n'est pas celle-là. Le verdict y répond déjà. Sa
 * question est : *a-t-il seulement vu tout mon logement ?*
 *
 * Le rapport y répond au § 3.2.6, « Le périmètre de repérage effectif ». Les
 * lignes ci-dessous en sont recopiées.
 */
const PERIMETRE = [
  '3.2.6 Le périmètre de repérage effectif',
  'Il s’agit de l’ensemble des locaux ou parties de l’immeuble concerné par la mission de repérage figurant sur le schéma de',
  'repérage joint en annexe à l’exclusion des locaux ou parties d’immeuble n’ayant pu être visités.',
  'Descriptif des pièces visitées',
  '2ème étage - Entrée/cuisine, 2ème étage - Salle de bain /Wc,',
  '2ème étage - Chambre, 2ème étage - Placard',
  'Localisation Description',
  'Néant -',
  '4. – Conditions de réalisation du repérage'
];

describe('les pièces que le repérage amiante a visitées', () => {
  it('les lit toutes, sur les deux lignes', () => {
    const pieces = piecesVisiteesAmiante(PERIMETRE);
    expect(pieces).toHaveLength(4);
    expect(pieces[0]).toBe('2ème étage - Entrée/cuisine');
    expect(pieces[3]).toBe('2ème étage - Placard');
  });

  it('s’arrête à l’en-tête du tableau suivant', () => {
    /*
     * « Localisation Description » ouvre le tableau des locaux non visités. S'y
     * poursuivre ferait compter « Néant » comme une pièce visitée — et
     * transformerait une réserve en couverture.
     */
    const pieces = piecesVisiteesAmiante(PERIMETRE);
    expect(pieces.join(' ')).not.toMatch(/Localisation|Néant/);
  });

  it('s’arrête aussi sur le paragraphe numéroté qui suit', () => {
    const pieces = piecesVisiteesAmiante([
      'Descriptif des pièces visitées',
      'Séjour, Cuisine',
      '4. – Conditions de réalisation du repérage'
    ]);
    expect(pieces).toEqual(['Séjour', 'Cuisine']);
  });

  it('ne répète pas une pièce nommée deux fois', () => {
    expect(
      piecesVisiteesAmiante(['Descriptif des pièces visitées', 'Cave, Cave, Garage', ''])
    ).toEqual(['Cave', 'Garage']);
  });

  it('ne dit rien quand la rubrique est absente', () => {
    /*
     * ODM « chercher un endroit » : le mot « visitées » court partout dans un
     * repérage — parties non visitées, locaux visités, périmètre. Hors de sa
     * rubrique, on ne conclut pas.
     */
    expect(
      piecesVisiteesAmiante([
        'Rapport de repérage amiante',
        'Liste des pièces non visitées : Cave, Grenier',
        'Les locaux visités figurent au croquis joint.'
      ])
    ).toEqual([]);
  });

  it('ne rend rien quand la rubrique est vide', () => {
    expect(
      piecesVisiteesAmiante(['Descriptif des pièces visitées', 'Néant', 'Localisation Description'])
    ).toEqual([]);
  });
});
