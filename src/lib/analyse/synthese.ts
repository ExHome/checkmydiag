/**
 * Page « Résumé de l'expertise » d'un dossier technique.
 *
 * C'est un tableau à deux colonnes — prestation | conclusion — rédigé par le
 * diagnostiqueur. Deux usages :
 *  - récupérer le verdict d'un diagnostic que le moteur n'a pas su lire ;
 *  - repérer un diagnostic présent au dossier mais dont le rapport détaillé
 *    n'a pas été découpé.
 *
 * On ne se fie pas à la structure du tableau : à l'extraction, l'intitulé de la
 * colonne de gauche atterrit au milieu de la phrase de droite (« Lors de la
 * présente mission… / CREP / …revêtements contenant du plomb »). En revanche,
 * les conclusions sont des formules normalisées par les arrêtés, et chacune
 * nomme son propre diagnostic. C'est donc la phrase qu'on lit, pas la colonne.
 */
import type { Gravite, TypeDiag } from '../modele';
import { abreger, normalise } from './texte';

/** Intitulés de la colonne de gauche : à retirer, ils coupent les phrases. */
const INTITULES =
  /^(dpe|crep|amiante|gaz|electricite|plomb|termites?|carrez|prestations?|conclusions?|\(norme \d{4}\)|etat des risques et|pollutions|etat termite\/?parasitaire|diagnostic (de )?performance.*|etat des installations?.*|metrage.*|mesurage.*)$/;

/** À quoi reconnaître le diagnostic dont parle une phrase de conclusion. */
const SIGNATURES: { type: TypeDiag; motif: RegExp }[] = [
  { type: 'plomb', motif: /plomb|saturnisme/ },
  { type: 'amiante', motif: /amiante/ },
  { type: 'termites', motif: /termites?|parasitaire|infestation/ },
  { type: 'electricite', motif: /electricit|installation interieure d'electricite/ },
  // Les anomalies « de type A1 / A2 / DGI » sont propres au diagnostic gaz.
  { type: 'gaz', motif: /\bgaz\b|type a1|type a2|\bdgi\b/ },
  {
    type: 'erp',
    motif: /etat des risques|arrete prefectoral|sismique|argileux|plan d'exposition|pollutions/
  },
  { type: 'assainissement', motif: /assainissement/ },
  { type: 'carrez', motif: /superficie|carrez|metrage|mesurage/ },
  { type: 'dpe', motif: /dpe|performance energetique|ademe|couts annuels|audit energetique/ }
];

export interface BlocSynthese {
  type: TypeDiag;
  /** Conclusion telle qu'écrite dans le dossier. */
  lignes: string[];
}

/** Pied de page du diagnostiqueur, répété sur chaque page. */
function estPiedDePage(ligne: string): boolean {
  return /RCS|Tél\.?\s*:|SARL|S\.A\.S|assurance|MMA \d/i.test(ligne) && ligne.length < 140;
}

/**
 * L'intitulé de colonne se colle parfois au début de la ligne de droite
 * (« Gaz réparées dans les meilleurs délais »). On le retire quand le mot qui
 * suit est en minuscule : une phrase ne commence pas ainsi.
 */
function retirerIntitulePrefixe(ligne: string): string {
  const m = ligne.match(
    /^(Gaz|Électricité|Electricité|Amiante|CREP|Plomb|Termites?|DPE|Carrez)\s+(?=[a-zà-ÿ])/
  );
  return m ? ligne.slice(m[0].length) : ligne;
}

/**
 * Certaines synthèses recopient, elles aussi, toutes les conclusions possibles
 * en attendant qu'une case soit cochée. Recollées, elles donnent des monstres
 * du genre « des anomalies de type A1 et A2, DGI qui devront être réparées
 * avant remise en service » — un verdict qui n'a jamais été rendu.
 */
export function estFormulaire(texte: string): boolean {
  const n = normalise(texte);

  const contradictoire =
    /ne comporte aucune anomalie/.test(n) && /comporte (?:une|des|une ou des) anomalie/.test(n);

  // Pas de \b final : à l'extraction, les colonnes se collent (« A1et A2 »).
  const types = [/\ba1/, /\ba2/, /\bdgi/].filter((m) => m.test(n)).length;
  const dgi = /\bdgi/.test(n);

  // Un DGI fait condamner l'installation sur-le-champ : il ne cohabite pas avec
  // une anomalie « à réparer ultérieurement » dans une vraie conclusion.
  const typesIncompatibles = types >= 3 || (dgi && types >= 2);

  // Deux échéances contradictoires = deux cases recopiées l'une après l'autre.
  const echeances = [/ulterieurement/, /meilleurs delais/, /avant remise en service/].filter((m) =>
    m.test(n)
  ).length;

  const plusieursConclusions = (n.match(/qui devront etre/g) ?? []).length >= 2;

  return contradictoire || typesIncompatibles || echeances >= 2 || plusieursConclusions;
}

/**
 * Recolle les lignes en phrases complètes, après avoir retiré les intitulés de
 * colonne qui s'intercalent.
 */
function phrases(lignes: string[]): string[] {
  const utiles = lignes
    .filter((l) => l.trim().length > 0 && !estPiedDePage(l) && !INTITULES.test(normalise(l)))
    .map(retirerIntitulePrefixe);

  const res: string[] = [];
  let courante = '';
  for (const ligne of utiles) {
    courante = courante ? `${courante} ${ligne.trim()}` : ligne.trim();
    if (/[.!?]\s*$/.test(ligne.trim())) {
      res.push(courante.replace(/\s+/g, ' ').trim());
      courante = '';
    }
  }
  if (courante) res.push(courante.replace(/\s+/g, ' ').trim());
  return res.filter((p) => p.length > 20);
}

export function lireSynthese(lignes: string[]): BlocSynthese[] {
  const debut = lignes.findIndex((l) => /prestations?\s+conclusion/i.test(normalise(l)));
  const utiles = debut >= 0 ? lignes.slice(debut + 1) : lignes;

  const blocs = new Map<TypeDiag, string[]>();
  for (const phrase of phrases(utiles)) {
    const n = normalise(phrase);
    const signature = SIGNATURES.find((s) => s.motif.test(n));
    if (!signature) continue;
    const existant = blocs.get(signature.type);
    if (existant) existant.push(phrase);
    else blocs.set(signature.type, [phrase]);
  }

  return [...blocs.entries()].map(([type, lignesBloc]) => ({ type, lignes: lignesBloc }));
}

/** Conclusion d'un type, en une phrase affichable. */
export function conclusionDe(blocs: BlocSynthese[], type: TypeDiag): string | null {
  const bloc = blocs.find((b) => b.type === type);
  if (!bloc) return null;
  const texte = bloc.lignes.join(' ').replace(/\s+/g, ' ').trim();
  if (texte.length <= 15 || estFormulaire(texte)) return null;
  return abreger(texte, 300);
}

/**
 * Gravité déduite de la phrase du diagnostiqueur — on lit ce qu'il a écrit, on
 * n'interprète pas au-delà. Dans le doute, « neutre » : mieux vaut une carte
 * sans couleur qu'un « rien à signaler » abusif.
 */
export function graviteDe(conclusion: string): Gravite {
  const n = normalise(conclusion);

  // L'ordre compte : « ne comporte aucune anomalie » contient le mot
  // « anomalie », et une lecture par mots-clés isolés rend la phrase illisible.
  // On va donc du plus spécifique au plus général.
  if (/danger grave|\bdgi\b|classe 3|non[- ]conforme/.test(n)) return 'alerte';

  if (
    /n'a pas ete repere|n'a pas ete mis en evidence|ne comporte aucune anomalie|ne comporte pas d'anomalie|aucune anomalie|absence d'indice|aucun materiau|n'a pas ete detecte|aucun revetement/.test(
      n
    )
  ) {
    return 'bon';
  }

  if (
    /comporte (?:une|des|une ou des) anomalie|anomalies? de type|anomalies averees|recommande d'agir|mis en evidence la presence|presence d'indice|presence de materiaux|presence de revetements|il a ete repere|infestation/.test(
      n
    )
  ) {
    return 'attention';
  }

  return 'neutre';
}
