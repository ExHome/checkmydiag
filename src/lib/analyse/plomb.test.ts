import { describe, expect, it } from 'vitest';
import { analyserPlomb } from './plomb';

/**
 * Les facteurs de dégradation du bâti — ils sont cinq, et la liste est fermée.
 *
 * Le constat ne classe pas que des revêtements : il « dresse un relevé sommaire
 * des facteurs de dégradation du bâti » (L. 1334-5 du code de la santé
 * publique). Quand ils apparaissent, l'auteur transmet immédiatement copie à
 * l'autorité sanitaire (L. 1334-10) — articles lus à la source le 15/08/2026.
 *
 * C'est la conséquence la plus lourde du constat, et elle ne dépend pas de la
 * classe : un logement peut être signalé sans qu'aucune unité ne soit classée 3.
 *
 * ## Ce que la lecture intégrale de NF X 46-030 a corrigé, le 20/08/2026
 *
 * Ces tests validaient une lecture par mots-clés — « humidité », « écaillage »,
 * « effondrement » — cherchés autour du titre de la rubrique. Le § 12 de la
 * norme montre qu'elle se trompait deux fois :
 *
 * 1. **Les deux premiers facteurs sont des SEUILS** — un local à 50 % de
 *    classe 3, l'ensemble à 20 % — et aucun mot-clé ne pouvait les trouver.
 * 2. **« Revêtements dégradés » n'est pas un facteur.** Écaillage, cloquage,
 *    faïençage, pulvérulence sont la définition de la **classe 3** au § 10 :
 *    l'état d'un revêtement, pas un désordre du bâti.
 *
 * La rubrique est un formulaire à cinq lignes et deux colonnes OUI/NON. On la
 * lit comme un formulaire, et les tests portent désormais là-dessus.
 */
const ENTETE = ['CONSTAT DE RISQUE D’EXPOSITION AU PLOMB', 'Rédigé par le cabinet le 12/03/2024'];

/** La rubrique telle que le modèle de l'annexe C de la norme la fait imprimer. */
const RUBRIQUE = (r: [string, string, string, string, string]) => [
  'Situations de dégradation du bâti mis en évidence :',
  `Au moins un local présente au moins 50 % d’unités de diagnostic de classe 3 ${r[0]}`,
  `L’ensemble des locaux présente au moins 20 % d’unités de diagnostic de classe 3 ${r[1]}`,
  `Plancher ou plafond menaçant de s’effondrer ou en tout ou partie effondré ${r[2]}`,
  `Traces importantes de coulure ou de ruissellement d’eau sur plusieurs unités ${r[3]}`,
  `Plusieurs unités d’un même local recouvertes de moisissures ou de tâches d’humidité ${r[4]}`,
  'Rappel du cadre réglementaire et des objectifs du CREP :'
];

describe('les facteurs de dégradation du bâti', () => {
  it('compte les facteurs cochés sur les cinq de la norme', () => {
    const d = analyserPlomb([...ENTETE, ...RUBRIQUE(['NON', 'NON', 'OUI', 'NON', 'OUI'])], [4, 9]);

    const fait = d.faits.find((f) => f.libelle === 'Facteurs de dégradation du bâti');
    expect(fait?.valeur).toBe('2 sur 5');
  });

  it('relève les deux seuils, que les mots-clés ne pouvaient pas voir', () => {
    const d = analyserPlomb([...ENTETE, ...RUBRIQUE(['OUI', 'OUI', 'NON', 'NON', 'NON'])], [4, 9]);

    const dit = d.faits.map((f) => `${f.libelle} ${f.valeur}`).join(' | ');
    expect(dit).toMatch(/moitié de ses surfaces/);
    expect(dit).toMatch(/cinquième de ses surfaces/);
  });

  it('ne prend pas un revêtement écaillé pour un désordre du bâti', () => {
    /*
     * L'écaillage définit la classe 3 (§ 10 de la norme). L'ancienne lecture en
     * faisait un « facteur de dégradation du bâti », et affichait donc un
     * facteur sur un constat dont la rubrique répond NON aux cinq — en
     * annonçant au passage un signalement qui n'a pas eu lieu.
     */
    const d = analyserPlomb(
      [
        ...ENTETE,
        'Nature de la dégradation : écaillage, cloquage et faïençage des peintures.',
        ...RUBRIQUE(['NON', 'NON', 'NON', 'NON', 'NON'])
      ],
      [4, 9]
    );

    expect(d.faits.find((f) => f.libelle === 'Facteurs de dégradation du bâti')).toBeUndefined();
    expect(JSON.stringify(d.faits)).not.toMatch(/Revêtements dégradés/);
  });

  /*
   * Le garde-fou principal. Le mot « humidité » traîne dans la notice
   * d'information annexée à tout constat : le relever là ferait signaler un
   * facteur de dégradation sur chaque rapport, et un logement partirait à
   * l'agence régionale de santé dans le texte du produit sans y être parti dans
   * la réalité.
   */
  it('ne confond pas la notice d’information avec le relevé', () => {
    const d = analyserPlomb(
      [
        ...ENTETE,
        'NOTICE D’INFORMATION',
        'L’humidité favorise la dégradation des peintures au plomb.',
        'Le saturnisme touche surtout les jeunes enfants.'
      ],
      [4, 9]
    );

    expect(d.faits.find((f) => f.libelle === 'Facteurs de dégradation du bâti')).toBeUndefined();
  });

  it('n’en relève aucun quand le constat répond NON aux cinq', () => {
    const d = analyserPlomb([...ENTETE, ...RUBRIQUE(['NON', 'NON', 'NON', 'NON', 'NON'])], [4, 9]);
    expect(d.faits.find((f) => f.libelle === 'Facteurs de dégradation du bâti')).toBeUndefined();
  });
});

describe('ce que la fiche plomb doit dire', () => {
  const d = analyserPlomb(ENTETE, [4, 9]);

  it('explique la transmission à l’agence régionale de santé', () => {
    expect(d.explication.join(' ')).toMatch(/agence régionale de santé/);
    expect(d.explication.join(' ')).toMatch(/informe le préfet/);
  });

  it('dit que la transmission ne dépend pas de la classe', () => {
    expect(d.explication.join(' ')).toMatch(/ne dépend pas de la classe/);
  });

  it('nomme les enfants de moins de six ans', () => {
    expect(d.explication.join(' ')).toMatch(/moins de six ans/);
  });
});

/**
 * La validité du CREP dépend du RÉSULTAT, pas de la dégradation.
 *
 * Le produit annonçait « sans limite de durée à la vente » dès qu'aucune unité
 * n'était classée 3 — or une seule unité de classe 1 suffit à rendre le constat
 * positif, et un constat positif périme au bout d'un an à la vente. Un vendeur
 * s'y fiant aurait présenté un constat caduc à la signature.
 */
describe('la durée de validité, selon le résultat', () => {
  const CREP = (c1: number, c2: number, c3: number) => [
    'Constat de risque d’exposition au plomb',
    'Total Non mesurées Classe 0 Classe 1 Classe 2 Classe 3',
    `12 2 ${12 - 2 - c1 - c2 - c3} ${c1} ${c2} ${c3}`
  ];

  it('dit « un an à la vente » pour une seule classe 1, en bon état', () => {
    const d = analyserPlomb(CREP(1, 0, 0), [1, 12]);
    expect(d.aFaire.join(' ')).toMatch(/valable qu’un an à la vente/);
    expect(d.aFaire.join(' ')).not.toMatch(/pas de limite de durée/);
  });

  it('ne promet « pas de limite de durée » que si rien n’a été détecté', () => {
    const d = analyserPlomb(CREP(0, 0, 0), [1, 12]);
    expect(d.aFaire.join(' ')).toMatch(/pas de limite de durée/);
  });

  it('garde l’obligation de travaux quand une classe 3 est présente', () => {
    const d = analyserPlomb(CREP(0, 0, 2), [1, 12]);
    expect(d.aFaire.join(' ')).toMatch(/L\.1334-9/);
    expect(d.aFaire.join(' ')).toMatch(/valable qu’un an à la vente/);
  });
});

describe('le vocabulaire des classes, celui de l’arrêté', () => {
  /*
   * L'arrêté du 19 août 2011 nomme trois états : non dégradé en classe 1, état
   * d'usage en classe 2, dégradé en classe 3. Le produit écrivait « en état
   * dégradé (classe 2) » — le mot de la classe 3. Ce n'est pas anodin : c'est
   * la dégradation qui déclenche l'obligation de travaux de l'article
   * L. 1334-9.
   */
  const CREP = (c1: number, c2: number, c3: number) => [
    'Constat de risque d’exposition au plomb',
    'Total Non mesurées Classe 0 Classe 1 Classe 2 Classe 3',
    `20 2 ${18 - c1 - c2 - c3} ${c1} ${c2} ${c3}`
  ];

  it('dit « état d’usage » pour une classe 2, jamais « dégradé »', () => {
    const d = analyserPlomb(CREP(0, 2, 0), [1, 12]);
    expect(d.verdict).toMatch(/état d’usage \(classe 2\)/);
    expect(d.verdict).not.toMatch(/dégradé/);
    expect(d.verdict).toMatch(/sans travaux obligatoires/);
  });

  it('réserve « dégradé » à la classe 3, avec ses travaux', () => {
    const d = analyserPlomb(CREP(0, 0, 3), [1, 12]);
    expect(d.verdict).toMatch(/dégradés \(classe 3\)/);
    expect(d.verdict).toMatch(/travaux sont obligatoires/);
  });

  it('nomme les faits comme la norme', () => {
    const d = analyserPlomb(CREP(1, 2, 3), [1, 12]);
    const libelles = d.faits.map((f) => f.libelle);
    expect(libelles).toContain('Dégradés');
    expect(libelles).toContain('En état d’usage');
  });
});
