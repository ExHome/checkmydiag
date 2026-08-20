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

describe('la chaîne des barrières', () => {
  it('ne connaît QUE les relevés, jamais les groupes', () => {
    /* La garantie est désormais structurelle : la chaîne se construit depuis
       `d.releves`, et `schema.groupes` n'entre plus nulle part dans l'écran.
       Le défaut est éliminé à la racine plutôt que gardé par une condition. */
    const i = ecran.indexOf('function barrieresDe(');
    expect(i).toBeGreaterThan(-1);
    /* Une fenêtre fixe : découper à la première accolade fermante indentée
       s'arrêtait à celle du premier `if`, bien avant la fin de la fonction. */
    const corps = ecran.slice(i, i + 1600);
    expect(corps).toMatch(/releves/);
    expect(corps).toMatch(/genre === 'anomalie'/);
    expect(corps).not.toMatch(/groupes/);
  });

  it('n’affiche plus le coffret à manettes', () => {
    /* Il tenait ses six manettes de `schema.groupes` : 15 logements sains sur
       33 en recevaient six, chacune légendée « 3 anomalies ». */
    expect(ecran).not.toMatch(/<TableauElectrique/);
  });

  it('ne devine pas une barrière quand le rattachement échoue', () => {
    /* `mecanismeDe` rend 'general' quand il ne sait pas : on saute, on
       n'accroche pas l'anomalie à une barrière au hasard. */
    const i = ecran.indexOf('function barrieresDe(');
    /* Une fenêtre fixe : découper à la première accolade fermante indentée
       s'arrêtait à celle du premier `if`, bien avant la fin de la fonction. */
    const corps = ecran.slice(i, i + 1600);
    expect(corps).toMatch(/=== 'general'/);
    expect(corps).toMatch(/continue/);
  });

  it('n’affirme rien quand la conclusion n’a pas été lue', () => {
    const i = ecran.indexOf('function barrieresDe(');
    /* Une fenêtre fixe : découper à la première accolade fermante indentée
       s'arrêtait à celle du premier `if`, bien avant la fin de la fonction. */
    const corps = ecran.slice(i, i + 1600);
    expect(corps).toMatch(/nonLue/);
    expect(corps).toMatch(/gravite === 'neutre'/);
  });

  it('signale les points non vérifiés, même quand la conclusion est bonne', () => {
    /* « Une information non trouvée n'est jamais transformée en information
       rassurante. » C'est la règle la plus facile à trahir sur un bon rapport. */
    expect(ecran).toMatch(/nonVerifiesDe/);
    expect(ecran).toMatch(/non-essaye/);
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
