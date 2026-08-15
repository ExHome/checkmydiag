/**
 * Comment les rapports concluent-ils leur état termites — LOCAL UNIQUEMENT.
 *
 * Mesuré sur le corpus : treize dossiers sur vingt et un affichent « sa
 * conclusion n'a pas pu être lue ». C'est le plus gros trou du produit — le
 * lecteur voit un diagnostic reconnu, et rien dedans.
 *
 * Le moteur cherche aujourd'hui deux formes : « il n'a pas été repéré … indice
 * … infestation … termites » et sa symétrique. Ce script teste d'autres
 * formulations, écrites ici, pour savoir lesquelles manquent.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs de
 * motifs que j'écris moi-même.
 *
 *   npx vite-node scripts/formes-termites.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { normalise } from '../src/lib/analyse/texte';

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

/**
 * Les formes testées. Les deux premières sont celles que le moteur connaît
 * déjà : elles servent de témoin.
 */
const FORMES: { nom: string; motif: RegExp; sens: string }[] = [
  {
    nom: 'ACTUEL absence : « il n a pas ete repere … indice … infestation … termites »',
    motif: /(?:il n'a pas ete repere|absence)[^.]*indice[^.]*infestation[^.]*termites?/,
    sens: 'absence'
  },
  {
    nom: 'ACTUEL presence : « il a ete repere … indice/infestation … termites »',
    motif: /(?:il a ete repere|presence)[^.]*(?:indice|infestation)[^.]*termites?/,
    sens: 'presence'
  },
  { nom: 'absence : « aucun indice » + termites dans les 200 car.', motif: /aucun indice[\s\S]{0,200}termites?/, sens: 'absence' },
  { nom: 'absence : termites + « aucun indice » dans les 200 car.', motif: /termites?[\s\S]{0,200}aucun indice/, sens: 'absence' },
  { nom: 'absence : « n a pas ete constate »', motif: /n'a pas ete constate[\s\S]{0,150}termites?/, sens: 'absence' },
  { nom: 'absence : « pas de presence de termites »', motif: /pas de presence[\s\S]{0,60}termites?/, sens: 'absence' },
  { nom: 'absence : « negatif »', motif: /termites?[\s\S]{0,120}negatif|negatif[\s\S]{0,120}termites?/, sens: 'absence' },
  { nom: 'absence : « non infeste »', motif: /non infeste/, sens: 'absence' },
  { nom: 'absence : « absence de termites »', motif: /absence[\s\S]{0,40}termites?/, sens: 'absence' },
  { nom: 'absence : « aucune trace »', motif: /aucune trace[\s\S]{0,150}termites?/, sens: 'absence' },
  { nom: 'presence : « presence de termites »', motif: /presence[\s\S]{0,40}termites?/, sens: 'presence' },
  { nom: 'presence : « infestation »', motif: /\binfestation\b/, sens: 'presence ?' },
  { nom: 'agent : « insectes a larves xylophages »', motif: /insectes? a larves xylophages/, sens: 'autre agent' },
  { nom: 'agent : « xylophages »', motif: /xylophages?/, sens: 'autre agent' },
  { nom: 'structure : « etat relatif a la presence de termites »', motif: /etat relatif a la presence de termites/, sens: 'titre' },
  { nom: 'structure : « conclusion »', motif: /\bconclusion\b/, sens: 'titre' },
  { nom: 'structure : case cochee « oui / non »', motif: /termites?[\s\S]{0,80}\b(oui|non)\b/, sens: 'case' }
];

const dossiers = new Map<string, Set<number>>();
const total = new Map<string, number>();
let fichiers = 0;
let avecSectionTermites = 0;

const chemins: string[] = [];
await trouver(racine, chemins, combien);

for (const [n, chemin] of chemins.entries()) {
  let doc;
  try {
    doc = await getDocument({ url: chemin, useSystemFonts: true }).promise;
  } catch {
    continue;
  }

  let sectionVue = false;
  try {
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const contenu = await page.getTextContent();
      const texte = normalise(contenu.items.map((i) => ('str' in i ? i.str : '')).join(' '));
      if (!/termites?/.test(texte)) continue;
      sectionVue = true;

      for (const f of FORMES) {
        if (f.motif.test(texte)) {
          total.set(f.nom, (total.get(f.nom) ?? 0) + 1);
          if (!dossiers.has(f.nom)) dossiers.set(f.nom, new Set());
          dossiers.get(f.nom)!.add(n);
        }
      }
    }
  } catch {
    // illisible
  }

  fichiers++;
  if (sectionVue) avecSectionTermites++;
  await doc.destroy();
}

const lignes = FORMES.map((f) => ({
  forme: f.nom,
  sens: f.sens,
  dossiers: dossiers.get(f.nom)?.size ?? 0,
  occurrences: total.get(f.nom) ?? 0
})).sort((a, b) => b.dossiers - a.dossiers);

console.log(JSON.stringify({ fichiers, avecSectionTermites, lignes }, null, 2));
