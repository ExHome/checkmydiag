/**
 * TOUT ÉCRAN QUI COUVRE LA VUE DOIT POUVOIR SE REFERMER AU GESTE.
 *
 * « Je n'arrive plus à sortir d'une page. » L'audit qui a suivi a montré deux
 * choses, mesurées à l'écran sur un iPhone de 375 px :
 *
 *   1. l'application n'écrivait RIEN dans l'historique — zéro `pushState` dans
 *      tout le dépôt. Le balayage depuis le bord et la flèche du navigateur
 *      s'adressaient donc au site entier : ils quittaient Verrière, et l'écran
 *      ouvert ne bougeait pas ;
 *   2. le geste de retour maison était attaché à `.scene`, qui commence après
 *      le rembourrage du contenu — à x = 16, pour un geste reconnu sous
 *      x = 24. Huit pixels utiles, sur un geste qui part du bord de la dalle.
 *
 * Ces tests lisent les sources. Ils ne remplacent pas l'essai au doigt : ils
 * empêchent que les deux réparations repartent sans que personne ne le voie.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const DIAGNOSTICS = readFileSync('src/composants/Diagnostics.svelte', 'utf8');
const LECTEUR = readFileSync('src/composants/Lecteur.svelte', 'utf8');

/** Le gabarit seul, sans le script ni les styles. */
function gabarit(source: string): string {
  const finScript = source.lastIndexOf('</script>');
  const debutStyle = source.indexOf('<style>');
  return source.slice(finScript, debutStyle === -1 ? undefined : debutStyle);
}

describe('les écrans qui couvrent la vue s’inscrivent dans l’historique', () => {
  it('l’écran plein d’un diagnostic empile une couche', () => {
    expect(DIAGNOSTICS).toMatch(/import \{ ouvrirCouche \} from '\.\.\/lib\/couches'/);
    expect(
      DIAGNOSTICS,
      'sans cela, le balayage depuis le bord quitte le site au lieu de fermer l’écran'
    ).toMatch(/ouvrirCouche\(/);
  });

  it('les vues plein écran du dossier empilent une couche', () => {
    expect(LECTEUR).toMatch(/import \{ ouvrirCouche \} from '\.\.\/lib\/couches'/);
    expect(LECTEUR).toMatch(/ouvrirCouche\(/);
  });

  /**
   * La garde qui évite d'empiler un cran par passage dans le dock : on entre
   * une fois, on ressort une fois.
   */
  it('changer de vue ne rajoute pas un cran d’historique', () => {
    expect(LECTEUR).toMatch(/function ouvrirLaVue\(\): void \{\s*if \(vueOuverte\) return;/);
  });
});

describe('le geste de retour part du vrai bord', () => {
  /**
   * Le conteneur qui porte le geste doit toucher le bord de l'écran. `.dedans`
   * occupe toute la largeur du plein écran ; `.scene` commence après le
   * rembourrage, et c'est précisément ce qui rendait le geste inatteignable.
   */
  it('le plein écran écoute le doigt sur toute sa largeur', () => {
    const vue = gabarit(DIAGNOSTICS);
    const dedans = vue.indexOf('class="dedans"');
    expect(dedans, 'le conteneur du plein écran a disparu').toBeGreaterThan(-1);

    const balise = vue.slice(dedans, vue.indexOf('>', dedans));
    expect(
      balise,
      'le geste doit être posé sur `.dedans`, qui va d’un bord à l’autre'
    ).toMatch(/use:gestesDuDoigt/);
  });

  /**
   * La largeur de la zone sensible est une valeur d'Apple, pas un réglage
   * libre : plus étroite, on rate le geste ; plus large, on ferme l'écran en
   * croyant le feuilleter.
   */
  it('la zone du bord reste à 24 pixels', () => {
    expect(DIAGNOSTICS).toMatch(/depuisLeBord = pleinEcran && e\.clientX <= 24/);
  });
});
