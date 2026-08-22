/**
 * L'ÉCRAN ÉLECTRICITÉ, MESURÉ.
 *
 * Trois familles de vérifications, et aucune n'est décorative :
 *
 *  1. LA GÉOMÉTRIE. Le grand chiffre est en ivoire sur la bakélite nue. Si un
 *     seul trait de cuivre entrait dans son rectangle, le contraste local
 *     tomberait à 1,7:1. La zone libre n'est donc pas une intention de mise en
 *     page : c'est une contrainte, et elle se vérifie segment par segment.
 *
 *  2. LA COULEUR. Seize scènes — quatre moments × quatre gravités — et pour
 *     chacune le contraste RÉEL des couples affichés, calculé sur la couleur
 *     composée, celle que le compositeur du navigateur produira.
 *
 *  3. LA LECTURE. Les trois régimes, et surtout les cas où le produit doit se
 *     TAIRE : compte annoncé sans détail lisible, localisation recollée par la
 *     mise en page, conclusion cochée à la main.
 */
import { describe, expect, it } from 'vitest';
import type { Diagnostic } from '../../lib/modele';
import { BANDE_MORTE, contraste, dansLaBandeMorte, luminance, melange } from '../lumiere/contraste';
import { MOMENTS, lumiereDe, teinteDe } from '../lumiere/heure';
import { retraitDe } from '../lumiere/gravite';
import {
  BRIDE_CUIVRE,
  PLANCHER_FIL,
  filDe,
  lire,
  localisationsPropres
} from './lecture';
import {
  BOITIER,
  D_RESEAU,
  D_TERRE,
  DETACHE,
  HAUTEUR,
  LONGUEUR,
  STATIONS,
  ZONE_CHIFFRE,
  maillonDe
} from './parcours';

/** L'encre du produit, telle que `app.css` la déclare (`--verriere-ivoire`). */
const IVOIRE = '#f7f6f2';
const TISON = '#c85a2c';
const CUIVRE_JETON = '#e8b06a';
/** Le bord du dégradé de source, tel que `Cable.svelte` le pose. */
const BORD_SOURCE = 0.88;

const GRAVITES = ['bon', 'neutre', 'attention', 'alerte'] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   1 · LA GÉOMÉTRIE
   ═══════════════════════════════════════════════════════════════════════════ */

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Découpe un `d` fait uniquement de M/L/H/V en segments. */
function segments(d: string): Segment[] {
  const sortie: Segment[] = [];
  let x = 0;
  let y = 0;
  const jetons = d.match(/[MLHV][-\d. ]*/g) ?? [];
  for (const jeton of jetons) {
    const lettre = jeton[0];
    const n = jeton
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    const [a, b] = n;
    if (lettre === 'M') {
      x = a ?? 0;
      y = b ?? 0;
    } else if (lettre === 'L') {
      sortie.push({ x1: x, y1: y, x2: a ?? 0, y2: b ?? 0 });
      x = a ?? 0;
      y = b ?? 0;
    } else if (lettre === 'H') {
      sortie.push({ x1: x, y1: y, x2: a ?? 0, y2: y });
      x = a ?? 0;
    } else {
      sortie.push({ x1: x, y1: y, x2: x, y2: a ?? 0 });
      y = a ?? 0;
    }
  }
  return sortie;
}

/** Le segment touche-t-il le rectangle ? Segments droits uniquement. */
function touche(s: Segment, r: { x: number; y: number; largeur: number; hauteur: number }): boolean {
  const xmin = Math.min(s.x1, s.x2);
  const xmax = Math.max(s.x1, s.x2);
  const ymin = Math.min(s.y1, s.y2);
  const ymax = Math.max(s.y1, s.y2);
  return xmax >= r.x && xmin <= r.x + r.largeur && ymax >= r.y && ymin <= r.y + r.hauteur;
}

describe('la zone du grand chiffre', () => {
  /* La marge : un trait fait 1,15 unité d'épaisseur, un maillon 2,4 de rayon.
     On teste avec la moitié de la plus grosse, arrondie au-dessus. */
  const MARGE = 2.4;
  const zone = {
    x: ZONE_CHIFFRE.x - MARGE,
    y: ZONE_CHIFFRE.y - MARGE,
    largeur: ZONE_CHIFFRE.largeur + MARGE,
    hauteur: ZONE_CHIFFRE.hauteur + MARGE
  };

  it('aucun trajet du câble n’y entre', () => {
    for (const s of [...segments(D_RESEAU), ...segments(D_TERRE)]) {
      expect(
        touche(s, zone),
        `le segment ${s.x1},${s.y1} → ${s.x2},${s.y2} entre dans la zone du chiffre`
      ).toBe(false);
    }
  });

  it('aucun maillon n’y entre', () => {
    for (const s of STATIONS) {
      expect(touche({ x1: s.x, y1: s.y, x2: s.x, y2: s.y }, zone), s.cle).toBe(false);
    }
  });

  it('ni le boîtier ni la marque détachée', () => {
    expect(
      touche(
        { x1: BOITIER.x, y1: BOITIER.y, x2: BOITIER.x + BOITIER.largeur, y2: BOITIER.y + BOITIER.hauteur },
        zone
      )
    ).toBe(false);
    expect(touche({ x1: DETACHE.x, y1: DETACHE.y, x2: DETACHE.x, y2: DETACHE.y }, zone)).toBe(false);
  });

  it('tout le dessin tient dans le plateau', () => {
    for (const s of [...segments(D_RESEAU), ...segments(D_TERRE)]) {
      expect(Math.max(s.y1, s.y2)).toBeLessThanOrEqual(HAUTEUR);
      expect(Math.min(s.y1, s.y2)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('le parcours de la lumière', () => {
  it('visite les six maillons dans l’ordre de l’arrêté', () => {
    expect(STATIONS.map((s) => s.cle)).toEqual([
      'coupure',
      'differentiel',
      'terre',
      'surintensite',
      'salleDeau',
      'materiel'
    ]);
  });

  it('les distances croissent strictement — la lumière ne revient jamais en arrière', () => {
    const d = STATIONS.map((s) => s.distance);
    for (let i = 1; i < d.length; i++) {
      expect(d[i] ?? 0).toBeGreaterThan(d[i - 1] ?? 0);
    }
    expect(d[d.length - 1] ?? 0).toBeLessThanOrEqual(LONGUEUR);
  });

  it('les deux mécanismes du matériel tombent sur le même maillon', () => {
    expect(maillonDe('contactDirect')).toBe('materiel');
    expect(maillonDe('enveloppe')).toBe('materiel');
  });

  it('ce qui n’appartient pas à la chaîne électrique n’est jamais placé', () => {
    /* Mesuré : 3 anomalies électriques du corpus sortent en `combustion`, un
       classement faux de `mecanismeDe()` qu'on n'a pas le droit de corriger
       ici. Les dessiner sur un maillon serait affirmer une localisation. */
    expect(maillonDe('general')).toBeNull();
    expect(maillonDe('combustion')).toBeNull();
    expect(maillonDe('ventilation')).toBeNull();
    expect(maillonDe('tuyauterie')).toBeNull();
    expect(maillonDe('degradation')).toBeNull();
    expect(maillonDe('indices')).toBeNull();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   2 · LA COULEUR, SUR LES SEIZE SCÈNES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Scene {
  moment: string;
  gravite: string;
  sol: string;
  /** Le fil au plus faible : bord du dégradé. */
  filFaible: string;
  /** Le fil au plus fort : centre du dégradé. */
  filFort: string;
  halo: string;
  encreDouce: string;
}

function scene(moment: keyof typeof MOMENTS, gravite: (typeof GRAVITES)[number]): Scene {
  const l = lumiereDe(MOMENTS[moment]);
  const etat = retraitDe(gravite, l.intensite);
  const cuivre = teinteDe(Math.min(l.temperature, BRIDE_CUIVRE));
  const fil = filDe(l.intensite, etat.facteurLumiere, l.azimut);
  return {
    moment,
    gravite,
    sol: etat.sol,
    filFaible: melange(etat.sol, cuivre, fil.alpha * BORD_SOURCE),
    filFort: melange(etat.sol, cuivre, fil.alpha),
    halo: melange(etat.sol, cuivre, fil.halo),
    encreDouce: melange(etat.sol, IVOIRE, etat.encreDouce)
  };
}

const SCENES: Scene[] = [];
for (const m of Object.keys(MOMENTS) as (keyof typeof MOMENTS)[]) {
  for (const g of GRAVITES) SCENES.push(scene(m, g));
}

describe('les couleurs de l’écran, mesurées sur les seize scènes', () => {
  it('l’ivoire tient 4,5 sur la bakélite, partout', () => {
    const mesures = SCENES.map((s) => ({ ...s, c: contraste(IVOIRE, s.sol) }));
    console.log(
      '\nivoire sur bakélite :\n' +
        mesures.map((m) => `  ${m.moment.padEnd(5)} ${m.gravite.padEnd(9)} ${m.sol} → ${m.c.toFixed(2)}`).join('\n')
    );
    for (const m of mesures) expect(m.c, `${m.moment}/${m.gravite}`).toBeGreaterThanOrEqual(4.5);
  });

  it('l’encre douce tient 4,5 sur la bakélite, partout', () => {
    const mesures = SCENES.map((s) => ({ ...s, c: contraste(s.encreDouce, s.sol) }));
    console.log(
      '\nencre douce sur bakélite :\n' +
        mesures
          .map((m) => `  ${m.moment.padEnd(5)} ${m.gravite.padEnd(9)} ${m.encreDouce} → ${m.c.toFixed(2)}`)
          .join('\n')
    );
    for (const m of mesures) expect(m.c, `${m.moment}/${m.gravite}`).toBeGreaterThanOrEqual(4.5);
  });

  it('le fil tient 3:1 sur toute sa longueur, à toute heure', () => {
    const mesures = SCENES.map((s) => ({
      ...s,
      faible: contraste(s.filFaible, s.sol),
      fort: contraste(s.filFort, s.sol)
    }));
    console.log(
      '\ncuivre sur bakélite (bord → centre du dégradé) :\n' +
        mesures
          .map(
            (m) =>
              `  ${m.moment.padEnd(5)} ${m.gravite.padEnd(9)} ${m.filFaible} → ${m.faible.toFixed(2)}   ${m.filFort} → ${m.fort.toFixed(2)}`
          )
          .join('\n')
    );
    for (const m of mesures) {
      expect(m.faible, `${m.moment}/${m.gravite} bord`).toBeGreaterThanOrEqual(3);
      expect(m.fort, `${m.moment}/${m.gravite} centre`).toBeGreaterThanOrEqual(3);
    }
  });

  it('le fil ne s’éteint jamais avec le jour : son plancher est tenu', () => {
    for (const m of Object.keys(MOMENTS) as (keyof typeof MOMENTS)[]) {
      const l = lumiereDe(MOMENTS[m]);
      const etat = retraitDe('alerte', l.intensite);
      const fil = filDe(l.intensite, etat.facteurLumiere, l.azimut);
      expect(fil.alpha, m).toBeGreaterThanOrEqual(PLANCHER_FIL);
    }
  });

  it('la braise tient 3:1, et elle GAGNE quand la lumière se retire', () => {
    const clair = contraste(TISON, '#0a2b23');
    const grave = contraste(TISON, '#061b15');
    console.log(
      `\nbraise ${TISON} :\n  sur sol clair #0a2b23 → ${clair.toFixed(2)}\n  sur sol alerte #061b15 → ${grave.toFixed(2)}`
    );
    expect(clair).toBeGreaterThanOrEqual(3);
    expect(grave).toBeGreaterThan(clair);
  });

  it('la braise ne peut pas porter de texte, et c’est mesuré', () => {
    /* Sa luminance tombe dans la bande morte : ni l'ivoire ni le vert profond
       n'y tiennent 4,5. Le test grave la raison pour laquelle aucun libellé
       n'est posé dessus — si quelqu'un en pose un, il saura pourquoi c'est
       interdit. */
    expect(dansLaBandeMorte(TISON)).toBe(true);
    expect(contraste(IVOIRE, TISON)).toBeLessThan(4.5);
    expect(contraste('#0a2b23', TISON)).toBeLessThan(4.5);
  });

  it('le halo reste sous la bande morte : il ne peut pas laver un texte', () => {
    for (const s of SCENES) {
      expect(luminance(s.halo), `${s.moment}/${s.gravite}`).toBeLessThan(BANDE_MORTE.bas);
    }
  });

  it('le filet de cuivre du texte courant tient 3:1', () => {
    const c = contraste(CUIVRE_JETON, '#0a2b23');
    console.log(`\nfilet --cuivre ${CUIVRE_JETON} sur #0a2b23 → ${c.toFixed(2)}`);
    expect(c).toBeGreaterThanOrEqual(3);
  });

  it('le cuivre reste du cuivre : il ne blanchit jamais à midi', () => {
    const midi = lumiereDe(MOMENTS.midi);
    const bride = teinteDe(Math.min(midi.temperature, BRIDE_CUIVRE));
    expect(bride).toBe(CUIVRE_JETON);
    expect(teinteDe(midi.temperature)).not.toBe(bride);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   3 · LA LECTURE
   ═══════════════════════════════════════════════════════════════════════════ */

function volet(partiel: Partial<Diagnostic>): Diagnostic {
  return {
    type: 'electricite',
    titre: 'Installation électrique',
    verdict: '',
    gravite: 'bon',
    faits: [],
    explication: [],
    aFaire: [],
    schema: null,
    pages: [12, 14],
    ...partiel
  };
}

describe('les trois régimes', () => {
  it('sans anomalie : le cas nominal, 42 volets sur 56', () => {
    const d = lire(
      volet({
        gravite: 'bon',
        verdict: 'L’installation électrique ne présente aucune anomalie.',
        faits: [{ libelle: 'Anomalies relevées', valeur: '0' }]
      })
    );
    expect(d.regime).toBe('sansAnomalie');
    expect(d.nombre).toBe(0);
    expect(d.unite).toBe('anomalies relevées');
    expect(d.chaine).toBe('lisible');
    expect(d.badge).toBe('Le rapport dit');
  });

  it('le différentiel non essayé se déduit de la structure, pas d’une phrase', () => {
    const d = lire(
      volet({
        gravite: 'attention',
        faits: [
          { libelle: 'Anomalies relevées', valeur: '0' },
          {
            libelle: 'Points non vérifiés',
            valeur: '1',
            precision: 'L’installation n’était pas alimentée en électricité le jour de la visite.'
          }
        ]
      })
    );
    expect(d.regime).toBe('sansAnomalie');
    expect(d.nonVerifies).toEqual(['differentiel']);
    expect(d.nonVerifiesTexte?.nombre).toBe('1');
  });

  it('avec anomalies : chacune trouve son maillon, ou reste détachée', () => {
    const d = lire(
      volet({
        gravite: 'attention',
        faits: [{ libelle: 'Anomalies relevées', valeur: '3' }],
        releves: [
          {
            libelle:
              'L’installation électrique comporte au moins une connexion avec une partie active nue sous tension accessible',
            code: 'B7.3d',
            genre: 'anomalie'
          },
          {
            libelle: 'L’enveloppe d’au moins un matériel est détériorée',
            code: 'B7.1',
            genre: 'anomalie'
          },
          {
            libelle:
              'L’installation ne comporte pas de dispositif différentiel à haute sensibilité 30 mA',
            code: 'B2.1',
            genre: 'anomalie'
          }
        ]
      })
    );
    expect(d.regime).toBe('anomalies');
    expect(d.nombre).toBe(3);
    expect(d.points.map((p) => p.maillon)).toEqual(['materiel', 'materiel', 'differentiel']);
    expect(d.points.map((p) => p.boitier)).toEqual([false, true, false]);
    expect(d.prioritaires).toBe(1);
    expect(d.detaches).toBe(0);
    expect(d.chaine).toBe('lisible');
  });

  it('un point hors chaîne n’est jamais posé sur un maillon', () => {
    const d = lire(
      volet({
        gravite: 'attention',
        faits: [{ libelle: 'Points relevés', valeur: '1' }],
        releves: [{ libelle: 'Le rapport signale ce point du tableau', genre: 'anomalie' }]
      })
    );
    expect(d.points[0]?.maillon).toBeNull();
    expect(d.detaches).toBe(1);
  });

  it('compte annoncé sans détail lisible : la chaîne entière passe en raies', () => {
    const d = lire(
      volet({
        gravite: 'attention',
        verdict: 'L’installation électrique présente 2 anomalies.',
        faits: [{ libelle: 'Anomalies relevées', valeur: '2' }]
      })
    );
    expect(d.regime).toBe('anomalies');
    expect(d.nombre).toBe(2);
    expect(d.points).toHaveLength(0);
    /* Le point qui compte : six maillons allumés à côté d'un grand « 2 »
       diraient l'inverse de la donnée. */
    expect(d.chaine).toBe('brouillee');
  });

  it('conclusion cochée à la main : aucun chiffre, et surtout pas zéro', () => {
    const d = lire(
      volet({
        gravite: 'neutre',
        verdict: 'La conclusion est cochée à la main : un programme ne peut pas la lire.'
      })
    );
    expect(d.regime).toBe('nonLu');
    expect(d.nombre).toBeNull();
    expect(d.chaine).toBe('brouillee');
    expect(d.badge).toBe('Non lisible automatiquement');
  });

  it('le verdict de synthèse est annoncé comme tel — 38 volets sur 56', () => {
    const d = lire(volet({ gravite: 'bon', source: 'synthese' }));
    expect(d.badge).toBe('Écrit sur la page de synthèse du dossier');
  });

  it('le compte du rapport et le compte des libellés ne portent pas le même mot', () => {
    const rapport = lire(volet({ faits: [{ libelle: 'Anomalies relevées', valeur: '2' }] }));
    const moteur = lire(volet({ faits: [{ libelle: 'Points relevés', valeur: '2' }] }));
    expect(rapport.unite).toBe('anomalies relevées');
    expect(moteur.unite).toBe('points relevés');
    expect(moteur.precision).toBe('domaines et libellés énumérés par le rapport');
  });
});

describe('la localisation, et la mise en page qui déteint dessus', () => {
  it('garde ce qui est propre', () => {
    expect(localisationsPropres('R+1 - Salle de bain · RDC - Wc · RDC - Entrée dégagement')).toEqual([
      'R+1 - Salle de bain',
      'RDC - Wc',
      'RDC - Entrée dégagement'
    ]);
  });

  it('jette le fragment recollé, garde le voisin propre', () => {
    /* Chaîne réelle du corpus. */
    expect(
      localisationsPropres('2ème étage - mezzaninne · 2ème étage - mezzaninne2ème étage - mezzanin')
    ).toEqual(['2ème étage - mezzaninne']);
  });

  it('quand rien ne survit, on ne montre rien — et on le dit', () => {
    /* Chaîne réelle du corpus. */
    const valeur = '2ème étage - Entrée/cuisine2ème étage - 2ème étage - Salle de bain /Wc';
    expect(localisationsPropres(valeur)).toEqual([]);
    const d = lire(volet({ faits: [{ libelle: 'Où', valeur }] }));
    expect(d.localisations).toEqual([]);
    expect(d.localisationIllisible).toBe(true);
  });

  it('un étage écrit normalement n’est pas confondu avec un recollage', () => {
    expect(localisationsPropres('2ème étage - mezzanine')).toEqual(['2ème étage - mezzanine']);
  });
});
