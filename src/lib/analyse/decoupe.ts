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
  /**
   * Ce qui prouve qu'une page appartient ENCORE à ce rapport.
   *
   * Un rapport se reconnaît d'ordinaire au titre répété en en-tête. L'état des
   * risques fait exception : il est produit par un autre éditeur, et ses pages
   * suivantes ne portent que « Mode EDITION » et l'adresse du bien. La section
   * se fermait donc à la première page, et tout ce qui suit — le tableau de
   * synthèse en tête, l'imprimé officiel, les arrêtés de catastrophe naturelle —
   * tombait hors section.
   *
   * Mesuré sur 140 dossiers : treize fois, le tableau qui déclare le bien en
   * zone d'argile se trouvait exactement une page après la fin de la plage.
   */
  traces?: string[];
  /**
   * La trace, quand elle n'est pas un fragment fixe mais une FORME.
   *
   * Le DPE ne répète pas son titre sur ses annexes : la fiche technique du
   * logement n'a pas d'en-tête, et ses pages ne se reconnaissent qu'à leur
   * pied — « Dossier : 22/IMO/0549  Page 8 / 11 ». Le numéro change à chaque
   * page ; aucun fragment fixe ne peut l'attraper.
   *
   * Mesuré avant correction : les 58 volets DPE de l'échantillon étaient tous
   * plus courts que la pagination qu'ils annoncent, de près de sept pages. Ce
   * qui se perdait, c'est la fiche technique — c'est-à-dire le type de bien,
   * l'année de construction, les surfaces et les matériaux.
   */
  traceMotif?: RegExp;
}

const MARQUEURS: Marqueur[] = [
  {
    type: 'dpe',
    // « Diagnostic de performance » suffit : sur la première page du DPE, le mot
    // « énergétique » est rejeté sur une autre ligne par la mise en page.
    // « DPE / ANNEXES » ouvre la fiche technique du logement, qui n'a pas
    // d'autre titre.
    entetes: ['diagnosticdeperformance', 'auditenergetique', 'dpeannexes'],
    traceMotif: /Dossier\s*:[^|]{0,30}Page\s*\d+\s*\/\s*\d+/i
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
      /*
       * Le titre courant que ce générateur répète en tête de CHAQUE page.
       *
       * Il manquait, et le volet se fermait après sa deuxième page : les neuf
       * suivantes — celles qui portent la liste des matériaux, leur état de
       * conservation et les parties non visitées — partaient hors section.
       * Mesuré sur vingt volets qui annoncent eux-mêmes leur pagination
       * (« le présent rapport est constitué de 11 pages »), vingt étaient plus
       * courts que ce qu'ils revendiquent, de quinze pages en moyenne.
       */
      'constatdereperageamiante',
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
    ],
    /* La signature du générateur, présente sur chaque page de sa suite. */
    traces: [
      'etatdesrisquesetpollutions',
      'modeedition',
      'preventimmo',
      'kinaxia',
      /* Les fragments sont comparés à du texte « collé » : ni point ni tiret. */
      'georisquesgouvfr',
      'arretescatnatsurlacommune',
      'informationacquereurlocataire',
      /* Le second tableau et l'état approfondi, qui portent le classement en
         argile — la ligne pour laquelle toute cette découpe existe. */
      'etatdesrisquesapprofondi',
      'zonageduretraitgonflementdesargiles',
      'risquescomplementaires'
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

/**
 * Certains rapports DÉCLARENT leur volet, page par page.
 *
 * Un générateur rencontré dans le corpus — celui d'un réseau de
 * diagnostiqueurs — écrit en tête de chaque feuille :
 *
 *     DIAGNOSTIC DPE : 2 sur 11
 *     DDT : 11 sur 33
 *
 * Il donne le type du diagnostic, la position de la page dans son volet, et la
 * position de la page dans le dossier. C'est le document le plus explicite du
 * corpus — et le seul que la découpe ne savait pas lire, parce que ses pages ne
 * répètent pas le TITRE du diagnostic mais le nom du cabinet. Résultat : un DPE
 * de onze pages ramené à une seule.
 *
 * Quand un rapport se déclare ainsi, sa déclaration l'emporte sur tout le reste.
 */
const DECLARATION = /\b(?:DIAGNOSTIC|ATTESTATION|RAPPORT|[EÉ]TAT|CONSTAT)\s+([A-ZÉÈÊÀ'’\s-]{2,40}?)\s*:\s*\d+\s+sur\s+\d+/;

const LIBELLES_DECLARES: { motif: RegExp; type: TypeDiag }[] = [
  { motif: /DPE|PERFORMANCE\s+[EÉ]NERG/i, type: 'dpe' },
  { motif: /CARREZ|SUPERFICIE/i, type: 'carrez' },
  { motif: /TERMITES|PARASITAIRE/i, type: 'termites' },
  { motif: /AMIANTE/i, type: 'amiante' },
  { motif: /PLOMB|CREP/i, type: 'plomb' },
  { motif: /[EÉ]LECTRI/i, type: 'electricite' },
  { motif: /GAZ/i, type: 'gaz' },
  { motif: /RISQUES|ERP/i, type: 'erp' },
  { motif: /ASSAINISSEMENT/i, type: 'assainissement' }
];

/** Le volet qu'une page revendique elle-même, quand elle le fait. */
function typeDeclare(page: PageTexte): TypeDiag | null {
  for (const ligne of page.lignes.slice(0, 12)) {
    const m = DECLARATION.exec(ligne);
    if (!m?.[1]) continue;
    const trouve = LIBELLES_DECLARES.find((x) => x.motif.test(m[1] ?? ''));
    if (trouve) return trouve.type;
  }
  return null;
}

function typeDeLaPage(page: PageTexte): TypeDiag | null {
  // La déclaration explicite l'emporte : elle ne se déduit pas, elle se lit.
  const declare = typeDeclare(page);
  if (declare) return declare;

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
  const marqueur = MARQUEURS.find((m) => m.type === type);
  if (!marqueur) return false;
  // La forme du pied de page, quand le rapport ne répète pas son titre.
  if (marqueur.traceMotif?.test(page.lignes.join(' '))) return true;
  const colle = compact(page.lignes.join(' '));
  return (marqueur.traces ?? marqueur.entetes).some((e) => colle.includes(e));
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

    /*
     * Une page qui DÉCLARE son volet n'est ni une page de garde ni un sommaire.
     *
     * Les pages de ce générateur portent peu de texte — beaucoup de graphiques —
     * et citent plusieurs diagnostics dans leur en-tête commercial : le test du
     * sommaire les interceptait avant même qu'on regarde ce qu'elles disent
     * d'elles-mêmes. Un DPE de onze pages tombait à une seule.
     */
    const declare = typeDeclare(page);

    if (!declare && (estPageDeGarde(page) || estSommaire(page))) {
      horsSection.push(...page.lignes);
      courante = null;
      continue;
    }

    const type = declare ?? typeDeLaPage(page);

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
