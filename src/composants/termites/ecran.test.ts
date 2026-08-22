import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * L'ÉCRAN TERMITES — les sept blocs de l'ordre, et les garde-fous du visuel.
 *
 * On lit la source de l'écran : le plugin Svelte n'est pas chargé par Vitest, et
 * c'est la convention des autres tests de ce dossier.
 */
const source = readFileSync(new URL('./Termites.svelte', import.meta.url), 'utf8');

/**
 * ⚠️ On teste le BALISAGE, pas la documentation.
 *
 * Mes premiers tests échouaient sur mes propres commentaires : ils citent
 * « 90 % », « niveau de risque » et « aucun termite vivant » pour expliquer
 * POURQUOI ces données sont absentes de l'écran. Les interdits portent sur ce
 * qui s'affiche, jamais sur ce qu'on documente — et documenter un interdit est
 * exactement ce qui l'empêche de revenir.
 *
 * On retire donc le bloc `<script>` et les commentaires avant de chercher.
 */
const ecran = source
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '');

describe('les sept blocs, dans l’ordre imposé', () => {
  it('sont tous là', () => {
    for (const titre of [
      'Points clés',
      'Résultat global',
      'Constatations diverses',
      'Ce qui n’a pas été contrôlé',
      'Complétude du contrôle',
      'Conseil Verrière',
      'Voir le rapport complet'
    ]) {
      expect(ecran, `bloc manquant : ${titre}`).toContain(titre);
    }
  });

  it('suivent l’ordre de l’ordre de mission', () => {
    const rang = (t: string) => ecran.indexOf(t);
    expect(rang('Points clés')).toBeLessThan(rang('Résultat global'));
    expect(rang('Résultat global')).toBeLessThan(rang('Constatations diverses'));
    expect(rang('Constatations diverses')).toBeLessThan(rang('Ce qui n’a pas été contrôlé'));
    expect(rang('Ce qui n’a pas été contrôlé')).toBeLessThan(rang('Complétude du contrôle'));
    expect(rang('Complétude du contrôle')).toBeLessThan(rang('Conseil Verrière'));
    expect(rang('Conseil Verrière')).toBeLessThan(rang('Voir le rapport complet'));
  });
});

describe('⚠️ les données fictives du visuel ne sont nulle part', () => {
  it('aucun pourcentage de confiance', () => {
    /* § E : « Ne pas afficher arbitrairement un pourcentage tel que 90 %. » */
    expect(ecran).not.toMatch(/NIVEAU DE CONFIANCE/i);
    expect(ecran).not.toMatch(/\b90\s*%/);
  });

  it('aucun niveau de risque', () => {
    /* § B : calculable ou issu d'une règle validée, jamais inventé. */
    expect(ecran).not.toMatch(/niveau de risque/i);
    expect(ecran).not.toMatch(/très faible|risque modéré/i);
  });

  it('la conclusion n’est pas décomposée en trois constats inventés', () => {
    expect(ecran).not.toMatch(/termite vivant|aucun dégât identifié|activité récent/i);
  });
});

describe('⚠️ aucun statut n’est porté par la couleur seule', () => {
  it('chaque ton s’accompagne d’un mot et d’un pictogramme', () => {
    /* § 4 : « Les statuts doivent être distinguables par le texte et l'icône,
       pas uniquement par la couleur. » */
    /* Les deux fonctions vivent dans le <script>, qu'on a retiré : on les
       cherche dans la source, et leur EMPLOI dans le balisage. */
    expect(source).toContain('const signe = ');
    expect(source).toContain('const mot = ');
    expect(source).toContain('Point d’alerte');
    expect(source).toContain('Rien à signaler');
    expect(ecran).toContain('{signe(p.ton)}');
    expect(ecran).toContain('{mot(p.ton)}');
    expect(ecran).toContain('etiquette-ton');
  });

  it('les limites portent un statut écrit', () => {
    expect(ecran).toContain('Non visitée');
    expect(ecran).toContain('Non examiné');
  });
});

describe('la portée du constat n’est jamais élargie', () => {
  it('le résultat global rappelle qu’il ne porte que sur l’examiné', () => {
    /* § 4 : « absence d'indice » ne devient jamais « absence de termites ». */
    expect(ecran).toContain('porte sur les éléments que l’opérateur a examinés');
  });

  it('les zones non contrôlées ne concluent rien', () => {
    /* § 15 : une zone inaccessible ne devient jamais une zone saine. */
    expect(ecran).toContain('le rapport ne conclut rien — ni présence, ni absence');
  });

  it('la charpente est annoncée pour ce qu’elle est', () => {
    expect(ecran).toContain('C’est là que les termites se');
    expect(ecran).toContain('la conclusion du rapport ne porte pas sur eux');
  });
});

describe('la charte Verrière', () => {
  it('est ivoire chaud et vert profond, jamais blanc clinique en fond', () => {
    expect(ecran).toContain('--verriere-ivoire');
    expect(ecran).toContain('--vert-800');
  });

  it('n’emploie le sable qu’en accent, jamais en aplat de fond', () => {
    /* « Accent : sable/laiton très discret ; éviter l'effet doré luxueux. » */
    expect(ecran).toMatch(/--verriere-sable-(voile|filet|clair|encre)/);
    expect(ecran).not.toMatch(/background:\s*var\(--verriere-sable-or/);
  });
});
