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

/**
 * Les facteurs de dégradation du bâti, relevés dans le constat.
 *
 * Le constat ne fait pas que classer des revêtements : il « dresse un relevé
 * sommaire des facteurs de dégradation du bâti » (article L. 1334-5 du code de
 * la santé publique, lu le 15/08/2026), que l'auteur consigne en liste (article
 * R. 1334-10).
 *
 * Ce n'est pas une rubrique de plus. Quand ces facteurs apparaissent, l'auteur
 * du constat « transmet immédiatement une copie de ce document au directeur
 * général de l'agence régionale de santé, qui en informe le représentant de
 * l'État dans le département » (article L. 1334-10, lu le 15/08/2026). Le
 * logement est signalé — et cela ne dépend pas de la classe des revêtements :
 * un bien peut partir à l'agence régionale de santé sans qu'aucune unité ne
 * soit classée 3.
 *
 * On cherche donc la mention, on ne devine pas la liste : le code ne l'énumère
 * pas, il renvoie à un arrêté. Le rapport, lui, la dresse quand il en relève.
 */
const DEGRADATION: { cle: string; nom: string; motif: RegExp }[] = [
  { cle: 'humidite', nom: 'Humidité', motif: /humidit[ée]|infiltration|moisissure|condensation/i },
  {
    cle: 'effondrement',
    nom: 'Effondrement ou affaissement',
    motif: /effondrement|affaissement|plancher menaçant|plafond menaçant|fissuration/i
  },
  {
    cle: 'revetement',
    nom: 'Revêtements dégradés',
    motif: /[ée]caillage|cloquage|coulure|fa[iï]en[çc]age|[ée]clat|pulv[ée]rulen/i
  }
];

function facteursDeDegradation(lignes: string[]): { cle: string; nom: string }[] {
  /*
   * On ne cherche que dans le voisinage de la rubrique : le mot « humidité »
   * traîne dans toutes les notices d'information annexées au constat, et le
   * relever là ferait signaler un facteur de dégradation à chaque rapport.
   */
  const texte = lignes.join(' ');
  const rubrique = texte.match(/facteurs? de d[ée]gradation[\s\S]{0,600}/i);
  if (!rubrique) return [];

  return DEGRADATION.filter((f) => f.motif.test(rubrique[0])).map(({ cle, nom }) => ({ cle, nom }));
}

export function analyserPlomb(lignes: string[], plage: [number, number]): Diagnostic {
  const chiffres = compter(lignes);
  const c2 = chiffres?.classes[2] ?? 0;
  const c3 = chiffres?.classes[3] ?? 0;
  const degradation = facteursDeDegradation(lignes);

  let gravite: Gravite = 'neutre';
  let verdict = "Un constat plomb est présent, mais son tableau de conclusion n'a pas pu être lu.";

  if (chiffres) {
    if (c3 > 0) {
      gravite = 'alerte';
      verdict = `${c3} revêtement${c3 > 1 ? 's' : ''} au plomb en mauvais état (classe 3) : des travaux sont obligatoires.`;
    } else if (c2 > 0) {
      gravite = 'attention';
      verdict = `${c2} revêtement${c2 > 1 ? 's' : ''} au plomb en état dégradé (classe 2) : à surveiller et à entretenir.`;
    } else if (chiffres.classes[1] > 0) {
      gravite = 'bon';
      verdict = 'Du plomb est présent, mais tous les revêtements concernés sont en bon état (classe 1).';
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
      libelle: 'En mauvais état',
      valeur: String(c3),
      precision: c3 > 0 ? 'travaux obligatoires' : 'classe 3'
    });
    faits.push({ libelle: 'Usés ou éraflés', valeur: String(c2), precision: 'classe 2' });
    faits.push({
      libelle: 'Avec plomb, mais intacts',
      valeur: String(chiffres.classes[1]),
      precision: 'classe 1'
    });
  }
  if (degradation.length) {
    faits.push({
      libelle: 'Facteurs de dégradation du bâti',
      valeur: String(degradation.length),
      precision: degradation.map((f) => f.nom).join(' · ')
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
          'Avec au moins une classe 3, le CREP n’est valable qu’un an à la vente (six ans à la location).'
        ]
      : [
          'Sans classe 3, aucun travaux n’est imposé.',
          'Un CREP sans plomb dégradé est valable six ans à la location, et sans limite de durée à la vente si aucun plomb n’a été détecté.',
          'Surveillez l’état des peintures anciennes : une classe 1 qui s’écaille devient une classe 3.'
        ];

  /*
   * Deux conditions de validité, signalées au lecteur.
   *
   * On les met dans les relevés plutôt que dans le verdict : ce sont des
   * réserves sur la portée du constat, pas des conclusions sur le logement. Un
   * constat dont l'appareil n'était plus autorisé reste un constat — il ne
   * vaut simplement pas ce qu'il prétend valoir, et c'est au lecteur d'en
   * tirer les conséquences avec son notaire.
   */
  /*
   * Le signalement à l'ARS : une information que personne ne voit.
   *
   * Elle est en page 15 sur 19, et elle dit que le logement a été signalé à
   * l'administration sanitaire. Ce n'est ni une sanction ni une interdiction,
   * mais un vendeur l'ignore souvent et un acquéreur ne la trouve jamais.
   */
  const signale = transmisALArs(lignes);

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
    ...(date ? { date } : {})
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
    /Date d[’']autorisation[^\n]{0,80}?\n?[^\n]{0,40}?(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})/i.exec(
      texte
    );

  const etalons = lignes.filter((l) => /[ÉEée]talonnage\s+(?:entr[ée]e|sortie)/i.test(l));
  const dates = etalons
    .map((l) => /(\d{2}\/\d{2}\/\d{4})/.exec(l)?.[1])
    .filter((d): d is string => Boolean(d));

  return {
    finAutorisation: validite?.[2] ?? null,
    /* Entrée ET sortie, le même jour : c'est ce que la norme demande. */
    etalonnageDuJour: dates.length >= 2 && new Set(dates).size === 1
  };
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
  const texte = lignes.join(' ').replace(/\s+/g, ' ');

  /*
   * On exige la phrase d'ACTION, pas le rappel de la règle.
   *
   * La rubrique 6.5 reproduit d'abord le texte de l'arrêté — « si le constat
   * identifie au moins l'une de ces cinq situations, son auteur transmet… » —
   * qui figure dans tous les rapports, y compris ceux qui n'ont rien transmis.
   * Seule la phrase au passé composé dit que ça a été fait.
   */
  return /nous avons donc[^.]{0,120}?transmis|avons transmis imm[ée]diatement|a [ée]t[ée] transmis[^.]{0,60}?agence r[ée]gionale/i.test(
    texte
  );
}
