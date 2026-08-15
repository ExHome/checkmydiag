/**
 * Y a-t-il des constats plomb dans le corpus, et que contiennent-ils — LOCAL.
 *
 * Le tableau de bord donne le plomb à zéro sur quarante dossiers. Deux
 * explications, opposées : soit le corpus n'en contient aucun — plausible, le
 * constat n'est dû que pour les logements d'avant 1949 —, soit le moteur les
 * rate tous. Avant de toucher au code, il faut savoir laquelle.
 *
 * Ce script balaie plus large que les autres : tous les PDF, sans filtre de
 * nom, à la recherche du vocabulaire du CREP. Et s'il en trouve, il compte ce
 * qu'ils portent — classes, facteurs de dégradation, présence d'enfants.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs.
 *
 *   npx vite-node scripts/formes-plomb.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { normalise } from '../src/lib/analyse/texte';

const [, , racineArg, combienArg] = process.argv;
const racine = racineArg ?? '.';
const combien = combienArg ? Number(combienArg) : 120;

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
    else if (nom.toLowerCase().endsWith('.pdf')) sortie.push(chemin);
  }
}

const MOTIFS: { famille: string; nom: string; motif: RegExp }[] = [
  { famille: 'presence', nom: 'constat de risque d exposition au plomb', motif: /constat de risque d'exposition au plomb/ },
  { famille: 'presence', nom: 'crep', motif: /\bcrep\b/ },
  { famille: 'presence', nom: 'unite de diagnostic', motif: /unites? de diagnostic/ },

  { famille: 'classes', nom: 'classe 0', motif: /classe\s*0\b/ },
  { famille: 'classes', nom: 'classe 1', motif: /classe\s*1\b/ },
  { famille: 'classes', nom: 'classe 2', motif: /classe\s*2\b/ },
  { famille: 'classes', nom: 'classe 3', motif: /classe\s*3\b/ },

  { famille: 'degradation', nom: 'facteurs de degradation du bati', motif: /facteurs? de degradation/ },
  { famille: 'degradation', nom: 'humidite', motif: /humidite|infiltration|moisissure/ },
  { famille: 'degradation', nom: 'effondrement / plancher', motif: /effondrement|plancher menacant|affaissement/ },
  { famille: 'degradation', nom: 'traces de coulure / ecaillage', motif: /ecaillage|coulure|cloquage|faiencage/ },

  { famille: 'personnes', nom: 'enfant mineur / moins de 6 ans', motif: /enfants? mineurs?|moins de six ans|moins de 6 ans/ },
  { famille: 'personnes', nom: 'saturnisme', motif: /saturnisme/ },
  { famille: 'personnes', nom: 'femme enceinte', motif: /femmes? enceintes?/ },

  { famille: 'suites', nom: 'transmission (prefet, ARS, agence)', motif: /transmis[^.]{0,40}(prefet|agence regionale de sante|ars)/ },
  { famille: 'suites', nom: 'travaux / mesures conservatoires', motif: /mesures? conservatoires?|travaux [^.]{0,30}(plomb|revetements?)/ },
  { famille: 'suites', nom: 'seuil 1 mg/cm2', motif: /1\s*mg\s*\/\s*cm|milligramme par centimetre/ }
];

const dossiers = new Map<string, Set<number>>();
let fichiers = 0;
let avecCrep = 0;

const chemins: string[] = [];
await trouver(racine, chemins, combien);

for (const [n, chemin] of chemins.entries()) {
  let doc;
  try {
    doc = await getDocument({ url: chemin, useSystemFonts: true }).promise;
  } catch {
    continue;
  }

  let creptrouve = false;
  try {
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const contenu = await page.getTextContent();
      const texte = normalise(contenu.items.map((i) => ('str' in i ? i.str : '')).join(' '));

      for (const m of MOTIFS) {
        if (m.motif.test(texte)) {
          if (!dossiers.has(m.nom)) dossiers.set(m.nom, new Set());
          dossiers.get(m.nom)!.add(n);
          if (m.famille === 'presence') creptrouve = true;
        }
      }
    }
  } catch {
    // illisible
  }

  fichiers++;
  if (creptrouve) avecCrep++;
  await doc.destroy();
}

const parFamille: Record<string, unknown[]> = {};
for (const m of MOTIFS) {
  (parFamille[m.famille] ??= []).push({ quoi: m.nom, dossiers: dossiers.get(m.nom)?.size ?? 0 });
}

console.log(JSON.stringify({ fichiersLus: fichiers, dossiersAvecVocabulaireCrep: avecCrep, ...parFamille }, null, 2));
