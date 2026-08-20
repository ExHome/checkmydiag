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
