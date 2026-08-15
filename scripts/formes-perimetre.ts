/**
 * Comment les rapports disent ce qu'ils n'ont pas pu voir — LOCAL UNIQUEMENT.
 *
 * C'est la rubrique la plus importante d'un diagnostic, et la moins lue : les
 * parties non visitées, et pourquoi. « Rien trouvé » et « rien trouvé, mais les
 * combles étaient fermés » ne veulent pas dire la même chose.
 *
 * Le moteur ne la lit que pour l'électricité et le gaz, avec une seule
 * formulation. Ce script cherche toutes celles qu'on peut imaginer, pour savoir
 * lesquelles existent vraiment et dans combien de dossiers.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs de
 * motifs écrits ici.
 *
 *   npx vite-node scripts/formes-perimetre.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { normalise } from '../src/lib/analyse/texte';

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

const FORMES: { nom: string; motif: RegExp }[] = [
  // Ce que le moteur reconnaît aujourd'hui
  { nom: 'ACTUEL « parties … n ayant pu être visitées »', motif: /n'ayant pu etre visit[ée]es/ },
  { nom: 'ACTUEL « non visitées et justification »', motif: /non visit[ée]es et justification/ },

  // Les autres formulations plausibles
  { nom: '« parties non visitées »', motif: /parties? non visit[ée]es?/ },
  { nom: '« locaux non visités »', motif: /locaux non visit[ée]s/ },
  { nom: '« pièces non visitées »', motif: /pi[eè]ces non visit[ée]es/ },
  { nom: '« parties visitées »', motif: /parties? visit[ée]es?/ },
  { nom: '« liste des locaux visités »', motif: /liste des locaux/ },
  { nom: '« zones non contrôlées »', motif: /zones? non contr[ôo]l[ée]es?/ },
  { nom: '« éléments non contrôlés »', motif: /[ée]l[ée]ments? non contr[ôo]l[ée]s?/ },
  { nom: '« non accessible »', motif: /non accessible/ },
  { nom: '« inaccessible »', motif: /inaccessible/ },
  { nom: '« n a pu être contrôlé »', motif: /n'a (?:pas )?pu etre (?:contr[ôo]l|v[ée]rifi|examin|inspect)/ },
  { nom: '« absence de trappe »', motif: /absence de trappe|trappe (?:condamnee|inexistante|non ouverte)/ },
  { nom: '« encombré »', motif: /encombr[ée]/ },
  { nom: '« occupé / meublé »', motif: /local occup[ée]|mobilier|meubl[ée]/ },
  { nom: '« hauteur / échafaudage »', motif: /hauteur inaccessible|echafaudage|nacelle/ },
  { nom: '« motif » / « justification »', motif: /\bmotifs?\b|\bjustifications?\b/ },
  { nom: '« néant » dans la rubrique', motif: /non visit[ée]es?[\s\S]{0,80}neant/ },

  // La contrepartie : ce qui a été vu
  { nom: '« ensemble des pièces »', motif: /ensemble des pi[eè]ces|toutes les pi[eè]ces/ },
  { nom: '« périmètre de la mission »', motif: /perimetre de la mission|objet de la mission|etendue de la mission/ }
];

const dossiers = new Map<string, Set<number>>();
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
      const texte = normalise(contenu.items.map((i) => ('str' in i ? i.str : '')).join(' '));

      for (const f of FORMES) {
        if (f.motif.test(texte)) {
          if (!dossiers.has(f.nom)) dossiers.set(f.nom, new Set());
          dossiers.get(f.nom)!.add(n);
        }
      }
    }
  } catch {
    // illisible
  }

  fichiers++;
  await doc.destroy();
}

const lignes = FORMES.map((f) => ({ forme: f.nom, dossiers: dossiers.get(f.nom)?.size ?? 0 })).sort(
  (a, b) => b.dossiers - a.dossiers
);

console.log(JSON.stringify({ fichiers, lignes }, null, 2));
