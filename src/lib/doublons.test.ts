/**
 * ANTI-DOUBLON — un composant qui sort de l'usage se retire, il ne s'oublie pas.
 *
 * *Ordre de mission du 22/08/2026 : `docs/ORDRE-ANTI-DOUBLON.md`. Posé par la
 * session architecte.*
 *
 * ## Le défaut que ce test attrape
 *
 * Dix sessions écrivent ce dépôt en parallèle, une par volet, et aucune ne voit
 * le travail des autres. Quand un écran en remplace un autre, le remplaçant est
 * livré — et l'ancien reste. Deux composants décrivent alors la même chose, et
 * rien ne dit lequel fait foi.
 *
 * Mesuré le 22/08 : `ChaineBarrieres.svelte` (397 lignes) et
 * `VisuelAmiante.svelte` (516 lignes), tous deux écrits le 20/08 pour remplacer
 * un schéma, tous deux abandonnés par la refonte des mini-apps, tous deux
 * toujours là. Ils ne sont dans aucun bundle : ils encombrent le dépôt et
 * peuvent être ressortis par erreur.
 *
 * ## Pourquoi une liste d'orphelins DÉCLARÉS plutôt qu'une interdiction
 *
 * Retirer un composant appartient au volet qui le tient, pas à ce test. Ce
 * qu'on interdit ici, c'est qu'un NOUVEL orphelin apparaisse sans que personne
 * ne le voie. La liste ne peut que rétrécir.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Tous les fichiers d'un dossier, en descendant. */
function fichiers(dossier: string, garder: (nom: string) => boolean): string[] {
  const trouves: string[] = [];
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) trouves.push(...fichiers(chemin, garder));
    else if (garder(nom)) trouves.push(chemin.replace(/\\/g, '/'));
  }
  return trouves;
}

/**
 * Les fichiers où un usage compte vraiment.
 *
 * ⚠️ Les `*.test.ts` en sont exclus, et ce n'est pas un détail : un test qui
 * NOMME un fichier suffirait à le faire passer pour utilisé.
 * `VisuelAmiante.svelte` a cessé d'apparaître orphelin le 22/08 à la seconde
 * où `homogeneite.test.ts` l'a inscrit dans sa liste de plafonds. Un garde-fou
 * qu'un autre garde-fou aveugle ne garde rien.
 */
function sourcesReelles(): string[] {
  return [
    ...fichiers('src', (n) => n.endsWith('.svelte') || (n.endsWith('.ts') && !n.endsWith('.test.ts'))),
    ...fichiers('.', (n) => n.endsWith('.html')).filter((f) => !f.includes('node_modules') && !f.includes('/dist/'))
  ];
}

/**
 * Les orphelins connus au 22/08/2026 — et à qui ils reviennent.
 *
 * Chacun attend une décision de son volet : le brancher, ou le retirer.
 */
const ORPHELINS_DECLARES: ReadonlyMap<string, string> = new Map([
  [
    'src/composants/visuels/ChaineBarrieres.svelte',
    'écrit le 20/08 pour remplacer le coffret électrique, laissé de côté par la mini-app électricité'
  ],
  [
    'src/composants/visuels/VisuelAmiante.svelte',
    'écrit le 20/08, remplacé par composants/amiante/Amiante.svelte'
  ],
  /*
   * Celui-ci n'était pas connu avant que ce test ne le nomme, et il est le plus
   * gros : 585 lignes d'écran d'arrivée, 32 couleurs en dur — le premier porteur
   * de dette visuelle du produit, pour un écran que personne n'atteint.
   *
   * Il a été débranché le 21/08 par « Le site passe en construction, et l'atelier
   * sort du bundle public ». Le site a rouvert le lendemain, sur décision d'Aude.
   * L'écran, lui, n'est jamais revenu.
   *
   * À trancher : le rebrancher, ou le retirer. Tant qu'il dort ici, sa dette
   * visuelle compte pour rien — la dette réelle du produit est 165, pas 197.
   */
  [
    'src/composants/Arrivee.svelte',
    'débranché le 21/08 quand le site est passé en page de chantier ; jamais rebranché après la réouverture'
  ]
]);

describe('aucun composant n’est abandonné en silence', () => {
  const sources = sourcesReelles();
  const contenus = new Map(sources.map((f) => [f, readFileSync(f, 'utf8')]));

  const composants = fichiers('src/composants', (n) => n.endsWith('.svelte'));

  const orphelins = composants.filter((chemin) => {
    const nom = chemin.split('/').pop()!.replace('.svelte', '');
    for (const [source, texte] of contenus) {
      if (source === chemin) continue;
      if (texte.includes(nom)) return false;
    }
    return true;
  });

  it('les orphelins sont exactement ceux qui sont déclarés', () => {
    const nouveaux = orphelins.filter((f) => !ORPHELINS_DECLARES.has(f));
    expect(
      nouveaux,
      nouveaux.length
        ? `\nCes composants ne sont plus importés par personne :\n  ${nouveaux.join('\n  ')}\n\n` +
          `Remplacer, c'est aussi supprimer : le retrait de l'ancien part dans le même lot\n` +
          `que le remplaçant. Si celui-ci doit rester en attente, inscris-le dans\n` +
          `ORPHELINS_DECLARES avec la raison. Voir docs/ORDRE-ANTI-DOUBLON.md.`
        : ''
    ).toEqual([]);
  });

  /*
   * La liste ne peut que rétrécir.
   *
   * Un orphelin qu'on rebranche ou qu'on supprime doit sortir de la liste dans
   * le même lot — sinon elle vieillit, et une liste qui ment ne garde rien.
   */
  it('aucun orphelin déclaré n’a été rebranché ou supprimé sans mise à jour', () => {
    const perimes: string[] = [];
    for (const [chemin, raison] of ORPHELINS_DECLARES) {
      if (!composants.includes(chemin)) {
        perimes.push(`${chemin} : supprimé — à retirer de la liste (${raison})`);
      } else if (!orphelins.includes(chemin)) {
        perimes.push(`${chemin} : de nouveau utilisé — à retirer de la liste (${raison})`);
      }
    }
    expect(perimes, `la liste des orphelins a vieilli :\n${perimes.join('\n')}`).toEqual([]);
  });
});
