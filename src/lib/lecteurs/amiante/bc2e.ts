/**
 * LE CONSTAT AMIANTE **CHEZ BC2E** — sa signature, et sa lecture.
 *
 * *Écrit après lecture intégrale de quatre documents BC2E du corpus DGLM le
 * 21/08/2026 : deux DTA dont un positif, une fiche récapitulative, un DAPP.*
 *
 * ## Ce que BC2E change, et qui rend un lecteur propre indispensable
 *
 * | | LICIEL | BC2E |
 * |---|---|---|
 * | La conclusion | § 1, page 2 | bloc `A`, **page 1** |
 * | Sa numérotation | `1.1 Liste A :` / `1.1 Liste B :` | **aucune liste**, des lettres `A` `B` `C` |
 * | Les non-visités | un tableau | **trois** tableaux distincts |
 * | Les valeurs | texte en clair | **sigles**, légende imprimée dessous |
 * | Le droit en annexe | imprimé **toujours** | imprimé **seulement si positif** |
 *
 * La dernière ligne est la plus importante : « retrait », « confinement »,
 * « empoussièrement » sont du **bruit** chez LICIEL et un **signal** ici. Le
 * même mot, au même endroit, ne prouve pas la même chose selon l'éditeur — et
 * aucune rustine ne réconcilie les deux.
 *
 * ## ⚠️ Le piège propre à BC2E
 *
 * Six états de conclusion, dont **quatre commencent par les mêmes cinq mots** —
 * « il a été repéré des matériaux » — et deux annoncent une ABSENCE :
 *
 *   il a été repéré des matériaux et produits **susceptibles de contenir** de
 *   l'amiante : marquage des matériaux, **ils ne contiennent pas d'amiante** dans :
 *
 * Ce qui tranche est au milieu de la phrase : « contenant » contre
 * « susceptibles de contenir ».
 */
import type { Lecteur, Preuve } from '../socle';
import { conclusionsBC2E } from '../../analyse/amiante.bc2e';
import { normaliser } from '../../analyse/amiante.listes';

/** Sans accents — pour comparer des intitulés, jamais pour restituer. */
const sansAccents = (t: string): string => t.normalize('NFD').replace(/[̀-ͯ]/g, '');
import type {
  IssueAmiante,
  Justification,
  LectureAmiante,
  LimiteAmiante,
  MateriauAmiante,
  MissionAmiante
} from './modele';

/**
 * La signature — et elle est en clair, ce qui est unique dans le corpus.
 *
 * Le pied de page de BC2E porte, sur CHAQUE page : l'éditeur, le numéro de
 * rapport, le volet, la mission et la pagination du volet. C'est la borne la
 * plus sûre rencontrée, et une rubrique à position fixe — pas une marque
 * croisée au hasard du texte.
 */
function reconnait(lignes: readonly string[]): Preuve | null {
  const texte = normaliser(lignes.join(' '));
  if (/membre du r[ée]seau BC2E/i.test(texte)) return { preuve: 'pied de page : « membre du réseau BC2E »' };
  if (/A\s*[-–]\s*CONCLUSIONS DU REP[ÉE]RAGE EFFECTIF/i.test(texte))
    return { preuve: 'bloc « A - CONCLUSIONS DU REPÉRAGE EFFECTIF »' };
  return null;
}

/** La mission — le pied de page la nomme, et le sous-titre la confirme. */
export function missionBC2E(lignes: readonly string[]): MissionAmiante {
  const t = normaliser(lignes.join(' ')).toLowerCase();
  if (/diagnostic amiante \(dapp\)|dossier amiante - parties privatives/.test(t)) return 'DAPP';
  if (/amiante \(dta\)|dossier technique amiante/.test(t)) return 'DTA';
  if (/avant r[ée]alisation de travaux/.test(t) && /code du travail/.test(t)) return 'avant travaux';
  return 'inconnue';
}

const JUSTIF: [RegExp, Justification][] = [
  [/document consult[ée]/i, 'document consulté'],
  [/marquage des mat[ée]riaux/i, 'marquage du matériau'],
  [/jugement personnel|d[ée]cision de l'op[ée]rateur/i, 'jugement de l’opérateur'],
  [/en cours d'analyse/i, 'résultats attendus'],
  [/sondages/i, 'non prélevé']
];

/**
 * Les trois tableaux du bloc `C` — et ils ne disent pas la même chose.
 *
 * `LOCAUX NON VISITES` · `ÉLÉMENTS NON EXAMINÉS` · `Matériaux … pour lesquels
 * des investigations complémentaires sont nécessaires`. Là où LICIEL fond tout
 * dans un seul tableau, BC2E distingue — et on ne recolle pas ce qu'un rapport
 * a pris soin de séparer.
 */
export function limitesBC2E(lignes: readonly string[]): LectureAmiante['limites'] {
  const entrees: LimiteAmiante[] = [];
  let dans: string | null = null;
  let vue = false;
  let neant = true;

  for (const ligneBrute of lignes) {
    const brut = (ligneBrute ?? '').replace(/\s+/g, ' ').trim();
    const n = normaliser(brut).toLowerCase();

    if (/^locaux non visites?$/.test(n)) { dans = 'local'; vue = true; continue; }
    if (/^[ée]l[ée]ments non [ée]xamin[ée]s?$/.test(n)) { dans = 'élément'; vue = true; continue; }
    if (/investigations compl[ée]mentaires sont n[ée]cessaires/.test(n)) { dans = 'matériau'; vue = true; continue; }
    if (/^il est rappel[ée] au propri[ée]taire/.test(n) || /^\d\.\s/.test(n)) { dans = null; continue; }
    if (!dans) continue;

    if (/^etage\s+local/.test(n) || /^étage\s+local/.test(n)) continue;
    if (/^n[ée]ant(\s+n[ée]ant)*$/.test(n)) { dans = null; continue; }
    if (brut.length < 3) continue;
    if (/^(dglm|tel|siret|web|76 cours|amiante \(|fiche recap)/i.test(brut)) continue;
    /*
     * ⚠️ Les titres du bloc C s'étalent sur plusieurs lignes en capitales, et
     * leurs fragments — « COMPLÈTE DE », « le cadre », « matériaux ou » —
     * étaient ramassés comme des locaux. Mesuré le 22/08 sur un DTA réel.
     *
     * Une ligne de tableau porte au moins deux colonnes : un étage ET un local.
     * Un fragment de titre n'en porte qu'une.
     */
    if (!/\s/.test(brut)) continue;
    if (!/^[A-Z0-9]/.test(sansAccents(brut))) continue;

    /*
     * ⚠️ Même règle que chez LICIEL : on n'accepte qu'une ligne de TABLEAU.
     *
     * Les titres du bloc C s'étalent en capitales sur plusieurs lignes, et
     * leurs fragments — « COMPLÈTE DE », « le cadre » — se glissaient dans la
     * liste des locaux non visités. Une ligne du tableau BC2E porte au moins
     * trois colonnes : Étage, Local, Motif.
     */
    const colonnes = brut.split(/\s{2,}/).filter(Boolean);
    if (colonnes.length < 2 && brut.split(/\s+/).length < 3) continue;
    if (brut === brut.toUpperCase() && !/\d/.test(brut)) continue;

    /* « RDC Cour Absence de clé » : étage, local, motif — trois colonnes. */
    const m = brut.match(/^(\S+)\s+(.+?)\s{2,}(.+)$/) ?? brut.match(/^(\S+)\s+(\S+(?:\s\S+)?)\s+(.+)$/);
    neant = false;
    if (m?.[2]) {
      entrees.push({
        quoi: m[2].trim(),
        ...(m[1] ? { ou: m[1] } : {}),
        ...(m[3] ? { pourquoi: m[3].trim() } : {})
      });
    }
    else entrees.push({ quoi: brut });
  }

  return { lue: vue, neant: vue && neant, entrees };
}

export function lireAmianteBC2E(lignes: readonly string[]): LectureAmiante {
  const conclusions = conclusionsBC2E(lignes);

  const materiaux: MateriauAmiante[] = [];
  for (const c of conclusions) {
    const justification = JUSTIF.find(([rx]) => rx.test(c.phrase))?.[1] ?? 'non précisée';
    for (const ou of c.ou) {
      /* `<Local> (<Composant>) : <Localisation>` — la forme du rapport. */
      const m = ou.match(/^(.+?)\s*\((.+?)\)\s*:\s*(.+)$/);
      const local = m?.[1]?.trim();
      const place = m?.[3]?.trim();
      materiaux.push({
        quoi: m?.[2]?.trim() ?? ou,
        ou: [local && place ? `${local} — ${place}` : ou],
        issue: c.etat,
        justification
      });
    }
  }

  /*
   * ⚠️ La fenêtre glissante voit deux fois la même conclusion.
   *
   * `conclusionsBC2E` lit une fenêtre de trois lignes à chaque ligne du bloc :
   * une phrase qui s'étale sur trois lignes est donc reconnue plusieurs fois,
   * avec des fenêtres différentes. Mesuré : quatre fois « Dalle de sol » pour
   * deux matériaux réels. On dédoublonne sur ce qui identifie un matériau —
   * sa désignation et sa localisation.
   */
  const vus = new Set<string>();
  const uniques = materiaux.filter((m) => {
    const cle = `${m.quoi}|${m.ou.join('·')}`;
    if (vus.has(cle)) return false;
    vus.add(cle);
    return true;
  });

  const etats = conclusions.map((c) => c.etat);
  const issue: IssueAmiante = etats.includes('presence')
    ? 'presence'
    : etats.includes('nonConclu')
      ? 'nonConclu'
      : 'absence';

  return {
    mission: missionBC2E(lignes),
    issue,
    phrase: conclusions[0]?.phrase ?? '',
    materiaux: uniques,
    limites: limitesBC2E(lignes),
    /*
     * ⚠️ LE PÉRIMÈTRE N'EST PAS ENCORE LU CHEZ BC2E — et le repli se déclare.
     *
     * Chez LICIEL, les pièces visitées sont au § 3.2.6. Chez BC2E, la carte
     * (`docs/OU-PARSER-AMIANTE.md`) renvoie aux § 4.1/4.2/4.3, dont la
     * disposition n'a pas encore été sondée. `lue: false` veut dire « je n'ai
     * pas lu cette rubrique », jamais « rien n'a été visité » : l'écran masque
     * alors le bloc au lieu d'affirmer un périmètre vide.
     */
    perimetre: { lue: false, pieces: [] }
  };
}

export const LECTEUR_AMIANTE_BC2E: Lecteur<LectureAmiante> = {
  editeur: 'BC2E',
  quoi: 'constat amiante',
  reconnait,
  lire: lireAmianteBC2E
};
