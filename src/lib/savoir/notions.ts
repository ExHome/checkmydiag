/**
 * La cartographie du savoir : toutes les notions, assemblées.
 *
 * Chaque diagnostic apporte les siennes (§ 17) ; elles partagent la grammaire
 * définie dans `socle.ts`. Ce fichier ne fait que réunir et donner l'accès —
 * c'est le seul point d'entrée des composants.
 */
export * from './socle';

import type { Notion } from './socle';
import { NOTIONS_DPE } from './notions-dpe';
import { NOTIONS_PLOMB } from './notions-plomb';
import { NOTIONS_GAZ } from './notions-gaz';
import { NOTIONS_ELECTRICITE } from './notions-electricite';
import { NOTIONS_AMIANTE } from './notions-amiante';
import { NOTIONS_TERMITES } from './notions-termites';
import { NOTIONS_CARREZ } from './notions-carrez';
import { NOTIONS_ERP } from './notions-erp';
import { NOTIONS_ASSAINISSEMENT } from './notions-assainissement';

export const NOTIONS: Notion[] = [
  ...NOTIONS_DPE,
  ...NOTIONS_PLOMB,
  ...NOTIONS_GAZ,
  ...NOTIONS_ELECTRICITE,
  ...NOTIONS_AMIANTE,
  ...NOTIONS_TERMITES,
  ...NOTIONS_CARREZ,
  ...NOTIONS_ERP,
  ...NOTIONS_ASSAINISSEMENT
];

export const notion = (id: string): Notion | undefined => NOTIONS.find((n) => n.id === id);
