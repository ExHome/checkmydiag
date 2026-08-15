/**
 * Les relevés de périmètre captés sont-ils les bons — LOCAL UNIQUEMENT.
 *
 * L'élargissement des intitulés fait remonter trente-trois attestations de
 * surface sur trente-trois, six relevés chacune. C'est trop régulier pour être
 * honnête : on capte probablement autre chose que la rubrique du périmètre —
 * la liste des pièces mesurées, par exemple.
 *
 * Ce script ne sort ni adresse ni nom : il classe les libellés captés par
 * FORME (longueur, présence d'un motif entre parenthèses, mots-clés du
 * périmètre) et compte. C'est assez pour savoir si l'on tient la bonne rubrique.
 *
 *   npx vite-node scripts/verif-perimetre.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { analyser } from '../src/lib/analyse/index';
import { lignesDePage } from '../src/lib/lignes';
import { normalise } from '../src/lib/analyse/texte';
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

/** Ce qu'on attend d'un vrai relevé de périmètre : un motif d'empêchement. */
const EMPECHEMENT =
  /trappe|encombr|meubl|occup|ferm|condamn|inaccessible|non accessible|hauteur|absence|pas d.acces|verrouill|scell/;
/** Ce qui trahit une liste de pièces mesurées plutôt qu'un empêchement. */
const PIECE = /^(sejour|salon|cuisine|chambre|salle|sdb|wc|couloir|entree|degagement|cave|garage|combles?|palier|balcon|terrasse|buanderie|cellier|bureau|dressing|placard)/;

const formes = new Map<string, number>();
let total = 0;
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

    for (const d of analyser(pages).diagnostics) {
      for (const r of d.releves ?? []) {
        if (r.genre !== 'nonVisite') continue;
        total++;
        const l = normalise(r.libelle);
        const cle = [
          d.type,
          EMPECHEMENT.test(l) ? 'motif d empechement' : 'aucun motif',
          PIECE.test(l) ? 'commence par un nom de piece' : 'autre',
          r.ou ? 'avec lieu' : 'sans lieu',
          l.length < 20 ? 'court' : l.length < 60 ? 'moyen' : 'long'
        ].join(' · ');
        formes.set(cle, (formes.get(cle) ?? 0) + 1);
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
      relevesDePerimetre: total,
      formes: [...formes].sort((a, b) => b[1] - a[1]).map(([f, n]) => `${n}× ${f}`)
    },
    null,
    2
  )
);
