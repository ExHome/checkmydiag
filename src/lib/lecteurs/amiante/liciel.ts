/**
 * LE CONSTAT AMIANTE **CHEZ LICIEL** — sa signature, et sa lecture.
 *
 * *Écrit après lecture intégrale de 126 volets LICIEL du corpus DGLM, les 21
 * et 22/08/2026. La carte des endroits est dans `docs/OU-PARSER-AMIANTE.md`.*
 *
 * ## Où LICIEL se reconnaît — à sa FORME, jamais à une marque
 *
 * Aucun volet amiante ne nomme son logiciel dans son texte, et la métadonnée
 * PDF ment dès qu'un tiers a rouvert le fichier : sur six documents lus, quatre
 * rendaient « Word » ou « GdPicture » alors que le rapport est un LICIEL de
 * bout en bout. On reconnaît donc le gabarit, qui, lui, ne ment pas :
 *
 *   1. la phrase de pagination, propre à ce gabarit et à aucun autre —
 *      « Pagination : le présent rapport avec les annexes comprises, est
 *      constitué de N pages » ;
 *   2. la numérotation des rubriques — « 1. – Les conclusions », « 2. – Le(s)
 *      laboratoire(s) d'analyses ».
 *
 * ⚠️ Quatre cabinets confrères impriment ce même gabarit. La signature nomme
 * donc **le format**, pas l'entreprise — et c'est bien ce qu'on veut : c'est le
 * format qui commande la lecture.
 *
 * ## Le § 1.1 n'est pas une phrase : c'est une liste de listes
 *
 * Il s'ouvre toujours pareil — « Liste A : … il [n']a [pas] été repéré » — puis
 * vient **une ou plusieurs lignes à tiret**, et ce sont elles qui portent le
 * sens. Un seul § 1.1 en porte jusqu'à QUATRE pour la seule liste B.
 *
 * Mesuré sur les dix-huit lignes « Liste X : … il a été repéré » du corpus :
 * **six n'annoncent pas d'amiante** — cinq non conclus, une absence prouvée par
 * analyse. Décider sur cette ligne, c'est se tromper une fois sur trois, et
 * dans les deux sens.
 *
 * ## Et LICIEL coupe les mots au hasard
 *
 * « conte nant de l'amiante », « matéria ux », « exigence s », « Descri ptif ».
 * La coupure tombe n'importe où, jamais au même endroit. Elle a coûté un FAUX
 * NÉGATIF mesuré le 21/08 : un DTA de copropriété portant quatre conduits
 * amiantés était rendu « aucun matériau contenant de l'amiante ». On cherche
 * donc sur le texte SANS ESPACES — et on cite avec.
 */
import type { Lecteur, Preuve } from '../socle';
import { conclusionsParListe, normaliser } from '../../analyse/amiante.listes';
import type {
  IssueAmiante,
  Justification,
  LectureAmiante,
  LimiteAmiante,
  MateriauAmiante,
  MissionAmiante
} from './modele';

/**
 * Le texte sans ses accents.
 *
 * Sert à comparer des intitulés, jamais à restituer. On passe par la
 * décomposition Unicode plutôt que par une plage de caractères écrite à la
 * main : une classe comme `[^a-zà-ÿ]` dépend de l'encodage du fichier, et la
 * nôtre a été corrompue en silence le 22/08.
 */
const sansAccents = (t: string): string => t.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Le texte sans aucun espace : la coupure de mot y disparaît. */
const compact = (lignes: readonly string[]): string =>
  normaliser(lignes.join(' ')).replace(/\s+/g, '').toLowerCase();

/*
 * Pour RECONNAÎTRE, on retire aussi la ponctuation.
 *
 * « Pagination : le présent rapport » et « Pagination: le présent rapport » ne
 * doivent pas être deux formes différentes — et le corpus écrit les deux. La
 * ponctuation ne porte ici aucun sens : elle ne sert qu'à faire échouer les
 * motifs.
 */
const nu = (lignes: readonly string[]): string => compact(lignes).replace(/[:;,.·«»"']/g, '');

/**
 * La mission — elle se lit sur le SOUS-TITRE de la page 1, et là seulement.
 *
 * ⚠️ Pas sur le titre courant : un DTA de 2021 porte « Constat de repérage
 * Amiante », un DTA de 2025 porte « Dossier Technique Amiante ». Et surtout pas
 * sur l'avertissement de tête, qui parle de démolition et de travaux dans
 * TOUTES les missions — c'est le piège qui a fait examiner 568 candidats sans
 * en retenir un.
 */
export function missionDe(lignes: readonly string[]): MissionAmiante {
  /*
   * ⚠️⚠️ ON NE LIT PAS LA MISSION DANS TOUT LE VOLET.
   *
   * Mesuré le 22/08 sur 40 volets réels : cette fonction en classait **25 en
   * « avant travaux »** alors que le corpus est fait de constats de vente.
   * La cause est le piège que la carte documente depuis le premier jour, et
   * que le code venait de reproduire :
   *
   *   « La présente mission de repérage NE RÉPOND PAS aux exigences prévues
   *     pour les missions […] avant démolition d'immeuble ou AVANT RÉALISATION
   *     DE TRAVAUX »
   *
   * Cet avertissement est imprimé dans **toutes** les missions — il dit ce que
   * le rapport n'est pas. Le chercher dans le volet entier, c'est reconnaître
   * un repérage avant travaux à la phrase qui jure qu'il n'en est pas un.
   *
   * La mission se lit donc **sur le sous-titre de la page 1**, dans les
   * premières lignes du volet, et nulle part ailleurs.
   */
  const tete = compact(lignes.slice(0, 40));

  /* La vente se nomme, et elle est majoritaire : on l'écarte en premier. */
  if (/[àa]l'occasiondelavente/.test(tete)) return 'vente';

  /* Le DAPP porte son nom dans son titre courant ET son sous-titre. */
  if (/dossieramiante[-–]?partiesprivatives/.test(tete)) return 'DAPP';

  /* Le DTA : « à intégrer au dossier technique amiante ». */
  if (/[àa]int[ée]greraudossiertechnique/.test(tete)) return 'DTA';

  /*
   * Le RAAT ne se reconnaît pas à « avant travaux » — il se reconnaît à son
   * TITRE et à son CODE. C'est le code du TRAVAIL, pas celui de la santé
   * publique : L. 4412-2, décret 2017-899, arrêté du 16 juillet 2019.
   */
  if (/rep[ée]rageamiante[-–]travaux/.test(tete)) return 'avant travaux';
  if (/l4412[-–]?2|2017[-–]?899|16juillet2019/.test(tete)) return 'avant travaux';

  return 'inconnue';
}

/** La justification, ramenée aux mots du modèle sans perdre la nuance. */
function justificationDe(mots: readonly string[]): Justification {
  const j = mots.join(' ').toLowerCase();
  if (j.includes('anciennes analyses')) return 'anciennes analyses';
  if (j.includes('laboratoire')) return 'analyse en laboratoire';
  if (j.includes('jugement') || j.includes('décision')) return 'jugement de l’opérateur';
  if (j.includes('sondages') || j.includes('prélèvements à faire')) return 'non prélevé';
  if (j.includes('attendus') || j.includes('attente')) return 'résultats attendus';
  return 'non précisée';
}

/**
 * Les locaux non examinés — § 1.2.
 *
 * ⚠️ Une clause de style se glisse parmi les vraies observations : le bloc de
 * six lignes qui commence par « Le diagnostic se limite aux zones rendues
 * visibles et accessibles par le propriétaire ». Il est identique au caractère
 * près d'un rapport à l'autre, et le compter revient à inventer une pièce.
 *
 * Il se reconnaît à SON TEXTE — jamais à la seule mention « Ensemble du bien »,
 * qui porte aussi de vraies observations.
 */
const CLAUSE = 'lediagnosticselimiteauxzonesrenduesvisibles';

export function limitesDe(lignes: readonly string[]): LectureAmiante['limites'] {
  /*
   * ⚠️ LE TITRE DU § 1.2 S'ÉTALE SUR QUATRE LIGNES.
   *
   * « 1.2. Dans le cadre de mission décrit à l'article 3.2 les locaux ou
   * parties de locaux, / composants ou parties de composants qui n'ont pu être
   * visités et pour lesquels des / investigations complémentaires sont
   * nécessaires afin de statuer sur la présence ou / l'absence d'amiante : »
   *
   * Mesuré le 22/08 sur de vrais rapports : prendre les lignes qui suivent le
   * début du titre faisait afficher « complémentaires sont nécessaires afin de
   * statuer sur la prés… » comme un local non contrôlé. Dans le bloc qui doit
   * dire à un acquéreur ce qui n'a pas été regardé.
   *
   * Le tableau commence après SON EN-TÊTE — « Localisation | Parties du local |
   * Raison » — et c'est cette ligne-là qu'on cherche, pas le titre.
   */
  let entete = -1;
  for (let i = 0; i < lignes.length; i++) {
    const n = normaliser(lignes[i] ?? '').replace(/\s+/g, '').toLowerCase();
    /*
     * Les deux dialectes : « Parties du local » s'écrit avec ou sans espaces
     * parasites, et l'apostrophe voyage. On compare **sans accents ni
     * ponctuation** — l'intitulé cherché n'en porte aucun.
     *
     * ⚠️ On n'écrit PAS de plage accentuée du type `[^a-zà-ÿ]` : elle a été
     * silencieusement corrompue à l'écriture du fichier le 22/08, et la
     * détection rendait faux sans qu'aucun test unitaire ne le montre — les
     * cas de test passaient par une autre branche. Une classe de caractères
     * qui dépend de l'encodage du fichier est une bombe à retardement ; la
     * normalisation Unicode, non.
     */
    if (sansAccents(n).replace(/[^a-z]/g, '').startsWith('localisationpartiesdulocalraison')) {
      entete = i;
      break;
    }
  }
  if (entete < 0) {
    /* Sans en-tête de tableau, on ne sait pas où commence la rubrique : on le
       dit, plutôt que de ramasser des bouts de phrase. */
    const titre = lignes.some((l) =>
      normaliser(l ?? '').replace(/\s+/g, '').toLowerCase().startsWith("1.2.danslecadre")
    );
    return { lue: titre, neant: false, entrees: [] };
  }

  const entrees: LimiteAmiante[] = [];
  let neant = false;
  for (let j = entete + 1; j < Math.min(entete + 40, lignes.length); j++) {
    const brut = (lignes[j] ?? '').replace(/\s+/g, ' ').trim();
    const n = normaliser(brut).toLowerCase();
    if (/^2\.\s*[–-]/.test(n) || n.startsWith('certains locaux')) break;
    if (/^n[ée]ant\b/.test(n)) { neant = true; break; }
    if (n.replace(/\s+/g, '').includes(CLAUSE)) continue;
    if (/^localisation\s+parties du local/.test(n)) continue;
    if (brut.length < 3) continue;
    if (/^(sarl|dglm|rcs|n°siren|tél|rapport du)/i.test(brut)) continue;
    if (/^\d+\s*\/\s*\d+$/.test(brut)) continue;
    /*
     * Une ligne de tableau commence par un nom de local, c'est-à-dire par une
     * MAJUSCULE ou un chiffre d'étage. Un fragment de phrase commence par une
     * minuscule — et c'est ainsi qu'on les sépare, sans avoir à deviner.
     */
    if (!/^[A-Z0-9]/.test(sansAccents(brut))) continue;

    /*
     * ⚠️ MIEUX VAUT NE RIEN AFFICHER QU'AFFICHER UN FRAGMENT.
     *
     * La clause de style tient sur six lignes, et sa première — « Le diagnostic
     * se limite aux zones rendues » — passait tous les filtres précédents.
     * Plutôt que d'ajouter une rustine par fragment rencontré, on retourne la
     * règle : **on n'accepte que ce qui a la forme d'une ligne de tableau**,
     * c'est-à-dire au moins deux colonnes.
     *
     * Le § 1.2 en a trois — Localisation | Parties du local | Raison — et la
     * colonne du milieu vaut presque toujours « Toutes ». Une phrase coupée
     * n'a jamais cette forme.
     */
    const colonnes = /\s{2,}/.test(brut) || /\b(Toutes|Tous)\b/.test(brut);
    if (!colonnes) continue;
    entrees.push({ quoi: brut });
  }
  return { lue: true, neant, entrees };
}

/**
 * § 3.2.6 · LE PÉRIMÈTRE — `Descriptif des pièces visitées`.
 *
 * *C'est la rubrique qui alimente le bloc « ÉLÉMENTS CONTRÔLÉS » du visuel.*
 *
 * ⚠️ **Pourquoi pas le § 5.0.2, que le visuel semble pourtant décrire.** Sondé
 * le 22/08 sur le corpus DGLM : dans les volets négatifs — le cas même que le
 * mockup met en scène — les deux tableaux 5.0.1 et 5.0.2 répondent `Néant -`,
 * suivis de « Aucun autre matériau de la liste X n'a été repéré ». Ils ne
 * portent donc AUCUN inventaire de ce qui a été regardé. Le seul endroit qui en
 * porte un est le § 3.2.6.
 *
 * ## La forme, telle que l'extraction la rend
 *
 * La liste est imprimée **sur deux colonnes**, ce qui donne des lignes à deux
 * pièces, virgule comprise :
 *
 * ```
 * Descriptif des pièces visitées
 * Rez de chaussée - Entrée,      1er étage - Bureau,
 * Rez de chaussée - Dégagement,  1er étage - Combles 1,
 * ```
 *
 * La colonne de droite n'est pas la suite de celle de gauche — mais on ne
 * cherche pas un ordre, on cherche un ENSEMBLE : on découpe sur les virgules et
 * on garde les jetons.
 *
 * ## La signature d'une pièce est POSITIVE
 *
 * Un jeton n'est retenu que s'il a la forme `<niveau> - <pièce>` : c'est ainsi
 * que LICIEL écrit **toutes** les pièces des trois volets sondés. On ne retient
 * donc pas « ce qui n'est pas un pied de page » — on retient ce qui a la forme
 * d'une pièce. Le pied de page (`SARL … | Tél.`, `3 / 14`, `Rapport du :`) et
 * l'en-tête du tableau suivant (`Localisation Description`) tombent d'eux-mêmes.
 */
export function perimetreDe(lignes: readonly string[]): LectureAmiante['perimetre'] {
  let entete = -1;
  for (let i = 0; i < lignes.length; i++) {
    const n = sansAccents(normaliser(lignes[i] ?? '')).replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (n.startsWith('descriptifdespiecesvisitees')) {
      entete = i;
      break;
    }
  }
  if (entete < 0) return { lue: false, pieces: [] };

  /* `<niveau> - <pièce>` : un tiret entouré d'espaces, du texte de part et
     d'autre. C'est la forme, et rien d'autre n'est retenu. */
  const PIECE = /^[^,;]{2,40}\s-\s[^,;]{1,40}$/;

  const pieces: string[] = [];
  const vues = new Set<string>();
  for (let j = entete + 1; j < Math.min(entete + 30, lignes.length); j++) {
    const brut = (lignes[j] ?? '').replace(/\s+/g, ' ').trim();
    const n = sansAccents(brut).toLowerCase();
    /* Le tableau composant par composant commence après la liste : on s'arrête
       là. C'est un inventaire de matières, pas un constat d'amiante. */
    if (n.replace(/[^a-z]/g, '').startsWith('localisationdescription')) break;
    if (/^4[\s.]/.test(brut) || /^3\.3/.test(brut)) break;
    if (!brut) continue;

    for (const jeton of brut.split(',')) {
      const p = jeton.trim().replace(/[;.]$/, '');
      if (!PIECE.test(p)) continue;
      const cle = p.toLowerCase();
      if (vues.has(cle)) continue;
      vues.add(cle);
      pieces.push(p);
    }
  }
  return { lue: true, pieces };
}

/** Le laboratoire — § 2, rempli trois fois sur 130 volets. */
function laboratoireDe(lignes: readonly string[]): LectureAmiante['laboratoire'] {
  for (let i = 0; i < lignes.length; i++) {
    const n = normaliser(lignes[i] ?? '');
    const m = n.match(/Raison sociale et nom de l'entreprise\s*:\s*\.*\s*(.+)$/i);
    if (!m?.[1]) continue;
    const nom = m[1].replace(/^\.+/, '').trim();
    if (/il n'a pas [ée]t[ée] fait appel/i.test(nom) || /aucune analyse chimique/i.test(nom)) return undefined;
    if (!nom) continue;
    /*
     * ⚠️ Le numéro d'accréditation se cite BRUT.
     *
     * `normaliser` colle les tirets pour que « 13 - 9 » et « 13-9 » se
     * ressemblent — mais un Cofrac s'écrit « 1 - 0918 », et le coller le
     * déforme. Normaliser sert à trouver, jamais à restituer.
     */
    const suite = lignes.slice(i, i + 4).join(' ').replace(/\s+/g, ' ');
    const cofrac = suite.match(/accr[ée]ditation Cofrac\s*:\s*\.*\s*([\d][\d\s-]*\d)/i)?.[1]?.trim();
    return cofrac ? { nom, cofrac } : { nom };
  }
  return undefined;
}

/*
 * ⚠️ La désignation contient elle-même des parenthèses.
 *
 * « Revêtements durs (amiante - ciment) (RDC - Chambre 3) pour lequel… » : une
 * expression paresseuse prend la PREMIÈRE parenthèse pour la localisation et
 * ampute le matériau de ce qui le nomme — « amiante-ciment », justement. La
 * localisation est la DERNIÈRE parenthèse avant la suite.
 */
const LIGNE_MATERIAU = /^(.+)\s*\(([^()]*)\)\s*(?:pour lequel|\/)?\s*(.*)$/;

/** Les matériaux nommés sous chaque ligne à tiret du § 1.1. */
function materiauxDe(lignes: readonly string[]): MateriauAmiante[] {
  const out: MateriauAmiante[] = [];
  let etatCourant: IssueAmiante | null = null;
  let justifCourante: Justification = 'non précisée';

  for (const ligneBrute of lignes) {
    const brut = (ligneBrute ?? '').replace(/\s+/g, ' ').trim();
    const c = normaliser(brut).replace(/\s+/g, '').toLowerCase();

    if (/^-(de|des)matériaux/.test(c) || /^-(de|des)materiaux/.test(c)) {
      if (c.includes("necontenantpasd'amiante")) {
        etatCourant = 'absence';
        justifCourante = 'analyse en laboratoire';
      } else if (c.includes('pourlesquelsdessondages')) {
        etatCourant = 'nonConclu';
        justifCourante = 'non prélevé';
      } else if (c.includes("pourlesquelslesrésultatsd'analyse")) {
        etatCourant = 'nonConclu';
        justifCourante = 'résultats attendus';
      } else if (c.includes("contenantdel'amiante")) {
        etatCourant = 'presence';
        justifCourante = justificationDe([brut]);
      } else {
        etatCourant = null;
      }
      continue;
    }

    if (!etatCourant) continue;
    if (/^(1\.|2\.|liste [abc])/i.test(brut) || brut.startsWith('*')) {
      etatCourant = null;
      continue;
    }

    const m = brut.match(LIGNE_MATERIAU);
    if (!m?.[1] || !m[2]) continue;
    const suite = (m[3] ?? '').replace(/^il est recommandé de\s*/i, '').replace(/\*+$/, '').trim();
    out.push({
      quoi: m[1].trim(),
      ou: m[2].split(';').map((x) => x.trim()).filter(Boolean),
      issue: etatCourant,
      justification: justifCourante,
      ...(suite ? { suite } : {})
    });
  }
  return out;
}

/** La signature : la forme du gabarit, mesurée sur 126 volets. */
function reconnait(lignes: readonly string[]): Preuve | null {
  const c = nu(lignes);
  if (c.includes('paginationleprésentrapportaveclesannexescomprises'))
    return { preuve: 'Pagination : le présent rapport avec les annexes comprises, est constitué de N pages' };
  if (c.includes('1–lesconclusions') && c.includes('2–le(s)laboratoire(s)danalyses'))
    return { preuve: '1. – Les conclusions / 2. – Le(s) laboratoire(s) d’analyses' };
  return null;
}

export function lireAmianteLiciel(lignes: readonly string[]): LectureAmiante {
  const conclusions = conclusionsParListe(lignes);
  const materiaux = materiauxDe(lignes);

  /*
   * L'issue globale : une présence l'emporte sur tout ; à défaut, un
   * non-conclu l'emporte sur une absence. **Un dossier que le laboratoire n'a
   * pas rendu ne se referme pas.**
   */
  const etats = conclusions.map((c) => c.etat);
  const issue: IssueAmiante = etats.includes('presence')
    ? 'presence'
    : etats.includes('nonConclu')
      ? 'nonConclu'
      : 'absence';

  const phrase =
    lignes.find((l) => /Liste\s*[AB]\s*:/i.test(normaliser(l ?? '')))?.replace(/\s+/g, ' ').trim() ?? '';

  const laboratoire = laboratoireDe(lignes);
  return {
    mission: missionDe(lignes),
    issue,
    phrase,
    materiaux,
    limites: limitesDe(lignes),
    perimetre: perimetreDe(lignes),
    ...(laboratoire ? { laboratoire } : {})
  };
}

export const LECTEUR_AMIANTE_LICIEL: Lecteur<LectureAmiante> = {
  editeur: 'LICIEL',
  quoi: 'constat amiante',
  reconnait,
  lire: lireAmianteLiciel
};
