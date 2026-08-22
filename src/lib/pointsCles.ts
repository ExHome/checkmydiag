/**
 * LES POINTS CLÉS D'UN DIAGNOSTIC — ce que le rapport dit, en trois lignes.
 *
 * Ordre de mission du 22 août 2026, bloc A : « Présenter en premier les
 * conclusions réellement présentes dans le rapport », et surtout — c'est la
 * phrase qui commande tout ce fichier — « ne jamais transformer une absence
 * d'information en conclusion rassurante ».
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * POURQUOI CE N'EST PAS UNE LISTE ÉCRITE À LA MAIN
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * La maquette de référence montre trois points : « Aucun termite vivant
 * observé », « Aucun dégât identifié », « Pas d'indice d'activité récent ».
 * Ce sont des EXEMPLES, et le pack le dit lui-même : « aucune donnée du visuel
 * d'exemple ne doit être considérée comme une donnée métier réelle ».
 *
 * Le moteur ne distingue pas ces trois axes. Les afficher tels quels
 * reviendrait à affirmer trois choses que le rapport n'a pas dites
 * séparément — et deux d'entre elles seraient des négations, c'est-à-dire
 * exactement la faute que l'ordre interdit.
 *
 * Chaque point produit ici cite donc une donnée qui EXISTE, et porte sa
 * provenance. Quand la donnée manque, il n'y a pas de point : il y a un
 * silence, et le silence se dit.
 */
import type { Diagnostic } from './modele';

export interface PointCle {
  /** Le titre court, celui qu'on lit en premier. */
  readonly titre: string;
  /** La phrase qui explique, sans rien ajouter au rapport. */
  readonly detail: string;
  /**
   * Ce qui porte ce point : le verdict du rapport, un fait relevé, une
   * rubrique. Affiché au lecteur — c'est la traçabilité exigée au § 3.
   */
  readonly source: string;
  /**
   * Le ton dit la gravité, jamais la satisfaction. `neutre` existe pour les
   * points qui informent sans rassurer ni inquiéter — la majorité.
   */
  readonly ton: 'bon' | 'moyen' | 'mauvais' | 'neutre';
}

/** Le nombre de zones que le rapport dit avoir regardées. */
function zonesControlees(d: Diagnostic): number {
  return d.schema?.genre === 'pieces' ? d.schema.zones.length : 0;
}

/** Les limites d'inspection, telles que la rubrique les porte. */
function limites(d: Diagnostic): { terme: string; ou?: string }[] {
  return (d.constatations?.entrees ?? []).filter((e) => e.nature === 'limite');
}

/**
 * Les points clés d'un diagnostic, dans l'ordre de lecture.
 *
 * Le premier est toujours la conclusion du rapport : c'est elle qu'on est
 * venu chercher. Les suivants disent ce qui la borne.
 */
export function pointsClesDe(d: Diagnostic): PointCle[] {
  const points: PointCle[] = [];

  /*
   * 1. LA CONCLUSION, MOT POUR MOT.
   *
   * Elle n'est pas reformulée : c'est la phrase qui engage la responsabilité
   * du diagnostiqueur. Le ton vient de la gravité que le moteur a calculée,
   * pas d'une lecture du texte faite ici.
   */
  if (d.verdict) {
    points.push({
      titre: 'Ce que conclut le rapport',
      detail: d.verdict,
      source: d.origine === 'synthese' ? 'page de synthèse du dossier' : 'conclusion du rapport',
      ton: d.gravite === 'alerte' ? 'mauvais' : d.gravite === 'attention' ? 'moyen' : d.gravite === 'bon' ? 'bon' : 'neutre'
    });
  }

  /*
   * 2. CE QUE LA CONCLUSION NE COUVRE PAS.
   *
   * Placé DEUXIÈME, avant tout le reste, et jamais en bas de page : une
   * conclusion rassurante lue sans ses limites est une conclusion fausse.
   * C'est le § 2-D de l'ordre — « visuellement impossible à confondre avec
   * les zones contrôlées ».
   */
  const nonControle = limites(d);
  if (nonControle.length) {
    const premiers = nonControle.slice(0, 2).map((l) => (l.ou ? `${l.terme} (${l.ou})` : l.terme));
    const reste = nonControle.length - premiers.length;
    points.push({
      titre:
        nonControle.length === 1
          ? 'Un endroit n’a pas pu être contrôlé'
          : `${nonControle.length} endroits n’ont pas pu être contrôlés`,
      detail:
        premiers.join(' · ') +
        (reste > 0 ? ` · et ${reste} autre${reste > 1 ? 's' : ''}` : '') +
        '. Là où personne n’est allé, le rapport ne dit rien.',
      source: 'rubrique des limites d’inspection',
      ton: 'moyen'
    });
  }

  /*
   * 3. L'ÉTENDUE DU CONTRÔLE.
   *
   * Un nombre de zones n'est ni bon ni mauvais : il dit sur quoi porte la
   * conclusion. D'où le ton neutre — le rassurant serait une interprétation.
   */
  const zones = zonesControlees(d);
  if (zones > 0) {
    points.push({
      titre: zones === 1 ? '1 zone regardée' : `${zones} zones regardées`,
      detail:
        'La conclusion ne vaut que pour ces zones, et pour ce qui y était visible sans démontage.',
      source: 'liste des zones du rapport',
      ton: 'neutre'
    });
  }

  /*
   * 4. LES FAITS QUE LE RAPPORT IMPRIME.
   *
   * Repris tels quels, sans en choisir le sens. On s'arrête à deux : au-delà,
   * ce n'est plus un point clé, c'est le rapport.
   */
  /*
   * ON ÉCARTE LES DOUBLONS D'ABORD, ON COUPE ENSUITE.
   *
   * L'inverse — couper à deux puis filtrer — a été écrit d'abord, et un test
   * l'a attrapé : sur un rapport qui imprime « Zones contrôlées », « Date du
   * repérage » puis « Niveau d'infestation de la commune », les deux premiers
   * étaient pris puis rejetés comme doublons, et le seul fait utile du lot
   * n'était jamais atteint. L'écran perdait une information parce qu'elle
   * arrivait en troisième position.
   */
  const faitsUtiles = (d.faits ?? []).filter((f) => !/date|zones? contrôlées?/i.test(f.libelle));

  for (const f of faitsUtiles.slice(0, 2)) {
    points.push({
      titre: f.libelle,
      detail: String(f.valeur),
      source: 'donnée relevée dans le rapport',
      ton: 'neutre'
    });
  }

  return points;
}

/**
 * Ce qu'on affiche quand il n'y a rien à afficher.
 *
 * Un écran sans points clés ne doit pas se taire : le lecteur croirait que
 * l'application a lu et n'a rien trouvé d'important. Elle n'a rien lu.
 */
export function silenceDesPointsCles(d: Diagnostic): string | null {
  if (pointsClesDe(d).length) return null;
  return d.origine === 'illisible'
    ? 'Ce diagnostic n’a pas pu être lu : rien n’en est tiré ici. Ouvrez-le dans le rapport.'
    : 'Aucune conclusion n’a été lue dans ce diagnostic. Cela ne veut pas dire qu’il n’en contient pas.';
}
