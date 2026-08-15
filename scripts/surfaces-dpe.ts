/**
 * Quelles surfaces le moteur lit-il dans les DPE — LOCAL UNIQUEMENT.
 *
 * L'abstention sous 40 m² fait chuter les verdicts DPE de trente-et-un à dix.
 * Deux explications opposées : soit le corpus est plein de petits logements —
 * plausible en centre-ville —, soit la surface est mal extraite et l'on
 * s'abstient à tort sur des logements qui n'en relèvent pas.
 *
 * Ce script ne sort que des tranches de surface, jamais une valeur associée à
 * un dossier : de quoi trancher sans rien recopier.
 *
 *   npx vite-node scripts/surfaces-dpe.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { analyser } from '../src/lib/analyse/index';
import { lignesDePage } from '../src/lib/lignes';
import type { PageTexte } from '../src/lib/modele';

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

const tranches = new Map<string, number>();
const surfaceDuBien = new Map<string, number>();
let fichiers = 0;
let dpeVus = 0;
let sansLettre = 0;

const tranche = (s: number | undefined): string =>
  s === undefined ? 'non lue' : s <= 8 ? '≤ 8 m² (invraisemblable)' : s <= 40 ? '9 à 40 m²' : s <= 80 ? '41 à 80 m²' : '> 80 m²';

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

    const a = analyser(pages);
    const d = a.diagnostics.find((x) => x.type === 'dpe');
    if (d) {
      dpeVus++;
      const fait = d.faits.find((f) => f.libelle === 'Surface de référence')?.valeur;
      const s = fait ? Number(fait.replace(/[^\d,.]/g, '').replace(',', '.')) : undefined;
      const t = tranche(Number.isFinite(s) ? s : undefined);
      tranches.set(t, (tranches.get(t) ?? 0) + 1);

      if (d.schema?.genre === 'dpe' && d.schema.finale === null) sansLettre++;

      // la surface du bien, lue ailleurs dans le dossier : sert de contrôle
      const sb = a.bien.surface;
      const tb = tranche(sb);
      surfaceDuBien.set(tb, (surfaceDuBien.get(tb) ?? 0) + 1);
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
      dpeReconnus: dpeVus,
      dpeSansLettre: sansLettre,
      surfaceLueDansLeDpe: [...tranches].sort(),
      surfaceDuBienDansLeDossier: [...surfaceDuBien].sort()
    },
    null,
    2
  )
);
