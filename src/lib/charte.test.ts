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

/** Tous les fichiers de source où une couleur peut s'écrire. */
function sources(dossier = 'src', trouves: string[] = []): string[] {
  for (const e of readdirSync(dossier)) {
    const chemin = join(dossier, e);
    if (statSync(chemin).isDirectory()) sources(chemin, trouves);
    else if (/\.(svelte|css|ts)$/.test(e) && !e.endsWith('charte.test.ts')) trouves.push(chemin);
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
    nom: 'le bleu pétrole',
    quand: 'pack maître du 18 août 2026 — socle vert profond + ivoire',
    motifs: [/#1a4d5c/i, /#0f3a47/i, /#14434f/i]
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
