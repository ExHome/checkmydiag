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
