import { describe, expect, it } from 'vitest';
import {
  classerDeperditions,
  compterIsolation,
  estDeperditive,
  etatIsolation,
  lireEnveloppe,
  verdictVitrage,
  type Baie,
  type Paroi
} from './enveloppe';
import { lireFicheTechnique } from './ficheTechnique';

/** Deux murs opposés, un plafond, deux baies dont une en simple vitrage. */
const LOGEMENT = [
  'Fiche technique du logement',
  'Généralités',
  'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
  'Département Observé / mesuré 33 Gironde',
  'Type de bien Observé / mesuré Appartement',
  'Année de construction Estimé 1989 - 2000',
  'Surface de référence du logement Observé / mesuré 61,68 m²',
  'Enveloppe',
  'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
  'Surface du mur Observé / mesuré 23,63 m²',
  'Mur 1 Nord Type d’adjacence Observé / mesuré l’extérieur',
  'Matériau mur Observé / mesuré Mur en béton banché',
  'Epaisseur mur Observé / mesuré ≤ 20 cm',
  'Isolation Observé / mesuré non',
  'Surface du mur Observé / mesuré 13,87 m²',
  'Mur 2 Est Type d’adjacence Observé / mesuré un local chauffé',
  'Matériau mur Observé / mesuré Mur en béton banché',
  'Isolation Observé / mesuré oui',
  'Année isolation Valeur par défaut 1989 - 2000',
  'Surface de plancher haut Observé / mesuré 64,4 m²',
  'Plafond Type d’adjacence Observé / mesuré l’extérieur',
  'Type de ph Observé / mesuré Dalle béton',
  'Isolation Observé / mesuré inconnue',
  'Surface de baies Observé / mesuré 1,17 m²',
  'Fenêtre 1 Sud Placement Observé / mesuré Mur 1 Nord',
  'Orientation des baies Observé / mesuré Sud',
  'Type menuiserie Observé / mesuré PVC',
  'Type de vitrage Observé / mesuré double vitrage',
  'U Fenêtre (calculé) Observé / mesuré 2,2',
  'Surface de baies Observé / mesuré 3,63 m²',
  'Fenêtre 2 Nord Orientation des baies Observé / mesuré Nord',
  'Type menuiserie Observé / mesuré Bois',
  'Type de vitrage Observé / mesuré simple vitrage'
];

const enveloppe = () => lireEnveloppe(lireFicheTechnique(LOGEMENT));

describe('l’enveloppe du logement', () => {
  it('reste vide, et le dit, quand la fiche technique manque', () => {
    const e = lireEnveloppe(lireFicheTechnique(['Classe D']));
    expect(e.presente).toBe(false);
    expect(e.parois).toHaveLength(0);
  });

  it('identifie le bien avec l’origine de chaque donnée', () => {
    const { bien } = enveloppe();
    expect(bien.typeDeBien?.valeur).toBe('Appartement');
    expect(bien.surfaceReference?.valeur).toBe('61,68 m²');
    expect(bien.anneeConstruction?.origine).toBe('estimé');
  });

  /*
   * Le cœur du §5 : deux murs, deux verdicts. Aucun mot unique ne les résume.
   */
  it('garde chaque paroi avec son état propre', () => {
    const murs = enveloppe().parois.filter((p) => p.famille === 'mur');
    expect(murs).toHaveLength(2);
    expect(murs[0]).toMatchObject({ nom: 'Mur 1 Nord', isolation: 'nonIsole', surface: 23.63 });
    expect(murs[1]).toMatchObject({ nom: 'Mur 2 Est', isolation: 'isole', surface: 13.87 });
    expect(compterIsolation(murs)).toEqual({ isole: 1, nonIsole: 1, inconnu: 0 });
  });

  it('conserve le mot du rapport à côté de l’état lu', () => {
    const plafond = enveloppe().parois.find((p) => p.famille === 'plancherHaut');
    expect(plafond?.isolation).toBe('inconnu');
    expect(plafond?.isolationDite).toBe('inconnue');
  });

  it('signale qu’une année d’isolation est supposée, pas constatée', () => {
    const mur = enveloppe().parois.find((p) => p.nom === 'Mur 2 Est');
    expect(mur?.anneeIsolation).toEqual({ valeur: '1989 - 2000', origine: 'défaut' });
  });

  /*
   * « Forte présomption » n'est pas un constat. Le §1 veut trois états : on ne
   * la range pas dans « isolé », et le mot reste visible.
   */
  it('ne prend pas une présomption pour un constat', () => {
    expect(etatIsolation('oui')).toBe('isole');
    expect(etatIsolation('oui (observation indirecte)')).toBe('isole');
    expect(etatIsolation('non')).toBe('nonIsole');
    expect(etatIsolation('inconnue')).toBe('inconnu');
    expect(etatIsolation('forte présomption')).toBe('inconnu');
    expect(etatIsolation(null)).toBe('inconnu');
  });

  it('sait quelle paroi donne sur le froid', () => {
    expect(estDeperditive('l’extérieur')).toBe(true);
    expect(estDeperditive('un local chauffé')).toBe(false);
    expect(estDeperditive('un terre-plein')).toBe(true);
    expect(estDeperditive('des circulations sans ouverture directe sur l’extérieur')).toBe(true);
    expect(estDeperditive(null)).toBeNull();
  });

  /*
   * LA RÈGLE ABSOLUE du §6 : une seule baie en simple vitrage se signale, même
   * entourée de double vitrage.
   */
  it('signale le simple vitrage même minoritaire', () => {
    const v = enveloppe().vitrages;
    expect(v.verdict).toBe('simpleVitrage');
    expect(v).toMatchObject({ simple: 1, double: 1, triple: 0 });
  });

  it('ne dit « tout est performant » qu’à bon droit', () => {
    const baie = (vitrage: Baie['vitrage']): Baie => ({
      nom: null,
      surface: 1,
      orientation: null,
      placement: null,
      ouverture: null,
      menuiserie: null,
      vitrage,
      vitrageDit: null,
      lameAir: null,
      volets: null,
      u: null
    });
    expect(verdictVitrage([baie('double'), baie('triple')]).verdict).toBe('toutPerformant');
    expect(verdictVitrage([baie('double'), baie(null)]).verdict).toBe('heterogene');
    expect(verdictVitrage([baie(null)]).verdict).toBe('insuffisant');
    expect(verdictVitrage([]).verdict).toBe('insuffisant');
  });

  /*
   * Le classement des déperditions. Le mur contre un local chauffé en sort : il
   * ne perd rien, et le montrer donnerait une fausse piste de travaux.
   */
  it('classe les surfaces qui donnent sur le froid, la plus grande d’abord', () => {
    const d = enveloppe().deperditions;
    expect(d.map((p) => p.libelle)).toEqual([
      'Plafond',
      'Mur 1 Nord',
      'Fenêtre 2 Nord',
      'Fenêtre 1 Sud'
    ]);
    expect(d.some((p) => p.libelle === 'Mur 2 Est')).toBe(false);
    expect(d[0]?.surface).toBe(64.4);
  });

  it('range un simple vitrage du côté de ce qui laisse passer', () => {
    const d = enveloppe().deperditions.find((p) => p.libelle === 'Fenêtre 2 Nord');
    expect(d?.isolation).toBe('nonIsole');
  });

  it('n’annonce aucun pourcentage : la page du rapport est une image', () => {
    expect(enveloppe().pourcentagesDisponibles).toBe(false);
  });

  it('écarte une paroi sans surface plutôt que de lui en inventer une', () => {
    const paroi: Paroi = {
      nom: 'Mur sans surface',
      famille: 'mur',
      surface: null,
      adjacence: 'l’extérieur',
      deperditive: true,
      materiau: null,
      epaisseur: null,
      isolation: 'nonIsole',
      isolationDite: 'non',
      origineIsolation: 'observé',
      epaisseurIsolant: null,
      anneeIsolation: null
    };
    expect(classerDeperditions([paroi], [])).toHaveLength(0);
  });
  /*
   * Un double vitrage n'est pas « isolé », c'est un double vitrage. Le mot suit
   * l'objet : une phrase qui sonne faux se fait relire deux fois, et c'est
   * autant de confiance perdue.
   */
  it('dit chaque état dans les mots de son objet', () => {
    const d = enveloppe().deperditions;
    expect(d.find((p) => p.libelle === 'Fenêtre 2 Nord')?.mot).toBe('simple vitrage');
    expect(d.find((p) => p.libelle === 'Fenêtre 1 Sud')?.mot).toBe('double vitrage');
    expect(d.find((p) => p.libelle === 'Mur 1 Nord')?.mot).toBe('non isolé');
    expect(d.find((p) => p.libelle === 'Plafond')?.mot).toBe('isolation non précisée');
  });

  it('porte la nuance du rapport jusque dans le détail du poste', () => {
    const fiche = [
      'Fiche technique du logement',
      'Enveloppe',
      'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
      'Surface du mur Observé / mesuré 9,80 m²',
      'Mur 1 Ouest Type d’adjacence Observé / mesuré l’extérieur',
      'Matériau mur Observé / mesuré Inconnu (à structure lourde)',
      'Isolation Observé / mesuré forte présomption'
    ];
    const poste = lireEnveloppe(lireFicheTechnique(fiche)).deperditions[0];
    expect(poste?.mot).toBe('isolation non précisée');
    expect(poste?.detail).toContain('le rapport écrit « forte présomption »');
  });
});
