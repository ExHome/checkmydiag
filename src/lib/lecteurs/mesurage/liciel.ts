/**
 * LE LECTEUR DE MESURAGE — FORMAT LICIEL.
 *
 * Mesuré sur 10 volets lus en entier le 22/08/2026
 * (`docs/OU-PARSER-MESURAGE.md` § 4). Deux documents, un seul format :
 * le `Certificat de superficie` (Carrez) et l'`Attestation de surface`
 * (Boutin) partagent la même maquette et diffèrent par leurs intitulés.
 */
import type { Lecteur } from '../socle';
import {
  nombre,
  type LectureMesurage,
  type Loi,
  type PieceMesuree,
  type PieceNonVisitee,
  type Rubrique,
  type Surface
} from './modele';

/**
 * La signature : le titre courant, répété en tête de CHAQUE page du volet.
 *
 * Positive, et mesurée 10 fois sur 10. Elle constate une présence — jamais
 * l'absence d'un marqueur d'un autre éditeur.
 */
const TITRE_COURANT = /^(Certificat de superficie|Attestation de surface)\s+n[°º]\s*\S/i;

/** La 2ᵉ ligne du volet, celle qui nomme la loi. Vue 10 fois sur 10. */
const INTITULE_CARREZ = /^Certificat de superficie de la partie privative\s*$/i;
const INTITULE_BOUTIN = /^Attestation de surface habitable\s*$/i;

/**
 * Les totaux — et LICIEL en écrit DEUX FORMES pour la même valeur.
 *
 * Le **certificat** écrit `Surface loi Carrez totale`, le **résumé de
 * l'expertise**, en tête de dossier, écrit `Superficie Loi Carrez totale`. Même
 * chiffre, deux intitulés — et pareil pour la Boutin (`Surface habitable
 * totale` / `Superficie habitable totale`).
 *
 * D'où un `role` plutôt qu'un libellé pour dédoublonner : garder les deux
 * ferait apparaître la même surface deux fois, une fois comme total légal et
 * une fois comme « autre total ». Et un `rang`, parce qu'entre les deux
 * écritures on cite **celle du certificat** : c'est la pièce, le résumé n'en
 * est que le rappel — et il est imprimé AVANT, donc le premier arrivé n'est
 * pas le bon.
 *
 * Le deux-points est parfois collé au mot (`totale: 30.92 m²`), et le
 * séparateur décimal est le point jusqu'en 2022, la virgule ensuite.
 */
type Role = 'carrez' | 'boutin' | 'au sol';
const TOTAUX: { motif: RegExp; libelle: string; role: Role; rang: number }[] = [
  {
    motif: /^Surface\s+loi\s+Carrez\s+totale\s*:?\s*([\d\s.,]+?)\s*m/i,
    libelle: 'Surface loi Carrez totale',
    role: 'carrez',
    rang: 0
  },
  {
    motif: /^Superficie\s+Loi\s+Carrez\s+totale\s*:?\s*([\d\s.,]+?)\s*m/i,
    libelle: 'Superficie Loi Carrez totale',
    role: 'carrez',
    rang: 1
  },
  {
    motif: /^Surface\s+habitable\s+totale\s*:?\s*([\d\s.,]+?)\s*m/i,
    libelle: 'Surface habitable totale',
    role: 'boutin',
    rang: 0
  },
  {
    motif: /^Superficie\s+habitable\s+totale\s*:?\s*([\d\s.,]+?)\s*m/i,
    libelle: 'Superficie habitable totale',
    role: 'boutin',
    rang: 1
  },
  {
    motif: /^Surface\s+au\s+sol\s+totale\s*:?\s*([\d\s.,]+?)\s*m/i,
    libelle: 'Surface au sol totale',
    role: 'au sol',
    rang: 0
  }
];

/**
 * Une ligne du tableau : un nom, puis deux nombres — et, parfois, le
 * commentaire à la suite sur la même ligne.
 *
 * ⚠️ Les deux formes existent, et la seconde a coûté deux pièces sur trois dans
 * un certificat du corpus :
 *
 *   1er étage - Salle de bain 4,26 4,26
 *   1er étage - Entrée /Cuisine/Séjour 27,75 29,25 Surface de marche
 *   2ème étage - mezzaninne 13,68 16,23 Hauteur de moins de 1,80m
 *
 * Un motif qui exigeait la fin de ligne après le second nombre rejetait les
 * deux dernières **entièrement** — pas de ligne, pas d'erreur, pas de trace :
 * la somme des pièces tombait à 4,26 m² pour un total annoncé de 45,69 m².
 *
 * L'ordre des deux essais compte. La forme stricte passe d'abord, sans quoi
 * `Chambre 01 8.37 8.37` se lirait « Chambre », 01 m², 8.37 m², commentaire
 * « 8.37 » — un nom de pièce amputé et une surface inventée.
 */
const LIGNE = /^(.+?)\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)\s*$/;
/**
 * La même ligne avec son commentaire à la suite.
 *
 * ⚠️ **Le commentaire doit commencer par autre chose qu'un chiffre**, et cette
 * garde a été payée cher : une première version se contentait d'interdire un
 * commentaire réduit à un nombre. Sur l'échantillon témoin, elle lisait
 *
 *   2ème étage - Chambre 1 10,1 10,33 Embrasure de fenêtre(s)
 *
 * comme « 2ème étage - Chambre », **1 m²** retenu, 10,1 m² au sol, commentaire
 * « 10,33 Embrasure de fenêtre(s) » — le numéro de la chambre pris pour sa
 * surface. Deux pièces d'un même volet y passaient, et le total tombait de
 * 64,88 m² à 44,67 m² sans qu'aucune erreur ne soit levée.
 *
 * Les trois formes de commentaire rencontrées commencent toutes par une
 * lettre : « Surface de marche », « Embrasure de fenêtre(s) », « Hauteur de
 * moins de 1,80m ». Limite assumée : un commentaire qui commencerait par un
 * chiffre rendrait la ligne illisible plutôt que fausse — c'est le bon sens de
 * l'erreur, et c'est ici qu'il se corrigera le jour où un cas se présentera.
 */
const LIGNE_COMMENTEE =
  /^(.+?)\s+(\d+(?:[.,]\d+)?)\s+(\d+(?:[.,]\d+)?)\s+([^\d\s].*)$/;

/**
 * Les en-têtes de colonnes — écartés avant tout recollage de commentaire.
 *
 * En Carrez l'en-tête est cassé sur trois lignes (`Superficie privative au` /
 * `Parties de l'immeuble…` / `sens Carrez`). Sans cette liste, `sens Carrez`
 * deviendrait le commentaire de la première pièce.
 */
const EN_TETE =
  /^(Superficie (?:privative|habitable) au$|sens Carrez$|Parties de l['’]immeuble|Commentaires$|Tableau r[ée]capitulatif des surfaces)/i;

/** La borne basse du tableau : le bloc de totaux qui le referme. */
const FIN_TABLEAU = /^Superficie (?:privative|habitable) en m² du ou des lot\(s\)\s*:/i;
/** La borne haute : la ligne d'en-tête qui porte le nom des colonnes. */
const DEBUT_TABLEAU = /^Parties de l['’]immeuble/i;

/** Les mentions de pied de page, sur chaque feuille du volet. */
const PIED =
  /^(SARL DGLM|N°SIREN|RCS\s*:|Rapport du\s*:|\d+\s*\/\s*\d+\s*$|Fait à |Par\s*:|Aucun document n['’]a été|Aucun schéma de repérage)/i;

/**
 * Le commentaire d'une pièce enjambe sa ligne de données : une moitié au-dessus,
 * une moitié au-dessous. Recoller « la ligne d'après » rendrait une demi-phrase.
 *
 * ⚠️ La règle d'attribution est **mesurée**, pas devinée : sur les quatre
 * fragments rencontrés, celui qui commence par une majuscule ouvre la phrase et
 * appartient à la ligne qui SUIT ; celui qui commence par une minuscule la
 * continue et appartient à la ligne qui PRÉCÈDE.
 *
 *   Surface occupée par un chauffe eau fixe et   ← majuscule : pour la ligne d'après
 *   Rez de chaussée - Buhanderie 3,09 3,28
 *   obligatoire                                  ← minuscule : pour la ligne d'avant
 *
 * Limite assumée : une continuation qui commencerait par une majuscule (un nom
 * propre) serait rattachée à la mauvaise pièce. Aucun cas de ce genre dans les
 * 10 volets lus — le jour où il s'en présentera un, c'est ici qu'il se corrige.
 */
function estUneContinuation(fragment: string): boolean {
  const premier = fragment.trim()[0] ?? '';
  return premier === premier.toLowerCase() && premier !== premier.toUpperCase();
}

/**
 * L'en-tête de la colonne retenue, dans les mots du rapport.
 *
 * En **Carrez** il est cassé en trois lignes par l'extraction, et ses deux
 * moitiés encadrent la ligne des autres colonnes :
 *
 *   Superficie privative au                                        ← avant
 *   Parties de l'immeuble bâtis visitées Surface au sol Commentaires
 *   sens Carrez                                                    ← après
 *
 * En **Boutin** il tient dans la ligne elle-même, entre « visitées » et
 * « Surface au sol ». Deux dispositions, deux lectures — et `null` si aucune
 * des deux ne se présente, plutôt qu'un intitulé fabriqué.
 */
function lireEnTeteColonne(lignes: readonly string[], debut: number): string | null {
  const avant = (lignes[debut - 1] ?? '').trim();
  const apres = (lignes[debut + 1] ?? '').trim();
  if (/^Superficie (?:privative|habitable) au$/i.test(avant) && /^sens Carrez$/i.test(apres)) {
    return `${avant} ${apres}`;
  }
  const m = /visit[ée]es\s+(.+?)\s+Surface au sol/i.exec(lignes[debut] ?? '');
  return m ? m[1]!.trim() : null;
}

function lireTableau(lignes: readonly string[]): { pieces: PieceMesuree[]; colonne: string | null } {
  const debut = lignes.findIndex((l) => DEBUT_TABLEAU.test(l.trim()));
  if (debut < 0) return { pieces: [], colonne: null };
  const colonne = lireEnTeteColonne(lignes, debut);
  const zone: string[] = [];
  for (const brute of lignes.slice(debut + 1)) {
    const ligne = brute.trim();
    if (FIN_TABLEAU.test(ligne)) break;
    if (!ligne || EN_TETE.test(ligne) || PIED.test(ligne)) continue;
    zone.push(ligne);
  }

  /* La colonne du milieu porte la surface retenue, la dernière la surface au
     sol : c'est l'ordre imprimé, identique en Carrez et en Boutin. */
  const pieces: PieceMesuree[] = [];
  const fragments: { texte: string; index: number }[] = [];
  for (const ligne of zone) {
    const m = LIGNE.exec(ligne) ?? LIGNE_COMMENTEE.exec(ligne);
    if (!m) {
      fragments.push({ texte: ligne, index: pieces.length });
      continue;
    }
    const retenue = nombre(m[2]);
    const auSol = nombre(m[3]);
    if (retenue === null || auSol === null) continue;
    pieces.push({
      nom: m[1]!.trim(),
      niveau: null,
      retenue,
      autres: [{ libelle: 'Surface au sol', valeur: auSol }],
      commentaire: m[4]?.trim() ?? null,
      source: ligne
    });
  }

  for (const { texte, index } of fragments) {
    /* `index` est le nombre de pièces déjà lues quand le fragment est apparu :
       la pièce qui suit porte donc ce numéro, celle qui précède le numéro - 1. */
    const cible = estUneContinuation(texte) ? index - 1 : index;
    const piece = pieces[cible];
    if (!piece) continue;
    piece.commentaire = piece.commentaire ? `${piece.commentaire} ${texte}` : texte;
  }

  return { pieces, colonne };
}

/**
 * Les pièces non visitées — et les trois états de la rubrique.
 *
 * « Néant » est une réponse : la rubrique a été remplie et elle ne signale rien.
 * Une rubrique absente n'en est pas une. Une pièce non visitée n'est pas une
 * pièce de 0 m² : elle n'a pas été mesurée du tout.
 */
function lireNonVisitees(lignes: readonly string[]): Rubrique<PieceNonVisitee[]> {
  const debut = lignes.findIndex((l) => /^Liste des pièces non visitées\s*:/i.test(l.trim()));
  if (debut < 0) return { etat: 'non renseignée' };

  const trouvees: PieceNonVisitee[] = [];
  for (const brute of lignes.slice(debut + 1)) {
    const ligne = brute.trim();
    if (!ligne || PIED.test(ligne)) continue;
    if (/^(Représentant du propriétaire|Documents remis|Tableau récapitulatif)/i.test(ligne)) break;
    if (DEBUT_TABLEAU.test(ligne)) break;
    if (/^Néant\s*$/i.test(ligne)) return { etat: 'néant', source: lignes[debut]!.trim() };
    const m = /^(.+?)\s*\((.+)\)\s*$/.exec(ligne);
    trouvees.push({
      designation: (m ? m[1]! : ligne).trim(),
      motif: m ? m[2]!.trim() : null,
      source: ligne
    });
  }
  return trouvees.length ? { etat: 'renseignée', valeur: trouvees } : { etat: 'non renseignée' };
}

function lireLICIEL(lignes: readonly string[]): LectureMesurage {
  const nettes = lignes.map((l) => l.trim());

  const ligneIntitule = nettes.find((l) => INTITULE_CARREZ.test(l) || INTITULE_BOUTIN.test(l));
  const loi: Loi = ligneIntitule && INTITULE_CARREZ.test(ligneIntitule) ? 'carrez' : 'boutin';

  /*
   * Le bloc de totaux est imprimé DEUX fois — en tête du volet, puis en pied de
   * tableau. C'est le même chiffre, pas deux mesures : on garde la première
   * occurrence de chaque intitulé et on n'additionne rien.
   */
  let surfaceLegale: Surface | null = null;
  const autresTotaux: Surface[] = [];
  const retenus = new Map<Role, { surface: Surface; rang: number }>();
  for (const ligne of nettes) {
    for (const { motif, libelle, role, rang } of TOTAUX) {
      const m = motif.exec(ligne);
      if (!m) continue;
      const valeur = nombre(m[1]);
      if (valeur === null) continue;
      const dejaLa = retenus.get(role);
      if (dejaLa && dejaLa.rang <= rang) continue;
      retenus.set(role, { surface: { valeur, libelle, source: ligne }, rang });
    }
  }
  for (const [role, { surface }] of retenus) {
    if (role === loi) surfaceLegale = surface;
    else if (role === 'au sol') autresTotaux.push(surface);
  }

  const dateVisite = /^Date du repérage\s*:\s*(\d{2}\/\d{2}\/\d{4})/i
    .exec(nettes.find((l) => /^Date du repérage\s*:/i.test(l)) ?? '')?.[1] ?? null;

  /* « Rapport du : » et sa date sont sur deux lignes, dans le pied de page. */
  const iRapport = nettes.findIndex((l) => /^Rapport du\s*:?\s*$/i.test(l));
  const dateRapport =
    iRapport >= 0 ? (/^(\d{2}\/\d{2}\/\d{4})$/.exec(nettes[iRapport + 1] ?? '')?.[1] ?? null) : null;

  const tableau = lireTableau(nettes);

  return {
    loi,
    intitule: ligneIntitule ?? '',
    surfaceLegale,
    autresTotaux,
    pieces: tableau.pieces,
    colonneRetenue: tableau.colonne,
    piecesNonVisitees: lireNonVisitees(nettes),
    /* Rubrique propre à BC2E : LICIEL n'en imprime aucune. */
    particularites: { etat: 'non renseignée' },
    reserves: [],
    dateVisite,
    dateRapport
  };
}

export const LECTEUR_MESURAGE_LICIEL: Lecteur<LectureMesurage> = {
  editeur: 'LICIEL',
  quoi: 'mesurage',
  reconnait(lignes) {
    const titre = lignes.map((l) => l.trim()).find((l) => TITRE_COURANT.test(l));
    return titre ? { preuve: titre } : null;
  },
  lire: lireLICIEL
};
