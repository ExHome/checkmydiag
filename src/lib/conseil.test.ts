/**
 * LE CONSEIL DOIT RECEVOIR LES NEUF DIAGNOSTICS, PAS TROIS.
 *
 * Ce que ces tests verrouillent est un défaut mesuré le 21/08/2026 : la vue
 * « Le conseil » ne branchait que sur le DPE, l'électricité, le gaz et les
 * contrôles du dossier. Amiante, plomb, termites, état des risques, Carrez et
 * assainissement calculaient leur `aFaire` — travaux imposés, déclaration en
 * mairie, délai d'un an après l'acte — et ces phrases n'atteignaient jamais le
 * lecteur qui venait chercher ce qu'il fallait faire.
 *
 * Le test central est donc celui de la perte : tout ce que le moteur écrit
 * arrive au conseil, une fois, sans exception. Un diagnostic qu'on ajouterait
 * demain et qu'on oublierait de brancher ferait tomber ce test.
 */
import { describe, expect, it } from 'vitest';
import { analyser } from './analyse/index';
import { conseil, tousLesPoints, type Conseil, type Rang } from './conseil';
import type { Analyse, Diagnostic, PointDeControle } from './modele';


/*
 * Le conseil est rangé PAR DIAGNOSTIC depuis l'ordre d'Aude du 21/08/2026. Les
 * rangs — avant, lever, négocier, réserve — sont devenus des intertitres sous
 * chaque rapport. Ces lecteurs posent donc les questions d'avant sur la forme
 * d'aujourd'hui : « que dit ce rang, tous diagnostics confondus ? », et « quels
 * diagnostics parlent dans ce rang ? ».
 */

/** Tous les gestes d'un rang, tous diagnostics confondus. */
const pointsDuRang = (r: Conseil, rang: Rang): string[] =>
  r.diagnostics.flatMap((d) => d.blocs.filter((b) => b.rang === rang).flatMap((b) => b.points));

/** Les diagnostics qui parlent dans ce rang. */
const originesDuRang = (r: Conseil, rang: Rang): string[] =>
  r.diagnostics.filter((d) => d.blocs.some((b) => b.rang === rang)).map((d) => d.origine);

/** Le bloc d'un diagnostic. */
const diagDe = (r: Conseil, origine: string) => r.diagnostics.find((d) => d.origine === origine);

/** Ce rang est-il présent quelque part ? */
const rangPresent = (r: Conseil, rang: Rang): boolean =>
  r.diagnostics.some((d) => d.blocs.some((b) => b.rang === rang));

const page = (numero: number, ...lignes: string[]) => ({ numero, lignes });

/** Un dossier réel dans sa forme, dont on remplace le contenu lu. */
function dossier(diagnostics: Diagnostic[], controles: PointDeControle[] = []): Analyse {
  const base = analyser([page(1, 'Dossier Technique Immobilier')]);
  return { ...base, diagnostics, controles };
}

function diag(partiel: Partial<Diagnostic>): Diagnostic {
  return {
    type: 'dpe',
    titre: 'Diagnostic',
    verdict: 'Verdict',
    gravite: 'neutre',
    faits: [],
    explication: [],
    aFaire: [],
    schema: null,
    pages: [1, 2],
    ...partiel
  } as Diagnostic;
}

/** Les six que le conseil laissait sur le bord de la route, chacun avec un geste. */
const OUBLIES: Diagnostic[] = [
  diag({
    type: 'plomb',
    titre: 'Plomb dans les peintures (CREP)',
    gravite: 'alerte',
    aFaire: [
      'Le propriétaire doit faire réaliser les travaux qui suppriment l’exposition — article L.1334-9 du code de la santé publique.'
    ]
  }),
  diag({
    type: 'amiante',
    titre: 'Amiante',
    gravite: 'attention',
    aFaire: ['Ne percez, ne poncez, ne découpez jamais un matériau amianté vous-même.']
  }),
  diag({
    type: 'termites',
    titre: 'Termites',
    gravite: 'alerte',
    aFaire: ['L’infestation doit être déclarée en mairie dans le mois.']
  }),
  diag({
    type: 'assainissement',
    titre: 'Assainissement non collectif',
    gravite: 'attention',
    aFaire: ['L’acquéreur dispose d’un an après la signature pour réaliser les travaux.']
  }),
  diag({
    type: 'carrez',
    titre: 'Superficie loi Carrez',
    gravite: 'bon',
    aFaire: ['Le mesurage n’a pas de durée de validité tant que le logement n’est pas modifié.']
  }),
  diag({
    type: 'erp',
    titre: 'État des risques',
    gravite: 'attention',
    aFaire: ['Validité : six mois. C’est le diagnostic qui périme le plus vite, avec les termites.']
  })
];

describe('le conseil ne perd rien de ce que le moteur a trouvé', () => {
  const controles: PointDeControle[] = [
    {
      titre: 'État des risques périmé',
      explication: 'Il date de plus de six mois.',
      quoiFaire: 'Demandez-en un nouveau avant le rendez-vous.',
      genre: 'perime',
      type: 'erp'
    },
    {
      titre: 'Deux surfaces différentes',
      explication: 'Le DPE et le Carrez ne donnent pas le même chiffre.',
      quoiFaire: 'Faites trancher avant l’acte.',
      genre: 'incoherence'
    }
  ];

  const analyse = dossier(OUBLIES, controles);
  const rendu = conseil(analyse);
  const tous = tousLesPoints(rendu);

  it('fait arriver chaque geste du moteur, une fois et une seule', () => {
    for (const d of analyse.diagnostics) {
      for (const ligne of d.aFaire) {
        expect(tous.filter((t) => t === ligne), `perdu : ${ligne}`).toHaveLength(1);
      }
    }
    for (const c of controles) {
      expect(tous.filter((t) => t.includes(c.quoiFaire)), `perdu : ${c.titre}`).toHaveLength(1);
    }
  });

  /**
   * Le défaut d'origine, nommé. Six diagnostics sur neuf n'atteignaient pas
   * cette vue : un acquéreur pouvait lire « Le conseil » en entier sans jamais
   * apprendre que des travaux plomb lui étaient imposés.
   */
  it('n’oublie aucun des six diagnostics qui n’y arrivaient pas', () => {
    const origines = new Set(rendu.diagnostics.map((d) => d.origine));
    for (const type of ['plomb', 'amiante', 'termites', 'assainissement', 'carrez', 'erp']) {
      expect(origines.has(type as never), `absent du conseil : ${type}`).toBe(true);
    }
  });

  /** Chaque point dit d'où il sort : un conseil sans provenance ne se vérifie pas. */
  it('nomme le diagnostic dont chaque point découle', () => {
    for (const d of rendu.diagnostics) {
      expect(d.titre.length).toBeGreaterThan(0);
      for (const bloc of d.blocs) expect(bloc.titre.length).toBeGreaterThan(0);
    }
  });

  /**
   * Ce que dit le RAPPORT ne se réécrit pas ici : sinon une règle de droit
   * vivrait à deux endroits, et l'une des deux finirait périmée sans que
   * personne ne le voie.
   *
   * Deux choses s'écrivent tout de même dans le module, et elles sont bornées :
   * les limites du geste de diagnostic (ci-dessous), et le geste qui lève un
   * angle mort — qui porte sur l'accès, jamais sur l'état du bien, et qui est
   * vérifié plus bas. Ce dossier-ci n'a aucun angle mort : il ne doit donc
   * produire que les deux limites.
   */
  it('ne réécrit aucune phrase du moteur', () => {
    const duMoteur = new Set([
      ...analyse.diagnostics.flatMap((d) => d.aFaire),
      ...controles.map((c) => `${c.titre} — ${c.quoiFaire}`)
    ]);
    const inventes = tous.filter((t) => !duMoteur.has(t));
    /* Seules les limites du geste de diagnostic sont propres à cette vue. */
    expect(inventes).toHaveLength(2);
    expect(inventes.join(' ')).toMatch(/visible le jour de la visite/);
  });
});

describe('l’ordre du conseil suit celui du rendez-vous', () => {
  it('met les contrôles du dossier avant la signature', () => {
    const rendu = conseil(
      dossier([], [
        {
          titre: 'DPE absent',
          explication: 'Le dossier n’en contient pas.',
          quoiFaire: 'Réclamez-le au vendeur.',
          genre: 'manque'
        }
      ])
    );
    expect(pointsDuRang(rendu, 'avant')[0]).toMatch(/DPE absent/);
  });

  /**
   * Le gaz mis hors service ne se négocie pas : l'installation est coupée et sa
   * remise en service passe par le distributeur. C'est le seul diagnostic qui
   * bloque par lui-même, et il doit remonter au premier rang.
   */
  it('range le gaz en danger grave et immédiat avant la signature', () => {
    const gaz = diag({
      type: 'gaz',
      titre: 'Installation de gaz',
      gravite: 'alerte',
      faits: [{ libelle: 'DGI', valeur: 'oui', precision: 'mise hors service immédiate' }],
      aFaire: ['Ne remettez pas l’installation en service vous-même.']
    });
    const rendu = conseil(dossier([gaz]));
    expect(originesDuRang(rendu, 'avant')).toContain('gaz');
  });

  it('range une installation de gaz saine dans ce que le dossier ne garantit pas', () => {
    const gaz = diag({
      type: 'gaz',
      titre: 'Installation de gaz',
      gravite: 'bon',
      aFaire: ['Validité : trois ans à la vente, six ans à la location.']
    });
    const rendu = conseil(dossier([gaz]));
    expect(rangPresent(rendu, 'avant')).toBe(false);
    expect(originesDuRang(rendu, 'reserve')).toContain('gaz');
  });

  it('met à négocier ce qui a un coût sans interdire de vendre', () => {
    const rendu = conseil(dossier(OUBLIES));
    expect(originesDuRang(rendu, 'negocier')).toContain('plomb');
    expect(originesDuRang(rendu, 'negocier')).toContain('amiante');
  });
});

/**
 * ORDRE D'AUDE : « dans le conseil tu fais un bandeau avec les diags et le
 * conseil par diag. »
 *
 * Le conseil était rangé par temps, et un même rapport parlait donc dans trois
 * blocs éloignés : pour savoir ce qu'implique le plomb, il fallait le chercher
 * trois fois.
 */
describe('le conseil se lit diagnostic par diagnostic', () => {
  it('donne un bloc par diagnostic, et rassemble tout ce qu’il dit', () => {
    const rendu = conseil(dossier(OUBLIES));
    const plomb = diagDe(rendu, 'plomb');
    expect(plomb?.titre).toBe('Plomb dans les peintures (CREP)');
    expect(plomb?.blocs.flatMap((b) => b.points)).toHaveLength(1);
  });

  it('n’ouvre pas deux blocs pour le même diagnostic', () => {
    /* L'ERP arrive deux fois : par un contrôle périmé, puis par ses gestes. */
    const rendu = conseil(
      dossier(OUBLIES, [
        {
          titre: 'État des risques périmé',
          explication: 'Il date de plus de six mois.',
          quoiFaire: 'Demandez-en un nouveau.',
          genre: 'perime',
          type: 'erp'
        }
      ])
    );
    const cles = rendu.diagnostics.map((d) => d.origine);
    expect(new Set(cles).size).toBe(cles.length);
    /* Et les deux temps de l'ERP cohabitent sous son seul bloc. */
    expect(diagDe(rendu, 'erp')?.blocs.map((b) => b.rang)).toEqual(['avant', 'negocier']);
  });

  /**
   * Un contrôle peut viser un rapport ABSENT du dossier — « DPE absent » porte
   * le type `dpe` alors qu'aucun DPE n'y est. Bâtir l'ordre sur les seuls
   * diagnostics présents faisait disparaître exactement ce que le conseil doit
   * crier le plus fort : ce qui manque.
   */
  it('garde un bloc pour un rapport absent du dossier', () => {
    const rendu = conseil(
      dossier([], [
        {
          titre: 'DPE absent',
          explication: 'Le dossier n’en contient pas.',
          quoiFaire: 'Réclamez-le au vendeur.',
          genre: 'manque',
          type: 'dpe'
        }
      ])
    );
    expect(diagDe(rendu, 'dpe')?.blocs[0]?.points[0]).toMatch(/DPE absent/);
  });

  /**
   * « Même si c'est pas obligatoire, ça va être une marge de négo » — Aude,
   * 21/08/2026. L'intertitre doit le dire lui-même : un acquéreur qui lit
   * « aucun texte n'oblige le vendeur à réparer » en conclut sinon qu'il n'y a
   * rien à en tirer, alors que c'est l'inverse.
   */
  it('annonce la marge de négociation, et pas seulement l’absence d’obligation', () => {
    const rendu = conseil(dossier(OUBLIES));
    const titre = rendu.diagnostics
      .flatMap((d) => d.blocs)
      .find((b) => b.rang === 'negocier')?.titre;
    expect(titre).toMatch(/marge de négociation/i);
    expect(titre).toMatch(/[Pp]as obligatoire/);
  });

  /** La date vit avec son rapport : « valable jusqu'au » décrit le diagnostic. */
  it('porte l’échéance sur le diagnostic lui-même', () => {
    const erp = diag({
      type: 'erp',
      titre: 'État des risques',
      gravite: 'attention',
      aFaire: ['Validité : six mois.'],
      validiteLue: { jusquAu: '01/01/2026', terme: 'durée de validité de 6 mois' }
    });
    const rendu = conseil(dossier([erp]), new Date('2026-08-21T12:00:00Z'));
    expect(diagDe(rendu, 'erp')?.echeance?.perimee).toBe(true);
    expect(diagDe(rendu, 'erp')?.echeance?.texte).toMatch(/Périmé depuis/);
  });

  /**
   * Ranger par diagnostic a coûté la lecture transversale : « à régulariser
   * avant la signature » réunissait tout ce qui fait repousser un rendez-vous,
   * et c'est la question du notaire — elle ne se pose pas rapport par rapport.
   * Le rappel la rend, sans devenir une section.
   */
  it('réunit ce qui bloque le rendez-vous, tous rapports confondus', () => {
    const gaz = diag({
      type: 'gaz',
      titre: 'Installation de gaz',
      gravite: 'alerte',
      faits: [{ libelle: 'DGI', valeur: 'oui' }],
      aFaire: ['Ne remettez pas l’installation en service vous-même.']
    });
    const rendu = conseil(
      dossier([gaz], [
        {
          titre: 'État des risques périmé',
          explication: 'Plus de six mois.',
          quoiFaire: 'Demandez-en un nouveau.',
          genre: 'perime',
          type: 'erp'
        }
      ])
    );
    /* Deux rapports différents, une seule liste — c'est tout l'intérêt. */
    expect(rendu.aRegler.map((l) => l.origine)).toEqual(['erp', 'gaz']);
    expect(rendu.aRegler[0]?.texte).toMatch(/État des risques périmé/);
    expect(rendu.aRegler[0]?.provenance.length).toBeGreaterThan(0);
  });

  it('ne dit rien quand rien ne bloque', () => {
    expect(conseil(dossier(OUBLIES)).aRegler).toHaveLength(0);
  });

  /** Chaque ligne du rappel se retrouve dans le bloc de son diagnostic. */
  it('n’ajoute aucune ligne que le conseil ne porte déjà', () => {
    const rendu = conseil(
      dossier([], [
        {
          titre: 'DPE absent',
          explication: 'Le dossier n’en contient pas.',
          quoiFaire: 'Réclamez-le au vendeur.',
          genre: 'manque',
          type: 'dpe'
        }
      ])
    );
    const tous = tousLesPoints(rendu);
    for (const ligne of rendu.aRegler) expect(tous).toContain(ligne.texte);
  });

  /** Ce qui ne relève d'aucun rapport ferme la marche, sous « Le dossier ». */
  it('range les limites du geste de diagnostic sous « Le dossier »', () => {
    const rendu = conseil(dossier(OUBLIES));
    const dernier = rendu.diagnostics[rendu.diagnostics.length - 1];
    expect(dernier?.origine).toBe('dossier');
    expect(dernier?.blocs.flatMap((b) => b.points).join(' ')).toMatch(/visible le jour de la visite/);
  });
});

/**
 * ORDRE D'AUDE : « on prend tout ce qui n'a pas été visité et on préconise —
 * trappe d'accès, ou enlever les meubles, ou actualiser les diags, ou remettre
 * l'électricité en route ». Et : « à chaque fois ça renvoie vers un
 * professionnel spécifique ».
 */
describe('ce que personne n’est allé voir devient un geste', () => {
  const elec = (releves: NonNullable<Diagnostic['releves']>, faits: Diagnostic['faits'] = []) =>
    conseil(
      dossier([
        diag({
          type: 'electricite',
          titre: 'Installation électrique',
          gravite: 'attention',
          aFaire: ['Faites établir un devis.'],
          faits,
          releves
        })
      ])
    );

  const lever = (r: Conseil) => r.diagnostics.flatMap((d) => d.blocs).find((b) => b.rang === 'lever');

  it('remonte une pièce non visitée, avec l’endroit et le motif du rapport', () => {
    const r = elec([
      { genre: 'nonVisite', libelle: 'Absence de trappe de visite', ou: 'Sous-sol - Cave' }
    ]);
    const texte = lever(r)?.points[0] ?? '';
    expect(texte).toMatch(/Sous-sol - Cave/);
    /* Les mots du rapport, entiers, AVANT l'explication. */
    expect(texte).toMatch(/Absence de trappe de visite/);
    expect(texte.indexOf('Absence de trappe')).toBeLessThan(texte.indexOf('Demandez'));
  });

  it('préconise la trappe quand le rapport dit qu’elle manque', () => {
    const r = elec([{ genre: 'nonVisite', libelle: 'Absence de trappe de visite' }]);
    expect(lever(r)?.points[0]).toMatch(/trappe de visite|ouverture de l’accès/);
  });

  it('préconise de dégager quand le local est encombré ou meublé', () => {
    const r = elec([{ genre: 'nonVisite', libelle: 'Encombrement trop important' }]);
    expect(lever(r)?.points[0]).toMatch(/dégager/);
  });

  it('préconise la clé quand le local est fermé', () => {
    const r = elec([{ genre: 'nonVisite', libelle: 'Local fermé à clé' }]);
    expect(lever(r)?.points[0]).toMatch(/clé|ouverture/);
  });

  /** « REMETTRE ÉLECTRICITÉ EN ROUTE » — le fait porte le nombre et le motif. */
  it('préconise de remettre l’installation en route quand elle n’était pas alimentée', () => {
    const r = elec(
      [],
      [
        {
          libelle: 'Points non vérifiés',
          valeur: '3',
          precision: 'installation non alimentée le jour de la visite'
        }
      ]
    );
    const texte = lever(r)?.points[0] ?? '';
    expect(texte).toMatch(/3 points de contrôle/);
    expect(texte).toMatch(/non alimentée/);
    expect(texte).toMatch(/remettre l’installation en route/);
  });

  it('remonte la mesure de monoxyde non réalisée', () => {
    const gaz = diag({
      type: 'gaz',
      titre: 'Installation de gaz',
      gravite: 'attention',
      aFaire: ['Validité : trois ans.'],
      faits: [
        {
          libelle: 'Mesure du monoxyde de carbone',
          valeur: 'non réalisée',
          precision: 'l’appareil était à l’arrêt le jour de la visite'
        }
      ]
    });
    const texte = lever(conseil(dossier([gaz])))?.points[0] ?? '';
    expect(texte).toMatch(/monoxyde de carbone n’a pas été réalisée/);
    expect(texte).toMatch(/appareil en marche/);
  });

  /**
   * Un angle mort n'est pas un défaut. Le placer dans « à négocier » ferait
   * croire qu'on a trouvé quelque chose, alors qu'on dit exactement l'inverse.
   */
  it('ne présente pas un angle mort comme un défaut', () => {
    const r = elec([{ genre: 'nonVisite', libelle: 'Absence de trappe de visite' }]);
    expect(lever(r)?.titre).toMatch(/lever/i);
    /* Et il se pose avant la négociation : on ne négocie pas l'inconnu. */
    const rangs = diagDe(r, 'electricite')?.blocs.map((b) => b.rang) ?? [];
    expect(rangs.indexOf('lever')).toBeLessThan(rangs.indexOf('negocier'));
  });

  it('n’ouvre pas la section quand rien ne manque', () => {
    const r = elec([]);
    expect(lever(r)).toBeUndefined();
  });

  /**
   * Un électricien ne peut pas dire ce qu'il y a dans une cave qu'il n'a pas
   * vue. Proposer ici le métier de la réparation ferait chiffrer des travaux
   * avant même de savoir s'il y en a.
   */
  it('renvoie au diagnostiqueur pour lever un angle mort', () => {
    /*
     * Le recours est porté par le DIAGNOSTIC depuis que le conseil est rangé
     * par rapport : c'est le premier point qui nomme un métier qui le donne. Un
     * angle mort arrive avant les anomalies à chiffrer, donc c'est bien le
     * diagnostiqueur qui est nommé — celui qui n'a pas pu voir doit revenir.
     */
    const r = elec([{ genre: 'nonVisite', libelle: 'Absence de trappe de visite' }]);
    expect(diagDe(r, 'electricite')?.recours?.qui).toMatch(/diagnostiqueur certifié/i);
  });

  it('fait exception pour un matériau que le rapport demande de sonder', () => {
    const amiante = diag({
      type: 'amiante',
      titre: 'Amiante',
      gravite: 'attention',
      aFaire: ['Ne percez rien vous-même.'],
      releves: [{ genre: 'nonVerifie', libelle: 'Dalles de sol', ou: 'Cuisine' }]
    });
    expect(diagDe(conseil(dossier([amiante])), 'amiante')?.recours?.qui).toMatch(
      /opérateur de repérage certifié/i
    );
  });
});

describe('chaque conseil renvoie vers un professionnel', () => {
  const recoursDe = (r: Conseil, type: string) => diagDe(r, type)?.recours;

  it('nomme le métier propre à chaque diagnostic', () => {
    const r = conseil(dossier(OUBLIES));
    expect(recoursDe(r, 'termites')?.qui).toMatch(/entreprise de traitement des termites/i);
    expect(recoursDe(r, 'termites')?.quoi).toMatch(/charpente/i);
    expect(recoursDe(r, 'plomb')?.qui).toMatch(/plomb/i);
    expect(recoursDe(r, 'erp')?.qui).toMatch(/assureur/i);
    expect(recoursDe(r, 'assainissement')?.qui).toMatch(/SPANC/i);
  });

  it('envoie vers un électricien pour chiffrer une anomalie électrique', () => {
    const elec = diag({
      type: 'electricite',
      titre: 'Installation électrique',
      gravite: 'attention',
      aFaire: ['Faites établir un devis.']
    });
    const r = recoursDe(conseil(dossier([elec])), 'electricite');
    expect(r?.qui).toMatch(/électricien/i);
    expect(r?.quoi).toMatch(/devis/i);
  });

  /** Le prélèvement, quand le rapport amiante réclame lui-même une sonde. */
  it('envoie vers un opérateur de repérage quand l’amiante reste à sonder', () => {
    const amiante = diag({
      type: 'amiante',
      titre: 'Amiante',
      gravite: 'attention',
      aFaire: ['Ne percez rien vous-même.'],
      releves: [{ genre: 'nonVerifie', libelle: 'Dalles de sol', ou: 'Cuisine' }]
    });
    const r = recoursDe(conseil(dossier([amiante])), 'amiante');
    expect(r?.qui).toMatch(/opérateur de repérage certifié/i);
    expect(r?.quoi).toMatch(/prélèvement|laboratoire accrédité/i);
  });

  /** Le gaz coupé ne se rouvre pas soi-même : le distributeur est dans la boucle. */
  it('envoie vers le distributeur pour un gaz mis hors service', () => {
    const gaz = diag({
      type: 'gaz',
      titre: 'Installation de gaz',
      gravite: 'alerte',
      faits: [{ libelle: 'DGI', valeur: 'oui' }],
      aFaire: ['Ne remettez pas l’installation en service vous-même.']
    });
    const r = recoursDe(conseil(dossier([gaz])), 'gaz');
    expect(r?.quoi).toMatch(/distributeur/i);
  });

  /** Un dossier périmé ou absent se refait : c'est le diagnostiqueur, pas un artisan. */
  it('renvoie au diagnostiqueur pour un rapport périmé ou manquant', () => {
    const r = conseil(
      dossier(
        [],
        [
          {
            titre: 'État des risques périmé',
            explication: 'Plus de six mois.',
            quoiFaire: 'Demandez-en un nouveau.',
            genre: 'perime',
            type: 'erp'
          }
        ]
      )
    );
    expect(diagDe(r, 'erp')?.recours?.qui).toMatch(/diagnostiqueur certifié/i);
  });

  /**
   * Là où rien n'est à faire, on ne propose personne : mettre un artisan sous
   * « aucun travail n'est imposé » vendrait une prestation inutile.
   */
  it('ne propose aucun professionnel sous ce que le dossier ne garantit pas', () => {
    const r = conseil(dossier(OUBLIES));
    /* Carrez ne parle QUE dans la réserve : il ne doit nommer personne. */
    expect(diagDe(r, 'carrez')?.blocs.every((b) => b.rang === 'reserve')).toBe(true);
    expect(diagDe(r, 'carrez')?.recours).toBeUndefined();
  });
});

describe('le conseil rend les textes sur lesquels il s’appuie', () => {
  /**
   * Le référentiel `reglement/textes.ts` porte les articles lus à la source,
   * chacun avec son lien Légifrance et sa date de lecture. Il n'était affiché
   * nulle part : le produit citait le droit sans jamais donner de quoi le
   * vérifier.
   */
  it('cite l’article et son lien Légifrance', () => {
    const rendu = conseil(dossier(OUBLIES));
    const sources = rendu.diagnostics.flatMap((d) => d.sources);
    expect(sources.length).toBeGreaterThan(0);
    for (const s of sources) {
      expect(s.reference).toMatch(/article|arrêté|décret|loi/i);
      expect(s.url).toMatch(/^https:\/\/www\.legifrance\.gouv\.fr\//);
      expect(s.luLe).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('ne cite pas deux fois le même article sous un diagnostic', () => {
    const rendu = conseil(dossier(OUBLIES));
    for (const d of rendu.diagnostics) {
      const cles = d.sources.map((s) => s.reference + s.url);
      expect(new Set(cles).size).toBe(cles.length);
    }
  });
});

describe('le calendrier du dossier', () => {
  const LE_JOUR = new Date('2026-08-21T12:00:00Z');

  it('met en tête ce qui est déjà périmé', () => {
    const perime = diag({
      type: 'erp',
      titre: 'État des risques',
      validiteLue: { jusquAu: '01/01/2026', terme: 'durée de validité de 6 mois' }
    });
    const valable = diag({
      type: 'plomb',
      titre: 'Plomb dans les peintures (CREP)',
      validiteLue: { jusquAu: '14/09/2027', terme: 'durée de validité de 1 an' }
    });
    const rendu = conseil(dossier([valable, perime]), LE_JOUR);
    expect(rendu.calendrier[0]?.type).toBe('erp');
    expect(rendu.calendrier[0]?.perimee).toBe(true);
    expect(rendu.calendrier[1]?.perimee).toBe(false);
  });

  it('donne une ligne par diagnostic du dossier', () => {
    const rendu = conseil(dossier(OUBLIES), LE_JOUR);
    expect(rendu.calendrier).toHaveLength(OUBLIES.length);
  });
});
