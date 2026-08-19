import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Le coefficient d'énergie primaire de l'électricité.
 *
 * L'arrêté du 13 août 2025 remplace 2,3 par 1,9 au 1ᵉʳ janvier 2026 : article
 * 2, « la valeur "2,3" est remplacée par la valeur "1,9" ». Lu au Journal
 * officiel le 15/08/2026.
 *
 * Le produit a affirmé ×2,3 pendant sept mois après l'entrée en vigueur, en
 * neuf endroits — dont les pages publiques et les cartes de partage. Ce n'était
 * pas un détail de vocabulaire : ce coefficient multiplie la consommation d'un
 * logement tout électrique avant qu'elle soit notée.
 *
 * Ce test parcourt les sources et échoue si l'ancienne valeur revient sans être
 * présentée comme un état passé. C'est un garde-fou de date : un chiffre juste
 * hier peut devenir faux sans que personne y touche.
 */
/** Le dossier `src`, quelle que soit la plateforme. */
const SRC = new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

function fichiers(dossier: string, sortie: string[] = []): string[] {
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) fichiers(chemin, sortie);
    else if (/\.(ts|svelte)$/.test(nom) && !nom.endsWith('.test.ts')) sortie.push(chemin);
  }
  return sortie;
}

/** Les tournures qui présentent 2,3 comme la valeur en vigueur. */
/*
 * Le coefficient s'écrit « 2,3 » et rien d'autre.
 *
 * Le motif attrapait aussi « à 2,36:1 » — un rapport de contraste WCAG écrit
 * dans le commentaire d'un visuel. Un faux positif de ce genre finit par
 * apprendre à contourner le test plutôt qu'à le respecter, ce qui est pire que
 * pas de test du tout. Le chiffre suivant est donc exclu.
 */
const AFFIRME_ANCIENNE_VALEUR = /(?:×|x |fois |vaut |par |de |à )2,3(?![\d])(?!\s*(?:avant|jusqu))/i;
/** Ce qui suffit à montrer qu'on parle du passé. */
const SITUE_DANS_LE_PASSE = /avant|jusqu|ancien|remplac|passe de/i;

describe('le coefficient d’énergie primaire de l’électricité', () => {
  const sources = fichiers(SRC);

  it('n’affirme nulle part la valeur 2,3 comme actuelle', () => {
    const fautifs: string[] = [];

    for (const chemin of sources) {
      for (const [n, ligne] of readFileSync(chemin, 'utf8').split('\n').entries()) {
        if (!AFFIRME_ANCIENNE_VALEUR.test(ligne)) continue;
        if (SITUE_DANS_LE_PASSE.test(ligne)) continue;
        fautifs.push(`${chemin.slice(SRC.length)}:${n + 1}`);
      }
    }

    expect(fautifs, `2,3 présenté comme la valeur en vigueur dans :\n${fautifs.join('\n')}`).toEqual(
      []
    );
  });

  it('inscrit la valeur en vigueur avec sa source', async () => {
    const { REGLEMENT } = await import('./textes');
    const regle = REGLEMENT.dpe?.regles?.find((r) => /1,9/.test(r.enonce));

    expect(regle, 'la règle du facteur 1,9 doit figurer au référentiel').toBeDefined();
    expect(regle?.source.reference).toMatch(/13 août 2025/);
    expect(regle?.source.url).toMatch(/legifrance/);
    expect(regle?.reserve).toMatch(/1ᵉʳ janvier 2026/);
  });
});
