/**
 * Les contrôles qui ont servi à valider la table des petites surfaces.
 *
 * Aucune source secondaire ne reproduit ces seuils : ils ont été relevés au
 * texte de l'arrêté du 25 mars 2024, et vérifiés par trois recoupements. Ces
 * recoupements sont ici, figés. S'ils tombent un jour, c'est la table qu'il
 * faut reprendre au texte officiel — jamais le test qu'il faut assouplir.
 */
import { describe, expect, it } from 'vitest';
import { classePour } from './dpe';
import { enAltitude, seuilsClimat, seuilsEnergie, SURFACE_MAX, SURFACE_MIN } from './seuilsPetitesSurfaces';

/* Les seuils généraux de l'arrêté du 31 mars 2021, connus par ailleurs. */
const GENERAL_ENERGIE = [70, 110, 180, 250, 330, 420];
const GENERAL_CLIMAT = [6, 11, 30, 50, 70, 100];

describe('le raccord des deux échelles', () => {
  it('à 40 m², la table redonne exactement les seuils généraux', () => {
    /* C'est là que les deux échelles se rejoignent : une erreur de relevé se
       verrait immédiatement ici. */
    expect(seuilsEnergie(SURFACE_MAX)).toEqual(GENERAL_ENERGIE);
    expect(seuilsClimat(SURFACE_MAX)).toEqual(GENERAL_CLIMAT);
  });

  it('au-delà de 40 m², la table se tait : l’échelle générale reprend', () => {
    expect(seuilsEnergie(40.5)).toBeNull();
    expect(seuilsClimat(136.35)).toBeNull();
  });
});

describe('la forme de la table', () => {
  it('est plus indulgente pour les petits logements, et strictement', () => {
    /* Un studio consomme plus au mètre carré : ses seuils sont plus hauts. La
       décroissance doit être stricte à chaque mètre carré gagné. */
    for (let s = SURFACE_MIN; s < SURFACE_MAX; s++) {
      const ici = seuilsEnergie(s);
      const apres = seuilsEnergie(s + 1);
      expect(ici, `${s} m²`).not.toBeNull();
      expect(apres, `${s + 1} m²`).not.toBeNull();
      for (let i = 0; i < 6; i++) {
        expect(ici?.[i], `énergie, classe ${i}, ${s} → ${s + 1} m²`).toBeGreaterThanOrEqual(
          apres?.[i] ?? 0
        );
      }
    }
  });

  it('classe les seuils dans l’ordre A < B < C < D < E < F, à chaque surface', () => {
    for (let s = SURFACE_MIN; s <= SURFACE_MAX; s++) {
      for (const table of [seuilsEnergie(s), seuilsClimat(s)]) {
        expect(table).not.toBeNull();
        for (let i = 1; i < 6; i++) {
          expect(table?.[i], `${s} m², frontière ${i}`).toBeGreaterThan(table?.[i - 1] ?? 0);
        }
      }
    }
  });

  it('ne descend pas sous la première ligne de l’arrêté', () => {
    /* L'arrêté écrit « inférieure ou égale à 8 » : sous 8 m², c'est la même. */
    expect(seuilsEnergie(5)).toEqual(seuilsEnergie(8));
  });
});

describe('l’interpolation entre deux lignes', () => {
  it('place une surface intermédiaire entre ses deux voisines', () => {
    const a = seuilsEnergie(22);
    const b = seuilsEnergie(23);
    const milieu = seuilsEnergie(22.5);
    expect(milieu?.[0]).toBeCloseTo(((a?.[0] ?? 0) + (b?.[0] ?? 0)) / 2, 5);
  });

  it('rend la ligne exacte pour un nombre entier', () => {
    expect(seuilsEnergie(25)).toEqual([81, 121, 210, 280, 363, 454]);
    expect(seuilsClimat(25)).toEqual([7, 12, 32, 52, 73, 103]);
  });
});

describe('ce que la table change pour un studio', () => {
  it('un 25 m² à 200 kWh/m²/an n’est plus classé D mais C', () => {
    /* Sur l'échelle générale, 200 dépasse le seuil C|D fixé à 180. Sur la
       sienne, la frontière est à 210 : le même logement reste en C. */
    expect(classePour(200, GENERAL_ENERGIE)).toBe('D');
    expect(classePour(200, seuilsEnergie(25) ?? [])).toBe('C');
  });

  it('un 20 m² à 350 kWh/m²/an n’est plus une passoire', () => {
    /* Sur l'échelle générale, 350 franchit le seuil E|F fixé à 330 : passoire
       thermique, gel des loyers, audit obligatoire. Sur la sienne, la frontière
       est à 385 — le même logement reste en E, et rien de tout cela ne
       s'applique. C'est exactement l'effet que l'arrêté visait. */
    expect(classePour(350, GENERAL_ENERGIE)).toBe('F');
    expect(classePour(350, seuilsEnergie(20) ?? [])).toBe('E');
  });
});

describe('l’altitude, où l’on continue de s’abstenir', () => {
  it('reconnaît une altitude écrite au-dessus de 800 mètres', () => {
    expect(enAltitude(['Altitude : 1250 m'])).toBe(true);
  });

  it('ne bascule pas pour une altitude ordinaire', () => {
    expect(enAltitude(['Altitude : 25 m'])).toBe(false);
    expect(enAltitude(['Zone climatique : H2c'])).toBe(false);
  });

  it('ne bascule pas sur la seule mention d’une zone climatique de montagne', () => {
    /* H1b et H1c s'étendent largement en plaine : c'est l'altitude qui décide. */
    expect(enAltitude(['Zone climatique : H1c', 'Altitude : 210 m'])).toBe(false);
  });
});
