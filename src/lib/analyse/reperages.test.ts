import { describe, expect, it } from 'vitest';
import { analyserAmiante, analyserTermites } from './reperages';
import { zonesDe } from './plan';

/**
 * L'état parasitaire ne parle pas que des termites.
 *
 * Mesuré sur quarante dossiers : dix mentionnent la mérule, dix les
 * xylophages, neuf portent des constatations diverses. Conclure « aucun indice
 * d'infestation de termites » sans dire un mot de ces volets, c'est rassurer
 * par omission — la phrase est vraie, et le lecteur en tire le contraire.
 */
describe('les volets de l’état parasitaire', () => {
  const SANS_TERMITE = [
    'ÉTAT PARASITAIRE',
    "Il n'a pas été repéré d'indice d'infestation de termites."
  ];

  it('ne mentionne rien quand le rapport ne traite que des termites', () => {
    const d = analyserTermites(SANS_TERMITE, [3, 6]);
    expect(d.titre).toBe('Termites');
    expect(d.verdict).not.toMatch(/traite aussi/);
  });

  it('annonce la mérule quand le rapport la couvre', () => {
    const d = analyserTermites(
      [...SANS_TERMITE, 'Recherche de mérule et autres champignons lignivores : néant'],
      [3, 6]
    );

    expect(d.titre).toBe('État parasitaire');
    expect(d.verdict).toMatch(/traite aussi mérule et champignons du bois/i);
    expect(d.verdict).toMatch(/leur propre conclusion/);
  });

  it('reconnaît les insectes du bois sous leurs noms d’espèces', () => {
    for (const mot of ['capricornes', 'vrillettes', 'lyctus', 'insectes xylophages']) {
      const d = analyserTermites([...SANS_TERMITE, `Recherche de ${mot} : néant`], [3, 6]);
      expect(d.verdict, mot).toMatch(/insectes du bois/i);
    }
  });

  it('reconnaît la rubrique des constatations diverses', () => {
    const d = analyserTermites([...SANS_TERMITE, 'CONSTATATIONS DIVERSES : néant'], [3, 6]);
    expect(d.verdict).toMatch(/constatations diverses/i);
  });

  /*
   * Le garde-fou. On signale que le volet existe ; on ne lit pas sa conclusion
   * à sa place. Les formulations n'ont pas été mesurées, et une absence déduite
   * au jugé sur la mérule serait exactement l'erreur qu'on corrige partout.
   */
  it('n’invente aucune conclusion pour ces volets', () => {
    const d = analyserTermites(
      [...SANS_TERMITE, 'Mérule : présence constatée en cave', 'Constatations diverses : néant'],
      [3, 6]
    );

    expect(d.verdict).not.toMatch(/aucune mérule|pas de mérule|mérule absente/i);
    expect(d.verdict).toMatch(/leur propre conclusion dans le rapport/);
  });

  it('compte les volets dans les chiffres du rapport', () => {
    const d = analyserTermites(
      [...SANS_TERMITE, 'Mérule : néant', 'Capricornes : néant', 'Constatations diverses : néant'],
      [3, 6]
    );

    const fait = d.faits.find((f) => f.libelle === 'Autres volets du rapport');
    expect(fait?.valeur).toBe('3');
    expect(fait?.precision).toMatch(/Insectes du bois/);
  });
});

/**
 * Les listes de l'amiante, telles qu'un rapport les écrit : une ligne par
 * liste, chacune avec sa propre conclusion. C'est le seul endroit du document
 * qui affirme quelque chose sur la présence.
 *
 * Apostrophes droites, comme dans les rapports du corpus : les motifs de
 * `reperages.ts` lisent la ligne brute, sans passer par la normalisation.
 */
const RAPPORT = [
  'RAPPORT DE REPÉRAGE AMIANTE',
  'Date du repérage : 12/03/2024',
  "Liste A : il n'a pas été repéré de matériaux contenant de l'amiante.",
  "Liste B : il a été repéré des matériaux contenant de l'amiante."
];

describe('le plan de l’amiante', () => {
  const d = analyserAmiante(RAPPORT, [4, 9]);

  it('place une zone par liste citée', () => {
    expect(zonesDe(d).map((z) => z.nom)).toEqual(['Liste B', 'Liste A']);
  });

  it('reprend la conclusion de chaque liste, sans la retourner', () => {
    const zones = zonesDe(d);
    expect(zones.find((z) => z.nom === 'Liste A')?.etat).toBe('bon');
    expect(zones.find((z) => z.nom === 'Liste A')?.dit).toMatch(/ne relève aucun matériau/);
    expect(zones.find((z) => z.nom === 'Liste B')?.etat).toBe('attention');
    expect(zones.find((z) => z.nom === 'Liste B')?.dit).toMatch(/signale des matériaux/);
  });

  /*
   * Le garde-fou.
   *
   * Une liste que le rapport ne cite pas n'est pas une liste sans amiante. La
   * faire apparaître en vert affirmerait un contrôle qui n'a pas eu lieu —
   * exactement le travers qu'on a corrigé partout ailleurs.
   */
  it('n’ajoute pas les listes que le rapport ne cite pas', () => {
    expect(zonesDe(d).some((z) => z.nom === 'Liste C')).toBe(false);
  });

  it('dit que la liste C n’est pas celle de la vente', () => {
    const avecC = analyserAmiante(
      [...RAPPORT, "Liste C : il n'a pas été repéré de matériaux contenant de l'amiante."],
      [4, 9]
    );
    const c = zonesDe(avecC).find((z) => z.nom === 'Liste C');
    expect(c?.dit).toMatch(/avant démolition/);
  });

  it('ne dessine aucun plan quand le rapport ne cite aucune liste', () => {
    const sansListe = analyserAmiante(['RAPPORT DE REPÉRAGE AMIANTE', 'Date : 12/03/2024'], [4, 9]);
    expect(zonesDe(sansListe)).toEqual([]);
  });
});

/**
 * Une absence sur une liste n'efface pas une présence sur une autre.
 *
 * Un rapport d'amiante conclut liste par liste. Le moteur écrivait « pas de
 * phrase d'absence ET (présence ou liste positive) » : la première phrase
 * d'absence annulait tout le reste, et le verdict passait au vert sur un
 * logement amianté.
 *
 * C'est la faute la plus grave qu'un lecteur de diagnostic puisse commettre :
 * elle ne prive pas d'une information, elle affirme le contraire. Trouvée par
 * l'audit notarial.
 */
describe('une présence relevée ne se laisse pas annuler', () => {
  const MIXTE = [
    'RAPPORT DE REPÉRAGE AMIANTE',
    'Liste A : il n’a pas été repéré de matériaux et produits contenant de l’amiante.',
    'Liste B : il a été repéré des matériaux et produits contenant de l’amiante.'
  ];

  it('conclut à la présence quand une seule liste en trouve', () => {
    const d = analyserAmiante(MIXTE, [4, 9]);
    /* Le barème du produit : l'amiante repérée est « attention », pas
       « alerte » — un matériau en bon état qu'on ne touche pas ne libère rien.
       Ce qui compte ici, c'est qu'on ne conclue plus à l'absence. */
    expect(d.gravite).toBe('attention');
    expect(d.verdict).not.toMatch(/aucun|n’a pas été repéré/i);
  });

  it('ne conclut à l’absence que si aucune liste ne trouve rien', () => {
    const d = analyserAmiante(
      [
        'RAPPORT DE REPÉRAGE AMIANTE',
        'Liste A : il n’a pas été repéré de matériaux et produits contenant de l’amiante.',
        'Liste B : il n’a pas été repéré de matériaux et produits contenant de l’amiante.'
      ],
      [4, 9]
    );
    expect(d.gravite).toBe('bon');
  });

  it('le plan montre la liste positive en alerte, pas en vert', () => {
    const zones = zonesDe(analyserAmiante(MIXTE, [4, 9]));
    const b = zones.find((z) => z.nom === 'Liste B');
    expect(b?.etat).toBe('attention');
    expect(b?.dit).toMatch(/signale des matériaux/);
  });
});

/**
 * La forme dominante des rapports réels, mesurée sur quarante dossiers : la
 * liste est citée en intitulé de tableau, sans conclusion attachée. Elle
 * n'était pas reconnue du tout — un dossier sur quarante contre dix-huit.
 */
describe('les listes citées sans conclusion', () => {
  const CITATION = [
    'RAPPORT DE REPÉRAGE AMIANTE',
    'Matériaux et produits de la liste A',
    'Localisation Matériau Présence',
    'Matériaux de la liste B'
  ];

  it('reconnaît la liste citée en intitulé de tableau', () => {
    const zones = zonesDe(analyserAmiante(CITATION, [4, 9]));
    expect(zones.map((z) => z.nom).sort()).toEqual(['Liste A', 'Liste B']);
  });

  /*
   * Le garde-fou, et c'est le seul qui compte ici.
   *
   * Une liste citée dit où l'on a regardé, pas ce qu'on y a trouvé. Lui coller
   * la conclusion générale du rapport serait une déduction — et déduire une
   * absence d'amiante n'est pas une chose qu'on se permet.
   */
  it('ne transforme pas une catégorie contrôlée en constat d’absence', () => {
    const zones = zonesDe(analyserAmiante(CITATION, [4, 9]));
    for (const z of zones) {
      expect(z.etat).toBe('neutre');
      expect(z.dit).toMatch(/ne lui attache pas de conclusion propre/);
      expect(z.dit).not.toMatch(/ne relève aucun matériau|aucune trace|absence/i);
    }
  });

  it('la conclusion propre l’emporte sur la simple citation', () => {
    const zones = zonesDe(
      analyserAmiante(
        [...CITATION, "Liste A : il n'a pas été repéré de matériaux contenant de l'amiante."],
        [4, 9]
      )
    );
    const a = zones.filter((z) => z.nom === 'Liste A');
    expect(a).toHaveLength(1);
    expect(a[0]?.etat).toBe('bon');
  });
});

describe('l’arrêté préfectoral du termites', () => {
  /*
   * Le rapport pose la question sur une ligne et répond sur la suivante. Le
   * motif attrapait la QUESTION et affichait « Arrêté préfectoral : pris en
   * application de l » — un fait tronqué, qui ne dit rien à personne.
   */
  const ENTETE = [
    'Etat relatif à la présence de termites n° 25/IMO/0470AM',
    'A. - Désignation du ou des bâtiments',
    'Département : .................. Gironde'
  ];

  it('dit « aucun » quand le rapport répond Néant', () => {
    const d = analyserTermites(
      [
        ...ENTETE,
        "Situation du bien en regard d’un arrêté préfectoral pris en application de l’article L 131 - 5 du CCH :",
        'Néant'
      ],
      [1, 7]
    );
    const fait = d.faits.find((f) => f.libelle === 'Arrêté préfectoral');
    expect(fait?.valeur).toBe('aucun');
    expect(fait?.precision).toMatch(/zone délimitée/);
  });

  it('n’affiche jamais un morceau de la question', () => {
    const d = analyserTermites(
      [...ENTETE, "Situation du bien en regard d’un arrêté préfectoral pris en application de l’article L 131 - 5 du CCH :"],
      [1, 7]
    );
    const fait = d.faits.find((f) => f.libelle === 'Arrêté préfectoral');
    expect(fait?.valeur ?? '').not.toMatch(/pris en application/);
  });

  it('retient le numéro quand le rapport en donne un', () => {
    const d = analyserTermites(
      [...ENTETE, 'Le bien est concerné par l’arrêté préfectoral n° 33-2019-07-23-004 du 23 juillet 2019'],
      [1, 7]
    );
    expect(d.faits.find((f) => f.libelle === 'Arrêté préfectoral')?.valeur).toBe('33-2019-07-23-004');
  });
});
