/**
 * L'épreuve de vérité : le moteur face au vrai corpus.
 *
 * Le dépôt contient un test `reel.test.ts` prévu pour cela, mais il attend un
 * dossier PLAT et le corpus est une arborescence de milliers de dossiers
 * clients. Résultat : il se sautait tout seul, et personne ne le voyait — deux
 * tests « skipped » dans une suite verte ne réveillent personne.
 *
 * Ce script parcourt l'arborescence, prend un échantillon de dossiers de
 * diagnostic (DDT) et mesure ce que le moteur sait en tirer.
 *
 * ── Ce qui sort d'ici ───────────────────────────────────────────────────────
 *
 * Des COMPTEURS, et rien d'autre. Aucun nom, aucune adresse, aucune valeur lue
 * dans un rapport. Ces PDF contiennent le nom et l'adresse de vraies personnes :
 * ils ne sont pas dans le dépôt, ils n'y entreront pas, et rien de leur contenu
 * ne doit se retrouver dans une sortie de console qu'on recopiera ensuite dans
 * un message.
 *
 * Usage :
 *   npx vite-node scripts/epreuve-corpus.ts -- <racine> [nombre]
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { lignesDePage, type PageTexte } from '../src/lib/lignes';
import { analyser } from '../src/lib/analyse';
import type { TypeDiag } from '../src/lib/modele';

const racine = process.argv[2];
const combien = Number(process.argv[3] ?? 120);

if (!racine) {
  console.error('Usage : vite-node scripts/epreuve-corpus.ts -- <racine> [nombre]');
  process.exit(1);
}

/** Tous les dossiers techniques du corpus, sans jamais suivre deux fois. */
function trouver(dossier: string, trouves: string[], profondeur = 0): void {
  if (profondeur > 8 || trouves.length > 4000) return;
  let entrees: string[];
  try {
    entrees = readdirSync(dossier);
  } catch {
    return;
  }
  for (const e of entrees) {
    if (e.startsWith('.')) continue;
    const chemin = join(dossier, e);
    let est;
    try {
      est = statSync(chemin);
    } catch {
      continue;
    }
    if (est.isDirectory()) trouver(chemin, trouves, profondeur + 1);
    /*
     * Les DDT seulement : ce sont les dossiers de diagnostic complets, ceux que
     * l'utilisateur déposera. Les rapports isolés (TERMITES_…, DPE_…) sont
     * d'autres objets, et les « en_attente » sont des brouillons non signés.
     */
    else if (/^DDT.*\.pdf$/i.test(e) && !/en_attente/i.test(e)) trouves.push(chemin);
  }
}

/**
 * Le texte d'un rapport, lu une seule fois dans sa vie.
 *
 * Les rapports vivent dans une Dropbox en « fichiers à la demande » : ils sont
 * référencés localement mais stockés en ligne, et les OUVRIR les fait
 * descendre. Relire le corpus à chaque mesure, c'est donc rapatrier des
 * gigaoctets pour n'en garder que du texte.
 *
 * Le texte extrait est mis de côté hors du dépôt. Les mesures suivantes le
 * relisent sans jamais rouvrir le PDF — ni disque, ni bande passante.
 *
 * ── Où il est rangé, et pourquoi pas ici ────────────────────────────────────
 *
 * Dans le dossier temporaire de la session, jamais dans le dépôt : ce texte
 * contient le nom et l'adresse de vraies personnes. Le dépôt est public.
 */
const CACHE = join(
  process.env.TEMP ?? process.env.TMP ?? '.',
  'verriere-texte-corpus'
);

function clef(chemin: string): string {
  /* Un nom de fichier stable et anodin : le chemin d'origine porte le nom du
     client, il ne doit pas se retrouver en clair dans un nom de cache. */
  let h = 0;
  for (let i = 0; i < chemin.length; i++) h = (Math.imul(31, h) + chemin.charCodeAt(i)) | 0;
  return join(CACHE, `${(h >>> 0).toString(36)}.json`);
}

async function pagesDe(chemin: string): Promise<PageTexte[]> {
  const range = clef(chemin);
  if (existsSync(range)) {
    return JSON.parse(readFileSync(range, 'utf8')) as PageTexte[];
  }

  const donnees = new Uint8Array(readFileSync(chemin));
  const pdf = await getDocument({ data: donnees, useSystemFonts: true, verbosity: 0 }).promise;
  const pages: PageTexte[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const contenu = await page.getTextContent();
    pages.push({
      numero: n,
      lignes: lignesDePage(
        contenu.items.filter(
          (i: unknown) => typeof i === 'object' && i !== null && 'str' in i
        ) as never
      )
    });
  }
  await pdf.destroy();

  mkdirSync(CACHE, { recursive: true });
  writeFileSync(range, JSON.stringify(pages), 'utf8');
  return pages;
}

const TYPES: TypeDiag[] = [
  'dpe',
  'electricite',
  'amiante',
  'plomb',
  'gaz',
  'termites',
  'erp',
  'carrez',
  'assainissement'
];

const vus = new Map<TypeDiag, number>();
const avecSchema = new Map<TypeDiag, number>();
const muets = new Map<TypeDiag, number>();
const sansDate = new Map<TypeDiag, number>();
/** Fiches nées de la page de synthèse : leur rapport n'est pas dans le PDF. */
const sansRapport = new Map<TypeDiag, number>();
for (const t of TYPES) {
  vus.set(t, 0);
  avecSchema.set(t, 0);
  muets.set(t, 0);
  sansDate.set(t, 0);
  sansRapport.set(t, 0);
}

let lus = 0;
let illisibles = 0;
let vides = 0;
let diagsTotal = 0;
const parDossier: number[] = [];

const fichiers: string[] = [];
trouver(racine, fichiers);
console.log(`${fichiers.length} dossiers techniques trouvés — épreuve sur ${Math.min(combien, fichiers.length)}\n`);

/* Un pas régulier plutôt que les N premiers : les dossiers sont rangés par
   client, et prendre le début du tri revient à n'interroger qu'une poignée
   d'immeubles. */
const pas = Math.max(1, Math.floor(fichiers.length / combien));
const echantillon = fichiers.filter((_, i) => i % pas === 0).slice(0, combien);

for (const chemin of echantillon) {
  try {
    const pages = await pagesDe(chemin);
    const texte = pages.reduce((n, p) => n + p.lignes.length, 0);
    if (texte < 20) {
      vides++;
      continue;
    }
    const a = analyser(pages);
    lus++;
    diagsTotal += a.diagnostics.length;
    parDossier.push(a.diagnostics.length);

    for (const d of a.diagnostics) {
      vus.set(d.type, (vus.get(d.type) ?? 0) + 1);
      if (d.schema) avecSchema.set(d.type, (avecSchema.get(d.type) ?? 0) + 1);
      /* « Muet » : le moteur a reconnu le diagnostic mais n'a pas su conclure.
         C'est le chiffre qui compte — il dit ce qu'il reste à apprendre. */
      if (d.gravite === 'neutre') muets.set(d.type, (muets.get(d.type) ?? 0) + 1);
      /*
       * La date, c'est `d.date` — pas un libellé deviné.
       *
       * La première version de cette sonde cherchait des intitulés au jugé :
       * « valable », « établi », « réalisé ». Or les modules écrivent « Date du
       * repérage », « Date de la visite », « Date du constat » — aucun de ces
       * trois ne contenait les mots cherchés. La sonde annonçait donc 100 % de
       * diagnostics sans date pour six types sur neuf, et le défaut était dans
       * la sonde.
       *
       * C'est `d.date` qui commande le contrôle de péremption dans
       * `echeance.ts`. C'est donc lui qu'il faut mesurer, et rien d'autre.
       */
      /*
       * Deux causes très différentes se cachaient dans une seule colonne.
       *
       * L'amiante affichait 43 % « sans date », et on l'a longtemps pris pour
       * un défaut de lecture. C'en était un tout autre : dans 21 cas sur 49, le
       * rapport n'est pas dans le PDF — seule sa conclusion, recopiée en page
       * de synthèse, y figure. Il n'a pas de date parce que le document qui la
       * porte est ailleurs, et aucune correction du moteur n'y changera rien.
       *
       * On les sépare donc : « sans rapport » compte les fiches nées de la
       * synthèse, « sans date » ne compte plus que celles dont le rapport EST
       * là et dont la date n'a pas été trouvée. Ce second chiffre, lui, se
       * corrige.
       */
      if (d.origine === 'synthese') sansRapport.set(d.type, (sansRapport.get(d.type) ?? 0) + 1);
      else if (!d.date) sansDate.set(d.type, (sansDate.get(d.type) ?? 0) + 1);
    }
  } catch (e) {
    /*
     * Un rapport illisible, ou une faute de ma part ?
     *
     * Ce catch avalait tout. Un import oublié dans le cache a fait échouer les
     * soixante lectures, et le compteur a annoncé « 60 rapports illisibles » —
     * une donnée parfaitement fausse, présentée avec l'aplomb d'une mesure.
     *
     * Les erreurs de programmation remontent donc désormais : elles doivent
     * casser l'épreuve, pas la teinter.
     */
    if (e instanceof ReferenceError || e instanceof TypeError) throw e;
    illisibles++;
  }
}

console.log(`dossiers lus        : ${lus}`);
console.log(`illisibles          : ${illisibles}`);
console.log(`sans texte (scans)  : ${vides}`);
console.log(`diagnostics trouvés : ${diagsTotal}`);
if (parDossier.length) {
  const tri = [...parDossier].sort((a, b) => a - b);
  console.log(`par dossier         : médiane ${tri[Math.floor(tri.length / 2)]}, min ${tri[0]}, max ${tri[tri.length - 1]}`);
}

console.log('\ntype             trouvés   schéma     muets   sans date  sans rapport');
for (const t of TYPES) {
  const n = vus.get(t) ?? 0;
  if (!n) {
    console.log(`${t.padEnd(16)} ${String(0).padStart(7)}         —         —           —             —`);
    continue;
  }
  const pc = (x: number) => `${Math.round((x / n) * 100)} %`;
  console.log(
    `${t.padEnd(16)} ${String(n).padStart(7)} ${pc(avecSchema.get(t) ?? 0).padStart(9)} ` +
      `${pc(muets.get(t) ?? 0).padStart(9)} ${pc(sansDate.get(t) ?? 0).padStart(11)} ${pc(sansRapport.get(t) ?? 0).padStart(13)}`
  );
}
