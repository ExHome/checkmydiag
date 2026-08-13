/**
 * Banc de calibration — à lancer à la main, jamais en CI.
 *
 *   npx vitest run calibration
 *
 * Échantillonne de vrais rapports de chaque famille et imprime ce que le moteur
 * en tire. Sert à repérer les verdicts absurdes (« aucun » partout, « bon »
 * partout) que douze fichiers ne montreraient pas.
 *
 * Les rapports ne sont pas dans le dépôt : ils contiennent des données
 * personnelles. Rien n'est copié, rien n'est écrit — seulement lu.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { lignesDePage, type PageTexte } from '../lignes';
import { analyser } from './index';
import type { TypeDiag } from '../modele';

const RACINE = process.env.CMD_CALIB_DIR ?? '';
const disponible = RACINE.length > 0 && existsSync(RACINE);

/**
 * Familles de rapports à couvrir, avec le nombre de fichiers échantillonnés.
 *
 * Une version précédente échantillonnait par nom de fichier — `ELEC*.pdf`,
 * `GAZ*.pdf`, `CREP*.pdf`. Sur un vrai fonds de diagnostiqueur, ces fichiers
 * n'existent pas : on ne remet pas au client un PDF par diagnostic, on lui
 * remet un dossier technique qui les contient tous. Six familles sur sept
 * tiraient donc zéro fichier, et la calibration de l'électricité, du gaz et de
 * l'assainissement n'a jamais eu lieu, sans que rien ne le signale.
 *
 * On échantillonne donc les deux documents qui existent, et c'est le
 * récapitulatif par type qui dit ce qui est lu et ce qui ne l'est pas.
 */
const FAMILLES: { nom: string; motif: RegExp; combien: number }[] = [
  { nom: 'dossier technique', motif: /^DDT/i, combien: 30 },
  { nom: 'audit énergétique', motif: /^AUDIT/i, combien: 10 }
];

/** Ce qu'un dossier technique complet contient presque toujours. */
const ATTENDUS: TypeDiag[] = ['dpe', 'electricite', 'amiante', 'plomb', 'termites', 'erp'];

function fichiers(): string[] {
  return readdirSync(RACINE, { recursive: true, encoding: 'utf8' })
    .filter((f: string) => f.toLowerCase().endsWith('.pdf') && !/_en_attente/i.test(f))
    .map((f: string) => join(RACINE, f));
}

async function pagesDe(chemin: string): Promise<PageTexte[]> {
  const donnees = new Uint8Array(readFileSync(chemin));
  // verbosity 0 : sans ça, les polices exotiques des rapports noient la sortie
  // du banc sous des centaines de « TT: undefined function ».
  const pdf = await getDocument({ data: donnees, useSystemFonts: true, verbosity: 0 }).promise;
  const pages: PageTexte[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const contenu = await page.getTextContent();
    const items: { str: string; transform: number[] }[] = [];
    for (const item of contenu.items) {
      if ('str' in item) items.push({ str: item.str, transform: item.transform });
    }
    pages.push({ numero: n, lignes: lignesDePage(items) });
  }
  await pdf.destroy();
  return pages;
}

describe.skipIf(!disponible)('calibration sur rapports réels', () => {
  it('produit un verdict exploitable pour chaque famille', async () => {
    const tous = fichiers();
    const compte = new Map<string, number>();
    const muets: string[] = [];
    /** Fichiers que pdf.js refuse d'ouvrir : vides, tronqués, protégés. */
    const illisibles: string[] = [];
    /** Par type : combien de fois lu, d'où, et combien de fois sans verdict. */
    const couverture = new Map<TypeDiag, { vu: number; synthese: number; neutre: number }>();
    /** Diagnostics annoncés par le sommaire que le moteur ne sait pas lire. */
    const ignores = new Map<string, number>();
    /** Diagnostics attendus dans un dossier technique et pourtant absents. */
    const absents = new Map<TypeDiag, number>();
    /** Réclamations « il manque ce diagnostic », par famille de document. */
    const reclamations = new Map<string, number>();
    let analyses = 0;
    let dossiers = 0;

    for (const famille of FAMILLES) {
      const echantillon = tous.filter((f) => famille.motif.test(f.split('\\').pop() ?? '')).slice(0, famille.combien);
      console.log(`\n--- ${famille.nom} (${echantillon.length} fichiers) ---`);

      for (const fichier of echantillon) {
        const nom = fichier.split('\\').pop() ?? '';

        // Un dossier de travail réel contient des fichiers vides ou tronqués.
        // Le banc les note et continue : un seul PDF abîmé ne doit pas priver
        // de calibration les six familles suivantes.
        let pages: PageTexte[];
        try {
          pages = await pagesDe(fichier);
        } catch (e) {
          illisibles.push(`${nom} — ${e instanceof Error ? e.message : 'erreur inconnue'}`);
          console.log(`  ${nom.slice(0, 42).padEnd(44)} (illisible)`);
          continue;
        }

        const analyse = analyser(pages);
        analyses++;

        const resume = analyse.diagnostics
          .map((d) => `${d.type}:${d.gravite}${d.source === 'synthese' ? '*' : ''}`)
          .join(' ');
        console.log(`  ${nom.slice(0, 42).padEnd(44)} ${resume || '(rien)'}`);

        // Une alerte est le verdict le plus lourd du site : on relit chacune.
        for (const d of analyse.diagnostics.filter((x) => x.gravite === 'alerte')) {
          console.log(`      ⚠ ${d.type} : ${d.verdict.slice(0, 150)}`);
        }
        // Les péremptions sont légion sur un fonds ancien et n'apprennent rien ;
        // une incohérence inventée, elle, ferait douter d'un dossier sain.
        for (const c of analyse.controles.filter((x) => x.genre === 'incoherence')) {
          console.log(`      ⌾ ${c.titre} — ${c.explication.slice(0, 110)}`);
        }

        // Ce que le site réclame au dossier. Chaque réclamation doit être juste :
        // c'est le contrôle qui donne son nom au site, et une seule fausse
        // alerte suffit à faire douter le lecteur de tout le reste.
        for (const c of analyse.controles.filter((x) => x.genre === 'manque')) {
          const cle = `${famille.nom} / ${c.type ?? '?'}`;
          reclamations.set(cle, (reclamations.get(cle) ?? 0) + 1);
        }

        if (analyse.diagnostics.length === 0) muets.push(fichier);
        for (const d of analyse.diagnostics) {
          const cle: `${TypeDiag}:${string}` = `${d.type}:${d.gravite}`;
          compte.set(cle, (compte.get(cle) ?? 0) + 1);

          const suivi = couverture.get(d.type) ?? { vu: 0, synthese: 0, neutre: 0 };
          suivi.vu++;
          if (d.source === 'synthese') suivi.synthese++;
          if (d.gravite === 'neutre') suivi.neutre++;
          couverture.set(d.type, suivi);
        }

        // Ce que le sommaire annonce et que le moteur laisse passer : c'est la
        // liste des extracteurs qui manquent, dite par les rapports eux-mêmes.
        for (const t of analyse.nonExploites) ignores.set(t, (ignores.get(t) ?? 0) + 1);

        if (famille.nom === 'dossier technique') {
          dossiers++;
          const trouves = new Set(analyse.diagnostics.map((d) => d.type));
          for (const attendu of ATTENDUS) {
            if (!trouves.has(attendu)) absents.set(attendu, (absents.get(attendu) ?? 0) + 1);
          }
        }
      }
    }

    console.log('\n--- récapitulatif ---');
    for (const [cle, n] of [...compte.entries()].sort()) console.log(`  ${cle.padEnd(26)} ${n}`);
    console.log(`  rapports sans aucun diagnostic : ${muets.length} / ${analyses}`);
    if (illisibles.length) {
      console.log(`  fichiers non ouvrables : ${illisibles.length}`);
      for (const f of illisibles) console.log(`      ✗ ${f}`);
    }

    // La carte de ce qui reste à faire : un type lu surtout « par la synthèse »
    // n'est pas vraiment lu — on recopie la page de garde du dossier au lieu
    // d'ouvrir le rapport. Un type « sans verdict » est reconnu mais pas compris.
    console.log(`\n--- couverture par diagnostic (${dossiers} dossiers techniques) ---`);
    console.log(`  ${'type'.padEnd(16)} ${'lu'.padStart(4)} ${'via synthèse'.padStart(13)} ${'sans verdict'.padStart(13)} ${'absent'.padStart(7)}`);
    for (const type of ATTENDUS.concat(['gaz', 'carrez', 'assainissement'])) {
      const c = couverture.get(type) ?? { vu: 0, synthese: 0, neutre: 0 };
      console.log(
        `  ${type.padEnd(16)} ${String(c.vu).padStart(4)} ${String(c.synthese).padStart(13)} ${String(c.neutre).padStart(13)} ${String(absents.get(type) ?? 0).padStart(7)}`
      );
    }

    console.log('\n--- réclamations « il manque ce diagnostic » ---');
    for (const [cle, n] of [...reclamations.entries()].sort()) console.log(`  ${cle.padEnd(34)} ${n}`);
    if (!reclamations.size) console.log('  aucune');

    if (ignores.size) {
      console.log('\n--- annoncés au sommaire, non lus ---');
      for (const [t, n] of [...ignores.entries()].sort((a, b) => b[1] - a[1])) {
        console.log(`  ${t.slice(0, 60).padEnd(62)} ${n}`);
      }
    }

    // Un moteur qui ne reconnaît rien sur la moitié des rapports est cassé.
    expect(muets.length).toBeLessThan(analyses / 2);
  }, 600_000);
});
