/**
 * LA SYNTHÈSE ÉLECTRICITÉ — ce que la mini-app du pack a le droit d'afficher.
 *
 * *Pack `VERRIERE_ELECTRICITE_PACK_CLAUDE.zip`, 22/08/2026. Sa règle cardinale :
 * « les chiffres, codes, articles, catégories, niveaux de risque et
 * pourcentages visibles sur l'image sont fictifs et ne doivent jamais être
 * codés comme valeurs par défaut ».*
 *
 * Le premier test est le plus important du fichier : **aucune anomalie ne
 * disparaît**. Mesuré le 22/08 sur sept volets du corpus DGLM, l'écran
 * précédent en montrait 7 sur 18 extraites.
 */
import { describe, expect, it } from 'vitest';
import type { Anomalie, Diagnostic } from '../../lib/modele';
import { DOMAINES, domaineDe, issueDe, syntheseElectricite } from './synthese';
import { confianceDe, famillesDe, niveauDeRisque } from './visuel';

const socle = {
  type: 'electricite' as const,
  titre: 'Installation électrique',
  explication: [],
  aFaire: [],
  schema: null,
  pages: [12, 20] as [number, number]
};

const anomalie = (libelle: string, localisations: string[] = [], extra: Partial<Anomalie> = {}): Anomalie => ({
  code: null,
  domaine: null,
  libelle,
  localisations,
  pluralite: 'inconnue',
  mesureCompensatoire: null,
  geste: null,
  ...extra
});

/** Le volet le plus chargé du corpus mesuré : six anomalies, quatre domaines. */
const SIX: Diagnostic = {
  ...socle,
  verdict: 'L’installation intérieure d’électricité comporte une ou des anomalies.',
  gravite: 'attention',
  faits: [{ libelle: 'Anomalies relevées', valeur: '6' }],
  anomalies: [
    anomalie('La manœuvre du bouton test du dispositif de protection différentielle n’entraîne pas la coupure'),
    anomalie('Au moins un socle de prise de courant ne comporte pas de broche de terre.', ['RDC - Chambre 1']),
    anomalie('Au moins un socle de prise de courant comporte une broche de terre non reliée à la terre.', [
      'RDC - Buanderie'
    ]),
    anomalie('L’installation comporte au moins une connexion avec une partie active nue sous tension accessible.', [
      'Sous-Sol - Cave'
    ]),
    anomalie('L’installation comporte au moins un matériel électrique vétuste', ['RDC - Atelier'], { code: 'B8.3 a' }),
    anomalie(
      'Locaux contenant une baignoire ou une douche : la continuité de la liaison équipotentielle supplémentaire n’est pas satisfaisante',
      ['1er étage - Salle de bain']
    )
  ]
} as unknown as Diagnostic;

const SAINE: Diagnostic = {
  ...socle,
  verdict: 'L’installation intérieure d’électricité ne comporte aucune anomalie.',
  gravite: 'bon',
  faits: [{ libelle: 'Anomalies relevées', valeur: '0' }],
  anomalies: []
} as unknown as Diagnostic;

const NON_LUE: Diagnostic = {
  ...socle,
  verdict: 'La conclusion est cochée à la main : un programme ne peut pas la lire.',
  gravite: 'neutre',
  faits: [],
  anomalies: []
} as unknown as Diagnostic;

describe('⚠️ aucune anomalie ne disparaît', () => {
  it('rend TOUTES les anomalies du rapport, sans exception', () => {
    const s = syntheseElectricite(SIX);
    expect(s.anomalies).toHaveLength(6);
    expect(s.compte.rendues).toBe(6);
  });

  it('range chaque anomalie dans un domaine, ou dans « hors domaine » — jamais nulle part', () => {
    const s = syntheseElectricite(SIX);
    const rangees = s.domaines.reduce((n, d) => n + d.anomalies.length, 0) + s.horsDomaine.length;
    expect(rangees).toBe(s.anomalies.length);
  });

  it('⚠️ dit l’écart quand le rapport annonce plus d’anomalies que ce qui a été lu', () => {
    const ampute = { ...SIX, faits: [{ libelle: 'Anomalies relevées', valeur: '9' }] } as unknown as Diagnostic;
    const s = syntheseElectricite(ampute);
    expect(s.compte.annonce).toBe(9);
    expect(s.compte.rendues).toBe(6);
  });

  it('conserve le code source, les localisations et la mesure compensatoire', () => {
    const s = syntheseElectricite(SIX);
    const vetuste = s.anomalies.find((a) => /vétuste/.test(a.libelle));
    expect(vetuste?.code).toBe('B8.3 a');
    expect(vetuste?.localisations).toEqual(['RDC - Atelier']);
  });
});

describe('les domaines du contrôle', () => {
  it('les six de l’arrêté sont toujours présentés, avec leur état', () => {
    const s = syntheseElectricite(SIX);
    expect(s.domaines).toHaveLength(6);
    expect(s.domaines.map((d) => d.numero)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('classe le différentiel, la salle d’eau, les contacts directs et la vétusté', () => {
    const s = syntheseElectricite(SIX);
    const etats = Object.fromEntries(s.domaines.map((d) => [d.numero, d.etat]));
    expect(etats[2]).toBe('anomalie'); // différentiel / mise à la terre
    expect(etats[4]).toBe('anomalie'); // baignoire ou douche
    expect(etats[5]).toBe('anomalie'); // partie active nue accessible
    expect(etats[6]).toBe('anomalie'); // matériel vétuste
  });

  it('⚠️ ne confond jamais « aucune anomalie relevée » et « conforme »', () => {
    const s = syntheseElectricite(SAINE);
    const tout = JSON.stringify(s);
    expect(s.domaines.every((d) => d.etat === 'sansAnomalie')).toBe(true);
    expect(tout).not.toMatch(/conforme/i);
  });

  it('⚠️ quand la conclusion n’a pas pu être lue, aucun domaine n’est déclaré sain', () => {
    const s = syntheseElectricite(NON_LUE);
    expect(s.issue).toBe('nonLu');
    expect(s.domaines.every((d) => d.etat === 'inconnu')).toBe(true);
  });
});

describe('⚠️ les valeurs fictives du mockup', () => {
  it('n’affiche ni niveau de risque, ni pourcentage de confiance', () => {
    for (const d of [SIX, SAINE, NON_LUE]) {
      const tout = JSON.stringify(syntheseElectricite(d));
      expect(tout).not.toMatch(/niveau de risque/i);
      expect(tout).not.toMatch(/risque mod[ée]r[ée]/i);
      expect(tout).not.toMatch(/\d{2}\s*%/);
    }
  });

  it('n’invente pas les trois familles de gravité de la planche', () => {
    const tout = JSON.stringify(syntheseElectricite(SIX));
    for (const invente of ['à risque', 'importantes', 'à améliorer']) {
      expect(tout.toLowerCase()).not.toContain(`anomalies ${invente}`);
    }
  });

  it('⚠️ n’écrit jamais une (non-)conformité à la NF C 15-100', () => {
    for (const d of [SIX, SAINE, NON_LUE]) {
      expect(JSON.stringify(syntheseElectricite(d))).not.toMatch(/NF\s*C\s*15-?100/i);
    }
  });
});

describe('les limites du contrôle', () => {
  it('porte toujours la limite que l’arrêté impose au rapport d’écrire', () => {
    const s = syntheseElectricite(SAINE);
    expect(s.limites.montrer).toBe(true);
    expect(s.limites.entrees.some((l) => /non visibles/i.test(l.quoi))).toBe(true);
  });

  it('reprend le motif du rapport quand des points n’ont pas pu être vérifiés', () => {
    const d = {
      ...SIX,
      faits: [
        { libelle: 'Anomalies relevées', valeur: '6' },
        {
          libelle: 'Points non vérifiés',
          valeur: '2',
          precision: 'Installation non alimentée le jour de la visite'
        }
      ]
    } as unknown as Diagnostic;
    const s = syntheseElectricite(d);
    expect(s.limites.entrees.some((l) => /2 points/.test(l.quoi))).toBe(true);
    expect(s.limites.entrees.some((l) => /non alimentée/i.test(l.pourquoi ?? ''))).toBe(true);
  });
});

describe('le rattachement d’une anomalie à son domaine', () => {
  it('suit le domaine que le rapport écrit, quand il l’écrit', () => {
    const a = anomalie('Libellé quelconque', [], { domaine: { numero: 3, nom: 'Protection des circuits' } });
    expect(domaineDe(a)).toBe(3);
  });

  it('le retrouve sur le libellé quand la colonne n’a pas pu être lue', () => {
    expect(domaineDe(anomalie('Absence de prise de terre'))).toBe(2);
    expect(domaineDe(anomalie('Matériel vétuste dans le garage'))).toBe(6);
  });

  it('⚠️ rend null plutôt que de forcer un domaine au hasard', () => {
    expect(domaineDe(anomalie('Observation sans rapport avec les six familles'))).toBeNull();
  });

  it('les six motifs ne se marchent pas dessus sur les libellés du corpus', () => {
    const corpus = [
      ['Au moins un socle de prise de courant comporte une broche de terre non reliée à la terre.', 2],
      ['L’installation comporte au moins un matériel électrique vétuste', 6],
      ['Locaux contenant une baignoire ou une douche : la liaison équipotentielle supplémentaire', 4]
    ] as const;
    for (const [libelle, attendu] of corpus) {
      expect(domaineDe(anomalie(libelle))).toBe(attendu);
    }
  });
});

describe('l’issue', () => {
  it('se lit sur les anomalies, jamais sur les mots du verdict', () => {
    expect(issueDe(SIX)).toBe('anomalies');
    expect(issueDe(SAINE)).toBe('sansAnomalie');
    expect(issueDe(NON_LUE)).toBe('nonLu');
  });
});

describe('le catalogue des domaines', () => {
  it('en compte six, ceux de l’arrêté du 28 septembre 2017', () => {
    expect(DOMAINES).toHaveLength(6);
  });
});

describe('⚠️ les points non vérifiés n’entrent pas dans un affichage rassurant', () => {
  it('compte ceux que le rapport ne rattache à aucun domaine', () => {
    const d = {
      ...SAINE,
      faits: [
        { libelle: 'Anomalies relevées', valeur: '0' },
        {
          libelle: 'Points non vérifiés',
          valeur: '2',
          precision: 'Installation non alimentée le jour de la visite'
        }
      ]
    } as unknown as Diagnostic;
    const s = syntheseElectricite(d);
    /* Le rapport ne dit pas AUQUEL des six domaines ces points appartiennent :
       les six lignes « Aucune anomalie relevée » doivent porter la réserve. */
    expect(s.nonAttribues).toBe(2);
  });

  it('ne réserve rien quand aucun point ne manque', () => {
    expect(syntheseElectricite(SAINE).nonAttribues).toBe(0);
  });
});

describe('les valeurs dérivées de la planche', () => {
  it('le niveau de risque monte quand la protection des PERSONNES est touchée', () => {
    /* Différentiel, terre, contact direct : ce sont les points qui coupent le
       courant quand il passe par quelqu'un. */
    expect(niveauDeRisque(syntheseElectricite(SIX))).toBe('ÉLEVÉ');
  });

  it('reste modéré quand aucune anomalie ne touche ces points', () => {
    const vetusteSeule = {
      ...SIX,
      faits: [{ libelle: 'Anomalies relevées', valeur: '1' }],
      anomalies: [anomalie('L’installation comporte au moins un matériel électrique vétuste')]
    } as unknown as Diagnostic;
    expect(niveauDeRisque(syntheseElectricite(vetusteSeule))).toBe('MODÉRÉ');
  });

  it('⚠️ n’évalue aucun risque quand la conclusion n’a pas pu être lue', () => {
    expect(niveauDeRisque(syntheseElectricite(NON_LUE))).toBe('NON ÉVALUÉ');
    expect(confianceDe(syntheseElectricite(NON_LUE)).part).toBeNull();
  });

  it('range les anomalies dans les trois familles sans en perdre une seule', () => {
    const s = syntheseElectricite(SIX);
    const f = famillesDe(s);
    const total = f.reduce((n, g) => n + g.anomalies.length, 0);
    expect(total).toBe(s.anomalies.length);
  });

  it('⚠️ ne descend pas la confiance à 100 % quand des points manquent', () => {
    const d = {
      ...SAINE,
      faits: [
        { libelle: 'Anomalies relevées', valeur: '0' },
        { libelle: 'Points non vérifiés', valeur: '2', precision: 'Installation non alimentée' }
      ]
    } as unknown as Diagnostic;
    const c = confianceDe(syntheseElectricite(d));
    expect(c.part).toBeLessThan(100);
    expect(c.manquants).toBe(2);
  });

  it('donne 100 % seulement quand les six domaines sont renseignés', () => {
    expect(confianceDe(syntheseElectricite(SAINE)).part).toBe(100);
  });
});
