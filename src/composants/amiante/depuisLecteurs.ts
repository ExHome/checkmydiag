/**
 * DE CE QUE LES LECTEURS LISENT À CE QUE L'ÉCRAN MONTRE.
 *
 * `synthese.ts` part d'un `Diagnostic`, la forme historique. Ce module part de
 * ce que rendent les lecteurs de `lib/lecteurs/amiante/` — un par éditeur,
 * choisi sur signature — et produit la même `SyntheseAmiante`. L'écran n'a donc
 * pas à savoir quel logiciel a produit le rapport : c'est tout l'objet de
 * l'architecture par éditeur.
 *
 * ⚠️ **Le « format inconnu » remonte jusqu'à l'écran.** L'aiguilleur ne replie
 * pas vers « le lecteur le plus probable » : quand aucune signature ne
 * reconnaît le document, il le dit — et l'écran doit le dire aussi. C'est la
 * règle du socle, et elle vaut ici plus qu'ailleurs : 14 documents du corpus
 * amiante n'ont aucun texte extractible, et **un volet muet se lit exactement
 * comme un volet sans amiante**.
 */
import type { Aiguillage } from '../../lib/lecteurs/socle';
import type { LectureAmiante } from '../../lib/lecteurs/amiante/modele';
import type { Bloc, Element, Limite, Materiau, SyntheseAmiante } from './synthese';

/** Ce que la mission couvre — et surtout ce qu'elle ne couvre pas. */
const DIT_MISSION: Record<LectureAmiante['mission'], string> = {
  vente: 'Constat établi à l’occasion de la vente du bien.',
  DTA: 'Dossier technique amiante : il porte sur les parties communes.',
  DAPP: 'Dossier amiante des parties privatives.',
  'avant travaux': 'Repérage avant travaux : il ne vaut que pour la zone touchée par ces travaux.',
  inconnue: ''
};

/**
 * La phrase de résultat — celle du rapport quand il en donne une.
 *
 * On ne reformule pas : `phrase` porte la ligne du § 1.1 ou du bloc A, telle
 * qu'elle est imprimée. Les trois phrases de repli ci-dessous ne servent que
 * lorsque la ligne n'a pas pu être isolée.
 */
function resultatDe(l: LectureAmiante): string {
  if (l.phrase) return l.phrase;
  return l.issue === 'presence'
    ? 'Le rapport repère des matériaux contenant de l’amiante.'
    : l.issue === 'nonConclu'
      ? 'Le rapport ne conclut pas encore.'
      : 'Le rapport ne repère aucun matériau contenant de l’amiante.';
}

/** Sur quoi la conclusion repose, dit à un acquéreur. */
function surQuoi(m: LectureAmiante['materiaux'][number]): string | undefined {
  if (m.etat || m.cotation) return [m.etat, m.cotation].filter(Boolean).join(' · ');
  switch (m.justification) {
    case 'analyse en laboratoire':
      return 'établi par analyse en laboratoire';
    case 'anciennes analyses':
      return 'établi sur des analyses antérieures, non jointes au rapport';
    case 'jugement de l’opérateur':
      return 'établi sur le jugement de l’opérateur, sans prélèvement';
    case 'document consulté':
      return 'établi sur un document consulté';
    case 'marquage du matériau':
      return 'établi sur le marquage du matériau';
    case 'non prélevé':
      return 'non prélevé — le rapport ne conclut pas';
    case 'résultats attendus':
      return 'analyse en cours — le rapport ne conclut pas';
    default:
      return undefined;
  }
}

const conseilDe = (issue: SyntheseAmiante['issue'], limites: number): string[] => {
  const c: string[] = [];
  if (issue === 'presence') {
    c.push('Prévenez toute personne appelée à intervenir sur ces matériaux, avant les travaux.');
    c.push('Ne percez, ne poncez, ne découpez rien à cet endroit sans avis d’un professionnel certifié.');
  } else if (issue === 'nonConclu') {
    c.push('Réclamez le rapport complété par les résultats du laboratoire avant de vous engager.');
  } else if (issue === 'illisible') {
    c.push('Demandez une version lisible du rapport : ce document n’a pas pu être exploité.');
  } else {
    c.push('Conservez ce rapport. En cas de travaux, présentez-le aux intervenants.');
  }
  if (limites) {
    c.push(
      'Si des travaux devaient ouvrir les zones restées fermées, faites-les vérifier : le constat ne les couvre pas.'
    );
  }
  return c;
};

/** Ce qu'on montre quand aucun lecteur ne reconnaît le document. */
function formatInconnu(essayes: readonly string[]): SyntheseAmiante {
  return {
    issue: 'illisible',
    resultat:
      "Ce document n’a pas pu être lu : sa mise en page ne correspond à aucun format connu. Aucune conclusion ne peut en être tirée.",
    gravite: 'attention',
    pointsCles: [
      {
        titre: 'Ce document n’a pas pu être lu',
        detail: `Formats reconnus par Verrière : ${essayes.join(', ')}.`,
        ton: 'attention'
      }
    ],
    materiaux: { montrer: false, entrees: [] },
    elements: { montrer: false, entrees: [] },
    constatations: { montrer: false, entrees: [] },
    nonControle: {
      montrer: true,
      entrees: [],
      mention: 'Rien de ce rapport n’a pu être lu — ni ce qui a été contrôlé, ni ce qui ne l’a pas été.'
    },
    completude: [],
    conseil: conseilDe('illisible', 0),
    pages: [1, 1]
  };
}

export function syntheseDeLecture(
  a: Aiguillage<LectureAmiante>,
  pages: readonly [number, number] = [1, 1]
): SyntheseAmiante {
  if (a.etat === 'format inconnu') return formatInconnu(a.essayes);

  const l = a.valeur;
  const positifs = l.materiaux.filter((m) => m.issue === 'presence');
  const suspens = l.materiaux.filter((m) => m.issue === 'nonConclu');

  /*
   * Les positifs d'abord, les non-conclus ensuite — et les négatifs pas du
   * tout : un matériau que le rapport a regardé et écarté n'a pas à figurer
   * dans « les matériaux repérés ». C'est le piège du § 5.0.2 de LICIEL, qui
   * liste ce qui a été REGARDÉ et non ce qui contient de l'amiante.
   */
  const entrees: Materiau[] = [...positifs, ...suspens].map((m) => {
    const etat = surQuoi(m);
    return {
      quoi: m.quoi,
      ...(m.ou.length ? { ou: m.ou.join(' · ') } : {}),
      ...(etat ? { etat } : {}),
      ...(m.suite ? { suite: m.suite } : {})
    };
  });

  const limites: Limite[] = l.limites.entrees.map((e) => ({
    quoi: e.quoi,
    ...(e.ou ? { ou: e.ou } : {}),
    ...(e.pourquoi ? { pourquoi: e.pourquoi } : {})
  }));

  /*
   * ⚠️⚠️ « JE N'AI RIEN RETENU » N'EST PAS « TOUT A ÉTÉ VISITÉ ».
   *
   * Faute mesurée le 22/08 sur un constat réel : un durcissement du filtre de
   * lignes avait fait tomber la seule entrée d'un rapport dont les combles sont
   * fermés — et l'écran annonçait « le rapport indique qu'aucun local n'est
   * resté fermé ». C'est la faute la plus grave possible : elle ne prive pas
   * d'une information, elle affirme le contraire.
   *
   * **Seul le mot « Néant » lu dans la rubrique autorise à dire que rien n'est
   * resté fermé.** Une rubrique trouvée mais dont aucune ligne n'a pu être
   * lue se dit comme telle.
   */
  const nonControle: Bloc<Limite> = limites.length
    ? { montrer: true, entrees: limites }
    : l.limites.neant
      ? { montrer: true, entrees: [], mention: 'Le rapport indique qu’aucun local n’est resté fermé.' }
      : {
          montrer: true,
          entrees: [],
          mention:
            'La liste des locaux non visités n’a pas pu être lue dans ce rapport. On ne peut donc pas dire que tout a été examiné : reportez-vous au rapport complet.'
        };

  /*
   * LES ÉLÉMENTS CONTRÔLÉS — deux sources, et elles ne disent pas la même chose.
   *
   *   · les MATÉRIAUX que le rapport a examinés et écartés — ceux dont l'issue
   *     est `absence`. Une analyse de laboratoire qui conclut « pas d'amiante »
   *     est la preuve la plus forte du volet : elle mérite d'être montrée, et
   *     `surQuoi` en donne les mots ;
   *   · les PIÈCES visitées, § 3.2.6. Elles ne portent aucune conclusion : leur
   *     statut est « Visitée », et ce mot est tout ce qu'on a le droit d'en dire.
   *
   * ⚠️ Les positifs et les non-conclus n'entrent PAS ici : ils ont leur bloc,
   * et les ranger parmi « ce qui a été contrôlé » les noierait.
   */
  const elementsEntrees: Element[] = [
    ...l.materiaux
      .filter((m) => m.issue === 'absence')
      .map((m) => ({
        quoi: m.ou.length ? `${m.quoi} — ${m.ou.join(' · ')}` : m.quoi,
        statut: m.justification === 'analyse en laboratoire' ? 'Analysé, sans amiante' : 'Sans amiante',
        ton: 'bon' as const
      })),
    ...l.perimetre.pieces.map((quoi) => ({ quoi, statut: 'Visitée', ton: 'neutre' as const }))
  ];
  const elements: Bloc<Element> = elementsEntrees.length
    ? { montrer: true, entrees: elementsEntrees }
    : { montrer: false, entrees: [] };

  const pointsCles: SyntheseAmiante['pointsCles'][number][] = [];
  if (l.issue === 'presence') {
    pointsCles.push({
      titre:
        positifs.length === 1
          ? 'Un matériau contenant de l’amiante'
          : `${positifs.length} matériaux contenant de l’amiante`,
      detail: positifs.map((m) => m.quoi).join(' · '),
      ton: 'alerte',
      ancre: 'materiaux'
    });
  } else if (l.issue === 'nonConclu') {
    pointsCles.push({
      titre: 'Le rapport ne conclut pas encore',
      detail: suspens.length
        ? suspens.map((m) => m.quoi).join(' · ')
        : 'Des prélèvements restent à faire, ou leurs résultats sont attendus.',
      ton: 'attention'
    });
  } else {
    pointsCles.push({
      titre: 'Aucun matériau amianté repéré',
      detail: 'Dans le périmètre que le rapport a examiné.',
      ton: 'bon'
    });
  }
  if (limites.length) {
    pointsCles.push({
      titre:
        limites.length === 1
          ? 'Une zone n’a pas pu être examinée'
          : `${limites.length} zones n’ont pas pu être examinées`,
      detail: 'Le constat ne dit rien de ces zones — ni qu’elles sont saines, ni le contraire.',
      ton: 'attention',
      ancre: 'limites'
    });
  }
  if (DIT_MISSION[l.mission]) {
    pointsCles.push({ titre: 'Ce que couvre ce constat', detail: DIT_MISSION[l.mission], ton: 'bon' });
  }

  const completude: string[] = [];
  if (limites.length) {
    completude.push(
      limites.length === 1
        ? 'Un local ou composant n’a pas pu être examiné : le constat ne dit rien de celui-là.'
        : `${limites.length} locaux ou composants n’ont pas pu être examinés : le constat ne dit rien de ceux-là.`
    );
  }
  /*
   * ⚠️ Le DAPP ne cherche QUE la liste A.
   *
   * C'est écrit dans son sous-titre — « des matériaux et produits de la liste A
   * à intégrer au Dossier Amiante – Parties Privatives » — et c'est capital
   * pour un acquéreur : les dalles de sol, les conduits et les plaques en
   * fibres-ciment, qui sont l'essentiel de ce qu'on trouve dans un logement, ne
   * sont même pas cherchés. Le taire serait laisser croire à un examen complet.
   */
  if (l.mission === 'DAPP') {
    completude.push(
      'Ce dossier ne porte que sur la liste A — flocages, calorifugeages, faux plafonds. Les dalles de sol, conduits et plaques de la liste B n’y sont pas recherchés.'
    );
  }
  if (l.laboratoire) {
    completude.push(
      `Des prélèvements ont été analysés par ${l.laboratoire.nom}${
        l.laboratoire.cofrac ? ` (accréditation Cofrac ${l.laboratoire.cofrac})` : ''
      }.`
    );
  }
  if (l.issue === 'nonConclu') {
    completude.push('La conclusion n’est pas définitive tant que les analyses ne sont pas rendues.');
  }

  return {
    issue: l.issue,
    resultat: resultatDe(l),
    gravite: l.issue === 'presence' ? 'alerte' : l.issue === 'nonConclu' ? 'attention' : 'bon',
    pointsCles,
    materiaux: entrees.length
      ? { montrer: true, entrees }
      : {
          montrer: false,
          entrees: [],
          mention:
            'Le rapport ne détaille pas la liste des matériaux examinés un par un. Le détail figure dans le rapport complet.'
        },
    elements,
    constatations: { montrer: false, entrees: [] },
    nonControle,
    completude,
    conseil: conseilDe(l.issue, limites.length),
    pages
  };
}
