import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * SIX NIVEAUX DE TEXTE, ET DEUX FAMILLES.
 *
 * « Les infos importantes doivent être plus visibles que les autres ; on doit
 * voir une différence entre les infos du rapport et le blabla. »
 *
 * Les deux étaient impossibles pour la même raison : en mini-app, NEUF noms de
 * jetons s'effondraient sur une seule valeur et QUATRE sur une seconde. Il
 * n'existait que deux niveaux de texte réels — aucune hiérarchie n'est
 * exprimable avec deux valeurs.
 *
 * Ces tests gardent les deux acquis : la SÉPARATION des niveaux, et le fait que
 * la distinction rapport / explication ne repose JAMAIS sur la couleur seule.
 */

const source = readFileSync(
  new URL('./Diagnostics.svelte', import.meta.url),
  'utf8'
);

/**
 * La valeur d'un jeton, lue sans expression reguliere.
 *
 * Deux tentatives ont echoue avant celle-ci, et pour la meme raison : un motif
 * construit par concatenation de chaines perd ses antislashs. `'\n\s*'` ecrit
 * dans une chaine JS donne un vrai retour a la ligne suivi de « s* », et le
 * test rendait « introuvable » pour des jetons parfaitement presents.
 *
 * On lit donc a la main : le nom, puis les deux points, puis tout jusqu'au
 * point-virgule.
 */
const valeurDe = (jeton: string): string => {
  const i = source.indexOf(jeton + ':');
  if (i === -1) return '';
  const j = source.indexOf(';', i);
  return j === -1 ? '' : source.slice(i + jeton.length + 1, j).trim();
};

describe('les six niveaux de texte', () => {
  it.each(['--n1', '--n2', '--n3', '--n4', '--n5', '--n6'])('%s est défini', (n) => {
    expect(valeurDe(n)).not.toBe('');
  });

  it('les six niveaux ont six valeurs distinctes', () => {
    /* C'est tout l'enjeu : avant, --sur-fond-doux, --encre-doux, --gris et
       --vert-300 valaient la même chose, et --or-clair valait --sur-fond. */
    const valeurs = ['--n1', '--n2', '--n3', '--n4', '--n5', '--n6'].map(valeurDe);
    expect(new Set(valeurs).size).toBe(6);
  });

  it('les noms hérités ne s’effondrent plus sur une seule nuance', () => {
    /* --sur-fond était l'égal de --or-clair : le titre court du diagnostic ne
       se distinguait donc en rien du corps de texte. */
    expect(valeurDe('--sur-fond')).not.toBe(valeurDe('--or-clair'));
    expect(valeurDe('--sur-fond')).not.toBe(valeurDe('--sur-fond-doux'));
  });

  it('n4 et n5 sont bien plus doux que n2', () => {
    /* n2 porte les mots du rapport, n4 et n5 l'explication de Verrière : les
       seconds se composent avec le fond, donc ils s'effacent. */
    expect(valeurDe('--n4')).toMatch(/color-mix/);
    expect(valeurDe('--n5')).toMatch(/color-mix/);
    expect(valeurDe('--n2')).not.toMatch(/color-mix/);
  });
});

describe('la distinction rapport / explication', () => {
  const bloc = (selecteur: string): string => {
    const i = source.indexOf(`  ${selecteur} {`);
    expect(i, `${selecteur} introuvable`).toBeGreaterThan(-1);
    return source.slice(i, source.indexOf('\n  }', i));
  };

  it('la carte du rapport porte une matière', () => {
    const carte = bloc('.du-rapport');
    expect(carte).toMatch(/background:\s*var\(--papier\)/);
    expect(carte).toMatch(/box-shadow:/);
  });

  it('la carte du rapport aligne ses chiffres et refuse l’italique', () => {
    const carte = bloc('.du-rapport');
    expect(carte).toMatch(/font-variant-numeric:\s*tabular-nums/);
    expect(carte).toMatch(/font-style:\s*normal/);
  });

  it('l’explication de Verrière n’a NI carte NI ombre', () => {
    /* Le signal était posé à l'envers : le seul bloc encadré de la fiche
       habillait de la prose de Verrière, pendant que les chiffres du rapport
       n'avaient aucune marque. */
    const prose = bloc('.propre-au-rapport');
    expect(prose).toMatch(/background:\s*none/);
    expect(prose).toMatch(/border:\s*0/);
    expect(prose).not.toMatch(/box-shadow:\s*(?!none)/);
  });

  it('l’explication de Verrière se décroche du bord gauche', () => {
    /* Quatrième signal, et le seul qui survive à une capture floutée en noir et
       blanc : les deux familles ne partagent jamais la même verticale. */
    for (const sel of ['.propre-au-rapport', '.reponse-etape']) {
      expect(bloc(sel), sel).toMatch(/margin-inline-start:\s*14px/);
    }
  });

  it('le décrochement n’est pas annulé par un raccourci `margin` postérieur', () => {
    /* Défaut réel : `margin-inline-start` était déclaré AVANT `margin: 0 0 …`,
       qui le remettait à zéro. Le décrochement ne se voyait pas. */
    const b = bloc('.reponse-etape');
    const iRaccourci = b.search(/\n\s*margin:\s/);
    const iLogique = b.search(/\n\s*margin-inline-start:/);
    expect(iRaccourci).toBeLessThan(iLogique);
  });

  it('aucun des quatre signaux n’est chromatique', () => {
    /* matière, ombre, chiffres, bord gauche — un daltonien les voit tous, et
       ils survivent à `filter: grayscale(1)`. */
    const carte = bloc('.du-rapport');
    const signaux = [
      /background:\s*var\(--papier\)/,
      /box-shadow:/,
      /font-variant-numeric:/,
      /font-style:\s*normal/
    ];
    for (const s of signaux) expect(carte).toMatch(s);
  });
});
