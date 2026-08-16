/**
 * La date d'un rapport de diagnostic.
 *
 * Chaque rapport porte obligatoirement la sienne. Quand le moteur n'en trouve
 * pas, ce n'est donc jamais parce qu'elle manque : c'est qu'il cherche la
 * mauvaise forme, ou au mauvais endroit.
 *
 * Elle commande le contrôle de péremption — `echeance.ts` — et ce contrôle est
 * l'une des rares choses que le produit apporte vraiment : un état des risques
 * de l'an dernier ne vaut plus rien, et personne ne le remarque en feuilletant.
 *
 * ── Pourquoi une fonction commune ───────────────────────────────────────────
 *
 * Chaque module cherchait sa date avec son propre motif, écrit au jugé. Mesuré
 * sur le corpus : l'ERP n'en trouvait aucune huit fois sur dix, le plomb une
 * fois sur deux, la surface jamais. Or les formes sont largement les mêmes d'un
 * volet à l'autre — c'est le même cabinet qui édite tout le dossier.
 *
 * Une seule fonction, des formes relevées sur de vrais rapports, et des pièges
 * écartés une bonne fois.
 *
 * ── Les pièges, et ils sont nombreux ────────────────────────────────────────
 *
 * Un dossier de diagnostic est un champ de mines de dates qui ne sont pas la
 * sienne. Relevées sur le corpus :
 *
 *   · le numéro de téléphone du cabinet, en pied de CHAQUE page —
 *     « Tél. : 05.56.12.34.56 » se lit comme une date pour un motif permissif ;
 *   · l'assurance du diagnostiqueur : date d'effet, date d'expiration,
 *     « valable jusqu'au », numéro de police ;
 *   · son certificat de compétence, et la date de sa délivrance ;
 *   · l'étalonnage de l'appareil, et le dernier chargement de sa source
 *     radioactive — le plomb se mesure au fluorescence X ;
 *   · les arrêtés de catastrophe naturelle et les plans de prévention, qui
 *     remplissent l'état des risques de dates d'approbation ;
 *   · les textes réglementaires cités, « selon arrêté du … ».
 *
 * Une date fausse est PIRE qu'une date absente : elle fait dire « valable
 * jusqu'au … » à un document périmé, c'est-à-dire l'inverse du service rendu.
 * D'où le principe retenu : on n'accepte qu'un libellé explicitement reconnu,
 * et on rejette toute ligne portant un mot de la liste noire.
 */
import { trouver } from './texte';

/**
 * Une date française, sans avaler les numéros de téléphone.
 *
 * Le point est un séparateur de date admis (« 12.03.2024 »), mais un téléphone
 * en est plein : « Tél. : 05.56.12.34.56 » figure en pied de chaque page.
 *
 * Ce qui les sépare vraiment, c'est l'année à QUATRE chiffres — un numéro
 * français n'aligne que des paires. Les gardes latérales achèvent le travail :
 * pas de chiffre ni de séparateur accolé de part et d'autre.
 *
 * La garde de droite laisse passer le point de PONCTUATION : « Visite
 * effectuée le 22/09/2024. » est une forme réelle du corpus, et une garde qui
 * refusait tout point la rejetait.
 */
const JOUR = String.raw`(?<![\d\/.-])(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})(?![\d\/-]|\.\d)`;

/**
 * Les mots qui disqualifient une ligne.
 *
 * Leur présence signe une date qui appartient à quelqu'un d'autre : au
 * diagnostiqueur, à son assurance, à son appareil, ou à un texte de loi.
 */
const PAS_LA_NOTRE =
  /certificat|certification|assurance|police\s*(?:n|d)|étalonnage|etalonnage|chargement de la source|arr[êe]t[ée]|pr[ée]fectoral|d[ée]cret|ordonnance|PPR[nt]?\b|SIS\b|approuv[ée]|prescrit|r[ée]vis[ée]|date d.(?:effet|expiration)|valable du|expiration/i;

/*
 * « délivré par » ne figure PAS dans cette liste, et c'est délibéré.
 *
 * Il y était : il vise le certificat de compétence du diagnostiqueur. Mais
 * l'état des risques s'annonce lui-même « L'État des Risques délivré par
 * <cabinet> en date du … » — la ligne portait donc sa vraie date, et se
 * faisait rejeter. Les mots « certificat » et « certification » suffisent à
 * écarter le certificat, sans emporter le rapport avec.
 */

/**
 * Les libellés qui désignent la date du rapport, du plus explicite au moins.
 *
 * L'ordre compte : on retient le premier qui répond. « Fait à …, le … » vient
 * en dernier parce que c'est une signature — elle date la rédaction, pas
 * toujours la visite, et certains dossiers en portent plusieurs.
 */
const FORMES: RegExp[] = [
  new RegExp(String.raw`Date\s*\(?s?\)?\s*de\s+la\s+visite[^.\n]{0,60}?` + JOUR, 'i'),
  new RegExp(String.raw`Date\s+du\s+rep[ée]rage\s*:?[\s.]*` + JOUR, 'i'),
  new RegExp(String.raw`Date\s+du\s+(?:constat|diagnostic|contr[ôo]le)\s*:?[\s.]*` + JOUR, 'i'),
  new RegExp(String.raw`Visite\s+effectu[ée]e?\s+le\s*:?[\s.]*` + JOUR, 'i'),
  new RegExp(String.raw`Document\s+r[ée]alis[ée]\s+le\s*:?[\s.]*` + JOUR, 'i'),
  new RegExp(String.raw`Date\s+de\s+(?:r[ée]alisation|cr[ée]ation)\s*:?[\s.]*` + JOUR, 'i'),
  new RegExp(String.raw`r[ée]dig[ée]\s+par[^.\n]{0,40}?\s+le\s*:?[\s.]*` + JOUR, 'i'),
  /* L'état des risques se date dans sa propre phrase d'introduction. « en date
     du » seul serait bien trop large — la même tournure introduit les arrêtés
     préfectoraux, deux lignes plus bas. L'ancrage sur le nom du document est
     ce qui rend la forme sûre. */
  new RegExp(String.raw`[ÉEée]tat\s+des\s+[Rr]isques[^.\n]{0,70}?en\s+date\s+du\s*` + JOUR, 'i'),
  new RegExp(String.raw`Fait\s+[àa]\s+[^,\n]{2,40},?\s*le\s*:?[\s.]*` + JOUR, 'i')
];

/**
 * La date du rapport, ou rien.
 *
 * `rien` est une réponse acceptable, et c'est même la bonne quand le doute
 * subsiste : le produit sait dire « date non lue », il ne sait pas rattraper
 * une échéance calculée sur une date qui n'était pas la sienne.
 */
export function dateDuRapport(lignes: string[], secours: string[] = []): string | null {
  const dansLeVolet = chercher(lignes);
  if (dansLeVolet) return dansLeVolet;

  /*
   * Le secours sert quand la date vit hors du volet.
   *
   * C'est le cas de l'état des risques : mesuré sur le corpus, son volet ne
   * contient AUCUNE date de rapport — seulement les dates d'approbation des
   * plans de prévention. La sienne est sur une page que la découpe ne lui
   * rattache pas, sous « Document réalisé le : » ou dans la phrase
   * « L'État des Risques délivré par <cabinet> en date du … ».
   *
   * On ne cherche là qu'en dernier recours, et avec les mêmes libellés
   * stricts : les pages non rattachées appartiennent à tout le monde, et y
   * pêcher une date au hasard serait le meilleur moyen de dater un rapport
   * avec la visite d'un autre.
   */
  return secours.length ? chercher(secours) : null;
}

function chercher(lignes: string[]): string | null {
  const propres = lignes.filter((l) => !PAS_LA_NOTRE.test(l));
  for (const forme of FORMES) {
    const m = trouver(propres, forme);
    if (m?.[1]) return normaliser(m[1]);
  }
  return null;
}

/** Le format du produit : JJ/MM/AAAA, quel que soit le séparateur d'origine. */
function normaliser(brut: string): string {
  const [j, m, a] = brut.split(/[\/.-]/);
  if (!j || !m || !a) return brut;
  return `${j.padStart(2, '0')}/${m.padStart(2, '0')}/${a}`;
}
