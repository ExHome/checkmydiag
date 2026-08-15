/**
 * Quelle forme ont les tableaux de repérage amiante — LOCAL UNIQUEMENT.
 *
 * Le plan de l'amiante ne tient aujourd'hui que sur les listes A/B/C, et une
 * mesure a montré qu'un rapport sur trente seulement les écrit. La matière
 * qu'il faudrait, c'est le tableau de repérage : un matériau, un local, un
 * état de conservation. Avant d'écrire un extracteur, il faut savoir à quoi
 * ces tableaux ressemblent — et ils ne se ressemblent pas tous.
 *
 * ⚠️ Ces rapports contiennent le nom et l'adresse de vraies personnes. Ce
 * script ne recopie AUCUN contenu de dossier : il ne sort que des intitulés de
 * colonnes, des vocabulaires normalisés (« bon état », « liste A »…) et des
 * compteurs. Rien qui désigne un bien ou une personne.
 *
 *   npx vite-node scripts/formes-amiante.ts -- "<dossier>" [nombre]
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

/** Les intitulés de colonnes qu'on croise dans un tableau de repérage. */
const COLONNES = [
  'localisation',
  'local',
  'partie de local',
  'zone',
  'composant',
  'materiau',
  'produit',
  'element',
  'type de materiau',
  'etat de conservation',
  'conservation',
  'resultat',
  'conclusion',
  'presence',
  'liste',
  'photo',
  'prelevement',
  'echantillon',
  'analyse',
  'recommandation',
  'mesure d ordre general',
  'score'
];

/** Le vocabulaire réglementaire des états de conservation. */
const ETATS = [
  'bon etat',
  'etat intermediaire',
  'mauvais etat',
  'degrade',
  'non degrade',
  'ep1',
  'ep2',
  'ep3',
  'n1',
  'n2',
  'n3',
  'ac1',
  'ac2',
  'ec1'
];

/** Les formulations de conclusion, qui disent la présence ou l'absence. */
const CONCLUSIONS = [
  "il n'a pas ete repere",
  'il a ete repere',
  'absence de materiaux',
  'presence de materiaux',
  'aucun materiau',
  'materiaux et produits contenant de l amiante',
  'liste a',
  'liste b',
  'liste c'
];

const compteColonnes = new Map<string, number>();
const compteEtats = new Map<string, number>();
const compteConclusions = new Map<string, number>();
let fichiers = 0;
let avecTableau = 0;
let avecEtat = 0;
let avecConclusion = 0;

const chemins: string[] = [];
await trouver(racine, chemins, combien);

for (const chemin of chemins) {
  let doc;
  try {
    doc = await getDocument({ url: chemin, useSystemFonts: true }).promise;
  } catch {
    continue;
  }

  const vus = { colonne: false, etat: false, conclusion: false };

  try {
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const contenu = await page.getTextContent();
      const brut = contenu.items.map((i) => ('str' in i ? i.str : '')).join(' ');
      const texte = normalise(brut);

      for (const c of COLONNES) {
        if (texte.includes(c)) {
          compteColonnes.set(c, (compteColonnes.get(c) ?? 0) + 1);
          vus.colonne = true;
        }
      }
      for (const e of ETATS) {
        // bornes de mot, sinon « n1 » se trouve dans n'importe quel numéro
        if (new RegExp(`\\b${e}\\b`).test(texte)) {
          compteEtats.set(e, (compteEtats.get(e) ?? 0) + 1);
          vus.etat = true;
        }
      }
      for (const c of CONCLUSIONS) {
        if (texte.includes(c)) {
          compteConclusions.set(c, (compteConclusions.get(c) ?? 0) + 1);
          vus.conclusion = true;
        }
      }
    }
  } catch {
    // un rapport illisible ne fausse pas la mesure
  }

  fichiers++;
  if (vus.colonne) avecTableau++;
  if (vus.etat) avecEtat++;
  if (vus.conclusion) avecConclusion++;
  await doc.destroy();
}

const trier = (m: Map<string, number>) =>
  [...m].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v}× ${k}`);

console.log(
  JSON.stringify(
    {
      fichiers,
      avecIntituleDeColonne: avecTableau,
      avecEtatDeConservation: avecEtat,
      avecFormuleDeConclusion: avecConclusion,
      colonnes: trier(compteColonnes),
      etats: trier(compteEtats),
      conclusions: trier(compteConclusions)
    },
    null,
    2
  )
);
