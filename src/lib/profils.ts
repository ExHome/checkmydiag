/**
 * Le même dossier, trois lectures.
 *
 * Un propriétaire, un acquéreur et un agent ne cherchent pas la même chose dans
 * les mêmes pages. Plutôt que de tout dire à tout le monde, on trie selon qui
 * regarde — et on ne dit que ce qui découle du dossier, jamais du général.
 */
import type { Analyse, Diagnostic, TypeDiag } from './modele';

export type Profil = 'proprietaire' | 'acquereur' | 'agent';

export const PROFILS: { id: Profil; nom: string; question: string }[] = [
  { id: 'proprietaire', nom: 'Je vends ou je loue', question: 'Qu’est-ce qui va bloquer ?' },
  { id: 'acquereur', nom: 'J’achète', question: 'Qu’est-ce que ça va me coûter ?' },
  { id: 'agent', nom: 'Je suis agent', question: 'Le dossier tient-il ?' }
];

export interface Point {
  /** Le fait, en quelques mots. */
  quoi: string;
  /** Ce que ça implique pour ce profil. */
  donc: string;
  ton: 'bloque' | 'coute' | 'verifier' | 'ok';
  type?: TypeDiag;
}

function classeDpe(d: Diagnostic | undefined): string | null {
  return d?.schema?.genre === 'dpe' ? d.schema.finale : null;
}

function plombDegrade(d: Diagnostic | undefined): number {
  return d?.schema?.genre === 'plomb' ? d.schema.classes[3] : 0;
}

/** Ce qui va bloquer, ou coûter, selon qui lit. */
export function pointsPour(profil: Profil, analyse: Analyse): Point[] {
  const par = (type: TypeDiag) => analyse.diagnostics.find((d) => d.type === type);
  const points: Point[] = [];

  const dpe = par('dpe');
  const lettre = classeDpe(dpe);
  const perimes = analyse.controles.filter((c) => c.genre === 'perime');
  const manquants = analyse.controles.filter((c) => c.genre === 'manque');
  const incoherences = analyse.controles.filter((c) => c.genre === 'incoherence');
  const classe3 = plombDegrade(par('plomb'));
  const anomalies = ['electricite', 'gaz'].filter(
    (t) => par(t as TypeDiag)?.gravite === 'attention' || par(t as TypeDiag)?.gravite === 'alerte'
  );

  if (profil === 'proprietaire') {
    if (lettre === 'G' || lettre === 'F') {
      points.push({
        quoi: `Classe ${lettre}`,
        donc:
          lettre === 'G'
            ? 'Plus louable depuis 2025. Loyer bloqué. Audit obligatoire pour vendre une maison.'
            : 'Interdit à la location en 2028. Loyer bloqué. Audit obligatoire pour vendre une maison.',
        ton: 'bloque',
        type: 'dpe'
      });
    }
    if (classe3 > 0) {
      points.push({
        quoi: `${classe3} peinture${classe3 > 1 ? 's' : ''} au plomb dégradée${classe3 > 1 ? 's' : ''}`,
        donc: 'Travaux à votre charge. Occupants et entreprises à prévenir.',
        ton: 'bloque',
        type: 'plomb'
      });
    }
    for (const p of perimes) {
      points.push({ quoi: p.titre, donc: 'À refaire avant de signer.', ton: 'bloque', ...(p.type ? { type: p.type } : {}) });
    }
    for (const m of manquants) {
      points.push({ quoi: m.titre, donc: 'Le notaire le réclamera.', ton: 'bloque', ...(m.type ? { type: m.type } : {}) });
    }
    if (anomalies.length) {
      points.push({
        quoi: 'Anomalies électricité ou gaz',
        donc: 'Aucune obligation de travaux. Mais l’acheteur négociera dessus.',
        ton: 'coute'
      });
    }
    if (points.length === 0) {
      points.push({ quoi: 'Rien ne bloque', donc: 'Le dossier permet de vendre en l’état.', ton: 'ok' });
    }
    return points;
  }

  if (profil === 'acquereur') {
    if (lettre && ['E', 'F', 'G'].includes(lettre)) {
      points.push({
        quoi: `Classe ${lettre}`,
        donc: 'Chauffage cher. Travaux à prévoir. Revente plus difficile.',
        ton: 'coute',
        type: 'dpe'
      });
    }
    if (classe3 > 0) {
      points.push({
        quoi: 'Plomb dégradé',
        donc: 'Travaux avant emménagement si jeunes enfants. À faire faire par le vendeur.',
        ton: 'bloque',
        type: 'plomb'
      });
    }
    if (par('amiante')?.gravite !== 'bon' && par('amiante')) {
      points.push({
        quoi: 'Amiante présente',
        donc: 'Aucun danger en l’état. Mais tout percement futur passe par une entreprise certifiée.',
        ton: 'verifier',
        type: 'amiante'
      });
    }
    if (anomalies.length) {
      points.push({
        quoi: 'Anomalies électricité ou gaz',
        donc: 'Chiffrez avec un artisan : c’est votre levier de négociation.',
        ton: 'coute'
      });
    }
    for (const i of incoherences) {
      points.push({ quoi: i.titre, donc: 'À éclaircir avant l’offre.', ton: 'verifier' });
    }
    if (par('erp')?.gravite !== 'bon' && par('erp')) {
      points.push({
        quoi: 'Risques sur le terrain',
        donc: 'Vérifiez la couverture de votre assurance avant de signer.',
        ton: 'verifier',
        type: 'erp'
      });
    }
    if (points.length === 0) {
      points.push({ quoi: 'Rien de lourd', donc: 'Aucun coût caché repéré dans ce dossier.', ton: 'ok' });
    }
    return points;
  }

  // Agent : le dossier tient-il pour signer ?
  for (const p of perimes) {
    points.push({ quoi: p.titre, donc: 'À refaire avant compromis.', ton: 'bloque', ...(p.type ? { type: p.type } : {}) });
  }
  for (const m of manquants) {
    points.push({ quoi: m.titre, donc: 'Pièce absente du dossier.', ton: 'bloque', ...(m.type ? { type: m.type } : {}) });
  }
  for (const i of incoherences) {
    points.push({ quoi: i.titre, donc: 'Écart à justifier auprès des parties.', ton: 'verifier' });
  }
  if (lettre) {
    points.push({
      quoi: `DPE classe ${lettre}`,
      donc: 'À faire figurer dans l’annonce, avec les montants estimés.',
      ton: ['F', 'G'].includes(lettre) ? 'bloque' : 'ok',
      type: 'dpe'
    });
  }
  const muets = analyse.diagnostics.filter((d) => d.gravite === 'neutre');
  if (muets.length) {
    points.push({
      quoi: `${muets.length} conclusion${muets.length > 1 ? 's' : ''} non lisible${muets.length > 1 ? 's' : ''}`,
      donc: 'Cochées à la main : à relire avant de transmettre.',
      ton: 'verifier'
    });
  }
  if (points.length === 0) {
    points.push({ quoi: 'Dossier complet', donc: 'Rien ne s’oppose à la signature.', ton: 'ok' });
  }
  return points;
}
