import { describe, expect, it } from 'vitest';
import { dateDuRapport } from './dateRapport';

/**
 * Les formes relevées sur le corpus, et les pièges qui les entourent.
 *
 * Tous les fragments ci-dessous sont anonymisés : les dates sont inventées, les
 * noms remplacés. Ce qui est fidèle, c'est la FORME — c'est elle qu'on fige.
 */

describe('la date du rapport, telle que les rapports l’écrivent', () => {
  it('lit « Date du repérage »', () => {
    expect(dateDuRapport(['Date du repérage : 14/03/2024'])).toBe('14/03/2024');
  });

  it('lit la date de visite du CREP, parenthèses comprises', () => {
    expect(
      dateDuRapport(['Date(s) de la visite faisant l’objet du CREP 05/11/2023'])
    ).toBe('05/11/2023');
  });

  it('lit « Visite effectuée le », avec ou sans deux-points', () => {
    expect(dateDuRapport(['Visite effectuée le 22/09/2024.'])).toBe('22/09/2024');
    expect(dateDuRapport(['Visite effectuée le : 22/09/2024'])).toBe('22/09/2024');
  });

  it('lit « Document réalisé le » — la forme de l’état des risques', () => {
    expect(
      dateDuRapport(['Situation du bien immobilier (bâti ou non bâti) Document réalisé le : 30/01/2025'])
    ).toBe('30/01/2025');
  });

  it('lit la formule de rédaction du constat de plomb', () => {
    expect(
      dateDuRapport([
        'Ce Constat de Risque d’Exposition au Plomb a été rédigé par DUPONT le 17/06/2024'
      ])
    ).toBe('17/06/2024');
  });

  it('lit la signature « Fait à …, le … », y compris pour une ville en deux mots', () => {
    expect(dateDuRapport(['Fait à VILLENAVE D ORNON , le 08/04/2024'])).toBe('08/04/2024');
  });

  it('normalise le séparateur et complète le jour sur deux chiffres', () => {
    expect(dateDuRapport(['Date du repérage : 3.7.2024'])).toBe('03/07/2024');
    expect(dateDuRapport(['Date du repérage : 3-7-2024'])).toBe('03/07/2024');
  });
});

/**
 * Le champ de mines.
 *
 * Chacun de ces fragments vient d'un vrai rapport et porte une date qui n'est
 * PAS celle du diagnostic. Les prendre ferait dire « valable jusqu'au … » à un
 * document périmé — l'inverse exact du service rendu.
 */
describe('les dates qui appartiennent à quelqu’un d’autre', () => {
  it('ne prend pas le téléphone du cabinet pour une date', () => {
    /* En pied de CHAQUE page du dossier. C'est le piège le plus fréquent :
       « 05.56.12 » se lit comme une date pour un motif permissif. */
    expect(dateDuRapport(['SARL EXEMPLE | 12 RUE DES SABLES 33000 VILLE | Tél. : 05.56.12.34.56'])).toBeNull();
  });

  it('ne prend pas l’assurance du diagnostiqueur', () => {
    expect(dateDuRapport(['Date d’effet : 01/01/2024 : - Date d’expiration : 31/12/2024'])).toBeNull();
    expect(
      dateDuRapport(['- Avoir souscrit à une assurance (n° CD123 valable jusqu’au 30/06/2025) permettant de'])
    ).toBeNull();
    expect(dateDuRapport(['Numéro de police et date de validité : .......... CD123 - 30/06/2025'])).toBeNull();
  });

  it('ne prend pas le certificat de compétence', () => {
    expect(
      dateDuRapport(['Certification de compétence C123 délivrée par : ORGANISME , le 04/02/2021'])
    ).toBeNull();
  });

  it('ne prend pas l’appareil de mesure', () => {
    /* Le plomb se mesure au fluorescence X : l'appareil a une source
       radioactive, dont le chargement et l'étalonnage sont datés. */
    expect(dateDuRapport(['Date du dernier chargement de la source 12/05/2023'])).toBeNull();
    expect(dateDuRapport(['Etalonnage entrée 3 12/05/2023 145 (+/ - 0,5)'])).toBeNull();
  });

  it('ne prend pas les plans de prévention de l’état des risques', () => {
    /* L'ERP est rempli de dates d'approbation d'arrêtés. Ce sont les seules
       dates de son volet — et aucune n'est celle du rapport. */
    expect(dateDuRapport(['PPRn Inondation approuvé 21/07/2005 non non p.4'])).toBeNull();
    expect(dateDuRapport(['SIS Pollution des sols approuvé 14/11/2019 non - p.2'])).toBeNull();
    expect(dateDuRapport(['PPRt approuvé 09/03/2012 non non p.3'])).toBeNull();
  });

  it('ne prend pas les textes réglementaires cités', () => {
    expect(dateDuRapport(['Selon arrêté du 24 mars 2021 modifiant les modalités'])).toBeNull();
    expect(dateDuRapport(['conformément au décret n° 2021-19 du 11/01/2021.'])).toBeNull();
  });
});

describe('quand on ne sait pas', () => {
  /*
   * Se taire est une réponse acceptable, et c'est la bonne quand le doute
   * subsiste. Le produit sait afficher « date non lue » ; il ne sait pas
   * rattraper une échéance calculée sur une date qui n'était pas la sienne.
   */
  it('rend null plutôt qu’une date approchante', () => {
    expect(dateDuRapport(['Le bien est situé au 3e étage', 'Bâtiment construit en 1974'])).toBeNull();
    expect(dateDuRapport([])).toBeNull();
  });

  it('retient la date du diagnostic même quand une date parasite la précède', () => {
    expect(
      dateDuRapport([
        'Certification de compétence C123 délivrée par : ORGANISME , le 04/02/2021',
        'SARL EXEMPLE | Tél. : 05.56.12.34.56',
        'Date du repérage : 14/03/2024'
      ])
    ).toBe('14/03/2024');
  });
});
