/**
 * Le coffre : les rapports gardés sur l'appareil, PDF compris.
 *
 * IndexedDB, pas le stockage local : un dossier technique pèse dix mégaoctets,
 * là où localStorage plafonne à cinq pour tout le site. Le fichier lui-même est
 * conservé, ce qui permet de rouvrir un dossier avec ses pages annotées, sans le
 * redéposer.
 *
 * Cela reste sur la machine : IndexedDB est local au navigateur, rien ne part
 * sur un serveur. La promesse du site tient.
 */
import type { Analyse } from './modele';

const BASE = 'checkmydiag';
const RAYON = 'dossiers';
const MAXIMUM = 10;

export interface DossierGarde {
  id: string;
  nomFichier: string;
  /** Date d'analyse, au format ISO. */
  quand: string;
  analyse: Analyse;
  /** Le rapport d'origine, pour pouvoir le redessiner. */
  pdf?: Blob;
}

function ouvrir(): Promise<IDBDatabase> {
  return new Promise((resoudre, rejeter) => {
    const requete = indexedDB.open(BASE, 1);
    requete.onupgradeneeded = () => {
      const base = requete.result;
      if (!base.objectStoreNames.contains(RAYON)) {
        base.createObjectStore(RAYON, { keyPath: 'id' });
      }
    };
    requete.onsuccess = () => resoudre(requete.result);
    requete.onerror = () => rejeter(requete.error);
  });
}

function transaction<T>(mode: IDBTransactionMode, action: (rayon: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return ouvrir().then(
    (base) =>
      new Promise<T>((resoudre, rejeter) => {
        const tx = base.transaction(RAYON, mode);
        const requete = action(tx.objectStore(RAYON));
        requete.onsuccess = () => resoudre(requete.result);
        requete.onerror = () => rejeter(requete.error);
        tx.oncomplete = () => base.close();
      })
  );
}

/** La liste, du plus récent au plus ancien. Sans les PDF : trop lourds à charger. */
export async function listerDossiers(): Promise<DossierGarde[]> {
  try {
    const tous = await transaction<DossierGarde[]>('readonly', (rayon) => rayon.getAll());
    return tous
      .map(({ pdf, ...reste }) => ({ ...reste, ...(pdf ? { pdf } : {}) }))
      .sort((a, b) => b.quand.localeCompare(a.quand));
  } catch {
    // Navigation privée, stockage refusé : on continue sans mémoire.
    return [];
  }
}

export async function garderDossier(
  nomFichier: string,
  analyse: Analyse,
  pdf: Blob,
  maintenant: Date
): Promise<DossierGarde[]> {
  const dossier: DossierGarde = {
    id: `${maintenant.getTime()}`,
    nomFichier,
    quand: maintenant.toISOString(),
    analyse,
    pdf
  };

  try {
    const existants = await listerDossiers();

    // Le même fichier réanalysé remplace l'ancienne version ; au-delà de dix
    // dossiers, les plus vieux sortent.
    const aSupprimer = existants
      .filter((d) => d.nomFichier === nomFichier)
      .concat(existants.filter((d) => d.nomFichier !== nomFichier).slice(MAXIMUM - 1));

    for (const vieux of aSupprimer) {
      await transaction('readwrite', (rayon) => rayon.delete(vieux.id));
    }

    await transaction('readwrite', (rayon) => rayon.put(dossier));
  } catch {
    // Quota dépassé : le dossier n'est pas gardé, l'analyse en cours reste
    // affichée. On ne bloque jamais la lecture pour un problème de stockage.
  }

  return listerDossiers();
}

/** Le dossier complet, PDF inclus. */
export async function chargerDossier(id: string): Promise<DossierGarde | null> {
  try {
    const dossier = await transaction<DossierGarde | undefined>('readonly', (rayon) => rayon.get(id));
    return dossier ?? null;
  } catch {
    return null;
  }
}

export async function oublierDossier(id: string): Promise<DossierGarde[]> {
  try {
    await transaction('readwrite', (rayon) => rayon.delete(id));
  } catch {
    // Rien à faire de plus.
  }
  return listerDossiers();
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

/** Poids lisible d'un fichier gardé. */
export function poids(octets: number): string {
  const mo = octets / 1_048_576;
  return mo >= 1 ? `${mo.toFixed(1)} Mo` : `${Math.round(octets / 1024)} Ko`;
}
