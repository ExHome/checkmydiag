import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * LE SCHÉMA DES DÉPERDITIONS N'AFFIRME QUE CE QUE LE RAPPORT DIT.
 *
 * Il portait deux chiffres, et aucun ne venait du dossier lu :
 *
 *   `poids` donnait à chaque souffle une épaisseur différente — toiture 7,
 *   ventilation 6, murs 6, fenêtres 4,5, jonctions 3,5, plancher 4 ;
 *   `part` écrivait « 25-30 % », « 20-25 % »…
 *
 * Ce sont les ordres de grandeur NATIONAUX de l'ADEME, codés en dur,
 * rigoureusement identiques pour les 12 000 dossiers du corpus. Une épaisseur
 * qui varie énonce une hiérarchie des pertes : le lecteur comprend « chez moi
 * c'est surtout le toit », et son rapport ne dit pas cela.
 *
 * Un dessin ne se lit pas, il se croit. C'est ce qui le rend dangereux quand il
 * affirme — d'où ces gardes.
 */

const source = readFileSync(
  new URL('./Deperditions.svelte', import.meta.url),
  'utf8'
);

/**
 * Le fichier SANS ses commentaires.
 *
 * Deux de ces tests ont d'abord échoué sur leur propre documentation : le
 * commentaire qui explique la suppression de « 25-30 % » contient forcément la
 * chaîne « 25-30 % ». Un test qui interdit de CITER une valeur dans une
 * explication pousse à écrire de moins bons commentaires — on vise le code.
 */
const code = source
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/(^|[^:])\/\/.*/g, '$1 ');

describe('le dessin ne chiffre rien', () => {
  it('n’attribue plus de poids à un souffle', () => {
    expect(source).not.toMatch(/\bpoids\s*:/);
  });

  it('n’écrit plus d’ordre de grandeur national', () => {
    /* « 25-30 % », « 20-25 % », « 10-15 % », « 5-10 % », « 7-10 % ». */
    expect(code).not.toMatch(/\d\s*-\s*\d+\s*%/);
  });

  it('donne la même épaisseur aux six souffles', () => {
    const i = source.indexOf('  .souffle {');
    expect(i).toBeGreaterThan(-1);
    const bloc = source.slice(i, source.indexOf('\n  }', i));
    expect(bloc).toMatch(/stroke-width:\s*5/);
    /* Aucune épaisseur pilotée par la donnée. */
    expect(source).not.toMatch(/style:stroke-width/);
  });
});

describe('l’état d’une paroi ne tient jamais à la seule couleur', () => {
  it('écrit le mot pour les quatre états', () => {
    for (const mot of ['Isolé', 'Sans isolant', 'Non renseigné', 'Rien à isoler']) {
      expect(source, mot).toContain(mot);
    }
  });

  it('distingue les quatre états par la FORME du tracé', () => {
    /* Un signal qui survit au noir et blanc, contrairement à la couleur.
       Trait plein / pointillé serré / pointillé fin / tirets longs. */
    const traces = [...source.matchAll(/stroke-dasharray:\s*([^;]+);/g)].map((m) =>
      m[1]?.trim()
    );
    expect(new Set(traces).size).toBeGreaterThanOrEqual(4);
  });

  it('sépare « le rapport se tait » de « il n’y a pas de paroi »', () => {
    /* Les deux étaient rendus à l'identique : rien ne distinguait une absence
       d'information d'une catégorie sans objet. */
    expect(source).toMatch(/\.souffle\.inconnu/);
    expect(source).toMatch(/\.souffle\.sans-paroi/);
  });

  it('n’emploie aucune couleur en dur hors palette réglementaire', () => {
    /* La charte l'interdit dans un schéma, et elle a raison : une valeur écrite
       à deux endroits finit par diverger. Les sept teintes de l'arrêté font
       exception -- elles ne s'inventent pas, et c'est la règle de
       `savoir/charte.test.ts`. */
    const ETIQUETTE = /^#(?:319834|33cc31|cbfc34|fbfe06|fbcc05|fc9935|fc0205)$/i;
    const hors = [...code.matchAll(/#[0-9a-f]{6}/gi)]
      .map((m) => m[0])
      .filter((c) => !ETIQUETTE.test(c));
    expect([...new Set(hors)]).toEqual([]);
  });
});

describe('les six parois se touchent', () => {
  it('sont des boutons, pas des zones de dessin', () => {
    /* En HTML et non dans le SVG : une cible de 44 px y est triviale, alors que
       dans un viewBox de 562 rendu sur 306 px chaque unité vaut 0,54 pixel. */
    const i = source.indexOf('  .paroi {');
    expect(i).toBeGreaterThan(-1);
    const bloc = source.slice(i, source.indexOf('\n  }', i));
    expect(bloc).toMatch(/min-height:\s*44px/);
  });

  it('la promotion épaissit le souffle sans atténuer les autres', () => {
    /* Atténuer les cinq autres les ferait passer sous le seuil de contraste des
       éléments graphiques : on promeut, on n'efface pas. */
    expect(source).toMatch(/\.souffle\.promu/);
    expect(source).not.toMatch(/\.souffle:not\(\.promu\)/);
  });
});
