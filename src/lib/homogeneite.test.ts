/**
 * L'HOMOGÉNÉITÉ VISUELLE — la charte est la référence d'image de Verrière.
 *
 * *Ordre d'Aude, 22/08/2026 : « notre charte graphique c'est comme notre
 * référence d'image Verrière ». Posé par la session architecte.*
 *
 * ## Ce que ce test garde, et pourquoi il n'interdit pas tout d'un coup
 *
 * Une couleur du produit se prend à deux endroits, et à deux endroits
 * seulement : les jetons de `app.css`, ou l'univers du diagnostic dans
 * `lib/univers.ts`. Une valeur écrite en dur dans un composant n'appartient à
 * aucun des deux : elle ne suit ni un changement de charte, ni le passage en
 * sombre, ni la mesure de contraste que `univers.test.ts` fait sur les univers.
 *
 * Mesuré le 22/08/2026 : **60 couleurs légitimes, 197 valeurs en dur** réparties
 * sur 33 composants. On ne peut pas les corriger d'un seul geste — chaque volet
 * appartient à une session, et un test qui passerait au rouge d'un coup
 * bloquerait le déploiement de tout le monde ([[ORDRE-COORDINATION-DES-SESSIONS]]).
 *
 * Ce test est donc un **cliquet** : il tolère la dette du jour, fichier par
 * fichier, et refuse qu'elle grandisse. Chaque volet qui se réaligne fait
 * baisser son plafond, et le plafond ne remonte jamais.
 *
 * ⚠️ Un plafond n'est pas un droit à polluer : c'est une dette datée. La
 * cible est zéro partout, et l'ordre est dans `docs/ORDRE-HOMOGENEITE-VISUELLE.md`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Toutes les couleurs que la charte et les univers autorisent. */
function paletteLegitime(): Set<string> {
  const palette = new Set<string>();
  for (const fichier of ['src/app.css', 'src/lib/univers.ts']) {
    for (const hex of readFileSync(fichier, 'utf8').match(/#[0-9a-fA-F]{6}/g) ?? []) {
      palette.add(hex.toLowerCase());
    }
  }
  return palette;
}

/** Tous les composants du produit. */
function composants(dossier = 'src/composants'): string[] {
  const trouves: string[] = [];
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) trouves.push(...composants(chemin));
    else if (nom.endsWith('.svelte')) trouves.push(chemin.replace(/\\/g, '/'));
  }
  return trouves;
}

/**
 * Les couleurs qu'un composant pose en dur, hors palette.
 *
 * ⚠️ Un repli ne compte pas. `var(--u-surface, #f5f1e8)` prend sa couleur dans
 * l'univers ; le `#f5f1e8` n'est que le défaut si l'univers est absent. Les
 * compter comme des valeurs en dur, c'est reprocher à un composant d'être
 * correctement branché — la première version de ce test le faisait, et
 * inventait ainsi vingt écarts sur deux cent dix-sept.
 */
function enDur(fichier: string, palette: Set<string>): string[] {
  const source = readFileSync(fichier, 'utf8').replace(/var\([^()]*,[^()]*\)/g, '');
  const hex = source.match(/#[0-9a-fA-F]{6}/g) ?? [];
  return [...new Set(hex.map((h) => h.toLowerCase()))].filter((h) => !palette.has(h)).sort();
}

/**
 * La dette au 22/08/2026 — le plafond de chacun.
 *
 * Un fichier absent de cette liste doit être à ZÉRO : c'est ainsi qu'un
 * composant neuf naît propre sans qu'on ait à y penser.
 */
const PLAFONDS: ReadonlyMap<string, number> = new Map([
  ['src/composants/Accueil.svelte', 3],
  ['src/composants/AnomaliesUneParUne.svelte', 3],
  ['src/composants/Arrivee.svelte', 32],
  ['src/composants/Bureau.svelte', 14],
  ['src/composants/Cgv.svelte', 1],
  ['src/composants/Diagnostics.svelte', 9],
  ['src/composants/Dicodiag.svelte', 3],
  ['src/composants/Lecteur.svelte', 3],
  ['src/composants/Notaire.svelte', 1],
  ['src/composants/Positionnement.svelte', 1],
  ['src/composants/RubanDpe.svelte', 1],
  ['src/composants/amiante/Amiante.svelte', 8],
  ['src/composants/amiante/BancAmiante.svelte', 1],
  ['src/composants/dpe/BancDpe.svelte', 1],
  ['src/composants/dpe/Deperditions.svelte', 1],
  ['src/composants/dpe/DoubleEtiquette.svelte', 9],
  ['src/composants/dpe/EcranDpe.svelte', 5],
  ['src/composants/dpe/LesParois.svelte', 1],
  ['src/composants/dpe/LesSystemes.svelte', 1],
  ['src/composants/dpe/MiniAppDpe.svelte', 32],
  ['src/composants/ecrans/BancTermites.svelte', 4],
  ['src/composants/ecrans/Termites.svelte', 1],
  ['src/composants/electricite/BancElectricite.svelte', 1],
  ['src/composants/electricite/Cable.svelte', 1],
  ['src/composants/electricite/MiniAppElectricite.svelte', 11],
  ['src/composants/gaz/MiniAppGaz.svelte', 12],
  ['src/composants/plomb/BancPlomb.svelte', 3],
  ['src/composants/plomb/MiniAppPlomb.svelte', 12],
  ['src/composants/schemas/briques/Maison.svelte', 1],
  ['src/composants/termites/MiniAppTermites.svelte', 15],
  ['src/composants/visuels/VisuelAmiante.svelte', 11],
  ['src/composants/visuels/VisuelPlomb.svelte', 14],
  ['src/composants/visuels/VisuelRisques.svelte', 17]
]);

/**
 * Les tailles et les rayons écrits en dur, hors de l'échelle.
 *
 * ## Pourquoi les formes comptent autant que les couleurs
 *
 * « Je veux que le visuel soit homogène et premium » — Aude, 22/08/2026. Le
 * premium ne se joue pas sur la couleur seule : il se joue sur le fait que
 * TOUT s'aligne. L'échelle typographique de `app.css` prévoit deux tailles
 * entre 0,60 et 1,00 rem — `--t-micro` (0.75) et `--t-petit` (0.875). Le
 * produit en emploie **trente-six**.
 *
 * Trente-six valeurs pour deux emplacements, ce n'est pas une hiérarchie : à
 * l'œil, un écart de 0,02 rem ne se lit pas comme une intention, il se lit
 * comme du flou. C'est exactement ce qui sépare un écran soigné d'un écran
 * approximatif.
 *
 * Le système existe déjà et il est complet — 7 tailles, 8 espacements,
 * 4 rayons, 5 ombres, 3 polices. Rien à inventer : il n'est appliqué qu'à
 * moitié.
 *
 * ## Ce qui n'est PAS compté, et pourquoi
 *
 * `border-radius: 50%` et `999px` ne sont pas des rayons d'échelle, ce sont des
 * FORMES — un cercle, une pilule. Les compter serait reprocher à une pastille
 * d'être ronde. `0` non plus : c'est une annulation. Et les rayons asymétriques
 * (`0 6px 6px 0`) décrivent une géométrie, pas un niveau d'arrondi.
 */
function formesEnDur(fichier: string): number {
  const source = readFileSync(fichier, 'utf8');
  const tailles = source.match(/font-size:\s*[0-9.]+(rem|px|em)/g) ?? [];
  const rayons = source.match(/border-radius:\s*[0-9.]+(px|rem|em)\s*;/g) ?? [];
  return tailles.length + rayons.length;
}

describe('l’homogénéité visuelle ne se dégrade pas', () => {
  const palette = paletteLegitime();

  it('la palette légitime est bien celle de la charte et des univers', () => {
    expect(palette.has('#12463b'), 'le vert Verrière').toBe(true);
    expect(palette.has('#f7f6f2'), 'l’ivoire').toBe(true);
    expect(palette.size).toBeGreaterThan(40);
  });

  for (const fichier of composants()) {
    const plafond = PLAFONDS.get(fichier) ?? 0;
    it(`${fichier.replace('src/composants/', '')} ne pose pas plus de ${plafond} couleur(s) en dur`, () => {
      const dures = enDur(fichier, palette);
      expect(
        dures.length,
        dures.length > plafond
          ? `\n${fichier} pose ${dures.length} couleurs hors charte (plafond ${plafond}).\n` +
            `Les couleurs en cause :\n  ${dures.join('  ')}\n\n` +
            `Une couleur se prend dans app.css ou dans son univers (lib/univers.ts),\n` +
            `jamais en dur. Voir docs/ORDRE-HOMOGENEITE-VISUELLE.md.`
          : ''
      ).toBeLessThanOrEqual(plafond);
    });
  }

  /*
   * LES FORMES — même cliquet que les couleurs.
   *
   * Le plafond global plutôt que fichier par fichier : la dette est de 502
   * déclarations sur 57 composants au 22/08, et ce qui compte est qu'elle
   * DESCENDE. Un plafond par fichier figerait une carte qui bouge à chaque
   * mini-app livrée ; un plafond global laisse un volet se réaligner sans
   * attendre les autres, et refuse que le total remonte.
   */
  it('les tailles et rayons en dur ne se multiplient pas', () => {
    const PLAFOND_FORMES = 502;
    const parFichier = composants()
      .map((f) => ({ fichier: f, dette: formesEnDur(f) }))
      .filter((x) => x.dette > 0)
      .sort((a, b) => b.dette - a.dette);
    const total = parFichier.reduce((s, x) => s + x.dette, 0);

    expect(
      total,
      total > PLAFOND_FORMES
        ? `\n${total} tailles ou rayons écrits en dur, pour un plafond de ${PLAFOND_FORMES}.\n` +
          `Les plus chargés :\n` +
          parFichier.slice(0, 5).map((x) => `  ${x.dette}  ${x.fichier}`).join('\n') +
          `\n\nL'échelle existe déjà dans app.css : --t-micro/--t-petit/--t-base/--t-lead\n` +
          `pour les tailles, --rayon-petit/--rayon/--rayon-large pour les arrondis.\n` +
          `Voir docs/DIRECTIVES-VISUELLES.md.`
        : ''
    ).toBeLessThanOrEqual(PLAFOND_FORMES);
  });

  /*
   * Le plafond ne remonte jamais.
   *
   * Quand un volet se réaligne, son plafond doit suivre dans le même lot —
   * sinon la place libérée redevient un droit à polluer pour la session
   * suivante, et le cliquet ne clique plus.
   */
  it('aucun plafond ne reste au-dessus de la dette réelle', () => {
    const relachements: string[] = [];
    for (const [fichier, plafond] of PLAFONDS) {
      let dures: string[];
      try {
        dures = enDur(fichier, palette);
      } catch {
        relachements.push(`${fichier} : plafond ${plafond} pour un fichier disparu`);
        continue;
      }
      if (dures.length < plafond) {
        relachements.push(`${fichier} : plafond ${plafond}, dette réelle ${dures.length} — à descendre`);
      }
    }
    expect(relachements, `des plafonds sont plus hauts que la dette :\n${relachements.join('\n')}`).toEqual([]);
  });
});
