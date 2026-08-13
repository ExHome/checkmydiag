/**
 * L'intégrité de la cartographie.
 *
 * Elle est appelée à grossir beaucoup : un clip qui pointe vers une notion
 * inexistante doit se voir ici, pas chez le lecteur.
 */
import { describe, expect, it } from 'vitest';
import { NOTIONS, QUESTIONS, notion, registreDe } from './notions';
import type { Diagnostic } from '../modele';

describe('la cartographie du savoir', () => {
  it('n’a pas deux notions sous le même identifiant', () => {
    const ids = NOTIONS.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('pose un vrai terme et sa définition en une phrase', () => {
    for (const n of NOTIONS) {
      expect(n.terme.length, n.id).toBeGreaterThan(2);
      expect(n.definition.length, n.id).toBeGreaterThan(20);
      // Une phrase, pas un paragraphe : la définition tient sous les yeux.
      expect(n.definition.length, n.id).toBeLessThan(260);
    }
  });

  it('ne laisse aucun clip pointer dans le vide', () => {
    for (const n of NOTIONS) {
      for (const niveau of n.niveaux) {
        for (const bribe of niveau.bribes) {
          for (const id of bribe.clips ?? []) {
            expect(notion(id), `${n.id} → ${id}`).toBeDefined();
          }
        }
      }
    }
  });

  it('garde les rangs dans l’ordre, et le rang 8 hors des niveaux écrits', () => {
    for (const n of NOTIONS) {
      const rangs = n.niveaux.map((niveau) => niveau.rang);
      expect([...rangs].sort((a, b) => a - b), n.id).toEqual(rangs);
      // Le niveau 8 ne s'écrit pas à la main : il vient du dossier déposé.
      expect(rangs, n.id).not.toContain(8);
    }
  });

  /**
   * La deuxième promesse du produit vaut aussi pour l'argent. Tant qu'aucune
   * source sérieuse n'est branchée, aucune notion n'avance de montant — on
   * explique ce qui fait le prix, on ne le devine pas.
   */
  it('n’avance aucun prix', () => {
    const MONTANT = /\d[\d\s  ]*(?:€|euros?)|(?:€|euros?)\s*\d/i;
    const fautifs: string[] = [];

    for (const n of NOTIONS) {
      const textes = [n.definition, ...n.niveaux.flatMap((niv) => niv.bribes.map((b) => b.texte))];
      for (const texte of textes) {
        if (MONTANT.test(texte)) fautifs.push(`${n.id} : ${texte.slice(0, 70)}`);
      }
    }

    expect(fautifs).toEqual([]);
  });

  it('donne un registre à chaque niveau', () => {
    for (const n of NOTIONS) {
      for (const niveau of n.niveaux) {
        expect(['fait', 'explication', 'hypothese', 'piste']).toContain(registreDe(niveau));
        expect(niveau.question ?? QUESTIONS[niveau.rang], n.id).toBeTruthy();
      }
    }
  });
});

describe('« Et chez moi ? »', () => {
  const plomb: Diagnostic = {
    type: 'plomb',
    titre: 'Plomb',
    verdict: 'Deux éléments en classe 3.',
    gravite: 'alerte',
    faits: [],
    explication: [],
    aFaire: [],
    pages: [1, 4],
    schema: { genre: 'plomb', total: 24, nonMesurees: 0, classes: [18, 3, 1, 2], emplacements: [] }
  };

  it('avoue quand le dossier ne contient pas le diagnostic', () => {
    const saturnisme = notion('saturnisme');
    expect(saturnisme?.chezMoi?.([])).toEqual({ etat: 'absent' });
  });

  it('cite le rapport quand il dit quelque chose', () => {
    const reponse = notion('saturnisme')?.chezMoi?.([plomb]);
    expect(reponse?.etat).toBe('dit');
    expect(reponse?.etat === 'dit' && reponse.phrase).toContain('2 élément');
  });

  it('ne conclut pas à la place du rapport quand rien n’est en classe 3', () => {
    const sain: Diagnostic = {
      ...plomb,
      schema: { genre: 'plomb', total: 24, nonMesurees: 0, classes: [24, 0, 0, 0], emplacements: [] }
    };
    const reponse = notion('saturnisme')?.chezMoi?.([sain]);
    expect(reponse?.etat === 'dit' && reponse.phrase).toContain('aucune peinture en classe 3');
  });

  it('dit que le détail n’a pas pu être lu plutôt que d’inventer', () => {
    const illisible: Diagnostic = { ...plomb, schema: null };
    const reponse = notion('saturnisme')?.chezMoi?.([illisible]);
    expect(reponse?.etat).toBe('muet');
  });
});

describe('les parois du DPE', () => {
  /** Un dossier où chaque paroi est dans un état différent. */
  const dpe = (isolation: Record<string, string>): Diagnostic[] => [
    {
      type: 'dpe',
      titre: 'DPE',
      verdict: 'Classé E.',
      gravite: 'attention',
      faits: [],
      explication: [],
      aFaire: [],
      pages: [1, 12],
      schema: {
        genre: 'dpe',
        energie: { lettre: 'E', valeur: 291, unite: 'kWh/m²/an', recalculee: false },
        climat: { lettre: 'D', valeur: 42, unite: 'kg CO₂/m²/an', recalculee: false },
        finale: 'E',
        isolation: isolation as never,
        postes: [
          { nom: 'Chauffage', kwh: 14200 },
          { nom: 'Eau chaude sanitaire', kwh: 3100 }
        ]
      }
    }
  ];

  const tout = { toit: 'isole', murs: 'isole', fenetres: 'isole', plancher: 'isole' };

  /**
   * Les phrases sont fabriquées : leur accord l'est aussi. « La toiture comme
   * isolé » décrédibilise tout le reste du panneau.
   */
  it.each([
    ['toiture', 'la toiture comme isolée'],
    ['murs', 'les murs comme isolés'],
    ['fenetres', 'les fenêtres comme isolées'],
    ['plancher-bas', 'le plancher bas comme isolé']
  ])('accorde correctement %s', (id, attendu) => {
    const reponse = notion(id)?.chezMoi?.(dpe(tout));
    expect(reponse?.etat === 'dit' && reponse.phrase).toContain(attendu);
  });

  it('accorde aussi quand le rapport ne dit rien', () => {
    const muet = { ...tout, toit: 'inconnu', plancher: 'inconnu' };
    const toiture = notion('toiture')?.chezMoi?.(dpe(muet));
    const plancher = notion('plancher-bas')?.chezMoi?.(dpe(muet));
    expect(toiture?.etat === 'muet' && toiture.phrase).toContain('la toiture est isolée');
    expect(plancher?.etat === 'muet' && plancher.phrase).toContain('le plancher bas est isolé');
  });

  it('donne la part des postes sans article bancal', () => {
    const chauffage = notion('chauffage')?.chezMoi?.(dpe(tout));
    const ecs = notion('eau-chaude')?.chezMoi?.(dpe(tout));
    expect(chauffage?.etat === 'dit' && chauffage.phrase).toMatch(/^Le chauffage pèse \d+ %/);
    expect(ecs?.etat === 'dit' && ecs.phrase).toMatch(/^L’eau chaude pèse \d+ %/);
  });

  it('ne conclut rien sur la ventilation, que le DPE ne mesure pas', () => {
    expect(notion('ventilation')?.chezMoi?.(dpe(tout)).etat).toBe('muet');
  });
});
