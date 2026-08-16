/**
 * Repérages « présence / absence » : amiante et termites.
 *
 * Ces rapports listent les pièces contrôlées, une ligne par élément, et
 * concluent par une phrase type. On lit la phrase, et on compte les lignes qui
 * signalent une présence pour ne pas dépendre d'une seule formulation.
 */
import type { Diagnostic, Fait, Gravite } from '../modele';
import { compact, trouver } from './texte';

function zonesTermites(lignes: string[]): { nom: string; etat: Gravite; detail?: string }[] {
  const zones: { nom: string; etat: Gravite; detail?: string }[] = [];
  let pieceCourante = '';

  for (const ligne of lignes) {
    const colle = compact(ligne);
    if (!colle.includes('indicesdinfestation') && !colle.includes('indicedinfestation')) continue;

    // « Piece 1 Sol - Carrelage Absence d'indices d'infestation de termites »
    const piece = ligne.match(/^((?:Pi[eè]ce|Chambre|Cuisine|Salon|S[ée]jour|Salle|Garage|Cave|Grenier|Combles|WC|Couloir|Entr[ée]e|D[ée]gagement|Buanderie|Terrasse|Balcon|Ext[ée]rieur)[^-]*?)\s+(?:Sol|Mur|Plafond|Plinthes|Porte|Fen[eê]tre|Charpente|Escalier)/i);
    if (piece?.[1]) pieceCourante = piece[1].trim();

    const nom = pieceCourante || 'Zone contrôlée';
    const presence = colle.includes('presencedindices') || /pr[ée]sence d.indice/i.test(ligne);
    const existante = zones.find((z) => z.nom === nom);

    if (existante) {
      if (presence) existante.etat = 'alerte';
    } else {
      zones.push({ nom, etat: presence ? 'alerte' : 'bon' });
    }
  }
  return zones;
}

/**
 * Les autres volets de l'état parasitaire.
 *
 * Le rapport s'appelle « état relatif à la présence de termites », et c'est ce
 * que le moteur lisait — rien d'autre. Or le même document porte souvent trois
 * volets : les termites, les insectes à larves xylophages, les champignons
 * lignivores dont la mérule, plus une rubrique « constatations diverses ».
 *
 * Mesuré sur quarante dossiers : dix parlent de mérule, dix de xylophages, neuf
 * portent des constatations diverses, huit un volet « autres agents de
 * dégradation ». Conclure « aucun indice d'infestation de termites » sans dire
 * un mot de ces volets, c'est rassurer par omission — la phrase est vraie, et
 * le lecteur en tire une conclusion fausse.
 *
 * On se garde d'interpréter leur conclusion : les formulations n'ont pas été
 * mesurées, et une absence déduite au jugé sur la mérule serait exactement le
 * genre d'erreur qu'on passe son temps à corriger. On signale que le volet
 * existe, et on renvoie au rapport.
 */
const VOLETS: { cle: string; nom: string; motif: RegExp }[] = [
  {
    cle: 'xylophages',
    nom: 'Insectes du bois (xylophages)',
    motif: /xylophages?|capricornes?|vrillettes?|lyctus|hesperophane|sirex/i
  },
  {
    cle: 'merule',
    nom: 'Mérule et champignons du bois',
    motif: /m[ée]rule|champignons? lignivores?|coniophore|pourriture (?:cubique|fibreuse|molle)/i
  },
  {
    cle: 'divers',
    nom: 'Constatations diverses',
    motif: /constatations? diverses?|autres? agents? (?:de )?d[ée]gradation/i
  }
];

function voletsPresents(lignes: string[]): { cle: string; nom: string }[] {
  const texte = lignes.join(' ');
  return VOLETS.filter((v) => v.motif.test(texte)).map(({ cle, nom }) => ({ cle, nom }));
}

export function analyserTermites(lignes: string[], plage: [number, number]): Diagnostic {
  const zones = zonesTermites(lignes);
  const infestees = zones.filter((z) => z.etat === 'alerte');
  const volets = voletsPresents(lignes);

  const phraseAbsence = trouver(
    lignes,
    /(?:il n'a pas [ée]t[ée] rep[ée]r[ée]|absence)[^.]*indice[^.]*infestation[^.]*termites?/i
  );
  const phrasePresence = trouver(
    lignes,
    /(?:il a [ée]t[ée] rep[ée]r[ée]|pr[ée]sence)[^.]*(?:indice|infestation)[^.]*termites?/i
  );

  /*
   * A-t-on seulement lu quelque chose ?
   *
   * Sans cette question, un rapport dont rien n'est reconnu — page scannée,
   * modèle inhabituel — tombait dans la branche « pas d'infestation » : le
   * produit affirmait en vert l'absence d'indices qu'il n'avait jamais lus.
   * Un silence n'est pas une absence, et cette phrase-là part chez le notaire.
   */
  const conclusionLue =
    !!phraseAbsence || !!phrasePresence || infestees.length > 0 || zones.length > 0;
  const infeste = infestees.length > 0 || (!!phrasePresence && !phraseAbsence);

  const faits: Fait[] = [];
  if (zones.length) faits.push({ libelle: 'Zones contrôlées', valeur: String(zones.length) });
  if (infestees.length)
    faits.push({ libelle: 'Zones avec indices', valeur: String(infestees.length) });

  const arrete = trouver(lignes, /arr[eê]t[ée] pr[ée]fectoral\s*n?°?\s*([\w .-]{6,40})/i);
  if (arrete?.[1]) faits.push({ libelle: 'Arrêté préfectoral', valeur: arrete[1].trim() });
  const niveau = trouver(lignes, /Niveau d'infestation\s*(\w+)/i);
  if (niveau?.[1]) faits.push({ libelle: 'Niveau d’infestation de la commune', valeur: niveau[1] });
  const date = trouver(lignes, /Date du rep[ée]rage\s*:?[\s.]*(\d{2}\/\d{2}\/\d{4})/i);
  if (date?.[1]) faits.push({ libelle: 'Date du repérage', valeur: date[1] });

  /*
   * La phrase qui empêche de se rassurer sur ce qui n'a pas été dit.
   *
   * Le verdict porte sur les termites, et sur eux seuls. Quand le rapport
   * couvre d'autres agents, on l'annonce et on renvoie à sa conclusion — sans
   * la lire à sa place.
   */
  const noms = volets.map((v) => v.nom.toLowerCase());
  const mentionVolets =
    noms.length === 0
      ? ''
      : ` Ce rapport traite aussi ${
          noms.length === 1
            ? noms[0]
            : `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`
        } : ces volets ont leur propre conclusion dans le rapport.`;

  if (volets.length) {
    faits.push({
      libelle: 'Autres volets du rapport',
      valeur: String(volets.length),
      precision: volets.map((v) => v.nom).join(' · ')
    });
  }

  return {
    type: 'termites',
    /* Le titre suit ce que le rapport couvre : « Termites » sur un état qui
       parle aussi de mérule et de xylophages annoncerait moins que son
       contenu. */
    titre: volets.length ? 'État parasitaire' : 'Termites',
    verdict:
      (!conclusionLue
        ? 'Un état termites figure au dossier ; sa conclusion n’a pas pu être lue automatiquement.'
        : infeste
          ? `Des indices d’infestation de termites ont été relevés${infestees.length ? ` dans ${infestees.length} zone${infestees.length > 1 ? 's' : ''}` : ''}.`
          : 'Aucun indice d’infestation de termites n’a été relevé dans les parties visitées.') +
      mentionVolets,
    gravite: !conclusionLue ? 'neutre' : infeste ? 'alerte' : 'bon',
    faits,
    analogie:
      'Les termites mangent le bois de l’intérieur et laissent la surface intacte. C’est la pomme véreuse : de l’extérieur, elle est parfaite.',
    explication: [
      // « sans démontage » est au lexique : la réserve tient en deux mots.
      'Le diagnostiqueur cherche des traces : galeries dans le bois, cordons de terre le long des murs, bois qui sonne creux. Il regarde ce qui est visible, sans démontage.',
      'Il ne peut donc pas garantir qu’il n’y a aucun termite. Un mur fermé, une cave inaccessible, une charpente hors d’atteinte : tout cela reste invisible.',
      'Ce diagnostic n’est demandé que dans les communes où le préfet a signalé la présence de termites. Il ne vaut que six mois.',
      ...(volets.length
        ? [
            /*
             * Ce que couvrent les volets supplémentaires, quand ils sont là.
             *
             * Le fondement de la mérule est au référentiel : article L. 126-25
             * du code de la construction et de l'habitation, lu le 14/08/2026.
             * Comme les termites, l'obligation naît d'un zonage arrêté par le
             * préfet — c'est une information due, pas un diagnostic dû.
             */
            'Les termites ne sont pas les seuls à manger le bois. Les insectes du bois — capricornes, vrillettes, lyctus — creusent la charpente et les menuiseries ; la mérule, elle, est un champignon qui se nourrit du bois humide et se propage derrière les murs, dans le noir, sans qu’on la voie.',
            'Ces volets ne suivent pas la même règle que les termites. Une information sur le risque de mérule n’est due que dans les zones délimitées par arrêté préfectoral, et le contrôle des insectes du bois relève le plus souvent d’une prestation que le vendeur commande en plus — il n’est obligatoire nulle part.',
            'Chacun de ces volets a sa propre conclusion dans le rapport : lisez-les séparément. Un état qui ne relève aucun termite peut signaler autre chose deux pages plus loin.'
          ]
        : [])
    ],
    aFaire: infeste
      ? [
          'Déclarez l’infestation en mairie : c’est une obligation dès qu’un foyer est constaté.',
          'Faites intervenir une entreprise spécialisée pour un traitement curatif, et faites vérifier la charpente et les structures porteuses.',
          'À la vente, cet état doit être daté de moins de six mois au jour de la signature.'
        ]
      : [
          'Validité : six mois. Si la vente traîne, il faudra le refaire.',
          'Le rapport ne couvre que les parties visitées : lisez la liste des zones non accessibles, elle figure dans le rapport.'
        ],
    schema: zones.length ? { genre: 'pieces', zones } : null,
    pages: plage,
    ...(date?.[1] ? { date: date[1] } : {})
  };
}

export function analyserAmiante(lignes: string[], plage: [number, number]): Diagnostic {
  // Piège : le titre du rapport contient « repérage des matériaux et produits
  // contenant de l'amiante », et le corps explique longuement ce qu'est
  // l'amiante. Chercher le mot ne prouve donc rien : seule compte la phrase de
  // conclusion normalisée, dans l'un ou l'autre sens.
  const phraseAbsence = trouver(
    lignes,
    /il n'?a pas [ée]t[ée] rep[ée]r[ée] de mat[ée]riaux(?: et produits)?(?: susceptibles de contenir| contenant)? de l'amiante/i
  );
  const phrasePresence = trouver(
    lignes,
    /il a [ée]t[ée] rep[ée]r[ée] des mat[ée]riaux(?: et produits)?(?: susceptibles de contenir| contenant)? de l'amiante|mis en [ée]vidence la pr[ée]sence[^.]{0,40}amiante/i
  );

  // La vraie conclusion est donnée liste par liste (A : flocages et
  // calorifugeages ; B : dalles, conduits, toitures ; C : avant démolition),
  // chacune sur sa ligne. C'est le seul endroit qui affirme quelque chose : le
  // reste du rapport ne fait qu'expliquer ce qu'est l'amiante (« en cas de
  // présence d'amiante… »), et comptait à tort dans une version précédente.
  const listes: { liste: string; presence: boolean }[] = [];
  for (const ligne of lignes) {
    const m = ligne.match(/Liste\s*([ABC])\s*:/i);
    if (!m?.[1]) continue;
    /* Les deux apostrophes : trente-neuf dossiers sur quarante emploient les
       deux, parfois dans la même phrase. Voir `tolerantAuxApostrophes`. */
    if (/n['’]?a\s*pas\s*[ée]t[ée]\s*rep[ée]r[ée]/i.test(ligne)) {
      listes.push({ liste: m[1].toUpperCase(), presence: false });
    } else if (/il\s*a\s*[ée]t[ée]\s*rep[ée]r[ée]/i.test(ligne)) {
      listes.push({ liste: m[1].toUpperCase(), presence: true });
    }
  }

  /*
   * Les listes simplement citées, sans conclusion attachée.
   *
   * Mesuré sur quarante dossiers : la forme « Liste A : il n'a pas été
   * repéré… », seule reconnue jusqu'ici, n'apparaît que dans un dossier. La
   * forme dominante est tout autre — « matériaux (et produits) de la liste A »,
   * 175 fois, dans dix-huit dossiers sur quarante. C'est un intitulé de
   * tableau, pas une phrase : rien ne le suit qui dise présence ou absence
   * (mesuré : 159 fois sur 175, aucune conclusion dans les 400 caractères
   * suivants).
   *
   * On note donc ce que cette mention établit réellement, et rien de plus :
   * cette catégorie de matériaux fait partie de ce que le repérage a couvert.
   * Lui attribuer la conclusion générale du rapport serait une déduction — et
   * une déduction sur une absence d'amiante n'est pas une chose qu'on se
   * permet.
   */
  const citees = new Set<string>();
  for (const ligne of lignes) {
    for (const m of ligne.matchAll(/mat[ée]riaux(?: et produits)? de la liste\s*([ABC])\b/gi)) {
      const l = m[1]?.toUpperCase();
      if (l && !listes.some((x) => x.liste === l)) citees.add(l);
    }
  }

  const listesAvecAmiante = listes.filter((l) => l.presence).map((l) => l.liste);

  /*
   * Une absence sur une liste n'efface pas une présence sur une autre.
   *
   * On écrivait « pas de phrase d'absence ET (présence ou liste positive) » :
   * la phrase d'absence annulait tout le reste. Or un rapport conclut liste par
   * liste. « Liste A : il n'a pas été repéré… », suivi de « Liste B : il a été
   * repéré des dalles de sol », déclenchait la première branche — et le verdict
   * passait au vert sur un logement amianté.
   *
   * C'est la faute la plus grave qu'un lecteur de diagnostic puisse commettre :
   * elle ne prive pas d'une information, elle affirme le contraire. Un relevé
   * positif l'emporte désormais sur toute phrase d'absence, d'où qu'elle vienne.
   */
  const amianteTrouvee = listesAvecAmiante.length > 0 || (!phraseAbsence && !!phrasePresence);
  const conclusionLue = !!phraseAbsence || listes.length > 0 || !!phrasePresence;

  /*
   * Le plan de l'amiante, ce sont ses listes.
   *
   * Un repérage amiante ne parcourt pas des pièces : il contrôle des catégories
   * de matériaux, définies en annexe du code de la santé publique. C'est donc
   * cela qu'on place sur le plan — et seulement les listes que le rapport cite.
   * Une liste qu'il ne mentionne pas n'est pas une liste sans amiante : c'est
   * une liste dont il ne dit rien, et elle n'a pas à s'afficher en vert.
   *
   * Le texte de la vente ne vise que A et B (R. 1334-29-7 du code de la santé
   * publique, lu le 14/08/2026). La liste C relève du repérage avant démolition
   * — quand elle apparaît, on le dit, parce que le lecteur qui la voit tient
   * peut-être un autre document que celui qu'il croit.
   */
  const COUVRE: Record<string, string> = {
    A: 'flocages, calorifugeages et faux plafonds',
    B: 'autres matériaux accessibles sans travaux destructifs',
    C: 'liste du repérage avant démolition, qui n’est pas le repérage de vente'
  };

  const zonesAmiante = [
    ...listes.map((l) => ({
      nom: `Liste ${l.liste}`,
      etat: (l.presence ? 'attention' : 'bon') as Gravite,
      detail: `${
        l.presence
          ? 'Le rapport signale des matériaux de cette liste dans le bien.'
          : 'Le rapport ne relève aucun matériau de cette liste dans les parties accessibles.'
      } La liste ${l.liste} couvre les ${COUVRE[l.liste] ?? 'matériaux qu’elle désigne'}.`
    })),
    ...[...citees].sort().map((l) => ({
      nom: `Liste ${l}`,
      /* Neutre, et pas « bon » : le rapport dit qu'il a regardé là, il ne dit
         pas ici ce qu'il y a trouvé. Sa conclusion d'ensemble est ailleurs. */
      etat: 'neutre' as Gravite,
      detail: `Cette catégorie fait partie de ce que le repérage a couvert. Le rapport ne lui attache pas de conclusion propre : la sienne est donnée pour l’ensemble du repérage. La liste ${l} couvre les ${COUVRE[l] ?? 'matériaux qu’elle désigne'}.`
    }))
  ];

  const faits: Fait[] = [];
  const date = trouver(lignes, /Date du rep[ée]rage\s*:?[\s.]*(\d{2}\/\d{2}\/\d{4})/i);
  if (date?.[1]) faits.push({ libelle: 'Date du repérage', valeur: date[1] });
  if (listesAvecAmiante.length)
    faits.push({
      libelle: 'Listes concernées',
      valeur: listesAvecAmiante.join(', '),
      precision: 'A : flocages · B : dalles, conduits, toiture'
    });

  /*
   * Ce qui a été trouvé, et la suite à lui donner.
   *
   * Le produit disait « des matériaux contenant de l'amiante ont été repérés »
   * sans jamais dire lesquels ni où. Le rapport, lui, les nomme, les situe, et
   * indique la suite — trois suites existent pour la liste B, et elles
   * n'engagent pas au même point.
   */
  const materiaux = materiauxAmiantes(lignes);
  const aSurveiller = materiaux.filter((m) => m.suite === 'evaluation');
  const aTraiter = materiaux.filter((m) => m.suite === 'action-1' || m.suite === 'action-2');

  if (materiaux.length) {
    faits.push({
      libelle: materiaux.length > 1 ? 'Matériaux repérés' : 'Matériau repéré',
      valeur: materiaux.map((m) => m.quoi).slice(0, 3).join(' · '),
      precision: materiaux
        .map((m) => m.ou)
        .filter((o): o is string => Boolean(o))
        .slice(0, 3)
        .join(' · ')
    });
  }

  return {
    type: 'amiante',
    titre: 'Amiante',
    verdict: !conclusionLue
      ? 'Un repérage amiante figure au dossier ; sa conclusion n’a pas pu être lue automatiquement.'
      : materiaux.length
        ? `Amiante repérée : ${materiaux[0]?.quoi}${materiaux[0]?.ou ? ` (${materiaux[0]?.ou})` : ''}${
            materiaux.length > 1 ? `, et ${materiaux.length - 1} autre${materiaux.length > 2 ? 's' : ''}` : ''
          }.${
            aTraiter.length
              ? ' Des travaux sont recommandés.'
              : aSurveiller.length
                ? ' Une évaluation périodique est recommandée : on revient contrôler l’état tous les trois ans.'
                : ''
          }`
        : amianteTrouvee
          ? 'Des matériaux contenant de l’amiante ont été repérés dans le bien.'
          : 'Aucun matériau contenant de l’amiante n’a été repéré dans les parties accessibles.',
    gravite: !conclusionLue ? 'neutre' : amianteTrouvee ? 'attention' : 'bon',
    faits,
    analogie:
      'L’amiante, ce sont des fibres minuscules emprisonnées dans du ciment, de la colle ou une dalle. Tant que le bloc tient, elles restent prisonnières. C’est la perceuse qui les libère, pas le temps qui passe.',
    explication: [
      'On ne cherche l’amiante que dans les logements construits avant juillet 1997 : après cette date, elle était interdite. Le diagnostiqueur contrôle une liste précise de matériaux — faux plafonds, dalles de sol, conduits, toitures.',
      'Trouver de l’amiante n’est pas une catastrophe. Tant que le matériau est en bon état et qu’on n’y touche pas, il ne libère rien. Le danger vient de la poussière, quand on perce, on ponce ou on casse.',
      'Le diagnostiqueur regarde, il ne casse rien. Il ne peut donc pas voir ce qui est enfermé dans les murs. Avant des travaux, un repérage plus poussé est obligatoire : celui-là fait des trous.'
    ],
    aFaire: amianteTrouvee
      ? [
          'Ne percez, ne poncez, ne découpez jamais un matériau amianté vous-même : faites appel à une entreprise certifiée.',
          'Selon le matériau et son état, le rapport impose soit une simple surveillance périodique (contrôle tous les trois ans), soit des travaux.',
          'Conservez le rapport : il devra être remis à toute entreprise intervenant dans le logement, et au futur acquéreur.'
        ]
      : [
          'Un repérage « avant vente » sans amiante n’a pas de limite de validité, tant qu’il n’y a pas de travaux.',
          'Avant des travaux touchant la structure, un repérage « avant travaux » (plus poussé, avec sondages) reste obligatoire.'
        ],
    schema: zonesAmiante.length ? { genre: 'pieces', zones: zonesAmiante } : null,
    pages: plage,
    ...(date?.[1] ? { date: date[1] } : {})
  };
}

export const _interne = { zonesTermites };

/** Un matériau amianté repéré, avec ce que le rapport en dit. */
export interface MateriauAmiante {
  /** Ce que c'est : « Conduits de fumée en amiante-ciment ». */
  quoi: string;
  /** Où : « 1er étage - Terrasse ». */
  ou: string | null;
  /** La suite à donner, telle que le rapport la recommande. */
  suite: 'evaluation' | 'action-1' | 'action-2' | null;
}

/**
 * Les matériaux amiantés repérés, et la suite à leur donner.
 *
 * Le produit lisait les listes A et B — présence ou absence — sans jamais dire
 * CE QUI a été trouvé. Or le rapport le nomme, le situe, et indique la suite :
 *
 *   Conduits de fumée en amiante-ciment (1er étage - Terrasse) pour lequel il
 *   est recommandé de réaliser une évaluation périodique.
 *
 * Trois suites existent pour la liste B, et elles n'engagent pas au même point.
 * L'évaluation périodique est une surveillance — on revient regarder tous les
 * trois ans. Les actions correctives de premier et de second niveau sont des
 * travaux : la seconde impose en plus de confiner ou retirer le matériau.
 *
 * Un acquéreur qui lit « amiante repérée » sans savoir laquelle des trois
 * s'applique ne peut ni chiffrer ni décider. C'est pourtant écrit.
 */
export function materiauxAmiantes(lignes: string[]): MateriauAmiante[] {
  const trouves: MateriauAmiante[] = [];

  for (let i = 0; i < lignes.length; i++) {
    const brut = (lignes[i] ?? '').trim();

    /* La ligne du matériau commence par son nom et porte sa localisation entre
       parenthèses. On exige l'un ET l'autre : une phrase d'explication sur
       l'amiante en général n'a pas de localisation. */
    const m = /^([A-ZÉÈÀ][^()]{4,70}?)\s*\(([^)]{3,60})\)/.exec(brut);
    if (!m?.[1] || !m[2]) continue;

    /*
     * La suite déborde sur la ligne suivante.
     *
     * « … pour lequel il est recommandé de réaliser / une évaluation
     * périodique. » : la phrase est coupée en deux par la mise en page, et
     * chercher sur la seule ligne du matériau ne trouvait jamais rien. C'est le
     * même piège que la date « Rapport du : » — l'extraction découpe en lignes
     * ce que le rapport écrit en phrases.
     */
    const avecSuite = brut + ' ' + (lignes[i + 1] ?? '');

    const quoi = m[1].replace(/\s+/g, ' ').trim();
    /* Les intitulés de rubrique et les renvois n'en sont pas. */
    if (/^(?:liste|dans le cadre|article|annexe|voir|conclusion)/i.test(quoi)) continue;

    const suite = /action corrective de second niveau|second niveau/i.test(avecSuite)
      ? ('action-2' as const)
      : /action corrective|premier niveau/i.test(avecSuite)
        ? ('action-1' as const)
        : /[ée]valuation p[ée]riodique/i.test(avecSuite)
          ? ('evaluation' as const)
          : null;

    trouves.push({ quoi, ou: m[2].replace(/\s+/g, ' ').trim(), suite });
  }

  return trouves;
}
