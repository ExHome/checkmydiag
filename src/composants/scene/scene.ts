/**
 * LE LANGAGE DES SCHÉMAS — les types, et ce qu'ils rendent impossible.
 *
 * Ordre d'Aude du 22 août 2026 : « obligation de revoir tous les schémas, tu
 * n'en gardes aucun ; je souhaite que l'on puisse cliquer dessus comme une
 * mise en lumière ».
 *
 * Trente et un composants, dix mille lignes, et autant de dessins
 * indépendants. Ce fichier est la fondation de leur remplacement : non pas
 * trente et un dessins de plus, mais un LANGAGE dont chaque schéma sera une
 * phrase.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CE QUE CES TYPES INTERDISENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Un type ne fait pas que décrire : il empêche. Ceux-ci sont écrits pour
 * qu'un schéma ne PUISSE PAS afficher ce que le rapport ne dit pas.
 *
 *   · un `Mot` ne se construit qu'avec `motDuRapport()`. Il n'existe aucun
 *     autre chemin, et aucune chaîne libre n'est acceptée là où un `Mot` est
 *     attendu : ce qui s'affiche dans la scène vient du document ;
 *
 *   · une `Note` — ce que Verrière dit de sa propre lecture — est un type
 *     DIFFÉRENT. Les deux ne peuvent pas se substituer l'un à l'autre, et
 *     l'écran ne peut donc pas présenter un commentaire comme une citation ;
 *
 *   · l'état `bon` exige une `sonde` : une preuve que le rapport a REGARDÉ
 *     là. Sans elle, le vert est inconstruisible. C'est la traduction en
 *     types de la règle qui traverse tout ce produit — une absence
 *     d'information n'est pas une bonne nouvelle ;
 *
 *   · `nonControle` exige un `motif` venu du rapport, et `nonConclu` une
 *     `Note` de Verrière. Les deux existent séparément parce qu'ils ne disent
 *     pas la même chose : « le diagnostiqueur n'a pas pu » n'est pas « nous
 *     n'avons pas su lire ». Les confondre accuserait le professionnel de ne
 *     pas avoir fait son travail.
 */

/** Un mot qui vient du rapport. Il n'existe aucun autre constructeur. */
export interface Mot {
  readonly texte: string;
  readonly source: 'rapport';
  /** La page où le lire, quand on la connaît. */
  readonly page?: number;
}

/**
 * Cite le rapport.
 *
 * Le texte n'est pas reformulé : c'est ce qu'a écrit un professionnel qui
 * engage sa responsabilité. L'explication vient après, ailleurs, et se
 * distingue à l'œil.
 */
export function motDuRapport(texte: string, page?: number): Mot {
  return page === undefined
    ? { texte, source: 'rapport' }
    : { texte, source: 'rapport', page };
}

/** Ce que Verrière dit de sa propre lecture. Jamais affiché comme une citation. */
export interface Note {
  readonly texte: string;
  readonly source: 'verriere';
}

export function noteDeLecture(texte: string): Note {
  return { texte, source: 'verriere' };
}

/**
 * LES CINQ ÉTATS D'UNE BRIQUE. Union fermée : aucun sixième n'est
 * représentable, et le compilateur refuse un `switch` qui en oublie un.
 *
 * Quatre auraient suffi si l'on confondait les deux dernières lignes. Le §7 de
 * l'ordre termites l'interdit, et l'expérience lui donne raison : afficher
 * « non contrôlé » quand c'est Verrière qui n'a pas su lire revient à écrire
 * que le diagnostiqueur n'y est pas allé.
 */
export type Etat =
  /** Le rapport a regardé et n'a rien trouvé. La sonde le prouve. */
  | { readonly etat: 'bon'; readonly sonde: Mot }
  /** Quelque chose est à surveiller. */
  | { readonly etat: 'attention' }
  /** Quelque chose coince. */
  | { readonly etat: 'alerte' }
  /** Le RAPPORT dit qu'il n'a pas pu. Le motif est le sien. */
  | { readonly etat: 'nonControle'; readonly motif: Mot }
  /** VERRIÈRE n'a pas su lire. Jamais un motif du rapport. */
  | { readonly etat: 'nonConclu'; readonly note: Note };

/** Les rangs de gravité, pour trier sans jamais réordonner un rapport. */
export const RANG: Record<Etat['etat'], number> = {
  alerte: 4,
  attention: 3,
  nonControle: 2,
  nonConclu: 1,
  bon: 0
};

/**
 * LA MISE EN LUMIÈRE.
 *
 * Le produit s'appelle Verrière ; sa promesse est de faire entrer la lumière
 * sur un document opaque. Toucher une partie du schéma doit donc l'ÉCLAIRER —
 * la révéler — et non ouvrir une bulle par-dessus.
 *
 * ── CE QUE LA MESURE A IMPOSÉ ──────────────────────────────────────────────
 *
 * Le faisceau ne peut pas être coloré. Mesuré : une couleur de l'arrêté DPE
 * posée à pleine opacité sur un plateau localement éclairé tombe à 1,43 de
 * contraste pour la classe A et 1,30 pour la G — très en dessous du seuil de
 * 3 exigé d'un élément graphique. Un faisceau teinté est inconstruisible.
 *
 * Le faisceau est donc BLANC, et c'est l'opacité de la brique qui change :
 * `0.28` au repos, `1` sous la lumière. Rien n'est peint par-dessus, aucune
 * coordonnée n'est calculée, et la couleur d'état reste intacte — elle porte
 * la gravité, elle ne sert pas d'éclairage.
 */
export const OPACITE_REPOS = 0.28;
export const OPACITE_ECLAIREE = 1;

/**
 * Les encres, mesurées sur le plateau sombre du produit, lampe comprise.
 *
 *   ivoire α 0,42 → 2,20 sous la lampe   refusé
 *   ivoire α 0,55 → 2,70 sous la lampe   refusé
 *   ivoire α 0,72 → 3,49 sous la lampe   élément graphique ✓
 *   ivoire α 1,00 → 5,03 sous la lampe   texte ✓
 *
 * D'où la règle : tout ce qui PORTE une information est à 0,72 au moins, et
 * tout TEXTE est à 1. Les valeurs plus basses ne servent qu'à ce qui ne dit
 * rien — une trame, un repère de construction.
 */
export const ENCRE_PORTEUSE = 0.72;
export const ENCRE_TEXTE = 1;
export const ENCRE_TRAME = 0.08;

/** Ce dont un schéma est fait. */
export type Brique =
  /** Un volume : le bâti, le sol. Jamais touchable, jamais d'état. */
  | { readonly forme: 'volume'; readonly d: string; readonly nom: string }
  /** Une pièce, une zone, un local. */
  | ({
      readonly forme: 'cellule';
      readonly id: string;
      readonly d: string;
      readonly nom: string;
      readonly dit: Mot;
      /** Le dessin du niveau « près », révélé sous la lumière. */
      readonly detail?: string;
    } & Etat)
  /** Une paroi : mur, plancher, toiture. `dehors` dit de quel côté est l'extérieur. */
  | ({
      readonly forme: 'paroi';
      readonly id: string;
      readonly d: string;
      readonly nom: string;
      readonly dit: Mot;
      readonly dehors: 'haut' | 'bas' | 'gauche' | 'droite';
    } & Etat)
  /** Un point : une prise, un sondage, un relevé. */
  | ({
      readonly forme: 'jalon';
      readonly id: string;
      readonly x: number;
      readonly y: number;
      readonly nom: string;
      readonly dit: Mot;
    } & Etat);

/** Une scène complète : ce qu'un schéma montre. */
export interface Scene {
  /** Le titre, à hauteur de lecteur. */
  readonly titre: string;
  /** La question à laquelle le schéma répond. */
  readonly question: string;
  readonly briques: readonly Brique[];
  /**
   * Ce que la scène ne montre pas, et qu'il faut dire.
   *
   * Un schéma qui se tait sur ses angles morts laisse croire qu'il est
   * complet. Cette liste est affichée sous le dessin, jamais repliée.
   */
  readonly horsChamp: readonly Mot[];
}

/** Les briques touchables, dans l'ordre du rapport. */
export function briquesTouchables(scene: Scene): readonly Brique[] {
  return scene.briques.filter((b) => b.forme !== 'volume');
}

/**
 * Combien de briques portent chaque état.
 *
 * Sert à la phrase qui accompagne le dessin — « 2 isolés, 1 non isolé, 2 dont
 * le rapport ne dit rien » — et jamais à trier le dessin lui-même : l'ordre
 * d'une scène est celui du rapport, pas celui de la gravité.
 */
export function compter(scene: Scene): Record<Etat['etat'], number> {
  const compte: Record<Etat['etat'], number> = {
    bon: 0,
    attention: 0,
    alerte: 0,
    nonControle: 0,
    nonConclu: 0
  };
  for (const b of scene.briques) {
    if (b.forme === 'volume') continue;
    compte[b.etat] += 1;
  }
  return compte;
}

/**
 * Ce que dit une brique, en une phrase, sans jamais rassurer à tort.
 *
 * C'est ici que se joue la différence entre les cinq états : chacun a sa
 * formulation, et aucune ne peut être produite par une autre.
 */
export function phraseDe(b: Brique): string {
  if (b.forme === 'volume') return b.nom;
  switch (b.etat) {
    case 'bon':
      return `${b.nom} — le rapport a regardé et n’a rien signalé : « ${b.sonde.texte} »`;
    case 'attention':
      return `${b.nom} — à surveiller : « ${b.dit.texte} »`;
    case 'alerte':
      return `${b.nom} — ça coince : « ${b.dit.texte} »`;
    case 'nonControle':
      return `${b.nom} — le rapport n’a pas pu contrôler : « ${b.motif.texte} »`;
    case 'nonConclu':
      return `${b.nom} — ${b.note.texte}`;
  }
}
