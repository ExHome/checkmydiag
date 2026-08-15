/**
 * Le plan du logement, zone par zone, tel que le rapport l'établit.
 *
 * Les schémas explicatifs (`composants/schemas/`) répondent à « pourquoi ce
 * contrôle existe ». Celui-ci répond à l'autre question, la seule que le
 * lecteur se pose vraiment : « et chez moi, qu'est-ce qu'on a trouvé, et où ».
 *
 * Règle qui tient tout ce fichier : une zone ne dit que ce que le rapport dit.
 * Quand il est muet sur un point, la zone le dit — « le rapport ne conclut rien
 * ici » — et ne devient pas verte pour autant. Le silence n'est pas une
 * absence : c'est un silence, et il s'affiche comme tel.
 */
import type { Diagnostic, EtatIsolation, Gravite } from '../modele';

export interface ZonePlan {
  /** Repère stable, utilisé par le dessin pour placer la zone. */
  id: string;
  /** Le nom de la zone, tel qu'on le montre. */
  nom: string;
  /** L'état, pour la couleur. `neutre` quand le rapport ne tranche pas. */
  etat: Gravite;
  /** Ce que le rapport dit de cette zone. Jamais une phrase inventée. */
  dit: string;
}

/** Les quatre parois du DPE, dans l'ordre où la chaleur s'en va. */
const PAROIS: { id: keyof import('../modele').Isolation; nom: string }[] = [
  { id: 'toit', nom: 'Toiture' },
  { id: 'murs', nom: 'Murs' },
  { id: 'fenetres', nom: 'Fenêtres' },
  { id: 'plancher', nom: 'Plancher bas' }
];

/**
 * Ce que le rapport dit d'une paroi.
 *
 * « Isolée » et « non isolée » sont des constats du rapport. « Inconnu » n'en
 * est pas un : c'est nous qui n'avons pas su lire, et il faut le dire ainsi
 * plutôt que de laisser croire à un constat.
 */
function ditIsolation(etat: EtatIsolation): ZonePlan['dit'] {
  if (etat === 'isole') return `Le rapport relève une isolation sur ce poste.`;
  if (etat === 'nonIsole') return `Le rapport ne relève aucune isolation sur ce poste.`;
  return `Le rapport ne dit rien de l’isolation de ce poste, ou la mention n’a pas pu être lue. À vérifier page par page dans le rapport signé.`;
}

function etatIsolation(etat: EtatIsolation): Gravite {
  if (etat === 'isole') return 'bon';
  if (etat === 'nonIsole') return 'attention';
  return 'neutre';
}

/** Les quatre classes du constat plomb, dans les mots de l'arrêté. */
const CLASSES_PLOMB = [
  'Classe 0 — pas de plomb au-dessus du seuil',
  'Classe 1 — plomb présent, revêtement non dégradé',
  'Classe 2 — plomb présent, revêtement en état d’usage',
  'Classe 3 — plomb présent, revêtement dégradé'
];

/**
 * Les zones d'un diagnostic, tirées de son schéma et de ses relevés.
 *
 * L'ordre compte : ce qui appelle une action vient avant ce qui va bien. Un
 * plan qui commence par ce qui va bien se lit comme un bulletin scolaire.
 */
export function zonesDe(d: Diagnostic): ZonePlan[] {
  const zones = brutes(d).map((z) => ({ ...z, dit: enPhrase(z.dit) }));

  const rang: Record<Gravite, number> = { alerte: 0, attention: 1, neutre: 2, bon: 3 };
  return [...zones].sort((a, b) => rang[a.etat] - rang[b.etat]);
}

/**
 * Ce que le rapport dit, écrit comme une phrase.
 *
 * Les mentions tirées d'un tableau arrivent parfois telles quelles — « niveau
 * forte », sans majuscule ni point. On ne touche pas au mot, jamais : on lui
 * met une majuscule et un point. Reformuler serait réécrire le rapport.
 */
function enPhrase(texte: string): string {
  const t = texte.trim();
  if (!t) return t;
  const avecMajuscule = t[0]!.toUpperCase() + t.slice(1);
  return /[.!?…]$/.test(avecMajuscule) ? avecMajuscule : `${avecMajuscule}.`;
}

function brutes(d: Diagnostic): ZonePlan[] {
  const s = d.schema;

  if (s?.genre === 'dpe') {
    return PAROIS.map((p) => ({
      id: p.id,
      nom: p.nom,
      etat: etatIsolation(s.isolation[p.id]),
      dit: ditIsolation(s.isolation[p.id])
    }));
  }

  if (s?.genre === 'plomb') {
    /*
     * Une zone par emplacement relevé — pas une par pièce du logement.
     *
     * Le constat ne parcourt pas le logement : il liste les unités de
     * diagnostic où il a mesuré. Dessiner les pièces manquantes en vert
     * inventerait des mesures qui n'ont pas eu lieu.
     */
    const parZone = new Map<string, { classe: number; elements: string[] }>();
    for (const e of s.emplacements) {
      const cle = e.zone.trim() || 'Emplacement non nommé';
      const existant = parZone.get(cle);
      if (existant) {
        existant.classe = Math.max(existant.classe, e.classe);
        if (e.element && !existant.elements.includes(e.element)) existant.elements.push(e.element);
      } else {
        parZone.set(cle, { classe: e.classe, elements: e.element ? [e.element] : [] });
      }
    }

    return [...parZone].map(([nom, v], i) => ({
      id: `plomb-${i}`,
      nom,
      etat: v.classe >= 3 ? 'alerte' : v.classe >= 1 ? 'attention' : 'bon',
      dit:
        (CLASSES_PLOMB[v.classe] ?? `Classe ${v.classe}`) +
        (v.elements.length ? ` — ${v.elements.join(', ')}.` : '.')
    }));
  }

  if (s?.genre === 'pieces') {
    return s.zones.map((z, i) => ({
      id: `piece-${i}`,
      nom: z.nom,
      etat: z.etat,
      dit: z.detail ?? 'Le rapport nomme cette zone sans autre précision.'
    }));
  }

  if (s?.genre === 'risques') {
    return s.risques.map((r, i) => ({
      id: `risque-${i}`,
      nom: r.nom,
      etat: r.niveau,
      dit: r.detail ?? 'Le rapport signale ce risque sans autre précision.'
    }));
  }

  if (s?.genre === 'anomalies') {
    /*
     * Les groupes de l'arrêté, avec leur compte.
     *
     * Un groupe absent de la liste n'est pas un groupe sans anomalie : c'est un
     * groupe que le rapport ne cite pas. On ne complète donc pas la liste avec
     * les domaines manquants — ce serait affirmer une conformité que personne
     * n'a écrite.
     */
    return s.groupes.map((g, i) => ({
      id: `groupe-${i}`,
      nom: g.nom,
      etat: 'attention' as Gravite,
      dit:
        g.nombre === 1
          ? 'Le rapport signale une anomalie sur ce point.'
          : `Le rapport signale ${g.nombre} anomalies sur ce point.`
    }));
  }

  /*
   * Pas de schéma : on se rabat sur les relevés, qui portent parfois le lieu.
   * C'est le cas de l'amiante et des termites sur beaucoup de rapports.
   */
  const releves = d.releves ?? [];
  if (releves.length) {
    return releves.slice(0, 12).map((r, i) => ({
      id: `releve-${i}`,
      nom: r.ou?.trim() || r.libelle.slice(0, 40),
      etat:
        r.genre === 'anomalie'
          ? ('attention' as Gravite)
          : r.genre === 'nonVisite' || r.genre === 'nonVerifie'
            ? ('neutre' as Gravite)
            : ('bon' as Gravite),
      dit:
        r.genre === 'nonVisite'
          ? `Zone non visitée. ${r.libelle}`
          : r.genre === 'nonVerifie'
            ? `Point non vérifié. ${r.libelle}`
            : r.libelle
    }));
  }

  return [];
}

/**
 * Ce qu'on écrit quand il n'y a rien à placer sur le plan.
 *
 * Une phrase, pas un plan vide : un dessin sans zone laisse croire à un
 * logement sans rien à signaler, alors qu'il s'agit d'un rapport dont on n'a
 * pas su tirer le détail.
 */
export function planMuet(d: Diagnostic): string {
  return `Le rapport conclut sur ce diagnostic, mais il ne détaille pas ses constats zone par zone — ou la mise en page n’a pas permis de les relier à un endroit précis. Le détail figure dans le rapport signé, ${
    d.pages[0] === d.pages[1] ? `page ${d.pages[0]}` : `pages ${d.pages[0]} à ${d.pages[1]}`
  }.`;
}
