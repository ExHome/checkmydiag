/**
 * Contrôle du dossier : ce qui est périmé, ce qui manque, ce qui ne concorde pas.
 *
 * C'est ce qui distingue « comprendre son diagnostic » de « vérifier son
 * diagnostic ». Deux principes, non négociables :
 *
 *  - on ne signale une incohérence que si les deux valeurs comparées ont été
 *    lues sans ambiguïté. Une fausse alerte sur un document légal coûte plus
 *    cher qu'un contrôle manqué ;
 *  - on n'accuse personne. Le rapport complet n'est pas sous nos yeux et il
 *    existe souvent une bonne raison : on propose une question à poser.
 */
import type { Bien, Diagnostic, PointDeControle, TypeDiag } from '../modele';

/** Durée de validité, en mois, pour une vente. */
export const VALIDITE_MOIS: Partial<Record<TypeDiag, number>> = {
  dpe: 120,
  termites: 6,
  erp: 6,
  electricite: 36,
  gaz: 36,
  assainissement: 36
};

const NOMS: Record<TypeDiag, string> = {
  dpe: 'le DPE',
  amiante: 'le repérage amiante',
  plomb: 'le constat plomb',
  electricite: 'le diagnostic électricité',
  gaz: 'le diagnostic gaz',
  termites: 'l’état termites',
  erp: 'l’état des risques',
  carrez: 'le mesurage de la surface',
  assainissement: 'le contrôle assainissement'
};

/** « 12/03/2026 » → Date, ou null si la chaîne n'est pas une date lisible. */
export function enDate(texte: string | undefined): Date | null {
  if (!texte) return null;
  const m = texte.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, j, mois, a] = m;
  const d = new Date(Number(a), Number(mois) - 1, Number(j));
  return Number.isNaN(d.getTime()) ? null : d;
}

function moisEcoules(depuis: Date, jusqu: Date): number {
  return (jusqu.getFullYear() - depuis.getFullYear()) * 12 + (jusqu.getMonth() - depuis.getMonth());
}

/** « 1948 », « Avant 1948 », « avant 1949 » → 1948. */
function anneeDe(texte: string | undefined): number | null {
  const m = texte?.match(/(\d{4})/);
  const n = m?.[1] ? Number(m[1]) : null;
  return n !== null && n > 1700 && n < 2100 ? n : null;
}

/** Première lettre en majuscule : ces libellés ouvrent une phrase. */
function majuscule(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** 48.5 → « 48,5 » : on écrit les nombres à la française. */
function nombreFr(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

/**
 * Durée en clair. On reste en mois jusqu'à deux ans : « il y a 2 ans » pour
 * dix-huit mois donnerait au lecteur une idée fausse de l'ancienneté.
 */
function ans(mois: number): string {
  if (mois < 24) return `${mois} mois`;
  return `${Math.floor(mois / 12)} ans`;
}

/** « Avant 1948 » → « d’avant 1948 » ; « 1975 » → « de 1975 ». */
function formuleAnnee(texte: string | undefined): string {
  const brut = (texte ?? '').trim();
  if (/^avant/i.test(brut)) return `d’${brut.toLowerCase()}`;
  return `de ${brut}`;
}

/** Contrôle 1 — la date de validité est-elle dépassée ? */
function perimes(diagnostics: Diagnostic[], aujourdhui: Date): PointDeControle[] {
  const points: PointDeControle[] = [];

  for (const diag of diagnostics) {
    const duree = VALIDITE_MOIS[diag.type];
    const date = enDate(diag.date);
    if (!duree || !date) continue;

    const age = moisEcoules(date, aujourdhui);
    if (age <= duree) continue;

    points.push({
      genre: 'perime',
      type: diag.type,
      titre: `${majuscule(NOMS[diag.type])} n’est plus valable`,
      explication: `Il a été fait le ${diag.date}, il y a ${ans(age)}. Ce diagnostic vaut ${ans(duree)}. Passé ce délai, il ne compte plus pour une vente.`,
      quoiFaire: 'Il faut le refaire avant de signer. Demandez au vendeur ou à l’agence de le mettre à jour.'
    });
  }

  return points;
}

/**
 * Âge à partir duquel l'état de l'installation électrique devient obligatoire
 * pour vendre. C'est l'âge de l'INSTALLATION, pas du bâtiment : on ne peut donc
 * que poser la question, jamais affirmer que le dossier est incomplet.
 */
const ANS_INSTALLATION = 15;

/**
 * Contrôle 2 — un diagnostic obligatoire manque-t-il, vu l'âge du bien ?
 *
 * Garde-fou : « il manque X dans ce dossier » n'a de sens que si le document
 * déposé EST un dossier. Un audit énergétique n'est pas un dossier incomplet,
 * c'est un autre document — et sur de vrais rapports, quinze réclamations
 * infondées partaient ainsi vers des audits, souvent accompagnés d'un simple
 * état termites.
 *
 * Deux signes valent preuve : la page « résumé de l'expertise », qui n'existe
 * que dans un dossier technique, ou trois diagnostics de types différents.
 */
function manquants(
  bien: Bien,
  presents: Set<TypeDiag>,
  aujourdhui: Date,
  avecSynthese: boolean
): PointDeControle[] {
  const points: PointDeControle[] = [];
  if (!avecSynthese && presents.size < 3) return points;

  const annee = anneeDe(bien.anneeConstruction);
  if (annee === null) return points;

  if (annee < 1997 && !presents.has('amiante')) {
    points.push({
      genre: 'manque',
      type: 'amiante',
      titre: 'Il n’y a pas de repérage amiante dans ce dossier',
      explication: `Le logement date ${formuleAnnee(bien.anneeConstruction)}. L’amiante a été interdite en 1997 : tout logement construit avant doit être contrôlé avant d’être vendu.`,
      quoiFaire: 'Demandez si ce rapport existe. Il est peut-être dans un autre fichier que celui-ci.'
    });
  }

  if (annee < 1949 && !presents.has('plomb')) {
    points.push({
      genre: 'manque',
      type: 'plomb',
      titre: 'Il n’y a pas de constat plomb dans ce dossier',
      explication: `Le logement date ${formuleAnnee(bien.anneeConstruction)}. Avant 1949, les peintures contenaient du plomb : le constat est obligatoire pour vendre ou louer.`,
      quoiFaire: 'Demandez si ce rapport existe. Il est peut-être dans un autre fichier que celui-ci.'
    });
  }

  /**
   * L'électricité est le diagnostic le plus souvent absent des vrais dossiers :
   * sur trente dossiers techniques mesurés, il manque dans les deux tiers.
   *
   * On ne le réclame pas pour le gaz : un logement tout électrique n'a aucun
   * diagnostic gaz à fournir, et rien dans le dossier ne dit de façon sûre si
   * le logement est raccordé. Réclamer à tort serait pire que se taire.
   */
  if (annee <= aujourdhui.getFullYear() - ANS_INSTALLATION && !presents.has('electricite')) {
    points.push({
      genre: 'manque',
      type: 'electricite',
      titre: 'Il n’y a pas de diagnostic électricité dans ce dossier',
      explication: `Le logement date ${formuleAnnee(bien.anneeConstruction)}. Pour vendre, l’état de l’installation électrique est obligatoire dès que l’installation a plus de quinze ans. Ce dossier ne dit pas si elle a été refaite depuis.`,
      quoiFaire:
        'Posez la question : ce rapport existe-t-il, ou l’installation a-t-elle été refaite il y a moins de quinze ans ? Dans ce cas, l’attestation de l’électricien remplace le diagnostic.'
    });
  }

  return points;
}

/** Contrôle 3 — les surfaces annoncées par deux diagnostics concordent-elles ? */
function surfaces(bien: Bien, diagnostics: Diagnostic[]): PointDeControle[] {
  const carrez = diagnostics.find((d) => d.type === 'carrez');
  const surfaceCarrez = carrez?.faits.find((f) => f.libelle === 'Superficie privative')?.valeur;
  const valeurCarrez = surfaceCarrez ? Number.parseFloat(surfaceCarrez.replace(',', '.')) : NaN;
  const valeurDpe = bien.surface;

  if (!Number.isFinite(valeurCarrez) || valeurDpe === undefined) return [];

  const ecart = Math.abs(valeurDpe - valeurCarrez);
  const proportion = ecart / Math.max(valeurDpe, valeurCarrez);
  // Un écart de quelques pourcents est normal : les deux mesures ne comptent pas
  // les mêmes surfaces. Au-delà de 10 %, la question se pose.
  if (proportion <= 0.1) return [];

  return [
    {
      genre: 'incoherence',
      titre: 'Deux surfaces différentes dans le même dossier',
      explication: `Le DPE parle de ${nombreFr(valeurDpe)} m², le mesurage de ${nombreFr(valeurCarrez)} m². Ces deux calculs ne comptent pas exactement la même chose, donc un petit écart est normal — mais ici la différence est de ${Math.round(proportion * 100)} %.`,
      quoiFaire: 'Demandez au diagnostiqueur laquelle des deux surfaces fait foi pour la vente. C’est le chiffre du mesurage qui sera écrit dans l’acte.'
    }
  ];
}

/** Contrôle 4 — les rapports du dossier datent-ils de la même époque ? */
function datesEparpillees(diagnostics: Diagnostic[]): PointDeControle[] {
  const dates = diagnostics
    .map((d) => ({ type: d.type, date: enDate(d.date) }))
    .filter((d): d is { type: TypeDiag; date: Date } => d.date !== null);

  if (dates.length < 2) return [];

  const triees = [...dates].sort((a, b) => a.date.getTime() - b.date.getTime());
  const plusAncien = triees[0];
  const plusRecent = triees[triees.length - 1];
  if (!plusAncien || !plusRecent) return [];

  const ecart = moisEcoules(plusAncien.date, plusRecent.date);
  if (ecart < 12) return [];

  return [
    {
      genre: 'attention',
      titre: 'Les rapports de ce dossier n’ont pas été faits en même temps',
      explication: `Le plus ancien (${NOMS[plusAncien.type]}) et le plus récent (${NOMS[plusRecent.type]}) sont séparés de ${ans(ecart)}. Un dossier se constitue parfois en plusieurs fois, mais le logement a pu changer entre-temps.`,
      quoiFaire: 'Vérifiez que les rapports les plus anciens sont encore valables au jour de la signature.'
    }
  ];
}

/** Contrôle 5 — un diagnostic dont la conclusion n'a pas pu être lue. */
function illisibles(diagnostics: Diagnostic[]): PointDeControle[] {
  const muets = diagnostics.filter((d) => d.gravite === 'neutre' && d.type !== 'carrez');
  if (muets.length === 0) return [];

  return [
    {
      genre: 'attention',
      titre: `${muets.length === 1 ? 'Un diagnostic n’a pas pu être lu' : `${muets.length} diagnostics n’ont pas pu être lus`} en entier`,
      explication: `Pour ${muets.map((d) => NOMS[d.type]).join(', ')}, la conclusion est souvent une case cochée à la main, ou une image. Un programme ne sait pas la lire.`,
      quoiFaire: 'Ouvrez la page « Conclusion » de ces rapports : la réponse y est écrite noir sur blanc.'
    }
  ];
}

export function controler(
  bien: Bien,
  diagnostics: Diagnostic[],
  aujourdhui: Date = new Date(),
  /** Le document porte une page « résumé de l'expertise » : c'est un dossier. */
  avecSynthese = false
): PointDeControle[] {
  const presents = new Set(diagnostics.map((d) => d.type));

  return [
    ...perimes(diagnostics, aujourdhui),
    ...manquants(bien, presents, aujourdhui, avecSynthese),
    ...surfaces(bien, diagnostics),
    ...datesEparpillees(diagnostics),
    ...illisibles(diagnostics)
  ];
}
