import { describe, expect, it } from 'vitest';
import { natureDe } from './nature';

/**
 * Les phrases sont reprises de vrais rapports du corpus — leurs titres et leurs
 * formules de mission, jamais leurs données. C'est précisément là que le moteur
 * se trompait : trois documents portent le même intitulé de mission, et seule
 * leur finalité les sépare.
 */
describe('la nature d’un document', () => {
  it('reconnaît un repérage avant travaux, et refuse d’en faire un diagnostic de vente', () => {
    const raat = [
      'Rapport de mission de repérage des matériaux et produits contenant de l’amiante',
      'dans les immeubles bâtis avant réalisation de travaux',
      'Informations conformes à l’annexe III de l’arrêté du 12 décembre 2012',
      '1 Les conclusions',
      '5.2 Récapitulatif zone par zone'
    ];
    const n = natureDe(raat);
    expect(n.genre).toBe('raat');
    expect(n.pourLaVente).toBe(false);
    expect(n.portee).toBe('immeuble');
  });

  it('reconnaît un dossier technique amiante', () => {
    const dta = [
      'Rapport de mission de repérage des matériaux et produits des listes A et B',
      'à intégrer au dossier technique amiante',
      'Le programme de repérage est défini par les listes A et B de l’annexe 13-9',
      'articles R1334-14 R1334-17 et 18 R1334-20 et 21 R1334-23 et 24 R1334-29-5'
    ];
    const n = natureDe(dta);
    expect(n.genre).toBe('dta');
    expect(n.pourLaVente).toBe(false);
  });

  it('reconnaît un diagnostic technique global', () => {
    const dtg = [
      'Diagnostic technique global',
      'La copropriété de la résidence a donc missionné',
      'un diagnostic technique global sur l’ensemble de ses bâtiments',
      'Informations administratives'
    ];
    const n = natureDe(dtg);
    expect(n.genre).toBe('dtg');
    expect(n.portee).toBe('immeuble');
  });

  it('reconnaît un projet de plan pluriannuel de travaux', () => {
    const pppt = [
      'Projet de plan pluriannuel de',
      'travaux optimum PPPT-O',
      'Notre méthodologie',
      'Phase 1 préparation et collecte des données'
    ];
    expect(natureDe(pppt).genre).toBe('pppt');
  });

  it('reconnaît un dossier de vente à ses composants, pas à un seul mot', () => {
    // Un seul diagnostic cité ne fait pas un dossier de vente : un DTG en
    // recopie volontiers un. Il en faut deux.
    const dossier = [
      'Dossier de diagnostic technique',
      'État de l’installation intérieure d’électricité',
      'État des risques et pollutions',
      'Constat de risque d’exposition au plomb'
    ];
    const n = natureDe(dossier);
    expect(n.genre).toBe('venteLocation');
    expect(n.pourLaVente).toBe(true);
    expect(n.portee).toBe('logement');
  });

  it('reconnaît un devis, et ne le prend pas pour le rapport qu’il propose', () => {
    // Cinq offres commerciales de plan pluriannuel étaient contrôlées comme des
    // plans livrés : on leur reprochait de ne pas chiffrer des travaux qu'elles
    // proposaient seulement d'étudier.
    const devis = [
      'Projet de plan pluriannuel de travaux optimum PPPT-O',
      'Pourquoi travailler avec nous pour réaliser votre PPPT',
      'Notre méthodologie',
      'Validité de l’offre : trois mois',
      'Conditions générales de vente',
      'Montant total HT'
    ];
    const n = natureDe(devis);
    expect(n.genre).toBe('devis');
    expect(n.reserve).toMatch(/rien [àa] analyser/i);
  });

  it('ne conclut pas sur un document qu’il ne reconnaît pas', () => {
    const n = natureDe(['Facture n° 2026-118', 'Règlement à trente jours', 'Merci de votre confiance']);
    expect(n.genre).toBe('inconnu');
    expect(n.reserve).toMatch(/rien n.en est d[ée]duit/i);
  });

  it('donne à chaque genre reconnu de quoi se présenter', () => {
    for (const lignes of [
      ['Diagnostic technique global'],
      ['Projet de plan pluriannuel de travaux'],
      ['dossier technique amiante'],
      ['repérage avant travaux']
    ]) {
      const n = natureDe(lignes);
      expect(n.nom.length).toBeGreaterThan(5);
      expect(n.quoi.length).toBeGreaterThan(30);
      // Tout document d'immeuble doit porter sa réserve : c'est elle qui évite
      // qu'on le prenne pour un diagnostic de vente.
      if (n.portee === 'immeuble') expect(n.reserve).toBeTruthy();
    }
  });
});
