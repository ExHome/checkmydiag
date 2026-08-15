/**
 * Le tableau de repérage se laisse-t-il lire par la géométrie — LOCAL.
 *
 * Le texte linéaire ne suffit pas : sur 175 mentions « matériaux de la liste
 * A », 159 n'ont aucune conclusion dans les 400 caractères qui suivent. La
 * mention est un en-tête de colonne, et l'ordre de lecture du PDF ne préserve
 * pas les lignes du tableau.
 *
 * Reste la géométrie. `lignesPositionnees` regroupe déjà les fragments par
 * hauteur : une ligne de tableau devrait donc réapparaître entière, avec son
 * local, son matériau et son état sur la même ligne. Cette mesure vérifie si
 * c'est le cas — avant d'écrire quoi que ce soit.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs et le
 * vocabulaire réglementaire que j'écris moi-même ici.
 *
 *   npx vite-node scripts/formes-tableau.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { lignesPositionnees, type Fragment } from '../src/lib/lignes';
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

/** Le vocabulaire réglementaire qu'une ligne de tableau peut porter. */
const ETAT = /\b(bon etat|etat d'usage|etat intermediaire|mauvais etat|degrade|non degrade|ep1|ep2|ep3|n1|n2|n3)\b/;
const PRESENCE_NON = /\b(non|neant|absence|sans objet|aucun)\b/;
const PRESENCE_OUI = /\b(oui|presence|amiante detecte)\b/;
const LIEU = /\b(sejour|cuisine|chambre|salle de bain|sdb|wc|couloir|entree|degagement|cave|garage|combles?|toiture|facade|palier|escalier|balcon|terrasse|buanderie|cellier|local|piece)\b/;
const LISTE = /\bliste ([abc])\b/;

const compte = {
  fichiers: 0,
  fichiersAvecLignesTableau: 0,
  lignesLues: 0,
  lignesAvecEtat: 0,
  lignesAvecLieuEtEtat: 0,
  lignesAvecLieuEtPresence: 0,
  lignesAvecListeEtReponse: 0,
  lignesAvecTroisColonnes: 0
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

  let vuTableau = false;
  try {
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const contenu = await page.getTextContent();

      // Le type Fragment est celui de pdf.js : on passe les items tels quels.
      const frags: Fragment[] = contenu.items.filter(
        (i): i is Fragment => 'str' in i && 'transform' in i
      );

      for (const ligne of lignesPositionnees(frags)) {
        const t = normalise(ligne.texte);
        if (t.length < 6) continue;
        compte.lignesLues++;

        const aEtat = ETAT.test(t);
        const aLieu = LIEU.test(t);
        const aListe = LISTE.test(t);
        const aOui = PRESENCE_OUI.test(t);
        const aNon = PRESENCE_NON.test(t);

        if (aEtat) compte.lignesAvecEtat++;
        if (aLieu && aEtat) {
          compte.lignesAvecLieuEtEtat++;
          vuTableau = true;
        }
        if (aLieu && (aOui || aNon)) compte.lignesAvecLieuEtPresence++;
        if (aListe && (aOui || aNon || aEtat)) compte.lignesAvecListeEtReponse++;
        if (aLieu && aEtat && (aOui || aNon || aListe)) compte.lignesAvecTroisColonnes++;
      }
    }
  } catch {
    // illisible : n'entre pas dans la mesure
  }

  compte.fichiers++;
  if (vuTableau) compte.fichiersAvecLignesTableau++;
  await doc.destroy();
}

console.log(JSON.stringify(compte, null, 2));
