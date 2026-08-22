/**
 * LE PÉRIMÈTRE RÉELLEMENT VISITÉ — § 3.2.6 chez LICIEL.
 *
 * *C'est la donnée qui remplit le bloc « ÉLÉMENTS CONTRÔLÉS » du visuel du pack
 * du 22/08/2026. Les extraits ci-dessous sont recopiés de volets sondés le jour
 * même sur le corpus DGLM, pied de page compris.*
 *
 * ⚠️ **Pourquoi ce n'est pas le § 5.0.2.** Le mockup coche cinq composants —
 * Toiture, Façades, Revêtements intérieurs, Conduits, Sols — tous « Contrôlés ».
 * On aurait pu croire qu'il décrit les tableaux 5.0.1 / 5.0.2. Sondé le 22/08 :
 * dans les volets négatifs, ces deux tableaux répondent `Néant -`. Ils ne
 * portent aucun inventaire de ce qui a été regardé — le § 3.2.6, si.
 */
import { describe, expect, it } from 'vitest';
import { perimetreDe } from './liciel';

/* Volet DAPP réel, sondé le 22/08. La liste est imprimée sur deux colonnes. */
const DEUX_COLONNES = [
  '3.2.6 Le périmètre de repérage effectif',
  'Descriptif des pièces visitées',
  'Rez de chaussée - Entrée, 1er étage - Bureau,',
  'Rez de chaussée - Dégagement, 1er étage - Combles 1,',
  "Rez de chaussée - Salle d'eau / Wc, 1er étage - Combles 2,",
  'Rez de chaussée - Séjour / Cuisine, Rez de jardin - Garage,',
  'SARL DGLM EXPERTISES |76 COURS PORTAL 33000 BORDEAUX| Tél. : 06.72.70.03.38',
  '4. – Conditions de réalisation du repérage'
];

/* Un autre volet réel : la liste se referme sur l'en-tête du tableau suivant,
   qui décrit les composants matière par matière — et n'est pas un constat. */
const AVEC_TABLEAU = [
  'Descriptif des pièces visitées',
  '2ème étage - Entrée/Dégagement, 2ème étage - placard 4,',
  '2ème étage - Séjour, 2ème étage - Cuisine,',
  '2ème étage - Chambre 2',
  'Localisation Description',
  'Sol : Parquet',
  'Plinthes A, B, C, D : Bois et Peinture',
  '2ème étage - Entrée/Dégagement Mur A, B : Divers et Peinture'
];

describe('le périmètre de repérage, § 3.2.6', () => {
  it('lit les deux colonnes comme un seul ensemble de pièces', () => {
    const p = perimetreDe(DEUX_COLONNES);
    expect(p.lue).toBe(true);
    expect(p.pieces).toEqual([
      'Rez de chaussée - Entrée',
      '1er étage - Bureau',
      'Rez de chaussée - Dégagement',
      '1er étage - Combles 1',
      "Rez de chaussée - Salle d'eau / Wc",
      '1er étage - Combles 2',
      'Rez de chaussée - Séjour / Cuisine',
      'Rez de jardin - Garage'
    ]);
  });

  it('ne prend pas le pied de page pour une pièce', () => {
    const p = perimetreDe(DEUX_COLONNES);
    expect(p.pieces.some((x) => /DGLM|BORDEAUX|Tél/i.test(x))).toBe(false);
  });

  it('s’arrête à l’en-tête du tableau des composants', () => {
    const p = perimetreDe(AVEC_TABLEAU);
    expect(p.pieces).toEqual([
      '2ème étage - Entrée/Dégagement',
      '2ème étage - placard 4',
      '2ème étage - Séjour',
      '2ème étage - Cuisine',
      '2ème étage - Chambre 2'
    ]);
    /* « Sol : Parquet » décrit une matière, pas une pièce visitée. */
    expect(p.pieces.some((x) => /Parquet|Plinthes/i.test(x))).toBe(false);
  });

  it('⚠️ dit « je n’ai pas lu » quand la rubrique manque — jamais « rien visité »', () => {
    const p = perimetreDe(['1. – Les conclusions', "1.1 Liste A : il n'a pas été repéré"]);
    expect(p.lue).toBe(false);
    expect(p.pieces).toEqual([]);
  });
});
