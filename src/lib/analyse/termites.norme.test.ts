import { describe, expect, it } from 'vitest';
import { analyserTermites } from './reperages';

/**
 * Ce que NF P 03-201 impose au diagnostic, et que le lecteur ne trouve pas.
 *
 * La norme termites (février 2016) a été lue en entier le 20/08/2026. Trois de
 * ses règles changent la façon de lire un état termites, et aucune n'était dite.
 *
 * **Les dix mètres** (§ 4.2.2 et annexe B.1) — l'opérateur doit inspecter le
 * périmètre externe sur dix mètres autour du bâtiment, dans la limite de la
 * propriété. Le § C.2.1 explique pourquoi : les termites souterrains partent des
 * assises, caves et vides sanitaires, puis montent.
 *
 * **La résistance mécanique** (§ 5 k) — le rapport doit porter la mention que
 * l'intervention n'avait pas pour but de la diagnostiquer. Mesuré : 19 états
 * termites sur 92 la portent.
 *
 * **Ni prescriptions ni offres de service** (§ 3.1) — le rapport ne peut pas
 * recommander de traitement, et une entreprise de traitement ne peut pas faire
 * ce diagnostic. Le silence du rapport sur les travaux est la règle.
 *
 * Ces trois points sont énoncés comme des règles du diagnostic, jamais comme un
 * manque du rapport qu'on lit : Verrière explique le diagnostic, elle ne juge
 * pas celui qui l'a fait.
 */
const ETAT = [
  'ÉTAT DU BÂTIMENT RELATIF À LA PRÉSENCE DE TERMITES',
  'Le bien est situé dans une zone soumise à un arrêté préfectoral.',
  'Il n’a pas été repéré d’indice d’infestation de termites.',
  'Fait à Bordeaux, le 12/03/2024'
];

describe('ce que la norme termites impose, et que la fiche doit dire', () => {
  const d = analyserTermites(ETAT, [4, 11]);
  const dit = d.explication.join(' ');

  it('dit que la recherche va jusqu’à dix mètres autour du bâtiment', () => {
    expect(dit).toMatch(/dix mètres/);
    expect(dit).toMatch(/limite de la propriété/);
  });

  it('explique pourquoi : les termites montent du sol', () => {
    expect(dit).toMatch(/caves|vides sanitaires|assises/);
  });

  it('prévient que la résistance mécanique n’est pas jugée', () => {
    expect(dit).toMatch(/résistance mécanique/);
    expect(dit).toMatch(/poutre/);
  });

  it('explique pourquoi le rapport ne recommande aucun traitement', () => {
    expect(dit).toMatch(/ni prescriptions|prescriptions ou des offres/);
    expect(dit).toMatch(/devis déguisé/);
  });

  it('ne met pas le diagnostiqueur en cause', () => {
    /*
     * « Verrière explique le diagnostic, elle ne juge pas le diagnostiqueur. »
     * Ces trois règles sont vraies pour tout état termites : les énoncer ne doit
     * jamais se lire comme un reproche adressé à celui qui a signé le rapport.
     */
    expect(dit).not.toMatch(
      /manque au rapport|absente du rapport|le rapport aurait dû|omission|manquement|non conforme/i
    );
  });

  it('dit qui doit déclarer en mairie, et ce n’est pas le propriétaire', () => {
    /*
     * Article L. 126-4 du CCH, lu à la source le 20/08/2026 : la déclaration
     * incombe à l'OCCUPANT ; au propriétaire seulement à défaut d'occupant ; au
     * syndicat pour les parties communes. Le produit disait « Déclarez » en
     * s'adressant au propriétaire — dans un logement loué, c'est le locataire.
     *
     * Le délai et la forme sont à l'article R. 126-2 : un mois, lettre
     * recommandée avec accusé de réception ou dépôt contre récépissé.
     *
     * NF P 03-201, de 2016, renvoie encore aux anciens L. 133-4 et R. 133-3 :
     * le code a été recodifié au 1er juillet 2021.
     */
    const infeste = analyserTermites(
      [
        'ÉTAT DU BÂTIMENT RELATIF À LA PRÉSENCE DE TERMITES',
        'Il a été repéré des indices d’infestation de termites.',
        'Fait à Bordeaux, le 12/03/2024'
      ],
      [4, 11]
    );
    const aFaire = infeste.aFaire.join(' ');
    expect(aFaire).toMatch(/occupant/);
    expect(aFaire).toMatch(/locataire/);
    expect(aFaire).toMatch(/syndicat/);
    expect(aFaire).toMatch(/dans le mois/);
    expect(aFaire).toMatch(/recommandée|récépissé/);
  });

  it('les dit aussi quand aucun termite n’a été trouvé', () => {
    /*
     * Ce sont des règles du diagnostic, pas des conséquences d'une infestation.
     * Un état négatif les mérite autant : c'est là que le lecteur risque le plus
     * de croire que tout a été regardé.
     */
    expect(d.gravite).not.toBe('alerte');
    expect(dit).toMatch(/dix mètres/);
  });
});
