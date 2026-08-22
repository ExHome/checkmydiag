import { describe, expect, it } from 'vitest';
import { charpenteNonControlee, piecesNonVisitees } from './termites.nonvisitees';

/**
 * Rubrique F — les pièces que l'opérateur n'a PAS pu visiter.
 *
 * « EXAMINÉ + ABSENCE D'INDICE » n'est pas « NON EXAMINÉ » (§ 15). Et les pièces
 * non visitées sont, très majoritairement, **les combles** : c'est-à-dire la
 * charpente, l'endroit même où les termites se voient.
 *
 * Fragments recopiés de volets réels, coupures de mots comprises.
 */

const entete = [
  'F. – Identification des bâtiments et parties du bâtiment (pièces et volumes) n’ayant pu être',
  'visités et justification :'
];
const suite = ['G. - Identification des ouvrages, parties d’ouvrages et éléments qui n’ont pas été'];

const liciel = (...corps: string[]) => piecesNonVisitees([...entete, ...corps, ...suite], 'LICIEL');

describe('la rubrique F, chez LICIEL', () => {
  it('lit la pièce et son motif, séparément', () => {
    const r = liciel('1er étage - Combles (Absence de trappe de visite)');
    expect(r.trouvee).toBe(true);
    expect(r.neant).toBe(false);
    expect(r.pieces).toHaveLength(1);
    expect(r.pieces[0]?.ou).toBe('1er étage - Combles');
    expect(r.pieces[0]?.pourquoi).toBe('Absence de trappe de visite');
    /* On cite : le terme reste la ligne du rapport, entière. */
    expect(r.pieces[0]?.terme).toBe('1er étage - Combles (Absence de trappe de visite)');
  });

  it('⚠️ ne casse PAS un motif qui contient une virgule', () => {
    /*
     * « Plafond rampant, contrôle de la charpente impossible » porte une virgule
     * au milieu. Découper sur la virgule seule couperait le motif en deux et
     * inventerait une pièce nommée « contrôle de la charpente impossible ».
     * Le séparateur est « ), » — la virgule APRÈS la parenthèse fermante.
     */
    const r = liciel('Combles - Combles (Plafond rampant, contrôle de la charpente impossible.)');
    expect(r.pieces).toHaveLength(1);
    expect(r.pieces[0]?.pourquoi).toBe('Plafond rampant, contrôle de la charpente impossible.');
  });

  it('lit plusieurs pièces séparées par « ), »', () => {
    const r = liciel(
      'Cabanon 1 (Encombrement trop important), Cabanon 2 (Encombrement trop important)'
    );
    expect(r.pieces.map((p) => p.ou)).toEqual(['Cabanon 1', 'Cabanon 2']);
  });

  it('recolle un motif que le saut de ligne coupe en deux', () => {
    const r = liciel(
      'Combles - Combles (Absence d’accès : préconisation de création d’accès sécurisé par le',
      'propriétaire.)'
    );
    expect(r.pieces).toHaveLength(1);
    expect(r.pieces[0]?.pourquoi).toContain('sécurisé par le propriétaire.');
  });

  it('⚠️ « Néant » n’est pas « rubrique absente »', () => {
    /* Répondre n'est pas se taire : « Néant » dit que tout a été visité. */
    const r = liciel('Néant');
    expect(r.trouvee).toBe(true);
    expect(r.neant).toBe(true);
    expect(r.pieces).toEqual([]);
  });

  it('⚠️ lit le titre même quand un mot est coupé par un espace', () => {
    /* « (pièces et volu mes) », « bâtiment s », « visi tés » — relevés sur le
       corpus. Le titre s'accroche sur sa première ligne, aplatie. */
    const r = piecesNonVisitees(
      [
        'F. – Identification des bâtiment s et parties du bâtiment (pièces et volu mes) n’ayant pu être',
        'visi tés et justification :',
        'R+1 - Combles (Absence de trappe de visite)',
        ...suite
      ],
      'LICIEL'
    );
    expect(r.pieces).toHaveLength(1);
    expect(r.pieces[0]?.ou).toBe('R+1 - Combles');
  });

  it('écarte la date du pied de page qui traverse la rubrique', () => {
    const r = liciel('12/05/2026', 'Combles - Combles (Plafond rampant, contrôle impossible.)');
    expect(r.pieces).toHaveLength(1);
    expect(r.pieces[0]?.terme).not.toMatch(/12\/05\/2026/);
  });

  it('⚠️ ne prend pas la rubrique G pour la rubrique F', () => {
    /*
     * Les deux titres commencent par « Identification des… ». Seule la marque
     * « n'ayant pu » distingue F ; G dit « qui n'ont pas été examinés ».
     */
    const r = piecesNonVisitees(
      [
        'G. - Identification des ouvrages, parties d’ouvrages et éléments qui n’ont pas été',
        'examinés et justification :',
        'Mur Revetement fixé'
      ],
      'LICIEL'
    );
    expect(r.trouvee).toBe(false);
  });

  it('n’invente pas de motif quand le rapport n’en donne pas', () => {
    const r = liciel('Combles');
    expect(r.pieces[0]?.ou).toBe('Combles');
    expect(r.pieces[0]?.pourquoi).toBe('');
  });
});

describe('la rubrique F, chez BC2E', () => {
  it('⚠️ a un titre différent — « parties DE bâtimentS »', () => {
    /*
     * Le motif écrit sur LICIEL ne trouvait pas cette rubrique : elle
     * ressortait « ABSENTE » sur le seul volet BC2E du corpus.
     */
    const r = piecesNonVisitees(
      [
        'F. IDENTIFICATION DES BÂTIMENTS ET PARTIES DE BÂTIMENTS (PIÈCES ET VOLUMES) N’AYANT PU',
        'ÊTRE VISITÉS ET JUSTIFICATION :',
        'Néant',
        'G. IDENTIFICATION DES OUVRAGES, PARTIES D’OUVRAGES ET ÉLÉMENTS QUI N’ONT PAS ÉTÉ'
      ],
      'BC2E'
    );
    expect(r.trouvee).toBe(true);
    expect(r.neant).toBe(true);
    expect(r.editeur).toBe('BC2E');
  });
});

describe('éditeur non couvert — on se tait', () => {
  it('ne lit rien, et ne dit pas « rien »', () => {
    /* Onze volets sur 250 sont dans ce cas. `trouvee: false` veut dire « on n'a
       pas su lire », jamais « tout a été visité » (§ 15, § 24). */
    const r = piecesNonVisitees([...entete, 'R+1 - Combles (Absence de trappe)', ...suite], null);
    expect(r.trouvee).toBe(false);
    expect(r.neant).toBe(false);
    expect(r.pieces).toEqual([]);
  });
});

describe('la charpente, quand elle n’a pas été contrôlée', () => {
  it('se reconnaît sur les combles, la charpente, le grenier et la toiture', () => {
    /*
     * Ce n'est pas une pièce comme une autre : c'est là que les termites se
     * voient. Un « absence d'indices » sans montée dans les combles ne vaut pas
     * un « absence d'indices » sur un bien entièrement regardé.
     */
    expect(charpenteNonControlee(liciel('2ème étage - Combles (Accès condamné)'))).toBe(true);
    expect(
      charpenteNonControlee(
        liciel('Charpente sous plafond rampant (Contrôle impossible sous les doublages.)')
      )
    ).toBe(true);
    expect(charpenteNonControlee(liciel('1er étage - Combles / Toitures (Absence de trappe)'))).toBe(
      true
    );
  });

  it('ne se déclenche pas sur une pièce ordinaire', () => {
    expect(charpenteNonControlee(liciel('Rez de chaussée - Cellier (Emplacement non identifiable)'))).toBe(
      false
    );
  });

  it('ne se déclenche pas sur un « Néant »', () => {
    expect(charpenteNonControlee(liciel('Néant'))).toBe(false);
  });
});
