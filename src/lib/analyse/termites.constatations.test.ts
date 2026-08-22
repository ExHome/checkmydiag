import { describe, expect, it } from 'vitest';
import { constatationsDiverses } from './termites.constatations';

/**
 * Les constatations diverses du rapport termites — un lecteur par éditeur.
 *
 * Tous les fragments ci-dessous sont recopiés de volets réels, dans l'ordre où
 * l'extraction les rend, coupures de mots et colonnes entrelacées comprises.
 *
 * Mesuré le 21/08/2026 : 250 volets termites, dont 238 LICIEL, 11 d'éditeur
 * inconnu et 1 BC2E. Rubrique présente dans 120 volets LICIEL sur 120.
 */

/* ------------------------------------------------------------------ LICIEL */

/** La forme majoritaire : rien que des clauses de limite. */
const LIMITES_SEULES = [
  'H. - Constatations diverses :',
  'Liste des ouvrages, parties',
  'Localisation Observations et constatations diverses',
  'd’ouvrages',
  'Le diagnostic se limite aux zones rendues visibles et accessibles',
  'par le propriétaire',
  'Les zones situées derrière les doublages des murs et plafonds n’ont',
  'Général -',
  'pas été visitées par défaut d’accès',
  'Nous nous engageons, lors d’une autre visite, à compléter le',
  'diagnostic sur les zones ayant été rendues accessibles',
  'Note 1: Les indices d’infestation des autres agents de dégradation biologique du bois sont notés'
];

/** Un vrai constat : moisissures et humidité, avec leurs pièces. */
const MOISISSURES = [
  'H. - Constatations diverses :',
  'Liste des ouvrages, parties',
  'Localisation Observations et constatations diverses',
  'd ’ ouvrages',
  'Traces de moisissures au plafond dans RDC: Cuisine et Séjour.',
  'Général -',
  'Traces d’humidité sur plinthes dans cuisine',
  'I. - Moyens d’investigation utilisés :'
];

describe('LICIEL — les constatations diverses', () => {
  it('trouve la rubrique et sépare les limites des constats', () => {
    const r = constatationsDiverses(LIMITES_SEULES, 'LICIEL');
    expect(r.trouvee).toBe(true);
    expect(r.editeur).toBe('LICIEL');
    expect(r.entrees.every((e) => e.nature === 'limite')).toBe(true);
    expect(r.entrees).toHaveLength(3);
  });

  it('⚠️ retire la localisation plantée EN PLEIN TEXTE, et la garde', () => {
    /*
     * « Général - » s'insère au milieu d'une phrase parce que la colonne de
     * gauche est centrée verticalement sur le bloc. Recoller sans la retirer
     * donne « … à compléter le Général - diagnostic sur les zones … ».
     */
    const r = constatationsDiverses(LIMITES_SEULES, 'LICIEL');
    expect(r.entrees.every((e) => e.ou === 'Général')).toBe(true);
    expect(r.entrees.some((e) => /Général/.test(e.terme))).toBe(false);
    expect(r.entrees.some((e) => /derrière les doublages des murs et plafonds/.test(e.terme))).toBe(
      true
    );
  });

  it('relève « traces de moisissures », que le motif du produit ne connaît pas', () => {
    /*
     * ⚠️ Le motif de `reperages.ts` est
     *   /mérule|champignons lignivores|coniophore|pourriture (cubique|fibreuse|molle)/
     * « Moisissures » n'y est pas. Ce constat-là passait entièrement inaperçu.
     *
     * Et l'ordre de mission (§ 12) impose le mot du rapport : si le rapport
     * écrit « moisissures », Verrière écrit moisissures. Ni « champignon », ni —
     * surtout — « mérule ».
     */
    const r = constatationsDiverses(MOISISSURES, 'LICIEL');
    const constats = r.entrees.filter((e) => e.nature === 'constat');
    expect(constats).toHaveLength(1);
    expect(constats[0]?.terme).toContain('Traces de moisissures au plafond dans RDC: Cuisine et Séjour.');
    expect(constats[0]?.terme).toContain('Traces d’humidité sur plinthes dans cuisine');
    expect(constats[0]?.terme).not.toMatch(/mérule|champignon/i);
  });

  it('⚠️ « Néant » n’est PAS « rubrique absente »', () => {
    /*
     * Les deux tirets sont les colonnes « Liste des ouvrages » et
     * « Localisation », vides. La rubrique existe et RÉPOND — 48 volets sur 120.
     * La différence est celle entre « rien d'autre constaté » et « on ne sait
     * pas s'il a regardé ».
     */
    const r = constatationsDiverses(
      [
        'H. - Constatations diverses :',
        'Liste des ouvrages, parties',
        'Localisation Observations et constatations diverses',
        'd’ouvrages',
        'Néant - -',
        'I. - Moyens d’investigation utilisés :'
      ],
      'LICIEL'
    );
    expect(r.trouvee).toBe(true);
    expect(r.neant).toBe(true);
    expect(r.entrees).toEqual([]);
  });

  it('⚠️ lit le titre même quand le mot est coupé par un espace', () => {
    /* « H. - Const atations diverses : » — un volet sur quarante. */
    const r = constatationsDiverses(
      ['H. - Const atations diverses :', 'd’ouvrages', 'Néant - -'],
      'LICIEL'
    );
    expect(r.trouvee).toBe(true);
    expect(r.neant).toBe(true);
  });

  it('⚠️ accepte la lettre I aussi bien que H', () => {
    /* Les deux rubriques échangent leur lettre : 32 « H », 7 « I » sur 40. */
    expect(constatationsDiverses(['I. - Constatations diverses :', 'Néant - -'], 'LICIEL').trouvee).toBe(
      true
    );
  });

  it('⚠️ écarte la date du pied de page insérée en plein texte', () => {
    /*
     * Le pied de page traverse la rubrique aux sauts de page. Sans le filtre,
     * on lirait « … des indices 29/04/2026 d'infestation … ».
     */
    const r = constatationsDiverses(
      [
        'H. - Constatations diverses :',
        '29/04/2026',
        'Liste des ouvrages, parties',
        'Localisation Observations et constatations diverses',
        'd ’ ouvrages',
        'Indices d’infestations de vrillettes dans pannes du plafond R+1:',
        'Général - entré/Cuisine/Séjour et Mezzanine',
        'Note 1: Les indices d’infestation des autres agents'
      ],
      'LICIEL'
    );
    expect(r.entrees[0]?.terme).not.toMatch(/29\/04\/2026/);
    expect(r.entrees[0]?.terme).toContain('vrillettes');
  });

  it('ne perd jamais un texte qu’il ne sait pas classer', () => {
    /* § 30 : interdiction de supprimer une information par simplification. */
    const r = constatationsDiverses(
      [
        'H. - Constatations diverses :',
        'd’ouvrages',
        'Une phrase que personne n’a jamais mesurée, et qui ne ressemble à rien.',
        'I. - Moyens d’investigation utilisés :'
      ],
      'LICIEL'
    );
    expect(r.entrees).toHaveLength(1);
    expect(r.entrees[0]?.nature).toBe('constat');
    expect(r.entrees[0]?.terme).toContain('que personne n’a jamais mesurée');
  });
});

/* -------------------------------------------------------------------- BC2E */

/**
 * ⚠️ Mesuré sur UN SEUL volet — le corpus n'en contient qu'un sur 250.
 *
 * C'est le cas d'école de la branche : la synthèse du rapport écrit « il n'a pas
 * été repéré d'indice d'infestation par les termites », et cette rubrique, trois
 * pages plus loin, écrit « Des indices d'infestation ont été repérés ».
 */
const BC2E = [
  'I. CONSTATATIONS DIVERSES :',
  'Indices d’infestation par des agents de dégradation biologique du bois autres que des termites :',
  'Des indices d’infestation ont été repérés. Ils ne sont pas causés par des termites. Les indices d’infestation des autres agents de',
  'dégradation biologique du bois sont notés de manière générale pour information du donneur d’ordre, il n’est donc pas nécessaire d’en',
  'indiquer la nature et le nombre de ces autres agents.',
  'NOTE 1 : Si le donneur d’ordre le souhaite, il fait réaliser une recherche de ces agents dont la méthodologie et les éléments sont décrits',
  'dans la norme NF P 03-200;',
  'Observations : Néant',
  'Indices d’infestation par des termites aux abords de l’immeuble examiné :',
  'Néant',
  'J. OBSERVATIONS :',
  'Néant',
  'Cachet de l’entreprise Dates de visite et d’établissement de l’état'
];

describe('BC2E — les constatations diverses', () => {
  it('lit « des indices ont été repérés », que LICIEL n’écrit jamais', () => {
    /*
     * C'est le constat le plus explicite du corpus sur la distinction que
     * l'ordre de mission (§ 11) exige — et il est introuvable avec un lecteur
     * écrit sur LICIEL, parce que la formulation n'y existe pas.
     */
    const r = constatationsDiverses(BC2E, 'BC2E');
    expect(r.trouvee).toBe(true);
    expect(r.editeur).toBe('BC2E');
    expect(r.neant).toBe(false);
    expect(r.entrees[0]?.terme).toContain('Des indices d’infestation ont été repérés');
    expect(r.entrees[0]?.terme).toContain('Ils ne sont pas causés par des termites');
  });

  it('écarte le texte-type que BC2E imprime dans tous les cas', () => {
    /* « … sont notés de manière générale pour information du donneur d'ordre »
       est du rappel réglementaire, pas un constat. */
    const r = constatationsDiverses(BC2E, 'BC2E');
    expect(r.entrees[0]?.terme).not.toMatch(/notés de manière générale/);
    expect(r.entrees[0]?.terme).not.toMatch(/NOTE 1/);
  });

  it('lit aussi la sous-rubrique des abords, que LICIEL n’a pas', () => {
    const r = constatationsDiverses(BC2E, 'BC2E');
    expect(r.entrees.some((e) => /aux abords de l’immeuble/.test(e.terme))).toBe(true);
  });
});

/* ---------------------------------------------------------------- INCONNU */

describe('éditeur non reconnu — on se tait', () => {
  it('⚠️ ne lit rien, même quand la rubrique RESSEMBLE à celle de LICIEL', () => {
    /*
     * Onze volets sur 250 n'ont aucun éditeur nommé, et leurs titres sont mot
     * pour mot ceux de LICIEL, tiret cadratin compris. Se ressembler n'est pas
     * être : la règle de sûreté impose de garder sur une signature POSITIVE,
     * jamais sur l'absence d'un signe.
     */
    const r = constatationsDiverses(LIMITES_SEULES, null);
    expect(r.trouvee).toBe(false);
    expect(r.editeur).toBeNull();
  });

  it('« pas lu » ne veut pas dire « rien à signaler »', () => {
    /*
     * § 15 et § 24 : une zone non examinée ne devient jamais une zone saine.
     * `trouvee: false` et `neant: true` sont deux états distincts, et
     * l'affichage ne doit pas les confondre.
     */
    const inconnu = constatationsDiverses(MOISISSURES, 'ANALYSIMMO');
    expect(inconnu.trouvee).toBe(false);
    expect(inconnu.neant).toBe(false);
  });
});
