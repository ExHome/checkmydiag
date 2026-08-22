import { describe, expect, it } from 'vitest';
import { blocs, champ, lireFicheTechnique } from './ficheTechnique';

/**
 * La fiche technique du logement — relevée sur des volets DPE réels.
 *
 * Les extraits ci-dessous sont copiés du corpus, à la ligne près, en retirant
 * les pieds de page qui portent le nom du cabinet et la référence du dossier.
 * C'est la mise en page qui est testée : c'est elle qui casse, et elle ne
 * s'invente pas.
 */

/** Un mur, écrit comme le tableau l'écrit : marqueur collé sur la deuxième rangée. */
const MUR_1 = [
  'Fiche technique du logement',
  'Généralités',
  'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
  'Département Observé / mesuré 33 Gironde',
  'Altitude Donnée en ligne 4 m',
  'Année de construction Estimé 1989 - 2000',
  'Enveloppe',
  'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
  'Surface du mur Observé / mesuré 23,63 m²',
  'Type d\'adjacence Observé / mesuré des circulations sans ouverture directe sur l\'extérieur',
  'Mur 1 Nord Surface Aue Observé / mesuré 0 m²',
  'Etat isolation des parois Aue Observé / mesuré non isolé',
  'Matériau mur Observé / mesuré Mur en béton banché',
  'Isolation Observé / mesuré non',
  'Surface du mur Observé / mesuré 6,98 m²',
  'Mur 3 Sud',
  'Type d\'adjacence Observé / mesuré l\'extérieur',
  'Matériau mur Observé / mesuré Inconnu (à structure lourde)',
  'Isolation Observé / mesuré oui',
  'Année isolation Valeur par défaut 1989 - 2000'
];

describe('la fiche technique du logement', () => {
  it('se déclare absente plutôt que de deviner', () => {
    const fiche = lireFicheTechnique(['Diagnostic de performance énergétique', 'Classe D']);
    expect(fiche.presente).toBe(false);
    expect(fiche.champs).toHaveLength(0);
  });

  it('nomme ses rubriques d’après le rapport', () => {
    const fiche = lireFicheTechnique(MUR_1);
    expect(fiche.presente).toBe(true);
    expect(fiche.champs.map((c) => c.section)).toContain('Généralités');
    expect(fiche.champs.map((c) => c.section)).toContain('Enveloppe');
  });

  it('retient l’origine de chaque donnée, pas seulement sa valeur', () => {
    const fiche = lireFicheTechnique(MUR_1);
    expect(champ(fiche, null, /^Altitude$/)?.origine).toBe('en ligne');
    expect(champ(fiche, null, /^Année de construction$/)?.origine).toBe('estimé');
    expect(champ(fiche, null, /^Département$/)?.origine).toBe('observé');
    expect(champ(fiche, 'Mur 3 Sud', /^Année isolation$/)?.origine).toBe('défaut');
  });

  /*
   * Le cœur de l'affaire : deux murs, deux verdicts opposés. Le corps du
   * rapport les résume en une ligne ; l'annexe les distingue.
   */
  it('garde chaque mur séparé, avec son isolation propre', () => {
    const murs = blocs(lireFicheTechnique(MUR_1), 'mur');
    expect(murs).toHaveLength(2);
    expect(murs[0]?.groupe).toBe('Mur 1 Nord');
    expect(murs[1]?.groupe).toBe('Mur 3 Sud');

    const isolation = (b: (typeof murs)[number]) =>
      b.champs.find((c) => c.libelle === 'Isolation')?.valeur;
    expect(isolation(murs[0] as (typeof murs)[number])).toBe('non');
    expect(isolation(murs[1] as (typeof murs)[number])).toBe('oui');
  });

  it('reconnaît le marqueur seul sur sa ligne comme collé devant un libellé', () => {
    const fiche = lireFicheTechnique(MUR_1);
    expect(champ(fiche, 'Mur 1 Nord', /^Surface Aue$/)?.valeur).toBe('0 m²');
    expect(champ(fiche, 'Mur 3 Sud', /^Surface du mur$/)?.valeur).toBe('6,98 m²');
  });

  /*
   * Le libellé s'enroule AUTOUR de sa valeur : la ligne du milieu commence par
   * l'origine, et les deux moitiés du libellé l'encadrent.
   */
  it('recolle un libellé coupé en deux par la mise en page', () => {
    const fiche = lireFicheTechnique([
      'Fiche technique du logement',
      'Enveloppe',
      'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
      'Type de pb Observé / mesuré Dalle béton',
      'Année de',
      'Valeur par défaut 1989 - 2000',
      'construction/rénovation'
    ]);
    const c = champ(fiche, null, /construction/);
    expect(c?.libelle).toBe('Année de construction/rénovation');
    expect(c?.valeur).toBe('1989 - 2000');
    expect(c?.origine).toBe('défaut');
  });

  /*
   * La valeur s'enroule autour de son libellé : la ligne du milieu FINIT par
   * l'origine. C'est le cas des générateurs, dont le nom réglementaire est long.
   */
  it('recolle une valeur coupée en deux par la mise en page', () => {
    const fiche = lireFicheTechnique([
      'Fiche technique du logement',
      'Systèmes',
      'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
      'Electrique - Radiateur électrique à fluide caloporteur (modélisé',
      'Type générateur Observé / mesuré',
      'comme un radiateur NFC, NF** et NF***)'
    ]);
    const c = champ(fiche, null, /^Type générateur$/);
    expect(c?.valeur).toBe(
      'Electrique - Radiateur électrique à fluide caloporteur (modélisé comme un radiateur NFC, NF** et NF***)'
    );
  });

  /*
   * Deux générateurs de chauffage : les deux doivent survivre. Le bloc suivant
   * s'ouvre au retour d'un libellé déjà vu, sans dépendre de l'endroit où la
   * cellule fusionnée « Chauffage 1 » est retombée.
   */
  it('garde tous les générateurs, pas seulement le principal', () => {
    const fiche = lireFicheTechnique([
      'Fiche technique du logement',
      'Systèmes',
      'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
      'Type générateur Observé / mesuré Electrique - Panneau rayonnant électrique',
      'Chauffage 1 Energie utilisée Observé / mesuré Electrique',
      'Type émetteur Observé / mesuré Panneau rayonnant électrique',
      'Type générateur Observé / mesuré Electrique - Radiateur à fluide caloporteur',
      'Energie utilisée Observé / mesuré Electrique',
      'Type émetteur Observé / mesuré Radiateur à fluide caloporteur'
    ]);
    const chauffages = fiche.blocs.filter((b) =>
      b.champs.some((c) => c.libelle === 'Type générateur')
    );
    expect(chauffages).toHaveLength(2);
    expect(chauffages[0]?.champs[0]?.valeur).toContain('Panneau rayonnant');
    expect(chauffages[1]?.champs[0]?.valeur).toContain('fluide caloporteur');
  });

  it('ignore les pieds de page qui traversent le tableau', () => {
    const fiche = lireFicheTechnique([
      'Fiche technique du logement',
      'Enveloppe',
      'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
      'Isolation Observé / mesuré non',
      'SARL EXEMPLE | Tél : 00.00.00.00.00 | Dossier : 00/AAA/0000A Page 7/11',
      'Matériau mur Observé / mesuré Mur en béton banché'
    ]);
    expect(fiche.champs.map((c) => c.libelle)).toEqual(['Isolation', 'Matériau mur']);
  });
  /*
   * La frontière entre deux objets de genres différents.
   *
   * Rien ne se répète entre un plafond et la fenêtre qui le suit : sans une
   * frontière tirée sur le changement de genre, la fenêtre entrait dans le bloc
   * du plafond, et « Type de vitrage » se lisait comme une donnée de toiture.
   */
  it('ferme un bloc quand l’objet change de nature', () => {
    const fiche = lireFicheTechnique([
      'Fiche technique du logement',
      'Enveloppe',
      'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
      'Surface de plancher haut Observé / mesuré 64,4 m²',
      'Plafond',
      'Type de ph Observé / mesuré Dalle béton',
      'Isolation Observé / mesuré inconnue',
      'Surface de baies Observé / mesuré 1,17 m²',
      'Fenêtre 1 Sud Type de vitrage Observé / mesuré double vitrage'
    ]);
    const hauts = blocs(fiche, 'plancherHaut');
    const baies = blocs(fiche, 'baie');
    expect(hauts).toHaveLength(1);
    expect(baies).toHaveLength(1);
    expect(hauts[0]?.champs.map((c) => c.libelle)).not.toContain('Type de vitrage');
    expect(baies[0]?.groupe).toBe('Fenêtre 1 Sud');
  });

  /*
   * Le nom du mur s'imprime AU MILIEU de sa propre valeur : la cellule fusionnée
   * tombe sur une rangée visuelle, sans égard pour la cellule que cette rangée
   * coupe en deux.
   */
  it('retrouve un nom d’objet intercalé dans une valeur enroulée', () => {
    const fiche = lireFicheTechnique([
      'Fiche technique du logement',
      'Enveloppe',
      'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
      'Surface du mur Observé / mesuré 6,24 m²',
      'Mur en pierre de taille et moellons constitué d’un seul matériau ou',
      'Matériau mur Observé / mesuré',
      'Mur 4 Nord',
      'inconnu',
      'Epaisseur mur Observé / mesuré 55 cm'
    ]);
    const murs = blocs(fiche, 'mur');
    expect(murs).toHaveLength(1);
    expect(murs[0]?.groupe).toBe('Mur 4 Nord');
    expect(champ(fiche, 'Mur 4 Nord', /^Matériau mur$/)?.valeur).toBe(
      'Mur en pierre de taille et moellons constitué d’un seul matériau ou inconnu'
    );
  });

  /* Même piège, autre forme : le nom précède la seconde moitié de la valeur. */
  it('retrouve un nom d’objet collé devant la suite d’une valeur', () => {
    const fiche = lireFicheTechnique([
      'Fiche technique du logement',
      'Enveloppe',
      'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
      'Surface du mur Observé / mesuré 17,58 m²',
      'Mur en pierre de taille et moellons constitué d’un seul matériau ou',
      'Matériau mur Observé / mesuré',
      'Mur 4 Ouest inconnu'
    ]);
    expect(blocs(fiche, 'mur')[0]?.groupe).toBe('Mur 4 Ouest');
  });

  /*
   * Une paroi que le rapport n'a pas nommée reste une paroi. Six murs du corpus
   * sont dans ce cas : leur cellule fusionnée manque à l'extraction. Ils
   * comptent, sans nom inventé.
   */
  it('garde une paroi que le rapport n’a pas nommée', () => {
    const fiche = lireFicheTechnique([
      'Fiche technique du logement',
      'Enveloppe',
      'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
      'Surface du mur Observé / mesuré 51,42 m²',
      'Type d’adjacence Observé / mesuré l’extérieur',
      'Isolation Observé / mesuré inconnue'
    ]);
    const murs = blocs(fiche, 'mur');
    expect(murs).toHaveLength(1);
    expect(murs[0]?.groupe).toBeNull();
  });
});
