/**
 * LE CONSEIL — ce qu'il faut faire, en conséquence des diagnostics.
 *
 * Un dossier de diagnostics ne se lit pas pour savoir : il se lit pour décider.
 * Cette vue-là est la seule du produit qui ne décrit rien — elle ordonne. Et
 * pour ordonner, elle doit d'abord recevoir TOUT ce que le moteur a trouvé.
 *
 * ── Ce qui a motivé ce module ─────────────────────────────────────────────
 *
 * Le conseil était écrit à la main dans `Notaire.svelte`, et il ne connaissait
 * que trois choses : les contrôles du dossier, les anomalies d'électricité et
 * de gaz, et la lettre du DPE. Mesuré le 21/08/2026 : sur les neuf diagnostics
 * que le moteur sait lire, SIX n'arrivaient jamais jusqu'au conseil — amiante,
 * plomb, termites, état des risques, Carrez, assainissement. Chacun calcule
 * pourtant son `aFaire`, phrase par phrase, sourcé au texte. Ces phrases
 * étaient produites, puis jetées à l'affichage.
 *
 * Un logement avec du plomb en classe 3 — donc des travaux imposés par
 * l'article L. 1334-9 du code de la santé publique — n'en disait pas un mot au
 * lecteur qui ouvrait « Le conseil ». C'est exactement le reproche du notaire :
 * une rubrique incomplète est pire qu'absente, parce qu'elle donne l'impression
 * d'avoir tout lu.
 *
 * ── La règle d'écriture, et ses deux exceptions ───────────────────────────
 *
 * RIEN DE CE QUE DIT LE RAPPORT N'EST RÉÉCRIT ICI. Tous les constats et tous
 * les gestes réglementaires viennent mot pour mot du moteur — `aFaire` des
 * diagnostics, `quoiFaire` des contrôles. C'est ce qui garantit qu'une phrase
 * corrigée dans `analyse/plomb.ts` est corrigée dans le conseil au même
 * instant, et qu'aucune règle de droit ne vit à deux endroits.
 *
 * Deux choses sont écrites ici, et il faut le savoir en lisant :
 *
 *  1. **Le geste qui lève un angle mort** (« demandez une trappe de visite »,
 *     « faites dégager les meubles »). Il porte sur l'ACCÈS au logement, jamais
 *     sur son état : il ne conclut rien, il demande à voir. Le motif du rapport
 *     est toujours cité entier avant lui.
 *  2. **Le professionnel à appeler** (électricien, entreprise de traitement des
 *     termites, assureur…). C'est une orientation de métier, pas une règle de
 *     droit : elle n'a donc pas à figurer au référentiel Légifrance, et elle
 *     n'affirme rien sur ce que la loi impose.
 *
 * Aucune des deux n'affirme quoi que ce soit sur le bien. Le jour où l'une
 * commencerait à le faire, elle devrait redescendre dans le moteur, où elle
 * serait mesurée sur le corpus.
 *
 * ── Le rangement, et pourquoi il ne renifle pas le texte ──────────────────
 *
 * Le rang d'un point ne se devine PAS en cherchant des mots dans la phrase. Une
 * sonde sur notre propre prose serait la même erreur que sonder un rapport sans
 * savoir où l'on est : elle marcherait le jour où on l'écrit et mentirait à la
 * première reformulation. Le rang se lit sur des données structurées, que le
 * moteur pose déjà :
 *
 *   - le `genre` du contrôle (périmé, manquant, incohérent, attention) ;
 *   - la `gravite` du diagnostic ;
 *   - pour le gaz, le fait « DGI » lui-même, seul cas où un diagnostic empêche
 *     matériellement d'habiter : l'installation est mise hors service, et sa
 *     remise en service passe par le distributeur.
 *
 * ── Zéro perte ────────────────────────────────────────────────────────────
 *
 * Le contrat de ce module est vérifié par test : la réunion des sections
 * contient exactement toutes les lignes de `aFaire` de tous les diagnostics,
 * plus tous les `quoiFaire` des contrôles. Chaque ligne une fois, aucune de
 * moins. C'est la discipline anti-perte de l'analyse, appliquée à l'affichage.
 */
import { echeance } from './echeance';
import type { Analyse, Diagnostic, TypeDiag } from './modele';
import { REGLEMENT, sourcesDe, type Source } from './reglement/textes';

/**
 * Les quatre temps du conseil, dans l'ordre où l'on s'en occupe.
 *
 * `avant`    — ce qui doit être réglé pour que le rendez-vous ait lieu.
 * `lever`    — les endroits où personne n'est allé, et le geste qui les ouvre.
 * `negocier` — ce qui n'empêche pas de signer, mais qui se chiffre et se
 *              discute avant de faire une offre.
 * `reserve`  — ce que le dossier ne garantit pas, et ce qu'il faut savoir sans
 *              qu'aucune action ne soit due.
 *
 * `lever` vient avant `negocier`, et l'ordre n'est pas cosmétique : on ne
 * négocie pas ce que personne n'a regardé. Une cave fermée n'est pas un défaut
 * — c'est une question sans réponse, et elle se pose avant l'offre.
 */
export type Rang = 'avant' | 'lever' | 'negocier' | 'reserve';

/**
 * À QUI S'ADRESSER — le métier, et ce qu'on lui demande.
 *
 * Ordre d'Aude, diagnostiqueuse : « à chaque fois ça renvoie vers un
 * professionnel spécifique ». Un conseil qui dit « faites chiffrer » sans dire
 * par qui laisse le lecteur devant son moteur de recherche, et c'est là qu'il
 * abandonne. Une anomalie électrique appelle un électricien, des termites une
 * entreprise de traitement, un doute amiante un prélèvement, un sol argileux
 * son assureur.
 *
 * Le métier se déduit du DIAGNOSTIC et de son état — jamais du texte d'une
 * phrase. C'est une table, elle se lit, et elle se teste.
 */
export interface Recours {
  /** Le métier, tel qu'on le demande au téléphone. */
  qui: string;
  /** Ce qu'on lui demande, en une phrase. */
  quoi: string;
  /**
   * Le même métier en groupe nominal minuscule — « un électricien ».
   *
   * Il sert à composer la ligne d'ouverture de la carte : « Faites chiffrer par
   * un électricien ». Le tirer de `qui` en abaissant la première lettre marche
   * pour « Un électricien » et échoue sur « Le SPANC de la commune ». On l'écrit
   * plutôt que de le deviner.
   */
  appel: string;
}

/**
 * LE NIVEAU DE RECOMMANDATION — §7 de l'ordre de mission.
 *
 * « Le langage doit refléter exactement le niveau de certitude disponible »
 * (§18). Un rapport qui relève des anomalies électriques ne permet pas d'écrire
 * « intervention nécessaire » ; un gaz mis hors service, si.
 *
 * `urgence` est le seul niveau qui affirme un risque immédiat, et il est réservé
 * au cas où le rapport lui-même met l'installation hors service. Les quatre
 * autres décroissent en engagement, et aucun ne conclut à la place du rapport.
 */
export type Niveau = 'urgence' | 'necessaire' | 'controle' | 'envisager';

export interface PointConseil {
  /** Le geste, dans les mots du moteur — jamais reformulé ici. */
  texte: string;
  /** De quel diagnostic il découle, ou du dossier lui-même. */
  origine: TypeDiag | 'dossier';
  /** Le nom affiché de cette origine, pour que le lecteur sache d'où ça sort. */
  provenance: string;
  /** Le professionnel que ce point-là appelle, quand il en appelle un. */
  recours?: Recours;
}

/**
 * Un temps du conseil, à l'intérieur d'un diagnostic.
 *
 * Les rangs ne sont plus des sections qui traversent le dossier : ils sont des
 * intertitres sous chaque diagnostic. Le lecteur ouvre « Plomb » et voit ce
 * qu'il faut en faire, dans l'ordre où il faut s'en occuper — plutôt que de
 * devoir ramasser le plomb dans trois sections différentes.
 */
export interface BlocConseil {
  rang: Rang;
  /** L'intertitre, à hauteur d'un seul diagnostic. */
  titre: string;
  points: string[];
  /**
   * Le métier de CE temps-là, qui n'est pas toujours celui du diagnostic.
   *
   * Une installation électrique peut appeler deux professionnels dans le même
   * dossier : le diagnostiqueur, pour revenir voir la cave qu'il n'a pas pu
   * ouvrir, et l'électricien, pour chiffrer les anomalies. Porter un seul
   * métier au diagnostic entier faisait recommander le diagnostiqueur sous cinq
   * points dont quatre étaient des anomalies à chiffrer.
   */
  recours?: Recours;
}

/**
 * LE CONSEIL D'UN DIAGNOSTIC — tout ce qu'il faut en faire, au même endroit.
 *
 * Ordre d'Aude (21/08/2026) : « dans le conseil tu fais un bandeau avec les
 * diags et le conseil par diag ». Le conseil était rangé par temps — ce qui se
 * règle avant, ce qui se négocie, ce qu'on ne garantit pas —, et un même
 * rapport parlait donc dans trois blocs éloignés. Pour savoir ce qu'implique le
 * plomb, il fallait le chercher trois fois.
 */
export interface ConseilDiag {
  /** `dossier` porte ce qui ne relève d'aucun rapport : contrôles, limites. */
  origine: TypeDiag | 'dossier';
  titre: string;
  blocs: BlocConseil[];
  /** Le professionnel à appeler pour ce diagnostic-là. */
  recours?: Recours;
  /** Jusqu'à quand ce rapport vaut. Absent pour « Le dossier ». */
  echeance?: Echeancier;
  /**
   * Les textes qui fondent ces gestes, avec leur lien Légifrance et leur date
   * de lecture. Ils viennent du référentiel vérifié, jamais d'ici.
   */
  sources: Source[];
}

/** Une date qui court, et à partir de quand elle ne couvre plus rien. */
export interface Echeancier {
  type: TypeDiag;
  titre: string;
  /** « Valable jusqu'au 14/09/2026 », « Périmé depuis le… », « Sans limite ». */
  texte: string;
  perimee: boolean;
}

/**
 * CE QUI BLOQUE LE RENDEZ-VOUS, TOUS RAPPORTS CONFONDUS.
 *
 * Ranger le conseil par diagnostic a coûté une chose, et il faut la rendre :
 * la lecture transversale. « À régulariser avant la signature » réunissait en
 * un seul endroit tout ce qui fait repousser un rendez-vous — c'est la question
 * du notaire, et elle ne se pose pas rapport par rapport. Il fallait désormais
 * parcourir huit blocs pour la reconstituer.
 *
 * Ce relevé la rend, sans dupliquer le conseil : les lignes du rang `avant`,
 * chacune avec le diagnostic dont elle vient, et un lien vers son bloc. Rien
 * d'autre n'y entre — un rappel qui grossit redevient une section.
 */
export interface ARegler {
  origine: TypeDiag | 'dossier';
  /** Le diagnostic d'où vient la ligne, pour y aller d'un clic. */
  provenance: string;
  texte: string;
}

/**
 * UNE CARTE DE CONSEIL — §4 de l'ordre de mission.
 *
 * « Pictogramme + domaine + niveau de recommandation + conseil + professionnel
 * recommandé + intérêt potentiel. »
 *
 * Une carte n'existe QUE s'il y a quelque chose à faire (§2). Un diagnostic
 * sain n'en produit pas : ce qu'il ne garantit pas part dans les réserves, en
 * fin de page et replié — le §3 interdit d'en faire une seconde synthèse du
 * diagnostic, et le §20 interdit les cartes affichées par défaut.
 *
 * Un métier = une carte (§12) : cinq anomalies électriques donnent une carte
 * Électricité qui dit « 5 points relevés », pas cinq cartes.
 */
export interface Carte {
  /** Identifiant stable, pour l'ancrage et le pli. */
  cle: string;
  /** Le diagnostic d'où elle vient, pour renvoyer vers sa micro-application. */
  origine: TypeDiag | 'dossier';
  /** Le domaine, tel qu'il s'affiche en tête de carte. */
  domaine: string;
  niveau: Niveau;
  /** L'affichage initial : une ligne, et rien d'autre (§123). */
  conseil: string;
  /** Combien de points du rapport la justifient (§142). */
  combien: number;
  /** Le « Pourquoi ? » (§128) : les gestes du moteur, entiers. */
  pourquoi: string[];
  /** Le professionnel recommandé (§9). */
  recours: Recours;
  /** Jusqu'à quand le rapport qui la justifie reste valable. */
  echeance?: Echeancier;
  sources: Source[];
}

/**
 * Ce qu'un diagnostic ne garantit pas — replié, et jamais une carte.
 *
 * ⚠️ Ces lignes ne peuvent pas disparaître, et ce n'est pas un choix de
 * confort : vérifié le 22/08/2026, la fiche générique `Diagnostics.svelte`
 * DÉCLARE une étape « Ce qu'il faut faire » mais ne rend jamais `aFaire`. Seuls
 * les deux écrans neufs — `EcranDpe`, `Termites` — l'affichent. Pour les sept
 * autres diagnostics, le conseil est le seul endroit du produit où ces phrases
 * existent. Les retirer d'ici les retirerait de partout.
 */
export interface Reserve {
  domaine: string;
  points: string[];
}

export interface Conseil {
  /** Les cartes, dans l'ordre d'urgence. Vides si rien n'est à faire. */
  cartes: Carte[];
  /** Ce que les diagnostics ne garantissent pas, replié en fin de page. */
  reserves: Reserve[];
  /** Un bloc par diagnostic du dossier, plus « Le dossier » lui-même. */
  diagnostics: ConseilDiag[];
  /** Ce qui empêche le rendez-vous d'avoir lieu, réuni. Vide s'il n'y a rien. */
  aRegler: ARegler[];
  /** Ce qui périme, dans l'ordre : le calendrier du dossier. */
  calendrier: Echeancier[];
}

/**
 * Les intertitres, sous chaque diagnostic.
 *
 * ── « PAS OBLIGATOIRE » N'EST PAS « RIEN À FAIRE » ─────────────────────────
 *
 * Le rang `negocier` s'annonçait « À chiffrer, puis à négocier ». Correction
 * d'Aude, diagnostiqueuse (21/08/2026) : « même si c'est pas obligatoire, ça va
 * être une marge de négo ». La nuance est tout le sujet — un acquéreur qui lit
 * « aucun texte n'oblige le vendeur à réparer » en conclut qu'il n'y a rien à
 * en tirer, alors que c'est exactement l'inverse : ce qui n'est pas imposé au
 * vendeur devient un chiffre à discuter. L'intertitre le dit maintenant
 * lui-même, au lieu de le laisser à un chapeau que personne ne lit.
 */
const TITRES: Record<Rang, string> = {
  avant: 'À régulariser avant la signature',
  lever: 'À faire lever avant de vous décider',
  negocier: 'Pas obligatoire — mais c’est votre marge de négociation',
  reserve: 'Ce que ce diagnostic ne garantit pas'
};

/** L'ordre des temps sous un diagnostic : on ne négocie pas ce qu'on ignore. */
const ORDRE: Rang[] = ['avant', 'lever', 'negocier', 'reserve'];

/**
 * Le métier à appeler, diagnostic par diagnostic.
 *
 * Ce sont des orientations professionnelles, pas des règles de droit : dire
 * « appelez un électricien » n'affirme rien sur ce que la loi impose, et n'a
 * donc pas à figurer au référentiel. Ce qui relève du droit — les travaux
 * imposés, les délais — reste dans les gestes du moteur, sourcé au texte.
 */
const RECOURS: Partial<Record<TypeDiag, Recours>> = {
  electricite: {
    qui: 'Un électricien',
    appel: 'un électricien',
    quoi: 'un devis chiffré des anomalies relevées, à obtenir avant de faire une offre'
  },
  gaz: {
    qui: 'Un professionnel du gaz',
    appel: 'un professionnel du gaz',
    quoi: 'la reprise des anomalies, et l’entretien annuel de la chaudière'
  },
  termites: {
    qui: 'Une entreprise de traitement des termites',
    appel: 'une entreprise de traitement des termites',
    quoi: 'un traitement curatif, et un contrôle de la charpente et des structures porteuses'
  },
  amiante: {
    qui: 'Une entreprise certifiée amiante',
    appel: 'une entreprise certifiée amiante',
    quoi: 'toute intervention sur un matériau amianté — ne percez, ne poncez, ne découpez jamais vous-même'
  },
  plomb: {
    qui: 'Une entreprise formée au risque plomb',
    appel: 'une entreprise formée au risque plomb',
    quoi: 'les travaux qui suppriment l’exposition, sans jamais poncer à sec'
  },
  erp: {
    qui: 'Votre assureur',
    appel: 'votre assureur',
    quoi: 'ce que couvre votre contrat en cas de catastrophe naturelle, notamment pour le retrait-gonflement des argiles'
  },
  assainissement: {
    qui: 'Le SPANC de la commune, puis une entreprise d’assainissement',
    appel: 'le SPANC de la commune',
    quoi: 'le chiffrage de la mise en conformité — elle se compte en milliers d’euros'
  },
  carrez: {
    qui: 'Un géomètre-expert ou un diagnostiqueur certifié',
    appel: 'un géomètre-expert',
    quoi: 'un nouveau mesurage, si le chiffre annoncé vous paraît douteux'
  },
  dpe: {
    qui: 'Un professionnel de la rénovation énergétique',
    appel: 'un professionnel de la rénovation énergétique',
    quoi: 'un devis des travaux que le rapport recommande, avant de vous engager sur le prix'
  }
};

/**
 * LES MÉTIERS PAR LOT DE TRAVAUX — §5 de l'ordre de mission, et sa seule
 * source honnête à ce jour.
 *
 * Le §5 énumère trente-cinq pôles : charpente, couverture, façade, maçonnerie,
 * fissures, humidité, zinguerie, corrosion, piscine… Le moteur n'en lit AUCUN
 * aujourd'hui — il lit neuf diagnostics, pas des désordres de bâtiment. Poser
 * la table entière reviendrait à recommander des métiers au hasard, ce que le
 * §18 interdit en toutes lettres.
 *
 * Un seul de ces pôles a une matière réelle : les travaux que le DPE
 * RECOMMANDE, poste par poste. `analyse/reco.ts` en lit le lot dans les mots du
 * rapport — « Murs », « Menuiseries », « Ventilation », « Chauffage » — et le
 * §69 demande précisément ces métiers-là. On les branche, et eux seuls.
 *
 * La table est extensible comme le veut le §80 : le jour où le moteur saura
 * lire une charpente ou une fissure, une ligne s'ajoute ici et la carte
 * apparaît. Tant qu'il ne sait pas, elle n'apparaît pas.
 */
const METIERS_PAR_LOT: { motif: RegExp; recours: Recours }[] = [
  {
    motif: /mur|plancher|comble|toiture|isolation/i,
    recours: {
      qui: 'Une entreprise d’isolation',
      appel: 'une entreprise d’isolation',
      quoi: 'un devis du poste d’isolation que le rapport recommande'
    }
  },
  {
    motif: /menuiserie|fen[êe]tre|vitrage|porte/i,
    recours: {
      qui: 'Un menuisier',
      appel: 'un menuisier',
      quoi: 'un devis du remplacement des menuiseries que le rapport recommande'
    }
  },
  {
    motif: /ventilation|vmc/i,
    recours: {
      qui: 'Un professionnel de la ventilation',
      appel: 'un professionnel de la ventilation',
      quoi: 'un devis de la ventilation que le rapport recommande — elle conditionne la santé du bâti'
    }
  },
  {
    motif: /chauffage|chaudi[èe]re|[ée]metteur|r[ée]gulation|pompe [àa] chaleur/i,
    recours: {
      qui: 'Un chauffagiste',
      appel: 'un chauffagiste',
      quoi: 'un devis du poste de chauffage que le rapport recommande'
    }
  },
  {
    motif: /eau chaude|ecs|ballon|solaire|photovolta/i,
    recours: {
      qui: 'Un professionnel de l’eau chaude et des énergies renouvelables',
      appel: 'un professionnel de l’eau chaude sanitaire',
      quoi: 'un devis du poste d’eau chaude que le rapport recommande'
    }
  }
];

/** Le diagnostiqueur : c'est lui qu'on rappelle pour un dossier incomplet. */
const LE_DIAGNOSTIQUEUR: Recours = {
  qui: 'Un diagnostiqueur certifié',
  appel: 'un diagnostiqueur certifié',
  quoi: 'refaire le diagnostic périmé, établir celui qui manque, ou revenir compléter ce qu’il n’a pas pu voir'
};

/**
 * Le recours d'un groupe, selon le diagnostic et son état.
 *
 * Deux situations sortent de la table, parce que le métier change avec l'état :
 * un gaz mis hors service ne se répare pas comme une anomalie ordinaire — la
 * remise en service passe par le distributeur —, et un amiante qu'il faut
 * SONDER appelle un opérateur de repérage, pas une entreprise de retrait.
 */
function recoursDe(d: Diagnostic): Recours | undefined {
  if (gazHorsService(d)) {
    return {
      qui: 'Un professionnel du gaz',
      appel: 'un professionnel du gaz',
      quoi: 'la remise en état puis la remise en service, qui passe par le distributeur — ne rouvrez rien vous-même'
    };
  }
  if (d.type === 'amiante' && aSonder(d)) {
    return {
      qui: 'Un opérateur de repérage certifié',
      appel: 'un opérateur de repérage certifié',
      quoi: 'un prélèvement des matériaux douteux, avec analyse en laboratoire accrédité'
    };
  }
  return RECOURS[d.type];
}

/** Le rapport amiante réclame lui-même un prélèvement sur certains matériaux. */
function aSonder(d: Diagnostic): boolean {
  return (d.releves ?? []).some((r) => r.genre === 'nonVerifie');
}

/**
 * Le gaz mis hors service : le seul diagnostic qui bloque par lui-même.
 *
 * On lit le fait, pas la phrase. `securite.ts` pose « DGI : oui » dans les faits
 * quand le rapport le coche, et fait passer la gravité à `alerte` dans ce cas et
 * dans celui-là seulement. Les deux se confirment l'un l'autre ; on demande le
 * fait d'abord, parce qu'il est explicite.
 */
function gazHorsService(d: Diagnostic): boolean {
  if (d.type !== 'gaz') return false;
  const dgi = d.faits.find((f) => /^DGI$/i.test(f.libelle.trim()));
  if (dgi) return /oui/i.test(dgi.valeur);
  return d.gravite === 'alerte';
}

/**
 * Où va ce que dit un diagnostic.
 *
 * Une alerte ou une attention se chiffrent et se discutent ; un diagnostic sain
 * ou muet ne demande rien mais dit ce qu'il ne couvre pas. Le gaz hors service
 * remonte d'un cran : il ne se négocie pas.
 */
function rangDuDiagnostic(d: Diagnostic): Rang {
  if (gazHorsService(d)) return 'avant';
  return d.gravite === 'alerte' || d.gravite === 'attention' ? 'negocier' : 'reserve';
}

/**
 * Les limites communes à tous les repérages, dites une fois.
 *
 * Elles ne sortent d'aucun rapport en particulier : elles décrivent ce qu'est un
 * diagnostic visuel. Un lecteur qui les ignore croit avoir acheté une garantie ;
 * il a acheté un constat de ce qui était visible ce jour-là.
 */
const LIMITES: string[] = [
  'Ces diagnostics portent sur ce qui était visible le jour de la visite, sans démontage.',
  'Ce qui est fermé, encombré ou inaccessible n’a pas été contrôlé.'
];

/**
 * LE GESTE QUI LÈVE UN ANGLE MORT.
 *
 * Ordre d'Aude : « on prend tout ce qui n'a pas été visité et on préconise —
 * trappe d'accès, ou enlever les meubles, ou actualiser les diags, ou remettre
 * l'électricité en route ».
 *
 * ── Pourquoi cette table-ci n'est pas une sonde de plus ────────────────────
 *
 * Elle lit le MOTIF que le rapport donne, et rien d'autre. Ce vocabulaire n'est
 * pas deviné : c'est celui que `analyse/anomalies.ts` a mesuré sur le corpus
 * pour distinguer un vrai empêchement d'une ligne de tableau — trappe,
 * encombré, meublé, occupé, fermé, condamné, inaccessible, sans accès. On s'en
 * sert ici pour la question inverse : non plus « est-ce un empêchement ? »,
 * mais « comment on l'ouvre ? ».
 *
 * ── Ce qu'un mauvais appariement coûte ─────────────────────────────────────
 *
 * Rien de grave, et c'est voulu : le geste porte sur l'ACCÈS, jamais sur le
 * logement. Confondre une porte fermée à clé et une trappe absente fait
 * proposer « demandez la clé » au lieu de « demandez une trappe » — une gêne,
 * pas une erreur de diagnostic. Et quand aucun motif n'est reconnu, le défaut
 * ne bluffe pas : il redit la phrase du rapport et renvoie au diagnostiqueur.
 *
 * Le motif du rapport est TOUJOURS cité entier avant le geste. On ne remplace
 * pas ses mots par les nôtres — on les explique.
 */
const GESTES: { motif: RegExp; geste: string }[] = [
  {
    motif: /trappe/i,
    geste:
      'Demandez la pose d’une trappe de visite, ou l’ouverture de l’accès, puis faites revenir le diagnostiqueur compléter son rapport.'
  },
  {
    motif: /encombr|meubl|stock|occup[ée]/i,
    geste:
      'Faites dégager les lieux — meubles, cartons, stockage — et demandez une nouvelle visite sur cette partie.'
  },
  {
    motif: /ferm[ée]|verrouill|condamn|scell|cl[ée]s?\b|pas d[’']acc|sans acc/i,
    geste:
      'Demandez la clé ou l’ouverture au vendeur, puis faites revenir le diagnostiqueur : une pièce fermée reste une pièce inconnue.'
  },
  {
    motif: /hauteur|inaccessible|non accessible|toiture|combles/i,
    geste:
      'Demandez les moyens d’accès nécessaires — échelle, nacelle, désencombrement — et faites compléter le rapport.'
  },
  {
    motif: /aliment|tension|coup[ée]|compteur|[ée]lectricit[ée]|arr[êe]t/i,
    geste:
      'Faites remettre l’installation en route, puis exigez que l’essai soit refait : sans alimentation, le contrôle n’a pas eu lieu.'
  },
  {
    motif: /rev[êe]tement|fix[ée]|investigation|pr[ée]l[èe]vement|sonder|analyse/i,
    geste:
      'Ce point ne se tranche qu’au prélèvement : faites intervenir un opérateur certifié, avec analyse en laboratoire accrédité.'
  }
];

/** Le geste par défaut : il n'invente rien et renvoie à celui qui sait. */
const GESTE_PAR_DEFAUT =
  'Faites lever ce point avant de vous décider : demandez l’accès au vendeur, ou faites compléter le rapport par le diagnostiqueur.';

function gestePour(motif: string): string {
  return GESTES.find((g) => g.motif.test(motif))?.geste ?? GESTE_PAR_DEFAUT;
}

/**
 * TOUT CE QUI N'A PAS ÉTÉ VU, avec le geste qui l'ouvre.
 *
 * Trois sources, toutes structurées — jamais du texte libre :
 *
 *  1. les relevés de genre `nonVisite` et `nonVerifie`, que chaque lecteur pose
 *     un par un (une cave sans trappe, un matériau à sonder) ;
 *  2. le fait « Points non vérifiés » de l'électricité, qui porte leur nombre et
 *     le motif commun — le plus souvent une installation non alimentée ;
 *  3. le fait « Mesure du monoxyde de carbone : non réalisée » du gaz, qui est
 *     l'essai le plus important du diagnostic et celui qu'on manque le plus.
 *
 * Ce ne sont pas des défauts, et la section le dit. Mais chacun se paie : une
 * cave qu'on n'a pas vue est une cave qu'on achète sans savoir.
 */
function anglesMorts(analyse: Analyse): PointConseil[] {
  const points: PointConseil[] = [];

  for (const d of analyse.diagnostics) {
    /*
     * QUI LÈVE UN ANGLE MORT — et ce n'est pas l'artisan du diagnostic.
     *
     * Un électricien ne peut pas dire ce qu'il y a dans une cave qu'il n'a pas
     * vue : seul celui qui n'a pas pu voir peut revenir voir. Proposer ici le
     * métier de la réparation ferait chiffrer des travaux avant même de savoir
     * s'il y en a — l'inverse de ce que dit la section.
     *
     * Une seule exception, et le rapport la demande lui-même : un matériau
     * qu'il faut SONDER ne se tranche qu'au prélèvement, par un opérateur de
     * repérage certifié.
     */
    const recours: Recours =
      (d.type === 'amiante' && aSonder(d) ? recoursDe(d) : undefined) ?? LE_DIAGNOSTIQUEUR;
    for (const r of d.releves ?? []) {
      if (r.genre !== 'nonVisite' && r.genre !== 'nonVerifie') continue;
      /* Les mots du rapport d'abord, entiers ; l'explication ensuite. */
      const ou = r.ou ? `${r.ou} — ` : '';
      points.push({
        texte: `${ou}${r.libelle}. ${gestePour(`${r.libelle} ${r.ou ?? ''}`)}`,
        origine: d.type,
        provenance: d.titre,
        recours
      });
    }

    const nonVerifies = d.faits.find((f) => /^Points non v[ée]rifi[ée]s$/i.test(f.libelle.trim()));
    if (nonVerifies) {
      const n = Number.parseInt(nonVerifies.valeur, 10);
      const combien = Number.isFinite(n) && n > 1 ? `${n} points de contrôle` : 'Un point de contrôle';
      const motif = nonVerifies.precision ?? '';
      points.push({
        texte: `${combien} n’${n > 1 ? 'ont' : 'a'} pas pu être vérifié${n > 1 ? 's' : ''}${motif ? ` — ${motif}` : ''}. ${gestePour(motif)}`,
        origine: d.type,
        provenance: d.titre,
        recours
      });
    }

    const co = d.faits.find((f) => /monoxyde de carbone/i.test(f.libelle));
    if (co && /non r[ée]alis/i.test(co.valeur)) {
      const motif = co.precision ?? '';
      points.push({
        texte: `La mesure du monoxyde de carbone n’a pas été réalisée${motif ? ` — ${motif}` : ''}. C’est l’essai qui protège des intoxications : faites-le refaire, appareil en marche, avant de vous engager.`,
        origine: d.type,
        provenance: d.titre
      });
    }
  }

  return points;
}

/**
 * Le conseil complet, à partir de l'analyse — et de rien d'autre.
 *
 * `aujourdhui` n'entre que dans le calendrier : il décide si une date est
 * passée. Il est injecté pour que les tests ne dépendent pas du jour où on les
 * lance.
 */
export function conseil(analyse: Analyse, aujourdhui: Date = new Date()): Conseil {
  const points: Record<Rang, PointConseil[]> = { avant: [], lever: [], negocier: [], reserve: [] };

  /*
   * Les contrôles du dossier d'abord : un rapport périmé, absent, ou deux
   * chiffres qui ne concordent pas se règlent AVANT le rendez-vous, quelle que
   * soit la qualité du logement. C'est ce qui fait repousser une signature.
   */
  for (const c of analyse.controles) {
    const rang: Rang = c.genre === 'attention' ? 'reserve' : 'avant';
    points[rang].push({
      texte: `${c.titre} — ${c.quoiFaire}`,
      origine: c.type ?? 'dossier',
      provenance: c.type ? titreDe(analyse, c.type) : 'Le dossier',
      /* Un rapport périmé ou absent se refait : c'est le diagnostiqueur, et lui
         seul. Sauf en réserve, où il n'y a rien à faire faire. */
      ...(rang === 'avant' ? { recours: LE_DIAGNOSTIQUEUR } : {})
    });
  }

  /*
   * Puis chaque diagnostic, sans exception et sans tri : les neuf que le moteur
   * sait lire arrivent ici avec leurs phrases entières. C'est le point de départ
   * de ce module — six d'entre eux n'y arrivaient pas.
   */
  for (const d of analyse.diagnostics) {
    const rang = rangDuDiagnostic(d);
    /*
     * Le métier ne s'affiche que là où il y a quelque chose à lui demander.
     * Sur « ce que le dossier ne garantit pas », il n'y a rien à faire faire :
     * proposer un artisan sous une ligne qui dit « aucun travail n'est imposé »
     * ferait vendre une prestation inutile.
     */
    const recours = rang === 'reserve' ? undefined : recoursDe(d);
    for (const texte of d.aFaire) {
      points[rang].push({
        texte,
        origine: d.type,
        provenance: d.titre,
        ...(recours ? { recours } : {})
      });
    }
  }

  /*
   * Les conclusions que le moteur n'a pas su lire.
   *
   * Elles ne produisent aucun `aFaire` — par construction : on ne conseille
   * rien sur ce qu'on n'a pas lu. Mais le lecteur doit savoir qu'il reste des
   * pages à ouvrir lui-même, sans quoi il croit que le silence vaut « rien à
   * signaler ». C'est le seul endroit où cette vue compte quelque chose.
   */
  const muets = analyse.diagnostics.filter((d) => d.gravite === 'neutre');
  if (muets.length) {
    const s = muets.length > 1;
    points.reserve.push({
      texte: `${muets.length} conclusion${s ? 's' : ''} n’${s ? 'ont' : 'a'} pas pu être lue${s ? 's' : ''} automatiquement : à relire sur le rapport signé.`,
      origine: 'dossier',
      provenance: 'Le dossier'
    });
  }

  /*
   * Tout ce que personne n'est allé voir, avec le geste qui l'ouvre. C'est la
   * section la plus utile du conseil et celle qui n'existait pas : ces points
   * vivaient dans le détail de chaque diagnostic, où il fallait aller les
   * chercher rapport par rapport.
   */
  for (const point of anglesMorts(analyse)) {
    points.lever.push(point);
  }

  /* Les limites du geste de diagnostic ferment la dernière section. */
  for (const texte of LIMITES) {
    points.reserve.push({ texte, origine: 'dossier', provenance: 'Le dossier' });
  }

  const dates = calendrier(analyse, aujourdhui);
  const blocs = parDiagnostic(analyse, points, dates);
  return {
    cartes: cartes(blocs, analyse),
    reserves: reserves(blocs),
    diagnostics: blocs,
    aRegler: points.avant.map((p) => ({
      origine: p.origine,
      provenance: p.provenance,
      texte: p.texte
    })),
    calendrier: dates
  };
}

/**
 * LE PIVOT : de « par temps » à « par diagnostic ».
 *
 * Tout ce qui précède range les gestes par rang, parce que c'est le rang qui se
 * calcule. Ici on retourne le tableau : un bloc par rapport, et sous chacun ses
 * temps dans l'ordre. Le lecteur qui ouvre « Plomb » voit tout le plomb.
 *
 * L'ordre des blocs suit celui du dossier — le même que la grille d'accueil et
 * que le bandeau. Trier par gravité ferait dire trois ordres différents à trois
 * écrans qui montrent les mêmes tuiles.
 *
 * « Le dossier » ferme la marche : ses points ne parlent d'aucun rapport en
 * particulier — les contrôles sans type, les conclusions illisibles, les
 * limites du geste de diagnostic.
 */
function parDiagnostic(
  analyse: Analyse,
  points: Record<Rang, PointConseil[]>,
  dates: Echeancier[]
): ConseilDiag[] {
  /*
   * L'ordre part des diagnostics du dossier — mais il ne s'y arrête pas.
   *
   * Un contrôle peut viser un rapport ABSENT : « DPE absent — réclamez-le au
   * vendeur » porte le type `dpe`, alors qu'aucun DPE n'est au dossier. Bâtir
   * l'ordre sur les seuls diagnostics présents faisait donc disparaître
   * exactement ce que le conseil doit crier le plus fort : ce qui manque. Trouvé
   * par le test du recours au diagnostiqueur, pas à la lecture.
   */
  const vus = new Set<TypeDiag | 'dossier'>();
  const ordre: (TypeDiag | 'dossier')[] = [];
  for (const d of analyse.diagnostics) {
    if (vus.has(d.type)) continue;
    vus.add(d.type);
    ordre.push(d.type);
  }
  for (const rang of ORDRE) {
    for (const p of points[rang]) {
      if (p.origine === 'dossier' || vus.has(p.origine)) continue;
      vus.add(p.origine);
      ordre.push(p.origine);
    }
  }
  ordre.push('dossier');

  const blocs: ConseilDiag[] = [];

  for (const origine of ordre) {
    const parRang = ORDRE.map((rang) => {
      const siens = points[rang].filter((p) => p.origine === origine);
      const recours = siens.find((p) => p.recours)?.recours;
      return {
        rang,
        /* « Le dossier » n'est pas un diagnostic : ses limites sont celles de
           l'ensemble, et l'intertitre doit le dire dans les bons mots. */
        titre:
          origine === 'dossier' && rang === 'reserve'
            ? 'Ce que le dossier ne garantit pas'
            : TITRES[rang],
        points: siens.map((p) => p.texte),
        ...(recours ? { recours } : {})
      };
    }).filter((b) => b.points.length > 0);

    if (!parRang.length) continue;

    /* Le premier point qui nomme un métier le donne au diagnostic entier. */
    const recours = ORDRE.flatMap((rang) => points[rang])
      .filter((p) => p.origine === origine)
      .find((p) => p.recours)?.recours;

    const echeance = dates.find((e) => e.type === origine);

    blocs.push({
      origine,
      titre:
        origine === 'dossier'
          ? 'Le dossier'
          : (analyse.diagnostics.find((d) => d.type === origine)?.titre ?? titreDe(analyse, origine)),
      blocs: parRang,
      ...(recours ? { recours } : {}),
      ...(echeance ? { echeance } : {}),
      sources: origine === 'dossier' ? [] : sourcesDes(new Set([origine]))
    });
  }

  return blocs;
}

/** Tous les gestes d'un conseil, à plat — pour l'annexe des mots employés. */
export function tousLesPoints(conseil: Conseil): string[] {
  return conseil.diagnostics.flatMap((d) => d.blocs.flatMap((b) => b.points));
}

/**
 * Le niveau que porte un temps du conseil.
 *
 * `urgence` ne sort que du gaz mis hors service : c'est le seul cas où le
 * rapport lui-même établit un risque immédiat, en coupant l'installation. Le
 * reste décroît sans jamais conclure à la place du rapport — un contrôle
 * complémentaire pour un angle mort, une intervention à envisager pour ce qui
 * se chiffre.
 */
function niveauDe(rang: Rang, urgent: boolean): Niveau | null {
  if (rang === 'avant') return urgent ? 'urgence' : 'necessaire';
  if (rang === 'lever') return 'controle';
  if (rang === 'negocier') return 'envisager';
  return null; // `reserve` ne fait pas de carte : il n'y a rien à faire.
}

/**
 * La ligne d'ouverture d'une carte — la seule chose visible avant le clic.
 *
 * Elle se compose du niveau et du métier, jamais du contenu du rapport : c'est
 * une orientation, et le §3 interdit de refaire ici la synthèse du diagnostic.
 * Le détail attend derrière « Pourquoi ? ».
 */
const OUVERTURE: Record<Niveau, (appel: string) => string> = {
  urgence: (a) => `Ne rétablissez rien vous-même : faites intervenir ${a} sans attendre.`,
  necessaire: (a) => `Faites intervenir ${a} avant le rendez-vous de signature.`,
  controle: (a) => `Faites lever ce point par ${a} avant de vous décider.`,
  /*
   * « Prenez l'avis » et non « faites chiffrer ».
   *
   * Tous les métiers de cette page ne chiffrent pas : un assureur ne fait pas
   * de devis, et l'écran affichait « Faites chiffrer par votre assureur ». La
   * phrase couvre donc les deux — l'avis pour ceux qui conseillent, le chiffre
   * pour ceux qui interviennent — et garde le levier que le §8 autorise :
   * disposer d'éléments concrets avant de faire une offre.
   */
  envisager: (a) =>
    `Prenez l’avis de ${a}, et faites chiffrer ce qui doit l’être, avant de faire une offre.`
};

/** « Un électricien » → « un électricien », pour l'insérer dans un titre. */
function minuscule(qui: string): string {
  return qui.charAt(0).toLowerCase() + qui.slice(1);
}

/**
 * Les cartes, à partir des blocs par diagnostic — §2, §4 et §12.
 *
 * Un diagnostic peut parler à plusieurs niveaux : l'électricité d'un dossier
 * réel a un angle mort à lever ET des anomalies à chiffrer. Le §12 interdit
 * pourtant deux cartes du même métier. On garde donc le niveau le plus engageant
 * et on réunit les gestes dessous — la carte dit « 5 points relevés », et le
 * « Pourquoi ? » les porte tous.
 */
function cartes(blocs: ConseilDiag[], analyse: Analyse): Carte[] {
  const liste: Carte[] = [];

  for (const bloc of blocs) {
    const urgent = analyse.diagnostics.some((d) => d.type === bloc.origine && gazHorsService(d));

    const aFaire = bloc.blocs
      .map((b) => ({
        niveau: niveauDe(b.rang, urgent),
        points: b.points,
        recours: b.recours ?? bloc.recours
      }))
      .filter(
        (b): b is { niveau: Niveau; points: string[]; recours: Recours } =>
          b.niveau !== null && b.recours !== undefined
      );

    if (!aFaire.length) continue;

    /*
     * UN MÉTIER, UNE CARTE — et deux métiers, deux cartes.
     *
     * Le §12 interdit deux cartes du MÊME métier, pas deux métiers. Une
     * installation électrique qui a une cave non visitée ET des anomalies
     * appelle deux professionnels : le diagnostiqueur pour revenir voir,
     * l'électricien pour chiffrer. Les réunir faisait recommander le
     * diagnostiqueur sous quatre anomalies qui ne le concernent pas.
     */
    const parMetier = new Map<string, { niveau: Niveau; points: string[]; recours: Recours }>();
    const RANGEE: Niveau[] = ['urgence', 'necessaire', 'controle', 'envisager'];

    for (const b of aFaire) {
      const vue = parMetier.get(b.recours.qui);
      if (!vue) {
        parMetier.set(b.recours.qui, { ...b, points: [...b.points] });
        continue;
      }
      vue.points.push(...b.points);
      /* Le niveau le plus engageant commande : on ne range pas une
         installation coupée derrière « à envisager ». */
      if (RANGEE.indexOf(b.niveau) < RANGEE.indexOf(vue.niveau)) vue.niveau = b.niveau;
    }

    for (const [qui, { niveau, points: pourquoi, recours }] of parMetier) {
      liste.push({
        cle: `carte-${bloc.origine}-${qui}`,
        origine: bloc.origine,
        /* Le domaine nomme le métier quand un diagnostic en appelle plusieurs :
           deux cartes « Installation électrique » seraient indiscernables. */
        domaine: parMetier.size > 1 ? `${bloc.titre} — ${minuscule(qui)}` : bloc.titre,
        niveau,
        conseil: OUVERTURE[niveau](recours.appel),
        combien: pourquoi.length,
        pourquoi,
        recours,
        ...(bloc.echeance ? { echeance: bloc.echeance } : {}),
        sources: bloc.sources
      });
    }
  }

  liste.push(...cartesDeTravaux(analyse));

  /* L'ordre de la page est celui de l'urgence, pas celui du dossier : le §189
     demande qu'on sache en dix secondes sur quoi agir. */
  const POIDS: Record<Niveau, number> = { urgence: 0, necessaire: 1, controle: 2, envisager: 3 };
  return liste.sort((a, b) => POIDS[a.niveau] - POIDS[b.niveau]);
}

/**
 * LES MÉTIERS DES TRAVAUX QUE LE DPE RECOMMANDE — §69.
 *
 * C'est le seul endroit du moteur où un LOT DE TRAVAUX est lisible : `reco.ts`
 * relève, dans les mots du rapport, le lot de chaque recommandation — « Murs »,
 * « Menuiseries », « Ventilation ». Le §69 demande exactement ces métiers-là, et
 * le §18 interdit d'en inventer d'autres.
 *
 * Une carte par métier (§12), jamais une par recommandation : un DPE qui
 * recommande d'isoler les murs ET les combles donne UNE carte isolation, qui
 * dit « 2 points relevés ».
 *
 * Ces cartes s'ajoutent à celle du DPE au lieu de la remplacer : l'une porte ce
 * que la classe implique — interdiction de louer, gel du loyer —, les autres
 * portent les travaux. Ce sont deux sujets, et deux métiers.
 */
function cartesDeTravaux(analyse: Analyse): Carte[] {
  const dpe = analyse.diagnostics.find((d) => d.type === 'dpe');
  if (!dpe?.travaux?.length) return [];

  /* Un métier, ses recommandations — dans l'ordre où le rapport les donne. */
  const parMetier = new Map<string, { recours: Recours; points: string[] }>();

  for (const bouquet of dpe.travaux) {
    for (const reco of bouquet.recommandations) {
      const trouve = METIERS_PAR_LOT.find((m) => m.motif.test(reco.lot));
      /* Un lot qu'on ne sait pas rattacher ne recommande personne : le §18
         interdit le métier au hasard, et le rapport reste lisible ailleurs. */
      if (!trouve) continue;

      const entree = parMetier.get(trouve.recours.qui) ?? { recours: trouve.recours, points: [] };
      /* Les mots du rapport, entiers : le lot puis sa description. */
      const texte = `${reco.lot} — ${reco.description}`;
      if (!entree.points.includes(texte)) entree.points.push(texte);
      parMetier.set(trouve.recours.qui, entree);
    }
  }

  return [...parMetier.entries()].map(([qui, { recours, points }]) => ({
    cle: `carte-travaux-${qui}`,
    origine: 'dpe' as const,
    domaine: `Travaux recommandés — ${qui.replace(/^(Un|Une)\s+/i, '')}`,
    /* Le DPE RECOMMANDE : il n'impose rien. « À envisager » est le seul niveau
       que ce document autorise. */
    niveau: 'envisager' as const,
    conseil: `Faites chiffrer par ${recours.appel} les travaux que le rapport recommande.`,
    combien: points.length,
    pourquoi: points,
    recours,
    sources: []
  }));
}

/** Ce qui ne demande rien, mais qui ne doit pas disparaître pour autant. */
function reserves(blocs: ConseilDiag[]): Reserve[] {
  return blocs
    .map((bloc) => ({
      domaine: bloc.titre,
      points: bloc.blocs.filter((b) => b.rang === 'reserve').flatMap((b) => b.points)
    }))
    .filter((r) => r.points.length > 0);
}

/** Le titre affiché d'un diagnostic présent au dossier, sinon son nom au texte. */
function titreDe(analyse: Analyse, type: TypeDiag): string {
  const present = analyse.diagnostics.find((d) => d.type === type);
  if (present) return present.titre;
  return REGLEMENT[type]?.nom ?? 'Le dossier';
}

/**
 * Les articles qui fondent une section, dédoublonnés.
 *
 * Le référentiel `reglement/textes.ts` porte les articles lus à la source,
 * chacun daté. Il n'était affiché nulle part : le produit citait le droit dans
 * ses phrases sans jamais donner le lien qui permet de le vérifier. Une section
 * du conseil qui repose sur l'amiante et le plomb rend donc leurs textes.
 */
function sourcesDes(types: Set<TypeDiag>): Source[] {
  const vues = new Set<string>();
  const liste: Source[] = [];
  for (const type of types) {
    for (const s of sourcesDe(type)) {
      const cle = s.reference + s.url;
      if (vues.has(cle)) continue;
      vues.add(cle);
      liste.push(s);
    }
  }
  return liste;
}

/**
 * Le calendrier du dossier : ce qui périme, et quand.
 *
 * C'est la conséquence la plus concrète d'un dossier de diagnostics, et la plus
 * facile à manquer — un état des risques vaut six mois, un DPE dix ans, et les
 * deux sont dans le même PDF. Les dates ne sont pas recalculées ici : elles
 * viennent de `echeance()`, qui lit d'abord ce que le rapport écrit.
 *
 * L'ordre met les périmés en tête : ce sont eux qui font repousser un
 * rendez-vous, et ce sont eux qu'on emporte chez le notaire.
 */
function calendrier(analyse: Analyse, aujourdhui: Date): Echeancier[] {
  return analyse.diagnostics
    .map((d) => {
      const e = echeance(d, aujourdhui);
      return { type: d.type, titre: d.titre, texte: e.texte, perimee: e.perimee };
    })
    .sort((a, b) => Number(b.perimee) - Number(a.perimee));
}
