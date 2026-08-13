/**
 * « Les diags pour les nuls » — l'assemblage.
 *
 * Un thème par fichier, réunis ici. C'est le seul point d'entrée : le générateur
 * de pages et l'application ne connaissent que ce module.
 */
export * from './socle';
export { DESSINS, dessin, type Dessin } from './dessins';

import type { Question, Theme } from './socle';
import { BASES } from './themes/bases';
import { DPE } from './themes/dpe';
import { VENDRE } from './themes/vendre';
import { LOUER } from './themes/louer';
import { ELEC_GAZ } from './themes/elec-gaz';
import { AMIANTE } from './themes/amiante';
import { PLOMB } from './themes/plomb';
import { TERMITES } from './themes/termites';
import { RISQUES } from './themes/risques';
import { SURFACES } from './themes/surfaces';
import { ASSAINISSEMENT } from './themes/assainissement';
import { COPROPRIETE } from './themes/copropriete';
import { MON_RAPPORT } from './themes/mon-rapport';

/**
 * L'ordre compte : c'est celui de la page d'accueil de la rubrique, et il suit
 * le chemin du lecteur — d'abord ce qu'est un diagnostic, puis celui qui pèse
 * le plus, puis les situations, puis les diagnostics un par un, et enfin quoi
 * faire de son rapport.
 */
export const THEMES: Theme[] = [
  BASES,
  DPE,
  VENDRE,
  LOUER,
  ELEC_GAZ,
  AMIANTE,
  PLOMB,
  TERMITES,
  RISQUES,
  SURFACES,
  ASSAINISSEMENT,
  COPROPRIETE,
  MON_RAPPORT
];

/** Toutes les questions, avec le thème auquel chacune appartient. */
export interface Fiche {
  theme: Theme;
  question: Question;
}

export const FICHES: Fiche[] = THEMES.flatMap((theme) =>
  theme.questions.map((question) => ({ theme, question }))
);

export const fiche = (id: string): Fiche | undefined => FICHES.find((f) => f.question.id === id);

export const theme = (id: string): Theme | undefined => THEMES.find((t) => t.id === id);

/**
 * Les questions liées à une autre : celles qu'elle désigne, complétées par ses
 * voisines de thème quand elle n'en désigne pas assez. Une page sans porte de
 * sortie est une impasse — pour le lecteur comme pour un moteur de recherche.
 */
export function liees(depart: Fiche, combien = 4): Fiche[] {
  const retenues: Fiche[] = [];
  const vu = new Set<string>([depart.question.id]);

  for (const id of depart.question.aussi ?? []) {
    const trouvee = fiche(id);
    if (trouvee && !vu.has(id)) {
      retenues.push(trouvee);
      vu.add(id);
    }
  }

  for (const voisine of depart.theme.questions) {
    if (retenues.length >= combien) break;
    if (vu.has(voisine.id)) continue;
    retenues.push({ theme: depart.theme, question: voisine });
    vu.add(voisine.id);
  }

  return retenues.slice(0, combien);
}

/**
 * Les identifiants cités par un `aussi` qui ne correspondent à aucune question.
 * Le générateur s'arrête dessus : un lien mort dans une rubrique dont le but est
 * le maillage interne serait une faute silencieuse.
 */
export function liensMorts(): string[] {
  const connus = new Set(FICHES.map((f) => f.question.id));
  const morts = new Set<string>();

  for (const { question } of FICHES) {
    for (const id of question.aussi ?? []) {
      if (!connus.has(id)) morts.add(`${question.id} → ${id}`);
    }
  }

  return [...morts];
}
