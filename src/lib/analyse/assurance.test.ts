import { describe, expect, it } from 'vitest';
import { controler } from './coherence';
import type { Diagnostic } from '../modele';

/**
 * L'attestation d'assurance jointe au rapport.
 *
 * Le mot n'est pas « défaut d'assurance », et ce n'est pas une nuance de style.
 * Mesuré sur soixante-dix rapports : vingt-quatre sur cinquante-neuf portent une
 * date de validité antérieure au rapport — mais seules **cinq dates distinctes**
 * apparaissent, les millésimes successifs d'une même attestation, et l'écart
 * médian est de **deux mois**. C'est un champ figé dans le modèle de document,
 * pas un cabinet qui travaillerait sans couverture.
 *
 * On signale donc une pièce à actualiser. Et on ne dit rien quand elle est à
 * jour : le contrôle est silencieux, sans ligne « assurance : valide » ni coche
 * verte.
 */
const LIGNE = (fin: string) => [
  'Désignation de la compagnie d’assurance : ... KLARITY',
  `Numéro de police et date de validité : ......... CDIAGK000266 - ${fin}`
];

const diag = (date: string): Diagnostic => ({
  type: 'termites',
  titre: 'Termites',
  verdict: 'Aucun indice.',
  gravite: 'bon',
  faits: [],
  explication: [],
  aFaire: [],
  schema: null,
  pages: [1, 2],
  date
});

const controle = (fin: string, dateRapport: string) =>
  controler({}, [diag(dateRapport)], new Date('2026-08-20'), false, LIGNE(fin)).find((c) =>
    /attestation d’assurance/i.test(c.titre)
  );

describe('l’attestation d’assurance jointe', () => {
  it('se tait quand elle couvre la mission', () => {
    expect(controle('01/10/2026', '15/07/2026')).toBeUndefined();
  });

  it('se tait aussi le jour même de l’échéance', () => {
    expect(controle('15/07/2026', '15/07/2026')).toBeUndefined();
  });

  it('signale une attestation dépassée', () => {
    const c = controle('30/09/2023', '23/11/2023');
    expect(c?.titre).toMatch(/n’est plus à jour/);
    expect(c?.explication).toMatch(/30\/09\/2023/);
    expect(c?.explication).toMatch(/23\/11\/2023/);
  });

  it('dit que c’est la pièce, pas la couverture', () => {
    // Conclure au défaut d'assurance serait une accusation, et fausse dans la
    // quasi-totalité des cas.
    const c = controle('30/09/2023', '23/11/2023');
    expect(c?.explication).toMatch(/la pièce du dossier qui n’a pas été actualisée/);
    expect(`${c?.titre} ${c?.explication} ${c?.quoiFaire}`).not.toMatch(/défaut d’assurance|non assuré/i);
  });

  it('ne montre ni l’assureur ni le numéro de police', () => {
    // Ils ne regardent pas le lecteur, et les afficher mettrait en cause le
    // confrère.
    const c = controle('30/09/2023', '23/11/2023');
    expect(`${c?.titre} ${c?.explication} ${c?.quoiFaire}`).not.toMatch(/KLARITY|CDIAGK/);
  });

  it('ne dit rien quand le rapport ne porte pas la ligne', () => {
    expect(
      controler({}, [diag('23/11/2023')], new Date('2026-08-20'), false, [
        'Désignation de l’opérateur de diagnostic'
      ]).find((c) => /assurance/i.test(c.titre))
    ).toBeUndefined();
  });
});

/**
 * La même attestation, écrite comme l'écrit l'éditeur majoritaire.
 *
 * ⚠️ Le contrôle ne connaissait que la forme d'un seul éditeur — « Numéro de
 * police et date de validité : … - 30/09/2023 », tout sur une ligne. Mesuré le
 * 21/08/2026 : cet éditeur pèse 3 volets sur 120. Les 117 autres écrivent la
 * même chose en DEUX lignes, sous un autre intitulé, et le contrôle ne se
 * déclenchait donc jamais chez eux.
 *
 * La lecture 47 des cinquante en porte le cas exact : attestation valable
 * jusqu'au 30/09/2023, repérage du 27/02/2024.
 */
const FORME_EN_DEUX_LIGNES = (fin: string) => [
  'Société réalisant le constat',
  'Nom et prénom de l’auteur du constat MARTIN',
  'N° de certificat de certification C3596 le 22/08/2022',
  'N° de contrat d’assurance CDIAGK000266',
  `Date de validité : ${fin}`,
  'Appareil utilisé',
  'Autorisation/Déclaration ASN (DGSNR)',
  'Date d’autorisation/de déclaration Date de fin de validité (si applicable)',
  '21/11/2018 13/11/2023'
];

const controleDeuxLignes = (fin: string, dateRapport: string) =>
  controler({}, [diag(dateRapport)], new Date('2026-08-20'), false, FORME_EN_DEUX_LIGNES(fin)).find(
    (c) => /attestation d’assurance/i.test(c.titre)
  );

describe('l’attestation d’assurance, écrite en deux lignes', () => {
  it('signale l’attestation dépassée que le contrôle ne voyait pas', () => {
    const c = controleDeuxLignes('30/09/2023', '27/02/2024');
    expect(c?.titre).toMatch(/n’est plus à jour/);
    expect(c?.explication).toMatch(/30\/09\/2023/);
  });

  it('se tait quand elle couvre la mission', () => {
    expect(controleDeuxLignes('01/10/2025', '21/08/2025')).toBeUndefined();
  });

  it('ne prend pas la validité de l’autorisation ASN pour celle de l’assurance', () => {
    /*
     * Deux lignes plus bas, le même rapport porte une autorisation ASN dont la
     * date de fin — 13/11/2023 — précède le repérage. Ce n'est pas l'assurance,
     * et s'ancrer sur « validité » seul l'aurait confondue avec elle.
     */
    expect(controleDeuxLignes('01/10/2025', '21/08/2025')).toBeUndefined();
  });

  it('ne montre ni l’assureur ni le numéro de contrat', () => {
    const c = controleDeuxLignes('30/09/2023', '27/02/2024');
    expect(`${c?.titre} ${c?.explication} ${c?.quoiFaire}`).not.toMatch(/CDIAGK/);
  });
});
