/**
 * LES TROIS ÉTATS DE LA NORME TERMITES, ET CELUI QUI MANQUAIT.
 *
 * NF P 03-201 ne connaît pas deux conclusions mais TROIS :
 *
 *   1. ABSENCE d'indice d'infestation
 *   2. PRÉSENCE d'indices d'infestation
 *   3. PRÉSENCE de termites   ← des insectes vivants, constatés
 *
 * Les deux premiers se distinguent d'un mot — « il n'a pas été repéré » contre
 * « il a été repéré ». Le troisième est d'une autre nature : on ne lit plus des
 * traces, on lit des termites. Il commande la déclaration en mairie.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CE QUE CE FICHIER A SERVI À FAIRE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Mesuré le 22 août 2026, AVANT correction :
 *
 *   absence d'indice      → gravité « bon »     · verdict juste       ✓
 *   présence d'indices    → gravité « alerte »  · verdict juste       ✓
 *   présence de termites  → gravité « neutre »  · « sa conclusion
 *                           n'a pas pu être lue »                     ✗
 *
 * Le cas le plus grave n'était pas classé comme grave : il n'était pas lu du
 * tout, et aucune zone n'était produite. Un acquéreur dont la cave abrite des
 * termites vivants voyait son écran annoncer que la conclusion n'était pas
 * lisible.
 *
 * Ces tests ont d'abord été écrits en `it.fails` — ils documentaient le défaut
 * sans bloquer le déploiement. La correction du 22 août les a rendus rouges,
 * ce qui était le signal attendu : un `fails` qui réussit est une erreur. Ils
 * sont devenus des tests ordinaires, et gardent le défaut fermé.
 *
 * ── LES TROIS PIÈGES RENCONTRÉS EN CORRIGEANT ──────────────────────────────
 *
 * 1. LE TITRE. L'intitulé réglementaire du diagnostic est « État relatif à la
 *    PRÉSENCE DE TERMITES ». Le premier motif l'attrapait en tête de CHAQUE
 *    rapport : un dossier concluant à des indices se voyait annoncer « des
 *    termites ont été constatés ». Le nom du document devenait sa conclusion.
 *
 * 2. LE FILTRE D'ENTRÉE. `zonesTermites` n'examinait que les lignes portant
 *    « indice d'infestation ». Une ligne « Cave — Solives — Présence de
 *    termites » était écartée avant examen, et la zone touchée n'existait
 *    nulle part.
 *
 * 3. LA PHRASE COMPTÉE COMME ZONE. La conclusion « Présence de termites
 *    vivants constatée dans la cave. » devenait une zone anonyme de plus : le
 *    verdict annonçait « dans 2 zones » là où le rapport n'en nomme qu'une.
 */
import { describe, expect, it } from 'vitest';
import { analyserTermites } from './analyse/reperages';

const ENTETE = [
  'ÉTAT RELATIF À LA PRÉSENCE DE TERMITES',
  'Le bien est situé dans une zone soumise à un arrêté préfectoral.'
];

const ABSENCE = [
  ...ENTETE,
  'Il n’a pas été repéré d’indice d’infestation de termites.',
  'Séjour — Plinthes — Absence d’indices d’infestation de termites'
];

const INDICES = [
  ...ENTETE,
  'Il a été repéré des indices d’infestation de termites.',
  'Cave — Solives — Présence d’indices d’infestation de termites'
];

const INFESTATION = [
  ...ENTETE,
  'Présence de termites vivants constatée dans la cave.',
  'Cave — Solives — Présence de termites'
];

describe('1. absence d’indice', () => {
  it('conclut favorablement, sans rien promettre', () => {
    const d = analyserTermites(ABSENCE, [6, 6]);
    expect(d.gravite).toBe('bon');
    expect(d.verdict).toMatch(/aucun indice/i);
    expect(d.verdict, 'la conclusion se borne aux parties visitées').toMatch(/parties visitées/i);
  });
});

describe('2. présence d’indices', () => {
  it('conclut gravement et nomme des indices, pas des termites', () => {
    const d = analyserTermites(INDICES, [6, 6]);
    expect(d.gravite).toBe('alerte');
    expect(d.verdict).toMatch(/indices/i);
    expect(
      d.verdict,
      'annoncer des termites là où le rapport décrit des traces serait plus grave que la réalité'
    ).not.toMatch(/des termites ont été constatés/i);
  });

  it('marque la zone où les indices ont été relevés', () => {
    const d = analyserTermites(INDICES, [6, 6]);
    const zones = d.schema?.genre === 'pieces' ? d.schema.zones : [];
    expect(zones.some((z) => z.etat === 'alerte')).toBe(true);
  });
});

describe('3. présence de termites — le troisième état', () => {
  it('porte la gravité maximale', () => {
    expect(analyserTermites(INFESTATION, [6, 6]).gravite).toBe('alerte');
  });

  /** Le mot compte : c'est de lui que découle la déclaration en mairie. */
  it('nomme les termites, et ne se déclare pas illisible', () => {
    const d = analyserTermites(INFESTATION, [6, 6]);
    expect(d.verdict).toMatch(/termites ont été constatés/i);
    expect(d.verdict).not.toMatch(/n’a pas pu être lue/i);
  });

  it('nomme la zone touchée', () => {
    const d = analyserTermites(INFESTATION, [6, 6]);
    const zones = d.schema?.genre === 'pieces' ? d.schema.zones : [];
    expect(zones.some((z) => z.etat === 'alerte')).toBe(true);
  });

  /** Le piège n° 3 : la phrase de conclusion n'est pas une zone. */
  it('ne compte pas la conclusion comme une zone de plus', () => {
    const d = analyserTermites(INFESTATION, [6, 6]);
    expect(d.verdict, 'le rapport ne nomme qu’une zone').toMatch(/dans 1 zone\./);
  });
});

describe('le piège du titre', () => {
  /**
   * L'intitulé du diagnostic contient « présence de termites ». Il ne doit
   * jamais valoir conclusion — sinon tous les rapports de France annoncent une
   * infestation.
   */
  it('l’intitulé ne fait pas conclure à une infestation', () => {
    const d = analyserTermites(ABSENCE, [6, 6]);
    expect(d.gravite).toBe('bon');
    expect(d.verdict).not.toMatch(/termites ont été constatés/i);
  });

  it('même avec la forme longue de l’intitulé', () => {
    const d = analyserTermites(
      [
        'ÉTAT DU BÂTIMENT RELATIF À LA PRÉSENCE DE TERMITES',
        'Il n’a pas été repéré d’indice d’infestation de termites.',
        'Séjour — Plinthes — Absence d’indices d’infestation de termites'
      ],
      [6, 6]
    );
    expect(d.gravite).toBe('bon');
  });
});
