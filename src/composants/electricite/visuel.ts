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
 * 1 · LES RISQUES ENCOURUS — les intitulés du texte, et rien d'autre
 * ════════════════════════════════════════════════════════════════════════
 *
 * ⚠️⚠️ **L'ÉCHELLE « TRÈS FAIBLE / MODÉRÉ / ÉLEVÉ » A ÉTÉ RETIRÉE LE 22/08.**
 * Ordre d'Aude : « pour le niveau, respecte l'intitulé de la réglementation ».
 * Elle avait raison, et la vérification l'a montré : **l'arrêté du 28 septembre
 * 2017 ne gradue rien.** Il ne définit aucune échelle de risque. Il NOMME des
 * risques, et il les nomme domaine par domaine, dans sa rubrique 8
 * « Explications détaillées relatives aux risques encourus ».
 *
 * Une échelle inventée par-dessus un texte qui n'en a pas, c'est exactement ce
 * que le § 4 de l'ordre du pack interdit — « ne jamais inventer de niveau de
 * danger ». La planche montre « RISQUE MODÉRÉ » : c'est sa donnée fictive, et
 * elle ne devient pas une donnée en passant dans du code.
 *
 * ## Ce que le texte écrit, mot pour mot
 *
 * *Annexe III de l'arrêté, rubrique 8, telle que le modèle de rapport
 * l'imprime — relevée le 22/08/2026 sur sept volets du corpus DGLM. Les
 * annexes ne figurent pas dans la version HTML de Légifrance : elles ne vivent
 * que dans le PDF du Journal officiel et dans les rapports, qui reproduisent le
 * modèle à l'identique.*
 *
 * | Domaine | Ce que la rubrique 8 écrit du risque |
 * |---|---|
 * | 1 · appareil général | « ne permet pas d'assurer cette fonction de coupure en cas de danger (risque d'électrisation, voire d'électrocution), d'incendie ou d'intervention sur l'installation électrique » |
 * | 2 · différentiel, terre | « peut être la cause d'une électrisation, voire d'une électrocution » |
 * | 3 · surintensités | « peut être à l'origine d'incendies » |
 * | 4 · baignoire ou douche | « peut être la cause d'une électrisation, voire d'une électrocution » |
 * | 5 · contact direct | « présentent d'importants risques d'électrisation, voire d'électrocution » |
 * | 6 · vétustes ou inadaptés | « présentent d'importants risques d'électrisation, voire d'électrocution » |
 *
 * **Deux risques sont nommés, et deux seulement** : l'électrisation — voire
 * l'électrocution — et l'incendie. C'est cette liste que la carte affiche, avec
 * les mots du texte, et jamais une note.
 */

/** Les deux risques que l'arrêté nomme. Pas un de plus, pas une graduation. */
export type Risque = 'electrisation' | 'incendie';

export const MOT_RISQUE: Record<Risque, string> = {
  electrisation: 'Électrisation, voire électrocution',
  incendie: 'Incendie'
};

/**
 * Ce que la rubrique 8 dit du risque, domaine par domaine — **mot pour mot**.
 *
 * `phrase` se cite telle quelle sous le domaine concerné : c'est l'objet même
 * de la rubrique 8, et c'est ce qu'un acquéreur a besoin de lire pour
 * comprendre POURQUOI le point compte.
 */
export const RISQUES_PAR_DOMAINE: Record<
  number,
  { readonly risques: readonly Risque[]; readonly phrase: string }
> = {
  1: {
    risques: ['electrisation', 'incendie'],
    phrase:
      'Son absence, son inaccessibilité ou un appareil inadapté ne permet pas d’assurer cette fonction de coupure en cas de danger (risque d’électrisation, voire d’électrocution), d’incendie ou d’intervention sur l’installation électrique.'
  },
  2: {
    risques: ['electrisation'],
    phrase:
      'Son absence ou son mauvais fonctionnement peut être la cause d’une électrisation, voire d’une électrocution.'
  },
  3: {
    risques: ['incendie'],
    phrase:
      'L’absence de ces dispositifs de protection ou leur calibre trop élevé peut être à l’origine d’incendies.'
  },
  4: {
    risques: ['electrisation'],
    phrase:
      'Son absence privilégie, en cas de défaut, l’écoulement du courant électrique par le corps humain, ce qui peut être la cause d’une électrisation, voire d’une électrocution.'
  },
  5: {
    risques: ['electrisation'],
    phrase:
      'Les matériels électriques dont des parties nues sous tension sont accessibles présentent d’importants risques d’électrisation, voire d’électrocution.'
  },
  6: {
    risques: ['electrisation'],
    phrase:
      'Ces matériels électriques, lorsqu’ils sont trop anciens, n’assurent pas une protection satisfaisante contre l’accès aux parties nues sous tension ou ne possèdent plus un niveau d’isolement suffisant. Dans les deux cas, ces matériels présentent d’importants risques d’électrisation, voire d’électrocution.'
  }
};

/**
 * Les risques encourus, d'après les domaines où le rapport a relevé.
 *
 * ⚠️ Aucun risque n'est déduit d'un domaine sans anomalie : le texte attache
 * ses phrases à l'ABSENCE ou au DÉFAUT d'un dispositif, jamais à sa présence.
 * Et quand la conclusion n'a pas pu être lue, la liste est vide — on ne sait
 * pas, et une liste vide se dit « non évalué » à l'écran, pas « aucun risque ».
 */
export function risquesEncourus(s: SyntheseElectricite): Risque[] {
  if (s.issue !== 'anomalies') return [];
  const vus = new Set<Risque>();
  for (const d of s.domaines) {
    if (d.etat !== 'anomalie') continue;
    for (const r of RISQUES_PAR_DOMAINE[d.numero]?.risques ?? []) vus.add(r);
  }
  /* L'ordre du texte : l'atteinte aux personnes d'abord, le bien ensuite. */
  return (['electrisation', 'incendie'] as const).filter((r) => vus.has(r));
}

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
