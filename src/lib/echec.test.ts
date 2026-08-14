import { describe, expect, it } from 'vitest';
import { echecScanne, refusAvantLecture, TAILLE_MAX } from './echec';

const fichier = (nom: string, type: string, taille: number): File =>
  new File([new Uint8Array(Math.min(taille, 1))], nom, { type });

/** `File.size` se déduit du contenu : on le force pour éprouver les seuils. */
const avecTaille = (f: File, taille: number): File => {
  Object.defineProperty(f, 'size', { value: taille });
  return f;
};

describe('ce qu’on refuse avant d’ouvrir le fichier', () => {
  it('accepte un PDF ordinaire', () => {
    expect(refusAvantLecture(avecTaille(fichier('rapport.pdf', 'application/pdf', 1), 2_000_000))).toBeNull();
  });

  it('refuse une image, et dit où trouver le vrai fichier', () => {
    const r = refusAvantLecture(avecTaille(fichier('photo.jpg', 'image/jpeg', 1), 500_000));
    expect(r?.genre).toBe('pasUnPdf');
    // Le message doit donner la sortie, pas seulement le constat.
    expect(r?.message).toMatch(/diagnostiqueur/i);
  });

  it('reconnaît un PDF à son extension même sans type déclaré', () => {
    // Certains navigateurs ne renseignent pas le type sur un glisser-déposer.
    expect(refusAvantLecture(avecTaille(fichier('rapport.PDF', '', 1), 1_000_000))).toBeNull();
  });

  it('refuse un fichier vide', () => {
    expect(refusAvantLecture(avecTaille(fichier('vide.pdf', 'application/pdf', 0), 0))?.genre).toBe(
      'vide'
    );
  });

  it('laisse passer un gros dossier, et arrête l’excessif', () => {
    // De vrais dossiers dépassent vingt mégaoctets quand ils portent des photos :
    // le plafond ne doit pas les recaler.
    expect(
      refusAvantLecture(avecTaille(fichier('gros.pdf', 'application/pdf', 1), 25_000_000))
    ).toBeNull();
    expect(
      refusAvantLecture(avecTaille(fichier('enorme.pdf', 'application/pdf', 1), TAILLE_MAX + 1))
        ?.genre
    ).toBe('tropLourd');
  });
});

describe('le PDF scanné', () => {
  it('explique que le problème vient du fichier, et ce qu’il faut demander', () => {
    const m = echecScanne().message;
    expect(m).toMatch(/images/i);
    expect(m).toMatch(/d[’']origine/i);
    // On n'accuse personne : ni le lecteur, ni le diagnostiqueur.
    expect(m).not.toMatch(/vous (?:avez|n['’]avez pas)/i);
  });
});
