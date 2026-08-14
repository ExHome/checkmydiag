/**
 * Le mécanisme derrière une anomalie.
 *
 * Une anomalie de rapport, c'est une phrase de norme : « l'enveloppe d'au moins
 * un matériel est détériorée ». Personne ne voit ce que ça veut dire. Or il y a
 * toujours un mécanisme physique derrière — un boîtier cassé laisse le doigt
 * atteindre une pièce sous tension — et un dessin le montre en une seconde là
 * où trois phrases échouent.
 *
 * Chaque anomalie reçoit donc son schéma. Le choix se fait d'abord sur le code
 * de la norme, qui est sans ambiguïté ; à défaut, sur les mots du libellé.
 *
 * Ce que le schéma montre est le **mécanisme général**, jamais le logement :
 * le rapport ne dit pas où se trouve le boîtier cassé, et on n'invente rien.
 * C'est écrit sous chaque dessin.
 *
 * Les codes sont ceux de la norme XP C 16-600 pour l'électricité (B1 à B11) et
 * de l'arrêté du 6 avril 2007 pour le gaz (A1, A2, B1…).
 */
import type { TypeDiag } from '../modele';

export type Mecanisme =
  /** Rien ne coupe l'installation à la main, ou pas à portée. */
  | 'coupure'
  /** Aucun différentiel : un défaut d'isolement passe par la personne. */
  | 'differentiel'
  /** Pas de terre : le courant de fuite n'a nulle part où aller. */
  | 'terre'
  /** Le fil est plus fin que ce que son disjoncteur laisse passer. */
  | 'surintensite'
  /** Matériel électrique trop près de l'eau, ou liaison manquante. */
  | 'salleDeau'
  /** Une pièce sous tension est atteignable au doigt. */
  | 'contactDirect'
  /** Le boîtier qui protégeait est cassé ou manquant. */
  | 'enveloppe'
  /** Le logement ne prend pas l'air dont la flamme a besoin. */
  | 'ventilation'
  /** Les fumées ne partent pas — le monoxyde reste dedans. */
  | 'combustion'
  /** Le gaz peut fuir : raccordement, tuyau souple, robinet. */
  | 'tuyauterie'
  /** Un revêtement dégradé libère ce qu'il contenait. */
  | 'degradation'
  /** Le bois est attaqué, ou des indices de passage sont visibles. */
  | 'indices'
  /** Le rapport signale sans qu'on puisse rattacher un mécanisme. */
  | 'general';

/** Ce que chaque mécanisme raconte, en une phrase. */
export const LEGENDE: Record<Mecanisme, string> = {
  coupure:
    'Il faut pouvoir couper tout le courant à la main, depuis le logement, sans outil et sans monter sur quoi que ce soit.',
  differentiel:
    'Le différentiel compare ce qui part et ce qui revient. Si du courant s’échappe — par une personne, par exemple — il coupe en une fraction de seconde.',
  terre: 'La terre offre au courant de fuite un chemin plus facile que le corps humain. Sans elle, le différentiel lui-même a moins de prise.',
  surintensite:
    'Le disjoncteur doit céder avant le fil. S’il est plus généreux que la section du conducteur, c’est le fil qui chauffe le premier.',
  salleDeau:
    'Autour d’une baignoire ou d’une douche, chaque distance correspond à ce qu’on a le droit d’y installer. L’eau conduit, la peau mouillée aussi.',
  contactDirect:
    'Une pièce sous tension doit rester hors d’atteinte. Accessible au doigt, elle met le corps directement sur le réseau.',
  enveloppe:
    'Le boîtier n’est pas un habillage : c’est lui qui tient les doigts à distance des pièces sous tension.',
  ventilation:
    'Une flamme consomme de l’air. Si l’air n’entre plus, la combustion s’étouffe et produit du monoxyde de carbone.',
  combustion:
    'Les produits de la combustion doivent sortir. S’ils refluent dans le logement, le monoxyde de carbone s’accumule sans odeur ni couleur.',
  tuyauterie:
    'Chaque raccord est un point de fuite possible. Le gaz s’échappe, se mélange à l’air, et il suffit d’une étincelle.',
  degradation:
    'Tant que le revêtement tient, ce qu’il contient reste dedans. C’est en s’écaillant, en se perçant ou en s’effritant qu’il devient respirable ou ingérable.',
  indices:
    'On ne voit presque jamais l’insecte : on voit ce qu’il laisse — galeries, cordonnets, bois qui sonne creux.',
  general: 'Le rapport signale ce point sans en préciser le mécanisme.'
};

/** Le titre du dessin : ce qu'il montre, pas ce que dit la norme. */
export const TITRE: Record<Mecanisme, string> = {
  coupure: 'Couper le courant',
  differentiel: 'Le différentiel',
  terre: 'La prise de terre',
  surintensite: 'Le fil et son disjoncteur',
  salleDeau: 'Autour de la douche',
  contactDirect: 'Le contact direct',
  enveloppe: 'L’enveloppe du matériel',
  ventilation: 'L’air de la flamme',
  combustion: 'La sortie des fumées',
  tuyauterie: 'Le circuit du gaz',
  degradation: 'Le revêtement qui se dégrade',
  indices: 'Les indices dans le bois',
  general: 'Ce que le rapport signale'
};

/**
 * Les codes de la norme électrique.
 *
 * Les rapports les écrivent de toutes les façons — « B7.3a », « B.7.3 a »,
 * « B 4.2 » : le séparateur qui suit la lettre est donc facultatif. Les rubriques
 * à deux chiffres passent avant celles à un seul, sinon « B1 » attraperait
 * « B11 » au vol.
 */
const CODES_ELEC: [RegExp, Mecanisme][] = [
  [/^B[\s.]?(?:8|9|10|11)\b/i, 'general'],
  [/^B[\s.]?1\b/i, 'coupure'],
  [/^B[\s.]?2\b/i, 'differentiel'],
  [/^B[\s.]?3\b/i, 'terre'],
  [/^B[\s.]?4\b/i, 'surintensite'],
  [/^B[\s.]?5\b/i, 'salleDeau'],
  [/^B[\s.]?6\b/i, 'contactDirect'],
  [/^B[\s.]?7\b/i, 'enveloppe']
];

/** Ce que disent les libellés, quand le code manque ou ne suffit pas. */
const MOTS: [RegExp, Mecanisme][] = [
  [/appareil g[ée]n[ée]ral de commande|coupure d.urgence|accessibilit[ée] de l.appareil/i, 'coupure'],
  [/diff[ée]rentiel|30\s?mA|sensibilit[ée]/i, 'differentiel'],
  [/prise de terre|mise [àa] la terre|conducteur de protection/i, 'terre'],
  [/surintensit|section des conducteurs|calibre|fusible/i, 'surintensite'],
  [/douche|baignoire|liaison [ée]quipotentielle|volume\s*[0-4]\b/i, 'salleDeau'],
  [/partie active nue|contacts? directs?|sous tension|accessible/i, 'contactDirect'],
  [/enveloppe|bo[îi]tier|capot|v[ée]tuste|d[ée]t[ée]rior/i, 'enveloppe'],
  [/ventilation|amen[ée]e d.air|a[ée]ration|grille/i, 'ventilation'],
  [/[ée]vacuation|conduit|fum[ée]e|combustion|monoxyde|tirage/i, 'combustion'],
  [/tuyau|raccordement|robinet|[ée]tanch[ée]it[ée]|flexible|d[ée]tendeur/i, 'tuyauterie'],
  [/[ée]cai|d[ée]grad|effrit|perc[ée]|mauvais [ée]tat/i, 'degradation'],
  [/termite|galerie|cordonnet|vermoulu/i, 'indices']
];

/**
 * Le mécanisme d'une anomalie, d'après ses mots puis son code.
 *
 * Le libellé passe avant le code, et c'est délibéré : le code désigne une
 * rubrique de la norme, parfois large, quand le libellé décrit le défaut lui
 * même. Sur un vrai rapport, « B7.3 d — connexion avec une partie active nue
 * accessible » vit sous la rubrique « matériels vétustes » ; classée par son
 * code, elle aurait reçu le dessin d'un boîtier cassé au lieu de celui d'un
 * contact direct. Le code reprend la main dès que le libellé ne dit rien de
 * reconnaissable — et beaucoup de rapports impriment l'un sans l'autre.
 */
export function mecanismeDe(
  type: TypeDiag,
  libelle: string,
  code?: string
): Mecanisme {
  for (const [motif, mecanisme] of MOTS) {
    if (motif.test(libelle)) return mecanisme;
  }

  if (type === 'electricite' && code) {
    for (const [motif, mecanisme] of CODES_ELEC) {
      if (motif.test(code.trim())) return mecanisme;
    }
  }

  // Sans indice, le type du diagnostic reste le meilleur repère qu'on ait.
  if (type === 'amiante' || type === 'plomb') return 'degradation';
  if (type === 'termites') return 'indices';
  if (type === 'gaz') return 'tuyauterie';

  return 'general';
}
