/**
 * Les clips posés sur les schémas pointent-ils quelque part ?
 *
 * Un clip dont la notion n'existe pas ne s'affiche pas du tout : le trou serait
 * invisible à la relecture comme à l'écran. On lit donc les composants et on
 * vérifie chaque identifiant écrit en clair.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { notion } from './notions';

const RACINE = 'src/composants';

function fichiers(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return fichiers(chemin);
    return chemin.endsWith('.svelte') ? [chemin] : [];
  });
}

/** `<Clip id="saturnisme" />` et `<ClipDessin id="toiture" … />`. */
const POSE = /<Clip(?:Dessin)?\b[^>]*?\bid="([a-z0-9-]+)"/g;

describe('les clips des schémas', () => {
  const poses = fichiers(RACINE).flatMap((chemin) => {
    const source = readFileSync(chemin, 'utf8');
    return [...source.matchAll(POSE)].map((m) => ({ chemin, id: m[1] as string }));
  });

  it('en trouve sur les schémas', () => {
    // Garde-fou : si la regex cesse de correspondre, le test doit tomber ici et
    // non passer en vert sur une liste vide.
    expect(poses.length).toBeGreaterThan(10);
  });

  it('pointent tous vers une notion existante', () => {
    const orphelins = poses.filter((p) => !notion(p.id)).map((p) => `${p.chemin} → ${p.id}`);
    expect(orphelins).toEqual([]);
  });
});
