/**
 * Deux règles de fin de section, comparées — LOCAL UNIQUEMENT.
 *
 * Le découpage actuel rattache à la section courante toute page dont l'en-tête
 * n'est pas reconnu. C'est voulu — une annexe, un croquis appartiennent au
 * rapport qui précède. Mais rien n'arrête l'absorption : mesuré, une section
 * termites atteint quarante-neuf pages, deux autres vingt-huit, quand un vrai
 * rapport termites en fait trois à neuf.
 *
 * La règle proposée : une page sans en-tête reconnu ne reste rattachée que si
 * elle porte encore la trace du rapport — son titre, répété en tête ou en pied
 * comme le font tous les modèles. Sinon elle sort de la section.
 *
 * Ce script applique les deux règles au même corpus et compare, avant d'aller
 * toucher au moteur.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs.
 *
 *   npx vite-node scripts/decoupe-comparee.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
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

/** Recopié du moteur pour pouvoir comparer les deux règles côte à côte. */
const MARQUEURS: { type: TypeDiag; entetes: string[] }[] = [
  { type: 'dpe', entetes: ['diagnosticdeperformance', 'auditenergetique'] },
  {
    type: 'plomb',
    entetes: [
      'constatderisquedexpositionauplomb',
      'crepconstatderisque',
      'expositionauplombcrep',
      'reperagedesrevetementscontenantduplomb'
    ]
  },
  {
    type: 'amiante',
    entetes: [
      'reperagedesmateriauxetproduitscontenantdelamiante',
      'rapportdereperageamiante',
      'dossiertechniqueamiante',
      'constatamianteavantvente',
      'etatmentiondelapresencedamiante'
    ]
  },
  {
    type: 'electricite',
    entetes: [
      'etatdelinstallationinterieuredelectricite',
      'etatdesinstallationsinterieuresdelectricite',
      'etatdelinstallationelectrique'
    ]
  },
  {
    type: 'gaz',
    entetes: [
      'etatdelinstallationinterieuredegaz',
      'etatdesinstallationsinterieuresdegaz',
      'etatdelinstallationgaz'
    ]
  },
  {
    type: 'termites',
    entetes: ['etatrelatifalapresencedetermites', 'etatparasitaire', 'rapportdereperagetermites']
  },
  {
    type: 'erp',
    entetes: [
      'etatdesrisquesetpollutions',
      'etatdesrisquesreglemente',
      'etatdesrisquesnaturelsminiersettechnologiques'
    ]
  },
  {
    type: 'carrez',
    entetes: [
      'mesurageloicarrez',
      'attestationdesuperficie',
      'attestationdesurfacehabitable',
      'attestationdesurface',
      'certificatdesuperficie',
      'certificatdesurfacehabitable',
      'loicarrez',
      'loiboutin',
      'mesurageloiboutin'
    ]
  },
  {
    type: 'assainissement',
    entetes: ['diagnosticassainissement', 'controledelinstallationdassainissement', 'assainissementnoncollectif']
  }
];

const typeDeLaPage = (page: PageTexte): TypeDiag | null => {
  const entete = compact(page.lignes.slice(0, 4).join(' '));
  if (!entete) return null;
  for (const m of MARQUEURS) if (m.entetes.some((e) => entete.includes(e))) return m.type;
  return null;
};

const estPageDeGarde = (page: PageTexte): boolean => {
  const colle = compact(page.lignes.join(' '));
  return MARQUEURS.filter((m) => m.entetes.some((e) => colle.includes(e))).length >= 4;
};

/** La trace du rapport, cherchée dans la page entière et non dans son en-tête. */
const porteLaTrace = (page: PageTexte, type: TypeDiag): boolean => {
  const colle = compact(page.lignes.join(' '));
  const m = MARQUEURS.find((x) => x.type === type);
  return m ? m.entetes.some((e) => colle.includes(e)) : false;
};

/** Découpe selon l'une ou l'autre règle, et renvoie la taille de chaque section. */
function tailles(pages: PageTexte[], ferme: boolean): Map<TypeDiag, number> {
  const res = new Map<TypeDiag, number>();
  let courante: TypeDiag | null = null;

  for (const page of pages) {
    if (estPageDeGarde(page)) {
      courante = null;
      continue;
    }
    const type = typeDeLaPage(page);
    if (type) courante = type;
    else if (ferme && courante && !porteLaTrace(page, courante)) courante = null;

    if (courante) res.set(courante, (res.get(courante) ?? 0) + 1);
  }
  return res;
}

const compte = {
  fichiers: 0,
  actuel: { sections: 0, pagesTotales: 0, sectionsEnormes: 0, plusGrande: 0 },
  ferme: { sections: 0, pagesTotales: 0, sectionsEnormes: 0, plusGrande: 0 },
  sectionsPerdues: 0,
  sectionsGagnees: 0
};

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

    const a = tailles(pages, false);
    const f = tailles(pages, true);

    for (const [, n] of a) {
      compte.actuel.sections++;
      compte.actuel.pagesTotales += n;
      if (n > 20) compte.actuel.sectionsEnormes++;
      if (n > compte.actuel.plusGrande) compte.actuel.plusGrande = n;
    }
    for (const [, n] of f) {
      compte.ferme.sections++;
      compte.ferme.pagesTotales += n;
      if (n > 20) compte.ferme.sectionsEnormes++;
      if (n > compte.ferme.plusGrande) compte.ferme.plusGrande = n;
    }

    for (const t of a.keys()) if (!f.has(t)) compte.sectionsPerdues++;
    for (const t of f.keys()) if (!a.has(t)) compte.sectionsGagnees++;
  } catch {
    // illisible
  }

  compte.fichiers++;
  await doc.destroy();
}

console.log(JSON.stringify(compte, null, 2));
