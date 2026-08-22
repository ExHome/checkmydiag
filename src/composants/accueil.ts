/**
 * LA COUPE DU DOSSIER — tout ce que l'accueil calcule avant de dessiner.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * POURQUOI CE FICHIER EXISTE SÉPARÉMENT DU COMPOSANT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * L'accueil affiche deux chiffres et un dessin. Les trois sortent d'un calcul,
 * et un calcul faux sur le premier écran discrédite tout le reste du produit :
 * quelqu'un qui recompte les carreaux et ne retrouve pas le chiffre ne fera
 * plus confiance à une seule ligne des écrans suivants. Ils se testent donc,
 * un par un, hors de tout rendu.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * LE DESSIN EST UNE COUPE, PAS UNE ILLUSTRATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Le linteau de l'accueil montre le dossier PAR LA TRANCHE : le PDF déposé,
 * vu de côté, page par page. Une page du rapport = une lame de verre. Le champ
 * du dessin couvre exactement `1 → nbPages`, sans marge et sans arrondi
 * décoratif ; la largeur d'une travée est donc, littéralement, l'épaisseur du
 * diagnostic dans le dossier.
 *
 * Trois matières, et elles se déduisent toutes de `Diagnostic.pages` :
 *
 *   LES TRAVÉES   les pages qui appartiennent à un diagnostic. Vitrées : la
 *                 lumière les traverse.
 *   LES MONTANTS  les pages qui n'appartiennent à aucun — page de garde,
 *                 sommaire, attestations, annexes. Pleines : la lumière s'y
 *                 arrête. Ce ne sont PAS des défauts, c'est la structure du
 *                 dossier, et la légende le dit.
 *   LE PETIT-BOIS un filet par page à l'intérieur d'une travée. C'est la fibre
 *                 du document.
 *
 * Rien d'autre n'est dessiné. Aucune page n'est inventée, aucune n'est cachée :
 * la somme des travées et des montants vaut toujours `nbPages`, et c'est un
 * test qui le vérifie plutôt qu'un commentaire.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CE QUE LE DESSIN NE DIRA JAMAIS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Une occlusion vient de `Diagnostic.gravite`, jamais d'une heuristique de
 * texte. La tentation était d'occulter les pages portant un repère de ton
 * « mauvais » : `tonDeLaLigne()` classe une ligne par expression régulière, et
 * son motif contient « amiante » — l'en-tête d'un rapport de repérage amiante
 * suffirait à noircir une page où il n'y a rien. Une tache sombre qu'aucune
 * conclusion ne justifie est exactement le design qui ment.
 *
 * Les gravités, elles, sont le verdict du moteur sur le diagnostic entier, et
 * chaque occlusion porte le `verdict` du rapport en toutes lettres.
 */
import type { Bien, Diagnostic, Gravite, TypeDiag } from '../lib/modele';
import type { CompteDuDossier } from '../lib/bureau';
import type { GenreOcclusion, Occlusion } from './lumiere/calque';

/**
 * LE REPÈRE DU LINTEAU, en unités de `viewBox`.
 *
 * Une seule source pour le dessin, pour les occlusions et pour les marques du
 * premier plan. Deux repères qui divergent d'un dixième produiraient une
 * occlusion décalée d'une page — et une occlusion décalée est un mensonge.
 */
export const LINTEAU = {
  /** Hauteur du plateau. `viewBox="0 0 100 58"`, soit 358 × 208 px sur 390. */
  hauteur: 58,
  /** Le champ du dessin : le dossier entier tient entre ces deux abscisses. */
  gauche: 4,
  droite: 96,
  /**
   * La traverse haute et la traverse basse du dormant.
   *
   * Le seuil est à 31 sur 58, soit 53,4 % : le tiers bas du plateau est laissé
   * NU. Ce n'est pas de la place perdue, c'est la seule zone assez claire pour
   * porter le grand chiffre sans que le dessin lui passe derrière.
   */
  haut: 6,
  bas: 31,
  /** Épaisseur des traverses et des montants du dormant. */
  traverse: 1.4,
  /** Épaisseur d'un meneau, entre deux travées jointives. */
  meneau: 1,
  /** Épaisseur d'un filet de page. */
  petitBois: 0.28,
  /**
   * Retrait d'une occlusion par rapport aux traverses.
   *
   * Sans lui, une travée occultée mangerait le dormant et la coupe perdrait sa
   * structure : on ne verrait plus une verrière, mais une barre noire.
   */
  jeu: 1.4,
  /**
   * Nombre maximal de filets de page.
   *
   * Au-delà, le petit-bois cesse d'être une fibre et devient un aplat gris : on
   * n'en dessine plus qu'un sur `pas`. Un DTG de trois cents pages ne doit pas
   * coûter trois cents tracés dans un masque.
   */
  maxPetitBois: 56
} as const;

/** La largeur du champ, en unités de `viewBox`. */
export const CHAMP = LINTEAU.droite - LINTEAU.gauche;

/**
 * L'abscisse du BORD GAUCHE de la page `page`.
 *
 * `abscisse(1)` vaut le bord gauche du champ et `abscisse(nbPages + 1)` son
 * bord droit : une page occupe donc `[abscisse(p), abscisse(p + 1)[`. C'est la
 * convention qui rend la coupe exacte — avec un centrage par page, la dernière
 * dépasserait d'une demi-largeur.
 */
export function abscisse(page: number, nbPages: number): number {
  if (nbPages < 1) return LINTEAU.gauche;
  const p = Math.max(1, Math.min(nbPages + 1, page));
  return LINTEAU.gauche + (CHAMP * (p - 1)) / nbPages;
}

/** Une travée vitrée : les pages d'un diagnostic. */
export interface Travee {
  type: TypeDiag;
  titre: string;
  gravite: Gravite;
  /** Première et dernière page, bornées au dossier réel. */
  debut: number;
  fin: number;
}

/** Un intervalle de pages, bornes comprises. */
export interface Plage {
  debut: number;
  fin: number;
}

/**
 * LES TRAVÉES, en partition stricte du dossier.
 *
 * Les `pages` de deux diagnostics peuvent se chevaucher — un découpage de
 * sommaire imprécis suffit. Un dessin qui superposerait deux travées afficherait
 * une page comme appartenant à deux diagnostics ; on tronque donc au plus tôt,
 * et une travée entièrement recouverte disparaît du DESSIN sans disparaître de
 * la grille : son carreau reste, avec son verdict.
 */
export function traveesDe(diagnostics: readonly Diagnostic[], nbPages: number): Travee[] {
  if (nbPages < 1) return [];

  const brutes = diagnostics
    .map((d) => {
      const debut = Math.max(1, Math.min(nbPages, d.pages[0]));
      return {
        type: d.type,
        titre: d.titre,
        gravite: d.gravite,
        debut,
        fin: Math.max(debut, Math.min(nbPages, d.pages[1]))
      };
    })
    .sort((a, b) => a.debut - b.debut || a.fin - b.fin);

  const gardees: Travee[] = [];
  let curseur = 0;
  for (const t of brutes) {
    const debut = Math.max(t.debut, curseur + 1);
    if (debut > t.fin) continue;
    gardees.push({ ...t, debut });
    curseur = t.fin;
  }
  return gardees;
}

/**
 * LES MONTANTS : les pages qu'aucun diagnostic ne revendique.
 *
 * Page de garde, sommaire, attestations de compétence, annexes. Elles existent,
 * elles pèsent dans l'épaisseur du dossier, et les taire donnerait une coupe qui
 * ne correspond pas au PDF qu'on tient.
 */
export function montantsDe(travees: readonly Travee[], nbPages: number): Plage[] {
  if (nbPages < 1) return [];
  const plages: Plage[] = [];
  let curseur = 1;
  for (const t of travees) {
    if (t.debut > curseur) plages.push({ debut: curseur, fin: t.debut - 1 });
    curseur = t.fin + 1;
  }
  if (curseur <= nbPages) plages.push({ debut: curseur, fin: nbPages });
  return plages;
}

/** Les quatre tracés de la coupe, en unités de `viewBox`. */
export interface Coupe {
  /** Le dormant : traverses haute et basse, jambages. Tracé au trait. */
  cadre: string;
  /** Les pages hors diagnostic. Rempli. Vide quand il n'y en a aucune. */
  montants: string;
  /** Les joints entre deux travées jointives. Rempli. */
  meneaux: string;
  /** Un filet par page. Tracé au trait. */
  petitBois: string;
  /** Une page sur `pas` porte un filet. Vaut 1 tant que le dossier est court. */
  pas: number;
}

const dec = (n: number): string => (Math.round(n * 100) / 100).toString();

/** Un rectangle plein, du bord gauche de `debut` au bord droit de `fin`. */
function bande(debut: number, fin: number, nbPages: number, haut: number, bas: number): string {
  const x0 = abscisse(debut, nbPages);
  const x1 = abscisse(fin + 1, nbPages);
  return `M${dec(x0)} ${dec(haut)} H${dec(x1)} V${dec(bas)} H${dec(x0)} Z`;
}

/**
 * LA COUPE COMPLÈTE.
 *
 * Aucune des quatre pièces ne porte de couleur : le composant les rend dans le
 * masque de la table lumineuse, en `currentColor`, où elles ARRÊTENT la
 * lumière. C'est la règle de `calque.ts` — un trait n'est pas de l'encre posée
 * sur un fond, c'est un endroit où la source ne passe plus.
 */
export function coupeDuDossier(travees: readonly Travee[], nbPages: number): Coupe {
  const { gauche, droite, haut, bas } = LINTEAU;
  const cadre = `M${gauche} ${haut} H${droite} V${bas} H${gauche} Z`;

  if (nbPages < 1) {
    return { cadre, montants: '', meneaux: '', petitBois: '', pas: 1 };
  }

  const montants = montantsDe(travees, nbPages)
    .map((p) => bande(p.debut, p.fin, nbPages, haut, bas))
    .join(' ');

  const meneaux = travees
    .map((t, i) => {
      const suivante = travees[i + 1];
      if (!suivante || suivante.debut !== t.fin + 1) return '';
      const x = abscisse(t.fin + 1, nbPages);
      const demi = LINTEAU.meneau / 2;
      return `M${dec(x - demi)} ${haut} H${dec(x + demi)} V${bas} H${dec(x - demi)} Z`;
    })
    .filter((d) => d !== '')
    .join(' ');

  const pas = Math.max(1, Math.ceil(nbPages / LINTEAU.maxPetitBois));
  const filets: string[] = [];
  for (const t of travees) {
    for (let p = t.debut + pas; p <= t.fin; p += pas) {
      const x = dec(abscisse(p, nbPages));
      filets.push(`M${x} ${dec(haut + LINTEAU.jeu)} V${dec(bas - LINTEAU.jeu)}`);
    }
  }

  return { cadre, montants, meneaux, petitBois: filets.join(' '), pas };
}

/**
 * Ce que le premier plan peint par-dessus une occlusion.
 *
 * La lumière arrêtée est un fait de MATIÈRE, et sa différence avec le verre
 * éclairé se mesure : au moment doré, sur un plateau `bon`, le verre plein vaut
 * #424c34 et le sol #0a2b23, soit 1,67:1 — sous le seuil de 3:1 d'un élément
 * graphique. Ce n'est pas un défaut du mécanisme, c'est sa borne : la lampe est
 * plafonnée à 0,34 pour ne pas entrer dans la bande morte.
 *
 * On ne fait donc jamais porter le signal par la seule occlusion. Elle est
 * doublée par un trait PEINT sur le seuil, au premier plan, en sable clair
 * (7,36:1 au pire cas mesuré), et par la légende écrite sous le plateau.
 */
export interface Marque {
  /** Bord gauche, en pourcentage de la largeur du plateau. */
  gauche: number;
  /** Largeur, en pourcentage de la largeur du plateau. */
  largeur: number;
  genre: GenreOcclusion;
}

export interface Lecture {
  occlusions: Occlusion[];
  marques: Marque[];
}

/**
 * CE QUI ARRÊTE LA LUMIÈRE, ET CE QU'ON N'A PAS PU LIRE.
 *
 * Deux genres, et ils viennent de deux faits différents :
 *
 *   `alerte` / `attention`  le rapport relève quelque chose. La travée
 *                           s'assombrit, et son libellé est le `verdict` du
 *                           diagnostic, mot pour mot.
 *
 *   `neutre`                Verrière n'a pas su lire ce diagnostic. La travée
 *                           passe en raies : on voit qu'il y a des pages, on ne
 *                           voit pas ce qu'elles disent. « Je n'ai pas pu lire »
 *                           n'est pas « il n'y a rien », et la texture le dit
 *                           sans couleur — donc au daltonien, au noir et blanc,
 *                           et à l'impression.
 *
 * `bon` ne produit rien : une travée que rien n'assombrit est une travée que le
 * rapport a regardée sans rien relever. Ce n'est pas la même chose qu'une
 * absence, et c'est le carreau qui l'écrit — jamais le dessin seul.
 */
export function lectureDuLinteau(travees: readonly Travee[], nbPages: number, verdicts: ReadonlyMap<TypeDiag, string>): Lecture {
  const occlusions: Occlusion[] = [];
  const marques: Marque[] = [];
  if (nbPages < 1) return { occlusions, marques };

  const haut = LINTEAU.haut + LINTEAU.jeu;
  const bas = LINTEAU.bas - LINTEAU.jeu;

  for (const t of travees) {
    if (t.gravite === 'bon') continue;
    const genre: GenreOcclusion = t.gravite === 'neutre' ? 'nonControle' : 'anomalie';
    const verdict = verdicts.get(t.type);
    const libelle =
      genre === 'nonControle'
        ? `${t.titre} — non lisible automatiquement. Ces pages sont dans votre dossier ; Verrière n’a pas su les lire.`
        : `${t.titre} — ${verdict ?? 'le rapport relève quelque chose sur ces pages.'}`;

    occlusions.push({ d: bande(t.debut, t.fin, nbPages, haut, bas), genre, libelle });

    const x0 = abscisse(t.debut, nbPages);
    marques.push({ gauche: x0, largeur: abscisse(t.fin + 1, nbPages) - x0, genre });
  }

  return { occlusions, marques };
}

/** Ce que l'accueil annonce en grand, et la phrase qui va avec. */
export interface Demande {
  /** Le nombre de diagnostics qui demandent quelque chose. 0 à 3 sur le corpus. */
  chiffre: number;
  phrase: string;
  /** La gravité de la SCÈNE : de combien la lumière se retire sur cet écran. */
  gravite: Gravite;
}

const s = (n: number): string => (n > 1 ? 's' : '');

/**
 * LE GRAND CHIFFRE.
 *
 * Il compte des CARREAUX, et rien d'autre : on peut le recompter à l'œil sur la
 * grille juste dessous. Mesuré sur quatre-vingt-dix dossiers réels, il vaut 0
 * quatre fois, 1 soixante-trois fois, 2 vingt fois et 3 trois fois. Il ne vaut
 * jamais sept ni douze — la maquette qui montrait « 7 anomalies » ne correspond
 * à aucun dossier du corpus, et un écran conçu pour un chiffre qui n'arrive
 * jamais est un écran conçu pour rien.
 *
 * Les diagnostics NON LUS (`neutre`) n'y sont pas. C'est la confusion que tout
 * le produit combat : « je n'ai pas su lire » n'est pas « rien à signaler », et
 * ce n'est pas non plus une demande d'action. Ils vivent dans la coupe, en
 * raies, et sur leur carreau.
 */
export function laDemande(compte: CompteDuDossier): Demande {
  const { aRegler, aVerifier, nonLus } = compte;
  const chiffre = aRegler + aVerifier;

  const gravite: Gravite =
    aRegler > 0 ? 'alerte' : aVerifier > 0 ? 'attention' : nonLus > 0 ? 'neutre' : 'bon';

  if (chiffre === 0) {
    return { chiffre, phrase: 'Aucun diagnostic de ce dossier ne signale d’anomalie.', gravite };
  }

  if (aRegler > 0 && aVerifier > 0) {
    return {
      chiffre,
      phrase: `${aRegler} demande${s(aRegler)} une action avant la signature, ${aVerifier} mérite${s(aVerifier)} une question au vendeur.`,
      gravite
    };
  }

  if (aRegler > 0) {
    return {
      chiffre,
      phrase:
        aRegler === 1
          ? 'Un diagnostic demande une action avant la signature.'
          : `${aRegler} diagnostics demandent une action avant la signature.`,
      gravite
    };
  }

  return {
    chiffre,
    phrase:
      aVerifier === 1
        ? 'Un diagnostic mérite une question au vendeur.'
        : `${aVerifier} diagnostics méritent une question au vendeur.`,
    gravite
  };
}

/** Le titre de l'écran et la ligne qui le précise. */
export interface EnTete {
  titre: string;
  details: string[];
}

/**
 * L'IDENTITÉ DU BIEN, ET LE CHAMP QU'ON N'AFFICHERA JAMAIS.
 *
 * `bien.typeBien` n'est renseigné SUR AUCUN des quatre-vingt-dix dossiers
 * mesurés. Ce n'est pas une particularité du corpus, c'est un défaut d'extraction
 * — et l'ancien accueil composait pourtant « {typeBien} · {surface} », donc
 * « Votre dossier · 72 m² » sur la totalité des dossiers réels. Le champ n'est
 * pas lu ici, et il ne le sera pas tant qu'il n'aura pas de valeur.
 *
 * Ce qui reste, mesuré sur quarante dossiers : adresse 40/40, commune 40/40,
 * lot 40/40 ; sur quatre-vingt-dix : surface 76/90, année 77/90.
 */
export function enTeteDuBien(bien: Bien, nomDuDocument: string): EnTete {
  const titre = bien.adresse ?? bien.commune ?? nomDuDocument;
  const details: string[] = [];

  if (bien.commune && bien.commune !== titre) details.push(bien.commune);
  if (bien.lot) details.push(bien.lot);
  if (bien.surface !== undefined) details.push(`${bien.surface.toLocaleString('fr-FR')} m²`);
  if (bien.anneeConstruction) details.push(`construit en ${bien.anneeConstruction}`);

  return { titre, details };
}

/**
 * LA SALUTATION SUIT L'HEURE, comme la lumière.
 *
 * C'est l'idée du temps qui passe, appliquée à la langue. Elle ne coûte qu'une
 * comparaison, et elle change la nature de l'écran : un outil dit « Tableau de
 * bord », un lieu dit « Bonsoir ».
 */
export function salutation(heure: number): string {
  const h = ((heure % 24) + 24) % 24;
  return h >= 18 || h < 5 ? 'Bonsoir' : 'Bonjour';
}

/**
 * La part du dossier qu'occupe un diagnostic, de 0 à 1.
 *
 * Portée sur le carreau par un filet dont la longueur est cette part, elle
 * relie le carreau à sa travée dans la coupe : deux représentations d'une même
 * donnée, `Diagnostic.pages`, jamais d'un jugement.
 */
export function partDuDossier(d: Diagnostic, nbPages: number): number {
  if (nbPages < 1) return 0;
  const debut = Math.max(1, Math.min(nbPages, d.pages[0]));
  const fin = Math.max(debut, Math.min(nbPages, d.pages[1]));
  return (fin - debut + 1) / nbPages;
}
