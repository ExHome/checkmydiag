import { describe, expect, it } from 'vitest';
import { alimenteEnGaz, analyserGaz, constatationsGaz, typesConstates } from './securite';

/**
 * La rubrique « E. — Anomalies identifiées » d'un rapport gaz réel
 * (octobre 2024), avec ses coupures de colonnes d'origine. Sa page de synthèse
 * conclut « des anomalies de type A2 qui devront être réparées dans les
 * meilleurs délais » — et le produit annonçait « aucune anomalie ».
 */
const RUBRIQUE_E = [
  'Anomalies',
  'Points de contrôle (3) observées',
  'Libellé des anomalies et recommandations',
  '(4) (5)',
  '(selon la norme) (A1 , A2 ,',
  '(6) (7)',
  'DGI , 32c )',
  "5 : l'espace annulaire de la canalisation gaz à la pénétration dans le logement est",
  'obturé. Si oui, il est obturé. (Nota: ce libellé comporte une erreur et sera',
  "C.2 - L'espace prochainement corrigé par l'AFNOR pour être remplacé par \"l'espace annulaire de",
  "Tuyauteries fixes - Espace A2 la canalisation gaz à la pénétration dans le logement n'est pas obturée.\")",
  'annulaire Risque(s) constaté(s) : Accumulation de gaz dans l’habitation (le plus souvent',
  'en sous - sol ou en cave) provenant d’une fuite extérieure et pouvant entraîner une',
  'explosion.',
  '(3) Point de contrôle selon la norme utilisée.',
  "(4) A1 : L’installation présente une anomalie à prendre en compte lors d'une intervention ultérieure",
  "(5) A2 : L'installation présente une anomalie dont le caractère de gravité ne justifie pas",
  "(6) DGI : (Danger Grave et Immédiat) L'installation présente une anomalie suffisamment grave",
  '(7) 32c : la chaudière est de type VMC GAZ et l’installation présente une anomalie'
];

describe('les types d’anomalie constatés au gaz', () => {
  it('retient l’A2 du constat, et lui seul', () => {
    // La régression à ne jamais refaire : le produit disait « aucune anomalie »
    // là où le rapport demandait une réparation dans les meilleurs délais.
    expect(typesConstates(RUBRIQUE_E)).toBe('A2');
  });

  it('n’écoute pas les notes de bas de tableau', () => {
    // Chacune définit un type et en cite un seul : lues à l'endroit, elles
    // feraient conclure « A1 et A2 et DGI » sur tous les rapports du corpus.
    expect(typesConstates(RUBRIQUE_E.slice(14))).toBe('');
  });

  it('n’écoute pas la légende de colonne', () => {
    expect(typesConstates(['(selon la norme) (A1 , A2 ,', 'DGI , 32c )'])).toBe('');
  });

  it('rend vide une rubrique sans constat — et c’est un résultat', () => {
    expect(typesConstates(['Anomalies', 'Points de contrôle', 'Néant'])).toBe('');
  });

  it('ne compte pas le 32c parmi A1, A2 et DGI', () => {
    // Elle relève du syndic et du distributeur, pas du propriétaire.
    expect(typesConstates(['C.9 - Ventilation VMC GAZ 32c'])).toBe('');
  });

  it('retient un DGI, qui fait couper le gaz le jour même', () => {
    expect(typesConstates(['B.3 - Robinet de commande d’appareil DGI'])).toBe('DGI');
  });
});

/**
 * La rubrique G, « Constatations diverses », telle qu'elle sort d'un rapport
 * réel (octobre 2024). Ce n'est pas un fourre-tout : elle porte des obligations
 * de l'occupant dont l'absence pèse en cas de sinistre.
 */
const RUBRIQUE_G = [
  'G. - Constatations diverses',
  'Commentaires :',
  "Certains points de contrôles n'ont pu être contrôlés. De ce fait la responsabilité du donneur d'ordre reste",
  "Attestation de contrôle de moins d'un an de la vacuité des conduits de fumées non présentée",
  "Justificatif d'entretien de moins d'un an de la chaudière non présenté",
  "Le conduit de raccordement n'est pas visitable",
  "Au moins un assemblage par raccord mécanique est réalisé au moyen d'un ruban d'étanchéité",
  'Documents remis par le donneur d’ordre à l’opérateur de repérage :',
  'Néant'
];

describe('les constatations diverses du gaz', () => {
  it('remonte l’entretien et le ramonage non justifiés', () => {
    const c = constatationsGaz(RUBRIQUE_G);
    expect(c).toContain('entretien annuel de la chaudière non justifié');
    expect(c).toContain('ramonage des conduits non justifié');
  });

  it('relève aussi ce qui borne le contrôle', () => {
    expect(constatationsGaz(RUBRIQUE_G)).toContain('conduit de raccordement non visitable');
  });

  it('laisse au rapport les rappels de responsabilité', () => {
    // « la responsabilité du donneur d'ordre reste engagée » est une mention de
    // forme, imprimée partout : elle ne constate rien sur ce logement.
    for (const dit of constatationsGaz(RUBRIQUE_G)) expect(dit).not.toMatch(/responsabilité/i);
  });

  it('ne rend rien quand la rubrique est absente', () => {
    expect(constatationsGaz(['Etat de l’installation intérieure de Gaz', 'H. - Conclusion'])).toEqual([]);
  });
});

describe('l’installation qui n’était pas alimentée', () => {
  /*
   * Quatre volets sur dix-sept portent « Installation alimentée en gaz : NON ».
   * Quand le gaz est coupé, aucun essai n'a lieu : ni mesure du monoxyde, ni
   * contrôle en fonctionnement. « Aucune anomalie » veut alors dire « rien
   * constaté », pas « installation vérifiée ».
   */
  const VOLET = (alimente: 'OUI' | 'NON', ...suite: string[]) => [
    'Etat de l’Installation Intérieure de Gaz',
    'A. - Désignation du ou des bâtiments',
    'Nature du gaz distribué : ............. Gaz naturel',
    `Installation alimentée en gaz : ...... ${alimente}`,
    'E. - Anomalies identifiées',
    // Les constats vivent DANS la rubrique E : c'est là que le type se lit.
    ...suite,
    'H. - Conclusion',
    'L’installation ne comporte aucune anomalie.',
    'L’installation comporte des anomalies de type A1 qui devront être réparées ultérieurement.',
    'L’installation comporte des anomalies de type A2 qui devront être réparées dans les meilleurs délais.',
    'L’installation comporte des anomalies de type DGI qui devront être réparées avant remise en service.'
  ];

  it('lit le champ dans les deux sens', () => {
    expect(alimenteEnGaz(VOLET('NON'))).toBe(false);
    expect(alimenteEnGaz(VOLET('OUI'))).toBe(true);
    expect(alimenteEnGaz(['Etat de l’Installation Intérieure de Gaz'])).toBeNull();
  });

  it('nuance le « aucune anomalie » quand le gaz était coupé', () => {
    const d = analyserGaz(VOLET('NON'), [1, 5]);
    expect(d.verdict).toMatch(/n’était pas alimentée/i);
    expect(d.gravite).toBe('attention');
  });

  it('ne nuance rien quand l’installation était alimentée', () => {
    const d = analyserGaz(VOLET('OUI'), [1, 5]);
    expect(d.verdict).not.toMatch(/n’était pas alimentée/i);
  });

  it('dit que c’est l’opérateur qui a coupé, en cas de danger grave', () => {
    // Sinon on annoncerait « aucun essai n'a pu être fait » alors que
    // l'installation a bel et bien été examinée : c'est le diagnostic qui a
    // conduit à la coupure.
    const d = analyserGaz(
      VOLET('NON', 'C.7 - Organe de Coupure Générale DGI'),
      [1, 5]
    );
    const fait = d.faits.find((f) => f.libelle === 'Installation alimentée le jour de la visite');
    expect(fait?.precision).toMatch(/l’opérateur a fermé/i);
  });
});
