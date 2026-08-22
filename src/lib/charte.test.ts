/**
 * La charte tient par un test, pas par la vigilance.
 *
 * « Grave la règle : chaque apprentissage doit être acquis. » Trois couleurs
 * ont été retirées du produit sur décision explicite, et chacune était déjà
 * revenue au moins une fois — parce que la règle vivait dans un commentaire,
 * et qu'un commentaire n'arrête rien.
 *
 * Ce fichier lit les sources et échoue si l'une d'elles réapparaît. Il ne
 * remplace pas le jugement : il empêche la régression silencieuse.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APPS } from './apps';

/** Tous les fichiers de source où une couleur peut s'écrire. */
function sources(dossier = 'src', trouves: string[] = []): string[] {
  for (const e of readdirSync(dossier)) {
    const chemin = join(dossier, e);
    if (statSync(chemin).isDirectory()) sources(chemin, trouves);
    /* Tous les fichiers de test sont exclus, pas seulement celui-ci : un test
       qui interdit une couleur doit pouvoir la NOMMER. `corail.test.ts` s'est
       fait accuser par cette règle le jour où il a été écrit. */
    else if (/\.(svelte|css|ts)$/.test(e) && !e.endsWith('.test.ts')) trouves.push(chemin);
  }
  return trouves;
}

const FICHIERS = sources();

/**
 * Les couleurs bannies, et la décision qui les a bannies.
 *
 * Le motif vise la VALEUR, pas le mot : un commentaire peut raconter l'histoire
 * du corail, mais aucune ligne ne doit plus en poser un pixel.
 */
const BANNIES = [
  {
    nom: 'le corail',
    quand: '19 août 2026 — « LE CORAIL PART »',
    motifs: [/#ff6b5d/i, /#f05844/i, /#d0402c/i, /255\s+107\s+93/]
  },
  {
    nom: 'le sable de l’ancienne charte',
    quand: '19 août 2026 — « je ne veux pas du sable dominant »',
    motifs: [/#f4e8d8/i, /244\s+232\s+216/]
  },
  {
    /*
     * Le pétrole était revenu, et le test ne le voyait pas.
     *
     * Il ne surveillait que l'hexadécimal. Or une ombre CSS s'écrit en
     * composantes : `rgb(26 77 92 / 6%)` est exactement #1a4d5c, et
     * `rgb(15 58 71 / 22%)` exactement #0f3a47. Vingt et une occurrences
     * étaient ainsi posées — dont les trois jetons `--ombre` d'app.css, donc
     * l'application entière portait des ombres bleues sur un socle vert.
     *
     * La leçon vaut au-delà de cette couleur : un garde-fou qui ne connaît
     * qu'une seule écriture de ce qu'il interdit ne garde rien. Le corail et
     * le sable avaient déjà leur triplet ; le pétrole n'en avait pas.
     */
    nom: 'le bleu pétrole',
    quand: 'pack maître du 18 août 2026 — socle vert profond + ivoire',
    motifs: [
      /#1a4d5c/i,
      /#0f3a47/i,
      /#14434f/i,
      /26\s+77\s+92/,
      /15\s+58\s+71/,
      /20\s+67\s+79/
    ]
  }
];

describe('les couleurs retirées ne reviennent pas', () => {
  for (const { nom, quand, motifs } of BANNIES) {
    it(`${nom} n’est plus posé nulle part (${quand})`, () => {
      const fautifs: string[] = [];
      for (const f of FICHIERS) {
        const lignes = readFileSync(f, 'utf8').split('\n');
        lignes.forEach((ligne, i) => {
          /* Une ligne de commentaire peut nommer la couleur : c'est ainsi qu'on
             garde la mémoire de la décision. Ce qu'on interdit, c'est de la
             POSER — donc les lignes de code. */
          const estCommentaire = /^\s*(\*|\/\/|\/\*)/.test(ligne);
          if (estCommentaire) return;
          if (motifs.some((m) => m.test(ligne))) fautifs.push(`${f}:${i + 1}: ${ligne.trim().slice(0, 70)}`);
        });
      }
      expect(fautifs, `${nom} est revenu dans :\n${fautifs.join('\n')}`).toEqual([]);
    });
  }
});

/**
 * UN JETON PORTE LE NOM DE CE QU'IL CONTIENT.
 *
 * Charte maître du 20 août 2026, §22 et §23 : « Ne jamais conserver
 * `--or: #12463B`. C'est sémantiquement faux et cela créera forcément une
 * nouvelle dérive. »
 *
 * Ce n'était pas une crainte de principe, c'était un constat. `--or` valait
 * #12463b, `--or-fonce` #0a2b23, `--or-clair` #a6c39a — trois jetons nommés
 * « or » qui ne portaient que du vert et du sauge, sur 119 usages. Et le
 * mensonge cassait l'écran : `background: var(--or)` allait toujours avec
 * `color: var(--vert-900)`, soit du vert #12463b sous du vert #0a2b23 —
 * 1,42:1. Tous les boutons du produit étaient illisibles au survol.
 */
/**
 * LES INVARIANTS DE MARQUE.
 *
 * L'ordre de mission maitre du 20/08/2026 n'en laisse que quatre : le logo, le
 * nom, la signature et le vert Verriere. Tout le reste de l'identite peut etre
 * detruit et refait — ces quatre-la, non.
 *
 * La signature s'ecrit « Lumiere sur vos diagnostics ». SANS ARTICLE : c'est
 * ainsi qu'elle est composee sur la publicite de marque, sous le logo. Le code
 * ecrivait « La lumiere sur vos diagnostics » a quatre endroits, y compris dans
 * le titre de la page. Un article de trop dans une signature de marque n'est pas
 * un detail de redaction : c'est la marque qui n'est plus la meme.
 *
 * Et la signature n'est plus un slogan — elle est devenue le concept UX du
 * produit (la lumiere revele). Raison de plus pour qu'elle ne derive pas.
 */
describe('les invariants de marque', () => {
  const SIGNATURE = 'Lumière sur vos diagnostics';

  it('ecrit la signature sans article', () => {
    const fautifs = FICHIERS.concat(['index.html']).filter((f) =>
      readFileSync(f, 'utf8').includes('La lumière sur vos diagnostics')
    );
    expect(fautifs, 'la signature prend un article dans : ' + fautifs.join(', ')).toEqual([]);
  });

  it('garde la signature exacte dans le module qui la porte', () => {
    const lumiere = readFileSync('src/lib/lumiere.ts', 'utf8');
    expect(lumiere).toContain("export const SIGNATURE = '" + SIGNATURE + "';");
  });

  it('garde le vert Verriere', () => {
    expect(readFileSync('src/app.css', 'utf8')).toContain('--verriere-vert: #12463b');
  });
});

describe('aucun jeton ne ment sur ce qu’il contient', () => {
  const charte = readFileSync('src/app.css', 'utf8');

  for (const mort of ['--or', '--or-fonce', '--or-clair', '--or-pale', '--petrole', '--petrole-fonce']) {
    it(`${mort} n’existe plus`, () => {
      expect(charte, `${mort} est redéclaré dans app.css`).not.toMatch(
        new RegExp('^\s*' + mort.replace(/-/g, '\-') + ':', 'm')
      );
      const usages = FICHIERS.filter((f) => readFileSync(f, 'utf8').includes(`var(${mort})`));
      expect(usages, `${mort} est encore utilisé dans : ${usages.join(', ')}`).toEqual([]);
    });
  }

  it('pose le socle vert × ivoire × doré sable', () => {
    for (const [nom, valeur] of [
      ['--verriere-vert-profond', '#0a2b23'],
      ['--verriere-vert', '#12463b'],
      ['--verriere-ivoire', '#f7f6f2'],
      ['--verriere-sable-or', '#c8a96b'],
      ['--verriere-sable-clair', '#e4d4b2'],
      ['--verriere-champagne', '#f2e9d8']
    ]) {
      expect(charte, nom).toContain(`${nom}: ${valeur}`);
    }
  });

  /*
   * Le sauge n'est plus une couleur identitaire (§2). Il peut rester dans une
   * illustration où il a un sens ; il ne peut plus être le fond, la carte, la
   * bordure dominante ni la pastille de qui que ce soit.
   */
  /*
   * LE DORE EST UN ACCENT, PAS UNE SURFACE.
   *
   * « Que sur le visuel demandé », 22/08/2026. Le visuel de référence a été
   * mesuré pixel par pixel ce jour-là : le doré y occupe **0,28 %** de l'image
   * — 1 086 pixels sur 393 216 — et seulement trois choses, le texte
   * « Non contrôlé », le sous-titre en capitales et le pictogramme. Jamais un
   * fond. Le bouton principal du visuel est vert profond.
   *
   * Le produit, lui, avait posé l'or en fond plein sous une citation, et en
   * puces de liste — que le visuel montre vertes, et qui tenaient 2,08 sur
   * l'ivoire, sous le seuil de 3:1 d'un élément graphique.
   *
   * Ce test attrape la signature d'une SURFACE : un fond doré dans un bloc qui
   * a du padding ou une hauteur minimale. Les filets, les joints d'un pixel et
   * les puces restent libres — ce sont des accents, et le visuel en a.
   */
  it('ne pose jamais le doré en fond d’une surface', () => {
    const fautifs: string[] = [];
    for (const f of FICHIERS) {
      const source = readFileSync(f, 'utf8');
      /* Chaque bloc CSS, de son accolade ouvrante à la fermante. */
      for (const bloc of source.split('}')) {
        if (!/background(-color)?:\s*var\(--verriere-sable-or/.test(bloc)) continue;

        const selecteur = bloc.split('{')[0]?.trim().split(String.fromCharCode(10)).pop() ?? '?';

        /* Un survol est transitoire et ne se voit qu'à la souris. Le visuel est
           une maquette mobile : il ne peut pas montrer d'état de survol, donc il
           ne peut pas trancher. En attente de l'arbitrage d'Aude. */
        if (/:hover|:focus|:active/.test(selecteur)) continue;

        /* `padding: 0` ne fait pas une surface — au contraire. `.panneaux` de
           l'accueil pose le doré derrière une grille à `gap: 1px` : il ne s'en
           voit qu'un filet d'un pixel entre les carreaux, le plomb de la
           verrière. C'est l'accent le plus juste du produit, et le premier jet
           de ce test l'accusait. */
        /* Écrit en deux temps, et pas en un lookahead négatif : `padding:\s*(?!0)`
           passe sur `padding: 0` parce que `\s*` peut matcher zéro espace et que
           la négation est alors testée sur l'espace, pas sur le zéro. La regex
           disait le contraire de ce qu'elle avait l'air de dire. */
        const paddingNul = /padding:\s*0\s*;/.test(bloc);
        const surface = (/padding:/.test(bloc) && !paddingNul) || /min-height:/.test(bloc);
        if (surface) fautifs.push(`${f} → ${selecteur}`);
      }
    }
    expect(
      fautifs,
      `le doré est posé en fond d'une surface : ${fautifs.join(', ')}`
    ).toEqual([]);
  });

  it('n’utilise plus le sauge comme couleur de structure', () => {
    const fautifs: string[] = [];
    for (const f of FICHIERS) {
      readFileSync(f, 'utf8')
        .split(String.fromCharCode(10))
        .forEach((ligne, i) => {
          if (/^\s*(\*|\/\/|\/\*)/.test(ligne)) return;
          if (!/#a6c39a/i.test(ligne)) return;
          if (/background|border|--u-trait|--trait\b|fill:/.test(ligne)) {
            fautifs.push(`${f}:${i + 1}: ${ligne.trim().slice(0, 70)}`);
          }
        });
    }
    expect(fautifs, `le sauge redevient structurel dans : ${fautifs.join(', ')}`).toEqual([]);
  });
});

describe('le socle du pack maître est bien celui-là', () => {
  const charte = readFileSync('src/app.css', 'utf8');

  it('pose le vert profond, le vert Verrière, l’ivoire, le sauge et le citron', () => {
    for (const [nom, valeur] of [
      ['--vert-profond', '#0a2b23'],
      ['--vert-verriere', '#12463b'],
      ['--vert-sauge', '#a6c39a'],
      ['--ivoire', '#f7f6f2'],
      ['--citron-doux', '#d6e66a']
    ]) {
      expect(charte, nom).toContain(`${nom}: ${valeur}`);
    }
  });

  it('garde l’ivoire comme fond et le vert profond comme encre', () => {
    expect(charte).toContain('--fond: #f7f6f2');
    expect(charte).toContain('--sur-fond: #0a2b23');
  });
});

/**
 * Chaque application a SA couleur.
 *
 * Le code couleur ne sert qu'à une chose : retrouver son diagnostic d'un coup
 * d'œil sur la grille. Deux applications qui partagent un dégradé annulent
 * cette fonction — et c'est arrivé, le gaz et l'assainissement portant la même
 * chaîne au caractère près.
 */
describe('les applications ne se confondent pas', () => {
  it('aucun dégradé n’est employé deux fois', () => {
    const parDegrade = new Map<string, string[]>();
    for (const [cle, app] of Object.entries(APPS)) {
      const liste = parDegrade.get(app.degrade) ?? [];
      liste.push(cle);
      parDegrade.set(app.degrade, liste);
    }
    const collisions = [...parDegrade.entries()]
      .filter(([, cles]) => cles.length > 1)
      .map(([degrade, cles]) => `${cles.join(' et ')} partagent ${degrade}`);
    expect(collisions, 'applications indiscernables sur la grille').toEqual([]);
  });
});
