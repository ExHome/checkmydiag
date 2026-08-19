/**
 * La famille des pictogrammes, tenue par le test.
 *
 * L'ordre de mission du 19/08 pose au § 4 : « deux pictogrammes ne doivent
 * jamais donner l'impression de provenir de deux bibliothèques différentes ».
 * Huit pictogrammes dessinés séparément en donnaient huit — traits de 5 et de
 * 6, un aplat plein sur une structure, des densités de 2 à 11 formes.
 *
 * Le § 20 dit quoi en faire : « l'excellence ne doit pas dépendre uniquement de
 * la vigilance humaine, elle doit être inscrite dans le système ». Ce fichier
 * est cette inscription. La règle est écrite dans `pictos/FAMILLE.md`.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DOSSIER = 'src/composants/pictos';
const PUBLIC = 'public/pictos';

const FICHIERS = readdirSync(DOSSIER).filter((f) => f.endsWith('.svg'));

/*
 * La boîte englobante ne se lit pas dans le texte du SVG.
 *
 * Première version de ce test : ramasser tous les nombres du fichier et en
 * prendre le minimum et le maximum. Les huit pictogrammes ont échoué — et
 * c'était le test qui avait tort. Un `d` contient des rayons d'arc (`a36 36`),
 * des déplacements relatifs (`v-20`, `h5`), des drapeaux de balayage (`1 1`) :
 * aucun de ces nombres n'est une coordonnée.
 *
 * Une boîte englobante réelle demande d'interpréter arcs et courbes. Seul un
 * moteur de rendu sait le faire, et c'est le navigateur qui le fait — la mesure
 * est faite là, avec `getBBox()`, pas ici. Ce fichier tient ce qui se vérifie
 * honnêtement sur le texte : trait, couleurs, masses, densité, publication.
 */

describe('la famille des pictogrammes', () => {
  it('couvre tout ce qui portait un émoji', () => {
    /* Neuf diagnostics — l'assainissement compris, que l'ODM ne liste pas mais
       que le produit traite —, deux outils, les trois vues du dossier, et le
       repère de lieu du widget. Quinze en tout : c'est le compte exact de ce
       qui affichait un émoji avant. */
    expect(FICHIERS.length).toBe(15);
  });

  for (const f of FICHIERS) {
    const svg = readFileSync(join(DOSSIER, f), 'utf8');

    describe(f, () => {
      it('se dessine dans la même boîte que les autres', () => {
        expect(svg).toContain('viewBox="0 0 100 100"');
        expect(svg).not.toMatch(/\s(width|height)="/);
      });

      it('porte le trait de la famille : 6, arrondi aux deux bouts', () => {
        expect(svg).toContain('stroke-width="6"');
        expect(svg).toContain('stroke-linecap="round"');
        expect(svg).toContain('stroke-linejoin="round"');
      });

      /*
       * Aucune couleur figée : le pictogramme suit son contexte.
       *
       * Le même dessin sert sur un dégradé saturé — où il doit être crème — et
       * sur une tuile claire, où il doit être vert profond. Une couleur écrite
       * dans le fichier obligerait à deux bibliothèques, donc à deux familles :
       * exactement ce que le § 4 interdit.
       */
      it('ne fige aucune couleur : il suit son contexte', () => {
        expect([...svg.matchAll(/#[0-9A-Fa-f]{3,6}/g)].length, 'couleur en dur').toBe(0);
        expect(svg).toContain('stroke="currentColor"');
      });

      /*
       * Une seule masse pleine par pictogramme, et jamais sur une structure.
       *
       * Le visuel de référence accroche l'œil par une masse unique — l'éclair,
       * le corps du termite — au milieu de contours nets. Deux masses, et le
       * dessin devient une illustration ; une masse sur une maison ou un
       * bouclier, et il devient une tache.
       */
      it('ne porte au plus qu’une seule masse pleine', () => {
        const masses = [...svg.matchAll(/fill="currentColor"/g)].length;
        expect(masses).toBeLessThanOrEqual(1);
      });

      it('reste sous la densité qui se referme à petite taille', () => {
        const formes = [...svg.matchAll(/<(path|circle|ellipse|rect|line|polygon)\b/g)].length;
        expect(formes).toBeGreaterThanOrEqual(2);
        expect(formes).toBeLessThanOrEqual(6);
      });

      it('est publié à l’identique dans public/', () => {
        /* Le composant lit `public/` : une divergence entre les deux ferait
           afficher un dessin que personne n'a relu. */
        expect(readFileSync(join(PUBLIC, f), 'utf8')).toBe(svg);
      });
    });
  }

  it('ne laisse aucun pictogramme se distinguer par son épaisseur', () => {
    const epaisseurs = new Set(
      FICHIERS.flatMap((f) =>
        [...readFileSync(join(DOSSIER, f), 'utf8').matchAll(/stroke-width="([\d.]+)"/g)].map(
          (m) => m[1]
        )
      )
    );
    /* 6 pour le trait ; 4 pour le contour d'une masse pleine, qui doit rester
       plus fin sous peine d'épaissir la forme qu'il remplit. */
    expect([...epaisseurs].sort()).toEqual(['4', '6']);
  });
});
