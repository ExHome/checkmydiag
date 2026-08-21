/**
 * L'ORDRE DES PLANS, ET LES SORTIES QUI NE DOIVENT PLUS DISPARAÎTRE.
 *
 * Deux familles de défauts ont produit le même symptôme — « je n'arrive plus
 * à sortir d'une page » — et aucune n'était visible dans le code d'un seul
 * fichier :
 *
 *   · des `z-index` posés à la main dans huit fichiers qui ne se
 *     connaissaient pas. Le schéma en pleine page s'ouvrait à 40 sous un
 *     lecteur à 45, le panneau du savoir à 40/41 sous des écrans à 45 et 50.
 *     On appuyait, rien ne bougeait ;
 *
 *   · trois barres de sortie sans compensation d'encoche. Application
 *     installée sur un iPhone, le bouton « ← Retour » vit entre y = 8 et
 *     y = 52, quand l'encoche descend à 47 — et à 59 avec l'îlot dynamique.
 *     Le seul bouton de sortie passait dessous, sans flèche de navigateur ni
 *     clavier pour le remplacer.
 *
 * Ces tests lisent les sources. Ils ne prouvent pas qu'un écran est joli :
 * ils prouvent qu'on peut en sortir.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const CSS = readFileSync('src/app.css', 'utf8');

/** Les composants qui peuvent couvrir la vue, et leur barre de sortie. */
const ECRANS = [
  { nom: 'l’écran d’un diagnostic', fichier: 'src/composants/Diagnostics.svelte' },
  { nom: 'la vue plein écran du dossier', fichier: 'src/composants/Lecteur.svelte' },
  { nom: 'le lexique', fichier: 'src/composants/Dicodiag.svelte' },
];

describe('l’ordre des plans vit dans la charte', () => {
  it('les six jetons de plan sont définis', () => {
    for (const jeton of [
      '--plan-fond',
      '--plan-colle',
      '--plan-vue',
      '--plan-appli',
      '--plan-pleine-page',
      '--plan-savoir'
    ]) {
      expect(CSS, jeton + ' a disparu de la charte').toContain(jeton + ':');
    }
  });

  /**
   * L'ordre est le fond de l'affaire : un écran couvre la vue, une pleine page
   * couvre l'écran, et le savoir — qui s'ouvre depuis n'importe où — couvre
   * tout le reste.
   */
  it('les plans se suivent dans le bon ordre', () => {
    /* Lu par decoupage plutot que par expression reguliere construite a la
       volee : le jeton commence par deux tirets, qui n'ont rien a faire dans
       un motif assemble par concatenation. */
    const valeur = (jeton: string): number => {
      const debut = CSS.indexOf(jeton + ':');
      expect(debut, jeton + ' est absent de la charte').toBeGreaterThan(-1);
      const fin = CSS.indexOf(';', debut);
      const brut = CSS.slice(debut + jeton.length + 1, fin).trim();
      const nombre = Number(brut);
      expect(Number.isFinite(nombre), jeton + ' ne vaut pas un nombre : ' + brut).toBe(true);
      return nombre;
    };
    expect(valeur('--plan-colle')).toBeLessThan(valeur('--plan-vue'));
    expect(valeur('--plan-vue'), 'un écran d’appli s’ouvre PAR-DESSUS la vue').toBeLessThan(
      valeur('--plan-appli')
    );
    expect(
      valeur('--plan-appli'),
      'le schéma agrandi doit couvrir l’écran d’où il sort — c’est le défaut qui l’a rendu invisible'
    ).toBeLessThan(valeur('--plan-pleine-page'));
    expect(
      valeur('--plan-pleine-page'),
      'le savoir s’ouvre depuis n’importe quel écran, donc au-dessus de tous'
    ).toBeLessThan(valeur('--plan-savoir'));
  });

  /**
   * La règle qui empêche le défaut de revenir : un `z-index` écrit en dur dans
   * un composant est un plan qui ignore les autres.
   */
  it('les couches qui se superposent passent par les jetons', () => {
    const fichiers = [
      'src/composants/Diagnostics.svelte',
      'src/composants/Lecteur.svelte',
      'src/composants/Dicodiag.svelte',
      'src/composants/savoir/PanneauSavoir.svelte'
    ];
    for (const f of fichiers) {
      const source = readFileSync(f, 'utf8');
      const enDur = [...source.matchAll(/z-index:\s*(\d+)/g)]
        .map((m) => Number(m[1]))
        .filter((n) => n >= 10);
      expect(
        enDur,
        f + ' pose un plan en dur : il ne peut pas savoir ce qui se trouve au-dessus de lui'
      ).toEqual([]);
    }
  });
});

describe('les barres de sortie survivent à l’encoche', () => {
  it.each(ECRANS)('$nom compense la barre d’état', ({ fichier }) => {
    const source = readFileSync(fichier, 'utf8');
    expect(
      source,
      'sans cela, le bouton « Retour » passe sous l’encoche d’un iPhone où l’application est installée'
    ).toMatch(/padding:\s*max\(var\(--e2\),\s*env\(safe-area-inset-top, 0px\)\)/);
  });
});

describe('le lexique a plus d’une sortie', () => {
  const DICO = readFileSync('src/composants/Dicodiag.svelte', 'utf8');

  it('la touche Échap le referme', () => {
    expect(DICO).toMatch(/svelte:window/);
    expect(DICO).toMatch(/Escape/);
  });

  it('le geste de retour du téléphone le referme', () => {
    expect(DICO).toMatch(/import \{ ouvrirCouche \}/);
    expect(DICO).toMatch(/ouvrirCouche\(/);
  });

  /**
   * Un écran qui se déclare `aria-modal` promet à un lecteur d'écran qu'il
   * peut en sortir. Tant qu'il n'avait qu'un bouton, la promesse était fausse.
   */
  it('sa promesse de dialogue est tenue', () => {
    expect(DICO).toMatch(/aria-modal="true"/);
    expect(DICO).toMatch(/onclick=\{fermer\}/);
  });
});
