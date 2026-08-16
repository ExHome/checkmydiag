import { describe, expect, it } from 'vitest';
import { lireVentilation } from './dpe';

/**
 * La ventilation, telle que le DPE la décrit.
 *
 * « Ventilation par ouverture des fenêtres » veut dire qu'il n'y a aucune
 * ventilation mécanique. Le DPE l'écrit sans commentaire, au milieu de sa liste
 * d'équipements.
 *
 * L'enjeu dépasse l'énergie : sans extraction, l'humidité stagne et décolle les
 * peintures — et une peinture qui s'écaille fait passer un revêtement au plomb
 * de la classe 1 à la classe 3. Deux diagnostics du même dossier disent la même
 * chose sans jamais se rencontrer.
 */
describe('la ventilation du logement', () => {
  it('reconnaît l’absence de ventilation mécanique', () => {
    expect(lireVentilation(['Ventilation Ventilation par ouverture des fenêtres'])).toBe('aucune');
  });

  it('reconnaît une VMC', () => {
    expect(lireVentilation(['Ventilation VMC simple flux auto-réglable'])).toBe('mecanique');
    expect(lireVentilation(['Ventilation Double flux avec échangeur'])).toBe('mecanique');
  });

  /*
   * Le garde-fou. Le mot « fenêtres » revient partout dans un DPE — dans les
   * recommandations de travaux, dans le confort d'été, dans le descriptif des
   * menuiseries. Seule la ligne qui COMMENCE par « Ventilation » constate
   * quelque chose sur la ventilation.
   */
  it('ne conclut pas depuis une autre ligne parlant de fenêtres', () => {
    expect(
      lireVentilation([
        'Équipez les fenêtres de votre logement de volets',
        '→ Fermez les fenêtres et volets la journée'
      ])
    ).toBeNull();
  });

  it('se tait quand la ligne est absente', () => {
    expect(lireVentilation(['Chauffage Chaudière individuelle gaz standard'])).toBeNull();
  });
});
