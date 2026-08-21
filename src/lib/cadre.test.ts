/**
 * LE CADRE DE L'APPLICATION : CE QUI NE DOIT PLUS ÊTRE ÉCRASÉ.
 *
 * Le socle « comme une application » a posé des règles sur `#app > header`,
 * `#app > main` et `#app`. Elles portent un identifiant, donc elles pèsent
 * 1-0-1 — dix fois plus qu'une classe. Une déclaration posée là ne complète
 * pas la charte : elle la remplace, en silence, partout.
 *
 * C'est arrivé une fois, et cela a coûté la marge latérale de TOUTE
 * l'application. `#app > main { padding-left: env(safe-area-inset-left, 0px) }`
 * a battu `.enveloppe { padding-inline: clamp(16px, 4vw, 32px) }` ; sur un
 * appareil sans encoche `env()` vaut zéro, et le texte s'est mis à toucher le
 * bord de la dalle. Mesuré à l'écran : padding calculé `0px` là où la feuille
 * en déclarait seize.
 *
 * Ce test lit la feuille et échoue si une règle à identifiant redéclare une
 * propriété que la charte pose déjà par classe.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const CSS = readFileSync('src/app.css', 'utf8');

/** Découpe la feuille en blocs { sélecteur, déclarations }. */
function blocs(): { selecteur: string; corps: string }[] {
  const sansCommentaires = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  const trouves: { selecteur: string; corps: string }[] = [];
  const motif = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = motif.exec(sansCommentaires))) {
    trouves.push({ selecteur: (m[1] ?? '').trim(), corps: (m[2] ?? '').trim() });
  }
  return trouves;
}

const BLOCS = blocs();

describe('le cadre de l’application ne bat pas la charte', () => {
  /**
   * La marge de lecture appartient à `.enveloppe`. Une règle `#app > main`
   * peut la compléter — jamais la poser elle-même, sauf à exclure
   * explicitement l'enveloppe.
   */
  it('aucune règle #app > main ne remplace la marge latérale', () => {
    const coupables = BLOCS.filter(
      (b) =>
        /#app\s*>\s*main/.test(b.selecteur) &&
        !/:not\(\s*\.enveloppe\s*\)/.test(b.selecteur) &&
        /padding(-left|-right|-inline|\s*:)/.test(b.corps)
    ).map((b) => b.selecteur);

    expect(coupables, `règles à corriger :\n  ${coupables.join('\n  ')}`).toEqual([]);
  });

  /**
   * L'encoche protège, elle ne rogne pas. La forme juste est un `max()` entre
   * la marge de lecture et l'inset — un `env()` seul vaut zéro sur un
   * ordinateur, et c'est exactement ainsi que la marge avait disparu.
   */
  it('l’enveloppe garde sa marge même sans encoche', () => {
    const enveloppe = BLOCS.filter((b) => /(^|,)\s*\.enveloppe\s*$/m.test(b.selecteur));
    expect(enveloppe.length, 'la règle .enveloppe a disparu').toBeGreaterThan(0);

    const corps = enveloppe.map((b) => b.corps).join('\n');
    expect(corps).toMatch(/padding-left:\s*max\(/);
    expect(corps).toMatch(/padding-right:\s*max\(/);
    expect(corps).toMatch(/safe-area-inset-left/);
    expect(corps).toMatch(/safe-area-inset-right/);
  });

  /**
   * Le socle fixe l'écran : sans `100dvh`, la barre d'adresse mobile ampute le
   * bas du cadre, et le dock se retrouve hors de vue.
   */
  it('le cadre se mesure en dvh', () => {
    const cadre = BLOCS.filter((b) => /(^|,)\s*#app\s*$/m.test(b.selecteur));
    expect(cadre.length, 'la règle #app a disparu').toBeGreaterThan(0);
    expect(cadre.map((b) => b.corps).join('\n')).toMatch(/height:\s*100dvh/);
  });
});
