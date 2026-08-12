/**
 * Reconstruction des lignes d'une page PDF à partir des fragments de texte.
 *
 * Isolé ici (sans dépendance à pdf.js) pour être utilisable aussi bien par le
 * navigateur que par les tests exécutés sous Node.
 */

export interface Fragment {
  str: string;
  /** Matrice de transformation pdf.js : [a, b, c, d, x, y]. */
  transform: number[];
  /** Largeur du fragment, en unités PDF. */
  width?: number;
  /** Hauteur de la police, en unités PDF. */
  height?: number;
}

/** Une ligne, avec sa place sur la page — de quoi la montrer du doigt. */
export interface LignePositionnee {
  texte: string;
  /** Coin haut-gauche et dimensions, en unités PDF (origine en bas à gauche). */
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
}

export interface PageTexte {
  numero: number;
  lignes: string[];
  /** Mêmes lignes, avec leurs coordonnées. Absent hors du navigateur. */
  positions?: LignePositionnee[];
}

interface Paquet {
  x: number;
  s: string;
  largeur: number;
  hauteur: number;
}

/**
 * Les rapports de diagnostic sont mis en page en colonnes et en tableaux : pris
 * dans l'ordre du PDF, les fragments sont inexploitables. On les regroupe donc
 * par ligne de base (Y) puis on les trie de gauche à droite (X).
 */
function regrouper(items: Fragment[]): { y: number; frags: Paquet[] }[] {
  const paquets = new Map<number, Paquet[]>();

  for (const item of items) {
    if (!item.str.trim()) continue;
    const y = item.transform[5] ?? 0;
    const cle = Math.round(y / 3) * 3; // tolérance de 3 pt sur la ligne de base
    const frag: Paquet = {
      x: item.transform[4] ?? 0,
      s: item.str,
      largeur: item.width ?? 0,
      hauteur: item.height ?? Math.abs(item.transform[3] ?? 10)
    };
    const paquet = paquets.get(cle);
    if (paquet) paquet.push(frag);
    else paquets.set(cle, [frag]);
  }

  return [...paquets.entries()]
    .sort((a, b) => b[0] - a[0]) // haut de page → bas de page
    .map(([y, frags]) => ({ y, frags: frags.sort((a, b) => a.x - b.x) }));
}

function assembler(frags: Paquet[]): string {
  return frags
    .map((f) => f.s)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function lignesDePage(items: Fragment[]): string[] {
  return regrouper(items)
    .map(({ frags }) => assembler(frags))
    .filter((l) => l.length > 0);
}

/** Mêmes lignes, avec leur emplacement sur la page. */
export function lignesPositionnees(items: Fragment[]): LignePositionnee[] {
  const res: LignePositionnee[] = [];

  for (const { y, frags } of regrouper(items)) {
    const texte = assembler(frags);
    if (!texte) continue;

    const premier = frags[0];
    const dernier = frags[frags.length - 1];
    if (!premier || !dernier) continue;

    const hauteur = Math.max(...frags.map((f) => f.hauteur), 8);
    res.push({
      texte,
      x: premier.x,
      y,
      largeur: Math.max(dernier.x + dernier.largeur - premier.x, 10),
      hauteur
    });
  }

  return res;
}
