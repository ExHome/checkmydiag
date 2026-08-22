/**
 * CE QUE LA PLANCHE ÉLECTRICITÉ MONTRE — et d'où chaque valeur sort.
 *
 * *Ordre d'Aude, 22/08/2026 : « je veux le même visuel exactement ». Et README
 * du pack : « les chiffres, codes, articles, catégories, niveaux de risque et
 * pourcentages visibles sur l'image sont fictifs ».*
 *
 * Les deux tiennent ensemble à une condition, et une seule : **la forme est
 * celle de la planche, au pixel ; les valeurs se CALCULENT à partir du
 * rapport.** Ce module fait les calculs, et dit pour chacun sur quoi il repose.
 *
 * ⚠️⚠️ **CE SONT DES LECTURES VERRIÈRE, PAS DES DONNÉES DU RAPPORT.** Un état
 * de l'installation intérieure d'électricité ne porte ni échelle de risque, ni
 * hiérarchie d'anomalies, ni taux de confiance : l'arrêté du 28 septembre 2017
 * ne les définit pas et aucun des volets lus ne les imprime. Le § 3 de l'ordre
 * n'autorise un classement que « validé et documenté par Verrière » — les
 * règles ci-dessous sont donc écrites, mesurables et testées, et **elles
 * attendent la validation d'Aude**. Le jour où l'une est fausse, elle se
 * corrige à un seul endroit.
 */
import type { Anomalie } from '../../lib/modele';
import type { SyntheseElectricite } from './synthese';

/* ════════════════════════════════════════════════════════════════════════
 * 0 · LE TITRE DU BANDEAU
 * ════════════════════════════════════════════════════════════════════════
 *
 * La planche porte « Installation électrique non conforme » : un titre COURT,
 * en trois lignes, qui tient dans la carte à côté du médaillon. La phrase du
 * rapport, elle, fait le double — « L'installation intérieure d'électricité
 * comporte une ou des anomalies. » — et sur 375 px elle court sur cinq lignes
 * et vient buter contre l'anneau.
 *
 * On garde donc le titre court du visuel **et** la phrase exacte du rapport,
 * placée juste en dessous, en détail du premier point clé — exactement comme
 * la planche, qui met « Des anomalies ont été relevées. » sous son titre.
 * Rien ne se perd, et la carte retrouve sa mise en page.
 *
 * ⚠️ Le titre de la planche est le seul mot qu'on ne reprend pas : « non
 * conforme » est interdit par le § 4 — ce diagnostic n'atteste d'aucune
 * conformité à une norme d'installation neuve.
 */
export const TITRE_BANDEAU: Record<SyntheseElectricite['issue'], string> = {
  anomalies: 'Des anomalies ont été relevées',
  sansAnomalie: 'Aucune anomalie relevée',
  nonLu: 'La conclusion n’a pas pu être lue'
};

/* ════════════════════════════════════════════════════════════════════════
 * 1 · LE NIVEAU DE RISQUE
 * ════════════════════════════════════════════════════════════════════════
 *
 * La planche affiche « RISQUE MODÉRÉ ». Le rapport n'en dit rien — mais
 * l'arrêté, lui, dit ce que ce diagnostic cherche : « évaluer les risques
 * pouvant porter atteinte à la **sécurité des personnes** et le fonctionnement
 * de l'installation ». Les deux ne sont pas au même niveau, et c'est là-dessus
 * que la règle se fonde.
 *
 * | Ce que le rapport établit | Niveau |
 * |---|---|
 * | aucune anomalie | **TRÈS FAIBLE** |
 * | anomalies, mais aucune sur la protection des personnes | **MODÉRÉ** |
 * | au moins une sur le différentiel, la terre ou un contact direct | **ÉLEVÉ** |
 * | conclusion non lisible | **NON ÉVALUÉ** |
 *
 * Les deux domaines qui font basculer en « élevé » sont le 2 et le 5, et ce
 * n'est pas un choix de goût : le différentiel est le seul organe du tableau
 * qui coupe le courant **quand il passe par quelqu'un**, et une partie active
 * nue accessible est un contact direct possible, c'est-à-dire le même danger
 * sans aucune barrière devant.
 */
export type NiveauRisque = 'TRÈS FAIBLE' | 'MODÉRÉ' | 'ÉLEVÉ' | 'NON ÉVALUÉ';

/** Les domaines qui protègent les PERSONNES, et non les biens. */
export const DOMAINES_PERSONNES = [2, 5] as const;

export function niveauDeRisque(s: SyntheseElectricite): NiveauRisque {
  if (s.issue === 'nonLu') return 'NON ÉVALUÉ';
  if (s.issue === 'sansAnomalie') return 'TRÈS FAIBLE';
  const personnes = s.domaines.some(
    (d) => d.etat === 'anomalie' && (DOMAINES_PERSONNES as readonly number[]).includes(d.numero)
  );
  return personnes ? 'ÉLEVÉ' : 'MODÉRÉ';
}

/** Le ton du niveau — jamais seul à porter l'information : le mot est écrit. */
export const TON_RISQUE: Record<NiveauRisque, 'bon' | 'attention' | 'alerte' | 'neutre'> = {
  'TRÈS FAIBLE': 'bon',
  MODÉRÉ: 'attention',
  ÉLEVÉ: 'alerte',
  'NON ÉVALUÉ': 'neutre'
};

/* ════════════════════════════════════════════════════════════════════════
 * 2 · LES TROIS FAMILLES D'ANOMALIES
 * ════════════════════════════════════════════════════════════════════════
 *
 * La planche en montre trois — à risque, importantes, à améliorer. **Le rapport
 * ne hiérarchise rien** : ses anomalies sont rangées par domaine, point. Le
 * classement ci-dessous est donc une lecture Verrière, et il se lit en une
 * ligne :
 *
 *   À RISQUE      domaines 2 et 5 — ce qui protège les personnes
 *   IMPORTANTES   domaines 1, 3 et 4 — coupure d'urgence, surintensités,
 *                 salle d'eau : ce qui protège l'installation et les locaux
 *                 particuliers
 *   À AMÉLIORER   domaine 6 et le reste — vétusté, matériel inadapté
 *
 * ⚠️ **Aucune anomalie ne change de texte en changeant de famille.** Le libellé
 * du rapport, son code et ses localisations sont conservés intacts : la famille
 * est un rangement, pas une réécriture. Et une famille vide ne s'affiche pas —
 * la planche en montre trois parce que son exemple en a trois.
 */
export type Famille = 'risque' | 'importante' | 'amelioration';

export const FAMILLES: { readonly cle: Famille; readonly titre: string; readonly domaines: readonly number[] }[] = [
  { cle: 'risque', titre: 'Anomalies à risque', domaines: [2, 5] },
  { cle: 'importante', titre: 'Anomalies importantes', domaines: [1, 3, 4] },
  { cle: 'amelioration', titre: 'Anomalies à améliorer', domaines: [6] }
];

export interface GroupeFamille {
  readonly cle: Famille;
  readonly titre: string;
  readonly anomalies: readonly Anomalie[];
}

/**
 * Les anomalies rangées dans les trois familles de la planche.
 *
 * ⚠️ Rien ne se perd : ce qu'aucun domaine n'accueille rejoint « à améliorer »,
 * la famille la moins engageante — on ne présume jamais de la gravité de ce
 * qu'on n'a pas su rattacher, et surtout pas à la hausse.
 */
export function famillesDe(s: SyntheseElectricite): GroupeFamille[] {
  const par = new Map<Famille, Anomalie[]>(FAMILLES.map((f) => [f.cle, []]));

  for (const d of s.domaines) {
    if (d.etat !== 'anomalie') continue;
    const f = FAMILLES.find((x) => x.domaines.includes(d.numero))?.cle ?? 'amelioration';
    par.get(f)!.push(...d.anomalies);
  }
  par.get('amelioration')!.push(...s.horsDomaine);

  return FAMILLES.map((f) => ({ cle: f.cle, titre: f.titre, anomalies: par.get(f.cle)! })).filter(
    (g) => g.anomalies.length > 0
  );
}

/* ════════════════════════════════════════════════════════════════════════
 * 3 · LE NIVEAU DE CONFIANCE
 * ════════════════════════════════════════════════════════════════════════
 *
 * La planche affiche « 80 % ». Le § 7 de l'ordre l'interdit « à défaut de
 * méthode validée » et exige, si un indicateur est conservé, « une règle de
 * calcul documentée distinguant contrôlé, non contrôlé, non applicable et non
 * vérifiable ». En voici une :
 *
 *     confiance = domaines renseignés / (renseignés + non renseignés)
 *
 * Un domaine est **renseigné** quand le rapport en dit quelque chose — une
 * anomalie, ou aucune. Il ne l'est pas quand il n'a pas pu être vérifié, ni
 * quand la conclusion elle-même est illisible.
 *
 * ⚠️ **Et le chiffre est plafonné tant que des points non vérifiés ne sont
 * rattachés à aucun domaine.** Le rapport dit parfois « 2 points n'ont pas pu
 * être vérifiés » sans dire lesquels : les compter nulle part donnerait 100 %
 * sur un contrôle incomplet — exactement l'erreur mesurée sur l'amiante le même
 * jour. Ils entrent donc au dénominateur.
 */
export interface Confiance {
  /** Le pourcentage, quand il est calculable. Jamais arrondi à la hausse. */
  readonly part: number | null;
  readonly renseignes: number;
  readonly manquants: number;
  /** Ce que le chiffre veut dire, en une phrase. */
  readonly dit: string;
}

export function confianceDe(s: SyntheseElectricite): Confiance {
  if (s.issue === 'nonLu') {
    return {
      part: null,
      renseignes: 0,
      manquants: s.domaines.length,
      dit: 'La conclusion du rapport n’a pas pu être lue : la part réellement contrôlée ne peut pas être calculée.'
    };
  }

  const renseignes = s.domaines.filter((d) => d.etat === 'anomalie' || d.etat === 'sansAnomalie').length;
  const manquants = s.domaines.filter((d) => d.etat === 'nonVerifie').length + s.nonAttribues;
  const total = renseignes + manquants;
  if (!total) {
    return { part: null, renseignes, manquants, dit: 'Le rapport ne permet pas de mesurer la part contrôlée.' };
  }

  const part = Math.floor((renseignes / total) * 100);
  return {
    part,
    renseignes,
    manquants,
    dit: manquants
      ? `${renseignes} domaines renseignés sur ${total} : ${manquants} ${
          manquants === 1 ? 'point n’a pas pu être vérifié' : 'points n’ont pas pu être vérifiés'
        }, et le contrôle ne dit rien de ${manquants === 1 ? 'celui-là' : 'ceux-là'}.`
      : `Les ${renseignes} domaines du contrôle sont renseignés, et le rapport ne signale aucun point non vérifié.`
  };
}
