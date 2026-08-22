/**
 * LE LECTEUR DE DPE — format LICIEL.
 *
 * *Un lecteur par éditeur, choisi sur signature. Ce fichier ne lit QUE le DPE
 * produit par LICIEL, et ne prétend rien savoir des autres.*
 *
 * ## La signature, et pourquoi celle-là
 *
 * Le DPE est le seul diagnostic dont le **texte réglementaire impose de nommer
 * le logiciel** : sa fiche technique porte la rubrique « Référence du logiciel
 * validé ». Tous les éditeurs l'impriment, chacun avec son nom. C'est donc une
 * signature **positive et déclarative** — la plus forte qu'on puisse avoir, et
 * la seule qui ne s'appuie pas sur une habitude de mise en page.
 *
 * On ne reconnaît jamais un format par ce qu'il n'a pas. « Ce n'est pas LICIEL,
 * donc c'est l'autre » attribue au hasard dès le troisième éditeur.
 *
 * Mesuré : sur les 26 volets DPE LICIEL du corpus, 26 portent la rubrique et la
 * déclaration s'y lit. Les 6 volets DPE BC2E rencontrés ne portent aucun texte
 * de corps — leur DPE est imprimé en image — et ne sont donc reconnus par
 * personne : `format inconnu`, ce qui est la réponse juste.
 *
 * ## Ce que ce lecteur rend
 *
 * Le bâtiment reconstruit à partir de la fiche technique, ses équipements, et
 * les travaux recommandés. Chacun de ces trois modules a été **mesuré sur
 * LICIEL et sur lui seul** — ils ne doivent jamais être appelés directement
 * depuis l'écran, mais toujours par l'aiguilleur.
 *
 * Voir `docs/OU-PARSER-DPE.md` pour le relevé, `docs/LECTEUR-PAR-EDITEUR.md`
 * pour l'architecture.
 */
import { logicielDeclare } from '../../atelier/editeur';
import { lireEnveloppe, type Enveloppe } from '../../analyse/enveloppe';
import { lireFicheTechnique, type FicheTechnique } from '../../analyse/ficheTechnique';
import { chercherLesContradictions, type PointAVerifier } from '../../analyse/pointsAVerifier';
import { ceQuiEstDejaBien, pourquoiCetteNote, type Cause } from '../../analyse/pourquoi';
import { lireSystemes, type Systemes } from '../../analyse/systemes';
import { lireTravaux, type Travaux } from '../../analyse/travaux';
import type { Lecteur, Preuve } from '../socle';

export interface LectureDpe {
  fiche: FicheTechnique;
  enveloppe: Enveloppe;
  systemes: Systemes;
  travaux: Travaux;
  causes: Cause[];
  dejaBien: Cause[];
  points: PointAVerifier[];
}

/**
 * Reconnaît un DPE LICIEL à sa déclaration de logiciel.
 *
 * On réutilise `logicielDeclare`, qui lit la rubrique réglementaire et rend le
 * nom de l'éditeur avec sa preuve : la ligne exacte. Pas de second motif, pas
 * de repli sur l'empreinte d'impression — ici, la déclaration suffit et elle
 * est citable.
 */
export function reconnaitDpeLiciel(lignes: readonly string[]): Preuve | null {
  const declare = logicielDeclare(lignes);
  if (!declare || declare.editeur !== 'LICIEL') return null;
  return { preuve: declare.preuve };
}

export const LECTEUR_DPE_LICIEL: Lecteur<LectureDpe> = {
  editeur: 'LICIEL',
  quoi: 'DPE',
  reconnait: reconnaitDpeLiciel,
  lire(lignes) {
    const brutes = [...lignes];
    const fiche = lireFicheTechnique(brutes);
    const enveloppe = lireEnveloppe(fiche);
    const systemes = lireSystemes(brutes, fiche);
    return {
      fiche,
      enveloppe,
      systemes,
      travaux: lireTravaux(brutes),
      causes: pourquoiCetteNote(enveloppe, systemes),
      dejaBien: ceQuiEstDejaBien(enveloppe, systemes),
      points: chercherLesContradictions(brutes, enveloppe, systemes)
    };
  }
};
