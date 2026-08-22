import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * LA RÈGLE QUE CE FICHIER EMPÊCHE D'OUBLIER.
 *
 *   ON NE TRANSITIONNE JAMAIS UNE PROPRIÉTÉ QUI LIT UN JETON QUI CHANGE.
 *
 * ── Le défaut qui a rendu ce test nécessaire ────────────────────────────────
 *
 * Mesuré au banc le 21/08/2026, sur les quatre gravités. La couche qui calcule
 * était juste, ses tests étaient verts, et l'écran n'en montrait rien :
 *
 *   --tl-sol          calculé  #0a2b23 → #092820 → #08231c → #061b15
 *   fond réellement peint      #092820 → #092820 → #092820 → #092820
 *
 *   --tl-encre-douce  calculé   0,720  →  0,747  →  0,783  →  0,850
 *   alpha réellement peint      0,745  →  0,745  →  0,745  →  0,745
 *
 * `background: var(--tl-sol)` DOUBLÉ d'un `transition: background …` fige la
 * couleur sur sa valeur de premier rendu : une propriété personnalisée non
 * déclarée n'a pas de type, donc elle n'est pas animable, et un changement du
 * seul jeton ne redéclenche pas la transition. Aucune erreur, aucun
 * avertissement de console — juste « le silence sur ce qui est grave » qui ne
 * sortait jamais du fichier TypeScript.
 *
 * Conséquence visible : le plateau SVG s'assombrissait (son `fill` n'était pas
 * transitionné, lui) pendant que la bande de légende juste en dessous restait
 * à sa couleur d'origine. Deux surfaces contiguës, une couture.
 *
 * ── Pourquoi un test de SOURCE et pas un test de rendu ──────────────────────
 *
 * Le défaut ne vit ni dans le calcul ni dans le DOM : il vit dans le
 * compositeur, et il ne se voit qu'en lisant le pixel peint dans un vrai
 * navigateur. Vitest ne compose pas. Ce qu'on peut tenir ici, en revanche,
 * c'est la RÈGLE D'ÉCRITURE qui l'évite — et c'est elle qu'on regarde, dans le
 * texte des composants.
 *
 * Un commentaire ne tient rien : la prochaine main qui voudra « adoucir le
 * passage » rajoutera `background` dans la liste et personne ne le verra.
 */

const lire = (nom: string): string =>
  readFileSync(fileURLToPath(new URL(nom, import.meta.url)), 'utf8');

/**
 * Les jetons que le mécanisme repose à chaque rendu, depuis `gravite.ts` et
 * `heure.ts`. Ce sont eux qui bougent — donc eux qui gèlent ce qui les lit.
 */
const JETONS_MOUVANTS = [
  '--tl-sol',
  '--tl-encre-douce',
  '--tl-ombre-x',
  '--tl-ombre-y',
  '--carreau-sol',
  '--carreau-teinte',
  '--carreau-ombre-x',
  '--carreau-ombre-y'
];

/**
 * LA RÈGLE PORTE SUR LES DÉCLARATIONS AU REPOS, ET SEULEMENT SUR ELLES.
 *
 * C'est la nuance qui rend ce test juste plutôt que simplement sévère. Une
 * valeur posée dans une règle d'ÉTAT — `:hover`, `:focus-visible`, `:active` —
 * n'est pas concernée : le changement de sélecteur redéclenche la transition,
 * qui repart de zéro et relit le jeton à sa valeur courante. C'est ainsi que
 * la tranche du carreau s'allume encore en fondu tout en lisant l'heure.
 *
 * Le piège est la valeur AU REPOS, celle que rien ne vient rejouer : elle ne
 * change que par son jeton, et c'est précisément ce cas que le compositeur
 * ignore.
 */
const ETATS = /:(hover|focus|focus-visible|active|target|checked)/;

interface Regle {
  selecteur: string;
  corps: string;
  /** Vrai quand la règle décrit un état — donc quand un sélecteur la rejoue. */
  etat: boolean;
}

/** Les règles CSS d'un fichier, en paire sélecteur / corps. */
function regles(source: string): Regle[] {
  const style = source.slice(source.indexOf('<style'));
  return [...style.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => {
    const selecteur = (m[1] ?? '').trim();
    return { selecteur, corps: m[2] ?? '', etat: ETATS.test(selecteur) };
  });
}

/** Le contenu de chaque déclaration `transition: …` d'un fichier. */
function listesDeTransition(source: string): string[] {
  return [...source.matchAll(/transition:\s*([^;}]+)[;}]/g)].map((m) => m[1] ?? '');
}

/**
 * Les propriétés qu'une liste de transition nomme.
 *
 * Une entrée s'écrit « propriété durée courbe » : le premier mot est la
 * propriété. On sépare sur les virgules de PREMIER NIVEAU — celles qui sont à
 * l'intérieur d'un `var(…)` ou d'un `cubic-bezier(…)` ne séparent rien.
 */
function proprietesTransitionnees(liste: string): string[] {
  const entrees: string[] = [];
  let profondeur = 0;
  let courant = '';
  for (const c of liste) {
    if (c === '(') profondeur++;
    else if (c === ')') profondeur--;
    if (c === ',' && profondeur === 0) {
      entrees.push(courant);
      courant = '';
    } else courant += c;
  }
  entrees.push(courant);
  return entrees.map((e) => e.trim().split(/\s+/)[0] ?? '').filter(Boolean);
}

/**
 * L'ÉLÉMENT que vise une règle, pseudo-classes retirées.
 *
 * `.carreau:hover .carreau__substrat` vise `.carreau__substrat`, pas
 * `.carreau`. Sans cette distinction, le test confondrait deux couches
 * voisines : la vitre, dont l'ombre au repos lit l'heure, et le substrat, dont
 * la tranche au repos vaut `none` et peut donc s'animer sans risque. C'est
 * exactement la séparation sur laquelle repose l'allumage du carreau.
 */
function cible(selecteur: string): string {
  const dernier = selecteur.trim().split(/\s+/).pop() ?? '';
  return dernier.replace(/:[a-z-]+(\([^)]*\))?/g, '');
}

/**
 * Par élément, les propriétés qui lisent un jeton mouvant AU REPOS.
 *
 * On ne devine pas : on lit les déclarations telles qu'elles sont écrites.
 * `background: color-mix(in srgb, var(--carreau-sol) 82%, transparent)` compte
 * autant que `background: var(--tl-sol)`.
 */
function gelablesParElement(regles: Regle[]): Map<string, Set<string>> {
  const parElement = new Map<string, Set<string>>();
  for (const r of regles) {
    if (r.etat) continue;
    const cle = cible(r.selecteur);
    for (const m of r.corps.matchAll(/(^|[;\s])([a-z-]+):\s*([^;]+)/g)) {
      const propriete = m[2] ?? '';
      const valeur = m[3] ?? '';
      if (propriete === 'transition') continue;
      if (!JETONS_MOUVANTS.some((j) => valeur.includes(`var(${j})`))) continue;
      const set = parElement.get(cle) ?? new Set<string>();
      set.add(propriete);
      parElement.set(cle, set);
    }
  }
  return parElement;
}

const COMPOSANTS = ['TableLumineuse.svelte', 'Carreau.svelte'];

describe('on ne transitionne jamais une propriété qui lit un jeton mouvant', () => {
  for (const nom of COMPOSANTS) {
    it(`${nom} n’en transitionne aucune`, () => {
      const source = lire(`./${nom}`);
      const lues = regles(source);
      const gelables = gelablesParElement(lues);
      /* Garde-fou du garde-fou : si ces composants cessaient de lire les
         jetons au repos, le test passerait pour de mauvaises raisons. */
      expect(gelables.size, `${nom} ne lit plus aucun jeton mouvant au repos`).toBeGreaterThan(0);

      const fautes: string[] = [];
      for (const r of lues) {
        const liste = r.corps.match(/transition:\s*([^;]+)/)?.[1];
        if (!liste) continue;
        const risquees = gelables.get(cible(r.selecteur)) ?? new Set<string>();
        for (const p of proprietesTransitionnees(liste)) {
          if (risquees.has(p)) {
            fautes.push(`${r.selecteur} → ${p} lit un jeton mouvant au repos, il se figera`);
          }
          /* Transitionner le JETON lui-même ne sauve rien : essayé et mesuré,
             avec `@property` et `transition: --tl-sol …` le jeton se fige à son
             tour sur sa valeur de premier rendu. */
          if (JETONS_MOUVANTS.includes(p)) fautes.push(`${r.selecteur} → ${p} ne s’anime pas`);
        }
      }
      expect(fautes).toEqual([]);
    });
  }

  /**
   * LE TEST DU TEST.
   *
   * Un garde-fou qu'on n'a jamais vu se déclencher n'est pas un garde-fou :
   * c'est une décoration verte. On lui repasse donc le défaut exact du
   * 21/08/2026, en miniature, et on vérifie qu'il crie — puis la version
   * corrigée, et on vérifie qu'il se tait.
   */
  it('se déclenche bien sur le défaut d’origine, et se tait sur sa correction', () => {
    const analyser = (style: string): string[] => {
      const lues = regles(`<style>${style}</style>`);
      const gelables = gelablesParElement(lues);
      const fautes: string[] = [];
      for (const r of lues) {
        const liste = r.corps.match(/transition:\s*([^;]+)/)?.[1];
        if (!liste) continue;
        const risquees = gelables.get(cible(r.selecteur)) ?? new Set<string>();
        for (const p of proprietesTransitionnees(liste)) if (risquees.has(p)) fautes.push(p);
      }
      return fautes;
    };

    /* Le défaut : le fond lit le jeton au repos ET se transitionne. */
    expect(
      analyser('.t { background: var(--tl-sol); transition: background 300ms ease; }')
    ).toEqual(['background']);

    /* L'ombre qui suivait l'heure, même faute. */
    expect(
      analyser(
        '.t { box-shadow: 0 calc(var(--tl-ombre-y) * 3px) 8px #000; transition: box-shadow 300ms ease; }'
      )
    ).toEqual(['box-shadow']);

    /* La correction : le jeton reste lu, la transition s'en va. */
    expect(analyser('.t { background: var(--tl-sol); }')).toEqual([]);

    /* Le cas LÉGITIME qu'il ne faut surtout pas interdire : au repos la valeur
       ne lit aucun jeton, c'est l'état sous le doigt qui l'allume. C'est la
       tranche du carreau, et elle doit continuer de s'animer. */
    expect(
      analyser(
        '.s { box-shadow: none; transition: box-shadow 300ms ease; }' +
          '.c:hover .s { box-shadow: inset 0 -20px 30px -20px var(--carreau-teinte); }'
      )
    ).toEqual([]);
  });

  it('la gravité change bien ces jetons — sinon il n’y aurait rien à protéger', () => {
    const gravite = lire('./gravite.ts');
    expect(gravite).toMatch(/sol:\s*melange\(SOL_CLAIR, SOL_GRAVE, r\)/);
    expect(gravite).toMatch(/encreDouce:/);
  });

  it('ce qui RESTE transitionné ne lit aucun jeton mouvant', () => {
    /*
     * Le mouvement n'est pas supprimé, il est déplacé sur des propriétés
     * ordinaires : l'ombre portée qui suit l'heure, le fond derrière la vitre,
     * l'opacité du substrat. C'est ce qui fait que le carreau s'allume encore
     * sous le doigt.
     */
    const carreau = lire('./Carreau.svelte');
    const toutes = listesDeTransition(carreau).flatMap(proprietesTransitionnees);
    expect(toutes).toContain('box-shadow');
    expect(toutes).toContain('backdrop-filter');
    expect(toutes).toContain('opacity');
  });
});
