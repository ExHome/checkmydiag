/**
 * L'historique des couches, éprouvé sur un faux navigateur.
 *
 * Ce que ces tests protègent est un geste, pas une fonction : « je balaie
 * depuis le bord et l'écran se referme ». Ils rejouent donc les quatre
 * scénarios réels — sortir par le geste, sortir par le bouton, empiler deux
 * écrans, fermer l'un puis l'autre — et vérifient qu'à la fin l'historique est
 * aussi propre qu'au départ. Une entrée fantôme de plus par diagnostic ouvert,
 * et l'utilisateur devrait appuyer douze fois sur la flèche pour quitter.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { couchesOuvertes, oublierLesCouches, ouvrirCouche } from './couches';

/** Un historique de navigateur réduit à ce dont le module se sert. */
class FauxHistorique {
  entrees: unknown[] = [null];
  private auRetour: (() => void) | null = null;

  pushState(etat: unknown): void {
    this.entrees.push(etat);
  }

  go(pas: number): void {
    for (let i = 0; i < Math.abs(pas); i += 1) {
      if (this.entrees.length > 1) this.entrees.pop();
      if (this.auRetour) this.auRetour();
    }
  }

  /** Le geste de l'utilisateur : balayage depuis le bord, ou flèche. */
  gesteDeRetour(): void {
    if (this.entrees.length > 1) this.entrees.pop();
    if (this.auRetour) this.auRetour();
  }

  ecouter(f: () => void): void {
    this.auRetour = f;
  }

  get profondeur(): number {
    return this.entrees.length;
  }
}

let faux: FauxHistorique;

beforeEach(() => {
  oublierLesCouches();
  faux = new FauxHistorique();
  vi.stubGlobal('history', {
    pushState: (etat: unknown) => faux.pushState(etat),
    go: (pas: number) => faux.go(pas)
  });
  vi.stubGlobal('window', {
    addEventListener: (nom: string, f: () => void) => {
      if (nom === 'popstate') faux.ecouter(f);
    },
    removeEventListener: () => {}
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  oublierLesCouches();
});

describe('l’historique des couches', () => {
  it('le geste de retour referme l’écran ouvert', () => {
    const fermer = vi.fn();
    ouvrirCouche(fermer);

    expect(couchesOuvertes()).toBe(1);
    expect(faux.profondeur).toBe(2);

    faux.gesteDeRetour();

    expect(fermer).toHaveBeenCalledTimes(1);
    expect(couchesOuvertes()).toBe(0);
    expect(faux.profondeur, 'l’historique revient à son état d’origine').toBe(1);
  });

  it('le bouton de sortie ne laisse pas d’entrée fantôme', () => {
    const fermer = vi.fn();
    const sortir = ouvrirCouche(fermer);

    sortir();

    expect(couchesOuvertes()).toBe(0);
    expect(faux.profondeur, 'sinon la flèche du navigateur ne fait plus rien').toBe(1);
    expect(fermer, 'le bouton ferme déjà l’écran lui-même').not.toHaveBeenCalled();
  });

  it('dix ouvertures et fermetures ne creusent pas l’historique', () => {
    for (let i = 0; i < 10; i += 1) {
      const sortir = ouvrirCouche(() => {});
      sortir();
    }
    expect(faux.profondeur).toBe(1);
    expect(couchesOuvertes()).toBe(0);
  });

  it('deux écrans empilés se referment un par un', () => {
    const fermerA = vi.fn();
    const fermerB = vi.fn();
    ouvrirCouche(fermerA);
    ouvrirCouche(fermerB);

    expect(faux.profondeur).toBe(3);

    faux.gesteDeRetour();
    expect(fermerB, 'le geste ferme celui du dessus').toHaveBeenCalledTimes(1);
    expect(fermerA, 'et lui seul').not.toHaveBeenCalled();

    faux.gesteDeRetour();
    expect(fermerA).toHaveBeenCalledTimes(1);
    expect(couchesOuvertes()).toBe(0);
    expect(faux.profondeur).toBe(1);
  });

  it('fermer celui du dessus par le bouton n’emporte pas celui du dessous', () => {
    const fermerA = vi.fn();
    const fermerB = vi.fn();
    ouvrirCouche(fermerA);
    const sortirB = ouvrirCouche(fermerB);

    sortirB();

    expect(fermerA, 'le piège : un popstate provoqué par nous dépilait deux couches').not.toHaveBeenCalled();
    expect(couchesOuvertes()).toBe(1);
    expect(faux.profondeur).toBe(2);
  });

  it('un bouton cliqué deux fois ne remonte pas deux crans', () => {
    const sortir = ouvrirCouche(() => {});
    sortir();
    sortir();
    expect(faux.profondeur).toBe(1);
  });
});
