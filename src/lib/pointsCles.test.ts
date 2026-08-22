/**
 * LES POINTS CLÉS NE PEUVENT PAS RASSURER À TORT.
 *
 * L'ordre de mission Termites du 22 août 2026 pose une règle qui vaut pour
 * toutes les mini-applications : « ne jamais transformer une absence
 * d'information en conclusion rassurante », et « ne jamais écrire ou laisser
 * entendre "absence de termites" pour une zone qui n'a pas été inspectée ».
 *
 * Ces tests rejouent les états métier que l'ordre énumère au § 7 — conclusion
 * favorable, zones non contrôlées, rubrique absente, extraction incertaine —
 * et vérifient qu'aucun d'eux ne produit une ligne qui dit plus que le
 * rapport.
 */
import { describe, expect, it } from 'vitest';
import { pointsClesDe, silenceDesPointsCles } from './pointsCles';
import type { Diagnostic } from './modele';

function diag(sur: Partial<Diagnostic> = {}): Diagnostic {
  return {
    type: 'termites',
    titre: 'Termites',
    verdict: 'Aucun indice d’infestation de termites n’a été relevé dans les parties visitées.',
    gravite: 'bon',
    pages: [6, 6],
    ...sur
  } as Diagnostic;
}

describe('les points clés citent le rapport', () => {
  it('la conclusion vient en premier, mot pour mot', () => {
    const p = pointsClesDe(diag());
    expect(p[0]?.detail).toBe(
      'Aucun indice d’infestation de termites n’a été relevé dans les parties visitées.'
    );
    expect(p[0]?.source).toContain('conclusion');
  });

  /** Le lecteur doit pouvoir remonter à ce qui porte chaque ligne (§ 3). */
  it('chaque point dit d’où il sort', () => {
    const d = diag({
      schema: { genre: 'pieces', zones: [{ nom: 'Séjour', etat: 'bon' }] },
      faits: [{ libelle: 'Niveau d’infestation de la commune', valeur: 'moyen' }]
    } as Partial<Diagnostic>);
    for (const point of pointsClesDe(d)) {
      expect(point.source.length, point.titre + ' n’a pas de source').toBeGreaterThan(0);
    }
  });

  /**
   * Le cœur de l'ordre : une conclusion favorable et des zones non
   * contrôlées coexistent, et la seconde doit se lire AVANT le décompte
   * rassurant des zones regardées.
   */
  it('les zones non contrôlées passent avant l’étendue du contrôle', () => {
    const d = diag({
      schema: { genre: 'pieces', zones: [{ nom: 'Séjour', etat: 'bon' }] },
      constatations: {
        lue: true,
        neant: false,
        entrees: [
          { terme: 'Vide sanitaire non accessible', nature: 'limite' },
          { terme: 'Plancher sous revêtement', ou: 'chambre', nature: 'limite' }
        ]
      }
    } as Partial<Diagnostic>);
    const titres = pointsClesDe(d).map((p) => p.titre);
    const rangLimites = titres.findIndex((t) => /n’ont pas pu être contrôlés/.test(t));
    const rangZones = titres.findIndex((t) => /zones? regardées?/.test(t));
    expect(rangLimites).toBeGreaterThan(-1);
    expect(rangZones).toBeGreaterThan(-1);
    expect(rangLimites, 'la limite doit se lire avant le décompte').toBeLessThan(rangZones);
  });

  /** Un décompte de zones n'est pas une bonne nouvelle : c'est une étendue. */
  it('le nombre de zones ne se présente jamais comme rassurant', () => {
    const d = diag({
      schema: { genre: 'pieces', zones: [{ nom: 'A', etat: 'bon' }, { nom: 'B', etat: 'bon' }] }
    } as Partial<Diagnostic>);
    const zones = pointsClesDe(d).find((p) => /zones regardées/.test(p.titre));
    expect(zones?.ton, 'un décompte est neutre, jamais « bon »').toBe('neutre');
    expect(zones?.detail).toMatch(/ne vaut que pour ces zones/);
  });

  /**
   * L'état le plus dangereux du § 7 : une extraction qui n'a rien donné.
   * L'écran ne doit pas rester muet, sinon le silence de l'application se lit
   * comme un silence du diagnostiqueur.
   */
  it('l’absence de conclusion se dit, elle ne se tait pas', () => {
    const vide = { type: 'termites', titre: 'Termites', gravite: 'neutre', pages: [1, 1] } as unknown as Diagnostic;
    expect(pointsClesDe(vide)).toEqual([]);
    const mot = silenceDesPointsCles(vide);
    expect(mot).toBeTruthy();
    expect(mot).toMatch(/ne veut pas dire/);
  });

  it('un diagnostic illisible le dit autrement', () => {
    const illisible = {
      type: 'termites',
      titre: 'Termites',
      gravite: 'neutre',
      origine: 'illisible',
      pages: [1, 1]
    } as unknown as Diagnostic;
    expect(silenceDesPointsCles(illisible)).toMatch(/n’a pas pu être lu/);
  });

  /** La règle anti-doublon : ce qui est déjà dit ailleurs ne revient pas. */
  it('ne répète pas la date ni le décompte déjà affichés', () => {
    const d = diag({
      schema: { genre: 'pieces', zones: [{ nom: 'A', etat: 'bon' }] },
      faits: [
        { libelle: 'Zones contrôlées', valeur: '1' },
        { libelle: 'Date du repérage', valeur: '02/09/2025' },
        { libelle: 'Niveau d’infestation de la commune', valeur: 'moyen' }
      ]
    } as Partial<Diagnostic>);
    const titres = pointsClesDe(d).map((p) => p.titre);
    expect(titres.filter((t) => /Zones contrôlées/.test(t))).toEqual([]);
    expect(titres.filter((t) => /Date du repérage/.test(t))).toEqual([]);
    expect(titres).toContain('Niveau d’infestation de la commune');
  });

  /** Une conclusion grave ne se déguise pas en information neutre. */
  it('la gravité du rapport commande le ton du premier point', () => {
    const grave = diag({ gravite: 'alerte', verdict: 'Présence de termites constatée.' });
    expect(pointsClesDe(grave)[0]?.ton).toBe('mauvais');
  });
});
