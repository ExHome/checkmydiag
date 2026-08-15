/**
 * Que couvre vraiment l'état parasitaire — LOCAL UNIQUEMENT.
 *
 * Le moteur ne lit que les termites. Or le même rapport porte souvent trois
 * volets — termites, insectes à larves xylophages, champignons lignivores — et
 * une rubrique « constatations diverses ». Un rapport peut donc conclure à
 * l'absence de termites tout en signalant de la mérule ou des capricornes : si
 * l'on n'affiche que le premier volet, on rassure à tort.
 *
 * Ce script compte ce que les rapports contiennent réellement, avant d'écrire
 * la moindre ligne de lecture.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : uniquement des compteurs de
 * motifs que j'écris moi-même.
 *
 *   npx vite-node scripts/formes-parasitaire.ts -- "<dossier>" [nombre]
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

const MOTIFS: { nom: string; motif: RegExp; famille: string }[] = [
  // Les volets
  { famille: 'volet', nom: 'insectes a larves xylophages', motif: /insectes? a larves xylophages/ },
  { famille: 'volet', nom: 'xylophages (seul)', motif: /xylophages?/ },
  { famille: 'volet', nom: 'champignons lignivores', motif: /champignons? lignivores?/ },
  { famille: 'volet', nom: 'merule', motif: /\bmerule/ },
  { famille: 'volet', nom: 'coniophore', motif: /coniophore/ },
  { famille: 'volet', nom: 'pourriture', motif: /pourriture (?:cubique|fibreuse|molle)/ },
  { famille: 'volet', nom: 'constatations diverses', motif: /constatations? diverses?/ },
  { famille: 'volet', nom: 'autres agents de degradation', motif: /autres? agents? (?:de )?degradation/ },

  // Les espèces d'insectes nommées
  { famille: 'espece', nom: 'capricorne', motif: /capricorne/ },
  { famille: 'espece', nom: 'vrillette', motif: /vrillette/ },
  { famille: 'espece', nom: 'lyctus', motif: /lyctus/ },
  { famille: 'espece', nom: 'sirex', motif: /sirex/ },
  { famille: 'espece', nom: 'hesperophane', motif: /hesperophane/ },

  // Les conclusions de ces volets
  { famille: 'conclusion', nom: 'ILX : absence', motif: /(?:absence|pas)[^.]{0,60}insectes? a larves xylophages|insectes? a larves xylophages[^.]{0,80}(?:absence|neant|non)/ },
  { famille: 'conclusion', nom: 'ILX : presence', motif: /presence[^.]{0,60}insectes? a larves xylophages|insectes? a larves xylophages[^.]{0,60}presence/ },
  { famille: 'conclusion', nom: 'champignons : absence', motif: /(?:absence|pas)[^.]{0,60}champignons?|champignons?[^.]{0,80}(?:absence|neant|non)/ },
  { famille: 'conclusion', nom: 'champignons : presence', motif: /presence[^.]{0,60}champignons?|champignons?[^.]{0,60}presence/ },

  // La structure du rapport
  { famille: 'structure', nom: 'etat parasitaire (titre)', motif: /etat parasitaire/ },
  { famille: 'structure', nom: 'zone delimitee par arrete prefectoral', motif: /zone delimitee[^.]{0,60}arrete prefectoral/ },
  { famille: 'structure', nom: 'grille : agent / localisation', motif: /agent[\s\S]{0,60}localisation/ }
];

const dossiers = new Map<string, Set<number>>();
const total = new Map<string, number>();
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

      for (const m of MOTIFS) {
        if (m.motif.test(texte)) {
          total.set(m.nom, (total.get(m.nom) ?? 0) + 1);
          if (!dossiers.has(m.nom)) dossiers.set(m.nom, new Set());
          dossiers.get(m.nom)!.add(n);
        }
      }
    }
  } catch {
    // illisible
  }

  fichiers++;
  await doc.destroy();
}

const parFamille: Record<string, unknown[]> = {};
for (const m of MOTIFS) {
  (parFamille[m.famille] ??= []).push({
    quoi: m.nom,
    dossiers: dossiers.get(m.nom)?.size ?? 0,
    pages: total.get(m.nom) ?? 0
  });
}
for (const f of Object.keys(parFamille)) {
  parFamille[f] = (parFamille[f] as { dossiers: number }[]).sort((a, b) => b.dossiers - a.dossiers);
}

console.log(JSON.stringify({ fichiers, ...parFamille }, null, 2));
