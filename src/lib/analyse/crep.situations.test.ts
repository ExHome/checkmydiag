import { describe, expect, it } from 'vitest';
import { alertesDuCrep, transmisALArs } from './plomb';

/**
 * Les deux encarts que le CREP porte, et qui ne parlent pas de plomb.
 *
 * Le constat de risque d'exposition au plomb ne se contente pas de classer des
 * revêtements : il répond à deux formulaires réglementaires — les situations de
 * risque de saturnisme infantile, et les situations de dégradation du bâti.
 *
 * Sur le rapport qui a servi de modèle, les deux seuils du saturnisme sont à
 * NON, aucune unité n'est classée 3 — et pourtant le constat coche « au moins
 * un plancher ou plafond menaçant de s'effondrer : OUI », nomme la cave, et se
 * termine par « le rapport a été envoyé à l'agence régionale de santé ».
 *
 * Un volet vert, un plafond qui menace de tomber, et un signalement aux
 * autorités sanitaires — dans le même document.
 *
 * ## Le piège de forme
 *
 * L'encart occupe la colonne de droite d'un tableau à deux colonnes, dont la
 * gauche porte le décompte des classes. La réponse termine la ligne où le
 * libellé COMMENCE ; le mot qui identifie la situation tombe, lui, sur une
 * ligne de continuation. Les deux ne sont jamais sur la même ligne.
 *
 * Les lignes ci-dessous sont recopiées telles que l'extraction les rend, dans
 * leur ordre, virgule de liste vide comprise.
 */
const ENCART = [
  'Résumé du tableau de mesures : Situations de risque de saturnisme infantile :',
  "Nombre d'unités Pourcentage Au moins une pièce du local objet du constat présente NON",
  "de diagnostic : d'unités de au moins 50% d'unités de diagnostic en classe 3",
  'diagnostic :',
  "Nombre total d'unités de diagnostic 46 100% L'ensemble des locaux objets du constat présente au NON",
  ": moins 20% d'unités de diagnostic en classe 3",
  'Unités de diagnostic en classe 0 : 32 69.6 %',
  'Unités de diagnostic en classe 1 : 0 0.0 % Situations de dégradation du bâti mis en évidence :',
  'Unités de diagnostic en classe 2 : 0 0.0 % Les locaux objets du constat présentent au moins un OUI',
  "plancher ou plafond menaçant de s'effondrer ou en",
  'Unités de diagnostic en classe 3 : 0 0.0 %',
  'partie ou tout effondré',
  'Unités de diagnostic non mesuré : 14 30.4 %',
  'Liste des pièces concernées : , Cave',
  'Les locaux objets du constat présentent des traces NON',
  'importantes de coulure, de ruissellement ou',
  "d'écoulement sur plusieurs unités de diagnostic d'une",
  'même pièce',
  'Les locaux objets du constat présentent plusieurs NON',
  "unités de diagnostic d'une même pièce recouvertes de",
  'moisissures ou de nombreuses tâches d’humidité',
  "Le rapport a été envoyé à l'agence régionale de santé.",
  'Rappel du cadre réglementaire et des objectifs du CREP :',
  "Le constat de risque d'exposition au plomb (CREP), défini à l'Article L.1334-5 du code de la santé publique, consiste à mesurer la concentration en",
  "plomb de tous les revêtements du bien concerné, afin d'identifier ceux contenant du plomb, qu'ils soient dégradés ou non, à décrire leur état de",
  'conservation et à repérer, le cas échéant, les facteurs de dégradation du bâti permettant d’identifier les situations d’insalubrité.'
];

describe('les situations cochées dans le CREP', () => {
  it('relève la seule situation répondue OUI, et nomme sa pièce', () => {
    const alertes = alertesDuCrep(ENCART);
    expect(alertes).toHaveLength(1);
    /*
     * Le TERME du rapport, entier — « on n'extrapole pas ». Le libellé de
     * l'article 8 se retrouve tel quel, jusqu'à « ou en tout ou partie
     * effondré » : un notaire doit pouvoir le chercher dans son rapport.
     */
    expect(alertes[0]?.terme).toBe(
      'Les locaux objets du constat présentent au moins un plancher ou plafond menaçant de s’effondrer ou en tout ou partie effondré'
    );
    expect(alertes[0]?.explique).toMatch(/menace de tomber/);
    expect(alertes[0]?.ou).toBe('Cave');
  });

  it('ne relève aucune des quatre situations répondues NON', () => {
    const libelles = alertesDuCrep(ENCART).map((a) => a.terme);
    expect(libelles.some((l) => /50 %/.test(l))).toBe(false);
    expect(libelles.some((l) => /20 %/.test(l))).toBe(false);
    expect(libelles.some((l) => /coulure/.test(l))).toBe(false);
    expect(libelles.some((l) => /moisissures/.test(l))).toBe(false);
  });

  it('lit « envoyé à l’agence régionale de santé », et pas seulement « transmis »', () => {
    /*
     * Le motif ne connaissait que le verbe de l'éditeur de DGLM. Un second
     * éditeur écrit « envoyé », et le signalement passait inaperçu.
     */
    expect(transmisALArs(ENCART)).toBe(true);
  });

  it('ne prend pas le rappel réglementaire pour un constat', () => {
    /*
     * ODM « chercher un endroit » : le rappel réglementaire du CREP énumère les
     * mêmes situations, dans les mêmes mots, dans TOUS les rapports — y compris
     * ceux qui n'en constatent aucune. Lu hors rubrique, il en ferait cinq
     * alertes à chaque constat.
     */
    const rappel = [
      'Le CREP recherche les situations de dégradation du bâti suivantes :',
      "au moins un plancher ou plafond menaçant de s'effondrer ou en partie ou tout effondré",
      'des traces importantes de coulure, de ruissellement ou d’écoulement',
      'des moisissures ou de nombreuses tâches d’humidité'
    ];
    expect(alertesDuCrep(rappel)).toEqual([]);
  });

  it('ne conclut pas quand la réponse ne se lit pas', () => {
    /*
     * Le libellé seul est un intitulé de formulaire : il est imprimé que la
     * réponse soit oui ou non. Sans réponse en capitales en fin de ligne, on se
     * tait — mieux vaut manquer une alerte que l'inventer.
     */
    const sansReponse = [
      'Situations de dégradation du bâti mis en évidence :',
      'Les locaux objets du constat présentent au moins un',
      "plancher ou plafond menaçant de s'effondrer ou en",
      'partie ou tout effondré'
    ];
    expect(alertesDuCrep(sansReponse)).toEqual([]);
  });

  it('n’emprunte pas la pièce d’une situation à sa voisine', () => {
    /*
     * « Liste des pièces concernées » suit la situation qu'elle concerne. Si la
     * situation suivante est cochée sans pièce, elle ne doit pas hériter de
     * celle d'au-dessus.
     */
    const deux = [
      'Situations de dégradation du bâti mis en évidence :',
      'Les locaux objets du constat présentent au moins un OUI',
      "plancher ou plafond menaçant de s'effondrer ou en",
      'partie ou tout effondré',
      'Les locaux objets du constat présentent des traces OUI',
      'importantes de coulure, de ruissellement ou',
      'Liste des pièces concernées : , Cave'
    ];
    const alertes = alertesDuCrep(deux);
    expect(alertes).toHaveLength(2);
    expect(alertes[0]?.ou).toBeUndefined();
    expect(alertes[1]?.ou).toBe('Cave');
  });
});

/**
 * La même rubrique, chez l'autre éditeur — et rien n'y ressemble.
 *
 * Ce bloc est recopié du rapport 22/IMO/0340 (lecture 40 des cinquante),
 * coupures de mots comprises. Il porte le seul « OUI » LICIEL du corpus, et il
 * met en défaut trois hypothèses que le lecteur tenait pour acquises :
 *
 *   1. « le libellé et son mot distinctif sont sur la même ligne » — ici
 *      « de classe 3 » tombe DERRIÈRE la réponse ;
 *   2. « la réponse termine sa ligne » — ici elle est seule, ou en tête ;
 *   3. « la rubrique tient sur une page » — ici un pied de page et un numéro
 *      de page coupent le bloc entre la troisième et la quatrième situation.
 *
 * Avant correction, `alertesDuCrep` ne rendait RIEN sur ce rapport : les deux
 * seuils du saturnisme n'étaient pas reconnus, et les situations de bâti ne
 * trouvaient pas leur réponse. Soit un silence complet sur 40 % du marché.
 */
const ENCART_LICIEL = [
  '6.4 Situations de risque de saturnisme infantile et de dégradation du bâti 15',
  '6.5 Transmission du constat à l’a gence régionale de santé 16',
  '6.4 Situations de risque de saturnisme infantile et de dégradation du bâti',
  "(Au sens des articles 1 et 8 du texte 40 de l'arrêté du 19 août 2011 relatif au Constat de Risque d'Exposition",
  'au Plomb)',
  'Situations de risque de saturnisme infantile',
  'Au moins un local parmi les locaux objets du constat présente au moins 50% d’unités de diagnostic',
  'OUI',
  'de classe 3',
  'NON L’ensemble des locaux objets du constat présente au moins 20% d’unités de diagnostic de classe 3',
  'Situations de dégradation de bâti',
  'Les locaux objets du constat présentent au moins un plancher ou plafond menaçant de s’effondrer',
  'NON',
  'ou en tout ou partie eff ondré',
  'SARL DGLM EXPERTISES | 76 COURS PORTAL 33000 BORDEAUX | Tél. : 06.72.70.03.38',
  '15 / 19',
  "Constat de risque d'exposition au plomb n° 22/IMO/0340",
  'Les locaux objets du constat présentent des traces importantes de coulures, de ruissellements ou',
  'NON',
  'd’écoulements d’eau sur plusieurs unités de diagnostic d’une même pièce',
  'Les locaux objets du constat présentent plusieurs unités de diagnostic d’une même pièce',
  'NON',
  'recouvertes de moisissures ou de nombreuses tâches d’humidité',
  '6.5 Transmission du constat à l’agence régionale de santé',
  'Si le constat identifie au moins l’une de ces cinq situations, son auteur transmet, dans un délai de cinq',
  'OUI jours ouvrables, une copie du rapport au directeur général de l’agence régionale de santé'
];

describe('les situations cochées, mise en page LICIEL', () => {
  it('relève le seuil des 50 %, dont le libellé est coupé par la réponse', () => {
    const alertes = alertesDuCrep(ENCART_LICIEL);
    expect(alertes).toHaveLength(1);
    expect(alertes[0]?.groupe).toBe('saturnisme');
    expect(alertes[0]?.terme).toBe(
      'Au moins un local parmi les locaux objets du constat présente au moins 50 % d’unités de diagnostic de classe 3'
    );
  });

  it('ne relève aucune des quatre situations répondues NON', () => {
    /*
     * Le piège de cette mise en page : les réponses sont des lignes à elles
     * seules, entre deux libellés. Une réponse mal appariée ferait remonter une
     * alerte sur un rapport qui n'en porte qu'une.
     */
    const termes = alertesDuCrep(ENCART_LICIEL).map((a) => a.terme);
    expect(termes.some((t) => /20 %/.test(t))).toBe(false);
    expect(termes.some((t) => /effondr/.test(t))).toBe(false);
    expect(termes.some((t) => /coulure/.test(t))).toBe(false);
    expect(termes.some((t) => /moisissures/.test(t))).toBe(false);
  });

  it('n’emprunte pas au § 6.5 la réponse de la cinquième situation', () => {
    /*
     * La rubrique suivante est elle aussi un formulaire, et elle répond OUI sur
     * ce rapport. Sans borne au titre suivant, la situation « moisissures »
     * pouvait lui prendre sa case et devenir une alerte inventée.
     */
    const alertes = alertesDuCrep(ENCART_LICIEL);
    expect(alertes.some((a) => /moisissures/.test(a.terme))).toBe(false);
  });

  it('ne s’arrête pas au sommaire, qui porte le même intitulé', () => {
    /*
     * Les deux premières lignes du bloc SONT le sommaire. Ancré dessus, le
     * lecteur bornait une zone d'une ligne et ne trouvait aucune situation.
     */
    expect(alertesDuCrep(ENCART_LICIEL)).toHaveLength(1);
  });

  it('lit la même rubrique quand les apostrophes sont espacées', () => {
    /*
     * Lecture 44 : un autre moteur de rendu écrit « d ’ unités ». Les motifs
     * cherchaient « d’unités » et ne trouvaient plus rien du tout.
     */
    const espacees = ENCART_LICIEL.map((l) => l.replace(/’/g, ' ’ '));
    expect(alertesDuCrep(espacees)).toHaveLength(1);
  });
});
