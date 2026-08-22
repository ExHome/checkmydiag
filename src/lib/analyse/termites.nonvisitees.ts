/**
 * Rubrique F — les pièces que l'opérateur n'a PAS pu visiter.
 *
 * ## Pourquoi c'est l'information principale d'un rapport de termites
 *
 * « EXAMINÉ + ABSENCE D'INDICE » n'est pas « NON EXAMINÉ ». Une zone
 * inaccessible ne peut jamais devenir une zone sans termites — c'est le § 15 de
 * l'ordre de mission, et il est absolu.
 *
 * Or les pièces que le rapport déclare non visitées sont, dans leur écrasante
 * majorité, **les combles**. Et des combles non visités, cela veut dire **la
 * charpente non contrôlée** — c'est-à-dire précisément l'endroit où les termites
 * se voient. Un rapport qui conclut « absence d'indices » sans que personne soit
 * monté dans les combles ne dit pas la même chose qu'un rapport où tout a été
 * regardé, et Verrière ne faisait pas la différence.
 *
 * ## Mesuré le 22/08/2026, sur 250 volets termites
 *
 * ```
 * rubrique F trouvée              : 249 sur 250
 * répondue « Néant »              : la grande majorité
 * qui NOMME au moins une pièce    : les autres
 * ```
 *
 * Les motifs relevés, mot pour mot — tous parlent d'accès, aucun de termites :
 *
 * ```
 * Absence de trappe de visite            Trappe d'accès trop petite
 * Plafond rampant, contrôle de la        Moyen d'accès insuffisant
 *   charpente impossible                 Accès condamné
 * Encombrement trop important            Emplacement non identifiable
 * Impossibilité d'entrer / mansarde      Problèmes mécaniques
 * Absence d'accès : préconisation de création d'accès sécurisé par le propriétaire
 * Contrôle de la charpente impossible sous les doublages dans le grenier
 * ```
 *
 * ## ⚠️ UN LECTEUR PAR ÉDITEUR — le titre lui-même diffère
 *
 * ```
 * LICIEL  « F. – Identification des bâtiments et parties DU BÂTIMENT
 *           (pièces et volumes) n'ayant pu être visités et justification : »
 * BC2E    « F. IDENTIFICATION DES BÂTIMENTS ET PARTIES DE BÂTIMENTS
 *           (PIÈCES ET VOLUMES) N'AYANT PU ÊTRE VISITÉS ET JUSTIFICATION : »
 * ```
 *
 * « parties DU bâtiment » chez l'un, « parties DE bâtimentS » chez l'autre. Un
 * motif écrit sur LICIEL ne trouve pas la rubrique de BC2E — mesuré : elle
 * ressortait « ABSENTE » sur le seul volet BC2E du corpus.
 *
 * Et le titre court sur DEUX lignes chez les deux : on l'accroche sur sa
 * première, jamais sur la phrase entière.
 */

/** Espaces et apostrophes écrasés : l'extraction coupe les mots au milieu. */
function aplati(l: string): string {
  return l
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, '')
    .toLowerCase();
}

function propre(t: string): string {
  return t.replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1').trim();
}

export interface PieceNonVisitee {
  /**
   * La ligne du rapport, entière — « 1er étage - Combles (Absence de trappe de
   * visite) ». On cite, puis on explique.
   */
  terme: string;
  /** OÙ : ce qui précède la parenthèse. */
  ou: string;
  /**
   * POURQUOI : ce que la parenthèse dit, dans les mots du rapport.
   *
   * Vide quand le rapport n'en donne pas — jamais deviné (§ 24).
   */
  pourquoi: string;
}

export interface LectureNonVisitees {
  /** La rubrique a-t-elle été trouvée ? */
  trouvee: boolean;
  /**
   * La rubrique existe et répond « Néant » : tout a été visité.
   *
   * ⚠️ Distinct de `trouvee: false`. Répondre n'est pas se taire, et se taire
   * n'est pas répondre.
   */
  neant: boolean;
  pieces: PieceNonVisitee[];
  editeur: string | null;
}

const RIEN: LectureNonVisitees = { trouvee: false, neant: false, pieces: [], editeur: null };

/**
 * Le titre, accroché sur sa PREMIÈRE ligne.
 *
 * Il court sur deux lignes chez les deux éditeurs, et les mots diffèrent
 * (« du bâtiment » / « de bâtiments »). On accroche donc le début, commun, et on
 * exige la marque « n'ayant pu » qui distingue F de G.
 */
const TITRE_F = /^[a-z]?[.\-–—]*identificationdesb[âa]timentsetparties?d[eu]/;
const MARQUE_F = /n['’]?ayantpu/;

/** Ce qui referme : la rubrique G, ou le nota de bas de rubrique. */
const FIN_F =
  /^[a-z]?[.\-–—]*(?:identificationdesouvrages|moyensd'investigation|visa|constatationsdiverses)|^nota\s*\d*:|^note\s*\d*:/;

/**
 * La seconde ligne du titre, à ne pas prendre pour du contenu.
 *
 * ⚠️ LE TITRE SE COUPE À DEUX ENDROITS DIFFÉRENTS, et je n'en connaissais qu'un.
 * Mesuré : la rubrique G ressortait « Néant » ZÉRO fois sur 250 volets, alors
 * qu'elle y répond « Néant - ». La cause était ici.
 *
 *     forme A   « … (pièces et volumes) n'ayant pu être »
 *               « visités et justification : »
 *     forme B   « … n'ayant pu être visités et »
 *               « justification : »
 *
 * La seconde ligne peut donc n'être que « justification : ». Non filtrée, elle
 * reste dans le corps, et « justification : Néant » ne ressemble plus à
 * « Néant ».
 */
const SUITE_DU_TITRE = /^(?:[êe]tre)?visit[ée]setjustification:?$|^justification:?$/;

/** L'habillage qui traverse la rubrique aux sauts de page. */
const HABILLAGE = /^etatrelatif|^sarl|^rcs:|^rapportdu:?$|^\d+\/\d+$|^n°siren|^\d{2}\/\d{2}\/\d{4}$/;

/**
 * Découper les entrées.
 *
 * ⚠️ Le séparateur est « **),** » — une virgule APRÈS la parenthèse fermante —
 * et non la virgule seule : les motifs en contiennent (« Plafond rampant,
 * contrôle de la charpente impossible »). Découper sur la virgule casserait le
 * motif en deux.
 */
function decouper(corps: string): PieceNonVisitee[] {
  const morceaux = corps
    .split(/\)\s*,\s*/)
    .map((m, i, tous) => (i < tous.length - 1 ? `${m})` : m))
    .map(propre)
    .filter((m) => m.length > 1);

  return morceaux.map((terme) => {
    const m = /^(.*?)\s*\((.+)\)\s*\.?$/s.exec(terme);
    /* Sans parenthèse, le rapport ne donne pas de motif : on ne lui en invente
       pas un. Le « où » est alors la ligne entière. */
    return m?.[1]
      ? { terme, ou: propre(m[1]), pourquoi: propre(m[2] ?? '') }
      : { terme, ou: terme, pourquoi: '' };
  });
}

function lireRubriqueF(lignes: string[], editeur: string): LectureNonVisitees {
  const plats = lignes.map(aplati);

  for (let debut = 0; debut < lignes.length; debut++) {
    if (!TITRE_F.test(plats[debut] ?? '')) continue;
    /* La marque « n'ayant pu » distingue F de G : les deux titres commencent
       par « Identification des… ». Elle peut tomber sur la ligne suivante. */
    if (!MARQUE_F.test(`${plats[debut]}${plats[debut + 1] ?? ''}`)) continue;

    const apres = plats.slice(debut + 1).findIndex((l) => FIN_F.test(l));
    const fin = apres < 0 ? Math.min(debut + 20, lignes.length) : debut + 1 + apres;

    const corps = propre(
      lignes
        .slice(debut + 1, fin)
        .filter((_l, i) => {
          const a = plats[debut + 1 + i] ?? '';
          return a !== '' && !SUITE_DU_TITRE.test(a) && !HABILLAGE.test(a);
        })
        .join(' ')
    );

    if (!corps) continue;
    if (/^n[ée]ant\.?$/i.test(corps)) {
      return { trouvee: true, neant: true, pieces: [], editeur };
    }
    return { trouvee: true, neant: false, pieces: decouper(corps), editeur };
  }

  return RIEN;
}

/**
 * Lire la rubrique F — avec la carte de CET éditeur.
 *
 * Les deux cartes se rejoignent ici : la rubrique est une liste, pas un tableau
 * à colonnes entrelacées, et sa forme est la même de part et d'autre une fois le
 * titre reconnu. C'est assez rare pour être dit — et cela ne dispense pas de
 * nommer l'éditeur : le TITRE, lui, diffère, et un éditeur non couvert reste
 * sans lecture (§ 15).
 */
export function piecesNonVisitees(
  lignes: string[],
  editeur: string | null | undefined
): LectureNonVisitees {
  if (editeur === 'LICIEL' || editeur === 'BC2E') return lireRubriqueF(lignes, editeur);
  return RIEN;
}

/**
 * Les combles ou la charpente sont-ils du nombre ?
 *
 * La question n'est pas décorative : c'est là que les termites se voient. Un
 * « absence d'indices » sans montée dans les combles ne vaut pas un « absence
 * d'indices » sur un bien entièrement regardé.
 */
export function charpenteNonControlee(lecture: LectureNonVisitees): boolean {
  return lecture.pieces.some((p) => /combles?|charpente|grenier|toiture/i.test(p.terme));
}

/* ════════════════════════════════════════════════════════════════════════════
   RUBRIQUE G — les ouvrages qui n'ont PAS été examinés
   ════════════════════════════════════════════════════════════════════════════

   Rubrique F dit quelles PIÈCES n'ont pas été visitées. Rubrique G dit quels
   OUVRAGES n'ont pas été examinés dans les pièces où l'opérateur est entré —
   les murs derrière un doublage, la sous-face d'un parquet collé, le plancher
   sur solives sous un carrelage. C'est la seconde moitié du § 14 de l'ordre de
   mission, et elle porte le cas le plus parlant du corpus : « les MURS de HUIT
   pièces, revêtement fixé ».

   ⚠️ C'EST LE TABLEAU LE PLUS ENTRELACÉ DU CORPUS, chez LICIEL.

   Trois colonnes — Localisation | Ouvrages | Motif — dont les cellules sont
   VERTICALEMENT CENTRÉES. Le reflow du texte pose donc la cellule courte au
   milieu du bloc de la cellule longue, et coupe un mot en deux :

       Rez de chaussée - Entrée, Rez de chaussée
       - Chambre 1, Rez de chaussée - Chambre
       2, Rez de chaussée - Salle de bain, Rez de
       Mur           Revetement fixé          ← les colonnes 2 et 3, insérées
       chaussée - Séjour, Rez de chaussée -
       Cuisine, Rez de chaussée - Cellier, Rez de
       chaussée - Wc

   Recoller les lignes dans l'ordre donne « … Rez de **Mur Revetement fixé**
   chaussée - Séjour … » : le nom d'une pièce coupé en deux par deux autres
   colonnes.

   La réponse propre serait la GÉOMÉTRIE — les abscisses des cellules. Elle
   n'est pas branchée dans ce pipeline, et le faire toucherait des fichiers
   qu'une autre session édite. On fait donc ce que le texte permet, et on le dit.

   LA RÈGLE APPLIQUÉE : une ligne est INSÉRÉE quand elle interrompt une phrase
   dont les deux moitiés se recollent. Ce qu'elle contient dit ensuite laquelle
   des colonnes elle porte :

       « Ensemble du bien - »        → une localisation ; le bloc est le motif
       « Mur   Revetement fixé »     → ouvrage + motif ; le bloc est la
                                       localisation

   Et quand rien ne tranche, ON NE SÉPARE PAS : le bloc est cité tel quel,
   marqué `separable: false`. Mieux vaut un texte brut qu'un tableau inventé. */

/** Le titre de G — « qui n'ont pas été examinés », là où F dit « n'ayant pu ». */
const TITRE_G = /^[a-z]?[.\-–—]*identificationdesouvrages/;
const MARQUE_G = /n['’]?ontpas[ée]t[ée]examin[ée]s|[ée]l[ée]mentsnonexamin[ée]s|^pi[èe]ces[ée]l[ée]ments/;

const FIN_G =
  /^[a-z]?[.\-–—]*(?:moyensd'investigation|visa|constatationsdiverses|conclusion|annexe)|^nota\s*\d*:|^note\s*\d*:/;

/** Les trois lignes d'en-tête des colonnes, à écarter. */
const ENTETE_G =
  /^listedesouvrages,?parties$|^d'ouvrages$|^localisationmotif$|^localisation$|^motif$|^pi[èe]ces[ée]l[ée]mentsnonexamin[ée]s$/;

/**
 * Le texte-type que LICIEL imprime dans cette rubrique, mot pour mot.
 *
 * C'est le même que celui des constatations diverses : il borne l'examen sans
 * désigner d'ouvrage particulier. On le sort du bloc pour qu'il ne noie pas les
 * exclusions réelles, et on le rend à part.
 */
const TEXTE_TYPE_G =
  /Le diagnostic se limite aux zones rendues visibles et accessibles par le propri[ée]taire\.?.*?(?:accès combles insuffisant,?\s*etc|par d[ée]faut d['’]acc[èe]s\.?)/is;

export interface OuvrageNonExamine {
  /** Le texte du rapport pour cette entrée. */
  terme: string;
  /** OÙ, quand les colonnes ont pu être séparées. */
  ou?: string;
  /** POURQUOI, quand le rapport le donne et que la séparation a tenu. */
  pourquoi?: string;
  /**
   * Les colonnes ont-elles pu être séparées ?
   *
   * `false` veut dire « le rapport le dit, mais son tableau ne se sépare pas en
   * texte » — on cite alors le bloc entier plutôt que d'inventer un appariement.
   */
  separable: boolean;
}

export interface LectureNonExamines {
  trouvee: boolean;
  neant: boolean;
  ouvrages: OuvrageNonExamine[];
  /** Le texte-type de bornage, quand le rapport l'imprime. */
  bornage?: string;
  editeur: string | null;
}

const RIEN_G: LectureNonExamines = { trouvee: false, neant: false, ouvrages: [], editeur: null };

/**
 * La ligne INSÉRÉE : celle qui coupe une phrase dont les deux moitiés se
 * recollent.
 *
 * Les cellules du tableau sont verticalement centrées ; la courte tombe donc au
 * milieu du bloc de la longue. On la reconnaît à ce qu'elle produit : la ligne
 * d'avant se termine sur un fragment, celle d'après en porte la suite.
 *
 *     « … Salle de bain, Rez de »   ← se termine sur « Rez de »
 *     « Mur   Revetement fixé »     ← l'intruse
 *     « chaussée - Séjour, … »      ← reprend sur « chaussée »
 */
function lignesQuiSeRecollent(avant: string, apres: string): boolean {
  const finMot = /[a-zà-ÿ]$/i.test(avant.trim()) && !/[.,;:]$/.test(avant.trim());
  const suiteMot = /^[a-zà-ÿ]/.test(apres.trim());
  return finMot && suiteMot;
}

/** Une localisation LICIEL : niveaux, pièces, et le tiret de colonne vide. */
const RESSEMBLE_A_UNE_LOCALISATION =
  /(?:rez de chauss[ée]e|\d+(?:er|[èe]me)?\s*[ée]tage|R\+\d|RDC|sous-sol|combles?|ensemble du bien)/i;

function lireRubriqueG(lignes: string[], editeur: string): LectureNonExamines {
  const plats = lignes.map(aplati);

  for (let debut = 0; debut < lignes.length; debut++) {
    if (!TITRE_G.test(plats[debut] ?? '')) continue;
    if (!MARQUE_G.test(`${plats[debut]}${plats[debut + 1] ?? ''}${plats[debut + 2] ?? ''}`)) continue;

    const apres = plats.slice(debut + 1).findIndex((l) => FIN_G.test(l));
    const fin = apres < 0 ? Math.min(debut + 40, lignes.length) : debut + 1 + apres;

    const utiles = lignes
      .slice(debut + 1, fin)
      .filter((_l, i) => {
        const a = plats[debut + 1 + i] ?? '';
        return (
          a !== '' &&
          !ENTETE_G.test(a) &&
          !HABILLAGE.test(a) &&
          /* Même piège qu'en F : la seconde ligne du titre est tantôt
             « examinés et justification : », tantôt « justification : » seul. */
          !/^examin[ée]setjustification:?$/.test(a) &&
          !/^[ée]tre?examin[ée]setjustification:?$/.test(a) &&
          !/^justification:?$/.test(a)
        );
      });

    if (!utiles.length) continue;

    const recolle = propre(utiles.join(' '));
    if (/^n[ée]ant(\s*[-–—]\s*)*$/i.test(recolle)) {
      return { trouvee: true, neant: true, ouvrages: [], editeur };
    }

    /* Le texte-type de bornage sort du bloc : il ne désigne aucun ouvrage, et
       il noierait les exclusions réelles. */
    const type = TEXTE_TYPE_G.exec(recolle);
    const bornage = type?.[0] ? propre(type[0]) : undefined;

    /* On repère les lignes insérées, dans les lignes restées. */
    const restantes = utiles.filter((l) => !bornage || !bornage.includes(propre(l)));
    const ouvrages: OuvrageNonExamine[] = [];
    const bloc: string[] = [];
    const intruses: string[] = [];

    for (let i = 0; i < restantes.length; i++) {
      const avant = restantes[i - 1];
      const apresL = restantes[i + 1];
      if (avant && apresL && lignesQuiSeRecollent(avant, apresL)) intruses.push(restantes[i] ?? '');
      else bloc.push(restantes[i] ?? '');
    }

    if (intruses.length === 1 && bloc.length) {
      const intruse = propre(intruses[0] ?? '');
      const reste = propre(bloc.join(' '));
      /* Laquelle des colonnes l'intruse porte-t-elle ? Son contenu le dit. */
      const intruseEstLocalisation = RESSEMBLE_A_UNE_LOCALISATION.test(intruse);
      ouvrages.push(
        intruseEstLocalisation
          ? { terme: `${intruse} ${reste}`, ou: intruse, pourquoi: reste, separable: true }
          : { terme: `${reste} — ${intruse}`, ou: reste, pourquoi: intruse, separable: true }
      );
    } else if (restantes.length) {
      /* Rien ne tranche : on CITE, on ne sépare pas. Un tableau inventé serait
         pire qu'un texte brut (§ 24). */
      ouvrages.push({ terme: propre(restantes.join(' ')), separable: false });
    }

    return {
      trouvee: true,
      neant: false,
      ouvrages,
      ...(bornage ? { bornage } : {}),
      editeur
    };
  }

  return RIEN_G;
}

/**
 * Lire la rubrique G — avec la carte de CET éditeur.
 *
 * ⚠️ BC2E n'a PAS ce problème : son tableau est propre, une ligne par élément,
 * la pièce à gauche, et les lignes suivantes héritent de la pièce. Sa lecture
 * est donc exacte là où celle de LICIEL est approchée — encore une raison de ne
 * jamais appliquer une carte à un autre éditeur.
 */
export function ouvragesNonExamines(
  lignes: string[],
  editeur: string | null | undefined
): LectureNonExamines {
  if (editeur === 'LICIEL' || editeur === 'BC2E') return lireRubriqueG(lignes, editeur);
  return RIEN_G;
}
