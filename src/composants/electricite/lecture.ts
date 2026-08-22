/**
 * CE QUE L'ÉCRAN A LE DROIT DE DIRE — la lecture d'un `Diagnostic` électrique.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * LA RÈGLE, APPLIQUÉE COMME UNE MÉCANIQUE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * « Quelle donnée du rapport permet d'affirmer cela ? » — Ici, la réponse est
 * dans le TYPE. Chaque champ de `Lecture` sait d'où il vient, et rien ne peut
 * être affiché qui ne soit passé par ce fichier. Un composant qui irait lire
 * `diagnostic.faits` lui-même pourrait inventer ; celui-ci ne le peut pas.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * LES TROIS RÉGIMES, MESURÉS SUR LE CORPUS (56 volets électricité)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   sansAnomalie   42 volets sur 56   ← LE CAS NOMINAL. C'est celui-ci qu'il
 *                                       faut réussir, pas celui du sinistre.
 *   anomalies      14 volets          1 anomalie ×5, 2 ×6, 4 ×3. Maximum : 4.
 *   nonLu           la conclusion est une case cochée, donc une image
 *
 * La scène décrite par la cliente — « 7 anomalies électriques » — ne correspond
 * à AUCUN dossier du corpus : le maximum observé est 4, et le total sur les 56
 * volets est de 29. L'écran est donc dimensionné pour 0 à 4, et sa forme
 * nominale est celle où il n'y a rien à compter.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CE QUI N'EXISTE PAS, ET QU'ON NE FABRIQUERA PAS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  · IL N'Y A AUCUNE GRAVITÉ PAR ANOMALIE. `Diagnostic.gravite` porte sur le
 *    VOLET entier. Aucune anomalie ne peut donc être peinte « plus rouge »
 *    qu'une autre, et aucun tri par gravité n'est possible.
 *  · `releve.ou` EST VIDE POUR 100 % DES ANOMALIES (0 sur 56). La seule
 *    localisation est le fait agrégé « Où », qui vaut pour le volet et non pour
 *    une anomalie : il est affiché comme tel, jamais rattaché à une ligne.
 *  · LE SCHÉMA `genre: 'anomalies'` DU MODÈLE EST FAUX et n'est pas lu ici.
 *    `groupes[].nombre` compte les LIGNES qui mentionnent un thème, pas les
 *    anomalies : 507 « anomalies » réparties sur 7 thèmes pour 29 anomalies
 *    réelles. Le défaut est déjà signalé dans `securite.ts` ; on ne le propage
 *    pas.
 */
import type { Diagnostic } from '../../lib/modele';
import {
  LEGENDE as LEGENDE_MECANISME,
  TITRE as TITRE_MECANISME,
  mecanismeDe,
  type Mecanisme
} from '../../lib/analyse/mecanisme';
import { etiquetteDe, origineDe, type Origine } from '../../lib/analyse/confiance';
import { PRIORITAIRES, maillonDe, type Maillon } from './parcours';

/**
 * LES CLÉS DE `faits`, en un seul endroit.
 *
 * `Fait.libelle` n'est pas de la prose : c'est la clé d'un couple clé/valeur
 * que `analyse/securite.ts` écrit. La lire est légitime ; la reformuler ne le
 * serait pas. Regrouper les six clés ici évite qu'une chaîne traîne au milieu
 * d'un composant, où personne ne la retrouverait le jour où le moteur change.
 */
export const CLES = {
  anomalies: 'Anomalies relevées',
  points: 'Points relevés',
  domaines: 'Domaines en anomalie',
  compense: 'Point relevé, mais compensé',
  ou: 'Où',
  geste: 'Ce que le rapport demande',
  nonVerifies: 'Points non vérifiés'
} as const;

export type Regime = 'anomalies' | 'sansAnomalie' | 'nonLu';

export interface PointCable {
  /** L'anomalie, mot pour mot, telle que le rapport l'imprime. */
  libelle: string;
  /** Le code de la norme XP C 16-600, quand le rapport l'écrit. */
  code: string | null;
  mecanisme: Mecanisme;
  /** Le titre du dessin de mécanisme (`analyse/mecanisme.ts`). */
  titre: string;
  /** La phrase qui explique le mécanisme (`analyse/mecanisme.ts`). */
  legende: string;
  /** Le maillon touché, ou `null` quand le mécanisme n'est pas plaçable. */
  maillon: Maillon | null;
  /** Sur le maillon « matériel » : le boîtier plutôt que l'âme. */
  boitier: boolean;
  /** Le dossier demande de traiter ce point en premier. */
  prioritaire: boolean;
}

export interface Lecture {
  regime: Regime;
  /**
   * Le grand chiffre. `null` quand le rapport ne l'écrit pas — et il n'est
   * alors JAMAIS remplacé par zéro.
   */
  nombre: number | null;
  /** Ce que le chiffre compte, dans les mots qui conviennent à sa provenance. */
  unite: string;
  /** La précision sous le chiffre, quand ce n'est pas le compte du rapport. */
  precision: string | null;
  verdict: string;
  origine: Origine;
  /** Ce qu'on a le droit d'écrire au-dessus du verdict. */
  badge: string;
  /** Les anomalies, dans l'ordre du rapport. Jamais triées. */
  points: PointCable[];
  /** Combien portent sur le différentiel ou la mise à la terre. */
  prioritaires: number;
  /** Combien n'ont pas pu être placées sur la chaîne. */
  detaches: number;
  /**
   * La chaîne est-elle lisible maillon par maillon ?
   *
   * `brouillee` quand le rapport annonce des anomalies dont les libellés n'ont
   * pas pu être lus, et quand la conclusion elle-même est illisible. Dans ces
   * deux cas la chaîne entière passe en raies : on sait qu'il y a quelque
   * chose, on ne sait pas où. Une chaîne intacte serait un mensonge.
   */
  chaine: 'lisible' | 'brouillee';
  /** Les maillons contrôlés mais non essayés — en raies, jamais en vert. */
  nonVerifies: Maillon[];
  /** Le fait « Points non vérifiés », tel quel. */
  nonVerifiesTexte: { nombre: string; motif: string } | null;
  /** Les localisations du fait « Où », débarrassées de la casse de mise en page. */
  localisations: string[];
  /** Le rapport en donnait une, mais aucune n'était lisible. */
  localisationIllisible: boolean;
  /** Le geste que le rapport demande, mot pour mot. */
  geste: string | null;
  /** Le point relevé mais compensé, quand il y en a un. */
  compense: { valeur: string; precision: string | null } | null;
  date: string | null;
  pages: [number, number];
  /** Nombre de passages surlignables dans le rapport. */
  reperes: number;
  analogie: string | null;
  explication: string[];
  aFaire: string[];
}

function fait(diag: Diagnostic, cle: string): { valeur: string; precision: string | null } | null {
  const f = diag.faits.find((x) => x.libelle === cle);
  if (!f) return null;
  return { valeur: f.valeur, precision: f.precision ?? null };
}

function entier(texte: string): number | null {
  const n = Number(texte.trim());
  return Number.isFinite(n) && Number.isInteger(n) && n >= 0 ? n : null;
}

/**
 * LA MISE EN PAGE QUI DÉTEINT SUR LA DONNÉE.
 *
 * Le fait « Où » est parfois propre — `R+1 - Salle de bain`, `RDC - Wc` — et
 * parfois recollé par le générateur du rapport :
 *
 *   2ème étage - mezzaninne2ème étage - mezzanin
 *   2ème étage - Entrée/cuisine2ème étage - 2ème étage - Salle de bain /Wc
 *
 * Les deux ont la même signature : une MINUSCULE suivie immédiatement d'un
 * CHIFFRE, ce qui n'arrive jamais dans un vrai nom de pièce français — on écrit
 * « chambre 2 », avec l'espace, et « R+1 » commence par une majuscule.
 *
 * C'est une heuristique mesurée sur le corpus, pas une loi. Elle est
 * volontairement PRUDENTE : dans le doute on n'affiche rien, et on le dit.
 * Afficher une localisation fausse serait pire que n'en afficher aucune —
 * quelqu'un irait regarder la mauvaise pièce.
 */
const RECOLLEE = /[a-zà-öø-ÿ][0-9]/;

export function localisationsPropres(valeur: string): string[] {
  const vues = new Set<string>();
  const gardees: string[] = [];
  for (const brut of valeur.split('·')) {
    const t = brut.replace(/\s+/g, ' ').trim();
    if (!t || t.length > 48) continue;
    if (RECOLLEE.test(t)) continue;
    const cle = t.toLocaleLowerCase('fr');
    if (vues.has(cle)) continue;
    vues.add(cle);
    gardees.push(t);
  }
  return gardees;
}

/**
 * La lecture complète d'un volet électricité.
 *
 * Ne lève jamais : un dossier pauvre est un cas nominal, pas une erreur.
 */
export function lire(diag: Diagnostic): Lecture {
  const releves = diag.releves ?? [];
  const anomalies = releves.filter((r) => r.genre === 'anomalie');

  const points: PointCable[] = anomalies.map((r) => {
    const mecanisme = mecanismeDe('electricite', r.libelle, r.code);
    const maillon = maillonDe(mecanisme);
    return {
      libelle: r.libelle,
      code: r.code ?? null,
      mecanisme,
      titre: TITRE_MECANISME[mecanisme],
      legende: LEGENDE_MECANISME[mecanisme],
      maillon,
      boitier: mecanisme === 'enveloppe',
      prioritaire: PRIORITAIRES.includes(mecanisme)
    };
  });

  /*
   * LE GRAND CHIFFRE, ET SON ÉTIQUETTE.
   *
   * Trois comptes existent dans `faits`, et `securite.ts` prend soin de ne pas
   * les confondre — l'écran non plus. Le rapport qui écrit lui-même « comporte
   * 2 anomalies » n'est pas dans la même situation que celui dont on a compté
   * les libellés : le premier affirme, le second est énuméré. Le mot sous le
   * chiffre change, et c'est la seule façon honnête de montrer un nombre.
   */
  const fAnomalies = fait(diag, CLES.anomalies);
  const fPoints = fait(diag, CLES.points);
  const fDomaines = fait(diag, CLES.domaines);

  let nombre: number | null = null;
  let unite = '';
  let precision: string | null = null;

  if (fAnomalies) {
    nombre = entier(fAnomalies.valeur);
    unite = nombre === 1 ? 'anomalie relevée' : 'anomalies relevées';
    precision = fAnomalies.precision;
  } else if (fPoints) {
    nombre = entier(fPoints.valeur);
    unite = nombre === 1 ? 'point relevé' : 'points relevés';
    precision = fPoints.precision ?? 'domaines et libellés énumérés par le rapport';
  } else if (fDomaines) {
    nombre = entier(fDomaines.valeur);
    unite = nombre === 1 ? 'domaine en anomalie' : 'domaines en anomalie';
    precision = fDomaines.precision;
  } else if (diag.gravite !== 'neutre') {
    /* Aucun compte écrit, mais une conclusion lue : c'est le rapport qui dit
       « ne comporte aucune anomalie » sans imprimer de chiffre. */
    nombre = anomalies.length;
    unite = nombre === 1 ? 'point relevé' : 'points relevés';
  }

  const origine = origineDe(diag);

  const regime: Regime =
    diag.gravite === 'neutre' || nombre === null
      ? 'nonLu'
      : nombre === 0 && points.length === 0
        ? 'sansAnomalie'
        : 'anomalies';

  /*
   * QUAND LA CHAÎNE N'A PAS LE DROIT D'ÊTRE INTACTE.
   *
   * Un rapport peut annoncer « comporte 2 anomalies » sans que les libellés
   * aient pu être lus. On connaît alors le nombre, pas les endroits. Dessiner
   * six maillons allumés à côté d'un grand « 2 » ferait exactement le contraire
   * de ce que dit la donnée. La chaîne entière passe donc en raies.
   */
  const chaine: 'lisible' | 'brouillee' =
    regime === 'nonLu' || (regime === 'anomalies' && points.length === 0) ? 'brouillee' : 'lisible';

  /*
   * LE DIFFÉRENTIEL QU'ON N'A PAS PU ESSAYER — déduit de la STRUCTURE, pas
   * d'une chaîne de caractères.
   *
   * `securite.ts` ne pose `attention` sur un volet SANS anomalie que dans un
   * seul cas : `differentielNonEssaye`. Le chemin est unique et vérifiable en
   * lisant la fonction — aucune autre branche ne produit ce couple. On tient
   * donc le maillon sans avoir à reconnaître une phrase, ce qui casserait à la
   * première reformulation.
   *
   * Dès qu'il y a des anomalies, la gravité s'explique autrement : on ne place
   * plus rien, et le fait est affiché tel quel, sans être rattaché à un maillon.
   */
  const fNonVerifies = fait(diag, CLES.nonVerifies);
  const nonVerifies: Maillon[] =
    fNonVerifies && regime === 'sansAnomalie' && diag.gravite === 'attention'
      ? ['differentiel']
      : [];

  const fOu = fait(diag, CLES.ou);
  const localisations = fOu ? localisationsPropres(fOu.valeur) : [];

  const fCompense = fait(diag, CLES.compense);
  const fGeste = fait(diag, CLES.geste);

  return {
    regime,
    nombre,
    unite,
    precision,
    verdict: diag.verdict,
    origine,
    badge: etiquetteDe(origine),
    points,
    prioritaires: points.filter((p) => p.prioritaire).length,
    detaches: points.filter((p) => p.maillon === null).length,
    chaine,
    nonVerifies,
    nonVerifiesTexte: fNonVerifies
      ? { nombre: fNonVerifies.valeur, motif: fNonVerifies.precision ?? '' }
      : null,
    localisations,
    localisationIllisible: fOu !== null && localisations.length === 0,
    geste: fGeste ? fGeste.valeur : null,
    compense: fCompense,
    date: diag.date ?? null,
    pages: diag.pages,
    reperes: diag.reperes?.length ?? 0,
    analogie: diag.analogie ?? null,
    explication: diag.explication,
    aFaire: diag.aFaire
  };
}

/**
 * LA LUMIÈRE DU CUIVRE.
 *
 * ── La bride, et pourquoi elle existe ──────────────────────────────────────
 *
 * `teinteDuCarreau()` bride le carreau à 3400 K parce qu'un carreau
 * rétroéclairé a son propre tube et ne suit pas le soleil. Le cuivre a la même
 * raison, en plus forte : ce n'est pas une surface éclairée, c'est un MÉTAL, et
 * un conducteur de cuivre n'est jamais blanc. Sans bride, à midi, le câble
 * sortirait à #faf6ee — un fil blanc. Bridé à 3000 K il vaut #e8b06a, teinte
 * 33,3°, dans la famille ambre relevée sur la publicité (#eba303, #e09402), et
 * très loin de l'intervalle interdit 60°–140°.
 *
 * Aucune couleur nouvelle n'est introduite : les deux bornes du fil sont des
 * ancrages de la RAMPE de `heure.ts`. La chaleur se pose sur le vert, elle ne
 * s'y mélange pas.
 *
 * ── Le plancher, et pourquoi il existe ─────────────────────────────────────
 *
 * L'alpha du fil vit dans [0,74 ; 0,94], et le bord du dégradé à 88 % de là. Un fil qui suivrait l'intensité du
 * jour tomberait à 0,12 la nuit et n'atteindrait plus les 3:1 exigés d'un
 * élément graphique — or c'est LUI qui porte toute l'information de la scène.
 * C'est la même règle que « la nuit, ce sont les carreaux eux-mêmes qui
 * éclairent la pièce » : la source ne s'éteint pas avec le jour.
 *
 * Le PIRE CAS n'est pas la nuit — c'est L'AUBE, et il fallait le mesurer pour
 * le savoir. À 7 h la source est faible ET sa teinte est la plus sombre de la
 * rampe (#d98a3f, la braise à 2000 K) ; à minuit elle est faible mais posée à
 * 2700 K, donc plus claire. Le bord du dégradé y tombait à 3,15 avec une plage
 * [0,62 ; 0,92]. La plage retenue est plus étroite et plus haute — la variation
 * d'heure passe surtout par la TEINTE, ce qui est d'ailleurs plus juste : un
 * conducteur ne change pas de luminosité de moitié entre le matin et midi.
 */
export const BRIDE_CUIVRE = 3000;
export const PLANCHER_FIL = 0.74;
export const PLAFOND_FIL = 0.94;
export const PLANCHER_HALO = 0.06;
export const PLAFOND_HALO = 0.2;

export interface Fil {
  /** Alpha du fil, déjà borné. */
  alpha: number;
  /** Alpha du halo autour d'un maillon allumé. */
  halo: number;
  /** Le côté d'où vient la lumière, 0 à 1 dans la largeur du plateau. */
  centre: number;
}

export function filDe(intensite: number, facteurLumiere: number, azimut: number): Fil {
  const source = Math.max(0, Math.min(1, intensite)) * facteurLumiere;
  return {
    alpha: Math.max(PLANCHER_FIL, Math.min(PLAFOND_FIL, PLANCHER_FIL + 0.2 * source)),
    halo: Math.max(PLANCHER_HALO, Math.min(PLAFOND_HALO, PLANCHER_HALO + 0.14 * source)),
    centre: Math.max(0.15, Math.min(0.85, 0.5 + azimut * 0.35))
  };
}
