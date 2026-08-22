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
}

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

export interface Conseil {
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
    quoi: 'un devis chiffré des anomalies relevées, à obtenir avant de faire une offre'
  },
  gaz: {
    qui: 'Un professionnel du gaz',
    quoi: 'la reprise des anomalies, et l’entretien annuel de la chaudière'
  },
  termites: {
    qui: 'Une entreprise de traitement des termites',
    quoi: 'un traitement curatif, et un contrôle de la charpente et des structures porteuses'
  },
  amiante: {
    qui: 'Une entreprise certifiée amiante',
    quoi: 'toute intervention sur un matériau amianté — ne percez, ne poncez, ne découpez jamais vous-même'
  },
  plomb: {
    qui: 'Une entreprise formée au risque plomb',
    quoi: 'les travaux qui suppriment l’exposition, sans jamais poncer à sec'
  },
  erp: {
    qui: 'Votre assureur',
    quoi: 'ce que couvre votre contrat en cas de catastrophe naturelle, notamment pour le retrait-gonflement des argiles'
  },
  assainissement: {
    qui: 'Le SPANC de la commune, puis une entreprise d’assainissement',
    quoi: 'le chiffrage de la mise en conformité — elle se compte en milliers d’euros'
  },
  carrez: {
    qui: 'Un géomètre-expert ou un diagnostiqueur certifié',
    quoi: 'un nouveau mesurage, si le chiffre annoncé vous paraît douteux'
  },
  dpe: {
    qui: 'Un professionnel de la rénovation énergétique',
    quoi: 'un devis des travaux que le rapport recommande, avant de vous engager sur le prix'
  }
};

/** Le diagnostiqueur : c'est lui qu'on rappelle pour un dossier incomplet. */
const LE_DIAGNOSTIQUEUR: Recours = {
  qui: 'Un diagnostiqueur certifié',
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
      quoi: 'la remise en état puis la remise en service, qui passe par le distributeur — ne rouvrez rien vous-même'
    };
  }
  if (d.type === 'amiante' && aSonder(d)) {
    return {
      qui: 'Un opérateur de repérage certifié',
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
  return {
    diagnostics: parDiagnostic(analyse, points, dates),
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
    const parRang = ORDRE.map((rang) => ({
      rang,
      /* « Le dossier » n'est pas un diagnostic : ses limites sont celles de
         l'ensemble, et l'intertitre doit le dire dans les bons mots. */
      titre:
        origine === 'dossier' && rang === 'reserve'
          ? 'Ce que le dossier ne garantit pas'
          : TITRES[rang],
      points: points[rang].filter((p) => p.origine === origine).map((p) => p.texte)
    })).filter((b) => b.points.length > 0);

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
