import { describe, expect, it } from 'vitest';
import { echecDeLecture, genreDEchec } from './echec';

/** Les erreurs telles que pdf.js les lève réellement. */
function erreurPdf(nom: string, message: string): Error {
  const e = new Error(message);
  e.name = nom;
  return e;
}

describe('échecs de lecture', () => {
  it('reconnaît un fichier vide', () => {
    const e = erreurPdf('InvalidPDFException', 'The PDF file is empty, i.e. its size is zero bytes.');
    expect(genreDEchec(e)).toBe('vide');
  });

  it('reconnaît un PDF protégé par mot de passe', () => {
    expect(genreDEchec(erreurPdf('PasswordException', 'No password given'))).toBe('motDePasse');
  });

  it('reconnaît un fichier abîmé', () => {
    expect(genreDEchec(erreurPdf('InvalidPDFException', 'Invalid PDF structure.'))).toBe('abime');
  });

  it('reconnaît un rapport trop lourd pour le navigateur', () => {
    expect(genreDEchec(erreurPdf('RangeError', 'Array buffer allocation failed'))).toBe('tropLourd');
  });

  it('retombe sur un message général quand la cause est inconnue', () => {
    expect(genreDEchec(new Error('boom'))).toBe('inconnu');
    expect(genreDEchec(undefined)).toBe('inconnu');
  });

  it('ne montre jamais le texte anglais de pdf.js', () => {
    const messages = [
      erreurPdf('InvalidPDFException', 'The PDF file is empty, i.e. its size is zero bytes.'),
      erreurPdf('PasswordException', 'No password given'),
      new Error('something went wrong')
    ].map((e) => echecDeLecture(e).message);

    for (const message of messages) {
      expect(message).not.toMatch(/[Tt]he PDF|password given|went wrong/);
      // Un message qui ne dit pas quoi faire laisse le lecteur sur place.
      expect(message.length).toBeGreaterThan(60);
    }
  });
});
