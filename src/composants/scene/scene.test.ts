/**
 * LE LANGAGE DES SCHÉMAS TIENT PAR SES INTERDITS.
 *
 * Ces tests ne vérifient pas qu'un dessin est joli. Ils vérifient qu'un schéma
 * ne peut pas dire ce que le rapport n'a pas dit — c'est la seule chose qui
 * distingue une interface de lecture d'une illustration.
 */
import { describe, expect, it } from 'vitest';
import {
  briquesTouchables,
  compter,
  ENCRE_PORTEUSE,
  ENCRE_TEXTE,
  ENCRE_TRAME,
  motDuRapport,
  noteDeLecture,
  OPACITE_ECLAIREE,
  OPACITE_REPOS,
  phraseDe,
  RANG,
  type Brique,
  type Scene
} from './scene';

describe('citer le rapport, ou dire que c’est nous qui parlons', () => {
  it('un mot du rapport porte sa source', () => {
    const m = motDuRapport('Mur en béton banché', 7);
    expect(m.source).toBe('rapport');
    expect(m.page).toBe(7);
  });

  /**
   * Les deux types ne se confondent pas : `source` les sépare, et un `Mot` ne
   * peut pas être fabriqué à partir d'une phrase de Verrière.
   */
  it('une note de Verrière ne se fait pas passer pour une citation', () => {
    const n = noteDeLecture('Cette rubrique n’a pas été lue.');
    expect(n.source).toBe('verriere');
    expect(n).not.toHaveProperty('page');
  });

  /** Le texte n'est pas retouché : ce sont les mots d'un professionnel. */
  it('le texte du rapport n’est ni reformulé ni tronqué', () => {
    const brut = 'Absence d’indices d’infestation de termites — parties visitées';
    expect(motDuRapport(brut).texte).toBe(brut);
  });
});

describe('les cinq états, et ce qu’ils exigent', () => {
  const mur = (etat: Brique): Brique => etat;

  it('le vert exige une preuve qu’on a regardé', () => {
    const b = mur({
      forme: 'paroi',
      id: 'm1',
      d: 'M0 0h10v10H0z',
      nom: 'Mur nord',
      dit: motDuRapport('Mur en briques creuses'),
      dehors: 'haut',
      etat: 'bon',
      sonde: motDuRapport('isolé — isolant 5 cm')
    });
    if (b.forme === 'volume') throw new Error('cas de test mal construit');
    expect(b.etat).toBe('bon');
    /* La sonde est la raison du vert : sans elle, l'objet ne compile pas. */
    expect(b).toHaveProperty('sonde');
  });

  /**
   * LA DISTINCTION QUI COMPTE LE PLUS. « Le rapport n'a pas pu » porte un
   * motif venu du rapport ; « nous n'avons pas su lire » porte une note de
   * Verrière. Confondre les deux accuse le diagnostiqueur.
   */
  it('« non contrôlé » et « non conclu » ne portent pas la même chose', () => {
    const nonControle = mur({
      forme: 'cellule',
      id: 'c1',
      d: 'M0 0h10v10H0z',
      nom: 'Cave',
      dit: motDuRapport('Sous-sol'),
      etat: 'nonControle',
      motif: motDuRapport('absence de trappe de visite')
    });
    const nonConclu = mur({
      forme: 'cellule',
      id: 'c2',
      d: 'M0 0h10v10H0z',
      nom: 'Combles',
      dit: motDuRapport('Combles perdus'),
      etat: 'nonConclu',
      note: noteDeLecture('Le modèle de ce rapport n’est pas encore couvert.')
    });

    /* On rétrécit le type avant de lire : `Brique` inclut le volume, qui n'a
       pas d'état. C'est exactement la garde que l'union impose au code de
       production, et le test s'y plie comme lui. */
    if (nonControle.forme === 'volume' || nonConclu.forme === 'volume') {
      throw new Error('cas de test mal construit');
    }
    expect(nonControle.etat === 'nonControle' && nonControle.motif.source).toBe('rapport');
    expect(nonConclu.etat === 'nonConclu' && nonConclu.note.source).toBe('verriere');
  });

  it('le rang de gravité ne met jamais le vert devant', () => {
    expect(RANG.alerte).toBeGreaterThan(RANG.attention);
    expect(RANG.attention).toBeGreaterThan(RANG.nonControle);
    expect(RANG.nonControle, 'un angle mort pèse plus qu’une absence de lecture').toBeGreaterThan(
      RANG.nonConclu
    );
    expect(RANG.bon).toBe(0);
  });
});

describe('la mise en lumière', () => {
  /**
   * Le faisceau est blanc, et c'est une contrainte mesurée : une couleur de
   * l'arrêté DPE éclairée tombe à 1,30 de contraste pour la classe G, très en
   * dessous du seuil de 3. C'est l'OPACITÉ qui change, pas la teinte.
   */
  it('la brique éclairée passe à l’opacité pleine', () => {
    expect(OPACITE_REPOS).toBeLessThan(OPACITE_ECLAIREE);
    expect(OPACITE_ECLAIREE).toBe(1);
  });

  /**
   * Les encres sont bornées par la mesure : sous la lampe, 0,55 tombe à 2,70 —
   * refusé pour un élément graphique. 0,72 tient 3,49.
   */
  it('ce qui porte une information reste au-dessus du seuil', () => {
    expect(ENCRE_PORTEUSE).toBeGreaterThanOrEqual(0.72);
    expect(ENCRE_TEXTE).toBe(1);
    expect(ENCRE_TRAME, 'la trame ne porte rien : elle peut disparaître').toBeLessThan(0.2);
  });
});

describe('une scène dit aussi ce qu’elle ne montre pas', () => {
  const scene: Scene = {
    titre: 'Les murs',
    question: 'Par où la chaleur s’en va-t-elle ?',
    briques: [
      { forme: 'volume', d: 'M0 0h100v60H0z', nom: 'le bâti' },
      {
        forme: 'paroi',
        id: 'm1',
        d: 'M0 0h10v60H0z',
        nom: 'Mur 1',
        dit: motDuRapport('Mur en béton banché'),
        dehors: 'gauche',
        etat: 'alerte'
      },
      {
        forme: 'paroi',
        id: 'm2',
        d: 'M90 0h10v60H90z',
        nom: 'Mur 2',
        dit: motDuRapport('Mur en briques creuses'),
        dehors: 'droite',
        etat: 'bon',
        sonde: motDuRapport('isolé — isolant 5 cm')
      },
      {
        forme: 'cellule',
        id: 'c1',
        d: 'M20 20h20v20H20z',
        nom: 'Cave',
        dit: motDuRapport('Sous-sol'),
        etat: 'nonControle',
        motif: motDuRapport('absence de trappe')
      }
    ],
    horsChamp: [motDuRapport('Les parties communes ne sont pas dans le périmètre.')]
  };

  it('le volume ne se touche pas', () => {
    expect(briquesTouchables(scene)).toHaveLength(3);
    expect(briquesTouchables(scene).every((b) => b.forme !== 'volume')).toBe(true);
  });

  it('le compte sert la phrase, pas le tri du dessin', () => {
    const c = compter(scene);
    expect(c).toEqual({ bon: 1, attention: 0, alerte: 1, nonControle: 1, nonConclu: 0 });
  });

  /** Un schéma qui se tait sur ses angles morts laisse croire qu'il est complet. */
  it('les angles morts font partie de la scène', () => {
    expect(scene.horsChamp.length).toBeGreaterThan(0);
    expect(scene.horsChamp[0]?.source).toBe('rapport');
  });
});

describe('chaque état a sa phrase, et aucune ne rassure à tort', () => {
  it('le vert cite la preuve qu’on a regardé', () => {
    const p = phraseDe({
      forme: 'jalon',
      id: 'j1',
      x: 10,
      y: 20,
      nom: 'Séjour',
      dit: motDuRapport('plinthes'),
      etat: 'bon',
      sonde: motDuRapport('absence d’indices')
    });
    expect(p).toMatch(/a regardé et n’a rien signalé/);
    expect(p).toMatch(/absence d’indices/);
  });

  it('l’angle mort dit que c’est le rapport qui n’a pas pu', () => {
    const p = phraseDe({
      forme: 'cellule',
      id: 'c1',
      d: '',
      nom: 'Cave',
      dit: motDuRapport('Sous-sol'),
      etat: 'nonControle',
      motif: motDuRapport('absence de trappe')
    });
    expect(p).toMatch(/le rapport n’a pas pu contrôler/);
  });

  it('l’absence de lecture ne se déguise pas en angle mort', () => {
    const p = phraseDe({
      forme: 'cellule',
      id: 'c2',
      d: '',
      nom: 'Combles',
      dit: motDuRapport('Combles'),
      etat: 'nonConclu',
      note: noteDeLecture('Cette rubrique n’a pas été lue.')
    });
    expect(p).not.toMatch(/le rapport n’a pas pu/);
    expect(p).toMatch(/n’a pas été lue/);
  });
});
