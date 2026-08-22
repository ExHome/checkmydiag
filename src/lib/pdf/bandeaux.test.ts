import { describe, expect, it } from 'vitest';
import type { LignePositionnee } from '../lignes';
import {
  BANDEAUX_LICIEL,
  bornerLeBandeau,
  lignesDansLeBandeau,
  pageDuBandeau,
  type DefinitionBandeau
} from './bandeaux';

/**
 * La découpe des bandeaux.
 *
 * Elle se vérifie sur du texte, sans jamais regarder l'image : **une bande est
 * juste quand elle contient les lignes de sa rubrique et aucune de la voisine.**
 */

/** Une page, écrite de haut en bas comme on la lit. L'ordonnée PDF descend. */
function page(...lignes: string[]): LignePositionnee[] {
  return lignes.map((texte, i) => ({
    texte,
    x: 40,
    y: 700 - i * 20,
    largeur: 400,
    hauteur: 10
  }));
}

const def = (nom: string): DefinitionBandeau =>
  BANDEAUX_LICIEL.find((b) => b.nom === nom) as DefinitionBandeau;

const PAGE = page(
  'DPE Diagnostic de performance énergétique (logement) p.1',
  'Performance énergétique et climatique',
  'Ce logement émet 294 kg de CO ₂ par an',
  'Le niveau de consommation énergétique dépend de l’isolation du',
  'Estimation des coûts annuels d’énergie du logement',
  'entre 770 € et 1 070 € par an',
  'Informations diagnostiqueur',
  'SARL EXEMPLE Tél : 00.00.00.00.00',
  'Page 1/11'
);

describe('la découpe des bandeaux', () => {
  it('borne l’étiquette entre son titre et la rubrique des coûts', () => {
    const b = bornerLeBandeau(PAGE, def('étiquette'));
    expect(b).not.toBeNull();
    const dedans = lignesDansLeBandeau(PAGE, b!);
    expect(dedans).toContain('Performance énergétique et climatique');
    expect(dedans).toContain('Ce logement émet 294 kg de CO ₂ par an');
    /* La rubrique voisine reste dehors : c'est tout l'enjeu. */
    expect(dedans).not.toContain('entre 770 € et 1 070 € par an');
    expect(dedans).not.toContain('Informations diagnostiqueur');
  });

  it('borne les coûts sans déborder sur le diagnostiqueur', () => {
    const dedans = lignesDansLeBandeau(PAGE, bornerLeBandeau(PAGE, def('coûts'))!);
    expect(dedans).toContain('entre 770 € et 1 070 € par an');
    expect(dedans).not.toContain('Informations diagnostiqueur');
    expect(dedans).not.toContain('Performance énergétique et climatique');
  });

  /*
   * Le pied de page traverse toutes les rubriques sans appartenir à aucune. S'il
   * pouvait fermer une bande, la découpe descendrait jusqu'en bas de page.
   */
  it('ne laisse pas le pied de page fermer une bande', () => {
    const sansFin = page(
      'Vue d’ensemble du logement',
      'Murs Mur en pierre non isolé',
      'SARL EXEMPLE Tél : 00.00.00.00.00 Dossier : 00/AAA/0000A',
      'Page 7/11'
    );
    const dedans = lignesDansLeBandeau(sansFin, bornerLeBandeau(sansFin, def('vue d’ensemble'))!);
    expect(dedans).toContain('Murs Mur en pierre non isolé');
    expect(dedans.some((l) => /Page \d+\/\d+/.test(l))).toBe(false);
  });

  /* On ne découpe pas « à peu près là » : sans son titre, pas de bande. */
  it('ne borne rien quand l’intitulé d’ouverture manque', () => {
    expect(bornerLeBandeau(page('Autre chose', 'Encore autre chose'), def('étiquette'))).toBeNull();
  });

  it('refuse une bande trop plate pour montrer quoi que ce soit', () => {
    const collees = page('Performance énergétique et climatique', 'Estimation des coûts annuels');
    expect(bornerLeBandeau(collees, def('étiquette'))).toBeNull();
  });

  /*
   * « Estimation des coûts annuels » apparaît 1,7 fois par rapport : une fois
   * sur la page de garde du dossier, une fois dans le volet DPE. Chercher hors
   * du volet ramenait la page de garde, avec la surface Carrez et le numéro
   * d'enregistrement.
   */
  it('cherche la page DANS le volet, et nulle part ailleurs', () => {
    const pages = [
      { numero: 1, positions: page('Estimation des coûts annuels : entre 500 € et 700 €') },
      { numero: 9, positions: PAGE }
    ];
    expect(pageDuBandeau(pages, def('coûts'), [8, 11])?.numero).toBe(9);
    expect(pageDuBandeau(pages, def('coûts'), [1, 3])?.numero).toBe(1);
    expect(pageDuBandeau(pages, def('coûts'), [20, 30])).toBeNull();
  });

  /*
   * Le schéma des déperditions n'est pas dans cette liste, et c'est délibéré :
   * il partage sa ligne avec « Performance de l'isolation ». Borner par
   * intitulés suppose des rubriques qui se suivent de haut en bas ; côte à
   * côte, la méthode échoue — sept rapports sur huit, mesuré.
   */
  it('ne prétend pas découper le schéma des déperditions par ses intitulés', () => {
    expect(BANDEAUX_LICIEL.map((b) => b.nom)).not.toContain('déperditions');
  });

  it('donne à chaque bandeau une légende, pour qu’on sache ce qu’on regarde', () => {
    for (const b of BANDEAUX_LICIEL) {
      expect(b.legende.length, b.nom).toBeGreaterThan(12);
      expect(b.bas.length, b.nom).toBeGreaterThan(0);
    }
  });
});
