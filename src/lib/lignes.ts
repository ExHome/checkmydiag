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
}

export interface PageTexte {
  numero: number;
  lignes: string[];
}

/**
 * Les rapports de diagnostic sont mis en page en colonnes et en tableaux : pris
 * dans l'ordre du PDF, les fragments sont inexploitables. On les regroupe donc
 * par ligne de base (Y) puis on les trie de gauche à droite (X).
 */
export function lignesDePage(items: Fragment[]): string[] {
  const paquets = new Map<number, { x: number; s: string }[]>();

  for (const item of items) {
    if (!item.str.trim()) continue;
    const y = item.transform[5] ?? 0;
    const cle = Math.round(y / 3) * 3; // tolérance de 3 pt sur la ligne de base
    const frag = { x: item.transform[4] ?? 0, s: item.str };
    const paquet = paquets.get(cle);
    if (paquet) paquet.push(frag);
    else paquets.set(cle, [frag]);
  }

  return [...paquets.entries()]
    .sort((a, b) => b[0] - a[0]) // haut de page → bas de page
    .map(([, frags]) =>
      frags
        .sort((a, b) => a.x - b.x)
        .map((f) => f.s)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter((l) => l.length > 0);
}
