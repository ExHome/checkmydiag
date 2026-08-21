/**
 * TROIS RANGS DANS LA VUE « LE RAPPORT ».
 *
 * Vingt-sept lignes d'un dossier étaient repérées, et rendues toutes pareil :
 * même corps de 14 px, même encre, seul le fond changeait d'une nuance.
 * « N°ADEME : 2633E2660001X » pesait donc autant que « il a été repéré des
 * unités de diagnostic de classe 3 ».
 *
 * Le moteur donnait pourtant déjà la réponse : il classe chaque repère en
 * `constat`, `donnee` ou `mot`. Sur le dossier d'exemple, cela fait 5, 14 et
 * 8. L'affichage jetait cette information — et la classe `surlignee` qu'il
 * posait n'était stylée dans aucun fichier du dépôt.
 *
 * Ordre d'Aude, qui tranche la forme : « on utilise le système de gras et un
 * petit alerte ». Pas d'aplat par ligne : un fond coloré sur chaque repère
 * transformerait la page du rapport en tableau de bord, et l'important
 * cesserait de se voir dès qu'il y en a beaucoup.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const LECTEUR = readFileSync('src/composants/Lecteur.svelte', 'utf8');

describe('les trois rangs de la vue « Le rapport »', () => {
  it('le rang vient de la famille, jamais d’une devinette', () => {
    expect(LECTEUR).toMatch(/class="ligne rang-\{r\?\.famille \?\? 'donnee'\}"/);
  });

  /**
   * Le repli est délibérément le rang 2 : un repère dont le moteur n'a pas
   * dit la famille ne doit pas se retrouver promu au rang du constat. En cas
   * de doute, on n'escalade pas.
   */
  it('un repère sans famille retombe au rang de la donnée', () => {
    expect(LECTEUR).toMatch(/\?\? 'donnee'/);
  });

  it('les trois rangs sont stylés', () => {
    for (const rang of ['rang-constat', 'rang-donnee', 'rang-mot']) {
      expect(LECTEUR, rang + ' n’est pas stylé').toContain('button.ligne.' + rang + ' {');
    }
  });

  /** C'est le gras qui fait le premier rang, pas la couleur. */
  it('le constat est en gras et plus grand', () => {
    const bloc = LECTEUR.slice(
      LECTEUR.indexOf('button.ligne.rang-constat {'),
      LECTEUR.indexOf('button.ligne.rang-donnee {')
    );
    expect(bloc).toMatch(/font-weight:\s*700/);
    expect(bloc).toMatch(/font-size:\s*1\.\d+em/);
  });

  /** Et la donnée ne l'est pas — sans quoi il n'y aurait plus de rang du tout. */
  it('la donnée reste au poids du texte courant', () => {
    const bloc = LECTEUR.slice(
      LECTEUR.indexOf('button.ligne {'),
      LECTEUR.indexOf('button.ligne.rang-constat {')
    );
    expect(bloc).toMatch(/font-weight:\s*400/);
  });

  /**
   * La petite alerte ne se pose que sur un constat qui porte une gravité :
   * une conclusion rassurante n'a pas besoin d'un point rouge, et une donnée
   * n'en a jamais besoin.
   */
  it('la petite alerte ne marque que les constats graves', () => {
    expect(LECTEUR).toMatch(
      /\{#if r\?\.famille === 'constat' && r\.ton && r\.ton !== 'info'\}/
    );
  });

  /**
   * Un disque coloré n'existe pas pour un lecteur d'écran. Le mot qui le
   * double doit être là, et masqué visuellement — sinon il se lirait deux
   * fois à l'écran.
   */
  it('la gravité est aussi dite en toutes lettres', () => {
    expect(LECTEUR).toMatch(/Point important/);
    expect(LECTEUR).toMatch(/À surveiller/);
    expect(LECTEUR).toMatch(/\.lecture-seule\s*\{/);
    const bloc = LECTEUR.slice(LECTEUR.indexOf('.lecture-seule {'));
    expect(bloc.slice(0, 220)).toMatch(/clip-path:\s*inset\(50%\)/);
  });

  /** La classe morte ne doit pas revenir : elle avait donné l'illusion d'un style. */
  it('la classe « surlignee » a disparu', () => {
    expect(LECTEUR).not.toMatch(/class="ligne surlignee"/);
  });
});
