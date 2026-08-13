/**
 * Le registre des intentions de recherche.
 *
 * C'est l'outil de pilotage du référencement (ORDRE-DE-MISSION-REFERENCEMENT.md,
 * « on ne mesure pas une position moyenne : on mesure la couverture des
 * intentions »). Chaque ligne est une chose que quelqu'un tape réellement dans
 * un moteur de recherche, rattachée — ou non — à la question qui y répond.
 *
 * **Ce fichier doit rester plus large que le corpus.** S'il ne contenait que ce
 * qui est déjà écrit, il ne servirait à rien : ce sont les lignes sans réponse
 * qui indiquent le travail suivant. `npm run seo` les remonte, triées par
 * poids.
 *
 * Le poids est qualitatif, et c'est volontaire : personne ici n'a accès à des
 * volumes de recherche mesurés, et un chiffre inventé serait pire qu'une
 * appréciation assumée (§ 2 de ORDRE-DE-MISSION.md — aucun chiffre inventé).
 */

/** Ce que pèse une intention, à dire d'expert du métier. */
export type Poids = 'fort' | 'moyen' | 'niche';

export interface Intention {
  /** La formulation, telle qu'on la tape. */
  requete: string;
  poids: Poids;
  /** L'identifiant de la question qui répond, s'il existe. */
  reponse?: string;
  /** Pourquoi cette intention n'est pas encore traitée, ou ce qu'il faudrait. */
  note?: string;
}

export const INTENTIONS: Intention[] = [
  /* ------------------------------------------------------------------ bases */
  { requete: 'diagnostic immobilier obligatoire vente', poids: 'fort', reponse: 'quels-diagnostics-pour-vendre' },
  { requete: 'diagnostic immobilier obligatoire location', poids: 'fort', reponse: 'quels-diagnostics-pour-louer' },
  { requete: 'durée de validité des diagnostics immobiliers', poids: 'fort', reponse: 'combien-de-temps-un-diagnostic-est-valable' },
  { requete: 'prix diagnostic immobilier', poids: 'fort', reponse: 'combien-ca-coute' },
  { requete: 'qui paie les diagnostics immobiliers', poids: 'fort', reponse: 'qui-paie-les-diagnostics' },
  { requete: 'c’est quoi un diagnostic immobilier', poids: 'fort', reponse: 'c-est-quoi-un-diagnostic-immobilier' },
  { requete: 'dossier de diagnostic technique', poids: 'moyen', reponse: 'c-est-quoi-le-dossier-de-diagnostic-technique' },
  { requete: 'combien de temps dure un diagnostic immobilier', poids: 'moyen', reponse: 'comment-se-passe-un-diagnostic' },
  { requete: 'faut-il être présent lors du diagnostic', poids: 'moyen', reponse: 'faut-il-etre-present-pendant-la-visite' },
  { requete: 'délai pour recevoir les diagnostics', poids: 'moyen', reponse: 'en-combien-de-temps-recoit-on-les-rapports' },
  { requete: 'vendre sans diagnostic sanction', poids: 'moyen', reponse: 'que-risque-t-on-sans-diagnostic' },
  { requete: 'diagnostic périmé que faire', poids: 'moyen', reponse: 'mon-diagnostic-est-perime-que-faire' },
  { requete: 'retrouver ses diagnostics immobiliers', poids: 'moyen', reponse: 'j-ai-perdu-mes-diagnostics' },
  { requete: 'diagnostic immobilier succession', poids: 'moyen', reponse: 'diagnostics-pour-une-succession-ou-une-donation' },
  { requete: 'certification diagnostiqueur immobilier', poids: 'moyen', reponse: 'qui-peut-faire-un-diagnostic' },
  { requete: 'choisir son diagnostiqueur', poids: 'niche', reponse: 'comment-choisir-son-diagnostiqueur' },
  { requete: 'diagnostic immobilier terrain nu', poids: 'niche', reponse: 'vendre-un-terrain-ou-un-garage' },
  { requete: 'diagnostic immobilier local commercial', poids: 'niche', reponse: 'vendre-un-local-commercial' },
  { requete: 'vente entre particuliers diagnostics', poids: 'niche', reponse: 'vendre-entre-particuliers' },
  { requete: 'diagnostic immobilier maison neuve', poids: 'niche', reponse: 'vendre-un-logement-neuf-ou-recent' },
  {
    requete: 'diagnostic immobilier viager',
    poids: 'niche',
    note: 'Le viager est une vente : mêmes obligations. Vaut une page si le sujet revient.'
  },

  /* -------------------------------------------------------------------- DPE */
  { requete: 'c’est quoi le DPE', poids: 'fort', reponse: 'c-est-quoi-le-dpe' },
  { requete: 'DPE obligatoire vente', poids: 'fort', reponse: 'quels-diagnostics-pour-vendre' },
  { requete: 'prix d’un DPE', poids: 'fort', reponse: 'combien-coute-un-dpe' },
  { requete: 'validité DPE 10 ans', poids: 'fort', reponse: 'combien-de-temps-un-diagnostic-est-valable' },
  { requete: 'passoire thermique interdiction de louer', poids: 'fort', reponse: 'puis-je-encore-louer-un-logement-classe-g' },
  { requete: 'logement classé G location 2025', poids: 'fort', reponse: 'puis-je-encore-louer-un-logement-classe-g' },
  { requete: 'comment améliorer son DPE', poids: 'fort', reponse: 'quels-travaux-pour-gagner-une-classe' },
  { requete: 'comment est calculé le DPE', poids: 'fort', reponse: 'comment-est-calcule-le-dpe' },
  { requete: 'étiquette énergie A à G', poids: 'fort', reponse: 'comment-lire-l-etiquette-dpe' },
  { requete: 'audit énergétique obligatoire', poids: 'fort', reponse: 'c-est-quoi-l-audit-energetique' },
  { requete: 'DPE chauffage électrique mauvaise note', poids: 'moyen', reponse: 'pourquoi-mon-logement-electrique-est-mal-note' },
  { requete: 'DPE ne correspond pas à mes factures', poids: 'moyen', reponse: 'le-dpe-correspond-il-a-mes-factures' },
  { requete: 'DPE fiable ou pas', poids: 'moyen', reponse: 'le-dpe-est-il-fiable' },
  { requete: 'contester un DPE', poids: 'moyen', reponse: 'contester-un-diagnostic' },
  { requete: 'DPE vierge', poids: 'moyen', reponse: 'c-est-quoi-un-dpe-vierge' },
  { requete: 'DPE petite surface 40m2', poids: 'moyen', reponse: 'dpe-petite-surface' },
  { requete: 'DPE opposable', poids: 'moyen', reponse: 'dpe-opposable-ca-veut-dire-quoi' },
  { requete: 'DPE collectif copropriété', poids: 'moyen', reponse: 'dpe-collectif-ou-individuel' },
  { requete: 'ancien DPE encore valable', poids: 'moyen', reponse: 'mon-ancien-dpe-est-il-encore-valable' },
  { requete: 'gel des loyers passoire thermique', poids: 'moyen', reponse: 'c-est-quoi-une-passoire-thermique' },
  {
    requete: 'simulateur DPE en ligne',
    poids: 'fort',
    note: 'Intention outil, pas information. À traiter honnêtement : aucun simulateur ne remplace un DPE opposable — dire pourquoi, et ce qu’on peut estimer soi-même.'
  },
  {
    requete: 'DPE et MaPrimeRénov aides travaux',
    poids: 'fort',
    note: 'Grosse intention. Prudence : les dispositifs d’aide changent souvent, exige une page datée et strictement sourcée.'
  },
  {
    requete: 'DPE maison ancienne pierre pénalisée',
    poids: 'moyen',
    note: 'Question récurrente sur le bâti ancien (inertie, murs épais). Sujet technique, à traiter sans polémique.'
  },
  {
    requete: 'DPE location saisonnière meublé de tourisme',
    poids: 'moyen',
    reponse: 'location-meublee-et-saisonniere',
    note: 'Couvert partiellement. Le régime a bougé : mérite sa propre page si les règles se stabilisent.'
  },

  /* ---------------------------------------------------------- électricité */
  { requete: 'diagnostic électrique obligatoire', poids: 'fort', reponse: 'c-est-quoi-le-diagnostic-electricite' },
  { requete: 'anomalies diagnostic électrique', poids: 'fort', reponse: 'mon-installation-a-des-anomalies-c-est-grave' },
  { requete: 'mise aux normes électrique obligatoire vente', poids: 'fort', reponse: 'dois-je-mettre-mon-installation-aux-normes' },
  { requete: 'installation électrique plus de 15 ans', poids: 'moyen', reponse: 'pourquoi-quinze-ans' },
  { requete: 'à quoi sert un différentiel', poids: 'moyen', reponse: 'c-est-quoi-un-differentiel' },
  { requete: 'diagnostic gaz obligatoire', poids: 'moyen', reponse: 'c-est-quoi-le-diagnostic-gaz' },
  { requete: 'danger grave et immédiat gaz DGI', poids: 'moyen', reponse: 'c-est-quoi-un-dgi-gaz' },
  { requete: 'monoxyde de carbone symptômes', poids: 'fort', reponse: 'le-monoxyde-de-carbone-c-est-quoi' },
  {
    requete: 'prix mise aux normes tableau électrique',
    poids: 'moyen',
    note: 'Intention travaux. On ne chiffre pas : on explique ce qui fait le prix et ce qu’un devis doit contenir.'
  },

  /* ------------------------------------------------------------- amiante */
  { requete: 'diagnostic amiante obligatoire 1997', poids: 'fort', reponse: 'ou-trouve-t-on-de-l-amiante' },
  { requete: 'reconnaître l’amiante', poids: 'fort', reponse: 'comment-savoir-si-c-est-de-l-amiante' },
  { requete: 'amiante toiture fibrociment que faire', poids: 'fort', reponse: 'j-ai-de-l-amiante-que-faire' },
  { requete: 'dalle de sol amiante', poids: 'moyen', reponse: 'ou-trouve-t-on-de-l-amiante' },
  { requete: 'liste A liste B amiante', poids: 'moyen', reponse: 'c-est-quoi-les-listes-a-b-c' },
  { requete: 'repérage amiante avant travaux', poids: 'moyen', reponse: 'amiante-et-travaux' },
  { requete: 'dossier technique amiante DTA', poids: 'moyen', reponse: 'dta-et-dapp' },
  { requete: 'danger amiante santé', poids: 'moyen', reponse: 'c-est-quoi-l-amiante' },
  {
    requete: 'prix désamiantage toiture',
    poids: 'fort',
    note: 'Très demandé. À traiter sans chiffre : ce qui fait le prix, la filière déchets, les qualifications exigées.'
  },
  {
    requete: 'déchetterie amiante où déposer',
    poids: 'moyen',
    note: 'Intention pratique forte, mal traitée sur le marché. Filière, bordereau, protections.'
  },

  /* --------------------------------------------------------------- plomb */
  { requete: 'CREP diagnostic plomb', poids: 'moyen', reponse: 'c-est-quoi-le-crep-plomb' },
  { requete: 'plomb classe 3 travaux obligatoires', poids: 'moyen', reponse: 'j-ai-du-plomb-classe-3' },
  { requete: 'saturnisme enfant', poids: 'moyen', reponse: 'c-est-quoi-le-saturnisme' },
  { requete: 'canalisation en plomb eau potable', poids: 'moyen', reponse: 'le-plomb-dans-l-eau' },

  /* ------------------------------------------------------------ termites */
  { requete: 'diagnostic termites obligatoire', poids: 'moyen', reponse: 'c-est-quoi-le-diagnostic-termites' },
  { requete: 'zone termites carte France', poids: 'moyen', reponse: 'ma-commune-est-elle-en-zone-termites' },
  { requete: 'reconnaître des termites', poids: 'moyen', reponse: 'comment-reconnaitre-des-termites' },
  { requete: 'mérule maison', poids: 'moyen', reponse: 'c-est-quoi-la-merule' },
  { requete: 'traitement termites prix', poids: 'niche', reponse: 'j-ai-des-termites-que-faire' },
  {
    requete: 'état parasitaire diagnostic',
    poids: 'niche',
    note: 'Cité dans le thème termites, mais sans page propre. Le distinguer du diagnostic termites obligatoire.'
  },

  /* -------------------------------------------------------------- risques */
  { requete: 'état des risques et pollutions ERP', poids: 'fort', reponse: 'c-est-quoi-l-etat-des-risques' },
  { requete: 'géorisques mon adresse', poids: 'fort', reponse: 'verifier-les-risques-de-mon-adresse' },
  { requete: 'zone argileuse fissures maison', poids: 'fort', reponse: 'c-est-quoi-le-retrait-gonflement-des-argiles' },
  { requete: 'radon zone 3', poids: 'moyen', reponse: 'c-est-quoi-le-radon' },
  { requete: 'acheter en zone inondable', poids: 'moyen', reponse: 'mon-bien-est-en-zone-inondable' },
  { requete: 'diagnostic bruit aéroport', poids: 'niche', reponse: 'c-est-quoi-le-diagnostic-bruit' },
  {
    requete: 'catastrophe naturelle indemnisation fissures',
    poids: 'fort',
    note: 'Intention voisine, très cherchée. Rester dans notre rôle : ce que dit l’état des risques, pas le conseil en assurance.'
  },

  /* ------------------------------------------------------------- surfaces */
  { requete: 'loi Carrez définition', poids: 'fort', reponse: 'c-est-quoi-la-loi-carrez' },
  { requete: 'calcul surface loi Carrez', poids: 'fort', reponse: 'calculer-sa-surface-carrez-soi-meme' },
  { requete: 'différence surface Carrez et habitable', poids: 'fort', reponse: 'les-trois-surfaces' },
  { requete: 'erreur surface Carrez recours', poids: 'moyen', reponse: 'erreur-de-surface-que-puis-je-reclamer' },
  { requete: 'surface habitable loi Boutin', poids: 'moyen', reponse: 'c-est-quoi-la-surface-habitable' },
  { requete: 'surface Carrez combles 1m80', poids: 'moyen', reponse: 'pourquoi-ma-surface-carrez-est-plus-petite' },

  /* -------------------------------------------------------- assainissement */
  { requete: 'diagnostic assainissement vente', poids: 'moyen', reponse: 'c-est-quoi-le-diagnostic-assainissement' },
  { requete: 'assainissement non conforme qui paie', poids: 'moyen', reponse: 'mon-assainissement-est-non-conforme' },
  { requete: 'SPANC contrôle fosse septique', poids: 'moyen', reponse: 'c-est-quoi-le-diagnostic-assainissement' },

  /* ---------------------------------------------------------- copropriété */
  { requete: 'DTG copropriété', poids: 'moyen', reponse: 'c-est-quoi-le-dtg' },
  { requete: 'plan pluriannuel de travaux PPT', poids: 'moyen', reponse: 'c-est-quoi-le-plan-pluriannuel-de-travaux' },
  { requete: 'carnet d’information du logement', poids: 'niche', reponse: 'c-est-quoi-le-carnet-d-information-du-logement' },
  { requete: 'diagnostics parties communes syndic', poids: 'niche', reponse: 'qui-detient-les-diagnostics-de-l-immeuble' },
  {
    requete: 'charges de copropriété avant achat',
    poids: 'fort',
    note: 'Hors de notre périmètre strict, mais l’intention croise le DTG et le plan de travaux. À traiter par ce qu’on sait lire, pas plus.'
  },

  /* --------------------------------------------------------- lire, après */
  { requete: 'comment lire un diagnostic immobilier', poids: 'moyen', reponse: 'comment-lire-mon-rapport' },
  { requete: 'contester un diagnostic immobilier', poids: 'moyen', reponse: 'contester-un-diagnostic' },
  { requete: 'vice caché après achat recours', poids: 'fort', reponse: 'j-ai-decouvert-un-probleme-apres-l-achat' },
  { requete: 'local non visité diagnostic', poids: 'niche', reponse: 'que-veut-dire-non-visite' },
  { requete: 'erreur dans un diagnostic immobilier', poids: 'niche', reponse: 'mon-rapport-contient-une-erreur' },
  {
    requete: 'responsabilité du diagnostiqueur jurisprudence',
    poids: 'moyen',
    note: 'Intention plus juridique. Ne pas jouer à l’avocat : décrire le mécanisme, renvoyer au notaire.'
  },
  {
    requete: 'diagnostic PEMD avant démolition',
    poids: 'niche',
    note: 'Produits, équipements, matériaux et déchets. Concerne surtout les professionnels : à écrire si on ouvre un volet pro.'
  }
];

/** Les intentions sans réponse écrite : le travail suivant, dans l'ordre. */
export function trous(connues: Set<string>): Intention[] {
  const rang: Record<Poids, number> = { fort: 0, moyen: 1, niche: 2 };
  return INTENTIONS.filter((i) => !i.reponse || !connues.has(i.reponse)).sort(
    (a, b) => rang[a.poids] - rang[b.poids]
  );
}
