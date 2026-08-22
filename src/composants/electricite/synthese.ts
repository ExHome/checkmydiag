/**
 * LA SYNTHÈSE ÉLECTRICITÉ — les dix blocs du pack du 22/08/2026.
 *
 * *Pack `VERRIERE_ELECTRICITE_PACK_CLAUDE.zip`, planche
 * `01_VISUEL_REFERENCE_ELECTRICITE.png`, ordre `02_ODM_CLAUDE_ELECTRICITE_RIGOUREUX`.*
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CE MODULE NE DESSINE RIEN. Il répond à une seule question : **qu'est-ce que
 * ce rapport permet d'afficher ?** L'écran en fait des cartes.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── LE DÉFAUT QUI A DÉCIDÉ DE CE MODULE ─────────────────────────────────────
 *
 * Mesuré le 22/08 sur sept volets électricité du corpus DGLM : le rapport
 * annonce **16 anomalies**, l'extraction en rend **18**, et l'écran en montrait
 * **7**. Onze anomalies réelles, avec leurs localisations, disparaissaient
 * entre le moteur et l'œil — sans même être comptées comme « détachées ».
 *
 * La cause : l'ancien écran ne montrait que les anomalies qu'il savait placer
 * sur un dessin de chaîne. Ce qui ne se plaçait pas n'existait pas. Ici, la
 * règle est inverse : **on part de `diagnostic.anomalies` et on les rend
 * TOUTES.** Le § 12 de l'ordre en fait un critère de livraison — « toutes les
 * anomalies du rapport sont présentes ».
 *
 * ── LES TROIS FAMILLES DU MOCKUP N'EXISTENT PAS ─────────────────────────────
 *
 * La planche montre « ANOMALIES À RISQUE (2) », « ANOMALIES IMPORTANTES (5) »,
 * « ANOMALIES À AMÉLIORER (5) ». **Aucun état de l'installation intérieure
 * d'électricité ne porte cette échelle** : ni l'arrêté du 28 septembre 2017, ni
 * les rapports lus. Le § 3 de l'ordre l'interdit en toutes lettres — « ne
 * jamais reclasser arbitrairement une anomalie en critique, importante, modérée
 * ou à améliorer sans règle métier validée ».
 *
 * Le rapport, lui, groupe déjà ses anomalies : par **DOMAINE**, et c'est sa
 * propre colonne de gauche. C'est ce groupement qui est repris — le § 2 le
 * demande d'ailleurs : « présenter les anomalies par familles utiles à la
 * compréhension, tout en conservant les codes et libellés techniques ».
 *
 * ── ET LES AUTRES VALEURS DU MOCKUP ─────────────────────────────────────────
 *
 *   « Installation électrique non conforme »  interdit par le § 4 : ce
 *                                             diagnostic n'atteste d'aucune
 *                                             conformité à la NF C 15-100. On
 *                                             écrit la phrase du rapport
 *   « NIVEAU DE RISQUE · RISQUE MODÉRÉ »      aucune échelle de risque n'existe
 *   « Points de contrôle conformes : 18 »     ce nombre n'est écrit nulle part
 *   « NIVEAU DE CONFIANCE : 80 % »            § 7 : « à défaut de méthode
 *                                             validée, remplacer le pourcentage
 *                                             par une phrase factuelle »
 *
 * ── LES QUATRE MOTS QU'ON NE CONFOND JAMAIS ─────────────────────────────────
 *
 * Le § 6 en fait une règle : **conforme ≠ absence d'anomalie ≠ non contrôlé ≠
 * non applicable.** Le type `Etat` ci-dessous les tient séparés, et rien dans
 * ce module ne les ramène l'un à l'autre.
 */
import type { Anomalie, Diagnostic, Gravite } from '../../lib/modele';
import { CLES } from './lecture';

/** Ce que le rapport établit globalement. Trois issues, jamais deux. */
export type Issue = 'anomalies' | 'sansAnomalie' | 'nonLu';

/**
 * L'état d'un domaine de contrôle. Quatre valeurs, et elles ne se valent pas.
 *
 * ⚠️ `sansAnomalie` n'est pas `conforme` : l'arrêté du 28 septembre 2017 fait
 * de ce diagnostic une **évaluation des risques**, pas une attestation de
 * conformité. Et `nonVerifie` n'est ni l'un ni l'autre — c'est un trou.
 */
export type Etat = 'anomalie' | 'sansAnomalie' | 'nonVerifie' | 'inconnu';

/** Un domaine du contrôle, avec ce que le rapport en dit. */
export interface Domaine {
  readonly numero: number;
  readonly nom: string;
  readonly etat: Etat;
  /** Les anomalies de ce domaine, toutes, dans l'ordre du rapport. */
  readonly anomalies: readonly Anomalie[];
  /** Le motif, quand le rapport dit pourquoi ce point n'a pas été vérifié. */
  readonly motif?: string;
}

/** Une ligne du bloc « ce qui n'a pas été contrôlé ». */
export interface Limite {
  readonly quoi: string;
  readonly pourquoi?: string;
}

export interface PointCle {
  readonly titre: string;
  readonly detail: string;
  readonly ton: Gravite;
  /** Le bloc que cette ligne détaille plus bas, quand il existe. */
  readonly ancre?: 'domaines' | 'anomalies' | 'limites';
}

export interface SyntheseElectricite {
  readonly issue: Issue;
  /** La phrase du rapport, mot pour mot. Jamais reformulée. */
  readonly resultat: string;
  readonly gravite: Gravite;
  /**
   * Le compte d'anomalies.
   *
   * `annonce` est celui que le rapport écrit ; `rendues` celui que l'écran
   * affiche vraiment. ⚠️ Les deux sont montrés quand ils diffèrent : un compte
   * affiché plus petit que le compte annoncé est une perte, et une perte se
   * dit — elle ne se maquille pas en total.
   */
  readonly compte: { annonce: number | null; rendues: number };
  readonly pointsCles: readonly PointCle[];
  /** Les six domaines du contrôle, avec leur état réel. */
  readonly domaines: readonly Domaine[];
  /** Toutes les anomalies, sans exception, dans l'ordre du rapport. */
  readonly anomalies: readonly Anomalie[];
  /** Les anomalies qu'aucun domaine n'a pu accueillir — jamais perdues. */
  readonly horsDomaine: readonly Anomalie[];
  readonly limites: { readonly montrer: boolean; readonly entrees: readonly Limite[]; readonly mention?: string };
  /**
   * Les points de contrôle que le rapport dit n'avoir pas pu vérifier **sans
   * dire auxquels des six domaines ils appartiennent**.
   *
   * ⚠️ Tant que ce nombre n'est pas nul, aucun domaine ne peut être présenté
   * comme tranquillement « sans anomalie » : l'un d'eux porte peut-être le
   * point manquant. Le § 6 de l'ordre l'exige — « les éléments non contrôlés ne
   * doivent jamais entrer dans un score rassurant comme s'ils avaient été
   * vérifiés ».
   */
  readonly nonAttribues: number;
  /** Ce que le rapport dit de sa propre complétude. Jamais un pourcentage. */
  readonly completude: readonly string[];
  readonly conseil: readonly string[];
  readonly pages: readonly [number, number];
}

/**
 * LES DOMAINES DU CONTRÔLE — ceux de l'arrêté, dans son ordre.
 *
 * *Arrêté du 28 septembre 2017, annexe : le contrôle porte sur l'installation
 * privative en aval de l'appareil général de commande et de protection.*
 *
 * ⚠️ Ce catalogue est imprimé dans TOUS les rapports, y compris ceux qui ne
 * relèvent rien : sa présence ne prouve donc aucun contrôle et surtout aucune
 * conformité. Il dit **ce que ce diagnostic regarde**, et c'est à ce titre
 * seulement qu'il remplit le bloc « ce qui a été contrôlé » du visuel — chaque
 * ligne portant ensuite l'état que le rapport lui donne, jamais une coche
 * verte par défaut.
 */
export const DOMAINES: { readonly numero: number; readonly nom: string; readonly signature: RegExp }[] = [
  { numero: 1, nom: 'Appareil général de commande et de protection', signature: /appareil g[ée]n[ée]ral|coupure d.urgence/i },
  /*
   * ⚠️ « BROCHE DE TERRE » EST LE MOTIF QUI MANQUAIT, et c'est le plus fréquent
   * du corpus. Mesuré le 22/08 : « Au moins un socle de prise de courant
   * comporte une broche de terre non reliée à la terre » revient dans presque
   * tous les volets porteurs d'anomalies — et il ne contient ni « prise de
   * terre », ni « mise à la terre ». Sans lui, l'anomalie la plus courante du
   * diagnostic tombait « hors des six domaines ».
   *
   * ⚠️ Et la liaison équipotentielle reste ici SPÉCIFIQUE — « principale ».
   * La « supplémentaire » appartient au domaine 4, celui de la salle d'eau, et
   * un motif large la lui volerait : les domaines sont essayés dans l'ordre.
   */
  { numero: 2, nom: 'Protection différentielle et mise à la terre', signature: /diff[ée]rentiel|prise de terre|mise [àa] la terre|conducteur de (?:terre|protection)|broche de terre|terre non reli[ée]|[ée]quipotentielle principale/i },
  { numero: 3, nom: 'Protection contre les surintensités', signature: /surintensit|calibre|section des conducteurs|fusible|disjoncteur divisionnaire/i },
  { numero: 4, nom: 'Locaux contenant une baignoire ou une douche', signature: /baignoire|douche|salle d.eau|liaison [ée]quipotentielle suppl/i },
  { numero: 5, nom: 'Matériels présentant un risque de contact direct', signature: /contact direct|partie active nue|enveloppe|conducteur non prot[ée]g|partie(s)? nue(s)?/i },
  { numero: 6, nom: 'Matériels vétustes ou inadaptés', signature: /v[ée]tuste|inadapt[ée]/i }
];

/** Un fait du volet, lu par sa clé. */
function fait(d: Diagnostic, cle: string): { valeur: string; precision?: string } | undefined {
  const f = d.faits?.find((x) => x.libelle === cle);
  if (!f) return undefined;
  return { valeur: f.valeur, ...(f.precision ? { precision: f.precision } : {}) };
}

const entier = (t: string | undefined): number | null => {
  if (!t) return null;
  const n = Number(t.trim());
  return Number.isInteger(n) && n >= 0 ? n : null;
};

/**
 * L'issue — lue sur ce que le lecteur a établi, jamais devinée sur la phrase.
 *
 * ⚠️ Chez LICIEL la rubrique 5 imprime les DEUX conclusions opposées l'une sous
 * l'autre, et la case qui les départage est un graphique : chercher des mots
 * dans le verdict, c'est tirer à pile ou face. On lit donc les anomalies et la
 * gravité — c'est le lecteur d'éditeur qui a fait le travail.
 */
export function issueDe(d: Diagnostic): Issue {
  if ((d.anomalies?.length ?? 0) > 0) return 'anomalies';
  if (/n'a pas pu être lue|ne peut pas la lire|cochée à la main/i.test(d.verdict)) return 'nonLu';
  if (d.gravite === 'neutre') return 'nonLu';
  return 'sansAnomalie';
}

/**
 * À quel domaine appartient une anomalie.
 *
 * Le rapport le dit lui-même quand sa colonne de gauche a pu être lue
 * (`anomalie.domaine`) ; sinon on le retrouve sur le libellé, qui reprend les
 * mots de l'arrêté. Et si aucun ne correspond, l'anomalie n'est PAS jetée :
 * elle part dans `horsDomaine`, où elle reste visible.
 */
export function domaineDe(a: Anomalie): number | null {
  if (a.domaine?.numero && a.domaine.numero >= 1 && a.domaine.numero <= 6) return a.domaine.numero;
  const texte = `${a.domaine?.nom ?? ''} ${a.libelle}`;
  return DOMAINES.find((dom) => dom.signature.test(texte))?.numero ?? null;
}

/** Les points de contrôle que le rapport dit n'avoir pas pu vérifier. */
function limitesDe(d: Diagnostic): SyntheseElectricite['limites'] {
  const entrees: Limite[] = [];

  const nv = fait(d, CLES.nonVerifies);
  const combien = entier(nv?.valeur);
  if (combien) {
    entrees.push({
      quoi:
        combien === 1
          ? 'Un point de contrôle n’a pas pu être vérifié'
          : `${combien} points de contrôle n’ont pas pu être vérifiés`,
      ...(nv?.precision ? { pourquoi: nv.precision } : {})
    });
  }

  for (const p of d.nonVisitees?.pieces ?? []) {
    entrees.push({
      quoi: [p.terme, p.ou].filter(Boolean).join(' — '),
      ...(p.pourquoi ? { pourquoi: p.pourquoi } : {})
    });
  }

  /*
   * ⚠️ LA LIMITE QUE TOUT RAPPORT PORTE, ET QUE PERSONNE N'OUVRE.
   *
   * L'arrêté du 28 septembre 2017 impose au rapport d'écrire que des éléments
   * dangereux « peuvent ne pas être repérés » — tout ce qui est noyé dans les
   * murs, masqué par du mobilier, ou logé dans une boîte de connexion, une
   * goulotte, une plinthe ou une huisserie, ainsi que le fond du tableau
   * capot démonté. Ce n'est pas une clause de style : c'est la portée réelle du
   * diagnostic, et elle vaut pour TOUS les rapports, y compris ceux qui ne
   * relèvent rien. Le § 6 de l'ordre veut ce bloc « dès qu'une limite figure
   * dans le rapport » — celle-ci y figure toujours.
   */
  entrees.push({
    quoi: 'Les parties non visibles de l’installation',
    pourquoi:
      'Ce qui est noyé dans les murs, masqué par du mobilier, ou logé dans une boîte de connexion, une goulotte, une plinthe ou une huisserie — et le fond du tableau, capot démonté. L’arrêté du 28 septembre 2017 oblige le rapport à le dire.'
  });

  return { montrer: true, entrees };
}

/** Ce que le rapport dit de sa propre complétude — en faits, jamais en note. */
function completudeDe(d: Diagnostic, domaines: readonly Domaine[]): string[] {
  const dits: string[] = [];

  const nonVerifies = domaines.filter((x) => x.etat === 'nonVerifie');
  if (nonVerifies.length) {
    dits.push(
      `${nonVerifies.length === 1 ? 'Un domaine n’a pas pu être vérifié' : `${nonVerifies.length} domaines n’ont pas pu être vérifiés`} : ${nonVerifies
        .map((x) => x.nom)
        .join(', ')}.`
    );
  }

  /*
   * Le différentiel non essayé change la portée de toute la conclusion : c'est
   * le seul organe du tableau qui protège les PERSONNES.
   */
  const nv = fait(d, CLES.nonVerifies);
  if (nv?.precision && /aliment|coupure|hors tension/i.test(nv.precision)) {
    dits.push(`Motif donné par le rapport : ${nv.precision}`);
  }

  const compense = fait(d, CLES.compense);
  if (compense) {
    dits.push(
      'Une anomalie fait l’objet d’une mesure compensatoire : elle limite le risque, elle ne le supprime pas et l’anomalie reste.'
    );
  }

  dits.push(
    'Ce diagnostic évalue des risques pour la sécurité des personnes. Il n’atteste d’aucune conformité à une norme d’installation neuve.'
  );
  return dits;
}

/** Assembler la synthèse. */
export function syntheseElectricite(d: Diagnostic): SyntheseElectricite {
  const issue = issueDe(d);
  const anomalies = d.anomalies ?? [];

  /*
   * Les domaines : les six de l'arrêté, chacun avec SON état.
   *
   * ⚠️ Un domaine sans anomalie ne prend jamais l'état d'un domaine non
   * vérifié, et aucun des deux ne prend le mot « conforme ». Quand la
   * conclusion elle-même n'a pas pu être lue, tous les domaines passent en
   * `inconnu` : on ne sait pas, et on le dit.
   */
  const motifNonVerifie = fait(d, CLES.nonVerifies)?.precision;
  const nonVerifiesTexte = `${fait(d, CLES.nonVerifies)?.precision ?? ''}`;

  const domaines: Domaine[] = DOMAINES.map((dom) => {
    const identite = { numero: dom.numero, nom: dom.nom };
    const siennes = anomalies.filter((a) => domaineDe(a) === dom.numero);
    if (siennes.length) return { ...identite, etat: 'anomalie' as const, anomalies: siennes };
    if (issue === 'nonLu') return { ...identite, etat: 'inconnu' as const, anomalies: [] };
    /* Le domaine explicitement non essayé — le motif du rapport le nomme. */
    if (nonVerifiesTexte && dom.signature.test(nonVerifiesTexte)) {
      return {
        ...identite,
        etat: 'nonVerifie' as const,
        anomalies: [],
        ...(motifNonVerifie ? { motif: motifNonVerifie } : {})
      };
    }
    return { ...identite, etat: 'sansAnomalie' as const, anomalies: [] };
  });

  const horsDomaine = anomalies.filter((a) => domaineDe(a) === null);

  const annonce = entier(fait(d, CLES.anomalies)?.valeur);
  const compte = { annonce, rendues: anomalies.length };

  const pointsCles: PointCle[] = [];

  if (issue === 'anomalies') {
    pointsCles.push({
      titre:
        anomalies.length === 1
          ? 'Une anomalie relevée'
          : `${anomalies.length} anomalies relevées`,
      detail: domaines
        .filter((x) => x.etat === 'anomalie')
        .map((x) => x.nom)
        .join(' · '),
      ton: 'attention',
      ancre: 'anomalies'
    });

    /*
     * Le § 5 de l'ordre demande de rendre particulièrement lisibles le
     * différentiel, la mise à la terre et les parties actives nues : ce sont
     * les points qui protègent les personnes, et non les biens.
     */
    const personnes = domaines.filter((x) => (x.numero === 2 || x.numero === 5) && x.etat === 'anomalie');
    if (personnes.length) {
      pointsCles.push({
        titre: 'Des points qui protègent les personnes',
        detail: personnes.map((x) => x.nom).join(' · ') + ' — c’est ce qui coupe le courant quand il passe par quelqu’un.',
        ton: 'alerte',
        ancre: 'anomalies'
      });
    }
  } else if (issue === 'sansAnomalie') {
    pointsCles.push({
      titre: 'Aucune anomalie relevée',
      detail: 'Sur les points que ce diagnostic contrôle, et à la date de la visite.',
      ton: 'bon',
      ancre: 'domaines'
    });
  } else {
    pointsCles.push({
      titre: 'La conclusion n’a pas pu être lue',
      detail: 'Elle est cochée à la main dans le rapport : un programme ne peut pas la lire.',
      ton: 'attention'
    });
  }

  const nonVerifies = domaines.filter((x) => x.etat === 'nonVerifie');
  if (nonVerifies.length) {
    pointsCles.push({
      titre:
        nonVerifies.length === 1
          ? 'Un point n’a pas pu être vérifié'
          : `${nonVerifies.length} points n’ont pas pu être vérifiés`,
      detail: motifNonVerifie ?? 'Le rapport ne dit rien de ces points : ni qu’ils sont sains, ni le contraire.',
      ton: 'attention',
      ancre: 'limites'
    });
  }

  const compense = fait(d, CLES.compense);
  if (compense) {
    pointsCles.push({
      titre: 'Une anomalie compensée',
      detail: 'Une mesure compensatoire limite le risque. Elle ne répare pas l’anomalie, qui reste relevée.',
      ton: 'attention',
      ancre: 'anomalies'
    });
  }

  return {
    issue,
    resultat: d.verdict,
    gravite: d.gravite,
    compte,
    pointsCles,
    domaines,
    anomalies,
    horsDomaine,
    limites: limitesDe(d),
    nonAttribues:
      domaines.some((x) => x.etat === 'nonVerifie') ? 0 : (entier(fait(d, CLES.nonVerifies)?.valeur) ?? 0),
    completude: completudeDe(d, domaines),
    conseil: d.aFaire ?? [],
    pages: d.pages ?? [1, 1]
  };
}
