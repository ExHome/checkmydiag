import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * L'ÉCRAN TERMITES — les sept blocs de l'ordre, et les garde-fous du visuel.
 *
 * ⚠️ L'écran vit dans `composants/ecrans/Termites.svelte`, et il existait AVANT
 * le pack d'Aude : sa planche montre les zones contrôlées, mais il ne portait
 * aucun des sept blocs. J'en avais écrit un second sans le savoir — doublon
 * supprimé, les blocs sont allés dans celui qui existait. La logique, elle,
 * reste ici, dans `synthese.ts`.
 *
 * On lit la source de l'écran : le plugin Svelte n'est pas chargé par Vitest, et
 * c'est la convention des autres tests de ce dossier.
 */
const source = readFileSync(
  new URL('../ecrans/Termites.svelte', import.meta.url),
  'utf8'
);

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
      'Voir les '
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
    expect(rang('Conseil Verrière')).toBeLessThan(rang('Voir les '));
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
    expect(source).toContain('const signeDuTon = ');
    expect(source).toContain('const motDuTon = ');
    expect(source).toContain('Point d’alerte');
    expect(source).toContain('Rien à signaler');
    expect(ecran).toContain('{signeDuTon(p.ton)}');
    expect(ecran).toContain('{motDuTon(p.ton)}');
    expect(ecran).toContain('pk-etiquette');
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

  it('⚠️ n’emploie AUCUNE couleur d’état — ni jeton, ni pigment inventé', () => {
    /*
     * Cet écran est plus strict que l'ordre, et sa raison est meilleure : « un
     * état qui se lit à la couleur ne se lit plus en noir et blanc, ni pour un
     * daltonien ». J'y avais mis un corail, puis le sauge, puis les jetons
     * `--ok/--attention/--alerte`. Les trois ont été refusés.
     */
    for (const jeton of ['--alerte', '--attention', '--ok', '--etq-', '--citron']) {
      expect(source).not.toContain(`var(${jeton}`);
    }
    expect(source).not.toMatch(/background:\s*var\(--verriere-sable-or/);
  });
});
