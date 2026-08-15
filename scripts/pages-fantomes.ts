/**
 * Que sont les pages qui fabriquent un diagnostic vide — LOCAL UNIQUEMENT.
 *
 * Treize dossiers produisent une section termites d'une seule page, sans corps
 * de rapport ni conclusion : le produit y affiche « conclusion non lue » alors
 * qu'il n'y a pas de rapport termites du tout.
 *
 * Hypothèse : ce sont des pages de sommaire ou de bordereau, qui énumèrent les
 * diagnostics du dossier. Le découpage écarte déjà les pages de garde — celles
 * qui touchent quatre marqueurs ou plus. Ces pages-là en touchent peut-être
 * deux ou trois, et passent entre les mailles.
 *
 * Ce script compte, pour chaque page qui ouvre une section d'une seule page,
 * combien de marqueurs distincts elle porte. Si le compte est de deux ou trois,
 * le seuil est le bon endroit où corriger.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs.
 *
 *   npx vite-node scripts/pages-fantomes.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { decouper } from '../src/lib/analyse/decoupe';
import { lignesDePage } from '../src/lib/lignes';
import { compact } from '../src/lib/analyse/texte';
import type { PageTexte, TypeDiag } from '../src/lib/modele';

const [, , racineArg, combienArg] = process.argv;
const racine = racineArg ?? '.';
const combien = combienArg ? Number(combienArg) : 40;
const INTERESSANT = /^(DDT|RAPPORT|DPE|CREP|ERP|DAPP)[-_ ]/i;

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

/** Les mêmes titres que le découpage, pour compter ce qu'une page en porte. */
const TITRES: Record<string, string[]> = {
  dpe: ['diagnosticdeperformance', 'auditenergetique'],
  plomb: ['constatderisquedexpositionauplomb', 'crepconstatderisque', 'expositionauplombcrep'],
  amiante: ['reperagedesmateriauxetproduitscontenantdelamiante', 'rapportdereperageamiante', 'dossiertechniqueamiante'],
  electricite: ['etatdelinstallationinterieuredelectricite', 'etatdesinstallationsinterieuresdelectricite'],
  gaz: ['etatdelinstallationinterieuredegaz', 'etatdesinstallationsinterieuresdegaz'],
  termites: ['etatrelatifalapresencedetermites', 'etatparasitaire', 'rapportdereperagetermites'],
  erp: ['etatdesrisquesetpollutions', 'etatdesrisquesreglemente'],
  carrez: ['mesurageloicarrez', 'attestationdesuperficie', 'attestationdesurfacehabitable', 'loicarrez'],
  assainissement: ['diagnosticassainissement', 'assainissementnoncollectif']
};

/** Ce que porte un vrai rapport, au-delà de son titre. */
const CORPS = /(?:parties? (?:visitees?|non visitees?)|charpente|arrete prefectoral|ouvrage|methodologie|conclusion)/;

const parNbMarqueurs = new Map<number, number>();
const parNbLignes = new Map<string, number>();
let sectionsDUnePage = 0;
let dontSansCorps = 0;
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

  try {
    const pages: PageTexte[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const contenu = await page.getTextContent();
      const items = contenu.items.filter((i) => 'str' in i && 'transform' in i);
      pages.push({ numero: p, lignes: lignesDePage(items as never) });
    }

    for (const section of decouper(pages).sections) {
      if (section.pages.length !== 1) continue;
      const page = section.pages[0];
      if (!page) continue;

      sectionsDUnePage++;
      const colle = compact(page.lignes.join(' '));

      // combien de diagnostics distincts cette page nomme-t-elle ?
      let marqueurs = 0;
      for (const titres of Object.values(TITRES)) {
        if (titres.some((t) => colle.includes(t))) marqueurs++;
      }
      parNbMarqueurs.set(marqueurs, (parNbMarqueurs.get(marqueurs) ?? 0) + 1);

      const n = page.lignes.length;
      const tranche = n < 10 ? '< 10 lignes' : n < 25 ? '10-24 lignes' : n < 60 ? '25-59 lignes' : '60+ lignes';
      parNbLignes.set(tranche, (parNbLignes.get(tranche) ?? 0) + 1);

      if (!CORPS.test(colle.replace(/([a-z])([A-Z])/g, '$1 $2'))) dontSansCorps++;
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
      sectionsDUnePage,
      dontSansCorpsDeRapport: dontSansCorps,
      marqueursPortesParLaPage: [...parNbMarqueurs]
        .sort((a, b) => a[0] - b[0])
        .map(([m, n]) => `${n} pages nomment ${m} diagnostic(s)`),
      tailleDeLaPage: [...parNbLignes].map(([t, n]) => `${n} pages · ${t}`)
    },
    null,
    2
  )
);
