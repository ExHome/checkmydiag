/**
 * La fiche technique du logement — l'endroit où le DPE dit *pourquoi*.
 *
 * ── Ce que c'est ────────────────────────────────────────────────────────────
 *
 * En annexe de chaque DPE, un tableau à trois colonnes liste toutes les
 * caractéristiques saisies par le diagnostiqueur :
 *
 *     Donnée d'entrée          Origine de la donnée   Valeur renseignée
 *     Surface du mur           Observé / mesuré       23,63 m²
 *     Matériau mur             Observé / mesuré       Mur en béton banché
 *     Isolation                Observé / mesuré       non
 *     Umur0 (paroi inconnue)   Valeur par défaut      2,5 W/m².K
 *
 * C'est la description du bâtiment, paroi par paroi, fenêtre par fenêtre,
 * générateur par générateur — et **elle est en texte**. Le corps du DPE, lui,
 * résume : « Murs : béton banché non isolé ». L'annexe distingue les sept murs.
 *
 * Mesuré sur vingt-trois volets DPE LICIEL : les vingt-trois la portent, et
 * aucun chiffre du produit n'en venait. On lisait le résumé en ignorant la
 * source.
 *
 * ── Pourquoi la colonne du milieu vaut autant que la troisième ──────────────
 *
 * « Origine de la donnée » dit si le diagnostiqueur a **constaté** ou s'il a
 * laissé le logiciel **supposer** : « Observé / mesuré », « Valeur par
 * défaut », « Donnée en ligne », « Estimé ». Les vingt-trois volets contiennent
 * au moins une valeur par défaut, et jusqu'à vingt-neuf.
 *
 * C'est la distinction que l'ordre de mission impose partout — trouvé /
 * partiellement déterminable / absent — écrite par le rapport lui-même. Une
 * année d'isolation « par défaut » n'est pas une année d'isolation : c'est
 * l'aveu qu'on ne la connaît pas.
 *
 * ── La grammaire du tableau, et ses deux pièges ─────────────────────────────
 *
 * Le PDF n'a pas de cellules : l'extraction rend des lignes. Trois formes,
 * toutes rencontrées dans le corpus :
 *
 *  1. tout tient sur une ligne — « Isolation Observé / mesuré non » ;
 *  2. le **libellé** est trop long et s'enroule *autour* de sa valeur :
 *
 *         Année de
 *         Valeur par défaut 1989 - 2000
 *         construction/rénovation
 *
 *  3. la **valeur** est trop longue et s'enroule autour de son libellé :
 *
 *         Electrique - Radiateur électrique à fluide caloporteur (modélisé
 *         Type générateur Observé / mesuré
 *         comme un radiateur NFC, NF** et NF***)
 *
 * Une ligne qui *commence* par une origine a donc son libellé coupé en deux ;
 * une ligne qui *finit* par une origine a sa valeur coupée en deux. Dans les
 * deux cas, la ligne d'avant et la ligne d'après lui appartiennent.
 *
 * ── Comment on retrouve les groupes ─────────────────────────────────────────
 *
 * « Mur 3 Sud », « Fenêtre 2 Sud », « Chauffage 1 » sont des cellules fusionnées
 * qui couvrent plusieurs rangées. L'extraction les pose sur **une** rangée du
 * bloc, et pas toujours la première : parfois seule sur sa ligne, parfois collée
 * devant un libellé, parfois devant une ligne enroulée.
 *
 * On ne segmente donc pas sur le marqueur, qui tombe n'importe où. On segmente
 * sur une propriété du tableau : **un bloc recommence quand un libellé déjà vu
 * réapparaît**. Sept murs, c'est sept fois « Surface du mur ». Le marqueur, où
 * qu'il tombe, nomme ensuite le bloc qui le contient.
 *
 * ── Portée mesurée ──────────────────────────────────────────────────────────
 *
 * Ce lecteur est établi sur LICIEL, seul éditeur du corpus dont le DPE soit en
 * texte : les DPE BC2E rencontrés sont imprimés en image. La fiche technique est
 * une pièce réglementaire, donc présente chez tous les éditeurs — mais sa mise
 * en page chez les autres n'est **pas mesurée**, et un trou se déclare au lieu
 * de se combler. Voir `docs/REPERES-PAR-EDITEUR.md`.
 */

/** Ce que la colonne du milieu peut valoir, tel que le tableau l'écrit. */
export type OrigineDonnee = 'observé' | 'défaut' | 'en ligne' | 'estimé';

/** Une valeur du rapport, avec la façon dont elle a été obtenue. */
export interface Donnee {
  valeur: string;
  origine: OrigineDonnee;
}

export interface ChampFiche {
  /** « Généralités », « Enveloppe », « Systèmes ». */
  section: string;
  /** « Mur 3 Sud », « Fenêtre 2 Sud », « Chauffage 1 » — `null` hors groupe. */
  groupe: string | null;
  libelle: string;
  origine: OrigineDonnee;
  valeur: string;
}

/**
 * Ce qu'un bloc décrit, déduit de ses libellés et non de son nom.
 *
 * La cellule fusionnée qui nomme l'objet — « Mur 4 Ouest » — manque parfois à
 * l'extraction : six murs du corpus n'en ont aucune. Ils n'en restent pas moins
 * des murs, et l'ordre de mission interdit qu'une paroi disparaisse. Le genre
 * se lit donc dans les libellés, qui sont les mots du rapport, et le nom ne fait
 * que le confirmer.
 */
export type GenreBloc =
  | 'mur'
  | 'baie'
  | 'porte'
  | 'plancherBas'
  | 'plancherHaut'
  | 'pontThermique'
  | 'ventilation'
  | 'chauffage'
  | 'eauChaude'
  | 'climatisation';

/** Un objet du bâtiment : une paroi, une baie, un générateur. */
export interface BlocFiche {
  section: string;
  groupe: string | null;
  /** `null` quand aucun libellé connu ne le désigne : on le dit, on ne suppose pas. */
  genre: GenreBloc | null;
  champs: ChampFiche[];
}

export interface FicheTechnique {
  /** Faux quand le rapport ne porte pas la fiche : on le dit, on ne suppose pas. */
  presente: boolean;
  blocs: BlocFiche[];
  champs: ChampFiche[];
}

/**
 * Les quatre origines, dans l'orthographe du corpus.
 *
 * L'extraction insère parfois des espaces autour des apostrophes et des
 * accents ; on tolère les espaces mais pas autre chose, pour ne pas attraper
 * une phrase du corps du rapport qui parlerait de « valeurs par défaut ».
 */
const ORIGINES: [RegExp, OrigineDonnee][] = [
  [/Observ[ée]\s*\/\s*mesur[ée]/i, 'observé'],
  [/Valeur\s+par\s+d[ée]faut/i, 'défaut'],
  [/Donn[ée]e\s+en\s+ligne/i, 'en ligne'],
  [/Estim[ée]e?/i, 'estimé']
];

const TOUTES_ORIGINES =
  /(Observ[ée]\s*\/\s*mesur[ée]|Valeur\s+par\s+d[ée]faut|Donn[ée]e\s+en\s+ligne|Estim[ée]e?)/i;

/** L'en-tête de colonnes, qui annonce le tableau et marque donc sa rubrique. */
const ENTETE_COLONNES =
  /Donn[ée]e\s*[’'´`]?\s*d?\s*[’'´`]?\s*entr[ée]e.*Origine\s+de\s+la\s+donn[ée]e.*Valeur\s+renseign[ée]e/i;

/** Le titre de la fiche, tel qu'il est imprimé. */
const TITRE_FICHE = /^Fiche\s+technique\s+du\s+logement/i;

/**
 * Les noms d'objets qui peuvent porter une cellule fusionnée.
 *
 * Cette liste ne segmente rien : elle ne fait que **reconnaître** un marqueur.
 * Un objet d'un genre encore inconnu ne casse donc pas la lecture — son bloc
 * existe quand même, simplement sans nom. C'est la règle : un manque se
 * déclare, il ne s'invente pas.
 *
 * Un mur peut regarder de plusieurs côtés à la fois : le corpus écrit « Mur 5
 * Nord, Est, Ouest ». La liste d'orientations fait donc partie du nom, sans
 * quoi ce mur-là perdait son identité — vingt-sept blocs anonymes sur
 * vingt-six volets.
 */
const ORIENTATION = '(?:Nord|Sud|Est|Ouest)(?:[-\\s](?:Est|Ouest))?';
const MARQUEUR_GROUPE = new RegExp(
  '^((?:Mur|Fen[êe]tre|Porte-fen[êe]tre|Baie|Porte|Plancher|Plafond|Toiture|Combles|' +
    'V[ée]randa|Pont\\s+Thermique|Chauffage|Ventilation|Climatisation|Refroidissement|' +
    'Eau\\s+chaude\\s+sanitaire|ECS)' +
    `(?:\\s+\\d+)?(?:\\s+${ORIENTATION}(?:\\s*,\\s*${ORIENTATION})*)?)(?=\\s|$)`,
  'i'
);

/** Un marqueur qui porte un numéro ou une orientation ne peut pas être autre chose. */
const MARQUEUR_QUALIFIE = new RegExp(`(?:\\d|${ORIENTATION}$)`, 'i');

/**
 * Le libellé qui désigne le genre d'un bloc, relevé sur le corpus.
 *
 * L'ordre compte : un bloc de chauffage porte « Type générateur », un bloc
 * d'eau chaude aussi. Ce qui les sépare est le poste — « Type émetteur » et
 * « Equipement intermittence » d'un côté, « Volume de stockage » et « Type de
 * production » de l'autre. On teste donc le plus spécifique d'abord.
 */
/*
 * ⚠️ L'apostrophe s'écrit de deux façons.
 *
 * L'extraction rend tantôt l'apostrophe droite, tantôt la typographique, selon
 * la police du rapport. Un motif qui n'accepte qu'une des deux rate la rangée :
 * ici, il ratait la frontière entre deux générateurs de chauffage, et les deux
 * se retrouvaient mêlés dans un seul bloc. Toute règle portant sur un libellé
 * à apostrophe accepte donc les deux formes.
 */
const GENRES: [GenreBloc, RegExp][] = [
  ['pontThermique', /^(Type PT|Type de pont thermique|Longueur du PT)$/i],
  ['baie', /^Surface de baies$/i],
  ['porte', /^(Surface de porte|Type de porte)$/i],
  ['plancherBas', /^(Surface de plancher bas|Type de pb)$/i],
  ['plancherHaut', /^(Surface de plancher haut|Type de ph)$/i],
  ['mur', /^(Surface du mur|Mat[ée]riau mur|Epaisseur mur)$/i],
  ['ventilation', /^Type de ventilation$/i],
  ['climatisation', /^Type de climatisation$|refroidissement/i],
  ['eauChaude', /^(Volume de stockage|Type de production|Type de distribution)$/i],
  [
    'chauffage',
    /^(Type d[’'´`]installation de chauffage|Type [ée]metteur|Equipement intermittence|Type de chauffage)$/i
  ]
];

/**
 * Le genre que ce libellé désigne à lui seul, ou `null`.
 *
 * Beaucoup de libellés sont communs à tous les objets — « Type d'adjacence »,
 * « Isolation », « Energie utilisée ». Ceux-là ne disent rien du genre et
 * restent dans le bloc courant. Seuls les libellés propres à un objet tranchent,
 * et **c'est eux qui délimitent les blocs** : sans cette frontière, le plafond
 * emportait la première fenêtre et la porte un pont thermique, parce qu'aucun
 * libellé ne s'y répétait.
 */
function genreDuLibelle(libelle: string): GenreBloc | null {
  for (const [genre, motif] of GENRES) if (motif.test(libelle)) return genre;
  return null;
}

/** Pieds de page et fils d'Ariane : ils traversent le tableau sans en faire partie. */
const BRUIT = /Page\s+\d+\s*\/\s*\d+\s*$|^\s*$|^\s*[│|]\s*$/;

/**
 * Le nom d'objet quand il occupe une ligne à lui seul.
 *
 * Il est toujours capitalisé dans ce tableau, ce qui le distingue de la seconde
 * moitié d'un libellé enroulé — « chauffage », en minuscule.
 */
function marqueurSeul(ligne: string | undefined): string | null {
  if (!ligne || !/^[A-ZÀ-ÖØ-Þ]/.test(ligne)) return null;
  const m = ligne.match(MARQUEUR_GROUPE);
  return m && propre(m[1] as string).length === ligne.length ? propre(m[1] as string) : null;
}

/**
 * Détache un nom d'objet en tête d'une ligne de continuation.
 *
 * « Mur 4 Ouest inconnu » : la cellule fusionnée s'imprime devant la seconde
 * moitié d'une valeur. On n'ose ce découpage que sur un nom **qualifié** — muni
 * d'un numéro ou d'une orientation. « Mur en pierre de taille… » commence aussi
 * par « Mur » et n'est qu'une valeur.
 */
function detacher(ligne: string): { nom: string | null; reste: string } {
  const m = ligne.match(MARQUEUR_GROUPE);
  if (!m || !/^[A-ZÀ-ÖØ-Þ]/.test(ligne)) return { nom: null, reste: ligne };
  const nom = propre(m[1] as string);
  if (!MARQUEUR_QUALIFIE.test(nom)) return { nom: null, reste: ligne };
  return { nom, reste: ligne.slice((m[1] as string).length).trim() };
}

function origineDe(texte: string): OrigineDonnee | null {
  for (const [motif, nom] of ORIGINES) if (motif.test(texte)) return nom;
  return null;
}

function propre(texte: string): string {
  return texte.replace(/\s+/g, ' ').trim();
}

/**
 * Le titre de rubrique : une ligne courte, sans origine, juste avant l'en-tête
 * de colonnes. C'est le rapport qui nomme ses rubriques, pas nous.
 */
function rubriques(lignes: string[]): Map<number, string> {
  const noms = new Map<number, string>();
  for (let i = 0; i < lignes.length; i++) {
    if (!ENTETE_COLONNES.test(lignes[i] ?? '')) continue;
    for (let j = i - 1; j >= 0 && j >= i - 3; j--) {
      const candidat = propre(lignes[j] ?? '');
      if (!candidat || TOUTES_ORIGINES.test(candidat) || candidat.length > 40) continue;
      noms.set(i, candidat);
      break;
    }
  }
  return noms;
}

export function lireFicheTechnique(lignesBrutes: string[]): FicheTechnique {
  const debut = lignesBrutes.findIndex((l) => TITRE_FICHE.test(propre(l)));
  if (debut < 0) return { presente: false, blocs: [], champs: [] };

  const lignes = lignesBrutes
    .slice(debut)
    .map(propre)
    .filter((l) => l && !BRUIT.test(l));

  const noms = rubriques(lignes);
  const champs: ChampFiche[] = [];
  const blocs: BlocFiche[] = [];

  let section = '';
  let bloc: BlocFiche | null = null;
  let vus = new Set<string>();
  /** Consommées par une ligne enroulée : elles ne se relisent pas. */
  const prises = new Set<number>();

  /* Rendre le bloc plutôt que l'affecter : le typage suit ainsi le fil réel. */
  const nouveauBloc = (groupe: string | null): BlocFiche => {
    const neuf: BlocFiche = { section, groupe, genre: null, champs: [] };
    blocs.push(neuf);
    vus = new Set();
    return neuf;
  };

  for (let i = 0; i < lignes.length; i++) {
    if (prises.has(i)) continue;
    const brute = lignes[i] as string;

    if (noms.has(i)) {
      section = noms.get(i) as string;
      bloc = null;
      vus = new Set();
      continue;
    }

    /*
     * Le marqueur se détache AVANT toute autre lecture.
     *
     * Il précède aussi bien un libellé ordinaire — « Fenêtre 3 Est Epaisseur
     * lame air Observé / mesuré 20 mm » — qu'une rangée dont le libellé est
     * enroulé : « Plancher 2 Observé / mesuré 51,912 m² ». Le lire en dernier
     * prenait « Plancher 2 » pour le libellé et perdait les deux à la fois.
     */
    let ligne = brute;
    let groupeIci: string | null = null;
    const colle = brute.match(MARQUEUR_GROUPE);
    if (colle) {
      const nom = propre(colle[1] as string);
      const reste = brute.slice((colle[1] as string).length).trim();
      /*
       * Dans ce tableau, un nom d'objet est capitalisé. « chauffage » en
       * minuscule n'est pas un générateur : c'est la seconde moitié du libellé
       * « Type d'installation de / chauffage », enroulé autour de sa valeur.
       */
      if (!reste && !/^[A-ZÀ-ÖØ-Þ]/.test(nom)) continue;
      if (!reste) {
        if (!bloc || bloc.groupe) bloc = nouveauBloc(nom);
        else bloc.groupe = nom;
        continue;
      }
      /*
       * Un nom nu — « Mur », « Porte » — ouvre aussi des valeurs entières :
       * « Mur en pierre de taille et moellons constitué d'un seul matériau ».
       * On ne le détache que s'il porte un numéro ou une orientation, ou si la
       * suite commence par une majuscule : dans ce tableau, les libellés sont
       * capitalisés et les valeurs de ce genre ne le sont pas.
       */
      if (
        (MARQUEUR_QUALIFIE.test(nom) || /^[A-ZÀ-ÖØ-Þ]/.test(reste)) &&
        TOUTES_ORIGINES.test(reste)
      ) {
        groupeIci = nom;
        ligne = reste;
      }
    }

    const m = ligne.match(TOUTES_ORIGINES);
    if (!m || m.index === undefined) continue;

    const origine = origineDe(m[0]) as OrigineDonnee;
    let avant = ligne.slice(0, m.index).trim();
    let apres = ligne.slice(m.index + m[0].length).trim();

    /* Libellé enroulé : la ligne commence par l'origine. */
    if (!avant) {
      const precedente = i > 0 && !prises.has(i - 1) ? (lignes[i - 1] as string) : '';

      if (precedente && !TOUTES_ORIGINES.test(precedente)) {
        avant = precedente;
        prises.add(i - 1);
        /*
         * La suite du libellé n'existe que si elle ne porte pas d'origine, et
         * le nom de l'objet peut s'être glissé entre les deux moitiés : la
         * cellule fusionnée tombe sur une rangée visuelle, sans égard pour les
         * cellules que cette rangée coupe en deux.
         */
        let j = i + 1;
        const intercale = marqueurSeul(lignes[j]);
        if (intercale) {
          groupeIci = groupeIci ?? intercale;
          prises.add(j);
          j += 1;
        }
        const brutSuite = lignes[j] ?? '';
        if (brutSuite && !TOUTES_ORIGINES.test(brutSuite)) {
          const { nom, reste } = detacher(brutSuite);
          if (nom) groupeIci = groupeIci ?? nom;
          if (nom || reste) prises.add(j);
          if (reste) avant = `${avant} ${reste}`;
        }
      }
    } else if (!apres) {
      /* Valeur enroulée : la ligne finit par l'origine. */
      const precedente = i > 0 && !prises.has(i - 1) ? (lignes[i - 1] as string) : '';

      if (precedente && !TOUTES_ORIGINES.test(precedente)) {
        apres = precedente;
        prises.add(i - 1);
      }
      /*
       * « Mur en pierre de taille … / Matériau mur Observé / mesuré / Mur 4
       * Nord / inconnu » : le nom du mur s'imprime au milieu de sa propre
       * valeur. Sans ce saut, le marqueur partait dans la valeur et le mur
       * perdait son nom — douze murs anonymes sur le corpus.
       */
      let j = i + 1;
      const intercale = marqueurSeul(lignes[j]);
      if (intercale) {
        groupeIci = groupeIci ?? intercale;
        prises.add(j);
        j += 1;
      }
      const brutSuite = lignes[j] ?? '';
      if (brutSuite && !TOUTES_ORIGINES.test(brutSuite)) {
        const { nom, reste } = detacher(brutSuite);
        if (nom) groupeIci = groupeIci ?? nom;
        if (nom || reste) prises.add(j);
        if (reste) apres = apres ? `${apres} ${reste}` : reste;
      }
    }

    const libelle = propre(avant);
    if (!libelle) continue;

    /*
     * Le bloc suivant s'ouvre sur deux signaux : un libellé déjà vu — sept murs,
     * c'est sept fois « Surface du mur » — ou un marqueur qui ne porte pas le nom
     * du bloc courant. Sans ce second signal, « Plancher 1 Surface de plancher
     * bas » venait grossir le bloc du dernier mur, et le plancher disparaissait.
     */
    const changeDeGroupe = Boolean(groupeIci && bloc && bloc.groupe && bloc.groupe !== groupeIci);
    const genreIci = genreDuLibelle(libelle);
    const changeDeGenre = Boolean(genreIci && bloc && bloc.genre && bloc.genre !== genreIci);
    if (!bloc || vus.has(libelle.toLowerCase()) || changeDeGenre || changeDeGroupe) {
      bloc = nouveauBloc(groupeIci);
    } else if (groupeIci && !bloc.groupe) bloc.groupe = groupeIci;
    if (genreIci && !bloc.genre) bloc.genre = genreIci;

    vus.add(libelle.toLowerCase());
    const champ: ChampFiche = {
      section,
      groupe: bloc.groupe,
      libelle,
      origine,
      valeur: propre(apres)
    };
    bloc.champs.push(champ);
    champs.push(champ);
  }

  /*
   * Le nom du groupe se découvre parfois après ses premiers champs — la cellule
   * fusionnée tombe où elle veut. On le recopie sur tout le bloc à la fin.
   */
  for (const b of blocs) for (const c of b.champs) c.groupe = b.groupe;

  return { presente: true, blocs, champs };
}

/** Le champ nommé dans un bloc donné, ou `null` — jamais une valeur par défaut inventée. */
export function champ(
  fiche: FicheTechnique,
  groupe: string | null,
  libelle: RegExp
): ChampFiche | null {
  return (
    fiche.champs.find(
      (c) => (groupe === null || c.groupe === groupe) && libelle.test(c.libelle)
    ) ?? null
  );
}

/**
 * Tous les objets d'un genre — « les murs », « les baies ».
 *
 * On interroge le genre, jamais le nom : une paroi que le rapport n'a pas
 * nommée compte autant que les autres.
 */
export function blocs(fiche: FicheTechnique, genre: GenreBloc): BlocFiche[] {
  return fiche.blocs.filter((b) => b.genre === genre);
}
