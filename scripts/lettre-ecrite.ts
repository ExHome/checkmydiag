/**
 * La lettre du DPE est-elle écrite en toutes lettres quelque part — LOCAL.
 *
 * L'abstention sous 40 m² prive vingt-et-un dossiers sur trente-et-un de leur
 * lettre. C'est juste — l'échelle générale y était fausse — mais coûteux.
 *
 * S'il existe une lettre ÉCRITE dans le rapport, la question ne se pose plus :
 * c'est celle du diagnostiqueur, calculée avec les bons seuils, et il suffit de
 * la lire au lieu de la recalculer. Ce script cherche les formulations qui la
 * portent, et compte dans combien de dossiers chacune apparaît.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs.
 *
 *   npx vite-node scripts/lettre-ecrite.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { normalise } from '../src/lib/analyse/texte';

const [, , racineArg, combienArg] = process.argv;
const racine = racineArg ?? '.';
const combien = combienArg ? Number(combienArg) : 40;
const INTERESSANT = /^(DDT|RAPPORT|DPE|CREP|ERP|DAPP|AMIANTE)[-_ ]/i;

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

const FORMES: { nom: string; motif: RegExp }[] = [
  { nom: '« classe X » (A-G)', motif: /\bclasse\s+[a-g]\b/ },
  { nom: '« etiquette X »', motif: /etiquette\s+[a-g]\b/ },
  { nom: '« logement classe X »', motif: /logement[^.]{0,30}classe\s+[a-g]\b/ },
  { nom: '« consommation energetique : X »', motif: /consommation[^.]{0,40}:\s*[a-g]\b/ },
  { nom: '« performance : X »', motif: /performance[^.]{0,30}:\s*[a-g]\b/ },
  { nom: '« classe energie X »', motif: /classe\s+(?:energie|energetique)\s*:?\s*[a-g]\b/ },
  { nom: '« classe climat X »', motif: /classe\s+climat\s*:?\s*[a-g]\b/ },
  { nom: '« passoire »', motif: /passoire/ },
  { nom: '« logement extremement peu performant »', motif: /extremement peu performant/ },
  { nom: '« logement tres performant »', motif: /tres performant/ },
  { nom: 'mention F ou G en toutes lettres', motif: /classe\s+[fg]\b/ }
];

const dossiers = new Map<string, Set<number>>();
let fichiers = 0;

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

      for (const f of FORMES) {
        if (f.motif.test(texte)) {
          if (!dossiers.has(f.nom)) dossiers.set(f.nom, new Set());
          dossiers.get(f.nom)!.add(n);
        }
      }
    }
  } catch {
    // illisible
  }

  fichiers++;
  await doc.destroy();
}

console.log(
  JSON.stringify(
    {
      fichiers,
      formes: FORMES.map((f) => ({ forme: f.nom, dossiers: dossiers.get(f.nom)?.size ?? 0 })).sort(
        (a, b) => b.dossiers - a.dossiers
      )
    },
    null,
    2
  )
);
