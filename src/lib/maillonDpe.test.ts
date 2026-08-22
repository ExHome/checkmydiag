/**
 * LE MAILLON QUI RELIE LE LECTEUR D'ÉDITEUR À L'ÉCRAN.
 *
 * `lecteurs/dpe/liciel.ts` était écrit, testé et exporté par `LECTEURS_DPE` —
 * et personne ne l'appelait. Mesuré le 22 août 2026 : le diagnostic DPE ne
 * portait ni enveloppe ni systèmes, et les trois composants qui savent les
 * afficher n'étaient montés nulle part, faute de données à montrer.
 *
 * Ces tests gardent la chaîne fermée, et surtout ils gardent fermée la porte
 * que la contrainte du 21 août interdit d'ouvrir : chez un éditeur dont la
 * signature n'est pas reconnue, on ne lit RIEN. Un lecteur lâché hors de son
 * format ne rend pas moins d'information — il en rend de la fausse, en
 * silence.
 */
import { describe, expect, it } from 'vitest';
import { analyserDpe } from './analyse/dpe';

/**
 * La rubrique réglementaire qui nomme l'éditeur.
 *
 * C'est « Référence du logiciel validé », et rien d'autre : le motif est
 * strict, parce qu'une signature approximative ferait entrer un rapport dans
 * un lecteur qui n'est pas le sien.
 */
const SIGNATURE_LICIEL = 'Référence du logiciel validé : LICIEL Diagnostics v4.2';

const DESCRIPTIF = [
  'DIAGNOSTIC DE PERFORMANCE ÉNERGÉTIQUE',
  'Consommation : 373 kWh/m²/an',
  'Émissions : 26 kg CO2/m²/an',
  'Surface de référence : 48.5 m²',
  'Murs : Béton — Isolation : non isolé',
  'Toiture : Combles perdus — Isolation : inconnue',
  'Menuiseries : Double vitrage',
  'Chauffage : Chaudière gaz — Émetteurs : radiateurs',
  'Eau chaude sanitaire : Ballon électrique',
  'Ventilation : VMC simple flux'
];

const AVEC_EDITEUR = [DESCRIPTIF[0] as string, SIGNATURE_LICIEL, ...DESCRIPTIF.slice(1)];

function schemaDpe(lignes: string[]) {
  const d = analyserDpe([...lignes], [1, 2]);
  return d.schema?.genre === 'dpe' ? d.schema : null;
}

describe('le descriptif du bâtiment arrive jusqu’à l’écran', () => {
  it('un éditeur reconnu remplit la lecture', () => {
    const s = schemaDpe(AVEC_EDITEUR);
    expect(s?.lecture, 'la chaîne s’arrête avant l’écran').not.toBeNull();
  });

  /** Les quatre cartes de l'ordre de mission ont leur matière. */
  it('l’enveloppe et les systèmes sont là', () => {
    const lu = schemaDpe(AVEC_EDITEUR)?.lecture;
    expect(lu?.enveloppe).toBeTruthy();
    expect(lu?.systemes).toBeTruthy();
  });

  it('la ventilation est dans les systèmes', () => {
    const lu = schemaDpe(AVEC_EDITEUR)?.lecture;
    expect(lu?.systemes).toHaveProperty('ventilation');
  });

  it('le chauffage et l’eau chaude restent distincts', () => {
    const lu = schemaDpe(AVEC_EDITEUR)?.lecture;
    expect(lu?.systemes).toHaveProperty('chauffage');
    expect(lu?.systemes, 'l’ECS ne doit pas être fondue dans le chauffage').toHaveProperty(
      'eauChaude'
    );
  });
});

describe('chez un éditeur inconnu, on ne lit rien', () => {
  /**
   * LA RÈGLE QUI NE SE NÉGOCIE PAS. Sans signature, le descriptif reste
   * `null`. L'écran dira qu'il n'a pas lu — jamais qu'il n'y a rien.
   */
  it('sans signature, la lecture vaut null', () => {
    expect(schemaDpe(DESCRIPTIF)?.lecture).toBeNull();
  });

  /**
   * `null` et non `undefined` : la différence est lisible à l'écran. `null`
   * dit « on a cherché un éditeur et on n'en a reconnu aucun » ; une absence
   * de champ ne dirait rien du tout.
   */
  it('c’est null et non un champ absent', () => {
    const s = schemaDpe(DESCRIPTIF);
    expect(s).toHaveProperty('lecture');
    expect(s?.lecture).toBeNull();
  });

  /**
   * Une signature approximative ne suffit pas : « Logiciel utilisé » n'est pas
   * la rubrique réglementaire. Ce test a une histoire — c'est l'erreur que
   * j'ai faite en vérifiant le maillon, et qui m'a fait croire un instant
   * qu'il ne fonctionnait pas.
   */
  it('une rubrique approchante ne déclenche pas la lecture', () => {
    const approchant = [
      DESCRIPTIF[0] as string,
      'Logiciel utilisé : LICIEL Diagnostics — version 4.2',
      ...DESCRIPTIF.slice(1)
    ];
    expect(schemaDpe(approchant)?.lecture).toBeNull();
  });

  /**
   * Un éditeur inconnu n'empêche pas le diagnostic d'exister.
   *
   * C'est la moitié rassurante de la règle : on refuse de lire le DESCRIPTIF
   * sans signature, mais l'étiquette et la conclusion, elles, ont une forme
   * imposée par arrêté et se lisent partout. Un rapport d'éditeur inconnu
   * reste donc utile — il est seulement moins détaillé.
   *
   * (Ce test n'affirme pas de valeurs chiffrées : elles dépendent du format de
   * l'échantillon, pas du maillon. Les vérifier ici mesurerait l'échantillon.)
   */
  it('le diagnostic existe quand même, sans son descriptif', () => {
    const d = analyserDpe([...DESCRIPTIF], [1, 2]);
    expect(d.type).toBe('dpe');
    expect(d.verdict.length).toBeGreaterThan(0);
    expect(d.schema?.genre).toBe('dpe');
  });
});
