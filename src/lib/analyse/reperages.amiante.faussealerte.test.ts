import { describe, expect, it } from 'vitest';
import { analyserAmiante, materiauxAmiantes } from './reperages';

/**
 * La page de couverture d'un constat amiante réel (octobre 2024), suivie de sa
 * conclusion. Le rapport ne repère RIEN — et le produit annonçait pourtant
 * « Amiante repérée : Code postal, ville : . 33800 BORDEAUX (France) ».
 *
 * Mesuré sur le corpus : dix-sept volets sur dix-neuf portaient un verdict de
 * ce genre, tous démentis par leur propre conclusion. La gravité, elle, restait
 * « bon » : la carte se contredisait d'une ligne à l'autre.
 */
const COUVERTURE_SANS_AMIANTE = [
  'Constat de repérage Amiante n° 24/IMO/0154N',
  'Immeuble bâti visité',
  'Adresse Rue : .................... 12 rue Andronne (Appartement lot n°1)',
  'Code postal, ville : . 33800 BORDEAUX (France)',
  'Raison sociale de l’entreprise : SARL DGLM EXPERTISES (Numéro SIRET : 89128707000017)',
  'Désignation de la compagnie d’assurance : KLARITY (police CDIAGK000266)',
  '1. – Les conclusions',
  '1.1 Liste A : Dans le cadre de mission décrit à l’article 3.2 , il n\'a pas été repéré',
  "- de matériaux ou produits de la liste A contenant de l'amiante.",
  '1.1 Liste B : Dans le cadre de mission décrit à l’article 3.2 , il n\'a pas été repéré',
  "- de matériaux ou produits de la liste B contenant de l'amiante.",
  '1.2. … locaux qui n’ont pu être visités :',
  'Localisation Parties du local Raison',
  'Néant -'
];

describe('l’amiante qui n’en était pas', () => {
  it('ne prend pas une ligne d’identité pour un matériau', () => {
    // « Code postal, ville : . 33800 BORDEAUX (France) » a exactement la forme
    // cherchée : un intitulé, puis une parenthèse.
    expect(materiauxAmiantes(COUVERTURE_SANS_AMIANTE)).toEqual([]);
  });

  it('ne dit pas « Amiante repérée » quand le rapport dit l’inverse', () => {
    const d = analyserAmiante(COUVERTURE_SANS_AMIANTE, [1, 11]);
    expect(d.verdict).not.toMatch(/Amiante repérée/i);
    expect(d.verdict).toMatch(/Aucun matériau/i);
  });

  it('accorde le verdict et la gravité', () => {
    // Le défaut se voyait à l'œil nu : verdict alarmant, pastille verte.
    const d = analyserAmiante(COUVERTURE_SANS_AMIANTE, [1, 11]);
    expect(d.gravite).toBe('bon');
    expect(/Amiante repérée/i.test(d.verdict)).toBe(d.gravite !== 'bon');
  });
});
