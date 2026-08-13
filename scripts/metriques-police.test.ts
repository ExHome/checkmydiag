/**
 * Le contrôle qui donne sa valeur au raccourci.
 *
 * `metriques-police.ts` calcule la largeur d'un texte sans le dessiner, et c'est
 * sur ce calcul que les titres des cartes sont coupés en lignes. Tout repose sur
 * une hypothèse : que le calcul donne bien ce que le rastériseur tracera. On la
 * vérifie ici sur de vraies questions de la rubrique.
 *
 * Ce test a déjà servi : il refusait la police variable, dont les largeurs
 * annoncées ne sont pas celles qui sont dessinées. C'est lui qui a imposé de la
 * figer avant de s'en servir.
 */
import { Resvg } from '@resvg/resvg-js';
import { beforeAll, describe, expect, it } from 'vitest';
import { FAMILLE, preparerPolice } from './police-cartes';
import type { Mesure } from './metriques-police';

let mesure: Mesure;
let fichier: string;

const ESSAIS: [string, number][] = [
  ['Puis-je encore louer un logement classé F ou G ?', 68],
  ['Le DPE', 88],
  ['C’est quoi, un diagnostic immobilier ?', 78],
  ['Où trouve-t-on de l’amiante dans une maison ?', 68],
  ['Électricité et gaz', 88]
];

beforeAll(async () => {
  const preparee = await preparerPolice(ESSAIS.map(([t]) => t));
  mesure = preparee.mesure;
  fichier = preparee.fichier;
}, 60_000);

/** La largeur réellement tracée. */
function largeurTracee(texte: string, taille: number): number {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="6000" height="400">` +
    `<text x="0" y="300" font-family="${FAMILLE}" font-size="${taille}">${texte.replace(/&/g, '&amp;')}</text></svg>`;
  const boite = new Resvg(svg, {
    font: { fontFiles: [fichier], loadSystemFonts: false, defaultFontFamily: FAMILLE }
  }).getBBox();
  if (!boite) throw new Error('texte non tracé — la police n’a pas été trouvée');
  return boite.width;
}

describe('la mesure de texte', () => {
  it.each(ESSAIS)('colle au tracé pour « %s »', (texte, taille) => {
    const tracee = largeurTracee(texte, taille);
    const calculee = mesure(texte, taille);
    // La mesure porte sur l'avance, le tracé sur l'encre : le calcul est
    // légèrement supérieur, ce qui va dans le bon sens pour une mise en page.
    // Au-delà de cinq pour cent, c'est la lecture des tables qui est fausse.
    expect(Math.abs(calculee - tracee) / tracee).toBeLessThan(0.05);
  });

  it('ne rend jamais une largeur nulle sur du texte', () => {
    expect(mesure('a', 100)).toBeGreaterThan(10);
    expect(mesure('œuf, çà et là — « oui » ?', 40)).toBeGreaterThan(100);
  });

  it('est proportionnelle à la taille', () => {
    expect(mesure('diagnostic', 100)).toBeCloseTo(mesure('diagnostic', 50) * 2, 5);
  });
});
