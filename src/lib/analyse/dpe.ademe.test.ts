/**
 * Le calcul du diagnostiqueur n'est pas en cause, et ne doit jamais l'être.
 *
 * Les logiciels de DPE sont validés par l'ADEME : leur moteur est contrôlé, la
 * lettre imprimée fait foi. Ce que ce produit retrouve à partir des chiffres du
 * rapport est une manière de LIRE une étiquette qui est une image — pas une
 * vérification, encore moins une correction.
 *
 * Quand un DPE se révèle faux, la faute est dans les DONNÉES SAISIES. C'est
 * cela qu'il faut dire, parce que c'est cela qui se fait rectifier.
 *
 * Ces tests existent pour qu'on ne le réapprenne pas une troisième fois.
 */
import { describe, expect, it } from 'vitest';
import { analyserDpe } from './dpe';

const GRAND = [
  'N°ADEME : 2433E2439405R',
  'Diagnostic de performance',
  'Etabli le : 05/07/2024',
  'Valable jusqu’au : 04/07/2034',
  'Surface de référence : 136,35 m²',
  'Ce logement émet 2 563 kg de CO ₂ par an,',
  'énergie totale pour les 13 392 kWh entre 1 320 € et 1 830 € par an'
];

const STUDIO = [
  'N°ADEME : 2533E2550136P',
  'Diagnostic de performance',
  'Etabli le : 05/08/2023',
  'Surface de référence : 22.4 m²',
  'Ce logement émet 261 kg de CO ₂ par an,',
  'énergie totale pour les 8 105 kWh entre 690 € et 960 € par an'
];

function texte(lignes: string[]): string {
  const d = analyserDpe(lignes, [4, 15]);
  return [...d.explication, ...d.aFaire, d.verdict].join(' ');
}

describe('ce que le produit dit de son propre calcul', () => {
  it('dit que le logiciel du diagnostiqueur est validé par l’ADEME', () => {
    expect(texte(GRAND)).toMatch(/valid[ée] par l['’]ADEME/i);
  });

  it('présente son classement comme une lecture, pas comme une correction', () => {
    const t = texte(GRAND);
    expect(t).toMatch(/mani[èe]re de lire l['’][ée]tiquette|fa[çc]on de lire/i);
    expect(t).toMatch(/pas de la corriger|son calcul fait foi/i);
  });

  it('n’accuse jamais le calcul', () => {
    const t = texte(GRAND);
    expect(t).not.toMatch(/erreur de calcul/i);
    expect(t).not.toMatch(/calcul (?:faux|erron[ée]|fautif)/i);
    expect(t).not.toMatch(/(?:v[ée]rifier|contr[ôo]ler) le calcul/i);
  });

  it('envoie vers les données saisies, qui sont la vraie source d’erreur', () => {
    const t = texte(GRAND);
    expect(t).toMatch(/donn[ée]es saisies/i);
    expect(t).toMatch(/surface, ann[ée]e de construction/i);
  });
});

describe('ce que le produit ne dit plus', () => {
  it('ne prétend plus s’abstenir sous 40 m² : il applique la bonne échelle', () => {
    const t = texte(STUDIO);
    expect(t).not.toMatch(/nous ne recalculons (?:donc )?pas la lettre/i);
    expect(t).toMatch(/leur propre [ée]chelle/i);
  });

  it('explique pourquoi un petit logement a son échelle', () => {
    expect(texte(STUDIO)).toMatch(/consomme davantage au m[èe]tre carr[ée]/i);
  });
});
