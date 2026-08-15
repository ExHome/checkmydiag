/**
 * Que dit le rapport juste après « matériaux de la liste A » — LOCAL.
 *
 * La forme est identifiée : 18 dossiers sur 40 écrivent « matériaux (et
 * produits) de la liste A / B / C ». Reste la seule chose qui compte : ce qui
 * suit dit-il une présence, une absence, ou rien du tout ? Un extracteur qui
 * se tromperait de sens ferait pire que l'absence d'extracteur.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : on teste des suites écrites ici,
 * et on compte. Rien n'est lu au hasard.
 *
 *   npx vite-node scripts/formes-suite.ts -- "<dossier>" [nombre]
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

/** L'ancre : la forme dominante mesurée. */
const ANCRE = /materiaux(?: et produits)? de la liste ([abc])/g;

/** Ce qu'on cherche dans la suite, et le sens que ça donne. */
const SUITES: { nom: string; motif: RegExp; sens: string }[] = [
  { nom: "n'a pas ete repere", motif: /n'a pas ete repere/, sens: 'absence' },
  { nom: 'a ete repere', motif: /(?<!n'a pas )a ete repere/, sens: 'presence' },
  { nom: 'aucun', motif: /\baucun\b/, sens: 'absence' },
  { nom: 'absence', motif: /\babsence\b/, sens: 'absence' },
  { nom: 'presence', motif: /\bpresence\b/, sens: 'presence' },
  { nom: 'neant', motif: /\bneant\b/, sens: 'absence' },
  { nom: 'non', motif: /\bnon\b/, sens: 'absence ?' },
  { nom: 'oui', motif: /\boui\b/, sens: 'presence ?' },
  { nom: 'sans objet', motif: /sans objet/, sens: 'hors perimetre' },
  { nom: 'non visite / inaccessible', motif: /non visite|inaccessible/, sens: 'non contrôlé' },
  { nom: 'bon etat', motif: /bon etat/, sens: 'presence + etat' },
  { nom: 'degrade', motif: /degrade/, sens: 'presence + etat' }
];

/** Trois fenêtres, pour savoir à quelle distance la réponse se trouve. */
const FENETRES = [80, 200, 400];

const compte = new Map<string, number>();
const dossiers = new Map<string, Set<number>>();
let fichiers = 0;
let ancres = 0;
let ancresSansReponse = 0;
const parListe = new Map<string, number>();

const chemins: string[] = [];
await trouver(racine, chemins, combien);

for (const [n, chemin] of chemins.entries()) {
  let doc;
  try {
    doc = await getDocument({ url: chemin, useSystemFonts: true }).promise;
  } catch {
    continue;
  }

  try {
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const contenu = await page.getTextContent();
      const texte = normalise(contenu.items.map((i) => ('str' in i ? i.str : '')).join(' '));

      ANCRE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = ANCRE.exec(texte)) !== null) {
        ancres++;
        parListe.set(m[1]!, (parListe.get(m[1]!) ?? 0) + 1);
        let repondu = false;

        for (const f of FENETRES) {
          const suite = texte.slice(m.index + m[0].length, m.index + m[0].length + f);
          for (const s of SUITES) {
            if (s.motif.test(suite)) {
              const cle = `${f} car. · ${s.nom} → ${s.sens}`;
              compte.set(cle, (compte.get(cle) ?? 0) + 1);
              if (!dossiers.has(cle)) dossiers.set(cle, new Set());
              dossiers.get(cle)!.add(n);
              repondu = true;
            }
          }
        }
        if (!repondu) ancresSansReponse++;
      }
    }
  } catch {
    // illisible : n'entre pas dans la mesure
  }

  fichiers++;
  await doc.destroy();
}

const lignes = [...compte]
  .map(([cle, n]) => ({ forme: cle, occurrences: n, dossiers: dossiers.get(cle)?.size ?? 0 }))
  .sort((a, b) => b.occurrences - a.occurrences)
  .slice(0, 24);

console.log(
  JSON.stringify(
    {
      fichiers,
      ancresTrouvees: ancres,
      ancresSansAucuneReponse: ancresSansReponse,
      parListe: [...parListe].sort(),
      lignes
    },
    null,
    2
  )
);
