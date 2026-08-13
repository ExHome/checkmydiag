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
export type GenreEchec = 'vide' | 'motDePasse' | 'abime' | 'tropLourd' | 'inconnu';

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
  inconnu:
    'Ce PDF n’a pas pu être ouvert. Vérifiez que c’est bien le rapport envoyé par votre diagnostiqueur, puis réessayez.'
};

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
