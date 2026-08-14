/**
 * Les familles du dossier.
 *
 * Sept diagnostics à la suite, c'est une liste ; répartis en familles, c'est un
 * dossier. Le lecteur ne connaît pas les noms des rapports — il sait en
 * revanche ce qui l'inquiète : ce qui peut blesser, ce qu'on respire, ce que le
 * logement coûte.
 *
 * L'ordre n'est pas celui de la réglementation mais celui de l'enjeu : ce qui
 * touche aux personnes vient avant ce qui touche à l'argent.
 *
 * Ce fichier est la source unique : le sommaire et le tableau de bord y
 * puisent tous les deux. Deux listes finiraient par diverger.
 */
import type { TypeDiag } from './modele';

export interface Famille {
  cle: string;
  nom: string;
  /** Ce que la famille recouvre, en mots de tous les jours. */
  quoi: string;
  types: readonly TypeDiag[];
}

export const FAMILLES: readonly Famille[] = [
  { cle: 'securite', nom: 'Sécurité', quoi: 'Ce qui peut blesser', types: ['electricite', 'gaz'] },
  { cle: 'sante', nom: 'Santé', quoi: 'Ce qu’on respire ou touche', types: ['amiante', 'plomb'] },
  { cle: 'energie', nom: 'Énergie', quoi: 'Ce que le logement consomme', types: ['dpe'] },
  {
    cle: 'bati',
    nom: 'Bâti et environnement',
    quoi: 'Le terrain et la structure',
    types: ['termites', 'erp', 'assainissement']
  },
  { cle: 'surfaces', nom: 'Surfaces', quoi: 'Ce qui sera écrit dans l’acte', types: ['carrez'] }
];

/** La famille d'un diagnostic, ou rien si le type n'est pas classé. */
export function familleDe(type: TypeDiag | undefined): Famille | null {
  if (!type) return null;
  return FAMILLES.find((f) => f.types.includes(type)) ?? null;
}
