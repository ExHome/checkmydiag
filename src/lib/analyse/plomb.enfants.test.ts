import { describe, expect, it } from 'vitest';
import { enfantsDansLeLogement } from './plomb';

/**
 * La raison d'être du constat, que Verrière ne lisait chez aucun éditeur.
 *
 * Le saturnisme est une maladie de l'enfant. L'arrêté du 19 août 2011 nomme sa
 * première liste « situations de risque de saturnisme INFANTILE », et le modèle
 * de rapport qu'il annexe pose la question en tête, avant les mesures.
 *
 * Mesuré le 21/08/2026 sur 200 volets plomb : l'intitulé est présent dans
 * **200 sur 200** — le seul endroit du CREP dont on puisse le dire. Réponses :
 * 179 `NON`, 21 `OUI`.
 *
 * Fragments anonymisés, recopiés dans l'ordre de l'extraction.
 */

/** La forme majoritaire : 90 volets sur 200. */
const FORME_COURANTE = [
  'Nom de l’occupant, si différent du propriétaire',
  'Nombre total :',
  'Présence et nombre d’enfants mineurs,',
  'NON',
  'dont des enfants de moins de 6 ans Nombre d’enfants de moins de 6 ans :'
];

describe('les enfants dans le logement au moment du constat', () => {
  it('lit le NON de la ligne qui suit l’intitulé', () => {
    const r = enfantsDansLeLogement(FORME_COURANTE);
    expect(r?.reponse).toBe('NON');
    expect(r?.moinsDeSixAns).toBeUndefined();
  });

  it('⚠️ lit le « Oui », qui n’est PAS écrit en capitales', () => {
    /*
     * Le corpus écrit « NON » en capitales et « Oui » en capitale initiale. Un
     * motif qui n'accepte que les capitales lit tous les non et aucun oui : il
     * rendrait « aucun enfant » sur les 21 rapports qui disent l'inverse.
     *
     * C'est la même bascule que les lectures 12 et 13 avaient montrée sur une
     * réédition, où la réponse passait de « NON » à « Oui ».
     */
    const r = enfantsDansLeLogement(FORME_COURANTE.map((l) => l.replace(/^NON$/, 'Oui')));
    expect(r?.reponse).toBe('OUI');
  });

  it('lit le nombre d’enfants de moins de six ans quand il est chiffré', () => {
    const r = enfantsDansLeLogement([
      'Présence et nombre d’enfants mineurs,',
      'Oui',
      'dont des enfants de moins de 6 ans Nombre d’enfants de moins de 6 ans : 2'
    ]);
    expect(r?.reponse).toBe('OUI');
    expect(r?.moinsDeSixAns).toBe(2);
  });

  it('ne s’ancre pas sur « Nombre total », qui se promène', () => {
    /*
     * Sur 7 volets, « Nombre total : » quitte sa ligne et vient se coller à
     * l'intitulé. La réponse, elle, reste sur la ligne suivante.
     */
    const r = enfantsDansLeLogement([
      'L’occupant est : Le locataire',
      'Nom de l’occupant, si différent du propriétaire',
      'Présence et nombre d’enfants mineurs, Nombre total :',
      'NON',
      'dont des enfants de moins de 6 ans Nombre d’enfants de moins de 6 ans :'
    ]);
    expect(r?.reponse).toBe('NON');
  });

  it('lit l’autre éditeur, qui répond sur la même ligne', () => {
    const r = enfantsDansLeLogement([
      'Le local est-il habité lors de la visite : OUI Présence de mineurs de -6 ans : OUI'
    ]);
    expect(r?.reponse).toBe('OUI');
  });

  it('n’est pas mis en échec par les apostrophes espacées', () => {
    const r = enfantsDansLeLogement([
      'Présence et nombre d ’ enfants mineurs,',
      'NON',
      'dont des enfants de moins de 6 ans'
    ]);
    expect(r?.reponse).toBe('NON');
  });

  it('porte le terme du rapport, entier', () => {
    /* On cite, puis on explique : le libellé du formulaire ne se raccourcit
       pas en « enfants de moins de 6 ans ». */
    expect(enfantsDansLeLogement(FORME_COURANTE)?.terme).toBe(
      'Présence et nombre d’enfants mineurs, dont des enfants de moins de 6 ans'
    );
  });

  it('ne conclut rien quand la réponse ne se lit pas', () => {
    /* L'intitulé est imprimé que la case soit cochée ou non. Sans réponse, on
       se tait — mieux vaut manquer un fait que l'inventer. */
    expect(
      enfantsDansLeLogement([
        'Présence et nombre d’enfants mineurs,',
        'dont des enfants de moins de 6 ans',
        'Société réalisant le constat'
      ])
    ).toBeNull();
  });

  it('ne conclut rien quand l’intitulé est absent', () => {
    expect(enfantsDansLeLogement(['Conclusion des mesures de concentration en plomb'])).toBeNull();
  });
});

describe('la réponse suit l’intitulé, elle ne termine pas la ligne', () => {
  it('⚠️ lit la réponse même quand du texte la suit', () => {
    /*
     * Un volet sur 200, et le seul de sa forme : deux questions et leurs deux
     * réponses sur la même ligne, puis une troisième question. Le premier motif
     * exigeait la fin de ligne et manquait celui-ci.
     */
    const r = enfantsDansLeLogement([
      'Le local est-il habité lors de la visite : NON Présence de mineurs de -6 ans : NON Le local est-il en travaux : NON'
    ]);
    expect(r?.reponse).toBe('NON');
  });

  it('ne prend pas la réponse de la question voisine', () => {
    /*
     * Le garde-fou du même cas : la question d'AVANT répond OUI, celle qu'on
     * lit répond NON. Un motif ancré sur la fin de ligne, ou qui chercherait
     * « le premier OUI/NON de la ligne », aurait rendu OUI.
     */
    const r = enfantsDansLeLogement([
      'Le local est-il habité lors de la visite : OUI Présence de mineurs de -6 ans : NON'
    ]);
    expect(r?.reponse).toBe('NON');
  });
});
