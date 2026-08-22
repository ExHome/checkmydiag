/**
 * LES POINTS QUE LA LOI EXIGE, ET CE QUE LE RAPPORT EN DIT.
 *
 * Ordre d'Aude, 22 août 2026 : « alors mets les points réglementaires ».
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * POURQUOI C'EST LA BONNE RÉPONSE À UN PROBLÈME QU'ON AVAIT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * La maquette du pack Termites propose trois points clés — « aucun termite
 * vivant observé », « aucun dégât identifié », « pas d'indice récent ». Le
 * moteur ne distingue pas ces axes, et deux d'entre eux sont des NÉGATIONS :
 * les afficher aurait été transformer une absence d'information en conclusion
 * rassurante, ce que l'ordre interdit en toutes lettres.
 *
 * Les points réglementaires renversent le problème. Ce n'est plus
 * l'application qui décide de ce qui compte : c'est le code de la
 * construction et de l'habitation, qui énumère ce qu'un état termites DOIT
 * contenir. Pour chaque exigence, on montre ce que le rapport en dit — ou
 * l'on constate qu'on ne l'a pas trouvée.
 *
 * Une exigence non satisfaite devient donc visible au lieu de disparaître.
 * C'est l'inverse exact d'un point rassurant fabriqué à partir d'un silence.
 *
 * ── LE DROIT NE S'ÉCRIT PAS ICI ─────────────────────────────────────────────
 *
 * Aucun énoncé réglementaire n'est recopié dans ce fichier. Ils vivent dans
 * `reglement/textes.ts`, avec leur référence Légifrance et la date à laquelle
 * ils ont été lus. Ce module ne fait que les mettre en face des données.
 */
import type { Analyse, Diagnostic } from './modele';

export interface PointReglementaire {
  /** Ce que le code exige, en langue de tous les jours. */
  readonly exige: string;
  /** Ce que le rapport en dit, ou null si on ne l'a pas trouvé. */
  readonly rapport: string | null;
  /**
   * L'article qui fonde l'exigence. Affiché : le lecteur doit pouvoir
   * vérifier que ce n'est pas l'application qui décide.
   */
  readonly article: string;
  /**
   * `lu` : le rapport le porte et on l'a lu.
   * `absent` : le rapport devrait le porter, on ne l'a pas trouvé.
   * `illisible` : le modèle de ce rapport n'est pas couvert.
   */
  readonly etat: 'lu' | 'absent' | 'illisible';
}

/** L'article qui énumère le contenu obligatoire d'un état termites. */
const CONTENU_TERMITES = 'article R. 126-42 du code de la construction et de l’habitation';

/** Les zones que le rapport dit avoir regardées. */
function zonesVisitees(d: Diagnostic): string[] {
  return d.schema?.genre === 'pieces' ? d.schema.zones.map((z) => z.nom) : [];
}

/** Les limites d'inspection, telles que la rubrique les porte. */
function partiesNonVisitees(d: Diagnostic): string[] {
  return (d.constatations?.entrees ?? [])
    .filter((e) => e.nature === 'limite')
    .map((e) => (e.ou ? `${e.terme} (${e.ou})` : e.terme));
}

/**
 * Les points réglementaires d'un état termites.
 *
 * L'ordre suit celui de l'article : l'immeuble, les parties visitées, celles
 * qui n'ont pu l'être, les éléments infestés et ceux qui ne le sont pas, la
 * date.
 */
export function pointsReglementairesTermites(
  d: Diagnostic,
  analyse: Pick<Analyse, 'bien'>
): PointReglementaire[] {
  const points: PointReglementaire[] = [];
  const illisible = d.origine === 'illisible';
  const etat = (valeur: string | null): PointReglementaire['etat'] =>
    valeur ? 'lu' : illisible ? 'illisible' : 'absent';

  const adresse = [analyse.bien.adresse, analyse.bien.commune].filter(Boolean).join(', ') || null;
  points.push({
    exige: 'Identifier l’immeuble',
    rapport: adresse,
    article: CONTENU_TERMITES,
    etat: etat(adresse)
  });

  const visitees = zonesVisitees(d);
  points.push({
    exige: 'Indiquer les parties visitées',
    rapport: visitees.length ? visitees.join(' · ') : null,
    article: CONTENU_TERMITES,
    etat: etat(visitees.length ? 'oui' : null)
  });

  /*
   * LA LIGNE QUI COMPTE LE PLUS.
   *
   * La réserve portée au texte le dit : « le code exige les parties NON
   * visitées au même titre que les visitées ; une liste absente n'est pas un
   * détail de forme ». Quand cette ligne est vide, l'écran ne doit surtout
   * pas laisser croire que tout a été vu — il doit dire qu'on ne sait pas.
   */
  const nonVisitees = partiesNonVisitees(d);
  const rubriqueLue = d.constatations?.lue === true;
  points.push({
    exige: 'Indiquer les parties qui n’ont pas pu être visitées',
    rapport: nonVisitees.length
      ? nonVisitees.join(' · ')
      : rubriqueLue && d.constatations?.neant === true
        ? 'Le rapport indique « néant » : aucune partie n’a été déclarée inaccessible.'
        : null,
    article: CONTENU_TERMITES,
    etat: nonVisitees.length || (rubriqueLue && d.constatations?.neant) ? 'lu' : illisible ? 'illisible' : 'absent'
  });

  /*
   * Les éléments infestés et non infestés se lisent dans la même phrase : la
   * conclusion. On ne la coupe pas en deux — le rapport ne le fait pas non
   * plus, et deux demi-phrases se prêteraient à deux lectures.
   */
  points.push({
    exige: 'Indiquer les éléments infestés et ceux qui ne le sont pas',
    rapport: d.verdict ?? null,
    article: CONTENU_TERMITES,
    etat: etat(d.verdict ?? null)
  });

  points.push({
    exige: 'Être daté',
    rapport: d.date ?? null,
    article: CONTENU_TERMITES,
    etat: etat(d.date ?? null)
  });

  return points;
}

/**
 * Combien d'exigences n'ont pas été retrouvées.
 *
 * Sert à dire au lecteur, en une phrase, si son rapport porte tout ce que la
 * loi lui demande de porter — sans le lui faire compter.
 */
export function exigencesManquantes(points: PointReglementaire[]): number {
  return points.filter((p) => p.etat !== 'lu').length;
}
