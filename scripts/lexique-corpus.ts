/**
 * Les mots du métier réellement employés dans les rapports — LOCAL UNIQUEMENT.
 *
 * Dicodiag compte dix-sept entrées, écrites de mémoire. Or le lexique qui
 * compte n'est pas celui qu'on imagine : c'est celui des rapports. Ce script
 * cherche, dans le corpus, les termes techniques d'une liste établie ici, et
 * compte dans combien de dossiers chacun apparaît.
 *
 * Le résultat sert à deux choses : savoir ce qui manque au lexique, et savoir
 * dans quel ordre le compléter — un mot présent dans trente dossiers vaut
 * mieux qu'un mot rare, si joli soit-il.
 *
 * ⚠️ Aucun contenu de dossier n'est recopié : la liste des mots est écrite
 * ici, et la sortie ne contient que des compteurs.
 *
 *   npx vite-node scripts/lexique-corpus.ts -- "<dossier>" [nombre]
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { normalise } from '../src/lib/analyse/texte';

const [, , racineArg, combienArg] = process.argv;
const racine = racineArg ?? '.';
const combien = combienArg ? Number(combienArg) : 40;

/** Les rapports, et eux seuls : voir la note sous cette fonction. */
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

/*
 * Le filtre de nom n'est pas un détail : sans lui, on lit les quarante premiers
 * PDF rencontrés dans l'arborescence — factures, attestations, photos — et la
 * mesure renvoie zéro partout. Ce zéro se lit comme « ces mots n'existent pas »
 * alors qu'on n'a simplement pas ouvert les rapports. La première version de ce
 * script est tombée dans le piège, et a rendu un lexique vide.
 */

/**
 * Les mots à chercher, par famille. Écrits ici, jamais extraits du corpus :
 * c'est ce qui garantit qu'aucun nom propre ni aucune adresse ne remonte.
 */
const MOTS: Record<string, string[]> = {
  'parties visitées': [
    'parties visitees',
    'parties non visitees',
    'locaux non visites',
    'non accessible',
    'inaccessible',
    'sans demontage',
    'sans destruction',
    'a vue',
    'sondage',
    'point de sondage',
    'reserves'
  ],
  termites: [
    'cordonnet',
    'concretions',
    'galerie',
    'galeries-tunnels',
    'termite souterrain',
    'reticulitermes',
    'essaimage',
    'bois deteriore',
    'sonde',
    'poincon',
    'ouvrage bois'
  ],
  amiante: [
    'flocage',
    'calorifugeage',
    'faux plafond',
    'fibrociment',
    'amiante-ciment',
    'liste a',
    'liste b',
    'materiau non degrade',
    'protection physique',
    'evaluation periodique',
    'mesure d empoussierement'
  ],
  plomb: [
    'unite de diagnostic',
    'fluorescence x',
    'revetement',
    'classe 0',
    'classe 3',
    'seuil',
    'saturnisme',
    'facteurs de degradation',
    'notice d information'
  ],
  electricite: [
    'appareil general de commande et de protection',
    'dispositif differentiel',
    'prise de terre',
    'liaison equipotentielle',
    'conducteur',
    'materiel vetuste',
    'volume',
    'socle de prise',
    'fusible',
    'disjoncteur',
    'anomalie',
    'b1',
    'b2',
    'b3'
  ],
  gaz: [
    'robinet de commande',
    'tuyauterie fixe',
    'raccordement',
    'ventilation',
    'amenee d air',
    'evacuation des produits de combustion',
    'conduit de fumee',
    'da',
    'dgi',
    'a2',
    'chaudiere',
    'vmc gaz'
  ],
  dpe: [
    'energie primaire',
    'energie finale',
    'deperdition',
    'pont thermique',
    'inertie',
    'ubat',
    'coefficient de transmission',
    'facteur solaire',
    'methode 3cl',
    'donnees d entree',
    'valeur par defaut'
  ],
  surfaces: [
    'loi carrez',
    'loi boutin',
    'surface habitable',
    'surface de plancher',
    'superficie privative',
    'hauteur sous plafond',
    'emprise au sol',
    'annexe',
    'combles non amenages',
    'veranda',
    'loggia'
  ],
  risques: [
    'plan de prevention',
    'ppri',
    'sismicite',
    'retrait-gonflement',
    'argile',
    'radon',
    'installation classee',
    'pollution des sols',
    'secis',
    'sis',
    'zonage'
  ],
  bati: [
    'charpente',
    'solive',
    'poutre',
    'lambourde',
    'plancher',
    'cloison',
    'doublage',
    'enduit',
    'placoplatre',
    'vide sanitaire',
    'comble perdu',
    'rampant',
    'acrotere',
    'linteau',
    'chevron',
    'panne',
    'appui de fenetre',
    'embrasure',
    'huisserie',
    'plinthe',
    'bati dormant',
    'ouvrant'
  ]
};

const vus = new Map<string, Set<number>>();
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
    const vusIci = new Set<string>();
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const contenu = await page.getTextContent();
      const texte = normalise(contenu.items.map((i) => ('str' in i ? i.str : '')).join(' '));

      /*
       * Bornes de mot, et non `includes`.
       *
       * Second piège de la première version : « da » se trouve dans « dans »,
       * « sis » dans « assis », « annexe » dans « annexes ». La mesure donnait
       * « da » présent dans dix dossiers — c'était le mot « dans ».
       */
      for (const liste of Object.values(MOTS)) {
        for (const mot of liste) {
          const borne = new RegExp(`(?:^|[^a-z0-9])${mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:s?)(?:[^a-z0-9]|$)`);
          if (borne.test(texte)) vusIci.add(mot);
        }
      }
    }
    for (const mot of vusIci) {
      if (!vus.has(mot)) vus.set(mot, new Set());
      vus.get(mot)!.add(n);
    }
  } catch {
    // illisible
  }

  fichiers++;
  await doc.destroy();
}

const sortie: Record<string, { mot: string; dossiers: number }[]> = {};
for (const [famille, liste] of Object.entries(MOTS)) {
  sortie[famille] = liste
    .map((mot) => ({ mot, dossiers: vus.get(mot)?.size ?? 0 }))
    .filter((x) => x.dossiers > 0)
    .sort((a, b) => b.dossiers - a.dossiers);
}

console.log(JSON.stringify({ fichiers, ...sortie }, null, 2));
