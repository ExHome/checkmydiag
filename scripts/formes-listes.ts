/**
 * Sous quelle forme les rapports écrivent-ils leurs listes A/B/C — LOCAL.
 *
 * La première mesure a montré que « liste a » apparaît 84 fois sur 40 dossiers,
 * alors que l'extracteur actuel n'en reconnaît qu'un seul. Il cherche « Liste
 * A : il n'a pas été repéré… » sur une seule ligne ; les rapports, eux,
 * écrivent la mention en tête de tableau, en titre de section, ou dans une
 * phrase tournée autrement.
 *
 * Ce script n'extrait rien : il teste des hypothèses de forme, écrites ici, et
 * compte celles qui tombent juste. C'est la seule façon d'écrire un extracteur
 * qui ne se trompe pas — et de mesurer le faux positif évident (« la liste a
 * été établie », qui contient « liste a » sans être une liste A).
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs.
 *
 *   npx vite-node scripts/formes-listes.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { normalise } from '../src/lib/analyse/texte';

const [, , racineArg, combienArg] = process.argv;
const racine = racineArg ?? '.';
const combien = combienArg ? Number(combienArg) : 40;
const INTERESSANT = /^(DDT|RAPPORT|DAPP|AMIANTE)[-_ ]/i;

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
    if (info.isDirectory()) await trouver(chemin, sortie, plafond);
    else if (nom.toLowerCase().endsWith('.pdf') && INTERESSANT.test(nom)) sortie.push(chemin);
  }
}

/**
 * Les hypothèses. Chacune est un motif que j'écris ; on compte combien de fois
 * il tombe juste, et dans combien de dossiers distincts.
 */
const HYPOTHESES: { nom: string; motif: RegExp }[] = [
  { nom: 'FAUX POSITIF « la liste a ete »', motif: /la liste a ete/g },
  { nom: 'liste [abc] suivie de deux-points', motif: /liste [abc]\s*:/g },
  { nom: 'materiaux (et produits) de la liste [abc]', motif: /materiaux(?: et produits)? de la liste [abc]/g },
  { nom: 'liste [abc] + « il n a pas ete repere » sous 200 car.', motif: /liste [abc][\s\S]{0,200}?il n'a pas ete repere/g },
  { nom: 'liste [abc] + « il a ete repere » sous 200 car.', motif: /liste [abc][\s\S]{0,200}?il a ete repere/g },
  { nom: 'liste [abc] + « absence » sous 120 car.', motif: /liste [abc][\s\S]{0,120}?absence/g },
  { nom: 'liste [abc] + « presence » sous 120 car.', motif: /liste [abc][\s\S]{0,120}?presence/g },
  { nom: 'liste [abc] + « neant » sous 120 car.', motif: /liste [abc][\s\S]{0,120}?neant/g },
  { nom: 'liste [abc] + « sans objet » sous 120 car.', motif: /liste [abc][\s\S]{0,120}?sans objet/g },
  { nom: 'liste [abc] + « non repere » sous 120 car.', motif: /liste [abc][\s\S]{0,120}?non repere/g },
  { nom: 'en tete de tableau : « liste » + « localisation »', motif: /liste[\s\S]{0,60}?localisation/g },
  { nom: 'ligne de tableau : « local » + « bon etat »', motif: /local[\s\S]{0,160}?bon etat/g },
  { nom: 'ligne de tableau : « local » + « degrade »', motif: /local[\s\S]{0,160}?degrade/g },
  { nom: 'materiau + etat de conservation', motif: /materiau[\s\S]{0,200}?etat de conservation/g },
  { nom: 'reponse « non » a la presence', motif: /presence[\s\S]{0,40}?\bnon\b/g },
  { nom: 'reponse « oui » a la presence', motif: /presence[\s\S]{0,40}?\boui\b/g }
];

const total = new Map<string, number>();
const dossiers = new Map<string, number>();
let fichiers = 0;

const chemins: string[] = [];
await trouver(racine, chemins, combien);

for (const chemin of chemins) {
  let doc;
  try {
    doc = await getDocument({ url: chemin, useSystemFonts: true }).promise;
  } catch {
    continue;
  }

  const vus = new Set<string>();
  try {
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const contenu = await page.getTextContent();
      const texte = normalise(contenu.items.map((i) => ('str' in i ? i.str : '')).join(' '));

      for (const h of HYPOTHESES) {
        const n = (texte.match(h.motif) ?? []).length;
        if (n) {
          total.set(h.nom, (total.get(h.nom) ?? 0) + n);
          vus.add(h.nom);
        }
      }
    }
  } catch {
    // illisible : n'entre pas dans la mesure
  }

  for (const nom of vus) dossiers.set(nom, (dossiers.get(nom) ?? 0) + 1);
  fichiers++;
  await doc.destroy();
}

const lignes = HYPOTHESES.map((h) => ({
  hypothese: h.nom,
  dossiers: `${dossiers.get(h.nom) ?? 0}/${fichiers}`,
  occurrences: total.get(h.nom) ?? 0
})).sort((a, b) => b.occurrences - a.occurrences);

console.log(JSON.stringify({ fichiers, lignes }, null, 2));
