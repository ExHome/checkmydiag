/**
 * CREP — constat de risque d'exposition au plomb.
 *
 * Le rapport classe chaque « unité de diagnostic » (une porte, une plinthe, un
 * mur…) de 0 à 3. Seules les classes 2 et 3 comptent vraiment, et la 3 déclenche
 * une obligation de travaux.
 */
import type { Diagnostic, Fait, Gravite } from '../modele';
import { nombre, contient } from './texte';
import { dateDuRapport } from './dateRapport';
import { enDate } from './coherence';

/**
 * Le tableau de conclusion se présente ainsi :
 *   « Total Non mesurées Classe 0 Classe 1 Classe 2 Classe 3 »
 *   « Nombre d’unités »
 *   « 70 33 36 0 0 1 »
 * On cherche donc la première ligne de six nombres qui suit l'en-tête.
 */
function compter(lignes: string[]): {
  total: number;
  nonMesurees: number;
  classes: [number, number, number, number];
} | null {
  const debut = lignes.findIndex((l) => /Total.*Non mesur.*Classe 0/i.test(l));
  const zone = debut >= 0 ? lignes.slice(debut, debut + 6) : lignes;

  for (const ligne of zone) {
    const brut = ligne.trim();
    if (brut.includes('%')) continue;
    const nombres = brut.match(/\d+/g);
    if (!nombres || nombres.length < 6) continue;
    const n = nombres.slice(0, 6).map(Number) as [number, number, number, number, number, number];
    const [total, nonMesurees, c0, c1, c2, c3] = n;
    // Contrôle de cohérence : la somme doit retomber sur le total.
    if (nonMesurees + c0 + c1 + c2 + c3 !== total) continue;
    return { total, nonMesurees, classes: [c0, c1, c2, c3] };
  }
  return null;
}

/** Éléments que le CREP mesure, tels qu'ils sont nommés dans le tableau. */
const ELEMENTS =
  /^(?:[A-Z]\s+)?(Plinthes?|Portes?(?:\s*\([^)]*\))?|Murs?|Plafonds?|Fen[êe]tres?(?:\s*\([^)]*\))?|Sols?|Volets?|Placards?|Radiateurs?|Escaliers?|Rampes?|Cloisons?|Huisseries?)\b/i;

/**
 * Noms de pièce, écrits seuls sur une ligne au-dessus de leur bloc de mesures.
 *
 * Le NIVEAU précède souvent le nom — « Rez de jardin - Salle de bain 01 »,
 * « 1er étage - Chambre 02 » —, et le motif l'ignorait : ancré au début de la
 * ligne, il ne reconnaissait que les pièces écrites seules. Sur un constat où
 * toutes les pièces portent leur étage, aucune n'était rattachée, et le plomb
 * ressortait « emplacement non précisé » d'un bout à l'autre.
 *
 * Le numéro qui suit parfois le nom — « Salle de bain 01 » — est admis pour la
 * même raison.
 */
const NIVEAU = String.raw`(?:(?:Rez[\s-]*de[\s-]*(?:chauss[ée]e|jardin)|Sous[\s-]*sol|\d+\s*[èe]?me?\s*[ée]tage|\d+er\s*[ée]tage|Combles?)\s*[-–]\s*)?`;

const PIECES = new RegExp(
  '^' +
    NIVEAU +
    String.raw`(Cuisine|S[ée]jour|Salon|Chambre\s*\d*|Salle de bain|Salle d'eau|WC|Toilettes|Couloir|D[ée]gagement|Entr[ée]e|Buanderie|Atelier|Chaufferie|Cellier|Garage|Cave|Grenier|Combles|Balcon|Loggia|Terrasse|Jardin|Ext[ée]rieur|Palier|Escalier|Bureau|Mezzanine|Pi[èe]ce)(?:\s*\d+)?(\s*\/\s*\S.*)?$`,
  'i'
);

/**
 * Où se trouve le plomb, pièce par pièce.
 *
 * Le tableau de mesures donne une ligne par élément contrôlé, terminée par son
 * classement (0 à 3). Le nom de la pièce, lui, est écrit une seule fois
 * au-dessus du bloc : on le mémorise et on l'applique aux lignes qui suivent.
 */
function emplacements(lignes: string[]): { zone: string; element: string; classe: number }[] {
  const trouves: { zone: string; element: string; classe: number }[] = [];
  let zone = '';

  for (const ligne of lignes) {
    const brut = ligne.trim();

    const piece = brut.match(PIECES);
    if (piece?.[1] && brut.length < 40) {
      zone = brut;
      continue;
    }

    const element = brut.match(ELEMENTS);
    if (!element?.[1]) continue;

    // Le classement est le dernier entier de la ligne, entre 0 et 3.
    const nombres = brut.match(/(?:^|\s)([0-3])(?:\s|$)/g);
    const dernier = nombres?.[nombres.length - 1]?.trim();
    if (dernier === undefined) continue;

    const classe = Number(dernier);
    if (!Number.isInteger(classe) || classe < 0 || classe > 3) continue;

    trouves.push({ zone: zone || 'Emplacement non précisé', element: element[1], classe });
  }

  return trouves;
}

/*
 * Les facteurs de dégradation du bâti se lisaient au mot-clé. La norme dit
 * qu'ils sont cinq, et lesquels.
 *
 * Le constat ne fait pas que classer des revêtements : il « dresse un relevé
 * sommaire des facteurs de dégradation du bâti » (article L. 1334-5 du code de
 * la santé publique, lu le 15/08/2026), que l'auteur consigne en liste (article
 * R. 1334-10).
 *
 * Ce n'est pas une rubrique de plus. Quand ces facteurs apparaissent, l'auteur
 * du constat transmet immédiatement une copie du rapport à l'autorité — et cela
 * ne dépend pas de la classe des revêtements.
 *
 * ## Ce que la lecture de NF X 46-030 a corrigé
 *
 * Une version antérieure cherchait trois familles de mots — humidité, effondre-
 * ment, revêtements dégradés — dans les six cents caractères qui suivent le
 * titre de la rubrique. Elle se trompait deux fois.
 *
 * Le § 12 de la norme (avril 2008, lue en entier le 20/08/2026) **énumère cinq
 * facteurs, et la liste est fermée** : les deux seuils de classe 3 (50 % dans un
 * local, 20 % sur l'ensemble), le plancher ou plafond menaçant, les coulures et
 * ruissellements, les moisissures et taches d'humidité.
 *
 * 1. **Les deux seuils manquaient.** Ce sont pourtant les facteurs n° 1 et n° 2,
 *    et ils sont les seuls qui se calculent au lieu de s'observer.
 * 2. **« Revêtements dégradés » n'existe pas.** Écaillage, cloquage, faïençage,
 *    pulvérulence sont la définition de la **classe 3** au § 10 — l'état d'un
 *    revêtement, pas un facteur de dégradation du bâti. Les compter ici faisait
 *    afficher un facteur sur un constat dont la rubrique répond NON aux cinq.
 *
 * La rubrique est un formulaire à cinq lignes et deux colonnes OUI/NON. On la
 * lit donc comme un formulaire — voir `alertesDuCrep`.
 */

/**
 * Ce que le constat conclut sur l'enfant et sur l'insalubrité.
 *
 * Le CREP ne sert pas qu'à mesurer du plomb. Son propre rappel réglementaire le
 * dit : il mesure les revêtements **et** « repère les facteurs de dégradation du
 * bâti permettant d'identifier les situations d'insalubrité ».
 *
 * Certains rapports répondent donc à deux questions que les autres laissent au
 * lecteur, et ce sont les deux qui comptent vraiment.
 *
 * **Le saturnisme infantile**, avec ses deux seuils réglementaires :
 *
 *     Au moins une pièce présente au moins 50 % d'unités en classe 3    NON
 *     L'ensemble des locaux présente au moins 20 % d'unités en classe 3 NON
 *
 * **La dégradation du bâti**, avec ses trois situations, la pièce concernée, et
 * la suite qui lui a été donnée :
 *
 *     …au moins un plancher ou plafond menaçant de s'effondrer          OUI
 *     Liste des pièces concernées : Cave
 *     Le rapport a été envoyé à l'agence régionale de santé.
 *
 * Un plafond qui menace de tomber, et un signalement aux autorités sanitaires —
 * dans un volet qu'on croit consacré au plomb.
 *
 * ## Où la réponse se trouve, et pourquoi ce n'est pas là qu'on la croit
 *
 * Ces deux encarts occupent la colonne de droite d'un tableau à deux colonnes,
 * dont la gauche porte le décompte des classes. L'extraction les entrelace, et
 * la réponse termine la **première** ligne du libellé — celle où il commence,
 * pas celle où il se reconnaît :
 *
 *     Unités de diagnostic en classe 2 : 0 0.0 % Les locaux … au moins un   OUI
 *     plancher ou plafond menaçant de s'effondrer ou en
 *     Unités de diagnostic en classe 3 : 0 0.0 %
 *     partie ou tout effondré
 *
 * Le mot qui identifie la situation — « plancher », « coulure », « 50 % » — est
 * donc sur une ligne qui ne porte jamais la réponse. On repère la situation à
 * son mot, puis on **remonte** de trois lignes au plus jusqu'à la première qui
 * se termine par OUI ou NON.
 *
 * Chercher les deux sur la même ligne ne trouve rien ; les chercher dans le
 * bloc recollé confond la réponse d'une situation avec celle de sa voisine.
 */
export interface AlerteCrep {
  /**
   * LE TERME DU RAPPORT, ENTIER — jamais reformulé, jamais tronqué.
   *
   * « Je veux que les termes extraits restent conformes dans Verrière. On les
   * explique après. On n'extrapole pas. » — Aude, 21/08/2026.
   *
   * Une première version écrivait « une pièce au moins a la moitié de ses
   * surfaces en plomb dégradé » là où l'arrêté écrit « Au moins un local parmi
   * les locaux objets du constat présente au moins 50 % d'unités de diagnostic
   * de classe 3 ». C'était une paraphrase : un notaire n'y retrouvait plus son
   * libellé, et « unité de diagnostic » — la notion qui porte tout le CREP —
   * avait disparu.
   *
   * Ce champ porte donc le libellé réglementaire. L'explication vit à côté.
   */
  terme: string;
  /**
   * Laquelle des deux listes de l'article 8.
   *
   * L'arrêté du 19 août 2011 (lu en entier le 20/08/2026) ne fait pas un tas
   * des cinq situations : il en nomme **deux groupes**, et ils ne parlent pas de
   * la même chose.
   *
   * Les deux premières — un local à 50 % de classe 3, l'ensemble à 20 % — sont
   * les **situations de risque de saturnisme infantile** : elles portent sur le
   * plomb, et sur l'enfant.
   *
   * Les trois autres — plancher menaçant, coulures, moisissures — sont les
   * **situations de dégradation du bâti** : elles ne parlent plus de plomb du
   * tout, mais de l'état du logement.
   *
   * NF X 46-030 les rangeait toutes sous « facteurs de dégradation du bâti » —
   * mais elle date de 2008 et s'appuie sur l'arrêté du 25 avril 2006, que celui
   * de 2011 a **abrogé**. C'est l'arrêté qui fait foi, et c'est lui que les
   * éditeurs suivent : un rapport du corpus imprime exactement ses deux encarts,
   * sous leurs deux intitulés.
   */
  groupe: 'saturnisme' | 'bati';
  /** Ce que le terme veut dire, dans nos mots — APRÈS lui, jamais à sa place. */
  explique: string;
  /** La pièce, quand le rapport la nomme. */
  ou?: string;
}

/**
 * Le mot par lequel chaque situation se reconnaît.
 *
 * Jamais le début du libellé — les cinq commencent pareil, « Les locaux objets
 * du constat présentent… » — mais ce qui les distingue, et qui tombe toujours
 * sur une ligne de continuation.
 */
const SITUATIONS: {
  cle: string;
  groupe: 'saturnisme' | 'bati';
  motif: RegExp;
  /* Le libellé de l'article 8 de l'arrêté du 19 août 2011, mot pour mot. */
  terme: string;
  explique: string;
}[] = [
  /*
   * ⚠️ « de classe 3 » ne peut PAS entrer dans le motif.
   *
   * Lecture 40 des cinquante volets — rapport 22/IMO/0340, LICIEL, et le seul du
   * corpus qui coche cette situation :
   *
   *     Au moins un local … présente au moins 50% d'unités de diagnostic
   *     OUI
   *     de classe 3
   *
   * Le libellé est coupé, et « de classe 3 » tombe DERRIÈRE la réponse. Exiger
   * les deux sur la même ligne, c'était ne jamais reconnaître cette situation
   * chez LICIEL — soit 40 % du marché, et le seul OUI mesuré.
   *
   * « 50 % d'unités de diagnostic » suffit à distinguer : dans une rubrique
   * bornée à ses cinq lignes, aucune autre situation ne porte ce nombre. Et le
   * « au » initial ne peut pas non plus être exigé — chez BC2E il termine la
   * ligne précédente.
   */
  {
    cle: 'piece50',
    groupe: 'saturnisme' as const,
    motif: /moins 50\s*%\s*d'unit[ée]s de diagnostic/i,
    terme:
      'Au moins un local parmi les locaux objets du constat présente au moins 50 % d’unités de diagnostic de classe 3',
    explique:
      'Dans une pièce au moins, une surface mesurée sur deux porte du plomb qui s’écaille.'
  },
  {
    cle: 'locaux20',
    groupe: 'saturnisme' as const,
    /* Même raison : chez LICIEL comme chez BC2E, « de classe 3 » ou « en classe
       3 » peut basculer sur la ligne suivante. Le nombre distingue à lui seul. */
    motif: /moins 20\s*%\s*d'unit[ée]s de diagnostic/i,
    terme:
      'L’ensemble des locaux objets du constat présente au moins 20 % d’unités de diagnostic de classe 3',
    explique:
      'Sur tout le logement, une surface mesurée sur cinq porte du plomb qui s’écaille.'
  },
  {
    cle: 'effondrement',
    groupe: 'bati' as const,
    motif: /plancher ou plafond mena[çc]ant de s'effondrer/i,
    terme:
      'Les locaux objets du constat présentent au moins un plancher ou plafond menaçant de s’effondrer ou en tout ou partie effondré',
    explique: 'Un plancher ou un plafond menace de tomber, ou s’est déjà effondré.'
  },
  {
    cle: 'coulure',
    groupe: 'bati' as const,
    motif: /importantes de coulure/i,
    terme:
      'Les locaux objets du constat présentent des traces importantes de coulures ou de ruissellement ou d’écoulement d’eau sur plusieurs unités de diagnostic d’une même pièce',
    explique: 'L’eau coule ou ruisselle sur plusieurs surfaces d’une même pièce.'
  },
  {
    /*
     * Le mot seul suffit, et il vaut mieux que la phrase.
     *
     * La norme se contredit elle-même : son § 12 écrit « de nombreuses taches
     * d'humidité », son annexe C — celle que les éditeurs recopient — écrit
     * « de tâches d'humidité », sans « nombreuses » et avec l'accent circonflexe.
     * Exiger la phrase revenait à ne reconnaître qu'une des deux versions.
     *
     * Dans une rubrique bornée à ses cinq lignes, « moisissures » n'apparaît que
     * sur celle-ci.
     */
    cle: 'moisissures',
    groupe: 'bati' as const,
    motif: /moisissures/i,
    terme:
      'Les locaux objets du constat présentent plusieurs unités de diagnostic d’une même pièce recouvertes de moisissures ou de nombreuses tâches d’humidité',
    explique: 'Plusieurs surfaces d’une même pièce sont moisies ou tachées d’humidité.'
  }
];

/**
 * Mettre les lignes dans une seule orthographe avant de les chercher.
 *
 * Lecture 44 des cinquante volets — le rapport 25/IMO/1001P sort d'une autre
 * version du moteur PDF, et l'extraction rend :
 *
 *     d ’ unités        au lieu de   d’unités
 *     s ’ effondrer     au lieu de   s’effondrer
 *     L.1334-10         au lieu de   L.1334 - 10
 *
 * Tous les motifs de ce fichier échouaient sur ce rapport : ils cherchaient
 * `d['’]unités`, ils trouvaient `d ’ unités`. Et symétriquement, ceux qui
 * toléraient les espaces du tiret de `L.1334 - 10` ne le trouvaient plus ici.
 *
 * Un motif qui décrit l'orthographe d'un seul moteur de rendu n'est pas un
 * motif, c'est une coïncidence. On normalise donc d'abord — apostrophe unique,
 * pas d'espace autour d'elle, pas d'espace dans les tirets internes aux
 * références d'articles — et les motifs n'ont plus qu'une forme à connaître.
 *
 * Ce qui est normalisé sert à CHERCHER. Ce qui s'affiche reste le texte du
 * rapport : « on n'extrapole pas » vaut aussi pour la ponctuation.
 */
function normaliser(ligne: string): string {
  return ligne
    .replace(/[’‘‚`´]/g, "'")
    .replace(/\s*'\s*/g, "'")
    .replace(/(\b[A-Z]\.\s?\d{3,4})\s*-\s*(\d)/g, '$1-$2')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * L'intitulé des deux rubriques. Hors d'elles, on ne lit rien.
 *
 * LICIEL titre « Situations de dégradation DE bâti », la norme « DU bâti » :
 * les deux articles circulent.
 */
const RUBRIQUES_SITUATIONS =
  /Situations? de risque de saturnisme infantile|Situations? de d[ée]gradation d[eu] b[âa]ti/i;

/**
 * Ce qui referme les rubriques.
 *
 * ⚠️ Le § 6.5 doit en faire partie, et c'était l'oubli.
 *
 * Chez LICIEL, la rubrique suivante — « 6.5 Transmission du constat à l'agence
 * régionale de santé » — est elle aussi un formulaire, avec sa propre réponse
 * OUI/NON. Sans borne, la cinquième situation pouvait lui emprunter la sienne.
 *
 * Une rubrique se borne au titre suivant, jamais à la fin de la page : lecture
 * 40, les situations 1 à 3 sont sur une page et les 4 et 5 sur la suivante,
 * séparées par le pied de page et le numéro de page.
 */
const FIN_DES_SITUATIONS =
  /Rappel du cadre r[ée]glementaire|atteste que le pr[ée]sent constat|Dur[ée]e du?e? validit[ée]|^\s*6\s*\.\s*5\b|Transmission du constat/i;

/**
 * Une réponse de formulaire, et sa place sur la ligne.
 *
 * ⚠️ Il n'y a PAS de place fixe. Onze volets LICIEL lus à la file donnent quatre
 * mises en page pour la même case :
 *
 *     lecture 44   « NON Si le constat identifie… »          → en tête
 *     lecture 43   « NON jours ouvrables, une copie… »       → en tête, ligne 2
 *     lecture 41   « NON » seule, entre les deux lignes
 *     lecture 42   « NON » seule, après les deux lignes
 *
 * et BC2E, lui, la met en FIN de la première ligne du libellé. Aucune règle
 * d'ordre de ligne ne survit à ces cinq cas — ni « la réponse termine la
 * première ligne », ni « la i-ième réponse répond à la i-ième question ».
 *
 * Ce qui reste vrai partout : la réponse est un mot isolé, collé au bord de sa
 * ligne, jamais au milieu d'une phrase. C'est cela qu'on reconnaît.
 *
 * Les capitales sont exigées : en minuscules, « non » termine une phrase
 * ordinaire sur deux. Le formulaire, lui, coche en capitales.
 */
function reponseDeLaLigne(ligne: string): 'OUI' | 'NON' | null {
  const t = ligne.trim();
  const m = /^(OUI|NON)$/.exec(t) ?? /^(OUI|NON)\s+\S/.exec(t) ?? /\s(OUI|NON)$/.exec(t);
  return m?.[1] === 'OUI' ? 'OUI' : m?.[1] === 'NON' ? 'NON' : null;
}

/**
 * La réponse la plus proche du libellé, et qui n'est pas déjà prise.
 *
 * On cherche des deux côtés parce que les éditeurs la mettent des deux côtés, et
 * on garde la plus proche. Une réponse consommée par une situation ne peut plus
 * l'être par sa voisine : c'est ce qui empêche une case de servir deux fois
 * quand deux situations se suivent sans ligne de séparation.
 *
 * La fenêtre est étroite — trois lignes en amont, deux en aval — parce que
 * au-delà on est déjà dans la situation d'à côté.
 */
function reponsePour(
  zone: string[],
  i: number,
  consommees: Set<number>
): 'OUI' | 'NON' | undefined {
  let meilleure: { distance: number; ligne: number; valeur: 'OUI' | 'NON' } | undefined;

  for (let j = Math.max(0, i - 3); j <= Math.min(zone.length - 1, i + 2); j++) {
    if (consommees.has(j)) continue;
    const valeur = reponseDeLaLigne(zone[j] ?? '');
    if (!valeur) continue;
    const distance = Math.abs(j - i);
    if (!meilleure || distance < meilleure.distance) meilleure = { distance, ligne: j, valeur };
  }

  if (!meilleure) return undefined;
  consommees.add(meilleure.ligne);
  return meilleure.valeur;
}

/**
 * Borner la rubrique — et ne pas se tromper de rubrique.
 *
 * L'intitulé des situations apparaît DEUX fois chez LICIEL : au sommaire, puis
 * en page 15. Le sommaire vient en premier, et il ne contient rien. On garde
 * donc la première occurrence dont la zone porte réellement une situation.
 */
function zoneDesSituations(lignes: string[]): [debut: number, fin: number] | null {
  for (let debut = 0; debut < lignes.length; debut++) {
    if (!RUBRIQUES_SITUATIONS.test(lignes[debut] ?? '')) continue;

    const apres = lignes.slice(debut + 1).findIndex((l) => FIN_DES_SITUATIONS.test(l));
    const fin = apres < 0 ? Math.min(debut + 40, lignes.length) : debut + 1 + apres;

    if (lignes.slice(debut, fin).some((l) => SITUATIONS.some((s) => s.motif.test(l)))) {
      return [debut, fin];
    }
  }
  return null;
}

export function alertesDuCrep(lignes: string[]): AlerteCrep[] {
  const normalisees = lignes.map(normaliser);
  const bornes = zoneDesSituations(normalisees);
  if (!bornes) return [];

  const zone = normalisees.slice(bornes[0], bornes[1]);
  /* On CHERCHE sur les lignes normalisées, on CITE sur celles du rapport : le
     nom d'une pièce s'affiche avec l'apostrophe que le rapport y a mise. */
  const brutes = lignes.slice(bornes[0], bornes[1]);

  const alertes: AlerteCrep[] = [];
  const vues = new Set<string>();
  const consommees = new Set<number>();

  for (let i = 0; i < zone.length; i++) {
    const situation = SITUATIONS.find((s) => s.motif.test(zone[i] ?? ''));
    if (!situation || vues.has(situation.cle)) continue;

    const reponse = reponsePour(zone, i, consommees);

    /* Sans réponse lisible, on ne conclut pas : le libellé seul est un intitulé
       de formulaire, imprimé que la réponse soit oui ou non. */
    if (reponse === undefined) continue;
    vues.add(situation.cle);
    if (reponse !== 'OUI') continue;

    /*
     * La pièce est nommée plus bas, et le rapport laisse traîner devant elle la
     * virgule d'une liste vide — « Liste des pièces concernées : , Cave ». On
     * s'arrête à la situation suivante pour ne pas lui emprunter la sienne.
     */
    let ou: string | undefined;
    for (let j = i + 1; j < Math.min(i + 7, zone.length); j++) {
      const ligne = zone[j] ?? '';
      const m = /Liste des pi[èe]ces concern[ée]es\s*:\s*(.+)/i.exec(brutes[j] ?? ligne);
      if (m?.[1]) {
        const propre = m[1].replace(/^[,;\s]+/, '').replace(/\s+/g, ' ').trim();
        if (propre) ou = propre;
        break;
      }
      if (SITUATIONS.some((s) => s.motif.test(ligne))) break;
    }

    const base = {
      groupe: situation.groupe,
      terme: situation.terme,
      explique: situation.explique
    };
    alertes.push(ou ? { ...base, ou } : base);
  }

  return alertes;
}

export function analyserPlomb(lignes: string[], plage: [number, number]): Diagnostic {
  const chiffres = compter(lignes);
  const c1 = chiffres?.classes[1] ?? 0;
  const c2 = chiffres?.classes[2] ?? 0;
  const c3 = chiffres?.classes[3] ?? 0;
  /*
   * Positif ou négatif : c'est la PRÉSENCE qui compte, pas la dégradation.
   *
   * Une seule unité de classe 1 rend le constat positif — le texte parle de
   * revêtements au-dessus des seuils, pas de leur état. Un logement dont les
   * peintures au plomb sont intactes a donc un constat qui périme : un an à la
   * vente, six ans à la location. C'est l'inverse d'un constat négatif, valable
   * sans limite de durée (article R. 1334-11 du code de la santé publique).
   */
  const positif = c1 + c2 + c3 > 0;
  const alertes = alertesDuCrep(lignes);
  /*
   * Le signalement à l'ARS : une information que personne ne voit.
   *
   * Elle est en page 15 sur 19 chez un éditeur, en page 2 sur 8 chez un autre,
   * et elle dit que le logement a été signalé à l'administration sanitaire. Ce
   * n'est ni une sanction ni une interdiction, mais un vendeur l'ignore souvent
   * et un acquéreur ne la trouve jamais.
   */
  const signale = transmisALArs(lignes);
  const validiteLue = validiteDuConstat(lignes) ?? undefined;

  let gravite: Gravite = 'neutre';
  let verdict = "Un constat plomb est présent, mais son tableau de conclusion n'a pas pu être lu.";

  if (chiffres) {
    if (c3 > 0) {
      gravite = 'alerte';
      verdict = `${c3} revêtement${c3 > 1 ? 's' : ''} au plomb dégradé${c3 > 1 ? 's' : ''} (classe 3) : des travaux sont obligatoires.`;
    } else if (c2 > 0) {
      gravite = 'attention';
      /*
       * « Etat d'usage », et surtout pas « degrade ».
       *
       * L'arrete du 19 aout 2011 nomme trois etats : non degrade en classe 1,
       * ETAT D'USAGE en classe 2, DEGRADE en classe 3. Le produit ecrivait
       * « en etat degrade (classe 2) » — c'est le mot de la classe 3, et il
       * n'est pas anodin : c'est la degradation qui declenche l'obligation de
       * travaux de l'article L. 1334-9. Annoncer « degrade » sur une classe 2,
       * c'est faire croire a des travaux obligatoires qui ne le sont pas.
       */
      verdict = `${c2} revêtement${c2 > 1 ? 's' : ''} au plomb en état d’usage (classe 2) : à surveiller et à entretenir, sans travaux obligatoires.`;
    } else if (chiffres.classes[1] > 0) {
      gravite = 'bon';
      /*
       * « Non dégradé OU NON VISIBLE » — et le produit ne disait que la moitié.
       *
       * Le tableau 1 de NF X 46-030 (§ 11, lu en entier le 20/08/2026) donne la
       * classe 1 à deux états que le § 10 sépare : « non dégradé », et « non
       * visible » — le revêtement au plomb est sous un autre revêtement, un
       * papier peint ou une toile de verre, et son état **ne peut pas être
       * décrit**.
       *
       * L'annexe B de la norme le montre en clair : un mur à 12,45 mg/cm², douze
       * fois le seuil, classé 1 parce que sa toile de verre empêche de voir dans
       * quel état il est.
       *
       * Écrire « tous les revêtements concernés sont en bon état » était donc
       * une affirmation que le rapport n'a jamais faite, sur des surfaces que
       * personne n'a regardées. C'est exactement la faute que ce produit
       * combat : rassurer au-delà de ce qui a été constaté.
       */
      verdict =
        'Du plomb est présent. Tous les revêtements concernés sont classés 1 — « non dégradé ou non visible » : soit ils sont intacts, soit ils sont sous un autre revêtement qui empêche d’en juger.';
    } else {
      gravite = 'bon';
      verdict = 'Aucun revêtement contenant du plomb au-delà du seuil réglementaire.';
    }

    /*
     * « Non mesurée » ne veut PAS dire « pas contrôlée ».
     *
     * J'avais tempéré la conclusion à partir de ce chiffre, en croyant qu'une
     * part du logement avait échappé au contrôle. C'est faux, et la cliente l'a
     * corrigé aussitôt : le rapport lui-même l'écrit, unité par unité —
     *
     *     Mur Pierre        Non mesurée - NM   Absence de revêtement
     *     Plinthes Carrelage Non mesurée - NM  Absence de revêtement
     *     Fenêtre Métal      Non mesurée - NM  Absence de revêtement
     *
     * Une unité non mesurée est une unité SANS REVÊTEMENT à mesurer : pierre
     * nue, carrelage, métal, PVC. Le plomb se cherche dans les peintures ; là
     * où il n'y en a pas, il n'y a rien à mesurer, et la norme NF X46-030
     * prévoit exactement ce classement.
     *
     * Le taux de non mesurées ne dit donc rien de la qualité du contrôle : il
     * dit combien de surfaces du logement ne sont pas peintes. En faire une
     * réserve revenait à inquiéter pour une donnée parfaitement normale — la
     * faute inverse de celle que ce produit combat.
     */
  }

  /*
   * L'appareil, et les conditions de validité du constat.
   *
   * Une mesure faite avec un appareil dont l'autorisation ASN a expiré, ou sans
   * vérification de justesse sur étalon, ne vaut pas ce qu'elle prétend valoir.
   * Ces lignes sont en page 4 d'un rapport de dix-neuf pages : personne ne les
   * regarde.
   */
  /*
   * Un constat plomb rassurant peut porter une alerte qui n'a rien à voir avec
   * le plomb.
   *
   * Le cas est réel : aucune unité classée 3 — donc un volet « bon », en vert —
   * dans un rapport qui coche « au moins un plancher ou plafond menaçant de
   * s'effondrer : OUI », nomme la cave, et se termine par « le rapport a été
   * envoyé à l'agence régionale de santé ».
   *
   * Laisser le vert seul serait exact sur le plomb et faux sur le logement. On
   * ne réécrit donc pas le verdict du plomb — il est juste —, on lui ajoute ce
   * que le constat dit d'autre, et on retire le vert.
   */
  if (gravite === 'bon' && (alertes.length > 0 || signale)) {
    gravite = 'attention';
    verdict += signale
      ? ' En revanche, le constat relève une dégradation du bâti, et le rapport a été transmis à l’agence régionale de santé.'
      : ' En revanche, le constat relève une dégradation du bâti.';
  }

  const appareil = appareilPlomb(lignes);

  const faits: Fait[] = [];
  if (chiffres) {
    /*
     * Le total comprend les unités non mesurées — le contrôle de cohérence de
     * ce fichier le prouve : total = non mesurées + classes 0 à 3. Annoncer ce
     * total comme « éléments contrôlés » revenait à compter comme vérifié ce
     * que personne n'avait mesuré, et c'était la première tuile de la carte.
     * Une unité non mesurée reste inconnue ; elle n'est pas réputée saine.
     */
    const mesurees = chiffres.total - chiffres.nonMesurees;
    faits.push({
      libelle: 'Unités mesurées',
      valeur: String(mesurees),
      precision:
        chiffres.nonMesurees > 0
          ? `sur ${chiffres.total} au total — ${chiffres.nonMesurees} non mesurées`
          : 'murs, portes, plinthes, fenêtres…'
    });
    faits.push({
      /* Le mot de la norme, en clair : « dégradé » est le terme de l'arrêté du
         19 août 2011 pour la classe 3, et c'est lui qui déclenche les travaux. */
      libelle: 'Classe 3',
      valeur: String(c3),
      precision: c3 > 0 ? 'dégradé — travaux obligatoires' : 'dégradé'
    });
    faits.push({
      libelle: 'Classe 2',
      valeur: String(c2),
      precision: 'état d’usage — usés ou éraflés, mais qui ne font ni poussière ni écaille'
    });
    faits.push({
      /*
       * Le terme de l'arrêté, entier, puis l'explication — « on n'extrapole
       * pas ». Le § 9 sépare « non dégradé » et « non visible » : les fondre en
       * « intacts » faisait dire au produit ce que le rapport ne dit pas.
       *
       * Vu dans le corpus : un plafond à 8,17 mg/cm², huit fois le seuil, classé
       * 1 parce qu'il est sous une toile de verre.
       */
      libelle: 'Classe 1',
      valeur: String(chiffres.classes[1]),
      precision: 'non dégradé ou non visible — intacts, ou masqués par un autre revêtement'
    });
  }
  /*
   * Deux listes, deux intitulés — ceux de l'article 8 de l'arrêté.
   *
   * Les compter ensemble ferait dire « 2 situations sur 5 » sans dire lesquelles,
   * alors que les deux groupes ne parlent pas de la même chose : le premier du
   * plomb et de l'enfant, le second de l'état du logement. Un lecteur à qui l'on
   * annonce « dégradation du bâti » quand le rapport a coché un seuil de plomb
   * cherchera une fissure qui n'existe pas.
   */
  const saturnisme = alertes.filter((a) => a.groupe === 'saturnisme');
  const bati = alertes.filter((a) => a.groupe === 'bati');
  if (saturnisme.length) {
    faits.push({
      libelle: 'Situations de risque de saturnisme infantile',
      valeur: `${saturnisme.length} sur 2`,
      precision: 'la part du logement dont les peintures au plomb sont dégradées'
    });
  }
  if (bati.length) {
    faits.push({
      libelle: 'Situations de dégradation du bâti',
      valeur: `${bati.length} sur 3`,
      precision: 'elles ne parlent pas de plomb, mais de l’état du logement'
    });
  }

  /*
   * Ce que le constat a coché, dans ses mots — un fait par situation, parce
   * qu'un plafond qui menace de tomber ne se compte pas, il se nomme, et la
   * pièce concernée avec lui.
   */
  /*
   * Le terme du rapport en valeur, l'explication en précision — dans cet ordre.
   *
   * « Les termes extraits restent conformes. On les explique après. » Le fait
   * porte donc le libellé de l'article 8, entier, et l'explication vient
   * dessous. La pièce concernée s'ajoute à l'explication, elle ne la remplace
   * pas : elle est une donnée du rapport, pas une reformulation.
   */
  for (const alerte of alertes) {
    faits.push({
      libelle: 'Le constat coche',
      valeur: alerte.terme,
      precision: alerte.ou ? `${alerte.explique} — ${alerte.ou}` : alerte.explique
    });
  }
  if (signale) {
    faits.push({
      libelle: 'Suite donnée',
      valeur: 'Rapport transmis à l’agence régionale de santé',
      /* Le délai est à l'article 8 de l'arrêté du 19 août 2011, et la norme de
         2008 ne le donnait pas : cinq jours ouvrables, le propriétaire informé,
         et la transmission écrite dans le rapport. */
      precision: 'sous cinq jours ouvrables — le logement est signalé aux autorités sanitaires'
    });
  }

  /*
   * La date passe par la fonction commune.
   *
   * Le motif d'ici ne connaissait qu'une seule tournure — « rédigé par X le
   * … » — et un constat sur deux repartait sans date. Les rapports écrivent
   * aussi « Date du repérage », « Date(s) de la visite faisant l'objet du
   * CREP », ou signent par « Fait à …, le … ».
   *
   * Le volet du plomb est de surcroît le plus piégeux du dossier : l'appareil
   * de mesure est un fluorescence X, dont la source radioactive porte une date
   * de chargement et deux d'étalonnage. `dateDuRapport` les écarte.
   */
  const date = dateDuRapport(lignes);

  /*
   * L'autorisation de l'appareil couvrait-elle le jour du constat ?
   *
   * Une mesure faite avec un appareil dont l'autorisation ASN a expiré ne vaut
   * pas ce qu'elle prétend valoir. C'est une condition de validité du constat,
   * pas un détail d'intendance — et elle est écrite en page 4, au milieu des
   * numéros de série.
   */
  const jourDuConstat = enDate(date ?? undefined);
  const finAutorisation = enDate(appareil.finAutorisation ?? undefined);
  const autorisationPerimee =
    jourDuConstat !== null && finAutorisation !== null && jourDuConstat > finAutorisation;
  if (date) faits.push({ libelle: 'Date du constat', valeur: date });

  /*
   * Où le plomb dégradé se concentre, et pourquoi.
   *
   * Lu dans un constat réel, le classement par pièce ne laisse aucun doute :
   * salle d'eau 86 % de classe 3, salle de bain 80 %, seconde salle de bain
   * 56 % — quand les chambres et les paliers sont à 7 ou 12 %.
   *
   * Ce n'est pas un hasard, et c'est explicable en une phrase : l'humidité
   * décolle les peintures, et une peinture qui s'écaille est précisément ce qui
   * fait passer un revêtement de la classe 1 à la classe 3. Le lecteur qui sait
   * cela comprend d'un coup pourquoi son constat vise ces pièces-là, et ce
   * qu'il faut surveiller ailleurs.
   */
  const pieces = emplacements(lignes).filter((e) => e.classe >= 3);
  const humides = pieces.filter((e) => /salle de bain|salle d.eau|cuisine|buanderie|wc|toilette/i.test(e.zone));
  const surtoutHumide = pieces.length >= 3 && humides.length / pieces.length >= 0.5;

  const explication = [
    // « unité de diagnostic », « classe 3 » et « saturnisme » s'ouvrent au
    // clic : ces trois phrases n'ont plus à les définir en passant.
    'Le CREP — le constat plomb — ne regarde pas les canalisations. Il mesure le plomb des peintures, unité de diagnostic par unité de diagnostic : un mur, une porte, une plinthe.',
    'Les classes vont de 0 à 3, du revêtement sain à la peinture qui s’écaille. Seule la classe 3 pose vraiment problème.',
    'Le danger vient des poussières avalées — le saturnisme —, surtout chez les jeunes enfants et les femmes enceintes. Un mur au plomb en bon état, qu’on laisse tranquille, n’est pas dangereux.',

    /*
     * Ce que le constat regarde en plus des peintures, et ce que ça déclenche.
     * Les deux phrases suivantes s'appuient sur des textes lus à la source le
     * 15/08/2026 : L. 1334-5 pour le relevé, L. 1334-10 pour la transmission.
     */
    'Le constat ne s’arrête pas aux peintures : il dresse aussi un relevé des facteurs de dégradation du bâti — l’humidité qui décolle les revêtements, un plancher ou un plafond qui menace, des peintures qui s’écaillent. C’est ce qui transforme du plomb inerte en poussière respirable.',

    ...(surtoutHumide
      ? [
          'Dans ce logement, le plomb dégradé se concentre dans les pièces d’eau. C’est le cas le plus courant, et il s’explique : l’humidité décolle les peintures, et une peinture qui s’écaille est exactement ce qui fait passer un revêtement en classe 3. Traiter la cause — ventilation, étanchéité — évite que le reste du logement suive.'
        ]
      : []),
    'Ce relevé a une conséquence que peu de vendeurs connaissent : si le constat fait apparaître ces facteurs, le diagnostiqueur en transmet immédiatement une copie à l’agence régionale de santé, qui informe le préfet. Cela ne dépend pas de la classe des revêtements — un logement peut être signalé sans qu’aucune unité ne soit classée 3.',
    'Si un enfant de moins de six ans vit dans le logement, ou doit y vivre, ce point cesse d’être une formalité : c’est chez eux que le saturnisme fait ses dégâts, parce qu’ils portent leurs mains à la bouche et que leur organisme absorbe le plomb bien plus que celui d’un adulte.'
  ];

  const aFaire =
    c3 > 0
      ? [
          'Le propriétaire doit faire réaliser les travaux qui suppriment l’exposition (recouvrement, remplacement ou retrait par une entreprise formée) — article L.1334-9 du code de la santé publique.',
          'Le constat complet, annexes comprises, doit être remis aux occupants et à toute entreprise appelée à travailler dans le logement.',
          'Ne poncez jamais une peinture au plomb à sec : c’est le geste qui contamine tout le logement.',
          'Ce constat est positif : il n’est valable qu’un an à la vente, six ans à la location.'
        ]
      : positif
        ? [
            'Sans classe 3, aucun travail n’est imposé : il s’agit d’entretenir les revêtements pour qu’ils ne se dégradent pas.',
            'Attention à la durée : du plomb a été détecté, même en bon état. Le constat est donc positif, et il n’est valable qu’un an à la vente, six ans à la location — c’est la présence qui compte, pas l’état.',
            'Surveillez l’état des peintures anciennes : une classe 1 qui s’écaille devient une classe 3.'
          ]
        : [
            'Aucun revêtement au-dessus des seuils : aucun travail n’est imposé.',
            'Un constat négatif n’a pas de limite de durée — ni à la vente, ni à la location. Il ne sera pas à refaire.',
            'Surveillez tout de même l’état des peintures anciennes lors de travaux : le constat ne porte que sur ce qui était accessible.'
          ];

  /*
   * Ce qui se lit dans le constat plomb, et qui ne parle pas de plomb.
   *
   * Le lecteur qui voit « aucun revêtement au-dessus des seuils » referme le
   * volet. La phrase qui suit le retient, et elle vise une pièce nommée.
   */
  if (alertes.length) {
    aFaire.unshift(
      ...alertes.map(
        (a) =>
          `Le constat coche « ${a.terme} »${a.ou ? ` — ${a.ou}` : ''}. ${a.explique} C’est à faire vérifier avant de s’engager.`
      )
    );
  }

  /*
   * Deux conditions de validité, signalées au lecteur.
   *
   * On les met dans les relevés plutôt que dans le verdict : ce sont des
   * réserves sur la portée du constat, pas des conclusions sur le logement. Un
   * constat dont l'appareil n'était plus autorisé reste un constat — il ne
   * vaut simplement pas ce qu'il prétend valoir, et c'est au lecteur d'en
   * tirer les conséquences avec son notaire.
   */
  const surLAppareil = [
    ...(autorisationPerimee
      ? [
          {
            genre: 'complement' as const,
            libelle: `L’autorisation de l’appareil de mesure avait expiré le ${appareil.finAutorisation} lorsque le constat a été fait. Signalez-le à votre notaire : c’est une condition de validité des mesures.`
          }
        ]
      : []),
    ...(chiffres && !appareil.etalonnageDuJour
      ? [
          {
            genre: 'complement' as const,
            libelle:
              'La vérification de justesse de l’appareil, en début et en fin de constat, n’apparaît pas au rapport. La norme la prévoit à chaque constat.'
          }
        ]
      : []),
    ...(signale
      ? [
          {
            genre: 'complement' as const,
            libelle:
              'Ce constat a été transmis à l’agence régionale de santé : le rapport le dit. C’est ce que la loi impose dès qu’une des cinq situations de risque est constatée — un local à plus de 50 % de classe 3, l’ensemble du logement à plus de 20 %, un plancher menaçant, des écoulements d’eau ou des moisissures sur plusieurs unités d’une même pièce. Le logement est donc signalé à l’administration sanitaire ; ce n’est ni une sanction ni une interdiction de vendre.'
          }
        ]
      : [])
  ];

  return {
    type: 'plomb',
    titre: 'Plomb dans les peintures (CREP)',
    verdict,
    gravite,
    faits,
    ...(surLAppareil.length ? { releves: surLAppareil } : {}),
    analogie:
      'Le plomb d’une vieille peinture, c’est du sucre glace pris dans un gâteau. Tant que le gâteau est entier, rien ne s’échappe. Dès qu’il s’effrite, la poudre se répand — sur le sol, sur les jouets, sur les mains.',
    explication,
    aFaire,
    schema: chiffres
      ? {
          genre: 'plomb',
          classes: chiffres.classes,
          nonMesurees: chiffres.nonMesurees,
          total: chiffres.total,
          // On ne montre que ce qui mérite l'attention : classes 2 et 3.
          emplacements: emplacements(lignes).filter((e) => e.classe >= 2)
        }
      : null,
    pages: plage,
    ...(date ? { date } : {}),
    /* La fin de validité que le rapport écrit lui-même, quand il l'écrit :
       elle vaut mieux que la nôtre — voir `validiteDuConstat`. */
    ...(validiteLue ? { validiteLue } : {})
  };
}

/** Vrai si le rapport conclut explicitement à l'absence de plomb. */
export function plombAbsent(lignes: string[]): boolean {
  return contient(lignes, "n'a pas été repéré de revêtements contenant du plomb");
}

export const _interne = { compter };

/** Ré-export utilitaire pour les tests. */
export const _nombre = nombre;

/** Ce que le rapport dit de l'appareil qui a servi à mesurer. */
export interface AppareilPlomb {
  /** Fin de validité de l'autorisation ASN, telle qu'écrite. */
  finAutorisation: string | null;
  /** Vrai si la justesse a été vérifiée le jour même, en entrée et en sortie. */
  etalonnageDuJour: boolean;
}

/**
 * L'appareil à fluorescence X, et sa conformité.
 *
 * Le plomb se mesure avec une source radioactive — du cobalt 57 — et cet
 * appareil est réglementé pour lui-même : il faut une autorisation de
 * l'Autorité de sûreté nucléaire, et la justesse doit être vérifiée sur étalon
 * en début ET en fin de chaque constat, comme le rappelle le rapport.
 *
 * ── Pourquoi le vérifier ────────────────────────────────────────────────────
 *
 * Ce sont des conditions de validité du constat, pas des détails d'intendance.
 * Une mesure faite avec un appareil dont l'autorisation a expiré, ou sans
 * vérification de justesse, ne vaut pas ce qu'elle prétend valoir — et le
 * constat conclut pourtant.
 *
 * Personne ne le regarde : ces lignes sont en page 4 d'un rapport de dix-neuf
 * pages, au milieu des références de série et des numéros de police.
 *
 * ── Ce qu'on ne fait pas dire à ces chiffres ────────────────────────────────
 *
 * La « durée de vie » annoncée de la source — deux ans — n'est PAS une date de
 * péremption du constat. Le cobalt 57 perd la moitié de son activité tous les
 * neuf mois environ ; passé ce terme, les mesures durent plus longtemps, mais
 * l'appareil reste juste tant qu'il passe la vérification sur étalon. C'est
 * cette vérification qui fait foi, pas l'âge de la source — et c'est pourquoi
 * on la relève, elle, plutôt que de compter les mois.
 */
export function appareilPlomb(lignes: string[]): AppareilPlomb {
  const texte = lignes.join('\n');

  /* La ligne d'autorisation porte deux dates : celle de la déclaration, puis
     celle de fin de validité. C'est la seconde qui nous intéresse. */
  const validite =
    /Date d[’']autorisation[^\n]{0,80}?\n?[^\n]{0,40}?(\d{1,2}\/\d{1,2}\/\d{4})\s+(\d{1,2}\/\d{1,2}\/\d{4})/i.exec(
      texte
    );

  const etalons = lignes.filter((l) => /[ÉEée]talonnage\s+(?:entr[ée]e|sortie)/i.test(l));
  const dates = etalons
    .map((l) => /(\d{1,2}\/\d{1,2}\/\d{4})/.exec(l)?.[1])
    .filter((d): d is string => Boolean(d));

  return {
    finAutorisation: validite?.[2] ?? null,
    /* Entrée ET sortie, le même jour : c'est ce que la norme demande. */
    etalonnageDuJour: dates.length >= 2 && new Set(dates).size === 1
  };
}

/**
 * Jusqu'à quand le constat vaut — écrit par le rapport, pas calculé par nous.
 *
 * ## Ce que le calcul se trompait, et de combien
 *
 * Verrière DÉDUISAIT la validité du CREP de ses compteurs de classes : sans
 * limite s'il ne trouve rien, douze mois sinon. Le second terme est celui de la
 * **vente** (article L. 1334-6). À la **location**, c'est **six ans** — article
 * R. 1334-11, énoncé déjà noté dans `reglement/textes.ts` et lu le 14/08/2026.
 *
 * Mesuré le 21/08/2026 sur 200 volets plomb, en comparant la date que le rapport
 * écrit à celle que nous calculions :
 *
 *     120 rapports portent une date de fin écrite
 *      83 tombent juste  → tous cochés « Avant la vente »
 *      29 se trompent    → tous cochés « Avant la mise en location »,
 *                          et de 1825 jours, soit cinq ans, à un jour près
 *
 * Zéro exception dans les deux sens. **Verrière déclarait donc périmés 29 CREP
 * de location sur 200 — 14,5 % — qui avaient encore cinq ans à courir.**
 *
 * ## Pourquoi lire plutôt que corriger le calcul
 *
 * On pourrait ajouter « six ans si location » et refaire le calcul juste. Mais
 * le rapport écrit la réponse, en toutes lettres, dans sa rubrique 6.3 :
 *
 *     Validité du constat :
 *     Du fait de la présence de revêtement contenant du plomb à des
 *     concentrations supérieures aux seuils définis par arrêté …, le présent
 *     constat a une durée de validité de 1 an (jusqu'au 14/09/2026).
 *
 * Le lire supprime le calcul, la lecture de la mission, et le risque de se
 * tromper sur l'une des deux. *Aucun chiffre inventé : le rapport reste la
 * référence.*
 *
 * ## Les formes, mesurées sur 200 volets
 *
 *     120  « durée de validité de N an(s) (jusqu'au JJ/MM/AAAA) »
 *      30  « il n'y a pas lieu de faire établir un nouveau constat à chaque
 *           MUTATION » — le constat négatif, en vente
 *      13  la même chose « à chaque nouveau CONTRAT DE LOCATION »
 *      29  rubrique absente
 *       3  rubrique VIDE — un CREP de parties communes, où la durée en années
 *           ne s'applique pas. Vide n'est pas « non trouvé ».
 *       5  forme non reconnue
 *
 * Les 37 derniers retombent sur le calcul, faute de mieux.
 */
export interface ValiditeDuConstat {
  /** Le dernier jour de validité, JJ/MM/AAAA, quand le rapport le donne. */
  jusquAu?: string;
  /** Le rapport écrit qu'aucun nouveau constat n'est à faire. */
  sansLimite?: boolean;
  /** La phrase du rapport, entière — on cite, puis on explique. */
  terme: string;
}

const RUBRIQUE_VALIDITE = /Validit[ée] du constat\s*:?/i;
const FIN_DE_VALIDITE =
  /Documents? remis par le donneur|6\s*\.\s*4|Situations? de risque de saturnisme/i;

export function validiteDuConstat(lignes: string[]): ValiditeDuConstat | null {
  const debut = lignes.findIndex((l) => RUBRIQUE_VALIDITE.test(l));
  if (debut < 0) return null;

  const apres = lignes.slice(debut + 1).findIndex((l) => FIN_DE_VALIDITE.test(l));
  const fin = apres < 0 ? Math.min(debut + 10, lignes.length) : debut + 1 + apres;
  const terme = lignes
    .slice(debut, fin)
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(RUBRIQUE_VALIDITE, '')
    .trim();

  /* Vide n'est pas « non trouvé » : la rubrique existe et ne dit rien. On ne
     conclut rien non plus, plutôt que d'inventer une durée. */
  if (!terme) return null;

  const date = /jusqu['’]au\s*(\d{1,2}\/\d{1,2}\/\d{4})/i.exec(terme);
  if (date?.[1]) return { jusquAu: date[1], terme };

  /* « il n'y a pas lieu de faire établir un nouveau constat » — les deux formes,
     vente et location, disent la même chose : le constat ne périme pas. */
  if (/pas lieu de faire [ée]tablir un nouveau constat/i.test(terme)) {
    return { sansLimite: true, terme };
  }

  return null;
}

/**
 * Le constat a-t-il été transmis à l'agence régionale de santé ?
 *
 * L'arrêté du 19 août 2011 définit CINQ situations de risque, et une seule
 * suffit à déclencher la transmission :
 *
 *   · un local présentant au moins 50 % d'unités de diagnostic de classe 3 ;
 *   · l'ensemble des locaux en présentant au moins 20 % ;
 *   · un plancher ou plafond menaçant de s'effondrer, ou effondré ;
 *   · des traces importantes de coulures, ruissellements ou écoulements d'eau
 *     sur plusieurs unités d'une même pièce ;
 *   · plusieurs unités d'une même pièce couvertes de moisissures ou de taches
 *     d'humidité.
 *
 * L'auteur du constat transmet alors une copie au directeur général de l'ARS
 * dans les cinq jours ouvrables (article L. 1334-10 du code de la santé
 * publique), qui en informe le préfet.
 *
 * ── Pourquoi le lire plutôt que le calculer ─────────────────────────────────
 *
 * Les deux premiers critères se calculent, les trois autres non : ils tiennent
 * à ce que le diagnostiqueur a VU sur place. Le rapport, lui, répond aux cinq
 * et conclut. On lit donc sa conclusion, plutôt que d'en recalculer une part et
 * d'ignorer le reste.
 *
 * ── Ce que cela signifie pour un acheteur ───────────────────────────────────
 *
 * Que le logement est signalé à l'administration sanitaire. Ce n'est ni une
 * sanction ni une interdiction — c'est une information que le vendeur connaît
 * rarement, et que l'acquéreur ne voit jamais : elle est en page 15 sur 19.
 */
export function transmisALArs(lignes: string[]): boolean {
  const normalisees = lignes.map(normaliser);

  /*
   * D'ABORD LA RUBRIQUE, parce que c'est un formulaire et qu'une rubrique
   * répond. Chez LICIEL, la transmission ne s'écrit pas, elle se coche :
   *
   *     6.5 Transmission du constat à l'agence régionale de santé
   *     Si le constat identifie au moins l'une de ces cinq situations, son
   *     OUI  auteur transmet, dans un délai de cinq jours ouvrables, une copie…
   *
   * ⚠️ Ce que cette correction gagne, mesuré — et ce n'est pas ce que j'avais
   * annoncé. Sur 200 volets, le verdict est **identique avant et après** : zéro
   * rapport rattrapé, zéro perdu. J'avais écrit qu'elle en rattrapait deux ;
   * c'était faux. Les rapports LICIEL qui cochent `OUI` portent aussi, plus bas,
   * une remarque au passé composé que le motif de phrase trouvait déjà.
   *
   * Ce qu'elle apporte est donc de la robustesse, pas de la justesse : la
   * lecture ne repose plus sur une tournure que chaque éditeur écrit à sa façon,
   * mais sur la case du formulaire. La phrase reste en second recours, pour
   * l'éditeur qui n'imprime pas la rubrique.
   *
   * La fenêtre est de sept lignes parce que la réponse se promène : deuxième
   * ligne du paragraphe (22/IMO/0340), première (25/IMO/1001P), troisième
   * (21/IMO/787), seule entre deux lignes, ou seule après elles.
   *
   * L'intitulé apparaît deux fois — au sommaire, puis dans le corps — et le
   * sommaire ne porte pas de réponse. On garde donc la première occurrence qui
   * en porte une.
   */
  for (let i = 0; i < normalisees.length; i++) {
    if (!/Transmission du constat/i.test(normalisees[i] ?? '')) continue;
    for (let j = i + 1; j < Math.min(i + 8, normalisees.length); j++) {
      const reponse = reponseDeLaLigne(normalisees[j] ?? '');
      if (reponse) return reponse === 'OUI';
    }
  }

  const texte = normalisees.join(' ');

  /*
   * À défaut de rubrique, la phrase d'ACTION — pas le rappel de la règle.
   *
   * La rubrique 6.5 reproduit d'abord le texte de l'arrêté — « si le constat
   * identifie au moins l'une de ces cinq situations, son auteur transmet… » —
   * qui figure dans tous les rapports, y compris ceux qui n'ont rien transmis.
   * Seule la phrase au passé composé dit que ça a été fait.
   *
   * Le verbe change d'un éditeur à l'autre : « transmis » chez celui de DGLM,
   * « Le rapport a été ENVOYÉ à l'agence régionale de santé » chez un second.
   * Le motif ne connaissait que le premier, et laissait passer le second.
   *
   * ## Et le destinataire change avec l'année
   *
   * NF X 46-030 date d'avril 2008 — deux ans avant la création des agences
   * régionales de santé. Son § 13 et sa rubrique 6.5 envoient donc le constat
   * « à la Préfecture du département d'implantation du bien expertisé », et son
   * modèle de rapport, que les éditeurs recopient, porte l'intitulé
   * « Transmission du constat au Préfet ».
   *
   * L'article L. 1334-10 du code de la santé publique, lui, désigne aujourd'hui
   * le directeur général de l'ARS, qui informe le représentant de l'État.
   *
   * Les deux formulations circulent donc dans les rapports selon le millésime du
   * modèle, et elles disent la même chose : le logement est signalé. Ne
   * reconnaître que l'ARS revenait à manquer tous les rapports restés sur le
   * modèle de la norme.
   */
  return /nous avons donc[^.]{0,120}?transmis|avons transmis imm[ée]diatement|a [ée]t[ée] (?:transmis|envoy[ée])[^.]{0,60}?(?:agence r[ée]gionale|pr[ée]fecture|pr[ée]fet)/i.test(
    texte
  );
}
