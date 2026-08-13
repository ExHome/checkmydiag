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
 *  - une **liste de domaines en anomalie**, sous la phrase « Anomalies avérées
 *    selon les domaines suivants ». Elle n'est imprimée que s'il y en a : c'est
 *    donc un constat, pas un formulaire — contrairement aux deux conclusions
 *    contradictoires imprimées côte à côte, dont la bonne est cochée à la main.
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
export function domainesEnAnomalie(lignes: string[]): string[] {
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
export function nonVisites(lignes: string[]): Releve[] {
  const releves: Releve[] = [];
  const debut = lignes.findIndex((l) =>
    /n['’]ayant pu [êe]tre visit[ée]es|non visit[ée]es et justification/i.test(l)
  );
  if (debut === -1) return releves;

  for (const ligne of lignes.slice(debut + 1, debut + 8)) {
    if (FIN_SECTION.test(ligne)) break;
    const l = ligne.trim();
    if (estBruit(l) || /^n[ée]ant$/i.test(l)) continue;

    // « 2ème étage - Combles (Absence de trappe de visite) »
    const m = l.match(/^(.{3,60}?)\s*\((.{3,80})\)\s*$/);
    const ou = m?.[1]?.trim();
    const raison = m?.[2]?.trim();
    releves.push(
      ou && raison
        ? { libelle: raison, ou, genre: 'nonVisite' }
        : { libelle: nettoyer(l), genre: 'nonVisite' }
    );
  }

  return releves;
}

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
