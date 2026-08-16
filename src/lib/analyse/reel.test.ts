/**
 * Épreuve de vérité : on rejoue le moteur sur de vrais rapports.
 *
 * Les PDF ne sont pas dans le dépôt — ils contiennent le nom et l'adresse de
 * vraies personnes. Pointez le test vers les vôtres avec CMD_PDF_DIR.
 *
 * ── Pourquoi il ne tournait pas ─────────────────────────────────────────────
 *
 * Il ne lisait qu'un dossier PLAT, alors que les rapports vivent dans une
 * arborescence rangée par client. Faute de trouver quoi que ce soit, il se
 * sautait — et deux tests « skipped » au milieu d'une suite verte de 352 ne
 * réveillent personne. Le moteur n'a donc jamais été confronté aux 12 298
 * dossiers disponibles.
 *
 * Il descend maintenant l'arborescence. Le défaut valait d'être noté : un test
 * qui s'abstient en silence est pire que pas de test du tout, parce qu'il
 * occupe la place de celui qu'on aurait écrit.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { lignesDePage, type PageTexte } from '../lignes';
import { analyser } from './index';

const DOSSIER = process.env.CMD_PDF_DIR ?? '';
const disponible = DOSSIER.length > 0 && existsSync(DOSSIER);

/**
 * Tous les rapports de l'arborescence, à plat.
 *
 * Bornée en profondeur et en nombre : le corpus réel compte des dizaines de
 * milliers de fichiers, et une épreuve qui met un quart d'heure à démarrer ne
 * se lance jamais.
 */
function rapportsDe(racine: string, profondeur = 0, trouves: string[] = []): string[] {
  if (profondeur > 6 || trouves.length >= 400) return trouves;
  let entrees: string[];
  try {
    entrees = readdirSync(racine);
  } catch {
    return trouves;
  }
  for (const e of entrees) {
    if (e.startsWith('.')) continue;
    const chemin = join(racine, e);
    let est;
    try {
      est = statSync(chemin);
    } catch {
      continue;
    }
    if (est.isDirectory()) rapportsDe(chemin, profondeur + 1, trouves);
    /* Les brouillons non signés ne comptent pas : ce n'est pas ce qu'un
       particulier recevra. */
    else if (/\.pdf$/i.test(e) && /IMO|DDT/i.test(e) && !/en_attente/i.test(e)) {
      trouves.push(chemin);
    }
  }
  return trouves;
}

async function pagesDe(chemin: string): Promise<PageTexte[]> {
  const donnees = new Uint8Array(readFileSync(chemin));
  const pdf = await getDocument({ data: donnees, useSystemFonts: true, verbosity: 0 }).promise;
  const pages: PageTexte[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const contenu = await page.getTextContent();
    pages.push({ numero: n, lignes: lignesDePage(contenu.items.filter((i: unknown) => typeof i === 'object' && i !== null && 'str' in i) as never) });
  }
  await pdf.destroy();
  return pages;
}

describe.skipIf(!disponible)('rapports réels', () => {
  /*
   * On ne garde que les vrais rapports : le dossier de travail contient aussi
   * des documentations ADEME, des supports de formation, des factures.
   *
   * Les rapports sont numérotés dans la sortie, jamais nommés. Les fichiers du
   * corpus portent le nom du client dans leur intitulé — l'afficher en console
   * le ferait ressortir dans un journal de test, puis dans un copier-coller.
   * Ce que cette épreuve doit produire, ce sont des types et des gravités.
   */
  const tous = disponible ? rapportsDe(DOSSIER) : [];

  /*
   * Un pas régulier, jamais les douze premiers.
   *
   * Les dossiers sont rangés par client : prendre le début du tri revient à
   * n'interroger qu'une poignée d'immeubles, souvent du même cabinet et de la
   * même année. Un échantillon qui ne varie pas ne mesure rien.
   */
  const pas = Math.max(1, Math.floor(tous.length / 12));
  const fichiers = tous.filter((_, i) => i % pas === 0).slice(0, 12);

  it('trouve au moins un diagnostic dans la majorité des rapports', async () => {
    let avecDiag = 0;
    const details: string[] = [];

    for (const fichier of fichiers) {
      // Un fichier vide ou tronqué se signale et ne fait pas tomber l'épreuve :
      // ce que l'on mesure ici, c'est ce que le moteur tire d'un rapport lisible.
      let analyse;
      try {
        analyse = analyser(await pagesDe(fichier));
      } catch (e) {
        details.push(`#${details.length + 1} → illisible (${e instanceof Error ? e.message : '?'})`);
        continue;
      }
      if (analyse.diagnostics.length > 0) avecDiag++;
      details.push(
        `#${details.length + 1} → ${
          analyse.diagnostics
            .map((d) => {
              const detail =
                d.schema?.genre === 'dpe'
                  ? `[${d.schema.finale ?? '?'} | ${d.schema.energie?.valeur ?? '?'} kWh | ${d.schema.climat?.valeur ?? '?'} CO2]`
                  : '';
              return `${d.type}:${d.gravite}${detail}`;
            })
            .join(', ') || 'aucun'
        }`
      );
    }

    console.log(details.join('\n'));
    expect(avecDiag).toBeGreaterThanOrEqual(Math.ceil(fichiers.length * 0.7));
  }, 120_000);
});
