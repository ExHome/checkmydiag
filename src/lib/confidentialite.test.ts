import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

/**
 * Aucun morceau de corpus ne doit être versionné.
 *
 * Ce dépôt est public — GitHub Pages l'exige — et les rapports lus portent le
 * nom et l'adresse de vraies personnes. Les PDF étaient déjà exclus ; leur
 * TRANSCRIPTION ne l'était pas, alors qu'elle contient exactement les mêmes
 * données, en clair et cherchables.
 *
 * Le script de lecture écrit sa sortie dans un fichier dont le nom par défaut
 * tombait dans le dépôt. Cinquante et une pages de rapport s'y sont retrouvées
 * une nuit, entre deux commits, et rien ne les aurait arrêtées si le commit
 * était venu deux minutes plus tard.
 *
 * Ce test-ci ne relit pas le `.gitignore` — une règle peut être écrite et
 * contournée. Il regarde ce que git suit réellement.
 */
const SORTIES_DE_LECTURE = [
  /\.pdf$/i,
  /\.encours\.json$/i,
  /(^|\/)dossier[^/]*\.txt$/i,
  /(^|\/)corpus-[^/]*\.txt$/i
];

describe('rien du corpus ne part dans le dépôt public', () => {
  const suivis = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean);

  it('ne suit aucun fichier ayant la forme d’une sortie de lecture', () => {
    const fautifs = suivis.filter((f) => SORTIES_DE_LECTURE.some((m) => m.test(f)));
    expect(fautifs).toEqual([]);
  });

  it('ne suit aucune sonde jetable du corpus', () => {
    // Elles lisent de vrais rapports ; leur code n'a d'intérêt qu'au moment où
    // on l'écrit, et les publier invite à les relancer sans réfléchir.
    expect(suivis.filter((f) => f.endsWith('.local.ts'))).toEqual([]);
  });
});
