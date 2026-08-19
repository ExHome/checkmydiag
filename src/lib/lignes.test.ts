import { describe, expect, it } from 'vitest';
import { lignesDePage, type Fragment } from './lignes';

/** Un fragment pdf.js, réduit à ce dont la reconstruction a besoin. */
function frag(str: string, x: number, y: number): Fragment {
  return { str, transform: [10, 0, 0, 10, x, y], width: str.length * 5, height: 10 };
}

describe('les ligatures typographiques', () => {
  /*
   * Relevé dans un DTG de juin 2026 : le générateur code « fi », « fl » et
   * « ffi » dans un glyphe de ligature, que pdf.js rend en fragment séparé.
   * Cinquante-deux mots du rapport en sortaient coupés en trois.
   */
  it('recolle un mot que la ligature avait coupé en trois', () => {
    const lignes = lignesDePage([frag('Identi', 50, 700), frag('fi', 80, 700), frag('ant :', 90, 700)]);
    expect(lignes[0]).toBe('Identifiant :');
  });

  it('les recolle toutes — fi, fl, ffi', () => {
    expect(lignesDePage([frag('Dé', 50, 700), frag('fi', 60, 700), frag('nition', 70, 700)])[0]).toBe(
      'Définition'
    );
    expect(lignesDePage([frag('in', 50, 680), frag('fl', 55, 680), frag('uence', 65, 680)])[0]).toBe(
      'influence'
    );
    expect(lignesDePage([frag('su', 50, 660), frag('ffi', 55, 660), frag('t', 65, 660)])[0]).toBe(
      'suffit'
    );
  });

  it('ne colle pas des mots ordinaires entre eux', () => {
    // La règle ne vaut que pour les ligatures : le reste garde ses espaces.
    const lignes = lignesDePage([frag('Date', 50, 700), frag('du', 80, 700), frag('repérage', 95, 700)]);
    expect(lignes[0]).toBe('Date du repérage');
  });

  it('laisse intacte une ligne sans ligature', () => {
    const lignes = lignesDePage([
      frag('L’installation intérieure d’électricité', 50, 700),
      frag('ne comporte aucune anomalie.', 250, 700)
    ]);
    expect(lignes[0]).toBe('L’installation intérieure d’électricité ne comporte aucune anomalie.');
  });
});
