/**
 * Découpage d'un dossier de diagnostics en sections.
 *
 * Un DDT enchaîne plusieurs rapports dans un seul PDF. Chaque rapport répète son
 * titre en en-tête de page : c'est ce qu'on exploite pour savoir où commence et
 * où finit chaque diagnostic.
 */
import type { PageTexte } from '../lignes';
import type { TypeDiag } from '../modele';
import { compact } from './texte';

interface Marqueur {
  type: TypeDiag;
  /** Fragments « collés » cherchés en tête de page. */
  entetes: string[];
}

const MARQUEURS: Marqueur[] = [
  {
    type: 'dpe',
    // « Diagnostic de performance » suffit : sur la première page du DPE, le mot
    // « énergétique » est rejeté sur une autre ligne par la mise en page.
    entetes: ['diagnosticdeperformance', 'auditenergetique']
  },
  {
    type: 'plomb',
    entetes: [
      'constatderisquedexpositionauplomb',
      'crepconstatderisque',
      'expositionauplombcrep',
      'reperagedesrevetementscontenantduplomb'
    ]
  },
  {
    type: 'amiante',
    entetes: [
      'reperagedesmateriauxetproduitscontenantdelamiante',
      'rapportdereperageamiante',
      'dossiertechniqueamiante',
      'constatamianteavantvente',
      'etatmentiondelapresencedamiante'
    ]
  },
  {
    type: 'electricite',
    entetes: [
      'etatdelinstallationinterieuredelectricite',
      'etatdesinstallationsinterieuresdelectricite',
      'etatdelinstallationelectrique'
    ]
  },
  {
    type: 'gaz',
    entetes: [
      'etatdelinstallationinterieuredegaz',
      'etatdesinstallationsinterieuresdegaz',
      'etatdelinstallationgaz'
    ]
  },
  {
    type: 'termites',
    entetes: ['etatrelatifalapresencedetermites', 'etatparasitaire', 'rapportdereperagetermites']
  },
  {
    type: 'erp',
    entetes: [
      'etatdesrisquesetpollutions',
      'etatdesrisquesreglemente',
      'etatdesrisquesnaturelsminiersettechnologiques'
    ]
  },
  {
    type: 'carrez',
    entetes: ['mesurageloicarrez', 'attestationdesuperficie', 'certificatdesuperficie', 'loicarrez']
  },
  {
    type: 'assainissement',
    entetes: ['diagnosticassainissement', 'controledelinstallationdassainissement', 'assainissementnoncollectif']
  }
];

/** Fragment identifiant la page de synthèse d'un DDT. */
const ENTETE_SYNTHESE = ['resumedelexpertise', 'synthesedudossier', 'tableaudesynthese'];

export interface Section {
  type: TypeDiag;
  pages: PageTexte[];
  /** Toutes les lignes de la section, dans l'ordre. */
  lignes: string[];
  plage: [number, number];
}

export interface Decoupe {
  sections: Section[];
  /** Lignes de la page « résumé de l'expertise », si elle existe. */
  synthese: string[];
  /** Pages occupées par cette synthèse. */
  plageSynthese: [number, number] | null;
  /** Lignes des pages qui n'ont été rattachées à aucun diagnostic. */
  horsSection: string[];
}

/**
 * Une page de garde énumère toutes les prestations possibles sous forme de
 * cases à cocher : elle déclencherait tous les marqueurs à la fois. On l'écarte.
 */
function estPageDeGarde(page: PageTexte): boolean {
  const colle = compact(page.lignes.join(' '));
  const touches = MARQUEURS.filter((m) => m.entetes.some((e) => colle.includes(e)));
  return touches.length >= 4;
}

function typeDeLaPage(page: PageTexte): TypeDiag | null {
  // Le titre courant tient dans les premières lignes (haut de page).
  const entete = compact(page.lignes.slice(0, 4).join(' '));
  if (!entete) return null;
  for (const marqueur of MARQUEURS) {
    if (marqueur.entetes.some((e) => entete.includes(e))) return marqueur.type;
  }
  return null;
}

export function decouper(pages: PageTexte[]): Decoupe {
  const sections: Section[] = [];
  const synthese: string[] = [];
  const horsSection: string[] = [];
  let plageSynthese: [number, number] | null = null;

  let courante: Section | null = null;

  for (const page of pages) {
    const colle = compact(page.lignes.slice(0, 3).join(' '));
    if (ENTETE_SYNTHESE.some((e) => colle.includes(e))) {
      synthese.push(...page.lignes);
      plageSynthese = plageSynthese ? [plageSynthese[0], page.numero] : [page.numero, page.numero];
      continue;
    }

    if (estPageDeGarde(page)) {
      horsSection.push(...page.lignes);
      courante = null;
      continue;
    }

    const type = typeDeLaPage(page);

    if (type && (!courante || courante.type !== type)) {
      courante = { type, pages: [], lignes: [], plage: [page.numero, page.numero] };
      sections.push(courante);
    }

    if (courante) {
      // Une page sans en-tête reconnu au milieu d'une section (annexe, croquis)
      // reste rattachée à cette section.
      courante.pages.push(page);
      courante.lignes.push(...page.lignes);
      courante.plage[1] = page.numero;
    } else {
      horsSection.push(...page.lignes);
    }
  }

  // Un même diagnostic peut réapparaître plus loin dans le dossier (annexes,
  // parties communes et privatives, croquis rejetés en fin de rapport). On
  // regroupe tout par type : le lecteur attend une carte par diagnostic, pas
  // trois cartes « Termites ».
  const parType = new Map<TypeDiag, Section>();
  for (const section of sections) {
    const existante = parType.get(section.type);
    if (existante) {
      existante.pages.push(...section.pages);
      existante.lignes.push(...section.lignes);
      existante.plage = [
        Math.min(existante.plage[0], section.plage[0]),
        Math.max(existante.plage[1], section.plage[1])
      ];
    } else {
      parType.set(section.type, section);
    }
  }
  const fusionnees = [...parType.values()];

  return { sections: fusionnees, synthese, plageSynthese, horsSection };
}
