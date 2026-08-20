import { describe, expect, it } from 'vitest';
import { analyser } from './index';
import type { PageTexte } from '../lignes';

/**
 * Savoir qu'on ne peut pas lire.
 *
 * Un rapport scanné ne rend presque aucun texte : son contenu est en image. Le
 * danger n'est pas de ne rien lire, c'est de **conclure** — chaque volet paraît
 * alors vide, et le silence de l'extraction se lit exactement comme un rapport
 * sans défaut.
 *
 * L'ancien seuil — moins de quatre lignes par page — ne repérait que les
 * documents entièrement muets. Un DDT scanné de soixante-douze pages, avec
 * quarante pages vides, en rendait treize par page : il passait pour lisible,
 * **et cinq volets y étaient détectés**, parce que le générateur imprime ses
 * en-têtes par-dessus l'image.
 *
 * Mesuré sur soixante rapports : la médiane est de 32 lignes par page, le
 * cinquième centile de 22, et un rapport ordinaire a 3 % de pages vides. Un
 * seul dépasse 30 %, et c'est le scanné.
 */
const pageDense = (n: number): PageTexte => ({
  numero: n,
  lignes: Array.from({ length: 30 }, (_, i) => `Ligne ${i} du rapport, avec du texte lisible.`)
});

/** Ce que rend une page scannée : l'en-tête du générateur, et rien d'autre. */
const pageScannee = (n: number): PageTexte => ({
  numero: n,
  lignes: ['Dossier de Diagnostic Technique', `Réf : Page ${n} / 72`]
});

const pageVide = (n: number): PageTexte => ({ numero: n, lignes: [] });

describe('un document qu’on ne peut pas lire', () => {
  it('laisse passer un rapport ordinaire', () => {
    const pages = Array.from({ length: 40 }, (_, i) => pageDense(i + 1));
    expect(analyser(pages).illisible).toBe(false);
  });

  it('laisse passer un rapport qui porte quelques pages vides', () => {
    // Les annexes réglementaires en contiennent : quatre pages vides sur
    // soixante-quatorze chez un éditeur, et le document reste lisible.
    const pages = [
      ...Array.from({ length: 36 }, (_, i) => pageDense(i + 1)),
      ...Array.from({ length: 4 }, (_, i) => pageVide(i + 37))
    ];
    expect(analyser(pages).illisible).toBe(false);
  });

  it('reconnaît le document scanné que l’ancien seuil laissait passer', () => {
    /*
     * Le cas réel : 72 pages, 40 vides, 13 lignes par page — uniquement les
     * en-têtes du générateur. À quatre lignes par page, il passait pour
     * lisible.
     */
    const pages = [
      ...Array.from({ length: 40 }, (_, i) => pageVide(i + 1)),
      ...Array.from({ length: 32 }, (_, i) => pageScannee(i + 41))
    ];
    const a = analyser(pages);
    expect(a.illisible).toBe(true);
    expect(pages.reduce((n, p) => n + p.lignes.length, 0) / pages.length).toBeGreaterThan(0.5);
  });

  it('reconnaît un document entièrement muet', () => {
    expect(analyser(Array.from({ length: 36 }, (_, i) => pageVide(i + 1))).illisible).toBe(true);
  });

  it('reconnaît un document dense mais criblé de pages vides', () => {
    /*
     * La part de pages vides tranche là où la moyenne ne suffit pas : une
     * annexe bien remplie peut relever la moyenne d'un document dont la moitié
     * des pages ne rendent rien.
     */
    const pages = [
      ...Array.from({ length: 20 }, (_, i) => pageDense(i + 1)),
      ...Array.from({ length: 20 }, (_, i) => pageVide(i + 21))
    ];
    expect(analyser(pages).illisible).toBe(true);
  });

  it('ne se prononce pas sur un document sans page', () => {
    expect(analyser([]).illisible).toBe(false);
  });
});
