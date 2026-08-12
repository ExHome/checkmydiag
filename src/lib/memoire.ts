/**
 * Les dossiers déjà analysés, gardés sur l'appareil.
 *
 * Le stockage local du navigateur, rien d'autre : aucun envoi, aucun compte.
 * La promesse du site reste vraie — ces données ne sortent pas de la machine,
 * et le lecteur peut les effacer d'un bouton.
 *
 * On garde l'analyse, jamais le PDF : trop lourd, et inutile puisqu'on sait
 * déjà tout ce qu'il faut en dire.
 */
import type { Analyse } from './modele';

const CLE = 'checkmydiag.dossiers';
const MAXIMUM = 10;

export interface DossierGarde {
  id: string;
  nomFichier: string;
  /** Date d'analyse, au format ISO. */
  quand: string;
  analyse: Analyse;
}

function lireTout(): DossierGarde[] {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return [];
    const donnees: unknown = JSON.parse(brut);
    return Array.isArray(donnees) ? (donnees as DossierGarde[]) : [];
  } catch {
    // Stockage indisponible (navigation privée, quota) : on continue sans.
    return [];
  }
}

export function dossiersGardes(): DossierGarde[] {
  return lireTout();
}

export function garder(nomFichier: string, analyse: Analyse, maintenant: Date): DossierGarde[] {
  const dossier: DossierGarde = {
    id: `${maintenant.getTime()}`,
    nomFichier,
    quand: maintenant.toISOString(),
    analyse
  };

  // Un même fichier réanalysé remplace l'ancienne version.
  const autres = lireTout().filter((d) => d.nomFichier !== nomFichier);
  const tous = [dossier, ...autres].slice(0, MAXIMUM);

  try {
    localStorage.setItem(CLE, JSON.stringify(tous));
  } catch {
    // Quota dépassé : on garde au moins le dernier dossier.
    try {
      localStorage.setItem(CLE, JSON.stringify([dossier]));
    } catch {
      return tous;
    }
  }

  return tous;
}

export function oublier(id: string): DossierGarde[] {
  const restants = lireTout().filter((d) => d.id !== id);
  try {
    localStorage.setItem(CLE, JSON.stringify(restants));
  } catch {
    // Rien à faire de plus : la liste en mémoire fait foi pour l'affichage.
  }
  return restants;
}

export function toutOublier(): void {
  try {
    localStorage.removeItem(CLE);
  } catch {
    // Idem.
  }
}

/** « il y a 3 jours », pour l'affichage. */
export function depuis(quand: string, maintenant: Date): string {
  const jours = Math.floor((maintenant.getTime() - new Date(quand).getTime()) / 86_400_000);
  if (jours <= 0) return 'aujourd’hui';
  if (jours === 1) return 'hier';
  if (jours < 31) return `il y a ${jours} jours`;
  const mois = Math.floor(jours / 30);
  return mois === 1 ? 'il y a 1 mois' : `il y a ${mois} mois`;
}
