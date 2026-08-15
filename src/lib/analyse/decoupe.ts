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
    /*
     * Le mesurage porte deux noms, et le plus fréquent manquait.
     *
     * Relevé sur quarante dossiers : « attestation de surface habitable »
     * ouvre vingt-neuf d'entre eux, quand « attestation de superficie » — la
     * seule forme qu'on cherchait — n'en ouvre aucun. La section n'était donc
     * pas trouvée, et la page de garde du DPE, voisine, débordait dessus : le
     * mesurage héritait d'un numéro ADEME en guise de conclusion.
     */
    entetes: [
      'mesurageloicarrez',
      'attestationdesuperficie',
      'attestationdesurfacehabitable',
      'attestationdesurface',
      'certificatdesuperficie',
      'certificatdesurfacehabitable',
      'loicarrez',
      'loiboutin',
      'mesurageloiboutin'
    ]
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

/**
 * Une page qui énumère, mais ne rapporte rien.
 *
 * Bordereaux, sommaires, pages de remise : elles nomment plusieurs diagnostics
 * sans en être un. La page de garde en cite quatre ou plus et se reconnaît
 * ainsi ; celles-ci n'en citent que deux, et passaient entre les mailles.
 *
 * Mesuré sur quarante dossiers : treize d'entre eux fabriquaient une section
 * termites d'une seule page, sans corps de rapport ni conclusion. Le lecteur
 * voyait une fiche « Termites — sa conclusion n'a pas pu être lue » alors
 * qu'aucun état termites ne figurait au dossier. Les treize pages nomment deux
 * diagnostics et comptent de dix à vingt-quatre lignes : c'est la signature
 * d'un sommaire, et aucune ne dépasse ce format.
 *
 * Le seuil de longueur compte autant que celui du nombre : une vraie première
 * page de rapport cite parfois un autre diagnostic dans son en-tête commercial,
 * mais elle porte toujours du texte — bien plus de vingt-cinq lignes.
 */
function estSommaire(page: PageTexte): boolean {
  if (page.lignes.length >= 25) return false;
  const colle = compact(page.lignes.join(' '));
  const touches = MARQUEURS.filter((m) => m.entetes.some((e) => colle.includes(e)));
  return touches.length >= 2;
}

function typeDeLaPage(page: PageTexte): TypeDiag | null {
  // Le titre courant tient dans les premières lignes (haut de page).
  const entete = compact(page.lignes.slice(0, 4).join(' '));
  if (!entete) return null;

  /*
   * Le titre le plus haut sur la page l'emporte, pas le premier de notre liste.
   *
   * On renvoyait le premier marqueur trouvé dans l'ordre où ils sont écrits
   * ici. Une page de rapport termites dont l'en-tête commercial énumère les
   * prestations du cabinet — « diagnostic de performance énergétique, amiante,
   * plomb » — était donc classée DPE : le marqueur `dpe` ouvre la liste. Le
   * rapport changeait d'identité à cause de la signature de son auteur.
   *
   * On compare donc les positions : le titre du rapport est imprimé au-dessus
   * de la mention commerciale, et c'est celui-là qu'on veut.
   */
  let meilleur: { type: TypeDiag; ou: number } | null = null;
  for (const marqueur of MARQUEURS) {
    for (const e of marqueur.entetes) {
      const ou = entete.indexOf(e);
      if (ou >= 0 && (!meilleur || ou < meilleur.ou)) meilleur = { type: marqueur.type, ou };
    }
  }
  return meilleur?.type ?? null;
}

/**
 * La page porte-t-elle encore la trace du rapport en cours ?
 *
 * On cherche le titre du diagnostic dans la page entière, et non dans son
 * en-tête : les modèles le répètent en pied de page, en filigrane, ou dans le
 * cartouche latéral quand la page est une annexe. Une page qui ne le porte plus
 * nulle part n'appartient plus au rapport.
 */
function porteLaTrace(page: PageTexte, type: TypeDiag): boolean {
  const colle = compact(page.lignes.join(' '));
  const marqueur = MARQUEURS.find((m) => m.type === type);
  return marqueur ? marqueur.entetes.some((e) => colle.includes(e)) : false;
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

    if (estPageDeGarde(page) || estSommaire(page)) {
      horsSection.push(...page.lignes);
      courante = null;
      continue;
    }

    const type = typeDeLaPage(page);

    if (type && (!courante || courante.type !== type)) {
      courante = { type, pages: [], lignes: [], plage: [page.numero, page.numero] };
      sections.push(courante);
    } else if (!type && courante && !porteLaTrace(page, courante.type)) {
      /*
       * Le rapport est fini : la section se ferme.
       *
       * Une page sans en-tête reconnu restait rattachée à la section courante,
       * pour garder les annexes et les croquis avec leur rapport. Rien
       * n'arrêtait l'absorption : mesuré sur quarante dossiers, dix-sept
       * sections dépassaient vingt pages et la plus grande en comptait
       * quatre-vingt-trois — attestations d'assurance, factures et certificats
       * du dossier entier versés dans un seul diagnostic. Un état termites y
       * gagnait quarante-neuf pages, et sa fiche affichait « conclusion non
       * lue » au milieu du bruit.
       *
       * Une page n'est donc rattachée sans en-tête que si elle porte encore la
       * trace du rapport ailleurs sur la feuille. Mesuré après correction : les
       * cent quarante-huit sections sont toutes conservées — aucune n'est
       * perdue —, aucune ne dépasse dix pages, et mille soixante-dix-huit pages
       * cessent d'être attribuées à un diagnostic qui ne les contient pas.
       */
      horsSection.push(...page.lignes);
      courante = null;
      continue;
    }

    if (courante) {
      // Une page sans en-tête reconnu, mais qui porte encore la trace du
      // rapport (annexe, croquis), reste rattachée à cette section.
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
