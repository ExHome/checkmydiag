/**
 * Les anomalies, une par une — et toutes.
 *
 * Jusqu'ici le moteur restituait un nombre : « 4 anomalies ». Le lecteur
 * savait combien, jamais lesquelles. C'est la règle qu'on répare ici :
 * *exhaustif dans le fond, sélectif dans l'affichage* — hiérarchiser n'est pas
 * supprimer.
 *
 * Ce que les rapports d'électricité et de gaz contiennent réellement :
 *
 *  - une **liste de domaines sous « Anomalies avérées selon les domaines
 *    suivants »**. On l'a longtemps prise pour un constat. Elle n'en est pas
 *    un : c'est le catalogue des domaines de l'arrêté du 28 septembre 2017,
 *    imprimé à l'identique dans TOUS les rapports, y compris ceux qui ne
 *    relèvent aucune anomalie. Mesuré sur le corpus : six domaines, les mêmes,
 *    dans 100 % des volets — 14 sur 14 des rapports sans anomalie comme 17 sur
 *    17 de ceux qui en ont. La croire faisait annoncer un défaut électrique à
 *    quatorze logements sur trente et un qui n'en avaient aucun.
 *  - des **libellés précis** (« B7.3 a — L'enveloppe d'au moins un matériel
 *    est… »), qui nomment le défaut exact.
 *  - les **parties non visitées** et les **points non vérifiés**, qui disent
 *    l'étendue réelle du contrôle. Une anomalie manquée parce qu'une pièce
 *    était fermée n'est pas une absence d'anomalie.
 */
import { compact } from './texte';

/** Ce qu'un rapport dit d'un point qui ne va pas, ou qu'il n'a pas pu voir. */
export interface Releve {
  /** Le texte du rapport, repris fidèlement. */
  libelle: string;
  /** Le code de la norme quand le rapport le donne : « B7.3 a ». */
  code?: string;
  /** Où, quand le rapport le précise. */
  ou?: string;
  genre: 'anomalie' | 'nonVisite' | 'nonVerifie' | 'complement';
}

/**
 * La phrase qui ouvre la liste des domaines en anomalie, et celles qui la
 * ferment. On s'arrête au premier titre de section rencontré : au-delà, le
 * rapport parle d'autre chose.
 */
const DEBUT_DOMAINES = /anomalies\s+av[ée]r[ée]es\s+selon\s+les\s+domaines\s+suivants/i;
const FIN_SECTION =
  /^\s*(?:\d\s*[.–-]|Domaines\b|Anomalies relatives|Informations compl[ée]mentaires|Points de contr[ôo]le|Nota\s*:|SARL|RCS)/i;

/** Une ligne qui n'apporte rien : numéro de page, pied de page, entête. */
function estBruit(ligne: string): boolean {
  const l = ligne.trim();
  if (l.length < 4) return true;
  if (/^\d+\s*\/\s*\d+$/.test(l)) return true;
  if (/^(?:Etat de l|État de l)/i.test(l)) return true;
  if (/T[ée]l\.?\s*:|RCS|SARL|Rapport du/i.test(l)) return true;
  return false;
}

/**
 * Les domaines en anomalie, tels que le rapport les énumère.
 *
 * Un domaine peut tenir sur plusieurs lignes : le rapport coupe où la colonne
 * se termine, pas où la phrase s'achève. On recolle donc jusqu'au point final,
 * sans quoi une anomalie compterait pour trois.
 */
/**
 * Les libellés du catalogue, tels que l'arrêté du 28 septembre 2017 les nomme.
 *
 * Ils sont génériques — ils décrivent le domaine contrôlé, jamais un défaut
 * constaté chez quelqu'un. C'est à cela qu'on les reconnaît, et c'est pour cela
 * qu'ils ne peuvent pas servir de verdict.
 */
const NOMS_DOMAINES = [
  'Coupure d’urgence',
  'Protection différentielle et mise à la terre',
  'Protection des circuits',
  'Salle d’eau',
  'Contacts directs',
  'Matériel vétuste ou inadapté'
];

/**
 * Le DÉBUT du libellé de chaque domaine, dans l'ordre où le rapport les
 * numérote — celui du catalogue.
 *
 * On ne peut pas exiger le libellé entier : dans le tableau, la colonne de
 * gauche est étroite et le nom du domaine y est coupé au bout de trois mots
 * (« 2. Dispositif de protection » et rien de plus, la suite du texte
 * appartenant déjà à la colonne d'à côté). Les domaines 2 et 3 commencent
 * pareil ; c'est le numéro qui les sépare.
 */
/**
 * L'en-tête du tableau des anomalies — et lui seul.
 *
 * Le rapport contient un second tableau, numéroté exactement pareil, qui
 * décrit l'installation au lieu de la juger : « 1. L'appareil général de |
 * Coupure de l'ensemble de l'installation électrique », « 2. Dispositif de
 * protection | Emplacement ». Deux rapports sans la moindre anomalie s'y
 * voyaient reprocher trois domaines en défaut. Ce qui les sépare est leur
 * en-tête : « Domaines Anomalies Photo » d'un côté, « Domaines Informations
 * complémentaires » de l'autre.
 */
const ENTETE_ANOMALIES = /^\s*Domaines\s+Anomalies/i;
const FIN_TABLEAU_ANOMALIES =
  /^\s*(?:Anomalies relatives|Informations compl[ée]mentaires|Domaines\s+Informations|\d\s*[.–-]\s*[–-]?\s*(?:Avertissement|Conclusion|Explications))/i;

const AMORCES_DOMAINE: RegExp[] = [
  /^L['’]appareil g[ée]n[ée]ral/i,
  /^Dispositif de protection/i,
  /^Dispositif de protection/i,
  /^(?:La\s+)?[Ll]iaison/i,
  /^Mat[ée]riels? [ée]lectriques?/i,
  /^Mat[ée]riels? [ée]lectriques?/i
];

const DOMAINES_CATALOGUE: RegExp[] = [
  /appareil g[ée]n[ée]ral de commande et de protection/i,
  /protection diff[ée]rentiel.{0,60}(?:origine de l'installation|prise de terre)/i,
  /protection contre les surintensit[ée]s adapt[ée]/i,
  /liaison [ée]quipotentielle.{0,80}(?:douche|baignoire)/i,
  /risques? de contacts? directs?.{0,60}sous tension/i,
  /mat[ée]riels? [ée]lectriques? v[ée]tustes?/i
];

/**
 * Cette liste est-elle le catalogue imprimé, ou un vrai constat ?
 *
 * Le catalogue énumère les domaines de la norme, tous, dans l'ordre. Un constat
 * n'en nomme que les concernés. Le seuil est à cinq domaines canoniques sur
 * six : en dessous, on lit un constat ; au-dessus, on lit le formulaire.
 *
 * Le doute profite au silence. Un générateur qui n'imprimerait que les domaines
 * réellement en anomalie, et qui en aurait cinq, serait tu à tort — on perd une
 * information, on n'en invente pas une fausse.
 */
export function estCatalogueDomaines(domaines: string[]): boolean {
  if (domaines.length < 5) return false;
  const texte = domaines.join(' | ');
  return DOMAINES_CATALOGUE.filter((m) => m.test(texte)).length >= 5;
}

/**
 * Les domaines que le rapport énumère — vidés quand ce n'est que le catalogue.
 *
 * `brutes` rend la liste telle qu'elle est imprimée, pour les sondes et pour
 * qui veut la voir ; `domainesEnAnomalie` ne rend que ce qui constate.
 */
export function domainesEnumeres(lignes: string[]): string[] {
  const debut = lignes.findIndex((l) => DEBUT_DOMAINES.test(l));
  if (debut === -1) return [];

  const domaines: string[] = [];
  let encours = '';

  for (const ligne of lignes.slice(debut + 1)) {
    if (FIN_SECTION.test(ligne)) break;
    if (estBruit(ligne)) continue;

    encours = encours ? `${encours} ${ligne.trim()}` : ligne.trim();

    // Le point final ferme le domaine. Certains rapports l'oublient sur le
    // dernier : la boucle le récupère à la sortie.
    if (/[.;]\s*$/.test(encours)) {
      domaines.push(nettoyer(encours));
      encours = '';
    }
  }

  if (encours.trim().length > 12) domaines.push(nettoyer(encours));

  // Un même domaine peut être répété par la mise en page (colonne reprise en
  // haut de page suivante).
  return [...new Set(domaines)].filter((d) => d.length > 12);
}

/**
 * Les domaines que le rapport CONSTATE, dans son tableau d'anomalies.
 *
 * Sous le catalogue vient un tableau « Domaines | Anomalies | Photo » où seuls
 * les domaines concernés figurent — et, eux, sont numérotés : « 2. Dispositif
 * de protection différentiel… ». C'est la seule marque que la mise en page
 * laisse passer : le texte des deux colonnes s'entrelace, mais le numéro reste
 * en tête de ligne.
 *
 * Lu dans un rapport de 2024 qui relevait cinq domaines en anomalie là où le
 * catalogue, imprimé juste au-dessus, en énumérait six sans rien dire.
 */
export function domainesConstates(lignes: string[]): { numero: number; nom: string }[] {
  const vus = new Map<number, string>();
  let dansLeTableau = false;

  for (const ligne of lignes) {
    if (ENTETE_ANOMALIES.test(ligne)) {
      dansLeTableau = true;
      continue;
    }
    if (dansLeTableau && FIN_TABLEAU_ANOMALIES.test(ligne)) dansLeTableau = false;
    if (!dansLeTableau) continue;

    const m = ligne.match(/^\s*([1-6])\s*[.)]\s+(.{6,})$/);
    if (!m) continue;
    const numero = Number(m[1]);
    const attendu = AMORCES_DOMAINE[numero - 1];
    // Le numéro seul ne suffirait pas — « 6. – Avertissement particulier » en
    // porte un. C'est l'accord du numéro ET du début de libellé qui décide.
    if (!attendu || !attendu.test(m[2] ?? '')) continue;
    if (!vus.has(numero)) vus.set(numero, NOMS_DOMAINES[numero - 1] ?? '');
  }

  return [...vus.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([numero, nom]) => ({ numero, nom }));
}

/** Les domaines réellement constatés : rien, quand la liste est le catalogue. */
export function domainesEnAnomalie(lignes: string[]): string[] {
  const enumeres = domainesEnumeres(lignes);
  return estCatalogueDomaines(enumeres) ? [] : enumeres;
}

function nettoyer(texte: string): string {
  return texte
    .replace(/\s+/g, ' ')
    .replace(/\s*[.;]\s*$/, '')
    .replace(/^[-–•\s]+/, '')
    .trim();
}

/** Les libellés précis, quand le rapport les détaille. */
export function libellesPrecis(lignes: string[]): Releve[] {
  const releves: Releve[] = [];

  for (const [i, ligne] of lignes.entries()) {
    const m = ligne.match(/Libell[ée] de l'anomalie\s*:\s*(?:([A-Z]\s?\d+(?:\.\d+)*\s*[a-z]?)\s+)?(.*)$/i);
    if (!m) continue;

    // Le libellé déborde souvent sur la ligne suivante.
    let texte = (m[2] ?? '').trim();
    const suite = lignes[i + 1]?.trim();
    if (suite && !/Libell[ée]|^Photo|^\d+\s*\/\s*\d+$/i.test(suite) && !/[.]$/.test(texte)) {
      texte = `${texte} ${suite}`;
    }

    const libelle = nettoyer(texte);
    if (libelle.length < 8) continue;

    releves.push({
      libelle,
      genre: 'anomalie',
      ...(m[1] ? { code: m[1].replace(/\s+/g, '') } : {})
    });
  }

  return releves;
}

/**
 * Ce que le diagnostiqueur n'a pas pu voir.
 *
 * C'est une information que le lecteur doit avoir : elle borne la portée du
 * rapport. « Rien trouvé » et « rien trouvé, mais les combles étaient fermés »
 * ne veulent pas dire la même chose.
 */
/*
 * Les intitulés sous lesquels les rapports ouvrent cette rubrique.
 *
 * Mesuré sur quarante dossiers : la seule forme reconnue jusqu'ici — « parties
 * n'ayant pu être visitées » — en couvre vingt-trois. « Pièces non visitées »,
 * qu'on ne cherchait pas, en couvre trente-trois. Et trente-huit rapports
 * ouvrent une rubrique de périmètre sous un titre ou un autre.
 *
 * C'est la rubrique la plus importante d'un diagnostic et la moins lue : elle
 * dit ce que la conclusion ne couvre pas.
 */
const OUVRE_PERIMETRE =
  /n['’]ayant pu [êe]tre visit[ée]es|non visit[ée]es? et justification|pi[eè]ces? non visit[ée]es?|parties? non visit[ée]es?|locaux non visit[ée]s|zones? non contr[ôo]l[ée]es?|[ée]l[ée]ments? non contr[ôo]l[ée]s?/i;

export function nonVisites(lignes: string[]): Releve[] {
  const releves: Releve[] = [];
  const debut = lignes.findIndex((l) => OUVRE_PERIMETRE.test(l));
  if (debut === -1) return releves;

  for (const ligne of lignes.slice(debut + 1, debut + 8)) {
    if (FIN_SECTION.test(ligne)) break;
    const l = ligne.trim();
    if (estBruit(l) || /^n[ée]ant$/i.test(l)) continue;

    // « 2ème étage - Combles (Absence de trappe de visite) »
    const m = l.match(/^(.{3,60}?)\s*\((.{3,80})\)\s*$/);
    const ou = m?.[1]?.trim();
    const raison = m?.[2]?.trim();

    /*
     * Un empêchement, ou rien.
     *
     * L'élargissement des intitulés a fait remonter cent quatre-vingt-dix-huit
     * relevés, dont cent cinquante-huit sans le moindre motif d'empêchement —
     * des lignes de tableau d'une attestation de surface, prises pour des
     * parties non visitées. Afficher « le diagnostiqueur n'a pas pu voir ceci »
     * sur une ligne qui ne le dit pas, c'est fabriquer l'angle mort qu'on
     * prétend signaler.
     *
     * Une ligne n'est donc retenue que si elle porte un motif — trappe
     * condamnée, local encombré, meublé, fermé, inaccessible — ou la forme
     * « endroit (raison) » que les rapports d'électricité emploient.
     */
    if (!(ou && raison) && !EMPECHEMENT.test(l)) continue;

    releves.push(
      ou && raison
        ? { libelle: raison, ou, genre: 'nonVisite' }
        : { libelle: nettoyer(l), genre: 'nonVisite' }
    );
  }

  return releves;
}

/** Ce qui fait d'une ligne un empêchement, et non une ligne de tableau. */
const EMPECHEMENT =
  /trappe|encombr|meubl|occup[ée]|ferm[ée]|condamn|inaccessible|non accessible|hauteur|absence d|pas d['’]acc[eè]s|verrouill|scell|sans acc[eè]s|non visit/i;

/**
 * Tout ce que le rapport signale, sans arbitrage.
 *
 * L'ordre compte : les anomalies d'abord — c'est ce qui engage —, puis ce qui
 * n'a pas pu être contrôlé. Aucun tri par « intérêt » : le produit restitue,
 * il ne choisit pas.
 */
export function releverTout(lignes: string[]): Releve[] {
  const domaines = domainesEnAnomalie(lignes).map(
    (d): Releve => ({ libelle: d, genre: 'anomalie' })
  );
  const precis = libellesPrecis(lignes);

  // Un libellé précis décrit souvent un domaine déjà listé : on ne compte pas
  // deux fois la même anomalie. La comparaison se fait sur le texte compacté,
  // la mise en page variant d'un rapport à l'autre.
  const vus = new Set(domaines.map((d) => compact(d.libelle).slice(0, 40)));
  const complements = precis.filter((p) => !vus.has(compact(p.libelle).slice(0, 40)));

  return [...domaines, ...complements, ...nonVisites(lignes)];
}
