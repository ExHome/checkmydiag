/**
 * Le tableau se reconstitue-t-il avec une tolérance plus large — LOCAL.
 *
 * `lignesPositionnees` n'a jamais trouvé un lieu et un état sur la même ligne,
 * sur 55 922 lignes. Deux explications possibles : soit les cellules d'une
 * rangée ne partagent pas la même ordonnée (cellules à hauteurs variables,
 * texte sur deux lignes), soit le regroupement est trop strict.
 *
 * On teste donc le regroupement par bandes, à cinq tolérances. Si aucune ne
 * réunit un lieu et un état, la structure n'y est pas — et il faudra le dire
 * plutôt que d'écrire un extracteur qui devine.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs.
 *
 *   npx vite-node scripts/formes-bandes.ts -- "<dossier>" [nombre]
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

const ETAT = /\b(bon etat|etat d'usage|etat intermediaire|mauvais etat|degrade|non degrade|ep1|ep2|ep3|n1|n2|n3)\b/;
const LIEU = /\b(sejour|cuisine|chambre|salle de bain|sdb|wc|couloir|entree|degagement|cave|garage|combles?|toiture|facade|palier|escalier|balcon|terrasse|buanderie|cellier)\b/;
const MATERIAU = /\b(dalle|colle|conduit|canalisation|plaque|fibre[- ]ciment|flocage|calorifugeage|enduit|joint|mastic|toiture|ardoise|tuyau|gaine|faux plafond|revetement)\b/;
const LISTE = /\bliste [abc]\b/;

const TOLERANCES = [1, 2, 4, 7, 12];

const resultats = TOLERANCES.map((t) => ({
  tolerance: t,
  bandes: 0,
  lieuEtEtat: 0,
  lieuEtMateriau: 0,
  materiauEtEtat: 0,
  troisColonnes: 0,
  dossiers: new Set<number>()
}));

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

      const frags = contenu.items
        .filter((i) => 'str' in i && 'transform' in i)
        .map((i) => {
          const t = (i as { transform: number[] }).transform;
          return { s: (i as { str: string }).str, x: t[4] ?? 0, y: t[5] ?? 0 };
        })
        .filter((f) => f.s.trim());

      for (const r of resultats) {
        // regroupement par bande d'ordonnée
        const bandes = new Map<number, { x: number; s: string }[]>();
        for (const f of frags) {
          const cle = Math.round(f.y / r.tolerance);
          if (!bandes.has(cle)) bandes.set(cle, []);
          bandes.get(cle)!.push({ x: f.x, s: f.s });
        }

        for (const paquet of bandes.values()) {
          const texte = normalise(
            paquet.sort((a, b) => a.x - b.x).map((c) => c.s).join(' ')
          );
          if (texte.length < 8) continue;
          r.bandes++;

          const aLieu = LIEU.test(texte);
          const aEtat = ETAT.test(texte);
          const aMat = MATERIAU.test(texte);
          const aListe = LISTE.test(texte);

          if (aLieu && aEtat) { r.lieuEtEtat++; r.dossiers.add(n); }
          if (aLieu && aMat) r.lieuEtMateriau++;
          if (aMat && aEtat) r.materiauEtEtat++;
          if (aLieu && aMat && (aEtat || aListe)) r.troisColonnes++;
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
      resultats: resultats.map((r) => ({
        tolerance: r.tolerance,
        bandes: r.bandes,
        lieuEtEtat: r.lieuEtEtat,
        lieuEtMateriau: r.lieuEtMateriau,
        materiauEtEtat: r.materiauEtEtat,
        troisColonnes: r.troisColonnes,
        dossiersConcernes: r.dossiers.size
      }))
    },
    null,
    2
  )
);
