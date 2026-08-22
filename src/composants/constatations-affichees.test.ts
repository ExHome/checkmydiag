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
/*
 * ⚠️ L'ÉCRAN A CHANGÉ DE PLACE, ET CES GARDE-FOUS L'ONT SUIVI.
 *
 * Les blocs vivaient dans la carte générique de `Diagnostics.svelte`. Depuis
 * qu'Aude a demandé de brancher la mini-app du pack dans l'application, c'est
 * `termites/MiniAppTermites.svelte` qui les porte — et c'est donc lui qu'il
 * faut garder. Un test qui surveille un fichier qu'on n'affiche plus ne
 * surveille rien.
 */
const source = readFileSync(
  new URL('./termites/MiniAppTermites.svelte', import.meta.url),
  'utf8'
);
/* On teste le BALISAGE, pas la documentation : les commentaires citent les
   données fictives du visuel pour expliquer leur absence. */
const ecran = source
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '');

/*
 * Les PHRASES vivent dans la synthèse, l'écran ne fait que les poser. C'est le
 * bon partage — « ce module ne dessine rien » — et les garde-fous doivent donc
 * regarder les deux : la place dans l'écran, le mot dans la synthèse.
 */
const synthese = readFileSync(new URL('./termites/synthese.ts', import.meta.url), 'utf8');

describe('les constatations diverses, à l’écran', () => {
  it('ont leur propre bloc dans la carte', () => {
    expect(ecran).toContain('Constatations diverses');
    expect(ecran).toMatch(/\{#if s\.constatations\.montrer\}/);
  });

  it('citent les mots du rapport, entiers et entre guillemets', () => {
    /* On cite, puis on explique — le terme n'est ni reformulé ni tronqué. */
    expect(ecran).toMatch(/«\s*\{c\.terme\}\s*»/);
  });

  it('portent la localisation que le rapport donne', () => {
    /* § 10 : chaque constatation reste reliée à sa localisation. */
    expect(ecran).toMatch(/\{#if c\.ou\}/);
    expect(ecran).toMatch(/\{c\.ou\}/);
  });

  it('⚠️ ne sont PAS rendues comme un chiffre', () => {
    /*
     * Le garde-fou de la faute commise. La citation porte `mot-du-rapport` ;
     * `valeur-chef` est la classe du chiffre dominant et ne doit jamais
     * l'habiller.
     */
    const i = ecran.indexOf('Constatations diverses');
    const bloc = ecran.slice(i, i + 3000);
    expect(bloc).not.toContain('valeur-chef');
    expect(bloc).not.toContain('chiffres-suite');
  });

  it('séparent les limites d’examen des constats', () => {
    /* § 14 : une zone qui n'a pas pu être regardée n'est pas une zone saine, et
       dix-sept rubriques sur quarante ne contiennent QUE ces clauses-là. */
    expect(ecran).toContain('Ce qui borne l’examen, dans les mots du rapport');
    expect(ecran).toMatch(/\{#each s\.bornages/);
  });

  it('disent « Néant » quand la rubrique répond', () => {
    const i = ecran.indexOf('Constatations diverses');
    const bloc = ecran.slice(i, i + 3000);
    expect(bloc).toMatch(/s\.constatations\.mention/);
    expect(synthese).toContain('répond « Néant »');
  });

  it('⚠️ disent « pas lue » quand l’éditeur n’est pas couvert — jamais « rien »', () => {
    /*
     * § 15 et § 24 : le silence est le NÔTRE, pas celui du diagnostiqueur. Onze
     * volets sur 250 n'ont aucun éditeur nommé, et leurs titres ressemblent à
     * ceux de LICIEL — se ressembler n'est pas être.
     */
    const i = ecran.indexOf('Constatations diverses');
    const bloc = ecran.slice(i, i + 3000);
    expect(bloc).toMatch(/s\.constatations\.mention/);
    expect(synthese).toContain('Cela ne veut pas dire qu’elle est vide');
  });

  it('ne s’ouvrent pas sur les diagnostics qui n’ont pas la rubrique', () => {
    /* Le bloc entier est sous `{#if d.constatations}` : sans le champ, rien. */
    expect(ecran).toMatch(/\{#if s\.constatations\.montrer\}/);
  });
});

/**
 * RUBRIQUE F — ce que l'opérateur n'a pas pu visiter.
 *
 * « EXAMINÉ + ABSENCE D'INDICE » n'est pas « NON EXAMINÉ » (§ 15). Et les pièces
 * non visitées sont très majoritairement les COMBLES : c'est-à-dire la
 * charpente, l'endroit même où les termites se voient.
 */
describe('les pièces non visitées, à l’écran', () => {
  it('ont leur propre bloc', () => {
    expect(ecran).toContain('Ce qui n’a pas été contrôlé');
    expect(ecran).toMatch(/s\.nonVisitees\.montrer/);
  });

  it('⚠️ annoncent la charpente AVANT la liste', () => {
    /* C'est ce qui compte le plus dans un rapport de termites : la conclusion
       ne porte pas sur ce que personne n'a regardé. */
    const i = ecran.indexOf('Ce qui n’a pas été contrôlé');
    const bloc = ecran.slice(i, i + 2600);
    const alerte = bloc.indexOf('s.charpente');
    const liste = bloc.indexOf('s.nonVisitees.entrees as l');
    expect(alerte).toBeGreaterThan(-1);
    expect(liste).toBeGreaterThan(-1);
    expect(alerte).toBeLessThan(liste);
    /* Sans dépendre de l'indentation : le texte compte, pas les espaces —
       ce test s'était cassé tout seul à l'insertion du bloc voisin. */
    expect(bloc.replace(/\s+/g, ' ')).toContain('C’est là que les termites se voient');
  });

  it('portent le motif du rapport, séparé du lieu', () => {
    const i = ecran.indexOf('Ce qui n’a pas été contrôlé');
    const bloc = ecran.slice(i, i + 2600);
    expect(bloc).toContain('l.pourquoi');
    expect(bloc).toMatch(/\{l\.quoi\}/);
    expect(bloc).toMatch(/\{#if l\.pourquoi\}/);
  });

  it('disent que le rapport ne conclut RIEN sur ces pièces', () => {
    /* § 15 : une zone inaccessible ne devient jamais une zone sans termites. */
    expect(ecran).toContain('le rapport ne conclut rien — ni présence, ni absence');
  });

  it('⚠️ « pas lue » ne devient pas « tout a été visité »', () => {
    const i = ecran.indexOf('Ce qui n’a pas été contrôlé');
    const bloc = ecran.slice(i, i + 2600);
    expect(synthese).toContain('Cela ne veut pas dire que tout a été visité');
    expect(bloc).toMatch(/s\.nonVisitees\.mention/);
  });

  it('distinguent « Néant » de « non lue »', () => {
    const i = ecran.indexOf('Ce qui n’a pas été contrôlé');
    const bloc = ecran.slice(i, i + 2600);
    expect(bloc).toMatch(/s\.nonVisitees\.mention/);
    expect(synthese).toContain('toutes les pièces ont pu être');
  });
});
