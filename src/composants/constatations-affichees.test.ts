import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * LES CONSTATATIONS DIVERSES S'AFFICHENT — vraiment, pas seulement en mémoire.
 *
 * ⚠️ Ce test existe parce que j'ai livré la lecture sans vérifier l'affichage.
 * Le lecteur remplissait bien les données — mesuré : 48 rapports sur 150 —, et
 * rien n'apparaissait à l'écran. Aude a dû me le redire : *« je veux que ça soit
 * dans les termites »*.
 *
 * Et la première tentative les avait versées dans `faits`. Un `Fait` s'affiche
 * comme un CHIFFRE : une valeur en très gros, un libellé court dessous, et le
 * premier de la liste devient le chiffre dominant de la carte. Une phrase de
 * deux lignes s'y serait affichée en corps 40, à la place du nombre de zones
 * contrôlées. Elles ont maintenant leur bloc — § 19 de l'ordre de mission
 * termites, entre « Champignons / altérations » et « Zones non examinées ».
 *
 * On lit la source de l'écran, comme les autres tests de ce dossier : le
 * composant appelle `$effect`, qui n'existe pas en rendu serveur, et le plugin
 * Svelte n'est pas chargé par Vitest.
 */
const ecran = readFileSync(new URL('./Diagnostics.svelte', import.meta.url), 'utf8');

describe('les constatations diverses, à l’écran', () => {
  it('ont leur propre bloc dans la carte', () => {
    expect(ecran).toContain('Ce que le rapport constate en plus');
    expect(ecran).toMatch(/\{#if d\.constatations\}/);
  });

  it('citent les mots du rapport, entiers et entre guillemets', () => {
    /* On cite, puis on explique — le terme n'est ni reformulé ni tronqué. */
    expect(ecran).toMatch(/«\s*\{c\.terme\}\s*»/);
  });

  it('portent la localisation que le rapport donne', () => {
    expect(ecran).toContain('Localisation portée au rapport');
    expect(ecran).toMatch(/\{#if c\.ou\}/);
  });

  it('⚠️ ne sont PAS rendues comme un chiffre', () => {
    /*
     * Le garde-fou de la faute commise. La citation porte `mot-du-rapport` ;
     * `valeur-chef` est la classe du chiffre dominant et ne doit jamais
     * l'habiller.
     */
    const i = ecran.indexOf('Ce que le rapport constate en plus');
    const bloc = ecran.slice(i, i + 3000);
    expect(bloc).toContain('mot-du-rapport');
    expect(bloc).not.toContain('valeur-chef');
    expect(bloc).not.toContain('chiffres-suite');
  });

  it('séparent les limites d’examen des constats', () => {
    /* § 14 : une zone qui n'a pas pu être regardée n'est pas une zone saine, et
       dix-sept rubriques sur quarante ne contiennent QUE ces clauses-là. */
    expect(ecran).toContain('Ce que l’examen n’a pas couvert');
    expect(ecran).toContain('n’est pas une zone sans termites');
    expect(ecran).toMatch(/nature === 'limite'/);
    expect(ecran).toMatch(/nature === 'constat'/);
  });

  it('disent « Néant » quand la rubrique répond', () => {
    const i = ecran.indexOf('Ce que le rapport constate en plus');
    const bloc = ecran.slice(i, i + 3000);
    expect(bloc).toMatch(/d\.constatations\.neant/);
    expect(bloc).toContain('n’a rien relevé d’autre');
  });

  it('⚠️ disent « pas lue » quand l’éditeur n’est pas couvert — jamais « rien »', () => {
    /*
     * § 15 et § 24 : le silence est le NÔTRE, pas celui du diagnostiqueur. Onze
     * volets sur 250 n'ont aucun éditeur nommé, et leurs titres ressemblent à
     * ceux de LICIEL — se ressembler n'est pas être.
     */
    const i = ecran.indexOf('Ce que le rapport constate en plus');
    const bloc = ecran.slice(i, i + 3000);
    expect(bloc).toMatch(/!d\.constatations\.lue/);
    expect(bloc).toContain('Cela ne veut pas dire qu’elle est vide');
  });

  it('ne s’ouvrent pas sur les diagnostics qui n’ont pas la rubrique', () => {
    /* Le bloc entier est sous `{#if d.constatations}` : sans le champ, rien. */
    const i = ecran.indexOf('{#if d.constatations}');
    expect(i).toBeGreaterThan(-1);
    expect(ecran.slice(i, ecran.indexOf('Ce que le rapport constate en plus'))).not.toContain(
      '{/if}'
    );
  });
});
