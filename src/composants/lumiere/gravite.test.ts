import { describe, expect, it } from 'vitest';
import type { Gravite } from '../../lib/modele';
import { MOMENTS, lumiereDe, teinteDe, teinteDuCarreau } from './heure';
import {
  ENCRE,
  PLAFOND_CARREAU,
  PLAFOND_LAMPE,
  PLANCHER_ENCRE_DOUCE,
  RETRAIT,
  SOL_CLAIR,
  SOL_GRAVE,
  defautsDe,
  retraitDe
} from './gravite';
import { BANDE_MORTE, contraste, dansLaBandeMorte, luminance, melange } from './contraste';

/**
 * LA PREUVE QUE LE CALME NE MANGE PAS LA LISIBILITÉ.
 *
 * « Si les deux entrent en conflit, la lisibilité gagne, toujours. » Cette
 * phrase ne vaut rien tant qu'aucun test ne la fait perdre à l'autre. Les
 * seize scènes — quatre gravités × quatre moments — sont ici mesurées, pas
 * estimées.
 */

const GRAVITES: Gravite[] = ['bon', 'neutre', 'attention', 'alerte'];
const HEURES = Object.values(MOMENTS);

describe('la mesure elle-même', () => {
  it('donne les valeurs connues', () => {
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contraste('#ffffff', '#ffffff')).toBeCloseTo(1, 6);
    expect(luminance('#0a2b23')).toBeCloseTo(0.019136, 5);
    expect(luminance('#faf9f8')).toBeCloseTo(0.948527, 5);
  });

  it('mélange comme le compositeur du navigateur', () => {
    expect(melange('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(melange('#0a2b23', '#faf6ee', 0.34)).toBe('#5c7068');
  });
});

describe('la bande morte', () => {
  /*
   * Les deux bornes sont la RÉSOLUTION de l'inéquation WCAG, pas un choix.
   * Elles sont recalculées ici à partir des deux encres : si quelqu'un change
   * une encre de marque, ce test tombe et signale que la bande a bougé.
   */
  it('est bien la résolution de l’inéquation, pour les deux encres', () => {
    const seuilSombre = 4.5 * (luminance('#0a2b23') + 0.05) - 0.05;
    const seuilClair = (luminance('#faf9f8') + 0.05) / 4.5 - 0.05;
    expect(seuilSombre).toBeCloseTo(BANDE_MORTE.haut, 6);
    expect(seuilClair).toBeCloseTo(BANDE_MORTE.bas, 6);
    expect(BANDE_MORTE.bas).toBeLessThan(BANDE_MORTE.haut);
  });

  it('n’est franchissable par aucune des deux encres de la marque', () => {
    const milieu = '#788880'; // L = 0,2316, en plein dedans
    expect(dansLaBandeMorte(milieu)).toBe(true);
    expect(contraste('#0a2b23', milieu)).toBeLessThan(4.5);
    expect(contraste('#faf9f8', milieu)).toBeLessThan(4.5);
  });
});

describe('B1 · le plafond de la lampe', () => {
  it('tient 4,5 au pire cas — la lampe de midi à son plafond', () => {
    const sol = melange(SOL_CLAIR, teinteDe(6300), PLAFOND_LAMPE);
    expect(sol).toBe('#5c7068');
    expect(contraste(ENCRE, sol)).toBeGreaterThanOrEqual(4.5);
    expect(contraste(ENCRE, sol)).toBeCloseTo(5.03, 1);
  });

  it('casse juste au-dessus — c’est ce qui prouve que 0,34 est la borne', () => {
    /* La borne n'est pas ronde par hasard : à 0,38 le contraste tombe à 4,46.
       Sans ce test, on la « détendrait un peu » sans rien mesurer. */
    const trop = melange(SOL_CLAIR, teinteDe(6300), 0.38);
    expect(contraste(ENCRE, trop)).toBeLessThan(4.5);
  });

  it('midi est bien le pire cas : toute autre température est plus favorable', () => {
    const pire = contraste(ENCRE, melange(SOL_CLAIR, teinteDe(6300), PLAFOND_LAMPE));
    for (let k = 2000; k <= 6300; k += 100) {
      const c = contraste(ENCRE, melange(SOL_CLAIR, teinteDe(k), PLAFOND_LAMPE));
      expect(c, `${k} K`).toBeGreaterThanOrEqual(pire - 1e-9);
    }
  });
});

describe('B2 · le retrait n’assombrit que ce qui y gagne', () => {
  it('améliore le texte principal au lieu de le dégrader', () => {
    const clair = contraste(ENCRE, SOL_CLAIR);
    const grave = contraste(ENCRE, SOL_GRAVE);
    expect(clair).toBeCloseTo(14.44, 1);
    expect(grave).toBeCloseTo(17.84, 1);
    expect(grave).toBeGreaterThan(clair);
  });

  it('ne fait jamais traverser la bande morte au sol', () => {
    for (let r = 0; r <= 1.0001; r += 0.01) {
      const sol = melange(SOL_CLAIR, SOL_GRAVE, r);
      expect(dansLaBandeMorte(sol), `r=${r.toFixed(2)} → ${sol}`).toBe(false);
    }
  });

  it('monotone : plus c’est grave, plus c’est sombre, plus l’encre ressort', () => {
    let precedent = 0;
    for (const g of GRAVITES) {
      const c = contraste(ENCRE, retraitDe(g, 1).sol);
      expect(c).toBeGreaterThanOrEqual(precedent);
      precedent = c;
    }
    expect(RETRAIT.bon).toBeLessThan(RETRAIT.attention);
    expect(RETRAIT.attention).toBeLessThan(RETRAIT.alerte);
    /* Et l'alerte ne va pas jusqu'à l'extinction : une pièce éteinte est une
       panne, pas une pudeur. */
    expect(RETRAIT.alerte).toBeLessThan(1);
  });
});

describe('B3 · l’encre douce compense au lieu de suivre', () => {
  it('monte quand la lumière baisse', () => {
    const a = retraitDe('bon', 1).encreDouce;
    const b = retraitDe('alerte', 1).encreDouce;
    expect(a).toBeCloseTo(0.72, 6);
    expect(b).toBeCloseTo(0.8496, 3);
    expect(b).toBeGreaterThan(a);
  });

  it('ne descend jamais sous son plancher, quelle que soit la scène', () => {
    for (const g of GRAVITES) {
      for (const h of HEURES) {
        expect(retraitDe(g, lumiereDe(h).intensite).encreDouce).toBeGreaterThanOrEqual(
          PLANCHER_ENCRE_DOUCE
        );
      }
    }
  });
});

describe('les seize scènes', () => {
  it('n’en laisse aucune sous 4,5', () => {
    const echecs: string[] = [];
    for (const g of GRAVITES) {
      for (const [nom, h] of Object.entries(MOMENTS)) {
        const l = lumiereDe(h);
        const etat = retraitDe(g, l.intensite);
        for (const d of defautsDe(etat, teinteDe(l.temperature))) echecs.push(`${g} · ${nom} · ${d}`);
      }
    }
    expect(echecs).toEqual([]);
  });

  it('le retrait est plus lent que l’allumage', () => {
    expect(retraitDe('alerte', 1).duree).toBeGreaterThan(retraitDe('bon', 1).duree);
    expect(retraitDe('bon', 1).duree).toBe(320);
    expect(retraitDe('alerte', 1).duree).toBe(594);
  });
});

describe('le carreau', () => {
  it('reste sur la branche sombre jusqu’à son plafond, aux quatre moments', () => {
    for (const h of HEURES) {
      const teinte = teinteDuCarreau(lumiereDe(h));
      for (const g of GRAVITES) {
        const sol = retraitDe(g, lumiereDe(h).intensite).sol;
        for (let p = 0; p <= PLAFOND_CARREAU + 1e-9; p += 0.02) {
          const face = melange(sol, teinte, p);
          expect(dansLaBandeMorte(face), `${h}h ${g} passe=${p.toFixed(2)} → ${face}`).toBe(false);
          expect(contraste(ENCRE, face), `${h}h ${g} passe=${p.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it('déborde si l’on relâche le plafond — la borne 0,42 n’est pas décorative', () => {
    /* Le pire substrat admissible est celui de midi, bridé à 3400 K. À 0,62 la
       face entre dans la bande morte : c'est ce que le plafond empêche. */
    const face = melange(SOL_CLAIR, '#eec287', 0.62);
    expect(dansLaBandeMorte(face)).toBe(true);
    expect(contraste(ENCRE, melange(SOL_CLAIR, '#eec287', PLAFOND_CARREAU))).toBeCloseTo(5.28, 1);
  });
});
