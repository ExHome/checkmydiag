import { describe, expect, it } from 'vitest';
import { signaturesQuiRepondent } from '../socle';
import { LECTEURS_DPE, lireLeDpe } from './index';
import { reconnaitDpeLiciel } from './liciel';

/**
 * L'aiguillage du DPE — un lecteur par éditeur, choisi sur signature.
 *
 * Ces tests gardent la contrainte d'architecture, pas le détail d'une lecture :
 * ce qui est vérifié ici, c'est qu'un format non mesuré **n'est pas lu**.
 */

/** Un DPE LICIEL, réduit à ce qui le nomme et à une rangée de sa fiche. */
const LICIEL = [
  'Fiche technique du logement',
  'Référence du logiciel validé : LICIEL Diagnostics v4 [Moteur BBS Slama: 2025.11.1.0]',
  'Enveloppe',
  'Donnée d ’ entrée Origine de la donnée Valeur renseignée',
  'Surface du mur Observé / mesuré 34,20 m²',
  'Mur 1 Nord Type d’adjacence Observé / mesuré l’extérieur',
  'Isolation Observé / mesuré non'
];

/**
 * Un DPE d'un autre éditeur, tel que le corpus en donne : le corps est imprimé
 * en image, seuls l'en-tête et le pied de page rendent du texte.
 */
const AUTRE_EDITEUR = [
  'Diagnostic de Performance Énergétique',
  'CABINET EXEMPLE membre du réseau BC2E',
  'n° de rapport : 000000000',
  'DIAGNOSTIC DPE : 1 sur 5',
  'DDT : 23 sur 45'
];

describe('l’aiguillage du DPE', () => {
  it('reconnaît LICIEL à sa déclaration de logiciel, et cite sa preuve', () => {
    const preuve = reconnaitDpeLiciel(LICIEL);
    expect(preuve).not.toBeNull();
    expect(preuve?.preuve).toContain('Référence du logiciel validé');
    expect(preuve?.preuve).toContain('LICIEL');
  });

  /*
   * LA règle. Un lecteur mesuré sur un éditeur ne tourne pas sur un autre : il
   * n'y rendrait pas moins d'information, il en rendrait de la fausse, en
   * silence. Chez BC2E, il n'y a d'ailleurs rien à lire — le DPE est en image.
   */
  it('refuse de lire un DPE d’un éditeur non mesuré', () => {
    const a = lireLeDpe(AUTRE_EDITEUR);
    expect(a.etat).toBe('format inconnu');
    if (a.etat === 'format inconnu') {
      expect(a.quoi).toBe('DPE');
      expect(a.essayes).toEqual(['LICIEL']);
    }
  });

  /*
   * La signature est POSITIVE : elle reconnaît un signe que le format porte,
   * jamais l'absence d'un signe chez un autre. Un document vide n'est donc
   * reconnu par personne.
   */
  it('ne reconnaît rien dans un document qui ne se nomme pas', () => {
    expect(reconnaitDpeLiciel([])).toBeNull();
    expect(reconnaitDpeLiciel(['Diagnostic de performance énergétique', 'Classe D'])).toBeNull();
  });

  /*
   * Le nom d'un autre éditeur dans la même rubrique ne doit pas passer pour du
   * LICIEL : c'est la rubrique qui est commune, pas l'éditeur.
   */
  it('ne prend pas un autre logiciel validé pour du LICIEL', () => {
    expect(
      reconnaitDpeLiciel(['Référence du logiciel validé : AnalysImmo 4.1.1 - Méthode 3CL 2021'])
    ).toBeNull();
  });

  it('lit le bâtiment quand, et seulement quand, le format est reconnu', () => {
    const a = lireLeDpe(LICIEL);
    expect(a.etat).toBe('lu');
    if (a.etat === 'lu') {
      expect(a.editeur).toBe('LICIEL');
      expect(a.valeur.enveloppe.parois).toHaveLength(1);
      expect(a.valeur.enveloppe.parois[0]?.isolation).toBe('nonIsole');
    }
  });

  /*
   * Deux signatures qui répondent sur le même document est un défaut à
   * corriger, pas une ambiguïté à arbitrer : l'ordre de la liste ne doit jamais
   * décider du résultat.
   */
  it('n’a jamais deux signatures pour un même document', () => {
    expect(signaturesQuiRepondent(LECTEURS_DPE, LICIEL)).toHaveLength(1);
    expect(signaturesQuiRepondent(LECTEURS_DPE, AUTRE_EDITEUR)).toHaveLength(0);
  });

  /*
   * La liste dit ce que Verrière sait lire. Qu'elle soit courte est une
   * information — les autres formats sont non mesurés, pas absents.
   */
  it('déclare les éditeurs qu’elle sait lire', () => {
    expect(LECTEURS_DPE.map((l) => l.editeur)).toEqual(['LICIEL']);
    expect(LECTEURS_DPE.every((l) => l.quoi === 'DPE')).toBe(true);
  });
});
