/**
 * La mesure du moteur sur le corpus réel — LOCAL UNIQUEMENT.
 *
 * Le moteur a été écrit en regardant trois rapports. Trois rapports, c'est une
 * intuition, pas une calibration : on ne sait pas ce qu'on ne lit pas. Cet
 * outil passe le moteur sur des centaines de vrais dossiers et compte ce qu'il
 * sait lire, ce qu'il rate, et ce qu'il lit de travers.
 *
 * ⚠️ Ces rapports contiennent le nom et l'adresse de vraies personnes. Ce
 * script ne recopie AUCUN contenu : il ne sort que des compteurs, des noms de
 * champs et des motifs de formulation. Sa sortie est écrite hors du dépôt, et
 * le dépôt ignore déjà les PDF.
 *
 *   npx vite-node scripts/corpus.ts -- "<dossier>" [nombre] > mesure.txt
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { analyser } from '../src/lib/analyse/index';
import { lignesDePage, lignesPositionnees, type Fragment } from '../src/lib/lignes';
import type { PageTexte, TypeDiag } from '../src/lib/modele';

const [, , racineArg, combienArg, motifArg] = process.argv;
const racine = racineArg ?? '.';
const combien = combienArg ? Number(combienArg) : 60;

/**
 * Quels fichiers mesurer, d'après leur nom.
 *
 * Sans troisième argument, les dossiers de vente complets — pas les factures.
 * Avec, on vise une famille : « RAAT », « DTG », « DTA »… C'est ainsi qu'on
 * mesure ce que le moteur fait d'un document qu'il n'a jamais vu.
 */
const INTERESSANT = motifArg
  ? new RegExp(motifArg, 'i')
  : /^(DDT|RAPPORT|DPE|CREP|ERP|DAPP)[-_ ]/i;

async function trouver(dossier: string, sortie: string[], plafond: number): Promise<void> {
  if (sortie.length >= plafond) return;
  let entrees: string[];
  try {
    entrees = await readdir(dossier);
  } catch {
    return;
  }

  for (const nom of entrees) {
    if (sortie.length >= plafond) return;
    const chemin = join(dossier, nom);
    let info;
    try {
      info = await stat(chemin);
    } catch {
      continue;
    }
    if (info.isDirectory()) {
      await trouver(chemin, sortie, plafond);
    } else if (nom.toLowerCase().endsWith('.pdf') && INTERESSANT.test(nom)) {
      sortie.push(chemin);
    }
  }
}

/** Le texte d'un PDF, page par page, dans la forme que le moteur attend. */
async function lire(chemin: string): Promise<PageTexte[] | null> {
  try {
    const data = new Uint8Array(await readFile(chemin));
    const pdf = await getDocument({ data, useSystemFonts: true, verbosity: 0 }).promise;
    const pages: PageTexte[] = [];

    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const contenu = await page.getTextContent();
      const items: Fragment[] = [];
      for (const item of contenu.items) {
        if ('str' in item) {
          items.push({
            str: item.str,
            transform: item.transform,
            width: item.width,
            height: item.height
          });
        }
      }
      pages.push({
        numero: n,
        lignes: lignesDePage(items),
        positions: lignesPositionnees(items)
      });
      page.cleanup();
    }
    await pdf.destroy();
    return pages;
  } catch {
    return null;
  }
}

/* ---- Ce qu'on mesure ------------------------------------------------------
   Trois questions, dans cet ordre : est-ce qu'on reconnaît le diagnostic ?
   est-ce qu'on en tire un verdict ? est-ce que le verdict tient debout ? */

const TYPES: TypeDiag[] = [
  'dpe',
  'amiante',
  'plomb',
  'electricite',
  'gaz',
  'termites',
  'erp',
  'carrez',
  'assainissement'
];

/** Ce qu'un rapport contient vraiment, d'après ses intitulés officiels. */
const PRESENCE: Record<TypeDiag, RegExp> = {
  dpe: /diagnostic de performance [ée]nerg[ée]tique/i,
  amiante: /[ée]tat.{0,40}amiante|rep[ée]rage.{0,30}amiante|constat.{0,20}amiante/i,
  plomb: /constat de risque d.exposition au plomb|CREP\b/i,
  electricite: /[ée]tat de l.installation int[ée]rieure d.[ée]lectricit/i,
  gaz: /[ée]tat de l.installation int[ée]rieure de gaz/i,
  termites: /[ée]tat relatif [àa] la pr[ée]sence de termites|[ée]tat parasitaire/i,
  erp: /[ée]tat des risques|ERP\b|ERRIAL/i,
  carrez: /superficie.{0,20}(carrez|privative)|loi carrez/i,
  assainissement: /assainissement non collectif|contr[ôo]le.{0,20}assainissement/i
};

interface Mesure {
  fichiers: number;
  illisibles: number;
  pagesTotal: number;
  /** Présent dans le texte / reconnu par le moteur / verdict exploitable. */
  presents: Record<string, number>;
  reconnus: Record<string, number>;
  verdicts: Record<string, number>;
  neutres: Record<string, number>;
  /** Champs d'identité du bien retrouvés. */
  bien: Record<string, number>;
  /** Les rapports où le moteur ne trouve rien du tout. */
  muets: number;
  /** Combien de relevés et de repères, pour juger de la matière disponible. */
  releves: number;
  reperes: number;
}

const zero = (): Record<string, number> =>
  Object.fromEntries(TYPES.map((t) => [t, 0])) as Record<string, number>;

async function main(): Promise<void> {
  const fichiers: string[] = [];
  await trouver(racine, fichiers, combien);

  const m: Mesure = {
    fichiers: 0,
    illisibles: 0,
    pagesTotal: 0,
    presents: zero(),
    reconnus: zero(),
    verdicts: zero(),
    neutres: zero(),
    bien: { adresse: 0, commune: 0, typeBien: 0, surface: 0, anneeConstruction: 0 },
    muets: 0,
    releves: 0,
    reperes: 0
  };

  /** Les formulations de conclusion qu'on n'a pas su interpréter. */
  const rates = new Map<string, number>();
  /** Ce que le moteur croit avoir entre les mains. */
  const genres = new Map<string, number>();

  for (const chemin of fichiers) {
    const pages = await lire(chemin);
    if (!pages) {
      m.illisibles++;
      continue;
    }

    m.fichiers++;
    m.pagesTotal += pages.length;

    const texte = pages.flatMap((p) => p.lignes).join('\n');
    for (const t of TYPES) {
      if (PRESENCE[t].test(texte)) m.presents[t] = (m.presents[t] ?? 0) + 1;
    }

    const analyse = analyser(pages);
    if (!analyse.diagnostics.length) m.muets++;
    genres.set(analyse.nature.genre, (genres.get(analyse.nature.genre) ?? 0) + 1);

    for (const d of analyse.diagnostics) {
      m.reconnus[d.type] = (m.reconnus[d.type] ?? 0) + 1;
      if (d.gravite === 'neutre') {
        m.neutres[d.type] = (m.neutres[d.type] ?? 0) + 1;
        // Un diagnostic reconnu mais sans verdict : c'est là que le moteur
        // échoue. On garde la forme de sa conclusion, pas son contenu.
        const forme = `${d.type} · ${(d.verdict ?? '').slice(0, 70).replace(/\d+[.,]?\d*/g, '#')}`;
        rates.set(forme, (rates.get(forme) ?? 0) + 1);
      } else {
        m.verdicts[d.type] = (m.verdicts[d.type] ?? 0) + 1;
      }
      m.releves += d.releves?.length ?? 0;
      m.reperes += d.reperes?.length ?? 0;
    }

    for (const champ of Object.keys(m.bien)) {
      if ((analyse.bien as Record<string, unknown>)[champ]) m.bien[champ] = (m.bien[champ] ?? 0) + 1;
    }
  }

  /* ---- Le compte rendu --------------------------------------------------- */
  const pc = (a: number, b: number): string => (b ? `${Math.round((a / b) * 100)} %` : '—');

  console.log(`# Le moteur sur le corpus réel`);
  console.log(`\n${m.fichiers} dossiers lus, ${m.illisibles} illisibles, ${m.pagesTotal} pages.`);
  console.log(`${m.muets} dossiers dont le moteur ne tire rien.`);
  console.log(`${m.releves} relevés et ${m.reperes} passages repérés au total.\n`);

  console.log('## Nature reconnue');
  for (const [g, n] of [...genres.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`- ${g} : ${n}`);
  }

  console.log('\n## Par diagnostic');
  console.log('| diagnostic | dans le PDF | reconnu | avec verdict | sans verdict |');
  console.log('|---|---|---|---|---|');
  for (const t of TYPES) {
    const p = m.presents[t] ?? 0;
    const r = m.reconnus[t] ?? 0;
    const v = m.verdicts[t] ?? 0;
    console.log(
      `| ${t} | ${p} | ${r} (${pc(r, p)}) | ${v} (${pc(v, r)}) | ${m.neutres[t] ?? 0} |`
    );
  }

  console.log('\n## Le bien');
  for (const [champ, n] of Object.entries(m.bien)) {
    console.log(`- ${champ} : ${n} / ${m.fichiers} (${pc(n, m.fichiers)})`);
  }

  console.log('\n## Les conclusions non interprétées');
  console.log('_Chiffres masqués : on relève la forme, jamais le contenu._\n');
  for (const [forme, n] of [...rates.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40)) {
    console.log(`- ${n}× ${forme}`);
  }
}

await main();
