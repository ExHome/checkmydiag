import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Diagnostic, Gravite, TypeDiag } from '../lib/modele';
import { compterLeDossier } from '../lib/bureau';
import {
  CHAMP,
  LINTEAU,
  abscisse,
  coupeDuDossier,
  enTeteDuBien,
  laDemande,
  lectureDuLinteau,
  montantsDe,
  partDuDossier,
  salutation,
  traveesDe
} from './accueil';

/** Un diagnostic réduit à ce dont l'accueil se sert. Rien d'autre n'est lu. */
function diag(type: TypeDiag, pages: [number, number], gravite: Gravite = 'bon'): Diagnostic {
  return {
    type,
    titre: `Titre ${type}`,
    verdict: `Verdict ${type}.`,
    gravite,
    faits: [],
    explication: [],
    aFaire: [],
    schema: null,
    pages
  };
}

const source = (nom: string): string =>
  readFileSync(fileURLToPath(new URL(nom, import.meta.url)), 'utf8');

/**
 * Le fichier sans ses commentaires.
 *
 * Un test de source qui lit les commentaires interdit d'EXPLIQUER pourquoi on
 * n'écrit pas quelque chose — c'est-à-dire exactement ce qu'il faut écrire pour
 * que la règle survive à la prochaine main.
 */
const sansCommentaires = (texte: string): string =>
  texte.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

describe('la coupe du dossier', () => {
  it('borne le champ exactement sur le dossier', () => {
    expect(abscisse(1, 40)).toBe(LINTEAU.gauche);
    expect(abscisse(41, 40)).toBeCloseTo(LINTEAU.droite, 10);
    /* Une page vaut la même largeur partout : c'est ce qui fait que la coupe
       est une mesure et non une illustration. */
    expect(abscisse(21, 40) - abscisse(20, 40)).toBeCloseTo(CHAMP / 40, 10);
  });

  it('ne sort jamais du champ, même sur une page absurde', () => {
    for (const p of [-5, 0, 1, 40, 41, 900]) {
      expect(abscisse(p, 40)).toBeGreaterThanOrEqual(LINTEAU.gauche);
      expect(abscisse(p, 40)).toBeLessThanOrEqual(LINTEAU.droite);
    }
  });

  it('PARTITIONNE le dossier : travées + montants = toutes les pages, une fois', () => {
    /* L'invariant qui rend le dessin honnête. Une page comptée deux fois, ou
       oubliée, et la coupe ne correspond plus au PDF qu'on tient. */
    const nbPages = 47;
    const travees = traveesDe(
      [diag('dpe', [4, 15]), diag('electricite', [16, 24]), diag('erp', [30, 33]), diag('carrez', [40, 41])],
      nbPages
    );
    const vues = new Set<number>();
    for (const t of [...travees, ...montantsDe(travees, nbPages)]) {
      for (let p = t.debut; p <= t.fin; p++) {
        expect(vues.has(p)).toBe(false);
        vues.add(p);
      }
    }
    expect(vues.size).toBe(nbPages);
  });

  it('tronque les chevauchements plutôt que de superposer deux travées', () => {
    const travees = traveesDe([diag('dpe', [1, 10]), diag('erp', [8, 14])], 20);
    expect(travees.map((t) => [t.debut, t.fin])).toEqual([
      [1, 10],
      [11, 14]
    ]);
  });

  it('laisse tomber du DESSIN une travée entièrement recouverte, sans la nier', () => {
    /* Elle n'a plus de place dans la coupe ; son carreau, lui, reste dans la
       grille avec son verdict. Le dessin se tait, il ne ment pas. */
    const travees = traveesDe([diag('dpe', [1, 12]), diag('erp', [3, 8])], 20);
    expect(travees).toHaveLength(1);
  });

  it('borne les pages au dossier réel', () => {
    const travees = traveesDe([diag('dpe', [0, 999])], 12);
    expect(travees[0]?.debut).toBe(1);
    expect(travees[0]?.fin).toBe(12);
  });

  it('espace le petit-bois pour qu’un DTG ne coûte pas trois cents tracés', () => {
    const court = coupeDuDossier(traveesDe([diag('dpe', [1, 40])], 40), 40);
    expect(court.pas).toBe(1);

    const long = coupeDuDossier(traveesDe([diag('dpe', [1, 300])], 300), 300);
    expect(long.pas).toBeGreaterThan(1);
    const filets = long.petitBois.split('M').length - 1;
    expect(filets).toBeLessThanOrEqual(LINTEAU.maxPetitBois);
  });

  it('dessine le dormant même quand le nombre de pages est inconnu', () => {
    const c = coupeDuDossier([], 0);
    expect(c.cadre).not.toBe('');
    expect(c.montants).toBe('');
    expect(c.petitBois).toBe('');
  });
});

describe('ce qui arrête la lumière', () => {
  const verdicts = new Map<TypeDiag, string>([
    ['dpe', 'Verdict dpe.'],
    ['electricite', 'Verdict electricite.'],
    ['erp', 'Verdict erp.']
  ]);

  it('n’occulte rien quand le rapport n’a rien relevé', () => {
    const travees = traveesDe([diag('dpe', [1, 10], 'bon')], 10);
    expect(lectureDuLinteau(travees, 10, verdicts).occlusions).toHaveLength(0);
  });

  it('assombrit ce qui est relevé, et met en raies ce qu’on n’a pas su lire', () => {
    const travees = traveesDe(
      [diag('dpe', [1, 10], 'alerte'), diag('electricite', [11, 18], 'neutre'), diag('erp', [19, 22], 'attention')],
      22
    );
    const { occlusions } = lectureDuLinteau(travees, 22, verdicts);
    expect(occlusions.map((o) => o.genre)).toEqual(['anomalie', 'nonControle', 'anomalie']);
  });

  it('ne montre JAMAIS un diagnostic non lu comme une zone saine', () => {
    const travees = traveesDe([diag('electricite', [1, 8], 'neutre')], 8);
    const { occlusions } = lectureDuLinteau(travees, 8, verdicts);
    expect(occlusions[0]?.genre).toBe('nonControle');
    /* « Je n'ai pas pu lire » n'est pas « il n'y a rien », et le libellé doit le
       dire en toutes lettres : la texture seule ne se lit pas à voix haute. */
    expect(occlusions[0]?.libelle).toMatch(/n’a pas su les lire/);
  });

  it('cite le verdict du rapport, jamais une phrase de l’interface', () => {
    const travees = traveesDe([diag('dpe', [1, 10], 'attention')], 10);
    const { occlusions } = lectureDuLinteau(travees, 10, verdicts);
    expect(occlusions[0]?.libelle).toContain('Verdict dpe.');
  });

  it('donne à chaque occlusion un libellé non vide', () => {
    const travees = traveesDe(
      [diag('dpe', [1, 5], 'alerte'), diag('erp', [6, 9], 'neutre')],
      9
    );
    for (const o of lectureDuLinteau(travees, 9, verdicts).occlusions) {
      expect(o.libelle.trim().length).toBeGreaterThan(0);
      expect(o.d).toMatch(/^M/);
    }
  });

  it('aligne la marque peinte sur la travée qu’elle double', () => {
    const travees = traveesDe([diag('dpe', [1, 10], 'alerte')], 20);
    const { marques } = lectureDuLinteau(travees, 20, verdicts);
    expect(marques[0]?.gauche).toBeCloseTo(abscisse(1, 20), 10);
    expect(marques[0]?.largeur).toBeCloseTo(abscisse(11, 20) - abscisse(1, 20), 10);
    expect(marques[0]?.genre).toBe('anomalie');
  });
});

describe('le grand chiffre', () => {
  const compte = (alerte: number, attention: number, bon = 0, neutre = 0) =>
    compterLeDossier([
      ...Array.from({ length: alerte }, () => diag('dpe', [1, 2], 'alerte')),
      ...Array.from({ length: attention }, () => diag('erp', [1, 2], 'attention')),
      ...Array.from({ length: bon }, () => diag('carrez', [1, 2], 'bon')),
      ...Array.from({ length: neutre }, () => diag('gaz', [1, 2], 'neutre'))
    ]);

  it('compte des carreaux, donc il se recompte à l’œil', () => {
    expect(laDemande(compte(1, 2, 3)).chiffre).toBe(3);
  });

  it('reste dans les valeurs observées sur le corpus : 0, 1, 2 ou 3', () => {
    /* Mesuré sur quatre-vingt-dix dossiers réels : 0 → 4 dossiers, 1 → 63,
       2 → 20, 3 → 3. Jamais sept, jamais douze. */
    for (const [a, v] of [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2]
    ] as const) {
      expect(laDemande(compte(a, v)).chiffre).toBeLessThanOrEqual(3);
    }
  });

  it('n’ajoute pas les diagnostics NON LUS à la demande', () => {
    /* La confusion que tout le produit combat : « je n'ai pas su lire » n'est
       ni « rien à signaler », ni une demande d'action. */
    expect(laDemande(compte(0, 0, 2, 3)).chiffre).toBe(0);
  });

  it('retire la lumière selon ce qui pèse le plus lourd', () => {
    expect(laDemande(compte(1, 1)).gravite).toBe('alerte');
    expect(laDemande(compte(0, 1)).gravite).toBe('attention');
    expect(laDemande(compte(0, 0, 0, 1)).gravite).toBe('neutre');
    expect(laDemande(compte(0, 0, 4)).gravite).toBe('bon');
  });

  it('n’écrit jamais que le rapport établit une absence', () => {
    const phrase = laDemande(compte(0, 0, 4)).phrase;
    expect(phrase).toBe('Aucun diagnostic de ce dossier ne signale d’anomalie.');
    expect(phrase).not.toMatch(/aucun (problème|risque|danger)/i);
    expect(phrase).not.toMatch(/\bRAS\b|tout va bien|rien à signaler/i);
  });

  it('accorde ses phrases', () => {
    expect(laDemande(compte(1, 0)).phrase).toBe(
      'Un diagnostic demande une action avant la signature.'
    );
    expect(laDemande(compte(0, 2)).phrase).toBe(
      '2 diagnostics méritent une question au vendeur.'
    );
    expect(laDemande(compte(1, 1)).phrase).toBe(
      '1 demande une action avant la signature, 1 mérite une question au vendeur.'
    );
  });
});

describe('l’identité du bien', () => {
  it('n’affiche JAMAIS `typeBien` — il vaut 0 sur 90 dossiers mesurés', () => {
    const enTete = enTeteDuBien(
      { adresse: '12 rue des Ormes', commune: 'Bordeaux', typeBien: 'Appartement', surface: 72 },
      'Dossier de diagnostic technique'
    );
    expect(enTete.titre).toBe('12 rue des Ormes');
    expect([enTete.titre, ...enTete.details].join(' ')).not.toContain('Appartement');
  });

  it('descend d’un cran plutôt que d’inventer', () => {
    expect(enTeteDuBien({ commune: 'Bordeaux' }, 'Dossier').titre).toBe('Bordeaux');
    expect(enTeteDuBien({}, 'Dossier de diagnostic technique').titre).toBe(
      'Dossier de diagnostic technique'
    );
  });

  it('ne répète pas la commune quand elle sert de titre', () => {
    expect(enTeteDuBien({ commune: 'Bordeaux' }, 'Dossier').details).not.toContain('Bordeaux');
  });

  it('laisse tomber en silence ce qui manque', () => {
    /* Surface absente sur 14 dossiers sur 90, année sur 13 : pas de tiret, pas
       de « non renseigné », pas de case vide. */
    expect(enTeteDuBien({ adresse: 'A', commune: 'B', lot: 'Lot 24' }, 'D').details).toEqual([
      'B',
      'Lot 24'
    ]);
  });
});

describe('le reste de la scène', () => {
  it('salue selon l’heure, comme la lumière', () => {
    expect(salutation(7)).toBe('Bonjour');
    expect(salutation(13.75)).toBe('Bonjour');
    expect(salutation(18)).toBe('Bonsoir');
    expect(salutation(23)).toBe('Bonsoir');
    expect(salutation(2)).toBe('Bonsoir');
  });

  it('mesure la part du dossier, sans la juger', () => {
    expect(partDuDossier(diag('dpe', [1, 10]), 20)).toBeCloseTo(0.5, 10);
    expect(partDuDossier(diag('dpe', [1, 10]), 0)).toBe(0);
  });
});

describe('la règle d’écriture du mécanisme de lumière', () => {
  /*
   * ON NE TRANSITIONNE JAMAIS UNE PROPRIÉTÉ QUI LIT UN JETON QUI CHANGE.
   *
   * Les jetons `--acc-sol`, `--acc-teinte` et `--acc-douce` sont reposés à
   * chaque rendu. Une propriété transitionnée qui les lit se fige sur sa valeur
   * de premier rendu, sans erreur ni avertissement : « le silence sur ce qui est
   * grave » ne sortirait jamais du TypeScript. La démonstration chiffrée est
   * dans `app.css`.
   */
  const svelte = source('Accueil.svelte');

  it('n’anime que des propriétés de composition', () => {
    const transitions = svelte.match(/transition:[^;}]+/g) ?? [];
    expect(transitions.length).toBeGreaterThan(0);
    for (const t of transitions) {
      expect(t).toMatch(/transition:\s*(none|opacity)\b/);
    }
  });

  it('ne lit aucun jeton mouvant dans une déclaration animée', () => {
    for (const t of svelte.match(/transition:[^;}]+/g) ?? []) {
      expect(t).not.toMatch(/--acc-/);
    }
  });

  it('ne lit jamais `typeBien`, dans aucun des deux fichiers', () => {
    expect(sansCommentaires(svelte)).not.toMatch(/typeBien/);
    expect(sansCommentaires(source('accueil.ts'))).not.toMatch(/typeBien/);
  });
});
