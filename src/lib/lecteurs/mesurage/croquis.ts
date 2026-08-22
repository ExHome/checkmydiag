/**
 * LE CROQUIS DU LOGEMENT — où il est, et où il n'est pas.
 *
 * Ordre d'Aude, 22/08/2026 : « si il y a un croquis dans les rapports, je
 * souhaite qu'il soit extrait dans la mini-app ». Ce module répond d'abord à la
 * seule question qui vaille — **où** — avant que quoi que ce soit ne s'extraie.
 *
 * ## Deux mesures fausses avant la bonne
 *
 * 1. **Compter les grandes images du volet de mesurage** : 49 volets sur 50 en
 *    portent une. En l'ouvrant, ce n'était pas un plan, c'était le **certificat
 *    de compétence du diagnostiqueur**, numérisé en pleine page. Un extracteur
 *    bâti là-dessus aurait présenté la certification d'un confrère comme le
 *    plan du logement — vraisemblable, faux, et jamais signalé.
 * 2. **Compter les tracés vectoriels** : 183 pages « très dessinées » sur 30
 *    rapports. C'étaient les jauges du DPE et les cartes de l'état des risques.
 *
 * Les deux mesuraient une forme sans lire ce qui l'entoure. La bonne méthode
 * est celle de l'ordre de mission : chercher un **endroit**, pas une forme.
 *
 * ## Ce que la lecture a établi (25 rapports, 22/08/2026)
 *
 * | Ce qui est écrit | Volet | Fois |
 * |---|---|---|
 * | `Annexe - Croquis de repérage` | électricité, gaz | 17 |
 * | `7.1 - Annexe - Schéma de repérage` | amiante | 12 |
 * | `7.1 Schéma de repérage` | amiante | 12 |
 * | `Annexe – Croquis de repérage` (tiret long) | termites | 2 |
 * | `Aucun schéma de repérage n'a été joint à ce rapport.` | **mesurage** | 3 |
 *
 * **Le volet de mesurage ne porte jamais de croquis.** Il ne fait que dire,
 * quand c'est le cas, qu'il n'y en a pas. Le dossier, lui, en porte un — et
 * c'est le même logement.
 *
 * ⚠️ Trois de ces cinq lignes ne désignent PAS un dessin :
 * - en **électricité** et en **gaz**, `Annexe - Croquis de repérage` est un
 *   titre de rubrique posé sur une page de « Règles élémentaires de sécurité » :
 *   200 tracés, pas de légende, aucune identification du bien ;
 * - en **amiante**, `7.1 Schéma de repérage` sans tiret est une ligne du
 *   sommaire des annexes, pas l'annexe elle-même.
 *
 * La page qui porte vraiment le dessin se reconnaît à trois choses ensemble :
 * son titre, une **`Légende`**, et l'identification du bien juste dessous.
 * C'est une signature positive, mesurée sur les quatre rapports où elle est
 * apparue — jamais l'absence d'un marqueur.
 */
import type { TypeDiag } from '../../modele';

/** Le titre de l'annexe qui porte le dessin, en amiante. */
const TITRE_SCHEMA_AMIANTE = /^[\d.]+\s*[-–—]\s*Annexe\s*[-–—]\s*Sch[ée]ma de rep[ée]rage\s*$/i;
/** La même annexe annoncée au sommaire, sans tiret : ce n'est pas la planche. */
const SOMMAIRE_SCHEMA_AMIANTE = /^[\d.]+\s+Sch[ée]ma de rep[ée]rage\s*$/i;
/** Le titre employé par l'électricité, le gaz et les termites. */
const TITRE_CROQUIS = /^Annexe\s*[-–—]\s*Croquis de rep[ée]rage\s*$/i;

/** Ce qui accompagne un vrai dessin, et rien d'autre. Mesuré 4 fois sur 4. */
const LEGENDE = /^L[ée]gende\s*$/i;
const IDENTIFIE_LE_BIEN = /^(Nom du propri[ée]taire|Adresse du bien)\s*:?/i;

/** Ce que le mesurage écrit quand il n'y a pas de planche jointe. */
const DECLARE_ABSENT = /Aucun sch[ée]ma de rep[ée]rage n['’]a [ée]t[ée] joint/i;

/**
 * Ce qu'on a trouvé — **quatre états, jamais deux**.
 *
 * `annoncé` est le plus important des quatre : une rubrique porte le mot
 * « croquis », mais rien sur la page ne confirme qu'un dessin s'y trouve. Le
 * ranger avec `trouvé` afficherait une page de consignes de sécurité en guise
 * de plan ; le ranger avec `non trouvé` effacerait une piste réelle.
 *
 * `déclaré absent` n'est pas `non trouvé` non plus : le rapport a répondu à la
 * question, et sa réponse est « il n'y en a pas ». C'est une information, pas
 * un silence.
 */
export type Croquis =
  | {
      etat: 'trouvé';
      page: number;
      titre: string;
      /** Le volet d'où il vient — jamais « mesurage », voir plus haut. */
      volet: TypeDiag | 'hors volet';
      /** Ce qui a permis de conclure, citable. */
      preuve: string;
    }
  | {
      etat: 'annoncé';
      page: number;
      titre: string;
      volet: TypeDiag | 'hors volet';
      /** Pourquoi on n'affirme pas qu'il y a un dessin. */
      pourquoi: string;
    }
  | { etat: 'déclaré absent'; source: string }
  | { etat: 'non trouvé' };

export interface PageLue {
  numero: number;
  lignes: readonly string[];
}

export interface Bornage {
  type: TypeDiag;
  plage: readonly [number, number];
}

/**
 * Cherche le croquis dans le **dossier entier**, pas dans le volet de mesurage.
 *
 * Rendre le volet d'origine n'est pas un détail d'affichage : un croquis
 * d'amiante repère des matériaux, pas des surfaces. Il montre le même logement
 * — c'est ce qui le rend utile ici — mais il n'a pas été tracé pour le
 * mesurage, et la mini-app doit le dire au lieu de le laisser croire.
 */
export function trouverLeCroquis(
  pages: readonly PageLue[],
  sections: readonly Bornage[] = []
): Croquis {
  const voletDe = (page: number): TypeDiag | 'hors volet' =>
    sections.find((s) => page >= s.plage[0] && page <= s.plage[1])?.type ?? 'hors volet';

  let annonce: Croquis | null = null;

  for (const page of pages) {
    const nettes = page.lignes.map((l) => l.trim());

    const titreSchema = nettes.find((l) => TITRE_SCHEMA_AMIANTE.test(l));
    const titreCroquis = nettes.find((l) => TITRE_CROQUIS.test(l));
    const titre = titreSchema ?? titreCroquis;
    if (!titre) continue;

    /* La signature positive de la planche : le titre, une légende, et le bien
       identifié dessous. Les trois ensemble — deux ne suffisent pas. */
    const aLegende = nettes.some((l) => LEGENDE.test(l));
    const identifie = nettes.some((l) => IDENTIFIE_LE_BIEN.test(l));
    if (aLegende && identifie) {
      return {
        etat: 'trouvé',
        page: page.numero,
        titre,
        volet: voletDe(page.numero),
        preuve: `${titre} · Légende`
      };
    }

    annonce ??= {
      etat: 'annoncé',
      page: page.numero,
      titre,
      volet: voletDe(page.numero),
      pourquoi: aLegende
        ? 'la page porte une légende mais n’identifie pas le bien'
        : 'la rubrique est nommée, mais la page ne porte ni légende ni identification du bien'
    };
  }

  if (annonce) return annonce;

  /* Le sommaire des annexes annonce la planche sans la porter : c'est une
     piste, pas une trouvaille. */
  for (const page of pages) {
    const titre = page.lignes.map((l) => l.trim()).find((l) => SOMMAIRE_SCHEMA_AMIANTE.test(l));
    if (!titre) continue;
    return {
      etat: 'annoncé',
      page: page.numero,
      titre,
      volet: voletDe(page.numero),
      pourquoi: 'ligne du sommaire des annexes, pas la planche elle-même'
    };
  }

  for (const page of pages) {
    const source = page.lignes.find((l) => DECLARE_ABSENT.test(l));
    if (source) return { etat: 'déclaré absent', source: source.trim() };
  }

  return { etat: 'non trouvé' };
}

/**
 * Ce que la mini-app doit écrire au-dessus du croquis, selon d'où il vient.
 *
 * L'ordre de mission du pack l'exige : « ne jamais présenter une représentation
 * graphique comme un relevé exact si elle est schématique ». Un croquis de
 * repérage amiante n'est ni coté, ni contractuel, ni un plan de mesurage — et
 * l'écrire est la condition pour avoir le droit de le montrer.
 */
export function legendeDuCroquis(croquis: Croquis): string | null {
  if (croquis.etat !== 'trouvé') return null;
  const origine: Partial<Record<TypeDiag | 'hors volet', string>> = {
    amiante: 'du repérage amiante',
    electricite: 'du diagnostic électricité',
    gaz: 'du diagnostic gaz',
    termites: 'de l’état relatif aux termites'
  };
  const dou = origine[croquis.volet] ?? 'd’une autre partie du dossier';
  return `Croquis de repérage ${dou}, page ${croquis.page} du rapport. Il montre le même logement, mais il n’a pas été tracé pour le mesurage : il n’est ni coté, ni contractuel.`;
}
