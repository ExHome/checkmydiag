import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * LES GARDE-FOUS DE L'ÉCRAN TERMITES.
 *
 * Trois d'entre eux gardent une DÉCISION DE FIDÉLITÉ, et une décision de
 * fidélité qui n'est pas testée redevient une intention au premier remaniement.
 *
 *   1. On ne dessine pas le plan d'un logement dont on n'a pas la géométrie.
 *   2. L'intérieur du bois n'est jamais montré comme regardé.
 *   3. Les trois états ne reposent sur aucune couleur, et pas non plus sur la
 *      seule lumière transmise — mesurée entre 1,07:1 et 2,87:1, elle ne peut
 *      pas porter seule une information.
 */

const ecran = readFileSync(new URL('./Termites.svelte', import.meta.url), 'utf8');
const calque = readFileSync(new URL('../lumiere/calque.ts', import.meta.url), 'utf8');

describe('le plan qu’on ne dessine pas', () => {
  it('déclare que l’ordre affiché est celui du rapport, pas celui du logement', () => {
    /* Le modèle ne porte aucune géométrie de logement pour les termites : ni
       murs, ni surfaces, ni niveaux. Une enfilade est honnête, un plan
       d'appartement serait inventé. La phrase est donc à l'écran, jamais
       sous-entendue. */
    expect(ecran).toMatch(/dans l’ordre du rapport, pas dans l’ordre de votre logement/);
  });

  it('ne fabrique un segment que depuis `schema.zones`', () => {
    const i = ecran.indexOf('const segments = $derived(');
    expect(i).toBeGreaterThan(-1);
    const corps = ecran.slice(i, i + 700);
    expect(corps).toMatch(/zones/);
    /* Aucun nom de pièce en dur : les 65 zones mesurées sur le corpus portent
       toutes un vrai nom, et pas une seule n'est anonyme. */
    expect(corps).not.toMatch(/'(Cuisine|Chambre|Séjour|Salle de bain|Garage)'/);
  });
});

describe('l’intérieur du bois n’est jamais montré comme regardé', () => {
  it('emprunte la trame de `calque.ts` au lieu d’en réinventer une', () => {
    expect(ecran).toMatch(/import \{ LARGEUR_HACHURE, PAS_HACHURE \} from '\.\.\/lumiere\/calque'/);
    /* 1,5 clair sur un pas de 4 : la valeur porte un sens — « on n'a pas pu
       regarder » — et elle vit à un seul endroit. */
    expect(calque).toMatch(/PAS_HACHURE = 4/);
    expect(calque).toMatch(/LARGEUR_HACHURE = 1\.5/);
    expect(ecran).toMatch(/PAS_HACHURE - LARGEUR_HACHURE/);
  });

  it('trame le cœur sans jamais le conditionner à un verdict', () => {
    /* Le cœur est en raies parce que le repérage se fait SANS DÉMONTAGE — un
       fait de méthode, vrai pour tous les rapports. Le subordonner à `etat`
       ferait apparaître un intérieur sain là où personne n'a regardé. */
    const i = ecran.indexOf('clip-path="url(#{uid}-coeur-coupe)"');
    expect(i).toBeGreaterThan(-1);
    const avant = ecran.slice(Math.max(0, i - 400), i);
    expect(avant).not.toMatch(/\{#if [^}]*etat/);
    expect(ecran).toMatch(/sans\s*\n?\s*démontage|sans démontage/);
  });

  it('n’ouvre la face que là où le rapport a conclu', () => {
    /* `faceOuverte` ne doit pouvoir toucher que la coupe d'une zone dont
       l'état est lu ; une zone en alerte n'a pas de face qui s'ouvre. */
    expect(ecran).toMatch(/\{#if zoneOuverte\?\.etat === 'alerte'\}/);
  });
});

describe('les trois états, sans couleur et sur deux canaux', () => {
  it('porte la convention plein / doublé / tireté', () => {
    for (const classe of ['t--tirete', 't--double']) expect(ecran).toContain(classe);
    expect(ecran).toMatch(/stroke-dasharray/);
  });

  it('n’utilise aucun jeton de couleur d’état', () => {
    /* --alerte, --attention, --ok, --etq-* : tout le vocabulaire chromatique
       du reste de l'application est hors-jeu ici. Un état qui se lit à la
       couleur ne se lit plus en noir et blanc, ni pour un daltonien. */
    for (const jeton of ['--alerte', '--attention', '--ok', '--etq-', '--citron']) {
      expect(ecran).not.toContain(`var(${jeton}`);
    }
  });

  it('ne peint aucun pigment de bois', () => {
    /* La matière est une SILHOUETTE rétroéclairée, pas un aplat brun. La
       chaleur vient de la lampe — teintes mesurées 29,2° à 40,0°, exactement
       la famille des bois relevés sur la publicité (26,7° à 40,0°). */
    const hex = ecran.match(/#[0-9a-fA-F]{6}/g) ?? [];
    const bruns = hex.filter((h) => {
      const r = parseInt(h.slice(1, 3), 16);
      const g = parseInt(h.slice(3, 5), 16);
      const b = parseInt(h.slice(5, 7), 16);
      return r > g && g > b && r - b > 40;
    });
    expect(bruns).toEqual([]);
  });
});

describe('on ne transitionne jamais une propriété qui lit un jeton mouvant', () => {
  it('n’anime que des opacités', () => {
    /*
     * La règle d'`app.css` du 21/08, tenue ici par construction plutôt que par
     * relecture. On extrait la PROPRIÉTÉ animée de chaque déclaration
     * `transition:` — la durée et la courbe ont le droit de lire des jetons,
     * c'est la valeur animée qui n'en a pas le droit.
     */
    const declarations = [...ecran.matchAll(/transition:\s*([^;]+);/g)].map((m) => m[1] ?? '');
    expect(declarations.length).toBeGreaterThan(0);
    const proprietes = declarations
      .flatMap((d) => d.split(','))
      .map((p) => p.trim().split(/\s+/)[0] ?? '')
      .filter((p) => p && p !== 'none');
    expect([...new Set(proprietes)].sort()).toEqual(['opacity']);
  });

  it('n’anime aucune géométrie SVG ni aucun `transform`', () => {
    /* Le « zoom » est un changement de dessin, pas un mouvement de caméra :
       deux dessins composés chacun à sa bonne échelle. Rien à animer. */
    expect(ecran).not.toMatch(/transition:[^;]*\b(transform|x|y|width|height|d)\b\s*(var|\d)/);
  });
});

describe('le dossier pauvre', () => {
  it('remplace le grand chiffre par le verdict au lieu d’afficher un zéro', () => {
    expect(ecran).toMatch(/verdict-grand/);
    const i = ecran.indexOf('const chiffre = $derived(');
    expect(i).toBeGreaterThan(-1);
    /* `null` et non `0` : un zéro géant serait une note, pas un fait. */
    expect(ecran.slice(i, i + 220)).toMatch(/:\s*null/);
  });

  it('n’affiche la liste des zones que s’il y en a', () => {
    expect(ecran).toMatch(/\{#if zones\.length\}\s*\n\s*<section class="liste">/);
  });
});
