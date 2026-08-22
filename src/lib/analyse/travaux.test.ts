import { describe, expect, it } from 'vitest';
import { rattacher } from './celluleFusionnee';
import { lireGestes, lireTravaux } from './travaux';

/**
 * Les deux packs de travaux, copiés du corpus à la ligne près.
 *
 * Tout le piège du tableau tient dans ces lignes : l'étiquette du lot tombe au
 * milieu de la consigne qu'elle nomme, la performance est une colonne voisine
 * qui atterrit sur sa propre ligne, et les notes de fin de rangée n'ont pas de
 * point final.
 */
const RECOMMANDATIONS = [
  'Recommandations d ’ amélioration de la performance',
  'Des travaux peuvent vous permettre d ’ améliorer significativement l ’ efficacité énergétique',
  'Les travaux essentiels Montant estimé : 6200 à 9400 €',
  'Lot Description Performance recommandée',
  "Isolation des murs par l'intérieur.",
  "Avant d'isoler un mur, vérifier qu'il ne présente aucune",
  'R > 3,7 m².K/W',
  'Mur',
  "trace d'humidité.",
  "Faire intervenir un professionnel de l'isolation.",
  'Les travaux à',
  'envisager',
  'Montant estimé : 11400 à 17100 €',
  'Lot Description Performance recommandée',
  'Remplacer les fenêtres par des fenêtres double vitrage à',
  'isolation renforcée.',
  'Faire intervenir un professionnel type menuisier.',
  'Uw = 1,3 W/m².K, Sw = 0,3',
  'Portes et fenêtres',
  'Travaux à réaliser en lien avec la copropriété',
  'Travaux pouvant nécessiter une autorisation',
  "d'urbanisme",
  'Remplacer le système de chauffage par une pompe à',
  "chaleur air/air non réversible (la climatisation n'est pas",
  'considérée, en cas de mise en place votre étiquette énergie',
  'Chauffage SCOP = 4',
  'augmentera sensiblement).',
  'Faire intervenir un professionnel type plombier',
  'chauffagiste.',
  'Remplacer le système actuel par un appareil de type pompe',
  'à chaleur.',
  'Eau chaude sanitaire COP = 3',
  'Faire intervenir un professionnel type plombier',
  'chauffagiste.',
  'Commentaires :',
  "Pour l'installation de PAC, il faudra que le propriétaire obtienne l'autorisation de la copropriété.",
  'Évolution de la performance après travaux',
  'Préparez votre projet !',
  'Fiche technique du logement'
];

const travaux = () => lireTravaux(RECOMMANDATIONS);

describe('les travaux recommandés', () => {
  it('reprend la hiérarchie du rapport, sans la recalculer', () => {
    const t = travaux();
    expect(t.packs.map((p) => p.titre)).toEqual([
      'Les travaux essentiels',
      'Les travaux à envisager'
    ]);
    expect(t.packs.map((p) => p.priorite)).toEqual([1, 2]);
  });

  it('garde le montant du rapport tel qu’il est écrit', () => {
    expect(travaux().packs.map((p) => p.montant)).toEqual(['6200 à 9400 €', '11400 à 17100 €']);
  });

  /*
   * L'étiquette « Mur » tombe au milieu de « Avant d'isoler un mur, vérifier
   * qu'il ne présente aucune / trace d'humidité. » : la phrase qu'elle coupe lui
   * appartient, et la consigne se relit d'un bout à l'autre.
   */
  it('recolle une consigne coupée par l’étiquette de son lot', () => {
    const mur = travaux().packs[0]?.recommandations.find((r) => r.lot === 'Mur');
    expect(mur?.description).toBe(
      "Isolation des murs par l'intérieur. Avant d'isoler un mur, vérifier qu'il ne présente aucune trace d'humidité. Faire intervenir un professionnel de l'isolation."
    );
    expect(mur?.performance).toBe('R > 3,7 m².K/W');
  });

  /*
   * Deux étiquettes qui portent déjà leur texte — « Chauffage SCOP = 4 » et
   * « Eau chaude sanitaire COP = 3 » — se suivent. La consigne entre les deux
   * revient à la plus proche : sans cela, l'eau chaude restait accrochée au
   * chauffage.
   */
  it('ne laisse pas la consigne de l’eau chaude tomber dans le chauffage', () => {
    const pack = travaux().packs[1];
    const ecs = pack?.recommandations.find((r) => r.lot === 'Eau chaude sanitaire');
    const chauffage = pack?.recommandations.find((r) => r.lot === 'Chauffage');
    expect(ecs?.description).toBe(
      'Remplacer le système actuel par un appareil de type pompe à chaleur. Faire intervenir un professionnel type plombier chauffagiste.'
    );
    expect(ecs?.performance).toBe('COP = 3');
    expect(chauffage?.description).toContain('Remplacer le système de chauffage');
    expect(chauffage?.description).not.toContain('Remplacer le système actuel');
  });

  it('garde les précautions de fin de rangée avec leur lot', () => {
    const menuiseries = travaux().packs[1]?.recommandations.find(
      (r) => r.lot === 'Portes et fenêtres'
    );
    expect(menuiseries?.description).toContain('Travaux à réaliser en lien avec la copropriété');
    expect(menuiseries?.description).toContain("autorisation d'urbanisme");
  });

  it('sépare la performance de la consigne', () => {
    for (const pack of travaux().packs) {
      for (const r of pack.recommandations) {
        expect(r.description).not.toContain('SCOP =');
        expect(r.description).not.toContain('R > 3,7');
      }
    }
  });

  /*
   * Le commentaire du diagnostiqueur est souvent le plus utile du rapport. Il
   * s'arrête au titre suivant : la page tourne, il ne continue pas.
   */
  it('garde le commentaire du diagnostiqueur, et rien de plus', () => {
    expect(travaux().commentaires).toBe(
      "Pour l'installation de PAC, il faudra que le propriétaire obtienne l'autorisation de la copropriété."
    );
  });

  /*
   * §19 : le rapport ne donne pas la lettre projetée après travaux. Sa page est
   * une image, comme l'étiquette. On ne l'affichera donc pas.
   */
  it('n’annonce aucune classe après travaux', () => {
    expect(travaux().classesApresTravaux).toBe(false);
  });

  it('se déclare absent plutôt que d’inventer un plan de travaux', () => {
    const t = lireTravaux(['Diagnostic de performance énergétique', 'Classe D']);
    expect(t.presente).toBe(false);
    expect(t.packs).toHaveLength(0);
  });
});

describe('les gestes d’entretien — priorité 3', () => {
  const GESTES = [
    'Recommandations de gestion et d ’ entretien des équipements',
    'Pour maîtriser vos consommations d ’ énergie, la bonne gestion',
    'type d ’ entretien',
    "Vérifier la température d'eau du ballon (55°C-60°C) pour éviter le risque de développement de la",
    'Chauffe-eau',
    'légionnelle (en dessous de 50°C).',
    "Eclairage Eteindre les lumières lorsque personne n'utilise la pièce.",
    "Nettoyage et réglage de l'installation tous les 3 ans par un professionnel.",
    'Ventilation',
    'Nettoyer régulièrement les bouches.',
    'Fiche technique du logement'
  ];

  it('rattache un conseil coupé par son poste', () => {
    const g = lireGestes(GESTES);
    expect(g.find((x) => x.poste === 'Chauffe-eau')?.conseil).toBe(
      "Vérifier la température d'eau du ballon (55°C-60°C) pour éviter le risque de développement de la légionnelle (en dessous de 50°C)."
    );
  });

  /*
   * L'étiquette « Ventilation » est centrée entre ses deux conseils : celui qui
   * la précède est à elle autant que celui qui la suit.
   */
  it('prend les conseils des deux côtés de leur poste', () => {
    const vent = lireGestes(GESTES).find((x) => x.poste === 'Ventilation');
    expect(vent?.conseil).toContain("Nettoyage et réglage de l'installation");
    expect(vent?.conseil).toContain('Nettoyer régulièrement les bouches');
  });

  it('ne confond pas un poste d’entretien avec un lot de travaux', () => {
    /* « Isolation des murs par l'intérieur » ouvre une consigne, ce n'est pas un poste. */
    const lots = travaux().packs.flatMap((p) => p.recommandations.map((r) => r.lot));
    expect(lots).not.toContain('Isolation');
  });
});

describe('la cellule fusionnée', () => {
  it('n’attire rien quand l’étiquette porte déjà son texte', () => {
    const rangees = rattacher(
      ['Climatisation Néant', 'VMC SF Hygro B avant 2001', 'Ventilation'],
      /^(Climatisation|Ventilation)\b\s*(.*)$/i
    );
    expect(rangees[0]?.lignes).toEqual(['Néant']);
    expect(rangees[1]?.lignes).toEqual(['VMC SF Hygro B avant 2001']);
  });

  it('rend deux rangées quand l’étiquette revient deux fois', () => {
    const rangees = rattacher(
      ['Chauffage', 'Panneau rayonnant.', 'Chauffage', 'Radiateur à fluide.'],
      /^(Chauffage)\b\s*(.*)$/i
    );
    expect(rangees).toHaveLength(2);
    expect(rangees[0]?.lignes).toEqual(['Panneau rayonnant.']);
    expect(rangees[1]?.lignes).toEqual(['Radiateur à fluide.']);
  });

  it('ne rend rien plutôt que de deviner quand aucune étiquette n’existe', () => {
    expect(rattacher(['une ligne', 'une autre'], /^(Chauffage)\b\s*(.*)$/i)).toEqual([]);
  });
});
