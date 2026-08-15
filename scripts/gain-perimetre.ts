/**
 * Combien de diagnostics disent maintenant ce qu'ils n'ont pas pu voir — LOCAL.
 *
 * Avant : seuls l'électricité et le gaz. Les sept autres rendaient une
 * conclusion sans jamais dire ce qu'elle ne couvrait pas.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs.
 *
 *   npx vite-node scripts/gain-perimetre.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { analyser } from '../src/lib/analyse/index';
import { lignesDePage } from '../src/lib/lignes';
import type { PageTexte, TypeDiag } from '../src/lib/modele';

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

const parType = new Map<TypeDiag, { vus: number; avecPerimetre: number }>();
let fichiers = 0;
let dossiersAvecAuMoinsUn = 0;
let relevesPerimetre = 0;

const chemins: string[] = [];
await trouver(racine, chemins, combien);

for (const chemin of chemins) {
  let doc;
  try {
    doc = await getDocument({ url: chemin, useSystemFonts: true }).promise;
  } catch {
    continue;
  }

  try {
    const pages: PageTexte[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const contenu = await page.getTextContent();
      const items = contenu.items.filter((i) => 'str' in i && 'transform' in i);
      pages.push({ numero: p, lignes: lignesDePage(items as never) });
    }

    let unAuMoins = false;
    for (const d of analyser(pages).diagnostics) {
      const compte = parType.get(d.type) ?? { vus: 0, avecPerimetre: 0 };
      compte.vus++;
      const n = (d.releves ?? []).filter((r) => r.genre === 'nonVisite').length;
      if (n > 0) {
        compte.avecPerimetre++;
        relevesPerimetre += n;
        unAuMoins = true;
      }
      parType.set(d.type, compte);
    }
    if (unAuMoins) dossiersAvecAuMoinsUn++;
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
      dossiersOuAuMoinsUnDiagnosticDitCeQuIlNAPasVu: dossiersAvecAuMoinsUn,
      relevesDePerimetreAuTotal: relevesPerimetre,
      parDiagnostic: [...parType]
        .map(([type, c]) => ({ type, reconnus: c.vus, avecPerimetre: c.avecPerimetre }))
        .sort((a, b) => b.avecPerimetre - a.avecPerimetre)
    },
    null,
    2
  )
);
