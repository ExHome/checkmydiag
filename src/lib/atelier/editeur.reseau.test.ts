import { describe, expect, it } from 'vitest';
import { identifierGenerateur, reseauDuPiedDePage } from './editeur';

/**
 * Le réseau qui ne se nomme nulle part, sauf en pied de page.
 *
 * Ces rapports n'ont ni rubrique « Référence du logiciel validé » — elle
 * n'existe que s'il y a un DPE — ni empreinte d'impression parlante : leur PDF
 * est fabriqué par TCPDF, une bibliothèque, pas un logiciel de diagnostic.
 *
 * Ils restaient donc anonymes. C'est un vrai problème de lecture, pas une
 * curiosité de référentiel : leur mise en page diffère de celle de LICIEL au
 * point de casser un lecteur. La réponse OUI/NON du CREP y termine la première
 * ligne du libellé ; ailleurs elle occupe une ligne à elle seule. Appliquer la
 * mauvaise carte, c'est lire un NON là où le rapport dit OUI.
 *
 * La marque retenue n'est pas un mot isolé, c'est un ENDROIT : le domaine du
 * réseau dans la ligne de contact du pied de page, répété à chaque feuille.
 * Mesuré sur les 127 documents du corpus — 4 le portent, la double pagination
 * propre au réseau sort sur les mêmes 4, et l'intersection avec les 73 rapports
 * qui déclarent LICIEL est vide.
 */
const PIED = 'Tel : 06 00 00 00 00 - Mail : prenom.nom@bc2e.com - Web : https://cabinet.bc2e.com DIAGNOSTIC PLOMB 1 sur 8';

describe('le réseau reconnu à son pied de page', () => {
  it('le nomme quand rien d’autre ne le fait', () => {
    const g = identifierGenerateur({ producteur: 'TCPDF 5.0.002 (http://www.tcpdf.org)' }, [
      'CONSTAT DE RISQUE D’EXPOSITION AU PLOMB',
      PIED
    ]);
    expect(g.editeur).toBe('BC2E');
    expect(g.source).toBe('signature');
    expect(g.genre).toBe('diagnostic');
  });

  it('ne passe jamais devant la déclaration du rapport', () => {
    /*
     * Un dossier peut mêler les générateurs : un DPE produit par un logiciel
     * validé, les autres volets par un autre outil. La rubrique reste la source
     * la plus sûre, et le pied de page ne doit pas la contredire.
     */
    const g = identifierGenerateur({ producteur: 'TCPDF 5.0.002' }, [
      'Référence du logiciel validé : LICIEL Diagnostics v4',
      PIED
    ]);
    expect(g.editeur).toBe('LICIEL');
    expect(g.source).toBe('déclaration');
  });

  it('ne passe pas devant une empreinte qui nomme un éditeur', () => {
    const g = identifierGenerateur({ producteur: 'iTextSharp 5.4.0' }, [PIED]);
    expect(g.editeur).toBe('LICIEL');
  });

  it('se tait sur un document qui ne porte pas la marque', () => {
    expect(reseauDuPiedDePage(['Rapport de repérage amiante', 'Fait à Bordeaux'])).toBeNull();
    const g = identifierGenerateur({ producteur: 'Microsoft® Word pour Microsoft 365' }, [
      'CONCLUSIONS DU REPÉRAGE'
    ]);
    expect(g.editeur).toBeNull();
    expect(g.source).toBe('inconnue');
  });

  it('ne confond pas le domaine avec un mot du corps', () => {
    /*
     * La règle du module : on cherche un endroit, pas un mot. Le domaine ne vaut
     * que collé à la ligne de contact ; un nom de réseau cité dans une phrase du
     * rapport ne doit rien déclencher.
     */
    expect(
      reseauDuPiedDePage(['Le cabinet est membre du réseau BC2E et applique ses procédures.'])
    ).toBeNull();
  });
});
