/**
 * QUI A PRODUIT CE RAPPORT — le premier repère de l'atelier.
 *
 * L'atelier pose ses repères de lecture PAR ÉDITEUR, et rien ne peut être posé
 * par éditeur tant que l'éditeur n'est pas nommé. C'est ce que fait ce module,
 * et il ne fait que cela.
 *
 * POURQUOI C'EST LE PREMIER REPÈRE. Beaucoup de ce qu'on croit être « la forme
 * d'un rapport de diagnostic » n'est que la forme d'un logiciel. L'épreuve hors
 * Liciel l'a montré sur douze rapports de cinq éditeurs : le tableau à colonnes
 * entrelacées n'existe que chez Liciel, les caractères doublés sont propres à
 * Expertec Pro, les en-têtes quadruplés à DPEWIN V5. Un repère mesuré sur cent
 * rapports d'un seul éditeur n'est pas une règle du métier — c'est l'habitude
 * d'un logiciel, et le lecteur qui la généralise se trompe partout ailleurs.
 *
 * OÙ LE RAPPORT SE NOMME — mesuré sur 700 PDF du corpus, et sur 50 DDT dont le
 * texte a été lu en entier. Le générateur n'est déclaré qu'à DEUX endroits :
 *
 *   1. la rubrique « Référence du logiciel validé » — qui n'existe QUE s'il y
 *      a un DPE (24 des 50 DDT mesurés) et ne renseigne QUE sur le DPE ;
 *   2. les métadonnées du PDF (`Producer`, `Creator`) — présentes partout,
 *      mais qui nomment l'outil d'impression, pas toujours l'éditeur.
 *
 * Un DDT sans DPE ne nomme donc son logiciel NULLE PART dans son texte : sur
 * les 50 mesurés, 26 sont dans ce cas. Il reste les métadonnées, et elles
 * suffisent — c'est la raison d'être de la table `SIGNATURES`.
 *
 * ⚠️ LES MARQUES DU CORPS NE DISENT RIEN. Chercher un nom d'éditeur dans le
 * texte du rapport, c'est le trouver partout et de travers — c'est la règle
 * « on cherche un ENDROIT, pas une information », vérifiée ici deux fois :
 *
 *   — « fisa » ressort sur 40 rapports sur 50. Ce n'est jamais Fisa-DPE : c'est
 *     « insufFISAnte », dans la phrase sur l'insuffisance respiratoire du
 *     paragraphe amiante ;
 *   — « ITGA » ressort dans le corps d'un rapport LICIEL. ITGA édite Imm'PACT,
 *     mais ici c'est le LABORATOIRE qui a analysé les prélèvements — « Commande
 *     ITGA : IT0526-13070 ». Le même nom désigne un éditeur et un labo.
 *
 * On lit donc la rubrique, ou la métadonnée. Jamais le texte au hasard.
 */

/** Ce que le PDF déclare de lui-même, hors de son texte. */
export interface MetadonneesPdf {
  producteur?: string | undefined;
  createur?: string | undefined;
}

/** D'où vient le nom du générateur — et donc ce qu'il vaut. */
export type SourceDuNom =
  /** Le rapport le déclare lui-même, dans une rubrique nommée. Le plus sûr. */
  | 'déclaration'
  /** L'empreinte d'impression du PDF. Sûre pour la famille, muette sur la version. */
  | 'signature'
  /** Rien ne le nomme. On ne devine pas. */
  | 'inconnue';

/**
 * Ce qu'on a sous la main — car tout PDF d'un dossier n'est pas un rapport.
 *
 * Sur 700 PDF du corpus, 216 sont des factures d'une page et 42 sont des
 * numérisations sans un fragment de texte en première page. L'atelier n'a pas à
 * les ouvrir, et surtout il ne doit pas lire les secondes comme des rapports
 * vides : une page sans texte n'est pas une page sans anomalie.
 */
export type GenreDocument = 'diagnostic' | 'facture' | 'numérisation' | 'inconnu';

export interface Generateur {
  /**
   * L'éditeur, au sens où le métier l'entend : le nom du logiciel qui a produit
   * le rapport — LICIEL, AnalysImmo, DPE WIN. C'est LA CLÉ DU RÉFÉRENTIEL :
   * les repères de lecture se rangent sous ce nom, et sous aucun autre.
   */
  editeur: string | null;
  /** La société qui l'édite, telle que la liste du ministère la nomme. */
  societe: string | null;
  /** Le libellé déclaré, mot pour mot — « LICIEL Diagnostics v4 [Moteur…] ». */
  logiciel: string | null;
  version: string | null;
  source: SourceDuNom;
  /** Le texte exact qui a permis de conclure. Toute lecture doit être vérifiable. */
  preuve: string;
  genre: GenreDocument;
}

/**
 * La société derrière chaque éditeur, d'après la liste du ministère au
 * 10.07.2026 (voir `docs/EDITEURS-DE-DIAGNOSTICS.md`).
 */
const SOCIETE_DE_L_EDITEUR: ReadonlyArray<readonly [RegExp, string, string]> = [
  [/liciel/i, 'LICIEL', 'LICIEL Diagnostics Environnement'],
  [/analys ?immo/i, 'AnalysImmo', 'ATLIBITUM'],
  [/dpe ?win/i, 'DPE WIN', 'Logiciels PERRENOUD'],
  [/expertec/i, 'EXPERTEC', 'OFFICE EXPERT'],
  [/imm.?pact/i, "Imm'PACT", 'ITGA'],
  [/argos/i, 'ARGOS', 'ITHAQUE'],
  [/climawin/i, 'CLIMAWIN', 'BBS SLAMA'],
  [/klk/i, 'KLK DIAG', 'KLK France'],
  [/pl[ée]iades/i, 'PLÉIADES', 'IZUBA'],
  [/windpe/i, 'WINDPE', 'OBBC Développement'],
  [/djeserdiag/i, 'DJESERDIAG', 'TEKIMMO']
];

/**
 * Les empreintes d'impression relevées sur le corpus — 700 PDF, août 2026.
 *
 * L'ordre compte : la première qui accroche gagne, et les règles les plus
 * précises sont en tête. `iTextSharp` seul ne suffit pas — LICIEL imprime en
 * 5.4.0, et un rapport d'un autre éditeur en 5.5.13.
 */
const SIGNATURES: ReadonlyArray<{
  readonly producteur: RegExp;
  readonly createur?: RegExp;
  readonly editeur: string | null;
  readonly genre: GenreDocument;
  /** Combien de PDF portaient cette empreinte, sur les 700 mesurés. */
  readonly mesure: number;
}> = [
  /* Le même moteur d'impression qu'en dessous, une autre version, un autre
     éditeur : cette règle passe donc AVANT celle de LICIEL. */
  {
    producteur: /iTextSharp/i,
    createur: /ITGA/i,
    editeur: "Imm'PACT",
    genre: 'diagnostic',
    mesure: 1
  },
  /* 346 PDF, 47 pages en moyenne : les DDT du corpus DGLM. La version 5.4.0
     d'iTextSharp est celle qu'imprime LICIEL v4, et la déclaration du DPE l'a
     confirmée sur les 24 rapports qui en portaient une. */
  { producteur: /iTextSharp[^0-9]*5\.4\./i, editeur: 'LICIEL', genre: 'diagnostic', mesure: 346 },
  /* 216 PDF d'UNE page, nommés F#####_###.pdf : la facturation du cabinet.
     Aucun n'est un rapport. */
  { producteur: /mPDF/i, editeur: null, genre: 'facture', mesure: 216 },
  /* 29 ERP nommés PRVI_*, produits par le fournisseur d'état des risques —
     dont la signature de page est déjà connue de la découpe (« preventimmo »). */
  {
    producteur: /itext-paulo/i,
    createur: /pdftk/i,
    editeur: 'PreventImmo',
    genre: 'diagnostic',
    mesure: 29
  },
  /* 59 PDF de 11 pages, un fichier par volet (…-dta.pdf, …-dapp.pdf,
     …-plomb_pc.pdf). L'éditeur n'est PAS identifié : la chaîne HTML2PDF ne le
     nomme pas, et aucun de ces rapports n'a encore été lu. On ne devine pas —
     c'est un trou du référentiel, pas une conclusion. */
  { producteur: /TCPDF|HTML2PDF/i, editeur: null, genre: 'diagnostic', mesure: 59 },
  /* Les numérisations — 42 PDF, aucun fragment de texte en page 1. Le scanner
     ou l'imprimante virtuelle signe à la place du logiciel de diagnostic. */
  { producteur: /Ghostscript|PDFCreator/i, editeur: null, genre: 'numérisation', mesure: 32 },
  { producteur: /SECnvtToPDF|TOSHIBA/i, editeur: null, genre: 'numérisation', mesure: 4 },
  { producteur: /MFPImgLib/i, editeur: null, genre: 'numérisation', mesure: 3 },
  { producteur: /RICOH/i, editeur: null, genre: 'numérisation', mesure: 2 },
  { producteur: /Microsoft: ?Print ?To ?PDF/i, editeur: null, genre: 'numérisation', mesure: 1 }
];

/** La rubrique qui porte le nom du logiciel — et elle seule. */
const RUBRIQUE_LOGICIEL = /R[ée]f[ée]rence\s+du\s+logiciel\s+valid[ée]\s*:?\s*(.+)$/i;

/** « LICIEL Diagnostics v4 », « DPEWIN version V5 », « AnalysImmo DPE 2021 4.1.1 ». */
const VERSION = /(?:version\s+)?\b(v?\d+(?:\.\d+)+[a-z]?|v\d+[a-z]?)\b/i;

function nommerEditeur(declare: string): { editeur: string; societe: string } | null {
  for (const [motif, editeur, societe] of SOCIETE_DE_L_EDITEUR) {
    if (motif.test(declare)) return { editeur, societe };
  }
  return null;
}

/**
 * Ce que le rapport déclare de son logiciel, DANS la rubrique prévue pour ça.
 *
 * Renvoie `null` quand la rubrique est absente — ce qui est le cas de tout
 * dossier sans DPE. Absence de rubrique n'est pas absence de logiciel : c'est
 * « non trouvé », et la suite se joue sur les métadonnées.
 */
export function logicielDeclare(lignes: readonly string[]): {
  editeur: string;
  societe: string;
  logiciel: string;
  version: string | null;
  preuve: string;
} | null {
  for (const ligne of lignes) {
    const trouve = RUBRIQUE_LOGICIEL.exec(ligne);
    if (!trouve) continue;
    const declare = (trouve[1] ?? '').trim();
    const nom = nommerEditeur(declare);
    if (!nom) continue;
    return {
      editeur: nom.editeur,
      societe: nom.societe,
      logiciel: declare,
      version: VERSION.exec(declare)?.[1] ?? null,
      preuve: ligne.trim()
    };
  }
  return null;
}

/** Ce que l'empreinte d'impression du PDF dit du générateur. */
export function signatureDuPdf(meta: MetadonneesPdf): {
  editeur: string | null;
  genre: GenreDocument;
  preuve: string;
} | null {
  const producteur = meta.producteur ?? '';
  const createur = meta.createur ?? '';
  if (!producteur && !createur) return null;

  for (const s of SIGNATURES) {
    if (!s.producteur.test(producteur)) continue;
    if (s.createur && !s.createur.test(createur)) continue;
    return {
      editeur: s.editeur,
      genre: s.genre,
      preuve: createur ? `${producteur} · ${createur}` : producteur
    };
  }
  return null;
}

/**
 * Le générateur du document, et d'où on le tient.
 *
 * La déclaration prime sur la signature : le rapport se nomme lui-même, dans
 * une rubrique réglementaire. La signature reste utile quand la rubrique est
 * absente — c'est-à-dire dans tout dossier sans DPE.
 */
export function identifierGenerateur(
  meta: MetadonneesPdf,
  lignes: readonly string[] = []
): Generateur {
  const declare = logicielDeclare(lignes);
  const signature = signatureDuPdf(meta);

  if (declare) {
    return {
      editeur: declare.editeur,
      societe: declare.societe,
      logiciel: declare.logiciel,
      version: declare.version,
      source: 'déclaration',
      preuve: declare.preuve,
      genre: signature?.genre ?? 'diagnostic'
    };
  }
  if (signature) {
    return {
      editeur: signature.editeur,
      /* PreventImmo n'édite pas de logiciel de DPE : il n'est pas sur la liste
         du ministère, et sa société n'a donc pas de source officielle ici. */
      societe: signature.editeur ? (nommerEditeur(signature.editeur)?.societe ?? null) : null,
      logiciel: null,
      version: null,
      source: signature.editeur ? 'signature' : 'inconnue',
      preuve: signature.preuve,
      genre: signature.genre
    };
  }
  return {
    editeur: null,
    societe: null,
    logiciel: null,
    version: null,
    source: 'inconnue',
    preuve: meta.producteur ?? meta.createur ?? '',
    genre: 'inconnu'
  };
}

/**
 * UN DOSSIER PEUT MÊLER LES GÉNÉRATEURS, et il faut le dire.
 *
 * La rubrique « Référence du logiciel validé » ne renseigne que sur le DPE :
 * l'obligation de logiciel validé ne vaut que pour lui. Un DDT peut donc porter
 * un DPE produit par un logiciel et des volets produits par un autre outil —
 * un état des risques PreventImmo agrafé à un DDT LICIEL, par exemple, ce que
 * le corpus montre.
 *
 * Quand la déclaration et la signature ne disent pas la même chose, ce n'est
 * pas une erreur à arbitrer : c'est un dossier assemblé. On le signale, et les
 * repères d'un éditeur ne valent alors que pour les volets qui sont de lui.
 */
export function generateursMeles(meta: MetadonneesPdf, lignes: readonly string[]): boolean {
  const declare = logicielDeclare(lignes);
  const signature = signatureDuPdf(meta);
  if (!declare || !signature?.editeur) return false;
  return declare.editeur !== signature.editeur;
}
