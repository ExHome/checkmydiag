/**
 * Le tableau « Domaines | Anomalies | Photo » — la seconde mise en page LICIEL.
 *
 * `anomaliesDetaillees` lit une annexe où chaque anomalie s'ouvre par
 * « Libellé de l'anomalie : ». Tous les rapports n'en ont pas. Neuf volets lus
 * en entier le 21/08/2026 portent leurs anomalies ailleurs : dans le tableau
 * de la rubrique 5, et nulle part ailleurs. Sur ces neuf-là, le moteur ne
 * restituait donc AUCUNE anomalie — treize perdues sur le seul volet le plus
 * chargé. C'est le blocage du §32 de l'ordre de mission électricité.
 *
 * ## Pourquoi ce tableau ne se lit pas ligne à ligne
 *
 * Ses deux premières colonnes s'entrelacent à l'extraction. Le nom du domaine,
 * étroit, se coupe sur cinq ou six lignes, et chaque morceau se retrouve collé
 * devant un morceau de l'anomalie d'à côté :
 *
 *     5. Matériels électriques L'Enveloppe d'au moins un matériel est manquante ou
 *     présentant des risques de détériorée.
 *     contacts directs avec des Remarques : Présence de matériel électrique en place
 *
 * ## Le tour qu'on joue
 *
 * Le catalogue des six domaines est imprimé juste au-dessus du tableau, en
 * toutes lettres, dans TOUS les rapports — c'est même la seule chose qu'il
 * sache faire, puisqu'il est identique d'un bien à l'autre. Il devient donc un
 * dictionnaire : on sait exactement ce que dit la colonne de gauche, donc on
 * peut la retrancher de chaque ligne. Ce qui reste est l'anomalie.
 *
 * La rubrique inutile pour conclure sert à découper. C'est son seul usage.
 */
import type { Anomalie, Pluralite } from '../modele';

const ENTETE = /^\s*Domaines\s+Anomalies/i;

/*
 * Ce qui ferme le tableau — et il ferme plus tôt qu'on ne croit.
 *
 * Sans « Parties du bien » ni « Points de contrôle », la lecture débordait sur
 * les rubriques suivantes et rendait des cartes fausses : « Parties du bien
 * n'ayant pu être visitées : Sous-sol » s'affichait comme une anomalie. Or une
 * pièce non visitée n'est pas un défaut — c'est le contraire même, un trou de
 * contrôle. Le §2 de l'ordre de mission l'interdit en toutes lettres.
 */
const FIN =
  /^\s*(?:Anomalies relatives|Informations compl[ée]mentaires|Domaines\s+Informations|Parties du bien|Points de contr[ôo]le|Nota\s*:|\d\s*[.–-]\s*[–-]?\s*(?:Avertissement|Conclusion|Explications))/i;

const DEBUT_CATALOGUE = /anomalies\s+av[ée]r[ée]es\s+selon\s+les\s+domaines\s+suivants/i;

/**
 * Les mêmes rubriques, mais cherchées PARTOUT dans la ligne.
 *
 * Elles se collent parfois au milieu d'une ligne reconstruite, pas en tête :
 * l'ancre de `FIN` ne les voit alors pas, et la rubrique se soude au libellé de
 * l'anomalie. On tronque donc au marqueur, où qu'il soit.
 */
const RUBRIQUE_SUIVANTE =
  /\s*(?:Parties du bien\b|Points de contr[ôo]le\b|Anomalies relatives\b|Informations compl[ée]mentaires\b|Nota\s*:).*$/i;

/** Les noms courts, ceux que Verrière affiche. */
const NOMS = [
  'Coupure d’urgence',
  'Protection différentielle et mise à la terre',
  'Protection des circuits',
  'Salle d’eau',
  'Contacts directs',
  'Matériel vétuste ou inadapté'
];

const BRUIT =
  /^\s*(?:SARL|RCS|N°SIREN|Rapport du|Etat de l|État de l|Photo|\d+\s*\/\s*\d+\s*$|T[ée]l\.?\s*:)/i;

const compact = (s: string): string => s.replace(/\s+/g, ' ').trim();

/**
 * Le catalogue, lu tel qu'il est imprimé au-dessus du tableau.
 *
 * On rend les six libellés entiers, recollés : ce sont eux qui serviront de
 * dictionnaire. Un rapport qui n'imprimerait pas son catalogue rend une liste
 * vide, et le découpage se fera sans dictionnaire — moins bien, mais sans
 * inventer.
 */
export function catalogueDesDomaines(lignes: string[]): string[] {
  const debut = lignes.findIndex((l) => DEBUT_CATALOGUE.test(l));
  if (debut < 0) return [];

  const libelles: string[] = [];
  let courant = '';

  for (let i = debut + 1; i < lignes.length; i++) {
    const l = compact(lignes[i] ?? '');
    if (!l || BRUIT.test(l)) continue;
    if (ENTETE.test(l) || FIN.test(l)) break;

    courant = courant ? `${courant} ${l}` : l;
    // Un libellé de domaine se termine par un point. La colonne le coupe, mais
    // jamais au milieu d'une phrase déjà close.
    if (/\.\s*$/.test(l)) {
      libelles.push(courant.replace(/\s*\.\s*$/, ''));
      courant = '';
    }
  }
  if (courant) libelles.push(courant);

  return libelles.slice(0, 6);
}

/**
 * Retranche d'une ligne le morceau qui appartient encore au nom du domaine.
 *
 * On avance mot à mot tant que la ligne reprend la suite attendue du titre.
 * Dès qu'un mot ne suit plus, la colonne de gauche est finie : tout le reste
 * est l'anomalie.
 */
function retrancherTitre(ligne: string, reste: string[]): { texte: string; reste: string[] } {
  const mots = compact(ligne).split(' ');
  let i = 0;
  while (i < mots.length && reste.length > 0) {
    const attendu = reste[0]!.toLowerCase().replace(/[.,;]/g, '');
    const vu = mots[i]!.toLowerCase().replace(/[.,;]/g, '');
    if (vu !== attendu) break;
    i++;
    reste = reste.slice(1);
  }
  return { texte: mots.slice(i).join(' '), reste };
}

/** « Au moins un socle… » dit une pluralité indéterminée ; « L'ensemble… » la totalité. */
function pluraliteDe(libelle: string): Pluralite {
  if (/^\s*(?:au moins un|l['’]installation comporte au moins)/i.test(libelle)) return 'auMoinsUn';
  if (/^\s*l['’]ensemble\b/i.test(libelle)) return 'ensemble';
  return 'inconnue';
}

/** Les pièces nommées entre parenthèses, chacune une fois. */
const NOMME_UNE_PIECE =
  /rez[- ]de[- ]chauss|[ée]tage|R\+\d|cuisine|s[ée]jour|chambre|salle (?:de bain|d['’]eau)|salon|cave|garage|entr[ée]e|couloir|combles|d[ée]gagement|buanderie|palier|\bwc\b|toilette|terrasse|balcon|cellier|grenier|sous[- ]sol|mezzanin|tableau/i;

/**
 * Toutes les localisations d'une remarque, séparées et dédoublonnées.
 *
 * Les rapports collent les pièces sans séparateur et les répètent :
 * « (2ème étage - mezzaninne2ème étage - mezzaninne1er étage - Entrée) ». Le
 * §10 de l'ordre exige de les conserver TOUTES, le §32 fait un blocage d'une
 * seule gardée en silence.
 */
export function localisationsDe(remarques: string): string[] {
  const trouvees: string[] = [];

  for (const m of remarques.matchAll(/\(([^()]{3,200})\)/g)) {
    const dedans = compact(m[1] ?? '');
    if (!NOMME_UNE_PIECE.test(dedans)) continue;

    // D'abord la virgule, qui sépare proprement quand le rapport l'emploie.
    for (const bout of dedans.split(/\s*,\s*/)) {
      // Puis le recollage sans séparateur : un niveau qui recommence signale
      // une nouvelle pièce. On coupe devant, sans rien perdre.
      /* Le marqueur doit être un caractère qui n'existe pas dans le texte :
         couper sur une espace puis découper sur les espaces rendait « R+2 -
         Cuisine » en trois morceaux. */
      const coupe = bout.replace(
        /(?<=[a-zé])(?=(?:\d+(?:er|ème|e)?\s*étage|R\+\d|Rez[- ]de[- ]chauss|Sous[- ]sol))/gi,
        ''
      );
      for (const p of coupe.split('')) {
        const net = compact(p);
        if (net.length >= 3 && !trouvees.includes(net)) trouvees.push(net);
      }
    }
  }

  return trouvees;
}

const GESTE =
  /((?:Faire intervenir|Faire v[ée]rifier|Faire contr[ôo]ler|Faire remplacer|Faire r[ée]aliser|Faire mettre|Mettre en s[ée]curit[ée]|Rempla[cç]er|Prot[ée]ger)[^.()]{10,240})/i;

/** Le code de la norme, quand le rapport le donne. LICIEL n'en donne aucun. */
const CODE = /^([A-Z]\.?\d+(?:\.\d+)*\s*[a-z]?\d?\)?)\s+/;

/**
 * Le libellé d'une anomalie, débarrassé de ce qui n'est pas elle.
 *
 * Les deux mises en page passent par ici : le marqueur de l'annexe, et surtout
 * la rubrique suivante quand la ligne reconstruite les réunit. Sans ce
 * nettoyage, « Parties du bien n'ayant pu être visitées : Sous-sol »
 * s'affichait comme faisant partie de l'anomalie.
 */
export function nettoyerLibelle(brut: string): string {
  return compact(brut)
    .replace(/^Libell[ée] de l['’]anomalie\s*:\s*/i, '')
    .replace(RUBRIQUE_SUIVANTE, '')
    .replace(/\s*\.\s*$/, '');
}

/**
 * Les anomalies du tableau, une par une et toutes.
 *
 * Chaque anomalie est un objet complet au sens du §8 : sa famille, son libellé
 * source, ses localisations, sa pluralité, son geste. Le code et la mesure
 * compensatoire restent nuls chez LICIEL, qui n'en écrit pas dans ce tableau —
 * « non précisé » et non « aucune ».
 */
export function anomaliesDuTableau(lignes: string[]): Anomalie[] {
  const catalogue = catalogueDesDomaines(lignes);
  const anomalies: Anomalie[] = [];

  let dedans = false;
  let numero: number | null = null;
  let resteDuTitre: string[] = [];
  let courant = '';
  let remarques = '';
  /** Le libellé a rencontré son point final : une nouvelle ligne ouvre une autre anomalie. */
  let libelleComplet = false;

  const fermer = (): void => {
    const libelle = nettoyerLibelle(courant);
    courant = '';
    libelleComplet = false;
    if (libelle.length < 12) {
      remarques = '';
      return;
    }
    const code = CODE.exec(libelle);
    const sansCode = code ? libelle.slice(code[0].length).trim() : libelle;
    anomalies.push({
      code: code?.[1]?.trim() ?? null,
      domaine: numero ? { numero, nom: NOMS[numero - 1] ?? '' } : null,
      libelle: sansCode,
      localisations: localisationsDe(remarques),
      pluralite: pluraliteDe(sansCode),
      mesureCompensatoire: null,
      geste: GESTE.exec(remarques)?.[1]?.replace(/\s*;\s*$/, '').trim() ?? null
    });
    remarques = '';
  };

  for (const brut of lignes) {
    const l = compact(brut);

    if (ENTETE.test(l)) {
      dedans = true;
      continue;
    }
    if (!dedans) continue;
    if (FIN.test(l)) {
      fermer();
      dedans = false;
      continue;
    }
    if (!l || BRUIT.test(l)) continue;

    const ouvre = /^([1-6])\.\s+(.*)$/.exec(l);
    if (ouvre) {
      /*
       * La colonne des anomalies commence parfois UNE LIGNE AU-DESSUS de la
       * cellule de domaine : « L'installation comporte au moins un matériel
       * électrique » précède « 6. Matériels électriques inadapté à l'usage. ».
       *
       * Fermer ici couperait l'anomalie en deux et attribuerait sa tête au
       * domaine précédent. Un libellé encore ouvert, sans remarque et sans
       * point final, appartient donc au domaine qui s'ouvre : on le reporte.
       */
      const enAttente = !remarques && !libelleComplet ? compact(courant) : '';
      if (enAttente) courant = '';
      fermer();
      numero = Number(ouvre[1]);
      const titre = catalogue[numero - 1] ?? '';
      const apres = retrancherTitre(ouvre[2] ?? '', compact(titre).split(' '));
      resteDuTitre = apres.reste;
      courant = enAttente ? `${enAttente} ${apres.texte}`.trim() : apres.texte;
      libelleComplet = /\.\s*$/.test(apres.texte);
      continue;
    }

    const { texte, reste } = retrancherTitre(l, resteDuTitre);
    resteDuTitre = reste;
    if (!texte) continue;

    // La remarque ferme le libellé et ouvre sa propre accumulation.
    const debutRemarque = /^Remarques\s*:\s*(.*)$/i.exec(texte);
    if (debutRemarque) {
      remarques = debutRemarque[1] ?? '';
      continue;
    }
    if (remarques) {
      remarques += ` ${texte}`;
      // La remarque se termine sur sa parenthèse de localisation : l'anomalie
      // est complète, libellé et remarque réunis.
      if (/\)\s*$/.test(texte)) fermer();
      continue;
    }

    /*
     * Le libellé se termine par un point — mais on ne ferme PAS ici.
     *
     * On l'a fait, et la remarque qui suit tombait dans le vide : la
     * localisation était perdue à chaque fois. Le point marque la fin de la
     * phrase, pas la fin de l'anomalie : celle-ci n'est close qu'à l'arrivée
     * d'un nouveau libellé, d'un nouveau domaine, ou de la fin du tableau.
     */
    if (libelleComplet) fermer();
    courant = courant ? `${courant} ${texte}` : texte;
    libelleComplet = /\.\s*$/.test(texte);
  }

  fermer();
  return anomalies;
}

/**
 * Y a-t-il un tableau d'anomalies dans ce volet ?
 *
 * **C'est le seul signal lisible du verdict chez LICIEL.** Sa rubrique 5
 * imprime les deux conclusions opposées l'une sous l'autre — « ne comporte
 * aucune anomalie » ET « comporte une ou des anomalies » — et seule une case
 * graphique les départage. Le texte ne permet donc pas de conclure, et le
 * moteur rendait « conclusion non lue » sur TOUS les volets sains.
 *
 * Le tableau, lui, ne s'imprime que s'il y a quelque chose à y mettre. Mesuré
 * sur neuf volets : les cinq sains n'en ont aucun, les quatre autres en ont un.
 */
/**
 * Ce volet est-il de la mise en page LICIEL ?
 *
 * ⚠️ **Question de sûreté, pas de confort.** La règle « pas de tableau, donc
 * pas d'anomalie » est une habitude de LICIEL, et d'aucun autre éditeur. Or la
 * phrase qui ouvre son catalogue — « Anomalies avérées selon les domaines
 * suivants » — est aussi imprimée par AnalysImmo, qui range ensuite ses
 * anomalies tout autrement : six domaines numérotés, chacun suivi de « Néant »
 * ou d'un tableau à six colonnes, et jamais d'en-tête « Domaines Anomalies ».
 *
 * Sans ce garde-fou, un volet AnalysImmo portant sept anomalies ressortait
 * « ne présente aucune anomalie » : le catalogue était lu, le tableau LICIEL
 * absent, et l'absence prise pour une bonne nouvelle. C'est la conformité
 * inventée que le §43 interdit en premier.
 *
 * On exige donc une signature POSITIVE de LICIEL. Deux marqueurs, tous deux
 * mesurés sur les quatre volets lus en entier, et absents des deux autres
 * éditeurs : la numérotation « 5. – » à tiret demi-cadratin, et la table des
 * informations complémentaires qui s'ouvre par « IC. ».
 */
export function ressembleALiciel(lignes: string[]): boolean {
  let numerotationTiret = false;
  let tableIC = false;

  for (const brut of lignes) {
    const l = compact(brut);
    if (/^\d\s*\.\s*[–—]\s*\S/.test(l)) numerotationTiret = true;
    if (/^IC\.\s/.test(l)) tableIC = true;
    if (numerotationTiret && tableIC) return true;
  }

  return numerotationTiret || tableIC;
}

export function porteUnTableauDAnomalies(lignes: string[]): boolean {
  let dedans = false;
  for (const brut of lignes) {
    const l = compact(brut);
    if (ENTETE.test(l)) {
      dedans = true;
      continue;
    }
    if (!dedans) continue;
    if (FIN.test(l)) return false;
    if (!l || BRUIT.test(l)) continue;
    // Une cellule de domaine numérotée : le tableau a du contenu.
    if (/^[1-6]\.\s+\S/.test(l)) return true;
  }
  return false;
}
