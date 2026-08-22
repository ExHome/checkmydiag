/**
 * « INCONNUE » N'EST NI UN DÉFAUT NI UNE QUALITÉ.
 *
 * C'est la règle que cette scène existe pour tenir. Vu sur un rapport réel le
 * 22 août : cinq murs, dont deux dont le rapport écrit « inconnue » à la ligne
 * isolation. Les peindre en rouge annoncerait un défaut que personne n'a
 * constaté ; en vert, cela rassurerait sans preuve.
 *
 * Le partage suit la SOURCE de l'information, jamais la couleur :
 *
 *   isolé      → bon, et la sonde cite ce que le rapport a mesuré
 *   non isolé  → alerte, c'est un constat du rapport
 *   « inconnue » écrit par le rapport → nonControle, motif = son mot à lui
 *   rien de lu → nonConclu, note de Verrière
 */
import { describe, expect, it } from 'vitest';
import { anneeSupposeeDe, largeurParois, sceneParois } from './parois';
import { compter } from './scene';
import type { Paroi } from '../../lib/analyse/enveloppe';

function paroi(sur: Partial<Paroi> = {}): Paroi {
  return {
    nom: null,
    famille: 'mur',
    surface: 18.25,
    adjacence: 'l’extérieur',
    deperditive: true,
    materiau: 'Mur en béton banché',
    epaisseur: '≤ 20 cm',
    isolation: 'inconnu',
    isolationDite: null,
    origineIsolation: null,
    epaisseurIsolant: null,
    anneeIsolation: null,
    ...sur
  } as Paroi;
}

describe('l’état d’une paroi suit la source de l’information', () => {
  it('isolé : le vert cite ce que le rapport a mesuré', () => {
    const s = sceneParois([
      paroi({ isolation: 'isole', isolationDite: 'isolé', epaisseurIsolant: 'isolant 5 cm' })
    ]);
    const b = s?.briques[0];
    expect(b && 'etat' in b && b.etat).toBe('bon');
    expect(b && 'sonde' in b && b.sonde.texte).toBe('isolé — isolant 5 cm');
    expect(b && 'sonde' in b && b.sonde.source).toBe('rapport');
  });

  it('non isolé : c’est un constat, donc une alerte', () => {
    const s = sceneParois([paroi({ isolation: 'nonIsole' })]);
    const b = s?.briques[0];
    expect(b && 'etat' in b && b.etat).toBe('alerte');
  });

  /**
   * LE TEST QUI PORTE TOUT. Le rapport écrit « inconnue » : c'est LUI qui
   * déclare ne pas savoir. L'information lui appartient, et la scène la cite
   * au lieu de trancher à sa place.
   */
  it('« inconnue » écrit par le rapport reste au rapport', () => {
    const s = sceneParois([paroi({ isolation: 'inconnu', isolationDite: 'inconnue' })]);
    const b = s?.briques[0];
    expect(b && 'etat' in b && b.etat).toBe('nonControle');
    expect(b && 'motif' in b && b.motif.texte).toBe('inconnue');
    expect(b && 'motif' in b && b.motif.source, 'le mot est du rapport').toBe('rapport');
  });

  /** Et quand rien n'a été lu, le silence est le nôtre : on le dit. */
  it('une ligne non lue devient notre silence, pas celui du rapport', () => {
    const s = sceneParois([paroi({ isolation: 'inconnu', isolationDite: null })]);
    const b = s?.briques[0];
    expect(b && 'etat' in b && b.etat).toBe('nonConclu');
    expect(b && 'note' in b && b.note.source).toBe('verriere');
  });

  it('les quatre cas cohabitent sans se confondre', () => {
    const s = sceneParois([
      paroi({ isolation: 'isole', isolationDite: 'isolé' }),
      paroi({ isolation: 'nonIsole' }),
      paroi({ isolation: 'inconnu', isolationDite: 'inconnue' }),
      paroi({ isolation: 'inconnu' })
    ])!;
    expect(compter(s)).toEqual({ bon: 1, attention: 0, alerte: 1, nonControle: 1, nonConclu: 1 });
  });
});

describe('ce que le rapport dit de chaque paroi', () => {
  it('reprend matériau, surface, épaisseur et adjacence', () => {
    const s = sceneParois([paroi()]);
    const b = s?.briques[0];
    expect(b && 'dit' in b && b.dit.texte).toBe(
      'Mur en béton banché · 18.25 m² · ≤ 20 cm · donne sur l’extérieur'
    );
  });

  /** Sans détail, on ne fabrique pas de description : on dit qu'il n'y en a pas. */
  it('le dit quand le rapport ne détaille pas', () => {
    const s = sceneParois([
      paroi({ materiau: null, surface: null, epaisseur: null, adjacence: null })
    ]);
    const b = s?.briques[0];
    expect(b && 'dit' in b && b.dit.texte).toMatch(/ne détaille pas/);
  });

  it('nomme les parois que le rapport ne nomme pas', () => {
    const s = sceneParois([
      paroi({ famille: 'mur' }),
      paroi({ famille: 'plancherHaut' }),
      paroi({ famille: 'plancherBas' })
    ]);
    expect(s?.briques.map((b) => b.nom)).toEqual(['Mur 1', 'Toiture', 'Plancher bas']);
  });

  it('garde le nom du rapport quand il en donne un', () => {
    const s = sceneParois([paroi({ nom: 'Mur 2 Nord, Est' })]);
    expect(s?.briques[0]?.nom).toBe('Mur 2 Nord, Est');
  });
});

describe('l’année supposée dit qu’elle est supposée', () => {
  /**
   * Le logiciel déduit parfois l'année d'isolation de la période de
   * construction. Une valeur déduite affichée comme un fait est un mensonge
   * par omission de sa provenance.
   */
  it('marque la déduction du logiciel', () => {
    const p = paroi({ anneeIsolation: { valeur: '1983 - 1988', origine: 'défaut' } });
    expect(anneeSupposeeDe(p)).toMatch(/supposée par le logiciel, pas constatée sur place/);
  });

  /**
   * Trois des quatre origines ne sont pas une observation, et toutes le
   * disent. Le premier jet ne traitait que « défaut » — écrit sans accent, de
   * surcroît, donc jamais reconnu.
   */
  it('marque aussi l’estimation et la base de données', () => {
    expect(
      anneeSupposeeDe(paroi({ anneeIsolation: { valeur: '1990', origine: 'estimé' } }))
    ).toMatch(/estimée, pas constatée/);
    expect(
      anneeSupposeeDe(paroi({ anneeIsolation: { valeur: '1990', origine: 'en ligne' } }))
    ).toMatch(/base de données/);
  });

  it('ne marque rien quand le diagnostiqueur l’a observée', () => {
    const p = paroi({ anneeIsolation: { valeur: '2011', origine: 'observé' } });
    expect(anneeSupposeeDe(p)).toBe('Année d’isolation : 2011');
  });

  it('rend null quand le rapport n’en donne pas', () => {
    expect(anneeSupposeeDe(paroi())).toBeNull();
  });
});

describe('ce que la scène ne montre pas', () => {
  it('dit que le diagnostiqueur n’ouvre pas les parois', () => {
    const s = sceneParois([paroi()]);
    expect(s?.horsChamp.some((h) => /sans les ouvrir/i.test(h.texte))).toBe(true);
  });

  it('prévient que ce n’est pas un plan', () => {
    const s = sceneParois([paroi()]);
    expect(s?.horsChamp.some((h) => /ordre du rapport/i.test(h.texte))).toBe(true);
  });
});

describe('sans paroi, pas de scène', () => {
  it('rend null', () => {
    expect(sceneParois([])).toBeNull();
  });

  it('la largeur suit le nombre de parois', () => {
    const s = sceneParois([paroi(), paroi()])!;
    expect(largeurParois(s)).toBe(18 * 2 + 4);
  });
});
