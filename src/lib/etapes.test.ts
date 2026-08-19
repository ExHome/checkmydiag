/**
 * L'ordre des six étapes, tenu par le test.
 *
 * L'ordre de mission directeur impose une progression : ce qu'il faut savoir,
 * est-ce important, où, pourquoi, que faire, pour aller plus loin. Écrite dans
 * le seul balisage, elle se serait défaite à la première intervention — c'est
 * ainsi que le produit a déjà perdu le corail, le sable et sa hiérarchie
 * d'accueil, à chaque fois sans que personne s'en aperçoive.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ETAPES } from './etapes';

const COMPOSANT = readFileSync('src/composants/Diagnostics.svelte', 'utf8');

/** Où chaque titre apparaît dans le fichier, en caractères. */
function positions(): { mot: string; ou: number }[] {
  return ETAPES.map((e) => {
    /* Les titres portent des espaces insécables devant « ? » : la typographie
       française l'exige, et le test doit chercher ce qui est réellement écrit. */
    const cherche = e.mot.replace(/ \?$/, '&nbsp;?');
    return { mot: e.mot, ou: COMPOSANT.indexOf(`class="titre-etape">${cherche}<`) };
  });
}

describe('les six étapes de lecture', () => {
  it('sont six, ni plus ni moins', () => {
    expect(ETAPES.length).toBe(6);
  });

  it('sont toutes affichées par la fiche', () => {
    for (const { mot, ou } of positions()) {
      expect(ou, `« ${mot} » ne s’affiche nulle part`).toBeGreaterThan(-1);
    }
  });

  it('s’enchaînent dans l’ordre de l’ordre de mission', () => {
    const lues = positions();
    for (let i = 1; i < lues.length; i++) {
      expect(
        lues[i]!.ou,
        `« ${lues[i]!.mot} » passe avant « ${lues[i - 1]!.mot} »`
      ).toBeGreaterThan(lues[i - 1]!.ou);
    }
  });

  /*
   * L'ordre n'est pas décoratif : il porte une règle de fond.
   *
   * « Le résultat avant l'explication », « l'action possible APRÈS la
   * compréhension ». Une fiche qui dirait quoi faire avant d'avoir dit
   * pourquoi ferait exécuter sans comprendre.
   */
  it('place le constat avant l’explication, et l’action après', () => {
    const rang = (cle: string) => ETAPES.findIndex((e) => e.cle === cle);
    expect(rang('savoir')).toBeLessThan(rang('pourquoi'));
    expect(rang('ou')).toBeLessThan(rang('pourquoi'));
    expect(rang('pourquoi')).toBeLessThan(rang('faire'));
    expect(rang('faire')).toBeLessThan(rang('loin'));
  });

  it('garde chaque étape reliée à ce qu’elle sert', () => {
    /* Un titre sans rôle écrit finit par accueillir n'importe quoi. */
    for (const e of ETAPES) {
      expect(e.role.length, e.cle).toBeGreaterThan(30);
    }
  });
});
