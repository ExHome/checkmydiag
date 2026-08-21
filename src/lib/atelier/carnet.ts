/**
 * LE CARNET DE L'ATELIER — ce que la zone de travail retient d'une fois sur l'autre.
 *
 * La zone de travail est le lieu où Aude travaille, pas un écran de passage
 * (décision du 21/08/2026). Un lieu de travail garde la trace : ce qui a été
 * lu, chez quel éditeur, ce qui a été qualifié. Sans ça la boucle ne se ferme
 * jamais — on rouvre les mêmes rapports et on redécouvre les mêmes choses.
 *
 * BASE SÉPARÉE, VOLONTAIREMENT. Le coffre du produit (`src/lib/coffre.ts`)
 * garde les dossiers du visiteur dans la base `checkmydiag`. Le carnet vit dans
 * `verriere-atelier` : deux outils, deux bases, aucune migration de schéma de
 * l'un qui puisse casser l'autre.
 *
 * CE QUI RESTE SUR LA MACHINE. IndexedDB est local au navigateur : rien ne part
 * sur un serveur. Le carnet conserve en revanche le NOM du fichier — donc
 * souvent le nom d'un client — parce qu'Aude doit reconnaître ses dossiers d'un
 * coup d'œil. C'est son poste et ce sont ses clients ; l'écran le dit, et
 * `viderCarnet()` efface tout d'un geste.
 */

const BASE = 'verriere-atelier';
const RAYON = 'lectures';
/** Le carnet n'est pas une archive : au-delà, les plus anciennes s'effacent. */
const MAXIMUM = 200;

/** Un échange avec Claude, rattaché au rapport ouvert. */
export interface Tour {
  role: 'aude' | 'claude';
  texte: string;
}

export interface Lecture {
  /** Empreinte stable du rapport : le même fichier rouvert retrouve sa fiche. */
  id: string;
  nomFichier: string;
  /** Date de la dernière ouverture, au format ISO. */
  quand: string;
  pages: number;
  /** L'éditeur nommé, ou `null` quand rien ne le nomme. */
  editeur: string | null;
  genre: string;
  /** Ce qu'Aude a qualifié : la seule chose qui fasse avancer le moteur. */
  notes: string[];
  /** Le fil avec Claude sur ce rapport. */
  fil: Tour[];
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

function transaction<T>(
  mode: IDBTransactionMode,
  action: (rayon: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
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

/**
 * L'empreinte d'un rapport — son nom et sa taille, pas son contenu.
 *
 * Suffit à répondre à la seule question qui compte au dépôt : « celui-là, je
 * l'ai déjà ouvert ? ». Lire dix mégaoctets pour un hachage à chaque dépôt
 * coûterait plus que ça ne rapporte.
 */
export function empreinte(nomFichier: string, octets: number): string {
  let somme = 0;
  for (let i = 0; i < nomFichier.length; i++) {
    somme = (somme * 31 + nomFichier.charCodeAt(i)) >>> 0;
  }
  return `${somme.toString(36)}-${octets.toString(36)}`;
}

/** Les lectures, de la plus récente à la plus ancienne. */
export async function listerLectures(): Promise<Lecture[]> {
  try {
    const tout = await transaction<Lecture[]>('readonly', (rayon) => rayon.getAll());
    return tout.sort((a, b) => b.quand.localeCompare(a.quand));
  } catch {
    /* Navigation privée, quota refusé : l'atelier marche sans carnet. */
    return [];
  }
}

export async function lireFiche(id: string): Promise<Lecture | null> {
  try {
    return (await transaction<Lecture | undefined>('readonly', (rayon) => rayon.get(id))) ?? null;
  } catch {
    return null;
  }
}

/**
 * Inscrit ou met à jour une fiche, puis renvoie le carnet à jour.
 *
 * Une fiche existante garde ses notes et son fil : rouvrir un rapport ne doit
 * jamais effacer ce qu'on en avait dit.
 */
export async function inscrire(fiche: Lecture): Promise<Lecture[]> {
  try {
    const ancienne = await lireFiche(fiche.id);
    const fusion: Lecture = ancienne
      ? { ...fiche, notes: ancienne.notes, fil: ancienne.fil }
      : fiche;
    await transaction('readwrite', (rayon) => rayon.put(fusion));

    const carnet = await listerLectures();
    for (const vieille of carnet.slice(MAXIMUM)) {
      await transaction('readwrite', (rayon) => rayon.delete(vieille.id));
    }
    return carnet.slice(0, MAXIMUM);
  } catch {
    return [];
  }
}

/** Ajoute une qualification. C'est ce qui fait avancer le moteur. */
export async function noter(id: string, note: string): Promise<Lecture | null> {
  const fiche = await lireFiche(id);
  if (!fiche) return null;
  const majuscule: Lecture = { ...fiche, notes: [...fiche.notes, note] };
  await transaction('readwrite', (rayon) => rayon.put(majuscule));
  return majuscule;
}

/** Prolonge le fil avec Claude sur ce rapport. */
export async function prolongerFil(id: string, tours: Tour[]): Promise<void> {
  const fiche = await lireFiche(id);
  if (!fiche) return;
  await transaction('readwrite', (rayon) => rayon.put({ ...fiche, fil: [...fiche.fil, ...tours] }));
}

/** Efface tout le carnet — un geste, et il ne reste rien sur la machine. */
export async function viderCarnet(): Promise<void> {
  try {
    await transaction('readwrite', (rayon) => rayon.clear());
  } catch {
    /* Rien à vider. */
  }
}
