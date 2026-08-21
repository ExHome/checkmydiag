/**
 * LE CORAIL SE RECONNAÎT À SA TEINTE, PAS À SON NUMÉRO.
 *
 * Le corail a été retiré du produit par décision explicite, et un test le
 * gardait dehors. Il a pourtant vécu trois fois dans `Diagnostics.svelte`,
 * sous la valeur #ff9084 — teinte 6°, saturation 100 % — et le test ne l'a
 * jamais vu.
 *
 * La raison tient en une phrase : il visait trois valeurs NOMMÉES (#ff6b5d,
 * #f05844, #d0402c). Une règle qui ne connaît que les couleurs auxquelles on
 * avait pensé n'est pas une règle, c'est une liste — et il existe une infinité
 * de coraux qui n'y figurent pas.
 *
 * Celui-ci mesure la TEINTE. Tout rouge-orangé vif et clair est refusé, quelle
 * que soit son écriture.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function sources(dossier = 'src', trouves: string[] = []): string[] {
  for (const e of readdirSync(dossier)) {
    const chemin = join(dossier, e);
    if (statSync(chemin).isDirectory()) sources(chemin, trouves);
    /* Les fichiers de test sont exclus : ils NOMMENT les couleurs bannies,
       c'est leur travail. Les y traquer reviendrait à interdire d'écrire la
       règle. */
    else if (/\.(svelte|css|ts)$/.test(e) && !e.endsWith('.test.ts')) trouves.push(chemin);
  }
  return trouves;
}

/** Teinte, saturation et clarté d'une couleur hexadécimale, en pourcentages. */
function tsl(hex: string): { t: number; s: number; l: number } {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const v = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const max = Math.max(r, v, b);
  const min = Math.min(r, v, b);
  const l = (max + min) / 2;
  if (max === min) return { t: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let t = 0;
  if (max === r) t = ((v - b) / d + (v < b ? 6 : 0)) / 6;
  else if (max === v) t = ((b - r) / d + 2) / 6;
  else t = ((r - v) / d + 4) / 6;
  return { t: t * 360, s: s * 100, l: l * 100 };
}

/**
 * Le domaine du corail, borné par la mesure et non au jugé.
 *
 * Trois bornes, et chacune écarte une famille qu'il ne faut pas confondre :
 *
 *   TEINTE 2 à 14°  — au-delà commencent les terres orangées, comme le
 *                     #c85a2c des schémas d'électricité (17,7°), qui n'a
 *                     jamais été banni ;
 *   SATURATION ≥ 55 — en dessous, le rouge est rompu : c'est une terre ;
 *   CLARTÉ 45 à 82  — le plancher écarte la terre cuite #a33220, admise, qui
 *                     vit à 38 %. Le plafond écarte les FONDS pâles comme
 *                     #fdeeeb à 96 % : un lavis rosé sous une alerte n'est
 *                     pas un corail, c'est le fond d'alerte de la charte.
 *
 * Les deux bornes de clarté ont été posées après une première version qui n'en
 * avait qu'une : elle accusait quatre fonds pâles et une terre orangée.
 */
function estCorail(hex: string): boolean {
  const { t, s, l } = tsl(hex);
  return t >= 2 && t <= 14 && s >= 55 && l >= 45 && l <= 82;
}

describe('le corail ne revient pas, quelle que soit son écriture', () => {
  it('reconnaît les coraux déjà refusés', () => {
    for (const hex of ['#ff6b5d', '#f05844', '#ff9084', '#ff7f6a']) {
      expect(estCorail(hex), hex + ' devrait être reconnu comme corail').toBe(true);
    }
  });

  /**
   * La mesure doit laisser passer ce que la charte emploie. La terre cuite et
   * le rouge de l'étiquette G sont admis : le premier est sombre, le second
   * est une couleur de l'arrêté, citée telle quelle.
   */
  it('laisse passer les rouges de la charte', () => {
    for (const hex of [
      '#a33220', // terre cuite, clarté 38 % : trop sombre pour un corail
      '#a3231a',
      '#ca0205',
      '#e30205',
      '#c85a2c', // terre orangée des schémas, teinte 17,7° : hors du domaine
      '#fdeeeb', // lavis d'alerte, clarté 96 % : c'est un fond, pas une encre
      '#ffd9d3'
    ]) {
      expect(estCorail(hex), hex + ' est un rouge admis, pas un corail').toBe(false);
    }
  });

  it('aucun corail ne vit dans les sources', () => {
    const coupables: string[] = [];
    for (const fichier of sources()) {
      const texte = readFileSync(fichier, 'utf8');
      const lignes = texte.split(String.fromCharCode(10));
      lignes.forEach((ligne, i) => {
        /* Les commentaires racontent l'histoire d'une couleur retirée : ils
           la nomment sans la poser. On ne juge que les déclarations. */
        const nu = ligne.trim();
        if (nu.startsWith('*') || nu.startsWith('//') || nu.startsWith('/*')) return;
        for (const m of ligne.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
          if (estCorail(m[0])) coupables.push(fichier + ':' + (i + 1) + ' → ' + m[0]);
        }
      });
    }
    expect(coupables, 'corail retrouvé :' + String.fromCharCode(10) + coupables.join(String.fromCharCode(10))).toEqual([]);
  });
});
