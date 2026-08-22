import { describe, it, expect } from 'vitest';
import { syntheseElectricite } from './electricite/synthese';
import { confianceDe, famillesDe } from './electricite/visuel';
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

/**
 * ── CE QUI A REMPLACÉ LA CHAÎNE DES BARRIÈRES, LE 22/08/2026 ────────────────
 *
 * La chaîne dessinait six barrières et n'y accrochait que les anomalies
 * qu'elle savait PLACER. Mesuré sur sept volets du corpus : le rapport
 * annonçait 16 anomalies, l'extraction en rendait 18, l'écran en montrait 7.
 * La mini-app du pack du 22/08 les rend toutes.
 *
 * **La leçon de la chaîne ne disparaît pas avec elle** : on ne construit
 * jamais un affichage d'anomalies depuis `schema.groupes`, qui compte des MOTS
 * et donnait six manettes orange à quinze logements sains. Les tests
 * ci-dessous la gardent, sur le nouvel écran.
 */
const synthese = readFileSync(
  new URL('./electricite/synthese.ts', import.meta.url),
  'utf8'
);
const miniApp = readFileSync(
  new URL('./electricite/MiniAppElectricite.svelte', import.meta.url),
  'utf8'
);

const volet = (anomalies: unknown[], extra: Record<string, unknown> = {}) =>
  ({
    type: 'electricite',
    titre: 'Installation électrique',
    verdict: 'L’installation intérieure d’électricité comporte une ou des anomalies.',
    gravite: 'attention',
    explication: [],
    aFaire: [],
    schema: { genre: 'anomalies', groupes: [{ nom: 'Salle d’eau', nombre: 3 }], total: 3 },
    faits: [],
    pages: [1, 8],
    anomalies,
    ...extra
  }) as never;

const uneAnomalie = (libelle: string, extra: Record<string, unknown> = {}) => ({
  code: null,
  domaine: null,
  libelle,
  localisations: [],
  pluralite: 'inconnue',
  mesureCompensatoire: null,
  geste: null,
  ...extra
});

describe('la mini-app électricité', () => {
  it('⚠️ ne connaît QUE les anomalies, jamais les groupes', () => {
    /* `schema.groupes` compte des occurrences d'un mot. Il n'entre ni dans la
       synthèse, ni dans l'écran — la garantie est structurelle, pas gardée
       par une condition qu'on peut retirer. */
    expect(synthese).not.toMatch(/groupes/);
    expect(miniApp).not.toMatch(/schema\.groupes/);
  });

  it('⚠️ affiche toutes les anomalies, même celle qu’aucun domaine n’accueille', () => {
    const s = syntheseElectricite(
      volet([
        uneAnomalie('Au moins un socle de prise de courant comporte une broche de terre non reliée à la terre.'),
        uneAnomalie('Observation qui ne relève d’aucune des six familles de l’arrêté')
      ])
    );
    expect(s.anomalies).toHaveLength(2);
    /* Celle qu'on ne sait pas ranger n'est pas jetée : elle est mise à part… */
    expect(s.horsDomaine).toHaveLength(1);
    /* …et elle ressort bien dans les familles que l'écran dessine — rangée
       dans « à améliorer », la moins engageante : on ne présume jamais de la
       gravité de ce qu'on n'a pas su rattacher, et surtout pas à la hausse. */
    const familles = famillesDe(s);
    const rendues = familles.reduce((n, f) => n + f.anomalies.length, 0);
    expect(rendues).toBe(2);
    expect(familles.find((f) => f.cle === 'amelioration')?.anomalies).toHaveLength(1);
  });

  it('⚠️ n’affirme rien quand la conclusion n’a pas pu être lue', () => {
    const s = syntheseElectricite(
      volet([], {
        gravite: 'neutre',
        verdict: 'La conclusion est cochée à la main : un programme ne peut pas la lire.'
      })
    );
    expect(s.issue).toBe('nonLu');
    /* Aucun domaine ne ressort « sans anomalie » : on ne sait pas. */
    expect(s.domaines.every((d) => d.etat === 'inconnu')).toBe(true);
  });

  it('signale les points non vérifiés, même quand la conclusion est bonne', () => {
    /* « Une information non trouvée n'est jamais transformée en information
       rassurante. » C'est la règle la plus facile à trahir sur un bon rapport. */
    const s = syntheseElectricite(
      volet([], {
        gravite: 'bon',
        verdict: 'L’installation intérieure d’électricité ne comporte aucune anomalie.',
        faits: [
          {
            libelle: 'Points non vérifiés',
            valeur: '2',
            precision: 'Installation non alimentée le jour de la visite'
          }
        ]
      })
    );
    expect(s.limites.entrees.some((l) => /2 points/.test(l.quoi))).toBe(true);
    expect(s.limites.entrees.some((l) => /non alimentée/i.test(l.pourquoi ?? ''))).toBe(true);
  });

  it('n’affiche plus le coffret à manettes', () => {
    expect(ecran).not.toMatch(/<TableauElectrique/);
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

describe('⚠️ le grand chiffre du résultat détaillé', () => {
  it('ne montre pas « 0 » quand la conclusion n’a pas pu être lue', () => {
    /* « 0 anomalies » sur un rapport illisible est une bonne nouvelle inventée
       — le pire sens dans lequel une information se transforme. L'écran met un
       tiret à la place, et le mot dit pourquoi. */
    expect(miniApp).toMatch(/s\.issue === 'nonLu' \? '—'/);
    expect(miniApp).toMatch(/'conclusion'/);
    expect(miniApp).toMatch(/'non lue'/);
  });

  it('⚠️ n’affiche aucun pourcentage de confiance sur une conclusion non lue', () => {
    const c = confianceDe(
      syntheseElectricite(
        volet([], {
          gravite: 'neutre',
          verdict: 'La conclusion est cochée à la main : un programme ne peut pas la lire.'
        })
      )
    );
    expect(c.part).toBeNull();
  });
});
