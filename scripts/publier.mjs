/**
 * Publier Verrière sans consommer de minutes GitHub Actions.
 *
 * ── Pourquoi ce script existe ──────────────────────────────────────────────
 *
 * Le déploiement passe normalement par `.github/workflows/pages.yml`. Le
 * 19 août 2026, un push de trente-huit commits n'a déclenché AUCUNE exécution :
 * le site est resté sur sa version du 16 août. Ni le workflow ni les
 * dépendances n'avaient changé depuis le déploiement réussi, GitHub était
 * opérationnel, et le build passait en local — la cause était donc côté compte,
 * pas côté code. Le dépôt étant privé, chaque passage du workflow consomme le
 * quota mensuel de minutes.
 *
 * Un push git, lui, n'en consomme aucune. Ce script construit le site et le
 * publie sur la branche `gh-pages`, d'où GitHub Pages peut le servir
 * directement.
 *
 * ── Ce qu'il faut avoir fait une fois ──────────────────────────────────────
 *
 * Dans Settings → Pages du dépôt : « Source » sur **Deploy from a branch**,
 * puis brancher `gh-pages` / `/ (root)`. Sans ce réglage, la branche est
 * poussée mais rien ne change en ligne.
 *
 * Le workflow reste en place : le jour où les minutes reviennent, il suffit de
 * remettre « Source » sur GitHub Actions.
 *
 * ── Usage ──────────────────────────────────────────────────────────────────
 *
 *   npm run publier
 */
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const RACINE = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const DIST = join(RACINE, 'dist');
const SITE = 'https://exhome.github.io/checkmydiag';
const DEPOT = 'git@github.com:ExHome/checkmydiag.git';

/** Les maquettes de conception sont internes : elles n'ont jamais été en ligne. */
const HORS_LIGNE = ['maquette.local'];

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function etape(texte) {
  process.stdout.write(`\n▸ ${texte}\n`);
}

/*
 * Rien ne se publie depuis un dépôt qui a des modifications en cours : on
 * saurait dire ce qui est en ligne, mais pas d'où il sort.
 */
etape('Contrôle du dépôt');
const enCours = git(['status', '--porcelain'], RACINE).trim();
if (enCours) {
  console.error('Des modifications ne sont pas enregistrées. Committez-les avant de publier :\n');
  console.error(enCours);
  process.exit(1);
}
const source = git(['rev-parse', '--short', 'HEAD'], RACINE).trim();
const branche = git(['rev-parse', '--abbrev-ref', 'HEAD'], RACINE).trim();
console.log(`  ${branche} ${source}`);

etape('Contrôles avant publication');
for (const commande of [['run', 'test'], ['run', 'check']]) {
  execFileSync('npm', commande, { cwd: RACINE, stdio: 'inherit', shell: true });
}

etape('Construction');
execFileSync('npm', ['run', 'build'], {
  cwd: RACINE,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, CMD_SITE: SITE }
});

etape('Retrait de ce qui ne se publie pas');
for (const nom of HORS_LIGNE) {
  const chemin = join(DIST, nom);
  if (existsSync(chemin)) {
    rmSync(chemin, { recursive: true, force: true });
    console.log(`  retiré : ${nom}`);
  }
}

/*
 * GitHub Pages ignore par défaut les dossiers commençant par un souligné, à
 * cause de Jekyll. Ce fichier vide le lui interdit.
 */
execFileSync('node', ['-e', `require('fs').writeFileSync(${JSON.stringify(join(DIST, '.nojekyll'))}, '')`]);

etape('Publication sur gh-pages');
if (!existsSync(join(DIST, '.git'))) {
  git(['init', '-q'], DIST);
  git(['checkout', '-qb', 'gh-pages'], DIST);
  git(['remote', 'add', 'origin', DEPOT], DIST);
}
/* L'identité vient du dépôt principal : la publication est signée comme le reste. */
git(['config', 'user.name', git(['config', 'user.name'], RACINE).trim()], DIST);
git(['config', 'user.email', git(['config', 'user.email'], RACINE).trim()], DIST);

git(['add', '-A'], DIST);
const aPublier = git(['status', '--porcelain'], DIST).trim();
if (!aPublier) {
  console.log('  le site en ligne est déjà à jour');
  process.exit(0);
}
git(['commit', '-q', '-m', `Verriere - publication depuis ${branche} ${source}`], DIST);

/*
 * `--force` est ici la règle, non l'exception : cette branche ne porte pas
 * d'histoire à conserver, seulement l'état du site. Elle est régénérée à chaque
 * publication et ne contient aucun travail qu'on pourrait perdre.
 */
execFileSync('git', ['push', '--force', '-u', 'origin', 'gh-pages'], {
  cwd: DIST,
  stdio: 'inherit'
});

console.log(`\n✓ Publié. Le site se met à jour en une à deux minutes : ${SITE}`);
