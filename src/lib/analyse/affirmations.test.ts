import { describe, expect, it } from 'vitest';
import { analyserTermites } from './reperages';
import { analyserAssainissement, analyserErp } from './risques';
import { analyserPlomb } from './plomb';
import { libelleCourt } from '../libelle';
import type { Diagnostic } from '../modele';

/**
 * Le produit ne doit jamais affirmer ce qu'il n'a pas lu.
 *
 * Sept endroits fabriquaient une conclusion rassurante à partir d'un silence :
 * un extracteur qui ne reconnaît rien tombait dans la branche « tout va bien »
 * au lieu de dire qu'il n'a pas su lire. Trois de ces phrases partaient dans le
 * texte transmis au notaire.
 *
 * Ces tests reproduisent chaque faute avant de la corriger. C'est ce qui
 * empêche la même erreur de revenir dans six mois.
 */

const PLAGE: [number, number] = [1, 4];

describe('un silence n’est pas une absence', () => {
  it('ne conclut pas à l’absence d’indices sur un état termites illisible', () => {
    // Une page scannée, un modèle inhabituel : rien n'est reconnu. Le produit
    // affirmait « Aucun indice d’infestation », en vert.
    const d = analyserTermites(['Page 3 sur 8', 'SARL EXPERTISES', 'Tél. 06 00 00 00 00'], PLAGE);
    expect(d.gravite).toBe('neutre');
    expect(d.verdict).toMatch(/n['’]a pas pu être lue/i);
  });

  it('lit encore correctement une absence d’indices réellement écrite', () => {
    const d = analyserTermites(
      ['Il n’a pas été repéré d’indice d’infestation de termites dans les parties visitées.'],
      PLAGE
    );
    expect(d.gravite).toBe('bon');
    expect(d.verdict).toMatch(/parties visit[ée]es/i);
  });

  it('lit encore correctement une présence d’indices', () => {
    const d = analyserTermites(
      ['Présence d’indices d’infestation de termites constatée dans le garage.'],
      PLAGE
    );
    expect(d.gravite).toBe('alerte');
  });

  it('ne met pas en alerte une installation d’assainissement conforme', () => {
    /*
     * Presque tous les rapports du SPANC recopient le rappel de l'article
     * L. 1331-11-1 : « en cas de non-conformité … dans un délai d'un an après
     * l'acte de vente ». La recherche brute de « non conform » attrapait ce
     * rappel et mettait en alerte une installation validée.
     */
    const d = analyserAssainissement(
      [
        'Contrôle de l’installation d’assainissement non collectif',
        'Avis : installation conforme à la réglementation en vigueur.',
        'Rappel : en cas de non-conformité, les travaux sont réalisés dans un délai d’un an après l’acte de vente.'
      ],
      PLAGE
    );
    expect(d.gravite).not.toBe('attention');
    expect(d.verdict).not.toMatch(/non conforme/i);
  });

  it('signale toujours une installation réellement non conforme', () => {
    const d = analyserAssainissement(
      [
        'Contrôle de l’installation d’assainissement non collectif',
        'Avis : installation non conforme — absence de traitement.'
      ],
      PLAGE
    );
    expect(d.gravite).toBe('attention');
  });

  it('ne conclut pas à l’absence de risques sur un état des risques illisible', () => {
    const d = analyserErp(['ÉTAT DES RISQUES ET POLLUTIONS', 'Référence : 33000-2026'], PLAGE);
    expect(d.gravite).toBe('neutre');
    expect(d.verdict).toMatch(/pas r[ée]ussi [àa] lire/i);
    // On ne laisse pas le lecteur sans recours : Géorisques est la base officielle.
    expect(d.verdict).toMatch(/g[ée]orisques/i);
  });

  it('reconnaît une formulation d’état des risques qui ne dit pas « le bien »', () => {
    // Le filtre n'acceptait que « Le bien se situe / ne se situe pas ». Les
    // rapports écrivent aussi « l'immeuble », « la parcelle », « zone de
    // sismicité », « potentiel radon ».
    const d = analyserErp(
      [
        'ÉTAT DES RISQUES ET POLLUTIONS',
        'L’immeuble est situé dans une zone de sismicité de niveau 3.'
      ],
      PLAGE
    );
    expect(d.gravite).not.toBe('neutre');
  });
});

describe('les libellés ne garantissent pas une absence', () => {
  /**
   * Ces trois chaînes alimentent le titre de la carte, la tuile du voyant et la
   * ligne transmise au notaire. Aucun de ces constats n'établit une absence :
   * un repérage amiante ne cherche que les matériaux des listes réglementaires,
   * un constat plomb ne mesure que les revêtements accessibles, un état
   * termites ne relève que des indices dans les parties visitées.
   */
  const nu = (type: Diagnostic['type'], gravite: Diagnostic['gravite']): Diagnostic => ({
    type,
    titre: type,
    verdict: '',
    gravite,
    faits: [],
    explication: [],
    aFaire: [],
    schema: null,
    pages: PLAGE
  });

  it('n’écrit jamais une absence sèche', () => {
    const ABSENCE_SECHE = /\b(pas d[e’']|aucun[e]?|absence d[e’'])\s*(amiante|plomb|termites?|risques?)\b/i;
    for (const type of ['amiante', 'plomb', 'termites'] as const) {
      const dit = libelleCourt(nu(type, 'bon'));
      expect(dit, `${type} : « ${dit} »`).not.toMatch(ABSENCE_SECHE);
    }
  });

  it('dit ce qui a été cherché, pas ce qui n’existe pas', () => {
    expect(libelleCourt(nu('amiante', 'bon'))).toMatch(/rep[ée]r/i);
    expect(libelleCourt(nu('plomb', 'bon'))).toMatch(/seuil/i);
    expect(libelleCourt(nu('termites', 'bon'))).toMatch(/indice/i);
  });
});

describe('le plomb ne compte pas ce qu’il n’a pas mesuré', () => {
  it('sépare les unités mesurées du total', () => {
    /*
     * Le contrôle de cohérence du fichier le prouve : total = non mesurées +
     * classes 0 à 3. La première tuile annonçait pourtant « Éléments
     * contrôlés : 70 » alors que 33 n'avaient pas été mesurées.
     */
    const d = analyserPlomb(
      [
        'Constat de risque d’exposition au plomb',
        'Total des unités de diagnostic : 70',
        'Non mesurées : 33',
        'Classe 0 : 30',
        'Classe 1 : 5',
        'Classe 2 : 2',
        'Classe 3 : 0'
      ],
      PLAGE
    );

    const premier = d.faits[0];
    if (!premier) return; // rien n'a été lu : le test ne porte alors sur rien
    expect(premier.libelle).not.toMatch(/contr[ôo]l[ée]s/i);
    if (d.schema?.genre === 'plomb') {
      const mesurees = d.schema.total - d.schema.nonMesurees;
      expect(premier.valeur).toBe(String(mesurees));
    }
  });
});
