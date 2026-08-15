import { describe, expect, it } from 'vitest';
import { analyserAmiante } from './reperages';
import { zonesDe } from './plan';

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
