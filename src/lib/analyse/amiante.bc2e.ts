/**
 * LE CONSTAT AMIANTE **CHEZ BC2E** — et lui seul.
 *
 * ⚠️ Rangé par éditeur, conformément à `docs/ODM-LECTEURS-PAR-EDITEUR.md` :
 * « un lecteur par éditeur, choisi sur signature, jamais un lecteur unique
 * rafistolé ». Rien ici ne vaut chez LICIEL, et réciproquement — la carte des
 * deux est dans `docs/OU-PARSER-AMIANTE.md`.
 *
 * CE QUI REND UN LECTEUR PROPRE INDISPENSABLE. Quatre volets BC2E lus en
 * entier le 21/08/2026 :
 *
 *   — la conclusion n'est pas au § 1 de la page 2, mais dans un bloc
 *     `A - CONCLUSIONS DU REPÉRAGE EFFECTIF` **en page 1** ;
 *   — il n'y a **aucun numéro de liste** : ni « Liste A : », ni « Liste B : ».
 *     Le lecteur LICIEL n'y trouve donc rien du tout ;
 *   — les résultats détaillés sont en **sigles** (`JPOR`, `MM`, `DOC`, `RASP`,
 *     `MPPNCA`, `MPSCA`), avec leur légende imprimée sous le tableau ;
 *   — et surtout : le droit de l'amiante n'est imprimé **que s'il y a un
 *     positif**, là où LICIEL l'imprime toujours. Les mots « retrait »,
 *     « confinement », « empoussièrement » sont donc ici un SIGNAL, quand ils
 *     sont un bruit chez LICIEL.
 *
 * ⚠️⚠️ LE PIÈGE PROPRE À BC2E. Six états de conclusion, dont **quatre
 * commencent par les mêmes cinq mots** — « il a été repéré des matériaux » — et
 * deux d'entre eux annoncent une ABSENCE :
 *
 *   il a été repéré des matériaux et produits **susceptibles de contenir** de
 *   l'amiante : marquage des matériaux, **ils ne contiennent pas d'amiante** dans :
 *
 * Ce qui tranche est au milieu de la phrase : « contenant » contre
 * « susceptibles de contenir ». Un lecteur qui cherche l'ouverture annonce de
 * l'amiante dans quatre cas sur six, dont deux où le rapport dit le contraire.
 */
import type { Diagnostic, Fait } from '../modele';
import type { Contexte } from './lecteurs';
import { normaliser } from './amiante.listes';

/** Ce que le bloc A de la page 1 établit. */
export type EtatBC2E = 'presence' | 'absence' | 'nonConclu';

export interface ConclusionBC2E {
  readonly etat: EtatBC2E;
  /** La phrase du rapport qui l'établit, entière, jamais reformulée. */
  readonly phrase: string;
  /** Les localisations citées à la suite, sous la forme du rapport. */
  readonly ou: readonly string[];
}

/**
 * Les six états du bloc `A - CONCLUSIONS DU REPÉRAGE EFFECTIF`.
 *
 * L'ordre des essais est celui de la sûreté : on écarte d'abord ce qui n'est
 * pas une présence, parce que les formulations se recouvrent.
 */
const ETATS: { readonly rx: RegExp; readonly etat: EtatBC2E }[] = [
  // « on ne sait pas encore » — le laboratoire n'a pas rendu.
  { rx: /pr[ée]l[èe]vement\(?s?\)?\s+amiante\s+en cours d'analyse/i, etat: 'nonConclu' },
  // « il faut sonder » — rien n'a encore été prélevé.
  { rx: /susceptibles? de contenir de l'amiante pour lesquels des sondages/i, etat: 'nonConclu' },
  // ⚠️ Une ABSENCE écrite avec les mots d'une présence.
  { rx: /susceptibles? de contenir de l'amiante\s*:?\s*marquage des mat[ée]riaux/i, etat: 'absence' },
  { rx: /ils ne contiennent pas d'amiante/i, etat: 'absence' },
  // Les présences, établies sur jugement ou sur pièce.
  { rx: /il a [ée]t[ée] rep[ée]r[ée] des mat[ée]riaux et produits contenant de l'amiante/i, etat: 'presence' },
  // L'absence pure et simple.
  { rx: /il n'?a pas [ée]t[ée] rep[ée]r[ée] de mat[ée]riaux/i, etat: 'absence' }
];

/**
 * Lire le bloc A — la conclusion, page 1.
 *
 * **Bornes** : de la ligne `A - CONCLUSIONS DU REPÉRAGE EFFECTIF` à la ligne
 * `B - OBLIGATIONS ET RECOMMANDATIONS`. Un rapport peut porter plusieurs états
 * à la fois : un matériau marqué sans amiante ET un autre restant à sonder.
 */
export function conclusionsBC2E(lignes: readonly string[]): ConclusionBC2E[] {
  const out: ConclusionBC2E[] = [];
  let dans = false;

  for (let i = 0; i < lignes.length; i++) {
    const n = normaliser(lignes[i] ?? '');
    if (/^A\s*[-–]\s*CONCLUSIONS DU REP[ÉE]RAGE/i.test(n)) { dans = true; continue; }
    if (dans && /^B\s*[-–]\s*OBLIGATIONS/i.test(n)) break;
    if (!dans) continue;

    /*
     * La phrase d'un état s'étale sur deux ou trois lignes, et son verbe est
     * séparé de ce qui le qualifie par un retour à la ligne. On lit donc une
     * fenêtre, jamais une ligne seule.
     */
    const fenetre = normaliser([lignes[i], lignes[i + 1], lignes[i + 2]].filter(Boolean).join(' '));
    const trouve = ETATS.find((e) => e.rx.test(fenetre));
    if (!trouve) continue;
    if (out.some((c) => c.phrase === fenetre)) continue;

    /*
     * Les localisations suivent, une par ligne, sous la forme
     * `<Local> (<Composant>) : <Localisation>`. On les prend telles quelles :
     * ce sont les mots du rapport.
     */
    const ou: string[] = [];
    for (let j = i + 1; j < lignes.length && ou.length < 12; j++) {
      const brut = (lignes[j] ?? '').replace(/\s+/g, ' ').trim();
      const l = normaliser(brut);
      if (!l || /^[AB]\s*[-–]/.test(l) || /^Dans le cadre r[ée]glementaire/i.test(l)) break;
      /*
       * ⚠️ On cherche sur la forme normalisée, on restitue la forme BRUTE.
       *
       * La normalisation colle les tirets pour que `13 - 9` et `13-9` se
       * ressemblent — mais une localisation s'écrit « SOUS-SOL - Cave », et la
       * coller la déforme. Les mots du rapport se citent entiers : normaliser
       * sert à trouver, jamais à restituer.
       */
      if (/^.+\(.+\)\s*:/.test(l)) ou.push(brut);
    }

    out.push({ etat: trouve.etat, phrase: fenetre, ou });
  }

  return out;
}

/**
 * Le lecteur amiante de BC2E.
 *
 * Il ne rend que ce qu'il a lu — et déclare ce qu'il n'a pas su lire. Un volet
 * dont le bloc A est introuvable n'est pas un volet sans amiante : c'est un
 * volet non lu, et le dire est la seule réponse honnête.
 */
export function lireAmianteBC2E({ lignes, plage }: Contexte): Diagnostic {
  const conclusions = conclusionsBC2E(lignes);
  const faits: Fait[] = [];

  const presences = conclusions.filter((c) => c.etat === 'presence');
  const suspens = conclusions.filter((c) => c.etat === 'nonConclu');

  for (const c of presences) {
    faits.push({
      libelle: 'Amiante repérée',
      valeur: c.ou.length ? c.ou.join(' · ') : '—',
      precision: c.phrase
    });
  }
  for (const c of suspens) {
    faits.push({
      libelle: 'Le rapport ne conclut pas',
      valeur: c.ou.length ? c.ou.join(' · ') : '—',
      precision: c.phrase
    });
  }

  const verdict = !conclusions.length
    ? "Le constat n'a pas pu être lu : sa rubrique de conclusion est introuvable dans ce document. Réclamez le rapport complet."
    : presences.length
      ? 'Le rapport repère des matériaux contenant de l’amiante.'
      : suspens.length
        ? 'Le rapport ne conclut pas encore : des prélèvements restent à faire ou leurs résultats sont attendus.'
        : 'Le rapport ne repère aucun matériau contenant de l’amiante.';

  return {
    type: 'amiante',
    titre: 'Amiante',
    plage: [...plage] as [number, number],
    gravite: presences.length ? 'attention' : suspens.length ? 'attention' : 'bon',
    verdict,
    faits
  } as unknown as Diagnostic;
}
