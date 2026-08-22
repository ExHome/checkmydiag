/**
 * CE QUE CE TEST EMPÊCHE.
 *
 * Un seul défaut, et c'est le refus n° 1 de la direction artistique : qu'une
 * paroi dont le rapport ne dit RIEN finisse dessinée comme une paroi isolée.
 * C'est une régression silencieuse — elle ne casse rien, elle ne lève aucune
 * erreur, elle rend juste l'écran menteur. Un `??` mal placé dans `coupe.ts`
 * suffirait.
 *
 * Le test ne regarde donc pas une capture d'écran : il compare les TROIS
 * tracés deux à deux et exige qu'ils diffèrent, sur chacune des quatre parois.
 */
import { describe, expect, it } from 'vitest';
import type { EtatIsolation, Isolation } from '../../lib/modele';
import { LARGEUR_HACHURE, PAS_HACHURE } from '../lumiere/calque';
import { CLE, PAROIS, RAIES, clesUtiles, coupeEnMots, tracerLaCoupe } from './coupe';

const toutes = (e: EtatIsolation): Isolation => ({
  murs: e,
  toit: e,
  plancher: e,
  fenetres: e
});

describe('la coupe du logement', () => {
  it('trace toujours les quatre parois, quel que soit ce que le rapport dit', () => {
    for (const e of ['isole', 'nonIsole', 'inconnu'] as const) {
      const t = tracerLaCoupe(toutes(e));
      expect(t).toHaveLength(4);
      expect(t.map((x) => x.paroi)).toEqual([...PAROIS]);
      /* La structure existe toujours : le rapport n'écrit jamais qu'un mur est
         absent, seulement qu'il n'y relève pas d'isolation. */
      expect(t.every((x) => x.structure.length > 0)).toBe(true);
    }
  });

  it('ne peut pas dessiner une paroi inconnue comme une paroi isolée', () => {
    const isole = tracerLaCoupe(toutes('isole'));
    const inconnu = tracerLaCoupe(toutes('inconnu'));

    for (let i = 0; i < 4; i++) {
      const a = isole[i];
      const b = inconnu[i];
      expect(a).toBeDefined();
      expect(b).toBeDefined();
      /* Le manteau est au même endroit — c'est bien la même paroi — mais l'un
         est plein et l'autre percé. La distinction est une TEXTURE, pas une
         couleur : elle survit au daltonisme et au noir et blanc. */
      expect(a?.manteau).toBe(b?.manteau);
      expect(a?.raies).toBeNull();
      expect(b?.raies).toBe(RAIES);
    }
  });

  it('ne peut pas dessiner une paroi inconnue comme une paroi non isolée', () => {
    const nu = tracerLaCoupe(toutes('nonIsole'));
    const inconnu = tracerLaCoupe(toutes('inconnu'));

    for (let i = 0; i < 4; i++) {
      /* Rien contre quelque chose : « aucune isolation relevée » n'est pas
         « on ne sait pas ». */
      expect(nu[i]?.manteau).toBeNull();
      expect(inconnu[i]?.manteau).not.toBeNull();
    }
  });

  it('emprunte le pas des raies à la trame des zones non contrôlées', () => {
    /* La proportion de lumière qui passe est la même que celle de
       `lumiere/calque.ts` : 1,5 sur 4, soit 37,5 %. Si la trame du produit
       change un jour, elle change ici aussi — la valeur est calculée, jamais
       recopiée. */
    const [plein, vide] = RAIES.split(' ').map(Number);
    expect(plein).toBe(PAS_HACHURE - LARGEUR_HACHURE);
    expect(vide).toBe(LARGEUR_HACHURE);
    expect((vide ?? 0) / ((plein ?? 0) + (vide ?? 0))).toBeCloseTo(0.375, 6);
  });
});

describe('la coupe dite en mots', () => {
  it('nomme les parois muettes au lieu de les ranger avec les bonnes', () => {
    const mots = coupeEnMots({
      toit: 'isole',
      murs: 'nonIsole',
      fenetres: 'isole',
      plancher: 'inconnu'
    });
    expect(mots).toContain('toiture et fenêtres');
    expect(mots).toContain('murs');
    expect(mots).toContain('plancher bas');
    /* La paroi muette n'est ni une bonne nouvelle ni une anomalie. */
    expect(mots).toMatch(/ne dit rien de plancher bas/);
  });

  it('n’affirme rien quand le rapport ne dit rien', () => {
    const mots = coupeEnMots(toutes('inconnu'));
    expect(mots).not.toMatch(/relève une isolation/);
    expect(mots).not.toMatch(/n’en relève aucune/);
    expect(mots).toMatch(/ne dit rien/);
  });

  it('ne promet pas une clé de lecture pour un état absent de l’écran', () => {
    /* Une légende qui explique un état qu'on ne voit nulle part apprend au
       lecteur à chercher quelque chose qui n'existe pas. */
    expect(clesUtiles(toutes('isole'))).toEqual(['isole']);
    expect(clesUtiles(toutes('inconnu'))).toEqual(['inconnu']);
    expect(
      clesUtiles({ toit: 'isole', murs: 'nonIsole', fenetres: 'inconnu', plancher: 'nonIsole' })
    ).toEqual(['nonIsole', 'inconnu', 'isole']);
    /* Et chaque clé dit bien ce que la lumière fait, pas une couleur. */
    expect(CLE.nonIsole).toMatch(/traverse/);
    expect(CLE.isole).toMatch(/s’arrête/);
  });
});
