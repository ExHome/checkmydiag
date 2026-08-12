/**
 * CREP — constat de risque d'exposition au plomb.
 *
 * Le rapport classe chaque « unité de diagnostic » (une porte, une plinthe, un
 * mur…) de 0 à 3. Seules les classes 2 et 3 comptent vraiment, et la 3 déclenche
 * une obligation de travaux.
 */
import type { Diagnostic, Fait, Gravite } from '../modele';
import { nombre, trouver, contient } from './texte';

/**
 * Le tableau de conclusion se présente ainsi :
 *   « Total Non mesurées Classe 0 Classe 1 Classe 2 Classe 3 »
 *   « Nombre d’unités »
 *   « 70 33 36 0 0 1 »
 * On cherche donc la première ligne de six nombres qui suit l'en-tête.
 */
function compter(lignes: string[]): {
  total: number;
  nonMesurees: number;
  classes: [number, number, number, number];
} | null {
  const debut = lignes.findIndex((l) => /Total.*Non mesur.*Classe 0/i.test(l));
  const zone = debut >= 0 ? lignes.slice(debut, debut + 6) : lignes;

  for (const ligne of zone) {
    const brut = ligne.trim();
    if (brut.includes('%')) continue;
    const nombres = brut.match(/\d+/g);
    if (!nombres || nombres.length < 6) continue;
    const n = nombres.slice(0, 6).map(Number) as [number, number, number, number, number, number];
    const [total, nonMesurees, c0, c1, c2, c3] = n;
    // Contrôle de cohérence : la somme doit retomber sur le total.
    if (nonMesurees + c0 + c1 + c2 + c3 !== total) continue;
    return { total, nonMesurees, classes: [c0, c1, c2, c3] };
  }
  return null;
}

export function analyserPlomb(lignes: string[], plage: [number, number]): Diagnostic {
  const chiffres = compter(lignes);
  const c2 = chiffres?.classes[2] ?? 0;
  const c3 = chiffres?.classes[3] ?? 0;

  let gravite: Gravite = 'neutre';
  let verdict = "Un constat plomb est présent, mais son tableau de conclusion n'a pas pu être lu.";

  if (chiffres) {
    if (c3 > 0) {
      gravite = 'alerte';
      verdict = `${c3} revêtement${c3 > 1 ? 's' : ''} au plomb en mauvais état (classe 3) : des travaux sont obligatoires.`;
    } else if (c2 > 0) {
      gravite = 'attention';
      verdict = `${c2} revêtement${c2 > 1 ? 's' : ''} au plomb en état dégradé (classe 2) : à surveiller et à entretenir.`;
    } else if (chiffres.classes[1] > 0) {
      gravite = 'bon';
      verdict = 'Du plomb est présent, mais tous les revêtements concernés sont en bon état (classe 1).';
    } else {
      gravite = 'bon';
      verdict = 'Aucun revêtement contenant du plomb au-delà du seuil réglementaire.';
    }
  }

  const faits: Fait[] = [];
  if (chiffres) {
    faits.push({
      libelle: 'Éléments contrôlés',
      valeur: String(chiffres.total),
      precision: 'murs, portes, plinthes, fenêtres…'
    });
    faits.push({
      libelle: 'En mauvais état',
      valeur: String(c3),
      precision: c3 > 0 ? 'travaux obligatoires' : 'classe 3'
    });
    faits.push({ libelle: 'Usés ou éraflés', valeur: String(c2), precision: 'classe 2' });
    faits.push({
      libelle: 'Avec plomb, mais intacts',
      valeur: String(chiffres.classes[1]),
      precision: 'classe 1'
    });
  }
  const date = trouver(lignes, /rédigé par .{0,40}? le\s*(\d{2}\/\d{2}\/\d{4})/i);
  if (date?.[1]) faits.push({ libelle: 'Date du constat', valeur: date[1] });

  const explication = [
    'Le CREP — le constat plomb — ne regarde pas les canalisations : il mesure le plomb des peintures, mur par mur, avec un appareil qu’on pose sur la surface. Chaque élément mesuré (un mur, une porte, une plinthe) est appelé « unité de diagnostic » dans le rapport.',
    'Les classes vont de 0 à 3 : pas de plomb, du plomb sous une peinture intacte, une peinture usée ou éraflée, et enfin une peinture dégradée qui s’écaille. Seule la dernière pose vraiment problème.',
    'Le danger vient des poussières et des écailles avalées, surtout par les jeunes enfants et les femmes enceintes — c’est ce qu’on appelle le saturnisme. Un mur au plomb en bon état, qu’on laisse tranquille, n’est pas dangereux.'
  ];

  const aFaire =
    c3 > 0
      ? [
          'Le propriétaire doit faire réaliser les travaux qui suppriment l’exposition (recouvrement, remplacement ou retrait par une entreprise formée) — article L.1334-9 du code de la santé publique.',
          'Le constat complet, annexes comprises, doit être remis aux occupants et à toute entreprise appelée à travailler dans le logement.',
          'Ne poncez jamais une peinture au plomb à sec : c’est le geste qui contamine tout le logement.',
          'Avec au moins une classe 3, le CREP n’est valable qu’un an à la vente (six ans à la location).'
        ]
      : [
          'Sans classe 3, aucun travaux n’est imposé.',
          'Un CREP sans plomb dégradé est valable six ans à la location, et sans limite de durée à la vente si aucun plomb n’a été détecté.',
          'Surveillez l’état des peintures anciennes : une classe 1 qui s’écaille devient une classe 3.'
        ];

  return {
    type: 'plomb',
    titre: 'Plomb dans les peintures (CREP)',
    verdict,
    gravite,
    faits,
    explication,
    aFaire,
    schema: chiffres
      ? {
          genre: 'plomb',
          classes: chiffres.classes,
          nonMesurees: chiffres.nonMesurees,
          total: chiffres.total
        }
      : null,
    pages: plage,
    ...(date?.[1] ? { date: date[1] } : {})
  };
}

/** Vrai si le rapport conclut explicitement à l'absence de plomb. */
export function plombAbsent(lignes: string[]): boolean {
  return contient(lignes, "n'a pas été repéré de revêtements contenant du plomb");
}

export const _interne = { compter };

/** Ré-export utilitaire pour les tests. */
export const _nombre = nombre;
