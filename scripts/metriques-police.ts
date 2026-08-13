/**
 * Les largeurs de caractères, lues dans la police elle-même.
 *
 * Les cartes de partage coupent un titre en lignes, donc ont besoin de savoir ce
 * que mesure un texte avant de le dessiner. La voie évidente — rendre le texte
 * et lire sa boîte — coûte plus de 200 ms par mesure : plusieurs minutes pour un
 * build, mesuré. On lit donc les tables du fichier de police, ce qui est
 * instantané et donne les mêmes largeurs, puisque c'est la même source.
 *
 * Cela ne vaut que pour une police **statique** : sur une police variable, les
 * largeurs de `hmtx` sont celles de l'instance par défaut, corrigées ensuite par
 * `HVAR` selon les axes. La police des cartes est figée avant d'arriver ici
 * (voir `police-cartes.ts`), et `metriques-police.test.ts` vérifie que la mesure
 * colle bien au tracé.
 *
 * Le crénage est ignoré — l'écart est de l'ordre du pour cent, et la mise en
 * page garde une marge plus grande.
 */

interface Tables {
  [tag: string]: { debut: number; longueur: number };
}

function tables(police: Buffer): Tables {
  const nombre = police.readUInt16BE(4);
  const trouvees: Tables = {};
  for (let i = 0; i < nombre; i++) {
    const entree = 12 + i * 16;
    trouvees[police.toString('ascii', entree, entree + 4)] = {
      debut: police.readUInt32BE(entree + 8),
      longueur: police.readUInt32BE(entree + 12)
    };
  }
  return trouvees;
}

/**
 * La table de correspondance caractère → glyphe, au format 4 : celui du plan
 * multilingue de base, donc de tout ce qu'on écrit en français.
 */
function correspondance(police: Buffer, debutCmap: number): Map<number, number> {
  const sous = police.readUInt16BE(debutCmap + 2);
  let debut = 0;

  for (let i = 0; i < sous; i++) {
    const entree = debutCmap + 4 + i * 8;
    const plateforme = police.readUInt16BE(entree);
    const encodage = police.readUInt16BE(entree + 2);
    const decalage = debutCmap + police.readUInt32BE(entree + 4);
    // Windows/Unicode BMP d'abord, Unicode générique ensuite.
    if ((plateforme === 3 && encodage === 1) || plateforme === 0) {
      if (police.readUInt16BE(decalage) === 4) {
        debut = decalage;
        if (plateforme === 3) break;
      }
    }
  }

  const table = new Map<number, number>();
  if (!debut) return table;

  const segments = police.readUInt16BE(debut + 6) / 2;
  const fins = debut + 14;
  const departs = fins + segments * 2 + 2;
  const deltas = departs + segments * 2;
  const ecarts = deltas + segments * 2;

  for (let s = 0; s < segments; s++) {
    const fin = police.readUInt16BE(fins + s * 2);
    const depart = police.readUInt16BE(departs + s * 2);
    const delta = police.readInt16BE(deltas + s * 2);
    const ecart = police.readUInt16BE(ecarts + s * 2);
    if (depart === 0xffff) continue;

    for (let code = depart; code <= fin && code !== 0x10000; code++) {
      let glyphe: number;
      if (ecart === 0) {
        glyphe = (code + delta) & 0xffff;
      } else {
        const ou = ecarts + s * 2 + ecart + (code - depart) * 2;
        if (ou + 1 >= police.length) continue;
        const brut = police.readUInt16BE(ou);
        glyphe = brut === 0 ? 0 : (brut + delta) & 0xffff;
      }
      if (glyphe) table.set(code, glyphe);
    }
  }

  return table;
}

/** Mesure un texte à une taille donnée, en pixels. */
export type Mesure = (texte: string, taille: number) => number;

export function mesureur(police: Buffer): Mesure {
  const t = tables(police);
  const head = t['head'];
  const hhea = t['hhea'];
  const hmtx = t['hmtx'];
  const cmap = t['cmap'];
  if (!head || !hhea || !hmtx || !cmap) {
    throw new Error('Police incomplète : head, hhea, hmtx et cmap sont nécessaires.');
  }

  const unites = police.readUInt16BE(head.debut + 18);
  const metriques = police.readUInt16BE(hhea.debut + 34);
  const table = correspondance(police, cmap.debut);

  /**
   * La largeur d'avance du glyphe, en unités de dessin. Au-delà de la table, la
   * dernière largeur vaut pour tous les glyphes suivants — c'est la règle du
   * format, et c'est ce qui permet aux polices monospace de ne stocker qu'une
   * valeur.
   */
  const largeurGlyphe = (glyphe: number): number =>
    police.readUInt16BE(hmtx.debut + Math.min(glyphe, metriques - 1) * 4);

  // La largeur d'un caractère absent de la police : celle de l'espace. Un
  // caractère absent ne sera pas dessiné, mais mieux vaut le compter que de
  // sous-estimer la ligne.
  const secours = largeurGlyphe(table.get(32) ?? 0);
  const cache = new Map<number, number>();

  return (texte: string, taille: number): number => {
    let total = 0;
    for (const lettre of texte) {
      const code = lettre.codePointAt(0) ?? 32;
      let largeur = cache.get(code);
      if (largeur === undefined) {
        const glyphe = table.get(code);
        largeur = glyphe === undefined ? secours : largeurGlyphe(glyphe);
        cache.set(code, largeur);
      }
      total += largeur;
    }
    return (total / unites) * taille;
  };
}
