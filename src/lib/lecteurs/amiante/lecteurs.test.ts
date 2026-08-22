/**
 * L'aiguillage amiante : le bon lecteur, ou aucun.
 *
 * Les extraits viennent de volets lus en entier les 21 et 22/08/2026.
 */
import { describe, expect, it } from 'vitest';
import { lireLAmiante, LECTEURS_AMIANTE } from './index';
import { signaturesQuiRepondent } from '../socle';

const LICIEL_VENTE = [
  'Constat de repérage Amiante n° 25/IMO/0120AM',
  "Rapport de mission de repérage des matériaux et produits contenant de l'amiante pour",
  "l'établissement du constat établi à l'occasion de la vente d'un immeuble bâti (listes A et",
  'B de l’annexe 13 - 9 du Code de la Santé publique)',
  'Pagination : le présent rapport avec les annexes comprises, est constitué de 16 pages, la conclusion est située en page 2.',
  '1. – Les conclusions',
  "1.1 Liste A : D ans le cadre de mission décrit à l’article 3.2 , il n'a pas été repéré",
  "- de matériaux ou produits de la liste A contenant de l'amiante.",
  "1.1 Liste B : D ans le cadre de mission décrit à l’article 3.2 , il a été repéré :",
  "- des matériaux et produits de la liste B contenant de l'amiante sur jugement personnel :",
  'Revêtements durs (amiante - ciment) (RDC - Chambre 3) pour lequel il est recommandé de réaliser une',
  'évaluation périodique.*',
  "1.2. Dans le cadre de mission décrit à l’article 3.2 les locaux ou parties de locaux, composants ou parties de composants qui n’ont pu être visités :",
  'Localisation Parties du local Raison',
  'Combles - Combles  Toutes  Absence de trappe de visite',
  '2. – Le(s) laboratoire(s) d’analyses',
  "Raison sociale et nom de l'entreprise : ... Il n'a pas été fait appel à un laboratoire d'analyse"
];

const BC2E_DTA = [
  'Constat Amiante',
  'RAPPORT DE MISSION DE REPÉRAGE DES MATÉRIAUX ET PRODUITS DES LISTES A ET B',
  'A - CONCLUSIONS DU REPÉRAGE EFFECTIF :',
  'Dans le cadre réglementaire de la mission décrit au paragraphe 2.2, il a été repéré des matériaux et',
  "produits susceptibles de contenir de l'amiante : marquage des matériaux, ils ne contiennent pas",
  "d'amiante dans :",
  'SOUS-SOL - Cave (Conduits) : Plafond',
  'B - OBLIGATIONS ET RECOMMANDATIONS RÉGLEMENTAIRE ISSUES DES RÉSULTATS DU REPÉRAGE',
  'DGLM EXPERTISES / LE MOINE Thibault membre du réseau BC2E',
  'AMIANTE (DTA) : 1 sur 10'
];

describe('on nomme l’éditeur AVANT de lire', () => {
  it('reconnaît LICIEL à son gabarit, pas à une marque', () => {
    const a = lireLAmiante(LICIEL_VENTE);
    expect(a.etat).toBe('lu');
    if (a.etat !== 'lu') return;
    expect(a.editeur).toBe('LICIEL');
    expect(a.preuve).toMatch(/Pagination|conclusions/);
  });

  it('reconnaît BC2E à son pied de page, qui le nomme en clair', () => {
    const a = lireLAmiante(BC2E_DTA);
    expect(a.etat).toBe('lu');
    if (a.etat !== 'lu') return;
    expect(a.editeur).toBe('BC2E');
    expect(a.preuve).toMatch(/BC2E/);
  });

  it('⚠️ déclare « format inconnu » plutôt que de rafistoler', () => {
    const a = lireLAmiante(['Un document sans aucune de ces formes.']);
    expect(a.etat).toBe('format inconnu');
    if (a.etat !== 'format inconnu') return;
    expect(a.essayes).toEqual(['BC2E', 'LICIEL']);
  });

  it('deux signatures ne répondent jamais sur le même document', () => {
    expect(signaturesQuiRepondent(LECTEURS_AMIANTE, LICIEL_VENTE)).toEqual(['LICIEL']);
    expect(signaturesQuiRepondent(LECTEURS_AMIANTE, BC2E_DTA)).toEqual(['BC2E']);
  });
});

describe('chaque lecteur lit SON format', () => {
  it('LICIEL : la mission, l’issue, le matériau et sa localisation', () => {
    const a = lireLAmiante(LICIEL_VENTE);
    if (a.etat !== 'lu') throw new Error('non lu');
    expect(a.valeur.mission).toBe('vente');
    expect(a.valeur.issue).toBe('presence');
    expect(a.valeur.materiaux[0]).toMatchObject({
      quoi: 'Revêtements durs (amiante - ciment)',
      issue: 'presence',
      justification: 'jugement de l’opérateur'
    });
    expect(a.valeur.materiaux[0]?.ou).toEqual(['RDC - Chambre 3']);
    expect(a.valeur.limites.lue).toBe(true);
    expect(a.valeur.limites.entrees.length).toBeGreaterThan(0);
  });

  it('⚠️ BC2E : « susceptibles de contenir » suivi de « ils ne contiennent pas » est une ABSENCE', () => {
    const a = lireLAmiante(BC2E_DTA);
    if (a.etat !== 'lu') throw new Error('non lu');
    expect(a.valeur.issue).toBe('absence');
    expect(a.valeur.mission).toBe('DTA');
    expect(a.valeur.materiaux[0]).toMatchObject({
      quoi: 'Conduits',
      issue: 'absence',
      justification: 'marquage du matériau'
    });
  });

  it('⚠️ le lecteur LICIEL ne trouve rien dans un BC2E, et réciproquement', () => {
    /* C'est le fait qui justifie toute l'architecture : appliquer la carte
       d'un éditeur à un autre ne donne pas un résultat approximatif, il ne
       donne RIEN — et un lecteur unique comblerait ce rien par une absence. */
    const { LECTEUR_AMIANTE_LICIEL } = LECTEURS_AMIANTE.reduce(
      (acc, l) => ({ ...acc, [`LECTEUR_AMIANTE_${l.editeur}`]: l }),
      {} as Record<string, (typeof LECTEURS_AMIANTE)[number]>
    );
    expect(LECTEUR_AMIANTE_LICIEL?.reconnait(BC2E_DTA)).toBeNull();
  });
});

describe('les trois issues, jamais deux', () => {
  it('LICIEL : « résultats attendus » ne se range pas dans « rien trouvé »', () => {
    const a = lireLAmiante([
      ...LICIEL_VENTE.slice(0, 6),
      "1.1 Liste A : Dans le cadre de mission décrit à l'article 3.2, il a été repéré :",
      "- des matériaux et produits de la liste A pour lesquels les résultats d'analyse des sondages et/ou",
      'prélèvements sont attendus :',
      "Faux plafonds (habitation étage - Palier) / En attente des résultats d'analyse)"
    ]);
    if (a.etat !== 'lu') throw new Error('non lu');
    expect(a.valeur.issue).toBe('nonConclu');
    expect(a.valeur.materiaux[0]?.justification).toBe('résultats attendus');
  });

  it('BC2E : « prélèvements en cours d’analyse » non plus', () => {
    const a = lireLAmiante([
      'A - CONCLUSIONS DU REPÉRAGE EFFECTIF :',
      "PRÉLÈVEMENT(S) AMIANTE EN COURS D'ANALYSE.",
      'B - OBLIGATIONS ET RECOMMANDATIONS'
    ]);
    if (a.etat !== 'lu') throw new Error('non lu');
    expect(a.valeur.issue).toBe('nonConclu');
  });
});

describe('le laboratoire, quand il existe', () => {
  it('le nomme, et ne l’invente pas quand le rapport dit qu’il n’y en a pas', () => {
    const sans = lireLAmiante(LICIEL_VENTE);
    if (sans.etat !== 'lu') throw new Error('non lu');
    expect(sans.valeur.laboratoire).toBeUndefined();

    const avec = lireLAmiante([
      ...LICIEL_VENTE.slice(0, 6),
      '2. – Le(s) laboratoire(s) d’analyses',
      "Raison sociale et nom de l'entreprise : ... PROTEC",
      'Numéro de l’accréditation Cofrac : ......... 1 - 0918'
    ]);
    if (avec.etat !== 'lu') throw new Error('non lu');
    expect(avec.valeur.laboratoire?.nom).toBe('PROTEC');
    expect(avec.valeur.laboratoire?.cofrac).toBe('1 - 0918');
  });
});

describe('⚠️ « je n’ai rien retenu » n’est jamais « tout a été visité »', () => {
  it('une rubrique trouvée sans ligne lisible ne rend PAS neant', () => {
    /* Faute mesurée le 22/08 : un filtre trop strict faisait tomber la seule
       entrée d'un rapport aux combles fermés, et l'écran annonçait que rien
       n'était resté fermé. Seul le mot « Néant » autorise à le dire. */
    const a = lireLAmiante([
      ...LICIEL_VENTE.slice(0, 6),
      "1.2. Dans le cadre de mission décrit à l'article 3.2 les locaux ou parties de locaux, composants ou",
      'parties de composants qui n’ont pu être visités :',
      'Localisation Parties du local Raison',
      'une ligne que le lecteur ne sait pas découper'
    ]);
    if (a.etat !== 'lu') throw new Error('non lu');
    expect(a.valeur.limites.lue).toBe(true);
    expect(a.valeur.limites.neant).toBe(false);
    expect(a.valeur.limites.entrees).toEqual([]);
  });

  it('« Néant » dans la rubrique, lui, se lit comme une réponse', () => {
    const a = lireLAmiante([
      ...LICIEL_VENTE.slice(0, 6),
      "1.2. Dans le cadre de mission décrit à l'article 3.2 les locaux ou parties de locaux :",
      'Localisation Parties du local Raison',
      'Néant -'
    ]);
    if (a.etat !== 'lu') throw new Error('non lu');
    expect(a.valeur.limites.neant).toBe(true);
  });

  it('⚠️ la clause de style ne devient jamais un local non visité', () => {
    const a = lireLAmiante([
      ...LICIEL_VENTE.slice(0, 6),
      "1.2. Dans le cadre de mission décrit à l'article 3.2 les locaux ou parties de locaux :",
      'Localisation Parties du local Raison',
      'R+2 - Combles  Toutes  Trappe de visite non accessible',
      'Le diagnostic se limite aux zones rendues',
      'visibles et accessibles par le propriétaire.',
      'Les zones situées derrière les doublages'
    ]);
    if (a.etat !== 'lu') throw new Error('non lu');
    expect(a.valeur.limites.entrees).toHaveLength(1);
    expect(a.valeur.limites.entrees[0]?.quoi).toMatch(/Combles/);
  });
});
