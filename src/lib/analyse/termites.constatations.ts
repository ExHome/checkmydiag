/**
 * Les « Constatations diverses » de l'état relatif à la présence de termites.
 *
 * ## Pourquoi cette rubrique compte plus que la conclusion
 *
 * Le tableau D d'un rapport termites répond à UNE question : y a-t-il des
 * indices de termites sur les éléments examinés ? Tout le reste de ce que
 * l'opérateur a vu — vrillettes, moisissures, pourriture, humidité, l'historique
 * du bien, ce qu'il n'a pas pu regarder — tombe dans cette rubrique-ci.
 *
 * Lu sur un même logement réexpertisé quatre fois, la rubrique raconte qu'il y a
 * eu des termites six mois plus tôt et que le plancher a dû être remplacé —
 * pendant que le tableau D, lui, est redevenu « Absence d'indices » partout.
 * Verrière annonçait « aucun indice d'infestation » : la phrase est exacte, et le
 * lecteur en tire une conclusion fausse.
 *
 * ## ⚠️ UN LECTEUR PAR ÉDITEUR
 *
 * Contrainte absolue, permanente et générale — `ODM_LECTEURS_PAR_EDITEUR`. La
 * rubrique n'a ni la même lettre, ni la même mise en page, ni le même contenu
 * d'un éditeur à l'autre :
 *
 * ```
 * LICIEL   « H. - Constatations diverses : » … ou « I. - » selon la version
 *          trois colonnes entrelacées, la localisation plantée EN PLEIN TEXTE
 *          réponse vide : « Néant - - »
 *
 * BC2E     « I. CONSTATATIONS DIVERSES : » en capitales, sans tiret
 *          des sous-libellés nommés, chacun avec sa réponse
 *          réponse vide : « Observations : Néant »
 *          + trois rubriques de plus derrière : J. OBSERVATIONS, K. INFORMATIONS,
 *            L. ECARTS / ADJONCTIONS
 * ```
 *
 * **Éditeur non reconnu : on se tait.** Jamais deviner avec le lecteur d'un
 * autre — c'est ce que la règle de sûreté impose, et onze volets sur 250 sont
 * dans ce cas.
 *
 * ## Mesuré le 21/08/2026
 *
 * ```
 * 250 volets termites   238 LICIEL · 11 INCONNU · 1 BC2E
 * 120 volets LICIEL     rubrique présente : 120 sur 120 · « Néant » : 48
 *  40 rubriques lues    ~17 clauses de limite · 5 constatations réelles
 * ```
 */

/**
 * ⚠️ On compare des lignes SANS ESPACES.
 *
 * L'extraction coupe les mots au milieu : « H. - Const atations diverses : »,
 * « I. - Moyens d'i nvestigation », « lam bris », « n'on t pu », « s tock ».
 * C'est le même piège que « eff ondré » du corpus plomb. Un motif qui décrit
 * l'orthographe d'un moteur de rendu ne décrit rien.
 */
function aplati(l: string): string {
  return l
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, '')
    .toLowerCase();
}

/**
 * Le texte du rapport, remis d'aplomb pour l'affichage — sans le réécrire.
 *
 * ⚠️ On recolle les lignes et on referme les espaces avant la virgule et le
 * point, que la mise en colonnes laisse traîner. **On ne touche PAS aux deux-
 * points ni au point-virgule** : le français met une espace devant, le rapport
 * l'écrit, et « ne pas corriger la ponctuation d'un terme cité » est une règle
 * de l'ordre de mission — pas une préférence typographique.
 */
function propre(t: string): string {
  return t.replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1').trim();
}

/*
 * ⚠️ DEUX FAUTES D'ÉCHAPPEMENT, L'UNE APRÈS L'AUTRE, SUR CE MÊME FICHIER.
 *
 * 1. **L'apostrophe typographique.** Motifs écrits avec l'apostrophe droite :
 *    le lecteur BC2E ne rendait RIEN, parce que le rapport écrit « d’infestation »
 *    et non « d'infestation ». C'est exactement la faute corrigée la veille du
 *    côté du plomb, refaite ici.
 *
 * 2. **La chaîne passée à `new RegExp`.** Corrigé en construisant les motifs
 *    depuis des chaînes… où « \s » ne vaut pas la classe d'espaces mais la
 *    lettre `s` : l'échappement est mangé avant que la regex existe.
 *    « termites\s*: » devenait « termitess*: », et BC2E ne rendait toujours
 *    rien.
 *
 * D'où la règle appliquée ici : **les motifs sont des LITTÉRAUX d'expression
 * régulière**, et l'apostrophe s'y écrit `['’]` à la main. Une couche
 * d'échappement de moins, une faute de moins.
 */

export interface ConstatationDiverse {
  /**
   * Le texte du rapport, entier. On cite, puis on explique — jamais l'inverse,
   * jamais tronqué. (`ODM_TERMES_CONFORMES`.)
   */
  terme: string;
  /**
   * Ce que le rapport en dit d'où : « Général », une liste de pièces, ou rien.
   *
   * Jamais deviné. L'ordre de mission (§ 10) exige que chaque constatation reste
   * reliée à sa localisation — et (§ 24) qu'on n'en invente aucune.
   */
  ou?: string;
  /**
   * Un CONSTAT, ou une LIMITE de l'examen.
   *
   * La rubrique mélange les deux, et l'ordre de mission les sépare : les constats
   * vont à « Constatations diverses » (§ 10), les limites à « Zones non
   * examinées / Limites de l'examen » (§ 14). Sur quarante rubriques lues,
   * dix-sept ne contiennent QUE des clauses de limite : les verser au même
   * endroit noierait les cinq constatations réelles.
   */
  nature: 'constat' | 'limite';
}

export interface LectureConstatations {
  /** La rubrique a-t-elle été trouvée ? */
  trouvee: boolean;
  /**
   * La rubrique existe et répond « Néant ».
   *
   * ⚠️ Ce n'est PAS « rubrique absente ». 48 volets LICIEL sur 120 répondent
   * ainsi. La différence est celle entre « le diagnostiqueur n'a rien constaté
   * d'autre » et « on ne sait pas s'il a regardé ».
   */
  neant: boolean;
  entrees: ConstatationDiverse[];
  /** L'éditeur dont la carte a servi — `null` si on s'est tu. */
  editeur: string | null;
}

const RIEN: LectureConstatations = { trouvee: false, neant: false, entrees: [], editeur: null };

/* ------------------------------------------------------------------ LICIEL */

/**
 * Le TITRE, jamais la lettre.
 *
 * Mesuré sur 40 volets : 32 portent « H », 7 portent « I », et les deux
 * rubriques « Constatations diverses » et « Moyens d'investigation »
 * **échangent leur lettre** d'une version du modèle à l'autre. S'ancrer sur
 * « H. » revient à lire les moyens d'investigation une fois sur trois.
 *
 * « Observations et constatations diverses » est l'en-tête de la TROISIÈME
 * COLONNE, à l'intérieur de la rubrique. Aplatie, elle commence par
 * « observations » : elle ne peut pas être prise pour le titre.
 */
const TITRE_LICIEL = /^[a-z]?[.\-–—]*constatationsdiverses:?$/;

/** Ce qui referme : le titre suivant, ou la note de bas de rubrique. */
const FIN_LICIEL =
  /^[a-z]?[.\-–—]*(?:moyensd'investigation|visa|identificationdes|conclusion|annexe)|^note\d*:|^nota\d*:/;

/** Les trois lignes d'en-tête des colonnes, à écarter. */
const ENTETE_COLONNES =
  /^listedesouvrages,?parties$|^d'ouvrages$|^localisationobservationsetconstatationsdiverses$|^observationsetconstatationsdiverses$|^localisation$/;

/**
 * ⚠️ L'habillage s'insère EN PLEIN TEXTE.
 *
 * Le pied de page traverse la rubrique aux sauts de page, et sa date se retrouve
 * entre deux mots d'une phrase : « … il a été observé des indices 29/04/2026
 * d'infestation … ». Une date seule sur sa ligne, dans cette rubrique, est de
 * l'habillage — jamais du contenu.
 */
const HABILLAGE_LICIEL =
  /^etatrelatifàlaprésencedetermitesn°|^sarl|^rcs:|^rapportdu:?$|^\d+\/\d+$|^n°siren|^\d{2}\/\d{2}\/\d{4}$|^tél\.?:/;

/**
 * La colonne « Localisation », qui s'insère au MILIEU d'une phrase.
 *
 * ```
 * Nous nous engageons, lors d'une autre visite, à compléter le
 * Général - diagnostic sur les zones ayant été rendues accessibles
 * ```
 *
 * Recoller sans la retirer donne « … à compléter le **Général -** diagnostic
 * sur les zones … ». On la retire du texte et on la garde à part.
 *
 * ⚠️ Seul « Général » est reconnu. Quand la localisation est une liste de pièces,
 * elle est elle-même coupée en trois morceaux entrelacés avec le texte, et
 * aucune règle de lignes ne la reconstitue. Dans ce cas `ou` reste **vide** :
 * mieux vaut ne pas donner la localisation que d'en inventer une (§ 24).
 */
const LOCALISATION_GENERALE = /^\s*G[ée]n[ée]ral\s*-?\s*/;

/**
 * Les clauses de limite, mot pour mot, telles que quarante lectures les rendent.
 *
 * Ce ne sont pas des constatations : ce sont les bornes de l'examen. L'ordre de
 * mission les envoie à l'écran « Zones non examinées » (§ 14). Elles reviennent
 * à l'identique d'un rapport à l'autre — dix-sept fois sur quarante, seules dans
 * la rubrique.
 */
const CLAUSES_DE_LIMITE: RegExp[] = [
  /Le diagnostic se limite aux zones rendues visibles et accessibles par le propri[ée]taire\.?/i,
  /Les zones situ[ée]es derri[èe]re les doublages des murs et plafonds n['’]ont pas [ée]t[ée] visit[ée]es par d[ée]faut d['’]acc[èe]s\.?/i,
  /Nous nous engageons,? lors d['’]une autre visite,? [àa] compl[ée]ter le diagnostic sur les zones ayant [ée]t[ée] rendues accessibles\.?/i,
  /A cause de l['’]absence de trappe,? un d[ée]sardoisage ou un d[ée]tuilage permettrait une inspection de la charpente non visible lors de la visite\.?/i,
  /Les faces arri[èe]res des doublages.*?stock de bois\.?/is
];

function lireLiciel(lignes: string[]): LectureConstatations {
  const plats = lignes.map(aplati);

  /*
   * Le sommaire porte le même intitulé. On garde la première occurrence dont la
   * zone contient réellement quelque chose.
   */
  for (let debut = 0; debut < lignes.length; debut++) {
    if (!TITRE_LICIEL.test(plats[debut] ?? '')) continue;

    const apres = plats.slice(debut + 1).findIndex((l) => FIN_LICIEL.test(l));
    const fin = apres < 0 ? Math.min(debut + 40, lignes.length) : debut + 1 + apres;

    const utiles = lignes
      .slice(debut + 1, fin)
      .filter((_ligne, i) => {
        const a = plats[debut + 1 + i] ?? '';
        return a !== '' && !ENTETE_COLONNES.test(a) && !HABILLAGE_LICIEL.test(a);
      });

    if (utiles.length === 0) continue;

    /* « Néant - - » : les deux tirets sont les colonnes vides. Elle RÉPOND. */
    const recolle = propre(utiles.join(' '));
    if (/^N[ée]ant(\s*[-–—]\s*)*$/i.test(recolle)) {
      return { trouvee: true, neant: true, entrees: [], editeur: 'LICIEL' };
    }

    /* On retire la localisation du texte, et on la retient. */
    let general = false;
    const texte = propre(
      utiles
        .map((l) => {
          if (LOCALISATION_GENERALE.test(l)) {
            general = true;
            return l.replace(LOCALISATION_GENERALE, ' ');
          }
          return l;
        })
        .join(' ')
    );

    return {
      trouvee: true,
      neant: false,
      entrees: decouperLiciel(texte, general ? 'Général' : undefined),
      editeur: 'LICIEL'
    };
  }

  return RIEN;
}

/**
 * Séparer les clauses de limite des constatations réelles.
 *
 * On extrait d'abord les clauses connues — elles reviennent mot pour mot — puis
 * ce qui reste est du constat. Le reste n'est jamais jeté : s'il n'est pas
 * reconnu, il est rendu tel quel, en un bloc. **Rien ne se perd** (§ 30).
 */
function decouperLiciel(texte: string, ou?: string): ConstatationDiverse[] {
  const entrees: ConstatationDiverse[] = [];
  let reste = texte;

  for (const clause of CLAUSES_DE_LIMITE) {
    const m = clause.exec(reste);
    if (!m?.[0]) continue;
    entrees.push({ terme: propre(m[0]), nature: 'limite', ...(ou ? { ou } : {}) });
    reste = reste.replace(clause, ' ');
  }

  const constat = propre(reste);
  if (constat && constat.length > 3) {
    entrees.push({ terme: constat, nature: 'constat', ...(ou ? { ou } : {}) });
  }

  return entrees;
}

/* -------------------------------------------------------------------- BC2E */

/**
 * ⚠️ Mesuré sur UN SEUL volet.
 *
 * Le corpus n'en contient qu'un sur 250. Cette carte est donc la forme de ce
 * rapport-là, pas celle de BC2E — et elle sera à reprendre dès qu'un deuxième
 * apparaîtra. C'est écrit ici pour qu'on ne l'oublie pas.
 *
 * Sa structure, elle, est franche : des sous-libellés nommés, chacun suivi de sa
 * réponse.
 *
 * ```
 * I. CONSTATATIONS DIVERSES :
 * Indices d'infestation par des agents de dégradation biologique du bois autres
 * que des termites :
 * Des indices d'infestation ont été repérés. Ils ne sont pas causés par des
 * termites. […]
 * NOTE 1 : Si le donneur d'ordre le souhaite […]
 * Observations : Néant
 * Indices d'infestation par des termites aux abords de l'immeuble examiné :
 * Néant
 * ```
 *
 * Et la rubrique ne s'arrête pas là : **J. OBSERVATIONS**, **K. INFORMATIONS**
 * et **L. ECARTS / ADJONCTIONS** suivent, que l'ordre de mission (§ 10) vise
 * aussi. Elles sont lues ici.
 */
const TITRE_BC2E = /^[a-z]?[.\-–—]*constatationsdiverses:?$/;
const SUITE_BC2E = /^[a-z]?[.\-–—]*(?:observations?:?|informations?:?|ecarts?\/?adjonctions)/;
const FIN_BC2E = /^cachetdel'entreprise|^r[ée]servedepropri[ée]t[ée]|^note5:/;

/** Les sous-libellés de BC2E : un intitulé, puis sa réponse. */
const SOUS_LIBELLES: { motif: RegExp; nature: 'constat' | 'limite' }[] = [
  {
    motif: /Indices d['’]infestation par des agents de d[ée]gradation biologique du bois autres que des termites\s*:/i,
    nature: 'constat'
  },
  {
    motif: /Indices d['’]infestation par des termites aux abords de l['’]immeuble examin[ée]\s*:/i,
    nature: 'constat'
  },
  { motif: /^\s*Observations\s*:/i, nature: 'constat' }
];

/** Le texte-type que BC2E imprime dans tous les cas : ce n'est pas un constat. */
const RAPPEL_BC2E =
  /Les indices d['’]infestation des autres agents de d[ée]gradation biologique du bois sont not[ée]s de mani[èe]re g[ée]n[ée]rale.*?ces autres agents\.?/is;
const NOTE_BC2E = /NOTE \d+\s*:.*?(?=$)/is;

function lireBc2e(lignes: string[]): LectureConstatations {
  const plats = lignes.map(aplati);
  const debut = plats.findIndex((l) => TITRE_BC2E.test(l));
  if (debut < 0) return RIEN;

  const apres = plats.slice(debut + 1).findIndex((l) => FIN_BC2E.test(l));
  const fin = apres < 0 ? lignes.length : debut + 1 + apres;

  /* De « I. CONSTATATIONS DIVERSES » jusqu'au cachet : les quatre rubriques. */
  const zone = lignes.slice(debut + 1, fin);
  const entrees: ConstatationDiverse[] = [];

  /* Chaque sous-libellé, et ce qui le suit jusqu'au prochain. */
  const bornes: { i: number; nature: 'constat' | 'limite'; libelle: string }[] = [];
  const vues = new Set<number>();
  zone.forEach((l, i) => {
    if (vues.has(i)) return;
    for (const sous of SOUS_LIBELLES) {
      if (sous.motif.test(l)) {
        bornes.push({ i, nature: sous.nature, libelle: propre(l) });
        vues.add(i);
        return;
      }
    }
    /* « J. OBSERVATIONS », « K. INFORMATIONS », « L. ECARTS » : l'ordre de
       mission (§ 10) les vise comme la rubrique elle-même. */
    if (SUITE_BC2E.test(aplati(l))) {
      bornes.push({ i, nature: 'constat', libelle: propre(l) });
      vues.add(i);
    }
  });

  for (let b = 0; b < bornes.length; b++) {
    const ici = bornes[b];
    if (!ici) continue;
    const finBloc = bornes[b + 1]?.i ?? zone.length;
    let texte = propre(zone.slice(ici.i, finBloc).join(' '));
    texte = propre(texte.replace(RAPPEL_BC2E, ' ').replace(NOTE_BC2E, ' '));
    if (!texte || /^[^:]*:\s*$/.test(texte)) continue;
    entrees.push({ terme: texte, nature: ici.nature });
  }

  const rienDeSubstantiel = entrees.every((e) => /:\s*N[ée]ant\.?$/i.test(e.terme));
  return {
    trouvee: true,
    neant: entrees.length > 0 && rienDeSubstantiel,
    entrees: rienDeSubstantiel ? [] : entrees,
    editeur: 'BC2E'
  };
}

/* ------------------------------------------------------------------ aiguillage */

/**
 * Lire les constatations diverses — avec la carte de CET éditeur.
 *
 * ⚠️ **Éditeur non reconnu : on se tait.** C'est la règle de sûreté de
 * `ODM_LECTEURS_PAR_EDITEUR` : on garde sur une signature POSITIVE, jamais sur
 * l'absence d'un signe. Onze volets sur 250 n'ont aucun éditeur nommé ; leurs
 * titres RESSEMBLENT à ceux de LICIEL, et se ressembler n'est pas être.
 *
 * Un `trouvee: false` sur éditeur inconnu ne veut pas dire « pas de
 * constatations » : il veut dire « on n'a pas su lire ». C'est à l'affichage de
 * ne pas confondre les deux (§ 15, § 24).
 */
export function constatationsDiverses(
  lignes: string[],
  editeur: string | null | undefined
): LectureConstatations {
  if (editeur === 'LICIEL') return lireLiciel(lignes);
  if (editeur === 'BC2E') return lireBc2e(lignes);
  return RIEN;
}
