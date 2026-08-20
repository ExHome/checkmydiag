import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * ON NE DESSINE PAS D'ANOMALIES QUAND LE RAPPORT N'EN ANNONCE AUCUNE.
 *
 * `schema.groupes` n'est pas un compte d'anomalies : c'est un compte
 * d'OCCURRENCES D'UN MOT dans le volet électricité. Or les six domaines de
 * l'arrêté du 28 septembre 2017 sont imprimés dans TOUS les rapports, y compris
 * ceux qui ne relèvent rien.
 *
 * MESURE SUR 60 DOSSIERS DU CORPUS, avant correction :
 *
 *   33 volets électricité
 *   15 SANS aucune anomalie — et les 15 affichaient six groupes d'anomalies
 *   33 sur 33 avec un écart entre le total annoncé et la somme des groupes
 *
 * Un logement sain montrait donc six manettes orange, chacune légendée
 * « 3 anomalies », sous la phrase « le rapport ne relève aucune anomalie ».
 *
 * Après correction : 0 sur 15.
 *
 * C'est l'inverse exact de la règle « ne jamais transformer une information » —
 * et transformer une bonne nouvelle en mauvaise est le pire sens possible.
 */

const ecran = readFileSync(new URL('./Diagnostics.svelte', import.meta.url), 'utf8');
const glossaire = readFileSync(
  new URL('../lib/savoir/notions-electricite.ts', import.meta.url),
  'utf8'
);

describe('le coffret électrique', () => {
  it('refuse de dessiner des groupes sans anomalie annoncée', () => {
    const i = ecran.indexOf('function pointsDe(');
    expect(i).toBeGreaterThan(-1);
    const corps = ecran.slice(i, ecran.indexOf('\n  }', i));
    /* La garde doit précéder le `map` : sinon elle ne garde rien. */
    const garde = corps.indexOf('aDesAnomalies');
    const dessin = corps.indexOf('.groupes.map');
    expect(garde).toBeGreaterThan(-1);
    expect(garde).toBeLessThan(dessin);
  });

  it('s’appuie sur le total du rapport ET sur les relevés', () => {
    const i = ecran.indexOf('function pointsDe(');
    const corps = ecran.slice(i, ecran.indexOf('\n  }', i));
    expect(corps).toMatch(/total/);
    expect(corps).toMatch(/releves/);
    expect(corps).toMatch(/genre === 'anomalie'/);
  });
});

describe('le glossaire de la mise à la terre', () => {
  it('ne conclut plus à une anomalie depuis les groupes', () => {
    /* Il annonçait « Votre rapport relève une anomalie sur ce point » à des
       lecteurs dont le rapport ne relève rien. */
    const i = glossaire.indexOf('terre|liaison');
    expect(i).toBeGreaterThan(-1);
    const autour = glossaire.slice(Math.max(0, i - 700), i + 700);
    expect(autour).not.toMatch(/schema\.groupes\.find/);
  });

  it('s’appuie sur les relevés d’anomalie', () => {
    expect(glossaire).toMatch(/releves\s*\?\?\s*\[\]\)\.filter\(\(r\) => r\.genre === 'anomalie'\)/);
  });
});
