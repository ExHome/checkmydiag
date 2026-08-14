import { describe, expect, it } from 'vitest';
import { VALIDITE_MOIS } from '../analyse/coherence';
import { REGLEMENT, REGLEMENT_COPRO, aVerifier, casesVides, sourcesDe, type Regle } from './textes';

/**
 * Le référentiel se tient tout seul, ou il ne sert à rien.
 *
 * Ces tests ne vérifient pas le droit — aucun programme ne peut le faire. Ils
 * vérifient la discipline : chaque règle a sa source, chaque source a sa date,
 * et les durées de validité ne divergent pas de celles que le moteur applique.
 * C'est cette discipline qui rend le référentiel plus fiable qu'une mémoire.
 */
describe('le référentiel réglementaire', () => {
  const toutes: [string, Regle][] = [];
  for (const [cle, r] of Object.entries(REGLEMENT)) {
    if (!r) continue;
    toutes.push([cle, r.fondement], ...r.regles.map((x): [string, Regle] => [cle, x]));
  }
  for (const [cle, r] of Object.entries(REGLEMENT_COPRO)) {
    toutes.push([cle, r.fondement]);
  }

  it('cite une source pour chaque règle', () => {
    for (const [cle, regle] of toutes) {
      expect(regle.source.reference, `${cle} : référence manquante`).toBeTruthy();
      // Une source qui ne renvoie pas au texte oblige à le rechercher, donc à
      // ne pas le rechercher.
      expect(regle.source.url, `${cle} : ${regle.source.reference}`).toMatch(/^https:\/\/www\.legifrance\.gouv\.fr\//);
    }
  });

  it('date chaque lecture, et ne date pas du futur', () => {
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    for (const [cle, regle] of toutes) {
      expect(regle.source.luLe, `${cle}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(regle.source.luLe).getTime(), `${cle} : lu dans le futur`).toBeLessThan(
        demain.getTime()
      );
    }
  });

  it('énonce des règles, pas des slogans', () => {
    for (const [cle, regle] of toutes) {
      // Une règle qui tient en cinq mots est une règle qu'on a résumée, donc
      // déformée. C'est ainsi qu'on a écrit « amiante valable à vie ».
      expect(regle.enonce.length, `${cle} : énoncé trop court`).toBeGreaterThan(60);
    }
  });

  it('ne diverge pas des durées que le moteur applique', () => {
    // Deux tables de validité finiraient par se contredire, et c'est le
    // lecteur qui paierait l'écart : une date de péremption fausse fait
    // repousser une signature, ou pire, la laisse passer.
    for (const [cle, r] of Object.entries(REGLEMENT)) {
      if (!r || r.validiteMois === null) continue;
      expect(VALIDITE_MOIS[cle as keyof typeof VALIDITE_MOIS], `${cle}`).toBe(r.validiteMois);
    }
  });

  it('signale ce qui n’a pas été relu depuis un an', () => {
    // Tout vient d'être lu : rien ne doit remonter aujourd'hui.
    expect(aVerifier(new Date('2026-08-14'))).toEqual([]);

    // Deux ans plus tard, tout doit remonter — c'est le rappel qui empêche le
    // référentiel de devenir un souvenir.
    const dans2ans = aVerifier(new Date('2028-08-14'));
    expect(dans2ans.length).toBe(toutes.length);
    expect(dans2ans[0]?.moisDepuis).toBeGreaterThanOrEqual(24);
  });

  it('rend les sources d’un diagnostic sans les répéter', () => {
    const s = sourcesDe('electricite');
    expect(s.length).toBeGreaterThan(0);
    expect(new Set(s.map((x) => x.reference + x.url)).size).toBe(s.length);
    // Un diagnostic non encore lu ne rend aucune source : on n'invente pas.
    // Cette ligne a déjà changé de cible une fois — elle visait le plomb, qui a
    // depuis été lu à la source. C'est le seul test du dépôt qu'on est content
    // de voir échouer.
    expect(sourcesDe('assainissement')).toEqual([]);
  });

  it('avoue ce qu’il n’a pas encore lu', () => {
    // La liste de travail de la veille. Elle doit rétrécir avec le temps ; le
    // jour où elle est vide, ce test le dira en échouant, et ce sera une bonne
    // nouvelle à traiter.
    const vides = casesVides();
    for (const t of vides) expect(REGLEMENT[t]).toBeUndefined();
    // Ce qui est rempli n'y figure pas : la liste ne ment pas dans l'autre sens.
    for (const lu of ['dpe', 'electricite', 'carrez', 'amiante', 'plomb', 'termites', 'gaz'] as const) {
      expect(vides, `${lu} a été lu à la source`).not.toContain(lu);
    }
  });

  it('dit ce que le moteur affirme sur l’électricité, sans le raccourci', () => {
    const elec = REGLEMENT.electricite;
    expect(elec?.regles[0]?.enonce).toMatch(/six domaines/);
    // La réserve doit exister : c'est elle qui empêche de réécrire « six points ».
    expect(elec?.regles[0]?.reserve).toMatch(/ce ne sont pas .+six points/i);
  });
});
