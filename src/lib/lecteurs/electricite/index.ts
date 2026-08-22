/**
 * Les lecteurs d'électricité, un par éditeur.
 *
 * Un seul est écrit à ce jour : LICIEL, mesuré sur neuf volets. AnalysImmo et
 * DPE WIN sont lus et documentés dans `docs/OU-PARSER.md` § ÉLECTRICITÉ, mais
 * n'ont pas encore leur lecteur — devant eux, l'aiguillage rend « format
 * inconnu », et c'est le comportement voulu : **on se tait plutôt que de
 * deviner avec le lecteur d'un autre.**
 */
import type { Lecteur } from '../socle';
import { electriciteLiciel, type LectureElectricite } from './liciel';

export type { LectureElectricite };

export const LECTEURS_ELECTRICITE: readonly Lecteur<LectureElectricite>[] = [electriciteLiciel];
