/**
 * Quand le PDF ne s'ouvre pas, dire pourquoi — en français, et sans jargon.
 *
 * pdf.js lève des erreurs écrites pour un développeur anglophone (« The PDF
 * file is empty, i.e. its size is zero bytes. »). Les afficher telles quelles
 * ferme la porte au lecteur : il ne sait ni ce qui s'est passé, ni quoi faire.
 *
 * Chaque message dit donc trois choses : ce qui cloche, pourquoi c'est arrivé,
 * et le geste suivant. Aucun n'accuse le diagnostiqueur — un fichier coupé à
 * l'envoi n'est la faute de personne.
 *
 * Module volontairement sans dépendance : il se teste sans navigateur.
 */

/** Ce qui a empêché la lecture, une fois traduit en langage de tous les jours. */
export type GenreEchec =
  | 'vide'
  | 'motDePasse'
  | 'abime'
  | 'tropLourd'
  | 'pasUnPdf'
  | 'scanne'
  | 'inconnu';

export interface Echec {
  genre: GenreEchec;
  message: string;
}

const MESSAGES: Record<GenreEchec, string> = {
  vide: 'Ce fichier est vide : il ne contient rien. Le téléchargement s’est sans doute arrêté avant la fin. Récupérez le rapport une deuxième fois, puis redéposez-le.',
  motDePasse:
    'Ce PDF est fermé par un mot de passe. Demandez à votre diagnostiqueur le même rapport sans mot de passe.',
  abime:
    'Ce fichier est abîmé : il ne s’ouvre pas comme un PDF. Il a peut-être été coupé pendant l’envoi. Redemandez le fichier d’origine.',
  tropLourd:
    'Ce rapport est trop lourd pour ce navigateur. Réessayez sur un ordinateur, ou en fermant les autres onglets.',
  /*
   * Le glisser-déposer ne connaît pas le filtre du sélecteur de fichiers : on
   * peut y lâcher une photo. Autant le dire avec la solution, plutôt que de
   * laisser le lecteur croire que le site ne marche pas.
   */
  pasUnPdf:
    'Ce fichier n’est pas un PDF. Une photo ou une capture d’écran du rapport ne peut pas être lue : demandez à votre diagnostiqueur le PDF d’origine, c’est le fichier qu’il vous a envoyé par courriel.',
  /*
   * Le cas le plus fréquent après le bon fichier, et le plus décevant : un PDF
   * qui n'est qu'une suite d'images scannées. Rien à en extraire, et ce n'est
   * la faute de personne — mais le lecteur doit comprendre que le problème est
   * dans le fichier, pas dans ce qu'il a fait.
   */
  scanne:
    'Ce PDF est un scan : ses pages sont des images, sans texte à l’intérieur. Rien ne peut en être lu automatiquement. Demandez à votre diagnostiqueur le rapport d’origine — celui que son logiciel a produit — plutôt qu’une version numérisée.',
  inconnu:
    'Ce PDF n’a pas pu être ouvert. Vérifiez que c’est bien le rapport envoyé par votre diagnostiqueur, puis réessayez.'
};

/**
 * Ce qu'on peut refuser avant même d'ouvrir le fichier.
 *
 * Deux vérifications qui coûtent zéro seconde et évitent une attente inutile :
 * le type, que le glisser-déposer ne filtre pas, et la taille. Le plafond est
 * volontairement haut — de vrais dossiers de diagnostic dépassent les vingt
 * mégaoctets quand ils portent des photos.
 */
export const TAILLE_MAX = 60 * 1024 * 1024;

export function refusAvantLecture(fichier: File): Echec | null {
  const estPdf =
    fichier.type === 'application/pdf' || /\.pdf$/i.test(fichier.name);
  if (!estPdf) return { genre: 'pasUnPdf', message: MESSAGES.pasUnPdf };
  if (fichier.size === 0) return { genre: 'vide', message: MESSAGES.vide };
  if (fichier.size > TAILLE_MAX) return { genre: 'tropLourd', message: MESSAGES.tropLourd };
  return null;
}

/** Le message du scan, à montrer quand le PDF s'ouvre mais ne porte aucun texte. */
export function echecScanne(): Echec {
  return { genre: 'scanne', message: MESSAGES.scanne };
}

/**
 * Classe une erreur de lecture. On s'appuie sur le nom de l'exception quand
 * pdf.js en donne un, sur le texte sinon : les deux voies existent selon la
 * version et selon l'endroit où l'erreur est levée.
 */
export function genreDEchec(e: unknown): GenreEchec {
  const nom = e instanceof Error ? e.name : '';
  const texte = (e instanceof Error ? e.message : String(e ?? '')).toLowerCase();

  if (nom === 'PasswordException' || texte.includes('password')) return 'motDePasse';
  if (texte.includes('zero bytes') || texte.includes('is empty')) return 'vide';
  if (nom === 'RangeError' || texte.includes('out of memory') || texte.includes('array buffer length'))
    return 'tropLourd';
  if (nom === 'InvalidPDFException' || texte.includes('invalid pdf')) return 'abime';

  return 'inconnu';
}

/** La phrase à montrer au lecteur quand le rapport n'a pas pu être ouvert. */
export function echecDeLecture(e: unknown): Echec {
  const genre = genreDEchec(e);
  return { genre, message: MESSAGES[genre] };
}
