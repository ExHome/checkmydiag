/**
 * LA PREMIÈRE SCÈNE, ET CE QU'ELLE REFUSE DE DIRE.
 *
 * Ces tests valent patron pour les trente scènes suivantes : ils vérifient
 * moins le dessin que ses interdits.
 */
import { describe, expect, it } from 'vitest';
import { largeurDe, sceneZonesTermites } from './zonesTermites';
import { compter } from './scene';
import type { Diagnostic } from '../../lib/modele';

function diag(zones: { nom: string; etat: string; detail?: string }[], limites: string[] = []): Diagnostic {
  return {
    type: 'termites',
    titre: 'Termites',
    verdict: 'Aucun indice d’infestation n’a été relevé dans les parties visitées.',
    gravite: 'bon',
    pages: [6, 6],
    schema: { genre: 'pieces', zones },
    ...(limites.length
      ? {
          constatations: {
            lue: true,
            neant: false,
            entrees: limites.map((t) => ({ terme: t, nature: 'limite' as const }))
          }
        }
      : {})
  } as unknown as Diagnostic;
}

describe('la scène des zones termites', () => {
  it('une case par zone, dans l’ordre du rapport', () => {
    const s = sceneZonesTermites(
      diag([
        { nom: 'Séjour', etat: 'bon' },
        { nom: 'Cave', etat: 'alerte' },
        { nom: 'Chambre 01', etat: 'bon' }
      ])
    );
    expect(s?.briques).toHaveLength(3);
    expect(s?.briques.map((b) => b.nom)).toEqual(['Séjour', 'Cave', 'Chambre 01']);
  });

  it('nettoie les tirets que la mise en page laisse traîner', () => {
    const s = sceneZonesTermites(diag([{ nom: 'Cave —', etat: 'bon' }]));
    expect(s?.briques[0]?.nom).toBe('Cave');
  });

  /**
   * LE TEST QUI PORTE TOUT. Une zone que le moteur n'a pas su conclure devient
   * `nonConclu` — notre silence — et jamais `nonControle`, qui accuserait le
   * diagnostiqueur de ne pas y être allé.
   */
  it('une zone non conclue dit que le silence est le nôtre', () => {
    const s = sceneZonesTermites(diag([{ nom: 'Combles', etat: 'neutre' }]));
    const b = s?.briques[0];
    expect(b && 'etat' in b && b.etat).toBe('nonConclu');
    expect(b && 'note' in b && b.note.source).toBe('verriere');
  });

  /** Le vert porte sa preuve : la ligne du tableau qui dit qu'on a regardé. */
  it('une zone favorable cite ce que le rapport y a vu', () => {
    const s = sceneZonesTermites(
      diag([{ nom: 'Séjour', etat: 'bon', detail: 'Plinthes — absence d’indices' }])
    );
    const b = s?.briques[0];
    expect(b && 'sonde' in b && b.sonde.texte).toBe('Plinthes — absence d’indices');
    expect(b && 'sonde' in b && b.sonde.source).toBe('rapport');
  });

  it('compte les états sans les trier', () => {
    const s = sceneZonesTermites(
      diag([
        { nom: 'A', etat: 'bon' },
        { nom: 'B', etat: 'alerte' },
        { nom: 'C', etat: 'neutre' }
      ])
    );
    expect(s && compter(s)).toEqual({ bon: 1, attention: 0, alerte: 1, nonControle: 0, nonConclu: 1 });
  });
});

describe('ce que la scène ne montre pas', () => {
  it('dit toujours que le repérage est visuel', () => {
    const s = sceneZonesTermites(diag([{ nom: 'Séjour', etat: 'bon' }]));
    expect(s?.horsChamp.some((h) => /visuel|parties accessibles/i.test(h.texte))).toBe(true);
  });

  /**
   * Le dessin est une enfilade, pas un plan. Sans cette phrase, quelqu'un y
   * chercherait la disposition de son logement — et croirait la reconnaître.
   */
  it('prévient que l’ordre est celui du rapport', () => {
    const s = sceneZonesTermites(diag([{ nom: 'Séjour', etat: 'bon' }]));
    expect(s?.horsChamp.some((h) => /ordre du rapport/i.test(h.texte))).toBe(true);
  });

  it('ajoute les limites d’inspection du dossier', () => {
    /* Les limites appartiennent au DIAGNOSTIC, pas à la scène : c'est le
       rapport qui les porte, et la scène ne fait que les reprendre. */
    const s = sceneZonesTermites(
      diag([{ nom: 'Séjour', etat: 'bon' }], ['Vide sanitaire non accessible'])
    );
    expect(s?.horsChamp.some((h) => /vide sanitaire/i.test(h.texte))).toBe(true);
  });
});

describe('sans zone, pas de scène', () => {
  /** Une scène vide vaut moins que pas de scène : l'écran a d'autres mots. */
  it('rend null plutôt qu’un dessin vide', () => {
    expect(sceneZonesTermites(diag([]))).toBeNull();
  });
});

describe('la géométrie ne déforme pas', () => {
  it('la largeur suit le nombre de cases', () => {
    const une = sceneZonesTermites(diag([{ nom: 'A', etat: 'bon' }]))!;
    const trois = sceneZonesTermites(
      diag([
        { nom: 'A', etat: 'bon' },
        { nom: 'B', etat: 'bon' },
        { nom: 'C', etat: 'bon' }
      ])
    )!;
    expect(largeurDe(une)).toBe(18);
    expect(largeurDe(trois)).toBe(18 * 3 + 4 * 2);
  });
});
