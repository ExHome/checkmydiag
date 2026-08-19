/**
 * Les recommandations de travaux, telles que le DPE les écrit.
 *
 * C'est la couche A de l'ordre de mission RECO DPE : **ce que dit le DPE**,
 * restitué fidèlement, avant toute lecture de notre part. Poste concerné,
 * description, coût lorsqu'il figure, performance visée lorsqu'elle figure.
 *
 * ── Pourquoi elle manquait ─────────────────────────────────────────────────
 *
 * Le moteur évitait délibérément cette page : elle chiffre des GAINS après
 * travaux (« - 476 kWhEP/m²/an ») dans le même format que la consommation
 * actuelle, et un nombre ramassé au hasard aurait donné un verdict faux. Il
 * l'écartait donc en bloc — et perdait du même coup les recommandations.
 *
 * Mesuré sur 95 DPE du corpus : 95 % portent un montant estimé, 96 % une
 * performance recommandée, 82 % la rubrique nommée en toutes lettres.
 *
 * ── Ce qui est interdit ici ────────────────────────────────────────────────
 *
 * L'ODM RECO est explicite : pas de garantie de classe future, pas d'économies
 * promises, pas de retour sur investissement, et **jamais d'addition mécanique
 * de gains de travaux indépendants**. Ce fichier ne calcule rien : il lit. Tout
 * ce qui en sort porte le statut `RAPPORT` et se cite « indiqué dans le DPE ».
 */

/** D'où vient une valeur. L'ODM impose de ne jamais confondre les quatre. */
export type Statut = 'RAPPORT' | 'CALCUL VERRIERE' | 'ESTIMATION' | 'INCONNU';

export interface Recommandation {
  /** Le poste, tel que le DPE le nomme : Murs, Chauffage, Ventilation… */
  lot: string;
  /** Ce que le rapport écrit, sans reformulation. */
  description: string;
  /** La performance visée, quand le rapport la donne : « R > 4,5 m².K/W ». */
  performance?: string;
  statut: Statut;
}

export interface PackTravaux {
  /** 1 = les travaux essentiels, 2 = ceux à envisager ensuite. */
  rang: 1 | 2;
  intitule: string;
  /** Fourchette en euros, telle qu'écrite. Jamais recalculée, jamais cumulée. */
  cout?: { de: number; a: number; statut: Statut };
  recommandations: Recommandation[];
}

/*
 * Les postes que le DPE emploie, tels qu'ils sortent du corpus.
 *
 * Relevés seuls sur leur ligne, par fréquence décroissante : chauffage 75,
 * portes et fenêtres 62, murs 46, toiture 42, ventilation 29, eau chaude 27,
 * plancher bas 23. La casse varie — « Mur » et « chauffage » apparaissent — et
 * le motif en tient compte.
 */
const LOTS = [
  'Murs',
  'Mur',
  'Plancher bas',
  'Plancher',
  'Toiture/plafond',
  'Toiture',
  'Portes et fenêtres',
  'Fenêtres',
  'Chauffage',
  'Eau chaude sanitaire',
  'Ventilation',
  'Régulation'
];

const MOTIF_LOT = new RegExp(`^\\s*(${LOTS.join('|')})\\s*$`, 'i');

/** La performance visée : les quatre grandeurs que le DPE emploie. */
const MOTIF_PERFORMANCE =
  /((?:R|Uw|Ug|SCOP|COP|ETAS|Sw)\s*[=><≥≤]\s*[\d.,]+(?:\s*[^\s,;]*)?(?:\s*,\s*Sw\s*=\s*[\d.,]+)?)/;

/**
 * Le montant d'un pack, tel qu'il est écrit.
 *
 * « Montant estimé : 4600 à 6800€ ». Le mot « estimé » est du rapport, pas de
 * nous : c'est pourquoi le statut reste `RAPPORT`. Une estimation citée n'est
 * pas une estimation produite.
 */
function coutDe(lignes: string[]): PackTravaux['cout'] {
  for (const l of lignes) {
    const m = l.match(/Montant estim[ée]\s*:?\s*([\d\s]+)\s*[àa]\s*([\d\s]+)\s*€/i);
    if (!m?.[1] || !m[2]) continue;
    const de = Number(m[1].replace(/\s/g, ''));
    const a = Number(m[2].replace(/\s/g, ''));
    if (Number.isFinite(de) && Number.isFinite(a)) return { de, a, statut: 'RAPPORT' };
  }
  return undefined;
}

/**
 * Les recommandations d'un bloc de pack.
 *
 * Le tableau sort entrelacé : le nom du lot s'intercale au milieu de sa propre
 * description, parce que la cellule de gauche est verticalement centrée. On
 * s'ancre donc sur le LOT — seul sur sa ligne, ou en tête de ligne — puis on
 * ramasse autour de lui les phrases et la performance.
 */
function recommandationsDe(lignes: string[]): Recommandation[] {
  const trouvees: Recommandation[] = [];
  let lotCourant: string | null = null;
  let phrases: string[] = [];
  let performance: string | undefined;
  /*
   * Les phrases lues AVANT que le poste se nomme.
   *
   * « Isolation des murs par l'extérieur. » précède de deux lignes le mot
   * « Mur », parce que la cellule de gauche est centrée sur une description de
   * quatre lignes. Sans ce tampon, la première phrase de chaque recommandation
   * — celle qui dit ce qu'il faut faire — se perdait.
   */
  let orphelines: string[] = [];

  const clore = () => {
    if (!lotCourant) return;
    const description = [...orphelines, ...phrases].join(' ').replace(/\s{2,}/g, ' ').trim();
    orphelines = [];
    if (description) {
      trouvees.push({
        lot: lotCourant,
        description,
        ...(performance ? { performance } : {}),
        statut: 'RAPPORT'
      });
    }
    phrases = [];
    performance = undefined;
  };

  for (const brut of lignes) {
    const l = brut.trim();
    if (!l) continue;
    /*
     * Les mentions de pied de tableau ne sont pas des recommandations.
     *
     * Le montant en fait partie : il est déjà lu par `coutDe` et rendu à part.
     * Sans cette ligne, il ouvrait la description de la première recommandation
     * — « Montant estimé : 4600 à 6800€ Isolation des combles… » — et le lecteur
     * voyait la somme deux fois, dont une au milieu d'une phrase.
     */
    if (
      /^Travaux pouvant n[ée]cessiter|^Commentaires\s*:|^Lot\s+Description|^Montant estim[ée]/i.test(
        l
      )
    )
      continue;

    const seul = l.match(MOTIF_LOT);
    if (seul?.[1]) {
      clore();
      lotCourant = seul[1];
      continue;
    }

    const perf = l.match(MOTIF_PERFORMANCE);
    if (perf?.[1]) performance = perf[1].trim();

    /* Le lot peut ouvrir la ligne, suivi de sa description : « Mur l'extérieur
       avec des retours d'isolants… ». On le détache alors du texte. */
    const enTete = l.match(new RegExp(`^(${LOTS.join('|')})\\s+(.{6,})$`, 'i'));
    if (enTete?.[1] && !lotCourant) {
      lotCourant = enTete[1];
      phrases.push((enTete[2] ?? '').replace(MOTIF_PERFORMANCE, '').trim());
      continue;
    }

    const sansPerf = l.replace(MOTIF_PERFORMANCE, '').trim();
    if (!sansPerf) continue;
    if (lotCourant) phrases.push(sansPerf);
    else orphelines.push(sansPerf);
  }
  clore();
  return trouvees;
}

/**
 * Les deux packs du DPE, dans l'ordre où il les propose.
 *
 * « Le pack ❶ vous permet de réaliser les travaux prioritaires, et le pack ❷
 * d'aller vers un logement très performant. » Ce sont les mots du rapport : la
 * priorité vient de lui, pas de nous.
 */
export function travauxDuDpe(lignes: string[]): PackTravaux[] {
  const debut = lignes.findIndex((l) =>
    /Recommandations d['’]am[ée]lioration de la performance/i.test(l)
  );
  if (debut < 0) return [];

  /* La rubrique s'arrête au bloc suivant : évolution après travaux, ou la page
     des scénarios chiffrés — qui, elle, décrit un logement qui n'existe pas. */
  let fin = lignes.length;
  for (let i = debut + 1; i < lignes.length; i++) {
    if (/[ÉE]volution de la performance apr[èe]s travaux|Pr[ée]parez votre projet/i.test(lignes[i] ?? '')) {
      fin = i;
      break;
    }
  }

  const corps = lignes.slice(debut + 1, fin);
  const packs: PackTravaux[] = [];
  const bornes: { rang: 1 | 2; intitule: string; i: number }[] = [];
  corps.forEach((l, i) => {
    if (/^\s*Les travaux essentiels/i.test(l)) bornes.push({ rang: 1, intitule: 'Les travaux essentiels', i });
    if (/^\s*Les travaux [àa] envisager/i.test(l)) bornes.push({ rang: 2, intitule: 'Les travaux à envisager', i });
  });

  for (let n = 0; n < bornes.length; n++) {
    const b = bornes[n]!;
    const bloc = corps.slice(b.i + 1, bornes[n + 1]?.i ?? corps.length);
    const cout = coutDe(bloc);
    const recommandations = recommandationsDe(bloc);
    if (!recommandations.length && !cout) continue;
    /*
     * Un seul pack par rang, et c'est une garantie, pas une commodité.
     *
     * Le DPE en propose deux : les essentiels, puis ceux à envisager. Rien de
     * plus. Or le titre peut reparaître ailleurs dans le document — renvoi,
     * rappel en tête de page — et l'affichage boucle sur le rang : deux packs
     * de rang 1 feraient une clé dupliquée, c'est-à-dire un écran blanc au
     * lieu d'une fiche. On garde la première occurrence, celle du tableau.
     */
    if (packs.some((p) => p.rang === b.rang)) continue;
    packs.push({
      rang: b.rang,
      intitule: b.intitule,
      ...(cout ? { cout } : {}),
      recommandations
    });
  }
  return packs;
}
