import { describe, expect, it } from 'vitest';
import { MOMENTS, heureDecimale, lumiereDe, teinteDe, teinteDuCarreau } from './heure';
import { canaux } from './contraste';

/**
 * La lumière qui suit l'heure, tenue par le test.
 *
 * Une lumière qui bouge est invérifiable à l'œil : on ne peut pas ouvrir
 * l'application à 5 h du matin pour vérifier que l'aube est rasante. C'est
 * précisément pourquoi l'heure entre en paramètre.
 */

/** Teinte HSL en degrés — sert à interdire les jaunes-verts. */
function teinteHsl(hex: string): number {
  const [r, g, b] = canaux(hex).map((v) => v / 255) as [number, number, number];
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  if (mx === mn) return 0;
  const d = mx - mn;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return ((60 * h) % 360 + 360) % 360;
}

describe('les quatre moments de référence', () => {
  it('l’aube est rasante, froide d’intensité et chaude de teinte', () => {
    const l = lumiereDe(MOMENTS.aube);
    expect(l.inclinaison).toBeLessThan(5);
    expect(l.azimut).toBeLessThan(-0.8); // elle vient de la gauche
    expect(Math.round(l.temperature)).toBe(2005);
    expect(l.intensite).toBeCloseTo(0.305, 2);
    expect(l.ombre).toBeCloseTo(4.7, 2); // ombres longues, plafonnées
    expect(l.nuit).toBe(false);
    expect(teinteDe(l.temperature)).toBe('#d98a3f');
  });

  it('midi est au zénith, blanc, sans ombre', () => {
    const l = lumiereDe(MOMENTS.midi);
    expect(l.inclinaison).toBeCloseTo(90, 4);
    expect(l.azimut).toBeCloseTo(0, 6); // à la verticale : plus de côté
    expect(Math.round(l.temperature)).toBe(6300);
    expect(l.intensite).toBeCloseTo(1, 6);
    expect(l.ombre).toBeCloseTo(0.18, 2);
    expect(teinteDe(l.temperature)).toBe('#faf6ee');
  });

  it('la fin d’après-midi est le moment de marque', () => {
    const l = lumiereDe(MOMENTS.dore);
    /* C'est l'écran de la publicité : source basse, dorée, ombres plus longues
       que l'objet. Si l'un de ces trois chiffres bouge, ce n'est plus la même
       marque — d'où des bornes serrées et non des « à peu près ». */
    expect(l.inclinaison).toBeGreaterThan(30);
    expect(l.inclinaison).toBeLessThan(40);
    expect(Math.round(l.temperature)).toBe(2934);
    expect(l.intensite).toBeCloseTo(0.739, 2);
    expect(l.ombre).toBeGreaterThan(1.2);
    expect(l.azimut).toBeGreaterThan(0.5); // elle vient de la droite
    expect(teinteDe(l.temperature)).toBe('#e7ad67');
  });

  it('la nuit, ce sont les carreaux qui éclairent', () => {
    const l = lumiereDe(MOMENTS.nuit);
    expect(l.nuit).toBe(true);
    expect(l.intensite).toBeCloseTo(0.12, 6);
    expect(l.inclinaison).toBe(0);
    expect(l.azimut).toBe(0);
    /* 2700 K et non 2000 : au coucher la braise cède la place aux lampes de la
       maison. C'est la seule discontinuité assumée de la courbe, et le
       composant la traverse en 1200 ms. */
    expect(l.temperature).toBe(2700);
  });
});

describe('les bornes, quelle que soit l’entrée', () => {
  it('ne sort jamais des domaines, sur 24 h au quart d’heure', () => {
    for (let h = 0; h < 24; h += 0.25) {
      const l = lumiereDe(h);
      expect(Number.isFinite(l.inclinaison)).toBe(true);
      expect(l.inclinaison).toBeGreaterThanOrEqual(0);
      expect(l.inclinaison).toBeLessThanOrEqual(90);
      expect(l.azimut).toBeGreaterThanOrEqual(-1);
      expect(l.azimut).toBeLessThanOrEqual(1);
      expect(l.temperature).toBeGreaterThanOrEqual(2000);
      expect(l.temperature).toBeLessThanOrEqual(6300);
      expect(l.intensite).toBeGreaterThanOrEqual(0.12);
      expect(l.intensite).toBeLessThanOrEqual(1);
      expect(l.ombre).toBeGreaterThanOrEqual(0.18);
      expect(l.ombre).toBeLessThanOrEqual(4.7);
    }
  });

  it('accepte les heures aberrantes sans produire de NaN', () => {
    for (const h of [-3, 0, 24, 25.5, 48, -0.0001]) {
      const l = lumiereDe(h);
      expect(Number.isNaN(l.inclinaison + l.temperature + l.intensite + l.ombre)).toBe(false);
    }
    /* 25 h 30 est 1 h 30 : la fonction est périodique, pas défensive. */
    expect(lumiereDe(25.5)).toEqual(lumiereDe(1.5));
  });

  it('est pure : deux appels à la même heure donnent le même objet', () => {
    expect(lumiereDe(18)).toEqual(lumiereDe(18));
  });
});

describe('la teinte de la lumière', () => {
  it('reste dans la famille chaude de la marque, jamais dans les jaunes-verts', () => {
    /*
     * L'INTERVALLE 60°–140° EST HORS-JEU. C'est l'erreur du citron : une teinte
     * trop proche du vert à 168° le salit. Le test la rend impossible à
     * réintroduire par la lumière — c'est la porte la plus facile à ouvrir
     * sans s'en rendre compte, puisqu'on croit ne toucher qu'à un dégradé.
     */
    for (let k = 2000; k <= 6300; k += 25) {
      const t = teinteHsl(teinteDe(k));
      expect(t, `${k} K → ${teinteDe(k)}`).toBeGreaterThan(18);
      expect(t, `${k} K → ${teinteDe(k)}`).toBeLessThan(45);
    }
  });

  it('se borne aux extrémités de la rampe', () => {
    expect(teinteDe(500)).toBe('#d98a3f');
    expect(teinteDe(20000)).toBe('#faf6ee');
  });

  it('bride le carreau à 3400 K, même à midi', () => {
    /*
     * La démonstration est dans `heure.ts` : sans la bride, la face d'un
     * carreau allumé à midi tombe dans la bande morte. Ce test empêche qu'on
     * « simplifie » la bride en croyant la rendre plus fidèle à l'heure.
     */
    expect(teinteDuCarreau(lumiereDe(MOMENTS.midi))).toBe('#eec287');
    expect(teinteDuCarreau(lumiereDe(MOMENTS.dore))).toBe('#e7ad67');
    expect(teinteDuCarreau(lumiereDe(MOMENTS.aube))).toBe('#d98a3f');
  });
});

describe('la lecture de l’horloge', () => {
  it('convertit une date en heure décimale', () => {
    expect(heureDecimale(new Date(2026, 7, 20, 13, 45))).toBeCloseTo(13.75, 6);
    expect(heureDecimale(new Date(2026, 7, 20, 0, 0))).toBe(0);
  });
});
