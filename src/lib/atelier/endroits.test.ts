import { describe, expect, it } from 'vitest';
import { clesAttendues, endroitsDe, formulerCorrection } from './endroits';
import type { PageTexte } from '../lignes';

/**
 * L'écran des endroits ne vaut que s'il montre les SILENCES.
 *
 * Un atelier qui n'afficherait que ce que le moteur a trouvé donnerait à voir
 * un rapport bien lu, toujours. Ce qui fait avancer le moteur, c'est la
 * rubrique attendue qu'il n'a PAS vue — parce que cet éditeur l'écrit
 * autrement. Ces tests tiennent cette propriété.
 */
function page(numero: number, lignes: string[]): PageTexte {
  return { numero, lignes };
}

/* Un volet gaz minimal, avec deux rubriques sur les huit que le moteur sait
   nommer. Les intitulés sont ceux du corpus. */
const VOLET_GAZ: PageTexte[] = [
  page(1, [
    'ÉTAT DE L’INSTALLATION INTÉRIEURE DE GAZ',
    'D - Identification des appareils',
    'Chaudière murale, cuisine',
    'E - Anomalies identifiées',
    'A2 : robinet de commande non accessible'
  ])
];

describe('les endroits d’un rapport', () => {
  it('borne le volet et compte ses rubriques', () => {
    const vus = endroitsDe(VOLET_GAZ);
    const gaz = vus.volets.find((v) => v.type === 'gaz');
    expect(gaz, 'le volet gaz doit être reconnu').toBeDefined();
    expect(gaz!.rubriques.map((r) => r.repere)).toEqual(['D', 'E']);
    expect(gaz!.rubriques[1]!.titre).toMatch(/anomalies identifi/i);
  });

  /*
   * Le cœur de l'écran : sur huit rubriques connues du gaz, six manquent ici.
   * C'est ça qu'Aude doit voir — pas les deux qui sont là.
   */
  it('nomme les rubriques attendues qui manquent', () => {
    const gaz = endroitsDe(VOLET_GAZ).volets.find((v) => v.type === 'gaz')!;
    expect(gaz.attenduesManquantes).toContain('conclusion');
    expect(gaz.attenduesManquantes).toContain('constatations');
    /* Celles qui sont là ne doivent évidemment pas y figurer. */
    expect(gaz.attenduesManquantes).not.toContain('anomalies');
    expect(gaz.attenduesManquantes).not.toContain('appareils');
  });

  it('sait ce qu’il sait chercher, volet par volet', () => {
    expect(clesAttendues('gaz')).toContain('anomalies');
    /* Un volet sans intitulés décrits ne ment pas : il renvoie une liste vide
       plutôt que de laisser croire à une couverture. */
    expect(Array.isArray(clesAttendues('carrez'))).toBe(true);
  });
});

describe('la correction d’un endroit', () => {
  /*
   * La sortie de l'atelier n'est pas une impression : c'est la ligne exacte,
   * rattachée à son volet, sa clé et son éditeur. Il n'en faut pas plus pour
   * ajouter une forme et le test qui la tient.
   */
  it('recopie la ligne mot pour mot, avec son éditeur', () => {
    const texte = formulerCorrection({
      editeur: 'AnalysImmo',
      volet: 'gaz',
      cle: 'conclusion',
      ligne: '  H — Conclusion de l’état de l’installation  '
    });
    expect(texte).toContain('AnalysImmo');
    expect(texte).toContain('gaz');
    expect(texte).toContain('conclusion');
    expect(texte).toContain('H — Conclusion de l’état de l’installation');
  });

  it('dit franchement quand l’éditeur n’est pas nommé', () => {
    expect(formulerCorrection({ editeur: null, volet: 'gaz', cle: 'conclusion', ligne: 'H.' })).toContain(
      'éditeur inconnu'
    );
  });
});

describe('le rapport se lit en entier', () => {
  /*
   * Une page qu'aucun volet ne couvre doit rester VISIBLE et se dire orpheline.
   * C'est le cas le plus utile : ce qu'on ne voit pas ne se corrige pas, et une
   * page invisible sort du dossier sans bruit.
   */
  it('montre aussi les pages rattachées à aucun volet', () => {
    const vus = endroitsDe([
      page(1, ['ÉTAT DE L’INSTALLATION INTÉRIEURE DE GAZ', 'E - Anomalies identifiées']),
      page(2, ['Annexe photographique', 'Cliché n°1 — tableau électrique'])
    ]);
    expect(vus.pages.map((p) => p.numero)).toEqual([1, 2]);

    const orpheline = vus.pages.find((p) => p.volet === null);
    expect(orpheline, 'la page annexe ne doit pas disparaître').toBeDefined();
    expect(orpheline!.lignes.map((l) => l.texte)).toContain('Annexe photographique');
  });

  it('marque dans la page les lignes qui ouvrent une rubrique', () => {
    const vus = endroitsDe(VOLET_GAZ);
    const marquees = vus.pages.flatMap((p) => p.lignes).filter((l) => l.repere);
    expect(marquees.map((l) => l.repere)).toEqual(['D', 'E']);
  });
});
