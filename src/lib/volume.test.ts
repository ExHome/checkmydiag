/**
 * LE VOLUME NE DOIT PLUS POUVOIR REDEVENIR PLAT.
 *
 * Ordre d'Aude du 21 août 2026 : « faire disparaître tout effet plat ».
 * Le texte de décision vit dans docs/VOLUME-ET-MATIERE.md.
 *
 * Ce que mesuraient les sondes avant ce chantier :
 *   · les trois seules ombres de la charte valaient 6, 10 et 12 % d'opacité.
 *     Sur de l'ivoire, une ombre à 6 % ne se voit pas ;
 *   · sur l'écran d'un diagnostic, 28 surfaces sur 50 n'avaient aucune ombre ;
 *   · deux ombres restantes étaient à 100 % d'opacité mais rabotées d'un
 *     étalement négatif de 32 px — opaques dans le code, invisibles à l'écran.
 *
 * Ces tests ne prouvent pas qu'un écran est beau. Ils empêchent le retour des
 * trois formes de faux relief qu'on vient de retirer.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const CSS = readFileSync('src/app.css', 'utf8');
const DIAGNOSTICS = readFileSync('src/composants/Diagnostics.svelte', 'utf8');
const BUREAU = readFileSync('src/composants/Bureau.svelte', 'utf8');

describe('le système de volume existe', () => {
  it('les trois plans sont définis', () => {
    for (const jeton of ['--relief-pose', '--relief-souleve', '--relief-avant']) {
      expect(CSS, jeton + ' a disparu').toContain(jeton + ':');
    }
  });

  it('le fond sombre a ses propres valeurs', () => {
    for (const jeton of [
      '--relief-sombre-pose',
      '--relief-sombre-souleve',
      '--relief-sombre-avant'
    ]) {
      expect(CSS, jeton + ' a disparu').toContain(jeton + ':');
    }
  });

  it('la lumière, les halos, la trame et le grain sont là', () => {
    for (const jeton of [
      '--lumiere-angle',
      '--halo-ivoire',
      '--halo-vert',
      '--vignettage',
      '--trame-verriere',
      '--grain'
    ]) {
      expect(CSS, jeton + ' a disparu').toContain(jeton + ':');
    }
  });
});

describe('les anciens noms montent avec le système', () => {
  /**
   * Quinze endroits du produit lisent encore `--ombre*`. Les rendre à leurs
   * anciennes valeurs remettrait le plat partout d'un seul geste.
   */
  it('les trois anciens jetons pointent sur les plans', () => {
    expect(CSS).toMatch(/--ombre:\s*var\(--relief-pose\)/);
    expect(CSS).toMatch(/--ombre-forte:\s*var\(--relief-souleve\)/);
    expect(CSS).toMatch(/--ombre-lourde:\s*var\(--relief-avant\)/);
  });
});

describe('les trois formes de faux relief ne reviennent pas', () => {
  /**
   * 1. L'ombre opaque rabotée : une opacité de 100 % annulée par un étalement
   *    négatif. Elle se lit comme un relief franc dans le code et ne peint
   *    presque rien à l'écran.
   */
  it('aucune ombre opaque n’est rabotée par un étalement négatif', () => {
    const coupables: string[] = [];
    for (const [nom, source] of [
      ['Diagnostics.svelte', DIAGNOSTICS],
      ['Bureau.svelte', BUREAU]
    ] as const) {
      for (const m of source.matchAll(/box-shadow:[^;]+;/g)) {
        const decl = m[0];
        if (/100%\s*\)/.test(decl) && /-\d+px/.test(decl)) coupables.push(nom + ' → ' + decl.slice(0, 70));
      }
    }
    expect(coupables, coupables.join('\n')).toEqual([]);
  });

  /**
   * 2. Le fond uniforme. Le bureau doit empiler ses couches — grain, trame,
   *    vignettage, halos — et pas se contenter d'un dégradé.
   */
  it('le bureau n’est pas un aplat', () => {
    /* On lit le bloc ligne à ligne jusqu'à sa fermeture : celui-ci porte plus
       de commentaire que de déclarations, et une fenêtre de caractères le
       coupait avant d'atteindre le fond. */
    const SAUT = String.fromCharCode(10);
    const toutes = BUREAU.split(SAUT);
    const depart = toutes.findIndex((l) => l.trim() === '.bureau {');
    expect(depart, 'la règle .bureau a disparu').toBeGreaterThan(-1);
    const arret = toutes.findIndex((l, i) => i > depart && l.trim() === '}');
    const bloc = toutes.slice(depart, arret).join(SAUT);
    /* La trame reste sur le BUREAU, qui est vert et n'a pas d'autre matière.
       C'est sur les écrans d'application — ivoire — que le quadrillage a été
       retiré au profit du dessin de la verrière. */
    for (const couche of ['--grain', '--trame-verriere', '--vignettage', '--halo-ivoire', '--halo-vert']) {
      expect(bloc, 'le fond du bureau a perdu ' + couche).toContain(couche);
    }
  });

  /**
   * 3. Les ombres invisibles. Une opacité sous 8 % sur une ombre portée ne
   *    produit rien de perceptible : c'est ce qui valait au produit son
   *    aspect plat.
   */
  it('les plans clairs portent une ombre perceptible', () => {
    const bloc = CSS.slice(CSS.indexOf('--relief-souleve:'), CSS.indexOf('--relief-avant:'));
    const opacites = [...bloc.matchAll(/\/\s*(\d+)%/g)].map((m) => Number(m[1]));
    expect(opacites.length, 'le jeton est illisible').toBeGreaterThan(0);
    expect(
      Math.max(...opacites),
      'aucune couche ne dépasse 8 % : ce relief ne se verra pas'
    ).toBeGreaterThanOrEqual(14);
  });
});
