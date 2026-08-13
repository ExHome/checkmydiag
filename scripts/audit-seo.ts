/**
 * L'audit de couverture — `npm run seo`.
 *
 * Il répond à la seule question que pose ORDRE-DE-MISSION-REFERENCEMENT.md :
 * *pour chaque chose que les gens cherchent, la réponse existe-t-elle, est-elle
 * datée, est-elle illustrée, mène-t-elle quelque part ?*
 *
 * Il ne fait rien tout seul : il dit ce qui manque, dans l'ordre où il faut s'y
 * mettre. C'est le point de départ de chaque passe de travail, à la main comme
 * en tâche programmée.
 */
import { FICHES, THEMES } from '../src/lib/nuls';
import { INTENTIONS, trous } from '../src/lib/nuls/intentions';
import { manquants, signature } from '../src/lib/nuls/editeur';
import { SITE } from '../src/lib/nuls/rendu';

const AUJOURDHUI = new Date();
/** Au-delà, une règle datée mérite d'être revérifiée. */
const PEREMPTION_JOURS = 180;

const jours = (depuis: string): number =>
  Math.round((AUJOURDHUI.getTime() - new Date(depuis).getTime()) / 86_400_000);

const titre = (texte: string): void => {
  console.log(`\n${texte}`);
  console.log('─'.repeat(texte.length));
};

const connues = new Set(FICHES.map((f) => f.question.id));

console.log('\n══ Check My Diag — couverture des intentions ══');
console.log(
  `${FICHES.length} questions · ${THEMES.length} thèmes · ${INTENTIONS.length} intentions suivies`
);

/* ------------------------------------------------- ce qui bloque la place 1 */

/**
 * Les verrous, avant le détail. Tant qu'ils tiennent, écrire une page de plus
 * rapporte moins que de les lever — c'est la règle de l'ordre de mission.
 */
const verrous: string[] = [];

const identite = manquants();
if (identite.length) {
  verrous.push(
    `FIABILITÉ — le site n’est signé par personne. Manque : ${identite.join(' · ')}.\n` +
      '           Ces pages parlent de plomb, de monoxyde de carbone et de décisions à\n' +
      '           plusieurs dizaines de milliers d’euros : un moteur de recherche y regarde\n' +
      '           qui écrit avant de regarder ce qui est écrit. C’est le manque le plus cher\n' +
      '           du site. À remplir dans src/lib/nuls/editeur.ts.'
  );
}

/**
 * Servi sous un chemin de projet, le fichier `robots.txt` du site n'est jamais
 * lu : les moteurs ne le cherchent qu'à la racine du domaine, que nous ne
 * contrôlons pas. La ligne `Sitemap:` qu'il contient est donc inopérante.
 */
const sousChemin = new URL(`${SITE}/`).pathname !== '/';
if (sousChemin) {
  verrous.push(
    'SITEMAP — le site vit dans un sous-dossier, donc son robots.txt n’est jamais lu :\n' +
      '           les moteurs ne le cherchent qu’à la racine du domaine. Le sitemap doit\n' +
      `           être déclaré à la main dans la Search Console : ${SITE}/sitemap.xml`
  );
  verrous.push(
    'DOMAINE — l’adresse est un sous-dossier d’un domaine partagé. Ça fonctionne, et le\n' +
      '           site est en ligne — mais un nom de domaine propre reste ce qui donne à un\n' +
      '           contenu son autorité. À poser dès que possible, avec les redirections.'
  );
}

verrous.push(
  'AUTORITÉ — personne ne mesure encore qui renvoie vers le site. C’est le levier le\n' +
    '           plus lent et le plus décisif : il ne s’obtient pas en écrivant. Voir la\n' +
    '           section « L’autorité, ensuite » de ORDRE-DE-MISSION-REFERENCEMENT.md.'
);

if (verrous.length) {
  titre('CE QUI BLOQUE LA PREMIÈRE PLACE');
  for (const verrou of verrous) console.log(`  ${verrou}\n`);
} else {
  console.log('\nAucun verrou structurel. Le travail est celui du contenu.');
}

if (signature()) console.log(`Signé par : ${signature()}`);

/* ------------------------------------------------------------ la couverture */

const manquantes = trous(connues);
const couvertes = INTENTIONS.length - manquantes.length;
const taux = Math.round((couvertes / INTENTIONS.length) * 100);
console.log(`Couverture : ${couvertes}/${INTENTIONS.length} (${taux} %)`);

if (manquantes.length) {
  titre('À ÉCRIRE, dans cet ordre');
  for (const intention of manquantes) {
    console.log(`  [${intention.poids.padEnd(5)}] ${intention.requete}`);
    if (intention.note) console.log(`           ${intention.note}`);
  }
} else {
  console.log('\nToutes les intentions suivies ont leur réponse.');
  console.log('C’est le signal qu’il faut élargir le registre, pas s’arrêter.');
}

/* ---------------------------------------------------- la qualité des pages */

const sansDessin = FICHES.filter((f) => !f.question.dessin && !f.question.tableau);
if (sansDessin.length) {
  titre(`SANS DESSIN NI TABLEAU (${sansDessin.length})`);
  console.log('  Une page qui n’a ni schéma ni tableau explique moins bien qu’elle ne le pourrait.');
  for (const f of sansDessin) console.log(`  ${f.theme.id}/${f.question.id}`);
}

const sansPiege = FICHES.filter((f) => !f.question.piege);
if (sansPiege.length) {
  titre(`SANS « LE PIÈGE » (${sansPiege.length})`);
  console.log('  C’est le bloc le plus utile de la page, et celui que les autres sites n’ont pas.');
  for (const f of sansPiege) console.log(`  ${f.theme.id}/${f.question.id}`);
}

const sansPont = FICHES.filter((f) => !f.question.chezMoi);
if (sansPont.length) {
  titre(`SANS RETOUR AU RAPPORT DU LECTEUR (${sansPont.length})`);
  console.log('  Règle 7 : l’explication générale doit ramener au document que le lecteur a en main.');
  for (const f of sansPont) console.log(`  ${f.theme.id}/${f.question.id}`);
}

/* ----------------------------------------------------------- la fraîcheur */

const vieilles = FICHES.filter((f) => f.question.verifie && jours(f.question.verifie) > PEREMPTION_JOURS)
  .map((f) => ({ f, age: jours(f.question.verifie as string) }))
  .sort((a, b) => b.age - a.age);

if (vieilles.length) {
  titre(`À REVÉRIFIER (${vieilles.length})`);
  console.log(`  Contenu réglementaire vérifié il y a plus de ${PEREMPTION_JOURS} jours.`);
  for (const { f, age } of vieilles) console.log(`  ${age} j · ${f.theme.id}/${f.question.id}`);
} else {
  console.log(`\nFraîcheur : aucune page au-delà de ${PEREMPTION_JOURS} jours.`);
}

/* ------------------------------------------------------------- l'équilibre */

titre('POIDS PAR THÈME');
for (const t of THEMES) {
  const suivies = INTENTIONS.filter((i) =>
    t.questions.some((q) => q.id === i.reponse)
  ).length;
  console.log(
    `  ${String(t.questions.length).padStart(3)} questions · ${String(suivies).padStart(3)} intentions · ${t.titre}`
  );
}

console.log('\nLe travail n’est jamais « terminé » : il est à jour, ou il ne l’est pas.\n');
