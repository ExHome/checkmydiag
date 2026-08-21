import { describe, expect, it } from 'vitest';
import { empreinte } from './carnet';

/**
 * L'empreinte est l'identité d'un rapport dans le carnet : si elle bouge, la
 * fiche se dédouble et le travail déjà consigné devient introuvable.
 */
describe('l’identité d’un rapport au carnet', () => {
  it('rouvre la même fiche pour le même fichier', () => {
    expect(empreinte('DDT_-_26_IMO_1607P.pdf', 4_200_000)).toBe(
      empreinte('DDT_-_26_IMO_1607P.pdf', 4_200_000)
    );
  });

  /* Deux dossiers d'un même client portent des noms très proches : l'empreinte
     doit les séparer, sinon les notes de l'un se lisent sur l'autre. */
  it('sépare deux rapports que rien d’autre ne distingue', () => {
    expect(empreinte('DDT_-_26_IMO_1607P.pdf', 4_200_000)).not.toBe(
      empreinte('DDT_-_26_IMO_1608P.pdf', 4_200_000)
    );
  });

  /* Un rapport réédité garde son nom mais change de taille : c'est un autre
     document, et le confondre ferait porter d'anciennes notes sur du neuf. */
  it('distingue un rapport réédité sous le même nom', () => {
    expect(empreinte('DDT.pdf', 4_200_000)).not.toBe(empreinte('DDT.pdf', 4_200_001));
  });
});
